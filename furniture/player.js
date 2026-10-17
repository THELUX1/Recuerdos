// furniture/player.js
import * as THREE from 'three';

export function createPlayer(color = '#4a90e2', gender = 'm', pantsColor = 0x334155, hairColor = 0x1c1917) {
  const g = new THREE.Group();
  const isF = gender === 'f';

  // Materiales
  const skinMat  = new THREE.MeshStandardMaterial({ color: 0xffdfc4, roughness: 0.6 });
  
  const shirtMat = new THREE.MeshStandardMaterial({ color: color, roughness: 0.7 });
  shirtMat.name = 'shirt'; 
  
  const pantsMat = new THREE.MeshStandardMaterial({ color: pantsColor, roughness: 0.8 });
  pantsMat.name = 'pants';
  
  // Las zapatillas usan el color del pantalón pero un poco más oscuro para contrastar
  const shoeMat  = new THREE.MeshStandardMaterial({ color: new THREE.Color(pantsColor).multiplyScalar(0.6), roughness: 0.5 });
  shoeMat.name = 'shoe';

  const shoeSoleMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.9 });
  
  const hairMat  = new THREE.MeshStandardMaterial({ color: hairColor, roughness: 0.9 });
  hairMat.name = 'hair';
  
  const eyeMat   = new THREE.MeshBasicMaterial({ color: 0x000000 });

  // Proporciones base
  const HEAD_R   = 0.17;
  const TORSO_W  = 0.36;
  const TORSO_H  = 0.45;
  const TORSO_D  = 0.22;
  
  const ARM_R    = isF ? 0.045 : 0.055; 
  const ARM_L    = isF ? 0.38 : 0.40;
  
  const LEG_R    = 0.075;
  const LEG_L    = 0.48;

  // ===== TORSO =====
  const torsoGeo = new THREE.CapsuleGeometry(TORSO_W / 2, TORSO_H - TORSO_W, 4, 12);
  torsoGeo.scale(1, 1, TORSO_D / TORSO_W);
  const torso = new THREE.Mesh(torsoGeo, shirtMat);
  torso.position.y = LEG_L + TORSO_H / 2;
  torso.castShadow = true; torso.receiveShadow = true;
  g.add(torso);

  // ===== CABEZA =====
  const headGroup = new THREE.Group();
  headGroup.position.y = LEG_L + TORSO_H + HEAD_R + 0.01;
  
  const head = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R, 24, 18), skinMat);
  head.castShadow = true;
  headGroup.add(head);

  // Pelo
  if (isF) {
    // Pelo femenino (casco trasero para no tapar la cara)
    const hairGeo = new THREE.SphereGeometry(HEAD_R + 0.02, 24, 18, 0, Math.PI * 2, 0, Math.PI * 0.6);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.01;
    hair.rotation.x = 0.1;
    hair.castShadow = true;
    headGroup.add(hair);
    
    // Mechones laterales
    for (const dx of [-1, 1]) {
      const lock = new THREE.Mesh(new THREE.SphereGeometry(HEAD_R * 0.4, 12, 12), hairMat);
      lock.position.set(dx * (HEAD_R - 0.02), -0.05, 0.02);
      lock.scale.set(0.8, 1.5, 0.8);
      lock.castShadow = true;
      headGroup.add(lock);
    }
  } else {
    // Pelo corto masculino
    const hairGeo = new THREE.SphereGeometry(HEAD_R + 0.015, 24, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const hair = new THREE.Mesh(hairGeo, hairMat);
    hair.position.y = 0.01;
    hair.rotation.x = -0.1;
    hair.castShadow = true;
    headGroup.add(hair);
  }

  // Ojos
  const eyeGeo = new THREE.SphereGeometry(0.02, 8, 8);
  for (const dx of [-0.06, 0.06]) {
    const eye = new THREE.Mesh(eyeGeo, eyeMat);
    eye.position.set(dx, 0.02, HEAD_R - 0.01);
    eye.scale.set(1, 1.3, 0.5);
    headGroup.add(eye);
  }

  g.add(headGroup);

  // ===== BRAZOS =====
  const shoulderY = LEG_L + TORSO_H - 0.02;

  function makeArm(sign) {
    const pivot = new THREE.Group();
    pivot.position.set(sign * (TORSO_W / 2 + ARM_R * 0.6), shoulderY, 0);

    const armGeo = new THREE.CapsuleGeometry(ARM_R, ARM_L - ARM_R * 2, 8, 12);
    const armMesh = new THREE.Mesh(armGeo, shirtMat);
    armMesh.position.y = -ARM_L / 2;
    armMesh.castShadow = true;
    pivot.add(armMesh);

    const handR = isF ? ARM_R * 0.95 : ARM_R * 1.1;
    const hand = new THREE.Mesh(new THREE.SphereGeometry(handR, 12, 10), skinMat);
    hand.position.y = -ARM_L;
    hand.castShadow = true;
    pivot.add(hand);

    return { pivot, mesh: armMesh };
  }

  const armL = makeArm(-1);
  const armR = makeArm( 1);
  g.add(armL.pivot);
  g.add(armR.pivot);

  // ===== PIERNAS =====
  function makeLeg(sign) {
    const pivot = new THREE.Group();
    pivot.position.set(sign * (LEG_R + 0.02), LEG_L, 0);

    const legGeo = new THREE.CapsuleGeometry(LEG_R, LEG_L - LEG_R * 2 - 0.05, 8, 12);
    const legMesh = new THREE.Mesh(legGeo, pantsMat);
    legMesh.position.y = -LEG_L / 2 + 0.05;
    legMesh.castShadow = true;
    pivot.add(legMesh);

    // Zapatillas
    const shoe = new THREE.Mesh(new THREE.BoxGeometry(LEG_R * 2.2, 0.1, LEG_R * 3.2), shoeMat);
    shoe.position.set(0, -LEG_L + 0.05, LEG_R * 0.6);
    shoe.castShadow = true;
    pivot.add(shoe);
    
    // Suela
    const sole = new THREE.Mesh(new THREE.BoxGeometry(LEG_R * 2.25, 0.03, LEG_R * 3.25), shoeSoleMat);
    sole.position.set(0, -LEG_L + 0.015, LEG_R * 0.6);
    pivot.add(sole);

    // Punta
    const toe = new THREE.Mesh(new THREE.SphereGeometry(LEG_R * 1.1, 12, 8), shoeMat);
    toe.position.set(0, -LEG_L + 0.05, LEG_R * 2.1);
    toe.scale.set(1, 0.7, 1.2);
    toe.castShadow = true;
    pivot.add(toe);

    return { pivot, mesh: legMesh };
  }

  const legL = makeLeg(-1);
  const legR = makeLeg( 1);
  g.add(legL.pivot);
  g.add(legR.pivot);

  g.userData.brazoIzq = armL.pivot;
  g.userData.brazoDer = armR.pivot;
  g.userData.piernaIzq = legL.pivot;
  g.userData.piernaDer = legR.pivot;

  return g;
}