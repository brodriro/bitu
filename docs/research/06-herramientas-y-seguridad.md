# 06 · Herramientas, seguridad eléctrica y certificación

> Investigación del 2026-11-16. Los precios de las herramientas son **estimaciones** salvo que se indique la fuente. Este documento no constituye asesoría legal.

## 1. Herramientas

### Por puesto de trabajo (taller de adolescentes)

| Herramienta | Uso | Coste (est.) |
|---|---|---|
| Soldador con estación y temperatura regulable (60 W, punta cónica o bisel de 2 mm) + soporte con esponja o lana de latón | Cabeceras y cables | USD 25–60 |
| Estaño 63/37 **o sin plomo** (SAC305) con flux; recomendado sin plomo para menores | | USD 8–12 |
| Extractor de humo con filtro de carbón, o ventilación | Humos de flux | USD 25–50 |
| Gafas de seguridad | Salpicaduras de estaño o de corte | USD 3–5 |
| Pinzas, alicate de corte al ras, pelacables | | USD 10–15 |
| Multímetro básico | Continuidad, 5 V y 3,3 V, polaridad | USD 15–25 |
| Protoboard de 830 puntos + cables Dupont | Prototipado sin soldar | USD 5–8 |
| Tercera mano o soporte de PCB | | USD 8–12 |
| Cable USB-C de datos | Flashear y alimentar | USD 3–5 |

### Compartidas

