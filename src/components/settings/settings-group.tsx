import type * as React from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useId, useState } from 'react'
import { useStyle } from '../../lib/style'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-theme /
 * FontSettingsGroup.module.css (the group and its last-child separator reset)
 * and FontSizeRow.module.css (the titled header row and its expander button).
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-theme/lib/FontSettingsGroup.module.css */
.group:last-child>:last-child,
.group:last-child>:last-child>:last-child {
  border-bottom: 0;
}

/* recovered from @deepseek-ai/dsh-client-ui-theme/lib/FontSizeRow.module.css */
.row {
  border-bottom: .5px solid var(--dsw-alias-border-l2);
  align-items: center;
  gap: 8px;
  padding: 16px 0;
  display: flex;
}

.rowText {
  flex-direction: column;
  flex: 1;
  gap: 4px;
  min-width: 0;
  padding-right: 48px;
  display: flex;
}

.title {
  color: var(--dsw-alias-label-primary);
  font-size: 14px;
  font-weight: 400;
  line-height: 22px;
}

.desc {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  font-weight: 400;
  line-height: 18px;
}

.control {
  align-items: center;
  gap: 8px;
  display: inline-flex;
}

.expander {
  border-radius: var(--dsw-radius-xs);
  width: 24px;
  height: 24px;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
  background: 0 0;
  border: none;
  justify-content: center;
  align-items: center;
  padding: 0;
  display: inline-flex;
}

@media (hover:hover) {
  .expander:hover {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.expander svg {
  transition: transform var(--ds-transition-duration-fast) var(--ds-ease-in-out);
}

.expander[aria-expanded=true] svg {
  transform: rotate(180deg);
}
`

/** Props of {@link SettingsGroup}. */
export interface SettingsGroupProps {
  /** Visible heading of the group. */
  readonly title?: React.ReactNode
  /** Muted line under the heading. */
  readonly description?: React.ReactNode
  /** Rows of the group; each one usually owns its own separator. */
  readonly children?: React.ReactNode
  /** Show an expander in the header that reveals and hides the rows. */
  readonly collapsible?: boolean
  /** Expanded state of a controlled group; omit to let the group hold it. */
  readonly open?: boolean
  /** Called with the state a reader asks for. */
  readonly onOpenChange?: (open: boolean) => void
  /** Accessible name of the expander while the rows are hidden. */
  readonly expandLabel?: string
  /** Accessible name of the expander while the rows are shown. */
  readonly collapseLabel?: string
}

/**
 * A titled group of settings rows, optionally collapsible.
 *
 * The group only supplies a frame and a header: every row inside arrives as
 * children, so it holds any content and knows nothing about what is being
 * configured. A collapsible group starts hidden when the caller does not
 * control the open state.
 * @param props - heading copy, rows and expansion state.
 * @returns the group element.
 */
export function SettingsGroup(props: SettingsGroupProps): React.JSX.Element {
  const { title, description, children, collapsible = false, open, onOpenChange, expandLabel = 'Expand', collapseLabel = 'Collapse' } = props
  const s = useStyle('settings-group', CSS)
  const regionId = useId()
  const [uncontrolled, setUncontrolled] = useState(false)
  const expanded = open ?? uncontrolled
  const toggle = (): void => {
    const next = !expanded
    if (open === undefined)
      setUncontrolled(next)
    onOpenChange?.(next)
  }
  const headed = title !== undefined || description !== undefined || collapsible
  const toggleLabel = expanded
    ? collapseLabel
    : expandLabel
  return (
    <div className={s.group}>
      {headed && (
        <div className={s.row}>
          <div className={s.rowText}>
            {title !== undefined && <div className={s.title}>{title}</div>}
            {description !== undefined && <div className={s.desc}>{description}</div>}
          </div>
          {collapsible && (
            <div className={s.control}>
              <button
                type="button"
                className={s.expander}
                aria-expanded={expanded}
                aria-controls={regionId}
                aria-label={toggleLabel}
                onClick={toggle}
              >
                <IconChevronDownOutlineRegular size={12} />
              </button>
            </div>
          )}
        </div>
      )}
      {collapsible
        ? expanded && <div id={regionId}>{children}</div>
        : children}
    </div>
  )
}
