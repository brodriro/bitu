// Bitu · modelo 3D de las piezas y simulación del ensamblaje (propuesta A).
// Unidades: milímetros. Fuente de verdad: docs/research/08-modelo-3d.md.
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
  pcbMorado: mat(0x3b2a7a, { roughness: 0.45 }),
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
  perfboard: mat(0xc9a36a, { roughness: 0.8 }),
  pla: mat(0x2c3fd6, { roughness: 0.62 }),
  plaFrente: mat(0x3448e0, { roughness: 0.62 }),
  plaBase: mat(0x1b1a33, { roughness: 0.7 }),
  rosa: mat(0xe0448f, { roughness: 0.5 }),
  hueco: mat(0x0b0b12, { roughness: 0.9 }),
  ventilador: mat(0x24252c, { roughness: 0.5 }),
};

/* ------------------------------------------------------------------ */
/* Primitivas                                                          */
/* ------------------------------------------------------------------ */
const sombra = (m) => { m.castShadow = true; m.receiveShadow = true; return m; };
const caja = (w, h, d, m) => sombra(new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m));
const cajaR = (w, h, d, r, m) => sombra(new THREE.Mesh(new RoundedBoxGeometry(w, h, d, 3, r), m));
const cil = (r, h, m, seg = 40) => sombra(new THREE.Mesh(new THREE.CylinderGeometry(r, r, h, seg), m));
const en = (obj, x = 0, y = 0, z = 0) => { obj.position.set(x, y, z); return obj; };
const grupo = (...hijos) => { const g = new THREE.Group(); hijos.forEach((h) => g.add(h)); return g; };

/** PCB horizontal: ancho en X, fondo en Z, cara superior en y = 1.6. */
const pcb = (w, d, m) => en(caja(w, 1.6, d, m), 0, 0.8, 0);
const pcbRedondo = (r, m) => en(cil(r, 1.6, m, 64), 0, 0.8, 0);

/** Fila de n pines (paso 2,54) a lo largo de X; pines hacia abajo (macho). */
function tiraPines(n, abajo = true) {
  const g = new THREE.Group();
  const largo = n * 2.54;
  g.add(en(caja(largo, 2.5, 2.5, M.plasticoNegro), 0, abajo ? -1.25 : 1.6 + 1.25, 0));
  const pin = new THREE.BoxGeometry(0.64, 8.5, 0.64);
  const inst = new THREE.InstancedMesh(pin, M.oro, n);
  const m4 = new THREE.Matrix4();
  for (let i = 0; i < n; i++) {
    m4.makeTranslation(-largo / 2 + 1.27 + i * 2.54, abajo ? -4 : 4.5, 0);
    inst.setMatrixAt(i, m4);
  }
  inst.castShadow = true;
  g.add(inst);
  return g;
}

