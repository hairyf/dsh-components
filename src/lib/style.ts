import type { CssRenderInstance } from 'css-render'
import { CssRender } from 'css-render'
import { parseCss, rulesToCssNodes } from './css'

/**
 * Shared css-render instance for every component sheet in the library.
 * Exported so consumers can install the theme into the same instance.
 */
const dshCssr: CssRenderInstance = CssRender()

/** Style-element id prefix, so our nodes stay distinguishable from other plugins. */
const ID_PREFIX = 'dsh-components/'

const sheets = new Map<string, Record<string, string>>()

/**
 * Rewrite every class selector in a stylesheet to a scoped class name.
 *
 * The official components were built with CSS Modules, so a recovered sheet has
 * bare names like .iconButton that would collide across components. Prefixing
 * each class mirrors what that build did, without adding a wrapper element, so
 * the rendered DOM keeps the official structure exactly.
 * @param css - the recovered stylesheet.
 * @param scope - the component's scope key, e.g. icon-button.
 */
function prefixClasses(css: string, scope: string): { css: string, classes: Record<string, string> } {
  const classes: Record<string, string> = {}
  const prefix = `dshc-${scope}_`
  // :global(...) is a CSS-Modules escape for selectors that must stay global,
  // such as body[data-ds-dark-theme] in a dark-mode override. It is not CSS, so
  // leaving it in place makes the browser drop the whole rule; unwrapping its
  // argument keeps the escape's meaning without the syntax.
  const unwrapped = css.replace(/:global\(([^)]*)\)/g, '$1')
  const mutated = unwrapped.replace(/\.(-?[A-Z_][\w-]*)/gi, (_whole, name: string) => {
    classes[name] = prefix + name
    return `.${prefix}${name}`
  })
  return { css: mutated, classes }
}

/**
 * Register a component's stylesheet once, returning its class map.
 *
 * Memoised per scope, so all but the first call are a Map lookup. Without a
 * document (server render) the class map is still returned so the markup comes
 * out identical.
 * @param scope - the component's scope key, e.g. icon-button.
 * @param css - the recovered stylesheet.
 * @returns a map from the official class name to its scoped name.
 */
export function useStyle(scope: string, css: string): Record<string, string> {
  const cached = sheets.get(scope)
  if (cached)
    return cached
  const { css: scopedCss, classes } = prefixClasses(css, scope)
  sheets.set(scope, classes)
  if (typeof document !== 'undefined') {
    rulesToCssNodes(dshCssr, parseCss(scopedCss)).forEach((node, index) => {
      // Unique id per rule: css-render skips mount() when the id already exists.
      node.mount({ id: `${ID_PREFIX + scope}/${index}` })
    })
  }
  return classes
}

/**
 * Join class names, dropping falsy entries.
 * @param names - class names and conditional entries.
 */
export function cx(...names: (string | false | null | undefined)[]): string {
  return names.filter(Boolean).join(' ')
}
