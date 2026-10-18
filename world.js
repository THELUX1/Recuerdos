// world.js
import * as THREE from 'three';
import { Controls } from './controls.js';
import { createFurniture, place, createPlayer } from './furniture/index.js';
import { createFloor } from './furniture/floors.js';

export class World {
  constructor(save) {
    this.save = save;
    this.canvas = document.getElementById('scene');

    this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true, powerPreference: "high-performance" });
    
    const maxPixelRatio = save.quality === 'alta' ? 1.5 : (save.quality === 'media' ? 0.9 : 1);
    this.renderer.setPixelRatio(Math.min(devicePixelRatio, maxPixelRatio));
    
    this.renderer.setSize(innerWidth, innerHeight);
    this.renderer.shadowMap.enabled = save.quality !== 'baja';
    this.renderer.shadowMap.type = save.quality === 'alta' 
      ? THREE.PCFSoftShadowMap 
      : THREE.PCFShadowMap;
      
    this.renderer.shadowMap.autoUpdate = false;
    this.renderer.shadowMap.needsUpdate = true; 

    this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
    this.renderer.toneMappingExposure = 1.1;

    this.scene = new THREE.Scene();
    if (save.quality === 'alta') {
      this.scene.fog = new THREE.FogExp2(0xcfe4f5, 0.008);
    }
    this.camera = new THREE.PerspectiveCamera(70, innerWidth / innerHeight, 0.1, 500);
    this.camera.position.set(
      save.position.x ?? 0,
      save.position.y ?? 1.6,
      save.position.z ?? 22
    );

    this.controls = new Controls(this.camera, {
      yaw: save.rotation?.yaw ?? 0,
      pitch: save.rotation?.pitch ?? 0,
      sensitivity: 0.0035,
    });

    this.clock = new THREE.Clock();
    this.placed = [];
    this.ghost = null;
    this.selectedId = null;
    this.selectedColor = null;
    this.selectedStyle = null;

    this.editMode = false;
    this.editTarget = null;
    this.moveMode = false;
    this.manualRotY = 0;

    this.onPlaceRequest = null;
    this.onDeleteRequest = null;
    this.onTVSave = null;
    this.onFurniturePlaced = null;

    // Medios
    this.tvTarget = null;
    this.tvVideo = null;
    this.tvAudio = null;
    this.tvHls = null;
    this._audioVizRAF = null;
    this._toastTvTimer = null;
    this._tvSaveTimer = 0;
    this._lastShadowUpdate = 0;

    // FPS
    this._fpsFrames = 0;
    this._fpsElapsed = 0;

    this.audioMaxDist = 12;
    this.audioMinDist = 2;

    // Viento para el pasto
    this.windTime = 0;
    this.windSpeed = 0.5;
    this.windAmplitude = 0.05;

    /* ============================================================
       FÍSICA DEL JUGADOR
       ============================================================ */
    this.playerFeetY = (save.position?.y ?? 1.6) - 1.6;
    this.playerVelY = 0;
    this.GRAVITY = -18;
    this.JUMP_VELOCITY = 5.6;
    this.PLAYER_HEIGHT = 1.6;
    this._stepLerpSpeed = 18;

    this._avatarHeading = 0;
    this._walkPhase = 0;

    /* ============================================================
       ESTADO DE INTERACCIÓN
       ============================================================ */
    this.isSeated = false;
    this.isSleeping = false;
    this._interactTarget = null;
    this._savedStandPos = null;
    this._savedStandRot = null;

    /* ============================================================
       SUPERFICIES CAMINABLES
       ============================================================ */
    this._walkables = {
      techo_basico:         0.20,
      cama_basica:   0.43,
      cama_doble:    0.50,
      cama_premium:  0.63,
      cama_king:     0.70,
      mesa_basica:   0.80,
      mesa_redonda:  0.80,
      mesa_premium:  0.85,
      mesa_luz:      0.55,
      bajo_mesada_pileta: 0.90,
      cocina_gas:         0.92,
      cocina_electrica:   0.915,
      ropero:             2.00,
      alacena:            2.20,
    };

    this._surfaces = {
      mesa_basica:   0.80,
      mesa_redonda:  0.80,
      mesa_premium:  0.85,
      mesa_luz:      0.55,
      cama_basica:   0.45,
      cama_doble:    0.50,
      cama_premium:  0.65,
      cama_king:     0.70,
      muro_basico:   1.60,
      muro_premium:  1.60,
      muro_puerta:   1.60,
      muro_ventana:  1.60,
      muro_puerta_prem:  1.60,
      muro_ventana_prem: 1.60,
    };

    this._stackable = [
      'tv',
      'alacena_aerea',
      'luz_plafon',
      'luz_candelabro',
      'luz_aplique',
      'cuadro',
      'techo_ventilador',
    ];

    this._wallOnly = new Set([
      'alacena_aerea',
      'luz_plafon',
      'luz_candelabro',
      'luz_aplique',
      'cuadro',
    ]);

    this._outdoorAllowed = new Set([
      'luz_aplique',
      'parche_pasto',
      'flores',
      'arbusto',
      'arbol_chico',
      'arbol_grande',
      'planta_maceta',
    ]);

    this._wallMountHeight = {
      luz_plafon:     2.85,
      luz_candelabro: 2.85,
      luz_aplique:    1.80,
      alacena_aerea:  1.65,
      cuadro:         2.0,
      techo_ventilador: 3.0,
    };

    this._wallThickness = {
      player:    0.2,
      perimeter: 0.6,
    };

    this._wallMargin = 0.05;

    this._originAt = {
      tv:              'center',
      alacena_aerea:   'back',
      luz_plafon:      'center',
      luz_candelabro:  'center',
      luz_aplique:     'back',
      cuadro:          'back',
      techo_ventilador: 'center',
      parche_pasto:    'center',
      flores:          'center',
    };

    this._debugWallSnap = false;

    this._depthByType = {
      cama_basica:   1.00, cama_doble:    1.45, cama_premium:  1.60, cama_king:     1.90,
      mesa_basica:   0.80, mesa_redonda:  0.90, mesa_premium:  0.90, mesa_luz:      0.50,
      silla_basica:  0.45, silla_premium: 0.50, silla_oficina: 0.55,
      ropero:        0.60, alacena:       0.45,
      cocina_gas:    0.60, cocina_electrica: 0.60, bajo_mesada_pileta: 0.60, alacena_aerea: 0.40,
      lavavajillas:  0.60, horno_electrico:   0.60,
      pava_electrica: 0.20, licuadora:      0.20, ollas:          0.30, sarten:         0.30,
      luz_plafon:     0.25, luz_candelabro: 0.30, luz_aplique:    0.15,
      tv:             0.32, lampara:      0.35, lampara_mesa: 0.25, alfombra:     1.80,
      arbol_grande:  0.60, arbol_chico:   0.45, arbusto:       0.40, planta_maceta: 0.25,
      escalera_basica:  3.40, escalera_premium: 3.40,
      sofa:          0.85, mesa_ratona:   0.60, estanteria:    0.35, cuadro:        0.05, techo_ventilador: 0.30,
      parche_pasto:  1.20,
      flores:        0.40,
    };

    this._plotFloors  = {};
    this._floorMeshes = {};
    this._lastAppliedFloor = null;

    this.clouds = [];

    this.dayTime = save.dayTime ?? 0.30;
    this.daySpeed = 1 / 2400;

    this.LOT = 60;
    this.HALF = this.LOT / 2;
    this.WALL_H = 4.5;

    this.plots = [
      { index: 0, cx: -15, cz: -15 },
      { index: 1, cx:  15, cz: -15 },
      { index: 2, cx: -15, cz:  15 },
      { index: 3, cx:  15, cz:  15 },
    ];
    this.PLOT_SIZE = 16;

    this._windAngle = Math.random() * Math.PI * 2;
    this._windSpeed = 1.2;
    this._cloudWaveTimer = 0;

    // SISTEMA DE CLIMA
    this.currentWeather = 'despejado';
    this.targetWeather = 'despejado';
    this.weatherIntensity = 0;
    this.weatherTransitionSpeed = 0.2;
    this._lightningTimer = 0;
    this._stormFlashActive = false;

    this._buildSky();
    this._initWeather();
    this._prefillClouds(); // <-- NUEVO: Nubes ya presentes al iniciar
    
    if (this.save.weather && this.save.weather !== 'despejado') {
      this.targetWeather = this.save.weather;
      this.weatherIntensity = 1;
    }

    this._lights();
    this._buildNeighborhood();
    this._loadFurniture();
    this._loadPlotFloors();
    this._initPlacementTap();
    this._createHighlight();
    this._initInteractButton();
    this._initTVPanelEvents();
    this._initEditPanelEvents();

    this.playerAvatar = createPlayer('#4a90e2');
    this.playerAvatar.position.set(this.camera.position.x, this.playerFeetY, this.camera.position.z);
    this.playerAvatar.visible = false;
    this.scene.add(this.playerAvatar);

    addEventListener('resize', () => this._resize());
  }

   _initWeather() {
  // === LLUVIA ===
  const rainCount = 2000;
  const rainGeo = new THREE.BufferGeometry();
  const rainPos = new Float32Array(rainCount * 3);
  this._rainVelocities = new Float32Array(rainCount);
  
  for (let i = 0; i < rainCount; i++) {
    rainPos[i * 3] = (Math.random() - 0.5) * 80;
    rainPos[i * 3 + 1] = Math.random() * 30;
    rainPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
    this._rainVelocities[i] = 0.3 + Math.random() * 0.4;
  }
  rainGeo.setAttribute('position', new THREE.BufferAttribute(rainPos, 3));
  
  const rainMat = new THREE.PointsMaterial({
    color: 0xaaccff, size: 0.12, transparent: true, opacity: 0, depthWrite: false
  });
  this.rainSystem = new THREE.Points(rainGeo, rainMat);
  this.rainSystem.visible = false;
  this.rainSystem.position.set(0, 0, 0);
  this.rainSystem.frustumCulled = false;
  this.scene.add(this.rainSystem);

  // === NIEVE ===
  const snowCount = 1200;
  const snowGeo = new THREE.BufferGeometry();
  const snowPos = new Float32Array(snowCount * 3);
  
  for (let i = 0; i < snowCount; i++) {
    snowPos[i * 3] = (Math.random() - 0.5) * 80;
    snowPos[i * 3 + 1] = Math.random() * 30;
    snowPos[i * 3 + 2] = (Math.random() - 0.5) * 80;
  }
  snowGeo.setAttribute('position', new THREE.BufferAttribute(snowPos, 3));
  
  const snowMat = new THREE.PointsMaterial({
    color: 0xffffff, size: 0.28, transparent: true, opacity: 0, depthWrite: false
  });
  this.snowSystem = new THREE.Points(snowGeo, snowMat);
  this.snowSystem.visible = false;
  this.snowSystem.position.set(0, 0, 0);
  this.snowSystem.frustumCulled = false;
  this.scene.add(this.snowSystem);

  this._lightningTimer = 0;
  this._stormFlashActive = false;
  this._cloudBoosted = false;
  
  // === RAYOS ===
  this._lightningBolts = [];
  this._lightningCooldown = 5;
}

setWeather(type) {
  this.targetWeather = type;
}

