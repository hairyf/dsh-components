# Shared implementation brief

Read `docs/reference/component-conventions.md` first — it is binding.

## Ground truth

Everything is recovered locally. Never guess.

| What | Where |
| --- | --- |
| Official CSS (hash removed, beautified) | `docs/reference/extracted/<package>/css/<Name>.module.css` |
| Official component structure | `docs/reference/extracted/<package>/src/**/*.js` |
| Real primitives CSS (already unhashed) | `node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/**/*.module.css` |
| Design tokens | `src/theme/styles.ts`, `docs/reference/extracted/theme/css/*.css` |
| Official slot keys (103) | `docs/reference/slots.json` |
| Official UI copy | `docs/reference/extracted/locales.json` |
| Package → directory map | `docs/reference/ui-packages.json` |
| Real screenshots | `docs/reference/screenshots/*.png` |

## Style pipeline (already built, do not change)

```tsx
import { cx, useStyle } from '../../lib/style'
import { IconPanelLeftOutlineRegular } from '@deepseek-ai/dsh-client-ui-primitives'

const CSS = `/* recovered from ui-sidebar/src/client/SidebarRoot.module.css */
.root { background: var(--dsw-specific-sidebar-fill); }`

export function SidebarRoot(props: SidebarRootProps): React.JSX.Element {
  const s = useStyle('sidebar-root', CSS)
  return <div className={cx(s.root, props.className)} />
}
```

- `useStyle(scope, css)` returns a **class map** (like a CSS Modules import). Render `s.<name>`.
- Scope strings must be unique per component. Use the param-case component name.
- Icons come from `@deepseek-ai/dsh-client-ui-primitives` — it is already a dependency and its
  `Icon*Regular` / `Icon*Medium` exports are the official artwork. Reuse them; do not redraw.

## Hard rules

1. Do **not** modify: `src/lib/**`, `src/theme/**`, `src/index.ts`, `package.json`,
   `tsconfig.json`, `tsdown.config.ts`, `docs/reference/**`, `scripts/**`.
   Those belong to the main agent.
2. Do **not** edit files outside your assigned write scope.
3. Do **not** add a barrel `index.ts` in your folder — the main agent wires exports.
4. TypeScript `strict`. No `any`. Explicit return types. No default exports.
5. Verify with `pnpm typecheck` (it type-checks `src` and `test` only). Also run
   `pnpm exec eslint <your files> --no-warn-ignored` and fix what it reports.
6. Report honestly in three buckets: verified / executed-but-unverified / not executed.
