// furniture/kitchen.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

export function createGasStove(color) {
  const g = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xc8c8c8, roughness: 0.35, metalness: 0.75,
  });
  const darkMat  = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.4, metalness: 0.6,
  });
  const burnerMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a, roughness: 0.5, metalness: 0.5,
  });
  const grateMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a, roughness: 0.6, metalness: 0.7,
  });
  const flameMat = new THREE.MeshStandardMaterial({
    color: 0xff6622,
    emissive: 0xff4400,
    emissiveIntensity: 1.2,
    roughness: 0.5,
    transparent: true,
    opacity: 0.9,
  });

  const W = 0.65, H = 0.88, D = 0.6;
  g.add(box(W, H, D, steelMat, 0, H / 2, 0));

  const panelMat = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0, roughness: 0.3, metalness: 0.85,
  });
  const panel = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.04, H - 0.1, 0.02),
    panelMat
  );
  panel.position.set(0, H / 2, D / 2 + 0.01);
  panel.castShadow = true;
  g.add(panel);

  const ovenH = H * 0.35;
  const ovenY = H * 0.30;
  const ovenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.12, ovenH, 0.03),
    darkMat
  );
  ovenFrame.position.set(0, ovenY, D / 2 + 0.03);
  ovenFrame.castShadow = true;
  g.add(ovenFrame);

  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x111111, roughness: 0.05, metalness: 0.3,
    transparent: true, opacity: 0.85,
  });
  const ovenGlass = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.2, ovenH - 0.08, 0.02),
    glassMat
  );
  ovenGlass.position.set(0, ovenY, D / 2 + 0.05);
  g.add(ovenGlass);

  const ovenLight = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.25, ovenH - 0.15),
    new THREE.MeshBasicMaterial({ color: 0xff8833, transparent: true, opacity: 0.35 })
  );
  ovenLight.position.set(0, ovenY, D / 2 + 0.04);
  g.add(ovenLight);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, W - 0.2, 10),
    steelMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, ovenY + ovenH / 2 + 0.05, D / 2 + 0.07);
  handle.castShadow = true;
  g.add(handle);

  for (const dx of [-W/2 + 0.14, W/2 - 0.14]) {
    const soporte = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.06, 8),
      steelMat
    );
    soporte.rotation.x = Math.PI / 2;
    soporte.position.set(dx, ovenY + ovenH / 2 + 0.05, D / 2 + 0.04);
    g.add(soporte);
  }

  const knobY = H * 0.62;
  for (let i = 0; i < 4; i++) {
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.028, 0.03, 14),
      steelMat
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.22 + i * 0.15, knobY, D / 2 + 0.04);
    knob.castShadow = true;
    g.add(knob);

    const dot = new THREE.Mesh(
      new THREE.BoxGeometry(0.005, 0.02, 0.005),
      new THREE.MeshStandardMaterial({ color: 0x000000 })
    );
    dot.position.set(-0.22 + i * 0.15, knobY + 0.015, D / 2 + 0.058);
    g.add(dot);
  }

  const cooktopY = H + 0.02;
  const cooktop = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.04, D + 0.02),
    darkMat
  );
  cooktop.position.set(0, cooktopY, 0);
  cooktop.castShadow = true;
  cooktop.receiveShadow = true;
  g.add(cooktop);

  const burnersPos = [
    [-0.19, -0.16], [0.19, -0.16],
    [-0.19,  0.16], [0.19,  0.16],
  ];
  for (const [x, z] of burnersPos) {
    const base = new THREE.Mesh(
      new THREE.CylinderGeometry(0.07, 0.07, 0.015, 20),
      burnerMat
    );
    base.position.set(x, cooktopY + 0.025, z);
    g.add(base);

    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(0.055, 0.008, 8, 20),
      burnerMat
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(x, cooktopY + 0.035, z);
    g.add(ring);

    for (let i = 0; i < 4; i++) {
      const a = (i / 4) * Math.PI * 2;
      const pata = new THREE.Mesh(
        new THREE.BoxGeometry(0.012, 0.012, 0.06),
        grateMat
      );
      pata.position.set(
        x + Math.cos(a) * 0.035,
        cooktopY + 0.045,
        z + Math.sin(a) * 0.035
      );
      pata.rotation.y = a;
      g.add(pata);
    }

    const flame = new THREE.Mesh(
      new THREE.ConeGeometry(0.05, 0.07, 12),
      flameMat
    );
    flame.position.set(x, cooktopY + 0.09, z);
    g.add(flame);

    const pLight = new THREE.PointLight(0xff5522, 0.3, 0.5);
    pLight.position.set(x, cooktopY + 0.1, z);
    g.add(pLight);
  }

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.05, D + 0.02),
    darkMat
  );
  skirt.position.y = 0.025;
  g.add(skirt);

  return g;
}

