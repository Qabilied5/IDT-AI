/* ============================================
   PERCAKAPAN PAGE — SCRIPT (Terhubung ke Telegram, live)
   Data diambil dari backend server.js (endpoint /api/telegram/*)
   yang polling pesan Telegram lewat getUpdates.
   ============================================ */

// Ganti kalau backend jalan di host/port lain.
// Bisa juga di-override dari index.html: <script>window.PC_API_BASE='http://x:3001'</script>
// sebelum tag <script src="script_page/percapakan.js">.
const PC_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

// ── STATE ────────────────────────────────────────────────────────
let _activeContactId = null;   // chatId Telegram yang sedang dibuka
let _listCache = [];           // ringkasan daftar percakapan terakhir dari server
let _conversationsCache = {};  // chatId -> detail percakapan (termasuk messages)
let _pcListTimer = null;
let _pcDetailTimer = null;

// ── HELPER ───────────────────────────────────────────────────────
function pcInitials(name) {
  return (name || '')
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join('') || 'TG';
}
function pcTimeLabel(ts) {
  if (!ts) return '';
  const d = new Date(ts);
  return d.getHours() + ':' + String(d.getMinutes()).padStart(2, '0');
}
function pcEscape(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}
async function pcFetch(path, opts) {
  const res = await fetch(`${PC_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Request gagal (${res.status})`);
  return data;
}

// Ubah bentuk data percakapan Telegram dari server ke "shape" yang
// dipakai fungsi render (mirip struktur kontak lama, field CRM yang
// belum tersedia untuk Telegram diisi placeholder).
function _toContactShape(conv) {
  const name = conv.name || `Chat ${conv.chatId}`;
  return {
    id: conv.chatId,
    name,
    initials: pcInitials(name),
    company: conv.username ? '@' + conv.username : '—',
    phone: conv.username ? '@' + conv.username : `ID ${conv.chatId}`,
    email: '—',
    city: '—',
    channel: 'telegram',
    channelLabel: 'Telegram',
    channelIcon: 'ti-brand-telegram',
    channelColor: '#229ED9',
    channelTagClass: 'tg-tag',
    avClass: 'tg-av',
    status: 'online',
    handledBy: conv.handledBy,
    agentLabel: conv.handledBy === 'human' ? 'Anda (Manual)' : 'Agent AI',
    activeSince: pcTimeLabel((conv.messages && conv.messages[0] && conv.messages[0].time) || conv.lastMessageTime),
    msgCount: (conv.messages && conv.messages.length) || 0,
    badges: [],
    badgeClasses: [],
    stats: { conv: (conv.messages && conv.messages.length) || 0, order: '—', total: '—' },
    history: (conv.messages || [])
      .slice(-5)
      .reverse()
      .map((m) => ({
        dot: m.dir === 'in' ? 'green' : 'gray',
        title: m.text.length > 60 ? m.text.slice(0, 60) + '…' : m.text,
        meta: `${pcTimeLabel(m.time)} · ${m.dir === 'in' ? 'Customer' : m.from === 'human' ? 'Human' : 'AI'}`,
      })),
    note: '',
    aiScore: null,
    aiScoreLabel: 'Belum ada data',
    aiScoreTags: [],
    aiSummary: 'Ringkasan otomatis belum tersedia untuk percakapan ini.',
    aiTopics: [],
    aiTopicIcons: [],
    aiRecs: [],
    sentiment: { pos: 0, neu: 100, neg: 0 },
    messages: conv.messages || [],
  };
}

