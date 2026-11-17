// Bitu · modelo 3D de las piezas y simulación del ensamblaje (propuesta A). Versión 2.
// Unidades: milímetros. Fuente de verdad: docs/research/08-modelo-3d.md.
// La versión anterior queda en modelo3d-v1.js (basta cambiar el <script> de index.html para volver).
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";

function fallo(raiz, e) {
  console.error(e);
  raiz.querySelector(".v3d-lienzo").innerHTML =
    '<p class="v3d-error">No se pudo iniciar el visor 3D (hace falta WebGL y conexión para cargar Three.js).</p>';
}

/* ------------------------------------------------------------------ */
/* Materiales                                                          */
/* ------------------------------------------------------------------ */
const mat = (color, o = {}) => new THREE.MeshStandardMaterial({ color, roughness: 0.55, metalness: 0, ...o });
const M = {
  pcbNegro: mat(0x1c1d24, { roughness: 0.45 }),
  pcbAzul: mat(0x1d3fa8, { roughness: 0.45 }),
  pcbAzulOsc: mat(0x1b2a6b, { roughness: 0.45 }),
  pcbVerde: mat(0x0f7a3a, { roughness: 0.45 }),
  pcbRojo: mat(0xb3262d, { roughness: 0.45 }),
  metal: mat(0xc9ced6, { metalness: 0.9, roughness: 0.28 }),
  aluminio: mat(0xaab2bd, { metalness: 0.8, roughness: 0.35 }),
  oro: mat(0xd4a83a, { metalness: 1, roughness: 0.3 }),
  plasticoNegro: mat(0x16161c, { roughness: 0.6 }),
  blanco: mat(0xf1f2f4, { roughness: 0.5 }),
  vidrio: mat(0x07070c, { roughness: 0.08, metalness: 0.2 }),
  chip: mat(0x22232b, { roughness: 0.35 }),
  bornera: mat(0x17a34a, { roughness: 0.5 }),
  servo: mat(0x3b74e6, { roughness: 0.35, transparent: true, opacity: 0.9 }),
  bateria: mat(0x2563eb, { roughness: 0.3 }),
  cobre: mat(0xc58a4a, { metalness: 0.7, roughness: 0.4 }),
  pla: mat(0x2c3fd6, { roughness: 0.62 }),
  plaFrente: mat(0x3448e0, { roughness: 0.62 }),
  plaMarco: mat(0x3448e0, { roughness: 0.62, side: THREE.DoubleSide }),
  plaBase: mat(0x1b1a33, { roughness: 0.7 }),
  rosa: mat(0xe0448f, { roughness: 0.5 }),
  hueco: mat(0x0b0b12, { roughness: 0.9 }),
  ventilador: mat(0x24252c, { roughness: 0.5 }),
};
const MATS_CARCASA = [M.pla, M.plaFrente, M.plaMarco];

/* ------------------------------------------------------------------ */
/* Primitivas                                                          */
/* ------------------------------------------------------------------ */
const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const caja = (w, h, d, m) => sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m));
const cajaR = (w, h, d, r, m) => sombra(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m));
const cil = (r, h, m, seg = 40) => sombra(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m));
const en = (obj, x = 0, y = 0, z = 0) => { obj.position.set(x, y, z); return obj; };
const grupo = (...hijos) => { const g = new THREE.Group(); hijos.forEach((h) => g.add(h)); return g; };
const V = (x, y, z) => new THREE.Vector3(x, y, z);

/** PCB horizontal: ancho en X, fondo en Z, cara superior en y = 1.6. */
const pcb = (w, d, m) => en(caja(w, 1.6, d, m), 0, 0.8, 0);
const pcbRedondo = (r, m) => en(cil(r, 1.6, m, 64), 0, 0.8, 0);

/** Fila de n pines (paso 2,54) a lo largo de X; un solo InstancedMesh para los pines. */
function tiraPines(n, abajo = true) {
  const g = new THREE.Group();
  const largo = n * 2.54;
  g.add(en(caja(largo, 2.5, 2.5, M.plasticoNegro), 0, abajo ? -1.25 : 1.6 + 1.25, 0));
  const inst = new THREE.InstancedMesh(new THREE.BoxGeometry(0.64, 8.5, 0.64), M.oro, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m4.makeTranslation(-largo / 2 + 1.27 + i * 2.54, abajo ? -4 : 4.5, 0);
    inst.setMatrixAt(i, m4);
  }
  inst.castShadow = true;
  g.add(inst);
  return g;
}

/** Discos oscuros instanciados (rejillas, agujeros). `puntos` = [[x, y, z], ...]; eje "y" o "z". */
function discos(puntos, r, eje = "z") {
  const inst = new THREE.InstancedMesh(new THREE.CylinderGeometry(r, r, 0.5, 14), M.hueco, puntos.length);
  const m4 = new THREE.Matrix4();
  const rot = eje === "z" ? new THREE.Matrix4().makeRotationX(Math.PI / 2) : new THREE.Matrix4();
  puntos.forEach((p, i) => { m4.copy(rot).setPosition(p[0], p[1], p[2]); inst.setMatrixAt(i, m4); });
  return inst;
}

