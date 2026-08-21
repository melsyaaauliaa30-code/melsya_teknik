/* ==========================================
   app.js — Melsya Teknik Center
   Firebase Terintegrasi — Data Tersimpan Permanen
   Siap Hosting GitHub Pages & Dioperasikan dari HP
========================================== */

// ⚙️ KONFIGURASI FIREBASE — SUDAH DIISI
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:6a0fcfec60f793c2f6eb0e",
  measurementId: "G-PP8VKNQEC2"
};

// ⚙️ KONFIGURASI USAHA
const CONFIG = {
  namaUsaha: "Melsya Teknik Center",
  teknisi: "Tri Iwan Afandi",
  alamat: "Dusun Karang Anyar, Desa Santur, Kecamatan Barangin, Kota Sawahlunto",
  whatsapp: "6285356434003",
  waFormat: "0853-5643-4003",
  bengkelLat: -0.643261,
  bengkelLng: 100.755268,
  googleMapsUrl: "https://www.google.com/maps/search/?api=1&query=-0.643261,100.755268",
  namaLokasi: "Sawahlunto, Sumatera Barat",
  biayaDasarJasa: 50000,
  biayaPerKm: 2500,
  biayaMinimumTransport: 10000,
  biayaMaksimumTransport: 150000,
  masaGaransiHari: 90
};

// STATE GLOBAL
let app = null;
let db = null;
let auth = null;
const STATE = {
  perangkat: [],
  tiket: null,
  pelangganLat: null,
  pelangganLng: null,
  petaLokasi: null,
  penandaPelanggan: null,
  petaMini: null,
  petaKontak: null,
  jarakKm: 0
};

// ==========================================
// INISIALISASI FIREBASE
// ==========================================
function initFirebase() {
  try {
    app = firebase.initializeApp(FIREBASE_CONFIG);
    db = firebase.firestore();
    auth = firebase.auth();
    console.log("✅ Firebase terhubung berhasil");
    hitungTotalServis();
  } catch (err) {
    console.error("❌ Firebase error:", err);
  }
}

// ==========================================
// HITUNG TOTAL SERVIS UNTUK TAMPILAN
// ==========================================
async function hitungTotalServis() {
  if (!db) return;
  try {
    const snapshot = await db.collection("pesanan").where("status", "==", "selesai").get();
    document.getElementById("statTotalServis").textContent = snapshot.size + "+";
  } catch (e) {
    console.log("Gagal ambil total:", e);
  }
}

// ==========================================
// INISIALISASI SAAT HALAMAN DIMUAT
// ==========================================
document.addEventListener("DOMContentLoaded", function () {
  initFirebase();
  initNavigasi();
  initPeta();
  initFormPerangkat();
  initDeteksiLokasi();
  initEstimasiBiaya();
  initFAQ();
  generateTiket();
});

// ==========================================
// NAVIGASI & MENU HP
// ==========================================
function initNavigasi() {
  const toggle = document.getElementById("menuToggle");
  const navMenu = document.getElementById("navMenu");
  const navLinks = document.querySelectorAll(".nav-link");

  toggle?.addEventListener("click", () => navMenu.classList.toggle("active"));
  navLinks.forEach(link => {
    link.addEventListener("click", () => {
      navMenu?.classList.remove("active");
      navLinks.forEach(l => l.classList.remove("active"));
      link.classList.add("active");
    });
  });
}

// ==========================================
// PETA — LEAFLET + LINK GOOGLE MAPS
// ==========================================
function initPeta() {
  const miniMapEl = document.getElementById("miniMap");
  if (miniMapEl && !STATE.petaMini) {
    STATE.petaMini = L.map("miniMap", { zoomControl: false }).setView(
      [CONFIG.bengkelLat, CONFIG.bengkelLng], 15
    );
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "" }).addTo(STATE.petaMini);
    
    const marker = L.marker([CONFIG.bengkelLat, CONFIG.bengkelLng])
      .addTo(STATE.petaMini)
      .bindPopup(`<strong>${CONFIG.namaUsaha}</strong><br>${CONFIG.alamat}<br><a href="${CONFIG.googleMapsUrl}" target="_blank" style="color:blue;">👉 Buka Google Maps</a>`);
    
    STATE.petaMini.on("click", () => window.open(CONFIG.googleMapsUrl, "_blank"));
    marker.on("click", (e) => { L.DomEvent.stopPropagation(e); window.open(CONFIG.googleMapsUrl, "_blank"); });
  }

  const kontakMapEl = document.getElementById("kontakMap");
  if (kontakMapEl && !STATE.petaKontak) {
    STATE.petaKontak = L.map("kontakMap").setView([CONFIG.bengkelLat, CONFIG.bengkelLng], 16);
    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(STATE.petaKontak);
    
    const marker = L.marker([CONFIG.bengkelLat, CONFIG.bengkelLng])
      .addTo(STATE.petaKontak)
      .bindPopup(`<strong>${CONFIG.namaUsaha}</strong><br>${CONFIG.alamat}<br><a href="${CONFIG.googleMapsUrl}" target="_blank" style="color:blue;">👉 Buka Google Maps</a>`)
      .openPopup();
    
    STATE.petaKontak.on("click", () => window.open(CONFIG.googleMapsUrl, "_blank"));
    marker.on("click", (e) => { L.DomEvent.stopPropagation(e); window.open(CONFIG.googleMapsUrl, "_blank"); });
  }
}

