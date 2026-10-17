// furniture/chairs.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

export function createChairBasic(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x7a4f30, 0.85);
  const seatMat = mat(0xb98a5a, 0.8);
  const W = 0.48, D = 0.48, seatH = 0.06, seatY = 0.45, legH = seatY, legT = 0.06;
  g.add(box(W, seatH, D, seatMat, 0, seatY, 0));
  const backH = 0.6;
  g.add(box(W, backH, 0.06, woodMat, 0, seatY + backH / 2, -D / 2 + 0.03));
  for (const [x, z] of [
    [ W/2 - legT/2,  D/2 - legT/2],
    [ W/2 - legT/2, -D/2 + legT/2],
    [-W/2 + legT/2,  D/2 - legT/2],
    [-W/2 + legT/2, -D/2 + legT/2],
  ]) {
    g.add(box(legT, legH, legT, woodMat, x, legH / 2, z));
  }
  return g;
}

export function createChairUpholstered(color) {
  const g = new THREE.Group();
  const woodMat = mat(0x5a3a2a, 0.85);
  const fabricMat = mat(color ?? 0xb03a3a, 0.9);
  const W = 0.55, D = 0.55, seatH = 0.1, seatY = 0.46, legH = seatY, legT = 0.06;
  g.add(box(W, seatH, D, fabricMat, 0, seatY, 0));
  g.add(box(W, 0.03, D, woodMat, 0, seatY - seatH / 2 - 0.015, 0));
  const backH = 0.7;
  g.add(box(W, backH, 0.1, fabricMat, 0, seatY + backH / 2, -D / 2 + 0.05));
  g.add(box(0.06, backH, 0.06, woodMat, W/2 - 0.03, seatY + backH / 2, -D / 2 + 0.05));
  g.add(box(0.06, backH, 0.06, woodMat, -W/2 + 0.03, seatY + backH / 2, -D / 2 + 0.05));
  g.add(box(W, 0.06, 0.06, woodMat, 0, seatY + backH, -D / 2 + 0.05));
  for (const [x, z] of [
    [ W/2 - legT/2,  D/2 - legT/2],
    [ W/2 - legT/2, -D/2 + legT/2],
    [-W/2 + legT/2,  D/2 - legT/2],
    [-W/2 + legT/2, -D/2 + legT/2],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(legT/2, legT/2 * 0.7, legH, 10), woodMat);
    leg.position.set(x, legH / 2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  return g;
}

export function createChairPremium(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x2a1a3a, 0.7);
  const goldMat = mat(0xd8b040, 0.3, 0.7);
  const fabricMat = mat(0x8a2a4a, 0.85);
  const W = 0.6, D = 0.6, seatH = 0.12, seatY = 0.48, legH = seatY, legT = 0.07;
  g.add(box(W, seatH, D, fabricMat, 0, seatY, 0));
  g.add(box(W + 0.04, 0.03, D + 0.04, goldMat, 0, seatY - seatH / 2 - 0.015, 0));
  const backH = 0.95;
  g.add(box(W - 0.1, backH, 0.08, fabricMat, 0, seatY + backH / 2, -D / 2 + 0.04));
  g.add(box(0.07, backH, 0.09, woodMat, W/2 - 0.035, seatY + backH / 2, -D / 2 + 0.04));
  g.add(box(0.07, backH, 0.09, woodMat, -W/2 + 0.035, seatY + backH / 2, -D / 2 + 0.04));
  const crown = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.05, 12), goldMat);
  crown.position.set(0, seatY + backH + 0.02, -D / 2 + 0.04);
  crown.castShadow = true;
  g.add(crown);
  for (const [x, z] of [
    [ W/2 - legT/2,  D/2 - legT/2],
    [ W/2 - legT/2, -D/2 + legT/2],
    [-W/2 + legT/2,  D/2 - legT/2],
    [-W/2 + legT/2, -D/2 + legT/2],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(legT/2, legT/2 * 0.6, legH, 12), goldMat);
    leg.position.set(x, legH / 2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  return g;
}