export function createElectricStove(color) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xf5f5f5, roughness: 0.35, metalness: 0.6,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.3, metalness: 0.7,
  });
  const glassTopMat = new THREE.MeshStandardMaterial({
    color: 0x050505, roughness: 0.05, metalness: 0.9,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8, roughness: 0.3, metalness: 0.85,
  });
  const redGlowMat = new THREE.MeshStandardMaterial({
    color: 0xff2200, emissive: 0xff3300, emissiveIntensity: 1.0,
    roughness: 0.4, transparent: true, opacity: 0.85,
  });
  const blueDisplayMat = new THREE.MeshStandardMaterial({
    color: 0x001122, emissive: 0x00aaff, emissiveIntensity: 0.9,
  });

  const W = 0.65, H = 0.9, D = 0.6;
  g.add(box(W, H, D, bodyMat, 0, H / 2, 0));

  const ovenH = H * 0.36;
  const ovenY = H * 0.30;
  const ovenFrame = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.1, ovenH, 0.03),
    darkMat
  );
  ovenFrame.position.set(0, ovenY, D / 2 + 0.02);
  ovenFrame.castShadow = true;
  g.add(ovenFrame);

  const ovenGlass = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.2, ovenH - 0.08, 0.02),
    glassTopMat
  );
  ovenGlass.position.set(0, ovenY, D / 2 + 0.04);
  g.add(ovenGlass);

  const ovenLight = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.24, ovenH - 0.14),
    new THREE.MeshBasicMaterial({ color: 0xff6622, transparent: true, opacity: 0.25 })
  );
  ovenLight.position.set(0, ovenY, D / 2 + 0.05);
  g.add(ovenLight);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, W - 0.18, 10),
    steelMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, ovenY + ovenH / 2 + 0.05, D / 2 + 0.06);
  handle.castShadow = true;
  g.add(handle);

  for (const dx of [-W/2 + 0.13, W/2 - 0.13]) {
    const soporte = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.05, 8),
      steelMat
    );
    soporte.rotation.x = Math.PI / 2;
    soporte.position.set(dx, ovenY + ovenH / 2 + 0.05, D / 2 + 0.035);
    g.add(soporte);
  }

  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(0.22, 0.06),
    blueDisplayMat
  );
  display.position.set(0, H * 0.62, D / 2 + 0.035);
  g.add(display);

  for (let i = 0; i < 4; i++) {
    const btn = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.05, 0.008),
      new THREE.MeshStandardMaterial({
        color: 0x222222, roughness: 0.4, metalness: 0.5,
      })
    );
    btn.position.set(-0.15 + i * 0.1, H * 0.55, D / 2 + 0.032);
    g.add(btn);
  }

  const cooktopY = H + 0.015;
  const cooktop = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.03, D + 0.02),
    glassTopMat
  );
  cooktop.position.set(0, cooktopY, 0);
  cooktop.castShadow = true;
  cooktop.receiveShadow = true;
  g.add(cooktop);

  const zones = [
    { x: -0.19, z: -0.16, r: 0.09 },
    { x:  0.19, z: -0.16, r: 0.07 },
    { x: -0.19, z:  0.16, r: 0.07 },
    { x:  0.19, z:  0.16, r: 0.09 },
  ];
  for (const z of zones) {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(z.r, 0.005, 8, 24),
      new THREE.MeshStandardMaterial({
        color: 0x3a3a3a, roughness: 0.4, metalness: 0.7,
      })
    );
    ring.rotation.x = Math.PI / 2;
    ring.position.set(z.x, cooktopY + 0.017, z.z);
    g.add(ring);

    const glow = new THREE.Mesh(
      new THREE.CylinderGeometry(z.r - 0.01, z.r - 0.01, 0.005, 24),
      redGlowMat
    );
    glow.position.set(z.x, cooktopY + 0.018, z.z);
    g.add(glow);

    const pLight = new THREE.PointLight(0xff3300, 0.4, 0.6);
    pLight.position.set(z.x, cooktopY + 0.05, z.z);
    g.add(pLight);
  }

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.05, D + 0.02),
    darkMat
  );
  skirt.position.y = 0.025;
  g.add(skirt);

  return g;
}

