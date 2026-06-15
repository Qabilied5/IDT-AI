/* ===================================
   knowledge-base.js — Indotrading AI
   Knowledge Base Page Scripts
   =================================== */

(function () {
  'use strict';

  // ── STATE ──────────────────────────────────────────────────────
  let currentCat    = 'semua';
  let currentStatus = 'semua';
  let currentView   = 'grid';
  let trainTimer    = null;

  // ── INIT ───────────────────────────────────────────────────────
  function init() {
    bindSearch();
    updateDocCount();
  }

  // ── SEARCH ─────────────────────────────────────────────────────
  function bindSearch() {
    const input = document.getElementById('kb-search-input');
    if (!input) return;
    input.addEventListener('input', function () {
      const q = this.value.toLowerCase().trim();
      filterCards(q);
    });
    // Keyboard shortcut Cmd/Ctrl+K
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
    toggleEmpty(visible === 0);
    updateListTitle(visible);
  }

  // ── KATEGORI FILTER ────────────────────────────────────────────
  window.kbFilterCat = function (el, cat) {
    currentCat = cat;
    document.querySelectorAll('.kb-cat-item').forEach(i => i.classList.remove('active'));
    el.classList.add('active');

    // Update list title label
    const label = el.querySelector('span:first-of-type')?.textContent || 'Semua Dokumen';
    const count = el.querySelector('.kb-cat-count')?.textContent || '0';
    document.getElementById('kb-list-title').innerHTML =
      label + ' <span class="kb-count-badge">' + count + '</span>';

    filterCards(document.getElementById('kb-search-input')?.value?.toLowerCase() || '');
  };

  // ── STATUS FILTER ──────────────────────────────────────────────
  window.kbFilterStatus = function (value) {
    currentStatus = value;
    filterCards(document.getElementById('kb-search-input')?.value?.toLowerCase() || '');
  };

  // ── VIEW TOGGLE ────────────────────────────────────────────────
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

  // ── SORT ───────────────────────────────────────────────────────
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
      if (value === 'oldest')   return 1;  // visual only (no real dates)
      return -1; // newest default
    });

    cards.forEach(c => grid.appendChild(c));
  };

  // ── MODAL HELPERS ──────────────────────────────────────────────
  window.kbOpenModal = function (name) {
    const el = document.getElementById('kb-modal-' + name);
    if (el) el.style.display = 'flex';
  };

  window.kbCloseModal = function (name) {
    const el = document.getElementById('kb-modal-' + name);
    if (el) el.style.display = 'none';
    if (name === 'train') kbResetTrain();
  };

  // ── SUMBER DOC TABS ────────────────────────────────────────────
  window.kbSwitchSrc = function (btn, src) {
    document.querySelectorAll('.kb-src-tab').forEach(t => t.classList.remove('active'));
    btn.classList.add('active');
    ['file', 'url', 'teks'].forEach(function (s) {
      const panel = document.getElementById('kb-src-' + s);
      if (panel) panel.style.display = s === src ? 'flex' : 'none';
    });
    // Flex direction for file panel
    const filePanel = document.getElementById('kb-src-file');
    if (filePanel) filePanel.style.flexDirection = 'column';
  };

  // ── DROPZONE ───────────────────────────────────────────────────
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
    const files = Array.from(e.dataTransfer?.files || []);
    renderFileList(files);
  };
  window.kbOnFileSelect = function (e) {
    const files = Array.from(e.target.files || []);
    renderFileList(files);
  };

  function renderFileList(files) {
    const list = document.getElementById('kb-file-list');
    if (!list) return;
    list.innerHTML = '';
    const allowed = ['pdf','docx','xlsx','txt','csv'];
    files.forEach(function (f) {
      const ext = f.name.split('.').pop().toLowerCase();
      if (!allowed.includes(ext)) return;
      const size = f.size > 1048576
        ? (f.size / 1048576).toFixed(1) + ' MB'
        : Math.round(f.size / 1024) + ' KB';
      const iconMap = { pdf: 'ti-file-type-pdf', docx: 'ti-file-description', xlsx: 'ti-file-spreadsheet', txt: 'ti-file-text', csv: 'ti-file-type-csv' };
      const icon = iconMap[ext] || 'ti-file';
      const item = document.createElement('div');
      item.className = 'kb-file-item';
      item.innerHTML = `<i class="ti ${icon}"></i>
        <span class="kb-file-item-name">${f.name}</span>
        <span class="kb-file-item-size">${size}</span>
        <i class="ti ti-x kb-file-item-remove" onclick="this.parentElement.remove()"></i>`;
      list.appendChild(item);
    });
  }

  // ── SIMPAN DOKUMEN (simulasi) ──────────────────────────────────
  window.kbSaveDoc = function () {
    kbCloseModal('add');
    kbToast('<i class="ti ti-check"></i> Dokumen berhasil disimpan. AI sedang dilatih…', 'success');
    // Animasi update counter
    setTimeout(function () {
      updateDocCount(1);
    }, 600);
  };

  // ── LATIH AI ───────────────────────────────────────────────────
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
      { pct: 15, msg: 'Memuat dokumen aktif…' },
      { pct: 35, msg: 'Memproses teks & embedding…' },
      { pct: 60, msg: 'Membangun vektor pengetahuan…' },
      { pct: 85, msg: 'Validasi akurasi respons AI…' },
      { pct: 100, msg: '✓ Pelatihan selesai! Akurasi: 94.7%' },
    ];
    let i = 0;
    trainTimer = setInterval(function () {
      if (i >= steps.length) {
        clearInterval(trainTimer);
        setTimeout(function () {
          kbCloseModal('train');
          kbToast('<i class="ti ti-brain"></i> AI berhasil dilatih ulang (94.7% akurasi)', 'success');
        }, 800);
        return;
      }
      bar.style.width = steps[i].pct + '%';
      status.textContent = steps[i].msg;
      i++;
    }, 900);
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

  // ── CARD ACTIONS ───────────────────────────────────────────────
  window.kbPreview = function (id) {
    kbToast('<i class="ti ti-eye"></i> Membuka pratinjau dokumen #' + id + '…');
  };
  window.kbEdit = function (id) {
    kbToast('<i class="ti ti-pencil"></i> Membuka editor dokumen #' + id + '…');
  };
  window.kbDelete = function (id) {
    if (!confirm('Hapus dokumen ini? AI akan dilatih ulang secara otomatis.')) return;
    kbToast('<i class="ti ti-trash"></i> Dokumen #' + id + ' dihapus.', 'error');
    updateDocCount(-1);
  };
  window.kbActivate = function (id) {
    kbToast('<i class="ti ti-player-play"></i> Dokumen #' + id + ' diaktifkan kembali.', 'success');
  };
  window.kbSync = function (id) {
    kbToast('<i class="ti ti-refresh"></i> Memulai sync URL dokumen #' + id + '…');
  };

  // ── RESET FILTER ───────────────────────────────────────────────
  window.kbResetFilter = function () {
    currentCat = 'semua';
    currentStatus = 'semua';
    const searchInput = document.getElementById('kb-search-input');
    if (searchInput) searchInput.value = '';
    // Reset category active
    document.querySelectorAll('.kb-cat-item').forEach((item, i) => {
      item.classList.toggle('active', i === 0);
    });
    // Reset status radio
    const radios = document.querySelectorAll('input[name="kb-status"]');
    if (radios[0]) radios[0].checked = true;
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

  function updateDocCount(delta) {
    const el = document.getElementById('kb-doc-count');
    const statEl = document.getElementById('kb-stat-total');
    if (!el) return;
    let count = parseInt(el.textContent, 10) || 0;
    count += (delta || 0);
    el.textContent = count;
    if (statEl) statEl.textContent = count;
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
  // Expose for potential use from HTML
  window.kbToast = kbToast;

  // ── BOOT ───────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

})();