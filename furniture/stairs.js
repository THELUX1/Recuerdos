// furniture/stairs.js
import * as THREE from 'three';
import { mat } from './_helpers.js';

/*
  CONVENCIÓN DE LA ESCALERA:
  - Origen en el PISO, en el CENTRO de la base.
  - Frente (escalón más bajo, altura ~0) en +Z local.
  - Fondo (escalón más alto, altura STAIR_H) en -Z local.
  - El jugador sube caminando de +Z hacia -Z.
*/

const STAIR_H = 3.2;
const STAIR_W = 1.2;
const STAIR_L = 3.4;

export function createStairBasic(color) {
  const g = new THREE.Group();
  const woodMat  = mat(color ?? 0x8a5a35, 0.85);
  const treadMat = mat(0x9a6a45, 0.8);
  const railMat  = mat(0x5a3a1f, 0.7, 0.2);

  const steps = 12;
  const stepH = STAIR_H / steps;
  const stepL = STAIR_L / steps;

  // ---- Escalones ----
  // Cada escalón es una caja cuyo TOPE es el "piso" del escalón.
  // La cara frontal de cada caja coincide con la cara trasera del
  // escalón anterior, así no hay superposición ni Z-fighting.
  for (let i = 0; i < steps; i++) {
    const topY = stepH * (i + 1);          // altura de la huella
    const zCenter = STAIR_L / 2 - stepL * (i + 0.5);
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(STAIR_W, stepH * 0.9, stepL * 0.98),
      treadMat
    );
    tread.position.set(0, topY - stepH * 0.45, zCenter);
    tread.castShadow = true;
    tread.receiveShadow = true;
    g.add(tread);
  }

  // ---- Zancas laterales (una sola pieza diagonal) ----
  const diagLen = Math.hypot(STAIR_L, STAIR_H);
  const angle = Math.atan2(STAIR_H, STAIR_L);

  for (const side of [-1, 1]) {
    const zanca = new THREE.Mesh(
      new THREE.BoxGeometry(0.08, 0.35, diagLen),
      woodMat
    );
    zanca.position.set(
      side * (STAIR_W / 2 + 0.04),
      STAIR_H / 2 - 0.15,
      0
    );
    zanca.rotation.x = angle;
    zanca.castShadow = true;
    g.add(zanca);
  }

  // ---- Pasamanos (una sola pieza diagonal) ----
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, diagLen),
      railMat
    );
    rail.position.set(
      side * (STAIR_W / 2 + 0.04),
      STAIR_H / 2 + 0.75,
      0
    );
    rail.rotation.x = angle;
    rail.castShadow = true;
    g.add(rail);

    // Postes verticales repartidos
    for (const t of [0.03, 0.5, 0.97]) {
      const z = STAIR_L / 2 - t * STAIR_L;
      const y = t * STAIR_H + 0.375;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.02, 0.02, 0.75, 8),
        railMat
      );
      post.position.set(side * (STAIR_W / 2 + 0.04), y, z);
      post.castShadow = true;
      g.add(post);
    }
  }

  g.userData.stair = {
    width: STAIR_W,
    height: STAIR_H,
    length: STAIR_L,
    steps: steps,
    frontZ: +STAIR_L / 2,
    backZ:  -STAIR_L / 2,
  };

  return g;
}

export function createStairPremium(color) {
  const g = new THREE.Group();
  const woodMat  = mat(color ?? 0x3a2a1a, 0.75);
  const treadMat = mat(0x5a3a1f, 0.7);
  const goldMat  = mat(0xd8b040, 0.3, 0.7);
  const carpetMat = mat(0x8a2a4a, 0.9);

  const steps = 12;
  const stepH = STAIR_H / steps;
  const stepL = STAIR_L / steps;

  // ---- Escalones con alfombra ----
  for (let i = 0; i < steps; i++) {
    const topY = stepH * (i + 1);
    const zCenter = STAIR_L / 2 - stepL * (i + 0.5);

    // Huella
    const tread = new THREE.Mesh(
      new THREE.BoxGeometry(STAIR_W, stepH * 0.9, stepL * 0.98),
      treadMat
    );
    tread.position.set(0, topY - stepH * 0.45, zCenter);
    tread.castShadow = true;
    tread.receiveShadow = true;
    g.add(tread);

    // Alfombra roja encima
    const carpet = new THREE.Mesh(
      new THREE.BoxGeometry(STAIR_W - 0.2, 0.02, stepL * 0.9),
      carpetMat
    );
    carpet.position.set(0, topY - 0.01, zCenter);
    carpet.receiveShadow = true;
    g.add(carpet);
  }

  // ---- Zancas laterales ----
  const diagLen = Math.hypot(STAIR_L, STAIR_H);
  const angle = Math.atan2(STAIR_H, STAIR_L);

  for (const side of [-1, 1]) {
    const zanca = new THREE.Mesh(
      new THREE.BoxGeometry(0.1, 0.45, diagLen),
      woodMat
    );
    zanca.position.set(
      side * (STAIR_W / 2 + 0.05),
      STAIR_H / 2 - 0.22,
      0
    );
    zanca.rotation.x = angle;
    zanca.castShadow = true;
    g.add(zanca);
  }

  // ---- Pasamanos dorados ----
  for (const side of [-1, 1]) {
    const rail = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.06, diagLen),
      goldMat
    );
    rail.position.set(
      side * (STAIR_W / 2 + 0.05),
      STAIR_H / 2 + 0.8,
      0
    );
    rail.rotation.x = angle;
    rail.castShadow = true;
    g.add(rail);

    for (const t of [0.03, 0.35, 0.65, 0.97]) {
      const z = STAIR_L / 2 - t * STAIR_L;
      const y = t * STAIR_H + 0.4;
      const post = new THREE.Mesh(
        new THREE.CylinderGeometry(0.025, 0.025, 0.8, 8),
        goldMat
      );
      post.position.set(side * (STAIR_W / 2 + 0.05), y, z);
      post.castShadow = true;
      g.add(post);
    }
  }

  g.userData.stair = {
    width: STAIR_W,
    height: STAIR_H,
    length: STAIR_L,
    steps: steps,
    frontZ: +STAIR_L / 2,
    backZ:  -STAIR_L / 2,
  };

  return g;
}