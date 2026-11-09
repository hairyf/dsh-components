import type { DescriptionItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { DescriptionList, ZoomControls, ZoomViewport } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

const FIELDS: readonly DescriptionItem[] = [
  { key: 'name', label: '名称', value: '示例条目' },
  { key: 'kind', label: '类型', value: '说明文档' },
  { key: 'size', label: '大小', value: '12.4 KB' },
  { key: 'updated', label: '更新时间', value: '2026-03-02 09:12' },
  { key: 'note', label: '备注', value: '内容宽度由 scale 与固有宽度共同决定。' },
]

/**
 * The default mode: content never grows past the viewport width.
 * @returns the viewport with its bar and a caption.
 */
function FitWidthViewport(): React.JSX.Element {
  const [zoom, setZoom] = useState(1)
  return (
    <Column>
      <ZoomViewport zoom={zoom} mode="fit-width" width={480} frameWidth={560}>
        <DescriptionList items={FIELDS} />
        <ZoomControls
          value={zoom}
          onChange={setZoom}
          visible
          zoomInLabel="放大"
          zoomOutLabel="缩小"
          resetLabel="实际大小"
        />
      </ZoomViewport>
      <span className="pg-note">
        {`按宽度适配：内容不超过视口宽度，缩放只改变读数（当前 ${String(Math.round(zoom * 100))}%）`}
      </span>
    </Column>
  )
}

/**
 * Fixed mode: content width is the intrinsic width times the scale.
 * @returns the viewport with its bar and a caption.
 */
function FixedViewport(): React.JSX.Element {
  const [zoom, setZoom] = useState(1.5)
  return (
    <Column>
      <ZoomViewport zoom={zoom} mode="fixed" width={480} frameWidth={560}>
        <DescriptionList items={FIELDS} />
        <ZoomControls
          value={zoom}
          onChange={setZoom}
          visible
          zoomInLabel="放大"
          zoomOutLabel="缩小"
          resetLabel="实际大小"
        />
      </ZoomViewport>
      <span className="pg-note">
        {`固定宽度：内容宽 480px 乘 ${String(zoom)}，当前 ${String(Math.round(zoom * 100))}%，超出视口可横向滚动`}
      </span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'zoom-viewport',
  group: 'viewer',
  summary: '把缩放比例发布为 CSS 变量的滚动视口，按宽度适配或固定宽度两种模式。',
  states: [
    { title: '按宽度适配（默认模式）', element: <FitWidthViewport /> },
    { title: '固定宽度：内容随缩放变宽，可横向滚动', element: <FixedViewport /> },
    {
      title: '不接缩放条：比例固定为 150%',
      element: (
        <Column>
          <ZoomViewport zoom={1.5} mode="fixed" width={480} frameWidth={560}>
            <DescriptionList items={FIELDS} />
          </ZoomViewport>
          <span className="pg-note">调用方直接给出比例，视口按 480px 乘 1.5 绘制内容。</span>
        </Column>
      ),
    },
  ],
}

export default example
