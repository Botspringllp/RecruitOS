import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    host: false,
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true,
        secure: false,
        configure: (proxy, _options) => {
          proxy.on('error', (err, req, res) => {
            console.log(`[RecruitOS Server Log] Proxy call to ${req.url} -> Backend on port 5000 is offline. Switching to client-side engine.`);
            if (res && !res.headersSent) {
              res.writeHead(503, { 'Content-Type': 'application/json' });
              res.end(JSON.stringify({ success: false, offline: true }));
            }
          });
        },
      },
    },
  },
});
