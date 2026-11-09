/**
 * dsh-components.
 *
 * A component library: every export is a React component (or a prop type next to
 * one). The design tokens, the css-render pipeline and the recovered
 * stylesheets are implementation detail behind {@link DshProvider}.
 */
export * from './components'
export { DshProvider } from './components/provider'
export type { DshProviderProps } from './components/provider'
