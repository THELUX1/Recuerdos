// furniture/floors.js
import * as THREE from 'three';

const S = 16;   // tamaño del piso (coincide con PLOT_SIZE)
const THICKNESS = 0.2; // 🔥 NUEVO: Grosor del piso (20 cm)

/* Crea una geometría de caja S×S con un hueco rectangular. */
function makeFloorWithHole(x, z, w, d) {
  // Como ahora es una caja con grosor, usamos ExtrudeGeometry para darle volumen
  const shape = new THREE.Shape();
  shape.moveTo(-S / 2, -S / 2);
  shape.lineTo( S / 2, -S / 2);
  shape.lineTo( S / 2,  S / 2);
  shape.lineTo(-S / 2,  S / 2);
  shape.lineTo(-S / 2, -S / 2);

  const hole = new THREE.Path();
  hole.moveTo(x - w / 2, z - d / 2);
  hole.lineTo(x + w / 2, z - d / 2);
  hole.lineTo(x + w / 2, z + d / 2);
  hole.lineTo(x - w / 2, z + d / 2);
  hole.lineTo(x - w / 2, z - d / 2);

  shape.holes.push(hole);

  const geo = new THREE.ExtrudeGeometry(shape, {
    depth: THICKNESS,
    bevelEnabled: false
  });
  
  // Acostamos la geometría y la centramos para que el origen quede en el centro
  geo.rotateX(-Math.PI / 2);
  geo.translate(0, -THICKNESS / 2, 0); // Centrar el grosor
  return geo;
}

function makePisoMaterial(type, color) {
  // Ya no necesitamos DoubleSide porque ahora es una caja sólida
  const base = { };

  switch (type) {
    case 'piso_madera':   return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0x8a5a35, roughness: 0.85 });
    case 'piso_baldosa':  return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0xd8d8d8, roughness: 0.6 });
    case 'piso_cesped':   return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0x4a7a3a, roughness: 0.95 });
    case 'piso_piedra':   return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0x8a8a8a, roughness: 0.95 });
    case 'piso_azulejo':  return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0xa8c8e0, roughness: 0.4 });
    case 'piso_liso':     return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0xe8e0d0, roughness: 0.35 });
    default:              return new THREE.MeshStandardMaterial({ ...base, color: color ?? 0xcccccc, roughness: 0.8 });
  }
}

function buildFloor(type, color, holeSpec) {
  const g = new THREE.Group();
  const mat = makePisoMaterial(type, color);

  let geo;
  if (holeSpec) {
    geo = makeFloorWithHole(holeSpec.x, holeSpec.z, holeSpec.w, holeSpec.d);
  } else {
    // 🔥 CAJA SÓLIDA EN LUGAR DE PLANO
    geo = new THREE.BoxGeometry(S, THICKNESS, S);
    geo.translate(0, -THICKNESS / 2, 0); // El origen (Y=0) es la superficie superior
  }

  const mesh = new THREE.Mesh(geo, mat);
  mesh.position.y = 0;
  mesh.receiveShadow = true;
  mesh.castShadow = true;
  g.add(mesh);

  // GUARDAMOS LOS DATOS DEL HUECO PARA LA FÍSICA
  if (holeSpec) {
    g.userData.hole = {
      x: holeSpec.x,
      z: holeSpec.z, 
      w: holeSpec.w,
      d: holeSpec.d
    };
  }

  // Detalles decorativos (solo si no hay hueco)
  if (!holeSpec) {
    if (type === 'piso_madera') {
      const lineMat = new THREE.MeshStandardMaterial({
        color: 0x6a4220, roughness: 0.9,
      });
      for (let i = 1; i < 16; i++) {
        const line = new THREE.Mesh(new THREE.PlaneGeometry(0.03, S), lineMat);
        line.rotation.x = -Math.PI / 2;
        line.position.set(-S/2 + i, 0.001, 0); // 1 mm por encima de la superficie
        g.add(line);
      }
    } else if (type === 'piso_baldosa') {
      const groutMat = new THREE.MeshStandardMaterial({
        color: 0x8a8a8a, roughness: 0.9,
      });
      for (let i = 1; i < 20; i++) {
        const lineH = new THREE.Mesh(new THREE.PlaneGeometry(S, 0.03), groutMat);
        lineH.rotation.x = -Math.PI / 2;
        lineH.position.set(0, 0.001, -S/2 + i * 0.8);
        g.add(lineH);

        const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.03, S), groutMat);
        lineV.rotation.x = -Math.PI / 2;
        lineV.position.set(-S/2 + i * 0.8, 0.001, 0);
        g.add(lineV);
      }
    } else if (type === 'piso_azulejo') {
      const groutMat = new THREE.MeshStandardMaterial({
        color: 0x6a8aa0, roughness: 0.9,
      });
      for (let i = 1; i < 32; i++) {
        const lineH = new THREE.Mesh(new THREE.PlaneGeometry(S, 0.015), groutMat);
        lineH.rotation.x = -Math.PI / 2;
        lineH.position.set(0, 0.001, -S/2 + i * 0.5);
        g.add(lineH);

        const lineV = new THREE.Mesh(new THREE.PlaneGeometry(0.015, S), groutMat);
        lineV.rotation.x = -Math.PI / 2;
        lineV.position.set(-S/2 + i * 0.5, 0.001, 0);
        g.add(lineV);
      }
    }
  }

  return g;
}

export function createFloor(type, color = null) {
  // Hueco de escalera: esquina (+X, -Z), pegado al fondo
  if (type === 'piso_hueco_escalera') {
    const finalColor = typeof color === 'string' ? color : (color?.color ?? null);
    
    const anchoHueco = 1.8;   
    const largoHueco = 3.2;   
    const pasilloFondo = 1.0; 
    
    const esquinaX = S / 2 - anchoHueco / 2 - 0.1;   
    const esquinaZ = -S / 2 + pasilloFondo + largoHueco / 2; 
    
    return buildFloor('piso_madera', finalColor, {
      x: esquinaX,
      z: esquinaZ,
      w: anchoHueco,
      d: largoHueco,
    });
  }

  // Hueco de ascensor: esquina (-X, +Z)
  if (type === 'piso_hueco_ascensor') {
    const finalColor = typeof color === 'string' ? color : (color?.color ?? null);
    const esquinaX = -S / 2 + 2.4 / 2 + 0.1;
    const esquinaZ =  S / 2 - 2.4 / 2 - 0.1;
    return buildFloor('piso_baldosa', finalColor, {
      x: esquinaX,
      z: esquinaZ,
      w: 2.4,
      d: 2.4,
    });
  }

  const finalColor = typeof color === 'string' ? color : (color?.color ?? null);
  return buildFloor(type, finalColor, null);
}