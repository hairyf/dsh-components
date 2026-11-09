# dsh-components skill

Agent skill for the `dsh-components` library: the React components that reproduce
the DeepSeek Harness Web UI at source level.

The skill is a `SKILL.md` plus small Node scripts. The scripts never read a
relative path back into a checkout: a checkout does not exist once the skill is
installed, so they either use a checkout that is actually there or fetch the few
files a question needs from GitHub.

## Install

From the repository (recommended, select this skill):

```sh
npx skills add hairyf/dsh-components --skill dsh-components
```

Or point the CLI at the skill directory directly:

```sh
npx skills add ./skills/dsh-components
```

Install it globally with `-g` if you want it in every project. Node 22 or newer is
required (the scripts use the global `fetch`).

## How the scripts find their data

There are two modes, resolved once per run in `scripts/_shared.mjs`:

| Order | Condition | Mode | What it reads |
| --- | --- | --- | --- |
| 1 | `DSH_COMPONENTS_ROOT` is set | local | that checkout, must contain `src/components` and `docs/reference/extracted/manifest.json` |
| 2 | `DSH_COMPONENTS_REMOTE=1` | remote | `https://raw.githubusercontent.com/hairyf/dsh-components/main/` |
| 3 | a checkout is found by walking up from the script | local | that checkout |
| 4 | otherwise | remote | the same GitHub URL |

Every script prints its mode on the first line, so the output says where the data
came from:

```
# source: local checkout
# source: github/hairyf/dsh-components@main
```

Remote reads name the exact file, never a directory, because GitHub raw cannot
list one. The catalog comes from `index.json`, which ships with the skill and
holds every component, package sheet/source path, slot, and token family. A
downloaded file is cached for one hour under
`<os tmpdir>/dsh-components-cache/`, keyed by the file path, so repeated questions
do not re-download. A failed fetch reports the URL it tried.

`index.json` is generated from the repository's real data:

```sh
node scripts/generate-skill-index.mjs   # from a checkout, writes skills/dsh-components/index.json
```

Remote mode only returns data that is on `main`; regenerate and commit the index
when components, sheets, slots, or tokens change.

## Scripts

All commands below assume the skill directory (`skills/dsh-components` in the
repository). Each script takes plain arguments and exits non-zero with the usage
and the available names on a bad argument.

| Script | One-line use |
| --- | --- |
| `list_components.mjs` | `node scripts/list_components.mjs [atoms\|blocks\|shell]` lists every component with its group, props type, and source sheet. |
| `get_component.mjs` | `node scripts/get_component.mjs Button` prints one component's full source, including its embedded official stylesheet. |
| `get_styles.mjs` | `node scripts/get_styles.mjs sidebar SidebarRoot` prints the recovered official CSS for a package, or one sheet. |
| `get_source.mjs` | `node scripts/get_source.mjs conversation Composer` prints the recovered official implementation for a package, or one file. |
| `get_slots.mjs` | `node scripts/get_slots.mjs session.row.leading` prints the slot catalog, filtered by key or reader package. |
| `get_tokens.mjs` | `node scripts/get_tokens.mjs radius` prints design tokens, or the family summary when no query is given. |
| `list_packages.mjs` | `node scripts/list_packages.mjs sidebar` lists the official packages with how many sheets and source files were recovered. |

## Using the components

Inside DSH the host already installs the design tokens (`--dsw-*` on `body`) and
owns the dark-mode body attribute (`data-ds-dark-theme`), so plugin UI renders the
components directly. Nothing has to wrap the subtree.

```tsx
import { Button } from 'dsh-components'

<Button variant="primary">新会话</Button>
```

Read `scripts/get_component.mjs <Name>` before using a component: the props and
the DOM order are in the file, not in `SKILL.md`. Never invent a class name, a
declaration, or a slot key; `get_styles.mjs` and `get_slots.mjs` are the only
sources for those.

## Troubleshooting

- `DSH_COMPONENTS_ROOT` set to a directory that is not a checkout: the script
  exits and says which markers are missing; unset it to fall back.
- No network and no checkout: the scripts fail with the GitHub URL they tried.
  Install the skill from a local checkout (`npx skills add ./skills/dsh-components`)
  and set `DSH_COMPONENTS_ROOT` to use it offline.
- Unknown index: fetch failures mention `skills/dsh-components/index.json`; the
  skill was installed from a commit that does not carry the index, so update the
  skill.
