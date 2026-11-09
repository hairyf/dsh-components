# Component authoring conventions

Every component in `src/components/` is a **source-level refork** of the official
DSH component, not an approximation. Follow these rules exactly; the parallel
workstreams must land compatible code.

## 1. File layout

- One component per file, **param-case** filename: `icon-button.tsx`, `sidebar-root.tsx`.
- Export the React component with a **PascalCase** name from that file.
- Colocate the recovered stylesheet as a module-scope `const CSS = \`...\`` string at the
  top of the same file. Never import a `.css` file.

## 2. Styling contract

```tsx
import { useStyle } from '../lib/style'

const CSS = `/* recovered from ... */\n.iconButton{...}`

export function IconButton(props: IconButtonProps): React.JSX.Element {
  const s = useStyle('icon-button', CSS)
  return <button className={s.iconButton} />
}
```

- `useStyle(scope, css)` returns a **class map**, exactly like a CSS Modules import.
  Always render `className={s.someClass}` / `cx(s.a, s.b)`.
- The CSS text must be the **verbatim recovered official CSS** (hash prefixes removed),
  from `docs/reference/extracted/<package>/css/<Name>.module.css`.
- Do **not** rename classes. Do not add a wrapper element. The DOM must match the official DOM.

## 3. Design tokens

- Only use `var(--dsw-*)` / `var(--dsh-*)` tokens. Never hardcode a color, radius,
  font size, or duration that a token already covers.
- Tokens are installed by `installDshTheme()` (see `src/theme/index.ts`).
- Dark mode is `body[data-ds-dark-theme]`; the tokens flip automatically — write light-mode-
  agnostic rules only.

## 4. Component shape

- TypeScript `strict` is on. Prop interfaces are exported alongside the component.
- Props are `readonly`. Avoid `any`; prefer explicit unions.
- Use `React.JSX.Element` as the return type.
- No default exports.
- Forward `className` and spread the rest onto the root element where the official
  component does.

## 5. Slots

- A component that hosts an official slot renders the slot's children at the exact
  DOM position. Accept a prop named after the slot's last segment
  (e.g. `sidebar.session.row.leading` → `leading`), typed `React.ReactNode`.
- Never invent a slot that is not in `docs/reference/slots.json`.

## 6. Copy and i18n

- UI strings come from `docs/reference/extracted/locales.json`
  (`perPackage[<package>].zh|en`). Default locale is `zh`.
- Never paraphrase official copy.

## 7. Verification

- `pnpm typecheck` must pass.
- Add a focused test under `test/` when a component has non-trivial behaviour
  (state, keyboard, controlled value). Pure presentational components need none.
