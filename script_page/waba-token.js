/* ================================================================
   waba-token.js
   Manajemen kredensial WhatsApp Business API (WABA / WhatsApp Cloud API
   dari Meta) — tersimpan di localStorage per user, sejajar dengan
   telegram-token.js.
   Include sebelum </body> di index.html:
     <script src="script_page/waba-token.js"></script>
   ================================================================ */

const WB_LS_TOKEN   = 'idt_waba_access_token';
const WB_LS_PHONEID = 'idt_waba_phone_number_id';
const WB_LS_WABAID  = 'idt_waba_business_account_id';
const WB_LS_VERIFY  = 'idt_waba_verify_token';

// Base URL backend — sama dengan yang dipakai integrasi Telegram, supaya
// kredensial yang disimpan di sini otomatis dipakai server.js.
const WB_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

// ── READ / WRITE ─────────────────────────────────────────────────
function wbGetToken()      { return localStorage.getItem(WB_LS_TOKEN)   || ''; }
function wbGetPhoneId()    { return localStorage.getItem(WB_LS_PHONEID) || ''; }
function wbGetWabaId()     { return localStorage.getItem(WB_LS_WABAID)  || ''; }
function wbGetVerifyToken(){ return localStorage.getItem(WB_LS_VERIFY)  || ''; }

function wbSaveConfig(token, phoneNumberId, businessAccountId, verifyToken) {
  localStorage.setItem(WB_LS_TOKEN,   token.trim());
  localStorage.setItem(WB_LS_PHONEID, (phoneNumberId || '').trim());
  localStorage.setItem(WB_LS_WABAID,  (businessAccountId || '').trim());
  if (verifyToken) localStorage.setItem(WB_LS_VERIFY, verifyToken.trim());
}

function wbClearConfig() {
  localStorage.removeItem(WB_LS_TOKEN);
  localStorage.removeItem(WB_LS_PHONEID);
  localStorage.removeItem(WB_LS_WABAID);
  localStorage.removeItem(WB_LS_VERIFY);
}

// ── HEADERS UTK REQUEST LAIN (kalau dibutuhkan endpoint lain) ────
function wbGetHeaders() {
  const token = wbGetToken();
  const phoneId = wbGetPhoneId();
  const headers = { 'Content-Type': 'application/json' };
  if (token)   headers['X-WABA-Token']    = token;
  if (phoneId) headers['X-WABA-Phone-Id'] = phoneId;
  return headers;
}

