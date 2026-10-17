// avatar-viewer.js
import * as THREE from 'three';
import { createPlayer } from './furniture/player.js';

export class AvatarViewer {
  constructor(canvasId, save) {
    this.canvas = document.getElementById(canvasId);
    this.save = save;
    
    const rect = this.canvas.getBoundingClientRect();
    const width = rect.width || 200;
    const height = rect.height || 240;

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, alpha: true, antialias: true });
    this.renderer.setSize(width, height, false); 
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(35, width / height, 0.1, 10);
    this.camera.position.set(0, 0.9, 2.4);
    this.camera.lookAt(0, 0.8, 0);

    this.scene.add(new THREE.AmbientLight(0xffffff, 0.7));

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.5);
    dirLight.position.set(2, 4, 3);
    dirLight.castShadow = true;
    this.scene.add(dirLight);

    const fillLight = new THREE.DirectionalLight(0x88bbff, 0.8);
    fillLight.position.set(-2, 2, -1);
    this.scene.add(fillLight);

    const floorGeo = new THREE.CylinderGeometry(0.7, 0.7, 0.05, 32);
    const floorMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
    const floor = new THREE.Mesh(floorGeo, floorMat);
    floor.position.y = -0.025;
    floor.receiveShadow = true;
    this.scene.add(floor);

    // Iniciamos con todo guardado
    this.avatar = createPlayer(
      this.save.playerColor || '#4a90e2', 
      this.save.playerGender || 'm',
      this.save.pantsColor || 0x334155,
      this.save.hairColor || 0x1c1917
    );
    this.scene.add(this.avatar);

    this.clock = new THREE.Clock();
    this.isActive = false;
  }

  start() {
    this.isActive = true;
    const animate = () => {
      if (!this.isActive) return;
      requestAnimationFrame(animate);
      const dt = this.clock.getDelta();
      
      this.avatar.rotation.y += dt * 0.6;
      const t = performance.now() / 600;
      this.avatar.position.y = Math.sin(t) * 0.015;

      this.renderer.render(this.scene, this.camera);
    };
    animate();
  }

  stop() {
    this.isActive = false;
  }

  updateColor(type, newColor) {
    if (!this.avatar) return;
    this.avatar.traverse((child) => {
      if (child.isMesh && child.material) {
        if (child.material.name === type) {
          if (type === 'shoe') {
            // Si pintamos el pantalón, las zapas se oscurecen
            child.material.color.set(newColor).multiplyScalar(0.6);
          } else {
            child.material.color.set(newColor);
          }
        }
      }
    });
  }

  updateGender(newGender) {
    if (!this.avatar) return;
    const currentRot = this.avatar.rotation.y;
    this.scene.remove(this.avatar);
    
    this.avatar = createPlayer(
      this.save.playerColor || '#4a90e2', 
      newGender,
      this.save.pantsColor || 0x334155,
      this.save.hairColor || 0x1c1917
    );
    this.avatar.rotation.y = currentRot;
    this.scene.add(this.avatar);
  }
}