// ── RENDER LIST PERCAKAPAN (KIRI) ───────────────────────────────
function _renderPcList(conversations) {
  const list = document.getElementById('pc-list');
  if (!list) return;

  if (!conversations.length) {
    list.innerHTML = `
      <div style="padding:28px 16px;text-align:center;color:var(--gray-400);font-size:12px">
        <i class="ti ti-brand-telegram" style="font-size:24px;display:block;margin-bottom:8px"></i>
        Belum ada percakapan masuk dari Telegram.<br>Kirim pesan ke bot untuk mulai chat.
      </div>`;
  } else {
    list.innerHTML = conversations
      .map((c) => {
        const initials = pcInitials(c.name);
        const filterVal = c.handledBy === 'human' ? 'human' : 'ai';
        const isActive = String(c.chatId) === String(_activeContactId);
        const unreadHtml = c.unread > 0 ? `<div class="pc-item-unread">${c.unread > 9 ? '9+' : c.unread}</div>` : '';
        const handledTag =
          c.handledBy === 'human'
            ? `<span class="pc-tag human-tag"><i class="ti ti-user"></i> Agen</span>`
            : `<span class="pc-tag ai-tag"><i class="ti ti-robot"></i> AI</span>`;
        return `
          <div class="pc-item ${isActive ? 'active' : ''}" data-id="${c.chatId}" data-filter="${filterVal}" data-channel="telegram" onclick="selectConv(this, '${c.chatId}')">
            <div class="pc-item-av tg-av">${initials}</div>
            <div class="pc-item-body">
              <div class="pc-item-top">
                <span class="pc-item-name">${pcEscape(c.name)}</span>
                <span class="pc-item-time">${pcTimeLabel(c.lastMessageTime)}</span>
              </div>
              <div class="pc-item-preview">${pcEscape(c.lastMessageText)}</div>
              <div class="pc-item-tags">
                <span class="pc-tag tg-tag"><i class="ti ti-brand-telegram"></i> Telegram</span>
                ${handledTag}
              </div>
            </div>
            ${unreadHtml}
          </div>`;
      })
      .join('');
  }

  _updatePcCounts(conversations);
}

function _updatePcCounts(conversations) {
  const counts = { all: conversations.length, ai: 0, human: 0, pending: 0 };
  conversations.forEach((c) => {
    if (c.handledBy === 'human') counts.human++;
    else counts.ai++;
  });
  document.querySelectorAll('.pc-filter-btn').forEach((btn) => {
    const key = btn.dataset.filter;
    const countEl = btn.querySelector('.pc-count');
    if (countEl && counts[key] !== undefined) countEl.textContent = counts[key];
  });
  const tgBadgeCount = document.getElementById('pc-tg-badge-count');
  if (tgBadgeCount) tgBadgeCount.textContent = conversations.length;
}

function _showBotWarning(show) {
  const existing = document.getElementById('pc-bot-warning');
  if (show && !existing) {
    const list = document.getElementById('pc-list');
    if (list) {
      list.insertAdjacentHTML(
        'afterbegin',
        `<div id="pc-bot-warning" style="padding:10px 14px;background:var(--amber-bg);color:var(--amber);font-size:11px;font-weight:600;display:flex;align-items:center;gap:6px">
          <i class="ti ti-alert-triangle"></i> TELEGRAM_BOT_TOKEN belum diisi di server .env — halaman ini butuh backend aktif.
        </div>`
      );
    }
  } else if (!show && existing) {
    existing.remove();
  }
}

function _applyActiveFilters(conversations) {
  const activeBtn = document.querySelector('.pc-filter-btn.active');
  const filter = activeBtn ? activeBtn.dataset.filter : 'all';
  const search = (document.getElementById('pc-search-input')?.value || '').toLowerCase();
  return conversations.filter((c) => {
    const matchFilter =
      filter === 'all' || (filter === 'ai' && c.handledBy !== 'human') || (filter === 'human' && c.handledBy === 'human');
    const matchSearch =
      !search || c.name.toLowerCase().includes(search) || (c.lastMessageText || '').toLowerCase().includes(search);
    return matchFilter && matchSearch;
  });
}

// ── LOAD & POLL LIST ─────────────────────────────────────────────
async function _loadPcList() {
  try {
    const data = await pcFetch('/api/telegram/conversations');
    _listCache = data.conversations || [];
    _renderPcList(_applyActiveFilters(_listCache));
    _showBotWarning(!data.botConfigured);
  } catch (err) {
    console.error('Gagal memuat daftar percakapan Telegram:', err);
    const list = document.getElementById('pc-list');
    if (list && !document.getElementById('pc-bot-warning')) {
      list.innerHTML = `
        <div style="padding:28px 16px;text-align:center;color:var(--red);font-size:12px">
          <i class="ti ti-plug-connected-x" style="font-size:22px;display:block;margin-bottom:8px"></i>
          Tidak bisa terhubung ke backend (${PC_API_BASE}).<br>Pastikan <code>npm start</code> sudah jalan.
        </div>`;
    }
  }
}

function _startPcPolling() {
  _loadPcList();
  clearInterval(_pcListTimer);
  _pcListTimer = setInterval(_loadPcList, 4000);
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', _startPcPolling);
} else {
  _startPcPolling();
}

