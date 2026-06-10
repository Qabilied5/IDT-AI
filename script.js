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
  'Kontak / Leads': 'contact-page',
  'AI Agent': 'ai-agent-page',
  'Appointment': 'appointment-page',
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
  const navItems = document.querySelectorAll('.sb-item');
  navItems.forEach(item => {
    const label = item.querySelector('span')?.textContent?.trim();
    if (!pages[label]) return;

    item.addEventListener('click', e => {
      e.preventDefault();
      navItems.forEach(i => i.classList.remove('active'));
      item.classList.add('active');
      showPage(pages[label]);

      // Update topbar title
      const topbarTitle = document.querySelector('.topbar-title');
      if (topbarTitle) topbarTitle.textContent = label;
    });
  });

  // Init: hide all except overview
  Object.values(pages).forEach(id => {
    const el = document.getElementById(id);
    if (el) el.style.display = 'none';
  });
  showPage('overview-page');
}

document.addEventListener('DOMContentLoaded', initNav);