/* ---------- Bajo mesada con pileta y grifo ---------- */
export function createUnderSinkCabinet(color) {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xb8b8b8, roughness: 0.6, metalness: 0.2,
  });
  const counterMat = new THREE.MeshStandardMaterial({
    color: 0xe8e8e8, roughness: 0.3, metalness: 0.4,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xd8d8d8, roughness: 0.25, metalness: 0.85,
  });
  const darkSteelMat = new THREE.MeshStandardMaterial({
    color: 0x505050, roughness: 0.4, metalness: 0.9,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xd8b040, roughness: 0.3, metalness: 0.7,
  });

  const W = 1.2, H = 0.85, D = 0.6;
  const counterT = 0.05;
  const counterY = H + counterT / 2;

  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  const sinkW = 0.42, sinkD = 0.35;
  const sinkCenters = [-0.28, 0.28];

  const counterLeft = new THREE.Mesh(
    new THREE.BoxGeometry(sinkCenters[0] - sinkW / 2 - (-W / 2), counterT, D + 0.04),
    counterMat
  );
  counterLeft.position.set(
    (-W / 2 + sinkCenters[0] - sinkW / 2) / 2,
    counterY,
    0
  );
  counterLeft.castShadow = true;
  counterLeft.receiveShadow = true;
  g.add(counterLeft);

  const counterMid = new THREE.Mesh(
    new THREE.BoxGeometry(
      (sinkCenters[1] - sinkW / 2) - (sinkCenters[0] + sinkW / 2),
      counterT,
      D + 0.04
    ),
    counterMat
  );
  counterMid.position.set(
    ((sinkCenters[0] + sinkW / 2) + (sinkCenters[1] - sinkW / 2)) / 2,
    counterY,
    0
  );
  counterMid.castShadow = true;
  counterMid.receiveShadow = true;
  g.add(counterMid);

  const counterRight = new THREE.Mesh(
    new THREE.BoxGeometry(
      (W / 2) - (sinkCenters[1] + sinkW / 2),
      counterT,
      D + 0.04
    ),
    counterMat
  );
  counterRight.position.set(
    ((sinkCenters[1] + sinkW / 2) + W / 2) / 2,
    counterY,
    0
  );
  counterRight.castShadow = true;
  counterRight.receiveShadow = true;
  g.add(counterRight);

  for (const side of [-1, 1]) {
    const franja = new THREE.Mesh(
      new THREE.BoxGeometry(W, counterT, (D + 0.04 - sinkD) / 2),
      counterMat
    );
    franja.position.set(
      0,
      counterY,
      side * (sinkD / 2 + (D + 0.04 - sinkD) / 4)
    );
    franja.castShadow = true;
    franja.receiveShadow = true;
    g.add(franja);
  }

  const doorW = W / 2 - 0.03;
  for (const sign of [-1, 1]) {
    const door = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, H - 0.14, 0.03),
      woodMat
    );
    door.position.set(sign * (doorW / 2), H / 2, D / 2 + 0.015);
    door.castShadow = true;
    g.add(door);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.014, 0.014, 0.15, 8),
      handleMat
    );
    handle.rotation.x = Math.PI / 2;
    handle.position.set(sign * 0.06, H / 2 + 0.15, D / 2 + 0.05);
    g.add(handle);
  }

  const sinkDepth = 0.18;
  const sinkY = counterY;

  for (const dx of sinkCenters) {
    const bottom = new THREE.Mesh(
      new THREE.BoxGeometry(sinkW, 0.02, sinkD),
      steelMat
    );
    bottom.position.set(dx, sinkY - sinkDepth + 0.01, 0);
    bottom.receiveShadow = true;
    g.add(bottom);

    const wallT = 0.02;
    const wallFront = new THREE.Mesh(
      new THREE.BoxGeometry(sinkW, sinkDepth, wallT),
      steelMat
    );
    wallFront.position.set(dx, sinkY - sinkDepth / 2, sinkD / 2 - wallT / 2);
    g.add(wallFront);

    const wallBack = new THREE.Mesh(
      new THREE.BoxGeometry(sinkW, sinkDepth, wallT),
      steelMat
    );
    wallBack.position.set(dx, sinkY - sinkDepth / 2, -sinkD / 2 + wallT / 2);
    g.add(wallBack);

    const wallLeft = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, sinkDepth, sinkD),
      steelMat
    );
    wallLeft.position.set(dx - sinkW / 2 + wallT / 2, sinkY - sinkDepth / 2, 0);
    g.add(wallLeft);

    const wallRight = new THREE.Mesh(
      new THREE.BoxGeometry(wallT, sinkDepth, sinkD),
      steelMat
    );
    wallRight.position.set(dx + sinkW / 2 - wallT / 2, sinkY - sinkDepth / 2, 0);
    g.add(wallRight);

    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.03, 0.03, 0.012, 16),
      darkSteelMat
    );
    drain.position.set(dx, sinkY - sinkDepth + 0.025, 0);
    g.add(drain);

    for (const rot of [0, Math.PI / 2]) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.05, 0.004, 0.008),
        darkSteelMat
      );
      bar.position.set(dx, sinkY - sinkDepth + 0.032, 0);
      bar.rotation.y = rot;
      g.add(bar);
    }
  }

  const grifoX = 0;
  const grifoZ = -D / 2 + 0.15;
  const grifoBaseY = counterY + 0.02;

  const fBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.04, 0.03, 14),
    steelMat
  );
  fBase.position.set(grifoX, grifoBaseY + 0.015, grifoZ);
  g.add(fBase);

  const fPoleH = 0.28;
  const fPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, fPoleH, 12),
    steelMat
  );
  fPole.position.set(grifoX, grifoBaseY + 0.03 + fPoleH / 2, grifoZ);
  g.add(fPole);

  const fTopY = grifoBaseY + 0.03 + fPoleH;

  const elbow = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.018, 10, 18, Math.PI / 2),
    steelMat
  );
  elbow.rotation.y = Math.PI / 2;
  elbow.rotation.x = Math.PI / 2;
  elbow.position.set(grifoX, fTopY, grifoZ + 0.08);
  g.add(elbow);

  const fDownH = 0.1;
  const fDown = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, fDownH, 12),
    steelMat
  );
  fDown.position.set(grifoX, fTopY - fDownH / 2, grifoZ + 0.16);
  g.add(fDown);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.016, 0.03, 12),
    steelMat
  );
  nozzle.position.set(grifoX, fTopY - fDownH - 0.015, grifoZ + 0.16);
  g.add(nozzle);

  const handleBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.04, 10),
    steelMat
  );
  handleBase.position.set(grifoX + 0.06, grifoBaseY + 0.04, grifoZ);
  g.add(handleBase);

  const handleLever = new THREE.Mesh(
    new THREE.BoxGeometry(0.12, 0.02, 0.02),
    steelMat
  );
  handleLever.position.set(grifoX + 0.12, grifoBaseY + 0.05, grifoZ);
  g.add(handleLever);

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.08, D + 0.02),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })
  );
  skirt.position.y = 0.04;
  g.add(skirt);

  return g;
}