| Herramienta | Coste |
|---|---|
| Impresora 3D Bambu Lab A1 mini (o servicio JLC3DP) | MSRP USD 299; USD 199.99 en el Black Friday de 2026 ([stacksheriff](https://stacksheriff.com/3d-printing/bambu-lab-pricing-2/)) |
| Soldador con punta para insertos térmicos M2/M2.5 | Reutilizar un soldador |
| Bolsa ignífuga para LiPo y caja metálica de almacenamiento (solo si hay baterías) | USD 10–20 (est.) |
| Extintor apto para fuego eléctrico en el aula + arena seca | Según la normativa del centro |
| PC o portátil con Chrome (flasheador web) o ESP-IDF 5.4+ | Existente |

## 2. Seguridad eléctrica con baterías de litio para adolescentes

### Recomendación principal

**El piloto (propuesta A) no lleva batería**: se alimenta con USB-C de 5 V y elimina el principal riesgo. Solo la propuesta B usa batería.

### Si se usa batería (propuesta B)

1. **Preferir una celda 18650 con PCB de protección** (sobrecarga, sobredescarga y cortocircuito), como la [Adafruit 1781](https://www.adafruit.com/product/1781), frente a una LiPo de bolsa. Es más resistente a pinchazos y golpes.
2. Usar **módulos de carga con protección** (TP4056 con DW01, IP5306 o PowerBoost 1000C). ⚠️ Muchos TP4056 USB-C **no cargan con cable C a C ni con cargadores PD**: usar cable A a C ([envistiamall](https://envistiamall.com/products/tp4056-dw01a-enhanced-usb-c-5v-1a-1s-lipo-battery-charger-module) y reseñas recogidas en el doc 02).
3. **Normas del aula**, basadas en las guías de [Clemson](https://www.clemson.edu/cusafety/cufd/safety/battery-safety.html), la [U. Delaware](https://www1.udel.edu/ehs/research/downloads/csm/91.pdf), la [U. Pittsburgh](https://safety.pitt.edu/sites/default/files/docs/02-009Lithium-IonBattery.pdf) y [NSTA](https://www.nsta.org/blog/lithium-based-power-supplies-safety-issues-and-protocols-revisited):
   - Cargar **siempre supervisado**, sobre una superficie no inflamable o dentro de una bolsa ignífuga, y nunca en pasillos ni vías de evacuación ([Somerset](https://external.somerset.gov.uk/dangers-of-lithiumion-batteries-in-schools)).
   - No dejar la batería conectada al cargador al terminar.
   - **Si la batería se hincha, se calienta o huele:** detener la carga, alejarla de materiales combustibles, vigilarla al menos 1 h y avisar al responsable. **El alumnado nunca debe manipular ni "arreglar" una batería hinchada.**
   - No soldar directamente sobre las celdas: usar portapilas o celdas con conector JST.
   - No guardar baterías sueltas junto a cables o piezas metálicas, por el riesgo de cortocircuito en el conector ([BYU](https://combatrobotics.byu.edu/getting-started/lipo-safety)).
   - Almacenarlas a ~40–60 % de carga en una caja metálica, y reciclarlas en un punto autorizado.
4. **Diseño:**
   - Fusible o PTC en serie (~2 A).
   - Interruptor accesible.
   - Conector con polaridad única (JST-PH).
   - Batería separada de la Pi y de los reguladores (calor).
   - Ventilación.
   - Carcasa en PETG, no en PLA, cerca de fuentes de calor.
5. **Servos:** alimentarlos desde la línea de 5 V con un condensador de 470 µF y GND común. Nunca desde el pin de 3,3 V del ESP32.
6. **Soldadura:**
   - Zona ventilada y gafas.
   - Pelo recogido.
   - El soldador siempre en su soporte.
   - Desenchufarlo al terminar.
   - Lavarse las manos después (sobre todo si el estaño lleva plomo).
   - Ratio de supervisión sugerido: 1 adulto por cada 6–8 alumnos **(est.)**.

## 3. Notas de certificación (si el piloto pasa a producto)

> Un prototipo para uso educativo interno no suele requerir certificación, pero **vender o distribuir** unidades sí. Hay que confirmarlo con un laboratorio acreditado.

| Ámbito | Qué aplica | Notas |
|---|---|---|
| **Radio, EE. UU. (FCC Part 15)** | Con un **módulo precertificado** (ESP32-S3-WROOM con FCC ID), la parte de radio queda cubierta por el *grant* del módulo; el producto anfitrión necesita pruebas de emisiones no intencionales (Part 15 **Subpart B**), normalmente por la vía SDoC | [CompliancesGate Part 15](https://www.compliancegate.com/fcc-part-15/), [Ezurio FAQ](https://www.ezurio.com/support/faqs/i-am-using-pre-certified-module-do-i-have-perform-any-certification-testing-my-end-product) |
| **Radio, UE (CE / RED 2014/53/UE)** | **No existe certificación modular**: el fabricante emite la Declaración de Conformidad del equipo completo (EMC, seguridad, radio y exposición RF). Los informes del módulo ayudan | [Silicon Labs AN1048](https://manualmachine.com/siliconlabs/an1048/17923021-user-manual), [compliancetesting CE](https://compliancetesting.com/ce-certification-for-espressif-esp32-devices/) |
| Coste orientativo | Plan de pruebas del producto anfitrión: ~USD 2500–5500 y 2–3 días (estimación de un único laboratorio) | [compliancetesting.com](https://compliancetesting.com/fcc-testing-certification-for-espressif-esp32-devices/) |
| **¿Juguete o producto infantil?** | En EE. UU., la **CPSIA** define "children's product" como el diseñado **principalmente para menores de 12 años o menos**. Un producto dirigido a adolescentes (12–19) y comercializado como tal tiende a ser "de uso general", pero el marketing y el empaquetado deciden. En la UE, la Directiva o Reglamento de seguridad de juguetes aplica a productos para menores de 14 años (**no verificado** en esta investigación) | [CPSC Children's Products](https://www.cpsc.gov/Business--Manufacturing/Business-Education/Childrens-Products), [Federal Register 2010](https://www.federalregister.gov/documents/2010/10/14/2010-25645/interpretation-of-childrens-product) |
| Baterías | El transporte de celdas de litio requiere el informe **UN 38.3** del proveedor; seguridad del equipo con IEC 62368-1 y baterías con IEC 62133-2 (**no verificado**: confirmar con un laboratorio) | — |
| Datos de menores | GDPR (art. 8), COPPA (menores de 13 en EE. UU.) y políticas del proveedor de LLM (doc 03 §9–10) | [Anthropic: organizaciones con menores](https://support.claude.com/en/articles/9307344-responsible-use-of-anthropic-s-models-guidelines-for-organizations-serving-minors) |
| Cambios que invalidan el módulo | Cambiar la antena, la disposición o una carcasa metálica alrededor de la antena del ESP32 puede invalidar las condiciones del módulo. **Dejar la antena PCB libre de metal** y fuera de la carcasa de la pantalla | [compliancetesting](https://compliancetesting.com/fcc-testing-certification-for-espressif-esp32-devices/) |

### Recomendación práctica

- Usar **módulos con certificaciones existentes**: ESP32-S3-WROOM-1 en el DevKit, ESP32-S3-BOX-3 o M5Stack, que publican sus FCC ID y CE.
- Mantener el piloto como **prototipo educativo no comercial**.
- Si se escala a la venta, presupuestar USD 5000–15 000 **(est.)** para EMC, RED, seguridad y baterías.
