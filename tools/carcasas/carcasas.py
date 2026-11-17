#!/usr/bin/env python3
"""Genera 3 diseños preliminares de carcasa para Bitu (propuesta A) con build123d.

Las medidas de la electrónica salen de las fichas verificadas (docs/research/08-modelo-3d.md,
tools/precios/catalogo.json). Cada diseño se comprueba contra los volúmenes de las piezas:
ninguna pieza puede cortar la carcasa y todas deben quedar dentro.

Uso:
    tools/carcasas/.venv/bin/python tools/carcasas/carcasas.py
Salida:
    cad/carcasas/<diseño>/*.stl, <diseño>.step, informe.json
    web/modelos/carcasa-<diseño>.glb   (carcasa + piezas, para el visor 3D)
    docs/research/precios/../../ (no) — el resumen va en cad/carcasas/informe.json
Ejes: X derecha, Y hacia atrás (el frente mira a -Y), Z arriba. Milímetros.
"""
from __future__ import annotations

import json
import math
from pathlib import Path

from build123d import (Align, Axis, RegularPolygon, extrude, Box, Color, Compound, Cylinder, Location, Plane, Pos, Rot, Sphere,
                       export_gltf, export_step, export_stl, fillet, split, Keep)

RAIZ = Path(__file__).resolve().parents[2]
SALIDA = RAIZ / "cad" / "carcasas"
WEB = RAIZ / "web" / "modelos"

PARED = 2.0
PLA_DENSIDAD = 1.24          # g/cm³
PLA_USD_G = 0.02             # USD/g (doc 04: 15–22 USD/kg)
G_POR_HORA = 12.0            # (est.) Bambu A1 mini, capa 0,2 mm

# ---------------------------------------------------------------- medidas (doc 08)
M = {
    "devkit": (62.87, 25.4, 1.6),        # DXF Espressif v1.1
    "perfboard": (60.0, 40.0, 1.6),
    "cabecera_hembra": 8.5,              # alto de la tira hembra 2,54
    "plastico_macho": 2.5,               # separador plástico de los pines macho del DevKit (queda sobre la hembra)
    "pines_bajo_placa": 3.0,
    "alto_sobre_devkit": 3.2,            # USB-C / módulo WROOM-1 (3,1)
    "pantalla_d": 37.5, "pantalla_activa_d": 32.4, "pantalla_lengueta": 40.4,  # Waveshare 1.28"
    "pantalla_grosor": 4.5,             # PCB 1,6 + vidrio/LCD
    "pines_tras_pantalla": 9.0,
    "altavoz": (30.0, 5.5, 20.0),        # Waveshare 8 Ω 2 W (x, fondo, alto)
    "amp": (19.4, 17.8, 3.0), "amp_bornera": 8.0,  # Adafruit 3006
    "mic_d": 14.0, "mic_alto": 2.2,      # INMP441
    "tactil": (15.0, 11.0),              # TTP223
    "pines_modulo": 9.0,
    "usb_c": (9.0, 3.3),                 # receptáculo (ancho, alto)
}
INCL = 12.0  # inclinación de la pantalla (doc 04: 10–15°)

# Pantallas redondas: diámetro del módulo, área activa, grueso total y holgura por detrás (conector + cable)
PANT_128 = {"d": M["pantalla_d"], "activa": M["pantalla_activa_d"], "grosor": M["pantalla_grosor"], "detras": M["pines_tras_pantalla"]}
PANT_185 = {"d": 55.0, "activa": 45.68, "grosor": 9.1, "detras": 6.0}   # Waveshare 1.85inch Touch LCD Module (plano oficial)


def cm(x, dec=1):
    """Milímetros → texto en centímetros con coma decimal."""
    t = f"{x / 10:.{dec}f}".rstrip("0").rstrip(".") if dec else f"{x / 10:.0f}"
    return t.replace(".", ",")


def rbox(l, w, h, r):
    return fillet(Box(l, w, h).edges(), radius=r)


def cil_eje(d, largo, origen, direccion):
    """Cilindro de diámetro d que empieza en `origen` y avanza `largo` en `direccion`."""
    return Plane(origin=origen, z_dir=direccion) * Cylinder(d / 2, largo, align=(Align.CENTER, Align.CENTER, Align.MIN))


def dir_pantalla(incl=INCL):
    """Normal de la pantalla: hacia el frente (-Y) e inclinada hacia arriba."""
    a = math.radians(incl)
    return (0.0, -math.cos(a), math.sin(a))


