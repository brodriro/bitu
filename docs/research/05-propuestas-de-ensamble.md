# 05 · Propuestas de ensamble

> Investigación del 2026-11-16. Precios verificados en 2026-11 (fuentes en el [doc 02](02-componentes-y-precios.md)). "Barato" = clones de AliExpress **(est.)**; "Retail" = tiendas verificadas (Adafruit, Walmart, DisplayModule, RobotShop).

## Comparativa rápida

| | **A · Básico (cliente ligero)** | **B · Expresivo** | **C · Autónomo local** |
|---|---|---|---|
| Cerebro | ESP32-S3 N16R8 + servidor | ESP32-S3 N16R8 + servidor | Raspberry Pi 5 de 8 GB |
| Cara | Redonda de 1,28" (GC9A01) | IPS de 2" (ST7789) | IPS de 2" (ST7789) |
| Movimiento | — | Cuello pan/tilt (2 servos) | — (opcional) |
| Energía | USB-C 5 V | 18650 + IP5306 o USB-C | Fuente de 27 W |
| Coste barato / retail | **≈ USD 22 / 49** | **≈ USD 39 / 132** | **≈ USD 312** (solo retail) |
| Dificultad | ★★☆☆☆ | ★★★★☆ | ★★★☆☆ (software ★★★★) |
| Tiempo de montaje | 3–5 h + 4 h de impresión | 8–12 h + 10 h de impresión | 4–6 h + 12 h de impresión |
| Latencia de respuesta (est.) | 1,5–3 s | 1,5–3 s | 3–8 s |
| Coste de nube | ~USD 0.9/mes (doc 03) | ídem | USD 0 |

---

## Propuesta A · "Básico ESP32-S3 thin client" (USD 22–50)

Se basa en la placa `bread-compact-wifi-lcd` de **xiaozhi-esp32**, con el firmware oficial y sin escribir código para la primera versión.

### BOM

| # | Ítem | Barato (est.) | Retail |
|---|---|---|---|
| 1 | ESP32-S3-DevKitC-1 N16R8 | 7 | 12.50 |
| 1 | Pantalla redonda GC9A01 de 1,28" (SPI) | 3.5 | 8.90 |
| 1 | Micrófono INMP441 | 1.8 | 4.95 |
| 1 | Amplificador MAX98357A | 2 | 5.95 |
| 1 | Altavoz de cavidad 8 Ω 2 W (Waveshare, 30 × 20 × 5,5 mm) | 1.5 | 2.99 |
| 1 | Sensor táctil TTP223 (opcional: push-to-talk) | 0.4 | 5.95 |
| — | Carcasa PLA (~80 g), cables, perfboard, tornillos | 5.6 | 7.6 |
| | **Total** | **≈ 22** | **≈ 49** |

Variante **A′ sin soldar:** ESP32-S3-BOX-3 (USD 49.95) + soporte impreso = **≈ USD 52**. El firmware xiaozhi es oficial para esta placa.

### Cableado (verificado en `main/boards/bread-compact-wifi-lcd/config.h` de [xiaozhi-esp32](https://github.com/78/xiaozhi-esp32), 2026-11-16)

| Módulo | Pin del módulo | GPIO del ESP32-S3 |
|---|---|---|
| INMP441 | WS | **GPIO 4** |
| INMP441 | SCK | **GPIO 5** |
| INMP441 | SD | **GPIO 6** |
| INMP441 | L/R | GND (canal izquierdo) |
| INMP441 | VDD / GND | 3V3 / GND |
| MAX98357A | DIN | **GPIO 7** |
| MAX98357A | BCLK | **GPIO 15** |
| MAX98357A | LRC | **GPIO 16** |
| MAX98357A | VIN / GND | 5V (VBUS) / GND |
| MAX98357A | Salidas + / − | Altavoz de 4 Ω |
| GC9A01 | SDA (MOSI) | **GPIO 47** |
| GC9A01 | SCL (CLK) | **GPIO 21** |
| GC9A01 | DC | **GPIO 40** |
| GC9A01 | RES | **GPIO 45** |
| GC9A01 | CS | **GPIO 41** |
| GC9A01 | BLK (retroiluminación) | **GPIO 42** |
| GC9A01 | VCC / GND | 3V3 / GND |
| Botón BOOT de la placa | — | GPIO 0 (pulsar para hablar o configurar el Wi-Fi) |
| TTP223 (opcional) | OUT | GPIO libre (p. ej. GPIO 1); requiere ajustar `config.h` |

