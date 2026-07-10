import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        teal: {
          deep: "#082F2F",
          mid: "#0F5E5E",
        },
        cream: "#F2ECE0",
        ink: "#1a1816",
        muted: "#8f8a85",
        orange: "#FF6B35",
        lime: "#D4E157",
      },
      fontFamily: {
        serif: ['"Noto Serif JP"', "serif"],
        sans: ["Inter", "-apple-system", "sans-serif"],
      },
      borderRadius: {
        "4xl": "2rem",
        "5xl": "2.5rem",
      },
    },
  },
  plugins: [],
};

export default config;
