// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/ConversationContent.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function ConversationSessionView({ renderSlot }) {
			return renderSlot("conversation.session", {});
		}
		function NoConversationWidthControls() {
			return null;
		}
		/**
		* Render the shared Conversation body and its occurrence-selected local Components.
		* @param props - Factory input, standard Session sources, and Conversation seats.
		* @returns the Conversation view, Composer, and optional width controls.
		*/
		function ConversationContent(props) {
			const { sessionId, phase, hero, useSession, useSessions, useSessionStatus, useWorkspaces, useInput, useComposerBlock, renderSlot, renderSlotChain, selectWorkspace, t, useFactorySlot } = props;
			const session = useSession((snapshot) => snapshot);
			const Views = useFactorySlot("views", ConversationSessionView);
			const WidthControls = useFactorySlot("widthControls", NoConversationWidthControls);
			const [body, setBody] = (0, react.useState)(null);
			const pendingInteraction = useSessionStatus((snapshot) => sessionId === void 0 ? void 0 : snapshot.get(sessionId)?.pendingInteraction);
			const inputState = useInput((s) => s);
			const cwd = useSessions((s) => sessionId === void 0 ? void 0 : s.byId[sessionId]?.cwd);
			const workspaces = useWorkspaces((s) => s);
			const composerBlock = useComposerBlock((block) => block);
			const [pickerOpen, setPickerOpen] = (0, react.useState)(false);
			const [pendingWorkspaceId, setPendingWorkspaceId] = (0, react.useState)();
			const pickerAnchor = (0, react.useRef)(null);
			const seatObserver = (0, react.useRef)(null);
			const seatResizeRef = (0, react.useCallback)((seat) => {
				seatObserver.current?.disconnect();
				seatObserver.current = null;
				const scroller = seat?.parentElement ?? null;
				if (seat === null || scroller === null) return;
				seatObserver.current = new ResizeObserver(() => {
					scroller.style.setProperty("--dsh-composer-height", `${seat.offsetHeight}px`);
					scroller.style.setProperty("--dsh-conversation-viewport-height", `${scroller.clientHeight}px`);
				});
				seatObserver.current.observe(seat);
				seatObserver.current.observe(scroller);
			}, []);
			const sessionWorkspace = sessionId === void 0 ? void 0 : workspaces.items.find((workspace) => workspace.sessionIds.includes(sessionId));
			const pendingWorkspace = workspaces.items.find((workspace) => workspace.workspaceId === pendingWorkspaceId);
			(0, react.useEffect)(() => {
				if (pendingWorkspaceId === void 0) return;
				if (sessionWorkspace?.workspaceId === pendingWorkspaceId || workspaces.phase === "ready" && pendingWorkspace === void 0) setPendingWorkspaceId(void 0);
			}, [
				pendingWorkspaceId,
				sessionWorkspace?.workspaceId,
				workspaces.phase,
				pendingWorkspace
			]);
			const zone = session === void 0 || inputState === void 0 ? void 0 : {
				session,
				input: inputState
			};
			const storedChipTitle = pendingWorkspace?.title ?? (sessionId === void 0 ? void 0 : sessionWorkspace?.title ?? (workspaces.phase === "ready" || cwd === void 0 || cwd === "" ? void 0 : workspaceLabel(cwd)));
			const chipTitle = storedChipTitle === void 0 ? void 0 : workspaceDisplayTitle(storedChipTitle, t("workspace.defaultName"));
			const heroWorkspaceRow = (0, react_jsx_runtime.jsxs)("div", {
				className: ConversationRoot_module_css_default.heroWorkspaceRow,
				children: [
					(0, react_jsx_runtime.jsx)(WorkspaceChip, {
						buttonRef: pickerAnchor,
						label: chipTitle,
						menuOpen: pickerOpen,
						onClick: () => {
							setPickerOpen((open) => !open);
						},
						t
					}),
					renderSlot("conversation.hero.workspace", {
						open: pickerOpen,
						anchorRef: pickerAnchor,
						selectedId: pendingWorkspaceId ?? sessionWorkspace?.workspaceId,
						onPick: (workspaceId) => {
							setPickerOpen(false);
							setPendingWorkspaceId(workspaceId);
							selectWorkspace(workspaceId).catch(() => {
								setPendingWorkspaceId((current) => current === workspaceId ? void 0 : current);
							});
						},
						onClose: () => {
							setPickerOpen(false);
						}
					}),
					renderSlot("conversation.hero.agentPreset", {}),
					sessionId === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: ConversationRoot_module_css_default.heroOptions,
						children: renderSlot("conversation.hero.options", {})
					})
				]
			});
			const inert = sessionId === void 0 || hero && chipTitle === void 0;
			const inputBar = renderSlot("conversation.composer.bar", {
				variant: hero ? "hero" : "composer",
				...inert ? {
					disabled: true,
					placeholder: t("placeholder.workspace"),
					workspacePickerOpen: pickerOpen,
					onRequestWorkspace: () => {
						setPickerOpen(true);
					}
				} : !inert && composerBlock !== void 0 ? {
					blocked: composerBlock,
					placeholder: composerBlock.reason
				} : hero ? { placeholder: t("placeholder.hero") } : {}
			});
			const composerBar = (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(ConversationRoot_module_css_default.composerStack, hero && ConversationRoot_module_css_default.composerHero),
				children: [
					hero && (0, react_jsx_runtime.jsx)(HeroShell, {
						t,
						renderSlot
					}),
					hero && heroWorkspaceRow,
					zone !== void 0 && renderSlot("conversation.input.dock", zone),
					inputBar
				]
			});
			const composer = renderSlotChain("conversation.composer", {
				sessionId,
				session,
				pendingInteraction
			}, {
				fallback: composerBar,
				fallbackOnly: sessionId === void 0,
				overlay: true
			});
			const composerSeat = (0, react_jsx_runtime.jsx)("div", {
				ref: seatResizeRef,
				className: ConversationRoot_module_css_default.composerSeat,
				"data-composer-seat": "",
				"data-conversation-region": "composer",
				children: composer
			});
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: setBody,
				className: clsx(ConversationRoot_module_css_default.body, props.variant === "embedded" && ConversationRoot_module_css_default.embeddedBody),
				"data-conversation-content": "",
				"data-conversation-session": sessionId,
				"data-conversation-region": "chat",
				"data-content-phase": phase,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: ConversationRoot_module_css_default.scrollBody,
					"data-conversation-scroll": "",
					children: [sessionId === void 0 ? null : (0, react_jsx_runtime.jsx)(Views, {}), composerSeat]
				}), (0, react_jsx_runtime.jsx)(WidthControls, {
					container: body,
					phase
				})]
			});
		}
