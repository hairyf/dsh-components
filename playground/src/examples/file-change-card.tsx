import type { FileChange, SplitDiffHunk } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { FileChangeCard, SplitDiff } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** Three files, with the totals the header adds up. */
const CHANGES: readonly FileChange[] = [
  { path: 'src/lib/sum.ts', added: 12, deleted: 3 },
  { path: 'src/lib/date.ts', added: 4, deleted: 8 },
  { path: 'docs/guide.md', added: 21 },
]

/** One file, so the card uses its single-file tile. */
const SINGLE: readonly FileChange[] = [
  { path: 'src/lib/date.ts', added: 2, deleted: 2 },
]

/** The change one row's preview draws. */
const PREVIEW_HUNK: readonly SplitDiffHunk[] = [
  {
    header: '@@ -1,4 +1,4 @@',
    lines: [
      {
        left: { number: 1, text: 'export function formatDate(value: string): string {', kind: 'context' },
        right: { number: 1, text: 'export function formatDate(value: string): string {', kind: 'context' },
      },
      {
        left: { number: 2, text: '  return new Date(value).toISOString()', kind: 'del' },
        right: { number: 2, text: '  return new Date(value).toISOString().slice(0, 10)', kind: 'add' },
      },
      {
        left: { number: 3, text: '}', kind: 'context' },
        right: { number: 3, text: '}', kind: 'context' },
      },
    ],
  },
]

/** The header opens and closes the file list, and the totals stay in the header. */
function ExpandableCard(): React.JSX.Element {
  const [open, setOpen] = useState(true)
  return (
    <Column>
      <FileChangeCard
        title="3 个文件已修改"
        files={CHANGES}
        open={open}
        onOpenChange={setOpen}
      />
      <span className="pg-note">{open ? '已展开，点击标题可以收起。' : '已收起，点击标题可以展开。'}</span>
    </Column>
  )
}

/** A file row opens its own preview, and only one row is open at a time. */
function PreviewCard(): React.JSX.Element {
  const [open, setOpen] = useState(true)
  return (
    <Column>
      <FileChangeCard
        title="1 个文件已修改"
        files={SINGLE}
        open={open}
        onOpenChange={setOpen}
        renderPreview={() => <SplitDiff hunks={PREVIEW_HUNK} split />}
      />
      <span className="pg-note">展开后点击文件行可以查看改动预览，再次点击收起。</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'file-change-card',
  group: 'layout',
  summary: '一张改动汇总卡片：标题行给出增删统计，展开后逐行列出文件，单行还能展开预览。',
  states: [
    { title: '展开与收起（含增删统计）', element: <ExpandableCard /> },
    { title: '单文件：点击文件行展开改动预览', element: <PreviewCard /> },
    {
      title: '没有文件时的占位',
      element: <FileChangeCard title="没有文件改动" files={[]} empty="暂无改动" />,
    },
    {
      title: '文件没有增删统计时，标题只显示文件数',
      element: (
        <FileChangeCard
          title="2 个文件有变动"
          files={[
            { path: 'src/lib/sum.ts' },
            { path: 'docs/guide.md' },
          ]}
          open
        />
      ),
    },
  ],
}

export default example
