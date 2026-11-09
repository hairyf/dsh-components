import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Menu, MenuItemButton } from '@dsh-components'
import { useState } from 'react'
import { Column, Glyph } from './kit'

function InteractiveMenu(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [picked, setPicked] = useState<string | undefined>(undefined)
  const close = (): void => setOpen(false)
  return (
    <Column>
      <Menu
        open={open}
        onClose={close}
        selectedId={picked}
        onSelect={(id) => {
          setPicked(id)
          close()
        }}
        anchor={(
          <Button variant="outline" aria-expanded={open} onClick={() => setOpen(value => !value)}>
            打开菜单
          </Button>
        )}
        items={[
          { type: 'label', id: 'actions', text: '操作' },
          {
            id: 'new',
            label: '新建',
            shortcut: {
              keys: ['Ctrl', 'N'],
            },
          },
          { id: 'copy', label: '复制链接', icon: <Glyph /> },
          { type: 'separator', id: 'sep' },
          { id: 'export', label: '导出', disabled: true },
          { id: 'delete', label: '删除', danger: true },
        ]}
      >
        <MenuItemButton
          shortcut={{
            keys: ['F2'],
          }}
          onSelect={() => {
            setPicked('rename')
            close()
          }}
        >
          重命名
        </MenuItemButton>
      </Menu>
      <span className="pg-note">
        当前选择：
        {picked ?? '（未选择）'}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'menu',
  group: 'primitives',
  summary: '锚定菜单：标题、分隔线、快捷键、危险行、选中态与组件行，可用按钮真实打开。',
  states: [
    { title: '点击按钮打开（可交互）', element: <InteractiveMenu /> },
    {
      title: '紧凑常开（compact + footer）',
      element: (
        <Column>
          <Menu
            open
            compact
            dense
            onClose={() => {}}
            anchor={<Button variant="ghost">紧凑菜单（常开）</Button>}
            items={[
              {
                id: 'undo',
                label: '撤销',
                shortcut: {
                  keys: ['Ctrl', 'Z'],
                },
              },
              {
                id: 'redo',
                label: '重做',
                shortcut: {
                  keys: ['Ctrl', 'Shift', 'Z'],
                },
              },
              { type: 'separator', id: 'sep' },
              {
                id: 'select-all',
                label: '全选',
                shortcut: {
                  keys: ['Ctrl', 'A'],
                },
              },
            ]}
            footer={[
              { id: 'more', label: '更多操作' },
            ]}
          />
          <span className="pg-note">compact 与 dense 缩小行高与字号，footer 固定在滚动区下方。</span>
        </Column>
      ),
    },
    {
      title: '单独使用菜单行（MenuItemButton）',
      element: (
        <Column>
          <MenuItemButton
            icon={<Glyph />}
            shortcut={{
              keys: ['Ctrl', 'C'],
            }}
            onSelect={() => {}}
          >
            复制
          </MenuItemButton>
          <MenuItemButton current onSelect={() => {}}>当前页</MenuItemButton>
          <MenuItemButton disabled disabledReason="当前不可用" onSelect={() => {}}>不可用项</MenuItemButton>
          <MenuItemButton danger onSelect={() => {}}>删除</MenuItemButton>
        </Column>
      ),
    },
  ],
}

export default example
