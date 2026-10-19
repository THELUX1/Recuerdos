// terrain.js
import * as THREE from 'three';
import { preloadPlantModels, getCachedModel } from './furniture/plants.js';

export class Terrain {
  constructor(scene, quality = 'media') {
    this.scene = scene;
    this.quality = quality;
    
    this.WORLD_SIZE = 800; 
    this.HALF = this.WORLD_SIZE / 2;

    this.grass = null;
    this.scatterMeshes = {}; 
    
    // 🔥 SISTEMA DE COLISIONES (Solo físicas)
    this.allColliders = [];
    this.colliders = [];       
    this.collisionRadius = 15; 
    
    this.allScatterItems = [];
    this.lakes = [];

    this._defineLakes();
    this._buildGround();
    this._buildDistantMountains();
    this._setupFog();
    this._scatterVegetation(); 
  }

  _defineLakes() {
    let attempts = 0;
    while (this.lakes.length < 4 && attempts < 100) {
      attempts++;
      const angle = Math.random() * Math.PI * 2;
      const dist = 150 + Math.random() * 150;
      const lakeX = Math.cos(angle) * dist;
      const lakeZ = Math.sin(angle) * dist;
      const radius = 15 + Math.random() * 20;
      this.lakes.push({ x: lakeX, z: lakeZ, radius: radius });
    }
  }