// ── SELECT CONVERSATION ───────────────────────────────────────────
async function selectConv(el, chatId) {
  _activeContactId = String(chatId);

  document.querySelectorAll('.pc-item').forEach((i) => i.classList.remove('active'));
  if (el) el.classList.add('active');
  const unread = el && el.querySelector('.pc-item-unread');
  if (unread) unread.remove();

  await _loadConversationDetail(_activeContactId, true);

  clearInterval(_pcDetailTimer);
  _pcDetailTimer = setInterval(() => _loadConversationDetail(_activeContactId, false), 3000);
}

async function _loadConversationDetail(chatId, forceScroll) {
  try {
    const data = await pcFetch(`/api/telegram/conversations/${chatId}`);
    const conv = data.conversation;
    if (!conv || String(_activeContactId) !== String(chatId)) return;
    _conversationsCache[chatId] = conv;
    const c = _toContactShape(conv);
    _updatePcDetail(c, forceScroll);
    _updateColRight(c);
  } catch (err) {
    console.error('Gagal memuat detail percakapan:', err);
  }
}

// ── UPDATE PANEL TENGAH (pc-detail) ───────────────────────────────
function _updatePcDetail(c, forceScroll) {
  const av = document.querySelector('.pc-detail-av');
  if (av) {
    av.textContent = c.initials;
    av.className = 'pc-detail-av ' + (c.avClass || '');
    av.style.cssText = '';
  }
  const nameEl = document.querySelector('.pc-detail-name');
  if (nameEl) nameEl.textContent = c.name;

  const metaEl = document.querySelector('.pc-detail-meta');
  if (metaEl) metaEl.innerHTML = `
    <span class="pc-tag ${c.channelTagClass}" style="font-size:10px">
      <i class="ti ${c.channelIcon}"></i> ${c.channelLabel}
    </span>
    <span style="color:var(--gray-400);font-size:10px">· ${c.phone}</span>
  `;

  // -- Status bar
  const statusBar = document.getElementById('pc-status-bar');
  if (statusBar) {
    const handledMap = {
      ai: `<span class="pc-tag ai-tag"><i class="ti ti-robot"></i> Ditangani AI — ${c.agentLabel}</span>`,
      human: `<span class="pc-tag human-tag"><i class="ti ti-user"></i> Ditangani: ${c.agentLabel}</span>`,
    };
    const statusInfo = statusBar.querySelector('.pc-status-info');
    if (statusInfo) statusInfo.innerHTML = `
      ${handledMap[c.handledBy] || handledMap.ai}
      <span style="font-size:10px;color:var(--gray-400)">Aktif sejak ${c.activeSince} · ${c.msgCount} pesan</span>
    `;
  }

  // -- Tombol takeover & label input, ikut status backend
  const btn = document.getElementById('btn-takeover');
  const indicator = document.getElementById('takeover-indicator');
  const label = document.getElementById('pc-input-label');
  if (btn && indicator && label) {
    if (c.handledBy === 'human') {
      btn.innerHTML = '<i class="ti ti-robot"></i> Kembalikan ke AI';
      btn.classList.add('taken');
      indicator.style.display = 'flex';
      label.textContent = '✎ Mode manual — Anda yang membalas';
      label.className = 'pc-input-label manual-mode';
    } else {
      btn.innerHTML = '<i class="ti ti-transfer"></i> Ambil Alih';
      btn.classList.remove('taken');
      indicator.style.display = 'none';
      label.innerHTML = '<i class="ti ti-robot"></i> AI aktif — ketik untuk override manual';
      label.className = 'pc-input-label ai-mode';
    }
  }

  // -- Chat body: render pesan asli dari Telegram
  const body = document.getElementById('pc-chat-body');
  if (body) {
    const atBottom = body.scrollTop + body.clientHeight >= body.scrollHeight - 40;
    if (!c.messages.length) {
      body.innerHTML = `<div class="pc-date-divider"><span>Belum ada pesan</span></div>`;
    } else {
      body.innerHTML =
        `<div class="pc-date-divider"><span>Percakapan Telegram</span></div>` +
        c.messages
          .map((m) => {
            if (m.dir === 'in') {
              return `<div class="msg user"><div class="msg-bubble">${pcEscape(m.text)}</div><div class="msg-meta">${pcTimeLabel(m.time)}</div></div>`;
            }
            const tag = m.from === 'human' ? 'Anda' : 'AI';
            return `<div class="msg bot"><div class="msg-bubble">${pcEscape(m.text)}</div><div class="msg-meta"><span class="ai-label">${tag}</span> ${pcTimeLabel(m.time)}</div></div>`;
          })
          .join('');
    }
    if (forceScroll || atBottom) body.scrollTop = body.scrollHeight;
  }
}

