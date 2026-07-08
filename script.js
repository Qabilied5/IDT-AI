const red = "#C8102E",
  redFade = "rgba(200,16,46,0.08)",
  gray = "#E2E2E2",
  green = "#1A7A4A",
  greenFade = "rgba(26,122,74,0.08)";
const labels = ["Sen", "Sel", "Rab", "Kam", "Jum", "Sab", "Min"];
const sharedOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: { display: false },
    tooltip: {
      enabled: true,
      backgroundColor: "#fff",
      titleColor: "#222",
      bodyColor: "#555",
      borderColor: gray,
      borderWidth: 1,
      padding: 8,
      titleFont: { size: 11 },
      bodyFont: { size: 11 },
    },
  },
  scales: {
    x: {
      grid: { display: false },
      ticks: { font: { size: 10 }, color: "#9A9A9A" },
    },
    y: {
      grid: { color: gray },
      ticks: { font: { size: 10 }, color: "#9A9A9A" },
      border: { display: false },
    },
  },
};
new Chart(document.getElementById("convChart"), {
  type: "bar",
  data: {
    labels,
    datasets: [
      {
        data: [142, 187, 165, 210, 198, 94, 88],
        backgroundColor: red,
        borderRadius: 4,
        barPercentage: 0.6,
      },
    ],
  },
  options: sharedOpts,
});
new Chart(document.getElementById("convRate"), {
  type: "line",
  data: {
    labels,
    datasets: [
      {
        data: [42, 47, 44, 51, 58, 55, 61],
        borderColor: red,
        backgroundColor: redFade,
        tension: 0.4,
        fill: true,
        pointRadius: 3,
        pointBackgroundColor: red,
      },
    ],
  },
  options: {
    ...sharedOpts,
    scales: {
      ...sharedOpts.scales,
      y: {
        ...sharedOpts.scales.y,
        ticks: { ...sharedOpts.scales.y.ticks, callback: (v) => v + "%" },
      },
    },
  },
});


// PAGE NAVIGATION ---------------------------------------- 🟣
const pages = {
  'Overview': 'overview-page',
  'Percakapan': 'percakapan-page',
  'Analitik': 'analitik-page',
  'Kontak / Leads': 'leads-page',
  'AI Agent': 'ai-agent-page',
  'Appointment': 'appointment-page',
  'Pipeline': 'pipeline-page',
  'Integrasi': 'integrasi-page',
  'Pengaturan Agent': 'pengaturan-agent-page',
  'Knowledge Base': 'knowledge-base-page',
  'AI Call': 'ai-call-page',
};

function showPage(pageId) {
  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  const target = document.getElementById(pageId);
  if (target) target.style.display = 'flex';
}

function initNav() {
  const navItems = document.querySelectorAll('.sb-item, .sec-action');

  navItems.forEach(item => {

    let label;

    if (item.classList.contains('sec-action')) {
      label = item.querySelector('span')?.id?.trim();
    } else {
      label = (item.querySelector('.sb-label') || item.querySelector('span'))?.textContent?.trim();
    }

    if (!pages[label]) return;

    item.addEventListener('click', e => {
      e.preventDefault();

      navItems.forEach(i => i.classList.remove('active'));

      if (item.classList.contains('sb-item')) {
        item.classList.add('active');
      }

      showPage(pages[label]);

      const topbarTitle = document.querySelector('.topbar-title');
      if (topbarTitle) topbarTitle.textContent = label;
    });
  });

  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });

  showPage('overview-page');
}

document.addEventListener('DOMContentLoaded', initNav);


