# Plan de mejora · Bitu

> Escrito el 2026-11-16 a partir de `docs/research/`. Se iteró 4 veces: cada versión critica la anterior. **La versión vigente es la v4** (al final); las v1–v3 se conservan como registro de decisiones.
> Las cifras de coste y tiempo son **estimaciones** salvo que citen un documento de investigación.

---

## v1 · Lista bruta de mejoras

Todo lo que la investigación dejó abierto o débil:

1. Comprar y montar 2–3 unidades A′ (ESP32-S3-BOX-3) para demo.
2. Montar la propuesta A DIY en protoboard y en perfboard.
3. Levantar `xiaozhi-esp32-server` propio (no usar el servidor público en China).
4. Escribir el system prompt para adolescentes y el filtro de entrada/salida.
5. Diseñar la carcasa propia de Bitu (cabeza 65–75 mm, pantalla inclinada 10–15°).
6. Animar los ojos (escuchando, pensando, hablando, emociones).
7. Medir latencias reales (hoy todas son estimadas).
8. Confirmar precios de AliExpress y de Emo/Eilik en tiendas oficiales.
9. Búsqueda legal de marca "Bitu" en clases 9, 28 y 42.
10. Probar Ollama en un PC del aula como modo local.
11. Propuesta B: cuello pan/tilt + herramientas MCP (`mirar`, `asentir`, `emocion`).
12. Revisar licencias de las voces Piper en español.
13. Consentimiento parental, retención de datos (GDPR art. 8, COPPA).
14. Guía de taller para adolescentes y protocolo de seguridad.
15. Web: publicarla, añadir fotos reales del prototipo.

**Crítica de la v1:** es una lista sin orden; mezcla tareas de una hora con trabajos de un mes, no dice qué bloquea a qué ni cuándo se considera terminado el piloto.

---

## v2 · Priorizado por impacto y esfuerzo, con dependencias

| # | Mejora | Impacto | Esfuerzo | Depende de |
|---|---|---|---|---|
| 3 | Servidor propio | Alto (privacidad, control) | Medio | — |
| 4 | System prompt + filtro | Alto (seguridad menores) | Medio | 3 |
| 1 | 2–3 unidades A′ | Alto (demo sin soldar) | Bajo | 3 |
| 7 | Medir latencia real | Alto (valida la recomendación) | Bajo | 1, 3 |
| 2 | A DIY en protoboard → perfboard | Alto (coste USD 34–71) | Medio | 3 |
| 6 | Ojos animados | Alto (la cara da la personalidad, doc 01 §4) | Medio | 2 |
| 5 | Carcasa propia | Medio | Medio | 2 |
| 12 | Licencias Piper | Medio | Bajo | — |
| 13 | Consentimiento y retención | Alto (legal) | Medio | 3 |
| 14 | Guía de taller + seguridad | Alto | Medio | 2, 5 |
| 9 | Marca "Bitu" | Medio | Bajo (encargo legal) | — |
| 10 | Modo local Ollama | Medio | Bajo | 3 |
| 8 | Confirmar precios | Bajo | Bajo | — |
| 11 | Propuesta B | Medio | Alto | 2, 6 |
| 15 | Web con fotos reales | Bajo | Bajo | 5 |

**Crítica de la v2:** ya hay orden, pero falta un criterio de "terminado", métricas y presupuesto. Tampoco dice qué hacer si una prueba sale mal (por ejemplo, latencia > 3 s).

---

## v3 · Fases con hitos, métricas y presupuesto

