/* ============================================================
   integrasi.js — Indotrading AI
   Halaman Integrasi Channel & Platform
   ============================================================ */

// ── DATA INTEGRASI ─────────────────────────────────────────────
const IG_DATA = [

  /* ── MESSAGING ── */
  {
    id: 'whatsapp',
    name: 'WhatsApp Business',
    icon: `<svg width="18" height="18" viewBox="0 0 448 512" fill="#25D366" xmlns="http://www.w3.org/2000/svg">
      <path d="M380.9 97.1C339 55.1 283.2 32 223.9 32c-122.4 0-222 99.6-222 222 0 39.1 10.2 77.3 29.6 111L0 480l117.7-30.9c32.4 17.7 68.9 27 106.1 27h.1c122.3 0 224.1-99.6 224.1-222 0-59.3-25.2-115-67.1-157zm-157 341.6c-33.2 0-65.7-8.9-94-25.7l-6.7-4-69.8 18.3L72 359.2l-4.4-7c-18.5-29.4-28.2-63.3-28.2-98.2 0-101.7 82.8-184.5 184.6-184.5 49.3 0 95.6 19.2 130.4 54.1 34.8 34.9 56.2 81.2 56.1 130.5 0 101.8-84.9 184.6-186.6 184.6zm101.2-138.2c-5.5-2.8-32.8-16.2-37.9-18-5.1-1.9-8.8-2.8-12.5 2.8-3.7 5.6-14.3 18-17.6 21.8-3.2 3.7-6.5 4.2-12 1.4-32.6-16.3-54-29.1-75.5-66-5.7-9.8 5.7-9.1 16.3-30.3 1.8-3.7.9-6.9-.5-9.7-1.4-2.8-12.5-30.1-17.1-41.2-4.5-10.8-9.1-9.3-12.5-9.5-3.2-.2-6.9-.2-10.6-.2-3.7 0-9.7 1.4-14.8 6.9-5.1 5.6-19.4 19-19.4 46.3 0 27.3 19.9 53.7 22.6 57.4 2.8 3.7 39.1 59.7 94.8 83.8 35.2 15.2 49 16.5 66.6 13.9 10.7-1.6 32.8-13.4 37.4-26.4 4.6-13 4.6-24.1 3.2-26.4-1.3-2.5-5-3.9-10.5-6.6z"/>
    </svg>`,
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-whatsapp',
    // Status TIDAK di-hardcode lagi — mengikuti ada/tidaknya kredensial WABA
    // yang tersimpan di browser ini (lihat waba-token.js + igSyncWabaStatus()
    // di bawah), sejajar dengan pola kartu Telegram.
    status: 'disconnected', // connected | pending | disconnected
    desc: 'Hubungkan WhatsApp Business API (Meta Cloud API) ke AI Agent Anda. Terima dan balas pesan pelanggan secara otomatis, kelola percakapan massal, dan kirim notifikasi pesanan.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply AI' },
      { icon: 'ti-users', label: 'Broadcast List' },
      { icon: 'ti-file-invoice', label: 'Template Pesan' },
      { icon: 'ti-bell', label: 'Notifikasi Order' },
    ],
  },
  {
    id: 'instagram',
    name: 'Instagram DM',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id="igGrad-instagram" x1="0%" y1="100%" x2="100%" y2="0%">
          <stop offset="0%" stop-color="#FFDC80"/>
          <stop offset="20%" stop-color="#FCAF45"/>
          <stop offset="40%" stop-color="#F77737"/>
          <stop offset="60%" stop-color="#E1306C"/>
          <stop offset="80%" stop-color="#C13584"/>
          <stop offset="100%" stop-color="#833AB4"/>
        </linearGradient>
      </defs>
      <path fill="url(#igGrad-instagram)" d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.012-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zM12 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z"/>
    </svg>`,
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-instagram',
    status: 'connected',
    desc: 'Integrasikan Instagram Direct Message dengan AI Agent. Balas DM pelanggan secara otomatis dan konversikan komentar produk menjadi leads.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply DM' },
      { icon: 'ti-message-circle', label: 'Komentar ke Lead' },
      { icon: 'ti-photo', label: 'Produk Tagging' },
    ],
    connectedInfo: {
      account: '@indotrading.official',
      since: '5 Maret 2025',
      msgs: '12.540 DM',
      lastStatus: '✅ Aktif — 8 menit lalu',
    },
    stats: [
      { val: '12.540', label: 'DM' },
      { val: '78%', label: 'AI Handle' },
      { val: '4.2 dtk', label: 'Avg Respons' },
    ],
  },
  {
    id: 'email',
    name: 'Email (SMTP/IMAP)',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="4.5" width="20" height="15" rx="2.2" stroke="#5B6472" stroke-width="1.8"/>
      <path d="M3 6.5l9 6.8 9-6.8" stroke="#5B6472" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" fill="none"/>
    </svg>`,
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-mail',
    status: 'pending',
    desc: 'Hubungkan akun email bisnis Anda untuk membalas pertanyaan pelanggan secara otomatis, mengirim follow-up leads, dan notifikasi transaksi via AI.',
    features: [
      { icon: 'ti-robot', label: 'Auto-reply Email' },
      { icon: 'ti-send', label: 'Email Campaign' },
      { icon: 'ti-refresh', label: 'Follow-up Leads' },
    ],
    configFields: [
      { key: 'smtp_host', label: 'SMTP Host', placeholder: 'mail.yourdomain.com', type: 'text' },
      { key: 'smtp_port', label: 'Port SMTP', placeholder: '465', type: 'text' },
      { key: 'email_user', label: 'Alamat Email', placeholder: 'sales@indotrading.com', type: 'email' },
      { key: 'email_pass', label: 'Password / App Password', placeholder: '••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'telegram',
    name: 'Telegram Bot',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#26A5E4" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"/>
    </svg>`,
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-brand-telegram',
    status: 'disconnected',
    desc: 'Buat dan hubungkan Telegram Bot untuk melayani pelanggan, mengirim notifikasi pesanan, dan broadcast pesan promosi ke subscriber channel Anda.',
    features: [
      { icon: 'ti-robot', label: 'Bot AI' },
      { icon: 'ti-bell', label: 'Notifikasi' },
      { icon: 'ti-speakerphone', label: 'Broadcast Channel' },
    ],
    configFields: [
      { key: 'bot_token', label: 'Bot Token (dari @BotFather)', placeholder: '110201543:AAHdqTcvCH1vGWJxfSeofSAs0K5PALDsaw', type: 'text' },
      { key: 'webhook_url', label: 'Webhook URL (opsional)', placeholder: 'https://api.indotrading.com/webhook/tg', type: 'text' },
    ],
    stats: [
      { val: 'Undef', label: 'DM' },
      { val: 'Undef', label: 'AI Handle' },
      { val: 'Undef', label: 'Avg Respons' },
    ],
  },
  {
    id: 'livechat',
    name: 'Live Chat Web',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#6366F1" xmlns="http://www.w3.org/2000/svg">
      <path d="M12 4C6.477 4 2 7.85 2 12.5c0 2.34 1.14 4.46 3 5.98V22l3.6-2.1c1.05.26 2.18.4 3.4.4 5.523 0 10-3.85 10-8.6S17.523 4 12 4z"/>
    </svg>`,
    category: 'messaging',
    catLabel: 'Pesan',
    catIcon: 'ti-message-chatbot',
    status: 'connected',
    desc: 'Pasang widget live chat bertenaga AI di website Indotrading Anda. Pengunjung website langsung dilayani AI Agent tanpa harus berpindah platform.',
    features: [
      { icon: 'ti-code', label: 'Widget Embed' },
      { icon: 'ti-robot', label: 'AI First Response' },
      { icon: 'ti-transfer', label: 'Handover ke Agen' },
    ],
    connectedInfo: {
      account: 'indotrading.com (snippet aktif)',
      since: '20 Februari 2025',
      msgs: '6.830 sesi',
      lastStatus: '✅ Aktif — live',
    },
    stats: [
      { val: '6.830', label: 'Sesi' },
      { val: '94%', label: 'AI Handle' },
      { val: '1.8 dtk', label: 'Avg Respons' },
    ],
  },

  /* ── CRM ── */
  {
    id: 'hubspot',
    name: 'HubSpot CRM',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FF7A59" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.164 7.93V5.084a2.198 2.198 0 001.267-1.978v-.067A2.2 2.2 0 0017.238.845h-.067a2.2 2.2 0 00-2.193 2.193v.067a2.196 2.196 0 001.252 1.973l.013.006v2.852a6.22 6.22 0 00-2.969 1.31l.012-.01-7.828-6.095A2.497 2.497 0 104.3 4.656l-.012.006 7.697 5.991a6.176 6.176 0 00-1.038 3.446c0 1.343.425 2.588 1.147 3.607l-.013-.02-2.342 2.343a1.968 1.968 0 00-.58-.095h-.002a2.033 2.033 0 102.033 2.033 1.978 1.978 0 00-.1-.595l.005.014 2.317-2.317a6.247 6.247 0 104.782-11.134l-.036-.005zm-.964 9.378a3.206 3.206 0 113.215-3.207v.002a3.206 3.206 0 01-3.207 3.207z"/>
    </svg>`,
    category: 'crm',
    catLabel: 'CRM',
    catIcon: 'ti-users',
    status: 'disconnected',
    desc: 'Sinkronisasi leads dari AI Agent langsung ke HubSpot. Data kontak, riwayat percakapan, dan status follow-up otomatis tersimpan di pipeline CRM Anda.',
    features: [
      { icon: 'ti-refresh', label: 'Sync Leads Otomatis' },
      { icon: 'ti-timeline', label: 'Pipeline Sinkron' },
      { icon: 'ti-notes', label: 'Log Percakapan' },
    ],
    configFields: [
      { key: 'hs_api_key', label: 'HubSpot API Key / Private App Token', placeholder: 'pat-na1-xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', type: 'password' },
      { key: 'hs_pipeline', label: 'Pipeline ID (opsional)', placeholder: 'default', type: 'text' },
    ],
  },
  {
    id: 'salesforce',
    name: 'Salesforce',
    icon: `<svg width="18" height="18" viewBox="0 0 128 128" xmlns="http://www.w3.org/2000/svg">
      <path fill="#00A1E0" d="M53.01 31.44c3.98-4.14 9.51-6.71 15.64-6.71 8.14 0 15.24 4.54 19.02 11.28a26.26 26.26 0 0110.75-2.29c14.68 0 26.58 12.01 26.58 26.81 0 14.81-11.9 26.82-26.58 26.82-1.79 0-3.54-.18-5.24-.52-3.33 5.94-9.68 9.95-16.96 9.95-3.05 0-5.93-.7-8.5-1.96-3.38 7.94-11.24 13.51-20.41 13.51-9.55 0-17.68-6.04-20.8-14.51-1.36.29-2.78.44-4.23.44-11.37 0-20.58-9.31-20.58-20.79 0-7.7 4.14-14.42 10.29-18.01a23.727 23.727 0 01-1.97-9.51c0-13.21 10.72-23.92 23.95-23.92 7.76-.01 14.67 3.69 19.04 9.41"/>
      <path fill="#FFF" d="M19.56 66.78c-.08.2.03.24.05.28.23.17.47.29.7.43 1.26.67 2.44.86 3.69.86 2.53 0 4.1-1.35 4.1-3.51v-.04c0-2-1.77-2.73-3.44-3.25l-.22-.07c-1.25-.41-2.34-.76-2.34-1.58v-.04c0-.71.63-1.23 1.61-1.23 1.09 0 2.38.36 3.21.82 0 0 .24.16.33-.08.05-.13.47-1.26.51-1.38.05-.13-.04-.23-.12-.28-.95-.58-2.26-.97-3.62-.97h-.25c-2.31 0-3.93 1.4-3.93 3.4v.04c0 2.11 1.78 2.8 3.45 3.28l.27.08c1.22.37 2.27.7 2.27 1.55v.04c0 .78-.68 1.37-1.78 1.37-.43 0-1.79-.01-3.26-.94-.18-.1-.28-.18-.42-.26-.07-.05-.25-.12-.33.11l-.48 1.37zM56.59 66.78c-.08.2.03.24.05.28.23.17.47.29.7.43 1.26.67 2.44.86 3.69.86 2.53 0 4.1-1.35 4.1-3.51v-.04c0-2-1.77-2.73-3.44-3.25l-.22-.07c-1.25-.41-2.34-.76-2.34-1.58v-.04c0-.71.63-1.23 1.61-1.23 1.09 0 2.38.36 3.21.82 0 0 .24.16.33-.08.05-.13.47-1.26.51-1.38.05-.13-.04-.23-.12-.28-.95-.58-2.26-.97-3.62-.97h-.25c-2.31 0-3.93 1.4-3.93 3.4v.04c0 2.11 1.78 2.8 3.45 3.28l.27.08c1.22.37 2.27.7 2.27 1.55v.04c0 .78-.68 1.37-1.78 1.37-.43 0-1.79-.01-3.26-.94-.18-.1-.28-.18-.42-.26-.05-.03-.26-.11-.33.11l-.48 1.37zM81.86 62.54c0 1.22-.23 2.19-.68 2.87-.44.67-1.12 1-2.05 1-.94 0-1.61-.33-2.05-1-.44-.68-.67-1.65-.67-2.87 0-1.22.22-2.18.67-2.86.44-.67 1.11-.99 2.05-.99.94 0 1.61.32 2.06.99.44.67.67 1.63.67 2.86m2.11-2.27c-.21-.7-.53-1.32-.96-1.83a4.53 4.53 0 00-1.62-1.23c-.64-.3-1.41-.45-2.26-.45-.86 0-1.62.15-2.26.45-.65.3-1.19.72-1.62 1.23-.43.52-.75 1.13-.96 1.83-.21.7-.31 1.46-.31 2.27s.1 1.57.31 2.27.53 1.32.96 1.83c.43.52.98.93 1.62 1.22.65.29 1.41.44 2.26.44.86 0 1.62-.15 2.26-.44.64-.29 1.19-.71 1.62-1.22.43-.51.75-1.13.96-1.83.21-.7.31-1.46.31-2.27s-.1-1.58-.31-2.27M101.31 66.08c-.07-.21-.27-.13-.27-.13-.31.12-.63.23-.98.28-.35.05-.74.08-1.16.08-1.02 0-1.83-.3-2.42-.9-.58-.6-.91-1.57-.91-2.89 0-1.2.29-2.1.81-2.78.51-.68 1.3-1.03 2.34-1.03.87 0 1.54.1 2.23.32 0 0 .17.07.25-.15.18-.51.32-.88.52-1.44.06-.16-.08-.23-.13-.25-.27-.11-.92-.28-1.41-.35-.46-.07-.99-.11-1.58-.11-.89 0-1.68.15-2.35.45-.67.3-1.25.71-1.7 1.23a5.3 5.3 0 00-1.03 1.83c-.23.7-.34 1.46-.34 2.27 0 1.75.47 3.17 1.41 4.2.93 1.04 2.34 1.57 4.17 1.57 1.08 0 2.19-.22 2.99-.53 0 0 .15-.07.09-.25l-.53-1.42zM105.01 61.36c.1-.68.29-1.25.58-1.69.44-.67 1.1-1.04 2.04-1.04s1.56.37 2 1.04c.3.44.42 1.03.47 1.69h-5.09zm7.1-1.49c-.18-.68-.62-1.36-.92-1.67-.46-.5-.91-.84-1.36-1.03a5.2 5.2 0 00-2.05-.41c-.89 0-1.7.15-2.36.46-.66.31-1.21.73-1.65 1.26-.43.52-.76 1.15-.97 1.85-.21.7-.31 1.47-.31 2.28 0 .82.11 1.59.32 2.28.22.7.57 1.31 1.04 1.82.47.51 1.07.91 1.8 1.19.72.28 1.59.42 2.59.42 2.06-.01 3.15-.47 3.6-.71.08-.04.15-.12.06-.34l-.47-1.31c-.07-.19-.27-.12-.27-.12-.51.19-1.24.53-2.93.53-1.11 0-1.93-.33-2.44-.84-.53-.52-.79-1.29-.83-2.38l7.15.01s.19 0 .21-.19c.01-.1.25-1.49-.21-3.1zM47.77 61.36c.1-.68.29-1.25.58-1.69.44-.67 1.1-1.04 2.04-1.04s1.56.37 2 1.04c.29.44.42 1.03.47 1.69h-5.09zm7.11-1.49c-.18-.68-.62-1.36-.91-1.67-.46-.5-.91-.84-1.36-1.03a5.2 5.2 0 00-2.05-.41c-.89 0-1.7.15-2.36.46-.66.31-1.21.73-1.65 1.26-.43.52-.76 1.15-.97 1.85-.21.7-.31 1.47-.31 2.28 0 .82.11 1.59.32 2.28.22.7.57 1.31 1.04 1.82.47.51 1.07.91 1.8 1.19.72.28 1.59.42 2.59.42 2.06-.01 3.15-.47 3.6-.71.08-.04.15-.12.06-.34l-.47-1.31c-.07-.19-.27-.12-.27-.12-.51.19-1.24.53-2.93.53-1.11 0-1.93-.33-2.44-.84-.53-.52-.79-1.29-.83-2.38l7.15.01s.19 0 .21-.19c0-.1.24-1.49-.22-3.1zM32.32 66.04c-.28-.22-.32-.28-.41-.42-.14-.22-.21-.53-.21-.93 0-.63.21-1.08.64-1.38-.01 0 .61-.54 2.07-.52 1.02.01 1.94.17 1.94.17v3.25s-.91.19-1.93.26c-1.46.08-2.1-.43-2.1-.43m2.85-5.02c-.29-.02-.67-.03-1.12-.03-.61 0-1.2.08-1.76.23-.56.15-1.06.38-1.49.69-.43.31-.78.71-1.04 1.18-.25.47-.38 1.03-.38 1.65 0 .63.11 1.18.33 1.63.22.45.53.83.93 1.12.4.29.89.5 1.46.63.56.13 1.2.19 1.89.19.73 0 1.46-.06 2.17-.18.7-.12 1.56-.29 1.8-.35s.5-.13.5-.13c.18-.04.16-.23.16-.23v-6.54c0-1.43-.38-2.5-1.14-3.15-.75-.66-1.85-.99-3.28-.99-.54 0-1.4.07-1.91.18 0 0-1.56.3-2.2.8 0 0-.14.09-.06.28l.51 1.36c.06.18.23.12.23.12s.05-.02.12-.06c1.38-.75 3.11-.73 3.11-.73.77 0 1.37.15 1.77.46.39.3.59.75.59 1.7v.3c-.63-.08-1.19-.13-1.19-.13M92.81 57.34a.201.201 0 00-.11-.26c-.12-.05-.73-.18-1.2-.21-.9-.05-1.4.1-1.84.3-.44.2-.93.52-1.21.89v-.87c0-.12-.09-.22-.21-.22h-1.83c-.12 0-.21.1-.21.22v10.66c0 .12.1.22.22.22h1.88c.12 0 .22-.1.22-.22v-5.33c0-.71.08-1.43.24-1.88.15-.44.37-.8.63-1.05s.56-.43.88-.53c.33-.1.7-.14.96-.14.37 0 .79.1.79.1.14.02.21-.07.26-.19.11-.32.46-1.3.53-1.49"/>
      <path fill="#FFF" d="M75.18 52.4c-.23-.07-.44-.12-.71-.17-.27-.05-.6-.07-.97-.07-1.29 0-2.31.37-3.03 1.09-.71.72-1.19 1.81-1.44 3.24l-.09.48h-1.62s-.2-.01-.24.21l-.27 1.49c-.02.14.04.23.23.23h1.58l-1.6 8.94c-.12.72-.27 1.31-.43 1.76-.16.44-.31.77-.5 1.02-.18.23-.35.4-.65.5-.25.08-.53.12-.84.12-.17 0-.4-.03-.57-.06-.17-.03-.26-.07-.39-.12 0 0-.18-.07-.26.11-.06.15-.48 1.31-.53 1.45-.05.14.02.25.11.29.21.07.37.12.65.19.4.09.73.1 1.05.1.66 0 1.26-.09 1.75-.27.5-.18.93-.5 1.32-.92.42-.46.68-.94.93-1.6.25-.65.46-1.46.63-2.4l1.61-9.11h2.35s.2.01.24-.21l.27-1.49c.02-.14-.04-.23-.23-.23h-2.29c.01-.05.12-.86.38-1.61.11-.32.32-.58.5-.76.18-.18.38-.3.6-.37.23-.07.48-.11.77-.11.21 0 .43.02.59.06.22.05.31.07.37.09.23.07.27 0 .31-.11l.55-1.5c.06-.17-.08-.24-.13-.26M43.26 67.85c0 .12-.09.22-.21.22h-1.9c-.12 0-.2-.1-.2-.22V52.6c0-.12.08-.22.2-.22h1.9c.12 0 .21.1.21.22v15.25z"/>
    </svg>`,
    category: 'crm',
    catLabel: 'CRM',
    catIcon: 'ti-cloud',
    status: 'disconnected',
    desc: 'Integrasikan Salesforce CRM untuk mengelola leads enterprise. Setiap percakapan AI otomatis menciptakan record dan activity log di Salesforce.',
    features: [
      { icon: 'ti-user-plus', label: 'Lead Creation' },
      { icon: 'ti-activity', label: 'Activity Log' },
      { icon: 'ti-report-analytics', label: 'Laporan Sinkron' },
    ],
    configFields: [
      { key: 'sf_instance', label: 'Instance URL', placeholder: 'https://yourcompany.salesforce.com', type: 'text' },
      { key: 'sf_client_id', label: 'Consumer Key', placeholder: 'xxxxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'sf_client_secret', label: 'Consumer Secret', placeholder: '••••••••••••', type: 'password' },
    ],
  },

  /* ── E-COMMERCE ── */
  {
    id: 'tokopedia',
    name: 'Tokopedia',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path d="M6 8.5h12l-.9 11.2a2 2 0 01-2 1.8H8.9a2 2 0 01-2-1.8L6 8.5z" fill="#42B549"/>
      <path d="M9 8.5V6.8a3 3 0 016 0v1.7" stroke="#42B549" stroke-width="1.6" fill="none" stroke-linecap="round"/>
    </svg>`,
    category: 'ecommerce',
    catLabel: 'E-Commerce',
    catIcon: 'ti-shopping-bag',
    status: 'disconnected',
    desc: 'Hubungkan toko Tokopedia Anda agar AI Agent dapat menjawab pertanyaan produk, mengkonfirmasi stok real-time, dan memproses notifikasi pesanan.',
    features: [
      { icon: 'ti-package', label: 'Stok Real-Time' },
      { icon: 'ti-receipt', label: 'Notifikasi Order' },
      { icon: 'ti-robot', label: 'AI Jawab Produk' },
    ],
    configFields: [
      { key: 'tp_shop_id', label: 'Shop ID Tokopedia', placeholder: '12345678', type: 'text' },
      { key: 'tp_client_id', label: 'Client ID (Tokopedia API)', placeholder: 'xxxxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'tp_client_secret', label: 'Client Secret', placeholder: '••••••••••••', type: 'password' },
    ],
  },
  {
    id: 'shopee',
    name: 'Shopee',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#EE4D2D" xmlns="http://www.w3.org/2000/svg">
      <path d="M15.9414 17.9633c.229-1.879-.981-3.077-4.1758-4.0969-1.548-.528-2.277-1.22-2.26-2.1719.065-1.056 1.048-1.825 2.352-1.85a5.2898 5.2898 0 0 1 2.8838.89c.116.072.197.06.263-.039.09-.145.315-.494.39-.62.051-.081.061-.187-.068-.281-.185-.1369-.704-.4149-.983-.5319a6.4697 6.4697 0 0 0-2.5118-.514c-1.909.008-3.4129 1.215-3.5389 2.826-.082 1.1629.494 2.1078 1.73 2.8278.262.152 1.6799.716 2.2438.892 1.774.552 2.695 1.5419 2.478 2.6969-.197 1.047-1.299 1.7239-2.818 1.7439-1.2039-.046-2.2878-.537-3.1278-1.19l-.141-.11c-.104-.08-.218-.075-.287.03-.05.077-.376.547-.458.67-.077.108-.035.168.045.234.35.293.817.613 1.134.775a6.7097 6.7097 0 0 0 2.8289.727 4.9048 4.9048 0 0 0 2.0759-.354c1.095-.465 1.8029-1.394 1.9449-2.554zM11.9986 1.4009c-2.068 0-3.7539 1.95-3.8329 4.3899h7.6657c-.08-2.44-1.765-4.3899-3.8328-4.3899zm7.8516 22.5981-.08.001-15.7843-.002c-1.074-.04-1.863-.91-1.971-1.991l-.01-.195L1.298 6.2858a.459.459 0 0 1 .45-.494h4.9748C6.8448 2.568 9.1607 0 11.9996 0c2.8388 0 5.1537 2.5689 5.2757 5.7898h4.9678a.459.459 0 0 1 .458.483l-.773 15.5883-.007.131c-.094 1.094-.979 1.9769-2.0709 2.0059z"/>
    </svg>`,
    category: 'ecommerce',
    catLabel: 'E-Commerce',
    catIcon: 'ti-shopping-cart',
    status: 'disconnected',
    desc: 'Integrasikan Shopee Open Platform untuk mengotomasi respon chat Shopee, cek status pesanan pelanggan, dan sinkronisasi katalog produk ke AI Knowledge Base.',
    features: [
      { icon: 'ti-robot', label: 'Auto Chat Reply' },
      { icon: 'ti-package', label: 'Status Pesanan' },
      { icon: 'ti-list-details', label: 'Sinkron Katalog' },
    ],
    configFields: [
      { key: 'sp_partner_id', label: 'Partner ID', placeholder: '1234567', type: 'text' },
      { key: 'sp_partner_key', label: 'Partner Key', placeholder: '••••••••••••', type: 'password' },
      { key: 'sp_shop_id', label: 'Shop ID', placeholder: '87654321', type: 'text' },
    ],
  },

  /* ── PAYMENT ── */
  {
    id: 'midtrans',
    name: 'Midtrans',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect x="2" y="5" width="20" height="14" rx="2.2" fill="#0A6CFF"/>
      <rect x="2" y="9" width="20" height="3" fill="#ffffff" opacity="0.9"/>
      <rect x="5" y="14.2" width="5" height="1.8" rx="0.9" fill="#ffffff" opacity="0.9"/>
    </svg>`,
    category: 'payment',
    catLabel: 'Pembayaran',
    catIcon: 'ti-credit-card',
    status: 'disconnected',
    desc: 'Hubungkan Midtrans Payment Gateway agar AI Agent bisa mengirimkan link pembayaran langsung di dalam percakapan dan mengkonfirmasi status transaksi secara otomatis.',
    features: [
      { icon: 'ti-link', label: 'Payment Link di Chat' },
      { icon: 'ti-circle-check', label: 'Konfirmasi Otomatis' },
      { icon: 'ti-receipt-2', label: 'Bukti Bayar AI' },
    ],
    configFields: [
      { key: 'mt_server_key', label: 'Server Key', placeholder: 'SB-Mid-server-xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'mt_client_key', label: 'Client Key', placeholder: 'SB-Mid-client-xxxxxxxxxxxxxxxx', type: 'text' },
      { key: 'mt_env', label: 'Environment', placeholder: 'Production / Sandbox', type: 'text' },
    ],
  },
  {
    id: 'xendit',
    name: 'Xendit',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#4573FF" xmlns="http://www.w3.org/2000/svg">
      <path d="M11.781 2.743H7.965l-5.341 9.264 5.341 9.263-1.312 2.266L0 12.007 6.653.464h6.454l-1.326 2.279Zm-5.128 2.28 1.312-2.28L9.873 6.03 8.561 8.296 6.653 5.023Zm9.382-2.28 1.312 2.28L7.965 21.27l-1.312-2.279 9.382-16.248Zm-5.128 20.793 1.298-2.279h3.83L14.1 17.931l1.312-2.267 1.926 3.337 4.038-6.994-5.341-9.264L17.347.464 24 12.007l-6.653 11.529h-6.44Z"/>
    </svg>`,
    category: 'payment',
    catLabel: 'Pembayaran',
    catIcon: 'ti-cash',
    status: 'disconnected',
    desc: 'Integrasikan Xendit untuk pembayaran otomatis via VA bank, QRIS, e-wallet, dan kartu kredit. Link pembayaran dikirim AI langsung dalam percakapan WhatsApp.',
    features: [
      { icon: 'ti-qrcode', label: 'QRIS & E-Wallet' },
      { icon: 'ti-building-bank', label: 'Virtual Account' },
      { icon: 'ti-link', label: 'Auto Payment Link' },
    ],
    configFields: [
      { key: 'xn_secret_key', label: 'Secret API Key', placeholder: 'xnd_production_xxxxxxxxxxxxxxxx', type: 'password' },
      { key: 'xn_webhook', label: 'Webhook Token (Xendit Dashboard)', placeholder: 'xnd_development_xxxxxx', type: 'text' },
    ],
  },

  /* ── TOOLS ── */
  {
    id: 'googlecalendar',
    name: 'Google Calendar',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#4285F4" xmlns="http://www.w3.org/2000/svg">
      <path d="M18.316 5.684H24v12.632h-5.684V5.684zM5.684 24h12.632v-5.684H5.684V24zM18.316 5.684V0H1.895A1.894 1.894 0 0 0 0 1.895v16.421h5.684V5.684h12.632zm-7.207 6.25v-.065c.272-.144.5-.349.687-.617s.279-.595.279-.982c0-.379-.099-.72-.3-1.025a2.05 2.05 0 0 0-.832-.714 2.703 2.703 0 0 0-1.197-.257c-.6 0-1.094.156-1.481.467-.386.311-.65.671-.793 1.078l1.085.452c.086-.249.224-.461.413-.633.189-.172.445-.257.767-.257.33 0 .602.088.816.264a.86.86 0 0 1 .322.703c0 .33-.12.589-.36.778-.24.19-.535.284-.886.284h-.567v1.085h.633c.407 0 .748.109 1.02.327.272.218.407.499.407.843 0 .336-.129.614-.387.832s-.565.327-.924.327c-.351 0-.651-.103-.897-.311-.248-.208-.422-.502-.521-.881l-1.096.452c.178.616.505 1.082.977 1.401.472.319.984.478 1.538.477a2.84 2.84 0 0 0 1.293-.291c.382-.193.684-.458.902-.794.218-.336.327-.72.327-1.149 0-.429-.115-.797-.344-1.105a2.067 2.067 0 0 0-.881-.689zm2.093-1.931l.602.913L15 10.045v5.744h1.187V8.446h-.827l-2.158 1.557zM22.105 0h-3.289v5.184H24V1.895A1.894 1.894 0 0 0 22.105 0zm-3.289 23.5l4.684-4.684h-4.684V23.5zM0 22.105C0 23.152.848 24 1.895 24h3.289v-5.184H0v3.289z"/>
    </svg>`,
    category: 'tools',
    catLabel: 'Tools',
    catIcon: 'ti-calendar-event',
    status: 'disconnected',
    desc: 'Sinkronisasi Google Calendar dengan fitur Appointment Indotrading AI. AI Agent dapat menjadwalkan meeting, mengecek ketersediaan slot, dan mengirim reminder otomatis.',
    features: [
      { icon: 'ti-calendar-plus', label: 'Buat Event AI' },
      { icon: 'ti-clock', label: 'Cek Ketersediaan' },
      { icon: 'ti-bell', label: 'Reminder Otomatis' },
    ],
    configFields: [
      { key: 'gc_client_id', label: 'Google Client ID', placeholder: 'xxxxxxxx.apps.googleusercontent.com', type: 'text' },
      { key: 'gc_client_secret', label: 'Client Secret', placeholder: 'GOCSPX-xxxxxxxxxxxxxxxx', type: 'password' },
    ],
  },
  {
    id: 'zapier',
    name: 'Zapier / n8n',
    icon: `<svg width="18" height="18" viewBox="0 0 24 24" fill="#FF4F00" xmlns="http://www.w3.org/2000/svg">
      <path d="M4.157 0A4.151 4.151 0 0 0 0 4.161v15.678A4.151 4.151 0 0 0 4.157 24h15.682A4.152 4.152 0 0 0 24 19.839V4.161A4.152 4.152 0 0 0 19.839 0H4.157Zm10.61 8.761h.03a.577.577 0 0 1 .23.038.585.585 0 0 1 .201.124.63.63 0 0 1 .162.431.612.612 0 0 1-.162.435.58.58 0 0 1-.201.128.58.58 0 0 1-.23.042.529.529 0 0 1-.235-.042.585.585 0 0 1-.332-.328.559.559 0 0 1-.038-.235.613.613 0 0 1 .17-.431.59.59 0 0 1 .405-.162Zm2.853 1.572c.03.004.061.004.095.004.325-.011.646.064.937.219.238.144.431.355.552.609.128.279.189.582.185.888v.193a2 2 0 0 1 0 .219h-2.498c.003.227.075.45.204.642a.78.78 0 0 0 .646.265.714.714 0 0 0 .484-.136.642.642 0 0 0 .23-.318l.915.257a1.398 1.398 0 0 1-.28.537c-.14.159-.321.284-.521.355a2.234 2.234 0 0 1-.836.136 1.923 1.923 0 0 1-1.001-.245 1.618 1.618 0 0 1-.665-.703 2.221 2.221 0 0 1-.227-1.036 1.95 1.95 0 0 1 .48-1.398 1.9 1.9 0 0 1 1.3-.488Zm-9.607.023c.162.004.325.026.48.079.207.065.4.174.563.314.26.302.393.692.366 1.088v2.276H8.53l-.109-.711h-.065c-.064.163-.155.31-.272.439a1.122 1.122 0 0 1-.374.264 1.023 1.023 0 0 1-.453.083 1.334 1.334 0 0 1-.866-.264.965.965 0 0 1-.329-.801.993.993 0 0 1 .076-.431 1.02 1.02 0 0 1 .242-.363 1.478 1.478 0 0 1 1.043-.303h.952v-.181a.696.696 0 0 0-.136-.454.553.553 0 0 0-.438-.154.695.695 0 0 0-.378.086.48.48 0 0 0-.193.254l-.99-.144a1.26 1.26 0 0 1 .257-.563c.14-.174.321-.302.533-.378.261-.091.54-.136.82-.129.053-.003.106-.007.163-.007Zm4.384.007c.174 0 .347.038.506.114.182.083.34.211.458.374.257.423.377.911.351 1.406a2.53 2.53 0 0 1-.355 1.448 1.148 1.148 0 0 1-1.009.517c-.204 0-.401-.045-.582-.136a1.052 1.052 0 0 1-.48-.457 1.298 1.298 0 0 1-.114-.234h-.045l.004 1.784h-1.059v-4.713h.904l.117.805h.057c.068-.208.177-.401.328-.56a1.129 1.129 0 0 1 .843-.344h.076v-.004Zm7.559.084h.903l.113.805h.053a1.37 1.37 0 0 1 .235-.484.813.813 0 0 1 .313-.242.82.82 0 0 1 .39-.076h.234v1.051h-.401a.662.662 0 0 0-.313.008.623.623 0 0 0-.272.155.663.663 0 0 0-.174.26.683.683 0 0 0-.027.314v1.875h-1.054v-3.666Zm-17.515.003h3.262v.896L3.73 13.104l.034.113h1.973l.042.9H2.4v-.9l1.931-1.754-.045-.117H2.441v-.896Zm11.815 0h1.055v3.659h-1.055V10.45Zm3.443.684.019.016a.69.69 0 0 0-.351.045.756.756 0 0 0-.287.204c-.11.155-.174.336-.189.522h1.545c-.034-.526-.257-.787-.74-.787h.003Zm-5.718.163c-.026 0-.057 0-.083.004a.78.78 0 0 0-.31.053.746.746 0 0 0-.257.189 1.016 1.016 0 0 0-.204.695v.064c-.015.257.057.507.204.711a.634.634 0 0 0 .253.196.638.638 0 0 0 .314.061.644.644 0 0 0 .578-.265c.14-.223.204-.48.189-.74a1.216 1.216 0 0 0-.181-.711.677.677 0 0 0-.503-.257Zm-4.509 1.266a.464.464 0 0 0-.268.102.373.373 0 0 0-.114.276c0 .053.008.106.027.155a.375.375 0 0 0 .087.132.576.576 0 0 0 .397.11v.004a.863.863 0 0 0 .563-.182.573.573 0 0 0 .211-.457v-.14h-.903Z"/>
    </svg>`,
    category: 'tools',
    catLabel: 'Tools',
    catIcon: 'ti-bolt',
    status: 'disconnected',
    desc: 'Gunakan Zapier atau n8n untuk mengotomasi workflow lintas platform. Setiap event dari AI Agent (lead baru, pesan masuk, deal closed) dapat memicu aksi di 5000+ aplikasi.',
    features: [
      { icon: 'ti-webhook', label: 'Webhook Trigger' },
      { icon: 'ti-arrows-exchange', label: '5000+ Aplikasi' },
      { icon: 'ti-cpu', label: 'Custom Workflow' },
    ],
    configFields: [
      { key: 'zap_webhook_url', label: 'Webhook URL (dari Zapier/n8n)', placeholder: 'https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/', type: 'text' },
      { key: 'zap_secret', label: 'Secret Header (opsional)', placeholder: 'my-webhook-secret', type: 'text' },
    ],
  },
];

// ── STATE ──────────────────────────────────────────────────────
let igState = {
  category: 'semua',
  query: '',
  activeModal: null,
  disconnectTarget: null,
};

// ── CATEGORY LABELS ────────────────────────────────────────────
const IG_CAT_LABEL = {
  messaging: 'Pesan & Chat',
  crm: 'CRM',
  ecommerce: 'E-Commerce',
  payment: 'Pembayaran',
  tools: 'Tools & Otomasi',
};

// ── FILTER ─────────────────────────────────────────────────────
function igFilterCategory(btn, cat) {
  document.querySelectorAll('.ig-ftab').forEach(b => b.classList.remove('active'));
  btn.classList.add('active');
  igState.category = cat;
  igRender();
}

function igGetFiltered() {
  return IG_DATA.filter(item => {
    const matchCat = igState.category === 'semua' || item.category === igState.category;
    const q = igState.query.toLowerCase();
    const matchQ = !q || item.name.toLowerCase().includes(q) ||
                        item.desc.toLowerCase().includes(q) ||
                        item.catLabel.toLowerCase().includes(q);
    return matchCat && matchQ;
  });
}

// ── RENDER ─────────────────────────────────────────────────────
// Selaraskan status kartu Telegram dengan token yang tersimpan di browser
// (diatur lewat telegram-token.js). Server.js tidak lagi jadi sumber .env,
// jadi status "connected" di kartu ini mengikuti ada/tidaknya token lokal.
function igSyncTelegramStatus() {
  const item = IG_DATA.find(i => i.id === 'telegram');
  if (!item) return;
  const token = (typeof tgGetToken === 'function') ? tgGetToken() : '';
  if (token) {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: 'Bot Telegram (token tersimpan di browser ini)',
        since: '—',
        msgs: '—',
        lastStatus: '✅ Token aktif',
      };
    }
  } else {
    item.status = 'disconnected';
    delete item.connectedInfo;
    delete item.stats;
  }
}

// Selaraskan status kartu WhatsApp Business (WABA) dengan kredensial yang
// tersimpan di browser (diatur lewat waba-token.js). Sejajar dengan
// igSyncTelegramStatus() di atas.
function igSyncWabaStatus() {
  const item = IG_DATA.find(i => i.id === 'whatsapp');
  if (!item) return;
  const token   = (typeof wbGetToken === 'function') ? wbGetToken() : '';
  const phoneId = (typeof wbGetPhoneId === 'function') ? wbGetPhoneId() : '';
  if (token && phoneId) {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: `Phone Number ID: ${phoneId}`,
        since: '—',
        msgs: '—',
        lastStatus: '✅ Kredensial aktif',
      };
    }
  } else {
    item.status = 'disconnected';
    delete item.connectedInfo;
    delete item.stats;
  }
}

