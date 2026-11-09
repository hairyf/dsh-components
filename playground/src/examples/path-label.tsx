import type { ComponentExample } from './kit'
import { PathLabel } from '@dsh-components'
import { Column } from './kit'

const example: ComponentExample = {
  name: 'path-label',
  group: 'primitives',
  summary: '目录部分弱化、文件名强调的路径标签，过长时从左侧淡出。',
  states: [
    {
      title: '常见路径',
      element: (
        <Column>
          <PathLabel path="src/components/primitives/button.tsx" />
          <PathLabel path="C:\\projects\\demo\\README.md" />
          <PathLabel path="package.json" />
          <PathLabel path="src/components/" />
        </Column>
      ),
    },
    {
      title: '受限宽度（左侧淡出）',
      element: (
        <div style={{ width: 220 }}>
          <PathLabel path="src/components/primitives/segmented-control.tsx" />
        </div>
      ),
    },
  ],
}

export default example
