-- BudFin — Migration inicial
-- Rodar no Supabase Dashboard → SQL Editor

create extension if not exists "pgcrypto";

-- ── Trigger genérico de updated_at ──────────────────────────────────────────
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin new.updated_at = now(); return new; end $$;

-- ── HOUSEHOLDS ───────────────────────────────────────────────────────────────
create table public.households (
  id          uuid primary key default gen_random_uuid(),
  name        text not null,
  created_at  timestamptz not null default now()
);

create table public.household_members (
  household_id  uuid not null references public.households(id) on delete cascade,
  user_id       uuid not null references auth.users(id) on delete cascade,
  role          text not null default 'owner' check (role in ('owner','member')),
  joined_at     timestamptz not null default now(),
  primary key (household_id, user_id)
);

alter table public.households enable row level security;
alter table public.household_members enable row level security;

-- Helper: IDs dos households do usuário logado
create or replace function public.current_household_ids()
returns setof uuid language sql security definer stable as $$
  select household_id from public.household_members where user_id = auth.uid()
$$;

create policy hh_select on public.households for select
  using (id in (select public.current_household_ids()));
create policy hhm_select on public.household_members for select
  using (user_id = auth.uid()
      or household_id in (select public.current_household_ids()));

-- ── HOUSEHOLD INVITATIONS ────────────────────────────────────────────────────
create table public.household_invitations (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  token_hash    text not null unique,
  invited_by    uuid not null references auth.users(id),
  role          text not null default 'member' check (role in ('owner','member')),
  expires_at    timestamptz not null,
  consumed_at   timestamptz,
  consumed_by   uuid references auth.users(id),
  created_at    timestamptz not null default now()
);
create index hh_inv_idx on public.household_invitations (household_id) where consumed_at is null;
alter table public.household_invitations enable row level security;

create policy hhinv_select on public.household_invitations for select
  using (household_id in (select public.current_household_ids()));
create policy hhinv_insert on public.household_invitations for insert
  with check (household_id in (select public.current_household_ids())
          and invited_by = auth.uid());

-- RPC para consumir convite com segurança
create or replace function public.consume_invite(p_token text, p_user_id uuid)
returns jsonb language plpgsql security definer as $$
declare
  v_invite public.household_invitations;
begin
  select * into v_invite
  from public.household_invitations
  where token_hash = encode(digest(p_token, 'sha256'), 'hex')
    and consumed_at is null
    and expires_at > now();

  if not found then
    return jsonb_build_object('success', false, 'error', 'invite_invalid');
  end if;

  -- Adiciona membro
  insert into public.household_members (household_id, user_id, role)
  values (v_invite.household_id, p_user_id, v_invite.role)
  on conflict (household_id, user_id) do nothing;

  -- Marca consumido
  update public.household_invitations
  set consumed_at = now(), consumed_by = p_user_id
  where id = v_invite.id;

  return jsonb_build_object('success', true, 'error', null);
end $$;

-- ── DEBTS ────────────────────────────────────────────────────────────────────
create table public.debts (
  id                uuid primary key default gen_random_uuid(),
  household_id      uuid not null references public.households(id) on delete cascade,
  created_by        uuid not null references auth.users(id),
  title             text not null check (char_length(title) between 1 and 120),
  direction         text not null check (direction in ('payable','receivable')),
  currency          char(3) not null default 'BRL',
  due_date          date not null,
  notes             text check (notes is null or char_length(notes) <= 2000),
  recurrence_rule   text not null check (recurrence_rule in ('none','monthly','weekly','yearly')) default 'none',
  parent_debt_id    uuid references public.debts(id) on delete set null,
  created_at        timestamptz not null default now(),
  updated_at        timestamptz not null default now()
);

create index debts_hh_due_idx on public.debts (household_id, due_date);

create trigger debts_updated_at
  before update on public.debts
  for each row execute function public.set_updated_at();

alter table public.debts enable row level security;

create policy debts_select on public.debts for select
  using (household_id in (select public.current_household_ids()));
create policy debts_insert on public.debts for insert
  with check (household_id in (select public.current_household_ids())
          and created_by = auth.uid());
create policy debts_update on public.debts for update
  using  (household_id in (select public.current_household_ids()))
  with check (household_id in (select public.current_household_ids()));
create policy debts_delete on public.debts for delete
  using (household_id in (select public.current_household_ids()));