/** Textura de la cara de Bitu. Solo se redibuja cuando cambia el estado (luz, ojos, boca). */
function crearCara(redonda) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  let clave = "";
  function poner(luz, ojos, boca) {
    const k = `${luz.toFixed(2)}|${ojos.toFixed(2)}|${boca.toFixed(2)}`;
    if (k === clave) return;
    clave = k;
    ctx.globalAlpha = 1;
    ctx.fillStyle = "#06060b";
    ctx.fillRect(0, 0, 512, 512);
    if (luz > 0) {
      ctx.globalAlpha = luz;
      ctx.fillStyle = "#17143a";
      if (redonda) { ctx.beginPath(); ctx.arc(256, 256, 252, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(0, 0, 512, 512);
      if (ojos > 0) {
        const h = Math.max(12, 150 * ojos);
        ctx.fillStyle = "#ffd23f";
        for (const x of [150, 300]) { ctx.beginPath(); ctx.roundRect(x, 215 - h / 2, 62, h, Math.min(16, h / 2)); ctx.fill(); }
        if (boca > 0.04) {
          ctx.fillStyle = "#ff4fa0";
          ctx.beginPath(); ctx.ellipse(256, 356, 36 - boca * 6, 10 + boca * 30, 0, 0, Math.PI * 2); ctx.fill();
        } else {
          ctx.strokeStyle = "#ff4fa0"; ctx.lineWidth = 16; ctx.lineCap = "round";
          ctx.beginPath(); ctx.arc(256, 322, 48, Math.PI * 0.2, Math.PI * 0.8); ctx.stroke();
        }
      }
      ctx.globalAlpha = 1;
    }
    tex.needsUpdate = true;
  }
  poner(0, 0, 0);
  return { tex, poner };
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */
/* Medidas verificadas (mm). Fuente de cada una en docs/research/08-modelo-3d.md. */
const HDR = 10.8; // media distancia entre filas de pines del DevKitC-1 v1.1 (DXF de Espressif)
function esp32() {
  const g = grupo(pcb(62.87, 25.4, M.pcbNegro));
  g.add(en(caja(18, 0.8, 25.5, M.chip), 22.5, 2, 0)); // base del módulo WROOM-1
  g.add(en(caja(15.8, 2.4, 17.6, M.metal), 20.6, 3.6, -2.6)); // blindaje
  g.add(en(caja(6, 0.2, 18, M.oro), 28.6, 2.5, 2)); // zona de antena (aprox.)
  for (const z of [-6.5, 6.5]) g.add(en(cajaR(7.4, 3.2, 9, 1.2, M.metal), -28.6, 3.2, z)); // USB-C ×2
  for (const z of [-11, 11]) g.add(en(caja(4, 1.4, 3, M.blanco), -21, 2.3, z * 0.5)); // botones BOOT / RST
  g.add(en(caja(2, 0.8, 2, M.chip), -14, 2, 0));
  g.add(en(caja(3.5, 1, 3.5, M.chip), -8, 2.1, 0)); // regulador
  for (const z of [-HDR, HDR]) g.add(en(tiraPines(22), 0, 0, z));
  return g;
}

/** `girada`: la lengüeta del conector queda arriba al montarla en vertical y la imagen se gira 180°. */
function gc9a01(cara, girada = false) {
  // Waveshare 1.28inch LCD Module: PCB Ø 37,5, 40,4 con la lengüeta, área activa Ø 32,4
  const g = grupo(pcbRedondo(18.75, M.pcbAzul));
  g.add(en(caja(13, 1.6, 4.6, M.pcbAzul), 0, 0.8, 19.35)); // lengüeta del conector
  g.add(en(tiraPines(8, true), 0, 0, 20.2));
  g.add(en(cil(17.4, 2.6, M.vidrio, 64), 0, 2.9, 0));
  const pantalla = new THREE.Mesh(new THREE.CircleGeometry(16.2, 64), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2;
  if (girada) pantalla.rotation.z = Math.PI;
  pantalla.position.y = 4.25;
  g.add(pantalla);
  return g;
}

function ips2(cara) {
  const g = grupo(pcb(59.2, 35.5, M.pcbNegro)); // Adafruit 4311: 59,2 × 35,5 × 3,7
  g.add(en(caja(40.8, 2.1, 30.6, M.vidrio), -4, 2.65, 0));
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(36, 27), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2;
  pantalla.position.set(-4, 3.75, 0);
  g.add(pantalla);
  const t = tiraPines(12); t.rotation.y = Math.PI / 2; g.add(en(t, 27.3, 0, 0));
  return g;
}

/** `pinesArriba`: cabecera por la cara del encapsulado (así queda hacia el interior al pegarlo al techo). */
function inmp441(pinesArriba = false) {
  const g = grupo(pcbRedondo(7, M.pcbAzul));
  g.add(en(caja(4, 1, 3, M.metal), 0, 2.1, -1.5));
  g.add(en(cil(0.6, 1.8, M.hueco, 16), 0, 0.8, 1.5)); // puerto acústico
  g.add(en(tiraPines(6, !pinesArriba), 0, 0, 5.6));
  return g;
}

function max98357a(pinesArriba = false) {
  const g = grupo(pcb(17.8, 19.4, M.pcbAzulOsc));
  g.add(en(caja(3, 0.8, 3, M.chip), 0, 2, 0));
  g.add(en(caja(7.6, 7.5, 5.5, M.bornera), 0, 5.3, -6.5));
  for (const x of [-1.9, 1.9]) g.add(en(cil(1.1, 0.8, M.metal, 16), x, 9.3, -6.5));
  g.add(en(tiraPines(7, !pinesArriba), 0, 0, 8.2));
  return g;
}

/** Altavoz de cavidad 8 Ω 2 W «2030» de Waveshare: 30 × 20 × 5,5 mm; la boca sale por la cara +Y. */
function altavoz() {
  const g = grupo(en(cajaR(30, 5.5, 20, 1.2, M.plasticoNegro), 0, 2.75, 0));
  g.add(en(cajaR(16, 0.4, 7, 1, M.ventilador), 0, 5.6, 0));
  const pts = [];
  for (let k = 0; k < 6; k++) pts.push([-6.25 + k * 2.5, 5.85, -1.4], [-6.25 + k * 2.5, 5.85, 1.4]);
  g.add(discos(pts, 0.6, "y"));
  g.add(en(caja(5, 2.4, 4, M.blanco), 13, 2.75, 7)); // conector PH
  return g;
}

/** Altavoz cerrado 3 W 4 Ω (Adafruit 4445): 70 × 31 × 17 mm. Solo cabe en la carcasa de la propuesta C. */
function altavoz3w() {
  const g = grupo(en(cajaR(70, 17, 31, 3, M.plasticoNegro), 0, 8.5, 0));
  g.add(en(cil(12.5, 0.6, M.ventilador, 48), 0, 17.2, 0));
  for (const x of [-31.5, 31.5]) g.add(en(cil(1.55, 17.4, M.hueco, 16), x, 8.5, 0));
  return g;
}

function tactil() {
  const g = grupo(pcb(15, 11, M.pcbRojo)); // módulo TTP223 común: 15 × 11 mm
  g.add(en(cil(4.2, 0.15, M.cobre, 40), -2, 1.7, 0));
  g.add(en(caja(2.5, 0.8, 2, M.chip), 4, 2, -3));
  const t = tiraPines(3); t.rotation.y = Math.PI / 2; g.add(en(t, 6.2, 0, 0));
  return g;
}

function servo() {
  const g = grupo(en(caja(23, 22.5, 11, M.servo), 0, 11.25, 0)); // SG92R: 23 × 11 × 29 (hasta el eje)
  g.add(en(caja(32, 2.5, 11, M.servo), 0, 16, 0));
  g.add(en(cil(5.5, 4, M.servo), -5.5, 24.5, 0));
  g.add(en(cil(2.4, 2.5, M.blanco, 20), -5.5, 27.75, 0));
  g.add(en(cajaR(20, 1.6, 5.5, 0.7, M.blanco), -5.5, 29.8, 0));
  for (const [c, z] of [[0x8b5a2b, -1.2], [0xd23b3b, 0], [0xf2a20c, 1.2]]) g.add(en(caja(6, 0.9, 1, mat(c)), 14, 3, z));
  return g;
}

function vl53l0x() {
  const g = grupo(pcb(21, 18, M.pcbAzul));
  g.add(en(caja(4.4, 1, 2.4, M.chip), 0, 2.1, -1.5));
  for (const x of [-1.2, 1.2]) g.add(en(cil(0.5, 0.3, M.vidrio, 16), x, 2.7, -1.5));
  g.add(en(tiraPines(7), 0, 0, 7.6));
  return g;
}

function mpu6050() {
  const g = grupo(pcb(26, 17.8, M.pcbAzul)); // Adafruit 3886: 26 × 17,8 × 4,6
  g.add(en(caja(4, 0.9, 4, M.chip), 0, 2.05, -1));
  g.add(en(tiraPines(8), 0, 0, 7.5));
  return g;
}

function bat18650() {
  const g = new THREE.Group();
  // Adafruit 1781: 69 mm × Ø 18 con la placa de protección
  const cuerpo = cil(9, 67, M.bateria, 48); cuerpo.rotation.z = Math.PI / 2; g.add(en(cuerpo, 0, 9, 0));
  for (const x of [-33.8, 33.8]) { const t = cil(8.6, 0.8, M.metal, 40); t.rotation.z = Math.PI / 2; g.add(en(t, x, 9, 0)); }
  const nub = cil(3, 1, M.metal, 24); nub.rotation.z = Math.PI / 2; g.add(en(nub, 34.5, 9, 0));
  const banda = cil(9.05, 6, M.blanco, 48); banda.rotation.z = Math.PI / 2; g.add(en(banda, -20, 9, 0));
  return g;
}

function powerboost() {
  const g = grupo(pcb(36.2, 22.9, M.pcbNegro)); // Adafruit 2465: 45 × 23 × 10 con el USB-A
  g.add(en(cajaR(14, 7, 13, 0.6, M.metal), 15.9, 5.1, 0)); // USB-A (sobresale ≈ 9 mm)
  g.add(en(caja(3, 0.8, 3, M.chip), -6, 2, 0));
  g.add(en(caja(6, 4.5, 4.2, M.blanco), -15, 3.85, 6)); // JST
  g.add(en(caja(4, 1.5, 2.8, M.metal), -15, 2.35, -7)); // micro USB
  return g;
}

function pi5() {
  const g = grupo(pcb(85, 56, M.pcbVerde));
  g.add(en(caja(15, 1.6, 15, M.metal), -8, 2.4, -2));
  g.add(en(caja(14, 1.1, 10, M.chip), 8, 2.15, -2));
  g.add(en(caja(9, 1.2, 9, M.chip), -26, 2.2, 6));
  g.add(en(caja(51, 8.5, 5, M.plasticoNegro), -7, 1.6 + 4.25, -24.5));
  for (const z of [-19, 1]) g.add(en(caja(17.5, 15.6, 13.2, M.metal), 34.5, 1.6 + 7.8, z));
  g.add(en(caja(21, 13.5, 16, M.metal), 32.5, 1.6 + 6.75, 19));
  for (const x of [-25, -11]) g.add(en(caja(6.5, 3, 7.5, M.metal), x, 3.1, 25));
  g.add(en(cajaR(9, 3.2, 7.5, 1.2, M.metal), -37, 3.2, 25));
  return g;
}

function cooler() {
  // Raspberry Pi Active Cooler: 63,5 × 42,5 × 13,7 (product brief oficial); ventilador de 30 mm
  const g = grupo(en(caja(63.5, 2, 42.5, M.aluminio), 0, 1, 0));
  const aletas = new THREE.InstancedMesh(new THREE.BoxGeometry(1.2, 9, 42.5), M.aluminio, 12);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < 12; i++) { m4.makeTranslation(-30 + i * 2.6, 6.5, 0); aletas.setMatrixAt(i, m4); }
  aletas.castShadow = true;
  g.add(aletas);
  g.add(en(cil(15, 11.7, M.ventilador, 48), 15, 7.85, 0));
  g.add(en(cil(5, 12, M.chip, 32), 15, 8, 0));
  return g;
}

function fuente27w() {
  const g = grupo(en(cajaR(68.9, 35.6, 51.7, 6, M.blanco), 0, 17.8, 0)); // Adafruit 5814: 68,9 × 51,7 × 35,6
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    V(34.4, 17, 0), V(54, 12, 6), V(68, 6, 24), V(72, 4, 48)]), 40, 2, 10), M.blanco);
  g.add(sombra(cable));
  for (const x of [-8, 8]) g.add(en(caja(2, 2, 14, M.metal), x, 17.8, -32.8));
  return g;
}

function respeaker() {
  const g = grupo(pcb(86, 35, M.pcbNegro));
  for (const x of [-34, 34]) g.add(en(cil(2.2, 1.2, M.metal, 24), x, 2.2, 0));
  g.add(en(caja(10, 1, 10, M.chip), 0, 2.1, 0));
  g.add(en(cajaR(9, 3.2, 7.5, 1.2, M.metal), 0, 3.2, 14));
  return g;
}

