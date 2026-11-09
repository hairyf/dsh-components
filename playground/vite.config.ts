import type { Plugin } from 'vite'
import { existsSync, readFileSync } from 'node:fs'
import { dirname, resolve } from 'node:path'
import { fileURLToPath } from 'node:url'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

/**
 * Serve the official package's CSS Modules.
 *
 * The primitives package imports its own `.module.css` files (46 of them) from a
 * pre-built bundle, and its components read class names off the imported map
 * (`s.button`). The gallery has to reproduce both halves:
 *
 * - the map, so `s.button` resolves to `button` (an identity map keeps the
 *   official name, which is what the sheet selects on);
 * - the sheet itself, so the primitives' components (the ones the recovered
 *   shell components compose, such as `Menu`, `StateDot` and `Pill`) are
 *   painted with the official declarations.
 *
 * The sheet is injected once per file, at its official class names, exactly as
 * the package's own build would have emitted it. The gallery's own styles are
 * untouched: they ship as strings and are never `.module.css` under
 * `node_modules`, so they keep Vite's normal pipeline.
 */
function dshCssModules(): Plugin {
  // The stub id must not end in .css: Vite's CSS plugin claims any id that does
  // and would run PostCSS over the JavaScript this plugin returns.
  const PREFIX = '\0dsh-css-module:'
  const SUFFIX = '.js'
  return {
    name: 'dsh-css-modules',
    enforce: 'pre',
    resolveId(source, importer) {
      if (!source.endsWith('.module.css'))
        return null
      if (importer === undefined || !importer.includes('node_modules'))
        return null
      // Every primitives import is relative to its own bundle, so the file is
      // simply resolved against the importer.
      return PREFIX + resolve(dirname(importer), source) + SUFFIX
    },
    load(id) {
      if (!id.startsWith(PREFIX))
        return null
      const file = id.slice(PREFIX.length, -SUFFIX.length)
      if (!existsSync(file))
        return 'export default new Proxy({}, { get: (_, key) => String(key) })'
      const css = readFileSync(file, 'utf8')
      return [
        'const styles = new Proxy({}, { get: (_, key) => String(key) })',
        `const css = ${JSON.stringify(css)}`,
        'const id = "data-dsh-css-module-" + String(css.length)',
        'if (typeof document !== "undefined" && document.querySelector("style[" + id + "]") === null) {',
        '  const style = document.createElement("style")',
        '  style.setAttribute(id, "")',
        '  style.textContent = css',
        '  document.head.append(style)',
        '}',
        'export default styles',
      ].join('\n')
    },
  }
}

/** Resolve a path relative to this config file. */
function here(relative: string): string {
  return fileURLToPath(new URL(relative, import.meta.url))
}

export default defineConfig({
  plugins: [
    dshCssModules(),
    react(),
  ],
  resolve: {
    alias: {
      // The gallery consumes the library from source, so a change under src/ is
      // picked up by the dev server without a package build.
      '@dsh-components': here('../src/index.ts'),
      '@dsh-components/': here('../src/'),
      // The DSH client injects these three modules at runtime; the primitives
      // barrel imports them at module scope, so the gallery substitutes local
      // stand-ins.
      '@deepseek-ai/dsh-client-store': here('./src/shims/dsh-client-store.ts'),
      '@deepseek-ai/dsh-util-workspace-path': here('./src/shims/dsh-util-workspace-path.ts'),
      '@deepseek-ai/dsh-util-code-language': here('./src/shims/dsh-util-code-language.ts'),
    },
  },
  server: {
    fs: {
      // The library lives one directory up; the dev server must serve it.
      allow: [
        here('..'),
      ],
    },
  },
})
