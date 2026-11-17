#!/usr/bin/env python3
"""Lee precios de las piezas de Bitu desde páginas de producto públicas.

Reglas (a propósito):
- Solo lee URL que robots.txt permite para nuestro User-Agent y respeta Crawl-delay.
- Una petición por URL, con pausa entre peticiones al mismo dominio.
- Si una tienda responde 403/429 o una página de verificación, se registra como
  "bloqueado" y NO se reintenta ni se intenta esquivar.
- Sin dependencias: solo la biblioteca estándar.

Uso:
    python3 tools/precios/scrape_precios.py            # escribe docs/research/precios/
    python3 tools/precios/scrape_precios.py --solo adafruit
"""
from __future__ import annotations

import argparse
import datetime as dt
import html
import json
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import urllib.robotparser
from pathlib import Path

RAIZ = Path(__file__).resolve().parents[2]
CATALOGO = Path(__file__).with_name("catalogo.json")
SALIDA = RAIZ / "docs" / "research" / "precios"
UA = "minirobot-precios/0.1 (investigacion de precios para un piloto educativo)"
PAUSA_MIN = 4.0  # segundos entre peticiones al mismo dominio
FX_URL = "https://open.er-api.com/v6/latest/USD"

_robots: dict[str, urllib.robotparser.RobotFileParser | None] = {}
_ultima: dict[str, float] = {}


def _robots_para(url: str) -> urllib.robotparser.RobotFileParser | None:
    p = urllib.parse.urlsplit(url)
    base = f"{p.scheme}://{p.netloc}"
    if base not in _robots:
        rp = urllib.robotparser.RobotFileParser()
        try:
            req = urllib.request.Request(base + "/robots.txt", headers={"User-Agent": UA})
            with urllib.request.urlopen(req, timeout=20) as r:
                rp.parse(r.read().decode("utf-8", "ignore").splitlines())
        except Exception:
            rp = None  # sin robots legible: se trata como permitido
        _robots[base] = rp
    return _robots[base]


def _esperar(url: str) -> None:
    dom = urllib.parse.urlsplit(url).netloc
    rp = _robots_para(url)
    delay = PAUSA_MIN
    if rp is not None:
        cd = rp.crawl_delay(UA)
        if cd:
            delay = max(delay, float(cd))
    falta = _ultima.get(dom, 0) + delay - time.monotonic()
    if falta > 0:
        time.sleep(falta)
    _ultima[dom] = time.monotonic()


def descargar(url: str) -> tuple[str, str | None]:
    """Devuelve (estado, html). estado: ok | robots | bloqueado | error:<msg>."""
    rp = _robots_para(url)
    if rp is not None and not rp.can_fetch(UA, url):
        return "robots", None
    _esperar(url)
    req = urllib.request.Request(url, headers={
        "User-Agent": UA,
        "Accept": "text/html,application/xhtml+xml",
        "Accept-Language": "es,en;q=0.8",
    })
    try:
        with urllib.request.urlopen(req, timeout=30) as r:
            cuerpo = r.read().decode("utf-8", "ignore")
    except urllib.error.HTTPError as e:
        return ("bloqueado" if e.code in (401, 403, 429) else f"error:HTTP {e.code}"), None
    except Exception as e:  # red, DNS, timeout
        return f"error:{type(e).__name__}", None
    if re.search(r"(?i)captcha|press &amp; hold|are you a robot|access denied", cuerpo[:20000]) and len(cuerpo) < 30000:
        return "bloqueado", None
    return "ok", cuerpo


def _productos_jsonld(doc: str):
    for m in re.finditer(r'<script[^>]+application/ld\+json[^>]*>(.*?)</script>', doc, re.S | re.I):
        try:
            data = json.loads(html.unescape(m.group(1).strip()))
        except json.JSONDecodeError:
            continue
        pila = [data]
        while pila:
            n = pila.pop()
            if isinstance(n, list):
                pila.extend(n)
            elif isinstance(n, dict):
                t = n.get("@type")
                if t == "Product" or (isinstance(t, list) and "Product" in t):
                    yield n
                pila.extend(v for k, v in n.items() if k in ("@graph", "mainEntity", "itemListElement"))


def extraer_precio(doc: str) -> dict | None:
    """Precio del producto principal desde JSON-LD; si no hay, metadatos og/itemprop."""
    for prod in _productos_jsonld(doc):
        ofertas = prod.get("offers")
        if isinstance(ofertas, dict):
            ofertas = [ofertas]
        for o in ofertas or []:
            precio = o.get("price", o.get("lowPrice"))
            if precio in (None, ""):
                continue
            try:
                precio = float(str(precio).replace(",", ""))
            except ValueError:
                continue
            disp = str(o.get("availability", "")).rsplit("/", 1)[-1] or None
            return {"precio": precio, "moneda": o.get("priceCurrency"), "disponible": disp,
                    "titulo": prod.get("name"), "metodo": "json-ld"}
    m = re.search(r'property="product:price:amount"\s+content="([\d.,]+)"', doc)
    if m:
        c = re.search(r'property="product:price:currency"\s+content="([A-Z]{3})"', doc)
        a = re.search(r'property="(?:product|og):availability"\s+content="([^"]+)"', doc)
        t = re.search(r'property="og:title"\s+content="([^"]+)"', doc)
        return {"precio": float(m.group(1).replace(",", "")), "moneda": c.group(1) if c else None,
                "disponible": a.group(1) if a else None, "titulo": html.unescape(t.group(1)) if t else None,
                "metodo": "og:price"}
    return None


