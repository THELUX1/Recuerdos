// furniture/lights.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

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

  g.userData.ceilingMount = true;
  g.userData.originAt = 'center';

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

  g.userData.ceilingMount = true;
  g.userData.originAt = 'center';

  return g;
}

/** Reflector LED rectangular, tipo aplique de exterior.
 *  IMPORTANTE: el origen del grupo está en la CARA TRASERA
 *  (que va contra el muro). El cuerpo crece hacia +Z.
 */
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

  // Placa posterior (contra el muro)
  const plate = new THREE.Mesh(
    new THREE.BoxGeometry(0.16, 0.28, 0.02),
    plateMat
  );
  plate.position.set(0, 0, 0.01);
  g.add(plate);

  const body = new THREE.Mesh(
    new THREE.BoxGeometry(0.14, 0.26, 0.09),
    blackMat
  );
  body.position.set(0, 0, 0.02 + 0.045);
  body.castShadow = true;
  g.add(body);

  for (const dy of [-0.14, 0.14]) {
    const fin = new THREE.Mesh(
      new THREE.BoxGeometry(0.14, 0.03, 0.11),
      blackMat
    );
    fin.position.set(0, dy, 0.02 + 0.045);
    fin.castShadow = true;
    g.add(fin);
  }

  const lens = new THREE.Mesh(
    new THREE.BoxGeometry(0.11, 0.2, 0.02),
    glassMat
  );
  lens.position.set(0, 0, 0.02 + 0.09 + 0.01);
  g.add(lens);

  const led = new THREE.Mesh(
    new THREE.PlaneGeometry(0.09, 0.18),
    new THREE.MeshBasicMaterial({ color: 0xfffce0 })
  );
  led.position.set(0, 0, 0.02 + 0.09 + 0.021);
  g.add(led);

  const mainLight = new THREE.PointLight(0xfff4d0, 3.5, 14, 1.6);
  mainLight.position.set(0, 0, 0.02 + 0.09 + 0.15);
  g.add(mainLight);

  const washLight = new THREE.PointLight(0xffe7b0, 1.2, 8, 1.5);
  washLight.position.set(0, -0.1, 0.1);
  g.add(washLight);

  g.userData.wallMount = true;
  g.userData.allowOutdoor = true;
  g.userData.wallHeight = 1.8;
  g.userData.originAt = 'back';

  return g;
}