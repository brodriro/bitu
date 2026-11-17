# 08 · Modelo 3D y simulación de ensamblaje

> **Actualización del 2026-11-17 (versión 3 de la simulación):** la simulación de montaje usa ya la carcasa elegida, **Delta suave**, cargada del GLB que genera `tools/carcasas/carcasas.py` (doc 09), y la pantalla redonda táctil de **1,85"** (pieza `lcd185`). La cabeza cúbica de 70 mm y la GC9A01 de 1,28" salen de la simulación y de la galería. La galería «Todas las piezas» solo muestra las piezas de A y B, con medidas en centímetros: las de A′, C y la alternativa AMOLED se retiraron con el catálogo (sus funciones de modelado siguen en `web/modelo3d.js` por si se reactivan).

> 2026-11-16. Implementado en `web/modelo3d.js` (Three.js 0.160, sin build). Las piezas se modelan con primitivas a escala real en milímetros a partir de las medidas de los docs 02 y 04 y de las fichas de producto; es un modelo **de referencia para entender el montaje**, no un CAD de fabricación. Las medidas marcadas **(est.)** no se verificaron con la pieza física.

## Piezas modeladas (mm) · medidas de la ficha o del plano del modelo exacto

Revisión del 2026-11-16: cada pieza se modela con las medidas publicadas del **modelo concreto** que está en el catálogo (`tools/precios/catalogo.json`, campos `modelo`, `medidas` y `fuente_medidas`). Donde no hay plano oficial se dice.

