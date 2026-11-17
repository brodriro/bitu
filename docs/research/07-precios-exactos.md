# 07 · Precios exactos de las piezas (lectura automática)

> Última ejecución: **2026-11-17** con `tools/precios/scrape_precios.py`, solo con las piezas de las propuestas **A (básico) y B (expresivo)**. Datos crudos en `precios/ultimo.json` e informe en `precios/informe-2026-11-17.md` (la lectura anterior, con A′ y C, queda en `precios/informe-2026-11-16.md`). Precios en USD sin envío ni impuestos.

## Cómo se obtuvieron

- Un script en Python (solo biblioteca estándar) lee la **página de producto** de cada pieza y extrae el precio de los datos estructurados (JSON-LD o metadatos `og:price`). Las monedas se convierten a USD con open.er-api.com.
- Reglas: respeta `robots.txt` y `Crawl-delay`, hace una petición por URL con ≥ 4 s entre peticiones al mismo dominio y se identifica con un User-Agent propio. Si una tienda responde 403/429 o una verificación anti-bot, se marca **bloqueado** y no se reintenta ni se intenta esquivar.
- El catálogo (qué pieza, cuántas por propuesta, de qué tiendas) está en `tools/precios/catalogo.json`. Para repetir la lectura: `python3 tools/precios/scrape_precios.py`.

El mismo script genera `web/catalogo-datos.js`, que alimenta la sección **Catálogo de piezas** de la web: foto de la tienda (enlazada, no copiada), uso, cantidad por propuesta y, por tienda, precio, conversión a USD, estado de lectura y disponibilidad. Los precios anotados a mano desde búsqueda web figuran en `catalogo.json` como fuentes `"manual"` y se muestran como «Búsqueda web»; no cuentan para el «Retail leído hoy».

## Totales por propuesta

| Propuesta | Retail leído hoy | Retail del doc 05 | Barato (est.) |
|---|---|---|---|
| **A** · Básico | **USD 69,99** | USD 71,03 | USD 34,00 |
| **B** · Expresivo | **USD 147,35** | USD 148,39 | USD 44,00 |

«Retail leído hoy» ya no usa el enlace de Adafruit del DevKit (es la N8R8, no la N16R8) ni el del táctil (es un AT42QT1010 de otro tamaño): quedan como referencia y esas piezas toman el precio del doc 05. Desde la auditoría del 2026-11-17 incluye también el **cable USB-A a USB-C** (Adafruit 4474, USD 4.95) y el **cargador de 5 V 2 A** (Adafruit 1994, USD 7.95) en A y B, que faltaban: sin ellos el robot no enciende. Incluye los consumibles fijos del doc 02 §7; en A, la carcasa es la **Delta suave** (87,4 g de PLA, doc 09) y la pantalla la **redonda táctil de 1,85"**, que sustituye a la GC9A01 de 1,28" (archivada) y sube la A unos USD 9. El INMP441 sigue sin lectura automática en ambas (se usa el precio del doc, USD 4,95). En A, la pantalla de 1,85" (Waveshare, USD 17,99) se anotó por búsqueda web porque Waveshare pide 60 s entre lecturas.

**Alcance (2026-11-17):** el catálogo solo incluye por ahora las piezas de A y B. La variante A′ (ESP32-S3-BOX-3), la propuesta C (Raspberry Pi 5, fuente de 27 W, Active Cooler, ReSpeaker Lite, altavoz de 3 W) y la alternativa todo en uno AMOLED 1,75" quedan archivadas en `tools/precios/catalogo-archivo.json`, con sus fuentes. A′ está aparcada y C, descartada para el MVP por precio.

**Por qué la A sale más cara que en el doc 05:** las únicas tiendas que se pudieron leer automáticamente son Adafruit. Allí el ESP32-S3-DevKitC-1 cuesta USD 19,95 (frente a USD 11,89–13,68 de un clon N16R8 en Walmart). Las fuentes más baratas bloquean la lectura automática, así que sus precios son de búsqueda web.

## Hallazgos que cambian decisiones

1. **ESP32-S3-DevKitC-1-N8R8 sigue «Discontinued» en Adafruit** (USD 19,95), y Adafruit no vende la N16R8 que pide xiaozhi. La placa de la A hay que comprarla a un distribuidor de Espressif o como clon N16R8.
2. **18650 2200 mAh (Adafruit 1781) sigue «OutOfStock»**: afecta solo a la B.
3. **Altavoz de la A:** la alternativa de Adafruit (8 Ω 1 W, 30 × 20 × 5 mm) se lee a **USD 1,95** y cabe en el mismo hueco de la Delta suave; el de Waveshare (2 W) está a USD 2,99 por búsqueda web.
4. Sin cambios respecto al 2026-11-16 en Adafruit: MAX98357A 5,95 · AT42QT1010 5,95 · SG92R 5,95 · VL53L0X 14,95 · MPU-6050 12,95 · PowerBoost 1000C 19,95 · IPS 2" 19,95.

