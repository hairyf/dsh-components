import type { ComponentExample } from './kit'
import { Button, HoverCard, HoverCardGroup } from '@dsh-components'
import { Column } from './kit'

const example: ComponentExample = {
  name: 'hover-card',
  group: 'primitives',
  summary: '悬停锚点后展开的浮层卡片，支持预览、整卡复制与分组共享停留时间。',
  states: [
    {
      title: '紧凑卡片（悬停按钮）',
      element: (
        <Column>
          <span className="pg-note">把指针移到按钮上，停留约 0.5 秒。</span>
          <HoverCard
            anchor={<Button variant="outline">悬停查看卡片</Button>}
            content={<span>这是卡片里的补充说明。</span>}
          />
        </Column>
      ),
    },
    {
      title: '可复制（点击卡片）',
      element: (
        <HoverCard
          anchor={<Button variant="outline">悬停后点击复制</Button>}
          content={<span>复制这段文字</span>}
          copyText="复制这段文字"
          copyLabel="复制"
          copiedLabel="已复制"
          openDelayMs={200}
        />
      ),
    },
    {
      title: '预览版式（preview）',
      element: (
        <HoverCard
          anchor={<Button variant="ghost">预览卡片</Button>}
          content={<span>更宽的预览版式，带背景与阴影。</span>}
          variant="preview"
          openDelayMs={200}
        />
      ),
    },
    {
      title: '分组共享停留（HoverCardGroup）',
      element: (
        <HoverCardGroup>
          <Column>
            <HoverCard
              grouped
              anchor={<Button variant="outline">第一行</Button>}
              content={<span>第一行的说明。</span>}
              openDelayMs={200}
            />
            <HoverCard
              grouped
              anchor={<Button variant="outline">第二行</Button>}
              content={<span>第二行的说明。</span>}
              openDelayMs={200}
            />
          </Column>
        </HoverCardGroup>
      ),
    },
  ],
}

export default example
