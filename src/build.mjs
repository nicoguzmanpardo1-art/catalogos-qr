// Genera output/<negocio>/index.html desde data/<negocio>.json
// Uso: npm run build -- demo
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';
import { ilustracion } from './ilustraciones.mjs';

const raiz = path.resolve(import.meta.dirname, '..');
const slug = process.argv[2];
if (!slug) { console.error('Falta el negocio. Ej: npm run build -- demo'); process.exit(1); }

const datos = JSON.parse(fs.readFileSync(path.join(raiz, 'data', `${slug}.json`), 'utf8'));
const salida = path.join(raiz, 'output', slug);
fs.mkdirSync(path.join(salida, 'img'), { recursive: true });

const hoy = new Date().toISOString().slice(0, 10);
const clp = n => '$' + Math.round(n).toString().replace(/\B(?=(\d{3})+(?!\d))/g, '.');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const idDe = s => norm(s).replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
const fecha = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
const fechaCorta = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'short' }).replace('.', '');
const promoVigente = p => p && p.desde <= hoy && hoy <= p.hasta && p.precio > 0;
const ORDEN = { disponible: 0, pocas: 1, agotado: 2 };
const STOCK_TXT = { disponible: 'Disponible', pocas: 'Pocas unidades', agotado: 'Agotado' };
const LIMITE = 4; // tarjetas visibles antes de "Ver más"

// Fotos del cliente: copia optimizada a WebP (los originales de assets/ no se tocan)
async function foto(item) {
  if (!item.foto) return null;
  const src = path.join(raiz, 'assets', slug, item.foto);
  if (!fs.existsSync(src)) { console.warn(`  ! Falta la foto ${item.foto}; uso ilustración`); return null; }
  const nombre = path.parse(item.foto).name + '.webp';
  await sharp(src).trim({ threshold: 12 }).resize(400, 400, { fit: 'contain', background: '#ffffff' })
    .extend({ top: 20, bottom: 20, left: 20, right: 20, background: '#ffffff' })
    .webp({ quality: 70 }).toFile(path.join(salida, 'img', nombre));
  return 'img/' + nombre;
}

function tarjeta(it, cat, img) {
  const promo = promoVigente(it.promo) ? it.promo : null;
  const precio = promo ? promo.precio : it.precio;
  const pct = promo ? Math.round((1 - promo.precio / it.precio) * 100) : 0;
  const agotado = it.stock === 'agotado';
  const visual = img
    ? `<img src="${img}" alt="${esc(it.nombre)}" loading="lazy" width="480" height="480">`
    : ilustracion({ tipo: it.tipo, color: it.color, etiqueta: it.etiqueta || it.marca, fondo: '#F7F0E3' });
  return `<article class="card${promo ? ' oferta' : ''}${agotado ? ' agotado' : ''}" data-id="${it.id}" data-nombre="${esc(it.marca + ' ' + it.nombre)}" data-precio="${precio}" data-normal="${it.precio}" data-stock="${it.stock}" data-promo="${promo ? 1 : 0}" data-txt="${esc(norm(`${it.marca} ${it.nombre} ${cat} ${it.etiqueta || ''} ${it.descripcion || ''} ${it.tipo || ''}`))}"${promo ? ` data-hasta="${promo.hasta}"` : ''}>
  <div class="foto">${visual}</div>
  ${promo ? `<span class="dcto">-${pct}%</span>` : ''}
  <div class="info">
    <span class="stock s-${it.stock}">${STOCK_TXT[it.stock] || 'Disponible'}</span>
    <span class="marca">${esc(it.marca)}</span>
    <h3>${esc(it.nombre)}</h3>
    <div class="precios">
      <div class="precio">${clp(precio)}</div>
      ${promo ? `<div class="antes">Normal <s>${clp(it.precio)}</s></div><span class="ahorro">Ahorras ${clp(it.precio - promo.precio)}</span><div class="vence">${esc(promo.texto || 'Oferta')} · hasta ${fechaCorta(promo.hasta)}</div>` : ''}
    </div>
    <div class="cot"></div>
  </div>
</article>`;
}

let vencidas = 0, nStock = 0, total = 0;
const ofertas = [];
const secciones = [];
for (const cat of datos.categorias) {
  const items = [...cat.items].sort((a, b) => (ORDEN[a.stock] ?? 0) - (ORDEN[b.stock] ?? 0)); // agotados al final
  const cards = [];
  for (const it of items) {
    it.id ??= idDe(`${it.marca}-${it.nombre}`);
    total++;
    if (it.stock !== 'agotado') nStock++;
    if (it.promo && !promoVigente(it.promo)) vencidas++;
    const img = await foto(it);
    const html = tarjeta(it, cat.nombre, img);
    cards.push(html);
    if (promoVigente(it.promo) && it.stock !== 'agotado') ofertas.push({ html, pct: 1 - it.promo.precio / it.precio });
  }
  secciones.push(`<section id="${idDe(cat.nombre)}" data-limite="${LIMITE}">
  <div class="sec-h"><h2>${esc(cat.nombre)}</h2><span>${items.length} productos</span></div>
  <div class="grid">
${cards.join('\n')}
  </div>
  ${items.length > LIMITE ? `<button class="vermas">Ver todos (${items.length})</button>` : ''}
</section>`);
}
ofertas.sort((a, b) => b.pct - a.pct); // mayor descuento primero

