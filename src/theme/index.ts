import type { CssRenderInstance } from 'css-render'
import { ICON_SYMBOLS } from '@deepseek-ai/dsh-client-ui-primitives'
import { CssRender } from 'css-render'
import { parseCss, rulesToCssNodes } from '../lib/css'
import {
  BASE_CSS,
  CORNER_SHAPE_CSS,
  DESIGN_PLATFORM_CSS,
  FOCUS_CSS,
  GRADIENT_SHADOW_TEXT_CSS,
  ONBOARDING_CSS,
  SCROLLBAR_CSS,
  SHIKI_CSS,
} from './styles'

/**
 * The document-level sheets, in cascade order.
 *
 * Tokens come first so every later sheet can resolve var(--dsw-*) against them,
 * and the typography scale follows because the alias tokens reference it.
 */
const SHEETS: { id: string, css: string }[] = [
  { id: 'ui-theme/design-platform', css: DESIGN_PLATFORM_CSS },
  { id: 'ui-theme/gradient-shadow-text', css: GRADIENT_SHADOW_TEXT_CSS },
  { id: 'ui-theme/base', css: BASE_CSS },
  { id: 'ui-theme/focus', css: FOCUS_CSS },
  { id: 'ui-theme/scrollbar', css: SCROLLBAR_CSS },
  { id: 'ui-theme/corner-shape', css: CORNER_SHAPE_CSS },
  { id: 'ui-theme/onboarding', css: ONBOARDING_CSS },
  { id: 'ui-theme/shiki', css: SHIKI_CSS },
]

/** A css-render instance plus the handle needed to tear its sheets down again. */
export interface DshThemeHandle {
  /** The instance that owns every installed sheet; reuse it for component styles. */
  cssr: CssRenderInstance
  /** Remove every sheet this handle installed. */
  dispose: () => void
}

const SVG_NS = 'http://www.w3.org/2000/svg'

/** Root attributes that size or label one rendering, not the reusable artwork. */
const DROPPED_ATTRIBUTES = new Set([
  'width',
  'height',
  'xmlns',
  'class',
  'aria-hidden',
])

/**
 * Turn one icon document into a reusable symbol.
 *
 * Every product icon is `<svg><use href="#dsw-icon-<glyph>-<weight>"/></svg>`,
 * so without the sprite the references dangle and nothing draws.
 * @param id - the symbol id the icons reference.
 * @param markup - the official SVG document for that glyph and weight.
 * @returns the symbol element.
 */
function toSymbol(id: string, markup: string): Element {
  const root = new DOMParser().parseFromString(markup, 'image/svg+xml').documentElement
  const symbol = document.createElementNS(SVG_NS, 'symbol')
  for (const { name, value } of root.attributes) {
    if (!DROPPED_ATTRIBUTES.has(name))
      symbol.setAttribute(name, value)
  }
  symbol.id = id
  symbol.append(...[...root.childNodes].map(node => document.importNode(node, true)))
  return symbol
}

/**
 * Mount the product icon sprite into the document.
 *
 * Inside DSH the theme plugin already publishes it, so this is a no-op there;
 * outside the host it is what makes the icons visible.
 * @returns a disposer that removes the sprite it added, or undefined when one was already present.
 */
function installIconSprite(): (() => void) | undefined {
  if (typeof document === 'undefined')
    return undefined
  if (document.querySelector('[data-dsh-icon-sprite]') !== null)
    return undefined
  const sprite = document.createElementNS(SVG_NS, 'svg')
  sprite.setAttribute('aria-hidden', 'true')
  sprite.setAttribute('data-dsh-icon-sprite', '')
  sprite.style.cssText = 'position: absolute; width: 0; height: 0; overflow: hidden'
  for (const [id, markup] of Object.entries(ICON_SYMBOLS as Record<string, string>))
    sprite.append(toSymbol(id, markup))
  document.body.prepend(sprite)
  return () => sprite.remove()
}

/**
 * Mount the DSH design tokens and document baseline onto document.head.
 * Idempotent: each rule mounts under its own id, and css-render reuses an
 * existing style element instead of appending a duplicate.
 * @param cssr - instance to install into; defaults to a fresh one.
 * @returns the instance and a disposer.
 */
export function installDshTheme(cssr: CssRenderInstance = CssRender()): DshThemeHandle {
  const mounted: { node: ReturnType<CssRenderInstance['c']>, id: string }[] = []
  for (const sheet of SHEETS) {
    rulesToCssNodes(cssr, parseCss(sheet.css)).forEach((node, index) => {
      // One id per rule: css-render short-circuits mount() when the id already
      // exists, so sharing an id across rules would silently drop all but the first.
      const id = `${sheet.id}/${index}`
      node.mount({ id })
      mounted.push({ node, id })
    })
  }
  const removeSprite = installIconSprite()
  return {
    cssr,
    dispose: () => {
      for (const { node, id } of mounted)
        node.unmount({ id })
      removeSprite?.()
    },
  }
}

/**
 * Toggle the dark colour scheme.
 * DSH switches themes with a body attribute, not a class or a data-theme key.
 * @param dark - whether to apply the dark tokens.
 */
export function setDshDarkMode(dark: boolean): void {
  if (typeof document === 'undefined')
    return
  if (dark)
    document.body.setAttribute('data-ds-dark-theme', '')
  else
    document.body.removeAttribute('data-ds-dark-theme')
}

export * from './styles'
