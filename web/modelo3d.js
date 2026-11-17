// Bitu · modelo 3D de las piezas y simulación del ensamblaje (propuesta A en la carcasa Delta suave). Versión 3.
// Unidades: milímetros. Fuente de verdad: docs/research/08-modelo-3d.md.
// La versión anterior queda en modelo3d-v1.js (basta cambiar el <script> de index.html para volver).
import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import { RoomEnvironment } from "three/addons/environments/RoomEnvironment.js";
import { GLTFExporter } from "three/addons/exporters/GLTFExporter.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

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
const HDR = 11.43; // media distancia entre filas de pines del DevKitC-1 v1.1: 22,86 mm = 9 × 2,54 (plano de Espressif: 25,4 de ancho, pines a 1,27 del borde)
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

function lcd185(cara) {
  // Waveshare 1.85inch Touch LCD Module (plano oficial): vidrio Ø 55, área activa Ø 45,68, fondo total 9,1,
  // PCB redonda detrás con conector GH1.25 de 15 pines y 3 separadores M2 de 4 mm
  const g = grupo(en(cil(27.5, 0.7, M.vidrio, 96), 0, 8.75, 0));
  g.add(en(cil(27.3, 2.4, M.pcbNegro, 96), 0, 7.2, 0)); // panel LCD
  g.add(en(cil(25.5, 1.6, M.pcbAzul, 96), 0, 5.2, 0)); // PCB del controlador
  g.add(en(cajaR(3.4, 2.6, 17, 0.4, M.metal), 13, 3.1, 0)); // conector GH1.25 15 pines
  for (const [x, z] of [[0, -21], [-14.85, 14.85], [14.85, 14.85]]) g.add(en(cil(1.6, 4, M.metal, 16), x, 2, z));
  const pantalla = new THREE.Mesh(new THREE.CircleGeometry(22.84, 96), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2; pantalla.position.y = 9.12;
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
/* Carcasa Delta suave: mallas del GLB que genera tools/carcasas/carcasas.py */
/* ------------------------------------------------------------------ */
// Medidas del CAD (doc 09). Escena: origen en el centro de la base, y hacia arriba, frente hacia +Z
// (el CAD usa z hacia arriba y frente hacia −Y: x_escena = x, y_escena = z_CAD, z_escena = −y_CAD).
const INCL = THREE.MathUtils.degToRad(12); // inclinación de la pantalla
const D = (() => {
  const a = 118, L = 70, pared = 2, suelo = 2, rf = 14, r3 = Math.sqrt(3);
  const r = a / (2 * r3), h = 3 * r;                                  // inradio (centro de la pantalla) y alto
  const aIn = a - 2 * pared * r3, hIn = (3 * aIn) / (2 * r3), rfIn = rf - pared;
  const semiIn = (y) => (aIn / 2) * (1 - (y - suelo) / hIn);         // medio ancho interior a la altura y
  const yMod = 0.67 * h, s = Math.max(rfIn + 2.6, 5.2), c30 = Math.cos(Math.PI / 6);
  const nPant = [0, Math.sin(INCL), Math.cos(INCL)];
  return {
    L, h, suelo,
    pila: { x: -7.5, z: -4, yPlaca: suelo + 3 },                      // placa perforada sobre postes de 3 mm
    pant: [0, r, L / 2 + 1.5], nPant,                                  // centro del vidrio y normal
    mic: [-semiIn(yMod), yMod, 8], nIzq: [-c30, 0.5, 0],               // cara interior izquierda (micrófono)
    tac: [semiIn(yMod), yMod, -8], nDer: [c30, 0.5, 0],                // cara interior derecha (táctil)
    esquinas: [[-(aIn / 2 - s * c30), suelo + s / 2], [aIn / 2 - s * c30, suelo + s / 2], [0, suelo + hIn - s]],
    antena: [0, h - rf - 3, -10],
  };
})();
const Y_ESP = D.pila.yPlaca + 12.6;     // DevKit: placa 1,6 + cabecera hembra 8,5 + plástico de los pines macho 2,5
const Y_AMP = Y_ESP + 1.6 + 3.2 + 2;    // MAX98357A sobre cinta de espuma de doble cara de 2 mm encima del módulo WROOM

let DELTA = null; // nodos «carcasa:*» del GLB
async function cargarDelta(cargador) {
  const gltf = await cargador.loadAsync("modelos/carcasa-delta-suave.glb");
  DELTA = {};
  gltf.scene.traverse((n) => { // GLTFLoader quita los «:» de n.name; el nombre original queda en userData.name
    const nombre = n.userData.name || n.name;
    if (/^carcasa:/.test(nombre)) DELTA[nombre.slice(8)] = n;
  });
}
/** Pieza de la carcasa en mm y ejes de la escena; `origen` es el punto que queda en el origen del grupo. */
function piezaDelta(nombre, material, origen = [0, 0, 0]) {
  const r = new THREE.Group();
  r.rotation.x = -Math.PI / 2; r.scale.setScalar(1000); // el GLB viene en metros y con z hacia arriba
  const m = DELTA[nombre].clone();
  m.traverse((n) => { if (n.isMesh) { n.material = material; sombra(n); } });
  r.add(m);
  r.position.set(-origen[0], -origen[1], -origen[2]);
  return grupo(r);
}
const antenaDelta = () => piezaDelta("antena", M.rosa, D.antena);
const carcasaDelta = () => grupo(piezaDelta("trasera", M.pla), piezaDelta("frontal", M.plaFrente), en(antenaDelta(), ...D.antena));

/** Tornillo M2,5: cabeza en el origen, vástago de `largo` mm hacia +Y local. */
function tornillo(largo = 8) {
  return grupo(cil(2.2, 1.6, M.metal, 24), en(cil(1.25, largo, M.metal, 16), 0, 0.8 + largo / 2, 0),
    en(caja(3.2, 0.3, 0.7, M.hueco), 0, -0.72, 0), en(caja(0.7, 0.3, 3.2, M.hueco), 0, -0.72, 0));
}

/** Cable USB-C: origen en la punta del conector, que entra hacia +X; el cable cae `alto` mm hasta la mesa. */
function cableUsb(alto) {
  const g = grupo(en(caja(7, 2.4, 8.3, M.metal), -3.5, 0, 0), en(cajaR(20, 6.5, 12, 2, M.blanco), -17, 0, 0));
  const k = alto / 29.2;
  const curva = new THREE.CatmullRomCurve3([V(-26, 0, 0), V(-42, 0, 0), V(-60, -10 * k, 5), V(-74, -24 * k, 16), V(-92, -29.2 * k, 36), V(-128, -29.2 * k, 64)]);
  g.add(sombra(new THREE.Mesh(new THREE.TubeGeometry(curva, 48, 1.7, 8), M.blanco)));
  return g;
}

/* Catálogo de piezas del visor (ids = tools/precios/catalogo.json) */
const PIEZAS = [
  { id: "esp32s3", nombre: "ESP32-S3-DevKitC-1", medidas: "6,274 × 2,54 cm; filas de pines a 2,286 cm (plano de Espressif, v1.1)", hacer: esp32 },
  { id: "lcd185", nombre: "Pantalla redonda táctil 1,85\" ST77916", medidas: "Ø 5,5 × 0,91 cm; área activa Ø 4,57 cm; 3 tornillos M2 (Waveshare)", hacer: () => lcd185(caraGaleria(true)) },
  { id: "inmp441", nombre: "Micrófono INMP441", medidas: "Ø 1,4 × 0,22 cm (módulo redondo común)", hacer: inmp441 },
  { id: "max98357a", nombre: "Amplificador MAX98357A", medidas: "1,94 × 1,78 × 0,3 cm (Adafruit 3006)", hacer: max98357a },
  { id: "altavoz2030", nombre: "Altavoz de cavidad 8 Ω 2 W", medidas: "3 × 2 × 0,55 cm (Waveshare 2030)", hacer: altavoz },
  { id: "tactil", nombre: "Sensor táctil TTP223", medidas: "1,5 × 1,1 cm (módulo TTP223 común)", hacer: tactil },
  { id: "perfboard", nombre: "Placa perforada + cabeceras", medidas: "6 × 4 cm", hacer: placaPerforada },
  { id: "cableusbc", nombre: "Cable USB-A a USB-C", medidas: "1 m (Adafruit 4474); se muestra el conector y el primer tramo", hacer: () => cableUsb(29.2) },
  { id: "carcasa", nombre: "Carcasa Delta suave", medidas: "9,8 × 8,4 × 8,8 cm; frontal, trasera y antena en PLA (doc 09, generada con build123d)", hacer: carcasaDelta },
  { id: "ips2", nombre: "Pantalla IPS 2\" ST7789", medidas: "5,92 × 3,55 × 0,37 cm (Adafruit 4311)", hacer: () => ips2(caraGaleria(false)) },
  { id: "servo", nombre: "Micro servo SG92R", medidas: "2,3 × 1,1 × 2,9 cm (Adafruit 169)", hacer: servo },
  { id: "vl53l0x", nombre: "Sensor ToF VL53L0X", medidas: "2,1 × 1,8 × 0,28 cm (Adafruit 3317)", hacer: vl53l0x },
  { id: "mpu6050", nombre: "IMU MPU-6050", medidas: "2,6 × 1,78 × 0,46 cm (Adafruit 3886)", hacer: mpu6050 },
  { id: "bat18650", nombre: "Celda 18650", medidas: "6,9 × Ø 1,8 cm con protección (Adafruit 1781)", hacer: bat18650 },
  { id: "cargador", nombre: "PowerBoost 1000C", medidas: "4,5 × 2,3 × 1 cm con USB-A (Adafruit 2465)", hacer: powerboost },
];
let caraGal = null;
function caraGaleria(redonda) { caraGal = crearCara(redonda); caraGal.poner(1, 1, 0); return caraGal; }

/* ------------------------------------------------------------------ */
/* Ensamblaje de la propuesta A en la Delta suave                      */
/* ------------------------------------------------------------------ */
const PASOS = [
  { titulo: "Despiece", dur: 0, texto: "Todas las piezas de la propuesta A sobre la mesa, a escala real, con la carcasa Delta suave. El contorno marca dónde se monta Bitu. Arrastra para girar la vista; rueda o pellizco para acercar." },
  { titulo: "Carcasa trasera", dur: 3.4, nuevo: "Carcasa trasera", texto: "La mitad trasera de la Delta suave hace de chasis y se apoya de pie sobre su cara inferior. Trae la rejilla del altavoz, la ventana de los USB-C en la cara izquierda y dos de los cuatro postes de la placa." },
  { titulo: "Placa perforada", dur: 2.8, nuevo: "Placa perforada", texto: "La placa perforada de 6 × 4 cm, con dos tiras de cabeceras hembra, se apoya en los postes de 0,3 cm. Va 0,75 cm a la izquierda del centro para que los USB-C queden cerca de la pared." },
  { titulo: "ESP32-S3", dur: 2.8, nuevo: "ESP32-S3-DevKitC-1", texto: "El DevKit se encaja en las cabeceras, con los dos USB-C hacia la cara izquierda: quedan a 0,5 cm de la pared, frente a su ventana." },
  { titulo: "Micrófono", dur: 4.4, nuevo: "INMP441", texto: "El INMP441 se pega por dentro de la cara inclinada izquierda, con el puerto sobre el agujero de Ø 0,2 cm. WS, SCK y SD van a GPIO 4, 5 y 6; VDD a 3V3; GND y L/R a GND. Está en la mitad frontal: en el montaje real se pega antes de cerrar." },
  { titulo: "Amplificador y altavoz", dur: 4.8, nuevo: "MAX98357A + altavoz", texto: "El altavoz se pega a la cara trasera, detrás de la rejilla, y el MAX98357A va encima del DevKit sobre cinta de espuma de doble cara de 0,2 cm. DIN, BCLK y LRC van a GPIO 7, 15 y 16, VIN a 5 V y el altavoz a la bornera." },
  { titulo: "Pantalla y táctil", dur: 5.6, nuevo: "Pantalla 1,85\" + TTP223", texto: "La pantalla redonda de 1,85\" va en el centro del triángulo frontal, inclinada 12° hacia arriba. QSPI: CLK 21, CS 41, datos 47, 40, 42 y 2; RST 39 y retroiluminación 14; su táctil por I2C en 8, 9 y 10 (pines sin probar). El TTP223 va en la cara derecha (GPIO 1). En el montaje real la pantalla se encaja antes en el marco frontal." },
  { titulo: "Cierre", dur: 6.6, nuevo: "Carcasa frontal + tornillos + antena", texto: "La mitad frontal cierra el prisma y su marco sujeta la pantalla. Tres tornillos M2,5 × 40 entran por detrás, cruzan el hueco y roscan en los insertos de las columnas de las esquinas; la antena «bit» se encaja en la cima." },
  { titulo: "Encendido", dur: 5.6, nuevo: "Cable USB-C", texto: "Con el USB-C conectado por la ventana lateral, la pantalla despierta y Bitu abre los ojos, parpadea y saluda. Lo siguiente es la prueba de 30 min y el red teaming del contenido." },
];

/* Posición de cada pin en las cabeceras del DevKitC-1 (pin 1 en el extremo de la antena, +X).
   J1 queda en la fila trasera y J3 en la delantera. Según el pinout de Espressif; verificar con la serigrafía. */
const J1 = { "3V3": 0, "3V3b": 1, 4: 3, 5: 4, 6: 5, 7: 6, 15: 7, 16: 8, 8: 11, 9: 14, 10: 15, 14: 19, "5V": 20, GND: 21 };
const J3 = { GND: 0, 1: 3, 2: 4, 42: 5, 41: 6, 40: 7, 39: 8, 47: 16, 21: 17, GNDb: 20 };
const px = (i) => D.pila.x + 26.67 - i * 2.54;
const ROSA = new THREE.Color(0xff4fa0);
const C = { rojo: 0xd23b3b, cinco: 0xe8590c, negro: 0x26262b, amarillo: 0xf2c230, verde: 0x22a35a, blanco: 0xf5f5f5,
  morado: 0x7c3aed, azul: 0x2563eb, naranja: 0xf97316, gris: 0x9aa0ab, cian: 0x0ea5b7, marron: 0x8a5a2b };

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
  /** Punto local de una pieza ya colocada, en coordenadas de la escena. */
  const mundo = (p, x, y, z) => p.obj.localToWorld(V(x, y, z)).toArray();
  const orientar = (obj, de, a) => obj.quaternion.setFromUnitVectors(V(...de), V(...a));
  const mas = (p, n, k) => p.map((x, i) => x + n[i] * k);

  const { pila } = D;
  // Paso 1 · carcasa trasera (chasis)
  add(piezaDelta("trasera", M.pla), { paso: 1, a: 0, b: 1, fin: [0, 0, 0], banco: [-170, -30], giroBanco: [0, 0.5, 0], eje: [0, -1, 0], acerca: 24, alto: 80, carcasa: true, etiqueta: "Carcasa trasera" });

  // Paso 2 · placa perforada sobre los postes
  add(placaPerforada(), { paso: 2, a: 0, b: 0.92, fin: [pila.x, pila.yPlaca, pila.z], banco: [-95, 95], eje: [0, -1, 0], acerca: 14, c2: [pila.x, 46, 34], etiqueta: "Placa perforada" });

  // Paso 3 · DevKit en las cabeceras hembra
  add(esp32(), { paso: 3, a: 0, b: 0.92, fin: [pila.x, Y_ESP, pila.z], banco: [-15, 100], eje: [0, -1, 0], acerca: 13, c2: [pila.x, 60, 34], etiqueta: "ESP32-S3-DevKitC-1" });

  // Paso 4 · micrófono contra la cara izquierda (puerto hacia fuera, pines hacia dentro)
  const mic = inmp441(true); orientar(mic, [0, -1, 0], D.nIzq);
  const pMic = add(mic, { paso: 4, a: 0, b: 0.46, fin: mas([D.mic[0], D.mic[1], D.mic[2] - 1.5], D.nIzq, -0.3), banco: [-65, 140], giroBanco: [0, 0.3, 0], eje: D.nIzq, acerca: 15, c2: [-20, 70, 50], etiqueta: "Micrófono INMP441", subeEtiqueta: 12 });

  // Paso 5 · altavoz a la cara trasera y amplificador encima del DevKit
  const spk = altavoz(); spk.rotation.x = -Math.PI / 2;
  const pSpk = add(spk, { paso: 5, a: 0, b: 0.4, fin: [0, 34, -27.5], banco: [15, 140], eje: [0, 0, -1], acerca: 18, c2: [0, 70, -8], etiqueta: "Altavoz 8 Ω 2 W" });
  const pAmp = add(max98357a(true), { paso: 5, a: 0.14, b: 0.54, fin: [0, Y_AMP, -10], banco: [-30, 140], eje: [0, -1, 0], acerca: 16, c2: [0, 66, 26], etiqueta: "MAX98357A", subeEtiqueta: 14 });

  // Paso 6 · pantalla en el centro del triángulo frontal (12°) y táctil contra la cara derecha
  const disp = lcd185(cara); disp.rotation.x = Math.PI / 2 - INCL;
  const pDisp = add(disp, { paso: 6, a: 0, b: 0.4, fin: mas(D.pant, D.nPant, -9.12), banco: [100, 95], eje: D.nPant.map((x) => -x), acerca: 26, etiqueta: "Pantalla 1,85\" · 12°" });
  const tac = tactil(); orientar(tac, [0, 1, 0], D.nDer);
  const pTac = add(tac, { paso: 6, a: 0.08, b: 0.46, fin: mas(D.tac, D.nDer, -1.9), banco: [60, 140], eje: D.nDer, acerca: 15, c2: [24, 74, -40], etiqueta: "Táctil TTP223", subeEtiqueta: 12 });

  // Paso 7 · carcasa frontal, 3 tornillos (por detrás) y antena
  add(piezaDelta("frontal", M.plaFrente), { paso: 7, a: 0, b: 0.38, fin: [0, 0, 0], banco: [170, -20], giroBanco: [0, 0.15, 0], eje: [0, 0, -1], acerca: 30, c1: [170, 110, 60], c2: [0, 8, 84], carcasa: true, etiqueta: "Carcasa frontal", fugaz: true });
  D.esquinas.forEach(([x, y], i) => {
    const t = tornillo(40); t.rotation.x = Math.PI / 2;
    add(t, { paso: 7, a: 0.4 + i * 0.06, b: 0.66 + i * 0.06, fin: [x, y, -34.2], banco: [75, -130 + i * 9], giroBanco: [0, 0, Math.PI / 2], eje: [0, 0, 1], acerca: 12, alto: 40, vuelo: 0.42, vueltas: 8, etiqueta: i === 2 ? "3 tornillos M2,5 × 40" : null, fugaz: true });
  });
  add(antenaDelta(), { paso: 7, a: 0.82, b: 1, fin: D.antena, banco: [10, -120], eje: [0, -1, 0], acerca: 14, alto: 50, etiqueta: "Antena «bit»" });

  // Paso 8 · cable USB-C por la ventana de la cara izquierda
  const yUsb = Y_ESP + 3.2, xUsb = pila.x - 33, zUsb = pila.z + 6.5;
  add(cableUsb(yUsb - 1.7), { paso: 8, a: 0, b: 0.3, fin: [xUsb, yUsb, zUsb], desde: [xUsb - 62, yUsb, zUsb], eje: [1, 0, 0], acerca: 10, etiqueta: "Cable USB-C" });

  /* ---- Cables: crecen desde el módulo hasta su punto de soldadura junto a la cabecera ---- */
  const zA = pila.z - HDR - 2.54, zA2 = zA - 2.54, zB = pila.z + HDR + 2.54, zB2 = zB + 2.54, yP = pila.yPlaca + 1.6; // filas de la placa
  const zDetras = -22.5; // pasillo entre el amplificador y el altavoz por donde bajan los cables de la fila trasera
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
  /** Tramo final: baja a la fila trasera (zA) por detrás del amplificador, o a la delantera (zB) por delante del DevKit. */
  const aFila = (x, fila) => (fila <= zA
    ? [[x, 26, zDetras], [x, 22.5, fila - 1.5], [x, 20.6, fila], [x, yP, fila]]
    : [[x, 28, fila + 5], [x, 23, fila + 0.6], [x, 20.6, fila], [x, yP, fila]]);

  // Micrófono (pines: SD, VDD, GND, L/R, WS, SCK · orden est.). Bajan pegados a la cara izquierda.
  const micPin = (i) => mundo(pMic, -6.35 + i * 2.54, 8.75, 5.6);
  const haciaDentro = (p, n, k) => mas(p, n, -k);
  [[0, C.blanco, J1[6]], [5, C.verde, J1[5]], [4, C.amarillo, J1[4]], [1, C.rojo, J1["3V3"]]].forEach(([pin, color, idx], i) => {
    const [a, b] = rep(0.46, 1, i, 5), s = micPin(pin);
    cable(4, a, b, color, [s, haciaDentro(s, D.nIzq, 3), [-22 - i * 0.8, 52, 4], [-31 - i * 0.8, 32, -10], [-24, 29, zDetras], [px(idx) - 4, 27, zDetras], ...aFila(px(idx), zA)]);
  });
  { // GND del micrófono → GND de J3 (pin 1), y puente L/R–GND
    const [a, b] = rep(0.46, 1, 4, 5), s = micPin(2);
    cable(4, a, b, C.negro, [s, haciaDentro(s, D.nIzq, 3), [-22, 50, 14], [-24, 32, 18], [px(J3.GND) - 6, 28, zB + 6], ...aFila(px(J3.GND), zB).slice(1)]);
    const s3 = micPin(3), arco = mas(mas(s, s3, 1).map((x) => x / 2), D.nIzq, -1.6);
    cable(4, 0.5, 0.62, C.negro, [s, mas(s, D.nIzq, -1), arco, mas(s3, D.nIzq, -1), s3], 0.4);
  }

  // Amplificador (pines hacia arriba: LRC, BCLK, DIN, GAIN, SD, GND, VIN). Pasan por encima de la bornera y bajan por detrás.
  const ampPin = (i) => mundo(pAmp, -7.62 + i * 2.54, 8.75, 8.2);
  [[0, C.naranja, J1[16]], [1, C.azul, J1[15]], [2, C.morado, J1[7]], [5, C.negro, J1.GND], [6, C.cinco, J1["5V"]]].forEach(([pin, color, idx], i) => {
    const [a, b] = rep(0.54, 1, i, 7), s = ampPin(pin);
    cable(5, a, b, color, [s, [s[0], s[1] + 3, s[2] - 1], [s[0], 37.5 + i * 0.5, -12], [s[0] + (px(idx) - s[0]) * 0.4, 35, -19.5], [px(idx), 29, zDetras], ...aFila(px(idx), zA)]);
  });
  { // altavoz → bornera
    const s = mundo(pSpk, 13, 2.75, 7), born = (x) => mundo(pAmp, x, 9.4, -6.5);
    [[-1.9, C.rojo], [1.9, C.negro]].forEach(([x, color], i) => {
      const [a, b] = rep(0.54, 1, 5 + i, 7), f = born(x);
      cable(5, a, b, color, [[s[0], s[1], s[2] + 1], [s[0] - 2, s[1] + 3, -26], [f[0] + 4, 41 + i, -19], [f[0], f[1] + 3, f[2]], f]);
    });
  }

  // Pantalla: 13 hilos del cable GH1.25 de 15 pines (2 sin usar). Salen por detrás de la pantalla.
  const dispPin = (k) => mundo(pDisp, 13, 1.2, -7.5 + k * 1.25);
  const atras = D.nPant.map((x) => -x);
  const hilosPant = [ // [pin, color, fila, índice]
    ["GND", C.negro, zB, J3.GNDb], ["CLK", C.amarillo, zB, J3[21]], ["CS", C.morado, zB, J3[41]], ["IO0", C.verde, zB, J3[47]],
    ["IO1", C.azul, zB, J3[40]], ["IO2", C.naranja, zB, J3[42]], ["IO3", C.cian, zB, J3[2]], ["RST", C.blanco, zB, J3[39]],
    ["VCC", C.rojo, zA2, J1["3V3b"]], ["BL", C.gris, zA, J1[14]], ["SDA", C.verde, zA, J1[8]], ["SCL", C.amarillo, zA, J1[9]], ["INT", C.marron, zA, J1[10]],
  ];
  hilosPant.forEach(([, color, fila, idx], k) => {
    const [a, b] = rep(0.42, 1, k, 15), s = dispPin(k), s2 = mas(s, atras, 5), x = px(idx);
    const ruta = fila >= zB
      ? [s, s2, [x * 0.5 + s[0] * 0.5, 34 - k * 0.3, 22], [x, 29, fila + 6], ...aFila(x, fila).slice(1)]
      : [s, s2, [x * 0.5 + s[0] * 0.5, 41 + k * 0.3, 18], [x, 41.5 + k * 0.3, 2], [x, 39 + k * 0.3, -14], [x, 30, zDetras], ...aFila(x, fila).slice(1)];
    cable(6, a, b, color, ruta, 0.4);
  });

  // Táctil TTP223 (pines: VCC, I/O, GND · orden est.). Bajan pegados a la cara derecha.
  const tacPin = (k) => mundo(pTac, 6.2, -8.25, 2.54 - k * 2.54);
  [[0, C.rojo, zA2, J1["3V3"]], [1, C.cian, zB, J3[1]], [2, C.negro, zB2, J3.GND]].forEach(([k, color, fila, idx], i) => {
    const [a, b] = rep(0.5, 1, 13 + i, 16), s = tacPin(k), x = px(idx);
    const medio = [[s[0] + 3 - (s[0] - 26) * 0.3, 52, s[2] - 2], [30 - i, 33, fila < 0 ? -18 : 0]];
    const ruta = fila < 0
      ? [s, haciaDentro(s, D.nDer, 3), ...medio, [x + 3, 28, zDetras], [x, 22.5, fila - 1.5], [x, 20.6, fila], [x, yP, fila]]
      : [s, haciaDentro(s, D.nDer, 3), ...medio, [x + 4, 28, fila + 5], [x, 23, fila + 0.6], [x, 20.6, fila], [x, yP, fila]];
    cable(6, a, b, color, ruta);
  });

  return { g, partes, cables };
}

/* ------------------------------------------------------------------ */
/* Cámara guiada: encuadre por fotogramas clave a lo largo de la línea de tiempo */
/* ------------------------------------------------------------------ */
const E = {
  mesa: { c: [0, 18, 12], r: 215, az: 22, el: 40 },
  p1: { c: [0, 44, 0], r: 94, az: 30, el: 24 },
  p2: { c: [-7, 12, 0], r: 64, az: 24, el: 42 },
  p3: { c: [-7, 18, 0], r: 62, az: 20, el: 36 },
  p4: { c: [-14, 52, 6], r: 64, az: -38, el: 12 },
  p5: { c: [0, 32, -14], r: 66, az: 14, el: 30 },
  p6: { c: [4, 46, 14], r: 76, az: 46, el: 16 },
  p7a: { c: [0, 46, 8], r: 106, az: 38, el: 16 },
  p7b: { c: [0, 45, -16], r: 102, az: 154, el: 12 },
  p7c: { c: [0, 56, 2], r: 98, az: 28, el: 15 },
  p8a: { c: [-30, 26, 4], r: 84, az: -52, el: 12 },
  p8b: { c: [0, 48, 10], r: 80, az: 13, el: 7 },
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
  const marca = new THREE.Mesh(new THREE.RingGeometry(58, 59.4, 96), new THREE.MeshBasicMaterial({ color: 0x2c3fd6, transparent: true, opacity: 0.35 }));
  marca.rotation.x = -Math.PI / 2; marca.position.y = 0.06;
  escena.add(marca);

  const cara = crearCara(true);
  const cargador = new GLTFLoader();
  await cargarDelta(cargador); // la simulación usa las mallas reales de la carcasa Delta suave
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
    carcGrupo.visible = m === "carcasas";
    capa.hidden = m !== "ensamble";
    ui.panelEns.hidden = m !== "ensamble";
    ui.panelPie.hidden = m !== "piezas";
    if (ui.panelCarc) ui.panelCarc.hidden = m !== "carcasas";
    ui.modo.forEach((b) => b.setAttribute("aria-pressed", b.dataset.modo3d === m));
    if (m === "piezas") { pausar(); elegirPieza(estado.pieza || PIEZAS[0].id); }
    else if (m === "carcasas") { pausar(); elegirCarcasa(estado.carcasa || "delta-suave"); }
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
      if (e.hola) { on = u8 > 0.76; proy.set(34, 100, 26); }
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
    opacidadCarcasa();
  });

  /* ---------- Diseños de carcasa (generados con build123d: tools/carcasas/carcasas.py) ---------- */
  const carcGrupo = new THREE.Group();
  carcGrupo.visible = false;
  escena.add(carcGrupo);
  ui.panelCarc = raiz.querySelector(".v3d-panel-carcasas");
  const cacheCarc = new Map();
  let infoCarc = null;
  const fmt = (n, d = 1) => Number(n).toLocaleString("es", { minimumFractionDigits: d, maximumFractionDigits: d });
  function opacidadCarcasa() {
    carcGrupo.traverse((n) => {
      if (!n.isMesh || !n.userData.carcasa) return;
      n.material.transparent = estado.rayos; n.material.opacity = estado.rayos ? 0.22 : 1; n.material.depthWrite = !estado.rayos;
    });
    estado.sucio = true;
  }
  async function datosCarcasas() {
    for (let intento = 0; !infoCarc && intento < 3; intento++) {
      try { infoCarc = await fetch("modelos/carcasas.json", { cache: "no-cache" }).then((r) => r.json()); }
      catch (e) { if (intento === 2) { ui.panelCarc.querySelector("#v3d-carc-idea").textContent = "No se pudieron cargar los diseños (¿se abrió la web sin servidor?)."; throw e; } await new Promise((r) => setTimeout(r, 400)); }
    }
    return infoCarc;
  }
  async function elegirCarcasa(id) {
    estado.carcasa = id;
    const lista = await datosCarcasas();
    const d = lista.find((x) => x.id === id) || lista[0];
    ui.panelCarc.querySelectorAll("[data-carcasa]").forEach((b) => b.setAttribute("aria-pressed", b.dataset.carcasa === d.id));
    const q = (sel) => ui.panelCarc.querySelector(sel);
    q("#v3d-carc-nombre").textContent = d.nombre;
    q("#v3d-carc-idea").textContent = d.idea;
    q("#v3d-carc-datos").innerHTML = [
      ["Medidas", d.medidas_exteriores], ["PLA", `${fmt(d.gramos_pla)} g · USD ${fmt(d.coste_pla_usd, 2)}`],
      ["Impresión (est.)", `≈ ${fmt(d.horas_impresion_est)} h`], ["Piezas", Object.keys(d.partes).length],
      ["Micrófono–altavoz", `${fmt(d.comprobaciones.distancia_mic_altavoz_mm / 10)} cm`],
      ["Choques con la electrónica", d.todo_cabe ? "ninguno" : "revisar"],
    ].map(([k, v]) => `<div><dt>${k}</dt><dd>${v}</dd></div>`).join("");
    q("#v3d-carc-imp").textContent = d.impresion;
    let modelo = cacheCarc.get(d.id);
    if (!modelo) {
      const gltf = await cargador.loadAsync(`modelos/carcasa-${d.id}.glb`);
      modelo = gltf.scene;
      modelo.scale.setScalar(1000); // el GLB viene en metros
      modelo.traverse((n) => {
        if (!n.isMesh) return;
        n.castShadow = n.receiveShadow = true;
        const nombre = (x) => x.userData.name || x.name || ""; // GLTFLoader quita los «:» de x.name
        let p = n; while (p && !/^(carcasa|pieza):/.test(nombre(p))) p = p.parent;
        n.userData.carcasa = !!(p && nombre(p).startsWith("carcasa:"));
        n.material = n.material.clone();
        if (n.userData.carcasa) { n.material.roughness = 0.6; n.material.metalness = 0; }
      });
      const b = new THREE.Box3().setFromObject(modelo);
      modelo.position.y -= b.min.y;
      cacheCarc.set(d.id, modelo);
    }
    carcGrupo.clear();
    carcGrupo.add(modelo);
    opacidadCarcasa();
    encuadrar(carcGrupo, 1, 0.42);
    estado.sucio = true;
  }
  ui.panelCarc?.querySelectorAll("[data-carcasa]").forEach((b) => b.addEventListener("click", () => elegirCarcasa(b.dataset.carcasa)));

  ui.exportar.addEventListener("click", () => {
    if (estado.modo === "carcasas") { // el GLB ya está generado por la herramienta CAD
      const a = document.createElement("a"); a.href = `modelos/carcasa-${estado.carcasa}.glb`; a.download = `bitu-carcasa-${estado.carcasa}.glb`; a.click();
      return;
    }
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

  /* ---------- Enlaces directos: #3d-paso-N, #3d-pieza-<id> o #3d-carcasa-<id> ---------- */
  function desdeHash(inicial) {
    const h = location.hash.match(/^#3d-(paso|pieza|carcasa)-(.+)$/);
    if (!h) return false;
    primeraVez = false;
    if (h[1] === "paso") {
      pausar(); estado.objetivo = null;
      estado.t = Math.max(0, Math.min(N, +h[2] || 0));
      if (estado.modo !== "ensamble") setModo("ensamble");
      estado.camLibre = false; estado.saltarCam = true;
      aplicar(estado.t);
    } else if (h[1] === "carcasa") { estado.carcasa = h[2]; setModo("carcasas"); }
    else { estado.pieza = h[2]; setModo("piezas"); }
    raiz.scrollIntoView({ block: inicial ? "center" : "nearest" });
    return true;
  }
  if (!desdeHash(true)) { if (reducido) estado.t = N; aplicar(estado.t); }
  else if (estado.modo !== "ensamble") aplicar(estado.t);
  addEventListener("hashchange", () => desdeHash(false));
  raiz.classList.add("listo");
}

const raiz = document.getElementById("v3d");
if (raiz) iniciar(raiz).catch((e) => fallo(raiz, e));
