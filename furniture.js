// furniture.js
import * as THREE from 'three';

function mat(color, rough = 0.75, metal = 0) {
  return new THREE.MeshStandardMaterial({ color, roughness: rough, metalness: metal });
}

function box(w, h, d, material, x = 0, y = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), material);
  m.position.set(x, y, z);
  m.castShadow = true;
  m.receiveShadow = true;
  return m;
}

/* ============================================================
   CAMAS
   ============================================================ */

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

/* ============================================================
   MESAS
   ============================================================ */

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

/* ============================================================
   SILLAS
   ============================================================ */

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

/* ============================================================
   ALMACENAMIENTO
   ============================================================ */

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

/* ============================================================
   COCINAS
   ============================================================ */

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
    { x: -0.19, z: -0.16, r: 0.09, power: 1.0 },
    { x:  0.19, z: -0.16, r: 0.07, power: 0.85 },
    { x: -0.19, z:  0.16, r: 0.07, power: 0.85 },
    { x:  0.19, z:  0.16, r: 0.09, power: 1.0 },
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
  const handleMat = new THREE.MeshStandardMaterial({
    color: 0xd8b040, roughness: 0.3, metalness: 0.7,
  });

  const W = 1.2, H = 0.85, D = 0.6;

  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  const counter = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.04, 0.05, D + 0.04),
    counterMat
  );
  counter.position.y = H + 0.025;
  counter.castShadow = true;
  counter.receiveShadow = true;
  g.add(counter);

  const door = new THREE.Mesh(
    new THREE.BoxGeometry(W - 0.06, H - 0.12, 0.03),
    woodMat
  );
  door.position.set(0, H / 2, D / 2 + 0.02);
  door.castShadow = true;
  g.add(door);

  const handle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.014, 0.014, 0.3, 8),
    handleMat
  );
  handle.rotation.x = Math.PI / 2;
  handle.position.set(0, H / 2, D / 2 + 0.05);
  g.add(handle);

  const sinkMat = new THREE.MeshStandardMaterial({
    color: 0xb0b0b0, roughness: 0.15, metalness: 0.9,
  });

  const sinkY = H + 0.03;
  const sinkW = W * 0.42, sinkD = D * 0.55, sinkH = 0.15;

  for (const dx of [-W * 0.22, W * 0.22]) {
    const rim = new THREE.Mesh(
      new THREE.BoxGeometry(sinkW + 0.03, 0.02, sinkD + 0.03),
      steelMat
    );
    rim.position.set(dx, sinkY + 0.01, 0);
    g.add(rim);

    const inner = new THREE.Mesh(
      new THREE.BoxGeometry(sinkW, sinkH, sinkD),
      sinkMat
    );
    inner.position.set(dx, sinkY - sinkH / 2, 0);
    inner.castShadow = true;
    g.add(inner);

    const drain = new THREE.Mesh(
      new THREE.CylinderGeometry(0.035, 0.035, 0.01, 12),
      new THREE.MeshStandardMaterial({ color: 0x3a3a3a, metalness: 0.9, roughness: 0.3 })
    );
    drain.position.set(dx, sinkY - sinkH + 0.01, 0);
    g.add(drain);
  }

  const faucetBase = new THREE.Mesh(
    new THREE.CylinderGeometry(0.025, 0.03, 0.05, 12),
    steelMat
  );
  faucetBase.position.set(0, sinkY + 0.025, -D * 0.28);
  g.add(faucetBase);

  const faucetPole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.02, 0.02, 0.35, 12),
    steelMat
  );
  faucetPole.position.set(0, sinkY + 0.2, -D * 0.28);
  faucetPole.castShadow = true;
  g.add(faucetPole);

  const faucetArm = new THREE.Mesh(
    new THREE.TorusGeometry(0.09, 0.02, 10, 16, Math.PI / 2),
    steelMat
  );
  faucetArm.position.set(0, sinkY + 0.37, -D * 0.28 + 0.09);
  faucetArm.rotation.x = -Math.PI / 2;
  faucetArm.rotation.z = Math.PI;
  g.add(faucetArm);

  const nozzle = new THREE.Mesh(
    new THREE.CylinderGeometry(0.018, 0.018, 0.05, 10),
    steelMat
  );
  nozzle.position.set(0, sinkY + 0.33, -D * 0.28 + 0.18);
  g.add(nozzle);

  const faucetHandle = new THREE.Mesh(
    new THREE.BoxGeometry(0.08, 0.02, 0.02),
    steelMat
  );
  faucetHandle.position.set(0.05, sinkY + 0.05, -D * 0.28);
  g.add(faucetHandle);

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(W + 0.02, 0.08, D + 0.02),
    new THREE.MeshStandardMaterial({ color: 0x2a2a2a, roughness: 0.6 })
  );
  skirt.position.y = 0.04;
  g.add(skirt);

  return g;
}

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

  g.add(box(W, H, D, woodMat, 0, H / 2, 0));

  for (let i = 1; i < 3; i++) {
    const shelf = new THREE.Mesh(
      new THREE.BoxGeometry(W - 0.1, 0.02, D - 0.05),
      woodMat
    );
    shelf.position.y = (H / 3) * i;
    g.add(shelf);
  }

  const doorW = W / 2 - 0.02;
  for (const sign of [-1, 1]) {
    const frame = new THREE.Mesh(
      new THREE.BoxGeometry(doorW, H - 0.08, 0.03),
      woodMat
    );
    frame.position.set(sign * (doorW / 2), H / 2, D / 2 + 0.015);
    frame.castShadow = true;
    g.add(frame);

    const glass = new THREE.Mesh(
      new THREE.BoxGeometry(doorW - 0.08, H - 0.16, 0.02),
      glassMat
    );
    glass.position.set(sign * (doorW / 2), H / 2, D / 2 + 0.035);
    g.add(glass);

    const handle = new THREE.Mesh(
      new THREE.CylinderGeometry(0.012, 0.012, 0.15, 8),
      handleMat
    );
    handle.rotation.z = Math.PI / 2;
    handle.position.set(sign * 0.06, H * 0.25, D / 2 + 0.06);
    g.add(handle);
  }

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

