// Extracted from @deepseek-ai/dsh-client-ui-skill (lib/client.js); region lib/types/client/SkillReference.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Render a skill chip; previews omit activation even when the entry has an injected action.
		* @param props - resolved node, raw token, interaction mode, and Session-bound preview action.
		* @returns an inline skill label or interactive chip.
		*/
		function SkillReference({ node, raw, interactive, openSkill }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
				appearance: "skill",
				label: `/${node.data.name}`,
				title: raw,
				...interactive ? { onActivate: () => {
					openSkill(node.data.name);
				} } : {}
			});
		}
