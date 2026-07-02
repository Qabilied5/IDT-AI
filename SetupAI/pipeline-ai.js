/* ══ PIPELINE-AI.JS ═════════════════════════════════════════════
   Menghubungkan Pipeline Board ke AI insight backend (server/index.js).
   - Kirim data deal (plDeals) ke server saat halaman dibuka / refresh
   - Server (backend) memanggil Claude, mengembalikan JSON insight
   - Render sebagai kartu: prioritas, alasan, rekomendasi tindakan
   - Keputusan & eksekusi tetap di tangan user — AI hanya menyiapkan
     analisis + tombol pintas ke deal terkait (openDealDrawer)

   Endpoint ini dilayani oleh server.js yang sama dengan fitur follow-up
   leads (Ollama + Telegram) — satu backend, port yang sama (default 3001).
   Ganti PL_AI_ENDPOINT sesuai URL backend kamu saat deploy.
═══════════════════════════════════════════════════════════════ */

const PL_AI_ENDPOINT = 'http://localhost:3001/api/pipeline/ai-insights';

const PL_AI_PRIORITY_META = {
  urgent:      { label: 'Mendesak',  color: 'var(--red)',   bg: 'var(--red-light, #fee2e2)' },
  warning:     { label: 'Perhatian', color: 'var(--amber)', bg: 'var(--amber-bg)' },
  opportunity: { label: 'Peluang',   color: 'var(--green)', bg: 'var(--green-bg)' },
  info:        { label: 'Info',      color: 'var(--gray-600)', bg: 'var(--gray-100)' },
};

let plAiLoading = false;

// ── Ambil insight dari backend ──────────────────────────────────
async function plLoadAIInsights() {
  const panel = document.getElementById('pl-ai-panel');
  if (!panel || plAiLoading) return;

  plAiLoading = true;
  panel.innerHTML = plAiSkeleton();

  try {
    const res = await fetch(PL_AI_ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        deals: plDeals,
        stages: plStages.map(s => s.key),
      }),
    });

    const data = await res.json();
    if (!res.ok || !data.ok) {
      throw new Error(data.error || ('Request gagal: ' + res.status));
    }
    plRenderAIInsights(data);
  } catch (err) {
    console.error('Gagal ambil AI insight:', err);
    const friendly = err.message === 'Failed to fetch'
      ? `Tidak bisa terhubung ke ${PL_AI_ENDPOINT}. Pastikan backend (npm start) menyala.`
      : err.message || 'unknown error';
    panel.innerHTML = `
      <div class="pl-ai-error">
        <i class="ti ti-alert-triangle"></i>
        <span>Gagal memuat insight AI: ${plEsc(friendly)}</span>
        <button class="pl-ai-retry-btn" onclick="plLoadAIInsights()">Coba Lagi</button>
      </div>`;
  } finally {
    plAiLoading = false;
  }
}

function plAiSkeleton() {
  return `
    <div class="pl-ai-head">
      <div class="pl-ai-head-title"><i class="ti ti-sparkles"></i> AI Pipeline Insights</div>
    </div>
    <div class="pl-ai-cards">
      ${[1, 2, 3].map(() => '<div class="pl-ai-skel"></div>').join('')}
    </div>`;
}

// ── Render hasil ─────────────────────────────────────────────────
function plRenderAIInsights(data) {
  const panel = document.getElementById('pl-ai-panel');
  if (!panel) return;

  const insights = Array.isArray(data.insights) ? data.insights : [];
  const forecast = data.forecast || {};

  panel.innerHTML = `
    <div class="pl-ai-head">
      <div class="pl-ai-head-title"><i class="ti ti-sparkles"></i> AI Pipeline Insights</div>
      <div class="pl-ai-head-right">
        <span class="pl-ai-updated">Diperbarui baru saja</span>
        <button class="pl-ai-refresh-btn" onclick="plLoadAIInsights()" aria-label="Refresh insight" title="Refresh insight">
          <i class="ti ti-refresh"></i>
        </button>
      </div>
    </div>

    ${data.summary ? `<div class="pl-ai-summary">${plEsc(data.summary)}</div>` : ''}

    <div class="pl-ai-forecast">
      <div class="pl-ai-forecast-pill likely">
        <span class="lbl">Berpotensi Closing</span>
        <span class="val">${plFmt(forecast.likely_close_value || 0)}</span>
      </div>
      <div class="pl-ai-forecast-pill risk">
        <span class="lbl">Berisiko Hilang</span>
        <span class="val">${plFmt(forecast.at_risk_value || 0)}</span>
      </div>
    </div>

    <div class="pl-ai-cards">
      ${insights.length
        ? insights.map(plAiCardTpl).join('')
        : '<div class="pl-ai-empty">Tidak ada insight mendesak saat ini — pipeline terlihat aman.</div>'}
    </div>`;
}

function plAiCardTpl(item) {
  const meta = PL_AI_PRIORITY_META[item.priority] || PL_AI_PRIORITY_META.info;
  const deal = plDeals.find(d => d.id === item.deal_id);
  const companyLabel = deal ? plEsc(deal.company) : `Deal #${item.deal_id}`;

  return `
    <div class="pl-ai-card" style="--ai-color:${meta.color};--ai-bg:${meta.bg}">
      <div class="pl-ai-card-top">
        <span class="pl-ai-badge">${meta.label}</span>
        <span class="pl-ai-company" title="${companyLabel}">${companyLabel}</span>
      </div>
      <div class="pl-ai-card-title">${plEsc(item.title || '')}</div>
      <div class="pl-ai-card-reason">${plEsc(item.reasoning || '')}</div>
      <div class="pl-ai-card-action">
        <i class="ti ti-arrow-right"></i>
        <span>${plEsc(item.recommended_action || '')}</span>
      </div>
      <button class="pl-ai-card-btn" onclick="openDealDrawer(${item.deal_id})">
        ${plEsc(item.action_label || 'Lihat Deal')}
      </button>
    </div>`;
}

// ── Init ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('pl-ai-panel')) {
    plLoadAIInsights();
  }
});