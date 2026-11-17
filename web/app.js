// Bitu · datos de las propuestas de ensamble.
// Fuente de verdad: docs/research/05-propuestas-de-ensamble.md (precios 2026-11).
const PROPUESTAS = {
  A: {
    nombre: "Básico · cliente ligero ESP32-S3",
    recomendada: true,
    totales: { barato: 22, retail: 49 },
    notaTotal: "Barato = clones de AliExpress (est.) · Retail = tiendas verificadas. Sin envío ni aranceles.",
    datos: [
      ["Cerebro", "ESP32-S3 N16R8 + servidor"],
      ["Cara", "Redonda 1,28\" GC9A01"],
      ["Energía", "USB-C 5 V, sin batería"],
      ["Dificultad", "2 / 5"],
      ["Montaje", "3–5 h + 4 h de impresión"],
      ["Latencia", "1,5–3 s (est.)"],
    ],
    bom: [
      ["ESP32-S3-DevKitC-1 N16R8", 7, 12.5],
      ["Pantalla redonda GC9A01 1,28\" (SPI)", 3.5, 8.9],
      ["Micrófono INMP441 (I2S)", 1.8, 4.95],
      ["Amplificador MAX98357A", 2, 5.95],
      ["Altavoz de cavidad 8 Ω 2 W (30 × 20 × 5,5 mm)", 1.5, 2.99],
      ["Sensor táctil TTP223 (push-to-talk)", 0.4, 5.95],
      ["Carcasa PLA ~80 g, cables, perfboard, tornillos", 5.6, 7.6],
    ],
    pinesNota: "Verificado en main/boards/bread-compact-wifi-lcd/config.h de xiaozhi-esp32 (2026-11-16). No mezclar con la variante OLED.",
    pines: [
      ["INMP441", "WS · SCK · SD", "4 · 5 · 6"],
      ["INMP441", "L/R", "GND (canal izq.)"],
      ["INMP441", "VDD · GND", "3V3 · GND"],
      ["MAX98357A", "DIN · BCLK · LRC", "7 · 15 · 16"],
      ["MAX98357A", "VIN · GND", "5V (VBUS) · GND"],
      ["GC9A01", "SDA · SCL", "47 · 21"],
      ["GC9A01", "DC · RES · CS", "40 · 45 · 41"],
      ["GC9A01", "BLK", "42"],
      ["GC9A01", "VCC · GND", "3V3 · GND"],
      ["Botón BOOT", "—", "0 (hablar / Wi-Fi)"],
      ["TTP223 (opcional)", "OUT", "1 (ajustar config.h)"],
    ],
    pasos: [
      ["Protoboard", "Conecta micrófono, amplificador y pantalla según la tabla, siguiendo el tutorial oficial de xiaozhi."],
      ["Firmware", "Flashea xiaozhi para bread-compact-wifi-lcd (flasheador web o ESP-IDF 5.4+) y elige la pantalla GC9A01."],
      ["Servidor propio", "Configura el Wi-Fi desde el portal cautivo y apunta OTA/WebSocket a tu xiaozhi-esp32-server, no al servidor público."],
      ["Cerebro", "En el servidor: ASR, LLM (Claude Haiku 5.5 u Ollama), TTS y el system prompt para adolescentes."],
      ["Voz", "Prueba la voz, ajusta la ganancia y separa el micrófono del altavoz."],
      ["Perfboard", "Suelda cabeceras hembra para el DevKit y los módulos; cablea con hilo AWG 26–28."],
      ["Carcasa", "Imprime la carcasa, inserta tornillos M2/M2.5 y monta pantalla, altavoz con rejilla y agujero del micrófono."],
      ["Prueba", "Cierra, deja 30 min funcionando y haz red teaming del contenido."],
    ],
    pros: ["El más barato", "Firmware maduro (~33 000 estrellas en GitHub, MIT)", "Cambias el cerebro sin tocar el hardware", "Cabe en un taller de 1–2 sesiones"],
    contras: ["Sin batería ni movimiento", "Depende del Wi-Fi y del servidor", "Personalizar caras exige compilar"],
  },
  B: {
    nombre: "Expresivo · cara IPS + cuello pan/tilt",
    totales: { barato: 39, retail: 132 },
    notaTotal: "Con servos Feetech STS3032 en lugar de SG90, el retail sube a ≈ USD 210.",
    datos: [
      ["Cerebro", "ESP32-S3 N16R8 + servidor"],
      ["Cara", "IPS 2\" ST7789 320×240"],
      ["Energía", "18650 + IP5306 o USB-C"],
      ["Dificultad", "4 / 5"],
      ["Montaje", "8–12 h + 10 h de impresión"],
      ["Latencia", "1,5–3 s (est.)"],
    ],
    bom: [
      ["ESP32-S3 N16R8", 7, 12.5],
      ["IPS 2\" ST7789 320×240", 5, 19.95],
      ["2× servo SG90 / SG92R", 3, 11.9],
      ["Micrófono INMP441", 1.8, 4.95],
      ["MAX98357A + altavoz de cavidad 8 Ω 2 W", 3.5, 8.94],
      ["VL53L0X (detectar a la persona)", 3, 14.95],
      ["MPU-6050 (lo levantan o agitan)", 2, 12.95],
      ["TTP223 (caricia en la cabeza)", 0.4, 5.95],
      ["Celda 18650 2200 mAh con protección", 4, 9.95],
      ["IP5306 (barato) / PowerBoost 1000C (retail)", 1, 19.95],
      ["Interruptor, cables, tornillos, carcasa PETG ~180 g", 8.5, 10.5],
    ],
    pinesNota: "Propuesta propia: verificar contra el pinout de tu placa. En la N16R8 evita GPIO 35–37 (PSRAM octal).",
    pines: [
      ["INMP441", "WS · SCK · SD", "4 · 5 · 6"],
      ["MAX98357A", "DIN · BCLK · LRC", "7 · 15 · 16"],
      ["ST7789", "MOSI · CLK · DC", "47 · 21 · 40"],
      ["ST7789", "RST · CS · BL", "45 · 41 · 42"],
      ["Servo pan", "PWM 50 Hz (LEDC)", "17"],
      ["Servo tilt", "PWM", "18"],
      ["Servos", "V+", "5 V del IP5306 + 470 µF"],
      ["I2C (VL53L0X 0x29, MPU-6050 0x68)", "SDA · SCL", "8 · 9"],
      ["TTP223", "OUT", "1"],
      ["Batería", "Divisor 100k/100k → ADC", "2"],
    ],
    pasos: [
      ["Base A", "Monta y valida el nivel A en protoboard, con la voz funcionando."],
      ["Cara IPS", "Añade la IPS de 2\" (ST7789, soportada por xiaozhi) y diseña los ojos animados en LVGL."],
      ["Servos", "Imprime el soporte pan/tilt y prueba los servos con fuente de 5 V externa y GND común."],
      ["MCP", "Registra herramientas MCP en el dispositivo — mirar(pan, tilt), asentir(), emocion(tipo) — para que el LLM las invoque."],
      ["Sensores", "Añade los sensores I2C: el VL53L0X activa la mirada, el MPU-6050 la reacción «¡mareado!»."],
      ["Batería", "Monta la 18650 en portapilas dentro de la base, con IP5306 e interruptor. Etiqueta la polaridad."],
      ["Cierre", "Cierra la carcasa PETG, verifica temperaturas en carga y limita el ángulo de los servos por software."],
    ],
    pros: ["El más vivo y carismático", "Portátil", "El LLM puede gesticular vía MCP"],
    contras: ["Exige programar en C / ESP-IDF", "SG90 ruidosos (STS3032 suben ~USD 75)", "Más riesgos: batería y picos de corriente", "3–4 sesiones de montaje"],
  },
  C: {
    nombre: "Autónomo local · Raspberry Pi 5",
    totales: { barato: null, retail: 312 },
    notaTotal: "Solo hay precio retail. La Pi 5 de 8 GB sola cuesta USD 200 tras la crisis de RAM de 2026.",
    datos: [
      ["Cerebro", "Raspberry Pi 5 de 8 GB"],
      ["Cara", "IPS 2\" ST7789"],
      ["Energía", "Fuente 27 W USB-C"],
      ["Dificultad", "3 / 5 (software 4 / 5)"],
      ["Montaje", "4–6 h + 12 h de impresión"],
      ["Latencia", "3–8 s (est.)"],
    ],
    bom: [
      ["Raspberry Pi 5 de 8 GB", null, 200],
      ["Fuente oficial 27 W USB-C", null, 14.04],
      ["Active Cooler", null, 13.5],
      ["microSD 64 GB A2 (est.)", null, 12],
      ["ReSpeaker Lite USB (2 mics, AEC)", null, 29.12],
      ["MAX98357A + altavoz 3 W", null, 9.9],
      ["IPS 2\" ST7789", null, 19.95],
      ["TTP223 / AT42QT1010", null, 5.95],
      ["Carcasa PETG + tornillos (est.)", null, 8],
    ],
    pinesNota: "Numeración BCM (pin físico entre paréntesis). Verificar en pinout.xyz. Activa dtoverlay=max98357a en config.txt.",
    pines: [
      ["ReSpeaker Lite", "USB", "Puerto USB 3"],
      ["MAX98357A", "BCLK · LRC · DIN", "18 (12) · 19 (35) · 21 (40)"],
      ["MAX98357A", "VIN · GND", "5 V (2) · GND (6)"],
      ["ST7789", "MOSI · SCLK · CS", "10 (19) · 11 (23) · 8 (24)"],
      ["ST7789", "DC · RST · BL", "25 (22) · 27 (13) · 12 (32)"],
      ["ST7789", "VCC · GND", "3V3 (1) · GND (9)"],
      ["TTP223", "OUT", "17 (11)"],
    ],
    pasos: [
      ["Sistema", "Instala Raspberry Pi OS Lite 64 bits y Ollama o llama.cpp; descarga un modelo de 1–3B en Q4."],
      ["Voz local", "Instala faster-whisper (tiny/base), Piper con voz en español (verifica la licencia) y openWakeWord."],
      ["Orquestador", "Python (o Wyoming/OVOS) con system prompt y filtro: reglas + segunda pasada de un LLM juez."],
      ["Cableado", "Conecta pantalla, amplificador y táctil según la tabla; dibuja la cara con pygame o LVGL."],
      ["Medir", "Mide la latencia y elige el modelo más pequeño con calidad aceptable en español."],
      ["Carcasa", "Imprime la carcasa con ventilación y monta todo."],
    ],
    pros: ["Privacidad total", "Sin coste recurrente", "Funciona sin internet", "Plataforma para aprender IA local"],
    contras: ["El más caro (Pi 5 +40–60 % en 2026)", "Respuestas lentas (3–8 s) y de menor calidad", "Más difícil garantizar contenido seguro", "5–12 W: no práctico con batería"],
  },
};

