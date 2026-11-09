// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ChatGroupSeat.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Stable process container; display policy changes visibility, never member parents. */
		const PROCESS_TITLE_MINIMUM_MS = 150;
		const PROCESS_ICONS = {
			thinking: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconThinkOutlineRegular, {}),
			read: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
			readImage: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
			search: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
			edit: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
			write: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEditOutlineRegular, { size: 14 }),
			commands: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconApiOutlineRegular, {}),
			code: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCodeOutlineRegular, { size: 14 }),
			webSearch: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconGlobeOutlineRegular, {}),
			webFetch: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconBrowseOutlineRegular, { size: 14 }),
			subagents: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconAgentPresetOutlineRegular, { size: 14 }),
			plan: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlanOutlineRegular, {}),
			questions: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconQuestionOutlineRegular, {}),
			tools: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSparkleRegular, { size: 14 })
		};
		function sameLiveProcessTitle(left, right) {
			return left.activity === right.activity && left.detail === right.detail && left.preparing === right.preparing;
		}
		function useStableLiveProcessTitle(desired, active) {
			const [displayed, setDisplayed] = (0, react.useState)(desired);
			const displayedRef = (0, react.useRef)(displayed);
			const desiredRef = (0, react.useRef)(desired);
			const displayedAtRef = (0, react.useRef)(Date.now());
			(0, react.useEffect)(() => {
				desiredRef.current = desired;
				if (!active || sameLiveProcessTitle(displayedRef.current, desired)) return;
				const remaining = PROCESS_TITLE_MINIMUM_MS - (Date.now() - displayedAtRef.current);
				const commit = () => {
					const next = desiredRef.current;
					displayedRef.current = next;
					displayedAtRef.current = Date.now();
					setDisplayed(next);
				};
				if (remaining <= 0) {
					commit();
					return;
				}
				const timer = setTimeout(commit, remaining);
				return () => {
					clearTimeout(timer);
				};
			}, [
				active,
				desired.activity,
				desired.detail,
				desired.preparing
			]);
			return active ? displayed : desired;
		}
		const GroupMembers = (0, react.memo)(function GroupMembers({ members, ...props }) {
			return members.map((member) => (0, react.createElement)(ChatNodeSeat, {
				...props,
				key: chatRenderKey(member),
				nodeKey: member.key,
				...member.groupPart === void 0 ? {} : { groupPart: member.groupPart }
			}));
		});
		const ProcessGroupHeader = (0, react.memo)(function ProcessGroupHeader({ groupKey, useChatGroup, usePresentation, t, open, bodyId, toggle }) {
			const data = useChatGroup(groupKey, (group) => group?.data);
			const detailed = usePresentation((policy) => data?.closed === false && policy.liveProcessDetail);
			const live = useStableLiveProcessTitle({
				activity: data?.summary.running ?? "thinking",
				detail: data?.summary.runningDetail ?? "",
				preparing: data?.summary.preparing === true
			}, data !== void 0 && !data.closed);
			if (data === void 0) return null;
			const label = data.closed ? processTitle(data.summary, t) : live.preparing ? t(`message.stepProcess.prepare.${live.activity === "thinking" ? "tools" : live.activity}`) : t(`message.stepProcess.${live.activity}`);
			const detail = detailed && !data.closed ? live.detail : "";
			const title = detail === "" ? label : `${label}${t("message.turnProcess.separator")}${detail}`;
			const activity = data.closed ? data.summary.counts[0]?.kind ?? "thinking" : live.activity;
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: ChatGroupSeat_module_css_default.title,
				"aria-expanded": open,
				"aria-controls": bodyId,
				"data-process-activity": activity,
				onClick: (event) => {
					event.currentTarget.focus();
					toggle();
				},
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: ChatGroupSeat_module_css_default.leading,
					"aria-hidden": "true",
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: ChatGroupSeat_module_css_default.activityIcon,
						"data-step-process-icon": true,
						children: PROCESS_ICONS[activity]
					}), (0, react_jsx_runtime.jsx)("span", {
						className: ChatGroupSeat_module_css_default.chevron,
						"data-step-process-chevron": true,
						children: open ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
					})]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					active: !data.closed,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
						className: ChatGroupSeat_module_css_default.label,
						children: title
					})
				})]
			});
		});
		/** Render a process group with local disclosure and the existing outer-Turn visibility. */
		const ChatGroupSeat = (0, react.memo)(function ChatGroupSeat({ groupKey, useChatGroup, useGroupHeaderAction, ...props }) {
			const members = useChatGroup(groupKey, (group) => group?.members);
			const turn = useChatGroup(groupKey, (group) => group?.data.turn);
			const closed = useChatGroup(groupKey, (group) => group?.data.closed);
			const foldCompleted = props.usePresentation((policy) => policy.foldCompletedTurns);
			const { expanded: open, setExpanded: setOpen } = useDisclosure();
			const firstKey = members?.[0]?.key ?? "";
			const deferCollapse = props.useChatNodeBottom(firstKey) === true && props.deferCollapse;
			const presentation = props.useChatNodeProcess(firstKey);
			const turnLocation = props.useChatNode(firstKey, (node) => {
				const location = node?.location;
				return location?.kind === "turn" || location?.kind === "step" ? location.turn : void 0;
			});
			const grouped = props.usePresentation((policy) => policy.stepGrouping === "collapsed" || policy.stepGrouping === "history" && turnLocation?.status !== "open" && !deferCollapse);
			const reason = turnLocation?.end?.data.reason.kind;
			const alwaysOpen = presentation?.turnClosed === false || presentation?.hasInterleavedInput === true || reason === "aborted" || reason === "interrupted" || reason === "error";
			const spec = presentation?.spec;
			const selectOpen = (0, react.useCallback)((state) => spec !== void 0 && turnProcessOpen(state, spec, deferCollapse), [spec, deferCollapse]);
			const storedOpen = props.useStore(selectOpen);
			const outerHidden = foldCompleted && presentation?.turnClosed === true && spec !== void 0 && !alwaysOpen && !storedOpen;
			const revealOuter = (0, react.useCallback)(() => {
				if (spec !== void 0 && !alwaysOpen) props.actions.setTurnProcessOpen(spec.turn, spec.answerStep ?? 0, true);
			}, [
				props.actions,
				spec,
				alwaysOpen
			]);
			const rootRef = props.useGroupAction(outerHidden, revealOuter);
			const headerRef = (0, react.useRef)(null);
			const deferCompletedTurns = props.usePresentation((policy) => policy.collapseTiming === "next-input");
			useGroupHeaderAction(headerRef, !grouped || deferCompletedTurns && outerHidden);
			(0, react.useEffect)(() => {
				if (outerHidden && rootRef.current !== null && hiddenOrCollapsing(rootRef.current)) setOpen(false);
			}, [
				outerHidden,
				rootRef,
				setOpen
			]);
			const reveal = (0, react.useCallback)(() => {
				setOpen(true);
			}, [setOpen]);
			const bodyRef = props.useGroupAction(grouped && !open, reveal);
			const contentRef = (0, react.useRef)(null);
			const bodyId = (0, react.useId)();
			const { edges, events, initialize } = useProcessScroll(bodyRef, contentRef, open, grouped);
			const toggle = (0, react.useCallback)(() => {
				if (!open) initialize(closed === false ? "bottom" : "top");
				setOpen(!open);
			}, [
				closed,
				initialize,
				open,
				setOpen
			]);
			const shownCap = !grouped ? false : open ? true : void 0;
			const [closingCap, setClosingCap] = (0, react.useState)(shownCap ?? true);
			if (shownCap !== void 0 && shownCap !== closingCap) setClosingCap(shownCap);
			if (members === void 0) return null;
			const capped = grouped && (!deferCompletedTurns || (shownCap ?? closingCap));
			const classes = [
				ChatGroupSeat_module_css_default.body,
				!capped ? ChatGroupSeat_module_css_default.expandedBody : "",
				capped && edges.canScrollUp ? ChatGroupSeat_module_css_default.fadeTop : "",
				capped && edges.canScrollDown ? ChatGroupSeat_module_css_default.fadeBottom : ""
			];
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: rootRef,
				className: ChatGroupSeat_module_css_default.root,
				"data-chat-group-key": groupKey,
				"data-chat-flow-key": groupKey,
				"data-chat-anchor-key": `group:${groupKey}`,
				"data-chat-turn": turn,
				"data-chat-paging-anchor": grouped && !open || void 0,
				"data-step-process": true,
				"data-group-expanded-mode": !grouped || void 0,
				children: [(0, react_jsx_runtime.jsx)("div", {
					ref: headerRef,
					children: (0, react_jsx_runtime.jsx)(ProcessGroupHeader, {
						groupKey,
						useChatGroup,
						usePresentation: props.usePresentation,
						t: props.t,
						open,
						bodyId,
						toggle
					})
				}), (0, react_jsx_runtime.jsx)("div", {
					ref: bodyRef,
					id: bodyId,
					className: classes.join(" "),
					"data-step-process-body": true,
					"data-scroll-up": edges.canScrollUp || void 0,
					"data-scroll-down": edges.canScrollDown || void 0,
					...events,
					children: (0, react_jsx_runtime.jsx)("div", {
						ref: contentRef,
						className: ChatGroupSeat_module_css_default.content,
						"data-step-process-content": true,
						"data-chat-flow": "",
						children: (0, react_jsx_runtime.jsx)(GroupMembers, {
							...props,
							members
						})
					})
				})]
			});
		});
