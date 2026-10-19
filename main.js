// main.js
import { Storage } from './storage.js';
import { World } from './world.js';
import { Shop, updateCoins, SHOP_ITEMS } from './shop.js';
import { Audio } from './audio.js';

let AvatarViewer = null;
try {
  const mod = await import('./avatar-viewer.js');
  AvatarViewer = mod.AvatarViewer;
} catch (e) {
  console.warn("Aviso: Falló la carga de avatar-viewer.js.", e);
}

let save = Storage.load();
window.save = save;
window.Storage = Storage;
window.Audio = Audio;

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
      if (world && typeof world._resize === 'function') world._resize(); 
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
  mainMenuBtn: document.getElementById('mainMenuBtn'),
  mainMenu: document.getElementById('mainMenu'),
  editModeBtn: document.getElementById('editModeBtn'),
  timeCycleBtn: document.getElementById('timeCycleBtn'),
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
  settingsFoliage: document.getElementById('settingsFoliage'),
  foliageWarning: document.getElementById('foliageWarning'),
  settingsRenderDistance: document.getElementById('settingsRenderDistance'),
  renderWarning: document.getElementById('renderWarning'),
  settingsMusicVolume: document.getElementById('settingsMusicVolume'), // 🔥 NUEVO
  settingsMusicVolValue: document.getElementById('settingsMusicVolValue'), // 🔥 NUEVO
  settingsApply: document.getElementById('settingsApply'),
  settingsReset: document.getElementById('settingsReset'),
  backToMenu: document.getElementById('backToMenu'),
  placeConfirm: document.getElementById('placeConfirm'),
  placeCancel: document.getElementById('placeCancel'),
  moveConfirm: document.getElementById('moveConfirm'),
  moveCancel: document.getElementById('moveCancel'),
  moveRotate: document.getElementById('moveRotate'),
  rotateBtn: document.getElementById('rotateBtn'),
  editMove: document.getElementById('editMove'),
  editDelete: document.getElementById('editDelete'),
  editClose: document.getElementById('editClose'),
  editContent: document.getElementById('editContent'),
  editPanel: document.getElementById('editPanel'),
  moveBar: document.getElementById('moveBar'),
  settingsToggle: document.getElementById('settingsToggle'),
  missionsToggle: document.getElementById('missionsToggle'),
  missionsScreen: document.getElementById('missionsScreen'),
  missionsGrid: document.getElementById('missionsGrid'),
  missionsTotal: document.getElementById('missionsTotal'),
  dailyRewardBtn: document.getElementById('dailyRewardBtn'),
  achievementsToggle: document.getElementById('achievementsToggle'),
  achievementsScreen: document.getElementById('achievementsScreen'),
  achievementsGrid: document.getElementById('achievementsGrid'),
  achievementsTotal: document.getElementById('achievementsTotal'),
  audioToggle: document.getElementById('audioToggle'),
  companionToggle: document.getElementById('companionToggle'),
  companionScreen: document.getElementById('companionScreen'),
  companionGrid: document.getElementById('companionGrid'),
  runBtn: document.getElementById('runBtn'),
};

if (ui.name) ui.name.value = save.playerName ?? 'Invitado';

// ==========================================
// CONFIRMACIÓN PERSONALIZADA
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

    newAccept.onclick = () => { confirmModal.style.display = 'none'; resolve(true); };
    newCancel.onclick = () => { confirmModal.style.display = 'none'; resolve(false); };
  });
}

// ==========================================
// RECOMPENSA DIARIA
// ==========================================
const DAY_MS = 24 * 60 * 60 * 1000;

function isDailyRewardAvailable() {
  return (Date.now() - (save.lastDailyReward ?? 0)) >= DAY_MS;
}

function updateDailyRewardButton() {
  const btn = ui.dailyRewardBtn;
  if (!btn) return;
  if (isDailyRewardAvailable()) {
    btn.style.display = 'flex';
    btn.classList.add('pulse');
  } else {
    btn.style.display = 'none';
    btn.classList.remove('pulse');
  }
}

function checkDailyReward() {
  const now = Date.now();
  const last = save.lastDailyReward ?? 0;
  if (now - last < DAY_MS) {
    if (world) world._notifyTV('⏳ Vuelve mañana para otra recompensa');
    return false;
  }

  const isStreak = (now - last) < (DAY_MS * 2);
  save.dailyStreak = isStreak ? Math.min(7, (save.dailyStreak ?? 0) + 1) : 1;
  const reward = 50 + (save.dailyStreak - 1) * 25;
  
  save.coins = (save.coins ?? 0) + reward;
  save.lastDailyReward = now;
  if (!save.lifetimeStats) save.lifetimeStats = {};
  save.lifetimeStats.coinsEarned = (save.lifetimeStats.coinsEarned ?? 0) + reward;

  Storage.save(save);
  updateCoins(save.coins);
  updateDailyRewardButton();

  try { Audio.play('moneda', { volume: 0.6 }); } catch (_) {}
  if (world) world._notifyTV(`🎁 Recompensa diaria (día ${save.dailyStreak}): +${reward} 🪙`);

  checkAchievements();
  return true;
}

if (ui.dailyRewardBtn) {
  ui.dailyRewardBtn.addEventListener('click', () => {
    try { Audio.play('click', { volume: 0.5 }); } catch (_) {}
    checkDailyReward();
  });
}

