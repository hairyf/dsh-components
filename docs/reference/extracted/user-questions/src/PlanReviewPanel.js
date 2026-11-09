// Extracted from @deepseek-ai/dsh-client-ui-user-questions (lib/client.js); region lib/types/client/PlanReviewPanel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Optional-prop spread for a decision button's tooltip: `title` is optional on
		* the DOM props, and exactOptionalPropertyTypes rejects an explicit undefined.
		*
		* @param description - the asker's option description, when it carries one.
		* @returns The `title` prop to spread, or nothing.
		*/
		function tooltip(description) {
			return description === void 0 ? {} : { title: description };
		}
		/**
		* Render plan review controls; the submitted document opens in the sidebar.
		*
		* @param props - the question domain face, the narrowed plan review, and `t`.
		* @returns The plan-review takeover for this request.
		*/
		function PlanReviewPanel({ pending, review, t, renderSlot }) {
			const [busy, setBusy] = (0, react.useState)(false);
			const [error, setError] = (0, react.useState)(null);
			const settle = (send, remote = false) => {
				setBusy(true);
				setError(null);
				send().then(() => {
					if (!remote) return;
					setBusy(false);
					pending.dismiss().catch(() => {
						setError(t("status.sent"));
					});
				}).catch((cause) => {
					setBusy(false);
					setError(cause instanceof Error ? cause.message : String(cause));
				});
			};
			const decide = (label) => {
				settle(() => pending.answer({ answers: [{
					id: review.id,
					selected: [label]
				}] }), pending.snapshot().channel === "rpc");
			};
			const summary = (0, react.useMemo)(() => {
				const title = (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-line" });
				const description = (0, _deepseek_ai_dsh_client_ui_primitives.extractMarkdownPlainText)(review.plan, { mode: "first-paragraph" });
				return {
					title,
					description: description === title ? "" : description
				};
			}, [review.plan]);
			return (0, react_jsx_runtime.jsx)("div", {
				className: PlanReviewPanel_module_css_default.frame,
				"data-plan-review-key": pending.key,
				children: (0, react_jsx_runtime.jsxs)("section", {
					className: PlanReviewPanel_module_css_default.card,
					"aria-label": review.question,
					"aria-busy": busy,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.strip,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: busy ? "ongoing" : "warning" }),
								t("plan.header"),
								(0, react_jsx_runtime.jsx)("div", {
									className: PlanReviewPanel_module_css_default.previewActions,
									children: renderSlot("conversation.plan-review.actions", {
										review,
										requestKey: pending.key
									})
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.summary,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: PlanReviewPanel_module_css_default.title,
								children: summary.title
							}), summary.description !== "" && (0, react_jsx_runtime.jsx)("p", {
								className: PlanReviewPanel_module_css_default.description,
								children: summary.description
							})]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: PlanReviewPanel_module_css_default.footer,
							children: [(0, react_jsx_runtime.jsx)("div", {
								className: PlanReviewPanel_module_css_default.feedback,
								role: "status",
								children: error
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: PlanReviewPanel_module_css_default.actions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: PlanReviewPanel_module_css_default.discuss,
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
									disabled: busy,
									onClick: () => {
										settle(() => pending.dismiss());
									},
									children: t("plan.discuss")
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									...tooltip(review.approve.description),
									disabled: busy,
									onClick: () => {
										decide(review.approve.label);
									},
									children: t("plan.approve")
								})]
							})]
						})
					]
				})
			});
		}
