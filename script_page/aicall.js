/* ══════════════════════════════════════════════
   aicall.js — AI Voice / AI Call Page Scripts
   ══════════════════════════════════════════════ */

(function () {

  /* ── STATE ────────────────────────────────── */
  var _selectedVoice  = 'siti';
  var _activeCalls    = [];   // live timer intervals
  var _simulInbound   = null; // inbound alert timeout

  /* ── LIVE CALL TIMERS ─────────────────────── */
  function startCallTimers() {
    document.querySelectorAll('.ac-live-timer').forEach(function (el) {
      var seconds = parseInt(el.dataset.start || '0', 10);
      var iv = setInterval(function () {
        seconds++;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        el.textContent =
          (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }, 1000);
      _activeCalls.push(iv);
    });
  }

  /* ── TOAST ────────────────────────────────── */
  function acToast(msg, type) {
    document.querySelectorAll('.ac-toast-popup').forEach(function(t){ t.remove(); });

    var toast = document.createElement('div');
    toast.className = 'ac-toast-popup';
    toast.textContent = msg;

    var bgColor = '#222';
    if (type === 'success') bgColor = 'var(--green)';
    if (type === 'error')   bgColor = 'var(--red)';
    if (type === 'warn')    bgColor = 'var(--amber)';

    Object.assign(toast.style, {
      position:     'fixed',
      bottom:       '24px',
      right:        '24px',
      background:   bgColor,
      color:        '#fff',
      fontSize:     '12px',
      fontWeight:   '500',
      padding:      '10px 16px',
      borderRadius: '8px',
      zIndex:       '9999',
      boxShadow:    '0 4px 16px rgba(0,0,0,0.22)',
      opacity:      '0',
      transition:   'opacity 0.2s',
      fontFamily:   'DM Sans, sans-serif',
      maxWidth:     '300px',
      lineHeight:   '1.5',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 3000);
  }
  window.acToast = acToast;

  /* ── GENERIC MODAL HELPERS ────────────────── */
  window.acCloseModal = function (id, event) {
    if (event && event.target.id !== id) return;
    var modal = document.getElementById(id);
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(function(){ modal.style.display = 'none'; modal.style.opacity = '1'; }, 180);
    }
  };

  function closeModalEl(el) {
    el.style.opacity = '0';
    setTimeout(function(){ el.remove(); }, 180);
  }

  function makeOverlay(id) {
    var existing = document.getElementById(id);
    if (existing) { existing.style.display = 'flex'; return null; }
    var ov = document.createElement('div');
    ov.id        = id;
    ov.className = 'ac-modal-overlay';
    ov.addEventListener('click', function(e){ if (e.target === ov) closeModalEl(ov); });
    return ov;
  }

  /* ── SETUP / KONFIGURASI SUARA ────────────── */
  window.acOpenSetup = function () {
    var modal = document.getElementById('ac-modal-setup');
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(function () { modal.style.opacity = '1'; });
  };

  window.acSaveSetup = function () {
    var voiceEl  = document.querySelector('.ac-voice-opt.active .ac-voice-name');
    var voice    = voiceEl ? voiceEl.textContent : _selectedVoice;
    var greetingEl = document.querySelector('#ac-modal-setup .ac-textarea');
    var greeting = greetingEl ? greetingEl.value.trim() : '';
    var langEl   = document.querySelector('#ac-modal-setup .ac-select');
    var lang     = langEl ? langEl.value : 'Bahasa Indonesia';

    if (!greeting) {
      acToast('Salam pembuka tidak boleh kosong.', 'error');
      return;
    }
    _selectedVoice = voice;
    var heroDesc = document.querySelector('.ac-hero-desc');
    if (heroDesc) {
      heroDesc.innerHTML = 'Panggilan telepon otomatis berbasis AI — tangani inbound, lakukan outbound follow-up, dan bicara dengan suara alami seperti manusia.'
        + ' <span style="color:var(--green);font-weight:600">[Suara aktif: ' + voice + ' · ' + lang + ']</span>';
    }
    acCloseModal('ac-modal-setup');
    acToast('Konfigurasi suara berhasil disimpan.', 'success');
  };

  window.acSelectVoice = function (el, voiceId) {
    document.querySelectorAll('.ac-voice-opt').forEach(function (opt) {
      opt.classList.remove('active');
    });
    el.classList.add('active');
    _selectedVoice = voiceId;
  };

  /* ── LOG PANGGILAN ────────────────────────── */
  window.acOpenLog = function () {
    var ov = makeOverlay('ac-modal-log');
    if (!ov) return;

    var logs = [
      { type:'in',  name:'CV Sumber Makmur',    meta:'Inbound · 08:43 · 3m 12d',            badge:'done',   label:'Selesai' },
      { type:'out', name:'Hendra Saputra',       meta:'Outbound · 08:15 · 1m 47d',           badge:'done',   label:'Selesai' },
      { type:'in',  name:'Rina Wahyuni',         meta:'Inbound · 07:58 · Tidak Dijawab',     badge:'missed', label:'Terlewat' },
      { type:'out', name:'Toko Baja Mandiri',    meta:'Outbound · Kemarin · 4m 05d',         badge:'done',   label:'Selesai' },
      { type:'out', name:'Dewi Lestari',         meta:'Outbound · Kemarin · Sibuk',          badge:'busy',   label:'Sibuk'   },
      { type:'in',  name:'PT Karya Utama',       meta:'Inbound · Kemarin · 2m 30d',          badge:'done',   label:'Selesai' },
      { type:'out', name:'Sandi Firmansyah',     meta:'Outbound · 2 hari lalu · Tidak Dijawab', badge:'missed', label:'Terlewat' },
      { type:'in',  name:'Mitra Elektronik',     meta:'Inbound · 2 hari lalu · 5m 10d',     badge:'done',   label:'Selesai' },
    ];

    var rows = logs.map(function(l){
      var icon = l.type === 'in' ? 'ti-phone-incoming' : 'ti-phone-outgoing';
      return '<div class="ac-log-item" style="position:relative">'
        + '<div class="ac-log-icon ' + l.type + '"><i class="ti ' + icon + '"></i></div>'
        + '<div class="ac-log-body">'
          + '<div class="ac-log-name">' + l.name + '</div>'
          + '<div class="ac-log-meta">' + l.meta + '</div>'
        + '</div>'
        + '<span class="ac-log-badge ' + l.badge + '">' + l.label + '</span>'
        + (l.badge === 'done' ? '<button class="ac-log-play" title="Putar rekaman" onclick="acPlayRecording(this,\'' + l.name + '\')"><i class="ti ti-player-play"></i></button>' : '')
        + '</div>';
    }).join('');

    ov.innerHTML = '<div class="ac-modal" style="width:520px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-history"></i> Log Lengkap Panggilan</div>'
        + '<button class="ac-modal-close" onclick="closeModalEl(document.getElementById(\'ac-modal-log\'))"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body" style="gap:4px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
          + '<span style="font-size:11px;color:var(--gray-400)">' + logs.length + ' panggilan tercatat</span>'
          + '<select class="ac-select" style="width:auto;padding:4px 10px;font-size:11px" onchange="acFilterLog(this.value)">'
            + '<option value="">Semua Tipe</option>'
            + '<option value="in">Inbound</option>'
            + '<option value="out">Outbound</option>'
          + '</select>'
        + '</div>'
        + '<div class="ac-log-list" id="ac-log-full">' + rows + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" onclick="closeModalEl(document.getElementById(\'ac-modal-log\'))">Tutup</button>'
        + '<button class="ac-btn-primary" onclick="acExportLog()"><i class="ti ti-download"></i> Export CSV</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
  };

  // Make closeModalEl global so inline onclick inside the log modal can use it
  window.closeModalEl = closeModalEl;

  window.acPlayRecording = function(btn, name) {
    acToast('Memutar rekaman: ' + name + '…', '');
    var icon = btn.querySelector('i');
    if (icon) {
      icon.className = 'ti ti-player-stop';
      setTimeout(function(){ if (icon) icon.className = 'ti ti-player-play'; }, 3000);
    }
  };

  window.acFilterLog = function(type) {
    var list = document.getElementById('ac-log-full');
    if (!list) return;
    list.querySelectorAll('.ac-log-item').forEach(function(item){
      var icon = item.querySelector('.ac-log-icon');
      if (!type) { item.style.display = ''; return; }
      item.style.display = (icon && icon.classList.contains(type)) ? '' : 'none';
    });
  };

  window.acExportLog = function() {
    var csv = 'Tipe,Nama,Detail,Status\n'
      + 'Inbound,CV Sumber Makmur,08:43 · 3m 12d,Selesai\n'
      + 'Outbound,Hendra Saputra,08:15 · 1m 47d,Selesai\n'
      + 'Inbound,Rina Wahyuni,07:58 · Tidak Dijawab,Terlewat\n'
      + 'Outbound,Toko Baja Mandiri,Kemarin · 4m 05d,Selesai\n'
      + 'Outbound,Dewi Lestari,Kemarin · Sibuk,Sibuk\n'
      + 'Inbound,PT Karya Utama,Kemarin · 2m 30d,Selesai\n'
      + 'Outbound,Sandi Firmansyah,2 hari lalu · Tidak Dijawab,Terlewat\n'
      + 'Inbound,Mitra Elektronik,2 hari lalu · 5m 10d,Selesai\n';

    var blob = new Blob([csv], { type: 'text/csv' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'log-panggilan.csv';
    a.click();
    URL.revokeObjectURL(url);
    acToast('Log berhasil diunduh.', 'success');
  };

  /* ── CALL DETAIL MODAL (from live item click) */
  window.acOpenCallDetail = function(name, type, timer) {
    var ov = document.createElement('div');
    ov.className = 'ac-modal-overlay';
    ov.style.zIndex = '1000';
    ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });

    var typeLabel = type === 'in' ? 'Inbound' : 'Outbound';
    var typeColor = type === 'in' ? 'var(--red)' : '#4b5eaa';

    ov.innerHTML = '<div class="ac-modal" style="width:480px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-phone-call" style="color:var(--red)"></i> Detail Panggilan Aktif</div>'
        + '<button class="ac-modal-close" onclick="this.closest(\'.ac-modal-overlay\').remove()"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body">'
        + '<div class="ac-call-detail-row"><span class="label">Kontak</span><span class="value">' + name + '</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Tipe</span><span class="value" style="color:' + typeColor + ';font-weight:600">' + typeLabel + '</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Durasi saat ini</span><span class="value mono">' + (timer || '00:00') + '</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Suara AI</span><span class="value">' + _selectedVoice.charAt(0).toUpperCase() + _selectedVoice.slice(1) + ' · Bahasa Indonesia</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Status sentimen</span><span class="value" style="color:var(--green)"><i class="ti ti-mood-smile"></i> Positif</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Topik terdeteksi</span><span class="value">Inquiry produk, harga grosir</span></div>'
        + '<div class="ac-form-group" style="margin-top:4px">'
          + '<label class="ac-form-label">Transkrip Real-time</label>'
          + '<div class="ac-transcript-box">'
            + '<div class="ac-transcript-line"><span class="who ai">AI</span><span class="said">Halo, terima kasih telah menghubungi kami. Ada yang bisa saya bantu?</span></div>'
            + '<div class="ac-transcript-line"><span class="who user">' + name.split(' ')[0] + '</span><span class="said">Ya, saya ingin tanya soal harga untuk pembelian grosir.</span></div>'
            + '<div class="ac-transcript-line"><span class="who ai">AI</span><span class="said">Tentu! Untuk pembelian grosir di atas 100 unit, kami memberikan diskon khusus. Boleh saya tahu estimasi jumlah yang Bapak/Ibu butuhkan?</span></div>'
            + '<div class="ac-transcript-line"><span class="who user">' + name.split(' ')[0] + '</span><span class="said">Sekitar 200 unit per bulan.</span></div>'
            + '<div class="ac-transcript-line"><span class="who ai">AI</span><span class="said">Baik, untuk 200 unit per bulan saya akan sambungkan ke tim sales kami ya…</span></div>'
          + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" style="color:var(--amber);border-color:var(--amber)" onclick="acTransferFromDetail(this,\'' + name + '\')"><i class="ti ti-transfer"></i> Transfer ke Agen</button>'
        + '<button class="ac-btn-primary" style="background:var(--red)" onclick="acEndFromDetail(this,\'' + name + '\')"><i class="ti ti-phone-off"></i> Akhiri Panggilan</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
  };

  window.acTransferFromDetail = function(btn, name) {
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader" style="animation:spin 1s linear infinite"></i> Mentransfer…';
    setTimeout(function(){
      acToast('Panggilan ' + name + ' berhasil ditransfer ke agen.', 'warn');
      btn.closest('.ac-modal-overlay').remove();
      // Fade live item
      document.querySelectorAll('#ai-call-page .ac-live-item').forEach(function(item){
        var n = item.querySelector('.ac-live-name');
        if (n && n.textContent === name) {
          item.style.opacity = '0.4';
          item.style.pointerEvents = 'none';
        }
      });
    }, 1200);
  };

  window.acEndFromDetail = function(btn, name) {
    btn.disabled = true;
    btn.innerHTML = '<i class="ti ti-loader"></i> Mengakhiri…';
    setTimeout(function(){
      acToast('Panggilan ' + name + ' diakhiri.', 'error');
      btn.closest('.ac-modal-overlay').remove();
      // Remove live item
      document.querySelectorAll('#ai-call-page .ac-live-item').forEach(function(item){
        var n = item.querySelector('.ac-live-name');
        if (n && n.textContent === name) item.remove();
      });
      updateLiveCount();
    }, 800);
  };

  /* ── OUTBOUND CALL MANUAL ─────────────────── */
  window.acOpenOutbound = function () {
    var ov = makeOverlay('ac-modal-outbound');
    if (!ov) return;

    ov.innerHTML = '<div class="ac-modal" style="width:420px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-phone-outgoing" style="color:#4b5eaa"></i> Panggilan Outbound Manual</div>'
        + '<button class="ac-modal-close" onclick="closeModalEl(document.getElementById(\'ac-modal-outbound\'))"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body">'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Nama Kontak</label>'
          + '<input id="ob-name" class="ac-textarea" style="resize:none;height:36px;padding:8px 12px" placeholder="cth. Budi Santoso" />'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Nomor Telepon</label>'
          + '<div class="ac-phone-input-wrap">'
            + '<span class="ac-phone-flag">🇮🇩</span>'
            + '<input id="ob-phone" class="ac-textarea" style="resize:none;height:36px;padding:8px 12px;flex:1" placeholder="+62 812 3456 7890" />'
          + '</div>'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Tujuan Panggilan</label>'
          + '<select id="ob-purpose" class="ac-select">'
            + '<option>Follow-up Lead</option>'
            + '<option>Konfirmasi Pesanan</option>'
            + '<option>Reminder Pembayaran</option>'
            + '<option>Survei Kepuasan</option>'
            + '<option>Penawaran Produk</option>'
          + '</select>'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Skrip Pembuka (opsional)</label>'
          + '<textarea id="ob-script" class="ac-textarea" rows="3" placeholder="Halo [Nama], saya dari tim Indotrading…"></textarea>'
        + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" onclick="closeModalEl(document.getElementById(\'ac-modal-outbound\'))">Batal</button>'
        + '<button class="ac-btn-primary" onclick="acDoOutbound()"><i class="ti ti-phone-outgoing"></i> Mulai Panggilan</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
  };

  window.acDoOutbound = function() {
    var name  = (document.getElementById('ob-name')  || {}).value || '';
    var phone = (document.getElementById('ob-phone') || {}).value || '';
    if (!name.trim() || !phone.trim()) {
      acToast('Nama dan nomor telepon wajib diisi.', 'error');
      return;
    }
    closeModalEl(document.getElementById('ac-modal-outbound'));
    acToast('Memulai panggilan ke ' + name + ' (' + phone + ')…', '');
    // Add to live list after short delay (simulate connect)
    setTimeout(function(){
      addLiveItem(name, 'out');
      acToast('Panggilan ke ' + name + ' tersambung!', 'success');
    }, 2000);
  };

  /* ── PULSE CORE CLICK: open outbound ─────── */
  function bindPulseCore() {
    var core = document.querySelector('#ai-call-page .ac-pulse-core');
    if (!core) return;
    core.title = 'Klik untuk panggilan outbound manual';
    core.addEventListener('click', function(){
      acOpenOutbound();
    });
  }

  /* ── ADD LIVE ITEM ────────────────────────── */
  function addLiveItem(name, type) {
    var container = document.querySelector('#ai-call-page .ac-live-card');
    if (!container) return;

    var initials = name.split(' ').map(function(w){ return w[0]; }).join('').toUpperCase().slice(0,2);
    var avatarStyle = type === 'in'
      ? 'background:var(--red-light);color:var(--red)'
      : 'background:#eef2ff;color:#4b5eaa';
    var metaIcon = type === 'in' ? 'ti-phone-incoming' : 'ti-phone-outgoing';
    var metaLabel = type === 'in' ? 'Inbound' : 'Outbound';

    var item = document.createElement('div');
    item.className = 'ac-live-item';
    item.innerHTML = '<div class="ac-live-avatar" style="' + avatarStyle + '">' + initials + '</div>'
      + '<div class="ac-live-info">'
        + '<div class="ac-live-name">' + name + '</div>'
        + '<div class="ac-live-meta"><i class="ti ' + metaIcon + '"></i> ' + metaLabel + ' · <span class="ac-live-timer" data-start="0">00:00</span></div>'
      + '</div>'
      + '<div class="ac-live-wave"><span></span><span></span><span></span><span></span><span></span></div>';

    container.appendChild(item);

    // Start its timer
    var timerEl = item.querySelector('.ac-live-timer');
    var secs = 0;
    setInterval(function(){
      secs++;
      var m = Math.floor(secs/60), s = secs%60;
      timerEl.textContent = (m<10?'0':'')+m+':'+(s<10?'0':'')+s;
    }, 1000);

    // Inject action buttons
    bindSingleLiveItem(item);
    updateLiveCount();
  }

  /* ── LIVE COUNT UPDATE ────────────────────── */
  function updateLiveCount() {
    var countEl = document.querySelector('#ai-call-page .ac-live-count');
    if (!countEl) return;
    var n = document.querySelectorAll('#ai-call-page .ac-live-item').length;
    countEl.textContent = n + ' aktif';
    countEl.style.background = n === 0 ? 'var(--gray-100)' : '';
    countEl.style.color       = n === 0 ? 'var(--gray-400)' : '';
  }

  /* ── LIVE ITEM: inject action buttons ─────── */
  function bindSingleLiveItem(item) {
    if (item.querySelector('.ac-live-actions')) return;

    var actions = document.createElement('div');
    actions.className = 'ac-live-actions';
    actions.style.cssText = 'display:flex;gap:5px;flex-shrink:0;margin-left:4px';

    var btnDetail = document.createElement('button');
    btnDetail.title   = 'Lihat detail';
    btnDetail.className = 'ac-modal-close';
    btnDetail.style.cssText = 'background:var(--gray-100);color:var(--gray-600);font-size:12px';
    btnDetail.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <circle cx="12" cy="12" r="10"/>
    <line x1="12" y1="8" x2="12" y2="8"/>
    <line x1="12" y1="12" x2="12" y2="16"/>
  </svg>
`;
    btnDetail.addEventListener('click', function(e){
      e.stopPropagation();
      var nameEl  = item.querySelector('.ac-live-name');
      var metaEl  = item.querySelector('.ac-live-meta');
      var timerEl = item.querySelector('.ac-live-timer');
      var type    = metaEl && metaEl.textContent.includes('Inbound') ? 'in' : 'out';
      acOpenCallDetail(
        nameEl ? nameEl.textContent : 'Tidak diketahui',
        type,
        timerEl ? timerEl.textContent : '00:00'
      );
    });

    var btnTransfer = document.createElement('button');
    btnTransfer.title   = 'Transfer ke agen';
    btnTransfer.className = 'ac-modal-close';
    btnTransfer.style.cssText = 'background:var(--amber-bg);color:var(--amber);font-size:12px';
    btnTransfer.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M7 16V8m0 0L4 11m3-3l3 3"/>
    <path d="M17 8v8m0 0l3-3m-3 3l-3-3"/>
  </svg>
`;
    btnTransfer.addEventListener('click', function(e){
      e.stopPropagation();
      var name = (item.querySelector('.ac-live-name') || {}).textContent || '';
      acToast('Mentransfer panggilan ' + name + ' ke agen manusia…', 'warn');
      setTimeout(function(){
        item.style.opacity       = '0.4';
        item.style.pointerEvents = 'none';
      }, 800);
    });

    var btnEnd = document.createElement('button');
    btnEnd.title   = 'Akhiri panggilan';
    btnEnd.className = 'ac-modal-close';
    btnEnd.style.cssText = 'background:var(--red-light);color:var(--red);font-size:12px';
    btnEnd.innerHTML = `
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">
    <path d="M3 5.5C3 14.06 9.94 21 18.5 21a1 1 0 0 0 1-1v-3a1 1 0 0 0-.88-1A12.3 12.3 0 0 1 15 15.16a1 1 0 0 0-1 .29l-1.5 1.5a14.2 14.2 0 0 1-5.45-5.45l1.5-1.5a1 1 0 0 0 .29-1A12.3 12.3 0 0 1 8 5.88 1 1 0 0 0 7 5H4a1 1 0 0 0-1 .5z"/>
  </svg>
`;
    btnEnd.addEventListener('click', function(e){
      e.stopPropagation();
      var name = (item.querySelector('.ac-live-name') || {}).textContent || '';
      acConfirm(
        'Akhiri Panggilan',
        'Apakah Anda yakin ingin mengakhiri panggilan dengan <strong>' + name + '</strong>?',
        'danger',
        function(){
          acToast('Panggilan ' + name + ' diakhiri.', 'error');
          item.remove();
          updateLiveCount();
        }
      );
    });

    actions.appendChild(btnDetail);
    actions.appendChild(btnTransfer);
    actions.appendChild(btnEnd);
    item.appendChild(actions);
  }

  function bindLiveItems() {
    document.querySelectorAll('#ai-call-page .ac-live-item').forEach(bindSingleLiveItem);
  }

  /* ── CONFIRM DIALOG ───────────────────────── */
  window.acConfirm = function(title, message, type, onConfirm) {
    var ov = document.createElement('div');
    ov.className = 'ac-modal-overlay';
    ov.style.zIndex = '1001';

    var iconClass = type === 'danger' ? 'ti ti-alert-triangle' : 'ti ti-info-circle';
    ov.innerHTML = '<div class="ac-modal" style="width:380px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title">' + title + '</div>'
        + '<button class="ac-modal-close" onclick="this.closest(\'.ac-modal-overlay\').remove()"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body" style="align-items:center;text-align:center;gap:10px">'
        + '<div class="ac-confirm-icon ' + (type||'warn') + '"><i class="' + iconClass + '"></i></div>'
        + '<div class="ac-confirm-body"><p>' + message + '</p></div>'
      + '</div>'
      + '<div class="ac-modal-footer" style="justify-content:center;gap:10px">'
        + '<button class="ac-btn-ghost" onclick="this.closest(\'.ac-modal-overlay\').remove()">Batal</button>'
        + '<button id="ac-confirm-ok" class="ac-btn-primary" ' + (type==='danger'?'':'style="background:var(--amber)"') + '>Konfirmasi</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
    ov.querySelector('#ac-confirm-ok').addEventListener('click', function(){
      ov.remove();
      if (typeof onConfirm === 'function') onConfirm();
    });
  };

  /* ── FEATURE CARD TOGGLE ──────────────────── */
  window.acToggleFeature = function(btn) {
    var card   = btn.closest('.ac-feature-card');
    if (!card) return;
    var status = card.querySelector('.ac-fc-status');
    if (!status) return;
    var isOn = status.classList.contains('on');
    var featureName = (card.querySelector('.ac-fc-title') || {}).textContent || 'Fitur';
    if (isOn) {
      acConfirm(
        'Nonaktifkan Fitur',
        'Apakah Anda yakin ingin menonaktifkan <strong>' + featureName + '</strong>?',
        'warn',
        function(){
          status.textContent = 'Nonaktif';
          status.className   = 'ac-fc-status off';
          acToast(featureName + ' dinonaktifkan.', 'warn');
        }
      );
    } else {
      status.textContent = 'Aktif';
      status.className   = 'ac-fc-status on';
      acToast(featureName + ' diaktifkan.', 'success');
    }
  };

  function bindFeatureCards() {
    document.querySelectorAll('#ai-call-page .ac-feature-card').forEach(function(card){
      var status = card.querySelector('.ac-fc-status');
      if (!status || status.dataset.bound) return;
      status.dataset.bound = '1';
      status.title   = 'Klik untuk toggle';
      status.style.cursor = 'pointer';
      status.addEventListener('click', function(e){
        e.stopPropagation();
        acToggleFeature(status);
      });
    });
  }

  /* ── METRIC CARDS ─────────────────────────── */
  function bindMetricCards() {
    var details = [
      { label: 'Inbound',    detail: '348 panggilan masuk — 74% berhasil ditangani AI, 26% dialihkan ke agen.' },
      { label: 'Outbound',   detail: '512 panggilan keluar — 385 terjawab, 127 tidak terjawab.' },
      { label: 'Tingkat jawab', detail: '74% tingkat jawab — di atas rata-rata industri (60%).' },
      { label: 'Durasi',     detail: 'Rata-rata durasi panggilan 2 menit 18 detik.' },
    ];
    document.querySelectorAll('#ai-call-page .ac-metric').forEach(function(card, i){
      if (card.dataset.bound) return;
      card.dataset.bound = '1';
      card.addEventListener('click', function(){
        if (details[i]) acToast(details[i].detail, '');
      });
    });
  }

  /* ── LOG ITEMS (sidebar card) ─────────────── */
  function bindLogItems() {
    document.querySelectorAll('#ai-call-page .ac-log-card .ac-log-item').forEach(function(item){
      if (item.dataset.bound) return;
      item.dataset.bound = '1';

      // Add play button for "done" items
      if (item.querySelector('.ac-log-badge.done') && !item.querySelector('.ac-log-play')) {
        var playBtn = document.createElement('button');
        playBtn.className = 'ac-log-play';
        playBtn.title = 'Putar rekaman';
        playBtn.innerHTML = `
          <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
            <polygon points="6,4 20,12 6,20"/>
          </svg>
        `;
        playBtn.addEventListener('click', function(e){
          e.stopPropagation();
          var name = (item.querySelector('.ac-log-name') || {}).textContent || '';
          acPlayRecording(playBtn, name);
        });
        item.appendChild(playBtn);
      }

      item.addEventListener('click', function(){
        var name = (item.querySelector('.ac-log-name') || {}).textContent || '';
        var meta = (item.querySelector('.ac-log-meta') || {}).textContent || '';
        var badge = item.querySelector('.ac-log-badge');
        var status = badge ? badge.textContent : '';
        acToast(name + ' · ' + meta + ' (' + status + ')', '');
      });
    });
  }

  /* ── CAMPAIGN CARDS ───────────────────────── */
  window.acNewCampaign = function () {
    var ov = makeOverlay('ac-modal-campaign');
    if (!ov) return;

    ov.innerHTML = '<div class="ac-modal" style="width:460px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-speakerphone"></i> Buat Kampanye Outbound</div>'
        + '<button class="ac-modal-close" onclick="closeModalEl(document.getElementById(\'ac-modal-campaign\'))"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body">'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Nama Kampanye <span style="color:var(--red)">*</span></label>'
          + '<input id="ac-camp-name-input" class="ac-textarea" style="resize:none;height:36px;padding:8px 12px" placeholder="cth. Follow-up Lead Juli 2025" />'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Tujuan Kampanye</label>'
          + '<select id="ac-camp-type-input" class="ac-select">'
            + '<option>Follow-up Lead</option>'
            + '<option>Reminder Pembayaran</option>'
            + '<option>Survei Kepuasan</option>'
            + '<option>Penawaran Produk Baru</option>'
            + '<option>Konfirmasi Pesanan</option>'
          + '</select>'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Estimasi Jumlah Kontak</label>'
          + '<input id="ac-camp-count-input" class="ac-textarea" style="resize:none;height:36px;padding:8px 12px" type="number" placeholder="cth. 100" min="1" />'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Jadwal Mulai</label>'
          + '<input id="ac-camp-date-input" class="ac-textarea" style="resize:none;height:36px;padding:8px 12px" type="datetime-local" />'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Skrip Pembuka AI</label>'
          + '<textarea id="ac-camp-script-input" class="ac-textarea" rows="3" placeholder="Halo [Nama], saya menghubungi dari Indotrading..."></textarea>'
        + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" onclick="closeModalEl(document.getElementById(\'ac-modal-campaign\'))">Batal</button>'
        + '<button class="ac-btn-primary" onclick="acSubmitCampaign()"><i class="ti ti-check"></i> Buat Kampanye</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
  };

  window.acSubmitCampaign = function() {
    var name  = (document.getElementById('ac-camp-name-input')  || {}).value || '';
    var count = (document.getElementById('ac-camp-count-input') || {}).value || '0';
    var type  = (document.getElementById('ac-camp-type-input')  || {}).value || 'Follow-up Lead';

    if (!name.trim()) {
      acToast('Nama kampanye wajib diisi.', 'error');
      return;
    }

    var list = document.querySelector('.ac-campaign-list');
    if (list) {
      var card = document.createElement('div');
      card.className = 'ac-camp-card';
      card.innerHTML = '<div class="ac-camp-header">'
          + '<div class="ac-camp-name">' + name + '</div>'
          + '<span class="ac-camp-status draft">Draft</span>'
        + '</div>'
        + '<div class="ac-camp-progress-wrap"><div class="ac-camp-progress-bar" style="width:0%"></div></div>'
        + '<div class="ac-camp-stats">'
          + '<span><strong>0</strong> / ' + (parseInt(count)||0) + ' kontak</span>'
          + '<span>Belum dimulai</span>'
          + '<button class="ac-camp-start-btn" onclick="acStartCampaign(this)"><i class="ti ti-player-play"></i> Mulai</button>'
        + '</div>';
      list.appendChild(card);
      bindSingleCampaignCard(card);
    }

    closeModalEl(document.getElementById('ac-modal-campaign'));
    acToast('Kampanye "' + name + '" berhasil dibuat!', 'success');

    ['ac-camp-name-input','ac-camp-count-input','ac-camp-script-input'].forEach(function(id){
      var el = document.getElementById(id);
      if (el) el.value = '';
    });
  };

  /* ── START CAMPAIGN ───────────────────────── */
  window.acStartCampaign = function (btn) {
    var card = btn.closest('.ac-camp-card');
    if (!card) return;

    var badge = card.querySelector('.ac-camp-status');
    if (badge) {
      badge.textContent = 'Berjalan';
      badge.className   = 'ac-camp-status running';
    }

    var bar = card.querySelector('.ac-camp-progress-bar');
    if (bar) {
      bar.style.width = '0%';
      var target = Math.floor(Math.random() * 20) + 5;
      setTimeout(function () { bar.style.width = target + '%'; }, 120);
    }

    // Replace start btn with running-state action buttons
    var statsEl = card.querySelector('.ac-camp-stats');
    if (statsEl) {
      var startBtn = statsEl.querySelector('.ac-camp-start-btn');
      if (startBtn) startBtn.remove();

      var actionsEl = document.createElement('div');
      actionsEl.className = 'ac-camp-actions';
      actionsEl.innerHTML = '<button class="ac-camp-btn pause" onclick="acPauseCampaign(this)"><i class="ti ti-player-pause"></i> Jeda</button>'
        + '<button class="ac-camp-btn stop" onclick="acStopCampaign(this)"><i class="ti ti-player-stop"></i> Stop</button>';
      statsEl.appendChild(actionsEl);
    }

    acSimulateCampaignProgress(card);
    acToast('Kampanye dimulai!', 'success');
  };

  /* ── PAUSE CAMPAIGN ───────────────────────── */
  window.acPauseCampaign = function(btn) {
    var card  = btn.closest('.ac-camp-card');
    var badge = card ? card.querySelector('.ac-camp-status') : null;
    var isPaused = badge && badge.classList.contains('paused');

    if (isPaused) {
      // Resume
      if (badge) { badge.textContent = 'Berjalan'; badge.className = 'ac-camp-status running'; }
      btn.className = 'ac-camp-btn pause';
      btn.innerHTML = '<i class="ti ti-player-pause"></i> Jeda';
      acSimulateCampaignProgress(card);
      acToast('Kampanye dilanjutkan.', 'success');
    } else {
      // Pause
      if (badge) { badge.textContent = 'Dijeda'; badge.className = 'ac-camp-status paused'; }
      btn.className = 'ac-camp-btn resume';
      btn.innerHTML = '<i class="ti ti-player-play"></i> Lanjut';
      if (card._progressInterval) { clearInterval(card._progressInterval); card._progressInterval = null; }
      acToast('Kampanye dijeda.', 'warn');
    }
  };

  /* ── STOP CAMPAIGN ────────────────────────── */
  window.acStopCampaign = function(btn) {
    var card = btn.closest('.ac-camp-card');
    var name = card ? (card.querySelector('.ac-camp-name') || {}).textContent : 'Kampanye';

    acConfirm(
      'Hentikan Kampanye',
      'Apakah Anda yakin ingin menghentikan <strong>' + name + '</strong>? Progres saat ini akan disimpan.',
      'danger',
      function(){
        var badge = card.querySelector('.ac-camp-status');
        if (badge) { badge.textContent = 'Dihentikan'; badge.className = 'ac-camp-status draft'; }
        if (card._progressInterval) { clearInterval(card._progressInterval); card._progressInterval = null; }
        var actionsEl = card.querySelector('.ac-camp-actions');
        if (actionsEl) actionsEl.remove();
        acToast('Kampanye "' + name + '" dihentikan.', 'error');
      }
    );
  };

  /* ── CAMPAIGN DETAIL ──────────────────────── */
  window.acOpenCampaignDetail = function(card) {
    var name      = (card.querySelector('.ac-camp-name')   || {}).textContent || '';
    var statusEl  = card.querySelector('.ac-camp-status');
    var status    = statusEl ? statusEl.textContent : '';
    var bar       = card.querySelector('.ac-camp-progress-bar');
    var pct       = bar ? bar.style.width : '0%';
    var stats     = card.querySelector('.ac-camp-stats');
    var statsText = stats ? stats.innerText : '';

    var ov = document.createElement('div');
    ov.className = 'ac-modal-overlay';
    ov.style.zIndex = '1000';
    ov.addEventListener('click', function(e){ if (e.target === ov) ov.remove(); });

    ov.innerHTML = '<div class="ac-modal" style="width:480px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-speakerphone" style="color:var(--red)"></i> ' + name + '</div>'
        + '<button class="ac-modal-close" onclick="this.closest(\'.ac-modal-overlay\').remove()"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body">'
        + '<div class="ac-call-detail-row"><span class="label">Status</span><span class="value">' + status + '</span></div>'
        + '<div class="ac-call-detail-row"><span class="label">Progres</span><span class="value">' + pct + '</span></div>'
        + '<div class="ac-detail-stats">'
          + '<div class="ac-detail-stat"><div class="ac-detail-stat-val">74%</div><div class="ac-detail-stat-lbl">Tingkat Jawab</div></div>'
          + '<div class="ac-detail-stat"><div class="ac-detail-stat-val">23%</div><div class="ac-detail-stat-lbl">Konversi</div></div>'
          + '<div class="ac-detail-stat"><div class="ac-detail-stat-val">2m 4d</div><div class="ac-detail-stat-lbl">Rata Durasi</div></div>'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Progres Detail</label>'
          + '<div style="height:6px;background:var(--gray-100);border-radius:3px;overflow:hidden">'
            + '<div style="height:100%;width:' + pct + ';background:var(--red);border-radius:3px;transition:width 0.5s"></div>'
          + '</div>'
        + '</div>'
        + '<div class="ac-form-group">'
          + '<label class="ac-form-label">Log Aktivitas</label>'
          + '<div class="ac-transcript-box" style="max-height:160px">'
            + '<div class="ac-transcript-line"><span class="who ai" style="width:70px;font-size:10px">10:42</span><span class="said" style="font-size:11px">Panggilan ke Budi Santoso — Dijawab (2m 18d)</span></div>'
            + '<div class="ac-transcript-line"><span class="who user" style="width:70px;font-size:10px">10:38</span><span class="said" style="font-size:11px">Panggilan ke Rina W. — Tidak Dijawab</span></div>'
            + '<div class="ac-transcript-line"><span class="who ai" style="width:70px;font-size:10px">10:35</span><span class="said" style="font-size:11px">Panggilan ke PT Mitra — Dijawab (3m 45d)</span></div>'
            + '<div class="ac-transcript-line"><span class="who user" style="width:70px;font-size:10px">10:31</span><span class="said" style="font-size:11px">Panggilan ke Dewi L. — Sibuk</span></div>'
          + '</div>'
        + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" onclick="this.closest(\'.ac-modal-overlay\').remove()">Tutup</button>'
        + '<button class="ac-btn-primary" onclick="acExportLog()"><i class="ti ti-download"></i> Export Hasil</button>'
      + '</div>'
    + '</div>';

    document.body.appendChild(ov);
  };

  /* ── SIMULATE CAMPAIGN PROGRESS ──────────── */
  function acSimulateCampaignProgress(card) {
    if (card._progressInterval) clearInterval(card._progressInterval);
    var bar = card.querySelector('.ac-camp-progress-bar');
    if (!bar) return;
    var current = parseFloat(bar.style.width) || 0;
    card._progressInterval = setInterval(function(){
      var badge = card.querySelector('.ac-camp-status');
      if (badge && badge.classList.contains('paused')) return;
      current = Math.min(current + (Math.random() * 1.5 + 0.2), 100);
      bar.style.width = current.toFixed(1) + '%';
      if (current >= 100) {
        clearInterval(card._progressInterval);
        card._progressInterval = null;
        if (badge) { badge.textContent = 'Selesai'; badge.className = 'ac-camp-status done'; }
        var actionsEl = card.querySelector('.ac-camp-actions');
        if (actionsEl) actionsEl.remove();
        bar.style.background = 'var(--green)';
        var campName = (card.querySelector('.ac-camp-name') || {}).textContent || 'Kampanye';
        acToast('Kampanye "' + campName + '" selesai!', 'success');
      }
    }, 2000);
  }

  /* ── BIND SINGLE CAMPAIGN CARD ────────────── */
  function bindSingleCampaignCard(card) {
    if (card.dataset.bound) return;
    card.dataset.bound = '1';

    card.addEventListener('click', function(e){
      if (e.target.closest('button')) return;
      acOpenCampaignDetail(card);
    });

    // Bind existing "Mulai" button if present
    var startBtn = card.querySelector('.ac-camp-start-btn');
    if (startBtn && !startBtn.dataset.bound) {
      startBtn.dataset.bound = '1';
      startBtn.addEventListener('click', function(e){
        e.stopPropagation();
        acStartCampaign(startBtn);
      });
    }
  }

  function bindCampaignCards() {
    document.querySelectorAll('#ai-call-page .ac-camp-card').forEach(bindSingleCampaignCard);
  }

  /* ── SECTION ACTION ───────────────────────── */
  function bindSectionActions() {
    document.querySelectorAll('#ai-call-page .ac-section-action').forEach(function(el){
      if (el.dataset.bound) return;
      el.dataset.bound = '1';
      el.addEventListener('click', function(){ acOpenLog(); });
    });
  }

  /* ── INBOUND CALL SIMULATION ──────────────── */
  function simulateInboundCall() {
    var names = [
      { name: 'PT Sinar Harapan', phone: '+62 21 7654 321' },
      { name: 'Andi Wijaya',      phone: '+62 812 9876 543' },
      { name: 'CV Maju Bersama',  phone: '+62 31 5432 109' },
    ];
    var pick = names[Math.floor(Math.random() * names.length)];

    // Remove existing alert if any
    var existing = document.querySelector('.ac-inbound-alert');
    if (existing) existing.remove();

    // var alert = document.createElement('div');
    // alert.className = 'ac-inbound-alert';
    // alert.innerHTML = '<div class="ac-inbound-header">'
    //     + '<div class="ac-inbound-icon"><i class="ti ti-phone-incoming"></i></div>'
    //     + '<div>'
    //       + '<div class="ac-inbound-name">' + pick.name + '</div>'
    //       + '<div class="ac-inbound-sub"><i class="ti ti-phone"></i> ' + pick.phone + ' · Inbound</div>'
    //     + '</div>'
    //   + '</div>'
    //   + '<div class="ac-inbound-btns">'
    //     + '<button class="answer" onclick="acAnswerInbound(this,\'' + pick.name.replace(/'/g,"\\'") + '\')"><i class="ti ti-phone"></i> Angkat</button>'
    //     + '<button class="reject" onclick="acRejectInbound(this,\'' + pick.name.replace(/'/g,"\\'") + '\')"><i class="ti ti-phone-off"></i> Tolak</button>'
    //   + '</div>';

    // document.body.appendChild(alert);

    // Auto-dismiss after 15s
    _simulInbound = setTimeout(function(){
      if (alert.parentNode) {
        alert.style.opacity = '0';
        alert.style.transition = 'opacity 0.3s';
        setTimeout(function(){ alert.remove(); }, 300);
      }
    }, 15000);
  }

  window.acAnswerInbound = function(btn, name) {
    clearTimeout(_simulInbound);
    btn.closest('.ac-inbound-alert').remove();
    addLiveItem(name, 'in');
    acToast('Panggilan dari ' + name + ' diterima AI.', 'success');
  };

  window.acRejectInbound = function(btn, name) {
    clearTimeout(_simulInbound);
    btn.closest('.ac-inbound-alert').remove();
    acToast('Panggilan dari ' + name + ' ditolak.', 'error');
  };

  /* ── INIT ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    startCallTimers();
    bindLogItems();
    bindLiveItems();
    bindMetricCards();
    bindFeatureCards();
    bindCampaignCards();
    bindSectionActions();
    bindPulseCore();

    // Register nav
    if (typeof pages !== 'undefined' && !pages['AI Call']) {
      pages['AI Call'] = 'ai-call-page';
    }

    // Bind existing running-campaign cards with pause/stop (if HTML has them)
    document.querySelectorAll('#ai-call-page .ac-camp-card').forEach(function(card){
      var badge = card.querySelector('.ac-camp-status');
      if (badge && badge.classList.contains('running')) {
        // Add action buttons if not present
        var stats = card.querySelector('.ac-camp-stats');
        if (stats && !stats.querySelector('.ac-camp-actions')) {
          var actEl = document.createElement('div');
          actEl.className = 'ac-camp-actions';
          actEl.innerHTML = '<button class="ac-camp-btn pause" onclick="acPauseCampaign(this)"><i class="ti ti-player-pause"></i> Jeda</button>'
            + '<button class="ac-camp-btn stop" onclick="acStopCampaign(this)"><i class="ti ti-player-stop"></i> Stop</button>';
          stats.appendChild(actEl);
          acSimulateCampaignProgress(card);
        }
      }
    });

    // Simulate inbound call after 8 seconds (demo)
    setTimeout(simulateInboundCall, 8000);

    // Re-bind when navigating to AI Call page
    document.querySelectorAll('.sb-item').forEach(function(item){
      var span = item.querySelector('span');
      if (span && span.textContent.trim() === 'AI Call') {
        item.addEventListener('click', function(){
          setTimeout(function(){
            bindLogItems();
            bindLiveItems();
            bindMetricCards();
            bindFeatureCards();
            bindCampaignCards();
            bindSectionActions();
            bindPulseCore();
          }, 80);
        });
      }
    });
  });

})();