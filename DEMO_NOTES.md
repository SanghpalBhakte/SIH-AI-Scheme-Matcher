# SIH26092 — Live demo notes

Quick reference for whoever is presenting this prototype. Written after the final
demo-hardening pass (August 2026).

## Recommended demo path (~90 seconds)

1. **Landing (`/`)** — "Find the government schemes you're actually eligible for." Point
   out the scheme count and "Start assessment."
2. **Assessment (`/assessment`)** — Don't fill the form live. Scroll (or click "In a
   hurry? Jump to a demo profile") straight to the three demo profile cards and click
   **"Load this profile."** Recommended: **Rural first-time artisan** (SC woman, rural
   Bihar, handicrafts, idea stage) — it produces several 100% "Likely Eligible" matches,
   which reads well on stage.
3. **Recommendations (`/recommendations`)** — Loading a demo profile jumps straight
   here. Narrate the summary strip (schemes shown / strongest match / missing info),
   then the methodology note ("these are AI-assisted, rule-based matches — here's
   exactly what fed the score").
4. **Scheme details (`/schemes/stand-up-india`)** — Click "View details" on the top
   card. Walk through the match explanation (matched/needs verification/not aligned),
   then scroll to the application checklist and check off a step or two live — it's
   genuinely interactive.
5. **Official link** — Click "View official scheme →" to show it's a real, working
   government URL, not a mock.

Total clicks from landing to a fully explained match: **3** (Start assessment → Load
this profile → View details).

## What changed in this pass

- Fixed inconsistent button casing ("Start Assessment" → "Start assessment") to match
  the rest of the app's sentence-case labels.
- Removed a duplicate heading on the scheme details page: the "Why this matches you"
  section heading repeated the phrase that the match explanation itself opens with.
  Renamed the heading to "Match explanation."
- Removed a near-duplicate disclaimer on the incomplete-assessment gate on
  `/recommendations` — the subheading paraphrased the disclaimer banner directly below
  it. Replaced it with a forward-looking sentence instead.
- Added a fast path off that same incomplete-assessment gate ("Or load a demo profile")
  so a presenter who lands there mid-demo isn't stuck with only "finish the assessment."
- Added a "Jump to a demo profile ↓" shortcut on step 1 of the assessment, since the
  demo profile cards sit below the fold on a typical laptop screen (1366×768) and are
  the intended fast path for a live demo.
- Removed "Dashboard" from the main navigation. That route was reachable in one click
  from every page and showed literal placeholder copy ("Dashboard — not yet defined /
  This route is a placeholder"), which is a real risk in front of judges. The route
  itself still exists (direct URL only) and its copy was also softened in case anyone
  lands on it that way.

## What changed on 2026-09-24 (matching fixes — know these if a judge probes)

- **Stand-Up India now matches women of any category.** The official rule is "SC/ST
  and/or woman entrepreneurs". Before, a General/OBC woman was wrongly shown "Low
  Match". Good live check: a General-category woman sees it as "Likely Eligible".
- **NDFDC (disability loans) is only shown as eligible to persons with disabilities.**
  NDFDC's own FAQ: "Any Indian Citizen with 40% or more disability". If the disability
  question is skipped it says "Insufficient Information" instead of guessing.
- **Ranking rule (one sentence for judges):** "Schemes you pass every hard rule for
  always rank above ones you fail; then by match score; when scores tie, your own
  state's scheme comes first, then schemes built for your group." Before this, state
  schemes (e.g. Bihar MMUY, Maharashtra CMEGP) never reached the top 3.
- **Privacy note on step 1 of the assessment.** Answers are saved in the browser (plus
  a private backup if Supabase is configured); backups are sent once typing pauses,
  not on every keystroke, and "Start over" deletes the backup too.
- **Chat answers "Am I eligible for this scheme?"** (also "do I qualify for PMEGP?",
  "can I apply for this?"). On a scheme page it gives a yes / possibly / can't tell
  yet / probably not answer with the engine's reasons, and there's a matching
  suggestion chip. Nice live moment after "View details".
- **Current demo top 3s:** rural first-time artisan → Stand-Up India, TREAD, DAY-NRLM ·
  urban tech founder → MUDRA Tarun, Startup India Seed Fund, MUDRA Kishore · ST agri
  entrepreneur (Odisha) → Mission Shakti, NSTFDC Term Loan, DAY-NRLM.

## Known, intentional limitations (say these proactively if asked)

- **Progress is saved in this browser.** Both the assessment and each scheme's
  application checklist persist across refresh (localStorage). A cloud backup only
  exists if Supabase is configured.
- **The disclaimer banner appears twice per page** (once inline near the top of
  content, once in the site footer). This is deliberate, not a bug — the inline one is
  contextual, the footer one is a persistent, unmissable baseline.
- **Unused code:** `components/schemes/next-actions.tsx` and
  `data/applicationGuidance.ts` aren't imported anywhere (superseded by
  `application-checklist.tsx`). They don't affect the demo.
- **23 of the 34 schemes list real, sourced documents and/or application steps**; 5 have
  full step-by-step guides (Stand-Up India, PM SVANidhi, PM Vishwakarma, Startup India
  Seed Fund, Delhi Composite Loan Scheme). The other 11 show an honest "not catalogued
  yet, check the official source" fallback rather than invented content: Mahila Udyam
  Nidhi, NSTFDC, NSKFDC, SC-ST Hub, NDFDC, ASPIRE, CGSS, Kudumbashree, Karnataka
  Udyogini, Mission Shakti, AP Startup Grant. That's correct, not broken. For the
  details walkthrough use the **rural first-time artisan** profile (top card: Stand-Up
  India, which has full steps) — the ST agri profile's top card, Mission Shakti, is one
  of the 11.

## Verification

Full ritual (tsc, lint, build, scoring-engine self-check, and a scripted Playwright pass
over the whole demo path at 1366×768) was run after this pass — see the delivery
message for the pass/fail summary.