> La variante con OLED (`bread-compact-wifi`) usa I2C SDA = GPIO 41 y SCL = GPIO 42, y botón táctil en GPIO 47. **No mezclar pines de las dos variantes.**

### Pasos de ensamble

1. **Probar en protoboard primero** (siguiendo el [tutorial oficial](https://docs.xiaozhi.me/en/hardware/breadboard-esp32-s3.html)): conectar el micrófono, el amplificador y la pantalla según la tabla.
2. Flashear el firmware xiaozhi para `bread-compact-wifi-lcd` (con el flasheador web o ESP-IDF 5.4+) y seleccionar la pantalla GC9A01.
3. Configurar el Wi-Fi desde el portal cautivo del ESP32 y **apuntar el OTA/WebSocket al servidor propio** (`xiaozhi-esp32-server` en un PC o VPS) en lugar del servidor público.
4. En el servidor, configurar el ASR (FunASR u OpenAI), el LLM (Claude Haiku 5.5 u Ollama), el TTS y el **system prompt para adolescentes** (doc 03 §9).
5. Probar la voz y ajustar la ganancia. Separar el micrófono del altavoz.
6. Pasar a placa perforada: soldar cabeceras hembra para el DevKit y los módulos, y cablear con hilo AWG 26–28.
7. Imprimir la carcasa (doc 04), insertar los tornillos M2/M2.5 y montar la pantalla, el altavoz (con rejilla) y el agujero del micrófono.
8. Cerrar, hacer una prueba de 30 min y una prueba de *red teaming* del contenido.

**Herramientas:** soldador de 60 W con regulación, estaño 63/37 con flux, pinzas, pelacables, multímetro, protoboard, PC con Chrome o ESP-IDF e impresora 3D o servicio de impresión.

**Pros:** el más barato, firmware maduro (~33 000 estrellas, MIT), latencia baja, se actualiza el "cerebro" sin tocar el hardware y apto para talleres de 1–2 sesiones.
**Contras:** sin batería ni movimiento; depende del Wi-Fi y del servidor; personalizar las caras exige compilar.

---

## Propuesta B · "Expresivo" (cara IPS + cuello pan/tilt, USD 39–133)

Inspirada en Stack-chan. Mismo modelo cliente-servidor, pero con firmware **personalizado**: hay que añadir el control de servos vía herramientas MCP (el README de xiaozhi lista placas con servos, como el "ESP-HI Low Cost Robot Dog", que sirven de referencia).

### BOM

| # | Ítem | Barato (est.) | Retail |
|---|---|---|---|
| 1 | ESP32-S3 N16R8 | 7 | 12.50 |
| 1 | IPS de 2" ST7789 320×240 | 5 | 19.95 |
| 2 | Servo SG90/SG92R (o 2× STS3032 a USD 41.66) | 3 | 11.90 |
| 1 | INMP441 | 1.8 | 4.95 |
| 1 | MAX98357A + altavoz de cavidad 8 Ω 2 W | 3.5 | 8.94 |
| 1 | VL53L0X (detectar a la persona) | 3 | 14.95 |
| 1 | MPU-6050 (detectar si lo levantan o lo agitan) | 2 | 12.95 |
| 1 | TTP223 (caricia en la cabeza) | 0.4 | 5.95 |
| 1 | Celda 18650 de 2200 mAh con PCB de protección | 4 | 9.95 |
| 1 | Módulo IP5306 (barato) o PowerBoost 1000C (retail) | 1 | 19.95 |
| — | Interruptor, cables, tornillos, carcasa PETG (~180 g) | 8.5 | 10.5 |
| | **Total** | **≈ 39** | **≈ 132** |

### Tabla de pines (**propuesta propia**: verificar contra el pinout de la placa concreta. En la N16R8 hay que evitar GPIO 35–37, reservados a la PSRAM octal)

| Módulo | Pin | GPIO |
|---|---|---|
| INMP441 | WS / SCK / SD | 4 / 5 / 6 (igual que en A) |
| MAX98357A | DIN / BCLK / LRC | 7 / 15 / 16 (igual que en A) |
| ST7789 | MOSI / CLK / DC / RST / CS / BL | 47 / 21 / 40 / 45 / 41 / 42 (mismo bus que en A) |
| Servo pan | Señal PWM (LEDC a 50 Hz) | 17 |
| Servo tilt | Señal PWM | 18 |
| Servos | V+ | **5 V del IP5306 o PowerBoost (no del regulador de 3,3 V)** + condensador de 470 µF |
| Bus I2C (VL53L0X 0x29, MPU-6050 0x68) | SDA / SCL | 8 / 9 |
| TTP223 | OUT | 1 |
| Medición de batería | Divisor 100k/100k a ADC | 2 |
| Energía | 18650 → IP5306 → 5 V → pin 5V del DevKit, servos y MAX98357A | — |

### Pasos

1. Montar y validar el nivel A en protoboard (voz funcionando).
2. Añadir la IPS de 2" (el driver ST7789 está soportado por xiaozhi) y diseñar los ojos animados (LVGL).
3. Imprimir el soporte pan/tilt y probar los servos **con la fuente de 5 V externa**, compartiendo GND con el ESP32.
4. Firmware: registrar herramientas MCP en el dispositivo, como `mirar(pan, tilt)`, `asentir()` y `emocion(tipo)`, para que el LLM las invoque.
5. Añadir los sensores I2C: el VL53L0X activa la "mirada" al acercarse alguien y el MPU-6050 activa la reacción "¡mareado!".
6. Montar la 18650 en un portapilas dentro de la base, con el IP5306 y un interruptor. Etiquetar la polaridad.
7. Cerrar la carcasa de PETG, verificar las temperaturas en carga y que los servos no se bloqueen (limitar el ángulo por software).

**Herramientas:** las de A + cortaalambres fino, crimpadora JST o Dupont, juego de destornilladores de precisión y regulador de soldadura para insertos térmicos.

**Pros:** el más "vivo" y carismático (lección de Eilik, Emo y Stack-chan) y portátil; el LLM puede gesticular vía MCP.
**Contras:** requiere programar en C/ESP-IDF; los SG90 son ruidosos (los STS3032 son silenciosos pero suben ~USD 75); más riesgos (batería y picos de corriente); se monta en 3–4 sesiones.

---

## Propuesta C · "Autónomo local" (Raspberry Pi 5, ≈ USD 312)

Todo el pipeline corre en el robot: openWakeWord → faster-whisper tiny/base → Ollama o llama.cpp (Gemma 3 1B, Llama 3.2 1B/3B o Qwen 2.5 1.5B) → Piper. Funciona sin internet.

### BOM

| # | Ítem | Precio |
|---|---|---|
| 1 | Raspberry Pi 5 de 8 GB | 200.00 |
| 1 | Fuente oficial de 27 W USB-C | 14.04 |
| 1 | Active Cooler | 13.50 |
| 1 | microSD de 64 GB A2 | 12 (est.) |
| 1 | ReSpeaker Lite USB (2 micrófonos, AEC) | 29.12 |
| 1 | MAX98357A + altavoz de 3 W | 9.90 |
| 1 | IPS de 2" ST7789 | 19.95 |
| 1 | TTP223 / AT42QT1010 | 5.95 |
| — | Carcasa PETG + tornillos | 8 (est.) |
| | **Total** | **≈ 312** |

### Tabla de pines (numeración BCM; verificar en pinout.xyz)

| Módulo | Pin | GPIO BCM (pin físico) |
|---|---|---|
| ReSpeaker Lite | USB | Puerto USB 3 |
| MAX98357A | BCLK | GPIO 18 (12) |
| MAX98357A | LRC | GPIO 19 (35) |
| MAX98357A | DIN | GPIO 21 (40) |
| MAX98357A | VIN / GND | 5 V (2) / GND (6) |
| ST7789 | MOSI / SCLK / CS | GPIO 10 (19) / GPIO 11 (23) / GPIO 8 CE0 (24) |
| ST7789 | DC / RST / BL | GPIO 25 (22) / GPIO 27 (13) / GPIO 12 (32) |
| ST7789 | VCC / GND | 3V3 (1) / GND (9) |
| TTP223 | OUT | GPIO 17 (11) |

Para el audio de salida hay que activar el overlay I2S (`dtoverlay=max98357a` u `hifiberry-dac`) en `config.txt`.

### Pasos

1. Instalar Raspberry Pi OS Lite de 64 bits y Ollama o llama.cpp; descargar un modelo de 1–3B en Q4.
2. Instalar faster-whisper (tiny o base), Piper con una voz en español (**verificar la licencia de la voz**) y openWakeWord.
3. Orquestador en Python (o Wyoming/OVOS) con el system prompt y el filtro de seguridad: un clasificador de reglas y palabras, más una segunda pasada del LLM como juez.
4. Conectar la pantalla, el amplificador y el táctil según la tabla, y hacer la cara con pygame o LVGL.
5. Medir la latencia y elegir el modelo más pequeño que dé una calidad aceptable en español.
6. Imprimir la carcasa con ventilación y montar todo.

**Herramientas:** las de A (soldadura mínima) + teclado y monitor o SSH.

**Pros:** privacidad total, sin coste recurrente, funciona sin conexión y sirve como plataforma de aprendizaje de IA local.
**Contras:** **el más caro (la Pi 5 subió de precio un ~40–60 % en 2026)**; respuestas lentas (3–8 s) y de menor calidad; es más difícil garantizar que el contenido sea seguro con modelos pequeños; consume 5–12 W, así que no es práctico con batería.

---

## Recomendación para el piloto

**Propuesta A**, con un servidor propio (xiaozhi-esp32-server) y **Claude Haiku 5.5** como LLM por defecto, con la opción de cambiar a Ollama en un PC del aula. Arrancar con **A′ (ESP32-S3-BOX-3)** para las primeras 2–3 unidades de demostración, sin soldar, y pasar a la **A DIY** en los talleres con adolescentes. La **B** queda como "nivel 2" del programa, una vez validada la conversación.

Motivos:

1. **Coste:** USD 22–50 por robot frente a USD 312 de la C.
2. **Seguridad:** todo el filtrado y los registros quedan centralizados en un servidor que controlamos.
3. **Latencia:** 1,5–3 s.
4. **Comunidad y firmware:** activos (actualizados el 2026-11-16).
5. **Montaje:** posible en un taller de una tarde.

> **Cambio del 2026-11-16 (medidas verificadas):** el altavoz cerrado de 3 W (Adafruit 4445) mide **70 × 31 × 17 mm** según su ficha y no cabe en la cabeza de 70 mm de A (interior de 66 mm) ni en la de 55 mm de B. A y B pasan a un **altavoz de cavidad 8 Ω 2 W de 30 × 20 × 5,5 mm** (Waveshare); el MAX98357A entrega ≈ 1,4 W en 8 Ω a 5 V. El de 3 W queda solo para C. Medidas y fuentes de todas las piezas en el doc 08.
