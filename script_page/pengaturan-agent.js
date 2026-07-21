/* ===================================
   pengaturan-agent.js — Indotrading AI
   Pengaturan Agent Page Logic
   =================================== */

// ── State ─────────────────────────────────────────────────────
const paState = {
  activeSection: 'persona',
  selectedTone: 'santai',
  dirtyFields: new Set(),
  // Data PIC/agent TIDAK di-hardcode lagi di sini — dimuat dari backend
  // (GET /api/agents) saat halaman dibuka lewat loadAgentsFromServer().
  // Tetap kosong sampai user benar-benar menambahkan PIC lewat modal
  // "Undang Agent Baru", supaya tidak ada data dummy/contoh yang salah kaprah
  // muncul di dropdown "Ambil Alih" pada halaman Percakapan.
  agents: [],
  brands: [
    { id:1, name:'Indotrading B2B',    cat:'Platform Utama',   color:'#c8102e', abbr:'IT', conv:1284, agents:3, active: true  },
    { id:2, name:'Indotrading Mesin',  cat:'Industri Mesin',   color:'#1d4ed8', abbr:'IM', conv:342,  agents:2, active: false },
    { id:3, name:'Indotrading Kimia',  cat:'Bahan Kimia',      color:'#15803d', abbr:'IK', conv:189,  agents:1, active: false },
  ],
  keywords: ['komplain', 'refund', 'rusak', 'tidak terima', 'salah kirim'],
  jadwal: [
    { id:1, hari:'Senin – Jumat', mulai:'08:00', selesai:'17:00', aktif:true  },
    { id:2, hari:'Sabtu',         mulai:'09:00', selesai:'14:00', aktif:true  },
    { id:3, hari:'Minggu',        mulai:'00:00', selesai:'00:00', aktif:false },
  ],
};

// ── API base — sama dengan yang dipakai integrasi Telegram/WABA ─
const PA_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

