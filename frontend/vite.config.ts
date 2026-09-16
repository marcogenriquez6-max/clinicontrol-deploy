import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    chunkSizeWarningLimit: 2000,
  },
  server: {
    proxy: {
      '^/(auth|pacientes|medicos|especialidades|turnos|citas|helpers|consultas|recetas|notificaciones|roles|sucursales|generos|grupos-sanguineos|estados-cita|usuarios|camas|hospitalizacion|hospitalizaciones|triage|triajes|reports|interacciones|diagnosticos|alergias|vacunas|audit|reportes|impresion|agenda|health|adjuntos|tipos-atencion|cuentas|clientes|planes|logs|pagos|configuracion|respaldos|servicios|disponibilidad)': {
        target: 'http://localhost:3100',
        changeOrigin: true,
        // Las rutas del SPA (/pacientes, /pagos, ...) coinciden con las de la API:
        // una navegación del navegador (Accept: text/html) debe servir la app,
        // no el JSON del backend. Solo se proxean las llamadas de datos.
        bypass: (req) => (req.headers.accept?.includes('text/html') ? '/index.html' : undefined),
      },
    },
  },
})
