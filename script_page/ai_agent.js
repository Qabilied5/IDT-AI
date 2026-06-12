/* ============================================
   AI AGENT PAGE — SCRIPT
   ============================================ */

// --- BUKA DETAIL PANEL ---
const agentData = {
  sales: {
    title: 'Agent Sales',
    name: 'Agent Sales',
    desc: 'Membantu proses penjualan, merespons pertanyaan produk, dan menutup transaksi secara otomatis.',
    persona: 'Ramah & Semi-formal',
    alias: 'Kak Rina',
  },
  support: {
    title: 'Agent Support',
    name: 'Agent Support',
    desc: 'Menangani komplain, membuat tiket support, dan mengeskalasi ke agen manusia bila diperlukan.',
    persona: 'Formal',
    alias: 'Tim Support',
  },
  booking: {
    title: 'Agent Booking',
    name: 'Agent Booking',
    desc: 'Menerima permintaan jadwal, konfirmasi booking, dan kirim reminder otomatis ke pelanggan.',
    persona: 'Ramah & Semi-formal',
    alias: 'Kak Sari',
  },
};

function openAgentDetail(type) {
  const d = agentData[type];
  if (!d) return;
  document.getElementById('aa-dp-title').textContent = d.title;
  document.getElementById('dp-name').value = d.name;
  document.getElementById('aa-detail-overlay').style.display = 'flex';
}

function closeAgentDetail() {
  document.getElementById('aa-detail-overlay').style.display = 'none';
}

function saveAgent() {
  closeAgentDetail();
  showToast('✓ Konfigurasi agent berhasil disimpan');
}

// --- PAUSE / RESUME AGENT ---
document.querySelectorAll('.aa-pause-btn').forEach(btn => {
  btn.addEventListener('click', function (e) {
    e.stopPropagation();
    const card = this.closest('.aa-card');
    const pill = card.querySelector('.aa-status-pill');
    const dot  = card.querySelector('.aa-dot');
    const isPaused = pill.classList.contains('paused');

    if (isPaused) {
      pill.className = 'aa-status-pill active';
      pill.innerHTML = '<span class="aa-dot"></span> Aktif';
      this.classList.remove('paused-state');
      this.innerHTML = '<i class="ti ti-player-pause"></i>';
      showToast('✓ Agent diaktifkan kembali');
    } else {
      pill.className = 'aa-status-pill paused';
      pill.innerHTML = '<span class="aa-dot paused-dot"></span> Dijeda';
      this.classList.add('paused-state');
      this.innerHTML = '<i class="ti ti-player-play"></i>';
      showToast('⏸ Agent dijeda sementara');
    }
  });
});

// --- BUAT AGENT BARU ---
function openNewAgent() {
  document.getElementById('modal-new-agent').style.display = 'flex';
}

function submitNewAgent() {
  closeModal('modal-new-agent');
  showToast('✓ Agent baru dibuat — lanjutkan konfigurasi di panel edit');
}