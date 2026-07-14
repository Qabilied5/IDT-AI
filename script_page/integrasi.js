/* ============================================================
   integrasi.js — Indotrading AI
   Halaman Integrasi Channel & Platform
   ============================================================ */

// ── DATA INTEGRASI ─────────────────────────────────────────────
const IG_DATA = [

  /* ── MESSAGING ── */
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    emoji: '💬',
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-whatsapp',
    // Status TIDAK di-hardcode lagi — mengikuti ada/tidaknya kredensial WABA
    // yang tersimpan di browser ini (lihat waba-token.js + igSyncWabaStatus()
    // di bawah), sejajar dengan pola kartu Telegram.
    status: 'disconnected', // connected | pending | disconnected
    desc: 'Hubungkan WhatsApp Business API (Meta Cloud API) ke AI Agent Anda. Terima dan balas pesan pelanggan secara otomatis, kelola percakapan massal, dan kirim notifikasi pesanan.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply AI' },
      { icon: 'ti-users', label: 'Broadcast List' },
      { icon: 'ti-file-invoice', label: 'Template Pesan' },
      { icon: 'ti-bell', label: 'Notifikasi Order' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram DM',
    emoji: '📸',
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-instagram',
    status: 'connected',
    desc: 'Integrasikan Instagram Direct Message dengan AI Agent. Balas DM pelanggan secara otomatis dan konversikan komentar produk menjadi leads.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply DM' },
      { icon: 'ti-message-circle', label: 'Komentar ke Lead' },
      { icon: 'ti-photo', label: 'Produk Tagging' },
    ],
    connectedInfo: {
      account: '@indotrading.official',
      since: '5 Maret 2025',
      msgs: '12.540 DM',
      lastStatus: '✅ Aktif — 8 menit lalu',
    },
    stats: [
      { val: '12.540', label: 'DM' },
      { val: '78%', label: 'AI Handle' },
      { val: '4.2 dtk', label: 'Avg Respons' },
    ],
  },
  {
    id: 'email',
    name: 'Email (SMTP/IMAP)',
    emoji: '📧',
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-mail',
    status: 'pending',
    desc: 'Hubungkan akun email bisnis Anda untuk membalas pertanyaan pelanggan secara otomatis, mengirim follow-up leads, dan notifikasi transaksi via AI.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply Email' },
      { icon: 'ti-send', label: 'Email Campaign' },
      { icon: 'ti-refresh', label: 'Follow-up Leads' },
    ],
    configFields: [
      { key: 'smtp_host', label: 'SMTP Host', placeholder: 'mail.yourdomain.com', type: 'text' },
      { key: 'smtp_port', label: 'Port SMTP', placeholder: '465', type: 'text' },
      { key: 'email_user', label: 'Alamat Email', placeholder: 'sales@indotrading.com', type: 'email' },
      { key: 'email_pass', label: 'Password / App Password', placeholder: '••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    emoji: '✈️',
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-telegram',
    status: 'disconnected',
    desc: 'Buat dan hubungkan Telegram Bot untuk melayani pelanggan, mengirim notifikasi pesanan, dan broadcast pesan promosi ke subscriber channel Anda.',
    features: [
      { icon: 'ti-robot', label: 'Bot AI' },
      { icon: 'ti-bell', label: 'Notifikasi' },
      { icon: 'ti-speakerphone', label: 'Broadcast Channel' },
    ],
    configFields: [
      { key: 'bot_token', label: 'Bot Token (dari @BotFather)', placeholder: '110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw', type: 'text' },
      { key: 'webhook_url', label: 'Webhook URL (opsional)', placeholder: 'https://api.indotrading.com/webhook/tg', type: 'text' },
    ],
    stats: [
      { val: 'Undef', label: 'DM' },
      { val: 'Undef', label: 'AI Handle' },
      { val: 'Undef', label: 'Avg Respons' },
    ],
  },
  {
    id: 'livechat',
    name: 'Live Chat Web',
    emoji: '💻',
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-message-chatbot',
    status: 'connected',
    desc: 'Pasang widget live chat bertenaga AI di website Indotrading Anda. Pengunjung website langsung dilayani AI Agent tanpa harus berpindah platform.',
    features: [
      { icon: 'ti-code', label: 'Widget Embed' },
      { icon: 'ti-robot', label: 'AI First Response' },
      { icon: 'ti-transfer', label: 'Handover ke Agen' },
    ],
    connectedInfo: {
      account: 'indotrading.com (snippet aktif)',
      since: '20 Februari 2025',
      msgs: '6.830 sesi',
      lastStatus: '✅ Aktif — live',
    },
    stats: [
      { val: '6.830', label: 'Sesi' },
      { val: '94%', label: 'AI Handle' },
      { val: '1.8 dtk', label: 'Avg Respons' },
    ],
  },

  /* ── CRM ── */
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    emoji: '🟠',
    category: 'crm',
    catLabel: 'CRM',
    catIcon: 'ti-users',
    status: 'disconnected',
    desc: 'Sinkronisasi leads dari AI Agent langsung ke HubSpot. Data kontak, riwayat percakapan, dan status follow-up otomatis tersimpan di pipeline CRM Anda.',
    features: [
      { icon: 'ti-refresh', label: 'Sync Leads Otomatis' },
      { icon: 'ti-timeline', label: 'Pipeline Sinkron' },
      { icon: 'ti-notes', label: 'Log Percakapan' },
    ],
    configFields: [
      { key: 'hs_api_key', label: 'HubSpot API Key / Private App Token', placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', type: 'password' },
      { key: 'hs_pipeline', label: 'Pipeline ID (opsional)', placeholder: 'default', type: 'text' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    emoji: '☁️',
    category: 'crm',
    catLabel: 'CRM',
    catIcon: 'ti-cloud',
    status: 'disconnected',
    desc: 'Integrasikan Salesforce CRM untuk mengelola leads enterprise. Setiap percakapan AI otomatis menciptakan record dan activity log di Salesforce.',
    features: [
      { icon: 'ti-user-plus', label: 'Lead Creation' },
      { icon: 'ti-activity', label: 'Activity Log' },
      { icon: 'ti-report-analytics', label: 'Laporan Sinkron' },
    ],
    configFields: [
      { key: 'sf_instance', label: 'Instance URL', placeholder: 'https://yourcompany.salesforce.com', type: 'text' },
      { key: 'sf_client_id', label: 'Consumer Key', placeholder: 'xxxxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'sf_client_secret', label: 'Consumer Secret', placeholder: '••••••••••••', type: 'password' },
    ],
  },

  /* ── E-COMMERCE ── */
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    emoji: '🟢',
    category: 'ecommerce',
    catLabel: 'E-Commerce',
    catIcon: 'ti-shopping-bag',
    status: 'disconnected',
    desc: 'Hubungkan toko Tokopedia Anda agar AI Agent dapat menjawab pertanyaan produk, mengkonfirmasi stok real-time, dan memproses notifikasi pesanan.',
    features: [
      { icon: 'ti-package', label: 'Stok Real-Time' },
      { icon: 'ti-receipt', label: 'Notifikasi Order' },
      { icon: 'ti-robot', label: 'AI Jawab Produk' },
    ],
    configFields: [
      { key: 'tp_shop_id', label: 'Shop ID Tokopedia', placeholder: '12345678', type: 'text' },
      { key: 'tp_client_id', label: 'Client ID (Tokopedia API)', placeholder: 'xxxxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'tp_client_secret', label: 'Client Secret', placeholder: '••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'shopee',
    name: 'Shopee',
    emoji: '🟠',
    category: 'ecommerce',
    catLabel: 'E-Commerce',
    catIcon: 'ti-shopping-cart',
    status: 'disconnected',
    desc: 'Integrasikan Shopee Open Platform untuk mengotomasi respon chat Shopee, cek status pesanan pelanggan, dan sinkronisasi katalog produk ke AI Knowledge Base.',
    features: [
      { icon: 'ti-robot', label: 'Auto Chat Reply' },
      { icon: 'ti-package', label: 'Status Pesanan' },
      { icon: 'ti-list-details', label: 'Sinkron Katalog' },
    ],
    configFields: [
      { key: 'sp_partner_id', label: 'Partner ID', placeholder: '1234567', type: 'text' },
      { key: 'sp_partner_key', label: 'Partner Key', placeholder: '••••••••••••', type: 'password' },
      { key: 'sp_shop_id', label: 'Shop ID', placeholder: '87654321', type: 'text' },
    ],
  },

  /* ── PAYMENT ── */
  {
    id: 'midtrans',
    name: 'Midtrans',
    emoji: '💳',
    category: 'payment',
    catLabel: 'Pembayaran',
    catIcon: 'ti-credit-card',
    status: 'disconnected',
    desc: 'Hubungkan Midtrans Payment Gateway agar AI Agent bisa mengirimkan link pembayaran langsung di dalam percakapan dan mengkonfirmasi status transaksi secara otomatis.',
    features: [
      { icon: 'ti-link', label: 'Payment Link di Chat' },
      { icon: 'ti-circle-check', label: 'Konfirmasi Otomatis' },
      { icon: 'ti-receipt-2', label: 'Bukti Bayar AI' },
    ],
    configFields: [
      { key: 'mt_server_key', label: 'Server Key', placeholder: 'SB-Mid-server-xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'mt_client_key', label: 'Client Key', placeholder: 'SB-Mid-client-xxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'mt_env', label: 'Environment', placeholder: 'Production / Sandbox', type: 'text' },
    ],
  },
  {
    id: 'xendit',
    name: 'Xendit',
    emoji: '💰',
    category: 'payment',
    catLabel: 'Pembayaran',
    catIcon: 'ti-cash',
    status: 'disconnected',
    desc: 'Integrasikan Xendit untuk pembayaran otomatis via VA bank, QRIS, e-wallet, dan kartu kredit. Link pembayaran dikirim AI langsung dalam percakapan WhatsApp.',
    features: [
      { icon: 'ti-qrcode', label: 'QRIS & E-Wallet' },
      { icon: 'ti-building-bank', label: 'Virtual Account' },
      { icon: 'ti-link', label: 'Auto Payment Link' },
    ],
    configFields: [
      { key: 'xn_secret_key', label: 'Secret API Key', placeholder: 'xnd_production_xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'xn_webhook', label: 'Webhook Token (Xendit Dashboard)', placeholder: 'xnd_development_xxxxxx', type: 'text' },
    ],
  },

  /* ── TOOLS ── */
  {
    id: 'googlecalendar',
    name: 'Google Calendar',
    emoji: '📅',
    category: 'tools',
    catLabel: 'Tools',
    catIcon: 'ti-calendar-event',
    status: 'disconnected',
    desc: 'Sinkronisasi Google Calendar dengan fitur Appointment Indotrading AI. AI Agent dapat menjadwalkan meeting, mengecek ketersediaan slot, dan mengirim reminder otomatis.',
    features: [
      { icon: 'ti-calendar-plus', label: 'Buat Event AI' },
      { icon: 'ti-clock', label: 'Cek Ketersediaan' },
      { icon: 'ti-bell', label: 'Reminder Otomatis' },
    ],
    configFields: [
      { key: 'gc_client_id', label: 'Google Client ID', placeholder: 'xxxxxxxx.apps.googleusercontent.com', type: 'text' },
      { key: 'gc_client_secret', label: 'Client Secret', placeholder: 'GOCSPX-xxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier / n8n',
    emoji: '⚡',
    category: 'tools',
    catLabel: 'Tools',
    catIcon: 'ti-bolt',
    status: 'disconnected',
    desc: 'Gunakan Zapier atau n8n untuk mengotomasi workflow lintas platform. Setiap event dari AI Agent (lead baru, pesan masuk, deal closed) dapat memicu aksi di 5000+ aplikasi.',
    features: [
      { icon: 'ti-webhook', label: 'Webhook Trigger' },
      { icon: 'ti-arrows-exchange', label: '5000+ Aplikasi' },
      { icon: 'ti-cpu', label: 'Custom Workflow' },
    ],
    configFields: [
      { key: 'zap_webhook_url', label: 'Webhook URL (dari Zapier/n8n)', placeholder: 'https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/', type: 'text' },
      { key: 'zap_secret', label: 'Secret Header (opsional)', placeholder: 'my-webhook-secret', type: 'text' },
    ],
  },
];

// ── STATE ──────────────────────────────────────────────────────
let igState = {
  category: 'semua',
  query: '',
  activeModal: null,
  disconnectTarget: null,
};

// ── CATEGORY LABELS ────────────────────────────────────────────
const IG_CAT_LABEL = {
  messaging: 'Pesan & Chat',
  crm: 'CRM',
  ecommerce: 'E-Commerce',
  payment: 'Pembayaran',
  tools: 'Tools & Otomasi',
};

// ── FILTER ─────────────────────────────────────────────────────
function igFilterCategory(btn, cat) {
  document.querySelectorAll('.ig-ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  igState.category = cat;
  igRender();
}

function igGetFiltered() {
  return IG_DATA.filter(item => {
    const matchCat = igState.category === 'semua' || item.category === igState.category;
    const q = igState.query.toLowerCase();
    const matchQ = !q || item.name.toLowerCase().includes(q) ||
                        item.desc.toLowerCase().includes(q) ||
                        item.catLabel.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

// ── RENDER ─────────────────────────────────────────────────────
// Selaraskan status kartu Telegram dengan token yang tersimpan di browser
// (diatur lewat telegram-token.js). Server.js tidak lagi jadi sumber .env,
// jadi status "connected" di kartu ini mengikuti ada/tidaknya token lokal.
function igSyncTelegramStatus() {
  const item = IG_DATA.find(i => i.id === 'telegram');
  if (!item) return;
  const token = (typeof tgGetToken === 'function') ? tgGetToken() : '';
  if (token) {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: 'Bot Telegram (token tersimpan di browser ini)',
        since: '—',
        msgs: '—',
        lastStatus: '✅ Token aktif',
      };
    }
  } else {
    item.status = 'disconnected';
    delete item.connectedInfo;
    delete item.stats;
  }
}

// Selaraskan status kartu WhatsApp Business (WABA) dengan kredensial yang
// tersimpan di browser (diatur lewat waba-token.js). Sejajar dengan
// igSyncTelegramStatus() di atas.
function igSyncWabaStatus() {
  const item = IG_DATA.find(i => i.id === 'whatsapp');
  if (!item) return;
  const token   = (typeof wbGetToken === 'function') ? wbGetToken() : '';
  const phoneId = (typeof wbGetPhoneId === 'function') ? wbGetPhoneId() : '';
  if (token && phoneId) {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: `Phone Number ID: ${phoneId}`,
        since: '—',
        msgs: '—',
        lastStatus: '✅ Kredensial aktif',
      };
    }
  } else {
    item.status = 'disconnected';
    delete item.connectedInfo;
    delete item.stats;
  }
}

function igRender() {
  igSyncTelegramStatus();
  igSyncWabaStatus();
  igState.query = (document.getElementById('ig-search')?.value || '').trim();

  const filtered = igGetFiltered();
  const active       = filtered.filter(i => i.status === 'connected');
  const notConnected = filtered.filter(i => i.status !== 'connected');

  // Sections visibility
  const secActive = document.getElementById('ig-section-active');
  const secAll    = document.getElementById('ig-section-all');
  const emptyEl   = document.getElementById('ig-empty');

  if (filtered.length === 0) {
    if (secActive) secActive.style.display = 'none';
    if (secAll)    secAll.style.display    = 'none';
    if (emptyEl)   emptyEl.style.display   = 'flex';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  // Active section
  if (secActive) {
    secActive.style.display = active.length ? 'flex' : 'none';
    const countEl = document.getElementById('ig-active-count');
    if (countEl) countEl.textContent = `${active.length} terhubung`;
    const grid = document.getElementById('ig-grid-active');
    if (grid) grid.innerHTML = active.map(igCardHTML).join('');
  }

  // All integrations (not connected or pending)
  if (secAll) {
    secAll.style.display = notConnected.length ? 'flex' : 'none';
    const countEl = document.getElementById('ig-all-count');
    if (countEl) countEl.textContent = `${notConnected.length} tersedia`;
    const grid = document.getElementById('ig-grid-all');
    if (grid) grid.innerHTML = notConnected.map(igCardHTML).join('');
  }

  // Update stat pills in banner
  const allData = IG_DATA;
  const connectedCount   = allData.filter(i => i.status === 'connected').length;
  const pendingCount     = allData.filter(i => i.status === 'pending').length;
  const disconnectedCount = allData.filter(i => i.status === 'disconnected').length;
  const cEl = document.getElementById('ig-count-connected');
  const pEl = document.getElementById('ig-count-pending');
  const dEl = document.getElementById('ig-count-disconnected');
  if (cEl) cEl.textContent = connectedCount;
  if (pEl) pEl.textContent = pendingCount;
  if (dEl) dEl.textContent = disconnectedCount;
}

// ── CARD HTML ──────────────────────────────────────────────────
function igCardHTML(item) {
  const statusHTML = igStatusBadge(item.status);
  const cardClass  = item.status === 'connected' ? 'ig-card-connected'
                   : item.status === 'pending'   ? 'ig-card-pending' : '';

  // Feature pills (max 3 shown)
  const featurePills = item.features.slice(0, 3).map(f =>
    `<span class="ig-feat-pill"><i class="ti ${f.icon}"></i>${f.label}</span>`
  ).join('');

  // Stats for connected
  let statsHTML = '';
  if (item.status === 'connected' && item.stats) {
    statsHTML = `<div class="ig-card-stats">
      ${item.stats.map(s => `
        <div class="ig-cstat">
          <div class="ig-cstat-val">${s.val}</div>
          <div class="ig-cstat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>`;
  }

  // CTA button
  let ctaHTML = '';
  if (item.status === 'connected') {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-green" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-settings"></i> Kelola</button>`;
  } else if (item.status === 'pending') {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-outline" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-clock"></i> Lihat Status</button>`;
  } else {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-red" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-plug-connected"></i> Hubungkan</button>`;
  }

  return `
  <div class="ig-card ${cardClass}" onclick="igOpenModal('${item.id}')">
    <div class="ig-card-top">
      <div class="ig-card-logo-wrap">
        <div class="ig-card-logo">${item.emoji}</div>
        <div>
          <div class="ig-card-name">${item.name}</div>
          <div class="ig-card-cat"><i class="ti ${item.catIcon}"></i>${item.catLabel}</div>
        </div>
      </div>
      ${statusHTML}
    </div>
    ${statsHTML}
    <div class="ig-card-desc">${item.desc}</div>
    <div class="ig-card-footer">
      <div class="ig-card-features">${featurePills}</div>
      ${ctaHTML}
    </div>
  </div>`;
}

function igStatusBadge(status) {
  if (status === 'connected') {
    return `<span class="ig-status ig-status-connected">Terhubung</span>`;
  } else if (status === 'pending') {
    return `<span class="ig-status ig-status-pending"><i class="ti ti-clock"></i> Menunggu</span>`;
  }
  return `<span class="ig-status ig-status-disconnected"><i class="ti ti-plug-x"></i> Belum</span>`;
}


// ── MODAL ──────────────────────────────────────────────────────
function igOpenModal(id) {
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;
  igState.activeModal = id;

  // Header
  document.getElementById('ig-modal-emoji').textContent = item.emoji;
  document.getElementById('ig-modal-name').textContent  = item.name;
  document.getElementById('ig-modal-cat-label').textContent = `${item.catLabel} · ${IG_CAT_LABEL[item.category] || item.catLabel}`;

  // Status badge
  document.getElementById('ig-modal-status-badge').innerHTML = igStatusBadge(item.status);

  // Description
  document.getElementById('ig-modal-desc').textContent = item.desc;

  // Config fields
  const configWrap = document.getElementById('ig-modal-config');
  const fieldsEl   = document.getElementById('ig-modal-fields');
  if (item.id === 'telegram') {
    // Telegram punya modal konfigurasi token khusus (tg-token-modal, lihat
    // telegram-token.js) dengan test koneksi & penyimpanan ke backend —
    // jadi tidak pakai field generic di sini.
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = `
      <div class="ig-field-group">
        <div class="ig-field-label" style="margin-bottom:6px">
          ${item.status === 'connected' ? 'Token Bot tersimpan di browser ini.' : 'Belum ada token Bot yang terhubung.'}
        </div>
        <button type="button" class="ig-btn-primary" style="width:100%;justify-content:center"
                onclick="igCloseModal(); if(typeof tgOpenModal==='function') tgOpenModal();">
          <i class="ti ti-brand-telegram"></i> ${item.status === 'connected' ? 'Kelola Token Telegram' : 'Atur Token Telegram'}
        </button>
      </div>
    `;
  } else if (item.id === 'whatsapp') {
    // WhatsApp Business (WABA) punya modal konfigurasi kredensial khusus
    // (wb-token-modal, lihat waba-token.js) dengan test koneksi & penyimpanan
    // ke backend — sejajar dengan pola Telegram di atas, bukan field generic.
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = `
      <div class="ig-field-group">
        <div class="ig-field-label" style="margin-bottom:6px">
          ${item.status === 'connected' ? 'Kredensial WABA tersimpan di browser ini.' : 'Belum ada kredensial WABA yang terhubung.'}
        </div>
        <button type="button" class="ig-btn-primary" style="width:100%;justify-content:center"
                onclick="igCloseModal(); if(typeof wbOpenModal==='function') wbOpenModal();">
          <i class="ti ti-brand-whatsapp"></i> ${item.status === 'connected' ? 'Kelola Kredensial WABA' : 'Atur Kredensial WABA'}
        </button>
      </div>
    `;
  } else if (item.status !== 'connected' && item.configFields?.length) {
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = item.configFields.map(f => `
      <div class="ig-field-group">
        <div class="ig-field-label">${f.label}</div>
        <input class="ig-field-input" type="${f.type || 'text'}" placeholder="${f.placeholder}" id="igf-${f.key}" />
      </div>
    `).join('');
  } else {
    configWrap.style.display = 'none';
    fieldsEl.innerHTML = '';
  }

  // Connected info
  const connInfoWrap = document.getElementById('ig-modal-connected-info');
  if (item.status === 'connected' && item.connectedInfo) {
    connInfoWrap.style.display = 'block';
    document.getElementById('ig-ci-account').textContent = item.connectedInfo.account;
    document.getElementById('ig-ci-since').textContent   = item.connectedInfo.since;
    document.getElementById('ig-ci-msgs').textContent    = item.connectedInfo.msgs;
    document.getElementById('ig-ci-last').textContent    = item.connectedInfo.lastStatus;
  } else {
    connInfoWrap.style.display = 'none';
  }

  // Features
  document.getElementById('ig-modal-features').innerHTML = item.features.map(f =>
    `<span class="ig-feature-tag"><i class="ti ${f.icon}"></i>${f.label}</span>`
  ).join('');

  // CTA button
  const ctaBtn = document.getElementById('ig-modal-cta');
  if (item.status === 'connected') {
    ctaBtn.className = 'ig-btn-danger';
    ctaBtn.innerHTML = '<i class="ti ti-plug-x"></i> Putuskan Koneksi';
  } else if (item.status === 'pending') {
    ctaBtn.className = 'ig-btn-primary';
    ctaBtn.innerHTML = '<i class="ti ti-refresh"></i> Cek Status';
  } else {
    ctaBtn.className = 'ig-btn-primary';
    ctaBtn.innerHTML = '<i class="ti ti-plug-connected"></i> Hubungkan Sekarang';
  }

  document.getElementById('ig-modal').style.display = 'flex';
}

function igCloseModal() {
  document.getElementById('ig-modal').style.display = 'none';
  igState.activeModal = null;
}

function igModalAction() {
  const id   = igState.activeModal;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;

  if (id === 'telegram' && item.status !== 'connected') {
    // Belum konek: langsung buka modal token khusus, bukan simulasi connect generic.
    igCloseModal();
    if (typeof tgOpenModal === 'function') tgOpenModal();
    return;
  }

  if (id === 'whatsapp' && item.status !== 'connected') {
    // Belum konek: langsung buka modal kredensial WABA khusus, bukan simulasi connect generic.
    igCloseModal();
    if (typeof wbOpenModal === 'function') wbOpenModal();
    return;
  }

  if (item.status === 'connected') {
    // Open disconnect confirmation
    igCloseModal();
    igOpenDisconnect(id);
    return;
  }

  if (item.status === 'pending') {
    igShowToast('Memeriksa status koneksi…', 'info');
    setTimeout(() => igShowToast(`Status ${item.name}: Menunggu verifikasi pihak platform.`, 'info'), 1000);
    return;
  }

  // Simulate connect
  const hasFields = item.configFields?.length;
  if (hasFields) {
    // Validate: all fields must be non-empty
    const allFilled = item.configFields.every(f => {
      const el = document.getElementById(`igf-${f.key}`);
      return el && el.value.trim() !== '';
    });
    if (!allFilled) {
      igShowToast('Harap isi semua field konfigurasi terlebih dahulu.', 'error');
      return;
    }
  }

  // Update to pending -> then connected (simulate)
  igCloseModal();
  igShowToast(`Menghubungkan ${item.name}…`, 'info');
  item.status = 'pending';
  igRender();

  setTimeout(() => {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: 'Akun baru',
        since: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        msgs: '0 pesan',
        lastStatus: '✅ Baru terhubung',
      };
    }
    if (!item.stats) {
      item.stats = [
        { val: '0', label: 'Pesan' },
        { val: '—', label: 'AI Handle' },
        { val: '—', label: 'Avg Respons' },
      ];
    }
    igRender();
    igShowToast(`✅ ${item.name} berhasil terhubung!`, 'success');
  }, 2000);
}


// ── DISCONNECT MODAL ───────────────────────────────────────────
function igOpenDisconnect(id) {
  igState.disconnectTarget = id;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;
  document.getElementById('ig-dc-name').textContent = item.name;
  document.getElementById('ig-modal-disconnect').style.display = 'flex';
}

function igCloseDisconnect() {
  document.getElementById('ig-modal-disconnect').style.display = 'none';
  igState.disconnectTarget = null;
}

function igConfirmDisconnect() {
  const id   = igState.disconnectTarget;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;

  if (id === 'telegram') {
    // Hapus token dari browser ini sekaligus dari backend (server.js),
    // supaya polling Telegram di server ikut berhenti.
    if (typeof tgClearToken === 'function') tgClearToken();
    const base = (typeof TG_API_BASE !== 'undefined') ? TG_API_BASE : (window.PC_API_BASE || 'http://localhost:3001');
    fetch(`${base}/api/telegram/config`, { method: 'DELETE' }).catch(() => {});
  }

  if (id === 'whatsapp') {
    // Hapus kredensial WABA dari browser ini sekaligus dari backend (server.js).
    if (typeof wbClearConfig === 'function') wbClearConfig();
    const base = (typeof WB_API_BASE !== 'undefined') ? WB_API_BASE : (window.PC_API_BASE || 'http://localhost:3001');
    fetch(`${base}/api/waba/config`, { method: 'DELETE' }).catch(() => {});
  }

  item.status = 'disconnected';
  delete item.connectedInfo;
  delete item.stats;
  igCloseDisconnect();
  igRender();
  igShowToast(`${item.name} telah diputuskan.`, 'error');
}


// ── TOAST ──────────────────────────────────────────────────────
let _igToastTimer = null;
function igShowToast(msg, type = 'info') {
  const el = document.getElementById('ig-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'ig-toast' + (type === 'success' ? ' success' : type === 'error' ? ' error' : '');
  el.style.display = 'flex';
  clearTimeout(_igToastTimer);
  _igToastTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}


// ── INIT ───────────────────────────────────────────────────────
function initIntegrasiPage() {
  igRender();
}

// Auto-init when nav clicks to Integrasi page
document.addEventListener('DOMContentLoaded', () => {
  // Hook into script.js navigation
  const origShowPage = window.showPage;
  if (typeof origShowPage === 'function') {
    window.showPage = function(pageId) {
      origShowPage(pageId);
      if (pageId === 'integrasi-page') {
        initIntegrasiPage();
      }
    };
  } else {
    // Fallback: observe display changes via MutationObserver
    const el = document.getElementById('integrasi-page');
    if (el) {
      const observer = new MutationObserver(() => {
        if (el.style.display !== 'none') initIntegrasiPage();
      });
      observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    }
  }
});