/** Textura de la cara de Bitu (se redibuja para parpadear y encender). */
function crearCara(redonda) {
  const c = document.createElement("canvas");
  c.width = c.height = 512;
  const ctx = c.getContext("2d");
  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  const estado = { encendida: 0, parpadeo: 0 };
  function dibujar() {
    ctx.fillStyle = "#06060b";
    ctx.fillRect(0, 0, 512, 512);
    const a = estado.encendida;
    if (a > 0) {
      ctx.globalAlpha = a;
      ctx.fillStyle = "#17143a";
      if (redonda) { ctx.beginPath(); ctx.arc(256, 256, 250, 0, Math.PI * 2); ctx.fill(); } else ctx.fillRect(0, 0, 512, 512);
      const h = 150 * (1 - 0.92 * estado.parpadeo);
      ctx.fillStyle = "#ffd23f";
      const r = 14;
      for (const x of [150, 300]) {
        ctx.beginPath();
        ctx.roundRect(x, 230 - h / 2, 62, Math.max(h, 8), r);
        ctx.fill();
      }
      ctx.fillStyle = "#ff4fa0";
      ctx.beginPath();
      ctx.roundRect(216, 350, 80, 18, 9);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
    tex.needsUpdate = true;
  }
  dibujar();
  return { tex, estado, dibujar };
}

/* ------------------------------------------------------------------ */
/* Piezas                                                              */
/* ------------------------------------------------------------------ */
function esp32() {
  const g = grupo(pcb(63, 25.5, M.pcbNegro));
  g.add(en(caja(18, 0.8, 25.5, M.chip), 22.5, 2, 0)); // base del módulo WROOM-1
  g.add(en(caja(15.8, 2.4, 17.6, M.metal), 20.6, 3.6, -2.6)); // blindaje
  g.add(en(caja(6, 0.2, 18, M.oro), 28.6, 2.5, 2)); // zona de antena (oro, aprox.)
  for (const z of [-6.5, 6.5]) g.add(en(cajaR(7.4, 3.2, 9, 1.2, M.metal), -28.6, 3.2, z)); // USB-C ×2
  for (const z of [-11, 11]) g.add(en(caja(4, 1.4, 3, M.blanco), -21, 2.3, z * 0.5)); // botones BOOT / RST
  g.add(en(caja(2, 0.8, 2, M.chip), -14, 2, 0));
  g.add(en(caja(3.5, 1, 3.5, M.chip), -8, 2.1, 0)); // regulador
  for (const z of [-11.4, 11.4]) g.add(en(tiraPines(22), 0, 0, z));
  return g;
}

function gc9a01(cara) {
  const g = grupo(pcbRedondo(19.5, M.pcbAzul));
  g.add(en(caja(13, 1.2, 5, M.pcbAzul), 0, 0.6, 20.5)); // lengüeta del conector
  g.add(en(tiraPines(8, true), 0, 0, 22.5));
  g.add(en(cil(17.8, 2.6, M.vidrio, 64), 0, 2.9, 0));
  const pantalla = new THREE.Mesh(new THREE.CircleGeometry(16.2, 64), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2;
  pantalla.position.y = 4.25;
  g.add(pantalla);
  return g;
}

function ips2(cara) {
  const g = grupo(pcb(46, 35, M.pcbNegro));
  g.add(en(caja(40, 2.4, 30, M.vidrio), -1, 2.8, 0));
  const pantalla = new THREE.Mesh(new THREE.PlaneGeometry(36, 27), new THREE.MeshBasicMaterial({ map: cara.tex, toneMapped: false }));
  pantalla.rotation.x = -Math.PI / 2;
  pantalla.position.set(-1, 4.05, 0);
  g.add(pantalla);
  const t = tiraPines(9); t.rotation.y = Math.PI / 2; g.add(en(t, 21.5, 0, 0));
  return g;
}

function inmp441() {
  const g = grupo(pcbRedondo(7, M.pcbAzul));
  g.add(en(caja(4, 1, 3, M.metal), 0, 2.1, -1.5));
  g.add(en(cil(0.6, 1.8, M.hueco, 16), 0, 0.8, 1.5)); // puerto acústico
  g.add(en(tiraPines(6), 0, 0, 5.6));
  return g;
}

function max98357a() {
  const g = grupo(pcb(17.8, 19.4, M.pcbAzulOsc));
  g.add(en(caja(3, 0.8, 3, M.chip), 0, 2, 0));
  g.add(en(caja(7.6, 7.5, 5.5, M.bornera), 0, 5.3, -6.5));
  for (const x of [-1.9, 1.9]) g.add(en(cil(1.1, 0.8, M.metal, 16), x, 9.3, -6.5));
  g.add(en(tiraPines(7), 0, 0, 8.2));
  return g;
}

function altavoz() {
  const g = grupo(en(cajaR(30, 10, 20, 2, M.plasticoNegro), 0, 5, 0));
  g.add(en(cil(8.5, 0.6, M.ventilador, 48), 0, 10.2, 0));
  const reja = new THREE.InstancedMesh(new THREE.CylinderGeometry(0.7, 0.7, 0.4, 10), M.hueco, 19);
  const m4 = new THREE.Matrix4(); let i = 0;
  for (const [x, z] of [[0, 0], ...[0, 1, 2, 3, 4, 5].map((k) => [Math.cos(k * Math.PI / 3) * 3.2, Math.sin(k * Math.PI / 3) * 3.2]), ...[...Array(12)].map((_, k) => [Math.cos(k * Math.PI / 6) * 6.2, Math.sin(k * Math.PI / 6) * 6.2])]) {
    m4.makeTranslation(x, 10.6, z); reja.setMatrixAt(i++, m4);
  }
  g.add(reja);
  return g;
}

function tactil() {
  const g = grupo(pcb(24, 15, M.pcbRojo));
  g.add(en(cil(5.5, 0.15, M.cobre, 40), -4, 1.7, 0));
  g.add(en(caja(2.5, 0.8, 2, M.chip), 6, 2, -3));
  const t = tiraPines(3); t.rotation.y = Math.PI / 2; g.add(en(t, 10.5, 0, 0));
  return g;
}

function servo() {
  const g = grupo(en(caja(23, 22.5, 12.2, M.servo), 0, 11.25, 0));
  g.add(en(caja(32, 2.5, 12.2, M.servo), 0, 16, 0));
  g.add(en(cil(5.8, 4, M.servo), -5.5, 24.5, 0));
  g.add(en(cil(2.4, 3.2, M.blanco, 20), -5.5, 28, 0));
  g.add(en(cajaR(20, 1.6, 5.5, 0.7, M.blanco), -5.5, 30.2, 0));
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
  const g = grupo(pcb(25.6, 17.8, M.pcbAzul));
  g.add(en(caja(4, 0.9, 4, M.chip), 0, 2.05, -1));
  g.add(en(tiraPines(8), 0, 0, 7.5));
  return g;
}

function bat18650() {
  const g = new THREE.Group();
  const cuerpo = cil(9, 63, M.bateria, 48); cuerpo.rotation.z = Math.PI / 2; g.add(en(cuerpo, 0, 9, 0));
  for (const x of [-31.8, 31.8]) { const t = cil(8.6, 0.8, M.metal, 40); t.rotation.z = Math.PI / 2; g.add(en(t, x, 9, 0)); }
  const nub = cil(3, 1.2, M.metal, 24); nub.rotation.z = Math.PI / 2; g.add(en(nub, 32.8, 9, 0));
  const banda = cil(9.05, 6, M.blanco, 48); banda.rotation.z = Math.PI / 2; g.add(en(banda, -20, 9, 0));
  return g;
}

function powerboost() {
  const g = grupo(pcb(36, 23, M.pcbNegro));
  g.add(en(cajaR(14, 7, 13, 0.6, M.metal), 13, 5.1, 0)); // USB-A
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
  const gpio = grupo(en(caja(51, 8.5, 5, M.plasticoNegro), 0, 1.6 + 4.25, 0));
  g.add(en(gpio, -7, 0, -24.5));
  for (const z of [-19, 1]) g.add(en(caja(17.5, 15.6, 13.2, M.metal), 34.5, 1.6 + 7.8, z));
  g.add(en(caja(21, 13.5, 16, M.metal), 32.5, 1.6 + 6.75, 19));
  for (const x of [-25, -11]) g.add(en(caja(6.5, 3, 7.5, M.metal), x, 3.1, 25));
  g.add(en(cajaR(9, 3.2, 7.5, 1.2, M.metal), -37, 3.2, 25));
  return g;
}

function cooler() {
  const g = grupo(en(caja(40, 2, 30, M.aluminio), 0, 1, 0));
  for (let i = 0; i < 9; i++) g.add(en(caja(1.2, 6, 30, M.aluminio), -18 + i * 2.2, 5, 0));
  g.add(en(cil(14, 6, M.ventilador, 48), 9, 5, 0));
  g.add(en(cil(5, 6.4, M.chip, 32), 9, 5.2, 0));
  return g;
}

function fuente27w() {
  const g = grupo(en(cajaR(52, 30, 40, 6, M.blanco), 0, 15, 0));
  const cable = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3([
    new THREE.Vector3(26, 15, 0), new THREE.Vector3(48, 12, 6), new THREE.Vector3(62, 6, 24), new THREE.Vector3(66, 4, 48)]), 40, 2, 10), M.blanco);
  g.add(sombra(cable));
  for (const x of [-8, 8]) g.add(en(caja(2, 2, 14, M.metal), x, 15, -26));
  return g;
}