| Fase | Semanas | Entregables | Métrica de éxito | Presupuesto (est.) |
|---|---|---|---|---|
| **0 · Cimientos** | 1–2 | Servidor propio (3), system prompt + filtro (4), licencias (12), marca encargada (9) | 50 prompts de *red teaming* sin respuesta inapropiada | USD 0–20 (VPS) |
| **1 · Demo A** | 2–3 | 3× propuesta A en carcasa Delta suave con firmware xiaozhi apuntando al servidor propio (1, 2, 5), latencia medida (7) | Latencia fin-de-frase → primer audio ≤ 3 s en p90 | ≈ USD 215 (3 × 71) |
| **2 · Bitu DIY (A)** | 3–6 | Protoboard → perfboard (2), ojos animados (6), carcasa propia v1 (5), modo local Ollama (10) | 5 unidades montadas por personas que no las diseñaron, ≤ 5 h cada una | ≈ USD 275 (5 × 55) |
| **3 · Taller piloto** | 7–9 | Guía de taller y seguridad (14), consentimiento y retención (13) | 2 sesiones con 8–12 adolescentes; ≥ 80 % termina su robot | ≈ USD 300 |
| **4 · Nivel 2 (B)** | 10+ | Propuesta B con servos y MCP (11) | Gestos invocados por el LLM en ≥ 90 % de los intentos | ≈ USD 148 por unidad |

**Crítica de la v3:** el plan asume que todo sale bien. No hay puntos de decisión (go/no-go) ni plan B para los riesgos ya detectados en la investigación: crisis de RAM, Porcupine sin plan gratuito, voces Piper no comerciales, servidor público chino, TP4056 que no carga con USB-C a C.

---

## v4 · Hoja de ruta final con puertas de decisión y riesgos ✅ (vigente)

### Puertas de decisión

| Puerta | Al final de | Se pasa si… | Si no se pasa… |
|---|---|---|---|
| **G0 · Seguridad** | Fase 0 | 0 fallos en 50 prompts de *red teaming* y filtro de salida activo | No hay demo con menores; reforzar el filtro con un LLM juez (doc 03 §9) |
| **G1 · Latencia** | Fase 1 | p90 ≤ 3 s con DeepSeek `deepseek-flash` (servidores en China: ≈ 0,2–0,4 s más de red, est.) | Activar TTS en streaming por frases y animación "pensando"; si sigue > 3 s, servidor en la misma red local |
| **G2 · Construible** | Fase 2 | 5 unidades A montadas por terceros en ≤ 5 h, coste ≤ USD 50 | Entregar la placa perforada ya soldada (taller sin soldar) y dejar la soldadura para mayores de 15 |
| **G3 · Taller** | Fase 3 | ≥ 80 % termina, 0 incidentes de seguridad, consentimiento firmado al 100 % | Repetir con grupo más pequeño (1 adulto por 6) |
| **G4 · Nivel 2** | Fase 4 | Presupuesto aprobado tras G3 | B queda como proyecto de club, no de taller |

### Riesgos vigilados

| Riesgo | Origen | Mitigación |
|---|---|---|
| Datos de menores salen a terceros | Servidor público de xiaozhi en China (doc 03 §2) | Servidor propio obligatorio; proveedor con "no entrenar con datos" |
| El LLM (DeepSeek) trata los datos en China y no está dirigido a menores | Términos y privacidad de DeepSeek (doc 03 §5.3) | Solo texto sin identificadores (ASR y TTS locales); consentimiento parental explícito; revisar la política del centro y del país; plan B con Ollama u otra API con formato OpenAI sin tocar el firmware |
| El filtro de DeepSeek revisa la salida al final | `safety_check` (doc 03 §5.3) | Parche propio para activarlo, filtro propio por frase y corte del audio con una frase fija si llega un rechazo; se valida en G0 |
| Contenido inapropiado | LLM pequeños más difíciles de alinear (doc 03 §5.2) | Nube con filtros por defecto; local solo en PC con modelo ≥ 7B |
| Precio de la Pi 5 sigue subiendo | Crisis de RAM 2026 (doc 02) | La C queda descartada para el MVP (2026-11-17); modo local en PC existente |
| Wake word de pago | Porcupine sin plan gratuito desde 2026-06-30 (doc 03 §3) | Push-to-talk por defecto; ESP-SR u openWakeWord |
| Voz no comercial | Licencias de Piper (doc 03 §6) | Revisar cada *model card*; usar TTS en nube con licencia clara si no hay voz libre |
| TP4056 no carga con USB-C a C | doc 02 §5 | El piloto (A) no lleva batería; en B usar IP5306 o PowerBoost |
| Marca «Bitu» sin registrar | Búsqueda de marca pendiente | Encargar la búsqueda legal (clases 9, 28 y 42) antes de publicar el nombre |
| Licencias de carcasas | BY-NC / MakerWorld Exclusive (doc 04) | Carcasa propia elegida: Delta suave (doc 09); no redistribuir diseños ajenos |
| Pantalla 1,85" sin probar con el DevKit | Placa propia en xiaozhi con driver ST77916 (doc 05) | Probar en protoboard en la fase 1; si falla, volver a la GC9A01 de 1,28" (y a la Delta suave de 10,8 cm) |
| La Delta suave no aloja la B | IPS 2" de 59 × 36 mm y servos (doc 09) | Diseñar una variante Delta para B en la fase 4 |

