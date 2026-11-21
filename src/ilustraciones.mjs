// Ilustraciones propias (SVG) por tipo de producto. Se usan cuando no hay foto del cliente.
// Todas dibujadas desde cero: sin logos ni marcas reales.
const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

function aclarar(hex, f) {
  const n = parseInt(hex.slice(1), 16);
  const c = [n >> 16, (n >> 8) & 255, n & 255].map(v => Math.round(v + (255 - v) * f));
  return '#' + c.map(v => v.toString(16).padStart(2, '0')).join('');
}

// Etiqueta con el nombre de marca (texto corto)
const etiqueta = (x, y, w, h, fondo, texto, tinta = '#fff', fs = 13) =>
  `<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="4" fill="${fondo}"/>` +
  `<text x="${x + w / 2}" y="${y + h / 2 + fs * 0.36}" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="${fs}" fill="${tinta}"` +
  (String(texto).length * fs * 0.68 > w - 6 ? ` textLength="${w - 6}" lengthAdjust="spacingAndGlyphs"` : '') + `>${esc(texto)}</text>`;

const brillo = (x, y, h) => `<rect x="${x}" y="${y}" width="6" height="${h}" rx="3" fill="#fff" opacity=".28"/>`;
const sombra = `<ellipse cx="100" cy="186" rx="52" ry="7" fill="#000" opacity=".12"/>`;

