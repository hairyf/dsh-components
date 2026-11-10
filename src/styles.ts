/**
 * The design tokens, the document baseline, and the icon sprite.
 *
 * These are the sheets and symbols every component resolves against, exposed for
 * a host that wants to install them itself instead of mounting `DshProvider`.
 * A plugin does not need this: DSH has already done it.
 */
export { installDshTheme, setDshDarkMode } from './theme'
export type { DshThemeHandle } from './theme'
export * from './theme/styles'
