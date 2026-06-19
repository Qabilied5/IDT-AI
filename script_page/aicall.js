/* ══════════════════════════════════════════════
   aicall.js — AI Voice / AI Call Page Scripts
   ══════════════════════════════════════════════ */

(function () {

  /* ── STATE ────────────────────────────────── */
  var _selectedVoice = 'siti';
  var _activeCalls   = [];   // live timer intervals
  var _campaignState = {};   // track running campaigns

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
    // Remove existing toasts
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
  // Make globally accessible
  window.acToast = acToast;

  /* ── MODAL HELPERS ────────────────────────── */
  window.acOpenSetup = function () {
    var modal = document.getElementById('ac-modal-setup');
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(function () { modal.style.opacity = '1'; });
  };

  window.acCloseModal = function (id, event) {
    if (event && event.target.id !== id) return;
    var modal = document.getElementById(id);
    if (modal) {
      modal.style.opacity = '0';
      setTimeout(function(){ modal.style.display = 'none'; modal.style.opacity = '1'; }, 180);
    }
  };

  /* ── LOG MODAL ────────────────────────────── */
  window.acOpenLog = function () {
    // Build / show log modal
    var existing = document.getElementById('ac-modal-log');
    if (existing) {
      existing.style.display = 'flex';
      return;
    }

    var logs = [
      { type:'in',  name:'CV Sumber Makmur',    meta:'Inbound · 08:43 · 3m 12d',     badge:'done',   label:'Selesai' },
      { type:'out', name:'Hendra Saputra',       meta:'Outbound · 08:15 · 1m 47d',    badge:'done',   label:'Selesai' },
      { type:'in',  name:'Rina Wahyuni',         meta:'Inbound · 07:58 · Tidak Dijawab', badge:'missed', label:'Terlewat' },
      { type:'out', name:'Toko Baja Mandiri',    meta:'Outbound · Kemarin · 4m 05d',  badge:'done',   label:'Selesai' },
      { type:'out', name:'Dewi Lestari',         meta:'Outbound · Kemarin · Sibuk',   badge:'busy',   label:'Sibuk'   },
      { type:'in',  name:'PT Karya Utama',       meta:'Inbound · Kemarin · 2m 30d',   badge:'done',   label:'Selesai' },
      { type:'out', name:'Sandi Firmansyah',     meta:'Outbound · 2 hari lalu · Tidak Dijawab', badge:'missed', label:'Terlewat' },
      { type:'in',  name:'Mitra Elektronik',     meta:'Inbound · 2 hari lalu · 5m 10d', badge:'done', label:'Selesai' },
    ];

    var rows = logs.map(function(l){
      var iconColor = l.type === 'in'
        ? 'background:var(--red-light);color:var(--red)'
        : 'background:#eef2ff;color:#4b5eaa';
      var icon = l.type === 'in' ? 'ti-phone-incoming' : 'ti-phone-outgoing';
      return '<div class="ac-log-item">'
        + '<div class="ac-log-icon ' + l.type + '" style="' + iconColor + '"><i class="ti ' + icon + '"></i></div>'
        + '<div class="ac-log-body">'
          + '<div class="ac-log-name">' + l.name + '</div>'
          + '<div class="ac-log-meta">' + l.meta + '</div>'
        + '</div>'
        + '<span class="ac-log-badge ' + l.badge + '">' + l.label + '</span>'
        + '</div>';
    }).join('');

    var modal = document.createElement('div');
    modal.id = 'ac-modal-log';
    modal.className = 'ac-modal-overlay';
    modal.innerHTML = '<div class="ac-modal" style="width:520px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-history"></i> Log Lengkap Panggilan</div>'
        + '<button class="ac-modal-close" onclick="acCloseModal(\'ac-modal-log\')"><i class="ti ti-x"></i></button>'
      + '</div>'
      + '<div class="ac-modal-body" style="gap:4px">'
        + '<div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:8px">'
          + '<span style="font-size:11px;color:var(--gray-400)">8 panggilan tercatat</span>'
          + '<select class="ac-select" style="width:auto;padding:4px 10px;font-size:11px" onchange="acFilterLog(this.value)">'
            + '<option value="">Semua Tipe</option>'
            + '<option value="in">Inbound</option>'
            + '<option value="out">Outbound</option>'
          + '</select>'
        + '</div>'
        + '<div class="ac-log-list" id="ac-log-full">' + rows + '</div>'
      + '</div>'
      + '<div class="ac-modal-footer">'
        + '<button class="ac-btn-ghost" onclick="acCloseModal(\'ac-modal-log\')">Tutup</button>'
        + '<button class="ac-btn-primary" onclick="acExportLog()"><i class="ti ti-download"></i> Export CSV</button>'
      + '</div>'
    + '</div>';

    modal.addEventListener('click', function(e){
      if (e.target === modal) acCloseModal('ac-modal-log');
    });
    document.body.appendChild(modal);
  };

  window.acFilterLog = function(type) {
    var list = document.getElementById('ac-log-full');
    if (!list) return;
    list.querySelectorAll('.ac-log-item').forEach(function(item){
      var icon = item.querySelector('.ac-log-icon');
      if (!type) { item.style.display = ''; return; }
      var match = icon && icon.classList.contains(type);
      item.style.display = match ? '' : 'none';
    });
  };

  window.acExportLog = function() {
    var csv = 'Tipe,Nama,Detail,Status\n'
      + 'Inbound,CV Sumber Makmur,08:43 · 3m 12d,Selesai\n'
      + 'Outbound,Hendra Saputra,08:15 · 1m 47d,Selesai\n'
      + 'Inbound,Rina Wahyuni,07:58 · Tidak Dijawab,Terlewat\n'
      + 'Outbound,Toko Baja Mandiri,Kemarin · 4m 05d,Selesai\n'
      + 'Outbound,Dewi Lestari,Kemarin · Sibuk,Sibuk\n';

    var blob = new Blob([csv], { type: 'text/csv' });
    var url  = URL.createObjectURL(blob);
    var a    = document.createElement('a');
    a.href   = url;
    a.download = 'log-panggilan.csv';
    a.click();
    URL.revokeObjectURL(url);
    acToast('Log berhasil diunduh.', 'success');
  };

  /* ── NEW CAMPAIGN MODAL ───────────────────── */
  window.acNewCampaign = function () {
    var existing = document.getElementById('ac-modal-campaign');
    if (existing) {
      existing.style.display = 'flex';
      return;
    }

    var modal = document.createElement('div');
    modal.id = 'ac-modal-campaign';
    modal.className = 'ac-modal-overlay';
    modal.innerHTML = '<div class="ac-modal" style="width:460px">'
      + '<div class="ac-modal-head">'
        + '<div class="ac-modal-title"><i class="ti ti-speakerphone"></i> Buat Kampanye Outbound</div>'
        + '<button class="ac-modal-close" onclick="acCloseModal(\'ac-modal-campaign\')"><i class="ti ti-x"></i></button>'
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
        + '<button class="ac-btn-ghost" onclick="acCloseModal(\'ac-modal-campaign\')">Batal</button>'
        + '<button class="ac-btn-primary" onclick="acSubmitCampaign()"><i class="ti ti-check"></i> Buat Kampanye</button>'
      + '</div>'
    + '</div>';

    modal.addEventListener('click', function(e){
      if (e.target === modal) acCloseModal('ac-modal-campaign');
    });
    document.body.appendChild(modal);
  };

  window.acSubmitCampaign = function() {
    var name  = (document.getElementById('ac-camp-name-input') || {}).value || '';
    var count = (document.getElementById('ac-camp-count-input') || {}).value || '0';
    var type  = (document.getElementById('ac-camp-type-input') || {}).value || 'Follow-up Lead';

    if (!name.trim()) {
      acToast('Nama kampanye wajib diisi.', 'error');
      return;
    }

    // Add new card to campaign list
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
    }

    acCloseModal('ac-modal-campaign');
    acToast('Kampanye "' + name + '" berhasil dibuat!', 'success');

    // Reset inputs
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

    // Animate progress bar 0 → random %
    var bar = card.querySelector('.ac-camp-progress-bar');
    if (bar) {
      bar.style.width = '0%';
      var target = Math.floor(Math.random() * 30) + 5;
      setTimeout(function () { bar.style.width = target + '%'; }, 120);
    }

    btn.remove();
    acToast('Kampanye dimulai!', 'success');
  };

  /* ── SAVE SETUP ───────────────────────────── */
  window.acSaveSetup = function () {
    // Collect chosen voice
    var voiceEl = document.querySelector('.ac-voice-opt.active .ac-voice-name');
    var voice   = voiceEl ? voiceEl.textContent : _selectedVoice;

    // Collect greeting
    var greetingEl = document.querySelector('#ac-modal-setup .ac-textarea');
    var greeting   = greetingEl ? greetingEl.value.trim() : '';

    // Collect language
    var langEl  = document.querySelector('#ac-modal-setup .ac-select');
    var lang    = langEl ? langEl.value : 'Bahasa Indonesia';

    // Validation
    if (!greeting) {
      acToast('Salam pembuka tidak boleh kosong.', 'error');
      return;
    }

    // Persist to state
    _selectedVoice = voice;

    // Update hero desc to reflect voice
    var heroDesc = document.querySelector('.ac-hero-desc');
    if (heroDesc) {
      heroDesc.innerHTML = 'Panggilan telepon otomatis berbasis AI — tangani inbound, lakukan outbound follow-up, dan bicara dengan suara alami seperti manusia.'
        + ' <span style="color:var(--green);font-weight:600">[Suara aktif: ' + voice + ' · ' + lang + ']</span>';
    }

    acCloseModal('ac-modal-setup');
    acToast('Konfigurasi suara berhasil disimpan.', 'success');
  };

  /* ── VOICE SELECTION ──────────────────────── */
  window.acSelectVoice = function (el, voiceId) {
    document.querySelectorAll('.ac-voice-opt').forEach(function (opt) {
      opt.classList.remove('active');
    });
    el.classList.add('active');
    _selectedVoice = voiceId;
  };

  /* ── FEATURE CARD TOGGLE ──────────────────── */
  window.acToggleFeature = function(btn) {
    var card   = btn.closest('.ac-feature-card');
    if (!card) return;
    var status = card.querySelector('.ac-fc-status');
    if (!status) return;
    var isOn = status.classList.contains('on');
    if (isOn) {
      status.textContent = 'Nonaktif';
      status.className   = 'ac-fc-status off';
      acToast('Fitur dinonaktifkan.', 'warn');
    } else {
      status.textContent = 'Aktif';
      status.className   = 'ac-fc-status on';
      acToast('Fitur diaktifkan.', 'success');
    }
  };

  /* ── LOG ITEM CLICK (in live section) ────── */
  function bindLogItems() {
    document.querySelectorAll('#ai-call-page .ac-log-item').forEach(function(item){
      item.style.cursor = 'pointer';
      item.addEventListener('click', function(){
        var name = item.querySelector('.ac-log-name');
        var meta = item.querySelector('.ac-log-meta');
        if (name) acToast('Detail: ' + name.textContent + (meta ? ' · ' + meta.textContent : ''), '');
      });
    });
  }

  /* ── LIVE CALL ACTIONS ────────────────────── */
  function bindLiveItems() {
    document.querySelectorAll('#ai-call-page .ac-live-item').forEach(function(item){
      // Add action buttons if not already present
      if (item.querySelector('.ac-live-actions')) return;

      var actions = document.createElement('div');
      actions.className = 'ac-live-actions';
      actions.style.cssText = 'display:flex;gap:5px;flex-shrink:0;margin-left:4px';

      var btnTransfer = document.createElement('button');
      btnTransfer.title = 'Transfer ke agen';
      btnTransfer.className = 'ac-modal-close';
      btnTransfer.style.cssText = 'background:var(--amber-bg);color:var(--amber);font-size:12px';
      btnTransfer.innerHTML = '<i class="ti ti-transfer"></i>';
      btnTransfer.addEventListener('click', function(e){
        e.stopPropagation();
        var name = item.querySelector('.ac-live-name');
        acToast('Mentransfer panggilan ' + (name ? name.textContent : '') + ' ke agen manusia…', 'warn');
        setTimeout(function(){
          item.style.opacity = '0.4';
          item.style.pointerEvents = 'none';
        }, 800);
      });

      var btnEnd = document.createElement('button');
      btnEnd.title = 'Akhiri panggilan';
      btnEnd.className = 'ac-modal-close';
      btnEnd.style.cssText = 'background:var(--red-light);color:var(--red);font-size:12px';
      btnEnd.innerHTML = '<i class="ti ti-phone-off"></i>';
      btnEnd.addEventListener('click', function(e){
        e.stopPropagation();
        var name = item.querySelector('.ac-live-name');
        acToast('Panggilan ' + (name ? name.textContent : '') + ' diakhiri.', 'error');
        item.remove();

        // Update count
        var countEl = document.querySelector('.ac-live-count');
        if (countEl) {
          var remaining = document.querySelectorAll('#ai-call-page .ac-live-item').length;
          countEl.textContent = remaining + ' aktif';
          if (remaining === 0) countEl.style.background = 'var(--gray-100)', countEl.style.color = 'var(--gray-400)';
        }
      });

      actions.appendChild(btnTransfer);
      actions.appendChild(btnEnd);
      item.appendChild(actions);
    });
  }

  /* ── METRIC CARD CLICK ────────────────────── */
  function bindMetricCards() {
    var details = [
      { label: 'Inbound bulan ini',    detail: '348 panggilan masuk — 74% berhasil ditangani AI, 26% dialihkan ke agen.' },
      { label: 'Outbound dikirim',     detail: '512 panggilan keluar — 385 terjawab, 127 tidak terjawab.' },
      { label: 'Tingkat jawab',        detail: '74% tingkat jawab — di atas rata-rata industri (60%).' },
      { label: 'Rata-rata durasi',     detail: 'Rata-rata durasi panggilan 2 menit 18 detik.' },
    ];
    document.querySelectorAll('#ai-call-page .ac-metric').forEach(function(card, i){
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(){
        if (details[i]) acToast(details[i].detail, '');
      });
    });
  }

  /* ── FEATURE CARD — make status badges clickable ── */
  function bindFeatureCards() {
    document.querySelectorAll('#ai-call-page .ac-feature-card').forEach(function(card){
      var statusBadge = card.querySelector('.ac-fc-status');
      if (!statusBadge) return;
      statusBadge.style.cursor = 'pointer';
      statusBadge.title = 'Klik untuk toggle';
      statusBadge.addEventListener('click', function(e){
        e.stopPropagation();
        var isOn = statusBadge.classList.contains('on');
        if (isOn) {
          statusBadge.textContent = 'Nonaktif';
          statusBadge.className   = 'ac-fc-status off';
          acToast('Fitur dinonaktifkan.', 'warn');
        } else {
          statusBadge.textContent = 'Aktif';
          statusBadge.className   = 'ac-fc-status on';
          acToast('Fitur diaktifkan.', 'success');
        }
      });
    });
  }

  /* ── CAMPAIGN CARD ACTIONS ────────────────── */
  function bindCampaignCards() {
    document.querySelectorAll('#ai-call-page .ac-camp-card').forEach(function(card){
      // Clicking running cards opens detail
      card.style.cursor = 'pointer';
      card.addEventListener('click', function(e){
        if (e.target.closest('button')) return; // let buttons handle their own events
        var name   = card.querySelector('.ac-camp-name');
        var status = card.querySelector('.ac-camp-status');
        var stats  = card.querySelector('.ac-camp-stats');
        if (name) {
          var statusText = status ? status.textContent : '';
          var statsText  = stats  ? stats.textContent.replace(/\s+/g,' ').trim() : '';
          acToast(name.textContent + ' — ' + statusText + '. ' + statsText, '');
        }
      });
    });
  }

  /* ── SECTION ACTION LINK ──────────────────── */
  function bindSectionActions() {
    var sectionAction = document.querySelector('#ai-call-page .ac-section-action');
    if (sectionAction) {
      sectionAction.style.cursor = 'pointer';
      sectionAction.addEventListener('click', function(){
        window.acOpenLog();
      });
    }
  }

  /* ── INIT ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    startCallTimers();
    bindLogItems();
    bindLiveItems();
    bindMetricCards();
    bindFeatureCards();
    bindCampaignCards();
    bindSectionActions();

    // Register this page with the main nav system if it exists
    if (typeof pages !== 'undefined' && !pages['AI Call']) {
      pages['AI Call'] = 'ai-call-page';
    }

    // Also re-bind when the AI Call page becomes visible (nav click)
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
          }, 80);
        });
      }
    });
  });

})();