/**
 * Gallery chrome, mounted as one document-level style element.
 *
 * Only page layout lives here. Every component in the exhibition brings its own
 * official stylesheet, and nothing in this sheet may restyle one, so the rules
 * below only place the index, the toolbar and the state cards.
 */
const CSS = `/*
 * Gallery chrome only. Every component in the gallery brings its own official
 * stylesheet; nothing here is allowed to restyle a component, so the rules
 * below only lay out the page and read the same --dsw-alias-* tokens the
 * components do.
 */

* {
  box-sizing: border-box;
}

html,
body {
  margin: 0;
  height: 100%;
}

body {
  background: var(--dsw-alias-bg-base);
  color: var(--dsw-alias-label-primary);
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Microsoft YaHei', sans-serif;
  font-size: 14px;
  line-height: 1.5;
}

#root {
  height: 100%;
}

.pg-shell {
  display: grid;
  grid-template-columns: 248px minmax(0, 1fr);
  height: 100%;
}

/*
 * The index copies the official DSH sidebar: the same fill, the same 8px inline
 * padding, the same 36px rows and 3px transparent side paint. Only the values
 * are borrowed; the gallery draws no box of its own beyond these.
 */

.pg-nav {
  --dsh-sidebar-inline-padding: 8px;
  --dsh-sidebar-row-padding: 12px;
  --dsh-sidebar-label-gap: 6px;
  --dsh-sidebar-paint-inset: 3px;
  --dsh-scrollbar-thumb: var(--dsw-alias-scrollbar-bg-l2);
  --dsh-scrollbar-thumb-hover: var(--dsw-alias-scrollbar-hover-l2);
  box-sizing: border-box;
  height: 100%;
  padding: 6px var(--dsh-sidebar-inline-padding);
  background: var(--dsw-specific-sidebar-fill);
  color: var(--dsw-alias-label-primary);
  display: flex;
  flex-direction: column;
  font-size: 14px;
}

/* Official .logoRow / .brandName / .brandMark. */
.pg-brand {
  flex: none;
  display: flex;
  align-items: center;
  gap: 8px;
  height: 46px;
  padding: 0 4px 0 6px;
}

.pg-brand-mark {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: var(--dsw-alias-label-primary);
}

.pg-brand-name {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  font-size: 18px;
  font-weight: 600;
  line-height: 24px;
  letter-spacing: 0.04em;
}

.pg-brand-count {
  flex: none;
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
  line-height: 20px;
  font-variant-numeric: tabular-nums;
}

/* Official Input: .wrap / .icon / .input. */
.pg-filter {
  flex: none;
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: 6px;
  height: 32px;
  margin: 0 3px 10px;
  padding: 0 8px;
  border: 0.5px solid var(--dsw-alias-border-l4);
  border-radius: var(--dsw-radius-md);
  background: var(--dsw-alias-bg-layer-1);
}

.pg-filter:focus-within {
  border-color: var(--dsw-alias-state-business-primary);
}

.pg-filter-icon {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px;
  height: 16px;
  color: var(--dsw-alias-label-tertiary);
}

.pg-filter-input {
  flex: 1;
  min-width: 0;
  border: none;
  outline: none;
  background: transparent;
  font-family: inherit;
  font-size: 14px;
  line-height: 22px;
  color: var(--dsw-alias-label-primary);
}

.pg-filter-input::placeholder {
  color: var(--dsw-alias-label-dimmed);
}

.pg-filter-clear {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 18px;
  height: 18px;
  padding: 0;
  border: none;
  border-radius: var(--dsw-radius-sm);
  background: none;
  color: var(--dsw-alias-label-tertiary);
  cursor: pointer;
}

@media (hover: hover) {
  .pg-filter-clear:hover {
    background-color: var(--dsw-alias-interactive-bg-hover);
    color: var(--dsw-alias-label-secondary);
  }
}

/* Official .regionArea: the scroll region reaches the sidebar edge. */
.pg-nav-scroll {
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  margin-right: calc(-1 * var(--dsh-sidebar-inline-padding));
  padding-right: var(--dsh-sidebar-inline-padding);
  overscroll-behavior: contain;
}

.pg-nav-group {
  margin-bottom: 8px;
}

.pg-nav-group-title {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--dsh-sidebar-label-gap);
  width: 100%;
  min-height: 28px;
  padding: 4px calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset) + 1px);
  border: none;
  border-radius: var(--dsw-radius-sm);
  background: none;
  color: var(--dsw-alias-label-tertiary);
  font: inherit;
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
  letter-spacing: 0.02em;
  text-align: left;
  cursor: pointer;
}

@media (hover: hover) {
  .pg-nav-group-title:hover {
    color: var(--dsw-alias-label-secondary);
  }
}

.pg-nav-group-title:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.pg-nav-group-label {
  flex: 1;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.pg-nav-group-count {
  flex: none;
  color: var(--dsw-alias-label-dimmed);
  font-variant-numeric: tabular-nums;
}

.pg-nav-chevron {
  flex: none;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  transition: transform 0.1s;
}

.pg-nav-group-title[aria-expanded='false'] .pg-nav-chevron {
  transform: rotate(-90deg);
}

/* Official .panelRow: 36px row, 3px transparent side paint, radius md. */
.pg-nav-row {
  box-sizing: border-box;
  display: flex;
  align-items: center;
  gap: var(--dsh-sidebar-label-gap);
  width: 100%;
  min-height: 36px;
  margin: 0;
  padding: 7px calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset));
  border: none;
  border-inline: var(--dsh-sidebar-paint-inset) solid transparent;
  border-radius: var(--dsw-radius-md);
  background: padding-box padding-box;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 14px;
  line-height: 22px;
  text-align: left;
  cursor: pointer;
}

@media (hover: hover) {
  .pg-nav-row:hover {
    background-color: var(--dsw-alias-interactive-bg-hover);
  }
}

.pg-nav-row[aria-current='true'] {
  background-color: var(--dsw-alias-interactive-bg-hover);
  font-weight: 500;
}

.pg-nav-row:focus-visible {
  outline: var(--dsw-focus-ring-width) solid var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
  outline-offset: -2px;
}

.pg-nav-empty {
  margin: 0;
  padding: 12px calc(var(--dsh-sidebar-row-padding) - var(--dsh-sidebar-paint-inset));
  color: var(--dsw-alias-label-dimmed);
  font-size: 13px;
  line-height: 20px;
}

.pg-main {
  overflow-y: auto;
  padding: 0 24px 64px;
}

.pg-toolbar {
  position: sticky;
  top: 0;
  z-index: 1;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
  padding: 14px 0;
  background: var(--dsw-alias-bg-base);
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
}

.pg-toolbar-spacer {
  flex: 1;
}

/* Official .buildVersion-ish chip for the group name. */
.pg-chip {
  flex: none;
  display: inline-flex;
  align-items: center;
  height: 20px;
  padding: 0 7px;
  border-radius: var(--dsw-radius-sm);
  background: var(--dsw-alias-interactive-bg-hover);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  line-height: 20px;
}

.pg-toolbar-title {
  font-size: 14px;
  font-weight: 600;
  line-height: 22px;
}

.pg-heading {
  margin: 24px 0 4px;
  font-size: 20px;
  font-weight: 600;
}

.pg-subtitle {
  margin: 0 0 20px;
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
}

.pg-state {
  margin-bottom: 20px;
  border: 0.5px solid var(--dsw-alias-border-l1);
  border-radius: var(--dsw-radius-lg);
  background: var(--dsw-alias-bg-layer-1);
  overflow: hidden;
}

.pg-state-title {
  margin: 0;
  padding: 9px 14px;
  border-bottom: 0.5px solid var(--dsw-alias-border-l1);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
  line-height: 20px;
}

.pg-state-body {
  padding: 16px 12px;
  /* Wide shell surfaces are laid out by the frame itself; keep them scrollable. */
  overflow-x: auto;
}

.pg-row {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 12px;
}

.pg-column {
  display: flex;
  flex-direction: column;
  gap: 12px;
  max-width: 720px;
}

.pg-note {
  color: var(--dsw-alias-label-tertiary);
  font-size: 12px;
}
`

if (typeof document !== 'undefined' && document.querySelector('style[data-playground-theme]') === null) {
  const style = document.createElement('style')
  style.setAttribute('data-playground-theme', '')
  style.textContent = CSS
  document.head.append(style)
}

export {}
