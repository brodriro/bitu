# 04 · Carcasas y enclosures

> Investigación del 2026-11-16. Los precios se revisaron en 2026-11. Los tiempos y costes de impresión de nuestras propias piezas son **estimaciones**.

> **Decisión del 2026-11-17:** la carcasa de Bitu (propuesta A) es el diseño propio **Delta suave**: prisma triangular de 11,8 cm de lado con la pantalla redonda de 1,85" (Ø 5,5 cm) en el centro, 9,8 × 8,4 × 8,8 cm, 3 piezas, 87,4 g de PLA, ≈ 7,3 h **(est.)**. Diseño, comprobaciones y archivos en el [doc 09](09-carcasas.md). Los diseños de esta sección quedan como referencia.

## 1. Diseños imprimibles existentes

| Diseño | Para | Plataforma | Licencia | Notas | Enlace |
|---|---|---|---|---|---|
| Stack-chan (oficial) | M5Stack + 2 servos | GitHub (STL y fuentes) | Abierta (revisar la licencia del repo para la carcasa) | Diseño canónico "kawaii" de cabeza cúbica | [github.com/stack-chan/stack-chan](https://github.com/stack-chan/stack-chan) |
| Stack-chan Case **Takao Version** + cart | Cuerpo versión Takao | MakerWorld 2781106 | *MakerWorld Exclusive* | 5,2 h de impresión, 4 placas | [makerworld.com/en/models/2781106](https://www.makerworld.com/en/models/2781106) |
| AI Stack-chan *minimal* | M5 Atom Echo (más barato) | MakerWorld 881711 (vía 3dgo) | **BY-NC** | No permite uso comercial | [3dgo.app/models/makerworld/881711](https://3dgo.app/models/makerworld/881711) |
| Caja para kit Xiaozhi ESP32 (pantalla grande y variante 0,91") | Kit Xiaozhi | MakerWorld 1300610 | Ver la ficha | Incluye LED de "hablando" | [makerworld.com/models/1300610](https://makerworld.com/models/1300610) |
| Compañero IA de escritorio de 5 grados de libertad (Xiaozhi) | ESP32 + servos | MakerWorld 2913469 | Ver la ficha | Una impresora y un kit electrónico | [makerworld.com/models/2913469](https://makerworld.com/models/2913469) |
| Compañero infantil Xiaozhi | ESP32-S3 | MakerWorld 1613166 | Ver la ficha | Hardware abierto + firmware | [makerworld.com/models/1613166](https://makerworld.com/models/1613166) |
| Asistente con pantalla Waveshare ESP32-S3 | Waveshare | MakerWorld 2446047 | Ver la ficha | Usa xiaozhi-esp32 | [makerworld.com/models/2446047](https://makerworld.com/models/2446047) |
| Desk robot con OLED de 1,3" (ESP32-C3) | OLED + táctil | MakerWorld 2337661 | Ver la ficha | Caras animadas | [makerworld.com/en/models/2337661](https://makerworld.com/en/models/2337661) |
| Clawd Mochi (ESP32-C3 + TFT) | Mascota de menos de USD 8 | MakerWorld 2559505 | Ver la ficha | Referencia de tamaño mínimo | [makerworld.com/models/2559505](https://makerworld.com/models/2559505) |
| TN-24 V2.0 Desktop Companion | Instructables | — | Ver la página | Guía paso a paso | [instructables.com/TN-24-V20-Cute-Desktop-Companion-Robot](https://www.instructables.com/TN-24-V20-Cute-Desktop-Companion-Robot) |
| ESP-SparkBot (modelos 3D publicados) | ESP32-S3 | Gitee / GitHub esp-friends | Ver el repo | Hardware y carcasa abiertos | [Espressif blog](https://developer.espressif.com/blog/2025/04/esp32-s3-sparkbot/) |

> No encontré en Printables ni en Thingiverse un Stack-chan oficial indexado: la comunidad publica sobre todo en GitHub y MakerWorld. **Antes de usar cualquier diseño en la web o en un kit hay que revisar la licencia de cada ficha.**

## 2. Material

| Material | Pros | Contras | Recomendación |
|---|---|---|---|
| **PLA** | Fácil, barato (USD 15–22/kg), sin olor, colores pastel | Se deforma a unos 55–60 °C (coche al sol, junto a un elemento que caliente) | Prototipos y nivel A |
| **PETG** | Más resistente al calor y a los golpes, algo flexible | Hilos (*stringing*), algo más difícil | **Piezas con servos, nivel B y C, y cerca de la Pi 5** |
| TPU (95A) | Pies antideslizantes, "orejas" blandas | Lento de imprimir | Detalles |
| Resina | Acabado de juguete | Tóxica sin curar; no apta para un aula sin ventilación | No recomendada |

Precio del filamento: USD 15–22/kg en 2026 ([QIDI](https://kr.qidi3d.com/blogs/news/3d-printer-filament-pricing-cost-factors)).

## 3. Tiempo y coste de impresión (est., capa de 0,2 mm, relleno del 15 %, Bambu A1 mini o equivalente)

| Pieza o nivel | Gramos | Tiempo | Coste del material |
|---|---|---|---|
| **Nivel A: Delta suave (elegida, gramos del CAD)** | 87,4 g | ≈ 7,3 h | USD 1.75 |
| Nivel B: cabeza cúbica de ~55 mm, cuerpo y soporte pan/tilt | 150–200 g | 7–10 h | USD 2.3–4.4 |
| Nivel C (descartado para el MVP): cuerpo para Pi 5 con ventilación y cabeza | 220–300 g | 10–14 h | USD 3.5–6.6 |

Referencia real: Stack-chan Takao, 5,2 h en 4 placas ([MakerWorld](https://www.makerworld.com/en/models/2781106)).

**Servicio de impresión** (si no hay impresora): JLC3DP cobra desde USD 1 por pieza de PLA FDM, con entrega en 96 h ([JLC3DP PLA](https://jlc3dp.com/hk/help/article/pla-plastic)). Un servicio universitario de referencia cobra USD 0.06/g ([U. Waterloo](https://uwaterloo.ca/rapid-prototyping-centre/3d-printing/fdm-materials-and-cost)), es decir, USD 5–18 por robot más el envío.

**Comprar impresora para el programa:** Bambu Lab A1 mini, MSRP USD 299 (USD 199.99 en el Black Friday de nov-2026) ([stacksheriff](https://stacksheriff.com/3d-printing/bambu-lab-pricing-2/), [pricerunner](https://www.pricerunner.com/pl/1426-3310426410/3D-Printing/Bambu-lab-A1-Mini-Compare-Prices)). Se amortiza a partir de ~15–20 robots frente a un servicio externo **(est.)**.

## 4. Enclosures comerciales (sin impresora)

| Opción | Qué incluye | Precio | Fuente |
|---|---|---|---|
| **ESP32-S3-BOX-3** | Carcasa con pantalla, micrófonos, altavoz y base con soporte | USD 49.95 | [Adafruit](https://www.adafruit.com/product/5835) |
| **M5Stack CoreS3 / SE** | Carcasa de 54×54 mm con pantalla, micrófono y altavoz | USD 59.90 / 38.60 | [CNX](https://www.cnx-software.com/2024/05/31/m5stack-cores3-se-cost-down-esp32-s3-iot-controller-features-a-2-inch-touch-display-a-microsd-card-slot-a-speaker-two-microphones/) |
| Waveshare ESP32-S3-Touch-LCD-1.28**-B** | Caja metálica CNC redonda | USD 26.99 | [Waveshare](https://www.waveshare.com/product/esp32-s3-touch-lcd-1.28-b.htm) |
| M5Stack StackChan | Robot completo con carcasa | £95 | [The Pi Hut](https://thepihut.com/products/stackchan-kawaii-co-created-open-source-ai-desktop-robot) |

## 5. Corte láser (alternativa para talleres sin impresora 3D)

- **Contrachapado de 3 mm o acrílico de 3 mm** con uniones *finger-joint*: una caja cúbica de 60×60×60 mm como cabeza, con un hueco redondo de 33 mm para la GC9A01 (zona activa de ~32,4 mm) y un recorte de 40×30 mm para la IPS de 2".
- Ventajas: corte en minutos y bajo coste por pieza en un FabLab **(est. USD 2–5 por robot)**.
- Contras: estética más "caja"; los ángulos de pan/tilt requieren soportes impresos o comprados (soportes metálicos para SG90).
- Generador de cajas gratuito: boxes.py o MakerCase (no verificados en esta investigación).

## 6. Dimensiones de diseño recomendadas (est., según las fichas de los componentes)

| Elemento | Dimensión de referencia |
|---|---|
| Pantalla redonda táctil de 1,85" (elegida) | Vidrio Ø 5,5 cm, área activa Ø 4,57 cm, 0,91 cm de grueso (plano de Waveshare) |
| Pantalla redonda GC9A01 de 1,28" (anterior) | Diámetro visible de ~32 mm; PCB de ~38–40 mm de diámetro (medir el módulo concreto) |
| IPS 2" ST7789 (Adafruit 4311) | PCB de ~46×35 mm (medir) |
| ESP32-S3 DevKitC-1 | ~63×25 mm (más ~5 mm si va con cabeceras) |
| Altavoz cerrado de 3 W (Adafruit 4445) | ~30×20×10 mm **(verificar)** |
| SG90 | 22,5×12×29 mm (pestañas de 32 mm) |
| 18650 | 18×65 mm (portapilas de ~21×77 mm) |
| **Cabeza del nivel A** | Esfera o cilindro de 65–75 mm, pantalla frontal inclinada 10–15° hacia arriba, rejilla de altavoz trasera o inferior (el micrófono **lejos** del altavoz, ≥30 mm, para reducir el eco) |
| **Nivel B** (tipo Stack-chan) | Cabeza de ~55×55×50 mm sobre cuello pan/tilt, base de ~70×70×45 mm con la 18650 |
| Agujero del micrófono | 1,5–2 mm alineado con el puerto acústico del INMP441 (**verificar en qué cara del módulo está el orificio** antes de diseñar; sellar alrededor con una junta de espuma) |
| Tornillería | M2 para pantallas y M2.5 para placas. Insertos térmicos en PETG |
| Ventilación (Pi 5) | Ranuras sobre el Active Cooler con ≥6 cm² de área libre **(est.)** |
