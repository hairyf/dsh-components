// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/file-path.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Bind path resolution to the originating Session without capturing its current directory.
* @param ctx - Chat plugin context.
* @param sessionId - Original Session identity.
* @returns Resolver using the live working directory, falling back to the workspace root.
*/
function sessionFilePath(ctx, sessionId) {
	return (path) => {
		const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
		const current = ctx.sessions.binding(sessionId)?.session.projections.faceOf("workingDirectory").getSnapshot();
		return resolveWorkspacePath(current ?? cwd, path);
	};
}
