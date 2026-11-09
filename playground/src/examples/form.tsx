import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Field, Form, Input } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

/** A complete form: two fields, one save action, and a saved note in the save row. */
function CombinedForm(): React.JSX.Element {
  const [name, setName] = useState('林一')
  const [remark, setRemark] = useState('')
  const [status, setStatus] = useState('尚未保存。')
  return (
    <Column>
      <Form
        submitLabel="保存"
        onSubmit={() => {
          setStatus('已保存。')
        }}
        footerExtra={<span className="pg-note">{status}</span>}
      >
        <Field label="显示名称" htmlFor="form-name">
          <Input
            id="form-name"
            value={name}
            placeholder="请输入名称"
            onChange={(event) => {
              setStatus('有未保存的修改。')
              setName(event.target.value)
            }}
          />
        </Field>
        <Field label="备注" htmlFor="form-remark">
          <Input
            id="form-remark"
            value={remark}
            placeholder="补充说明"
            onChange={(event) => {
              setStatus('有未保存的修改。')
              setRemark(event.target.value)
            }}
          />
        </Field>
      </Form>
    </Column>
  )
}

/** While saving, the single save action stays disabled. */
function SubmittingForm(): React.JSX.Element {
  return (
    <Column>
      <Form
        submitLabel="正在保存"
        submitting
        onSubmit={() => {}}
      >
        <Field label="显示名称" htmlFor="form-submitting-name">
          <Input id="form-submitting-name" defaultValue="林一" />
        </Field>
      </Form>
      <span className="pg-note">提交过程中保存按钮不可再次点击。</span>
    </Column>
  )
}

/** A failed save keeps the controls and prints the reason beside them. */
function FailedForm(): React.JSX.Element {
  return (
    <Column>
      <Form
        submitLabel="保存"
        failed="保存失败，请稍后重试。"
        onSubmit={() => {}}
      >
        <Field label="备注" htmlFor="form-failed-remark">
          <Input id="form-failed-remark" defaultValue="待保存的备注" />
        </Field>
      </Form>
      <span className="pg-note">失败信息显示在保存按钮左侧。</span>
    </Column>
  )
}

/** The two notes that describe a form the caller cannot write. */
function UnavailableForms(): React.JSX.Element {
  return (
    <Column>
      <Form
        submitLabel="保存"
        onSubmit={() => {}}
        readOnlyNote="当前为只读状态，内容不可修改。"
        disabled
      >
        <Field label="显示名称" htmlFor="form-readonly-name">
          <Input id="form-readonly-name" defaultValue="林一" disabled />
        </Field>
      </Form>
      <Form
        submitLabel="保存"
        onSubmit={() => {}}
        unavailableNote="这一项暂不可用。"
      />
    </Column>
  )
}

const example: ComponentExample = {
  name: 'form',
  group: 'primitives',
  summary: '一个只有单个保存动作的表单容器，照顾保存中、保存失败与不可写三种状态。',
  states: [
    { title: '组合成一张表单：填写后保存', element: <CombinedForm /> },
    { title: '提交中：保存按钮不可用', element: <SubmittingForm /> },
    { title: '保存失败：给出原因', element: <FailedForm /> },
    { title: '只读提示与不可用占位', element: <UnavailableForms /> },
  ],
}

export default example
