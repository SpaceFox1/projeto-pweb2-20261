import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5175,
    cors: true,
  },
  build: {
    lib: {
      entry: 'src/main.ts',
      name: 'FinancasConversor',
      fileName: 'financas-conversor',
      formats: ['iife'],
    },
    rollupOptions: {
      external: [],
    },
  },
  define: {
    'process.env.NODE_ENV': JSON.stringify('production'),
  },
});
