/* ================================================================
   telegram-token.js
   Manajemen Telegram Bot Token — tersimpan di localStorage per user
   Include sebelum </body> di index.html:
     <script src="script_page/telegram-token.js"></script>
   ================================================================ */

const TG_LS_KEY  = 'idt_telegram_bot_token';
const TG_LS_CHAT = 'idt_telegram_chat_id';

// Base URL backend — sama dengan yang dipakai halaman Percakapan, supaya
// token yang disimpan di sini otomatis dipakai server untuk polling Telegram.
const TG_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

// ── READ / WRITE ─────────────────────────────────────────────────
function tgGetToken()  { return localStorage.getItem(TG_LS_KEY)  || ''; }
function tgGetChatId() { return localStorage.getItem(TG_LS_CHAT) || ''; }

function tgSaveToken(token, chatId) {
  localStorage.setItem(TG_LS_KEY,  token.trim());
  localStorage.setItem(TG_LS_CHAT, (chatId || '').trim());
}

function tgClearToken() {
  localStorage.removeItem(TG_LS_KEY);
  localStorage.removeItem(TG_LS_CHAT);
}

// ── KIRIM TOKEN KE BACKEND ───────────────────────────────────────
// Server.js membaca .env, tapi kita bisa override via header / body
// Fungsi ini bisa dipakai saat kirim request ke /api/...
function tgGetHeaders() {
  const token  = tgGetToken();
  const chatId = tgGetChatId();
  const headers = { 'Content-Type': 'application/json' };
  if (token)  headers['X-Telegram-Token']   = token;
  if (chatId) headers['X-Telegram-Chat-Id'] = chatId;
  return headers;
}