_updateWeather(dt) {
  const targetIntensity = this.targetWeather === 'despejado' ? 0 : 1;
  if (this.weatherIntensity < targetIntensity) {
    this.weatherIntensity = Math.min(targetIntensity, this.weatherIntensity + this.weatherTransitionSpeed * dt);
  } else if (this.weatherIntensity > targetIntensity) {
    this.weatherIntensity = Math.max(targetIntensity, this.weatherIntensity - this.weatherTransitionSpeed * dt);
  }

  const isRain = this.targetWeather.includes('lluvia') || this.targetWeather === 'tormenta';
  const isSnow = this.targetWeather.includes('nieve');
  const isStorm = this.targetWeather === 'tormenta';
  const isIntense = this.targetWeather === 'lluvia_intensa' || this.targetWeather === 'nieve_intensa' || isStorm;

  // --- VISIBILIDAD ---
  if (isRain) {
    this.rainSystem.visible = this.weatherIntensity > 0.01;
    this.rainSystem.material.opacity = this.weatherIntensity * (isIntense ? 0.85 : 0.55);
    this.rainSystem.material.size = isIntense ? 0.18 : 0.12;
  } else if (this.weatherIntensity <= 0.01) {
    this.rainSystem.visible = false;
  }

  if (isSnow) {
    this.snowSystem.visible = this.weatherIntensity > 0.01;
    this.snowSystem.material.opacity = this.weatherIntensity * (isIntense ? 0.95 : 0.75);
    this.snowSystem.material.size = isIntense ? 0.38 : 0.28;
  } else if (this.weatherIntensity <= 0.01) {
    this.snowSystem.visible = false;
  }

  // --- MOVIMIENTO Y COLISIÓN ---
  const raycaster = new THREE.Raycaster();
  const rayDir = new THREE.Vector3(0, -1, 0);
  const roofMeshes = this.placed
    .filter(p => p.type === 'techo_basico')
    .map(p => p.obj);

  if (this.rainSystem.visible) {
    const pos = this.rainSystem.geometry.attributes.position.array;
    const speedMult = isIntense ? 90 : 60;
    
    for (let i = 0; i < this._rainVelocities.length; i++) {
      pos[i * 3 + 1] -= this._rainVelocities[i] * speedMult * dt;
      
      const dx = pos[i * 3] - this.camera.position.x;
      const dz = pos[i * 3 + 2] - this.camera.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      if (distToPlayer < 15 && pos[i * 3 + 1] < 5.0) {
        raycaster.set(new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]), rayDir);
        const hits = raycaster.intersectObjects(roofMeshes, true);
        
        if (hits.length > 0) {
          pos[i * 3 + 1] = 30;
          pos[i * 3] = (Math.random() - 0.5) * 80;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
          continue;
        }
      }

      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    this.rainSystem.geometry.attributes.position.needsUpdate = true;
  }

  if (this.snowSystem.visible) {
    const pos = this.snowSystem.geometry.attributes.position.array;
    const time = performance.now() * 0.001;
    const fallSpeed = isIntense ? 4 : 2.5;

    for (let i = 0; i < pos.length / 3; i++) {
      pos[i * 3 + 1] -= fallSpeed * dt;
      pos[i * 3] += Math.sin(time + i * 0.5) * 0.6 * dt;

      const dx = pos[i * 3] - this.camera.position.x;
      const dz = pos[i * 3 + 2] - this.camera.position.z;
      const distToPlayer = Math.hypot(dx, dz);

      if (distToPlayer < 15 && pos[i * 3 + 1] < 5.0) {
        raycaster.set(new THREE.Vector3(pos[i * 3], pos[i * 3 + 1], pos[i * 3 + 2]), rayDir);
        const hits = raycaster.intersectObjects(roofMeshes, true);
        
        if (hits.length > 0) {
          pos[i * 3 + 1] = 30;
          pos[i * 3] = (Math.random() - 0.5) * 80;
          pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
          continue;
        }
      }

      if (pos[i * 3 + 1] < 0) {
        pos[i * 3 + 1] = 30;
        pos[i * 3] = (Math.random() - 0.5) * 80;
        pos[i * 3 + 2] = (Math.random() - 0.5) * 80;
      }
    }
    this.snowSystem.geometry.attributes.position.needsUpdate = true;
  }

  // --- TORMENTA: DESTELLO GLOBAL Y RAYOS VISUALES ---
  if (isStorm && this.weatherIntensity > 0.5) {
    this._lightningTimer -= dt;
    this._lightningCooldown -= dt;
    
    // Destello global (relámpago de fondo)
    if (this._lightningTimer <= 0) {
      this._lightningTimer = 2 + Math.random() * 5;
      this._stormFlashActive = true;
      setTimeout(() => { this._stormFlashActive = false; }, 120);
    }
    
    // Rayo visual (tubo que cae)
    if (this._lightningCooldown <= 0) {
      this._lightningCooldown = 4 + Math.random() * 8;
      
      const boltGroup = new THREE.Group();
      const startX = (Math.random() - 0.5) * 80;
      const startZ = (Math.random() - 0.5) * 80;
      const endX = startX + (Math.random() - 0.5) * 10;
      const endZ = startZ + (Math.random() - 0.5) * 10;
      
      const points = [];
      const segments = 8;
      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const jitterX = (Math.random() - 0.5) * 2 * (1 - Math.abs(t - 0.5) * 2);
        const jitterZ = (Math.random() - 0.5) * 2 * (1 - Math.abs(t - 0.5) * 2);
        points.push(new THREE.Vector3(
          startX + (endX - startX) * t + jitterX,
          30 - t * 30,
          startZ + (endZ - startZ) * t + jitterZ
        ));
      }
      
      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeo = new THREE.TubeGeometry(curve, 20, 0.15, 4, false);
      const boltMat = new THREE.MeshBasicMaterial({ 
        color: 0xffffcc, 
        transparent: true, 
        opacity: 1,
        blending: THREE.AdditiveBlending
      });
      const boltMesh = new THREE.Mesh(tubeGeo, boltMat);
      boltGroup.add(boltMesh);
      
      const boltLight = new THREE.PointLight(0xffffcc, 50, 40, 1.5);
      boltLight.position.set(endX, 10, endZ);
      boltGroup.add(boltLight);
      
      this.scene.add(boltGroup);
      this._lightningBolts.push({ 
        group: boltGroup, 
        light: boltLight, 
        life: 0.3
      });
    }
  }

  // Actualizar rayos existentes (desvanecerse)
  for (let i = this._lightningBolts.length - 1; i >= 0; i--) {
    const bolt = this._lightningBolts[i];
    bolt.life -= dt;
    bolt.light.intensity = Math.max(0, bolt.life * 150);
    bolt.group.traverse(o => {
      if (o.isMesh && o.material) {
        o.material.opacity = Math.max(0, bolt.life * 3.33);
      }
    });
    if (bolt.life <= 0) {
      this.scene.remove(bolt.group);
      this._lightningBolts.splice(i, 1);
    }
  }

  // --- OCULTAR EL SOL CON MAL CLIMA ---
  if (this.sunMesh) {
    const sunTargetOpacity = this.weatherIntensity > 0.1 ? 0 : 1;
    const currentSunOpacity = parseFloat(this.sunMesh.material.opacity) || 0;
    this.sunMesh.material.opacity = currentSunOpacity + (sunTargetOpacity - currentSunOpacity) * Math.min(1, 2 * dt);
  }

  // --- GENERAR NUBES RÁPIDO CON MAL CLIMA ---
  if (this.weatherIntensity > 0.1 && !this._cloudBoosted) {
    this._cloudBoosted = true;
    for (let i = 0; i < 50; i++) {
      setTimeout(() => {
        const cloud = this._createCloud();
        const x = (Math.random() - 0.5) * 200;
        const z = (Math.random() - 0.5) * 200;
        const y = 40 + Math.random() * 25;
        cloud.position.set(x, y, z);
        
        const vx = Math.cos(this._windAngle) * this._windSpeed * 2;
        const vz = Math.sin(this._windAngle) * this._windSpeed * 2;
        cloud.userData.vx = vx;
        cloud.userData.vz = vz;
        
        const scale = 1.2 + Math.random() * 1.0;
        cloud.scale.set(scale, scale, scale);
        
        this.scene.add(cloud);
        this.clouds.push(cloud);
      }, i * 30);
    }
  } else if (this.weatherIntensity <= 0.1) {
    this._cloudBoosted = false;
  }
}
  _initEditPanelEvents() {
    const contentBtn = document.getElementById('editContent');
    const moveBtn = document.getElementById('editMove');
    const deleteBtn = document.getElementById('editDelete');
    const closeBtn = document.getElementById('editClose');

    if (contentBtn) {
      contentBtn.onclick = () => {
        if (this.editTarget && (this.editTarget.type === 'tv' || this.editTarget.type === 'cuadro')) {
          this.openTVPanel(this.editTarget, this.editTarget.type === 'cuadro');
        }
      };
    }
    if (moveBtn) moveBtn.onclick = () => this.startMove();
    if (deleteBtn) deleteBtn.onclick = () => this.deleteTarget();
    if (closeBtn) closeBtn.onclick = () => {
      this.setEditMode(false);
      document.getElementById('editPanel').style.display = 'none';
    };
  }

  _initTVPanelEvents() {
    const loadBtn = document.getElementById('tvLoad');
    const stopBtn = document.getElementById('tvStop');
    
    if (loadBtn) {
      loadBtn.onclick = () => {
        const url = document.getElementById('tvUrl').value;
        if (!url) return;
        if (this.tvTarget) {
          this.loadTVContent(this.tvTarget, url);
          this.saveMediaUrl(this.tvTarget, url);
        }
      };
    }

    if (stopBtn) {
      stopBtn.onclick = () => {
        if (this.tvTarget) {
          this.stopTVContent(this.tvTarget);
          this.saveMediaUrl(this.tvTarget, '');
        }
      };
    }
  }

  _initInteractButton() {
    const btn = document.getElementById('interactBtn');
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.interact();
    }, { passive: false });

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.interact();
    });

    btn.addEventListener('touchstart', () => btn.classList.add('active'), { passive: true });
    btn.addEventListener('touchend',   () => btn.classList.remove('active'));
    btn.addEventListener('touchcancel',() => btn.classList.remove('active'));
    btn.addEventListener('mousedown',  () => btn.classList.add('active'));
    btn.addEventListener('mouseup',    () => btn.classList.remove('active'));
    btn.addEventListener('mouseleave', () => btn.classList.remove('active'));
  }

  _findInteractableNearby(maxDist = 2.0) {
    let best = null;
    let bestDist = maxDist;

    for (const p of this.placed) {
      const interactive = p.obj?.userData?.interactive;
      if (!interactive) continue;

      const dx = this.camera.position.x - p.x;
      const dz = this.camera.position.z - p.z;
      const d = Math.hypot(dx, dz);

      if (d < bestDist) {
        bestDist = d;
        best = p;
      }
    }
    return best;
  }

  interact() {
    if (this.isSeated || this.isSleeping) {
      this._standUp();
      return;
    }

    const target = this._findInteractableNearby(2.0);
    if (!target) return;

    const kind = target.obj.userData.interactive;

    if (kind === 'painting') {
      this.openTVPanel(target, true);
      return;
    }

    if (kind !== 'seat' && kind !== 'sleep') return;

    this._savedStandPos = {
      x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z,
    };
    this._savedStandRot = {
      yaw: this.controls.yaw, pitch: this.controls.pitch,
    };

    this._interactTarget = target;
    const rot = target.rotY ?? 0;

    if (kind === 'seat') {
      const seatHeight = target.obj.userData.seatHeight ?? 0.52;
      const localOffset = new THREE.Vector3(0, 0, 0.05); 
      localOffset.applyAxisAngle(new THREE.Vector3(0, 1, 0), rot);

      const sitX = target.x + localOffset.x;
      const sitZ = target.z + localOffset.z;
      const sitY = target.y + seatHeight + this.PLAYER_HEIGHT - 0.2; 

      this.camera.position.set(sitX, sitY, sitZ);
      this.controls.yaw = rot;
      this.controls.pitch = 0;
      this.controls._applyRotation();
      this.playerFeetY = target.y + seatHeight - 0.2;

      this.isSeated = true;
      this.isSleeping = false;

      if (this.playerAvatar) {
        const piernaIzq = this.playerAvatar.userData.piernaIzq;
        const piernaDer = this.playerAvatar.userData.piernaDer;
        if (piernaIzq) piernaIzq.rotation.x = -Math.PI / 2;
        if (piernaDer) piernaDer.rotation.x = -Math.PI / 2;
      }

    } else if (kind === 'sleep') {
      const bedHeight = target.obj.userData.seatHeight ?? 0.45;
      const sitY = target.y + bedHeight + 0.4;

      this.camera.position.set(target.x, sitY, target.z);
      this.controls.yaw = rot + Math.PI / 2;
      this.controls.pitch = -0.4;
      this.controls._applyRotation();
      this.playerFeetY = target.y + bedHeight;

      this.isSleeping = true;
      this.isSeated = false;

      if (this.playerAvatar) {
        const piernaIzq = this.playerAvatar.userData.piernaIzq;
        const piernaDer = this.playerAvatar.userData.piernaDer;
        if (piernaIzq) piernaIzq.rotation.x = 0;
        if (piernaDer) piernaDer.rotation.x = 0;
      }
    }

    this._updateInteractBtn();
  }

  _standUp() {
    if (this._savedStandPos) {
      this.camera.position.set(this._savedStandPos.x, this._savedStandPos.y, this._savedStandPos.z);
      this.playerFeetY = this._savedStandPos.y - this.PLAYER_HEIGHT;
      this.playerVelY = 0;
    }
    if (this._savedStandRot) {
      this.controls.yaw = this._savedStandRot.yaw;
      this.controls.pitch = this._savedStandRot.pitch;
      this.controls._applyRotation();
    }

    this.isSeated = false;
    this.isSleeping = false;
    this._interactTarget = null;
    this._savedStandPos = null;
    this._savedStandRot = null;

    if (this.playerAvatar) {
      const piernaIzq = this.playerAvatar.userData.piernaIzq;
      const piernaDer = this.playerAvatar.userData.piernaDer;
      if (piernaIzq) piernaIzq.rotation.x = 0;
      if (piernaDer) piernaDer.rotation.x = 0;
    }
    this._updateInteractBtn();
  }

  _updateInteractBtn() {
    const btn = document.getElementById('interactBtn');
    if (!btn) return;

    if (this.isSeated || this.isSleeping) {
      btn.textContent = '🛑 Levantarse';
      btn.classList.add('visible');
      return;
    }

    const nearby = this._findInteractableNearby(2.0);
    if (nearby) {
      const kind = nearby.obj.userData.interactive;
      if (kind === 'seat') btn.textContent = '💬 Sentarse';
      else if (kind === 'sleep') btn.textContent = '💬 Acostarse';
      else if (kind === 'painting') btn.textContent = '🖼️ Configurar';
      btn.classList.add('visible');
    } else {
      btn.classList.remove('visible');
    }
  }

  _buildSky() {
    const skyGeo = new THREE.SphereGeometry(250, 32, 16);
    this.skyMat = new THREE.ShaderMaterial({
      side: THREE.BackSide,
      uniforms: {
        topColor:    { value: new THREE.Color(0x2d7ad6) },
        bottomColor: { value: new THREE.Color(0xcfe4f5) },
        offset:      { value: 20 },
        exponent:    { value: 0.6 },
      },
      vertexShader: `
        varying vec3 vWorldPosition;
        void main() {
          vec4 worldPosition = modelMatrix * vec4(position, 1.0);
          vWorldPosition = worldPosition.xyz;
          gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
      `,
      fragmentShader: `
        uniform vec3 topColor;
        uniform vec3 bottomColor;
        uniform float offset;
        uniform float exponent;
        varying vec3 vWorldPosition;
        void main() {
          float h = normalize(vWorldPosition + vec3(0.0, offset, 0.0)).y;
          gl_FragColor = vec4(mix(bottomColor, topColor, pow(max(h, 0.0), exponent)), 1.0);
        }
      `,
    });
    this.scene.add(new THREE.Mesh(skyGeo, this.skyMat));

    this.sunMesh = this._makeSunSprite();
    this.sunMesh.scale.set(28, 28, 1);
    this.scene.add(this.sunMesh);

    this.moonMesh = this._makeMoonSprite();
    this.moonMesh.scale.set(16, 16, 1);
    this.scene.add(this.moonMesh);

    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const positions = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      const phi = Math.acos(2 * Math.random() - 1);
      const theta = Math.random() * Math.PI * 2;
      const r = 240;
      positions[i * 3]     = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = Math.abs(r * Math.cos(phi)) + 20;
      positions[i * 3 + 2] = r * Math.sin(phi) * Math.sin(theta);
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    this.starMat = new THREE.PointsMaterial({
      color: 0xffffff, size: 1.2, transparent: true, opacity: 0,
      sizeAttenuation: false,
    });
    this.stars = new THREE.Points(starGeo, this.starMat);
    this.scene.add(this.stars);
  }

  _makeSunSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0.00, 'rgba(255, 252, 230, 1.00)');
    grad.addColorStop(0.15, 'rgba(255, 248, 210, 0.95)');
    grad.addColorStop(0.30, 'rgba(255, 235, 160, 0.55)');
    grad.addColorStop(0.55, 'rgba(255, 215, 110, 0.20)');
    grad.addColorStop(0.80, 'rgba(255, 200, 80, 0.05)');
    grad.addColorStop(1.00, 'rgba(255, 190, 60, 0.00)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    ctx.beginPath(); ctx.arc(128, 128, 36, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(255, 255, 245, 1)'; ctx.fill();
    ctx.strokeStyle = 'rgba(255, 245, 200, 0.35)'; ctx.lineWidth = 3; ctx.lineCap = 'round';
    for (let i = 0; i < 12; i++) {
      const a = (i / 12) * Math.PI * 2;
      ctx.beginPath();
      ctx.moveTo(128 + Math.cos(a) * 46, 128 + Math.sin(a) * 46);
      ctx.lineTo(128 + Math.cos(a) * 68, 128 + Math.sin(a) * 68);
      ctx.stroke();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: true, blending: THREE.AdditiveBlending, fog: false });
    return new THREE.Sprite(mat);
  }

  _makeMoonSprite() {
    const canvas = document.createElement('canvas');
    canvas.width = 256; canvas.height = 256;
    const ctx = canvas.getContext('2d');
    const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
    grad.addColorStop(0.00, 'rgba(245, 250, 255, 1.00)');
    grad.addColorStop(0.28, 'rgba(215, 230, 255, 0.85)');
    grad.addColorStop(0.55, 'rgba(160, 195, 240, 0.25)');
    grad.addColorStop(0.85, 'rgba(120, 160, 220, 0.05)');
    grad.addColorStop(1.00, 'rgba(100, 140, 200, 0.00)');
    ctx.fillStyle = grad; ctx.fillRect(0, 0, 256, 256);
    ctx.beginPath(); ctx.arc(128, 128, 55, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(242, 246, 255, 1)'; ctx.fill();
    ctx.fillStyle = 'rgba(200, 212, 232, 0.55)';
    const craters = [[110, 110, 8], [140, 120, 6], [120, 145, 10], [150, 140, 5], [105, 130, 4], [130, 105, 5]];
    for (const [cx, cy, r] of craters) {
      ctx.beginPath(); ctx.arc(cx, cy, r, 0, Math.PI * 2); ctx.fill();
    }
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent: true, depthWrite: false, depthTest: true, fog: false });
    return new THREE.Sprite(mat);
  }

  _createCloud() {
    const group = new THREE.Group();
    const mat = new THREE.MeshStandardMaterial({ color: 0xffffff, roughness: 1, metalness: 0, emissive: 0x556677, emissiveIntensity: 0.15 });
    const puffs = 4 + Math.floor(Math.random() * 6);
    for (let i = 0; i < puffs; i++) {
      const size = 3 + Math.random() * 5;
      const geo = new THREE.SphereGeometry(size, 12, 10);
      const puff = new THREE.Mesh(geo, mat);
      puff.position.set((Math.random() - 0.5) * 18, (Math.random() - 0.5) * 3.5, (Math.random() - 0.5) * 12);
      puff.scale.set(0.8 + Math.random() * 0.5, 0.6 + Math.random() * 0.3, 0.8 + Math.random() * 0.5);
      group.add(puff);
    }
    return group;
  }

  _spawnCloud() {
    const cloud = this._createCloud();
    const half = 180;
    const vx = Math.cos(this._windAngle) * this._windSpeed;
    const vz = Math.sin(this._windAngle) * this._windSpeed;
    const perpX = -vz / this._windSpeed; const perpZ =  vx / this._windSpeed;
    const t = (Math.random() - 0.5) * half * 2;
    const edgeX = -vx / this._windSpeed * half; const edgeZ = -vz / this._windSpeed * half;
    const x = edgeX + perpX * t; const z = edgeZ + perpZ * t;
    cloud.position.set(x, 45 + Math.random() * 25, z);
    cloud.userData.vx = vx; cloud.userData.vz = vz;
    this.scene.add(cloud); this.clouds.push(cloud);
  }
