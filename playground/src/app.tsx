import { DshProvider } from '@dsh-components'
import { useEffect, useState } from 'react'
import { EXAMPLE_GROUPS, EXAMPLES } from './examples'

/**
 * The gallery: a grouped component index on the left, every state of the
 * selected component on the right.
 */
export function App(): React.JSX.Element {
  const [dark, setDark] = useState(true)
  const [selected, setSelected] = useState(() => {
    const fromHash = globalThis.location?.hash.replace(/^#/, '')
    if (fromHash !== undefined && EXAMPLES.some(example => example.name === fromHash))
      return fromHash
    return EXAMPLES[0]?.name ?? ''
  })
  const current = EXAMPLES.find(example => example.name === selected) ?? EXAMPLES[0]

  useEffect(() => {
    if (current !== undefined && globalThis.location !== undefined)
      globalThis.history.replaceState(null, '', `#${current.name}`)
  }, [current])

  useEffect(() => {
    const onHashChange = (): void => {
      const name = globalThis.location?.hash.replace(/^#/, '')
      if (name !== undefined && EXAMPLES.some(example => example.name === name))
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
        <nav className="pg-nav" aria-label="组件列表">
          <div className="pg-nav-title">dsh-components</div>
          {EXAMPLE_GROUPS.map((group) => {
            const items = EXAMPLES.filter(example => example.group === group.id)
            return (
              <section key={group.id}>
                <div className="pg-nav-group">
                  <span>{group.label}</span>
                  <span>{items.length}</span>
                </div>
                {items.map(example => (
                  <button
                    key={example.name}
                    type="button"
                    className="pg-nav-button"
                    aria-current={example.name === current?.name}
                    onClick={() => setSelected(example.name)}
                  >
                    {example.name}
                  </button>
                ))}
              </section>
            )
          })}
        </nav>
        <main className="pg-main">
          <header className="pg-toolbar">
            <strong>{current?.name}</strong>
            <span className="pg-note">{current?.group}</span>
            <span className="pg-toolbar-spacer" />
            <span className="pg-note">{counter}</span>
            <button
              type="button"
              className="pg-toggle"
              aria-pressed={dark}
              onClick={() => setDark(value => !value)}
            >
              {dark ? '☾ dark' : '☀ light'}
            </button>
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
