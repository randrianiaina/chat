import { initializeApp } from 'firebase/app';
import { getFirestore } from 'firebase/firestore';
import { getDatabase } from 'firebase/database';

// Your web app's Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCQ4HyKQo0x_nRS1x_6_9l5OYDerHmhZeU",
  authDomain: "only-texto.firebaseapp.com",
  projectId: "only-texto",
  storageBucket: "only-texto.firebasestorage.app",
  messagingSenderId: "998617720537",
  appId: "1:998617720537:web:3337ca415d20dc43d600c8",
  databaseURL: "https://only-texto.firebaseio.com"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const rtdb = getDatabase(app);

export { db, rtdb };
