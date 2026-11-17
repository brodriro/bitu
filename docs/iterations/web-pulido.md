# Registro de pulido de la web

> Web: `web/index.html` (+ `styles.css`, `app.js`). Dirección visual: zine maker risográfico (elegida por el usuario el 2026-11-16). Contrato de dirección en `.impeccable/surfaces/web-index-html.md`. Capturas en `.impeccable/review/` (escritorio 1440 px y móvil 390 px).

## Construcción inicial

- Stack: HTML/CSS/JS estático sin build (decisión delegada; ver `PRODUCT.md`).
- Secciones: portada con sello de la cara de Bitu y «hoja de pedido» de la propuesta recomendada, estado del arte, piezas y precios, software (pipeline, latencia, coste, seguridad), carcasa (plano acotado en SVG), ensamble interactivo A/B/C, seguridad, nombre, plan de mejora y fuentes.
- Interacción firma: selector A/B/C + conmutador barato/retail que «reimprime» inventario, total, pines y pasos (`app.js`, datos de `docs/research/05-propuestas-de-ensamble.md`).

## Iteración 1 · color y móvil

- El `mix-blend-mode: multiply` del titular y del sello convertía el azul en casi negro sobre el papel amarillo: se quitó y las tintas quedan con su color real.
- Precio de la hoja de pedido pasado a la fuente display con cifras tabulares.
- Móvil: el titular va antes del sello y crece (`clamp(7rem, 36vw, 13rem)`); la tabla de placas tiene ancho mínimo y desplazamiento horizontal propio.

## Iteración 2 · errores de render

- La fila «Total» del inventario heredaba el estilo del precio gigante (choque de la clase `.total`): renombrada a `.suma`.
- Plano de la carcasa: el relleno rosa translúcido se veía salmón; ahora papel claro con contorno azul y sombra rosa desregistrada. Etiqueta «≥ 30 mm» separada de la cota.
- Tabla de pines: la columna «Pin» en monoespaciada sin cortes y tabla con ancho mínimo en móvil.
- El rango de precio de cada familia baja a su propia línea.
- Detector de Impeccable: textos funcionales por debajo de 12 px subidos (`.est`, etiquetas de fases y pasos). Los avisos de «side-tab» son la regla superior de las tablas (falso positivo) y el de contraste `#ffe68a` se mide contra el papel en vez de contra la hoja azul donde se usa.

## Iteración 3 · contenido

- Ajuste de contenido en la sección de nombre (retirada después: el nombre Bitu es definitivo). Se reescribieron las tres rondas con las puntuaciones reales (Nubo 21, Bitu 20, Pixo 19, Ozi 18, Eko 16 → Bitu 22, Nubo 20, Ozi 18, Pixo 17, Eko 15).
- Revisión final de la parte baja (nombre, plan, colofón) en escritorio.

## Pendiente

- Revisión independiente de acabado (finish review) no ejecutada.
- Fotos reales del prototipo cuando exista (fase 2 del plan).
- Diseño en Figma (parcial, 2026-11-16): archivo «Bitu · mini robot asistente IA» (https://www.figma.com/design/cXPd0MYZzseCNdWrErqE8p).
  - Hecho: variables de color y espacio, 8 estilos de texto, componentes (cara de Bitu con 5 estados: neutral, escucha, piensa, habla, feliz; botón, etiqueta «est.», etiqueta de pieza nueva, fila de BOM, paso de ensamble) y, en la página «Web», la versión de escritorio con nav, portada y pipeline.
  - Falta: secciones de ensamble, plan y pie en escritorio; versión móvil; página «Robot» (vistas frontal y lateral acotadas). Se cortó por el límite de llamadas del MCP de Figma en el plan Starter.

## Rediseño de lectura (2026-11-16)

- Pedido: «un diseño más agradable a la lectura». Se cambió solo la hoja de estilos; HTML, contenido y JS siguen igual.
- `web/styles.css`: fondo claro y frío (#f5f6fa / blanco), texto #1b1a33, un solo acento azul y rosa solo en marcas puntuales. Sin grano, sin bloques azules a sangre ni sombras desregistradas en titulares (solo un eco suave en el titular BITU). Titulares en Bricolage a ancho normal y tamaños moderados; cuerpo Atkinson Hyperlegible 17 px / 1.7; tablas con cabecera, filas alternas y más aire; tarjetas con borde fino.
- El diseño zine anterior se conserva en `web/styles-zine.css` (cambiar el `<link>` para volver a él).
- `DESIGN.md` todavía describe el mundo zine: hay que regenerarlo si se adopta este diseño.

## Simulación 3D, versión 2 (2026-11-16)

- Pedido: una simulación del ensamblaje mejor y más fiel. Se reescribió `web/modelo3d.js` (la versión anterior queda en `web/modelo3d-v1.js`); `index.html` no cambia y en `styles.css` solo se añadieron los estilos de las etiquetas flotantes (`.v3d-etiqueta`).
- Carcasa hueca en dos mitades con la pantalla inclinada 12°, rejilla, agujero de micrófono, marca táctil y antena «bit»; despiece sobre la mesa sin piezas tapadas; piezas que vuelan en curva y asientan con un rebote, tornillos que giran, cables pegados a las paredes hasta el pin de cada GPIO; cámara que sigue cada paso; resaltado y etiqueta de la pieza nueva; secuencia de encendido con saludo.
- La carcasa trasera y la base pasan al paso 1 (antes paso 6). Detalle y límites en `docs/research/08-modelo-3d.md`.
- Comprobado en Chromium sin cabeza (pasos 0, 1, 2, 4, 5, 6, 7 y 8, vista interior, tres piezas de la galería y móvil de 390 px), sin errores de consola. Capturas `v2_*.png` en `.impeccable/review/`. No se probó en un móvil real ni se midió la tasa de fotogramas.


## Nombre definitivo y medidas verificadas (2026-11-16)

- El nombre **Bitu** es definitivo: se eliminaron `docs/naming/` y la sección «Cómo se llama» de la web.
- Catálogo: cada pieza lleva **modelo exacto**, **medidas** y **fuente de las medidas**; se añadieron el altavoz de cavidad 8 Ω 2 W (A y B) y la alternativa todo en uno Waveshare ESP32-S3-Touch-AMOLED-1.75.
- Modelo 3D: las piezas usan las medidas de su ficha o plano (detalle y correcciones en `docs/research/08-modelo-3d.md`). El altavoz de 3 W real (70 × 31 × 17) no cabía en la cabeza de A: se cambió en A y B.
