import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { 
  getAuth, signInWithEmailAndPassword, signOut, onAuthStateChanged 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-auth.js";
import { 
  getFirestore, collection, getDocs, doc, setDoc, updateDoc, query, orderBy 
} from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:8c7d2f5a4e3b1c2d3e4f5a"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);

let pesananData = [];

// ===== CEK LOGIN =====
onAuthStateChanged(auth, (user) => {
  if (user) {
    tampilkanDashboard(user);
    muatLokasiBengkel();
    muatDataPesanan();
  } else {
    tampilkanLogin();
  }
});

function tampilkanLogin() {
  document.getElementById('loginPage').classList.remove('hidden');
  document.getElementById('dashboardPage').classList.add('hidden');
}

function tampilkanDashboard(user) {
  document.getElementById('loginPage').classList.add('hidden');
  document.getElementById('dashboardPage').classList.remove('hidden');
  document.getElementById('adminEmail').textContent = user.email;
}

// ===== LOGIN =====
document.getElementById('loginForm').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await signInWithEmailAndPassword(auth, document.getElementById('email').value, document.getElementById('password').value);
  } catch (err) {
    alert('❌ Gagal masuk: ' + err.message);
  }
});

// ===== LOGOUT =====
document.getElementById('btnLogout').addEventListener('click', async () => await signOut(auth));

// 📍 KELOLA LOKASI BENGKEL
async function muatLokasiBengkel() {
  try {
    const docRef = doc(db, "pengaturan", "lokasi_bengkel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const d = docSnap.data();
      document.getElementById('bengkelLat').value = d.lat;
      document.getElementById('bengkelLng').value = d.lng;
      updateLinkMaps(d.lat, d.lng);
    } else {
      document.getElementById('bengkelLat').value = -0.6432566;
      document.getElementById('bengkelLng').value = 100.7552686;
      updateLinkMaps(-0.6432566, 100.7552686);
    }
  } catch {
    updateLinkMaps(-0.6432566, 100.7552686);
  }
}

function updateLinkMaps(lat, lng) {
  document.getElementById('bukaMaps').href = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
}

document.getElementById('bengkelLat').addEventListener('input', () => {
  updateLinkMaps(document.getElementById('bengkelLat').value, document.getElementById('bengkelLng').value);
});
document.getElementById('bengkelLng').addEventListener('input', () => {
  updateLinkMaps(document.getElementById('bengkelLat').value, document.getElementById('bengkelLng').value);
});

document.getElementById('btnDeteksiLokasi').addEventListener('click', () => {
  if (!navigator.geolocation) { alert('❌ Tidak mendukung GPS'); return; }
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      document.getElementById('bengkelLat').value = pos.coords.latitude.toFixed(7);
      document.getElementById('bengkelLng').value = pos.coords.longitude.toFixed(7);
      updateLinkMaps(pos.coords.latitude, pos.coords.longitude);
    },
    () => alert('❌ Gagal deteksi lokasi'),
    { enableHighAccuracy: true }
  );
});

document.getElementById('formLokasiBengkel').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await setDoc(doc(db, "pengaturan", "lokasi_bengkel"), {
      lat: parseFloat(document.getElementById('bengkelLat').value),
      lng: parseFloat(document.getElementById('bengkelLng').value),
      updatedAt: new Date()
    });
    alert('✅ Lokasi bengkel berhasil disimpan! Halaman utama akan diperbarui otomatis.');
  } catch (err) {
    alert('❌ Gagal simpan: ' + err.message);
  }
});

// ===== MUAT & RENDER PESANAN =====
async function muatDataPesanan() {
  try {
    const q = query(collection(db, "orders"), orderBy("createdAt", "desc"));
    const snapshot = await getDocs(q);
    pesananData = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderDaftarPesanan();
    updateStatistik();
  } catch (err) {
    document.getElementById('daftarPesanan').innerHTML = '<p class="text-red-500 text-center py-8">Gagal memuat data.</p>';
  }
}

function renderDaftarPesanan() {
  const c = document.getElementById('daftarPesanan');
  if (!pesananData.length) { c.innerHTML = '<p class="text-gray-500 text-center py-8">Belum ada pesanan.</p>'; return; }
  c.innerHTML = pesananData.map(p => {
    const sClass = { baru: 'bg-yellow-100 text-yellow-700', proses: 'bg-blue-100 text-blue-700', selesai: 'bg-green-100 text-green-700', batal: 'bg-red-100 text-red-700' }[p.status] || 'bg-gray-100';
    const sText = { baru: '🆕 Baru', proses: '🔧 Proses', selesai: '✅ Selesai', batal: '❌ Batal' }[p.status] || p.status;
    const tgl = p.createdAt?.toDate ? new Date(p.createdAt.toDate()).toLocaleString('id-ID') : '-';
    return `
      <div class="border rounded-xl p-4 hover:shadow-md">
        <div class="flex flex-col md:flex-row md:justify-between gap-3">
          <div class="flex-1">
            <div class="flex gap-2 mb-2">
              <span class="font-bold text-primary">#${p.id.slice(0,8)}</span>
              <span class="px-2 py-0.5 rounded-full text-xs font-medium ${sClass}">${sText}</span>
            </div>
            <h4 class="font-semibold text-lg">${p.nama || '-'}</h4>
            <p class="text-sm text-gray-500">📍 ${p.lokasiGps || '-'} | ${tgl}</p>
            <p class="text-sm text-gray-600">🔧 ${p.perangkat?.length || 0} perangkat</p>
          </div>
          <div class="flex gap-2 flex-wrap no-print">
            <button onclick="bukaModalEdit('${p.id}')" class="bg-gray-100 hover:bg-gray-200 px-3 py-1.5 rounded-lg text-sm">
              <i class="fas fa-edit"></i> Edit
            </button>
            <button onclick="cetakNota('${p.id}')" class="bg-primary/10 text-primary hover:bg-primary/20 px-3 py-1.5 rounded-lg text-sm">
              <i class="fas fa-file-invoice"></i> Nota
            </button>
            <a href="https://www.google.com/maps/search/?api=1&query=${p.lat},${p.lng}" target="_blank" class="bg-green-100 text-green-700 hover:bg-green-200 px-3 py-1.5 rounded-lg text-sm">
              <i class="fas fa-map-marker-alt"></i> Maps
            </a>
          </div>
        </div>
      </div>`;
  }).join('');
}

