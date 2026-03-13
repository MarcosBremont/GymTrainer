/* ===================================================
   GymTrainer Pro - Main Application (Firebase version)
   =================================================== */

import { auth, secondaryAuth } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
  verifyBeforeUpdateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import {
  DB, uid, EXERCISE_LIBRARY, MEAL_SLOTS, DAYS_OF_WEEK,
} from './data.js';

// ── Avatar colors ────────────────────────────────────
const AVATAR_COLORS = ['avatar-purple','avatar-red','avatar-green','avatar-yellow','avatar-orange','avatar-pink'];
const randomColor   = () => AVATAR_COLORS[Math.floor(Math.random() * AVATAR_COLORS.length)];

// ── Helpers (exported to window) ─────────────────────
function togglePassword(id) {
  const el = document.getElementById(id);
  el.type = el.type === 'password' ? 'text' : 'password';
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  return new Date(dateStr + 'T12:00:00').toLocaleDateString('es-ES', { day: '2-digit', month: 'short', year: 'numeric' });
}
function todayStr() { return new Date().toISOString().split('T')[0]; }
function calcIMC(weight, height) {
  if (!weight || !height) return '-';
  return (weight / ((height / 100) ** 2)).toFixed(1);
}
function imcCategory(imc) {
  if (imc < 18.5) return { label: 'Bajo peso',   cls: 'badge-accent'  };
  if (imc < 25)   return { label: 'Normal',        cls: 'badge-green'  };
  if (imc < 30)   return { label: 'Sobrepeso',     cls: 'badge-yellow' };
  return              { label: 'Obesidad',      cls: 'badge-accent'  };
}
function dayLabel(key) { return DAYS_OF_WEEK.find(d => d.key === key)?.label || key; }
function getMuscleInfo(group) { return EXERCISE_LIBRARY[group] || { label: group, icon: '🏋️', color: 'var(--primary)' }; }

// ── GymApp ───────────────────────────────────────────
class GymApp {
  constructor() {
    this.user              = null;
    this.view              = 'dashboard';
    this.viewParams        = {};
    this.charts            = {};
    this.deferredInstall   = null;
    this._builderExercises = [];
    this._registering      = false; // evita que onAuthStateChanged interfiera al registrar
    this.init();
  }

  // ── Init ───────────────────────────────────────────
  async init() {
    this.showInitLoader();
    this.setupPWA();
    this.setupAuthListeners();
    this.setupOnAuthStateChanged();
  }

  showInitLoader() {
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    // Reuse the spinner concept inline in body
    if (!document.getElementById('init-loader')) {
      const el = document.createElement('div');
      el.id = 'init-loader';
      el.style.cssText = 'position:fixed;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;background:#0D0D1A;z-index:9999;gap:16px';
      el.innerHTML = `<span style="font-size:3rem;filter:drop-shadow(0 0 20px rgba(108,99,255,.6))">💪</span>
                      <div class="spinner" style="margin:0"></div>
                      <p style="color:#A0A0C0;font-size:.9rem">Cargando GymTrainer Pro…</p>`;
      document.body.appendChild(el);
    }
  }

  hideInitLoader() {
    document.getElementById('init-loader')?.remove();
  }

  // ── SIDEBAR ──────────────────────────────────────────
  toggleSidebar() {
    document.getElementById('sidebar')?.classList.toggle('open');
    document.getElementById('sidebar-overlay')?.classList.toggle('hidden');
  }

  closeSidebar() {
    document.getElementById('sidebar')?.classList.remove('open');
    document.getElementById('sidebar-overlay')?.classList.add('hidden');
  }

