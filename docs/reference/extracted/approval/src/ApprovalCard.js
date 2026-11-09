// Extracted from @deepseek-ai/dsh-client-ui-approval (lib/client.js); region lib/types/client/ApprovalCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared approval presentation; each caller retains its decision policy and answer channel. */
		/**
		* Render one decision with caller-owned actions and an optional persistent choice.
		* @param props Request identity, copy, actions and correlated detail.
		* @returns The shared approval card, reset for each request.
		*/
		function ApprovalCard(props) {
			return (0, react_jsx_runtime.jsx)(ApprovalFlow, { ...props }, props.requestKey);
		}
		function ApprovalFlow(props) {
			const { requestKey, title, description, subject, allowLabel, canAnswer, onAllow, onReject, onAlways, t } = props;
			const detail = props.callId === void 0 ? null : props.renderSlot("conversation.approval.detail", { callId: props.callId });
			const [answered, setAnswered] = (0, react.useState)(false);
			const waiting = (0, react.useRef)(false);
			const active = (0, react.useRef)(true);
			const composing = (0, react.useRef)(false);
			const compositionEnded = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				active.current = true;
				return () => {
					active.current = false;
				};
			}, []);
			const answer = (send) => {
				if (waiting.current || !canAnswer()) return;
				waiting.current = true;
				setAnswered(true);
				send().catch(() => {
					if (!active.current || !canAnswer()) return;
					waiting.current = false;
					setAnswered(false);
				});
			};
			const keydown = (event) => {
				const element = event.target;
				if (event.defaultPrevented || !event.currentTarget.contains(document.activeElement) || element.closest("input, textarea, select, [contenteditable=\"true\"], [contenteditable=\"\"]") !== null) return;
				if (event.key !== "Enter" && event.key !== "Escape") return;
				if (event.key === "Enter" && element.closest("button, a[href], [role=\"button\"]") !== null) return;
				if (event.ctrlKey || event.metaKey || event.altKey || event.shiftKey) return;
				event.preventDefault();
				event.stopPropagation();
				if (event.repeat || composing.current || compositionEnded.current || event.nativeEvent.isComposing || event.keyCode === 229) return;
				answer(event.key === "Enter" ? onAllow : onReject);
			};
			return (0, react_jsx_runtime.jsx)("div", {
				className: ApprovalPanel_module_css_default.root,
				"data-approval-key": requestKey,
				"aria-busy": answered,
				onKeyDown: keydown,
				onKeyUpCapture: () => {
					compositionEnded.current = false;
				},
				onCompositionStartCapture: () => {
					composing.current = true;
				},
				onCompositionEndCapture: () => {
					composing.current = false;
					compositionEnded.current = true;
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: subject === void 0 ? ApprovalPanel_module_css_default.card : `${ApprovalPanel_module_css_default.card} ${ApprovalPanel_module_css_default.withSubject}`,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.strip,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: answered ? "ongoing" : "warning" }), t("waiting")]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.body,
							"data-approval-scroll": "",
							tabIndex: 0,
							role: "group",
							"aria-label": t("detail.aria"),
							children: [
								subject !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
									className: ApprovalPanel_module_css_default.subject,
									children: [subject.icon !== void 0 && (0, react_jsx_runtime.jsx)("img", {
										src: subject.icon,
										alt: "",
										width: 40,
										height: 40,
										draggable: false
									}), (0, react_jsx_runtime.jsx)("strong", { children: subject.name })]
								}),
								(0, react_jsx_runtime.jsx)("div", {
									className: ApprovalPanel_module_css_default.headline,
									children: title
								}),
								description !== void 0 && (0, react_jsx_runtime.jsx)("p", {
									className: ApprovalPanel_module_css_default.description,
									children: description
								}),
								detail !== null && (0, react_jsx_runtime.jsx)("div", {
									className: ApprovalPanel_module_css_default.command,
									children: detail
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ApprovalPanel_module_css_default.actionRow,
							children: [
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									className: ApprovalPanel_module_css_default.reject,
									disabled: answered,
									onClick: () => {
										answer(onReject);
									},
									children: t("reject")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: onAlways === void 0 ? "primary" : "outline",
									disabled: answered,
									onClick: () => {
										answer(onAllow);
									},
									children: allowLabel ?? t("allowOnce")
								}),
								onAlways !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									disabled: answered,
									onClick: () => {
										answer(onAlways);
									},
									children: t("allowAlways")
								})
							]
						})
					]
				})
			});
		}
