// @ts-check
import antfu from '@antfu/eslint-config'

export default antfu(
  {
    type: 'lib',
    pnpm: true,
    antislop: true,
  },
  {
    // Recovered verbatim from the official bundles: this is evidence, not code
    // we maintain, and its formatting is the product's, not ours.
    ignores: [
      'docs/reference/extracted/**',
      'docs/reference/*.json',
      'playground/index.html',
    ],
  },
  {
    // The gallery is its own program with its own tsconfig and its own build.
    files: ['playground/**/*.{ts,tsx}'],
    rules: {
      'no-console': 'off',
    },
  },
)
