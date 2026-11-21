# CLAUDE.md — Catálogos QR

> Claude Code lee este archivo al abrir la carpeta. Mantenlo corto y actualizado.

## Qué es este proyecto
- **Nombre:** BOT Y LLERIA <!-- cambiar por el nombre de marca -->
- **Objetivo:** generar catálogos digitales (productos o servicios) que se abren desde un código QR impreso: en el local, en un flyer, en una vitrina o en una tarjeta.
- **Usuario final:** cliente que escanea con el celular. Todo es *mobile-first*, carga rápida y no requiere instalar nada.
- **Cliente del proyecto:** negocios que necesitan mostrar su oferta (precios, fotos, descripción y contacto por WhatsApp). <!-- ej. restaurantes, tiendas, corredoras -->

## Cómo funciona
1. Cada negocio tiene un archivo de datos en `data/<negocio>.json` (o un CSV) con sus productos.
2. Un script genera la página del catálogo en `output/<negocio>/index.html`.
3. Otro script genera el QR que apunta a la URL publicada (`output/<negocio>/qr.png` y `qr.svg` para imprenta).
4. La página se publica en <!-- ej. GitHub Pages / Netlify / Vercel --> con la URL `https://<dominio>/<negocio>`.

## Estructura de carpetas
```
/
├── CLAUDE.md              ← este archivo
├── README.md              ← explicación para personas
├── data/                  ← un JSON/CSV por negocio (fuente de verdad)
├── assets/<negocio>/      ← logos y fotos originales (no modificar)
├── templates/             ← plantilla HTML/CSS del catálogo
├── src/                   ← scripts: build del catálogo y generación de QR
├── output/                ← resultados generados (se pueden borrar y regenerar)
└── .gitignore
```

## Formato de datos (data/<negocio>.json)
```json
{
  "negocio": "Nombre",
  "slug": "nombre",
  "whatsapp": "+569XXXXXXXX",
  "colores": { "primario": "#000000", "secundario": "#FFFFFF" },
  "categorias": [
    {
      "nombre": "Categoría",
      "items": [
        { "marca": "Marca", "nombre": "Producto", "precio": 9990, "descripcion": "Texto corto", "foto": "producto.jpg",
          "stock": "disponible | pocas | agotado",
          "promo": { "precio": 7990, "desde": "2026-11-01", "hasta": "2026-11-30", "texto": "Opcional" } }
      ]
    }
  ]
}
```
Sin foto, cada producto usa una ilustración propia (`src/ilustraciones.mjs`) según `tipo` (lata, pack, cerveza, vino, espumante, pisco, sour, whisky, gin, ron, cola, tonica, hielo, papas, mani, ramitas), con `color` y `etiqueta` (texto corto). No usar logos ni fotos de marcas reales.
La página incluye una sección "Ofertas de hoy" y una cotización (lista con cantidades y total) que se envía por WhatsApp; no hay pagos ni login.
Campos extra usados por el build: `url` (URL estable del QR), `direccion`, `actualizado` (AAAA-MM-DD), `icono` por categoría (cerveza, vino, pisco, destilado, bebida, snack; se usa si no hay foto). Ejemplo completo: `data/demo.json`.
- Promos fuera de `desde`–`hasta` no se muestran (se revisa al generar y también en el navegador).
- Los agotados se ordenan al final de cada categoría.

## Comandos
- Instalar: `npm install` (Node 20+; usa `qrcode` y `sharp`)
- Generar un catálogo: `npm run build -- <negocio>` → `output/<negocio>/index.html` (+ fotos WebP en `img/`)
- Generar el QR: `npm run qr -- <negocio>` → `output/<negocio>/qr.svg` y `qr.png` (1200 px, URL debajo)
- Vista previa local: `npm run preview` y abrir `http://localhost:3000/<negocio>/`

## Reglas
- Idioma: español (Chile). Precios en CLP, con separador de miles ($9.990).
- Mobile-first: tiene que verse bien en 360 px de ancho y pesar menos de 1 MB por página (fotos comprimidas a WebP).
- El QR siempre apunta a una URL estable. Si cambian los productos, se regenera el catálogo, no el QR.
- QR para imprimir: SVG o PNG de 1000 px como mínimo, con margen blanco y con la URL escrita debajo.
- No modificar `assets/` originales; trabajar sobre copias optimizadas.
- No subir a Git claves, `.env` ni datos privados de clientes.
- Solo usar fotos del cliente o con licencia libre.

## Estilo
- Diseño limpio, con los colores del negocio desde el JSON.
- Botón fijo "Pedir por WhatsApp" con mensaje prellenado.
- Tipografía legible (16 px mínimo), alto contraste.

## Estado actual / pendientes
- [x] Definir el stack: HTML + CSS + JS vanilla, generado con Node (`src/build.mjs`, `src/qr.mjs`)
- [x] Crear la plantilla base en `templates/catalogo.html`
- [x] Primer negocio de prueba en `data/demo.json` (falta un piloto real)
- [x] Hosting: GitHub Pages (repo público `nicoguzmanpardo1-art/catalogos-qr`). Cada push a `main` regenera todos los catálogos y QR (`.github/workflows/pages.yml`). URL: `https://nicoguzmanpardo1-art.github.io/catalogos-qr/<negocio>/`
- [ ] Dominio propio (opcional, tiene costo)