| Pieza (modelo exacto) | Medidas | Fuente |
|---|---|---|
| Espressif ESP32-S3-DevKitC-1-N16R8 v1.1 | PCB 62,74 × 25,4; filas de pines a 22,86 entre centros (9 × 2,54; pines a 1,27 del borde); 2 × 22 pines a 2,54. *Corregido el 2026-11-17: antes ponía 21,6, que no cae en la rejilla de 2,54* | [Plano DXF de Espressif](https://dl.espressif.com/dl/schematics/esp_idf/DXF_ESP32-S3-DevKitC-1_V1.1_20220429.pdf) (capa BOARD_OUTLINE) |
| **Waveshare 1.85inch Touch LCD Module (ST77916)** · cara de A desde el 2026-11-17 | Vidrio Ø 55 × 0,7; área activa Ø 45,68; fondo total 9,1 (con separadores M2 de 4); 3 agujeros M2 (29,7 entre los inferiores) | [Plano de Waveshare](https://www.waveshare.com/1.85inch-touch-lcd-module.htm) |
| Waveshare 1.28inch LCD Module (GC9A01) · archivada (ya no se usa en la simulación) | PCB Ø 37,5; 40,4 con la lengüeta; área activa Ø 32,4 | [Waveshare](https://www.waveshare.com/1.28inch-lcd-module.htm) |
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
| Carcasa Delta suave (A) | Diseño propio: prisma triangular de 11,8 cm de lado y 7 cm de fondo en dos mitades (pared 2 mm), marco de pantalla a 12°. Mallas reales del CAD (`web/modelos/carcasa-delta-suave.glb`) | Doc 09 |
| Placa perforada | 60 × 40 recortada de una 5 × 7 cm | Doc 02 §7 |
| Adafruit 4474 cable USB-A a USB-C (galería y paso 8) | Conector de 8,3 × 2,4 con funda de 12 × 6,5; cable de Ø 3,4 | Proporciones aproximadas (sin plano oficial) |

**Correcciones respecto a la versión anterior del modelo:** el altavoz de 3 W se había modelado como 30 × 20 × 10 y mide 70 × 31 × 17 (se sustituye en A y B por el de cavidad de 30 × 20 × 5,5); el táctil pasaba de 24 × 15 a 15 × 11; la pantalla IPS de 2" de 46 × 35 a 59,2 × 35,5; la GC9A01 de Ø 39 a Ø 37,5; las filas de pines del DevKit de 22,8 a 21,6 mm (cambio erróneo: el plano de Espressif da 22,86 mm, corregido el 2026-11-17); el Active Cooler de 40 × 30 × 8 a 63,5 × 42,5 × 13,7; la fuente de 27 W de 52 × 40 × 30 a 68,9 × 51,7 × 35,6.

## Disposición de la propuesta A dentro de la Delta suave

Coordenadas de la escena en mm: origen en el centro de la base, y hacia arriba, frente hacia +Z (el CAD usa z hacia arriba y frente hacia −Y). Todas las posiciones salen de `diseno_delta_suave()` en `tools/carcasas/carcasas.py`. El prisma se apoya directamente en la mesa, sin base. La junta entre mitades es el plano vertical z = 0: la mitad trasera hace de chasis.

- **Placa perforada** horizontal sobre cuatro postes de 3 mm (cara inferior a y = 5 mm), centrada en x = −7,5 y z = −4: dos postes en cada mitad. Lleva dos tiras de cabeceras hembra.
- **DevKit** encima, con el plástico de 2,5 mm de sus pines macho sobre las hembras (cara inferior a y = 17,6). Los dos USB-C miran a la cara izquierda: su boca queda a 4,9 mm de la pared, frente a una ventana de 2,55 × 0,7 cm por la que entra también la funda del cable.
- **INMP441** pegado por dentro de la cara inclinada izquierda (mitad frontal), a 6,85 cm de altura, con el puerto sobre el agujero de Ø 2 mm y los pines hacia dentro.
- **Táctil TTP223** en la cara inclinada derecha (mitad trasera), a la misma altura, bajo la marca anular: se toca a través de 2 mm de PLA.
- **Altavoz de cavidad 8 Ω 2 W** contra la cara trasera, centrado a 3,4 cm de altura frente a la rejilla. **MAX98357A** encima del DevKit, sobre cinta de espuma de doble cara de 2 mm, con la bornera hacia el altavoz. Distancia micrófono–altavoz: 5,4 cm (doc 04 pide ≥ 3 cm).
- **Pantalla de 1,85"** en el centroide del triángulo frontal (3,4 cm sobre la mesa), **inclinada 12° hacia arriba**, asentada en el marco de la mitad frontal. El cable GH1.25 sale del conector trasero.
- **Cierre:** la mitad frontal tiene tres columnas con insertos M2,5 (dos esquinas inferiores y la superior). La mitad trasera es hueca, así que los **tres tornillos M2,5 × 40** entran por detrás y cruzan ≈ 3,3 cm hasta la columna. La **antena «bit»** se encaja en la cima.
- **Cableado** según la tabla de pines de la propuesta A (doc 05). Cada cable sale del pin de su módulo y termina en la placa perforada, en la columna del pin correspondiente del DevKit. Los de la fila trasera (J1) bajan por el pasillo entre el amplificador y el altavoz; los de la delantera (J3), por delante del DevKit:

| Módulo | Señal → GPIO | Alimentación | Recorrido |
|---|---|---|---|
| INMP441 | WS → 4, SCK → 5, SD → 6 | VDD → 3V3; GND y L/R → GND | Cara izquierda y pasillo trasero |
| MAX98357A | DIN → 7, BCLK → 15, LRC → 16 | VIN → 5V; GND → GND | Sobre la bornera y pasillo trasero; altavoz a la bornera |
| Pantalla 1,85" (13 hilos del cable de 15) | CLK → 21, CS → 41, IO0–IO3 → 47 · 40 · 42 · 2, RST → 39, BL → 14, TP SDA · SCL · INT → 8 · 9 · 10 (**sin probar**) | VCC → 3V3; GND → GND | Por detrás de la pantalla; QSPI a J3 por delante, I2C y BL por encima del amplificador a J1 |
| TTP223 | OUT → 1 | VCC → 3V3; GND → GND | Cara derecha |

La **posición de cada GPIO en las cabeceras** (J1 en la fila trasera, J3 en la delantera, pin 1 en el extremo de la antena) sigue el pinout de Espressif para el DevKitC-1 y **no se ha verificado con la placa física**: hay que comprobarla con la serigrafía antes de soldar. Los pines de 3V3 y GND que se repiten van a agujeros contiguos de la placa, unidos por debajo.

## Secuencia de la simulación

| Paso | Qué ocurre | Pieza nueva |
|---|---|---|
| 0 | Despiece: todas las piezas sobre la mesa, alrededor del punto de montaje | — |
| 1 | La carcasa trasera (chasis) se apoya de pie | Carcasa trasera |
| 2 | La placa perforada con las cabeceras hembra se apoya en los postes | Placa perforada |
| 3 | El ESP32-S3 se encaja en las cabeceras, con los USB-C frente a la ventana | ESP32-S3-DevKitC-1 |
| 4 | Micrófono contra la cara izquierda y sus cables (I2S, alimentación y puente L/R–GND) | INMP441 |
| 5 | Altavoz a la cara trasera y amplificador sobre el DevKit, con su cableado | MAX98357A, altavoz |
| 6 | Pantalla de 1,85" inclinada 12° al frente y táctil en la cara derecha, con su cableado | Pantalla 1,85", TTP223 |
| 7 | Cierra la carcasa frontal, 3 tornillos M2,5 × 40 por detrás y la antena «bit» | Carcasa frontal, tornillos, antena |
| 8 | Encendido: entra el USB-C por la ventana lateral, se enciende la retroiluminación y Bitu abre los ojos, parpadea y saluda | Cable USB-C |

En los pasos 4 y 6 el micrófono y la pantalla se muestran ya en su posición final para poder ver el cableado. En el montaje real van en la mitad frontal: se pegan o encajan en ella antes de cerrar. Los pasos de software (flasheo, servidor propio, system prompt, prueba de voz) están en el doc 05 y ocurren antes del paso 7.

**Hallazgos al pasar la simulación a la Delta suave (2026-11-17):**
- En el CAD faltaba el plástico de 2,5 mm de los pines macho del DevKit. Se añadió (`plastico_macho`), así que los USB-C y el amplificador suben 2,5 mm.
- Con la placa centrada, los USB-C quedaban a 12 mm de la pared y la punta de un cable normal no llegaba. La placa se desplazó 7,5 mm a la izquierda; más allá choca con la columna de tornillo inferior. Las dos ranuras se unieron en una ventana que deja pasar la funda del cable.
- Las columnas de tornillo solo existen en la mitad frontal: hacen falta tornillos M2,5 × 40, o columnas también en la trasera, que es una mejora a valorar en la impresión de prueba.

## Cómo se anima (versión 2, 2026-11-16; carcasa Delta suave desde la versión 3)

- **Movimiento:** cada pieza sale de su sitio en la mesa, vuela por una curva de Bézier hasta un punto de aproximación, entra por su eje de inserción y hace un pequeño rebote al asentar. Los tornillos giran mientras entran (8 vueltas visibles; no es el número real de vueltas de una rosca M2,5). Los cables crecen del módulo al pin, uno tras otro.
- **Cámara:** encuadra cada paso por fotogramas clave (en el paso 7 rodea el prisma para ver los tornillos). Si se arrastra la vista, el encuadre automático se detiene hasta el paso siguiente.
- **Resaltado:** las piezas del paso en curso brillan con un pulso suave y llevan una etiqueta con su nombre; el resto se atenúa un poco.
- **Despiece:** las piezas se reparten en U alrededor del punto de montaje (carcasas a los lados, electrónica delante), de modo que ninguna tapa a otra.
- **Encendido:** retroiluminación, ojos, parpadeo y boca de «hola»; la textura de la cara solo se redibuja cuando cambia.
- **Accesibilidad y rendimiento:** con `prefers-reduced-motion` se muestra el montaje terminado, sin pulso ni giro; solo se renderiza con el visor en pantalla; pines y rejillas van instanciados y las sombras se recalculan solo cuando algo se mueve.
- La versión 1 se conserva en `web/modelo3d-v1.js`: para volver, cambiar `modelo3d.js` por `modelo3d-v1.js` en el `<script type="module">` de `web/index.html`.

## Exportación

El visor exporta la escena actual (ensamblaje o pieza seleccionada) a **.glb** para abrirla en Blender, Fusion o un visor 3D. No es un STL imprimible: los STL de la carcasa están en `cad/carcasas/delta-suave/` (doc 09).
