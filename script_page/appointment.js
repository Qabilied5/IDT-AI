const SELLER_CONFIG = {
  staffLabel: 'Penanggung Jawab',   // Ganti jadi 'Sales PIC', 'Terapis', dll. sesuai bisnis
  staffList: [
    'Rina Kartika',
    'Dimas Pratama',
    'Siti Rahayu',
    'Arif Budiman',
  ],
  meetingTypes: [
    { value: 'demo',        label: 'Demo Produk',    colorClass: 'ap-type-demo' },
    { value: 'konsultasi',  label: 'Konsultasi',     colorClass: 'ap-type-konsultasi' },
    { value: 'negosiasi',   label: 'Negosiasi',      colorClass: 'ap-type-negosiasi' },
    { value: 'onboarding',  label: 'Onboarding',     colorClass: 'ap-type-onboarding' },
    { value: 'lainnya',     label: 'Lainnya',        colorClass: 'ap-type-lainnya' },
    /* Contoh tipe lain yang bisa diaktifkan per seller:
    { value: 'reservasi',   label: 'Reservasi',      colorClass: 'ap-type-reservasi' },
    { value: 'treatment',   label: 'Treatment',      colorClass: 'ap-type-treatment' },
    { value: 'servis',      label: 'Servis Kendaraan', colorClass: 'ap-type-servis' },
    { value: 'survey',      label: 'Survey Lokasi',  colorClass: 'ap-type-survey' },
    { value: 'kunjungan',   label: 'Kunjungan Rumah', colorClass: 'ap-type-kunjungan' },
    */
  ],
};

/* ── 1. DATA ──────────────────────────────────────────────────── */
const AP_DATA = [
  {
    id: 1,
    nama: 'Budi Santoso',
    company: 'PT Maju Bersama',
    phone: '081234567890',
    email: 'budi@majubersama.co.id',
    date: '2025-06-04',
    time: '09.00',
    duration: 60,
    type: 'demo',
    typeLabel: 'Demo Produk',
    sales: 'Rina Kartika',
    status: 'terkonfirmasi',
    createdBy: 'ai',
    location: 'https://meet.google.com/abc-defg-hij',
    notes: 'Lead dari website. Tertarik spare part mesin packing. Butuh 50 pcs.',
    aiNote: 'AI mendeteksi minat kuat dari customer — sudah bertanya detail harga dan kuantitas. Disarankan siapkan penawaran spesifik dan contoh produk untuk sesi ini.',
    timeline: [
      { type: 'ai', event: 'AI menerima inquiry dari WhatsApp', sub: 'Customer bertanya ketersediaan spare part', time: '10:24' },
      { type: 'ai', event: 'AI menawarkan 3 slot jadwal', sub: 'Slot Rabu 09.00, 14.00, dan Kamis 10.00', time: '10:25' },
      { type: 'success', event: 'Customer memilih slot Rabu 09.00', sub: 'Konfirmasi diterima via WhatsApp', time: '10:28' },
      { type: 'ai', event: 'AI membuat appointment otomatis', sub: 'Ditugaskan ke Rina Kartika (Sales)', time: '10:28' },
      { type: 'success', event: 'Konfirmasi terkirim ke customer', sub: 'Pesan WhatsApp + detail meeting terkirim', time: '10:29' },
    ],
  },
  {
    id: 2,
    nama: 'Dewi Rahayu',
    company: 'CV Teknindo Jaya',
    phone: '082198765432',
    email: 'dewi@teknindojaya.com',
    date: '2025-06-04',
    time: '11.00',
    duration: 90,
    type: 'negosiasi',
    typeLabel: 'Negosiasi',
    sales: 'Dimas Pratama',
    status: 'terkonfirmasi',
    createdBy: 'ai',
    location: 'Kantor Indotrading Lt. 3, Ruang Rapat A',
    notes: 'Deal potensial Rp 120 juta. Negosiasi harga dan skema pembayaran.',
    aiNote: 'Customer menunjukkan keterlibatan tinggi — sudah 3x interaksi sebelumnya. Rekomendasikan bawa proposal lengkap dan opsi pembayaran yang fleksibel.',
    timeline: [
      { type: 'manual', event: 'Sales membuat appointment manual', sub: 'Dimas Pratama mengatur meeting setelah call awal', time: '08:30 kemarin' },
      { type: 'ai', event: 'AI mengirimkan reminder ke customer', sub: 'Reminder H-1 via WhatsApp terkirim', time: '09:00 kemarin' },
      { type: 'success', event: 'Customer konfirmasi kehadiran', sub: '"Oke, saya akan datang sesuai jadwal"', time: '09:15 kemarin' },
    ],
  },
  {
    id: 3,
    nama: 'Rudi Hartono',
    company: 'UD Sumber Makmur',
    phone: '085678901234',
    email: 'rudi@sumbermakmur.id',
    date: '2025-06-04',
    time: '13.00',
    duration: 60,
    type: 'konsultasi',
    typeLabel: 'Konsultasi',
    sales: 'Siti Rahayu',
    status: 'menunggu',
    createdBy: 'ai',
    location: 'https://zoom.us/j/1234567890',
    notes: 'Masih dalam proses evaluasi kebutuhan. AI sedang menunggu konfirmasi dari customer.',
    aiNote: 'Customer belum konfirmasi. AI sudah kirim 2 pengingat. Jika tidak ada respons dalam 2 jam, AI akan tawarkan reschedule otomatis.',
    timeline: [
      { type: 'ai', event: 'AI menjadwalkan berdasarkan preferensi customer', sub: 'Customer minta slot siang hari', time: '16:00 kemarin' },
      { type: 'system', event: 'Undangan kalender terkirim', sub: 'Google Calendar invite dikirim ke sales & customer', time: '16:01 kemarin' },
      { type: 'ai', event: 'Pengingat pertama dikirim', sub: 'Customer belum membalas', time: '08:00 hari ini' },
    ],
  },
];

