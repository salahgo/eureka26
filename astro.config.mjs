// @ts-check
import { defineConfig } from 'astro/config';
import react from '@astrojs/react';
import tailwindcss from '@tailwindcss/vite';

// GitHub Pages project site: https://<owner>.github.io/<repo>/
// SITE_URL / BASE_PATH can be overridden at build time (e.g. custom domain).
const site = process.env.SITE_URL ?? 'https://salahgo.github.io';
const base = process.env.BASE_PATH ?? '/eureka26';

export default defineConfig({
  site,
  base,
  trailingSlash: 'ignore',
  output: 'static',
  build: { format: 'directory' },
  integrations: [react()],
  devToolbar: { enabled: false },
  vite: {
    plugins: [tailwindcss()],
  },
});
