# 10 · Guía técnica de la propuesta A (cableado, firmware, servidor y puesta en marcha)

Revisado el 2026-11-18. Para el programador y el ensamblador de la **propuesta A** (ESP32-S3-DevKitC-1 N16R8 + pantalla redonda táctil Waveshare 1,85″ ST77916 + INMP441 + MAX98357A). Pines y BOM: doc 05; carcasa: doc 09; LLM y riesgos: doc 03 §5.3.

> **Estado:** nada de esta guía se ha probado aún en hardware. El audio sigue la placa `bread-compact-wifi-lcd` de xiaozhi-esp32 (verificada en su `config.h`); los pines de la pantalla son una **asignación propia sin probar**. Los comandos de firmware y servidor salen de la documentación de los repos upstream, revisada el 2026-11-18:
> - [`docs/custom-board.md`](https://github.com/78/xiaozhi-esp32/blob/main/docs/custom-board.md), [`main/Kconfig.projbuild`](https://github.com/78/xiaozhi-esp32/blob/main/main/Kconfig.projbuild), [`main/CMakeLists.txt`](https://github.com/78/xiaozhi-esp32/blob/main/main/CMakeLists.txt) y [`main/boards/waveshare/esp32-s3-touch-lcd-1.85/config.h`](https://github.com/78/xiaozhi-esp32/blob/main/main/boards/waveshare/esp32-s3-touch-lcd-1.85/config.h) de xiaozhi-esp32.
> - [`docs/Deployment.md`](https://github.com/xinnan-tech/xiaozhi-esp32-server/blob/main/docs/Deployment.md), [`docker-compose.yml`](https://github.com/xinnan-tech/xiaozhi-esp32-server/blob/main/main/xiaozhi-server/docker-compose.yml) y [`config.yaml`](https://github.com/xinnan-tech/xiaozhi-esp32-server/blob/main/main/xiaozhi-server/config.yaml) de xiaozhi-esp32-server.

## 1. Cableado

### 1.1 Alimentación

| Raíl | Origen | Consumidores | Notas |
|---|---|---|---|
| 5V (VBUS) | USB-C del DevKit (cargador 5 V 2 A) | MAX98357A VIN | El amplificador a 5 V da más volumen que a 3,3 V. |
| 3V3 | LDO del DevKit | INMP441 VDD, pantalla VCC, TTP223 VCC | No alimentar el amplificador desde 3V3. |
| GND | DevKit | Todos | Un solo punto de masa en la placa perforada; masa del micrófono corta. |

### 1.2 Redes por bus

| Bus | Señal | GPIO | Módulo · pin | Estado |
|---|---|---|---|---|
| I2S0 entrada (micrófono) | WS | 4 | INMP441 · WS | Verificado en xiaozhi |
| | SCK | 5 | INMP441 · SCK | Verificado |
| | DIN | 6 | INMP441 · SD | Verificado |
| | — | GND | INMP441 · L/R (canal izquierdo) | Verificado |
| I2S1 salida (altavoz) | DOUT | 7 | MAX98357A · DIN | Verificado |
| | BCLK | 15 | MAX98357A · BCLK | Verificado |
| | LRCK | 16 | MAX98357A · LRC | Verificado |
| QSPI (SPI2_HOST, pantalla ST77916 360 × 360) | PCLK | 21 | LCD_CLK | Propuesto |
| | CS | 41 | LCD_CS | Propuesto |
| | D0 / D1 / D2 / D3 | 47 / 40 / 42 / 2 | LCD_IO0 / IO1 / IO2 / IO3 | Propuesto |
| | RST | 39 | LCD_RST | Propuesto |
| | BL | 14 | LCD_BL | Propuesto |
| I2C (táctil CST816S) | SDA | 8 | TP_SDA | Propuesto |
| | SCL | 9 | TP_SCL | Propuesto |
| | INT | 10 | TP_INT (TP_RST sin conectar) | Propuesto |
| Botones | BOOT | 0 | Botón de la placa: hablar / configurar Wi-Fi | Verificado |
| | TOUCH | 1 (opcional) | TTP223 · OUT | Propuesto |

Pines que **no** se usan: 45/46 (arranque), 19/20 (USB), 26–37 (flash y PSRAM octal), 38/48 (LED RGB según la versión de la placa; la placa de referencia declara `BUILTIN_LED_GPIO` 48).

> La placa Waveshare ESP32-S3-Touch-LCD-1.85 controla el reset de la pantalla a través de un expansor TCA9554 y usa otros pines (PCLK 40, CS 21, D0–D3 46/45/42/41, BL 5, táctil en I2C_NUM_1 SDA 1 / SCL 3 / INT 4). Con el **módulo suelto** no hay expansor: el reset va directo a un GPIO (39) y el código de la placa propia debe manejarlo así. No copiar los pines de la placa Waveshare.

### 1.3 Reglas de cableado

- Hilo AWG 26–28; trenzar cada par de reloj con su masa en los tramos de más de 10 cm.
- Tramos de QSPI lo más cortos posible (el cable GH1.25 de 15 pines de la pantalla ya mide ≈ 10 cm): no alargarlo.
- El micrófono lejos del altavoz y del amplificador (caras opuestas en la Delta suave, doc 09).
- Comprobar continuidad y ausencia de cortos 3V3–GND y 5V–GND con el multímetro **antes** de conectar el USB.

## 2. Firmware: placa propia `bitu-a`

xiaozhi-esp32 no trae una placa con este conjunto (audio de `bread-compact-wifi-lcd` + ST77916 sin expansor). Se crea una placa nueva; **no se modifica** una existente (lo prohíbe la guía upstream).

### 2.1 Entorno

- ESP-IDF **5.4 o posterior**, objetivo `esp32s3`.
- Clonar el firmware: `git clone https://github.com/78/xiaozhi-esp32.git`.

### 2.2 Archivos de la placa

```
main/boards/bitu-a/
├── config.h          # pines (tabla 1.2)
├── config.json       # tipo de placa y opciones de build
└── bitu_a_board.cc   # inicialización: I2S simplex, bus QSPI + panel ST77916, táctil, botones
```

`config.h` (extracto; nombres de macros de las placas de referencia):

```c
#define AUDIO_INPUT_SAMPLE_RATE  16000
#define AUDIO_OUTPUT_SAMPLE_RATE 24000
#define AUDIO_I2S_METHOD_SIMPLEX
#define AUDIO_I2S_MIC_GPIO_WS   GPIO_NUM_4
#define AUDIO_I2S_MIC_GPIO_SCK  GPIO_NUM_5
#define AUDIO_I2S_MIC_GPIO_DIN  GPIO_NUM_6
#define AUDIO_I2S_SPK_GPIO_DOUT GPIO_NUM_7
#define AUDIO_I2S_SPK_GPIO_BCLK GPIO_NUM_15
#define AUDIO_I2S_SPK_GPIO_LRCK GPIO_NUM_16

#define BOOT_BUTTON_GPIO        GPIO_NUM_0
#define TOUCH_BUTTON_GPIO       GPIO_NUM_NC   // GPIO_NUM_1 si se monta el TTP223

#define DISPLAY_WIDTH           360
#define DISPLAY_HEIGHT          360
#define QSPI_LCD_HOST           SPI2_HOST
#define QSPI_PIN_NUM_LCD_PCLK   GPIO_NUM_21
#define QSPI_PIN_NUM_LCD_CS     GPIO_NUM_41
#define QSPI_PIN_NUM_LCD_DATA0  GPIO_NUM_47
#define QSPI_PIN_NUM_LCD_DATA1  GPIO_NUM_40
#define QSPI_PIN_NUM_LCD_DATA2  GPIO_NUM_42
#define QSPI_PIN_NUM_LCD_DATA3  GPIO_NUM_2
#define QSPI_PIN_NUM_LCD_RST    GPIO_NUM_39
#define QSPI_PIN_NUM_LCD_BL     GPIO_NUM_14
#define TP_PIN_NUM_SDA          GPIO_NUM_8
#define TP_PIN_NUM_SCL          GPIO_NUM_9
#define TP_PIN_NUM_INT          GPIO_NUM_10
#define TP_PIN_NUM_RST          GPIO_NUM_NC
```

`config.json` (el DevKit N16R8 tiene 16 MB, que ya es el valor por defecto del proyecto: no hace falta `sdkconfig_append`):

```json
{
  "type": "bitu-a",
  "target": "esp32s3",
  "builds": [{ "name": "bitu-a", "sdkconfig_append": [] }]
}
```

`bitu_a_board.cc`: partir de `waveshare/esp32-s3-touch-lcd-1.85/esp32-s3-touch-lcd-1.85.cc` para el panel ST77916 y el táctil, quitar el expansor TCA9554 (reset directo por GPIO 39) y tomar el códec I2S simplex de `bread-compact-wifi-lcd`. Terminar con `DECLARE_BOARD(BituABoard);`.

### 2.3 Registrar la placa

En `main/Kconfig.projbuild`, dentro de `choice BOARD_TYPE`:

```kconfig
config BOARD_TYPE_BITU_A
    bool "Bitu A (DevKitC-1 N16R8 + ST77916 1.85\")"
    depends on IDF_TARGET_ESP32S3
```

En `main/CMakeLists.txt`, en la cadena de placas (fuentes iguales a la placa Waveshare de 1,85″):

```cmake
elseif(CONFIG_BOARD_TYPE_BITU_A)
    set(BOARD_DIR "bitu-a")
    set(BUILTIN_TEXT_FONT font_noto_sans_basic_16_4)
    set(BUILTIN_ICON_FONT font_material_symbols_16_4)
    set(DEFAULT_EMOJI_COLLECTION noto-color-emoji_64)
```

### 2.4 Compilar y grabar

Recomendado (`scripts/build.py` lee `config.json`; el idioma por defecto es inglés, así que hay que pedir español):

```bash
python scripts/build.py bitu-a --language es-ES
```

Manual con `idf.py`:

```bash
idf.py set-target esp32s3
idf.py fullclean
idf.py menuconfig      # Xiaozhi Assistant → Board Type → Bitu A; OTA URL (2.5)
idf.py build
idf.py -p /dev/ttyACM0 flash monitor
```

El puerto USB-C marcado **USB** del DevKit aparece como `/dev/ttyACM0` (USB-Serial-JTAG); el marcado **UART/COM** como `/dev/ttyUSB0`. Si no entra en modo descarga: mantener BOOT, pulsar RST y soltar BOOT.

### 2.5 Apuntar al servidor propio

El firmware pregunta primero a la URL OTA y de ahí recibe la dirección WebSocket. Por defecto apunta al servidor público (`CONFIG_OTA_URL = https://api.tenclass.net/xiaozhi/ota/`). Para Bitu, en `menuconfig` → *Xiaozhi Assistant* → *Default OTA URL*:

```
http://<IP-del-servidor>:8003/xiaozhi/ota/
```

El Wi-Fi se configura en el primer arranque desde el portal cautivo del ESP32 (punto de acceso `Xiaozhi-XXXX`).

## 3. Servidor: `xiaozhi-esp32-server` (solo servidor, sin consola web)

### 3.1 Puertos

| Puerto | Servicio | URL que usa el robot |
|---|---|---|
| 8000/tcp | WebSocket de voz | `ws://<IP>:8000/xiaozhi/v1/` |
| 8003/tcp | HTTP: OTA y visión | `http://<IP>:8003/xiaozhi/ota/` |

Abrir ambos en el cortafuegos del PC o VPS. Robot y servidor en la misma red para el piloto.

### 3.2 Opción Docker (recomendada)

```
xiaozhi-server/
├── docker-compose.yml        # del repo: main/xiaozhi-server/docker-compose.yml
├── data/
│   └── .config.yaml          # = tools/servidor/config-deepseek.yaml + clave real
└── models/
    └── vosk/vosk-model-small-es-0.42/
```

```bash
docker compose up -d
docker logs -f xiaozhi-esp32-server   # debe imprimir las URL de OTA y WebSocket
```

El `docker-compose.yml` de upstream solo monta el modelo SenseVoice. Con Vosk hay que **añadir** el volumen del modelo (sin probar; comprobar también que la imagen trae el paquete `vosk`):

```yaml
    volumes:
      - ./data:/opt/xiaozhi-esp32-server/data
      - ./models/vosk:/opt/xiaozhi-esp32-server/models/vosk
```

En Docker la URL WebSocket autogenerada puede salir mal: fijar `server.websocket` en `.config.yaml` con la IP de la red local (la plantilla ya trae el campo).

### 3.3 Opción desde el código fuente

```bash
git clone https://github.com/xinnan-tech/xiaozhi-esp32-server.git
cd xiaozhi-esp32-server/main/xiaozhi-server
conda create -n xiaozhi-esp32-server python=3.10 -y
conda activate xiaozhi-esp32-server
conda install libopus ffmpeg -y
pip install -r requirements.txt
mkdir -p data && cp /ruta/a/minirobot/tools/servidor/config-deepseek.yaml data/.config.yaml
python app.py
```

Sin conda: instalar `libopus` y `ffmpeg` del sistema y usar un venv de Python 3.10.

### 3.4 Configuración

- `data/.config.yaml` se lee primero y completa lo que falte desde `config.yaml`. Si se usa la consola web (智控台), esta configuración **no** se aplica.
- Poner la clave de DeepSeek solo en el servidor (`LLM.DeepSeekLLM.api_key`); nunca en el repositorio.
- Modelo ASR: descargar `vosk-model-small-es-0.42` de <https://alphacephei.com/vosk/models> y descomprimirlo en `models/vosk/`.
- `server.timezone_offset`: upstream trae `+8` (China); poner el huso local (p. ej. `-5`).
- Comprobar en el navegador que `http://<IP>:8003/xiaozhi/ota/` responde antes de encender el robot.

## 4. Puesta en marcha por etapas

Cada etapa tiene una condición de paso; no avanzar si falla.

| # | Etapa | Prueba | Pasa si |
|---|---|---|---|
| 0 | Placa sin módulos | Multímetro entre 3V3–GND y 5V–GND sin USB | Sin continuidad (sin corto) |
| 1 | Alimentación | Conectar USB al cargador; medir raíles | 5V ≈ 4,8–5,2 V; 3V3 ≈ 3,25–3,35 V |
| 2 | Arranque | `idf.py monitor` tras grabar | Log de arranque sin reinicios; PSRAM de 8 MB detectada |
| 3 | Pantalla | Arranque normal | Retroiluminación encendida y UI de xiaozhi visible, sin desplazamiento ni colores invertidos |
| 4 | Táctil | Tocar la pantalla | Eventos del CST816S en el log |
| 5 | Wi-Fi | Portal cautivo `Xiaozhi-XXXX` | Conecta y muestra la IP en el log |
| 6 | OTA | Log del robot y del servidor | El robot pide `/xiaozhi/ota/` y recibe `ws://<IP>:8000/xiaozhi/v1/` |
| 7 | Altavoz | Sonido de bienvenida | Se oye sin zumbido ni recortes |
| 8 | Micrófono | Pulsar BOOT y hablar | El servidor registra el texto reconocido por Vosk |
| 9 | Extremo a extremo | Pregunta corta en español | Respuesta hablada; medir fin de frase → primer audio (puerta G1: p90 ≤ 3 s) |
| 10 | Contenido | Guion de *red teaming* (doc 03 §9) | Rechazos correctos según el system prompt |
| 11 | Térmica | 30 min de conversación con la carcasa cerrada | Sin reinicios ni cortes de audio |

Fallos típicos (orientativos, sin probar):

- **Pantalla en negro con retroiluminación:** reset (GPIO 39) o líneas D0–D3 cruzadas; revisar el orden IO0–IO3.
- **Pitido o zumbido:** masa del amplificador compartida con el micrófono por un tramo largo; separar retornos.
- **El robot va al servidor público:** la URL OTA no se cambió en `menuconfig`, o quedó la configuración antigua en NVS: borrar con `idf.py erase-flash` y grabar de nuevo.
- **ASR vacío:** modelo Vosk no montado o ruta distinta de `model_path`.
