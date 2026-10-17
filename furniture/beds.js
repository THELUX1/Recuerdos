// furniture/beds.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

export function createBedBasic(color) {
  const g = new THREE.Group();
  const woodMat  = mat(color ?? 0x6b4a2f, 0.85);
  const sheetMat = mat(0xdfe8f5, 0.9);
  const pillowMat = mat(0xffffff, 0.9);

  const W = 1.0, D = 1.9, baseH = 0.25;
  g.add(box(W, baseH, D, woodMat, 0, baseH / 2, 0));
  const matH = 0.18;
  g.add(box(W - 0.05, matH, D - 0.05, sheetMat, 0, baseH + matH / 2, 0));
  g.add(box(W, 0.5, 0.08, woodMat, 0, 0.25, -D / 2 + 0.04));

  const pillow = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.12, 0.35), pillowMat);
  pillow.position.set(0, baseH + matH + 0.06, -D / 2 + 0.3);
  pillow.castShadow = true; pillow.receiveShadow = true;
  g.add(pillow);
  return g;
}

export function createBedDouble(color) {
  const g = new THREE.Group();
  const woodMat  = mat(color ?? 0x7a5a3a, 0.85);
  const sheetMat = mat(0xf0f4fa, 0.9);
  const pillowMat = mat(0xffffff, 0.9);
  const blanketMat = mat(0x88a8d0, 0.9);

  const W = 1.6, D = 2.1, baseH = 0.28;
  g.add(box(W, baseH, D, woodMat, 0, baseH / 2, 0));

  const matH = 0.22;
  g.add(box(W - 0.06, matH, D - 0.06, sheetMat, 0, baseH + matH / 2, 0));
  g.add(box(W - 0.1, 0.06, 0.6, blanketMat, 0, baseH + matH + 0.03, D / 2 - 0.4));
  g.add(box(W, 0.85, 0.1, woodMat, 0, 0.42, -D / 2 + 0.05));

  const pillowGeo = new THREE.BoxGeometry(0.6, 0.14, 0.4);
  for (const dx of [-0.4, 0.4]) {
    const p = new THREE.Mesh(pillowGeo, pillowMat);
    p.position.set(dx, baseH + matH + 0.07, -D / 2 + 0.35);
    p.castShadow = true; p.receiveShadow = true;
    g.add(p);
  }
  return g;
}

export function createBedPremium(color) {
  const g = new THREE.Group();
  const woodMat    = mat(color ?? 0x4a2a6a, 0.7);
  const sheetMat   = mat(0xf8f4ff, 0.6);
  const pillowMat  = mat(0xffffff, 0.7);
  const canopyMat  = mat(0x8a4a9a, 0.75);

  const W = 1.8, D = 2.2, baseH = 0.35;
  g.add(box(W, baseH, D, woodMat, 0, baseH / 2, 0));

  const matH = 0.28;
  g.add(box(W - 0.06, matH, D - 0.06, sheetMat, 0, baseH + matH / 2, 0));
  g.add(box(W, 1.1, 0.15, woodMat, 0, 0.55, -D / 2 + 0.075));
  g.add(box(W + 0.2, 0.15, 0.25, woodMat, 0, 1.15, -D / 2 + 0.12));

  const postH = 2.4, postR = 0.06;
  for (const [dx, dz] of [
    [ W/2 - postR, -D/2 + postR],
    [ W/2 - postR,  D/2 - postR],
    [-W/2 + postR, -D/2 + postR],
    [-W/2 + postR,  D/2 - postR],
  ]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, postH, 10), woodMat);
    post.position.set(dx, postH / 2, dz);
    post.castShadow = true;
    g.add(post);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.1, 0.08, D + 0.1), canopyMat);
  top.position.y = postH;
  top.castShadow = true;
  g.add(top);

  const curtainMat = new THREE.MeshStandardMaterial({
    color: 0xc8a0d8, roughness: 0.9, transparent: true, opacity: 0.55,
  });
  const side1 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, postH - 0.2), curtainMat);
  side1.position.set(W/2 + 0.03, postH/2, 0);
  side1.rotation.y = Math.PI / 2;
  g.add(side1);

  const side2 = new THREE.Mesh(new THREE.PlaneGeometry(0.5, postH - 0.2), curtainMat);
  side2.position.set(-W/2 - 0.03, postH/2, 0);
  side2.rotation.y = -Math.PI / 2;
  g.add(side2);

  const pGeo = new THREE.BoxGeometry(0.75, 0.16, 0.45);
  for (const dx of [-0.45, 0.45]) {
    const p = new THREE.Mesh(pGeo, pillowMat);
    p.position.set(dx, baseH + matH + 0.08, -D / 2 + 0.4);
    p.castShadow = true; p.receiveShadow = true;
    g.add(p);
  }
  return g;
}

