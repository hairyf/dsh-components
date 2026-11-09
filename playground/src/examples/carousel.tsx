import type { CarouselItem } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Carousel } from '@dsh-components'
import { useState } from 'react'
import { Column, Row, SAMPLE_IMAGE, SAMPLE_IMAGE_SQUARE, SAMPLE_IMAGE_TALL } from './kit'

/** More tiles than the gallery column fits, so both edge arrows appear. */
const GALLERY: readonly CarouselItem[] = [
  { id: 'wide-1', src: SAMPLE_IMAGE, alt: '横向示意图一' },
  { id: 'tall-1', src: SAMPLE_IMAGE_TALL, alt: '竖向示意图一' },
  { id: 'square-1', src: SAMPLE_IMAGE_SQUARE, alt: '正方形图表一' },
  { id: 'wide-2', src: SAMPLE_IMAGE, alt: '横向示意图二' },
  { id: 'tall-2', src: SAMPLE_IMAGE_TALL, alt: '竖向示意图二' },
  { id: 'square-2', src: SAMPLE_IMAGE_SQUARE, alt: '正方形图表二' },
  { id: 'wide-3', src: SAMPLE_IMAGE, alt: '横向示意图三' },
  { id: 'tall-3', src: SAMPLE_IMAGE_TALL, alt: '竖向示意图三' },
  { id: 'square-3', src: SAMPLE_IMAGE_SQUARE, alt: '正方形图表三' },
  { id: 'wide-4', src: SAMPLE_IMAGE, alt: '横向示意图四' },
  { id: 'tall-4', src: SAMPLE_IMAGE_TALL, alt: '竖向示意图四' },
  { id: 'square-4', src: SAMPLE_IMAGE_SQUARE, alt: '正方形图表四' },
]

/** Three tiles, few enough that the rail never overflows. */
const FEW: readonly CarouselItem[] = [
  { id: 'few-wide', src: SAMPLE_IMAGE, alt: '横向示意图' },
  { id: 'few-tall', src: SAMPLE_IMAGE_TALL, alt: '竖向示意图' },
  { id: 'few-square', src: SAMPLE_IMAGE_SQUARE, alt: '正方形图表' },
]

/** Tiles drawn from content instead of an image. */
const MARKERS: readonly CarouselItem[] = [
  { id: 'marker-1', content: <span>甲</span> },
  { id: 'marker-2', content: <span>乙</span> },
  { id: 'marker-3', content: <span>丙</span> },
  { id: 'marker-4', content: <span>丁</span> },
  { id: 'marker-5', content: <span>戊</span> },
]

/**
 * A rail that holds its own list, so a tile can be removed and the rail restored.
 * @returns the rail with its remove and restore controls.
 */
function RemovableRail(): React.JSX.Element {
  const [items, setItems] = useState<readonly CarouselItem[]>(GALLERY)
  const [picked, setPicked] = useState('')
  const current = items.find(item => item.id === picked)
  const pickedText = current === undefined
    ? '尚未点选'
    : `已选中 ${current.alt ?? current.id}`
  const summary = items.length === 0
    ? '已全部移除，点左侧按钮恢复'
    : `共 ${String(items.length)} 张，${pickedText}`
  return (
    <Column>
      <Row>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setItems(GALLERY)
            setPicked('')
          }}
        >
          恢复全部图片
        </Button>
        <span className="pg-note">{summary}</span>
      </Row>
      <Carousel
        items={items}
        onRemove={(id) => {
          setItems(list => list.filter(item => item.id !== id))
        }}
        removeLabel="移除这张图片"
        previousLabel="向前翻页"
        nextLabel="向后翻页"
        onItemClick={(id) => {
          setPicked(id)
        }}
      />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'carousel',
  group: 'layout',
  summary: '横向滚动的方块条，超出时两端出现翻页箭头，可点选、可逐个移除。',
  states: [
    {
      title: '十二张图片：两端翻页、点击方块、悬停移除',
      element: <RemovableRail />,
    },
    {
      title: '三张图片：不超出宽度时不出现箭头',
      element: (
        <Column>
          <Carousel items={FEW} previousLabel="向前翻页" nextLabel="向后翻页" />
        </Column>
      ),
    },
    {
      title: '96px 方块：内容不使用图片',
      element: (
        <Column>
          <Carousel items={MARKERS} itemSize={96} previousLabel="向前翻页" nextLabel="向后翻页" />
        </Column>
      ),
    },
  ],
}

export default example
