// Procesa assets/LogoDefinitivo.png -> PNGs limpios, favicon e iconos
// cuadrados y la imagen Open Graph.
//
//   node scripts/procesar-logo.mjs
//
// El original ya viene recortado y con fondo transparente (teal sobre
// transparente). Solo hace falta separar la escena de los animales (sin
// texto, para el header/footer) del logo completo, y generar la versión en
// blanco (para fondos teal) recoloreando en vez de tener que extraerla de
// otra imagen.

import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';

const ROOT = path.resolve(import.meta.dirname, '..');
const SRC = path.join(ROOT, 'assets', 'LogoDefinitivo.png');
const ANIMALES_SRC = path.join(ROOT, 'assets', 'AnimalesLogo.png');
const LOGO_DIR = path.join(ROOT, 'public', 'logo');
const PUB = path.join(ROOT, 'public');
const IMG_DIR = path.join(ROOT, 'public', 'img');
const ASSETS_DIR = path.join(ROOT, 'src', 'assets');
const BG = '#08a89b';

await mkdir(LOGO_DIR, { recursive: true });
await mkdir(IMG_DIR, { recursive: true });
await mkdir(ASSETS_DIR, { recursive: true });

/** Pone en blanco todos los pixeles, conservando el canal alfa. */
async function aBlanco(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  for (let i = 0; i < info.width * info.height; i++) {
    const o = i * info.channels;
    data[o] = 255;
    data[o + 1] = 255;
    data[o + 2] = 255;
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

// ---- 1. Logo completo (teal sobre transparente), recortado al contenido ----
const tealPng = await sharp(SRC).trim({ threshold: 10 }).toBuffer();
await sharp(tealPng)
  .resize({ width: 900, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(LOGO_DIR, 'logo-teal.png'));

// ---- 2. Logo completo en blanco (para fondos teal) ----
const blancoPng = await aBlanco(tealPng);
await sharp(blancoPng)
  .resize({ width: 900, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(LOGO_DIR, 'logo-blanco.png'));

// ---- 3. Marca de los animales, sin texto ----
// assets/AnimalesLogo.png trae solo el perro y el gato (sin la palabra "El
// Perro Verde"), así que no hace falta recortar el logo completo a ciegas.
// Eso sí: su "fondo transparente" en realidad es un cuadriculado gris/blanco
// pintado a fuego en los píxeles (el PNG no tiene canal alfa real), así que
// hay que quitarlo por color igual que con el logo original.
async function quitarFondoClaro(buffer) {
  const { data, info } = await sharp(buffer)
    .ensureAlpha()
    .raw()
    .toBuffer({ resolveWithObject: true });
  const px = info.width * info.height;
  for (let i = 0; i < px; i++) {
    const o = i * info.channels;
    const min = Math.min(data[o], data[o + 1], data[o + 2]);
    // El cuadriculado de fondo va de ~230 a 255; los animales, muy saturados,
    // no pasan de ~40. Banda de transición amplia solo para suavizar bordes.
    const alpha = ((200 - min) / 100) * 255;
    data[o + 3] = Math.max(0, Math.min(255, Math.round(alpha)));
  }
  return sharp(data, {
    raw: { width: info.width, height: info.height, channels: 4 },
  })
    .png()
    .toBuffer();
}

let marcaTeal = await quitarFondoClaro(await sharp(ANIMALES_SRC).toBuffer());
marcaTeal = await sharp(marcaTeal).trim({ threshold: 10 }).toBuffer();

// Marca teal para el header/footer (se usa con <Image /> de astro:assets).
await sharp(marcaTeal)
  .resize({ width: 320, withoutEnlargement: true })
  .png({ compressionLevel: 9 })
  .toFile(path.join(ASSETS_DIR, 'marca.png'));

// Misma marca en blanco para los iconos cuadrados.
const marca = await aBlanco(marcaTeal);

// ---- 4. Iconos cuadrados: fondo teal + marca en blanco ----
async function iconoCuadrado(size, radius, outfile) {
  const pad = Math.round(size * 0.1);
  const inner = size - pad * 2;
  const marcaBlanca = await sharp(marca)
    .resize({
      width: inner,
      height: inner,
      fit: 'contain',
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();

  const composites = [{ input: marcaBlanca, left: pad, top: pad }];
  if (radius > 0) {
    composites.push({
      input: Buffer.from(
        `<svg width="${size}" height="${size}"><rect x="0" y="0" width="${size}" height="${size}" rx="${radius}" ry="${radius}"/></svg>`
      ),
      blend: 'dest-in',
    });
  }

  await sharp({
    create: { width: size, height: size, channels: 4, background: BG },
  })
    .composite(composites)
    .png()
    .toFile(path.join(PUB, outfile));
}

await iconoCuadrado(32, 7, 'favicon-32.png');
await iconoCuadrado(180, 40, 'apple-touch-icon.png');
await iconoCuadrado(192, 0, 'android-chrome-192.png');
await iconoCuadrado(512, 0, 'android-chrome-512.png');

// ---- 5. Imagen Open Graph 1200x630: fondo teal + logo blanco centrado ----
const ogLogo = await sharp(blancoPng)
  .resize({ width: 780, fit: 'inside', withoutEnlargement: true })
  .toBuffer();
const ogMeta = await sharp(ogLogo).metadata();
await sharp({
  create: { width: 1200, height: 630, channels: 4, background: BG },
})
  .composite([
    {
      input: ogLogo,
      left: Math.round((1200 - ogMeta.width) / 2),
      top: Math.round((630 - ogMeta.height) / 2),
    },
  ])
  .png()
  .toFile(path.join(IMG_DIR, 'og.png'));

console.log('OK: public/logo/, favicon-32, apple-touch-icon, android-chrome-*, public/img/og.png, src/assets/marca.png');
