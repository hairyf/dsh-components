# Generic components

This library ships **generic pieces an agent can recombine**, not DSH screens.

A business component is a dead end: nobody can reuse `font-settings-group` for
anything but font settings. The generic parts it is built from - a settings row, a
stepper, a disclosure - compose into hundreds of screens. So the test for every
component is: **does its name mention a DSH feature?** If it mentions `font`,
`plan`, `todo`, `skill`, `tool`, `workspace`, `permission`, `approval`,
`feedback` or `conversation`, it is business code and must be decomposed.

## Rules

- **Verbatim CSS.** A generic component copies an official sheet and keeps its
  class names; `pnpm audit:fidelity` forbids invented declarations. Reusing an
  official sheet under a new name is the point.
- **Controlled only.** `value`/`onChange`, `open`/`onOpenChange`,
  `selected`/`onSelect`. No fetching, no stores, no DSH types in props.
- **Composable slots.** `children`, `leading`, `trailing`, `actions` accept
  nodes. A component never hardcodes what sits inside it.

## primitives/

The vocabulary. Nothing here knows what it is used for.

| Component | What it is | Official sheet |
| --- | --- | --- |
| `Button` | text button, 4 variants x 2 sizes | primitives/Button |
| `IconButton` | square, icon-only button with pressed state | message-feedback/MessageFeedbackActions |
| `Input` | single-line text field | primitives/Input |
| `Textarea` | multi-line text field | message-feedback/FeedbackDialog |
| `Checkbox`, `Switch` | binary controls | primitives/* |
| `Tag`, `Pill`, `Chip` | inline labels; Chip is removable | primitives/Tag, conversation/ReferenceChip |
| `StateDot` | status dot in three states | primitives/StateDot |
| `Spinner` | indeterminate progress | sidebar-documentpreview/LoadingIndicator |
| `Text` | body text, preserves newlines | conversation/UserText |
| `MaskedText` | secret with mask and reveal | secret-mask/SecretText |
| `Tooltip`, `HoverCard` | hover surfaces | primitives/* |
| `Modal`, `Toast` | overlays | primitives/* |
| `Menu`, `MenuSurface`, `MenuGroup` | popup menus | primitives/* |
| `SegmentedControl`, `SegmentedTabs` | mutually exclusive choices | primitives/* |
| `DisclosureRow` | one collapsible row | primitives/DisclosureRow |
| `AnimatedRows` | list with FLIP reorder | primitives/AnimatedRows |
| `TextShimmer` | shimmering placeholder text | primitives/TextShimmer |
| `ShortcutKeys` | keycap cluster | primitives/ShortcutKeys |
| `InlineEditor` | in-place text edit | primitives/InlineEditor |
| `PathLabel` | path with a dimmed directory | primitives/PathLabel |
| `FileTypeIcon` | icon by file extension | primitives/FileTypeIcon |

## layout/

| Component | What it is | Official sheet |
| --- | --- | --- |
| `Surface` | the panel frame: radius, border, backdrop | conversation/TodoPanel (.root) |
| `Bar` | a dock bar with an optional expand chevron | TodoPanel + QueueDock + TurnProcessNodeView |
| `Stack` | vertical or horizontal flex with a gap | TodoPanel (.body) |
| `ListRow` | one row: leading glyph, title, summary, trailing | tool/ToolRow |
| `Tree` | expandable directory tree | sidebar-files/FileTree |
| `DescriptionList` | label/value pairs | tool/ToolDetails |
| `Checklist` | items with a status glyph | conversation/TodoPanel |
| `Meter` | a ring or bar showing usage | conversation/ContextMeter |

## settings/

| Component | What it is | Official sheet |
| --- | --- | --- |
| `SettingsRow` | title, description, and a control on the right | theme/FontSizeRow |
| `SettingsGroup` | titled group, optionally collapsible | theme/FontSettingsGroup |
| `Stepper` | numeric stepper with hover arrows | theme/FontSizeRow (.stepper) |
| `OptionGroup` | a row of selectable cubes | theme/AppearanceRow |
| `Select` | a trigger plus a menu of options | permission-presets/PermissionSelect |
| `SplitButton` | primary action plus a menu | open-in-app/OpenTargetButton |

## feedback/

| Component | What it is | Official sheet |
| --- | --- | --- |
| `ConfirmPanel` | a decision card with 2-3 actions | approval/ApprovalPanel |
| `FormDialog` | a modal with fields and a submit | message-feedback/FeedbackDialog |
| `SearchDialog` | a modal with a filter and grouped rows | shortcuts/Reference |
| `ActionCard` | a proposal with fold, status and dismiss | action-cards/Card |
| `DropOverlay` | full-page drop target | attachment/DropOverlay |

## media/

| Component | What it is | Official sheet |
| --- | --- | --- |
| `Image` | image with a reserved box and failure state | primitives/ImagePreview |
| `ImageTile` | image inside a message layout | attachment/MessageImage |
| `Lightbox` | full-screen image viewer | primitives/ImageLightbox |
| `FileCard` | file chip with size and progress | attachment/FileCard |

## content/

| Component | What it is | Official sheet |
| --- | --- | --- |
| `MarkdownText` | rendered markdown | primitives/markdown |
| `CodeBlock` | fenced code with a toolbar | primitives/markdown/CodeBlock |
| `DiffBlock` | unified diff | primitives/DiffBlock |
| `JsonTree` | expandable JSON | primitives/JsonBlock |
| `JsonBlock` | JSON in a code frame | primitives/JsonBlock |
| `Terminal` | terminal output frame | primitives/TerminalBlock |
| `Document` | a detail document with a title and body | primitives/DetailDocument |

## Deleted

`connection-indicator`, `user-message-bubble`, `quote-preview`,
`risk-confirmation`, `brand-wordmark`, `conversation-hero`,
`permission-selector`, `slot`, `code-card`, `command-text`, `read-block`,
`search-block`, `web-block`, `approval-panel`, `feedback-dialog`,
`message-feedback-actions`, `open-target-button`, `permission-row`,
`permission-select`, `plan-mode-control`, `plan-preview`, `secret-text`,
`enter-behavior-row`, `user-text`, `context-meter`, `exit-code-badge`,
`file-tree`, `reference-chip`, `shortcut-reference`, `skill-row`,
`todo-panel`, `tool-details`, `tool-row`, `workspace-picker`,
`appearance-row`, `font-family-row`, `font-settings-group`, `font-size-row`,
`question-composer`, `image-preview`, `image-lightbox`, `message-image`,
`expansion-bar`, `detail-document`, `terminal-block`.

Each one is either replaced by a generic component above or has no generic
remainder worth keeping.

## Composition

The whole point: an agent builds a screen from parts it has never seen combined.

```tsx
<Surface>
  <SettingsGroup title="外观">
    <SettingsRow title="字号" description="影响正文与代码">
      <Stepper value={size} min={12} max={20} unit="px" onChange={setSize} />
    </SettingsRow>
    <SettingsRow title="主题" description="跟随系统或固定">
      <OptionGroup value={theme} options={THEMES} onChange={setTheme} />
    </SettingsRow>
    <SettingsRow title="访问范围" description="本轮运行的权限">
      <Select value={scope} options={SCOPES} onChange={setScope} />
    </SettingsRow>
  </SettingsGroup>
  <Bar glyph={<IconChecklistOutlineRegular />} label="待办" expandable>
    <Checklist items={todos} />
  </Bar>
</Surface>
```
