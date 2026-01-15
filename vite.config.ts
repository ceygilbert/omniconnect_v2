
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  define: {
    // Polyfill for process.env as required by the Gemini SDK guidelines
    'process.env': process.env
  }
});