/* ---------- Alacena aérea ----------
   IMPORTANTE: el origen del grupo está en la CARA TRASERA
   (que va contra el muro). El cuerpo crece hacia +Z.
*/
export function createUpperCabinet(color) {
  const g = new THREE.Group();
  const woodMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xb8b8b8, roughness: 0.6, metalness: 0.15,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xc8e0f0, roughness: 0.1, metalness: 0.05,
    transparent: true, opacity: 0.35,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xd8b040, roughness: 0.3, metalness: 0.7,
  });

  const W = 1.2, H = 0.7, D = 0.35;

  // Cuerpo: centro en z = D/2 → la cara trasera queda en z=0 (origen)
  g.add(box(W, H, D, woodMat, 0, H / 2, D / 2));

  for (let i = 1; i < 3; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.05),
      woodMat
    );
    shelf.position.set(0, (H / 3) * i, D / 2);
    g.add(shelf);
  }

  const doorW = W / 2 - 0.02;
  const doorZ = D + 0.015;
  for (const sign of [-1, 1]) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, H - 0.08, 0.03),
      woodMat
    );
    frame.position.set(sign * (doorW / 2), H / 2, doorZ);
    frame.castShadow = true;
    g.add(frame);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.08, H - 0.16, 0.02),
      glassMat
    );
    glass.position.set(sign * (doorW / 2), H / 2, doorZ + 0.02);
    g.add(glass);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8),
      handleMat
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(sign * 0.06, H * 0.25, doorZ + 0.045);
    g.add(handle);
  }

  g.userData.originAt = 'back';
  g.userData.wallMount = true;
  g.userData.wallHeight = 1.65;

  return g;
}

