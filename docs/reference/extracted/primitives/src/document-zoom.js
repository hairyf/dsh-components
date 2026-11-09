// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/document-zoom.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Shared fixed document scales used by preview surfaces and their controls. */
/** Fixed scale limits, incremental step, and menu choices. */
const DOCUMENT_ZOOM = {
	minimum: .25,
	maximum: 4,
	step: .25,
	presets: [
		.25,
		.5,
		1,
		1.5,
		2
	]
};
