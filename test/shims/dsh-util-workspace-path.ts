/**
 * Stand-in for @deepseek-ai/dsh-util-workspace-path, injected by the DSH
 * runtime. Splits a path into its display parts.
 */

/**
 * Split a path for display: the directories through their last separator, and
 * the final segment after it. Both `/` and `\\` separate, trailing separators
 * are dropped first, and a path with no separator is all name.
 * @param path - file or directory path using POSIX or Windows separators.
 */
export function pathPartsOf(path: string): { directory: string, name: string } {
  const trimmed = path.replace(/[/\\]+$/, '')
  if (trimmed === '')
    return { directory: '', name: path }
  const cut = Math.max(trimmed.lastIndexOf('/'), trimmed.lastIndexOf('\\')) + 1
  return {
    directory: trimmed.slice(0, cut),
    name: trimmed.slice(cut),
  }
}
