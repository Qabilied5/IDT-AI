/* ============================================
   PERCAKAPAN PAGE — SCRIPT
   ============================================ */

// ── DUMMY DATA ─────────────────────────────────────────────────────
const PC_CONTACTS = {
  1: {
    id: 1,
    name: 'Budi Wicaksono',
    initials: 'BW',
    company: 'PT. Maju Bersama Tbk',
    phone: '+62 812-3456-7890',
    email: 'budi.w@majubersama.co.id',
    city: 'Jakarta Selatan',
    channel: 'wa',
    channelLabel: 'WhatsApp',
    channelIcon: 'ti-brand-whatsapp',
    channelColor: '#16a34a',
    channelTagClass: 'wa-tag',
    avClass: 'wa-av',
    status: 'online',
    handledBy: 'ai',
    agentLabel: 'Agent Sales',
    activeSince: '10:24',
    msgCount: 5,
    badges: ['Lead', 'Warm'],
    badgeClasses: ['badge-lead', 'badge-warm'],
    stats: { conv: 7, order: 3, total: 'Rp 4,8jt' },
    history: [
      { dot: 'green', title: 'Tanya spare part mesin packing', meta: 'Hari ini · 10:24 · AI' },
      { dot: 'gray',  title: 'Order 2 box sample → Selesai',  meta: '28 Mei 2025 · AI' },
      { dot: 'gray',  title: 'Konfirmasi pengiriman',          meta: '20 Mei 2025 · Human' },
    ],
    note: 'Customer tertarik dengan bundling spare part + jasa servis. Follow-up H+3.',
    aiScore: 87,
    aiScoreLabel: 'High Intent',
    aiScoreTags: [{ cls: 'tag-hot', text: '🔥 High Intent' }, { cls: 'tag-buy', text: 'Siap Beli' }],
    aiSummary: 'Customer menanyakan spare part mesin packing dan berminat order <strong>50 pcs</strong>. Dimulai dengan pembelian sample <strong>2 box (Rp 1,24 jt)</strong> via COD. AI berhasil mengarahkan ke closing dalam <strong>5 menit</strong>.',
    aiTopics: ['Spare part mesin packing', 'Pengiriman COD', 'Harga & invoice', 'Qty 50 pcs'],
    aiTopicIcons: ['ti-package', 'ti-truck', 'ti-currency-dollar', 'ti-box'],
    aiRecs: [
      { dot: 'red',   text: 'Follow-up dalam <strong>24 jam</strong> untuk konfirmasi order bulk 50 pcs.' },
      { dot: 'amber', text: 'Tawarkan diskon <strong>5%</strong> untuk order > 30 pcs sebagai upsell.' },
      { dot: 'green', text: 'Kirim katalog produk serupa via WhatsApp setelah invoice dikirim.' },
    ],
    sentiment: { pos: 72, neu: 24, neg: 4 },
  },
  2: {
    id: 2,
    name: 'Rina Sari',
    initials: 'RS',
    company: 'CV. Sukses Abadi',
    phone: '+62 856-1122-3344',
    email: 'rinasari@suksesabadi.id',
    city: 'Bandung',
    channel: 'ig',
    channelLabel: 'Instagram',
    channelIcon: 'ti-brand-instagram',
    channelColor: '#C2185B',
    channelTagClass: 'ig-tag',
    avClass: 'ig-av',
    status: 'online',
    handledBy: 'ai',
    agentLabel: 'Agent Sales',
    activeSince: '10:15',
    msgCount: 3,
    badges: ['Prospek'],
    badgeClasses: ['badge-lead'],
    stats: { conv: 2, order: 0, total: '—' },
    history: [
      { dot: 'green', title: 'Tanya harga 50 pcs via Instagram', meta: 'Hari ini · 10:15 · AI' },
      { dot: 'gray',  title: 'Kunjungan profil produk',          meta: '1 Jun 2025 · —' },
    ],
    note: 'Menanyakan harga grosir. Belum memutuskan, perlu follow-up tawaran spesial.',
    aiScore: 62,
    aiScoreLabel: 'Medium Intent',
    aiScoreTags: [{ cls: 'tag-buy', text: '🟡 Medium Intent' }],
    aiSummary: 'Customer menanyakan harga satuan dan grosir untuk <strong>50 pcs</strong>. Belum ada keputusan pembelian. AI sedang menunggu respons customer setelah diberikan penawaran.',
    aiTopics: ['Harga grosir', 'Qty 50 pcs', 'Perbandingan produk'],
    aiTopicIcons: ['ti-currency-dollar', 'ti-box', 'ti-file-search'],
    aiRecs: [
      { dot: 'red',   text: 'Kirim penawaran harga grosir via DM Instagram.' },
      { dot: 'amber', text: 'Follow-up dalam <strong>48 jam</strong> jika tidak ada respons.' },
    ],
    sentiment: { pos: 55, neu: 40, neg: 5 },
  },
  3: {
    id: 3,
    name: 'Andi Nugroho',
    initials: 'AN',
    company: 'Toko Andi Jaya',
    phone: '+62 878-9900-1122',
    email: 'andi.n@andijaya.com',
    city: 'Surabaya',
    channel: 'wa',
    channelLabel: 'WhatsApp',
    channelIcon: 'ti-brand-whatsapp',
    channelColor: '#16a34a',
    channelTagClass: 'wa-tag',
    avClass: '',
    avStyle: 'background:#eef2ff;color:#4b5eaa',
    status: 'online',
    handledBy: 'human',
    agentLabel: 'Ahmad R.',
    activeSince: '09:58',
    msgCount: 7,
    badges: ['Komplain'],
    badgeClasses: ['badge-lead'],
    stats: { conv: 5, order: 4, total: 'Rp 8,2jt' },
    history: [
      { dot: 'red',   title: 'Komplain pengiriman terlambat',   meta: 'Hari ini · 09:58 · Human' },
      { dot: 'gray',  title: 'Order mesin packing → Selesai',   meta: '29 Mei 2025 · AI' },
      { dot: 'gray',  title: 'Tanya stok spare part',           meta: '15 Mei 2025 · AI' },
    ],
    note: 'Customer VIP — pengiriman terlambat 2 hari. Perlu kompensasi voucher Rp 100.000.',
    aiScore: 45,
    aiScoreLabel: 'At Risk',
    aiScoreTags: [{ cls: '', text: '⚠ At Risk', style: 'background:#fff7e6;color:#996600' }],
    aiSummary: 'Customer menyampaikan komplain terkait keterlambatan pengiriman <strong>2 hari</strong>. Percakapan sudah dialihkan ke agen manusia. Customer adalah pembeli berulang dengan total 4 order.',
    aiTopics: ['Komplain pengiriman', 'Kompensasi', 'Status order'],
    aiTopicIcons: ['ti-truck', 'ti-gift', 'ti-list-check'],
    aiRecs: [
      { dot: 'red',   text: 'Berikan voucher kompensasi <strong>Rp 100.000</strong> segera.' },
      { dot: 'amber', text: 'Update status pengiriman secara real-time ke customer.' },
      { dot: 'green', text: 'Jadwalkan follow-up kepuasan customer 3 hari setelah selesai.' },
    ],
    sentiment: { pos: 20, neu: 35, neg: 45 },
  },
  4: {
    id: 4,
    name: 'Dewi Hartanti',
    initials: 'DH',
    company: 'Belanja Pribadi',
    phone: '+62 821-5566-7788',
    email: 'dewi.hart@gmail.com',
    city: 'Medan',
    channel: 'shopee',
    channelLabel: 'Shopee',
    channelIcon: 'ti-shopping-cart',
    channelColor: '#EE4D2D',
    channelTagClass: 'shopee-tag',
    avClass: 'shopee-av',
    status: 'online',
    handledBy: 'ai',
    agentLabel: 'Agent Sales',
    activeSince: '09:44',
    msgCount: 4,
    badges: ['Lead'],
    badgeClasses: ['badge-lead'],
    stats: { conv: 1, order: 0, total: '—' },
    history: [
      { dot: 'green', title: 'Tanya stok produk via Shopee', meta: 'Hari ini · 09:44 · AI' },
    ],
    note: 'Customer baru. Tanya stok untuk pembelian 10 pcs pertama.',
    aiScore: 70,
    aiScoreLabel: 'Warm Lead',
    aiScoreTags: [{ cls: 'tag-buy', text: '🔵 Warm Lead' }],
    aiSummary: 'Customer baru menanyakan ketersediaan stok produk untuk <strong>10 pcs</strong>. Berasal dari Shopee. AI sedang menginformasikan stok dan opsi pembelian.',
    aiTopics: ['Cek stok', 'Qty 10 pcs', 'Shopee order'],
    aiTopicIcons: ['ti-package', 'ti-box', 'ti-shopping-cart'],
    aiRecs: [
      { dot: 'green', text: 'Konfirmasi stok dan kirim link pembelian Shopee.' },
      { dot: 'amber', text: 'Tawarkan free ongkir untuk order pertama.' },
    ],
    sentiment: { pos: 80, neu: 18, neg: 2 },
  },
  5: {
    id: 5,
    name: 'M. Fauzi',
    initials: 'MF',
    company: 'UD. Fauzi Mandiri',
    phone: '+62 813-2233-4455',
    email: 'mfauzi@fauzimandiri.co.id',
    city: 'Surabaya',
    channel: 'ig',
    channelLabel: 'Instagram',
    channelIcon: 'ti-brand-instagram',
    channelColor: '#C2185B',
    channelTagClass: 'ig-tag',
    avClass: 'ig-av',
    status: 'away',
    handledBy: 'pending',
    agentLabel: 'Menunggu Respons',
    activeSince: '09:30',
    msgCount: 2,
    badges: ['Pending'],
    badgeClasses: [],
    stats: { conv: 3, order: 1, total: 'Rp 1,5jt' },
    history: [
      { dot: 'amber', title: 'Tanya pengiriman ke Surabaya', meta: 'Hari ini · 09:30 · AI' },
      { dot: 'gray',  title: 'Order 1x — Selesai',          meta: '10 Apr 2025 · AI' },
    ],
    note: 'Customer menunggu konfirmasi ongkos kirim ke Surabaya. Belum direspons.',
    aiScore: 55,
    aiScoreLabel: 'Pending',
    aiScoreTags: [{ cls: '', text: '⏳ Menunggu', style: 'background:#fff7e6;color:#996600' }],
    aiSummary: 'Customer bertanya tentang opsi pengiriman ke Surabaya dan estimasi ongkos kirim. AI menunggu konfirmasi dari tim logistik sebelum memberikan jawaban.',
    aiTopics: ['Pengiriman Surabaya', 'Ongkos kirim', 'Estimasi waktu'],
    aiTopicIcons: ['ti-truck', 'ti-currency-dollar', 'ti-clock'],
    aiRecs: [
      { dot: 'red',   text: 'Segera konfirmasi ongkir ke Surabaya — sudah menunggu >30 menit.' },
      { dot: 'amber', text: 'Tawarkan opsi ekspedisi dengan harga terbaik.' },
    ],
    sentiment: { pos: 60, neu: 35, neg: 5 },
  },
  6: {
    id: 6,
    name: 'Siti Komala',
    initials: 'SK',
    company: 'Toko Komala',
    phone: '+62 852-7788-9900',
    email: 'siti.k@tokokomala.id',
    city: 'Yogyakarta',
    channel: 'wa',
    channelLabel: 'WhatsApp',
    channelIcon: 'ti-brand-whatsapp',
    channelColor: '#16a34a',
    channelTagClass: 'wa-tag',
    avClass: 'wa-av',
    status: 'offline',
    handledBy: 'ai',
    agentLabel: 'Agent Sales',
    activeSince: '09:10',
    msgCount: 6,
    badges: ['Repeat Buyer'],
    badgeClasses: ['badge-lead'],
    stats: { conv: 9, order: 7, total: 'Rp 14,5jt' },
    history: [
      { dot: 'green', title: 'Konfirmasi order selesai',  meta: 'Hari ini · 09:10 · AI' },
      { dot: 'gray',  title: 'Order 3 box — Selesai',    meta: '25 Mei 2025 · AI' },
      { dot: 'gray',  title: 'Order 2 box — Selesai',    meta: '10 Mei 2025 · AI' },
    ],
    note: 'Customer loyal. Berpotensi untuk program reseller. Sudah 7 kali order.',
    aiScore: 95,
    aiScoreLabel: 'Loyal Customer',
    aiScoreTags: [{ cls: 'tag-hot', text: '⭐ Loyal' }, { cls: 'tag-buy', text: 'Repeat Buyer' }],
    aiSummary: 'Customer loyal dengan <strong>7 order</strong> dan total belanja Rp 14,5 jt. Percakapan terakhir berisi konfirmasi penyelesaian order dan ekspresi kepuasan.',
    aiTopics: ['Konfirmasi selesai', 'Kepuasan customer', 'Program reseller'],
    aiTopicIcons: ['ti-check', 'ti-heart', 'ti-users'],
    aiRecs: [
      { dot: 'green', text: 'Tawarkan program reseller dengan benefit eksklusif.' },
      { dot: 'green', text: 'Kirim ucapan terima kasih + voucher loyalitas.' },
    ],
    sentiment: { pos: 90, neu: 9, neg: 1 },
  },
};

