# 07 · Precios exactos de las piezas (lectura automática)

> Ejecutado el 2026-11-16 con `tools/precios/scrape_precios.py`. Datos crudos en `precios/ultimo.json` e informe en `precios/informe-2026-11-16.md`. Precios en USD sin envío ni impuestos.

## Cómo se obtuvieron

- Un script en Python (solo biblioteca estándar) lee la **página de producto** de cada pieza y extrae el precio de los datos estructurados (JSON-LD o metadatos `og:price`). Las monedas se convierten a USD con open.er-api.com.
- Reglas: respeta `robots.txt` y `Crawl-delay`, hace una petición por URL con ≥ 4 s entre peticiones al mismo dominio y se identifica con un User-Agent propio. Si una tienda responde 403/429 o una verificación anti-bot, se marca **bloqueado** y no se reintenta ni se intenta esquivar.
- El catálogo (qué pieza, cuántas por propuesta, de qué tiendas) está en `tools/precios/catalogo.json`. Para repetir la lectura: `python3 tools/precios/scrape_precios.py`.

El mismo script genera `web/catalogo-datos.js`, que alimenta la sección **Catálogo de piezas** de la web: foto de la tienda (enlazada, no copiada), uso, cantidad por propuesta y, por tienda, precio, conversión a USD, estado de lectura y disponibilidad. Los precios anotados a mano desde búsqueda web figuran en `catalogo.json` como fuentes `"manual"` y se muestran como «Búsqueda web»; no cuentan para el «Retail leído hoy».

## Totales por propuesta

| Propuesta | Retail leído hoy | Retail del doc 05 | Barato (est.) |
|---|---|---|---|
| **A** · Básico | **USD 65,85** | USD 49,80 | USD 21,80 |
| **A′** · BOX-3 sin soldar | **USD 51,95** | USD 51,95 | — |
| **B** · Expresivo | **USD 140,90** | USD 133,45 | USD 39,20 |
| **C** · Autónomo local | **USD 312,46** | USD 312,46 | — |

**Por qué la A sale más cara que en el doc 05:** las únicas tiendas que se pudieron leer automáticamente son Adafruit. Allí el ESP32-S3-DevKitC-1 cuesta USD 19,95 (frente a USD 12,50 de un clon en Walmart) y la pantalla GC9A01 USD 17,50 (frente a USD 8,90 en DisplayModule). Las fuentes más baratas del doc 05 bloquean la lectura automática, así que no se pudieron confirmar hoy. El INMP441 sigue con el precio del doc (USD 4,95) porque ninguna de sus tres tiendas respondió.

## Hallazgos que cambian decisiones

1. **ESP32-S3-DevKitC-1-N8R8 está «Discontinued» en Adafruit** (USD 19,95), y Adafruit no vende la N16R8 que pide xiaozhi. La placa de la A hay que comprarla a un distribuidor de Espressif o como clon N16R8.
2. **ESP32-S3-BOX-3 «OutOfStock» en Adafruit** (USD 49,95). La variante A′ del plan (3 unidades de demo, fase 1) necesita otra tienda o esperar reposición.
3. **18650 2200 mAh (Adafruit 1781) «OutOfStock»**: afecta solo a la B.
4. **Raspberry Pi 5 de 8 GB: USD 200, en stock**, igual que en el doc 02; la fuente de 27 W (14,04) y el Active Cooler (13,50), también en stock.
5. El resto de los precios de Adafruit coincide con el doc 02: MAX98357A 5,95 · altavoz 3,95 · AT42QT1010 5,95 · SG92R 5,95 · VL53L0X 14,95 · MPU-6050 12,95 · PowerBoost 1000C 19,95 · IPS 2" 19,95.

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
| INMP441 | [ShillehTek](https://shillehtek.com/products/inmp441-i2s-omnidirectional-microphone-module-with-soldering) | USD 9,99 (pre-soldado; 9,50 desde 5 u.) |
| INMP441 | [Vetco](https://vetco.net/products/omnidirectional-microphone-module-inmp441-high-precision-i2s) | USD 4,95 |
| INMP441 | [Bits & Parts](https://www.bitsandparts.nl/en/inmp441-mems-i2s-microphone-module-p1924326) | € 3,75 |
| INMP441 | [Fruugo CA](https://www.fruugo.ca/inmp441-omnidirectional-mems-microphone-module-high-precision-low-power-i2s-interface-esp32-compatible-6-pack/p-394132981) | CAD 20,95 por 6 |
| GC9A01 1,28" | [DisplayModule](https://www.displaymodule.com/products/1-28-240-x-240-round-tft-spi) | USD 8,90 |
| GC9A01 1,28" | [Walmart](https://www.walmart.com/ip/1-28Inch-Round-Display-LCD-Screen-Module-GC9A01-SPI-Communication-RGB-65K-Color-Support-for-Raspberry/17303960632) | USD 10,66 |
| GC9A01 1,28" | [Alibaba](https://electronics.alibaba.com/product/gc9a01-display) | USD 2,10–2,80 (mín. 100 u.) |

## Recomendación de compra para el piloto (A, 5 unidades)

- **Pedido mínimo de riesgo:** comprar en Adafruit lo que está en stock y tiene precio verificado (MAX98357A, altavoz, táctil) y la placa + pantalla + micrófono como clones (AliExpress o Alibaba) para bajar a ~USD 22–30 por robot **(est.)**.
- **Antes de pedir la A′:** buscar el ESP32-S3-BOX-3 en otro distribuidor (Mouser, DigiKey o la tienda de Espressif); en Adafruit no hay stock.
- Repetir `scrape_precios.py` la semana del pedido; si alguna tienda ofrece API oficial (Mouser y DigiKey la tienen, con clave gratuita), es la forma correcta de automatizar los precios de los distribuidores.
