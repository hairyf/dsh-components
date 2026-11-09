/**
 * Stand-in for @deepseek-ai/dsh-util-code-language, injected by the DSH runtime.
 * Maps file extensions to a highlight language and lists the ones highlighted.
 */

/** Extensions the code surfaces highlight. */
export const CODE_HIGHLIGHT_EXTENSIONS = [
  '.ts',
  '.tsx',
  '.js',
  '.jsx',
  '.mjs',
  '.cjs',
  '.json',
  '.css',
  '.html',
  '.md',
  '.py',
  '.go',
  '.rs',
  '.java',
  '.rb',
  '.sh',
  '.ps1',
] as const

/** Extension to language id. */
const LANGUAGES: Record<string, string> = {
  '.ts': 'typescript',
  '.tsx': 'tsx',
  '.js': 'javascript',
  '.jsx': 'jsx',
  '.mjs': 'javascript',
  '.cjs': 'javascript',
  '.json': 'json',
  '.css': 'css',
  '.html': 'html',
  '.md': 'markdown',
  '.py': 'python',
  '.go': 'go',
  '.rs': 'rust',
  '.java': 'java',
  '.rb': 'ruby',
  '.sh': 'shellscript',
  '.ps1': 'powershell',
}

/**
 * Highlight language for a file path.
 * @param path - file path or name.
 * @returns the language id, or undefined when the extension is not highlighted.
 */
export function languageForPath(path: string): string | undefined {
  const match = /\.([A-Z0-9]+)$/i.exec(path)
  return match
    ? LANGUAGES[`.${match[1].toLowerCase()}`]
    : undefined
}
