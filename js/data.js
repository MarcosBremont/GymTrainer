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
export const EXERCISE_LIBRARY = {
  pecho: {
    label: 'Pecho', icon: '\uD83E\uDEC1', color: 'var(--pecho)',
    exercises: [
      { id: 'press-de-banca-plano-con-barra', name: 'Press de banca plano con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-inclinado-con-barra', name: 'Press de banca inclinado con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-declinado-con-barra', name: 'Press de banca declinado con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-plano-con-mancuernas', name: 'Press de banca plano con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-inclinado-con-mancuernas', name: 'Press de banca inclinado con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-declinado-con-mancuernas', name: 'Press de banca declinado con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-en-maquina-smith', name: 'Press de banca en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-inclinado-en-maquina-smith', name: 'Press inclinado en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-declinado-en-maquina-smith', name: 'Press declinado en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-pecho-en-maquina-convergente-sentado', name: 'Press de pecho en máquina convergente sentado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-inclinado-en-maquina-convergente', name: 'Press inclinado en máquina convergente', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-declinado-en-maquina-convergente', name: 'Press declinado en máquina convergente', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-suelo-floor-press-con-barra', name: 'Press de suelo (Floor Press) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-suelo-con-mancuernas', name: 'Press de suelo con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-suelo-a-una-mano-con-kettlebell', name: 'Press de suelo a una mano con kettlebell', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-guillotina-al-cuello-con-barra', name: 'Press guillotina al cuello con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-hexagonal-squeeze-press-con-mancuernas', name: 'Press Hexagonal (Squeeze press) con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-hexagonal-inclinado-con-mancuernas', name: 'Press Hexagonal inclinado con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-flyes-planas-con-mancuernas', name: 'Aperturas (Flyes) planas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-inclinadas-con-mancuernas', name: 'Aperturas inclinadas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-declinadas-con-mancuernas', name: 'Aperturas declinadas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-en-maquina-peck-deck', name: 'Aperturas en máquina (Peck Deck)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-en-polea-baja-en-banco-plano', name: 'Aperturas en polea baja en banco plano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-en-polea-baja-en-banco-inclinado', name: 'Aperturas en polea baja en banco inclinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-de-cables-en-polea-alta-hacia-abajo', name: 'Cruces de cables en polea alta (hacia abajo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-de-cables-en-polea-media-hacia-el-frente', name: 'Cruces de cables en polea media (hacia el frente)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-de-cables-en-polea-baja-hacia-arriba', name: 'Cruces de cables en polea baja (hacia arriba)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-de-cables-a-una-mano-en-polea', name: 'Cruces de cables a una mano en polea', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pullover-con-mancuerna-en-banco-plano', name: 'Pullover con mancuerna en banco plano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pullover-con-barra-recta', name: 'Pullover con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pullover-con-barra-ez', name: 'Pullover con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-en-paralelas-dips-con-peso-corporal', name: 'Fondos en paralelas (Dips) con peso corporal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-en-paralelas-lastrados', name: 'Fondos en paralelas lastrados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-en-anillas', name: 'Fondos en anillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-en-maquina-asistida', name: 'Fondos en máquina asistida', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-de-fondos-sentado-dip-machine', name: 'Máquina de fondos sentado (Dip machine)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-de-pecho-push-ups-clasicas', name: 'Flexiones de pecho (Push-ups) clásicas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-diamante-manos-juntas', name: 'Flexiones diamante (manos juntas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-abiertas-brazos-separados', name: 'Flexiones abiertas (brazos separados)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-con-palmada-pliometricas', name: 'Flexiones con palmada (Pliométricas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-asimetricas-una-mano-adelantada', name: 'Flexiones asimétricas (una mano adelantada)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-del-arquero-archer-push-ups', name: 'Flexiones del arquero (Archer push-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-a-una-mano', name: 'Flexiones a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-en-anillas-o-trx', name: 'Flexiones en anillas o TRX', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-con-banda-de-resistencia', name: 'Flexiones con banda de resistencia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-con-deficit-manos-en-discos-o-bloques', name: 'Flexiones con déficit (manos en discos o bloques)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-spiderman', name: 'Flexiones Spiderman', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-pecho-unilateral-con-banda-elastica', name: 'Press de pecho unilateral con banda elástica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-agarre-inverso', name: 'Press de banca agarre inverso', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-con-cadenas-o-bandas-elasticas', name: 'Aperturas con cadenas o bandas elásticas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-con-bandas-de-resistencia-ancladas', name: 'Cruces con bandas de resistencia ancladas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-pecho-en-maquina-de-palanca-a-una-mano', name: 'Press de pecho en máquina de palanca a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-en-parada-de-manos-handstand-push-ups-asistidas', name: 'Flexiones en parada de manos (Handstand push-ups) asistidas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-isometrico-contra-pines', name: 'Press de banca isométrico contra pines', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aperturas-deslizantes-en-el-suelo-con-toallas-o-discos-deslizantes', name: 'Aperturas deslizantes en el suelo (con toallas o discos deslizantes)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-pecho-con-kettlebells-con-las-bases-hacia-arriba-bottoms-up', name: 'Press de pecho con kettlebells con las bases hacia arriba (Bottoms-up)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
    ]
  },
  espalda: {
    label: 'Espalda', icon: '\uD83D\uDD19', color: 'var(--espalda)',
    exercises: [
      { id: 'dominadas-abiertas-pull-ups', name: 'Dominadas abiertas (Pull-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-abiertas-lastradas', name: 'Dominadas abiertas lastradas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-supinas-chin-ups', name: 'Dominadas supinas (Chin-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-supinas-lastradas', name: 'Dominadas supinas lastradas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-con-agarre-neutro', name: 'Dominadas con agarre neutro', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-con-agarre-estrecho', name: 'Dominadas con agarre estrecho', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-en-anillas', name: 'Dominadas en anillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-asistidas-con-banda-elastica', name: 'Dominadas asistidas con banda elástica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-en-maquina-asistida', name: 'Dominadas en máquina asistida', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-a-una-mano-o-asistidas-a-una-mano', name: 'Dominadas a una mano (o asistidas a una mano)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-excentricas-negativas', name: 'Dominadas excéntricas (negativas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-al-pecho-con-polea-ancha-barra-recta', name: 'Jalón al pecho con polea ancha (barra recta)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-al-pecho-con-agarre-supino-estrecho', name: 'Jalón al pecho con agarre supino estrecho', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-al-pecho-con-agarre-neutro-triangulo', name: 'Jalón al pecho con agarre neutro (triángulo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-al-pecho-con-agarre-v-ancho', name: 'Jalón al pecho con agarre V ancho', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-tras-nuca-con-polea-requiere-buena-movilidad', name: 'Jalón tras nuca con polea (requiere buena movilidad)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-al-pecho-unilateral-en-polea-alta', name: 'Jalón al pecho unilateral en polea alta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-con-brazos-rectos-straight-arm-pulldown-con-barra', name: 'Jalón con brazos rectos (Straight-arm pulldown) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-con-brazos-rectos-con-cuerda', name: 'Jalón con brazos rectos con cuerda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-barra-convencional-inclinado', name: 'Remo con barra convencional (inclinado)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-barra-agarre-supino-yates-row', name: 'Remo con barra agarre supino (Yates Row)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-pendlay-desde-el-suelo-en-cada-repeticion', name: 'Remo Pendlay (desde el suelo en cada repetición)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-mancuerna-a-una-mano-apoyado-en-banco', name: 'Remo con mancuerna a una mano apoyado en banco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-dos-mancuernas-inclinado', name: 'Remo con dos mancuernas inclinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-barra-t-con-soporte-para-pecho', name: 'Remo en barra T (con soporte para pecho)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-barra-t-libre-agarre-estrecho', name: 'Remo en barra T (libre, agarre estrecho)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-barra-t-libre-agarre-ancho', name: 'Remo en barra T (libre, agarre ancho)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-polea-baja-con-triangulo-agarre-estrecho', name: 'Remo en polea baja con triángulo (agarre estrecho)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-polea-baja-con-barra-recta-agarre-ancho', name: 'Remo en polea baja con barra recta (agarre ancho)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-polea-baja-a-una-mano', name: 'Remo en polea baja a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-maquina-sentado-agarre-prono', name: 'Remo en máquina sentado (agarre prono)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-maquina-sentado-agarre-neutro', name: 'Remo en máquina sentado (agarre neutro)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-unilateral-en-maquina-convergente', name: 'Remo unilateral en máquina convergente', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-meadows-con-un-extremo-de-la-barra', name: 'Remo Meadows (con un extremo de la barra)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-renegado-renegade-row-con-mancuernas', name: 'Remo renegado (Renegade Row) con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-invertido-australian-pull-ups-en-barra-smith', name: 'Remo invertido (Australian pull-ups) en barra Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-invertido-en-trx-o-anillas', name: 'Remo invertido en TRX o anillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-mancuernas-recostado-boca-abajo-en-banco-inclinado-seal-row', name: 'Remo con mancuernas recostado boca abajo en banco inclinado (Seal Row)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-con-barra-recostado-en-banco-alto-cambered-bar-row', name: 'Remo con barra recostado en banco alto (Cambered bar row)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pullover-en-polea-alta-recostado-en-banco', name: 'Pullover en polea alta recostado en banco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pullover-en-maquina-nautilus', name: 'Pullover en máquina Nautilus', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'jalon-unilateral-en-polea-alta-de-rodillas', name: 'Jalón unilateral en polea alta de rodillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'shrugs-con-mancuernas', name: 'Shrugs con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'shrugs-en-maquina-smith', name: 'Shrugs en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'shrugs-con-barra-hexagonal-trap-bar', name: 'Shrugs con barra hexagonal (Trap bar)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'shrugs-en-polea-baja', name: 'Shrugs en polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'shrugs-por-detras-de-la-espalda-con-barra', name: 'Shrugs por detrás de la espalda con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-en-y-tumbado-boca-abajo', name: 'Elevaciones en Y tumbado boca abajo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'face-pull-en-polea-alta-con-cuerda', name: 'Face pull en polea alta con cuerda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'face-pull-sentado-en-polea-baja', name: 'Face pull sentado en polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-convencional-con-barra', name: 'Peso muerto convencional con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-en-maquina-smith', name: 'Peso muerto en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-con-barra-hexagonal', name: 'Peso muerto con barra hexagonal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hiperextensiones-en-banco-a-45-grados', name: 'Hiperextensiones en banco a 45 grados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hiperextensiones-a-90-grados-silla-romana', name: 'Hiperextensiones a 90 grados (Silla romana)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hiperextensiones-con-disco-lastrado', name: 'Hiperextensiones con disco lastrado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-espalda-en-maquina-sentada', name: 'Extensión de espalda en máquina sentada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'buenos-dias-good-mornings-con-barra-libre', name: 'Buenos días (Good mornings) con barra libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'buenos-dias-en-maquina-smith', name: 'Buenos días en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'buenos-dias-sentado-con-barra', name: 'Buenos días sentado con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'superman-en-el-suelo-elevacion-de-brazos-y-piernas', name: 'Supermán en el suelo (elevación de brazos y piernas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-gorila-con-kettlebells', name: 'Remo Gorila con kettlebells', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'paseo-del-granjero-farmer-s-walk-pesado', name: 'Paseo del granjero (Farmer\'s walk) pesado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-desde-bloques-rack-pulls', name: 'Peso muerto desde bloques (Rack Pulls)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
    ]
  },
  piernas: {
    label: 'Piernas', icon: '\uD83E\uDDB5', color: 'var(--piernas)',
    exercises: [
      // Cuádriceps y sentadillas
      { id: 'sentadillas-con-barra', name: 'Sentadillas con barra', sets: 3, reps: '8-10', rest: 90, instructions: '' },
      { id: 'sentadillas-frontales-con-barra', name: 'Sentadillas frontales con barra', sets: 3, reps: '8-10', rest: 90, instructions: '' },
      { id: 'sentadillas-bulgarian-split-squats-con-mancuernas', name: 'Sentadillas búlgaras (Split squats) con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadillas-con-mancuernas', name: 'Sentadillas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadillas-sissy-squats', name: 'Sentadillas Sissy', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-leg-press', name: 'Prensa de piernas (Leg press)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-45-grados', name: 'Prensa de piernas 45 grados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-horizontal', name: 'Prensa de piernas horizontal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuadriceps-en-maquina', name: 'Extensiones de cuádriceps en máquina', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'step-ups-con-mancuernas', name: 'Step-ups con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lunges-caminando-con-mancuernas', name: 'Lunges caminando con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lunges-estaticos-con-mancuernas', name: 'Lunges estáticos con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hack-squats-en-maquina', name: 'Hack squats en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },

      // Isquiotibiales (hamstrings)
      { id: 'curl-de-piernas-hamstrings-en-maquina', name: 'Curl de piernas (hamstrings) en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-piernas-acostado-con-mancuerna', name: 'Curl de piernas acostado con mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-piernas-de-pie-con-mancuerna', name: 'Curl de piernas de pie con mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-con-barra', name: 'Peso muerto rumano con barra', sets: 3, reps: '8-10', rest: 90, instructions: '' },
      { id: 'peso-muerto-con-mancuernas', name: 'Peso muerto con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'buenos-dias-con-barra', name: 'Buenos días con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-glute-bridge-con-barra', name: 'Hip thrust (Glute bridge) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-con-mancuerna', name: 'Hip thrust con mancuerna', sets: 3, reps: '12-15', rest: 60, instructions: '' },

      // Peso muerto completo
      { id: 'peso-muerto-con-barra', name: 'Peso muerto con barra', sets: 3, reps: '5-8', rest: 120, instructions: '' },
      { id: 'peso-muerto-con-mancuernas', name: 'Peso muerto con mancuernas', sets: 3, reps: '8-10', rest: 90, instructions: '' },
      { id: 'peso-muerto-sum-cero-trap-bar', name: 'Peso muerto sumo cero (Trap bar)', sets: 3, reps: '8-10', rest: 90, instructions: '' },

      // Pantorrillas (gemelos) - estos ya estaban
      { id: 'elevacion-de-talones-de-pie-en-maquina', name: 'Elevación de talones de pie en máquina', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-de-pie-con-barra-libre', name: 'Elevación de talones de pie con barra libre', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-maquina-smith-sobre-un-step', name: 'Elevación de talones en máquina Smith (sobre un step)', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-a-una-pierna-con-mancuerna', name: 'Elevación de talones a una pierna con mancuerna', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-sentado-con-barra-sobre-las-rodillas', name: 'Elevación de talones sentado con barra sobre las rodillas', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-sentado-con-mancuernas-sobre-rodillas', name: 'Elevación de talones sentado con mancuernas sobre rodillas', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-prensa-de-piernas-a-45-grados', name: 'Elevación de talones en prensa de piernas a 45 grados', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-prensa-horizontal', name: 'Elevación de talones en prensa horizontal', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-donkey-calf-raises-en-maquina', name: 'Elevación de talones tipo burro (Donkey calf raises) en máquina', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-libre-con-companero-encima', name: 'Elevación de talones tipo burro libre (con compañero encima)', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-en-maquina-smith-flexionado-a-90', name: 'Elevación de talones tipo burro en máquina Smith (flexionado a 90º)', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talones-de-pie-con-puntas-hacia-adentro', name: 'Elevaciones de talones de pie con puntas hacia adentro', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talones-de-pie-con-puntas-hacia-afuera', name: 'Elevaciones de talones de pie con puntas hacia afuera', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'andar-de-puntillas-con-mancuernas-pesadas', name: 'Andar de puntillas con mancuernas pesadas', sets: 3, reps: '20-30', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-excentrica-a-una-pierna-en-escalon', name: 'Elevación de talones excéntrica a una pierna en escalón', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'maquina-de-pantorrillas-rotatoria-rotary-calf-machine', name: 'Máquina de pantorrillas rotatoria (Rotary calf machine)', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-banda-de-resistencia', name: 'Elevaciones tibiales con banda de resistencia', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-apoyado-de-espaldas-a-la-pared', name: 'Elevaciones tibiales apoyado de espaldas a la pared', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'maquina-de-elevacion-tibial-sentada', name: 'Máquina de elevación tibial sentada', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-barra-tib-tib-bar', name: 'Elevaciones tibiales con barra Tib (Tib bar)', sets: 3, reps: '12-15', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-kettlebell-en-la-punta-del-pie', name: 'Elevaciones tibiales con kettlebell en la punta del pie', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talon-en-sentadilla-profunda-sissy-calf-raises', name: 'Elevaciones de talón en sentadilla profunda (Sissy calf raises)', sets: 3, reps: '15-20', rest: 60, instructions: '' },
      { id: 'pasos-de-ganso-caminar-sobre-los-talones', name: 'Pasos de ganso (caminar sobre los talones)', sets: 3, reps: '20-30', rest: 60, instructions: '' },
    ]
  },
  hombros: {
    label: 'Hombros', icon: '\uD83D\uDCAA', color: 'var(--hombros)',
    exercises: [
      { id: 'press-militar-de-pie-con-barra-ohp', name: 'Press militar de pie con barra (OHP)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-militar-sentado-con-barra', name: 'Press militar sentado con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-hombros-sentado-con-mancuernas', name: 'Press de hombros sentado con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-hombros-de-pie-con-mancuernas', name: 'Press de hombros de pie con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-arnold-con-mancuernas', name: 'Press Arnold con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-tras-nuca-con-barra-sentado-o-de-pie', name: 'Press tras nuca con barra (sentado o de pie)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-hombros-en-maquina-smith', name: 'Press de hombros en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-hombros-en-maquina-convergente', name: 'Press de hombros en máquina convergente', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'push-press-con-barra-impulso-de-piernas', name: 'Push press con barra (impulso de piernas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'push-press-con-mancuernas', name: 'Push press con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-bradford-con-barra', name: 'Press Bradford con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-z-sentado-en-el-suelo-con-las-piernas-estiradas-con-barra', name: 'Press Z (sentado en el suelo con las piernas estiradas) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-z-con-mancuernas', name: 'Press Z con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-unilateral-de-rodillas-con-kettlebell-o-mancuerna', name: 'Press unilateral de rodillas con kettlebell o mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-con-mancuernas-de-pie', name: 'Elevaciones laterales con mancuernas de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-con-mancuernas-sentado', name: 'Elevaciones laterales con mancuernas sentado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-estrictas-recostado-de-lado-en-banco-inclinado', name: 'Elevaciones laterales estrictas recostado de lado en banco inclinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-en-polea-baja-a-una-mano', name: 'Elevaciones laterales en polea baja a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-en-polea-baja-cruzando-cables-por-detras', name: 'Elevaciones laterales en polea baja cruzando cables por detrás', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-en-polea-baja-cruzando-cables-por-delante', name: 'Elevaciones laterales en polea baja cruzando cables por delante', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-en-maquina-especifica', name: 'Elevaciones laterales en máquina específica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-laterales-con-kettlebells', name: 'Elevaciones laterales con kettlebells', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-con-mancuernas-alternas', name: 'Elevaciones frontales con mancuernas alternas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-con-mancuernas-simultaneas', name: 'Elevaciones frontales con mancuernas simultáneas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-con-barra-recta', name: 'Elevaciones frontales con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-con-disco-volante', name: 'Elevaciones frontales con disco (volante)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-en-polea-baja-con-cuerda', name: 'Elevaciones frontales en polea baja con cuerda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-en-polea-baja-con-barra-recta', name: 'Elevaciones frontales en polea baja con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-con-agarre-supino-barra-o-mancuernas', name: 'Elevaciones frontales con agarre supino (barra o mancuernas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-frontales-recostado-en-banco-inclinado-hacia-arriba', name: 'Elevaciones frontales recostado en banco inclinado (hacia arriba)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pajaros-elevaciones-posteriores-con-mancuernas-de-pie-inclinado', name: 'Pájaros (Elevaciones posteriores) con mancuernas de pie inclinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pajaros-con-mancuernas-sentado-e-inclinado-hacia-adelante', name: 'Pájaros con mancuernas sentado e inclinado hacia adelante', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pajaros-recostado-boca-abajo-en-banco-inclinado', name: 'Pájaros recostado boca abajo en banco inclinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'vuelos-posteriores-en-maquina-peck-deck-inverso', name: 'Vuelos posteriores en máquina (Peck Deck inverso)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cruces-de-cables-inversos-en-polea-alta-para-deltoides-posterior', name: 'Cruces de cables inversos en polea alta para deltoides posterior', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'tirones-faciales-face-pulls-recostado-en-el-suelo-con-polea', name: 'Tirones faciales (Face pulls) recostado en el suelo con polea', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-al-menton-upright-row-con-barra-recta', name: 'Remo al mentón (Upright row) con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-al-menton-con-barra-ez', name: 'Remo al mentón con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-al-menton-con-mancuernas', name: 'Remo al mentón con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-al-menton-en-polea-baja', name: 'Remo al mentón en polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-al-menton-en-maquina-smith', name: 'Remo al mentón en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotacion-externa-de-manguito-rotador-con-mancuerna-recostado-de-lado', name: 'Rotación externa de manguito rotador con mancuerna recostado de lado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotacion-externa-de-manguito-rotador-de-pie-con-polea', name: 'Rotación externa de manguito rotador de pie con polea', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotacion-interna-de-manguito-rotador-de-pie-con-polea', name: 'Rotación interna de manguito rotador de pie con polea', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotaciones-cubanas-en-polea', name: 'Rotaciones cubanas en polea', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'six-ways-con-mancuernas-elevacion-lateral-frontal-arriba-y-vuelta', name: '"Six-ways" con mancuernas (elevación lateral, frontal, arriba y vuelta)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-lateral-a-una-mano-agarrado-a-un-poste-inclinando-el-cuerpo', name: 'Elevación lateral a una mano agarrado a un poste (inclinando el cuerpo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'encogimiento-y-giro-shrug-and-roll-con-mancuernas', name: 'Encogimiento y giro (Shrug and roll) con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'levantamiento-de-disco-alrededor-de-la-cabeza-halos', name: 'Levantamiento de disco alrededor de la cabeza (Halos)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-hombros-a-un-brazo-en-maquina-smith-de-lado', name: 'Press de hombros a un brazo en máquina Smith (de lado)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'caminata-del-camarero-waiter-s-walk-con-pesa-arriba', name: 'Caminata del camarero (Waiter\'s walk) con pesa arriba', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lanzamiento-de-balon-medicinal-vertical-hacia-arriba', name: 'Lanzamiento de balón medicinal vertical hacia arriba', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pinos-handstands-isometricos-contra-la-pared', name: 'Pinos (Handstands) isométricos contra la pared', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-de-hombros-estilo-hindu-pike-push-ups', name: 'Flexiones de hombros estilo hindú (Pike push-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-libre-con-barra-alta-high-bar-back-squat', name: 'Sentadilla libre con barra alta (High bar back squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-libre-con-barra-baja-low-bar-back-squat', name: 'Sentadilla libre con barra baja (Low bar back squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-frontal-con-barra-cruzando-los-brazos', name: 'Sentadilla frontal con barra cruzando los brazos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-frontal-con-barra-agarre-olimpico', name: 'Sentadilla frontal con barra agarre olímpico', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-en-maquina-smith', name: 'Sentadilla en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-hack-en-maquina-hack-squat', name: 'Sentadilla Hack en máquina (Hack squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-hack-invertida-en-maquina', name: 'Sentadilla Hack invertida en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-hack-con-barra-por-detras-de-las-piernas-libre', name: 'Sentadilla Hack con barra por detrás de las piernas libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-goblet-con-kettlebell-o-mancuerna-pesada', name: 'Sentadilla Goblet con kettlebell o mancuerna pesada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-sissy-libre', name: 'Sentadilla Sissy libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-sissy-en-banco-especifico', name: 'Sentadilla Sissy en banco específico', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-sissy-lastrada-con-disco', name: 'Sentadilla Sissy lastrada con disco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-zercher-con-barra-en-el-pliegue-de-los-codos', name: 'Sentadilla Zercher con barra en el pliegue de los codos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-de-copa-goblet-con-talones-elevados-cyclist-squat', name: 'Sentadilla de copa (Goblet) con talones elevados (Cyclist squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-bulgara-con-mancuernas', name: 'Sentadilla Búlgara con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-bulgara-con-barra', name: 'Sentadilla Búlgara con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-bulgara-en-maquina-smith', name: 'Sentadilla Búlgara en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-bulgara-con-pie-trasero-en-trx', name: 'Sentadilla Búlgara con pie trasero en TRX', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-inclinada-a-45-grados-pies-centrados', name: 'Prensa de piernas inclinada a 45 grados (pies centrados)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-inclinada-pies-bajos-juntos', name: 'Prensa de piernas inclinada (pies bajos juntos)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-horizontal', name: 'Prensa de piernas horizontal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-vertical-acostado-boca-arriba', name: 'Prensa de piernas vertical (acostado boca arriba)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'prensa-de-piernas-a-una-sola-pierna', name: 'Prensa de piernas a una sola pierna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuadriceps-en-maquina-sentado', name: 'Extensiones de cuádriceps en máquina sentado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuadriceps-unilaterales-en-maquina', name: 'Extensiones de cuádriceps unilaterales en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuadriceps-con-las-puntas-de-los-pies-hacia-adentro', name: 'Extensiones de cuádriceps con las puntas de los pies hacia adentro', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuadriceps-con-las-puntas-de-los-pies-hacia-afuera', name: 'Extensiones de cuádriceps con las puntas de los pies hacia afuera', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-lunges-estaticas-con-barra', name: 'Zancadas (Lunges) estáticas con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-estaticas-con-mancuernas', name: 'Zancadas estáticas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-caminando-con-mancuernas', name: 'Zancadas caminando con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-caminando-con-barra-en-la-espalda', name: 'Zancadas caminando con barra en la espalda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-caminando-con-barra-frontal', name: 'Zancadas caminando con barra frontal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-inversas-con-mancuernas-paso-atras', name: 'Zancadas inversas con mancuernas (paso atrás)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-inversas-en-maquina-smith', name: 'Zancadas inversas en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-inversas-desde-un-deficit-sobre-un-disco', name: 'Zancadas inversas desde un déficit (sobre un disco)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-laterales-con-mancuernas', name: 'Zancadas laterales con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'zancadas-pendulares-adelante-y-atras-sin-apoyar', name: 'Zancadas pendulares (adelante y atrás sin apoyar)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-pistol-pistol-squat-asistida', name: 'Sentadilla Pistol (Pistol squat) asistida', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-pistol-libre-con-peso-corporal', name: 'Sentadilla Pistol libre con peso corporal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-pistol-lastrada-con-kettlebell', name: 'Sentadilla Pistol lastrada con kettlebell', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-skater-skater-squat', name: 'Sentadilla Skater (Skater squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'step-ups-subidas-al-cajon-frontales-con-mancuernas', name: 'Step-ups (Subidas al cajón) frontales con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'step-ups-laterales-al-cajon', name: 'Step-ups laterales al cajón', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'step-ups-con-barra-libre', name: 'Step-ups con barra libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'step-ups-en-maquina-smith', name: 'Step-ups en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-isometrica-apoyado-en-la-pared-wall-sit', name: 'Sentadilla isométrica apoyado en la pared (Wall sit)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-isometrica-en-pared-con-disco-sobre-las-piernas', name: 'Sentadilla isométrica en pared con disco sobre las piernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-de-sentadilla-pendular-pendulum-squat', name: 'Máquina de sentadilla pendular (Pendulum Squat)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-belt-squat-sentadilla-con-cinturon', name: 'Máquina Belt Squat (Sentadilla con cinturón)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-pierna-en-polea-baja-con-tobillera', name: 'Extensiones de pierna en polea baja con tobillera', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-rdl-con-barra', name: 'Peso muerto rumano (RDL) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-con-mancuernas', name: 'Peso muerto rumano con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-en-maquina-smith', name: 'Peso muerto rumano en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-a-una-pierna-con-mancuernas', name: 'Peso muerto rumano a una pierna con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-rumano-con-barra-hexagonal', name: 'Peso muerto rumano con barra hexagonal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-piernas-rigidas-stiff-leg-deadlift-con-barra', name: 'Peso muerto piernas rígidas (Stiff-leg deadlift) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-piernas-rigidas-con-mancuernas', name: 'Peso muerto piernas rígidas con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-sumo-con-barra', name: 'Peso muerto sumo con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'peso-muerto-sumo-con-kettlebell-pesado', name: 'Peso muerto sumo con kettlebell pesado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-acostado-en-maquina-lying-leg-curl', name: 'Curl de isquiotibiales acostado en máquina (Lying leg curl)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-acostado-unilateral', name: 'Curl de isquiotibiales acostado unilateral', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-sentado-en-maquina-seated-leg-curl', name: 'Curl de isquiotibiales sentado en máquina (Seated leg curl)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-sentado-unilateral', name: 'Curl de isquiotibiales sentado unilateral', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-de-pie-en-maquina-a-una-pierna', name: 'Curl de isquiotibiales de pie en máquina a una pierna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-isquiotibiales-con-mancuerna-acostado-boca-abajo', name: 'Curl de isquiotibiales con mancuerna (acostado boca abajo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-nordico-asistido-nordic-hamstring-curl', name: 'Curl nórdico asistido (Nordic hamstring curl)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-nordico-libre-o-con-peso', name: 'Curl nórdico libre o con peso', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-femorales-deslizante-en-el-suelo-con-discos-o-toallas', name: 'Curl de femorales deslizante en el suelo (con discos o toallas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-femorales-en-pelota-suiza-fitball', name: 'Curl de femorales en pelota suiza (Fitball)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-femorales-en-polea-baja-con-tobillera-de-pie', name: 'Curl de femorales en polea baja con tobillera (de pie)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-femorales-en-polea-baja-acostado-en-el-suelo', name: 'Curl de femorales en polea baja (acostado en el suelo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-empuje-de-cadera-con-barra-en-banco', name: 'Hip thrust (Empuje de cadera) con barra en banco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-en-maquina-especifica', name: 'Hip thrust en máquina específica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-en-maquina-smith', name: 'Hip thrust en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-a-una-sola-pierna-con-peso-corporal-o-mancuerna', name: 'Hip thrust a una sola pierna con peso corporal o mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hip-thrust-con-banda-de-resistencia', name: 'Hip thrust con banda de resistencia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'puente-de-gluteos-en-el-suelo-glute-bridge-libre', name: 'Puente de glúteos en el suelo (Glute bridge) libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'puente-de-gluteos-lastrado-con-barra', name: 'Puente de glúteos lastrado con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'puente-de-gluteos-a-una-pierna-en-el-suelo', name: 'Puente de glúteos a una pierna en el suelo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'frog-pumps-puente-de-gluteos-con-plantas-de-los-pies-juntas', name: 'Frog pumps (Puente de glúteos con plantas de los pies juntas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-gluteo-en-polea-baja-de-pie', name: 'Patada de glúteo en polea baja de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-gluteo-en-maquina-especifica-glute-kickback-machine', name: 'Patada de glúteo en máquina específica (Glute kickback machine)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-gluteo-en-cuadrupedia-con-tobilleras-lastradas', name: 'Patada de glúteo en cuadrupedia con tobilleras lastradas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-gluteo-en-maquina-smith-empujando-la-barra-con-la-planta', name: 'Patada de glúteo en máquina Smith (empujando la barra con la planta)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cadera-en-maquina-de-hiperextensiones-enfasis-gluteo', name: 'Extensiones de cadera en máquina de hiperextensiones (énfasis glúteo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'abduccion-de-cadera-en-maquina-sentada', name: 'Abducción de cadera en máquina sentada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'abduccion-de-cadera-en-maquina-inclinado-hacia-adelante', name: 'Abducción de cadera en máquina (inclinado hacia adelante)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'abduccion-de-cadera-acostado-de-lado-con-tobillera-lastrada', name: 'Abducción de cadera acostado de lado con tobillera lastrada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'caminata-lateral-con-banda-elastica-monster-walks', name: 'Caminata lateral con banda elástica (Monster walks)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-lateral-con-banda-side-steps', name: 'Sentadilla lateral con banda (Side steps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pull-through-en-polea-baja-con-cuerda-de-espaldas-a-la-polea', name: 'Pull-through en polea baja con cuerda (de espaldas a la polea)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'kettlebell-swing-balanceo-a-dos-manos', name: 'Kettlebell swing (Balanceo) a dos manos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'kettlebell-swing-a-una-mano', name: 'Kettlebell swing a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'buenos-dias-con-banda-elastica-gruesa', name: 'Buenos días con banda elástica gruesa', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'aduccion-de-cadera-en-polea-baja-de-pie', name: 'Aducción de cadera en polea baja de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sentadilla-cossack-libre-o-con-kettlebell', name: 'Sentadilla Cossack libre o con kettlebell', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'copenhague-planks-planchas-de-aductor-en-banco', name: 'Copenhague planks (Planchas de aductor en banco)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
    ]
  },
  brazos: {
    label: 'Brazos', icon: '\uD83E\uDDBE', color: 'var(--brazos)',
    exercises: [
      { id: 'curl-de-biceps-de-pie-con-barra-recta', name: 'Curl de bíceps de pie con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-de-pie-con-barra-ez', name: 'Curl de bíceps de pie con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-alterno-con-mancuernas-de-pie', name: 'Curl de bíceps alterno con mancuernas de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-simultaneo-con-mancuernas-de-pie', name: 'Curl de bíceps simultáneo con mancuernas de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-declinado-boca-abajo-en-banco-spider-curl-con-barra-ez', name: 'Curl declinado boca abajo en banco (Spider curl) con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-spider-con-mancuernas', name: 'Curl Spider con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-concentracion-sentado-con-mancuerna-apoyando-codo-en-muslo', name: 'Curl de concentración sentado con mancuerna apoyando codo en muslo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-concentracion-de-pie-inclinado-libre', name: 'Curl de concentración de pie inclinado libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-predicador-scott-en-banco-con-barra-ez', name: 'Curl predicador (Scott) en banco con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-predicador-con-mancuerna-a-una-mano', name: 'Curl predicador con mancuerna a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-predicador-en-maquina-de-placas', name: 'Curl predicador en máquina de placas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-en-polea-baja-con-barra-recta', name: 'Curl de bíceps en polea baja con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-en-polea-baja-con-barra-ez', name: 'Curl de bíceps en polea baja con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-en-polea-baja-a-una-mano-con-anilla-d-handle', name: 'Curl de bíceps en polea baja a una mano con anilla (D-handle)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-doble-en-polea-alta-cristos-o-pose-de-doble-biceps', name: 'Curl doble en polea alta (Cristos o pose de doble bíceps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-tumbado-en-el-suelo-con-polea-baja', name: 'Curl de bíceps tumbado en el suelo con polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-cruzado-al-pecho-con-mancuernas-pinwheel-curl', name: 'Curl cruzado al pecho con mancuernas (Pinwheel curl)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-arrastre-drag-curl-con-barra-codos-hacia-atras', name: 'Curl arrastre (Drag curl) con barra (codos hacia atrás)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-arrastre-con-maquina-smith', name: 'Curl arrastre con máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-arrastre-con-mancuernas', name: 'Curl arrastre con mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-bayesiano-en-polea-de-espaldas-a-la-polea-baja', name: 'Curl bayesiano en polea (de espaldas a la polea baja)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-martillo-hammer-curl-con-mancuernas-simultaneo', name: 'Curl martillo (Hammer curl) con mancuernas simultáneo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-martillo-con-mancuernas-alterno', name: 'Curl martillo con mancuernas alterno', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-martillo-con-cuerda-en-polea-baja', name: 'Curl martillo con cuerda en polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-martillo-en-banco-predicador-con-mancuerna', name: 'Curl martillo en banco predicador con mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-inverso-agarre-prono-con-barra-recta', name: 'Curl inverso (agarre prono) con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-inverso-con-barra-ez', name: 'Curl inverso con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-inverso-en-polea-baja-con-barra-recta', name: 'Curl inverso en polea baja con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-zottman-con-mancuernas-subida-supina-bajada-prona', name: 'Curl Zottman con mancuernas (subida supina, bajada prona)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-estricto-apoyando-espalda-y-triceps-en-la-pared', name: 'Curl de bíceps estricto apoyando espalda y tríceps en la pared', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexion-de-muneca-por-detras-de-la-espalda-con-barra', name: 'Flexión de muñeca por detrás de la espalda con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexion-de-muneca-en-polea-baja', name: 'Flexión de muñeca en polea baja', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rodillo-de-muneca-wrist-roller-hacia-arriba-flexion', name: 'Rodillo de muñeca (Wrist roller) hacia arriba (flexión)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rodillo-de-muneca-hacia-abajo-extension', name: 'Rodillo de muñeca hacia abajo (extensión)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'retenciones-isometricas-de-discos-por-pinzamiento-plate-pinches', name: 'Retenciones isométricas de discos por pinzamiento (Plate pinches)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'colgar-de-la-barra-a-una-o-dos-manos-dead-hangs', name: 'Colgar de la barra a una o dos manos (Dead hangs)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'paseo-del-granjero-con-agarre-de-pinza-discos', name: 'Paseo del granjero con agarre de pinza (discos)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotacion-de-antebrazos-con-maza-pesada-macebell-o-mancuerna-unilateral', name: 'Rotación de antebrazos con maza pesada (Macebell) o mancuerna unilateral', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fat-gripz-curls-cualquier-curl-con-adaptadores-de-agarre-grueso', name: 'Fat Gripz curls (cualquier curl con adaptadores de agarre grueso)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-con-cuerda', name: 'Extensión de tríceps en polea alta con cuerda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-con-barra-recta', name: 'Extensión de tríceps en polea alta con barra recta', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-con-barra-v', name: 'Extensión de tríceps en polea alta con barra V', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-con-agarre-inverso-supino', name: 'Extensión de tríceps en polea alta con agarre inverso (supino)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-a-una-mano-con-anilla-prono', name: 'Extensión de tríceps en polea alta a una mano con anilla prono', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-a-una-mano-con-anilla-supino', name: 'Extensión de tríceps en polea alta a una mano con anilla supino', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-polea-alta-sin-accesorio-agarrando-la-bola-del-cable', name: 'Extensión de tríceps en polea alta sin accesorio (agarrando la bola del cable)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-frances-skullcrushers-o-rompecraneos-con-barra-ez-recostado', name: 'Press francés (Skullcrushers o Rompecráneos) con barra EZ recostado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-frances-con-barra-recta-recostado', name: 'Press francés con barra recta recostado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-frances-con-mancuernas-recostado', name: 'Press francés con mancuernas recostado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-frances-declinado-con-barra-ez', name: 'Press francés declinado con barra EZ', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-tras-nuca-con-barra-ez-sentado-o-de-pie', name: 'Extensión de tríceps tras nuca con barra EZ sentado o de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-tras-nuca-con-mancuerna-a-dos-manos', name: 'Extensión de tríceps tras nuca con mancuerna a dos manos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-tras-nuca-con-mancuerna-a-una-mano', name: 'Extensión de tríceps tras nuca con mancuerna a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-tras-nuca-en-polea-baja-con-cuerda', name: 'Extensión de tríceps tras nuca en polea baja con cuerda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-tras-nuca-en-polea-alta-de-espaldas-a-la-maquina', name: 'Extensión de tríceps tras nuca en polea alta (de espaldas a la máquina)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-katana-en-polea-cruzado-por-detras-de-la-cabeza', name: 'Extensión de tríceps katana en polea (cruzado por detrás de la cabeza)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-triceps-triceps-kickback-con-mancuerna-apoyado-en-banco', name: 'Patada de tríceps (Triceps kickback) con mancuerna apoyado en banco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-triceps-con-dos-mancuernas-inclinado-de-pie', name: 'Patada de tríceps con dos mancuernas inclinado de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'patada-de-triceps-en-polea-baja-sin-accesorio', name: 'Patada de tríceps en polea baja sin accesorio', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-entre-bancos-bench-dips-con-peso-corporal', name: 'Fondos entre bancos (Bench dips) con peso corporal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-entre-bancos-lastrados-discos-en-las-piernas', name: 'Fondos entre bancos lastrados (discos en las piernas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-agarre-cerrado-close-grip-bench-press', name: 'Press de banca agarre cerrado (Close-grip bench press)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-agarre-cerrado-en-maquina-smith', name: 'Press de banca agarre cerrado en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-de-banca-declinado-agarre-cerrado', name: 'Press de banca declinado agarre cerrado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-jm-jm-press-con-barra-hibrido-entre-press-cerrado-y-frances', name: 'Press JM (JM Press) con barra (híbrido entre press cerrado y francés)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-jm-en-maquina-smith', name: 'Press JM en máquina Smith', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-tate-con-mancuernas-recostado-en-banco', name: 'Press Tate con mancuernas recostado en banco', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-cruzada-en-polea-alta-a-una-mano-tirando-en-diagonal', name: 'Extensión cruzada en polea alta a una mano (tirando en diagonal)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-acostado-en-el-suelo-floor-skullcrushers-con-barra', name: 'Extensión de tríceps acostado en el suelo (Floor skullcrushers) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-acostado-en-el-suelo-con-kettlebells-o-mancuernas', name: 'Extensión de tríceps acostado en el suelo con kettlebells o mancuernas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-en-maquina-sentado-triceps-extension-machine', name: 'Extensión de tríceps en máquina sentado (Triceps extension machine)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-diamante-o-de-esfinge-sphinx-push-ups', name: 'Flexiones diamante o de esfinge (Sphinx push-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-con-peso-corporal-contra-barra-smith-trx-o-mesa', name: 'Extensión de tríceps con peso corporal contra barra Smith, TRX o mesa', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rolling-triceps-extensions-con-mancuernas-en-banco-plano', name: 'Rolling triceps extensions con mancuernas en banco plano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-pjr-pull-over-extension-con-mancuerna-pesada', name: 'Extensiones PJR (Pull-over + extensión) con mancuerna pesada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-spoto-con-agarre-cerrado', name: 'Press Spoto con agarre cerrado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-a-una-mano-apoyado-de-lado-en-el-suelo', name: 'Extensión de tríceps a una mano apoyado de lado en el suelo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-triceps-con-banda-de-resistencia-atada-en-alto', name: 'Extensión de tríceps con banda de resistencia atada en alto', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'fondos-en-anillas-manteniendo-las-correas-tocando-los-biceps-bulgarian-dips', name: 'Fondos en anillas manteniendo las correas tocando los bíceps (Bulgarian dips)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
    ]
  },
  core: {
    label: 'Core / Abdomen', icon: '\uD83C\uDFAF', color: 'var(--core)',
    exercises: [
      { id: 'crunch-abdominal-clasico-en-el-suelo', name: 'Crunch abdominal clásico en el suelo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-con-piernas-elevadas-a-90-grados', name: 'Crunch con piernas elevadas a 90 grados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-en-banco-declinado', name: 'Crunch en banco declinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-declinado-con-peso-disco-en-el-pecho-o-nuca', name: 'Crunch declinado con peso (disco en el pecho o nuca)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-en-polea-alta-con-cuerda-de-rodillas-cable-crunch', name: 'Crunch en polea alta con cuerda de rodillas (Cable crunch)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-en-maquina-sentada', name: 'Crunch en máquina sentada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-piernas-colgado-en-barra-toes-to-bar-o-a-90', name: 'Elevación de piernas colgado en barra (toes to bar o a 90º)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-rodillas-colgado-en-barra', name: 'Elevación de rodillas colgado en barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-piernas-en-silla-romana-captain-s-chair', name: 'Elevación de piernas en silla romana (Captain\'s chair)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-piernas-acostado-en-el-suelo-leg-raises', name: 'Elevación de piernas acostado en el suelo (Leg raises)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-piernas-acostado-en-banco-plano-o-declinado', name: 'Elevación de piernas acostado en banco plano o declinado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-frontal-isometrica-plank-en-antebrazos', name: 'Plancha frontal isométrica (Plank) en antebrazos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-frontal-con-brazos-estirados', name: 'Plancha frontal con brazos estirados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-frontal-lastrada-con-disco-en-la-espalda', name: 'Plancha frontal lastrada con disco en la espalda', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-frontal-con-deslizamiento-hacia-adelante-y-atras-body-saw', name: 'Plancha frontal con deslizamiento hacia adelante y atrás (Body saw)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-lateral-apoyado-en-antebrazo', name: 'Plancha lateral apoyado en antebrazo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-lateral-con-elevacion-de-pierna-estrella', name: 'Plancha lateral con elevación de pierna (Estrella)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rueda-abdominal-de-rodillas-ab-wheel-rollout', name: 'Rueda abdominal de rodillas (Ab wheel rollout)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rueda-abdominal-de-pie-avanzado', name: 'Rueda abdominal de pie (Avanzado)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rollout-con-barra-de-pesas-en-el-suelo', name: 'Rollout con barra de pesas en el suelo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rollout-en-pelota-suiza-fitball', name: 'Rollout en pelota suiza (Fitball)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'giros-rusos-russian-twists-sin-peso', name: 'Giros rusos (Russian twists) sin peso', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'giros-rusos-con-balon-medicinal-disco-o-kettlebell', name: 'Giros rusos con balón medicinal, disco o kettlebell', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'toques-de-talon-alternos-recostado-heel-touches', name: 'Toques de talón alternos recostado (Heel touches)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'crunch-bicicleta-bicycle-crunches', name: 'Crunch bicicleta (Bicycle crunches)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'tijeras-horizontales-flutter-kicks-acostado', name: 'Tijeras horizontales (Flutter kicks) acostado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'tijeras-verticales-scissor-kicks-acostado', name: 'Tijeras verticales (Scissor kicks) acostado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'v-ups-abdominales-en-v-o-navajas', name: 'V-ups (Abdominales en V o navajas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'v-ups-alternos-a-una-pierna', name: 'V-ups alternos a una pierna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'bicho-muerto-con-resistencia-de-banda-elastica', name: 'Bicho muerto con resistencia de banda elástica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pajaro-perro-bird-dog-o-superman-en-cuadrupedia', name: 'Pájaro-perro (Bird-dog) o Supermán en cuadrupedia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lenador-woodchopper-en-polea-alta-de-arriba-hacia-abajo-diagonal', name: 'Leñador (Woodchopper) en polea alta (de arriba hacia abajo diagonal)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lenador-en-polea-baja-de-abajo-hacia-arriba-diagonal', name: 'Leñador en polea baja (de abajo hacia arriba diagonal)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'lenador-horizontal-en-polea-media', name: 'Leñador horizontal en polea media', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexion-lateral-del-tronco-con-mancuerna-de-pie', name: 'Flexión lateral del tronco con mancuerna de pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-lateral-de-tronco-en-silla-romana-a-45-grados', name: 'Extensión lateral de tronco en silla romana a 45 grados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dragon-flag-clasico-o-en-progresiones-piernas-encogidas', name: 'Dragon flag clásico o en progresiones (piernas encogidas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'abdominales-estilo-mariposa-butterfly-sit-ups', name: 'Abdominales estilo mariposa (Butterfly sit-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hollow-body-hold-posicion-de-canoa-isometrica', name: 'Hollow body hold (Posición de canoa isométrica)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'hollow-body-rocks-balanceos-en-canoa', name: 'Hollow body rocks (Balanceos en canoa)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'plancha-copenhague-copenhagen-plank-para-aductores-y-oblicuos', name: 'Plancha Copenhague (Copenhagen plank) para aductores y oblicuos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-pallof-isometrico-en-polea-o-con-banda-antirrotacion', name: 'Press Pallof isométrico en polea o con banda (Antirrotación)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'press-pallof-con-empuje-o-elevacion-vertical', name: 'Press Pallof con empuje o elevación vertical', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-pelvis-en-el-suelo-a-una-pierna-isometrico', name: 'Elevación de pelvis en el suelo a una pierna isométrico', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'escaladores-cruzados-cross-body-mountain-climbers', name: 'Escaladores cruzados (Cross-body mountain climbers)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'l-sit-isometrico-en-paralelas-o-suelo', name: 'L-sit isométrico en paralelas o suelo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'l-sit-en-barra-de-dominadas-colgado', name: 'L-sit en barra de dominadas colgado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'burpees-clasicos-sin-flexion', name: 'Burpees clásicos sin flexión', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'burpees-con-flexion-de-pecho-y-salto', name: 'Burpees con flexión de pecho y salto', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'mountain-climbers-escaladores-frontales-rapidos', name: 'Mountain climbers (Escaladores) frontales rápidos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'levantamiento-turco-turkish-get-up-con-kettlebell-o-mancuerna', name: 'Levantamiento turco (Turkish Get-Up) con kettlebell o mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrancada-snatch-con-barra-olimpica', name: 'Arrancada (Snatch) con barra olímpica', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrancada-de-potencia-power-snatch', name: 'Arrancada de potencia (Power snatch)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrancada-con-mancuerna-a-una-mano', name: 'Arrancada con mancuerna a una mano', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrancada-con-kettlebell', name: 'Arrancada con kettlebell', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cargada-y-envion-clean-and-jerk', name: 'Cargada y envión (Clean and Jerk)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cargada-de-potencia-power-clean-con-barra', name: 'Cargada de potencia (Power clean) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cargada-colgante-hang-clean-con-barra', name: 'Cargada colgante (Hang clean) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'push-jerk-con-barra', name: 'Push Jerk con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'thruster-sentadilla-frontal-press-militar-en-un-movimiento-continuo-con-barra', name: 'Thruster (Sentadilla frontal + press militar en un movimiento continuo) con barra', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'thruster-con-mancuernas-o-kettlebells', name: 'Thruster con mancuernas o kettlebells', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'balon-medicinal-contra-la-pared-wall-balls', name: 'Balón medicinal contra la pared (Wall balls)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'golpes-de-balon-medicinal-contra-el-suelo-slam-balls', name: 'Golpes de balón medicinal contra el suelo (Slam balls)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cuerdas-de-batalla-battle-ropes-ondulaciones-simultaneas', name: 'Cuerdas de batalla (Battle ropes) ondulaciones simultáneas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cuerdas-de-batalla-ondulaciones-alternas', name: 'Cuerdas de batalla ondulaciones alternas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cuerdas-de-batalla-con-golpe-slams', name: 'Cuerdas de batalla con golpe (Slams)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'empuje-de-trineo-prowler-o-sled-push', name: 'Empuje de trineo (Prowler o Sled push)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrastre-de-trineo-sled-pull-de-espaldas', name: 'Arrastre de trineo (Sled pull) de espaldas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'arrastre-de-trineo-tirando-con-los-brazos', name: 'Arrastre de trineo tirando con los brazos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'remo-en-ergometro-rowing-machine', name: 'Remo en ergómetro (Rowing machine)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-al-cajon-box-jumps-frontales', name: 'Saltos al cajón (Box jumps) frontales', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-al-cajon-desde-sentado-seated-box-jumps', name: 'Saltos al cajón desde sentado (Seated box jumps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-en-profundidad-depth-jumps', name: 'Saltos en profundidad (Depth jumps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-largos-sin-carrera-broad-jumps', name: 'Saltos largos sin carrera (Broad jumps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-de-rodillas-al-pecho-tuck-jumps', name: 'Saltos de rodillas al pecho (Tuck jumps)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'volteo-de-neumatico-pesado-tire-flip', name: 'Volteo de neumático pesado (Tire flip)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'caminata-del-oso-bear-crawl-pesada-o-de-distancia', name: 'Caminata del oso (Bear crawl) pesada o de distancia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'golpe-de-maza-sobre-neumatico-sledgehammer-strikes', name: 'Golpe de maza sobre neumático (Sledgehammer strikes)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'caminata-en-cinta-con-chaleco-lastrado-y-maxima-inclinacion', name: 'Caminata en cinta con chaleco lastrado y máxima inclinación', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-de-escaleras-stairmaster-o-subida-de-escaleras-lastrado', name: 'Máquina de escaleras (Stairmaster) o subida de escaleras lastrado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'saltos-dobles-a-la-comba-double-unders', name: 'Saltos dobles a la comba (Double unders)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'skierg-maquina-de-esqui', name: 'SkiErg (Máquina de esquí)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
    ]
  },
  cardio: {
    label: 'Cardio', icon: '\uD83C\uDFC3', color: 'var(--cardio)',
    exercises: [
    ]
  }
};

// ── GIF Mapping ──────────────────────────────────────────────────
const GIF_MAPPING = {
  // ===================== PECHO =====================
  'press-de-banca-plano-con-barra': 'barbell_bench_press.gif',
  'press-de-banca-inclinado-con-barra': 'barbell_incline_bench_press.gif',
  'press-de-banca-declinado-con-barra': 'barbell_decline_wide_grip_press.gif',
  'press-de-banca-plano-con-mancuernas': 'dumbbell_bench_press.gif',
  'press-de-banca-inclinado-con-mancuernas': 'dumbbell_incline_fly.gif',
  'press-de-banca-declinado-con-mancuernas': 'dumbbell_decline_bench_press.gif',
  'press-de-banca-en-maquina-smith': 'smith_hex_press.gif',
  'press-inclinado-en-maquina-smith': 'smith_hex_press.gif',
  'press-declinado-en-maquina-smith': 'smith_hex_press.gif',
  'press-de-pecho-en-maquina-convergente-sentado': 'lever_chest_press_version_4.gif',
  'press-inclinado-en-maquina-convergente': 'lever_incline_chest_press.gif',
  'press-declinado-en-maquina-convergente': 'lever_decline_chest_press_version_2.gif',
  'press-de-suelo-floor-press-con-barra': 'barbell_one_arm_floor_press.gif',
  'press-de-suelo-con-mancuernas': 'dumbbell_lying_one_arm_press.gif',
  'press-de-suelo-a-una-mano-con-kettlebell': 'dumbbell_lying_one_arm_press.gif',
  'press-guillotina-al-cuello-con-barra': 'barbell_bench_press.gif',
  'press-hexagonal-squeeze-press-con-mancuernas': 'dumbbell_squeeze_bench_press.gif',
  'press-hexagonal-inclinado-con-mancuernas': 'dumbbell_incline_close_grip_press_variation.gif',
  'aperturas-flyes-planas-con-mancuernas': 'dumbbell_fly.gif',
  'aperturas-inclinadas-con-mancuernas': 'dumbbell_incline_fly.gif',
  'aperturas-declinadas-con-mancuernas': 'dumbbell_decline_fly.gif',
  'aperturas-en-maquina-peck-deck': 'lever_pec_deck_fly.gif',
  'aperturas-en-polea-baja-en-banco-plano': 'cable_middle_fly.gif',
  'aperturas-en-polea-baja-en-banco-inclinado': 'cable_middle_fly.gif',
  'cruces-de-cables-en-polea-alta-hacia-abajo': 'cable_standing_up_straight_crossovers.gif',
  'cruces-de-cables-en-polea-media-hacia-el-frente': 'cable_standing_fly.gif',
  'cruces-de-cables-en-polea-baja-hacia-arriba': 'cable_upper_chest_crossovers.gif',
  'cruces-de-cables-a-una-mano-en-polea': 'cable_one_arm_decline_chest_fly.gif',
  'pullover-con-mancuerna-en-banco-plano': 'dumbbell_pullover.gif',
  'pullover-con-barra-recta': 'barbell_bent_arm_pullover.gif',
  'pullover-con-barra-ez': 'ez_bar_lying_bent_arms_pullover.gif',
  'fondos-en-paralelas-dips-con-peso-corporal': 'chest_dip.gif',
  'fondos-en-paralelas-lastrados': 'chest_dip.gif',
  'fondos-en-anillas': 'chest_dip.gif',
  'fondos-en-maquina-asistida': 'lever_seated_dip.gif',
  'maquina-de-fondos-sentado-dip-machine': 'lever_seated_dip.gif',
  'flexiones-de-pecho-push-ups-clasicas': 'push_up.gif',
  'flexiones-diamante-manos-juntas': 'diamond_push_up.gif',
  'flexiones-abiertas-brazos-separados': 'wide_hand_push_up.gif',
  'flexiones-con-palmada-pliometricas': 'clap_push_up.gif',
  'flexiones-asimetricas-una-mano-adelantada': 'push_up.gif',
  'flexiones-del-arquero-archer-push-ups': 'archer_push_up.gif',
  'flexiones-a-una-mano': 'single_arm_push_up.gif',
  'flexiones-en-anillas-o-trx': 'push_up.gif',
  'flexiones-con-banda-de-resistencia': 'push_up.gif',
  'flexiones-con-deficit-manos-en-discos-o-bloques': 'push_up.gif',
  'flexiones-spiderman': 'push_up.gif',
  'press-de-pecho-unilateral-con-banda-elastica': 'band_one_arm_twisting_chest_press.gif',
  'press-de-banca-agarre-inverso': 'barbell_reverse_close_grip_bench_press.gif',
  'aperturas-con-cadenas-o-bandas-elasticas': 'band_high_fly_male.gif',
  'cruces-con-bandas-de-resistencia-ancladas': 'band_standing_chest_press_male.gif',
  'press-de-pecho-en-maquina-de-palanca-a-una-mano': 'lever_chest_press_version_4.gif',
  'flexiones-en-parada-de-manos-handstand-push-ups-asistidas': 'handstand_push_up.gif',
  'press-de-banca-isometrico-contra-pines': 'barbell_bench_press.gif',
  'aperturas-deslizantes-en-el-suelo-con-toallas-o-discos-deslizantes': 'dumbbell_fly.gif',
  'press-de-pecho-con-kettlebells-con-las-bases-hacia-arriba-bottoms-up': 'dumbbell_bench_press.gif',

  // ===================== ESPALDA =====================
  'dominadas-abiertas-pull-ups': 'wide_grip_pull_up.gif',
  'dominadas-abiertas-lastradas': 'weighted_one_hand_pull_up.gif',
  'dominadas-supinas-chin-ups': 'chin_up.gif',
  'dominadas-supinas-lastradas': 'chin_up.gif',
  'dominadas-con-agarre-neutro': 'hammer_grip_pull_up_on_dip_cage.gif',
  'dominadas-con-agarre-estrecho': 'brachialis_narrow_pull_ups.gif',
  'dominadas-en-anillas': 'chin_up.gif',
  'dominadas-asistidas-con-banda-elastica': 'chin_up.gif',
  'dominadas-en-maquina-asistida': 'chin_up.gif',
  'dominadas-a-una-mano-o-asistidas-a-una-mano': 'one_arm_chin_up.gif',
  'dominadas-excentricas-negativas': 'chin_up.gif',
  'jalon-al-pecho-con-polea-ancha-barra-recta': 'cable_lat_pulldown_full_range_of_motion.gif',
  'jalon-al-pecho-con-agarre-supino-estrecho': 'cable_close_grip_front_lat_pulldown.gif',
  'jalon-al-pecho-con-agarre-neutro-triangulo': 'cable_lateral_pulldown_with_v_bar.gif',
  'jalon-al-pecho-con-agarre-v-ancho': 'cable_wide_neutral_grip_pulldown.gif',
  'jalon-tras-nuca-con-polea-requiere-buena-movilidad': 'cable_wide_grip_rear_pulldown_behind.gif',
  'jalon-al-pecho-unilateral-en-polea-alta': 'cable_one_arm_lat_pulldown.gif',
  'jalon-con-brazos-rectos-straight-arm-pulldown-con-barra': 'cable_straight_arm_pulldown.gif',
  'jalon-con-brazos-rectos-con-cuerda': 'cable_standing_pulldown_with_rope.gif',
  'remo-con-barra-convencional-inclinado': 'barbell_bent_over_row.gif',
  'remo-con-barra-agarre-supino-yates-row': 'barbell_reverse_grip_bent_over_row.gif',
  'remo-pendlay-desde-el-suelo-en-cada-repeticion': 'barbell_bent_over_row.gif',
  'remo-con-mancuerna-a-una-mano-apoyado-en-banco': 'dumbbell_bent_over_row.gif',
  'remo-con-dos-mancuernas-inclinado': 'dumbbell_incline_row.gif',
  'remo-en-barra-t-con-soporte-para-pecho': 'lever_lying_t_bar_row.gif',
  'remo-en-barra-t-libre-agarre-estrecho': 'lever_lying_t_bar_row.gif',
  'remo-en-barra-t-libre-agarre-ancho': 'lever_reverse_t_bar_row.gif',
  'remo-en-polea-baja-con-triangulo-agarre-estrecho': 'cable_seated_row_with_v_bar.gif',
  'remo-en-polea-baja-con-barra-recta-agarre-ancho': 'cable_seated_wide_grip_row.gif',
  'remo-en-polea-baja-a-una-mano': 'cable_one_arm_bent_over_row.gif',
  'remo-en-maquina-sentado-agarre-prono': 'lever_seated_row.gif',
  'remo-en-maquina-sentado-agarre-neutro': 'lever_seated_row.gif',
  'remo-unilateral-en-maquina-convergente': 'lever_seated_row.gif',
  'remo-meadows-con-un-extremo-de-la-barra': 'landmine_one_arm_bent_over_row.gif',
  'remo-renegado-renegade-row-con-mancuernas': 'dumbbell_bent_over_row.gif',
  'remo-invertido-australian-pull-ups-en-barra-smith': 'inverted_row.gif',
  'remo-invertido-en-trx-o-anillas': 'inverted_row_with_straps.gif',
  'remo-con-mancuernas-recostado-boca-abajo-en-banco-inclinado-seal-row': 'dumbbell_hammer_grip_incline_bench_two_arm_row.gif',
  'remo-con-barra-recostado-en-banco-alto-cambered-bar-row': 'barbell_incline_row.gif',
  'pullover-en-polea-alta-recostado-en-banco': 'cable_seated_pullover.gif',
  'pullover-en-maquina-nautilus': 'cable_seated_pullover.gif',
  'jalon-unilateral-en-polea-alta-de-rodillas': 'band_kneeling_one_arm_pulldown.gif',
  'shrugs-con-mancuernas': 'dumbbell_shrug.gif',
  'shrugs-en-maquina-smith': 'barbell_shrug.gif',
  'shrugs-con-barra-hexagonal-trap-bar': 'barbell_shrug.gif',
  'shrugs-en-polea-baja': 'cable_shrug.gif',
  'shrugs-por-detras-de-la-espalda-con-barra': 'barbell_behind_the_back_shrug.gif',
  'elevaciones-en-y-tumbado-boca-abajo': 'dumbbell_incline_y_raise.gif',
  'face-pull-en-polea-alta-con-cuerda': 'cable_standing_rear_delt_horizontal_row_with_rope.gif',
  'face-pull-sentado-en-polea-baja': 'cable_rear_delt_row_stirrups.gif',
  'peso-muerto-convencional-con-barra': 'barbell_deadlift.gif',
  'peso-muerto-en-maquina-smith': 'lever_deadlift_plate_loaded.gif',
  'peso-muerto-con-barra-hexagonal': 'barbell_deadlift.gif',
  'hiperextensiones-en-banco-a-45-grados': 'hyperextension.gif',
  'hiperextensiones-a-90-grados-silla-romana': 'hyperextension_version_2.gif',
  'hiperextensiones-con-disco-lastrado': 'hyperextension.gif',
  'extension-de-espalda-en-maquina-sentada': 'lever_back_extension.gif',
  'buenos-dias-good-mornings-con-barra-libre': 'barbell_good_morning.gif',
  'buenos-dias-en-maquina-smith': 'barbell_good_morning.gif',
  'buenos-dias-sentado-con-barra': 'barbell_good_morning.gif',
  'superman-en-el-suelo-elevacion-de-brazos-y-piernas': 'back_extension_on_exercise_ball.gif',
  'remo-gorila-con-kettlebells': 'dumbbell_bent_over_row.gif',
  'paseo-del-granjero-farmer-s-walk-pesado': 'farmers_walk.gif',
  'peso-muerto-desde-bloques-rack-pulls': 'barbell_rack_pull.gif',

  // ===================== PIERNAS (original section) =====================
  'sentadillas-con-barra': 'barbell_full_squat.gif',
  'sentadillas-frontales-con-barra': 'landmine_front_squat.gif',
  'sentadillas-bulgarian-split-squats-con-mancuernas': 'dumbbell_single_leg_split_squat.gif',
  'sentadillas-con-mancuernas': 'dumbbell_squat.gif',
  'sentadillas-sissy-squats': null,
  'prensa-de-piernas-leg-press': 'sled_45_leg_wide_press.gif',
  'prensa-de-piernas-45-grados': 'sled_45_narrow_stance_leg_press.gif',
  'prensa-de-piernas-horizontal': 'sled_45_leg_wide_press.gif',
  'extensiones-de-cuadriceps-en-maquina': 'lever_leg_extension.gif',
  'step-ups-con-mancuernas': 'dumbbell_step_up.gif',
  'lunges-caminando-con-mancuernas': 'dumbbell_lunge.gif',
  'lunges-estaticos-con-mancuernas': 'dumbbell_lunge.gif',
  'hack-squats-en-maquina': 'sled_full_hack_squat.gif',
  'curl-de-piernas-hamstrings-en-maquina': 'lever_lying_leg_curl.gif',
  'curl-de-piernas-acostado-con-mancuerna': 'lever_lying_leg_curl.gif',
  'curl-de-piernas-de-pie-con-mancuerna': 'cable_standing_leg_curl.gif',
  'peso-muerto-rumano-con-barra': 'barbell_romanian_deadlift.gif',
  'peso-muerto-con-mancuernas': 'dumbbell_romanian_deadlift.gif',
  'buenos-dias-con-barra': 'barbell_good_morning.gif',
  'hip-thrust-glute-bridge-con-barra': 'barbell_hip_thrust.gif',
  'hip-thrust-con-mancuerna': 'dumbbell_glute_bridge.gif',
  'peso-muerto-con-barra': 'barbell_deadlift.gif',
  'peso-muerto-sum-cero-trap-bar': 'barbell_deadlift.gif',

  // Pantorrillas
  'elevacion-de-talones-de-pie-en-maquina': 'lever_standing_calf_raise.gif',
  'elevacion-de-talones-de-pie-con-barra-libre': 'barbell_standing_leg_calf_raise.gif',
  'elevacion-de-talones-en-maquina-smith-sobre-un-step': 'barbell_standing_leg_calf_raise.gif',
  'elevacion-de-talones-a-una-pierna-con-mancuerna': 'dumbbell_standing_calf_raise.gif',
  'elevacion-de-talones-sentado-con-barra-sobre-las-rodillas': 'barbell_seated_calf_raise.gif',
  'elevacion-de-talones-sentado-con-mancuernas-sobre-rodillas': 'dumbbell_seated_one_leg_calf_raise.gif',
  'elevacion-de-talones-en-prensa-de-piernas-a-45-grados': 'sled_calf_press_on_leg_press.gif',
  'elevacion-de-talones-en-prensa-horizontal': 'sled_calf_press_on_leg_press.gif',
  'elevacion-de-talones-tipo-burro-donkey-calf-raises-en-maquina': 'lever_donkey_calf_raise.gif',
  'elevacion-de-talones-tipo-burro-libre-con-companero-encima': 'donkey_calf_raise.gif',
  'elevacion-de-talones-tipo-burro-en-maquina-smith-flexionado-a-90': 'donkey_calf_raise.gif',
  'elevaciones-de-talones-de-pie-con-puntas-hacia-adentro': 'lever_standing_calf_raise.gif',
  'elevaciones-de-talones-de-pie-con-puntas-hacia-afuera': 'lever_standing_calf_raise.gif',
  'andar-de-puntillas-con-mancuernas-pesadas': 'dumbbell_standing_calf_raise.gif',
  'elevacion-de-talones-excentrica-a-una-pierna-en-escalon': 'band_single_leg_calf_raise.gif',
  'maquina-de-pantorrillas-rotatoria-rotary-calf-machine': 'lever_standing_calf_raise.gif',
  'elevaciones-tibiales-con-banda-de-resistencia': 'band_single_leg_reverse_calf_raise.gif',
  'elevaciones-tibiales-apoyado-de-espaldas-a-la-pared': null,
  'maquina-de-elevacion-tibial-sentada': null,
  'elevaciones-tibiales-con-barra-tib-tib-bar': null,
  'elevaciones-tibiales-con-kettlebell-en-la-punta-del-pie': null,
  'elevaciones-de-talon-en-sentadilla-profunda-sissy-calf-raises': null,
  'pasos-de-ganso-caminar-sobre-los-talones': null,

  // ===================== HOMBROS =====================
  'press-militar-de-pie-con-barra-ohp': 'barbell_standing_military_press_without_rack.gif',
  'press-militar-sentado-con-barra': 'barbell_standing_close_grip_military_press.gif',
  'press-de-hombros-sentado-con-mancuernas': 'dumbbell_standing_overhead_press.gif',
  'press-de-hombros-de-pie-con-mancuernas': 'dumbbell_standing_palms_in_press.gif',
  'press-arnold-con-mancuernas': 'dumbbell_arnold_press.gif',
  'press-tras-nuca-con-barra-sentado-o-de-pie': 'standing_behind_neck_press.gif',
  'press-de-hombros-en-maquina-smith': 'lever_seated_shoulder_press.gif',
  'press-de-hombros-en-maquina-convergente': 'lever_seated_hammer_grip_shoulder_press.gif',
  'push-press-con-barra-impulso-de-piernas': 'barbell_standing_military_press_without_rack.gif',
  'push-press-con-mancuernas': 'dumbbell_standing_overhead_press.gif',
  'press-bradford-con-barra': 'barbell_standing_bradford_press.gif',
  'press-z-sentado-en-el-suelo-con-las-piernas-estiradas-con-barra': 'barbell_standing_military_press_without_rack.gif',
  'press-z-con-mancuernas': 'dumbbell_standing_overhead_press.gif',
  'press-unilateral-de-rodillas-con-kettlebell-o-mancuerna': 'landmine_kneeling_one_arm_shoulder_press.gif',
  'elevaciones-laterales-con-mancuernas-de-pie': 'dumbbell_lateral_raise.gif',
  'elevaciones-laterales-con-mancuernas-sentado': 'dumbbell_lateral_raise.gif',
  'elevaciones-laterales-estrictas-recostado-de-lado-en-banco-inclinado': 'dumbbell_incline_one_arm_lateral_raise.gif',
  'elevaciones-laterales-en-polea-baja-a-una-mano': 'cable_one_arm_lateral_raise.gif',
  'elevaciones-laterales-en-polea-baja-cruzando-cables-por-detras': 'cable_leaning_lateral_raise.gif',
  'elevaciones-laterales-en-polea-baja-cruzando-cables-por-delante': 'cable_leaning_lateral_raise.gif',
  'elevaciones-laterales-en-maquina-especifica': 'lever_lateral_raise_version_2.gif',
  'elevaciones-laterales-con-kettlebells': 'dumbbell_lateral_raise.gif',
  'elevaciones-frontales-con-mancuernas-alternas': 'dumbbell_front_raise.gif',
  'elevaciones-frontales-con-mancuernas-simultaneas': 'dumbbell_front_raise_ii.gif',
  'elevaciones-frontales-con-barra-recta': 'barbell_front_raise.gif',
  'elevaciones-frontales-con-disco-volante': 'barbell_standing_front_raise_over_head.gif',
  'elevaciones-frontales-en-polea-baja-con-cuerda': 'cable_front_raise.gif',
  'elevaciones-frontales-en-polea-baja-con-barra-recta': 'cable_forward_raise.gif',
  'elevaciones-frontales-con-agarre-supino-barra-o-mancuernas': 'dumbbell_front_raise.gif',
  'elevaciones-frontales-recostado-en-banco-inclinado-hacia-arriba': 'dumbbell_incline_front_raise.gif',
  'pajaros-elevaciones-posteriores-con-mancuernas-de-pie-inclinado': 'dumbbell_rear_lateral_raise.gif',
  'pajaros-con-mancuernas-sentado-e-inclinado-hacia-adelante': 'dumbbell_seated_bent_over_rear_delt_row.gif',
  'pajaros-recostado-boca-abajo-en-banco-inclinado': 'dumbbell_incline_rear_lateral_raise.gif',
  'vuelos-posteriores-en-maquina-peck-deck-inverso': 'lever_seated_reverse_fly.gif',
  'cruces-de-cables-inversos-en-polea-alta-para-deltoides-posterior': 'cable_standing_rear_delt_horizontal_row_with_rope.gif',
  'tirones-faciales-face-pulls-recostado-en-el-suelo-con-polea': 'cable_lying_front_raise.gif',
  'remo-al-menton-upright-row-con-barra-recta': 'barbell_upright_row.gif',
  'remo-al-menton-con-barra-ez': 'barbell_upright_row_ii.gif',
  'remo-al-menton-con-mancuernas': 'dumbbell_upright_row.gif',
  'remo-al-menton-en-polea-baja': 'cable_upright_row.gif',
  'remo-al-menton-en-maquina-smith': 'barbell_upright_row.gif',
  'rotacion-externa-de-manguito-rotador-con-mancuerna-recostado-de-lado': 'dumbbell_lying_external_shoulder_rotation.gif',
  'rotacion-externa-de-manguito-rotador-de-pie-con-polea': 'cable_standing_shoulder_external_rotation.gif',
  'rotacion-interna-de-manguito-rotador-de-pie-con-polea': 'cable_seated_shoulder_internal_rotation.gif',
  'rotaciones-cubanas-en-polea': 'dumbbell_cuban_press.gif',
  'six-ways-con-mancuernas-elevacion-lateral-frontal-arriba-y-vuelta': 'dumbbell_lateral_to_front_raise.gif',
  'elevacion-lateral-a-una-mano-agarrado-a-un-poste-inclinando-el-cuerpo': 'cable_leaning_lateral_raise.gif',
  'encogimiento-y-giro-shrug-and-roll-con-mancuernas': 'dumbbell_shrug.gif',
  'levantamiento-de-disco-alrededor-de-la-cabeza-halos': 'dumbbell_standing_around_world.gif',
  'press-de-hombros-a-un-brazo-en-maquina-smith-de-lado': 'lever_shoulder_press_plate_loaded_ii.gif',
  'caminata-del-camarero-waiter-s-walk-con-pesa-arriba': 'farmers_walk.gif',
  'lanzamiento-de-balon-medicinal-vertical-hacia-arriba': null,
  'pinos-handstands-isometricos-contra-la-pared': 'handstand_push_up.gif',
  'flexiones-de-hombros-estilo-hindu-pike-push-ups': 'pike_push_up_on_bench_version_2.gif',

  // ===================== PIERNAS (hombros section - squats/lunges extended) =====================
  'sentadilla-libre-con-barra-alta-high-bar-back-squat': 'barbell_full_squat.gif',
  'sentadilla-libre-con-barra-baja-low-bar-back-squat': 'barbell_full_squat.gif',
  'sentadilla-frontal-con-barra-cruzando-los-brazos': 'cable_front_squat.gif',
  'sentadilla-frontal-con-barra-agarre-olimpico': 'landmine_front_squat.gif',
  'sentadilla-en-maquina-smith': 'barbell_bench_squat.gif',
  'sentadilla-hack-en-maquina-hack-squat': 'sled_full_hack_squat.gif',
  'sentadilla-hack-invertida-en-maquina': 'sled_wide_hack_squat_male.gif',
  'sentadilla-hack-con-barra-por-detras-de-las-piernas-libre': 'sled_full_hack_squat.gif',
  'sentadilla-goblet-con-kettlebell-o-mancuerna-pesada': 'dumbbell_goblet_squat.gif',
  'sentadilla-sissy-libre': null,
  'sentadilla-sissy-en-banco-especifico': null,
  'sentadilla-sissy-lastrada-con-disco': null,
  'sentadilla-zercher-con-barra-en-el-pliegue-de-los-codos': 'barbell_full_squat.gif',
  'sentadilla-de-copa-goblet-con-talones-elevados-cyclist-squat': 'dumbbell_goblet_squat.gif',
  'sentadilla-bulgara-con-mancuernas': 'dumbbell_single_leg_split_squat.gif',
  'sentadilla-bulgara-con-barra': 'barbell_split_squat.gif',
  'sentadilla-bulgara-en-maquina-smith': 'barbell_split_squat.gif',
  'sentadilla-bulgara-con-pie-trasero-en-trx': 'dumbbell_single_leg_split_squat.gif',
  'prensa-de-piernas-inclinada-a-45-grados-pies-centrados': 'sled_45_leg_wide_press.gif',
  'prensa-de-piernas-inclinada-pies-bajos-juntos': 'sled_45_narrow_stance_leg_press.gif',
  'prensa-de-piernas-vertical-acostado-boca-arriba': 'sled_45_leg_wide_press.gif',
  'prensa-de-piernas-a-una-sola-pierna': 'sled_45_narrow_stance_leg_press.gif',
  'extensiones-de-cuadriceps-en-maquina-sentado': 'lever_leg_extension.gif',
  'extensiones-de-cuadriceps-unilaterales-en-maquina': 'lever_leg_extension.gif',
  'extensiones-de-cuadriceps-con-las-puntas-de-los-pies-hacia-adentro': 'lever_leg_extension.gif',
  'extensiones-de-cuadriceps-con-las-puntas-de-los-pies-hacia-afuera': 'lever_leg_extension.gif',
  'zancadas-lunges-estaticas-con-barra': 'barbell_rear_lunge_ii.gif',
  'zancadas-estaticas-con-mancuernas': 'dumbbell_lunge.gif',
  'zancadas-caminando-con-mancuernas': 'dumbbell_lunge.gif',
  'zancadas-caminando-con-barra-en-la-espalda': 'barbell_rear_lunge_ii.gif',
  'zancadas-caminando-con-barra-frontal': 'barbell_rear_lunge_ii.gif',
  'zancadas-inversas-con-mancuernas-paso-atras': 'dumbbell_rear_lunge.gif',
  'zancadas-inversas-en-maquina-smith': 'landmine_rear_lunge_version_2.gif',
  'zancadas-inversas-desde-un-deficit-sobre-un-disco': 'dumbbell_rear_lunge.gif',
  'zancadas-laterales-con-mancuernas': 'dumbbell_side_lunge_version_3.gif',
  'zancadas-pendulares-adelante-y-atras-sin-apoyar': 'dumbbell_lunge.gif',
  'sentadilla-pistol-pistol-squat-asistida': 'assisted_pistol_squat_with_bed_sheet.gif',
  'sentadilla-pistol-libre-con-peso-corporal': 'assisted_pistol_squat_with_bed_sheet.gif',
  'sentadilla-pistol-lastrada-con-kettlebell': 'assisted_pistol_squat_with_bed_sheet.gif',
  'sentadilla-skater-skater-squat': 'barbell_one_leg_squat.gif',
  'step-ups-subidas-al-cajon-frontales-con-mancuernas': 'dumbbell_step_up.gif',
  'step-ups-laterales-al-cajon': 'band_step_up.gif',
  'step-ups-con-barra-libre': 'barbell_front_step_up.gif',
  'step-ups-en-maquina-smith': 'barbell_front_step_up.gif',
  'sentadilla-isometrica-apoyado-en-la-pared-wall-sit': 'dumbbell_wall_squat.gif',
  'sentadilla-isometrica-en-pared-con-disco-sobre-las-piernas': 'dumbbell_wall_squat.gif',
  'maquina-de-sentadilla-pendular-pendulum-squat': 'sled_full_hack_squat.gif',
  'maquina-belt-squat-sentadilla-con-cinturon': 'barbell_full_squat.gif',
  'extensiones-de-pierna-en-polea-baja-con-tobillera': 'band_seated_leg_extension_male.gif',
  'peso-muerto-rumano-rdl-con-barra': 'barbell_romanian_deadlift.gif',
  'peso-muerto-rumano-con-mancuernas': 'dumbbell_romanian_deadlift.gif',
  'peso-muerto-rumano-en-maquina-smith': 'barbell_romanian_deadlift.gif',
  'peso-muerto-rumano-a-una-pierna-con-mancuernas': 'dumbbell_single_leg_deadlift.gif',
  'peso-muerto-rumano-con-barra-hexagonal': 'barbell_romanian_deadlift.gif',
  'peso-muerto-piernas-rigidas-stiff-leg-deadlift-con-barra': 'barbell_deadlift.gif',
  'peso-muerto-piernas-rigidas-con-mancuernas': 'dumbbell_stiff_leg_deadlift.gif',
  'peso-muerto-sumo-con-barra': 'barbell_sumo_deadlift.gif',
  'peso-muerto-sumo-con-kettlebell-pesado': 'barbell_sumo_deadlift.gif',
  'curl-de-isquiotibiales-acostado-en-maquina-lying-leg-curl': 'lever_lying_leg_curl.gif',
  'curl-de-isquiotibiales-acostado-unilateral': 'lever_lying_leg_curl.gif',
  'curl-de-isquiotibiales-sentado-en-maquina-seated-leg-curl': 'lever_seated_leg_curl.gif',
  'curl-de-isquiotibiales-sentado-unilateral': 'lever_seated_leg_curl.gif',
  'curl-de-isquiotibiales-de-pie-en-maquina-a-una-pierna': 'cable_standing_leg_curl.gif',
  'curl-de-isquiotibiales-con-mancuerna-acostado-boca-abajo': 'lever_lying_leg_curl.gif',
  'curl-nordico-asistido-nordic-hamstring-curl': 'self_assisted_inverse_leg_curl_version_2.gif',
  'curl-nordico-libre-o-con-peso': 'self_assisted_inverse_leg_curl_version_2.gif',
  'curl-de-femorales-deslizante-en-el-suelo-con-discos-o-toallas': 'lever_lying_leg_curl.gif',
  'curl-de-femorales-en-pelota-suiza-fitball': 'pull_in_on_stability_ball.gif',
  'curl-de-femorales-en-polea-baja-con-tobillera-de-pie': 'cable_standing_leg_curl.gif',
  'curl-de-femorales-en-polea-baja-acostado-en-el-suelo': 'lever_lying_leg_curl.gif',
  'hip-thrust-empuje-de-cadera-con-barra-en-banco': 'barbell_hip_thrust.gif',
  'hip-thrust-en-maquina-especifica': 'smith_hip_raise.gif',
  'hip-thrust-en-maquina-smith': 'smith_hip_raise.gif',
  'hip-thrust-a-una-sola-pierna-con-peso-corporal-o-mancuerna': 'barbell_one_leg_hip_thrust.gif',
  'hip-thrust-con-banda-de-resistencia': 'band_hip_lift.gif',
  'puente-de-gluteos-en-el-suelo-glute-bridge-libre': 'barbell_glute_bridge_hands_on_bar.gif',
  'puente-de-gluteos-lastrado-con-barra': 'barbell_glute_bridge_two_legs_on_bench_male.gif',
  'puente-de-gluteos-a-una-pierna-en-el-suelo': 'hip_raise_bent_knee.gif',
  'frog-pumps-puente-de-gluteos-con-plantas-de-los-pies-juntas': 'hip_raise_bent_knee.gif',
  'patada-de-gluteo-en-polea-baja-de-pie': 'cable_standing_hip_extension.gif',
  'patada-de-gluteo-en-maquina-especifica-glute-kickback-machine': 'lever_standing_rear_kick.gif',
  'patada-de-gluteo-en-cuadrupedia-con-tobilleras-lastradas': 'cable_kickback.gif',
  'patada-de-gluteo-en-maquina-smith-empujando-la-barra-con-la-planta': 'lever_standing_rear_kick.gif',
  'extensiones-de-cadera-en-maquina-de-hiperextensiones-enfasis-gluteo': 'hyperextension.gif',
  'abduccion-de-cadera-en-maquina-sentada': 'lever_seated_hip_abduction.gif',
  'abduccion-de-cadera-en-maquina-inclinado-hacia-adelante': 'lever_seated_hip_abduction.gif',
  'abduccion-de-cadera-acostado-de-lado-con-tobillera-lastrada': 'side_bridge_hip_abduction.gif',
  'caminata-lateral-con-banda-elastica-monster-walks': 'x_band_side_walk.gif',
  'sentadilla-lateral-con-banda-side-steps': 'x_band_side_walk.gif',
  'pull-through-en-polea-baja-con-cuerda-de-espaldas-a-la-polea': 'cable_pull_through.gif',
  'kettlebell-swing-balanceo-a-dos-manos': 'band_pull_through.gif',
  'kettlebell-swing-a-una-mano': 'band_pull_through.gif',
  'buenos-dias-con-banda-elastica-gruesa': 'band_stiff_leg_deadlift.gif',
  'aduccion-de-cadera-en-polea-baja-de-pie': 'cable_hip_adduction.gif',
  'sentadilla-cossack-libre-o-con-kettlebell': 'barbell_lateral_lunge.gif',
  'copenhague-planks-planchas-de-aductor-en-banco': 'side_plank_hip_adduction.gif',

  // ===================== BRAZOS =====================
  // Bíceps
  'curl-de-biceps-de-pie-con-barra-recta': 'barbell_curl.gif',
  'curl-de-biceps-de-pie-con-barra-ez': 'ez_barbell_curl.gif',
  'curl-de-biceps-alterno-con-mancuernas-de-pie': 'dumbbell_alternate_biceps_curl.gif',
  'curl-de-biceps-simultaneo-con-mancuernas-de-pie': 'dumbbell_standing_concentration_curl.gif',
  'curl-declinado-boca-abajo-en-banco-spider-curl-con-barra-ez': 'ez_barbell_spider_curl.gif',
  'curl-spider-con-mancuernas': 'dumbbell_single_spider_curl_with_chest_support.gif',
  'curl-de-concentracion-sentado-con-mancuerna-apoyando-codo-en-muslo': 'dumbbell_concentration_curl.gif',
  'curl-de-concentracion-de-pie-inclinado-libre': 'dumbbell_standing_concentration_curl.gif',
  'curl-predicador-scott-en-banco-con-barra-ez': 'ez_barbell_close_grip_preacher_curl.gif',
  'curl-predicador-con-mancuerna-a-una-mano': 'dumbbell_preacher_curl.gif',
  'curl-predicador-en-maquina-de-placas': 'lever_preacher_curl_version_2.gif',
  'curl-de-biceps-en-polea-baja-con-barra-recta': 'cable_curl.gif',
  'curl-de-biceps-en-polea-baja-con-barra-ez': 'cable_biceps_curl_sz_bar.gif',
  'curl-de-biceps-en-polea-baja-a-una-mano-con-anilla-d-handle': 'cable_one_arm_curl.gif',
  'curl-doble-en-polea-alta-cristos-o-pose-de-doble-biceps': 'cable_one_arm_inner_biceps_curl.gif',
  'curl-de-biceps-tumbado-en-el-suelo-con-polea-baja': 'cable_lying_bicep_curl.gif',
  'curl-cruzado-al-pecho-con-mancuernas-pinwheel-curl': 'dumbbell_cross_body_hammer_curl.gif',
  'curl-arrastre-drag-curl-con-barra-codos-hacia-atras': 'barbell_drag_curl.gif',
  'curl-arrastre-con-maquina-smith': 'barbell_drag_curl.gif',
  'curl-arrastre-con-mancuernas': 'dumbbell_cross_body_hammer_curl_version_2.gif',
  'curl-bayesiano-en-polea-de-espaldas-a-la-polea-baja': 'cable_one_arm_curl.gif',
  'curl-martillo-hammer-curl-con-mancuernas-simultaneo': 'dumbbell_one_arm_standing_hammer_curl.gif',
  'curl-martillo-con-mancuernas-alterno': 'dumbbell_cross_body_hammer_curl.gif',
  'curl-martillo-con-cuerda-en-polea-baja': 'cable_hammer_curl_with_rope.gif',
  'curl-martillo-en-banco-predicador-con-mancuerna': 'dumbbell_one_arm_hammer_preacher_curl.gif',
  'curl-inverso-agarre-prono-con-barra-recta': 'barbell_reverse_curl.gif',
  'curl-inverso-con-barra-ez': 'ez_barbell_reverse_grip_curl.gif',
  'curl-inverso-en-polea-baja-con-barra-recta': 'cable_reverse_one_arm_curl.gif',
  'curl-zottman-con-mancuernas-subida-supina-bajada-prona': 'dumbbell_alternate_biceps_curl.gif',
  'curl-de-biceps-estricto-apoyando-espalda-y-triceps-en-la-pared': 'barbell_curl.gif',
  // Antebrazo
  'flexion-de-muneca-por-detras-de-la-espalda-con-barra': 'barbell_behind_back_finger_curl.gif',
  'flexion-de-muneca-en-polea-baja': 'cable_wrist_curl.gif',
  'rodillo-de-muneca-wrist-roller-hacia-arriba-flexion': 'wrist_roller.gif',
  'rodillo-de-muneca-hacia-abajo-extension': 'wrist_roller.gif',
  'retenciones-isometricas-de-discos-por-pinzamiento-plate-pinches': null,
  'colgar-de-la-barra-a-una-o-dos-manos-dead-hangs': 'hanging_scapular_shrug.gif',
  'paseo-del-granjero-con-agarre-de-pinza-discos': 'farmers_walk.gif',
  'rotacion-de-antebrazos-con-maza-pesada-macebell-o-mancuerna-unilateral': 'wrist_roller.gif',
  'fat-gripz-curls-cualquier-curl-con-adaptadores-de-agarre-grueso': 'barbell_curl.gif',
  // Tríceps
  'extension-de-triceps-en-polea-alta-con-cuerda': 'cable_overhead_triceps_extension_rope_attachment.gif',
  'extension-de-triceps-en-polea-alta-con-barra-recta': 'cable_pulldown.gif',
  'extension-de-triceps-en-polea-alta-con-barra-v': 'cable_triceps_pushdown_v_bar_attachment.gif',
  'extension-de-triceps-en-polea-alta-con-agarre-inverso-supino': 'cable_reverse_grip_triceps_pushdown_sz_bar.gif',
  'extension-de-triceps-en-polea-alta-a-una-mano-con-anilla-prono': 'cable_one_arm_tricep_pushdown.gif',
  'extension-de-triceps-en-polea-alta-a-una-mano-con-anilla-supino': 'cable_one_arm_side_triceps_pushdown.gif',
  'extension-de-triceps-en-polea-alta-sin-accesorio-agarrando-la-bola-del-cable': 'cable_one_arm_tricep_pushdown.gif',
  'press-frances-skullcrushers-o-rompecraneos-con-barra-ez-recostado': 'barbell_lying_triceps_extension_skull_crusher.gif',
  'press-frances-con-barra-recta-recostado': 'barbell_lying_close_grip_triceps_extension.gif',
  'press-frances-con-mancuernas-recostado': 'dumbbell_lying_alternate_extension.gif',
  'press-frances-declinado-con-barra-ez': 'ez_barbell_decline_triceps_extension.gif',
  'extension-de-triceps-tras-nuca-con-barra-ez-sentado-o-de-pie': 'ez_barbell_seated_triceps_extension.gif',
  'extension-de-triceps-tras-nuca-con-mancuerna-a-dos-manos': 'dumbbell_seated_triceps_extension.gif',
  'extension-de-triceps-tras-nuca-con-mancuerna-a-una-mano': 'dumbbell_seated_triceps_extension.gif',
  'extension-de-triceps-tras-nuca-en-polea-baja-con-cuerda': 'cable_rope_high_pulley_overhead_tricep_extension.gif',
  'extension-de-triceps-tras-nuca-en-polea-alta-de-espaldas-a-la-maquina': 'cable_one_arm_high_pulley_overhead_tricep_extension.gif',
  'extension-de-triceps-katana-en-polea-cruzado-por-detras-de-la-cabeza': 'cable_one_arm_high_pulley_overhead_tricep_extension.gif',
  'patada-de-triceps-triceps-kickback-con-mancuerna-apoyado-en-banco': 'dumbbell_kickback.gif',
  'patada-de-triceps-con-dos-mancuernas-inclinado-de-pie': 'dumbbell_seated_bent_over_alternate_kickback.gif',
  'patada-de-triceps-en-polea-baja-sin-accesorio': 'cable_kickback.gif',
  'fondos-entre-bancos-bench-dips-con-peso-corporal': 'bench_dip_on_floor.gif',
  'fondos-entre-bancos-lastrados-discos-en-las-piernas': 'triceps_dip_bench_leg.gif',
  'press-de-banca-agarre-cerrado-close-grip-bench-press': 'barbell_close_grip_bench_press.gif',
  'press-de-banca-agarre-cerrado-en-maquina-smith': 'barbell_close_grip_bench_press.gif',
  'press-de-banca-declinado-agarre-cerrado': 'barbell_decline_close_grip_to_skull_press.gif',
  'press-jm-jm-press-con-barra-hibrido-entre-press-cerrado-y-frances': 'ez_barbell_jm_bench_press.gif',
  'press-jm-en-maquina-smith': 'ez_barbell_jm_bench_press.gif',
  'press-tate-con-mancuernas-recostado-en-banco': 'dumbbell_tate_press.gif',
  'extension-cruzada-en-polea-alta-a-una-mano-tirando-en-diagonal': 'cable_standing_high_cross_triceps_extension.gif',
  'extension-de-triceps-acostado-en-el-suelo-floor-skullcrushers-con-barra': 'cable_rope_lying_on_floor_tricep_extension.gif',
  'extension-de-triceps-acostado-en-el-suelo-con-kettlebells-o-mancuernas': 'dumbbell_lying_alternate_extension.gif',
  'extension-de-triceps-en-maquina-sentado-triceps-extension-machine': 'Lever_Triceps_Extension_720.gif',
  'flexiones-diamante-o-de-esfinge-sphinx-push-ups': 'diamond_push_up.gif',
  'extension-de-triceps-con-peso-corporal-contra-barra-smith-trx-o-mesa': 'body_up.gif',
  'rolling-triceps-extensions-con-mancuernas-en-banco-plano': 'dumbbell_lying_alternate_extension.gif',
  'extensiones-pjr-pull-over-extension-con-mancuerna-pesada': 'dumbbell_pullover.gif',
  'press-spoto-con-agarre-cerrado': 'barbell_close_grip_bench_press.gif',
  'extension-de-triceps-a-una-mano-apoyado-de-lado-en-el-suelo': 'bodyweight_side_lying_biceps_curl.gif',
  'extension-de-triceps-con-banda-de-resistencia-atada-en-alto': 'band_pushdown_male.gif',
  'fondos-en-anillas-manteniendo-las-correas-tocando-los-biceps-bulgarian-dips': 'chest_dip.gif',

  // ===================== CORE / ABDOMEN =====================
  'crunch-abdominal-clasico-en-el-suelo': 'sit_up_with_arms_on_chest.gif',
  'crunch-con-piernas-elevadas-a-90-grados': 'crunch_single_leg_lift.gif',
  'crunch-en-banco-declinado': 'extra_decline_sit_up.gif',
  'crunch-declinado-con-peso-disco-en-el-pecho-o-nuca': 'extra_decline_sit_up.gif',
  'crunch-en-polea-alta-con-cuerda-de-rodillas-cable-crunch': 'cable_kneeling_crunch.gif',
  'crunch-en-maquina-sentada': 'lever_seated_crunch.gif',
  'elevacion-de-piernas-colgado-en-barra-toes-to-bar-o-a-90': 'hanging_leg_hip_raise.gif',
  'elevacion-de-rodillas-colgado-en-barra': 'hanging_leg_hip_raise.gif',
  'elevacion-de-piernas-en-silla-romana-captain-s-chair': 'captains_chair_straight_leg_raise.gif',
  'elevacion-de-piernas-acostado-en-el-suelo-leg-raises': 'lying_leg_raise.gif',
  'elevacion-de-piernas-acostado-en-banco-plano-o-declinado': 'leg_pull_in_flat_bench.gif',
  'plancha-frontal-isometrica-plank-en-antebrazos': 'front_plank.gif',
  'plancha-frontal-con-brazos-estirados': 'front_plank.gif',
  'plancha-frontal-lastrada-con-disco-en-la-espalda': 'front_plank.gif',
  'plancha-frontal-con-deslizamiento-hacia-adelante-y-atras-body-saw': 'front_plank.gif',
  'plancha-lateral-apoyado-en-antebrazo': 'side_plank.gif',
  'plancha-lateral-con-elevacion-de-pierna-estrella': 'side_plank_oblique_crunch.gif',
  'rueda-abdominal-de-rodillas-ab-wheel-rollout': 'wheel_rollout.gif',
  'rueda-abdominal-de-pie-avanzado': 'standing_wheel_rollout.gif',
  'rollout-con-barra-de-pesas-en-el-suelo': 'wheel_rollout.gif',
  'rollout-en-pelota-suiza-fitball': 'stability_ball_crunch_full_range_hands_behind_head.gif',
  'giros-rusos-russian-twists-sin-peso': 'russian_twist.gif',
  'giros-rusos-con-balon-medicinal-disco-o-kettlebell': 'weighted_russian_twist.gif',
  'toques-de-talon-alternos-recostado-heel-touches': 'alternate_heel_touchers.gif',
  'crunch-bicicleta-bicycle-crunches': 'elbow_to_knee.gif',
  'tijeras-horizontales-flutter-kicks-acostado': 'seated_flutter_kick.gif',
  'tijeras-verticales-scissor-kicks-acostado': 'lying_straight_leg_marches.gif',
  'v-ups-abdominales-en-v-o-navajas': 'dumbbell_v_up.gif',
  'v-ups-alternos-a-una-pierna': 'dumbbell_v_up.gif',
  'bicho-muerto-con-resistencia-de-banda-elastica': null,
  'pajaro-perro-bird-dog-o-superman-en-cuadrupedia': null,
  'lenador-woodchopper-en-polea-alta-de-arriba-hacia-abajo-diagonal': 'cable_twist_up_down.gif',
  'lenador-en-polea-baja-de-abajo-hacia-arriba-diagonal': 'cable_standing_lift.gif',
  'lenador-horizontal-en-polea-media': 'cable_twisting_pull.gif',
  'flexion-lateral-del-tronco-con-mancuerna-de-pie': 'dumbbell_side_bend.gif',
  'extension-lateral-de-tronco-en-silla-romana-a-45-grados': 'side_bend.gif',
  'dragon-flag-clasico-o-en-progresiones-piernas-encogidas': 'leg_raise_dragon_flag.gif',
  'abdominales-estilo-mariposa-butterfly-sit-ups': 'janda_sit_up.gif',
  'hollow-body-hold-posicion-de-canoa-isometrica': 'hollow_hold.gif',
  'hollow-body-rocks-balanceos-en-canoa': 'hollow_hold.gif',
  'plancha-copenhague-copenhagen-plank-para-aductores-y-oblicuos': 'side_plank_hip_adduction.gif',
  'press-pallof-isometrico-en-polea-o-con-banda-antirrotacion': 'cable_half_kneeling_pallof_press.gif',
  'press-pallof-con-empuje-o-elevacion-vertical': 'cable_half_kneeling_pallof_press.gif',
  'elevacion-de-pelvis-en-el-suelo-a-una-pierna-isometrico': 'hip_raise_bent_knee.gif',
  'escaladores-cruzados-cross-body-mountain-climbers': 'mountain_climber.gif',
  'l-sit-isometrico-en-paralelas-o-suelo': null,
  'l-sit-en-barra-de-dominadas-colgado': 'hanging_straight_leg_raise.gif',
  'burpees-clasicos-sin-flexion': 'burpee.gif',
  'burpees-con-flexion-de-pecho-y-salto': 'burpee.gif',
  'mountain-climbers-escaladores-frontales-rapidos': 'mountain_climber.gif',
  'levantamiento-turco-turkish-get-up-con-kettlebell-o-mancuerna': null,
  'arrancada-snatch-con-barra-olimpica': null,
  'arrancada-de-potencia-power-snatch': null,
  'arrancada-con-mancuerna-a-una-mano': null,
  'arrancada-con-kettlebell': null,
  'cargada-y-envion-clean-and-jerk': null,
  'cargada-de-potencia-power-clean-con-barra': null,
  'cargada-colgante-hang-clean-con-barra': null,
  'push-jerk-con-barra': 'barbell_standing_military_press_without_rack.gif',
  'thruster-sentadilla-frontal-press-militar-en-un-movimiento-continuo-con-barra': 'landmine_front_squat.gif',
  'thruster-con-mancuernas-o-kettlebells': 'dumbbell_goblet_squat.gif',
  'balon-medicinal-contra-la-pared-wall-balls': null,
  'golpes-de-balon-medicinal-contra-el-suelo-slam-balls': null,
  'cuerdas-de-batalla-battle-ropes-ondulaciones-simultaneas': null,
  'cuerdas-de-batalla-ondulaciones-alternas': null,
  'cuerdas-de-batalla-con-golpe-slams': null,
  'empuje-de-trineo-prowler-o-sled-push': null,
  'arrastre-de-trineo-sled-pull-de-espaldas': null,
  'arrastre-de-trineo-tirando-con-los-brazos': null,
  'remo-en-ergometro-rowing-machine': 'rowing_with_rowing_machine.gif',
  'saltos-al-cajon-box-jumps-frontales': 'jump_step_up_male.gif',
  'saltos-al-cajon-desde-sentado-seated-box-jumps': 'jump_step_up_male.gif',
  'saltos-en-profundidad-depth-jumps': 'squat_tuck_jump.gif',
  'saltos-largos-sin-carrera-broad-jumps': 'squat_tuck_jump.gif',
  'saltos-de-rodillas-al-pecho-tuck-jumps': 'tuck_jump_version_2.gif',
  'volteo-de-neumatico-pesado-tire-flip': null,
  'caminata-del-oso-bear-crawl-pesada-o-de-distancia': null,
  'golpe-de-maza-sobre-neumatico-sledgehammer-strikes': null,
  'caminata-en-cinta-con-chaleco-lastrado-y-maxima-inclinacion': 'walking_on_incline_treadmill.gif',
  'maquina-de-escaleras-stairmaster-o-subida-de-escaleras-lastrado': 'walking_on_stepmill.gif',
  'saltos-dobles-a-la-comba-double-unders': 'jump_rope_male.gif',
  'skierg-maquina-de-esqui': 'walk_wave_machine.gif',
};

// Add GIF paths to exercises
for (const groupKey in EXERCISE_LIBRARY) {
  const group = EXERCISE_LIBRARY[groupKey];
  for (const ex of group.exercises) {
    const gifFile = GIF_MAPPING[ex.id];
    ex.gif = gifFile ? `assets/gifs/${gifFile}` : null;
  }
}

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

  /* ---- CUSTOM EXERCISES ---- */
  static async getCustomExercisesByTrainer(trainerId) {
    const q = query(collection(db, 'customExercises'), where('trainerId', '==', trainerId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => (b.createdAt?.seconds || 0) - (a.createdAt?.seconds || 0));
  }

  static async saveCustomExercise(ex) {
    const { id, ...data } = ex;
    if (id) {
      await setDoc(doc(db, 'customExercises', id), { ...data, updatedAt: serverTimestamp() }, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'customExercises'), { ...data, createdAt: serverTimestamp() });
      return ref.id;
    }
  }

  static async deleteCustomExercise(id) {
    await deleteDoc(doc(db, 'customExercises', id));
  }

  /* ---- EXERCISE PHOTOS ---- */
  static async getExercisePhoto(userId, exerciseId) {
    const docId = `${userId}_${exerciseId}`;
    const snap = await getDoc(doc(db, 'exercisePhotos', docId));
    return snap.exists() ? { id: snap.id, ...snap.data() } : null;
  }

  static async saveExercisePhoto(photo) {
    const { userId, exerciseId, base64 } = photo;
    const docId = `${userId}_${exerciseId}`;
    await setDoc(doc(db, 'exercisePhotos', docId), { userId, exerciseId, base64, updatedAt: serverTimestamp() }, { merge: true });
    return docId;
  }

  /* ---- PROGRESS PHOTOS ---- */
  static async getProgressPhotosByClient(clientId) {
    const q = query(collection(db, 'progressPhotos'), where('clientId', '==', clientId));
    const snap = await getDocs(q);
    return snap.docs
      .map(d => ({ id: d.id, ...d.data() }))
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }

  static async saveProgressPhoto(photo) {
    const { id, ...data } = photo;
    if (id) {
      await setDoc(doc(db, 'progressPhotos', id), data, { merge: true });
      return id;
    } else {
      const ref = await addDoc(collection(db, 'progressPhotos'), data);
      return ref.id;
    }
  }

  static async deleteProgressPhoto(id) {
    await deleteDoc(doc(db, 'progressPhotos', id));
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
