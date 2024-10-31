/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: 'rgb(var(--primary) / <alpha-value>)',
        secondary: 'rgb(var(--secondary) / <alpha-value>)',
        // Añade otros colores personalizados aquí
      },
    },
  },
  plugins: [],
  darkMode: 'class', // Esto permite el cambio de tema usando la clase 'dark'
}