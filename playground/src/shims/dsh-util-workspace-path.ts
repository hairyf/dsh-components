/**
 * Gallery stand-in for `@deepseek-ai/dsh-util-workspace-path`.
 *
 * The DSH client injects that module at runtime; `pathPartsOf` below is copied
 * verbatim from the installed package (0.2.2-rc.1), which is the only export the
 * primitives barrel calls.
 */

/**
 * Split a path for display: the directories through their last separator, and
 * the final segment after it. Both `/` and `\\` separate, so a Windows path
 * splits where its own segments end; trailing separators are dropped first.
 * @param path - file or directory path using POSIX or Windows separators.
 * @returns the directory prefix (possibly empty) and the final segment.
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
