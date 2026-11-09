import type { Plugin } from 'vite'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'vitest/config'

/**
 * The official primitives package imports its stylesheets directly, which the
 * Node ESM resolver cannot load. Serve every .css module as an identity class
 * map instead: components render with the readable class name, which is exactly
 * what the tests want to assert on.
 */
function cssModuleStub(): Plugin {
  const STUB = 'export default new Proxy({}, { get: (_, key) => String(key) })'
  return {
    name: 'dsh-css-module-stub',
    enforce: 'pre',
    resolveId(source) {
      if (source.endsWith('.css'))
        return `\0css-stub:${source}`
      return null
    },
    load(id) {
      if (id.startsWith('\0css-stub:'))
        return STUB
      return null
    },
  }
}

const shim = name => fileURLToPath(new URL(`./test/shims/${name}`, import.meta.url))

export default defineConfig({
  plugins: [
    cssModuleStub(),
  ],
  resolve: {
    alias: {
      // Consumers resolve the library through a tsconfig path alias; Vite needs
      // the same mapping so tests import the sources instead of the built dist.
      '@dsh-components': fileURLToPath(new URL('./src/index.ts', import.meta.url)),
      '@dsh-components/': fileURLToPath(new URL('./src/', import.meta.url)),
      // The DSH runtime injects these three modules into client plugins rather
      // than resolving them from disk; point them at the local stand-ins so the
      // primitives barrel can be imported under test.
      '@deepseek-ai/dsh-client-store': shim('dsh-client-store.ts'),
      '@deepseek-ai/dsh-util-workspace-path': shim('dsh-util-workspace-path.ts'),
      '@deepseek-ai/dsh-util-code-language': shim('dsh-util-code-language.ts'),
    },
  },
  esbuild: {
    jsx: 'automatic',
  },
  test: {
    globals: false,
    server: {
      deps: {
        inline: [/@deepseek-ai\/dsh-client-ui-primitives/],
      },
    },
  },
})
