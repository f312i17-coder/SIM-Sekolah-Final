// Import the functions you need from the SDKs you need
import { initializeApp } from "firebase/app";
import { getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
export const isFirebaseConfigured = true;

const firebaseConfig = {
  apiKey: "AIzaSyBJpNP3fLxTkVaOh-Qg2wdxrzESQQl9A6I",
  authDomain: "sim-sekolah-3ceec.firebaseapp.com",
  projectId: "sim-sekolah-3ceec",
  storageBucket: "sim-sekolah-3ceec.firebasestorage.app",
  messagingSenderId: "568240212713",
  appId: "1:568240212713:web:86163647717b191ae6fe78"
};

// Initialize Firebase
const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);
export const auth = getAuth(app);
