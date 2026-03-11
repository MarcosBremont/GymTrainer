/* ===================================================
   GymTrainer Pro - Main Application (Firebase version)
   =================================================== */

import { auth, secondaryAuth } from './firebase.js';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
  createUserWithEmailAndPassword,
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

  renderShell() {
    const u         = this.user;
    const isTrainer = u.role === 'trainer';

    document.getElementById('header-avatar').textContent = u.avatar || u.name[0];
    document.getElementById('header-avatar').className   = `user-avatar ${u.color || 'avatar-purple'}`;
    document.getElementById('sidebar-avatar').textContent = u.avatar || u.name[0];
    document.getElementById('sidebar-avatar').className   = `sidebar-avatar ${u.color || 'avatar-purple'}`;
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
  closeModal(e) {
    if (e && e.target !== document.getElementById('modal-overlay')) return;
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
  clientCardHTML(c, routineCount = 0, lastMeasureWeight = null) {
    return `
      <div class="client-card" onclick="app.navigate('client-detail',{clientId:'${c.id}'})">
        <div class="client-avatar ${c.color||'avatar-purple'}">${c.avatar||c.name[0]}</div>
        <div class="client-info">
          <div class="client-name">${c.name}</div>
          <div class="client-meta">🎯 ${c.goal||'Sin objetivo'}</div>
          <div class="client-meta">📋 ${routineCount} rutinas · ⚖️ ${lastMeasureWeight ? lastMeasureWeight+'kg' : 'Sin medidas'}</div>
        </div>
        <div class="client-actions" onclick="event.stopPropagation()">
          <button class="btn btn-outline btn-sm" onclick="app.openEditClientModal('${c.id}')">✏️</button>
        </div>
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
            <button class="btn btn-outline btn-sm" onclick="app.openAddRoutineModal('${routine.clientId}','${routine.id}')">✏️</button>
            <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteRoutine('${routine.id}','${routine.clientId}')">🗑</button>
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
                <div class="exercise-details">${m.label}</div>
                <div class="exercise-stats">
                  <span class="exercise-stat">${ex.sets} series</span><span class="exercise-stat">${ex.reps} reps</span>
                  ${ex.weight?`<span class="exercise-stat">⚖️ ${ex.weight}</span>`:''}
                  ${ex.rest?`<span class="exercise-stat">⏱ ${ex.rest}s</span>`:''}
                </div>
                ${ex.notes?`<div style="color:var(--text2);font-size:.78rem;margin-top:4px">💡 ${ex.notes}</div>`:''}
              </div></div>`;
          }).join('')}
        </div>`;
      this.openModal(`📋 ${r.name}`, html, true);
    })();
  }

  async openAddRoutineModal(preClientId = null, editRoutineId = null) {
    const clients = await DB.getClientsByTrainer(this.user.id);
    let editing   = null;
    if (editRoutineId) {
      const all = await DB.getRoutinesByTrainer(this.user.id);
      editing   = all.find(r => r.id === editRoutineId) || null;
    }
    this._builderExercises = editing ? [...editing.exercises] : [];

    const renderExList = () => this._builderExercises.map((ex,i) => {
      const m = getMuscleInfo(ex.muscleGroup);
      return `<div class="added-ex-item"><div class="exercise-thumb" style="background:${m.color};width:40px;height:40px;font-size:1.2rem;border-radius:8px">${m.icon}</div>
        <div class="added-ex-info"><div class="added-ex-name">${ex.name}</div><div class="added-ex-params">${ex.sets}×${ex.reps} · ${ex.weight||'-'}</div></div>
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

    this.openModal(editing ? 'Editar Rutina' : 'Nueva Rutina', html, true);
    this._updateBuilderList = () => { document.getElementById('ex-builder-list').innerHTML = renderExList(); };

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

  openExercisePickerModal() {
    let selectedGroup = 'pecho';
    const renderLib = g => EXERCISE_LIBRARY[g].exercises.map(ex => `
      <div class="ex-lib-item" onclick="app.openExerciseConfigModal('${g}','${ex.id}')">
        <div class="ex-lib-icon">${EXERCISE_LIBRARY[g].icon}</div>
        <div class="ex-lib-name">${ex.name}</div>
        <div class="ex-lib-muscle">${EXERCISE_LIBRARY[g].label}</div>
      </div>`).join('');

    this.openModal('Seleccionar Ejercicio', `
      <div class="muscle-filter" id="muscle-filter">
        ${Object.entries(EXERCISE_LIBRARY).map(([k,g])=>`<button class="muscle-btn ${k===selectedGroup?'active':''}" data-group="${k}" onclick="app._switchMuscleGroup('${k}')">${g.icon} ${g.label}</button>`).join('')}
      </div>
      <div class="exercise-library" id="ex-library">${renderLib(selectedGroup)}</div>`, true);

    this._switchMuscleGroup = group => {
      document.querySelectorAll('.muscle-btn').forEach(b => b.classList.toggle('active', b.dataset.group === group));
      document.getElementById('ex-library').innerHTML = renderLib(group);
    };
  }

  openExerciseConfigModal(muscleGroup, exerciseId) {
    const g  = EXERCISE_LIBRARY[muscleGroup];
    const ex = g.exercises.find(e => e.id === exerciseId);
    this.openModal(`Configurar: ${ex.name}`, `
      <div style="margin-bottom:16px;padding:16px;background:${g.color};border-radius:var(--radius-sm);text-align:center">
        <div style="font-size:3rem">${g.icon}</div>
        <div style="font-weight:700;font-size:1.1rem;margin-top:6px">${ex.name}</div>
        <div style="opacity:.85;font-size:.85rem">${g.label}</div>
        ${ex.instructions?`<div style="margin-top:8px;font-size:.8rem;opacity:.9">${ex.instructions}</div>`:''}
      </div>
      <form id="ex-config-form">
        <div class="form-row">
          <div class="form-group"><label>Series</label><input type="number" name="sets" value="${ex.sets}" min="1" max="20" required/></div>
          <div class="form-group"><label>Repeticiones</label><input type="text" name="reps" value="${ex.reps}" required/></div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Peso / Carga</label><input type="text" name="weight" placeholder="Ej: 50kg"/></div>
          <div class="form-group"><label>Descanso (seg)</label><input type="number" name="rest" value="${ex.rest}" min="0"/></div>
        </div>
        <div class="form-group"><label>Notas específicas</label><input type="text" name="notes" placeholder="Instrucciones adicionales…"/></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.openExercisePickerModal()">← Volver</button>
          <button type="submit" class="btn btn-primary">+ Añadir a rutina</button>
        </div>
      </form>`, true);

    document.getElementById('ex-config-form').onsubmit = e => {
      e.preventDefault();
      const fd = new FormData(e.target);
      this._builderExercises.push({ id: uid(), exerciseId, name: ex.name, muscleGroup, sets: parseInt(fd.get('sets')), reps: fd.get('reps'), weight: fd.get('weight'), rest: parseInt(fd.get('rest')), notes: fd.get('notes') });
      this._updateBuilderList?.();
      this.closeModal();
      this.toast('Ejercicio añadido');
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
    const html = `
      <form id="meal-form">
        <div class="form-row">
          <div class="form-group"><label>Nombre del plan *</label><input type="text" name="name" placeholder="Ej: Plan Volumen Semana 1" required/></div>
          <div class="form-group"><label>Cliente *</label>
            <select name="clientId" required>
              <option value="">Seleccionar…</option>
              ${clients.map(c=>`<option value="${c.id}" ${preClientId===c.id?'selected':''}>${c.name}</option>`).join('')}
            </select>
          </div>
        </div>
        <div class="form-row">
          <div class="form-group"><label>Calorías totales/día</label><input type="number" name="totalCalories" placeholder="Ej: 2500"/></div>
          <div class="form-group"><label>Notas</label><input type="text" name="notes" placeholder="Instrucciones generales…"/></div>
        </div>
        <p style="color:var(--text2);font-size:.82rem;margin-top:8px">💡 Tras crear el plan podrás ver sus comidas pulsando "Ver".</p>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Crear plan</button>
        </div>
      </form>`;
    this.openModal('Nuevo Plan Nutricional', html, true);

    document.getElementById('meal-form').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Guardando…';
      const fd       = new FormData(e.target);
      const clientId = fd.get('clientId');
      if (!clientId) { this.toast('Selecciona un cliente', 'error'); btn.disabled=false; btn.textContent='💾 Crear plan'; return; }
      const emptySlot = () => ({ name:'', calories:0, protein:0, carbs:0, fat:0, foods:[] });
      const emptyDay  = () => MEAL_SLOTS.reduce((o,s) => ({...o, [s.key]: emptySlot()}), {});
      try {
        await DB.saveMealPlan({
          id: null, name: fd.get('name'), clientId, trainerId: this.user.id,
          totalCalories: parseInt(fd.get('totalCalories'))||0, notes: fd.get('notes'),
          days: { lunes: emptyDay(), martes: emptyDay(), miercoles: emptyDay(), jueves: emptyDay(), viernes: emptyDay(), sabado: emptyDay(), domingo: emptyDay() },
        });
        this.toast('Plan nutricional creado');
        this.closeModal();
        this.view === 'client-detail' ? this.navigate('client-detail', {clientId}) : this.navigate('nutricion');
      } catch(err) { this.toast(err.message,'error'); btn.disabled=false; btn.textContent='💾 Crear plan'; }
    };
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
        <div class="view-title">Medidas Corporales ${client && client.id !== this.user.id ? `<small>${client.name}</small>` : ''}</div>
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
            <button class="btn btn-danger btn-sm" onclick="app.confirmDeleteMeasurement('${m.id}','${cid}')">🗑</button>
          </div>`).join('')}
        </div>
      ` : `
        <div class="empty-state">
          <div class="empty-icon">📏</div><h3>Sin medidas registradas</h3>
          <button class="btn btn-primary" style="margin-top:16px" onclick="app.openAddMeasurementModal('${cid}')">+ Registrar medidas</button>
        </div>`}`;
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

  // ════════════════════════════════════════════════════
  // PROGRESS CHARTS
  // ════════════════════════════════════════════════════
  async renderProgreso(clientId) {
    const cid      = clientId || this.user.id;
    const client   = await DB.getUser(cid);
    const measures = (await DB.getMeasurementsByClient(cid)).reverse();

    return `
      <div class="view-header">
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
      `}`;
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
        <div class="profile-big-avatar ${u.color||'avatar-purple'}">${u.avatar||u.name[0]}</div>
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
    this.openModal('Editar Perfil', `
      <form id="profile-form">
        <div class="form-row">
          <div class="form-group"><label>Nombre completo</label><input type="text" name="name" value="${u.name}" required/></div>
          <div class="form-group"><label>Teléfono</label><input type="tel" name="phone" value="${u.phone||''}"/></div>
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
        <div class="form-group"><label>Avatar (emoji)</label><input type="text" name="avatar" value="${u.avatar||''}" maxlength="4" placeholder="Ej: 💪"/></div>
        <div class="form-actions">
          <button type="button" class="btn btn-ghost" onclick="app.closeModal()">Cancelar</button>
          <button type="submit" class="btn btn-primary">💾 Guardar</button>
        </div>
      </form>`, true);

    document.getElementById('profile-form').onsubmit = async e => {
      e.preventDefault();
      const btn = e.target.querySelector('[type=submit]');
      btn.disabled = true; btn.textContent = 'Guardando…';
      const fd      = new FormData(e.target);
      const updated = { ...this.user, ...Object.fromEntries(fd.entries()) };
      try {
        await DB.saveUser(updated);
        this.user = updated;
        this.toast('Perfil actualizado');
        this.closeModal();
        this.renderShell();
        this.navigate('perfil');
      } catch(err) { this.toast(err.message,'error'); btn.disabled=false; btn.textContent='💾 Guardar'; }
    };
  }

  openChangePasswordModal() {
    this.openModal('Cambiar Contraseña', `
      <p style="color:var(--text2);font-size:.85rem;margin-bottom:16px">
        Para cambiar la contraseña ve a <strong>Firebase Authentication</strong> en la consola, o implementa un flujo de re-autenticación.<br><br>
        Alternativamente, cierra sesión y usa la opción "¿Olvidé mi contraseña?" en el login.
      </p>
      <div class="form-actions"><button class="btn btn-primary" onclick="app.closeModal()">Entendido</button></div>`);
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
