// shop.js
import { Storage } from './storage.js';

export const SHOP_ITEMS = [
  // --- Camas ---
  { id: 'cama_basica',   name: 'Cama básica',    emoji: '🛏️', price: 0,   free: true,  category: 'cama', premium: false },
  { id: 'cama_doble',    name: 'Cama Personalizable',     emoji: '🛏️', price: 60,  free: false, category: 'cama', premium: false },
  { id: 'cama_premium',  name: 'Cama Personalizable',   emoji: '🛌', price: 150, free: false, category: 'cama', premium: true  },
  { id: 'cama_king',     name: 'Cama Personalizable',      emoji: '👑', price: 280, free: false, category: 'cama', premium: true  },

  // --- Mesas ---
  { id: 'mesa_basica',   name: 'Mesa básica',    emoji: '🪵', price: 0,   free: true,  category: 'mesa', premium: false },
  { id: 'mesa_redonda',  name: 'Mesa redonda',   emoji: '⭕', price: 50,  free: false, category: 'mesa', premium: false },
  { id: 'mesa_premium',  name: 'Mesa Personalizable',   emoji: '🍽️', price: 120, free: false, category: 'mesa', premium: true  },
  { id: 'mesa_luz',      name: 'Mesa de luz',    emoji: '🛋️', price: 30,  free: false, category: 'mesa', premium: false },

  // --- Sillas ---
  { id: 'silla_basica',  name: 'Silla básica',   emoji: '🪑', price: 0,   free: true,  category: 'silla', premium: false },
  { id: 'silla_tapizada',name: 'Silla Personalizable', emoji: '💺', price: 40,  free: false, category: 'silla', premium: false },
  { id: 'silla_premium', name: 'Silla Personalizable',  emoji: '👑', price: 90,  free: false, category: 'silla', premium: true  },

  // --- Almacenamiento ---
  { id: 'ropero',        name: 'Ropero',         emoji: '🚪', price: 70,  free: false, category: 'mueble', premium: false },
  { id: 'alacena',       name: 'Alacena baja',   emoji: '🗄️', price: 90,  free: false, category: 'mueble', premium: false },

  // --- Sala de estar (Living) ---
  { id: 'sofa',           name: 'Sofá',           emoji: '🛋️', price: 120, free: false, category: 'mueble', premium: false },
  { id: 'mesa_ratona',    name: 'Mesa ratona',    emoji: '☕', price: 55,  free: false, category: 'mueble', premium: false },
  { id: 'estanteria',     name: 'Estantería',     emoji: '📚', price: 85,  free: false, category: 'mueble', premium: false },
  { id: 'cuadro',         name: 'Cuadro Personalizable', emoji: '🖼️', price: 40, free: false, category: 'mueble', premium: true },
  { id: 'techo_ventilador', name: 'Ventilador de techo', emoji: '🌀', price: 95, free: false, category: 'mueble', premium: false },

  // --- Cocina ---
  { id: 'cocina_gas',           name: 'Cocina a gas',        emoji: '🔥', price: 100, free: false, category: 'cocina', premium: false },
  { id: 'cocina_electrica',     name: 'Cocina eléctrica',    emoji: '⚡', price: 140, free: false, category: 'cocina', premium: false },
  { id: 'bajo_mesada_pileta',   name: 'Bajo mesada + pileta',emoji: '🚰', price: 130, free: false, category: 'cocina', premium: false },
  { id: 'alacena_aerea',        name: 'Alacena aérea',       emoji: '🗄️', price: 80,  free: false, category: 'cocina', premium: false },
  { id: 'lavavajillas',         name: 'Lavavajillas',        emoji: '🧼', price: 160, free: false, category: 'cocina', premium: false },
  { id: 'horno_electrico',      name: 'Horno eléctrico',     emoji: '🔥', price: 150, free: false, category: 'cocina', premium: false },
  { id: 'pava_electrica',       name: 'Pava eléctrica',      emoji: '☕', price: 35,  free: false, category: 'cocina', premium: false },
  { id: 'licuadora',            name: 'Licuadora',           emoji: '🥤', price: 45,  free: false, category: 'cocina', premium: false },
  { id: 'ollas',                name: 'Ollas (3)',           emoji: '🍲', price: 40,  free: false, category: 'cocina', premium: false },
  { id: 'sarten',               name: 'Sartén',              emoji: '🍳', price: 25,  free: false, category: 'cocina', premium: false },

  // --- Luces ---
  { id: 'luz_plafon',           name: 'Plafón LED',          emoji: '💡', price: 30,  free: false, category: 'luz', premium: false },
  { id: 'luz_candelabro',       name: 'Candelabro',          emoji: '🕯️', price: 70,  free: false, category: 'luz', premium: false },
  { id: 'luz_aplique',          name: 'Reflector LED',       emoji: '🔦', price: 45,  free: false, category: 'luz', premium: false },

  // --- Plantas ---
  { id: 'planta_maceta', name: 'Maceta',          emoji: '🪴', price: 15,  free: false, category: 'planta', premium: false },
  { id: 'arbusto',       name: 'Arbusto',         emoji: '🌿', price: 25,  free: false, category: 'planta', premium: false },
  { id: 'arbol_chico',   name: 'Pino',            emoji: '🌲', price: 60,  free: false, category: 'planta', premium: false },
  { id: 'arbol_grande',  name: 'Árbol Frondoso',  emoji: '🌳', price: 120, free: false, category: 'planta', premium: false },
  { id: 'arbol_muerto',  name: 'Árbol Muerto',    emoji: '🪵', price: 50,  free: false, category: 'planta', premium: false }, // NUEVO
  { id: 'tronco',        name: 'Tronco',          emoji: '🪵', price: 10,  free: false, category: 'planta', premium: false }, // NUEVO
  { id: 'parche_pasto',  name: 'Parche de pasto', emoji: '🌾', price: 10,  free: false, category: 'planta', premium: false },
  { id: 'flores',        name: 'Flores',          emoji: '🌸', price: 8,   free: false, category: 'planta', premium: false },

  // --- Otros ---
  { id: 'lampara',       name: 'Lámpara de pie', emoji: '💡', price: 30,  free: false, category: 'otro', premium: false },
  { id: 'lampara_mesa',  name: 'Lámpara de mesa', emoji: '🛋️', price: 20,  free: false, category: 'otro', premium: false },
  { id: 'alfombra',      name: 'Alfombra',       emoji: '🟫', price: 25,  free: false, category: 'otro', premium: false },

  // --- MUROS ---
  { id: 'muro_basico',       name: 'Pared',           emoji: '🧱', price: 0,  free: true,  category: 'muro', premium: false },
  { id: 'muro_puerta',       name: 'Pared + puerta',  emoji: '🚪', price: 0,  free: true,  category: 'muro', premium: false },
  { id: 'muro_ventana',      name: 'Pared + ventana', emoji: '🪟', price: 0,  free: true,  category: 'muro', premium: false },
  { id: 'muro_premium',      name: 'Pared Personalizable',   emoji: '✨', price: 40, free: false, category: 'muro', premium: true  },
  { id: 'muro_puerta_prem',  name: 'Puerta Personalizable',  emoji: '🚪', price: 60, free: false, category: 'muro', premium: true, hasStyle: true },
  { id: 'muro_ventana_prem', name: 'Ventana Personalizable', emoji: '🪟', price: 60, free: false, category: 'muro', premium: true, hasStyle: true },

  // --- SUELOS ---
  { id: 'piso_madera',   name: 'Piso madera',    emoji: '🟫', price: 0,   free: true,  category: 'piso', premium: false },
  { id: 'piso_baldosa',  name: 'Piso baldosa',   emoji: '⬜', price: 20,  free: false, category: 'piso', premium: false },
  { id: 'piso_cesped',   name: 'Piso césped',    emoji: '🟩', price: 15,  free: false, category: 'piso', premium: false },
  { id: 'piso_piedra',   name: 'Piso piedra',    emoji: '⬛', price: 35,  free: false, category: 'piso', premium: false },
  { id: 'piso_azulejo',  name: 'Piso azulejo',   emoji: '🔷', price: 30,  free: false, category: 'piso', premium: false },
  { id: 'piso_liso',     name: 'Piso liso Personalizable',      emoji: '✨', price: 45,  free: false, category: 'piso', premium: true  },

  // --- TECHOS ---
  { id: 'techo_basico',  name: 'Techo',          emoji: '🏠', price: 30,  free: false, category: 'techo', premium: true },

  // --- MASCOTAS ---
  { id: 'mascota_corgi', name: 'Corgi', price: 500, category: 'mascota', emoji: '🐶', isCompanion: true },
  { id: 'mascota_panda', name: 'Panda rojo', price: 600, category: 'mascota', emoji: '🐼', isCompanion: true },
  { id: 'mascota_zorro', name: 'Zorro', price: 600, category: 'mascota', emoji: '🦊', isCompanion: true },
  { id: 'mascota_pato', name: 'Pato', price: 300, category: 'mascota', emoji: '🦆', isCompanion: true },
  { id: 'mascota_hipopotamo', name: 'Hipopótamo', price: 800, category: 'mascota', emoji: '🦛', isCompanion: true },
  { id: 'mascota_rinoceronte', name: 'Rinoceronte', price: 900, category: 'mascota', emoji: '🦏', isCompanion: true },
  { id: 'mascota_tiburon', name: 'Tiburón', price: 700, category: 'mascota', emoji: '🦈', isCompanion: true },
  { id: 'mascota_murcielago', name: 'Murciélago', price: 400, category: 'mascota', emoji: '🦇', isCompanion: true },
  { id: 'mascota_ornitorrinco', name: 'Ornitorrinco', price: 550, category: 'mascota', emoji: '🦫', isCompanion: true },
  { id: 'mascota_medusa', name: 'Medusa', price: 450, category: 'mascota', emoji: '🪼', isCompanion: true },
  { id: 'mascota_pez', name: 'Pez linterna', price: 350, category: 'mascota', emoji: '🐟', isCompanion: true },

  // --- ELECTRODOMÉSTICOS ---
  { id: 'tv',   name: 'TV',    emoji: '📺', price: 80, free: false, category: 'electro', premium: false },
];