/* ============================================================
   PEQUEÑOS ELECTRODOMÉSTICOS
   ============================================================ */

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

/* ============================================================
   OTROS
   ============================================================ */

export function createLamp() {
  const g = new THREE.Group();
  const poleMat = mat(0x333a45, 0.6, 0.4);
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xffe7a8, emissive: 0xffd890, emissiveIntensity: 1.8, roughness: 0.9,
  });
  const baseMat = mat(0x22262e, 0.5, 0.3);
  g.add(box(0.4, 0.06, 0.4, baseMat, 0, 0.03, 0));
  const pole = new THREE.Mesh(new THREE.CylinderGeometry(0.03, 0.03, 1.4, 8), poleMat);
  pole.position.y = 0.73; pole.castShadow = true;
  g.add(pole);
  const shade = new THREE.Mesh(new THREE.ConeGeometry(0.28, 0.3, 16, 1, true), shadeMat);
  shade.position.y = 1.55; shade.castShadow = true;
  g.add(shade);
  const light = new THREE.PointLight(0xffe7a8, 1.8, 7, 1.7);
  light.position.y = 1.5;
  g.add(light);
  return g;
}

export function createDeskLamp(color) {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: color ?? 0x8a5a35, roughness: 0.7, metalness: 0.2,
  });
  const poleMat = new THREE.MeshStandardMaterial({
    color: 0x333a45, roughness: 0.5, metalness: 0.6,
  });
  const shadeMat = new THREE.MeshStandardMaterial({
    color: 0xffe7a8,
    emissive: 0xffd890,
    emissiveIntensity: 1.5,
    roughness: 0.9,
    side: THREE.DoubleSide,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.14, 0.16, 0.04, 20),
    baseMat
  );
  base.position.y = 0.02;
  base.castShadow = true;
  base.receiveShadow = true;
  g.add(base);

  const neck = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.03, 0.08, 10),
    poleMat
  );
  neck.position.y = 0.08;
  g.add(neck);

  const pole = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.35, 10),
    poleMat
  );
  pole.position.y = 0.28;
  pole.castShadow = true;
  g.add(pole);

  const elbow = new THREE.Mesh(
    new THREE.SphereGeometry(0.03, 10, 8),
    poleMat
  );
  elbow.position.y = 0.455;
  g.add(elbow);

  const arm = new THREE.Mesh(
    new THREE.CylinderGeometry(0.022, 0.022, 0.22, 10),
    poleMat
  );
  arm.position.set(0.06, 0.53, 0);
  arm.rotation.z = -Math.PI / 3;
  arm.castShadow = true;
  g.add(arm);

  const shade = new THREE.Mesh(
    new THREE.ConeGeometry(0.14, 0.14, 20, 1, true),
    shadeMat
  );
  shade.position.set(0.16, 0.56, 0);
  shade.castShadow = true;
  g.add(shade);

  const cap = new THREE.Mesh(
    new THREE.CylinderGeometry(0.03, 0.02, 0.03, 10),
    poleMat
  );
  cap.position.set(0.16, 0.63, 0);
  g.add(cap);

  const light = new THREE.PointLight(0xffe7a8, 1.6, 4.5, 1.6);
  light.position.set(0.16, 0.5, 0);
  g.add(light);

  return g;
}

