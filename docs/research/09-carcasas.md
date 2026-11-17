# 09 · Diseños preliminares de carcasa (propuesta A)

> ✅ **Elegida el 2026-11-17: 5 · Delta suave**, agrandada el mismo día para llevar la **pantalla redonda táctil de 1,85" (Ø 5,5 cm)** en lugar de la GC9A01 de 1,28" (Ø 3,75 cm). Es la carcasa de la propuesta A en la documentación y en la web. Las medidas de este documento van en **centímetros**. Siguiente paso: imprimir una unidad de prueba y ajustar tolerancias (encaje de las mitades, insertos M2,5, asiento de la pantalla) y orientación de impresión. La propuesta B (IPS 2" de 5,92 × 3,55 cm y dos servos) **no cabe** en ella: necesitará una variante Delta propia en la fase 4.

> 2026-11-16. Generados con **build123d 0.13** (CAD paramétrico en Python) por `tools/carcasas/carcasas.py`, a partir de las medidas verificadas del doc 08. Entorno: `uv venv --python 3.12 tools/carcasas/.venv && uv pip install --python tools/carcasas/.venv/bin/python build123d==0.13.0`. Ejecutar: `tools/carcasas/.venv/bin/python tools/carcasas/carcasas.py`.

El script modela la electrónica como volúmenes con sus medidas de ficha (pila placa perforada + cabeceras + DevKit, pantalla Waveshare 1,28" de Ø 3,75 cm con sus pines (diseños 1–4) o 1,85" de Ø 5,5 cm (Delta suave), altavoz de cavidad 3 × 2 × 0,55 cm, MAX98357A con bornera, INMP441 y TTP223) y **comprueba que ninguno choca con la carcasa y que todos quedan dentro**. Los cinco diseños pasan la comprobación.

| | 1 · Cubo 70 | 2 · Cápsula | 3 · Lámpara |
|---|---|---|---|
| Idea | Cabeza cúbica redondeada en dos mitades sobre base redonda (evolución de la simulación) | Cilindro Ø 8 con cúpula, sin base; corte horizontal | Cabeza pequeña sobre cuello hueco y base con la electrónica; preparada para el cuello motorizado de B |
| Medidas exteriores (cm) | 7 × 7 × 8 (con base) | Ø 8 × 9,2 | 8,4 × 6,4 × 11,2 |
| Piezas impresas | 4 | 3 | 5 |
| PLA | 95,7 g · USD 1,91 | 72,3 g · USD 1,45 | 82,3 g · USD 1,65 |
| Impresión **(est.)** | ≈ 8 h | ≈ 6 h | ≈ 6,9 h |
| Micrófono–altavoz | 4 cm | 5,9 cm | 9,4 cm |
| Choques con la electrónica | ninguno | ninguno | ninguno |

Comunes: pared de 0,2 cm, pantalla GC9A01 de 1,28", pantalla inclinada (12° en cubo y cápsula, 8° en lámpara) en un marco con asiento para el PCB, rejilla del altavoz, agujero de micrófono Ø 0,2 cm, marca táctil rebajada 0,04 cm, ranuras USB-C alineadas con el DevKit, postes de 0,3 cm para la placa perforada y columnas para insertos térmicos M2,5 (Ø 0,36 cm).

**Archivos:** STL por pieza y STEP del conjunto en `cad/carcasas/<diseño>/`; resumen en `cad/carcasas/informe.json`; GLB con carcasa + piezas en `web/modelos/` (modo «Diseños de carcasa» del visor 3D, enlace `#3d-carcasa-<id>`).

**Límites:** son diseños preliminares sin imprimir; tolerancias de encaje, soportes y orientación de impresión están por validar en una impresión de prueba. Las horas y gramos son estimaciones por volumen (PLA 1,24 g/cm³, 12 g/h). El cableado no se modela como volumen.

## Diseños triangulares (2026-11-17)

Prisma triangular equilátero de pie sobre su base, con la **pantalla en el centro exacto del triángulo frontal** (centroide). La forma deja la electrónica abajo (donde el triángulo es más ancho), el micrófono y el táctil en las caras inclinadas y el altavoz en la cara trasera. Tres columnas de tornillo en las esquinas interiores unen las mitades frontal y trasera.

| | 4 · Delta | 5 · Delta suave ✅ elegida |
|---|---|---|
| Pantalla | GC9A01 1,28" (Ø 3,75 cm) | **táctil 1,85" ST77916 (Ø 5,5 cm)** |
| Lado del triángulo | 10 cm | 11,8 cm |
| Fondo del prisma | 6,4 cm | 7 cm |
| Medidas reales (ancho × fondo con marco × alto) | 9,3 × 7,6 × 8,2 cm | 9,8 × 8,4 × 8,8 cm |
| Aristas | redondeadas a 0,5 cm (nítido) | redondeadas a 1,4 cm (amable) |
| Centro de la pantalla | 2,9 cm sobre el suelo | 3,4 cm sobre el suelo |
| Piezas impresas | 3 | 3 |
| PLA | 68,6 g · USD 1,37 | 87,4 g · USD 1,75 |
| Impresión **(est.)** | ≈ 5,7 h | ≈ 7,3 h |
| Micrófono–altavoz | 4,4 cm | 5,4 cm |
| Choques con la electrónica | ninguno | ninguno |

El lado mínimo lo fija la propia electrónica: el triángulo tiene que dejar 6,34 cm de ancho libre a la altura de la placa (≈ 2 cm) y el inradio (altura del centro de la pantalla) debe ser mayor que el radio del marco: 2,23 cm con la pantalla de 1,28" y **3,1 cm con la de 1,85"**. Por eso la Delta suave pasó de 10,8 a 11,8 cm de lado (inradio 3,4 cm) y de 6,4 a 7 cm de fondo, para que la pantalla y su conector no toquen la placa. El amplificador va sobre cinta de espuma de doble cara de 0,2 cm encima del DevKit. En el visor: `#3d-carcasa-delta` y `#3d-carcasa-delta-suave`.

## Especificación técnica · Delta suave (elegida)

Valores del modelo `diseno_delta_suave()` en `tools/carcasas/carcasas.py` (origen en el centro de la base, z hacia arriba, frente hacia −Y). El script trabaja en milímetros; aquí se dan en centímetros. Sin imprimir todavía: las tolerancias se validarán con la unidad de prueba.

| Parámetro | Valor |
|---|---|
| Forma | Prisma triangular equilátero, de pie sobre una cara |
| Lado del triángulo (antes del redondeo) | 11,8 cm |
| Fondo del prisma | 7 cm (8,4 cm con el marco de la pantalla) |
| Radio de las aristas largas | 1,4 cm exterior, 1,2 cm interior |
| Medidas reales | 9,8 × 8,4 × 8,8 cm (ancho × fondo × alto, sin antena); ≈ 10,2 cm de alto con la antena |
| Pared | 0,2 cm (suelo incluido) |
| Material | PLA, capa 0,2 mm, relleno 15 % |
| Piezas | Frontal 49 g (9,75 × 4,88 × 8,82 cm) · trasera 37,1 g (9,75 × 3,5 × 8,82 cm) · antena 1,3 g (1 × 1 × 1,7 cm) |
| Total | 87,4 g de PLA · USD 1,75 · ≈ 7,3 h **(est.)** |
| Junta | Plano vertical en y = 0 (mitad frontal y trasera) |
| Unión | 3 columnas de Ø 0,6 cm en las esquinas interiores (frontal) con agujero Ø 0,36 cm para inserto térmico M2,5; en la trasera, paso Ø 0,28 cm y avellanado Ø 0,52 × 0,22 cm para la cabeza. Tornillos **M2,5 × 40** entrando por detrás: la mitad trasera es hueca y el tornillo cruza ≈ 3,3 cm hasta la columna |
| Pantalla | **Waveshare 1.85inch Touch LCD Module** (ST77916, 360 × 360, táctil CST816S): vidrio Ø 5,5 cm, área activa Ø 4,57 cm, 0,91 cm de grueso. En el centroide del triángulo frontal (3,4 cm sobre la mesa), inclinada 12° hacia arriba; marco Ø 6,2 cm que sobresale 0,6 cm, con ventana Ø 4,65 cm, asiento para el vidrio y 0,6 cm de hueco detrás para el conector GH1.25 y su cable |
| Electrónica principal | Placa perforada 6 × 4 cm sobre 4 postes de 0,3 cm del suelo, desplazada 0,75 cm a la izquierda (x = −3,35 / 1,85 cm, y = −1,2 / 2 cm); cabeceras hembra, plástico de 0,25 cm de los pines macho y DevKit encima; amplificador MAX98357A sobre cinta de espuma de doble cara de 0,2 cm encima del DevKit |
| USB-C | Una ventana de 2,55 × 0,7 cm en la cara inclinada izquierda, frente a los dos conectores del DevKit. Su boca queda a 0,49 cm de la pared y la ventana deja pasar la funda del cable (USB-C: hasta 1,24 × 0,65 cm) |
| Altavoz | Cavidad 3 × 2 × 0,55 cm contra la cara trasera, con rejilla centrada a 3,4 cm de altura |
| Micrófono | INMP441 en la cara inclinada izquierda a 6,85 cm de altura; agujero Ø 0,2 cm |
| Táctil | TTP223 en la cara inclinada derecha a 6,85 cm; marca anular rebajada (Ø 1,2 / Ø 1 cm). La pantalla también es táctil: más adelante puede sustituir al TTP223 |
| Micrófono–altavoz | 5,4 cm (mínimo pedido ≥ 3 cm) |
| Antena «bit» | Cubo de 1 cm con espiga Ø 0,38 cm en un agujero Ø 0,44 cm de la cima |
| Impresión | Cada mitad de pie sobre la junta; sin soportes salvo el marco de la pantalla |
| Comprobación | Pila del DevKit, pantalla, altavoz, amplificador, micrófono y táctil: 0 mm³ de choque y 0 mm³ fuera de la carcasa |
| Archivos | `cad/carcasas/delta-suave/` (STL de frontal, trasera y antena; STEP del conjunto) · `web/modelos/carcasa-delta-suave.glb` |

**Ajustes del 2026-11-17 al pasar la simulación 3D a la Delta suave:** se añadió al CAD el plástico de 0,25 cm de los pines macho del DevKit. La placa se desplazó 0,75 cm a la izquierda porque, centrada, el USB-C quedaba a 1,2 cm de la pared y el cable no llegaba; más a la izquierda choca con la columna inferior. Las dos ranuras USB-C pasaron a ser una sola ventana. La comprobación sigue sin choques, y el PLA baja de 87,6 a 87,4 g.

**Pendiente:** cableado no modelado como volumen; holgura de la ventana USB-C y del asiento de la pantalla; tornillos de 4 cm o columnas también en la mitad trasera; fijar la pantalla con sus 3 tornillos M2 (hoy solo apoya en el asiento); variante para la propuesta B.
