/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: "class",
  content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      boxShadow: {
        paper: "0 24px 50px rgba(24, 33, 37, 0.18)",
      },
      keyframes: {
        shimmer: {
          "0%": { backgroundPosition: "200% 0" },
          "100%": { backgroundPosition: "-200% 0" },
        },
        shakeSoft: {
          "0%, 100%": { transform: "translateX(0)" },
          "25%": { transform: "translateX(-2px)" },
          "75%": { transform: "translateX(2px)" },
        },
      },
      animation: {
        shimmer: "shimmer 2.2s linear infinite",
        "shake-soft": "shakeSoft 260ms ease-in-out 2",
      },
    },
  },
  plugins: [],
};