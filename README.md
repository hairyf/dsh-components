# dsh-components

Source-level React components for the DeepSeek Harness Web UI.

Every component reproduces an official DSH component: the stylesheet is the one
the product ships, recovered from its prebundles with the build hashes stripped and
embedded verbatim in the component file. Nothing is redrawn by eye, and
`pnpm audit:fidelity` fails if a declaration cannot be traced back to an official
stylesheet.

## Install

```sh
pnpm add dsh-components
```

Then enable it alongside the plugin that uses it, in that plugin's
`cordis.patch.yml`:

```yaml
- insert:
    - id: my-plugin
      name: dsh-my-plugin
    - id: dsh-components
      name: dsh-components
```

When the user enables your plugin, `dsh-components` is enabled with it. The patch
file ships in this package (`cordis.patch.yml`), and `package.json` points at it with
`dsh.bundle.patch`, so this is the whole wiring — there is no separate install step
for the end user.

## One copy, however many plugins use it

This is the part that matters when several plugins depend on the library.

DSH loads client code through `window.__ModuleLoader__`, which is a lazy CJS table:
a bundle only *registers* `{ id, factory }`, and the factory runs on first `require`
and is then memoized by id. The host owns that table, not the plugins.

So the contract is: **the host provides `dsh-components`; plugins require it.**

```jsonc
// your plugin's package.json
{
  "dsh": {
    "client": {
      "platform": "web",
      "external": ["dsh-components"]
    }
  }
}
```

`dsh.client.external` is the DSH field that says "do not bundle this, the host has
it". With it, your build emits `require('dsh-components')`, the host resolves it to
the single registered factory, and every plugin — plus the app itself — shares one
materialized instance, one set of stylesheets, one React context tree.

If two plugins each bundled their own copy instead, both would register the same
module id and the loader would reject the second registration; that guard exists
precisely to make accidental duplication loud rather than silently double-loading
styles.

## Build setup

Keep `dsh-components` and its own peers out of your bundle:

```ts
// tsdown.config.ts
import { defineConfig } from 'tsdown'

export default defineConfig({
  entry: ['src/client.ts'],
  format: 'cjs',
  deps: {
    // Provided by the DSH client graph at runtime.
    neverBundle: [
      /^dsh-components$/,
      /^@deepseek-ai\//,
      /^react($|\/)/,
      /^react-dom($|\/)/,
    ],
  },
  banner: `window.__ModuleLoader__.load({id:'dsh-my-plugin',factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
  footer: 'return module.exports;}});',
})
```

The banner and footer are what make the bundle a registered DSH module; the
`neverBundle` list is what keeps it from carrying a second copy of this library.

## Use

Nothing to set up. A plugin runs inside DSH, and the host has already installed the
design tokens and the colour scheme, so the components resolve `var(--dsw-*)` on
their own.

Compose a screen from generic parts:

```tsx
import {
  Bar, Button, Checklist, IconChecklistOutlineRegular,
  OptionGroup, Select, SettingsGroup, SettingsRow, Stepper, Surface,
} from 'dsh-components'

export function Preferences() {
  const [size, setSize] = useState(14)
  const [theme, setTheme] = useState('system')
  const [scope, setScope] = useState('workspace')

  return (
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
      <Bar glyph={<IconChecklistOutlineRegular size={14} />} label="待办" expandable>
        <Checklist items={todos} />
      </Bar>
    </Surface>
  )
}
```

Components are controlled: pass `value`/`onChange`, `open`/`onOpenChange`. None of
them hold application state, and none of them know what they are being used for.

`DshProvider` exists for the one case the host does not cover: rendering these
components outside DSH, such as the gallery in `playground/`. Do not use it inside
a plugin.

## What is in the box

Generic pieces an agent recombines, not DSH screens. The test for every
component is that its name mentions no product feature: if it says `font`,
`plan`, `todo`, `skill`, `tool` or `permission`, it is business code and does
not belong here. See [the map](docs/reference/generic-component-map.md).

| Group | Components |
| --- | --- |
| `primitives` | Button, IconButton, Input, Textarea, Checkbox, Switch, Tag, Pill, Chip, StateDot, Spinner, Text, MaskedText, Tooltip, HoverCard, Modal, Toast, Menu, MenuSurface, MenuGroup, SegmentedControl, SegmentedTabs, DisclosureRow, AnimatedRows, TextShimmer, ShortcutKeys, InlineEditor, PathLabel, FileTypeIcon |
| `layout` | Surface, Bar, Stack, ListRow, Tree, DescriptionList, Checklist, Meter |
| `settings` | SettingsRow, SettingsGroup, Stepper, OptionGroup, Select, SplitButton |
| `feedback` | ConfirmPanel, FormDialog, SearchDialog, ActionCard, DropOverlay |
| `media` | Image, ImageTile, Lightbox, FileCard |
| `content` | MarkdownText, CodeBlock, DiffBlock, JsonTree, JsonBlock, Terminal, Document |

Every one copies an official DSH stylesheet verbatim and keeps the official class
names; the name is generic, the pixels are the product's.

`DshProvider` is not part of the component surface; it only backs the gallery.

## Icons

The official artwork ships with the library; do not draw your own.

```tsx
import { IconSearchOutlineRegular, IconPanelLeftOutlineRegular } from 'dsh-components'

<IconPanelLeftOutlineRegular size={16} />
```

## Slots

DSH renders named DOM seats that plugins contribute to. `ShellSlot` reproduces that
wrapper exactly, so injected content lands where the product reads it:

```tsx
<SessionRow sessionId="s1" title="重构登录流程" leading={<IconSparkleRegular size={14} />} />
```

Query the catalogue rather than guessing a key:

```sh
node skills/dsh-components/scripts/get_slots.mjs session.row
```

## Design tokens

Never hardcode a colour, radius, or duration.

```sh
node skills/dsh-components/scripts/get_tokens.mjs radius
```

## Development

```sh
pnpm typecheck        # library and tests
pnpm lint             # house style
pnpm test             # builds, then runs the suite
pnpm audit:fidelity   # every shipped declaration traces to an official sheet
pnpm playground       # component gallery (Vite)
```

Regenerate the recovered data:

```sh
pnpm gen:reference                      # re-extract CSS, slots, locales, tokens
node scripts/generate-skill-index.mjs   # refresh the skill index
```

## The agent skill

`skills/dsh-components` is a skill for coding agents, shaped like the HeroUI skills:
a `SKILL.md` plus `scripts/*.mjs` that resolve what they need at run time — a local
checkout when one is present, GitHub raw otherwise — so it works when installed
outside this repository.

```sh
node skills/dsh-components/scripts/get_component.mjs MarkdownText
```

## Ground truth

| Fact | Where |
| --- | --- |
| Official stylesheets | `docs/reference/extracted/<package>/css/` |
| Official component source | `docs/reference/extracted/<package>/src/` |
| Slot catalog | `docs/reference/slots.json` |
| Design tokens | `docs/reference/design-tokens.json` |
| Official UI copy | `docs/reference/extracted/locales-merged.json` |

## License

MIT
