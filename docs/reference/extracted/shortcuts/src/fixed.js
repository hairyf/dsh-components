// Extracted from @deepseek-ai/dsh-client-ui-shortcuts (lib/client.js); region lib/types/client/fixed.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Describe shared menu actions for display and conflict checking.
		* @param t - shortcut dictionary.
		* @returns read-only actions and each physical combination they occupy.
		*/
		function fixedCommands(t) {
			return [
				{
					id: "move",
					keys: ["↑", "↓"],
					bindings: [{
						code: "ArrowUp",
						modifiers: []
					}, {
						code: "ArrowDown",
						modifiers: []
					}],
					group: "menus"
				},
				{
					id: "select",
					keys: ["Enter"],
					bindings: [{
						code: "Enter",
						modifiers: []
					}],
					group: "menus"
				},
				{
					id: "dismiss",
					keys: ["Esc"],
					bindings: [{
						code: "Escape",
						modifiers: []
					}],
					group: "menus"
				}
			].map((row) => ({
				...row,
				id: `fixed.${row.id}`,
				label: () => t(row.id)
			}));
		}