// ── ACTIVE CONTACT ────────────────────────────────────────────────
let _activeContactId = 1;

// ── SELECT CONVERSATION ───────────────────────────────────────────
function selectConv(el, id) {
  _activeContactId = id;

  // Update active state di list
  document.querySelectorAll('.pc-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');

  // Hapus badge unread
  const unread = el.querySelector('.pc-item-unread');
  if (unread) unread.remove();

  const c = PC_CONTACTS[id];
  if (!c) return;

  _updatePcDetail(c);
  _updateColRight(c);
}

// ── UPDATE PANEL TENGAH (pc-detail) ───────────────────────────────
function _updatePcDetail(c) {
  // -- Header avatar + nama + channel
  const av = document.querySelector('.pc-detail-av');
  if (av) {
    av.textContent = c.initials;
    av.className = 'pc-detail-av ' + (c.avClass || '');
    if (c.avStyle) av.style.cssText = c.avStyle;
    else av.style.cssText = '';
  }
  const nameEl = document.querySelector('.pc-detail-name');
  if (nameEl) nameEl.textContent = c.name;

  const metaEl = document.querySelector('.pc-detail-meta');
  if (metaEl) metaEl.innerHTML = `
    <span class="pc-tag ${c.channelTagClass}" style="font-size:10px">
      <i class="ti ${c.channelIcon}"></i> ${c.channelLabel}
    </span>
    <span style="color:var(--gray-400);font-size:10px">· ${c.phone}</span>
  `;

  // -- Status bar
  const statusBar = document.getElementById('pc-status-bar');
  if (statusBar) {
    const handledMap = {
      ai:      `<span class="pc-tag ai-tag"><i class="ti ti-robot"></i> Ditangani AI — ${c.agentLabel}</span>`,
      human:   `<span class="pc-tag human-tag"><i class="ti ti-user"></i> Ditangani: ${c.agentLabel}</span>`,
      pending: `<span class="pc-tag pending-tag"><i class="ti ti-clock"></i> ${c.agentLabel}</span>`,
    };
    const statusInfo = statusBar.querySelector('.pc-status-info');
    if (statusInfo) statusInfo.innerHTML = `
      ${handledMap[c.handledBy] || handledMap.ai}
      <span style="font-size:10px;color:var(--gray-400)">Aktif sejak ${c.activeSince} · ${c.msgCount} pesan</span>
    `;
  }

  // -- Chat body: hanya 1 pesan sapaan
  const body = document.getElementById('pc-chat-body');
  if (body) {
    const now = new Date();
    const timeStr = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
    body.innerHTML = `
      <div class="pc-date-divider"><span>Hari ini</span></div>
      <div class="msg user">
        <div class="msg-bubble">Halo</div>
        <div class="msg-meta">${timeStr}</div>
      </div>
      <div class="msg bot">
        <div class="msg-bubble">Ya Saya ${c.name}! Saya ingin bertanya, Apakah produk masih ada?</div>
        <div class="msg-meta"><span class="ai-label">AI</span> ${timeStr}</div>
      </div>
    `;
    body.scrollTop = body.scrollHeight;
  }
}

