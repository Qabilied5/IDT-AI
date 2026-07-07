/**
 * ============================================================
 *  Google Apps Script — Web App backend untuk Leads (CRM SPA)
 * ------------------------------------------------------------
 *  DINAMIS berdasarkan NAMA HEADER (bukan posisi kolom).
 *  Kolom boleh dipindah-pindah / diurutkan ulang di sheet —
 *  script ini tetap menemukan datanya selama nama header di
 *  baris pertama cocok (atau salah satu alias di COLUMN_MAP).
 *
 *  TEMPLATE HEADER (baris pertama sheet "Leads"), urutan bebas:
 *  Tanggal Masuk Lead | Nama Perusahaan | Nama Kontak / PIC |
 *  Jabatan | Nomor HP | Sumber Lead | Status | Jumlah Follow-up |
 *  Aksi Selanjutnya | Pipeline Stage | Status Lead |
 *  Estimasi Nominal (Opsional)
 *
 *  PENTING — 2 kolom yang mirip namanya:
 *   - "Status"      -> progres follow-up (Belum Dihubungi /
 *                      Sudah Dihubungi / Follow-up Lanjutan /
 *                      Closed / Deal)
 *   - "Status Lead" -> kualifikasi lead (Real Lead / Potensi /
 *                      Belum Dikualifikasi)
 *  Kalau ternyata maksud Qabil kebalikan dari ini, tinggal tukar
 *  alias 'status' dan 'kategori' di COLUMN_MAP di bawah — tidak
 *  perlu ubah bagian lain.
 * ============================================================
 */

const SHEET_NAME = 'Leads';

// Label di sheet -> kode internal yang dipakai UI.
// JANGAN diubah, harus sinkron dengan leads-page.js
const KATEGORI_MAP = {
  'Real Lead': 'real',
  'Potensi': 'potensi',
  'Belum Dikualifikasi': 'belum',
};
const SUMBER_MAP = {
  'Kontak Langsung': 'wa',
  'Kirim Pesan': 'msg',
  'Kunjungan Profil/Website': 'profil',
};
const STATUS_MAP = {
  'Belum Dihubungi': 'belum',
  'Sudah Dihubungi': 'dihubungi',
  'Follow-up': 'followup',
  'Closed / Deal': 'closed',
};
const STATUS_MAP_REV = invertMap(STATUS_MAP);

// Versi "dinormalisasi" dari map di atas (key di-lowercase & spasi
// dirapikan) supaya pencocokan label dari sheet tidak gagal cuma
// gara-gara beda kapital atau ada spasi nyelip (mis. "Closed / Deal "
// dengan spasi ekstra di belakang, atau "closed / deal" huruf kecil
// semua). Nilai/hasil yang dikembalikan tetap sama seperti map asli.
function buildNormMap_(map) {
  const out = {};
  for (const label in map) out[normalizeHeader_(label)] = map[label];
  return out;
}
function lookupLabel_(normMap, label, fallback) {
  const hit = normMap[normalizeHeader_(label)];
  return hit !== undefined ? hit : fallback;
}
const KATEGORI_MAP_NORM = buildNormMap_(KATEGORI_MAP);
const SUMBER_MAP_NORM   = buildNormMap_(SUMBER_MAP);
const STATUS_MAP_NORM   = buildNormMap_(STATUS_MAP);

/**
 * Peta field internal -> daftar kemungkinan nama header di sheet
 * (urutan = prioritas pencarian). Tambah alias di sini kalau nama
 * header berubah lagi nanti — TIDAK perlu sentuh kode lain.
 */
const COLUMN_MAP = {
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
  kategori:        ['Status Lead', 'Kategori Lead', 'Kategori'],  // kualifikasi lead
  estimasi:        ['Estimasi Nominal (Opsional)', 'Estimasi Nominal', 'Nominal'],
  tipeLayanan:     ['Produk', 'Layanan', 'Produk/Layanan', 'Produk / Layanan'],

  // Kolom lama yang sudah tidak ada di template baru. Kalau suatu
  // saat ditambah lagi ke sheet, otomatis langsung kepakai lagi
  // tanpa ubah kode (kalau tidak ada, akan default ke '' saja).
  email:           ['Email'],
  kota:            ['Kota'],
  aktivitas:       ['Aktivitas'],
};

function invertMap(obj) {
  const out = {};
  for (const key in obj) out[obj[key]] = key;
  return out;
}

function getSheet_() {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(SHEET_NAME);
  if (!sheet) {
    throw new Error('Sheet/tab bernama "' + SHEET_NAME + '" tidak ditemukan. Cek nama tab di spreadsheet kamu.');
  }
  return sheet;
}

function normalizeHeader_(s) {
  return String(s || '').replace(/\s+/g, ' ').trim().toLowerCase();
}

/**
 * Baca baris header sheet, hasilkan map: field internal -> index
 * kolom (0-based). Kalau kolom tidak ditemukan, nilainya -1.
 */
function buildHeaderIndex_(sheet) {
  const lastCol = sheet.getLastColumn();
  const headerRow = sheet.getRange(1, 1, 1, lastCol).getValues()[0];
  const normalized = headerRow.map(normalizeHeader_);

  const colIndex = {};
  for (const field in COLUMN_MAP) {
    const aliases = COLUMN_MAP[field];
    let found = -1;
    for (let a = 0; a < aliases.length; a++) {
      const idx = normalized.indexOf(normalizeHeader_(aliases[a]));
      if (idx !== -1) { found = idx; break; }
    }
    colIndex[field] = found;
  }
  return colIndex;
}

