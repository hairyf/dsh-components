import type { TreeNode } from '@dsh-components'
import type { ComponentExample } from './kit'
import { Tree } from '@dsh-components'
import { useState } from 'react'

const NODES: readonly TreeNode[] = [
  {
    id: 'src',
    name: 'src',
    kind: 'directory',
    children: [
      { id: 'src/app.tsx', name: 'app.tsx', kind: 'file' },
      { id: 'src/index.ts', name: 'index.ts', kind: 'file' },
      {
        id: 'src/theme',
        name: 'theme',
        kind: 'directory',
        children: [
          { id: 'src/theme/colors.ts', name: 'colors.ts', kind: 'file' },
          { id: 'src/theme/typography.ts', name: 'typography.ts', kind: 'file' },
        ],
      },
    ],
  },
  {
    id: 'assets',
    name: 'assets',
    kind: 'directory',
    children: [
      { id: 'assets/logo.svg', name: 'logo.svg', kind: 'file' },
    ],
  },
  { id: 'readme', name: 'readme.md', kind: 'file' },
  {
    id: 'env',
    name: '.env',
    kind: 'file',
    hidden: true,
  },
]

/** Props of the shared tree demo: which directories start open, and what is selected. */
interface TreeDemoProps {
  readonly initialExpanded: readonly string[]
  readonly initialSelected: string
}

/** A tree whose expansion and selection are both held by this component. */
function TreeDemo(props: TreeDemoProps): React.JSX.Element {
  const { initialExpanded, initialSelected } = props
  const [expanded, setExpanded] = useState<readonly string[]>(initialExpanded)
  const [selected, setSelected] = useState(initialSelected)
  return (
    <Tree
      nodes={NODES}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      selectedId={selected}
      onSelect={setSelected}
    />
  )
}

/** An empty tree that still accepts expansion reports. */
function EmptyTree(): React.JSX.Element {
  const [expanded, setExpanded] = useState<readonly string[]>([])
  return (
    <Tree
      nodes={[]}
      expandedIds={expanded}
      onExpandedChange={setExpanded}
      emptyLabel="暂无内容"
    />
  )
}

const example: ComponentExample = {
  name: 'tree',
  group: 'layout',
  summary: '受控的文件树：目录按名排序、点击展开收起，文件点击后高亮选中，隐藏项以弱化色调显示。',
  states: [
    {
      title: '展开一层并选中文件',
      element: <TreeDemo initialExpanded={['src']} initialSelected="src/index.ts" />,
    },
    {
      title: '展开多层并选中隐藏项（弱化色调）',
      element: <TreeDemo initialExpanded={['src', 'src/theme', 'assets']} initialSelected="env" />,
    },
    { title: '空树：自定义提示文案', element: <EmptyTree /> },
  ],
}

export default example
