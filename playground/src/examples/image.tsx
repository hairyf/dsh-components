import type { ComponentExample } from './kit'
import { Image } from '@dsh-components'
import { Column, SAMPLE_IMAGE, SAMPLE_IMAGE_SQUARE, SAMPLE_IMAGE_TALL } from './kit'

const example: ComponentExample = {
  name: 'image',
  group: 'media',
  summary: '固定高度的图片框，加载中与加载失败都有明确状态。',
  states: [
    {
      title: '横向图片（960 × 540）',
      element: (
        <Column>
          <Image src={SAMPLE_IMAGE} alt="横向示意图" loadingLabel="图片加载中" failedLabel="图片加载失败" />
        </Column>
      ),
    },
    {
      title: '竖向图片（720 × 900）',
      element: (
        <Column>
          <Image src={SAMPLE_IMAGE_TALL} alt="竖向示意图" loadingLabel="图片加载中" failedLabel="图片加载失败" />
        </Column>
      ),
    },
    {
      title: '正方形图片（600 × 600）',
      element: (
        <Column>
          <Image src={SAMPLE_IMAGE_SQUARE} alt="正方形图表" loadingLabel="图片加载中" failedLabel="图片加载失败" />
        </Column>
      ),
    },
    {
      title: '加载失败',
      element: (
        <Column>
          <Image src="/missing-image.png" alt="缺失的图片" loadingLabel="图片加载中" failedLabel="图片加载失败" />
        </Column>
      ),
    },
  ],
}

export default example