export const COLOR_PALETTE = [
  '#8a5a35', '#c8a878', '#a03a3a', '#3a6aa0',
  '#3aa060', '#6a3aa0', '#333333', '#f0e8d8',
  '#e8b84a', '#d88a3a', '#e8a0c8', '#40c8d8',
];

export const WALL_PALETTE = [
  '#f0e8d8', '#e8e0d0', '#c8a878', '#8a5a35',
  '#b0605a', '#8a8a8a', '#a8c8e0', '#c8e0a8',
  '#e0d0b8', '#d8b0b0', '#b8b0a8', '#333333',
];

export const DOOR_STYLES = [
  { id: 'madera',    label: '🟫 Madera'    },
  { id: 'blanca',    label: '⬜ Blanca'    },
  { id: 'doble',     label: '🚪 Doble'     },
  { id: 'arco',      label: '🌙 Arco'      },
  { id: 'cristal',   label: '🔷 Cristal'   },
  { id: 'rejilla',   label: '🔲 Rejilla'   },
];

export const WINDOW_STYLES = [
  { id: 'cruz',      label: '➕ Cruz'      },
  { id: 'grande',    label: '🔲 Grande'    },
  { id: 'arco',      label: '🌙 Arco'      },
  { id: 'moderna',   label: '▭ Moderna'    },
  { id: 'mirador',   label: '🏛 Mirador'   },
  { id: 'circular',  label: '⭕ Circular'  },
];