// ── UPDATE COL-RIGHT ──────────────────────────────────────────────
function _updateColRight(c) {
  // -- Header (rp-chat-header)
  const rpAv = document.querySelector('.rp-av');
  if (rpAv) {
    rpAv.textContent = c.initials;
    rpAv.style.background = '';
    rpAv.style.color = '';
  }
  const rpNm = document.querySelector('.rp-nm');
  if (rpNm) rpNm.textContent = c.name;
  const rpStatus = document.querySelector('.rp-status');
  if (rpStatus) {
    rpStatus.textContent = 'Online';
    rpStatus.style.color = 'var(--green)';
  }

  // -- Panel Live Chat
  const livePanel = document.getElementById('rp-panel-live-chat');
  if (livePanel) {
    const badgeWrap = livePanel.querySelector('div[style*="padding:6px"]');
    if (badgeWrap) {
      const handledMap = {
        ai: `<div style="background:var(--red-light);color:var(--red);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:4px"><i class="ti ti-robot" style="font-size:11px"></i> Ditangani AI — ${c.agentLabel}</div>`,
        human: `<div style="background:#eef2ff;color:#4b5eaa;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:4px"><i class="ti ti-user" style="font-size:11px"></i> Ditangani: ${c.agentLabel}</div>`,
      };
      badgeWrap.innerHTML = handledMap[c.handledBy] || handledMap.ai;
    }
    const rpChatBody = livePanel.querySelector('.chat-body');
    if (rpChatBody) {
      if (!c.messages.length) {
        rpChatBody.innerHTML = `<div style="padding:14px;font-size:11px;color:var(--gray-400)">Belum ada pesan.</div>`;
      } else {
        rpChatBody.innerHTML = c.messages
          .slice(-6)
          .map((m) => {
            if (m.dir === 'in') {
              return `<div class="msg user"><div class="msg-bubble">${pcEscape(m.text)}</div><div class="msg-meta">${pcTimeLabel(m.time)}</div></div>`;
            }
            const tag = m.from === 'human' ? 'Anda' : 'AI';
            return `<div class="msg bot"><div class="msg-bubble">${pcEscape(m.text)}</div><div class="msg-meta"><span class="ai-label">${tag}</span> ${pcTimeLabel(m.time)}</div></div>`;
          })
          .join('');
      }
      rpChatBody.scrollTop = rpChatBody.scrollHeight;
    }
  }

  // -- Panel Detail Kontak
  const detailPanel = document.getElementById('rp-panel-detail-kontak');
  if (detailPanel) {
    const hero = detailPanel.querySelector('.rp-dk-hero');
    if (hero) {
      hero.innerHTML = `
        <div class="rp-dk-av">${c.initials}</div>
        <div class="rp-dk-name">${pcEscape(c.name)}</div>
        <div class="rp-dk-company">${pcEscape(c.company)}</div>
        <div class="rp-dk-badges"></div>
      `;
    }

    const rows = detailPanel.querySelector('.rp-dk-rows');
    if (rows) rows.innerHTML = `
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ${c.channelIcon}" style="color:${c.channelColor}"></i></span>
        <div><div class="rp-dk-lbl">${c.channelLabel}</div><div class="rp-dk-val">${pcEscape(c.phone)}</div></div>
        <button class="rp-dk-copy" onclick="rpCopy('${pcEscape(c.phone)}', this)"><i class="ti ti-copy"></i></button>
      </div>
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ti-id" style="color:var(--gray-400)"></i></span>
        <div><div class="rp-dk-lbl">Chat ID</div><div class="rp-dk-val">${c.id}</div></div>
        <button class="rp-dk-copy" onclick="rpCopy('${c.id}', this)"><i class="ti ti-copy"></i></button>
      </div>
    `;

    const statsGrid = detailPanel.querySelector('.rp-dk-stats-grid');
    if (statsGrid) statsGrid.innerHTML = `
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val">${c.stats.conv}</div>
        <div class="rp-dk-stat-lbl">Pesan</div>
      </div>
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val" style="color:var(--green)">${c.stats.order}</div>
        <div class="rp-dk-stat-lbl">Order</div>
      </div>
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val" style="color:var(--red)">${c.stats.total}</div>
        <div class="rp-dk-stat-lbl">Total Belanja</div>
      </div>
    `;

    const hist = detailPanel.querySelector('.rp-dk-history');
    if (hist) hist.innerHTML = c.history.length
      ? c.history.map((h) => {
          const dotColor = h.dot === 'green' ? 'var(--green)' : 'var(--gray-400)';
          return `
            <div class="rp-dk-hist-item">
              <div class="rp-dk-hist-dot" style="background:${dotColor}"></div>
              <div>
                <div class="rp-dk-hist-title">${pcEscape(h.title)}</div>
                <div class="rp-dk-hist-meta">${h.meta}</div>
              </div>
            </div>
          `;
        }).join('')
      : `<div style="font-size:11px;color:var(--gray-400)">Belum ada riwayat.</div>`;

    const noteSpan = detailPanel.querySelector('.rp-dk-note span');
    if (noteSpan) noteSpan.textContent = c.note || 'Belum ada catatan.';
  }

  // -- Panel Ringkasan AI
  const aiPanel = document.getElementById('rp-panel-ringkasan-ai');
  if (aiPanel) {
    const scoreNum = aiPanel.querySelector('.rp-ai-score-num');
    const scoreLbl = aiPanel.querySelector('.rp-ai-score-lbl');
    const scoreBar = aiPanel.querySelector('.rp-ai-score-bar');
    const scoreTags = aiPanel.querySelector('.rp-ai-score-tags');
    if (scoreNum) scoreNum.textContent = c.aiScore == null ? '–' : c.aiScore;
    if (scoreLbl) scoreLbl.textContent = c.aiScoreLabel || 'Lead Score';
    if (scoreBar) scoreBar.style.width = (c.aiScore || 0) + '%';
    if (scoreTags) scoreTags.innerHTML = c.aiScoreTags
      .map((t) => `<span class="rp-ai-tag ${t.cls}" ${t.style ? `style="${t.style}"` : ''}>${t.text}</span>`)
      .join('');

    const summary = aiPanel.querySelector('.rp-ai-summary-text');
    if (summary) summary.innerHTML = c.aiSummary;

    const topics = aiPanel.querySelector('.rp-ai-topics');
    if (topics) topics.innerHTML = c.aiTopics
      .map((t, i) => `<span class="rp-ai-topic"><i class="ti ${c.aiTopicIcons[i] || 'ti-tag'}"></i> ${t}</span>`)
      .join('') || `<span style="font-size:11px;color:var(--gray-400)">Belum ada data topik.</span>`;

    const recs = aiPanel.querySelector('.rp-ai-recs');
    if (recs) recs.innerHTML = c.aiRecs.length
      ? c.aiRecs.map((r) => {
          const dotColor = r.dot === 'red' ? 'var(--red)' : r.dot === 'amber' ? '#d97706' : 'var(--green)';
          return `<div class="rp-ai-rec"><div class="rp-ai-rec-dot" style="background:${dotColor}"></div><span>${r.text}</span></div>`;
        }).join('')
      : `<div style="font-size:11px;color:var(--gray-400)">Belum ada rekomendasi.</div>`;

    const sentRows = aiPanel.querySelectorAll('.rp-ai-sent-item');
    const sentData = [
      { val: c.sentiment.pos, color: 'var(--green)' },
      { val: c.sentiment.neu, color: 'var(--gray-400)' },
      { val: c.sentiment.neg, color: 'var(--red)' },
    ];
    sentRows.forEach((row, i) => {
      const bar = row.querySelector('.rp-ai-sent-bar');
      const pct = row.querySelector('.rp-ai-sent-pct');
      if (bar) { bar.style.width = sentData[i].val + '%'; bar.style.background = sentData[i].color; }
      if (pct) pct.textContent = sentData[i].val + '%';
    });
  }
}