async function paFetch(path, opts) {
  const res = await fetch(`${PA_API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...opts,
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok || data.ok === false) throw new Error(data.error || `Request gagal (${res.status})`);
  return data;
}

async function loadAgentsFromServer() {
  try {
    const data = await paFetch('/api/agents');
    paState.agents = data.agents || [];
    renderAgentTable();
  } catch (e) {
    console.error('Gagal memuat daftar PIC/Agent:', e);
    paShowToast('Tidak bisa terhubung ke backend — pastikan server.js jalan', 'error');
  }
}

// ── Init ──────────────────────────────────────────────────────
function initPengaturanAgent() {
  loadAgentsFromServer();
  renderBrandCards();
  renderKeywordTags();
  renderJadwalRows();
  updatePreviewBubble();
  bindPaNav();
  bindPaFormEvents();
  showPaSection(paState.activeSection);
}

// ── Navigasi sidebar ──────────────────────────────────────────
function bindPaNav() {
  document.querySelectorAll('.pa-nav-item[data-section]').forEach(item => {
    item.addEventListener('click', () => {
      const sec = item.dataset.section;
      showPaSection(sec);
    });
  });
}

function showPaSection(sectionId) {
  paState.activeSection = sectionId;

  // Update nav active
  document.querySelectorAll('.pa-nav-item[data-section]').forEach(item => {
    item.classList.toggle('active', item.dataset.section === sectionId);
  });

  // Show/hide sections
  document.querySelectorAll('.pa-section').forEach(sec => {
    sec.style.display = sec.id === 'pa-sec-' + sectionId ? 'flex' : 'none';
  });
}

// ── Tone/persona pills ────────────────────────────────────────
function selectTone(el, tone) {
  document.querySelectorAll('.pa-tone-pill').forEach(p => p.classList.remove('selected'));
  el.classList.add('selected');
  paState.selectedTone = tone;
  updatePreviewBubble();
  markDirty('tone');
}

// ── Preview bubble ────────────────────────────────────────────
const PREVIEW_MESSAGES = {
  formal: 'Selamat pagi. Terima kasih telah menghubungi Indotrading. Dengan senang hati kami siap membantu kebutuhan Anda. Mohon dapat menyampaikan pertanyaan Anda.',
  santai: 'Halo! Makasih udah hubungi Indotrading 😊 Ada yang bisa kami bantu hari ini? Langsung aja ceritain kebutuhannya ya!',
  industri: 'Selamat datang di Indotrading Industrial. Kami siap membantu pencarian material, spare part, dan peralatan industri. Silakan informasikan spesifikasi kebutuhan Anda.',
  custom: 'Halo Mitra! Selamat datang. Silakan sampaikan kebutuhan bisnis Anda dan tim kami akan segera merespons.',
};

function updatePreviewBubble() {
  const nameEl = document.getElementById('pa-agent-name-val');
  const bubbleEl = document.getElementById('pa-preview-text');
  if (!bubbleEl) return;
  const name = document.getElementById('pa-agent-name')?.value || 'IndoTrading AI';
  if (nameEl) nameEl.textContent = name;
  bubbleEl.textContent = PREVIEW_MESSAGES[paState.selectedTone] || PREVIEW_MESSAGES.santai;
}

// ── Char count ────────────────────────────────────────────────
function paCharCount(inputEl, countEl, max) {
  const el = document.getElementById(inputEl);
  const cEl = document.getElementById(countEl);
  if (!el || !cEl) return;
  const update = () => {
    const len = el.value.length;
    cEl.textContent = `${len}/${max}`;
    cEl.parentElement.className = 'pa-char-row' + (len > max * 0.9 ? (len > max ? ' over' : ' warn') : '');
  };
  el.addEventListener('input', update);
  update();
}

// ── Render agent table ────────────────────────────────────────
function renderAgentTable() {
  const tbody = document.getElementById('pa-agent-tbody');
  if (!tbody) return;

  const roleLabel = { superadmin: 'Super Admin', admin: 'Admin', agent: 'Agent', viewer: 'Viewer' };
  const roleClass = { superadmin: 'pa-role-superadmin', admin: 'pa-role-admin', agent: 'pa-role-agent', viewer: 'pa-role-viewer' };
  const statusLabel = { online: 'Online', offline: 'Offline', busy: 'Sibuk' };

  tbody.innerHTML = paState.agents.map(a => `
    <tr>
      <td>
        <div class="pa-agent-name-cell">
          <div class="pa-agent-av">${a.initials}</div>
          <div>
            <div class="pa-agent-name">${a.nama}</div>
            <div class="pa-agent-email">${a.email}</div>
          </div>
        </div>
      </td>
      <td><span class="pa-role-badge ${roleClass[a.role]}">${roleLabel[a.role]}</span></td>
      <td>
        <span class="pa-status-pill ${a.status}">
          <span class="dot"></span>${statusLabel[a.status]}
        </span>
      </td>
      <td style="color:var(--gray-600);font-size:12px">${a.chat > 0 ? a.chat + ' percakapan' : '—'}</td>
      <td>
        <div style="display:flex;gap:6px">
          <button class="pa-btn pa-btn-ghost pa-btn-sm" onclick="openEditAgentModal(${a.id})">
            <i class="ti ti-edit"></i> Edit
          </button>
          ${a.role !== 'superadmin' ? `<button class="pa-btn pa-btn-danger pa-btn-sm" onclick="removeAgent(${a.id})"><i class="ti ti-trash"></i></button>` : ''}
        </div>
      </td>
    </tr>
  `).join('');
}

// ── Render brand cards ────────────────────────────────────────
function renderBrandCards() {
  const grid = document.getElementById('pa-brand-grid');
  if (!grid) return;

  const brandCards = paState.brands.map(b => `
    <div class="pa-brand-card ${b.active ? 'active-brand' : ''}" onclick="selectBrand(${b.id})">
      <div class="pa-brand-card-top" style="background:${b.color}"></div>
      <div class="pa-brand-card-body">
        <div class="pa-brand-card-head">
          <div style="display:flex;align-items:center;gap:9px">
            <div class="pa-brand-logo" style="background:${b.color}">${b.abbr}</div>
            <div>
              <div class="pa-brand-name">${b.name}</div>
              <div class="pa-brand-cat">${b.cat}</div>
            </div>
          </div>
          <button class="pa-btn pa-btn-ghost pa-btn-sm" onclick="event.stopPropagation();openBrandModal(${b.id})">
            <i class="ti ti-settings"></i>
          </button>
        </div>
        <div class="pa-brand-stats">
          <div class="pa-brand-stat">
            <div class="pa-brand-stat-val">${b.conv.toLocaleString('id-ID')}</div>
            <div class="pa-brand-stat-lbl">Percakapan</div>
          </div>
          <div class="pa-brand-stat">
            <div class="pa-brand-stat-val">${b.agents}</div>
            <div class="pa-brand-stat-lbl">Agent</div>
          </div>
        </div>
      </div>
    </div>
  `).join('');

  grid.innerHTML = brandCards + `
    <div class="pa-brand-add-card" onclick="openAddBrandModal()">
      <i class="ti ti-plus"></i>
      <div class="pa-brand-add-label">Tambah Brand</div>
      <div style="font-size:10.5px;color:inherit;text-align:center">Buat konfigurasi AI untuk brand atau bisnis baru</div>
    </div>
  `;
}

function selectBrand(id) {
  paState.brands.forEach(b => b.active = b.id === id);
  renderBrandCards();
  paShowToast(`Brand "${paState.brands.find(b=>b.id===id)?.name}" dipilih sebagai aktif`, 'success');
}

// ── Keyword tags ──────────────────────────────────────────────
function renderKeywordTags() {
  const wrap = document.getElementById('pa-kw-tags');
  if (!wrap) return;

  const chips = paState.keywords.map((kw, i) => `
    <span class="pa-tag-chip">
      ${kw} <i class="ti ti-x" onclick="removeKeyword(${i})"></i>
    </span>
  `).join('');

  // Re-render chips but keep the input
  const existing = wrap.querySelector('.pa-tag-input');
  wrap.innerHTML = chips;
  const input = document.createElement('input');
  input.className = 'pa-tag-input';
  input.placeholder = paState.keywords.length === 0 ? 'Tambah kata kunci...' : '';
  input.addEventListener('keydown', e => {
    if ((e.key === 'Enter' || e.key === ',') && input.value.trim()) {
      e.preventDefault();
      addKeyword(input.value.trim());
      input.value = '';
    } else if (e.key === 'Backspace' && !input.value && paState.keywords.length > 0) {
      paState.keywords.pop();
      renderKeywordTags();
    }
  });
  wrap.appendChild(input);
  wrap.addEventListener('click', () => input.focus());
}

function addKeyword(kw) {
  if (!paState.keywords.includes(kw)) {
    paState.keywords.push(kw);
    renderKeywordTags();
    markDirty('keywords');
  }
}

function removeKeyword(idx) {
  paState.keywords.splice(idx, 1);
  renderKeywordTags();
  markDirty('keywords');
}

// ── Jadwal jam kerja (dynamic rows) ────────────────────────────
function renderJadwalRows() {
  const wrap = document.getElementById('pa-jadwal-rows');
  if (!wrap) return;

  wrap.innerHTML = paState.jadwal.map(row => `
    <div class="pa-jadwal-row ${row.aktif ? '' : 'is-off'}" data-id="${row.id}">
      <input
        class="pa-input pa-jadwal-day-input"
        type="text"
        value="${row.hari}"
        placeholder="Mis. Senin, Senin – Jumat..."
        aria-label="Nama hari"
        oninput="updateJadwalField(${row.id}, 'hari', this.value)">
      <input
        class="pa-input"
        type="time"
        value="${row.mulai}"
        ${row.aktif ? '' : 'disabled'}
        aria-label="Jam mulai"
        onchange="updateJadwalField(${row.id}, 'mulai', this.value)">
      <input
        class="pa-input"
        type="time"
        value="${row.selesai}"
        ${row.aktif ? '' : 'disabled'}
        aria-label="Jam selesai"
        onchange="updateJadwalField(${row.id}, 'selesai', this.value)">
      <label class="pa-switch">
        <input type="checkbox" ${row.aktif ? 'checked' : ''} onchange="toggleJadwalActive(${row.id}, this.checked)">
        <span class="pa-switch-track"></span>
        <span class="pa-switch-thumb"></span>
      </label>
      <button type="button" class="pa-jadwal-remove-btn" title="Hapus baris" onclick="removeJadwalRow(${row.id})">
        <i class="ti ti-trash"></i>
      </button>
    </div>
  `).join('');
}

function addJadwalRow() {
  const newId = Math.max(0, ...paState.jadwal.map(r => r.id)) + 1;
  paState.jadwal.push({ id: newId, hari: 'Hari Baru', mulai: '08:00', selesai: '17:00', aktif: true });
  renderJadwalRows();
  markDirty('jadwal');

  // Fokus ke input nama hari yang baru ditambahkan
  const row = document.querySelector(`.pa-jadwal-row[data-id="${newId}"] .pa-jadwal-day-input`);
  if (row) { row.focus(); row.select(); }
}

function removeJadwalRow(id) {
  if (paState.jadwal.length <= 1) {
    paShowToast('Minimal harus ada satu baris jadwal', 'error');
    return;
  }
  paState.jadwal = paState.jadwal.filter(r => r.id !== id);
  renderJadwalRows();
  markDirty('jadwal');
}

function toggleJadwalActive(id, checked) {
  const row = paState.jadwal.find(r => r.id === id);
  if (row) row.aktif = checked;
  renderJadwalRows();
  markDirty('jadwal');
}

function updateJadwalField(id, field, value) {
  const row = paState.jadwal.find(r => r.id === id);
  if (row) row[field] = value;
  markDirty('jadwal');
}

// ── Toggle switch helpers ─────────────────────────────────────
function paToggle(inputEl) {
  const el = document.getElementById(inputEl);
  if (el) { el.checked = !el.checked; markDirty(inputEl); }
}

// ── Dirty tracking ────────────────────────────────────────────
function markDirty(field) {
  paState.dirtyFields.add(field);
  const saveBar = document.getElementById('pa-save-bar');
  if (saveBar) saveBar.style.display = 'flex';
}

// ── Form events ───────────────────────────────────────────────
function bindPaFormEvents() {
  // Agent name → preview
  const nameInput = document.getElementById('pa-agent-name');
  if (nameInput) {
    nameInput.addEventListener('input', () => {
      updatePreviewBubble();
      markDirty('agent-name');
    });
  }

  // Greeting message → char count
  paCharCount('pa-greeting', 'pa-greeting-count', 300);

  // All inputs → mark dirty
  document.querySelectorAll('#pengaturan-agent-page input, #pengaturan-agent-page textarea, #pengaturan-agent-page select').forEach(el => {
    el.addEventListener('change', () => markDirty(el.id || el.name || 'field'));
  });
}

// ── Save ──────────────────────────────────────────────────────
function paSaveSettings() {
  const bar = document.getElementById('pa-save-bar');
  const btn = document.getElementById('pa-save-btn');
  if (btn) {
    btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin 0.8s linear infinite"></i> Menyimpan...';
    btn.disabled = true;
  }
  setTimeout(() => {
    paState.dirtyFields.clear();
    if (bar) bar.style.display = 'none';
    if (btn) {
      btn.innerHTML = '<i class="ti ti-check"></i> Tersimpan';
      setTimeout(() => {
        btn.innerHTML = '<i class="ti ti-device-floppy"></i> Simpan Perubahan';
        btn.disabled = false;
      }, 1500);
    }
    paShowToast('Pengaturan berhasil disimpan', 'success');
  }, 900);
}

function paDiscardChanges() {
  paState.dirtyFields.clear();
  const bar = document.getElementById('pa-save-bar');
  if (bar) bar.style.display = 'none';
  paShowToast('Perubahan dibatalkan', '');
}

// ── Modal: Tambah Agent ───────────────────────────────────────
let paEditingAgentId = null;

function openAddAgentModal() {
  paEditingAgentId = null;
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('pa-modal-agent-form')?.reset();
  document.getElementById('pa-modal-agent-title').textContent = 'Undang Agent Baru';
}

function openEditAgentModal(id) {
  const agent = paState.agents.find(a => a.id === id);
  if (!agent) return;
  paEditingAgentId = id;
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('pa-modal-agent-title').textContent = 'Edit Agent: ' + agent.nama;
  const namaEl = document.getElementById('pa-modal-agent-nama');
  if (namaEl) namaEl.value = agent.nama;
  const emailEl = document.getElementById('pa-modal-agent-email');
  if (emailEl) emailEl.value = agent.email;
  const roleEl = document.getElementById('pa-modal-agent-role');
  if (roleEl) roleEl.value = agent.role;
}

function closeAgentModal() {
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'none';
  paEditingAgentId = null;
}

async function saveAgentModal() {
  const nama = document.getElementById('pa-modal-agent-nama')?.value.trim();
  const email = document.getElementById('pa-modal-agent-email')?.value.trim();
  const role = document.getElementById('pa-modal-agent-role')?.value || 'agent';

  if (!nama) { paShowToast('Nama wajib diisi', 'error'); return; }
  if (!email) { paShowToast('Email wajib diisi', 'error'); return; }

  try {
    if (paEditingAgentId !== null) {
      await paFetch(`/api/agents/${paEditingAgentId}`, {
        method: 'PATCH',
        body: JSON.stringify({ nama, email, role }),
      });
      paShowToast('Data agent diperbarui', 'success');
    } else {
      await paFetch('/api/agents', {
        method: 'POST',
        body: JSON.stringify({ nama, email, role }),
      });
      paShowToast('Agent baru berhasil ditambahkan', 'success');
    }
    closeAgentModal();
    await loadAgentsFromServer();
  } catch (e) {
    paShowToast('Gagal menyimpan: ' + e.message, 'error');
  }
}

async function removeAgent(id) {
  if (!confirm('Hapus agent ini dari daftar?')) return;
  try {
    await paFetch(`/api/agents/${id}`, { method: 'DELETE' });
    paShowToast('Agent dihapus', '');
    await loadAgentsFromServer();
  } catch (e) {
    paShowToast('Gagal menghapus: ' + e.message, 'error');
  }
}

// ── Modal: Brand ──────────────────────────────────────────────
function openAddBrandModal() {
  const overlay = document.getElementById('pa-modal-brand');
  if (!overlay) return;
  // Reset ke mode "tambah"
  overlay.dataset.editId = '';
  document.getElementById('pa-modal-brand-title').textContent = 'Tambah Brand Baru';
  document.getElementById('pa-modal-brand-submit').innerHTML = '<i class="ti ti-building-store"></i> Tambah Brand';
  document.getElementById('pa-brand-form').reset();
  // Reset color picker
  document.querySelectorAll('.pa-color-swatch').forEach(s => s.classList.remove('selected'));
  document.querySelector('.pa-color-swatch[data-color="#c8102e"]')?.classList.add('selected');
  document.getElementById('pa-brand-color').value = '#c8102e';
  updateBrandPreview();
  overlay.style.display = 'flex';
}

function openBrandModal(id) {
  const brand = paState.brands.find(b => b.id === id);
  if (!brand) return;
  const overlay = document.getElementById('pa-modal-brand');
  if (!overlay) return;
  // Mode "edit"
  overlay.dataset.editId = id;
  document.getElementById('pa-modal-brand-title').textContent = 'Edit Brand';
  document.getElementById('pa-modal-brand-submit').innerHTML = '<i class="ti ti-device-floppy"></i> Simpan Perubahan';
  // Isi form dengan data brand
  document.getElementById('pa-brand-name').value        = brand.name;
  document.getElementById('pa-brand-industry').value   = brand.cat;
  document.getElementById('pa-brand-abbr').value       = brand.abbr;
  document.getElementById('pa-brand-color').value      = brand.color;
  document.getElementById('pa-brand-desc').value       = brand.desc || '';
  document.getElementById('pa-brand-website').value    = brand.website || '';
  document.getElementById('pa-brand-phone').value      = brand.phone || '';
  document.getElementById('pa-brand-email').value      = brand.email || '';
  document.getElementById('pa-brand-address').value    = brand.address || '';
  document.getElementById('pa-brand-tone').value       = brand.tone || 'santai';
  document.getElementById('pa-brand-greeting').value   = brand.greeting || '';
  // Color swatch
  document.querySelectorAll('.pa-color-swatch').forEach(s => {
    s.classList.toggle('selected', s.dataset.color === brand.color);
  });
  updateBrandPreview();
  overlay.style.display = 'flex';
}

function closeBrandModal() {
  const overlay = document.getElementById('pa-modal-brand');
  if (overlay) overlay.style.display = 'none';
}

function saveBrandModal() {
  const name    = document.getElementById('pa-brand-name').value.trim();
  const abbr    = document.getElementById('pa-brand-abbr').value.trim().toUpperCase().slice(0, 3);
  const color   = document.getElementById('pa-brand-color').value;
  const cat     = document.getElementById('pa-brand-industry').value;
  const desc    = document.getElementById('pa-brand-desc').value.trim();
  const website = document.getElementById('pa-brand-website').value.trim();
  const phone   = document.getElementById('pa-brand-phone').value.trim();
  const email   = document.getElementById('pa-brand-email').value.trim();
  const address = document.getElementById('pa-brand-address').value.trim();
  const tone    = document.getElementById('pa-brand-tone').value;
  const greeting = document.getElementById('pa-brand-greeting').value.trim();

  if (!name) {
    document.getElementById('pa-brand-name').focus();
    paShowToast('Nama brand wajib diisi', 'error');
    return;
  }
  if (!cat) {
    document.getElementById('pa-brand-industry').focus();
    paShowToast('Kategori industri wajib diisi', 'error');
    return;
  }

  const overlay = document.getElementById('pa-modal-brand');
  const editId  = parseInt(overlay.dataset.editId);

  const btn = document.getElementById('pa-modal-brand-submit');
  btn.disabled = true;
  btn.innerHTML = '<i class="ti ti-loader-2" style="animation:spin .8s linear infinite"></i> Menyimpan...';

  setTimeout(() => {
    if (editId) {
      // Edit existing
      const brand = paState.brands.find(b => b.id === editId);
      if (brand) {
        Object.assign(brand, { name, abbr: abbr || name.slice(0,2).toUpperCase(), color, cat, desc, website, phone, email, address, tone, greeting });
      }
      paShowToast(`Brand "${name}" berhasil diperbarui`, 'success');
    } else {
      // Add new
      const newId = Math.max(0, ...paState.brands.map(b => b.id)) + 1;
      paState.brands.push({
        id: newId,
        name, abbr: abbr || name.slice(0,2).toUpperCase(),
        color, cat, desc, website, phone, email, address, tone, greeting,
        conv: 0, agents: 0, active: false
      });
      paShowToast(`Brand "${name}" berhasil ditambahkan`, 'success');
    }
    renderBrandCards();
    closeBrandModal();
    btn.disabled = false;
  }, 700);
}

function deleteBrand(id) {
  const brand = paState.brands.find(b => b.id === id);
  if (!brand) return;
  if (!confirm(`Hapus brand "${brand.name}"? Tindakan ini tidak dapat dibatalkan.`)) return;
  paState.brands = paState.brands.filter(b => b.id !== id);
  renderBrandCards();
  closeBrandModal();
  paShowToast(`Brand "${brand.name}" dihapus`, '');
}

function updateBrandPreview() {
  const name  = document.getElementById('pa-brand-name')?.value.trim() || 'Nama Brand';
  const abbr  = document.getElementById('pa-brand-abbr')?.value.trim().toUpperCase().slice(0,3) || name.slice(0,2).toUpperCase();
  const color = document.getElementById('pa-brand-color')?.value || '#c8102e';
  const cat   = document.getElementById('pa-brand-industry')?.value || 'Kategori Bisnis';
  const tone  = document.getElementById('pa-brand-tone')?.value || 'santai';

  const prev = document.getElementById('pa-brand-preview-card');
  if (!prev) return;
  prev.querySelector('.pa-brand-card-top').style.background    = color;
  prev.querySelector('.pa-brand-logo').style.background        = color;
  prev.querySelector('.pa-brand-logo').textContent             = abbr || name.slice(0,2).toUpperCase();
  prev.querySelector('.pa-brand-name').textContent             = name;
  prev.querySelector('.pa-brand-cat').textContent              = cat;
  prev.querySelector('.pa-brand-preview-tone').textContent     = tone.charAt(0).toUpperCase() + tone.slice(1);
}

function paBrandColorPick(el, color) {
  document.querySelectorAll('.pa-color-swatch').forEach(s => s.classList.remove('selected'));
  el.classList.add('selected');
  document.getElementById('pa-brand-color').value = color;
  updateBrandPreview();
}

// Auto-generate abbr from brand name
function paBrandNameInput() {
  const name = document.getElementById('pa-brand-name').value.trim();
  const abbrEl = document.getElementById('pa-brand-abbr');
  // Only auto-fill if abbr is still empty or matches previous auto-generation
  const words = name.split(/\s+/).filter(Boolean);
  const auto  = words.length >= 2
    ? words.slice(0, 2).map(w => w[0]).join('').toUpperCase()
    : name.slice(0, 2).toUpperCase();
  if (!abbrEl.dataset.manualEdit) abbrEl.value = auto;
  updateBrandPreview();
}

// ── Toast ─────────────────────────────────────────────────────
function paShowToast(msg, type = '') {
  const existing = document.querySelector('.pa-toast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.className = 'pa-toast' + (type ? ' ' + type : '');
  const icon = type === 'success' ? 'ti-check-circle' : type === 'error' ? 'ti-alert-circle' : 'ti-info-circle';
  toast.innerHTML = `<i class="ti ${icon}"></i> ${msg}`;
  document.body.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'paFadeOut .3s ease forwards';
    setTimeout(() => toast.remove(), 300);
  }, 2500);
}

// ── Spin keyframe (inline) ────────────────────────────────────
(function() {
  if (!document.getElementById('pa-spin-style')) {
    const s = document.createElement('style');
    s.id = 'pa-spin-style';
    s.textContent = '@keyframes spin { to { transform: rotate(360deg); } }';
    document.head.appendChild(s);
  }
})();

// ── Auto-init on DOMContentLoaded ────────────────────────────
document.addEventListener('DOMContentLoaded', initPengaturanAgent);