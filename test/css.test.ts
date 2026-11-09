import { CssRender } from 'css-render'
import { describe, expect, it } from 'vitest'
import { parseCss, rulesToCssNodes, scopeSelector } from '../src/lib/css'

describe('parseCss', () => {
  it('keeps declaration bodies verbatim', () => {
    const [rule] = parseCss('.a{color:red;--x:var(--y, 1px)}')
    expect(rule).toEqual({ kind: 'rule', selector: '.a', body: 'color:red;--x:var(--y, 1px)' })
  })

  it('splits a flat sheet into sibling rules', () => {
    const rules = parseCss('.a{color:red}.b{color:blue}')
    expect(rules).toHaveLength(2)
    expect(rules.map(r => r.kind === 'rule' && r.selector)).toEqual(['.a', '.b'])
  })

  it('nests media/supports bodies as rules', () => {
    const [media] = parseCss('@media (min-width:600px){.a{color:red}}')
    expect(media.kind).toBe('nested')
    if (media.kind !== 'nested')
      throw new Error('unreachable')
    expect(media.condition).toBe('@media (min-width:600px)')
    expect(media.children).toHaveLength(1)
  })

  it('treats keyframes and font-face as raw blocks', () => {
    const [kf, ff] = parseCss('@keyframes s{from{opacity:0}to{opacity:1}}@font-face{font-family:X}')
    expect(kf.kind).toBe('raw')
    expect(ff.kind).toBe('raw')
  })

  it('does not split on braces inside strings', () => {
    const [rule] = parseCss('.a{content:"{}"}')
    expect(rule.kind === 'rule' && rule.body).toBe('content:"{}"')
  })

  it('ignores comments', () => {
    const rules = parseCss('/* note */\n.a{color:red}')
    expect(rules).toHaveLength(1)
  })
})

describe('scopeSelector', () => {
  it('prefixes class selectors', () => {
    expect(scopeSelector('.icon', 'b')).toBe('.b .icon')
  })

  it('rewrites a leading & to the scope itself', () => {
    expect(scopeSelector('&:hover', 'b')).toBe('.b:hover')
  })

  it('leaves document-level selectors alone', () => {
    expect(scopeSelector('body', 'b')).toBe('body')
    expect(scopeSelector(':root', 'b')).toBe(':root')
  })

  it('scopes each selector of a list independently', () => {
    expect(scopeSelector('.a, .b', 's')).toBe('.s .a, .s .b')
  })
})

describe('rulesToCssNodes', () => {
  it('renders a scoped sheet through css-render', () => {
    const cssr = CssRender()
    const [node] = rulesToCssNodes(cssr, parseCss('.icon{color:red}'), { scope: 'blk' })
    expect(node.render()).toContain('.blk .icon')
    expect(node.render()).toContain('color:red')
  })

  it('preserves official design-token declarations exactly', () => {
    const cssr = CssRender()
    const source = 'body{--dsw-alias-bg-base:var(--dsw-static-neutral-bluish-00);--dsw-radius-md:12px}'
    const [node] = rulesToCssNodes(cssr, parseCss(source))
    const rendered = node.render()
    expect(rendered).toContain('--dsw-alias-bg-base:var(--dsw-static-neutral-bluish-00)')
    expect(rendered).toContain('--dsw-radius-md:12px')
  })
})
