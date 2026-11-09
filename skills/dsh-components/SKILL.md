---
name: dsh-components
description: "Generic React components for building DeepSeek Harness plugin UI, each restyled from an official DSH stylesheet. Use when composing a DSH plugin panel, settings screen, dialog or media surface from general-purpose parts, looking up a component's props before using it, finding the official CSS class or design token behind a control, or checking which official package a component was recovered from. Keywords: DSH, DeepSeek Harness, dsh-components, plugin UI, settings row, stepper, select, bar, checklist, design token, --dsw, css-render."
metadata:
  author: onmax
  version: "0.2.0"
---

# DSH Components

Generic components for plugin UI. Nothing here is a DSH screen: the names are
general (`SettingsRow`, `Stepper`, `Select`, `Bar`, `Checklist`) and the point is
that you compose them. Every stylesheet is the one the product ships, recovered
from its prebundles, so a composed screen looks native without you writing CSS.

## CRITICAL: read the component before using it

Each file embeds its official CSS Module **verbatim** and keeps the official class
names, which makes the file the documentation:

- the `const CSS = \`...\`` block is the real stylesheet,
- the props interface is the real prop surface,
- the JSX shows the real DOM order.

**DO NOT** invent props, class names, or declarations. A declaration that is not in
an official sheet is a defect, and `pnpm audit:fidelity` fails on it.

## Start here

```sh
node scripts/list_components.mjs        # every component, its group and props type
node scripts/get_component.mjs Select   # the primary read, before you use anything
```

Groups:

- `primitives`: Button, IconButton, Input, Textarea, Checkbox, Switch, Tag, Pill,
  Chip, StateDot, Spinner, Text, MaskedText, Avatar, Tooltip, HoverCard, Modal,
  Toast, Menu, MenuSurface, MenuGroup, SegmentedControl, SegmentedTabs,
  DisclosureRow, AnimatedRows, TextShimmer, ShortcutKeys, InlineEditor, PathLabel,
  FileTypeIcon, Field, Form, DatePicker, TimePicker
- `layout`: Surface, Bar, Stack, ListRow, Tree, DescriptionList, Checklist, Meter,
  Table, Toolbar, Carousel, FileChangeCard
- `settings`: SettingsRow, SettingsGroup, Stepper, OptionGroup, Select, SplitButton
- `feedback`: ConfirmPanel, FormDialog, SearchDialog, ActionCard, DropOverlay
- `media`: Image, ImageTile, Lightbox, FileCard
- `content`: MarkdownText, CodeBlock, DiffBlock, SplitDiff, JsonTree, JsonBlock,
  Terminal, Document
- `viewer`: ZoomControls, ZoomViewport, PreviewFrame

## Compose, do not reach for a screen

There is deliberately no `FontSettingsPanel`. Build it:

```tsx
import {
  IconChecklistOutlineRegular,
  OptionGroup,
  Select,
  SettingsGroup,
  SettingsRow,
  Stepper,
  Surface,
} from 'dsh-components'

<Surface>
  <SettingsGroup title="外观">
    <SettingsRow title="字号" description="影响正文与代码">
      <Stepper value={size} min={12} max={20} unit="px" onChange={setSize} />
    </SettingsRow>
    <SettingsRow title="主题" description="跟随系统或固定">
      <OptionGroup value={theme} onChange={setTheme} options={THEMES} />
    </SettingsRow>
    <SettingsRow title="访问范围" description="本轮运行的权限">
      <Select value={scope} onChange={setScope} options={SCOPES} />
    </SettingsRow>
  </SettingsGroup>
</Surface>
```

Five components, one screen you will not find in the library. That is the intent.

## Patterns

- **Controlled.** `value`/`onChange`, `open`/`onOpenChange`, `selected`/`onSelect`.
  No component holds app state, fetches, or reads a store.
- **Slots are nodes.** `children`, `leading`, `trailing`, `actions`, `icon` take
  `ReactNode`. Put your own markup in them.
- **Expansion is one prop.** `<Bar expandable>` adds the chevron and the toggle; the
  same is true of `SettingsGroup collapsible`, `ListRow expandable` and
  `<Select>`'s menu.
- **Icons are official artwork.** Import them, never draw SVG:
  ```tsx
  import { IconChecklistOutlineRegular, IconChevronDownOutlineRegular } from 'dsh-components'
  ```

## Setup

Nothing to wrap. Inside DSH the host installs the design tokens (`--dsw-*` on
`body`) and owns the dark-mode body attribute (`data-ds-dark-theme`).

Rendering outside DSH is the one case that needs `DshProvider`, which installs the
same tokens and the product icon sprite. Do not use it inside a plugin.

## Styling

Write token-backed declarations only:

```tsx
<div style={{ background: 'var(--dsw-alias-bg-layer-1)', borderRadius: 'var(--dsw-radius-md)' }} />
```

`node scripts/get_tokens.mjs <query>` prints the real values. Families:
`dsw-alias-*` (semantic roles), `dsw-static-*` (palette), `dsw-radius-*`,
`dsw-elevation-*`, `dsh-*` (content sizing).

## Verify

```sh
pnpm typecheck
pnpm lint
pnpm audit:fidelity
```

`audit:fidelity` is the only check that catches a plausible-looking style the
product does not ship. If it reports an invented declaration, copy the real one
from `get_styles.mjs`; never weaken the check.

## Every other question is one script call

| Question | Command |
| --- | --- |
| Which components exist? | `list_components.mjs` |
| What props does X take? | `get_component.mjs X` |
| What official CSS backs X? | `get_styles.mjs <package> X` |
| How does the official source do it? | `get_source.mjs <package> X` |
| Which token should I use? | `get_tokens.mjs <query>` |
| Where does this UI live? | `list_packages.mjs <filter>` |
| Is there a DSH seat for this? | `get_slots.mjs <query>` |

The scripts print `# source: local checkout` or `# source: github/...` first, so you
always know whether you are reading a checkout or a fetched file.
