
/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: "class",
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "#137fec",
          hover: "#0b5ab8",
        },
        background: {
          light: "#f6f7f8",
          dark: "#101922",
        },
      },
      fontFamily: {
        sans: ["Inter", "sans-serif"],
        khmer: ["Kantumruy Pro", "Noto Sans Khmer", "Inter", "sans-serif"],
      },
    },
  },
  plugins: [],
}
