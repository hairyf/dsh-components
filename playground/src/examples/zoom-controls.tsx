import type { DescriptionItem } from '@dsh-components'
import type { ComponentExample } from './kit'
import { Button, DescriptionList, ZoomControls, ZoomViewport } from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

const FIELDS: readonly DescriptionItem[] = [
  { key: 'name', label: '名称', value: '示例条目' },
  { key: 'kind', label: '类型', value: '说明文档' },
  { key: 'size', label: '大小', value: '12.4 KB' },
  { key: 'updated', label: '更新时间', value: '2026-03-02 09:12' },
  { key: 'note', label: '备注', value: '宽度随缩放比例变化，超出视口后可横向滚动。' },
]

/**
 * A viewport whose floating bar owns the scale.
 * @returns the viewport, its bar and a caption with the current scale.
 */
function LinkedZoom(): React.JSX.Element {
  const [zoom, setZoom] = useState(1)
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
        {`当前缩放 ${String(Math.round(zoom * 100))}%，点击加减或从菜单里选一个百分比`}
      </span>
    </Column>
  )
}

/**
 * A bar that owns a bounded scale grid.
 * @returns the viewport, its bar and a caption about the limits.
 */
function BoundedZoom(): React.JSX.Element {
  const [zoom, setZoom] = useState(2)
  return (
    <Column>
      <ZoomViewport zoom={zoom} mode="fixed" width={420} frameWidth={560}>
        <DescriptionList items={FIELDS} />
        <ZoomControls
          value={zoom}
          onChange={setZoom}
          min={0.5}
          max={2}
          step={0.5}
          presets={[0.5, 1, 1.5, 2]}
          visible
          zoomInLabel="放大"
          zoomOutLabel="缩小"
          resetLabel="实际大小"
        />
      </ZoomViewport>
      <span className="pg-note">
        {`范围 50% 到 200%，步长 50%；当前 ${String(Math.round(zoom * 100))}%，到达边界时对应按钮禁用`}
      </span>
    </Column>
  )
}

/**
 * A bar that starts hidden and is toggled from outside the viewport.
 * @returns the viewport, its bar and the toggle.
 */
function HiddenZoom(): React.JSX.Element {
  const [zoom, setZoom] = useState(1)
  const [shown, setShown] = useState(false)
  return (
    <Column>
      <Row>
        <Button
          size="sm"
          variant="outline"
          onClick={() => {
            setShown(value => !value)
          }}
        >
          {shown ? '隐藏缩放条' : '显示缩放条'}
        </Button>
        <span className="pg-note">
          {shown ? '缩放条已显示，可以点击' : '缩放条已隐藏，淡出且不可交互'}
        </span>
      </Row>
      <ZoomViewport zoom={zoom} mode="fit-width" width={480} frameWidth={560}>
        <DescriptionList items={FIELDS} />
        <ZoomControls
          value={zoom}
          onChange={setZoom}
          visible={shown}
          zoomInLabel="放大"
          zoomOutLabel="缩小"
        />
      </ZoomViewport>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'zoom-controls',
  group: 'viewer',
  summary: '悬浮在内容底部的缩放条：缩小、百分比菜单、放大，可指定范围、步长与预设。',
  states: [
    { title: '缩放条与视口联动', element: <LinkedZoom /> },
    { title: '限定范围与步长，到达边界时按钮禁用', element: <BoundedZoom /> },
    { title: '隐藏状态：由外部按钮切换显示', element: <HiddenZoom /> },
  ],
}

export default example
