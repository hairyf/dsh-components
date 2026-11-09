## Rules that apply everywhere

- **MUST**, **MUST NOT**, **SHOULD** and **MAY** use RFC 2119 meanings. They mark
  real invariants - layer boundaries, wire contracts, output shapes - not house style.
- Before a PR, all gates MUST pass:
  `pnpm lint && pnpm knip && pnpm test && pnpm typecheck && pnpm build`.
  Commits follow Conventional Commits.

## What this repository is

A component library that reforked the DeepSeek Harness Web UI at source level.
Each component under `src/components/{primitives,layout,settings,feedback,media,content,viewer}`
embeds an official DSH stylesheet verbatim and keeps the official class names, so a
composed screen looks native without the caller writing CSS.

Two invariants hold this together:

1. **No invented CSS.** Every declaration MUST trace to an official stylesheet.
   `pnpm audit:fidelity` enforces it; a plausible-looking style the product does not
   ship is a defect.
2. **Generic names.** A component name MUST NOT mention a product feature. If it says
   `font`, `plan`, `todo`, `skill`, `tool`, `workspace`, `permission`,
   `approval`, `feedback`, `conversation` or `session`, it is business code and
   does not belong here. See `docs/reference/generic-component-map.md`.

## Upgrading DSH

When the user says **"升级 dsh 到 xx 版本"** ("upgrade DSH to version xx"), work from
the relation table. It is the contract that makes an upgrade a bounded, low-damage
job instead of a rewrite.

### The relation table

`docs/reference/component-map.json` maps every component to the official stylesheet
it reproduces:

```jsonc
{
  "components": [
    {
      "name": "Select",
      "group": "settings",
      "file": "src/components/settings/select.tsx",
      "scope": "select",
      "declared": [{ "package": "dsh-client-ui-permission-presets", "sheet": "PermissionSelect.module.css" }],
      "sheets": [
        { "package": "permission-presets", "sheet": "PermissionSelect.module.css",
          "binding": "CSS", "bytes": 1690, "declared": null, "identical": true }
      ]
    }
  ],
  "packages": { "permission-presets": ["PermissionSelect.module.css"] },
  "unreproduced": ["chat/ChatView.module.css"]
}
```

Read it before touching anything. Field meanings:

| Field | Meaning |
| --- | --- |
| `name`, `group`, `file` | the component and where it lives |
| `scope` | the `useStyle` scope, which prefixes every class as `dshc-<scope>_<class>` |
| `declared` | the sheets the file's header comment names |
| `sheets[]` | for each embedded CSS literal: which official sheet it came from, byte size, and whether it matches |
| `packages` | official package to the sheets this library reproduces from it |
| `unreproduced` | official sheets with no component yet; a source of new components, not damage |

### The upgrade procedure

1. **Update the dependency and re-extract.**
   ```sh
   pnpm up @deepseek-ai/dsh-client-ui-primitives@latest
   pnpm gen:reference      # re-extract every official sheet into docs/reference/extracted
   ```
   `docs/reference/extracted` is the ground truth; never edit it by hand.

2. **Diff the sheets, not the components.** For each entry in `packages`, compare
   `docs/reference/extracted/<package>/css/<sheet>` against what the component embeds.
   The bytes changed, the class names rarely do:
   ```sh
   node scripts/generate-component-map.mjs   # rewrites the map and reports drift
   ```
   Any component whose embedded CSS no longer matches an official sheet is listed.
   That list is the entire work queue.

3. **Resync one component at a time.** For each affected file:
   - copy the **new** official sheet verbatim into the component's `const CSS`,
   - keep the component's own name, props and scope (they are generic and stable),
   - if a class the component uses disappeared, remove that usage; if a new variant
     appeared, add it only when the props already express it,
   - never rename a class to make the old JSX compile.

4. **Prove it.** `pnpm audit:fidelity` MUST report zero invented declarations, and
   `node scripts/generate-component-map.mjs --check` MUST pass (the map is committed).

5. **Delegate when the queue is long.** Dispatch one subagent per group
   (`primitives`, `layout`, `settings`, `feedback`, `media`, `content`, `viewer`),
   each holding only its own directory. Give every subagent:
   - the group's rows from `component-map.json`,
   - the rule "CSS verbatim from `docs/reference/extracted`, no invented declarations",
   - the self-check commands below.

   This keeps write scopes disjoint, so the agents cannot fight over `index.ts`.

6. **Regenerate, then run every gate.**
   ```sh
   pnpm gen                      # barrel + skill index
   node scripts/generate-component-map.mjs
   pnpm lint && pnpm knip && pnpm typecheck && pnpm build && pnpm test --run
   pnpm audit:fidelity
   ```

### What damage looks like, and how to keep it low

| Symptom | Cause | Fix |
| --- | --- | --- |
| `audit:fidelity` reports invented declarations | a declaration was patched by hand instead of re-copied | copy the real one from `extracted` |
| a component renders unstyled | official class renamed upstream | update the JSX to the new official class, never the sheet |
| `get_component` / gallery shows stale CSS | regen skipped | run `pnpm gen` |
| icons vanish | the host stopped publishing the sprite | check `installDshTheme` still mounts `ICON_SYMBOLS` |
| dark mode breaks a block | upstream used `:global(` again | `src/lib/style.ts` already unwraps it; confirm it still does |

Bounds worth knowing: the mapping is one-way (official sheet to component), so an
upstream **rename** shows up as "not found" in step 2 rather than as a silent wrong
match. That is deliberate: a loud miss is cheaper than a quiet mismatch.

## Working in this repository

- Run `pnpm gen` after adding, renaming or removing a component. It writes
  `src/components/index.ts` (generated; never edit by hand) and the skill index.
- `pnpm audit:fidelity` is the only check that catches a plausible-looking style the
  product does not ship. If it fails, copy the real declaration; never weaken the check.
- The gallery (`pnpm playground`) renders every component in every state. Add an
  example when you add a component; a component without one is unreviewed.
- Tests live in `test/` and run against a real DOM (`happy-dom`). Prefer mounting the
  component over asserting on strings.
