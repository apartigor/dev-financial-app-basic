import type { Config } from "tailwindcss"
// eslint-disable-next-line @typescript-eslint/no-require-imports
const tailwindAnimate = require("tailwindcss-animate")

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        bg:             "var(--color-bg)",
        surface:        "var(--color-surface)",
        "surface-alt":  "var(--color-surface-alt)",
        ink:            "var(--color-ink)",
        "ink-muted":    "var(--color-ink-muted)",
        "ink-faint":    "var(--color-ink-faint)",
        hairline:       "var(--color-hairline)",
        "hairline-strong": "var(--color-hairline-strong)",
        accent:         "var(--color-accent)",
        "accent-soft":  "var(--color-accent-soft)",
        warn:           "var(--color-warn)",
        "warn-soft":    "var(--color-warn-soft)",
        paid:           "var(--color-paid)",
        "paid-soft":    "var(--color-paid-soft)",
      },
      fontFamily: {
        sans:  ["var(--font-inter)",            "system-ui", "sans-serif"],
        serif: ["var(--font-instrument-serif)", "Georgia", "serif"],
      },
      borderRadius: {
        sm:   "10px",
        md:   "14px",
        lg:   "18px",
        pill: "999px",
      },
      fontSize: {
        "2xs": ["11px", { lineHeight: "16px" }],
        xs:    ["12px", { lineHeight: "18px" }],
        sm:    ["13px", { lineHeight: "20px" }],
        base:  ["15px", { lineHeight: "22px" }],
        md:    ["16px", { lineHeight: "24px" }],
        lg:    ["18px", { lineHeight: "26px" }],
        xl:    ["24px", { lineHeight: "30px" }],
        "2xl": ["32px", { lineHeight: "38px" }],
        hero:  ["42px", { lineHeight: "48px", letterSpacing: "-0.6px" }],
      },
    },
  },
  plugins: [tailwindAnimate],
} satisfies Config
