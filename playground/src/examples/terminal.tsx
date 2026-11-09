import type { ComponentExample } from './kit'
import { Terminal } from '@dsh-components'
import { Column, terminalLabels } from './kit'

const BUILD_OUTPUT = [
  'vite v6.0.0 building for production...',
  '✓ 32 modules transformed.',
  'dist/index.html                  0.46 kB',
  'dist/assets/index-4f2a1c.js    142.31 kB',
  '\u001B[32m✓ built in 1.42s\u001B[0m',
].join('\n')

const TEST_OUTPUT = [
  '✓ adds two numbers',
  '✓ returns zero for an empty list',
  '✗ keeps the original order',
  '  expected [1, 2] but received [2, 1]',
  '',
  '2 passed, 1 failed',
].join('\n')

const RUNNING_OUTPUT = [
  '正在写入 dist/index.html',
  '正在写入 dist/assets/index-4f2a1c.js',
].join('\n')

const LONG_OUTPUT = Array.from({ length: 12 }, (_, index) => `处理第 ${String(index + 1)} 项`).join('\n')

const example: ComponentExample = {
  name: 'terminal',
  group: 'content',
  summary: '一条命令连同它的输出、退出状态、复制与行数折叠。',
  states: [
    {
      title: '执行成功（带 ANSI 颜色的输出）',
      element: (
        <Column>
          <Terminal
            command="pnpm build"
            cwd="/projects/demo"
            output={BUILD_OUTPUT}
            exitCode={0}
            labels={terminalLabels}
          />
        </Column>
      ),
    },
    {
      title: '退出码非零',
      element: (
        <Column>
          <Terminal
            command="pnpm test"
            cwd="/projects/demo"
            output={TEST_OUTPUT}
            exitCode={1}
            labels={terminalLabels}
          />
        </Column>
      ),
    },
    {
      title: '运行中',
      element: (
        <Column>
          <Terminal
            command="pnpm build"
            cwd="/projects/demo"
            output={RUNNING_OUTPUT}
            running
            labels={terminalLabels}
          />
        </Column>
      ),
    },
    {
      title: '长输出折叠（上限 4 行）',
      element: (
        <Column>
          <Terminal
            command="pnpm exec node scripts/report.mjs"
            cwd="/projects/demo"
            output={LONG_OUTPUT}
            exitCode={0}
            maxLines={4}
            labels={terminalLabels}
          />
        </Column>
      ),
    },
    {
      title: '无输出',
      element: (
        <Column>
          <Terminal
            command="touch done.txt"
            cwd="/projects/demo"
            output=""
            exitCode={0}
            labels={terminalLabels}
          />
        </Column>
      ),
    },
  ],
}

export default example
