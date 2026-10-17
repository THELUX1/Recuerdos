// furniture/tables.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

export function createTableBasic(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x8a5a35, 0.85);
  const W = 1.6, D = 0.9, topH = 0.08, H = 0.72, t = 0.08;
  g.add(box(W, topH, D, woodMat, 0, H + topH / 2, 0));
  for (const [x, z] of [
    [ W/2 - t/2,  D/2 - t/2],
    [ W/2 - t/2, -D/2 + t/2],
    [-W/2 + t/2,  D/2 - t/2],
    [-W/2 + t/2, -D/2 + t/2],
  ]) {
    g.add(box(t, H, t, woodMat, x, H / 2, z));
  }
  return g;
}

export function createTableRound(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x7a4f30, 0.85);
  const metalMat = mat(0x444444, 0.4, 0.6);
  const topR = 0.7, topH = 0.08, legH = 0.72;
  const top = new THREE.Mesh(new THREE.CylinderGeometry(topR, topR, topH, 28), woodMat);
  top.position.y = legH + topH / 2;
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);
  const ped = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, legH, 16), metalMat);
  ped.position.y = legH / 2;
  ped.castShadow = true;
  g.add(ped);
  for (const rot of [0, Math.PI / 2]) {
    const bar = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.08, 0.12), metalMat);
    bar.position.y = 0.04;
    bar.rotation.y = rot;
    bar.castShadow = true; bar.receiveShadow = true;
    g.add(bar);
  }
  return g;
}

export function createTablePremium(color) {
  const g = new THREE.Group();
  const woodMat  = mat(color ?? 0x3a2a1a, 0.8);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xa8d8e8, roughness: 0.05, metalness: 0.1,
    transparent: true, opacity: 0.55,
  });
  const goldMat = mat(0xd8b040, 0.3, 0.7);
  const W = 1.8, D = 1.0, topH = 0.06, H = 0.72, t = 0.1;
  const baseTop = new THREE.Mesh(new THREE.BoxGeometry(W, 0.06, D), woodMat);
  baseTop.position.y = H + 0.03;
  baseTop.castShadow = true; baseTop.receiveShadow = true;
  g.add(baseTop);
  const glass = new THREE.Mesh(new THREE.BoxGeometry(W - 0.1, topH, D - 0.1), glassMat);
  glass.position.y = H + 0.06 + topH / 2;
  glass.castShadow = true;
  g.add(glass);
  for (const [x, z] of [
    [ W/2 - t/2,  D/2 - t/2],
    [ W/2 - t/2, -D/2 + t/2],
    [-W/2 + t/2,  D/2 - t/2],
    [-W/2 + t/2, -D/2 + t/2],
  ]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(t/2, t/2 * 0.7, H, 12), goldMat);
    leg.position.set(x, H / 2, z);
    leg.castShadow = true;
    g.add(leg);
  }
  const ring = new THREE.Mesh(new THREE.TorusGeometry(0.35, 0.025, 8, 20), goldMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = H / 2;
  g.add(ring);
  return g;
}

export function createNightstand(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x6b4a2f, 0.85);
  const drawerMat = mat(color ?? 0x5a3a1f, 0.85);
  const handleMat = mat(0xd8b040, 0.3, 0.7);

  const W = 0.5, H = 0.55, D = 0.4;
  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  const drawer = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, H * 0.4, 0.03),
    drawerMat
  );
  drawer.position.set(0, H * 0.55, D / 2 + 0.015);
  drawer.castShadow = true;
  g.add(drawer);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.12, 8),
    handleMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, H * 0.55, D / 2 + 0.05);
  g.add(handle);

  for (const [x, z] of [
    [ W/2 - 0.04,  D/2 - 0.04],
    [ W/2 - 0.04, -D/2 + 0.04],
    [-W/2 + 0.04,  D/2 - 0.04],
    [-W/2 + 0.04, -D/2 + 0.04],
  ]) {
    g.add(box(0.05, 0.08, 0.05, woodMat, x, 0.04, z));
  }

  return g;
}