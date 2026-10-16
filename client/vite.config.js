import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// In development the React app runs on 5174 and forwards /api to the Express server on 3000.
export default defineConfig({
  plugins: [react()],
  server: { port: 5174, proxy: { '/api': 'http://localhost:3000' } },
});
