// admin.js — Panel Admin Melsya Teknik Center
import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { getFirestore, collection, addDoc, getDocs } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:7a5f8b7c9d6e5f4a3b2c1d"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

console.log("✅ Admin Panel Terhubung");

// Fungsi Login
export async function loginAdmin(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    console.log("✅ Login berhasil:", userCredential.user.email);
    return { success: true, user: userCredential.user };
  } catch (error) {
    console.error("❌ Login gagal:", error.message);
    return { success: false, error: error.message };
  }
}

// Fungsi Logout
export async function logoutAdmin() {
  await signOut(auth);
  console.log("✅ Berhasil logout");
}

// Cek Status Login
export function checkAuth(callback) {
  onAuthStateChanged(auth, (user) => callback(user));
}

// Tambah Data Pesanan
export async function tambahPesanan(data) {
  try {
    const docRef = await addDoc(collection(db, "pesanan"), {
      ...data,
      createdAt: new Date()
    });
    console.log("✅ Pesanan tersimpan:", docRef.id);
    return { success: true, id: docRef.id };
  } catch (e) {
    console.error("❌ Gagal simpan:", e);
    return { success: false };
  }
}

// Ambil Semua Pesanan
export async function ambilPesanan() {
  const snapshot = await getDocs(collection(db, "pesanan"));
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
}

export { auth, db };