def extraer_imagen(doc: str) -> str | None:
    m = re.search(r'<meta[^>]+property="og:image(?::secure_url)?"[^>]+content="([^"]+)"', doc) or \
        re.search(r'<meta[^>]+content="([^"]+)"[^>]+property="og:image"', doc)
    if not m:
        return None
    url = html.unescape(m.group(1))
    url = "https:" + url if url.startswith("//") else url
    if not re.search(r"\.(jpe?g|png|webp|gif)(\?|$)", url, re.I):
        # og:image sin extensión: busca la misma foto con extensión dentro de la página
        base = re.escape(url.rstrip("/").rsplit("/", 1)[-1])
        alt = re.search(r'(https?:)?//[^"\'\s>]*/' + base + r'\.(?:jpe?g|png|webp)', doc, re.I)
        if alt:
            url = alt.group(0)
            url = "https:" + url if url.startswith("//") else url
    return url


def tasas_usd() -> tuple[dict[str, float], str | None]:
    try:
        req = urllib.request.Request(FX_URL, headers={"User-Agent": UA})
        with urllib.request.urlopen(req, timeout=20) as r:
            d = json.load(r)
        return d["rates"], d.get("time_last_update_utc")
    except Exception:
        return {"USD": 1.0}, None


def main() -> int:
    ap = argparse.ArgumentParser(description=__doc__.splitlines()[0])
    ap.add_argument("--solo", help="Filtra fuentes por nombre de tienda (sin mayúsculas)")
    ap.add_argument("--salida", type=Path, default=SALIDA)
    args = ap.parse_args()

    cat = json.loads(CATALOGO.read_text(encoding="utf-8"))
    tasas, fx_fecha = tasas_usd()
    hoy = dt.date.today().isoformat()
    resultados = []

    for pieza in cat["piezas"]:
        lecturas = []
        for f in pieza["fuentes"]:
            if args.solo and args.solo.lower() not in f["tienda"].lower():
                continue
            if f.get("referencia"):  # solo enlace de referencia (medidas), sin petición
                lecturas.append({"tienda": f["tienda"], "url": f["url"], "estado": "referencia", "nota": f.get("nota")})
                continue
            if "manual" in f:  # precio anotado a mano (búsqueda web), sin petición
                m = f["manual"]
                tasa = tasas.get(m["moneda"])
                lec = {"tienda": f["tienda"], "url": f["url"], "estado": "manual", "nota": f.get("nota"),
                       "precio": m["precio"], "moneda": m["moneda"], "fecha": m.get("fecha"),
                       "unidades": m.get("unidades", 1), "disponible": m.get("disponible"),
                       "precio_usd": round(m["precio"] / m.get("unidades", 1) / tasa, 2) if tasa else None,
                       "metodo": "búsqueda web"}
                lecturas.append(lec)
                continue
            estado, doc = descargar(f["url"])
            lec = {"tienda": f["tienda"], "url": f["url"], "estado": estado, "nota": f.get("nota")}
            if estado == "ok":
                lec["imagen"] = extraer_imagen(doc)
                p = extraer_precio(doc)
                if p is None:
                    lec["estado"] = "sin_precio"
                else:
                    mon = p["moneda"] or f.get("moneda_esperada") or "USD"
                    tasa = tasas.get(mon)
                    u = f.get("unidades", 1)  # packs: el precio leído es del pack; se reparte por unidad
                    lec.update(p, moneda=mon, unidades=u,
                               precio_usd=round(p["precio"] / u / tasa, 2) if tasa else None)
            print(f"  {pieza['id']:<10} {f['tienda']:<16} {lec['estado']:<10} "
                  f"{lec.get('precio', '')} {lec.get('moneda', '')}", file=sys.stderr)
            lecturas.append(lec)
        validas = [l["precio_usd"] for l in lecturas
                   if l["estado"] == "ok" and l.get("precio_usd") is not None and l["precio_usd"] > 0]
        imagen = next((l["imagen"] for l in lecturas if l.get("imagen")), None)
        resultados.append({
            "id": pieza["id"], "nombre": pieza["nombre"], "cantidad": pieza["cantidad"],
            "categoria": pieza.get("categoria"), "uso": pieza.get("uso"), "imagen": imagen,
            "modelo": pieza.get("modelo"), "medidas": pieza.get("medidas"), "fuente_medidas": pieza.get("fuente_medidas"),
            "alternativa": bool(pieza.get("alternativa")),
            "barato_est": pieza["barato_est"], "retail_doc": pieza["retail_doc"],
            "retail_min_leido": min(validas) if validas else None,
            "lecturas": lecturas,
        })

    # Totales por propuesta
    totales = {}
    propuestas = sorted({p for r in resultados for p in r["cantidad"]})
    for prop in propuestas:
        retail = barato = doc = 0.0
        barato_ok = True
        fallback = []
        for r in resultados:
            q = r["cantidad"].get(prop, 0)
            if not q:
                continue
            if r["retail_min_leido"] is not None:
                retail += q * r["retail_min_leido"]
            else:
                retail += q * r["retail_doc"]
                fallback.append(r["id"])
            doc += q * r["retail_doc"]
            if r["barato_est"] is None:
                barato_ok = False
            else:
                barato += q * r["barato_est"]
        fijo = cat["fijos"].get(prop, {})
        retail += fijo.get("retail", 0)
        doc += fijo.get("retail", 0)
        barato += fijo.get("barato", 0)
        totales[prop] = {"retail": round(retail, 2), "retail_doc": round(doc, 2), "barato_est": round(barato, 2) if barato_ok else None,
                         "piezas_con_precio_del_documento": fallback}

    args.salida.mkdir(parents=True, exist_ok=True)
    salida = {"fecha": hoy, "tipo_cambio": {"fuente": FX_URL, "actualizado": fx_fecha},
              "user_agent": UA, "piezas": resultados, "totales": totales}
    (args.salida / "ultimo.json").write_text(json.dumps(salida, ensure_ascii=False, indent=2), encoding="utf-8")
    (args.salida / f"informe-{hoy}.md").write_text(informe(salida), encoding="utf-8")
    web = RAIZ / "web" / "catalogo-datos.js"
    web.write_text("// Generado por tools/precios/scrape_precios.py. No editar a mano.\n"
                   "window.CATALOGO = " + json.dumps(salida, ensure_ascii=False, indent=1) + ";\n", encoding="utf-8")
    print(f"Escrito {web}", file=sys.stderr)
    print(f"Escrito {args.salida}/ultimo.json y informe-{hoy}.md", file=sys.stderr)
    return 0