function initPetaPelanggan() {
  const el = document.getElementById("petaLokasi");
  if (!el || STATE.petaLokasi) return;
  STATE.petaLokasi = L.map("petaLokasi").setView([CONFIG.bengkelLat, CONFIG.bengkelLng], 10);
  L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", { attribution: "© OpenStreetMap" }).addTo(STATE.petaLokasi);
  STATE.petaLokasi.on("click", (e) => setLokasiPelanggan(e.latlng.lat, e.latlng.lng, true));
}

// ==========================================
// DETEKSI LOKASI GPS
// ==========================================
function initDeteksiLokasi() {
  document.getElementById("btnDeteksiLokasi")?.addEventListener("click", deteksiLokasi);
}

function deteksiLokasi() {
  const status = document.getElementById("statusLokasi");
  status.textContent = "Mendeteksi lokasi...";
  if (!navigator.geolocation) return void (status.textContent = "❌ GPS tidak didukung");
  
  navigator.geolocation.getCurrentPosition(
    (pos) => { setLokasiPelanggan(pos.coords.latitude, pos.coords.longitude, false); status.textContent = "✅ Lokasi terdeteksi"; },
    (err) => {
      const pesan = {
        [err.PERMISSION_DENIED]: "❌ Izinkan akses lokasi",
        [err.POSITION_UNAVAILABLE]: "❌ Lokasi tidak ditemukan",
        [err.TIMEOUT]: "⏳ Menunggu terlalu lama"
      }[err.code] || "❌ Kesalahan tidak diketahui";
      status.textContent = pesan;
    },
    { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
  );
}

function setLokasiPelanggan(lat, lng, dariKlik) {
  STATE.pelangganLat = lat;
  STATE.pelangganLng = lng;
  document.getElementById("latPelanggan").value = lat.toFixed(6);
  document.getElementById("lngPelanggan").value = lng.toFixed(6);
  initPetaPelanggan();

  if (STATE.penandaPelanggan) STATE.petaLokasi.removeLayer(STATE.penandaPelanggan);
  STATE.penandaPelanggan = L.marker([lat, lng], { draggable: true }).addTo(STATE.petaLokasi).bindPopup("Lokasi Anda").openPopup();
  STATE.penandaPelanggan.on("dragend", (e) => {
    const pos = e.target.getLatLng();
    setLokasiPelanggan(pos.lat, pos.lng, true);
  });
  STATE.petaLokasi.setView([lat, lng], 13);
  hitungJarakDanOngkir();
}

function hitungJarakDanOngkir() {
  if (!STATE.pelangganLat || !STATE.pelangganLng) return;
  const jarak = hitungJarakHaversine(STATE.pelangganLat, STATE.pelangganLng, CONFIG.bengkelLat, CONFIG.bengkelLng);
  STATE.jarakKm = jarak;
  let biaya = Math.ceil(jarak * CONFIG.biayaPerKm);
  biaya = Math.max(biaya, CONFIG.biayaMinimumTransport);
  biaya = Math.min(biaya, CONFIG.biayaMaksimumTransport);
  document.getElementById("biayaOngkir").textContent = formatRupiah(biaya);
  updateEstimasi();
}

function hitungJarakHaversine(lat1, lng1, lat2, lng2) {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLng = (lng2 - lng1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ==========================================
// FORM PERANGKAT — TAMBAH/HAPUS DINAMIS
// ==========================================
let perangkatCounter = 0;
function initFormPerangkat() {
  document.getElementById("btnTambahPerangkat")?.addEventListener("click", tambahPerangkat);
  document.getElementById("formPesanan")?.addEventListener("submit", kirimPesanan);
  document.getElementById("btnReset")?.addEventListener("click", resetForm);
  document.querySelectorAll('input[name="penanganan"]').forEach(radio => {
    radio.addEventListener("change", function () {
      const box = document.getElementById("estimasiOngkir");
      box.style.display = (this.value === "Teknisi Datang" || this.value === "Antar-Jemput") && STATE.jarakKm > 0 ? "block" : "none";
      updateEstimasi();
    });
  });
}

function tambahPerangkat() {
  perangkatCounter++;
  const id = perangkatCounter;
  const container = document.getElementById("daftarPerangkat");
  const html = `
    <div class="perangkat-item" id="perangkat-${id}" style="border: 1px solid var(--gray-200); border-radius: var(--radius-md); padding: 1.2rem; margin-bottom: 1rem; background: #fefefe;">
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 1rem;">
        <h4 style="font-size: 1rem; color: var(--primary);">Perangkat #${id}</h4>
        <button type="button" class="btn btn-sm btn-secondary" onclick="hapusPerangkat(${id})">🗑️ Hapus</button>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Jenis Perangkat</label>
          <select class="form-control perangkat-jenis" required>
            <option value="">Pilih jenis...</option>
            <option>TV</option><option>Kulkas</option><option>Mesin Cuci</option><option>AC</option>
            <option>Komputer</option><option>Laptop</option><option>HP</option><option>Tablet</option>
            <option>Listrik</option><option>PLTS</option><option>Jaringan</option><option>Lainnya</option>
          </select>
        </div>
        <div class="form-group">
          <label>Merek</label>
          <input type="text" class="form-control perangkat-merek" placeholder="Contoh: Samsung, LG, Asus">
        </div>
      </div>
      <div class="form-row">
        <div class="form-group">
          <label>Model/Tipe</label>
          <input type="text" class="form-control perangkat-model" placeholder="Contoh: 43T5300">
        </div>
        <div class="form-group">
          <label>Berat (kg)</label>
          <input type="number" step="0.1" class="form-control perangkat-berat" placeholder="0.0">
        </div>
      </div>
      <div class="form-group">
        <label>Keluhan / Masalah</label>
        <textarea class="form-control perangkat-keluhan" rows="2" placeholder="Jelaskan masalah yang terjadi"></textarea>
      </div>
      <div class="form-group">
        <label>Upload Foto Perangkat</label>
        <input type="file" accept="image/*" class="form-control perangkat-foto" onchange="previewFoto(this, ${id})">
        <div class="foto-preview" id="foto-preview-${id}" style="margin-top: 0.5rem; max-width: 200px;"></div>
      </div>
    </div>
  `;
  container.insertAdjacentHTML("beforeend", html);
  updateEstimasi();
}

function hapusPerangkat(id) {
  document.getElementById(`perangkat-${id}`)?.remove();
  updateEstimasi();
}

function previewFoto(input, id) {
  const preview = document.getElementById(`foto-preview-${id}`);
  if (!input.files || !input.files[0]) return void (preview.innerHTML = "");
  const file = input.files[0];
  if (!file.type.startsWith("image/")) return void (preview.innerHTML = "<p style='color:red;'>Hanya file gambar</p>");
  if (file.size > 5 * 1024 * 1024) return void (preview.innerHTML = "<p style='color:red;'>Maksimal 5MB</p>");
  const reader = new FileReader();
  reader.onload = e => preview.innerHTML = `<img src="${e.target.result}" style="max-width:100%; border-radius: 8px;">`;
  reader.readAsDataURL(file);
}

// ==========================================
// ESTIMASI BIAYA
// ==========================================
function updateEstimasi() {
  const jumlahPerangkat = document.querySelectorAll(".perangkat-item").length;
  const penanganan = document.querySelector('input[name="penanganan"]:checked')?.value;
  let biayaJasa = CONFIG.biayaDasarJasa + jumlahPerangkat * 15000;
  let biayaTransport = 0;
  if ((penanganan === "Teknisi Datang" || penanganan === "Antar-Jemput") && STATE.jarakKm > 0) {
    biayaTransport = Math.ceil(STATE.jarakKm * CONFIG.biayaPerKm);
    biayaTransport = Math.max(biayaTransport, CONFIG.biayaMinimumTransport);
    biayaTransport = Math.min(biayaTransport, CONFIG.biayaMaksimum
Transport");
  }
  document.getElementById("estJasa").textContent = formatRupiah(biayaJasa);
  document.getElementById("estTransport").textContent = formatRupiah(biayaTransport);
  document.getElementById("estTotal").textContent = formatRupiah(biayaJasa + biayaTransport);
}

// ==========================================
// FORMAT NOMOR & TANGGAL
// ==========================================
function formatRupiah(angka) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(angka);
}

function formatTanggal(tanggal) {
  return new Intl.DateTimeFormat("id-ID", { dateStyle: "long", timeStyle: "short" }).format(tanggal);
}

// ==========================================
// GENERATE NOMOR TIKET UNIK
// ==========================================
function generateTiket() {
  const sekarang = new Date();
  const tahun = sekarang.getFullYear();
  const bulan = String(sekarang.getMonth() + 1).padStart(2, "0");
  const hari = String(sekarang.getDate()).padStart(2, "0");
  const random = String(Math.floor(Math.random() * 9999)).padStart(4, "0");
  STATE.tiket = `TKT-${tahun}${bulan}${hari}-${random}`;
  return STATE.tiket;
}

// ==========================================
// SIMPAN PESANAN KE FIREBASE
// ==========================================
async function kirimPesanan(e) {
  e.preventDefault();
  if (!db) return alert("❌ Sistem database belum siap. Silakan coba lagi.");

  const nama = document.getElementById("namaPelanggan").value.trim();
  const wa = document.getElementById("waPelanggan").value.trim();
  const alamat = document.getElementById("alamatPelanggan").value.trim();
  const penanganan = document.querySelector('input[name="penanganan"]:checked')?.value;
  const catatan = document.getElementById("catatanPelanggan").value.trim();
  const layanan = Array.from(document.querySelectorAll('input[name="layanan"]:checked')).map(c => c.value);

  if (!nama || !wa || !alamat || !penanganan) return alert("⚠️ Lengkapi data wajib (*)");
  if (!/^08[1-9][0-9]{8,11}$/.test(wa.replace(/\D/g, ""))) return alert("⚠️ Format nomor WhatsApp salah. Contoh: 0812-3456-7890");

  // Kumpulkan data perangkat
  const daftarPerangkat = [];
  document.querySelectorAll(".perangkat-item").forEach(el => {
    daftarPerangkat.push({
      jenis: el.querySelector(".perangkat-jenis")?.value || "",
      merek: el.querySelector(".perangkat-merek")?.value || "",
      model: el.querySelector(".perangkat-model")?.value || "",
      keluhan: el.querySelector(".perangkat-keluhan")?.value || "",
      berat: parseFloat(el.querySelector(".perangkat-berat")?.value || 0)
    });
  });

  const tiket = generateTiket();
  const dataPesanan = {
    tiket,
    namaPelanggan: nama,
    whatsapp: wa,
    alamat,
    layanan,
    penanganan,
    catatan,
    perangkat: daftarPerangkat,
    lokasi: STATE.pelangganLat && STATE.pelangganLng
      ? { lat: STATE.pelangganLat, lng: STATE.pelangganLng }
      : null,
    jarakKm: STATE.jarakKm || 0,
    estimasiJasa: parseInt(document.getElementById("estJasa").textContent.replace(/\D/g, "")) || 0,
    estimasiTransport: parseInt(document.getElementById("estTransport").textContent.replace(/\D/g, "")) || 0,
    estimasiTotal: parseInt(document.getElementById("estTotal").textContent.replace(/\D/g, "")) || 0,
    status: "baru",
    dibuatPada: firebase.firestore.FieldValue.serverTimestamp(),
    diperbaruiPada: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    // Simpan ke Firestore
    await db.collection("pesanan").doc(tiket).set(dataPesanan);
    
    // Tampilkan tiket
    document.getElementById("nomorTiket").textContent = tiket;
    document.getElementById("ticketInfo").style.display = "block";

    // Kirim ke WhatsApp
    const teksWA = `Halo ${CONFIG.namaUsaha}! Saya ingin memesan servis:\n
📋 NOMOR TIKET: ${tiket}
👤 Nama: ${nama}
📱 WhatsApp: ${wa}
📍 Alamat: ${alamat}
🛠️ Jenis Layanan: ${layanan.join(", ")}
📦 Penanganan: ${penanganan}
📱 Jumlah Perangkat: ${daftarPerangkat.length}
📝 Keluhan/Catatan: ${catatan || "-"}
💰 Estimasi Total: ${document.getElementById("estTotal").textContent}
🗺️ Lokasi: ${STATE.pelangganLat && STATE.pelangganLng 
      ? `https://www.google.com/maps/search/?api=1&query=${STATE.pelangganLat},${STATE.pelangganLng}` 
      : "Tidak terdeteksi"}

---
Silakan konfirmasi pesanan saya. Terima kasih!`;

    window.open(`https://wa.me/${CONFIG.whatsapp}?text=${encodeURIComponent(teksWA)}`, "_blank");
    alert("✅ Pesanan berhasil disimpan! Nomor tiket Anda: " + tiket + "\nPesan WhatsApp akan terbuka...");

  } catch (err) {
    console.error("Error simpan pesanan:", err);
    alert("⚠️ Gagal menyimpan pesanan: " + err.message);
  }
}

// ==========================================
// CEK STATUS PESANAN DARI FIREBASE
// ==========================================
async function cekStatusServis() {
  const tiket = document.getElementById("inputTiketCek").value.trim();
  const hasil = document.getElementById("hasilCekStatus");
  
  if (!tiket) return hasil.innerHTML = "<p style='color:red;'>⚠️ Masukkan nomor tiket</p>";
  if (!db) return hasil.innerHTML = "<p style='color:red;'>❌ Sistem database belum siap</p>";

  hasil.innerHTML = "<p>🔍 Mencari data pesanan...</p>";

  try {
    const doc = await db.collection("pesanan").doc(tiket).get();
    if (!doc.exists) return hasil.innerHTML = `<p style='color:red;'>❌ Tiket <strong>${tiket}</strong> tidak ditemukan</p>`;

    const data = doc.data();
    const labelStatus = {
      baru: "🆕 Pesanan Baru",
      diproses: "🔧 Sedang Diproses",
      selesai: "✅ Selesai",
      dibatalkan: "❌ Dibatalkan"
    }[data.status] || data.status;

    hasil.innerHTML = `
      <div style="background:#f8f9fa; padding:1.2rem; border-radius:10px; border-left:4px solid var(--primary);">
        <h4 style="margin-top:0;">📋 Data Pesanan</h4>
        <p><strong>Nomor Tiket:</strong> ${data.tiket}</p>
        <p><strong>Nama:</strong> ${data.namaPelanggan}</p>
        <p><strong>Status:</strong> ${labelStatus}</p>
        <p><strong>Jenis Layanan:</strong> ${data.layanan?.join(", ") || "-"}</p>
        <p><strong>Penanganan:</strong> ${data.penanganan || "-"}</p>
        <p><strong>Estimasi Biaya:</strong> ${formatRupiah(data.estimasiTotal || 0)}</p>
        <p><strong>Dibuat:</strong> ${data.dibuatPada ? formatTanggal(data.dibuatPada.toDate()) : "-"}</p>
        ${data.statusCatatan ? `<p><strong>Catatan Admin:</strong> ${data.statusCatatan}</p>` : ""}
      </div>
    `;
  } catch (err) {
    console.error("Error cek status:", err);
    hasil.innerHTML = `<p style='color:red;'>❌ Gagal mencari data: ${err.message}</p>`;
  }
}

// ==========================================
// SALIN TIKET
// ==========================================
function salinTiket() {
  const tiket = document.getElementById("nomorTiket").textContent;
  navigator.clipboard.writeText(tiket)
    .then(() => alert("✅ Nomor tiket disalin: " + tiket))
    .catch(() => alert("⚠️ Gagal menyalin. Silakan salin manual: " + tiket));
}

// ==========================================
// RESET FORMULIR
// ==========================================
function resetForm() {
  setTimeout(() => {
    document.getElementById("ticketInfo").style.display = "none";
    document.getElementById("daftarPerangkat").innerHTML = "";
    perangkatCounter = 0;
    STATE.jarakKm = 0;
    STATE.pelangganLat = null;
    STATE.pelangganLng = null;
    document.getElementById("statusLokasi").textContent = "Belum terdeteksi";
    document.getElementById("estimasiOngkir").style.display = "none";
    generateTiket();
  }, 100);
}

// ==========================================
// FAQ — AKORDEON
// ==========================================
function initFAQ() {
  document.querySelectorAll(".faq-question").forEach(btn => {
    btn.addEventListener("click", () => {
      const item = btn.parentElement;
      const isActive = item.classList.contains("active");
      document.querySelectorAll(".faq-item").forEach(el => el.classList.remove("active"));
      if (!isActive) item.classList.add("active");
    });
  });
}