const usd = (n) => n == null ? "—" : n.toLocaleString("es", { minimumFractionDigits: n % 1 ? 2 : 0, maximumFractionDigits: 2 });
const esc = (s) => String(s).replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

const estado = { id: "A", modo: "barato" };
const $ = (sel, root = document) => root.querySelector(sel);

function render(animar) {
  const p = PROPUESTAS[estado.id];
  const modo = p.totales[estado.modo] == null ? "retail" : estado.modo;
  const col = modo === "barato" ? 1 : 2;

  $("#f-nombre").textContent = p.nombre;
  $("#f-total").textContent = "≈ USD " + usd(p.totales[modo]);
  $("#f-nota").textContent = (modo === "barato" ? "Opción barata. " : "Opción retail. ") + p.notaTotal;
  $("#f-datos").innerHTML = p.datos.map(([k, v]) => `<div><dt>${esc(k)}</dt><dd>${esc(v)}</dd></div>`).join("");
  $("#f-bom").innerHTML =
    p.bom.map((r) => `<tr><td>${esc(r[0])}</td><td class="r">${usd(r[col])}</td></tr>`).join("") +
    `<tr class="suma"><td>Total</td><td class="r">≈ ${usd(p.totales[modo])}</td></tr>`;
  $("#f-bom-cab").textContent = modo === "barato" ? "Barato (est.)" : "Retail";
  $("#f-pines-nota").textContent = p.pinesNota;
  $("#f-pines").innerHTML = p.pines.map((r) => `<tr><td>${esc(r[0])}</td><td class="pin">${esc(r[1])}</td><td class="r">${esc(r[2])}</td></tr>`).join("");
  $("#f-pasos").innerHTML = p.pasos.map(([n, t]) => `<li><div><span class="nuevo">${esc(n)}</span><p>${esc(t)}</p></div></li>`).join("");
  $("#f-pros").innerHTML = p.pros.map((x) => `<li>${esc(x)}</li>`).join("");
  $("#f-contras").innerHTML = p.contras.map((x) => `<li>${esc(x)}</li>`).join("");

  document.querySelectorAll(".pestanas [role=tab]").forEach((b) => {
    const on = b.dataset.id === estado.id;
    b.setAttribute("aria-selected", on);
    b.tabIndex = on ? 0 : -1;
  });
  document.querySelectorAll(".conmutador button").forEach((b) => {
    b.setAttribute("aria-pressed", b.dataset.modo === modo);
    b.disabled = b.dataset.modo === "barato" && p.totales.barato == null;
  });

  if (animar) {
    document.querySelectorAll(".impreso").forEach((el) => {
      el.classList.remove("reimprime");
      void el.offsetWidth;
      el.classList.add("reimprime");
    });
  }
}

