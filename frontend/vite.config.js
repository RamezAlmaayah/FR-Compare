import { defineConfig, loadEnv } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({ command, mode }) => {
  const env = { ...loadEnv(mode, process.cwd(), ''), ...process.env };
  if (command === 'build') {
    let api;
    try { api = new URL(env.VITE_SERVER); }
    catch { throw new Error('Set VITE_SERVER to the public HTTPS backend URL ending in /api before building.'); }
    if (api.protocol !== 'https:' || /^(localhost|127\.|\[::1\])/.test(api.hostname) ||
        api.username || api.password || api.search || api.hash || !api.pathname.endsWith('/api')) {
      throw new Error('VITE_SERVER must be a public HTTPS URL ending in /api, without credentials or query parameters.');
    }
  }
  return { plugins: [react()] };
});
