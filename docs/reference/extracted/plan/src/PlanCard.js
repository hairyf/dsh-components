// Extracted from @deepseek-ai/dsh-client-ui-plan (lib/client.js); region lib/types/client/PlanCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Persistent transcript cards and pending-review sidebar navigation. */
		/**
		* Render the completed Turn's submitted plans in invocation order.
		* @param props - Logged plan, localized copy, and Session-bound navigation.
		* @returns keyboard-accessible plan cards, or null for a Turn without plans.
		*/
		function PlanCards({ turn, usePlans, openPlan, t }) {
			const plans = usePlans(String(turn.turn));
			if (plans === void 0 || plans.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("div", {
				className: PlanPreview_module_css_default.cards,
				"data-plan-artifacts": true,
				children: plans.map((plan) => (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PlanPreview_module_css_default.card,
					"data-plan-card": plan.callId,
					"aria-label": t("preview.openNamed", { title: plan.title }),
					onClick: () => {
						openPlan(plan.callId);
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: PlanPreview_module_css_default.cardIcon,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
								kind: "markdown",
								size: 20
							})
						}),
						(0, react_jsx_runtime.jsxs)("span", {
							className: PlanPreview_module_css_default.cardDetails,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: PlanPreview_module_css_default.cardTitle,
								children: plan.title
							}), (0, react_jsx_runtime.jsx)("span", {
								className: PlanPreview_module_css_default.cardDescription,
								children: t("preview.document")
							})]
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: PlanPreview_module_css_default.cardOpen,
							children: t("preview.action")
						})
					]
				}, plan.callId))
			});
		}
		/**
		* Open each pending plan automatically and retain a manual opener without answering it.
		*
		* The automatic open waits for a Session on screen. `ctx.sidebarRight` names
		* the Session before the commit that brings its Conversation back renders, so
		* a review that arrived while the Conversation was off screen opens from the
		* effect of the commit that mounts it.
		* @param props - Review identity, Session store, localized copy, and navigation.
		* @returns an opener for either logged or temporary plan text.
		*/
		function PlanReviewOpen({ review, requestKey, openReview, useSidebarMounted, t, useStore, actions }) {
			const identity = review.callId === void 0 ? `review:${requestKey}` : `call:${review.callId}`;
			const opened = useStore((state) => state.opened[identity] === true);
			const mounted = useSidebarMounted((session) => session !== void 0);
			(0, react.useEffect)(() => {
				if (opened || !mounted) return;
				openReview(review, requestKey);
				actions.markOpened(identity);
			}, [
				identity,
				opened,
				mounted,
				openReview,
				review,
				requestKey,
				actions
			]);
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: PlanPreview_module_css_default.reviewLink,
				title: t("preview.open"),
				"aria-label": t("preview.open"),
				onClick: () => {
					openReview(review, requestKey);
				},
				children: [t("preview.full"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, { size: 14 })]
			});
		}
