// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/TaskManagerIcon.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Decorative occupant for the task-manager sidebar entry. */
/**
* Render the clock glyph at the size the sidebar asks for; the sidebar owns
* its accessible navigation label. The glyph is the row's direct icon child,
* as on every other panel row: an inline wrapper makes it the baseline of a
* line box inside the row's glyph slot, which lifts it above the label.
* @param props - the sidebar's icon share: the requested edge and whether the panel is selected.
* @returns decorative clock icon.
*/
function TaskManagerIcon({ size }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconClockOutlineRegular, { size });
}