const AP_AI_LOGS = [
  { icon: 'ti-sparkles', iconClass: '', event: 'Appointment baru dijadwalkan otomatis', sub: 'Budi Santoso — Demo Produk, Rabu 09.00. AI memilih Rina Kartika berdasarkan ketersediaan kalender.', time: '10:28' },
  { icon: 'ti-brand-whatsapp', iconClass: 'success', event: 'Konfirmasi WhatsApp terkirim', sub: 'Pesan konfirmasi + link Google Meet dikirim ke 081234567890 atas nama Budi Santoso.', time: '10:29' },
  { icon: 'ti-bell', iconClass: 'info', event: 'Pengingat H-1 terkirim', sub: 'Dewi Rahayu — Negosiasi besok jam 11.00. Pengingat via WhatsApp berhasil dikirim.', time: '09:00' },
  { icon: 'ti-calendar-plus', iconClass: '', event: 'Appointment baru dijadwalkan otomatis', sub: 'Rudi Hartono — Konsultasi, Rabu 13.00. Menunggu konfirmasi dari customer.', time: '16:00 kemarin' },
  { icon: 'ti-repeat', iconClass: 'info', event: 'Pengingat ke-2 dikirim (belum ada respons)', sub: 'Rudi Hartono belum konfirmasi. AI akan tawarkan reschedule jika tidak ada respons dalam 2 jam.', time: '08:00' },
  { icon: 'ti-calendar-plus', iconClass: '', event: 'Appointment onboarding dijadwalkan otomatis', sub: 'Hendra Wijaya — trigger 24 jam setelah sign-up. Slot Kamis 14.00 dipilih customer.', time: '14:30 kemarin' },
];

/* ── 2. STATE ─────────────────────────────────────────────────── */
let apCurrentPage   = 1;
const AP_PER_PAGE   = 10;
let apFilterStatus  = 'all';
let apFilterRange   = 'today';
let apSearchQuery   = '';
let apSelectedId    = null;
let apEditingId     = null;

/* ── 3. UTILITIES ─────────────────────────────────────────────── */
function apInitials(nama) {
  return nama.trim().split(' ').slice(0, 2).map(w => w[0].toUpperCase()).join('');
}

