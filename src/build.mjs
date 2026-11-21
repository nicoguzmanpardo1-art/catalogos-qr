// Genera output/<negocio>/index.html desde data/<negocio>.json
// Uso: npm run build -- demo
import fs from 'node:fs';
import path from 'node:path';
import sharp from 'sharp';

const raiz = path.resolve(import.meta.dirname, '..');
const slug = process.argv[2];
if (!slug) { console.error('Falta el negocio. Ej: npm run build -- demo'); process.exit(1); }

const datos = JSON.parse(fs.readFileSync(path.join(raiz, 'data', `${slug}.json`), 'utf8'));
const salida = path.join(raiz, 'output', slug);
fs.mkdirSync(path.join(salida, 'img'), { recursive: true });

const hoy = new Date().toISOString().slice(0, 10);
const clp = n => '$' + Math.round(n).toLocaleString('es-CL').replace(/,/g, '.');
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const norm = s => s.toLowerCase().normalize('NFD').replace(/[̀-ͯ]/g, '');
const idCat = s => norm(s).replace(/[^a-z0-9]+/g, '-');
const fecha = iso => new Date(iso + 'T12:00:00').toLocaleDateString('es-CL', { day: 'numeric', month: 'long', year: 'numeric' });
const promoVigente = p => p && p.desde <= hoy && hoy <= p.hasta && p.precio > 0;
const ORDEN = { disponible: 0, pocas: 1, agotado: 2 };
const STOCK_TXT = { disponible: 'Disponible', pocas: 'Pocas unidades', agotado: 'Agotado' };
const LIMITE = 3; // tarjetas visibles antes de "Ver más"

// Fotos: copia optimizada a WebP (los originales de assets/ no se tocan)
async function foto(item) {
  if (!item.foto) return null;
  const src = path.join(raiz, 'assets', slug, item.foto);
  if (!fs.existsSync(src)) { console.warn(`  ! Falta la foto ${item.foto}`); return null; }
  const nombre = path.parse(item.foto).name + '.webp';
  await sharp(src).resize(480, 480, { fit: 'cover' }).webp({ quality: 72 }).toFile(path.join(salida, 'img', nombre));
  return 'img/' + nombre;
}

let vencidas = 0;
const banners = [];
const secciones = [];
for (const cat of datos.categorias) {
  const items = [...cat.items].sort((a, b) => (ORDEN[a.stock] ?? 0) - (ORDEN[b.stock] ?? 0)); // agotados al final
  const cards = [];
  for (const it of items) {
    if (it.promo && !promoVigente(it.promo)) vencidas++;
    const promo = promoVigente(it.promo) ? it.promo : null;
    const img = await foto(it);
    const pct = promo ? Math.round((1 - promo.precio / it.precio) * 100) : 0;
    const agotado = it.stock === 'agotado';
    if (promo && !agotado) banners.push(`<article class="banner" data-hasta="${promo.hasta}">
  <span class="tag">-${pct}%</span>
  <div><div class="marca">${esc(it.marca)}</div><h3>${esc(it.nombre)}</h3></div>
  <div><span class="precio">${clp(promo.precio)}</span><s>${clp(it.precio)}</s><br><small>${esc(promo.texto || 'Promoción')} · hasta el ${fecha(promo.hasta)}</small></div>
</article>`);
    cards.push(`<article class="card${promo ? ' oferta' : ''}${agotado ? ' agotado' : ''}" data-stock="${it.stock}" data-promo="${promo ? 1 : 0}" data-txt="${esc(norm(`${it.marca} ${it.nombre} ${cat.nombre} ${it.descripcion || ''}`))}"${promo ? ` data-hasta="${promo.hasta}" data-normal="${clp(it.precio)}"` : ''}>
  <div class="foto">${img ? `<img src="${img}" alt="${esc(it.nombre)}" loading="lazy" width="480" height="480">` : `<svg aria-hidden="true"><use href="#i-${cat.icono || 'bebida'}"/></svg>`}</div>
  ${promo ? `<span class="dcto">-${pct}%</span>` : ''}
  <div class="info">
    <span class="marca">${esc(it.marca)}</span>
    <h3>${esc(it.nombre)}</h3>
    <div class="precios"><div class="precio">${clp(promo ? promo.precio : it.precio)}</div>${promo ? `<div class="antes">Normal <s>${clp(it.precio)}</s></div>` : ''}</div>
    <span class="stock s-${it.stock}">${STOCK_TXT[it.stock] || 'Disponible'}</span>
  </div>
</article>`);
  }
  secciones.push(`<section id="${idCat(cat.nombre)}" data-limite="${LIMITE}">
  <div class="sec-h"><h2>${esc(cat.nombre)}</h2><span>${items.length} productos</span></div>
  <div class="grid">
${cards.join('\n')}
  </div>
  ${items.length > LIMITE ? `<button class="vermas">Ver más ${esc(cat.nombre.toLowerCase())}</button>` : ''}
</section>`);
}

const nav = datos.categorias.map(c => `<a href="#${idCat(c.nombre)}">${esc(c.nombre)}</a>`).join('');
const msg = encodeURIComponent(`Hola ${datos.negocio}, vi el catálogo y quiero consultar por: `);
const html = fs.readFileSync(path.join(raiz, 'templates', 'catalogo.html'), 'utf8')
  .replaceAll('{{NEGOCIO}}', esc(datos.negocio))
  .replaceAll('{{DIRECCION}}', esc(datos.direccion || ''))
  .replaceAll('{{ACTUALIZADO}}', fecha(datos.actualizado || hoy))
  .replaceAll('{{PRIMARIO}}', datos.colores?.primario || '#7A1F2B')
  .replaceAll('{{SECUNDARIO}}', datos.colores?.secundario || '#F4EAD5')
  .replace('{{NAV}}', nav)
  .replace('{{PROMOS}}', banners.length ? `<div class="promos" aria-label="Promociones">\n${banners.join('\n')}\n</div>` : '')
  .replace('{{SECCIONES}}', secciones.join('\n'))
  .replace('{{WA_URL}}', `https://wa.me/${datos.whatsapp.replace(/\D/g, '')}?text=${msg}`);

fs.writeFileSync(path.join(salida, 'index.html'), html);
const kb = (fs.readdirSync(salida, { recursive: true }).map(f => path.join(salida, f)).filter(f => fs.statSync(f).isFile() && !/qr\./.test(f))
  .reduce((s, f) => s + fs.statSync(f).size, 0) / 1024).toFixed(1);
console.log(`✓ output/${slug}/index.html · ${banners.length} promos vigentes · ${vencidas} vencidas ocultas · ${kb} KB`);