function igRender() {
  igSyncTelegramStatus();
  igSyncWabaStatus();
  igState.query = (document.getElementById('ig-search')?.value || '').trim();

  const filtered = igGetFiltered();
  const active       = filtered.filter(i => i.status === 'connected');
  const notConnected = filtered.filter(i => i.status !== 'connected');

  // Sections visibility
  const secActive = document.getElementById('ig-section-active');
  const secAll    = document.getElementById('ig-section-all');
  const emptyEl   = document.getElementById('ig-empty');

  if (filtered.length === 0) {
    if (secActive) secActive.style.display = 'none';
    if (secAll)    secAll.style.display    = 'none';
    if (emptyEl)   emptyEl.style.display   = 'flex';
    return;
  }

  if (emptyEl) emptyEl.style.display = 'none';

  // Active section
  if (secActive) {
    secActive.style.display = active.length ? 'flex' : 'none';
    const countEl = document.getElementById('ig-active-count');
    if (countEl) countEl.textContent = `${active.length} terhubung`;
    const grid = document.getElementById('ig-grid-active');
    if (grid) grid.innerHTML = active.map(igCardHTML).join('');
  }

  // All integrations (not connected or pending)
  if (secAll) {
    secAll.style.display = notConnected.length ? 'flex' : 'none';
    const countEl = document.getElementById('ig-all-count');
    if (countEl) countEl.textContent = `${notConnected.length} tersedia`;
    const grid = document.getElementById('ig-grid-all');
    if (grid) grid.innerHTML = notConnected.map(igCardHTML).join('');
  }

  // Update stat pills in banner
  const allData = IG_DATA;
  const connectedCount   = allData.filter(i => i.status === 'connected').length;
  const pendingCount     = allData.filter(i => i.status === 'pending').length;
  const disconnectedCount = allData.filter(i => i.status === 'disconnected').length;
  const cEl = document.getElementById('ig-count-connected');
  const pEl = document.getElementById('ig-count-pending');
  const dEl = document.getElementById('ig-count-disconnected');
  if (cEl) cEl.textContent = connectedCount;
  if (pEl) pEl.textContent = pendingCount;
  if (dEl) dEl.textContent = disconnectedCount;
}

