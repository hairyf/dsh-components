import type * as React from 'react'
import { IconChevronDownOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'
import { useState } from 'react'
import { cx, useStyle } from '../../lib/style'
import { Menu } from '../primitives/menu'

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-permission-presets /
 * PermissionSelect.module.css: the trigger, its icon, label and chevron, and
 * the badge an option label can carry in the menu.
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-permission-presets/lib/PermissionSelect.module.css */
.trigger {
  border-radius: var(--dsw-radius-sm);
  min-width: 0;
  max-width: 220px;
  height: 28px;
  color: var(--dsw-alias-label-secondary);
  cursor: pointer;
  background: 0 0;
  border: none;
  outline: none;
  align-items: center;
  gap: 4px;
  padding: 0 4px 0 8px;
  font-size: 13px;
  font-weight: 500;
  line-height: 20px;
  display: inline-flex;
}

@media (hover:hover) {
  .trigger:hover:not(:disabled) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.trigger:focus-visible {
  box-shadow: 0 0 0 2px var(--dsw-focus-ring-color,var(--dsw-alias-state-business-primary));
}

.trigger:disabled {
  color: var(--dsw-alias-label-dimmed);
  cursor: default;
}

.triggerIcon {
  flex: none;
  display: inline-flex;
}

.triggerIcon svg {
  width: 14px;
  height: 14px;
}

.triggerLabel {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.optionLabel {
  align-items: center;
  gap: 4px;
  min-width: 0;
  max-width: 100%;
  display: inline-flex;
}

.optionLabelText {
  text-overflow: ellipsis;
  white-space: nowrap;
  min-width: 0;
  overflow: hidden;
}

.badge {
  color: var(--dsw-alias-label-tertiary);
  letter-spacing: .2px;
  flex: none;
  font-size: 8px;
  font-weight: 500;
  line-height: 10px;
}

.chevron {
  color: var(--dsw-alias-label-caption);
  flex: none;
  transition: transform .12s;
  display: inline-flex;
}

@container (width<=460px) {
  .trigger:has(.triggerIcon) .triggerLabel {
    display: none;
  }
}

.chevronOpen {
  transform: rotate(180deg);
}
`

/** One choice offered by a {@link Select}. */
export interface SelectOption {
  /** Identity the select reports back when this choice is picked. */
  readonly id: string
  /** Caption shown in the trigger and in the menu row. */
  readonly label: React.ReactNode
  /** Longer copy; it becomes the trigger's native tooltip while chosen. */
  readonly description?: string
  /** Glyph shown before the caption. */
  readonly icon?: React.ReactNode
  /** Short suffix printed after the caption in the menu row, such as a state. */
  readonly badge?: string
}

/** Props of {@link Select}. */
export interface SelectProps {
  /** Identity of the chosen option, or a value no option matches. */
  readonly value: string
  /** The choices in display order. */
  readonly options: readonly SelectOption[]
  /** Receives the identity of the choice a reader picked. */
  readonly onChange: (id: string) => void
  /** Open state of a controlled select; omit to let the select hold it. */
  readonly open?: boolean
  /** Called with the open state a reader asks for. */
  readonly onOpenChange?: (open: boolean) => void
  /** Shown instead of the caption while no option matches value. */
  readonly placeholder?: string
  /** Take the trigger out of service entirely. */
  readonly disabled?: boolean
  /** Keep the value fixed: the menu still opens, but no choice can be made. */
  readonly locked?: boolean
  /** Dropdown density: sm renders the compact card, md the standard one. */
  readonly size?: 'sm' | 'md'
}

/**
 * A trigger that opens a menu of options.
 *
 * The trigger shows the chosen option's glyph, caption and a chevron that turns
 * while the menu is open. The menu is a {@link Menu}, so the portalled card,
 * keyboard walk and outside press all come from that primitive. A locked select
 * still shows its choices, which keeps a fixed value readable.
 * @param props - chosen identity, choices and open state.
 * @returns the trigger and its dropdown.
 */
export function Select(props: SelectProps): React.JSX.Element {
  const { value, options, onChange, open, onOpenChange, placeholder, disabled = false, locked = false, size = 'md' } = props
  const s = useStyle('select', CSS)
  const [uncontrolled, setUncontrolled] = useState(false)
  const expanded = open ?? uncontrolled
  const requestOpen = (next: boolean): void => {
    if (open === undefined)
      setUncontrolled(next)
    onOpenChange?.(next)
  }
  const current = options.find(option => option.id === value)
  const items = options.map(option => ({
    id: option.id,
    icon: option.icon,
    disabled: locked,
    label: option.badge === undefined
      ? option.label
      : (
          <span className={s.optionLabel}>
            <span className={s.optionLabelText}>{option.label}</span>
            <span className={s.badge}>{option.badge}</span>
          </span>
        ),
  }))
  return (
    <Menu
      open={expanded && !disabled}
      anchor={(
        <button
          type="button"
          className={s.trigger}
          disabled={disabled}
          aria-haspopup="menu"
          aria-expanded={expanded && !disabled}
          aria-disabled={locked || undefined}
          title={current?.description}
          onClick={() => requestOpen(!expanded)}
        >
          {current?.icon !== undefined && (
            <span className={s.triggerIcon} aria-hidden="true">{current.icon}</span>
          )}
          <span className={s.triggerLabel}>{current?.label ?? placeholder ?? value}</span>
          <span className={cx(s.chevron, expanded && s.chevronOpen)} aria-hidden="true">
            <IconChevronDownOutlineRegular />
          </span>
        </button>
      )}
      items={items}
      selectedId={value}
      compact={size === 'sm'}
      onSelect={(id) => {
        requestOpen(false)
        if (!locked)
          onChange(id)
      }}
      onClose={() => requestOpen(false)}
      portal
    />
  )
}
