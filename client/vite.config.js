import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import dotenv from 'vite-plugin-dotenv';

export default defineConfig({
  plugins: [react(), dotenv()],
  // If using custom prefixes for env variables
  envPrefix: 'VITE_',
});