function iniciarEnsamble() {
  const tabs = [...document.querySelectorAll(".pestanas [role=tab]")];
  tabs.forEach((b, i) => {
    b.addEventListener("click", () => { estado.id = b.dataset.id; render(true); });
    b.addEventListener("keydown", (e) => {
      const d = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
      if (!d) return;
      const n = tabs[(i + d + tabs.length) % tabs.length];
      n.focus(); n.click();
    });
  });
  document.querySelectorAll(".conmutador button").forEach((b) =>
    b.addEventListener("click", () => { estado.modo = b.dataset.modo; render(true); }));
  const h = location.hash.match(/^#ensamble-([abc])$/i);
  if (h) estado.id = h[1].toUpperCase();
  render(false);
}

// Los ojos del sello siguen el puntero (sutil).
function iniciarMirada() {
  const ojos = document.querySelector(".sello .ojos");
  if (!ojos || matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  let raf = 0;
  addEventListener("pointermove", (e) => {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const r = ojos.closest("svg").getBoundingClientRect();
      const dx = (e.clientX - (r.left + r.width / 2)) / innerWidth;
      const dy = (e.clientY - (r.top + r.height / 2)) / innerHeight;
      ojos.style.transform = `translate(${(dx * 14).toFixed(1)}px, ${(dy * 10).toFixed(1)}px)`;
    });
  }, { passive: true });
}

// Marca en el sumario la hoja visible.
function iniciarSumario() {
  const links = new Map([...document.querySelectorAll(".sumario ol a")].map((a) => [a.hash.slice(1), a]));
  const io = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      links.forEach((a) => a.removeAttribute("aria-current"));
      const a = links.get(en.target.id);
      if (a) { a.setAttribute("aria-current", "true"); a.scrollIntoView({ block: "nearest", inline: "nearest" }); }
    });
  }, { rootMargin: "-45% 0px -50% 0px" });
  links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

iniciarEnsamble();
iniciarMirada();
iniciarSumario();
