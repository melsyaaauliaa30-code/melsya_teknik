import { initializeApp } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-app.js";
import { getFirestore, collection, addDoc, serverTimestamp, doc, getDoc } from "https://www.gstatic.com/firebasejs/12.18.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:8c7d2f5a4e3b1c2d3e4f5a"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const NOMOR_WA_TUJUAN = '6285356434003';

// Baca lokasi bengkel dari Firebase
async function muatLokasiBengkel() {
  try {
    const docRef = doc(db, "pengaturan", "lokasi_bengkel");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      const data = docSnap.data();
      window.BENGKEL_LAT = data.lat || -0.6432566;
      window.BENGKEL_LNG = data.lng || 100.7552686;
      // Update tampilan
      document.getElementById('koordinatBengkel').textContent = 
        `${window.BENGKEL_LAT}, ${window.BENGKEL_LNG} — Sawahlunto, Sumatera Barat`;
      document.getElementById('linkLokasiBengkel').href = 
        `https://www.google.com/maps/search/?api=1&query=${window.BENGKEL_LAT},${window.BENGKEL_LNG}`;
      document.getElementById('footerLokasiBengkel').href = 
        `https://www.google.com/maps/search/?api=1&query=${window.BENGKEL_LAT},${window.BENGKEL_LNG}`;
      document.getElementById('footerLokasiBengkel').textContent = 
        `${window.BENGKEL_LAT}, ${window.BENGKEL_LNG}`;
    }
  } catch (e) {
    console.log('Gagal muat lokasi bengkel, pakai default');
  }
}

document.addEventListener('DOMContentLoaded', () => {
  muatLokasiBengkel();
  
  const form = document.getElementById('orderForm');
  if (!form) return;

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const nama = document.getElementById('nama').value.trim();
    const lok
    const nama = document.getElementById('nama').value.trim();
    const lokasiGps = document.getElementById('lokasiGps').value.trim();
    const catatan = document.getElementById('catatan')?.value.trim() || '';

    // Validasi
    if (!nama) { alert('❌ Silakan isi nama lengkap!'); return; }
    if (!lokasiGps) { alert('❌ Silakan deteksi lokasi GPS terlebih dahulu!'); return; }

    // Pisahkan koordinat
    let lat = '', lng = '';
    if (lokasiGps && lokasiGps.includes(',')) {
      [lat, lng] = lokasiGps.split(',').map(s => s.trim());
    }

    // Ambil data perangkat
    const perangkatList = [];
    document.querySelectorAll('.perangkat-item').forEach((item) => {
      const jenis = item.querySelector('.jenis-perangkat').value;
      if (!jenis) return;
      perangkatList.push({
        jenis,
        merek: item.querySelector('.merek-perangkat').value.trim(),
        kerusakan: item.querySelector('.jenis-kerusakan').value,
        keterangan: item.querySelector('.keterangan-perangkat').value.trim()
      });
    });

    if (perangkatList.length === 0) {
      alert('❌ Silakan pilih perangkat yang akan diservis!');
      return;
    }

    // ===== 1. Simpan ke Firestore =====
    let pesananId = '';
    try {
      const docRef = await addDoc(collection(db, "orders"), {
        nama,
        lokasiGps,
        lat,
        lng,
        perangkat: perangkatList,
        catatan,
        status: 'baru',
        createdAt: serverTimestamp()
      });
      pesananId = docRef.id;
      console.log('✅ Pesanan tersimpan:', pesananId);
    } catch (err) {
      console.error('❌ Gagal simpan:', err);
    }

    // ===== 2. Susun Pesan WhatsApp =====
    const bLat = window.BENGKEL_LAT || -0.6432566;
    const bLng = window.BENGKEL_LNG || 100.7552686;

    let pesan = `🔔 *PESANAN SERVIS BARU*
────────────────────
🆔 *No. Pesanan:* ${pesananId || 'Tanpa ID'}
👤 *Nama:* ${nama}
📍 *Lokasi Pelanggan:* ${lokasiGps}
🗺️ *Buka di Maps:* https://www.google.com/maps/search/?api=1&query=${lat},${lng}
🏠 *Lokasi Bengkel:* ${bLat}, ${bLng}
────────────────────
🔧 *DAFTAR PERANGKAT:*
`;
    perangkatList.forEach((p, i) => {
      pesan += `
*Perangkat #${i+1}*
├─ Jenis: ${p.jenis}
├─ Merek: ${p.merek || '-'}
├─ Kerusakan: ${p.kerusakan || '-'}
└─ Keterangan: ${p.keterangan || '-'}`;
    });

    if (catatan) pesan += `\n────────────────────\n📝 *Catatan:* ${catatan}`;
    pesan += `\n────────────────────\n*Dari Melsya Teknik Center*`;

    // ===== 3. Buka WhatsApp =====
    const waUrl = `https://wa.me/${NOMOR_WA_TUJUAN}?text=${encodeURIComponent(pesan)}`;
    window.open(waUrl, '_blank');

    // ===== 4. Reset Form =====
    form.reset();
    document.getElementById('mapContainer')?.classList.add('hidden');
    alert('✅ Pesanan berhasil dikirim! Terima kasih.');
  });
});

export { db };
