# Product

<!-- impeccable:product-schema 1 -->

## Platform

web

## Stack

delegated: HTML/CSS/JS estático sin build, en `web/`. Elegido porque el sitio es un documento de investigación sin estado, debe abrirse con doble clic o con `python3 -m http.server`, y el contenido vive en `docs/` (Markdown) como fuente de verdad.

## Users

Lector principal (confirmado): el **equipo técnico / makers** que construirá el piloto. Necesitan decidir qué hardware comprar, cuánto cuesta, cómo cablearlo y ensamblarlo, y qué arquitectura de software usar. Usuario final del robot (no de la web): jóvenes y adolescentes de 12–19 años, principalmente hispanohablantes.

## Product Purpose

Piloto de un mini robot asistente IA físico de escritorio (cara en pantalla, micrófono, altavoz, movimiento opcional) que responde vía API de LLM en la nube o modelo local. La web reúne la investigación (estado del arte, componentes y precios, software, carcasas, propuestas de ensamble, seguridad), el nombre del proyecto y el plan de mejora. Éxito: el equipo puede pedir piezas y empezar a ensamblar la propuesta recomendada sin buscar fuera.

## Positioning

Robot abierto y construible por el propio equipo con piezas de ~USD 22–50, con cerebro intercambiable (nube o local) y pensado para adolescentes, no para niños pequeños.

## Capabilities and Constraints

- Nombre del proyecto: **Bitu** (definitivo; búsqueda de marca legal pendiente).
- Propuesta recomendada para el piloto: A (ESP32-S3 cliente ligero + servidor propio).
- Todo precio y dato proviene de `docs/` con fuente y fecha; los estimados se marcan como tales.
- Idioma: español.

## Evidence on Hand

Investigación en `docs/research/` (~125 URLs en `fuentes.md`). No hay fotos propias del robot, prototipos medidos, ni latencias medidas en hardware real: no inventarlas.

## Product Principles

1. Construible primero: cada decisión se traduce en una pieza comprable y un paso de ensamble.
2. Honestidad de datos: precio con fuente y fecha; estimado marcado.
3. Seguro para adolescentes: servidor propio, filtrado de contenido, LiPo protegida.
4. Cerebro intercambiable: nube o local sin cambiar el hardware.
