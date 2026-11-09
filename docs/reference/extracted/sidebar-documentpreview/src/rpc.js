// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/rpc.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The session and path one `dsh-resource://file/…` address names.
		*
		* A `session` address names its own session and a relative or absolute path, so
		* a tab addressed into another session reads from that session. An `absolute`
		* address carries no session and cannot be read here. The registry routes only
		* session-scoped `file` addresses to this type, so an address `parseFileAddress`
		* rejects or that carries no session is a programming error and throws.
		* @param address - a tab's `dsh-resource://file/…` address.
		* @returns the session and the path to hand the endpoint.
		*/
		function hostFileOf(address) {
			const parsed = parseFileAddress(address);
			if (parsed?.scope !== "session") throw new Error(`ui-sidebar-documentpreview: not a session file address "${address}"`);
			return {
				sessionId: parsed.sessionId,
				path: parsed.path
			};
		}
		/**
		* Bind the paged read to one Remote face. The page length is the Host's
		* configured cap, so no `limit` travels.
		* @param remote - the Client Remote carrying the `workspaceFiles` namespace.
		* @returns the read the face performs.
		*/
		function createReadPage(remote) {
			return (sessionId, path, offset, signal) => remote.workspaceFiles.read(sessionId, path, { offset }, signal);
		}
