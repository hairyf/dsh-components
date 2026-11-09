// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/contract/group-tree.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const DEPTH = {
			exchange: 0,
			input: 1,
			turn: 2,
			process: 3
		};
		/**
		* Test whether a Node stands at a group-tree position or outside it.
		* @param node - Chat Node.
		* @param position - group-tree position to compare against.
		* @returns whether the Node's position is `position` or an outer one.
		*/
		function isAtOrOutside(node, position) {
			return node.groupTree !== void 0 && DEPTH[node.groupTree] <= DEPTH[position];
		}
