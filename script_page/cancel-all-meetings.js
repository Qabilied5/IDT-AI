/* ================================================================
   cancel-all-meetings.js
   Batalkan SEMUA meeting AKTIF di akun Calendly lewat API — dipakai
   karena halaman "Meetings" di web Calendly tidak punya tombol
   "select all lalu cancel" (bulk action cuma ada di halaman Event Types).

   CARA PAKAI:
     1. Isi CALENDLY_TOKEN di bawah (atau set env var CALENDLY_ACCESS_TOKEN),
        pakai Personal Access Token yang sama dengan yang disimpan lewat
        calendly-token.js.
     2. Jalankan DRY RUN dulu (default, TIDAK membatalkan apa-apa, cuma
        nampilin daftar meeting yang AKAN dibatalkan):
          node cancel-all-meetings.js
     3. Kalau daftarnya sudah benar, jalankan sungguhan dengan flag --confirm:
          node cancel-all-meetings.js --confirm
   ================================================================ */

const CALENDLY_TOKEN = process.env.CALENDLY_ACCESS_TOKEN || 'eyJraWQiOiIxY2UxZTEzNjE3ZGNmNzY2YjNjZWJjY2Y4ZGM1YmFmYThhNjVlNjg0MDIzZjdjMzJiZTgzNDliMjM4MDEzNWI0IiwidHlwIjoiUEFUIiwiYWxnIjoiRVMyNTYifQ.eyJpc3MiOiJodHRwczovL2F1dGguY2FsZW5kbHkuY29tIiwiaWF0IjoxNzg0NjA0MjI5LCJqdGkiOiI5OGNiZWZmOS1hYWQ0LTQ2NTMtYjdhMy01YWVlNjI1MTFmZjUiLCJ1c2VyX3V1aWQiOiJiNDJiYjJhNy05MGYyLTQ2OTMtYmVmNC00M2U3YzE5MDAzMjQiLCJzY29wZSI6ImF2YWlsYWJpbGl0eTpyZWFkIGF2YWlsYWJpbGl0eTp3cml0ZSBldmVudF90eXBlczpyZWFkIGV2ZW50X3R5cGVzOndyaXRlIGxvY2F0aW9uczpyZWFkIHJvdXRpbmdfZm9ybXM6cmVhZCBzaGFyZXM6d3JpdGUgc2NoZWR1bGVkX2V2ZW50czpyZWFkIHNjaGVkdWxlZF9ldmVudHM6d3JpdGUgc2NoZWR1bGluZ19saW5rczp3cml0ZSBncm91cHM6cmVhZCBvcmdhbml6YXRpb25zOnJlYWQgb3JnYW5pemF0aW9uczp3cml0ZSB1c2VyczpyZWFkIGNvbnRhY3RzOnJlYWQgY29udGFjdHM6d3JpdGUgYWN0aXZpdHlfbG9nOnJlYWQgZGF0YV9jb21wbGlhbmNlOndyaXRlIG91dGdvaW5nX2NvbW11bmljYXRpb25zOnJlYWQgd2ViaG9va3M6cmVhZCB3ZWJob29rczp3cml0ZSJ9.-aHd0r--AqZjHlkey4J_Ygrh8NwzkCiTLHtMS2nnMqcYEXmMbJJvaf2lEfBe9rwdaotuNq069u3wWLhQbLSRkg';
const CALENDLY_API_BASE = 'https://api.calendly.com';
const CANCEL_REASON = 'Dibatalkan otomatis — pembersihan data testing';

const isConfirmRun = process.argv.includes('--confirm');

async function calendlyFetch(path, options = {}) {
  const url = path.startsWith('http') ? path : `${CALENDLY_API_BASE}${path}`;
  const res = await fetch(url, {
    ...options,
    headers: {
      Authorization: `Bearer ${CALENDLY_TOKEN}`,
      'Content-Type': 'application/json',
      ...(options.headers || {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Calendly API error ${res.status}: ${JSON.stringify(data)}`);
  }
  return data;
}

async function getMyUserUri() {
  const data = await calendlyFetch('/users/me');
  return data.resource.uri;
}

// Ambil SEMUA scheduled event berstatus 'active' milik user ini, dengan pagination.
async function getAllActiveEvents(userUri) {
  const events = [];
  let pageUrl = `/scheduled_events?user=${encodeURIComponent(userUri)}&status=active&count=100`;

  while (pageUrl) {
    const data = await calendlyFetch(pageUrl);
    events.push(...(data.collection || []));
    pageUrl = data.pagination && data.pagination.next_page ? data.pagination.next_page : null;
  }
  return events;
}

function eventUuidFromUri(uri) {
  return uri.split('/').pop();
}

async function cancelEvent(uuid) {
  return calendlyFetch(`/scheduled_events/${uuid}/cancellation`, {
    method: 'POST',
    body: JSON.stringify({ reason: CANCEL_REASON }),
  });
}

async function main() {
  if (!CALENDLY_TOKEN || CALENDLY_TOKEN === 'PASTE_PERSONAL_ACCESS_TOKEN_DI_SINI') {
    console.error('❌ Isi dulu CALENDLY_TOKEN di bagian atas file, atau set env var CALENDLY_ACCESS_TOKEN.');
    process.exit(1);
  }

  console.log('🔍 Mengambil daftar meeting aktif...');
  const userUri = await getMyUserUri();
  const events = await getAllActiveEvents(userUri);

  if (!events.length) {
    console.log('✅ Tidak ada meeting aktif — tidak ada yang perlu dibatalkan.');
    return;
  }

  console.log(`\nDitemukan ${events.length} meeting aktif:\n`);
  events.forEach((ev, i) => {
    const start = new Date(ev.start_time).toLocaleString('id-ID', { timeZone: 'Asia/Jakarta' });
    const invitee = (ev.event_memberships || []).map((m) => m.user_name).join(', ');
    console.log(`  ${i + 1}. ${ev.name} — ${start} WIB (${invitee || 'tanpa nama'})`);
  });

  if (!isConfirmRun) {
    console.log(`\n⚠️  Ini baru DRY RUN — belum ada yang dibatalkan.`);
    console.log(`   Kalau daftar di atas sudah benar, jalankan ulang dengan:\n`);
    console.log(`     node cancel-all-meetings.js --confirm\n`);
    return;
  }

  console.log(`\n🗑️  Membatalkan ${events.length} meeting...\n`);
  let ok = 0, fail = 0;
  for (const ev of events) {
    const uuid = eventUuidFromUri(ev.uri);
    try {
      await cancelEvent(uuid);
      ok++;
      console.log(`  ✓ Dibatalkan: ${ev.name} (${uuid})`);
    } catch (e) {
      fail++;
      console.error(`  ✕ Gagal batalkan ${ev.name} (${uuid}): ${e.message}`);
    }
  }

  console.log(`\nSelesai. Berhasil: ${ok}, Gagal: ${fail}.`);
}

main().catch((e) => {
  console.error('Error:', e.message);
  process.exit(1);
});