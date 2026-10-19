// furniture/walls.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

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

  // CORRECCIÓN Z-FIGHTING: Evitar que los marcos peleen con la pared
  frameMat.polygonOffset = true;
  frameMat.polygonOffsetFactor = -1;
  frameMat.polygonOffsetUnits = -1;

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

  // ============================================================
  // GRUPO BISAGRA: todo lo que gira va acá
  // ============================================================
  const hinge = new THREE.Group();
  hinge.position.set(-DOOR_W / 2, 0, 0); 
  g.add(hinge);

  const OFFSET_X = DOOR_W / 2;

  if (style === 'doble') {
    const panelW = DOOR_W / 2 - 0.02;
    for (const sign of [-1, 1]) {
      const panel = new THREE.Mesh(
        new THREE.BoxGeometry(panelW, DOOR_H - 0.1, 0.06),
        doorMat
      );
      panel.position.set(OFFSET_X + sign * (panelW / 2), (DOOR_H - 0.1) / 2, 0);
      panel.castShadow = true;
      hinge.add(panel);

      const knob = new THREE.Mesh(new THREE.SphereGeometry(0.04, 8, 6), detailMat);
      knob.position.set(OFFSET_X + sign * (panelW - 0.15), DOOR_H / 2, 0.05);
      hinge.add(knob);
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
    panel.position.x = OFFSET_X;
    panel.castShadow = true;
    panel.receiveShadow = true;
    hinge.add(panel);

    const detail = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.1, 0.06, 0.07),
      detailMat
    );
    detail.position.set(OFFSET_X, archH * 0.55, 0);
    hinge.add(detail);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(OFFSET_X + radius - 0.15, archH * 0.5, 0.05);
    hinge.add(knob);
  } else if (style === 'cristal') {
    const glassMat = new THREE.MeshStandardMaterial({
      color: 0xa8d8e8, roughness: 0.05, metalness: 0.1,
      transparent: true, opacity: 0.45,
      depthWrite: false // CORRECCIÓN: Evitar bugs de transparencia
    });
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.05),
      glassMat
    );
    panel.position.set(OFFSET_X, (DOOR_H - 0.1) / 2, 0);
    hinge.add(panel);

    for (const side of [-1, 1]) {
      const frame = new THREE.Mesh(
        new THREE.BoxGeometry(0.06, DOOR_H - 0.1, 0.07),
        doorMat
      );
      frame.position.set(OFFSET_X + side * (DOOR_W / 2 - 0.08), (DOOR_H - 0.1) / 2, 0);
      hinge.add(frame);
    }
    const top = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, 0.06, 0.07),
      doorMat
    );
    top.position.set(OFFSET_X, DOOR_H - 0.15, 0);
    hinge.add(top);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(OFFSET_X + DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    hinge.add(knob);
  } else if (style === 'rejilla') {
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.06),
      doorMat
    );
    panel.position.set(OFFSET_X, (DOOR_H - 0.1) / 2, 0);
    panel.castShadow = true;
    hinge.add(panel);

    const gridMat = mat(0x2a1a0a, 0.6);
    for (let i = 0; i < 4; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(DOOR_W - 0.3, 0.03, 0.08),
        gridMat
      );
      bar.position.set(OFFSET_X, DOOR_H * 0.5 + (i - 1.5) * 0.12, 0.01);
      hinge.add(bar);
    }
    for (let i = 0; i < 3; i++) {
      const bar = new THREE.Mesh(
        new THREE.BoxGeometry(0.03, 0.5, 0.08),
        gridMat
      );
      bar.position.set(OFFSET_X + (i - 1) * 0.15, DOOR_H * 0.5, 0.01);
      hinge.add(bar);
    }

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(OFFSET_X + DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    hinge.add(knob);
  } else {
    // madera (default)
    const panel = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.05, DOOR_H - 0.1, 0.06),
      doorMat
    );
    panel.position.set(OFFSET_X, (DOOR_H - 0.1) / 2, 0);
    panel.castShadow = true;
    hinge.add(panel);

    const panel1 = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.25, 0.5, 0.07),
      detailMat
    );
    panel1.position.set(OFFSET_X, DOOR_H * 0.7, 0);
    hinge.add(panel1);

    const panel2 = new THREE.Mesh(
      new THREE.BoxGeometry(DOOR_W - 0.25, 0.6, 0.07),
      detailMat
    );
    panel2.position.set(OFFSET_X, DOOR_H * 0.3, 0);
    hinge.add(panel2);

    const knob = new THREE.Mesh(new THREE.SphereGeometry(0.05, 8, 6), detailMat);
    knob.position.set(OFFSET_X + DOOR_W / 2 - 0.2, DOOR_H / 2, 0.05);
    hinge.add(knob);
  }

  g.userData.puerta = hinge;
  g.userData.puertaAbierta = false;

  return g;
}