// ── CARD HTML ──────────────────────────────────────────────────
function igCardHTML(item) {
  const statusHTML = igStatusBadge(item.status);
  const cardClass  = item.status === 'connected' ? 'ig-card-connected'
                   : item.status === 'pending'   ? 'ig-card-pending' : '';

  // Feature pills (max 3 shown)
  const featurePills = item.features.slice(0, 3).map(f =>
    `<span class="ig-feat-pill"><i class="ti ${f.icon}"></i>${f.label}</span>`
  ).join('');

  // Stats for connected
  let statsHTML = '';
  if (item.status === 'connected' && item.stats) {
    statsHTML = `<div class="ig-card-stats">
      ${item.stats.map(s => `
        <div class="ig-cstat">
          <div class="ig-cstat-val">${s.val}</div>
          <div class="ig-cstat-label">${s.label}</div>
        </div>
      `).join('')}
    </div>`;
  }

  // CTA button
  let ctaHTML = '';
  if (item.status === 'connected') {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-green" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-settings"></i> Kelola</button>`;
  } else if (item.status === 'pending') {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-outline" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-clock"></i> Lihat Status</button>`;
  } else {
    ctaHTML = `<button class="ig-btn-connect ig-btn-connect-red" onclick="event.stopPropagation();igOpenModal('${item.id}')"><i class="ti ti-plug-connected"></i> Hubungkan</button>`;
  }

  return `
  <div class="ig-card ${cardClass}" onclick="igOpenModal('${item.id}')">
    <div class="ig-card-top">
      <div class="ig-card-logo-wrap">
        <div class="ig-card-logo">${item.icon}</div>
        <div>
          <div class="ig-card-name">${item.name}</div>
          <div class="ig-card-cat"><i class="ti ${item.catIcon}"></i>${item.catLabel}</div>
        </div>
      </div>
      ${statusHTML}
    </div>
    ${statsHTML}
    <div class="ig-card-desc">${item.desc}</div>
    <div class="ig-card-footer">
      <div class="ig-card-features">${featurePills}</div>
      ${ctaHTML}
    </div>
  </div>`;
}

