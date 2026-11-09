// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/file-menu.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Bind a toolview's path reader to its originating Session.
* @param ctx - Tool plugin context.
* @returns Existing Slot registration's inject callback.
*/
function toolFileInject(ctx) {
	return (sessionId) => ({ resolveFilePath: (path) => {
		const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
		const current = ctx.sessions.binding(sessionId)?.session.projections.faceOf("workingDirectory").getSnapshot();
		return resolveWorkspacePath(current ?? cwd, path);
	} });
}
