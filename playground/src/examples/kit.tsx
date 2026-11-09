import type {
  CodeToolbarLabels,
  DetailDocumentCopy,
  DetailDocumentLabels,
  DiffBlockLabels,
  ImageLightboxLabels,
  JsonTreeLabels,
  MarkdownLabels,
  ReadBlockLabels,
  SearchBlockLabels,
  TerminalBlockLabels,
  WebBlockLabels,
} from '@dsh-components'
import type { ReactElement, ReactNode } from 'react'
import sampleSquare from '../assets/chart-square.svg'
import sampleTall from '../assets/screenshot-tall.svg'
import sampleWide from '../assets/screenshot-wide.svg'

/**
 * Top-level grouping of the gallery index.
 *
 * The names mirror the directories under src/components, so a new component
 * group becomes a navigation section without editing this type.
 */
export type ExampleGroup
  = | 'primitives'
    | 'layout'
    | 'settings'
    | 'feedback'
    | 'media'
    | 'content'
    | 'viewer'

/** One titled card of a component's gallery page. */
export interface ExampleState {
  /** Card caption, usually the prop combination under test. */
  title: string
  /** The rendered state. */
  element: ReactElement
}

/** The gallery contract every `examples/<param-case>.tsx` file exports. */
export interface ComponentExample {
  /** Kebab-case file stem, also the navigation label. */
  name: string
  /** Group in the left navigation. */
  group: ExampleGroup
  /** One sentence about what the cards demonstrate. */
  summary: string
  /** Every state the component can show, each rendered in its own card. */
  states: readonly ExampleState[]
}

/** Horizontal control row. */
export function Row({ children }: { children: ReactNode }): React.JSX.Element {
  return <div className="pg-row">{children}</div>
}

/** Vertical stack for surfaces that own their own width. */
export function Column({ children }: { children: ReactNode }): React.JSX.Element {
  return <div className="pg-column">{children}</div>
}

/** Neutral glyph for props that accept an icon node. */
export function Glyph({ size = 14 }: { size?: number }): React.JSX.Element {
  return (
    <svg width={size} height={size} viewBox="0 0 16 16" fill="none" aria-hidden="true">
      <circle cx="8" cy="8" r="5.5" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  )
}

/** A real screenshot-shaped image, bundled so preview states need no network. */
export const SAMPLE_IMAGE = sampleWide

/** A portrait image, for the states that depend on aspect ratio. */
export const SAMPLE_IMAGE_TALL = sampleTall

/** A square image, for grid and tile states. */
export const SAMPLE_IMAGE_SQUARE = sampleSquare

/** Official code toolbar labels, zh copy. */
export const toolbarLabels: CodeToolbarLabels = {
  codeLabel: '代码',
  wrapLabel: '自动换行',
  unwrapLabel: '取消换行',
}

/** Head/tail fold copy shared by the capped blocks. */
const foldLabels = {
  collapseAria: '收起',
  expandAria: (hidden: number): string => `展开剩余 ${String(hidden)} 行`,
  collapse: '收起',
  expand: (hidden: number): string => `展开剩余 ${String(hidden)} 行`,
}

/** Terminal block labels. */
export const terminalLabels: TerminalBlockLabels = {
  commandLine: (line: number): string => `第 ${String(line)} 行命令`,
  signal: (signal: string): string => `信号 ${signal}`,
  exitCode: (code: number): string => `退出码 ${String(code)}`,
  noExitCode: '无退出码',
  running: '运行中',
  failed: '失败',
  done: '完成',
  copy: '复制',
  copied: '已复制',
  noOutput: '无输出',
  ...foldLabels,
}

/** Read block labels. */
export const readLabels: ReadBlockLabels = {
  ...toolbarLabels,
  window: (shown: number, total: number): string => `显示 ${String(shown)} / ${String(total)} 行`,
  copy: '复制',
  copied: '已复制',
  ...foldLabels,
}

/** Diff block labels. */
export const diffLabels: DiffBlockLabels = {
  ...toolbarLabels,
  copy: '复制',
  copied: '已复制',
  ...foldLabels,
}

/** Search block labels. */
export const searchLabels: SearchBlockLabels = {
  pathsSummary: (shown: number, total: number, truncated: boolean): string => (truncated
    ? `显示 ${String(shown)} / 共 ${String(total)} 个路径`
    : `${String(shown)} 个路径`),
  matchesSummary: (shown: number, total: number, files: number, truncated: boolean): string => (truncated
    ? `显示 ${String(shown)} / 共 ${String(total)} 处匹配 · ${String(files)} 个文件`
    : `${String(shown)} 处匹配 · ${String(files)} 个文件`),
  copy: '复制',
  copied: '已复制',
  noResults: '无结果',
  ...foldLabels,
}

/** Markdown labels, including the fenced-code toolbar. */
export const markdownLabels: MarkdownLabels = {
  code: {
    copyLabel: '复制',
    copiedLabel: '已复制',
    toolbarLabels,
  },
  footnotes: '脚注',
}

/** Web block labels. */
export const webLabels: WebBlockLabels = {
  noResults: '无结果',
  sourcesTruncated: '来源已截断',
  http: 'HTTP',
  contentTruncated: '内容已截断',
  markdown: markdownLabels,
}

/** JSON tree labels. */
export const jsonTreeLabels: JsonTreeLabels = {
  copyValue: '复制值',
  copyJson: '复制 JSON',
  copyPath: '复制路径',
  copyPrettyJson: '复制格式化 JSON',
  copyCompactJson: '复制紧凑 JSON',
  copied: '已复制',
  copyFailed: '复制失败',
  collapseNode: '收起节点',
  expandNode: '展开节点',
  copyButtonTitle: (action: string): string => action,
}

/** Detail document copy, as the official render site localizes it. */
export const detailCopy: DetailDocumentCopy = {
  title: '详情',
  loading: '加载中',
  retry: '重试',
  copy: '复制',
  copied: '已复制',
  codeBlock: '代码',
  wrap: '自动换行',
  unwrap: '取消换行',
  footnotes: '脚注',
}

/** Detail document labels, assembled the way `useDetailDocumentLabels` does. */
export const detailLabels: DetailDocumentLabels = {
  title: detailCopy.title,
  loading: detailCopy.loading,
  retry: detailCopy.retry,
  markdown: {
    code: {
      copyLabel: detailCopy.copy,
      copiedLabel: detailCopy.copied,
      toolbarLabels: {
        codeLabel: detailCopy.codeBlock,
        wrapLabel: detailCopy.wrap,
        unwrapLabel: detailCopy.unwrap,
      },
    },
    footnotes: detailCopy.footnotes,
  },
}

/** Image lightbox labels. */
export const lightboxLabels: ImageLightboxLabels = {
  dialog: '预览图片',
  close: '关闭',
}
