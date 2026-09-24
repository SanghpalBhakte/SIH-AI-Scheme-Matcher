// Best-effort write-through backups to Supabase, layered on top of
// this app's existing localStorage persistence — never a replacement
// for it. Every function here is fire-and-forget from its caller's
// point of view: localStorage remains the ONLY thing the UI actually
// reads from (see lib/assessment/persistence.ts, lib/schemes/saved-
// schemes-context.tsx, lib/schemes/checklist-persistence.ts), and a
// visitor with Supabase unconfigured, offline, or mid-outage sees zero
// difference — same contract the app's earlier, since-removed
// Supabase integration used for these same three kinds of data.
//
// Callers should invoke these without awaiting (`.catch(() => {})` at
// most) so a slow or failed sync never delays the local save the user
// is actually waiting on.

import type { SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseClient } from './client'
import { getVisitorId } from './anon-session'
import type { DraftEntrepreneurProfile } from '@/lib/matching/types'

async function withVisitor(): Promise<{ client: SupabaseClient; visitorId: string } | null> {
  const client = await getSupabaseClient()
  if (!client) return null
  const visitorId = await getVisitorId()
  if (!visitorId) return null
  return { client, visitorId }
}

/** Mirrors the in-progress assessment draft. Silently no-ops on any failure. */
export async function syncAssessmentProfile(profile: DraftEntrepreneurProfile, stepIndex: number): Promise<void> {
  const ctx = await withVisitor()
  if (!ctx) return
  try {
    await ctx.client.from('assessment_profiles').upsert({
      visitor_id: ctx.visitorId,
      profile,
      step_index: stepIndex,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // best-effort — localStorage already has this
  }
}

/** Deletes the mirrored draft (used by "Start over"). Silently no-ops on any failure. */
export async function deleteAssessmentProfile(): Promise<void> {
  // Only an EXISTING anonymous session can have a backup row — never
  // sign a visitor in just to delete nothing.
  const client = await getSupabaseClient()
  if (!client) return
  try {
    const { data } = await client.auth.getSession()
    const visitorId = data.session?.user?.id
    if (!visitorId) return
    await client.from('assessment_profiles').delete().eq('visitor_id', visitorId)
  } catch {
    // best-effort — the local copy is already gone
  }
}

/** Mirrors the current saved/bookmarked scheme id list. Silently no-ops on any failure. */
export async function syncSavedSchemes(ids: string[]): Promise<void> {
  const ctx = await withVisitor()
  if (!ctx) return
  try {
    // Replace-the-set semantics: delete this visitor's rows, then
    // re-insert the current list, inside one best-effort pass. A
    // partial failure just leaves the next save to reconcile it —
    // localStorage stays the source of truth regardless.
    await ctx.client.from('saved_schemes').delete().eq('visitor_id', ctx.visitorId)
    if (ids.length > 0) {
      await ctx.client.from('saved_schemes').insert(ids.map((schemeId) => ({ visitor_id: ctx.visitorId, scheme_id: schemeId })))
    }
  } catch {
    // best-effort — localStorage already has this
  }
}

/** Mirrors one scheme's checklist progress. Silently no-ops on any failure. */
export async function syncChecklist(schemeId: string, completed: string[]): Promise<void> {
  const ctx = await withVisitor()
  if (!ctx) return
  try {
    await ctx.client.from('checklist_progress').upsert({
      visitor_id: ctx.visitorId,
      scheme_id: schemeId,
      completed,
      updated_at: new Date().toISOString(),
    })
  } catch {
    // best-effort — localStorage already has this
  }
}
