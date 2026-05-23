/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Podés ajustar este código HEX por el azul exacto del logo de Liendo Bissutti
        brand: {
          DEFAULT: '#2563eb', // Equivalente al blue-600 que usamos en el botón
          dark: '#1e40af',    // Equivalente a blue-800 para los hovers
          light: '#60a5fa',   // Equivalente a blue-400
        }
      }
    },
  },
  plugins: [],
}