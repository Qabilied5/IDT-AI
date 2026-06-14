/* =============================================================
   analitik.js — Indotrading AI
   JS khusus untuk #analitik-page
   Membutuhkan: Chart.js 4.x (sudah di-load via CDN di HTML utama)
   ============================================================= */

(function () {
  "use strict";

  /* ── State ──────────────────────────────────────────────────── */
  const state = {
    activeTab: "percakapan",
    chartsInitialized: {},
    invFilter: "",
    invSearch: "",
    invPage: 1,
    invPerPage: 10,
  };

  /* ── Warna brand ────────────────────────────────────────────── */
  const CLR = {
    red: "#c8102e",
    redLight: "rgba(200,16,46,.12)",
    blue: "#3b82f6",
    blueLight: "rgba(59,130,246,.12)",
    purple: "#8b5cf6",
    purpleLight: "rgba(139,92,246,.12)",
    green: "#1a7a4a",
    greenLight: "rgba(26,122,74,.12)",
    amber: "#f59e0b",
    amberLight: "rgba(245,158,11,.12)",
    gray100: "#f0f0f0",
    gray600: "#555555",
  };

  /* ── Data dummy: Volume Chat harian per channel ─────────────── */
  const volumeData = {
    labels: ["18 Mei","19 Mei","20 Mei","21 Mei","22 Mei","23 Mei","24 Mei",
              "25 Mei","26 Mei","27 Mei","28 Mei","29 Mei","30 Mei","31 Mei",
              "1 Jun","2 Jun","3 Jun"],
    wa:     [210,198,225,240,188,90,80,230,255,270,248,201,195,230,260,280,251],
    web:    [80, 75, 90, 88, 70, 40,30, 85, 95,100, 92, 78, 74, 88,100,108, 96],
    ig:     [44, 38, 50, 48, 35, 22,18, 46, 54, 60, 55, 41, 40, 49, 58, 62, 52],
  };
  const shortLabels = volumeData.labels.map(l => l.replace(/\d{4}\s/,""));

  /* ── Data dummy: Closing & Upsell ──────────────────────────── */
  const closingData = {
    labels: ["Mg 1","Mg 2","Mg 3","Mg 4","Mg 5","Mg 6","Mg 7","Mg 8"],
    closing:[28,30,32,29,35,37,34,38],
    upsell: [10,13,12,16,18,20,17,22],
  };

  /* ── Data dummy: Chat per Jam ───────────────────────────────── */
  const hourlyLabels = ["08","09","10","11","12","13","14","15","16","17","18","19","20","21"];
  const hourlyData   = [42, 88,134,158,120,110,142,165,148,130, 96, 72, 48, 28];

  /* ── Data dummy: Revenue ────────────────────────────────────── */
  const revenueData = {
    labels:  shortLabels,
    lunas:   [18,22,19,28,14, 9, 8,24,30,32,26,20,18,24,28,34,30],
    pending: [ 5, 4, 6, 7, 4, 2, 2, 6, 8, 9, 7, 5, 5, 7, 8,10, 9],
  };

  /* ── Data dummy: Invoice ─────────────────────────────────────── */
  const invoices = (() => {
    const products = [
      "Spare Part Mesin Packing A200",
      "Filter Industri Premium FP-80",
      "Bearing Set Conveyor BC-40",
      "Valve Pneumatik VC-22",
      "Sensor Suhu Industrial",
      "Gear Reducer 5:1",
      "Pompa Sentrifugal 2 Inch",
    ];
    const statuses = ["lunas","lunas","lunas","pending","pending","batal"];
    const customers = [
      "PT Maju Sejahtera","CV Abadi Jaya","PT Teknik Makmur","UD Sinar Mas",
      "PT Global Industri","CV Nusantara","PT Delta Perkasa","UD Karya Mandiri",
      "PT Sentosa Abadi","CV Prima Teknik","PT Argo Industri","PT Cahaya Baru",
    ];
    const arr = [];
    for (let i = 1; i <= 80; i++) {
      const d = new Date(2025, 4, 1 + Math.floor(i * 0.6));
      const status = statuses[i % statuses.length];
      arr.push({
        no:     `INV-2025-${String(i).padStart(4,"0")}`,
        cust:   customers[i % customers.length],
        prod:   products[i % products.length],
        nominal:`Rp ${(Math.floor(Math.random()*8+1) * 500).toLocaleString("id-ID")}.000`,
        tgl:    `${String(d.getDate()).padStart(2,"0")}/${String(d.getMonth()+1).padStart(2,"0")}/2025`,
        status,
      });
    }
    return arr;
  })();

  /* ══════════════════════════════════════════════════════════════
     CHART HELPERS
     ══════════════════════════════════════════════════════════════ */
  const defaultFont = { family: "'DM Sans', sans-serif", size: 10 };

  function baseChartOpts(extra = {}) {
    return {
      responsive: true,
      maintainAspectRatio: false,
      plugins: { legend: { display: false }, tooltip: { ...tooltipStyle() } },
      scales: {
        x: { grid: { display: false }, ticks: { font: defaultFont, color: CLR.gray600 } },
        y: { grid: { color: CLR.gray100 }, ticks: { font: defaultFont, color: CLR.gray600 } },
      },
      ...extra,
    };
  }

  function tooltipStyle() {
    return {
      backgroundColor: "#1f2937",
      titleColor: "#fff",
      bodyColor: "#d1d5db",
      padding: 10,
      cornerRadius: 8,
      titleFont: { ...defaultFont, size: 11, weight: "600" },
      bodyFont: defaultFont,
    };
  }

  function destroyChart(id) {
    const existing = Chart.getChart(id);
    if (existing) existing.destroy();
  }

  /* ── Volume Chat chart ───────────────────────────── */
  function initVolumeChart() {
    if (state.chartsInitialized.volume) return;
    const el = document.getElementById("an-volume-chart");
    if (!el) return;
    destroyChart("an-volume-chart");

    const labels = document.getElementById("an-volume-labels");
    if (labels) {
      labels.innerHTML = "";
      const step = Math.ceil(shortLabels.length / 7);
      shortLabels.forEach((l, i) => {
        const s = document.createElement("span");
        s.textContent = i % step === 0 ? l : "";
        labels.appendChild(s);
      });
    }

    new Chart(el, {
      type: "bar",
      data: {
        labels: shortLabels,
        datasets: [
          { label: "WhatsApp", data: volumeData.wa, backgroundColor: CLR.redLight, borderColor: CLR.red, borderWidth: 1.5, borderRadius: 4 },
          { label: "Website",  data: volumeData.web, backgroundColor: CLR.blueLight, borderColor: CLR.blue, borderWidth: 1.5, borderRadius: 4 },
          { label: "Instagram",data: volumeData.ig,  backgroundColor: CLR.purpleLight, borderColor: CLR.purple, borderWidth: 1.5, borderRadius: 4 },
        ],
      },
      options: { ...baseChartOpts(), scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: defaultFont, color: CLR.gray600 } },
        y: { stacked: true, grid: { color: CLR.gray100 }, ticks: { font: defaultFont, color: CLR.gray600 } },
      }},
    });
    state.chartsInitialized.volume = true;
  }

  /* ── Donut chart ─────────────────────────────────── */
  function initDonutChart() {
    if (state.chartsInitialized.donut) return;
    const el = document.getElementById("an-channel-donut");
    if (!el) return;
    destroyChart("an-channel-donut");

    new Chart(el, {
      type: "doughnut",
      data: {
        labels: ["WhatsApp","Website","Instagram"],
        datasets: [{ data: [62, 24, 14], backgroundColor: [CLR.red, CLR.blue, CLR.purple], borderWidth: 0, hoverOffset: 6 }],
      },
      options: {
        responsive: false,
        cutout: "68%",
        plugins: { legend: { display: false }, tooltip: { ...tooltipStyle() } },
      },
    });
    state.chartsInitialized.donut = true;
  }

  /* ── Closing chart ───────────────────────────────── */
  function initClosingChart() {
    if (state.chartsInitialized.closing) return;
    const el = document.getElementById("an-closing-chart");
    if (!el) return;
    destroyChart("an-closing-chart");

    const labels = document.getElementById("an-closing-labels");
    if (labels) {
      labels.innerHTML = "";
      closingData.labels.forEach(l => {
        const s = document.createElement("span");
        s.textContent = l;
        labels.appendChild(s);
      });
    }

    new Chart(el, {
      type: "line",
      data: {
        labels: closingData.labels,
        datasets: [
          {
            label: "Closing Rate (%)",
            data: closingData.closing,
            borderColor: CLR.green,
            backgroundColor: CLR.greenLight,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
          {
            label: "Upsell (%)",
            data: closingData.upsell,
            borderColor: CLR.amber,
            backgroundColor: CLR.amberLight,
            fill: true,
            tension: 0.4,
            pointRadius: 4,
            pointHoverRadius: 6,
            borderWidth: 2,
          },
        ],
      },
      options: baseChartOpts(),
    });
    state.chartsInitialized.closing = true;
  }

  /* ── Heatmap / hourly bar chart ──────────────────── */
  function initHeatmapChart() {
    if (state.chartsInitialized.heatmap) return;
    const el = document.getElementById("an-heatmap-chart");
    if (!el) return;
    destroyChart("an-heatmap-chart");

    const labels = document.getElementById("an-heatmap-labels");
    if (labels) {
      labels.innerHTML = "";
      hourlyLabels.forEach(l => {
        const s = document.createElement("span");
        s.textContent = l + ":00";
        labels.appendChild(s);
      });
    }

    const max = Math.max(...hourlyData);
    const colors = hourlyData.map(v => v >= max * 0.75 ? CLR.red : "#fca5a5");

    new Chart(el, {
      type: "bar",
      data: {
        labels: hourlyLabels.map(h => h + ":00"),
        datasets: [{ data: hourlyData, backgroundColor: colors, borderRadius: 4 }],
      },
      options: { ...baseChartOpts({ scales: {
        x: { grid: { display: false }, ticks: { font: { ...defaultFont, size: 9 }, color: CLR.gray600 } },
        y: { grid: { color: CLR.gray100 }, ticks: { font: defaultFont, color: CLR.gray600 } },
      }}),
      },
    });
    state.chartsInitialized.heatmap = true;
  }

  /* ── Revenue chart ───────────────────────────────── */
  function initRevenueChart() {
    if (state.chartsInitialized.revenue) return;
    const el = document.getElementById("an-revenue-chart");
    if (!el) return;
    destroyChart("an-revenue-chart");

    const labels = document.getElementById("an-revenue-labels");
    if (labels) {
      labels.innerHTML = "";
      const step = Math.ceil(revenueData.labels.length / 7);
      revenueData.labels.forEach((l, i) => {
        const s = document.createElement("span");
        s.textContent = i % step === 0 ? l : "";
        labels.appendChild(s);
      });
    }

    new Chart(el, {
      type: "bar",
      data: {
        labels: revenueData.labels,
        datasets: [
          { label: "Lunas (jt)", data: revenueData.lunas, backgroundColor: CLR.greenLight, borderColor: CLR.green, borderWidth: 1.5, borderRadius: 4 },
          { label: "Pending (jt)", data: revenueData.pending, backgroundColor: "rgba(245,158,11,.15)", borderColor: CLR.amber, borderWidth: 1.5, borderRadius: 4 },
        ],
      },
      options: { ...baseChartOpts(), scales: {
        x: { stacked: true, grid: { display: false }, ticks: { font: defaultFont, color: CLR.gray600 } },
        y: { stacked: true, grid: { color: CLR.gray100 }, ticks: { font: defaultFont, color: CLR.gray600 } },
      }},
    });
    state.chartsInitialized.revenue = true;
  }

  /* ══════════════════════════════════════════════════════════════
     INVOICE TABLE
     ══════════════════════════════════════════════════════════════ */
  function renderInvoiceTable() {
    const tbody = document.getElementById("an-inv-tbody");
    if (!tbody) return;

    let filtered = invoices.filter(inv => {
      const q = state.invSearch.toLowerCase();
      const matchQ = !q || inv.no.toLowerCase().includes(q) || inv.cust.toLowerCase().includes(q);
      const matchF = !state.invFilter || inv.status === state.invFilter;
      return matchQ && matchF;
    });

    const total = filtered.length;
    const start = (state.invPage - 1) * state.invPerPage;
    const page  = filtered.slice(start, start + state.invPerPage);

    const statusLabel = { lunas: "Lunas", pending: "Menunggu Bayar", batal: "Dibatalkan" };
    const statusIcon  = { lunas: "ti-check-circle", pending: "ti-clock", batal: "ti-x-circle" };

    tbody.innerHTML = page.map(inv => `
      <tr>
        <td><strong>${inv.no}</strong></td>
        <td>${inv.cust}</td>
        <td style="max-width:160px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis">${inv.prod}</td>
        <td><strong>${inv.nominal}</strong></td>
        <td>${inv.tgl}</td>
        <td><span class="an-inv-badge ${inv.status}"><i class="ti ${statusIcon[inv.status]}"></i> ${statusLabel[inv.status]}</span></td>
        <td><button class="an-btn-view" onclick="anViewInvoice('${inv.no}')"><i class="ti ti-eye"></i> Lihat</button></td>
      </tr>
    `).join("");

    const infoEl = document.getElementById("an-inv-page-info");
    if (infoEl) {
      const from = total === 0 ? 0 : start + 1;
      const to   = Math.min(start + state.invPerPage, total);
      infoEl.textContent = `Menampilkan ${from}–${to} dari ${total.toLocaleString("id-ID")} invoice`;
    }

    const prevBtn = document.getElementById("an-inv-prev");
    const nextBtn = document.getElementById("an-inv-next");
    if (prevBtn) prevBtn.disabled = state.invPage <= 1;
    if (nextBtn) nextBtn.disabled = start + state.invPerPage >= total;
  }

  /* ── Public: lihat detail invoice ───────────────── */
  window.anViewInvoice = function (no) {
    // Integrasikan ke modal detail jika ada; untuk sekarang: toast sederhana
    const toast = document.createElement("div");
    toast.style.cssText =
      "position:fixed;bottom:24px;right:24px;background:#1f2937;color:#fff;" +
      "font-size:12px;font-weight:600;padding:10px 18px;border-radius:10px;" +
      "z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.2);display:flex;" +
      "align-items:center;gap:8px;animation:lpSlideUp .2s ease";
    toast.innerHTML = `<i class="ti ti-receipt" style="color:#fcd34d"></i> Membuka ${no}…`;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
  };

  /* ══════════════════════════════════════════════════════════════
     AGENT SORT
     ══════════════════════════════════════════════════════════════ */
  const agentData = [
    { rank:"🥇", init:"RS", color:"#fceaed", tcolor:"var(--red)", nm:"Rina Septiani",    role:"Sales Agent",   status:"s-open",   statusTxt:"Online",   chat:142, time:"6.8 mnt", closing:41, csat:4.9, esc:38 },
    { rank:"🥈", init:"DH", color:"#eff6ff", tcolor:"#1d4ed8",   nm:"Deni Hermawan",    role:"Sales Agent",   status:"s-open",   statusTxt:"Online",   chat:118, time:"7.4 mnt", closing:38, csat:4.8, esc:29 },
    { rank:"🥉", init:"SW", color:"#f0fdf4", tcolor:"#16a34a",   nm:"Siti Wahyuni",     role:"Support Agent", status:"s-open",   statusTxt:"Online",   chat:97,  time:"9.1 mnt", closing:29, csat:4.7, esc:44 },
    { rank:"4",  init:"BP", color:"#f5f3ff", tcolor:"#7c3aed",   nm:"Budi Pratama",     role:"Sales Agent",   status:"s-wait",   statusTxt:"Istirahat",chat:84,  time:"10.2 mnt",closing:24, csat:4.5, esc:21 },
    { rank:"5",  init:"NR", color:"#fff7e6", tcolor:"#92400e",   nm:"Novi Rahayu",      role:"Support Agent", status:"s-closed", statusTxt:"Offline",  chat:71,  time:"11.6 mnt",closing:18, csat:4.4, esc:17 },
  ];

  function renderAgentTable(sortKey) {
    const tbody = document.querySelector("#an-agent-table tbody");
    if (!tbody) return;

    const sorted = [...agentData].sort((a, b) => {
      if (sortKey === "csat")    return b.csat - a.csat;
      if (sortKey === "closing") return b.closing - a.closing;
      return b.chat - a.chat;
    });

    const closingBg = (v) =>
      v >= 35 ? `background:var(--green-bg);color:var(--green)` :
      v >= 25 ? `background:var(--amber-bg);color:var(--amber)` :
                `background:var(--red-light);color:var(--red)`;

    sorted.forEach((a, i) => {
      a.rank = i === 0 ? "🥇" : i === 1 ? "🥈" : i === 2 ? "🥉" : String(i + 1);
    });

    tbody.innerHTML = sorted.map(a => `
      <tr>
        <td class="an-rank">${a.rank}</td>
        <td>
          <div class="an-agent-cell">
            <div class="an-agent-av" style="background:${a.color};color:${a.tcolor}">${a.init}</div>
            <div><div class="an-agent-nm">${a.nm}</div><div class="an-agent-role">${a.role}</div></div>
          </div>
        </td>
        <td><span class="an-status-dot ${a.status}"></span>${a.statusTxt}</td>
        <td><strong>${a.chat}</strong></td>
        <td>${a.time}</td>
        <td><span class="badge" style="${closingBg(a.closing)}">${a.closing}%</span></td>
        <td><span class="an-star">★ ${a.csat.toFixed(1)}</span></td>
        <td>${a.esc}</td>
      </tr>
    `).join("");
  }

  /* ══════════════════════════════════════════════════════════════
     TAB SWITCHING
     ══════════════════════════════════════════════════════════════ */
  function switchTab(tab) {
    state.activeTab = tab;

    // Tab nav
    document.querySelectorAll("#analitik-page .an-tab").forEach(btn => {
      btn.classList.toggle("active", btn.dataset.tab === tab);
    });

    // Tab bodies
    document.querySelectorAll("#analitik-page .an-tab-body").forEach(body => {
      body.style.display = body.id === `an-tab-${tab}` ? "flex" : "none";
    });

    // Init charts lazily after paint
    requestAnimationFrame(() => {
      if (tab === "percakapan") { initVolumeChart(); initDonutChart(); }
      if (tab === "konversi")   { initClosingChart(); }
      if (tab === "agent")      { initHeatmapChart(); renderAgentTable("chat"); }
      if (tab === "transaksi")  { renderInvoiceTable(); initRevenueChart(); }
    });
  }

  /* ══════════════════════════════════════════════════════════════
     INIT
     ══════════════════════════════════════════════════════════════ */
  function init() {
    const page = document.getElementById("analitik-page");
    if (!page) return;

    /* Tab buttons */
    page.querySelectorAll(".an-tab").forEach(btn => {
      btn.addEventListener("click", () => switchTab(btn.dataset.tab));
    });

    /* Range dropdown toggle */
    const rangeBtn = document.getElementById("an-range-btn");
    const rangeDdl = document.getElementById("an-range-dropdown");
    if (rangeBtn && rangeDdl) {
      rangeBtn.addEventListener("click", (e) => {
        e.stopPropagation();
        rangeDdl.style.display = rangeDdl.style.display === "none" ? "block" : "none";
      });
      document.addEventListener("click", () => { if (rangeDdl) rangeDdl.style.display = "none"; });
      rangeDdl.querySelectorAll(".an-range-opt").forEach(opt => {
        opt.addEventListener("click", (e) => {
          e.stopPropagation();
          rangeDdl.querySelectorAll(".an-range-opt").forEach(o => o.classList.remove("active"));
          opt.classList.add("active");
          const label = opt.textContent.trim().replace("…", "");
          rangeBtn.innerHTML = `<i class="ti ti-calendar-week"></i> ${label} <i class="ti ti-chevron-down" style="font-size:11px;margin-left:2px"></i>`;
          rangeDdl.style.display = "none";
        });
      });
    }

    /* Invoice search */
    const invSearch = document.getElementById("an-inv-search");
    if (invSearch) {
      invSearch.addEventListener("input", (e) => {
        state.invSearch = e.target.value;
        state.invPage = 1;
        renderInvoiceTable();
      });
    }

    /* Invoice filter */
    const invFilter = document.getElementById("an-inv-filter");
    if (invFilter) {
      invFilter.addEventListener("change", (e) => {
        state.invFilter = e.target.value;
        state.invPage = 1;
        renderInvoiceTable();
      });
    }

    /* Invoice pagination */
    const invPrev = document.getElementById("an-inv-prev");
    const invNext = document.getElementById("an-inv-next");
    if (invPrev) invPrev.addEventListener("click", () => { state.invPage--; renderInvoiceTable(); });
    if (invNext) invNext.addEventListener("click", () => { state.invPage++; renderInvoiceTable(); });

    /* Agent sort buttons */
    page.querySelectorAll(".an-sort-btn").forEach(btn => {
      btn.addEventListener("click", () => {
        page.querySelectorAll(".an-sort-btn").forEach(b => b.classList.remove("active"));
        btn.classList.add("active");
        renderAgentTable(btn.dataset.sort);
      });
    });

    /* Ekspor PDF — placeholder */
    const eksporBtn = page.querySelector(".an-header-actions .tb-btn:nth-child(2)");
    if (eksporBtn) {
      eksporBtn.addEventListener("click", () => {
        const t = document.createElement("div");
        t.style.cssText =
          "position:fixed;bottom:24px;right:24px;background:#1f2937;color:#fff;" +
          "font-size:12px;font-weight:600;padding:10px 18px;border-radius:10px;" +
          "z-index:9999;box-shadow:0 8px 24px rgba(0,0,0,.2);display:flex;" +
          "align-items:center;gap:8px";
        t.innerHTML = `<i class="ti ti-file-export" style="color:#fcd34d"></i> Menyiapkan laporan PDF…`;
        document.body.appendChild(t);
        setTimeout(() => t.remove(), 2800);
      });
    }

    /* Tampilkan tab default */
    switchTab("percakapan");
  }

  /* Jalankan setelah DOM siap */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

  /* Expose untuk dipanggil ulang jika halaman di-toggle show/hide */
  window.anInitAnalitik = init;
  window.anSwitchTab = switchTab;

})();