// ── UPDATE COL-RIGHT ──────────────────────────────────────────────
function _updateColRight(c) {
  // -- Header (rp-chat-header)
  const rpAv = document.querySelector('.rp-av');
  if (rpAv) {
    rpAv.textContent = c.initials;
    rpAv.style.background = '';
    rpAv.style.color = '';
    if (c.avStyle) {
      const parsed = c.avStyle.split(';').reduce((acc, s) => {
        const [k, v] = s.split(':').map(x => x.trim());
        if (k && v) acc[k.replace(/-([a-z])/g, (_, l) => l.toUpperCase())] = v;
        return acc;
      }, {});
      if (parsed.background) rpAv.style.background = parsed.background;
      if (parsed.color) rpAv.style.color = parsed.color;
    }
  }
  const rpNm = document.querySelector('.rp-nm');
  if (rpNm) rpNm.textContent = c.name;
  const rpStatus = document.querySelector('.rp-status');
  if (rpStatus) {
    const statusMap = { online: 'Online', away: 'Away', offline: 'Offline' };
    const colorMap  = { online: 'var(--green)', away: '#d97706', offline: 'var(--gray-400)' };
    rpStatus.textContent = statusMap[c.status] || 'Online';
    rpStatus.style.color = colorMap[c.status] || 'var(--green)';
  }

  // -- Panel Live Chat: hanya update badge agent
  const livePanel = document.getElementById('rp-panel-live-chat');
  if (livePanel) {
    const badgeWrap = livePanel.querySelector('div[style*="padding:6px"]');
    if (badgeWrap) {
      const handledMap = {
        ai:      `<div style="background:var(--red-light);color:var(--red);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:4px"><i class="ti ti-robot" style="font-size:11px"></i> Ditangani AI — ${c.agentLabel}</div>`,
        human:   `<div style="background:#eef2ff;color:#4b5eaa;font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:4px"><i class="ti ti-user" style="font-size:11px"></i> Ditangani: ${c.agentLabel}</div>`,
        pending: `<div style="background:var(--amber-bg);color:var(--amber);font-size:10px;font-weight:600;padding:2px 8px;border-radius:4px;display:flex;align-items:center;gap:4px"><i class="ti ti-clock" style="font-size:11px"></i> ${c.agentLabel}</div>`,
      };
      badgeWrap.innerHTML = handledMap[c.handledBy] || handledMap.ai;
    }
    // Update chat body di right panel juga
    const rpChatBody = livePanel.querySelector('.chat-body');
    if (rpChatBody) {
      const now = new Date();
      const t = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
      rpChatBody.innerHTML = `
        <div class="msg user">
          <div class="msg-bubble">Halo</div>
          <div class="msg-meta">${t}</div>
        </div>
        <div class="msg bot">
          <div class="msg-bubble">Ya Saya ${c.name}! saya ingin bertanya, Apakah produk masih ada?</div>
          <div class="msg-meta"><span class="ai-label">AI</span> ${t}</div>
        </div>
      `;
      rpChatBody.scrollTop = rpChatBody.scrollHeight;
    }
  }

  // -- Panel Detail Kontak
  const detailPanel = document.getElementById('rp-panel-detail-kontak');
  if (detailPanel) {
    // Hero
    const hero = detailPanel.querySelector('.rp-dk-hero');
    if (hero) {
      const badgesHTML = c.badges.map((b, i) =>
        `<span class="rp-dk-badge ${c.badgeClasses[i] || ''}">${b}</span>`
      ).join('');
      hero.innerHTML = `
        <div class="rp-dk-av" ${c.avStyle ? `style="${c.avStyle}"` : ''}>${c.initials}</div>
        <div class="rp-dk-name">${c.name}</div>
        <div class="rp-dk-company">${c.company}</div>
        <div class="rp-dk-badges">${badgesHTML}</div>
      `;
    }

    // Info kontak rows
    const rows = detailPanel.querySelector('.rp-dk-rows');
    if (rows) rows.innerHTML = `
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ${c.channelIcon}" style="color:${c.channelColor}"></i></span>
        <div><div class="rp-dk-lbl">${c.channelLabel}</div><div class="rp-dk-val">${c.phone}</div></div>
        <button class="rp-dk-copy" onclick="rpCopy('${c.phone}', this)"><i class="ti ti-copy"></i></button>
      </div>
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ti-mail" style="color:var(--red)"></i></span>
        <div><div class="rp-dk-lbl">Email</div><div class="rp-dk-val">${c.email}</div></div>
        <button class="rp-dk-copy" onclick="rpCopy('${c.email}', this)"><i class="ti ti-copy"></i></button>
      </div>
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ti-building" style="color:var(--gray-400)"></i></span>
        <div><div class="rp-dk-lbl">Perusahaan</div><div class="rp-dk-val">${c.company}</div></div>
      </div>
      <div class="rp-dk-row">
        <span class="rp-dk-icon"><i class="ti ti-map-pin" style="color:var(--gray-400)"></i></span>
        <div><div class="rp-dk-lbl">Kota</div><div class="rp-dk-val">${c.city}</div></div>
      </div>
    `;

    // Stats
    const statsGrid = detailPanel.querySelector('.rp-dk-stats-grid');
    if (statsGrid) statsGrid.innerHTML = `
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val">${c.stats.conv}</div>
        <div class="rp-dk-stat-lbl">Percakapan</div>
      </div>
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val" style="color:var(--green)">${c.stats.order}</div>
        <div class="rp-dk-stat-lbl">Order</div>
      </div>
      <div class="rp-dk-stat">
        <div class="rp-dk-stat-val" style="color:var(--red)">${c.stats.total}</div>
        <div class="rp-dk-stat-lbl">Total Belanja</div>
      </div>
    `;

    // History
    const hist = detailPanel.querySelector('.rp-dk-history');
    if (hist) hist.innerHTML = c.history.map(h => {
      const dotColor = h.dot === 'green' ? 'var(--green)' : h.dot === 'red' ? 'var(--red)' : h.dot === 'amber' ? '#d97706' : 'var(--gray-400)';
      return `
        <div class="rp-dk-hist-item">
          <div class="rp-dk-hist-dot" style="background:${dotColor}"></div>
          <div>
            <div class="rp-dk-hist-title">${h.title}</div>
            <div class="rp-dk-hist-meta">${h.meta}</div>
          </div>
        </div>
      `;
    }).join('');

    // Note
    const noteSpan = detailPanel.querySelector('.rp-dk-note span');
    if (noteSpan) noteSpan.textContent = c.note;
  }

  // -- Panel Ringkasan AI
  const aiPanel = document.getElementById('rp-panel-ringkasan-ai');
  if (aiPanel) {
    // Score card
    const scoreNum = aiPanel.querySelector('.rp-ai-score-num');
    const scoreLbl = aiPanel.querySelector('.rp-ai-score-lbl');
    const scoreBar = aiPanel.querySelector('.rp-ai-score-bar');
    const scoreTags = aiPanel.querySelector('.rp-ai-score-tags');
    if (scoreNum) scoreNum.textContent = c.aiScore;
    if (scoreLbl) scoreLbl.textContent = 'Lead Score';
    if (scoreBar) scoreBar.style.width = c.aiScore + '%';
    if (scoreTags) scoreTags.innerHTML = c.aiScoreTags.map(t =>
      `<span class="rp-ai-tag ${t.cls}" ${t.style ? `style="${t.style}"` : ''}>${t.text}</span>`
    ).join('');

    // Summary
    const summary = aiPanel.querySelector('.rp-ai-summary-text');
    if (summary) summary.innerHTML = c.aiSummary;

    // Topics
    const topics = aiPanel.querySelector('.rp-ai-topics');
    if (topics) topics.innerHTML = c.aiTopics.map((t, i) =>
      `<span class="rp-ai-topic"><i class="ti ${c.aiTopicIcons[i] || 'ti-tag'}"></i> ${t}</span>`
    ).join('');

    // Recommendations
    const recs = aiPanel.querySelector('.rp-ai-recs');
    if (recs) recs.innerHTML = c.aiRecs.map(r => {
      const dotColor = r.dot === 'red' ? 'var(--red)' : r.dot === 'amber' ? '#d97706' : 'var(--green)';
      return `
        <div class="rp-ai-rec">
          <div class="rp-ai-rec-dot" style="background:${dotColor}"></div>
          <span>${r.text}</span>
        </div>
      `;
    }).join('');

    // Sentiment
    const sentRows = aiPanel.querySelectorAll('.rp-ai-sent-item');
    const sentData = [
      { label: 'Positif', val: c.sentiment.pos, color: 'var(--green)' },
      { label: 'Netral',  val: c.sentiment.neu, color: 'var(--gray-400)' },
      { label: 'Negatif', val: c.sentiment.neg, color: 'var(--red)' },
    ];
    sentRows.forEach((row, i) => {
      const bar = row.querySelector('.rp-ai-sent-bar');
      const pct = row.querySelector('.rp-ai-sent-pct');
      if (bar) { bar.style.width = sentData[i].val + '%'; bar.style.background = sentData[i].color; }
      if (pct) pct.textContent = sentData[i].val + '%';
    });
  }
}

