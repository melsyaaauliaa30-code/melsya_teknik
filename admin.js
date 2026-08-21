// admin.js — Panel Admin Firebase
import { auth, db } from './app.js';
import { signInWithEmailAndPassword, signOut, onAuthStateChanged } 
  from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { collection, getDocs, addDoc, deleteDoc, doc } 
  from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

// ELEMEN HTML
const loginForm = document.getElementById('loginForm');
const adminPanel = document.getElementById('adminPanel');
const btnLogout = document.getElementById('btnLogout');
const statusUser = document.getElementById('statusUser');

// CEK STATUS LOGIN
onAuthStateChanged(auth, (user) => {
  if (user) {
    loginForm.style.display = 'none';
    adminPanel.style.display = 'block';
    statusUser.textContent = `Login sebagai: ${user.email}`;
    muatData();
  } else {
    loginForm.style.display = 'block';
    adminPanel.style.display = 'none';
  }
});

// LOGIN
document.getElementById('btnLogin').addEventListener('click', async () => {
  const email = document.getElementById('emailAdmin').value;
  const password = document.getElementById('passAdmin').value;
  
  try {
    await signInWithEmailAndPassword(auth, email, password);
    alert('✅ Login berhasil!');
  } catch (err) {
    alert('❌ Gagal login: ' + err.message);
  }
});

// LOGOUT
btnLogout.addEventListener('click', async () => {
  await signOut(auth);
  alert('✅ Berhasil logout');
});

// MUAT DATA DARI FIRESTORE
async function muatData() {
  const ref = collection(db, 'pesanan');
  const snapshot = await getDocs(ref);
  let html = '';
  snapshot.forEach(doc => {
    const data = doc.data();
    html += `<tr>
      <td>${data.nama || '-'}</td>
      <td>${data.telepon || '-'}</td>
      <td>${data.layanan || '-'}</td>
      <td><button data-id="${doc.id}" class="btn-hapus">Hapus</button></td>
    </tr>`;
  });
  document.getElementById('tabelData').innerHTML = html;
}

// TAMBAH DATA (contoh)
document.getElementById('formTambah')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  const nama = document.getElementById('inputNama').value;
  const telepon = document.getElementById('inputTelepon').value;
  const layanan = document.getElementById('inputLayanan').value;
  
  await addDoc(collection(db, 'pesanan'), { nama, telepon, layanan, tanggal: new Date() });
  alert('✅ Data tersimpan!');
  e.target.reset();
  muatData();
});

console.log("✅ Admin.js dimuat");
