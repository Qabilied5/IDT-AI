/* ============================================
   PERCAKAPAN PAGE — SCRIPT
   Tambahkan di dalam script.js atau sebelum </body>
   ============================================ */

// --- FILTER PERCAKAPAN ---
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

// --- SEARCH PERCAKAPAN ---
document.getElementById('pc-search-input')?.addEventListener('input', function () {
  const q = this.value.toLowerCase();
  document.querySelectorAll('.pc-item').forEach(item => {
    const name = item.querySelector('.pc-item-name')?.textContent.toLowerCase() || '';
    const preview = item.querySelector('.pc-item-preview')?.textContent.toLowerCase() || '';
    item.style.display = name.includes(q) || preview.includes(q) ? 'flex' : 'none';
  });
});

// --- CHANNEL FILTER ---
document.getElementById('pc-channel-select')?.addEventListener('change', function () {
  const val = this.value;
  document.querySelectorAll('.pc-item').forEach(item => {
    item.style.display =
      val === 'all' || item.dataset.channel === val ? 'flex' : 'none';
  });
});

// --- SELECT CONVERSATION ---
function selectConv(el, id) {
  document.querySelectorAll('.pc-item').forEach(i => i.classList.remove('active'));
  el.classList.add('active');
}

// --- HUMAN AGENT TAKEOVER ---
let isTakenOver = false;
function toggleTakeover() {
  isTakenOver = !isTakenOver;
  const btn = document.getElementById('btn-takeover');
  const indicator = document.getElementById('takeover-indicator');
  const label = document.getElementById('pc-input-label');
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

// --- TOGGLE AI ---
let aiActive = true;
function toggleAI() {
  aiActive = !aiActive;
  const text = document.getElementById('ai-toggle-text');
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

// --- BUAT TIKET ---
function createTicket() {
  document.getElementById('modal-ticket').style.display = 'flex';
}
function submitTicket() {
  closeModal('modal-ticket');
  showToast('✓ Tiket berhasil dibuat & diteruskan ke agen support');
}

// --- KIRIM INVOICE ---
function sendInvoice() {
  document.getElementById('modal-invoice').style.display = 'flex';
}
function submitInvoice() {
  closeModal('modal-invoice');
  const body = document.getElementById('pc-chat-body');
  const msg = document.createElement('div');
  msg.className = 'msg bot';
  msg.innerHTML = `
    <div class="msg-bubble" style="background:var(--green-bg);color:var(--green);border:1px solid #b2dfcb">
      <div style="font-weight:600;margin-bottom:4px"><i class="ti ti-receipt" style="font-size:12px"></i> Invoice Terkirim</div>
      <div style="font-size:11px">INV-20250603-084 · Rp 1.240.000<br>Dikirim ke Budi Wicaksono via WhatsApp</div>
    </div>
    <div class="msg-meta"><span class="ai-label">Sistem</span> Baru saja</div>
  `;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  showToast('✓ Invoice berhasil dikirim via WhatsApp');
}

// --- FOLLOW-UP ---
function sendFollowup() {
  showToast('✓ Pengingat follow-up dijadwalkan dalam 2 jam');
}

// --- CEK STOK ---
function checkStock() {
  showToast('↗ Mengecek stok — spare part mesin packing...');
}

// --- KIRIM PESAN MANUAL ---
function sendMsg() {
  const input = document.getElementById('pc-msg-input');
  const text = input.value.trim();
  if (!text) return;
  const body = document.getElementById('pc-chat-body');
  const msg = document.createElement('div');
  msg.className = 'msg user';
  const now = new Date();
  const time = now.getHours() + ':' + String(now.getMinutes()).padStart(2, '0');
  msg.innerHTML = `<div class="msg-bubble">${text}</div><div class="msg-meta">${time}</div>`;
  body.appendChild(msg);
  body.scrollTop = body.scrollHeight;
  input.value = '';
}
document.getElementById('pc-msg-input')?.addEventListener('keydown', e => {
  if (e.key === 'Enter') sendMsg();
});

// --- CLOSE MODAL ---
function closeModal(id) {
  document.getElementById(id).style.display = 'none';
}

// --- TOAST NOTIFICATION ---
function showToast(msg) {
  const toast = document.getElementById('pc-toast');
  if (!toast) return;
  toast.textContent = msg;
  toast.style.display = 'flex';
  clearTimeout(toast._timer);
  toast._timer = setTimeout(() => { toast.style.display = 'none'; }, 3000);
}