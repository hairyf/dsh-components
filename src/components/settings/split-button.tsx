import type * as React from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { useStyle } from '../../lib/style'
import { Menu } from '../primitives/menu'

/** Accessible name of the chevron that opens the secondary menu. */
const MENU_LABEL = 'More options'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-open-in-app /
 * OpenTargetButton.module.css: the split frame, its main button, the chevron,
 * the large variant and the loading skeleton.
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-open-in-app/lib/OpenTargetButton.module.css */
.menuAnchor {
  flex: none;
  align-self: center;
  display: inline-flex;
}

.split {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm);
  height: 24px;
  font-family: var(--dsw-font-family);
  align-items: stretch;
  display: inline-flex;
  overflow: hidden;
}

.main,
.chevron {
  color: var(--dsw-alias-label-primary);
  white-space: nowrap;
  cursor: pointer;
  background: 0 0;
  border: 0;
  justify-content: center;
  align-items: center;
  font-size: 11px;
  line-height: 16px;
  display: inline-flex;
}

.main {
  gap: 4px;
  padding: 3px 5px;
}

.chevron {
  border-left: .5px solid var(--dsw-alias-border-l4);
  color: var(--dsw-alias-label-secondary);
  padding: 3px 4px 3px 3px;
}

.main:focus-visible,
.chevron:focus-visible {
  background: var(--dsw-alias-interactive-bg-hover);
}

@media (hover:hover) {
  .main:hover:not(:disabled),
  .chevron:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.main:disabled,
.chevron:disabled {
  cursor: default;
}

.split[data-size=large] {
  border-radius: var(--dsw-radius-md);
  border-color: var(--dsw-alias-border-l2);
  height: 36px;
}

.split[data-size=large] .main {
  gap: 6px;
  padding: 6px 14px;
  font-size: 14px;
}

.split[data-size=large] .chevron {
  padding: 6px 10px;
}

.skeleton {
  border-radius: var(--dsw-radius-xs);
  background: var(--dsw-alias-interactive-bg-hover);
  flex: none;
  display: inline-block;
}
`

/** One row of a {@link SplitButton} menu. */
export interface SplitButtonItem {
  /** Identity reported while the row is being picked. */
  readonly id: string
  /** Row caption. */
  readonly label: React.ReactNode
  /** Leading glyph of the row. */
  readonly icon?: React.ReactNode
  /** Called after the row is picked, in addition to closing the menu. */
  readonly onSelect?: () => void
}

/** Props of {@link SplitButton}. */
export interface SplitButtonProps {
  /** Glyph of the main button, before its label. */
  readonly icon?: React.ReactNode
  /** Main button caption; also the control's visible text. */
  readonly label: React.ReactNode
  /** Runs the main action. */
  readonly onClick: () => void
  /** Secondary rows; an empty list hides the chevron. */
  readonly items: readonly SplitButtonItem[]
  /** Menu open state of a controlled split button; omit to let it hold its own. */
  readonly menuOpen?: boolean
  /** Called with the menu state a reader asks for. */
  readonly onMenuOpenChange?: (open: boolean) => void
  /** Draw the large frame the sheet provides for prominent actions. */
  readonly prominent?: boolean
  /** Replace the glyph with a skeleton and take both buttons out of service. */
  readonly loading?: boolean
  /** Take both buttons out of service. */
  readonly disabled?: boolean
}

/**
 * One primary action plus a menu of alternatives.
 *
 * The main button runs a single action; the chevron beside it opens the
 * secondary rows in a {@link Menu}. Both buttons disable together while the
 * action is unavailable, and loading swaps the glyph for a skeleton first.
 * @param props - action, glyph, secondary rows and menu state.
 * @returns the split control.
 */
export function SplitButton(props: SplitButtonProps): React.JSX.Element {
  const { icon, label, onClick, items, menuOpen, onMenuOpenChange, prominent = false, loading = false, disabled = false } = props
  const s = useStyle('split-button', CSS)
  const [uncontrolled, setUncontrolled] = useState(false)
  const expanded = menuOpen ?? uncontrolled
  const busy = disabled || loading
  const requestOpen = (next: boolean): void => {
    if (menuOpen === undefined)
      setUncontrolled(next)
    onMenuOpenChange?.(next)
  }
  const frameSize = prominent
    ? 'large'
    : 'compact'
  const glyphSize = prominent
    ? 18
    : 13
  const chevronSize = prominent
    ? 14
    : 10
  const glyph = loading
    ? (
        <span
          className={s.skeleton}
          aria-hidden="true"
          style={{ width: glyphSize, height: glyphSize }}
        />
      )
    : icon
  return (
    <Menu
      className={s.menuAnchor}
      open={expanded && !busy && items.length > 0}
      align="end"
      portal
      dense
      autoFocus
      items={items.map(item => ({ id: item.id, label: item.label, icon: item.icon }))}
      onSelect={(id) => {
        requestOpen(false)
        items.find(item => item.id === id)?.onSelect?.()
      }}
      onClose={() => requestOpen(false)}
      anchor={(
        <div className={s.split} data-size={frameSize}>
          <button type="button" className={s.main} disabled={busy} onClick={onClick}>
            {glyph}
            {label}
          </button>
          {items.length > 0 && (
            <button
              type="button"
              className={s.chevron}
              disabled={busy}
              aria-haspopup="menu"
              aria-expanded={expanded && !busy}
              aria-label={MENU_LABEL}
              onClick={() => requestOpen(!expanded)}
            >
              <IconChevronDownOutlineRegular size={chevronSize} />
            </button>
          )}
        </div>
      )}
    />
  )
}