function respeaker() {
  const g = grupo(pcb(86, 35, M.pcbNegro));
  for (const x of [-34, 34]) { g.add(en(cil(2.2, 1.2, M.metal, 24), x, 2.2, 0)); }
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

function placaPerforada() {
  const c = document.createElement("canvas"); c.width = 240; c.height = 160;
  const ctx = c.getContext("2d");
  ctx.fillStyle = "#c9a36a"; ctx.fillRect(0, 0, 240, 160);
  ctx.fillStyle = "#7a5a2c";
  for (let x = 5; x < 240; x += 10.16) for (let y = 5; y < 160; y += 10.16) { ctx.beginPath(); ctx.arc(x, y, 2.4, 0, Math.PI * 2); ctx.fill(); }
  const tex = new THREE.CanvasTexture(c); tex.colorSpace = THREE.SRGBColorSpace;
  const m = mat(0xffffff, { map: tex, roughness: 0.85 });
  const g = grupo(pcb(60, 40, m));
  for (const z of [-11.4, 11.4]) g.add(en(caja(56, 8.5, 2.5, M.plasticoNegro), 0, 1.6 + 4.25, z)); // cabeceras hembra
  return g;
}

/* Carcasa impresa (cabeza 70 mm en dos mitades) */
function carcasa(mitad) {
  const g = new THREE.Group();
  const m = mitad === "frontal" ? M.plaFrente : M.pla;
  const cuerpo = cajaR(70, 70, 35, 9, m);
  g.add(cuerpo);
  if (mitad === "frontal") {
    const bisel = sombra(new THREE.Mesh(new THREE.TorusGeometry(19.2, 1.6, 16, 64), m));
    g.add(en(bisel, 0, 5, 17.7));
  } else {
    // rejilla del altavoz y agujero USB-C
    const reja = new THREE.InstancedMesh(new THREE.CylinderGeometry(1, 1, 0.6, 12), M.hueco, 25);
    const m4 = new THREE.Matrix4().makeRotationX(Math.PI / 2); let i = 0;
    for (let a = -2; a <= 2; a++) for (let b = -2; b <= 2; b++) {
      const r = new THREE.Matrix4().makeRotationX(Math.PI / 2).setPosition(-11 + a * 4, 5 + b * 4, -17.6);
      reja.setMatrixAt(i++, r);
    }
    g.add(reja);
    const usb = cajaR(0.8, 5, 12, 0.3, M.hueco); g.add(en(usb, -35.1, -22, 15.5));
  }
  // agujero de micrófono y marca táctil en el techo (en ambas mitades según posición)
  if (mitad === "frontal") {
    g.add(en(cil(1, 0.4, M.hueco, 16), 12, 35.05, -5.5));
  } else {
    const anillo = sombra(new THREE.Mesh(new THREE.TorusGeometry(5, 0.6, 8, 40), M.rosa)); anillo.rotation.x = Math.PI / 2;
    g.add(en(anillo, -14, 35.1, 17));
  }
  return g;
}

const base = () => grupo(en(cil(26, 10, M.plaBase, 64), 0, 5, 0));
const antena = () => grupo(en(cil(2, 10, M.pla, 20), 0, 5, 0), en(cajaR(10, 10, 10, 1.5, M.rosa), 0, 13, 0));
function tornillo() {
  const g = grupo(en(cil(2.2, 1.6, M.metal, 24), 0, 0, 0), en(cil(1.25, 8, M.metal, 16), 0, 4.8, 0));
  g.rotation.x = Math.PI / 2;
  return g;
}

/* Catálogo de piezas del visor */
const PIEZAS = [
  { id: "esp32s3", nombre: "ESP32-S3-DevKitC-1", medidas: "63 × 25,5 mm", hacer: esp32 },
  { id: "gc9a01", nombre: "Pantalla redonda GC9A01 1,28\"", medidas: "Ø 39 mm (vidrio Ø 35,6)", hacer: () => gc9a01(caraGaleria(true)) },
  { id: "inmp441", nombre: "Micrófono INMP441", medidas: "Ø 14 mm (est.)", hacer: inmp441 },
  { id: "max98357a", nombre: "Amplificador MAX98357A", medidas: "17,8 × 19,4 mm", hacer: max98357a },
  { id: "altavoz", nombre: "Altavoz 3 W · 4 Ω", medidas: "30 × 20 × 10 mm", hacer: altavoz },
  { id: "tactil", nombre: "Sensor táctil TTP223", medidas: "24 × 15 mm (est.)", hacer: tactil },
  { id: "perfboard", nombre: "Placa perforada + cabeceras", medidas: "60 × 40 mm", hacer: placaPerforada },
  { id: "carcasa", nombre: "Carcasa impresa (A)", medidas: "Cabeza 70 × 70 × 70 mm", hacer: () => {
      const g = new THREE.Group(); g.add(en(carcasa("trasera"), 0, 45, -17.6)); g.add(en(carcasa("frontal"), 0, 45, 17.6));
      g.add(base()); g.add(en(antena(), 0, 80, 0)); return g; } },
  { id: "ips2", nombre: "Pantalla IPS 2\" ST7789", medidas: "46 × 35 mm", hacer: () => ips2(caraGaleria(false)) },
  { id: "servo", nombre: "Micro servo SG92R", medidas: "23 × 12,2 × 22,5 mm", hacer: servo },
  { id: "vl53l0x", nombre: "Sensor ToF VL53L0X", medidas: "21 × 18 mm (est.)", hacer: vl53l0x },
  { id: "mpu6050", nombre: "IMU MPU-6050", medidas: "25,6 × 17,8 mm", hacer: mpu6050 },
  { id: "bat18650", nombre: "Celda 18650", medidas: "Ø 18 × 65 mm", hacer: bat18650 },
  { id: "cargador", nombre: "PowerBoost 1000C", medidas: "36 × 23 mm (est.)", hacer: powerboost },
  { id: "pi5_8gb", nombre: "Raspberry Pi 5", medidas: "85 × 56 mm", hacer: () => { const g = pi5(); g.add(en(cooler(), -4, 1.6, -2)); return g; } },
  { id: "cooler", nombre: "Active Cooler", medidas: "40 × 30 × 8 mm (est.)", hacer: cooler },
  { id: "fuente27w", nombre: "Fuente 27 W USB-C", medidas: "52 × 40 × 30 mm (est.)", hacer: fuente27w },
  { id: "respeaker", nombre: "ReSpeaker Lite", medidas: "86 × 35 mm (est.)", hacer: respeaker },
  { id: "box3", nombre: "ESP32-S3-BOX-3", medidas: "60 × 60 × 14 mm + base (est.)", hacer: () => box3(caraGaleria(false)) },
];
let caraGal = null;
function caraGaleria(redonda) {
  const c = crearCara(redonda); c.estado.encendida = 1; c.dibujar(); caraGal = c; return c;
}

/* ------------------------------------------------------------------ */
/* Ensamblaje de la propuesta A                                        */
/* ------------------------------------------------------------------ */
const PASOS = [
  { titulo: "Despiece", texto: "Todas las piezas de la propuesta A separadas. Arrastra para girar la vista; rueda o pellizco para acercar." },
  { titulo: "Placa perforada", texto: "La placa perforada de 60 × 40 mm, con dos tiras de cabeceras hembra, va al fondo de la cabeza.", nuevo: "Placa perforada" },
  { titulo: "ESP32-S3", texto: "El DevKit se encaja en las cabeceras, con el USB-C hacia el lateral izquierdo.", nuevo: "ESP32-S3-DevKitC-1" },
  { titulo: "Micrófono", texto: "El INMP441 va al techo, bajo el agujero del micrófono. Cables I2S a GPIO 4 (WS), 5 (SCK) y 6 (SD), más 3V3 y GND.", nuevo: "INMP441" },
  { titulo: "Amplificador y altavoz", texto: "MAX98357A y altavoz a la pared trasera, frente a la rejilla. DIN, BCLK y LRC a GPIO 7, 15 y 16; VIN a 5 V.", nuevo: "MAX98357A + altavoz" },
  { titulo: "Pantalla y táctil", texto: "La GC9A01 va al frente (SPI: 47, 21, 40, 45, 41 y 42 para la retroiluminación) y el TTP223 al techo (GPIO 1).", nuevo: "GC9A01 + TTP223" },
  { titulo: "Carcasa trasera", texto: "Entran la mitad trasera de la carcasa, con su rejilla y el hueco USB-C, y la base.", nuevo: "Carcasa trasera + base" },
  { titulo: "Cierre", texto: "La mitad frontal cierra la cabeza con 4 tornillos M2,5 en insertos térmicos, y la antena «bit» va encima.", nuevo: "Carcasa frontal + tornillos + antena" },
  { titulo: "Encendido", texto: "Con USB-C conectado, Bitu enciende y muestra su cara. Lo siguiente es la prueba de 30 min y el red teaming del contenido.", nuevo: "—" },
];

function construirEnsamblaje(cara) {
  const g = new THREE.Group();
  const partes = [];
  const cables = [];
  const Y = 45; // centro de la cabeza
  const add = (obj, paso, final, desde, giroDesde = [0, 0, 0]) => {
    obj.position.set(...final);
    const rotFinal = obj.rotation.clone();
    partes.push({
      obj, paso,
      final: new THREE.Vector3(...final),
      desde: new THREE.Vector3(...final).add(new THREE.Vector3(...desde)),
      rotFinal: new THREE.Quaternion().setFromEuler(rotFinal),
      rotDesde: new THREE.Quaternion().setFromEuler(new THREE.Euler(rotFinal.x + giroDesde[0], rotFinal.y + giroDesde[1], rotFinal.z + giroDesde[2])),
    });
    g.add(obj);
    return obj;
  };

  add(placaPerforada(), 1, [0, 12, -2], [-90, -6, 40], [0, 0.6, 0]);
  add(esp32(), 2, [0, 22.3, -2], [0, 70, 30], [0, 0.4, 0.2]);

  add(inmp441(), 3, [12, 72, 12], [70, 60, 50], [0.6, 0, 0]);

  const amp = max98357a(); amp.rotation.x = Math.PI / 2;
  add(amp, 4, [18, 52, -31.4], [60, 10, -80], [0, 0.6, 0]);
  const spk = altavoz(); spk.rotation.x = -Math.PI / 2;
  add(spk, 4, [-11, 50, -22], [-70, 10, -80], [0, 0.6, 0]);

  const disp = gc9a01(cara); disp.rotation.x = Math.PI / 2;
  add(disp, 5, [0, 50, 33.2], [0, 30, 80], [0.6, 0, 0]);
  add(tactil(), 5, [-14, 75, 0], [-80, 60, 30], [0.5, 0, 0.3]);

  add(carcasa("trasera"), 6, [0, Y, -17.6], [-40, 0, -110]);
  add(base(), 6, [0, 0, 0], [-70, 0, 40]);
  add(carcasa("frontal"), 7, [0, Y, 17.6], [95, 55, 30], [0, -0.7, 0]);
  for (const [x, y] of [[-27, 18], [27, 18], [-27, 72], [27, 72]]) {
    const t = tornillo(); t.rotation.x = -Math.PI / 2;
    add(t, 7, [x, y, -36.4], [0, 0, -40], [0, 0, 3]);
  }
  add(antena(), 7, [0, 80, 0], [0, 60, 0], [0, 1.4, 0]);

  // Cables (crecen en su paso). Filas de pines del DevKit en z = -13.4 / 9.4, a y ≈ 21.
  const filaA = -13.4, filaB = 9.4, yp = 21.5;
  const px = (n) => -26.67 + n * 2.54; // posición X del pin n (0..21)
  const cable = (paso, color, pts) => {
    const curva = new THREE.CatmullRomCurve3(pts.map((p) => new THREE.Vector3(...p)));
    const geo = new THREE.TubeGeometry(curva, 80, 0.55, 8);
    const m = new THREE.Mesh(geo, mat(color, { roughness: 0.45 }));
    m.castShadow = true;
    geo.setDrawRange(0, 0);
    g.add(m);
    cables.push({ m, paso, total: geo.index.count });
  };
  // Micrófono (techo) → fila A
  [[0xf2c230, 4], [0x22a35a, 5], [0xf5f5f5, 6], [0xd23b3b, 0], [0x222222, 21]].forEach(([c, n], i) =>
    cable(3, c, [[7 + i * 2.54, 66, 17.6], [4 + i * 2, 52, 4], [px(n), 35, filaA - 3], [px(n), yp, filaA]]));
  // Amplificador → fila A ; altavoz → bornera
  [[0x7c3aed, 7], [0x2563eb, 15], [0xf97316, 16], [0xd23b3b, 1], [0x222222, 20]].forEach(([c, n], i) =>
    cable(4, c, [[14 + i * 2, 44, -30], [12 + i * 1.5, 34, -24], [px(n), 28, filaA - 2], [px(n), yp, filaA]]));
  cable(4, 0xd23b3b, [[-1, 50, -24], [6, 52, -27], [16.5, 58.5, -28]]);
  cable(4, 0x222222, [[-1, 47, -24], [8, 46, -27], [19.5, 58.5, -28]]);
  // Pantalla → fila B
  [[0x2563eb, 18], [0x22a35a, 10], [0xf2c230, 14], [0xf97316, 16], [0x7c3aed, 15], [0xf5f5f5, 17], [0xd23b3b, 2], [0x222222, 19]].forEach(([c, n], i) =>
    cable(5, c, [[-8 + i * 2.2, 28.5, 31.6], [-6 + i * 2, 30, 22], [px(n), 28, filaB + 2], [px(n), yp, filaB]]));
  // Táctil → fila B
  [[0x22a35a, 3], [0xd23b3b, 4], [0x222222, 5]].forEach(([c, n], i) =>
    cable(5, c, [[-3.5, 67, -2.5 + i * 2.54], [-8, 52, 6], [px(n), 32, filaB + 3], [px(n), yp, filaB]]));

  return { g, partes, cables };
}

/* ------------------------------------------------------------------ */
/* Visor                                                               */
/* ------------------------------------------------------------------ */
async function iniciar(raiz) {
  const lienzo = raiz.querySelector(".v3d-lienzo");
  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  lienzo.appendChild(renderer.domElement);
  renderer.domElement.setAttribute("aria-label", "Vista 3D interactiva de Bitu");
  renderer.domElement.setAttribute("role", "img");

  const escena = new THREE.Scene();
  const pmrem = new THREE.PMREMGenerator(renderer);
  escena.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;

  const camara = new THREE.PerspectiveCamera(32, 1, 1, 3000);
  const controles = new OrbitControls(camara, renderer.domElement);
  controles.enableDamping = true;
  controles.maxPolarAngle = Math.PI * 0.49;
  controles.minDistance = 60;
  controles.maxDistance = 900;

  const luz = new THREE.DirectionalLight(0xffffff, 1.6);
  luz.position.set(120, 260, 160);
  luz.castShadow = true;
  luz.shadow.mapSize.set(2048, 2048);
  Object.assign(luz.shadow.camera, { left: -200, right: 200, top: 200, bottom: -200, near: 10, far: 700 });
  luz.shadow.bias = -0.0004;
  escena.add(luz, new THREE.HemisphereLight(0xffffff, 0xdfe3f3, 0.5));
  const suelo = new THREE.Mesh(new THREE.PlaneGeometry(2000, 2000), new THREE.ShadowMaterial({ opacity: 0.16 }));
  suelo.rotation.x = -Math.PI / 2; suelo.receiveShadow = true;
  escena.add(suelo);

  // Ensamblaje
  const cara = crearCara(true);
  const ens = construirEnsamblaje(cara);
  escena.add(ens.g);

  // Galería
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
  const estado = { modo: "ensamble", t: 0, objetivo: null, reproduciendo: false, pieza: null, ultimoPaso: -1, rayos: false };

  // Lista de pasos
  ui.pasos.innerHTML = PASOS.map((p, i) => `<li><button type="button" data-paso="${i}"><span>${i}</span>${p.titulo}</button></li>`).join("");
  ui.pasos.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => irA(+b.dataset.paso)));

  // Lista de piezas
  ui.lista.innerHTML = PIEZAS.map((p) => `<li><button type="button" data-pieza="${p.id}" aria-pressed="false">${p.nombre}</button></li>`).join("");
  ui.lista.querySelectorAll("button").forEach((b) => b.addEventListener("click", () => elegirPieza(b.dataset.pieza)));

  function encuadrar(obj, dist = 1, alto = 0.45) {
    const caja3 = new THREE.Box3().setFromObject(obj);
    const centro = caja3.getCenter(new THREE.Vector3());
    const r = caja3.getSize(new THREE.Vector3()).length() / 2;
    const d = (r / Math.sin((camara.fov * Math.PI) / 360)) * 1.1 * dist;
    controles.target.copy(centro);
    camara.position.set(centro.x + d * 0.62, centro.y + d * alto, centro.z + d * 0.75);
    camara.near = Math.max(0.5, d / 100); camara.far = d * 20; camara.updateProjectionMatrix();
    controles.update();
  }

  function elegirPieza(id) {
    const p = PIEZAS.find((x) => x.id === id) || PIEZAS[0];
    estado.pieza = p.id;
    galeria.clear();
    const obj = p.hacer();
    // apoyar en el suelo
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
  }

  function setModo(m) {
    estado.modo = m;
    ens.g.visible = m === "ensamble";
    galeria.visible = m === "piezas";
    ui.panelEns.hidden = m !== "ensamble";
    ui.panelPie.hidden = m !== "piezas";
    ui.modo.forEach((b) => b.setAttribute("aria-pressed", b.dataset.modo3d === m));
    if (m === "piezas") { pausar(); elegirPieza(estado.pieza || PIEZAS[0].id); }
    else vistaEnsamble();
  }
  ui.modo.forEach((b) => b.addEventListener("click", () => setModo(b.dataset.modo3d)));

  function vistaEnsamble() {
    controles.target.set(0, 42, 0);
    camara.position.set(235, 190, 330);
    camara.near = 1; camara.far = 3000; camara.updateProjectionMatrix();
    controles.update();
  }

  const suave = (x) => (x <= 0 ? 0 : x >= 1 ? 1 : 1 - Math.pow(1 - x, 3));
  function aplicar(t) {
    for (const p of ens.partes) {
      const k = suave(t - (p.paso - 1));
      p.obj.position.lerpVectors(p.desde, p.final, k);
      p.obj.quaternion.slerpQuaternions(p.rotDesde, p.rotFinal, k);
    }
    for (const c of ens.cables) {
      const k = suave((t - (c.paso - 1) - 0.55) / 0.45);
      c.m.geometry.setDrawRange(0, Math.floor((c.total * k) / 3) * 3);
      c.m.visible = k > 0;
    }
    const enc = suave(t - (N - 1));
    if (enc !== cara.estado.encendida) { cara.estado.encendida = enc; cara.dibujar(); }
    // carcasa transparente (rayos X) para ver el interior
    const op = estado.rayos ? 0.22 : 1;
    [M.pla, M.plaFrente].forEach((m) => { m.transparent = op < 1; m.opacity = op; m.depthWrite = op === 1; });
    const paso = Math.min(N, Math.max(0, Math.round(t)));
    if (paso !== estado.ultimoPaso) { estado.ultimoPaso = paso; pintarPaso(paso); }
    ui.barra.value = t.toFixed(2);
  }

  function pintarPaso(i) {
    const p = PASOS[i];
    ui.pasoNum.textContent = `Paso ${i} de ${N}`;
    ui.pasoTitulo.textContent = p.titulo;
    ui.pasoTexto.textContent = p.texto;
    ui.pasoNuevo.textContent = p.nuevo || "—";
    ui.pasos.querySelectorAll("button").forEach((b) => b.setAttribute("aria-current", +b.dataset.paso === i ? "step" : "false"));
  }

  function irA(paso) { pausar(); estado.objetivo = Math.max(0, Math.min(N, paso)); }
  function reproducir() {
    if (estado.t >= N - 0.001) estado.t = 0;
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
    estado.rayos = !estado.rayos; ui.rayos.setAttribute("aria-pressed", estado.rayos); aplicar(estado.t);
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

  // Tamaño
  function redimensionar() {
    const w = lienzo.clientWidth, h = lienzo.clientHeight;
    renderer.setSize(w, h, false);
    camara.aspect = w / h; camara.updateProjectionMatrix();
  }
  new ResizeObserver(redimensionar).observe(lienzo);
  redimensionar();

  // Bucle (solo mientras el visor está en pantalla)
  let visible = false, primeraVez = true;
  new IntersectionObserver(([e]) => {
    visible = e.isIntersecting;
    if (visible && primeraVez) { primeraVez = false; if (!reducido) reproducir(); }
    if (visible) bucle();
  }, { threshold: 0.25 }).observe(lienzo);

  const reloj = new THREE.Clock();
  let parpadeo = 0, enMarcha = false;
  function bucle() {
    if (enMarcha) return;
    enMarcha = true;
    reloj.getDelta();
    const tick = () => {
      if (!visible) { enMarcha = false; return; }
      const dt = Math.min(reloj.getDelta(), 0.05);
      if (estado.modo === "ensamble") {
        if (estado.reproduciendo) {
          // avance con pausa corta al terminar cada paso
          const frac = estado.t % 1;
          estado.t += dt * (frac > 0.9 || frac < 0.02 ? 0.35 : 0.42);
          if (estado.t >= N) { estado.t = N; pausar(); }
          aplicar(estado.t);
        } else if (estado.objetivo !== null) {
          const d = estado.objetivo - estado.t;
          estado.t = Math.abs(d) < 0.004 ? estado.objetivo : estado.t + d * Math.min(1, dt * 4);
          if (estado.t === estado.objetivo) estado.objetivo = null;
          aplicar(estado.t);
        }
      } else if (galeria.userData.pivote && !reducido) {
        galeria.userData.pivote.rotation.y += dt * 0.35;
      }
      // parpadeo de la cara
      parpadeo += dt;
      const ciclo = parpadeo % 4.2;
      const b = ciclo > 4 ? Math.sin(((ciclo - 4) / 0.2) * Math.PI) : 0;
      if (cara.estado.encendida > 0 && cara.estado.parpadeo !== b) { cara.estado.parpadeo = b; cara.dibujar(); }
      if (caraGal && estado.modo === "piezas" && caraGal.estado.parpadeo !== b) { caraGal.estado.parpadeo = b; caraGal.dibujar(); }
      controles.update();
      renderer.render(escena, camara);
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }

  vistaEnsamble();
  // Enlaces directos: #3d-paso-N o #3d-pieza-<id>
  const h = location.hash.match(/^#3d-(paso|pieza)-(.+)$/);
  if (h && h[1] === "paso") { primeraVez = false; estado.t = Math.min(N, +h[2] || 0); }
  else if (reducido) estado.t = N;
  aplicar(estado.t);
  if (h && h[1] === "pieza") { primeraVez = false; estado.pieza = h[2]; setModo("piezas"); }
  raiz.classList.add("listo");
}

const raiz = document.getElementById("v3d");
if (raiz) iniciar(raiz).catch((e) => fallo(raiz, e));
