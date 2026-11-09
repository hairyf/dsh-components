// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/user-text/UserText.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** User-text presentation delegates evaluation to its data-layer document and renders JSON business nodes. */
		/**
		* Render original text through pure matching rules and business-owned node Slots.
		* A failed parse retains the entire original text and reports the rule error.
		* @param props - original text, confirmed facts, display policy, and framework seats.
		* @returns ordered inline nodes with raw-text fallbacks for missing registrations.
		*/
		function UserText({ text, facts, interactive = false, ellipsis = false, useUserTextRevision, createUserTextEvaluator, reportTransformFailure, renderSlot }) {
			useUserTextRevision((revision) => revision);
			const evaluate = (0, react.useMemo)(createUserTextEvaluator, [createUserTextEvaluator]);
			let nodes;
			let error;
			try {
				nodes = evaluate({
					text,
					facts
				});
			} catch (cause) {
				error = cause;
			}
			const failed = nodes === void 0;
			(0, react.useEffect)(() => {
				if (failed) reportTransformFailure(error);
			}, [
				failed,
				error,
				reportTransformFailure
			]);
			const content = (0, react.useMemo)(() => nodes === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserTextRun, { text }) : (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: nodes.map((node) => {
				const raw = text.slice(node.start, node.end);
				return (0, react_jsx_runtime.jsx)(react.Fragment, { children: renderSlot("conversation.user.text.node", {
					node,
					raw,
					interactive
				}, {
					entryKey: node.id,
					fallback: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserTextRun, { text: node.id === "text" ? node.data.display ?? raw : raw })
				}) }, `${node.id}:${node.start}`);
			}) }), [
				nodes,
				text,
				interactive,
				renderSlot
			]);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.HoverCardGroup, {
				as: "span",
				className: ellipsis ? UserText_module_css_default.ellipsis : UserText_module_css_default.root,
				children: content
			});
		}
		/**
		* Display an unmatched substring without business interpretation.
		* @param props - parser-produced plain-text node.
		* @returns its inline text.
		*/
		function PlainUserText({ node }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.UserTextRun, { text: node.data.display ?? node.data.text });
		}
		/**
		* Display a confirmed Session label without inventing navigation behavior.
		* @param props - Session reference JSON and its original spelling.
		* @returns the existing non-interactive Session chip.
		*/
		function SessionReference({ node, raw }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceChip, {
				appearance: "session",
				label: node.data.label,
				title: raw
			});
		}
