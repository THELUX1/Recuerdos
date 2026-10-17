// main.js
import { Storage } from './storage.js';
import { World } from './world.js';
import { Shop, updateCoins } from './shop.js';
import { AvatarViewer } from './avatar-viewer.js';

let save = Storage.load();
window.save = save; 
window.Storage = Storage;

let world = null;
let shop = null;
let avatarViewer = null;

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
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(e => console.log(e));
    } else if (el.webkitRequestFullscreen) {
      el.webkitRequestFullscreen();
    } else if (el.msRequestFullscreen) {
      el.msRequestFullscreen();
    }
  } else {
    if (document.exitFullscreen) {
      document.exitFullscreen();
    } else if (document.webkitExitFullscreen) {
      document.webkitExitFullscreen();
    }
  }
}

const ui = {
  menu: document.getElementById('menu'),
  hud: document.getElementById('hud'),
  status: document.getElementById('status'),
  look: document.getElementById('lookZone'),
  play: document.getElementById('playButton'),
  name: document.getElementById('playerName'),
  fullscreenBtn: document.getElementById('fullscreenBtn'), // 👈 NUEVO
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
};

if (ui.name) ui.name.value = save.playerName ?? 'Invitado';

// 👇 Evento del botón de pantalla completa
if (ui.fullscreenBtn) {
  ui.fullscreenBtn.addEventListener('click', toggleFullScreen);
}

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
// EVENTOS MENÚ PRINCIPAL
// ==========================================
if (ui.play) {
  ui.play.addEventListener('click', () => {
    // Intentar pantalla completa al darle a jugar también
    toggleFullScreen();

    save.playerName = ui.name.value.trim() || 'Invitado';
    Storage.save(save);

    document.body.classList.remove('in-menu');
    ui.menu.style.display = 'none';
    if (avatarViewer) avatarViewer.stop();

    ui.hud.style.display = 'flex';
    ui.look.style.display = 'block';
    
    document.getElementById('joystick').style.display = 'flex';
    document.getElementById('mainMenuBtn').style.display = 'flex';
    
    const jumpBtn = document.getElementById('jumpBtn');
    if (jumpBtn) jumpBtn.classList.add('visible');
    
    const interactBtn = document.getElementById('interactBtn');
    if (interactBtn) interactBtn.classList.remove('visible');

    startWorld();
  });
}

// ... (El resto del código de Ajustes y startWorld sigue exactamente igual) ...
function mapSens(v) { return 0.0015 + (v - 1) * (0.0085 / 9); }

function saveCurrentState() {
  if (!world) return;
  const state = world.getState();
  save.position = state.position;
  save.rotation = state.rotation;
  save.placedFurniture = state.placedFurniture;
  save.dayTime = state.dayTime;
  save.plotFloors = state.plotFloors;
  Storage.save(save);
}

function startWorld() {
  world = new World(save);
  window.world = world; 
  world.controls.setSensitivity(mapSens(save.sensitivity ?? 4));

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
  };

  shop = new Shop(save, {
    onSelect: (id, color, style) => { if (id) world.startPlacement(id, color, style); else world.cancelPlacement(); },
    onPlace: tryPlace,
    onCancel: () => world.cancelPlacement(),
  });
  updateCoins(save.coins);

  world.onPlaceRequest = tryPlace;
  world.onDeleteRequest = (type) => { shop.addToInventory(type, 1); ui.status.textContent = 'Devuelto al inventario'; saveCurrentState(); };
  world.onTVSave = () => { saveCurrentState(); };

  ui.placeConfirm.addEventListener('click', tryPlace);
  ui.placeCancel.addEventListener('click', () => { world.cancelPlacement(); if (shop) shop.clearSelection(); });

  const rotateBtn = document.getElementById('rotateBtn');
  if (rotateBtn) rotateBtn.addEventListener('click', () => { if (world) world.rotateGhost(); });

  ui.moveConfirm.addEventListener('click', () => { world._prepareMoveOriginal(); const ok = world.confirmMove(); ui.status.textContent = ok ? 'Movido' : 'No se puede mover aquí'; saveCurrentState(); });
  ui.moveCancel.addEventListener('click', () => world.cancelMove());

  ui.editToggle.addEventListener('click', () => {
    const on = !world.editMode;
    world.setEditMode(on);
    ui.status.textContent = on ? 'Apunta a un mueble' : 'Listo';
    document.getElementById('mainMenu').style.display = 'none';
  });

  ui.editMove.addEventListener('click', () => { if (!world.editTarget) return; world._prepareMoveOriginal(); world.startMove(); });
  ui.editDelete.addEventListener('click', () => { world.deleteTarget(); ui.status.textContent = 'Devuelto al inventario'; saveCurrentState(); });
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

  ui.backToMenu.addEventListener('click', () => {
    if (confirm('¿Salir al menú principal? Se guardará el progreso.')) { saveCurrentState(); location.reload(); }
  });

  world.start(() => {});

  setInterval(() => {
    saveCurrentState();
    ui.status.textContent = `Guardado · ${new Date().toLocaleTimeString()}`;
  }, 5000);
}

// Configurar ajustes desde el menú principal (si los tienes)
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
  ui.settingsReset.addEventListener('click', () => {
    if (confirm('¿Borrar todo el progreso?')) {
      Storage.clear();
      location.reload();
    }
  });
}

document.querySelectorAll('.closeBtn[data-close="settingsScreen"]').forEach(btn => {
  btn.addEventListener('click', () => { ui.settingsScreen.style.display = 'none'; });
});

window.addEventListener('beforeunload', () => { saveCurrentState(); });