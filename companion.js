// companion.js
import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

export class Companion {
  constructor(scene) {
    this.scene = scene;
    this.model = null;
    this.mixer = null;
    this.actions = {};
    this.currentAction = null;
    
    this.speed = 2.5;
    this.minDistToPlayer = 1.5;
    this.clock = new THREE.Clock();
    
    this.loaded = false;
  }

  async load(modelUrl) {
    if (this.loaded) return;

    const loader = new GLTFLoader();
    try {
      // 1. Cargar el modelo
      const gltf = await loader.loadAsync(modelUrl);
      this.model = gltf.scene;

      // 2. Configuración de escala y posición
      // ⚠️ Ajusta el 0.03 si necesitas que sea más grande o pequeño
      this.model.scale.set(0.002, 0.002, 0.002); 
      
      // ⚠️ Si el perro flota, cámbialo a un número negativo (ej: -0.1). Si se hunde, ponle 0.1.
      this.model.position.y = 0; 
      
      // Aparece un poco lejos para no bloquear la cámara al comprarlo
      this.model.position.set(0, this.model.position.y, 10);
      
      this.model.traverse(child => {
        if (child.isMesh) {
          child.castShadow = true;
          child.receiveShadow = true;
          // Optimizar texturas para móvil
          if (child.material && child.material.map) {
            child.material.map.anisotropy = 1; 
          }
        }
      });

      // 3. Cargar animaciones nativas (Sin subclip para evitar congelamientos)
      if (gltf.animations && gltf.animations.length > 0) {
        this.mixer = new THREE.AnimationMixer(this.model);
        
        // Buscar animaciones por nombre (KayKit las trae separadas)
        const findAnim = (name) => gltf.animations.find(a => a.name.toLowerCase().includes(name));
        
        const idleAnim = findAnim('idle') || gltf.animations[0];
        const walkAnim = findAnim('walk') || gltf.animations[1] || idleAnim;

        if (idleAnim) {
          this.actions.idle = this.mixer.clipAction(idleAnim);
          this.actions.idle.setLoop(THREE.LoopRepeat, Infinity);
          this.currentAction = this.actions.idle;
          this.currentAction.play();
        }

        if (walkAnim) {
          this.actions.walk = this.mixer.clipAction(walkAnim);
          this.actions.walk.setLoop(THREE.LoopRepeat, Infinity);
        }
      }

      // 4. Añadir a la escena
      this.scene.add(this.model);
      this.loaded = true;

      console.log('🐾 Mascota cargada correctamente.');
    } catch (e) {
      console.error('❌ Error al cargar la mascota:', e);
    }
  }

  update(playerPos) {
    if (!this.model || !this.loaded || !playerPos) return;
    if (isNaN(playerPos.x) || isNaN(playerPos.z)) return;

    let delta = this.clock.getDelta();
    if (delta > 0.1) delta = 0.1; // Evitar saltos de tiempo que congelen

    if (this.mixer) this.mixer.update(delta);

    const targetPos = new THREE.Vector3(playerPos.x, 0, playerPos.z);
    const currentPos = new THREE.Vector3(this.model.position.x, 0, this.model.position.z);
    const dist = currentPos.distanceTo(targetPos);

    if (dist > this.minDistToPlayer) {
      const dir = new THREE.Vector3().subVectors(targetPos, currentPos);
      if (dir.lengthSq() > 0.001) {
        dir.normalize();
        this.model.position.x += dir.x * this.speed * delta;
        this.model.position.z += dir.z * this.speed * delta;

        // Rotar hacia el jugador
        const targetAngle = Math.atan2(dir.x, dir.z);
        let diff = targetAngle - this.model.rotation.y;
        while (diff > Math.PI)  diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this.model.rotation.y += diff * Math.min(1, 10 * delta);

        this._playAnim('walk');
      }
    } else {
      this._playAnim('idle');
    }
  }

  _playAnim(name) {
    const newAction = this.actions[name];
    if (!newAction || this.currentAction === newAction) return;

    if (this.currentAction) this.currentAction.fadeOut(0.2);
    newAction.reset().fadeIn(0.2).play();
    this.currentAction = newAction;
  }

  destroy() {
    if (this.model) {
      this.scene.remove(this.model);
      if (this.mixer) this.mixer.stopAllAction();
      this.model = null;
      this.mixer = null;
      this.loaded = false;
      this.actions = {};
      this.currentAction = null;
    }
  }
}