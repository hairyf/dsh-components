import { diffPuckData } from '../src/prompt/diff'
import { renderPrompt } from '../src/prompt/render'

const base = {
  root: {
    props: { title: 'DSH' },
  },
  content: [
    {
      type: 'DshSidebar',
      props: {
        'id': 'sidebar-1',
        'collapsed': false,
        'brand.mark': [],
        'panellist': [],
        'workspaces': [],
      },
    },
  ],
}

const next = {
  root: {
    props: { title: 'DSH' },
  },
  content: [
    {
      type: 'DshSidebar',
      props: {
        'id': 'sidebar-1',
        'collapsed': true,
        'brand.mark': [
          {
            type: 'DshIcon',
            props: { id: 'icon-1', icon: 'IconSparkleRegular', size: 24 },
          },
        ],
        'panellist': [],
        'workspaces': [],
      },
    },
  ],
}

const doc = diffPuckData(base as never, next as never)
console.log('isEmpty:', doc.isEmpty)
console.log('summary:', doc.summary)
console.log('changes:', doc.changes.length)
for (const c of doc.changes) console.log('  -', c.kind, '|', c.path, '|', c.prop ?? '')

console.log('\n===== RENDERED PROMPT (zh) =====')
console.log(renderPrompt(doc, { locale: 'zh' }))

console.log('\n===== RENDERED PROMPT (en) =====')
console.log(renderPrompt(doc, { locale: 'en' }))

const empty = diffPuckData(next as never, next as never)
console.log('\n===== EMPTY =====')
console.log(renderPrompt(empty, { locale: 'zh' }))
