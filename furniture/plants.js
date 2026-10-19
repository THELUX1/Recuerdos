// furniture/plants.js
import * as THREE from 'three';
import { mat } from './_helpers.js';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

// ==========================================
// SISTEMA DE CARGA DE MODELOS 3D (.glb)
// ==========================================
const modelsCache = {};
const loader = new GLTFLoader();

export function preloadPlantModels() {
  const modelsToLoad = {};

  // Árboles (01 al 06)
  for (let i = 1; i <= 6; i++) {
    const id = `arbol0${i}`;
    modelsToLoad[id] = `modelos/naturaleza/arbol0${i}.glb`;
  }
  // Pinos (01 al 03)
  for (let i = 1; i <= 3; i++) {
    const id = `pino0${i}`;
    modelsToLoad[id] = `modelos/naturaleza/pino0${i}.glb`;
  }
  // Árboles muertos (01 al 03)
  for (let i = 1; i <= 3; i++) {
    const id = `muerto0${i}`;
    modelsToLoad[id] = `modelos/naturaleza/muerto0${i}.glb`;
  }
  // Arbustos (01 al 04)
  for (let i = 1; i <= 4; i++) {
    const id = `arbusto0${i}`;
    modelsToLoad[id] = `modelos/naturaleza/arbusto0${i}.glb`;
  }
  // 🔥 NUEVO: Pasto (01 al 11)
  for (let i = 1; i <= 11; i++) {
    const id = `pasto${String(i).padStart(2, '0')}`;
    modelsToLoad[id] = `modelos/naturaleza/pasto${String(i).padStart(2, '0')}.glb`;
  }

  // Creamos un array de Promesas (una por cada modelo)
  const promises = Object.entries(modelsToLoad).map(([key, url]) => {
    return new Promise((resolve) => {
      loader.load(url, (gltf) => {
        gltf.scene.traverse(child => {
          if (child.isMesh) {
            child.castShadow = true;
            child.receiveShadow = true;
            if (child.material && child.material.map) {
              child.material.map.anisotropy = 1;
            }
          }
        });
        modelsCache[key] = gltf.scene;
        console.log(`✅ Modelo cargado con éxito: ${key}`);
        resolve(); // Resolvemos cuando este modelo termine
      }, undefined, () => {
        // Si el archivo no existe (404), también resolvemos para no bloquear el juego
        resolve();
      });
    });
  });

  // Retornamos una Promesa que espera a que TODOS se resuelvan
  return Promise.all(promises);
}

function getModel(key, defaultScale = 1, colorHex = null) {
  if (!modelsCache[key]) return null;
  
  const clone = modelsCache[key].clone();
  clone.scale.set(defaultScale, defaultScale, defaultScale);
  clone.position.y = 0;

  if (colorHex) {
    clone.traverse(child => {
      if (child.isMesh && child.material) {
        child.material = child.material.clone();
        child.material.color.set(colorHex);
      }
    });
  }
  return clone;
}

// ==========================================
// FUNCIONES ORIGINALES (Fallback geométrico)
// ==========================================

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
    puff.position.set((Math.random() - 0.5) * 0.4, 0.35 + Math.random() * 0.15, (Math.random() - 0.5) * 0.4);
    puff.scale.y = 0.9 + Math.random() * 0.15;
    puff.castShadow = true; puff.receiveShadow = true;
    g.add(puff);
  }
  return g;
}