// ==========================================
// LOGROS
// ==========================================
const ACHIEVEMENTS = [
  { id: 'first_place',    title: 'Primer mueble',           icon: '🪑', reward: 50,   check: s => s.furniturePlaced >= 1 },
  { id: 'decorator',      title: 'Decorador (50)',           icon: '🎨', reward: 200,  check: s => s.furniturePlaced >= 50 },
  { id: 'architect',      title: 'Arquitecto (200)',         icon: '🏛️', reward: 500,  check: s => s.furniturePlaced >= 200 },
  { id: 'rich',           title: 'Rico (10,000 ganadas)',    icon: '💰', reward: 1000, check: s => s.coinsEarned >= 10000 },
  { id: 'mission_master', title: 'Maestro de Misiones',      icon: '🎯', reward: 300,  check: s => s.missionsCompleted >= 5 },
  { id: 'weather_wizard', title: 'Domador del Clima',        icon: '🌪️', reward: 150,  check: s => s.weatherChanges >= 10 },
];

function checkAchievements() {
  if (!save.lifetimeStats) save.lifetimeStats = {};
  if (!Array.isArray(save.achievements)) save.achievements = [];

  let gained = 0;
  const newlyUnlocked = [];

  for (const a of ACHIEVEMENTS) {
    if (!save.achievements.includes(a.id) && a.check(save.lifetimeStats)) {
      save.achievements.push(a.id);
      gained += a.reward;
      newlyUnlocked.push(a);
    }
  }

  if (gained > 0) {
    save.coins = (save.coins ?? 0) + gained;
    save.lifetimeStats.coinsEarned = (save.lifetimeStats.coinsEarned ?? 0) + gained;
    updateCoins(save.coins);
    Storage.save(save);
    try { Audio.play('mision', { volume: 0.7 }); } catch (_) {}
    if (world) {
      for (const a of newlyUnlocked) world._notifyTV(`${a.icon} ¡Logro desbloqueado: ${a.title}! +${a.reward} 🪙`);
    }
    renderAchievements();
  }
}

function renderAchievements() {
  if (!ui.achievementsGrid) return;
  const unlocked = save.achievements ?? [];
  const stats = save.lifetimeStats ?? {};
  ui.achievementsGrid.innerHTML = '';
  let totalReward = 0;

  ACHIEVEMENTS.forEach(a => {
    const isUnlocked = unlocked.includes(a.id);
    if (isUnlocked) totalReward += a.reward;

    let progressLabel = '';
    if (!isUnlocked) {
      if (a.id === 'first_place') progressLabel = `${Math.min(1, stats.furniturePlaced ?? 0)}/1`;
      else if (a.id === 'decorator') progressLabel = `${Math.min(50, stats.furniturePlaced ?? 0)}/50`;
      else if (a.id === 'architect') progressLabel = `${Math.min(200, stats.furniturePlaced ?? 0)}/200`;
      else if (a.id === 'rich') progressLabel = `${Math.min(10000, stats.coinsEarned ?? 0)}/10000`;
      else if (a.id === 'mission_master') progressLabel = `${Math.min(5, stats.missionsCompleted ?? 0)}/5`;
      else if (a.id === 'weather_wizard') progressLabel = `${Math.min(10, stats.weatherChanges ?? 0)}/10`;
    }

    const card = document.createElement('div');
    card.className = 'mission-card' + (isUnlocked ? ' done' : '');
    card.innerHTML = `
      <div class="mission-head">
        <span class="mission-title">${isUnlocked ? '✅ ' : a.icon + ' '}${a.title}</span>
        <span class="mission-reward">+${a.reward} 🪙</span>
      </div>
      <div class="mission-progress-label">
        ${isUnlocked ? '<span class="mission-done-badge">✔ Desbloqueado</span>' : progressLabel}
      </div>
    `;
    ui.achievementsGrid.appendChild(card);
  });
  if (ui.achievementsTotal) ui.achievementsTotal.textContent = totalReward;
}

if (ui.achievementsToggle) {
  ui.achievementsToggle.addEventListener('click', (e) => {
    e.preventDefault(); e.stopPropagation();
    if (ui.mainMenu) ui.mainMenu.style.display = 'none';
    if (!ui.achievementsScreen) return;
    try { Audio.play('click', { volume: 0.5 }); } catch (_) {}
    try { renderAchievements(); } catch (err) { console.error('Error logros:', err); }
    ui.achievementsScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
}

document.querySelectorAll('.closeBtn[data-close="achievementsScreen"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (ui.achievementsScreen) ui.achievementsScreen.style.display = 'none';
    document.body.style.overflow = '';
  });
});