# ---------------------------------------------------------------- volúmenes de las piezas
def pila_electronica(cx, cy, z_suelo):
    """Placa perforada sobre postes de 3 mm + cabeceras + DevKit: envolvente única."""
    # Desde la cara inferior de la placa perforada (apoyada en postes de 3 mm, que dejan sitio a las soldaduras)
    alto = M["perfboard"][2] + M["cabecera_hembra"] + M["plastico_macho"] + M["devkit"][2] + M["alto_sobre_devkit"]
    l = max(M["perfboard"][0], M["devkit"][0]) + 0.5
    z0 = z_suelo + M["pines_bajo_placa"]
    caja = Pos(cx, cy, z0 + alto / 2) * Box(l, M["perfboard"][1], alto)
    z_usb = z_suelo + M["pines_bajo_placa"] + M["perfboard"][2] + M["cabecera_hembra"] + M["plastico_macho"] + M["devkit"][2] + M["usb_c"][1] / 2
    return caja, z_usb, alto


def vol_pantalla(centro, n, p=PANT_128):
    """Pantalla + pines/conector por detrás, como cilindro a lo largo de la normal."""
    atras = (-n[0], -n[1], -n[2])
    return cil_eje(p["d"], p["grosor"] + p["detras"], centro, atras)


def vol_altavoz(x, y_pared, z, lado=1):
    """Altavoz contra una pared perpendicular a Y (lado=+1 pared trasera, -1 frontal)."""
    ax, fy, az = M["altavoz"]
    return Pos(x, y_pared - lado * fy / 2, z) * Box(ax, fy, az)


def vol_amp(x, y_pared, z, lado=1):
    fondo = M["amp"][2] + M["amp_bornera"]
    return Pos(x, y_pared - lado * fondo / 2, z) * Box(M["amp"][0], fondo, M["amp"][1])


def vol_techo(x, y, z_techo, ancho, fondo):
    """Módulo pegado al techo (mic o táctil) con sus pines hacia abajo."""
    alto = 1.6 + M["pines_modulo"]
    return Pos(x, y, z_techo - alto / 2) * Box(ancho, fondo, alto)


# ---------------------------------------------------------------- utilidades de carcasa
def marco_pantalla(centro, n, saliente=6.0, fondo=PARED + 4, p=PANT_128):
    """Marco tubular inclinado: anillo exterior, ventana y asiento del PCB."""
    exterior = cil_eje(p["d"] + 7, saliente + fondo, (centro[0] - n[0] * fondo, centro[1] - n[1] * fondo, centro[2] - n[2] * fondo), n)
    ventana = cil_eje(p["activa"] + 0.8, 40, centro, n)
    asiento = cil_eje(p["d"] + 0.6, 30, (centro[0] + n[0] * 0.2, centro[1] + n[1] * 0.2, centro[2] + n[2] * 0.2), (-n[0], -n[1], -n[2]))
    return exterior, ventana, asiento