function cell_(row, colIndex, field) {
  const idx = colIndex[field];
  if (idx === undefined || idx === -1) return '';
  const v = row[idx];
  if (v === null || v === undefined) return '';
  // Trim string values (mis. label kategori/sumber/status) supaya spasi
  // nyelip tidak bikin pencocokan gagal. Date/Number dibiarkan apa adanya.
  return typeof v === 'string' ? v.trim() : v;
}

function formatTanggal_(val) {
  if (!val) return '';
  if (Object.prototype.toString.call(val) === '[object Date]') {
    return Utilities.formatDate(val, Session.getScriptTimeZone(), 'dd MMM yyyy');
  }
  return String(val);
}

// ── GET: ambil semua leads dari sheet ──────────────────────────
function doGet(e) {
  try {
    const sheet = getSheet_();
    const colIndex = buildHeaderIndex_(sheet);

    // Validasi kolom wajib supaya error-nya jelas kalau ada typo header
    ['nama', 'status'].forEach(function (f) {
      if (colIndex[f] === -1) {
        throw new Error(
          'Kolom untuk "' + f + '" tidak ditemukan. Cek nama header di baris pertama sheet "Leads". ' +
          'Nama yang dicoba: ' + COLUMN_MAP[f].join(' / ')
        );
      }
    });

    const lastRow = sheet.getLastRow();
    if (lastRow < 2) return jsonResponse_({ ok: true, leads: [] });

    const lastCol = sheet.getLastColumn();
    const rows = sheet.getRange(2, 1, lastRow - 1, lastCol).getValues();

    const leads = rows.map(function (r, i) {
      const nama = cell_(r, colIndex, 'nama');
      if (!nama) return null; // skip baris kosong

      const kategoriLabel = cell_(r, colIndex, 'kategori');
      const sumberLabel   = cell_(r, colIndex, 'sumber');
      const statusLabel   = cell_(r, colIndex, 'status');
      const aktivitasRaw  = cell_(r, colIndex, 'aktivitas');

      return {
        id: i + 1, // posisi baris data (baris sheet ke id+1, baris 1 = header)
        nama: String(nama),
        perusahaan: String(cell_(r, colIndex, 'perusahaan')),
        tanggal: formatTanggal_(cell_(r, colIndex, 'tanggal')),
        email: String(cell_(r, colIndex, 'email')),
        phone: String(cell_(r, colIndex, 'phone')).replace(/^0/, '').replace(/\D/g, ''),
        kota: String(cell_(r, colIndex, 'kota')),
        kategori: lookupLabel_(KATEGORI_MAP_NORM, kategoriLabel, 'belum'),
        sumber: lookupLabel_(SUMBER_MAP_NORM, sumberLabel, 'wa'),
        aktivitas: String(aktivitasRaw || sumberLabel || ''),
        status: lookupLabel_(STATUS_MAP_NORM, statusLabel, 'belum'),

        // Field tambahan dari template baru. Belum dipakai UI
        // Kontak/Leads saat ini (supaya UI tidak perlu diubah),
        // tapi sudah tersedia di data untuk dipakai modul lain
        // (mis. Pipeline) kapanpun dibutuhkan.
        jabatan: String(cell_(r, colIndex, 'jabatan')),
        jumlahFollowup: cell_(r, colIndex, 'jumlahFollowup') || 0,
        aksiSelanjutnya: String(cell_(r, colIndex, 'aksiSelanjutnya')),
        pipelineStage: String(cell_(r, colIndex, 'pipelineStage')),
        estimasiNominal: cell_(r, colIndex, 'estimasi') || '',
        tipeLayanan: String(cell_(r, colIndex, 'tipeLayanan')),
      };
    }).filter(function (x) { return x !== null; });

    return jsonResponse_({ ok: true, leads: leads });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}

// ── POST: update status lead (dipanggil dari dashboard) ────────
function doPost(e) {
  try {
    const body = JSON.parse(e.postData.contents);

    if (body.action === 'updateStatus') {
      return handleUpdateStatus_(body);
    }

    return jsonResponse_({ ok: false, error: 'Aksi tidak dikenal: ' + body.action });
  } catch (err) {
    return jsonResponse_({ ok: false, error: err.message });
  }
}

function handleUpdateStatus_(body) {
  const id     = Number(body.id);
  const status = body.status;
  const statusLabel = STATUS_MAP_REV[status];

  if (!id || !statusLabel) {
    return jsonResponse_({ ok: false, error: 'id atau status tidak valid' });
  }

  const sheet    = getSheet_();
  const colIndex = buildHeaderIndex_(sheet);

  if (colIndex.status === -1) {
    return jsonResponse_({ ok: false, error: 'Kolom "Status" tidak ditemukan di sheet.' });
  }

  const row     = id + 1; // +1 karena baris pertama adalah header
  const lastRow = sheet.getLastRow();

  if (row < 2 || row > lastRow) {
    return jsonResponse_({ ok: false, error: 'Lead dengan id ' + id + ' tidak ditemukan' });
  }

  sheet.getRange(row, colIndex.status + 1).setValue(statusLabel); // +1: index -> nomor kolom
  return jsonResponse_({ ok: true });
}

function jsonResponse_(obj) {
  return ContentService
    .createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}