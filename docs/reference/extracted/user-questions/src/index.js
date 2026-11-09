// Extracted from @deepseek-ai/dsh-client-ui-user-questions (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Web question plugin, node half.
*
* Mounting `ask_user_question` in the tools registry's global layer expands
* every agent's tool list regardless of its preset. Rendering a question is
* a host UI capability; the model-facing tool belongs to the presets that
* include it and to the TUI composition, which has no presets.
*/
/** Host plugin body — the model-facing tool is composed per preset, not here. */
function apply() {}