function box3(cara) {
  const g = new THREE.Group();
  g.add(en(cajaR(60, 20, 34, 5, M.blanco), 0, 10, 0)); // base dock
  const cuerpo = cajaR(60, 60, 14, 6, M.blanco); cuerpo.rotation.x = -0.18; g.add(en(cuerpo, 0, 48, -2));
  const pant = new THREE.Mesh(new THREE.PlaneGeometry(48, 36), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pant.rotation.x = -0.18; pant.position.set(0, 50, 5.3);
  g.add(pant);
  return g;
}

/** Waveshare ESP32-S3-Touch-AMOLED-1.75: Ø 48,96 × 10,4 mm; AMOLED de 1,75" (Ø ≈ 44,5 de diagonal). */
function amoled175(cara) {
  const g = grupo(en(cil(24.48, 10.4, M.aluminio, 72), 0, 5.2, 0));
  g.add(en(cil(23.2, 0.8, M.vidrio, 72), 0, 10.6, 0));
  const pantalla = new THREE.Mesh(new THREE.CircleGeometry(22.2, 72), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2; pantalla.position.y = 11.05;
  g.add(pantalla);
  g.add(en(cajaR(9, 3.2, 7.5, 1.2, M.metal), 0, 5.2, 23.5)); // USB-C
  return g;
}

function placaPerforada() {
  const c = document.createElement("canvas"); c.width = 240; c.height = 160;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c9a36a"; ctx.fillRect(0, 0, 240, 160);
  ctx.fillStyle = "#7a5a2c";
  for (let x = 5; x < 240; x += 10.16) for (let y = 5; y < 160; y += 10.16) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const g = grupo(pcb(60, 40, mat(0xffffff, { map: tex, roughness: 0.85 })));
  for (const z of [-HDR, HDR]) g.add(en(caja(56, 8.5, 2.5, M.plasticoNegro), 0, 1.6 + 4.25, z)); // cabeceras hembra
  return g;
}

/* ------------------------------------------------------------------ */
/* Carcasa impresa: cabeza de 70 mm en dos mitades huecas (pared 2 mm) */
/* ------------------------------------------------------------------ */
const INCL = THREE.MathUtils.degToRad(12);          // inclinación de la pantalla (doc 04: 10–15°)
const PANT = { y: 3, z: 34.6 };                      // centro del PCB de la pantalla, relativo al centro de la cabeza
const MARCO = { R: 21.5, labio: 5.4, fondo: -7 };    // marco inclinado (coordenadas locales de la pantalla)

/** Recorta una geometría por el plano z = 0 y se queda con el lado `lado` (+1 frontal, −1 trasero). */
function recortarZ(geo, lado, { invertir = false, sinCara = false } = {}, pos = [], nor = []) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  const P = g.attributes.position.array, Nn = g.attributes.normal.array;
  const v = (i) => ({ p: [P[i * 3], P[i * 3 + 1], P[i * 3 + 2]], n: [Nn[i * 3], Nn[i * 3 + 1], Nn[i * 3 + 2]] });
  const corte = (a, b) => {
    const k = a.p[2] / (a.p[2] - b.p[2]);
    const n = a.n.map((x, j) => x + (b.n[j] - x) * k), l = Math.hypot(...n) || 1;
    return { p: a.p.map((x, j) => (j === 2 ? 0 : x + (b.p[j] - x) * k)), n: n.map((x) => x / l) };
  };
  for (let t = 0; t < P.length / 9; t++) {
    const tri = [v(t * 3), v(t * 3 + 1), v(t * 3 + 2)];
    if (sinCara && tri.every((q) => q.n[2] * lado > 0.999)) continue; // cara plana frontal: se sustituye por una con hueco
    const out = [];
    for (let i = 0; i < 3; i++) {
      const a = tri[i], b = tri[(i + 1) % 3];
      const da = a.p[2] * lado >= 0, db = b.p[2] * lado >= 0;
      if (da) out.push(a);
      if (da !== db) out.push(corte(a, b));
    }
    for (let i = 1; i + 1 < out.length; i++) {
      const tr = invertir ? [out[0], out[i + 1], out[i]] : [out[0], out[i], out[i + 1]];
      for (const q of tr) { pos.push(...q.p); nor.push(...(invertir ? q.n.map((x) => -x) : q.n)); }
    }
  }
  return { pos, nor };
}

function rectR(ctx, w, h, r) {
  const x = -w / 2, y = -h / 2;
  ctx.moveTo(x + r, y);
  ctx.lineTo(x + w - r, y); ctx.absarc(x + w - r, y + r, r, -Math.PI / 2, 0, false);
  ctx.lineTo(x + w, y + h - r); ctx.absarc(x + w - r, y + h - r, r, 0, Math.PI / 2, false);
  ctx.lineTo(x + r, y + h); ctx.absarc(x + r, y + h - r, r, Math.PI / 2, Math.PI, false);
  ctx.lineTo(x, y + r); ctx.absarc(x + r, y + r, r, Math.PI, Math.PI * 1.5, false);
  return ctx;
}

/** Media cabeza con el origen en el centro de la cabeza. */
function carcasa(mitad) {
  const frontal = mitad === "frontal", lado = frontal ? 1 : -1;
  const m = frontal ? M.plaFrente : M.pla;
  const g = new THREE.Group();

  // Piel exterior + interior (pared de 2 mm)
  const { pos, nor } = recortarZ(new RoundedBoxGeometry(70, 70, 70, 5, 9), lado, { sinCara: frontal });
  recortarZ(new RoundedBoxGeometry(66, 66, 66, 5, 7), lado, { invertir: true, sinCara: frontal }, pos, nor);
  const piel = new THREE.BufferGeometry();
  piel.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  piel.setAttribute("normal", new THREE.Float32BufferAttribute(nor, 3));
  g.add(sombra(new THREE.Mesh(piel, m)));

  // Canto de la junta entre mitades
  const canto = rectR(new THREE.Shape(), 70, 70, 9);
  canto.holes.push(rectR(new THREE.Path(), 66, 66, 7));
  const borde = new THREE.Mesh(new THREE.ShapeGeometry(canto, 10), m);
  if (frontal) borde.rotation.y = Math.PI;
  g.add(borde);

  // Postes para la placa perforada (dos por mitad)
  for (const x of [-26, 26]) g.add(en(cil(2, 3, m, 16), x, -31.5, frontal ? 14 : -18));

  if (frontal) {
    // Cara con el hueco elíptico por donde asoma el marco inclinado de la pantalla
    const cy = PANT.y + ((35 - PANT.z) / Math.cos(INCL)) * Math.sin(INCL);
    const placa = new THREE.Shape();
    placa.moveTo(-26, -26); placa.lineTo(26, -26); placa.lineTo(26, 26); placa.lineTo(-26, 26); placa.closePath();
    const hueco = new THREE.Path();
    hueco.absellipse(0, cy, MARCO.R - 0.3, (MARCO.R - 0.3) / Math.cos(INCL), 0, Math.PI * 2, true);
    placa.holes.push(hueco);
    const geoPlaca = new THREE.ShapeGeometry(placa, 48);
    g.add(en(sombra(new THREE.Mesh(geoPlaca, m)), 0, 0, 35));
    const dentro = new THREE.Mesh(geoPlaca, m); dentro.rotation.y = Math.PI; g.add(en(dentro, 0, 0, 33));

    // Marco de la pantalla: tubo inclinado 12° hacia arriba, con escalón que sujeta el PCB
    const { R, labio, fondo } = MARCO;
    const perfil = [[R, fondo], [R, labio - 0.8], [R - 0.8, labio], [19.2, labio], [18.4, labio - 0.8], [18.4, 1.7], [20, 1.7], [20, fondo]]
      .map(([x, y]) => new THREE.Vector2(x, y));
    const marco = sombra(new THREE.Mesh(new THREE.LatheGeometry(perfil, 72), M.plaMarco));
    marco.rotation.x = Math.PI / 2 - INCL;
    g.add(en(marco, 0, PANT.y, PANT.z));
    g.add(en(cajaR(0.6, 5, 12, 0.25, M.hueco), -35.05, -14.2, 4.5)); // ranura USB-C (UART)
  } else {
    // Rejilla del altavoz (trasera), hueco USB-C, agujero del micrófono, marca táctil, alojamientos de tornillo
    const reja = [];
    for (let a = -4; a <= 4; a++) for (let b = -4; b <= 4; b++) {
      const x = (a + (b % 2 ? 0.5 : 0)) * 3.3, y = b * 2.86;
      if (Math.hypot(x, y) < 10.2) reja.push([-12 + x, 7 + y, -35.05]);
    }
    g.add(discos(reja, 0.95));
    g.add(discos([[-25, -25, -35.05], [25, -25, -35.05], [-25, 25, -35.05], [25, 25, -35.05]], 2.8));
    g.add(en(cajaR(0.6, 5, 12, 0.25, M.hueco), -35.05, -14.2, -8.5)); // ranura USB-C
    g.add(discos([[16, 35.05, -11.5]], 1, "y")); // agujero del micrófono Ø 2
    g.add(discos([[0, 35.05, -6]], 2.2, "y")); // encaje de la antena
    const anillo = new THREE.Mesh(new THREE.TorusGeometry(5.5, 0.55, 8, 40), M.rosa); anillo.rotation.x = Math.PI / 2;
    g.add(en(anillo, -18, 35.05, -14)); // marca táctil
  }
  return g;
}

const base = () => grupo(en(cil(26, 10, M.plaBase, 64), 0, 5, 0));
const antena = () => grupo(en(cil(2, 10, M.pla, 20), 0, 5, 0), en(cajaR(10, 10, 10, 1.5, M.rosa), 0, 13, 0));

/** Tornillo M2,5 × 8: cabeza en el origen, vástago hacia +Y local. */
function tornillo() {
  return grupo(cil(2.2, 1.6, M.metal, 24), en(cil(1.25, 8, M.metal, 16), 0, 4.8, 0),
    en(caja(3.2, 0.3, 0.7, M.hueco), 0, -0.72, 0), en(caja(0.7, 0.3, 3.2, M.hueco), 0, -0.72, 0));
}

/** Cable USB-C: origen en la punta del conector, que entra hacia +X. */
function cableUsb() {
  const g = grupo(en(caja(7, 2.4, 8.3, M.metal), -3.5, 0, 0), en(cajaR(20, 6.5, 12, 2, M.blanco), -17, 0, 0));
  const curva = new THREE.CatmullRomCurve3([V(-26, 0, 0), V(-42, 0, 0), V(-60, -10, 5), V(-74, -24, 16), V(-92, -29.2, 36), V(-128, -29.2, 64)]);
  g.add(sombra(new THREE.Mesh(new THREE.TubeGeometry(curva, 48, 1.7, 8), M.blanco)));
  return g;
}

function cabezaCompleta() {
  const g = new THREE.Group();
  g.add(en(carcasa("trasera"), 0, 45, 0), en(carcasa("frontal"), 0, 45, 0), base(), en(antena(), 0, 80, -6));
  return g;
}

/* Catálogo de piezas del visor (ids = tools/precios/catalogo.json) */
const PIEZAS = [
  { id: "esp32s3", nombre: "ESP32-S3-DevKitC-1", medidas: "62,87 × 25,4 mm (plano DXF de Espressif, v1.1)", hacer: esp32 },
  { id: "gc9a01", nombre: "Pantalla redonda GC9A01 1,28\"", medidas: "Ø 37,5 mm; 40,4 con lengüeta; área activa Ø 32,4 (Waveshare)", hacer: () => gc9a01(caraGaleria(true)) },
  { id: "inmp441", nombre: "Micrófono INMP441", medidas: "Ø 14 × 2,2 mm (módulo redondo común)", hacer: inmp441 },
  { id: "max98357a", nombre: "Amplificador MAX98357A", medidas: "19,4 × 17,8 × 3,0 mm (Adafruit 3006)", hacer: max98357a },
  { id: "altavoz2030", nombre: "Altavoz de cavidad 8 Ω 2 W", medidas: "30 × 20 × 5,5 mm (Waveshare 2030)", hacer: altavoz },
  { id: "altavoz", nombre: "Altavoz cerrado 3 W · 4 Ω", medidas: "70 × 31 × 17 mm (Adafruit 4445) · no cabe en A ni B", hacer: altavoz3w },
  { id: "tactil", nombre: "Sensor táctil TTP223", medidas: "15 × 11 mm (módulo TTP223 común)", hacer: tactil },
  { id: "perfboard", nombre: "Placa perforada + cabeceras", medidas: "60 × 40 mm", hacer: placaPerforada },
  { id: "carcasa", nombre: "Carcasa impresa (A)", medidas: "Cabeza 70 × 70 × 70 mm · pantalla a 12°", hacer: cabezaCompleta },
  { id: "ips2", nombre: "Pantalla IPS 2\" ST7789", medidas: "59,2 × 35,5 × 3,7 mm (Adafruit 4311)", hacer: () => ips2(caraGaleria(false)) },
  { id: "servo", nombre: "Micro servo SG92R", medidas: "23 × 11 × 29 mm (Adafruit 169)", hacer: servo },
  { id: "vl53l0x", nombre: "Sensor ToF VL53L0X", medidas: "21 × 18 × 2,8 mm (Adafruit 3317)", hacer: vl53l0x },
  { id: "mpu6050", nombre: "IMU MPU-6050", medidas: "26 × 17,8 × 4,6 mm (Adafruit 3886)", hacer: mpu6050 },
  { id: "bat18650", nombre: "Celda 18650", medidas: "69 × Ø 18 mm con protección (Adafruit 1781)", hacer: bat18650 },
  { id: "cargador", nombre: "PowerBoost 1000C", medidas: "45 × 23 × 10 mm con USB-A (Adafruit 2465)", hacer: powerboost },
  { id: "pi5_8gb", nombre: "Raspberry Pi 5", medidas: "85 × 56 mm (Raspberry Pi 5)", hacer: () => { const g = pi5(); g.add(en(cooler(), -4, 1.6, -2)); return g; } },
  { id: "cooler", nombre: "Active Cooler", medidas: "63,5 × 42,5 × 13,7 mm (product brief oficial)", hacer: cooler },
  { id: "fuente27w", nombre: "Fuente 27 W USB-C", medidas: "68,9 × 51,7 × 35,6 mm (Adafruit 5814)", hacer: fuente27w },
  { id: "respeaker", nombre: "ReSpeaker Lite", medidas: "86 × 35 mm (sin plano oficial: aproximado)", hacer: respeaker },
  { id: "amoled175", nombre: "Waveshare ESP32-S3-Touch-AMOLED-1.75", medidas: "Ø 48,96 × 10,4 mm (Core Electronics / Waveshare)", hacer: () => amoled175(caraGaleria(true)) },
  { id: "box3", nombre: "ESP32-S3-BOX-3", medidas: "Sin plano oficial: proporciones aproximadas", hacer: () => box3(caraGaleria(false)) },
];
let caraGal = null;
function caraGaleria(redonda) { caraGal = crearCara(redonda); caraGal.poner(1, 1, 0); return caraGal; }

/* ------------------------------------------------------------------ */
/* Ensamblaje de la propuesta A                                        */
/* ------------------------------------------------------------------ */
const PASOS = [
  { titulo: "Despiece", dur: 0, texto: "Todas las piezas de la propuesta A sobre la mesa, a escala. El círculo marca dónde se monta Bitu. Arrastra para girar la vista; rueda o pellizco para acercar." },
  { titulo: "Base y carcasa trasera", dur: 3.4, nuevo: "Base + carcasa trasera", texto: "Primero la base y, encima, la mitad trasera de la cabeza, que hace de chasis: trae la rejilla del altavoz, el agujero del micrófono, la marca táctil y los postes para la placa." },
  { titulo: "Placa perforada", dur: 2.8, nuevo: "Placa perforada", texto: "La placa perforada de 60 × 40 mm, con dos tiras de cabeceras hembra, se apoya en los postes del fondo." },
  { titulo: "ESP32-S3", dur: 2.8, nuevo: "ESP32-S3-DevKitC-1", texto: "El DevKit se encaja en las cabeceras, con los USB-C hacia el lateral izquierdo, frente a las ranuras de la carcasa." },
  { titulo: "Micrófono", dur: 4.4, nuevo: "INMP441", texto: "El INMP441 va al techo, con el puerto bajo el agujero de la tapa. Sus cables bajan por la pared: WS, SCK y SD a GPIO 4, 5 y 6; VDD a 3V3; GND y L/R a GND." },
  { titulo: "Amplificador y altavoz", dur: 4.8, nuevo: "MAX98357A + altavoz", texto: "Altavoz y MAX98357A a la pared trasera, frente a la rejilla. DIN, BCLK y LRC a GPIO 7, 15 y 16; VIN a 5 V; el altavoz, a la bornera." },
  { titulo: "Pantalla y táctil", dur: 5.2, nuevo: "GC9A01 + TTP223", texto: "La GC9A01 queda inclinada 12° hacia arriba (SPI en GPIO 47, 21, 40, 45 y 41; retroiluminación en 42) y el TTP223 va al techo (GPIO 1). En el montaje real la pantalla se encaja antes en el marco de la mitad frontal." },
  { titulo: "Cierre", dur: 6.6, nuevo: "Carcasa frontal + tornillos + antena", texto: "La mitad frontal cierra la cabeza y su marco inclinado sujeta la pantalla. Cuatro tornillos M2,5 entran por detrás en insertos térmicos y la antena «bit» se encaja arriba." },
  { titulo: "Encendido", dur: 5.6, nuevo: "Cable USB-C", texto: "Con el USB-C conectado, la pantalla despierta y Bitu abre los ojos, parpadea y saluda. Lo siguiente es la prueba de 30 min y el red teaming del contenido." },
];

/* Posición de cada GPIO en las cabeceras del DevKitC-1 (pin 1 en el extremo de la antena, +X).
   J1 queda en la fila trasera y J3 en la delantera. Según el pinout de Espressif; verificar con la serigrafía. */
const J1 = { "3V3": 0, "3V3b": 1, 4: 3, 5: 4, 6: 5, 7: 6, 15: 7, 16: 8, "5V": 20, GND: 21 };
const J3 = { GND: 0, 1: 3, 42: 5, 41: 6, 40: 7, 45: 14, 47: 16, 21: 17, GNDb: 20 };
const px = (i) => 26.67 - i * 2.54;
const ROSA = new THREE.Color(0xff4fa0);
const C = { rojo: 0xd23b3b, cinco: 0xe8590c, negro: 0x26262b, amarillo: 0xf2c230, verde: 0x22a35a, blanco: 0xf5f5f5,
  morado: 0x7c3aed, azul: 0x2563eb, naranja: 0xf97316, gris: 0x9aa0ab, cian: 0x0ea5b7 };

function construirEnsamblaje(cara) {
  const g = new THREE.Group();
  const partes = [], cables = [];
  const tmp = new THREE.Box3();

  /** Registra una pieza: reposo en la mesa (banco) → posición final, con eje de inserción. */
  const add = (obj, o) => {
    const qFinal = obj.quaternion.clone();
    const qBanco = new THREE.Quaternion().setFromEuler(new THREE.Euler(...(o.giroBanco || [0, 0, 0])));
    const fin = V(...o.fin), eje = V(...o.eje).normalize();
    let banco;
    if (o.desde) banco = V(...o.desde);
    else {
      obj.position.set(0, 0, 0); obj.quaternion.copy(qBanco); obj.updateMatrixWorld(true);
      tmp.setFromObject(obj);
      banco = V(o.banco[0], -tmp.min.y, o.banco[1]); // apoyada en la mesa
    }
    const acerca = o.acerca ?? 16;
    const A = fin.clone().addScaledVector(eje, -acerca);
    const p = {
      obj, paso: o.paso, a: o.a ?? 0, b: o.b ?? 1, fin, banco, qFinal, qBanco, eje, acerca, A,
      c1: o.c1 ? V(...o.c1) : banco.clone().add(V(0, o.alto ?? 60, 0)),
      c2: o.c2 ? V(...o.c2) : A.clone().addScaledVector(eje, -acerca * 1.5),
      vuelo: o.vuelo ?? 0.66, vueltas: o.vueltas || 0, recto: !!o.desde,
      carcasa: !!o.carcasa, etiqueta: o.etiqueta, fugaz: !!o.fugaz, mats: [], dim: -1, brillo: -1,
    };
    // Materiales propios de la pieza: permiten resaltarla o atenuarla sin tocar a las demás
    const clones = new Map();
    obj.traverse((n) => {
      if (!n.isMesh) return;
      if (!clones.has(n.material)) {
        const c = n.material.clone();
        clones.set(n.material, c);
        if (c.emissive) { c.emissive.copy(c.color).lerp(ROSA, 0.3); c.emissiveIntensity = 0; } // brillo del mismo tono, con un punto de rosa
        p.mats.push({ m: c, base: c.color.clone() });
      }
      n.material = clones.get(n.material);
    });
    obj.position.copy(fin); obj.quaternion.copy(qFinal); obj.updateMatrixWorld(true);
    tmp.setFromObject(obj);
    p.altoEtiqueta = tmp.max.y - fin.y + (o.subeEtiqueta ?? 5);
    partes.push(p);
    g.add(obj);
    return p;
  };

  // Paso 1 · base y carcasa trasera (chasis)
  add(base(), { paso: 1, a: 0, b: 0.5, fin: [0, 0, 0], banco: [-50, -100], eje: [0, -1, 0], acerca: 14, alto: 45, etiqueta: "Base" });
  add(carcasa("trasera"), { paso: 1, a: 0.3, b: 1, fin: [0, 45, 0], banco: [-128, -20], giroBanco: [0, 0.5, 0], eje: [0, -1, 0], acerca: 24, alto: 70, carcasa: true, etiqueta: "Carcasa trasera" });

  // Paso 2 · placa perforada sobre los postes (cara inferior a y = 15)
  add(placaPerforada(), { paso: 2, a: 0, b: 0.92, fin: [0, 15, -2], banco: [-80, 80], eje: [0, -1, 0], acerca: 14, c2: [0, 46, 22], etiqueta: "Placa perforada" });

  // Paso 3 · DevKit en las cabeceras hembra
  add(esp32(), { paso: 3, a: 0, b: 0.92, fin: [0, 27.6, -2], banco: [-5, 82], eje: [0, -1, 0], acerca: 13, c2: [0, 56, 24], etiqueta: "ESP32-S3-DevKitC-1" });

  // Paso 4 · micrófono al techo (PCB contra la tapa, puerto bajo el agujero)
  const mic = inmp441(true); mic.rotation.x = Math.PI;
  add(mic, { paso: 4, a: 0, b: 0.46, fin: [16, 78, -10], banco: [-60, 125], giroBanco: [0, 0.3, 0], eje: [0, 1, 0], acerca: 15, c2: [16, 48, 30], etiqueta: "Micrófono INMP441", subeEtiqueta: 12 });

  // Paso 5 · altavoz y amplificador a la pared trasera
  const spk = altavoz(); spk.rotation.x = -Math.PI / 2;
  add(spk, { paso: 5, a: 0, b: 0.4, fin: [-12, 52, -27.5], banco: [10, 125], eje: [0, 0, -1], acerca: 18, etiqueta: "Altavoz 8 Ω 2 W" });
  const amp = max98357a(true); amp.rotation.x = Math.PI / 2;
  add(amp, { paso: 5, a: 0.14, b: 0.54, fin: [18, 54, -32], banco: [-28, 125], eje: [0, 0, -1], acerca: 18, etiqueta: "MAX98357A", subeEtiqueta: 14 });

  // Paso 6 · pantalla inclinada 12° y táctil al techo
  const disp = gc9a01(cara, true); disp.rotation.set(Math.PI / 2 - INCL, Math.PI, 0);
  const nP = [0, Math.sin(INCL), Math.cos(INCL)];
  add(disp, { paso: 6, a: 0, b: 0.44, fin: [0, 45 + PANT.y, PANT.z], banco: [68, 82], eje: nP.map((x) => -x), acerca: 20, etiqueta: "Pantalla GC9A01 · 12°" });
  add(tactil(), { paso: 6, a: 0.1, b: 0.5, fin: [-14, 76, -14], banco: [52, 125], eje: [0, 1, 0], acerca: 15, c2: [-14, 46, 30], etiqueta: "Táctil TTP223", subeEtiqueta: 12 });

  // Paso 7 · carcasa frontal, tornillos (por detrás) y antena
  add(carcasa("frontal"), { paso: 7, a: 0, b: 0.38, fin: [0, 45, 0], banco: [128, -10], giroBanco: [0, 0.15, 0], eje: [0, 0, -1], acerca: 26, c1: [128, 85, 50], c2: [0, 45, 68], carcasa: true, etiqueta: "Carcasa frontal", fugaz: true });
  [[-25, 20], [25, 20], [-25, 70], [25, 70]].forEach(([x, y], i) => {
    const t = tornillo(); t.rotation.x = Math.PI / 2;
    add(t, { paso: 7, a: 0.4 + i * 0.05, b: 0.64 + i * 0.05, fin: [x, y, -35.6], banco: [55, -112 + i * 7], giroBanco: [0, 0, Math.PI / 2], eje: [0, 0, 1], acerca: 11, alto: 40, vuelo: 0.42, vueltas: 8, etiqueta: i === 3 ? "4 tornillos M2,5" : null, fugaz: true });
  });
  add(antena(), { paso: 7, a: 0.8, b: 1, fin: [0, 80, -6], banco: [5, -100], eje: [0, -1, 0], acerca: 14, alto: 50, etiqueta: "Antena «bit»" });

  // Paso 8 · cable USB-C por la ranura lateral
  add(cableUsb(), { paso: 8, a: 0, b: 0.3, fin: [-33, 30.8, 4.5], desde: [-85, 30.8, 4.5], eje: [1, 0, 0], acerca: 10, etiqueta: "Cable USB-C" });

  /* ---- Cables: crecen desde el módulo hasta su punto de soldadura junto a la cabecera ---- */
  const zA = -2 - HDR - 2.54, zA2 = zA - 2.54, zB = -2 + HDR + 2.54, zB2 = zB + 2.54, zB3 = zB2 + 2.54, yP = 16.6; // filas de la placa
  const cable = (paso, a, b, color, pts, r = 0.5) => {
    const curva = new THREE.CatmullRomCurve3(pts.map((p) => V(...p)), false, "catmullrom", 0.12);
    const geo = new THREE.TubeGeometry(curva, Math.max(24, pts.length * 12), r, 6);
    const m = new THREE.Mesh(geo, mat(color, { roughness: 0.45 }));
    m.castShadow = true;
    geo.setDrawRange(0, 0);
    m.visible = false;
    g.add(m);
    cables.push({ m, paso, a, b, total: geo.index.count, ult: -1 });
  };
  const rep = (a, b, i, n) => [a + ((b - a) * 0.5 * i) / n, a + (b - a) * (0.5 + (0.5 * (i + 1)) / n)]; // escalonado

  // Micrófono (pines: SD, VDD, GND, L/R, WS, SCK · orden est.). Bajan por la pared derecha.
  const micX = (i) => 16 + (i - 2.5) * 2.54, micT = [69.25, -15.6];
  [[0, C.blanco, J1[6], 24.2, -20], [5, C.verde, J1[5], 23, -18.6], [4, C.amarillo, J1[4], 21.8, -17.2], [1, C.rojo, J1["3V3"], 20.6, -15.8]]
    .forEach(([pin, color, idx, h, zl], i) => {
      const [a, b] = rep(0.46, 1, i, 5);
      cable(4, a, b, color, [[micX(pin), micT[0], micT[1]], [micX(pin) + 1.5, 66.5, zl + 1], [29, 64.5, zl], [32, 60, zl], [32, h + 2.5, zl],
        [30.6, h, zA], [px(idx) + 1.2, h, zA], [px(idx), h - 1.4, zA], [px(idx), yP, zA]]);
    });
  { // GND del micrófono → GND de J3 (pin 1), y puente L/R–GND
    const [a, b] = rep(0.46, 1, 4, 5);
    cable(4, a, b, C.negro, [[micX(2), micT[0], micT[1]], [micX(2) + 2, 66.5, -13], [29, 64.5, -13], [32.1, 60, -13], [32.1, 22.5, -13], [32.1, 20.2, -9],
      [32.1, 20.2, 12], [30.6, 20.2, zB2], [px(J3.GND) + 1.2, 20.2, zB2], [px(J3.GND), 19, zB2], [px(J3.GND), yP, zB2]]);
    cable(4, 0.5, 0.62, C.negro, [[micX(2), micT[0], micT[1]], [micX(2) + 0.6, 67.6, -15.6], [micX(3) - 0.6, 67.6, -15.6], [micX(3), micT[0], micT[1]]], 0.4);
  }

  // Amplificador (pines: LRC, BCLK, DIN, GAIN, SD, GND, VIN). Bajan por la pared trasera.
  const ampX = (i) => 18 - 7.62 + i * 2.54, ampT = [45.8, -23.4];
  [[0, C.naranja, J1[16]], [1, C.azul, J1[15]], [2, C.morado, J1[7]]].forEach(([pin, color, idx], i) => {
    const [a, b] = rep(0.54, 1, i, 7);
    cable(5, a, b, color, [[ampX(pin), ampT[0], ampT[1]], [ampX(pin), 42.5, -27], [ampX(pin), 39, -31.6], [px(idx) + 1, 25, -31.6],
      [px(idx), 21, -28], [px(idx), 19.2, -20], [px(idx), 18.6, zA], [px(idx), yP, zA]]);
  });
  [[5, C.negro, J1.GND, 0], [6, C.cinco, J1["5V"], 1.3]].forEach(([pin, color, idx, dy], i) => {
    const [a, b] = rep(0.54, 1, 3 + i, 7);
    cable(5, a, b, color, [[ampX(pin), ampT[0], ampT[1]], [ampX(pin), 42.5, -27], [ampX(pin), 38, -30.2], [ampX(pin) - 2.5, 25 + dy, -30.2],
      [-20, 24.5 + dy, -30.2], [px(idx), 23, -28.5], [px(idx), 19.6, -21], [px(idx), 18.6, zA], [px(idx), yP, zA]]);
  });
  [[16.1, C.rojo, 55], [19.9, C.negro, 50]].forEach(([x, color, y0], i) => { // altavoz → bornera
    const [a, b] = rep(0.54, 1, 5 + i, 7);
    cable(5, a, b, color, [[3, y0, -28.5], [5.5, y0 + 4, -28], [8 + i * 2, 66 + i, -28.2], [x, 66.5 + i, -27.3], [x, 63.3, -26.7]]);
  });

  // Pantalla (pines: GND, VCC, SCL, SDA, RES, DC, CS, BLK). Cinta que baja por detrás de la pantalla.
  const dispT = [45 + PANT.y + 18.05, PANT.z - 12.3];
  const dispX = (i) => 8.89 - i * 2.54;
  [[0, C.negro, J3.GNDb], [2, C.azul, J3[21]], [3, C.verde, J3[47]], [4, C.amarillo, J3[45]], [5, C.naranja, J3[40]], [6, C.morado, J3[41]], [7, C.blanco, J3[42]]]
    .forEach(([pin, color, idx], i) => {
      const [a, b] = rep(0.5, 1, i, 11), zi = 20 - pin * 1.0;
      cable(6, a, b, color, [[dispX(pin), dispT[0], dispT[1]], [dispX(pin), 65.5, zi], [px(idx), 42, zi], [px(idx), 27, 12.7], [px(idx), 21, zB], [px(idx), yP, zB]]);
    });
  { // VCC de la pantalla → 3V3: cruza por encima del DevKit hasta la fila trasera
    const [a, b] = rep(0.5, 1, 7, 11), x = px(J1["3V3"]);
    cable(6, a, b, C.rojo, [[dispX(1), dispT[0], dispT[1]], [dispX(1), 65.5, 19], [x, 45, 19], [x, 37.5, 9], [x, 36.5, -13], [x, 33, zA2], [x, yP, zA2]]);
  }
  // Táctil (pines: VCC, I/O, GND · orden est.). Por el techo a la pared trasera y esquina derecha.
  const tacZ = (k) => -14 - (k - 1) * 2.54;
  [[0, C.rojo, [30.3, -31.2], 20], [1, C.cian, [29.2, -32], 17.6], [2, C.negro, [28, -32.3], 18.7]].forEach(([k, color, [cx, cz], yb], i) => {
    const [a, b] = rep(0.5, 1, 8 + i, 11), h = 70 + k * 1.1;
    const fin = k === 0 ? [[28, 18.6, -22.5], [px(J1["3V3b"]), 18.3, -19.5], [px(J1["3V3b"]), 18.3, zA], [px(J1["3V3b"]), yP, zA]]
      : k === 1 ? [[30.6, yb, 9], [29.4, yb, zB], [px(J3[1]) + 1.2, yb, zB], [px(J3[1]), yP, zB]]
        : [[30.6, yb, 14.5], [29.6, yb, zB3], [px(J3.GND) + 1.2, yb, zB3], [px(J3.GND), yP, zB3]];
    cable(6, a, b, color, [[-7.8, 67.75, tacZ(k)], [-7.8, 65.5, tacZ(k) - 2], [-3.2, h - 2, -27], [-1, h, -31.8], [22, h, -31.8],
      [cx, h - 2.5, cz], [cx, 24 + k, cz], [30.6, yb, -27], ...fin]);
  });

  return { g, partes, cables };
}

/* ------------------------------------------------------------------ */
/* Cámara guiada: encuadre por fotogramas clave a lo largo de la línea de tiempo */
/* ------------------------------------------------------------------ */
const E = {
  mesa: { c: [0, 14, 12], r: 172, az: 22, el: 40 },
  p1: { c: [0, 42, 0], r: 78, az: 30, el: 22 },
  p2: { c: [0, 28, 4], r: 60, az: 24, el: 36 },
  p3: { c: [0, 30, 4], r: 56, az: 20, el: 33 },
  p4: { c: [12, 50, -6], r: 56, az: -24, el: 5 },
  p5: { c: [2, 42, -14], r: 56, az: 8, el: 14 },
  p6: { c: [0, 46, 10], r: 62, az: 50, el: 14 },
  p7a: { c: [0, 46, 8], r: 86, az: 38, el: 16 },
  p7b: { c: [0, 45, -14], r: 78, az: 154, el: 12 },
  p7c: { c: [0, 54, 2], r: 76, az: 28, el: 15 },
  p8a: { c: [-10, 40, 4], r: 70, az: -44, el: 10 },
  p8b: { c: [0, 49, 8], r: 62, az: 13, el: 7 },
};
const CLAVES = [[0, E.mesa], [0.28, E.p1], [1, E.p1], [1.28, E.p2], [2, E.p2], [2.28, E.p3], [3, E.p3], [3.28, E.p4], [4, E.p4],
  [4.28, E.p5], [5, E.p5], [5.28, E.p6], [6, E.p6], [6.14, E.p7a], [6.38, E.p7a], [6.52, E.p7b], [6.8, E.p7b], [6.94, E.p7c], [7, E.p7c],
  [7.1, E.p8a], [7.34, E.p8a], [7.52, E.p8b], [8, E.p8b]];

function encuadreEn(t) {
  let i = 0;
  while (i < CLAVES.length - 2 && t > CLAVES[i + 1][0]) i++;
  const [t0, a] = CLAVES[i], [t1, b] = CLAVES[i + 1];
  let k = THREE.MathUtils.clamp((t - t0) / (t1 - t0), 0, 1);
  k = k * k * (3 - 2 * k);
  const L = (x, y) => x + (y - x) * k;
  return { c: a.c.map((x, j) => L(x, b.c[j])), r: L(a.r, b.r), az: L(a.az, b.az), el: L(a.el, b.el) };
}

/* ------------------------------------------------------------------ */
/* Visor                                                               */
/* ------------------------------------------------------------------ */
const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : x * x * (3 - 2 * x));
const pico = (x) => Math.max(0, 1 - Math.abs(x));

