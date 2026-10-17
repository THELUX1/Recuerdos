// furniture/others.js
import * as THREE from 'three';
import { mat } from './_helpers.js';

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