// ── FILTER PERCAKAPAN ─────────────────────────────────────────────
document.querySelectorAll('.pc-filter-btn').forEach((btn) => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.pc-filter-btn').forEach((b) => b.classList.remove('active'));
    this.classList.add('active');
    _renderPcList(_applyActiveFilters(_listCache));
  });
});

// ── SEARCH ────────────────────────────────────────────────────────
document.getElementById('pc-search-input')?.addEventListener('input', function () {
  _renderPcList(_applyActiveFilters(_listCache));
});

// ── CHANNEL FILTER (saat ini cuma ada channel Telegram) ────────────
document.getElementById('pc-channel-select')?.addEventListener('change', function () {
  _renderPcList(_applyActiveFilters(_listCache));
});

// ── HUMAN TAKEOVER ────────────────────────────────────────────────
async function toggleTakeover() {
  if (!_activeContactId) return;
  const current = _conversationsCache[_activeContactId];
  const newHandledBy = current && current.handledBy === 'human' ? 'ai' : 'human';
  try {
    const data = await pcFetch(`/api/telegram/conversations/${_activeContactId}/takeover`, {
      method: 'POST',
      body: JSON.stringify({ handledBy: newHandledBy }),
    });
    _conversationsCache[_activeContactId] = data.conversation;
    const c = _toContactShape(data.conversation);
    _updatePcDetail(c, false);
    _updateColRight(c);
    showToast(newHandledBy === 'human' ? '✓ Percakapan dialihkan ke Anda' : '✓ Percakapan dikembalikan ke AI');
    _loadPcList();
  } catch (err) {
    showToast('⚠ Gagal mengubah status: ' + err.message);
  }
}

