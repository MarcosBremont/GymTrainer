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
      { id: 'elevacion-de-talones-de-pie-en-maquina', name: 'Elevación de talones de pie en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-de-pie-con-barra-libre', name: 'Elevación de talones de pie con barra libre', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-maquina-smith-sobre-un-step', name: 'Elevación de talones en máquina Smith (sobre un step)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-a-una-pierna-con-mancuerna', name: 'Elevación de talones a una pierna con mancuerna', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-sentado-con-barra-sobre-las-rodillas', name: 'Elevación de talones sentado con barra sobre las rodillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-sentado-con-mancuernas-sobre-rodillas', name: 'Elevación de talones sentado con mancuernas sobre rodillas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-prensa-de-piernas-a-45-grados', name: 'Elevación de talones en prensa de piernas a 45 grados', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-en-prensa-horizontal', name: 'Elevación de talones en prensa horizontal', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-donkey-calf-raises-en-maquina', name: 'Elevación de talones tipo burro (Donkey calf raises) en máquina', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-libre-con-companero-encima', name: 'Elevación de talones tipo burro libre (con compañero encima)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-tipo-burro-en-maquina-smith-flexionado-a-90', name: 'Elevación de talones tipo burro en máquina Smith (flexionado a 90º)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talones-de-pie-con-puntas-hacia-adentro', name: 'Elevaciones de talones de pie con puntas hacia adentro', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talones-de-pie-con-puntas-hacia-afuera', name: 'Elevaciones de talones de pie con puntas hacia afuera', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'andar-de-puntillas-con-mancuernas-pesadas', name: 'Andar de puntillas con mancuernas pesadas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevacion-de-talones-excentrica-a-una-pierna-en-escalon', name: 'Elevación de talones excéntrica a una pierna en escalón', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-de-pantorrillas-rotatoria-rotary-calf-machine', name: 'Máquina de pantorrillas rotatoria (Rotary calf machine)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-banda-de-resistencia', name: 'Elevaciones tibiales con banda de resistencia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-apoyado-de-espaldas-a-la-pared', name: 'Elevaciones tibiales apoyado de espaldas a la pared', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'maquina-de-elevacion-tibial-sentada', name: 'Máquina de elevación tibial sentada', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-barra-tib-tib-bar', name: 'Elevaciones tibiales con barra Tib (Tib bar)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-tibiales-con-kettlebell-en-la-punta-del-pie', name: 'Elevaciones tibiales con kettlebell en la punta del pie', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'elevaciones-de-talon-en-sentadilla-profunda-sissy-calf-raises', name: 'Elevaciones de talón en sentadilla profunda (Sissy calf raises)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'pasos-de-ganso-caminar-sobre-los-talones', name: 'Pasos de ganso (caminar sobre los talones)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
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
      { id: 'curl-de-muneca-con-barra-por-la-espalda-behind-the-back-wrist-curl', name: 'Curl de muñeca con barra por la espalda (Behind the back wrist curl)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sosten-de-mancuerna-pesada-estatico-por-tiempo', name: 'Sostén de mancuerna pesada estático por tiempo', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-dedos-con-barra-dejando-rodar-la-barra-hasta-las-puntas-y-subiendo', name: 'Curl de dedos con barra (dejando rodar la barra hasta las puntas y subiendo)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extension-de-dedos-con-gomas-o-red-de-resistencia', name: 'Extensión de dedos con gomas o red de resistencia', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-sobre-la-punta-de-los-dedos', name: 'Flexiones sobre la punta de los dedos', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dominadas-con-toallas-towel-pull-ups', name: 'Dominadas con toallas (Towel pull-ups)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sostener-peso-colgado-de-toallas', name: 'Sostener peso colgado de toallas', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'paseo-del-granjero-asimetrico-unilateral', name: 'Paseo del granjero asimétrico (unilateral)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexiones-de-munecas-con-barra-z-en-banco-predicador', name: 'Flexiones de muñecas con barra Z en banco predicador', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'sosten-de-hex-bar-trap-bar-isometrico-pesado', name: 'Sostén de hex-bar (Trap bar) isométrico pesado', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'levantamiento-de-pincho-pinch-block-deadlift', name: 'Levantamiento de pincho (Pinch block deadlift)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'levantamiento-con-rolling-thunder-o-mango-giratorio', name: 'Levantamiento con Rolling Thunder o mango giratorio', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'cierre-de-grippers-captain-of-crush-o-similares', name: 'Cierre de grippers (Captain of Crush o similares)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'levantamiento-de-barra-gruesa-axle-bar-deadlift', name: 'Levantamiento de barra gruesa (Axle bar deadlift)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'flexion-lateral-del-cuello-con-disco-apoyado-a-un-lado-de-la-cabeza', name: 'Flexión lateral del cuello con disco apoyado a un lado de la cabeza', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuello-en-maquina-de-cuello-en-4-direcciones', name: 'Extensiones de cuello en máquina de cuello en 4 direcciones', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'extensiones-de-cuello-con-banda-elastica-resistidas', name: 'Extensiones de cuello con banda elástica (resistidas)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'isometricos-de-cuello-contra-resistencia-manual', name: 'Isométricos de cuello contra resistencia manual', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'puentes-de-luchador-wrestler-s-bridge-para-cuello-avanzado', name: 'Puentes de luchador (Wrestler\'s bridge) para cuello (Avanzado)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'rotaciones-isometricas-de-cuello-contra-la-pared', name: 'Rotaciones isométricas de cuello contra la pared', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'curl-de-biceps-con-barra-de-tronco-log-curl-si-esta-disponible', name: 'Curl de bíceps con barra de tronco (Log curl) si está disponible', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'paseo-del-granjero-con-barra-olimpica-requiere-mucho-balance', name: 'Paseo del granjero con barra olímpica (requiere mucho balance)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
      { id: 'dejar-caer-el-disco-de-peso-y-atraparlo-antes-de-que-caiga-al-suelo-plate-flips', name: 'Dejar caer el disco de peso y atraparlo antes de que caiga al suelo (Plate flips)', sets: 3, reps: '10-12', rest: 60, instructions: '' },
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

// Add GIF paths to exercises
Object.values(EXERCISE_LIBRARY).forEach(group => {
  group.exercises.forEach(ex => {
    ex.gif = `assets/gifs/${ex.id}.gif`;
  });
});

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
