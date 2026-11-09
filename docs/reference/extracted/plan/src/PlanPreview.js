// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/PlanPreview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Read-only Markdown viewer for logged plans and temporary review documents. */
/**
* Render the submitted plan with its complete Markdown.
* @param props - Framework-bound tab identity, resource, and copy.
* @returns the plan document or a localized loading/failure state.
*/
function PlanPreview({ useTabInfo, useResource, t }) {
	const tab = useTabInfo();
	const resource = useResource(tab.tab.navigation.address);
	const temporary = isReviewPreviewAddress(tab.tab.navigation.address);
	const params = tab.tab.navigation.params;
	const plan = temporary ? params !== void 0 && "planReview" in params ? params.planReview : void 0 : resource.value;
	const labels = (0, react.useMemo)(() => ({
		code: {
			copyLabel: t("copy"),
			copiedLabel: t("copied"),
			toolbarLabels: {
				codeLabel: t("codeBlock.title"),
				wrapLabel: t("codeBlock.wrap"),
				unwrapLabel: t("codeBlock.unwrap")
			}
		},
		footnotes: t("markdown.footnotes")
	}), [t]);
	if (plan === void 0) return (0, react_jsx_runtime.jsxs)("div", {
		className: PlanPreview_module_css_default.message,
		role: "status",
		children: [temporary ? t("preview.expired") : resource.status === "none" ? t("preview.unavailable") : resource.status === "failed" ? t("preview.failed") : t("preview.loading"), !temporary && resource.failure !== void 0 && (0, react_jsx_runtime.jsx)("p", { children: planFailureLine(t, resource.failure) })]
	});
	return (0, react_jsx_runtime.jsx)("section", {
		className: PlanPreview_module_css_default.preview,
		"data-plan-preview": "callId" in plan ? plan.callId : tab.tab.navigation.address,
		"aria-label": plan.title,
		children: (0, react_jsx_runtime.jsx)("div", {
			className: PlanPreview_module_css_default.document,
			children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MarkdownText, {
				text: plan.markdown,
				labels
			})
		})
	});
}
/**
* Display a plain file icon and the heading in its tab after resource recovery.
* @param props - Framework-bound tab identity and resource reader.
* @returns a decorative file icon followed by the recovered title or initial localized label.
*/
function PlanTitle({ useTabInfo, useResource }) {
	const tab = useTabInfo();
	const resource = useResource(tab.tab.navigation.address);
	const params = tab.tab.navigation.params;
	const plan = isReviewPreviewAddress(tab.tab.navigation.address) ? params !== void 0 && "planReview" in params ? params.planReview : void 0 : resource.value;
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
		kind: "other",
		size: 16,
		className: PlanPreview_module_css_default.titleIcon
	}), plan?.title ?? tab.tab.title] });
}