_prefillClouds() {
  // Genera muchas nubes esparcidas por un área MUY grande (200x200)
  for (let i = 0; i < 25; i++) {
    const cloud = this._createCloud();
    // Distribución uniforme en un área de 200x200
    const x = (Math.random() - 0.5) * 200;
    const z = (Math.random() - 0.5) * 200;
    const y = 45 + Math.random() * 30; // Altura variada para que no se vean planas
    
    cloud.position.set(x, y, z);
    
    const vx = Math.cos(this._windAngle) * this._windSpeed;
    const vz = Math.sin(this._windAngle) * this._windSpeed;
    cloud.userData.vx = vx;
    cloud.userData.vz = vz;
    
    // Escala aleatoria para más variedad
    const scale = 0.8 + Math.random() * 0.8;
    cloud.scale.set(scale, scale, scale);
    
    this.scene.add(cloud);
    this.clouds.push(cloud);
  }
}
  _updateClouds(dt) {
    const half = 180;
    const vx = Math.cos(this._windAngle) * this._windSpeed;
    const vz = Math.sin(this._windAngle) * this._windSpeed;
    this._cloudWaveTimer -= dt;
    if (this._cloudWaveTimer <= 0) {
      const waveSize = 1 + Math.floor(Math.random() * 4);
      for (let i = 0; i < waveSize; i++) setTimeout(() => this._spawnCloud(), i * (100 + Math.random() * 300));
      this._cloudWaveTimer = 3 + Math.random() * 6;
    }
    for (let i = this.clouds.length - 1; i >= 0; i--) {
      const c = this.clouds[i];
      c.position.x += vx * dt; c.position.z += vz * dt;
      if (Math.abs(c.position.x) > half + 30 || Math.abs(c.position.z) > half + 30) {
        this.scene.remove(c); this.clouds.splice(i, 1);
      }
    }
  }

  _lights() {
    const isHigh = this.save.quality === 'alta';
    const isLow = this.save.quality === 'baja';

    this.hemi = new THREE.HemisphereLight(0xd8e8f5, 0x6a7050, 0);
    this.scene.add(this.hemi);

    this.sunLight = new THREE.DirectionalLight(0xfff0d0, 0);
    this.sunLight.position.set(70, 90, 40);
    this.sunLight.castShadow = !isLow;
    
    if (this.sunLight.castShadow) {
      const shadowSize = isHigh ? 2048 : 1024; 
      this.sunLight.shadow.mapSize.set(shadowSize, shadowSize);
      const d = isHigh ? 45 : 35;
      this.sunLight.shadow.camera.left = -d; this.sunLight.shadow.camera.right = d;
      this.sunLight.shadow.camera.top = d; this.sunLight.shadow.camera.bottom = -d;
      this.sunLight.shadow.camera.near = 1; this.sunLight.shadow.camera.far = 200;
      this.sunLight.shadow.bias = -0.001; 
      this.sunLight.shadow.normalBias = 0.08; 
    }
    this.scene.add(this.sunLight);

    this.fill = new THREE.DirectionalLight(0xb0d0ff, 0);
    this.fill.position.set(-50, 40, -30);
    this.scene.add(this.fill);

    this.ambientNight = new THREE.AmbientLight(0x3a4560, 0);
    this.scene.add(this.ambientNight);

    this.moonLight = new THREE.DirectionalLight(0x9ab8e8, 0);
    this.moonLight.position.set(-70, 90, -40);
    this.moonLight.castShadow = false; 
    this.scene.add(this.moonLight);
  }

  _addBox(w, h, d, x, y, z, color, opts = {}) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), new THREE.MeshStandardMaterial({ color, roughness: 0.85, ...opts }));
    m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true;
    this.scene.add(m); return m;
  }

  _buildNeighborhood() {
    const HALF = this.HALF;
    const WALL_H = this.WALL_H;
    const quality = this.save.quality;

    const grassMat = new THREE.MeshStandardMaterial({ 
      color: 0x4a7a4a, 
      roughness: 1.0, 
      metalness: 0.0
    });
    
    if (quality === 'alta') {
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
      tex.repeat.set(20, 20);
      grassMat.map = tex;
    }

    const grass = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, HALF * 2), grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.receiveShadow = false;
    this.scene.add(grass);
    this.grass = grass;

    const roadMat = new THREE.MeshStandardMaterial({ color: 0x3a3f47, roughness: 1.0 });
    const roadH = new THREE.Mesh(new THREE.PlaneGeometry(HALF * 2, 6), roadMat);
    roadH.rotation.x = -Math.PI / 2; roadH.position.y = 0.02; roadH.receiveShadow = true;
    this.scene.add(roadH);

    const roadV = new THREE.Mesh(new THREE.PlaneGeometry(6, HALF * 2), roadMat);
    roadV.rotation.x = -Math.PI / 2; roadV.position.y = 0.02; roadV.receiveShadow = true;
    this.scene.add(roadV);

    const lineMat = new THREE.MeshBasicMaterial({ color: 0xf0e0a0 });
    for (let i = -HALF + 2; i < HALF; i += 4) {
      if (Math.abs(i) < 4) continue;
      const s1 = new THREE.Mesh(new THREE.PlaneGeometry(1.6, 0.12), lineMat);
      s1.rotation.x = -Math.PI / 2; s1.position.set(i, 0.03, 0); this.scene.add(s1);
      const s2 = new THREE.Mesh(new THREE.PlaneGeometry(0.12, 1.6), lineMat);
      s2.rotation.x = -Math.PI / 2; s2.position.set(0, 0.03, i); this.scene.add(s2);
    }

    const wallColor = 0x8a7a68;
    const t = this._wallThickness.perimeter;
    this._addBox(HALF * 2, WALL_H, t, 0, WALL_H / 2, -HALF, wallColor);
    this._addBox(HALF * 2, WALL_H, t, 0, WALL_H / 2,  HALF, wallColor);
    this._addBox(t, WALL_H, HALF * 2, -HALF, WALL_H / 2, 0, wallColor);
    this._addBox(t, WALL_H, HALF * 2,  HALF, WALL_H / 2, 0, wallColor);

    const capColor = 0xa89880;
    this._addBox(HALF * 2 + 0.4, 0.3, t + 0.4, 0, WALL_H + 0.15, -HALF, capColor);
    this._addBox(HALF * 2 + 0.4, 0.3, t + 0.4, 0, WALL_H + 0.15,  HALF, capColor);
    this._addBox(t + 0.4, 0.3, HALF * 2 + 0.4, -HALF, WALL_H + 0.15, 0, capColor);
    this._addBox(t + 0.4, 0.3, HALF * 2 + 0.4,  HALF, WALL_H + 0.15, 0, capColor);

    for (const plot of this.plots) {
      const pad = new THREE.Mesh(
        new THREE.PlaneGeometry(this.PLOT_SIZE, this.PLOT_SIZE),
        new THREE.MeshStandardMaterial({ color: 0x7a8a5a, roughness: 1.0 })
      );
      pad.rotation.x = -Math.PI / 2; pad.position.set(plot.cx, 0.04, plot.cz); pad.receiveShadow = true;
      this.scene.add(pad); plot.half = this.PLOT_SIZE / 2;
      plot.padMesh = pad; 
    }

    this.streetLamps = [];
    
    const glowCanvas = document.createElement('canvas');
    glowCanvas.width = 64; glowCanvas.height = 64;
    const glowCtx = glowCanvas.getContext('2d');
    const glowGrad = glowCtx.createRadialGradient(32, 32, 0, 32, 32, 32);
    glowGrad.addColorStop(0, 'rgba(255, 220, 130, 0.8)');
    glowGrad.addColorStop(0.4, 'rgba(255, 200, 100, 0.2)');
    glowGrad.addColorStop(1, 'rgba(255, 180, 80, 0)');
    glowCtx.fillStyle = glowGrad;
    glowCtx.fillRect(0, 0, 64, 64);
    const glowTexture = new THREE.CanvasTexture(glowCanvas);
    
    const fakeLightMat = new THREE.MeshBasicMaterial({ 
      map: glowTexture, 
      transparent: true, 
      depthWrite: false, 
      blending: THREE.AdditiveBlending 
    });

    for (const [x, z] of [[-5, -5], [5, -5], [-5, 5], [5, 5]]) {
      this._addBox(0.15, 3.2, 0.15, x, 1.6, z, 0x333333);
      const bulbMat = new THREE.MeshStandardMaterial({ color: 0xfff2c0, emissive: 0xffe4a0, emissiveIntensity: 3.0, roughness: 0.3 });
      const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.28, 14, 12), bulbMat);
      bulb.position.set(x, 3.4, z); 
      this.scene.add(bulb);
      this._addBox(0.5, 0.15, 0.5, x, 3.65, z, 0x222222);
      
      const fakeHalo = new THREE.Mesh(new THREE.PlaneGeometry(8, 8), fakeLightMat);
      fakeHalo.rotation.x = -Math.PI / 2;
      fakeHalo.position.set(x, 0.06, z);
      this.scene.add(fakeHalo);
      
      this.streetLamps.push({ light: null, bulb: bulb, halo: fakeHalo });
    }
  }

  _updateDayCycle(dt) {
    this.dayTime = (this.dayTime + this.daySpeed * dt) % 1;
    const sunAngle = this.dayTime * Math.PI * 2 - Math.PI / 2;
    const R = 120;
    const sunX = Math.cos(sunAngle) * R;
    const sunY = Math.sin(sunAngle) * R;
    const sunZ = Math.cos(sunAngle * 0.5) * 40;
    this.sunMesh.position.set(sunX, sunY, sunZ);
    const moonX = -sunX; const moonY = -sunY; const moonZ = -sunZ;
    this.moonMesh.position.set(moonX, moonY, moonZ);
    this.sunLight.position.set(sunX, Math.max(sunY, 1), sunZ);

    this._lastShadowUpdate++;
    if (this._lastShadowUpdate >= 90) {
      this._lastShadowUpdate = 0;
      if (this.renderer && this.renderer.shadowMap) this.renderer.shadowMap.needsUpdate = true;
    }

    const sunHeight = sunY / R;
    const isDay = sunHeight > 0;
    const dayFactor = Math.max(0, sunHeight);
    const isHigh = this.save.quality === 'alta';

    this.sunLight.intensity = isDay ? 0.5 + dayFactor * 1.5 : 0;
    if (isDay) {
      const warmth = Math.max(0, 1 - sunHeight * 2.5);
      this.sunLight.color.setRGB(1, 0.97 - warmth * 0.15, 0.88 - warmth * 0.55);
    }
    const ambientBase = isHigh ? 0.4 : 0.3;
    this.hemi.intensity = isDay ? ambientBase + dayFactor * 0.5 : 0;
    this.fill.intensity = isDay ? (isHigh ? 0.35 : 0.2) + dayFactor * 0.2 : 0;
    const isNight = sunHeight < 0;
    this.ambientNight.intensity = isNight ? 0.25 + (-sunHeight) * 0.2 : 0;

    if (isNight) {
      const moonHeight = -sunHeight;
      this.moonLight.intensity = 0.6 + moonHeight * 0.8; 
      this.moonLight.position.set(moonX, Math.max(moonY, 1), moonZ);
    } else {
      this.moonLight.intensity = 0;
    }

    if (this.streetLamps) {
      const isNightLamp = sunHeight < 0.1;
      for (const l of this.streetLamps) {
        if (l.bulb) l.bulb.material.emissiveIntensity = isNightLamp ? 3.0 : 0;
        if (l.halo) l.halo.visible = isNightLamp;
      }
    }

    const dayTop = new THREE.Color(0x2d7ad6); const dayBottom = new THREE.Color(0xcfe4f5);
    const duskTop = new THREE.Color(0x2a1a4a); const duskBottom = new THREE.Color(0xff8a4a);
    const nightTop = new THREE.Color(0x050510); const nightBottom = new THREE.Color(0x101830);
    let top, bottom;
    if (isDay) {
      if (sunHeight > 0.3) { top = dayTop.clone(); bottom = dayBottom.clone(); }
      else {
        const t = sunHeight / 0.3;
        top = duskTop.clone().lerp(dayTop, t); bottom = duskBottom.clone().lerp(dayBottom, t);
      }
    } else {
      if (sunHeight > -0.2) {
        const t = (sunHeight + 0.2) / 0.2;
        top = nightTop.clone().lerp(duskTop, t); bottom = nightBottom.clone().lerp(duskBottom, t);
      } else { top = nightTop.clone(); bottom = nightBottom.clone(); }
    }
    this.skyMat.uniforms.topColor.value.copy(top);
    this.skyMat.uniforms.bottomColor.value.copy(bottom);
    if (this.scene.fog) this.scene.fog.color.copy(bottom);

    this.sunMesh.visible = sunY > -15;
    this.sunMesh.material.opacity = Math.max(0, Math.min(1, (sunY + 15) / 30));
    this.moonMesh.visible = moonY > -15;
    this.moonMesh.material.opacity = Math.max(0, Math.min(1, (moonY + 15) / 30));
    this.starMat.opacity = Math.min(1, Math.max(0, -sunHeight * 2));

    // --- COLOR DE LAS NUBES SEGÚN CLIMA Y HORA ---
const weatherDarkness = this.weatherIntensity;
for (const c of this.clouds) {
  c.traverse(o => {
    if (o.isMesh && o.material && o.material.color) {
      const baseWhite = new THREE.Color(1, 1, 1); 
      const duskTint = new THREE.Color(1, 0.7, 0.5);
      const nightTint = new THREE.Color(0.35, 0.4, 0.55); 
      const stormTint = new THREE.Color(0.15, 0.17, 0.22); // Nubes de tormenta MUY oscuras
      
      let target;
      if (isDay && sunHeight > 0.3) target = baseWhite.clone();
      else if (sunHeight > -0.1) {
        const t = Math.max(0, Math.min(1, (sunHeight + 0.1) / 0.4));
        target = nightTint.clone().lerp(duskTint, t);
      } else target = nightTint.clone();
      
      // Mezclar con el color de tormenta
      target.lerp(stormTint, weatherDarkness * 0.9);
      o.material.color.copy(target);
    }
  });
}

    const clockEl = document.getElementById('clock');
    if (clockEl) {
      const hours = Math.floor(this.dayTime * 24);
      const mins = Math.floor((this.dayTime * 24 - hours) * 60);
      clockEl.textContent = `🕐 ${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}`;
    }

      // --- CLIMA: OSCURECER Y PONER CIELO GRIS ---
  const badWeather = this.weatherIntensity;
  if (badWeather > 0.01) {
    // Gris de tormenta
    const stormGreyTop = new THREE.Color(0x4a5568);
    const stormGreyBottom = new THREE.Color(0x718096);
    
    this.skyMat.uniforms.topColor.value.lerp(stormGreyTop, badWeather * 0.8);
    this.skyMat.uniforms.bottomColor.value.lerp(stormGreyBottom, badWeather * 0.8);

    // Apagar luces progresivamente
    if (this.sunLight) this.sunLight.intensity *= (1 - badWeather * 0.7);
    if (this.hemi) this.hemi.intensity *= (1 - badWeather * 0.5);
  }

  // Destello de relámpago
  if (this._stormFlashActive && this.sunLight) {
    this.sunLight.intensity += 4.0;
  }
}

  _loadFurniture() {
    for (const item of (this.save.placedFurniture ?? [])) {
      const obj = createFurniture(item.type, item.color ?? null, item.style ?? null, this.save.quality);
      if (!obj) continue;
      const y = item.y ?? 0;
      place(obj, item.x, y, item.z, item.rotY ?? 0);
      obj.position.y = y;
      this.scene.add(obj);

      // Parche Z-Fighting
      if (item.type.startsWith('muro')) {
        obj.traverse(child => {
          if (child.isMesh && child.material) {
            child.material.polygonOffset = true;
            child.material.polygonOffsetFactor = -1.0;
            child.material.polygonOffsetUnits = -1.0;
          }
        });
      }

      const rec = {
        type: item.type, obj, x: item.x, y: y, z: item.z, rotY: item.rotY ?? 0,
        radius: this._radiusFor(item.type), color: item.color ?? null,
        style: item.style ?? null, tvUrl: item.tvUrl ?? null, tvTime: item.tvTime ?? 0,
      };
      this.placed.push(rec);

      if ((item.type === 'tv' || item.type === 'cuadro') && item.tvUrl) {
        setTimeout(() => this.loadTVContent(rec, item.tvUrl), 80);
      }
    }
  }

  _radiusFor(type) {
    if (type.startsWith('muro') || type === 'techo_basico') return 2.0;
    if (type.startsWith('escalera')) return 1.2;
    if (type === 'arbol_grande') return 0.9;
    if (type === 'arbol_chico')  return 0.6;
    if (type === 'arbusto')      return 0.4;
    if (type === 'planta_maceta')return 0.25;
    if (type === 'cama_basica')  return 0.55;
    if (type === 'cama_doble')   return 0.85;
    if (type === 'cama_premium') return 0.95;
    if (type === 'cama_king')    return 1.05;
    if (type === 'mesa_basica')  return 0.5;
    if (type === 'mesa_redonda') return 0.45;
    if (type === 'mesa_premium') return 0.55;
    if (type === 'mesa_luz')     return 0.3;
    if (type.startsWith('silla')) return 0.28;
    if (type === 'ropero')       return 0.65;
    if (type === 'alacena')      return 0.75;
    if (type === 'cocina_gas' || type === 'cocina_electrica') return 0.4;
    if (type === 'bajo_mesada_pileta')  return 0.65;
    if (type === 'alacena_aerea')       return 0.4;
    if (type === 'lavavajillas')        return 0.4;
    if (type === 'horno_electrico')     return 0.4;
    if (type === 'pava_electrica')      return 0.15;
    if (type === 'licuadora')           return 0.15;
    if (type === 'ollas')               return 0.35;
    if (type === 'sarten')              return 0.25;
    if (type === 'luz_plafon')          return 0.25;
    if (type === 'luz_candelabro')      return 0.3;
    if (type === 'luz_aplique')         return 0.15;
    if (type === 'tv')           return 0.35;
    if (type === 'lampara')      return 0.22;
    if (type === 'lampara_mesa') return 0.2;
    if (type === 'alfombra')     return 0.9;
    if (type === 'sofa')         return 0.95;
    if (type === 'mesa_ratona')  return 0.55;
    if (type === 'estanteria')   return 0.45;
    if (type === 'cuadro')       return 0.3;
    if (type === 'techo_ventilador') return 0.5;
    if (type === 'parche_pasto') return 0.6;
    if (type === 'flores')       return 0.25;
    return 0.4;
  }

  _depthFor(type) {
    return this._depthByType[type] ?? 0.4;
  }

  _originFor(id) {
    if (this._originAt[id]) return this._originAt[id];
    try {
      const probe = createFurniture(id, null, null, this.save.quality);
      if (probe?.userData?.originAt) {
        this._originAt[id] = probe.userData.originAt;
        return this._originAt[id];
      }
    } catch (_) {}
    return 'center';
  }

  plotAt(x, z) {
    for (const plot of this.plots) {
      if (Math.abs(x - plot.cx) < plot.half && Math.abs(z - plot.cz) < plot.half) return plot.index;
    }
    return -1;
  }

  _isInsideAnyPlot(x, z, margin = 0.4) {
    for (const plot of this.plots) {
      if (Math.abs(x - plot.cx) < plot.half - margin && Math.abs(z - plot.cz) < plot.half - margin) return true;
    }
    return false;
  }

  _snapToNearestPlot(x, z, margin = 0.6) {
    let nearest = null; let bestDist = Infinity;
    for (const plot of this.plots) {
      const dx = x - plot.cx; const dz = z - plot.cz; const d = Math.hypot(dx, dz);
      if (d < bestDist) { bestDist = d; nearest = plot; }
    }
    if (!nearest) return { x, z };
    const limit = nearest.half - margin;
    return {
      x: Math.max(nearest.cx - limit, Math.min(nearest.cx + limit, x)),
      z: Math.max(nearest.cz - limit, Math.min(nearest.cz + limit, z)),
    };
  }

  _loadPlotFloors() {
    const saved = this.save.plotFloors ?? {};
    for (const key of Object.keys(saved)) {
      const idx = Number(key); const entry = saved[key];
      if (entry && typeof entry === 'object') this._applyPlotFloor(idx, entry.type, false, entry.color ?? null);
      else if (typeof entry === 'string') this._applyPlotFloor(idx, entry, false, null);
    }
  }

  _applyPlotFloor(idx, type, save = true, color = null) {
    const plot = this.plots[idx];
    if (!plot) return;

    if (this._floorMeshes[idx]) {
      this.scene.remove(this._floorMeshes[idx]);
      this._floorMeshes[idx] = null;
    }

    if (!type) {
      if (plot.padMesh) plot.padMesh.visible = true;
      delete this._plotFloors[idx];
      if (save) {
        if (this.save.plotFloors) delete this.save.plotFloors[idx];
        if (typeof this.onTVSave === 'function') this.onTVSave();
      }
      this.renderer.shadowMap.needsUpdate = true;
      return;
    }

    const floorObj = createFloor(type, color);
    if (!floorObj) return;

    floorObj.traverse(child => {
      if (child.isMesh && child.material) {
        child.material.roughness = 1.0;
        child.material.metalness = 0.0;
        if (child.material.map) {
          child.material.map.anisotropy = 1;
          child.material.map.minFilter = THREE.LinearFilter;
          child.material.map.generateMipmaps = false;
          child.material.map.needsUpdate = true;
        }
        child.material.needsUpdate = true;
      }
    });

    floorObj.position.set(plot.cx, 0.05, plot.cz);
    this.scene.add(floorObj);
    this._floorMeshes[idx] = floorObj;
    this._plotFloors[idx] = type;

    if (plot.padMesh) plot.padMesh.visible = false;

    if (save) {
      this.save.plotFloors = this.save.plotFloors ?? {};
      this.save.plotFloors[idx] = { type, color: color ?? null };
      if (typeof this.onTVSave === 'function') this.onTVSave();
    }
  }

  _isFloorType(id) { return id && id.startsWith('piso_'); }

  _findSupportUnder(x, z) {
    let best = null;
    for (const p of this.placed) {
      if (!(p.type in this._surfaces)) continue;
      const dx = p.x - x; const dz = p.z - z; const d = Math.hypot(dx, dz);
      if (d < p.radius * 1.15) {
        const y = this._surfaces[p.type];
        if (!best || y > best.y) best = { rec: p, y };
      }
    }
    return best;
  }

  startPlacement(id, color = null, style = null) {
    this.cancelPlacement(); this.cancelMove();
    this.selectedId = id; this.selectedColor = color; this.selectedStyle = style;
    if (!id) return;

    if (this._isFloorType(id)) {
      this.ghost = null; document.getElementById('placeBar').style.display = 'flex'; return;
    }

    this.ghost = createFurniture(id, color, style, this.save.quality);
    if (!this.ghost) return;

    this.ghost.traverse(o => {
      if (o.isMesh && o.material && o.material.color) {
        o.material = o.material.clone();
        o.material.transparent = true; o.material.opacity = 0.55; o.material.color.set(0x66ff88);
      }
    });
    this.scene.add(this.ghost);
    document.getElementById('placeBar').style.display = 'flex';
  }

  cancelPlacement() {
    if (this.ghost) { this.scene.remove(this.ghost); this.ghost = null; }
    this.selectedId = null; this.selectedColor = null; this.selectedStyle = null;
    document.getElementById('placeBar').style.display = 'none';
  }

  _resolveStackableSnap(id, gx, gz, initialRotY = 0) {
    let rotY = initialRotY; let gy = 0; let msg = null;
    const isCeilingLight = id === 'luz_plafon' || id === 'luz_candelabro';
    const isWallLight = id === 'luz_aplique';
    const isCeilingFan = id === 'techo_ventilador';
    const isWallOnly = this._wallOnly.has(id);

    if (!isWallOnly && !isCeilingFan) {
      const support = this._findSupportUnder(gx, gz);
      if (support) {
        return { x: support.rec.x, z: support.rec.z, rotY: support.rec.rotY, y: support.y, ok: true, msg: '📺 Apoyado sobre mueble' };
      }
    }

    if (isCeilingFan) {
      gy = this._wallMountHeight.techo_ventilador;
      return { x: gx, z: gz, rotY: 0, y: gy, ok: true, msg: '🌀 Ventilador montado en el techo' };
    }

    let nearby = this._findNearbyWall(gx, gz, 2.5);
    if (!nearby) nearby = this._findNearbyPerimeterWall(gx, gz, 2.5);

    if (!nearby) {
      if (isWallOnly) {
        return { x: gx, z: gz, rotY, y: gy, ok: false, msg: id === 'alacena_aerea' ? '⚠️ La alacena necesita una pared' : '⚠️ Necesita una pared' };
      }
      return null;
    }

    const wall = nearby.wall;
    let wallHorizontal; let wallEje;

    if (nearby.perimeter) { wallHorizontal = wall.horizontal; wallEje = wall.value; }
    else {
      const r = ((wall.rotY % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      wallHorizontal = Math.abs(Math.sin(r)) < 0.5;
      wallEje = wallHorizontal ? wall.z : wall.x;
    }

    if (isCeilingLight) { gy = this._wallMountHeight.luz_plafon; msg = '💡 Colgado del techo'; }
    else if (isWallLight) { gy = this._wallMountHeight.luz_aplique; msg = '🔦 Reflector LED montado'; }
    else if (id === 'alacena_aerea') { gy = this._wallMountHeight.alacena_aerea; msg = '🗄️ Alacena montada en pared'; }
    else if (id === 'cuadro') { gy = this._wallMountHeight.cuadro; msg = '🖼️ Cuadro colgado en pared'; }
    else { gy = 1.6; msg = '📺 Colgado en la pared'; }

    const cam = this.camera.position;
    const camDelta = wallHorizontal ? cam.z - wallEje : cam.x - wallEje;
    const playerSide = Math.sign(camDelta) || 1;

    const probe = createFurniture(id, this.selectedColor, this.selectedStyle, this.save.quality);
    if (!probe) return { x: gx, z: gz, rotY, y: gy, ok: false, msg: '⚠️ No se pudo crear el mueble' };

    probe.position.set(gx, gy, gz); probe.updateMatrixWorld(true);

    let bestRotY = 0; let bestScore = -Infinity; let bestOffsetToWall = 0;
    const rotations = [0, Math.PI / 2, Math.PI, -Math.PI / 2];

    for (const candidateRot of rotations) {
      probe.rotation.y = candidateRot; probe.position.set(gx, gy, gz); probe.updateMatrixWorld(true);
      const box = new THREE.Box3().setFromObject(probe);
      let nearFace, farFace;
      if (wallHorizontal) { nearFace = playerSide > 0 ? box.min.z : box.max.z; farFace = playerSide > 0 ? box.max.z : box.min.z; }
      else { nearFace = playerSide > 0 ? box.min.x : box.max.x; farFace = playerSide > 0 ? box.max.x : box.min.x; }
      const distNearToWall = (nearFace - wallEje) * playerSide;
      const depthOnAxis = (farFace - nearFace) * playerSide;

      let score = 0;
      if (distNearToWall < 0) score = -1000 + distNearToWall * 100;
      else score = depthOnAxis * 10 - Math.abs(distNearToWall - 0.05);

      if (score > bestScore) { bestScore = score; bestRotY = candidateRot; bestOffsetToWall = distNearToWall; }
    }

    rotY = bestRotY;
    const margin = this._wallMargin; const delta = margin - bestOffsetToWall;
    if (wallHorizontal) gz = gz + delta * playerSide;
    else gx = gx + delta * playerSide;

    probe.rotation.y = 0;
    return { x: gx, z: gz, rotY, y: gy, ok: true, msg };
  }

  confirmPlace() {
    if (!this.selectedId) return false;

    if (this._isFloorType(this.selectedId)) {
      const idx = this.plotAt(this.camera.position.x, this.camera.position.z);
      if (idx < 0) { this._notifyTV('⚠️ Debes estar sobre un terreno'); return false; }
      this._applyPlotFloor(idx, this.selectedId, true, this.selectedColor ?? null);
      this._notifyTV(`🟫 Piso cambiado en terreno ${idx + 1}`);
      this.renderer.shadowMap.needsUpdate = true;
      if (typeof this.onFurniturePlaced === 'function') this.onFurniturePlaced(this.selectedId);
      return true;
    }

    if (!this.ghost) return false;
    let gx = this.ghost.position.x; let gz = this.ghost.position.z;
    let rotY = this.ghost.rotation.y; let gy = this.ghost.position.y ?? 0;
    const id = this.selectedId;

    if (id.startsWith('techo_')) gy = this.playerFeetY + 3.0;

    const isBuild = id.startsWith('muro') || id.startsWith('techo');
    const allowOutdoor = this._outdoorAllowed.has(id);
    const isStackable = this._stackable.includes(id);
    const mustBeInPlot = !isBuild && !allowOutdoor && !isStackable;

    if (mustBeInPlot && !this._isInsideAnyPlot(gx, gz, 0.15)) {
      const snapped = this._snapToNearestPlot(gx, gz, 0.2);
      gx = snapped.x; gz = snapped.z;
    }

    if (isStackable) {
      const res = this._resolveStackableSnap(id, gx, gz, rotY);
      if (res) {
        if (!res.ok) { if (res.msg) this._notifyTV(res.msg); return false; }
        gx = res.x; gz = res.z; rotY = res.rotY; gy = res.y;
        if (res.msg) this._notifyTV(res.msg);
      }
    }

    if (!this._isValidPlacement(gx, gz)) return false;

    const obj = createFurniture(id, this.selectedColor, this.selectedStyle, this.save.quality);
    place(obj, gx, gy, gz, rotY);
    obj.position.y = gy;

    if (id === 'alfombra') {
      const plotIdx = this.plotAt(gx, gz);
      if (plotIdx >= 0 && this._plotFloors[plotIdx]) obj.position.y = 0.07;
    }

    this.scene.add(obj);

    // Parche Z-Fighting en muros nuevos
    if (id.startsWith('muro')) {
      obj.traverse(child => {
        if (child.isMesh && child.material) {
          child.material.polygonOffset = true;
          child.material.polygonOffsetFactor = -1.0;
          child.material.polygonOffsetUnits = -1.0;
        }
      });
    }

    this.placed.push({
      type: id, obj, x: gx, y: obj.position.y, z: gz, rotY,
      radius: this._radiusFor(id), color: this.selectedColor,
      style: this.selectedStyle, tvUrl: null, tvTime: 0,
    });
    this.save.placedFurniture = this.save.placedFurniture ?? [];
    this.save.placedFurniture.push({
      type: id, x: gx, y: obj.position.y, z: gz, rotY,
      color: this.selectedColor, style: this.selectedStyle, tvUrl: null, tvTime: 0,
    });

    this.renderer.shadowMap.needsUpdate = true;

    if (typeof this.onFurniturePlaced === 'function') this.onFurniturePlaced(id);

    return true;
  }

  rotateGhost() {
    if (!this.ghost) return;
    this.manualRotY += Math.PI / 2;
    if (this.manualRotY >= Math.PI * 2) this.manualRotY = 0;
    this.ghost.rotation.y = this.manualRotY;
  }

  _isValidPlacement(x, z) {
    const id = this.selectedId;
    const isBuild = id && (id.startsWith('muro') || id.startsWith('techo'));
    const isFloorType = this._isFloorType(id);
    const isStackable = this._stackable.includes(id);
    const allowOutdoor = this._outdoorAllowed.has(id);

    const LIMIT = this.HALF + (allowOutdoor ? 2.0 : -0.5);
    if (Math.abs(x) > LIMIT || Math.abs(z) > LIMIT) return false;

    const mustBeInPlot = !isFloorType && !isBuild && !allowOutdoor && !isStackable;
    if (mustBeInPlot) {
      const myRadius = this._radiusFor(id);
      const margin = Math.max(0.15, myRadius * 0.3);
      if (!this._isInsideAnyPlot(x, z, margin)) return false;
    }

    if (isStackable) return true;

    const isGroundDecor = id === 'parche_pasto' || id === 'flores';

    const myY = this._wallMountHeight[id] ?? 0;
    const myHeightHalf = this._heightHalfFor(id);

    for (const p of this.placed) {
      const pIsBuild = p.type.startsWith('muro') || p.type.startsWith('techo');
      if (isBuild && pIsBuild) continue;

      const pIsGroundDecor = p.type === 'parche_pasto' || p.type === 'flores';
      if (isGroundDecor && pIsGroundDecor) continue;

      const dx = p.x - x, dz = p.z - z;
      const dist = Math.hypot(dx, dz);
      const pY = p.y ?? 0;
      const pHeightHalf = this._heightHalfFor(p.type);
      const myBottom = myY - myHeightHalf; const myTop = myY + myHeightHalf;
      const pBottom = pY - pHeightHalf; const pTop = pY + pHeightHalf;
      const overlapY = (myBottom < pTop) && (myTop > pBottom);
      if (!overlapY) continue;

      let minDist;
      if (pIsBuild) {
        const myDepth = this._depthFor(id);
        minDist = myDepth / 2 + this._wallThickness.player / 2 + this._wallMargin;
      } else {
        const myRadius = this._radiusFor(id);
        minDist = myRadius + p.radius;
      }
      if (dist < minDist) return false;
    }
    return true;
  }

  _heightHalfFor(type) {
    if (type === 'mesa_basica' || type === 'mesa_redonda' || type === 'mesa_premium' || type === 'mesa_luz') return 0.4;
    if (type.startsWith('silla')) return 0.5;
    if (type.startsWith('cama')) return 0.5;
    if (type === 'alfombra') return 0.02;
    if (type === 'bajo_mesada_pileta' || type === 'cocina_gas' || type === 'cocina_electrica' || type === 'ropero' || type === 'alacena' || type === 'lavavajillas' || type === 'horno_electrico') return 0.5;
    if (type === 'alacena_aerea') return 0.35;
    if (type === 'tv') return 0.5;
    if (type === 'luz_plafon' || type === 'luz_candelabro') return 0.15;
    if (type === 'luz_aplique') return 0.15;
    if (type === 'pava_electrica' || type === 'licuadora') return 0.15;
    if (type === 'ollas') return 0.1;
    if (type === 'sarten') return 0.03;
    if (type.startsWith('arbol') || type === 'arbusto') return 1.0;
    if (type === 'planta_maceta') return 0.3;
    if (type === 'lampara') return 0.9;
    if (type === 'lampara_mesa') return 0.3;
    if (type.startsWith('muro')) return 1.5;
    if (type.startsWith('techo')) return 0.2;
    if (type.startsWith('escalera')) return 1.6;
    if (type === 'sofa') return 0.45;
    if (type === 'mesa_ratona') return 0.25;
    if (type === 'estanteria') return 0.9;
    if (type === 'cuadro') return 0.35;
    if (type === 'techo_ventilador') return 0.3;
    if (type === 'parche_pasto') return 0.05;
    if (type === 'flores') return 0.15;
    return 0.4;
  }

  _createHighlight() {
    this._highlightBox = new THREE.BoxHelper(undefined, 0xffdd66);
    this._highlightBox.material.depthTest = false;
    this._highlightBox.material.transparent = true;
    this._highlightBox.material.opacity = 0.9;
    this._highlightBox.visible = false;
    this.scene.add(this._highlightBox);
  }

  highlightTarget(rec) {
    if (!this._highlightBox) this._createHighlight();
    this._lastHighlight = rec;
    if (!rec || !rec.obj) { this._highlightBox.visible = false; return; }
    const box = new THREE.Box3().setFromObject(rec.obj);
    if (box.isEmpty()) { this._highlightBox.visible = false; return; }
    this._highlightBox.setFromObject(rec.obj);
    this._highlightBox.visible = true;
  }

  setEditMode(on) {
    this.editMode = on;
    const cursor = document.getElementById('editCursor'); const panel = document.getElementById('editPanel');
    cursor.style.display = on ? 'block' : 'none';
    if (!on) { panel.style.display = 'none'; this.editTarget = null; this.highlightTarget(null); }
    const toggle = document.getElementById('editToggle');
    if (toggle) toggle.classList.toggle('active', on);
  }

  _updateEditTarget() {
    if (!this.editMode) return;
    const raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(new THREE.Vector2(0, 0), this.camera);
    const objs = this.placed.map(p => p.obj).filter(Boolean);
    const hits = raycaster.intersectObjects(objs, true);
    const panel = document.getElementById('editPanel'); const info = document.getElementById('editInfo');
    const contentBtn = document.getElementById('editContent');

    if (hits.length === 0) {
      if (this.editTarget) {
        this.editTarget = null; this.highlightTarget(null); panel.style.display = 'none';
        if (contentBtn) contentBtn.style.display = 'none';
      }
      return;
    }

    const hitObj = hits[0].object; let rec = null;
    for (const p of this.placed) {
      let node = hitObj;
      while (node) { if (node === p.obj) { rec = p; break; } node = node.parent; }
      if (rec) break;
    }
    if (!rec) return;

    if (rec !== this.editTarget) {
      this.editTarget = rec; this.highlightTarget(rec);
      info.textContent = `Mueble: ${rec.type}`;
      if (contentBtn) contentBtn.style.display = (rec.type === 'tv' || rec.type === 'cuadro') ? 'block' : 'none';
      panel.style.display = 'flex';
    }
  }

  deleteTarget() {
    if (!this.editTarget) return;
    const rec = this.editTarget;
    if (rec.type === 'tv' || rec.type === 'cuadro') this.stopTVContent(rec);
    if (typeof this.onDeleteRequest === 'function') this.onDeleteRequest(rec.type);
    this.scene.remove(rec.obj);
    const idx = this.placed.indexOf(rec);
    if (idx >= 0) this.placed.splice(idx, 1);
    const saved = this.save.placedFurniture ?? [];
    const i = saved.findIndex(s => s.type === rec.type && Math.abs(s.x - rec.x) < 0.01 && Math.abs(s.z - rec.z) < 0.01);
    if (i >= 0) saved.splice(i, 1);
    this.editTarget = null; this._lastHighlight = null; this.highlightTarget(null);
    const panel = document.getElementById('editPanel'); if (panel) panel.style.display = 'none';
    const contentBtn = document.getElementById('editContent'); if (contentBtn) contentBtn.style.display = 'none';
    this.renderer.shadowMap.needsUpdate = true;
    if (typeof this.onTVSave === 'function') this.onTVSave();
  }

  startMove() {
    if (!this.editTarget) return;
    this._moveRecord = this.editTarget;
    this._moveOriginalPos = { x: this.editTarget.x, z: this.editTarget.z };
    this.editTarget.obj.visible = false;
    const idx = this.placed.indexOf(this.editTarget);
    if (idx >= 0) this.placed.splice(idx, 1);
    this.startPlacement(this._moveRecord.type, this._moveRecord.color, this._moveRecord.style);
    this.moveMode = true;
    document.getElementById('placeBar').style.display = 'none';
    document.getElementById('moveBar').style.display = 'flex';
    document.getElementById('editPanel').style.display = 'none';
    this.highlightTarget(null);
  }

  confirmMove() {
    if (!this.moveMode || !this.ghost || !this._moveRecord) return false;
    let gx = this.ghost.position.x; let gz = this.ghost.position.z;
    let rotY = this.ghost.rotation.y; let gy = this.ghost.position.y;
    const id = this._moveRecord.type;
    const isBuild = id.startsWith('muro') || id.startsWith('techo');
    const allowOutdoor = this._outdoorAllowed.has(id);
    const isStackable = this._stackable.includes(id);
    const mustBeInPlot = !isBuild && !allowOutdoor && !isStackable;

    if (mustBeInPlot && !this._isInsideAnyPlot(gx, gz, 0.15)) {
      const snapped = this._snapToNearestPlot(gx, gz, 0.2);
      gx = snapped.x; gz = snapped.z;
    }

    const rec = this._moveRecord;
    rec.obj.visible = true;
    rec.x = gx; rec.y = gy; rec.z = gz; rec.rotY = rotY;
    rec.obj.position.set(gx, gy, gz); rec.obj.rotation.y = rotY;
    this.placed.push(rec);
    const saved = this.save.placedFurniture ?? [];
    const old = this._moveOriginalPos;
    const j = saved.findIndex(s => s.type === rec.type && Math.abs(s.x - old.x) < 0.01 && Math.abs(s.z - old.z) < 0.01);
    if (j >= 0) { saved[j].x = gx; saved[j].y = gy; saved[j].z = gz; saved[j].rotY = rotY; }
    this._moveRecord = null; this._moveOriginalPos = null; this.moveMode = false;
    this.cancelPlacement();
    document.getElementById('moveBar').style.display = 'none';
    this.renderer.shadowMap.needsUpdate = true;
    if (typeof this.onTVSave === 'function') this.onTVSave();
    return true;
  }

  cancelMove() {
    if (!this.moveMode) return;
    const rec = this._moveRecord;
    if (rec) { rec.obj.visible = true; this.placed.push(rec); }
    this._moveRecord = null; this._moveOriginalPos = null; this.moveMode = false;
    this.cancelPlacement();
    document.getElementById('moveBar').style.display = 'none';
  }

  _prepareMoveOriginal() {
    if (this.editTarget) this._moveOriginalPos = { x: this.editTarget.x, z: this.editTarget.z };
  }

  _findNearbyWall(x, z, maxDist = 2.5) {
    let closest = null; let bestDist = maxDist;
    for (const p of this.placed) {
      if (!p.type.startsWith('muro')) continue;
      const rot = ((p.rotY % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const horizontal = Math.abs(Math.sin(rot)) < 0.5;
      const halfX = horizontal ? 2.0 : 0.1; const halfZ = horizontal ? 0.1 : 2.0;
      const dx = Math.abs(x - p.x); const dz = Math.abs(z - p.z);
      const overX = Math.max(0, dx - halfX); const overZ = Math.max(0, dz - halfZ);
      const dist = Math.hypot(overX, overZ);
      if (dist < bestDist) { bestDist = dist; closest = { wall: p, horizontal, dist }; }
    }
    return closest;
  }

  _findNearbyPerimeterWall(x, z, maxDist = 2.5) {
    const HALF = this.HALF;
    const walls = [
      { axis: 'z', value: -HALF, horizontal: true }, { axis: 'z', value:  HALF, horizontal: true },
      { axis: 'x', value: -HALF, horizontal: false }, { axis: 'x', value:  HALF, horizontal: false },
    ];
    let closest = null; let bestDist = maxDist;
    for (const w of walls) {
      let dist;
      if (w.axis === 'z') dist = Math.abs(z - w.value);
      else dist = Math.abs(x - w.value);
      if (dist < bestDist) {
        bestDist = dist;
        closest = { wall: { ...w, type: 'muro_perimeter' }, horizontal: w.horizontal, dist, perimeter: true };
      }
    }
    return closest;
  }

  _initPlacementTap() {
    const raycaster = new THREE.Raycaster(); const mouse = new THREE.Vector2();
    let downX = 0, downY = 0;
    this.canvas.addEventListener('touchstart', (e) => {
      const t = e.changedTouches[0]; downX = t.clientX; downY = t.clientY;
    }, { passive: true });

    this.canvas.addEventListener('touchend', (e) => {
      const t = e.changedTouches[0];
      if (Math.hypot(t.clientX - downX, t.clientY - downY) > 12) return;
      const joy = document.getElementById('joystick').getBoundingClientRect();
      if (t.clientX >= joy.left && t.clientX <= joy.right && t.clientY >= joy.top && t.clientY <= joy.bottom) return;
      if (t.clientX > innerWidth * 0.45) return;

      if (this.selectedId && this._isFloorType(this.selectedId)) {
        const idx = this.plotAt(this.camera.position.x, this.camera.position.z);
        if (idx < 0) { this._notifyTV('⚠️ Debes estar sobre un terreno'); return; }
        this._applyPlotFloor(idx, this.selectedId, true, this.selectedColor ?? null);
        this._notifyTV(`🟫 Piso cambiado en terreno ${idx + 1}`);
        if (typeof this.onPlaceRequest === 'function') this.onPlaceRequest();
        return;
      }

      if (!this.selectedId || !this.ghost) return;
      mouse.x = (t.clientX / innerWidth) * 2 - 1; mouse.y = -(t.clientY / innerHeight) * 2 + 1;
      raycaster.setFromCamera(mouse, this.camera);
      const hits = raycaster.intersectObject(this.grass, false);
      if (hits.length === 0) return;
      const p = hits[0].point;
      let x = Math.round(p.x * 2) / 2; let z = Math.round(p.z * 2) / 2;
      const id = this.selectedId;
      const isBuild = id.startsWith('muro') || id.startsWith('techo');
      const allowOutdoor = this._outdoorAllowed.has(id);
      const isStackable = this._stackable.includes(id);
      const mustBeInPlot = !isBuild && !allowOutdoor && !isStackable;
      if (mustBeInPlot && !this._isInsideAnyPlot(x, z, 0.15)) {
        const snapped = this._snapToNearestPlot(x, z, 0.2);
        x = snapped.x; z = snapped.z;
      }
      if (!this._isValidPlacement(x, z)) return;
      if (this.moveMode) { this.ghost.position.set(x, this.ghost.position.y, z); return; }
      this.ghost.position.set(x, this.ghost.position.y, z);
      if (typeof this.onPlaceRequest === 'function') this.onPlaceRequest();
    }, { passive: true });
  }

  _detectMediaType(url) {
    if (!url) return 'unknown';
    if (url.startsWith('data:image/')) return 'image';
    if (url.startsWith('data:video/')) return 'video';
    if (url.startsWith('data:audio/')) return 'audio';
    const u = url.toLowerCase();
    if (u.includes('youtube.com') || u.includes('youtu.be')) return 'youtube';
    if (u.includes('vimeo.com')) return 'vimeo';
    if (u.includes('drive.google.com')) return 'gdrive';
    if (u.match(/\.(m3u8)(\?|$)/)) return 'hls';
    if (u.match(/\.(mp4|webm|ogv|mov)(\?|$)/)) return 'video';
    if (u.match(/\.(mp3|wav|m4a|aac|flac)(\?|$)/)) return 'audio';
    if (u.match(/\.(gif)(\?|$)/)) return 'gif';
    if (u.match(/\.(jpg|jpeg|png|webp|svg|bmp)(\?|$)/)) return 'image';
    return 'unknown';
  }

  _youtubeEmbed(url) {
    try {
      const u = new URL(url); let id = u.searchParams.get('v');
      if (!id && u.hostname === 'youtu.be') id = u.pathname.slice(1);
      if (!id && u.pathname.startsWith('/embed/')) id = u.pathname.slice(7);
      return id ? `https://www.youtube.com/embed/${id}?autoplay=1` : null;
    } catch { return null; }
  }

  _normalizeUrl(rawUrl) {
    if (!rawUrl) return { url: rawUrl, note: null };
    let url = rawUrl.trim();
    const m1 = url.match(/drive\.google\.com\/file\/d\/([a-zA-Z0-9_-]+)/);
    const m2 = url.match(/drive\.google\.com\/open\?id=([a-zA-Z0-9_-]+)/);
    const m3 = url.match(/drive\.google\.com\/uc\?.*id=([a-zA-Z0-9_-]+)/);
    const id = (m1 && m1[1]) || (m2 && m2[1]) || (m3 && m3[1]);
    if (id) return { url: `https://drive.google.com/file/d/${id}/preview`, note: 'Google Drive → overlay' };
    if (url.includes('dropbox.com')) {
      let u = url.replace(/\?dl=0/, '?dl=1');
      if (!u.includes('dl=1')) u += (u.includes('?') ? '&' : '?') + 'raw=1';
      return { url: u, note: 'Dropbox → enlace directo' };
    }
    const m = url.match(/^https?:\/\/imgur\.com\/([a-zA-Z0-9]+)$/);
    if (m) return { url: `https://i.imgur.com/${m[1]}.jpg`, note: 'Imgur → enlace directo' };
    if (url.includes('youtube.com') || url.includes('youtu.be')) return { url, note: 'YouTube → se abrirá en overlay' };
    if (url.includes('vimeo.com')) return { url, note: 'Vimeo → se abrirá en overlay' };
    if (url.match(/\.m3u8(\?|$)/)) return { url, note: 'HLS (m3u8) → streaming en vivo' };
    return { url, note: null };
  }

  loadTVContent(rec, url) {
    if (!rec || !rec.obj) return;
    const screen = rec.obj.userData.screen;
    if (!screen) return;
    const normalized = this._normalizeUrl(url);
    const finalUrl = normalized.url;
    if (normalized.note) this._notifyTV(normalized.note);
    this.stopTVContent(rec);
    const type = this._detectMediaType(finalUrl);
    rec.tvUrl = finalUrl; rec.tvType = type;

    if (type === 'image' || type === 'gif') {
      this._loadImageAsBase64(finalUrl, rec);
    } else if (type === 'video' || type === 'hls') {
      this._loadVideoContent(rec, finalUrl, type);
    } else if (type === 'audio') {
      const audio = document.createElement('audio');
      audio.src = finalUrl; audio.loop = true; audio.autoplay = true; audio.volume = 0;
      audio.style.display = 'none'; document.body.appendChild(audio);
      this.tvAudio = audio; audio.play().catch(() => {});
      audio.addEventListener('loadedmetadata', () => {
        if (rec.tvTime && rec.tvTime > 0) { try { audio.currentTime = rec.tvTime; } catch (e) {} }
      });
      this._startAudioVisualization(rec);
    } else if (type === 'youtube' || type === 'vimeo' || type === 'gdrive') {
      let embedUrl = null;
      if (type === 'youtube') embedUrl = this._youtubeEmbed(finalUrl);
      else if (type === 'gdrive') embedUrl = finalUrl;
      else if (type === 'vimeo') {
        const m = finalUrl.match(/vimeo\.com\/(\d+)/);
        if (m) embedUrl = `https://player.vimeo.com/video/${m[1]}?autoplay=1`;
      }
      if (embedUrl) {
        const overlay = document.getElementById('tvOverlay'); const inner = document.getElementById('tvOverlayInner');
        if (overlay && inner) {
          inner.innerHTML = `<iframe src="${embedUrl}" allow="autoplay; encrypted-media" allowfullscreen></iframe>`;
          overlay.style.display = 'flex';
        }
      }
    } else {
      this._loadImageAsBase64(finalUrl, rec);
    }
  }

  _loadImageAsBase64(url, rec) {
    const screen = rec.obj.userData.screen;
    const proxyUrl = `https://images.weserv.nl/?url=${encodeURIComponent(url)}`;
    this._notifyTV('⏳ Descargando imagen...');

    fetch(proxyUrl)
      .then(res => { if (!res.ok) throw new Error('Error de red'); return res.blob(); })
      .then(blob => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const base64 = reader.result;
          if (base64.length > 2000000 * 1.33) { this._notifyTV('⚠️ Imagen muy grande (máx 2MB)'); return; }
          rec.tvUrl = base64;
          const loader = new THREE.TextureLoader();
          loader.load(base64, (tex) => {
            tex.colorSpace = THREE.SRGBColorSpace;
            if (screen.material) screen.material.dispose();
            screen.material = new THREE.MeshBasicMaterial({ map: tex });
            screen.material.needsUpdate = true;
            rec.obj.userData.screenMat = screen.material;
            this._notifyTV('✅ Imagen cargada');
            const input = document.getElementById('tvUrl');
            if (input && this.tvTarget === rec) input.value = base64;
          }, undefined, (err) => {
            console.error('Error al procesar la imagen', err);
            this._notifyTV('⚠️ No se pudo procesar la imagen');
          });
        };
        reader.readAsDataURL(blob);
      })
      .catch((err) => {
        console.warn('Error al descargar imagen:', err);
        this._notifyTV('⚠️ No se pudo descargar. Intenta otra URL.');
      });
  }

  _loadVideoContent(rec, url, type) {
    const screen = rec.obj.userData.screen;
    const video = document.createElement('video');
    video.crossOrigin = 'anonymous'; video.loop = (type !== 'hls');
    video.muted = false; video.playsInline = true; video.autoplay = true; video.volume = 0;
    video.style.display = 'none'; document.body.appendChild(video);
    this.tvVideo = video;

    const attachTexture = () => {
      const tex = new THREE.VideoTexture(video);
      tex.colorSpace = THREE.SRGBColorSpace;
      screen.material = new THREE.MeshBasicMaterial({ map: tex });
      rec.obj.userData.screenMat = screen.material;
    };

    if (type === 'hls') {
      if (video.canPlayType('application/vnd.apple.mpegurl')) {
        video.src = url;
        video.addEventListener('loadedmetadata', () => {
          attachTexture();
          if (rec.tvTime && rec.tvTime > 0) { try { video.currentTime = rec.tvTime; } catch (e) {} }
          video.play().catch(() => {});
        });
        video.addEventListener('error', () => { this._notifyTV('⚠️ Error al cargar el stream HLS'); });
      } else if (typeof Hls !== 'undefined' && Hls.isSupported()) {
        const hls = new Hls({ enableWorker: true, lowLatencyMode: true });
        this.tvHls = hls;
        hls.loadSource(url); hls.attachMedia(video);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          attachTexture();
          if (rec.tvTime && rec.tvTime > 0) { try { video.currentTime = rec.tvTime; } catch (e) {} }
          video.play().catch(() => {});
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            switch (data.type) {
              case Hls.ErrorTypes.NETWORK_ERROR: this._notifyTV('⚠️ Error de red en HLS'); break;
              case Hls.ErrorTypes.MEDIA_ERROR: this._notifyTV('⚠️ Error de decodificación'); hls.recoverMediaError(); break;
              default: this._notifyTV('⚠️ No se puede reproducir el stream'); hls.destroy(); break;
            }
          }
        });
      } else {
        this._notifyTV('⚠️ HLS no soportado en este navegador');
      }
    } else {
      video.src = url;
      video.addEventListener('loadeddata', () => {
        attachTexture();
        if (rec.tvTime && rec.tvTime > 0) { try { video.currentTime = rec.tvTime; } catch (e) {} }
        video.play().catch(() => {});
      });
      video.addEventListener('error', () => { this._notifyTV('⚠️ Error al cargar el video'); });
    }
  }

  stopTVContent(rec) {
    if (this.tvHls) { try { this.tvHls.destroy(); } catch (e) {} this.tvHls = null; }
    if (this.tvVideo) {
      this.tvVideo.pause(); this.tvVideo.src = ''; this.tvVideo.load && this.tvVideo.load();
      this.tvVideo.remove(); this.tvVideo = null;
    }
    if (this.tvAudio) {
      this.tvAudio.pause(); this.tvAudio.src = ''; this.tvAudio.remove(); this.tvAudio = null;
    }
    if (this._audioVizRAF) { cancelAnimationFrame(this._audioVizRAF); this._audioVizRAF = null; }
    const overlay = document.getElementById('tvOverlay');
    if (overlay) {
      overlay.style.display = 'none';
      const inner = document.getElementById('tvOverlayInner');
      if (inner) inner.innerHTML = '';
    }
    if (rec && rec.obj && rec.obj.userData.screen) {
      rec.obj.userData.screen.material = new THREE.MeshBasicMaterial({ color: 0xeeeeee });
      rec.obj.userData.screenMat = rec.obj.userData.screen.material;
    }
  }

  _startAudioVisualization(rec) {
    const screen = rec.obj.userData.screen;
    const canvas = document.createElement('canvas');
    canvas.width = 512; canvas.height = 288;
    const ctx = canvas.getContext('2d');
    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    screen.material = new THREE.MeshBasicMaterial({ map: tex });
    rec.obj.userData.screenMat = screen.material;

    const bars = 32;
    const draw = () => {
      ctx.fillStyle = '#0a0a1a'; ctx.fillRect(0, 0, 512, 288);
      const t = performance.now() / 200;
      for (let i = 0; i < bars; i++) {
        const h = 40 + Math.abs(Math.sin(t + i * 0.4)) * 180 + Math.random() * 30;
        const x = i * (512 / bars) + 2; const w = (512 / bars) - 4;
        const grad = ctx.createLinearGradient(0, 288 - h, 0, 288);
        grad.addColorStop(0, '#40c8d8'); grad.addColorStop(1, '#a03aa0');
        ctx.fillStyle = grad; ctx.fillRect(x, 288 - h, w, h);
      }
      ctx.fillStyle = '#cfe4ff'; ctx.font = 'bold 20px Arial'; ctx.textAlign = 'center';
      ctx.fillText('🎵 Reproduciendo', 256, 30);
      tex.needsUpdate = true;
      this._audioVizRAF = requestAnimationFrame(draw);
    };
    draw();
  }

  _updateTVAudioVolume() {
    const sources = [];
    if (this.tvVideo) sources.push(this.tvVideo);
    if (this.tvAudio) sources.push(this.tvAudio);
    if (sources.length === 0) return;
    let tvPos = null;
    if (this.tvTarget && this.tvTarget.obj) tvPos = this.tvTarget.obj.position;
    else {
      for (const p of this.placed) { if (p.type === 'tv' && p.tvUrl) { tvPos = p.obj.position; break; } }
    }
    if (!tvPos) { for (const src of sources) src.volume = 0; return; }
    const dx = this.camera.position.x - tvPos.x; const dz = this.camera.position.z - tvPos.z;
    const dist = Math.hypot(dx, dz);
    let vol = 0;
    if (dist <= this.audioMinDist) vol = 1;
    else if (dist >= this.audioMaxDist) vol = 0;
    else { const t = (dist - this.audioMinDist) / (this.audioMaxDist - this.audioMinDist); vol = 1 - t; vol = vol * vol; }
    for (const src of sources) src.volume = Math.max(0, Math.min(1, vol));
  }

  _saveTVCursor() {
    if (!this.tvVideo && !this.tvAudio) return;
    let tvPos = null;
    if (this.tvTarget && this.tvTarget.obj) tvPos = this.tvTarget.obj.position;
    else { for (const p of this.placed) { if (p.type === 'tv' && p.tvUrl) { tvPos = p.obj.position; break; } } }
    if (!tvPos) return;
    let rec = null;
    for (const p of this.placed) { if (p.type === 'tv' && p.obj.position === tvPos) { rec = p; break; } }
    if (!rec) return;
    const t = this.tvVideo ? this.tvVideo.currentTime : (this.tvAudio ? this.tvAudio.currentTime : 0);
    const saved = this.save.placedFurniture ?? [];
    const i = saved.findIndex(s => s.type === 'tv' && Math.abs(s.x - rec.x) < 0.01 && Math.abs(s.z - rec.z) < 0.01);
    if (i >= 0) { saved[i].tvTime = t; if (typeof this.onTVSave === 'function') this.onTVSave(); }
  }

  openTVPanel(rec, isPainting = false) {
    this.tvTarget = rec;
    const panel = document.getElementById('tvPanel');
    const input = document.getElementById('tvUrl');
    const title = document.getElementById('tvPanelTitle');
    const hint = document.getElementById('tvPanelHint');
    const samples = document.getElementById('tvSamplesContainer');
    const loadBtn = document.getElementById('tvLoad');
    const stopBtn = document.getElementById('tvStop');

    if (panel) panel.style.display = 'flex';
    if (input) input.value = rec.tvUrl ?? '';

    if (isPainting) {
      if (title) title.textContent = '🖼️ Configurar Cuadro';
      if (hint) hint.textContent = 'Pega un enlace de imagen para el cuadro.';
      if (samples) samples.style.display = 'none';
      if (loadBtn) loadBtn.textContent = '🖼️ Aplicar';
      if (stopBtn) stopBtn.style.display = 'none';
    } else {
      if (title) title.textContent = '📺 Configurar TV';
      if (hint) hint.textContent = 'Pega un enlace de imagen, GIF, video, audio o YouTube.';
      if (samples) samples.style.display = 'block';
      if (loadBtn) loadBtn.textContent = '▶ Reproducir';
      if (stopBtn) stopBtn.style.display = 'block';
    }

    const editPanel = document.getElementById('editPanel');
    if (editPanel) editPanel.style.display = 'none';
  }

  closeTVPanel() {
    const panel = document.getElementById('tvPanel');
    if (panel) panel.style.display = 'none';
    if (this.editMode && this.editTarget) {
      const editPanel = document.getElementById('editPanel');
      if (editPanel) editPanel.style.display = 'flex';
    }
  }

  saveMediaUrl(rec, url) {
    rec.tvUrl = url;
    const saved = this.save.placedFurniture ?? [];
    const i = saved.findIndex(s => s.type === rec.type && Math.abs(s.x - rec.x) < 0.01 && Math.abs(s.z - rec.z) < 0.01);
    if (i >= 0) {
      saved[i].tvUrl = url;
      saved[i].tvTime = 0;
    }
    if (typeof this.onTVSave === 'function') this.onTVSave();
  }

  _notifyTV(msg) {
    let el = document.getElementById('toast');
    if (!el) { el = document.createElement('div'); el.id = 'toast'; document.body.appendChild(el); }
    el.textContent = msg; el.classList.add('show');
    clearTimeout(this._toastTvTimer);
    this._toastTvTimer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  _resize() {
    this.camera.aspect = innerWidth / innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(innerWidth, innerHeight);
  }

  _rampaYAt(x, z, currentFeetY) {
    for (const p of this.placed) {
      if (!p.type.startsWith('escalera')) continue;
      const stair = p.obj.userData.stair; if (!stair) continue;
      const baseY = p.y ?? 0;
      if (baseY > currentFeetY + 2.5) continue;
      if (baseY + stair.height < currentFeetY - 2.5) continue;
      const dx = x - p.x; const dz = z - p.z;
      const rot = p.rotY ?? 0; const cos = Math.cos(-rot); const sin = Math.sin(-rot);
      const lx = dx * cos - dz * sin; const lz = dx * sin + dz * cos;
      const halfW = stair.width / 2; const halfL = stair.length / 2;
      if (Math.abs(lx) > halfW) continue;
      if (Math.abs(lz) > halfL) continue;
      const t = (lz + halfL) / stair.length; const clampedT = Math.max(0, Math.min(1, t));
      return baseY + clampedT * stair.height;
    }
    return null;
  }

  _surfaceYAt(x, z, currentFeetY) {
    let best = 0;
    for (const p of this.placed) {
      if (p.type.startsWith('escalera')) continue;
      if (!(p.type in this._walkables)) continue;
      const baseY = p.y ?? 0;
      if (baseY > currentFeetY + 2.5) continue;
      const dx = x - p.x; const dz = z - p.z;
      const r = p.radius;
      if (Math.abs(dx) < r && Math.abs(dz) < r) {
        const d = Math.hypot(dx, dz);
        if (d < r) {
          const topY = baseY + (this._walkables[p.type] ?? 0);
          if (topY > best && topY <= currentFeetY + 0.6) best = topY;
        }
      }
    }
    return best;
  }

  _updatePlayerPhysics(dt) {
    if (this.isSeated || this.isSleeping) { this.playerVelY = 0; return; }
    const moveVec = this.controls.getMoveVector();
    const speed = 4.0; const moving = moveVec.lengthSq() > 0.0001;
    this.camera.position.addScaledVector(moveVec, speed * dt);
    this._clampToWorld(this.camera.position);
    const rampaY = this._rampaYAt(this.camera.position.x, this.camera.position.z, this.playerFeetY);
    if (rampaY !== null) {
      const k = Math.min(1, 12 * dt);
      this.playerFeetY += (rampaY - this.playerFeetY) * k;
      if (Math.abs(this.playerFeetY - rampaY) < 0.01) this.playerFeetY = rampaY;
      this.playerVelY = 0; this.camera.position.y = this.playerFeetY + this.PLAYER_HEIGHT;
    } else {
      const wantJump = this.controls.consumeJump();
      if (wantJump && Math.abs(this.playerVelY) < 0.01) this.playerVelY = this.JUMP_VELOCITY;
      this.playerVelY += this.GRAVITY * dt; this.playerFeetY += this.playerVelY * dt;
      const surfaceY = this._surfaceYAt(this.camera.position.x, this.camera.position.z, this.playerFeetY);
      if (this.playerFeetY <= surfaceY) {
        const diff = surfaceY - this.playerFeetY;
        if (diff > 0.5 && Math.abs(this.playerVelY) > 0.5) { this.playerFeetY = surfaceY; this.playerVelY = 0; }
        else {
          const k = Math.min(1, this._stepLerpSpeed * dt);
          this.playerFeetY += diff * k;
          if (Math.abs(this.playerFeetY - surfaceY) < 0.01) { this.playerFeetY = surfaceY; this.playerVelY = 0; }
        }
      }
      this.camera.position.y = this.playerFeetY + this.PLAYER_HEIGHT;
    }

    if (this.playerAvatar) {
      this.playerAvatar.position.x = this.camera.position.x;
      this.playerAvatar.position.z = this.camera.position.z;
      this.playerAvatar.position.y = this.playerFeetY;
      if (moving) {
        const targetHeading = Math.atan2(moveVec.x, moveVec.z);
        let diff = targetHeading - this._avatarHeading;
        while (diff > Math.PI) diff -= Math.PI * 2;
        while (diff < -Math.PI) diff += Math.PI * 2;
        this._avatarHeading += diff * Math.min(1, 12 * dt);
        this.playerAvatar.rotation.y = this._avatarHeading;
      }
      const brazoIzq = this.playerAvatar.userData.brazoIzq;
      const brazoDer = this.playerAvatar.userData.brazoDer;
      const piernaIzq = this.playerAvatar.userData.piernaIzq;
      const piernaDer = this.playerAvatar.userData.piernaDer;
      if (moving) {
        this._walkPhase += dt * 8; const swing = Math.sin(this._walkPhase) * 0.7;
        if (brazoIzq) brazoIzq.rotation.x =  swing;
        if (brazoDer) brazoDer.rotation.x = -swing;
        if (piernaIzq) piernaIzq.rotation.x = -swing;
        if (piernaDer) piernaDer.rotation.x =  swing;
      } else {
        const k = Math.min(1, 10 * dt);
        if (brazoIzq)  brazoIzq.rotation.x  += (0 - brazoIzq.rotation.x)  * k;
        if (brazoDer)  brazoDer.rotation.x  += (0 - brazoDer.rotation.x)  * k;
        if (piernaIzq) piernaIzq.rotation.x += (0 - piernaIzq.rotation.x) * k;
        if (piernaDer) piernaDer.rotation.x += (0 - piernaDer.rotation.x) * k;
      }
    }
  }

  _clampToWorld(pos) {
    const m = 1.0;
    pos.x = Math.max(-this.HALF + m, Math.min(this.HALF - m, pos.x));
    pos.z = Math.max(-this.HALF + m, Math.min(this.HALF - m, pos.z));
    const playerR = 0.35; const DOOR_W = 1.2; const DOOR_HALF = DOOR_W / 2; const DOOR_PASS_HALF = DOOR_HALF - 0.05;

    for (const p of this.placed) {
      if (!p.type.startsWith('muro')) continue;
      const rot = ((p.rotY % (2 * Math.PI)) + 2 * Math.PI) % (2 * Math.PI);
      const horizontal = Math.abs(Math.sin(rot)) < 0.5;
      const halfX = horizontal ? 2.0 : 0.1; const halfZ = horizontal ? 0.1 : 2.0;
      const dx = Math.abs(pos.x - p.x); const dz = Math.abs(pos.z - p.z);
      const isDoor = p.type === 'muro_puerta' || p.type === 'muro_puerta_prem';
      const isOpen = isDoor && p.obj?.userData?.puertaAbierta === true;

      if (isOpen) {
        const lx = horizontal ? (pos.x - p.x) : (pos.z - p.z);
        if (Math.abs(lx) < DOOR_PASS_HALF) continue;
        if (dx < halfX + playerR && dz < halfZ + playerR) {
          const overlapX = halfX + playerR - dx; const overlapZ = halfZ + playerR - dz;
          if (overlapX < overlapZ) pos.x = p.x + Math.sign(pos.x - p.x || 1) * (halfX + playerR);
          else pos.z = p.z + Math.sign(pos.z - p.z || 1) * (halfZ + playerR);
        }
      } else {
        if (dx < halfX + playerR && dz < halfZ + playerR) {
          const overlapX = halfX + playerR - dx; const overlapZ = halfZ + playerR - dz;
          if (overlapX < overlapZ) pos.x = p.x + Math.sign(pos.x - p.x || 1) * (halfX + playerR);
          else pos.z = p.z + Math.sign(pos.z - p.z || 1) * (halfZ + playerR);
        }
      }
    }

    for (const p of this.placed) {
      if (p.type.startsWith('muro') || p.type.startsWith('techo')) continue;
      if (p.type === 'alfombra' || p.type === 'parche_pasto' || p.type === 'flores') continue;
      if (p.type.startsWith('escalera')) continue;
      const dx = pos.x - p.x; const dz = pos.z - p.z; const d = Math.hypot(dx, dz);
      const minD = p.radius + 0.25;
      if (d < minD) {
        const ang = Math.atan2(dz, dx);
        pos.x = p.x + Math.cos(ang) * minD; pos.z = p.z + Math.sin(ang) * minD;
      }
    }
  }

  _updateDoors(dt) {
    const OPEN_DISTANCE = 2.5; const OPEN_ANGLE = Math.PI / 2; const LERP_SPEED = 8;
    for (const p of this.placed) {
      if (p.type !== 'muro_puerta' && p.type !== 'muro_puerta_prem') continue;
      const hinge = p.obj?.userData?.puerta; if (!hinge) continue;
      const dx = this.camera.position.x - p.x; const dz = this.camera.position.z - p.z;
      const dist = Math.hypot(dx, dz);
      const shouldOpen = dist < OPEN_DISTANCE;
      p.obj.userData.puertaAbierta = shouldOpen;
      const targetAngle = shouldOpen ? -OPEN_ANGLE : 0;
      const current = hinge.rotation.y;
      const next = current + (targetAngle - current) * Math.min(1, LERP_SPEED * dt);
      if (Math.abs(next - targetAngle) < 0.001) {
        if (Math.abs(hinge.rotation.y - targetAngle) > 0.0001) { hinge.rotation.y = targetAngle; this.renderer.shadowMap.needsUpdate = true; }
      } else { hinge.rotation.y = next; this.renderer.shadowMap.needsUpdate = true; }
    }
  }

  _animateGrass() {
    if (this.save.quality !== 'alta') return;

    const dummy = new THREE.Object3D();

    for (const p of this.placed) {
      if (p.type !== 'parche_pasto') continue;

      const grassMesh = p.obj.userData.grassMesh;
      const baseMatrices = grassMesh?.userData?.baseMatrix;
      if (!grassMesh || !baseMatrices) continue;

      for (let i = 0; i < grassMesh.count; i++) {
        const baseMatrix = baseMatrices[i];
        if (!baseMatrix) continue;

        const basePos = new THREE.Vector3().setFromMatrixPosition(baseMatrix);

        const phase = basePos.x * 1.1 + basePos.z * 1.1;
        const t = this.windTime + phase;

        const windX = Math.sin(t) * this.windAmplitude;
        const windZ = Math.cos(t * 0.7) * this.windAmplitude * 0.5;

        dummy.position.copy(basePos);
        dummy.rotation.set(windX, 0, windZ);
        dummy.scale.set(1, 1, 1);
        dummy.updateMatrix();
        grassMesh.setMatrixAt(i, dummy.matrix);
      }

      grassMesh.instanceMatrix.needsUpdate = true;
    }
  }

  start(onTick) {
    const step = () => {
      const dt = Math.min(this.clock.getDelta(), 0.1);
      
      this.windTime += dt * this.windSpeed;

      this._updateDayCycle(dt);
      this._updateWeather(dt);
      this._updateClouds(dt);
      this._updateTVAudioVolume();
      this._updateDoors(dt);
      this._animateGrass();

      this._tvSaveTimer += dt;
      if (this._tvSaveTimer >= 2) { this._tvSaveTimer = 0; this._saveTVCursor(); }
      this._updatePlayerPhysics(dt);
      this._updateInteractBtn();

      for (const p of this.placed) {
        if (p.type === 'techo_ventilador' && p.obj.userData.ventilador) {
          p.obj.userData.ventilador.rotation.y += dt * 5;
        }
      }

      if (this.ghost) {
        const f = new THREE.Vector3(-Math.sin(this.controls.yaw), 0, -Math.cos(this.controls.yaw));
        const target = this.camera.position.clone().addScaledVector(f, 3);
        let gx = Math.round(target.x * 2) / 2; let gz = Math.round(target.z * 2) / 2;
        let rotY = this.manualRotY; let gy = this.playerFeetY;
        const id = this.selectedId;

        if (id && id.startsWith('techo_')) gy = this.playerFeetY + 3.0;

        const isBuild = id && (id.startsWith('muro') || id.startsWith('techo'));
        const allowOutdoor = this._outdoorAllowed.has(id);
        const isStackable = this._stackable.includes(id);
        const mustBeInPlot = !isBuild && !allowOutdoor && !isStackable;

        if (mustBeInPlot && !this._isInsideAnyPlot(gx, gz, 0.15)) {
          const snapped = this._snapToNearestPlot(gx, gz, 0.2);
          gx = snapped.x; gz = snapped.z;
        }

        if (isStackable) {
          const prevDebug = this._debugWallSnap; this._debugWallSnap = false;
          const res = this._resolveStackableSnap(id, gx, gz, rotY);
          this._debugWallSnap = prevDebug;
          if (res && res.ok) { gx = res.x; gz = res.z; rotY = res.rotY; gy = res.y; }
          else if (res && !res.ok) gy = this.playerFeetY;
        }

        this.ghost.position.x = gx; this.ghost.position.y = gy; this.ghost.position.z = gz;
        this.ghost.rotation.y = rotY;
        const ok = this._isValidPlacement(gx, gz);
        this.ghost.traverse(o => { if (o.isMesh && o.material && o.material.color) o.material.color.set(ok ? 0x66ff88 : 0xff5566); });
      }

      if (this.editMode && !this.moveMode) {
        this._updateEditTarget();
        if (this._lastHighlight) this.highlightTarget(this._lastHighlight);
      }
      if (onTick) onTick(this, dt);

      this._fpsFrames++;
      this._fpsElapsed += dt;
      if (this._fpsElapsed >= 0.5) {
        const fps = Math.round(this._fpsFrames / this._fpsElapsed);
        const el = document.getElementById('fps');
        if (el) el.textContent = `FPS: ${fps}`;
        this._fpsFrames = 0;
        this._fpsElapsed = 0;
      }

      this.renderer.render(this.scene, this.camera);
      requestAnimationFrame(step);
    };
    step();
  }

  getState() {
    return {
      position: { x: this.camera.position.x, y: this.camera.position.y, z: this.camera.position.z },
      rotation: { yaw: this.controls.yaw, pitch: this.controls.pitch },
      placedFurniture: this.save.placedFurniture,
      dayTime: this.dayTime,
      plotFloors: this.save.plotFloors ?? {},
      weather: this.targetWeather,
    };
  }
}