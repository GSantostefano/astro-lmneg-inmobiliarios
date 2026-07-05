// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import tailwindcss from '@tailwindcss/vite';

// https://astro.build/config
export default defineConfig({
  site: 'https://lmneginmobiliarios.com.ar',
  integrations: [sitemap()],
  image: {
    remotePatterns: [],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
