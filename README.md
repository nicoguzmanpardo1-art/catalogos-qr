# Catálogos QR

Catálogos digitales para negocios que se abren escaneando un código QR. El cliente ve los productos, los precios y las fotos en su celular, ademas de saber si hay stock y/o promociones vigentes.

## Para qué sirve
- Reemplazar las preguntas de productos que hacen perder el tiempo a futuros clientes.
- Actualizar precios y productos sin cambiar el QR.
- Agilizar el movimiento en la fila de compras.

## Cómo agregar un negocio
1. Crear `data/<negocio>.json` a partir de un ejemplo.
2. Poner el logo y las fotos en `assets/<negocio>/`.
3. Generar el catálogo y el QR (ver los comandos en `CLAUDE.md`).
4. Publicar y entregar el QR al cliente para imprimirlo.

## Carpetas
- `data/`: información de cada negocio
- `assets/`: imágenes originales
- `templates/`: diseño del catálogo
- `src/`: scripts
- `output/`: catálogos y QR generados