// ── DATETIME TOPBAR (clock update setiap detik) ──────────────
(function () {
  var DAYS   = ['Minggu','Senin','Selasa','Rabu','Kamis','Jumat','Sabtu'];
  var MONTHS = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];

  function pad(n) { return String(n).padStart(2,'0'); }

  function tick() {
    var now = new Date();
    var dateEl = document.getElementById('tbDateStr');
    var timeEl = document.getElementById('tbTimeStr');
    var chipEl = document.getElementById('tbGreetingChip');
    var iconEl = document.getElementById('tbGreetingIcon');
    var textEl = document.getElementById('tbGreetingText');

    if (dateEl) {
      dateEl.textContent =
        DAYS[now.getDay()] + ', ' +
        now.getDate() + ' ' + MONTHS[now.getMonth()];
    }

    if (timeEl) {
      timeEl.textContent =
        pad(now.getHours()) + ':' + pad(now.getMinutes()) + ':' + pad(now.getSeconds());
    }

    var h = now.getHours();
    var greeting =
      h >= 5  && h < 12 ? { text:'Selamat Pagi',  icon:'ti-sun',        cls:'greeting-pagi'  } :
      h >= 12 && h < 15 ? { text:'Selamat Siang', icon:'ti-sun-high',   cls:'greeting-siang' } :
      h >= 15 && h < 19 ? { text:'Selamat Sore',  icon:'ti-sunset-2',   cls:'greeting-sore'  } :
                          { text:'Selamat Malam', icon:'ti-moon-stars', cls:'greeting-malam' };

    if (textEl) textEl.textContent = greeting.text;
    if (iconEl) iconEl.className   = 'ti ' + greeting.icon;
    if (chipEl) {
      chipEl.classList.remove('greeting-pagi','greeting-siang','greeting-sore','greeting-malam');
      chipEl.classList.add(greeting.cls);
    }
  }

  document.addEventListener('DOMContentLoaded', function () {
    tick();
    setInterval(tick, 1000);
  });
})();