export function createRug() {
  const g = new THREE.Group();
  const rugMat = mat(0x8a3b3b, 0.95);
  const rug = new THREE.Mesh(new THREE.PlaneGeometry(1.8, 1.2), rugMat);
  rug.rotation.x = -Math.PI / 2;
  rug.position.y = 0.02;
  rug.receiveShadow = true;
  g.add(rug);
  return g;
}

/* ============================================================
   PLANTAS
   ============================================================ */

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
   MUROS
   ============================================================ */

const WALL_W = 4.0;
const WALL_H = 3.0;
const WALL_T = 0.2;

export function createWall(color) {
  const g = new THREE.Group();
  const wallMat = mat(color ?? 0xd8d0c0, 0.9);
  const m = new THREE.Mesh(new THREE.BoxGeometry(WALL_W, WALL_H, WALL_T), wallMat);
  m.position.y = WALL_H / 2;
  m.castShadow = true; m.receiveShadow = true;
  g.add(m);

  const skirt = new THREE.Mesh(
    new THREE.BoxGeometry(WALL_W + 0.02, 0.12, WALL_T + 0.02),
    mat(0xb8b0a0, 0.9)
  );
  skirt.position.y = 0.06;
  skirt.castShadow = true;
  g.add(skirt);

  return g;
}

function _doorStyleMaterials(style) {
  switch (style) {
    case 'blanca':  return { main: 0xf0f0f0, frame: 0xdcdcdc, dark: 0xb0b0b0 };
    case 'doble':   return { main: 0x8a5a35, frame: 0x5a4230, dark: 0x3a2a1a };
    case 'arco':    return { main: 0x6a4230, frame: 0x4a2a1a, dark: 0x2a1a0a };
    case 'cristal': return { main: 0xa8d8e8, frame: 0x5a4230, dark: 0x3a2a1a };
    case 'rejilla': return { main: 0x8a5a35, frame: 0x4a2a1a, dark: 0x2a1a0a };
    default:        return { main: 0x8a5a35, frame: 0x5a4230, dark: 0x3a2a1a };
  }
}

function _windowStyleMaterials(style) {
  switch (style) {
    case 'grande':   return { frame: 0x5a4230, glass: 0x88c8ff };
    case 'arco':     return { frame: 0x4a2a1a, glass: 0xa8d8ff };
    case 'moderna':  return { frame: 0x2a2a2a, glass: 0x88b8e8 };
    case 'mirador':  return { frame: 0x4a2a1a, glass: 0xa0d0f0 };
    case 'circular': return { frame: 0x5a4230, glass: 0x88c8ff };
    default:         return { frame: 0x5a4230, glass: 0x88c8ff };
  }
}

