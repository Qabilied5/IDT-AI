/* ==========================================================================
   REVENUE PAGE — script_page/revenue.js
   Mengisi KPI, chart tren AI vs Human, donut proporsi, dan tabel breakdown
   pada halaman #revenue-page. Data di bawah ini adalah data contoh (dummy) —
   ganti bagian "RV_DATA" dengan data asli dari API/backend saat integrasi.
   ========================================================================== */

(function () {

  // ── Guard: hanya jalan kalau halaman revenue ada di DOM ────────────────
  const page = document.getElementById('revenue-page');
  if (!page) return;

  /* ────────────────────────────────────────────────────────────────────
     1. DATA CONTOH (ganti dengan fetch ke API saat integrasi backend)
     ──────────────────────────────────────────────────────────────────── */
  const RV_DATA = {
    range: 30, // 7 | 30 | 90

    summary: {
      totalRevenue: 486200000,
      totalTrend: 18,        // % vs periode lalu
      aiRevenue: 301400000,
      aiTrend: 24,
      humanRevenue: 184800000,
      humanTrend: 9,
      aov: 2100000,
      aovTrend: 6
    },

    // Tren harian 30 hari terakhir (contoh disederhanakan jadi 10 titik)
    dailyTrend: {
      labels: ['1 Jun', '4 Jun', '7 Jun', '10 Jun', '13 Jun', '16 Jun', '19 Jun', '22 Jun', '25 Jun', '28 Jun'],
      ai:    [7.2, 8.1, 7.6, 9.4, 10.2, 9.8, 11.1, 10.6, 12.4, 13.0],   // dalam juta
      human: [5.1, 4.8, 5.6, 5.2, 6.0, 5.7, 6.3, 6.1, 6.8, 7.0]         // dalam juta
    },

    channels: [
      { name: 'WhatsApp',  icon: 'ti-brand-whatsapp',  ai: 168500000, human: 92300000 },
      { name: 'Website',   icon: 'ti-world',            ai: 78200000,  human: 51100000 },
      { name: 'Instagram', icon: 'ti-brand-instagram',  ai: 39600000,  human: 28400000 },
      { name: 'Telegram',  icon: 'ti-send',             ai: 15100000,  human: 13000000 }
    ],

    transactions: [
      { date: '28 Jun 2026', customer: 'PT Sumber Baja Perkasa', product: 'Paket Besi Beton 10mm', source: 'ai',    amount: 24500000 },
      { date: '27 Jun 2026', customer: 'CV Mitra Elektrik',       product: 'Kabel NYY 4x6mm',       source: 'human', amount: 18750000 },
      { date: '27 Jun 2026', customer: 'Toko Jaya Makmur',        product: 'Pipa PVC AW 3"',         source: 'ai',    amount: 9600000 },
      { date: '26 Jun 2026', customer: 'PT Konstruksi Nusantara', product: 'Semen 50kg (100 sak)',   source: 'human', amount: 32000000 },
      { date: '26 Jun 2026', customer: 'Bengkel Sinar Logam',     product: 'Plat Besi 4mm',          source: 'ai',    amount: 7400000 }
    ]
  };

  /* ────────────────────────────────────────────────────────────────────
     2. HELPERS
     ──────────────────────────────────────────────────────────────────── */
  function formatRupiah(n) {
    if (n >= 1000000000) return 'Rp' + (n / 1000000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' M';
    if (n >= 1000000) return 'Rp' + (n / 1000000).toLocaleString('id-ID', { maximumFractionDigits: 1 }) + ' Jt';
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function formatRupiahFull(n) {
    return 'Rp' + n.toLocaleString('id-ID');
  }

  function pct(part, total) {
    if (!total) return 0;
    return Math.round((part / total) * 100);
  }

  /* ────────────────────────────────────────────────────────────────────
     3. RENDER KPI
     ──────────────────────────────────────────────────────────────────── */
  function renderKpi() {
    const s = RV_DATA.summary;
    const aiShare = pct(s.aiRevenue, s.totalRevenue);
    const humanShare = pct(s.humanRevenue, s.totalRevenue);

    setText('rv-kpi-total', formatRupiah(s.totalRevenue));
    setText('rv-kpi-ai', formatRupiah(s.aiRevenue));
    setText('rv-kpi-human', formatRupiah(s.humanRevenue));
    setText('rv-kpi-aov', formatRupiah(s.aov));

    setText('rv-kpi-ai-share', aiShare + '%');
    setText('rv-kpi-human-share', humanShare + '%');

    setTrend('rv-kpi-total-trend', s.totalTrend, 'vs periode lalu');
    setTrend('rv-kpi-aov-trend', s.aovTrend, 'vs periode lalu');
    setTrend('rv-kpi-ai-trend', s.aiTrend, null, aiShare + '% dari total');
    setTrend('rv-kpi-human-trend', s.humanTrend, null, humanShare + '% dari total');
  }

  function setText(id, val) {
    const el = document.getElementById(id);
    if (el) el.textContent = val;
  }

  function setTrend(id, value, suffix, shareText) {
    const el = document.getElementById(id);
    if (!el) return;
    const up = value >= 0;
    el.classList.remove('up', 'down');
    el.classList.add(up ? 'up' : 'down');
    const icon = up ? 'ti-trending-up' : 'ti-trending-down';
    const sign = up ? '+' : '';
    const tail = shareText ? shareText : suffix;
    el.innerHTML = `<i class="ti ${icon}"></i> ${sign}${value}% &middot; ${tail}`;
  }

  /* ────────────────────────────────────────────────────────────────────
     4. RENDER CHART — TREN HARIAN (AI vs Human)
     ──────────────────────────────────────────────────────────────────── */
  let trendChartInstance = null;

  function renderTrendChart() {
    const canvas = document.getElementById('rv-trend-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    if (trendChartInstance) trendChartInstance.destroy();

    trendChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'line',
      data: {
        labels: RV_DATA.dailyTrend.labels,
        datasets: [
          {
            label: 'AI Agent',
            data: RV_DATA.dailyTrend.ai,
            borderColor: '#dc2626',
            backgroundColor: 'rgba(220,38,38,0.08)',
            tension: 0.35,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          },
          {
            label: 'Human',
            data: RV_DATA.dailyTrend.human,
            borderColor: '#1f2937',
            backgroundColor: 'rgba(31,41,55,0.06)',
            tension: 0.35,
            fill: true,
            pointRadius: 0,
            borderWidth: 2
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.dataset.label}: Rp${ctx.parsed.y.toLocaleString('id-ID')} Jt`
            }
          }
        },
        scales: {
          x: { grid: { display: false }, ticks: { display: false } },
          y: {
            grid: { color: '#f3f4f6' },
            ticks: { callback: (v) => 'Rp' + v + 'Jt' }
          }
        }
      }
    });

    // Label ringkas di bawah chart (titik awal & akhir periode)
    const labelsEl = document.getElementById('rv-trend-labels');
    if (labelsEl) {
      const first = RV_DATA.dailyTrend.labels[0];
      const last = RV_DATA.dailyTrend.labels[RV_DATA.dailyTrend.labels.length - 1];
      labelsEl.innerHTML = `<span>${first}</span><span>${last}</span>`;
    }
  }

  /* ────────────────────────────────────────────────────────────────────
     5. RENDER CHART — DONUT PROPORSI AI vs HUMAN
     ──────────────────────────────────────────────────────────────────── */
  let donutChartInstance = null;

  function renderDonutChart() {
    const canvas = document.getElementById('rv-donut-chart');
    if (!canvas || typeof Chart === 'undefined') return;

    const s = RV_DATA.summary;
    if (donutChartInstance) donutChartInstance.destroy();

    donutChartInstance = new Chart(canvas.getContext('2d'), {
      type: 'doughnut',
      data: {
        labels: ['AI Agent', 'Human'],
        datasets: [{
          data: [s.aiRevenue, s.humanRevenue],
          backgroundColor: ['#dc2626', '#1f2937'],
          borderWidth: 0
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: '72%',
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => `${ctx.label}: ${formatRupiah(ctx.parsed)}`
            }
          }
        }
      }
    });

    setText('rv-donut-total', formatRupiah(s.totalRevenue));
    setText('rv-leg-ai', pct(s.aiRevenue, s.totalRevenue) + '%');
    setText('rv-leg-human', pct(s.humanRevenue, s.totalRevenue) + '%');
  }

  /* ────────────────────────────────────────────────────────────────────
     6. RENDER TABEL — BREAKDOWN PER CHANNEL
     ──────────────────────────────────────────────────────────────────── */
  function renderChannelTable() {
    const tbody = document.getElementById('rv-channel-tbody');
    if (!tbody) return;

    tbody.innerHTML = RV_DATA.channels.map((c) => {
      const total = c.ai + c.human;
      const aiShare = pct(c.ai, total);
      return `
        <tr>
          <td><i class="ti ${c.icon}" style="margin-right:6px;color:var(--gray-400,#9ca3af)"></i>${c.name}</td>
          <td>${formatRupiah(c.ai)}</td>
          <td>${formatRupiah(c.human)}</td>
          <td><strong>${formatRupiah(total)}</strong></td>
          <td>
            <div class="rv-bar-mini"><div class="rv-bar-fill-mini" style="width:${aiShare}%"></div></div>
            <span>${aiShare}%</span>
          </td>
        </tr>`;
    }).join('');
  }

  /* ────────────────────────────────────────────────────────────────────
     7. RENDER TABEL — TRANSAKSI TERBARU
     ──────────────────────────────────────────────────────────────────── */
  function renderTransactionTable() {
    const tbody = document.getElementById('rv-transaction-tbody');
    if (!tbody) return;

    tbody.innerHTML = RV_DATA.transactions.map((t) => {
      const badge = t.source === 'ai'
        ? '<span class="rv-source-badge ai"><i class="ti ti-robot"></i> AI</span>'
        : '<span class="rv-source-badge human"><i class="ti ti-user"></i> Human</span>';
      return `
        <tr>
          <td>${t.date}</td>
          <td>${t.customer}</td>
          <td>${t.product}</td>
          <td>${badge}</td>
          <td class="rv-amount">${formatRupiahFull(t.amount)}</td>
        </tr>`;
    }).join('');
  }

  /* ────────────────────────────────────────────────────────────────────
     8. DATE RANGE DROPDOWN
     ──────────────────────────────────────────────────────────────────── */
  function bindRangeDropdown() {
    const btn = document.getElementById('rv-range-btn');
    const dropdown = document.getElementById('rv-range-dropdown');
    if (!btn || !dropdown) return;

    btn.addEventListener('click', (e) => {
      e.stopPropagation();
      dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
    });

    dropdown.querySelectorAll('.rv-range-opt').forEach((opt) => {
      opt.addEventListener('click', () => {
        dropdown.querySelectorAll('.rv-range-opt').forEach((o) => o.classList.remove('active'));
        opt.classList.add('active');
        btn.innerHTML = `<i class="ti ti-calendar-week"></i> ${opt.textContent.trim()} <i class="ti ti-chevron-down" style="font-size:11px;margin-left:2px"></i>`;
        dropdown.style.display = 'none';
        // NOTE: sambungkan ke fetch data asli berdasarkan opt.dataset.val
        // saat backend tersedia. Untuk saat ini chart tetap memakai RV_DATA.
      });
    });

    document.addEventListener('click', () => { dropdown.style.display = 'none'; });
  }

  function bindRefreshButton() {
    const btn = document.getElementById('rv-refresh-btn');
    if (!btn) return;
    btn.addEventListener('click', () => {
      renderKpi();
      renderTrendChart();
      renderDonutChart();
      renderChannelTable();
      renderTransactionTable();
    });
  }

  /* ────────────────────────────────────────────────────────────────────
     9. INIT
     ──────────────────────────────────────────────────────────────────── */
  function initRevenuePage() {
    renderKpi();
    renderTrendChart();
    renderDonutChart();
    renderChannelTable();
    renderTransactionTable();
    bindRangeDropdown();
    bindRefreshButton();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initRevenuePage);
  } else {
    initRevenuePage();
  }

})();