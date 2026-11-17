# 03 · Arquitectura de software

> Investigación del 2026-11-16. Los precios de API se verificaron en 2026-11. Las latencias y costes por usuario son **estimaciones** propias construidas a partir de esas cifras.

## 1. Pipeline de voz

```
[mic] → wake word → VAD (fin de frase) → STT → filtro de entrada → LLM (+ system prompt para adolescentes)
      → filtro de salida → TTS → [altavoz]      + estados de la cara (escucha / piensa / habla / emoción)
```

## 2. Patrón recomendado: "cliente ligero ESP32 + servidor" (estilo Xiaozhi)

- **Dispositivo (ESP32-S3):** detecta localmente la palabra de activación (ESP-SR WakeNet) y transmite el audio comprimido en **Opus** (16 kHz de entrada y 24 kHz de salida en la placa de protoboard de xiaozhi, según su [config.h](https://github.com/78/xiaozhi-esp32)) por **WebSocket** o **MQTT + UDP**. Recibe el audio TTS y comandos **MCP** para la cara, el volumen, los servos, etc. La documentación de los protocolos está en el [repo de xiaozhi](https://github.com/78/xiaozhi-esp32): `docs/websocket.md`, `docs/mqtt-udp.md` y `docs/mcp-protocol.md`.
- **Servidor:** [xiaozhi-esp32-server](https://cdn.jsdelivr.net/gh/xinnan-tech/xiaozhi-esp32-server@main/docs/readme/README_en.md) (Python, autoalojado). Integra:
  - VAD con SileroVAD.
  - ASR local (FunASR, Sherpa, Vosk) o en la nube (OpenAI, Groq…).
  - LLM conectable.
  - TTS en streaming.
  - Memoria, RAG y MCP.
  - Consola web.
  - Existe además una [versión Go con Ollama](https://github.com/hackers365/xiaozhi-esp32-server-golang).
- **Ventajas:**
  - Hardware de USD 22–50.
  - Se cambia de LLM sin reflashear.
  - Los filtros de seguridad y los registros quedan centralizados (algo clave para menores).
  - El "cerebro" se actualiza con el tiempo.
- **Desventajas:**
  - Depende del Wi-Fi.
  - Hay que operar un servidor.
  - ⚠️ El servidor público por defecto de xiaozhi (xiaozhi.me) está en China y usa LLM chinos. **Para el piloto hay que usar servidor propio** por privacidad y por control del contenido.

## 3. Palabra de activación (wake word)

| Opción | Dónde corre | Personalización | Licencia y coste | Nota |
|---|---|---|---|---|
| **ESP-SR WakeNet 8/9/10** | En el ESP32-S3 | Palabras predefinidas ("Hi ESP", "Hi Lexin"…). Las palabras propias requieren el servicio de personalización de Espressif o un pipeline TTS v2.0; no hay una herramienta offline sencilla ([issue #198](https://github.com/espressif/esp-sr/issues/198)) | Gratis en chips Espressif. Hasta 5 palabras | [esp-sr](https://components.espressif.com/components/espressif/esp-sr) |
| **openWakeWord** | Pi o PC (ONNX/TFLite) | Se entrena con clips sintéticos generados con Piper en Colab (<1 h) | Apache-2.0 (el código; revisar los modelos) | <5 ms por fragmento en la Pi 5 ([HA blog](https://home-assistant.io/blog/2023/10/12/year-of-the-voice-chapter-4-wakewords)) |
| **Picovoice Porcupine** | Pi, ESP32, móvil | Consola web | ⚠️ **Plan gratuito discontinuado el 2026-06-30**; Foundation USD 6000/año | [Foro HA](https://community.home-assistant.io/t/fyi-picovoice-confirmed-free-tier-accesskeys-will-stop-working-after-june-30-2026/1012744), [activepieces](https://www.activepieces.com/blog/picovoice-pricing-2026-free-foundation-enterprise) |
| Botón o toque (TTP223) | — | — | Gratis | **Recomendado como modo por defecto para adolescentes en aula** (más privacidad y menos falsos positivos) |

## 4. STT (voz a texto)

| Opción | Dónde | Latencia o coste | Fuente |
|---|---|---|---|
| **faster-whisper tiny/base** | Pi 5 o PC | Tiny: 10 s de audio en ~2–3 s en la Pi 5 de 8 GB. Small: más lento que tiempo real en la Pi 5 | [fast.io](https://fast.io/resources/openclaw-raspberry-pi-speech-recognition-offline-voice-agent/), [slides SEC25](https://botyue.github.io/docs_25/paper_slides/SEC25_RaspPi_slides.pdf), [promptquorum](https://www.promptquorum.com/power-local-llm/local-whisper-stt-comparison-2026) |
| Vosk / Sherpa-ONNX / FunASR | Local | Ligeros; FunASR destaca en chino y Vosk tiene modelo en español | [README del server](https://cdn.jsdelivr.net/gh/xinnan-tech/xiaozhi-esp32-server@main/docs/readme/README_en.md) |
| **OpenAI gpt-4o-mini-transcribe** | Nube | ~USD 0.003/min (fecha de retirada reportada: feb-2027, sin verificar) | [costgoat](https://costgoat.com/pricing/openai-transcription) |
| Whisper en un PC con GPU | Servidor local | Más rápido que tiempo real con small o medium | — |

## 5. LLM

### 5.1 Nube (precios por 1M tokens, verificados en 2026-11)

| Modelo | Entrada | Salida | Fuente | Comentario |
|---|---|---|---|---|
| **Claude Haiku 5.5** | USD 0.10 | USD 0.50 | [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing) | Muy barato y rápido. Anthropic **permite productos para menores** con salvaguardas ([guía](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors)) |
| Claude Sonnet 5.5 | USD 2.00 | USD 10.00 | ídem | Más calidad para tutoría y explicaciones |
| OpenAI GPT-5 mini | USD 0.25 | USD 2.00 | [OpenAI](https://developers.openai.com/api/docs/models/gpt-5-mini) | Marcado como *deprecated*; OpenAI recomienda sucesores (GPT-5.4 nano desde USD 0.20 de entrada) |
| OpenAI gpt-realtime-2.1-mini (voz a voz) | USD 10 (audio) | USD 20 (audio) | [OpenAI pricing](https://developers.openai.com/api/docs/pricing?faq=5) | Latencia mínima, pero ~10× más caro |
| Gemini 3.8 Flash | USD 0.75 | USD 3.75 (precio introductorio hasta el 31-12-2026; luego se duplicaría según un blog) | [Vertex pricing](https://cloud.google.com/vertex-ai/generative-ai/pricing), [devtk](https://devtk.ai/en/blog/gemini-api-pricing-guide-2026/) | |
| Gemini 3.8 Live (audio) | USD 3.00 (audio) | USD 12.00 (audio) | [tokenkarma](https://tokenkarma.app/blog/gemini-live-api-pricing-voice-agents-2026/) | Cifra de un blog: verificar |

### 5.2 Local

| Plataforma | Modelos | Velocidad | Fuente |
|---|---|---|---|
| Pi 5 de 8 GB + Ollama o llama.cpp | Gemma 3 1B, Llama 3.2 1B/3B, Qwen 2.5 1.5B (Q4) | 1B: ~6–12 tok/s. 3B: ~4–6 tok/s. llama.cpp es ~40 % más rápido que Ollama en una prueba informal | [stratosphere](https://stratospherelinuxips.readthedocs.io/en/develop/immune/research_rpi_llm_performance.html), [kunalganglani](https://www.kunalganglani.com/blog/gemma-3-raspberry-pi-5-benchmark.md), [dev.to](https://dev.to/baretensor/llamacpp-vs-ollama-on-raspberry-pi-the-performance-trade-off-nobody-talks-about-4hg0), [geerlingguy/ai-benchmarks](https://github.com/geerlingguy/ai-benchmarks) |
| RK3588 (Orange Pi 5, Rock 5) + RKLLM | Modelos cuantizados W8A8 en la NPU | ~7,5–11 palabras/s en un benchmark | [tinycomputers](https://tinycomputers.io/posts/rockchip-rk3588-npu-benchmarks.html) |
| PC o mini-PC con GPU (servidor de aula) + Ollama | Qwen, Llama o Gemma de 7–14B | Decenas de tok/s **(est.)** | — |

**Conclusión:** un LLM de 1–3B en la Pi 5 responde lento (3–8 s para una frase) y con calidad limitada en español, además de ser más difícil de alinear para la seguridad. Para adolescentes, la recomendación es **LLM en la nube con filtros**, o un **LLM local en un PC del aula** como opción de privacidad.

## 6. TTS (texto a voz)

| Opción | Dónde | Notas | Fuente |
|---|---|---|---|
| **Piper** | Pi o PC | Rápido en CPU; funciona en tiempo real en la Pi 4. Hay voces en español, pero **muchas tienen licencia no comercial**: revisar el *model card* de cada voz | [tts.ai Piper ES](https://tts.ai/voices/piper/?lang=es) |
| Edge TTS (voces neuronales de Microsoft vía endpoint no oficial) | Nube | Gratis pero **no oficial**: puede romperse; no recomendado para producción | — |
| **OpenAI gpt-4o-mini-tts** | Nube | ~USD 0.015/min ([estimación](https://www.s-anand.net/blog/openai-tts-cost/)) | [neowin](https://www.neowin.net/news/openai-announces-next-generation-audio-models-to-power-voice-agents/) |

## 7. Latencia estimada, de fin de frase a primer audio (est.)

| Cadena | VAD | STT | LLM (primer token) | TTS (primer fragmento) | **Total** |
|---|---|---|---|---|---|
| ESP32 → servidor → nube (streaming) | 0,5–0,8 s | 0,3–0,8 s | 0,4–1,2 s | 0,2–0,5 s | **≈ 1,5–3 s** |
| ESP32 → PC local (Whisper small en GPU, LLM de 7B, Piper) | 0,5–0,8 s | 0,3–0,6 s | 0,3–1 s | 0,1–0,3 s | **≈ 1,2–2,7 s** |
| Pi 5 todo local (Whisper tiny, LLM de 1–3B, Piper) | 0,5–0,8 s | 1–3 s | 1–3 s (+ generación a 4–12 tok/s) | 0,3–0,6 s | **≈ 3–8 s** |

Para enmascarar la espera hay que mostrar en la pantalla la animación de "pensando" en cuanto termina el VAD, y hacer streaming de TTS por frases.

## 8. Coste de nube por robot (est.)

Supuestos: 10 turnos al día y 30 días = **300 turnos al mes**. Cada turno: ~1500 tokens de entrada (system prompt + historial), 150 de salida, 5 s de audio de entrada y 10 s de respuesta hablada.

| Componente | Cálculo | USD/mes |
|---|---|---|
| STT gpt-4o-mini-transcribe | 300 × 5 s = 25 min × 0,003 | 0.08 |
| LLM Claude Haiku 5.5 | 300 × (1500 × 0,10 + 150 × 0,50) / 1M | 0.07 |
| LLM Claude Sonnet 5.5 (alternativa) | 300 × (1500 × 2 + 150 × 10) / 1M | 1.35 |
| TTS gpt-4o-mini-tts | 300 × 10 s = 50 min × 0,015 | 0.75 |
| **Total con Haiku** | | **≈ USD 0.90 por robot al mes** |
| **Total con Sonnet** | | **≈ USD 2.20 por robot al mes** |

El TTS domina el coste. Usar Piper en el servidor propio lo deja en ≈ USD 0.15/mes con Haiku. Con *prompt caching* del system prompt se reduce aún más la entrada.

## 9. Seguridad y filtrado para adolescentes (12–19)

1. **Requisitos del proveedor:** Anthropic permite integrar su API en productos para menores **si** se implementan salvaguardas de seguridad y se informa al usuario de que habla con una IA. Anthropic puede auditar el cumplimiento y ofrece un system prompt de seguridad infantil ([guía para organizaciones con menores](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors), [child safety guidance](https://support.claude.com/en/articles/15591275-child-safety-guidance-for-developers), [Usage Policy](https://www.anthropic.com/aup)). Hay que revisar los términos equivalentes de OpenAI y Google si se usan.
2. **Capas de defensa (en el servidor):**
   - a) **System prompt** fijo: rol de tutor o compañero amable, sin contenido sexual, violento ni de autolesión, sin consejos médicos o legales definitivos, que derive a adultos de confianza o a líneas de ayuda, que no pida datos personales y que diga que es una IA.
   - b) **Clasificador de entrada y salida:** un modelo de moderación o un LLM barato (Haiku) como juez de "¿apto para 13+?", que bloquea y reformula si no lo es.
   - c) **Lista de temas sensibles** (autolesión, acoso, drogas): respuesta empática fija con recursos locales y aviso al tutor si el piloto lo contempla con consentimiento.
   - d) **Límites de uso:** tiempo diario y horario.
   - e) **Sin memoria persistente** por defecto, o con memoria visible y borrable.
3. **Antidependencia emocional:** el robot no debe fomentar relaciones exclusivas ("soy tu único amigo"), sino recomendar actividades fuera de la pantalla. Es una lección de los compañeros IA comerciales.
4. **Pruebas de *red teaming*** con un guion de prompts problemáticos antes de cada piloto.

## 10. Privacidad

- **Push-to-talk** por defecto. Si se usa palabra de activación, la detección es 100 % local en el ESP32 y no se envía audio hasta detectarla. Un LED o la cara deben indicar claramente cuándo se escucha.
- **Servidor propio** (escuela o asociación): no guardar audio. Guardar transcripciones solo si hay consentimiento parental (menores de 18) y con retención corta (p. ej. 30 días).
- Cumplimiento: **GDPR**, art. 8 (consentimiento parental para menores de entre 13 y 16 años según el país), y en EE. UU. **COPPA** si hay menores de 13. Hay que revisarlo con asesoría legal en el país del piloto (no investigado en detalle).
- Usar proveedores de nube con opción de **no entrenar con los datos** y retención mínima, y documentarlo en el consentimiento.
- Sin cámara en el piloto, o con obturador físico si se incluye.
