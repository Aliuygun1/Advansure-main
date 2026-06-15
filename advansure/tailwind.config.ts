import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["selector", '[data-theme="dark"]'],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Advansure design tokens — mapped to CSS variables
        screen: "var(--screen)",
        surface: "var(--surface)",
        "surface-2": "var(--surface-2)",
        "surface-3": "var(--surface-3)",
        adv: {
          text: "var(--text)",
          muted: "var(--text-muted)",
          faint: "var(--text-faint)",
          accent: "var(--accent)",
          "accent-2": "var(--accent-2)",
          "accent-deep": "var(--accent-deep)",
          "accent-ink": "var(--accent-ink)",
          "accent-soft": "var(--accent-soft)",
          "accent-glow": "var(--accent-glow)",
          danger: "var(--danger)",
          "grade-leicht": "var(--grade-leicht)",
          "grade-mittel": "var(--grade-mittel)",
          "grade-schwer": "var(--grade-schwer)",
          "grade-total": "var(--grade-total)",
        },
        // shadcn compat
        background: "var(--background)",
        foreground: "var(--foreground)",
        border: "var(--border-shadcn)",
        input: "var(--input)",
        ring: "var(--ring)",
        primary: {
          DEFAULT: "var(--primary)",
          foreground: "var(--primary-foreground)",
        },
        secondary: {
          DEFAULT: "var(--secondary)",
          foreground: "var(--secondary-foreground)",
        },
        destructive: {
          DEFAULT: "var(--destructive)",
        },
        muted: {
          DEFAULT: "var(--muted)",
          foreground: "var(--muted-foreground)",
        },
        card: {
          DEFAULT: "var(--card)",
          foreground: "var(--card-foreground)",
        },
        popover: {
          DEFAULT: "var(--popover)",
          foreground: "var(--popover-foreground)",
        },
      },
      borderRadius: {
        sm: "12px",
        md: "18px",
        lg: "26px",
        xl: "34px",
        DEFAULT: "18px",
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "-apple-system", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "ui-monospace", "monospace"],
      },
      boxShadow: {
        card: "var(--shadow-card)",
        pop: "var(--shadow-pop)",
        "accent-glow": "0 8px 24px -8px var(--accent-glow), inset 0 1px 0 rgba(255,255,255,0.25)",
      },
      maxWidth: {
        mobile: "430px",
      },
    },
  },
  plugins: [],
};

export default config;
