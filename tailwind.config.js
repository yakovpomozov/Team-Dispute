/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          50:  '#f0f4ff',
          100: '#e0e9ff',
          200: '#c7d6ff',
          300: '#a4b8ff',
          400: '#7a91ff',
          500: '#5c6ef5',
          600: '#4a55e8',
          700: '#3b42d1',
          800: '#3037aa',
          900: '#2d3487',
        },
      },
    },
  },
  plugins: [],
}