function igStatusBadge(status) {
  if (status === 'connected') {
    return `<span class="ig-status ig-status-connected">Terhubung</span>`;
  } else if (status === 'pending') {
    return `<span class="ig-status ig-status-pending"><i class="ti ti-clock"></i> Menunggu</span>`;
  }
  return `<span class="ig-status ig-status-disconnected"><i class="ti ti-plug-x"></i> Belum</span>`;
}


// ── MODAL ──────────────────────────────────────────────────────
function igOpenModal(id) {
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;
  igState.activeModal = id;

  // Header
  document.getElementById('ig-modal-emoji').innerHTML = item.icon;
  document.getElementById('ig-modal-name').textContent  = item.name;
  document.getElementById('ig-modal-cat-label').textContent = `${item.catLabel} · ${IG_CAT_LABEL[item.category] || item.catLabel}`;

  // Status badge
  document.getElementById('ig-modal-status-badge').innerHTML = igStatusBadge(item.status);

  // Description
  document.getElementById('ig-modal-desc').textContent = item.desc;

  // Config fields
  const configWrap = document.getElementById('ig-modal-config');
  const fieldsEl   = document.getElementById('ig-modal-fields');
  if (item.id === 'telegram') {
    // Telegram punya modal konfigurasi token khusus (tg-token-modal, lihat
    // telegram-token.js) dengan test koneksi & penyimpanan ke backend —
    // jadi tidak pakai field generic di sini.
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = `
      <div class="ig-field-group">
        <div class="ig-field-label" style="margin-bottom:6px">
          ${item.status === 'connected' ? 'Token Bot tersimpan di browser ini.' : 'Belum ada token Bot yang terhubung.'}
        </div>
        <button type="button" class="ig-btn-primary" style="width:100%;justify-content:center"
                onclick="igCloseModal(); if(typeof tgOpenModal==='function') tgOpenModal();">
          <i class="ti ti-brand-telegram"></i> ${item.status === 'connected' ? 'Kelola Token Telegram' : 'Atur Token Telegram'}
        </button>
      </div>
    `;
  } else if (item.id === 'whatsapp') {
    // WhatsApp Business (WABA) punya modal konfigurasi kredensial khusus
    // (wb-token-modal, lihat waba-token.js) dengan test koneksi & penyimpanan
    // ke backend — sejajar dengan pola Telegram di atas, bukan field generic.
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = `
      <div class="ig-field-group">
        <div class="ig-field-label" style="margin-bottom:6px">
          ${item.status === 'connected' ? 'Kredensial WABA tersimpan di browser ini.' : 'Belum ada kredensial WABA yang terhubung.'}
        </div>
        <button type="button" class="ig-btn-primary" style="width:100%;justify-content:center"
                onclick="igCloseModal(); if(typeof wbOpenModal==='function') wbOpenModal();">
          <i class="ti ti-brand-whatsapp"></i> ${item.status === 'connected' ? 'Kelola Kredensial WABA' : 'Atur Kredensial WABA'}
        </button>
      </div>
    `;
  } else if (item.status !== 'connected' && item.configFields?.length) {
    configWrap.style.display = 'flex';
    fieldsEl.innerHTML = item.configFields.map(f => `
      <div class="ig-field-group">
        <div class="ig-field-label">${f.label}</div>
        <input class="ig-field-input" type="${f.type || 'text'}" placeholder="${f.placeholder}" id="igf-${f.key}" />
      </div>
    `).join('');
  } else {
    configWrap.style.display = 'none';
    fieldsEl.innerHTML = '';
  }

  // Connected info
  const connInfoWrap = document.getElementById('ig-modal-connected-info');
  if (item.status === 'connected' && item.connectedInfo) {
    connInfoWrap.style.display = 'block';
    document.getElementById('ig-ci-account').textContent = item.connectedInfo.account;
    document.getElementById('ig-ci-since').textContent   = item.connectedInfo.since;
    document.getElementById('ig-ci-msgs').textContent    = item.connectedInfo.msgs;
    document.getElementById('ig-ci-last').textContent    = item.connectedInfo.lastStatus;
  } else {
    connInfoWrap.style.display = 'none';
  }

  // Features
  document.getElementById('ig-modal-features').innerHTML = item.features.map(f =>
    `<span class="ig-feature-tag"><i class="ti ${f.icon}"></i>${f.label}</span>`
  ).join('');

  // CTA button
  const ctaBtn = document.getElementById('ig-modal-cta');
  if (item.status === 'connected') {
    ctaBtn.className = 'ig-btn-danger';
    ctaBtn.innerHTML = '<i class="ti ti-plug-x"></i> Putuskan Koneksi';
  } else if (item.status === 'pending') {
    ctaBtn.className = 'ig-btn-primary';
    ctaBtn.innerHTML = '<i class="ti ti-refresh"></i> Cek Status';
  } else {
    ctaBtn.className = 'ig-btn-primary';
    ctaBtn.innerHTML = '<i class="ti ti-plug-connected"></i> Hubungkan Sekarang';
  }

  document.getElementById('ig-modal').style.display = 'flex';
}