export function createSmallTree(color) {
  const g = new THREE.Group();
  const trunkMat = mat(0x6b4a2f, 0.9);
  const leafDarkMat  = mat(color ?? 0x3a7a3a, 0.85);
  const leafLightMat = mat(0x5a9a4a, 0.85);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.10, 0.18, 1.4, 10), trunkMat);
  trunk.position.y = 0.7; trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);
  const layers = [ { y: 1.6, r: 0.62, dx: 0, dz: 0 }, { y: 1.9, r: 0.55, dx: 0.25, dz: 0.15 }, { y: 2.0, r: 0.52, dx: -0.25, dz: -0.15 }, { y: 2.3, r: 0.48, dx: 0, dz: 0 } ];
  for (let i = 0; i < layers.length; i++) {
    const l = layers[i];
    const leaf = new THREE.Mesh(new THREE.SphereGeometry(l.r, 12, 10), i % 2 === 0 ? leafDarkMat : leafLightMat);
    leaf.position.set(l.dx, l.y, l.dz); leaf.scale.set(1, 0.9, 1); leaf.castShadow = true; leaf.receiveShadow = true;
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
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.42, 3.2, 14), trunkMat);
  trunk.position.y = 1.6; trunk.castShadow = true; trunk.receiveShadow = true;
  g.add(trunk);
  const layers = [ { y: 3.2, count: 5, r: 0.85, spread: 0.9 }, { y: 3.9, count: 4, r: 0.75, spread: 0.8 }, { y: 4.5, count: 3, r: 0.65, spread: 0.6 }, { y: 5.1, count: 2, r: 0.55, spread: 0.4 } ];
  for (let li = 0; li < layers.length; li++) {
    const layer = layers[li];
    const leafMat = li % 3 === 0 ? leafDarkMat : (li % 3 === 1 ? leafMidMat : leafLightMat);
    for (let i = 0; i < layer.count; i++) {
      const a = (i / layer.count) * Math.PI * 2 + Math.random() * 0.4;
      const leaf = new THREE.Mesh(new THREE.SphereGeometry(layer.r, 14, 12), leafMat);
      leaf.position.set(Math.cos(a) * layer.spread, layer.y + Math.random() * 0.1, Math.sin(a) * layer.spread);
      leaf.scale.set(1, 0.85, 1); leaf.castShadow = true; leaf.receiveShadow = true;
      g.add(leaf);
    }
  }
  return g;
}

export function createBigTreeHD(color) { return createBigTree(color); }
export function createSmallTreeHD(color) { return createSmallTree(color); }
export function createBushHD(color) { return createBush(color); }

// ==========================================
// FUNCIONES DE CARGA .GLB (CON ESCALA CORREGIDA)
// ==========================================

export function createTreeFromGLB(style, quality, color) {
  let num = style ? Number(style) : 0;
  if (!num || num < 1 || num > 6) num = Math.floor(Math.random() * 6) + 1;
  const key = `arbol${String(num).padStart(2, '0')}`;
  
  const model = getModel(key, 0.8, color); 
  
  if (model) return model;
  return quality === 'alta' ? createBigTreeHD(color) : createBigTree(color);
}

export function createPineFromGLB(style, quality, color) {
  let num = style ? Number(style) : 0;
  if (!num || num < 1 || num > 3) num = Math.floor(Math.random() * 3) + 1;
  const key = `pino${String(num).padStart(2, '0')}`;
  
  const model = getModel(key, 0.8, color);
  
  if (model) return model;
  return quality === 'alta' ? createSmallTreeHD(color) : createSmallTree(color);
}

export function createBushFromGLB(style, quality, color) {
  let num = style ? Number(style) : 0;
  if (!num || num < 1 || num > 4) num = Math.floor(Math.random() * 4) + 1;
  const key = `arbusto${String(num).padStart(2, '0')}`;
  
  const model = getModel(key, 0.6, color);
  
  if (model) return model;
  return quality === 'alta' ? createBushHD(color) : createBush(color);
}

export function createDeadTreeFromGLB(style, quality, color) {
  let num = style ? Number(style) : 0;
  if (!num || num < 1 || num > 3) num = Math.floor(Math.random() * 3) + 1;
  const key = `muerto${String(num).padStart(2, '0')}`;
  
  const model = getModel(key, 0.8, color);
  
  if (model) return model;
  
  // Fallback: Tronco seco geométrico
  const g = new THREE.Group();
  const trunkMat = mat(0x4a3a2a, 0.9);
  const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.2, 2, 6), trunkMat);
  trunk.position.y = 1; trunk.castShadow = true;
  g.add(trunk);
  return g;
}

// ==========================================
// ALIAS DE COMPATIBILIDAD
// ==========================================

export const createBigTreeGLB = (style) => createTreeFromGLB(style);
export const createSmallTreeGLB = (style) => createPineFromGLB(style);
export const createBushGLB = (style) => createBushFromGLB(style);
// Exportamos una función para que terrain.js pueda leer los modelos ya cargados
export function getCachedModel(key) {
  if (!modelsCache[key]) return null;
  return modelsCache[key];
}