export function createWallDoor(color, style = 'madera') {
  const g = new THREE.Group();
  const wallMat = mat(color ?? 0xd8d0c0, 0.9);
  const dm = _doorStyleMaterials(style);
  const frameMat = mat(dm.frame, 0.8);

  const DOOR_W = 1.2;
  const DOOR_H = 2.2;

  const sideW = (WALL_W - DOOR_W) / 2;
  for (const sign of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sideW, WALL_H, WALL_T), wallMat);
    m.position.x = sign * (DOOR_W / 2 + sideW / 2);
    m.position.y = WALL_H / 2;
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);

    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(sideW, 0.12, WALL_T + 0.02),
      mat(0xb8b0a0, 0.9)
    );
    skirt.position.set(sign * (DOOR_W / 2 + sideW / 2), 0.06, 0);
    g.add(skirt);
  }

  const lintelH = WALL_H - DOOR_H;
  const lintel = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_W, lintelH, WALL_T),
    wallMat
  );
  lintel.position.y = DOOR_H + lintelH / 2;
  lintel.castShadow = true; lintel.receiveShadow = true;
  g.add(lintel);

  const ft = 0.12;
  const tExtra = WALL_T + 0.05;

  for (const sign of [-1, 1]) {
    const jamba = new THREE.Mesh(
      new THREE.BoxGeometry(ft, DOOR_H, tExtra),
      frameMat
    );
    jamba.position.set(sign * (DOOR_W / 2 - ft / 2), DOOR_H / 2, 0);
    jamba.castShadow = true;
    g.add(jamba);
  }

  const dintelFrame = new THREE.Mesh(
    new THREE.BoxGeometry(DOOR_W, ft, tExtra),
    frameMat
  );
  dintelFrame.position.set(0, DOOR_H - ft / 2, 0);
  dintelFrame.castShadow = true;
  g.add(dintelFrame);

  const doorMat = mat(dm.main, 0.7);
  const detailMat = mat(dm.dark, 0.6);

  if (style === 'doble') {
    const panelW = DOOR_W / 2 - 0.02;
    for (const sign of [-1, 1]) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW, DOOR_H - 0.1, 0.06),
        doorMat
      );
      panel.position.set(sign * (panelW / 2), (DOOR_H - 0.1) / 2, 0);
      panel.castShadow = true;
      g.add(panel);

      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), detailMat);
      knob.position.set(sign * (panelW - 0.15), DOOR_H / 2, 0.05);
      g.add(knob);
    }
  } else if (style === 'arco') {
    const archH = DOOR_H - 0.4;
    const radius = (DOOR_W - 0.1) / 2;

    const shape = new THREE.Shape();
    shape.moveTo(-radius, 0);
    shape.lineTo(-radius, archH);
    shape.absarc(0, archH, radius, Math.PI, 0, false);
    shape.lineTo(radius, 0);
    shape.lineTo(-radius, 0);

    const extrudeSettings = { depth: 0.06, bevelEnabled: false };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.translate(0, 0, -0.03);

    const panel = new THREE.Mesh(geometry, doorMat);
    panel.castShadow = true;
    panel.receiveShadow = true;
    g.add(panel);

    const detail = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.1, 0.06, 0.07),
      detailMat
    );
    detail.position.set(0, archH * 0.55, 0);
    g.add(detail);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(radius - 0.15, archH * 0.5, 0.05);
    g.add(knob);
  } else if (style === 'cristal') {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xa8d8e8,
      roughness: 0.05,
      metalness: 0.1,
      transparent: true,
      opacity: 0.45,
    });
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.05),
      glassMat
    );
    panel.position.set(0, (DOOR_H - 0.1) / 2, 0);
    g.add(panel);

    for (const side of [-1, 1]) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, DOOR_H - 0.1, 0.07),
        doorMat
      );
      frame.position.set(side * (DOOR_W / 2 - 0.08), (DOOR_H - 0.1) / 2, 0);
      g.add(frame);
    }
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, 0.06, 0.07),
      doorMat
    );
    top.position.set(0, DOOR_H - 0.15, 0);
    g.add(top);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    g.add(knob);
  } else if (style === 'rejilla') {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.06),
      doorMat
    );
    panel.position.set(0, (DOOR_H - 0.1) / 2, 0);
    panel.castShadow = true;
    g.add(panel);

    const gridMat = mat(0x2a1a0a, 0.6);
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(DOOR_W - 0.3, 0.03, 0.08),
        gridMat
      );
      bar.position.set(0, DOOR_H * 0.5 + (i - 1.5) * 0.12, 0.01);
      g.add(bar);
    }
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.5, 0.08),
        gridMat
      );
      bar.position.set((i - 1) * 0.15, DOOR_H * 0.5, 0.01);
      g.add(bar);
    }

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    g.add(knob);
  } else {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.06),
      doorMat
    );
    panel.position.set(0, (DOOR_H - 0.1) / 2, 0);
    panel.castShadow = true;
    g.add(panel);

    const panel1 = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.25, 0.5, 0.07),
      detailMat
    );
    panel1.position.set(0, DOOR_H * 0.7, 0);
    g.add(panel1);

    const panel2 = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.25, 0.6, 0.07),
      detailMat
    );
    panel2.position.set(0, DOOR_H * 0.3, 0);
    g.add(panel2);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    g.add(knob);
  }

  return g;
}