// ── FILTER PERCAKAPAN ─────────────────────────────────────────────
document.querySelectorAll('.pc-filter-btn').forEach(btn => {
  btn.addEventListener('click', function () {
    document.querySelectorAll('.pc-filter-btn').forEach(b => b.classList.remove('active'));
    this.classList.add('active');
    const filter = this.dataset.filter;
    document.querySelectorAll('.pc-item').forEach(item => {
      item.style.display =
        filter === 'all' || item.dataset.filter === filter ? 'flex' : 'none';
    });
  });
});

// ── SEARCH ────────────────────────────────────────────────────────
document.getElementById('pc-search-input')?.addEventListener('input', function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.pc-item').forEach(item => {
    const name    = item.querySelector('.pc-item-name')?.textContent.toLowerCase() || '';
    const preview = item.querySelector('.pc-item-preview')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(q) || preview.includes(q) ? 'flex' : 'none';
  });
});

// ── CHANNEL FILTER ────────────────────────────────────────────────
document.getElementById('pc-channel-select')?.addEventListener('change', function () {
  const val = this.value;
  document.querySelectorAll('.pc-item').forEach(item => {
    item.style.display =
      val === 'all' || item.dataset.channel === val ? 'flex' : 'none';
  });
});

// ── HUMAN TAKEOVER ────────────────────────────────────────────────
let isTakenOver = false;
function toggleTakeover() {
  isTakenOver = !isTakenOver;
  const btn       = document.getElementById('btn-takeover');
  const indicator = document.getElementById('takeover-indicator');
  const label     = document.getElementById('pc-input-label');
  if (isTakenOver) {
    btn.innerHTML = '<i class="ti ti-robot"></i> Kembalikan ke AI';
    btn.classList.add('taken');
    indicator.style.display = 'flex';
    label.textContent = '✎ Mode manual — Anda yang membalas';
    label.className = 'pc-input-label manual-mode';
    showToast('✓ Percakapan dialihkan ke Anda');
  } else {
    btn.innerHTML = '<i class="ti ti-transfer"></i> Ambil Alih';
    btn.classList.remove('taken');
    indicator.style.display = 'none';
    label.innerHTML = '<i class="ti ti-robot"></i> AI aktif — ketik untuk override manual';
    label.className = 'pc-input-label ai-mode';
    showToast('✓ Percakapan dikembalikan ke AI');
  }
}

