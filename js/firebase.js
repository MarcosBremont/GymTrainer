/* ===================================================
   GymTrainer Pro - Firebase Initialization
   =================================================== */

import { initializeApp }        from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth }               from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { getFirestore,
         enableIndexedDbPersistence }
                                 from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';

const firebaseConfig = {
  apiKey:            'AIzaSyAp2sD_c3SVHPz7jwmUsaj67GVn3k-KhfI',
  authDomain:        'gymtrainer-784e3.firebaseapp.com',
  projectId:         'gymtrainer-784e3',
  storageBucket:     'gymtrainer-784e3.firebasestorage.app',
  messagingSenderId: '146732218668',
  appId:             '1:146732218668:web:a00151a36e36ba6a625489',
};

// Primary app – used for the logged-in trainer/client session
const primaryApp   = initializeApp(firebaseConfig);

// Secondary app – used by the trainer to create client Auth accounts
// without disrupting the trainer's own session
const secondaryApp = initializeApp(firebaseConfig, 'secondary');

export const auth          = getAuth(primaryApp);
export const secondaryAuth = getAuth(secondaryApp);
export const db            = getFirestore(primaryApp);

// Enable offline persistence (works after first load → true PWA offline)
enableIndexedDbPersistence(db).catch(err => {
  if (err.code === 'failed-precondition') {
    console.warn('GymPro: Offline persistence only works in one tab at a time.');
  } else if (err.code === 'unimplemented') {
    console.warn('GymPro: This browser does not support offline persistence.');
  }
});
