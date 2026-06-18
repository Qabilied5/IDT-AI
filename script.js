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
      label = item.querySelector('span')?.textContent?.trim();
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