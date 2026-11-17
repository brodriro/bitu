// Bitu · datos de las propuestas de ensamble.
// Fuente de verdad: docs/research/05-propuestas-de-ensamble.md (precios 2026-11).
const PROPUESTAS = {
  A: {
    nombre: "Básico · cliente ligero ESP32-S3",
    recomendada: true,
    totales: { barato: 34, retail: 71 },
    notaTotal: "Barato = clones de AliExpress (est.) · Retail = tiendas verificadas. Sin envío ni aranceles.",
    datos: [
      ["Cerebro", "ESP32-S3 N16R8 + servidor"],
      ["Cara", "Redonda táctil 1,85\" (Ø 5,5 cm) ST77916"],
      ["Energía", "USB-C 5 V, sin batería"],
      ["Dificultad", "2 / 5"],
      ["Montaje", "3–5 h + ≈ 7,3 h de impresión (est.)"],
      ["Latencia", "1,5–3 s (est.)"],
    ],
    bom: [
      ["ESP32-S3-DevKitC-1 N16R8", 7, 12.5],
      ["Pantalla redonda táctil 1,85\" ST77916 (Waveshare, Ø 5,5 cm)", 12, 17.99],
      ["Micrófono INMP441 (I2S)", 1.8, 4.95],
      ["Amplificador MAX98357A", 2, 5.95],
      ["Altavoz de cavidad 8 Ω 2 W (3 × 2 × 0,55 cm)", 1.5, 2.99],
      ["Sensor táctil TTP223 (push-to-talk)", 0.4, 5.95],
      ["Placa perforada de 5 × 7 cm", 0.3, 0.98],
      ["2 tiras de cabecera hembra (se cortan a 22 pines)", 0.3, 1.18],
      ["Carcasa Delta suave PLA 87 g, cables, tornillos M2,5 × 40", 5.2, 5.64],
      ["Cable USB-A a USB-C de 1 m", 1, 4.95],
      ["Cargador USB de 5 V 2 A (vale uno de móvil)", 2.5, 7.95],
    ],
    pinesNota: "Audio verificado en main/boards/bread-compact-wifi-lcd/config.h de xiaozhi-esp32 (2026-11-16). Pantalla de 1,85\": asignación propuesta sin probar; necesita una placa propia en xiaozhi basada en waveshare/esp32-s3-touch-lcd-1.85 (driver ST77916 por QSPI). Se evitan GPIO 45/46 (arranque) y 38/48 (LED RGB del DevKit).",
    pines: [
      ["INMP441", "WS · SCK · SD", "4 · 5 · 6"],
      ["INMP441", "L/R", "GND (canal izq.)"],
      ["INMP441", "VDD · GND", "3V3 · GND"],
      ["MAX98357A", "DIN · BCLK · LRC", "7 · 15 · 16"],
      ["MAX98357A", "VIN · GND", "5V (VBUS) · GND"],
      ["Pantalla 1,85\"", "LCD_CLK · LCD_CS", "21 · 41"],
      ["Pantalla 1,85\"", "LCD_IO0 · IO1 · IO2 · IO3", "47 · 40 · 42 · 2"],
      ["Pantalla 1,85\"", "LCD_RST · LCD_BL", "39 · 14"],
      ["Pantalla 1,85\"", "TP_SDA · TP_SCL · TP_INT", "8 · 9 · 10"],
      ["Pantalla 1,85\"", "VCC · GND", "3V3 · GND"],
      ["Botón BOOT", "—", "0 (hablar / Wi-Fi)"],
      ["TTP223 (opcional)", "OUT", "1 (ajustar config.h)"],
    ],
    pasos: [
      ["Protoboard", "Conecta micrófono, amplificador y pantalla según la tabla, siguiendo el tutorial oficial de xiaozhi."],
      ["Firmware", "Compila xiaozhi con ESP-IDF 5.4+ y una placa propia: audio de bread-compact-wifi-lcd y pantalla ST77916 copiada de waveshare/esp32-s3-touch-lcd-1.85, con los pines de la tabla."],
      ["Servidor propio", "Configura el Wi-Fi desde el portal cautivo y apunta OTA/WebSocket a tu xiaozhi-esp32-server, no al servidor público."],
      ["Cerebro", "En el servidor, copia tools/servidor/config-deepseek.yaml: ASR local en español, LLM DeepSeek (deepseek-flash) u Ollama, voz, sin memoria ni herramientas y el system prompt para adolescentes. La clave de la API va solo en el servidor."],
      ["Voz", "Prueba la voz, ajusta la ganancia y separa el micrófono del altavoz."],
      ["Perfboard", "Suelda cabeceras hembra para el DevKit y los módulos; cablea con hilo AWG 26–28."],
      ["Carcasa", "Imprime la carcasa Delta suave (3 piezas, 87 g de PLA, STL en cad/carcasas/delta-suave/), pon los insertos M2,5 en las 3 columnas de las esquinas (se cierran con 3 tornillos M2,5 × 40 por detrás) y monta pantalla en el centro, altavoz en la cara trasera y micrófono y táctil en las caras inclinadas."],
      ["Prueba", "Cierra, deja 30 min funcionando y haz red teaming del contenido."],
    ],
    pros: ["El más barato", "Firmware maduro (~33 000 estrellas en GitHub, MIT)", "Cambias el cerebro sin tocar el hardware", "Cabe en un taller de 1–2 sesiones"],
    contras: ["Sin batería ni movimiento", "Depende del Wi-Fi y del servidor", "La pantalla de 1,85\" exige compilar una placa propia del firmware"],
  },
  B: {
    nombre: "Expresivo · cara IPS + cuello pan/tilt",
    totales: { barato: 44, retail: 148 },
    notaTotal: "Con servos Feetech STS3032 en lugar de SG90, el retail sube a ≈ USD 226.",
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
      ["Placa perforada y 2 tiras de cabecera hembra", 0.6, 2.16],
      ["Interruptor, portapilas, 470 µF, divisor, cables, tornillos, carcasa PETG ~180 g", 9.2, 11.34],
      ["Cable USB-C y cargador de 5 V 2 A", 3.5, 12.9],
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
