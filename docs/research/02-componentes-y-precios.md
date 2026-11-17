# 02 · Componentes y precios

> **Precios verificados en 2026-11** (búsqueda del 2026-11-16) en USD. Cuando la fuente es Adafruit se trata del precio unitario de la ficha del producto, leído directamente. Para AliExpress y otros marketplaces no hubo precios indexables fiables, así que los marco como **(est.)** y doy como referencia listados de Walmart, Fruugo, Electropeak o Alibaba. No incluyen envío ni aranceles.
>
> ⚠️ **Contexto 2026:** la "crisis de RAM" (LPDDR4/5) ha encarecido las placas con mucha memoria. Raspberry Pi subió precios en febrero, abril, octubre y noviembre de 2026 ([OMG! Ubuntu, nov-2026](https://omgubuntu.co.uk/2026/11/raspberry-pi-5-price-goes-up-and-up); [oct-2026](https://www.omgubuntu.co.uk/2026/10/raspberry-pi-2gb-costs-how-much-now/amp)). Los microcontroladores ESP32 apenas se ven afectados.

## 1. Cerebro: MCU y SBC

| Opción | Specs clave | Precio | Fuente | Comentario |
|---|---|---|---|---|
| **ESP32-S3-DevKitC-1 N16R8** (clon) | Doble núcleo a 240 MHz, 16 MB de flash, 8 MB de PSRAM, Wi-Fi y BLE 5, USB-C | USD 11.89–13.68 | [Walmart](https://www.walmart.com/c/kp/esp32-s3-devkitc-1) | Base recomendada. La N16R8 es la variante que usa xiaozhi |
| ESP32-S3-DevKitC-1 (Espressif original) | Ídem | AUD 57.10 (Core Electronics) | [Core Electronics](https://core-electronics.com.au/esp32-s3-devkitc-1-development-board.html.md) | Original más caro; los clones funcionan bien |
| Adafruit ESP32-S3 Feather (4 MB/2 MB PSRAM) | Cargador de LiPo integrado, STEMMA QT | USD 17.50 | [Adafruit 5477](https://www.adafruit.com/product/5477) | Solo 2 MB de PSRAM: justo para xiaozhi |
| **Seeed XIAO ESP32S3 Sense** | S3, 8 MB de PSRAM, **cámara OV2640 y micrófono digital** incluidos, cargador de LiPo | USD 13.99 (lanzamiento); USD 16.99–23.99 hoy | [CNX](https://www.cnx-software.com/2023/03/29/xiao-esp32s3-sense-camera-and-a-microphone-round-touchscreen-display/?amp=1), [RobotShop CA](https://ca.robotshop.com/products/seeedstudio-xiao-esp32s3-sense-wifi-ble-ov2640-mic-8mb-iot-embedded-ml) | Muy compacta; buena para la variante con cámara |
| **Waveshare ESP32-S3-Touch-LCD-1.28** | S3 + pantalla **redonda táctil** de 1,28" + IMU | USD 21.99 | [Waveshare](https://www.waveshare.com/esp32-s3-touch-lcd-1.28.htm) | "Ojo" listo; no trae audio (hay que añadirlo) |
| **ESP32-S3-BOX-3** | S3 16 MB/16 MB, pantalla táctil de 2,4", 2 micrófonos, altavoz, carcasa, base | **USD 49.95** | [Adafruit 5835](https://www.adafruit.com/product/5835) | Todo en uno sin soldar; placa oficial de xiaozhi |
| **M5Stack CoreS3** / CoreS3 SE | S3, pantalla táctil de 2", 2 micrófonos, altavoz, cámara (la SE no lleva), batería | USD 59.90 / USD 38.60 | [CNX Software](https://www.cnx-software.com/2024/05/31/m5stack-cores3-se-cost-down-esp32-s3-iot-controller-features-a-2-inch-touch-display-a-microsd-card-slot-a-speaker-two-microphones/) | Base de StackChan; carcasa incluida |
| Raspberry Pi Zero 2 W | Cortex-A53 de 4 núcleos, 512 MB | **USD 19.05** | [Adafruit 5291](https://www.adafruit.com/product/5291) | Sirve para wake word y STT tiny; **no** para LLM local |
| Raspberry Pi 5 — 2 GB | Cortex-A76 a 2,4 GHz | USD 90.00 (Adafruit); MSRP USD 77.50 desde oct-2026 | [Adafruit 6007](https://www.adafruit.com/product/6007), [OMG! Ubuntu](https://www.omgubuntu.co.uk/2026/10/raspberry-pi-2gb-costs-how-much-now/amp) | Insuficiente para LLM |
| Raspberry Pi 5 — 4 GB | | **USD 130.00** | [Adafruit 5812](https://www.adafruit.com/product/5812) | LLM de 1B justo |
| **Raspberry Pi 5 — 8 GB** | | **USD 200.00** | [Adafruit 5813](https://www.adafruit.com/product/5813) | Mínimo razonable para un LLM local de 1–3B |
| Raspberry Pi 5 — 16 GB | | USD 385 (MSRP desde nov-2026) | [OMG! Ubuntu](https://omgubuntu.co.uk/2026/11/raspberry-pi-5-price-goes-up-and-up) | Precio desproporcionado |
| Fuente oficial Pi 27 W USB-C PD | 5,1 V y 5 A | USD 14.04 | [Adafruit 5814](https://www.adafruit.com/product/5814) | Obligatoria para la Pi 5 |
| Active Cooler oficial Pi 5 | | USD 13.50 | [Adafruit 5815](https://www.adafruit.com/product/5815) | Necesario para LLM sostenido |
| Orange Pi 5 Max / Radxa Rock 5B+ (RK3588, NPU de 6 TOPS) | Hasta 32 GB de LPDDR5 | OPi 5 Max 8 GB ~USD 225; Rock 5B+ 8 GB ~USD 251 (snapshot) | [dev.to comparativa](https://dev.to/revenueclaw/orange-pi-5-max-vs-rock-5b-the-32gb-sbc-battle-in-2026-3ho0), [CNX RKLLM](https://www.cnx-software.com/2024/07/15/rockchip-rkllm-toolkit-npu-accelerated-large-language-models-rk3588-rk3588s-rk3576/) | RKLLM acelera LLM con la NPU (solo cuantización W8A8), pero el ecosistema es menos amigable que el de la Pi |

## 2. Pantallas ("cara")

| Opción | Specs | Precio | Fuente |
|---|---|---|---|
| **GC9A01 1,28" redonda 240×240** (genérica, SPI) | IPS, 4 hilos SPI | USD 8.90 (DisplayModule); USD 2–5 por volumen en Alibaba; ~USD 3–4 en AliExpress **(est.)** | [DisplayModule](https://www.displaymodule.com/products/1-28-240-x-240-round-tft-spi), [Alibaba](https://electronics.alibaba.com/product/gc9a01-display) |
| Adafruit 1,28" redonda GC9A01A (EYESPI + microSD) | Calidad Adafruit | USD 17.50 | [Adafruit 6178](https://www.adafruit.com/product/6178) |
| **IPS 2,0" 320×240 ST7789** | Cara rectangular estilo Stack-chan | USD 19.95 (Adafruit); ~USD 4–6 genérica **(est.)** | [Adafruit 4311](https://www.adafruit.com/product/4311) |
| OLED 0,96"/1,3" SSD1306/SH1106 (I2C) | Monocromo, 128×64 | ~USD 2–4 **(est.)** | xiaozhi la admite de serie ([config.h](https://github.com/78/xiaozhi-esp32)) |

## 3. Audio

| Opción | Specs | Precio | Fuente |
|---|---|---|---|
| **INMP441** (micrófono MEMS I2S omnidireccional) | 24 bits, SNR de 61 dB | USD 4.95 unidad (Vetco); 3 por USD 10.99 (Amazon); ~USD 1.5–2 en AliExpress **(est.)** | [Vetco](https://vetco.net/products/omnidirectional-microphone-module-inmp441-high-precision-i2s), [camelcamelcamel](https://camelcamelcamel.com/product/B0FKFR1WFX) |
| Adafruit SPH0645LM4H I2S | Alternativa de marca | USD 6.95 | [Adafruit 3421](https://www.adafruit.com/product/3421) |
| **ReSpeaker Lite** (2 micrófonos, XMOS XU316: AEC, supresión de ruido, AGC) | USB o I2S; versión kit con XIAO ESP32S3 | USD 29.12 (RobotShop); kit con XIAO £28.80 | [RobotShop](https://www.robotshop.com/products/respeaker-lite-usb-2-mic-array-with-onboard-ai-audio-processing-algorithms), [The Pi Hut](https://thepihut.com/collections/adafruit-development-boards/products/respeaker-lite-with-xiao-esp32s3) |
| **MAX98357A** (amplificador I2S de clase D, 3 W) | Entrada I2S directa del ESP32 | USD 5.95 (Adafruit); ~USD 1.5–2.5 genérico **(est.)** | [Adafruit 3006](https://www.adafruit.com/product/3006) |
| Altavoz cerrado de 3 W y 4 Ω | 70 × 31 × 17 mm: **no cabe en las cabezas de A y B** | USD 3.95 | [Adafruit 4445](https://www.adafruit.com/product/4445) |
| **Altavoz de cavidad 8 Ω 2 W** | 30 × 20 × 5,5 mm, conector PH; **el de A y B** | USD 2.99 | [Waveshare](https://www.waveshare.com/8ohm-2w-speaker.htm) |
| Mini Oval Speaker 8 Ω 1 W | 30 × 20 × 5 mm (alternativa de menos potencia) | ver catálogo | [Adafruit 4227](https://www.adafruit.com/product/4227) |
| Altavoz de 3" (76 mm), 4 Ω y 3 W | Más graves; necesita carcasa mayor | USD 1.95 | [Adafruit 1314](https://www.adafruit.com/product/1314) |

## 4. Movimiento

| Opción | Specs | Precio | Fuente | Comentario |
|---|---|---|---|---|
| **SG90 / SG92R** micro servo de 9 g | PWM, ~1,5–2,5 kg·cm, 180° | USD 5.95 (Adafruit SG92R); 10 por USD 15.99 en Amazon (snapshot de 2025); USD 4.00 en AndyMark | [Adafruit 169](https://www.adafruit.com/product/169), [AndyMark](https://andymark.com/products/micro-servo-sg90) | Ruidoso; pico de arranque mayor de 1 A |
| MG90S (engranaje metálico) | Más robusto | 10 por USD 19.99 (Smraza, snapshot) | [slashskill](https://www.slashskill.com/deals/product/B07L2SF3R4/smraza-10-pcs-sg90-9g-micro-servo-motor-kit-metal-gear-for-arduino-projects-r/) | |
| FS90R (rotación continua) | Para ruedas | USD 7.50 | [Adafruit 2442](https://www.adafruit.com/product/2442) | |
| **Feetech STS3032** (bus serie) | 4,5 kg·cm, realimentación de posición, en cadena por un solo cable | USD 40–41.66 | [RobotShop](https://www.robotshop.com/products/feetech-6v-45-kg-serial-bus-servo) | Silencioso y preciso (lo usan Stack-chan y LeRobot); caro |

## 5. Energía

| Opción | Specs | Precio | Fuente | Comentario |
|---|---|---|---|---|
| LiPo de 3,7 V y 2000 mAh (JST-PH) | Bolsa plana con protección | USD 12.50 | [Adafruit 2011](https://www.adafruit.com/product/2011) | |
| Li-ion 18650 de 3,7 V y 2200 mAh (JST-PH, con protección) | Cilíndrica, más robusta frente a golpes | USD 9.95 | [Adafruit 1781](https://www.adafruit.com/product/1781) | **Preferible a la LiPo bolsa para adolescentes** |
| **TP4056 USB-C** (cargador de 1 A con DW01) | Solo carga | 5 por USD 3.99–4.98; 10 por USD 7.49 | [Shillehtek](https://shillehtek.com/products/tp4056-1a-lipo-battery-charging-board-type-c-with-current-protection), [Walmart](https://www.walmart.com/ip/1608593234) | ⚠️ Muchos **no cargan con cable USB-C a C ni con cargadores PD** (les faltan las resistencias CC); usar cable A a C |
| Adafruit Micro-Lipo USB-C | Cargador de calidad | USD 5.95 | [Adafruit 4410](https://www.adafruit.com/product/4410) | |
| **IP5306** (carga 2,1 A + elevador a 5 V y 2,4 A, tipo powerbank) | Carga + elevación en un solo módulo | USD 0.95 (Electropeak) | [Electropeak](https://electropeak.com/ip5306-lithium-battery-boost-charging-module-5v-2a-with-type-c) | Ideal si hay servos a 5 V; se apaga con cargas menores de ~50 mA (habría que verificarlo) |
| Adafruit PowerBoost 1000C | Carga + 5 V y 1 A con load-sharing | USD 19.95 | [Adafruit 2465](https://www.adafruit.com/product/2465) | Opción "segura y documentada" |
| USB-C PD (alimentación de pared) | 5 V | — | — | **Recomendado para el piloto: sin batería** |

## 6. Sensores

| Sensor | Uso | Precio | Fuente |
|---|---|---|---|
| TTP223 (táctil capacitivo) | "Acariciar la cabeza" o botón de hablar | ~USD 0.3–0.5 **(est.)**; Adafruit AT42QT1010 USD 5.95 | [Adafruit 1374](https://www.adafruit.com/product/1374) |
| MPU-6050 (IMU de 6 ejes) | Detectar si lo levantan o lo agitan | USD 12.95 (Adafruit); ~USD 2 genérico **(est.)** | [Adafruit 3886](https://www.adafruit.com/product/3886) |
| VL53L0X (ToF de 30–1000 mm) | Detectar presencia y "mirar" a quien se acerca | USD 14.95 (Adafruit); ~USD 3 genérico **(est.)** | [Adafruit 3317](https://www.adafruit.com/product/3317) |
| OV2640 (cámara de 2 MP) | Visión con un LLM multimodal | Incluida en la XIAO ESP32S3 Sense; módulo suelto ~USD 5–8 **(est.)** | [CNX XIAO Sense](https://www.cnx-software.com/2023/03/29/xiao-esp32s3-sense-camera-and-a-microphone-round-touchscreen-display/?amp=1) |

## 7. Varios (est.)

| Ítem | Precio (est.) |
|---|---|
| Cables dupont, termorretráctil, placa perforada de 5×7 cm | USD 4–6 |
| Tornillos M2/M2.5 con insertos térmicos | USD 3–5 |
| Interruptor deslizante y conector JST | USD 1 |
| microSD de 64 GB (Pi) | USD 10–14 |
| Filamento PLA o PETG (USD 15–22/kg → USD 0.015–0.022/g) | USD 1–3 por robot ([QIDI](https://kr.qidi3d.com/blogs/news/3d-printer-filament-pricing-cost-factors)) |

## 8. BOM por nivel (resumen; el detalle está en el doc 05)

### Nivel A — "Básico" (cliente ligero ESP32-S3, alimentación USB)

| Ítem | Opción barata (AliExpress, est.) | Opción retail verificada |
|---|---|---|
| ESP32-S3 N16R8 DevKitC | 7 | 12.50 (Walmart) |
| GC9A01 1,28" redonda | 3.5 | 8.90 (DisplayModule) |
| INMP441 | 1.8 | 4.95 (Vetco) |
| MAX98357A | 2 | 5.95 (Adafruit) |
| Altavoz de cavidad 8 Ω 2 W | 1.5 | 2.99 (Waveshare) |
| TTP223 | 0.4 | 5.95 (Adafruit AT42QT1010) |
| Carcasa PLA (~80 g) | 1.6 | 1.6 |
| Cables, perfboard, tornillos | 4 | 6 |
| **Total** | **≈ USD 22** | **≈ USD 49** |

### Nivel A′ — "Todo en uno sin soldar"

ESP32-S3-BOX-3 (USD 49.95) + carcasa impresa (~USD 2) = **≈ USD 52**. Alternativa: M5Stack CoreS3 SE (USD 38.60) = **≈ USD 40**.

### Nivel B — "Expresivo" (cara IPS de 2", cuello pan/tilt, batería, sensores)

| Ítem | Barata (est.) | Retail verificada |
|---|---|---|
| ESP32-S3 N16R8 | 7 | 12.50 |
| IPS 2" ST7789 | 5 | 19.95 (Adafruit) |
| 2× servo SG90/SG92R | 3 | 11.90 (Adafruit) |
| INMP441 | 1.8 | 4.95 |
| MAX98357A + altavoz de cavidad 8 Ω 2 W | 3.5 | 8.94 |
| VL53L0X | 3 | 14.95 |
| MPU-6050 | 2 | 12.95 |
| TTP223 | 0.4 | 5.95 |
| 18650 de 2200 mAh con protección | 4 | 9.95 |
| IP5306 o PowerBoost 1000C | 1 | 19.95 |
| Interruptor, cables, tornillos | 5 | 7 |
| Carcasa PLA/PETG (~180 g) | 3.5 | 3.5 |
| **Total** | **≈ USD 39** | **≈ USD 132** |

Con servos **STS3032** (2× USD 41.66) en lugar de SG90, más un adaptador de bus serie (~USD 5, est.), el retail sube a ≈ USD 210.

### Nivel C — "Autónomo local" (Raspberry Pi 5 de 8 GB)

| Ítem | Precio | Fuente |
|---|---|---|
| Raspberry Pi 5 de 8 GB | 200.00 | Adafruit |
| Fuente de 27 W | 14.04 | Adafruit |
| Active Cooler | 13.50 | Adafruit |
| microSD de 64 GB (A2) | 12 (est.) | — |
| ReSpeaker Lite USB (2 micrófonos con AEC) | 29.12 | RobotShop |
| MAX98357A + altavoz de 3 W | 9.90 | Adafruit |
| IPS 2" ST7789 | 19.95 | Adafruit |
| TTP223 | 5.95 | Adafruit |
| Carcasa PETG (~250 g) + tornillos | 8 (est.) | — |
| **Total** | **≈ USD 312** | |

Con una Pi 5 de 16 GB (USD 385) el total sería ≈ USD 497. **Alternativa económica:** usar el nivel A como cliente y ejecutar el LLM en un PC que ya exista en casa o en el aula (coste adicional de USD 0).