// >> DYNAMIC TOPBAR ─────────────────────────────────────────────
(function () {

  // Reuse TYPE_CFG yang sama dari notif dropdown — rebuild lokal
  var TYPE_CFG = {
    chat:    { iconCls:'tb-ni-red',    pillCls:'nam-pill-chat',    label:'Chat',
               svg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
    lead:    { iconCls:'tb-ni-blue',   pillCls:'nam-pill-lead',    label:'Lead',
               svg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    ai:      { iconCls:'tb-ni-purple', pillCls:'nam-pill-ai',      label:'AI Agent',
               svg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>' },
    success: { iconCls:'tb-ni-green',  pillCls:'nam-pill-success', label:'Sistem',
               svg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' },
    appt:    { iconCls:'tb-ni-amber',  pillCls:'nam-pill-appt',    label:'Appointment',
               svg:'<svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  };

  // Dataset notifikasi lengkap (extend dari NOTIF_DATA global — ambil via window._notifAll)
  // Kita minta sistem notif expose datanya; jika tidak ada, gunakan data ini sebagai fallback
  var ALL_NOTIFS = [
    { id:1,  type:'chat',    title:'Percakapan baru masuk',          sub:'PT. Sinar Jaya — WhatsApp',              time:'2 mnt lalu',   group:'Hari Ini',    read:false },
    { id:2,  type:'lead',    title:'Lead baru terdeteksi',           sub:'Budi Santoso — Live Chat',               time:'15 mnt lalu',  group:'Hari Ini',    read:false },
    { id:3,  type:'ai',      title:'AI Agent memerlukan perhatian',  sub:'Percakapan #4821 — sentimen negatif',    time:'32 mnt lalu',  group:'Hari Ini',    read:false },
    { id:4,  type:'success', title:'AI Agent aktif kembali',         sub:'Setelah maintenance terjadwal',          time:'1 jam lalu',   group:'Hari Ini',    read:true  },
    { id:5,  type:'appt',    title:'Pengingat appointment',          sub:'Demo dengan CV. Maju — 14.00 hari ini', time:'2 jam lalu',   group:'Hari Ini',    read:true  },
    { id:6,  type:'lead',    title:'Follow-up otomatis terkirim',    sub:'AI mengirim pesan ke 3 leads HOT',       time:'3 jam lalu',   group:'Hari Ini',    read:true  },
    { id:7,  type:'chat',    title:'Eskalasi ke agen manusia',       sub:'Rina Wahyuni — Instagram DM',            time:'Kemarin 16:45', group:'Kemarin',    read:true  },
    { id:8,  type:'appt',    title:'Appointment terkonfirmasi',      sub:'Konsultasi — Arif Budiman 10.00',        time:'Kemarin 09:20', group:'Kemarin',    read:true  },
    { id:9,  type:'ai',      title:'Kampanye outbound selesai',      sub:'200 kontak dihubungi — 156 menjawab',    time:'Kemarin 08:00', group:'Kemarin',    read:true  },
    { id:10, type:'lead',    title:'24 leads HOT teridentifikasi',   sub:'Berdasarkan analisis perilaku minggu ini', time:'2 hari lalu', group:'Sebelumnya', read:true  },
    { id:11, type:'success', title:'Integrasi WhatsApp diperbarui',  sub:'Webhook tersambung kembali',             time:'2 hari lalu',  group:'Sebelumnya', read:true  },
    { id:12, type:'appt',    title:'4 appointment dijadwalkan AI',   sub:'Senin — Rabu minggu depan',              time:'3 hari lalu',  group:'Sebelumnya', read:true  },
  ];

  var currentFilter = 'semua';

  // ── Buka modal ───────────────────────────────────────────────
  window.openNotifModal = function () {
    var el = document.getElementById('notif-all-modal');
    if (!el) return;
    el.style.display = 'flex';
    document.body.style.overflow = 'hidden';
    renderModal();
  };

  // ── Tutup modal ──────────────────────────────────────────────
  window.closeNotifModal = function () {
    var el = document.getElementById('notif-all-modal');
    if (!el) return;
    el.style.display = 'none';
    document.body.style.overflow = '';
  };

  // ── Filter tab ───────────────────────────────────────────────
  window.namFilter = function (btn, filter) {
    document.querySelectorAll('.nam-tab').forEach(function (t) { t.classList.remove('active'); });
    btn.classList.add('active');
    currentFilter = filter;
    renderModal();
  };

  // ── Mark single read ─────────────────────────────────────────
  window.namMarkOne = function (id, e) {
    if (e) e.stopPropagation();
    var n = ALL_NOTIFS.find(function (x) { return x.id === id; });
    if (n) n.read = true;
    renderModal();
  };

  // ── Mark all read ────────────────────────────────────────────
  function markAllRead() {
    ALL_NOTIFS.forEach(function (n) { n.read = true; });
    renderModal();
  }

  // ── Clear read ───────────────────────────────────────────────
  function clearRead() {
    ALL_NOTIFS = ALL_NOTIFS.filter(function (n) { return !n.read; });
    renderModal();
  }

  // ── Render ───────────────────────────────────────────────────
  function renderModal() {
    var body   = document.getElementById('namBody');
    var badge  = document.getElementById('namUnreadBadge');
    var info   = document.getElementById('namCountInfo');
    if (!body) return;

    // Filter
    var filtered = ALL_NOTIFS.filter(function (n) {
      if (currentFilter === 'unread') return !n.read;
      if (currentFilter === 'semua')  return true;
      return n.type === currentFilter;
    });

    // Unread badge
    var unreadCount = ALL_NOTIFS.filter(function (n) { return !n.read; }).length;
    if (badge) {
      badge.textContent = unreadCount;
      badge.classList.toggle('visible', unreadCount > 0);
    }

    // Count info
    if (info) info.textContent = filtered.length + ' notifikasi ditampilkan';

    // Empty state
    if (filtered.length === 0) {
      body.innerHTML =
        '<div class="nam-empty">' +
        '<svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" stroke-linecap="round"><path d="M18 8.4C18 6.7 17.37 5.06 16.24 3.86C15.11 2.65 13.59 2 12 2C10.41 2 8.89 2.65 7.76 3.86C6.63 5.06 6 6.7 6 8.4C6 15.867 3 18 3 18H21C21 18 18 15.867 18 8.4Z"/><path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21"/></svg>' +
        '<div class="nam-empty-title">Tidak ada notifikasi</div>' +
        '<span>Semua notifikasi sudah dibaca atau belum ada aktivitas baru.</span>' +
        '</div>';
      return;
    }

    // Group by date
    var groups = {};
    var groupOrder = [];
    filtered.forEach(function (n) {
      if (!groups[n.group]) { groups[n.group] = []; groupOrder.push(n.group); }
      groups[n.group].push(n);
    });

    body.innerHTML = groupOrder.map(function (g) {
      var items = groups[g].map(function (n) {
        var cfg = TYPE_CFG[n.type] || TYPE_CFG.success;
        return (
          '<div class="nam-item' + (n.read ? '' : ' unread') + '" onclick="namMarkOne(' + n.id + ', event)">' +
          '<div class="nam-item-icon ' + cfg.iconCls + '">' + cfg.svg + '</div>' +
          '<div class="nam-item-body">' +
          '<div class="nam-item-title">' + n.title + '</div>' +
          '<div class="nam-item-sub">' + n.sub + '</div>' +
          '<div class="nam-item-time">' + n.time + '</div>' +
          '</div>' +
          '<div class="nam-item-right">' +
          '<span class="nam-type-pill ' + cfg.pillCls + '">' + cfg.label + '</span>' +
          (!n.read ? '<button class="nam-mark-btn" onclick="namMarkOne(' + n.id + ', event)" title="Tandai dibaca">✓ Baca</button>' : '') +
          '</div>' +
          '</div>'
        );
      }).join('');
      return '<div class="nam-group-label">' + g + '</div>' + items;
    }).join('');
  }

  // ── Init event listeners ─────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {

    // Footer "Lihat semua notifikasi" → buka modal
    var footer = document.getElementById('tbNotifFooter');
    if (footer) {
      footer.addEventListener('click', function (e) {
        e.stopPropagation();
        // Tutup dropdown dulu
        var btn = document.getElementById('tbNotifBtn');
        if (btn) { btn.classList.remove('open'); btn.setAttribute('aria-expanded','false'); }
        openNotifModal();
      });
    }

    // Mark all di modal
    var markAllBtn = document.getElementById('namMarkAllBtn');
    if (markAllBtn) markAllBtn.addEventListener('click', markAllRead);

    // Clear read di modal
    var clearBtn = document.getElementById('namClearReadBtn');
    if (clearBtn) clearBtn.addEventListener('click', clearRead);

    // Escape key tutup modal
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeNotifModal();
    });
  });

})();


// >> COL RIGHT FUNCTION
(function () {
  var STORAGE_KEY = 'colRightVisible';

  function setPanel(visible, animate) {
    var panel  = document.getElementById('colRight');
    var btn    = document.getElementById('colRightToggle');
    if (!panel || !btn) return;

    if (!animate) {
      panel.style.transition = 'none';
      requestAnimationFrame(function () {
        panel.style.transition = '';
      });
    }

    if (visible) {
      panel.classList.remove('collapsed');
      btn.classList.remove('panel-hidden');
      btn.title = 'Sembunyikan panel';
    } else {
      panel.classList.add('collapsed');
      btn.classList.add('panel-hidden');
      btn.title = 'Tampilkan panel';
    }

    localStorage.setItem(STORAGE_KEY, visible ? '1' : '0');
  }

  window.toggleColRight = function () {
    var panel = document.getElementById('colRight');
    if (!panel) return;
    var isVisible = !panel.classList.contains('collapsed');
    setPanel(!isVisible, true);
  };

  // Restore saved state on load (no animation on init)
  document.addEventListener('DOMContentLoaded', function () {
    var saved = localStorage.getItem(STORAGE_KEY);
    // Default: visible (null = first time)
    setPanel(saved !== '0', false);
  });
})();


// >> RIGHT COL FUNCTION
// ── Right Panel Tab Switching ────────────────────────────────────
function rpSwitchTab(tabId) {
  // Update tab active state
  const tabs = document.querySelectorAll('.rp-tab');
  const tabMap = ['live-chat', 'detail-kontak', 'ringkasan-ai'];
  tabs.forEach((tab, i) => {
    tab.classList.toggle('active', tabMap[i] === tabId);
  });

  // Show/hide panels
  const panels = ['live-chat', 'detail-kontak', 'ringkasan-ai'];
  panels.forEach(id => {
    const el = document.getElementById('rp-panel-' + id);
    if (el) el.style.display = id === tabId ? 'flex' : 'none';
  });
}

// Copy to clipboard helper
async function rpCopy(text, btn) {
  try {
    await navigator.clipboard.writeText(text);
    const icon = btn.querySelector('i');
    if (icon) { icon.className = 'ti ti-check'; setTimeout(() => { icon.className = 'ti ti-copy'; }, 1500); }
  } catch(e) {}
}

// Add note placeholder
function rpAddNote() {
  const note = document.querySelector('.rp-dk-note span');
  if (note) note.textContent = prompt('Tambah catatan:') || note.textContent;
}

// ── NOTIFICATION SYSTEM ────────────────────────────────────────
(function () {

  // ── Data notifikasi dummy ──────────────────────────────────
  const NOTIF_DATA = [
    { id:1, type:'chat',    title:'Percakapan baru masuk',        sub:'PT. Sinar Jaya — WhatsApp',              time:'2 mnt lalu',  read:false },
    { id:2, type:'lead',    title:'Lead baru terdeteksi',         sub:'Budi Santoso — Live Chat',               time:'15 mnt lalu', read:false },
    { id:3, type:'ai',      title:'AI Agent memerlukan perhatian', sub:'Percakapan #4821 — sentimen negatif',   time:'32 mnt lalu', read:false },
    { id:4, type:'success', title:'AI Agent aktif kembali',       sub:'Setelah maintenance terjadwal',          time:'1 jam lalu',  read:true  },
    { id:5, type:'appt',    title:'Pengingat appointment',        sub:'Demo dengan CV. Maju — 14.00 hari ini',  time:'2 jam lalu',  read:true  },
    { id:6, type:'lead',    title:'Follow-up otomatis terkirim',  sub:'AI mengirim pesan ke 3 leads HOT',       time:'3 jam lalu',  read:true  },
  ];

  const TYPE_CFG = {
    chat:    { iconCls:'tb-ni-red',    svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg>' },
    lead:    { iconCls:'tb-ni-blue',   svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>' },
    ai:      { iconCls:'tb-ni-purple', svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><path d="M12 2a4 4 0 0 1 4 4v1h1a3 3 0 0 1 3 3v7a3 3 0 0 1-3 3H7a3 3 0 0 1-3-3v-7a3 3 0 0 1 3-3h1V6a4 4 0 0 1 4-4z"/><circle cx="9" cy="13" r="1" fill="currentColor"/><circle cx="15" cy="13" r="1" fill="currentColor"/></svg>' },
    success: { iconCls:'tb-ni-green',  svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="20 6 9 17 4 12"/></svg>' },
    appt:    { iconCls:'tb-ni-amber',  svg:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>' },
  };

  // ── State ──────────────────────────────────────────────────
  let notifs = NOTIF_DATA.map(n => ({ ...n }));
  let isOpen = false;

  // ── DOM refs ───────────────────────────────────────────────
  function btn()      { return document.getElementById('tbNotifBtn'); }
  function dropdown() { return document.getElementById('tbNotifDropdown'); }
  function list()     { return document.getElementById('tbNotifList'); }
  function dot()      { return document.getElementById('tbNotifDot'); }

  // ── Count unread ───────────────────────────────────────────
  function unreadCount() { return notifs.filter(n => !n.read).length; }

  // ── Update badge & ring ────────────────────────────────────
  function updateBadge() {
    var el    = btn();
    var count = unreadCount();
    if (!el) return;
    el.classList.toggle('has-unread', count > 0);

    var footer = document.getElementById('tbNotifFooter');
    if (footer) {
      var badge = footer.querySelector('.tb-notif-count-badge');
      if (count > 0) {
        if (!badge) {
          badge = document.createElement('span');
          badge.className = 'tb-notif-count-badge';
          footer.appendChild(badge);
        }
        badge.textContent = count;
      } else if (badge) {
        badge.remove();
      }
    }
  }

  // ── Render list ────────────────────────────────────────────
  function renderList() {
    var el = list();
    if (!el) return;

    if (notifs.length === 0) {
      el.innerHTML =
        '<div class="tb-notif-empty">' +
        '<svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round"><path d="M18 8.4C18 6.7 17.37 5.06 16.24 3.86C15.11 2.65 13.59 2 12 2C10.41 2 8.89 2.65 7.76 3.86C6.63 5.06 6 6.7 6 8.4C6 15.867 3 18 3 18H21C21 18 18 15.867 18 8.4Z"/><path d="M13.73 21C13.55 21.3 13.3 21.55 13 21.73C12.69 21.9 12.35 22 12 22C11.65 22 11.31 21.9 11 21.73C10.7 21.55 10.45 21.3 10.27 21"/></svg>' +
        '<span>Semua notifikasi sudah dibaca</span>' +
        '</div>';
      return;
    }

    el.innerHTML = notifs.map(function (n) {
      var cfg = TYPE_CFG[n.type] || TYPE_CFG.success;
      return (
        '<div class="tb-notif-item' + (n.read ? '' : ' unread') + '" data-id="' + n.id + '" onclick="notifMarkRead(' + n.id + ')">' +
        '<div class="tb-ni-icon ' + cfg.iconCls + '">' + cfg.svg + '</div>' +
        '<div class="tb-ni-body">' +
        '<div class="tb-ni-title">' + n.title + '</div>' +
        '<div class="tb-ni-sub">'   + n.sub   + '</div>' +
        '</div>' +
        '<div class="tb-ni-time">' + n.time + '</div>' +
        '</div>'
      );
    }).join('');
  }

  // ── Open / Close ───────────────────────────────────────────
  function openDropdown() {
    isOpen = true;
    btn().classList.add('open');
    btn().setAttribute('aria-expanded', 'true');
    renderList();
  }

  function closeDropdown() {
    isOpen = false;
    var el = btn();
    if (el) {
      el.classList.remove('open');
      el.setAttribute('aria-expanded', 'false');
    }
  }

  function toggleDropdown(e) {
    e.stopPropagation();
    if (isOpen) { closeDropdown(); } else { openDropdown(); }
  }

  // ── Mark read ──────────────────────────────────────────────
  window.notifMarkRead = function (id) {
    var n = notifs.find(function (x) { return x.id === id; });
    if (n) { n.read = true; }
    renderList();
    updateBadge();
  };

  function markAllRead() {
    notifs.forEach(function (n) { n.read = true; });
    renderList();
    updateBadge();
  }

  // ── Add new notification (can call externally) ─────────────
  window.pushNotif = function (opts) {
    var newId = Date.now();
    notifs.unshift({
      id:    newId,
      type:  opts.type  || 'success',
      title: opts.title || 'Notifikasi baru',
      sub:   opts.sub   || '',
      time:  'Baru saja',
      read:  false,
    });
    updateBadge();
    if (isOpen) renderList();
  };

  // ── Init ───────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function () {
    var btnEl = btn();
    if (!btnEl) return;

    btnEl.addEventListener('click', toggleDropdown);

    // Keyboard: Enter / Space
    btnEl.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        toggleDropdown(e);
      }
      if (e.key === 'Escape') closeDropdown();
    });

    // Mark all button
    var markAllBtn = document.getElementById('tbNotifMarkAll');
    if (markAllBtn) markAllBtn.addEventListener('click', function (e) {
      e.stopPropagation();
      markAllRead();
    });

    // Close on outside click
    document.addEventListener('click', function (e) {
      if (isOpen && !btnEl.contains(e.target)) closeDropdown();
    });

    // Close on Escape
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && isOpen) closeDropdown();
    });

    // Simulate a new notif after 8s (demo)
    setTimeout(function () {
      window.pushNotif({
        type:  'chat',
        title: 'Percakapan baru',
        sub:   'Andi Wijaya — Instagram DM',
      });
    }, 8000);

    updateBadge();
  });

})();


// TELEGRAM INPUT MODAL
(function() {
  const _origTgOpen = window.tgOpenModal;
  window.tgOpenModal = function() {
    _origTgOpen && _origTgOpen();
    // Show masked stored token in preview
    const token  = localStorage.getItem('idt_telegram_bot_token') || '';
    const previewEl = document.getElementById('tg-stored-val');
    if (previewEl) {
      if (token) {
        // Mask tengah token: 1234567890:AAGkVBnr...lXI
        const parts = token.split(':');
        const masked = parts.length === 2
          ? parts[0] + ':' + parts[1].slice(0,4) + '••••••••••••••••' + parts[1].slice(-3)
          : token.slice(0,6) + '••••••••••' + token.slice(-4);
        previewEl.textContent = masked;
      } else {
        previewEl.textContent = 'Belum ada token tersimpan';
      }
    }
    const stored = document.getElementById('tg-stored-preview');
    if (stored) stored.style.display = 'block';
  };
})();