# budFin

Controle de dívidas pessoais — contas a pagar e a receber, com divisão de cobranças entre pessoas e lembretes push antes do vencimento.

**→ [budfin-app.vercel.app](https://budfin-app.vercel.app)**

---

## Stack

| Camada | Tecnologia |
|---|---|
| Frontend | Next.js 15 (App Router) + TypeScript + Tailwind CSS |
| Backend | Supabase (Postgres + Auth + RLS) |
| Push | Web Push API + VAPID |
| PWA | Serwist |
| Deploy | Vercel |

---

## Funcionalidades

- **Contas a pagar e a receber** — com badge de direção em cada dívida
- **Rateio de cobranças** — divida o valor entre pessoas, acompanhe quem pagou
- **Lembretes customizáveis** — escolha exatamente quando ser notificado (7d, 3d, 1d, no dia ou data específica)
- **Notificações push** — PWA instalável em Android e iOS
- **Multi-usuário** — compartilhe com cônjuge/família via convite por link
- **Dashboard** — resumo de a pagar / a receber + calendário de 14 dias
- **Tema claro/escuro**
- **Multi-idiomas** — Português e Inglês

---
