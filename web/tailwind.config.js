/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        imarah: {
          deep: "#06352c",
          primary: "#0d5c4a",
          primaryhover: "#0a4a3b",
          light: "#ecf6f3",
          panel: "#f7faf9",
          gold: "#b8922e",
          goldlight: "#e8d9a8",
          ink: "#0f1f1c",
          muted: "#4a635c",
          border: "#c5ddd4",
        },
      },
      fontFamily: {
        sans: ['"Source Sans 3"', "system-ui", "sans-serif"],
        display: ['"Cormorant Garamond"', "Georgia", "serif"],
      },
      backgroundImage: {
        "pattern-islamic":
          "url(\"data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cpath d='M30 0l4.5 15.5L60 30l-15.5 4.5L30 60l-4.5-15.5L0 30l15.5-4.5z' stroke='%230d5c4a' stroke-opacity='.08' stroke-width='1'/%3E%3C/g%3E%3C/svg%3E\")",
      },
    },
  },
  plugins: [],
};
