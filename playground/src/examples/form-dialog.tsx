import type { FormDialogOption } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { Button, FormDialog, Textarea } from '@dsh-components'
import { useEffect, useRef, useState } from 'react'
import { Column, Row } from './kit'

const OPTIONS: readonly FormDialogOption[] = [
  { id: 'simple', label: '简单' },
  { id: 'normal', label: '普通' },
  { id: 'complex', label: '复杂' },
]

/**
 * Open the full form: option chips, a text field and an in-flight submit.
 * @returns the trigger, the status line and the dialog.
 */
function OptionsFormDemo(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [choice, setChoice] = useState<string | null>('normal')
  const [detail, setDetail] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState('尚未提交。')
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)
  useEffect(() => () => {
    clearTimeout(timer.current)
  }, [])
  const submit = (): void => {
    setSubmitting(true)
    timer.current = setTimeout(() => {
      setSubmitting(false)
      setOpen(false)
      const label = OPTIONS.find(option => option.id === choice)?.label
      setStatus(label === undefined
        ? '已提交（未选择选项）。'
        : `已提交（${label}）。`)
    }, 900)
  }
  return (
    <Column>
      <Row>
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true)
          }}
        >
          打开表单
        </Button>
        <span>{status}</span>
      </Row>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="补充说明"
        options={OPTIONS}
        optionValue={choice}
        onOptionChange={setChoice}
        submitLabel="提交"
        cancelLabel="取消"
        submitting={submitting}
        onSubmit={submit}
      >
        <Textarea value={detail} onChange={setDetail} placeholder="请填写具体内容" rows={4} />
      </FormDialog>
    </Column>
  )
}

/**
 * Open the minimal form: no chips, and submit stays unavailable until text exists.
 * @returns the trigger, the status line and the dialog.
 */
function RequiredFormDemo(): React.JSX.Element {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [status, setStatus] = useState('尚未提交。')
  return (
    <Column>
      <Row>
        <Button
          variant="primary"
          onClick={() => {
            setOpen(true)
          }}
        >
          打开最简表单
        </Button>
        <span>{status}</span>
      </Row>
      <FormDialog
        open={open}
        onOpenChange={setOpen}
        title="填写标题"
        submitLabel="保存"
        cancelLabel="取消"
        submitDisabled={title.trim() === ''}
        onSubmit={() => {
          setOpen(false)
          setStatus('已保存。')
        }}
      >
        <Textarea value={title} onChange={setTitle} placeholder="请输入标题" rows={2} />
      </FormDialog>
    </Column>
  )
}

const example: ComponentExample = {
  name: 'form-dialog',
  group: 'feedback',
  summary: '带选项、表单区与提交动作的受控对话框。',
  states: [
    { title: '带选项的表单（提交时进入处理中）', element: <OptionsFormDemo /> },
    { title: '最简表单（未填写时不能提交）', element: <RequiredFormDemo /> },
  ],
}

export default example
