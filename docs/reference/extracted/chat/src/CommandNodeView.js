// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/CommandNodeView.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Ordinary command lifecycle renderer with command-name keyed specialization. */
		const CommandNodeView = (0, react.memo)(function CommandNodeView({ node, renderSlot, t }) {
			const command = node.data;
			const owner = (0, react.useMemo)(() => ({ node: command }), [command]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: ChatView_module_css_default.callRow,
				children: renderSlot("conversation.chat.commandview", owner, {
					entryKey: command.name ?? "",
					fallback: (0, react_jsx_runtime.jsx)(GenericCommandCard, {
						...owner,
						t
					})
				})
			});
		});
		/** One integrated `/compact` command and compaction transaction renderer. */
		const ManualCompactionNodeView = (0, react.memo)(function ManualCompactionNodeView({ node, t }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)("div", {
				className: ChatView_module_css_default.callRow,
				children: (0, react_jsx_runtime.jsx)(CompactionCommandCard, {
					node: data.command,
					...data.compaction === null ? {} : { compaction: data.compaction },
					t
				})
			});
		});
