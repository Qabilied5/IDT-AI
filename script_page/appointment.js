/* =============================================================
   appointment.js — Indotrading AI
   Halaman Appointment: data, render, filter, modal, detail panel
   ============================================================= */

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
    aiNote: 'AI mendeteksi lead berkualitas tinggi (skor 88/100). Customer sudah tanya harga dan kuantiti — indikasi intent beli kuat. Disarankan sales demo langsung ke produk unggulan kategori mesin industri.',
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
    aiNote: 'Skor lead 94/100 — sangat panas. Customer sudah 3x interaksi sebelumnya. Rekomendasikan bawa proposal lengkap dan opsi cicilan 3 bulan.',
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
  {
    id: 4,
    nama: 'Aisyah Putri',
    company: 'PT Gemilang Nusantara',
    phone: '087712345678',
    email: 'aisyah@gemilang.co.id',
    date: '2025-06-03',
    time: '10.00',
    duration: 60,
    type: 'demo',
    typeLabel: 'Demo Produk',
    sales: 'Arif Budiman',
    status: 'selesai',
    createdBy: 'manual',
    location: 'https://meet.google.com/xyz-1234',
    notes: 'Demo sukses. Customer tertarik untuk order trial 10 unit.',
    aiNote: null,
    timeline: [
      { type: 'manual', event: 'Appointment dibuat oleh Arif Budiman', sub: '', time: '15:00, 2 Jun' },
      { type: 'success', event: 'Meeting berlangsung sesuai jadwal', sub: 'Durasi 55 menit', time: '10:00, 3 Jun' },
      { type: 'ai', event: 'AI mencatat ringkasan hasil meeting', sub: 'Customer tertarik order 10 unit. Follow-up terjadwal.', time: '11:00, 3 Jun' },
    ],
  },
  {
    id: 5,
    nama: 'Hendra Wijaya',
    company: 'PT Prima Industri',
    phone: '081387654321',
    email: 'hendra@primaindustri.com',
    date: '2025-06-05',
    time: '14.00',
    duration: 30,
    type: 'onboarding',
    typeLabel: 'Onboarding',
    sales: 'Rina Kartika',
    status: 'terkonfirmasi',
    createdBy: 'ai',
    location: 'https://meet.google.com/onboard-abc',
    notes: 'Customer baru. Sesi onboarding platform Indotrading B2B.',
    aiNote: 'Customer menyelesaikan sign-up kemarin. AI mendeteksi profil buyer aktif. Onboarding penting untuk aktivasi akun penuh.',
    timeline: [
      { type: 'ai', event: 'Trigger otomatis setelah sign-up customer', sub: 'AI menjadwalkan onboarding dalam 24 jam', time: '14:00 kemarin' },
      { type: 'success', event: 'Customer konfirmasi slot', sub: 'Memilih Kamis 14.00', time: '14:30 kemarin' },
      { type: 'ai', event: 'Undangan + panduan onboarding dikirim', sub: 'Email & WhatsApp terkirim', time: '14:31 kemarin' },
    ],
  },
  {
    id: 6,
    nama: 'Lestari Ningrum',
    company: 'CV Bintang Selatan',
    phone: '089512345678',
    email: 'lestari@bintangselatan.id',
    date: '2025-06-03',
    time: '14.00',
    duration: 60,
    type: 'negosiasi',
    typeLabel: 'Negosiasi',
    sales: 'Dimas Pratama',
    status: 'dibatalkan',
    createdBy: 'manual',
    location: 'Kantor Indotrading Lt. 2',
    notes: 'Dibatalkan karena customer tidak dapat hadir. Akan dijadwal ulang minggu depan.',
    aiNote: null,
    timeline: [
      { type: 'manual', event: 'Appointment dibuat oleh Dimas Pratama', sub: '', time: '10:00, 2 Jun' },
      { type: 'system', event: 'Customer menghubungi untuk reschedule', sub: 'Ada urusan mendadak', time: '13:00, 3 Jun' },
      { type: 'system', event: 'Appointment dibatalkan', sub: 'Akan dijadwalkan ulang minggu depan', time: '13:05, 3 Jun' },
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
  const map = {
    demo:       'ap-type-demo',
    konsultasi: 'ap-type-konsultasi',
    negosiasi:  'ap-type-negosiasi',
    onboarding: 'ap-type-onboarding',
    lainnya:    'ap-type-lainnya',
  };
  return map[type] || 'ap-type-lainnya';
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
    <div class="ap-row${apSelectedId === r.id ? ' selected' : ''}" onclick="apSelectRow(${r.id})">
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
      <!-- Sales PIC -->
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
        <button class="ap-row-btn wa" title="WhatsApp" onclick="event.stopPropagation();apQuickWA(${r.id})">
          <i class="ti ti-brand-whatsapp"></i>
        </button>
        <button class="ap-row-btn" title="Edit" onclick="event.stopPropagation();apSelectRow(${r.id});apOpenEdit()">
          <i class="ti ti-edit"></i>
        </button>
        <button class="ap-row-btn" title="Batalkan" onclick="event.stopPropagation();apSelectRow(${r.id});apOpenCancel()">
          <i class="ti ti-calendar-x"></i>
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

  const r = AP_DATA.find(x => x.id === id);
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
      ['Sales PIC', r.sales],
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

/* ── 7. MODAL: CREATE / EDIT ──────────────────────────────────── */
function apOpenCreate() {
  apEditingId = null;
  const title = document.getElementById('ap-create-title');
  if (title) title.textContent = 'Buat Appointment Baru';
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
  document.getElementById('ap-modal-create').style.display = 'flex';
}

function apOpenEdit() {
  if (!apSelectedId) return;
  const r = AP_DATA.find(x => x.id === apSelectedId);
  if (!r) return;
  apEditingId = r.id;

  const title = document.getElementById('ap-create-title');
  if (title) title.textContent = 'Edit Appointment';

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

  if (!nama || !phone || !datetime || !salesVal) {
    apShowToast('error', '<i class="ti ti-alert-circle"></i> Mohon lengkapi field wajib diisi.');
    return;
  }

  const typeEl = document.getElementById('ap-fd-type');
  const typeLabels = { demo: 'Demo Produk', konsultasi: 'Konsultasi', negosiasi: 'Negosiasi', onboarding: 'Onboarding', lainnya: 'Lainnya' };

  const [dateStr, timeStr] = datetime.split('T');

  if (apEditingId) {
    const idx = AP_DATA.findIndex(x => x.id === apEditingId);
    if (idx !== -1) {
      Object.assign(AP_DATA[idx], {
        nama, company: document.getElementById('ap-fd-company').value.trim(),
        phone, email: document.getElementById('ap-fd-email').value.trim(),
        date: dateStr, time: timeStr.replace(':', '.'),
        duration: parseInt(document.getElementById('ap-fd-duration').value),
        type: typeEl.value, typeLabel: typeLabels[typeEl.value],
        sales: salesVal,
        location: document.getElementById('ap-fd-location').value.trim(),
        notes: document.getElementById('ap-fd-notes').value.trim(),
      });
    }
    apShowToast('success', '<i class="ti ti-check"></i> Appointment berhasil diperbarui.');
  } else {
    const newId = Math.max(...AP_DATA.map(x => x.id)) + 1;
    AP_DATA.push({
      id: newId,
      nama, company: document.getElementById('ap-fd-company').value.trim(),
      phone, email: document.getElementById('ap-fd-email').value.trim(),
      date: dateStr, time: timeStr.replace(':', '.'),
      duration: parseInt(document.getElementById('ap-fd-duration').value),
      type: typeEl.value, typeLabel: typeLabels[typeEl.value],
      sales: salesVal, status: 'menunggu', createdBy: 'manual',
      location: document.getElementById('ap-fd-location').value.trim(),
      notes: document.getElementById('ap-fd-notes').value.trim(),
      aiNote: null,
      timeline: [
        { type: 'manual', event: 'Appointment dibuat secara manual', sub: 'Oleh Admin', time: 'Baru saja' },
      ],
    });

    const sendWA = document.getElementById('ap-fd-send-wa').checked;
    if (sendWA) {
      setTimeout(() => {
        apShowToast('success', '<i class="ti ti-brand-whatsapp"></i> Konfirmasi WhatsApp terkirim ke customer.');
      }, 1200);
    }
    apShowToast('success', '<i class="ti ti-check"></i> Appointment baru berhasil dibuat.');
  }

  apCloseCreate();
  apCurrentPage = 1;
  apRender();
}

/* ── 8. MODAL: CANCEL ─────────────────────────────────────────── */
function apOpenCancel() {
  if (!apSelectedId) return;
  const r = AP_DATA.find(x => x.id === apSelectedId);
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
  const idx = AP_DATA.findIndex(x => x.id === apSelectedId);
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
  const r = AP_DATA.find(x => x.id === id);
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
}

// Trigger on page show (called from main nav or DOMContentLoaded)
document.addEventListener('DOMContentLoaded', () => {
  // Wait a tick so the page nav hides/shows divs first
  setTimeout(apInit, 50);
});