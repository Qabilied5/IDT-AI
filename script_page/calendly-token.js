/* ================================================================
   calendly-token.js
   Manajemen kredensial Calendly — tersimpan di localStorage per user,
   sejajar dengan telegram-token.js dan waba-token.js.

   Beda dari 2 file itu: modal konfigurasi di sini dibuat DINAMIS lewat JS
   (bukan markup statis di index.html) — supaya file ini bisa langsung
   dipakai tanpa perlu edit index.html sama sekali.

   Include sebelum </body> di index.html:
     <script src="script_page/calendly-token.js"></script>
   ================================================================ */

const CY_LS_TOKEN    = 'idt_calendly_token';
const CY_LS_EVENTURI = 'idt_calendly_event_type_uri';

const CY_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

// ── READ / WRITE ─────────────────────────────────────────────────
function cyGetToken()    { return localStorage.getItem(CY_LS_TOKEN)    || ''; }
function cyGetEventUri() { return localStorage.getItem(CY_LS_EVENTURI) || ''; }

function cySaveConfig(token, eventTypeUri) {
  localStorage.setItem(CY_LS_TOKEN, token.trim());
  localStorage.setItem(CY_LS_EVENTURI, (eventTypeUri || '').trim());
}
function cyClearConfig() {
  localStorage.removeItem(CY_LS_TOKEN);
  localStorage.removeItem(CY_LS_EVENTURI);
}

// ── SYNC KE BACKEND ───────────────────────────────────────────────
// Mengirim kredensial (dari localStorage) ke server.js supaya server yang
// memanggil Calendly API (cek ketersediaan, buat scheduling link) pakai
// kredensial ini — bukan dari .env.
async function cySyncToBackend(token, eventTypeUri) {
  try {
    const res = await fetch(`${CY_API_BASE}/api/calendly/config`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, eventTypeUri }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || !data.ok) return { ok: false, error: data.error || 'Gagal menyimpan kredensial ke server' };
    return { ok: true, user: data.user };
  } catch (e) {
    return { ok: false, error: 'Backend tidak bisa dihubungi (pastikan npm start sudah jalan)' };
  }
}

async function cyAutoSyncOnLoad() {
  const token = cyGetToken();
  if (!token) return;
  await cySyncToBackend(token, cyGetEventUri());
}

