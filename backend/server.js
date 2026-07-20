/* =============================================================
   server.js
   Backend testing: Ollama (generate pesan) + Telegram (kirim pesan)
   Pengganti sementara WhatsApp Business API selagi WABA diproses.

   Konfigurasi Telegram Bot Token TIDAK diisi lewat .env lagi — token
   diatur dari halaman Integrasi di dashboard (disimpan di localStorage
   browser lalu dikirim ke server lewat POST /api/telegram/config).

   Cara pakai cepat:
     1) cp .env.example .env   (isi OLLAMA_* dkk; TELEGRAM_BOT_TOKEN opsional/fallback)
     2) npm install
        npm install multer pdf-parse mammoth xlsx   (untuk fitur Knowledge Base)
     3) ollama serve           (terminal lain, biarkan jalan)
     4) ollama pull llama3.1   (sekali saja, sesuaikan OLLAMA_MODEL)
     5) npm start
     6) Buka halaman Integrasi di dashboard → hubungkan Telegram Bot
        (token akan otomatis dikirim & dipakai server tanpa perlu .env)
     7) Buka halaman Knowledge Base di dashboard → upload dokumen/URL/teks.
        Semua dokumen berstatus "Aktif" otomatis jadi SATU-SATUNYA sumber
        jawaban AI (lihat kbActiveContext() & tgBuildConversationPrompt di
        bawah) — disimpan persisten di data/knowledge-base.json.
   ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');
const fs = require('fs');
const path = require('path');
const multer = require('multer');

// Ekstraktor teks per tipe file — dibuat OPSIONAL (try/catch) supaya server
// tetap bisa start walau salah satu belum di-`npm install`. Kalau modulnya
// belum ada, upload tetap tersimpan tapi isinya diberi catatan "gagal
// ekstrak" (bisa dilihat & diedit manual dari tab Teks Langsung).
// Install semua sekaligus: npm install multer pdf-parse mammoth xlsx
let pdfParseLib = null;
let mammothLib = null;
let xlsxLib = null;
try { pdfParseLib = require('pdf-parse').PDFParse; } catch (e) { console.warn('[KB] Modul "pdf-parse" belum terinstall — jalankan: npm install pdf-parse'); }
try { mammothLib = require('mammoth'); } catch (e) { console.warn('[KB] Modul "mammoth" belum terinstall — jalankan: npm install mammoth'); }
try { xlsxLib = require('xlsx'); } catch (e) { console.warn('[KB] Modul "xlsx" belum terinstall — jalankan: npm install xlsx'); }

const app = express();
app.use(cors());
app.use(express.json({ limit: '2mb' }));

const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
// Model terpisah untuk pipeline insight (opsional). Analisis JSON terstruktur
// biasanya lebih stabil di model yang lebih besar/instruction-tuned baik;
// kalau tidak diisi, pakai OLLAMA_MODEL yang sama dengan follow-up.
const PIPELINE_OLLAMA_MODEL = process.env.PIPELINE_OLLAMA_MODEL || OLLAMA_MODEL;
// Token Telegram TIDAK LAGI diambil dari .env secara permanen — sekarang diatur
// secara runtime lewat halaman Integrasi (POST/DELETE /api/telegram/config).
// .env cuma dipakai sebagai fallback awal kalau server baru pertama kali start
// dan belum ada token yang dikirim dari frontend.
let TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
let TELEGRAM_DEFAULT_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID || '';
// Kredensial WhatsApp Business API (WABA / Meta Cloud API) — sejajar dengan
// Telegram di atas: TIDAK diambil dari .env secara permanen, diatur runtime
// lewat halaman Integrasi (POST/DELETE /api/waba/config), dikirim dari
// browser lewat script_page/waba-token.js. .env cuma fallback awal.
let WABA_ACCESS_TOKEN = process.env.WABA_ACCESS_TOKEN || '';
let WABA_PHONE_NUMBER_ID = process.env.WABA_PHONE_NUMBER_ID || '';
let WABA_BUSINESS_ACCOUNT_ID = process.env.WABA_BUSINESS_ACCOUNT_ID || '';
let WABA_VERIFY_TOKEN = process.env.WABA_VERIFY_TOKEN || '';
let wabaBotInfo = null; // { verified_name, display_phone_number }
let wabaConversations = new Map(); // key = nomor tujuan -> { chatId, name, phone, messages: [...] }
const SEND_MODE = process.env.SEND_MODE || 'mock'; // mock | telegram | whatsapp

// ── Riwayat pengiriman sementara (in-memory, hilang saat restart) ──
// Pada implementasi production ini diganti dengan tabel di database.
const sendLog = [];

// Deskripsi singkat & FAKTUAL soal bisnis Indotrading — disisipkan ke SEMUA
// prompt Ollama di bawah (follow-up, balasan chat, intro WABA, dst). Tanpa
// ini, model bisa "mengarang" sendiri bidang usaha perusahaan saat customer
// tanya produk/layanan (pernah kejadian: AI bilang "menjual mesin produksi",
// padahal Indotrading adalah marketplace B2B & B2G, bukan pabrikan/reseller
// mesin). Bisa dioverride lewat .env kalau deskripsinya perlu diperbarui.
const COMPANY_DESC = process.env.COMPANY_DESC ||
  'Indotrading.com adalah marketplace B2B & B2G (business-to-business dan ' +
  'business-to-government) di Indonesia. Kami mempertemukan supplier dengan ' +
  'buyer perusahaan maupun instansi pemerintah lewat sistem RFQ (permintaan ' +
  'pembelian/tender online) dan E-Procurement, dan terdaftar resmi di Toko ' +
  'Daring LKPP. Kami TIDAK memproduksi atau menjual barang/mesin sendiri — ' +
  'kami adalah platform yang membantu perusahaan (supplier) menjangkau lebih ' +
  'banyak buyer, dan membantu buyer menemukan supplier yang tepat.';

// =============================================================
// 0b) KNOWLEDGE BASE — dokumen yang dipakai AI Ollama sebagai SATU-SATUNYA
//     sumber jawaban (halaman "Knowledge Base" di dashboard).
//     Disimpan sebagai file JSON di disk (data/knowledge-base.json) supaya
//     tidak hilang saat server restart — tanpa perlu database.
//     File asli hasil upload (pdf/docx/xlsx/...) disimpan di data/kb-uploads/,
//     isi teksnya diekstrak sekali lalu disimpan di field `content` supaya
//     tidak perlu parse ulang file tiap kali AI membalas chat.
// =============================================================
const KB_DATA_DIR    = path.join(__dirname, 'data');
const KB_UPLOADS_DIR = path.join(KB_DATA_DIR, 'kb-uploads');
const KB_DATA_FILE   = path.join(KB_DATA_DIR, 'knowledge-base.json');
fs.mkdirSync(KB_UPLOADS_DIR, { recursive: true });

const KB_MAX_CONTENT_CHARS = 300000; // batas simpan per dokumen (~300rb karakter)
// Total karakter dari SEMUA dokumen aktif yang disisipkan ke tiap prompt Ollama.
// Dibatasi supaya prompt tidak meledak / lambat kalau dokumen aktif banyak.
const KB_CONTEXT_MAX_CHARS = Number(process.env.KB_CONTEXT_MAX_CHARS || 9000);

let knowledgeBase = [];

function kbLoad() {
  try {
    if (fs.existsSync(KB_DATA_FILE)) {
      knowledgeBase = JSON.parse(fs.readFileSync(KB_DATA_FILE, 'utf8'));
    }
  } catch (e) {
    console.error('[KB] Gagal membaca knowledge-base.json:', e.message);
    knowledgeBase = [];
  }
}
function kbSave() {
  try {
    fs.mkdirSync(KB_DATA_DIR, { recursive: true });
    fs.writeFileSync(KB_DATA_FILE, JSON.stringify(knowledgeBase, null, 2));
  } catch (e) {
    console.error('[KB] Gagal menyimpan knowledge-base.json:', e.message);
  }
}
kbLoad();

function kbNextId() {
  return knowledgeBase.reduce((max, d) => Math.max(max, d.id), 0) + 1;
}
function kbFind(id) {
  return knowledgeBase.find((d) => d.id === Number(id));
}
function kbTrimContent(text) {
  const t = (text || '').replace(/\r\n/g, '\n').trim();
  return t.length > KB_MAX_CONTENT_CHARS
    ? t.slice(0, KB_MAX_CONTENT_CHARS) + '\n[...dipotong, dokumen terlalu panjang...]'
    : t;
}

// Field yang aman dikirim ke frontend (tanpa `content` penuh, kecuali endpoint detail).
function kbPublicDoc(d) {
  return {
    id: d.id,
    title: d.title,
    category: d.category || 'umum',
    status: d.status || 'aktif',
    sourceType: d.sourceType,
    fileName: d.fileName || null,
    fileExt: d.fileExt || null,
    sizeBytes: d.sizeBytes || Buffer.byteLength(d.content || '', 'utf8'),
    url: d.url || null,
    autoSync: !!d.autoSync,
    createdAt: d.createdAt,
    updatedAt: d.updatedAt,
    contentLength: (d.content || '').length,
    contentPreview: (d.content || '').slice(0, 500),
    extractFailed: /^\[(Ekstraksi|Gagal)/.test(d.content || ''),
  };
}

// ── EKSTRAKSI TEKS DARI FILE ──────────────────────────────────────
async function kbExtractFileText(filePath, ext) {
  try {
    if (ext === 'txt' || ext === 'csv') {
      return fs.readFileSync(filePath, 'utf8');
    }
    if (ext === 'pdf') {
      if (!pdfParseLib) return '[Ekstraksi PDF gagal: modul pdf-parse belum terinstall di server]';
      const buffer = fs.readFileSync(filePath);
      const parser = new pdfParseLib({ data: buffer });
      const data = await parser.getText();
      return data.text || '';
    }
    if (ext === 'docx') {
      if (!mammothLib) return '[Ekstraksi DOCX gagal: modul mammoth belum terinstall di server]';
      const result = await mammothLib.extractRawText({ path: filePath });
      return result.value || '';
    }
    if (ext === 'xlsx' || ext === 'xls') {
      if (!xlsxLib) return '[Ekstraksi XLSX gagal: modul xlsx belum terinstall di server]';
      const wb = xlsxLib.readFile(filePath);
      let out = '';
      wb.SheetNames.forEach((name) => {
        out += `\n--- Sheet: ${name} ---\n` + xlsxLib.utils.sheet_to_csv(wb.Sheets[name]);
      });
      return out;
    }
    return '';
  } catch (e) {
    console.error('[KB] Gagal ekstrak teks file:', e.message);
    return `[Gagal mengekstrak isi file: ${e.message}]`;
  }
}

// ── STRIP HTML (untuk sumber URL/website, tanpa dependency tambahan) ─────
function kbStripHtml(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<!--[\s\S]*?-->/g, ' ')
    .replace(/<br\s*\/?>/gi, '\n')
    .replace(/<\/(p|div|li|h[1-6]|tr|section|article)>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/[ \t]+/g, ' ')
    .replace(/\n[ \t]*\n[ \t]*\n+/g, '\n\n')
    .trim();
}

// ── KONTEKS UNTUK PROMPT OLLAMA ───────────────────────────────────
// Menggabungkan isi SEMUA dokumen berstatus "aktif" jadi satu blok teks
// yang disisipkan ke prompt AI. Ini yang membuat AI "hanya menjawab dari
// Knowledge Base" — lihat tgBuildConversationPrompt di bawah.
function kbActiveContext() {
  const active = knowledgeBase.filter((d) => d.status === 'aktif' && (d.content || '').trim());
  if (!active.length) return '';
  let out = '';
  let used = 0;
  for (const doc of active) {
    const block = `### ${doc.title} [kategori: ${doc.category || 'umum'}]\n${doc.content.trim()}\n\n`;
    if (used + block.length > KB_CONTEXT_MAX_CHARS) {
      const remaining = KB_CONTEXT_MAX_CHARS - used;
      if (remaining > 200) out += block.slice(0, remaining) + '\n[...dipotong...]\n\n';
      break;
    }
    out += block;
    used += block.length;
  }
  return out.trim();
}

// Multer — upload file ke data/kb-uploads/ dengan nama unik.
const kbStorage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, KB_UPLOADS_DIR),
  filename: (req, file, cb) => {
    const ext = path.extname(file.originalname);
    cb(null, `${Date.now()}-${Math.round(Math.random() * 1e9)}${ext}`);
  },
});
const kbUpload = multer({
  storage: kbStorage,
  limits: { fileSize: 20 * 1024 * 1024 }, // 20 MB, samakan dengan hint di UI
  fileFilter: (req, file, cb) => {
    const ext = path.extname(file.originalname).slice(1).toLowerCase();
    const allowed = ['pdf', 'docx', 'xlsx', 'xls', 'txt', 'csv'];
    if (!allowed.includes(ext)) return cb(new Error(`Tipe file .${ext} tidak didukung`));
    cb(null, true);
  },
});

// =============================================================
// 1) GENERATE PESAN FOLLOW-UP VIA OLLAMA
// =============================================================
function buildPrompt(lead) {
  // Konteks ini meniru struktur AI_SCORES dan AI_URGENCY di leads-page.js
  // supaya pesan yang dihasilkan relevan dengan kondisi lead sebenarnya.
  const sumberLabel = {
    wa: 'menghubungi langsung via WhatsApp/telepon',
    msg: 'mengirim pesan ke bisnis',
    profil: 'mengunjungi halaman profil/website',
  }[lead.sumber] || 'berinteraksi dengan bisnis kita';

  return `Kamu adalah asisten sales yang ramah dan profesional untuk bisnis B2B Indonesia.
Tugasmu: tulis SATU pesan follow-up WhatsApp singkat (maksimal 4 kalimat) dalam Bahasa Indonesia
untuk lead berikut. Gaya bahasa ramah dan semi-formal, tidak kaku, tidak terlalu menjual,
fokus membuka percakapan kembali.

Tentang bisnis kami (jangan mengarang produk/layanan di luar ini):
${COMPANY_DESC}

Data lead:
- Nama: ${lead.nama}
- Perusahaan: ${lead.perusahaan || '-'}
- Kota: ${lead.kota || '-'}
- Aktivitas terakhir: ${sumberLabel}
- Skor AI: ${lead.aiScore || 'WARM'}
- Status saat ini: ${lead.status || 'belum dihubungi'}

Aturan:
- Sapa pakai nama lead.
- Sebutkan aktivitas terakhirnya secara natural (jangan kaku seperti membaca data).
- Tutup dengan pertanyaan terbuka yang mengundang balasan.
- JANGAN gunakan markdown, JANGAN beri judul, JANGAN beri penjelasan tambahan.
- Output HANYA isi pesannya saja, siap kirim.`;
}

async function generateMessageWithOllama(lead) {
  const prompt = buildPrompt(lead);

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.response || '').trim();
}

// =============================================================
// 2) KIRIM PESAN — TELEGRAM (mode testing) / MOCK (log saja)
// =============================================================
async function sendViaTelegram(chatId, message) {
  if (!TELEGRAM_BOT_TOKEN) {
    throw new Error('TELEGRAM_BOT_TOKEN belum diisi di .env');
  }
  const targetChatId = chatId || TELEGRAM_DEFAULT_CHAT_ID;
  if (!targetChatId) {
    throw new Error('Chat ID tujuan kosong. Isi TELEGRAM_DEFAULT_CHAT_ID atau kirim chatId di request.');
  }

  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage`;
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chat_id: targetChatId, text: message }),
  });

  const data = await res.json();
  if (!data.ok) {
    throw new Error(`Telegram error: ${data.description || 'unknown'}`);
  }
  return data;
}

// =============================================================
// 2a-2) KIRIM PESAN — WHATSAPP BUSINESS API (WABA / Meta Cloud API)
// =============================================================
async function sendViaWaba(to, message) {
  if (!WABA_ACCESS_TOKEN || !WABA_PHONE_NUMBER_ID) {
    throw new Error('WABA belum dikonfigurasi (Access Token / Phone Number ID kosong)');
  }
  if (!to) {
    throw new Error('Nomor tujuan (to) kosong');
  }

  const url = `https://graph.facebook.com/v20.0/${WABA_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WABA_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'text',
      text: { body: message },
    }),
  });

  const data = await res.json();
  if (data.error) {
    throw new Error(`WABA error: ${data.error.message || 'unknown'}`);
  }
  return data;
}

// ── KIRIM PESAN PEMBUKA (TEMPLATE) — WHATSAPP BUSINESS API ───────────────────
// WhatsApp Cloud API MENOLAK pesan bebas (type: "text") sebagai pesan
// PERTAMA ke nomor yang belum pernah membalas nomor bisnis kita (tidak ada
// "customer service window" terbuka). Untuk kontak pertama, WAJIB pakai
// message template yang disetujui Meta. Nama 'hello_world' TIDAK BISA dipakai
// di WABA ini — nama itu reserved khusus untuk sample template WABA yang baru
// dibuat dari nol, dan ditolak Meta kalau dibuat manual di WABA yang sudah ada
// (lihat error 132001 / "reserved for sample templates"). 'hello_test' adalah
// template custom sederhana (kategori Utility, isi fixed "Hello World") yang
// dibuat manual & sudah di-approve Meta untuk WABA ini, jadi hanya cocok untuk
// TEST. Untuk pesan intro custom (nama/perusahaan lead) di production, buat
// template sendiri di Meta Business Manager > WhatsApp Manager > Message
// Templates dengan variabel body, ajukan approval, lalu ganti templateName +
// tambahkan components (lihat komentar di bawah).
async function sendViaWabaTemplate(to, templateName = 'hello_test', languageCode = 'en', components = null) {
  if (!WABA_ACCESS_TOKEN || !WABA_PHONE_NUMBER_ID) {
    throw new Error('WABA belum dikonfigurasi (Access Token / Phone Number ID kosong)');
  }
  if (!to) {
    throw new Error('Nomor tujuan (to) kosong');
  }

  const template = { name: templateName, language: { code: languageCode } };
  if (components) template.components = components;
  // Contoh components untuk template custom dengan 3 variabel di body:
  // components: [{
  //   type: 'body',
  //   parameters: [
  //     { type: 'text', text: lead.nama },
  //     { type: 'text', text: COMPANY_INTRO.botName },
  //     { type: 'text', text: COMPANY_INTRO.companyName },
  //   ],
  // }]

  const url = `https://graph.facebook.com/v20.0/${WABA_PHONE_NUMBER_ID}/messages`;
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${WABA_ACCESS_TOKEN}`,
    },
    body: JSON.stringify({
      messaging_product: 'whatsapp',
      to,
      type: 'template',
      template,
    }),
  });

  const data = await res.json();
  console.log('[WABA] Response template lengkap:', JSON.stringify(data));
  if (data.error) {
    throw new Error(`WABA error: ${data.error.message || 'unknown'}`);
  }
  return data;
}

// =============================================================
// 2b) PERCAKAPAN TELEGRAM (LIVE) — polling getUpdates
//     Dipakai oleh halaman Percakapan (script_page/percapakan.js)
//     untuk menampilkan & membalas chat Telegram secara real-time.
//     Pakai polling (bukan webhook) supaya bisa langsung jalan di
//     localhost tanpa perlu URL publik.
// =============================================================

// Riwayat percakapan Telegram sementara (in-memory, hilang saat restart).
// key = chatId (string) -> { chatId, name, username, handledBy, messages: [...] }
const tgConversations = new Map();
let tgOffset = 0;
let tgPollingActive = false;
let tgBotInfo = null;
// Epoch counter — dipakai supaya loop polling lama otomatis berhenti begitu
// token diganti/dihapus lewat /api/telegram/config, tanpa dua loop jalan bareng.
let tgPollEpoch = 0;

function tgInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'TG';
}

// Normalisasi nomor HP ke bentuk "inti" tanpa kode negara/nol depan, supaya
// nomor dari spreadsheet leads (mis. "82381272032") bisa dicocokkan dengan
// nomor dari Telegram (mis. "+6282381272032" atau "6282381272032").
function tgNormalizePhone(raw) {
  let p = String(raw || '').replace(/\D/g, '');
  if (p.startsWith('62')) p = p.slice(2);
  if (p.startsWith('0')) p = p.slice(1);
  return p;
}

function tgGetOrCreateConversation(chat, fromUser) {
  const chatId = String(chat.id);
  let conv = tgConversations.get(chatId);
  if (!conv) {
    const first = (fromUser && fromUser.first_name) || chat.first_name || '';
    const last = (fromUser && fromUser.last_name) || chat.last_name || '';
    const username = (fromUser && fromUser.username) || chat.username || '';
    const name = (first + ' ' + last).trim() || (username ? '@' + username : `Chat ${chatId}`);
    conv = {
      chatId,
      name,
      username,
      initials: tgInitials(name),
      phone: '', // diisi kalau customer share kontak Telegram-nya (dipakai fitur "AI mulai chat duluan")
      introSent: false,
      handledBy: 'ai', // 'ai' | 'human'
      lastMessageText: '',
      lastMessageTime: Date.now(),
      unread: 0,
      messages: [],
    };
    tgConversations.set(chatId, conv);
  }
  return conv;
}

function tgBuildConversationPrompt(conv, incomingText) {
  const roleLabel = { in: 'Customer', ai: 'AI', human: 'Agent' };
  const historyText = conv.messages
    .slice(-6)
    .map((m) => `${roleLabel[m.dir === 'in' ? 'in' : m.from]}: ${m.text}`)
    .join('\n');

  // Knowledge Base aktif (halaman "Knowledge Base" di dashboard) — kalau ada
  // isinya, AI WAJIB menjawab detail HANYA dari sini, bukan dari pengetahuan
  // umum model. Kalau KB masih kosong, fallback ke COMPANY_DESC saja supaya
  // bot tidak bisu sebelum ada dokumen yang diupload.
  const kbContext = kbActiveContext();

  const knowledgeBlock = kbContext
    ? `Berikut adalah KNOWLEDGE BASE resmi — SATU-SATUNYA sumber kebenaran untuk menjawab
pertanyaan customer soal produk, layanan, harga, promo, SOP, maupun FAQ. Dilarang
keras menjawab dari pengetahuan lain di luar isi ini, dan dilarang mengarang jawaban:
---
${kbContext}
---`
    : `Belum ada dokumen di Knowledge Base. Gunakan hanya deskripsi umum bisnis berikut,
jangan mengarang detail produk/harga/promo yang tidak disebutkan di sini:
${COMPANY_DESC}`;

  return `Kamu adalah asisten sales AI yang ramah dan profesional untuk bisnis B2B Indonesia.
Kamu sedang membalas chat Telegram dari customer secara real-time.

Tentang bisnis kami secara umum:
${COMPANY_DESC}

${knowledgeBlock}

${historyText ? `Riwayat percakapan terakhir:\n${historyText}\n\n` : ''}Pesan baru dari customer: "${incomingText}"

Aturan:
- Balas pesan tersebut secara natural, singkat (maksimal 3 kalimat), Bahasa Indonesia, ramah dan semi-formal.
- Jangan mengulang-ulang sapaan jika percakapan sudah berjalan.
- Kalau customer menanyakan detail spesifik (produk, harga, promo, SOP, FAQ) yang TIDAK ada
  di Knowledge Base di atas, JANGAN mengarang jawaban — katakan dengan jujur bahwa informasi
  itu belum tersedia dan akan ditindaklanjuti oleh tim, jangan berpura-pura tahu.
- Kalau customer menanyakan hal di luar cakupan bisnis kami, jujur katakan itu bukan
  lingkup Indotrading.
- JANGAN gunakan markdown, JANGAN beri judul atau penjelasan tambahan.
- Jika belum mengetahui bisnis customer, maka tanya mereka menjual apa.
- Output HANYA isi balasannya saja, siap kirim.`;
}

async function tgGenerateReplyWithOllama(conv, incomingText) {
  const prompt = tgBuildConversationPrompt(conv, incomingText);
  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }
  const data = await res.json();
  return (data.response || '').trim();
}

async function tgProcessMessage(message) {
  const conv = tgGetOrCreateConversation(message.chat, message.from);

  // Tangkap nomor HP kalau customer share kontak Telegram-nya (tombol
  // "Share Contact") — dipakai fitur "AI mulai chat duluan" (blok 2f) untuk
  // mencocokkan lead dari Kontak/Leads dengan percakapan yang sudah ada.
  // Ditaruh SEBELUM guard `!message.text` di bawah karena pesan share-contact
  // tidak punya field text sama sekali.
  if (message.contact && message.contact.phone_number) {
    conv.phone = tgNormalizePhone(message.contact.phone_number);
  }

  if (!message.text) return; // sementara lewati pesan non-teks lain (foto, stiker, dll)

  // State penjadwalan per-percakapan — dipakai fitur "AI tawarkan slot kosong"
  // di bawah (lihat blok 2e). idle = belum ada tawaran aktif, offered = AI baru
  // saja menawarkan slot dan sedang menunggu customer memilih salah satunya.
  if (!conv.scheduling) conv.scheduling = { stage: 'idle', offeredSlots: [], meetingType: null };

  const incomingTime = message.date ? message.date * 1000 : Date.now();
  const incomingMsg = {
    id: conv.messages.length + 1,
    dir: 'in',
    from: 'user',
    text: message.text,
    time: incomingTime,
  };
  conv.messages.push(incomingMsg);
  conv.lastMessageText = message.text;
  conv.lastMessageTime = incomingTime;
  conv.unread += 1;

  if (conv.handledBy !== 'ai') return; // mode manual — admin yang membalas, AI diam

  try {
    const replyText = await tgHandleMessageAndMaybeSchedule(conv, message.text);
    if (replyText) {
      await sendViaTelegram(conv.chatId, replyText);
      const outMsg = {
        id: conv.messages.length + 1,
        dir: 'out',
        from: 'ai',
        text: replyText,
        time: Date.now(),
      };
      conv.messages.push(outMsg);
      conv.lastMessageText = replyText;
      conv.lastMessageTime = outMsg.time;
    }
  } catch (err) {
    console.error('[Telegram] Gagal auto-reply AI:', err.message);
  }
}

async function tgPollOnce() {
  const url = `https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getUpdates?timeout=25&offset=${tgOffset}`;
  const res = await fetch(url);
  const data = await res.json();
  if (!data.ok) throw new Error(data.description || 'Gagal getUpdates dari Telegram');

  for (const update of data.result) {
    tgOffset = update.update_id + 1;
    if (update.message) {
      await tgProcessMessage(update.message);
    }
  }
}

async function tgFetchBotInfo() {
  if (!TELEGRAM_BOT_TOKEN) return null;
  const res = await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/getMe`);
  const data = await res.json();
  if (data.ok) tgBotInfo = data.result;
  return tgBotInfo;
}

function stopTelegramPolling() {
  // Menaikkan epoch membuat loop while di bawah (kalau masih jalan) keluar
  // dengan sendirinya di iterasi berikutnya.
  tgPollEpoch++;
  tgPollingActive = false;
}

async function startTelegramPolling() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('[Telegram] Token belum dikonfigurasi — polling tidak dijalankan. Atur token di halaman Integrasi (Percakapan).');
    return;
  }

  const myEpoch = ++tgPollEpoch;
  tgOffset = 0; // mulai getUpdates dari awal setiap kali polling di-(re)start dengan token baru

  try {
    // Webhook & polling tidak bisa jalan bersamaan — pastikan webhook nonaktif dulu.
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    await tgFetchBotInfo();
    tgPollingActive = true;
    console.log(`[Telegram] Polling aktif${tgBotInfo ? ' — @' + tgBotInfo.username : ''}`);
  } catch (err) {
    console.error('[Telegram] Gagal inisialisasi polling:', err.message);
  }

  // Long-polling loop — berjalan sampai token dihapus atau epoch berubah
  // (yaitu saat token baru dipasang lewat halaman Integrasi).
  while (TELEGRAM_BOT_TOKEN && myEpoch === tgPollEpoch) {
    try {
      await tgPollOnce();
    } catch (err) {
      console.error('[Telegram] Polling error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }

  if (myEpoch === tgPollEpoch) tgPollingActive = false;
}

// =============================================================
// 2e) APPOINTMENT DARI PERCAKAPAN (BARU)
//     AI menawarkan slot jadwal yang masih kosong ke customer lewat chat
//     Telegram (mis. saat customer bertanya "boleh jadwalkan demo?"). Begitu
//     customer memilih salah satu slot, appointment otomatis dibuat di sini
//     (status "menunggu" konfirmasi admin) dan disinkronkan ke halaman
//     Appointment lewat polling GET /api/appointments/ai-created.
//     Alurnya: Percakapan → AI tawarkan slot → customer pilih →
//     appointment masuk ke halaman Appointment → admin klik tombol
//     "Konfirmasi & Follow-up" → automasi follow-up (endpoint 5b di bawah).
// =============================================================
const APPT_BUSINESS_HOURS = { startHour: 9, endHour: 17 }; // jam kerja 09.00–17.00 WIB
const APPT_WORKING_DAYS = [1, 2, 3, 4, 5]; // Senin–Jumat (0=Minggu, 6=Sabtu)
const APPT_SLOT_STEP_HOURS = 2; // jarak antar slot yang ditawarkan, biar tidak terlalu padat
const APPT_DEFAULT_DURATION = 60;
// Server tidak tahu daftar staff (itu konfigurasi frontend di appointment.js
// / SELLER_CONFIG.staffList) — pakai fallback yang bisa dioverride lewat .env
// (APPT_DEFAULT_STAFF=Nama Staff), admin tetap bisa ganti PIC saat konfirmasi.
const APPT_DEFAULT_STAFF = process.env.APPT_DEFAULT_STAFF || 'Tim Sales (belum ditentukan)';
const APPT_TYPE_LABELS = {
  demo: 'Demo Produk',
  konsultasi: 'Konsultasi',
  negosiasi: 'Negosiasi',
  onboarding: 'Onboarding',
  lainnya: 'Lainnya',
};

// Appointment yang lahir dari percakapan AI (in-memory, hilang saat restart —
// sama seperti tgConversations di atas). Terpisah dari AP_DATA di frontend
// (appointment.js) supaya tidak mengubah data demo yang sudah ada; halaman
// Appointment menggabungkan keduanya lewat polling.
const aiAppointments = [];

function apptPad(n) { return String(n).padStart(2, '0'); }

function apptTypeLabel(typeValue) {
  return APPT_TYPE_LABELS[typeValue] || APPT_TYPE_LABELS.konsultasi;
}

function apptIsSlotTaken(dateStr, timeStr) {
  return aiAppointments.some((a) => a.date === dateStr && a.time === timeStr && a.status !== 'dibatalkan');
}

// Cari N slot kosong terdekat dalam jam kerja, lewati slot yang sudah
// terisi oleh appointment (hasil AI) lain. Catatan: ini hanya mengecek
// terhadap appointment yang dibuat lewat chat (aiAppointments) karena
// appointment manual (AP_DATA) saat ini masih tersimpan di sisi frontend
// dan belum dikirim ke server — lihat catatan di README/summary.
function apptGetAvailableSlots(limit = 3, lookaheadDays = 10) {
  const slots = [];
  const now = new Date();
  for (let d = 0; d < lookaheadDays && slots.length < limit; d++) {
    const day = new Date(now.getFullYear(), now.getMonth(), now.getDate() + d);
    if (!APPT_WORKING_DAYS.includes(day.getDay())) continue;

    for (let h = APPT_BUSINESS_HOURS.startHour; h < APPT_BUSINESS_HOURS.endHour; h += APPT_SLOT_STEP_HOURS) {
      if (d === 0 && h <= now.getHours()) continue; // lewati jam yang sudah lewat hari ini
      const dateStr = `${day.getFullYear()}-${apptPad(day.getMonth() + 1)}-${apptPad(day.getDate())}`;
      const timeStr = `${apptPad(h)}.00`;
      if (apptIsSlotTaken(dateStr, timeStr)) continue;
      slots.push({ date: dateStr, time: timeStr });
      if (slots.length >= limit) break;
    }
  }
  return slots;
}

function apptFormatSlotLabel(slot) {
  const d = new Date(slot.date + 'T00:00:00');
  const dayName = d.toLocaleDateString('id-ID', { weekday: 'long' });
  const dateLabel = d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long' });
  return `${dayName}, ${dateLabel} jam ${slot.time} WIB`;
}

// ── KLASIFIKASI NIAT PENJADWALAN VIA OLLAMA ───────────────────────
// Dipanggil untuk SETIAP pesan masuk (sebelum balasan bebas) supaya AI bisa
// mendeteksi: (1) apakah customer ingin membuat janji temu, dan (2) kalau
// sebelumnya AI sudah menawarkan slot, apakah pesan ini adalah pilihan
// customer atas salah satu slot tsb.
function buildSchedulingIntentPrompt(conv, incomingText, offeredSlots) {
  const roleLabel = { in: 'Customer', ai: 'AI', human: 'Agent' };
  const historyText = conv.messages
    .slice(-6)
    .map((m) => `${roleLabel[m.dir === 'in' ? 'in' : m.from]}: ${m.text}`)
    .join('\n');
  const slotListText = offeredSlots.length
    ? offeredSlots.map((s, i) => `${i + 1}. ${apptFormatSlotLabel(s)}`).join('\n')
    : '(belum ada slot yang ditawarkan sebelumnya)';

  return `Kamu adalah sistem klasifikasi niat (intent classifier) untuk chat sales B2B Indonesia.
Analisa pesan customer di bawah ini dan balas HANYA dengan JSON valid, tanpa markdown fence, tanpa teks lain di luar JSON.

${historyText ? `Riwayat percakapan terakhir:\n${historyText}\n\n` : ''}Pesan baru dari customer: "${incomingText}"

Slot jadwal yang SUDAH ditawarkan AI ke customer sebelumnya (kalau ada):
${slotListText}

Tentukan:
1. "wants_schedule": true jika customer terlihat ingin menjadwalkan/mengatur pertemuan, demo, konsultasi, atau meeting (baik diminta eksplisit maupun tersirat, mis. "boleh dijadwalkan demo?", "kapan bisa ketemu tim-nya?", "mau konsultasi kak"). false kalau bukan soal jadwal.
2. "picks_slot_index": HANYA isi kalau daftar slot di atas TIDAK kosong DAN pesan customer terlihat memilih salah satu slot tsb (lewat nomor, hari, atau jam yang disebut). Isi dengan nomor urut slot (1, 2, dst sesuai daftar). Kalau tidak relevan, isi null.
3. "meeting_type_guess": salah satu dari "demo", "konsultasi", "negosiasi", "onboarding", "lainnya" — tebakan jenis pertemuan dari konteks percakapan. Default "konsultasi" kalau tidak jelas.

Balas HANYA dengan JSON persis format ini (tanpa teks tambahan apapun):
{"wants_schedule": true|false, "picks_slot_index": null|1|2|3, "meeting_type_guess": "..."}`;
}

async function classifySchedulingIntent(conv, incomingText, offeredSlots) {
  const prompt = buildSchedulingIntentPrompt(conv, incomingText, offeredSlots);
  try {
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.1 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    const parsed = JSON.parse(extractJson((data.response || '').trim()));
    const idx = Number(parsed.picks_slot_index);
    return {
      wantsSchedule: !!parsed.wants_schedule,
      picksSlotIndex: Number.isInteger(idx) && idx > 0 ? idx : null,
      meetingTypeGuess: APPT_TYPE_LABELS[parsed.meeting_type_guess] ? parsed.meeting_type_guess : 'konsultasi',
    };
  } catch (err) {
    console.error('[Scheduling] Gagal klasifikasi intent, lewati penawaran jadwal:', err.message);
    return { wantsSchedule: false, picksSlotIndex: null, meetingTypeGuess: 'konsultasi' };
  }
}

// Buat appointment baru di aiAppointments begitu customer memilih slot.
// Statusnya "menunggu" — appointment baru dianggap resmi setelah admin
// klik "Konfirmasi & Follow-up" di halaman Appointment (lihat endpoint
// POST /api/appointments/:id/confirm di bawah).
function apptCreateFromChat(conv, slot, meetingType) {
  const typeLabel = apptTypeLabel(meetingType);
  const record = {
    id: `ai-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    nama: conv.name,
    company: conv.username ? '@' + conv.username : '-',
    phone: conv.username ? '@' + conv.username : `Telegram ${conv.chatId}`,
    email: '',
    date: slot.date,
    time: slot.time,
    duration: APPT_DEFAULT_DURATION,
    type: meetingType,
    typeLabel,
    sales: APPT_DEFAULT_STAFF,
    status: 'menunggu',
    createdBy: 'ai',
    location: '',
    notes: `Dibuat otomatis dari percakapan Telegram (chat ID ${conv.chatId}).`,
    aiNote: 'Appointment ini dijadwalkan otomatis oleh AI berdasarkan pilihan slot customer lewat chat Telegram. Mohon konfirmasi, lengkapi lokasi/link meeting, lalu kirim follow-up.',
    chatId: conv.chatId,
    leadId: null,
    timeline: [
      { type: 'ai', event: 'AI menawarkan slot jadwal', sub: `Menawarkan ${conv.scheduling.offeredSlots.length} slot kosong via Telegram`, time: 'Baru saja' },
      { type: 'success', event: 'Customer memilih slot', sub: apptFormatSlotLabel(slot), time: 'Baru saja' },
      { type: 'ai', event: 'AI membuat appointment otomatis', sub: `Menunggu konfirmasi admin — PIC sementara: ${APPT_DEFAULT_STAFF}`, time: 'Baru saja' },
    ],
  };
  aiAppointments.push(record);
  return record;
}

// Handler utama pesan masuk saat conv.handledBy === 'ai'. Urutan prioritas:
//  1) Kalau AI baru saja menawarkan slot & customer memilih salah satunya
//     → buat appointment, balas konfirmasi.
//  2) Kalau customer terlihat ingin jadwal & belum ada tawaran aktif
//     → cari slot kosong, tawarkan lewat chat.
//  3) Selain itu → balasan bebas seperti sebelumnya (tgGenerateReplyWithOllama).
async function tgHandleMessageAndMaybeSchedule(conv, incomingText) {
  const intent = await classifySchedulingIntent(conv, incomingText, conv.scheduling.offeredSlots);

  if (conv.scheduling.stage === 'offered' && intent.picksSlotIndex) {
    const chosen = conv.scheduling.offeredSlots[intent.picksSlotIndex - 1];
    if (chosen) {
      apptCreateFromChat(conv, chosen, conv.scheduling.meetingType || intent.meetingTypeGuess);
      const firstName = (conv.name || '').split(' ')[0] || '';
      conv.scheduling = { stage: 'idle', offeredSlots: [], meetingType: null };
      return `Baik${firstName ? ' ' + firstName : ''}, jadwal Anda sudah kami catat untuk ${apptFormatSlotLabel(chosen)}. Tim kami akan segera mengonfirmasi dan menghubungi Anda kembali. Terima kasih! 🙏`;
    }
  }

  if (intent.wantsSchedule && conv.scheduling.stage !== 'offered') {
    const slots = apptGetAvailableSlots(3);
    if (slots.length) {
      const listText = slots.map((s, i) => `${i + 1}. ${apptFormatSlotLabel(s)}`).join('\n');
      conv.scheduling = { stage: 'offered', offeredSlots: slots, meetingType: intent.meetingTypeGuess };
      return `Tentu! Berikut beberapa slot yang masih kosong untuk ${apptTypeLabel(intent.meetingTypeGuess)}:\n\n${listText}\n\nSilakan balas dengan nomor atau sebutkan jadwal yang Anda pilih ya.`;
    }
  }

  return tgGenerateReplyWithOllama(conv, incomingText);
}

// =============================================================
// 2f) AI MULAI CHAT DULUAN — OUTREACH KE LEADS (BARU)
//     Dipicu dari halaman Kontak/Leads (tombol "Mulai Chat AI"). Untuk tiap
//     lead, AI mencocokkan nomor HP-nya (kolom "lp-contact-phone", asalnya
//     dari spreadsheet) dengan percakapan Telegram yang SUDAH ADA.
//
//     KETERBATASAN PENTING (bukan bug, tapi aturan platform Telegram):
//     Bot API TIDAK BISA memulai chat ke sembarang nomor HP — bot hanya
//     boleh mengirim pesan ke user yang sudah pernah mulai chat dengan bot
//     ini sebelumnya (dan idealnya sudah share kontak, supaya nomornya
//     tercatat — lihat tgProcessMessage di atas). Jadi fitur ini pada
//     dasarnya adalah "AI menyapa duluan begitu nomornya dikenali",
//     BUKAN "AI bisa mengirim pesan pertama ke nomor manapun di spreadsheet".
//     Kalau nomor tidak ditemukan di percakapan manapun, lead ditandai
//     status "Nomor Tidak ditemukan" supaya sales tahu harus follow-up
//     manual (WA/telepon) untuk kontak tsb.
// =============================================================
const COMPANY_INTRO = {
  botName: process.env.BOT_NAME || 'IDT AI',
  companyName: process.env.COMPANY_NAME || 'Indotrading',
};

function tgFindConversationByPhone(phone) {
  const target = tgNormalizePhone(phone);
  if (!target) return null;
  for (const conv of tgConversations.values()) {
    if (conv.phone && conv.phone === target) return conv;
  }
  return null;
}

// ── GENERATE VARIABEL TEMPLATE INTRO WABA VIA OLLAMA ─────────────────────────
// Template WhatsApp (mis. 'followup_intro') strukturnya FIXED & sudah
// di-approve Meta — yang bisa dinamis cuma isi variabel {{1}}, {{2}}, dst.
// Fungsi ini memakai Ollama untuk mengarang FRASA PENDEK (bukan kalimat utuh)
// yang mengisi {{2}} — jadi pesan pembuka tetap personalized & natural,
// bukan cuma nama perusahaan mentah dari spreadsheet.
function buildWabaIntroVariablePrompt(lead) {
  const sumberLabel = {
    wa: 'menghubungi langsung via WhatsApp/telepon',
    msg: 'mengirim pesan ke bisnis',
    profil: 'mengunjungi halaman profil/website',
  }[lead.sumber] || 'berinteraksi dengan bisnis kita';

  return `Kamu adalah asisten sales yang ramah untuk bisnis B2B Indonesia.

Tentang bisnis kami (jangan mengarang produk/layanan di luar ini):
${COMPANY_DESC}

Tugasmu: tulis SATU frasa pendek (maksimal 8 kata, tanpa tanda baca akhir) yang akan
disisipkan ke dalam kalimat template WhatsApp berikut, menggantikan [FRASA]:
"Saya menghubungi Anda terkait kebutuhan [FRASA] — ada yang bisa kami bantu terkait produk/layanan kami?"

Data lead:
- Nama: ${lead.nama}
- Perusahaan: ${lead.perusahaan || '-'}
- Kota: ${lead.kota || '-'}
- Aktivitas terakhir: ${sumberLabel}
- Skor AI: ${lead.aiScore || 'WARM'}

Aturan:
- Output HANYA frasa pendeknya saja, contoh: "peluang menjadi supplier di Indotrading" atau "kebutuhan pengadaan produk industri lewat RFQ kami"
- JANGAN pakai newline, markdown, tanda kutip, atau titik di akhir.
- Maksimal 8 kata.`;
}

async function generateWabaIntroVariable(lead) {
  const fallback = lead.perusahaan ? `kebutuhan ${lead.perusahaan}` : 'produk/layanan kami';
  try {
    const prompt = buildWabaIntroVariablePrompt(lead);
    const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        options: { temperature: 0.7 },
      }),
    });
    if (!res.ok) throw new Error(`Ollama error ${res.status}`);
    const data = await res.json();
    const text = (data.response || '')
      .trim()
      .replace(/\n+/g, ' ')
      .replace(/\s{2,}/g, ' ')
      .replace(/["'.]+$/g, '');
    return text || fallback;
  } catch (err) {
    console.error('[WABA] Gagal generate variabel intro via Ollama, pakai fallback:', err.message);
    return fallback;
  }
}

function buildIntroMessage(lead) {
  const perusahaanText = lead.perusahaan ? ` untuk kebutuhan ${lead.perusahaan}` : '';
  return `Halo ${lead.nama}, perkenalkan saya ${COMPANY_INTRO.botName} dari ${COMPANY_INTRO.companyName}. Saya menghubungi Anda${perusahaanText} — ada yang bisa kami bantu terkait produk/layanan kami?`;
}

// Versi buildIntroMessage yang variabel keduanya sudah hasil Ollama (dipakai
// khusus untuk WABA supaya histori Percakapan mencerminkan teks yang BENAR-BENAR
// terkirim lewat template, bukan cuma nama perusahaan mentah).
function buildIntroMessageWithVariable(lead, introVariable) {
  return `Halo ${lead.nama}, perkenalkan saya ${COMPANY_INTRO.botName} dari ${COMPANY_INTRO.companyName}. Saya menghubungi Anda terkait ${introVariable} — ada yang bisa kami bantu terkait produk/layanan kami?`;
}

async function tgStartChatWithLead(lead) {
  const conv = tgFindConversationByPhone(lead.phone);
  if (!conv) return { ok: false, reason: 'not_found' };
  if (conv.introSent) return { ok: false, reason: 'already_started', chatId: conv.chatId };

  const introText = buildIntroMessage(lead);
  await sendViaTelegram(conv.chatId, introText);

  const outMsg = { id: conv.messages.length + 1, dir: 'out', from: 'ai', text: introText, time: Date.now() };
  conv.messages.push(outMsg);
  conv.lastMessageText = introText;
  conv.lastMessageTime = outMsg.time;
  conv.handledBy = 'ai';
  conv.introSent = true;

  return { ok: true, chatId: conv.chatId, message: introText };
}

// =============================================================
// 2g) PERCAKAPAN WHATSAPP (WABA) — DIPROSES DARI WEBHOOK
//     Beda dengan Telegram (polling getUpdates), WABA memakai webhook: Meta
//     yang mendorong notifikasi ke server kita tiap ada pesan masuk (lihat
//     POST /api/waba/webhook di bawah). Begitu customer SUDAH membalas
//     (artinya "customer service window" 24 jam terbuka di sisi WhatsApp),
//     AI bebas membalas dengan teks bebas hasil Ollama tanpa perlu template
//     lagi — beda dengan pesan PEMBUKA yang wajib pakai template (lihat
//     wabaStartChatWithLead di atas).
// =============================================================
function wabaGetOrCreateConversation(waId, profileName) {
  let conv = wabaConversations.get(waId);
  if (!conv) {
    conv = {
      chatId: waId,
      name: profileName || waId,
      phone: waId,
      handledBy: 'ai',
      introSent: true, // pesan masuk duluan dari customer = window sudah terbuka
      messages: [],
      lastMessageText: '',
      lastMessageTime: Date.now(),
      unread: 0,
      provider: 'whatsapp',
      scheduling: { stage: 'idle', offeredSlots: [], meetingType: null },
    };
    wabaConversations.set(waId, conv);
  }
  // Percakapan lama (dibuat oleh wabaStartChatWithLead sebelum fitur ini ada)
  // mungkin belum punya field scheduling — lengkapi supaya tidak error.
  if (!conv.scheduling) conv.scheduling = { stage: 'idle', offeredSlots: [], meetingType: null };
  if (profileName && conv.name === waId) conv.name = profileName;
  return conv;
}

async function wabaProcessIncomingMessage(message, contactProfile) {
  if (!message.text || !message.text.body) return; // lewati dulu pesan non-teks (gambar, stiker, dll)

  const waId = message.from;
  const conv = wabaGetOrCreateConversation(waId, contactProfile && contactProfile.name);

  const incomingTime = message.timestamp ? Number(message.timestamp) * 1000 : Date.now();
  const incomingMsg = {
    id: conv.messages.length + 1,
    dir: 'in',
    from: 'user',
    text: message.text.body,
    time: incomingTime,
  };
  conv.messages.push(incomingMsg);
  conv.lastMessageText = message.text.body;
  conv.lastMessageTime = incomingTime;
  conv.unread += 1;

  if (conv.handledBy !== 'ai') return; // mode manual — admin yang membalas, AI diam

  try {
    // Reuse logic penjadwalan & generate balasan yang sama dengan Telegram —
    // fungsinya generic terhadap bentuk objek `conv` (name/messages/scheduling),
    // jadi aman dipakai lintas channel tanpa duplikasi logic.
    const replyText = await tgHandleMessageAndMaybeSchedule(conv, message.text.body);
    if (replyText) {
      await sendViaWaba(conv.chatId, replyText);
      const outMsg = { id: conv.messages.length + 1, dir: 'out', from: 'ai', text: replyText, time: Date.now() };
      conv.messages.push(outMsg);
      conv.lastMessageText = replyText;
      conv.lastMessageTime = outMsg.time;
    }
  } catch (err) {
    console.error('[WABA] Gagal auto-reply AI:', err.message);
  }
}

// ── Mulai chat via WABA (WhatsApp Cloud API) ─────────────────────────────────
// Berbeda dengan Telegram, WABA bisa kirim pesan pertama ke nomor baru
// SELAMA nomor tujuan pernah chat dengan nomor WA bisnis (atau pakai template
// yang disetujui Meta). Untuk test number, kirim ke nomor yang sudah didaftarkan.
async function wabaStartChatWithLead(lead) {
  if (!WABA_ACCESS_TOKEN || !WABA_PHONE_NUMBER_ID) {
    return { ok: false, reason: 'waba_not_configured' };
  }

  // Format nomor: hilangkan karakter non-digit, pastikan dimulai dengan kode negara
  const rawPhone = String(lead.phone || '').replace(/\D/g, '');
  if (!rawPhone) return { ok: false, reason: 'no_phone' };

  // Tambah prefix 62 (Indonesia) kalau belum ada kode negara
  const to = rawPhone.startsWith('62')
    ? rawPhone
    : rawPhone.startsWith('0')
      ? '62' + rawPhone.slice(1)
      : '62' + rawPhone;

  // Ollama mengarang frasa pendek untuk mengisi {{2}} — supaya alasan
  // menghubungi lead ini terasa personal, bukan cuma nama perusahaan mentah.
  const introVariable = await generateWabaIntroVariable(lead);
  const introText = buildIntroMessageWithVariable(lead, introVariable);

  // Template "followup_intro" (kategori Utility, bahasa Indonesian) punya 2
  // variabel di body: {{1}} = nama lead, {{2}} = frasa kebutuhan hasil Ollama.
  // Body template di WhatsApp Manager HARUS PERSIS:
  // "Halo {{1}}, perkenalkan saya Qabil Bot dari Indotrading. Saya menghubungi
  //  Anda terkait {{2}} — ada yang bisa kami bantu terkait produk/layanan kami?"
  // Kalau body template diedit, urutan/isi components di bawah ini harus ikut disesuaikan.
  const introComponents = [{
    type: 'body',
    parameters: [
      { type: 'text', text: lead.nama || 'Bapak/Ibu' },
      { type: 'text', text: introVariable },
    ],
  }];

  try {
    // PENTING: kontak pertama WAJIB pakai template (lihat sendViaWabaTemplate).
    // 'followup_intro' adalah template custom yang sudah di-approve Meta dengan
    // variabel {{1}}/{{2}}, jadi pesan yang terkirim sekarang beneran personalized
    // (bukan lagi teks fixed seperti 'hello_test').
    // Kode bahasa HARUS PERSIS sama dengan yang terdaftar di WhatsApp Manager >
    // Message Templates > kolom "Select language" untuk template ini.
    // Dikonfirmasi: template ini bahasa "English" → kodenya 'en'.
    // Kalau kelak dibuat ulang dalam Bahasa Indonesia, ganti ke 'id'.
    const result = await sendViaWabaTemplate(to, 'followup_intro', 'en', introComponents);

    // Simpan ke wabaConversations supaya muncul di halaman Percakapan
    const convKey = to;
    let conv = wabaConversations.get(convKey);
    if (!conv) {
      conv = {
        chatId: to,
        name: lead.nama,
        phone: to,
        handledBy: 'ai',
        introSent: false,
        messages: [],
        lastMessageText: '',
        lastMessageTime: Date.now(),
        unread: 0,
        provider: 'whatsapp',
      };
      wabaConversations.set(convKey, conv);
    }

    // Sekarang template 'followup_intro' sudah pakai variabel {{1}}/{{2}} yang
    // diisi dari data lead, jadi teks yang benar-benar terkirim ke WhatsApp
    // sudah sama persis (atau sangat mendekati) dengan introText di atas —
    // aman disimpan langsung ke histori Percakapan.
    const sentText = introText;
    const outMsg = { id: conv.messages.length + 1, dir: 'out', from: 'ai', text: sentText, time: Date.now() };
    conv.messages.push(outMsg);
    conv.lastMessageText = sentText;
    conv.lastMessageTime = outMsg.time;
    conv.handledBy = 'ai';
    conv.introSent = true;

    console.log(`[WABA] Pesan intro terkirim ke ${lead.nama} (${to})`);
    return { ok: true, chatId: to, message: introText, provider: 'whatsapp' };
  } catch (err) {
    console.error(`[WABA] Gagal kirim intro ke ${lead.nama} (${to}):`, err.message);
    return { ok: false, reason: 'send_error', error: err.message };
  }
}

// Dipanggil dari halaman Kontak/Leads. Menerima daftar lead (id, nama,
// perusahaan, phone) dan mencoba memulai chat AI untuk masing-masing.
app.post('/api/leads/start-chat', async (req, res) => {
  try {
    const { leads, provider: requestedProvider } = req.body;
    if (!Array.isArray(leads)) {
      return res.status(400).json({ ok: false, error: 'leads harus berupa array' });
    }

    // ── Tentukan provider aktif ──────────────────────────────────────────────
    // Prioritas: WABA (lebih andal karena bisa kirim ke nomor baru)
    // Fallback: Telegram (hanya bisa ke user yang sudah pernah chat ke bot)
    const wabaReady = !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID);
    const tgReady   = !!TELEGRAM_BOT_TOKEN;

    let activeProvider;
    if (requestedProvider === 'whatsapp' && wabaReady) {
      activeProvider = 'whatsapp';
    } else if (requestedProvider === 'telegram' && tgReady) {
      activeProvider = 'telegram';
    } else if (wabaReady) {
      activeProvider = 'whatsapp'; // default ke WABA kalau tersedia
    } else if (tgReady) {
      activeProvider = 'telegram';
    } else {
      return res.status(400).json({
        ok: false,
        error: 'Tidak ada provider chat yang aktif. Hubungkan WhatsApp Business API atau Telegram Bot di halaman Integrasi.',
      });
    }

    console.log(`[Leads Start Chat] Provider: ${activeProvider}, ${leads.length} lead`);

    const results = [];
    for (const lead of leads) {
      if (!lead || !lead.id || !lead.phone) {
        results.push({ id: lead && lead.id, ok: false, reason: 'no_phone' });
        continue;
      }
      try {
        let r;
        if (activeProvider === 'whatsapp') {
          r = await wabaStartChatWithLead(lead);
        } else {
          r = await tgStartChatWithLead(lead);
        }
        results.push({ id: lead.id, provider: activeProvider, ...r });
      } catch (err) {
        console.error(`[Leads] Gagal mulai chat utk lead ${lead.id}:`, err.message);
        results.push({ id: lead.id, ok: false, reason: 'error', error: err.message });
      }
    }

    res.json({ ok: true, provider: activeProvider, results });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================
// 2c) ENDPOINT: PERCAKAPAN TELEGRAM
// =============================================================

// List ringkasan semua percakapan, terbaru dulu
app.get('/api/telegram/conversations', (req, res) => {
  const list = Array.from(tgConversations.values())
    .map((c) => ({
      chatId: c.chatId,
      name: c.name,
      username: c.username,
      handledBy: c.handledBy,
      lastMessageText: c.lastMessageText,
      lastMessageTime: c.lastMessageTime,
      unread: c.unread,
      msgCount: c.messages.length,
    }))
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  res.json({ ok: true, conversations: list, botConfigured: !!TELEGRAM_BOT_TOKEN, polling: tgPollingActive });
});

// Detail 1 percakapan (sekaligus tandai sudah dibaca)
app.get('/api/telegram/conversations/:chatId', (req, res) => {
  const conv = tgConversations.get(req.params.chatId);
  if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });
  conv.unread = 0;
  res.json({ ok: true, conversation: conv });
});

// Kirim balasan manual (dari agent/human) — otomatis mengambil alih dari AI
app.post('/api/telegram/conversations/:chatId/send', async (req, res) => {
  try {
    const conv = tgConversations.get(req.params.chatId);
    if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });

    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'Pesan tidak boleh kosong' });

    await sendViaTelegram(conv.chatId, text);

    const msg = { id: conv.messages.length + 1, dir: 'out', from: 'human', text, time: Date.now() };
    conv.messages.push(msg);
    conv.lastMessageText = text;
    conv.lastMessageTime = msg.time;
    conv.handledBy = 'human'; // mengetik balasan manual = ambil alih dari AI

    res.json({ ok: true, message: msg, conversation: conv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Ambil alih / kembalikan ke AI
app.post('/api/telegram/conversations/:chatId/takeover', (req, res) => {
  const conv = tgConversations.get(req.params.chatId);
  if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });

  const { handledBy } = req.body;
  if (!['ai', 'human'].includes(handledBy)) {
    return res.status(400).json({ ok: false, error: 'handledBy harus "ai" atau "human"' });
  }
  conv.handledBy = handledBy;
  res.json({ ok: true, conversation: conv });
});

// Status koneksi bot (dipakai untuk indikator di UI)
app.get('/api/telegram/status', async (req, res) => {
  res.json({
    ok: true,
    configured: !!TELEGRAM_BOT_TOKEN,
    polling: tgPollingActive,
    bot: tgBotInfo,
  });
});

// =============================================================
// 2d) KONFIGURASI TOKEN TELEGRAM — diatur dari halaman Integrasi
//     (script_page/integrasi.js + telegram-token.js), BUKAN dari .env lagi.
// =============================================================

// Cek konfigurasi saat ini (token tidak pernah dikirim balik utuh, hanya preview).
app.get('/api/telegram/config', (req, res) => {
  res.json({
    ok: true,
    configured: !!TELEGRAM_BOT_TOKEN,
    tokenPreview: TELEGRAM_BOT_TOKEN
      ? `${TELEGRAM_BOT_TOKEN.slice(0, 6)}••••${TELEGRAM_BOT_TOKEN.slice(-4)}`
      : '',
    chatId: TELEGRAM_DEFAULT_CHAT_ID,
    polling: tgPollingActive,
    bot: tgBotInfo,
  });
});

// Pasang / ganti token Telegram Bot secara runtime. Dipanggil oleh halaman
// Integrasi saat user klik "Simpan Token" pada modal konfigurasi Telegram.
app.post('/api/telegram/config', async (req, res) => {
  try {
    const newToken = String(req.body.token || '').trim();
    const newChatId = String(req.body.chatId || '').trim();

    if (!newToken) {
      return res.status(400).json({ ok: false, error: 'Token tidak boleh kosong' });
    }

    // Validasi token ke Telegram dulu sebelum dipakai menggantikan token lama.
    const testRes = await fetch(`https://api.telegram.org/bot${newToken}/getMe`);
    const testData = await testRes.json();
    if (!testData.ok) {
      return res.status(400).json({ ok: false, error: testData.description || 'Token tidak valid' });
    }

    TELEGRAM_BOT_TOKEN = newToken;
    TELEGRAM_DEFAULT_CHAT_ID = newChatId;
    tgBotInfo = testData.result;

    // Restart polling dengan token baru (loop lama otomatis berhenti via epoch guard).
    stopTelegramPolling();
    startTelegramPolling();

    res.json({ ok: true, bot: tgBotInfo });
  } catch (err) {
    console.error('[Telegram] Gagal menyimpan konfigurasi:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Hapus token Telegram Bot (saat user klik "Putuskan Koneksi" / "Hapus Token").
app.delete('/api/telegram/config', (req, res) => {
  TELEGRAM_BOT_TOKEN = '';
  TELEGRAM_DEFAULT_CHAT_ID = '';
  tgBotInfo = null;
  stopTelegramPolling();
  res.json({ ok: true });
});

// =============================================================
// 2f) KONFIGURASI WHATSAPP BUSINESS API (WABA) — diatur dari halaman
//     Integrasi (script_page/integrasi.js + waba-token.js), BUKAN dari .env.
//     Sejajar dengan blok konfigurasi Telegram (2d) di atas.
// =============================================================

// Cek konfigurasi saat ini (access token tidak pernah dikirim balik utuh, hanya preview).
app.get('/api/waba/config', (req, res) => {
  res.json({
    ok: true,
    configured: !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID),
    tokenPreview: WABA_ACCESS_TOKEN
      ? `${WABA_ACCESS_TOKEN.slice(0, 6)}••••${WABA_ACCESS_TOKEN.slice(-4)}`
      : '',
    phoneNumberId: WABA_PHONE_NUMBER_ID,
    businessAccountId: WABA_BUSINESS_ACCOUNT_ID,
    bot: wabaBotInfo,
  });
});

// Pasang / ganti kredensial WABA secara runtime. Dipanggil oleh halaman
// Integrasi saat user klik "Simpan" pada modal konfigurasi WhatsApp.
app.post('/api/waba/config', async (req, res) => {
  try {
    const token = String(req.body.token || '').trim();
    const phoneNumberId = String(req.body.phoneNumberId || '').trim();
    const businessAccountId = String(req.body.businessAccountId || '').trim();
    const verifyToken = String(req.body.verifyToken || '').trim();

    console.log(`[WABA] POST /api/waba/config diterima — verifyToken: "${verifyToken}"`);

    if (!token) {
      return res.status(400).json({ ok: false, error: 'Access Token tidak boleh kosong' });
    }
    if (!phoneNumberId) {
      return res.status(400).json({ ok: false, error: 'Phone Number ID tidak boleh kosong' });
    }

    // Validasi kredensial ke Meta Graph API dulu sebelum menggantikan yang lama.
    const testUrl = `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=display_phone_number,verified_name`;
    const testRes = await fetch(testUrl, { headers: { Authorization: `Bearer ${token}` } });
    const testData = await testRes.json();
    if (testData.error) {
      return res.status(400).json({ ok: false, error: testData.error.message || 'Kredensial tidak valid' });
    }

    WABA_ACCESS_TOKEN = token;
    WABA_PHONE_NUMBER_ID = phoneNumberId;
    WABA_BUSINESS_ACCOUNT_ID = businessAccountId;
    if (verifyToken) WABA_VERIFY_TOKEN = verifyToken;
    console.log(`[WABA] WABA_VERIFY_TOKEN sekarang di memori: "${WABA_VERIFY_TOKEN}"`);
    wabaBotInfo = {
      verified_name: testData.verified_name,
      display_phone_number: testData.display_phone_number,
    };

    res.json({ ok: true, bot: wabaBotInfo });
  } catch (err) {
    console.error('[WABA] Gagal menyimpan konfigurasi:', err.message);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Hapus kredensial WABA (saat user klik "Putuskan Koneksi" / "Hapus Kredensial").
app.delete('/api/waba/config', (req, res) => {
  WABA_ACCESS_TOKEN = '';
  WABA_PHONE_NUMBER_ID = '';
  WABA_BUSINESS_ACCOUNT_ID = '';
  wabaBotInfo = null;
  res.json({ ok: true });
});

// ── Endpoint: provider chat aktif (dipakai tombol "Mulai Chat AI" di Leads) ──
// Mengembalikan provider yang akan dipakai beserta statusnya, sehingga
// frontend bisa tampilkan label & ikon yang benar tanpa hardcode.
// =============================================================
// KNOWLEDGE BASE — endpoint dipakai halaman "Knowledge Base"
// (script_page/knowledge-base.js). Semua dokumen berstatus "aktif" di sini
// otomatis disisipkan ke prompt Ollama lewat kbActiveContext() di atas —
// jadi begitu dokumen disimpan, AI langsung "tahu" tanpa langkah tambahan.
// =============================================================
app.get('/api/knowledge-base', (req, res) => {
  res.json({ ok: true, docs: knowledgeBase.map(kbPublicDoc) });
});

app.get('/api/knowledge-base/:id', (req, res) => {
  const doc = kbFind(req.params.id);
  if (!doc) return res.status(404).json({ ok: false, error: 'Dokumen tidak ditemukan' });
  res.json({ ok: true, doc: { ...kbPublicDoc(doc), content: doc.content || '' } });
});

// Upload file (pdf/docx/xlsx/txt/csv) — bisa multiple sekaligus.
app.post('/api/knowledge-base/upload', (req, res) => {
  kbUpload.array('files', 10)(req, res, async (err) => {
    if (err) return res.status(400).json({ ok: false, error: err.message });
    const files = req.files || [];
    if (!files.length) return res.status(400).json({ ok: false, error: 'Tidak ada file yang diunggah' });

    const category = (req.body.category || '').trim() || 'umum';
    const created = [];
    for (const file of files) {
      const ext = path.extname(file.originalname).slice(1).toLowerCase();
      const text = await kbExtractFileText(file.path, ext);
      const doc = {
        id: kbNextId(),
        title: file.originalname.replace(/\.[^.]+$/, ''),
        category,
        status: 'aktif',
        sourceType: 'file',
        fileName: file.originalname,
        fileExt: ext,
        storedPath: file.path,
        sizeBytes: file.size,
        content: kbTrimContent(text),
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };
      knowledgeBase.push(doc);
      created.push(doc);
    }
    kbSave();
    res.json({ ok: true, docs: created.map(kbPublicDoc) });
  });
});

// Tambah dokumen dari URL/website (crawl sederhana, satu halaman).
app.post('/api/knowledge-base/url', async (req, res) => {
  const { url, category, autoSync } = req.body || {};
  if (!url) return res.status(400).json({ ok: false, error: 'URL kosong' });
  try {
    const r = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0 IndotradingKB/1.0' } });
    if (!r.ok) throw new Error(`Gagal mengambil URL (status ${r.status})`);
    const html = await r.text();
    const text = kbStripHtml(html);
    const titleMatch = html.match(/<title[^>]*>([^<]*)<\/title>/i);
    const doc = {
      id: kbNextId(),
      title: (titleMatch && titleMatch[1].trim()) || url,
      category: (category || '').trim() || 'umum',
      status: 'aktif',
      sourceType: 'url',
      url,
      autoSync: !!autoSync,
      content: kbTrimContent(text),
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    if (!doc.content) throw new Error('Tidak ada teks yang bisa diambil dari halaman ini');
    knowledgeBase.push(doc);
    kbSave();
    res.json({ ok: true, doc: kbPublicDoc(doc) });
  } catch (e) {
    res.status(500).json({ ok: false, error: e.message });
  }
});

// Tambah dokumen dari teks yang diketik langsung.
app.post('/api/knowledge-base/text', (req, res) => {
  const { title, content, category } = req.body || {};
  if (!title || !title.trim())  return res.status(400).json({ ok: false, error: 'Judul dokumen wajib diisi' });
  if (!content || !content.trim()) return res.status(400).json({ ok: false, error: 'Konten dokumen wajib diisi' });
  const doc = {
    id: kbNextId(),
    title: title.trim(),
    category: (category || '').trim() || 'umum',
    status: 'aktif',
    sourceType: 'teks',
    content: kbTrimContent(content),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  knowledgeBase.push(doc);
  kbSave();
  res.json({ ok: true, doc: kbPublicDoc(doc) });
});

// Edit dokumen yang sudah ada (judul/kategori/konten teksnya).
app.put('/api/knowledge-base/:id', (req, res) => {
  const doc = kbFind(req.params.id);
  if (!doc) return res.status(404).json({ ok: false, error: 'Dokumen tidak ditemukan' });
  const { title, content, category } = req.body || {};
  if (title !== undefined) doc.title = String(title).trim() || doc.title;
  if (category !== undefined) doc.category = String(category).trim() || 'umum';
  if (content !== undefined) doc.content = kbTrimContent(content);
  doc.updatedAt = Date.now();
  kbSave();
  res.json({ ok: true, doc: kbPublicDoc(doc) });
});

// Aktifkan / nonaktifkan dokumen (dokumen nonaktif TIDAK ikut disisipkan ke prompt AI).
app.patch('/api/knowledge-base/:id/status', (req, res) => {
  const doc = kbFind(req.params.id);
  if (!doc) return res.status(404).json({ ok: false, error: 'Dokumen tidak ditemukan' });
  const { status } = req.body || {};
  if (!['aktif', 'nonaktif', 'draft'].includes(status)) {
    return res.status(400).json({ ok: false, error: 'Status tidak valid' });
  }
  doc.status = status;
  doc.updatedAt = Date.now();
  kbSave();
  res.json({ ok: true, doc: kbPublicDoc(doc) });
});

app.delete('/api/knowledge-base/:id', (req, res) => {
  const idx = knowledgeBase.findIndex((d) => d.id === Number(req.params.id));
  if (idx === -1) return res.status(404).json({ ok: false, error: 'Dokumen tidak ditemukan' });
  const [removed] = knowledgeBase.splice(idx, 1);
  if (removed.storedPath) fs.unlink(removed.storedPath, () => {});
  kbSave();
  res.json({ ok: true });
});

app.get('/api/leads/chat-provider', (req, res) => {
  const wabaReady = !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID);
  const tgReady   = !!TELEGRAM_BOT_TOKEN;
  const provider  = wabaReady ? 'whatsapp' : tgReady ? 'telegram' : null;
  res.json({
    ok: true,
    provider,
    whatsapp: { configured: wabaReady, bot: wabaBotInfo },
    telegram: { configured: tgReady,   bot: tgBotInfo   },
  });
});

// Status koneksi (dipakai untuk indikator di UI, sejajar /api/telegram/status).
app.get('/api/waba/status', (req, res) => {
  res.json({
    ok: true,
    configured: !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID),
    bot: wabaBotInfo,
  });
});

// ── DIAGNOSA: DAFTAR MESSAGE TEMPLATE YANG BENAR-BENAR TERDAFTAR ─────────────
// Dipakai untuk debug error 132001 ("Template name does not exist in the
// translation") — error itu SERING BUKAN soal salah kode bahasa, tapi karena:
//  a) Template belum di-submit / masih Draft / masih Pending Review di Meta
//     (baru "Active"/APPROVED yang bisa dipakai lewat API), atau
//  b) Template dibuat di WhatsApp Business Account (WABA) yang BEDA dari
//     WABA_BUSINESS_ACCOUNT_ID yang dikonfigurasi di sini, atau
//  c) Ada typo/spasi tersembunyi di nama template.
// Endpoint ini tanya LANGSUNG ke Meta template apa saja yang terdaftar di
// WABA_BUSINESS_ACCOUNT_ID yang aktif sekarang, lengkap dengan status &
// bahasanya — supaya tidak perlu tebak-tebak dari tampilan UI Meta.
// Cara pakai: buka http://localhost:3001/api/waba/templates di browser
// (atau lewat curl) setelah WABA sudah dikonfigurasi di halaman Integrasi.
app.get('/api/waba/templates', async (req, res) => {
  try {
    if (!WABA_ACCESS_TOKEN || !WABA_BUSINESS_ACCOUNT_ID) {
      return res.status(400).json({
        ok: false,
        error: 'WABA Access Token / WhatsApp Business Account ID belum diisi. Isi keduanya di halaman Integrasi (WhatsApp Business Account ID wajib diisi untuk endpoint ini, walau di form ditandai "opsional").',
      });
    }
    const url = `https://graph.facebook.com/v20.0/${WABA_BUSINESS_ACCOUNT_ID}/message_templates?fields=name,language,status,category&limit=100`;
    const r = await fetch(url, { headers: { Authorization: `Bearer ${WABA_ACCESS_TOKEN}` } });
    const data = await r.json();
    if (data.error) {
      return res.status(400).json({ ok: false, error: data.error.message, detail: data.error });
    }
    res.json({ ok: true, wabaBusinessAccountId: WABA_BUSINESS_ACCOUNT_ID, templates: data.data || [] });
  } catch (err) {
    res.status(500).json({ ok: false, error: err.message });
  }
});

// ── WEBHOOK META (verifikasi + terima pesan masuk) ────────────────
// Didaftarkan di Meta App Dashboard > WhatsApp > Configuration > Webhook,
// pakai URL publik (ngrok/cloudflared/domain production) + Verify Token yang
// sama dengan yang diisi di modal konfigurasi WABA (wb-input-verify).
app.get('/api/waba/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  console.log(`[WABA] Webhook verify — mode: ${mode}, token diterima: "${token}", token di server: "${WABA_VERIFY_TOKEN}"`);

  if (mode === 'subscribe' && token && token === WABA_VERIFY_TOKEN) {
    return res.status(200).send(challenge);
  }
  return res.sendStatus(403);
});

// Menerima notifikasi pesan masuk WhatsApp dari Meta. Membalas 200 SEGERA
// (Meta expects respons cepat, kalau lambat/timeout Meta akan retry webhook
// berulang) — proses pesan (termasuk panggilan Ollama yang bisa makan waktu
// beberapa detik) dilakukan di background setelah response dikirim.
app.post('/api/waba/webhook', (req, res) => {
  res.sendStatus(200);

  try {
    const entry = req.body.entry && req.body.entry[0];
    const change = entry && entry.changes && entry.changes[0];
    const value = change && change.value;
    const messages = value && value.messages;
    const statuses = value && value.statuses;
    const contacts = value && value.contacts;

    // Peta wa_id -> profile (nama tampilan WhatsApp customer), dipakai supaya
    // percakapan baru di halaman Percakapan tidak cuma nampilin nomor mentah.
    const profileByWaId = {};
    if (Array.isArray(contacts)) {
      contacts.forEach((c) => { if (c.wa_id) profileByWaId[c.wa_id] = c.profile || {}; });
    }

    if (Array.isArray(messages)) {
      messages.forEach((m) => {
        const bodyText = (m.text && m.text.body) || `[${m.type}]`;
        console.log('[WABA] Pesan masuk dari', m.from, ':', bodyText);
        wabaProcessIncomingMessage(m, profileByWaId[m.from]).catch((err) => {
          console.error('[WABA] Gagal proses pesan masuk:', err.message);
        });
      });
    }

    // Status pengiriman (sent/delivered/read/failed) untuk pesan yang KITA
    // kirim — ini yang jawab pertanyaan "kenapa tidak sampai".
    if (Array.isArray(statuses)) {
      statuses.forEach((s) => {
        console.log(`[WABA] Status pesan ${s.id} ke ${s.recipient_id}: ${s.status}`);
        if (s.errors) {
          console.log('[WABA] Detail error:', JSON.stringify(s.errors));
        }
      });
    }
  } catch (err) {
    console.error('[WABA] Gagal proses webhook:', err.message);
    // Response 200 sudah terkirim di awal, jadi Meta tidak akan retry.
  }
});

// ── ENDPOINT PERCAKAPAN WABA (dipakai halaman Percakapan) ────────────────────
// Sejajar persis dengan /api/telegram/conversations dkk, supaya halaman
// Percakapan bisa menampilkan & mengelola chat WhatsApp dengan cara yang sama.
app.get('/api/waba/conversations', (req, res) => {
  const list = Array.from(wabaConversations.values())
    .map((c) => ({
      chatId: c.chatId,
      name: c.name,
      phone: c.phone,
      handledBy: c.handledBy,
      lastMessageText: c.lastMessageText,
      lastMessageTime: c.lastMessageTime,
      unread: c.unread,
      msgCount: c.messages.length,
      provider: 'whatsapp',
    }))
    .sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  res.json({ ok: true, conversations: list, botConfigured: !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID) });
});

// Detail 1 percakapan (sekaligus tandai sudah dibaca)
app.get('/api/waba/conversations/:chatId', (req, res) => {
  const conv = wabaConversations.get(req.params.chatId);
  if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });
  conv.unread = 0;
  res.json({ ok: true, conversation: conv });
});

// Kirim balasan manual (dari agent/human) — otomatis mengambil alih dari AI.
// Catatan: ini pakai sendViaWaba (freeform), jadi HANYA berhasil kalau window
// 24 jam customer masih terbuka (customer sudah pernah membalas).
app.post('/api/waba/conversations/:chatId/send', async (req, res) => {
  try {
    const conv = wabaConversations.get(req.params.chatId);
    if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });

    const text = (req.body.text || '').trim();
    if (!text) return res.status(400).json({ ok: false, error: 'Pesan tidak boleh kosong' });

    await sendViaWaba(conv.chatId, text);

    const msg = { id: conv.messages.length + 1, dir: 'out', from: 'human', text, time: Date.now() };
    conv.messages.push(msg);
    conv.lastMessageText = text;
    conv.lastMessageTime = msg.time;
    conv.handledBy = 'human'; // mengetik balasan manual = ambil alih dari AI

    res.json({ ok: true, message: msg, conversation: conv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// Ambil alih / kembalikan ke AI
app.post('/api/waba/conversations/:chatId/takeover', (req, res) => {
  const conv = wabaConversations.get(req.params.chatId);
  if (!conv) return res.status(404).json({ ok: false, error: 'Percakapan tidak ditemukan' });

  const { handledBy } = req.body;
  if (!['ai', 'human'].includes(handledBy)) {
    return res.status(400).json({ ok: false, error: 'handledBy harus "ai" atau "human"' });
  }
  conv.handledBy = handledBy;
  res.json({ ok: true, conversation: conv });
});

async function sendMessage({ mode, chatId, message, lead }) {
  const effectiveMode = mode || SEND_MODE;

  if (effectiveMode === 'mock') {
    console.log('[MOCK SEND] ke', lead?.nama, '\n', message);
    return { provider: 'mock', delivered: true };
  }

  if (effectiveMode === 'telegram') {
    const result = await sendViaTelegram(chatId, message);
    return { provider: 'telegram', delivered: true, messageId: result.result?.message_id };
  }

  if (effectiveMode === 'whatsapp') {
    // chatId di sini dipakai sebagai nomor tujuan (format internasional
    // tanpa "+", mis. "6281234567890"), sesuai kebutuhan WhatsApp Cloud API.
    const result = await sendViaWaba(chatId, message);
    return { provider: 'whatsapp', delivered: true, messageId: result.messages?.[0]?.id };
  }

  throw new Error(`SEND_MODE tidak dikenal: ${effectiveMode}`);
}

// =============================================================
// 3) ENDPOINT: GENERATE PESAN SAJA (dipakai modal preview di frontend)
// =============================================================
app.post('/api/followup/generate', async (req, res) => {
  try {
    const { lead } = req.body;
    if (!lead || !lead.nama) {
      return res.status(400).json({ ok: false, error: 'Data lead tidak lengkap' });
    }
    const message = await generateMessageWithOllama(lead);
    res.json({ ok: true, message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================
// 4) ENDPOINT: GENERATE + LANGSUNG KIRIM (tombol "Approve & Kirim")
// =============================================================
app.post('/api/followup/send', async (req, res) => {
  try {
    const { lead, message, chatId, mode } = req.body;
    if (!lead || !lead.nama) {
      return res.status(400).json({ ok: false, error: 'Data lead tidak lengkap' });
    }

    // Kalau frontend sudah punya hasil edit pesan, pakai itu.
    // Kalau tidak, generate baru dari Ollama.
    const finalMessage = message && message.trim() ? message.trim() : await generateMessageWithOllama(lead);

    const result = await sendMessage({ mode, chatId, message: finalMessage, lead });

    const logEntry = {
      id: sendLog.length + 1,
      leadId: lead.id,
      leadNama: lead.nama,
      message: finalMessage,
      provider: result.provider,
      timestamp: new Date().toISOString(),
    };
    sendLog.unshift(logEntry);

    res.json({ ok: true, message: finalMessage, result, logEntry });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================
// 5) ENDPOINT: LIHAT RIWAYAT PENGIRIMAN (untuk debugging/testing)
// =============================================================
app.get('/api/followup/log', (req, res) => {
  res.json({ ok: true, log: sendLog });
});

// =============================================================
// 5b) ENDPOINT: APPOINTMENT AI FOLLOW-UP (BARU)
//     Dipicu otomatis dari halaman Appointment (script_page/appointment.js)
//     setiap kali appointment baru berhasil dibuat. Sengaja dibuat sebagai
//     endpoint TERPISAH dari /api/followup/generate & /send di atas (yang
//     dipakai halaman Kontak/Leads) supaya tidak mengubah perilaku yang
//     sudah ada — prompt-nya khusus konteks appointment (tanggal, jam,
//     jenis pertemuan, dsb), bukan konteks lead biasa.
//
//     Catatan penting: Telegram Bot API TIDAK BISA mengirim pesan pertama
//     ke user yang belum pernah mulai chat dengan bot ("auto chat duluan"
//     ke user baru secara teknis tidak dimungkinkan Telegram). Jadi endpoint
//     ini mencoba mencocokkan appointment dengan percakapan Telegram yang
//     SUDAH ADA (berdasarkan nama) — kalau ketemu, pesan AI langsung
//     dikirim & muncul di halaman Percakapan. Kalau belum ada percakapan
//     yang cocok, pesan tetap di-generate (delivered:false) supaya bisa
//     dikirim manual, misalnya lewat tombol WhatsApp yang sudah ada.
// =============================================================
function buildAppointmentFollowupPrompt({ appointment, lead }) {
  return `Kamu adalah asisten sales AI yang ramah dan profesional untuk bisnis B2B Indonesia.
Tugasmu: tulis SATU pesan chat singkat (maksimal 4 kalimat) dalam Bahasa Indonesia untuk
menindaklanjuti appointment yang baru saja dibuat oleh tim sales. Tujuannya membuka
percakapan, mengonfirmasi jadwal, dan membuat customer merasa diperhatikan.

Tentang bisnis kami (jangan mengarang produk/layanan di luar ini):
${COMPANY_DESC}

Data appointment:
- Nama customer: ${appointment.nama}
- Perusahaan: ${appointment.company || '-'}
- Jenis pertemuan: ${appointment.typeLabel || '-'}
- Tanggal: ${appointment.date || '-'}
- Waktu: ${appointment.time || '-'} WIB
- Penanggung jawab: ${appointment.sales || '-'}
- Lokasi/link: ${appointment.location || '-'}${lead ? `
- Kota: ${lead.kota || '-'}
- Status lead sebelumnya: ${lead.status || '-'}` : ''}

Aturan:
- Sapa pakai nama customer.
- Sebutkan jadwal (tanggal & waktu) secara natural.
- Tutup dengan kalimat ramah yang mengundang balasan (mis. menanyakan kesiapan/pertanyaan).
- JANGAN gunakan markdown, JANGAN beri judul, JANGAN beri penjelasan tambahan.
- Output HANYA isi pesannya saja, siap kirim.`;
}

async function generateAppointmentFollowupMessage({ appointment, lead }) {
  const prompt = buildAppointmentFollowupPrompt({ appointment, lead });

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: OLLAMA_MODEL,
      prompt,
      stream: false,
      options: { temperature: 0.7 },
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  return (data.response || '').trim();
}

// Cari percakapan Telegram yang sudah ada berdasarkan kecocokan nama —
// satu-satunya penghubung yang tersedia saat ini, karena data appointment/
// lead belum menyimpan chatId Telegram secara eksplisit.
function findExistingTelegramConversationByName(name) {
  const target = (name || '').trim().toLowerCase();
  if (!target) return null;
  for (const conv of tgConversations.values()) {
    if ((conv.name || '').trim().toLowerCase() === target) return conv;
  }
  return null;
}

app.post('/api/appointment/followup', async (req, res) => {
  try {
    const { appointment, lead } = req.body;
    if (!appointment || !appointment.nama) {
      return res.status(400).json({ ok: false, error: 'Data appointment tidak lengkap' });
    }

    const message = await generateAppointmentFollowupMessage({ appointment, lead });

    const existingConv = findExistingTelegramConversationByName(appointment.nama);
    if (existingConv && TELEGRAM_BOT_TOKEN) {
      await sendViaTelegram(existingConv.chatId, message);

      const outMsg = { id: existingConv.messages.length + 1, dir: 'out', from: 'ai', text: message, time: Date.now() };
      existingConv.messages.push(outMsg);
      existingConv.lastMessageText = message;
      existingConv.lastMessageTime = outMsg.time;
      existingConv.handledBy = 'ai';

      return res.json({ ok: true, delivered: true, provider: 'telegram', chatId: existingConv.chatId, message });
    }

    // Belum ada percakapan Telegram yang cocok utk kontak ini — pesan tetap
    // disiapkan supaya bisa dikirim manual (mis. via tombol WhatsApp).
    res.json({ ok: true, delivered: false, provider: null, message });
  } catch (err) {
    console.error('[Appointment Follow-up] Gagal:', err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================
// 5c) ENDPOINT: APPOINTMENT HASIL PERCAKAPAN (BARU)
//     Dipoll oleh halaman Appointment (script_page/appointment.js) untuk
//     menggabungkan appointment yang lahir dari chat ke tabel AP_DATA.
// =============================================================
app.get('/api/appointments/ai-created', (req, res) => {
  res.json({ ok: true, appointments: aiAppointments });
});

// Dipanggil saat admin klik tombol "Konfirmasi & Follow-up" di halaman
// Appointment, supaya status appointment ini tersinkron di server juga
// (mencegah status balik ke "menunggu" saat halaman polling berikutnya).
app.post('/api/appointments/:id/confirm', (req, res) => {
  const record = aiAppointments.find((a) => String(a.id) === String(req.params.id));
  if (!record) return res.status(404).json({ ok: false, error: 'Appointment tidak ditemukan' });

  record.status = 'terkonfirmasi';
  record.timeline.push({ type: 'success', event: 'Admin mengonfirmasi appointment', sub: 'Dikonfirmasi lewat halaman Appointment', time: 'Baru saja' });
  res.json({ ok: true, appointment: record });
});

// =============================================================
// 6) GENERATE PIPELINE INSIGHTS VIA OLLAMA
//    Dipakai oleh dashboard Pipeline (script_page/pipeline-ai.js)
//    untuk menganalisis deal & menyarankan tindakan — user yang
//    tetap memutuskan & eksekusi, AI hanya menyiapkan insight.
// =============================================================
function buildPipelinePrompt({ today, stages, deals }) {
  return `Kamu adalah asisten analisis sales pipeline untuk tim B2B Indonesia.
Tugasmu HANYA menganalisis data deal yang diberikan dan menghasilkan insight
yang actionable. Kamu TIDAK membuat keputusan — keputusan dan eksekusi akhir
selalu di tangan sales/PIC yang membaca insight ini.

Tanggal hari ini: ${today}
Daftar stage yang ada: ${stages.join(', ')}

Data deal (JSON):
${JSON.stringify(deals)}

ATURAN ANALISIS:
- Deal "stale": tidak ada aktivitas baru lebih dari 5 hari di stage awal
  (prospek/kualifikasi), atau lebih dari 3 hari di stage lanjut
  (penawaran/negosiasi/closing). Hitung dari lastActivityTime relatif ke hari ini.
- Deal "renewal berisiko": recurring true dan endDate kurang dari 30 hari dari hari ini.
- Deal "friksi harga": lastActivity menyebutkan hal seperti revisi harga,
  diskon, keberatan, atau kenaikan harga.
- Deal "peluang upsell/cross-sell": type "upsell" atau "renewal" dengan value
  besar dan sudah di stage penawaran ke atas.
- Prioritas urutan kepentingan: urgent > warning > opportunity > info.
- Maksimal 8 insight, urutkan dari paling mendesak ke paling ringan.
- Jangan mengarang data yang tidak ada di input.

Balas HANYA dengan JSON valid persis mengikuti skema ini, tanpa markdown
fence, tanpa teks lain di luar JSON:

{
  "summary": "1-2 kalimat ringkasan kondisi pipeline hari ini, bahasa Indonesia natural",
  "insights": [
    {
      "deal_id": 123,
      "priority": "urgent" | "warning" | "opportunity" | "info",
      "title": "maks 6 kata",
      "reasoning": "1 kalimat kenapa ini butuh perhatian",
      "recommended_action": "1 kalimat actionable, mulai dengan kata kerja",
      "action_label": "label tombol pendek, maks 3 kata"
    }
  ],
  "forecast": {
    "likely_close_value": 0,
    "at_risk_value": 0
  }
}`;
}

function extractJson(raw) {
  const cleaned = raw.trim().replace(/^```json\s*|\s*```$/g, '');
  // Jaga-jaga kalau model tetap nyelipin teks di luar JSON meski format:'json' diminta.
  const start = cleaned.indexOf('{');
  const end = cleaned.lastIndexOf('}');
  if (start === -1 || end === -1) return cleaned;
  return cleaned.slice(start, end + 1);
}

async function generatePipelineInsightsWithOllama({ deals, stages }) {
  const today = new Date().toISOString().slice(0, 10);

  // Kirim hanya field yang relevan biar prompt ringkas & fokus.
  const slimDeals = deals.map((d) => ({
    id: d.id,
    company: d.company,
    product: d.product,
    value: d.value,
    stage: d.stage,
    type: d.type,
    pic: d.pic,
    recurring: !!d.recurring,
    interval: d.interval || null,
    endDate: d.endDate || null,
    date: d.date,
    lastActivity: d.activity && d.activity[0] ? d.activity[0].text : null,
    lastActivityTime: d.activity && d.activity[0] ? d.activity[0].time : null,
  }));

  const prompt = buildPipelinePrompt({ today, stages, deals: slimDeals });

  const res = await fetch(`${OLLAMA_BASE_URL}/api/generate`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: PIPELINE_OLLAMA_MODEL,
      prompt,
      stream: false,
      format: 'json', // paksa Ollama keluarin JSON yang valid secara sintaks
      options: { temperature: 0.2, num_ctx: 8192 }, // rendah — ini tugas analisis, bukan kreatif. num_ctx dinaikkan karena prompt berisi seluruh data deal.
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Ollama error ${res.status}: ${text}`);
  }

  const data = await res.json();
  const raw = (data.response || '').trim();

  let parsed;
  try {
    parsed = JSON.parse(extractJson(raw));
  } catch (e) {
    console.error('Gagal parse JSON dari Ollama:', raw);
    throw new Error('Respons AI tidak valid (bukan JSON), coba lagi');
  }

  return parsed;
}

// =============================================================
// 7) ENDPOINT: PIPELINE AI INSIGHTS
//    Dipanggil dari halaman Pipeline saat dibuka / tombol refresh.
// =============================================================
app.post('/api/pipeline/ai-insights', async (req, res) => {
  try {
    const { deals, stages } = req.body;
    if (!Array.isArray(deals)) {
      return res.status(400).json({ ok: false, error: 'deals harus berupa array' });
    }

    const insight = await generatePipelineInsightsWithOllama({
      deals,
      stages: Array.isArray(stages) ? stages : [],
    });

    res.json({
      ok: true,
      summary: insight.summary || '',
      insights: Array.isArray(insight.insights) ? insight.insights : [],
      forecast: insight.forecast || { likely_close_value: 0, at_risk_value: 0 },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ ok: false, error: err.message });
  }
});

// =============================================================
// 8) HEALTH CHECK
// =============================================================
app.get('/api/health', async (req, res) => {
  let ollamaOk = false;
  try {
    const r = await fetch(`${OLLAMA_BASE_URL}/api/tags`);
    ollamaOk = r.ok;
  } catch (e) { /* ollama belum jalan */ }

  res.json({
    ok: true,
    sendMode: SEND_MODE,
    ollama: {
      reachable: ollamaOk,
      followupModel: OLLAMA_MODEL,
      pipelineModel: PIPELINE_OLLAMA_MODEL,
      baseUrl: OLLAMA_BASE_URL,
    },
    telegram: { configured: !!TELEGRAM_BOT_TOKEN },
    waba: { configured: !!(WABA_ACCESS_TOKEN && WABA_PHONE_NUMBER_ID) },
    knowledgeBase: {
      totalDocs: knowledgeBase.length,
      activeDocs: knowledgeBase.filter((d) => d.status === 'aktif').length,
      contextChars: kbActiveContext().length,
    },
  });
});

app.listen(PORT, () => {
  console.log(`Follow-up AI backend jalan di http://localhost:${PORT}`);
  console.log(`Mode pengiriman aktif: ${SEND_MODE}`);
  console.log(`Cek status: GET http://localhost:${PORT}/api/health`);
  // Mulai polling Telegram untuk halaman Percakapan (jalan di background, tidak diawait).
  startTelegramPolling();
});