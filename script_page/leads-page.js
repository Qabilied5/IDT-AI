/* ===================================
   leads-page.js — Indotrading AI
   Kontak / Leads Page Logic
   =================================== */

// ── Data dummy leads ──────────────────────────────────────────
const LEADS_DATA = [
  { id:1,  nama:'Meli',          perusahaan:'Gudang Tenda Muhamad Almer', tanggal:'12 Jun 2026', email:'gudangtendamuhamadalmer12@gmail.com', phone:'82381272032', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Klik WA',      status:'belum' },
  { id:2,  nama:'Dina',          perusahaan:'PT. Cika Inti Karya',        tanggal:'11 Jun 2026', email:'dinadina@gmail.com',                  phone:'87797508972', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Klik WA',      status:'belum' },
  { id:3,  nama:'Adi Santoso',   perusahaan:'CV. Maju Bersama',           tanggal:'11 Jun 2026', email:'adi.santoso@majubersama.id',           phone:'81234567890', kota:'Surabaya',kategori:'potensi', sumber:'msg',    aktivitas:'Kirim Pesan',  status:'dihubungi' },
  { id:4,  nama:'Rini Wijaya',   perusahaan:'PT. Sumber Makmur',          tanggal:'10 Jun 2026', email:'rini@sumbermakmur.co.id',             phone:'85678901234', kota:'Bandung', kategori:'real',    sumber:'rfq',    aktivitas:'RFQ',          status:'followup' },
  { id:5,  nama:'Budi Hartono',  perusahaan:'UD. Karya Abadi',            tanggal:'10 Jun 2026', email:'budi.hartono@gmail.com',              phone:'81398765432', kota:'Semarang',kategori:'potensi', sumber:'profil', aktivitas:'Kunjungi Profil',status:'belum' },
  { id:6,  nama:'Susi Rahayu',   perusahaan:'PT. Indo Jaya',              tanggal:'09 Jun 2026', email:'susi.rahayu@indojaya.com',            phone:'87712345678', kota:'Medan',   kategori:'belum',   sumber:'profil', aktivitas:'Kunjungi Profil',status:'belum' },
  { id:7,  nama:'Hendra Kusuma', perusahaan:'CV. Teknik Mandiri',         tanggal:'09 Jun 2026', email:'hendra@teknikmandiri.id',             phone:'82298765001', kota:'Jakarta', kategori:'real',    sumber:'wa',     aktivitas:'Klik WA',      status:'closed' },
  { id:8,  nama:'Dewi Anggraeni',perusahaan:'PT. Aneka Produk',           tanggal:'08 Jun 2026', email:'dewi.a@anekaproduk.com',              phone:'89512345000', kota:'Yogyakarta',kategori:'potensi',sumber:'msg',   aktivitas:'Kirim Pesan',  status:'dihubungi' },
  { id:9,  nama:'Fajar Nugraha', perusahaan:'UD. Fajar Tani',             tanggal:'08 Jun 2026', email:'fajar@fajartani.id',                  phone:'81111222333', kota:'Malang',  kategori:'belum',   sumber:'rfq',    aktivitas:'RFQ',          status:'belum' },
  { id:10, nama:'Lestari Wahyu', perusahaan:'CV. Lestari Group',          tanggal:'07 Jun 2026', email:'lestari.w@lestarigroup.com',          phone:'82233445566', kota:'Surabaya',kategori:'real',    sumber:'wa',     aktivitas:'Klik WA',      status:'followup' },
  { id:11, nama:'Teguh Prabowo', perusahaan:'PT. Prabowo Industri',       tanggal:'07 Jun 2026', email:'teguh@prabowoindustri.co.id',         phone:'85544332211', kota:'Jakarta', kategori:'real',    sumber:'msg',    aktivitas:'Kirim Pesan',  status:'belum' },
  { id:12, nama:'Nita Sari',     perusahaan:'CV. Nita Kreatif',           tanggal:'06 Jun 2026', email:'nita@nitakreatif.id',                 phone:'87700998877', kota:'Bandung', kategori:'potensi', sumber:'profil', aktivitas:'Kunjungi Profil',status:'dihubungi' },
  { id:13, nama:'Arief Gunawan', perusahaan:'PT. Gunawan Jaya',           tanggal:'06 Jun 2026', email:'arief.g@gunawanjaya.id',              phone:'81234000111', kota:'Semarang',kategori:'belum',   sumber:'wa',     aktivitas:'Klik WA',      status:'belum' },
  { id:14, nama:'Maya Putri',    perusahaan:'UD. Maya Sejahtera',         tanggal:'05 Jun 2026', email:'maya.p@gmail.com',                    phone:'82345123456', kota:'Medan',   kategori:'real',    sumber:'rfq',    aktivitas:'RFQ',          status:'closed' },
  { id:15, nama:'Rizky Firmansyah','perusahaan':'CV. Rizky Maju',         tanggal:'05 Jun 2026', email:'rizky.f@rizkymaju.id',                phone:'89912345678', kota:'Jakarta', kategori:'potensi', sumber:'msg',    aktivitas:'Kirim Pesan',  status:'belum' },
];

// ── State ─────────────────────────────────────────────────────
let lpState = {
  kat: 'semua',       // kategori filter
  src: null,          // sumber filter
  query: '',          // search query
  date: 'semua',      // date filter
  page: 1,
  perPage: 10,
  statusTarget: null, // id lead yg sedang diupdate status
};

// ── Init ──────────────────────────────────────────────────────
function initLeadsPage() {
  renderLeadsTable();
  updateKatCounts();
}

// ── Filter: Kategori ──────────────────────────────────────────
function filterLeadKat(btn, kat) {
  document.querySelectorAll('.lp-kat-btn').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  lpState.kat = kat;
  lpState.page = 1;
  renderLeadsTable();
}

// ── Filter: Sumber ────────────────────────────────────────────
function filterLeadSrc(card, src) {
  const cards = document.querySelectorAll('.lp-sumber-card');
  if (card.classList.contains('active-src') && lpState.src === src) {
    // toggle off
    card.classList.remove('active-src');
    lpState.src = null;
  } else {
    cards.forEach(c => c.classList.remove('active-src'));
    card.classList.add('active-src');
    lpState.src = src;
  }
  lpState.page = 1;
  renderLeadsTable();
}

// ── Filter: Search & Date ─────────────────────────────────────
function filterLeadsTable() {
  lpState.query = document.getElementById('lp-search').value.toLowerCase();
  lpState.date  = document.getElementById('lp-date-filter').value;
  lpState.page  = 1;
  renderLeadsTable();
}

// ── Toggle Filter Drawer ──────────────────────────────────────
function toggleLeadFilter() {
  const drawer = document.getElementById('lp-filter-drawer');
  drawer.style.display = drawer.style.display === 'none' ? 'block' : 'none';
}

// ── Filter Logic ──────────────────────────────────────────────
function getFilteredLeads() {
  let data = [...LEADS_DATA];

  if (lpState.kat && lpState.kat !== 'semua') {
    data = data.filter(l => l.kategori === lpState.kat);
  }
  if (lpState.src) {
    data = data.filter(l => l.sumber === lpState.src);
  }
  if (lpState.query) {
    data = data.filter(l =>
      l.nama.toLowerCase().includes(lpState.query) ||
      l.perusahaan.toLowerCase().includes(lpState.query) ||
      l.email.toLowerCase().includes(lpState.query) ||
      l.phone.includes(lpState.query) ||
      l.kota.toLowerCase().includes(lpState.query)
    );
  }
  return data;
}

// ── Render Table ──────────────────────────────────────────────
function renderLeadsTable() {
  const filtered = getFilteredLeads();
  const total    = filtered.length;
  const pages    = Math.ceil(total / lpState.perPage);
  lpState.page   = Math.min(lpState.page, pages || 1);
  const start    = (lpState.page - 1) * lpState.perPage;
  const paged    = filtered.slice(start, start + lpState.perPage);

  const tbody = document.getElementById('lp-table-body');
  const empty = document.getElementById('lp-empty');
  if (!tbody) return;

  if (paged.length === 0) {
    tbody.innerHTML = '';
    empty.style.display = 'flex';
  } else {
    empty.style.display = 'none';
    tbody.innerHTML = paged.map(lead => renderLeadRow(lead)).join('');
  }

  renderPagination(total, pages);
}

// ── Render Single Row ─────────────────────────────────────────
function renderLeadRow(lead) {
  const catLabel = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const catClass = lead.kategori;
  const srcLabel = { wa:'Indotrading – WA', msg:'Indotrading – Pesan', rfq:'Indotrading – RFQ', profil:'Indotrading – Profil' };
  const srcClass = { wa:'src-wa', msg:'src-msg', rfq:'src-rfq', profil:'src-profil' };
  const aktClass = { wa:'wa', msg:'msg', rfq:'rfq', profil:'profil' };
  const aktIcon  = { wa:'ti-brand-whatsapp', msg:'ti-message-2', rfq:'ti-file-invoice', profil:'ti-eye' };
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up lanjutan', closed:'Closed / Deal' };
  const statusClass = { belum:'', dihubungi:'dihubungi', followup:'followup', closed:'closed' };
  const statusIcon  = { belum:'ti-circle', dihubungi:'ti-circle-check', followup:'ti-refresh', closed:'ti-check-circle-2' };

  const emailDisplay = lead.email.length > 24 ? lead.email.slice(0, 24) + '…' : lead.email;

  return `
  <div class="lp-row" data-id="${lead.id}">
    <div><input type="checkbox" class="lp-row-check"></div>
    <div>
      <div class="lp-row-name">${lead.nama}</div>
      <div class="lp-row-company"><i class="ti ti-building-store" style="font-size:10px"></i>${lead.perusahaan}</div>
      <div class="lp-row-date"><i class="ti ti-clock" style="font-size:10px"></i>${lead.tanggal}</div>
      <div class="lp-row-tags">
        <span class="lp-tag ${catClass}"><i class="ti ${catClass==='real'?'ti-circle-check':catClass==='potensi'?'ti-star':'ti-minus-circle'}" style="font-size:9px"></i>${catLabel[lead.kategori]}</span>
        <span class="lp-tag ${srcClass[lead.sumber]}"><i class="ti ${aktIcon[lead.sumber]}" style="font-size:9px"></i>${srcLabel[lead.sumber]}</span>
      </div>
    </div>
    <div>
      <div class="lp-contact-email"><i class="ti ti-mail" style="font-size:10px;opacity:.6"></i>${emailDisplay}</div>
      <div class="lp-contact-phone"><i class="ti ti-phone" style="font-size:10px;opacity:.6"></i>${lead.phone}</div>
      <div class="lp-contact-city"><i class="ti ti-map-pin" style="font-size:10px;opacity:.6"></i>${lead.kota}</div>
    </div>
    <div>
      <span class="lp-aktivitas-badge ${aktClass[lead.sumber]}">
        <i class="ti ${aktIcon[lead.sumber]}" style="font-size:11px"></i>${lead.aktivitas}
      </span>
    </div>
    <div>
      <button class="lp-status-followup ${statusClass[lead.status]}" onclick="openStatusModal(${lead.id})">
        <i class="ti ${statusIcon[lead.status]}"></i>${statusLabel[lead.status]}
      </button>
    </div>
    <div class="lp-aksi-wrap">
      <button class="lp-btn-wa" onclick="hubungiWA(${lead.id})"><i class="ti ti-brand-whatsapp"></i> Hubungi via WA</button>
      <button class="lp-btn-more" onclick="openLeadModal(${lead.id})"><i class="ti ti-dots-vertical"></i></button>
    </div>
  </div>`;
}

// ── Pagination ────────────────────────────────────────────────
function renderPagination(total, pages) {
  const info   = document.getElementById('lp-page-info');
  const nums   = document.getElementById('lp-page-nums');
  const prev   = document.getElementById('lp-prev');
  const next   = document.getElementById('lp-next');
  if (!info) return;

  const start = (lpState.page - 1) * lpState.perPage + 1;
  const end   = Math.min(lpState.page * lpState.perPage, total);
  info.textContent = total === 0
    ? 'Tidak ada leads'
    : `Menampilkan ${start}–${end} dari ${total} leads`;

  // page numbers (show max 5)
  nums.innerHTML = '';
  let startP = Math.max(1, lpState.page - 2);
  let endP   = Math.min(pages, startP + 4);
  startP     = Math.max(1, endP - 4);
  for (let i = startP; i <= endP; i++) {
    const btn = document.createElement('button');
    btn.className = 'lp-page-num' + (i === lpState.page ? ' active' : '');
    btn.textContent = i;
    btn.onclick = () => { lpState.page = i; renderLeadsTable(); };
    nums.appendChild(btn);
  }

  prev.disabled = lpState.page <= 1;
  next.disabled = lpState.page >= pages;
}

function changePage(dir) {
  lpState.page += dir;
  renderLeadsTable();
}

// ── Update kategori counts dari data ─────────────────────────
function updateKatCounts() {
  const counts = { semua: LEADS_DATA.length, real: 0, potensi: 0, belum: 0 };
  LEADS_DATA.forEach(l => { if (counts[l.kategori] !== undefined) counts[l.kategori]++; });
  document.querySelectorAll('.lp-kat-btn').forEach(btn => {
    const kat = btn.dataset.kat;
    const numEl = btn.querySelector('.lp-kat-num');
    if (numEl && counts[kat] !== undefined) numEl.textContent = counts[kat];
  });
}

// ── Select All ────────────────────────────────────────────────
function toggleAllLeads(masterCheck) {
  document.querySelectorAll('.lp-row-check').forEach(cb => {
    cb.checked = masterCheck.checked;
  });
}

// ── Modal: Detail Lead ────────────────────────────────────────
function openLeadModal(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;

  document.getElementById('lp-modal-title').innerHTML =
    `<i class="ti ti-user-circle"></i> ${lead.nama}`;

  const catLabel = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const srcLabel = { wa:'Klik WA & Telepon', msg:'Kirim Pesan', rfq:'RFQ', profil:'Kunjungi Profil' };
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up lanjutan', closed:'Closed / Deal' };

  document.getElementById('lp-modal-body').innerHTML = `
    <div class="lp-detail-row"><span class="lp-detail-label">Perusahaan</span><span class="lp-detail-val">${lead.perusahaan}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Email</span><span class="lp-detail-val">${lead.email}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">No. HP / WA</span><span class="lp-detail-val">${lead.phone}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Kota</span><span class="lp-detail-val">${lead.kota}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Tanggal</span><span class="lp-detail-val">${lead.tanggal}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Kategori</span><span class="lp-detail-val">${catLabel[lead.kategori] || '-'}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Sumber</span><span class="lp-detail-val">${srcLabel[lead.sumber] || '-'}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Aktivitas</span><span class="lp-detail-val">${lead.aktivitas}</span></div>
    <div class="lp-detail-row"><span class="lp-detail-label">Status</span><span class="lp-detail-val">${statusLabel[lead.status] || '-'}</span></div>
  `;

  const waBtn = document.getElementById('lp-modal-wa-btn');
  waBtn.onclick = () => hubungiWA(id);

  document.getElementById('lp-modal-lead').style.display = 'flex';
}
function closeLeadModal() {
  document.getElementById('lp-modal-lead').style.display = 'none';
}

// ── Modal: Update Status ──────────────────────────────────────
function openStatusModal(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  lpState.statusTarget = id;
  document.getElementById('lp-status-select').value = lead.status;
  document.getElementById('lp-status-note').value = '';
  document.getElementById('lp-modal-status').style.display = 'flex';
}
function closeStatusModal() {
  document.getElementById('lp-modal-status').style.display = 'none';
  lpState.statusTarget = null;
}
function submitStatus() {
  const id = lpState.statusTarget;
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  lead.status = document.getElementById('lp-status-select').value;
  closeStatusModal();
  renderLeadsTable();
  showLpToast('Status berhasil diperbarui', 'success');
}

// ── Aksi: Hubungi WA ─────────────────────────────────────────
function hubungiWA(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  // update status jadi dihubungi otomatis
  if (lead.status === 'belum') {
    lead.status = 'dihubungi';
    renderLeadsTable();
  }
  showLpToast(`Membuka WhatsApp untuk ${lead.nama}…`, 'success');
  // Simulasi: buka WA
  // window.open(`https://wa.me/62${lead.phone}`, '_blank');
}

// ── AREA 3: Buy Leads Banner — Lihat Rekomendasi AI ───────────
function getAiRecommendedLeads(limit = 6) {
  // Pilih leads dengan AI Score HOT atau WARM, prioritas HOT dulu,
  // lalu urutkan berdasarkan tanggal terbaru.
  const scoreRank = { HOT: 0, WARM: 1, COLD: 2 };
  return [...LEADS_DATA]
    .map(lead => ({ lead, ai: AI_SCORES[lead.id] || { score: 'WARM', reason: 'Sedang dianalisa' } }))
    .filter(({ ai }) => ai.score !== 'COLD')
    .sort((a, b) => scoreRank[a.ai.score] - scoreRank[b.ai.score])
    .slice(0, limit);
}

function openAiRecommendation() {
  const overlay = document.getElementById('lp-modal-airec');
  if (!overlay) return;

  const items = getAiRecommendedLeads();
  const scoreIcon = { HOT: '🔥', WARM: '🌤', COLD: '🧊' };
  const scoreCls  = { HOT: 'hot', WARM: 'warm', COLD: 'cold' };

  const listEl = document.getElementById('lp-airec-list');
  document.getElementById('lp-airec-count').textContent = items.length;

  if (items.length === 0) {
    listEl.innerHTML = `
      <div style="text-align:center;padding:24px 10px;color:#9ca3af;font-size:12px">
        <i class="ti ti-mood-empty" style="font-size:24px;display:block;margin-bottom:6px"></i>
        Belum ada rekomendasi baru saat ini.
      </div>`;
  } else {
    listEl.innerHTML = items.map(({ lead, ai }) => {
      const initials = lead.nama.split(' ').map(w => w[0]).slice(0, 2).join('').toUpperCase();
      const alreadyHandled = lead.status !== 'belum';
      return `
        <div class="lp-airec-item" data-id="${lead.id}">
          <div class="lp-airec-avatar">${initials}</div>
          <div class="lp-airec-info">
            <div class="lp-airec-name">${lead.nama} <span style="color:#9ca3af;font-weight:500">— ${lead.kota}</span></div>
            <div class="lp-airec-company">${lead.perusahaan}</div>
            <div class="lp-airec-reason"><i class="ti ti-sparkles" style="font-size:9px"></i>${ai.reason}</div>
          </div>
          <span class="lp-airec-score ${scoreCls[ai.score]}">${scoreIcon[ai.score]} ${ai.score}</span>
          <button class="lp-airec-action" ${alreadyHandled ? 'disabled' : ''} onclick="hubungiAiRecLead(${lead.id})">
            <i class="ti ${alreadyHandled ? 'ti-circle-check' : 'ti-brand-whatsapp'}"></i>
            ${alreadyHandled ? 'Dihubungi' : 'Hubungi'}
          </button>
        </div>`;
    }).join('');
  }

  overlay.style.display = 'flex';
}

function closeAiRecommendation() {
  const overlay = document.getElementById('lp-modal-airec');
  if (overlay) overlay.style.display = 'none';
}

function hubungiAiRecLead(id) {
  hubungiWA(id);
  // Refresh tampilan list di dalam modal supaya tombol berubah jadi "Dihubungi"
  openAiRecommendation();
}

// ── AREA 3: Buy Leads Banner — Cara Kerja Buy Leads ───────────
function openHowBuyLeadsWorks() {
  const overlay = document.getElementById('lp-modal-howit');
  if (overlay) overlay.style.display = 'flex';
}

function closeHowBuyLeadsWorks() {
  const overlay = document.getElementById('lp-modal-howit');
  if (overlay) overlay.style.display = 'none';
}


// ── Toast ─────────────────────────────────────────────────────
function showLpToast(msg, type = '') {
  const toast = document.getElementById('lp-toast');
  toast.className = 'lp-toast' + (type ? ' ' + type : '');
  toast.innerHTML = `<i class="ti ${type === 'success' ? 'ti-circle-check' : 'ti-info-circle'}"></i> ${msg}`;
  toast.style.display = 'flex';
  clearTimeout(window._lpToastTimer);
  window._lpToastTimer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}

// ── Auto-init saat halaman leads aktif ────────────────────────
// Panggil initLeadsPage() dari navigasi utama ketika halaman leads ditampilkan.
// Contoh integrasi di script.js:
//   case 'leads': initLeadsPage(); break;
//
// Atau tambahkan di event navigasi sidebar item "Kontak / Leads":
//   document.addEventListener('DOMContentLoaded', () => {
//     const leadsNav = document.querySelector('[data-page="leads"]');
//     if (leadsNav) leadsNav.addEventListener('click', () => initLeadsPage());
//   });

/* ============================================================
   leads-page-ai.js — Indotrading AI
   Logika 7 AI Feature Areas untuk halaman Leads
   Harus di-load SETELAH leads-page.js
   ============================================================ */

// ── AI Score data per lead ────────────────────────────────────
// Dalam implementasi nyata ini berasal dari model scoring backend.
const AI_SCORES = {
  1:  { score:'HOT',  reason:'Klik WA 1 jam lalu — respons terbaik sekarang' },
  2:  { score:'HOT',  reason:'Real Lead, Jakarta, buka profil 3x hari ini' },
  3:  { score:'WARM', reason:'Sudah dihubungi, tapi belum reply 2 hari' },
  4:  { score:'HOT',  reason:'RFQ dikirim — intent beli sangat tinggi' },
  5:  { score:'WARM', reason:'Kunjungi profil aluminium 2x, belum hubungi' },
  6:  { score:'COLD', reason:'Hanya lihat profil, tidak ada aksi lanjut' },
  7:  { score:'HOT',  reason:'Klik WA 30 menit lalu — sudah dihubungi ✓' },
  8:  { score:'WARM', reason:'Pesan terkirim, masih menunggu balasan' },
  9:  { score:'COLD', reason:'RFQ lama, belum ada aktivitas 5+ hari' },
  10: { score:'WARM', reason:'Repeat WA, follow-up sedang berjalan' },
  11: { score:'HOT',  reason:'Pesan baru hari ini, belum dibalas' },
  12: { score:'WARM', reason:'Kunjungi profil, Bandung, potensi order' },
  13: { score:'COLD', reason:'WA klik tapi tidak ada kontak lanjutan' },
  14: { score:'HOT',  reason:'RFQ closed — kandidat repeat order' },
  15: { score:'WARM', reason:'Pesan terkirim, belum ada respons 1 hari' },
};

// ── AI Urgency data per lead ──────────────────────────────────
const AI_URGENCY = {
  1:  { cls:'hot-time',     text:'1 jam lalu — waktu terbaik!' },
  2:  { cls:'hot-time',     text:'2 jam lalu — segera hubungi' },
  3:  { cls:'warn-time',    text:'2 hari belum dibalas' },
  4:  { cls:'hot-time',     text:'RFQ baru — follow-up sekarang' },
  5:  { cls:'warn-time',    text:'3 hari belum dihubungi' },
  6:  { cls:'neutral-time', text:'5 hari tidak ada aktivitas' },
  7:  { cls:'ok-time',      text:'Sudah dihubungi ✓' },
  8:  { cls:'warn-time',    text:'Menunggu balas 1 hari' },
  9:  { cls:'neutral-time', text:'Tidak aktif 6 hari' },
  10: { cls:'ok-time',      text:'Follow-up sedang berjalan' },
  11: { cls:'hot-time',     text:'Pesan baru — belum dibalas!' },
  12: { cls:'warn-time',    text:'2 hari sejak kunjungan' },
  13: { cls:'neutral-time', text:'4 hari tidak ada kontak' },
  14: { cls:'ok-time',      text:'Deal closed ✓' },
  15: { cls:'warn-time',    text:'1 hari belum ada respons' },
};

// ── AI-generated follow-up messages ─────────────────────────
// Dalam implementasi nyata ini dipanggil ke Anthropic API
// dengan konteks: nama, perusahaan, produk, AI score, aktivitas terakhir.
function generateAiMessage(lead) {
  const templates = {
    wa: `Halo ${lead.nama} dari ${lead.perusahaan}! 👋\n\nSaya dari Alumex Perkasa Jaya. Kami lihat Anda tadi mengklik nomor WA kami — apakah ada produk aluminium yang sedang Anda cari?\n\nKami siap bantu dengan penawaran terbaik dan ready stok. Boleh share kebutuhannya? 🙏`,
    msg: `Halo ${lead.nama}! 😊\n\nTerima kasih sudah mengirim pesan ke toko kami di Indotrading. Kami mau pastikan pertanyaan Anda sudah terjawab dengan baik.\n\nAda yang bisa kami bantu lebih lanjut terkait produk aluminium untuk ${lead.perusahaan}? Kami ada promo khusus minggu ini!`,
    rfq: `Yth. Bapak/Ibu ${lead.nama},\n\nKami dari Alumex Perkasa Jaya — merespons RFQ yang sudah Anda kirimkan. Terima kasih atas kepercayaan Anda!\n\nBerikut kami siapkan penawaran harga kompetitif sesuai spesifikasi yang diminta. Bisa kami diskusikan lebih lanjut via WA ini? 📋`,
    profil: `Halo ${lead.nama} dari ${lead.perusahaan}! 👋\n\nKami perhatikan Anda baru saja mengunjungi halaman produk kami. Apakah ada item yang menarik minat Anda?\n\nKami dengan senang hati membantu dan bisa berikan sample atau penawaran khusus untuk pembelian pertama. 🏭`,
  };
  return templates[lead.sumber] || templates.wa;
}

// ── Override renderLeadRow untuk tambah kolom AI ─────────────
const _origRenderLeadRow = window.renderLeadRow;
window.renderLeadRow = function(lead) {
  const catLabel    = { real:'Real Lead', potensi:'Potensi', belum:'Belum Dikualifikasi' };
  const srcLabel    = { wa:'Indotrading – WA', msg:'Indotrading – Pesan', rfq:'Indotrading – RFQ', profil:'Indotrading – Profil' };
  const srcClass    = { wa:'src-wa', msg:'src-msg', rfq:'src-rfq', profil:'src-profil' };
  const aktClass    = { wa:'wa', msg:'msg', rfq:'rfq', profil:'profil' };
  const aktIcon     = { wa:'ti-brand-whatsapp', msg:'ti-message-2', rfq:'ti-file-invoice', profil:'ti-eye' };
  const statusLabel = { belum:'Belum dihubungi', dihubungi:'Sudah dihubungi', followup:'Follow-up lanjutan', closed:'Closed / Deal' };
  const statusClass = { belum:'', dihubungi:'dihubungi', followup:'followup', closed:'closed' };
  const statusIcon  = { belum:'ti-circle', dihubungi:'ti-circle-check', followup:'ti-refresh', closed:'ti-check-circle-2' };
  const scoreIcon   = { HOT:'🔥', WARM:'🌤', COLD:'🧊' };
  const scoreCls    = { HOT:'hot', WARM:'warm', COLD:'cold' };

  const emailDisplay = lead.email.length > 22 ? lead.email.slice(0, 22) + '…' : lead.email;

  // Area 5
  const aiScore   = AI_SCORES[lead.id]  || { score:'WARM', reason:'Sedang dianalisa' };
  // Area 6
  const aiUrgency = AI_URGENCY[lead.id] || { cls:'neutral-time', text:'—' };

  return `
  <div class="lp-row" data-id="${lead.id}">

    <!-- Checkbox -->
    <div><input type="checkbox" class="lp-row-check"></div>

    <!-- Nama & Perusahaan -->
    <div>
      <div class="lp-row-name">${lead.nama}</div>
      <div class="lp-row-company"><i class="ti ti-building-store" style="font-size:10px"></i>${lead.perusahaan}</div>
      <div class="lp-row-date"><i class="ti ti-clock" style="font-size:10px"></i>${lead.tanggal}</div>
      <div class="lp-row-tags">
        <span class="lp-tag ${lead.kategori}">
          <i class="ti ${lead.kategori==='real'?'ti-circle-check':lead.kategori==='potensi'?'ti-star':'ti-minus-circle'}" style="font-size:9px"></i>
          ${catLabel[lead.kategori]}
        </span>
        <span class="lp-tag ${srcClass[lead.sumber]}">
          <i class="ti ${aktIcon[lead.sumber]}" style="font-size:9px"></i>
          ${srcLabel[lead.sumber]}
        </span>
      </div>
    </div>

    <!-- Kontak -->
    <div>
      <div class="lp-contact-email"><i class="ti ti-mail" style="font-size:10px;opacity:.6"></i>${emailDisplay}</div>
      <div class="lp-contact-phone"><i class="ti ti-phone" style="font-size:10px;opacity:.6"></i>${lead.phone}</div>
      <div class="lp-contact-city"><i class="ti ti-map-pin" style="font-size:10px;opacity:.6"></i>${lead.kota}</div>
    </div>

    <!-- Aktivitas Terakhir (+ Area 6 urgency) -->
    <div>
      <span class="lp-aktivitas-badge ${aktClass[lead.sumber]}">
        <i class="ti ${aktIcon[lead.sumber]}" style="font-size:11px"></i>${lead.aktivitas}
      </span>
      <div style="margin-top:5px">
        <span class="lp-urgency-tag ${aiUrgency.cls}">
          <i class="ti ${aiUrgency.cls==='hot-time'?'ti-flame':aiUrgency.cls==='warn-time'?'ti-alert-triangle':aiUrgency.cls==='ok-time'?'ti-circle-check':'ti-clock'}" style="font-size:9px"></i>
          ${aiUrgency.text}
        </span>
      </div>
    </div>

    <!-- Area 5: AI Score -->
    <div class="lp-ai-score-cell">
      <span class="lp-score-badge ${scoreCls[aiScore.score]}">
        ${scoreIcon[aiScore.score]} ${aiScore.score}
      </span>
      <div class="lp-score-reason">${aiScore.reason}</div>
    </div>

    <!-- Status Follow-up -->
    <div>
      <button class="lp-status-followup ${statusClass[lead.status]}" onclick="openStatusModal(${lead.id})">
        <i class="ti ${statusIcon[lead.status]}"></i>${statusLabel[lead.status]}
      </button>
    </div>

    <!-- Aksi (WA + Area 7: AI Follow-up) -->
    <div class="lp-aksi-wrap">
      <div class="lp-aksi-row">
        <button class="lp-btn-wa" onclick="hubungiWA(${lead.id})">
          <i class="ti ti-brand-whatsapp"></i> Hubungi WA
        </button>
        <button class="lp-btn-more" onclick="openLeadModal(${lead.id})">
          <i class="ti ti-dots-vertical"></i>
        </button>
      </div>
      <!-- Area 7 -->
      <button class="lp-btn-ai-followup" onclick="openAiFollowup(${lead.id})">
        <i class="ti ti-brain"></i> Follow-up AI
      </button>
    </div>

  </div>`;
};

// ── AREA 4: Natural Language Pill handler ────────────────────
function applyNlPill(btn, query) {
  // Toggle active state
  document.querySelectorAll('.lp-nl-pill').forEach(p => p.classList.remove('active'));
  const searchEl = document.getElementById('lp-search');
  if (searchEl.value === query) {
    // Second click: clear
    searchEl.value = '';
    lpState.query  = '';
  } else {
    btn.classList.add('active');
    searchEl.value = query;
    lpState.query  = query.toLowerCase();
  }
  lpState.page = 1;
  renderLeadsTable();
}

// ── AREA 7: AI Follow-up Modal ───────────────────────────────
let _aiFollowupLeadId = null;
let _aiFollowupTimer  = null;

function openAiFollowup(id) {
  const lead = LEADS_DATA.find(l => l.id === id);
  if (!lead) return;
  _aiFollowupLeadId = id;

  // Reset modal
  document.getElementById('lp-aifollowup-name').textContent = lead.nama;
  document.getElementById('lp-aifollowup-loading').style.display = 'flex';
  document.getElementById('lp-aifollowup-result').style.display  = 'none';
  document.getElementById('lp-aifollowup-send-btn').style.display = 'none';

  // Context pills
  const aiScore = AI_SCORES[id] || { score:'WARM', reason:'—' };
  const scoreIcon = { HOT:'🔥', WARM:'🌤', COLD:'🧊' };
  document.getElementById('lp-aifollowup-context').innerHTML = `
    <span class="lp-aifollowup-context-pill"><i class="ti ti-user"></i> ${lead.nama}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-building-store"></i> ${lead.perusahaan}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-map-pin"></i> ${lead.kota}</span>
    <span class="lp-aifollowup-context-pill">${scoreIcon[aiScore.score]} AI Score: ${aiScore.score}</span>
    <span class="lp-aifollowup-context-pill"><i class="ti ti-brand-whatsapp" style="color:#16a34a"></i> ${lead.sumber.toUpperCase()}</span>
  `;

  document.getElementById('lp-modal-ai-followup').style.display = 'flex';

  // Simulate AI writing (1.5s delay)
  clearTimeout(_aiFollowupTimer);
  _aiFollowupTimer = setTimeout(() => {
    const msg = generateAiMessage(lead);
    document.getElementById('lp-aifollowup-msg').value = msg;
    document.getElementById('lp-aifollowup-loading').style.display = 'none';
    document.getElementById('lp-aifollowup-result').style.display  = 'block';
    document.getElementById('lp-aifollowup-send-btn').style.display = 'flex';
  }, 1500);
}

function closeAiFollowup() {
  clearTimeout(_aiFollowupTimer);
  document.getElementById('lp-modal-ai-followup').style.display = 'none';
  _aiFollowupLeadId = null;
}

function sendAiFollowupWA() {
  const lead = LEADS_DATA.find(l => l.id === _aiFollowupLeadId);
  if (!lead) return;
  const msg = document.getElementById('lp-aifollowup-msg').value;

  // Auto-update status to dihubungi
  if (lead.status === 'belum') {
    lead.status = 'dihubungi';
    renderLeadsTable();
  }

  // Build WhatsApp URL
  const waMsg = encodeURIComponent(msg);
  // window.open(`https://wa.me/62${lead.phone}?text=${waMsg}`, '_blank');

  closeAiFollowup();
  showLpToast(`Pesan AI untuk ${lead.nama} siap dikirim via WhatsApp ✓`, 'success');
}

// ── Re-init: override initLeadsPage to also re-render with AI ─
const _origInitLeadsPage = window.initLeadsPage;
window.initLeadsPage = function() {
  renderLeadsTable();
  updateKatCounts();
};

// Auto-init if page already active
if (document.getElementById('leads-page') &&
    document.getElementById('leads-page').classList.contains('active-page')) {
  initLeadsPage();
}