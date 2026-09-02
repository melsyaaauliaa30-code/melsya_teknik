// ==============================================
// APP.JS — KONFIGURASI UTAMA & LOGIKA
// Semua pengaturan SERAGAM untuk seluruh website
// ==============================================

// ⚙️ KONFIGURASI UTAMA — UBAH DATA DI SINI SAJA!
export const KONFIG = {
  // 📍 LOKASI BENKEL
  BENGKEL: {
    lat: -0.643261,
    lng: 100.755266,
    nama: "Melsya Teknik Center",
    alamat: "Dusun Karang Anyar, Desa Santur, Kec. Barangin, Kota Sawahlunto",
    wa: "6285356434003",
    linkGM: "https://www.google.com/maps/search/?api=1&query=-0.643261,100.755266"
  },

  // 📖 LINK ARTIKEL / BLOG
  LINK_ARTIKEL: "https://sumberenergimandiri19.blogspot.com/p/daftar-isi-seri-panduan-plts-biogas_01681296252.html?m=1",

  // 💰 TARIF & HARGA
  TARIF: {
    jarakMaks: 50,        // km — batas layanan
    antarPerKm: 5000,     // Rp/km — antar-jemput
    antarDasar: 15000,    // Rp — biaya dasar antar
    kunjunganPerKm: 4000  // Rp/km — kunjungan ke rumah
  },

  // 🔐 AKUN ADMIN (jika perlu)
  ADMIN: {
    username: "admin",
    password: "melsya123"
  }
};

// 📋 PILIHAN PERANGKAT
export const PILIHAN_ITEM = {
  elektronik: [
    {nilai:'tv',label:'📺 Televisi'},
    {nilai:'kulkas',label:'🧊 Kulkas / Lemari Es'},
    {nilai:'ac',label:'❄️ AC / Pendingin Ruangan'},
    {nilai:'mesincuci',label:'🧺 Mesin Cuci'},
    {nilai:'audio',label:'🔊 Audio / Sound System'},
    {nilai:'lainnya',label:'📦 Lainnya'}
  ],
  komputer: [
    {nilai:'laptop',label:'💻 Laptop'},
    {nilai:'pc',label:'🖥️ Komputer PC'},
    {nilai:'printer',label:'🖨️ Printer'},
    {nilai:'hp',label:'📱 HP / Smartphone'},
    {nilai:'tablet',label:'📲 Tablet'},
    {nilai:'lainnya',label:'📦 Lainnya'}
  ],
  listrik: [
    {nilai:'instalasi',label:'⚡ Instalasi Listrik'},
    {nilai:'jaringan',label:'🌐 Jaringan Internet'},
    {nilai:'listrikmati',label:'🔌 Listrik Mati / Gangguan'},
    {nilai:'lainnya',label:'📦 Lainnya'}
  ]
};

// 🧠 DATA ANALISA KERUSAKAN OTOMATIS
export const DATA_ANALISA = {
  elektronik: [
    {kata:['tidak dingin','panas','mencair','hangat'], kerusakan:'Masalah Sistem Pendinginan — Kemungkinan kebocoran freon atau kompresor bermasalah', estimasiJasa:150000, sukuCadang:'Freon, Kapasitor, atau Kompresor'},
    {kata:['tidak menyala','mati','tidak hidup','mati total'], kerusakan:'Masalah Sumber Daya / Listrik — Kemungkinan kerusakan pada modul daya atau kabel', estimasiJasa:120000, sukuCadang:'Modul Daya, Sekring, atau Kabel'},
    {kata:['berbunyi','bunyi kasar','berdengung','getar'], kerusakan:'Komponen Mekanis / Kipas Bermasalah — Perlu pengecekan kipas atau dudukan', estimasiJasa:95000, sukuCadang:'Kipas, Bantalan, atau Pemasangan'},
    {kata:['gambar','layar','garis','buram','gelap'], kerusakan:'Masalah Bagian Tampilan — Kemungkinan kerusakan layar atau modul pengaturan gambar', estimasiJasa:180000, sukuCadang:'Layar, Lampu Backlight, atau Modul Video'},
    {kata:['remote','tombol','tidak merespon','sinyal'], kerusakan:'Masalah Kontrol / Sensor', estimasiJasa:85000, sukuCadang:'Sensor, Remote, atau Tombol Panel'}
  ],
  komputer: [
    {kata:['lambat','lambat sekali','berat','lemot'], kerusakan:'Perlu Optimasi Sistem — Penumpukan file sampah, virus, atau kapasitas penyimpanan penuh', estimasiJasa:80000, sukuCadang:'Tidak perlu — Software only'},
    {kata:['tidak menyala','mati','hidup mati','beep'], kerusakan:'Masalah Perangkat Keras — Power supply, RAM, atau Motherboard bermasalah', estimasiJasa:130000, sukuCadang:'Power Supply, RAM, atau Komponen Board'},
    {kata:['layar','gelap','blank','garis','berkedip'], kerusakan:'Kerusakan Layar / Kabel Fleksibel', estimasiJasa:160000, sukuCadang:'Layar LCD / Kabel Fleksibel'},
    {kata:['hang','macet','freeze','restart sendiri'], kerusakan:'Sistem Bermasalah / Overheat — Kemungkinan suhu berlebih atau sistem korup', estimasiJasa:100000, sukuCadang:'Pasta pendingin, Perbaikan sistem'},
    {kata:['virus','malware','banyak iklan','buka sendiri'], kerusakan:'Infeksi Virus / Malware', estimasiJasa:75000, sukuCadang:'Tidak perlu — Software only'}
  ],
  listrik: [
    {kata:['listrik mati','tidak ada listrik','bolak-balik'], kerusakan:'Gangguan Jalur Listrik — Perlu pengecekan kabel, sekring, atau MCB', estimasiJasa:90000, sukuCadang:'Kabel, Sekring, atau MCB'},
    {kata:['terlalu beban','mcb turun','jatuh'], kerusakan:'Beban Berlebih / Korsleting — Perlu pengecekan beban dan kabel', estimasiJasa:110000, sukuCadang:'Kabel, MCB, atau Perangkat Proteksi'},
    {kata:['jaringan','lambat internet','putus-nyambung','sinyal lemah'], kerusakan:'Masalah Jaringan / Kabel — Pengecekan kabel, konektor, atau perangkat jaringan', estimasiJasa:85000, sukuCadang:'Kabel LAN, Konektor, atau Switch'}
  ]
};

// 💰 FORMAT RUPIAH
export function rp(nilai) {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0
  }).format(nilai);
}

// 📜 SCROLL HALAMAN
export function scrollKe(id) {
  document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
}

// 📍 AMBIL KOORDINAT BENKEL TERBARU (dari localStorage jika diubah di Admin)
export function getBengkel() {
  const lat = localStorage.getItem('bengkelLat') || KONFIG.BENGKEL.lat;
  const lng = localStorage.getItem('bengkelLng') || KONFIG.BENGKEL.lng;
  return {
    lat: parseFloat(lat),
    lng: parseFloat(lng),
    nama: KONFIG.BENGKEL.nama,
    alamat: KONFIG.BENGKEL.alamat,
    wa: KONFIG.BENGKEL.wa,
    linkGM: `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`
  };
}

// ==============================================
// AKHIR FILE — Semua fungsi lain di index.html
// tetap menggunakan pengaturan di atas
// ==============================================
