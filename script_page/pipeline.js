/* ══ PIPELINE.JS ════════════════════════════════════════════════
   Handles:
   - Deal data store
   - Add/Edit modal (toggle recurring fields)
   - Deal drawer (detail view + stage steps)
   - Context menu
   - Search + filter
   - Auto renewal countdown badge rendering
   - Pipeline flow bar sync
   - Board scroll arrow buttons
═══════════════════════════════════════════════════════════════ */

// ── Data Store ────────────────────────────────────────────────
const plDeals = [
  {
    id: 1, company: 'PT Dinamika Makmur', product: 'Jasa Konsultasi ERP — SAP B1',
    value: 85000000, stage: 'prospek', type: 'baru', pic: 'BW', channel: 'wa',
    recurring: false, date: '2025-06-12',
    activity: [
      { text: 'Deal dibuat dari percakapan WhatsApp', time: '12 Jun, 09:14', color: 'var(--red)' },
      { text: 'AI Agent kualifikasi kebutuhan ERP', time: '12 Jun, 09:20', color: '#818cf8' },
    ]
  },
  {
    id: 2, company: 'CV Sejahtera Nusantara', product: 'Produk: Mesin Packing A200',
    value: 42000000, stage: 'prospek', type: 'baru', pic: 'RS', channel: 'ig',
    recurring: false, date: '2025-06-15',
    activity: [
      { text: 'Lead masuk dari Instagram DM', time: '15 Jun, 13:40', color: '#f97316' },
    ]
  },
  {
    id: 3, company: 'UD Berkah Jaya', product: 'Spare Part Mesin — Bulk 100 pcs',
    value: 58000000, stage: 'prospek', type: 'upsell', pic: 'DK', channel: 'shopee',
    recurring: false, date: '2025-06-18',
    activity: [
      { text: 'Upsell dari order sebelumnya', time: '18 Jun, 10:05', color: 'var(--amber)' },
    ]
  },
  {
    id: 4, company: 'PT Karya Bersama', product: 'Jasa Maintenance Tahunan',
    value: 72000000, stage: 'kualifikasi', type: 'baru', pic: 'BW', channel: 'wa',
    recurring: true, interval: 'yearly', endDate: '2026-06-10', autoRenewal: true,
    date: '2025-06-10',
    activity: [
      { text: 'Leads dikualifikasi — budget & authority confirmed', time: '11 Jun, 14:22', color: '#60a5fa' },
      { text: 'Jadwal demo dikirim via WhatsApp', time: '12 Jun, 08:00', color: 'var(--green)' },
    ]
  },
  {
    id: 5, company: 'Toko Maju Sentosa', product: 'Produk: Kemasan Plastik — 500 pcs',
    value: 62000000, stage: 'kualifikasi', type: 'baru', pic: 'RS', channel: 'web',
    recurring: false, date: '2025-06-17',
    activity: [
      { text: 'Form website diisi, kontak via email', time: '17 Jun, 16:30', color: '#818cf8' },
    ]
  },
  {
    id: 6, company: 'PT Logistik Prima', product: 'Produk: Forklift Electric 3T',
    value: 98000000, stage: 'penawaran', type: 'baru', pic: 'DK', channel: 'wa',
    recurring: false, date: '2025-06-08',
    activity: [
      { text: 'SPH dikirim ke procurement', time: '9 Jun, 11:00', color: 'var(--amber)' },
      { text: 'Customer minta revisi harga spare part', time: '14 Jun, 15:45', color: 'var(--red)' },
    ]
  },
  {
    id: 7, company: 'CV Mitra Teknik', product: 'Jasa Kalibrasi Alat — Kontrak',
    value: 57000000, stage: 'penawaran', type: 'baru', pic: 'BW', channel: 'wa',
    recurring: true, interval: 'yearly', endDate: '2026-06-20', autoRenewal: true,
    date: '2025-06-20',
    activity: [
      { text: 'Penawaran kontrak tahunan dikirim', time: '20 Jun, 09:30', color: 'var(--amber)' },
    ]
  },
  {
    id: 8, company: 'PT Nusantara Abadi Group', product: 'Jasa IT Outsourcing — Tahunan',
    value: 120000000, stage: 'negosiasi', type: 'renewal', pic: 'RS', channel: 'wa',
    recurring: true, interval: 'yearly', endDate: '2026-08-22', autoRenewal: true,
    date: '2025-06-22',
    activity: [
      { text: 'Renewal deal otomatis dibuat dari kontrak sebelumnya', time: '22 Jun, 08:00', color: 'var(--green)' },
      { text: 'Negosiasi kenaikan harga 8% dibahas', time: '23 Jun, 14:10', color: 'var(--red)' },
    ]
  },
  {
    id: 9, company: 'PT Maju Bersama Tbk', product: 'Produk: Conveyor Belt X300',
    value: 73000000, stage: 'negosiasi', type: 'baru', pic: 'DK', channel: 'wa',
    recurring: false, date: '2025-06-23',
    activity: [
      { text: 'Negosiasi diskon 5% untuk pembayaran DP penuh', time: '23 Jun, 16:00', color: 'var(--amber)' },
    ]
  },
  {
    id: 10, company: 'PT Sumber Energi', product: 'Produk: Solar Panel 10kW Kit',
    value: 112000000, stage: 'closing', type: 'baru', pic: 'BW', channel: 'web',
    recurring: false, date: '2025-06-24',
    activity: [
      { text: 'Draft kontrak dikirim ke legal', time: '24 Jun, 10:00', color: 'var(--red)' },
    ]
  },
  {
    id: 11, company: 'Koperasi Tani Mulya', product: 'Jasa Fumigasi — Kontrak Bulanan',
    value: 68000000, stage: 'closing', type: 'baru', pic: 'RS', channel: 'wa',
    recurring: true, interval: 'monthly', endDate: '2026-06-25', autoRenewal: true,
    date: '2025-06-25',
    activity: [
      { text: 'Kontrak bulanan disetujui secara lisan', time: '25 Jun, 09:00', color: 'var(--green)' },
    ]
  },
  {
    id: 12, company: 'PT Maju Bersama Tbk', product: 'Produk: Conveyor Belt X100 — 5 unit',
    value: 87500000, stage: 'won', type: 'baru', pic: 'DK', channel: 'wa',
    recurring: false, date: '2025-06-20', wonDate: '2025-06-20',
    activity: [
      { text: 'Deal won — pembayaran lunas diterima', time: '20 Jun, 14:00', color: 'var(--green)' },
    ]
  },
  {
    id: 13, company: 'PT Sumber Abadi', product: 'Jasa Pemeliharaan HVAC — Tahunan',
    value: 144000000, stage: 'won', type: 'renewal', pic: 'BW', channel: 'wa',
    recurring: true, interval: 'yearly', endDate: '2025-07-28', autoRenewal: true,
    date: '2025-01-10', wonDate: '2025-01-10',
    activity: [
      { text: 'Kontrak ditandatangani dan aktif', time: '10 Jan, 10:00', color: 'var(--green)' },
      { text: 'Kunjungan rutin Q1 selesai', time: '15 Mar, 14:00', color: '#818cf8' },
      { text: 'Notifikasi renewal dikirim ke customer', time: '27 Jun, 08:00', color: 'var(--amber)' },
    ]
  },
  {
    id: 14, company: 'Apotek Sehat Bersama', product: 'Jasa Software Apotek — SaaS Bulanan',
    value: 95500000, stage: 'won', type: 'upsell', pic: 'RS', channel: 'web',
    recurring: true, interval: 'monthly', endDate: '2025-07-06', autoRenewal: true,
    date: '2025-06-06', wonDate: '2025-06-06',
    activity: [
      { text: 'Upsell paket premium berhasil', time: '6 Jun, 11:30', color: 'var(--green)' },
      { text: 'Onboarding fitur baru selesai', time: '10 Jun, 15:00', color: '#818cf8' },
    ]
  },
];

