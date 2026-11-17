# 08 · Modelo 3D y simulación de ensamblaje

> 2026-11-16. Implementado en `web/modelo3d.js` (Three.js 0.160, sin build). Las piezas se modelan con primitivas a escala real en milímetros a partir de las medidas de los docs 02 y 04 y de las fichas de producto; es un modelo **de referencia para entender el montaje**, no un CAD de fabricación. Las medidas marcadas **(est.)** no se verificaron con la pieza física.

## Piezas modeladas (mm) · medidas de la ficha o del plano del modelo exacto

Revisión del 2026-11-16: cada pieza se modela con las medidas publicadas del **modelo concreto** que está en el catálogo (`tools/precios/catalogo.json`, campos `modelo`, `medidas` y `fuente_medidas`). Donde no hay plano oficial se dice.

| Pieza (modelo exacto) | Medidas | Fuente |
|---|---|---|
| Espressif ESP32-S3-DevKitC-1-N16R8 v1.1 | PCB 62,87 × 25,4; filas de pines a 21,6 entre centros; 2 × 22 pines a 2,54 | [Plano DXF de Espressif](https://dl.espressif.com/dl/schematics/esp_idf/DXF_ESP32-S3-DevKitC-1_V1.1_20220429.pdf) (capa BOARD_OUTLINE) |
| Waveshare 1.28inch LCD Module (GC9A01) | PCB Ø 37,5; 40,4 con la lengüeta; área activa Ø 32,4 | [Waveshare](https://www.waveshare.com/1.28inch-lcd-module.htm) |
| Módulo INMP441 redondo | Ø 14 × 2,2 | [Open-Electronics](https://oe2.open-electronics.org/?p=46708) |
| Adafruit 3006 MAX98357A | 19,4 × 17,8 × 3,0 | [Adafruit](https://www.adafruit.com/product/3006) |
| **Altavoz de cavidad 8 Ω 2 W (Waveshare)** | 30 × 20 × 5,5 | [Waveshare](https://www.waveshare.com/8ohm-2w-speaker.htm) |
| Módulo TTP223 | 15 × 11 | [Open-Electronics](https://oe2.open-electronics.org/?p=42454) |
| Adafruit 4311 IPS 2" ST7789 | 59,2 × 35,5 × 3,7 | [Adafruit](https://www.adafruit.com/product/4311) |
| TowerPro SG92R (Adafruit 169) | 23 × 11 × 29 | [Adafruit](https://www.adafruit.com/product/169) |
| Adafruit 3317 VL53L0X | 21 × 18 × 2,8 | [Adafruit](https://www.adafruit.com/product/3317) |
| Adafruit 3886 MPU-6050 | 26 × 17,8 × 4,6 | [Adafruit](https://www.adafruit.com/product/3886) |
| Adafruit 1781 18650 2200 mAh | 69 × Ø 18 (con protección) | [Adafruit](https://www.adafruit.com/product/1781) |
| Adafruit 2465 PowerBoost 1000C | 45 × 23 × 10 con USB-A | [Adafruit](https://www.adafruit.com/product/2465) |
| Raspberry Pi 5 | 85 × 56 | [Raspberry Pi](https://www.raspberrypi.com/products/raspberry-pi-5/) |
| Raspberry Pi Active Cooler | 63,5 × 42,5 × 13,7 | [Product brief](https://www.electrokit.com/upload/quick/85/54/63f9_41036302-tds.pdf) |
| Raspberry Pi 27 W USB-C (Adafruit 5814) | 68,9 × 51,7 × 35,6 | [Adafruit](https://www.adafruit.com/product/5814) |
| Adafruit 4445 altavoz 3 W 4 Ω (solo C) | 70 × 31 × 17 | [Adafruit](https://www.adafruit.com/product/4445) |
| Waveshare ESP32-S3-Touch-AMOLED-1.75 (alternativa) | Ø 48,96 × 10,4 | [Core Electronics](https://core-electronics.com.au/esp32-s3-1-75inch-amoled-round-touch-display-development-board.html) |
| Seeed ReSpeaker Lite | 86 × 35 **sin plano oficial localizado** | — |
| Espressif ESP32-S3-BOX-3 | **sin plano oficial localizado** (proporciones aproximadas) | — |
| Carcasa impresa (A) | Diseño propio: cabeza 70 × 70 × 70 en dos mitades (pared 2 mm), marco de pantalla a 12° | Doc 04 §6 |
| Placa perforada | 60 × 40 recortada de una 5 × 7 cm | Doc 02 §7 |

**Correcciones respecto a la versión anterior del modelo:** el altavoz de 3 W se había modelado como 30 × 20 × 10 y mide 70 × 31 × 17 (se sustituye en A y B por el de cavidad de 30 × 20 × 5,5); el táctil pasaba de 24 × 15 a 15 × 11; la pantalla IPS de 2" de 46 × 35 a 59,2 × 35,5; la GC9A01 de Ø 39 a Ø 37,5; las filas de pines del DevKit de 22,8 a 21,6 mm; el Active Cooler de 40 × 30 × 8 a 63,5 × 42,5 × 13,7; la fuente de 27 W de 52 × 40 × 30 a 68,9 × 51,7 × 35,6.

## Disposición de la propuesta A dentro de la cabeza

Cabeza de 70 mm en dos mitades **huecas** (pared de 2 mm, interior de 66 mm), apoyada en la base (Ø 52 × 10). La mitad trasera hace de chasis: todo menos la pantalla se fija a ella.

- **Placa perforada** horizontal sobre cuatro postes de 3 mm (dos por mitad), cara inferior a y = 15 mm, con dos tiras de cabeceras hembra; el **DevKit** se encaja encima, con los USB-C hacia el lateral izquierdo (una ranura en cada mitad de la carcasa).
- **INMP441** pegado al techo de la mitad trasera, con el puerto bajo el agujero de micrófono (Ø 2 mm) y la cabecera hacia el interior.
- **Táctil TTP223** también en el techo trasero, al otro lado, bajo la marca rosa: se toca a través de 2 mm de PLA.
- **Altavoz de cavidad 8 Ω 2 W (30 × 20 × 5,5)** contra la pared trasera, frente a la rejilla; **MAX98357A** a su lado en la misma pared. Distancia micrófono–altavoz en el modelo: ≈ 41 mm entre centros (doc 04 pide ≥ 30 mm).
- **GC9A01** en la cara frontal, **inclinada 12° hacia arriba** (doc 04 recomienda 10–15°). La mitad frontal lleva un marco tubular inclinado (Ø 43 exterior) con un escalón que sujeta el PCB; por la inclinación, el marco sobresale ≈ 9 mm por abajo y queda a ras por arriba. La lengüeta del conector queda arriba, dentro de la cabeza, y la imagen se gira 180° por software. **(est.)**: geometría del marco sin validar en una impresión.
- **Antena «bit»** encajada en el techo de la mitad trasera; **4 tornillos M2,5** entran por la cara trasera. El modelo no detalla las torretas ni los insertos térmicos (se definirán con la carcasa definitiva).
- **Cableado** según la tabla de pines verificada de la propuesta A (doc 05). Cada cable sale del pin de su módulo, va pegado a una pared y termina en la placa perforada, en la columna del pin correspondiente del DevKit:

| Módulo | Señal → GPIO | Alimentación | Recorrido |
|---|---|---|---|
| INMP441 | WS → 4, SCK → 5, SD → 6 | VDD → 3V3; GND y L/R → GND | Techo y pared derecha |
| MAX98357A | DIN → 7, BCLK → 15, LRC → 16 | VIN → 5V; GND → GND | Pared trasera; altavoz a la bornera |
| GC9A01 | SDA → 47, SCL → 21, DC → 40, RES → 45, CS → 41, BLK → 42 | VCC → 3V3; GND → GND | Cinta por detrás de la pantalla |
| TTP223 | OUT → 1 | VCC → 3V3; GND → GND | Techo, pared trasera y esquina derecha |

La **posición de cada GPIO en las cabeceras** (J1 en la fila trasera, J3 en la delantera, pin 1 en el extremo de la antena) sigue el pinout de Espressif para el DevKitC-1 y **no se ha verificado con la placa física**: comprobar con la serigrafía antes de soldar. El orden de pines de los módulos INMP441 y TTP223 es **(est.)**.

## Secuencia de la simulación

| Paso | Qué ocurre | Pieza nueva |
|---|---|---|
| 0 | Despiece: todas las piezas sobre la mesa, alrededor del punto de montaje | — |
| 1 | La base y, encima, la carcasa trasera (chasis) | Base, carcasa trasera |
| 2 | La placa perforada con las cabeceras hembra se apoya en los postes | Placa perforada |
| 3 | El ESP32-S3 se encaja en las cabeceras | ESP32-S3-DevKitC-1 |
| 4 | Micrófono al techo y sus cables (I2S, alimentación y puente L/R–GND) | INMP441 |
| 5 | Altavoz y amplificador a la pared trasera, con su cableado | MAX98357A, altavoz |
| 6 | Pantalla inclinada 12° al frente y táctil al techo, con su cableado | GC9A01, TTP223 |
| 7 | Cierra la carcasa frontal, 4 tornillos M2,5 por detrás y la antena «bit» | Carcasa frontal, tornillos, antena |
| 8 | Encendido: entra el USB-C, se enciende la retroiluminación y Bitu abre los ojos, parpadea y saluda | Cable USB-C |

Cambio respecto a la versión 1: la carcasa trasera y la base pasan del paso 6 al paso 1, para que cada pieza tenga dónde apoyarse al colocarla. En el paso 6 la pantalla se muestra ya en su posición final para poder ver el cableado; en el montaje real se encaja primero en el marco de la mitad frontal. Los pasos de software (flasheo, servidor propio, system prompt, prueba de voz) están en el doc 05 y ocurren antes del paso 7.

## Cómo se anima (versión 2, 2026-11-16)

- **Movimiento:** cada pieza sale de su sitio en la mesa, vuela por una curva de Bézier hasta un punto de aproximación, entra por su eje de inserción y hace un pequeño rebote al asentar. Los tornillos giran mientras entran (8 vueltas visibles; no es el número real de vueltas de una rosca M2,5). Los cables crecen del módulo al pin, uno tras otro.
- **Cámara:** encuadra cada paso por fotogramas clave (en el paso 7 rodea la cabeza para ver los tornillos). Si se arrastra la vista, el encuadre automático se detiene hasta el paso siguiente.
- **Resaltado:** las piezas del paso en curso brillan con un pulso suave y llevan una etiqueta con su nombre; el resto se atenúa un poco.
- **Despiece:** las piezas se reparten en U alrededor del punto de montaje (carcasas a los lados, electrónica delante), de modo que ninguna tapa a otra.
- **Encendido:** retroiluminación, ojos, parpadeo y boca de «hola»; la textura de la cara solo se redibuja cuando cambia.
- **Accesibilidad y rendimiento:** con `prefers-reduced-motion` se muestra el montaje terminado, sin pulso ni giro; solo se renderiza con el visor en pantalla; pines y rejillas van instanciados y las sombras se recalculan solo cuando algo se mueve.
- La versión 1 se conserva en `web/modelo3d-v1.js`: para volver, cambiar `modelo3d.js` por `modelo3d-v1.js` en el `<script type="module">` de `web/index.html`.

## Exportación

El visor exporta la escena actual (ensamblaje o pieza seleccionada) a **.glb** para abrirla en Blender, Fusion o un visor 3D. No es un STL imprimible: la carcasa definitiva se diseñará aparte (plan de mejora, fase 2).
