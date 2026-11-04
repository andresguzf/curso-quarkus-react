import { fileURLToPath, URL } from 'node:url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import { defineConfig, loadEnv } from 'vite'

// https://vite.dev/config/
export default defineConfig(({ mode }) => {
  // API_PROXY_TARGET (sin prefijo VITE_: solo lo lee Vite, no llega al navegador).
  // Por defecto la API local; con la URL de Render se prueba el backend desplegado.
  const env = loadEnv(mode, process.cwd(), '')
  const apiTarget = env.API_PROXY_TARGET || 'http://localhost:8080'

  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
      },
    },
    server: {
      // Mismo origen que la API: la cookie de sesión (SameSite=Strict) viaja sin configurar CORS
      proxy: {
        // changeOrigin: el Host llega como el del backend (Render lo exige para enrutar)
        '/api': { target: apiTarget, changeOrigin: true },
      },
    },
  }
})
