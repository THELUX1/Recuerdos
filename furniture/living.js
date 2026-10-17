// furniture/living.js
import * as THREE from 'three';
import { mat } from './_helpers.js';

/* ============================================================
   SOFÁ DE 2 CUERPOS
   ============================================================ */
export function createSofa(color = '#6a7a8a') {
  const g = new THREE.Group();
  const mainColor = new THREE.Color(color);
  const darkColor = mainColor.clone().multiplyScalar(0.8);

  const base = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.25, 0.85), mat(mainColor));
  base.position.set(0, 0.25, 0);
  base.castShadow = true; base.receiveShadow = true;
  g.add(base);

  for (let i = 0; i < 2; i++) {
    const cushion = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.15, 0.75), mat(mainColor.clone().multiplyScalar(1.1)));
    cushion.position.set(-0.45 + i * 0.9, 0.45, 0.02);
    cushion.castShadow = true;
    g.add(cushion);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(1.8, 0.55, 0.15), mat(mainColor));
  back.position.set(0, 0.65, -0.35);
  back.castShadow = true;
  g.add(back);

  for (let i = 0; i < 2; i++) {
    const backCushion = new THREE.Mesh(new THREE.BoxGeometry(0.82, 0.4, 0.1), mat(mainColor.clone().multiplyScalar(1.15)));
    backCushion.position.set(-0.45 + i * 0.9, 0.62, -0.26);
    g.add(backCushion);
  }

  for (const side of [-1, 1]) {
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.18, 0.45, 0.85), mat(darkColor));
    arm.position.set(side * 0.9, 0.42, 0);
    arm.castShadow = true;
    g.add(arm);
  }

  for (const [x, z] of [[-0.75, -0.3], [0.75, -0.3], [-0.75, 0.3], [0.75, 0.3]]) {
    const leg = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.15, 6), mat('#4a3525'));
    leg.position.set(x, 0.075, z);
    leg.castShadow = true;
    g.add(leg);
  }

  g.userData.originAt = 'center';
  g.userData.seatHeight = 0.52;
  g.userData.interactive = 'seat';
  return g;
}

/* ============================================================
   MESA RATONA (COFFEE TABLE)
   ============================================================ */
export function createCoffeeTable(color = '#8a6a4a') {
  const g = new THREE.Group();
  const mainColor = new THREE.Color(color);

  const top = new THREE.Mesh(new THREE.BoxGeometry(1.0, 0.06, 0.6), mat(mainColor));
  top.position.set(0, 0.42, 0);
  top.castShadow = true; top.receiveShadow = true;
  g.add(top);

  const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.85, 0.05, 0.5), mat(mainColor.clone().multiplyScalar(0.85)));
  shelf.position.set(0, 0.15, 0);
  shelf.castShadow = true;
  g.add(shelf);

  for (const [x, z] of [[-0.4, -0.22], [0.4, -0.22], [-0.4, 0.22], [0.4, 0.22]]) {
    const leg = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.42, 0.06), mat(mainColor.clone().multiplyScalar(0.7)));
    leg.position.set(x, 0.21, z);
    leg.castShadow = true;
    g.add(leg);
  }

  g.userData.originAt = 'center';
  return g;
}

/* ============================================================
   ESTANTERÍA (BOOKSHELF)
   ============================================================ */
export function createBookshelf(color = '#6a4a2a') {
  const g = new THREE.Group();
  const mainColor = new THREE.Color(color);

  for (const side of [-1, 1]) {
    const sidePanel = new THREE.Mesh(new THREE.BoxGeometry(0.06, 1.8, 0.35), mat(mainColor));
    sidePanel.position.set(side * 0.42, 0.9, 0);
    sidePanel.castShadow = true; sidePanel.receiveShadow = true;
    g.add(sidePanel);
  }

  const back = new THREE.Mesh(new THREE.BoxGeometry(0.84, 1.75, 0.03), mat(mainColor.clone().multiplyScalar(0.7)));
  back.position.set(0, 0.9, -0.16);
  back.receiveShadow = true;
  g.add(back);

  for (let i = 0; i < 3; i++) {
    const shelf = new THREE.Mesh(new THREE.BoxGeometry(0.84, 0.05, 0.33), mat(mainColor.clone().multiplyScalar(0.85)));
    shelf.position.set(0, 0.25 + i * 0.55, 0);
    shelf.castShadow = true;
    g.add(shelf);
  }

  const top = new THREE.Mesh(new THREE.BoxGeometry(0.9, 0.05, 0.37), mat(mainColor));
  top.position.set(0, 1.78, 0);
  top.castShadow = true;
  g.add(top);

  const bookColors = ['#a03a3a', '#3a6aa0', '#3aa060', '#6a3aa0', '#e8b84a', '#40c8d8', '#d88a3a', '#8a5a35'];
  for (let shelfIdx = 0; shelfIdx < 3; shelfIdx++) {
    const shelfY = 0.3 + shelfIdx * 0.55;
    let xPos = -0.35;
    const numBooks = 5 + Math.floor(Math.random() * 4);

    for (let b = 0; b < numBooks && xPos < 0.35; b++) {
      const bookH = 0.22 + Math.random() * 0.12;
      const bookW = 0.04 + Math.random() * 0.03;
      const bookD = 0.22 + Math.random() * 0.04;

      const book = new THREE.Mesh(new THREE.BoxGeometry(bookW, bookH, bookD), mat(bookColors[Math.floor(Math.random() * bookColors.length)]));
      book.position.set(xPos + bookW / 2, shelfY + bookH / 2, 0);
      book.castShadow = true;
      g.add(book);
      xPos += bookW + 0.005;
    }
  }

  g.userData.originAt = 'center';
  return g;
}