// Selectores de estilo para las plantas
export const PLANT_STYLES = [
  { id: '01', label: '1' }, { id: '02', label: '2' }, { id: '03', label: '3' },
  { id: '04', label: '4' }, { id: '05', label: '5' }, { id: '06', label: '6' },
];

export class Shop {
  constructor(save, { onSelect, onPlace, onCancel } = {}) {
    this.save = save;
    this.onSelect = onSelect;
    this.onPlace = onPlace;
    this.onCancel = onCancel;

    this.selectedId = null;
    this.selectedColor = null;
    this.selectedStyle = null;
    this.currentTab = 'cama';
    this._toastTimer = null;

    this.shopScreen = document.getElementById('shopScreen');
    this.shopGrid   = document.getElementById('shopGrid');
    this.shopCoins  = document.getElementById('shopCoins');

    this.invScreen  = document.getElementById('inventoryScreen');
    this.invGrid    = document.getElementById('inventoryGrid');
    this.invSell    = document.getElementById('inventorySellBtn');
    this.invCancel  = document.getElementById('inventoryCancelBtn');

    this.customizeBar = document.getElementById('customizeBar') || { style: {} };
    this.colorPick    = document.getElementById('colorPicker') || { style: {} };
    this.colorSw      = document.getElementById('colorSwatches') || { children: [], appendChild: () => {} };
    this.stylePick    = document.getElementById('stylePicker') || { style: {} };
    this.styleSw      = document.getElementById('styleSwatches') || { children: [], appendChild: () => {} };

    this.sellScreen = document.getElementById('sellScreen');
    this.sellGrid   = document.getElementById('sellGrid');

    document.getElementById('mainMenuBtn')
      .addEventListener('click', () => this._toggleMainMenu());
    document.getElementById('shopToggle')
      .addEventListener('click', () => { this._hideMainMenu(); this.openShop(); });
    document.getElementById('inventoryToggle')
      .addEventListener('click', () => { this._hideMainMenu(); this.openInventory(); });

    document.querySelectorAll('.closeBtn').forEach(btn => {
      btn.addEventListener('click', () => {
        const id = btn.dataset.close;
        if(document.getElementById(id)) document.getElementById(id).style.display = 'none';
      });
    });

    document.querySelectorAll('.tab').forEach(t => {
      t.addEventListener('click', () => {
        document.querySelectorAll('.tab').forEach(x => x.classList.remove('active'));
        t.classList.add('active');
        this.currentTab = t.dataset.tab;
        this.renderCatalog();
      });
    });

    this.invSell.addEventListener('click', () => this.openSellScreen());
    this.invCancel.addEventListener('click', () => this.cancelSelection());

    this._renderColors();
  }

