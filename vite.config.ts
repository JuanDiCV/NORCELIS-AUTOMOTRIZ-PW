import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig } from 'vite';

/**
 * El script en línea de index.html solo silencia errores de WebSocket del servidor de desarrollo.
 * Se elimina del build de producción: así la política de seguridad puede prohibir scripts en línea.
 */
const stripDevInlineScript = () => ({
  name: 'strip-dev-inline-script',
  apply: 'build' as const,
  transformIndexHtml: (html: string) => html.replace(/<script>[\s\S]*?<\/script>/, ''),
});

export default defineConfig(() => {
  return {
    // Raíz por defecto. Solo para GitHub Pages u otro subdirectorio: VITE_BASE_PATH="/mi-ruta/"
    base: process.env.VITE_BASE_PATH || '/',
    plugins: [react(), tailwindcss(), stripDevInlineScript()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      // Do not modify—file watching is disabled to prevent flickering during agent edits.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
    // ── Configuración de Vitest ─────────────────────────────────────────────
    test: {
      globals: true,
      environment: 'jsdom',
      setupFiles: ['./src/__tests__/setup.ts'],
      coverage: {
        provider: 'v8',
        reporter: ['text', 'json', 'html'],
        include: ['src/**/*.{ts,tsx}'],
        exclude: [
          'src/__tests__/**',
          'src/data/**',
          'src/main.tsx',
          'src/types/**',
        ],
      },
    },
  };
});
