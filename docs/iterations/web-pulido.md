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

## Carcasa elegida y alcance A + B (2026-11-17)

- Carcasa elegida: **Delta suave**. La sección «La carcasa» muestra su plano (vistas frontal y lateral a escala, generadas a partir de las medidas del CAD) y su tabla de impresión; el visor 3D abre «Diseños de carcasa» en ella, marcada como elegida.
- Alcance reducido a A y B: el catálogo se regeneró con `scrape_precios.py` solo con sus piezas (A ≈ USD 63,85 leído hoy, B ≈ 138,90), el filtro del catálogo queda en Todas/A/B, el selector de ensamble pierde la C («Dos formas de armarlo») y la galería 3D pierde las piezas de A′, C y la alternativa AMOLED.
- Plan en la web: la fase 1 pasa a «Demo A» y la puerta G2 ya no recurre a A′.
- Pendiente: pasar la simulación de montaje de la cabeza cúbica a la Delta suave.

## Pantalla de 1,85" y medidas en cm (2026-11-17)

- Pedido: «la pantalla debería ser un poco más grande y medidas en cm». La A pasa a la pantalla redonda táctil Waveshare 1,85" (Ø 5,5 cm, área activa Ø 4,57 cm frente a 3,24). La Delta suave se agrandó a 11,8 cm de lado y 7 cm de fondo (9,8 × 8,4 × 8,8 cm, 87,6 g) para alojarla; la comprobación de choques pasa.
- Web: plano de la carcasa redibujado con cotas en cm, portada (USD 30–58, carcasa y pantalla), tabla de pantallas, inventario y pines de A, catálogo regenerado (pieza `lcd185`; GC9A01 archivada), galería 3D con la pantalla nueva y medidas en cm, y datos del visor de carcasas en cm.

## Búsqueda de una pantalla más grande (2026-11-17)

- Pedido: «busca componentes para una pantalla ligeramente más grande». Resultado en el doc 02 (§2, «Pantallas algo más grandes que la de 1,85"»): no hay redonda QSPI entre 1,85" y 2,1"; la 2,1" es RGB (≈ 20 GPIO) y no cabe en la DevKit con el audio; la AMOLED 2,16" parece cuadrada. A se queda con la 1,85".
- Web: tabla «¿Una cara más grande?» bajo «Cara» en la sección de piezas, con nota de la decisión.

## Simulación 3D, versión 3: Delta suave (2026-11-17)

- Pedido: «genera la simulación nuevamente». `web/modelo3d.js` monta ahora la propuesta A dentro de la **Delta suave**, con sus mallas reales (`web/modelos/carcasa-delta-suave.glb`) y la pantalla de 1,85" con sus 13 hilos. Desaparecen la cabeza cúbica, la base y la GC9A01, también de la galería. Detalle en el doc 08.
- El CAD se corrigió al encajar la simulación: faltaba el plástico de 2,5 mm de los pines macho, el USB-C quedaba a 1,2 cm de la pared (la placa se desplazó 7,5 mm y las ranuras pasaron a ser una ventana) y los tornillos tienen que ser M2,5 × 40 (doc 09).
- Arreglos de paso: el cargador GLTF quita los «:» de los nombres de nodo, lo que rompía «Ver interior» en «Diseños de carcasa»; el texto largo de un paso ya no se monta sobre «Pieza nueva».
- Comprobado en Chromium sin cabeza (con `--disable-extensions`; la extensión del perfil cortaba la descarga del GLB) en los pasos 0, 3, 5, 6, 7 y 8 y en la pieza «Carcasa Delta suave» de la galería. No se probó en un móvil real.

## LLM: API de DeepSeek (2026-11-17)

- Pedido: «integrar la API de DeepSeek y actualizar toda la web a partir de las definiciones actuales». Fuente de verdad: doc 03 §5.3, que cubre integración, precios oficiales, moderación, condiciones de uso y mitigaciones. La plantilla del servidor está en `tools/servidor/config-deepseek.yaml`.
- Web: portada (LLM DeepSeek ≈ USD 0,04–0,19/mes, fecha 17-11-2026), pipeline (STT local y LLM DeepSeek u Ollama), latencia y coste recalculados, capa de clasificador y párrafo de privacidad (datos en China y servicio no dirigido a niños), bloque nuevo «DeepSeek en el servidor», acción del plan, fuentes (se retiran las de Anthropic) y paso «Cerebro» del ensamble A.

## Auditoría del catálogo en 3 pasadas (2026-11-17)

- Pasada 1: las cantidades y los precios de las 12 piezas cuadraban con el doc 05 y con `app.js`. Faltaban el cable USB-C y el cargador de 5 V (A y B no encienden sin ellos). En los consumibles no figuraban los tornillos M2,5 × 40, las cabeceras, el portapilas, el condensador de 470 µF ni el divisor. El doc 05 decía que la pantalla de B usaba «el mismo bus que en A», pero la A ya va por QSPI.
- Pasada 2: entran en el catálogo `cableusbc` (Adafruit 4474) y `fuente5v` (Adafruit 1994), y se detallan los consumibles de A y B. Nuevos totales: A ≈ USD 34 / 71 y B ≈ USD 44 / 148 (leídos hoy: 77,44 y 154,80). Se propagaron a los docs 02, 03, 05 y 07, al plan, a PRODUCT, a `app.js` y a la portada. Se volvió a ejecutar el scraper.
- Pasada 3: comprobación automática. La suma de `app.js` es igual a la del catálogo más los fijos y a los totales mostrados, en A y en B. Todos los módulos de las tablas de pines están en el catálogo. La galería 3D solo añade la placa perforada y la carcasa, que van en los fijos, y suma el cable USB-C. La web generada muestra las piezas nuevas.

## Placa perforada y riesgos de compra, 3 pasadas (2026-11-17)

- La placa perforada (Adafruit 4786, 5 × 7 cm, pack de 3) y las cabeceras hembra (Adafruit 598, pack de 5) pasan de los consumibles a piezas del catálogo. El scraper reparte el precio del pack entre las unidades (campo `unidades`, también en las fuentes automáticas), y la web muestra el precio por unidad. Los totales no cambian.
- Pasada 1 (fichas, planos y fotos oficiales):
  - El enlace de Adafruit del DevKit es la N8R8.
  - El AT42QT1010 de Adafruit no es el TTP223 de 15 × 11 mm.
  - El PowerBoost carga por micro-USB.
  - El IP5306 se apaga con poca carga.
  - La 18650 con protección mide 69 mm.
  - Los tornillos de 40 mm no vienen en los kits.
  - El cable de la pantalla es GH1.25 a hembras dupont.
  - Faltaban adhesivo, cable fino y pines macho en B.
  - La distancia entre filas del DevKit estaba mal en el doc 08 y en el modelo 3D: 21,6 en lugar de 22,86 mm.
- Pasada 2: el catálogo marca como referencia los enlaces equivocados y deja avisos en el uso de cada pieza. Los consumibles se detallaron. Se corrigió `HDR` en `modelo3d.js` (11,43). Se cambiaron los separadores del amplificador por cinta de espuma de 2 mm. El doc 07 tiene una lista nueva «Antes de pagar» (15 puntos), y la web, un resumen de 10 en la sección del catálogo.
- Pasada 3: totales cuadrados (A 34,00 / 71,03; B 44,00 / 148,39; leídos hoy, 69,99 y 147,35); 16 piezas en el catálogo y en la web; render del catálogo revisado.
