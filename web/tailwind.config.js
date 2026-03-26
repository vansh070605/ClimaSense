/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0EA5E9", // Sky Blue
        secondary: "#F43F5E", // Rose (Risk)
        accent: "#10B981", // Emerald (Safety)
        background: "#F8FAFC", // Slate 50 (Airy Light)
        surface: "#FFFFFF", // White
        muted: "#64748B", // Slate 500
        card: "rgba(255, 255, 255, 0.7)",
      },
      fontFamily: {
        sans: ['Inter', 'sans-serif'],
        display: ['Outfit', 'sans-serif'],
      },
      backdropBlur: {
        xs: '2px',
      },
      animation: {
        'spin-slow': 'spin 8s linear infinite',
      }
    },
  },
  plugins: [],
}
