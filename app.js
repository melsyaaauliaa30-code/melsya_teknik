// app.js — Firebase Configuration
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-analytics.js";
import { getAuth } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// KONFIGURASI FIREBASE — SUDAH LENGKAP
const firebaseConfig = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:xxxxxxxxxxxxxxxxxxxxxxxx",
  measurementId: "G-XXXXXXXXXX"
};

// INISIALISASI FIREBASE
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth(app);
const db = getFirestore(app);

// EXPORT UNTUK DIGUNAKAN DI FILE LAIN
export { app, auth, db };

console.log("✅ Firebase terhubung — Melsya Teknik Center");
