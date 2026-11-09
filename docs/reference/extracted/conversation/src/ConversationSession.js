// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/ConversationSession.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Strict per-session header/body content inserted into the resident conversation layout. */
		/** The View tab row's More launcher; its menu rows come from `conversation.session.header.views.actions`. */
		function ViewsMoreMenu({ label, current, entries, onOpen, onPinnedChange, renderSlot }) {
			const [open, setOpen] = (0, react.useState)(false);
			const onDismiss = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				onClose: onDismiss,
				portal: true,
				autoFocus: true,
				className: ConversationRoot_module_css_default.viewsMoreAnchor,
				listClassName: ConversationRoot_module_css_default.viewsMoreMenu,
				anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label,
					portal: true,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						size: "sm",
						className: clsx(ConversationRoot_module_css_default.viewsMore, current && ConversationRoot_module_css_default.viewsMoreActive),
						"aria-label": label,
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconEllipsisOutlineRegular, { size: 13 })
					})
				}),
				children: renderSlot("conversation.session.header.views.actions", {
					entries,
					onOpen,
					onPinnedChange,
					onDismiss
				})
			});
		}
		/** Approximate 13px text advance: full-width glyphs take one em, other glyphs about half. */
		const WIDE_GLYPH = /[\u1100-\u115F\u2E80-\uA4CF\uAC00-\uD7A3\uF900-\uFAFF\uFE30-\uFE4F\uFF00-\uFF60\uFFE0-\uFFE6]/u;
		const WIDE_GLYPH_WIDTH = 13;
		const NARROW_GLYPH_WIDTH = 7;
		/** Mirrors the `.tabLabel` max-width in `ConversationRoot.module.css`. */
		const TAB_LABEL_MAX_WIDTH = 88;
		/** Estimate whether a View tab label exceeds its 88px cell. */
		function labelNeedsTooltip(label) {
			let width = 0;
			for (const glyph of label) width += WIDE_GLYPH.test(glyph) ? WIDE_GLYPH_WIDTH : NARROW_GLYPH_WIDTH;
			return width > TAB_LABEL_MAX_WIDTH;
		}
		/** One View tab label; its full-name tooltip is offered only when the text is expected to overflow. */
		function ViewTabLabel({ label }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				portal: true,
				disabled: !labelNeedsTooltip(label),
				children: (0, react_jsx_runtime.jsx)("span", {
					className: ConversationRoot_module_css_default.tabLabel,
					children: label
				})
			});
		}
		function deriveAncestry(list, id) {
			const chain = [];
			const seen = /* @__PURE__ */ new Set();
			let cursor = id;
			while (cursor !== void 0) {
				if (seen.has(cursor)) break;
				seen.add(cursor);
				const summary = list.byId[cursor];
				if (summary === void 0) break;
				chain.unshift({
					id: summary.id,
					displayTitle: summary.displayTitle,
					subagent: summary.origin === "subagent"
				});
				if (summary.origin !== "subagent") break;
				cursor = summary.parentId;
			}
			return chain;
		}
		function equalBreadcrumbs(left, right) {
			return left.length === right.length && left.every((item, index) => {
				const other = right.at(index);
				return other !== void 0 && item.id === other.id && item.displayTitle === other.displayTitle;
			});
		}
		/**
		* Renders Session header chrome above the resident conversation scrollport.
		* @param props - Strict Session store, view ledger, navigation, render, and locale shares.
		* @returns Session navigation controls, with title and tabs after conversation starts.
		*/
		function ConversationSessionHeader({ sessionId, hideChrome, useSessions, useConversationViews, useStore, renderSlot, open, useContextMenu, selectView, setPinned, t, useEntryPins, useEntryActions }) {
			const { getTriggerProps } = useContextMenu();
			const tabs = useConversationViews((value) => value);
			const active = resolveActiveView(tabs, useStore((s) => s.view));
			const ancestry = useSessions((s) => deriveAncestry(s, sessionId), equalBreadcrumbs);
			const unpinned = useEntryPins((ids) => ids);
			const hasEntryActions = useEntryActions((registered) => registered);
			const showTabs = !hideChrome && tabs.length > 1;
			const tabRow = (0, react.useRef)(null);
			const [visibleViewLimit, setVisibleViewLimit] = (0, react.useState)(1);
			(0, react.useLayoutEffect)(() => {
				const row = tabRow.current;
				if (row === null || !hasEntryActions) return;
				const updateLimit = () => {
					setVisibleViewLimit(Math.max(1, Math.floor((row.clientWidth - 48) / 120)));
				};
				updateLimit();
				if (typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(updateLimit);
				observer.observe(row);
				return () => {
					observer.disconnect();
				};
			}, [showTabs, hasEntryActions]);
			const { visibleTabs, moreTabs } = (0, react.useMemo)(() => {
				const preferred = [...tabs.filter((tab) => tab.id === FIXED_VIEW_ID), ...tabs.filter((tab) => tab.id !== "chat" && !unpinned.includes(tab.id))];
				const visibleTabs = hasEntryActions ? preferred.slice(0, visibleViewLimit) : preferred;
				const visibleIds = new Set(visibleTabs.map((tab) => tab.id));
				return {
					visibleTabs,
					moreTabs: tabs.filter((tab) => !visibleIds.has(tab.id))
				};
			}, [
				tabs,
				unpinned,
				hasEntryActions,
				visibleViewLimit
			]);
			const currentInMore = moreTabs.some((tab) => tab.id === active?.id);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
				className: ConversationRoot_module_css_default.titleRow,
				children: [!hideChrome && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", {
					className: ConversationRoot_module_css_default.titleCluster,
					children: [(0, react_jsx_runtime.jsxs)("nav", {
						className: ConversationRoot_module_css_default.crumbs,
						"aria-label": t("session.hierarchy"),
						children: [ancestry.map((summary, index) => {
							const last = index === ancestry.length - 1;
							const title = last ? (0, react_jsx_runtime.jsx)("span", {
								className: clsx(ConversationRoot_module_css_default.crumb, summary.subagent && ConversationRoot_module_css_default.crumbSubagent, ConversationRoot_module_css_default.crumbCurrent),
								children: summary.displayTitle
							}) : (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: clsx(ConversationRoot_module_css_default.crumb, summary.subagent && ConversationRoot_module_css_default.crumbSubagent),
								onClick: () => {
									open(summary.id);
								},
								children: summary.displayTitle
							});
							const lineage = last || summary.subagent;
							const lineageOwner = {
								lineageSessionId: summary.id,
								displayTitle: summary.displayTitle,
								...last ? {} : { openTitle: () => {
									open(summary.id);
								} }
							};
							return (0, react_jsx_runtime.jsxs)("span", {
								className: ConversationRoot_module_css_default.crumbSeg,
								...getTriggerProps({
									kind: "session",
									value: {
										sessionId: summary.id,
										displayTitle: summary.displayTitle
									}
								}),
								children: [index > 0 && (0, react_jsx_runtime.jsx)("span", {
									className: ConversationRoot_module_css_default.crumbSep,
									children: "/"
								}), lineage ? summary.subagent ? renderSlot("conversation.session.header.lineage", lineageOwner, { fallback: title }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [title, renderSlot("conversation.session.header.lineage", lineageOwner, { fallback: null })] }) : title]
							}, summary.id);
						}), ancestry.length === 0 && (0, react_jsx_runtime.jsx)("span", {
							className: ConversationRoot_module_css_default.crumbCurrent,
							children: sessionId
						})]
					}), (0, react_jsx_runtime.jsx)("div", {
						className: ConversationRoot_module_css_default.headerActions,
						children: renderSlot("conversation.session.header.actions", {})
					})]
				}), (0, react_jsx_runtime.jsx)("div", {
					className: ConversationRoot_module_css_default.headerUtilities,
					children: renderSlot("conversation.session.header.utilities", {})
				})] }), (0, react_jsx_runtime.jsx)("div", {
					className: ConversationRoot_module_css_default.headerCorner,
					"data-conversation-header-corner": "",
					children: renderSlot("conversation.session.header.corner", {})
				})]
			}), showTabs && (0, react_jsx_runtime.jsxs)("div", {
				ref: tabRow,
				className: ConversationRoot_module_css_default.tabs,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: ConversationRoot_module_css_default.viewTabs,
					role: "tablist",
					"data-conversation-tabs": "",
					children: visibleTabs.map((viewTab) => (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						role: "tab",
						"aria-selected": viewTab.id === active?.id,
						className: clsx(ConversationRoot_module_css_default.tab, viewTab.id === active?.id && ConversationRoot_module_css_default.tabActive),
						onClick: () => {
							selectView(viewTab.id);
						},
						children: (0, react_jsx_runtime.jsx)(ViewTabLabel, { label: viewTab.label })
					}, viewTab.id))
				}), hasEntryActions && (0, react_jsx_runtime.jsx)(ViewsMoreMenu, {
					label: t("session.moreViews"),
					current: currentInMore,
					entries: moreTabs.map((viewTab) => ({
						id: viewTab.id,
						label: viewTab.label,
						pinned: !unpinned.includes(viewTab.id),
						active: viewTab.id === active?.id
					})),
					onOpen: selectView,
					onPinnedChange: setPinned,
					renderSlot
				})]
			})] });
		}
		/**
		* Renders the active Session view inside the resident scrollport and keeps
		* the input draft mirrored while blank Hero chrome is visible.
		* @param props - Strict Session input/store, view ledger, and render shares.
		* @returns the active view area, or null while the Session remains blank.
		*/
		function ConversationSession(props) {
			return (0, react_jsx_runtime.jsx)(DefaultConversationViews, { ...props });
		}
