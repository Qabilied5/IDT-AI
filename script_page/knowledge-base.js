/* ===================================
   knowledge-base.js — Indotrading AI
   Knowledge Base Page Scripts

   Terhubung ke backend nyata (server.js /api/knowledge-base/*).
   Semua dokumen berstatus "Aktif" di sini otomatis disisipkan ke prompt
   Ollama sebagai SATU-SATUNYA sumber jawaban AI — lihat kbActiveContext()
   & tgBuildConversationPrompt() di server.js.
   =================================== */

(function () {
  'use strict';

  // ── BASE URL BACKEND — sama dengan telegram-token.js / waba-token.js ──
  const KB_API_BASE = window.PC_API_BASE || 'http://localhost:3001';

  // ── STATE ──────────────────────────────────────────────────────
  let currentCat    = 'semua';
  let currentStatus = 'semua';
  let currentView   = 'grid';
  let currentSrc    = 'file';
  let trainTimer    = null;
  let kbDocs        = [];   // cache dari GET /api/knowledge-base
  let editingId     = null; // id dokumen yang sedang diedit (null = mode tambah baru)

  const CAT_LABELS = {
    produk:      { label: 'Produk & Layanan', icon: 'ti-box' },
    harga:       { label: 'Harga & Promo',    icon: 'ti-tag' },
    faq:         { label: 'FAQ Pelanggan',    icon: 'ti-message-question' },
    sop:         { label: 'SOP & Prosedur',   icon: 'ti-checklist' },
    pengiriman:  { label: 'Pengiriman',       icon: 'ti-truck-delivery' },
    umum:        { label: 'Umum',             icon: 'ti-file' },
  };
  const EXT_ICON = {
    pdf: 'ti-file-type-pdf', docx: 'ti-file-description', xlsx: 'ti-file-spreadsheet',
    xls: 'ti-file-spreadsheet', txt: 'ti-file-text', csv: 'ti-file-type-csv',
  };

  // ── INIT ───────────────────────────────────────────────────────
  function init() {
    bindSearch();
    kbFetchDocs();
  }

  // ── FETCH DARI BACKEND ────────────────────────────────────────
  async function kbFetchDocs() {
    const grid = document.getElementById('kb-grid');
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal memuat Knowledge Base');
      kbDocs = data.docs || [];
      renderGrid();
      renderSidebarCounts();
      renderStats();
    } catch (e) {
      if (grid) {
        grid.innerHTML = '';
      }
      kbToast('<i class="ti ti-alert-triangle"></i> Backend tidak bisa dihubungi (pastikan npm start sudah jalan)', 'error');
    }
  }

  // ── RENDER GRID ────────────────────────────────────────────────
  function fmtSize(bytes) {
    if (!bytes) return '0 KB';
    if (bytes > 1048576) return (bytes / 1048576).toFixed(1) + ' MB';
    return Math.max(1, Math.round(bytes / 1024)) + ' KB';
  }
  function fmtDate(ts) {
    if (!ts) return '-';
    const diffMs = Date.now() - ts;
    const mins = Math.floor(diffMs / 60000);
    if (mins < 1) return 'Baru saja';
    if (mins < 60) return `${mins} menit lalu`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs} jam lalu`;
    const days = Math.floor(hrs / 24);
    if (days < 30) return `${days} hari lalu`;
    return new Date(ts).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function srcIcon(doc) {
    if (doc.sourceType === 'url') return 'ti-world';
    if (doc.sourceType === 'teks') return 'ti-notes';
    return EXT_ICON[doc.fileExt] || 'ti-file';
  }
  // "Cakupan AI" di sini = proporsi kesiapan konten (proxy dari panjang teks
  // yang berhasil diekstrak), BUKAN skor akurasi model sungguhan.
  function coveragePct(doc) {
    if (doc.extractFailed || !doc.contentLength) return 0;
    return Math.max(15, Math.min(98, Math.round(30 + doc.contentLength / 40)));
  }

  function cardHtml(doc) {
    const inactive = doc.status !== 'aktif';
    const cat = CAT_LABELS[doc.category] || CAT_LABELS.umum;
    const cov = coveragePct(doc);
    const covColor = doc.extractFailed ? 'var(--gray-400)' : (cov < 40 ? 'var(--amber)' : '');
    const covFillCls = doc.extractFailed ? 'kb-cov-gray' : (cov < 40 ? 'kb-cov-amber' : '');
    const badge = doc.status === 'aktif'
      ? '<span class="kb-badge kb-badge-aktif"><span class="kb-dot kb-dot-green"></span>Aktif</span>' +
        (doc.extractFailed ? '' : '<span class="kb-badge kb-badge-ai"><i class="ti ti-robot"></i>Terlatih</span>')
      : doc.status === 'draft'
        ? '<span class="kb-badge kb-badge-nonaktif"><span class="kb-dot kb-dot-amber"></span>Draft</span>'
        : '<span class="kb-badge kb-badge-nonaktif"><span class="kb-dot kb-dot-gray"></span>Nonaktif</span>';

    return `
      <div class="kb-card" data-cat="${doc.category}" data-status="${doc.status}">
        <div class="kb-card-top">
          <div class="kb-file-icon kb-icon-pdf" ${inactive ? 'style="opacity:.45"' : ''}><i class="ti ${srcIcon(doc)}"></i></div>
          <div class="kb-card-badges">${badge}</div>
        </div>
        <div class="kb-card-name ${inactive ? 'kb-card-muted' : ''}">${escapeHtml(doc.title)}</div>
        <div class="kb-card-meta" ${inactive ? 'style="opacity:.5"' : ''}>
          <span><i class="ti ${cat.icon}"></i> ${cat.label}</span>
          <span><i class="ti ti-file"></i> ${doc.sourceType === 'url' ? 'URL' : fmtSize(doc.sizeBytes)}</span>
        </div>
        <div class="kb-card-cov ${doc.extractFailed ? 'kb-cov-muted' : ''}">
          <span class="kb-cov-label">${doc.extractFailed ? 'Gagal ekstrak' : 'Cakupan AI'}</span>
          <div class="kb-cov-track"><div class="kb-cov-fill ${covFillCls}" style="width:${doc.extractFailed ? 100 : cov}%"></div></div>
          <span class="kb-cov-pct" style="${covColor ? 'color:' + covColor : ''}">${doc.extractFailed ? 'N/A' : cov + '%'}</span>
        </div>
        <div class="kb-card-footer">
          <span class="kb-card-date" ${inactive ? 'style="opacity:.5"' : ''}><i class="ti ti-calendar"></i> Diperbarui ${fmtDate(doc.updatedAt)}</span>
          <div class="kb-card-actions" data-doc-id="${doc.id}" ${inactive ? 'data-inactive="true"' : ''}></div>
        </div>
      </div>`;
  }

  function escapeHtml(s) {
    return String(s || '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  }

  function renderGrid() {
    const grid = document.getElementById('kb-grid');
    if (!grid) return;
    grid.innerHTML = kbDocs.map(cardHtml).join('');
    renderAllCardActions();
    filterCards(document.getElementById('kb-search-input')?.value?.toLowerCase() || '');
  }

  function renderSidebarCounts() {
    const counts = { semua: kbDocs.length };
    kbDocs.forEach((d) => { counts[d.category] = (counts[d.category] || 0) + 1; });
    document.querySelectorAll('.kb-cat-item').forEach((item) => {
      const cat = item.dataset.cat;
      const countEl = item.querySelector('.kb-cat-count');
      if (countEl) countEl.textContent = counts[cat] || 0;
    });
    const activeCat = document.querySelector('.kb-cat-item.active');
    if (activeCat) {
      const label = activeCat.querySelector('span:first-of-type')?.textContent || 'Semua Dokumen';
      const count = activeCat.querySelector('.kb-cat-count')?.textContent || '0';
      const titleEl = document.getElementById('kb-list-title');
      if (titleEl) titleEl.innerHTML = label + ' <span class="kb-count-badge">' + count + '</span>';
    }
  }

  function renderStats() {
    const total = kbDocs.length;
    const active = kbDocs.filter((d) => d.status === 'aktif').length;
    const totalBytes = kbDocs.reduce((sum, d) => sum + (d.sizeBytes || 0), 0);
    const totalEl = document.getElementById('kb-doc-count');
    const statTotalEl = document.getElementById('kb-stat-total');
    if (totalEl) totalEl.textContent = active;
    if (statTotalEl) statTotalEl.textContent = total;
    const dbEl = document.querySelector('.kb-stat-item .ti-database')?.closest('.kb-stat-item')?.querySelector('strong');
    if (dbEl) dbEl.textContent = fmtSize(totalBytes);
  }

  // ── SEARCH ─────────────────────────────────────────────────────
  function bindSearch() {
    const input = document.getElementById('kb-search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      filterCards(this.value.toLowerCase().trim());
    });
    document.addEventListener('keydown', function (e) {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        const kbPage = document.getElementById('knowledge-base-page');
        if (kbPage && kbPage.style.display !== 'none') {
          e.preventDefault();
          input.focus();
          input.select();
        }
      }
    });
  }

  function filterCards(query) {
    const cards = document.querySelectorAll('#kb-grid .kb-card');
    let visible = 0;
    cards.forEach(function (card) {
      const name = card.querySelector('.kb-card-name')?.textContent?.toLowerCase() || '';
      const meta = card.querySelector('.kb-card-meta')?.textContent?.toLowerCase() || '';
      const matchQuery  = !query || name.includes(query) || meta.includes(query);
      const matchCat    = currentCat === 'semua' || card.dataset.cat === currentCat;
      const matchStatus = currentStatus === 'semua' || card.dataset.status === currentStatus;
      const show = matchQuery && matchCat && matchStatus;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    toggleEmpty(visible === 0 && kbDocs.length > 0);
    updateListTitle(visible);
  }

  // ── KATEGORI / STATUS / VIEW / SORT ───────────────────────────
  window.kbFilterCat = function (el, cat) {
    currentCat = cat;
    document.querySelectorAll('.kb-cat-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');
    const label = el.querySelector('span:first-of-type')?.textContent || 'Semua Dokumen';
    const count = el.querySelector('.kb-cat-count')?.textContent || '0';
    document.getElementById('kb-list-title').innerHTML =
      label + ' <span class="kb-count-badge">' + count + '</span>';
    filterCards(document.getElementById('kb-search-input')?.value?.toLowerCase() || '');
  };

  window.kbFilterStatus = function (value) {
    currentStatus = value;
    filterCards(document.getElementById('kb-search-input')?.value?.toLowerCase() || '');
  };

  window.kbSetView = function (view) {
    currentView = view;
    const grid = document.getElementById('kb-grid');
    const btnGrid = document.getElementById('btn-view-grid');
    const btnList = document.getElementById('btn-view-list');
    if (!grid) return;
    if (view === 'list') {
      grid.classList.add('list-view');
      btnGrid?.classList.remove('active');
      btnList?.classList.add('active');
    } else {
      grid.classList.remove('list-view');
      btnGrid?.classList.add('active');
      btnList?.classList.remove('active');
    }
  };

  window.kbSort = function (value) {
    const grid = document.getElementById('kb-grid');
    if (!grid) return;
    const cards = Array.from(grid.querySelectorAll('.kb-card'));
    cards.sort(function (a, b) {
      const nameA = a.querySelector('.kb-card-name')?.textContent || '';
      const nameB = b.querySelector('.kb-card-name')?.textContent || '';
      const covA  = parseFloat(a.querySelector('.kb-cov-pct')?.textContent) || 0;
      const covB  = parseFloat(b.querySelector('.kb-cov-pct')?.textContent) || 0;
      if (value === 'alpha')    return nameA.localeCompare(nameB, 'id');
      if (value === 'coverage') return covB - covA;
      if (value === 'oldest')   return 1;
      return -1;
    });
    cards.forEach(c => grid.appendChild(c));
  };

  // ── MODAL HELPERS ──────────────────────────────────────────────
  window.kbOpenModal = function (name) {
    if (name === 'add') resetAddModal();
    const el = document.getElementById('kb-modal-' + name);
    if (el) el.style.display = 'flex';
  };

  window.kbCloseModal = function (name) {
    const el = document.getElementById('kb-modal-' + name);
    if (el) el.style.display = 'none';
    if (name === 'train') kbResetTrain();
    if (name === 'add') resetAddModal();
  };

  function resetAddModal() {
    editingId = null;
    const title = document.querySelector('#kb-modal-add .kb-modal-title');
    if (title) title.innerHTML = '<i class="ti ti-plus" style="color:var(--red)"></i> Tambah Dokumen';
    const srcTabs = document.querySelector('.kb-source-tabs');
    if (srcTabs) srcTabs.style.display = '';
    const fileTab = document.querySelector('.kb-src-tab[data-src="file"]');
    if (fileTab) window.kbSwitchSrc(fileTab, 'file');
    ['kb-teks-title', 'kb-teks-content', 'kb-url-input', 'kb-add-cat'].forEach((id) => {
      const el = document.getElementById(id);
      if (el) el.value = '';
    });
    const fileList = document.getElementById('kb-file-list');
    if (fileList) fileList.innerHTML = '';
    const fileInput = document.getElementById('kb-file-input');
    if (fileInput) fileInput.value = '';
    pendingFiles = [];
  }

  // ── SUMBER DOC TABS ────────────────────────────────────────────
  window.kbSwitchSrc = function (btn, src) {
    currentSrc = src;
    document.querySelectorAll('.kb-src-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['file', 'url', 'teks'].forEach(function (s) {
      const panel = document.getElementById('kb-src-' + s);
      if (panel) panel.style.display = s === src ? 'flex' : 'none';
    });
    const filePanel = document.getElementById('kb-src-file');
    if (filePanel) filePanel.style.flexDirection = 'column';
  };

  // ── DROPZONE ───────────────────────────────────────────────────
  let pendingFiles = [];
  window.kbOnDragOver = function (e) {
    e.preventDefault();
    document.getElementById('kb-dropzone')?.classList.add('drag-over');
  };
  window.kbOnDragLeave = function () {
    document.getElementById('kb-dropzone')?.classList.remove('drag-over');
  };
  window.kbOnDrop = function (e) {
    e.preventDefault();
    document.getElementById('kb-dropzone')?.classList.remove('drag-over');
    renderFileList(Array.from(e.dataTransfer?.files || []));
  };
  window.kbOnFileSelect = function (e) {
    renderFileList(Array.from(e.target.files || []));
  };

  function renderFileList(files) {
    const list = document.getElementById('kb-file-list');
    if (!list) return;
    list.innerHTML = '';
    const allowed = ['pdf', 'docx', 'xlsx', 'txt', 'csv'];
    pendingFiles = files.filter((f) => allowed.includes(f.name.split('.').pop().toLowerCase()));
    pendingFiles.forEach(function (f, idx) {
      const ext = f.name.split('.').pop().toLowerCase();
      const size = f.size > 1048576 ? (f.size / 1048576).toFixed(1) + ' MB' : Math.round(f.size / 1024) + ' KB';
      const iconMap = { pdf: 'ti-file-type-pdf', docx: 'ti-file-description', xlsx: 'ti-file-spreadsheet', txt: 'ti-file-text', csv: 'ti-file-type-csv' };
      const icon = iconMap[ext] || 'ti-file';
      const item = document.createElement('div');
      item.className = 'kb-file-item';
      item.innerHTML = `<i class="ti ${icon}"></i>
        <span class="kb-file-item-name">${escapeHtml(f.name)}</span>
        <span class="kb-file-item-size">${size}</span>
        <i class="ti ti-x kb-file-item-remove" data-idx="${idx}"></i>`;
      item.querySelector('.kb-file-item-remove').addEventListener('click', function () {
        pendingFiles.splice(idx, 1);
        item.remove();
      });
      list.appendChild(item);
    });
  }

  // ── SIMPAN DOKUMEN (upload / url / teks / edit) ────────────────
  window.kbSaveDoc = async function () {
    const saveBtn = document.querySelector('#kb-modal-add .kb-btn-primary');
    const category = document.getElementById('kb-add-cat')?.value || '';

    try {
      if (editingId) {
        const title = document.getElementById('kb-teks-title')?.value.trim();
        const content = document.getElementById('kb-teks-content')?.value.trim();
        if (!title || !content) { kbToast('<i class="ti ti-alert-triangle"></i> Judul & konten wajib diisi', 'error'); return; }
        if (saveBtn) saveBtn.disabled = true;
        const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, category }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Gagal menyimpan perubahan');
        kbToast('<i class="ti ti-check"></i> Perubahan disimpan.', 'success');
      } else if (currentSrc === 'file') {
        if (!pendingFiles.length) { kbToast('<i class="ti ti-alert-triangle"></i> Pilih minimal 1 file terlebih dahulu', 'error'); return; }
        const fd = new FormData();
        pendingFiles.forEach((f) => fd.append('files', f));
        fd.append('category', category);
        if (saveBtn) saveBtn.disabled = true;
        const res = await fetch(`${KB_API_BASE}/api/knowledge-base/upload`, { method: 'POST', body: fd });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Gagal mengunggah file');
        pendingFiles = [];
        kbToast(`<i class="ti ti-check"></i> ${data.docs.length} dokumen berhasil disimpan. AI sudah bisa menjawab dari isinya.`, 'success');
      } else if (currentSrc === 'url') {
        const url = document.getElementById('kb-url-input')?.value.trim();
        const autoSync = document.getElementById('kb-url-sync')?.checked;
        if (!url) { kbToast('<i class="ti ti-alert-triangle"></i> Isi URL terlebih dahulu', 'error'); return; }
        if (saveBtn) saveBtn.disabled = true;
        const res = await fetch(`${KB_API_BASE}/api/knowledge-base/url`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url, category, autoSync }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Gagal mengambil konten URL');
        kbToast('<i class="ti ti-check"></i> Konten dari URL berhasil disimpan.', 'success');
      } else {
        const title = document.getElementById('kb-teks-title')?.value.trim();
        const content = document.getElementById('kb-teks-content')?.value.trim();
        if (!title || !content) { kbToast('<i class="ti ti-alert-triangle"></i> Judul & konten wajib diisi', 'error'); return; }
        if (saveBtn) saveBtn.disabled = true;
        const res = await fetch(`${KB_API_BASE}/api/knowledge-base/text`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ title, content, category }),
        });
        const data = await res.json();
        if (!data.ok) throw new Error(data.error || 'Gagal menyimpan teks');
        kbToast('<i class="ti ti-check"></i> Dokumen berhasil disimpan. AI sudah bisa menjawab dari isinya.', 'success');
      }

      kbCloseModal('add');
      await kbFetchDocs();
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    } finally {
      if (saveBtn) saveBtn.disabled = false;
    }
  };

  // ── LATIH AI (opsional/kosmetik) ────────────────────────────────
  // Catatan: dokumen "Aktif" sudah langsung dipakai AI saat itu juga (lihat
  // kbActiveContext() di server.js) — tombol ini tidak wajib dipakai, hanya
  // memberi feedback visual bagi user bahwa datanya "siap".
  window.kbStartTrain = function () {
    const startBtn  = document.getElementById('kb-train-start-btn');
    const cancelBtn = document.getElementById('kb-train-cancel-btn');
    const progress  = document.getElementById('kb-train-progress');
    const bar       = document.getElementById('kb-train-bar');
    const status    = document.getElementById('kb-train-status');
    if (!bar || !status || !progress) return;

    if (startBtn) startBtn.style.display = 'none';
    if (cancelBtn) cancelBtn.textContent = 'Tutup';
    progress.style.display = 'flex';

    const steps = [
      { pct: 25, msg: 'Memuat dokumen aktif dari Knowledge Base…' },
      { pct: 55, msg: 'Menyusun konteks untuk model Ollama…' },
      { pct: 85, msg: 'Memvalidasi isi konteks…' },
      { pct: 100, msg: '✓ Knowledge Base siap dipakai AI!' },
    ];
    let i = 0;
    trainTimer = setInterval(function () {
      if (i >= steps.length) {
        clearInterval(trainTimer);
        setTimeout(function () {
          kbCloseModal('train');
          kbToast('<i class="ti ti-brain"></i> Knowledge Base sudah diperbarui & langsung dipakai AI', 'success');
        }, 600);
        return;
      }
      bar.style.width = steps[i].pct + '%';
      status.textContent = steps[i].msg;
      i++;
    }, 700);
  };

  function kbResetTrain() {
    clearInterval(trainTimer);
    const startBtn  = document.getElementById('kb-train-start-btn');
    const cancelBtn = document.getElementById('kb-train-cancel-btn');
    const progress  = document.getElementById('kb-train-progress');
    const bar       = document.getElementById('kb-train-bar');
    const status    = document.getElementById('kb-train-status');
    if (startBtn)  { startBtn.style.display = ''; }
    if (cancelBtn) { cancelBtn.textContent = 'Batal'; }
    if (progress)  { progress.style.display = 'none'; }
    if (bar)       { bar.style.width = '0%'; }
    if (status)    { status.textContent = 'Memulai proses pelatihan…'; }
  }

  // ── CARD ACTION DEFINITIONS ────────────────────────────────────
  const KB_ICONS = {
    preview: '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M1 12S5 4 12 4s11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/></svg>',
    edit:    '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>',
    delete:  '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6"/><path d="M10 11v6"/><path d="M14 11v6"/><path d="M9 6V4h6v2"/></svg>',
    activate:'<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="5 3 19 12 5 21 5 3"/></svg>',
  };
  const KB_ACTION_DEFS = {
    normal: [
      { key: 'preview',  label: 'Pratinjau',       cls: '',                fn: 'kbPreview'  },
      { key: 'edit',     label: 'Edit',             cls: '',                fn: 'kbEdit'     },
      { key: 'delete',   label: 'Hapus',            cls: 'kb-icon-danger',  fn: 'kbDelete'   },
    ],
    inactive: [
      { key: 'activate', label: 'Aktifkan kembali', cls: 'kb-icon-success', fn: 'kbActivate' },
      { key: 'delete',   label: 'Hapus permanen',   cls: 'kb-icon-danger',  fn: 'kbDelete'   },
    ],
  };
  function renderCardActions(container) {
    const id       = container.dataset.docId || '0';
    const inactive = container.dataset.inactive === 'true';
    const defs     = inactive ? KB_ACTION_DEFS.inactive : KB_ACTION_DEFS.normal;
    container.innerHTML = defs.map(function (def) {
      return '<button class="kb-icon-btn' + (def.cls ? ' ' + def.cls : '') + '" ' +
             'title="' + def.label + '" ' +
             'onclick="' + def.fn + '(' + id + ')" ' +
             'aria-label="' + def.label + '">' +
             KB_ICONS[def.key] +
             '</button>';
    }).join('');
  }
  function renderAllCardActions() {
    document.querySelectorAll('.kb-card-actions[data-doc-id]').forEach(renderCardActions);
  }

  // ── CARD ACTIONS ───────────────────────────────────────────────
  window.kbPreview = async function (id) {
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${id}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal memuat dokumen');
      const titleEl = document.getElementById('kb-preview-title');
      const bodyEl  = document.getElementById('kb-preview-body');
      if (titleEl) titleEl.textContent = data.doc.title;
      if (bodyEl)  bodyEl.textContent  = data.doc.content || '(Tidak ada konten / gagal diekstrak)';
      kbOpenModal('preview');
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    }
  };

  window.kbEdit = async function (id) {
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${id}`);
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal memuat dokumen');
      editingId = id;
      const doc = data.doc;

      // Buka modal Tambah Dokumen dalam mode edit, pindah ke tab "Teks
      // Langsung" karena semua tipe sumber punya field `content` yang sama.
      const el = document.getElementById('kb-modal-add');
      if (el) el.style.display = 'flex';
      const title = document.querySelector('#kb-modal-add .kb-modal-title');
      if (title) title.innerHTML = '<i class="ti ti-pencil" style="color:var(--red)"></i> Edit Dokumen';
      const teksTab = document.querySelector('.kb-src-tab[data-src="teks"]');
      if (teksTab) window.kbSwitchSrc(teksTab, 'teks');
      const srcTabs = document.querySelector('.kb-source-tabs');
      if (srcTabs) srcTabs.style.display = 'none'; // saat edit, sumber tidak relevan lagi

      const titleInput = document.getElementById('kb-teks-title');
      const contentInput = document.getElementById('kb-teks-content');
      const catSelect = document.getElementById('kb-add-cat');
      if (titleInput) titleInput.value = doc.title;
      if (contentInput) contentInput.value = doc.content;
      if (catSelect) catSelect.value = doc.category;
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    }
  };

  window.kbDelete = async function (id) {
    if (!confirm('Hapus dokumen ini secara permanen? AI tidak akan lagi menjawab dari isinya.')) return;
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal menghapus dokumen');
      kbToast('<i class="ti ti-trash"></i> Dokumen dihapus.', 'error');
      await kbFetchDocs();
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    }
  };

  window.kbActivate = async function (id) {
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'aktif' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal mengaktifkan dokumen');
      kbToast('<i class="ti ti-player-play"></i> Dokumen diaktifkan kembali — AI akan mulai memakainya.', 'success');
      await kbFetchDocs();
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    }
  };

  window.kbDeactivate = async function (id) {
    try {
      const res = await fetch(`${KB_API_BASE}/api/knowledge-base/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: 'nonaktif' }),
      });
      const data = await res.json();
      if (!data.ok) throw new Error(data.error || 'Gagal menonaktifkan dokumen');
      kbToast('<i class="ti ti-player-stop"></i> Dokumen dinonaktifkan — AI berhenti memakainya.', 'success');
      await kbFetchDocs();
    } catch (e) {
      kbToast(`<i class="ti ti-alert-triangle"></i> ${e.message}`, 'error');
    }
  };

  // ── RESET FILTER ───────────────────────────────────────────────
  window.kbResetFilter = function () {
    currentCat = 'semua';
    currentStatus = 'semua';
    const searchInput = document.getElementById('kb-search-input');
    if (searchInput) searchInput.value = '';
    document.querySelectorAll('.kb-cat-item').forEach((item, i) => {
      item.classList.toggle('active', i === 0);
    });
    const radios = document.querySelectorAll('input[name="kb-status"]');
    if (radios[0]) radios[0].checked = true;
    renderSidebarCounts();
    filterCards('');
  };

  // ── HELPERS ────────────────────────────────────────────────────
  function toggleEmpty(show) {
    const el = document.getElementById('kb-empty');
    if (el) el.style.display = show ? 'flex' : 'none';
  }

  function updateListTitle(count) {
    const titleEl = document.getElementById('kb-list-title');
    if (!titleEl) return;
    const text = titleEl.childNodes[0]?.nodeValue?.trim()
      || titleEl.textContent.replace(/\d+/, '').trim();
    titleEl.innerHTML = (text || 'Dokumen') + ' <span class="kb-count-badge">' + count + '</span>';
  }

  let toastTimer = null;
  function kbToast(html, type) {
    const el = document.getElementById('kb-toast');
    if (!el) return;
    el.innerHTML = html;
    el.className = 'kb-toast' + (type ? ' ' + type : '');
    el.style.display = 'flex';
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () {
      el.style.display = 'none';
    }, 3000);
  }
  window.kbToast = kbToast;

  // ── BOOT ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();