export function createDishwasher(color) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xe8e8e8, roughness: 0.35, metalness: 0.5,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8, roughness: 0.3, metalness: 0.85,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x222222, roughness: 0.5, metalness: 0.4,
  });
  const displayMat = new THREE.MeshStandardMaterial({
    color: 0x001122, emissive: 0x00aaff, emissiveIntensity: 0.9,
  });

  const W = 0.6, H = 0.85, D = 0.6;

  g.add(box(W, H, D, bodyMat, 0, H / 2, 0));

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, H - 0.14, 0.02),
    steelMat
  );
  door.position.set(0, H / 2, D / 2 + 0.01);
  door.castShadow = true;
  g.add(door);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, W - 0.15, 10),
    steelMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, H - 0.12, D / 2 + 0.06);
  handle.castShadow = true;
  g.add(handle);

  const controlPanel = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, 0.08, 0.02),
    darkMat
  );
  controlPanel.position.set(0, H - 0.2, D / 2 + 0.02);
  g.add(controlPanel);

  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(0.15, 0.04),
    displayMat
  );
  display.position.set(0, H - 0.2, D / 2 + 0.035);
  g.add(display);

  for (let i = 0; i < 3; i++) {
    const btn = new THREE.Mesh(
      new THREE.BoxGeometry(0.05, 0.04, 0.008),
      new THREE.MeshStandardMaterial({ color: 0x555555, roughness: 0.4 })
    );
    btn.position.set(-0.15 + i * 0.07, H - 0.2, D / 2 + 0.035);
    g.add(btn);
  }

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.08, D + 0.02),
    darkMat
  );
  skirt.position.y = 0.04;
  g.add(skirt);

  return g;
}