  _toggleMainMenu() {
    const m = document.getElementById('mainMenu');
    m.style.display = (m.style.display === 'flex') ? 'none' : 'flex';
  }
  _hideMainMenu() {
    document.getElementById('mainMenu').style.display = 'none';
  }

  _toast(msg) {
    let el = document.getElementById('toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'toast';
      document.body.appendChild(el);
    }
    el.textContent = msg;
    el.classList.add('show');
    clearTimeout(this._toastTimer);
    this._toastTimer = setTimeout(() => el.classList.remove('show'), 1600);
  }

  openShop() {
    this.shopScreen.style.display = 'flex';
    this.updateCoins();
    this.renderCatalog();
  }
  closeShop() { this.shopScreen.style.display = 'none'; }

  openInventory() {
    this.invScreen.style.display = 'flex';
    this.renderInventory();
  }
  closeInventory() { this.invScreen.style.display = 'none'; }

  openSellScreen() {
    this.sellScreen.style.display = 'flex';
    this.renderSell();
  }
  closeSellScreen() { this.sellScreen.style.display = 'none'; }

  renderCatalog() {
    this.shopGrid.innerHTML = '';
    const items = SHOP_ITEMS.filter(i => i.category === this.currentTab);

    if (items.length === 0) {
      this.shopGrid.innerHTML = '<p class="hint">Próximamente...</p>';
      return;
    }

    for (const item of items) {
      const canBuy = item.free || this.save.coins >= item.price;

      const el = document.createElement('div');
      el.className = 'shop-item';
      if (!canBuy) el.classList.add('locked');

      el.innerHTML = `
        <span class="emoji">${item.emoji}</span>
        <span class="name">${item.name}${item.premium ? ' ⭐' : ''}</span>
        <span class="price ${item.free ? 'free' : ''}">
          ${item.free ? 'Gratis' : '🪙 ' + item.price}
        </span>
      `;

      el.addEventListener('click', () => {
        if (item.free || this.save.coins >= item.price) {
          
          // === LÓGICA DE MASCOTAS ===
          if (item.isCompanion) {
            if (!this.save.ownedCompanions) this.save.ownedCompanions = [];
            if (this.save.ownedCompanions.includes(item.id)) {
              this.save.activeCompanion = item.id;
              Storage.save(this.save);
              if (window.world && typeof window.world.setCompanion === 'function') window.world.setCompanion(item.id);
              this._toast(`🐾 ${item.name} equipado`);
              this.closeShop();
              return;
            }
            this.save.coins -= item.price;
            this.updateCoins();
            this.save.ownedCompanions.push(item.id);
            this.save.activeCompanion = item.id;
            Storage.save(this.save);
            if (window.world && typeof window.world.setCompanion === 'function') window.world.setCompanion(item.id);
            this.renderCatalog();
            this._toast(`🐾 ${item.name} comprado y equipado`);
            this.closeShop();
            return; 
          }

          // === LÓGICA NORMAL ===
          this.save.coins -= item.price;
          this.addToInventory(item.id, 1);
          this.updateCoins();
          this.renderCatalog();
          this._toast(`✓ ${item.name} enviado a tu inventario`);
        }
      });

      this.shopGrid.appendChild(el);
    }
  }