// ── SYNC KE BACKEND ───────────────────────────────────────────────
// Mengirim token (dari localStorage) ke server.js supaya server yang
// menjalankan polling Telegram (getUpdates) pakai token ini — bukan dari .env.
async function tgSyncToBackend(token, chatId) {
  try {
    const res  = await fetch(`${TG_API_BASE}/api/telegram/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, chatId }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Gagal menyimpan token ke server' };
    return { ok: true, bot: data.bot };
  } catch (e) {
    return { ok: false, error: 'Backend tidak bisa dihubungi (pastikan npm start sudah jalan)' };
  }
}

// Dipanggil sekali saat halaman dimuat: kalau sudah ada token tersimpan di
// browser ini, kirim ulang ke backend (server bisa saja baru saja restart
// dan kehilangan token yang sebelumnya cuma tersimpan in-memory).
async function tgAutoSyncOnLoad() {
  const token = tgGetToken();
  if (!token) return;
  await tgSyncToBackend(token, tgGetChatId());
}

// ── TEST CONNECTION ───────────────────────────────────────────────
async function tgTestConnection(token) {
  if (!token) return { ok: false, error: 'Token kosong' };
  try {
    const res  = await fetch(`https://api.telegram.org/bot${token}/getMe`);
    const data = await res.json();
    if (data.ok) return { ok: true, name: data.result.first_name, username: data.result.username };
    return { ok: false, error: data.description || 'Token tidak valid' };
  } catch (e) {
    return { ok: false, error: 'Gagal terhubung — periksa koneksi internet' };
  }
}

// ── MODAL OPEN / CLOSE ────────────────────────────────────────────
function tgOpenModal() {
  const modal = document.getElementById('tg-token-modal');
  if (!modal) return;

  // Populate fields dari localStorage
  const token  = tgGetToken();
  const chatId = tgGetChatId();

  const inp    = document.getElementById('tg-input-token');
  const inpCh  = document.getElementById('tg-input-chatid');
  if (inp)   inp.value   = token;
  if (inpCh) inpCh.value = chatId;

  // Reset UI state
  tgSetStatus('idle');

  // Show save or reset button state
  tgUpdateSavedBadge();

  modal.style.display = 'flex';
  if (inp) setTimeout(() => inp.focus(), 80);
}

function tgCloseModal() {
  const modal = document.getElementById('tg-token-modal');
  if (modal) modal.style.display = 'none';
}

// ── UI HELPERS ────────────────────────────────────────────────────
function tgSetStatus(state, message) {
  const el = document.getElementById('tg-status-row');
  if (!el) return;

  const states = {
    idle:    { icon: '', text: '', cls: '' },
    testing: { icon: '⏳', text: 'Mengecek token…', cls: 'tg-status-testing' },
    ok:      { icon: '✓', text: message || 'Bot terhubung!', cls: 'tg-status-ok' },
    error:   { icon: '✕', text: message || 'Token tidak valid', cls: 'tg-status-error' },
  };

  const s = states[state] || states.idle;
  el.className = 'tg-status-row ' + s.cls;
  el.innerHTML = s.text ? `<span class="tg-status-icon">${s.icon}</span><span>${s.text}</span>` : '';
}

function tgUpdateSavedBadge() {
  const badge = document.getElementById('tg-saved-badge');
  const resetBtn = document.getElementById('tg-reset-btn');
  const token = tgGetToken();
  if (badge) {
    badge.style.display = token ? 'flex' : 'none';
    badge.textContent   = token ? '● Token Tersimpan' : '';
  }
  if (resetBtn) resetBtn.style.display = token ? 'inline-flex' : 'none';
}

// ── ACTIONS ───────────────────────────────────────────────────────
async function tgHandleTest() {
  const token = (document.getElementById('tg-input-token')?.value || '').trim();
  if (!token) { tgSetStatus('error', 'Masukkan token terlebih dahulu'); return; }

  const testBtn = document.getElementById('tg-test-btn');
  if (testBtn) { testBtn.disabled = true; testBtn.textContent = 'Mengecek…'; }
  tgSetStatus('testing');

  const result = await tgTestConnection(token);

  if (testBtn) { testBtn.disabled = false; testBtn.textContent = 'Test Koneksi'; }

  if (result.ok) {
    tgSetStatus('ok', `✓ Bot: @${result.username} — ${result.name}`);
  } else {
    tgSetStatus('error', result.error);
  }
}

async function tgHandleSave() {
  const token  = (document.getElementById('tg-input-token')?.value  || '').trim();
  const chatId = (document.getElementById('tg-input-chatid')?.value || '').trim();

  if (!token) { tgSetStatus('error', 'Token tidak boleh kosong'); return; }

  const saveBtn = document.querySelector('#tg-token-modal .tg-btn-primary');
  if (saveBtn) saveBtn.disabled = true;
  tgSetStatus('testing', 'Memvalidasi & menyimpan token…');

  const result = await tgSyncToBackend(token, chatId);

  if (saveBtn) saveBtn.disabled = false;

  if (!result.ok) {
    tgSetStatus('error', result.error);
    return;
  }

  // Baru simpan ke localStorage kalau backend sudah mengonfirmasi token valid.
  tgSaveToken(token, chatId);
  tgUpdateSavedBadge();
  const botLabel = result.bot ? ` — @${result.bot.username}` : '';
  tgSetStatus('ok', `Token tersimpan & bot aktif${botLabel}`);

  // Update kartu integrasi jika ada
  tgSyncIntegrasiCard();

  setTimeout(tgCloseModal, 1200);
}

async function tgHandleReset() {
  if (!confirm('Hapus token Telegram yang tersimpan di browser ini dan di server?')) return;

  try {
    await fetch(`${TG_API_BASE}/api/telegram/config`, { method: 'DELETE' });
  } catch (e) {
    // Backend mungkin sedang tidak aktif — tetap lanjut hapus token lokal.
  }

  tgClearToken();
  tgUpdateSavedBadge();
  tgSetStatus('idle');
  const inp   = document.getElementById('tg-input-token');
  const inpCh = document.getElementById('tg-input-chatid');
  if (inp)   inp.value   = '';
  if (inpCh) inpCh.value = '';
  tgSyncIntegrasiCard();
}

// ── SYNC ke kartu integrasi (jika ada) ───────────────────────────
function tgSyncIntegrasiCard() {
  // Misal integrasi.js punya igRefresh atau igRender — panggil jika ada
  if (typeof igRender === 'function') igRender();
}

// ── TOGGLE VISIBILITY ─────────────────────────────────────────────
function tgToggleVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>`;
}

// ── COPY TOKEN ────────────────────────────────────────────────────
async function tgCopyToken() {
  const token = tgGetToken();
  if (!token) return;
  try {
    await navigator.clipboard.writeText(token);
    const btn = document.getElementById('tg-copy-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Disalin';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    }
  } catch(e) { window.prompt('Salin token:', token); }
}

// ── AUTO-EXPOSE ke window (bisa dipanggil dari integrasi.js) ─────
window.tgOpenModal    = tgOpenModal;
window.tgGetToken     = tgGetToken;
window.tgGetChatId    = tgGetChatId;
window.tgGetHeaders   = tgGetHeaders;
window.tgSaveToken    = tgSaveToken;
window.tgClearToken   = tgClearToken;
window.tgSyncToBackend = tgSyncToBackend;

// ── AUTO-SYNC SAAT HALAMAN DIMUAT ──────────────────────────────────
// Kalau browser ini sudah punya token tersimpan, kirim ulang ke backend
// supaya server langsung siap (misal setelah server.js baru saja restart).
document.addEventListener('DOMContentLoaded', () => {
  tgAutoSyncOnLoad();
});