export function createBuiltInOven(color) {
  const g = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xc8c8c8, roughness: 0.3, metalness: 0.8,
  });
  const darkMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.4, metalness: 0.5,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0x0a0a0a, roughness: 0.05, metalness: 0.3,
    transparent: true, opacity: 0.85,
  });
  const innerLightMat = new THREE.MeshBasicMaterial({
    color: 0xff8833, transparent: true, opacity: 0.35,
  });
  const displayMat = new THREE.MeshStandardMaterial({
    color: 0x001122, emissive: 0x00aaff, emissiveIntensity: 0.9,
  });

  const W = 0.6, H = 0.6, D = 0.55;

  g.add(box(W, H, D, steelMat, 0, H / 2, 0));

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.1, H - 0.22, 0.02),
    glassMat
  );
  glass.position.set(0, H * 0.42, D / 2 + 0.02);
  g.add(glass);

  const lightInner = new THREE.Mesh(
    new THREE.PlaneGeometry(W - 0.15, H - 0.28),
    innerLightMat
  );
  lightInner.position.set(0, H * 0.42, D / 2 + 0.035);
  g.add(lightInner);

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, H - 0.18, 0.03),
    darkMat
  );
  frame.position.set(0, H * 0.42, D / 2 + 0.005);
  g.add(frame);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.016, 0.016, W - 0.15, 10),
    steelMat
  );
  handle.rotation.z = Math.PI / 2;
  handle.position.set(0, H * 0.75, D / 2 + 0.07);
  handle.castShadow = true;
  g.add(handle);

  for (let i = 0; i < 3; i++) {
    const knob = new THREE.Mesh(
      new THREE.CylinderGeometry(0.025, 0.025, 0.03, 14),
      steelMat
    );
    knob.rotation.x = Math.PI / 2;
    knob.position.set(-0.15 + i * 0.15, H * 0.92, D / 2 + 0.04);
    g.add(knob);
  }

  const display = new THREE.Mesh(
    new THREE.PlaneGeometry(0.14, 0.035),
    displayMat
  );
  display.position.set(0, H * 0.92, D / 2 + 0.04);
  g.add(display);

  return g;
}

export function createElectricKettle(color) {
  const g = new THREE.Group();
  const bodyMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xdddddd, roughness: 0.3, metalness: 0.7,
  });
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xb8b8b8, roughness: 0.25, metalness: 0.85,
  });
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.5, metalness: 0.4,
  });
  const indicatorMat = new THREE.MeshStandardMaterial({
    color: 0xaa2222, emissive: 0xff2222, emissiveIntensity: 1.0,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.12, 0.03, 20),
    blackMat
  );
  base.position.y = 0.015;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const body = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.095, 0.2, 20),
    bodyMat
  );
  body.position.y = 0.13;
  body.castShadow = true;
  g.add(body);

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.088, 0.088, 0.015, 20),
    blackMat
  );
  lid.position.y = 0.235;
  g.add(lid);

  const knob = new THREE.Mesh(
    new THREE.SphereGeometry(0.02, 10, 8),
    blackMat
  );
  knob.position.y = 0.255;
  g.add(knob);

  const spout = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.03, 0.1, 12),
    steelMat
  );
  spout.position.set(0.09, 0.20, 0);
  spout.rotation.z = -Math.PI / 3;
  g.add(spout);

  const handle = new THREE.Mesh(
    new THREE.TorusGeometry(0.08, 0.015, 8, 16, Math.PI),
    blackMat
  );
  handle.position.set(-0.09, 0.14, 0);
  handle.rotation.y = Math.PI / 2;
  handle.rotation.z = Math.PI / 2;
  g.add(handle);

  const led = new THREE.Mesh(
    new THREE.SphereGeometry(0.012, 8, 6),
    indicatorMat
  );
  led.position.set(0.05, 0.05, 0.09);
  g.add(led);

  return g;
}

