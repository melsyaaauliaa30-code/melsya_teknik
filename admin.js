/* ==========================================
   admin.js — Melsya Teknik Center
   Login Admin + Kelola Pesanan + Laporan
========================================== */

// KONFIGURASI FIREBASE
const FIREBASE_CONFIG = {
  apiKey: "AIzaSyC2_DvJZ469gEAxukqyKeT4BaE-_c1x_Oc",
  authDomain: "melsya-teknik.firebaseapp.com",
  projectId: "melsya-teknik",
  storageBucket: "melsya-teknik.firebasestorage.app",
  messagingSenderId: "704099609611",
  appId: "1:704099609611:web:6a0fcfec60f793c2f6eb0e",
  measurementId: "G-PP8VKNQEC2"
};

let app, db, auth;

// INISIALISASI
document.addEventListener("DOMContentLoaded", () => {
  app = firebase.initializeApp(FIREBASE_CONFIG);
  db = firebase.firestore();
  auth = firebase.auth();

  // Cek status login
  auth.onAuthStateChanged(user => {
    if (user) {
      tampilkanDashboard();
      muatSemuaPesanan();
    } else {
      tampilkanLogin();
    }
  });

  // Event listener
  document.getElementById("loginForm").addEventListener("submit", login);
  document.querySelectorAll(".tab-btn").forEach(btn => {
    btn.addEventListener("click", () => switchTab(btn.dataset.tab));
  });
  document.getElementById("formManual").addEventListener("submit", tambahPesananManual);
  document.getElementById("cariTiket").addEventListener("input", filterTabel);
  document.getElementById("filterStatus").addEventListener("change", muatSemuaPesanan);
  document.getElementById("filterBulan").addEventListener("change", muatLaporan);
});

// ==========================================
// FUNGSI LOGIN
// ==========================================
async function login(e) {
  e.preventDefault();
  const email = document.getElementById("emailAdmin").value.trim();
  const password = document.getElementById("passwordAdmin").value;
  const errorEl = document.getElementById("loginError");

  try {
    await auth.signInWithEmailAndPassword(email, password);
    errorEl.style.display = "none";
  } catch (err) {
    console.error("Login error:", err);
    errorEl.textContent = "❌ " + ({
      "auth/user-not-found": "Email tidak terdaftar",
      "auth/wrong-password": "Password salah",
      "auth/invalid-email": "Format email salah",
      "auth/too-many-requests": "Terlalu banyak percobaan. Coba lagi nanti."
    }[err.code] || "Kesalahan: " + err.message);
    errorEl.style.display = "block";
  }
}

function logout() {
  auth.signOut();
  tampilkanLogin();
}

function tampilkanLogin() {
  document.getElementById("loginPage").style.display = "block";
  document.getElementById("dashboardPage").style.display = "none";
  document.body.classList.remove("is-logged-in");
}

function tampilkanDashboard() {
  document.getElementById("loginPage").style.display = "none";
  document.getElementById("dashboardPage").style.display = "block";
  document.body.classList.add("is-logged-in");
}

async function resetPassword() {
  const email = prompt("Masukkan email akun admin:");
  if (!email) return;
  try {
    await auth.sendPasswordResetEmail(email);
    alert("✅ Link reset password dikirim ke email!");
  } catch (err) {
    alert("❌ " + err.message);
  }
}

// ==========================================
// NAVIGASI TAB
// ==========================================
function switchTab(tabName) {
  document.querySelectorAll(".tab-btn").forEach(b => b.classList.remove("active"));
  document.querySelectorAll(".dashboard-section").forEach(s => s.classList.remove("active"));
  document.querySelector(`[data-tab="${tabName}"]`).classList.add("active");
  document.getElementById(`tab-${tabName}`).classList.add("active");
  
  if (tabName === "pesanan") muatSemuaPesanan();
  if (tabName === "laporan") muatLaporan();
}

// ==========================================
// MUAT SEMUA PESANAN
// ==========================================
let semuaPesanan = [];

async function muatSemuaPesanan() {
  const statusFilter = document.getElementById("filterStatus").value;
  const tbody = document.getElementById("isiTabelPesanan");
  
  try {
    let query = db.collection("pesanan").orderBy("dibuatPada", "desc");
    if (statusFilter !== "semua") query = query.where("status", "==", statusFilter);
    
    const snapshot = await query.limit(200).get();
    semuaPesanan = [];
    snapshot.forEach(doc => semuaPesanan.push({ id: doc.id, ...doc.data() }));
    
    renderTabelPesanan();
    updateStatistik();
  } catch (err) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">❌ Gagal memuat: ${err.message}</td></tr>`;
  }
}

function renderTabelPesanan(filterText = "") {
  const tbody = document.getElementById("isiTabelPesanan");
  const dataTerfilter = semuaPesanan.filter(p => 
    p.tiket.toLowerCase().includes(filterText.toLowerCase()) ||
    p.namaPelanggan.toLowerCase().includes(filterText.toLowerCase())
  );

  if (!dataTerfilter.length) {
    tbody.innerHTML = `<tr><td colspan="6" class="empty-state">Tidak ada data pesanan</td></tr>`;
    return;
  }

  tbody.innerHTML = dataTerfilter.map(p => `
    <tr>
      <td><strong>${p.tiket}</strong></td>
      <td>${p.namaPelanggan}</td>
      <td>${p.layanan?.join(", ") || "-"}</td>
      <td><span class="status-badge status-${p.status}">${
        { baru: "Baru", diproses: "Diproses", selesai: "Selesai", dibatalkan: "Dibatalkan" }[p.status] || p.status
      }</span></td>
      <td>${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(p.estimasiTotal || 0)}</td>
      <td>
        <button class="btn btn-sm" onclick="ubahStatus('${p.tiket}')">✏️ Ubah Status</button>
        <button class="btn btn-sm btn-secondary" onclick="cetakNota('${p.tiket}')">🖨️ Nota</button>
      </td>
    </tr>
  `).join("");
}

