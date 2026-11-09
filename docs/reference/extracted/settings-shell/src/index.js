// Extracted from @deepseek-ai/dsh-client-ui-settings-shell (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Shell settings page, node half. The empty apply exists so the plugin appears
* in the host cordis.yml / Loader; the browser half owns the page through
* exports["./client"], discovered from the package.json dsh.client
* declaration. The `shell` namespace the page edits is registered by the
* shell executor, so this package registers no namespace of its own.
*/
/** Host plugin body — no host-side behavior for this surface plugin. */
function apply() {}