-- ── DEBT_ITEMS ───────────────────────────────────────────────────────────────
create table public.debt_items (
  id            uuid primary key default gen_random_uuid(),
  debt_id       uuid not null references public.debts(id) on delete cascade,
  household_id  uuid not null references public.households(id) on delete cascade,
  label         text not null check (char_length(label) between 1 and 80),
  amount_cents  bigint not null check (amount_cents > 0 and amount_cents <= 100000000),
  paid          boolean not null default false,
  paid_at       timestamptz,
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create index debt_items_debt_idx on public.debt_items (debt_id);
create index debt_items_hh_idx   on public.debt_items (household_id) where paid = false;

create trigger debt_items_updated_at
  before update on public.debt_items
  for each row execute function public.set_updated_at();

-- Trigger: mantém paid_at em sincronia com paid
create or replace function public.sync_paid_at() returns trigger language plpgsql as $$
begin
  if new.paid and (old is null or not old.paid) then
    new.paid_at = now();
  elsif not new.paid then
    new.paid_at = null;
  end if;
  return new;
end $$;

create trigger debt_items_paid_at
  before insert or update on public.debt_items
  for each row execute function public.sync_paid_at();

alter table public.debt_items enable row level security;

create policy di_select on public.debt_items for select
  using (household_id in (select public.current_household_ids()));
create policy di_insert on public.debt_items for insert
  with check (household_id in (select public.current_household_ids()));
create policy di_update on public.debt_items for update
  using  (household_id in (select public.current_household_ids()))
  with check (household_id in (select public.current_household_ids()));
create policy di_delete on public.debt_items for delete
  using (household_id in (select public.current_household_ids()));

-- ── VIEW: debts_with_totals ──────────────────────────────────────────────────
create view public.debts_with_totals with (security_invoker = true) as
  select
    d.*,
    coalesce(sum(di.amount_cents), 0)                               as total_cents,
    coalesce(sum(di.amount_cents) filter (where di.paid), 0)        as paid_cents,
    count(di.id)                                                    as items_count,
    count(di.id) filter (where di.paid)                             as items_paid_count,
    case
      when count(di.id) = 0             then 'empty'
      when count(di.id) filter (where not di.paid) = 0 then 'paid'
      when d.due_date < current_date    then 'overdue'
      else 'pending'
    end as status
  from public.debts d
  left join public.debt_items di on di.debt_id = d.id
  group by d.id;

-- ── DEBT_REMINDERS ───────────────────────────────────────────────────────────
create table public.debt_reminders (
  id            uuid primary key default gen_random_uuid(),
  debt_id       uuid not null references public.debts(id) on delete cascade,
  household_id  uuid not null references public.households(id) on delete cascade,
  remind_on     date not null,
  kind          text not null default 'preset' check (kind in ('preset','custom')),
  days_before   int,
  created_at    timestamptz not null default now(),
  unique (debt_id, remind_on)
);

create index debt_reminders_date_idx on public.debt_reminders (remind_on);
alter table public.debt_reminders enable row level security;

create policy dr_select on public.debt_reminders for select
  using (household_id in (select public.current_household_ids()));
create policy dr_insert on public.debt_reminders for insert
  with check (household_id in (select public.current_household_ids()));
create policy dr_delete on public.debt_reminders for delete
  using (household_id in (select public.current_household_ids()));

-- ── PUSH_SUBSCRIPTIONS ───────────────────────────────────────────────────────
create table public.push_subscriptions (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  endpoint    text not null,
  p256dh      text not null,
  auth        text not null,
  user_agent  text,
  created_at  timestamptz not null default now(),
  unique (user_id, endpoint)
);
create index push_subs_user_idx on public.push_subscriptions (user_id);
alter table public.push_subscriptions enable row level security;

create policy push_select on public.push_subscriptions for select using (user_id = auth.uid());
create policy push_insert on public.push_subscriptions for insert with check (user_id = auth.uid());
create policy push_delete on public.push_subscriptions for delete using (user_id = auth.uid());

-- ── NOTIFICATION_LOG ─────────────────────────────────────────────────────────
create table public.notification_log (
  id            uuid primary key default gen_random_uuid(),
  household_id  uuid not null references public.households(id) on delete cascade,
  debt_id       uuid not null references public.debts(id) on delete cascade,
  days_before   int not null,
  sent_at       timestamptz not null default now(),
  unique (debt_id, days_before)
);
create index notif_log_hh_idx on public.notification_log (household_id, sent_at desc);
alter table public.notification_log enable row level security;

create policy notif_log_select on public.notification_log for select
  using (household_id in (select public.current_household_ids()));

-- ── USER_PREFERENCES ─────────────────────────────────────────────────────────
create table public.user_preferences (
  user_id              uuid primary key references auth.users(id) on delete cascade,
  theme                text not null default 'system' check (theme in ('light','dark','system')),
  density              text not null default 'comfy'  check (density in ('comfy','compact')),
  push_enabled         boolean not null default true,
  weekly_digest        boolean not null default false,
  digest_hour_local    int not null default 8 check (digest_hour_local between 0 and 23),
  default_reminders    int[] not null default array[7,3,1,0],
  updated_at           timestamptz not null default now()
);

create trigger user_prefs_updated_at
  before update on public.user_preferences
  for each row execute function public.set_updated_at();

alter table public.user_preferences enable row level security;

create policy up_select on public.user_preferences for select using (user_id = auth.uid());
create policy up_insert on public.user_preferences for insert with check (user_id = auth.uid());
create policy up_update on public.user_preferences for update
  using (user_id = auth.uid()) with check (user_id = auth.uid());
