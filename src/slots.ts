/**
 * The official DSH slot catalog.
 *
 * Recovered from the UI prebundles by scripts/extract-slots.mjs and generated
 * by scripts/generate-slots.mjs. Do not edit by hand.
 */

/** Top-level region a slot belongs to. */
type SlotScope = 'conversation' | 'sidebar' | 'rightbar' | 'settings' | 'plugins' | 'frame' | 'tool' | 'contextMenu' | 'other'

/**
 * What a slot accepts.
 * - icon: a leaf glyph (an Icon* component), rendered inside an existing control.
 * - content: arbitrary content, rendered in a layout seat.
 */
type SlotKind = 'icon' | 'content'

/**
 * Runtime registration form of a slot.
 * - single: one occupant renders, a second registration shadows the first.
 * - keyed: occupants are separated per key.
 * - list: any number of occupants render, ordered.
 * - chain: several register but exactly one is elected to render.
 */
type SlotContract = 'single' | 'keyed' | 'list' | 'chain'

/** One official slot and the packages that read it. */
export interface DshSlot {
  /** Region the slot belongs to. */
  readonly scope: SlotScope
  /** Leaf glyph or arbitrary content. */
  readonly kind: SlotKind
  /** Runtime registration form. */
  readonly contract: SlotContract
  /**
   * Packages that call renderSlot with this key, i.e. the host components.
   * Not the plugins that register content: those are a separate set.
   */
  readonly readers: readonly string[]
}

