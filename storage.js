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
      placedFurniture: [],
      weather: 'despejado',
      missions: [
        { id: 'm_camas',    title: 'Coloca 3 camas',       reward: 150, done: false, progress: 0, target: 3,  match: 'cama',    type: 'count' },
        { id: 'm_muros',    title: 'Construye 2 paredes',  reward: 120, done: false, progress: 0, target: 2,  match: 'muro',    type: 'count' },
        { id: 'm_mesas',    title: 'Coloca 2 mesas',       reward: 100, done: false, progress: 0, target: 2,  match: 'mesa',    type: 'count' },
        { id: 'm_sillas',   title: 'Coloca 4 sillas',      reward: 80,  done: false, progress: 0, target: 4,  match: 'silla',   type: 'count' },
        { id: 'm_luces',    title: 'Instala 2 luces',      reward: 90,  done: false, progress: 0, target: 2,  match: 'luz',     type: 'count' },
        { id: 'm_plantas',  title: 'Planta 3 vegetales',   reward: 70,  done: false, progress: 0, target: 3,  match: ['arbol', 'arbusto', 'planta', 'flores', 'parche'], type: 'count' },
        { id: 'm_cocina',   title: 'Equipa la cocina',     reward: 130, done: false, progress: 0, target: 2,  match: 'cocina',  type: 'count' },
        { id: 'm_tv',       title: 'Coloca una TV',        reward: 200, done: false, progress: 0, target: 1,  match: 'tv',      type: 'count' },
        { id: 'm_piso',     title: 'Cambia 1 piso',        reward: 60,  done: false, progress: 0, target: 1,  match: 'piso',    type: 'count' },
      ],
      lastSave: Date.now(),
    };
  },

  load() {
    try {
      const raw = localStorage.getItem(KEY);
      if (!raw) return this.default();
      const data = JSON.parse(raw);
      const def = this.default();
      const merged = { ...def, ...data };
      
      // Reparar misiones si faltan campos o si es un save viejo
      if (!Array.isArray(merged.missions) || merged.missions.length === 0) {
        merged.missions = def.missions;
      } else {
        merged.missions = merged.missions.map((m, idx) => ({
          ...def.missions[idx % def.missions.length],
          ...m,
          progress: m.progress ?? 0,
          done: m.done ?? false
        }));
      }
      return merged;
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