import type * as React from 'react'

/** Localized copy and accessible names for a head-tail fold control. */
interface FoldToggleLabels {
  /** Aria label while expanded. */
  readonly collapseAria: string
  /** Aria label while capped, given the hidden row count. */
  readonly expandAria: (hidden: number) => string
  /** Visible text while expanded. */
  readonly collapse: string
  /** Visible text while capped, given the hidden row count. */
  readonly expand: (hidden: number) => string
}

/** Props for the shared head-tail fold control. */
export interface FoldToggleProps {
  /** Surface-specific fold row styling. */
  readonly className: string | undefined
  /** Whether the middle is currently revealed. */
  readonly expanded: boolean
  /** Number of hidden rows. */
  readonly hidden: number
  /** Localized copy supplied by the owning block. */
  readonly labels: FoldToggleLabels
  /** Toggle callback owned by the block. */
  readonly onToggle: () => void
}

/**
 * Render the shared head-tail fold control with caller-owned localized copy.
 *
 * Every capped block (diff, read, terminal, search) shares this control, so its
 * copy arrives through labels exactly as in the official package.
 * @returns The accessible expand or collapse button.
 */
export function FoldToggle({ className, expanded, hidden, labels, onToggle }: FoldToggleProps): React.JSX.Element {
  return (
    <button
      type="button"
      className={className}
      aria-expanded={expanded}
      aria-label={expanded
        ? labels.collapseAria
        : labels.expandAria(hidden)}
      onClick={onToggle}
    >
      {expanded
        ? labels.collapse
        : labels.expand(hidden)}
    </button>
  )
}
