// firebase.js
import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: "AIzaSyDyfeHfZkFfgOGn9rggbRfm07hRK6t2j74",
  authDomain: "hulu-36337.firebaseapp.com",
  projectId: "hulu-36337",
  storageBucket: "hulu-36337.appspot.com",
  messagingSenderId: "95932261605",
  appId: "1:95932261605:web:cedfba328f8176543aa00c",
  measurementId: "G-QX62RLXM7C"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default db;
