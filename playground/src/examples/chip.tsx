import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Chip } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph, Row } from './kit'

const FILES = ['README.md', 'vite.config.ts', 'theme.css']

function RemovableChips(): React.JSX.Element {
  const [files, setFiles] = useState<string[]>(FILES)
  const remove = (file: string): void => {
    setFiles(list => list.filter(item => item !== file))
  }
  return (
    <Row>
      {files.map(file => (
        <Chip key={file} tone="file" removable removeLabel="移除" onRemove={() => remove(file)}>
          {file}
        </Chip>
      ))}
      {files.length === 0
        ? <span className="pg-note">已全部移除</span>
        : null}
    </Row>
  )
}

function ClickableChip(): React.JSX.Element {
  const [opened, setOpened] = useState(false)
  return (
    <Row>
      <Chip onClick={() => setOpened(true)}>打开详情</Chip>
      <span className="pg-note">{opened ? '已打开' : '未打开'}</span>
    </Row>
  )
}

const example: ComponentExample = {
  name: 'chip',
  group: 'primitives',
  summary: '内联胶囊标签，可带前导图标、移除按钮、点击行为或失效样式。',
  states: [
    { title: '可移除（可交互）', element: <RemovableChips /> },
    {
      title: '前导图标',
      element: (
        <Row>
          <Chip tone="file">notes.md</Chip>
          <Chip tone="folder">src</Chip>
          <Chip tone="neutral" leading={<Glyph />}>自定义图标</Chip>
        </Row>
      ),
    },
    {
      title: '可点击 / 已失效',
      element: (
        <Column>
          <ClickableChip />
          <Row>
            <Chip invalid>已失效的条目</Chip>
            <Chip invalid removable removeLabel="移除">已失效且可移除</Chip>
          </Row>
        </Column>
      ),
    },
  ],
}

export default example
