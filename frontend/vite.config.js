import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Permite conexiones desde cualquier IP (útil para desarrollo en red local)
    port: 5173, // Cambia el puerto si el 3000 ya está en uso
    
  },
})
