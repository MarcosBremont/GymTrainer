/* ===================================================
   GymTrainer Pro - Data Layer (Firestore)
   =================================================== */

import { db, secondaryAuth }  from './firebase.js';
import {
  doc, getDoc, getDocs, setDoc, addDoc, deleteDoc,
  collection, query, where, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

// ── Unique ID (used only for sub-objects, not Firestore docs) ────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Exercise Library ─────────────────────────────────────────────

export const MEAL_SLOTS = [
  { key: 'desayuno',    label: 'Desayuno',      icon: '☀️', time: '7:00 - 8:00 AM'  },
  { key: 'mediaManana', label: 'Media Mañana',  icon: '🍎', time: '10:00 - 11:00 AM' },
  { key: 'almuerzo',    label: 'Almuerzo',      icon: '🍽️', time: '1:00 - 2:30 PM'  },
  { key: 'merienda',    label: 'Merienda',      icon: '🥜', time: '5:00 - 6:00 PM'  },
  { key: 'cena',        label: 'Cena',          icon: '🌙', time: '8:00 - 9:00 PM'  },
];

export const DAYS_OF_WEEK = [
  { key: 'lunes',     label: 'Lunes',     short: 'L', num: 1 },
  { key: 'martes',    label: 'Martes',    short: 'M', num: 2 },
  { key: 'miercoles', label: 'Miércoles', short: 'X', num: 3 },
  { key: 'jueves',    label: 'Jueves',    short: 'J', num: 4 },
  { key: 'viernes',   label: 'Viernes',   short: 'V', num: 5 },
  { key: 'sabado',    label: 'Sábado',    short: 'S', num: 6 },
  { key: 'domingo',   label: 'Domingo',   short: 'D', num: 0 },
];

// ── Async DB class (Firestore) ───────────────────────────────────
export class DB {

  /* ---- USERS ---- */
  static async getUser(id) {
    const snap = await getDoc(doc(db, 'users', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  static async saveUser(user) {
    const { id, ...data } = user;
    await setDoc(doc(db, 'users', id), data, { merge: true });
  }

  static async deleteUser(id) {
    await deleteDoc(doc(db, 'users', id));
  }

  static async getTrainers() {
    const q    = query(collection(db, 'users'), where('role', '==', 'trainer'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async getClientsByTrainer(trainerId) {
    const q = query(
      collection(db, 'users'),
      where('role',      '==', 'client'),
      where('trainerId', '==', trainerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  /* ---- ROUTINES ---- */
  static async getRoutinesByTrainer(trainerId) {
    const q = query(collection(db, 'routines'), where('trainerId', '==', trainerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  static async getRoutinesByClient(clientId) {
    const q = query(collection(db, 'routines'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async saveRoutine(routine) {
    const { id, ...data } = routine;
    if (id) {
      await setDoc(doc(db, 'routines', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'routines'), { ...data, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  static async deleteRoutine(id) {
    await deleteDoc(doc(db, 'routines', id));
  }

  /* ---- MEAL PLANS ---- */
  static async getMealPlansByTrainer(trainerId) {
    const q = query(collection(db, 'mealPlans'), where('trainerId', '==', trainerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  static async getMealPlansByClient(clientId) {
    const q = query(collection(db, 'mealPlans'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async saveMealPlan(plan) {
    const { id, ...data } = plan;
    if (id) {
      await setDoc(doc(db, 'mealPlans', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'mealPlans'), { ...data, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  static async deleteMealPlan(id) {
    await deleteDoc(doc(db, 'mealPlans', id));
  }

  static async getMealPlan(id) {
    const snap = await getDoc(doc(db, 'mealPlans', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  /* ---- MEASUREMENTS ---- */
  static async getMeasurementsByClient(clientId) {
    const q = query(collection(db, 'measurements'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static async saveMeasurement(m) {
    const { id, ...data } = m;
    if (id) {
      await setDoc(doc(db, 'measurements', id), data, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'measurements'), data);
      return ref.id;
    }
  }

  static async deleteMeasurement(id) {
    await deleteDoc(doc(db, 'measurements', id));
  }

  /* ---- DEMO DATA INITIALIZATION ---- */
  static async initDemoData() {
    // Run only once per browser
    if (localStorage.getItem('gtp_demo_v2')) return;

    console.log('⏳ Initializing demo data in Firebase...');
    const TRAINER_EMAIL  = 'trainer@gym.com';
    const CLIENT1_EMAIL  = 'juan@gmail.com';
    const CLIENT2_EMAIL  = 'maria@gmail.com';
    const DEMO_PASSWORD  = 'gym123';

    // Helper: get or create a Firebase Auth account (uses secondary app)
    async function getOrCreateAuth(email, password) {
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await signOut(secondaryAuth);
        return cred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(secondaryAuth, email, password);
          const uid  = cred.user.uid;
          await signOut(secondaryAuth);
          return uid;
        }
        throw e;
      }
    }

    try {
      const trainerId = await getOrCreateAuth(TRAINER_EMAIL, DEMO_PASSWORD);
      const client1Id = await getOrCreateAuth(CLIENT1_EMAIL, DEMO_PASSWORD);
      const client2Id = await getOrCreateAuth(CLIENT2_EMAIL, DEMO_PASSWORD);

      // Trainer doc
      const trainerDoc = await getDoc(doc(db, 'users', trainerId));
      if (!trainerDoc.exists()) {
        await setDoc(doc(db, 'users', trainerId), {
          role: 'trainer', name: 'Carlos García', email: TRAINER_EMAIL,
          phone: '+34 612 345 678', gym: 'FitPro Gym', avatar: '🏋️',
          specialty: 'Fuerza y Musculación', experience: '8 años',
          joinDate: '2018-03-01', color: 'avatar-purple',
        });
      }

      // Client 1 doc
      const c1doc = await getDoc(doc(db, 'users', client1Id));
      if (!c1doc.exists()) {
        await setDoc(doc(db, 'users', client1Id), {
          role: 'client', trainerId, name: 'Juan Martínez', email: CLIENT1_EMAIL,
          phone: '+34 611 111 111', avatar: '💪', age: 28,
          goal: 'Ganar masa muscular', level: 'Intermedio',
          joinDate: '2024-01-15', color: 'avatar-purple',
        });
      }

      // Client 2 doc
      const c2doc = await getDoc(doc(db, 'users', client2Id));
      if (!c2doc.exists()) {
        await setDoc(doc(db, 'users', client2Id), {
          role: 'client', trainerId, name: 'María López', email: CLIENT2_EMAIL,
          phone: '+34 622 222 222', avatar: '🧘', age: 32,
          goal: 'Perder peso y tonificar', level: 'Principiante',
          joinDate: '2024-02-01', color: 'avatar-pink',
        });
      }

      // Routines
      const existingRoutines = await getDocs(query(collection(db, 'routines'), where('trainerId', '==', trainerId)));
      if (existingRoutines.empty) {
        const emptySlot = () => ({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] });
        const emptyDay  = () => ({ desayuno: emptySlot(), mediaManana: emptySlot(), almuerzo: emptySlot(), merienda: emptySlot(), cena: emptySlot() });

        await addDoc(collection(db, 'routines'), {
          name: 'Rutina A - Empuje', clientId: client1Id, trainerId,
          daysOfWeek: ['lunes', 'jueves'],
          notes: 'Calentar 10min antes. Enfoque en técnica perfecta.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'press-banca',           name: 'Press Banca',               muscleGroup: 'pecho',    sets: 4, reps: '8-10',  rest: 90, weight: '70kg',  notes: 'Pausa de 1s abajo' },
            { id: uid(), exerciseId: 'press-inclinado',        name: 'Press Inclinado',            muscleGroup: 'pecho',    sets: 3, reps: '10-12', rest: 75, weight: '24kg',  notes: '' },
            { id: uid(), exerciseId: 'press-militar',          name: 'Press Militar',              muscleGroup: 'hombros',  sets: 3, reps: '10',    rest: 75, weight: '45kg',  notes: '' },
            { id: uid(), exerciseId: 'elevaciones-laterales',  name: 'Elevaciones Laterales',      muscleGroup: 'hombros',  sets: 3, reps: '15',    rest: 60, weight: '8kg',   notes: '' },
            { id: uid(), exerciseId: 'triceps-polea',          name: 'Extensión Tríceps en Polea', muscleGroup: 'brazos',   sets: 3, reps: '15',    rest: 45, weight: '25kg',  notes: '' },
          ],
        });

        await addDoc(collection(db, 'routines'), {
          name: 'Rutina B - Tirón', clientId: client1Id, trainerId,
          daysOfWeek: ['martes', 'viernes'],
          notes: 'Semana 1-2: peso moderado. Semana 3-4: aumentar 5%.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'dominadas',     name: 'Dominadas',              muscleGroup: 'espalda', sets: 4, reps: '6-8',   rest: 90, weight: 'Peso corporal', notes: '' },
            { id: uid(), exerciseId: 'remo-barra',    name: 'Remo con Barra',         muscleGroup: 'espalda', sets: 4, reps: '8-10',  rest: 90, weight: '60kg',          notes: '' },
            { id: uid(), exerciseId: 'jalon-polea',   name: 'Jalón en Polea Alta',    muscleGroup: 'espalda', sets: 3, reps: '12',    rest: 60, weight: '55kg',          notes: '' },
            { id: uid(), exerciseId: 'curl-biceps',   name: 'Curl Bíceps con Barra',  muscleGroup: 'brazos',  sets: 3, reps: '10-12', rest: 60, weight: '30kg',          notes: '' },
            { id: uid(), exerciseId: 'curl-martillo', name: 'Curl Martillo',          muscleGroup: 'brazos',  sets: 3, reps: '12',    rest: 60, weight: '14kg',          notes: '' },
          ],
        });

        await addDoc(collection(db, 'routines'), {
          name: 'Full Body - Tonificación', clientId: client2Id, trainerId,
          daysOfWeek: ['lunes', 'miercoles', 'viernes'],
          notes: 'Circuito con descanso mínimo entre ejercicios.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'sentadilla',  name: 'Sentadilla',          muscleGroup: 'piernas', sets: 3, reps: '15',      rest: 75, weight: '40kg',          notes: 'Técnica antes que peso' },
            { id: uid(), exerciseId: 'press-banca', name: 'Press Banca',         muscleGroup: 'pecho',   sets: 3, reps: '12',      rest: 60, weight: '30kg',          notes: '' },
            { id: uid(), exerciseId: 'jalon-polea', name: 'Jalón en Polea Alta', muscleGroup: 'espalda', sets: 3, reps: '12',      rest: 60, weight: '35kg',          notes: '' },
            { id: uid(), exerciseId: 'zancadas',    name: 'Zancadas',            muscleGroup: 'piernas', sets: 3, reps: '12 c/l', rest: 60, weight: 'Peso corporal', notes: '' },
            { id: uid(), exerciseId: 'plancha',     name: 'Plancha',             muscleGroup: 'core',    sets: 3, reps: '45 seg',  rest: 60, weight: '-',            notes: '' },
            { id: uid(), exerciseId: 'cinta',       name: 'Cinta de Correr',     muscleGroup: 'cardio',  sets: 1, reps: '20 min',  rest: 0,  weight: '-',            notes: '5 min calentamiento + 15 min cardio' },
          ],
        });

        // Meal plans
        await addDoc(collection(db, 'mealPlans'), {
          name: 'Plan Volumen - Juan', clientId: client1Id, trainerId,
          totalCalories: 3200,
          notes: 'Alta en proteínas para ganar masa muscular.',
          createdAt: serverTimestamp(),
          days: {
            lunes: {
              desayuno:    { name: 'Desayuno Energético', calories: 620, protein: 40, carbs: 72, fat: 18, foods: ['Avena 100g', '2 huevos + 4 claras', 'Plátano 1 ud', 'Leche semidesnatada 250ml', 'Almendras 20g'] },
              mediaManana: { name: 'Snack Pre-entreno',   calories: 380, protein: 30, carbs: 45, fat: 10, foods: ['Tortita de arroz x2', 'Atún al natural 120g', 'Manzana 1 ud'] },
              almuerzo:    { name: 'Almuerzo Completo',   calories: 850, protein: 60, carbs: 85, fat: 22, foods: ['Pollo a la plancha 200g', 'Arroz integral 150g', 'Brócoli 200g', 'Aceite de oliva 15ml'] },
              merienda:    { name: 'Merienda Proteica',   calories: 350, protein: 35, carbs: 30, fat: 9,  foods: ['Batido de proteínas 1 scoop', 'Leche desnatada 300ml', 'Plátano'] },
              cena:        { name: 'Cena Reparadora',     calories: 720, protein: 55, carbs: 65, fat: 20, foods: ['Salmón al horno 180g', 'Patata dulce 200g', 'Espinacas 150g', 'Yogur griego 0% 150g'] },
            },
            martes:    { desayuno: { name: 'Tortilla Proteica', calories: 580, protein: 42, carbs: 55, fat: 16, foods: ['Tortilla 4 huevos', 'Jamón york 60g', 'Tostadas centeno x2'] }, mediaManana: emptySlot(), almuerzo: { name: 'Pasta con Carne', calories: 880, protein: 58, carbs: 92, fat: 18, foods: ['Pasta integral 120g', 'Carne picada magra 150g', 'Tomate natural'] }, merienda: emptySlot(), cena: { name: 'Cena Ligera', calories: 650, protein: 50, carbs: 60, fat: 18, foods: ['Pechuga pavo 180g', 'Quinoa 100g', 'Judías verdes 200g'] } },
            miercoles: emptyDay(), jueves: emptyDay(), viernes: emptyDay(), sabado: emptyDay(), domingo: emptyDay(),
          },
        });

        await addDoc(collection(db, 'mealPlans'), {
          name: 'Plan Déficit - María', clientId: client2Id, trainerId,
          totalCalories: 1800,
          notes: 'Déficit moderado. Alta en proteínas para preservar músculo.',
          createdAt: serverTimestamp(),
          days: {
            lunes: {
              desayuno:    { name: 'Desayuno Saciante', calories: 380, protein: 25, carbs: 40, fat: 12, foods: ['Yogur griego 0% 200g', 'Granola sin azúcar 40g', 'Fresas 100g', 'Semillas de chía 10g'] },
              mediaManana: { name: 'Media Mañana',      calories: 180, protein: 15, carbs: 20, fat: 4,  foods: ['Manzana 1 ud', 'Pavo loncheado 60g'] },
              almuerzo:    { name: 'Almuerzo Ligero',   calories: 550, protein: 40, carbs: 50, fat: 14, foods: ['Pechuga de pollo 150g', 'Arroz basmati 80g', 'Verduras al vapor 300g'] },
              merienda:    { name: 'Merienda',          calories: 200, protein: 18, carbs: 22, fat: 5,  foods: ['Batido proteína 20g', 'Leche desnatada 200ml'] },
              cena:        { name: 'Cena Proteica',     calories: 430, protein: 38, carbs: 30, fat: 14, foods: ['Merluza al horno 180g', 'Batata 120g', 'Ensalada grande'] },
            },
            martes: emptyDay(), miercoles: emptyDay(), jueves: emptyDay(), viernes: emptyDay(), sabado: emptyDay(), domingo: emptyDay(),
          },
        });

        // Measurements – Juan
        const measBase = { clientId: client1Id };
        for (const m of [
          { ...measBase, date: '2024-01-15', weight: 76.5, height: 178, bodyFat: 18.5, chest: 98,  waist: 84, hips: 96, shoulders: 116, rightBicep: 35,   leftBicep: 34,   rightThigh: 57, leftThigh: 56, rightCalf: 37,   leftCalf: 36,   notes: 'Medición inicial' },
          { ...measBase, date: '2024-02-15', weight: 77.8, height: 178, bodyFat: 17.8, chest: 100, waist: 83, hips: 96, shoulders: 118, rightBicep: 36.5, leftBicep: 35.5, rightThigh: 58, leftThigh: 57, rightCalf: 37.5, leftCalf: 37,   notes: 'Mes 1: buena progresión' },
          { ...measBase, date: '2024-03-15', weight: 79.2, height: 178, bodyFat: 17.0, chest: 102, waist: 82, hips: 96, shoulders: 120, rightBicep: 37.5, leftBicep: 36.5, rightThigh: 59, leftThigh: 58, rightCalf: 38,   leftCalf: 37.5, notes: 'Mes 2: excelente en brazos' },
        ]) { await addDoc(collection(db, 'measurements'), m); }

        // Measurements – María
        for (const m of [
          { clientId: client2Id, date: '2024-02-01', weight: 68.0, height: 165, bodyFat: 28.0, chest: 90, waist: 75, hips: 100, shoulders: 108, rightBicep: 28,   leftBicep: 28,   rightThigh: 58, leftThigh: 58, rightCalf: 35,   leftCalf: 35,   notes: 'Medición inicial' },
          { clientId: client2Id, date: '2024-03-01', weight: 66.3, height: 165, bodyFat: 26.5, chest: 88, waist: 73, hips: 98,  shoulders: 107, rightBicep: 27.5, leftBicep: 27.5, rightThigh: 57, leftThigh: 57, rightCalf: 34.5, leftCalf: 34.5, notes: 'Mes 1: muy buena pérdida' },
        ]) { await addDoc(collection(db, 'measurements'), m); }
      }

      localStorage.setItem('gtp_demo_v2', '1');
      console.log('✅ Demo data initialized in Firebase');
    } catch (err) {
      console.warn('Demo init warning:', err.message);
      localStorage.setItem('gtp_demo_v2', '1'); // prevent infinite retry
    }
  }
}
export const EXERCISE_LIBRARY = {
  pecho:
  {
    label: 'Pecho', icon: '🫁', color: 'var(--pecho)',
    exercises: [
		]
  },
  espalda:
  {
    label: 'Espalda', icon: '🔙', color: 'var(--espalda)',
    exercises: [
		]
  },
  piernas:
  {
    label: 'Piernas', icon: '🦵', color: 'var(--piernas)',
    exercises: [
		]
  },
  hombros:
  {
    label: 'Hombros', icon: '💪', color: 'var(--hombros)',
    exercises: [
		]
  },
  brazos:
  {
    label: 'Brazos', icon: '🦾', color: 'var(--brazos)',
    exercises: [
		]
  },
  core:
  {
    label: 'Core / Abdomen', icon: '🎯', color: 'var(--core)',
    exercises: [
		]
  },
  cardio:
  {
    label: 'Cardio', icon: '🏃', color: 'var(--cardio)',
    exercises: [
		]
  }
};
/* ===================================================
   GymTrainer Pro - Data Layer (Firestore)
   =================================================== */

import { db, secondaryAuth }  from './firebase.js';
import {
  doc, getDoc, getDocs, setDoc, addDoc, deleteDoc,
  collection, query, where, serverTimestamp,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
} from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';

// ── Unique ID (used only for sub-objects, not Firestore docs) ────
export function uid() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2);
}

// ── Exercise Library ─────────────────────────────────────────────

export const MEAL_SLOTS = [
  { key: 'desayuno',    label: 'Desayuno',      icon: '☀️', time: '7:00 - 8:00 AM'  },
  { key: 'mediaManana', label: 'Media Mañana',  icon: '🍎', time: '10:00 - 11:00 AM' },
  { key: 'almuerzo',    label: 'Almuerzo',      icon: '🍽️', time: '1:00 - 2:30 PM'  },
  { key: 'merienda',    label: 'Merienda',      icon: '🥜', time: '5:00 - 6:00 PM'  },
  { key: 'cena',        label: 'Cena',          icon: '🌙', time: '8:00 - 9:00 PM'  },
];

export const DAYS_OF_WEEK = [
  { key: 'lunes',     label: 'Lunes',     short: 'L', num: 1 },
  { key: 'martes',    label: 'Martes',    short: 'M', num: 2 },
  { key: 'miercoles', label: 'Miércoles', short: 'X', num: 3 },
  { key: 'jueves',    label: 'Jueves',    short: 'J', num: 4 },
  { key: 'viernes',   label: 'Viernes',   short: 'V', num: 5 },
  { key: 'sabado',    label: 'Sábado',    short: 'S', num: 6 },
  { key: 'domingo',   label: 'Domingo',   short: 'D', num: 0 },
];

// ── Async DB class (Firestore) ───────────────────────────────────
export class DB {

  /* ---- USERS ---- */
  static async getUser(id) {
    const snap = await getDoc(doc(db, 'users', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  static async saveUser(user) {
    const { id, ...data } = user;
    await setDoc(doc(db, 'users', id), data, { merge: true });
  }

  static async deleteUser(id) {
    await deleteDoc(doc(db, 'users', id));
  }

  static async getTrainers() {
    const q    = query(collection(db, 'users'), where('role', '==', 'trainer'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async getClientsByTrainer(trainerId) {
    const q = query(
      collection(db, 'users'),
      where('role',      '==', 'client'),
      where('trainerId', '==', trainerId)
    );
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  /* ---- ROUTINES ---- */
  static async getRoutinesByTrainer(trainerId) {
    const q = query(collection(db, 'routines'), where('trainerId', '==', trainerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  static async getRoutinesByClient(clientId) {
    const q = query(collection(db, 'routines'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async saveRoutine(routine) {
    const { id, ...data } = routine;
    if (id) {
      await setDoc(doc(db, 'routines', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'routines'), { ...data, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  static async deleteRoutine(id) {
    await deleteDoc(doc(db, 'routines', id));
  }

  /* ---- MEAL PLANS ---- */
  static async getMealPlansByTrainer(trainerId) {
    const q = query(collection(db, 'mealPlans'), where('trainerId', '==', trainerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  static async getMealPlansByClient(clientId) {
    const q = query(collection(db, 'mealPlans'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  }

  static async saveMealPlan(plan) {
    const { id, ...data } = plan;
    if (id) {
      await setDoc(doc(db, 'mealPlans', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'mealPlans'), { ...data, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  static async deleteMealPlan(id) {
    await deleteDoc(doc(db, 'mealPlans', id));
  }

  static async getMealPlan(id) {
    const snap = await getDoc(doc(db, 'mealPlans', id));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  /* ---- MEASUREMENTS ---- */
  static async getMeasurementsByClient(clientId) {
    const q = query(collection(db, 'measurements'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static async saveMeasurement(m) {
    const { id, ...data } = m;
    if (id) {
      await setDoc(doc(db, 'measurements', id), data, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'measurements'), data);
      return ref.id;
    }
  }

  static async deleteMeasurement(id) {
    await deleteDoc(doc(db, 'measurements', id));
  }

  /* ---- DEMO DATA INITIALIZATION ---- */
  static async initDemoData() {
    // Run only once per browser
    if (localStorage.getItem('gtp_demo_v2')) return;

    console.log('⏳ Initializing demo data in Firebase...');
    const TRAINER_EMAIL  = 'trainer@gym.com';
    const CLIENT1_EMAIL  = 'juan@gmail.com';
    const CLIENT2_EMAIL  = 'maria@gmail.com';
    const DEMO_PASSWORD  = 'gym123';

    // Helper: get or create a Firebase Auth account (uses secondary app)
    async function getOrCreateAuth(email, password) {
      try {
        const cred = await createUserWithEmailAndPassword(secondaryAuth, email, password);
        await signOut(secondaryAuth);
        return cred.user.uid;
      } catch (e) {
        if (e.code === 'auth/email-already-in-use') {
          const cred = await signInWithEmailAndPassword(secondaryAuth, email, password);
          const uid  = cred.user.uid;
          await signOut(secondaryAuth);
          return uid;
        }
        throw e;
      }
    }

    try {
      const trainerId = await getOrCreateAuth(TRAINER_EMAIL, DEMO_PASSWORD);
      const client1Id = await getOrCreateAuth(CLIENT1_EMAIL, DEMO_PASSWORD);
      const client2Id = await getOrCreateAuth(CLIENT2_EMAIL, DEMO_PASSWORD);

      // Trainer doc
      const trainerDoc = await getDoc(doc(db, 'users', trainerId));
      if (!trainerDoc.exists()) {
        await setDoc(doc(db, 'users', trainerId), {
          role: 'trainer', name: 'Carlos García', email: TRAINER_EMAIL,
          phone: '+34 612 345 678', gym: 'FitPro Gym', avatar: '🏋️',
          specialty: 'Fuerza y Musculación', experience: '8 años',
          joinDate: '2018-03-01', color: 'avatar-purple',
        });
      }

      // Client 1 doc
      const c1doc = await getDoc(doc(db, 'users', client1Id));
      if (!c1doc.exists()) {
        await setDoc(doc(db, 'users', client1Id), {
          role: 'client', trainerId, name: 'Juan Martínez', email: CLIENT1_EMAIL,
          phone: '+34 611 111 111', avatar: '💪', age: 28,
          goal: 'Ganar masa muscular', level: 'Intermedio',
          joinDate: '2024-01-15', color: 'avatar-purple',
        });
      }

      // Client 2 doc
      const c2doc = await getDoc(doc(db, 'users', client2Id));
      if (!c2doc.exists()) {
        await setDoc(doc(db, 'users', client2Id), {
          role: 'client', trainerId, name: 'María López', email: CLIENT2_EMAIL,
          phone: '+34 622 222 222', avatar: '🧘', age: 32,
          goal: 'Perder peso y tonificar', level: 'Principiante',
          joinDate: '2024-02-01', color: 'avatar-pink',
        });
      }

      // Routines
      const existingRoutines = await getDocs(query(collection(db, 'routines'), where('trainerId', '==', trainerId)));
      if (existingRoutines.empty) {
        const emptySlot = () => ({ name: '', calories: 0, protein: 0, carbs: 0, fat: 0, foods: [] });
        const emptyDay  = () => ({ desayuno: emptySlot(), mediaManana: emptySlot(), almuerzo: emptySlot(), merienda: emptySlot(), cena: emptySlot() });

        await addDoc(collection(db, 'routines'), {
          name: 'Rutina A - Empuje', clientId: client1Id, trainerId,
          daysOfWeek: ['lunes', 'jueves'],
          notes: 'Calentar 10min antes. Enfoque en técnica perfecta.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'press-banca',           name: 'Press Banca',               muscleGroup: 'pecho',    sets: 4, reps: '8-10',  rest: 90, weight: '70kg',  notes: 'Pausa de 1s abajo' },
            { id: uid(), exerciseId: 'press-inclinado',        name: 'Press Inclinado',            muscleGroup: 'pecho',    sets: 3, reps: '10-12', rest: 75, weight: '24kg',  notes: '' },
            { id: uid(), exerciseId: 'press-militar',          name: 'Press Militar',              muscleGroup: 'hombros',  sets: 3, reps: '10',    rest: 75, weight: '45kg',  notes: '' },
            { id: uid(), exerciseId: 'elevaciones-laterales',  name: 'Elevaciones Laterales',      muscleGroup: 'hombros',  sets: 3, reps: '15',    rest: 60, weight: '8kg',   notes: '' },
            { id: uid(), exerciseId: 'triceps-polea',          name: 'Extensión Tríceps en Polea', muscleGroup: 'brazos',   sets: 3, reps: '15',    rest: 45, weight: '25kg',  notes: '' },
          ],
        });

        await addDoc(collection(db, 'routines'), {
          name: 'Rutina B - Tirón', clientId: client1Id, trainerId,
          daysOfWeek: ['martes', 'viernes'],
          notes: 'Semana 1-2: peso moderado. Semana 3-4: aumentar 5%.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'dominadas',     name: 'Dominadas',              muscleGroup: 'espalda', sets: 4, reps: '6-8',   rest: 90, weight: 'Peso corporal', notes: '' },
            { id: uid(), exerciseId: 'remo-barra',    name: 'Remo con Barra',         muscleGroup: 'espalda', sets: 4, reps: '8-10',  rest: 90, weight: '60kg',          notes: '' },
            { id: uid(), exerciseId: 'jalon-polea',   name: 'Jalón en Polea Alta',    muscleGroup: 'espalda', sets: 3, reps: '12',    rest: 60, weight: '55kg',          notes: '' },
            { id: uid(), exerciseId: 'curl-biceps',   name: 'Curl Bíceps con Barra',  muscleGroup: 'brazos',  sets: 3, reps: '10-12', rest: 60, weight: '30kg',          notes: '' },
            { id: uid(), exerciseId: 'curl-martillo', name: 'Curl Martillo',          muscleGroup: 'brazos',  sets: 3, reps: '12',    rest: 60, weight: '14kg',          notes: '' },
          ],
        });

        await addDoc(collection(db, 'routines'), {
          name: 'Full Body - Tonificación', clientId: client2Id, trainerId,
          daysOfWeek: ['lunes', 'miercoles', 'viernes'],
          notes: 'Circuito con descanso mínimo entre ejercicios.',
          createdAt: serverTimestamp(),
          exercises: [
            { id: uid(), exerciseId: 'sentadilla',  name: 'Sentadilla',          muscleGroup: 'piernas', sets: 3, reps: '15',      rest: 75, weight: '40kg',          notes: 'Técnica antes que peso' },
            { id: uid(), exerciseId: 'press-banca', name: 'Press Banca',         muscleGroup: 'pecho',   sets: 3, reps: '12',      rest: 60, weight: '30kg',          notes: '' },
            { id: uid(), exerciseId: 'jalon-polea', name: 'Jalón en Polea Alta', muscleGroup: 'espalda', sets: 3, reps: '12',      rest: 60, weight: '35kg',          notes: '' },
            { id: uid(), exerciseId: 'zancadas',    name: 'Zancadas',            muscleGroup: 'piernas', sets: 3, reps: '12 c/l', rest: 60, weight: 'Peso corporal', notes: '' },
            { id: uid(), exerciseId: 'plancha',     name: 'Plancha',             muscleGroup: 'core',    sets: 3, reps: '45 seg',  rest: 60, weight: '-',            notes: '' },
            { id: uid(), exerciseId: 'cinta',       name: 'Cinta de Correr',     muscleGroup: 'cardio',  sets: 1, reps: '20 min',  rest: 0,  weight: '-',            notes: '5 min calentamiento + 15 min cardio' },
          ],
        });

        // Meal plans
        await addDoc(collection(db, 'mealPlans'), {
          name: 'Plan Volumen - Juan', clientId: client1Id, trainerId,
          totalCalories: 3200,
          notes: 'Alta en proteínas para ganar masa muscular.',
          createdAt: serverTimestamp(),
          days: {
            lunes: {
              desayuno:    { name: 'Desayuno Energético', calories: 620, protein: 40, carbs: 72, fat: 18, foods: ['Avena 100g', '2 huevos + 4 claras', 'Plátano 1 ud', 'Leche semidesnatada 250ml', 'Almendras 20g'] },
              mediaManana: { name: 'Snack Pre-entreno',   calories: 380, protein: 30, carbs: 45, fat: 10, foods: ['Tortita de arroz x2', 'Atún al natural 120g', 'Manzana 1 ud'] },
              almuerzo:    { name: 'Almuerzo Completo',   calories: 850, protein: 60, carbs: 85, fat: 22, foods: ['Pollo a la plancha 200g', 'Arroz integral 150g', 'Brócoli 200g', 'Aceite de oliva 15ml'] },
              merienda:    { name: 'Merienda Proteica',   calories: 350, protein: 35, carbs: 30, fat: 9,  foods: ['Batido de proteínas 1 scoop', 'Leche desnatada 300ml', 'Plátano'] },
              cena:        { name: 'Cena Reparadora',     calories: 720, protein: 55, carbs: 65, fat: 20, foods: ['Salmón al horno 180g', 'Patata dulce 200g', 'Espinacas 150g', 'Yogur griego 0% 150g'] },
            },
            martes:    { desayuno: { name: 'Tortilla Proteica', calories: 580, protein: 42, carbs: 55, fat: 16, foods: ['Tortilla 4 huevos', 'Jamón york 60g', 'Tostadas centeno x2'] }, mediaManana: emptySlot(), almuerzo: { name: 'Pasta con Carne', calories: 880, protein: 58, carbs: 92, fat: 18, foods: ['Pasta integral 120g', 'Carne picada magra 150g', 'Tomate natural'] }, merienda: emptySlot(), cena: { name: 'Cena Ligera', calories: 650, protein: 50, carbs: 60, fat: 18, foods: ['Pechuga pavo 180g', 'Quinoa 100g', 'Judías verdes 200g'] } },
            miercoles: emptyDay(), jueves: emptyDay(), viernes: emptyDay(), sabado: emptyDay(), domingo: emptyDay(),
          },
        });

        await addDoc(collection(db, 'mealPlans'), {
          name: 'Plan Déficit - María', clientId: client2Id, trainerId,
          totalCalories: 1800,
          notes: 'Déficit moderado. Alta en proteínas para preservar músculo.',
          createdAt: serverTimestamp(),
          days: {
            lunes: {
              desayuno:    { name: 'Desayuno Saciante', calories: 380, protein: 25, carbs: 40, fat: 12, foods: ['Yogur griego 0% 200g', 'Granola sin azúcar 40g', 'Fresas 100g', 'Semillas de chía 10g'] },
              mediaManana: { name: 'Media Mañana',      calories: 180, protein: 15, carbs: 20, fat: 4,  foods: ['Manzana 1 ud', 'Pavo loncheado 60g'] },
              almuerzo:    { name: 'Almuerzo Ligero',   calories: 550, protein: 40, carbs: 50, fat: 14, foods: ['Pechuga de pollo 150g', 'Arroz basmati 80g', 'Verduras al vapor 300g'] },
              merienda:    { name: 'Merienda',          calories: 200, protein: 18, carbs: 22, fat: 5,  foods: ['Batido proteína 20g', 'Leche desnatada 200ml'] },
              cena:        { name: 'Cena Proteica',     calories: 430, protein: 38, carbs: 30, fat: 14, foods: ['Merluza al horno 180g', 'Batata 120g', 'Ensalada grande'] },
            },
            martes: emptyDay(), miercoles: emptyDay(), jueves: emptyDay(), viernes: emptyDay(), sabado: emptyDay(), domingo: emptyDay(),
          },
        });

        // Measurements – Juan
        const measBase = { clientId: client1Id };
        for (const m of [
          { ...measBase, date: '2024-01-15', weight: 76.5, height: 178, bodyFat: 18.5, chest: 98,  waist: 84, hips: 96, shoulders: 116, rightBicep: 35,   leftBicep: 34,   rightThigh: 57, leftThigh: 56, rightCalf: 37,   leftCalf: 36,   notes: 'Medición inicial' },
          { ...measBase, date: '2024-02-15', weight: 77.8, height: 178, bodyFat: 17.8, chest: 100, waist: 83, hips: 96, shoulders: 118, rightBicep: 36.5, leftBicep: 35.5, rightThigh: 58, leftThigh: 57, rightCalf: 37.5, leftCalf: 37,   notes: 'Mes 1: buena progresión' },
          { ...measBase, date: '2024-03-15', weight: 79.2, height: 178, bodyFat: 17.0, chest: 102, waist: 82, hips: 96, shoulders: 120, rightBicep: 37.5, leftBicep: 36.5, rightThigh: 59, leftThigh: 58, rightCalf: 38,   leftCalf: 37.5, notes: 'Mes 2: excelente en brazos' },
        ]) { await addDoc(collection(db, 'measurements'), m); }

        // Measurements – María
        for (const m of [
          { clientId: client2Id, date: '2024-02-01', weight: 68.0, height: 165, bodyFat: 28.0, chest: 90, waist: 75, hips: 100, shoulders: 108, rightBicep: 28,   leftBicep: 28,   rightThigh: 58, leftThigh: 58, rightCalf: 35,   leftCalf: 35,   notes: 'Medición inicial' },
          { clientId: client2Id, date: '2024-03-01', weight: 66.3, height: 165, bodyFat: 26.5, chest: 88, waist: 73, hips: 98,  shoulders: 107, rightBicep: 27.5, leftBicep: 27.5, rightThigh: 57, leftThigh: 57, rightCalf: 34.5, leftCalf: 34.5, notes: 'Mes 1: muy buena pérdida' },
        ]) { await addDoc(collection(db, 'measurements'), m); }
      }

      localStorage.setItem('gtp_demo_v2', '1');
      console.log('✅ Demo data initialized in Firebase');
    } catch (err) {
      console.warn('Demo init warning:', err.message);
      localStorage.setItem('gtp_demo_v2', '1'); // prevent infinite retry
    }
  }
}