### Cambios del 2026-11-17

- **Carcasa elegida: Delta suave** (doc 09): prisma triangular de 11,8 cm de lado con la pantalla en el centro, 9,8 × 8,4 × 8,8 cm, 87,4 g de PLA. Cubre la acción 5.
- **Pantalla más grande en A:** redonda táctil de 1,85" (Waveshare, ST77916, Ø 5,5 cm) en lugar de la GC9A01 de 1,28". Sube la A a ≈ USD 30 / 58 y obliga a compilar una placa propia del firmware xiaozhi (riesgo nuevo abajo).
- **Alcance reducido a A (básico) y B (expresivo).** La variante A′ (ESP32-S3-BOX-3) y la propuesta C (Raspberry Pi 5) quedan aparcadas: salen del catálogo de piezas (archivadas en `tools/precios/catalogo-archivo.json`) y de la web. La fase 1 pasa a ser una demo con 3 unidades A y la puerta G2 ya no recurre a A′.
- **LLM: API de DeepSeek** (`deepseek-flash`, sin razonamiento) en lugar de Claude Haiku 5.5. Cuesta ≈ USD 0.04–0.19 por robot al mes solo de LLM (doc 03 §8). Plantilla del servidor en `tools/servidor/config-deepseek.yaml`. Riesgos nuevos: datos en China y servicio no dirigido a menores (tabla de riesgos).
- **Catálogo completado (auditoría de 3 pasadas):** entran el cable USB-A a USB-C y el cargador de 5 V 2 A (A y B), y los consumibles detallan tornillos M2,5 × 40, cabeceras, portapilas, condensador y divisor. A pasa a ≈ USD 34 / 71 y B a ≈ USD 44 / 148.
- **Raspberry Pi descartada para el MVP.** La propuesta C (Raspberry Pi 5, ≈ USD 312) pasa de «aparcada» a «descartada» por precio. El MVP usa solo ESP32-S3 (A y B); el LLM local, si hace falta, corre con Ollama en un PC del aula.

### Próximas 3 acciones (esta semana)

1. Levantar `xiaozhi-esp32-server` en un PC o VPS con la plantilla `tools/servidor/config-deepseek.yaml`: DeepSeek como LLM, ASR local y sin guardar audio.
2. Pedir el material de la A para 8 unidades (3 de demo + 5 de la fase 2) e imprimir una carcasa Delta suave de prueba para validar tolerancias.
3. Redactar el system prompt para adolescentes y el guion de 50 prompts de *red teaming*.

**Por qué esta versión es la definitiva:** convierte la lista en una secuencia con criterio de salida, fija qué se hace cuando una prueba falla y ata cada riesgo a un dato de la investigación. Lo que falta (medidas reales, revisión legal) solo se puede resolver construyendo, y el plan ya lo agenda.