const WA_ICON = `<svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 2a10 10 0 0 0-8.6 15.1L2 22l5-1.3A10 10 0 1 0 12 2zm5.3 14.1c-.2.6-1.3 1.2-1.8 1.2-.5.1-1 .2-3.3-.7-2.8-1.1-4.6-4-4.7-4.2-.1-.2-1.1-1.5-1.1-2.9s.7-2 1-2.3c.2-.3.5-.3.7-.3h.5c.2 0 .4 0 .6.5l.9 2c.1.2.1.4 0 .5l-.4.6-.4.4c-.1.1-.3.3-.1.6.2.3.8 1.3 1.7 2.1 1.1 1 2.1 1.3 2.4 1.5.3.1.5.1.6-.1l.9-1c.2-.3.4-.2.6-.1l1.9.9c.3.1.5.2.5.3.1.2.1.7-.1 1.3z"/></svg>`;
const waNum = datos.whatsapp.replace(/\D/g, '');
const nav = (ofertas.length ? `<a href="#ofertas" class="hot">Ofertas</a>` : '') +
  datos.categorias.map(c => `<a href="#${idDe(c.nombre)}">${esc(c.nombre)}</a>`).join('');
const act = datos.actualizado || hoy;
// Créditos de fotos con licencia (p. ej. Open Food Facts, CC BY-SA)
const conCredito = datos.categorias.flatMap(c => c.items).filter(i => i.credito && fs.existsSync(path.join(salida, 'img', path.parse(i.foto || '').name + '.webp')));
const creditos = conCredito.length ? `<details class="creditos"><summary>Créditos de las fotos (${conCredito.length})</summary><ul>${conCredito.map(i =>
  `<li>${esc(i.nombre)}: <a href="${esc(i.credito.url)}" target="_blank" rel="noopener">${esc(i.credito.fuente)}</a>, ${esc(i.credito.licencia)}${i.credito.cambios ? ' · ' + esc(i.credito.cambios) : ''}</li>`).join('')}</ul></details>` : '';

const html = fs.readFileSync(path.join(raiz, 'templates', 'catalogo.html'), 'utf8')
  .replaceAll('{{NEGOCIO}}', esc(datos.negocio))
  .replace('{{NEGOCIO_JSON}}', JSON.stringify(datos.negocio).replace(/</g, '\\u003c'))
  .replaceAll('{{SLUG}}', slug)
  .replace('{{LEMA}}', esc(datos.lema || datos.negocio))
  .replace('{{DIRECCION}}', esc(datos.direccion || ''))
  .replace('{{HORARIO}}', esc(datos.horario || ''))
  .replaceAll('{{ACTUALIZADO}}', fecha(act))
  .replace('{{ACT_CORTO}}', fechaCorta(act))
  .replace('{{N_OFERTAS}}', ofertas.length)
  .replace('{{N_STOCK}}', `${nStock}/${total}`)
  .replaceAll('{{PRIMARIO}}', datos.colores?.primario || '#7A1F2B')
  .replace('{{SECUNDARIO}}', datos.colores?.secundario || '#F4EAD5')
  .replace('{{NAV}}', nav)
  .replace('{{OFERTAS}}', ofertas.length ? `<section id="ofertas">
  <div class="sec-h"><h2>Ofertas de hoy</h2><span>${ofertas.length} productos rebajados</span></div>
  <div class="grid">
${ofertas.map(o => o.html).join('\n')}
  </div>
</section>` : '')
  .replace('{{SECCIONES}}', secciones.join('\n'))
  .replace('{{CREDITOS}}', creditos)
  .replaceAll('{{WA_ICON}}', WA_ICON)
  .replace('{{WA_NUM}}', waNum)
  .replace('{{WA_URL}}', `https://wa.me/${waNum}?text=${encodeURIComponent(`Hola ${datos.negocio}, vi el catálogo y quiero consultar por: `)}`);

fs.writeFileSync(path.join(salida, 'index.html'), html);
const kb = (fs.readdirSync(salida, { recursive: true }).map(f => path.join(salida, f)).filter(f => fs.statSync(f).isFile() && !/qr\./.test(f))
  .reduce((s, f) => s + fs.statSync(f).size, 0) / 1024).toFixed(1);
console.log(`✓ output/${slug}/index.html · ${total} productos · ${ofertas.length} ofertas vigentes · ${vencidas} vencidas ocultas · ${kb} KB`);