  _buildGround() {
  // 🔥 El material ahora usa vertexColors para mezclar tonos suavemente
  const grassMat = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, // Color base blanco para que los vertexColors se vean puros
    roughness: 1.0, 
    metalness: 0.0,
    vertexColors: true // 🔥 ACTIVAMOS COLORES POR VÉRTICE
  });
  
  if (this.quality === 'alta' || this.quality === 'ultra') {
    const c = document.createElement('canvas');
    c.width = 256; c.height = 256;
    const ctx = c.getContext('2d');
    ctx.fillStyle = '#4a7a4a'; ctx.fillRect(0, 0, 256, 256);
    for (let i = 0; i < 2000; i++) {
      ctx.fillStyle = Math.random() > 0.5 ? '#558a55' : '#3d6a3d';
      ctx.fillRect(Math.random() * 256, Math.random() * 256, 2, 2);
    }
    const tex = new THREE.CanvasTexture(c);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping;
    tex.repeat.set(200, 200); 
    grassMat.map = tex;
  }

  const geo = new THREE.PlaneGeometry(this.WORLD_SIZE, this.WORLD_SIZE, 200, 200);
  geo.rotateX(-Math.PI / 2);

  const pos = geo.attributes.position;
  
  // 🔥 CREAMOS EL ATRIBUTO DE COLOR PARA CADA VÉRTICE
  const colors = new Float32Array(pos.count * 3);
  const colorTemp = new THREE.Color();

  // Paleta de verdes (del más oscuro al más claro)
  const verdeOscuro = new THREE.Color(0x3d6a3d);
  const verdeMedio = new THREE.Color(0x4a7a4a);
  const verdeClaro = new THREE.Color(0x6aaa6a); // Verde claro para las zonas altas

  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const z = pos.getZ(i);
    const distanceFromCenter = Math.sqrt(x*x + z*z);
    let height = 0;
    
    if (distanceFromCenter > 40) {
      height = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.5 + Math.sin(x * 0.01) * Math.cos(z * 0.01) * 5;
    }

    for (const lake of this.lakes) {
      const dx = x - lake.x;
      const dz = z - lake.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < lake.radius) {
        const depressionFactor = 1 - (dist / lake.radius);
        height -= 3.5 * depressionFactor * depressionFactor;
      }
    }
    
    pos.setY(i, height);

    // 🔥 CALCULAR EL COLOR DEL VÉRTICE SEGÚN SU ALTURA Y POSICIÓN
    // Usamos una mezcla suave entre los 3 tonos de verde
    
    // 1. Factor por altura: a mayor altura, más claro
    let heightFactor = (height + 3.5) / 10.5; // Normalizamos entre -3.5 y 7
    heightFactor = Math.max(0, Math.min(1, heightFactor));
    
    // 2. Factor por "ruido" suave para variaciones naturales
    // Usamos senos con frecuencias diferentes para crear manchas suaves
    const noiseFactor = (
      Math.sin(x * 0.08) * Math.cos(z * 0.08) * 0.5 + 
      Math.sin(x * 0.15) * Math.cos(z * 0.12) * 0.3 +
      Math.sin(x * 0.03) * Math.cos(z * 0.04) * 0.2
    );
    
    // 3. Mezcla final: 50% altura, 50% ruido
    const blendFactor = Math.max(0, Math.min(1, (heightFactor + noiseFactor + 1) / 2));
    
    // 4. Interpolar entre verde oscuro y verde claro
    colorTemp.copy(verdeOscuro).lerp(verdeClaro, blendFactor);
    
    // Guardar el color en el array
    colors[i * 3] = colorTemp.r;
    colors[i * 3 + 1] = colorTemp.g;
    colors[i * 3 + 2] = colorTemp.b;
  }
  
  geo.computeVertexNormals();
  
  // 🔥 ASIGNAR LOS COLORES A LA GEOMETRÍA
  geo.setAttribute('color', new THREE.BufferAttribute(colors, 3));

  this.grass = new THREE.Mesh(geo, grassMat);
  this.grass.receiveShadow = true;
  this.scene.add(this.grass);
}

  _buildDistantMountains() {
    if (this.quality === 'baja') return;
    const mountainTexture = new THREE.TextureLoader().load('./montana.png');
    const mountainMat = new THREE.SpriteMaterial({ map: mountainTexture, color: 0xffffff, transparent: true, opacity: 0.9, fog: false });

    for (let i = 0; i < 24; i++) {
      const angle = (i / 24) * Math.PI * 2;
      const distance = 450 + Math.random() * 100; 
      const x = Math.cos(angle) * distance;
      const z = Math.sin(angle) * distance;
      const mountainSprite = new THREE.Sprite(mountainMat);
      const width = 200 + Math.random() * 150;
      const height = 100 + Math.random() * 80;
      mountainSprite.scale.set(width, height, 1);
      mountainSprite.position.set(x, height / 2 - 20, z);
      this.scene.add(mountainSprite);
    }
  }

  _setupFog() {
    const fogColor = 0xcfe4f5;
    if (this.quality === 'ultra') this.scene.fog = new THREE.FogExp2(fogColor, 0.001); 
    else if (this.quality === 'alta') this.scene.fog = new THREE.FogExp2(fogColor, 0.002); 
    else this.scene.fog = new THREE.FogExp2(fogColor, 0.004); 
  }

  getHeightAt(x, z) {
    const distanceFromCenter = Math.sqrt(x*x + z*z);
    let height = 0;
    if (distanceFromCenter > 40) {
      height = Math.sin(x * 0.05) * Math.cos(z * 0.05) * 2.5 + Math.sin(x * 0.01) * Math.cos(z * 0.01) * 5;
    }
    for (const lake of this.lakes) {
      const dx = x - lake.x;
      const dz = z - lake.z;
      const dist = Math.sqrt(dx*dx + dz*dz);
      if (dist < lake.radius) {
        const depressionFactor = 1 - (dist / lake.radius);
        height -= 3.5 * depressionFactor * depressionFactor;
      }
    }
    return height;
  }

  async _scatterVegetation() {
    await preloadPlantModels();
    await new Promise(resolve => setTimeout(resolve, 500));
    
    const density = (window.world && window.world.save) ? (window.world.save.foliageDensity || 'alta') : 'alta';
    let multiplier = 1.0;
    if (density === 'baja') multiplier = 0.2;
    else if (density === 'media') multiplier = 0.5;
    else if (density === 'alta') multiplier = 1.0;
    else if (density === 'extrema') multiplier = 2.5;

    const categories = {
      arbol: { prefix: 'arbol', count: 6, max: Math.floor(1600 * multiplier) },
      pino: { prefix: 'pino', count: 3, max: Math.floor(800 * multiplier) },
      muerto: { prefix: 'muerto', count: 3, max: Math.floor(200 * multiplier) },
      arbusto: { prefix: 'arbusto', count: 4, max: Math.floor(1200 * multiplier) },
      pasto: { prefix: 'pasto', count: 11, max: Math.floor((this.quality === 'ultra' ? 16000 : 6000) * multiplier) },
      flor: { prefix: 'flor', count: 4, max: Math.floor(2000 * multiplier) },
      piedra_pequena: { prefix: 'piedra_p', count: 1, max: Math.floor(800 * multiplier) },
      piedra_mediana: { prefix: 'piedra_m', count: 1, max: Math.floor(400 * multiplier) },
      piedra_grande: { prefix: 'piedra_g', count: 1, max: Math.floor(100 * multiplier) }
    };

    for (const [catName, catData] of Object.entries(categories)) {
      for (let i = 1; i <= catData.count; i++) {
        const id = `${catData.prefix}${String(i).padStart(2, '0')}`;
        let baseModel = getCachedModel(id);

        if (id.startsWith('piedra_')) {
          const geo = new THREE.DodecahedronGeometry(1, 0);
          const mat = new THREE.MeshStandardMaterial({ color: 0x888888, roughness: 0.9, flatShading: true });
          baseModel = new THREE.Mesh(geo, mat);
        }

        if (!baseModel) continue;

        let meshToInstance = null;
        baseModel.traverse((child) => {
          if (child.isMesh && child.geometry && child.material && !meshToInstance) meshToInstance = child;
        });

        if (!meshToInstance) continue;

        const maxInstances = Math.ceil(catData.max / catData.count) + 100;
        const instancedMesh = new THREE.InstancedMesh(meshToInstance.geometry, meshToInstance.material, maxInstances);
        
        // 🔥 SOMBRAS SOLO PARA ÁRBOLES GRANDES (Ahorra GPU)
        instancedMesh.castShadow = (id.startsWith('arbol') || id.startsWith('pino'));
        instancedMesh.receiveShadow = false;
        
        // 🔥 FRUSTUM CULLING DESACTIVADO: Todo se dibuja siempre, sin cálculos de cámara
        instancedMesh.frustumCulled = false; 
        instancedMesh.count = 0;

        this.scatterMeshes[id] = instancedMesh;
        this.scene.add(instancedMesh);
      }
    }
  }
  
  _createWaterTexture() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#2a7aaa'; ctx.fillRect(0, 0, 256, 256);
    ctx.strokeStyle = 'rgba(120, 200, 255, 0.5)'; ctx.lineWidth = 6; ctx.lineCap = 'round';
    for (let i = 0; i < 15; i++) {
      const y = Math.random() * 256;
      ctx.beginPath(); ctx.moveTo(-10, y);
      for (let x = 0; x < 256; x += 40) ctx.quadraticCurveTo(x + 20, y - 20, x + 40, y);
      ctx.stroke();
    }
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    for (let i = 0; i < 30; i++) {
      const x = Math.random() * 256; const y = Math.random() * 256; const radius = 2 + Math.random() * 4;
      ctx.beginPath(); ctx.arc(x, y, radius, 0, Math.PI * 2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.wrapS = tex.wrapT = THREE.RepeatWrapping; tex.repeat.set(3, 3); 
    return tex;
  }

  _createLakeAt(lake) {
    const raycaster = new THREE.Raycaster();
    raycaster.set(new THREE.Vector3(lake.x, 1000, lake.z), new THREE.Vector3(0, -1, 0));
    const hits = raycaster.intersectObject(this.grass, false);
    let bottomY = hits.length > 0 ? hits[0].point.y : this.getHeightAt(lake.x, lake.z);

    const sandRadius = lake.radius * 1.15; 
    const sandGeo = new THREE.RingGeometry(0.01, sandRadius, 64, 32);
    sandGeo.rotateX(-Math.PI / 2);
    const sandPos = sandGeo.attributes.position;
    for (let i = 0; i < sandPos.count; i++) {
      const worldX = lake.x + sandPos.getX(i);
      const worldZ = lake.z + sandPos.getZ(i);
      sandPos.setY(i, this.getHeightAt(worldX, worldZ) + 0.05); 
    }
    sandGeo.computeVertexNormals();

    const sandMat = new THREE.MeshStandardMaterial({ color: 0xc2b280, roughness: 1.0, side: THREE.DoubleSide, fog: false });
    const sand = new THREE.Mesh(sandGeo, sandMat);
    sand.position.set(lake.x, 0, lake.z);
    this.scene.add(sand);

    const waterRadius = lake.radius * 0.85; 
    const waterGeo = new THREE.CircleGeometry(waterRadius, 64); 
    const waterMat = new THREE.MeshStandardMaterial({ color: 0xffffff, map: this._createWaterTexture(), roughness: 0.9, metalness: 0.0, transparent: true, opacity: 0.95, side: THREE.DoubleSide, fog: false });
    const water = new THREE.Mesh(waterGeo, waterMat);
    water.rotation.x = -Math.PI / 2;
    water.position.set(lake.x, bottomY + 0.8, lake.z);
    this.scene.add(water);

    if (!this.waterMeshes) this.waterMeshes = [];
    this.waterMeshes.push({ mesh: water, bottomY });
  }

  // 🔥 CARGA TOTAL: Ya no hay chunks, dibujamos todo de una vez.
  loadAllChunks() {
    for (const item of this.allScatterItems) {
      if (!item._loaded) {
        this.spawnScatterItem(item.id, item.x, item.y, item.z, item.rotY, item.scale);
        item._loaded = true;
      }
    }
  }

  // 🔥 COLISIONES DINÁMICAS: Solo actualiza las colisiones cerca del jugador.
  updateColliders(playerPos) {
    this.colliders = []; 
    const r2 = this.collisionRadius * this.collisionRadius;
    for (const col of this.allColliders) {
      const dx = col.x - playerPos.x;
      const dz = col.z - playerPos.z;
      if (dx * dx + dz * dz < r2) this.colliders.push(col);
    }
  }

  spawnScatterItem(id, x, y, z, rotY, scale) {
    const mesh = this.scatterMeshes[id];
    if (!mesh) return;
    if (mesh.count >= mesh.instanceMatrix.count) return;

    const dummy = new THREE.Object3D();
    dummy.position.set(x, y - 0.5, z); 
    dummy.rotation.y = rotY;
    
    let baseScale = 1.0; let radius = 0;
    
    if (id.startsWith('arbol') || id.startsWith('pino')) { baseScale = 0.8; radius = 0.6; }
    else if (id.startsWith('muerto')) { baseScale = 0.8; radius = 0.4; }
    else if (id.startsWith('arbusto')) { baseScale = 0.6; radius = 0.3; }
    else if (id.startsWith('flor')) { baseScale = 0.8; }
    else if (id.startsWith('piedra_p')) { baseScale = 0.2; radius = 0.2; }
    else if (id.startsWith('piedra_m')) { baseScale = 0.5; radius = 0.5; }
    else if (id.startsWith('piedra_g')) { baseScale = 1.2; radius = 1.0; }
    
    dummy.scale.set(scale * baseScale, scale * baseScale, scale * baseScale);
    dummy.updateMatrix();

    mesh.setMatrixAt(mesh.count, dummy.matrix);
    mesh.count++;
    mesh.instanceMatrix.needsUpdate = true;

    // 🔥 GUARDAMOS EL COLISIONADOR EN LA LISTA GLOBAL
    if (radius > 0) {
      this.allColliders.push({ x: x, z: z, radius: radius * scale * baseScale });
    }
  }
}