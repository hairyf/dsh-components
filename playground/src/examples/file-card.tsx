import type { FileCardLabels, FileCardState } from '@dsh-components'
import type * as React from 'react'
import type { ComponentExample } from './kit'
import { FileCard } from '@dsh-components'
import { useState } from 'react'
import { Column } from './kit'

const fileLabels: FileCardLabels = {
  uploading: '上传中…',
  failed: '上传失败，点击重试',
  retry: '重试上传',
  remove: '移除文件',
  label: '待上传文件',
}

interface PendingFile {
  readonly name: string
  readonly bytes: number
  readonly state: FileCardState
  readonly progress?: number
}

/**
 * Render one file list whose cards can be removed, and whose failed uploads
 * recover when their retry control is pressed.
 * @returns the card column.
 */
function FileCardBoard({ initial }: { readonly initial: readonly PendingFile[] }): React.JSX.Element {
  const [files, setFiles] = useState<PendingFile[]>([...initial])
  return (
    <Column>
      {files.map(file => (
        <FileCard
          key={file.name}
          name={file.name}
          bytes={file.bytes}
          state={file.state}
          progress={file.progress}
          labels={fileLabels}
          onRemove={() => {
            setFiles(list => list.filter(item => item.name !== file.name))
          }}
          onRetry={() => {
            setFiles(list => list.map((item): PendingFile => (item.name === file.name
              ? { ...item, state: 'ready' }
              : item)))
          }}
        />
      ))}
      {files.length === 0
        ? <span>暂无文件。</span>
        : null}
    </Column>
  )
}

const example: ComponentExample = {
  name: 'file-card',
  group: 'media',
  summary: '一张待上传文件的卡片，带类型图标、大小、进度与移除操作。',
  states: [
    {
      title: '上传完成（可移除）',
      element: (
        <FileCardBoard
          initial={[
            { name: 'user-guide.pdf', bytes: 1258291, state: 'ready' },
            { name: 'meeting-notes.docx', bytes: 34816, state: 'ready' },
          ]}
        />
      ),
    },
    {
      title: '上传中（带进度与不确定进度）',
      element: (
        <FileCardBoard
          initial={[
            {
              name: 'photo.png',
              bytes: 2202009,
              state: 'uploading',
              progress: 0.35,
            },
            { name: 'archive.zip', bytes: 5242880, state: 'uploading' },
          ]}
        />
      ),
    },
    {
      title: '上传失败（点击卡片重试）',
      element: (
        <FileCardBoard
          initial={[
            { name: 'chart.svg', bytes: 40960, state: 'error' },
            { name: 'user-guide.pdf', bytes: 1258291, state: 'ready' },
          ]}
        />
      ),
    },
  ],
}

export default example
