import type * as React from 'react'
import { cx, useStyle } from '../../lib/style'

/** Width of the gap the cube row keeps between cubes, in px. */
const GAP = 8

/**
 * Recovered verbatim from @deepseek-ai/dsh-client-ui-theme /
 * AppearanceRow.module.css: the cube row, one cube, and its selected state.
 */
const CSS = `/* recovered from @deepseek-ai/dsh-client-ui-theme/lib/AppearanceRow.module.css */
.cubeRow {
  flex-wrap: wrap;
  align-items: stretch;
  gap: 8px;
  display: flex;
}

.themeCube {
  box-sizing: border-box;
  border: .5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-xl);
  font: inherit;
  color: var(--dsw-alias-label-primary);
  cursor: pointer;
  background: 0 0;
  flex-direction: column;
  flex: 180px;
  justify-content: center;
  align-items: center;
  gap: 4px;
  padding: 20px 32px;
  font-size: 14px;
  line-height: 22px;
  display: flex;
}

@media (hover:hover) {
  .themeCube:hover:not(.selected) {
    background: var(--dsw-alias-interactive-bg-hover);
  }
}

.selected {
  background: var(--dsw-alias-bg-module-platform);
  border-color: var(--dsw-static-neutral-bluish-400);
}

@media (width<=767px) {
  html:not([data-windows-titlebar]):not([data-platform=darwin]) .themeCube {
    flex: 1 1 0;
    padding: 12px 6px;
  }
}
`

/** One cube of an {@link OptionGroup}. */
export interface OptionGroupItem {
  /** Identity the group reports back when this cube is chosen. */
  readonly id: string
  /** Cube caption. */
  readonly label: React.ReactNode
  /** Glyph above the caption. */
  readonly icon?: React.ReactNode
  /** Longer copy, shown as the cube's native tooltip. */
  readonly description?: string
}

/** Props of {@link OptionGroup}. */
export interface OptionGroupProps {
  /** Identity of the cube that is currently chosen. */
  readonly value: string
  /** The cubes in display order. */
  readonly options: readonly OptionGroupItem[]
  /** Receives the identity of a cube the reader pressed. */
  readonly onChange: (id: string) => void
  /** Accessible name of the cube row; the visible title usually sits outside. */
  readonly label?: string
  /** Cubes per line; each cube narrows to one column share. Omit to keep the sheet's cube width. */
  readonly columns?: number
}

/**
 * A row of selectable cubes, each with a glyph and a caption.
 *
 * One cube is pressed at a time. The cubes own no state: the chosen identity
 * arrives as value and a press reports the identity it wants next.
 * @param props - chosen identity, cubes and the change callback.
 * @returns the cube row.
 */
export function OptionGroup(props: OptionGroupProps): React.JSX.Element {
  const { value, options, onChange, label, columns } = props
  const s = useStyle('option-group', CSS)
  const fill: React.CSSProperties | undefined = columns !== undefined && columns > 0
    ? { flexBasis: `calc((100% - ${String(GAP * (columns - 1))}px) / ${String(columns)})` }
    : undefined
  return (
    <div className={s.cubeRow} role="group" aria-label={label}>
      {options.map((option) => {
        const chosen = option.id === value
        return (
          <button
            key={option.id}
            type="button"
            className={cx(s.themeCube, chosen && s.selected)}
            aria-pressed={chosen}
            title={option.description}
            style={fill}
            onClick={() => {
              if (!chosen)
                onChange(option.id)
            }}
          >
            {option.icon}
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
