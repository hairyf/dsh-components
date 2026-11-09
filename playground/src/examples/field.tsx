import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Field, Form, Input, Tag } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** A labeled control with a help note that toggles in place. */
function HelpField(): React.JSX.Element {
  const [value, setValue] = useState('林一')
  return (
    <Column>
      <Field
        label="显示名称"
        htmlFor="field-name-help"
        helpLabel="显示名称说明"
        help={<p>名称会显示在页面顶部，最多 20 个字。</p>}
      >
        <Input
          id="field-name-help"
          value={value}
          placeholder="请输入名称"
          onChange={(event) => {
            setValue(event.target.value)
          }}
        />
      </Field>
      <span className="pg-note">点击标签旁的问号可以展开或收起说明。</span>
    </Column>
  )
}

/** A field with a state badge and a reset action in its label row. */
function BadgeField(): React.JSX.Element {
  const [value, setValue] = useState('每周一次')
  return (
    <Column>
      <Field
        label="备注"
        htmlFor="field-remark-badge"
        badges={<Tag tone="success">已保存</Tag>}
        onReset={() => {
          setValue('')
        }}
        resetLabel="清空"
      >
        <Input
          id="field-remark-badge"
          value={value}
          placeholder="请输入备注"
          onChange={(event) => {
            setValue(event.target.value)
          }}
        />
      </Field>
      <span className="pg-note">
        {value === ''
          ? '备注已清空。'
          : `当前备注：${value}`}
      </span>
    </Column>
  )
}

/** A disabled field: the control stays visible, the actions stop working. */
function DisabledField(): React.JSX.Element {
  return (
    <Column>
      <Field
        label="备注"
        htmlFor="field-remark-disabled"
        disabled
        helpLabel="备注说明"
        help={<p>当前状态不可修改。</p>}
        badges={<Tag tone="quiet">默认</Tag>}
        onReset={() => {}}
        resetLabel="清空"
      >
        <Input id="field-remark-disabled" defaultValue="由系统提供的说明" disabled />
      </Field>
    </Column>
  )
}

/** Several fields under one save action: the field's usual composition. */
function FieldForm(): React.JSX.Element {
  const [name, setName] = useState('林一')
  const [remark, setRemark] = useState('')
  const [saved, setSaved] = useState(false)
  return (
    <Column>
      <Form
        submitLabel="保存"
        onSubmit={() => {
          setSaved(true)
        }}
        footerExtra={saved
          ? <span className="pg-note">已保存</span>
          : undefined}
      >
        <Field
          label="显示名称"
          htmlFor="field-form-name"
          helpLabel="显示名称说明"
          help={<p>名称会显示在页面顶部。</p>}
        >
          <Input
            id="field-form-name"
            value={name}
            placeholder="请输入名称"
            onChange={(event) => {
              setSaved(false)
              setName(event.target.value)
            }}
          />
        </Field>
        <Field label="备注" htmlFor="field-form-remark" badges={<Tag tone="quiet">可选</Tag>}>
          <Input
            id="field-form-remark"
            value={remark}
            placeholder="补充说明"
            onChange={(event) => {
              setSaved(false)
              setRemark(event.target.value)
            }}
          />
        </Field>
      </Form>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'field',
  group: 'primitives',
  summary: '一个表单字段：标签、控件、可展开的帮助说明、状态徽标与清空操作。',
  states: [
    { title: '带帮助说明的字段（点击问号展开）', element: <HelpField /> },
    { title: '标签徽标与清空操作', element: <BadgeField /> },
    { title: '禁用字段', element: <DisabledField /> },
    { title: '字段组合成一张表单', element: <FieldForm /> },
  ],
}

export default example
