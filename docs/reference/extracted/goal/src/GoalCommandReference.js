// Extracted from @deepseek-ai/dsh-client-ui-goal (lib/client.js); region lib/types/client/GoalCommandReference.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Render one confirmed command token without adding an activation action.
		* @param props - resolved command node and its original spelling.
		* @returns a noninteractive inline command chip.
		*/
		function GoalCommandReference({ node, raw }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
				appearance: "command",
				label: `/${node.data.name}`,
				title: raw
			});
		}
