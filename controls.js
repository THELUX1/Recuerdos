// controls.js
import * as THREE from 'three';

export class Controls {
  constructor(camera, options = {}) {
    this.camera = camera;
    this.yaw = options.yaw ?? 0;
    this.pitch = options.pitch ?? 0;
    this.sensitivity = options.sensitivity ?? 0.0035;

    this.move = { x: 0, y: 0 };
    this.keys = new Set();

    this.jumpRequested = false;

    this._joyId = null;
    this._lookId = null;

    // Bloqueo de movimiento (para sentarse/acostarse)
    this.movementLocked = false;

    this._initJoystick();
    this._initLook();
    this._initKeyboard();
    this._initJumpButton();
    this._applyRotation();
  }

  setSensitivity(v) {
    this.sensitivity = Math.max(0.0005, Math.min(0.015, v));
  }

  requestJump() {
    this.jumpRequested = true;
  }

  consumeJump() {
    if (this.jumpRequested) {
      this.jumpRequested = false;
      return true;
    }
    return false;
  }

  _initJumpButton() {
    const btn = document.getElementById('jumpBtn');
    if (!btn) return;

    btn.addEventListener('touchstart', (e) => {
      e.preventDefault();
      this.requestJump();
    }, { passive: false });

    btn.addEventListener('mousedown', (e) => {
      e.preventDefault();
      this.requestJump();
    });

    btn.addEventListener('touchstart', () => btn.classList.add('active'), { passive: true });
    btn.addEventListener('touchend',   () => btn.classList.remove('active'));
    btn.addEventListener('touchcancel',() => btn.classList.remove('active'));
    btn.addEventListener('mousedown',  () => btn.classList.add('active'));
    btn.addEventListener('mouseup',    () => btn.classList.remove('active'));
    btn.addEventListener('mouseleave', () => btn.classList.remove('active'));
  }

  _initJoystick() {
    const joy = document.getElementById('joystick');
    const stick = document.getElementById('stick');
    if (!joy) return;

    const max = 45;
    let sx = 0, sy = 0;

    const onStart = (e) => {
      if (this.movementLocked) return;
      for (const t of e.changedTouches) {
        if (this._joyId === null) {
          this._joyId = t.identifier;
          sx = t.clientX;
          sy = t.clientY;
          break;
        }
      }
    };

    const onMove = (e) => {
      if (this._joyId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier !== this._joyId) continue;
        let dx = t.clientX - sx;
        let dy = t.clientY - sy;
        const d = Math.hypot(dx, dy);
        if (d > max) { dx = dx / d * max; dy = dy / d * max; }
        stick.style.transform = `translate(${dx}px, ${dy}px)`;
        this.move.x = dx / max;
        this.move.y = dy / max;
        e.preventDefault();
      }
    };

    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._joyId) {
          this._joyId = null;
          stick.style.transform = 'translate(0,0)';
          this.move.x = 0;
          this.move.y = 0;
        }
      }
    };

    joy.addEventListener('touchstart', onStart, { passive: true });
    joy.addEventListener('touchmove', onMove, { passive: false });
    joy.addEventListener('touchend', onEnd);
    joy.addEventListener('touchcancel', onEnd);
  }

  _initLook() {
    const surface = document.getElementById('lookZone');
    if (!surface) return;

    let lx = 0, ly = 0;

    const onStart = (e) => {
      for (const t of e.changedTouches) {
        if (this._lookId === null) {
          this._lookId = t.identifier;
          lx = t.clientX;
          ly = t.clientY;
          break;
        }
      }
    };

    const onMove = (e) => {
      if (this._lookId === null) return;
      for (const t of e.changedTouches) {
        if (t.identifier !== this._lookId) continue;
        const dx = t.clientX - lx;
        const dy = t.clientY - ly;
        lx = t.clientX;
        ly = t.clientY;

        this.yaw   -= dx * this.sensitivity;
        this.pitch -= dy * this.sensitivity;
        const lim = Math.PI / 2 - 0.05;
        this.pitch = Math.max(-lim, Math.min(lim, this.pitch));
        this._applyRotation();
        e.preventDefault();
      }
    };

    const onEnd = (e) => {
      for (const t of e.changedTouches) {
        if (t.identifier === this._lookId) this._lookId = null;
      }
    };

    surface.addEventListener('touchstart', onStart, { passive: true });
    surface.addEventListener('touchmove', onMove, { passive: false });
    surface.addEventListener('touchend', onEnd);
    surface.addEventListener('touchcancel', onEnd);
  }

  _initKeyboard() {
    addEventListener('keydown', e => {
      if (this.movementLocked) return;
      const k = e.key.toLowerCase();
      this.keys.add(k);
      if (k === ' ' || k === 'spacebar') {
        e.preventDefault();
        if (!this._spaceDown) {
          this._spaceDown = true;
          this.requestJump();
        }
      }
    });
    addEventListener('keyup', e => {
      const k = e.key.toLowerCase();
      this.keys.delete(k);
      if (k === ' ' || k === 'spacebar') {
        this._spaceDown = false;
      }
    });
  }

  _applyRotation() {
    this.camera.rotation.order = 'YXZ';
    this.camera.rotation.y = this.yaw;
    this.camera.rotation.x = this.pitch;
  }

  getMoveVector() {
    // Si el movimiento está bloqueado (sentado/acostado), retornar cero
    if (this.movementLocked) {
      return new THREE.Vector3(0, 0, 0);
    }

    const f = new THREE.Vector3(-Math.sin(this.yaw), 0, -Math.cos(this.yaw));
    const r = new THREE.Vector3( Math.cos(this.yaw), 0, -Math.sin(this.yaw));

    let mx = this.move.x;
    let my = this.move.y;

    if (this.keys.has('w')) my -= 1;
    if (this.keys.has('s')) my += 1;
    if (this.keys.has('a')) mx -= 1;
    if (this.keys.has('d')) mx += 1;

    const v = new THREE.Vector3();
    v.addScaledVector(f, -my);
    v.addScaledVector(r,  mx);
    if (v.lengthSq() > 1) v.normalize();
    return v;
  }
}