import type { SearchDialogGroup } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, SearchDialog } from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

const GROUPS: readonly SearchDialogGroup[] = [
  {
    id: 'common',
    label: '常用',
    rows: [
      { id: 'save', label: '保存', value: 'Ctrl+S' },
      { id: 'open', label: '打开', value: 'Ctrl+O' },
      { id: 'find', label: '查找', value: 'Ctrl+F' },
    ],
  },
  {
    id: 'edit',
    label: '编辑',
    rows: [
      { id: 'undo', label: '撤销', value: 'Ctrl+Z' },
      { id: 'redo', label: '重做', value: 'Ctrl+Shift+Z' },
      { id: 'format', label: '格式化', value: 'Shift+Alt+F' },
    ],
  },
]

/**
 * Open the dialog with an initial query, then filter or clear it live.
 * @returns the trigger and the dialog.
 */
function SearchDemo({ initialQuery = '' }: { readonly initialQuery?: string }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [query, setQuery] = useState(initialQuery)
  return (
    <Column>
      <Row>
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true)
          }}
        >
          打开搜索
        </Button>
        <span>
          {initialQuery === ''
            ? '打开后可输入关键字过滤。'
            : `打开时已填入「${initialQuery}」。`}
        </span>
      </Row>
      <SearchDialog
        open={open}
        onOpenChange={setOpen}
        title="搜索命令"
        query={query}
        onQueryChange={setQuery}
        groups={GROUPS}
        placeholder="搜索命令"
        emptyLabel="无匹配结果"
        clearLabel="清除搜索"
        closeLabel="关闭"
        footer={<span>按 Esc 关闭。</span>}
      />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'search-dialog',
  group: 'feedback',
  summary: '在分组列表上做即时过滤的搜索对话框，含清空与空结果状态。',
  states: [
    { title: '浏览全部分组', element: <SearchDemo /> },
    { title: '带初始关键字（可清空）', element: <SearchDemo initialQuery="撤销" /> },
  ],
}

export default example
