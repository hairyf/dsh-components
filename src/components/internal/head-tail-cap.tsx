/** Head/tail split metrics for a list capped at `maxLines` rows. */
export interface HeadTailCap {
  /** Rows the expanded list would add. */
  readonly hidden: number
  /** Whether the middle is currently folded. */
  readonly capped: boolean
  /** Rows drawn before the fold control. */
  readonly headLines: number
  /** Rows drawn after the fold control. */
  readonly tailLines: number
}

/**
 * Compute the head/tail cap metrics for `total` rows against `maxLines`.
 *
 * Pure arithmetic: the caller slices its own rows with `headLines`/`tailLines`
 * so a block can layer its own concerns (SearchBlock restores a tail file
 * header) on top. `Infinity` as the cap yields an uncapped list.
 * @param total - the list's row count.
 * @param maxLines - the collapsed-height cap in rows.
 * @param expanded - whether the surface is expanded (uncaps the list).
 * @returns the split metrics.
 */
export function headTailCap(total: number, maxLines: number, expanded: boolean): HeadTailCap {
  const hidden = total - maxLines
  const headLines = Math.ceil(maxLines / 2)
  return {
    hidden,
    capped: hidden > 0 && !expanded,
    headLines,
    tailLines: maxLines - headLines,
  }
}