// ── SYNC KE BACKEND ───────────────────────────────────────────────
// Mengirim kredensial (dari localStorage) ke server.js supaya server yang
// mengirim/menerima pesan WhatsApp pakai kredensial ini — bukan dari .env.
async function wbSyncToBackend(token, phoneNumberId, businessAccountId, verifyToken) {
  try {
    const res = await fetch(`${WB_API_BASE}/api/waba/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        token,
        phoneNumberId,
        businessAccountId,
        verifyToken,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Gagal menyimpan kredensial ke server' };
    return { ok: true, bot: data.bot };
  } catch (e) {
    return { ok: false, error: 'Backend tidak bisa dihubungi (pastikan npm start sudah jalan)' };
  }
}

// Dipanggil sekali saat halaman dimuat: kalau sudah ada kredensial tersimpan
// di browser ini, kirim ulang ke backend (server bisa saja baru saja restart
// dan kehilangan kredensial yang sebelumnya cuma tersimpan in-memory).
async function wbAutoSyncOnLoad() {
  const token = wbGetToken();
  const phoneId = wbGetPhoneId();
  if (!token || !phoneId) return;
  await wbSyncToBackend(token, phoneId, wbGetWabaId(), wbGetVerifyToken());
}

// ── TEST CONNECTION ───────────────────────────────────────────────
// Beda dengan Telegram (getMe), WhatsApp Cloud API dites dengan GET ke
// endpoint Phone Number ID itu sendiri (fields display_phone_number &
// verified_name) memakai Access Token sebagai Bearer token.
async function wbTestConnection(token, phoneNumberId) {
  if (!token)         return { ok: false, error: 'Access Token kosong' };
  if (!phoneNumberId) return { ok: false, error: 'Phone Number ID kosong' };
  try {
    const url = `https://graph.facebook.com/v20.0/${phoneNumberId}?fields=display_phone_number,verified_name`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const data = await res.json();
    if (!data.error) {
      return { ok: true, name: data.verified_name, phone: data.display_phone_number };
    }
    return { ok: false, error: (data.error && data.error.message) || 'Kredensial tidak valid' };
  } catch (e) {
    return { ok: false, error: 'Gagal terhubung — periksa koneksi internet' };
  }
}

// ── MODAL OPEN / CLOSE ────────────────────────────────────────────
function wbOpenModal() {
  const modal = document.getElementById('wb-token-modal');
  if (!modal) return;

  const token   = wbGetToken();
  const phoneId = wbGetPhoneId();
  const wabaId  = wbGetWabaId();
  const verify  = wbGetVerifyToken();

  const inpToken  = document.getElementById('wb-input-token');
  const inpPhone  = document.getElementById('wb-input-phoneid');
  const inpWaba   = document.getElementById('wb-input-wabaid');
  const inpVerify = document.getElementById('wb-input-verify');
  if (inpToken)  inpToken.value  = token;
  if (inpPhone)  inpPhone.value  = phoneId;
  if (inpWaba)   inpWaba.value   = wabaId;
  if (inpVerify) inpVerify.value = verify;

  wbSetStatus('idle');
  wbUpdateSavedBadge();
  wbUpdateWebhookUrl();

  modal.style.display = 'flex';
  if (inpToken) setTimeout(() => inpToken.focus(), 80);
}

function wbCloseModal() {
  const modal = document.getElementById('wb-token-modal');
  if (modal) modal.style.display = 'none';
}

// ── UI HELPERS ────────────────────────────────────────────────────
function wbSetStatus(state, message) {
  const el = document.getElementById('wb-status-row');
  if (!el) return;

  const states = {
    idle:    { icon: '', text: '', cls: '' },
    testing: { icon: '⏳', text: 'Mengecek kredensial…', cls: 'wb-status-testing' },
    ok:      { icon: '✓', text: message || 'Nomor WhatsApp terhubung!', cls: 'wb-status-ok' },
    error:   { icon: '✕', text: message || 'Kredensial tidak valid', cls: 'wb-status-error' },
  };

  const s = states[state] || states.idle;
  el.className = 'wb-status-row ' + s.cls;
  el.innerHTML = s.text ? `<span class="wb-status-icon">${s.icon}</span><span>${s.text}</span>` : '';
}

function wbUpdateSavedBadge() {
  const badge = document.getElementById('wb-saved-badge');
  const resetBtn = document.getElementById('wb-reset-btn');
  const configured = wbGetToken() && wbGetPhoneId();
  if (badge) {
    badge.style.display = configured ? 'flex' : 'none';
    badge.textContent    = configured ? '● Kredensial Tersimpan' : '';
  }
  if (resetBtn) resetBtn.style.display = configured ? 'inline-flex' : 'none';
}

// Menampilkan URL webhook yang harus didaftarkan di Meta App Dashboard >
// WhatsApp > Configuration > Webhook. Nilai WB_API_BASE di sini biasanya
// localhost saat development — pengguna perlu menggantinya dengan URL
// tunnel publik (ngrok/cloudflared) atau domain production saat submit ke
// Meta, karena Meta tidak bisa mengakses localhost.
function wbUpdateWebhookUrl() {
  const el = document.getElementById('wb-webhook-url');
  if (el) el.textContent = `${WB_API_BASE}/api/waba/webhook`;
}

// ── ACTIONS ───────────────────────────────────────────────────────
async function wbHandleTest() {
  const token   = (document.getElementById('wb-input-token')?.value   || '').trim();
  const phoneId = (document.getElementById('wb-input-phoneid')?.value || '').trim();
  if (!token || !phoneId) { wbSetStatus('error', 'Isi Access Token & Phone Number ID terlebih dahulu'); return; }

  const testBtn = document.getElementById('wb-test-btn');
  if (testBtn) { testBtn.disabled = true; testBtn.textContent = 'Mengecek…'; }
  wbSetStatus('testing');

  const result = await wbTestConnection(token, phoneId);

  if (testBtn) { testBtn.disabled = false; testBtn.textContent = 'Test Koneksi'; }

  if (result.ok) {
    wbSetStatus('ok', `✓ ${result.name || 'Bot WhatsApp'} — ${result.phone || phoneId}`);
  } else {
    wbSetStatus('error', result.error);
  }
}

async function wbHandleSave() {
  const token   = (document.getElementById('wb-input-token')?.value    || '').trim();
  const phoneId = (document.getElementById('wb-input-phoneid')?.value  || '').trim();
  const wabaId  = (document.getElementById('wb-input-wabaid')?.value   || '').trim();
  const verify  = (document.getElementById('wb-input-verify')?.value   || '').trim();

  if (!token)   { wbSetStatus('error', 'Access Token tidak boleh kosong');   return; }
  if (!phoneId) { wbSetStatus('error', 'Phone Number ID tidak boleh kosong'); return; }

  const saveBtn = document.querySelector('#wb-token-modal .wb-btn-primary');
  if (saveBtn) saveBtn.disabled = true;
  wbSetStatus('testing', 'Memvalidasi & menyimpan kredensial…');

  const result = await wbSyncToBackend(token, phoneId, wabaId, verify);

  if (saveBtn) saveBtn.disabled = false;

  if (!result.ok) {
    wbSetStatus('error', result.error);
    return;
  }

  // Baru simpan ke localStorage kalau backend sudah mengonfirmasi kredensial valid.
  wbSaveConfig(token, phoneId, wabaId, verify);
  wbUpdateSavedBadge();
  const botLabel = result.bot && result.bot.verified_name ? ` — ${result.bot.verified_name}` : '';
  wbSetStatus('ok', `Kredensial tersimpan & nomor aktif${botLabel}`);

  wbSyncIntegrasiCard();

  setTimeout(wbCloseModal, 1200);
}

async function wbHandleReset() {
  if (!confirm('Hapus kredensial WhatsApp Business API yang tersimpan di browser ini dan di server?')) return;

  try {
    await fetch(`${WB_API_BASE}/api/waba/config`, { method: 'DELETE' });
  } catch (e) {
    // Backend mungkin sedang tidak aktif — tetap lanjut hapus kredensial lokal.
  }

  wbClearConfig();
  wbUpdateSavedBadge();
  wbSetStatus('idle');
  const ids = ['wb-input-token', 'wb-input-phoneid', 'wb-input-wabaid', 'wb-input-verify'];
  ids.forEach((id) => { const inp = document.getElementById(id); if (inp) inp.value = ''; });
  wbSyncIntegrasiCard();
}

// ── SYNC ke kartu integrasi (jika ada) ───────────────────────────
function wbSyncIntegrasiCard() {
  if (typeof igRender === 'function') igRender();
}

// ── TOGGLE VISIBILITY (Access Token) ──────────────────────────────
function wbToggleVisibility(inputId, btn) {
  const input = document.getElementById(inputId);
  if (!input) return;
  const isHidden = input.type === 'password';
  input.type = isHidden ? 'text' : 'password';
  btn.innerHTML = isHidden
    ? `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/><line x1="2" y1="2" x2="14" y2="14" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"/></svg>`
    : `<svg width="14" height="14" viewBox="0 0 16 16" fill="none"><path d="M1 8s2.5-5 7-5 7 5 7 5-2.5 5-7 5-7-5-7-5Z" stroke="currentColor" stroke-width="1.4"/><circle cx="8" cy="8" r="2" stroke="currentColor" stroke-width="1.4"/></svg>`;
}

// ── COPY (Access Token / Webhook URL) ─────────────────────────────
async function wbCopyToken() {
  const token = wbGetToken();
  if (!token) return;
  try {
    await navigator.clipboard.writeText(token);
    const btn = document.getElementById('wb-copy-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Disalin';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    }
  } catch (e) { window.prompt('Salin token:', token); }
}

async function wbCopyWebhookUrl() {
  const url = `${WB_API_BASE}/api/waba/webhook`;
  try {
    await navigator.clipboard.writeText(url);
    const btn = document.getElementById('wb-copy-webhook-btn');
    if (btn) {
      const orig = btn.innerHTML;
      btn.innerHTML = '✓ Disalin';
      setTimeout(() => { btn.innerHTML = orig; }, 1500);
    }
  } catch (e) { window.prompt('Salin URL webhook:', url); }
}

// ── AUTO-EXPOSE ke window (bisa dipanggil dari integrasi.js) ─────
window.wbOpenModal      = wbOpenModal;
window.wbGetToken       = wbGetToken;
window.wbGetPhoneId     = wbGetPhoneId;
window.wbGetWabaId      = wbGetWabaId;
window.wbGetHeaders     = wbGetHeaders;
window.wbSaveConfig     = wbSaveConfig;
window.wbClearConfig    = wbClearConfig;
window.wbSyncToBackend  = wbSyncToBackend;

// ── AUTO-SYNC SAAT HALAMAN DIMUAT ──────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  wbAutoSyncOnLoad();
});