// ── Stages (customizable) ───────────────────────────────────────
// Stage bisa ditambah, diubah nama/warnanya, atau dihapus oleh user.
let plStages = [
  { key: 'prospek',     label: 'Prospek',      color: '#818cf8' },
  { key: 'kualifikasi', label: 'Kualifikasi',  color: '#60a5fa' },
  { key: 'penawaran',   label: 'Penawaran',    color: '#f59e0b' },
  { key: 'negosiasi',   label: 'Negosiasi',    color: '#f97316' },
  { key: 'closing',     label: 'Closing',      color: '#ef4444' },
  { key: 'won',         label: 'Won / Aktif',  color: '#16a34a' },
];

const PL_STAGE_COLOR_PRESETS = [
  '#818cf8', '#60a5fa', '#38bdf8', '#2dd4bf', '#34d399',
  '#16a34a', '#facc15', '#f59e0b', '#f97316', '#fb7185',
  '#ef4444', '#c8102e', '#a855f7', '#8b5cf6', '#64748b',
];

// ── State ─────────────────────────────────────────────────────
let plCurrentDealId   = null;
let plCurrentCtxId    = null;
let plCurrentStageKey = null;
let plRecurringOn     = false;
let plAutoRenewalOn   = false;
let plModalStage      = 'prospek';
let plStageModalMode  = 'add'; // 'add' | 'edit'
let plStageModalKey   = null;

// ── Helpers ───────────────────────────────────────────────────
function plFmt(n) {
  if (n >= 1e9) return 'Rp ' + (n / 1e9).toFixed(1).replace('.0', '') + ' M';
  if (n >= 1e6) return 'Rp ' + (n / 1e6).toFixed(0) + ' jt';
  return 'Rp ' + n.toLocaleString('id-ID');
}

function plDaysUntil(dateStr) {
  if (!dateStr) return null;
  const end  = new Date(dateStr);
  const now  = new Date();
  end.setHours(0,0,0,0); now.setHours(0,0,0,0);
  return Math.ceil((end - now) / 864e5);
}

function plRenewalClass(days) {
  if (days === null) return '';
  if (days <= 14)  return 'urgent';
  if (days <= 45)  return 'warn';
  return 'safe';
}

function plRenewalWidth(days) {
  if (days === null) return 0;
  if (days <= 0)  return 100;
  if (days >= 365) return 10;
  const pct = ((365 - days) / 365) * 100;
  return Math.max(10, Math.min(99, pct));
}

function plEsc(str) {
  return String(str).replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[c]));
}

let STAGE_LABELS = [];
let STAGE_KEYS   = [];

function plSyncStageArrays() {
  STAGE_KEYS   = plStages.map(s => s.key);
  STAGE_LABELS = plStages.map(s => s.label);
}
plSyncStageArrays();

// ── Summary Topbar ────────────────────────────────────────────
function plUpdateSummary() {
  const total    = plDeals.length;
  const pipeline = plDeals.filter(d => d.stage !== 'won').reduce((s, d) => s + d.value, 0);
  const renewNear = plDeals.filter(d => d.recurring && d.stage === 'won' && plDaysUntil(d.endDate) !== null && plDaysUntil(d.endDate) <= 45).length;

  const elTotal = document.getElementById('pl-total-deals');
  const elVal   = document.getElementById('pl-total-value');
  const elRen   = document.getElementById('pl-renewal-count');
  if (elTotal) elTotal.textContent = total + ' Deal';
  if (elVal)   elVal.textContent   = plFmt(pipeline) + ' pipeline';
  if (elRen)   elRen.textContent   = renewNear + ' renewal mendekati';
}

// ── Pipeline Flow Bar: sync deal count ───────────────────────
function plUpdateFlow() {
  STAGE_KEYS.forEach(stage => {
    const el = document.getElementById('pf-count-' + stage);
    if (!el) return;
    const count = plDeals.filter(d => d.stage === stage).length;
    el.textContent = count + ' deal';
  });
}