export function createWallWindow(color, style = 'cruz') {
  const g = new THREE.Group();
  const wallMat = mat(color ?? 0xd8d0c0, 0.9);
  const wm = _windowStyleMaterials(style);
  
  const frameMat = mat(wm.frame, 0.8);
  frameMat.polygonOffset = true;
  frameMat.polygonOffsetFactor = -1;
  frameMat.polygonOffsetUnits = -1;
  frameMat.depthWrite = true;

  const glassMat = new THREE.MeshStandardMaterial({
    color: wm.glass, emissive: 0x4466aa, emissiveIntensity: 0.2,
    transparent: true, opacity: 0.6, roughness: 0.1, metalness: 0.1,
    depthWrite: false,
    side: THREE.DoubleSide,
    polygonOffset: true,       
    polygonOffsetFactor: 1,    
    polygonOffsetUnits: 1
  });

  let WIN_W = 1.6, WIN_H = 1.2, WIN_Y = 1.2;
  if (style === 'grande')   { WIN_W = 2.6; WIN_H = 1.8; WIN_Y = 0.8; }
  if (style === 'moderna')  { WIN_W = 2.8; WIN_H = 0.7; WIN_Y = 1.5; }
  if (style === 'arco')     { WIN_W = 1.6; WIN_H = 1.6; WIN_Y = 1.0; }
  if (style === 'mirador')  { WIN_W = 3.0; WIN_H = 2.0; WIN_Y = 0.7; }
  if (style === 'circular') { WIN_W = 1.8; WIN_H = 1.8; WIN_Y = 1.0; }

  const sideW = (WALL_W - WIN_W) / 2;
  
  // Muros base
  for (const sign of [-1, 1]) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(sideW, WALL_H, WALL_T), wallMat);
    m.position.x = sign * (WIN_W / 2 + sideW / 2);
    m.position.y = WALL_H / 2;
    m.castShadow = true; m.receiveShadow = true;
    g.add(m);

    const skirt = new THREE.Mesh(new THREE.BoxGeometry(sideW, 0.12, WALL_T + 0.02), mat(0xb8b0a0, 0.9));
    skirt.position.set(sign * (WIN_W / 2 + sideW / 2), 0.06, 0);
    g.add(skirt);
  }

  const under = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, WIN_Y, WALL_T), wallMat);
  under.position.y = WIN_Y / 2;
  under.castShadow = true; under.receiveShadow = true;
  g.add(under);

  const skirtU = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, 0.12, WALL_T + 0.02), mat(0xb8b0a0, 0.9));
  skirtU.position.y = 0.06;
  g.add(skirtU);

  const aboveH = WALL_H - WIN_Y - WIN_H;
  const above = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, aboveH, WALL_T), wallMat);
  above.position.y = WIN_Y + WIN_H + aboveH / 2;
  above.castShadow = true; above.receiveShadow = true;
  g.add(above);

  // Marcos
  const ft = 0.12;
  const tExtra = WALL_T + 0.06; 
  const offsetZ = 0;

  // Marcos verticales
  for (const sign of [-1, 1]) {
    const jamba = new THREE.Mesh(new THREE.BoxGeometry(ft, WIN_H + ft * 2, tExtra), frameMat);
    jamba.position.set(sign * (WIN_W / 2 - ft / 2), WIN_Y + WIN_H / 2, offsetZ);
    jamba.castShadow = true;
    g.add(jamba);
  }

  // 🔥 MARCO INFERIOR CORREGIDO: Hundido 2 milímetros para que no choque con la pared de abajo
  const travesañoAbajo = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W, ft, tExtra),
    frameMat
  );
  travesañoAbajo.position.set(0, WIN_Y - ft / 2 + 0.002, offsetZ); 
  travesañoAbajo.castShadow = true;
  g.add(travesañoAbajo);

  // 🔥 MARCO SUPERIOR CORREGIDO: Hundido 2 milímetros
  const travesañoArriba = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W, ft, tExtra),
    frameMat
  );
  travesañoArriba.position.set(0, WIN_Y + WIN_H + ft / 2 - 0.002, offsetZ);
  travesañoArriba.castShadow = true;
  g.add(travesañoArriba);

  if (style === 'cruz' || style === 'grande' || style === 'mirador') {
    const cruzH = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, ft * 0.6, tExtra * 0.8), frameMat);
    cruzH.position.set(0, WIN_Y + WIN_H / 2, offsetZ);
    g.add(cruzH);

    const cruzV = new THREE.Mesh(new THREE.BoxGeometry(ft * 0.6, WIN_H, tExtra * 0.8), frameMat);
    cruzV.position.set(0, WIN_Y + WIN_H / 2, offsetZ);
    g.add(cruzV);
  } else if (style === 'arco') {
    const cruzH = new THREE.Mesh(new THREE.BoxGeometry(WIN_W, ft * 0.6, tExtra * 0.8), frameMat);
    cruzH.position.set(0, WIN_Y + WIN_H / 2, offsetZ);
    g.add(cruzH);
  } else if (style === 'circular') {
    const ring = new THREE.Mesh(new THREE.TorusGeometry(WIN_H / 2 - 0.1, ft * 0.6, 8, 24), frameMat);
    ring.position.set(0, WIN_Y + WIN_H / 2, offsetZ + 0.02);
    g.add(ring);
  }

  // 🔥 CRISTAL: Le quitamos 4 milímetros de alto y ancho para que nunca toque los marcos
  const glass = new THREE.Mesh(
    new THREE.BoxGeometry(WIN_W - ft * 2 - 0.004, WIN_H - ft * 2 - 0.004, 0.01),
    glassMat
  );
  glass.position.set(0, WIN_Y + WIN_H / 2, 0); 
  glass.renderOrder = 1; 
  g.add(glass);

  return g;
}

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
  // 🔥 EL ORIGEN DEBE ESTAR EN EL CENTRO DEL TECHO
  roof.position.y = 0; 
  g.add(roof);

  const edge = new THREE.Mesh(
    new THREE.BoxGeometry(ROOF_S + 0.15, ROOF_T * 0.5, ROOF_S + 0.15),
    edgeMat
  );
  edge.position.y = -ROOF_T * 0.35;
  edge.castShadow = true; edge.receiveShadow = true;
  g.add(edge);

  // Ya NO le sumamos WALL_H aquí, porque la altura la controla world.js
  return g;
}