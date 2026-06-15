/* ===================================
   pengaturan-agent.js — Indotrading AI
   Pengaturan Agent Page Logic
   =================================== */

// ── State ─────────────────────────────────────────────────────
const paState = {
  activeSection: 'persona',
  selectedTone: 'santai',
  dirtyFields: new Set(),
  agents: [
    { id:1, nama:'Budi Wicaksono',  email:'budi@indotrading.com',   role:'superadmin', status:'online',  initials:'BW', chat:14 },
    { id:2, nama:'Sari Dewi',       email:'sari@indotrading.com',   role:'admin',      status:'online',  initials:'SD', chat:8  },
    { id:3, nama:'Andi Prasetyo',   email:'andi@indotrading.com',   role:'agent',      status:'busy',    initials:'AP', chat:5  },
    { id:4, nama:'Rini Kusuma',     email:'rini@indotrading.com',   role:'agent',      status:'offline', initials:'RK', chat:0  },
    { id:5, nama:'Maya Lestari',    email:'maya@indotrading.com',   role:'viewer',     status:'online',  initials:'ML', chat:0  },
  ],
  brands: [
    { id:1, name:'Indotrading B2B',    cat:'Platform Utama',   color:'#c8102e', abbr:'IT', conv:1284, agents:3, active: true  },
    { id:2, name:'Indotrading Mesin',  cat:'Industri Mesin',   color:'#1d4ed8', abbr:'IM', conv:342,  agents:2, active: false },
    { id:3, name:'Indotrading Kimia',  cat:'Bahan Kimia',      color:'#15803d', abbr:'IK', conv:189,  agents:1, active: false },
  ],
  keywords: ['komplain', 'refund', 'rusak', 'tidak terima', 'salah kirim'],
};

// ── Init ──────────────────────────────────────────────────────
function initPengaturanAgent() {
  renderAgentTable();
  renderBrandCards();
  renderKeywordTags();
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
  const name = document.getElementById('pa-agent-name')?.value || 'Halo AI';
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
function openAddAgentModal() {
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('pa-modal-agent-form')?.reset();
  document.getElementById('pa-modal-agent-title').textContent = 'Undang Agent Baru';
}

function openEditAgentModal(id) {
  const agent = paState.agents.find(a => a.id === id);
  if (!agent) return;
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'flex';
  document.getElementById('pa-modal-agent-title').textContent = 'Edit Agent: ' + agent.nama;
  const roleEl = document.getElementById('pa-modal-agent-role');
  if (roleEl) roleEl.value = agent.role;
}

function closeAgentModal() {
  const overlay = document.getElementById('pa-modal-agent');
  if (overlay) overlay.style.display = 'none';
}

function saveAgentModal() {
  closeAgentModal();
  paShowToast('Data agent diperbarui', 'success');
}

function removeAgent(id) {
  if (!confirm('Hapus agent ini dari daftar?')) return;
  paState.agents = paState.agents.filter(a => a.id !== id);
  renderAgentTable();
  paShowToast('Agent dihapus', '');
}

// ── Modal: Brand ──────────────────────────────────────────────
function openAddBrandModal() {
  paShowToast('Fitur tambah brand segera hadir', '');
}
function openBrandModal(id) {
  const brand = paState.brands.find(b => b.id === id);
  if (!brand) return;
  paShowToast(`Buka konfigurasi: ${brand.name}`, '');
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