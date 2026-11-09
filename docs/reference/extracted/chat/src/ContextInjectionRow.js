// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ContextInjectionRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render logged context with the Tool calls disclosure chrome from Figma.
*
* The header names the role the context plays and, beside it, the producer the
* durable source identifies, so a reader can tell an injected skill catalog
* from a workspace instruction file or a recalled session without expanding.
* The expanded body follows the producer-declared form; an absent or unknown
* form renders the opaque body.
* @param props - Durable content, its projected producer role/name and form, and the locale seat.
* @returns A collapsed context row with a bounded, form-specific body.
*/
function ContextInjectionRow({ content, source, producer, form, t }) {
	const [open, setOpen] = (0, react.useState)(false);
	const { rendered, summary, body } = contextBody(form, {
		content,
		source,
		t
	});
	const toolBlocks = content.length > 0 && content.every((block) => block.type === "tool-addition" || block.type === "tool-removal") ? content : void 0;
	const added = toolBlocks?.flatMap((block) => block.type === "tool-addition" ? [block.toolName] : []) ?? [];
	const removed = toolBlocks?.flatMap((block) => block.type === "tool-removal" ? [block.toolName] : []) ?? [];
	const single = toolBlocks?.length === 1 ? toolBlocks[0] : void 0;
	const toolSummary = toolBlocks === void 0 || single !== void 0 ? null : added.length > 0 && removed.length > 0 ? t("message.toolsChanged", {
		added: added.length,
		removed: removed.length
	}) : added.length > 0 ? t("message.toolsAddedCount", { count: added.length }) : t("message.toolsRemovedCount", { count: removed.length });
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
		className: ContextInjectionRow_module_css_default.root,
		icon: toolBlocks !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }) : producer.role === "recall" ? (0, react_jsx_runtime.jsx)("span", {
			"data-context-recall-icon": true,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReferenceIconRegular, { kind: "session" })
		}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconContextInjectionOutlineRegular, { size: 14 }),
		chevronClassName: ContextInjectionRow_module_css_default.chevron,
		title: single !== void 0 ? t(single.type === "tool-addition" ? "message.toolAdded" : "message.toolRemoved", { name: single.toolName }) : t(toolBlocks !== void 0 ? "message.toolsUpdated" : producer.role === "recall" ? "message.contextRecall" : "message.contextInjection"),
		collapsedContent: toolSummary !== null ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
			className: ContextInjectionRow_module_css_default.sep,
			"aria-hidden": true
		}), (0, react_jsx_runtime.jsx)("span", {
			className: ContextInjectionRow_module_css_default.summary,
			children: toolSummary
		})] }) : toolBlocks !== void 0 || producer.label === null ? void 0 : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
			(0, react_jsx_runtime.jsx)("span", {
				className: ContextInjectionRow_module_css_default.sep,
				"aria-hidden": true
			}),
			(0, react_jsx_runtime.jsx)("span", {
				className: ContextInjectionRow_module_css_default.source,
				"data-context-source": true,
				children: producer.label
			}),
			summary !== null && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
				className: ContextInjectionRow_module_css_default.sep,
				"aria-hidden": true
			}), (0, react_jsx_runtime.jsx)("span", {
				className: ContextInjectionRow_module_css_default.summary,
				"data-context-summary": true,
				children: summary
			})] })
		] }),
		keepContentWhenOpen: true,
		open: open && single === void 0,
		expandable: single === void 0,
		expandOnRowClick: true,
		onToggle: () => {
			setOpen((value) => !value);
		},
		children: (0, react_jsx_runtime.jsx)("div", {
			className: ContextInjectionRow_module_css_default.body,
			"data-context-injection-body": true,
			"data-context-form": rendered ?? void 0,
			children: toolBlocks === void 0 ? body : (0, react_jsx_runtime.jsxs)("div", {
				className: ContextInjectionRow_module_css_default.toolChanges,
				children: [added.length > 0 && (0, react_jsx_runtime.jsx)("div", { children: t("message.toolsAdded", { names: added.join(", ") }) }), removed.length > 0 && (0, react_jsx_runtime.jsx)("div", { children: t("message.toolsRemoved", { names: removed.join(", ") }) })]
			})
		})
	});
}
