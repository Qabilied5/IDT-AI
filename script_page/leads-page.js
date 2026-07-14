/* ===================================
   leads-page.js — Leads / Kontak Page Logic
   Generik untuk berbagai tipe bisnis:
   B2B, B2C, SaaS, F&B, Jasa/Edukasi
   =================================== */

const LP_BIZ_TYPES = {
  b2b: {
    label: 'B2B (Distributor / Manufaktur)',
    sumber: {
      wa:     { name: 'Kontak Langsung',       desc: 'Calon klien yang menghubungi via WA, telepon, atau chat langsung' },
      msg:    { name: 'Kirim Pesan',            desc: 'Calon klien yang mengirim pesan ke bisnis Anda' },
      profil: { name: 'Kunjungan Profil/Website', desc: 'Calon klien yang membuka halaman profil atau katalog Anda' },
    },
    qualifyBadge: '73% cocok produk/layanan Anda',
    stat1: 'Transaksi', stat2: 'Total Nilai',
  },
  b2c: {
    label: 'B2C (Toko Online / Ritel)',
    sumber: {
      wa:     { name: 'Kontak Langsung',       desc: 'Pembeli yang menghubungi langsung via WA atau chat' },
      msg:    { name: 'Kirim Pesan',            desc: 'Pembeli yang mengirim pesan ke toko Anda' },
      profil: { name: 'Kunjungan Profil/Website', desc: 'Pembeli yang membuka halaman toko atau produk Anda' },
    },
    qualifyBadge: '73% cocok produk Anda',
    stat1: 'Transaksi', stat2: 'Total Nilai',
  },
  saas: {
    label: 'SaaS (Aplikasi / Software)',
    sumber: {
      wa:     { name: 'Kontak Langsung',       desc: 'Calon pengguna yang menghubungi via chat atau telepon' },
      msg:    { name: 'Kirim Pesan',            desc: 'Calon pengguna yang mengirim pesan langsung' },
      profil: { name: 'Kunjungan Profil/Website', desc: 'Calon pengguna yang membuka halaman pricing atau produk' },
    },
    qualifyBadge: '73% cocok layanan Anda',
    stat1: 'Trial Aktif', stat2: 'Total MRR',
  },
  fnb: {
    label: 'F&B (Restoran / Kafe)',
    sumber: {
      wa:     { name: 'Kontak Langsung',       desc: 'Pelanggan yang menghubungi langsung via WA atau telepon' },
      msg:    { name: 'Kirim Pesan',            desc: 'Pelanggan yang chat langsung ke bisnis Anda' },
      profil: { name: 'Kunjungan Profil/Website', desc: 'Pelanggan yang membuka halaman menu atau profil Anda' },
    },
    qualifyBadge: '73% cocok bisnis Anda',
    stat1: 'Reservasi', stat2: 'Total Nilai',
  },
  jasa: {
    label: 'Jasa / Edukasi',
    sumber: {
      wa:     { name: 'Kontak Langsung',       desc: 'Klien yang menghubungi langsung via WA atau telepon' },
      msg:    { name: 'Kirim Pesan',            desc: 'Klien yang mengirim pesan ke bisnis Anda' },
      profil: { name: 'Kunjungan Profil/Website', desc: 'Klien yang membuka halaman layanan atau profil Anda' },
    },
    qualifyBadge: '73% sesuai layanan Anda',
    stat1: 'Sesi/Booking', stat2: 'Total Nilai',
  },
};

function bizCfg() {
  return LP_BIZ_TYPES[lpState.biz] || LP_BIZ_TYPES.b2b;
}

// ── KONEKSI GOOGLE SHEETS (Apps Script Web App) ───────────────
// URL bisa diisi lewat 2 cara:
// 1. Hardcode di bawah ini (fallback default jika belum ada konfigurasi user), atau
// 2. Diisi user lewat tombol "Import Excel / Spreadsheets" di UI → tersimpan
//    di localStorage browser, jadi tidak perlu edit kode tiap ganti sheet.
const LP_SHEET_API_URL = 'Fill from import button';
const LP_STORAGE_KEY   = 'lp_sheet_api_url';

// Ambil URL aktif: prioritas localStorage (diisi via modal import), baru fallback ke konstanta di atas.
function getConfiguredSheetUrl() {
  try {
    const saved = window.localStorage.getItem(LP_STORAGE_KEY);
    if (saved) return saved;
  } catch (e) { /* localStorage tidak tersedia (mode private browsing dsb) */ }
  if (LP_SHEET_API_URL && !LP_SHEET_API_URL.includes('GANTI_DENGAN')) {
    return LP_SHEET_API_URL;
  }
  return null;
}

function lpSheetConfigured() {
  return !!getConfiguredSheetUrl();
}

// ── Update seluruh UI yang berubah berdasarkan tipe bisnis ────
function applyBizType(type) {
  if (!LP_BIZ_TYPES[type]) return;
  lpState.biz = type;

  // AI qualify badge di kategori "Real Lead"
  const badge = document.getElementById('lp-qualify-badge-real');
  if (badge) badge.textContent = bizCfg().qualifyBadge;

  // Statistik di panel Detail Kontak (Order/Total Belanja, dsb)
  const lbl1 = document.getElementById('rpDkStat1Lbl');
  const lbl2 = document.getElementById('rpDkStat2Lbl');
  if (lbl1) lbl1.textContent = bizCfg().stat1;
  if (lbl2) lbl2.textContent = bizCfg().stat2;

  // Render ulang tabel leads supaya label sumber ikut berubah
  renderLeadsTable();
}

