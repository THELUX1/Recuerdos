// furniture/plants.js
import * as THREE from 'three';
import { mat } from './_helpers.js';

export function createPlantPot(color) {
  const g = new THREE.Group();
  const potMat = mat(color ?? 0xb56a3a, 0.9);
  const leafMat = mat(0x3fa15c, 0.85);

  const pot = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.16, 0.35, 16), potMat);
  pot.position.y = 0.175; pot.castShadow = true; pot.receiveShadow = true;
  g.add(pot);

  for (let i = 0; i < 6; i++) {
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(0.18, 8, 6), leafMat);
    const a = (i / 6) * Math.PI * 2;
    leaf.position.set(Math.cos(a) * 0.12, 0.55 + Math.sin(i) * 0.08, Math.sin(a) * 0.12);
    leaf.scale.set(1, 1.4, 0.6);
    leaf.rotation.y = a;
    leaf.castShadow = true;
    g.add(leaf);
  }
  return g;
}

export function createBush(color) {
  const g = new THREE.Group();
  const leafMat = mat(color ?? 0x3a8a3a, 0.9);

  const puffs = 5 + Math.floor(Math.random() * 3);
  for (let i = 0; i < puffs; i++) {
    const r = 0.28 + Math.random() * 0.15;
    const geo = new THREE.SphereGeometry(r, 10, 8);
    const puff = new THREE.Mesh(geo, leafMat);
    puff.position.set(
      (Math.random() - 0.5) * 0.4,
      0.35 + Math.random() * 0.15,
      (Math.random() - 0.5) * 0.4
    );
    puff.scale.y = 0.9 + Math.random() * 0.15;
    puff.castShadow = true;
    puff.receiveShadow = true;
    g.add(puff);
  }
  return g;
}

export function createSmallTree(color) {
  const g = new THREE.Group();
  const trunkMat = mat(0x6b4a2f, 0.9);
  const leafDarkMat  = mat(color ?? 0x3a7a3a, 0.85);
  const leafLightMat = mat(0x5a9a4a, 0.85);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.10, 0.18, 1.4, 10),
    trunkMat
  );
  trunk.position.y = 0.7;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  g.add(trunk);

  for (let i = 0; i < 3; i++) {
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.05, 0.5, 6),
      trunkMat
    );
    const a = (i / 3) * Math.PI * 2 + Math.random() * 0.5;
    branch.position.set(Math.cos(a) * 0.15, 1.0 + i * 0.1, Math.sin(a) * 0.15);
    branch.rotation.z = Math.PI / 3;
    branch.rotation.y = a;
    branch.castShadow = true;
    g.add(branch);
  }

  const layers = [
    { y: 1.6, r: 0.62, dx: 0,     dz: 0 },
    { y: 1.9, r: 0.55, dx: 0.25,  dz: 0.15 },
    { y: 2.0, r: 0.52, dx: -0.25, dz: -0.15 },
    { y: 2.3, r: 0.48, dx: 0,     dz: 0 },
  ];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const leaf = new THREE.Mesh(
      new THREE.SphereGeometry(l.r, 12, 10),
      i % 2 === 0 ? leafDarkMat : leafLightMat
    );
    leaf.position.set(l.dx, l.y, l.dz);
    leaf.scale.set(1, 0.9, 1);
    leaf.castShadow = true;
    leaf.receiveShadow = true;
    g.add(leaf);
  }
  return g;
}

export function createBigTree(color) {
  const g = new THREE.Group();
  const trunkMat = mat(0x5a3a20, 0.9);
  const leafDarkMat  = mat(color ?? 0x2a5a2a, 0.85);
  const leafMidMat   = mat(0x3a7a3a, 0.85);
  const leafLightMat = mat(0x5a9a4a, 0.85);

  const trunk = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.42, 3.2, 14),
    trunkMat
  );
  trunk.position.y = 1.6;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  g.add(trunk);

  for (let i = 0; i < 4; i++) {
    const branch = new THREE.Mesh(
      new THREE.CylinderGeometry(0.06, 0.12, 1.2, 8),
      trunkMat
    );
    const a = (i / 4) * Math.PI * 2 + Math.random() * 0.4;
    branch.position.set(
      Math.cos(a) * 0.35,
      2.4 + Math.random() * 0.4,
      Math.sin(a) * 0.35
    );
    branch.rotation.z = Math.PI / 3.5;
    branch.rotation.y = a;
    branch.castShadow = true;
    g.add(branch);
  }

  const layers = [
    { y: 3.2, count: 5, r: 0.85, spread: 0.9 },
    { y: 3.9, count: 4, r: 0.75, spread: 0.8 },
    { y: 4.5, count: 3, r: 0.65, spread: 0.6 },
    { y: 5.1, count: 2, r: 0.55, spread: 0.4 },
  ];
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const leafMat = li % 3 === 0 ? leafDarkMat : (li % 3 === 1 ? leafMidMat : leafLightMat);
    for (let i = 0; i < layer.count; i++) {
      const a = (i / layer.count) * Math.PI * 2 + Math.random() * 0.4;
      const leaf = new THREE.Mesh(
        new THREE.SphereGeometry(layer.r, 14, 12),
        leafMat
      );
      leaf.position.set(
        Math.cos(a) * layer.spread,
        layer.y + Math.random() * 0.1,
        Math.sin(a) * layer.spread
      );
      leaf.scale.set(1, 0.85, 1);
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      g.add(leaf);
    }
  }

  const top = new THREE.Mesh(new THREE.SphereGeometry(0.55, 14, 12), leafLightMat);
  top.position.y = 5.6;
  top.castShadow = true;
  g.add(top);

  return g;
}
/* ============================================================
   VEGETACIÓN HD (Solo Gráficos Altos)
   ============================================================ */

