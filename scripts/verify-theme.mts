import { CssRender } from 'css-render'
import { parseCss, rulesToCssNodes } from '../src/lib/css.ts'
import { DESIGN_PLATFORM_CSS } from '../src/theme/styles.ts'

const cssr = CssRender()
const rules = parseCss(DESIGN_PLATFORM_CSS)
console.log('parsed top-level rules:', rules.length)
console.log('kinds:', JSON.stringify(rules.map(r => r.kind)))

const nodes = rulesToCssNodes(cssr, rules)
const css = nodes.map(n => n.render()).join('\n')
console.log('rendered length:', css.length)
console.log('--dsw-static-* vars:', (css.match(/--dsw-static-[a-z0-9-]+:/g) || []).length)
console.log('--dsw-alias-* vars:', (css.match(/--dsw-alias-[a-z0-9-]+:/g) || []).length)
console.log('selectors emitted:', [
  ...new Set([
    ...css.matchAll(/([^{}]+)\{/g),
  ].map(m => m[1].trim())),
].join(' | '))

// spirit check: a known token must be present verbatim
const probe = '--dsw-alias-bg-base:var(--dsw-static-neutral-bluish-00)'
console.log('probe present:', css.includes(probe))

// scoping check
const scoped = rulesToCssNodes(cssr, parseCss('.controls{display:flex}.iconButton:hover{color:red}'), { scope: 'dshc-header-leading' })
console.log(`\n--- scope sample ---\n${scoped.map(n => n.render()).join('\n')}`)

// at-rule check
const key = rulesToCssNodes(cssr, parseCss('@keyframes spin{from{transform:rotate(0)}to{transform:rotate(360deg)}}'))
console.log(`\n--- keyframes ---\n${key.map(n => n.render()).join('\n')}`)
