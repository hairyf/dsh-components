import type { ComponentExample, ExampleGroup } from './kit'
import actionCard from './action-card'
import animatedRows from './animated-rows'
import bar from './bar'
import button from './button'
import checkbox from './checkbox'
import checklist from './checklist'
import chip from './chip'
import codeBlock from './code-block'
import confirmPanel from './confirm-panel'
import descriptionList from './description-list'
import diffBlock from './diff-block'
import disclosureRow from './disclosure-row'
import document from './document'
import dropOverlay from './drop-overlay'
import fileCard from './file-card'
import fileTypeIcon from './file-type-icon'
import formDialog from './form-dialog'
import hoverCard from './hover-card'
import iconButton from './icon-button'
import image from './image'
import imageTile from './image-tile'
import inlineEditor from './inline-editor'
import input from './input'
import jsonBlock from './json-block'
import jsonTree from './json-tree'
import lightbox from './lightbox'
import listRow from './list-row'
import markdownText from './markdown-text'
import maskedText from './masked-text'
import menu from './menu'
import menuGroup from './menu-group'
import menuSurface from './menu-surface'
import meter from './meter'
import modal from './modal'
import optionGroup from './option-group'
import pathLabel from './path-label'
import pill from './pill'
import searchDialog from './search-dialog'
import segmentedControl from './segmented-control'
import segmentedTabs from './segmented-tabs'
import select from './select'
import settingsGroup from './settings-group'
import settingsRow from './settings-row'
import shortcutKeys from './shortcut-keys'
import spinner from './spinner'
import splitButton from './split-button'
import stack from './stack'
import stateDot from './state-dot'
import stepper from './stepper'
import surface from './surface'
import switchExample from './switch'
import tag from './tag'
import terminal from './terminal'
import text from './text'
import textShimmer from './text-shimmer'
import textarea from './textarea'
import toast from './toast'
import tooltip from './tooltip'
import tree from './tree'

export type { ComponentExample, ExampleGroup, ExampleState } from './kit'

/** Navigation groups, in the order the components ship. */
export const EXAMPLE_GROUPS: readonly { id: ExampleGroup, label: string }[] = [
  { id: 'primitives', label: 'primitives' },
  { id: 'layout', label: 'layout' },
  { id: 'settings', label: 'settings' },
  { id: 'feedback', label: 'feedback' },
  { id: 'media', label: 'media' },
  { id: 'content', label: 'content' },
]

/** Every component the gallery exhibits, one entry per source file. */
export const EXAMPLES: readonly ComponentExample[] = [
  actionCard,
  confirmPanel,
  dropOverlay,
  formDialog,
  searchDialog,
  fileCard,
  image,
  imageTile,
  lightbox,
  codeBlock,
  diffBlock,
  document,
  jsonBlock,
  jsonTree,
  markdownText,
  terminal,
  bar,
  checklist,
  descriptionList,
  listRow,
  meter,
  stack,
  surface,
  tree,
  optionGroup,
  select,
  settingsGroup,
  settingsRow,
  splitButton,
  stepper,
  animatedRows,
  button,
  checkbox,
  chip,
  disclosureRow,
  fileTypeIcon,
  hoverCard,
  iconButton,
  inlineEditor,
  input,
  maskedText,
  menu,
  menuGroup,
  menuSurface,
  modal,
  pathLabel,
  pill,
  segmentedControl,
  segmentedTabs,
  shortcutKeys,
  spinner,
  stateDot,
  switchExample,
  tag,
  text,
  textShimmer,
  textarea,
  toast,
  tooltip,
]
