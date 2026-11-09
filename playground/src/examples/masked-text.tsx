import type * as React from 'react'
import type { ComponentExample } from './kit'
import { MaskedText } from '@dsh-components'
import { useState } from 'react'
import { Column, Row } from './kit'

function RevealableValue(): React.JSX.Element {
  const [revealed, setRevealed] = useState(false)
  return (
    <Row>
      <span className="pg-note">访问令牌：</span>
      <MaskedText
        value="sk-demo-1234567890"
        masked="sk-demo-**********"
        revealed={revealed}
        onRevealedChange={setRevealed}
      />
    </Row>
  )
}

const example: ComponentExample = {
  name: 'masked-text',
  group: 'primitives',
  summary: '掩码显示一段敏感文本，可选眼睛按钮在原值与掩码之间切换。',
  states: [
    { title: '可切换显示 / 隐藏（可交互）', element: <RevealableValue /> },
    {
      title: '只读掩码',
      element: (
        <Column>
          <Row>
            <span className="pg-note">默认掩码：</span>
            <MaskedText value="sk-demo-1234567890" />
          </Row>
          <Row>
            <span className="pg-note">自定义掩码：</span>
            <MaskedText value="postgres://demo:secret@localhost/app" masked="postgres://demo:******@localhost/app" />
          </Row>
          <Row>
            <span className="pg-note">固定长度：</span>
            <MaskedText value="abcdefgh" count={4} />
          </Row>
        </Column>
      ),
    },
    {
      title: '默认显示原值',
      element: (
        <Row>
          <span className="pg-note">令牌：</span>
          <MaskedText value="sk-demo-1234567890" revealed />
        </Row>
      ),
    },
  ],
}

export default example
