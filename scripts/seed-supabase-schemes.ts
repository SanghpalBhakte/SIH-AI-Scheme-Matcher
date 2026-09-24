// Syncs the Supabase `schemes` table with data/schemes.ts — the SAME
// file that's still the app's bundled offline fallback (see
// lib/schemes/live-schemes.tsx). Runs automatically after CI passes on
// main (.github/workflows/reseed-supabase.yml), or by hand:
//
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... npx tsx scripts/seed-supabase-schemes.ts
//
// Requires the PROJECT'S SERVICE ROLE KEY (not the public anon key —
// the `schemes` table's RLS policy only grants SELECT to anon/
// authenticated, by design, so a write needs the privileged key).
// Never commit that key or put it in a NEXT_PUBLIC_ variable; it's
// only ever read here, from the environment.
//
// How it syncs (2026-09-24): upsert every scheme, THEN delete rows whose
// id is no longer in data/schemes.ts, THEN read the table back and
// check it matches exactly. It used to delete everything and re-insert,
// which left the table empty in between, and two overlapping runs (e.g.
// two repos reseeding the same project) could collide on duplicate keys.
// Upsert + prune is idempotent, so any number of runs, even at the same
// time, end in the same state.

import { createClient } from '@supabase/supabase-js'
import { schemes } from '../data/schemes'

// Surfaces a failure as a GitHub Actions annotation (visible from the
// run's Checks UI and the public API) in addition to the normal stderr
// line — the raw job log sits behind a short-lived signed URL that some
// networks block, which made failed runs hard to diagnose.
function annotateError(message: string) {
  console.log(`::error::${message.replace(/\n/g, ' ')}`)
  console.error(message)
}

/** JSON with object keys sorted recursively — jsonb stores keys in its own order, so compare canonically. */
function canonical(value: unknown): string {
  return JSON.stringify(value, (_key, v) =>
    v && typeof v === 'object' && !Array.isArray(v)
      ? Object.fromEntries(Object.keys(v).sort().map((k) => [k, (v as Record<string, unknown>)[k]]))
      : v
  )
}

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !serviceKey) {
    annotateError('Set SUPABASE_URL (or NEXT_PUBLIC_SUPABASE_URL) and SUPABASE_SERVICE_ROLE_KEY before running this script.')
    process.exit(1)
  }

  // A common misconfiguration: pasting the public anon key into the
  // service-role slot. Both are JWTs; the role claim tells them apart.
  // (Newer non-JWT "secret" keys have no payload to check — skipped.)
  try {
    const payloadB64 = serviceKey.split('.')[1]
    if (payloadB64) {
      const payload = JSON.parse(Buffer.from(payloadB64, 'base64').toString('utf8'))
      if (payload.role && payload.role !== 'service_role') {
        annotateError(
          `SUPABASE_SERVICE_ROLE_KEY does not look like a service-role key (JWT role claim is "${payload.role}", expected "service_role"). Copy the "service_role" secret key from Supabase → Project Settings → API, not the "anon" public key.`
        )
        process.exit(1)
      }
    }
  } catch {
    // Not a decodable JWT — let Supabase itself accept or reject it below.
  }

  const client = createClient(url, serviceKey, { auth: { persistSession: false } })
  const ids = schemes.map((s) => s.id)
  console.log(`Syncing public.schemes with ${schemes.length} schemes from data/schemes.ts...`)

  // 1. Insert new schemes and overwrite existing ones.
  const rows = schemes.map((scheme) => ({ id: scheme.id, data: scheme, updated_at: new Date().toISOString() }))
  const { error: upsertError } = await client.from('schemes').upsert(rows, { onConflict: 'id' })
  if (upsertError) {
    annotateError(`Failed to upsert schemes: ${upsertError.message} (code: ${upsertError.code ?? 'unknown'}, hint: ${upsertError.hint ?? 'none'})`)
    process.exit(1)
  }

  // 2. Remove schemes that were deleted or renamed in data/schemes.ts.
  const idList = `(${ids.map((id) => `"${id}"`).join(',')})`
  const { error: pruneError, count: pruned } = await client
    .from('schemes')
    .delete({ count: 'exact' })
    .not('id', 'in', idList)
  if (pruneError) {
    annotateError(`Failed to remove stale schemes: ${pruneError.message} (code: ${pruneError.code ?? 'unknown'}, hint: ${pruneError.hint ?? 'none'})`)
    process.exit(1)
  }

  // 3. Read back and prove the table now matches data/schemes.ts exactly.
  const { data: live, error: readError } = await client.from('schemes').select('id, data')
  if (readError || !live) {
    annotateError(`Seeded, but could not read the table back to verify it: ${readError?.message ?? 'no data returned'}`)
    process.exit(1)
  }
  const expected = new Map(schemes.map((s) => [s.id, canonical(s)]))
  const mismatched = live.filter((row: { id: string; data: unknown }) => expected.get(row.id) !== canonical(row.data)).map((r: { id: string }) => r.id)
  const missing = ids.filter((id) => !live.some((row: { id: string }) => row.id === id))
  if (live.length !== schemes.length || mismatched.length || missing.length) {
    annotateError(
      `public.schemes does not match data/schemes.ts after seeding: ${live.length} rows (expected ${schemes.length}); ` +
        `mismatched: ${JSON.stringify(mismatched)}; missing: ${JSON.stringify(missing)}`
    )
    process.exit(1)
  }

  console.log(`Done. ${schemes.length} schemes upserted, ${pruned ?? 0} stale row(s) removed; read-back matches data/schemes.ts exactly.`)
}

main().catch((err) => {
  const detail = err instanceof Error ? (err.stack ?? err.message) : String(err)
  annotateError(`Unhandled error while reseeding schemes: ${detail}`)
  process.exit(1)
})
