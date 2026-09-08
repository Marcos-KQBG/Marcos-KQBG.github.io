import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// https://astro.build/config
export default defineConfig({
  // Demo en GitHub Pages (sitio de usuario -> se sirve en la raíz, sin `base`).
  // Para el dominio real, volver a 'https://perroverde.es'.
  site: 'https://marcos-kqbg.github.io',
  output: 'static',
  trailingSlash: 'ignore',
  // Escuchar en IPv4: en Windows el navegador resuelve "localhost" a 127.0.0.1
  // y Vite por defecto solo abre el puerto en ::1 (IPv6).
  server: { host: '127.0.0.1', port: 4321 },
  integrations: [sitemap()],
  build: {
    inlineStylesheets: 'auto',
  },
});
