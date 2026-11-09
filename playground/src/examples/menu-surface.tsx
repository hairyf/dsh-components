import type { ComponentExample } from './kit'
import { MenuSurface } from '@dsh-components'
import { Column } from './kit'

const example: ComponentExample = {
  name: 'menu-surface',
  group: 'primitives',
  summary: '菜单与浮层的半透明材料，提供默认与紧凑两种圆角。',
  states: [
    {
      title: '默认',
      element: (
        <Column>
          <MenuSurface>
            <div style={{ padding: 12 }}>菜单表面：半透明填充、圆角与背景模糊。</div>
          </MenuSurface>
        </Column>
      ),
    },
    {
      title: 'compact',
      element: (
        <Column>
          <MenuSurface compact>
            <div style={{ padding: 12 }}>紧凑表面使用更小的圆角。</div>
          </MenuSurface>
        </Column>
      ),
    },
  ],
}

export default example
