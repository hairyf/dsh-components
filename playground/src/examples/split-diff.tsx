import type { SplitDiffHunk } from '@dsh-components'
import type { ComponentExample } from './kit'
import { SplitDiff } from '@dsh-components'
import { Column } from './kit'

/** Two small changes in one file: a body edit and a type change. */
const HUNKS: readonly SplitDiffHunk[] = [
  {
    header: '@@ -1,4 +1,5 @@',
    lines: [
      {
        left: { number: 1, text: 'export function sum(values: readonly number[]): number {', kind: 'context' },
        right: { number: 1, text: 'export function sum(values: readonly number[]): number {', kind: 'context' },
      },
      {
        left: { number: 2, text: '  return values.reduce((total, value) => total + value, 0)', kind: 'del' },
        right: { number: 2, text: '  const total = values.reduce((sum, value) => sum + value, 0)', kind: 'add' },
      },
      {
        right: { number: 3, text: '  return total', kind: 'add' },
      },
      {
        left: { number: 3, text: '}', kind: 'context' },
        right: { number: 4, text: '}', kind: 'context' },
      },
    ],
  },
  {
    header: '@@ -8,4 +9,4 @@',
    lines: [
      {
        left: { number: 8, text: 'export const EMPTY = 0', kind: 'del' },
        right: { number: 9, text: 'export const EMPTY = \'\'', kind: 'add' },
      },
      {
        left: { number: 9, text: 'export function isEmpty(value: number): boolean {', kind: 'del' },
        right: { number: 10, text: 'export function isEmpty(value: string): boolean {', kind: 'add' },
      },
      {
        left: { number: 10, text: '  return value === EMPTY', kind: 'context' },
        right: { number: 11, text: '  return value === EMPTY', kind: 'context' },
      },
      {
        left: { number: 11, text: '}', kind: 'context' },
        right: { number: 12, text: '}', kind: 'context' },
      },
    ],
  },
]

/** Eight rows with two changed pairs, so a cap in the middle is visible. */
const LONG_HUNK: readonly SplitDiffHunk[] = [
  {
    header: '@@ -1,8 +1,8 @@',
    lines: [
      {
        left: { number: 1, text: 'const config = {', kind: 'context' },
        right: { number: 1, text: 'const config = {', kind: 'context' },
      },
      {
        left: { number: 2, text: '  host: \'localhost\',', kind: 'context' },
        right: { number: 2, text: '  host: \'localhost\',', kind: 'context' },
      },
      {
        left: { number: 3, text: '  port: 8080,', kind: 'del' },
        right: { number: 3, text: '  port: 3000,', kind: 'add' },
      },
      {
        left: { number: 4, text: '  retries: 3,', kind: 'context' },
        right: { number: 4, text: '  retries: 3,', kind: 'context' },
      },
      {
        left: { number: 5, text: '  timeout: 1000,', kind: 'del' },
        right: { number: 5, text: '  timeout: 5000,', kind: 'add' },
      },
      {
        left: { number: 6, text: '  verbose: false,', kind: 'context' },
        right: { number: 6, text: '  verbose: false,', kind: 'context' },
      },
      {
        left: { number: 7, text: '  logLevel: \'info\',', kind: 'context' },
        right: { number: 7, text: '  logLevel: \'info\',', kind: 'context' },
      },
      {
        left: { number: 8, text: '}', kind: 'context' },
        right: { number: 8, text: '}', kind: 'context' },
      },
    ],
  },
]

const example: ComponentExample = {
  name: 'split-diff',
  group: 'content',
  summary: '按行对照文件改动：可以左右并列，也可以合成一栏，过长的内容折叠中间。',
  states: [
    {
      title: '并列对照（split）：左右两栏逐行配对',
      element: (
        <Column>
          <SplitDiff filename="src/lib/sum.ts" status="已修改" hunks={HUNKS} split />
        </Column>
      ),
    },
    {
      title: '统一视图（默认）：增行与删行各占一行',
      element: (
        <Column>
          <SplitDiff filename="src/lib/sum.ts" status="已修改" hunks={HUNKS} />
        </Column>
      ),
    },
    {
      title: '超长内容按 maxLines 折叠（并列，上限 6 行）',
      element: (
        <Column>
          <SplitDiff filename="src/lib/config.ts" status="已修改" hunks={LONG_HUNK} split maxLines={6} />
          <span className="pg-note">保留首尾各 3 行，中间用省略行代替。</span>
        </Column>
      ),
    },
    {
      title: '没有改动行时的占位（empty）',
      element: (
        <Column>
          <SplitDiff filename="src/lib/empty.ts" hunks={[]} empty="暂无改动" />
        </Column>
      ),
    },
  ],
}

export default example
