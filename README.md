# El Perro Verde — web

Landing de una sola página para la clínica veterinaria El Perro Verde
(Magallón, Zaragoza). Astro estático, sin backend. Única funcionalidad:
botones que abren WhatsApp.

## Puesta en marcha

```bash
npm install
npm run dev        # http://localhost:4321
```

> En este equipo Node no está en el PATH. En PowerShell, antes de npm:
> `$env:Path = "C:\Program Files\nodejs;" + $env:Path`

## Comandos

| Comando | Qué hace |
|---|---|
| `npm run dev` | Servidor de desarrollo con recarga en caliente |
| `npm run build` | Genera `dist/` (lo que se sube al hosting) |
| `npm run preview` | Previsualiza el build de `dist/` |
| `node scripts/procesar-logo.mjs` | Regenera logos, favicon, iconos y `og.png` desde `assets/logo-marca-original.jpeg` |

## Estructura

- `src/data/clinica.js` — **datos de contacto centralizados** (edita aquí).
- `src/layouts/Base.astro` — `<head>`, SEO, Open Graph/Twitter, JSON-LD.
- `src/components/` — una sección por componente.
- `src/styles/global.css` — tokens de marca (`:root`) y estilos base.
- `src/scripts/animaciones.js` — GSAP + ScrollTrigger + contadores.
- `public/` — logos, iconos, `robots.txt`.

## Pendiente del cliente

- **Contacto:** en `src/data/clinica.js`, `telefono`, `whatsapp` y `horario`
  están como "Por confirmar". Cuando llegue el número de WhatsApp, poner
  `whatsapp: '34XXXXXXXXX'` (formato internacional, sin `+` ni espacios).
- **Fotos de la galería:** las del carrusel son placeholders. Sustituir los
  archivos de `src/assets/galeria/` por las fotos reales (jpg/png/webp) y editar
  los pies de foto en el array `pies` de `src/components/Galeria.astro`.

## Despliegue

Demo en GitHub Pages con GitHub Actions. Ver `DEPLOY.md`.