// ==========================================
// BOTONES DEL MENÚ Y JUEGO
// ==========================================
if (ui.play) {
  ui.play.addEventListener('click', () => {
    // 🔥 MÚSICA: Cambiar a música de juego al iniciar
    Audio.playBGM('game', (save.musicVolume ?? 30) / 100);

    toggleFullScreen();
    Audio.init().then(() => Audio.setEnabled(save.musicOn === true));

    save.playerName = ui.name.value.trim() || 'Invitado';
    Storage.save(save);

    const loadingScreen = document.getElementById('loadingScreen');
    const loadingBar = document.getElementById('loadingBar');
    const loadingPercent = document.getElementById('loadingPercent');
    const loadingText = document.getElementById('loadingText');
    
    if (loadingScreen) loadingScreen.style.display = 'flex';
    document.body.classList.remove('in-menu');
    ui.menu.style.display = 'none';
    
    let progress = 0;
    const progressInterval = setInterval(() => {
      if (progress < 90) {
        progress += Math.random() * 5;
        if (progress > 90) progress = 90;
        
        if (loadingBar) loadingBar.style.width = `${progress}%`;
        if (loadingPercent) loadingPercent.textContent = `${Math.floor(progress)}%`;
        
        if (loadingText) {
          if (progress < 30) loadingText.textContent = "Cargando texturas...";
          else if (progress < 60) loadingText.textContent = "Plantando árboles...";
          else loadingText.textContent = "Construyendo el vecindario...";
        }
      }
    }, 150);

    ui.hud.style.display = 'flex';
    ui.look.style.display = 'block';
    
    const joystick = document.getElementById('joystick');
    if (joystick) joystick.style.display = 'flex';
    
    if (ui.mainMenuBtn) ui.mainMenuBtn.style.display = 'flex';
    if (ui.editModeBtn) ui.editModeBtn.style.display = 'flex';
    if (ui.timeCycleBtn) ui.timeCycleBtn.style.display = 'flex';
    
    const minimapContainer = document.getElementById('minimapContainer');
    const minimapToggleBtn = document.getElementById('minimapToggleBtn');
    if (minimapContainer) minimapContainer.style.display = 'none';
    if (minimapToggleBtn) minimapToggleBtn.style.display = 'flex';
    
    const weatherSelector = document.getElementById('weatherSelector');
    if (weatherSelector) weatherSelector.style.display = 'block';

    const audioToggleBtn = document.getElementById('audioToggle');
    if (audioToggleBtn) audioToggleBtn.style.display = 'flex';

    const jumpBtn = document.getElementById('jumpBtn');
    if (jumpBtn) jumpBtn.classList.add('visible');

    if (ui.runBtn) {
      ui.runBtn.style.display = 'flex';
      
      ui.runBtn.addEventListener('touchstart', (e) => {
        e.preventDefault();
        if (!world) return;
        world.setRunning(!world.isRunning);
        ui.runBtn.style.background = world.isRunning ? 'rgba(74, 222, 128, 0.9)' : 'rgba(30, 41, 59, 0.7)';
        ui.runBtn.style.borderColor = world.isRunning ? '#4ade80' : 'rgba(255, 255, 255, 0.4)';
      }, { passive: false });
      
      ui.runBtn.addEventListener('click', () => {
        if (!world) return;
        world.setRunning(!world.isRunning);
        ui.runBtn.style.background = world.isRunning ? 'rgba(74, 222, 128, 0.9)' : 'rgba(30, 41, 59, 0.7)';
        ui.runBtn.style.borderColor = world.isRunning ? '#4ade80' : 'rgba(255, 255, 255, 0.4)';
      });
    }

    startWorld();

    const checkWorldReady = setInterval(() => {
      if (world && world.isReady) {
        clearInterval(checkWorldReady);
        clearInterval(progressInterval);
        
        if (loadingBar) loadingBar.style.width = '100%';
        if (loadingPercent) loadingPercent.textContent = '100%';
        if (loadingText) loadingText.textContent = "¡Listo!";
        
        setTimeout(() => {
          if (loadingScreen) {
            loadingScreen.style.transition = 'opacity 0.5s';
            loadingScreen.style.opacity = '0';
            setTimeout(() => {
              loadingScreen.style.display = 'none';
              loadingScreen.style.opacity = '1';
            }, 500);
          }
          updateDailyRewardButton();
        }, 400);
      }
    }, 100);
  });
}

// ==========================================
// ABRIR AJUSTES DESDE EL MENÚ PRINCIPAL
// ==========================================
function openSettingsMenu() {
  ui.settingsName.value = save.playerName;
  ui.settingsSensitivity.value = save.sensitivity ?? 4;
  ui.settingsSensValue.textContent = save.sensitivity ?? 4;
  ui.settingsQuality.value = save.quality ?? 'media';
  
  if (ui.settingsFoliage) {
    ui.settingsFoliage.value = save.foliageDensity || 'alta';
    if (ui.foliageWarning) {
      ui.foliageWarning.style.display = (ui.settingsFoliage.value === 'extrema') ? 'block' : 'none';
    }
  }

  if (ui.settingsRenderDistance) {
    ui.settingsRenderDistance.value = save.renderDistance || 'media';
    if (ui.renderWarning) {
      ui.renderWarning.style.display = (ui.settingsRenderDistance.value === 'extrema') ? 'block' : 'none';
    }
  }

  // 🔥 MÚSICA: Cargar volumen
  if (ui.settingsMusicVolume) {
    ui.settingsMusicVolume.value = (save.musicVolume ?? 30);
    if (ui.settingsMusicVolValue) ui.settingsMusicVolValue.textContent = `${save.musicVolume ?? 30}%`;
  }
  
  document.getElementById('settingsScreen').style.display = 'flex';
}

if (ui.settingsBtn) {
  ui.settingsBtn.addEventListener('click', openSettingsMenu);
}

// ==========================================
// LISTENERS DE LOS SELECTS
// ==========================================
if (ui.settingsFoliage) {
  ui.settingsFoliage.addEventListener('change', () => {
    if (ui.foliageWarning) {
      ui.foliageWarning.style.display = (ui.settingsFoliage.value === 'extrema') ? 'block' : 'none';
    }
  });
}

if (ui.settingsRenderDistance) {
  ui.settingsRenderDistance.addEventListener('change', () => {
    if (ui.renderWarning) {
      ui.renderWarning.style.display = (ui.settingsRenderDistance.value === 'extrema') ? 'block' : 'none';
    }
  });
}

if (ui.settingsSensitivity) {
  ui.settingsSensitivity.addEventListener('input', () => {
    ui.settingsSensValue.textContent = ui.settingsSensitivity.value;
  });
}

// 🔥 MÚSICA: Listener del slider de volumen
if (ui.settingsMusicVolume) {
  ui.settingsMusicVolume.addEventListener('input', () => {
    if (ui.settingsMusicVolValue) ui.settingsMusicVolValue.textContent = `${ui.settingsMusicVolume.value}%`;
  });
  
  ui.settingsMusicVolume.addEventListener('change', () => {
    const vol = parseInt(ui.settingsMusicVolume.value, 10);
    save.musicVolume = vol;
    Audio.setBGMVolume(vol / 100);
    Storage.save(save);
  });
}

