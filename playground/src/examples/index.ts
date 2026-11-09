import type { ComponentExample, ExampleGroup } from './kit'
import exampleActionCard from './action-card'
import exampleAnimatedRows from './animated-rows'
import exampleAvatar from './avatar'
import exampleBar from './bar'
import exampleButton from './button'
import exampleCarousel from './carousel'
import exampleCheckbox from './checkbox'
import exampleChecklist from './checklist'
import exampleChip from './chip'
import exampleCodeBlock from './code-block'
import exampleConfirmPanel from './confirm-panel'
import exampleDatePicker from './date-picker'
import exampleDescriptionList from './description-list'
import exampleDiffBlock from './diff-block'
import exampleDisclosureRow from './disclosure-row'
import exampleDocument from './document'
import exampleDropOverlay from './drop-overlay'
import exampleField from './field'
import exampleFileCard from './file-card'
import exampleFileChangeCard from './file-change-card'
import exampleFileTypeIcon from './file-type-icon'
import exampleForm from './form'
import exampleFormDialog from './form-dialog'
import exampleHoverCard from './hover-card'
import exampleIconButton from './icon-button'
import exampleImage from './image'
import exampleImageTile from './image-tile'
import exampleInlineEditor from './inline-editor'
import exampleInput from './input'
import exampleJsonBlock from './json-block'
import exampleJsonTree from './json-tree'
import exampleLightbox from './lightbox'
import exampleListRow from './list-row'
import exampleMarkdownText from './markdown-text'
import exampleMaskedText from './masked-text'
import exampleMenu from './menu'
import exampleMenuGroup from './menu-group'
import exampleMenuSurface from './menu-surface'
import exampleMeter from './meter'
import exampleModal from './modal'
import exampleOptionGroup from './option-group'
import examplePathLabel from './path-label'
import examplePill from './pill'
import examplePreviewFrame from './preview-frame'
import exampleSearchDialog from './search-dialog'
import exampleSegmentedControl from './segmented-control'
import exampleSegmentedTabs from './segmented-tabs'
import exampleSelect from './select'
import exampleSettingsGroup from './settings-group'
import exampleSettingsRow from './settings-row'
import exampleShortcutKeys from './shortcut-keys'
import exampleSpinner from './spinner'
import exampleSplitButton from './split-button'
import exampleSplitDiff from './split-diff'
import exampleStack from './stack'
import exampleStateDot from './state-dot'
import exampleStepper from './stepper'
import exampleSurface from './surface'
import exampleSwitch from './switch'
import exampleTable from './table'
import exampleTag from './tag'
import exampleTerminal from './terminal'
import exampleText from './text'
import exampleTextShimmer from './text-shimmer'
import exampleTextarea from './textarea'
import exampleTimePicker from './time-picker'
import exampleToast from './toast'
import exampleToolbar from './toolbar'
import exampleTooltip from './tooltip'
import exampleTree from './tree'
import exampleZoomControls from './zoom-controls'
import exampleZoomViewport from './zoom-viewport'

export type { ComponentExample, ExampleGroup, ExampleState } from './kit'

/** Navigation groups, in the order the components ship. */
export const EXAMPLE_GROUPS: readonly { id: ExampleGroup, label: string }[] = [
  { id: 'primitives', label: 'primitives' },
  { id: 'layout', label: 'layout' },
  { id: 'settings', label: 'settings' },
  { id: 'feedback', label: 'feedback' },
  { id: 'media', label: 'media' },
  { id: 'content', label: 'content' },
  { id: 'viewer', label: 'viewer' },
]

/** Every component the gallery exhibits, one entry per source file. */
export const EXAMPLES: readonly ComponentExample[] = [
  exampleActionCard,
  exampleAnimatedRows,
  exampleAvatar,
  exampleBar,
  exampleButton,
  exampleCarousel,
  exampleCheckbox,
  exampleChecklist,
  exampleChip,
  exampleCodeBlock,
  exampleConfirmPanel,
  exampleDatePicker,
  exampleDescriptionList,
  exampleDiffBlock,
  exampleDisclosureRow,
  exampleDocument,
  exampleDropOverlay,
  exampleField,
  exampleFileCard,
  exampleFileChangeCard,
  exampleFileTypeIcon,
  exampleFormDialog,
  exampleForm,
  exampleHoverCard,
  exampleIconButton,
  exampleImageTile,
  exampleImage,
  exampleInlineEditor,
  exampleInput,
  exampleJsonBlock,
  exampleJsonTree,
  exampleLightbox,
  exampleListRow,
  exampleMarkdownText,
  exampleMaskedText,
  exampleMenuGroup,
  exampleMenuSurface,
  exampleMenu,
  exampleMeter,
  exampleModal,
  exampleOptionGroup,
  examplePathLabel,
  examplePill,
  examplePreviewFrame,
  exampleSearchDialog,
  exampleSegmentedControl,
  exampleSegmentedTabs,
  exampleSelect,
  exampleSettingsGroup,
  exampleSettingsRow,
  exampleShortcutKeys,
  exampleSpinner,
  exampleSplitButton,
  exampleSplitDiff,
  exampleStack,
  exampleStateDot,
  exampleStepper,
  exampleSurface,
  exampleSwitch,
  exampleTable,
  exampleTag,
  exampleTerminal,
  exampleTextShimmer,
  exampleText,
  exampleTextarea,
  exampleTimePicker,
  exampleToast,
  exampleToolbar,
  exampleTooltip,
  exampleTree,
  exampleZoomControls,
  exampleZoomViewport,
]