  addToInventory(id, n = 1) {
    if (!this.save.inventory) this.save.inventory = [];
    for (let i = 0; i < n; i++) this.save.inventory.push(id);
  }

  removeFromInventory(id, n = 1) {
    if (!this.save.inventory) return;
    for (let i = 0; i < n; i++) {
      const idx = this.save.inventory.indexOf(id);
      if (idx >= 0) this.save.inventory.splice(idx, 1);
    }
  }

  countInventory() {
    const counts = {};
    for (const id of (this.save.inventory ?? [])) {
      counts[id] = (counts[id] || 0) + 1;
    }
    return counts;
  }

  renderInventory() {
    this.invGrid.innerHTML = '';

    const counts = this.countInventory();
    const ids = Object.keys(counts);

    if (ids.length === 0) {
      this.invGrid.innerHTML = '<p class="hint">Aún no tienes muebles. ¡Ve a la tienda!</p>';
      return;
    }

    for (const id of ids) {
      const item = SHOP_ITEMS.find(i => i.id === id);
      if (!item) continue;
      const count = counts[id];

      const el = document.createElement('div');
      el.className = 'shop-item';
      el.dataset.id = id;

      el.innerHTML = `
        <span class="emoji">${item.emoji}</span>
        <span class="name">${item.name}${item.premium ? ' ⭐' : ''}</span>
        <span class="owned">x${count}</span>
      `;

      el.addEventListener('click', () => {
        this.selectedId = id;

        // Color
        if (item.premium) {
          this.selectedColor = this.selectedColor ?? WALL_PALETTE[0];
          this.colorPick.style.display = 'block';
          this._highlightColorSwatch();
        } else {
          this.selectedColor = null;
          this.colorPick.style.display = 'none';
        }

        // Estilo (para puertas, ventanas y PLANTAS)
        if (item.hasStyle || item.category === 'planta') {
          this.selectedStyle = this.selectedStyle ?? '01'; // Default style 01
          this.stylePick.style.display = 'block';
          this._renderStyles(id);
        } else {
          this.selectedStyle = null;
          this.stylePick.style.display = 'none';
        }

        const anyCustom = item.premium || item.hasStyle || item.category === 'planta';
        this.customizeBar.style.display = anyCustom ? 'flex' : 'none';

        if (this.onSelect) {
          this.onSelect(this.selectedId, this.selectedColor, this.selectedStyle);
        }

        this.closeInventory();
        this._toast(`Colocando ${item.name}`);
      });

      this.invGrid.appendChild(el);
    }
  }

  _highlightColorSwatch() {
    for (const c of this.colorSw.children) {
      c.classList.toggle('selected', c.dataset.color === this.selectedColor);
    }
  }