// ── TOGGLE AI ─────────────────────────────────────────────────────
let aiActive = true;
function toggleAI() {
  aiActive = !aiActive;
  const text  = document.getElementById('ai-toggle-text');
  const label = document.getElementById('pc-input-label');
  text.textContent = aiActive ? 'Nonaktifkan AI' : 'Aktifkan AI';
  if (aiActive) {
    label.innerHTML = '<i class="ti ti-robot"></i> AI aktif — ketik untuk override manual';
    label.className = 'pc-input-label ai-mode';
    showToast('✓ AI diaktifkan kembali');
  } else {
    label.textContent = '✎ AI nonaktif — mode manual';
    label.className = 'pc-input-label manual-mode';
    showToast('⚠ AI dinonaktifkan');
  }
}

// ── BUAT TIKET ────────────────────────────────────────────────────
function createTicket() { document.getElementById('modal-ticket').style.display = 'flex'; }
function submitTicket() {
  closeModal('modal-ticket');
  showToast('✓ Tiket berhasil dibuat & diteruskan ke agen support');
}

// ── KIRIM INVOICE ─────────────────────────────────────────────────
function sendInvoice() { document.getElementById('modal-invoice').style.display = 'flex'; }
function submitInvoice() {
  closeModal('modal-invoice');
  const c    = PC_CONTACTS[_activeContactId];
  const body = document.getElementById('pc-chat-body');
  const msg  = document.createElement('div');
  msg.className = 'msg bot';
  msg.innerHTML = `
    <div class="msg-bubble" style="background:var(--green-bg);color:var(--green);border:1px solid #b2dfcb">
      <div style="font-weight:600;margin-bottom:4px"><i class="ti ti-receipt" style="font-size:12px"></i> Invoice Terkirim</div>
      <div style="font-size:11px">INV-20250603-084 · Rp 1.240.000<br>Dikirim ke ${c ? c.name : 'Customer'} via ${c ? c.channelLabel : 'WhatsApp'}</div>
    </div>
    <div class="msg-meta"><span class="ai-label">Sistem</span> Baru saja</div>
  `;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  showToast('✓ Invoice berhasil dikirim');
}

// ── FOLLOW-UP ─────────────────────────────────────────────────────
function sendFollowup() { showToast('✓ Pengingat follow-up dijadwalkan dalam 2 jam'); }

// ── CEK STOK ─────────────────────────────────────────────────────
function checkStock() { showToast('↗ Mengecek stok...'); }

// ── KIRIM PESAN MANUAL ───────────────────────────────────────────
function sendMsg() {
  const input = document.getElementById('pc-msg-input');
  const text  = input.value.trim();
  if (!text) return;
  const body = document.getElementById('pc-chat-body');
  const msg  = document.createElement('div');
  msg.className = 'msg user';
  const now  = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  msg.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-meta">${time}</div>`;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  input.value = '';
}
document.getElementById('pc-msg-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMsg();
});

// ── CLOSE MODAL ──────────────────────────────────────────────────
function closeModal(id) { document.getElementById(id).style.display = 'none'; }

// ── TOAST ─────────────────────────────────────────────────────────
function showToast(msg) {
  const toast = document.getElementById('pc-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}