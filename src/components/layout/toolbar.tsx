import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/**
 * Recovered from @deepseek-ai/dsh-client-ui-trajectory / TrajectoryToolbar.module.css
 * (verbatim, header comment included). The sheet is the sticky header of a
 * scrolling pane: the bar, its inner row, the action cluster, the two-part
 * switch and the search field the official bar puts on the right edge.
 */
const CSS = `/* @deepseek-ai/dsh-client-ui-trajectory / TrajectoryToolbar.module.css - class hashes removed and reflowed by scripts/extract-dsh-source.mjs. */
.root {
  z-index: 4;
  box-sizing: border-box;
  width: 100%;
  min-height: var(--dsh-trajectory-toolbar-height);
  border-bottom: .5px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  flex: none;
  position: sticky;
  top: 0;
}

.inner {
  box-sizing: border-box;
  width: 100%;
  min-height: var(--dsh-trajectory-toolbar-height);
  flex-wrap: wrap;
  align-items: center;
  gap: 4px 8px;
  padding: 4px 6px;
  display: flex;
}

.actions {
  flex-wrap: wrap;
  flex: 0 auto;
  align-items: center;
  gap: 2px;
  min-width: 0;
  display: flex;
}

.toggle {
  border-radius: var(--dsw-radius-sm);
  height: 20px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: var(--dsw-font-xxs-12);
  background: 0 0;
  border: 0;
  flex: none;
  align-items: center;
  gap: 4px;
  padding: 0 7px;
  display: inline-flex;
}

@media (hover:hover) {
  .toggle:hover {
    color: var(--dsw-alias-label-primary);
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.toggle[aria-pressed=true] {
  color: var(--dsw-alias-label-primary);
  background: var(--dsw-alias-interactive-bg-hover);
}

.toggle:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}

.toggleIcon {
  stroke: currentColor;
  stroke-width: 1.25px;
  stroke-linecap: round;
  stroke-linejoin: round;
  flex: none;
  width: 12px;
  height: 12px;
}

.control {
  box-sizing: border-box;
  width: 88px;
  height: 20px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: var(--dsw-font-xxs-12);
  background: 0 0;
  border: 0;
  border-radius: 0;
  flex: none;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 0 5px;
  display: inline-flex;
}

.control[hidden] {
  display: none;
}

.control[aria-checked=true],
.control[aria-pressed=true] {
  color: var(--dsw-alias-label-primary);
}

@media (hover:hover) {
  .control:hover:not(:disabled) {
    color: var(--dsw-alias-label-primary);
  }
}

.control:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}

.control:disabled {
  color: var(--dsw-alias-label-dimmed);
  cursor: not-allowed;
}

.controlTrack {
  background: var(--dsw-alias-border-l2);
  width: 20px;
  height: 10px;
  transition: background-color .12s var(--ds-ease-in-out);
  border-radius: 5px;
  flex: none;
  display: inline-block;
  position: relative;
}

.controlThumb {
  corner-shape: round;
  background: var(--dsw-alias-bg-layer-1);
  width: 6px;
  height: 6px;
  transition: transform .12s var(--ds-ease-in-out);
  border-radius: 50%;
  position: absolute;
  top: 2px;
  left: 2px;
}

.controlTrack[data-on=true] {
  background: var(--dsw-alias-state-business-primary);
}

.controlTrack[data-on=true] .controlThumb {
  transform: translate(10px);
}

.action {
  border-radius: var(--dsw-radius-sm);
  height: 20px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  font: var(--dsw-font-xxs-12);
  background: 0 0;
  border: 0;
  flex: none;
  align-items: center;
  gap: 4px;
  padding: 0 5px;
  display: inline-flex;
}

@media (hover:hover) {
  .action:hover {
    color: var(--dsw-alias-label-primary);
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.action:focus-visible {
  outline: 1px solid var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
  outline-offset: 1px;
}

.actionIcon {
  color: var(--dsw-alias-label-tertiary);
  font: 14px/14px var(--ds-font-family-code);
}

.search {
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-sm);
  min-width: 84px;
  height: 22px;
  color: var(--dsw-alias-label-caption);
  background: var(--dsw-alias-bg-layer-2);
  flex: 0 164px;
  align-items: center;
  gap: 4px;
  margin-left: auto;
  padding: 0 6px;
  display: flex;
}

@media (hover:hover) {
  .search:hover {
    border-color: var(--dsw-alias-label-caption);
  }
}

.search:focus-within {
  border-color: var(--dsw-alias-state-business-primary);
  background: var(--dsw-alias-bg-layer-1);
}

.searchIcon {
  flex: none;
}

.searchInput {
  width: 100%;
  min-width: 0;
  color: var(--dsw-alias-label-primary);
  font: var(--dsw-font-xxs-12);
  background: 0 0;
  border: 0;
  outline: 0;
  padding: 0;
}

.searchInput::placeholder {
  color: var(--dsw-alias-label-caption);
}

.searchInput::-webkit-search-cancel-button {
  cursor: pointer;
  width: 12px;
  height: 12px;
}
`

/** One switch offered by a {@link Toolbar}. */
export interface ToolbarToggle {
  /** Whether the switch reads as on. */
  readonly checked: boolean
  /** Receives the state a reader asks for. */
  readonly onChange: (checked: boolean) => void
  /** Caption printed before the track. */
  readonly label: React.ReactNode
}

/** Props of {@link Toolbar}. */
export interface ToolbarProps {
  /** Free content placed before the action cluster. */
  readonly children?: React.ReactNode
  /** The action cluster on the left. */
  readonly actions?: React.ReactNode
  /** Optional switch pinned to the right edge. */
  readonly toggle?: ToolbarToggle
  /** Stick the bar to the top of its scroll box; defaults to true. */
  readonly sticky?: boolean
  /** Extra class for layout placement. */
  readonly className?: string
}

/**
 * Render the bar that heads a scrolling pane: actions on the left and an
 * optional switch on the right.
 *
 * The sheet declares only the sticky root, so `sticky={false}` resets the
 * position inline. The switch moves itself to the right edge with an inline
 * auto margin, the edge the official bar reserves for its search field.
 * @param props - bar content, actions and switch.
 * @returns the toolbar element.
 */
export function Toolbar(props: ToolbarProps): React.JSX.Element {
  const { children, actions, toggle, sticky = true, className } = props
  const s = useStyle('toolbar', CSS)
  return (
    <div
      className={cx(s.root, className)}
      role="toolbar"
      style={sticky
        ? undefined
        : { position: 'static' }}
    >
      <div className={s.inner}>
        {children}
        {actions !== undefined && <div className={s.actions}>{actions}</div>}
        {toggle !== undefined && (
          <button
            type="button"
            role="switch"
            aria-checked={toggle.checked}
            className={s.control}
            style={{ marginInlineStart: 'auto' }}
            onClick={() => {
              toggle.onChange(!toggle.checked)
            }}
          >
            <span>{toggle.label}</span>
            <span className={s.controlTrack} data-on={toggle.checked ? 'true' : undefined} aria-hidden="true">
              <span className={s.controlThumb} />
            </span>
          </button>
        )}
      </div>
    </div>
  )
}
