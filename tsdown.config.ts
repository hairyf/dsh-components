import { readFileSync } from 'node:fs'
import { defineConfig } from 'tsdown'
import { StaleGuardRecorder } from 'tsdown-stale-guard'

const { name } = JSON.parse(readFileSync(new URL('./package.json', import.meta.url), 'utf8')) as { name: string }

export default defineConfig({
  entry: [
    'src/index.ts',
  ],
  dts: true,
  format: 'cjs',
  outExtensions: () => ({ js: '.cjs' }),
  exports: true,
  publint: true,
  define: { 'process.env.NODE_ENV': JSON.stringify('production') },
  // The DSH module loader resolves these at runtime; official UI packages keep
  // them external too (they `require()` them from the loader), which also avoids
  // bundling the primitives' CSS modules into this package.
  deps: {
    neverBundle: [/^@deepseek-ai\//, /^react($|\/)/, /^react-dom($|\/)/],
  },
  banner: `window.__ModuleLoader__.load({id:${name},factory:(require)=>{var module={exports:{}};var exports=module.exports;`,
  footer: 'return module.exports;}});',
  plugins: [
    StaleGuardRecorder(),
  ],
  sourcemap: true,
  minify: true,
  clean: false,
})