export function createBigTreeHD(color) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x4a2a1a, roughness: 0.9 });
  const leafMat  = new THREE.MeshStandardMaterial({ 
    color: color ?? 0x2a5a2a, roughness: 0.8, flatShading: true 
  });

  // Tronco detallado
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.5, 3.5, 12), trunkMat);
  trunk.position.y = 1.75;
  trunk.castShadow = true;
  trunk.receiveShadow = true;
  g.add(trunk);

  // Ramas
  for (let i = 0; i < 5; i++) {
    const a = (i / 5) * Math.PI * 2;
    const branch = new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.15, 1.5, 8), trunkMat);
    branch.position.set(Math.cos(a) * 0.4, 2.8 + Math.random() * 0.5, Math.sin(a) * 0.4);
    branch.rotation.z = Math.PI / 3.5;
    branch.rotation.y = a;
    branch.castShadow = true;
    g.add(branch);
  }

  // Copa del árbol (Icosaedros para un look más orgánico)
  const layers = [
    { y: 3.5, count: 6, r: 1.0, spread: 1.2 },
    { y: 4.2, count: 5, r: 0.9, spread: 1.0 },
    { y: 4.9, count: 4, r: 0.8, spread: 0.8 },
    { y: 5.5, count: 3, r: 0.7, spread: 0.5 },
    { y: 6.1, count: 1, r: 0.6, spread: 0 }
  ];

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const a = (i / layer.count) * Math.PI * 2 + Math.random();
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(layer.r, 1), leafMat);
      leaf.position.set(
        Math.cos(a) * layer.spread,
        layer.y + (Math.random() - 0.5) * 0.3,
        Math.sin(a) * layer.spread
      );
      leaf.rotation.set(Math.random(), Math.random(), Math.random());
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      g.add(leaf);
    }
  }

  return g;
}

export function createSmallTreeHD(color) {
  const g = new THREE.Group();
  const trunkMat = new THREE.MeshStandardMaterial({ color: 0x5a3a20, roughness: 0.9 });
  const leafMat  = new THREE.MeshStandardMaterial({ 
    color: color ?? 0x3a7a3a, roughness: 0.8, flatShading: true 
  });

  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.2, 1.8, 10), trunkMat);
  trunk.position.y = 0.9;
  trunk.castShadow = true;
  g.add(trunk);

  const layers = [
    { y: 1.8, count: 4, r: 0.6, spread: 0.5 },
    { y: 2.3, count: 3, r: 0.5, spread: 0.4 },
    { y: 2.8, count: 2, r: 0.4, spread: 0.2 },
    { y: 3.2, count: 1, r: 0.3, spread: 0 }
  ];

  for (const layer of layers) {
    for (let i = 0; i < layer.count; i++) {
      const a = (i / layer.count) * Math.PI * 2 + Math.random();
      const leaf = new THREE.Mesh(new THREE.IcosahedronGeometry(layer.r, 1), leafMat);
      leaf.position.set(
        Math.cos(a) * layer.spread,
        layer.y + (Math.random() - 0.5) * 0.2,
        Math.sin(a) * layer.spread
      );
      leaf.rotation.set(Math.random(), Math.random(), Math.random());
      leaf.castShadow = true;
      leaf.receiveShadow = true;
      g.add(leaf);
    }
  }

  return g;
}

export function createBushHD(color) {
  const g = new THREE.Group();
  const leafMat = new THREE.MeshStandardMaterial({ 
    color: color ?? 0x3a8a3a, roughness: 0.9, flatShading: true 
  });

  const puffs = 7 + Math.floor(Math.random() * 4);
  for (let i = 0; i < puffs; i++) {
    const r = 0.3 + Math.random() * 0.2;
    const geo = new THREE.IcosahedronGeometry(r, 1);
    const puff = new THREE.Mesh(geo, leafMat);
    puff.position.set(
      (Math.random() - 0.5) * 0.6,
      0.3 + Math.random() * 0.3,
      (Math.random() - 0.5) * 0.6
    );
    puff.rotation.set(Math.random(), Math.random(), Math.random());
    puff.scale.y = 0.8 + Math.random() * 0.2;
    puff.castShadow = true;
    puff.receiveShadow = true;
    g.add(puff);
  }
  return g;
}