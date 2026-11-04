import type { Config } from "tailwindcss";

const c = (name: string) => `rgb(var(--c-${name}) / <alpha-value>)`;

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: c("bg"), surface: c("surface"), ink: c("ink"), muted: c("muted"),
        saffron: c("saffron"), crimson: c("crimson"), gold: c("gold"), line: c("line"),
      },
      fontFamily: {
        display: ["var(--font-display)", "Cormorant Garamond", "Georgia", "serif"],
        body: ["var(--font-body)", "Lora", "Georgia", "serif"],
        deva: ["Noto Serif Devanagari", "Sanskrit Text", "Mangal", "Nirmala UI", "serif"],
      },
    },
  },
  plugins: [],
};
export default config;