export function createBlender(color) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: color ?? 0xdddddd, roughness: 0.3, metalness: 0.6,
  });
  const jarMat = new THREE.MeshStandardMaterial({
    color: 0xc8e0f0, roughness: 0.05, metalness: 0.05,
    transparent: true, opacity: 0.45,
  });
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.5, metalness: 0.4,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0x333333, roughness: 0.6, metalness: 0.2,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.11, 0.13, 0.15, 20),
    baseMat
  );
  base.position.y = 0.075;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const detail = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.04, 0.01),
    blackMat
  );
  detail.position.set(0, 0.08, 0.13);
  g.add(detail);

  const knob = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.02, 12),
    blackMat
  );
  knob.rotation.x = Math.PI / 2;
  knob.position.set(0.08, 0.08, 0.13);
  g.add(knob);

  const jar = new THREE.Mesh(
    new THREE.CylinderGeometry(0.075, 0.085, 0.28, 20, 1, true),
    jarMat
  );
  jar.position.y = 0.28;
  g.add(jar);

  const jarBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.085, 0.085, 0.015, 20),
    blackMat
  );
  jarBase.position.y = 0.145;
  g.add(jarBase);

  for (let i = 0; i < 4; i++) {
    const blade = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.002, 0.01),
      new THREE.MeshStandardMaterial({ color: 0xd8d8d8, metalness: 0.9, roughness: 0.2 })
    );
    const a = (i / 4) * Math.PI * 2;
    blade.position.set(Math.cos(a) * 0.03, 0.2, Math.sin(a) * 0.03);
    blade.rotation.y = a;
    g.add(blade);
  }

  const lid = new THREE.Mesh(
    new THREE.CylinderGeometry(0.078, 0.078, 0.02, 20),
    lidMat
  );
  lid.position.y = 0.43;
  g.add(lid);

  const lidTop = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.04, 0.03, 20),
    blackMat
  );
  lidTop.position.y = 0.455;
  g.add(lidTop);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.22, 10),
    blackMat
  );
  handle.position.set(0.1, 0.3, 0);
  g.add(handle);

  const connectorTop = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.015, 0.03),
    blackMat
  );
  connectorTop.position.set(0.07, 0.4, 0);
  g.add(connectorTop);

  const connectorBot = new THREE.Mesh(
    new THREE.BoxGeometry(0.06, 0.015, 0.03),
    blackMat
  );
  connectorBot.position.set(0.07, 0.2, 0);
  g.add(connectorBot);

  return g;
}

export function createPots() {
  const g = new THREE.Group();
  const steelMat = new THREE.MeshStandardMaterial({
    color: 0xc8c8c8, roughness: 0.3, metalness: 0.85,
  });
  const lidMat = new THREE.MeshStandardMaterial({
    color: 0xdddddd, roughness: 0.25, metalness: 0.9,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.6, metalness: 0.2,
  });

  const sizes = [
    { r: 0.09, h: 0.1, x: -0.22 },
    { r: 0.11, h: 0.13, x: 0 },
    { r: 0.13, h: 0.16, x: 0.25 },
  ];

  for (const s of sizes) {
    const pot = new THREE.Mesh(
      new THREE.CylinderGeometry(s.r, s.r * 0.95, s.h, 20),
      steelMat
    );
    pot.position.set(s.x, s.h / 2, 0);
    pot.castShadow = true;
    pot.receiveShadow = true;
    g.add(pot);

    const lid = new THREE.Mesh(
      new THREE.CylinderGeometry(s.r, s.r, 0.015, 20),
      lidMat
    );
    lid.position.set(s.x, s.h + 0.01, 0);
    g.add(lid);

    const lidKnob = new THREE.Mesh(
      new THREE.SphereGeometry(0.018, 10, 8),
      handleMat
    );
    lidKnob.position.set(s.x, s.h + 0.03, 0);
    g.add(lidKnob);

    const handle = new THREE.Mesh(
      new THREE.BoxGeometry(0.06, 0.02, 0.02),
      handleMat
    );
    handle.position.set(s.x + s.r + 0.03, s.h * 0.55, 0);
    g.add(handle);
  }

  return g;
}

export function createPan() {
  const g = new THREE.Group();
  const panMat = new THREE.MeshStandardMaterial({
    color: 0x2a2a2a, roughness: 0.5, metalness: 0.6,
  });
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.6, metalness: 0.2,
  });

  const panBody = new THREE.Mesh(
    new THREE.CylinderGeometry(0.16, 0.14, 0.05, 24),
    panMat
  );
  panBody.position.y = 0.025;
  panBody.castShadow = true;
  panBody.receiveShadow = true;
  g.add(panBody);

  const handle = new THREE.Mesh(
    new THREE.BoxGeometry(0.22, 0.02, 0.03),
    handleMat
  );
  handle.position.set(0.26, 0.03, 0);
  handle.castShadow = true;
  g.add(handle);

  const connector = new THREE.Mesh(
    new THREE.BoxGeometry(0.04, 0.03, 0.05),
    handleMat
  );
  connector.position.set(0.17, 0.03, 0);
  g.add(connector);

  return g;
}