export function createWallWindow(color, style = 'cruz') {
  const g = new THREE.Group();
  const wallMat = mat(color ?? 0xd8d0c0, 0.9);
  const wm = _windowStyleMaterials(style);
  const frameMat = mat(wm.frame, 0.8);
  const glassMat = new THREE.MeshStandardMaterial({
    color: wm.glass,
    emissive: 0x4466aa,
    emissiveIntensity: 0.25,
    transparent: true,
    opacity: 0.5,
    roughness: 0.05,
    metalness: 0.1,
  });

  let WIN_W = 1.6, WIN_H = 1.2, WIN_Y = 1.2;
  if (style === 'grande')   { WIN_W = 2.6; WIN_H = 1.8; WIN_Y = 0.8; }
  if (style === 'moderna')  { WIN_W = 2.8; WIN_H = 0.7; WIN_Y = 1.5; }
  if (style === 'arco')     { WIN_W = 1.6; WIN_H = 1.6; WIN_Y = 1.0; }
  if (style === 'mirador')  { WIN_W = 3.0; WIN_H = 2.0; WIN_Y = 0.7; }
  if (style === 'circular') { WIN_W = 1.8; WIN_H = 1.8; WIN_Y = 1.0; }

  const sideW = (WALL_W - WIN_W) / 2;
  for (const sign of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sideW, WALL_H, WALL_T), wallMat);
    m.position.x = sign * (WIN_W / 2 + sideW / 2);
    m.position.y = WALL_H / 2;
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);

    const skirt = new THREE.Mesh(
      new THREE.BoxGeometry(sideW, 0.12, WALL_T + 0.02),
      mat(0xb8b0a0, 0.9)
    );
    skirt.position.set(sign * (WIN_W / 2 + sideW / 2), 0.06, 0);
    g.add(skirt);
  }

  const under = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W, WIN_Y, WALL_T),
    wallMat
  );
  under.position.y = WIN_Y / 2;
  under.castShadow = true; under.receiveShadow = true;
  g.add(under);

  const skirtU = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W, 0.12, WALL_T + 0.02),
    mat(0xb8b0a0, 0.9)
  );
  skirtU.position.y = 0.06;
  g.add(skirtU);

  const aboveH = WALL_H - WIN_Y - WIN_H;
  const above = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W, aboveH, WALL_T),
    wallMat
  );
  above.position.y = WIN_Y + WIN_H + aboveH / 2;
  above.castShadow = true; above.receiveShadow = true;
  g.add(above);

  const ft = 0.1;
  const tExtra = WALL_T + 0.05;

  for (const sign of [-1, 1]) {
    const jamba = new THREE.Mesh(
      new THREE.BoxGeometry(ft, WIN_H + ft * 2, tExtra),
      frameMat
    );
    jamba.position.set(sign * (WIN_W / 2 - ft / 2), WIN_Y + WIN_H / 2, 0);
    jamba.castShadow = true;
    g.add(jamba);
  }

  for (const y of [WIN_Y - ft / 2, WIN_Y + WIN_H + ft / 2]) {
    const travesaño = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W, ft, tExtra),
      frameMat
    );
    travesaño.position.set(0, y, 0);
    travesaño.castShadow = true;
    g.add(travesaño);
  }

  if (style === 'cruz' || style === 'grande' || style === 'mirador') {
    const cruzH = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W, ft * 0.6, tExtra * 0.8),
      frameMat
    );
    cruzH.position.set(0, WIN_Y + WIN_H / 2, 0);
    g.add(cruzH);

    const cruzV = new THREE.Mesh(
      new THREE.BoxGeometry(ft * 0.6, WIN_H, tExtra * 0.8),
      frameMat
    );
    cruzV.position.set(0, WIN_Y + WIN_H / 2, 0);
    g.add(cruzV);
  } else if (style === 'arco') {
    const cruzH = new THREE.Mesh(
      new THREE.BoxGeometry(WIN_W, ft * 0.6, tExtra * 0.8),
      frameMat
    );
    cruzH.position.set(0, WIN_Y + WIN_H / 2, 0);
    g.add(cruzH);
  } else if (style === 'circular') {
    const ring = new THREE.Mesh(
      new THREE.TorusGeometry(WIN_H / 2 - 0.1, ft * 0.6, 8, 24),
      frameMat
    );
    ring.position.set(0, WIN_Y + WIN_H / 2, 0.02);
    g.add(ring);
  }

  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W - ft * 2, WIN_H - ft * 2, 0.02),
    glassMat
  );
  glass.position.set(0, WIN_Y + WIN_H / 2, 0);
  g.add(glass);

  return g;
}

/* ============================================================
   TECHOS
   ============================================================ */
const ROOF_S = 4.0;
const ROOF_T = 0.2;

export function createRoof(color) {
  const g = new THREE.Group();
  const roofMat = mat(color ?? 0xf0ead8, 0.9);
  const edgeMat = mat(0xd8d0b8, 0.9);

  const roof = new THREE.Mesh(
    new THREE.BoxGeometry(ROOF_S, ROOF_T, ROOF_S),
    roofMat
  );
  roof.castShadow = true; roof.receiveShadow = true;
  g.add(roof);

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(ROOF_S + 0.15, ROOF_T * 0.5, ROOF_S + 0.15),
    edgeMat
  );
  edge.position.y = -ROOF_T * 0.35;
  edge.castShadow = true; edge.receiveShadow = true;
  g.add(edge);

  g.position.y = WALL_H + ROOF_T / 2;
  return g;
}

