import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-primitives/lib/ShortcutKeys.module.css */
.keys {
  display: inline-flex;
  flex: none;
  align-items: center;
  gap: 3px;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 16px;
  white-space: nowrap;
}

.key {
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  font: inherit;
}

.tooltip { color: inherit; font-size: 11px; line-height: 14px; gap: 2px; }
.tooltip .key {
  min-width: 16px;
  height: 16px;
  padding: 0 2px;
  border-radius: 4px;
  border: 0;
  background: var(--dsw-alias-tooltip-key-bg);
}

.separator { font: inherit; }

.joined { box-sizing: border-box; height: 16px; padding: 0 4px; border-radius: 4px; background: var(--dsw-alias-tooltip-key-bg); }
.joined .key { min-width: 0; height: auto; padding: 0; border: 0; background: transparent; }
`

/** Props for {@link ShortcutKeys}: the caller-resolved key labels and their presentation. */
export interface ShortcutKeysProps {
  keys: readonly string[]
  variant?: 'plain' | 'tooltip'
  className?: string
}

/**
 * Render one command's keycaps without owning binding defaults or localized copy.
 * Keys render unboxed by default, or as tooltip keycaps with plus-separated
 * combinations grouped into one cap.
 */
export function ShortcutKeys({ keys, variant = 'plain', className }: ShortcutKeysProps): React.JSX.Element {
  const s = useStyle('shortcut-keys', CSS)
  return (
    <span
      className={cx(
        s.keys,
        variant === 'tooltip' && s.tooltip,
        variant === 'tooltip' && keys.includes('+') && s.joined,
        className,
      )}
    >
      {keys.map((key, index) => (
        <kbd
          key={index}
          className={key === '+'
            ? s.separator
            : s.key}
        >
          {key}
        </kbd>
      ))}
    </span>
  )
}