function filterTabel() {
  renderTabelPesanan(document.getElementById("cariTiket").value);
}

// ==========================================
// UBAH STATUS PESANAN
// ==========================================
async function ubahStatus(tiket) {
  const pesanan = semuaPesanan.find(p => p.tiket === tiket);
  if (!pesanan) return;

  const statusBaru = prompt("Ubah status:\n- baru\n- diproses\n- selesai\n- dibatalkan", pesanan.status);
  if (!statusBaru || !["baru", "diproses", "selesai", "dibatalkan"].includes(statusBaru)) return;
  
  const catatan = prompt("Tambahkan catatan (opsional):", pesanan.statusCatatan || "");

  try {
    await db.collection("pesanan").doc(tiket).update({
      status: statusBaru,
      statusCatatan: catatan || "",
      diperbaruiPada: firebase.firestore.FieldValue.serverTimestamp()
    });
    alert("✅ Status diperbarui!");
    muatSemuaPesanan();
  } catch (err) {
    alert("❌ Gagal memperbarui: " + err.message);
  }
}

// ==========================================
// TAMBAH PESANAN MANUAL
// ==========================================
async function tambahPesananManual(e) {
  e.preventDefault();
  
  const tiket = "MAN-" + Date.now();
  const data = {
    tiket,
    namaPelanggan: document.getElementById("m_nama").value.trim(),
    whatsapp: document.getElementById("m_wa").value.trim(),
    alamat: document.getElementById("m_alamat").value.trim(),
    layanan: document.getElementById("m_layanan").value.split(",").map(s => s.trim()),
    penanganan: document.getElementById("m_penanganan").value,
    estimasiTotal: parseInt(document.getElementById("m_biaya").value) || 0,
    status: document.getElementById("m_status").value,
    catatan: document.getElementById("m_catatan").value.trim(),
    dibuatPada: firebase.firestore.FieldValue.serverTimestamp(),
    diperbaruiPada: firebase.firestore.FieldValue.serverTimestamp()
  };

  try {
    await db.collection("pesanan").doc(tiket).set(data);
    alert("✅ Pesanan berhasil ditambahkan! Tiket: " + tiket);
    e.target.reset();
    muatSemuaPesanan();
    switchTab("pesanan");
  } catch (err) {
    alert("❌ Gagal menyimpan: " + err.message);
  }
}

// ==========================================
// UPDATE STATISTIK RINGKASAN
// ==========================================
function updateStatistik() {
  const baru = semuaPesanan.filter(p => p.status === "baru").length;
  const proses = semuaPesanan.filter(p => p.status === "diproses").length;
  const selesai = semuaPesanan.filter(p => p.status === "selesai").length;
  document.getElementById("statBaru").textContent = baru;
  document.getElementById("statProses").textContent = proses;
  document.getElementById("statSelesai").textContent = selesai;
  document.getElementById("statTotal").textContent = semuaPesanan.length;
}

// ==========================================
// LAPORAN
// ==========================================
async function muatLaporan() {
  const bulan = document.getElementById("filterBulan").value;
  let data = semuaPesanan;
  
  if (bulan !== "semua") {
    data = semuaPesanan.filter(p => {
      if (!p.dibuatPada) return false;
      const tgl = p.dibuatPada.toDate();
      return tgl.toISOString().slice(0, 7) === bulan;
    });
  }

  const total = data.reduce((sum, p) => sum + (p.estimasiTotal || 0), 0);
  document.getElementById("totalPendapatan").textContent = new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(total);
  document.getElementById("jumlahTransaksi").textContent = data.length;
}

// ==========================================
// CETAK NOTA
// ==========================================
function cetakNota(tiket) {
  const pesanan = semuaPesanan.find(p => p.tiket === tiket);
  if (!pesanan) return alert("Data tidak ditemukan");
  
  const teks = `
=====================================================================
               NOTA SERVIS — MELSYA TEKNIK CENTER
=====================================================================
NOMOR TIKET : ${pesanan.tiket}
TANGGAL     : ${pesanan.dibuatPada ? pesanan.dibuatPada.toDate().toLocaleString("id-ID") : "-"}
---------------------------------------------------------------------
PELANGGAN   : ${pesanan.namaPelanggan}
WHATSAPP    : ${pesanan.whatsapp}
ALAMAT      : ${pesanan.alamat}
---------------------------------------------------------------------
LAYANAN     : ${pesanan.layanan?.join(", ") || "-"}
PENANGANAN  : ${pesanan.penanganan || "-"}
STATUS      : ${pesanan.status?.toUpperCase() || "-"}
---------------------------------------------------------------------
ESTIMASI BIAYA : ${new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", minimumFractionDigits: 0 }).format(pesanan.estimasiTotal || 0)}
---------------------------------------------------------------------
Catatan: ${pesanan.catatan || "-"}
=====================================================================
  Terima kasih telah mempercayakan servis kepada kami!
  Garansi berlaku 90 hari untuk setiap perbaikan.
=====================================================================
  `;
  const win = window.open("", "_blank");
  win.document.write(`<pre style="font-family:monospace; font-size:13px; line-height:1.5; padding:20px;">${teks}</pre>`);
  win.document.close();
  win.print();
}
