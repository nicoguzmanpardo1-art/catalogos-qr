// Genera output/<negocio>/qr.svg y qr.png (1200 px) con la URL escrita debajo.
// Uso: npm run qr -- demo
import fs from 'node:fs';
import path from 'node:path';
import QRCode from 'qrcode';
import sharp from 'sharp';

const raiz = path.resolve(import.meta.dirname, '..');
const slug = process.argv[2];
if (!slug) { console.error('Falta el negocio. Ej: npm run qr -- demo'); process.exit(1); }
const datos = JSON.parse(fs.readFileSync(path.join(raiz, 'data', `${slug}.json`), 'utf8'));
const url = datos.url;
if (!url) { console.error('Falta "url" en el JSON: es la dirección estable a la que apunta el QR.'); process.exit(1); }

const salida = path.join(raiz, 'output', slug);
fs.mkdirSync(salida, { recursive: true });

// Matriz del QR con corrección alta (aguanta impresión gastada o sucia)
const qr = QRCode.create(url, { errorCorrectionLevel: 'H' });
const n = qr.modules.size;
const ANCHO = 1200, MARGEN = 100, LADO = ANCHO - MARGEN * 2, celda = LADO / n, ALTO = ANCHO + 120;

let d = '';
for (let y = 0; y < n; y++) for (let x = 0; x < n; x++)
  if (qr.modules.get(x, y)) d += `M${(MARGEN + x * celda).toFixed(2)} ${(MARGEN + y * celda).toFixed(2)}h${celda.toFixed(2)}v${celda.toFixed(2)}h-${celda.toFixed(2)}z`;

const texto = url.replace(/^https?:\/\//, '');
const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${ANCHO}" height="${ALTO}" viewBox="0 0 ${ANCHO} ${ALTO}">
<rect width="100%" height="100%" fill="#fff"/>
<path d="${d}" fill="#000" shape-rendering="crispEdges"/>
<text x="${ANCHO / 2}" y="${ANCHO + 40}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="46" font-weight="bold" fill="#000">${texto.replace(/&/g, '&amp;')}</text>
</svg>`;

fs.writeFileSync(path.join(salida, 'qr.svg'), svg);
await sharp(Buffer.from(svg)).png().toFile(path.join(salida, 'qr.png'));
console.log(`✓ output/${slug}/qr.svg y qr.png (${ANCHO}×${ALTO} px) → ${url}`);
