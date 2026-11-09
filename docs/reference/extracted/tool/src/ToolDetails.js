// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/components/ToolDetails.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Compact, read-only fields and lists for recorded Tool results. */
function DetailItem({ item, t, onOpenFile }) {
	const status = item.status;
	return (0, react_jsx_runtime.jsxs)("li", {
		className: ToolDetails_module_css_default.item,
		"data-change": item.change?.value,
		children: [
			item.title !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
				className: ToolDetails_module_css_default.heading,
				children: [
					status !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						className: ToolDetails_module_css_default.status,
						role: "img",
						"aria-label": item.change?.label ?? status.label,
						children: item.change?.value === "added" ? "+" : item.change?.value === "removed" ? "−" : status.value === "completed" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }) : status.value === "in_progress" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlayOutlineRegular, { size: 14 }) : (0, react_jsx_runtime.jsx)("span", { className: ToolDetails_module_css_default.pending })
					}),
					item.location !== void 0 && onOpenFile !== void 0 ? (0, react_jsx_runtime.jsx)("button", {
						className: ToolDetails_module_css_default.path,
						type: "button",
						onClick: () => {
							const location = item.location;
							if (location !== void 0) onOpenFile(location.path, location.line === void 0 ? void 0 : { line: location.line });
						},
						children: item.title
					}) : (0, react_jsx_runtime.jsx)("span", {
						className: ToolDetails_module_css_default.text,
						children: item.title
					}),
					item.badge !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						className: ToolDetails_module_css_default.badge,
						"data-tone": item.badge.tone,
						children: item.badge.label
					}),
					status !== void 0 && (0, react_jsx_runtime.jsxs)("span", {
						className: ToolDetails_module_css_default.statusText,
						children: [
							item.previousStatus !== void 0 && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolDetails_module_css_default.previous,
								children: item.previousStatus
							}), (0, react_jsx_runtime.jsx)("span", { children: " → " })] }),
							(0, react_jsx_runtime.jsx)("span", { children: status.label }),
							item.change?.value === "updated" && item.previousStatus === void 0 && (0, react_jsx_runtime.jsxs)("span", { children: [" · ", item.change.label] })
						]
					})
				]
			}),
			item.subtitle !== void 0 && (0, react_jsx_runtime.jsx)("div", {
				className: ToolDetails_module_css_default.subtitle,
				children: item.subtitle
			}),
			item.description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
				className: ToolDetails_module_css_default.description,
				children: item.description
			}),
			item.fields.length > 0 && (0, react_jsx_runtime.jsx)("dl", {
				className: ToolDetails_module_css_default.fields,
				children: item.fields.map((field) => (0, react_jsx_runtime.jsxs)("div", {
					className: ToolDetails_module_css_default.field,
					children: [(0, react_jsx_runtime.jsx)("dt", { children: field.label }), (0, react_jsx_runtime.jsx)("dd", { children: field.value })]
				}, field.label))
			}),
			item.lines !== void 0 && (0, react_jsx_runtime.jsx)("ul", {
				className: ToolDetails_module_css_default.lines,
				children: item.lines.map((line, index) => (0, react_jsx_runtime.jsx)("li", { children: line }, index))
			}),
			item.markdown !== void 0 && (0, react_jsx_runtime.jsx)("div", {
				className: ToolDetails_module_css_default.prose,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
					text: item.markdown,
					labels: markdownLabels(t)
				})
			}),
			item.code !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
				toolbarLabels: codeToolbarLabels(t),
				className: ToolDetails_module_css_default.code,
				code: item.code.text,
				lang: item.code.language,
				copyLabel: t("copy"),
				copiedLabel: t("copied")
			}),
			item.groups?.map((group, index) => (0, react_jsx_runtime.jsxs)("details", {
				className: ToolDetails_module_css_default.group,
				children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {}), (0, react_jsx_runtime.jsx)("span", { children: group.label })] }), (0, react_jsx_runtime.jsx)("ul", {
					className: ToolDetails_module_css_default.list,
					children: group.items.map((child, childIndex) => (0, react_jsx_runtime.jsx)(DetailItem, {
						item: child,
						t,
						onOpenFile
					}, childIndex))
				})]
			}, index))
		]
	});
}
/**
* Render recorded values with local disclosures, copy controls, and file navigation.
* @param props.model - Localized fields or list items; an empty list uses its empty label.
* @param props.hasInspect - Reserve space for the row's upper-right Inspect button.
* @param props.t - Conversation dictionary for shared Markdown and code controls.
* @param props.onOpenFile - Open a recorded file location in the session workspace.
* @returns The expanded detail body.
*/
function ToolDetails({ model, hasInspect = false, t, onOpenFile }) {
	return (0, react_jsx_runtime.jsxs)("div", {
		className: ToolDetails_module_css_default.root,
		"data-inspect": hasInspect || void 0,
		"data-caption": model.caption !== void 0 || void 0,
		children: [
			model.caption !== void 0 && (0, react_jsx_runtime.jsx)("div", {
				className: ToolDetails_module_css_default.caption,
				children: model.caption
			}),
			model.items.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
				className: ToolDetails_module_css_default.empty,
				children: model.empty
			}) : (0, react_jsx_runtime.jsx)("ul", {
				className: ToolDetails_module_css_default.list,
				children: model.items.map((item, index) => (0, react_jsx_runtime.jsx)(DetailItem, {
					item,
					t,
					onOpenFile
				}, index))
			}),
			model.unchanged !== void 0 && (0, react_jsx_runtime.jsxs)("details", {
				className: ToolDetails_module_css_default.unchanged,
				children: [(0, react_jsx_runtime.jsxs)("summary", { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {}), model.unchanged.label] }), (0, react_jsx_runtime.jsx)("ul", {
					className: ToolDetails_module_css_default.list,
					children: model.unchanged.items.map((item, index) => (0, react_jsx_runtime.jsx)(DetailItem, {
						item,
						t,
						onOpenFile
					}, index))
				})]
			})
		]
	});
}
