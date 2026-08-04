import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5174,
    cors: true,
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'FinancasExportador',
      fileName: 'financas-exportador',
      formats: ['iife'],
    },
    rollupOptions: {
      // Bundle React into the widget so it's truly standalone
      external: [],
    },
  },
  define: {
    // Required for React to work in IIFE build
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
