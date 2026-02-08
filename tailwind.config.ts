import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-geist-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
        display: ["var(--font-display)", "system-ui", "sans-serif"],
      },
      colors: {
        brand: {
          DEFAULT: "#fb2056",
          dark: "#d10044",
          muted: "#7A7A7A",
        },
        surface: {
          DEFAULT: "#0a0a0a",
          light: "#141414",
          card: "#1a1a1a",
        },
      },
      spacing: {
        "18": "4.5rem",
        "22": "5.5rem",
        "30": "7.5rem",
      },
      transitionDuration: {
        "250": "250ms",
      },
    },
  },
  plugins: [],
};

export default config;