// ==========================================
// APLICAR AJUSTES
// ==========================================
if (ui.settingsApply) {
  ui.settingsApply.addEventListener('click', async () => {
    const oldQuality = save.quality;
    const oldFoliage = save.foliageDensity || 'alta';
    const oldDistance = save.renderDistance || 'media';
    
    save.playerName = ui.settingsName.value.trim() || 'Invitado';
    save.sensitivity = Number(ui.settingsSensitivity.value);
    save.quality = ui.settingsQuality.value;
    
    const newFoliage = ui.settingsFoliage ? ui.settingsFoliage.value : 'alta';
    const newDistance = ui.settingsRenderDistance ? ui.settingsRenderDistance.value : 'media';
    
    if (newFoliage === 'extrema' && oldFoliage !== 'extrema') {
      const confirmExtrema = await showCustomConfirm(
        '⚠️ Densidad Extrema',
        'Esto generará hasta un 250% de vegetación. Puede causar caídas de FPS y sobrecalentamiento en tu dispositivo. ¿Deseas continuar?'
      );
      if (!confirmExtrema) {
        if (ui.settingsFoliage) ui.settingsFoliage.value = oldFoliage;
        if (ui.foliageWarning) ui.foliageWarning.style.display = 'none';
        return;
      }
    }

    if (newDistance === 'extrema' && oldDistance !== 'extrema') {
      const confirmDist = await showCustomConfirm(
        '⚠️ Distancia Extrema',
        'Esto cargará muchos más objetos a tu alrededor. Puede causar caídas de FPS. ¿Deseas continuar?'
      );
      if (!confirmDist) {
        if (ui.settingsRenderDistance) ui.settingsRenderDistance.value = oldDistance;
        if (ui.renderWarning) ui.renderWarning.style.display = 'none';
        return;
      }
    }
    
    save.foliageDensity = newFoliage;
    save.renderDistance = newDistance;
    
    const foliageChanged = oldFoliage !== save.foliageDensity;
    const distanceChanged = oldDistance !== save.renderDistance;
    const qualityChanged = oldQuality !== save.quality;
    
    Storage.save(save);
    if (ui.name) ui.name.value = save.playerName;
    
    if ((foliageChanged || distanceChanged || qualityChanged) && world) {
      ui.settingsScreen.style.display = 'none';
      if (world._notifyTV) {
        world._notifyTV('🔄 Aplicando cambios...');
      }
      setTimeout(() => {
        world._regenerateFoliage();
      }, 100);
    } else {
      ui.settingsScreen.style.display = 'none';
    }
  });
}