/* ============================================================
   CUADRO CON URL DE IMAGEN (WALL MOUNT)
   ============================================================ */
export function createPainting(color = '#a03a3a') {
  const g = new THREE.Group();
  const frameColor = new THREE.Color(color);

  const frame = new THREE.Mesh(new THREE.BoxGeometry(0.94, 0.74, 0.06), mat(frameColor));
  frame.position.set(0, 0, 0.03);
  frame.castShadow = true;
  g.add(frame);

  const canvasMat = new THREE.MeshStandardMaterial({ color: 0xf5f5f0, roughness: 0.9 });
  const canvas = new THREE.Mesh(new THREE.BoxGeometry(0.8, 0.6, 0.02), canvasMat);
  canvas.position.set(0, 0, 0.065);
  g.add(canvas);

  const hook = new THREE.Mesh(new THREE.BoxGeometry(0.04, 0.08, 0.02), mat('#888888'));
  hook.position.set(0, 0.41, 0.02);
  g.add(hook);

  g.userData.originAt = 'back';
  g.userData.screen = canvas; 
  g.userData.paintingUrl = null;
  g.userData.interactive = 'painting';
  return g;
}

/* ============================================================
   VENTILADOR DE TECHO
   ============================================================ */
export function createCeilingFan() {
  const g = new THREE.Group();

  const mountBase = new THREE.Mesh(new THREE.CylinderGeometry(0.15, 0.15, 0.08, 16), mat('#aaaaaa'));
  mountBase.position.set(0, -0.04, 0);
  mountBase.castShadow = true;
  g.add(mountBase);

  const rod = new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 0.3, 8), mat('#d0d0d0'));
  rod.position.set(0, -0.19, 0);
  rod.castShadow = true;
  g.add(rod);

  const motor = new THREE.Mesh(new THREE.CylinderGeometry(0.18, 0.12, 0.15, 16), mat('#666666'));
  motor.position.set(0, -0.38, 0);
  motor.castShadow = true;
  g.add(motor);

  const fanBlades = new THREE.Group();
  fanBlades.position.set(0, -0.42, 0);

  for (let i = 0; i < 4; i++) {
    const angle = (i / 4) * Math.PI * 2;
    const arm = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.02, 0.4), mat('#d0d0d0'));
    arm.position.set(Math.cos(angle) * 0.2, 0, Math.sin(angle) * 0.2);
    arm.rotation.y = -angle;
    arm.castShadow = true;
    fanBlades.add(arm);

    const blade = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.015, 0.5), mat('#f0f0f0'));
    blade.position.set(Math.cos(angle) * 0.45, 0, Math.sin(angle) * 0.45);
    blade.rotation.y = -angle;
    blade.castShadow = true;
    fanBlades.add(blade);
  }

  g.add(fanBlades);

  const lightBase = new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.1, 0.04, 16), mat('#aaaaaa'));
  lightBase.position.set(0, -0.48, 0);
  lightBase.castShadow = true;
  g.add(lightBase);

  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e0,
    emissive: 0xffe4a0,
    emissiveIntensity: 2.0,
    roughness: 0.2,
  });
  const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.1, 16, 12), bulbMat);
  bulb.position.set(0, -0.55, 0);
  g.add(bulb);

  g.userData.ventilador = fanBlades;
  g.userData.originAt = 'center';
  return g;
}

/* ============================================================
   PARCHE DE PASTO (MISMO MESH EN MEDIA Y ALTA)
   - En media: estático
   - En alta: mismo mesh, pero expone grassMesh + baseMatrix para animación suave
   ============================================================ */
