/**
 * The round match-score badge on recommendation cards and the scheme
 * details page. "100%" is one readable 14px label (it used to be the
 * number plus a separate 9px "%", below any readable text size).
 */
export function MatchScoreRing({ score }: { score: number }) {
  return (
    <div
      role="img"
      aria-label={`${score} percent match`}
      className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border-2 border-primary/20 bg-primary/5"
    >
      <span className="text-sm font-bold leading-none text-primary" aria-hidden>
        {score}%
      </span>
    </div>
  )
}
