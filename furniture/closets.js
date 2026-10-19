// furniture/storage.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

export function createWardrobe(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x6b4a2f, 0.85);
  const doorMat = mat(color ?? 0x5a3a1f, 0.85);
  const handleMat = mat(0xd8b040, 0.3, 0.7);

  const W = 1.2, H = 2.0, D = 0.55;
  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  const doorW = W / 2 - 0.02;
  for (const sign of [-1, 1]) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, H - 0.1, 0.04),
      doorMat
    );
    door.position.set(sign * (doorW / 2), H / 2, D / 2 + 0.02);
    door.castShadow = true;
    door.receiveShadow = true;
    g.add(door);

    const h = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
      handleMat
    );
    h.position.set(sign * 0.06, H / 2, D / 2 + 0.06);
    g.add(h);
  }

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.1, D + 0.02),
    mat(0x3a2a1f, 0.9)
  );
  skirt.position.y = 0.05;
  g.add(skirt);

  return g;
}

export function createCupboard(color) {
  const g = new THREE.Group();
  const woodMat = mat(color ?? 0x8a5a35, 0.85);
  const doorMat = mat(color ?? 0x6a4230, 0.85);
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xc8e0f0, roughness: 0.1, metalness: 0.05,
    transparent: true, opacity: 0.4,
  });
  const handleMat = mat(0xd8b040, 0.3, 0.7);

  const W = 1.4, H = 2.2, D = 0.45;
  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  const doorW = W / 2 - 0.02;
  for (const sign of [-1, 1]) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, H - 0.1, 0.04),
      doorMat
    );
    frame.position.set(sign * (doorW / 2), H / 2, D / 2 + 0.02);
    frame.castShadow = true;
    g.add(frame);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.12, H * 0.55, 0.02),
      glassMat
    );
    glass.position.set(
      sign * (doorW / 2),
      H * 0.72,
      D / 2 + 0.05
    );
    g.add(glass);

    const h = new THREE.Mesh(
      new THREE.CylinderGeometry(0.02, 0.02, 0.15, 8),
      handleMat
    );
    h.position.set(sign * 0.06, H * 0.35, D / 2 + 0.06);
    g.add(h);
  }

  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(W - 0.1, 0.03, D - 0.08),
      woodMat
    );
    shelf.position.y = H * 0.55 + i * 0.28;
    g.add(shelf);
  }

  return g;
}