def rejilla(cx, cz, y, r=10, paso=3.4, d=2.0):
    agujeros = None
    filas = int(r // paso)
    for i in range(-filas, filas + 1):
        for j in range(-filas, filas + 1):
            x, z = i * paso + (j % 2) * paso / 2, j * paso * 0.87
            if math.hypot(x, z) <= r:
                h = Pos(cx + x, y, cz + z) * Rot(90, 0, 0) * Cylinder(d / 2, 8)
                agujeros = h if agujeros is None else agujeros + h
    return agujeros


def postes(puntos, z0, alto=3.0, d=4.0):
    p = None
    for x, y in puntos:
        c = Pos(x, y, z0 + alto / 2) * Cylinder(d / 2, alto)
        p = c if p is None else p + c
    return p


def boss_y(x, z, y0, y1, d=6.0, agujero=3.6):
    """Columna de tornillo a lo largo de Y, con agujero para inserto térmico M2,5 (Ø 3,6)."""
    largo = abs(y1 - y0)
    yc = (y0 + y1) / 2
    col = Pos(x, yc, z) * Rot(90, 0, 0) * Cylinder(d / 2, largo)
    hueco = Pos(x, yc, z) * Rot(90, 0, 0) * Cylinder(agujero / 2, largo + 0.2)
    return col, hueco


# ---------------------------------------------------------------- diseño 1: cubo
def diseno_cubo():
    H, r = 70.0, 9.0
    z0 = 10.0                      # la cabeza se apoya en una base de 10 mm
    zc = z0 + H / 2
    exterior = Pos(0, 0, zc) * rbox(H, H, H, r)
    interior = Pos(0, 0, zc) * rbox(H - 2 * PARED, H - 2 * PARED, H - 2 * PARED, r - PARED)
    cuerpo = exterior - interior
    suelo = z0 + PARED
    techo = z0 + H - PARED

    pila, z_usb, _ = pila_electronica(0, 2, suelo)
    n = dir_pantalla()
    c_pant = (0.0, -H / 2 - 1.5, zc + 3)
    ext, vent, asiento = marco_pantalla(c_pant, n)
    cuerpo = cuerpo + ext - vent - asiento
    cuerpo = cuerpo + postes([(-26, -14), (26, -14), (-26, 18), (26, 18)], suelo)
    # rejilla trasera, micrófono, encaje de la antena, ranuras USB-C
    cuerpo -= rejilla(-11, zc + 7, H / 2)
    cuerpo -= Pos(16, 10, techo + 1) * Cylinder(1.0, 6)
    cuerpo -= Pos(0, 6, techo + 1) * Cylinder(2.2, 6)
    for y in (2 - 6.5, 2 + 6.5):
        cuerpo -= Pos(-H / 2, y, z_usb) * fillet(Box(8, 10.5, 5).edges().filter_by(Axis.X), 1.5)
    # columnas de tornillo (mitad frontal) y pasos (mitad trasera)
    huecos = []
    for x, z in [(-29, zc - 5), (29, zc - 5), (-25, techo - 5), (25, techo - 5)]:
        col, hueco = boss_y(x, z, -H / 2 + PARED - 0.1, -0.4)
        cuerpo = cuerpo + col
        huecos.append((x, z))
        cuerpo -= hueco
        cuerpo -= Pos(x, H / 4, z) * Rot(90, 0, 0) * Cylinder(1.4, H / 2 + 1)        # paso M2,5
        cuerpo -= Pos(x, H / 2 - 0.5, z) * Rot(90, 0, 0) * Cylinder(2.6, 2.2)        # cabeza del tornillo
    # marca táctil (rebaje de 0,4 mm)
    cuerpo -= Pos(-18, 14, z0 + H - 0.2) * (Cylinder(6, 0.6) - Cylinder(5, 0.6))

    # Plane.XZ tiene la normal hacia -Y (el frente): TOP es la mitad frontal
    frontal = split(cuerpo, bisect_by=Plane.XZ, keep=Keep.TOP)
    trasera = split(cuerpo, bisect_by=Plane.XZ, keep=Keep.BOTTOM)
    base = Pos(0, 0, z0 / 2) * fillet(Cylinder(26, z0).edges(), 2)
    antena = Pos(0, 6, techo + 2) * (Pos(0, 0, 5) * Cylinder(1.9, 10) + Pos(0, 0, 14) * rbox(10, 10, 10, 1.5))

    piezas = {
        "pila_devkit": pila,
        "pantalla": vol_pantalla(c_pant, n),
        "altavoz": vol_altavoz(-11, H / 2 - PARED, zc + 7),
        "amplificador": vol_amp(15, H / 2 - PARED, zc + 9),
        "microfono": vol_techo(16, 10, techo, M["mic_d"], M["mic_d"]),
        "tactil": vol_techo(-18, 14, techo, *M["tactil"]),
    }
    partes = {"carcasa_frontal": frontal, "carcasa_trasera": trasera, "base": base, "antena": antena}
    return {
        "id": "cubo", "nombre": "Cubo 70",
        "idea": "Cabeza cúbica de 7 cm con esquinas redondeadas, en dos mitades (frontal y trasera) sobre una base redonda. Es la evolución directa del modelo de la simulación.",
        "partes": partes, "piezas": piezas, "cuerpo": exterior + base + ext,
        "medidas_exteriores": "7 × 7 × 8 cm con base (sin antena)",
        "impresion": "Mitades de pie sobre la junta, sin soportes salvo el marco de la pantalla.",
        "mic_altavoz": (16, 10, techo - 5.5, -11, H / 2 - 4, zc + 7),
    }


# ---------------------------------------------------------------- diseño 2: cápsula
def diseno_capsula():
    D, alto_cil = 80.0, 52.0
    R = D / 2
    cil = Pos(0, 0, alto_cil / 2) * Cylinder(R, alto_cil)
    cupula = Pos(0, 0, alto_cil) * Sphere(R)
    exterior = cil + cupula
    exterior = fillet(exterior.edges().group_by(Axis.Z)[0], 6)
    Ri = R - PARED
    interior = Pos(0, 0, PARED + (alto_cil - PARED) / 2) * Cylinder(Ri, alto_cil - PARED) + Pos(0, 0, alto_cil) * Sphere(Ri)
    cuerpo = exterior - interior
    suelo, techo = PARED, alto_cil + Ri

    pila, z_usb, alto_pila = pila_electronica(0, 0, suelo)
    n = dir_pantalla()
    c_pant = (0.0, -R - 1.0, 54.0)
    ext, vent, asiento = marco_pantalla(c_pant, n, saliente=6, fondo=10)
    cuerpo = cuerpo + ext - vent - asiento
    cuerpo = cuerpo + postes([(-26, -16), (26, -16), (-26, 16), (26, 16)], suelo)
    cuerpo -= rejilla(0, 34, R, r=9)
    cuerpo -= Pos(0, 0, techo) * Cylinder(1.0, 8)                        # micrófono en el polo
    for y in (-6.5, 6.5):
        cuerpo -= Pos(-R, y, z_usb) * fillet(Box(10, 10.5, 5).edges().filter_by(Axis.X), 1.5)
    # unión: 3 columnas verticales en la junta (z = 30), insertos M2,5
    z_junta = 30.0
    for ang in (0, 135, 225):
        x, y = (Ri - 2.6) * math.cos(math.radians(ang)), (Ri - 2.6) * math.sin(math.radians(ang))  # solapa 0,4 mm con la pared
        cuerpo = cuerpo + Pos(x, y, z_junta) * Cylinder(3, 16)
        cuerpo -= Pos(x, y, z_junta + 4) * Cylinder(1.8, 8.2)             # inserto (mitad superior)
        cuerpo -= Pos(x, y, z_junta - 4) * Cylinder(1.4, 8.2)             # paso del tornillo
        cuerpo -= Pos(x, y, z_junta - 8 + 1) * Cylinder(2.6, 2.2)
    # táctil normal a la cúpula, atrás a la izquierda (θ = 35°, φ = 135°): marca en la piel exterior
    th, ph = math.radians(35), math.radians(135)
    u = (math.sin(th) * math.cos(ph), math.sin(th) * math.sin(ph), math.cos(th))
    centro_cup = (0.0, 0.0, alto_cil)
    p_ext = tuple(centro_cup[i] + u[i] * (R - 0.2) for i in range(3))
    cuerpo -= Plane(origin=p_ext, z_dir=u) * (Cylinder(6, 0.8) - Cylinder(5, 0.8))
    alto_t = 1.6 + M["pines_modulo"]
    p_int = tuple(centro_cup[i] + u[i] * (Ri - 1.4 - alto_t / 2) for i in range(3))
    vol_tactil = Plane(origin=p_int, z_dir=u) * Box(*M["tactil"], alto_t)
    plano = Plane.XY.offset(z_junta)
    copa = split(cuerpo, bisect_by=plano, keep=Keep.BOTTOM)
    cupula_p = split(cuerpo, bisect_by=plano, keep=Keep.TOP)
    za = alto_cil + math.sqrt(R ** 2 - 14 ** 2)
    antena = Pos(0, 14, za) * (Pos(0, 0, 3) * Cylinder(1.9, 6) + Pos(0, 0, 10) * rbox(10, 10, 10, 1.5))
    cupula_p -= Pos(0, 14, za - 2) * Cylinder(2.2, 6)

    piezas = {
        "pila_devkit": pila,
        "pantalla": vol_pantalla(c_pant, n),
        "altavoz": vol_altavoz(0, 34.0, 34),
        "amplificador": vol_amp(0, 34.0, 55),
        "microfono": vol_techo(0, 0, 52 + math.sqrt(Ri ** 2 - 9.9 ** 2) - 0.3, M["mic_d"], M["mic_d"]),
        "tactil": vol_tactil,
    }
    return {
        "id": "capsula", "nombre": "Cápsula",
        "idea": "Cuerpo cilíndrico de Ø 8 cm con cúpula: una sola pieza a la vista, sin base. Se separa en horizontal (copa con la electrónica y cúpula con pantalla, micrófono y táctil).",
        "partes": {"copa": copa, "cupula": cupula_p, "antena": antena}, "piezas": piezas, "cuerpo": exterior + ext,
        "medidas_exteriores": "Ø 8 × 9,2 cm (sin antena)",
        "impresion": "Copa boca arriba; cúpula boca abajo sobre la junta, con soportes solo en el marco de la pantalla.",
        "mic_altavoz": (0, 0, techo - 6, 0, 31, 34),
    }


# ---------------------------------------------------------------- diseño 3: lámpara (cabeza + cuello + base)
def diseno_lampara():
    BL, BF, BA, br = 84.0, 64.0, 38.0, 8.0
    base_ext = Pos(0, 0, BA / 2) * rbox(BL, BF, BA, br)
    base_int = Pos(0, 0, BA / 2) * rbox(BL - 2 * PARED, BF - 2 * PARED, BA - 2 * PARED, br - PARED)
    base = base_ext - base_int
    suelo, techo_base = PARED, BA - PARED

    pila, z_usb, _ = pila_electronica(0, 8, suelo)
    base = base + postes([(-26, -8), (26, -8), (-26, 24), (26, 24)], suelo)
    base -= rejilla(-14, 19, -BF / 2, r=8)                                 # altavoz al frente de la base
    for y in (8 - 6.5, 8 + 6.5):
        base -= Pos(-BL / 2, y, z_usb) * fillet(Box(10, 10.5, 5).edges().filter_by(Axis.X), 1.5)

    # cuello hueco
    CA, CD, Cd = 24.0, 18.0, 11.0
    cuello = Pos(0, 4, BA + CA / 2 - 1) * (Cylinder(CD / 2, CA + 2) - Cylinder(Cd / 2, CA + 4))
    base -= Pos(0, 4, BA - PARED / 2) * Cylinder(Cd / 2, PARED + 2)

    # cabeza
    HL, HF, HA, hr = 54.0, 38.0, 50.0, 10.0
    hz = BA + CA + HA / 2
    hy = 0.0
    cab_ext = Pos(0, hy, hz) * rbox(HL, HF, HA, hr)
    cab_int = Pos(0, hy, hz) * rbox(HL - 2 * PARED, HF - 2 * PARED, HA - 2 * PARED, hr - PARED)
    cabeza = cab_ext - cab_int
    cabeza -= Pos(0, 4, hz - HA / 2 + PARED / 2) * Cylinder(Cd / 2, PARED + 2)
    n = dir_pantalla(8)
    c_pant = (0.0, hy - HF / 2 - 1.0, hz + 1)
    ext, vent, asiento = marco_pantalla(c_pant, n, saliente=4)
    cabeza = cabeza + ext - vent - asiento
    techo = hz + HA / 2 - PARED
    cabeza -= Pos(10, hy + 2, techo + 1) * Cylinder(1.0, 6)                 # micrófono
    cabeza -= Pos(0, hy - 9, techo + 1) * Cylinder(2.2, 6)                  # antena
    cabeza -= Pos(-9, hy + 2, hz + HA / 2 - 0.2) * (Cylinder(6, 0.6) - Cylinder(5, 0.6))
    for x, z in [(-21, hz - 14), (21, hz - 14), (-21, hz + 14), (21, hz + 14)]:
        col, hueco = boss_y(x, z, hy - HF / 2 + PARED - 0.1, hy - 0.4, d=5.5, agujero=3.6)
        cabeza = cabeza + col
        cabeza -= hueco
        cabeza -= Pos(x, hy + HF / 4, z) * Rot(90, 0, 0) * Cylinder(1.4, HF / 2 + 1)
        cabeza -= Pos(x, hy + HF / 2 - 0.5, z) * Rot(90, 0, 0) * Cylinder(2.6, 2.2)
    cab_frontal = split(cabeza, bisect_by=Plane.XZ.offset(-hy), keep=Keep.TOP)
    cab_trasera = split(cabeza, bisect_by=Plane.XZ.offset(-hy), keep=Keep.BOTTOM)

    # base: bandeja + tapa (corte a z = BA - 8) con el cuello unido a la tapa
    plano = Plane.XY.offset(BA - 8)
    bandeja = split(base, bisect_by=plano, keep=Keep.BOTTOM)
    tapa = split(base, bisect_by=plano, keep=Keep.TOP) + cuello
    for x, y in [(-BL / 2 + 7, -BF / 2 + 7), (BL / 2 - 7, -BF / 2 + 7), (-BL / 2 + 7, BF / 2 - 7), (BL / 2 - 7, BF / 2 - 7)]:
        col = Pos(x, y, (BA - 8) / 2 + PARED / 2) * Cylinder(3, BA - 8 - PARED)
        bandeja = bandeja + col - Pos(x, y, BA - 8 - 4) * Cylinder(1.8, 8.2)
        tapa -= Pos(x, y, BA - 1) * Cylinder(1.4, 10)
    antena = Pos(0, hy - 9, techo + 2) * (Pos(0, 0, 5) * Cylinder(1.9, 10) + Pos(0, 0, 14) * rbox(10, 10, 10, 1.5))

    piezas = {
        "pila_devkit": pila,
        "pantalla": vol_pantalla(c_pant, n),
        "altavoz": vol_altavoz(-14, -BF / 2 + PARED, 19, lado=-1),
        "amplificador": vol_amp(20, -BF / 2 + PARED, 19, lado=-1),
        "microfono": vol_techo(10, hy + 2, techo, M["mic_d"], M["mic_d"]),
        "tactil": vol_techo(-9, hy + 2, techo, *M["tactil"]),
    }
    return {
        "id": "lampara", "nombre": "Lámpara",
        "idea": "Cabeza pequeña (5,4 × 3,8 × 5 cm) sobre un cuello hueco y una base de 8,4 × 6,4 cm que guarda la electrónica y el altavoz. Recuerda a un flexo y deja sitio para añadir el cuello motorizado de la propuesta B.",
        "partes": {"base_bandeja": bandeja, "base_tapa_cuello": tapa, "cabeza_frontal": cab_frontal, "cabeza_trasera": cab_trasera, "antena": antena},
        "piezas": piezas, "cuerpo": base_ext + cuello + cab_ext + ext,
        "medidas_exteriores": "8,4 × 6,4 × 11,2 cm (sin antena)",
        "impresion": "Bandeja y tapa boca arriba; mitades de la cabeza sobre la junta. Cuello impreso de pie con la tapa.",
        "mic_altavoz": (10, hy + 2, techo - 5, -14, -BF / 2 + 4, 19),
    }


# ---------------------------------------------------------------- diseños 4 y 5: prisma triangular (Delta)
def prisma_triangular(a, L, rf):
    """Prisma equilátero de lado `a` y fondo `L`, base apoyada en z = 0, frente en -Y, aristas largas redondeadas `rf`."""
    rc = a / math.sqrt(3)                                    # radio circunscrito
    perfil = Plane.XZ * RegularPolygon(rc, 3, rotation=90)    # vértice arriba, centroide en el origen
    cuerpo = extrude(perfil, amount=L / 2, both=True)
    cuerpo = fillet(cuerpo.edges().filter_by(Axis.Y), rf)
    return Pos(0, 0, rc / 2) * cuerpo                       # base en z = 0 (inradio = rc / 2)


def diseno_delta(id_, nombre, a, rf, L=64.0, pant=PANT_128, y_pila=2.0, x_pila=0.0):
    r = a / (2 * math.sqrt(3))                               # inradio = altura del centroide
    h = 3 * r
    exterior = prisma_triangular(a, L, rf)
    a_in = a - 2 * PARED * math.sqrt(3)                      # mismo centroide, inradio menor en PARED
    rf_in = max(rf - PARED, 0.6)
    interior = Pos(0, 0, r - (a_in / (2 * math.sqrt(3)))) * prisma_triangular(a_in, L - 2 * PARED, rf_in)
    cuerpo = exterior - interior
    suelo = PARED
    r_in = a_in / (2 * math.sqrt(3)); h_in = 3 * r_in
    semiancho_in = lambda z: (a_in / 2) * (1 - (z - suelo) / h_in)
    semiancho = lambda z: (a / 2) * (1 - z / h)

    # pantalla en el centro geométrico de la cara frontal (centroide del triángulo)
    n = dir_pantalla()
    c_pant = (0.0, -L / 2 - 1.5, r)
    ext, vent, asiento = marco_pantalla(c_pant, n, fondo=(PARED + 4 if pant is PANT_128 else 10.0), p=pant)
    cuerpo = cuerpo + ext - vent - asiento

    pila, z_usb, _ = pila_electronica(x_pila, y_pila, suelo)
    usb_hueco = semiancho_in(z_usb) - (-x_pila + M["devkit"][0] / 2 + 0.85)   # pared interior → boca del USB-C (sobresale 0,85)
    cuerpo = cuerpo + postes([(x_pila - 26, y_pila - 16), (x_pila + 26, y_pila - 16), (x_pila - 26, y_pila + 16), (x_pila + 26, y_pila + 16)], suelo)
    # una sola ventana para los dos USB-C: deja pasar también la funda del cable (hasta 12,35 × 6,5 mm, norma USB-C)
    cuerpo -= Pos(-semiancho(z_usb), y_pila, z_usb) * fillet(Box(14, 25.5, 7).edges().filter_by(Axis.X), 2)

    z_alt = 34.0
    cuerpo -= rejilla(0, z_alt, L / 2)                                   # altavoz en la cara trasera

    # micrófono y táctil en las caras inclinadas (izquierda y derecha), a 2/3 de la altura
    z_mod = 0.67 * h
    piezas_cara = {}
    for lado, y_mod, nombre_mod, dims in ((-1, -8.0, "microfono", (M["mic_d"], M["mic_d"])), (1, 8.0, "tactil", M["tactil"])):
        nrm = (lado * math.cos(math.radians(30)), 0.0, math.sin(math.radians(30)))   # normal exterior de la cara
        p_in = (lado * semiancho_in(z_mod), y_mod, z_mod)
        alto = 1.6 + M["pines_modulo"]
        centro = tuple(p_in[i] - nrm[i] * (alto / 2 + 0.3) for i in range(3))
        piezas_cara[nombre_mod] = Plane(origin=centro, x_dir=(0, 1, 0), z_dir=nrm) * Box(dims[1], dims[0], alto)
        p_out = (lado * semiancho(z_mod - PARED * 0.5), y_mod, z_mod)
        if nombre_mod == "microfono":
            cuerpo -= cil_eje(2.0, 8, tuple(p_in[i] - nrm[i] * 1 for i in range(3)), nrm)
        else:
            cuerpo -= Plane(origin=tuple(p_out[i] + nrm[i] * 0.1 for i in range(3)), x_dir=(0, 1, 0), z_dir=nrm) * (Cylinder(6, 0.8) - Cylinder(5, 0.8))

    # columnas de tornillo en las tres esquinas interiores (mitad frontal), pasos en la trasera
    s = max(rf_in + 2.6, 5.2)
    esquinas = [(-a_in / 2 + s * math.cos(math.radians(30)), suelo + s * math.sin(math.radians(30))),
                (a_in / 2 - s * math.cos(math.radians(30)), suelo + s * math.sin(math.radians(30))),
                (0.0, suelo + h_in - s)]
    for x, z in esquinas:
        col, hueco = boss_y(x, z, -L / 2 + PARED - 0.1, -0.4)
        cuerpo = cuerpo + col - hueco
        cuerpo -= Pos(x, L / 4, z) * Rot(90, 0, 0) * Cylinder(1.4, L / 2 + 1)
        cuerpo -= Pos(x, L / 2 - 0.5, z) * Rot(90, 0, 0) * Cylinder(2.6, 2.2)

    z_apice = h - rf                                                      # cima redondeada
    cuerpo -= Pos(0, 10, z_apice - 1) * Cylinder(2.2, 8)
    antena = Pos(0, 10, z_apice - 3) * (Pos(0, 0, 4) * Cylinder(1.9, 8) + Pos(0, 0, 12) * rbox(10, 10, 10, 1.5))

    frontal = split(cuerpo, bisect_by=Plane.XZ, keep=Keep.TOP)
    trasera = split(cuerpo, bisect_by=Plane.XZ, keep=Keep.BOTTOM)
    piezas = {
        "pila_devkit": pila,
        "pantalla": vol_pantalla(c_pant, n, pant),
        "altavoz": vol_altavoz(0, L / 2 - PARED, z_alt),
        "amplificador": Pos(0, 10, suelo + 3 + 17.4 + 2 + 5.5) * Box(M["amp"][0], M["amp"][1], M["amp"][2] + M["amp_bornera"]),
        "microfono": piezas_cara["microfono"],
        "tactil": piezas_cara["tactil"],
    }
    mic_c = (-semiancho_in(z_mod) + 5, -8.0, z_mod)
    return {
        "id": id_, "nombre": nombre,
        "idea": (f"Prisma triangular equilátero de {cm(a)} cm de lado y {cm(L)} cm de fondo, de pie sobre su base. La pantalla redonda "
                 f"(Ø {cm(pant['d'], 2)} cm) va en el centro exacto del triángulo frontal (centroide, a {cm(r)} cm del suelo); micrófono y "
                 f"táctil en las caras inclinadas y altavoz en la cara trasera. Aristas redondeadas a {cm(rf)} cm."),
        "partes": {"frontal": frontal, "trasera": trasera, "antena": antena}, "piezas": piezas,
        "cuerpo": exterior + ext,
        "medidas_exteriores": (lambda bb: f"{cm(bb.size.X)} × {cm(bb.size.Y)} × {cm(bb.size.Z)} cm (ancho × fondo con marco × alto, sin antena); triángulo de {cm(a)} cm de lado antes del redondeo")((exterior + ext).bounding_box()),
        "impresion": "Cada mitad de pie sobre la junta; sin soportes salvo el marco de la pantalla. Las tres columnas de las esquinas reciben insertos M2,5.",
        "mic_altavoz": (*mic_c, 0, L / 2 - 4, z_alt),
        "usb_hueco": usb_hueco,
    }


def diseno_delta_nitido():
    return diseno_delta("delta", "Delta", a=100.0, rf=5.0)


def diseno_delta_suave():
    # x_pila = −7,5: el DevKit se acerca a la cara izquierda (con 0 el USB-C quedaba a 12 mm de la pared y el cable no llegaba);
    # más a la izquierda choca con la columna de tornillo de la esquina inferior
    return diseno_delta("delta-suave", "Delta suave", a=118.0, rf=14.0, L=70.0, pant=PANT_185, y_pila=4.0, x_pila=-7.5)


# ---------------------------------------------------------------- comprobaciones y exportación
COLORES = {
    "pila_devkit": (0.11, 0.11, 0.14), "pantalla": (0.07, 0.07, 0.10), "altavoz": (0.15, 0.15, 0.18),
    "amplificador": (0.11, 0.18, 0.42), "microfono": (0.12, 0.25, 0.66), "tactil": (0.70, 0.15, 0.18),
}
COLOR_PLA = {"antena": (0.88, 0.27, 0.56)}


def comprobar(d):
    carcasa = None
    for p in d["partes"].values():
        carcasa = p if carcasa is None else carcasa + p
    res = {}
    for nombre, vol in d["piezas"].items():
        choque = (vol & carcasa).volume if vol else 0
        fuera = (vol - d["cuerpo"]).volume
        res[nombre] = {"choque_mm3": round(choque, 1), "fuera_mm3": round(fuera, 1), "ok": choque < 1 and fuera < 1}
    mx, my, mz, ax, ay, az = d["mic_altavoz"]
    res["distancia_mic_altavoz_mm"] = round(math.dist((mx, my, mz), (ax, ay, az)), 1)
    if "usb_hueco" in d:
        res["usb_pared_mm"] = round(d["usb_hueco"], 1)   # de la boca del USB-C a la cara interior de la pared
    return res


def exportar(d):
    carpeta = SALIDA / d["id"]
    carpeta.mkdir(parents=True, exist_ok=True)
    partes_info, total_g = {}, 0.0
    hijos = []
    for nombre, solido in d["partes"].items():
        export_stl(solido, str(carpeta / f"{nombre}.stl"))
        g = solido.volume / 1000 * PLA_DENSIDAD
        total_g += g
        bb = solido.bounding_box()
        partes_info[nombre] = {"gramos": round(g, 1), "caja_mm": [round(bb.size.X, 1), round(bb.size.Y, 1), round(bb.size.Z, 1)]}
        s = solido.moved(Location())
        s.label = f"carcasa:{nombre}"
        s.color = Color(*COLOR_PLA.get(nombre, (0.17, 0.25, 0.84)))
        hijos.append(s)
    for nombre, vol in d["piezas"].items():
        v = vol.moved(Location())
        v.label = f"pieza:{nombre}"
        v.color = Color(*COLORES[nombre])
        hijos.append(v)
    ensamblaje = Compound(label=d["id"], children=hijos)
    export_step(ensamblaje, str(carpeta / f"{d['id']}.step"))
    WEB.mkdir(parents=True, exist_ok=True)
    export_gltf(ensamblaje, str(WEB / f"carcasa-{d['id']}.glb"), binary=True, linear_deflection=0.08, angular_deflection=0.3)
    return partes_info, total_g


def main():
    informe = []
    for hacer in (diseno_cubo, diseno_capsula, diseno_lampara, diseno_delta_nitido, diseno_delta_suave):
        d = hacer()
        checks = comprobar(d)
        partes, g = exportar(d)
        info = {
            "id": d["id"], "nombre": d["nombre"], "idea": d["idea"],
            "medidas_exteriores": d["medidas_exteriores"], "impresion": d["impresion"],
            "partes": partes, "gramos_pla": round(g, 1), "coste_pla_usd": round(g * PLA_USD_G, 2),
            "horas_impresion_est": round(g / G_POR_HORA, 1), "comprobaciones": checks,
            "todo_cabe": all(v["ok"] for k, v in checks.items() if isinstance(v, dict)),
        }
        informe.append(info)
        print(f"{d['id']:<8} {g:6.1f} g  cabe={info['todo_cabe']}  mic-altavoz={checks['distancia_mic_altavoz_mm']} mm  "
              + " ".join(f"{k}:{'✓' if v['ok'] else '✗ choque=%s fuera=%s' % (v['choque_mm3'], v['fuera_mm3'])}"
                         for k, v in checks.items() if isinstance(v, dict)))
    (SALIDA / "informe.json").write_text(json.dumps(informe, ensure_ascii=False, indent=2), encoding="utf-8")
    (WEB / "carcasas.json").write_text(json.dumps(informe, ensure_ascii=False, indent=1), encoding="utf-8")


if __name__ == "__main__":
    main()