function updateStatistik() {
  document.getElementById('totalPesanan').textContent = pesananData.length;
  document.getElementById('pesananBaru').textContent = pesananData.filter(p => p.status === 'baru').length;
  document.getElementById('pesananProses').textContent = pesananData.filter(p => p.status === 'proses').length;
  document.getElementById('pesananSelesai').textContent = pesananData.filter(p => p.status === 'selesai').length;
}

// ===== MODAL EDIT =====
window.bukaModalEdit = function(id) {
  const d = pesananData.find(p => p.id === id);
  document.getElementById('editId').value = id;
  document.getElementById('editNama').value = d.nama || '';
  document.getElementById('editLokasi').value = d.lokasiGps || '';
  document.getElementById('editStatus').value = d.status || 'baru';
  document.getElementById('editCatatanTeknisi').value = d.catatanTeknisi || '';
  document.getElementById('modalEdit').classList.remove('hidden');
  document.getElementById('modalEdit').classList.add('flex');
};

document.getElementById('btnBatalEdit').addEventListener('click', () => {
  document.getElementById('modalEdit').classList.add('hidden');
  document.getElementById('modalEdit').classList.remove('flex');
});

document.getElementById('formEdit').addEventListener('submit', async (e) => {
  e.preventDefault();
  try {
    await updateDoc(doc(db, "orders", document.getElementById('editId').value), {
      nama: document.getElementById('editNama').value,
      status: document.getElementById('editStatus').value,
      catatanTeknisi: document.getElementById('editCatatanTeknisi').value
    });
    alert('✅ Tersimpan!');
    document.getElementById('modalEdit').classList.add('hidden');
    muatDataPesanan();
  } catch (err) { alert('❌ Gagal: ' + err.message); }
});

// ===== CETAK NOTA =====
window.cetakNota = function(id) {
  const d = pesananData.find(p => p.id === id);
  const tgl = d.createdAt?.toDate ? new Date(d.createdAt.toDate()).toLocaleString('id-ID') : '';
  document.getElementById('areaNota').classList.remove('hidden');
  document.getElementById('nota-cetak').innerHTML = `
    <div class="text-center mb-6">
      <h2 class="text-2xl font-bold text-primary">Melsya Teknik Center</h2>
      <p class="text-gray-600">Servis Elektronik, Komputer, HP & Listrik — Sawahlunto</p>
      <hr class="my-3 border-gray-300"><h3 class="text-xl font-bold">NOTA SERVIS</h3>
    </div>
    <div class="grid grid-cols-2 gap-4 mb-6">
      <div><p class="text-sm text-gray-500">No. Pesanan</p><p class="font-bold">#${d.id.slice(0,10)}</p></div>
      <div><p class="text-sm text-gray-500">Tanggal</p><p class="font-bold">${tgl}</p></div>
      <div><p class="text-sm text-gray-500">Nama</p><p class="font-bold">${d.nama || '-'}</p></div>
      <div><p class="text-sm text-gray-500">Lokasi</p><p class="font-bold text-xs">${d.lokasiGps || '-'}</p></div>
    </div>
    <table class="w-full border-collapse mb-6">
      <thead><tr class="border-b-2 border-gray-800"><th class="text-left py-2">No</th><th>Jenis</th><th>Merek</th><th>Kerusakan</th></tr></thead>
      <tbody>${(d.perangkat||[]).map((p,i)=>`<tr class="border-b"><td>${i+1}</td><td>${p.jenis}</td><td>${p.merek||'-'}</td><td>${p.kerusakan||'-'}</td></tr>`).join('')}</tbody>
    </table>
    ${d.catatan?`<div class="mb-4"><p class="text-sm text-gray-500">Catatan Pelanggan</p><p>${d.catatan}</p></div>`:''}
    ${d.catatanTeknisi?`<div class="mb-4"><p class="text-sm text-gray-500">Catatan Teknisi</p><p class="bg-gray-100 p-2 rounded">${d.catatanTeknisi}</p></div>`:''}
    <div class="mt-10 pt-4 border-t border-gray-300 flex justify-between items-end">
      <div><p class="text-sm text-gray-500">Status: <span class="font-bold">${(d.status||'baru').toUpperCase()}</span></p></div>
      <div class="text-center"><p class="text-sm text-gray-500">Tanda Tangan</p><p class="mt-10 font-bold">___________</p><p class="text-sm">Melsya Teknik Center</p></div>
    </div>`;
};

document.getElementById('btnCetakNota').addEventListener('click', () => window.print());
document.getElementById('btnTutupNota').addEventListener('click', () => document.getElementById('areaNota').classList.add('hidden'));
document.getElementById('btnRefresh').addEventListener('click', muatDataPesanan);