## Qué tiendas se pueden leer y cuáles no

| Tienda | Resultado | Motivo |
|---|---|---|
| Adafruit (páginas de producto) | ✅ Legible | Permitido; precio en `og:price`/JSON-LD |
| Adafruit `/api/products` | ⛔ No usado | `robots.txt` prohíbe `/api/` |
| Seeed Studio | ⚠️ Sin precio | La página carga, pero el precio no está en datos estructurados (ReSpeaker Lite queda con el precio del doc) |
| Waveshare | ⚠️ Lenta | Permite leer, pero con `Crawl-delay: 60` s; no incluida |
| DisplayModule, Controllerstech, ShillehTek, Bits & Parts, Vetco | ⛔ Bloqueado | Responden 403/429 a lecturas automáticas |
| AliExpress | ⛔ Bloqueado | La primera búsqueda devolvió datos; las siguientes, una página anti-bot. No se intentó esquivar |
| Walmart | ⛔ Bloqueado | Página de verificación («Robot or human») |
| RobotShop, The Pi Hut | ⛔ Bloqueado | 403 / 429 |
| Electropeak | ⛔ Sin respuesta | Timeout |

**Única lectura de AliExpress (sin repetir):** una placa ESP32-S3 N16R8 con precio original de PEN 22,78 (≈ USD 6,68) y precio de oferta de PEN 3,83 (descuento del 83 %, típico de «oferta de bienvenida», no representativo). Confirma el orden de magnitud del estimado barato (USD ~7).

## Precios de búsqueda web (no automáticos, 2026-11-16)

Para las piezas cuyas tiendas bloquean el script, la búsqueda web dio:

