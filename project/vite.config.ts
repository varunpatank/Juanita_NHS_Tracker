import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  server: {
    // Handle client-side routing in dev mode
    historyApiFallback: true,
    // Proxy the Hack Club chat endpoint in dev to avoid CORS and 404 for local API functions
    proxy: {
      // forward local /api/hackclub/proxy/v1/chat -> https://ai.hackclub.com/proxy/v1/chat/completions
      '/api/hackclub/proxy/v1/chat': {
        target: 'https://ai.hackclub.com',
        changeOrigin: true,
        secure: true,
        // Include Authorization header in dev so the upstream Hack Club proxy accepts requests
        headers: {
          Authorization: `Bearer ${process.env.VITE_HACKCLUB_API_KEY || ''}`
        },
        rewrite: (path) => path.replace('/api/hackclub/proxy/v1/chat', '/proxy/v1/chat/completions')
      }
    }
  },
  preview: {
    // Handle client-side routing in preview mode
    historyApiFallback: true,
  },
});
