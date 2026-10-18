// main.js
import { Storage } from './storage.js';
import { World } from './world.js';
import { Shop, updateCoins, SHOP_ITEMS } from './shop.js';

let AvatarViewer = null;
try {
  const mod = await import('./avatar-viewer.js');
  AvatarViewer = mod.AvatarViewer;
} catch (e) {
  console.warn("Aviso: Falló la carga de avatar-viewer.js. El juego seguirá sin el editor de avatar.", e);
}

let save = Storage.load();
window.save = save;
window.Storage = Storage;

let world = null;
let shop = null;
let avatarViewer = null;
let rentInterval = null;

if (!save.playerColor) save.playerColor = '#4a90e2';
if (!save.playerGender) save.playerGender = 'm';
if (!save.pantsColor) save.pantsColor = '#334155';
if (!save.hairColor) save.hairColor = '#1c1917';

document.body.classList.add('in-menu');

// ==========================================
// PANTALLA COMPLETA
// ==========================================
function toggleFullScreen() {
  if (!document.fullscreenElement && !document.webkitFullscreenElement) {
    const el = document.documentElement;
    const onFullscreenChange = () => {
      if (world && typeof world._resize === 'function') {
        world._resize(); 
      }
      document.removeEventListener('fullscreenchange', onFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', onFullscreenChange);
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    document.addEventListener('webkitfullscreenchange', onFullscreenChange);

    if (el.requestFullscreen) el.requestFullscreen().catch(e => console.log(e));
    else if (el.webkitRequestFullscreen) el.webkitRequestFullscreen();
    else if (el.msRequestFullscreen) el.msRequestFullscreen();
  } else {
    if (document.exitFullscreen) document.exitFullscreen();
    else if (document.webkitExitFullscreen) document.webkitExitFullscreen();
  }
}

const ui = {
  menu: document.getElementById('menu'),
  hud: document.getElementById('hud'),
  status: document.getElementById('status'),
  look: document.getElementById('lookZone'),
  play: document.getElementById('playButton'),
  name: document.getElementById('playerName'),
  fullscreenBtn: document.getElementById('fullscreenBtn'),
  mainMenuBtn: document.getElementById('mainMenuBtn'),
  mainMenu: document.getElementById('mainMenu'),
  editToggle: document.getElementById('editToggle'),
  customizeAvatarBtn: document.getElementById('customizeAvatarBtn'),
  settingsBtn: document.getElementById('settingsBtn'),
  avatarEditorScreen: document.getElementById('avatarEditorScreen'),
  avatarColorPicker: document.getElementById('avatarColorPicker'),
  avatarPantsPicker: document.getElementById('avatarPantsPicker'),
  avatarHairPicker: document.getElementById('avatarHairPicker'),
  avatarGenderPicker: document.getElementById('avatarGenderPicker'),
  settingsScreen: document.getElementById('settingsScreen'),
  settingsName: document.getElementById('settingsName'),
  settingsSensitivity: document.getElementById('settingsSensitivity'),
  settingsSensValue: document.getElementById('settingsSensValue'),
  settingsQuality: document.getElementById('settingsQuality'),
  settingsApply: document.getElementById('settingsApply'),
  settingsReset: document.getElementById('settingsReset'),
  backToMenu: document.getElementById('backToMenu'),
  placeConfirm: document.getElementById('placeConfirm'),
  placeCancel: document.getElementById('placeCancel'),
  moveConfirm: document.getElementById('moveConfirm'),
  moveCancel: document.getElementById('moveCancel'),
  editMove: document.getElementById('editMove'),
  editDelete: document.getElementById('editDelete'),
  editClose: document.getElementById('editClose'),
  editContent: document.getElementById('editContent'),
  editPanel: document.getElementById('editPanel'),
  moveBar: document.getElementById('moveBar'),
  settingsToggle: document.getElementById('settingsToggle'),
  // === MISIONES ===
  missionsToggle: document.getElementById('missionsToggle'),
  missionsScreen: document.getElementById('missionsScreen'),
  missionsGrid: document.getElementById('missionsGrid'),
  missionsTotal: document.getElementById('missionsTotal'),
};

if (ui.name) ui.name.value = save.playerName ?? 'Invitado';

// ==========================================
// MODAL DE CONFIRMACIÓN PERSONALIZADO
// ==========================================
const confirmModal = document.getElementById('customConfirm');
const confirmTitle = document.getElementById('confirmTitle');
const confirmMsg = document.getElementById('confirmMsg');
const confirmAcceptBtn = document.getElementById('confirmAcceptBtn');
const confirmCancelBtn = document.getElementById('confirmCancelBtn');

function showCustomConfirm(title, msg) {
  return new Promise((resolve) => {
    confirmTitle.textContent = title;
    confirmMsg.textContent = msg;
    confirmModal.style.display = 'flex';

    const newAccept = confirmAcceptBtn.cloneNode(true);
    const newCancel = confirmCancelBtn.cloneNode(true);
    confirmAcceptBtn.replaceWith(newAccept);
    confirmCancelBtn.replaceWith(newCancel);

    newAccept.onclick = () => {
      confirmModal.style.display = 'none';
      resolve(true);
    };
    newCancel.onclick = () => {
      confirmModal.style.display = 'none';
      resolve(false);
    };
  });
}

// ==========================================
// BOTONES DEL MENÚ
// ==========================================
if (ui.fullscreenBtn) {
  ui.fullscreenBtn.addEventListener('click', toggleFullScreen);
}

if (ui.play) {
  ui.play.addEventListener('click', () => {
    toggleFullScreen();

    save.playerName = ui.name.value.trim() || 'Invitado';
    Storage.save(save);

    document.body.classList.remove('in-menu');
    ui.menu.style.display = 'none';
    
    if (avatarViewer) avatarViewer.stop();

    ui.hud.style.display = 'flex';
    ui.look.style.display = 'block';
    
    const joystick = document.getElementById('joystick');
    if (joystick) joystick.style.display = 'flex';
    
    const mainMenuBtn = document.getElementById('mainMenuBtn');
    if (mainMenuBtn) mainMenuBtn.style.display = 'flex';
    
    // Mostrar el selector de clima al iniciar la partida
    const weatherSelector = document.getElementById('weatherSelector');
    if (weatherSelector) weatherSelector.style.display = 'block';

    const jumpBtn = document.getElementById('jumpBtn');
    if (jumpBtn) jumpBtn.classList.add('visible');
    
    const interactBtn = document.getElementById('interactBtn');
    if (interactBtn) interactBtn.classList.remove('visible');

    startWorld();

    setTimeout(() => {
      if (world && typeof world._resize === 'function') {
        world._resize();
      }
    }, 500);
  });
}

if (ui.settingsBtn) {
  ui.settingsBtn.addEventListener('click', () => {
    ui.settingsName.value = save.playerName;
    ui.settingsSensitivity.value = save.sensitivity ?? 4;
    ui.settingsSensValue.textContent = save.sensitivity ?? 4;
    ui.settingsQuality.value = save.quality ?? 'media';
    document.getElementById('settingsScreen').style.display = 'flex';
  });
}

if (ui.settingsSensitivity) {
  ui.settingsSensitivity.addEventListener('input', () => {
    ui.settingsSensValue.textContent = ui.settingsSensitivity.value;
  });
}

if (ui.settingsApply) {
  ui.settingsApply.addEventListener('click', () => {
    save.playerName = ui.settingsName.value.trim() || 'Invitado';
    save.sensitivity = Number(ui.settingsSensitivity.value);
    save.quality = ui.settingsQuality.value;
    Storage.save(save);
    if (ui.name) ui.name.value = save.playerName;
    ui.settingsScreen.style.display = 'none';
  });
}

if (ui.settingsReset) {
  ui.settingsReset.addEventListener('click', async () => {
    const quiereBorrar = await showCustomConfirm('¿Borrar progreso?', 'Se perderán todos tus muebles y monedas para siempre.');
    if (quiereBorrar) {
      Storage.clear();
      location.reload();
    }
  });
}

document.querySelectorAll('.closeBtn[data-close="settingsScreen"]').forEach(btn => {
  btn.addEventListener('click', () => { ui.settingsScreen.style.display = 'none'; });
});

// ==========================================
// EDITOR DE AVATAR
// ==========================================
const SHIRT_COLORS = ['#4a90e2', '#e24a4a', '#4caf50', '#f0c050', '#9c27b0', '#1a1a22', '#f97316', '#14b8a6', '#ec4899', '#ffffff', '#8b5cf6', '#64748b', '#fcd34d', '#ef4444', '#10b981', '#3b82f6', '#6366f1', '#a855f7', '#78350f', '#c2b280', '#ff8c00', '#00ced1', '#ff69b4', '#e6e6fa'];
const PANTS_COLORS = ['#334155', '#1a1a22', '#3b82f6', '#64748b', '#78350f', '#c2b280', '#e24a4a', '#4caf50', '#ffffff', '#000000'];
const HAIR_COLORS = ['#1c1917', '#4a2e1b', '#8b5a2b', '#c2b280', '#e6c27a', '#ffffff', '#e24a4a', '#ec4899', '#3b82f6', '#8b5cf6'];

function renderAvatarColors() {
  if (ui.avatarColorPicker) {
    ui.avatarColorPicker.innerHTML = '';
    SHIRT_COLORS.forEach(c => {
      const el = document.createElement('div');
      el.className = `color-swatch ${save.playerColor === c ? 'selected' : ''}`;
      el.style.background = c;
      el.onclick = () => { save.playerColor = c; renderAvatarColors(); if (avatarViewer) avatarViewer.updateColor('shirt', c); };
      ui.avatarColorPicker.appendChild(el);
    });
  }
  if (ui.avatarPantsPicker) {
    ui.avatarPantsPicker.innerHTML = '';
    PANTS_COLORS.forEach(c => {
      const el = document.createElement('div');
      el.className = `color-swatch ${save.pantsColor === c ? 'selected' : ''}`;
      el.style.background = c;
      el.onclick = () => { save.pantsColor = c; renderAvatarColors(); if (avatarViewer) avatarViewer.updateColor('pants', c); };
      ui.avatarPantsPicker.appendChild(el);
    });
  }
  if (ui.avatarHairPicker) {
    ui.avatarHairPicker.innerHTML = '';
    HAIR_COLORS.forEach(c => {
      const el = document.createElement('div');
      el.className = `color-swatch ${save.hairColor === c ? 'selected' : ''}`;
      el.style.background = c;
      el.onclick = () => { save.hairColor = c; renderAvatarColors(); if (avatarViewer) avatarViewer.updateColor('hair', c); };
      ui.avatarHairPicker.appendChild(el);
    });
  }
}

function updateGenderUI() {
  if (!ui.avatarGenderPicker) return;
  ui.avatarGenderPicker.querySelectorAll('.gender-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.gender === save.playerGender);
  });
}

if (ui.avatarGenderPicker) {
  ui.avatarGenderPicker.addEventListener('click', (e) => {
    const btn = e.target.closest('.gender-btn');
    if (!btn) return;
    save.playerGender = btn.dataset.gender;
    updateGenderUI();
    if (avatarViewer) avatarViewer.updateGender(save.playerGender);
  });
}

if (ui.customizeAvatarBtn) {
  ui.customizeAvatarBtn.addEventListener('click', () => {
    if (!AvatarViewer) {
      alert("El editor de avatar no está disponible. Puedes jugar igual.");
      return;
    }
    ui.avatarEditorScreen.style.display = 'flex';
    renderAvatarColors();
    updateGenderUI();
    setTimeout(() => {
      if (!avatarViewer) {
        avatarViewer = new AvatarViewer('avatar-editor-canvas', save);
        avatarViewer.start();
      } else {
        avatarViewer.start();
      }
    }, 50);
  });
}

document.querySelectorAll('.closeBtn[data-close="avatarEditorScreen"]').forEach(btn => {
  btn.addEventListener('click', () => {
    ui.avatarEditorScreen.style.display = 'none';
    if (avatarViewer) avatarViewer.stop();
    Storage.save(save);
  });
});

// ==========================================
// SISTEMA DE MISIONES Y ECONOMÍA
// ==========================================
function getMissions() {
  if (!Array.isArray(save.missions)) save.missions = Storage.default().missions;
  return save.missions;
}

function renderMissions() {
  if (!ui.missionsGrid) return;
  const missions = getMissions();
  ui.missionsGrid.innerHTML = '';

  if (missions.length === 0) {
    ui.missionsGrid.innerHTML = '<p class="hint">No hay misiones disponibles.</p>';
    return;
  }

  let totalReward = 0;

  missions.forEach(m => {
    const clamped = Math.min(m.progress, m.target);
    const pct = m.target > 0 ? Math.min(100, (clamped / m.target) * 100) : 0;
    if (m.done) totalReward += m.reward;

    const card = document.createElement('div');
    card.className = 'mission-card' + (m.done ? ' done' : '');
    card.innerHTML = `
      <div class="mission-head">
        <span class="mission-title">${m.done ? '✅ ' : ''}${m.title}</span>
        <span class="mission-reward">+${m.reward} 🪙</span>
      </div>
      <div class="mission-progress-track">
        <div class="mission-progress-fill" style="width:${pct}%"></div>
      </div>
      <div class="mission-progress-label">
        ${m.done ? '<span class="mission-done-badge">✔ Completada</span>' : `${clamped} / ${m.target}`}
      </div>
    `;
    ui.missionsGrid.appendChild(card);
  });

  if (ui.missionsTotal) ui.missionsTotal.textContent = totalReward;
}

function matchesMission(match, id) {
  if (!match || !id) return false;
  if (Array.isArray(match)) return match.some(m => id.startsWith(m));
  return id.startsWith(match);
}

function updateMissionsOnPlace(id) {
  const missions = getMissions();
  let changed = false;
  let gained = 0;

  for (const m of missions) {
    if (m.done) continue;
    if (!matchesMission(m.match, id)) continue;

    m.progress = Math.min(m.target, (m.progress || 0) + 1);
    changed = true;

    if (m.progress >= m.target) {
      m.done = true;
      gained += m.reward;
      if (typeof world !== 'undefined' && world && typeof world._notifyTV === 'function') {
        world._notifyTV(`🎯 ¡Misión completada! +${m.reward} 🪙`);
      }
    }
  }

  if (gained > 0) {
    save.coins = (save.coins ?? 0) + gained;
    if (typeof updateCoins === 'function') updateCoins(save.coins);
    const shopCoinsEl = document.getElementById('shopCoins');
    if (shopCoinsEl) shopCoinsEl.textContent = save.coins;
  }

  if (changed) {
    Storage.save(save);
    renderMissions();
  }
}

function calcularValorPropiedad() {
  let total = 0;
  const muebles = save.placedFurniture || [];
  for (const m of muebles) {
    const item = SHOP_ITEMS.find(i => i.id === m.type);
    if (item) total += item.price;
  }
  return total;
}

function actualizarPanelEconomia() {
  const valEl = document.getElementById('econPropertyValue');
  const rentEl = document.getElementById('econRentValue');
  if (!valEl || !rentEl) return;

  const total = calcularValorPropiedad();
  const renta = Math.max(5, Math.floor(total * 0.02));
  
  valEl.textContent = total;
  rentEl.textContent = renta;
}

function procesarRenta() {
  if (!world) return; 
  
  const valorTotal = calcularValorPropiedad();
  const renta = Math.max(5, Math.floor(valorTotal * 0.02));
  
  save.coins = (save.coins ?? 0) + renta;
  updateCoins(save.coins);
  Storage.save(save);

  if (world && typeof world._notifyTV === 'function') {
    world._notifyTV(`🏠 Renta cobrada: +${renta} 🪙`);
  }
  
  if (ui.missionsScreen && ui.missionsScreen.style.display === 'flex') {
    actualizarPanelEconomia();
  }
}

// ==========================================
// EVENTOS DE MISIONES
// ==========================================
if (ui.missionsToggle) {
  ui.missionsToggle.addEventListener('click', () => {
    document.getElementById('mainMenu').style.display = 'none';
    renderMissions();
    actualizarPanelEconomia();
    ui.missionsScreen.style.display = 'flex';
  });
}

document.querySelectorAll('.closeBtn[data-close="missionsScreen"]').forEach(btn => {
  btn.addEventListener('click', () => {
    ui.missionsScreen.style.display = 'none';
  });
});

// ==========================================
// FUNCIONES DEL MUNDO
// ==========================================
function mapSens(v) { return 0.0015 + (v - 1) * (0.0085 / 9); }

function saveCurrentState() {
  if (!world) return;
  const state = world.getState();
  save.position = state.position;
  save.rotation = state.rotation;
  save.placedFurniture = state.placedFurniture;
  save.dayTime = state.dayTime;
  save.plotFloors = state.plotFloors;
  // El clima se guarda directo desde el selector, pero por si acaso:
  if (state.weather) save.weather = state.weather;
  Storage.save(save);
}

function startWorld() {
  try {
    world = new World(save);
    window.world = world; 
    world.controls.setSensitivity(mapSens(save.sensitivity ?? 4));
  } catch (e) {
    console.error("Error crítico al crear el mundo:", e);
    alert("Error al cargar el mundo 3D. Revisa la consola (F12) para más detalles.");
    return;
  }

  const tryPlace = () => {
    const ok = world.confirmPlace();
    if (!ok) { ui.status.textContent = 'No se puede colocar aquí'; return; }
    shop.consumeSelected();
    const counts = shop.countInventory();
    const remaining = counts[world.selectedId] ?? 0;
    if (remaining <= 0) {
      world.cancelPlacement();
      if (shop) shop.clearSelection();
    }
    shop.closeInventory();
    ui.status.textContent = remaining > 0 ? `Colocado (quedan ${remaining})` : 'Colocado';
    saveCurrentState();
    actualizarPanelEconomia();
  };

  shop = new Shop(save, {
    onSelect: (id, color, style) => { if (id) world.startPlacement(id, color, style); else world.cancelPlacement(); },
    onPlace: tryPlace,
    onCancel: () => world.cancelPlacement(),
  });
  updateCoins(save.coins);

  world.onPlaceRequest = tryPlace;
  
  world.onDeleteRequest = (type) => { 
    shop.addToInventory(type, 1); 
    ui.status.textContent = 'Devuelto al inventario'; 
    saveCurrentState(); 
    actualizarPanelEconomia();
  };
  
  world.onTVSave = () => { saveCurrentState(); };

  world.onFurniturePlaced = (id) => {
    updateMissionsOnPlace(id);
  };

  ui.placeConfirm.addEventListener('click', tryPlace);
  ui.placeCancel.addEventListener('click', () => { world.cancelPlacement(); if (shop) shop.clearSelection(); });

  const rotateBtn = document.getElementById('rotateBtn');
  if (rotateBtn) rotateBtn.addEventListener('click', () => { if (world) world.rotateGhost(); });

  ui.moveConfirm.addEventListener('click', () => { world._prepareMoveOriginal(); const ok = world.confirmMove(); ui.status.textContent = ok ? 'Movido' : 'No se puede mover aquí'; saveCurrentState(); actualizarPanelEconomia(); });
  ui.moveCancel.addEventListener('click', () => world.cancelMove());

  ui.editToggle.addEventListener('click', () => {
    const on = !world.editMode;
    world.setEditMode(on);
    ui.status.textContent = on ? 'Apunta a un mueble' : 'Listo';
    document.getElementById('mainMenu').style.display = 'none';
  });

  ui.editMove.addEventListener('click', () => { if (!world.editTarget) return; world._prepareMoveOriginal(); world.startMove(); });
  ui.editDelete.addEventListener('click', () => { world.deleteTarget(); ui.status.textContent = 'Devuelto al inventario'; saveCurrentState(); actualizarPanelEconomia(); });
  ui.editClose.addEventListener('click', () => { world.editTarget = null; world.highlightTarget(null); ui.editPanel.style.display = 'none'; if (ui.editContent) ui.editContent.style.display = 'none'; });
  ui.editContent.addEventListener('click', () => { if (world.editTarget && world.editTarget.type === 'tv') world.openTVPanel(world.editTarget); });

  const tvUrl = document.getElementById('tvUrl');
  const tvLoad = document.getElementById('tvLoad');
  const tvStop = document.getElementById('tvStop');
  const tvOverlay = document.getElementById('tvOverlay');
  const tvOverlayClose = document.getElementById('tvOverlayClose');

  document.querySelectorAll('.closeBtn[data-close="tvPanel"]').forEach(btn => btn.addEventListener('click', () => { world.closeTVPanel(); }));

  tvLoad.addEventListener('click', () => {
    const url = tvUrl.value.trim();
    if (!url || !world.tvTarget) return;
    world.loadTVContent(world.tvTarget, url);
    world.saveTVUrl(world.tvTarget, url);
    saveCurrentState();
    world.closeTVPanel();
    ui.status.textContent = 'TV actualizada';
  });

  tvStop.addEventListener('click', () => {
    if (!world.tvTarget) return;
    world.stopTVContent(world.tvTarget);
    world.saveTVUrl(world.tvTarget, null);
    saveCurrentState();
    ui.status.textContent = 'TV detenida';
  });

  document.querySelectorAll('.tv-samples button').forEach(btn => btn.addEventListener('click', () => { tvUrl.value = btn.dataset.sample; }));
  tvOverlayClose.addEventListener('click', () => { tvOverlay.style.display = 'none'; document.getElementById('tvOverlayInner').innerHTML = ''; });

  ui.settingsToggle.addEventListener('click', () => {
    document.getElementById('mainMenu').style.display = 'none';
    ui.settingsName.value = save.playerName;
    ui.settingsSensitivity.value = save.sensitivity ?? 4;
    ui.settingsSensValue.textContent = save.sensitivity ?? 4;
    ui.settingsQuality.value = save.quality ?? 'media';
    ui.settingsScreen.style.display = 'flex';
  });

  ui.backToMenu.addEventListener('click', async () => {
    const quiereSalir = await showCustomConfirm('¿Salir al menú principal?', 'Se guardará todo el progreso.');
    if (quiereSalir) {
      saveCurrentState();
      location.reload();
    }
  });

  // ==========================================
  // SISTEMA DE CLIMA (UI)
  // ==========================================
  const weatherBtn = document.getElementById('weatherBtn');
  const weatherMenu = document.getElementById('weatherMenu');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherLabel = document.getElementById('weatherLabel');

  const weatherMeta = {
    despejado:       { icon: '☀️', label: 'Despejado' },
    lluvia_moderada: { icon: '🌧️', label: 'Lluvia moderada' },
    lluvia_intensa:  { icon: '🌧️', label: 'Lluvia intensa' },
    nieve_moderada:  { icon: '🌨️', label: 'Nieve moderada' },
    nieve_intensa:   { icon: '❄️', label: 'Nieve intensa' },
    tormenta:        { icon: '⛈️', label: 'Tormenta eléctrica' },
  };

  function updateWeatherUI(weather) {
    const meta = weatherMeta[weather] || weatherMeta.despejado;
    if (weatherIcon) weatherIcon.textContent = meta.icon;
    if (weatherLabel) weatherLabel.textContent = meta.label;
    document.querySelectorAll('.weather-option').forEach(b => {
      b.classList.toggle('active', b.dataset.weather === weather);
    });
  }

  if (weatherBtn && weatherMenu) {
    weatherBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      weatherMenu.style.display = weatherMenu.style.display === 'none' ? 'flex' : 'none';
    });

    document.addEventListener('click', (e) => {
      if (!weatherBtn.contains(e.target) && !weatherMenu.contains(e.target)) {
        weatherMenu.style.display = 'none';
      }
    });

    document.querySelectorAll('.weather-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const weather = btn.dataset.weather;
        world.setWeather(weather);
        updateWeatherUI(weather);
        weatherMenu.style.display = 'none';
        save.weather = weather;
        Storage.save(save);
      });
    });
  }

  updateWeatherUI(save.weather || 'despejado');

  // Iniciar el mundo
  world.start(() => {});

  setInterval(() => {
    saveCurrentState();
    ui.status.textContent = `Guardado · ${new Date().toLocaleTimeString()}`;
  }, 5000);

  // Iniciar renta pasiva cada 2 minutos (120,000 ms)
  if (rentInterval) clearInterval(rentInterval);
  rentInterval = setInterval(procesarRenta, 120000);
}

window.addEventListener('beforeunload', () => { saveCurrentState(); });