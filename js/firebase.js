/* ===================================================
   Gym Trainer - Firebase Initialization
   =================================================== */

import { initializeApp }       from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js';
import { getAuth }              from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-auth.js';
import { initializeFirestore,
         persistentLocalCache } from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js';
import { getStorage }           from 'https://www.gstatic.com/firebasejs/10.11.0/firebase-storage.js';

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

// Firestore con persistencia offline (API moderna, sin deprecation warnings)
export const db = initializeFirestore(primaryApp, {
  localCache: persistentLocalCache(),
});

// Firebase Storage
export const storage = getStorage(primaryApp);