// ── Data leads (diisi dari Google Sheets saat halaman dibuka) ──
// LEADS_DATA_FALLBACK dipakai HANYA jika LP_SHEET_API_URL belum
// dikonfigurasi, supaya tampilan tidak kosong/error saat development.
let LEADS_DATA = [];
const LEADS_DATA_FALLBACK = [
  { id:1,  nama:'Meli',          perusahaan:'Gudang Tenda Muhamad Almer', tanggal:'12 Jun 2026', email:'gudangtendamuhamadalmer12@gmail.com', phone:'82381272032', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Kontak Langsung',      status:'belum' },
  { id:2,  nama:'Dina',          perusahaan:'PT. Cika Inti Karya',        tanggal:'11 Jun 2026', email:'dinadina@gmail.com',                  phone:'87797508972', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Kontak Langsung',      status:'belum' },
  { id:3,  nama:'Adi Santoso',   perusahaan:'CV. Maju Bersama',           tanggal:'11 Jun 2026', email:'adi.santoso@majubersama.id',           phone:'81234567890', kota:'Surabaya',kategori:'potensi', sumber:'msg',    aktivitas:'Kirim Pesan',          status:'dihubungi' },
  { id:4,  nama:'Rini Wijaya',   perusahaan:'PT. Sumber Makmur',          tanggal:'10 Jun 2026', email:'rini@sumbermakmur.co.id',             phone:'85678901234', kota:'Bandung', kategori:'real',    sumber:'wa',    aktivitas:'Permintaan Masuk',     status:'followup' },
  { id:5,  nama:'Budi Hartono',  perusahaan:'UD. Karya Abadi',            tanggal:'10 Jun 2026', email:'budi.hartono@gmail.com',              phone:'81398765432', kota:'Semarang',kategori:'potensi', sumber:'profil', aktivitas:'Kunjungan Profil',     status:'belum' },
  { id:6,  nama:'Susi Rahayu',   perusahaan:'PT. Indo Jaya',              tanggal:'09 Jun 2026', email:'susi.rahayu@indojaya.com',            phone:'87712345678', kota:'Medan',   kategori:'belum',   sumber:'profil', aktivitas:'Kunjungan Profil',     status:'belum' },
  { id:7,  nama:'Hendra Kusuma', perusahaan:'CV. Teknik Mandiri',         tanggal:'09 Jun 2026', email:'hendra@teknikmandiri.id',             phone:'82298765001', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Kontak Langsung',      status:'closed' },
  { id:8,  nama:'Dewi Anggraeni',perusahaan:'PT. Aneka Produk',           tanggal:'08 Jun 2026', email:'dewi.a@anekaproduk.com',              phone:'89512345000', kota:'Yogyakarta',kategori:'potensi',sumber:'msg',   aktivitas:'Kirim Pesan',          status:'dihubungi' },
  { id:9,  nama:'Fajar Nugraha', perusahaan:'UD. Fajar Tani',             tanggal:'08 Jun 2026', email:'fajar@fajartani.id',                  phone:'81111222333', kota:'Malang',  kategori:'belum',   sumber:'wa',    aktivitas:'Permintaan Masuk',     status:'belum' },
  { id:10, nama:'Lestari Wahyu', perusahaan:'CV. Lestari Group',          tanggal:'07 Jun 2026', email:'lestari.w@lestarigroup.com',          phone:'82233445566', kota:'Surabaya',kategori:'real',    sumber:'wa',     aktivitas:'Kontak Langsung',      status:'followup' },
  { id:11, nama:'Teguh Prabowo', perusahaan:'PT. Prabowo Industri',       tanggal:'07 Jun 2026', email:'teguh@prabowoindustri.co.id',         phone:'85544332211', kota:'Jakarta', kategori:'real',    sumber:'msg',    aktivitas:'Kirim Pesan',          status:'belum' },
  { id:12, nama:'Nita Sari',     perusahaan:'CV. Nita Kreatif',           tanggal:'06 Jun 2026', email:'nita@nitakreatif.id',                 phone:'87700998877', kota:'Bandung', kategori:'potensi', sumber:'profil', aktivitas:'Kunjungan Profil',     status:'dihubungi' },
  { id:13, nama:'Arief Gunawan', perusahaan:'PT. Gunawan Jaya',           tanggal:'06 Jun 2026', email:'arief.g@gunawanjaya.id',              phone:'81234000111', kota:'Semarang',kategori:'belum',   sumber:'wa',     aktivitas:'Kontak Langsung',      status:'belum' },
  { id:14, nama:'Maya Putri',    perusahaan:'UD. Maya Sejahtera',         tanggal:'05 Jun 2026', email:'maya.p@gmail.com',                    phone:'82345123456', kota:'Medan',   kategori:'real',    sumber:'wa',    aktivitas:'Permintaan Masuk',     status:'closed' },
  { id:15, nama:'Rizky Firmansyah','perusahaan':'CV. Rizky Maju',         tanggal:'05 Jun 2026', email:'rizky.f@rizkymaju.id',                phone:'89912345678', kota:'Jakarta', kategori:'potensi', sumber:'msg',    aktivitas:'Kirim Pesan',          status:'belum' },
];

// ── State ─────────────────────────────────────────────────────
let lpState = {
  kat: 'semua',       // kategori filter
  src: null,          // sumber filter
  query: '',          // search query
  date: 'semua',      // date filter
  page: 1,
  perPage: 10,
  statusTarget: null, // id lead yg sedang diupdate status
  biz: 'b2b',          // tipe bisnis aktif: b2b | b2c | saas | fnb | jasa
  dataSource: 'fallback', // 'sheet' | 'csv' | 'fallback' — sumber LEADS_DATA saat ini
};

// ── Init ──────────────────────────────────────────────────────
async function initLeadsPage() {
  showLpLoadingState();
  await loadLeadsFromSheet();
  renderLeadsTable();
  updateKatCounts();
}

// ── Muat leads dari Google Sheets via Apps Script Web App ─────
async function loadLeadsFromSheet() {
  const url = getConfiguredSheetUrl();
  if (!url) {
    console.warn('Belum ada URL spreadsheet — pakai data contoh sementara.');
    LEADS_DATA = LEADS_DATA_FALLBACK;
    lpState.dataSource = 'fallback';
    return;
  }
  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (data.ok) {
      LEADS_DATA = data.leads;
      lpState.dataSource = 'sheet';
    } else {
      console.error('Gagal memuat leads:', data.error);
      showLpToast('Gagal memuat data dari Google Sheets: ' + data.error, 'error');
      LEADS_DATA = [];
      lpState.dataSource = 'fallback';
    }
  } catch (err) {
    console.error(err);
    showLpToast('Tidak bisa terhubung ke Google Sheets', 'error');
    LEADS_DATA = [];
    lpState.dataSource = 'fallback';
  }
}

function showLpLoadingState() {
  const tbody = document.getElementById('lp-table-body');
  if (tbody) {
    tbody.innerHTML = `
      <div style="padding:48px 16px;text-align:center;color:#9ca3af;font-size:13px">
        <i class="ti ti-loader-2" style="font-size:20px;display:block;margin-bottom:8px"></i>
        Memuat data leads dari Google Sheets…
      </div>`;
  }
}

// ── Sinkronkan perubahan status balik ke Google Sheets ─────────
async function syncStatusToSheet(id, status) {
  if (lpState.dataSource !== 'sheet') return; // mode CSV/data contoh, tidak ada sheet utk disinkronkan
  const url = getConfiguredSheetUrl();
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari CORS preflight
      body: JSON.stringify({ action: 'updateStatus', id, status }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Gagal sync status ke Sheets:', data.error);
      showLpToast('Status tersimpan lokal, tapi gagal sync ke Sheets', 'error');
    }
  } catch (err) {
    console.error(err);
    showLpToast('Status tersimpan lokal, tapi gagal sync ke Sheets', 'error');
  }
}

// ── Sinkronkan perubahan field APAPUN pada lead balik ke Sheets ─
// Dipakai oleh form "Edit Lead" di halaman ini, dan juga dipakai
// dari Pipeline (pipeline.js) saat kartu deal — yang sebenarnya
// adalah baris lead yang sama — diedit atau dipindah stage.
// `fields` contoh: { perusahaan:'PT X', kategori:'real', pipelineStage:'Penawaran' }
async function syncLeadFieldsToSheet(id, fields) {
  if (lpState.dataSource !== 'sheet') return; // mode CSV/data contoh, tidak ada sheet utk disinkronkan
  const url = getConfiguredSheetUrl();
  if (!url) return;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' }, // hindari CORS preflight
      body: JSON.stringify({ action: 'updateLead', id, fields }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Gagal sync lead ke Sheets:', data.error);
      showLpToast('Perubahan tersimpan lokal, tapi gagal sync ke Sheets', 'error');
    }
  } catch (err) {
    console.error(err);
    showLpToast('Perubahan tersimpan lokal, tapi gagal sync ke Sheets', 'error');
  }
}

// ── Buat baris lead BARU langsung di Google Sheets ──────────────
// Dipakai Pipeline saat "Tambah Deal Baru" / duplikat deal yang
// belum punya baris lead sama sekali di sheet. Mengembalikan id
// baris baru (angka) kalau berhasil, atau null kalau gagal/mode
// tidak tersambung ke sheet.
async function createLeadInSheet(fields) {
  if (lpState.dataSource !== 'sheet') return null;
  const url = getConfiguredSheetUrl();
  if (!url) return null;
  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify({ action: 'createLead', fields }),
    });
    const data = await res.json();
    if (!data.ok) {
      console.error('Gagal membuat lead baru di Sheets:', data.error);
      showLpToast('Data tersimpan lokal, tapi gagal dibuat di Sheets', 'error');
      return null;
    }
    return data.id;
  } catch (err) {
    console.error(err);
    showLpToast('Data tersimpan lokal, tapi gagal dibuat di Sheets', 'error');
    return null;
  }
}

// ── Modal: Import Excel / Spreadsheets (URL Apps Script atau CSV) ─
let _lpImportTab = 'url';

function openImportModal() {
  const modal = document.getElementById('lp-modal-import');
  if (!modal) return;
  const urlInput = document.getElementById('lp-import-url-input');
  if (urlInput) urlInput.value = getConfiguredSheetUrl() || '';
  const fileInput = document.getElementById('lp-import-csv-input');
  if (fileInput) fileInput.value = '';
  switchImportTab('url');
  modal.style.display = 'flex';
}

function closeImportModal() {
  const modal = document.getElementById('lp-modal-import');
  if (modal) modal.style.display = 'none';
}

