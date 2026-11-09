// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/AssistantMarkdown.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Standalone fallback for image destinations (query/fragment suffixes are ignored).
		* Chat fileImages resolves decoded file references against cwd; pathImages also
		* serves this component outside that provider and accepts legacy image URL suffixes.
		* Resolve an authored absolute image path against the document's file API.
		* @param base - canonical `document.baseURI` at render time.
		* @param value - authored Markdown destination; URL escapes are decoded once.
		* @returns an absolute Web or Desktop file-API URL, or undefined for unsupported
		* protocols and non-local paths.
		*/
		function localPathMediaUrl(base, value) {
			let path;
			try {
				path = decodeURIComponent(value.split(/[?#]/u)[0] ?? "");
			} catch {
				return;
			}
			return fileMediaUrl(base, path);
		}
		/** Renders non-blank reasoning blocks as independent disclosures alongside the response. */
		const AssistantMarkdown = (0, react.memo)(function AssistantMarkdown({ blocks, streaming, textInteractionSource = false, interrupted, loadImage, groupPart, useDisclosure, reasoningHidden = false, usePresentation, revealProcess, mentions, renderSlot, useGroupAction, t }) {
			const labels = (0, react.useMemo)(() => markdownLabels(t), [t]);
			const pathImages = (0, react.useMemo)(() => {
				return { resolve: (value) => localPathMediaUrl(document.baseURI, value) };
			}, []);
			const last = blocks.length - 1;
			if (!(streaming || interrupted === true || blocks.some((block) => block.kind !== "tool-call"))) return null;
			const rendered = [];
			for (let i = 0; i < blocks.length; i++) {
				const block = blocks[i];
				if (block === void 0) continue;
				if (groupPart === "reasoning" && block.kind !== "reasoning") continue;
				if (groupPart === "response" && block.kind === "reasoning") continue;
				switch (block.kind) {
					case "text":
						rendered.push((0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
							text: block.text,
							streaming,
							labels,
							fileMentions: mentions,
							pathImages,
							textInteractionSource
						}, i));
						break;
					case "reasoning":
						if (block.text.trim() === "") break;
						rendered.push((0, react_jsx_runtime.jsx)(ProcessReasoning, {
							hidden: reasoningHidden,
							reveal: revealProcess,
							useGroupAction,
							children: (0, react_jsx_runtime.jsx)(ReasoningRow, {
								text: block.text,
								running: streaming && i === last,
								usePresentation,
								useDisclosure,
								renderSlot,
								textInteractionSource,
								t
							})
						}, i));
						break;
					case "image": {
						const start = i;
						const group = [block];
						while (i + 1 < blocks.length) {
							const next = blocks[i + 1];
							if (next === void 0 || next.kind !== "image") break;
							group.push(next);
							i += 1;
						}
						rendered.push((0, react_jsx_runtime.jsx)(react.Fragment, { children: renderSlot("conversation.chat.message.images", {
							images: group.map(({ attachment }) => ({ attachment })),
							loadImage,
							align: "start"
						}) }, start));
						break;
					}
					case "tool-call": break;
					default: rendered.push((0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
						label: t("message.unknownBlock"),
						payload: block.block,
						truncatedLabel: (total) => t("json.truncated", { total })
					}, i));
				}
			}
			return (0, react_jsx_runtime.jsx)("div", {
				className: AssistantMarkdown_module_css_default.root,
				"data-streaming": streaming || void 0,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: AssistantMarkdown_module_css_default.body,
					children: [rendered, interrupted && (groupPart === void 0 || groupPart === "response" || !blocks.some((block) => block.kind !== "reasoning" && block.kind !== "tool-call")) && (0, react_jsx_runtime.jsx)("span", {
						className: AssistantMarkdown_module_css_default.stopped,
						children: t("message.stopped")
					})]
				})
			});
		});
		function ProcessReasoning({ hidden, reveal, useGroupAction, children }) {
			return (0, react_jsx_runtime.jsx)("div", {
				ref: useGroupAction(hidden, reveal ?? NOOP),
				"data-turn-process-inline": hidden || void 0,
				children
			});
		}
		const NOOP = () => {};
