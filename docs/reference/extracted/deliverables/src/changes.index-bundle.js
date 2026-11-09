// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/index.js); region lib/types/changes.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Authenticated GET route serving one announced change summary while its Session lives. */
const CHANGED_FILES_PATH = "/api/changes.summary";
/** Authenticated GET route serving one listed file's turn-start and turn-end comparison while its Session lives. */
const CHANGES_DIFF_PATH = "/api/changes.diff";
/** Authenticated POST route for opening a changed file on the Host desktop. */
const CHANGES_OPEN_PATH = "/api/changes.open";
CHANGED_FILES_PATH.slice(1);
CHANGES_DIFF_PATH.slice(1);
CHANGES_OPEN_PATH.slice(1);
