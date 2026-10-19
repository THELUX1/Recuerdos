// audio.js
export const Audio = {
  ctx: null,
  buffers: {},
  activeLoops: {},
  enabled: true,
  _loading: false,
  _loaded: false,
  
  // Pool de sonidos para evitar latencia
  pools: {},

  // 🔥 MÚSICA DE FONDO
  bgmMenu: null,
  bgmGame: null,
  _currentBGM: null,
  _bgmVolume: 0.3,
  _bgmFadeTimer: null,

  async init() {
    if (this._loading || this._loaded) return;

    if (this.ctx) {
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        try { await this.ctx.resume(); } catch (_) {}
      }
      return;
    }

    this._loading = true;

    try {
      // 1. Configuración de baja latencia para móviles
      this.ctx = new (window.AudioContext || window.webkitAudioContext)({ latencyHint: 'interactive' });
      
      // Reanudar inmediatamente (por si el navegador lo inició suspendido)
      if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
        try { await this.ctx.resume(); } catch (_) {}
      }
    } catch (e) {
      console.warn('AudioContext no disponible:', e);
      this._loading = false;
      return;
    }

    const files = {
      lluvia: 'sonidos/lluvia.mp3',
      trueno: 'sonidos/trueno.mp3',
      viento: 'sonidos/viento.mp3',
      click:  'sonidos/click.mp3',
      mision: 'sonidos/mision.mp3',
      moneda: 'sonidos/moneda.mp3',
    };

    const loadOne = async (k, url) => {
      try {
        const res = await fetch(url);
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const arr = await res.arrayBuffer();
        this.buffers[k] = await this.ctx.decodeAudioData(arr);
        console.log(`🔊 ${k} cargado`);
      } catch (e) {
        console.warn(`No se pudo cargar ${url}`, e);
      }
    };

    await Promise.all(Object.entries(files).map(([k, url]) => loadOne(k, url)));

    this._loaded = true;
    this._loading = false;

    // Pre-cargar el pool de sonidos cortos (latencia 0)
    this._setupPool('click', 10);
    this._setupPool('moneda', 5);
    this._setupPool('mision', 3);

    // 2. Mantener el motor de audio despierto con un buffer silencioso
    this._keepAlive();

    if (!this.enabled) {
      for (const k of Object.keys(this.activeLoops)) this.stopLoop(k);
    }
  },

  // Crea una reserva de nodos listos para usar (evita crear nodos en cada click)
  _setupPool(name, size) {
    if (!this.buffers[name] || this.pools[name]) return;
    this.pools[name] = [];
    
    for (let i = 0; i < size; i++) {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffers[name];
      
      const gain = this.ctx.createGain();
      src.connect(gain).connect(this.ctx.destination);
      
      this.pools[name].push({ src, gain, isPlaying: false });
    }
  },

  // Truco del búfer silencioso: mantiene el hilo de audio activo en móvil
  _keepAlive() {
    if (!this.ctx || !this._loaded) return;
    
    // Buffer de 1 segundo de puro silencio
    const buffer = this.ctx.createBuffer(1, this.ctx.sampleRate, this.ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < data.length; i++) data[i] = 0;
    
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = true;
    
    // Volumen casi 0 (algunos móviles ignoran el 0 absoluto)
    const gain = this.ctx.createGain();
    gain.gain.value = 0.001;
    
    src.connect(gain).connect(this.ctx.destination);
    src.start(0);
    
    this._keepAliveNode = src;
  },

  play(name, { volume = 1, loop = false } = {}) {
    if (!this.ctx) return null;

    // Reanudar el contexto si se durmió (iOS suele usar 'interrupted')
    if (this.ctx.state === 'suspended' || this.ctx.state === 'interrupted') {
      this.ctx.resume().catch(() => {});
    }

    if (!this.enabled || !this.buffers[name]) return null;

    // Si es un sonido corto, usar el Pool (latencia casi cero)
    if (!loop && this.pools[name]) {
      const pool = this.pools[name];
      let voice = pool.find(v => !v.isPlaying);
      
      // Si todos están ocupados, tomar el primero y cortarlo
      if (!voice) {
        voice = pool[0];
        try { voice.src.stop(); } catch (_) {}
      }

      voice.isPlaying = true;
      voice.gain.gain.value = volume;

      try {
        voice.src.disconnect();
        voice.src.connect(voice.gain).connect(this.ctx.destination);
      } catch (_) {}

      voice.src.start(0);

      // Reciclar el nodo al terminar el sonido
      voice.src.onended = () => {
        voice.isPlaying = false;
        const newSrc = this.ctx.createBufferSource();
        newSrc.buffer = this.buffers[name];
        newSrc.connect(voice.gain);
        voice.src = newSrc;
      };

      return { src: voice.src, gain: voice.gain };
    }

    // Fallback: creación normal (para loops o sonidos no encolados)
    const src = this.ctx.createBufferSource();
    src.buffer = this.buffers[name];
    src.loop = loop;

    const gain = this.ctx.createGain();
    gain.gain.value = volume;
    src.connect(gain).connect(this.ctx.destination);
    src.start();

    if (loop) {
      this.activeLoops[name] = { src, gain };
    }
    return { src, gain };
  },

  setLoopVolume(name, volume) {
    const l = this.activeLoops[name];
    if (!l || !this.ctx) return;
    const v = Math.max(0, Math.min(1, volume));
    l.gain.gain.setTargetAtTime(v, this.ctx.currentTime, 0.3);
  },

  stopLoop(name) {
    const l = this.activeLoops[name];
    if (!l) return;
    try { l.src.stop(); } catch (_) {}
    delete this.activeLoops[name];
  },

  setEnabled(on) {
    this.enabled = !!on;
    if (!on) {
      for (const k of Object.keys(this.activeLoops)) this.stopLoop(k);
    }
  },

  // ============================================
  // 🔥 MÉTODOS DE MÚSICA DE FONDO
  // ============================================

  playBGM(type = 'game', volume = 0.3) {
  this._bgmVolume = volume;
  
  // Si ya está sonando esa misma canción, solo ajustar volumen
  if (this._currentBGM === type) {
    const track = type === 'menu' ? this.bgmMenu : this.bgmGame;
    if (track) this._fadeTo(track, volume, 500);
    return;
  }

  // 🔥 DETENER INMEDIATAMENTE la música anterior (sin fade)
  // Esto evita que se solapen.
  if (this.bgmMenu) { 
    this.bgmMenu.pause(); 
    this.bgmMenu.currentTime = 0; 
    this.bgmMenu = null; 
  }
  if (this.bgmGame) { 
    this.bgmGame.pause(); 
    this.bgmGame.currentTime = 0; 
    this.bgmGame = null; 
  }
  
  // Cancelar cualquier fade en curso
  if (this._bgmFadeTimer) { 
    clearInterval(this._bgmFadeTimer); 
    this._bgmFadeTimer = null; 
  }

  // Crear el nuevo audio
  const url = type === 'menu' ? 'sonidos/menu.mp3' : 'sonidos/juego.mp3';
  const audio = document.createElement('audio');
  audio.src = url;
  audio.loop = true;
  audio.volume = 0;
  audio.preload = 'auto';

  // Guardar referencia
  if (type === 'menu') this.bgmMenu = audio;
  else this.bgmGame = audio;
  this._currentBGM = type;

  // Reproducir con fundido de entrada
  const playPromise = audio.play();
  if (playPromise) {
    playPromise.then(() => {
      this._fadeTo(audio, volume, 1100);
      console.log(`🎵 Música de ${type} reproduciéndose`);
    }).catch(err => {
      console.warn(`No se pudo reproducir música de ${type}:`, err);
      this._currentBGM = null;
    });
  }
}, 

  stopBGM() {
    const track = this._currentBGM === 'menu' ? this.bgmMenu : this.bgmGame;
    if (!track) {
      this._currentBGM = null;
      return;
    }

    // Fundido de salida
    this._fadeTo(track, 0, 800, () => {
      track.pause();
      track.currentTime = 0;
    });
    
    this._currentBGM = null;
  },

  setBGMVolume(volume) {
    this._bgmVolume = volume;
    const track = this._currentBGM === 'menu' ? this.bgmMenu : this.bgmGame;
    if (track) this._fadeTo(track, volume, 100);
  },

  _fadeTo(track, targetVolume, duration = 500, onComplete = null) {
    if (!track) return;
    
    if (this._bgmFadeTimer) clearInterval(this._bgmFadeTimer);
    
    const startVol = track.volume;
    const steps = 30;
    const interval = duration / steps;
    let currentStep = 0;

    this._bgmFadeTimer = setInterval(() => {
      currentStep++;
      const progress = currentStep / steps;
      const newVol = startVol + (targetVolume - startVol) * progress;
      
      track.volume = Math.max(0, Math.min(1, newVol));

      if (currentStep >= steps) {
        clearInterval(this._bgmFadeTimer);
        this._bgmFadeTimer = null;
        track.volume = targetVolume;
        if (onComplete) onComplete();
      }
    }, interval);
  },
};

// Expone Audio globalmente para debug en consola
if (typeof window !== 'undefined') {
  window.Audio = Audio;
}