import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    container: { center: true, padding: "1rem", screens: { "2xl": "1440px" } },
    extend: {
      colors: {
        void: "rgb(var(--void) / <alpha-value>)",
        ink: {
          DEFAULT: "rgb(var(--ink-0) / <alpha-value>)",
          1: "rgb(var(--ink-1) / <alpha-value>)",
          2: "rgb(var(--ink-2) / <alpha-value>)",
          3: "rgb(var(--ink-3) / <alpha-value>)",
        },
        line: {
          DEFAULT: "rgb(var(--line) / <alpha-value>)",
          strong: "rgb(var(--line-strong) / <alpha-value>)",
        },
        fg: {
          DEFAULT: "rgb(var(--fg) / <alpha-value>)",
          muted: "rgb(var(--fg-muted) / <alpha-value>)",
          dim: "rgb(var(--fg-dim) / <alpha-value>)",
        },
        signal: "rgb(var(--signal) / <alpha-value>)",
        cyan: { DEFAULT: "rgb(var(--cyan) / <alpha-value>)" },
        azure: "rgb(var(--azure) / <alpha-value>)",
        amber: "rgb(var(--amber) / <alpha-value>)",
        alert: "rgb(var(--alert) / <alpha-value>)",
      },
      fontFamily: {
        sans: ["var(--font-sans)", "ui-sans-serif", "system-ui", "sans-serif"],
        display: ["var(--font-display)", "ui-serif", "Georgia", "serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      fontSize: {
        "2xs": ["0.625rem", { lineHeight: "0.875rem", letterSpacing: "0.08em" }],
      },
      borderRadius: { xs: "2px", sm: "3px", DEFAULT: "4px", md: "6px" },
      transitionTimingFunction: {
        expo: "cubic-bezier(0.16, 1, 0.3, 1)",
      },
      keyframes: {
        blink: { "0%,100%": { opacity: "1" }, "50%": { opacity: "0.25" } },
        "scan-y": { "0%": { transform: "translateY(-10%)" }, "100%": { transform: "translateY(110%)" } },
        ticker: { "0%": { transform: "translateX(0)" }, "100%": { transform: "translateX(-50%)" } },
        "pulse-ring": {
          "0%": { transform: "scale(0.6)", opacity: "0.8" },
          "100%": { transform: "scale(2.2)", opacity: "0" },
        },
        shimmer: { "100%": { transform: "translateX(100%)" } },
        "grid-drift": { "0%": { backgroundPosition: "0 0" }, "100%": { backgroundPosition: "48px 48px" } },
      },
      animation: {
        blink: "blink 1.6s ease-in-out infinite",
        "scan-y": "scan-y 4.5s cubic-bezier(0.45,0,0.55,1) infinite",
        ticker: "ticker 40s linear infinite",
        "pulse-ring": "pulse-ring 2.4s cubic-bezier(0.16,1,0.3,1) infinite",
        "grid-drift": "grid-drift 12s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