/* ============================================================
   ELECTRODOMÉSTICOS
   ============================================================ */

export function createTV(color) {
  const g = new THREE.Group();
  const frameMat = mat(color ?? 0x1a1a1a, 0.7);
  const baseMat  = mat(0x0d0d0d, 0.6);

  const W = 1.4, H = 0.8, D = 0.06;
  const standH = 0.15;

  const frame = new THREE.Mesh(
    new THREE.BoxGeometry(W, H, D),
    frameMat
  );
  frame.position.y = standH + H / 2;
  frame.castShadow = true;
  frame.receiveShadow = true;
  g.add(frame);

  const screenGeo = new THREE.PlaneGeometry(W - 0.08, H - 0.08);
  const screenMat = new THREE.MeshBasicMaterial({ color: 0x0a0a0a });
  const screen = new THREE.Mesh(screenGeo, screenMat);
  screen.position.set(0, standH + H / 2, D / 2 + 0.001);
  g.add(screen);

  const stand = new THREE.Mesh(
    new THREE.BoxGeometry(0.4, standH, 0.2),
    baseMat
  );
  stand.position.set(0, standH / 2, 0);
  stand.castShadow = true;
  g.add(stand);

  const base = new THREE.Mesh(
    new THREE.BoxGeometry(0.6, 0.03, 0.3),
    baseMat
  );
  base.position.set(0, 0.015, 0);
  base.castShadow = true;
  g.add(base);

  g.userData.screen = screen;
  g.userData.screenMat = screenMat;

  return g;
}

/* ============================================================
   LUCES DE TECHO Y PARED
   ============================================================ */

export function createCeilingPlafon() {
  const g = new THREE.Group();
  const baseMat = new THREE.MeshStandardMaterial({
    color: 0xf0f0f0, roughness: 0.4, metalness: 0.1,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e0, emissive: 0xffe0a0, emissiveIntensity: 1.8,
    roughness: 0.3, metalness: 0.05,
    transparent: true, opacity: 0.9,
  });

  const base = new THREE.Mesh(
    new THREE.CylinderGeometry(0.22, 0.22, 0.04, 24),
    baseMat
  );
  base.position.y = -0.02;
  base.castShadow = true;
  g.add(base);

  const glass = new THREE.Mesh(
    new THREE.SphereGeometry(0.24, 24, 12, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2),
    glassMat
  );
  glass.position.y = -0.03;
  g.add(glass);

  const light = new THREE.PointLight(0xfff0c0, 1.8, 8, 1.6);
  light.position.y = -0.15;
  g.add(light);

  return g;
}

export function createCeilingChandelier() {
  const g = new THREE.Group();
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xd8b040, roughness: 0.3, metalness: 0.8,
  });
  const bulbMat = new THREE.MeshStandardMaterial({
    color: 0xfff8e0, emissive: 0xffe0a0, emissiveIntensity: 2.0,
    roughness: 0.3, transparent: true, opacity: 0.95,
  });

  const rod = new THREE.Mesh(
    new THREE.CylinderGeometry(0.015, 0.015, 0.25, 10),
    goldMat
  );
  rod.position.y = -0.125;
  g.add(rod);

  const ring = new THREE.Mesh(
    new THREE.TorusGeometry(0.22, 0.015, 8, 24),
    goldMat
  );
  ring.rotation.x = Math.PI / 2;
  ring.position.y = -0.25;
  g.add(ring);

  const count = 6;
  for (let i = 0; i < count; i++) {
    const a = (i / count) * Math.PI * 2;

    const arm = new THREE.Mesh(
      new THREE.CylinderGeometry(0.01, 0.01, 0.2, 8),
      goldMat
    );
    arm.rotation.z = Math.PI / 2;
    arm.rotation.y = a;
    arm.position.set(Math.cos(a) * 0.11, -0.25, Math.sin(a) * 0.11);
    g.add(arm);

    const cup = new THREE.Mesh(
      new THREE.CylinderGeometry(0.04, 0.03, 0.05, 10),
      goldMat
    );
    cup.position.set(Math.cos(a) * 0.22, -0.22, Math.sin(a) * 0.22);
    g.add(cup);

    const bulb = new THREE.Mesh(
      new THREE.SphereGeometry(0.035, 12, 10),
      bulbMat
    );
    bulb.position.set(Math.cos(a) * 0.22, -0.17, Math.sin(a) * 0.22);
    g.add(bulb);

    const pLight = new THREE.PointLight(0xffe0a0, 0.4, 3, 1.5);
    pLight.position.set(Math.cos(a) * 0.22, -0.17, Math.sin(a) * 0.22);
    g.add(pLight);
  }

  const centralLight = new THREE.PointLight(0xffe0a0, 1.0, 6, 1.6);
  centralLight.position.y = -0.3;
  g.add(centralLight);

  return g;
}

