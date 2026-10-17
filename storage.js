// storage.js
const KEY = 'mi-mundo-save-v1';

export const Storage = {
  default() {
    return {
      playerName: 'Invitado',
      position: { x: 0, y: 1.6, z: 22 },
      rotation: { yaw: 0, pitch: 0 },
      room: 'calle',
      quality: 'media',
      sensitivity: 4,
      musicOn: false,
      coins: 100,
      inventory: ['cama', 'mesa', 'silla'],
      // Cada mueble: { type, x, z, rotY, houseIndex }
      placedFurniture: [],
      lastSave: Date.now(),
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.default();
      const data = JSON.parse(raw);
      return { ...this.default(), ...data };
    } catch {
      return this.default();
    }
  },

  save(state) {
    state.lastSave = Date.now();
    localStorage.setItem(KEY, JSON.stringify(state));
  },

  clear() {
    localStorage.removeItem(KEY);
  },
};