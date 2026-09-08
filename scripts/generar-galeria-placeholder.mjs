// Genera imágenes PLACEHOLDER para el carrusel de la galería.
//
//   node scripts/generar-galeria-placeholder.mjs
//
// Son ilustraciones de marca (silueta blanca sobre teal), NO fotos reales.
// Cuando el cliente entregue las fotos de las mascotas, se sustituyen los
// archivos de src/assets/galeria/ (mismos nombres o se ajusta el glob) y se
// borra este script.

import sharp from 'sharp';
import { mkdir, rm } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const OUT = path.join(ROOT, 'src', 'assets', 'galeria');

await rm(OUT, { recursive: true, force: true });
await mkdir(OUT, { recursive: true });

const W = 1200;
const H = 900;

// Siluetas simples (viewBox 0 0 120 90), en blanco.
const PERRO = `
  <g fill="#ffffff" opacity="0.92">
    <ellipse cx="52" cy="60" rx="26" ry="22"/>
    <path d="M28 44c-8-4-14 1-12 9 2 7 9 9 16 6z"/>
    <path d="M76 44c8-4 14 1 12 9-2 7-9 9-16 6z"/>
    <circle cx="52" cy="34" r="20"/>
    <path d="M40 20c-3-6-9-8-12-4 4 2 7 6 8 10z"/>
    <path d="M64 20c3-6 9-8 12-4-4 2-7 6-8 10z"/>
    <path d="M74 66c9-2 15 4 12 12-3 7-11 6-15 0z"/>
  </g>`;
const GATO = `
  <g fill="#ffffff" opacity="0.92">
    <path d="M34 26l-6-16 15 8z"/>
    <path d="M70 26l6-16-15 8z"/>
    <circle cx="52" cy="34" r="19"/>
    <ellipse cx="52" cy="64" rx="22" ry="20"/>
    <path d="M70 60c10-3 16 3 13 12-3 8-12 7-16 1z"/>
  </g>`;
const HUELLA = `
  <g fill="#ffffff" opacity="0.9">
    <ellipse cx="52" cy="56" rx="16" ry="13"/>
    <circle cx="34" cy="38" r="7"/>
    <circle cx="70" cy="38" r="7"/>
    <circle cx="42" cy="24" r="6.5"/>
    <circle cx="62" cy="24" r="6.5"/>
  </g>`;

const siluetas = [PERRO, GATO, HUELLA, PERRO, GATO, HUELLA];
// Pares de teal para el degradado (marca #08a89b / #067a70 y variantes).
const paresTeal = [
  ['#12b3a5', '#067a70'],
  ['#08a89b', '#045a52'],
  ['#0aa093', '#0b7d73'],
  ['#15b8aa', '#05837a'],
  ['#079e91', '#0a6f66'],
  ['#0fb0a2', '#046058'],
];

for (let i = 0; i < 6; i++) {
  const [c1, c2] = paresTeal[i];
  const ang = 90 + i * 25;
  const svg = `
  <svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
    <defs>
      <linearGradient id="g" gradientTransform="rotate(${ang} 0.5 0.5)">
        <stop offset="0" stop-color="${c1}"/>
        <stop offset="1" stop-color="${c2}"/>
      </linearGradient>
      <radialGradient id="v" cx="50%" cy="42%" r="70%">
        <stop offset="0" stop-color="#ffffff" stop-opacity="0.10"/>
        <stop offset="1" stop-color="#000000" stop-opacity="0.16"/>
      </radialGradient>
    </defs>
    <rect width="${W}" height="${H}" fill="url(#g)"/>
    <rect width="${W}" height="${H}" fill="url(#v)"/>
    <circle cx="${W * 0.5}" cy="${H * 0.44}" r="${H * 0.30}" fill="#ffffff" opacity="0.10"/>
    <g transform="translate(${W * 0.5 - 300} ${H * 0.44 - 225}) scale(5)">
      ${siluetas[i]}
    </g>
    <text x="${W / 2}" y="${H - 70}" text-anchor="middle"
      font-family="Georgia, 'Times New Roman', serif" font-size="34"
      fill="#ffffff" opacity="0.85">El Perro Verde</text>
    <text x="${W / 2}" y="${H - 38}" text-anchor="middle"
      font-family="Arial, sans-serif" font-size="16" letter-spacing="3"
      fill="#ffffff" opacity="0.55">FOTO DE EJEMPLO</text>
  </svg>`;

  await sharp(Buffer.from(svg))
    .png()
    .toFile(path.join(OUT, `mascota-${i + 1}.png`));
}

console.log('6 placeholders creados en src/assets/galeria/');