function igCloseModal() {
  document.getElementById('ig-modal').style.display = 'none';
  igState.activeModal = null;
}

function igModalAction() {
  const id   = igState.activeModal;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;

  if (id === 'telegram' && item.status !== 'connected') {
    // Belum konek: langsung buka modal token khusus, bukan simulasi connect generic.
    igCloseModal();
    if (typeof tgOpenModal === 'function') tgOpenModal();
    return;
  }

  if (id === 'whatsapp' && item.status !== 'connected') {
    // Belum konek: langsung buka modal kredensial WABA khusus, bukan simulasi connect generic.
    igCloseModal();
    if (typeof wbOpenModal === 'function') wbOpenModal();
    return;
  }

  if (item.status === 'connected') {
    // Open disconnect confirmation
    igCloseModal();
    igOpenDisconnect(id);
    return;
  }

  if (item.status === 'pending') {
    igShowToast('Memeriksa status koneksi…', 'info');
    setTimeout(() => igShowToast(`Status ${item.name}: Menunggu verifikasi pihak platform.`, 'info'), 1000);
    return;
  }

  // Simulate connect
  const hasFields = item.configFields?.length;
  if (hasFields) {
    // Validate: all fields must be non-empty
    const allFilled = item.configFields.every(f => {
      const el = document.getElementById(`igf-${f.key}`);
      return el && el.value.trim() !== '';
    });
    if (!allFilled) {
      igShowToast('Harap isi semua field konfigurasi terlebih dahulu.', 'error');
      return;
    }
  }

  // Update to pending -> then connected (simulate)
  igCloseModal();
  igShowToast(`Menghubungkan ${item.name}…`, 'info');
  item.status = 'pending';
  igRender();

  setTimeout(() => {
    item.status = 'connected';
    if (!item.connectedInfo) {
      item.connectedInfo = {
        account: 'Akun baru',
        since: new Date().toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }),
        msgs: '0 pesan',
        lastStatus: '✅ Baru terhubung',
      };
    }
    if (!item.stats) {
      item.stats = [
        { val: '0', label: 'Pesan' },
        { val: '—', label: 'AI Handle' },
        { val: '—', label: 'Avg Respons' },
      ];
    }
    igRender();
    igShowToast(`✅ ${item.name} berhasil terhubung!`, 'success');
  }, 2000);
}


