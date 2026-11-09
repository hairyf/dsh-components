import type * as React from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useStyle } from '../../lib/style'

/**
 * Recovered verbatim from the official sheets:
 * - @deepseek-ai/dsh-client-ui-conversation / TodoPanel: .root, .body, .header,
 *   .lead, .title, .progress, .chevron
 * - @deepseek-ai/dsh-client-ui-conversation / QueueDock: .actions
 * - @deepseek-ai/dsh-client-ui-chat / TurnProcessNodeView: the chevron
 *   transition and its rotated state
 */
const CHEVRON_MOTION = `
.chevron {
  transition: transform .1s;
}

.root[data-open] .chevron {
  transform: rotate(180deg);
}
`

const CSS = `.root {
  box-sizing: border-box;
  width: calc(100% - var(--dsh-composer-side-clearance) - var(--dsh-composer-side-clearance) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));
  max-width: calc(var(--dsh-composer-card-max-width) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset) - var(--dsh-composer-dock-inset));
  --dsw-elevation-stroke-color: var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-specific-menu);
  backdrop-filter: var(--dsw-menu-backdrop-filter);
  box-shadow: var(--dsw-elevation-panel);
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  border: 0;
  flex: none;
  margin: 0 auto;
  overflow: hidden;
}

.body {
  flex-direction: column;
  gap: 8px;
  padding: 6px 12px;
  display: flex;
}

.header {
  text-align: left;
  cursor: pointer;
  background: 0 0;
  border: none;
  align-items: center;
  gap: 10px;
  width: 100%;
  padding: 0;
  display: flex;
}

.lead {
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  place-items: center;
  display: grid;
}

.title {
  color: var(--dsw-alias-label-primary);
  flex: none;
  font-size: 13px;
  font-weight: 500;
  line-height: 24px;
}

.progress {
  min-width: 0;
  color: var(--dsw-alias-label-tertiary);
  text-overflow: ellipsis;
  white-space: nowrap;
  flex: auto;
  font-size: 13px;
  font-weight: 400;
  line-height: 20px;
  overflow: hidden;
}

.chevron {
  color: var(--dsw-alias-label-tertiary);
  flex: none;
  place-items: center;
  display: grid;
}

.actions {
  flex: none;
  align-items: center;
  gap: 10px;
  display: flex;
}`

/** Props of {@link Bar}. */
export interface ExpansionBarProps {
  /** Leading glyph, usually an icon at 14–16px. */
  readonly glyph?: React.ReactNode
  /** Primary label of the bar. */
  readonly label?: React.ReactNode
  /** Secondary, muted text after the label; truncates first. */
  readonly objective?: React.ReactNode
  /** Error line replacing the objective, shown in the error colour. */
  readonly error?: React.ReactNode
  /** Trailing actions, kept on one line. */
  readonly actions?: React.ReactNode
  /**
   * Whether the bar can be opened.
   * A bar without this renders a plain heading: no chevron, no button role.
   */
  readonly expandable?: boolean
  /** Open state, meaningful only with `expandable`. */
  readonly expanded?: boolean
  /** Called when the reader toggles the bar. */
  readonly onToggle?: () => void
  /** Label announced on the toggle, e.g. 展开待办. */
  readonly toggleLabel?: string
  /** Revealed content, rendered under the bar. */
  readonly children?: React.ReactNode
}

/**
 * A collapsible bar for surfaces docked above the composer.
 *
 * DSH ships several of these (the queue dock, the todo panel, the goal bar), and
 * they differ only in the content they hold, so this is the shared shell: an
 * official bar, a muted secondary line, optional actions, and a chevron that
 * appears only when there is something to expand.
 * @param props - bar content and expansion state.
 * @returns the bar, plus its content when expanded.
 */
export function Bar(props: ExpansionBarProps): React.JSX.Element {
  const { glyph, label, objective, error, actions, expandable = false, expanded = false, onToggle, toggleLabel, children } = props
  const s = useStyle('expansion-bar', CSS + CHEVRON_MOTION)

  const inner = (
    <>
      {glyph === undefined
        ? null
        : <span className={s.lead}>{glyph}</span>}
      {label === undefined
        ? null
        : <span className={s.title}>{label}</span>}
      {error === undefined
        ? null
        : <span className={s.progress}>{error}</span>}
      {error === undefined && objective !== undefined
        ? <span className={s.progress}>{objective}</span>
        : null}
      {actions === undefined
        ? null
        : <span className={s.actions}>{actions}</span>}
      {expandable
        ? (
            <span className={s.chevron} aria-hidden="true">
              <IconChevronDownOutlineRegular size={14} />
            </span>
          )
        : null}
    </>
  )

  return (
    <section
      className={s.root}
      data-open={expandable && expanded
        ? ''
        : undefined}
    >
      <div className={s.body}>
        {expandable
          ? (
              <button
                type="button"
                className={s.header}
                aria-expanded={expanded}
                aria-label={toggleLabel}
                onClick={onToggle}
              >
                {inner}
              </button>
            )
          : <div className={s.header}>{inner}</div>}
        {expandable && expanded
          ? children
          : null}
      </div>
    </section>
  )
}
