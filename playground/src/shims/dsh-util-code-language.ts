/**
 * Gallery stand-in for `@deepseek-ai/dsh-util-code-language`.
 *
 * The DSH client injects that module at runtime, so it is not resolvable from
 * this repository; the primitives barrel imports it at module scope, which means
 * any consumer needs a local stand-in. The extension table below is copied
 * verbatim from the installed package bundle (0.2.2-rc.1), so the gallery
 * resolves exactly the languages the product does.
 */

/** Lowercase extension to canonical language id, as the official table spells it. */
const LANGUAGE_EXTENSIONS: Record<string, readonly string[]> = {
  'typescript': [
    'ts',
    'tsx',
    'mts',
    'cts',
  ],
  'javascript': [
    'js',
    'jsx',
    'mjs',
    'cjs',
  ],
  'shellscript': [
    'sh',
    'bash',
    'zsh',
  ],
  'fish': ['fish'],
  'json': [
    'json',
    'jsonc',
    'jsonl',
    'ndjson',
    'ipynb',
  ],
  'csv': ['csv'],
  'python': [
    'py',
    'pyw',
    'pyi',
  ],
  'ruby': [
    'rb',
    'rake',
    'gemspec',
  ],
  'go': ['go'],
  'rust': ['rs'],
  'java': ['java'],
  'c': ['c', 'h'],
  'cpp': [
    'cc',
    'cpp',
    'cxx',
    'hh',
    'hpp',
    'hxx',
  ],
  'csharp': ['cs'],
  'kotlin': ['kt', 'kts'],
  'swift': ['swift'],
  'php': ['php'],
  'yaml': ['yaml', 'yml'],
  'toml': ['toml'],
  'ini': [
    'ini',
    'conf',
    'cfg',
    'properties',
  ],
  'dotenv': ['env'],
  'log': ['log'],
  'diff': ['diff', 'patch'],
  'http': ['http'],
  'markdown': ['md', 'markdown'],
  'mdx': ['mdx'],
  'rst': ['rst'],
  'latex': [
    'tex',
    'sty',
    'cls',
  ],
  'bibtex': ['bib'],
  'asciidoc': ['adoc'],
  'html': [
    'html',
    'htm',
    'xhtml',
  ],
  'css': ['css'],
  'scss': ['scss'],
  'less': ['less'],
  'sql': ['sql'],
  'xml': [
    'xml',
    'xsd',
    'xsl',
    'xslt',
    'plist',
    'svg',
  ],
  'lua': ['lua'],
  'bat': ['bat', 'cmd'],
  'powershell': [
    'ps1',
    'psm1',
    'psd1',
  ],
  'r': ['r'],
  'julia': ['jl'],
  'dart': ['dart'],
  'scala': ['scala'],
  'clojure': [
    'clj',
    'cljs',
    'edn',
  ],
  'erlang': ['erl', 'hrl'],
  'elixir': ['ex', 'exs'],
  'haskell': ['hs'],
  'fsharp': [
    'fs',
    'fsi',
    'fsx',
  ],
  'vb': ['vb'],
  'perl': ['pl', 'pm'],
  'verilog': ['v'],
  'system-verilog': ['sv', 'svh'],
  'graphql': ['graphql', 'gql'],
  'proto': ['proto'],
  'hcl': [
    'tf',
    'tfvars',
    'hcl',
  ],
  'nix': ['nix'],
  'vue': ['vue'],
  'svelte': ['svelte'],
  'make': ['makefile', 'mk'],
  'cmake': ['cmake'],
  'groovy': ['gradle', 'groovy'],
}

const LANGUAGES = new Map<string, string>(
  Object.entries(LANGUAGE_EXTENSIONS).flatMap(([language, extensions]) =>
    extensions.map((extension): [string, string] => [extension, language])),
)

/** Every recognized filename suffix, one entry each. */
export const CODE_HIGHLIGHT_EXTENSIONS: readonly string[] = [
  ...LANGUAGES.keys(),
]

/** Read the extension of a path's final segment, lowercased. */
function extensionForPath(path: string): string | undefined {
  const slash = Math.max(path.lastIndexOf('/'), path.lastIndexOf('\\'))
  const base = path.slice(slash + 1)
  const dot = base.lastIndexOf('.')
  return dot < 0
    ? undefined
    : base.slice(dot + 1).toLowerCase()
}

/**
 * Derive the syntax-highlighting language from a filename or path.
 * @param path - filename or path, either separator spelling.
 * @returns the canonical language id, or undefined for an unknown suffix.
 */
export function languageForPath(path: string): string | undefined {
  const extension = extensionForPath(path)
  return extension === undefined
    ? undefined
    : LANGUAGES.get(extension)
}

/**
 * Derive the persisted `lang` hint from a read path.
 * @param path - the path the read reported.
 * @returns the canonical language id, or undefined.
 */
export function readLangHintForPath(path: string): string | undefined {
  return languageForPath(path)
}
