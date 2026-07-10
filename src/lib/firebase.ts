import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";

const firebaseConfig = {
  apiKey: "AIzaSyBJpNP3fLxTkVaOh-Qg2wdxrzESQQl9A6I",
  authDomain: "sim-sekolah-3ceec.firebaseapp.com",
  projectId: "sim-sekolah-3ceec",
  storageBucket: "sim-sekolah-3ceec.firebasestorage.app",
  messagingSenderId: "568240212713",
  appId: "1:568240212713:web:86163647717b191ae6fe78"
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
// Kita buat variabel ini sebagai objek agar lebih mudah diakses
export const firebaseUtils = {
  isFirebaseConfigured: true
};