  // ── PWA ────────────────────────────────────────────
  setupPWA() {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('./sw.js').catch(e => console.warn('SW:', e));
    }
    window.addEventListener('beforeinstallprompt', e => {
      e.preventDefault();
      this.deferredInstall = e;
      document.getElementById('install-banner').classList.remove('hidden');
    });
    document.getElementById('install-btn')?.addEventListener('click', () => this.installApp());
    document.getElementById('install-dismiss')?.addEventListener('click', () =>
      document.getElementById('install-banner').classList.add('hidden'));
  }

  installApp() {
    if (!this.deferredInstall) return;
    this.deferredInstall.prompt();
    this.deferredInstall.userChoice.then(() => {
      this.deferredInstall = null;
      document.getElementById('install-banner').classList.add('hidden');
    });
  }

  // ── Auth ───────────────────────────────────────────
  setupAuthListeners() {
    document.querySelectorAll('.auth-tab').forEach(tab => {
      tab.addEventListener('click', () => {
        document.querySelectorAll('.auth-tab, .tab-content').forEach(el => el.classList.remove('active'));
        tab.classList.add('active');
        document.getElementById(`tab-${tab.dataset.tab}`).classList.add('active');
      });
    });

    document.getElementById('login-form').addEventListener('submit', e => {
      e.preventDefault();
      const email = document.getElementById('login-email').value.trim();
      const pass  = document.getElementById('login-password').value;
      this.login(email, pass);
    });

    document.getElementById('register-form').addEventListener('submit', e => {
      e.preventDefault();
      this.register();
    });
  }

  // ── Registro nuevo usuario ─────────────────────────
  async onRegRoleChange(role) {
    const group  = document.getElementById('reg-trainer-group');
    const select = document.getElementById('reg-trainer');
    if (role === 'client') {
      group.classList.remove('hidden');
      select.innerHTML = '<option value="">Cargando entrenadores…</option>';
      try {
        const trainers = await DB.getTrainers();
        if (!trainers.length) {
          select.innerHTML = '<option value="">No hay entrenadores registrados aún</option>';
        } else {
          select.innerHTML =
            '<option value="">Selecciona tu entrenador…</option>' +
            trainers.map(t => `<option value="${t.id}">${t.name}${t.gym ? ' · ' + t.gym : ''}</option>`).join('');
        }
      } catch {
        select.innerHTML = '<option value="">Error al cargar. Reintenta.</option>';
      }
    } else {
      group.classList.add('hidden');
    }
  }

  async register() {
    const name      = document.getElementById('reg-name').value.trim();
    const email     = document.getElementById('reg-email').value.trim();
    const password  = document.getElementById('reg-password').value;
    const role      = document.getElementById('reg-role').value;
    const trainerId = document.getElementById('reg-trainer')?.value || null;
    const errEl     = document.getElementById('reg-error');
    const btn       = document.querySelector('#register-form button[type=submit]');

    errEl.classList.add('hidden');

    if (!role) {
      errEl.textContent = 'Selecciona si eres entrenador o cliente.';
      errEl.classList.remove('hidden'); return;
    }
    if (role === 'client' && !trainerId) {
      errEl.textContent = 'Debes seleccionar tu entrenador.';
      errEl.classList.remove('hidden'); return;
    }

    btn.disabled = true; btn.textContent = 'Creando cuenta…';

    try {
      this._registering = true;
      const cred   = await createUserWithEmailAndPassword(auth, email, password);
      const userId = cred.user.uid;

      const userData = {
        id: userId, role, name, email, phone: '',
        avatar: role === 'trainer' ? '🏋️' : '💪',
        color: randomColor(),
        joinDate: todayStr(), active: true,
        ...(role === 'trainer'
          ? { gym: '', specialty: '', experience: '' }
          : { trainerId, goal: '', level: 'Principiante', age: null }),
      };

      await DB.saveUser(userData);
      this._registering = false;
      this.hideInitLoader();
      this.toast('¡Cuenta creada correctamente!');
      this.startApp(userData);
    } catch (e) {
      this._registering = false;
      const msgs = {
        'auth/email-already-in-use': 'Ese email ya está registrado. Inicia sesión.',
        'auth/weak-password':        'La contraseña debe tener al menos 6 caracteres.',
        'auth/invalid-email':        'El formato del email no es válido.',
      };
      errEl.textContent = msgs[e.code] || e.message;
      errEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = 'Crear cuenta';
    }
  }

  setupOnAuthStateChanged() {
    onAuthStateChanged(auth, async firebaseUser => {
      if (this._registering) return; // el flujo de registro lo maneja register()
      this.hideInitLoader();
      if (firebaseUser) {
        const userData = await DB.getUser(firebaseUser.uid);
        if (userData) {
          this.startApp(userData);
        } else {
          // Auth account exists but no Firestore doc → sign out
          await signOut(auth);
          this.showAuthScreen();
        }
      } else {
        this.showAuthScreen();
      }
    });
  }

  async login(email, password) {
    const btn  = document.querySelector('#login-form button[type=submit]');
    const errEl = document.getElementById('login-error');
    btn.disabled = true;
    btn.textContent = 'Entrando…';
    errEl.classList.add('hidden');
    try {
      await signInWithEmailAndPassword(auth, email, password);
      // onAuthStateChanged handles the rest
    } catch (e) {
      const msgs = {
        'auth/invalid-credential':      'Correo o contraseña incorrectos.',
        'auth/wrong-password':          'Correo o contraseña incorrectos.',
        'auth/user-not-found':          'No existe una cuenta con ese correo.',
        'auth/too-many-requests':       'Demasiados intentos. Espera un momento.',
        'auth/network-request-failed':  'Sin conexión. Comprueba tu red.',
      };
      errEl.textContent = msgs[e.code] || `Error: ${e.message}`;
      errEl.classList.remove('hidden');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Entrar';
    }
  }

  async logout() {
    this.user = null;
    this.destroyCharts();
    await signOut(auth);
    // onAuthStateChanged → showAuthScreen()
  }

  showAuthScreen() {
    document.getElementById('auth-screen').classList.remove('hidden');
    document.getElementById('app-shell').classList.add('hidden');
    document.getElementById('login-email').value    = '';
    document.getElementById('login-password').value = '';
  }

  // ── Shell ──────────────────────────────────────────
  startApp(user) {
    this.user = user;
    document.getElementById('auth-screen').classList.add('hidden');
    document.getElementById('app-shell').classList.remove('hidden');
    this.renderShell();
    this.navigate('dashboard');
  }

  // Devuelve el HTML del avatar (foto si existe, sino emoji/inicial)
  _avatarInnerHTML(u) {
    if (u.photoBase64) {
      return `<img src="${u.photoBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
    }
    return u.avatar || u.name[0];
  }

  renderShell() {
    const u         = this.user;
    const isTrainer = u.role === 'trainer';

    const hdr = document.getElementById('header-avatar');
    hdr.innerHTML  = this._avatarInnerHTML(u);
    hdr.className  = `user-avatar ${u.photoBase64 ? '' : (u.color || 'avatar-purple')}`;

    const sba = document.getElementById('sidebar-avatar');
    sba.innerHTML  = this._avatarInnerHTML(u);
    sba.className  = `sidebar-avatar ${u.photoBase64 ? '' : (u.color || 'avatar-purple')}`;
    document.getElementById('sidebar-name').textContent   = u.name;
    document.getElementById('sidebar-role').textContent   = isTrainer
      ? `🏋️ Entrenador · ${u.gym || ''}`
      : `💪 Cliente · ${u.goal || ''}`;

    const navItems = this.getNavItems();
    ['sidebar-nav', 'bottom-nav'].forEach((navId, i) => {
      const isSidebar = i === 0;
      document.getElementById(navId).innerHTML = navItems.map(item => isSidebar
        ? `<div class="nav-item" data-view="${item.view}" onclick="app.navigate('${item.view}')"><span class="nav-icon">${item.icon}</span><span>${item.label}</span></div>`
        : `<div class="bnav-item" data-view="${item.view}" onclick="app.navigate('${item.view}')"><span class="bnav-icon">${item.icon}</span><span>${item.label}</span></div>`
      ).join('');
    });
  }

  getNavItems() {
    const isTrainer = this.user?.role === 'trainer';
    const base = [{ view: 'dashboard', icon: '🏠', label: 'Inicio' }];
    if (isTrainer) {
      base.push(
        { view: 'clientes',  icon: '👥', label: 'Clientes'  },
        { view: 'rutinas',   icon: '📋', label: 'Rutinas'   },
        { view: 'nutricion', icon: '🥗', label: 'Nutrición' },
        { view: 'medidas',   icon: '📏', label: 'Medidas'    },
        { view: 'progreso',  icon: '📈', label: 'Progreso'   },
        { view: 'perfil',    icon: '👤', label: 'Perfil'    },
      );
    } else {
      base.push(
        { view: 'mi-rutina', icon: '📋', label: 'Mi Rutina'  },
        { view: 'nutricion', icon: '🥗', label: 'Nutrición'  },
        { view: 'medidas',   icon: '📏', label: 'Medidas'    },
        { view: 'progreso',  icon: '📈', label: 'Progreso'   },
        { view: 'perfil',    icon: '👤', label: 'Perfil'     },
      );
    }
    return base;
  }

  setActiveNav(view) {
    document.querySelectorAll('.nav-item, .bnav-item').forEach(el =>
      el.classList.toggle('active', el.dataset.view === view));
  }

  toggleSidebar() {
    document.getElementById('sidebar').classList.toggle('open');
    document.getElementById('sidebar-overlay').classList.toggle('hidden');
  }
  closeSidebar() {
    document.getElementById('sidebar').classList.remove('open');
    document.getElementById('sidebar-overlay').classList.add('hidden');
  }

  // ── Navigation (async) ────────────────────────────
  async navigate(view, params = {}) {
    this.destroyCharts();
    this.view       = view;
    this.viewParams = params;
    this.setActiveNav(view);
    this.closeSidebar();

    const container = document.getElementById('view-container');
    container.innerHTML = '<div class="spinner"></div>';

    try {
      let html = '';
      switch (view) {
        case 'dashboard':
          html = await this.renderDashboard();
          container.innerHTML = html;
          this.setupDashboard();
          break;
        case 'clientes':
          html = await this.renderClients();
          container.innerHTML = html;
          break;
        case 'client-detail':
          html = await this.renderClientDetail(params.clientId);
          container.innerHTML = html;
          await this.setupClientDetail(params.clientId);
          break;
        case 'rutinas':
          html = await this.renderRoutines();
          container.innerHTML = html;
          break;
        case 'mi-rutina':
          html = await this.renderMiRutina();
          container.innerHTML = html;
          break;
        case 'nutricion':
          html = await this.renderNutricion();
          container.innerHTML = html;
          break;
        case 'medidas':
          html = await this.renderMedidas(params.clientId);
          container.innerHTML = html;
          break;
        case 'progreso':
          html = await this.renderProgreso(params.clientId);
          container.innerHTML = html;
          await this.setupProgreso(params.clientId);
          break;
        case 'perfil':
          html = await this.renderPerfil();
          container.innerHTML = html;
          break;
        default:
          container.innerHTML = '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Vista no encontrada</h3></div>';
      }
      container.classList.add('fade-in');
    } catch (err) {
      console.error('Navigate error:', err);
      container.innerHTML = `
        <div class="empty-state">
          <div class="empty-icon">⚠️</div>
          <h3>Error al cargar</h3>
          <p>${err.message}</p>
          <button class="btn btn-outline" style="margin-top:16px" onclick="app.navigate('${view}', ${JSON.stringify(params)})">Reintentar</button>
        </div>`;
    }
  }

  // ── Toast ──────────────────────────────────────────
  toast(msg, type = 'success') {
    const icons = { success: '✅', error: '❌', info: 'ℹ️' };
    const el    = document.createElement('div');
    el.className = `toast toast-${type}`;
    el.innerHTML = `<span>${icons[type]}</span><span>${msg}</span>`;
    document.getElementById('toast-container').appendChild(el);
    setTimeout(() => el.remove(), 3500);
  }

  // ── Modal ──────────────────────────────────────────
  openModal(title, content, wide = false) {
    document.getElementById('modal-title').textContent   = title;
    document.getElementById('modal-body').innerHTML      = content;
    document.getElementById('modal-overlay').classList.remove('hidden');
    document.getElementById('modal-box').style.maxWidth = wide ? '700px' : '';
  }
  closeModal() {
    document.getElementById('modal-overlay').classList.add('hidden');
  }
  showNotifications() {
    this.openModal('Notificaciones', '<div class="empty-state"><div class="empty-icon">🔔</div><h3>Sin notificaciones</h3></div>');
  }
  destroyCharts() {
    Object.values(this.charts).forEach(c => { try { c.destroy(); } catch {} });
    this.charts = {};
  }

  // ════════════════════════════════════════════════════
  // DASHBOARD
  // ════════════════════════════════════════════════════
  async renderDashboard() {
    return this.user.role === 'trainer'
      ? this.renderTrainerDashboard()
      : this.renderClientDashboard();
  }

  async renderTrainerDashboard() {
    const [clients, routines, meals] = await Promise.all([
      DB.getClientsByTrainer(this.user.id),
      DB.getRoutinesByTrainer(this.user.id),
      DB.getMealPlansByTrainer(this.user.id),
    ]);
    const hour     = new Date().getHours();
    const greeting = hour < 12 ? 'Buenos días' : hour < 20 ? 'Buenas tardes' : 'Buenas noches';

    return `
      <div class="welcome-card slide-up">
        <div class="welcome-title">${greeting}, ${this.user.name.split(' ')[0]} 👋</div>
        <div class="welcome-subtitle">${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
        <div class="welcome-cta"><button class="btn btn-primary btn-sm" onclick="app.navigate('clientes')">Ver mis clientes</button></div>
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">👥</div><div class="stat-info"><strong>${clients.length}</strong><span>Clientes</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">📋</div><div class="stat-info"><strong>${routines.length}</strong><span>Rutinas</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(255,230,109,0.15)">🥗</div><div class="stat-info"><strong>${meals.length}</strong><span>Planes nutri.</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(255,107,107,0.15)">🔥</div><div class="stat-info"><strong>${clients.length > 0 ? 'Activo' : '-'}</strong><span>Estado</span></div></div>
      </div>
      <div class="section-header"><span class="section-title">Clientes Recientes</span><button class="btn btn-ghost btn-sm" onclick="app.navigate('clientes')">Ver todos →</button></div>
      <div class="clients-grid">${clients.length
        ? clients.slice(0,3).map(c => this.clientCardHTML(c, 0, 0)).join('')
        : '<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin clientes aún</h3></div>'}</div>
      <div class="section-header" style="margin-top:24px"><span class="section-title">Acciones Rápidas</span></div>
      <div class="stats-grid">
        <div class="stat-card" style="cursor:pointer" onclick="app.openAddClientModal()"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">➕</div><div class="stat-info"><strong style="font-size:1rem">Nuevo</strong><span>Cliente</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.openAddRoutineModal()"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">🏋️</div><div class="stat-info"><strong style="font-size:1rem">Nueva</strong><span>Rutina</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.openAddMealPlanModal()"><div class="stat-icon" style="background:rgba(255,154,60,0.15)">🥗</div><div class="stat-info"><strong style="font-size:1rem">Nuevo</strong><span>Plan nutri.</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.navigate('perfil')"><div class="stat-icon" style="background:rgba(255,110,180,0.15)">👤</div><div class="stat-info"><strong style="font-size:1rem">Mi</strong><span>Perfil</span></div></div>
      </div>`;
  }

  async renderClientDashboard() {
    const [routines, meals, measures] = await Promise.all([
      DB.getRoutinesByClient(this.user.id),
      DB.getMealPlansByClient(this.user.id),
      DB.getMeasurementsByClient(this.user.id),
    ]);
    const trainer   = this.user.trainerId ? await DB.getUser(this.user.trainerId) : null;
    const latest    = measures[0];
    const todayKey  = DAYS_OF_WEEK[new Date().getDay() === 0 ? 6 : new Date().getDay() - 1].key;
    const todayR    = routines.filter(r => r.daysOfWeek?.includes(todayKey));

    return `
      <div class="welcome-card slide-up">
        <div class="welcome-title">¡Hola, ${this.user.name.split(' ')[0]}! 💪</div>
        <div class="welcome-subtitle">${new Date().toLocaleDateString('es-ES',{weekday:'long',day:'numeric',month:'long'})}</div>
        ${trainer ? `<div class="welcome-subtitle" style="margin-top:6px">👨‍💼 Entrenador: ${trainer.name}</div>` : ''}
      </div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">📋</div><div class="stat-info"><strong>${routines.length}</strong><span>Rutinas asig.</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(255,154,60,0.15)">🥗</div><div class="stat-info"><strong>${meals.length}</strong><span>Planes nutri.</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">⚖️</div><div class="stat-info"><strong>${latest ? latest.weight+'kg' : '-'}</strong><span>Último peso</span></div></div>
        <div class="stat-card"><div class="stat-icon" style="background:rgba(255,107,107,0.15)">📏</div><div class="stat-info"><strong>${measures.length}</strong><span>Mediciones</span></div></div>
      </div>
      ${todayR.length ? `
        <div class="section-header"><span class="section-title">🔥 Entrenamiento de Hoy</span></div>
        ${todayR.map(r => `
          <div class="today-card">
            <div class="today-card-header"><strong>📋 ${r.name}</strong><span class="badge badge-green">${r.exercises.length} ejercicios</span></div>
            <div class="today-card-body">
              ${r.exercises.slice(0,3).map(ex => {
                const m = getMuscleInfo(ex.muscleGroup);
                return `<div class="exercise-item" style="padding:10px 0;border-bottom:1px solid var(--border)">
                  <div class="exercise-thumb" style="background:${m.color}">${m.icon}</div>
                  <div class="exercise-info"><div class="exercise-name">${ex.name}</div><div class="exercise-details">${ex.sets} series × ${ex.reps} · ${ex.weight}</div></div>
                </div>`;
              }).join('')}
              ${r.exercises.length > 3 ? `<div style="text-align:center;padding:10px 0;color:var(--text2);font-size:.85rem">+${r.exercises.length-3} ejercicios más</div>` : ''}
              <button class="btn btn-primary btn-full" style="margin-top:12px" onclick="app.navigate('mi-rutina')">Ver rutina completa →</button>
            </div>
          </div>`).join('')}
      ` : `<div class="today-card"><div class="today-card-header"><strong>📅 Hoy es día de descanso</strong></div><div class="today-card-body" style="text-align:center;padding:20px"><div style="font-size:2.5rem;margin-bottom:8px">😴</div><p style="color:var(--text2)">Recupera y prepárate para mañana</p></div></div>`}
      <div class="section-header" style="margin-top:20px"><span class="section-title">Acciones Rápidas</span></div>
      <div class="stats-grid">
        <div class="stat-card" style="cursor:pointer" onclick="app.navigate('mi-rutina')"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">🏋️</div><div class="stat-info"><strong style="font-size:.95rem">Mi</strong><span>Rutina</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.navigate('nutricion')"><div class="stat-icon" style="background:rgba(255,154,60,0.15)">🥗</div><div class="stat-info"><strong style="font-size:.95rem">Mi</strong><span>Nutrición</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.openAddMeasurementModal('${this.user.id}')"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">📏</div><div class="stat-info"><strong style="font-size:.95rem">Registrar</strong><span>Medidas</span></div></div>
        <div class="stat-card" style="cursor:pointer" onclick="app.navigate('progreso')"><div class="stat-icon" style="background:rgba(255,110,180,0.15)">📈</div><div class="stat-info"><strong style="font-size:.95rem">Mi</strong><span>Progreso</span></div></div>
      </div>`;
  }

  setupDashboard() {}

  // ════════════════════════════════════════════════════
  // CLIENTS
  // ════════════════════════════════════════════════════
  clientCardHTML(c, routineCount = 0, lastMeasureWeight = null, targetView = 'client-detail') {
    return `
      <div class="client-card" onclick="app.navigate('${targetView}',{clientId:'${c.id}'})">
        <div class="client-avatar ${c.color||'avatar-purple'}">${c.avatar||c.name[0]}</div>
        <div class="client-info">
          <div class="client-name">${c.name}</div>
          <div class="client-meta">🎯 ${c.goal||'Sin objetivo'}</div>
          ${targetView === 'client-detail' ? `<div class="client-meta">📋 ${routineCount} rutinas · ⚖️ ${lastMeasureWeight ? lastMeasureWeight+'kg' : 'Sin medidas'}</div>` : ''}
        </div>
        ${targetView === 'client-detail' ? `
        <div class="client-actions" onclick="event.stopPropagation()">
          <button class="btn btn-outline btn-sm" onclick="app.openEditClientModal('${c.id}')">✏️</button>
        </div>` : ''}
      </div>`;
  }

  async renderClients() {
    const clients = await DB.getClientsByTrainer(this.user.id);
    // Fetch routine counts + last measure for each client in parallel
    const extras = await Promise.all(clients.map(async c => {
      const [routines, measures] = await Promise.all([
        DB.getRoutinesByClient(c.id),
        DB.getMeasurementsByClient(c.id),
      ]);
      return { routineCount: routines.length, lastWeight: measures[0]?.weight ?? null };
    }));

    return `
      <div class="view-header">
        <div class="view-title">Mis Clientes <small>${clients.length} registrados</small></div>
        <button class="btn btn-primary btn-sm" onclick="app.openAddClientModal()">+ Añadir</button>
      </div>
      <div class="search-bar"><input type="text" id="client-search" placeholder="Buscar cliente…" oninput="app.filterClients(this.value)"/></div>
      <div class="clients-grid" id="clients-list">
        ${clients.length
          ? clients.map((c,i) => this.clientCardHTML(c, extras[i].routineCount, extras[i].lastWeight)).join('')
          : '<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin clientes aún</h3><button class="btn btn-primary" style="margin-top:16px" onclick="app.openAddClientModal()">+ Añadir cliente</button></div>'}
      </div>`;
  }

  async filterClients(q) {
    const clients = await DB.getClientsByTrainer(this.user.id);
    const filtered = clients.filter(c =>
      c.name.toLowerCase().includes(q.toLowerCase()) ||
      (c.goal||'').toLowerCase().includes(q.toLowerCase())
    );
    document.getElementById('clients-list').innerHTML = filtered.length
      ? filtered.map(c => this.clientCardHTML(c)).join('')
      : '<div class="empty-state"><div class="empty-icon">🔍</div><h3>Sin resultados</h3></div>';
  }

  // Client Detail
  async renderClientDetail(clientId) {
    const [client, routines, meals, measures] = await Promise.all([
      DB.getUser(clientId),
      DB.getRoutinesByClient(clientId),
      DB.getMealPlansByClient(clientId),
      DB.getMeasurementsByClient(clientId),
    ]);
    if (!client) return '<div class="empty-state"><div class="empty-icon">❌</div><h3>Cliente no encontrado</h3></div>';

    const latest = measures[0];
    const prev   = measures[1];
    const imc    = latest ? calcIMC(latest.weight, latest.height) : null;
    const imcCat = imc    ? imcCategory(parseFloat(imc))          : null;

    return `
      <div class="view-header">
        <button class="btn btn-ghost btn-sm" onclick="app.navigate('clientes')">← Volver</button>
        <div class="client-actions">
          <button class="btn btn-outline btn-sm" onclick="app.openEditClientModal('${clientId}')">✏️ Editar</button>
          <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteClient('${clientId}')">🗑</button>
        </div>
      </div>
      <div class="profile-hero" style="margin-bottom:20px">
        <div class="profile-big-avatar ${client.color||'avatar-purple'}">${client.avatar||client.name[0]}</div>
        <div class="profile-name">${client.name}</div>
        <div class="profile-email">${client.email}</div>
        <div class="profile-badges">
          <span class="badge badge-primary">📅 Desde ${formatDate(client.joinDate)}</span>
          ${client.level ? `<span class="badge badge-green">⚡ ${client.level}</span>` : ''}
          ${client.age   ? `<span class="badge badge-yellow">🎂 ${client.age} años</span>` : ''}
        </div>
        ${client.goal ? `<p style="color:var(--text2);margin-top:12px;font-size:.88rem">🎯 ${client.goal}</p>` : ''}
      </div>

      ${latest ? `
        <div class="stats-grid" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">⚖️</div><div class="stat-info"><strong>${latest.weight}kg</strong><span>Peso actual</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">📐</div><div class="stat-info"><strong>${imc}</strong><span>IMC · ${imcCat?.label}</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(255,107,107,0.15)">🔥</div><div class="stat-info"><strong>${latest.bodyFat}%</strong><span>% Grasa</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(255,154,60,0.15)">📏</div><div class="stat-info"><strong>${measures.length}</strong><span>Mediciones</span></div></div>
        </div>` : ''}

      <div class="section-header"><span class="section-title">📋 Rutinas (${routines.length})</span><button class="btn btn-primary btn-sm" onclick="app.openAddRoutineModal('${clientId}')">+ Nueva</button></div>
      ${routines.length ? routines.map(r => this.routineCardHTML(r, null)).join('') : '<div class="card card-sm" style="text-align:center;color:var(--text2)">Sin rutinas asignadas</div>'}

      <div class="section-header" style="margin-top:20px"><span class="section-title">🥗 Planes Nutricionales (${meals.length})</span><button class="btn btn-primary btn-sm" onclick="app.openAddMealPlanModal('${clientId}')">+ Nuevo</button></div>
      ${meals.length ? meals.map(m => this.mealPlanCardHTML(m, null)).join('') : '<div class="card card-sm" style="text-align:center;color:var(--text2)">Sin planes nutricionales</div>'}

      <div class="section-header" style="margin-top:20px"><span class="section-title">📏 Medidas</span><button class="btn btn-primary btn-sm" onclick="app.openAddMeasurementModal('${clientId}')">+ Registrar</button></div>
      ${this.measureCardsHTML(latest, prev)}

      <div class="section-header" style="margin-top:20px"><span class="section-title">📈 Progreso</span><button class="btn btn-outline btn-sm" onclick="app.navigate('progreso',{clientId:'${clientId}'})">Ver completo →</button></div>
      <div class="chart-card"><div class="chart-title">Evolución del Peso</div><div class="chart-wrap"><canvas id="chart-weight-mini"></canvas></div></div>`;
  }

  async setupClientDetail(clientId) {
    const measures = (await DB.getMeasurementsByClient(clientId)).reverse();
    if (measures.length >= 2) this.renderWeightChart('chart-weight-mini', measures);
  }

  measureCardsHTML(latest, prev) {
    if (!latest) return '<div class="card card-sm" style="text-align:center;color:var(--text2)">Sin medidas registradas</div>';
    const fields = [
      { key:'weight',   label:'Peso',    unit:'kg', icon:'⚖️', lower:true  },
      { key:'bodyFat',  label:'% Grasa', unit:'%',  icon:'🔥', lower:true  },
      { key:'chest',    label:'Pecho',   unit:'cm', icon:'💪'             },
      { key:'waist',    label:'Cintura', unit:'cm', icon:'📏', lower:true  },
      { key:'hips',     label:'Cadera',  unit:'cm', icon:'🦵'             },
      { key:'shoulders',label:'Hombros', unit:'cm', icon:'🏋️'            },
    ];
    return `<div class="measure-grid">${fields.map(f => {
      if (!latest[f.key]) return '';
      const diff = prev ? (latest[f.key] - prev[f.key]).toFixed(1) : null;
      let cls = 'change-same', arrow = '–';
      if (diff !== null && diff != 0) {
        const good = f.lower ? diff < 0 : diff > 0;
        cls   = good ? 'change-down' : 'change-up';
        arrow = diff > 0 ? `+${diff}` : diff;
      }
      return `<div class="measure-item"><span class="measure-icon">${f.icon}</span><div class="measure-data"><strong>${latest[f.key]}${f.unit}</strong><span>${f.label}</span></div>${diff!==null?`<span class="measure-change ${cls}">${arrow}</span>`:''}</div>`;
    }).join('')}</div>`;
  }

  // ── Client Modals ──────────────────────────────────
  async openAddClientModal(clientId = null) {
    const client = clientId ? await DB.getUser(clientId) : null;
    const title  = client ? 'Editar Cliente' : 'Nuevo Cliente';
    const html   = `
      <form id="client-form">
        <div class="form-row">
          <div class="form-group"><label>Nombre completo *</label><input type="text" name="name" value="${client?.name||''}" required/></div>
          <div class="form-group"><label>Email *</label><input type="email" name="email" value="${client?.email||''}" ${client?'readonly':''} required/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Teléfono</label><input type="tel" name="phone" value="${client?.phone||''}"/></div>
          <div class="form-group"><label>Edad</label><input type="number" name="age" min="10" max="100" value="${client?.age||''}"/></div>
        </div>
        ${!client ? `<div class="form-group"><label>Contraseña *</label><input type="password" name="password" minlength="6" required/></div>` : ''}
        <div class="form-row">
          <div class="form-group"><label>Nivel</label>
            <select name="level">
              <option value="">Seleccionar…</option>
              ${['Principiante','Intermedio','Avanzado'].map(l=>`<option value="${l}" ${client?.level===l?'selected':''}>${l}</option>`).join('')}
            </select>
          </div>
          <div class="form-group"><label>Objetivo</label><input type="text" name="goal" value="${client?.goal||''}" placeholder="Ej: Ganar masa muscular…"/></div>
        </div>
        <div class="form-group"><label>Notas</label><textarea name="notes">${client?.notes||''}</textarea></div>
        <p id="client-form-err" class="form-error hidden"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Guardar</button>
        </div>
      </form>`;
    this.openModal(title, html, true);

    document.getElementById('client-form').onsubmit = async e => {
      e.preventDefault();
      const btn  = e.target.querySelector('[type=submit]');
      const errEl = document.getElementById('client-form-err');
      btn.disabled = true; btn.textContent = 'Guardando…';
      errEl.classList.add('hidden');
      try {
        const fd   = new FormData(e.target);
        const data = Object.fromEntries(fd.entries());
        if (client) {
          await DB.saveUser({ ...client, name: data.name, phone: data.phone, age: parseInt(data.age)||null, level: data.level, goal: data.goal, notes: data.notes });
          this.toast('Cliente actualizado');
        } else {
          // Create Firebase Auth account using secondary auth
          const cred = await createUserWithEmailAndPassword(secondaryAuth, data.email, data.password);
          const newUid = cred.user.uid;
          await signOut(secondaryAuth); // immediately sign out of secondary
          await DB.saveUser({
            id: newUid, role: 'client', trainerId: this.user.id,
            name: data.name, email: data.email, phone: data.phone,
            age: parseInt(data.age)||null, level: data.level, goal: data.goal, notes: data.notes,
            avatar: ['💪','🏃','🧘','🏋️','⚡','🔥'][Math.floor(Math.random()*6)],
            color: randomColor(), joinDate: todayStr(), active: true,
          });
          this.toast('Cliente creado correctamente');
        }
        this.closeModal();
        this.navigate('clientes');
      } catch (err) {
        const msgs = { 'auth/email-already-in-use': 'Ese email ya está registrado.', 'auth/weak-password': 'La contraseña debe tener al menos 6 caracteres.' };
        errEl.textContent = msgs[err.code] || err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = '💾 Guardar';
      }
    };
  }

  openEditClientModal(clientId) { this.openAddClientModal(clientId); }

  async confirmDeleteClient(clientId) {
    const client = await DB.getUser(clientId);
    this.openModal('Eliminar Cliente', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>¿Eliminar a <strong>${client?.name}</strong>?</p>
        <p style="color:var(--text2);font-size:.85rem;margin-top:8px">Se eliminarán sus rutinas y planes de Firestore.</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button class="btn btn-danger" onclick="app.deleteClient('${clientId}')">Eliminar</button>
        </div>
      </div>`);
  }

  async deleteClient(clientId) {
    const [routines, meals] = await Promise.all([
      DB.getRoutinesByClient(clientId),
      DB.getMealPlansByClient(clientId),
    ]);
    await Promise.all([
      DB.deleteUser(clientId),
      ...routines.map(r => DB.deleteRoutine(r.id)),
      ...meals.map(m => DB.deleteMealPlan(m.id)),
    ]);
    this.closeModal();
    this.toast('Cliente eliminado', 'info');
    this.navigate('clientes');
  }

  // ════════════════════════════════════════════════════
  // ROUTINES
  // ════════════════════════════════════════════════════
  routineCardHTML(routine, client) {
    const totalSets = routine.exercises.reduce((s, e) => s + (parseInt(e.sets)||0), 0);
    return `
      <div class="routine-card">
        <div class="routine-header">
          <div>
            <div class="routine-title">📋 ${routine.name}</div>
            ${client ? `<div class="routine-meta">👤 ${client.name}</div>` : ''}
            <div class="routine-meta">${routine.exercises.length} ejercicios · ${totalSets} series totales</div>
          </div>
          <div class="routine-actions">
            <button class="btn btn-outline btn-sm" onclick="app.openRoutineDetailModal('${routine.id}')">Ver</button>
            ${app.user?.role === 'trainer' ? `
            <button class="btn btn-outline btn-sm" onclick="app.openAddRoutineModal('${routine.clientId}','${routine.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteRoutine('${routine.id}','${routine.clientId}')">🗑</button>
            ` : ''}
          </div>
        </div>
        <div class="routine-days">${(routine.daysOfWeek||[]).map(d=>`<span class="day-tag">${dayLabel(d)}</span>`).join('')}</div>
        <div class="exercise-list">
          ${routine.exercises.slice(0,4).map((ex,i)=>{
            const m = getMuscleInfo(ex.muscleGroup);
            return `<div class="exercise-item"><span class="exercise-order">${i+1}</span>
              <div class="exercise-thumb" style="background:${m.color}">${m.icon}</div>
              <div class="exercise-info"><div class="exercise-name">${ex.name}</div>
              <div class="exercise-stats"><span class="exercise-stat">${ex.sets} series</span><span class="exercise-stat">${ex.reps} reps</span>${ex.weight?`<span class="exercise-stat">⚖️ ${ex.weight}</span>`:''}</div></div></div>`;
          }).join('')}
          ${routine.exercises.length>4?`<div style="padding:10px 18px;color:var(--text2);font-size:.82rem">+${routine.exercises.length-4} ejercicios más…</div>`:''}
        </div>
      </div>`;
  }

  async renderRoutines() {
    const isTrainer = this.user.role === 'trainer';
    const routines  = isTrainer
      ? await DB.getRoutinesByTrainer(this.user.id)
      : await DB.getRoutinesByClient(this.user.id);

    let clientMap = {};
    if (isTrainer) {
      const clients = await DB.getClientsByTrainer(this.user.id);
      clients.forEach(c => clientMap[c.id] = c);
    }

    return `
      <div class="view-header">
        <div class="view-title">Rutinas <small>${routines.length} total</small></div>
        ${isTrainer ? `<button class="btn btn-primary btn-sm" onclick="app.openAddRoutineModal()">+ Nueva</button>` : ''}
      </div>
      ${routines.length
        ? routines.map(r => this.routineCardHTML(r, clientMap[r.clientId]||null)).join('')
        : `<div class="empty-state"><div class="empty-icon">📋</div><h3>Sin rutinas aún</h3>
           ${isTrainer?`<button class="btn btn-primary" style="margin-top:16px" onclick="app.openAddRoutineModal()">+ Crear rutina</button>`:''}</div>`}`;
  }

  async renderMiRutina() {
    const routines = await DB.getRoutinesByClient(this.user.id);
    return `
      <div class="view-header"><div class="view-title">Mis Rutinas</div></div>
      ${routines.length
        ? routines.map(r => this.routineCardHTML(r, null)).join('')
        : '<div class="empty-state"><div class="empty-icon">📋</div><h3>Sin rutinas asignadas</h3><p>Tu entrenador aún no te ha asignado ninguna rutina</p></div>'}`;
  }

  openRoutineDetailModal(routineId) {
    // Fetch and show in modal
    (async () => {
      const routines = await DB.getRoutinesByTrainer(this.user.id)
        .catch(() => DB.getRoutinesByClient(this.user.id));
      // Find in all routines regardless of trainer/client
      const getAll = async () => {
        try {
          if (this.user.role === 'trainer') return await DB.getRoutinesByTrainer(this.user.id);
          return await DB.getRoutinesByClient(this.user.id);
        } catch { return []; }
      };
      const all = await getAll();
      const r   = all.find(x => x.id === routineId);
      if (!r) return;
      const html = `
        ${r.notes ? `<div class="card card-sm" style="margin-bottom:16px;color:var(--text2);font-size:.88rem">📝 ${r.notes}</div>` : ''}
        <div class="exercise-list" style="background:var(--card);border-radius:var(--radius);overflow:hidden">
          ${r.exercises.map((ex,i) => {
            const m = getMuscleInfo(ex.muscleGroup);
            return `<div class="exercise-item" style="border-bottom:1px solid var(--border)">
              <span class="exercise-order">${i+1}</span>
              <div class="exercise-thumb" style="background:${m.color};width:60px;height:60px;font-size:1.8rem">${m.icon}</div>
              <div class="exercise-info">
                <div class="exercise-name" style="font-size:1rem">${ex.name}</div>
                <div class="exercise-details">${m.label}${ex.rest ? ` · ⏱ ${ex.rest}s descanso` : ''}</div>
                ${ex.setsData ? `
                  <div style="margin-top:8px;border:1px solid var(--border);border-radius:8px;overflow:hidden">
                    <div style="display:grid;grid-template-columns:40px 1fr 1fr;background:var(--bg2);padding:5px 8px;font-size:.7rem;color:var(--text3);text-transform:uppercase;letter-spacing:.4px">
                      <span>Serie</span><span>Reps</span><span>Peso</span>
                    </div>
                    ${ex.setsData.map((s,si) => `
                      <div style="display:grid;grid-template-columns:40px 1fr 1fr;padding:6px 8px;font-size:.85rem;border-top:1px solid rgba(255,255,255,0.04)">
                        <span style="color:var(--primary);font-weight:700">${si+1}</span>
                        <span>${s.reps || '–'}</span>
                        <span style="font-weight:600">${s.weight || '–'}</span>
                      </div>`).join('')}
                  </div>
                ` : `
                  <div class="exercise-stats">
                    <span class="exercise-stat">${ex.sets} series</span>
                    <span class="exercise-stat">${ex.reps} reps</span>
                    ${ex.weight ? `<span class="exercise-stat">⚖️ ${ex.weight}</span>` : ''}
                  </div>`}
                ${ex.notes ? `<div style="color:var(--text2);font-size:.78rem;margin-top:6px">💡 ${ex.notes}</div>` : ''}
              </div></div>`;
          }).join('')}
        </div>`;
      this.openModal(`📋 ${r.name}`, html, true);
    })();
  }

  async openAddRoutineModal(preClientId = null, editRoutineId = null, isReopen = false) {
    const clients = await DB.getClientsByTrainer(this.user.id);
    let editing   = null;
    if (editRoutineId) {
      const all = await DB.getRoutinesByTrainer(this.user.id);
      editing   = all.find(r => r.id === editRoutineId) || null;
    }
    // Si es un re-open desde el selector de ejercicios, NO resetear la lista
    if (!isReopen) {
      this._builderExercises = editing ? [...editing.exercises] : [];
    }

    const renderExList = () => this._builderExercises.map((ex,i) => {
      const m = getMuscleInfo(ex.muscleGroup);
      return `<div class="added-ex-item"><div class="exercise-thumb" style="background:${m.color};width:40px;height:40px;font-size:1.2rem;border-radius:8px">${m.icon}</div>
        <div class="added-ex-info">
          <div class="added-ex-name">${ex.name}</div>
          <div class="added-ex-params">${ex.sets} series · ${
            ex.setsData
              ? ex.setsData.map((s,i) => `<span style="color:var(--primary)">${i+1}:</span> ${s.reps||'?'} @ ${s.weight||'–'}`).join('  ')
              : `${ex.reps} · ${ex.weight||'–'}`
          }</div>
        </div>
        <button class="btn btn-danger btn-sm" onclick="app._removeExFromBuilder(${i})">✕</button></div>`;
    }).join('');

    const html = `
      <form id="routine-form">
        <div class="form-row">
          <div class="form-group"><label>Nombre *</label><input type="text" name="name" value="${editing?.name||''}" placeholder="Ej: Rutina A - Pecho" required/></div>
          <div class="form-group"><label>Cliente *</label>
            <select name="clientId" required>
              <option value="">Seleccionar…</option>
              ${clients.map(c=>`<option value="${c.id}" ${(preClientId||editing?.clientId)===c.id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-group"><label>Días de entrenamiento</label>
          <div style="display:flex;flex-wrap:wrap;gap:8px;margin-top:4px">
            ${DAYS_OF_WEEK.map(d=>`<label style="display:flex;align-items:center;gap:5px;cursor:pointer"><input type="checkbox" name="days" value="${d.key}" ${editing?.daysOfWeek?.includes(d.key)?'checked':''}/> ${d.label}</label>`).join('')}
          </div>
        </div>
        <div class="form-group"><label>Notas</label><textarea name="notes">${editing?.notes||''}</textarea></div>
        <div class="form-section-title">Ejercicios</div>
        <div id="ex-builder-list" class="added-exercises">${renderExList()}</div>
        <button type="button" class="btn btn-outline btn-sm" style="margin-top:10px;width:100%" onclick="app.openExercisePickerModal()">+ Añadir ejercicio</button>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Guardar rutina</button>
        </div>
      </form>`;

    // Guardar params del builder para reabrirlo desde el selector de ejercicios
    this._builderParams = { preClientId, editRoutineId };

    this.openModal(editing ? 'Editar Rutina' : 'Nueva Rutina', html, true);
    this._updateBuilderList = () => {
      const el = document.getElementById('ex-builder-list');
      if (el) el.innerHTML = renderExList();
    };

    document.getElementById('routine-form').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Guardando…';
      const fd       = new FormData(e.target);
      const clientId = fd.get('clientId');
      if (!clientId) { this.toast('Selecciona un cliente', 'error'); btn.disabled=false; btn.textContent='💾 Guardar rutina'; return; }
      try {
        await DB.saveRoutine({
          id: editing?.id || null,
          name: fd.get('name'), clientId, trainerId: this.user.id,
          daysOfWeek: fd.getAll('days'),
          exercises: this._builderExercises,
          notes: fd.get('notes'),
        });
        this.toast(editing ? 'Rutina actualizada' : 'Rutina creada');
        this.closeModal();
        this.view === 'client-detail' ? this.navigate('client-detail', {clientId}) : this.navigate('rutinas');
      } catch(err) { this.toast(err.message, 'error'); btn.disabled=false; btn.textContent='💾 Guardar rutina'; }
    };
  }

  _removeExFromBuilder(idx) {
    this._builderExercises.splice(idx, 1);
    this._updateBuilderList?.();
  }

  // Guarda los valores actuales del form del builder antes de reemplazar el modal
  _saveBuilderFormState() {
    const form = document.getElementById('routine-form');
    if (!form) return;
    const fd = new FormData(form);
    this._builderFormData = {
      name:     fd.get('name')    || '',
      clientId: fd.get('clientId') || '',
      days:     fd.getAll('days'),
      notes:    fd.get('notes')   || '',
    };
  }

  // Restaura los valores guardados en el form del builder (con pequeño timeout para esperar el DOM)
  _restoreBuilderFormState() {
    const data = this._builderFormData;
    if (!data) return;
    setTimeout(() => {
      const f = document.getElementById('routine-form');
      if (!f) return;
      const n = f.querySelector('[name=name]');     if (n) n.value = data.name;
      const c = f.querySelector('[name=clientId]'); if (c) c.value = data.clientId;
      const t = f.querySelector('[name=notes]');    if (t) t.value = data.notes;
      data.days.forEach(day => {
        const cb = f.querySelector(`[name=days][value="${day}"]`);
        if (cb) cb.checked = true;
      });
    }, 30);
  }

  async openExercisePickerModal() {
    this._saveBuilderFormState(); // guardar estado antes de reemplazar el modal

    // Cargar ejercicios personalizados del entrenador
    const customExs = this.user.role === 'trainer'
      ? await DB.getCustomExercisesByTrainer(this.user.id)
      : [];

    let selectedGroup = customExs.length ? '__custom__' : 'pecho';

    const renderLib = g => EXERCISE_LIBRARY[g].exercises.map(ex => `
      <div class="ex-lib-item" onclick="app.openExerciseConfigModal('${g}','${ex.id}')">
        <div class="ex-lib-icon">${EXERCISE_LIBRARY[g].icon}</div>
        <div class="ex-lib-name">${ex.name}</div>
        <div class="ex-lib-muscle">${EXERCISE_LIBRARY[g].label}</div>
      </div>`).join('');

    const renderCustom = () => {
      if (!customExs.length) {
        return `<div class="empty-state" style="padding:32px 16px">
          <div class="empty-icon">✏️</div>
          <h3 style="font-size:1rem">Sin ejercicios personalizados</h3>
          <p style="font-size:.85rem">Crea tu primer ejercicio con el botón de arriba</p>
        </div>`;
      }
      return customExs.map(ex => {
        const g = EXERCISE_LIBRARY[ex.muscleGroup] || { icon: ex.icon || '🏋️', label: ex.muscleGroup, color: 'var(--primary)' };
        return `
        <div class="ex-lib-item ex-lib-item--custom" onclick="app.openExerciseConfigModal('__custom__', '${ex.id}', ${JSON.stringify(ex).replace(/"/g,'&quot;')})">
          <div class="ex-lib-icon">${ex.icon || g.icon}</div>
          <div style="flex:1;min-width:0">
            <div class="ex-lib-name">${ex.name}</div>
            <div class="ex-lib-muscle">${g.label}</div>
          </div>
          <div class="ex-lib-custom-actions" onclick="event.stopPropagation()">
            <button class="btn btn-ghost btn-sm" title="Editar" onclick="app.openCreateCustomExerciseModal('${ex.id}')">✏️</button>
            <button class="btn btn-ghost btn-sm" title="Eliminar" onclick="app._confirmDeleteCustomExercise('${ex.id}','${ex.name.replace(/'/g,"\\'")}')">🗑️</button>
          </div>
        </div>`;
      }).join('');
    };

    const renderGroup = g => g === '__custom__' ? renderCustom() : renderLib(g);

    this.openModal('Seleccionar Ejercicio', `
      <div style="display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:4px">
        <div class="muscle-filter" id="muscle-filter" style="flex:1">
          <button class="muscle-btn ${selectedGroup==='__custom__'?'active':''}" data-group="__custom__" onclick="app._switchMuscleGroup('__custom__')">✏️ Mis ejercicios</button>
          ${Object.entries(EXERCISE_LIBRARY).map(([k,g])=>`<button class="muscle-btn ${k===selectedGroup?'active':''}" data-group="${k}" onclick="app._switchMuscleGroup('${k}')">${g.icon} ${g.label}</button>`).join('')}
        </div>
      </div>
      <button class="btn btn-outline btn-sm btn-full" style="margin-bottom:10px" onclick="app.openCreateCustomExerciseModal()">✨ Crear ejercicio personalizado</button>
      <div class="exercise-library" id="ex-library">${renderGroup(selectedGroup)}</div>`, true);

    this._switchMuscleGroup = group => {
      document.querySelectorAll('.muscle-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
      document.getElementById('ex-library').innerHTML = renderGroup(group);
    };
  }

  // Abre el modal para crear o editar un ejercicio personalizado
  async openCreateCustomExerciseModal(editId = null) {
    let editing = null;
    if (editId) {
      const all = await DB.getCustomExercisesByTrainer(this.user.id);
      editing = all.find(e => e.id === editId) || null;
    }

    const muscleOptions = Object.entries(EXERCISE_LIBRARY)
      .map(([k,g]) => `<option value="${k}" ${editing?.muscleGroup===k?'selected':''}>${g.icon} ${g.label}</option>`)
      .join('');

    const html = `
      <form id="custom-ex-form">
        <div class="form-group">
          <label>Nombre del ejercicio *</label>
          <input type="text" name="name" value="${editing?.name||''}" placeholder="Ej: Curl predicador inverso" required/>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Grupo muscular *</label>
            <select name="muscleGroup" required>
              <option value="">Seleccionar…</option>
              ${muscleOptions}
            </select>
          </div>
          <div class="form-group">
            <label>Icono (emoji)</label>
            <input type="text" name="icon" value="${editing?.icon||''}" placeholder="Ej: 💪" maxlength="4" style="font-size:1.4rem;text-align:center"/>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Series por defecto</label>
            <input type="number" name="sets" value="${editing?.sets||3}" min="1" max="20"/>
          </div>
          <div class="form-group">
            <label>Reps por defecto</label>
            <input type="text" name="reps" value="${editing?.reps||'10-12'}" placeholder="Ej: 8-12"/>
          </div>
          <div class="form-group">
            <label>Descanso (seg)</label>
            <input type="number" name="rest" value="${editing?.rest||60}" min="0"/>
          </div>
        </div>
        <div class="form-group">
          <label>Descripción / Instrucciones</label>
          <textarea name="description" placeholder="Notas técnicas, equipamiento necesario…">${editing?.description||''}</textarea>
        </div>
        <p id="custom-ex-err" class="form-error hidden"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.openExercisePickerModal()">← Volver</button>
          <button type="submit" class="btn btn-primary">💾 ${editing ? 'Actualizar' : 'Crear ejercicio'}</button>
        </div>
      </form>`;

    this.openModal(editing ? 'Editar Ejercicio' : 'Nuevo Ejercicio Personalizado', html, true);

    document.getElementById('custom-ex-form').onsubmit = async e => {
      e.preventDefault();
      const btn   = e.target.querySelector('[type=submit]');
      const errEl = document.getElementById('custom-ex-err');
      btn.disabled = true; btn.textContent = 'Guardando…';
      errEl.classList.add('hidden');
      try {
        const fd = new FormData(e.target);
        await DB.saveCustomExercise({
          id:          editing?.id || null,
          trainerId:   this.user.id,
          name:        fd.get('name').trim(),
          muscleGroup: fd.get('muscleGroup'),
          icon:        fd.get('icon').trim() || null,
          sets:        parseInt(fd.get('sets')) || 3,
          reps:        fd.get('reps') || '10-12',
          rest:        parseInt(fd.get('rest')) || 60,
          description: fd.get('description').trim(),
        });
        this.toast(editing ? '✅ Ejercicio actualizado' : '✅ Ejercicio creado');
        await this.openExercisePickerModal();
        this._switchMuscleGroup('__custom__');
      } catch(err) {
        errEl.textContent = err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false;
        btn.textContent = editing ? 'Actualizar' : 'Crear ejercicio';
      }
    };
  }

  _confirmDeleteCustomExercise(id, name) {
    this.openModal('Eliminar Ejercicio', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>¿Eliminar <strong>${name}</strong>?</p>
        <p style="color:var(--text2);font-size:.85rem;margin-top:8px">Se eliminará de tu biblioteca. Las rutinas que ya lo usen no se verán afectadas.</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.openExercisePickerModal();app._switchMuscleGroup('__custom__')">Cancelar</button>
          <button class="btn btn-danger" onclick="app._deleteCustomExercise('${id}')">Eliminar</button>
        </div>
      </div>`);
  }

  async _deleteCustomExercise(id) {
    await DB.deleteCustomExercise(id);
    this.toast('Ejercicio eliminado', 'info');
    await this.openExercisePickerModal();
    this._switchMuscleGroup('__custom__');
  }

  async openExerciseConfigModal(muscleGroup, exerciseId, customExObj = null) {
    // Soporte para ejercicios personalizados (pasan el objeto completo)
    let ex, g;
    if (muscleGroup === '__custom__' && customExObj) {
      ex = typeof customExObj === 'string' ? JSON.parse(customExObj.replace(/&quot;/g, '"')) : customExObj;
      const libGroup = EXERCISE_LIBRARY[ex.muscleGroup];
      g = {
        icon:  ex.icon || libGroup?.icon || '🏋️',
        label: libGroup?.label || ex.muscleGroup,
        color: libGroup?.color || 'var(--primary)',
      };
    } else {
      g  = EXERCISE_LIBRARY[muscleGroup];
      ex = g.exercises.find(e => e.id === exerciseId);
    }

    // Cargar foto personalizada guardada por el usuario (si existe)
    const exercisePhoto = await DB.getExercisePhoto(this.user.id, ex.id);
    const exercisePhotoSrc = exercisePhoto?.base64 || ex.gif || null;

    // Genera las filas de la tabla (una por serie)
    const genRows = (n, defaultReps = ex.reps, defaultWeight = '') =>
      Array.from({ length: n }, (_, i) => `
        <tr>
          <td style="padding:6px 10px;text-align:center;font-weight:700;color:var(--primary)">${i + 1}</td>
          <td style="padding:4px 6px">
            <input type="text" name="reps_${i+1}" value="${defaultReps}" placeholder="8-10"
              style="width:80px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--text);text-align:center"/>
          </td>
          <td style="padding:4px 6px">
            <input type="text" name="weight_${i+1}" value="${defaultWeight}" placeholder="Ej: 30kg"
              style="width:110px;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:7px 8px;color:var(--text)"/>
          </td>
        </tr>`).join('');

    this.openModal(`Configurar: ${ex.name}`, `
      <div style="margin-bottom:16px;padding:14px 16px;background:${g.color};border-radius:var(--radius-sm);text-align:center">
        <div style="font-size:2.4rem">${g.icon}</div>
        <div style="font-weight:700;font-size:1.05rem;margin-top:4px">${ex.name}</div>
        <div style="opacity:.85;font-size:.82rem">${g.label}</div>
        ${muscleGroup === '__custom__' ? '<div style="margin-top:4px"><span class="badge-custom-ex">✏️ Personalizado</span></div>' : ''}
        ${ex.instructions ? `<div style="margin-top:6px;font-size:.78rem;opacity:.85">${ex.instructions}</div>` : ''}
        ${ex.description  ? `<div style="margin-top:6px;font-size:.78rem;opacity:.85">${ex.description}</div>`  : ''}
        <div class="form-group">
          <label style="color:#fff;font-weight:600">Foto / GIF</label>
          <div style="display:flex;flex-direction:column;gap:10px">
            <div id="exercise-photo-current" style="width:100%;max-width:300px;border-radius:8px;margin-top:10px">
              ${exercisePhotoSrc ? `<img src="${exercisePhotoSrc}" alt="${ex.name}" style="width:100%;border-radius:8px">` : `<div style="padding:18px;border:1px dashed rgba(255,255,255,0.5);border-radius:8px;text-align:center;color:rgba(255,255,255,0.75)">No hay imagen disponible</div>`}
            </div>
            <div id="exercise-photo-buttons" style="display:flex;gap:8px;flex-wrap:wrap;justify-content:center${exercisePhotoSrc ? ';display:none' : ''}">
              <button type="button" class="btn btn-outline btn-sm" onclick="app.selectExercisePhotoFile()">📁 Subir</button>
              <button type="button" class="btn btn-outline btn-sm" onclick="app.takeExercisePhoto()">📷 Cámara</button>
              <button type="button" class="btn btn-primary btn-sm" id="btn-save-exercise-photo" style="display:none" onclick="app.saveExercisePhoto('${ex.id}')">💾 Guardar foto</button>
            </div>
            <input type="file" id="exercise-photo-file" accept="image/*" style="display:none" onchange="app.previewExercisePhoto(this, '${ex.id}')">
            <div id="exercise-photo-preview" style="display:none;margin-top:10px"><img id="exercise-preview-img" style="max-width:100%;max-height:200px;border-radius:8px"></div>
          </div>
        </div>
      </div>
      <form id="ex-config-form">
        <div class="form-row">
          <div class="form-group">
            <label>Número de series</label>
            <input type="number" id="ex-sets-n" name="sets" value="${ex.sets}" min="1" max="20" required
                   oninput="app._refreshSetsRows(this.value)"/>
          </div>
          <div class="form-group">
            <label>Descanso entre series (seg)</label>
            <input type="number" name="rest" value="${ex.rest}" min="0"/>
          </div>
        </div>

        <!-- Relleno rápido -->
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;padding:10px 12px;background:var(--bg2);border-radius:var(--radius-sm);margin-bottom:12px">
          <span style="font-size:.8rem;color:var(--text2);white-space:nowrap">Rellenar todas:</span>
          <input type="text" id="fill-reps"   placeholder="Reps"  value="${ex.reps}"
            style="width:72px;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.85rem"/>
          <input type="text" id="fill-weight" placeholder="Peso"
            style="width:90px;background:var(--card);border:1px solid var(--border);border-radius:6px;padding:6px 8px;color:var(--text);font-size:.85rem"/>
          <button type="button" class="btn btn-outline btn-sm" onclick="app._fillAllSets()">Aplicar →</button>
        </div>

        <!-- Tabla serie a serie -->
        <div style="overflow-x:auto;border:1px solid var(--border);border-radius:var(--radius-sm);margin-bottom:16px">
          <table style="width:100%;border-collapse:collapse">
            <thead style="background:var(--bg2)">
              <tr style="color:var(--text2);font-size:.75rem;text-transform:uppercase;letter-spacing:.5px">
                <th style="padding:8px 10px;text-align:center">Serie</th>
                <th style="padding:8px 10px;text-align:left">Repeticiones</th>
                <th style="padding:8px 10px;text-align:left">Peso / Carga</th>
              </tr>
            </thead>
            <tbody id="sets-tbody">${genRows(ex.sets)}</tbody>
          </table>
        </div>

        <div class="form-group">
          <label>Notas específicas</label>
          <input type="text" name="notes" placeholder="Instrucciones adicionales para este ejercicio…"/>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.openExercisePickerModal()">← Volver</button>
          <button type="submit" class="btn btn-primary">+ Añadir a rutina</button>
        </div>
      </form>`, true);

    // Actualiza filas al cambiar el número de series
    this._refreshSetsRows = n => {
      const num = Math.max(1, Math.min(20, parseInt(n) || 1));
      document.getElementById('sets-tbody').innerHTML = genRows(num);
    };

    // Rellena todas las filas con los valores del relleno rápido
    this._fillAllSets = () => {
      const reps   = document.getElementById('fill-reps')?.value  || '';
      const weight = document.getElementById('fill-weight')?.value || '';
      const n      = parseInt(document.getElementById('ex-sets-n')?.value) || 1;
      for (let i = 1; i <= n; i++) {
        const ri = document.querySelector(`[name="reps_${i}"]`);
        const wi = document.querySelector(`[name="weight_${i}"]`);
        if (ri && reps)   ri.value = reps;
        if (wi && weight) wi.value = weight;
      }
    };

    document.getElementById('ex-config-form').onsubmit = async e => {
      e.preventDefault();
      const fd   = new FormData(e.target);
      const sets = parseInt(fd.get('sets')) || 1;

      // Recoge datos por serie
      const setsData = Array.from({ length: sets }, (_, i) => ({
        reps:   fd.get(`reps_${i+1}`)   || '',
        weight: fd.get(`weight_${i+1}`) || '',
      }));

      const resolvedMuscleGroup = muscleGroup === '__custom__' ? (ex.muscleGroup || 'core') : muscleGroup;

      this._builderExercises.push({
        id: uid(), exerciseId: ex.id || exerciseId, name: ex.name,
        muscleGroup: resolvedMuscleGroup,
        isCustom: muscleGroup === '__custom__',
        sets,
        setsData,
        // Campos planos (resumen) para la vista rápida de cards
        reps:   [...new Set(setsData.map(s => s.reps).filter(Boolean))].join(' / '),
        weight: setsData.map(s => s.weight || '–').join(' / '),
        rest:   parseInt(fd.get('rest')) || 0,
        notes:  fd.get('notes') || '',
      });

      this.toast('✅ Ejercicio añadido');
      await this.openAddRoutineModal(
        this._builderParams?.preClientId,
        this._builderParams?.editRoutineId,
        true, // isReopen: conservar ejercicios ya añadidos
      );
      this._restoreBuilderFormState();
    };
  }

  async confirmDeleteRoutine(routineId, clientId) {
    this.openModal('Eliminar Rutina', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>¿Eliminar esta rutina?</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button class="btn btn-danger" onclick="app._deleteRoutine('${routineId}','${clientId}')">Eliminar</button>
        </div>
      </div>`);
  }

  async _deleteRoutine(routineId, clientId) {
    await DB.deleteRoutine(routineId);
    this.closeModal();
    this.toast('Rutina eliminada', 'info');
    this.view === 'client-detail' ? this.navigate('client-detail', {clientId}) : this.navigate('rutinas');
  }

  // ════════════════════════════════════════════════════
  // NUTRITION
  // ════════════════════════════════════════════════════
  mealPlanCardHTML(plan, client) {
    const daysWithData = Object.entries(plan.days||{}).filter(([,d]) => d.desayuno?.name).length;
    return `
      <div class="meal-plan-card">
        <div class="routine-header">
          <div>
            <div class="routine-title">🥗 ${plan.name}</div>
            ${client ? `<div class="routine-meta">👤 ${client.name}</div>` : ''}
            <div class="routine-meta">${plan.totalCalories ? plan.totalCalories+' kcal/día · ' : ''}${daysWithData}/7 días configurados</div>
          </div>
          <div class="routine-actions">
            <button class="btn btn-outline btn-sm" onclick="app.openMealPlanView('${plan.id}')">Ver</button>
            <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteMealPlan('${plan.id}','${plan.clientId}')">🗑</button>
          </div>
        </div>
        ${plan.notes ? `<div style="padding:0 18px 14px;color:var(--text2);font-size:.82rem">📝 ${plan.notes}</div>` : ''}
      </div>`;
  }

  photoCardHTML(photo) {
    const src = photo.base64 || photo.url;
    return `
      <div class="photo-card">
        <img src="${src}" alt="Foto de progreso" onclick="app.viewPhoto('${src}')">
        <div class="photo-info">
          <div class="photo-date">${formatDate(photo.date)}</div>
          ${photo.notes ? `<div class="photo-notes">${photo.notes}</div>` : ''}
        </div>
        <button class="btn btn-danger btn-sm photo-delete" onclick="app.confirmDeletePhoto('${photo.id}')">🗑</button>
      </div>`;
  }

  async renderNutricion() {
    const isTrainer = this.user.role === 'trainer';
    const plans     = isTrainer
      ? await DB.getMealPlansByTrainer(this.user.id)
      : await DB.getMealPlansByClient(this.user.id);

    let clientMap = {};
    if (isTrainer) {
      const clients = await DB.getClientsByTrainer(this.user.id);
      clients.forEach(c => clientMap[c.id] = c);
    }

    return `
      <div class="view-header">
        <div class="view-title">Nutrición <small>${plans.length} planes</small></div>
        ${isTrainer ? `<button class="btn btn-primary btn-sm" onclick="app.openAddMealPlanModal()">+ Nuevo plan</button>` : ''}
      </div>
      ${plans.length
        ? plans.map(p => this.mealPlanCardHTML(p, clientMap[p.clientId]||null)).join('')
        : `<div class="empty-state"><div class="empty-icon">🥗</div><h3>Sin planes nutricionales</h3>
           ${isTrainer?`<button class="btn btn-primary" style="margin-top:16px" onclick="app.openAddMealPlanModal()">+ Crear plan</button>`:''}</div>`}`;
  }

  async openMealPlanView(planId) {
    const plan = await DB.getMealPlan(planId);
    if (!plan) return;
    let activeDay = DAYS_OF_WEEK[0].key;

    const renderDay = dayKey => {
      const day      = plan.days?.[dayKey] || {};
      const totalCal = MEAL_SLOTS.reduce((s, slot) => s + (day[slot.key]?.calories || 0), 0);
      return `
        <div style="padding:4px 0;margin-bottom:12px;text-align:center"><span class="badge badge-yellow">Total del día: ${totalCal} kcal</span></div>
        <div class="meals-container">
          ${MEAL_SLOTS.map(slot => {
            const meal = day[slot.key];
            return `<div class="meal-card">
              <div class="meal-header"><div class="meal-title">${slot.icon} ${slot.label} <small style="color:var(--text3);font-weight:400">${slot.time}</small></div></div>
              <div class="meal-body">
                ${meal?.name ? `
                  <div style="font-weight:700;margin-bottom:10px">${meal.name}</div>
                  <div class="macros-row">
                    <div class="macro macro-cal"><div class="macro-val">${meal.calories}</div><div class="macro-lbl">kcal</div></div>
                    <div class="macro macro-prot"><div class="macro-val">${meal.protein}g</div><div class="macro-lbl">Prot.</div></div>
                    <div class="macro macro-carb"><div class="macro-val">${meal.carbs}g</div><div class="macro-lbl">Carb.</div></div>
                    <div class="macro macro-fat"><div class="macro-val">${meal.fat}g</div><div class="macro-lbl">Grasa</div></div>
                  </div>
                  <div class="food-list">${(meal.foods||[]).map(f=>`<div class="food-item">${f}</div>`).join('')}</div>
                ` : `<div style="color:var(--text3);text-align:center;padding:8px;font-size:.85rem">Sin datos para esta comida</div>`}
              </div>
            </div>`;
          }).join('')}
        </div>`;
    };

    this.openModal(`🥗 ${plan.name}`, `
      ${plan.notes ? `<div class="card card-sm" style="margin-bottom:16px;font-size:.85rem;color:var(--text2)">📝 ${plan.notes}</div>` : ''}
      <div class="days-tabs" id="days-tabs">${DAYS_OF_WEEK.map(d=>`<div class="day-tab ${d.key===activeDay?'active':''}" data-day="${d.key}" onclick="app._switchMealDay('${d.key}')">${d.short} ${d.label}</div>`).join('')}</div>
      <div id="meal-day-content">${renderDay(activeDay)}</div>`, true);

    this._switchMealDay = dayKey => {
      document.querySelectorAll('#days-tabs .day-tab').forEach(t => t.classList.toggle('active', t.dataset.day === dayKey));
      document.getElementById('meal-day-content').innerHTML = renderDay(dayKey);
    };
  }

  async openAddMealPlanModal(preClientId = null) {
    const clients = await DB.getClientsByTrainer(this.user.id);
    if (!clients.length) { this.toast('Primero añade un cliente', 'error'); return; }

    // ── Estado interno del plan ──────────────────────
    const emptyMeal = () => ({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] });
    const emptyDay  = () => MEAL_SLOTS.reduce((o, s) => ({ ...o, [s.key]: emptyMeal() }), {});
    this._mealPlanData  = { days: DAYS_OF_WEEK.reduce((o, d) => ({ ...o, [d.key]: emptyDay() }), {}) };
    this._activeMealDay = 'lunes';

    // ── Fila de alimento dinámica ────────────────────
    const foodRow = (slotKey, val = '') => `
      <div class="food-row" style="display:flex;gap:6px;align-items:center">
        <input type="text" data-food-slot="${slotKey}" value="${val}"
          placeholder="Ej: Avena 80g, Leche desnatada 200ml…"
          style="flex:1;background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:7px 10px;color:var(--text);font-size:.85rem"/>
        <button type="button" onclick="this.closest('.food-row').remove()"
          style="background:rgba(255,107,107,.12);border:1px solid rgba(255,107,107,.3);border-radius:6px;padding:6px 10px;color:var(--accent);cursor:pointer;font-size:.82rem;white-space:nowrap">✕</button>
      </div>`;

    // ── Renderiza el editor de un día ────────────────
    const renderDay = (dayKey) => {
      const day = this._mealPlanData.days[dayKey];
      return MEAL_SLOTS.map(slot => {
        const m = day[slot.key];
        return `
          <div style="border:1px solid var(--border);border-radius:var(--radius-sm);overflow:hidden;margin-bottom:8px">
            <div onclick="app._toggleMealCard('${slot.key}')"
                 style="display:flex;align-items:center;gap:10px;padding:12px 14px;cursor:pointer;background:var(--bg2);user-select:none">
              <span style="font-size:1.2rem">${slot.icon}</span>
              <span style="font-weight:700;flex:1">${slot.label}</span>
              <span style="color:var(--text3);font-size:.75rem">${slot.time}</span>
              ${m.calories ? `<span style="color:var(--yellow);font-size:.75rem;font-weight:700">${m.calories} kcal</span>` : ''}
              <span id="mcarrow-${slot.key}" style="color:var(--text3);font-size:.8rem">▼</span>
            </div>
            <div id="mcbody-${slot.key}" style="display:none;padding:14px;background:var(--card2);display:none">
              <div class="form-group" style="margin-bottom:10px">
                <input type="text" id="mc-name-${slot.key}" value="${m.name}"
                  placeholder="Nombre de esta comida (ej: Desayuno proteico)"
                  style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:8px 12px;color:var(--text)"/>
              </div>
              <div style="display:grid;grid-template-columns:repeat(4,1fr);gap:8px;margin-bottom:12px">
                ${[
                  ['mc-cal',  'Kcal',     m.calories, 'var(--yellow)'],
                  ['mc-prot', 'Prot. (g)', m.protein,  'var(--green)' ],
                  ['mc-carb', 'Carb. (g)', m.carbs,    'var(--orange)'],
                  ['mc-fat',  'Grasa (g)', m.fat,      'var(--pink)'  ],
                ].map(([id, lbl, val, color]) => `
                  <div style="text-align:center">
                    <div style="font-size:.68rem;color:var(--text2);margin-bottom:4px;text-transform:uppercase;letter-spacing:.4px">${lbl}</div>
                    <input type="number" id="${id}-${slot.key}" value="${val || ''}" min="0"
                      style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:6px;padding:6px 4px;color:${color};font-weight:700;text-align:center;font-size:.9rem"/>
                  </div>`).join('')}
              </div>
              <div style="font-size:.75rem;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.4px;margin-bottom:8px">🥦 Alimentos</div>
              <div id="mc-foods-${slot.key}" style="display:flex;flex-direction:column;gap:6px">
                ${(m.foods || []).map(f => foodRow(slot.key, f)).join('')}
              </div>
              <button type="button" onclick="app._addMealFood('${slot.key}')"
                style="margin-top:8px;width:100%;padding:8px;border:1px dashed var(--border);border-radius:6px;color:var(--primary);font-size:.83rem;cursor:pointer;background:rgba(108,99,255,.06);transition:all .2s">
                + Añadir alimento
              </button>
            </div>
          </div>`;
      }).join('');
    };

    this._renderMealDay = renderDay;
    this._mealFoodRow   = foodRow;

    // ── HTML del modal ───────────────────────────────
    const html = `
      <div style="display:flex;flex-direction:column;gap:12px">
        <div class="form-row">
          <div class="form-group">
            <label>Nombre del plan *</label>
            <input type="text" id="mplan-name" placeholder="Ej: Plan Volumen Semana 1"
              style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;color:var(--text)"/>
          </div>
          <div class="form-group">
            <label>Cliente *</label>
            <select id="mplan-client"
              style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;color:var(--text)">
              <option value="">Seleccionar…</option>
              ${clients.map(c => `<option value="${c.id}" ${preClientId === c.id ? 'selected' : ''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group">
            <label>Calorías objetivo/día</label>
            <input type="number" id="mplan-cal" placeholder="Ej: 2500"
              style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;color:var(--text)"/>
          </div>
          <div class="form-group">
            <label>Notas generales</label>
            <input type="text" id="mplan-notes" placeholder="Instrucciones, observaciones…"
              style="width:100%;background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:10px 12px;color:var(--text)"/>
          </div>
        </div>

        <div style="font-size:.78rem;font-weight:700;color:var(--text2);text-transform:uppercase;letter-spacing:.4px">📅 Comidas por día</div>

        <div class="days-tabs" id="mplan-day-tabs" style="border-bottom:1px solid var(--border);margin-bottom:0">
          ${DAYS_OF_WEEK.map(d =>
            `<div class="day-tab mplan-day-tab ${d.key === 'lunes' ? 'active' : ''}" data-day="${d.key}"
                  onclick="app._switchMealPlanDay('${d.key}')">${d.short} ${d.label}</div>`
          ).join('')}
        </div>

        <div id="meal-day-editor" style="max-height:380px;overflow-y:auto;padding-right:4px">
          ${renderDay('lunes')}
        </div>

        <p id="mplan-err" class="form-error hidden"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="button" class="btn btn-primary" id="mplan-save-btn" onclick="app._saveMealPlanFromBuilder()">💾 Guardar plan</button>
        </div>
      </div>`;

    this.openModal('Nuevo Plan Nutricional', html, true);
  }

  // ── Helpers del builder de nutrición ──────────────

  _toggleMealCard(slotKey) {
    const body  = document.getElementById(`mcbody-${slotKey}`);
    const arrow = document.getElementById(`mcarrow-${slotKey}`);
    if (!body) return;
    const isOpen = body.style.display !== 'none';
    body.style.display  = isOpen ? 'none' : 'block';
    if (arrow) arrow.textContent = isOpen ? '▼' : '▲';
  }

  _addMealFood(slotKey) {
    document.getElementById(`mc-foods-${slotKey}`)
      ?.insertAdjacentHTML('beforeend', this._mealFoodRow(slotKey));
  }

  _saveMealDayToState(dayKey) {
    if (!this._mealPlanData) return;
    const day = this._mealPlanData.days[dayKey];
    MEAL_SLOTS.forEach(slot => {
      const foods = [...document.querySelectorAll(`[data-food-slot="${slot.key}"]`)]
        .map(i => i.value.trim()).filter(Boolean);
      day[slot.key] = {
        name:     document.getElementById(`mc-name-${slot.key}`)?.value?.trim()  || '',
        calories: parseInt(document.getElementById(`mc-cal-${slot.key}`)?.value)  || 0,
        protein:  parseInt(document.getElementById(`mc-prot-${slot.key}`)?.value) || 0,
        carbs:    parseInt(document.getElementById(`mc-carb-${slot.key}`)?.value) || 0,
        fat:      parseInt(document.getElementById(`mc-fat-${slot.key}`)?.value)  || 0,
        foods,
      };
    });
  }

  _switchMealPlanDay(newDayKey) {
    this._saveMealDayToState(this._activeMealDay);
    this._activeMealDay = newDayKey;
    document.querySelectorAll('.mplan-day-tab').forEach(t =>
      t.classList.toggle('active', t.dataset.day === newDayKey));
    document.getElementById('meal-day-editor').innerHTML = this._renderMealDay(newDayKey);
  }

  async _saveMealPlanFromBuilder() {
    this._saveMealDayToState(this._activeMealDay);
    const name     = document.getElementById('mplan-name')?.value?.trim();
    const clientId = document.getElementById('mplan-client')?.value;
    const cal      = parseInt(document.getElementById('mplan-cal')?.value)   || 0;
    const notes    = document.getElementById('mplan-notes')?.value?.trim()   || '';
    const errEl    = document.getElementById('mplan-err');
    const btn      = document.getElementById('mplan-save-btn');

    if (!name)     { errEl.textContent = 'Escribe un nombre para el plan.'; errEl.classList.remove('hidden'); return; }
    if (!clientId) { errEl.textContent = 'Selecciona un cliente.';          errEl.classList.remove('hidden'); return; }

    btn.disabled = true; btn.textContent = 'Guardando…';
    try {
      await DB.saveMealPlan({
        id: null, name, clientId, trainerId: this.user.id,
        totalCalories: cal, notes, days: this._mealPlanData.days,
      });
      this.toast('Plan nutricional guardado');
      this.closeModal();
      this.view === 'client-detail'
        ? this.navigate('client-detail', { clientId })
        : this.navigate('nutricion');
    } catch (err) {
      errEl.textContent = err.message; errEl.classList.remove('hidden');
      btn.disabled = false; btn.textContent = '💾 Guardar plan';
    }
  }

  async confirmDeleteMealPlan(planId, clientId) {
    this.openModal('Eliminar Plan', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div>
        <p>¿Eliminar este plan nutricional?</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button class="btn btn-danger" onclick="app._deleteMealPlan('${planId}','${clientId}')">Eliminar</button>
        </div>
      </div>`);
  }

  async _deleteMealPlan(planId, clientId) {
    await DB.deleteMealPlan(planId);
    this.closeModal();
    this.toast('Plan eliminado', 'info');
    this.view === 'client-detail' ? this.navigate('client-detail', {clientId}) : this.navigate('nutricion');
  }

  // ════════════════════════════════════════════════════
  // MEASUREMENTS
  // ════════════════════════════════════════════════════
  async renderMedidas(clientId) {
    if (this.user.role === 'trainer' && !clientId) {
      const clients = await DB.getClientsByTrainer(this.user.id);
      return `
        <div class="view-header"><div class="view-title">Medidas de Clientes</div></div>
        ${clients.length ? `<div class="clients-grid">${clients.map(c => this.clientCardHTML(c, 0, null, 'medidas')).join('')}</div>`
        : '<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin clientes</h3></div>'}
      `;
    }

    const cid      = clientId || this.user.id;
    const client   = await DB.getUser(cid);
    const measures = await DB.getMeasurementsByClient(cid);
    const latest   = measures[0];
    const prev     = measures[1];
    const imc      = latest ? calcIMC(latest.weight, latest.height) : null;
    const imcCat   = imc    ? imcCategory(parseFloat(imc))          : null;

    const fields = [
      { key:'weight',    label:'Peso',            unit:'kg', icon:'⚖️', lower:true },
      { key:'bodyFat',   label:'% Grasa corp.',   unit:'%',  icon:'🔥', lower:true },
      { key:'chest',     label:'Pecho',           unit:'cm', icon:'💪'            },
      { key:'waist',     label:'Cintura',         unit:'cm', icon:'📏', lower:true },
      { key:'hips',      label:'Cadera',          unit:'cm', icon:'🦵'            },
      { key:'shoulders', label:'Hombros',         unit:'cm', icon:'🏋️'           },
      { key:'rightBicep',label:'Bícep derecho',   unit:'cm', icon:'💪'            },
      { key:'leftBicep', label:'Bícep izquierdo', unit:'cm', icon:'💪'            },
      { key:'rightThigh',label:'Muslo derecho',   unit:'cm', icon:'🦵'            },
      { key:'leftThigh', label:'Muslo izquierdo', unit:'cm', icon:'🦵'            },
      { key:'rightCalf', label:'Pantorrilla D.',  unit:'cm', icon:'🦶'            },
      { key:'leftCalf',  label:'Pantorrilla I.',  unit:'cm', icon:'🦶'            },
    ];

    return `
      <div class="view-header">
        ${this.user.role === 'trainer' ? `<button class="btn btn-ghost btn-sm" onclick="app.navigate('medidas')">← Volver</button>` : ''}
        <div class="view-title">Medidas ${client && client.id !== this.user.id ? `<small>${client.name}</small>` : ''}</div>
        <button class="btn btn-primary btn-sm" onclick="app.openAddMeasurementModal('${cid}')">+ Registrar</button>
      </div>
      ${latest ? `
        <div class="card" style="margin-bottom:20px">
          <div class="section-title" style="margin-bottom:14px">Última medición · ${formatDate(latest.date)}</div>
          ${imc ? `<div style="display:flex;align-items:center;gap:12px;margin-bottom:16px;padding:12px;background:var(--bg2);border-radius:var(--radius-sm)">
            <div style="font-size:2rem">⚖️</div>
            <div><div style="font-size:1.5rem;font-weight:800">${latest.weight}kg · IMC ${imc}</div>
            <span class="badge ${imcCat.cls}">${imcCat.label}</span>
            ${latest.height?`<span style="color:var(--text2);font-size:.82rem;margin-left:8px">Altura: ${latest.height}cm</span>`:''}</div></div>` : ''}
          <div class="measure-grid">
            ${fields.map(f => {
              if (!latest[f.key]) return '';
              const diff = prev ? (latest[f.key] - prev[f.key]).toFixed(1) : null;
              let cls = 'change-same', arrow = '–';
              if (diff !== null && diff != 0) { const good = f.lower ? diff<0 : diff>0; cls = good?'change-down':'change-up'; arrow = diff>0?`+${diff}`:diff; }
              return `<div class="measure-item"><span class="measure-icon">${f.icon}</span><div class="measure-data"><strong>${latest[f.key]}${f.unit}</strong><span>${f.label}</span></div>${diff!==null?`<span class="measure-change ${cls}">${arrow}</span>`:''}</div>`;
            }).join('')}
          </div>
          ${latest.notes ? `<div style="margin-top:12px;padding:10px;background:var(--bg2);border-radius:var(--radius-sm);color:var(--text2);font-size:.85rem">📝 ${latest.notes}</div>` : ''}
        </div>
        <div class="section-header"><span class="section-title">Historial de mediciones</span></div>
        <div class="measure-history">
          <div class="history-row header"><span>Fecha</span><span>Peso</span><span>% Grasa</span><span>IMC</span></div>
          ${measures.map(m => `<div class="history-row">
            <span>${formatDate(m.date)}</span>
            <span>${m.weight?m.weight+'kg':'-'}</span>
            <span>${m.bodyFat?m.bodyFat+'%':'-'}</span>
            <span>${calcIMC(m.weight,m.height)}</span>
            ${this.user.role === 'trainer' ? `<button class="btn btn-danger btn-sm" onclick="app.confirmDeleteMeasurement('${m.id}','${cid}')">🗑</button>` : ''}
          </div>`).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">📏</div><h3>Sin medidas registradas</h3>
          <button class="btn btn-primary" style="margin-top:16px" onclick="app.openAddMeasurementModal('${cid}')">+ Registrar medidas</button>
        </div>`}
    `;
  }

  async openAddMeasurementModal(clientId) {
    const cid    = clientId || this.user.id;
    const client = await DB.getUser(cid);
    this.openModal(`📏 Registrar Medidas${client && client.id !== this.user.id ? ` · ${client.name}` : ''}`, `
      <form id="measure-form">
        <div class="form-group"><label>Fecha</label><input type="date" name="date" value="${todayStr()}" max="${todayStr()}" required/></div>
        <div class="form-section-title">📊 Datos Principales</div>
        <div class="form-row">
          <div class="form-group"><label>Peso (kg)</label><input type="number" name="weight" step=".1" placeholder="Ej: 75.5"/></div>
          <div class="form-group"><label>Altura (cm)</label><input type="number" name="height" placeholder="Ej: 178"/></div>
        </div>
        <div class="form-group"><label>% Grasa corporal</label><input type="number" name="bodyFat" step=".1" placeholder="Ej: 18.5"/></div>
        <div class="form-section-title">📐 Medidas de Torso</div>
        <div class="form-row">
          <div class="form-group"><label>Pecho (cm)</label><input type="number" name="chest" step=".5"/></div>
          <div class="form-group"><label>Cintura (cm)</label><input type="number" name="waist" step=".5"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Cadera (cm)</label><input type="number" name="hips" step=".5"/></div>
          <div class="form-group"><label>Hombros (cm)</label><input type="number" name="shoulders" step=".5"/></div>
        </div>
        <div class="form-section-title">💪 Brazos</div>
        <div class="form-row">
          <div class="form-group"><label>Bícep derecho (cm)</label><input type="number" name="rightBicep" step=".5"/></div>
          <div class="form-group"><label>Bícep izquierdo (cm)</label><input type="number" name="leftBicep" step=".5"/></div>
        </div>
        <div class="form-section-title">🦵 Piernas</div>
        <div class="form-row">
          <div class="form-group"><label>Muslo derecho (cm)</label><input type="number" name="rightThigh" step=".5"/></div>
          <div class="form-group"><label>Muslo izquierdo (cm)</label><input type="number" name="leftThigh" step=".5"/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Pantorrilla derecha (cm)</label><input type="number" name="rightCalf" step=".5"/></div>
          <div class="form-group"><label>Pantorrilla izquierda (cm)</label><input type="number" name="leftCalf" step=".5"/></div>
        </div>
        <div class="form-group" style="margin-top:8px"><label>Notas</label><textarea name="notes" placeholder="Observaciones…"></textarea></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Guardar medidas</button>
        </div>
      </form>`, true);

    document.getElementById('measure-form').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Guardando…';
      const fd = new FormData(e.target);
      const pF = v => v ? parseFloat(v) : null;
      try {
        await DB.saveMeasurement({
          id: null, clientId: cid, date: fd.get('date'),
          weight: pF(fd.get('weight')), height: pF(fd.get('height')), bodyFat: pF(fd.get('bodyFat')),
          chest: pF(fd.get('chest')), waist: pF(fd.get('waist')), hips: pF(fd.get('hips')), shoulders: pF(fd.get('shoulders')),
          rightBicep: pF(fd.get('rightBicep')), leftBicep: pF(fd.get('leftBicep')),
          rightThigh: pF(fd.get('rightThigh')), leftThigh: pF(fd.get('leftThigh')),
          rightCalf:  pF(fd.get('rightCalf')),  leftCalf:  pF(fd.get('leftCalf')),
          notes: fd.get('notes'),
        });
        this.toast('Medidas guardadas correctamente');
        this.closeModal();
        this.view === 'client-detail' ? this.navigate('client-detail', {clientId: cid}) : this.navigate('medidas');
      } catch(err) { this.toast(err.message,'error'); btn.disabled=false; btn.textContent='💾 Guardar medidas'; }
    };
  }

  async confirmDeleteMeasurement(measureId, clientId) {
    this.openModal('Eliminar Medición', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">⚠️</div><p>¿Eliminar esta medición?</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button class="btn btn-danger" onclick="app._deleteMeasure('${measureId}','${clientId}')">Eliminar</button>
        </div>
      </div>`);
  }

  async _deleteMeasure(id, clientId) {
    await DB.deleteMeasurement(id);
    this.closeModal();
    this.toast('Medición eliminada', 'info');
    this.navigate('medidas', { clientId });
  }

  openPhotoModal(clientId) {
    const today = todayStr();
    this.openModal('Agregar Foto de Progreso', `
      <form id="photo-form" onsubmit="app.savePhoto(event, '${clientId}')">
        <div class="form-group">
          <label>Fecha *</label>
          <input type="date" id="photo-date" value="${today}" max="${today}" required>
        </div>
        <div class="form-group">
          <label>Seleccionar o Tomar Foto *</label>
          <div style="display:flex;gap:8px;margin-bottom:8px">
            <button type="button" class="btn btn-outline btn-sm" onclick="app.selectPhotoFile()">📁 Galería</button>
            <button type="button" class="btn btn-outline btn-sm" onclick="app.takePhoto()">📷 Cámara</button>
          </div>
          <input type="file" id="photo-file" accept="image/*" style="display:none" onchange="app.previewPhoto(this)">
          <div id="photo-preview" style="margin-top:10px;display:none">
            <img id="preview-img" style="max-width:100%;max-height:200px;border-radius:8px">
          </div>
        </div>
        <div class="form-group">
          <label>Notas (opcional)</label>
          <textarea id="photo-notes" placeholder="Comentarios sobre la foto..." rows="3"></textarea>
        </div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Guardar Foto</button>
        </div>
      </form>`);
  }

  selectPhotoFile() {
    document.getElementById('photo-file').click();
  }

  takePhoto() {
    const input = document.getElementById('photo-file');
    input.setAttribute('capture', 'environment');
    input.click();
    // Reset after selection
    input.addEventListener('change', () => input.removeAttribute('capture'), { once: true });
  }

  selectExercisePhotoFile() {
    document.getElementById('exercise-photo-file')?.click();
  }

  takeExercisePhoto() {
    const input = document.getElementById('exercise-photo-file');
    if (!input) return;
    input.setAttribute('capture', 'environment');
    input.click();
    // Reset after selection
    input.addEventListener('change', () => input.removeAttribute('capture'), { once: true });
  }

  previewPhoto(input) {
    const file = input.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        document.getElementById('preview-img').src = e.target.result;
        document.getElementById('photo-preview').style.display = 'block';
      };
      reader.readAsDataURL(file);
    } else {
      document.getElementById('photo-preview').style.display = 'none';
    }
  }

  async fileToDataURL(file, maxWidth = 800, quality = 0.7) {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = () => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          const ratio = Math.min(1, maxWidth / img.width);
          const canvas = document.createElement('canvas');
          canvas.width = img.width * ratio;
          canvas.height = img.height * ratio;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
          const type = file.type || 'image/jpeg';
          const dataUrl = canvas.toDataURL(type, quality);
          resolve(dataUrl);
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  async savePhoto(event, clientId) {
    event.preventDefault();
    const date = document.getElementById('photo-date').value;
    const file = document.getElementById('photo-file').files[0];
    const notes = document.getElementById('photo-notes').value.trim();

    if (!file) return this.toast('Selecciona una foto', 'error');

    try {
      this.toast('Procesando foto...', 'info');
      const base64 = await this.fileToDataURL(file);
      await DB.saveProgressPhoto({
        clientId,
        date,
        base64,
        notes,
        uploadedBy: this.user.id,
        uploadedAt: new Date().toISOString(),
      });
      this.closeModal();
      this.toast('Foto guardada exitosamente');
      this.navigate('progreso', { clientId });
    } catch (err) {
      console.error('Error saving photo:', err);
      this.toast('Error al guardar la foto', 'error');
    }
  }

  previewExercisePhoto(input, exerciseId) {
    const file = input.files[0];
    const preview = document.getElementById('exercise-photo-preview');
    const img = document.getElementById('exercise-preview-img');
    const saveBtn = document.getElementById('btn-save-exercise-photo');

    if (file) {
      const reader = new FileReader();
      reader.onload = e => {
        img.src = e.target.result;
        preview.style.display = 'block';
        saveBtn.style.display = 'inline-flex';
        this._pendingExercisePhoto = { exerciseId, base64: e.target.result };
      };
      reader.readAsDataURL(file);
    } else {
      preview.style.display = 'none';
      saveBtn.style.display = 'none';
      this._pendingExercisePhoto = null;
    }
  }

  async saveExercisePhoto(exerciseId) {
    const pending = this._pendingExercisePhoto;
    if (!pending || pending.exerciseId !== exerciseId || !pending.base64) {
      return this.toast('Selecciona una foto primero', 'error');
    }

    try {
      this.toast('Guardando foto...', 'info');
      await DB.saveExercisePhoto({
        userId: this.user.id,
        exerciseId,
        base64: pending.base64,
      });
      this.toast('Foto guardada', 'success');
      const currentContainer = document.getElementById('exercise-photo-current');
      if (currentContainer) {
        currentContainer.innerHTML = `<img src="${pending.base64}" alt="Ejercicio" style="width:100%;border-radius:8px">`;
      }
      // Ocultar botones de subir/cámara ya que ahora hay imagen
      const buttonsContainer = document.getElementById('exercise-photo-buttons');
      if (buttonsContainer) {
        buttonsContainer.style.display = 'none';
      }
      this._pendingExercisePhoto = null;
      document.getElementById('btn-save-exercise-photo').style.display = 'none';
      document.getElementById('exercise-photo-preview').style.display = 'none';
    } catch (err) {
      console.error('Error saving exercise photo:', err);
      this.toast('Error al guardar la foto', 'error');
    }
  }

  viewPhoto(url) {
    this.openModal('Foto de Progreso', `<img src="${url}" style="max-width:100%;max-height:70vh;border-radius:8px">`, true);
  }

  async confirmDeletePhoto(photoId) {
    this.openModal('Eliminar Foto', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:3rem;margin-bottom:12px">🗑️</div><p>¿Eliminar esta foto de progreso?</p>
        <div class="form-actions" style="justify-content:center;margin-top:20px">
          <button class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button class="btn btn-danger" onclick="app._deletePhoto('${photoId}')">Eliminar</button>
        </div>
      </div>`);
  }

  async _deletePhoto(photoId) {
    try {
      await DB.deleteProgressPhoto(photoId);
      this.closeModal();
      this.toast('Foto eliminada');
      this.navigate(this.view, this.viewParams);
    } catch (err) {
      console.error('Error deleting photo:', err);
      this.toast('Error al eliminar la foto', 'error');
    }
  }

  // ════════════════════════════════════════════════════
  // PROGRESS CHARTS
  // ════════════════════════════════════════════════════
  async renderProgreso(clientId) {
    if (this.user.role === 'trainer' && !clientId) {
      const clients = await DB.getClientsByTrainer(this.user.id);
      return `
        <div class="view-header"><div class="view-title">Progreso de Clientes</div></div>
        ${clients.length ? `<div class="clients-grid">${clients.map(c => this.clientCardHTML(c, 0, null, 'progreso')).join('')}</div>`
        : '<div class="empty-state"><div class="empty-icon">👥</div><h3>Sin clientes</h3></div>'}
      `;
    }

    const cid      = clientId || this.user.id;
    const client   = await DB.getUser(cid);
    const measures = (await DB.getMeasurementsByClient(cid)).reverse();
    const photos   = await DB.getProgressPhotosByClient(cid);

    return `
      <div class="view-header">
        ${this.user.role === 'trainer' ? `<button class="btn btn-ghost btn-sm" onclick="app.navigate('progreso')">← Volver</button>` : ''}
        <div class="view-title">Progreso ${client && client.id !== this.user.id ? `<small>${client.name}</small>` : ''}</div>
      </div>
      ${measures.length < 2 ? `
        <div class="empty-state"><div class="empty-icon">📈</div><h3>Datos insuficientes</h3><p>Se necesitan al menos 2 mediciones para mostrar gráficas</p></div>
      ` : `
        <div class="chart-period" id="period-btns">
          <button class="period-btn active" data-period="all" onclick="app._changePeriod('all','${cid}')">Todo</button>
          <button class="period-btn" data-period="3m" onclick="app._changePeriod('3m','${cid}')">3 meses</button>
          <button class="period-btn" data-period="1m" onclick="app._changePeriod('1m','${cid}')">1 mes</button>
        </div>
        <div class="chart-card"><div class="chart-title">⚖️ Evolución del Peso (kg)</div><div class="chart-wrap"><canvas id="chart-weight"></canvas></div></div>
        <div class="chart-card"><div class="chart-title">🔥 % Grasa Corporal</div><div class="chart-wrap"><canvas id="chart-fat"></canvas></div></div>
        <div class="chart-card"><div class="chart-title">📐 Medidas Corporales (cm)</div><div class="chart-wrap" style="height:250px"><canvas id="chart-measures"></canvas></div></div>
        <div class="chart-card"><div class="chart-title">💪 Brazos (cm)</div><div class="chart-wrap"><canvas id="chart-arms"></canvas></div></div>
        <div class="card" style="margin-top:8px"><div class="section-title" style="margin-bottom:12px">Resumen de cambios</div>${this.progressSummaryHTML(measures)}</div>
      `}
      <div class="card" style="margin-top:8px">
        <div class="section-header">
          <span class="section-title">📸 Fotos de Progreso</span>
          <button class="btn btn-outline btn-sm" onclick="app.openPhotoModal('${cid}')">Agregar Foto</button>
        </div>
        ${photos.length ? `<div class="photos-grid">${photos.map(p => this.photoCardHTML(p)).join('')}</div>` : '<div class="empty-state" style="padding:20px"><div class="empty-icon">📷</div><p>No hay fotos de progreso aún</p></div>'}
      </div>
    `;
  }

  progressSummaryHTML(measures) {
    if (measures.length < 2) return '';
    const first = measures[0], last = measures[measures.length - 1];
    return `<div class="measure-grid">${[
      { key:'weight', label:'Peso',    unit:'kg', lower:true  },
      { key:'bodyFat',label:'% Grasa', unit:'%',  lower:true  },
      { key:'waist',  label:'Cintura', unit:'cm', lower:true  },
      { key:'chest',  label:'Pecho',   unit:'cm', lower:false },
      { key:'rightBicep',label:'Bícep',unit:'cm', lower:false },
    ].map(f => {
      if (!first[f.key] || !last[f.key]) return '';
      const diff = (last[f.key] - first[f.key]).toFixed(1);
      const good = f.lower ? diff < 0 : diff > 0;
      const cls  = diff == 0 ? 'change-same' : good ? 'change-down' : 'change-up';
      return `<div class="measure-item"><div class="measure-data"><strong>${last[f.key]}${f.unit}</strong><span>${f.label}</span><span style="font-size:.75rem;color:var(--text2)">desde ${first[f.key]}${f.unit}</span></div><span class="measure-change ${cls}">${diff>0?'+'+diff:diff}</span></div>`;
    }).join('')}</div>`;
  }

  async setupProgreso(clientId) {
    const cid      = clientId || this.user.id;
    const measures = (await DB.getMeasurementsByClient(cid)).reverse();
    if (measures.length >= 2) this._renderAllCharts(measures);
  }

  _renderAllCharts(measures) {
    const labels = measures.map(m => formatDate(m.date));
    const base   = { tension: 0.4, fill: true, pointBackgroundColor: 'white', pointRadius: 4, borderWidth: 2 };

    const mk = (id, datasets, unit, legend = false) => {
      const canvas = document.getElementById(id);
      if (!canvas) return;
      this.charts[id] = new Chart(canvas, {
        type: 'line',
        data: { labels, datasets },
        options: this.chartOptions(unit, legend),
      });
    };

    mk('chart-weight',   [{ ...base, label:'Peso (kg)',  data: measures.map(m=>m.weight),  borderColor:'#6C63FF', backgroundColor:'rgba(108,99,255,0.1)' }], 'kg');
    mk('chart-fat',      [{ ...base, label:'% Grasa',    data: measures.map(m=>m.bodyFat), borderColor:'#FF6B6B', backgroundColor:'rgba(255,107,107,0.1)' }], '%');
    mk('chart-measures', [
      { ...base, label:'Pecho',    fill:false, data: measures.map(m=>m.chest),    borderColor:'#4ECDC4', backgroundColor:'transparent' },
      { ...base, label:'Cintura',  fill:false, data: measures.map(m=>m.waist),    borderColor:'#FFE66D', backgroundColor:'transparent' },
      { ...base, label:'Cadera',   fill:false, data: measures.map(m=>m.hips),     borderColor:'#FF9A3C', backgroundColor:'transparent' },
      { ...base, label:'Hombros',  fill:false, data: measures.map(m=>m.shoulders),borderColor:'#FF6EB4', backgroundColor:'transparent' },
    ], 'cm', true);
    mk('chart-arms', [
      { ...base, label:'Bícep Der.', data: measures.map(m=>m.rightBicep), borderColor:'#6C63FF', backgroundColor:'rgba(108,99,255,0.05)' },
      { ...base, label:'Bícep Izq.', fill:false, data: measures.map(m=>m.leftBicep),  borderColor:'#4ECDC4', backgroundColor:'transparent' },
    ], 'cm', true);
  }

  renderWeightChart(id, measures) {
    const canvas = document.getElementById(id);
    if (!canvas) return;
    this.charts[id] = new Chart(canvas, {
      type: 'line',
      data: { labels: measures.map(m=>formatDate(m.date)), datasets: [{ label:'Peso (kg)', data: measures.map(m=>m.weight), borderColor:'#6C63FF', backgroundColor:'rgba(108,99,255,0.1)', tension:0.4, fill:true, pointRadius:4, borderWidth:2 }] },
      options: this.chartOptions('kg'),
    });
  }

  chartOptions(unit = '', legend = false) {
    return {
      responsive: true, maintainAspectRatio: false,
      plugins: {
        legend: { display: legend, labels: { color:'#A0A0C0', font:{size:11} } },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} ${unit}` }, backgroundColor:'rgba(26,26,53,0.95)', titleColor:'#fff', bodyColor:'#A0A0C0', borderColor:'rgba(108,99,255,0.3)', borderWidth:1 },
      },
      scales: {
        x: { ticks:{ color:'#6060A0', font:{size:10} }, grid:{ color:'rgba(255,255,255,0.04)' } },
        y: { ticks:{ color:'#A0A0C0', font:{size:11} }, grid:{ color:'rgba(255,255,255,0.06)' } },
      },
    };
  }

  async _changePeriod(period, clientId) {
    document.querySelectorAll('.period-btn').forEach(b => b.classList.toggle('active', b.dataset.period === period));
    this.destroyCharts();
    let measures = (await DB.getMeasurementsByClient(clientId)).reverse();
    if (period !== 'all') {
      const cutoff = new Date();
      cutoff.setMonth(cutoff.getMonth() - (period === '3m' ? 3 : 1));
      measures = measures.filter(m => new Date(m.date) >= cutoff);
    }
    this._renderAllCharts(measures);
  }

  // ════════════════════════════════════════════════════
  // PROFILE
  // ════════════════════════════════════════════════════
  async renderPerfil() {
    const u         = this.user;
    const isTrainer = u.role === 'trainer';
    const [routines, meals] = isTrainer
      ? await Promise.all([DB.getRoutinesByTrainer(u.id), DB.getMealPlansByTrainer(u.id)])
      : [[], []];
    const clients   = isTrainer ? await DB.getClientsByTrainer(u.id) : [];

    return `
      <div class="view-header">
        <div class="view-title">Mi Perfil</div>
        <button class="btn btn-outline btn-sm" onclick="app.openEditProfileModal()">✏️ Editar</button>
      </div>
      <div class="profile-hero">
        <div class="profile-big-avatar ${u.photoBase64 ? '' : (u.color||'avatar-purple')}">${this._avatarInnerHTML(u)}</div>
        <div class="profile-name">${u.name}</div>
        <div class="profile-email">${u.email}</div>
        <div class="profile-badges">
          <span class="badge ${isTrainer?'badge-primary':'badge-green'}">${isTrainer?'🏋️ Entrenador':'💪 Cliente'}</span>
          ${isTrainer && u.specialty ? `<span class="badge badge-yellow">${u.specialty}</span>` : ''}
          ${!isTrainer && u.level    ? `<span class="badge badge-yellow">⚡ ${u.level}</span>`  : ''}
        </div>
        ${isTrainer && u.gym  ? `<p style="color:var(--text2);margin-top:10px;font-size:.88rem">🏢 ${u.gym}</p>`  : ''}
        ${!isTrainer && u.goal? `<p style="color:var(--text2);margin-top:10px;font-size:.88rem">🎯 ${u.goal}</p>` : ''}
      </div>

      ${isTrainer ? `
        <div class="stats-grid" style="margin-bottom:20px">
          <div class="stat-card"><div class="stat-icon" style="background:rgba(108,99,255,0.15)">👥</div><div class="stat-info"><strong>${clients.length}</strong><span>Clientes</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(78,205,196,0.15)">📋</div><div class="stat-info"><strong>${routines.length}</strong><span>Rutinas</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(255,154,60,0.15)">🥗</div><div class="stat-info"><strong>${meals.length}</strong><span>Planes nutri.</span></div></div>
          <div class="stat-card"><div class="stat-icon" style="background:rgba(255,230,109,0.15)">⭐</div><div class="stat-info"><strong>${u.experience||'N/A'}</strong><span>Experiencia</span></div></div>
        </div>
      ` : ''}

      <div class="settings-list">
        <div class="settings-item" onclick="app.openEditProfileModal()"><span class="settings-icon">👤</span><div class="settings-info"><strong>Editar perfil</strong><small>Nombre, teléfono…</small></div><span class="settings-arrow">›</span></div>
        <div class="settings-item" onclick="app.openChangePasswordModal()"><span class="settings-icon">🔒</span><div class="settings-info"><strong>Cambiar contraseña</strong><small>Actualiza tu contraseña</small></div><span class="settings-arrow">›</span></div>
        ${!isTrainer ? `
          <div class="settings-item" onclick="app.navigate('medidas')"><span class="settings-icon">📏</span><div class="settings-info"><strong>Mis medidas</strong></div><span class="settings-arrow">›</span></div>
          <div class="settings-item" onclick="app.navigate('progreso')"><span class="settings-icon">📈</span><div class="settings-info"><strong>Mi progreso</strong></div><span class="settings-arrow">›</span></div>
        ` : ''}
        <div class="settings-item" onclick="app.openAboutModal()"><span class="settings-icon">ℹ️</span><div class="settings-info"><strong>Acerca de GymTrainer Pro</strong><small>v1.0 · Firebase edition</small></div><span class="settings-arrow">›</span></div>
        <div class="settings-item" style="color:var(--accent)" onclick="app.logout()"><span class="settings-icon">🚪</span><div class="settings-info"><strong style="color:var(--accent)">Cerrar sesión</strong></div></div>
      </div>`;
  }

  openEditProfileModal() {
    const u         = this.user;
    const isTrainer = u.role === 'trainer';
    this._pendingPhoto = null; // reset pending photo

    const currentAvatar = u.photoBase64
      ? `<img src="${u.photoBase64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`
      : (u.avatar || u.name[0]);

    this.openModal('Editar Perfil', `
      <form id="profile-form">

        <!-- Foto de perfil -->
        <div style="display:flex;flex-direction:column;align-items:center;gap:10px;margin-bottom:20px">
          <div id="photo-preview"
               class="${u.photoBase64 ? '' : (u.color||'avatar-purple')}"
               style="width:90px;height:90px;border-radius:50%;display:flex;align-items:center;justify-content:center;font-size:2.2rem;cursor:pointer;border:2px dashed var(--primary);overflow:hidden;position:relative;transition:all .2s"
               onclick="document.getElementById('photo-input').click()">
            ${currentAvatar}
            <div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);border-radius:50%;display:flex;align-items:center;justify-content:center;opacity:0;transition:opacity .2s"
                 onmouseenter="this.style.opacity=1" onmouseleave="this.style.opacity=0">
              <span style="font-size:1.4rem">📷</span>
            </div>
          </div>
          <input type="file" id="photo-input" accept="image/*" style="display:none" onchange="app._handlePhotoUpload(this)"/>
          <div style="display:flex;gap:8px">
            <button type="button" class="btn btn-outline btn-sm" onclick="document.getElementById('photo-input').click()">📷 Cambiar foto</button>
            ${u.photoBase64 ? `<button type="button" class="btn btn-danger btn-sm" onclick="app._clearPhoto()">🗑 Quitar foto</button>` : ''}
          </div>
          <p style="color:var(--text3);font-size:.75rem">Máx. 2MB · Se recorta en círculo automáticamente</p>
        </div>

        <div class="form-row">
          <div class="form-group"><label>Nombre completo</label><input type="text" name="name" value="${u.name}" required/></div>
          <div class="form-group"><label>Teléfono</label><input type="tel" name="phone" value="${u.phone||''}"/></div>
        </div>

        <!-- Cambio de email con re-autenticación -->
        <div style="background:var(--bg2);border:1px solid var(--border);border-radius:var(--radius-sm);padding:14px;margin-bottom:12px">
          <div class="form-section-title" style="margin-top:0">📧 Cambiar correo electrónico</div>
          <div class="form-group">
            <label>Nuevo correo</label>
            <input type="email" id="new-email" placeholder="${u.email}" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text);width:100%"/>
          </div>
          <div class="form-group" style="margin-top:8px">
            <label>Contraseña actual <span style="color:var(--text3)">(requerida para cambiar el email)</span></label>
            <input type="password" id="email-current-pw" placeholder="••••••••" style="background:var(--bg);border:1px solid var(--border);border-radius:6px;padding:10px 12px;color:var(--text);width:100%"/>
          </div>
        </div>

        ${isTrainer ? `
          <div class="form-row">
            <div class="form-group"><label>Gimnasio</label><input type="text" name="gym" value="${u.gym||''}"/></div>
            <div class="form-group"><label>Especialidad</label><input type="text" name="specialty" value="${u.specialty||''}"/></div>
          </div>
          <div class="form-group"><label>Años de experiencia</label><input type="text" name="experience" value="${u.experience||''}"/></div>
        ` : `
          <div class="form-row">
            <div class="form-group"><label>Edad</label><input type="number" name="age" value="${u.age||''}"/></div>
            <div class="form-group"><label>Nivel</label>
              <select name="level">${['','Principiante','Intermedio','Avanzado'].map(l=>`<option value="${l}" ${u.level===l?'selected':''}>${l||'Seleccionar…'}</option>`).join('')}</select>
            </div>
          </div>
          <div class="form-group"><label>Objetivo</label><input type="text" name="goal" value="${u.goal||''}"/></div>
        `}

        <div class="form-group">
          <label>Avatar (emoji) <span style="color:var(--text3)">— se usa si no hay foto</span></label>
          <input type="text" name="avatar" value="${u.avatar||''}" maxlength="4" placeholder="Ej: 💪"/>
        </div>

        <p id="profile-err" class="form-error hidden"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Guardar</button>
        </div>
      </form>`, true);

    document.getElementById('profile-form').onsubmit = async e => {
      e.preventDefault();
      const btn    = e.target.querySelector('[type=submit]');
      const errEl  = document.getElementById('profile-err');
      btn.disabled = true; btn.textContent = 'Guardando…';
      errEl.classList.add('hidden');

      const fd       = new FormData(e.target);
      const newEmail = document.getElementById('new-email')?.value?.trim();
      const currentPw = document.getElementById('email-current-pw')?.value;

      try {
        // ── Cambio de email ──────────────────────────────
        if (newEmail && newEmail !== u.email) {
          if (!currentPw) {
            errEl.textContent = 'Escribe tu contraseña actual para cambiar el email.';
            errEl.classList.remove('hidden');
            btn.disabled = false; btn.textContent = '💾 Guardar'; return;
          }
          // Re-autenticar primero
          const cred = EmailAuthProvider.credential(u.email, currentPw);
          await reauthenticateWithCredential(auth.currentUser, cred);
          await verifyBeforeUpdateEmail(auth.currentUser, newEmail);
          
          this.toast('Se ha enviado un correo de verificación a la nueva dirección. Confímalo para aplicar el cambio.', 'info');
        }

        // ── Actualizar Firestore ─────────────────────────
        const updated = {
          ...this.user,
          ...Object.fromEntries(fd.entries()),
          email: newEmail || u.email,
          photoBase64: this._pendingPhoto !== null ? this._pendingPhoto : (u.photoBase64 || null),
        };
        await DB.saveUser(updated);
        this.user = updated;
        this.toast('Perfil actualizado correctamente');
        this.closeModal();
        this.renderShell();
        this.navigate('perfil');
      } catch(err) {
        const msgs = {
          'auth/wrong-password':        'Contraseña actual incorrecta.',
          'auth/requires-recent-login': 'Sesión expirada. Cierra sesión y vuelve a entrar.',
          'auth/email-already-in-use':  'Ese correo ya está en uso por otra cuenta.',
          'auth/invalid-email':         'El formato del correo no es válido.',
        };
        errEl.textContent = msgs[err.code] || err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = '💾 Guardar';
      }
    };
  }

  // Comprime la imagen seleccionada a 200×200 JPEG y la muestra en el preview
  _handlePhotoUpload(input) {
    const file = input.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) { this.toast('La imagen es demasiado grande (máx. 2MB)', 'error'); return; }

    const reader = new FileReader();
    reader.onload = ev => {
      const img = new Image();
      img.onload = () => {
        const SIZE = 200;
        const canvas = document.createElement('canvas');
        canvas.width = canvas.height = SIZE;
        const ctx = canvas.getContext('2d');
        // Recorte cuadrado centrado
        const side = Math.min(img.width, img.height);
        const sx   = (img.width  - side) / 2;
        const sy   = (img.height - side) / 2;
        ctx.drawImage(img, sx, sy, side, side, 0, 0, SIZE, SIZE);
        const base64 = canvas.toDataURL('image/jpeg', 0.75);
        this._pendingPhoto = base64;
        // Actualizar preview
        const preview = document.getElementById('photo-preview');
        if (preview) {
          preview.innerHTML = `<img src="${base64}" style="width:100%;height:100%;object-fit:cover;border-radius:50%"/>`;
          preview.className = '';
        }
      };
      img.src = ev.target.result;
    };
    reader.readAsDataURL(file);
  }

  _clearPhoto() {
    this._pendingPhoto = null; // null = borrar la foto guardada
    const preview = document.getElementById('photo-preview');
    if (preview) {
      const u = this.user;
      preview.className = u.color || 'avatar-purple';
      preview.innerHTML = u.avatar || u.name[0];
    }
  }

  openChangePasswordModal() {
    this.openModal('Cambiar Contraseña', `
      <form id="pw-form">
        <div class="form-group"><label>Contraseña actual</label><input type="password" id="pw-current" required/></div>
        <div class="form-group"><label>Nueva contraseña</label><input type="password" id="pw-new" minlength="6" required/></div>
        <div class="form-group"><label>Confirmar nueva contraseña</label><input type="password" id="pw-confirm" required/></div>
        <p id="pw-err" class="form-error hidden"></p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">Cambiar contraseña</button>
        </div>
      </form>`);

    document.getElementById('pw-form').onsubmit = async e => {
      e.preventDefault();
      const btn     = e.target.querySelector('[type=submit]');
      const errEl   = document.getElementById('pw-err');
      const current = document.getElementById('pw-current').value;
      const newPw   = document.getElementById('pw-new').value;
      const confirm = document.getElementById('pw-confirm').value;
      if (newPw !== confirm) { errEl.textContent = 'Las contraseñas no coinciden.'; errEl.classList.remove('hidden'); return; }
      btn.disabled = true; btn.textContent = 'Guardando…';
      try {
        const cred = EmailAuthProvider.credential(this.user.email, current);
        await reauthenticateWithCredential(auth.currentUser, cred);
        await updatePassword(auth.currentUser, newPw);
        this.toast('Contraseña actualizada');
        this.closeModal();
      } catch(err) {
        const msgs = { 'auth/wrong-password': 'Contraseña actual incorrecta.', 'auth/weak-password': 'Mínimo 6 caracteres.' };
        errEl.textContent = msgs[err.code] || err.message;
        errEl.classList.remove('hidden');
        btn.disabled = false; btn.textContent = 'Cambiar contraseña';
      }
    };
  }

  openAboutModal() {
    this.openModal('Acerca de GymTrainer Pro', `
      <div style="text-align:center;padding:20px 0">
        <div style="font-size:4rem;margin-bottom:12px">💪</div>
        <h2 style="font-size:1.4rem;font-weight:800">GymTrainer Pro</h2>
        <p style="color:var(--text2);margin-top:6px">v1.0 · Firebase Edition</p>
        <p style="color:var(--text2);font-size:.88rem;margin-top:16px;line-height:1.6">PWA para entrenadores personales con Firebase Auth + Firestore.<br>Datos en tiempo real, disponible offline tras la primera carga.</p>
        <div style="margin-top:20px;padding:14px;background:var(--bg2);border-radius:var(--radius-sm)">
          <p style="font-size:.82rem;color:var(--text2)">📱 Instala la app para acceso sin conexión</p>
        </div>
      </div>`);
  }
}

// ── Bootstrap ─────────────────────────────────────────
window.app            = new GymApp();
window.togglePassword = togglePassword;
