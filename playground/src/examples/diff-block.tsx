import type { DiffHunk } from '@dsh-components'
import type { ComponentExample } from './kit'
import { DiffBlock } from '@dsh-components'
import { Column, diffLabels } from './kit'

const TYPE_CHANGE: readonly DiffHunk[] = [
  {
    path: 'src/lib/sum.ts',
    oldText: `export function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
`,
    newText: `export function sum(values: readonly number[]): number {
  return values.reduce((total, value) => total + value, 0)
}
`,
  },
]

const NEW_FILE: readonly DiffHunk[] = [
  {
    path: 'src/lib/average.ts',
    oldText: null,
    newText: `import { sum } from './sum'

export function average(values: readonly number[]): number {
  return values.length === 0 ? 0 : sum(values) / values.length
}
`,
  },
]

const MANY_CHANGES: readonly DiffHunk[] = [
  {
    path: 'src/lib/table.ts',
    oldText: `const first = 'a'
const second = 'b'
const third = 'c'
const fourth = 'd'
const fifth = 'e'
const sixth = 'f'
const seventh = 'g'
const eighth = 'h'
const ninth = 'i'
`,
    newText: `const first = 'a'
const second = 'B'
const third = 'c'
const fourth = 'd'
const fifth = 'e'
const sixth = 'F'
const seventh = 'g'
const eighth = 'h'
const ninth = 'I'
`,
  },
  {
    path: 'src/lib/empty.ts',
    oldText: '',
    newText: `export const EMPTY = ''

export function isEmpty(value: string): boolean {
  return value === EMPTY
}
`,
  },
]

const example: ComponentExample = {
  name: 'diff-block',
  group: 'content',
  summary: '按行渲染文件改动，增删行带底色，过长的内容折叠中间部分。',
  states: [
    {
      title: '单行修改（含上下文）',
      element: (
        <Column>
          <DiffBlock diffs={TYPE_CHANGE} labels={diffLabels} />
        </Column>
      ),
    },
    {
      title: '新增文件（全部为新增行）',
      element: (
        <Column>
          <DiffBlock diffs={NEW_FILE} labels={diffLabels} />
        </Column>
      ),
    },
    {
      title: '多文件 + 中间折叠（上限 6 行）',
      element: (
        <Column>
          <DiffBlock diffs={MANY_CHANGES} labels={diffLabels} maxLines={6} />
        </Column>
      ),
    },
  ],
}

export default example