// ── TOGGLE AI (tombol kecil di input area — pakai status yang sama dengan takeover) ──
function toggleAI() {
  toggleTakeover();
}

// ── BUAT TIKET ────────────────────────────────────────────────────
function createTicket() { document.getElementById('modal-ticket').style.display = 'flex'; }
function submitTicket() {
  closeModal('modal-ticket');
  showToast('✓ Tiket berhasil dibuat & diteruskan ke agen support');
}

// ── KIRIM INVOICE ─────────────────────────────────────────────────
function sendInvoice() { document.getElementById('modal-invoice').style.display = 'flex'; }
function submitInvoice() {
  closeModal('modal-invoice');
  const conv = _conversationsCache[_activeContactId];
  const body = document.getElementById('pc-chat-body');
  const msg = document.createElement('div');
  msg.className = 'msg bot';
  msg.innerHTML = `
    <div class="msg-bubble" style="background:var(--green-bg);color:var(--green);border:1px solid #b2dfcb">
      <div style="font-weight:600;margin-bottom:4px"><i class="ti ti-receipt" style="font-size:12px"></i> Invoice Terkirim</div>
      <div style="font-size:11px">INV-${new Date().toISOString().slice(0,10).replace(/-/g,'')}-084<br>Dikirim ke ${conv ? pcEscape(conv.name) : 'Customer'} via Telegram</div>
    </div>
    <div class="msg-meta"><span class="ai-label">Sistem</span> Baru saja</div>
  `;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  showToast('✓ Invoice berhasil dikirim (catatan lokal — belum terkirim otomatis ke Telegram)');
}

// ── FOLLOW-UP ─────────────────────────────────────────────────────
function sendFollowup() { showToast('✓ Pengingat follow-up dijadwalkan dalam 2 jam'); }

// ── CEK STOK ─────────────────────────────────────────────────────
function checkStock() { showToast('↗ Mengecek stok...'); }

// ── KIRIM PESAN MANUAL (dikirim beneran ke Telegram) ───────────────
async function sendMsg() {
  const input = document.getElementById('pc-msg-input');
  const text = input.value.trim();
  if (!text || !_activeContactId) return;
  input.value = '';

  const body = document.getElementById('pc-chat-body');
  const now = new Date();
  const optimistic = document.createElement('div');
  optimistic.className = 'msg bot';
  optimistic.innerHTML = `<div class="msg-bubble">${pcEscape(text)}</div><div class="msg-meta"><span class="ai-label">Anda</span> ${pcTimeLabel(now)}</div>`;
  body.appendChild(optimistic);
  body.scrollTop = body.scrollHeight;

  try {
    await pcFetch(`/api/telegram/conversations/${_activeContactId}/send`, {
      method: 'POST',
      body: JSON.stringify({ text }),
    });
    _loadConversationDetail(_activeContactId, true);
    _loadPcList();
  } catch (err) {
    showToast('⚠ Gagal mengirim pesan ke Telegram: ' + err.message);
  }
}
document.getElementById('pc-msg-input')?.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') sendMsg();
});

// ── CLOSE MODAL ──────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('pc-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}