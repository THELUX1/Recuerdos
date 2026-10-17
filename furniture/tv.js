// furniture/tv.js
import * as THREE from 'three';
import { mat, box } from './_helpers.js';

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
  g.userData.wallMount = true;
  g.userData.wallHeight = 1.6;
  g.userData.originAt = 'center';

  return g;
}