// ── Pipeline Flow Bar: render dinamis dari plStages ──────────
// Icon mapping per stage key (fallback ke ti-circle jika tidak ada)
const PL_FLOW_ICONS = {
  prospek:     { icon: 'M12 4a4 4 0 014 4 4 4 0 01-4 4 4 4 0 01-4-4 4 4 0 014-4m0 10c4.42 0 8 1.79 8 4v2H4v-2c0-2.21 3.58-4 8-4z', viewBox: '0 0 24 24' },
  kualifikasi: { icon: 'M3 4h18v2.172a2 2 0 01-.586 1.414L14 14v5.764a1 1 0 01-.553.894l-4 2A1 1 0 018 21.764V14L3.586 7.586A2 2 0 013 6.172V4z', viewBox: '0 0 24 24' },
  penawaran:   { icon: 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z', viewBox: '0 0 24 24' },
  negosiasi:   { icon: 'M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z', viewBox: '0 0 24 24' },
  closing:     { icon: 'M9 12l2 2 4-4M7 2h10a2 2 0 012 2v18l-7-3-7 3V4a2 2 0 012-2z', viewBox: '0 0 24 24' },
  won:         { icon: 'M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z', viewBox: '0 0 24 24' },
};
const PL_FLOW_ICON_DEFAULT = 'M12 12c2.7 0 4-1.34 4-4s-1.3-4-4-4-4 1.34-4 4 1.3 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z';

// Derive pale background from a hex color
function plColorToBg(hex) {
  // Parse #rrggbb or #rgb
  let r, g, b;
  hex = hex.replace('#', '');
  if (hex.length === 3) {
    r = parseInt(hex[0]+hex[0], 16);
    g = parseInt(hex[1]+hex[1], 16);
    b = parseInt(hex[2]+hex[2], 16);
  } else {
    r = parseInt(hex.substring(0,2), 16);
    g = parseInt(hex.substring(2,4), 16);
    b = parseInt(hex.substring(4,6), 16);
  }
  return `rgba(${r},${g},${b},0.12)`;
}

function plRenderFlowBar() {
  const track = document.querySelector('.pl-flow-track');
  if (!track) return;

  const arrowSvg = `<div class="pl-flow-arrow">
    <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
      <path d="M5 10h10M12 7l3 3-3 3" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"/>
    </svg>
  </div>`;

  const html = plStages.map((s, idx) => {
    const iconData = PL_FLOW_ICONS[s.key];
    const iconPath = iconData ? iconData.icon : PL_FLOW_ICON_DEFAULT;
    const iconVBox = iconData ? iconData.viewBox : '0 0 24 24';
    const bg      = plColorToBg(s.color);
    const isWon   = (s.key === 'won') || (idx === plStages.length - 1 && s.key !== 'prospek');
    const wonBadge = isWon ? `` : '';

    const stageHtml = `
      <div class="pl-flow-stage${isWon ? ' pl-flow-stage-won' : ''}" data-stage="${plEsc(s.key)}">
        <div class="pl-flow-icon" style="--stage-color:${plEsc(s.color)};--stage-bg:${bg}">
          <svg width="16" height="16" viewBox="${iconVBox}" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
            <path d="${iconPath}"/>
          </svg>
        </div>
        <div class="pl-flow-info">
          <div class="pl-flow-label">${plEsc(s.label)}</div>
          <div class="pl-flow-count" id="pf-count-${plEsc(s.key)}">0 deal</div>
        </div>
        ${wonBadge}
      </div>`;

    return idx < plStages.length - 1 ? stageHtml + arrowSvg : stageHtml;
  }).join('');

  track.innerHTML = html;
}

// ── Stage Columns: render (customizable stages) ──────────────
function plRenderColumns() {
  const board = document.getElementById('pl-board');
  if (!board) return;

  board.innerHTML = plStages.map(s => `
      <div class="pl-col" data-stage="${plEsc(s.key)}">
        <div class="pl-col-head">
          <div class="pl-col-drag-handle" title="Drag untuk ubah urutan stage" onmousedown="plStartColDrag(event,'${plEsc(s.key)}')">
            <svg width="20" height="8" viewBox="0 0 20 8" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect y="0"   width="20" height="1.8" rx="0.9" fill="currentColor"/>
              <rect y="3.1" width="20" height="1.8" rx="0.9" fill="currentColor"/>
            </svg>
          </div>
          <div class="pl-col-title-row">
            <div class="pl-col-dot" style="background:${plEsc(s.color)}"></div>
            <div class="pl-col-name">${plEsc(s.label)}</div>
            <div class="pl-col-count" id="pl-count-${s.key}">0</div>
              <button class="pl-col-menu" title="Opsi stage" onclick="openStageMenu(event,'${s.key}')">
                <svg 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="currentColor" 
                  aria-hidden="true"
                >
                  <circle cx="12" cy="5" r="2" />
                  <circle cx="12" cy="12" r="2" />
                  <circle cx="12" cy="19" r="2" />
                </svg>
              </button>
          </div>
          <div class="pl-col-meta">
            <div class="pl-col-value" id="pl-val-${s.key}">Rp 0</div>
              <button class="pl-col-add" title="Tambah deal di ${plEsc(s.label)}" onclick="openAddDeal('${s.key}')">
                <svg 
                  xmlns="http://www.w3.org/2000/svg" 
                  width="16" 
                  height="16" 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="var(--gray-600)" 
                  stroke-width="2.5" 
                  stroke-linecap="round" 
                  stroke-linejoin="round"
                >
                  <line x1="12" y1="5" x2="12" y2="19"></line>
                  <line x1="5" y1="12" x2="19" y2="12"></line>
                </svg>
              </button>
          </div>
        </div>
        <div class="pl-cards" id="pl-cards-${s.key}"></div>
      </div>
  `).join('') + `
      <div class="pl-col pl-col-addstage" onclick="openAddStageModal()" title="Tambah stage baru">
        <div class="pl-addstage-inner">
          <div class="pl-addstage-icon">
  <svg 
    xmlns="http://www.w3.org/2000/svg" 
    width="22" 
    height="22" 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    stroke-width="2" 
    stroke-linecap="round" 
    stroke-linejoin="round"
    aria-hidden="true"
  >
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="8" x2="12" y2="16"></line>
    <line x1="8" y1="12" x2="16" y2="12"></line>
  </svg>
</div>
          <div class="pl-addstage-label">Tambah Stage</div>
        </div>
      </div>
  `;

  plPopulateStageSelect();
}

// ── Sync stage <select> di modal Tambah/Edit Deal ────────────
function plPopulateStageSelect() {
  const sel = document.getElementById('pl-f-stage');
  if (!sel) return;
  const current = sel.value;
  sel.innerHTML = plStages.map(s => `<option value="${plEsc(s.key)}">${plEsc(s.label)}</option>`).join('');
  if (plStages.some(s => s.key === current)) sel.value = current;
}

// ── Context Menu: Stage (kolom) ───────────────────────────────
function openStageMenu(e, key) {
  e.stopPropagation();
  plCurrentStageKey = key;
  const menu = document.getElementById('pl-stage-menu');
  if (!menu) return;
  menu.style.display = 'block';
  const x = Math.min(e.clientX, window.innerWidth - 175);
  const y = Math.min(e.clientY, window.innerHeight - 130);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function closeStageMenu() {
  const m = document.getElementById('pl-stage-menu');
  if (m) m.style.display = 'none';
}

function stageMenuEdit()   { closeStageMenu(); if (plCurrentStageKey) openEditStageModal(plCurrentStageKey); }
function stageMenuDelete() { closeStageMenu(); if (plCurrentStageKey) deleteStage(plCurrentStageKey); }

// ── Modal: Tambah / Edit Stage ────────────────────────────────
function plRenderStageSwatches(selectedColor) {
  const wrap = document.getElementById('pl-stage-color-swatches');
  if (!wrap) return;
  wrap.innerHTML = PL_STAGE_COLOR_PRESETS.map(c => `
    <button type="button" class="pl-stage-swatch ${c.toLowerCase() === (selectedColor || '').toLowerCase() ? 'active' : ''}"
      style="background:${c}" onclick="plPickStageColor('${c}')" title="${c}"></button>
  `).join('');
}

function plPickStageColor(color) {
  const input = document.getElementById('pl-stage-f-color');
  if (input) input.value = color;
  plRenderStageSwatches(color);
}

function plSyncStageColorText() {
  const input = document.getElementById('pl-stage-f-color');
  plRenderStageSwatches(input ? input.value : null);
}

function openAddStageModal() {
  plStageModalMode = 'add';
  plStageModalKey  = null;

  document.getElementById('pl-stage-modal-title').textContent = 'Tambah Stage Baru';
  document.getElementById('pl-stage-f-name').value = '';
  const randomColor = PL_STAGE_COLOR_PRESETS[Math.floor(Math.random() * PL_STAGE_COLOR_PRESETS.length)];
  document.getElementById('pl-stage-f-color').value = randomColor;
  plRenderStageSwatches(randomColor);
  document.getElementById('pl-stage-delete-btn').style.display = 'none';

  document.getElementById('pl-stage-modal-overlay').style.display = 'flex';
}

function openEditStageModal(key) {
  const s = plStages.find(x => x.key === key);
  if (!s) return;
  plStageModalMode = 'edit';
  plStageModalKey  = key;

  document.getElementById('pl-stage-modal-title').textContent = 'Edit Stage';
  document.getElementById('pl-stage-f-name').value  = s.label;
  document.getElementById('pl-stage-f-color').value = s.color;
  plRenderStageSwatches(s.color);
  document.getElementById('pl-stage-delete-btn').style.display = plStages.length > 1 ? 'inline-flex' : 'none';

  document.getElementById('pl-stage-modal-overlay').style.display = 'flex';
}

function closeStageModal() {
  document.getElementById('pl-stage-modal-overlay').style.display = 'none';
}

function plSlugifyStage(label) {
  const base = label.toLowerCase().trim().replace(/[^a-z0-9]+/g, '_').replace(/^_+|_+$/g, '') || 'stage';
  let key = base, n = 1;
  while (plStages.some(s => s.key === key)) {
    key = base + '_' + (++n);
  }
  return key;
}

function saveStage() {
  const name  = document.getElementById('pl-stage-f-name').value.trim();
  const color = document.getElementById('pl-stage-f-color').value || '#818cf8';

  if (!name) {
    alert('Nama stage wajib diisi.');
    return;
  }

  if (plStageModalMode === 'add') {
    const key = plSlugifyStage(name);
    plStages.push({ key, label: name, color });
  } else {
    const s = plStages.find(x => x.key === plStageModalKey);
    if (s) { s.label = name; s.color = color; }
  }

  closeStageModal();
  plSyncStageArrays();
  plRenderColumns();
  plRenderFlowBar();
  plRebuildBoard();
  plUpdateSummary();
}

function deleteStageFromModal() {
  if (plStageModalMode !== 'edit' || !plStageModalKey) return;
  const key = plStageModalKey;
  closeStageModal();
  deleteStage(key);
}

function deleteStage(key) {
  if (plStages.length <= 1) {
    alert('Tidak bisa menghapus — minimal harus ada 1 stage.');
    return;
  }
  const stageObj = plStages.find(s => s.key === key);
  if (!stageObj) return;
  const label = stageObj.label;
  const dealsInStage = plDeals.filter(d => d.stage === key).length;

  const fallback = plStages.find(s => s.key !== key);

  let proceed;
  if (dealsInStage > 0) {
    proceed = confirm(
      `Stage "${label}" masih memiliki ${dealsInStage} deal.\n` +
      `Jika dilanjutkan, deal tersebut akan dipindahkan ke stage "${fallback.label}".\n\n` +
      `Hapus stage ini?`
    );
  } else {
    proceed = confirm(`Hapus stage "${label}"?`);
  }
  if (!proceed) return;

  if (dealsInStage > 0) {
    plDeals.forEach(d => { if (d.stage === key) d.stage = fallback.key; });
  }

  plStages = plStages.filter(s => s.key !== key);
  plSyncStageArrays();
  plRenderColumns();
  plRenderFlowBar();
  plRebuildBoard();
  plUpdateSummary();
}

// ── Board Scroll Arrow Buttons ────────────────────────────────
/* ══ TOGGLE AI INSIGHTS PANEL ═══════════════════════════════════
   Menyembunyikan/menampilkan #pl-ai-panel agar #pl-board-wrap
   punya ruang lebih besar untuk scrolling kanban.
   State disimpan di localStorage supaya tidak reset tiap reload.
═══════════════════════════════════════════════════════════════ */
const PL_AI_PANEL_STORAGE_KEY = 'pl-ai-panel-hidden';

function plApplyAIPanelState(hidden) {
  const panel = document.getElementById('pl-ai-panel');
  const btn   = document.getElementById('pl-ai-toggle-btn');
  const label = document.getElementById('pl-ai-toggle-label');
  if (!panel) return;

  panel.classList.toggle('pl-ai-panel-hidden', hidden);
  panel.setAttribute('aria-hidden', hidden ? 'true' : 'false');

  if (btn) btn.classList.toggle('active', hidden);
  if (label) label.textContent = hidden ? 'Tampilkan AI Insights' : 'Sembunyikan AI Insights';

  // Board mungkin berubah tinggi, refresh status arrow scroll kiri/kanan
  setTimeout(plUpdateScrollBtns, 260);
}

function plToggleAIPanel() {
  const panel = document.getElementById('pl-ai-panel');
  if (!panel) return;
  const hidden = !panel.classList.contains('pl-ai-panel-hidden');
  plApplyAIPanelState(hidden);
  try {
    localStorage.setItem(PL_AI_PANEL_STORAGE_KEY, hidden ? '1' : '0');
  } catch (e) { /* localStorage tidak tersedia, abaikan */ }
}

function plInitAIPanelToggle() {
  let hidden = false;
  try {
    hidden = localStorage.getItem(PL_AI_PANEL_STORAGE_KEY) === '1';
  } catch (e) { /* localStorage tidak tersedia, default tampil */ }
  plApplyAIPanelState(hidden);
}

function plScrollBoard(dir) {
  const wrap = document.getElementById('pl-board-wrap');
  if (!wrap) return;
  wrap.scrollBy({ left: dir * 268, behavior: 'smooth' });
}

function plUpdateScrollBtns() {
  const wrap = document.getElementById('pl-board-wrap');
  const btnL = document.getElementById('pl-scroll-left');
  const btnR = document.getElementById('pl-scroll-right');
  if (!wrap || !btnL || !btnR) return;

  const canLeft  = wrap.scrollLeft > 8;
  const canRight = wrap.scrollLeft < wrap.scrollWidth - wrap.clientWidth - 8;

  btnL.classList.toggle('visible', canLeft);
  btnR.classList.toggle('visible', canRight);
}

// ── Modal: Tambah / Edit Deal ─────────────────────────────────
function openAddDeal(stage) {
  plModalStage = stage || 'prospek';
  plCurrentDealId = null;

  // Reset form
  document.getElementById('pl-modal-heading').textContent = 'Tambah Deal Baru';
  document.getElementById('pl-f-company').value  = '';
  document.getElementById('pl-f-product').value  = '';
  document.getElementById('pl-f-value').value    = '';
  document.getElementById('pl-f-stage').value    = plModalStage;
  document.getElementById('pl-f-type').value     = 'baru';
  document.getElementById('pl-f-pic').value      = 'BW';
  document.getElementById('pl-f-channel').value  = 'wa';
  document.getElementById('pl-f-end-date').value = '';
  document.getElementById('pl-f-notes') && (document.getElementById('pl-f-notes').value = '');

  setRecurring(false);
  setAutoRenewal(false);

  document.getElementById('pl-modal-overlay').style.display = 'flex';
}

function openEditDeal(id) {
  const d = plDeals.find(x => x.id === id);
  if (!d) return;
  plCurrentDealId = id;

  document.getElementById('pl-modal-heading').textContent = 'Edit Deal';
  document.getElementById('pl-f-company').value  = d.company;
  document.getElementById('pl-f-product').value  = d.product;
  document.getElementById('pl-f-value').value    = d.value;
  document.getElementById('pl-f-stage').value    = d.stage;
  document.getElementById('pl-f-type').value     = d.type;
  document.getElementById('pl-f-pic').value      = d.pic;
  document.getElementById('pl-f-channel').value  = d.channel;

  setRecurring(!!d.recurring);
  if (d.recurring) {
    document.getElementById('pl-f-interval').value  = d.interval  || 'yearly';
    document.getElementById('pl-f-end-date').value  = d.endDate   || '';
    if (d.notes) document.getElementById('pl-f-notes').value = d.notes;
    setAutoRenewal(!!d.autoRenewal);
  }

  document.getElementById('pl-modal-overlay').style.display = 'flex';
}

function closeDealModal() {
  document.getElementById('pl-modal-overlay').style.display = 'none';
}

function setRecurring(on) {
  plRecurringOn = on;
  const toggle = document.getElementById('pl-recurring-toggle');
  const fields = document.getElementById('pl-recurring-fields');
  if (!toggle || !fields) return;
  if (on) { toggle.classList.add('active'); fields.classList.add('visible'); }
  else    { toggle.classList.remove('active'); fields.classList.remove('visible'); }
}

function toggleRecurring() {
  setRecurring(!plRecurringOn);
}

function setAutoRenewal(on) {
  plAutoRenewalOn = on;
  const toggle = document.getElementById('pl-auto-renewal-toggle');
  if (!toggle) return;
  if (on) toggle.classList.add('active');
  else    toggle.classList.remove('active');
}

function toggleAutoRenewal() {
  setAutoRenewal(!plAutoRenewalOn);
}

function saveDeal() {
  const company  = document.getElementById('pl-f-company').value.trim();
  const product  = document.getElementById('pl-f-product').value.trim();
  const value    = parseInt(document.getElementById('pl-f-value').value, 10) || 0;
  const stage    = document.getElementById('pl-f-stage').value;
  const type     = document.getElementById('pl-f-type').value;
  const pic      = document.getElementById('pl-f-pic').value;
  const channel  = document.getElementById('pl-f-channel').value;
  const endDate  = plRecurringOn ? document.getElementById('pl-f-end-date').value : null;
  const interval = plRecurringOn ? document.getElementById('pl-f-interval').value : null;
  const notes    = plRecurringOn ? document.getElementById('pl-f-notes').value : null;

  if (!company || !product || !value) {
    alert('Nama kontak, produk, dan nilai deal wajib diisi.');
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  if (plCurrentDealId) {
    // Edit
    const d = plDeals.find(x => x.id === plCurrentDealId);
    if (d) {
      d.company = company; d.product = product; d.value = value;
      d.stage = stage; d.type = type; d.pic = pic; d.channel = channel;
      d.recurring = plRecurringOn;
      d.endDate = endDate; d.interval = interval; d.notes = notes;
      d.autoRenewal = plAutoRenewalOn;
    }
  } else {
    // Add
    const newId = plDeals.length ? Math.max(...plDeals.map(x => x.id)) + 1 : 1;
    plDeals.push({
      id: newId, company, product, value, stage, type, pic, channel,
      recurring: plRecurringOn, interval, endDate, autoRenewal: plAutoRenewalOn,
      notes, date: today, activity: [
        { text: 'Deal dibuat secara manual', time: 'Baru saja', color: 'var(--red)' }
      ]
    });
  }

  closeDealModal();
  plRebuildBoard();
  plUpdateSummary();
}

// ── Drawer: Detail Deal ───────────────────────────────────────
function openDealDrawer(id) {
  const d = plDeals.find(x => x.id === id);
  if (!d) return;
  plCurrentDealId = id;

  // Company name
  document.getElementById('pl-drawer-company').textContent = d.company;

  // Tags
  const tagsEl = document.getElementById('pl-drawer-tags');
  if (tagsEl) {
    const tagMap = {
      baru: 'pl-tag-new', upsell: 'pl-tag-upsell', renewal: 'pl-tag-renewal'
    };
    const chanMap = { wa: 'WhatsApp', ig: 'Instagram', shopee: 'Shopee', web: 'Website', other: 'Lainnya' };
    let html = `<span class="pl-tag ${tagMap[d.type] || 'pl-tag-new'}">${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</span>`;
    if (d.recurring) html += `<span class="pl-tag pl-tag-recurring">Recurring</span>`;
    html += `<span class="pl-tag pl-tag-channel">${chanMap[d.channel] || d.channel}</span>`;
    tagsEl.innerHTML = html;
  }

  // Stage steps
  const stepsEl = document.getElementById('pl-stage-steps');
  const labelsEl = stepsEl ? stepsEl.nextElementSibling : null;
  const stageIdx = STAGE_KEYS.indexOf(d.stage);
  if (stepsEl) {
    stepsEl.innerHTML = STAGE_KEYS.map((s, i) =>
      `<div class="pl-stage-step ${i < stageIdx ? 'done' : i === stageIdx ? 'current' : ''}"></div>`
    ).join('');
  }
  if (labelsEl) {
    labelsEl.innerHTML = STAGE_LABELS.map((lbl, i) =>
      `<div class="pl-stage-step-label ${i === stageIdx ? 'current' : ''}">${lbl}</div>`
    ).join('');
  }

  // Body
  const body = document.getElementById('pl-drawer-body');
  if (!body) return;

  const days = d.recurring ? plDaysUntil(d.endDate) : null;
  const cls  = plRenewalClass(days);
  const w    = plRenewalWidth(days);

  const picNames = { BW: 'Budi Wicaksono', RS: 'Rina Sari', DK: 'Dika Kusuma' };
  const chanNames = { wa: 'WhatsApp', ig: 'Instagram', shopee: 'Shopee', web: 'Website', other: 'Lainnya' };
  const intervalNames = { monthly: 'Bulanan', quarterly: 'Kuartalan', yearly: 'Tahunan' };

  let renewalBox = '';
  if (d.recurring && days !== null) {
    const daysText = days <= 0 ? 'Sudah berakhir' : `${days} hari lagi`;
    if (days <= 45) {
      renewalBox = `
        <div class="pl-renewal-info-box">
          <i class="ti ti-alert-triangle"></i>
          <div class="pl-renewal-info-text">
            <div class="pl-renewal-info-title">Renewal Segera — ${daysText}</div>
            <div class="pl-renewal-info-sub">
              Kontrak berakhir <strong>${d.endDate}</strong>. 
              ${d.autoRenewal ? 'Deal renewal akan otomatis dibuat dan masuk ke stage Negosiasi.' : 'Auto-renewal tidak aktif — perlu tindakan manual.'}
            </div>
          </div>
        </div>`;
    }
  }

  let activityHtml = (d.activity || []).map(a => `
    <div class="pl-activity-item">
      <div class="pl-act-dot" style="background:${a.color}"></div>
      <div class="pl-act-body">
        <div class="pl-act-text">${a.text}</div>
        <div class="pl-act-time">${a.time}</div>
      </div>
    </div>
  `).join('');

  body.innerHTML = `
    <!-- Informasi utama -->
    <div class="pl-dk-section">
      <div class="pl-dk-sec-title"><i class="ti ti-info-circle"></i> Detail Deal</div>
      <div class="pl-dk-grid">
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Produk / Layanan</div>
          <div class="pl-dk-item-value">${d.product}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Nilai</div>
          <div class="pl-dk-item-value green">${plFmt(d.value)}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">PIC</div>
          <div class="pl-dk-item-value">${picNames[d.pic] || d.pic}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Channel</div>
          <div class="pl-dk-item-value">${chanNames[d.channel] || d.channel}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Tipe Deal</div>
          <div class="pl-dk-item-value">${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Dibuat</div>
          <div class="pl-dk-item-value">${d.date}</div>
        </div>
      </div>
    </div>

    ${d.recurring ? `
    <!-- Kontrak berulang -->
    <div class="pl-dk-section">
      <div class="pl-dk-sec-title"><i class="ti ti-refresh" style="color:var(--green)"></i> Info Kontrak Berulang</div>
      <div class="pl-dk-grid">
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Interval</div>
          <div class="pl-dk-item-value">${intervalNames[d.interval] || d.interval}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Berakhir</div>
          <div class="pl-dk-item-value ${cls}">${d.endDate || '—'}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Sisa Hari</div>
          <div class="pl-dk-item-value ${cls}">${days !== null ? days + ' hari' : '—'}</div>
        </div>
        <div class="pl-dk-item">
          <div class="pl-dk-item-label">Auto-Renewal</div>
          <div class="pl-dk-item-value ${d.autoRenewal ? 'green' : ''}">${d.autoRenewal ? 'Aktif' : 'Nonaktif'}</div>
        </div>
      </div>
      <div class="pl-renewal-progress" style="margin-top:6px">
        <div class="pl-renewal-fill ${cls}" style="width:${w}%"></div>
      </div>
    </div>
    ${renewalBox}
    ` : ''}

    ${d.notes ? `
    <div class="pl-dk-section">
      <div class="pl-dk-sec-title">Catatan</div>
      <div style="font-size:12px;color:var(--gray-600);line-height:1.6">${d.notes}</div>
    </div>` : ''}

    <!-- Riwayat aktivitas -->
    <div class="pl-dk-section">
      <div class="pl-dk-sec-title"><i class="ti ti-history"></i> Riwayat Aktivitas</div>
      <div class="pl-activity-list">${activityHtml || '<div style="font-size:11px;color:var(--gray-400)">Belum ada aktivitas.</div>'}</div>
    </div>
  `;

  document.getElementById('pl-drawer-overlay').style.display = 'flex';
}

function closeDealDrawer() {
  document.getElementById('pl-drawer-overlay').style.display = 'none';
}

function editDealFromDrawer() {
  closeDealDrawer();
  if (plCurrentDealId) openEditDeal(plCurrentDealId);
}

function moveToNextStage() {
  const d = plDeals.find(x => x.id === plCurrentDealId);
  if (!d) return;
  const idx = STAGE_KEYS.indexOf(d.stage);
  if (idx < STAGE_KEYS.length - 1) {
    d.stage = STAGE_KEYS[idx + 1];
    d.activity.unshift({ text: `Dipindahkan ke stage ${STAGE_LABELS[idx + 1]}`, time: 'Baru saja', color: 'var(--green)' });
    closeDealDrawer();
    plRebuildBoard();
    plUpdateSummary();
  }
}

// ── Context Menu ──────────────────────────────────────────────
function openCardMenu(e, id) {
  e.stopPropagation();
  plCurrentCtxId = id;
  const menu = document.getElementById('pl-ctx-menu');
  if (!menu) return;
  menu.style.display = 'block';
  const x = Math.min(e.clientX, window.innerWidth - 175);
  const y = Math.min(e.clientY, window.innerHeight - 170);
  menu.style.left = x + 'px';
  menu.style.top  = y + 'px';
}

function closeCtxMenu() {
  const m = document.getElementById('pl-ctx-menu');
  if (m) m.style.display = 'none';
}

function ctxEdit()   { closeCtxMenu(); if (plCurrentCtxId) openEditDeal(plCurrentCtxId); }
function ctxCopy() {
  const d = plDeals.find(x => x.id === plCurrentCtxId);
  if (!d) return;
  const copy = JSON.parse(JSON.stringify(d));
  copy.id = Math.max(...plDeals.map(x => x.id)) + 1;
  copy.company += ' (Salinan)';
  copy.date = new Date().toISOString().split('T')[0];
  copy.activity = [{ text: 'Deal diduplikat', time: 'Baru saja', color: 'var(--gray-400)' }];
  plDeals.push(copy);
  closeCtxMenu();
  plRebuildBoard();
  plUpdateSummary();
}
function ctxDelete() {
  if (!confirm('Hapus deal ini?')) return;
  const idx = plDeals.findIndex(x => x.id === plCurrentCtxId);
  if (idx !== -1) plDeals.splice(idx, 1);
  closeCtxMenu();
  plRebuildBoard();
  plUpdateSummary();
}
function ctxMove() {
  closeCtxMenu();
  openDealDrawer(plCurrentCtxId);
}

// ── Board rebuild (search + filter) ──────────────────────────
function plRebuildBoard() {
  const search  = (document.getElementById('pl-search-input')  || {}).value?.toLowerCase() || '';
  const picF    = (document.getElementById('pl-filter-pic')    || {}).value || '';
  const typeF   = (document.getElementById('pl-filter-type')   || {}).value || '';

  const filtered = plDeals.filter(d => {
    const matchSearch = !search || d.company.toLowerCase().includes(search) || d.product.toLowerCase().includes(search);
    const matchPic    = !picF   || d.pic === picF;
    const matchType   = !typeF  || d.type === typeF;
    return matchSearch && matchPic && matchType;
  });

  const tagMap = { baru: 'pl-tag-new', upsell: 'pl-tag-upsell', renewal: 'pl-tag-renewal' };
  const chanMap = { wa: 'WhatsApp', ig: 'Instagram', shopee: 'Shopee', web: 'Website', other: 'Lainnya' };
  const picColors = { BW: '#818cf8', RS: '#60a5fa', DK: '#f97316' };

  STAGE_KEYS.forEach(stage => {
    const container = document.getElementById('pl-cards-' + stage);
    const countEl   = document.getElementById('pl-count-' + stage);
    const valEl     = document.getElementById('pl-val-' + stage);
    if (!container) return;

    const stageDeal = filtered.filter(d => d.stage === stage);
    const total = stageDeal.reduce((s, d) => s + d.value, 0);

    if (countEl) countEl.textContent = stageDeal.length;
    if (valEl)   valEl.textContent   = stageDeal.length ? plFmt(total) : 'Rp 0';

    if (!stageDeal.length) {
      container.innerHTML = '<div class="pl-col-empty"><i class="ti ti-inbox"></i>Belum ada deal di stage ini</div>';
      return;
    }

    container.innerHTML = stageDeal.map(d => {
      const days = d.recurring ? plDaysUntil(d.endDate) : null;
      const cls  = plRenewalClass(days);
      const w    = plRenewalWidth(days);

      const renewalHTML = (d.recurring && days !== null) ? `
        <div class="pl-renewal-bar">
          <div class="pl-renewal-label">
            <div class="pl-renewal-text"><i class="ti ti-refresh"></i> Kontrak berakhir</div>
            <div class="pl-renewal-days ${cls}">${days <= 0 ? 'Berakhir' : days + ' hari lagi'}</div>
          </div>
          <div class="pl-renewal-progress">
            <div class="pl-renewal-fill ${cls}" style="width:${w}%"></div>
          </div>
        </div>` : '';

      const recurringTag = d.recurring ? `<span class="pl-tag pl-tag-recurring">Recurring</span>` : '';

      return `
        <div class="pl-card" data-stage="${stage}" data-id="${d.id}" onclick="openDealDrawer(${d.id})" draggable="false">
          <div class="pl-drag-handle" title="Drag untuk pindah stage" onmousedown="plStartDrag(event,${d.id})">
            <svg width="16" height="10" viewBox="0 0 16 10" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
              <rect y="0" width="16" height="1.8" rx="0.9" fill="currentColor"/>
              <rect y="4.1" width="16" height="1.8" rx="0.9" fill="currentColor"/>
            </svg>
          </div>
          <div class="pl-card-top">
            <div class="pl-card-company">${d.company}</div>
            <button class="pl-card-menu" onclick="openCardMenu(event,${d.id})" title="Opsi">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="icon-dots-vertical">
  <path stroke="none" d="M0 0h24v24H0z" fill="none"/>
  <path d="M12 12m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  <path d="M12 19m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
  <path d="M12 5m-1 0a1 1 0 1 0 2 0a1 1 0 1 0 -2 0" />
</svg>
            </button>
          </div>
          <div class="pl-card-product">${d.product}</div>
          <div class="pl-card-value">${plFmt(d.value)}</div>
          <div class="pl-card-tags">
            <span class="pl-tag ${tagMap[d.type] || 'pl-tag-new'}">${d.type.charAt(0).toUpperCase() + d.type.slice(1)}</span>
            ${recurringTag}
            <span class="pl-tag pl-tag-channel">${chanMap[d.channel] || d.channel}</span>
          </div>
          <div class="pl-card-footer">
            <div class="pl-card-pic">
              <div class="pl-pic-avatar" style="background:${picColors[d.pic] || 'var(--red)'}">${d.pic}</div>
              <div class="pl-pic-name">${d.pic === 'BW' ? 'Budi W.' : d.pic === 'RS' ? 'Rina S.' : 'Dika K.'}</div>
            </div>
            <div class="pl-card-date">${d.stage === 'won' && !d.recurring ? 'Selesai' : d.stage === 'won' ? 'Aktif' : d.date}</div>
          </div>
          ${renewalHTML}
        </div>`;
    }).join('');
  });

  // Sync flow bar counts & scroll buttons after rebuild
  plUpdateFlow();
  setTimeout(plUpdateScrollBtns, 50);
}

// ══ DRAG & DROP ENGINE ═══════════════════════════════════════
// Drag state
let plDrag = {
  active:   false,
  dealId:   null,
  ghost:    null,        // clone element following cursor
  srcStage: null,
  overStage: null,
  offX: 0, offY: 0,     // cursor offset inside card
  lastClientX: null, lastClientY: null, // posisi kursor terakhir (dipakai loop auto-scroll)
  autoScrollRAF: null,  // id requestAnimationFrame untuk auto-scroll
};

/* Called on mousedown of the drag handle */
function plStartDrag(e, dealId) {
  e.stopPropagation();   // don't open drawer
  e.preventDefault();

  const card = e.currentTarget.closest('.pl-card');
  if (!card) return;

  const d     = plDeals.find(x => x.id === dealId);
  if (!d) return;

  const rect  = card.getBoundingClientRect();
  plDrag.active   = true;
  plDrag.dealId   = dealId;
  plDrag.srcStage = d.stage;
  plDrag.overStage = d.stage;
  plDrag.offX     = e.clientX - rect.left;
  plDrag.offY     = e.clientY - rect.top;
  plDrag.lastClientX = e.clientX;
  plDrag.lastClientY = e.clientY;

  // Build ghost (visual clone)
  const ghost = card.cloneNode(true);
  ghost.classList.add('pl-card-ghost');
  ghost.style.width  = rect.width + 'px';
  ghost.style.left   = (e.clientX - plDrag.offX) + 'px';
  ghost.style.top    = (e.clientY - plDrag.offY) + 'px';
  document.body.appendChild(ghost);
  plDrag.ghost = ghost;

  // Mark original card as dragging (semi-transparent)
  card.classList.add('pl-card-is-dragging');

  // Highlight drop zones
  document.querySelectorAll('.pl-cards').forEach(col => col.classList.add('pl-drop-zone'));

  document.addEventListener('mousemove', plOnDragMove);
  document.addEventListener('mouseup',   plOnDragEnd);

  // Mulai loop auto-scroll (aktif hanya saat kursor dekat tepi board)
  if (!plDrag.autoScrollRAF) {
    plDrag.autoScrollRAF = requestAnimationFrame(plAutoScrollTick);
  }
}

function plOnDragMove(e) {
  if (!plDrag.active) return;

  plDrag.lastClientX = e.clientX;
  plDrag.lastClientY = e.clientY;

  // Move ghost
  plDrag.ghost.style.left = (e.clientX - plDrag.offX) + 'px';
  plDrag.ghost.style.top  = (e.clientY - plDrag.offY) + 'px';

  plUpdateDragHoverTarget(e.clientX, e.clientY);
}

/* Deteksi kolom yang sedang dihover kursor + update highlight drop-zone.
   Dipisah dari plOnDragMove supaya bisa dipanggil ulang oleh loop
   auto-scroll (plAutoScrollTick) saat kursor diam tapi board ikut bergeser. */
function plUpdateDragHoverTarget(clientX, clientY) {
  if (!plDrag.active || !plDrag.ghost) return;

  plDrag.ghost.style.pointerEvents = 'none';
  const target = document.elementFromPoint(clientX, clientY);
  plDrag.ghost.style.pointerEvents = '';

  const col = target ? target.closest('.pl-col[data-stage]') : null;
  const newStage = col ? col.dataset.stage : null;

  // Update column highlight
  document.querySelectorAll('.pl-col[data-stage]').forEach(c => {
    c.classList.toggle('pl-drop-active', c.dataset.stage === newStage);
  });
  plDrag.overStage = newStage;
}

/* ══ AUTO-SCROLL SAAT DRAG DEKAT UJUNG BOARD ══════════════════
   Selama drag berlangsung, kalau kursor mendekati tepi atas/bawah/
   kiri/kanan #pl-board-wrap, board akan auto-scroll ke arah itu
   supaya user tidak perlu lepas drag untuk scroll manual. */
const PL_AUTOSCROLL_EDGE      = 70; // px zona sensitif dari tepi
const PL_AUTOSCROLL_MAX_SPEED = 18; // px per frame saat kursor tepat di ujung
const PL_AUTOSCROLL_TOLERANCE = 40; // px toleransi kursor sedikit keluar dari wrap

function plAutoScrollTick() {
  if (!plDrag.active) { plDrag.autoScrollRAF = null; return; }

  const wrap = document.getElementById('pl-board-wrap');
  const x = plDrag.lastClientX;
  const y = plDrag.lastClientY;

  if (!wrap || x === null || y === null) {
    plDrag.autoScrollRAF = requestAnimationFrame(plAutoScrollTick);
    return;
  }

  const rect = wrap.getBoundingClientRect();
  let scrolled = false;

  const distTop    = y - rect.top;
  const distBottom = rect.bottom - y;
  const distLeft   = x - rect.left;
  const distRight  = rect.right - x;

  const speedFromDist = (dist) =>
    Math.ceil((1 - Math.max(dist, 0) / PL_AUTOSCROLL_EDGE) * PL_AUTOSCROLL_MAX_SPEED);

  // Vertikal — atas
  if (distTop < PL_AUTOSCROLL_EDGE && distTop > -PL_AUTOSCROLL_TOLERANCE && wrap.scrollTop > 0) {
    wrap.scrollTop -= speedFromDist(distTop);
    scrolled = true;
  }
  // Vertikal — bawah
  else if (distBottom < PL_AUTOSCROLL_EDGE && distBottom > -PL_AUTOSCROLL_TOLERANCE &&
           wrap.scrollTop + wrap.clientHeight < wrap.scrollHeight) {
    wrap.scrollTop += speedFromDist(distBottom);
    scrolled = true;
  }

  // Horizontal — kiri
  if (distLeft < PL_AUTOSCROLL_EDGE && distLeft > -PL_AUTOSCROLL_TOLERANCE && wrap.scrollLeft > 0) {
    wrap.scrollLeft -= speedFromDist(distLeft);
    scrolled = true;
  }
  // Horizontal — kanan
  else if (distRight < PL_AUTOSCROLL_EDGE && distRight > -PL_AUTOSCROLL_TOLERANCE &&
           wrap.scrollLeft + wrap.clientWidth < wrap.scrollWidth) {
    wrap.scrollLeft += speedFromDist(distRight);
    scrolled = true;
  }

  // Board ikut geser → posisi kolom di bawah kursor bisa berubah, refresh highlight
  if (scrolled) plUpdateDragHoverTarget(x, y);

  plDrag.autoScrollRAF = requestAnimationFrame(plAutoScrollTick);
}

function plOnDragEnd(e) {
  if (!plDrag.active) return;

  document.removeEventListener('mousemove', plOnDragMove);
  document.removeEventListener('mouseup',   plOnDragEnd);

  const destStage = plDrag.overStage;
  const d         = plDeals.find(x => x.id === plDrag.dealId);

  if (d && destStage && destStage !== d.stage) {
    const oldLabel = plStages.find(s => s.key === d.stage)?.label || d.stage;
    const newLabel = plStages.find(s => s.key === destStage)?.label || destStage;
    d.stage = destStage;
    d.activity.unshift({
      text: `Dipindahkan dari ${oldLabel} ke ${newLabel}`,
      time: 'Baru saja',
      color: 'var(--green)',
    });
    plRebuildBoard();
    plUpdateSummary();
    plUpdateFlow();
  }

  // Clean up ghost & states
  if (plDrag.ghost) { plDrag.ghost.remove(); plDrag.ghost = null; }
  document.querySelectorAll('.pl-card-is-dragging').forEach(c => c.classList.remove('pl-card-is-dragging'));
  document.querySelectorAll('.pl-drop-zone').forEach(c => c.classList.remove('pl-drop-zone'));
  document.querySelectorAll('.pl-drop-active').forEach(c => c.classList.remove('pl-drop-active'));

  plDrag.active   = false;
  plDrag.dealId   = null;
  plDrag.srcStage = null;
  plDrag.overStage = null;
  plDrag.lastClientX = null;
  plDrag.lastClientY = null;
  if (plDrag.autoScrollRAF) {
    cancelAnimationFrame(plDrag.autoScrollRAF);
    plDrag.autoScrollRAF = null;
  }
}
// ═════════════════════════════════════════════════════════════

// ══ COLUMN DRAG ENGINE ═══════════════════════════════════════
// Reorder stages by dragging the column header handle
let plColDrag = {
  active:    false,
  stageKey:  null,
  ghost:     null,
  srcIndex:  -1,
  dropKey:   null,   // key of the column being hovered over
  dropSide:  null,   // 'before' | 'after'
  offX: 0, offY: 0,
};

function plStartColDrag(e, stageKey) {
  e.stopPropagation();
  e.preventDefault();

  const col = e.currentTarget.closest('.pl-col[data-stage]');
  if (!col) return;

  const srcIndex = plStages.findIndex(s => s.key === stageKey);
  if (srcIndex === -1) return;

  const rect = col.getBoundingClientRect();

  plColDrag.active      = true;
  plColDrag.stageKey    = stageKey;
  plColDrag.srcIndex    = srcIndex;
  plColDrag.dropKey     = null;
  plColDrag.dropSide    = null;
  plColDrag.offX        = e.clientX - rect.left;
  plColDrag.offY        = e.clientY - rect.top;

  // Ghost: shallow visual clone of the column header
  const ghost = document.createElement('div');
  ghost.className = 'pl-col-ghost';
  ghost.style.width  = rect.width + 'px';
  ghost.style.height = rect.height + 'px';
  ghost.style.left   = (e.clientX - plColDrag.offX) + 'px';
  ghost.style.top    = (e.clientY - plColDrag.offY) + 'px';

  // Fill ghost with column header content only
  const stageObj = plStages[srcIndex];
  ghost.innerHTML = `
    <div style="padding:10px 14px;display:flex;flex-direction:column;gap:6px;">
      <div style="display:flex;align-items:center;gap:8px;">
        <div style="width:9px;height:9px;border-radius:50%;background:${stageObj.color};flex-shrink:0"></div>
        <div style="font-size:12px;font-weight:700;color:var(--gray-800);flex:1">${plEsc(stageObj.label)}</div>
        <div style="font-size:10px;font-weight:700;padding:2px 7px;border-radius:100px;background:var(--gray-100);color:var(--gray-600)">${plDeals.filter(d=>d.stage===stageObj.key).length}</div>
      </div>
      <div style="font-size:11px;font-weight:600;color:var(--gray-600)">${plFmt(plDeals.filter(d=>d.stage===stageObj.key).reduce((s,d)=>s+d.value,0))}</div>
    </div>`;

  document.body.appendChild(ghost);
  plColDrag.ghost = ghost;

  // Dim the source column
  col.classList.add('pl-col-is-dragging');

  document.addEventListener('mousemove', plOnColDragMove);
  document.addEventListener('mouseup',   plOnColDragEnd);
}

function plOnColDragMove(e) {
  if (!plColDrag.active) return;

  // Move ghost
  plColDrag.ghost.style.left = (e.clientX - plColDrag.offX) + 'px';
  plColDrag.ghost.style.top  = (e.clientY - plColDrag.offY) + 'px';

  // Hit-test under ghost
  plColDrag.ghost.style.pointerEvents = 'none';
  const target = document.elementFromPoint(e.clientX, e.clientY);
  plColDrag.ghost.style.pointerEvents = '';

  const overCol = target ? target.closest('.pl-col[data-stage]:not(.pl-col-addstage)') : null;
  const overKey = overCol ? overCol.dataset.stage : null;

  // Clear all indicators
  document.querySelectorAll('.pl-col[data-stage]').forEach(c =>
    c.classList.remove('pl-col-drop-before', 'pl-col-drop-after')
  );

  // Reset drop target
  plColDrag.dropKey  = null;
  plColDrag.dropSide = null;

  if (overCol && overKey && overKey !== plColDrag.stageKey) {
    const r    = overCol.getBoundingClientRect();
    const side = e.clientX < r.left + r.width / 2 ? 'before' : 'after';
    overCol.classList.add(side === 'before' ? 'pl-col-drop-before' : 'pl-col-drop-after');
    plColDrag.dropKey  = overKey;
    plColDrag.dropSide = side;
  }
}

function plOnColDragEnd(e) {
  if (!plColDrag.active) return;

  document.removeEventListener('mousemove', plOnColDragMove);
  document.removeEventListener('mouseup',   plOnColDragEnd);

  const { stageKey, dropKey, dropSide } = plColDrag;

  if (dropKey && dropSide) {
    const src     = plStages.findIndex(s => s.key === stageKey);
    const refIdx  = plStages.findIndex(s => s.key === dropKey);

    if (src !== -1 && refIdx !== -1) {
      // Remove the dragged stage first
      const [moved] = plStages.splice(src, 1);

      // Recalculate refIdx after removal
      const newRef = plStages.findIndex(s => s.key === dropKey);
      const insertAt = dropSide === 'before' ? newRef : newRef + 1;

      plStages.splice(insertAt, 0, moved);
      plSyncStageArrays();
      plRenderColumns();
      plRenderFlowBar();
      plRebuildBoard();
      plUpdateSummary();
      plUpdateFlow();
    }
  }

  // Cleanup
  if (plColDrag.ghost) { plColDrag.ghost.remove(); plColDrag.ghost = null; }
  document.querySelectorAll('.pl-col-is-dragging').forEach(c => c.classList.remove('pl-col-is-dragging'));
  document.querySelectorAll('.pl-col-drop-before, .pl-col-drop-after').forEach(c =>
    c.classList.remove('pl-col-drop-before', 'pl-col-drop-after')
  );

  plColDrag.active   = false;
  plColDrag.stageKey = null;
  plColDrag.dropKey  = null;
  plColDrag.dropSide = null;
}
// ═════════════════════════════════════════════════════════════

// ── Event Listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  plRenderColumns();
  plRenderFlowBar();
  plRebuildBoard();
  plUpdateSummary();
  plUpdateFlow();
  plInitAIPanelToggle();

  const searchInput = document.getElementById('pl-search-input');
  const picFilter   = document.getElementById('pl-filter-pic');
  const typeFilter  = document.getElementById('pl-filter-type');
  const addBtn      = document.getElementById('pl-add-deal-btn');

  if (searchInput) searchInput.addEventListener('input', plRebuildBoard);
  if (picFilter)   picFilter.addEventListener('change', plRebuildBoard);
  if (typeFilter)  typeFilter.addEventListener('change', plRebuildBoard);
  if (addBtn)      addBtn.addEventListener('click', () => openAddDeal('prospek'));

  // Board scroll arrows
  const boardWrap = document.getElementById('pl-board-wrap');
  if (boardWrap) {
    boardWrap.addEventListener('scroll', plUpdateScrollBtns);
    setTimeout(plUpdateScrollBtns, 150);

    // Pastikan arrow muncul saat layout selesai render
    const ro = new ResizeObserver(() => plUpdateScrollBtns());
    ro.observe(boardWrap);
    }

  // Close context menu on outside click
  document.addEventListener('click', (e) => {
    const m = document.getElementById('pl-ctx-menu');
    if (m && !m.contains(e.target)) closeCtxMenu();
    const sm = document.getElementById('pl-stage-menu');
    if (sm && !sm.contains(e.target)) closeStageMenu();
  });
});