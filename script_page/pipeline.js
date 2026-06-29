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

// ── State ─────────────────────────────────────────────────────
let plCurrentDealId   = null;
let plCurrentCtxId    = null;
let plRecurringOn     = false;
let plAutoRenewalOn   = false;
let plModalStage      = 'prospek';

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

const STAGE_LABELS = ['Prospek', 'Kualifikasi', 'Penawaran', 'Negosiasi', 'Closing', 'Won / Aktif'];
const STAGE_KEYS   = ['prospek', 'kualifikasi', 'penawaran', 'negosiasi', 'closing', 'won'];

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

// ── Board Scroll Arrow Buttons ────────────────────────────────
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
        <div class="pl-card" data-stage="${stage}" data-id="${d.id}" onclick="openDealDrawer(${d.id})">
          <div class="pl-card-top">
            <div class="pl-card-company">${d.company}</div>
            <button class="pl-card-menu" onclick="openCardMenu(event,${d.id})" title="Opsi">
              <i class="ti ti-dots"></i>
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

// ── Event Listeners ───────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  plUpdateSummary();
  plUpdateFlow();

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
  });
});