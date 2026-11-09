import { useEffect } from 'react'
import { installDshTheme, setDshDarkMode } from '../theme'

/** Props of {@link DshProvider}. */
export interface DshProviderProps {
  /** Window content. */
  readonly children?: React.ReactNode
  /**
   * Colour scheme of this subtree.
   * DSH switches themes with a body attribute, so the provider owns that
   * attribute while it is mounted and restores the previous value on unmount.
   */
  readonly colorScheme?: 'light' | 'dark'
}

/**
 * Install the DSH design tokens and document baseline for a subtree.
 *
 * Every component in this library is styled with `var(--dsw-*)` tokens, so the
 * tokens have to be on the document before anything renders. That is all this
 * provider does; it draws no box of its own.
 *
 * Inside DSH the host has already installed the tokens, so a plugin does not
 * mount this; it exists for rendering the components outside the host, such as
 * the component gallery in `playground/`.
 *
 * Installation happens in an effect rather than in a memo: React StrictMode
 * unmounts and remounts an effect to prove it is symmetric, and a memoised
 * handle would still point at the sheets the first unmount removed, leaving the
 * page with no tokens at all.
 * @param props - the subtree and the colour scheme to apply.
 * @returns the subtree.
 */
export function DshProvider(props: DshProviderProps): React.JSX.Element {
  const { colorScheme = 'dark' } = props

  useEffect(() => {
    if (typeof document === 'undefined')
      return
    const handle = installDshTheme()
    return () => handle.dispose()
  }, [])

  useEffect(() => {
    if (typeof document === 'undefined')
      return
    const hadDark = document.body.hasAttribute('data-ds-dark-theme')
    setDshDarkMode(colorScheme === 'dark')
    return () => setDshDarkMode(hadDark)
  }, [colorScheme])

  return <>{props.children}</>
}