if (ui.settingsReset) {
  ui.settingsReset.addEventListener('click', async () => {
    const quiereBorrar = await showCustomConfirm('¿Borrar progreso?', 'Se perderán todos tus muebles y monedas.');
    if (quiereBorrar) { Storage.clear(); location.reload(); }
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
    if (!AvatarViewer) { alert("El editor de avatar no está disponible."); return; }
    ui.avatarEditorScreen.style.display = 'flex';
    renderAvatarColors();
    updateGenderUI();
    setTimeout(() => {
      if (!avatarViewer) { avatarViewer = new AvatarViewer('avatar-editor-canvas', save); avatarViewer.start(); }
      else avatarViewer.start();
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
// MISIONES Y ECONOMÍA
// ==========================================
function getMissions() {
  if (!Array.isArray(save.missions)) save.missions = Storage.default().missions;
  return save.missions;
}

function renderMissions() {
  if (!ui.missionsGrid) return;
  const missions = getMissions();
  ui.missionsGrid.innerHTML = '';
  if (missions.length === 0) { ui.missionsGrid.innerHTML = '<p class="hint">No hay misiones disponibles.</p>'; return; }

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
      <div class="mission-progress-track"><div class="mission-progress-fill" style="width:${pct}%"></div></div>
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
  let changed = false, gained = 0, newlyCompleted = 0;

  for (const m of missions) {
    if (m.done || !matchesMission(m.match, id)) continue;
    m.progress = Math.min(m.target, (m.progress || 0) + 1);
    changed = true;
    if (m.progress >= m.target) {
      m.done = true; gained += m.reward; newlyCompleted++;
      if (world) world._notifyTV(`🎯 ¡Misión completada! +${m.reward} 🪙`);
    }
  }

  if (!save.lifetimeStats) save.lifetimeStats = {};
  save.lifetimeStats.furniturePlaced = (save.lifetimeStats.furniturePlaced ?? 0) + 1;
  if (newlyCompleted > 0) save.lifetimeStats.missionsCompleted = (save.lifetimeStats.missionsCompleted ?? 0) + newlyCompleted;

  if (gained > 0) {
    save.coins = (save.coins ?? 0) + gained;
    save.lifetimeStats.coinsEarned = (save.lifetimeStats.coinsEarned ?? 0) + gained;
    if (typeof updateCoins === 'function') updateCoins(save.coins);
    try { Audio.play('mision', { volume: 0.7 }); } catch (_) {}
  }

  if (changed) { Storage.save(save); renderMissions(); checkAchievements(); }
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
  if (!save.lifetimeStats) save.lifetimeStats = {};
  save.lifetimeStats.coinsEarned = (save.lifetimeStats.coinsEarned ?? 0) + renta;
  updateCoins(save.coins);
  Storage.save(save);
  try { Audio.play('moneda', { volume: 0.5 }); } catch (_) {}
  if (world) world._notifyTV(`🏠 Renta cobrada: +${renta} 🪙`);
  if (ui.missionsScreen && ui.missionsScreen.style.display === 'flex') actualizarPanelEconomia();
  checkAchievements();
}

if (ui.missionsToggle) {
  ui.missionsToggle.addEventListener('click', () => {
    try { Audio.play('click', { volume: 0.5 }); } catch (_) {}
    document.getElementById('mainMenu').style.display = 'none';
    renderMissions();
    actualizarPanelEconomia();
    ui.missionsScreen.style.display = 'flex';
  });
}

document.querySelectorAll('.closeBtn[data-close="missionsScreen"]').forEach(btn => {
  btn.addEventListener('click', () => { ui.missionsScreen.style.display = 'none'; });
});

// ==========================================
// TOGGLE DE AUDIO
// ==========================================
function updateAudioToggleIcon() {
  if (!ui.audioToggle) return;
  ui.audioToggle.textContent = save.musicOn ? '🔊' : '🔇';
  ui.audioToggle.style.borderColor = save.musicOn ? 'rgba(74,222,128,0.6)' : 'rgba(148,163,184,0.5)';
}

if (ui.audioToggle) {
  updateAudioToggleIcon();
  ui.audioToggle.addEventListener('click', () => {
    save.musicOn = !save.musicOn;
    Audio.setEnabled(save.musicOn);
    
    // 🔥 MÚSICA: Silenciar/reactivar el BGM
    if (save.musicOn) {
      Audio.setBGMVolume((save.musicVolume ?? 30) / 100);
    } else {
      Audio.setBGMVolume(0);
    }
    
    Storage.save(save);
    updateAudioToggleIcon();
    if (save.musicOn) { try { Audio.play('click', { volume: 0.5 }); } catch (_) {} }
  });
}

// ==========================================
// SISTEMA DE MASCOTAS MÚLTIPLES
// ==========================================
function renderCompanions() {
  if (!ui.companionGrid) return;
  ui.companionGrid.innerHTML = '';

  const owned = save.ownedCompanions || [];
  
  if (owned.length === 0) {
    ui.companionGrid.innerHTML = '<p class="hint" style="grid-column: 1 / -1; text-align: center;">Aún no tienes mascotas. ¡Ve a la tienda a comprar una!</p>';
    return;
  }

  owned.forEach(id => {
    const item = SHOP_ITEMS.find(i => i.id === id);
    if (!item) return;

    const isEquipped = (save.activeCompanion === id);
    
    const el = document.createElement('div');
    el.className = 'shop-item' + (isEquipped ? ' selected' : '');
    el.style.border = isEquipped ? '2px solid #4ade80' : '';
    
    el.innerHTML = `
      <span class="emoji">${item.emoji}</span>
      <span class="name">${item.name}</span>
      <span class="price ${isEquipped ? 'free' : ''}" style="color: ${isEquipped ? '#4ade80' : '#cbd5e1'}">
        ${isEquipped ? 'Equipado ✅' : 'Toca para equipar'}
      </span>
    `;

    el.addEventListener('click', () => {
      if (isEquipped) {
        save.activeCompanion = null;
        if (world) world.setCompanion(null);
        if (world) world._notifyTV('🐾 Mascota guardada');
      } else {
        save.activeCompanion = id;
        if (world) world.setCompanion(id);
        if (world) world._notifyTV(`🐾 ${item.name} equipado`);
      }
      Storage.save(save);
      renderCompanions();
    });

    ui.companionGrid.appendChild(el);
  });
}

if (ui.companionToggle) {
  ui.companionToggle.addEventListener('click', () => {
    if (ui.mainMenu) ui.mainMenu.style.display = 'none';
    renderCompanions();
    if (ui.companionScreen) ui.companionScreen.style.display = 'flex';
    document.body.style.overflow = 'hidden';
  });
}

document.querySelectorAll('.closeBtn[data-close="companionScreen"]').forEach(btn => {
  btn.addEventListener('click', () => {
    if (ui.companionScreen) ui.companionScreen.style.display = 'none';
    document.body.style.overflow = '';
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
    alert("Error al cargar el mundo 3D.");
    return;
  }

  if (save.activeCompanion) {
    world.setCompanion(save.activeCompanion);
  }

  const tryPlace = () => {
    const ok = world.confirmPlace();
    if (!ok) { ui.status.textContent = 'No se puede colocar aquí'; return; }
    shop.consumeSelected();
    const counts = shop.countInventory();
    const remaining = counts[world.selectedId] ?? 0;
    if (remaining <= 0) { world.cancelPlacement(); if (shop) shop.clearSelection(); }
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
  world.onDeleteRequest = (type) => { shop.addToInventory(type, 1); ui.status.textContent = 'Devuelto al inventario'; saveCurrentState(); actualizarPanelEconomia(); };
  world.onTVSave = () => { saveCurrentState(); };
  world.onFurniturePlaced = (id) => { updateMissionsOnPlace(id); };

  if (ui.placeConfirm) ui.placeConfirm.addEventListener('click', tryPlace);
  if (ui.placeCancel) ui.placeCancel.addEventListener('click', () => { world.cancelPlacement(); if (shop) shop.clearSelection(); });
  if (ui.rotateBtn) ui.rotateBtn.addEventListener('click', () => { if (world) world.rotateGhost(); });

  if (ui.moveConfirm) {
    ui.moveConfirm.addEventListener('click', () => {
      world._prepareMoveOriginal();
      const ok = world.confirmMove();
      ui.status.textContent = ok ? 'Movido' : 'No se puede mover aquí';
      saveCurrentState();
      actualizarPanelEconomia();
    });
  }
  if (ui.moveCancel) ui.moveCancel.addEventListener('click', () => world.cancelMove());
  if (ui.moveRotate) ui.moveRotate.addEventListener('click', () => { if (world) world.rotateGhost(); });

  if (ui.editModeBtn) {
    ui.editModeBtn.addEventListener('click', () => {
      try {
        const on = !world.editMode;
        world.setEditMode(on);
        ui.status.textContent = on ? 'Apunta a un mueble' : 'Listo';
        ui.editModeBtn.classList.toggle('active', on);
      } catch (err) {
        console.error('❌ Error al activar edición:', err);
      }
    });
  }

  if (ui.timeCycleBtn) {
    let timeState = 0;
    ui.timeCycleBtn.addEventListener('click', () => {
      timeState = (timeState + 1) % 3;
      if (timeState === 0) {
        world.setTimeOfDay(0.35);
        ui.timeCycleBtn.textContent = '☀️';
        ui.timeCycleBtn.style.background = '#ffd479';
        world._notifyTV('☀️ Día');
      } else if (timeState === 1) {
        world.setTimeOfDay(0.72);
        ui.timeCycleBtn.textContent = '🌇';
        ui.timeCycleBtn.style.background = '#f97316';
        world._notifyTV('🌇 Atardecer');
      } else {
        world.setTimeOfDay(0.95);
        ui.timeCycleBtn.textContent = '🌙';
        ui.timeCycleBtn.style.background = '#334155';
        world._notifyTV('🌙 Noche');
      }
    });
  }

  if (ui.editMove) ui.editMove.addEventListener('click', () => { if (!world.editTarget) return; world._prepareMoveOriginal(); world.startMove(); });
  if (ui.editDelete) ui.editDelete.addEventListener('click', () => { world.deleteTarget(); ui.status.textContent = 'Devuelto al inventario'; saveCurrentState(); actualizarPanelEconomia(); });
  if (ui.editClose) ui.editClose.addEventListener('click', () => { world.editTarget = null; world.highlightTarget(null); ui.editPanel.style.display = 'none'; if (ui.editContent) ui.editContent.style.display = 'none'; });
  if (ui.editContent) ui.editContent.addEventListener('click', () => { if (world.editTarget && world.editTarget.type === 'tv') world.openTVPanel(world.editTarget); });

  const tvUrl = document.getElementById('tvUrl');
  const tvLoad = document.getElementById('tvLoad');
  const tvStop = document.getElementById('tvStop');
  const tvOverlay = document.getElementById('tvOverlay');
  const tvOverlayClose = document.getElementById('tvOverlayClose');

  document.querySelectorAll('.closeBtn[data-close="tvPanel"]').forEach(btn => btn.addEventListener('click', () => { world.closeTVPanel(); }));
  if (tvLoad) tvLoad.addEventListener('click', () => {
    const url = tvUrl.value.trim(); if (!url || !world.tvTarget) return;
    world.loadTVContent(world.tvTarget, url); world.saveTVUrl(world.tvTarget, url); saveCurrentState(); world.closeTVPanel(); ui.status.textContent = 'TV actualizada';
  });
  if (tvStop) tvStop.addEventListener('click', () => {
    if (!world.tvTarget) return; world.stopTVContent(world.tvTarget); world.saveTVUrl(world.tvTarget, null); saveCurrentState(); ui.status.textContent = 'TV detenida';
  });
  document.querySelectorAll('.tv-samples button').forEach(btn => btn.addEventListener('click', () => { tvUrl.value = btn.dataset.sample; }));
  if (tvOverlayClose) tvOverlayClose.addEventListener('click', () => { tvOverlay.style.display = 'none'; document.getElementById('tvOverlayInner').innerHTML = ''; });

  if (ui.settingsToggle) {
    ui.settingsToggle.addEventListener('click', () => {
      document.getElementById('mainMenu').style.display = 'none';
      openSettingsMenu();
    });
  }

  if (ui.backToMenu) {
    ui.backToMenu.addEventListener('click', async () => {
      const quiereSalir = await showCustomConfirm('¿Salir al menú principal?', 'Se guardará todo el progreso.');
      if (quiereSalir) { 
        // 🔥 MÚSICA: Volver a música de menú
        Audio.playBGM('menu', (save.musicVolume ?? 30) / 100);
        
        saveCurrentState(); 
        location.reload(); 
      }
    });
  }

  const weatherBtn = document.getElementById('weatherBtn');
  const weatherMenu = document.getElementById('weatherMenu');
  const weatherIcon = document.getElementById('weatherIcon');
  const weatherLabel = document.getElementById('weatherLabel');
  const weatherMeta = {
    despejado: { icon: '☀️', label: 'Despejado' }, lluvia_moderada: { icon: '🌧️', label: 'Lluvia moderada' }, lluvia_intensa: { icon: '🌧️', label: 'Lluvia intensa' },
    nieve_moderada: { icon: '🌨️', label: 'Nieve moderada' }, nieve_intensa: { icon: '❄️', label: 'Nieve intensa' }, tormenta: { icon: '⛈️', label: 'Tormenta eléctrica' },
  };

  function updateWeatherUI(weather) {
    const meta = weatherMeta[weather] || weatherMeta.despejado;
    if (weatherIcon) weatherIcon.textContent = meta.icon;
    if (weatherLabel) weatherLabel.textContent = meta.label;
    document.querySelectorAll('.weather-option').forEach(b => b.classList.toggle('active', b.dataset.weather === weather));
  }

  if (weatherBtn && weatherMenu) {
    weatherBtn.addEventListener('click', (e) => { e.stopPropagation(); weatherMenu.style.display = weatherMenu.style.display === 'none' ? 'flex' : 'none'; });
    document.addEventListener('click', (e) => { if (!weatherBtn.contains(e.target) && !weatherMenu.contains(e.target)) weatherMenu.style.display = 'none'; });
    document.querySelectorAll('.weather-option').forEach(btn => {
      btn.addEventListener('click', () => {
        const weather = btn.dataset.weather;
        world.setWeather(weather); updateWeatherUI(weather); weatherMenu.style.display = 'none'; save.weather = weather;
        if (!save.lifetimeStats) save.lifetimeStats = {};
        save.lifetimeStats.weatherChanges = (save.lifetimeStats.weatherChanges ?? 0) + 1;
        Storage.save(save); checkAchievements();
      });
    });
  }

  updateWeatherUI(save.weather || 'despejado');
  world.start(() => {});

  setInterval(() => { saveCurrentState(); ui.status.textContent = `Guardado · ${new Date().toLocaleTimeString()}`; }, 5000);
  if (rentInterval) clearInterval(rentInterval);
  rentInterval = setInterval(procesarRenta, 120000);
  updateDailyRewardButton();
}

// ==========================================
// SONIDO GLOBAL DE CLICKS EN LA UI
// ==========================================
document.addEventListener('pointerdown', (e) => {
  const btn = e.target.closest('button');
  if (!btn) return;
  if (Audio.ctx && Audio.ctx.state !== 'running') Audio.ctx.resume().catch(() => {});
  if (btn.id === 'audioToggle' || btn.id === 'settingsAudioToggle' || btn.id === 'dailyRewardBtn' || btn.id === 'runBtn') return;
  try { Audio.play('click', { volume: 0.3 }); } catch (_) {}
}, { capture: true });

const unlockAudio = () => { if (Audio.ctx && (Audio.ctx.state === 'suspended' || Audio.ctx.state === 'interrupted')) Audio.ctx.resume().catch(() => {}); };
document.addEventListener('touchstart', unlockAudio, { passive: true });
document.addEventListener('mousedown', unlockAudio);
document.addEventListener('keydown', unlockAudio);

// ==========================================
// MINIMAPA
// ==========================================
const minimapContainer = document.getElementById('minimapContainer');
const minimapCanvas = document.getElementById('minimapCanvas');
const minimapCtx = minimapCanvas ? minimapCanvas.getContext('2d') : null;
const minimapToggleBtn = document.getElementById('minimapToggleBtn');
const minimapExpandBtn = document.getElementById('minimapExpandBtn');
const minimapCloseBtn = document.getElementById('minimapCloseBtn');

let isMinimapVisible = false;
let isMinimapExpanded = false;

if (minimapToggleBtn) {
  minimapToggleBtn.addEventListener('click', () => {
    isMinimapVisible = !isMinimapVisible;
    if (minimapContainer) {
      minimapContainer.style.display = isMinimapVisible ? 'block' : 'none';
    }
    
    // 🔥 MOSTRAR/OCULTAR COORDENADAS
    const coordsEl = document.getElementById('minimapCoords');
    if (coordsEl) {
      coordsEl.style.display = isMinimapVisible ? 'block' : 'none';
    }
  });
}

function expandMinimap() {
  if (!minimapContainer || !minimapCanvas) return;
  isMinimapExpanded = true;
  
  minimapContainer.style.width = '90vw';
  minimapContainer.style.height = '90vw';
  minimapContainer.style.maxWidth = '600px';
  minimapContainer.style.maxHeight = '600px';
  minimapContainer.style.top = '50%';
  minimapContainer.style.left = '50%';
  minimapContainer.style.transform = 'translate(-50%, -50%)';
  minimapContainer.style.borderRadius = '20px';
  
  minimapCanvas.width = 1024;
  minimapCanvas.height = 1024;
  
  if (minimapExpandBtn) minimapExpandBtn.style.display = 'none';
  if (minimapCloseBtn) minimapCloseBtn.style.display = 'block';
  
  // 🔥 OCULTAR COORDENADAS AL EXPANDIR
  const coordsEl = document.getElementById('minimapCoords');
  if (coordsEl) coordsEl.style.display = 'none';
}

function closeMinimap() {
  if (!minimapContainer || !minimapCanvas) return;
  isMinimapExpanded = false;
  
  minimapContainer.style.width = '120px';
  minimapContainer.style.height = '120px';
  minimapContainer.style.top = '80px';
  minimapContainer.style.left = '10px';
  minimapContainer.style.transform = 'none';
  minimapContainer.style.borderRadius = '50%';
  
  minimapCanvas.width = 240;
  minimapCanvas.height = 240;
  
  if (minimapExpandBtn) minimapExpandBtn.style.display = 'block';
  if (minimapCloseBtn) minimapCloseBtn.style.display = 'none';
  
  // 🔥 MOSTRAR COORDENADAS AL CERRAR
  const coordsEl = document.getElementById('minimapCoords');
  if (coordsEl) coordsEl.style.display = isMinimapVisible ? 'block' : 'none';
}

if (minimapExpandBtn) {
  minimapExpandBtn.addEventListener('click', (e) => { e.stopPropagation(); expandMinimap(); });
}
if (minimapCloseBtn) {
  minimapCloseBtn.addEventListener('click', (e) => { e.stopPropagation(); closeMinimap(); });
}

if (minimapCanvas) {
  minimapCanvas.addEventListener('click', () => {
    if (isMinimapExpanded) closeMinimap();
    else expandMinimap();
  });
}

let minimapBgCanvas = null;
let minimapBgCtx = null;

function buildStaticMapLayer() {
  if (!world || !world.terrain || !world.terrain.allScatterItems) return;

  minimapBgCanvas = document.createElement('canvas');
  minimapBgCanvas.width = 2048;
  minimapBgCanvas.height = 2048;
  minimapBgCtx = minimapBgCanvas.getContext('2d');

  minimapBgCtx.fillStyle = '#2a4a2a';
  minimapBgCtx.fillRect(0, 0, 2048, 2048);

  const worldSize = 800;
  const centerOffset = 2048 / 2;
  const scaleToBg = 2048 / worldSize;

  minimapBgCtx.fillStyle = 'rgba(150, 150, 100, 0.4)';
  minimapBgCtx.fillRect(
    centerOffset - (30 * scaleToBg),
    centerOffset - (30 * scaleToBg),
    60 * scaleToBg,
    60 * scaleToBg
  );

  if (world.terrain.lakes) {
    minimapBgCtx.fillStyle = '#2a8aba';
    for (const lake of world.terrain.lakes) {
      minimapBgCtx.beginPath();
      minimapBgCtx.arc(
        centerOffset + (lake.x * scaleToBg),
        centerOffset + (lake.z * scaleToBg),
        lake.radius * scaleToBg,
        0, Math.PI * 2
      );
      minimapBgCtx.fill();
    }
  }

  if (world.terrain.allScatterItems) {
    minimapBgCtx.fillStyle = '#1a3a1a';
    for (const item of world.terrain.allScatterItems) {
      if (!item.id.startsWith('arbol') && !item.id.startsWith('pino')) continue;
      minimapBgCtx.beginPath();
      minimapBgCtx.arc(
        centerOffset + (item.x * scaleToBg),
        centerOffset + (item.z * scaleToBg),
        1.5, 0, Math.PI * 2
      );
      minimapBgCtx.fill();
    }
  }
}

function drawMinimap() {
  if (!world || !minimapCtx || !minimapContainer || minimapContainer.style.display === 'none') return;
  if (!minimapBgCanvas) buildStaticMapLayer();
  if (!minimapBgCanvas) return;

  const ctx = minimapCtx;
  const W = minimapCanvas.width;
  const H = minimapCanvas.height;
  const centerX = W / 2;
  const centerY = H / 2;
  
  const MINIMAP_RADIUS = isMinimapExpanded ? 200 : 50;

  ctx.fillStyle = '#2a4a2a';
  ctx.fillRect(0, 0, W, H);

  const bgScale = 2048 / 800;
  const camX = world.camera.position.x;
  const camZ = world.camera.position.z;
  
  const sourceX = (800 / 2 + camX) * bgScale - (MINIMAP_RADIUS * bgScale);
  const sourceZ = (800 / 2 + camZ) * bgScale - (MINIMAP_RADIUS * bgScale);
  const sourceSize = (MINIMAP_RADIUS * 2) * bgScale;

  ctx.drawImage(minimapBgCanvas, sourceX, sourceZ, sourceSize, sourceSize, 0, 0, W, H);

  // 🔥 MARCAR LOS 4 LOTES CON COORDENADAS
  const lots = [
    { x: -15, z: -15, label: 'L1' },
    { x:  15, z: -15, label: 'L2' },
    { x: -15, z:  15, label: 'L3' },
    { x:  15, z:  15, label: 'L4' }
  ];
  
  const mapToScreen = (worldX, worldZ) => {
    // Convertir coordenadas del mundo a posición en el minimapa
    const relX = worldX - camX;
    const relZ = worldZ - camZ;
    const screenX = centerX + (relX / (MINIMAP_RADIUS * 2)) * W;
    const screenY = centerY + (relZ / (MINIMAP_RADIUS * 2)) * H;
    return { x: screenX, y: screenY };
  };

  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';

  for (const lot of lots) {
    const pos = mapToScreen(lot.x, lot.z);
    // Solo dibujar si está dentro del mapa
    if (pos.x < 0 || pos.x > W || pos.y < 0 || pos.y > H) continue;

    // Dibujar círculo del lote
    ctx.fillStyle = 'rgba(250, 204, 21, 0.8)';
    ctx.beginPath();
    ctx.arc(pos.x, pos.y, 6, 0, Math.PI * 2);
    ctx.fill();
    
    // Dibujar borde
    ctx.strokeStyle = '#172233';
    ctx.lineWidth = 2;
    ctx.stroke();

    // Dibujar etiqueta
    ctx.fillStyle = '#fff';
    ctx.strokeStyle = '#172233';
    ctx.lineWidth = 3;
    ctx.strokeText(lot.label, pos.x, pos.y - 12);
    ctx.fillText(lot.label, pos.x, pos.y - 12);
  }

  // Flecha del jugador
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(-world.controls.yaw); 
  ctx.fillStyle = '#ff4444';
  ctx.beginPath();
  ctx.moveTo(0, -8);
  ctx.lineTo(-5, 5);
  ctx.lineTo(5, 5);
  ctx.closePath();
  ctx.fill();
  ctx.restore();

  ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(centerX, centerY, (W/2) - 2, 0, Math.PI * 2);
  ctx.stroke();

  // 🔥 ACTUALIZAR COORDENADAS DEBAJO DEL MINIMAPA
  const coordsEl = document.getElementById('minimapCoords');
  if (coordsEl) {
    coordsEl.textContent = `X: ${Math.round(camX)}  Z: ${Math.round(camZ)}`;
  }
}

setInterval(() => {
  if (isMinimapVisible) drawMinimap();
}, 200);

window.addEventListener('beforeunload', () => { saveCurrentState(); });

// ==========================================
// MÚSICA DE FONDO
// ==========================================
// Iniciar música del menú al hacer el primer clic
let musicStarted = false;
const startMenuMusic = () => {
  if (musicStarted) return;
  musicStarted = true;
  
  Audio.init().then(() => {
    // Si ya estamos en el juego (no debería), poner música de juego
    if (!document.body.classList.contains('in-menu')) {
      Audio.playBGM('game', (save.musicVolume ?? 30) / 100);
    } else {
      Audio.playBGM('menu', (save.musicVolume ?? 30) / 100);
    }
  });
  
  document.removeEventListener('click', startMenuMusic);
  document.removeEventListener('touchstart', startMenuMusic);
  document.removeEventListener('keydown', startMenuMusic);
};
document.addEventListener('click', startMenuMusic);
document.addEventListener('touchstart', startMenuMusic);
document.addEventListener('keydown', startMenuMusic);