def informe(s: dict) -> str:
    fmt = lambda x: "—" if x is None else f"{x:,.2f}".replace(",", " ").replace(".", ",")
    L = [f"# Precios leídos · {s['fecha']}", "",
         "> Generado por `tools/precios/scrape_precios.py`. Solo páginas de producto que robots.txt permite;",
         "> las tiendas que bloquean lecturas automáticas quedan como **bloqueado** y se usa el precio del doc 02/05.",
         f"> Tipo de cambio: {s['tipo_cambio']['fuente']} ({s['tipo_cambio']['actualizado'] or 'no disponible'}). Sin envío ni impuestos.", "",
         "## Totales por propuesta", "",
         "| Propuesta | Retail leído hoy (USD) | Retail del doc 05 (USD) | Barato (est., USD) | Piezas sin lectura (precio del doc) |",
         "|---|---|---|---|---|"]
    for k, t in s["totales"].items():
        L.append(f"| {k} | **{fmt(t['retail'])}** | {fmt(t['retail_doc'])} | {fmt(t['barato_est'])} | {', '.join(t['piezas_con_precio_del_documento']) or '—'} |")
    L += ["", "Incluye consumibles fijos (carcasa, cables, tornillos) del doc 02 §7.", "",
          "## Detalle por pieza", "",
          "| Pieza | Doc (retail) | Leído hoy (mín.) | Fuentes |", "|---|---|---|---|"]
    for r in s["piezas"]:
        fu = []
        for l in r["lecturas"]:
            if l["estado"] == "referencia":
                fu.append(f"[{l['tienda']}]({l['url']}): referencia de medidas")
            elif l.get("precio") is not None and l["estado"] == "manual":
                fu.append(f"[{l['tienda']}]({l['url']}): {fmt(l['precio'])} {l['moneda']} (búsqueda web)")
            elif l.get("precio") is not None:
                extra = f" {l['moneda']}" if l["moneda"] != "USD" else ""
                disp = f", {l['disponible']}" if l.get("disponible") else ""
                fu.append(f"[{l['tienda']}]({l['url']}): {fmt(l['precio'])}{extra} → USD {fmt(l['precio_usd'])}{disp}")
            else:
                fu.append(f"[{l['tienda']}]({l['url']}): {l['estado']}")
        L.append(f"| {r['nombre']} | {fmt(r['retail_doc'])} | {fmt(r['retail_min_leido'])} | {'<br>'.join(fu)} |")
    return "\n".join(L) + "\n"


if __name__ == "__main__":
    sys.exit(main())
