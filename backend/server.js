/* =============================================================
   server.js
   Backend testing: Ollama (generate pesan) + Telegram (kirim pesan)
   Pengganti sementara WhatsApp Business API selagi WABA diproses.

   Cara pakai cepat:
     1) cp .env.example .env   lalu isi TELEGRAM_BOT_TOKEN dkk
     2) npm install
     3) ollama serve           (terminal lain, biarkan jalan)
     4) ollama pull llama3.1   (sekali saja, sesuaikan OLLAMA_MODEL)
     5) npm start
   ============================================================= */

require('dotenv').config();
const express = require('express');
const cors = require('cors');
const fetch = require('node-fetch');

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 3001;
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || 'http://localhost:11434';
const OLLAMA_MODEL = process.env.OLLAMA_MODEL || 'llama3.1';
// Model terpisah untuk pipeline insight (opsional). Analisis JSON terstruktur
// biasanya lebih stabil di model yang lebih besar/instruction-tuned baik;
// kalau tidak diisi, pakai OLLAMA_MODEL yang sama dengan follow-up.
const PIPELINE_OLLAMA_MODEL = process.env.PIPELINE_OLLAMA_MODEL || OLLAMA_MODEL;
const TELEGRAM_BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || '';
const TELEGRAM_DEFAULT_CHAT_ID = process.env.TELEGRAM_DEFAULT_CHAT_ID || '';
const SEND_MODE = process.env.SEND_MODE || 'mock'; // mock | telegram | whatsapp

// ── Riwayat pengiriman sementara (in-memory, hilang saat restart) ──
// Pada implementasi production ini diganti dengan tabel di database.
const sendLog = [];

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

function tgInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'TG';
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

  return `Kamu adalah asisten sales AI yang ramah dan profesional untuk bisnis B2B Indonesia.
Kamu sedang membalas chat Telegram dari customer secara real-time.

${historyText ? `Riwayat percakapan terakhir:\n${historyText}\n\n` : ''}Pesan baru dari customer: "${incomingText}"

Aturan:
- Balas pesan tersebut secara natural, singkat (maksimal 3 kalimat), Bahasa Indonesia, ramah dan semi-formal.
- Jangan mengulang-ulang sapaan jika percakapan sudah berjalan.
- JANGAN gunakan markdown, JANGAN beri judul atau penjelasan tambahan.
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
  if (!message.text) return; // sementara lewati pesan non-teks (foto, stiker, dll)

  const conv = tgGetOrCreateConversation(message.chat, message.from);
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

  if (conv.handledBy === 'ai') {
    try {
      const replyText = await tgGenerateReplyWithOllama(conv, message.text);
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

async function startTelegramPolling() {
  if (!TELEGRAM_BOT_TOKEN) {
    console.log('[Telegram] TELEGRAM_BOT_TOKEN kosong — polling tidak dijalankan. Isi .env untuk mengaktifkan halaman Percakapan.');
    return;
  }

  try {
    // Webhook & polling tidak bisa jalan bersamaan — pastikan webhook nonaktif dulu.
    await fetch(`https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/deleteWebhook`);
    await tgFetchBotInfo();
    tgPollingActive = true;
    console.log(`[Telegram] Polling aktif${tgBotInfo ? ' — @' + tgBotInfo.username : ''}`);
  } catch (err) {
    console.error('[Telegram] Gagal inisialisasi polling:', err.message);
  }

  // Long-polling loop — berjalan terus selama server hidup.
  while (TELEGRAM_BOT_TOKEN) {
    try {
      await tgPollOnce();
    } catch (err) {
      console.error('[Telegram] Polling error:', err.message);
      await new Promise((r) => setTimeout(r, 3000));
    }
  }
}

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
    // Placeholder: aktifkan setelah WABA approved.
    // Struktur body & endpoint mengikuti WhatsApp Cloud API.
    throw new Error('Mode whatsapp belum diaktifkan — WABA belum siap. Pakai mode "telegram" atau "mock" dulu.');
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
  });
});

app.listen(PORT, () => {
  console.log(`Follow-up AI backend jalan di http://localhost:${PORT}`);
  console.log(`Mode pengiriman aktif: ${SEND_MODE}`);
  console.log(`Cek status: GET http://localhost:${PORT}/api/health`);
  // Mulai polling Telegram untuk halaman Percakapan (jalan di background, tidak diawait).
  startTelegramPolling();
});