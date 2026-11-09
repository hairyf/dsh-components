import type { ComponentExample } from './kit'
import { Stack, Surface } from '@dsh-components'

const BODY = [
  '面板内容由调用方提供。',
  '边框、圆角与背景由面板自己绘制。',
]

const example: ComponentExample = {
  name: 'surface',
  group: 'layout',
  summary: '带圆角、边框与投影的面板外壳，可切换内边距档位并提升阴影层级。',
  states: [
    {
      title: '默认内边距（6px 12px）',
      element: (
        <Surface padding="sm">
          <Stack gap={4}>
            <span>示例面板</span>
            <span>{BODY[0]}</span>
          </Stack>
        </Surface>
      ),
    },
    {
      title: '较大内边距（10px 14px）',
      element: (
        <Surface padding="md">
          <Stack gap={4}>
            <span>示例面板</span>
            <span>{BODY[1]}</span>
          </Stack>
        </Surface>
      ),
    },
    {
      title: '提升阴影层级',
      element: (
        <Surface padding="sm" elevated>
          <Stack gap={4}>
            <span>示例面板</span>
            <span>{BODY[0]}</span>
          </Stack>
        </Surface>
      ),
    },
    {
      title: '无内边距：由内容自己控制留白',
      element: (
        <Surface>
          <Stack gap={4}>
            <span>示例面板</span>
            <span>{BODY[1]}</span>
          </Stack>
        </Surface>
      ),
    },
  ],
}

export default example
