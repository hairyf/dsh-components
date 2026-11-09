import type { ComponentExample } from './kit'
import { FileTypeIcon } from '@dsh-components'
import { Column, Row } from './kit'

const PATHS = [
  'src/components/primitives/button.tsx',
  'src/lib/style.ts',
  'README.md',
  'package.json',
  'src/App.vue',
  'src/main.go',
  'scripts/run.ps1',
  'Dockerfile',
]

const example: ComponentExample = {
  name: 'file-type-icon',
  group: 'primitives',
  summary: '按路径识别文件类型的方形图标，也可以直接指定类型与尺寸。',
  states: [
    {
      title: '按路径识别',
      element: (
        <Column>
          {PATHS.map(path => (
            <Row key={path}>
              <FileTypeIcon path={path} />
              <span className="pg-note">{path}</span>
            </Row>
          ))}
        </Column>
      ),
    },
    {
      title: '显式类型与尺寸',
      element: (
        <Row>
          <FileTypeIcon kind="folder" />
          <FileTypeIcon kind="markdown" size={20} />
          <FileTypeIcon kind="image" size={32} />
          <FileTypeIcon kind="pdf" />
          <FileTypeIcon kind="word" />
          <FileTypeIcon kind="excel" />
          <FileTypeIcon kind="ppt" />
          <FileTypeIcon kind="video" />
        </Row>
      ),
    },
    {
      title: '代码类图标',
      element: (
        <Row>
          <FileTypeIcon kind="typescript" />
          <FileTypeIcon kind="javascript" />
          <FileTypeIcon kind="python" />
          <FileTypeIcon kind="rust" />
          <FileTypeIcon kind="docker" />
          <FileTypeIcon kind="json" />
        </Row>
      ),
    },
  ],
}

export default example
