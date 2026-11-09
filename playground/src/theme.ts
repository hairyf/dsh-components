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

.pg-nav {
  overflow-y: auto;
  border-right: 1px solid var(--dsw-alias-border-l2);
  background: var(--dsw-alias-bg-layer-1);
  padding: 12px 8px 32px;
}

.pg-nav-title {
  font-size: 12px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  color: var(--dsw-alias-label-tertiary);
  padding: 12px 8px 6px;
}

.pg-nav-group {
  display: flex;
  align-items: baseline;
  justify-content: space-between;
  padding: 0 8px;
  color: var(--dsw-alias-label-secondary);
}

.pg-nav-button {
  display: block;
  width: 100%;
  padding: 5px 8px;
  border: none;
  border-radius: 6px;
  background: transparent;
  color: var(--dsw-alias-label-primary);
  font: inherit;
  font-size: 13px;
  text-align: left;
  cursor: pointer;
}

.pg-nav-button:hover {
  background: var(--dsw-alias-bg-layer-1);
  background: color-mix(in oklab, currentColor 8%, transparent);
}

.pg-nav-button[aria-current='true'] {
  background: color-mix(in oklab, currentColor 14%, transparent);
  font-weight: 600;
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
  border-bottom: 1px solid var(--dsw-alias-border-l2);
}

.pg-toolbar-spacer {
  flex: 1;
}

.pg-toggle {
  display: inline-flex;
  align-items: center;
  gap: 6px;
  height: 28px;
  padding: 0 12px;
  border: 1px solid var(--dsw-alias-border-l3);
  border-radius: 8px;
  background: transparent;
  color: inherit;
  font: inherit;
  font-size: 12px;
  cursor: pointer;
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
  border: 1px solid var(--dsw-alias-border-l2);
  border-radius: 12px;
  overflow: hidden;
}

.pg-state-title {
  margin: 0;
  padding: 8px 12px;
  border-bottom: 1px solid var(--dsw-alias-border-l2);
  background: color-mix(in oklab, currentColor 4%, transparent);
  color: var(--dsw-alias-label-secondary);
  font-size: 12px;
  font-weight: 500;
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