export function createGrassPatch(quality = 'media') {
  const g = new THREE.Group();

  const isHigh = quality === 'alta';

  // Mismo conteo y misma geometría en media y alta (el visual no cambia)
  const grassCount = 150;

  const grassGeo = new THREE.BufferGeometry();
  const vertices = new Float32Array([
    -0.1, 0, 0,    0.1, 0, 0,    0, 1, 0,
    0, 0, -0.1,    0, 0, 0.1,    0, 1, 0
  ]);
  grassGeo.setAttribute('position', new THREE.BufferAttribute(vertices, 3));
  grassGeo.computeVertexNormals();

  const grassMat = new THREE.MeshStandardMaterial({
    color: 0x4a8a3a,
    roughness: 1.0,
    side: THREE.DoubleSide,
    flatShading: true
  });

  const grassMesh = new THREE.InstancedMesh(grassGeo, grassMat, grassCount);
  grassMesh.castShadow = false;
  grassMesh.receiveShadow = true;
  grassMesh.frustumCulled = false;

  const dummy = new THREE.Object3D();
const baseMatrix = [];
const baseScale = [];   // NUEVO

for (let i = 0; i < grassCount; i++) {
  const angle = Math.random() * Math.PI * 2;
  const radius = Math.random() * 1.5;
  const x = Math.cos(angle) * radius;
  const z = Math.sin(angle) * radius;

  dummy.position.set(x, 0, z);
  dummy.rotation.set(0, Math.random() * Math.PI, (Math.random() - 0.5) * 0.2);

  const heightVar = 0.20 + Math.random() * 0.19;   // tu valor
  const widthVar = 0.7 + Math.random() * 0.6;
  dummy.scale.set(widthVar, heightVar, widthVar);

  dummy.updateMatrix();
  grassMesh.setMatrixAt(i, dummy.matrix);
  baseMatrix.push(dummy.matrix.clone());
  baseScale.push({ x: widthVar, y: heightVar, z: widthVar });   // NUEVO
}

g.add(grassMesh);

if (isHigh) {
  grassMesh.userData.baseMatrix = baseMatrix;
  grassMesh.userData.baseScale = baseScale;   // NUEVO
  g.userData.grassMesh = grassMesh;
}

  g.userData.originAt = 'center';
  return g;
}

/* ============================================================
   FLORES SUELTAS (ITEM INDEPENDIENTE DE DECORACIÓN)
   ============================================================ */
export function createFlowers(quality = 'media') {
  const g = new THREE.Group();

  const isHigh = quality === 'alta';
  const flowerCount = isHigh ? 5 : 3; // mata pequeña de flores

  const flowerColors = ['#ffffff', '#ffb3d9', '#99ccff', '#ffe680', '#ff9a9a', '#c8a0ff'];

  for (let i = 0; i < flowerCount; i++) {
    const colorHex = flowerColors[Math.floor(Math.random() * flowerColors.length)];

    const c = document.createElement('canvas');
    c.width = 64; c.height = 64;
    const ctx = c.getContext('2d');
    ctx.clearRect(0, 0, 64, 64);

    ctx.fillStyle = colorHex;
    for (let j = 0; j < 5; j++) {
      const a = (j / 5) * Math.PI * 2;
      ctx.beginPath();
      ctx.ellipse(32 + Math.cos(a) * 12, 32 + Math.sin(a) * 12, 10, 6, a, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#ffcc00';
    ctx.beginPath();
    ctx.arc(32, 32, 8, 0, Math.PI * 2);
    ctx.fill();

    const tex = new THREE.CanvasTexture(c);
    tex.colorSpace = THREE.SRGBColorSpace;

    const fMat = new THREE.MeshStandardMaterial({
      map: tex,
      transparent: true,
      alphaTest: 0.1,
      side: THREE.DoubleSide,
      roughness: 1.0
    });

    const fGeo = new THREE.PlaneGeometry(0.22, 0.22);
    fGeo.translate(0, 0.15, 0);

    const fMesh = new THREE.Mesh(fGeo, fMat);

    // Distribución en un radio chico (mata de flores)
    const angle = Math.random() * Math.PI * 2;
    const radius = Math.random() * 0.35;
    fMesh.position.set(Math.cos(angle) * radius, 0, Math.sin(angle) * radius);
    fMesh.rotation.y = Math.random() * Math.PI * 2;

    // Tallito verde debajo
    const stemGeo = new THREE.CylinderGeometry(0.01, 0.01, 0.18, 4);
    const stemMat = new THREE.MeshStandardMaterial({ color: 0x3a7a2a, roughness: 1 });
    const stem = new THREE.Mesh(stemGeo, stemMat);
    stem.position.set(fMesh.position.x, 0.09, fMesh.position.z);
    g.add(stem);

    g.add(fMesh);
  }

  g.userData.originAt = 'center';
  return g;
}