export function createBedKing(color) {
  const g = new THREE.Group();
  const woodMat   = mat(color ?? 0x2a1a3a, 0.65);
  const goldMat   = mat(0xd8b040, 0.3, 0.7);
  const sheetMat  = mat(0xfdfaf2, 0.6);
  const pillowMat = mat(0xffffff, 0.7);
  const blanketMat = mat(0x4a2a6a, 0.7);

  const W = 2.1, D = 2.3, baseH = 0.4;
  g.add(box(W, baseH, D, woodMat, 0, baseH / 2, 0));

  const matH = 0.3;
  g.add(box(W - 0.06, matH, D - 0.06, sheetMat, 0, baseH + matH / 2, 0));
  g.add(box(W - 0.1, 0.08, 0.7, blanketMat, 0, baseH + matH + 0.04, D / 2 - 0.45));
  g.add(box(W, 1.3, 0.18, woodMat, 0, 0.65, -D / 2 + 0.09));
  g.add(box(W + 0.3, 0.18, 0.3, goldMat, 0, 1.35, -D / 2 + 0.15));
  g.add(box(W + 0.3, 0.18, 0.3, goldMat, 0, 0.05, -D / 2 + 0.15));

  const postH = 2.8, postR = 0.07;
  for (const [dx, dz] of [
    [ W/2 - postR, -D/2 + postR],
    [ W/2 - postR,  D/2 - postR],
    [-W/2 + postR, -D/2 + postR],
    [-W/2 + postR,  D/2 - postR],
  ]) {
    const post = new THREE.Mesh(new THREE.CylinderGeometry(postR, postR, postH, 12), woodMat);
    post.position.set(dx, postH / 2, dz);
    post.castShadow = true;
    g.add(post);

    const cupola = new THREE.Mesh(new THREE.SphereGeometry(postR * 1.6, 12, 10), goldMat);
    cupola.position.set(dx, postH, dz);
    cupola.castShadow = true;
    g.add(cupola);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(W + 0.2, 0.12, D + 0.2), woodMat);
  top.position.y = postH;
  top.castShadow = true;
  g.add(top);

  for (const dz of [-D/2 + 0.15, D/2 - 0.15]) {
    const rail = new THREE.Mesh(new THREE.BoxGeometry(W, 0.08, 0.08), goldMat);
    rail.position.set(0, 1.7, dz);
    g.add(rail);
  }

  const pBig = new THREE.BoxGeometry(0.85, 0.18, 0.5);
  for (const dx of [-0.5, 0.5]) {
    const p = new THREE.Mesh(pBig, pillowMat);
    p.position.set(dx, baseH + matH + 0.09, -D / 2 + 0.4);
    p.castShadow = true; p.receiveShadow = true;
    g.add(p);
  }
  const pSmall = new THREE.BoxGeometry(0.4, 0.14, 0.3);
  for (const dx of [-0.5, 0.5]) {
    const p = new THREE.Mesh(pSmall, pillowMat);
    p.position.set(dx, baseH + matH + 0.09, -D / 2 + 0.7);
    p.castShadow = true; p.receiveShadow = true;
    g.add(p);
  }
  return g;
}