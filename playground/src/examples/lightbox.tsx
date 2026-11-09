import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, Lightbox } from '@dsh-components'
import { useState } from 'react'
import { Column, lightboxLabels, SAMPLE_IMAGE, SAMPLE_IMAGE_SQUARE, SAMPLE_IMAGE_TALL } from './kit'

/**
 * Mount the document-level viewer on demand and close it from its own control,
 * the mask, or Escape.
 * @returns the trigger and, while open, the viewer.
 */
function LightboxDemo({ src, alt, trigger }: { readonly src: string, readonly alt: string, readonly trigger: string }): React.JSX.Element {
  const [open, setOpen] = useState(false)
  return (
    <Column>
      <Button
        variant="outline"
        onClick={() => {
          setOpen(true)
        }}
      >
        {trigger}
      </Button>
      {open
        ? (
            <Lightbox
              src={src}
              alt={alt}
              labels={lightboxLabels}
              onClose={() => {
                setOpen(false)
              }}
            />
          )
        : null}
    </Column>
  )
}

const example: ComponentExample = {
  name: 'lightbox',
  group: 'media',
  summary: '整页的图片查看层，按 Esc、遮罩或关闭按钮退出。',
  states: [
    {
      title: '横向原图（960 × 540）',
      element: <LightboxDemo src={SAMPLE_IMAGE} alt="横向示意图" trigger="打开横向预览" />,
    },
    {
      title: '竖向原图（720 × 900）',
      element: <LightboxDemo src={SAMPLE_IMAGE_TALL} alt="竖向示意图" trigger="打开竖向预览" />,
    },
    {
      title: '正方形原图（600 × 600）',
      element: <LightboxDemo src={SAMPLE_IMAGE_SQUARE} alt="正方形图表" trigger="打开正方形预览" />,
    },
  ],
}

export default example
