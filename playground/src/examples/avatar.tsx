import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Avatar } from '@dsh-components'
import { Column, Row, SAMPLE_IMAGE_SQUARE, SAMPLE_IMAGE_TALL } from './kit'

/** Names only: each avatar falls back to the name's first character. */
function InitialAvatars(): React.JSX.Element {
  return (
    <Row>
      <Avatar name="林一" />
      <Avatar name="周明" size={24} />
      <Avatar name="Ada Lovelace" size={48} />
    </Row>
  )
}

/**
 * One loaded image and one broken address, so the fallback shows next to the image.
 * @returns the avatar row and its note.
 */
function ImageAvatars(): React.JSX.Element {
  return (
    <Column>
      <Row>
        <Avatar src={SAMPLE_IMAGE_SQUARE} name="示例图片" size={40} />
        <Avatar src={SAMPLE_IMAGE_TALL} name="竖版图片" size={40} />
        <Avatar src="/missing/avatar.png" name="加载失败" size={40} />
      </Row>
      <span className="pg-note">第三个头像的图片地址不存在，加载失败后改显示名称首字。</span>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'avatar',
  group: 'primitives',
  summary: '圆形头像：有图片时裁切显示图片，没有图片时显示名称首字，尺寸可调。',
  states: [
    { title: '只有名称：显示首字（三种尺寸）', element: <InitialAvatars /> },
    { title: '有图片与图片加载失败', element: <ImageAvatars /> },
    {
      title: '替代说明：显式描述与装饰性头像',
      element: (
        <Row>
          <Avatar src={SAMPLE_IMAGE_SQUARE} alt="示例图片的描述" size={40} />
          <Avatar name="匿名" alt="" size={40} />
        </Row>
      ),
    },
  ],
}

export default example
