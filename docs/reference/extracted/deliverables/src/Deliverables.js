// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/client.js); region lib/types/client/Deliverables.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The changed-files card, shown only while the Host serves the turn's summary, and explicitly declared files for a closing turn. */
		const COLLAPSED_PRESENTED_COUNT = 4;
		/**
		* Claim turns with a change announcement or declared files.
		* @param owner - closing turn.
		* @returns matched announcement and deliveries, or null for a turn with neither.
		*/
		function selectDeliverables(owner) {
			const changes = changesForClosing(owner);
			const presented = presentedForClosing(owner);
			return changes === null && presented.length === 0 ? null : {
				changes,
				presented
			};
		}
		/**
		* Contribute file deliveries alongside other completed-Turn artifacts.
		* @param props - closing Turn, file actions, and localized copy.
		* @returns file rows, or null when the Turn declares none.
		*/
		function DeliverablesTail(props) {
			const matched = selectDeliverables(props);
			return matched === null ? null : (0, react_jsx_runtime.jsx)(Deliverables, {
				...props,
				matched
			});
		}
		/**
		* Render the changed-files card, once the Host has served the announced
		* summary and it lists a file, and shared native opening controls for declared
		* files. A summary the Host no longer serves leaves no card.
		* @param props - matched announcement and files, workspace opener, and localized copy.
		* @returns the closing turn's file rows.
		*/
		function Deliverables({ matched, openFile, useContextMenu, t, sessionId, useSessions, openPresented, openChangesReview, usePresentedOpen, usePresentedHost, useChangesDiff, loadChangesDiff, useChangesSummary, reloadPresentedHost, loadChangesSummary, useShowCodeDiff, renderSlot }) {
			const { getTriggerProps } = useContextMenu();
			const [expanded, setExpanded] = (0, react.useState)(false);
			const showCodeDiff = useShowCodeDiff((value) => value);
			const cwd = useSessions((state) => state.byId[sessionId]?.cwd);
			const states = usePresentedOpen((value) => value);
			const host = usePresentedHost((value) => value);
			const announced = showCodeDiff ? matched.changes : null;
			const summary = useChangesSummary((value) => announced === null ? void 0 : value[changesSummaryUrl(sessionId, announced.seq)]);
			(0, react.useEffect)(() => {
				if (announced !== null && summary === void 0) loadChangesSummary(sessionId, announced.seq);
			}, [
				announced,
				summary,
				sessionId,
				loadChangesSummary
			]);
			const changes = announced !== null && typeof summary === "object" && summary.files.length > 0 ? {
				seq: announced.seq,
				...summary
			} : null;
			const collapsible = matched.presented.length > COLLAPSED_PRESENTED_COUNT;
			const presented = collapsible && !expanded ? matched.presented.slice(0, COLLAPSED_PRESENTED_COUNT) : matched.presented;
			(0, react.useEffect)(() => {
				if (host === null) reloadPresentedHost();
			}, [host, reloadPresentedHost]);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [changes !== null && (0, react_jsx_runtime.jsx)(ChangedFiles, {
				changes,
				cwd,
				t,
				sessionId,
				useChangesDiff,
				loadChangesDiff,
				openReview: (index) => {
					openChangesReview({
						sessionId,
						seq: changes.seq,
						turn: changes.turn
					}, index);
				}
			}), matched.presented.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
				className: Deliverables_module_css_default.root,
				"data-after-changes": changes !== null || void 0,
				children: [
					host === "error" && (0, react_jsx_runtime.jsxs)("div", {
						className: Deliverables_module_css_default.hostStatus,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t("presented.hostError") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							onClick: () => {
								reloadPresentedHost();
							},
							children: t("presented.retry")
						})]
					}),
					host !== null && host !== "error" && !host.available && (0, react_jsx_runtime.jsx)("span", {
						className: Deliverables_module_css_default.hostStatus,
						children: t("presented.unavailable")
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: Deliverables_module_css_default.presented,
						"data-presented-files-row": true,
						"data-single": matched.presented.length === 1 ? true : void 0,
						children: presented.map((file) => (0, react_jsx_runtime.jsx)(PresentedFileCard, {
							file,
							cwd,
							phase: states[presentedFileUrl(sessionId, file.seq, file.index)],
							host: host === "error" ? null : host,
							t,
							onPreview: () => {
								openFile(file.path);
							},
							contextMenuProps: getTriggerProps({
								kind: "file",
								value: {
									sessionId,
									path: file.path
								}
							}),
							actions: renderSlot("deliverables.file.actions", {
								actionUrl: presentedFileUrl(sessionId, file.seq, file.index),
								available: host !== null && host !== "error" && host.available,
								pending: states[presentedFileUrl(sessionId, file.seq, file.index)] === "opening" || states[presentedFileUrl(sessionId, file.seq, file.index)] === "revealing",
								onAction: (action, application) => openPresented(sessionId, file.seq, file.index, action, application)
							})
						}, `${file.seq}:${file.index}`))
					}),
					collapsible && (0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: Deliverables_module_css_default.toggle,
						"aria-expanded": expanded,
						"aria-label": t(expanded ? "presented.collapseAria" : "presented.expandAria", { count: matched.presented.length }),
						onClick: () => {
							setExpanded((value) => !value);
						},
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(expanded ? "presented.collapse" : "presented.all", { count: matched.presented.length }) }), expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronUpOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
					})
				]
			})] });
		}