// ── TEST CONNECTION ───────────────────────────────────────────────
// Calendly API dites dengan GET /users/me pakai Personal Access Token
// sebagai Bearer token — mirip cara test WABA (GET Phone Number ID).
async function cyTestConnection(token) {
  if (!token) return { ok: false, error: 'Personal Access Token kosong' };
  try {
    const res = await fetch('https://api.calendly.com/users/me', {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (res.ok && data.resource) {
      return { ok: true, name: data.resource.name, email: data.resource.email, uri: data.resource.uri };
    }
    return { ok: false, error: (data.message || data.title) || 'Token tidak valid' };
  } catch (e) {
    return { ok: false, error: 'Gagal terhubung — periksa koneksi internet' };
  }
}

// ── MODAL (dibuat dinamis, tidak butuh markup di index.html) ───────
function cyBuildModal() {
  if (document.getElementById('cy-token-modal')) return;

  const overlay = document.createElement('div');
  overlay.id = 'cy-token-modal';
  overlay.className = 'pc-modal-overlay'; // reuse class overlay yang sudah ada (percakapan.css)
  overlay.style.display = 'none';
  overlay.onclick = (e) => { if (e.target === overlay) cyCloseModal(); };
  overlay.innerHTML = `
    <div class="pc-modal" style="max-width:460px">
      <div class="pc-modal-header">
        <div class="pc-modal-title"><i class="ti ti-calendar-event" style="color:var(--red)"></i> Konfigurasi Calendly</div>
        <button class="pc-modal-close" onclick="cyCloseModal()"><i class="ti ti-x"></i></button>
      </div>
      <div class="pc-modal-body" style="display:flex;flex-direction:column;gap:10px">
        <div style="font-size:11px;color:var(--gray-400);background:var(--gray-50);border-radius:8px;padding:10px">
          Ambil dari <strong>calendly.com/integrations/api_webhooks</strong> → buat
          <strong>Personal Access Token</strong> baru. Event Type URI didapat dari
          Calendly API (<code>GET /event_types</code>) atau link event kamu.
        </div>
        <div>
          <label class="pc-field-label">Personal Access Token <span style="color:var(--red)">*</span></label>
          <div style="display:flex;gap:6px">
            <input class="pc-field-input" type="password" id="cy-input-token" placeholder="eyJraWQiOi..." style="flex:1">
            <button type="button" class="pc-btn-ghost" onclick="cyToggleVisibility()" id="cy-toggle-btn" title="Lihat/sembunyikan"><i class="ti ti-eye"></i></button>
          </div>
        </div>
        <div>
          <label class="pc-field-label">Event Type URI <span style="color:var(--gray-400)">(opsional, bisa diisi belakangan)</span></label>
          <input class="pc-field-input" type="text" id="cy-input-eventuri" placeholder="https://api.calendly.com/event_types/xxxxxxxx">
        </div>
        <div id="cy-status-row" style="font-size:12px;min-height:16px"></div>
        <div id="cy-saved-badge" style="display:none;font-size:11px;color:var(--green);font-weight:600">● Kredensial Tersimpan</div>
      </div>
      <div class="pc-modal-footer">
        <button class="pc-btn-ghost" id="cy-reset-btn" style="display:none;color:var(--red);border-color:var(--red)" onclick="cyHandleReset()">Hapus Kredensial</button>
        <button class="pc-btn-ghost" onclick="cyHandleTest()" id="cy-test-btn">Test Koneksi</button>
        <button class="pc-btn-primary" onclick="cyHandleSave()"><i class="ti ti-check"></i> Simpan</button>
      </div>
    </div>`;
  document.body.appendChild(overlay);
}

function cyOpenModal() {
  cyBuildModal();
  const token = cyGetToken();
  const uri = cyGetEventUri();

  document.getElementById('cy-input-token').value = token;
  document.getElementById('cy-input-eventuri').value = uri;
  cySetStatus('idle');
  cyUpdateSavedBadge();

  document.getElementById('cy-token-modal').style.display = 'flex';
  setTimeout(() => document.getElementById('cy-input-token')?.focus(), 80);
}
function cyCloseModal() {
  const el = document.getElementById('cy-token-modal');
  if (el) el.style.display = 'none';
}

function cySetStatus(state, message) {
  const el = document.getElementById('cy-status-row');
  if (!el) return;
  const states = {
    idle:    { text: '', color: '' },
    testing: { text: '⏳ Mengecek kredensial…', color: 'var(--gray-400)' },
    ok:      { text: '✓ ' + (message || 'Terhubung!'), color: 'var(--green)' },
    error:   { text: '✕ ' + (message || 'Kredensial tidak valid'), color: 'var(--red)' },
  };
  const s = states[state] || states.idle;
  el.textContent = s.text;
  el.style.color = s.color;
}

function cyUpdateSavedBadge() {
  const badge = document.getElementById('cy-saved-badge');
  const resetBtn = document.getElementById('cy-reset-btn');
  const configured = !!cyGetToken();
  if (badge) badge.style.display = configured ? 'block' : 'none';
  if (resetBtn) resetBtn.style.display = configured ? 'inline-flex' : 'none';
}

function cyToggleVisibility() {
  const input = document.getElementById('cy-input-token');
  if (!input) return;
  input.type = input.type === 'password' ? 'text' : 'password';
}

async function cyHandleTest() {
  const token = (document.getElementById('cy-input-token')?.value || '').trim();
  if (!token) { cySetStatus('error', 'Isi Personal Access Token terlebih dahulu'); return; }

  const btn = document.getElementById('cy-test-btn');
  if (btn) { btn.disabled = true; btn.textContent = 'Mengecek…'; }
  cySetStatus('testing');

  const result = await cyTestConnection(token);

  if (btn) { btn.disabled = false; btn.textContent = 'Test Koneksi'; }
  if (result.ok) cySetStatus('ok', `${result.name} (${result.email})`);
  else cySetStatus('error', result.error);
}

async function cyHandleSave() {
  const token = (document.getElementById('cy-input-token')?.value || '').trim();
  const eventUri = (document.getElementById('cy-input-eventuri')?.value || '').trim();
  if (!token) { cySetStatus('error', 'Personal Access Token tidak boleh kosong'); return; }

  cySetStatus('testing', 'Memvalidasi & menyimpan kredensial…');
  const result = await cySyncToBackend(token, eventUri);

  if (!result.ok) { cySetStatus('error', result.error); return; }

  cySaveConfig(token, eventUri);
  cyUpdateSavedBadge();
  cySetStatus('ok', `Kredensial tersimpan${result.user ? ' — ' + result.user.name : ''}`);
  cySyncIntegrasiCard();
  setTimeout(cyCloseModal, 1200);
}

async function cyHandleReset() {
  if (!confirm('Hapus kredensial Calendly yang tersimpan di browser ini dan di server?')) return;
  try {
    await fetch(`${CY_API_BASE}/api/calendly/config`, { method: 'DELETE' });
  } catch (e) { /* backend mungkin tidak aktif — tetap lanjut hapus lokal */ }

  cyClearConfig();
  cyUpdateSavedBadge();
  cySetStatus('idle');
  document.getElementById('cy-input-token').value = '';
  document.getElementById('cy-input-eventuri').value = '';
  cySyncIntegrasiCard();
}

function cySyncIntegrasiCard() {
  if (typeof igRender === 'function') igRender();
}

// ── AUTO-EXPOSE ────────────────────────────────────────────────────
window.cyOpenModal     = cyOpenModal;
window.cyGetToken      = cyGetToken;
window.cyGetEventUri   = cyGetEventUri;
window.cySyncToBackend = cySyncToBackend;

document.addEventListener('DOMContentLoaded', () => {
  cyAutoSyncOnLoad();
});