/** Reflector LED de pared (para exterior). Alto, potente, luz que baña la pared. */
export function createWallSconce() {
  const g = new THREE.Group();
  const blackMat = new THREE.MeshStandardMaterial({
    color: 0x1a1a1a, roughness: 0.6, metalness: 0.5,
  });
  const glassMat = new THREE.MeshStandardMaterial({
    color: 0xf8f8f0,
    emissive: 0xfff5d8,
    emissiveIntensity: 2.2,
    roughness: 0.4,
    transparent: true,
    opacity: 0.9,
  });
  const plateMat = new THREE.MeshStandardMaterial({
    color: 0x0f0f0f, roughness: 0.7, metalness: 0.4,
  });

  // Caja vertical montada a la pared (cuerpo del reflector)
  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.26, 0.09),
    blackMat
  );
  body.position.set(0, 0, 0.045);
  body.castShadow = true;
  g.add(body);

  // Placa posterior (contra la pared)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.28, 0.02),
    plateMat
  );
  plate.position.set(0, 0, -0.01);
  g.add(plate);

  // Ventana de luz (frente del reflector)
  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.2, 0.02),
    glassMat
  );
  lens.position.set(0, 0, 0.095);
  g.add(lens);

  // Aletas de ventilación arriba y abajo
  for (const dy of [-0.14, 0.14]) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.03, 0.11),
      blackMat
    );
    fin.position.set(0, dy, 0.045);
    fin.castShadow = true;
    g.add(fin);
  }

  // LED interior (plano brillante)
  const led = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xfffce0 })
  );
  led.position.set(0, 0, 0.098);
  g.add(led);

  // Luz puntual potente
  const mainLight = new THREE.PointLight(0xfff4d0, 3.5, 14, 1.6);
  mainLight.position.set(0, 0, 0.2);
  g.add(mainLight);

  // Luz de baño hacia la pared (halo de ambiente)
  const washLight = new THREE.PointLight(0xffe7b0, 1.2, 8, 1.5);
  washLight.position.set(0, -0.1, 0.15);
  g.add(washLight);

  return g;
}

/* ============================================================
   SUELOS
   ============================================================ */

export function createFloor(type, color = null) {
  const g = new THREE.Group();
  const S = 16;
  let y = 0;

  switch (type) {
    case 'piso_madera': {
      const woodMat = mat(0x8a5a35, 0.85);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), woodMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);

      const lineMat = mat(0x6a4220, 0.9);
      for (let i = 1; i < 16; i++) {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.03, S), lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-S/2 + i, y + 0.001, 0);
        g.add(line);
      }
      break;
    }

    case 'piso_baldosa': {
      const tileMat = mat(0xd8d8d8, 0.6);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), tileMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);

      const groutMat = mat(0x8a8a8a, 0.9);
      for (let i = 1; i < 20; i++) {
        const lineH = new THREE.Mesh(new THREE.PlaneGeometry(S, 0.03), groutMat);
        lineH.rotation.x = -Math.PI / 2;
        lineH.position.set(0, y + 0.001, -S/2 + i * 0.8);
        g.add(lineH);

        const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.03, S), groutMat);
        lineV.rotation.x = -Math.PI / 2;
        lineV.position.set(-S/2 + i * 0.8, y + 0.001, 0);
        g.add(lineV);
      }
      break;
    }

    case 'piso_cesped': {
      const grassMat = mat(0x4a7a3a, 0.95);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), grassMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);
      break;
    }

    case 'piso_piedra': {
      const stoneMat = mat(0x8a8a8a, 0.95);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), stoneMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);

      const lineMat = mat(0x5a5a5a, 0.9);
      for (let i = 1; i < 12; i++) {
        const lineH = new THREE.Mesh(new THREE.PlaneGeometry(S, 0.05), lineMat);
        lineH.rotation.x = -Math.PI / 2;
        lineH.position.set(0, y + 0.001, -S/2 + i * (S/12) + (Math.random() - 0.5) * 0.2);
        g.add(lineH);
      }
      break;
    }

    case 'piso_azulejo': {
      const tileMat = mat(0xa8c8e0, 0.4);
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), tileMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);

      const groutMat = mat(0x6a8aa0, 0.9);
      for (let i = 1; i < 32; i++) {
        const lineH = new THREE.Mesh(new THREE.PlaneGeometry(S, 0.015), groutMat);
        lineH.rotation.x = -Math.PI / 2;
        lineH.position.set(0, y + 0.001, -S/2 + i * 0.5);
        g.add(lineH);

        const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.015, S), groutMat);
        lineV.rotation.x = -Math.PI / 2;
        lineV.position.set(-S/2 + i * 0.5, y + 0.001, 0);
        g.add(lineV);
      }
      break;
    }

    case 'piso_liso': {
      const lisoMat = new THREE.MeshStandardMaterial({
        color: color ?? 0xe8e0d0,
        roughness: 0.35,
        metalness: 0.05,
      });
      const plane = new THREE.Mesh(new THREE.PlaneGeometry(S, S), lisoMat);
      plane.rotation.x = -Math.PI / 2;
      plane.position.y = y;
      plane.receiveShadow = true;
      g.add(plane);
      break;
    }
  }

  return g;
}

