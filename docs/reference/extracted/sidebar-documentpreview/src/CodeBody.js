// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/code/CodeBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** @param props - accumulated document contents and framework props. @returns one stable CodeBlock, or no body for byte contents. */
		function CodeBody({ resourceAddress, content, wrap, scrollportRef, t }) {
			if (content.kind !== "text") return null;
			const file = parseFileAddress(resourceAddress);
			if (file === void 0) throw new Error(`ui-sidebar-documentpreview: not a file address "${resourceAddress}"`);
			const language = (0, _deepseek_ai_dsh_client_ui_primitives.languageForPath)(file.path);
			return (0, react_jsx_runtime.jsx)("div", {
				className: CodeBody_module_css_default.renderer,
				"data-code-preview": true,
				"data-wrap": wrap,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
					className: CodeBody_module_css_default.code,
					contentRef: scrollportRef,
					code: content.text,
					lang: language,
					streaming: !content.eof,
					wrap,
					lineNumbers: true,
					copyLabel: t("copy"),
					copiedLabel: t("copied"),
					toolbarLabels: {
						codeLabel: t("codeBlock.title"),
						wrapLabel: t("codeBlock.wrap"),
						unwrapLabel: t("codeBlock.unwrap")
					}
				})
			});
		}
