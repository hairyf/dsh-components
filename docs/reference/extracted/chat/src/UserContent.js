// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/UserContent.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Reusable user contents inside a caller-owned message row. */
		const EMPTY_LABELS = [];
		/**
		* Render prepared text, ordered attachments, and references without message chrome.
		* The caller owns row identity, pending/echo state, time, and message actions.
		* @param props - prepared content, facts, authorized image loader, and framework Factory/locale seats.
		* @returns the content stack using the existing user-message layout.
		*/
		function UserContent({ content, loadImage, facts, interactive = false, ellipsis = false, renderSlot, renderFactorySlot, t }) {
			const { text, attachments, extraBlocks, referenceLabels = EMPTY_LABELS } = content;
			const compactImages = attachments.length > 1;
			const truncated = (total) => t("json.truncated", { total });
			const showBubble = text !== "" || extraBlocks.length > 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MessageItem_module_css_default.userStack,
				children: [
					attachments.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: MessageItem_module_css_default.attachmentRow,
						"data-message-attachments": true,
						children: attachments.map((attachment, index) => attachment.type === "image" ? (0, react_jsx_runtime.jsx)(react.Fragment, { children: renderSlot("conversation.chat.user.images", {
							images: [attachment.image],
							loadImage,
							align: "end",
							compact: compactImages
						}) }, `image:${index}`) : (0, react_jsx_runtime.jsxs)("span", {
							className: MessageItem_module_css_default.fileCard,
							title: attachment.file.name,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								path: attachment.file.name,
								className: MessageItem_module_css_default.fileIcon
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: MessageItem_module_css_default.fileContent,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: MessageItem_module_css_default.fileName,
									children: attachment.file.name
								}), (0, react_jsx_runtime.jsx)("span", {
									className: MessageItem_module_css_default.fileMeta,
									children: [(0, _deepseek_ai_dsh_client_ui_primitives.fileExtension)(attachment.file.name).toUpperCase().slice(0, 8), (0, _deepseek_ai_dsh_client_ui_primitives.fileSizeText)(attachment.file.bytes)].filter(Boolean).join(" ")
								})]
							})]
						}, `file:${index}`))
					}),
					showBubble && (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.UserMessageBubble, {
						"data-message-bubble": "",
						"data-text-interaction-source": "",
						children: [renderFactorySlot("conversation.user.text", {
							text,
							facts,
							interactive,
							ellipsis
						}), extraBlocks.map((block, index) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
							label: t("message.extraBlock"),
							payload: block,
							truncatedLabel: truncated
						}, index))]
					}),
					referenceLabels.length > 0 && (0, react_jsx_runtime.jsx)("div", {
						className: MessageItem_module_css_default.referenceSummary,
						children: t("message.referenceSummary", { labels: referenceLabels.join(t("message.referenceSeparator")) })
					})
				]
			});
		}