/* ============================================================
   FÁBRICA
   ============================================================ */
export function createFurniture(type, color = null, style = null) {
  switch (type) {
    case 'cama_basica':    return createBedBasic(color);
    case 'cama_doble':     return createBedDouble(color);
    case 'cama_premium':   return createBedPremium(color);
    case 'cama_king':      return createBedKing(color);

    case 'mesa_basica':    return createTableBasic(color);
    case 'mesa_redonda':   return createTableRound(color);
    case 'mesa_premium':   return createTablePremium(color);
    case 'mesa_luz':       return createNightstand(color);

    case 'silla_basica':   return createChairBasic(color);
    case 'silla_tapizada': return createChairUpholstered(color);
    case 'silla_premium':  return createChairPremium(color);

    case 'ropero':         return createWardrobe(color);
    case 'alacena':        return createCupboard(color);

    case 'cocina_gas':       return createGasStove(color);
    case 'cocina_electrica': return createElectricStove(color);

    case 'bajo_mesada_pileta':    return createUnderSinkCabinet(color);
    case 'alacena_aerea':         return createUpperCabinet(color);
    case 'lavavajillas':          return createDishwasher(color);
    case 'horno_electrico':       return createBuiltInOven(color);
    case 'pava_electrica':        return createElectricKettle(color);
    case 'licuadora':             return createBlender(color);
    case 'ollas':                 return createPots();
    case 'sarten':                return createPan();

    case 'luz_plafon':            return createCeilingPlafon();
    case 'luz_candelabro':        return createCeilingChandelier();
    case 'luz_aplique':           return createWallSconce();

    case 'planta_maceta':  return createPlantPot(color);
    case 'arbusto':        return createBush(color);
    case 'arbol_chico':    return createSmallTree(color);
    case 'arbol_grande':   return createBigTree(color);

    case 'lampara':        return createLamp();
    case 'lampara_mesa':   return createDeskLamp(color);
    case 'alfombra':       return createRug();

    case 'piso_madera':    return createFloor('piso_madera');
    case 'piso_baldosa':   return createFloor('piso_baldosa');
    case 'piso_cesped':    return createFloor('piso_cesped');
    case 'piso_piedra':    return createFloor('piso_piedra');
    case 'piso_azulejo':   return createFloor('piso_azulejo');
    case 'piso_liso':      return createFloor('piso_liso', color);

    case 'muro_basico':       return createWall(color);
    case 'muro_puerta':       return createWallDoor(color, 'madera');
    case 'muro_ventana':      return createWallWindow(color, 'cruz');
    case 'muro_premium':      return createWall(color);
    case 'muro_puerta_prem':  return createWallDoor(color, style ?? 'madera');
    case 'muro_ventana_prem': return createWallWindow(color, style ?? 'cruz');

    case 'techo_basico':   return createRoof(color);

    case 'tv':             return createTV(color);

    default:
      console.warn('createFurniture: tipo desconocido', type);
      return null;
  }
}

export function place(group, x, y, z, rotY = 0) {
  group.position.x = x;
  group.position.z = z;
  group.rotation.y = rotY;
  if (group.position.y === 0) group.position.y = y;
  return group;
}