/** Every official slot key, with its metadata. */
export const DSH_SLOTS = {
  'contextMenu.content': {
    scope: 'contextMenu',
    kind: 'content',
    contract: 'single',
    readers: ['context-menu'],
  },
  'contextMenu.icon': {
    scope: 'contextMenu',
    kind: 'icon',
    contract: 'single',
    readers: ['context-menu'],
  },
  'conversation.approval.detail': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['approval'],
  },
  'conversation.chat.assistant-actions': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.commandview': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.flow': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.message.images': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.node': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.reasoning.body': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.text-interaction': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.turnTail': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.chat.user.before': {
    scope: 'conversation',
    kind: 'content',
    contract: 'chain',
    readers: ['chat'],
  },
  'conversation.chat.user.images': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['chat'],
  },
  'conversation.composer': {
    scope: 'conversation',
    kind: 'content',
    contract: 'chain',
    readers: ['conversation'],
  },
  'conversation.composer.bar': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.composer.dock': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.header': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.header.leading': {
    scope: 'conversation',
    kind: 'icon',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.hero.agentPreset': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.hero.brand.mark': {
    scope: 'conversation',
    kind: 'icon',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.hero.options': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.hero.workspace': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.hero.workspace.directoryFlow': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
  'conversation.input.activity': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.attachments': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.dock': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.left': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.model': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.model.label': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['model-selection'],
  },
  'conversation.input.overlay': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.permission': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.plan': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.input.right': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.plan-review.actions': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['user-questions'],
  },
  'conversation.session': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation', 'subagent'],
  },
  'conversation.session.header': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.session.header.actions': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.session.header.corner': {
    scope: 'conversation',
    kind: 'icon',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.session.header.lineage': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.session.header.utilities': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.session.header.views.actions': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.trajectory.images': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['trajectory'],
  },
  'conversation.user.text.node': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'conversation.view': {
    scope: 'conversation',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'deliverables.file.actions': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['deliverables'],
  },
  'deliverables.review.file.actions': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['deliverables'],
  },
  'main': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['layout'],
  },
  'main.conversation': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['conversation'],
  },
  'plugins.add.actions': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.bundle.activation': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.bundle.config': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.detail.actions': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.detail.badge': {
    scope: 'plugins',
    kind: 'icon',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.detail.section': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.item': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.row.config': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'plugins.tab': {
    scope: 'plugins',
    kind: 'content',
    contract: 'single',
    readers: ['plugin-manager'],
  },
  'rightbar': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['layout'],
  },
  'rightbar.session': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-right'],
  },
  'root': {
    scope: 'frame',
    kind: 'content',
    contract: 'single',
    readers: ['renderer'],
  },
  'settings.action': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.close': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.general.item': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.header': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.launcher': {
    scope: 'settings',
    kind: 'icon',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.models.footer': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-models'],
  },
  'settings.models.provider-card': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-models'],
  },
  'settings.models.sign-in': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-models'],
  },
  'settings.onboarding': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.plugins.tab': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-plugins'],
  },
  'settings.section': {
    scope: 'settings',
    kind: 'content',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.section.icon': {
    scope: 'settings',
    kind: 'icon',
    contract: 'single',
    readers: ['settings-general'],
  },
  'settings.trigger': {
    scope: 'settings',
    kind: 'icon',
    contract: 'single',
    readers: ['settings-general'],
  },
  'shell.bottom': {
    scope: 'frame',
    kind: 'content',
    contract: 'single',
    readers: ['layout'],
  },
  'shell.leading': {
    scope: 'frame',
    kind: 'icon',
    contract: 'single',
    readers: ['layout'],
  },
  'shell.overlay': {
    scope: 'frame',
    kind: 'content',
    contract: 'single',
    readers: ['layout'],
  },
  'shell.quota-notice': {
    scope: 'frame',
    kind: 'content',
    contract: 'chain',
    readers: ['chat'],
  },
  'sidebar': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['layout'],
  },
  'sidebar.brand.mark': {
    scope: 'sidebar',
    kind: 'icon',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.brand.name': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.chat.conversation': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['subagent'],
  },
  'sidebar.footer.action': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.panellist': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.panellist.actions': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.right.pane.tab': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'keyed',
    readers: ['sidebar-right'],
  },
  'sidebar.right.pane.tab.title': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'keyed',
    readers: ['sidebar-right'],
  },
  'sidebar.right.tab.document': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-documentpreview'],
  },
  'sidebar.right.tab.document.action': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-documentpreview'],
  },
  'sidebar.right.tab.document.actions': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-documentpreview'],
  },
  'sidebar.right.tab.document.office.pdf': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-documentpreview'],
  },
  'sidebar.right.tab.document.unpreviewable': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-documentpreview'],
  },
  'sidebar.right.tab.files.actions': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-files'],
  },
  'sidebar.right.tab.guide': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'chain',
    readers: ['sidebar-right'],
  },
  'sidebar.right.tab.guide.actions': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-right'],
  },
  'sidebar.right.tab.guide.entry': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-right'],
  },
  'sidebar.right.tab.menu.item': {
    scope: 'rightbar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar-right'],
  },
  'sidebar.session.row.hover': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
  'sidebar.session.row.leading': {
    scope: 'sidebar',
    kind: 'icon',
    contract: 'single',
    readers: ['workspace'],
  },
  'sidebar.session.row.trailing': {
    scope: 'sidebar',
    kind: 'icon',
    contract: 'single',
    readers: ['workspace'],
  },
  'sidebar.settings': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.toggle.badge': {
    scope: 'sidebar',
    kind: 'icon',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.workspaces': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['sidebar'],
  },
  'sidebar.workspaces.directoryFlow': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
  'sidebar.workspaces.session.menu.item': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
  'sidebar.workspaces.session.row.action': {
    scope: 'sidebar',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
  'tool.call.images': {
    scope: 'tool',
    kind: 'content',
    contract: 'single',
    readers: ['tool'],
  },
  'tool.call.toolview': {
    scope: 'tool',
    kind: 'content',
    contract: 'single',
    readers: ['tool'],
  },
  'tool.view.cordis': {
    scope: 'tool',
    kind: 'content',
    contract: 'single',
    readers: ['cordis'],
  },
  'workspace.toast': {
    scope: 'other',
    kind: 'content',
    contract: 'single',
    readers: ['workspace'],
  },
} as const

/** Official slot key. */
export type DshSlotKey = keyof typeof DSH_SLOTS

/** Keys that expect a leaf glyph; the seats an Icon* component drops into. */
export const DSH_ICON_SLOTS = [
  'contextMenu.icon',
  'conversation.header.leading',
  'conversation.hero.brand.mark',
  'conversation.session.header.corner',
  'plugins.detail.badge',
  'settings.launcher',
  'settings.section.icon',
  'settings.trigger',
  'shell.leading',
  'sidebar.brand.mark',
  'sidebar.session.row.leading',
  'sidebar.session.row.trailing',
  'sidebar.toggle.badge',
] as const

/** A slot that accepts a leaf glyph. */
export type DshIconSlotKey = (typeof DSH_ICON_SLOTS)[number]

