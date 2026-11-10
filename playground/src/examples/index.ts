import type { ComponentExample, ExampleGroup } from './kit'
import exampleActionCard from './action-card'
import exampleAvatar from './avatar'
import exampleBar from './bar'
import exampleCarousel from './carousel'
import exampleChecklist from './checklist'
import exampleChip from './chip'
import exampleCodeBlock from './code-block'
import exampleConfirmPanel from './confirm-panel'
import exampleDatePicker from './date-picker'
import exampleDescriptionList from './description-list'
import exampleDocument from './document'
import exampleDropOverlay from './drop-overlay'
import exampleField from './field'
import exampleFileCard from './file-card'
import exampleFileChangeCard from './file-change-card'
import exampleForm from './form'
import exampleFormDialog from './form-dialog'
import exampleIconButton from './icon-button'
import exampleImage from './image'
import exampleImageTile from './image-tile'
import exampleLightbox from './lightbox'
import exampleListRow from './list-row'
import exampleMaskedText from './masked-text'
import exampleMenu from './menu'
import exampleMenuSurface from './menu-surface'
import exampleMeter from './meter'
import exampleOptionGroup from './option-group'
import examplePreviewFrame from './preview-frame'
import exampleSearchDialog from './search-dialog'
import exampleSelect from './select'
import exampleSettingsGroup from './settings-group'
import exampleSettingsRow from './settings-row'
import exampleSpinner from './spinner'
import exampleSplitButton from './split-button'
import exampleSplitDiff from './split-diff'
import exampleStack from './stack'
import exampleStepper from './stepper'
import exampleSurface from './surface'
import exampleTable from './table'
import exampleTerminal from './terminal'
import exampleText from './text'
import exampleTextarea from './textarea'
import exampleTimePicker from './time-picker'
import exampleToast from './toast'
import exampleToolbar from './toolbar'
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
  exampleAvatar,
  exampleBar,
  exampleCarousel,
  exampleChecklist,
  exampleChip,
  exampleCodeBlock,
  exampleConfirmPanel,
  exampleDatePicker,
  exampleDescriptionList,
  exampleDocument,
  exampleDropOverlay,
  exampleField,
  exampleFileCard,
  exampleFileChangeCard,
  exampleFormDialog,
  exampleForm,
  exampleIconButton,
  exampleImageTile,
  exampleImage,
  exampleLightbox,
  exampleListRow,
  exampleMaskedText,
  exampleMenuSurface,
  exampleMenu,
  exampleMeter,
  exampleOptionGroup,
  examplePreviewFrame,
  exampleSearchDialog,
  exampleSelect,
  exampleSettingsGroup,
  exampleSettingsRow,
  exampleSpinner,
  exampleSplitButton,
  exampleSplitDiff,
  exampleStack,
  exampleStepper,
  exampleSurface,
  exampleTable,
  exampleTerminal,
  exampleText,
  exampleTextarea,
  exampleTimePicker,
  exampleToast,
  exampleToolbar,
  exampleTree,
  exampleZoomControls,
  exampleZoomViewport,
]
