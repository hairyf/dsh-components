import {
  Button,
  FishLogo,
  IconChevronDownOutlineRegular,
  IconCloseFillRegular,
  IconDarkOutlineRegular,
  IconLightOutlineRegular,
  IconSearchOutlineRegular,
} from '@dsh-components'
import { DshProvider } from '@dsh-components/provider'
import { useEffect, useState } from 'react'
import { EXAMPLE_GROUPS, EXAMPLES } from './examples'

/** Props of {@link Sidebar}. */
interface SidebarProps {
  /** Name of the component on screen, marked in the index. */
  current: string | undefined
  /** Open one component. */
  onSelect: (name: string) => void
}

/**
 * The component index, shaped like the DSH sidebar.
 *
 * The shell copies the official metrics (sidebar fill, 8px inline padding, 36px
 * rows, 3px transparent side paint) so the index reads like the product it
 * documents. With 72 components the plain list is unwieldy, hence the filter and
 * the collapsible groups.
 * @param props - the open component and the selection callback.
 * @returns the index column.
 */
function Sidebar(props: SidebarProps): React.JSX.Element {
  const [query, setQuery] = useState('')
  const [collapsed, setCollapsed] = useState<readonly string[]>([])

  const needle = query.trim().toLowerCase()
  const searching = needle !== ''
  const visible = searching
    ? EXAMPLES.filter(example =>
        example.name.toLowerCase().includes(needle)
        || example.summary.toLowerCase().includes(needle))
    : EXAMPLES

  const groups = EXAMPLE_GROUPS
    .map(group => ({
      ...group,
      items: visible.filter(example => example.group === group.id),
    }))
    .filter(group => group.items.length > 0)

  return (
    <nav className="pg-nav" aria-label="组件列表">
      <div className="pg-brand">
        <span className="pg-brand-mark"><FishLogo size={19} /></span>
        <span className="pg-brand-name">dsh-components</span>
        <span className="pg-brand-count">{EXAMPLES.length}</span>
      </div>

      <label className="pg-filter">
        <span className="pg-filter-icon"><IconSearchOutlineRegular size={14} /></span>
        <input
          className="pg-filter-input"
          type="text"
          value={query}
          placeholder="筛选组件"
          aria-label="筛选组件"
          onChange={event => setQuery(event.target.value)}
        />
        {query === ''
          ? null
          : (
              <button
                type="button"
                className="pg-filter-clear"
                aria-label="清除筛选"
                onClick={() => setQuery('')}
              >
                <IconCloseFillRegular size={12} />
              </button>
            )}
      </label>

      <div className="pg-nav-scroll">
        {groups.length === 0
          ? <p className="pg-nav-empty">没有匹配的组件。</p>
          : null}
        {groups.map((group) => {
          const open = searching || !collapsed.includes(group.id)
          return (
            <section className="pg-nav-group" key={group.id}>
              <button
                type="button"
                className="pg-nav-group-title"
                aria-expanded={open}
                onClick={() => setCollapsed(value =>
                  value.includes(group.id)
                    ? value.filter(id => id !== group.id)
                    : [...value, group.id])}
              >
                <span className="pg-nav-chevron"><IconChevronDownOutlineRegular size={12} /></span>
                <span className="pg-nav-group-label">{group.label}</span>
                <span className="pg-nav-group-count">{group.items.length}</span>
              </button>
              {open
                ? group.items.map(example => (
                    <button
                      key={example.name}
                      type="button"
                      className="pg-nav-row"
                      aria-current={example.name === props.current}
                      onClick={() => props.onSelect(example.name)}
                    >
                      {example.name}
                    </button>
                  ))
                : null}
            </section>
          )
        })}
      </div>
    </nav>
  )
}

/**
 * The component named by the URL hash.
 * The hash is `#<name>` with an optional `?light` scheme flag, so the address
 * opens the same component in the same scheme it was copied with.
 * @returns the component name, or null when the hash names none.
 */
function currentNameFromHash(): string | null {
  const raw = globalThis.location?.hash.replace(/^#/, '')
  if (raw === undefined || raw === '')
    return null
  const name = raw.split('?')[0]
  return EXAMPLES.some(example => example.name === name)
    ? name
    : null
}

/**
 * The gallery: a grouped component index on the left, every state of the
 * selected component on the right.
 * @returns the gallery shell.
 */
export function App(): React.JSX.Element {
  const [dark, setDark] = useState(() => !(globalThis.location?.hash.includes('?light') ?? false))
  const [selected, setSelected] = useState(() => currentNameFromHash() ?? EXAMPLES[0]?.name ?? '')
  const current = EXAMPLES.find(example => example.name === selected) ?? EXAMPLES[0]

  useEffect(() => {
    if (current !== undefined && globalThis.location !== undefined)
      globalThis.history.replaceState(null, '', `#${current.name}${dark ? '' : '?light'}`)
  }, [current, dark])

  useEffect(() => {
    const onHashChange = (): void => {
      const name = currentNameFromHash()
      if (name !== null)
        setSelected(name)
    }
    globalThis.addEventListener('hashchange', onHashChange)
    return () => globalThis.removeEventListener('hashchange', onHashChange)
  }, [])

  const stateCount = EXAMPLES.reduce((total, example) => total + example.states.length, 0)
  const counter = `${String(EXAMPLES.length)} 个示例文件 · ${String(stateCount)} 个状态`

  return (
    <DshProvider colorScheme={dark ? 'dark' : 'light'}>
      <div className="pg-shell">
        <Sidebar current={current?.name} onSelect={setSelected} />
        <main className="pg-main">
          <header className="pg-toolbar">
            <strong className="pg-toolbar-title">{current?.name}</strong>
            <span className="pg-chip">{current?.group}</span>
            <span className="pg-toolbar-spacer" />
            <span className="pg-note">{counter}</span>
            <Button
              variant="outline"
              size="sm"
              aria-pressed={dark}
              icon={dark
                ? <IconDarkOutlineRegular size={14} />
                : <IconLightOutlineRegular size={14} />}
              onClick={() => setDark(value => !value)}
            >
              {dark ? 'dark' : 'light'}
            </Button>
          </header>
          {current === undefined
            ? <p>没有可展示的组件。</p>
            : (
                <>
                  <h1 className="pg-heading">{current.name}</h1>
                  <p className="pg-subtitle">{current.summary}</p>
                  {current.states.map((state, index) => (
                    <section className="pg-state" key={`${current.name}-${String(index)}`}>
                      <h2 className="pg-state-title">{state.title}</h2>
                      <div className="pg-state-body">{state.element}</div>
                    </section>
                  ))}
                </>
              )}
        </main>
      </div>
    </DshProvider>
  )
}
