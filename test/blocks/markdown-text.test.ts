import type { MarkdownLabels } from '../../src/components/content/markdown-text'
import { createElement } from 'react'
import { renderToStaticMarkup, renderToString } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { MarkdownText } from '../../src/components/content/markdown-text'

const labels: MarkdownLabels = {
  code: {
    copyLabel: '复制',
    copiedLabel: '已复制',
    toolbarLabels: { codeLabel: '代码', wrapLabel: '自动换行', unwrapLabel: '取消换行' },
  },
  footnotes: '脚注',
}

function render(text: string, incremental = false): string {
  return renderToStaticMarkup(createElement(MarkdownText, { text, labels, incremental }))
}

describe('markdownText headings', () => {
  it('renders each heading depth as its own element', () => {
    const html = render('# Title\n\n### Third level')
    expect(html).toContain('<h1>Title</h1>')
    expect(html).toContain('<h3>Third level</h3>')
  })

  it('parses inline emphasis inside a heading', () => {
    expect(render('## **bold** heading')).toContain('<h2><strong>bold</strong> heading</h2>')
  })
})

describe('markdownText lists', () => {
  it('renders unordered items without paragraph wrappers', () => {
    const html = render('- alpha\n- beta')
    expect(html).toMatch(/<ul><li>alpha<\/li><li>beta<\/li><\/ul>/)
  })

  it('renders ordered lists and their starting number', () => {
    expect(render('3. three\n4. four')).toContain('<ol start="3">')
  })

  it('keeps nested lists inside their parent item', () => {
    const html = render('- outer\n  - inner')
    expect(html).toContain('<li>outer<ul><li>inner</li></ul></li>')
  })
})

describe('markdownText tables', () => {
  it('renders a header row, body rows and alignment', () => {
    const html = render('| name | value |\n| :--- | ---: |\n| a | 1 |')
    expect(html).toContain('<table>')
    expect(html).toContain('<thead><tr><th style="text-align:left">name</th><th style="text-align:right">value</th></tr></thead>')
    expect(html).toContain('<tbody><tr><td style="text-align:left">a</td><td style="text-align:right">1</td></tr></tbody>')
  })

  it('marks a four-column table as horizontally scrollable', () => {
    const html = render('| a | b | c | d |\n| - | - | - | - |\n| 1 | 2 | 3 | 4 |')
    expect(html).toContain('md-table-wide')
    expect(html).toContain('tabindex="0"')
  })
})

describe('markdownText fenced code blocks', () => {
  it('hands a closed fence to the code block with its language', () => {
    const html = render('```ts\nconst a = 1\n```')
    expect(html).toContain('md-code-block')
    expect(html).toContain('data-code-block-banner')
    expect(html).toContain('>ts<')
    expect(html).toContain('const a = 1')
  })

  it('trims the fence markup from the rendered source', () => {
    const html = render('```\nplain\n```')
    expect(html).toContain('<code>plain</code>')
  })
})

describe('markdownText unclosed fences', () => {
  it('keeps an unclosed fence rendering as a code block while incremental', () => {
    const html = render('```ts\nconst streaming = true', true)
    expect(html).toContain('md-code-block')
    expect(html).toContain('const streaming = true')
  })

  it('renders the same partial fence once the stream settles', () => {
    expect(render('```ts\nconst streaming = true')).toContain('const streaming = true')
  })

  it('does not leak the fence markers into the body text', () => {
    const html = render('```ts\nconst a = 1', true)
    expect(html).not.toContain('```')
  })
})

describe('markdownText inline content', () => {
  it('renders emphasis, strikethrough and inline code', () => {
    const html = render('*em* ~~gone~~ `x = 1`')
    expect(html).toContain('<em>em</em>')
    expect(html).toContain('<del>gone</del>')
    expect(html).toContain('<code>x = 1</code>')
  })

  it('renders http links as external anchors', () => {
    const html = render('[docs](https://example.com/a)')
    expect(html).toContain('href="https://example.com/a"')
    expect(html).toContain('target="_blank"')
  })

  it('drops a scriptable href instead of emitting an anchor', () => {
    const html = render('[x](javascript:alert(1))')
    expect(html).not.toContain('javascript:')
    expect(html).not.toContain('<a ')
  })

  it('renders blockquotes and thematic breaks', () => {
    const html = render('> quoted\n\n---')
    expect(html).toContain('<blockquote><p>quoted</p></blockquote>')
    expect(html).toContain('<hr/>')
  })

  it('renders a remote image through the image preview', () => {
    const html = render('![alt text](https://example.com/a.png)')
    expect(html).toContain('<img')
    expect(html).toContain('alt="alt text"')
  })

  it('falls back to alt text when the image destination is not displayable', () => {
    const html = render('![alt text](C:/local/a.png)')
    expect(html).not.toContain('<img')
    expect(html).toContain('alt text')
  })
})

describe('markdownText surface', () => {
  it('renders without a DOM, as the playground prerenders it', () => {
    expect(renderToString(createElement(MarkdownText, { text: '# hi', labels }))).toContain('<h1>hi</h1>')
  })

  it('marks the compact variant on the root', () => {
    const html = renderToStaticMarkup(createElement(MarkdownText, { text: 'x', labels, variant: 'compact' }))
    expect(html).toContain('data-markdown-variant="compact"')
  })
})