async function iniciar(raiz) {
  const lienzo = raiz.querySelector(".v3d-lienzo");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.shadowMap.autoUpdate = false; // solo se recalculan las sombras cuando algo se mueve
  lienzo.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", "Vista 3D interactiva de Bitu");
  renderer.domElement.setAttribute("role", "img");
  const capa = document.createElement("div");
  capa.className = "v3d-etiquetas";
  capa.setAttribute("aria-hidden", "true");
  lienzo.appendChild(capa);

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camara = new THREE.PerspectiveCamera(32, 1, 1, 4000);
  const controles = new OrbitControls(camara, renderer.domElement);
  controles.enableDamping = true;
  controles.maxPolarAngle = Math.PI * 0.5;
  controles.minDistance = 25;
  controles.maxDistance = 1100;

  const luz = new THREE.DirectionalLight(0xffffff, 1.6);
  luz.position.set(120, 260, 160);
  luz.castShadow = true;
  luz.shadow.mapSize.set(2048, 2048);
  Object.assign(luz.shadow.camera, { left: -230, right: 230, top: 230, bottom: -230, near: 10, far: 700 });
  luz.shadow.bias = -0.0004;
  luz.shadow.normalBias = 0.3;
  escena.add(luz, new THREE.HemisphereLight(0xffffff, 0xdfe3f3, 0.55));
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(2400, 2400), new THREE.ShadowMaterial({ opacity: 0.16 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true;
  escena.add(suelo);
  // Marca en la mesa: aquí se monta Bitu
  const marca = new THREE.Mesh(new THREE.RingGeometry(27.2, 28.4, 72), new THREE.MeshBasicMaterial({ color: 0x2c3fd6, transparent: true, opacity: 0.35 }));
  marca.rotation.x = -Math.PI / 2; marca.position.y = 0.06;
  escena.add(marca);

  const cara = crearCara(true);
  const ens = construirEnsamblaje(cara);
  escena.add(ens.g);

  const galeria = new THREE.Group();
  galeria.visible = false;
  escena.add(galeria);

  const ui = {
    modo: raiz.querySelectorAll("[data-modo3d]"),
    pasoTitulo: raiz.querySelector("#v3d-paso-titulo"),
    pasoTexto: raiz.querySelector("#v3d-paso-texto"),
    pasoNuevo: raiz.querySelector("#v3d-paso-nuevo"),
    pasoNum: raiz.querySelector("#v3d-paso-num"),
    barra: raiz.querySelector("#v3d-barra"),
    play: raiz.querySelector("#v3d-play"),
    prev: raiz.querySelector("#v3d-prev"),
    next: raiz.querySelector("#v3d-next"),
    rayos: raiz.querySelector("#v3d-rayos"),
    panelEns: raiz.querySelector(".v3d-panel-ensamble"),
    panelPie: raiz.querySelector(".v3d-panel-piezas"),
    lista: raiz.querySelector("#v3d-lista"),
    pieNombre: raiz.querySelector("#v3d-pieza-nombre"),
    pieMedidas: raiz.querySelector("#v3d-pieza-medidas"),
    exportar: raiz.querySelector("#v3d-exportar"),
    pasos: raiz.querySelector("#v3d-pasos"),
  };

  const N = PASOS.length - 1;
  const reducido = matchMedia("(prefers-reduced-motion: reduce)").matches;
  const estado = { modo: "ensamble", t: 0, objetivo: null, reproduciendo: false, espera: 0, pieza: null, paso: -1, rayos: false,
    camLibre: false, saltarCam: true, sucio: true, reloj: 0 };

  ui.pasos.innerHTML = PASOS.map((p, i) => `<li><button type="button" data-paso="${i}"><span>${i}</span>${p.titulo}</button></li>`).join("");
  ui.pasos.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => irA(+b.dataset.paso)));
  ui.lista.innerHTML = PIEZAS.map((p) => `<li><button type="button" data-pieza="${p.id}" aria-pressed="false">${p.nombre}</button></li>`).join("");
  ui.lista.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => elegirPieza(b.dataset.pieza)));

  // Etiquetas flotantes de las piezas nuevas
  const etiquetas = ens.partes.filter((p) => p.etiqueta).map((p) => {
    const el = document.createElement("span");
    el.className = "v3d-etiqueta"; el.textContent = p.etiqueta;
    capa.appendChild(el);
    return { el, p, on: false, tx: "" };
  });
  const hola = document.createElement("span");
  hola.className = "v3d-etiqueta v3d-hola"; hola.textContent = "¡Hola!";
  capa.appendChild(hola);
  etiquetas.push({ el: hola, hola: true, on: false, tx: "" });

  /* ---------- Cámara ---------- */
  const camObj = { pos: new THREE.Vector3(), tgt: new THREE.Vector3() };
  function distanciaPara(r) {
    const v = THREE.MathUtils.degToRad(camara.fov) / 2;
    const h = Math.atan(Math.tan(v) * camara.aspect);
    return r / Math.sin(Math.min(v, h));
  }
  function objetivoCamara(t) {
    const e = encuadreEn(t), d = distanciaPara(e.r);
    const az = THREE.MathUtils.degToRad(e.az), el = THREE.MathUtils.degToRad(e.el);
    camObj.tgt.set(...e.c);
    camObj.pos.set(e.c[0] + d * Math.sin(az) * Math.cos(el), e.c[1] + d * Math.sin(el), e.c[2] + d * Math.cos(az) * Math.cos(el));
  }
  controles.addEventListener("start", () => { estado.camLibre = true; });

  function encuadrar(obj, dist = 1, alto = 0.45) {
    const caja3 = new THREE.Box3().setFromObject(obj);
    const centro = caja3.getCenter(new THREE.Vector3());
    const d = distanciaPara(caja3.getSize(new THREE.Vector3()).length() / 2) * 1.1 * dist;
    controles.target.copy(centro);
    camara.position.set(centro.x + d * 0.62, centro.y + d * alto, centro.z + d * 0.75);
    controles.update();
  }

  /* ---------- Galería de piezas ---------- */
  function elegirPieza(id) {
    const p = PIEZAS.find((x) => x.id === id) || PIEZAS[0];
    estado.pieza = p.id;
    galeria.clear();
    const obj = p.hacer();
    const b = new THREE.Box3().setFromObject(obj);
    obj.position.y -= b.min.y;
    obj.position.x -= (b.min.x + b.max.x) / 2;
    obj.position.z -= (b.min.z + b.max.z) / 2;
    const pivote = new THREE.Group(); pivote.add(obj); galeria.add(pivote);
    galeria.userData.pivote = pivote;
    ui.pieNombre.textContent = p.nombre;
    ui.pieMedidas.textContent = p.medidas;
    ui.lista.querySelectorAll("button").forEach((x) => x.setAttribute("aria-pressed", x.dataset.pieza === p.id));
    encuadrar(galeria, 1, 0.55);
    estado.sucio = true;
  }

  function setModo(m) {
    estado.modo = m;
    ens.g.visible = marca.visible = m === "ensamble";
    galeria.visible = m === "piezas";
    capa.hidden = m !== "ensamble";
    ui.panelEns.hidden = m !== "ensamble";
    ui.panelPie.hidden = m !== "piezas";
    ui.modo.forEach((b) => b.setAttribute("aria-pressed", b.dataset.modo3d === m));
    if (m === "piezas") { pausar(); elegirPieza(estado.pieza || PIEZAS[0].id); }
    else { estado.camLibre = false; estado.saltarCam = true; }
    estado.sucio = true;
  }
  ui.modo.forEach((b) => b.addEventListener("click", () => setModo(b.dataset.modo3d)));

  /* ---------- Movimiento de las piezas ---------- */
  const v1 = new THREE.Vector3(), q1 = new THREE.Quaternion(), ejeY = new THREE.Vector3(0, 1, 0);
  function bezier(out, p0, p1, p2, p3, s) {
    const i = 1 - s;
    return out.set(0, 0, 0).addScaledVector(p0, i * i * i).addScaledVector(p1, 3 * i * i * s).addScaledVector(p2, 3 * i * s * s).addScaledVector(p3, s * s * s);
  }
  function colocar(p, t) {
    const u = THREE.MathUtils.clamp((t - (p.paso - 1) - p.a) / (p.b - p.a), 0, 1);
    const o = p.obj;
    if (p.recto) { // entra en línea recta (cable USB-C)
      o.visible = t > p.paso - 1;
      const k = suave(u / 0.9), w = (u - 0.9) / 0.1;
      o.position.lerpVectors(p.banco, p.fin, k);
      if (w > 0 && w < 1) o.position.addScaledVector(p.eje, -0.7 * Math.sin(Math.PI * w) * (1 - w));
      return u;
    }
    if (u <= 0) { o.position.copy(p.banco); o.quaternion.copy(p.qBanco); return u; }
    if (u >= 1) { o.position.copy(p.fin); o.quaternion.copy(p.qFinal); return u; }
    const asiento = p.vuelo + (1 - p.vuelo) * 0.72;
    let giro = 0;
    if (u < p.vuelo) { // vuelo curvo de la mesa al punto de aproximación
      bezier(o.position, p.banco, p.c1, p.c2, p.A, suave(u / p.vuelo));
      if (p.vueltas) giro = 1;
    } else if (u < asiento) { // entra por su eje hasta asentar
      const k = (u - p.vuelo) / (asiento - p.vuelo), e = 1 - (1 - k) * (1 - k);
      o.position.copy(p.A).addScaledVector(p.eje, p.acerca * e);
      if (p.vueltas) giro = 1 - e;
    } else { // «clic»: pequeño rebote al hacer tope
      const w = (u - asiento) / (1 - asiento);
      o.position.copy(p.fin).addScaledVector(p.eje, -0.8 * Math.sin(Math.PI * w) * (1 - w));
    }
    o.quaternion.slerpQuaternions(p.qBanco, p.qFinal, suave(u / (p.vuelo * 0.85)));
    if (giro) o.quaternion.multiply(q1.setFromAxisAngle(ejeY, -giro * p.vueltas * Math.PI * 2)); // el tornillo gira mientras entra
    return u;
  }

  const GRIS = new THREE.Color(0xc4c8d6);
  function aplicar(t) {
    const paso = t <= 0 ? 0 : Math.min(N, Math.ceil(t - 1e-4));
    for (const p of ens.partes) p.u = colocar(p, t);
    for (const c of ens.cables) {
      const k = suave((t - (c.paso - 1) - c.a) / (c.b - c.a));
      if (k === c.ult) continue;
      c.ult = k;
      c.m.geometry.setDrawRange(0, Math.floor((c.total * k) / 3) * 3);
      c.m.visible = k > 0;
    }
    // Encendido (paso 8): retroiluminación, ojos, parpadeo y saludo
    const u = t - (N - 1);
    if (u < 1) {
      const luzP = suave((u - 0.32) / 0.08) * (u > 0.345 && u < 0.36 ? 0.45 : 1);
      const ojos = suave((u - 0.44) / 0.1) * (1 - 0.94 * pico((u - 0.63) / 0.035));
      const boca = Math.max(pico((u - 0.78) / 0.045), pico((u - 0.89) / 0.055));
      cara.poner(Math.max(0, luzP), ojos, boca);
    }
    if (paso !== estado.paso) { estado.paso = paso; estado.camLibre = false; pintarPaso(paso); }
    ui.barra.value = t.toFixed(2);
    estado.sucio = true;
  }

  /** Resalta las piezas del paso en curso y atenúa el resto; solo toca materiales cuando el valor cambia. */
  function resaltar() {
    const paso = estado.paso, activo = paso >= 1 && paso <= N;
    const pulso = reducido ? 0.3 : 0.28 + 0.14 * Math.sin(estado.reloj * 4.2);
    const op = estado.rayos ? 0.2 : 1;
    for (const p of ens.partes) {
      const nueva = activo && p.paso === paso;
      const dim = activo && paso < N && !nueva ? 1 : 0, brillo = nueva && paso < N ? pulso : 0;
      const opp = p.carcasa ? op : 1;
      if (Math.abs(dim - p.dim) < 0.001 && Math.abs(brillo - p.brillo) < 0.004 && opp === p.op) continue;
      p.dim = dim; p.brillo = brillo; p.op = opp;
      for (const { m, base } of p.mats) {
        m.color.copy(base).lerp(GRIS, 0.16 * dim);
        if (m.emissive) m.emissiveIntensity = brillo * (p.carcasa ? 0.45 : 1);
        if (p.carcasa) { m.transparent = opp < 1; m.opacity = opp; m.depthWrite = opp === 1; }
      }
    }
    for (const m of MATS_CARCASA) { m.transparent = op < 1; m.opacity = op; m.depthWrite = op === 1; } // galería
  }

  function pintarPaso(i) {
    const p = PASOS[i];
    ui.pasoNum.textContent = `Paso ${i} de ${N}`;
    ui.pasoTitulo.textContent = p.titulo;
    ui.pasoTexto.textContent = p.texto;
    ui.pasoNuevo.textContent = p.nuevo || "—";
    ui.pasos.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", +b.dataset.paso === i ? "step" : "false"));
  }

  const proy = new THREE.Vector3();
  function pintarEtiquetas() {
    const w = lienzo.clientWidth, h = lienzo.clientHeight, u8 = estado.t - (N - 1);
    for (const e of etiquetas) {
      let on;
      if (e.hola) { on = u8 > 0.76; proy.set(26, 88, 20); }
      else {
        const p = e.p;
        on = estado.paso === p.paso && p.u > 0.02 && !(p.paso === N && u8 > 0.6)
          && !(p.fugaz && estado.t - (p.paso - 1) > p.b + 0.08); // en pasos con varias piezas, la etiqueta se retira al asentar
        proy.copy(p.obj.position); proy.y += p.altoEtiqueta;
      }
      if (on) {
        proy.project(camara);
        if (proy.z > 1 || Math.abs(proy.x) > 1.02 || Math.abs(proy.y) > 1.02) on = false; // fuera de cuadro
        else {
          const x = Math.round(THREE.MathUtils.clamp((proy.x * 0.5 + 0.5) * w, 64, w - 64));
          const y = Math.round(THREE.MathUtils.clamp((-proy.y * 0.5 + 0.5) * h, 34, h - 8));
          const tx = `translate(${x}px,${y}px) translate(-50%,-100%)`;
          if (tx !== e.tx) { e.tx = tx; e.el.style.transform = tx; }
        }
      }
      if (on !== e.on) { e.on = on; e.el.classList.toggle("on", on); }
    }
  }

  /* ---------- Controles ---------- */
  function irA(paso) { pausar(); estado.objetivo = Math.max(0, Math.min(N, paso)); }
  function reproducir() {
    if (estado.t >= N - 0.001) { estado.t = 0; estado.espera = 0.9; aplicar(0); }
    estado.reproduciendo = true; estado.objetivo = null;
    ui.play.setAttribute("aria-pressed", "true"); ui.play.querySelector("span").textContent = "Pausa";
  }
  function pausar() {
    estado.reproduciendo = false;
    ui.play.setAttribute("aria-pressed", "false"); ui.play.querySelector("span").textContent = "Reproducir";
  }
  ui.play.addEventListener("click", () => (estado.reproduciendo ? pausar() : reproducir()));
  ui.prev.addEventListener("click", () => irA(Math.ceil(estado.t - 0.01) - 1));
  ui.next.addEventListener("click", () => irA(Math.floor(estado.t + 0.01) + 1));
  ui.barra.max = N;
  ui.barra.addEventListener("input", () => { pausar(); estado.objetivo = null; estado.t = +ui.barra.value; aplicar(estado.t); });
  ui.rayos.addEventListener("click", () => {
    estado.rayos = !estado.rayos; ui.rayos.setAttribute("aria-pressed", estado.rayos); estado.sucio = true;
  });

  ui.exportar.addEventListener("click", () => {
    const objetivo = estado.modo === "piezas" ? galeria : ens.g;
    new GLTFExporter().parse(objetivo, (glb) => {
      const a = document.createElement("a");
      a.href = URL.createObjectURL(new Blob([glb], { type: "model/gltf-binary" }));
      a.download = estado.modo === "piezas" ? `bitu-${estado.pieza}.glb` : "bitu-ensamblaje-A.glb";
      a.click();
      setTimeout(() => URL.revokeObjectURL(a.href), 2000);
    }, (e) => console.error(e), { binary: true });
  });

  function redimensionar() {
    const w = lienzo.clientWidth, h = lienzo.clientHeight;
    if (!w || !h) return;
    renderer.setSize(w, h, false);
    camara.aspect = w / h; camara.updateProjectionMatrix();
    if (!estado.camLibre) estado.saltarCam = true;
  }
  new ResizeObserver(redimensionar).observe(lienzo);
  redimensionar();

  /* ---------- Bucle (solo mientras el visor está en pantalla) ---------- */
  let visible = false, primeraVez = true, enMarcha = false;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && primeraVez) { primeraVez = false; if (!reducido) { estado.espera = 1.2; reproducir(); } }
    if (visible) bucle();
  }, { threshold: 0.25 }).observe(lienzo);

  const reloj = new THREE.Clock();
  function avanzar(dt) {
    if (estado.reproduciendo) {
      if (estado.espera > 0) { estado.espera -= dt; return; }
      const k = Math.min(N, Math.floor(estado.t + 1e-6) + 1);
      estado.t += dt / PASOS[k].dur;
      if (estado.t >= k) { estado.t = k; estado.espera = 0.9; if (k === N) pausar(); }
      aplicar(estado.t);
    } else if (estado.objetivo !== null) {
      const d = estado.objetivo - estado.t;
      if (reducido) estado.t = estado.objetivo;
      else if (d > 0 && d <= 1.001) { // un paso adelante: se reproduce su animación, algo más rápida
        const k = Math.min(N, Math.floor(estado.t + 1e-6) + 1);
        estado.t = Math.min(estado.objetivo, estado.t + dt / (PASOS[k].dur * 0.6));
      } else estado.t = Math.abs(d) < 0.004 ? estado.objetivo : estado.t + d * Math.min(1, dt * 4.5);
      if (estado.t === estado.objetivo) estado.objetivo = null;
      aplicar(estado.t);
    }
  }
  function bucle() {
    if (enMarcha) return;
    enMarcha = true;
    reloj.getDelta();
    const tick = () => {
      if (!visible) { enMarcha = false; return; }
      const dt = Math.min(reloj.getDelta(), 0.05);
      estado.reloj += dt;
      if (estado.modo === "ensamble") {
        avanzar(dt);
        // parpadeo en reposo, ya encendido
        if (estado.t >= N) {
          const ciclo = estado.reloj % 4.2;
          cara.poner(1, reducido || ciclo < 4 ? 1 : 1 - 0.94 * Math.sin(((ciclo - 4) / 0.2) * Math.PI), 0);
        }
        resaltar();
        if (!estado.camLibre) {
          objetivoCamara(estado.t);
          const k = estado.saltarCam || reducido ? 1 : 1 - Math.exp(-dt * 4.5);
          camara.position.lerp(camObj.pos, k);
          controles.target.lerp(camObj.tgt, k);
          estado.saltarCam = false;
        }
      } else {
        resaltar();
        if (galeria.userData.pivote && !reducido) { galeria.userData.pivote.rotation.y += dt * 0.35; estado.sucio = true; }
        if (caraGal) {
          const ciclo = estado.reloj % 4.2;
          caraGal.poner(1, reducido || ciclo < 4 ? 1 : 1 - 0.94 * Math.sin(((ciclo - 4) / 0.2) * Math.PI), 0);
        }
      }
      controles.update();
      if (estado.modo === "ensamble") pintarEtiquetas();
      if (estado.sucio) { renderer.shadowMap.needsUpdate = true; estado.sucio = false; }
      renderer.render(escena, camara);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  /* ---------- Enlaces directos: #3d-paso-N o #3d-pieza-<id> ---------- */
  function desdeHash(inicial) {
    const h = location.hash.match(/^#3d-(paso|pieza)-(.+)$/);
    if (!h) return false;
    primeraVez = false;
    if (h[1] === "paso") {
      pausar(); estado.objetivo = null;
      estado.t = Math.max(0, Math.min(N, +h[2] || 0));
      if (estado.modo !== "ensamble") setModo("ensamble");
      estado.camLibre = false; estado.saltarCam = true;
      aplicar(estado.t);
    } else { estado.pieza = h[2]; setModo("piezas"); }
    if (!inicial) raiz.scrollIntoView({ block: "nearest" });
    return true;
  }
  if (!desdeHash(true)) { if (reducido) estado.t = N; aplicar(estado.t); }
  else if (estado.modo === "piezas") aplicar(estado.t);
  addEventListener("hashchange", () => desdeHash(false));
  raiz.classList.add("listo");
}

const raiz = document.getElementById("v3d");
if (raiz) iniciar(raiz).catch((e) => fallo(raiz, e));
