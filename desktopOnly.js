/* ============================================================
   desktopOnly.js — Indotrading AI
   Menampilkan overlay "Desktop Only" jika viewport < 1024 px
   dan memblokir interaksi dengan konten di belakangnya.
   Tidak ada dependency eksternal.
   ============================================================ */

(function () {
  "use strict";

  /** Lebar minimum agar dianggap "desktop" (px) */
  var DESKTOP_MIN_WIDTH = 1024;

  /** Referensi elemen overlay */
  var overlay = null;

  /* ── Cek apakah viewport saat ini termasuk mobile ───────── */
  function isMobile() {
    return window.innerWidth < DESKTOP_MIN_WIDTH;
  }

  /* ── Tampilkan overlay + kunci scroll body ───────────────── */
  function showOverlay() {
    if (!overlay) return;
    overlay.style.display = "flex";
    document.body.classList.add("do-locked");

    /* Aksesibilitas: pindahkan fokus ke dalam overlay */
    var title = overlay.querySelector("#do-title");
    if (title) {
      title.setAttribute("tabindex", "-1");
      title.focus();
    }

    /* Perangkap Tab agar fokus tidak keluar overlay */
    document.addEventListener("keydown", trapFocus);
  }

  /* ── Sembunyikan overlay + bebaskan scroll ───────────────── */
  function hideOverlay() {
    if (!overlay) return;
    overlay.style.display = "none";
    document.body.classList.remove("do-locked");
    document.removeEventListener("keydown", trapFocus);
  }

  /* ── Update state berdasarkan lebar viewport ─────────────── */
  function update() {
    if (isMobile()) {
      showOverlay();
    } else {
      hideOverlay();
    }
  }

  /* ── Perangkap fokus: Tab hanya beredar di dalam overlay ─── */
  function trapFocus(e) {
    if (!overlay || overlay.style.display === "none") return;

    /* Jika user menekan Escape: tidak ada yang dilakukan
       (modal ini tidak bisa ditutup di mobile) */
    if (e.key === "Escape") {
      e.preventDefault();
      return;
    }

    if (e.key !== "Tab") return;

    /* Kumpulkan semua elemen yang bisa difokus di dalam overlay */
    var focusable = overlay.querySelectorAll(
      'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"]), input, select, textarea'
    );
    var focusArr = Array.prototype.slice.call(focusable);
    if (focusArr.length === 0) return;

    var first = focusArr[0];
    var last  = focusArr[focusArr.length - 1];

    if (e.shiftKey) {
      /* Shift+Tab: jika berada di elemen pertama, pindah ke terakhir */
      if (document.activeElement === first) {
        e.preventDefault();
        last.focus();
      }
    } else {
      /* Tab: jika berada di elemen terakhir, pindah ke pertama */
      if (document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    }
  }

  /* ── Debounce sederhana untuk event resize ───────────────── */
  function debounce(fn, delay) {
    var timer;
    return function () {
      clearTimeout(timer);
      timer = setTimeout(fn, delay);
    };
  }

  /* ── Inisialisasi ────────────────────────────────────────── */
  function init() {
    overlay = document.getElementById("desktop-only-overlay");

    if (!overlay) {
      /* Overlay belum ada di DOM — tidak ada yang dikerjakan */
      return;
    }

    /* Cek saat halaman pertama dimuat */
    update();

    /* Pantau perubahan ukuran jendela (misal: rotate, resize) */
    window.addEventListener("resize", debounce(update, 120));
  }

  /* Jalankan setelah DOM siap */
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }

})();