// ── DISCONNECT MODAL ───────────────────────────────────────────
function igOpenDisconnect(id) {
  igState.disconnectTarget = id;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;
  document.getElementById('ig-dc-name').textContent = item.name;
  document.getElementById('ig-modal-disconnect').style.display = 'flex';
}

function igCloseDisconnect() {
  document.getElementById('ig-modal-disconnect').style.display = 'none';
  igState.disconnectTarget = null;
}

function igConfirmDisconnect() {
  const id   = igState.disconnectTarget;
  const item = IG_DATA.find(i => i.id === id);
  if (!item) return;

  if (id === 'telegram') {
    // Hapus token dari browser ini sekaligus dari backend (server.js),
    // supaya polling Telegram di server ikut berhenti.
    if (typeof tgClearToken === 'function') tgClearToken();
    const base = (typeof TG_API_BASE !== 'undefined') ? TG_API_BASE : (window.PC_API_BASE || 'http://localhost:3001');
    fetch(`${base}/api/telegram/config`, { method: 'DELETE' }).catch(() => {});
  }

  if (id === 'whatsapp') {
    // Hapus kredensial WABA dari browser ini sekaligus dari backend (server.js).
    if (typeof wbClearConfig === 'function') wbClearConfig();
    const base = (typeof WB_API_BASE !== 'undefined') ? WB_API_BASE : (window.PC_API_BASE || 'http://localhost:3001');
    fetch(`${base}/api/waba/config`, { method: 'DELETE' }).catch(() => {});
  }

  item.status = 'disconnected';
  delete item.connectedInfo;
  delete item.stats;
  igCloseDisconnect();
  igRender();
  igShowToast(`${item.name} telah diputuskan.`, 'error');
}


// ── TOAST ──────────────────────────────────────────────────────
let _igToastTimer = null;
function igShowToast(msg, type = 'info') {
  const el = document.getElementById('ig-toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'ig-toast' + (type === 'success' ? ' success' : type === 'error' ? ' error' : '');
  el.style.display = 'flex';
  clearTimeout(_igToastTimer);
  _igToastTimer = setTimeout(() => { el.style.display = 'none'; }, 3500);
}


// ── INIT ───────────────────────────────────────────────────────
function initIntegrasiPage() {
  igRender();
}

// Auto-init when nav clicks to Integrasi page
document.addEventListener('DOMContentLoaded', () => {
  // Hook into script.js navigation
  const origShowPage = window.showPage;
  if (typeof origShowPage === 'function') {
    window.showPage = function(pageId) {
      origShowPage(pageId);
      if (pageId === 'integrasi-page') {
        initIntegrasiPage();
      }
    };
  } else {
    // Fallback: observe display changes via MutationObserver
    const el = document.getElementById('integrasi-page');
    if (el) {
      const observer = new MutationObserver(() => {
        if (el.style.display !== 'none') initIntegrasiPage();
      });
      observer.observe(el, { attributes: true, attributeFilter: ['style'] });
    }
  }
});