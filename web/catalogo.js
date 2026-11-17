// Bitu · catálogo de piezas. Datos: window.CATALOGO (catalogo-datos.js), generado por
// tools/precios/scrape_precios.py a partir de tools/precios/catalogo.json.
(function () {
  const D = window.CATALOGO;
  const raiz = document.getElementById("cat-grid");
  if (!D || !raiz) return;

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  const num = (n, dec = 2) => n == null ? "—" : n.toLocaleString("es", { minimumFractionDigits: dec, maximumFractionDigits: dec });
  const DISP = {
    InStock: ["En stock", "ok"], OutOfStock: ["Agotado", "mal"], Discontinued: ["Descontinuado", "mal"],
    PreOrder: ["Preventa", "aviso"], BackOrder: ["Bajo pedido", "aviso"], LimitedAvailability: ["Pocas unidades", "aviso"],
  };
  const ESTADO = {
    ok: ["Leído hoy", "ok"], manual: ["Búsqueda web", "aviso"], bloqueado: ["Tienda bloquea lectura", "mal"],
    sin_precio: ["Sin precio en la página", "mal"], robots: ["robots.txt lo impide", "mal"],
    referencia: ["Solo referencia", "aviso"],
  };
  const orden = ["Cerebro", "Cara", "Audio", "Sensores", "Movimiento", "Energía", "Todo en uno", "Alternativa todo en uno"];

  const estado = { prop: "todas", orden: "categoria" };

  const placeholder = (nombre) => `
    <svg viewBox="0 0 160 120" role="img" aria-label="Sin foto de ${esc(nombre)}">
      <rect x="40" y="26" width="80" height="68" rx="6" fill="none" stroke="currentColor" stroke-width="4"/>
      <rect x="58" y="44" width="44" height="32" rx="3" fill="currentColor" opacity=".25"/>
      ${[0, 1, 2, 3].map((i) => `<rect x="${50 + i * 18}" y="14" width="6" height="12" fill="currentColor"/><rect x="${50 + i * 18}" y="94" width="6" height="12" fill="currentColor"/>`).join("")}
    </svg><span>Sin foto: la tienda no permite leerla</span>`;

  function filaTienda(l, minima) {
    const e = ESTADO[l.estado] || [l.estado, "mal"];
    const d = l.disponible && DISP[l.disponible];
    const precio = l.precio != null
      ? `<b>${num(l.precio)} ${esc(l.moneda)}</b>${l.unidades > 1 ? ` <small>por ${l.unidades}</small>` : ""}${(l.moneda !== "USD" || l.unidades > 1) && l.precio_usd != null ? `<small>≈ USD ${num(l.precio_usd)}${l.unidades > 1 ? " c/u" : ""}</small>` : ""}`
      : `<b>—</b>`;
    return `<tr${l.estado === "ok" && l.precio_usd === minima ? ' class="mejor"' : ""}>
      <td><a href="${esc(l.url)}" rel="noopener" target="_blank">${esc(l.tienda)}</a>${l.nota ? `<small>${esc(l.nota)}</small>` : ""}</td>
      <td class="r">${precio}</td>
      <td><span class="sello-estado ${e[1]}">${e[0]}</span>${d ? `<span class="sello-estado ${d[1]}">${d[0]}</span>` : (l.disponible && l.estado === "manual" ? `<small>${esc(l.disponible)}</small>` : "")}</td>
    </tr>`;
  }

  function tarjeta(p) {
    const cant = p.alternativa ? `<span class="alt">Alternativa a DevKit + pantalla + altavoz</span>`
      : Object.entries(p.cantidad).filter(([, q]) => q > 0).map(([k, q]) => `<span>${esc(k)} × ${q}</span>`).join("");
    const foto = p.imagen
      ? `<img src="${esc(p.imagen)}" alt="${esc(p.nombre)}" loading="lazy" referrerpolicy="no-referrer" onerror="this.parentNode.classList.add('sin');this.parentNode.innerHTML=this.parentNode.dataset.ph">`
      : placeholder(p.nombre);
    return `<article class="pieza" data-cat="${esc(p.categoria)}">
      <div class="pieza-foto${p.imagen ? "" : " sin"}" data-ph="${esc(placeholder(p.nombre))}">${foto}</div>
      <div class="pieza-cuerpo">
        <p class="pieza-cat">${esc(p.categoria)}</p>
        <h3>${esc(p.nombre)}</h3>
        ${p.modelo ? `<p class="pieza-modelo">${esc(p.modelo)}</p>` : ""}
        ${p.medidas ? `<p class="pieza-medidas"><span>Medidas</span> ${esc(p.medidas)}${p.fuente_medidas ? ` · <a href="${esc(p.fuente_medidas)}" rel="noopener" target="_blank">fuente</a>` : ""} · <a href="#3d-pieza-${esc(p.id)}">ver en 3D</a></p>` : ""}
        <p class="pieza-uso">${esc(p.uso)}</p>
        <p class="pieza-cant">${cant}</p>
        <dl class="pieza-precios">
          <div><dt>Mejor leído hoy</dt><dd>${p.retail_min_leido != null ? "USD " + num(p.retail_min_leido) : "—"}</dd></div>
          <div><dt>Doc 05 (retail)</dt><dd>USD ${num(p.retail_doc)}</dd></div>
          <div><dt>Barato <span class="est">est.</span></dt><dd>${p.barato_est != null ? "USD " + num(p.barato_est) : "—"}</dd></div>
        </dl>
        <div class="tabla"><table class="tiendas">
          <thead><tr><th>Tienda</th><th class="r">Precio</th><th>Estado</th></tr></thead>
          <tbody>${p.lecturas.map((l) => filaTienda(l, p.retail_min_leido)).join("")}</tbody>
        </table></div>
      </div>
    </article>`;
  }

  function render() {
    let piezas = D.piezas.filter((p) => estado.prop === "todas" || (p.cantidad[estado.prop] || 0) > 0);
    piezas = piezas.slice().sort((a, b) => estado.orden === "precio"
      ? (b.retail_min_leido ?? b.retail_doc) - (a.retail_min_leido ?? a.retail_doc)
      : orden.indexOf(a.categoria) - orden.indexOf(b.categoria));
    raiz.innerHTML = piezas.map(tarjeta).join("");

    const t = estado.prop === "todas" ? null : D.totales[estado.prop];
    document.getElementById("cat-resumen").innerHTML = t
      ? `<div><dt>Piezas</dt><dd>${piezas.length}</dd></div>
         <div><dt>Retail leído hoy</dt><dd>USD ${num(t.retail)}</dd></div>
         <div><dt>Retail doc 05</dt><dd>USD ${num(t.retail_doc)}</dd></div>
         <div><dt>Barato <span class="est">est.</span></dt><dd>${t.barato_est != null ? "USD " + num(t.barato_est) : "—"}</dd></div>`
      : `<div><dt>Piezas</dt><dd>${piezas.length}</dd></div>
         <div><dt>Lecturas</dt><dd>${D.piezas.reduce((n, p) => n + p.lecturas.length, 0)}</dd></div>
         <div><dt>Leídas hoy</dt><dd>${D.piezas.reduce((n, p) => n + p.lecturas.filter((l) => l.estado === "ok").length, 0)}</dd></div>
         <div><dt>Fecha</dt><dd>${esc(D.fecha)}</dd></div>`;
    document.getElementById("cat-nota-total").hidden = !t;

    document.querySelectorAll("#cat-filtro button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.prop === estado.prop));
    document.querySelectorAll("#cat-orden button").forEach((b) => b.setAttribute("aria-pressed", b.dataset.orden === estado.orden));
  }

  document.querySelectorAll("#cat-filtro button").forEach((b) => b.addEventListener("click", () => { estado.prop = b.dataset.prop; render(); }));
  document.querySelectorAll("#cat-orden button").forEach((b) => b.addEventListener("click", () => { estado.orden = b.dataset.orden; render(); }));
  document.getElementById("cat-fecha").textContent = D.fecha;
  render();
})();