function apFormatDate(dateStr) {
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('id-ID', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' });
}

function apStatusClass(status) {
  const map = {
    terkonfirmasi: 'ap-status-konfirmasi',
    menunggu:      'ap-status-menunggu',
    selesai:       'ap-status-selesai',
    dibatalkan:    'ap-status-dibatalkan',
  };
  return map[status] || '';
}

function apStatusIcon(status) {
  const map = {
    terkonfirmasi: 'ti-circle-check',
    menunggu:      'ti-clock',
    selesai:       'ti-checks',
    dibatalkan:    'ti-circle-x',
  };
  return map[status] || 'ti-point';
}

function apStatusLabel(status) {
  const map = {
    terkonfirmasi: 'Terkonfirmasi',
    menunggu:      'Menunggu',
    selesai:       'Selesai',
    dibatalkan:    'Dibatalkan',
  };
  return map[status] || status;
}

function apTypeClass(type) {
  const found = SELLER_CONFIG.meetingTypes.find(t => t.value === type);
  return found ? found.colorClass : 'ap-type-lainnya';
}

/* ── 4. FILTER ────────────────────────────────────────────────── */
function apFilteredData() {
  const today = '2025-06-04';
  const tomorrow = '2025-06-05';

  return AP_DATA.filter(r => {
    // Date range
    if (apFilterRange === 'today'    && r.date !== today) return false;
    if (apFilterRange === 'tomorrow' && r.date !== tomorrow) return false;
    if (apFilterRange === 'week') {
      const d = new Date(r.date), s = new Date(today), e = new Date(today);
      e.setDate(e.getDate() + 6);
      if (d < s || d > e) return false;
    }
    if (apFilterRange === 'month') {
      if (!r.date.startsWith('2025-06')) return false;
    }
    // Status
    if (apFilterStatus !== 'all' && r.status !== apFilterStatus) return false;
    // Search
    if (apSearchQuery) {
      const q = apSearchQuery.toLowerCase();
      if (!r.nama.toLowerCase().includes(q) && !r.company.toLowerCase().includes(q)) return false;
    }
    return true;
  });
}

/* ── 5. RENDER TABLE ──────────────────────────────────────────── */
function apRender() {
  const data = apFilteredData();
  const total = data.length;
  const pages = Math.ceil(total / AP_PER_PAGE) || 1;
  if (apCurrentPage > pages) apCurrentPage = pages;

  const slice = data.slice((apCurrentPage - 1) * AP_PER_PAGE, apCurrentPage * AP_PER_PAGE);

  const tbody = document.getElementById('ap-table-body');
  const empty = document.getElementById('ap-empty');
  const pagination = document.getElementById('ap-pagination');

  if (!tbody) return;

  if (slice.length === 0) {
    tbody.innerHTML = '';
    if (empty) empty.style.display = 'flex';
    if (pagination) pagination.style.display = 'none';
    return;
  }
  if (empty) empty.style.display = 'none';
  if (pagination) pagination.style.display = 'flex';

  tbody.innerHTML = slice.map(r => `
    <div class="ap-row${String(apSelectedId) === String(r.id) ? ' selected' : ''}" onclick="apSelectRow('${r.id}')">
      <div class="ap-th-check" onclick="event.stopPropagation()">
        <input type="checkbox" />
      </div>
      <!-- Customer -->
      <div class="ap-row-contact">
        <div class="ap-av">${apInitials(r.nama)}</div>
        <div>
          <div class="ap-row-nm">${r.nama}</div>
          <div class="ap-row-company">${r.company}</div>
        </div>
      </div>
      <!-- Jadwal -->
      <div class="ap-row-schedule">
        <div class="ap-row-date"><i class="ti ti-calendar"></i>${apFormatDate(r.date)}</div>
        <div class="ap-row-time"><i class="ti ti-clock"></i>${r.time} WIB &bull; ${r.duration} mnt</div>
      </div>
      <!-- Jenis -->
      <div>
        <span class="ap-type-badge ${apTypeClass(r.type)}">${r.typeLabel}</span>
      </div>
      <!-- Penanggung Jawab -->
      <div class="ap-row-sales">
        <div class="ap-sales-av">${apInitials(r.sales)}</div>
        <span>${r.sales}</span>
      </div>
      <!-- Status -->
      <div>
        <span class="ap-status-badge ${apStatusClass(r.status)}">
          <i class="ti ${apStatusIcon(r.status)}"></i>${apStatusLabel(r.status)}
        </span>
      </div>
      <!-- Dibuat oleh -->
      <div>
        ${r.createdBy === 'ai'
          ? '<span class="ap-creator-badge ap-creator-ai"><i class="ti ti-sparkles"></i> AI</span>'
          : '<span class="ap-creator-badge ap-creator-manual"><i class="ti ti-user"></i> Manual</span>'}
      </div>
      <!-- Aksi -->
      <div class="ap-row-actions">
  <button class="ap-row-btn wa" title="FollowUp" onclick="event.stopPropagation();apQuickWA('${r.id}')">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"/>
      <polyline points="13 11 11 11 11 13"/>
    </svg>
  </button>

  <button class="ap-row-btn" title="Edit" onclick="event.stopPropagation();apSelectRow('${r.id}');apOpenEdit()">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
    </svg>
  </button>

  <button class="ap-row-btn" title="Batalkan" onclick="event.stopPropagation();apSelectRow('${r.id}');apOpenCancel()">
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
      <line x1="10" y1="14" x2="14" y2="18"/>
      <line x1="14" y1="14" x2="10" y2="18"/>
    </svg>
  </button>
</div>
    </div>
  `).join('');

  // Pagination info
  const pageInfo = document.getElementById('ap-page-info');
  if (pageInfo) {
    const from = (apCurrentPage - 1) * AP_PER_PAGE + 1;
    const to = Math.min(apCurrentPage * AP_PER_PAGE, total);
    pageInfo.textContent = `Menampilkan ${from}–${to} dari ${total} appointment`;
  }

  // Pagination buttons
  const btns = document.getElementById('ap-page-btns');
  if (btns) {
    let html = `<button class="ap-page-btn" onclick="apGoPage(${apCurrentPage - 1})" ${apCurrentPage <= 1 ? 'disabled' : ''}><i class="ti ti-chevron-left"></i></button>`;
    for (let i = 1; i <= pages; i++) {
      html += `<button class="ap-page-num${i === apCurrentPage ? ' active' : ''}" onclick="apGoPage(${i})">${i}</button>`;
    }
    html += `<button class="ap-page-btn" onclick="apGoPage(${apCurrentPage + 1})" ${apCurrentPage >= pages ? 'disabled' : ''}><i class="ti ti-chevron-right"></i></button>`;
    btns.innerHTML = html;
  }
}

function apGoPage(p) {
  const data = apFilteredData();
  const pages = Math.ceil(data.length / AP_PER_PAGE) || 1;
  apCurrentPage = Math.max(1, Math.min(p, pages));
  apRender();
}

function apToggleAll(cb) {
  document.querySelectorAll('#ap-table-body input[type=checkbox]').forEach(c => { c.checked = cb.checked; });
}

/* ── 6. DETAIL PANEL ──────────────────────────────────────────── */
function apSelectRow(id) {
  apSelectedId = id;
  apRender();

  const r = AP_DATA.find(x => String(x.id) === String(id));
  if (!r) return;

  // show panel
  const panel = document.getElementById('ap-detail-panel');
  const placeholder = document.getElementById('ap-detail-placeholder');
  if (panel) panel.style.display = 'flex';
  if (placeholder) placeholder.style.display = 'none';

  // header
  document.getElementById('ap-dp-av').textContent = apInitials(r.nama);
  document.getElementById('ap-dp-nm').textContent = r.nama;
  document.getElementById('ap-dp-company').textContent = r.company;
  document.getElementById('ap-dp-phone').innerHTML = `<i class="ti ti-phone" style="font-size:11px"></i>${r.phone}`;

  const statusBadge = document.getElementById('ap-dp-status-badge');
  if (statusBadge) {
    statusBadge.innerHTML = `<span class="ap-status-badge ${apStatusClass(r.status)}"><i class="ti ${apStatusIcon(r.status)}"></i>${apStatusLabel(r.status)}</span>`;
  }

  // detail grid
  const grid = document.getElementById('ap-dp-grid');
  if (grid) {
    grid.innerHTML = [
      ['Tanggal',   `${apFormatDate(r.date)}`],
      ['Waktu',     `${r.time} WIB (${r.duration} menit)`],
      ['Jenis',     `<span class="ap-type-badge ${apTypeClass(r.type)}">${r.typeLabel}</span>`],
      [SELLER_CONFIG.staffLabel, r.sales || '<span style="color:var(--gray-400)">—</span>'],
      ['Dibuat',    r.createdBy === 'ai'
        ? '<span class="ap-creator-badge ap-creator-ai"><i class="ti ti-sparkles"></i> AI Otomatis</span>'
        : '<span class="ap-creator-badge ap-creator-manual"><i class="ti ti-user"></i> Manual</span>'],
      ['Lokasi',    r.location.startsWith('http')
        ? `<a href="${r.location}" target="_blank" style="color:var(--red);font-size:11px;word-break:break-all">${r.location}</a>`
        : r.location],
      ['Catatan',   r.notes || '—'],
    ].map(([label, val]) => `
      <div class="ap-dp-row">
        <div class="ap-dp-row-label">${label}</div>
        <div class="ap-dp-row-val">${val}</div>
      </div>
    `).join('');
  }

  // AI note
  const aiNote = document.getElementById('ap-dp-ai-note');
  const aiNoteBody = document.getElementById('ap-dp-ai-note-body');
  if (aiNote && aiNoteBody) {
    if (r.aiNote) {
      aiNote.style.display = 'block';
      aiNoteBody.textContent = r.aiNote;
    } else {
      aiNote.style.display = 'none';
    }
  }

  // Timeline
  const timeline = document.getElementById('ap-dp-timeline');
  if (timeline) {
    timeline.innerHTML = r.timeline.map(t => `
      <div class="ap-tl-item">
        <div class="ap-tl-left">
          <div class="ap-tl-dot ${t.type}"></div>
          <div class="ap-tl-line"></div>
        </div>
        <div class="ap-tl-right">
          <div class="ap-tl-event">${t.event}</div>
          ${t.sub ? `<div class="ap-tl-sub">${t.sub}</div>` : ''}
          <div class="ap-tl-time"><i class="ti ti-clock" style="font-size:10px"></i>${t.time}</div>
        </div>
      </div>
    `).join('');
  }

  // WA btn
  const waBtn = document.getElementById('ap-dp-wa-btn');
  if (waBtn) waBtn.setAttribute('data-phone', r.phone);
}

function apCloseDetail() {
  apSelectedId = null;
  const panel = document.getElementById('ap-detail-panel');
  const placeholder = document.getElementById('ap-detail-placeholder');
  if (panel) panel.style.display = 'none';
  if (placeholder) placeholder.style.display = 'flex';
  apRender();
}

/* ── 6b. COMPANY AUTOCOMPLETE (Perusahaan) — terhubung ke Kontak/Leads ──
   Sumber data: variabel global LEADS_DATA (didefinisikan di leads-page.js,
   diisi dari Google Sheets / CSV / fallback). File ini HANYA membaca
   LEADS_DATA, tidak pernah mengubahnya — jadi tidak menyentuh logic
   Kontak/Leads yang sudah ada.
   ──────────────────────────────────────────────────────────────── */
let _apCompanyDD = null;
let _apCompanyDDIndex = -1;

function apEscapeHtml(s) {
  return String(s || '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

// Ambil daftar perusahaan unik dari LEADS_DATA (1 entri per perusahaan,
// dipakai baris pertama yang ditemukan sebagai representasi kontaknya).
function apGetLeadsCompanyList() {
  if (typeof LEADS_DATA === 'undefined' || !Array.isArray(LEADS_DATA)) return [];
  const seen = new Set();
  const list = [];
  LEADS_DATA.forEach(l => {
    const nm = (l.perusahaan || '').trim();
    if (!nm || seen.has(nm.toLowerCase())) return;
    seen.add(nm.toLowerCase());
    list.push(l);
  });
  return list;
}

function apBuildCompanyDropdown() {
  if (_apCompanyDD && document.body.contains(_apCompanyDD)) return _apCompanyDD;
  const input = document.getElementById('ap-fd-company');
  if (!input) return null;
  const wrap = input.parentElement;
  if (wrap && getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';

  const dd = document.createElement('div');
  dd.id = 'ap-fd-company-dd';
  dd.style.cssText = 'position:absolute;top:100%;left:0;right:0;margin-top:4px;background:#fff;'
    + 'border:1px solid var(--gray-200,#e5e7eb);border-radius:8px;box-shadow:0 8px 24px rgba(0,0,0,.12);'
    + 'max-height:220px;overflow-y:auto;z-index:80;display:none;';
  if (wrap) wrap.appendChild(dd);
  _apCompanyDD = dd;
  return dd;
}

function apHighlightCompanyDD(items) {
  items.forEach((el, i) => {
    el.style.background = i === _apCompanyDDIndex ? 'var(--gray-50,#f9fafb)' : '';
  });
}

function apCloseCompanyDropdown() {
  if (_apCompanyDD) _apCompanyDD.style.display = 'none';
  _apCompanyDDIndex = -1;
}

function apSelectCompanyFromLead(lead) {
  if (!lead) return;
  const companyEl = document.getElementById('ap-fd-company');
  const namaEl    = document.getElementById('ap-fd-nama');
  const phoneEl   = document.getElementById('ap-fd-phone');
  const emailEl   = document.getElementById('ap-fd-email');

  if (companyEl) {
    companyEl.value = lead.perusahaan || '';
    companyEl.dataset.leadId = lead.id; // simpan referensi lead terpilih (dipakai utk AI follow-up)
  }
  // Hanya auto-isi field yang masih kosong, supaya tidak menimpa input manual user.
  if (namaEl && !namaEl.value.trim()) namaEl.value = lead.nama || '';
  if (phoneEl && !phoneEl.value.trim()) {
    const p = (lead.phone || '').trim();
    phoneEl.value = p ? (p.startsWith('0') ? p : '0' + p) : '';
  }
  if (emailEl && !emailEl.value.trim()) emailEl.value = lead.email || '';

  apCloseCompanyDropdown();
}

function apRenderCompanyDropdown(query) {
  const dd = apBuildCompanyDropdown();
  if (!dd) return;
  const list = apGetLeadsCompanyList();
  const q = (query || '').trim().toLowerCase();
  const filtered = q
    ? list.filter(l => (l.perusahaan || '').toLowerCase().includes(q) || (l.nama || '').toLowerCase().includes(q))
    : list;

  if (!filtered.length) {
    dd.innerHTML = `<div style="padding:10px 12px;font-size:12px;color:var(--gray-400,#9ca3af)">`
      + (list.length ? 'Tidak ditemukan perusahaan yang cocok.' : 'Belum ada data Kontak/Leads.')
      + `</div>`;
    dd._items = [];
    dd.style.display = 'block';
    _apCompanyDDIndex = -1;
    return;
  }

  dd.innerHTML = filtered.slice(0, 30).map((l, i) => `
    <div class="ap-company-dd-item" data-idx="${i}"
      style="padding:8px 12px;font-size:12.5px;cursor:pointer;border-bottom:1px solid var(--gray-100,#f1f5f9)">
      <div style="font-weight:600;color:#1f2937">${apEscapeHtml(l.perusahaan || '—')}</div>
      <div style="font-size:11px;color:var(--gray-400,#9ca3af)">${apEscapeHtml(l.nama || '')}${l.kota ? ' · ' + apEscapeHtml(l.kota) : ''}</div>
    </div>
  `).join('');
  dd._items = filtered;
  _apCompanyDDIndex = -1;

  dd.querySelectorAll('.ap-company-dd-item').forEach(el => {
    el.addEventListener('mousedown', (e) => {
      e.preventDefault(); // cegah blur duluan sebelum klik diproses
      apSelectCompanyFromLead(filtered[parseInt(el.dataset.idx, 10)]);
    });
  });

  dd.style.display = 'block';
}

function apInitCompanyAutocomplete() {
  const input = document.getElementById('ap-fd-company');
  if (!input || input._apAutocompleteBound) return;
  input._apAutocompleteBound = true;

  input.addEventListener('focus', () => apRenderCompanyDropdown(input.value));
  input.addEventListener('click', () => apRenderCompanyDropdown(input.value));
  input.addEventListener('input', () => {
    delete input.dataset.leadId; // ketik manual = putus link ke lead lama
    apRenderCompanyDropdown(input.value);
  });
  input.addEventListener('blur', () => { setTimeout(apCloseCompanyDropdown, 120); });
  input.addEventListener('keydown', (e) => {
    const dd = _apCompanyDD;
    if (!dd || dd.style.display === 'none' || !dd._items || !dd._items.length) return;
    const items = dd.querySelectorAll('.ap-company-dd-item');
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      _apCompanyDDIndex = Math.min(_apCompanyDDIndex + 1, items.length - 1);
      apHighlightCompanyDD(items);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      _apCompanyDDIndex = Math.max(_apCompanyDDIndex - 1, 0);
      apHighlightCompanyDD(items);
    } else if (e.key === 'Enter') {
      if (_apCompanyDDIndex >= 0 && dd._items[_apCompanyDDIndex]) {
        e.preventDefault();
        apSelectCompanyFromLead(dd._items[_apCompanyDDIndex]);
      }
    } else if (e.key === 'Escape') {
      apCloseCompanyDropdown();
    }
  });
}

/* ── 7. MODAL: CREATE / EDIT ──────────────────────────────────── */

/* Populate dropdown Jenis Pertemuan dari SELLER_CONFIG (dipanggil setiap open modal) */
function apPopulateMeetingTypes() {
  const sel = document.getElementById('ap-fd-type');
  if (!sel) return;
  sel.innerHTML = SELLER_CONFIG.meetingTypes.map(t =>
    `<option value="${t.value}">${t.label}</option>`
  ).join('');
}

/* Populate dropdown Penanggung Jawab dari SELLER_CONFIG */
function apPopulateStaffDropdown() {
  const sel = document.getElementById('ap-fd-sales');
  const lbl = document.getElementById('ap-fd-sales-label');
  if (!sel) return;

  // Perbarui label field jika ada elemen label
  if (lbl) lbl.textContent = SELLER_CONFIG.staffLabel;

  const placeholder = `— Pilih ${SELLER_CONFIG.staffLabel} —`;
  const staffOpts = SELLER_CONFIG.staffList.length > 0
    ? SELLER_CONFIG.staffList.map(s => `<option value="${s}">${s}</option>`).join('')
    : '';
  sel.innerHTML = `<option value="">${placeholder}</option>${staffOpts}`;
}


function apOpenCreate() {
  apEditingId = null;
  const title = document.getElementById('ap-create-title');
  if (title) title.textContent = 'Buat Appointment Baru';
  // Populate dropdown dinamis dari SELLER_CONFIG
  apPopulateMeetingTypes();
  apPopulateStaffDropdown();
  // Clear fields
  ['ap-fd-nama','ap-fd-company','ap-fd-phone','ap-fd-email','ap-fd-datetime','ap-fd-location','ap-fd-notes'].forEach(id => {
    const el = document.getElementById(id);
    if (el) el.value = '';
  });
  document.getElementById('ap-fd-duration').value = '60';
  document.getElementById('ap-fd-type').value = 'demo';
  document.getElementById('ap-fd-sales').value = '';
  document.getElementById('ap-fd-send-wa').checked = true;
  document.getElementById('ap-fd-send-reminder').checked = true;

  // Putus link ke lead sebelumnya (kalau ada dari sesi form yang lama) + aktifkan autocomplete Perusahaan
  const companyElNew = document.getElementById('ap-fd-company');
  if (companyElNew) delete companyElNew.dataset.leadId;
  apInitCompanyAutocomplete();

  document.getElementById('ap-modal-create').style.display = 'flex';
}

function apOpenEdit() {
  if (!apSelectedId) return;
  const r = AP_DATA.find(x => String(x.id) === String(apSelectedId));
  if (!r) return;
  apEditingId = r.id;

  const title = document.getElementById('ap-create-title');
  if (title) title.textContent = 'Edit Appointment';

  // Populate dropdown dinamis dari SELLER_CONFIG
  apPopulateMeetingTypes();
  apPopulateStaffDropdown();

  document.getElementById('ap-fd-nama').value = r.nama;
  document.getElementById('ap-fd-company').value = r.company;
  document.getElementById('ap-fd-phone').value = r.phone;
  document.getElementById('ap-fd-email').value = r.email;
  document.getElementById('ap-fd-datetime').value = r.date + 'T' + r.time.replace('.', ':');
  document.getElementById('ap-fd-duration').value = String(r.duration);
  document.getElementById('ap-fd-type').value = r.type;
  document.getElementById('ap-fd-sales').value = r.sales;
  document.getElementById('ap-fd-location').value = r.location;
  document.getElementById('ap-fd-notes').value = r.notes;

  // Pulihkan link ke lead Kontak/Leads jika appointment ini sebelumnya dibuat dari dropdown + aktifkan autocomplete
  const companyElEdit = document.getElementById('ap-fd-company');
  if (companyElEdit) {
    if (r.leadId) companyElEdit.dataset.leadId = r.leadId; else delete companyElEdit.dataset.leadId;
  }
  apInitCompanyAutocomplete();

  document.getElementById('ap-modal-create').style.display = 'flex';
}

function apCloseCreate() {
  document.getElementById('ap-modal-create').style.display = 'none';
  apEditingId = null;
}

function apSaveAppointment() {
  const nama = document.getElementById('ap-fd-nama').value.trim();
  const phone = document.getElementById('ap-fd-phone').value.trim();
  const datetime = document.getElementById('ap-fd-datetime').value;
  const salesVal = document.getElementById('ap-fd-sales').value;

  if (!nama || !phone || !datetime) {
    apShowToast('error', '<i class="ti ti-alert-circle"></i> Mohon lengkapi field wajib diisi.');
    return;
  }

  const typeEl = document.getElementById('ap-fd-type');
  // Resolve label dari SELLER_CONFIG (fallback ke value jika tidak ditemukan)
  const typeObj = SELLER_CONFIG.meetingTypes.find(t => t.value === typeEl.value);
  const typeLabel = typeObj ? typeObj.label : typeEl.value;

  const [dateStr, timeStr] = datetime.split('T');
  let justCreatedId = null;

  if (apEditingId) {
    const idx = AP_DATA.findIndex(x => String(x.id) === String(apEditingId));
    if (idx !== -1) {
      Object.assign(AP_DATA[idx], {
        nama, company: document.getElementById('ap-fd-company').value.trim(),
        phone, email: document.getElementById('ap-fd-email').value.trim(),
        date: dateStr, time: timeStr.replace(':', '.'),
        duration: parseInt(document.getElementById('ap-fd-duration').value),
        type: typeEl.value, typeLabel: typeLabel,
        sales: salesVal,
        location: document.getElementById('ap-fd-location').value.trim(),
        notes: document.getElementById('ap-fd-notes').value.trim(),
        leadId: document.getElementById('ap-fd-company').dataset.leadId || null,
      });
    }
    apShowToast('success', '<i class="ti ti-check"></i> Appointment berhasil diperbarui.');
  } else {
    // AP_DATA sekarang bisa berisi ID string dari appointment AI/Calendly
    // (mis. "ai-...", "cal-...") — Math.max langsung di atasnya akan jadi
    // NaN, jadi ID non-angka difilter dulu sebelum dicari nilai maksimalnya.
    const numericIds = AP_DATA
      .map(x => (typeof x.id === 'number' ? x.id : parseInt(x.id, 10)))
      .filter(Number.isFinite);
    const newId = (numericIds.length ? Math.max(...numericIds) : 0) + 1;
    AP_DATA.push({
      id: newId,
      nama, company: document.getElementById('ap-fd-company').value.trim(),
      phone, email: document.getElementById('ap-fd-email').value.trim(),
      date: dateStr, time: timeStr.replace(':', '.'),
      duration: parseInt(document.getElementById('ap-fd-duration').value),
      type: typeEl.value, typeLabel: typeLabel,
      sales: salesVal, status: 'menunggu', createdBy: 'manual',
      location: document.getElementById('ap-fd-location').value.trim(),
      notes: document.getElementById('ap-fd-notes').value.trim(),
      aiNote: null,
      leadId: document.getElementById('ap-fd-company').dataset.leadId || null,
      timeline: [
        { type: 'manual', event: 'Appointment dibuat secara manual', sub: 'Oleh Admin', time: 'Baru saja' },
      ],
    });
    justCreatedId = newId;

    const sendWA = document.getElementById('ap-fd-send-wa').checked;
    if (sendWA) {
      setTimeout(() => {
        apShowToast('success', '<i class="ti ti-brand-whatsapp"></i> Konfirmasi WhatsApp terkirim ke customer.');
      }, 1200);
    }
    apShowToast('success', '<i class="ti ti-check"></i> Appointment baru berhasil dibuat.');

    // Catatan: follow-up AI ke Percakapan TIDAK di-trigger otomatis di sini.
    // Fungsi apTriggerAiFollowup(record) sudah tersedia (lihat bawah) dan tinggal
    // dipanggil dari tombol pemicu manual saat tombolnya sudah dibuat.
  }

  apCloseCreate();

  if (justCreatedId) {
    // Appointment baru dibuat → reset filter tanggal/status/pencarian yang sedang aktif
    // dan lompat ke halaman yang memuatnya, supaya appointment yang baru saja dibuat
    // pasti langsung terlihat di list (tidak tersembunyi oleh filter "Hari Ini" dsb,
    // yang tanggal acuannya memang tetap/hardcoded di apFilteredData()).
    apFilterRange = 'all';
    apFilterStatus = 'all';
    apSearchQuery = '';
    const statusSelReset = document.getElementById('ap-status-filter');
    if (statusSelReset) statusSelReset.value = 'all';
    const searchElReset = document.getElementById('ap-search');
    if (searchElReset) searchElReset.value = '';

    const filteredAfterCreate = apFilteredData();
    apCurrentPage = Math.max(1, Math.ceil(filteredAfterCreate.length / AP_PER_PAGE));
  } else {
    apCurrentPage = 1;
  }

  apRender();

  if (justCreatedId) apSelectRow(justCreatedId);
}

/* ── 7b. AI AUTO FOLLOW-UP KE PERCAKAPAN ──────────────────────────
   Dipicu otomatis setiap kali appointment BARU berhasil dibuat.
   Memanggil backend server.js (endpoint baru /api/appointment/followup,
   TIDAK menyentuh endpoint /api/followup/* yang sudah dipakai halaman
   Kontak/Leads) yang men-generate pesan lewat Ollama dan mencoba
   mengirimkannya ke percakapan Telegram yang sudah ada untuk kontak
   tsb. Kalau customer belum pernah chat ke bot, Telegram tidak bisa
   dikirimi pesan pertama (batasan Bot API) — pesan tetap disiapkan,
   dan bisa dikirim manual lewat tombol WhatsApp yang sudah ada.
   ──────────────────────────────────────────────────────────────── */
const AP_FOLLOWUP_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

async function apTriggerAiFollowup(record) {
  if (!record) return;
  try {
    const companyEl = document.getElementById('ap-fd-company');
    const leadId = record.leadId || (companyEl && companyEl.dataset.leadId) || null;
    const lead = (leadId && typeof LEADS_DATA !== 'undefined')
      ? LEADS_DATA.find(l => String(l.id) === String(leadId))
      : null;

    const res = await fetch(`${AP_FOLLOWUP_API_BASE}/api/appointment/followup`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        appointment: {
          nama: record.nama,
          company: record.company,
          phone: record.phone,
          date: record.date,
          time: record.time,
          typeLabel: record.typeLabel,
          sales: record.sales,
          location: record.location,
        },
        lead: lead || null,
      }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) throw new Error(data.error || `Request gagal (${res.status})`);

    const idx = AP_DATA.findIndex(x => String(x.id) === String(record.id));
    if (idx !== -1) {
      AP_DATA[idx].timeline.push({
        type: 'ai',
        event: data.delivered ? 'AI mengirim follow-up ke Percakapan' : 'AI menyiapkan pesan follow-up',
        sub: data.delivered
          ? `Terkirim via Telegram: "${data.message}"`
          : `Belum ada percakapan Telegram aktif untuk kontak ini. Pesan disiapkan, kirim manual lewat WhatsApp: "${data.message}"`,
        time: 'Baru saja',
      });
      if (apSelectedId === record.id) apSelectRow(record.id);
    }

    AP_AI_LOGS.unshift({
      icon: data.delivered ? 'ti-brand-telegram' : 'ti-message-2',
      iconClass: data.delivered ? 'success' : 'info',
      event: data.delivered ? 'Follow-up AI otomatis terkirim ke Percakapan' : 'Pesan follow-up AI disiapkan',
      sub: `${record.nama} (${record.company || '-'}) — ${data.message}`,
      time: 'Baru saja',
    });

    apShowToast(
      data.delivered ? 'success' : 'default',
      data.delivered
        ? '<i class="ti ti-sparkles"></i> AI berhasil follow-up chat ke Percakapan.'
        : '<i class="ti ti-sparkles"></i> Pesan follow-up AI siap — belum ada percakapan Telegram aktif untuk kontak ini.'
    );
  } catch (err) {
    console.error('AI follow-up ke Percakapan gagal:', err);
    apShowToast('error', '<i class="ti ti-alert-circle"></i> AI follow-up gagal: tidak bisa terhubung ke server AI (' + AP_FOLLOWUP_API_BASE + ').');
  }
}

/* ── 7c. SINKRONISASI APPOINTMENT DARI PERCAKAPAN (BARU) ──────────
   Appointment yang lahir dari chat Telegram (AI menawarkan slot kosong,
   customer memilih salah satunya) dibuat & disimpan di server.js, BUKAN
   langsung di AP_DATA (yang murni in-memory di frontend). Fungsi di bawah
   ini polling appointment tsb dan menggabungkannya ke AP_DATA supaya
   muncul di tabel halaman ini seperti appointment lainnya.
   ──────────────────────────────────────────────────────────────── */
let _apKnownAiIds = new Set();

async function apSyncAiAppointments() {
  try {
    const res = await fetch(`${AP_FOLLOWUP_API_BASE}/api/appointments/ai-created`);
    const data = await res.json().catch(() => ({}));
    if (!res.ok || data.ok === false) return;

    let hasNew = false;
    (data.appointments || []).forEach((rec) => {
      const idx = AP_DATA.findIndex((x) => String(x.id) === String(rec.id));
      if (idx === -1) {
        AP_DATA.unshift({ ...rec, company: rec.company || '-', duration: rec.duration || 60 });
        hasNew = true;
      } else {
        // Appointment sudah ada di tabel — sinkronkan status & timeline
        // terbaru dari server saja (mis. setelah admin konfirmasi),
        // tanpa menimpa perubahan lain yang mungkin dibuat di sisi UI.
        AP_DATA[idx].status = rec.status;
        AP_DATA[idx].timeline = rec.timeline;
      }
      _apKnownAiIds.add(rec.id);
    });

    if (hasNew) {
      // Appointment baru dari chat → reset filter yang sedang aktif supaya
      // langsung terlihat (sama seperti perlakuan appointment manual baru,
      // lihat catatan di apSaveAppointment di atas — filter tanggal demo
      // di apFilteredData() memang acuannya tanggal tetap, bukan tanggal
      // hari ini yang sebenarnya).
      apFilterRange = 'all';
      apFilterStatus = 'all';
      apSearchQuery = '';
      const statusSelReset = document.getElementById('ap-status-filter');
      if (statusSelReset) statusSelReset.value = 'all';
      const searchElReset = document.getElementById('ap-search');
      if (searchElReset) searchElReset.value = '';
      apCurrentPage = 1;
      apShowToast('success', '<i class="ti ti-calendar-plus"></i> Appointment baru dari Percakapan — customer sudah memilih jadwal via chat.');
    }

    apRender();
    if (apSelectedId && AP_DATA.some((x) => String(x.id) === String(apSelectedId))) apSelectRow(apSelectedId);
  } catch (err) {
    // Backend belum jalan / belum terhubung — diamkan, halaman tetap
    // pakai data lokal (AP_DATA) seperti biasa.
  }
}

function _startApChatSync() {
  apSyncAiAppointments();
  setInterval(apSyncAiAppointments, 5000);
}

// Dipanggil dari tombol "Konfirmasi & Follow-up" di panel detail. Menandai
// appointment terkonfirmasi (termasuk sinkron ke server kalau appointment
// ini asalnya dari chat AI, id-nya berawalan "ai-"), lalu langsung memicu
// automasi follow-up yang sudah ada (apTriggerAiFollowup).
async function apConfirmAndFollowup() {
  if (!apSelectedId) return;
  const r = AP_DATA.find((x) => String(x.id) === String(apSelectedId));
  if (!r) return;

  // ID string ('ai-...' dari Telegram, 'cal-...' dari Calendly) berarti
  // appointment ini lahir di server (aiAppointments), jadi statusnya perlu
  // disinkronkan balik ke sana. ID angka = appointment manual, murni lokal.
  if (typeof r.id === 'string') {
    try {
      await fetch(`${AP_FOLLOWUP_API_BASE}/api/appointments/${r.id}/confirm`, { method: 'POST' });
    } catch (err) {
      console.error('Gagal menyinkronkan konfirmasi ke server:', err);
    }
  }

  if (r.status !== 'terkonfirmasi') {
    r.status = 'terkonfirmasi';
    r.timeline.push({ type: 'success', event: 'Admin mengonfirmasi appointment', sub: 'Dikonfirmasi dari halaman Appointment', time: 'Baru saja' });
  }

  apRender();
  apSelectRow(r.id);
  await apTriggerAiFollowup(r);
}

/* ── 8. MODAL: CANCEL ─────────────────────────────────────────── */
function apOpenCancel() {
  if (!apSelectedId) return;
  const r = AP_DATA.find(x => String(x.id) === String(apSelectedId));
  if (!r) return;
  document.getElementById('ap-cancel-name').textContent = r.nama;
  document.getElementById('ap-cancel-reason').value = '';
  document.getElementById('ap-cancel-notify').checked = true;
  document.getElementById('ap-modal-cancel').style.display = 'flex';
}

function apCloseCancel() {
  document.getElementById('ap-modal-cancel').style.display = 'none';
}

function apConfirmCancel() {
  if (!apSelectedId) return;
  const idx = AP_DATA.findIndex(x => String(x.id) === String(apSelectedId));
  if (idx !== -1) {
    AP_DATA[idx].status = 'dibatalkan';
    AP_DATA[idx].timeline.push({ type: 'system', event: 'Appointment dibatalkan', sub: document.getElementById('ap-cancel-reason').value || '', time: 'Baru saja' });
  }
  apCloseCancel();
  apCloseDetail();
  apShowToast('success', '<i class="ti ti-calendar-x"></i> Appointment berhasil dibatalkan.');
  apRender();
}

/* ── 9. MODAL: AI LOG ─────────────────────────────────────────── */
function apOpenAiLog() {
  const list = document.getElementById('ap-ai-log-list');
  if (list) {
    list.innerHTML = AP_AI_LOGS.map(l => `
      <div class="ap-ai-log-item">
        <div class="ap-ai-log-icon ${l.iconClass}"><i class="ti ${l.icon}"></i></div>
        <div style="flex:1;min-width:0">
          <div class="ap-ai-log-event">${l.event}</div>
          <div class="ap-ai-log-sub">${l.sub}</div>
        </div>
        <div class="ap-ai-log-time">${l.time}</div>
      </div>
    `).join('');
  }
  document.getElementById('ap-modal-ai-log').style.display = 'flex';
}

function apCloseAiLog() {
  document.getElementById('ap-modal-ai-log').style.display = 'none';
}

/* ── 10. WHATSAPP ─────────────────────────────────────────────── */
function apSendWA() {
    
}

function apQuickWA(id) {
  const r = AP_DATA.find(x => String(x.id) === String(id));
  if (!r) return;
  const msg = `Halo ${r.nama}, kami ingin mengingatkan jadwal meeting Anda pada ${apFormatDate(r.date)} pukul ${r.time} WIB. Sampai jumpa! 🤝`;
  window.open(`https://wa.me/62${r.phone.replace(/^0/, '')}?text=${encodeURIComponent(msg)}`, '_blank');
}

/* ── 11. TOAST ────────────────────────────────────────────────── */
function apShowToast(type, html) {
  const toast = document.getElementById('ap-toast');
  if (!toast) return;
  toast.className = `ap-toast${type !== 'default' ? ' ' + type : ''}`;
  toast.innerHTML = html;
  toast.style.display = 'flex';
  clearTimeout(toast._t);
  toast._t = setTimeout(() => { toast.style.display = 'none'; }, 3200);
}

/* ── 12. EVENT LISTENERS ──────────────────────────────────────── */
function apInitEvents() {
  // Date tabs
  document.querySelectorAll('.ap-date-tab').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.ap-date-tab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      apFilterRange = btn.dataset.range;
      apCurrentPage = 1;
      apRender();
    });
  });

  // Status filter
  const statusSel = document.getElementById('ap-status-filter');
  if (statusSel) statusSel.addEventListener('change', () => {
    apFilterStatus = statusSel.value;
    apCurrentPage = 1;
    apRender();
  });

  // Search
  const searchEl = document.getElementById('ap-search');
  if (searchEl) {
    let debounce;
    searchEl.addEventListener('input', () => {
      clearTimeout(debounce);
      debounce = setTimeout(() => {
        apSearchQuery = searchEl.value.trim();
        apCurrentPage = 1;
        apRender();
      }, 250);
    });
  }
}

/* ── 13. INIT ─────────────────────────────────────────────────── */
function apInit() {
  apInitEvents();
  apRender();
  _startApChatSync();
}

// Trigger on page show (called from main nav or DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  // Wait a tick so the page nav hides/shows divs first
  setTimeout(apInit, 50);
});