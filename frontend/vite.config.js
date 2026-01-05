import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite'
import path from 'path';

export default defineConfig({
  plugins: [react(),tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, 'src'), // <-- maps @ to src/
    },
  },
    server: {
    port: 3002, // change this from 5173 to 3007 or whatever port you want
    host: true, // optional: to allow access from other devices
  },
});
