import type { ComponentExample } from './kit'
import { ShortcutKeys } from '@dsh-components'
import { Column, Row } from './kit'

const example: ComponentExample = {
  name: 'shortcut-keys',
  group: 'primitives',
  summary: '键位标签：plain 与 tooltip 两种键帽样式，组合键用加号分隔。',
  states: [
    {
      title: 'plain',
      element: (
        <Column>
          <Row>
            <ShortcutKeys keys={['Esc']} />
            <ShortcutKeys keys={['Ctrl', '+', 'K']} />
            <ShortcutKeys keys={['Shift', '+', 'Enter']} />
          </Row>
        </Column>
      ),
    },
    {
      title: 'tooltip 键帽',
      element: (
        <Column>
          <Row>
            <ShortcutKeys keys={['Ctrl', '+', 'B']} variant="tooltip" />
            <ShortcutKeys keys={['Enter']} variant="tooltip" />
            <ShortcutKeys keys={['Ctrl', 'Shift', 'P']} variant="tooltip" />
          </Row>
        </Column>
      ),
    },
  ],
}

export default example
