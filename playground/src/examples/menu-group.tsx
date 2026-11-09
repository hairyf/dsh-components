import type { ComponentExample } from './kit'
import { MenuGroup, MenuItemButton, MenuSurface } from '@dsh-components'
import { Column } from './kit'

const example: ComponentExample = {
  name: 'menu-group',
  group: 'primitives',
  summary: '菜单内的分组标题与菜单行，配合菜单表面呈现。',
  states: [
    {
      title: '分组与菜单行',
      element: (
        <Column>
          <MenuSurface>
            <MenuGroup label="操作">
              <MenuItemButton onSelect={() => {}}>新建</MenuItemButton>
              <MenuItemButton current onSelect={() => {}}>复制</MenuItemButton>
            </MenuGroup>
            <MenuGroup label="危险操作">
              <MenuItemButton danger onSelect={() => {}}>删除</MenuItemButton>
            </MenuGroup>
          </MenuSurface>
        </Column>
      ),
    },
    {
      title: '紧凑分组与快捷键',
      element: (
        <Column>
          <MenuSurface compact>
            <MenuGroup label="视图">
              <MenuItemButton
                shortcut={{
                  keys: ['Ctrl', 'B'],
                }}
                onSelect={() => {}}
              >
                显示侧栏
              </MenuItemButton>
              <MenuItemButton disabled disabledReason="没有可选内容" onSelect={() => {}}>导出</MenuItemButton>
            </MenuGroup>
          </MenuSurface>
        </Column>
      ),
    },
  ],
}

export default example
