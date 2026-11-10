/**
 * The DSH document baseline, for rendering these components outside the host.
 *
 * Inside DSH the host already installs the design tokens and the product icon
 * sprite, so a plugin never mounts this. It exists for a plain browser, such as
 * the gallery in `playground/`.
 */
export { DshProvider } from './components/provider'
export type { DshProviderProps } from './components/provider'
