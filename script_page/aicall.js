/* ══════════════════════════════════════════════
   aicall.js — AI Voice / AI Call Page Scripts
   ══════════════════════════════════════════════ */

(function () {

  /* ── LIVE CALL TIMERS ─────────────────────── */
  function startCallTimers() {
    document.querySelectorAll('.ac-live-timer').forEach(function (el) {
      var seconds = parseInt(el.dataset.start || '0', 10);
      setInterval(function () {
        seconds++;
        var m = Math.floor(seconds / 60);
        var s = seconds % 60;
        el.textContent =
          (m < 10 ? '0' : '') + m + ':' + (s < 10 ? '0' : '') + s;
      }, 1000);
    });
  }

  /* ── MODAL HELPERS ────────────────────────── */
  window.acOpenSetup = function () {
    var modal = document.getElementById('ac-modal-setup');
    if (modal) {
      modal.style.display = 'flex';
      requestAnimationFrame(function () {
        modal.style.opacity = '1';
      });
    }
  };

  window.acCloseModal = function (id, event) {
    // If called from overlay click, only close when clicking the overlay itself
    if (event && event.target.id !== id) return;
    var modal = document.getElementById(id);
    if (modal) modal.style.display = 'none';
  };

  window.acOpenLog = function () {
    // Placeholder: could navigate to a dedicated log page or open a modal
    alert('Log lengkap panggilan akan ditampilkan di sini.');
  };

  window.acNewCampaign = function () {
    alert('Form buat kampanye outbound baru.');
  };

  window.acStartCampaign = function (btn) {
    var card = btn.closest('.ac-camp-card');
    if (!card) return;
    // Update status badge
    var badge = card.querySelector('.ac-camp-status');
    if (badge) {
      badge.textContent = 'Berjalan';
      badge.className = 'ac-camp-status running';
    }
    // Animate progress bar
    var bar = card.querySelector('.ac-camp-progress-bar');
    if (bar) {
      bar.style.width = '0%';
      setTimeout(function () { bar.style.width = '5%'; }, 100);
    }
    // Remove start button
    btn.remove();
  };

  window.acSaveSetup = function () {
    acCloseModal('ac-modal-setup');
    // Show a brief toast
    acToast('Konfigurasi suara berhasil disimpan.');
  };

  /* ── VOICE SELECTION ──────────────────────── */
  window.acSelectVoice = function (el, voiceId) {
    document.querySelectorAll('.ac-voice-opt').forEach(function (opt) {
      opt.classList.remove('active');
    });
    el.classList.add('active');
  };

  /* ── SIMPLE TOAST ─────────────────────────── */
  function acToast(msg) {
    var toast = document.createElement('div');
    toast.textContent = msg;
    Object.assign(toast.style, {
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      background: '#222',
      color: '#fff',
      fontSize: '12px',
      fontWeight: '500',
      padding: '10px 16px',
      borderRadius: '8px',
      zIndex: '9999',
      boxShadow: '0 4px 16px rgba(0,0,0,0.2)',
      opacity: '0',
      transition: 'opacity 0.25s',
      fontFamily: 'DM Sans, sans-serif',
    });
    document.body.appendChild(toast);
    requestAnimationFrame(function () { toast.style.opacity = '1'; });
    setTimeout(function () {
      toast.style.opacity = '0';
      setTimeout(function () { toast.remove(); }, 300);
    }, 2800);
  }

  /* ── INIT ─────────────────────────────────── */
  document.addEventListener('DOMContentLoaded', function () {
    startCallTimers();

    // Register this page with the main nav system if it exists
    // The main script.js nav maps page labels to IDs.
    // "AI Call" → "ai-call-page" should be added to pages object in script.js.
    // Here we do a runtime patch as a fallback:
    if (typeof pages !== 'undefined' && !pages['AI Call']) {
      pages['AI Call'] = 'ai-call-page';
    }
  });

})();