/** Slot keys grouped by region. */
export const DSH_SLOTS_BY_SCOPE = {
  contextMenu: ['contextMenu.content', 'contextMenu.icon'],
  conversation: [
    'conversation.approval.detail',
    'conversation.chat.assistant-actions',
    'conversation.chat.commandview',
    'conversation.chat.flow',
    'conversation.chat.message.images',
    'conversation.chat.node',
    'conversation.chat.reasoning.body',
    'conversation.chat.text-interaction',
    'conversation.chat.turnTail',
    'conversation.chat.user.before',
    'conversation.chat.user.images',
    'conversation.composer',
    'conversation.composer.bar',
    'conversation.composer.dock',
    'conversation.header',
    'conversation.header.leading',
    'conversation.hero.agentPreset',
    'conversation.hero.brand.mark',
    'conversation.hero.options',
    'conversation.hero.workspace',
    'conversation.hero.workspace.directoryFlow',
    'conversation.input.activity',
    'conversation.input.attachments',
    'conversation.input.dock',
    'conversation.input.left',
    'conversation.input.model',
    'conversation.input.model.label',
    'conversation.input.overlay',
    'conversation.input.permission',
    'conversation.input.plan',
    'conversation.input.right',
    'conversation.plan-review.actions',
    'conversation.session',
    'conversation.session.header',
    'conversation.session.header.actions',
    'conversation.session.header.corner',
    'conversation.session.header.lineage',
    'conversation.session.header.utilities',
    'conversation.session.header.views.actions',
    'conversation.trajectory.images',
    'conversation.user.text.node',
    'conversation.view',
  ],
  other: [
    'deliverables.file.actions',
    'deliverables.review.file.actions',
    'main',
    'main.conversation',
    'rightbar',
    'rightbar.session',
    'sidebar',
    'workspace.toast',
  ],
  plugins: [
    'plugins.add.actions',
    'plugins.bundle.activation',
    'plugins.bundle.config',
    'plugins.detail.actions',
    'plugins.detail.badge',
    'plugins.detail.section',
    'plugins.item',
    'plugins.row.config',
    'plugins.tab',
  ],
  frame: [
    'root',
    'shell.bottom',
    'shell.leading',
    'shell.overlay',
    'shell.quota-notice',
  ],
  settings: [
    'settings.action',
    'settings.close',
    'settings.general.item',
    'settings.header',
    'settings.launcher',
    'settings.models.footer',
    'settings.models.provider-card',
    'settings.models.sign-in',
    'settings.onboarding',
    'settings.plugins.tab',
    'settings.section',
    'settings.section.icon',
    'settings.trigger',
  ],
  sidebar: [
    'sidebar.brand.mark',
    'sidebar.brand.name',
    'sidebar.chat.conversation',
    'sidebar.footer.action',
    'sidebar.panellist',
    'sidebar.panellist.actions',
    'sidebar.session.row.hover',
    'sidebar.session.row.leading',
    'sidebar.session.row.trailing',
    'sidebar.settings',
    'sidebar.toggle.badge',
    'sidebar.workspaces',
    'sidebar.workspaces.directoryFlow',
    'sidebar.workspaces.session.menu.item',
    'sidebar.workspaces.session.row.action',
  ],
  rightbar: [
    'sidebar.right.pane.tab',
    'sidebar.right.pane.tab.title',
    'sidebar.right.tab.document',
    'sidebar.right.tab.document.action',
    'sidebar.right.tab.document.actions',
    'sidebar.right.tab.document.office.pdf',
    'sidebar.right.tab.document.unpreviewable',
    'sidebar.right.tab.files.actions',
    'sidebar.right.tab.guide',
    'sidebar.right.tab.guide.actions',
    'sidebar.right.tab.guide.entry',
    'sidebar.right.tab.menu.item',
  ],
  tool: ['tool.call.images', 'tool.call.toolview', 'tool.view.cordis'],
} as const

/**
 * Look up a slot.
 * @param key - official slot key.
 */
export function getDshSlot(key: DshSlotKey): DshSlot {
  return DSH_SLOTS[key]
}

/**
 * Whether a slot key expects a leaf glyph.
 * @param key - slot key to test.
 */
export function isIconSlot(key: string): key is DshIconSlotKey {
  return (DSH_ICON_SLOTS as readonly string[]).includes(key)
}

/** All slot keys, in catalog order. */
export const DSH_SLOT_KEYS: readonly DshSlotKey[] = Object.keys(DSH_SLOTS) as DshSlotKey[]