function switchImportTab(tab) {
  _lpImportTab = tab;
  const tabUrl = document.getElementById('lp-import-tab-url');
  const tabCsv = document.getElementById('lp-import-tab-csv');
  const panelUrl = document.getElementById('lp-import-panel-url');
  const panelCsv = document.getElementById('lp-import-panel-csv');
  if (tabUrl) tabUrl.classList.toggle('active', tab === 'url');
  if (tabCsv) tabCsv.classList.toggle('active', tab === 'csv');
  if (panelUrl) panelUrl.style.display = tab === 'url' ? 'block' : 'none';
  if (panelCsv) panelCsv.style.display = tab === 'csv' ? 'block' : 'none';
  hideImportError();
}

function showImportError(msg) {
  const el = document.getElementById('lp-import-error');
  if (!el) return;
  el.textContent = msg;
  el.style.display = 'block';
}
function hideImportError() {
  const el = document.getElementById('lp-import-error');
  if (el) el.style.display = 'none';
}

async function submitImport() {
  hideImportError();
  if (_lpImportTab === 'url') {
    await submitImportUrl();
  } else {
    await submitImportCsv();
  }
}

// ── Import via URL Apps Script Web App ────────────────────────
async function submitImportUrl() {
  const input = document.getElementById('lp-import-url-input');
  const url = (input.value || '').trim();

  if (!url) {
    showImportError('URL tidak boleh kosong.');
    return;
  }
  if (!/^https?:\/\//i.test(url)) {
    showImportError('URL tidak valid. Pastikan diawali https://');
    return;
  }

  const btn = document.getElementById('lp-import-submit-btn');
  const btnOriginal = btn ? btn.innerHTML : '';
  if (btn) { btn.disabled = true; btn.textContent = 'Memuat…'; }

  try {
    const res  = await fetch(url);
    const data = await res.json();
    if (!data.ok) {
      showImportError('Gagal memuat dari URL ini: ' + data.error);
      return;
    }
    try { window.localStorage.setItem(LP_STORAGE_KEY, url); } catch (e) { /* ignore */ }
    LEADS_DATA = data.leads;
    lpState.dataSource = 'sheet';
    lpState.page = 1;
    renderLeadsTable();
    updateKatCounts();
    closeImportModal();
    showLpToast('Data berhasil dimuat dari spreadsheet ✓', 'success');
  } catch (err) {
    console.error(err);
    showImportError('Tidak bisa terhubung ke URL tersebut. Pastikan itu URL Web App Apps Script yang valid (diakhiri /exec) dan sudah di-deploy dengan akses "Anyone".');
  } finally {
    if (btn) { btn.disabled = false; btn.innerHTML = btnOriginal; }
  }
}

// ── Import via file CSV (lokal di browser, tidak tersinkron ke Sheets) ─
function submitImportCsv() {
  return new Promise((resolve) => {
    const fileInput = document.getElementById('lp-import-csv-input');
    const file = fileInput && fileInput.files && fileInput.files[0];
    if (!file) {
      showImportError('Pilih file CSV terlebih dahulu.');
      resolve();
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const rows  = parseCsvText(String(reader.result));
        const leads = leadsFromCsvRows(rows);
        if (leads.length === 0) {
          showImportError('Tidak ada data yang terbaca dari file ini. Cek format kolomnya sesuai template.');
          resolve();
          return;
        }
        LEADS_DATA = leads;
        lpState.dataSource = 'csv';
        lpState.page = 1;
        renderLeadsTable();
        updateKatCounts();
        closeImportModal();
        showLpToast(`${leads.length} leads berhasil diimport dari CSV ✓ (mode lokal, status tidak tersinkron ke Sheets)`, 'success');
      } catch (err) {
        console.error(err);
        showImportError('Gagal membaca file CSV. Pastikan formatnya sesuai template.');
      }
      resolve();
    };
    reader.onerror = () => {
      showImportError('Gagal membaca file.');
      resolve();
    };
    reader.readAsText(file, 'utf-8');
  });
}

function clearImportConfig() {
  try { window.localStorage.removeItem(LP_STORAGE_KEY); } catch (e) { /* ignore */ }
  closeImportModal();
  initLeadsPage();
  showLpToast('Koneksi spreadsheet dihapus, kembali ke data contoh', 'success');
}

// ── Parser CSV ringan (mendukung tanda kutip & koma di dalam field) ─
function parseCsvText(text) {
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  text = text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

  for (let i = 0; i < text.length; i++) {
    const c = text[i];
    if (inQuotes) {
      if (c === '"') {
        if (text[i + 1] === '"') { field += '"'; i++; }
        else { inQuotes = false; }
      } else {
        field += c;
      }
    } else if (c === '"') {
      inQuotes = true;
    } else if (c === ',') {
      row.push(field); field = '';
    } else if (c === '\n') {
      row.push(field); field = '';
      rows.push(row); row = [];
    } else {
      field += c;
    }
  }
  if (field.length > 0 || row.length > 0) {
    row.push(field);
    rows.push(row);
  }
  return rows.filter(r => r.some(f => String(f).trim() !== ''));
}

// Mapping label sheet (Indonesia, human-readable) -> kode internal.
// Harus sama persis dengan KATEGORI_MAP / SUMBER_MAP / STATUS_MAP di Code.gs.
const LP_KATEGORI_MAP = {
  'Real Lead': 'real',
  'Potensi': 'potensi',
  'Belum Dikualifikasi': 'belum',
};
const LP_SUMBER_MAP = {
  'Kontak Langsung': 'wa',
  'Kirim Pesan': 'msg',
  'Kunjungan Profil/Website': 'profil',
};
const LP_STATUS_MAP = {
  'Belum Dihubungi': 'belum',
  'Sudah Dihubungi': 'dihubungi',
  'Follow-up': 'followup',
  'Closed / Deal': 'closed',
  'Nomor Tidak ditemukan': 'nomor_tidak_ditemukan',
};

// Peta field internal -> daftar kemungkinan nama header CSV (urutan =
// prioritas pencarian). HARUS SAMA dengan COLUMN_MAP di Code.gs supaya
// import CSV lokal dan koneksi live ke Sheets menghasilkan data yang
// konsisten. Tambah alias di sini kalau nama header CSV berubah lagi —
// tidak perlu ubah kode lain.
const LP_COLUMN_MAP = {
  tanggal:         ['Tanggal Masuk Lead', 'Tanggal'],
  perusahaan:      ['Nama Perusahaan', 'Perusahaan'],
  nama:            ['Nama Kontak / PIC', 'Nama Kontak/PIC', 'Nama Kontak', 'PIC', 'Nama'],
  jabatan:         ['Jabatan'],
  phone:           ['Nomor HP', 'No. HP', 'No HP', 'Phone'],
  sumber:          ['Sumber Lead', 'Sumber'],
  status:          ['Status'],                                   // progres follow-up
  jumlahFollowup:  ['Jumlah Follow-up', 'Jumlah Follow Up', 'Jumlah Followup'],
  aksiSelanjutnya: ['Aksi Selanjutnya'],
  pipelineStage:   ['Pipeline Stage'],
  kategori:        ['Status Lead', 'Kategori Lead', 'Kategori'], // kualifikasi lead
  estimasi:        ['Estimasi Nominal (Opsional)', 'Estimasi Nominal', 'Nominal'],
  tipeLayanan:     ['Tipe Layanan', 'Jenis Layanan', 'Layanan / Produk', 'Produk', 'Layanan'],
  // Kolom lama yang sudah tidak ada di template baru — kalau suatu saat
  // ditambah lagi ke CSV, otomatis langsung kepakai (kalau tidak ada,
  // default ke '' saja, tidak error).
  email:           ['Email'],
  kota:            ['Kota'],
  aktivitas:       ['Aktivitas'],
};

