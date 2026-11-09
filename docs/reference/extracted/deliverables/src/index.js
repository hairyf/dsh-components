// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Deliverables plugin, node half. Serves authenticated native opens of declared files. The browser
* half ships via exports["./client"], discovered through the package.json
* dsh.client declaration.
*/
/** Services required for change summaries and authenticated native opens. */
const inject = [
	"connection",
	"sessionQuery",
	"sessionController",
	"workspaceFiles",
	"fs",
	"sandboxPolicy",
	"workspaceChanges"
];
/**
* Register native opens for declared files.
* @param ctx - host context carrying file and connection services.
*/
function apply(ctx) {
	registerPresentOpen(ctx);
}