  _renderColors() {
    this.colorSw.innerHTML = '';
    const palette = Array.from(new Set([...COLOR_PALETTE, ...WALL_PALETTE]));
    for (const hex of palette) {
      const el = document.createElement('div');
      el.className = 'color-swatch';
      el.style.background = hex;
      el.dataset.color = hex;
      el.addEventListener('click', () => {
        this.selectedColor = hex;
        this._highlightColorSwatch();
        if (this.onSelect && this.selectedId) {
          this.onSelect(this.selectedId, this.selectedColor, this.selectedStyle);
        }
      });
      this.colorSw.appendChild(el);
    }
  }

  _renderStyles(itemId) {
    this.styleSw.innerHTML = '';
    let styles = [];
    if (itemId.includes('puerta')) styles = DOOR_STYLES;
    else if (itemId.includes('ventana')) styles = WINDOW_STYLES;
    else if (itemId.includes('arbol') || itemId.includes('arbusto')) styles = PLANT_STYLES;
    else styles = PLANT_STYLES; // Fallback

    for (const s of styles) {
      const el = document.createElement('div');
      el.className = 'style-chip';
      el.textContent = s.label;
      el.dataset.style = s.id;
      if (this.selectedStyle === s.id) el.classList.add('selected');
      el.addEventListener('click', () => {
        this.selectedStyle = s.id;
        for (const c of this.styleSw.children) {
          c.classList.toggle('selected', c.dataset.style === s.id);
        }
        if (this.onSelect && this.selectedId) {
          this.onSelect(this.selectedId, this.selectedColor, this.selectedStyle);
        }
      });
      this.styleSw.appendChild(el);
    }
  }

  renderSell() {
    this.sellGrid.innerHTML = '';

    const counts = this.countInventory();
    const ids = Object.keys(counts);

    if (ids.length === 0) {
      this.sellGrid.innerHTML = '<p class="hint">No tienes materiales para vender.</p>';
      return;
    }

    for (const id of ids) {
      const item = SHOP_ITEMS.find(i => i.id === id);
      if (!item) continue;
      const count = counts[id];
      const refund = Math.floor(item.price * 0.5);

      const el = document.createElement('div');
      el.className = 'shop-item';

      el.innerHTML = `
        <span class="emoji">${item.emoji}</span>
        <span class="name">${item.name}</span>
        <span class="owned">x${count}</span>
        <span class="price">Vender: 🪙 ${refund}</span>
      `;

      el.addEventListener('click', () => {
        this.save.coins += refund;
        this.removeFromInventory(id, 1);
        this.updateCoins();
        this.renderSell();
        this._toast(`Vendido por 🪙 ${refund}`);
      });

      this.sellGrid.appendChild(el);
    }
  }

  cancelSelection() {
    this.selectedId = null;
    this.selectedColor = null;
    this.selectedStyle = null;
    this.colorPick.style.display = 'none';
    this.stylePick.style.display = 'none';
    this.customizeBar.style.display = 'none';
    if (this.onCancel) this.onCancel();
  }

  clearSelection() {
    this.selectedId = null;
    this.selectedColor = null;
    this.selectedStyle = null;
    this.colorPick.style.display = 'none';
    this.stylePick.style.display = 'none';
    this.customizeBar.style.display = 'none';
  }

  consumeSelected() {
    if (!this.selectedId) return;
    this.removeFromInventory(this.selectedId, 1);

    const counts = this.countInventory();
    if (!counts[this.selectedId]) {
      this.selectedId = null;
      this.selectedColor = null;
      this.selectedStyle = null;
      this.colorPick.style.display = 'none';
      this.stylePick.style.display = 'none';
      this.customizeBar.style.display = 'none';
    }
    this.updateCoins();
  }

  updateCoins() {
    const el = document.getElementById('coins');
    if (el) el.textContent = '🪙 ' + this.save.coins;
    if (this.shopCoins) this.shopCoins.textContent = this.save.coins;
  }

  getColor() { return this.selectedColor; }
  getStyle() { return this.selectedStyle; }
}

export function updateCoins(n) {
  const el = document.getElementById('coins');
  if (el) el.textContent = '🪙 ' + n;
  const sc = document.getElementById('shopCoins');
  if (sc) sc.textContent = n;
}