function lpNormalizeHeader_(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

// Baca baris header CSV, hasilkan map: field internal -> index kolom
// (0-based). Kalau kolom tidak ditemukan, nilainya -1.
function lpBuildHeaderIndex_(headerRow) {
  const normalized = headerRow.map(lpNormalizeHeader_);
  const colIndex = {};
  for (const field in LP_COLUMN_MAP) {
    const aliases = LP_COLUMN_MAP[field];
    let found = -1;
    for (let a = 0; a < aliases.length; a++) {
      const idx = normalized.indexOf(lpNormalizeHeader_(aliases[a]));
      if (idx !== -1) { found = idx; break; }
    }
    colIndex[field] = found;
  }
  return colIndex;
}

function lpCell_(row, colIndex, field) {
  const idx = colIndex[field];
  if (idx === undefined || idx === -1) return '';
  const v = row[idx];
  return v === null || v === undefined ? '' : String(v).trim();
}

function leadsFromCsvRows(rows) {
  if (rows.length < 1) return [];
  const colIndex = lpBuildHeaderIndex_(rows[0]);
  const dataRows = rows.slice(1); // baris pertama = header, dibuang

  return dataRows
    .map((r, i) => {
      const nama = lpCell_(r, colIndex, 'nama');
      if (!nama) return null; // skip baris kosong

      const perusahaan    = lpCell_(r, colIndex, 'perusahaan');
      const tanggal       = lpCell_(r, colIndex, 'tanggal');
      const email         = lpCell_(r, colIndex, 'email');
      const phone         = lpCell_(r, colIndex, 'phone');
      const kota          = lpCell_(r, colIndex, 'kota');
      const kategoriLabel = lpCell_(r, colIndex, 'kategori');
      const sumberLabel   = lpCell_(r, colIndex, 'sumber');
      const aktivitas     = lpCell_(r, colIndex, 'aktivitas');
      const statusLabel   = lpCell_(r, colIndex, 'status');

      return {
        id: i + 1,
        nama, perusahaan, tanggal, email, kota,
        phone: phone.replace(/^0/, '').replace(/\D/g, ''),
        kategori: LP_KATEGORI_MAP[kategoriLabel] || 'belum',
        sumber: LP_SUMBER_MAP[sumberLabel] || 'wa',
        aktivitas: aktivitas || sumberLabel || '',
        status: LP_STATUS_MAP[statusLabel] || 'belum',

        // Field tambahan dari template baru (belum dipakai UI Kontak/Leads
        // saat ini, disiapkan untuk modul lain seperti Pipeline):
        jabatan: lpCell_(r, colIndex, 'jabatan'),
        jumlahFollowup: lpCell_(r, colIndex, 'jumlahFollowup') || 0,
        aksiSelanjutnya: lpCell_(r, colIndex, 'aksiSelanjutnya'),
        pipelineStage: lpCell_(r, colIndex, 'pipelineStage'),
        estimasiNominal: lpCell_(r, colIndex, 'estimasi') || '',
      };
    })
    .filter(Boolean);
}

// ── Filter: Kategori ──────────────────────────────────────────
function filterLeadKat(btn, kat) {
  document.querySelectorAll('.lp-kat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  lpState.kat = kat;
  lpState.page = 1;
  renderLeadsTable();
}

// ── Filter: Sumber ────────────────────────────────────────────
function filterLeadSrc(card, src) {
  const cards = document.querySelectorAll('.lp-sumber-card');
  if (card.classList.contains('active-src') && lpState.src === src) {
    // toggle off
    card.classList.remove('active-src');
    lpState.src = null;
  } else {
    cards.forEach(c => c.classList.remove('active-src'));
    card.classList.add('active-src');
    lpState.src = src;
  }
  lpState.page = 1;
  renderLeadsTable();
}

// ── Filter: Search & Date ─────────────────────────────────────
function filterLeadsTable() {
  lpState.query = document.getElementById('lp-search').value.toLowerCase();
  lpState.date  = document.getElementById('lp-date-filter').value;
  lpState.page  = 1;
  renderLeadsTable();
}

// ── Toggle Filter Drawer ──────────────────────────────────────
function toggleLeadFilter() {
  const drawer = document.getElementById('lp-filter-drawer');
  drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
}

// ── Filter Logic ──────────────────────────────────────────────
function getFilteredLeads() {
  let data = [...LEADS_DATA];

  if (lpState.kat && lpState.kat !== 'semua') {
    data = data.filter(l => l.kategori === lpState.kat);
  }
  if (lpState.src) {
    data = data.filter(l => l.sumber === lpState.src);
  }
  if (lpState.query) {
    data = data.filter(l =>
      l.nama.toLowerCase().includes(lpState.query) ||
      l.perusahaan.toLowerCase().includes(lpState.query) ||
      l.email.toLowerCase().includes(lpState.query) ||
      l.phone.includes(lpState.query) ||
      l.kota.toLowerCase().includes(lpState.query)
    );
  }
  return data;
}

// ── Render Table ──────────────────────────────────────────────
function renderLeadsTable() {
  const filtered = getFilteredLeads();
  const total    = filtered.length;
  const pages    = Math.ceil(total / lpState.perPage);
  lpState.page   = Math.min(lpState.page, pages || 1);
  const start    = (lpState.page - 1) * lpState.perPage;
  const paged    = filtered.slice(start, start + lpState.perPage);

  const tbody = document.getElementById('lp-table-body');
  const empty = document.getElementById('lp-empty');
  if (!tbody) return;

  if (paged.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = paged.map(lead => renderLeadRow(lead)).join('');
  }

  renderPagination(total, pages);
}

// ── Render Single Row ─────────────────────────────────────────
function renderLeadRow(lead) {
  const catLabel = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const catClass = lead.kategori;
  const srcCfg   = bizCfg().sumber;
  const srcClass = { wa:'src-wa', msg:'src-msg', rfq:'src-rfq', profil:'src-profil' };
  const aktClass = { wa:'wa', msg:'msg', rfq:'rfq', profil:'profil' };
  const aktIcon  = { wa:'ti-message-circle', msg:'ti-message-2', rfq:'ti-calendar-event', profil:'ti-eye' };
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up', closed:'Closed / Deal', nomor_tidak_ditemukan:'Nomor Tidak ditemukan' };
  const statusClass = { belum:'', dihubungi:'dihubungi', followup:'followup', closed:'closed', nomor_tidak_ditemukan:'not-found' };
  const statusIcon  = { belum:'ti-circle', dihubungi:'ti-circle-check', followup:'ti-refresh', closed:'ti-check-circle-2', nomor_tidak_ditemukan:'ti-phone-off' };

  const emailDisplay = lead.email.length > 24 ? lead.email.slice(0, 24) + '…' : lead.email;

  return `
  <div class="lp-row" data-id="${lead.id}">
    <div><input type="checkbox" class="lp-row-check"></div>
    <div>
      <div class="lp-row-name">${lead.nama}</div>
      <div class="lp-row-company"><i class="ti ti-building-store" style="font-size:10px"></i>${lead.perusahaan}</div>
      <div class="lp-row-date"><i class="ti ti-clock" style="font-size:10px"></i>${lead.tanggal}</div>
      <div class="lp-row-tags">
        <span class="lp-tag ${catClass}"><i class="ti ${catClass==='real'?'ti-circle-check':catClass==='potensi'?'ti-star':'ti-minus-circle'}" style="font-size:9px"></i>${catLabel[lead.kategori]}</span>
        <span class="lp-tag ${srcClass[lead.sumber]}"><i class="ti ${aktIcon[lead.sumber]}" style="font-size:9px"></i>${srcCfg[lead.sumber].name}</span>
      </div>
    </div>
    <div>
      <div class="lp-contact-email"><i class="ti ti-mail" style="font-size:10px;opacity:.6"></i>${emailDisplay}</div>
      <div class="lp-contact-phone"><i class="ti ti-phone" style="font-size:10px;opacity:.6"></i>${lead.phone}</div>
      <div class="lp-contact-city"><i class="ti ti-map-pin" style="font-size:10px;opacity:.6"></i>${lead.kota}</div>
    </div>
    <div>
      <span class="lp-aktivitas-badge ${aktClass[lead.sumber]}">
        <i class="ti ${aktIcon[lead.sumber]}" style="font-size:11px"></i>${lead.aktivitas}
      </span>
    </div>
    <div>
      <button class="lp-status-followup ${statusClass[lead.status]}" onclick="openStatusModal(${lead.id})">
        <i class="ti ${statusIcon[lead.status]}"></i>${statusLabel[lead.status]}
      </button>
    </div>
    <div class="lp-aksi-wrap">
      <button class="lp-btn-wa" onclick="hubungiWA(${lead.id})"><i class="ti ti-brand-whatsapp"></i> Hubungi via WA</button>
      <button class="lp-btn-more" onclick="openLeadModal(${lead.id})"><i class="ti ti-dots-vertical"></i></button>
    </div>
  </div>`;
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination(total, pages) {
  const info   = document.getElementById('lp-page-info');
  const nums   = document.getElementById('lp-page-nums');
  const prev   = document.getElementById('lp-prev');
  const next   = document.getElementById('lp-next');
  if (!info) return;

  const start = (lpState.page - 1) * lpState.perPage + 1;
  const end   = Math.min(lpState.page * lpState.perPage, total);
  info.textContent = total === 0
    ? 'Tidak ada leads'
    : `Menampilkan ${start}–${end} dari ${total} leads`;

  // page numbers (show max 5)
  if (nums) {
    nums.innerHTML = '';
    let startP = Math.max(1, lpState.page - 2);
    let endP   = Math.min(pages, startP + 4);
    startP     = Math.max(1, endP - 4);
    for (let i = startP; i <= endP; i++) {
      const btn = document.createElement('button');
      btn.className = 'lp-page-num' + (i === lpState.page ? ' active' : '');
      btn.textContent = i;
      btn.onclick = () => { lpState.page = i; renderLeadsTable(); };
      nums.appendChild(btn);
    }
  }

  if (prev) prev.disabled = lpState.page <= 1;
  if (next) next.disabled = lpState.page >= pages;
}

function changePage(dir) {
  lpState.page = Math.max(1, lpState.page + dir);
  renderLeadsTable();
}

// ── Update kategori counts dari data ─────────────────────────
function updateKatCounts() {
  const counts = { semua: LEADS_DATA.length, real: 0, potensi: 0, belum: 0 };
  LEADS_DATA.forEach(l => { if (counts[l.kategori] !== undefined) counts[l.kategori]++; });
  document.querySelectorAll('.lp-kat-btn').forEach(btn => {
    const kat = btn.dataset.kat;
    const numEl = btn.querySelector('.lp-kat-num');
    if (numEl && counts[kat] !== undefined) numEl.textContent = counts[kat];
  });
}

// ── Select All ────────────────────────────────────────────────
function toggleAllLeads(masterCheck) {
  document.querySelectorAll('.lp-row-check').forEach(cb => {
    cb.checked = masterCheck.checked;
  });
}

// ── Modal: Detail Lead ────────────────────────────────────────
function openLeadModal(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;

  document.getElementById('lp-modal-title').innerHTML =
    `<i class="ti ti-user-circle"></i> ${lead.nama}`;

  const catLabel = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const srcCfg = bizCfg().sumber;
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up', closed:'Closed' };

  document.getElementById('lp-modal-body').innerHTML = `
    <div class="lp-detail-row"><span class="lp-detail-label">Perusahaan</span><span class="lp-detail-val">${lead.perusahaan}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Email</span><span class="lp-detail-val">${lead.email}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">No. HP / WA</span><span class="lp-detail-val">${lead.phone}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Kota</span><span class="lp-detail-val">${lead.kota}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Tanggal</span><span class="lp-detail-val">${lead.tanggal}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Kategori</span><span class="lp-detail-val">${catLabel[lead.kategori] || '-'}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Sumber</span><span class="lp-detail-val">${srcCfg[lead.sumber]?.name || '-'}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Aktivitas</span><span class="lp-detail-val">${lead.aktivitas}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Status</span><span class="lp-detail-val">${statusLabel[lead.status] || '-'}</span></div>
  `;

  const waBtn = document.getElementById('lp-modal-wa-btn');
  waBtn.onclick = () => hubungiWA(id);

  const editBtn = document.getElementById('lp-modal-edit-btn');
  if (editBtn) editBtn.onclick = () => openEditLeadModal(id);

  document.getElementById('lp-modal-lead').style.display = 'flex';
}
function closeLeadModal() {
  document.getElementById('lp-modal-lead').style.display = 'none';
}

// ── Modal: Edit Lead (semua field bisa diedit, auto-sync ke Sheets) ─
function openEditLeadModal(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;

  document.getElementById('lp-edit-lead-id').value      = lead.id;
  document.getElementById('lp-edit-nama').value          = lead.nama || '';
  document.getElementById('lp-edit-perusahaan').value    = lead.perusahaan || '';
  document.getElementById('lp-edit-jabatan').value       = lead.jabatan || '';
  document.getElementById('lp-edit-email').value         = lead.email || '';
  document.getElementById('lp-edit-phone').value         = lead.phone || '';
  document.getElementById('lp-edit-kota').value          = lead.kota || '';
  document.getElementById('lp-edit-kategori').value      = lead.kategori || 'belum';
  document.getElementById('lp-edit-sumber').value        = lead.sumber || 'wa';
  document.getElementById('lp-edit-aksi').value          = lead.aksiSelanjutnya || '';
  document.getElementById('lp-edit-tipe-layanan').value  = lead.tipeLayanan || '';
  document.getElementById('lp-edit-estimasi').value      = lead.estimasiNominal || '';

  closeLeadModal();
  document.getElementById('lp-modal-edit-lead').style.display = 'flex';
}
function closeEditLeadModal() {
  document.getElementById('lp-modal-edit-lead').style.display = 'none';
}

// Nama tampilan sumber lead, dipakai untuk mengisi ulang label "Aktivitas"
// setelah sumber diubah lewat form edit. Coba pakai label sesuai tipe
// bisnis aktif dulu (bizCfg), fallback ke label default kalau belum siap.
function lpSumberDisplayName_(sumberCode) {
  const fallbackNames = { wa: 'Kontak Langsung', msg: 'Kirim Pesan', profil: 'Kunjungan Profil/Website' };
  try {
    const cfg = bizCfg();
    if (cfg && cfg.sumber && cfg.sumber[sumberCode]) return cfg.sumber[sumberCode].name;
  } catch (e) { /* bizCfg belum siap, pakai fallback */ }
  return fallbackNames[sumberCode] || '';
}

function submitEditLead() {
  const id = Number(document.getElementById('lp-edit-lead-id').value);
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;

  const nama            = document.getElementById('lp-edit-nama').value.trim();
  const perusahaan      = document.getElementById('lp-edit-perusahaan').value.trim();
  const jabatan         = document.getElementById('lp-edit-jabatan').value.trim();
  const email           = document.getElementById('lp-edit-email').value.trim();
  const phone           = document.getElementById('lp-edit-phone').value.trim();
  const kota            = document.getElementById('lp-edit-kota').value.trim();
  const kategori        = document.getElementById('lp-edit-kategori').value;
  const sumber          = document.getElementById('lp-edit-sumber').value;
  const aksiSelanjutnya = document.getElementById('lp-edit-aksi').value.trim();
  const tipeLayanan     = document.getElementById('lp-edit-tipe-layanan').value.trim();
  const estimasiNominal = document.getElementById('lp-edit-estimasi').value.trim();

  if (!nama) {
    showLpToast('Nama kontak wajib diisi', 'error');
    return;
  }

  // Update data lokal dulu supaya tabel langsung berubah tanpa reload
  lead.nama = nama;
  lead.perusahaan = perusahaan;
  lead.jabatan = jabatan;
  lead.email = email;
  lead.phone = phone;
  lead.kota = kota;
  lead.kategori = kategori;
  lead.sumber = sumber;
  lead.aksiSelanjutnya = aksiSelanjutnya;
  lead.tipeLayanan = tipeLayanan;
  lead.estimasiNominal = estimasiNominal;
  lead.aktivitas = lpSumberDisplayName_(sumber);

  closeEditLeadModal();
  renderLeadsTable();
  updateKatCounts();
  showLpToast('Data lead berhasil diperbarui', 'success');

  // Sync semua field yang diedit balik ke Google Sheets (baris yang sama)
  syncLeadFieldsToSheet(id, {
    nama, perusahaan, jabatan, email, phone, kota,
    kategori, sumber, aksiSelanjutnya, tipeLayanan, estimasiNominal,
  });
}

// ── Modal: Update Status ──────────────────────────────────────
function openStatusModal(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  lpState.statusTarget = id;
  document.getElementById('lp-status-select').value = lead.status;
  document.getElementById('lp-status-note').value = '';
  document.getElementById('lp-modal-status').style.display = 'flex';
}
function closeStatusModal() {
  document.getElementById('lp-modal-status').style.display = 'none';
  lpState.statusTarget = null;
}
function submitStatus() {
  const id = lpState.statusTarget;
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  const newStatus = document.getElementById('lp-status-select').value;
  lead.status = newStatus;
  closeStatusModal();
  renderLeadsTable();
  showLpToast('Status berhasil diperbarui', 'success');
  syncStatusToSheet(id, newStatus);
}

// ── Aksi: Hubungi WA ─────────────────────────────────────────
function hubungiWA(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  // update status jadi dihubungi otomatis
  if (lead.status === 'belum') {
    lead.status = 'dihubungi';
    renderLeadsTable();
    syncStatusToSheet(id, 'dihubungi');
  }
  showLpToast(`Membuka WhatsApp untuk ${lead.nama}…`, 'success');
  // Simulasi: buka WA
  // window.open(`https://wa.me/62${lead.phone}`, '_blank');
}

// ── AI Mulai Chat Duluan (BARU) ──────────────────────────────
// Mengambil nomor HP dari data lead (kolom "lp-contact-phone", asalnya dari
// spreadsheet) dan meminta backend (server.js) mencoba mencocokkannya dengan
// percakapan Telegram yang sudah ada, lalu mengirim pesan perkenalan AI.
// Catatan: karena keterbatasan Telegram Bot API, ini hanya berhasil untuk
// kontak yang sebelumnya SUDAH pernah chat ke bot (dan share nomor HP-nya).
// Kalau nomornya tidak ditemukan, status lead diubah jadi "Nomor Tidak
// ditemukan" supaya sales tahu harus follow-up manual.
const LP_CHAT_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

// ── Mulai Chat AI — multi-provider (WABA diutamakan, Telegram fallback) ───────
// Sebelum kirim, cek provider aktif dari backend supaya label toast akurat.
async function lpStartAiChat() {
  const targets = LEADS_DATA.filter(l => l.status === 'belum' && l.phone);
  if (targets.length === 0) {
    showLpToast('Tidak ada lead "Belum dihubungi" yang punya nomor HP.', 'error');
    return;
  }

  // ── Cek provider aktif dulu ──────────────────────────────────────────────
  let activeProvider = null;
  try {
    const chkRes  = await fetch(`${LP_CHAT_API_BASE}/api/leads/chat-provider`);
    const chkData = await chkRes.json().catch(() => ({}));
    activeProvider = chkData.provider || null;
  } catch (e) { /* backend mungkin offline, lanjut saja — server yg tentukan */ }

  if (!activeProvider) {
    showLpToast(
      'Tidak ada provider chat aktif. Hubungkan WhatsApp Business API atau Telegram di halaman Integrasi.',
      'error'
    );
    return;
  }

  const providerLabel = activeProvider === 'whatsapp' ? 'WhatsApp Business' : 'Telegram';
  const providerIcon  = activeProvider === 'whatsapp' ? '📱' : '✈️';

  showLpToast(`${providerIcon} AI mulai menghubungi ${targets.length} lead via ${providerLabel}…`, 'success');

  try {
    const res = await fetch(`${LP_CHAT_API_BASE}/api/leads/start-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: activeProvider,
        leads: targets.map(l => ({
          id: l.id, nama: l.nama, perusahaan: l.perusahaan, phone: l.phone,
        })),
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || `Request gagal (${res.status})`);

    // Gunakan provider yang benar-benar dipakai server (bisa berbeda dengan permintaan)
    const usedProvider     = data.provider || activeProvider;
    const usedProviderLabel = usedProvider === 'whatsapp' ? 'WhatsApp Business' : 'Telegram';

    let started = 0, notFound = 0, failed = 0;
    (data.results || []).forEach(r => {
      const lead = LEADS_DATA.find(l => l.id === r.id);
      if (!lead) return;

      if (r.ok) {
        lead.status = 'dihubungi';
        syncLeadFieldsToSheet(lead.id, { status: 'dihubungi' });
        started++;
      } else if (r.reason === 'not_found') {
        // Telegram: nomor belum pernah chat ke bot
        notFound++;
      } else if (r.reason === 'send_error' || r.reason === 'error') {
        failed++;
      }
    });

    renderLeadsTable();
    updateKatCounts();

    let msg = `✓ AI berhasil menyapa ${started} kontak via ${usedProviderLabel}.`;
    if (notFound) msg += ` ${notFound} nomor tidak ditemukan.`;
    if (failed)   msg += ` ${failed} gagal dikirim.`;
    showLpToast(msg, 'success');
  } catch (err) {
    console.error('Gagal memulai chat AI:', err);
    showLpToast('Gagal menghubungi backend AI: ' + err.message, 'error');
  }
}

// ── AREA 3: AI Recommendation Banner — Lihat Rekomendasi AI ──────
function getAiRecommendedLeads(limit = 6) {
  // Pilih leads dengan AI Score HOT atau WARM, prioritas HOT dulu,
  // lalu urutkan berdasarkan tanggal terbaru.
  const scoreRank = { HOT: 0, WARM: 1, COLD: 2 };
  return [...LEADS_DATA]
    .map(lead => ({ lead, ai: AI_SCORES[lead.id] || { score: 'WARM', reason: 'Sedang dianalisa' } }))
    .filter(({ ai }) => ai.score !== 'COLD')
    .sort((a, b) => scoreRank[a.ai.score] - scoreRank[b.ai.score])
    .slice(0, limit);
}

function openAiRecommendation() {
  const overlay = document.getElementById('lp-modal-airec');
  if (!overlay) return;

  const items = getAiRecommendedLeads();
  const scoreIcon = { HOT: '🔥', WARM: '🌤', COLD: '🧊' };
  const scoreCls  = { HOT: 'hot', WARM: 'warm', COLD: 'cold' };

  const listEl = document.getElementById('lp-airec-list');
  document.getElementById('lp-airec-count').textContent = items.length;

  if (items.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:24px 10px;color:#9ca3af;font-size:12px">
        <i class="ti ti-mood-empty" style="font-size:24px;display:block;margin-bottom:6px"></i>
        Belum ada rekomendasi baru saat ini.
      </div>`;
  } else {
    listEl.innerHTML = items.map(({ lead, ai }) => {
      const initials = lead.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const alreadyHandled = lead.status !== 'belum';
      return `
        <div class="lp-airec-item" data-id="${lead.id}">
          <div class="lp-airec-avatar">${initials}</div>
          <div class="lp-airec-info">
            <div class="lp-airec-name">${lead.nama} <span style="color:#9ca3af;font-weight:500">— ${lead.kota}</span></div>
            <div class="lp-airec-company">${lead.perusahaan}</div>
            <div class="lp-airec-reason"><i class="ti ti-sparkles" style="font-size:9px"></i>${ai.reason}</div>
          </div>
          <span class="lp-airec-score ${scoreCls[ai.score]}">${scoreIcon[ai.score]} ${ai.score}</span>
          <button class="lp-airec-action" ${alreadyHandled ? 'disabled' : ''} onclick="hubungiAiRecLead(${lead.id})">
            <i class="ti ${alreadyHandled ? 'ti-circle-check' : 'ti-brand-whatsapp'}"></i>
            ${alreadyHandled ? 'Dihubungi' : 'Hubungi'}
          </button>
        </div>`;
    }).join('');
  }

  overlay.style.display = 'flex';
}

function closeAiRecommendation() {
  const overlay = document.getElementById('lp-modal-airec');
  if (overlay) overlay.style.display = 'none';
}

function hubungiAiRecLead(id) {
  hubungiWA(id);
  // Refresh tampilan list di dalam modal supaya tombol berubah jadi "Dihubungi"
  openAiRecommendation();
}

// ── AREA 3: AI Recommendation Banner — Cara Kerja AI Leads ──────
function openHowBuyLeadsWorks() {
  const overlay = document.getElementById('lp-modal-howit');
  if (overlay) overlay.style.display = 'flex';
}

function closeHowBuyLeadsWorks() {
  const overlay = document.getElementById('lp-modal-howit');
  if (overlay) overlay.style.display = 'none';
}


// ── Toast ─────────────────────────────────────────────────────
function showLpToast(msg, type = '') {
  const toast = document.getElementById('lp-toast');
  toast.className = 'lp-toast' + (type ? ' ' + type : '');
  toast.innerHTML = `<i class="ti ${type === 'success' ? 'ti-circle-check' : 'ti-info-circle'}"></i> ${msg}`;
  toast.style.display = 'flex';
  clearTimeout(window._lpToastTimer);
  window._lpToastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ── Auto-init saat halaman leads aktif ────────────────────────
// Panggil initLeadsPage() dari navigasi utama ketika halaman leads ditampilkan.
// Contoh integrasi di script.js:
//   case 'leads': initLeadsPage(); break;
//
// Atau tambahkan di event navigasi sidebar item "Kontak / Leads":
//   document.addEventListener('DOMContentLoaded', () => {
//     const leadsNav = document.querySelector('[data-page="leads"]');
//     if (leadsNav) leadsNav.addEventListener('click', () => initLeadsPage());
//   });

/* ============================================================
   leads-page-ai.js
   Logika 7 AI Feature Areas untuk halaman Leads
   Harus di-load SETELAH leads-page.js
   ============================================================ */

// ── AI Score data per lead ────────────────────────────────────
// Dalam implementasi nyata ini berasal dari model scoring backend.
const AI_SCORES = {
  1:  { score:'HOT',  reason:'Kontak langsung 1 jam lalu — respons terbaik sekarang' },
  2:  { score:'HOT',  reason:'Real Lead, Jakarta, buka profil 3x hari ini' },
  3:  { score:'WARM', reason:'Sudah dihubungi, tapi belum reply 2 hari' },
  4:  { score:'HOT',  reason:'Permintaan dikirim — intent sangat tinggi' },
  5:  { score:'WARM', reason:'Kunjungi profil 2x, belum menghubungi' },
  6:  { score:'COLD', reason:'Hanya lihat profil, tidak ada aksi lanjut' },
  7:  { score:'HOT',  reason:'Kontak masuk 30 menit lalu — sudah dihubungi ✓' },
  8:  { score:'WARM', reason:'Pesan terkirim, masih menunggu balasan' },
  9:  { score:'COLD', reason:'Permintaan lama, belum ada aktivitas 5+ hari' },
  10: { score:'WARM', reason:'Repeat kontak, follow-up sedang berjalan' },
  11: { score:'HOT',  reason:'Pesan baru hari ini, belum dibalas' },
  12: { score:'WARM', reason:'Kunjungi profil, Bandung, potensi konversi' },
  13: { score:'COLD', reason:'Kontak masuk tapi tidak ada tindak lanjut' },
  14: { score:'HOT',  reason:'Permintaan closed — kandidat repeat kontak' },
  15: { score:'WARM', reason:'Pesan terkirim, belum ada respons 1 hari' },
};

// ── AI Urgency data per lead ──────────────────────────────────
const AI_URGENCY = {
  1:  { cls:'hot-time',     text:'1 jam lalu — waktu terbaik!' },
  2:  { cls:'hot-time',     text:'2 jam lalu — segera hubungi' },
  3:  { cls:'warn-time',    text:'2 hari belum dibalas' },
  4:  { cls:'hot-time',     text:'Permintaan baru — follow-up sekarang' },
  5:  { cls:'warn-time',    text:'3 hari belum dihubungi' },
  6:  { cls:'neutral-time', text:'5 hari tidak ada aktivitas' },
  7:  { cls:'ok-time',      text:'Sudah dihubungi ✓' },
  8:  { cls:'warn-time',    text:'Menunggu balas 1 hari' },
  9:  { cls:'neutral-time', text:'Tidak aktif 6 hari' },
  10: { cls:'ok-time',      text:'Follow-up sedang berjalan' },
  11: { cls:'hot-time',     text:'Pesan baru — belum dibalas!' },
  12: { cls:'warn-time',    text:'2 hari sejak kunjungan' },
  13: { cls:'neutral-time', text:'4 hari tidak ada kontak' },
  14: { cls:'ok-time',      text:'Closed ✓' },
  15: { cls:'warn-time',    text:'1 hari belum ada respons' },
};

// ── AI-generated follow-up messages ─────────────────────────
// Dalam implementasi nyata ini dipanggil ke Anthropic API
// dengan konteks: nama, perusahaan, produk, AI score, aktivitas terakhir.
function generateAiMessage(lead) {
  const templates = {
    wa: `Halo ${lead.nama}! 👋\n\nKami lihat Anda tadi menghubungi kami — apakah ada yang bisa kami bantu atau informasi yang Anda butuhkan?\n\nKami siap membantu sesuai kebutuhan Anda. Boleh ceritakan apa yang sedang dicari? 🙏`,
    msg: `Halo ${lead.nama}! 😊\n\nTerima kasih sudah menghubungi kami. Kami ingin memastikan pesan Anda sudah kami terima dengan baik.\n\nAda yang bisa kami bantu lebih lanjut? Kami siap memberikan informasi atau penawaran terbaik untuk Anda!`,
    rfq: `Halo ${lead.nama}! 🙏\n\nTerima kasih atas permintaan/booking yang sudah Anda kirimkan. Kami sangat menghargai kepercayaan Anda!\n\nKami sedang memproses permintaan Anda dan akan segera menghubungi dengan informasi lengkap. Ada yang ingin didiskusikan lebih lanjut sekarang?`,
    profil: `Halo ${lead.nama}! 👋\n\nKami perhatikan Anda baru saja mengunjungi halaman kami. Apakah ada hal yang menarik minat Anda atau informasi yang ingin Anda ketahui lebih lanjut?\n\nKami dengan senang hati siap membantu! 🙌`,
  };
  return templates[lead.sumber] || templates.wa;
}

// ── Override renderLeadRow untuk tambah kolom AI ─────────────
const _origRenderLeadRow = window.renderLeadRow;
window.renderLeadRow = function(lead) {
  const catLabel    = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const srcCfg      = bizCfg().sumber;
  const srcClass    = { wa:'src-wa', msg:'src-msg', rfq:'src-rfq', profil:'src-profil' };
  const aktClass    = { wa:'wa', msg:'msg', rfq:'rfq', profil:'profil' };
  const aktIcon     = { wa:'ti-message-circle', msg:'ti-message-2', rfq:'ti-calendar-event', profil:'ti-eye' };
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up', closed:'Closed', nomor_tidak_ditemukan:'Nomor Tidak ditemukan' };
  const statusClass = { belum:'', dihubungi:'dihubungi', followup:'followup', closed:'closed', nomor_tidak_ditemukan:'not-found' };
  const statusIcon  = { belum:'ti-circle', dihubungi:'ti-circle-check', followup:'ti-refresh', closed:'ti-check-circle-2', nomor_tidak_ditemukan:'ti-phone-off' };
  const scoreIcon   = { HOT:'🔥', WARM:'🌤', COLD:'🧊' };
  const scoreCls    = { HOT:'hot', WARM:'warm', COLD:'cold' };

  const emailDisplay = lead.email.length > 22 ? lead.email.slice(0, 22) + '…' : lead.email;

  // Area 5
  const aiScore   = AI_SCORES[lead.id]  || { score:'WARM', reason:'Sedang dianalisa' };
  // Area 6
  const aiUrgency = AI_URGENCY[lead.id] || { cls:'neutral-time', text:'—' };

  return `
  <div class="lp-row" data-id="${lead.id}">

    <!-- Checkbox -->
    <div><input type="checkbox" class="lp-row-check"></div>

    <!-- Nama & Perusahaan -->
    <div>
      <div class="lp-row-name">${lead.nama}</div>
      <div class="lp-row-company"><i class="ti ti-building-store" style="font-size:10px"></i>${lead.perusahaan}</div>
      <div class="lp-row-date"><i class="ti ti-clock" style="font-size:10px"></i>${lead.tanggal}</div>
      <div class="lp-row-tags">
        <span class="lp-tag ${lead.kategori}">
          <i class="ti ${lead.kategori==='real'?'ti-circle-check':lead.kategori==='potensi'?'ti-star':'ti-minus-circle'}" style="font-size:9px"></i>
          ${catLabel[lead.kategori]}
        </span>
        <span class="lp-tag ${srcClass[lead.sumber]}">
          <i class="ti ${aktIcon[lead.sumber]}" style="font-size:9px"></i>
          ${srcCfg[lead.sumber].name}
        </span>
      </div>
    </div>

    <!-- Kontak -->
    <div>
      <div class="lp-contact-email"><i class="ti ti-mail" style="font-size:10px;opacity:.6"></i>${emailDisplay}</div>
      <div class="lp-contact-phone"><i class="ti ti-phone" style="font-size:10px;opacity:.6"></i>${lead.phone}</div>
      <div class="lp-contact-city"><i class="ti ti-map-pin" style="font-size:10px;opacity:.6"></i>${lead.kota}</div>
    </div>

    <!-- Aktivitas Terakhir (+ Area 6 urgency) -->
    <div>
      <span class="lp-aktivitas-badge ${aktClass[lead.sumber]}">
        <i class="ti ${aktIcon[lead.sumber]}" style="font-size:11px"></i>${lead.aktivitas}
      </span>
      <div style="margin-top:5px">
        <span class="lp-urgency-tag ${aiUrgency.cls}">
          <i class="ti ${aiUrgency.cls==='hot-time'?'ti-flame':aiUrgency.cls==='warn-time'?'ti-alert-triangle':aiUrgency.cls==='ok-time'?'ti-circle-check':'ti-clock'}" style="font-size:9px"></i>
          ${aiUrgency.text}
        </span>
      </div>
    </div>

    <!-- Area 5: AI Score -->
    <div class="lp-ai-score-cell">
      <span class="lp-score-badge ${scoreCls[aiScore.score]}">
        ${scoreIcon[aiScore.score]} ${aiScore.score}
      </span>
      <div class="lp-score-reason">${aiScore.reason}</div>
    </div>

    <!-- Status Follow-up -->
    <div>
      <button class="lp-status-followup ${statusClass[lead.status]}" onclick="openStatusModal(${lead.id})">
        <i class="ti ${statusIcon[lead.status]}"></i>${statusLabel[lead.status]}
      </button>
    </div>

    <!-- Aksi (WA + Area 7: AI Follow-up) -->
    <div class="lp-aksi-wrap">
      <div class="lp-aksi-row">
        <button class="lp-btn-wa" onclick="hubungiWA(${lead.id})">
          <i class="ti ti-brand-whatsapp"></i> Hubungi WA
        </button>
        <button class="lp-btn-more" onclick="openLeadModal(${lead.id})">
          <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <circle cx="12" cy="5" r="2"/>
            <circle cx="12" cy="12" r="2"/>
            <circle cx="12" cy="19" r="2"/>
          </svg>
        </button>
      </div>
      <!-- Area 7 -->
    
      <div class="lp-aksi-row">
      <button class="lp-btn-ai-followup" onclick="openAiFollowup(${lead.id})">
        <i class="ti ti-brain"></i> Follow-up AI
      </button>
      <button class="lp-btn-more" style="background-color: transparent; border-color: transparent;"> </button>
      </div>
    </div>

  </div>`;
};

// ── AREA 4: Natural Language Pill handler ────────────────────
function applyNlPill(btn, query) {
  // Toggle active state
  document.querySelectorAll('.lp-nl-pill').forEach(p => p.classList.remove('active'));
  const searchEl = document.getElementById('lp-search');
  if (searchEl.value === query) {
    // Second click: clear
    searchEl.value = '';
    lpState.query  = '';
  } else {
    btn.classList.add('active');
    searchEl.value = query;
    lpState.query  = query.toLowerCase();
  }
  lpState.page = 1;
  renderLeadsTable();
}

// ── AREA 7: AI Follow-up Modal ───────────────────────────────
let _aiFollowupLeadId = null;
let _aiFollowupTimer  = null;

function openAiFollowup(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  _aiFollowupLeadId = id;

  // Reset modal
  document.getElementById('lp-aifollowup-name').textContent = lead.nama;
  document.getElementById('lp-aifollowup-loading').style.display = 'flex';
  document.getElementById('lp-aifollowup-result').style.display  = 'none';
  document.getElementById('lp-aifollowup-send-btn').style.display = 'none';

  // Context pills
  const aiScore = AI_SCORES[id] || { score:'WARM', reason:'—' };
  const scoreIcon = { HOT:'🔥', WARM:'🌤', COLD:'🧊' };
  const srcCfg = bizCfg().sumber;
  document.getElementById('lp-aifollowup-context').innerHTML = `
    <span class="lp-aifollowup-context-pill"><i class="ti ti-user"></i> ${lead.nama}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-building-store"></i> ${lead.perusahaan}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-map-pin"></i> ${lead.kota}</span>
    <span class="lp-aifollowup-context-pill">${scoreIcon[aiScore.score]} AI Score: ${aiScore.score}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-antenna" style="color:#6b7280"></i> Sumber: ${srcCfg[lead.sumber]?.name || lead.sumber}</span>
  `;

  document.getElementById('lp-modal-ai-followup').style.display = 'flex';

  // Simulate AI writing (1.5s delay)
  clearTimeout(_aiFollowupTimer);
  _aiFollowupTimer = setTimeout(() => {
    const msg = generateAiMessage(lead);
    document.getElementById('lp-aifollowup-msg').value = msg;
    document.getElementById('lp-aifollowup-loading').style.display = 'none';
    document.getElementById('lp-aifollowup-result').style.display  = 'block';
    document.getElementById('lp-aifollowup-send-btn').style.display = 'flex';
  }, 1500);
}

function closeAiFollowup() {
  clearTimeout(_aiFollowupTimer);
  document.getElementById('lp-modal-ai-followup').style.display = 'none';
  _aiFollowupLeadId = null;
}

function sendAiFollowupWA() {
  const lead = LEADS_DATA.find(l => l.id === _aiFollowupLeadId);
  if (!lead) return;
  const msg = document.getElementById('lp-aifollowup-msg').value;

  // Auto-update status to dihubungi
  if (lead.status === 'belum') {
    lead.status = 'dihubungi';
    renderLeadsTable();
    syncLeadFieldsToSheet(lead.id, { status: 'dihubungi' });
  }

  // Kirim via WABA jika tersedia, fallback ke wa.me link
  const waMsg  = encodeURIComponent(msg);
  const wabaOk = typeof wbGetToken === 'function' && wbGetToken();
  if (wabaOk) {
    // Kirim via backend WABA
    fetch(`${LP_CHAT_API_BASE}/api/leads/start-chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        provider: 'whatsapp',
        leads: [{ id: lead.id, nama: lead.nama, perusahaan: lead.perusahaan, phone: lead.phone }],
      }),
    }).then(r => r.json()).then(data => {
      if (data.ok && data.results?.[0]?.ok) {
        showLpToast('📱 Pesan terkirim via WhatsApp Business!', 'success');
      }
    }).catch(err => console.warn('[WABA followup]', err));
  } else {
    // Fallback: buka wa.me di tab baru
    window.open(`https://wa.me/62${lead.phone}?text=${waMsg}`, '_blank');
  }

  closeAiFollowup();
  showLpToast(`Pesan AI untuk ${lead.nama} siap dikirim via WhatsApp ✓`, 'success');
}

// (initLeadsPage sudah didefinisikan di atas dengan loadLeadsFromSheet)

// Auto-init if page already active
if (document.getElementById('leads-page') &&
    document.getElementById('leads-page').classList.contains('active-page')) {
  initLeadsPage();
}