| Pieza | Tienda | Precio |
|---|---|---|
| Pantalla 1,85" ST77916 | [Waveshare](https://www.waveshare.com/1.85inch-touch-lcd-module.htm) | USD 17,99 (17,31 desde 4 u.; 2026-11-17) |
| INMP441 | [ShillehTek](https://shillehtek.com/products/inmp441-i2s-omnidirectional-microphone-module-with-soldering) | USD 9,99 (pre-soldado; 9,50 desde 5 u.) |
| INMP441 | [Vetco](https://vetco.net/products/omnidirectional-microphone-module-inmp441-high-precision-i2s) | USD 4,95 |
| INMP441 | [Bits & Parts](https://www.bitsandparts.nl/en/inmp441-mems-i2s-microphone-module-p1924326) | € 3,75 |
| INMP441 | [Fruugo CA](https://www.fruugo.ca/inmp441-omnidirectional-mems-microphone-module-high-precision-low-power-i2s-interface-esp32-compatible-6-pack/p-394132981) | CAD 20,95 por 6 |
| GC9A01 1,28" (ya no se usa en A) | [DisplayModule](https://www.displaymodule.com/products/1-28-240-x-240-round-tft-spi) | USD 8,90 |
| GC9A01 1,28" (ya no se usa en A) | [Walmart](https://www.walmart.com/ip/1-28Inch-Round-Display-LCD-Screen-Module-GC9A01-SPI-Communication-RGB-65K-Color-Support-for-Raspberry/17303960632) | USD 10,66 |
| GC9A01 1,28" (ya no se usa en A) | [Alibaba](https://electronics.alibaba.com/product/gc9a01-display) | USD 2,10–2,80 (mín. 100 u.) |

## Recomendación de compra para el piloto (A, 8 unidades: 3 de demo + 5)

- **Pedido de menor riesgo:** comprar en Adafruit lo que tiene precio verificado y es exactamente el modelo del diseño: MAX98357A (3006), placa perforada (4786), cabeceras hembra (598), cable USB-C (4474) y cargador (1994). La pantalla, en Waveshare. El DevKit N16R8, el INMP441, el TTP223 y el altavoz de cavidad, en tiendas de clones, revisando la lista de abajo. Coste por robot: ≈ USD 34 (barato, est.) a ≈ USD 71 (retail).
- **Orden:** primero 1 unidad completa más la impresión de prueba de la Delta suave (≈ 7,3 h, USD 1,75 de PLA). Si la pantalla funciona con la placa propia de xiaozhi y las piezas encajan, se piden las 7 restantes. Un fallo cuesta una unidad, no ocho.
- Repetir `scrape_precios.py` la semana del pedido; si alguna tienda ofrece API oficial (Mouser y DigiKey la tienen, con clave gratuita), es la forma correcta de automatizar los precios de los distribuidores.

## Antes de pagar: lista de verificación (auditoría del 2026-11-17)

Detalles que obligarían a recomprar o a esperar otro envío. Se revisaron contra fichas, planos y fotos oficiales.

| # | Pieza | Comprobar en el anuncio | Si se compra mal |
|---|---|---|---|
| 1 | ESP32-S3-DevKitC-1 | **N16R8** (16 MB de flash y 8 MB de PSRAM), **dos USB-C**, 2 × 22 pines y **25,4 mm de ancho** (filas a 22,86 mm, [plano de Espressif](https://dl.espressif.com/dl/schematics/esp_idf/DXF_ESP32-S3-DevKitC-1_V1.1_20220429.pdf)); mejor con los pines macho ya soldados | El enlace de Adafruit del catálogo es la **N8R8**: queda solo como referencia. Los clones con micro-USB o más anchos no encajan en la ventana USB ni en las cabeceras |
| 2 | Pantalla 1,85" | «1.85inch **Touch** LCD Module» de Waveshare (ST77916 + CST816S) | Hay versiones sin táctil y placas con ESP32 integrado que no son el módulo |
| 3 | Cable de la pantalla | Viene incluido: GH1.25 de 15 pines a **hembras dupont**, 15 cm ([foto oficial](https://www.waveshare.com/img/devkit/general/GH1.25-15PIN-15cm.jpg)) | En la protoboard se enchufa directo. En la placa perforada se cortan las hembras y se sueldan: no hace falta comprar nada más |
| 4 | Micrófono | **INMP441** (I2S digital) | El INMP401 es analógico y no funciona con xiaozhi |
| 5 | Táctil | **TTP223** de 15 × 11 mm | El AT42QT1010 de Adafruit (precio de referencia del catálogo) tiene otro tamaño y puede no caber en el hueco de la cara derecha |
| 6 | Altavoz | Cavidad de **8 Ω 2 W, 30 × 20 × 5,5 mm** | El de 3 W y 4 Ω (70 × 31 × 17) no cabe. La alternativa de Adafruit de 1 W cabe, pero hay que limitar el volumen (el MAX98357A da ≈ 1,4 W a 8 Ω). El conector da igual: se corta y va a la bornera |
| 7 | Cabeceras hembra | Altura **estándar de 8,5 mm** (Adafruit 598) | La versión «short» (Adafruit 3008) baja el DevKit y desalinea los USB-C de la ventana |
| 8 | Tornillos de cierre | **M2,5 × 40** (sirve hasta 45) de cabeza cilíndrica, más 3 insertos térmicos M2,5 | Los kits de tornillería suelen llegar a 20–25 mm: hay que pedirlos aparte. Uno de 35 apenas rosca 1 mm |
| 9 | Insertos térmicos | Que la ficha del inserto pida un agujero de **3,6 mm** (el del CAD) | Si pide otro diámetro, cambiar el agujero en `carcasas.py` **antes** de imprimir |
| 10 | Cable USB | USB-A a USB-C **de datos** (Adafruit 4474), no solo de carga | Con un cable solo de carga no se puede flashear el firmware |
| 11 | Cargador | 5 V y **2 A** con salida USB-A (sirve uno de móvil) | Con 0,5–1 A el ESP32 puede reiniciarse cuando el altavoz suena fuerte |
| 12 | Montaje | Cable de silicona de 26–28 AWG, termorretráctil, cinta de espuma de doble cara de 2 mm y pegamento termofusible o cinta VHB | Sin adhesivo no se pueden fijar el micrófono, el altavoz ni el táctil; los jumpers dupont son incómodos de soldar |
| 13 | B · cargador | IP5306 con **entrada USB-C**; si es el PowerBoost 1000C, comprar también un **cable micro-USB** | El PowerBoost carga por micro-USB. El IP5306 se apaga con menos de ≈ 45–50 mA durante 32 s ([nota técnica](https://done.land/components/power/powersupplies/battery/chargers/charge-discharge/ip5306/)): desactivarlo por I2C o mantener una carga mínima |
| 14 | B · batería | Portapilas para celdas **con protección de 69–70 mm** | Muchos portapilas son para celdas de 65 mm |
| 15 | B · servos | Tira de **pines macho** para enchufar los conectores de los servos | Sin ella hay que cortar los conectores de los servos |