const DIBUJOS = {
  lata: (c, t) => `${sombra}<rect x="68" y="44" width="64" height="140" rx="10" fill="${c}"/><rect x="72" y="36" width="56" height="12" rx="4" fill="#B9B9B9"/>
    ${etiqueta(70, 92, 60, 40, '#fff', t, c, 11)}${brillo(78, 52, 120)}`,
  pack: (c, t) => `${sombra}${[0, 1, 2].map(i => `<rect x="${34 + i * 46}" y="${64 - (i % 2) * 6}" width="40" height="112" rx="8" fill="${c}"/><rect x="${37 + i * 46}" y="${57 - (i % 2) * 6}" width="34" height="9" rx="3" fill="#B9B9B9"/>`).join('')}
    <rect x="28" y="120" width="144" height="58" rx="6" fill="${aclarar(c, .78)}"/>${etiqueta(44, 132, 112, 34, c, t + ' ×6', '#fff', 13)}`,
  cerveza: (c, t) => `${sombra}<path d="M88 20h24v38c0 8 14 14 14 30v88a8 8 0 0 1-8 8H82a8 8 0 0 1-8-8V88c0-16 14-22 14-30z" fill="${c}"/>
    <rect x="86" y="14" width="28" height="10" rx="3" fill="#C9A23A"/>${etiqueta(76, 108, 48, 44, '#F4E7C5', t, '#3A2A10', 10)}${brillo(80, 70, 100)}`,
  vino: (c, t, b) => `${sombra}<path d="M90 14h20v52c0 6 18 12 18 30v80a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V96c0-18 18-24 18-30z" fill="${c}"/>
    <rect x="89" y="10" width="22" height="22" rx="3" fill="${b || '#5B1420'}"/>${etiqueta(76, 112, 48, 50, '#FBF5E8', t, '#3A1A1A', 10)}${brillo(80, 100, 72)}`,
  espumante: (c, t) => `${sombra}<path d="M92 26h16v40c0 6 20 14 20 32v78a8 8 0 0 1-8 8H80a8 8 0 0 1-8-8V98c0-18 20-26 20-32z" fill="${c}"/>
    <path d="M88 10h24l-2 26H90z" fill="#D8B64A"/>${etiqueta(76, 116, 48, 46, '#F7EFD9', t, '#3A2A10', 10)}${brillo(80, 100, 74)}`,
  pisco: (c, t) => `${sombra}<path d="M88 16h24v40l18 22v98a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8V78l18-22z" fill="${aclarar(c, .55)}" stroke="${c}" stroke-width="3"/>
    <rect x="86" y="10" width="28" height="14" rx="3" fill="${c}"/>${etiqueta(76, 106, 48, 52, c, t, '#fff', 10)}${brillo(80, 86, 86)}`,
  sour: (c, t) => `${sombra}<path d="M88 16h24v40l18 22v98a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8V78l18-22z" fill="#E9F1C7"/><rect x="72" y="80" width="56" height="100" rx="6" fill="#D6E58F" opacity=".6"/>
    <rect x="86" y="10" width="28" height="14" rx="3" fill="${c}"/>${etiqueta(76, 108, 48, 46, c, t, '#fff', 10)}<circle cx="128" cy="62" r="14" fill="#C9DB4A"/><circle cx="128" cy="62" r="9" fill="#E4EE9A"/>`,
  whisky: (c, t) => `${sombra}<path d="M90 16h20v28l20 14v118a8 8 0 0 1-8 8H78a8 8 0 0 1-8-8V58l20-14z" fill="${c}"/>
    <rect x="88" y="10" width="24" height="12" rx="3" fill="#2A1A0A"/>${etiqueta(74, 92, 52, 60, '#F2E3C0', t, '#3A2A10', 10)}${brillo(78, 70, 104)}`,
  gin: (c, t) => `${sombra}<path d="M88 22h24v24l22 18v112a8 8 0 0 1-8 8H74a8 8 0 0 1-8-8V64l22-18z" fill="${aclarar(c, .7)}" stroke="${c}" stroke-width="3"/>
    <rect x="86" y="12" width="28" height="14" rx="3" fill="${c}"/>${etiqueta(72, 98, 56, 54, c, t, '#fff', 10)}<path d="M100 160c-8 0-12 6-12 6h24s-4-6-12-6z" fill="${c}"/>`,
  ron: (c, t) => `${sombra}<path d="M90 14h20v42c0 6 22 10 22 28v92a8 8 0 0 1-8 8H76a8 8 0 0 1-8-8V84c0-18 22-22 22-28z" fill="${c}"/>
    <rect x="88" y="10" width="24" height="12" rx="3" fill="#C9A23A"/>${etiqueta(72, 104, 56, 52, '#F0D9A8', t, '#3A2A10', 10)}${brillo(76, 90, 82)}`,
  cola: (c, t) => `${sombra}<path d="M90 18h20v20c0 10 22 16 22 34v12c-6 6-6 14 0 20v74a8 8 0 0 1-8 8H76a8 8 0 0 1-8-8v-74c6-6 6-14 0-20V72c0-18 22-24 22-34z" fill="#3A1A10"/>
    <rect x="88" y="10" width="24" height="12" rx="3" fill="${c}"/>${etiqueta(68, 108, 64, 30, c, t, '#fff', 11)}${brillo(76, 70, 100)}`,
  tonica: (c, t) => `${sombra}<path d="M90 18h20v20c0 10 22 16 22 34v104a8 8 0 0 1-8 8H76a8 8 0 0 1-8-8V72c0-18 22-24 22-34z" fill="#DCEFF2" stroke="#9FC6CC" stroke-width="2"/>
    <rect x="88" y="10" width="24" height="12" rx="3" fill="${c}"/>${etiqueta(68, 106, 64, 32, c, t, '#fff', 11)}<circle cx="86" cy="160" r="3" fill="#fff"/><circle cx="104" cy="150" r="2" fill="#fff"/><circle cx="114" cy="168" r="3" fill="#fff"/>`,
  hielo: (c, t) => `${sombra}<path d="M50 40h100l-6 140H56z" fill="#D9EEF8" stroke="#9CC9DE" stroke-width="2"/><rect x="48" y="34" width="104" height="12" rx="3" fill="${c}"/>
    ${[[70, 70], [104, 64], [84, 104], [116, 100], [70, 140], [106, 138]].map(([x, y]) => `<rect x="${x}" y="${y}" width="26" height="26" rx="5" fill="#fff" opacity=".85" stroke="#B5DBEA"/>`).join('')}
    ${etiqueta(64, 166, 72, 12, c, t, '#fff', 9)}`,
  papas: (c, t) => `${sombra}<path d="M52 34l8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10 8-10 8 10v142l-8 10-8-10-8 10-8-10-8 10-8-10-8 10-8-10-8 10-8-10-8 10-8-10z" fill="${c}"/>
    ${etiqueta(62, 56, 76, 28, '#fff', t, c, 13)}<ellipse cx="100" cy="132" rx="30" ry="20" fill="#F4C94A"/><ellipse cx="92" cy="126" rx="10" ry="6" fill="#FBE08A"/>`,
  mani: (c, t) => `${sombra}<path d="M56 34h88l-4 150H60z" fill="${c}"/>${etiqueta(66, 52, 68, 28, '#fff', t, c, 13)}
    ${[[82, 124], [112, 118], [96, 150]].map(([x, y]) => `<ellipse cx="${x}" cy="${y}" rx="14" ry="20" fill="#D9A55A" transform="rotate(30 ${x} ${y})"/>`).join('')}`,
  ramitas: (c, t) => `${sombra}<path d="M54 30h92v154H54z" rx="6" fill="${c}"/>${etiqueta(62, 46, 76, 28, '#fff', t, c, 13)}
    ${[0, 1, 2, 3, 4].map(i => `<rect x="${70 + i * 13}" y="${92 + (i % 2) * 8}" width="7" height="70" rx="3" fill="#E8B04A" transform="rotate(${-10 + i * 5} ${73 + i * 13} 128)"/>`).join('')}`,
};

export const TIPOS = Object.keys(DIBUJOS);

export function ilustracion({ tipo, color = '#7A1F2B', etiqueta: t = '', fondo = '#F4EAD5' }) {
  const dib = DIBUJOS[tipo] || DIBUJOS.vino;
  return `<svg viewBox="0 0 200 200" role="img" aria-hidden="true"><rect width="200" height="200" fill="${fondo}"/>` +
    `<circle cx="100" cy="104" r="78" fill="${aclarar(color, .82)}"/>${dib(color, t)}</svg>`;
}
