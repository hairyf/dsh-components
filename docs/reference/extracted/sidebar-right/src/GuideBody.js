// Extracted from @deepseek-ai/dsh-client-ui-sidebar-right (lib/client.js); region lib/types/client/tabs/guide/GuideBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The guide tab's body: a chain host, and the guide it falls back to.
		*
		* The chain is the replacement seam. A product with its own idea of what an
		* empty sidebar should say registers into `sidebar.right.tab.guide`, and its entry
		* takes the whole body; with no entry, or with every entry declining, the guide
		* below renders. The shipped guide is the owner's fallback rather than a chain
		* entry of its own, so there is always exactly one body and the shipped one
		* cannot be outvoted by accident.
		*
		* The shipped guide is a muted compass over the pinned entry capsules every
		* registered type contributed, centred in the body, with no heading, as a
		* browser start page shows its doors without a caption. While at most four
		* capsules are visible, a capsule with a description shows it under the title;
		* a longer list drops every description to stay light. A More card follows
		* while `sidebar.right.tab.guide.actions` has registrations.
		* Picking one opens that type as a page
		* in this tab's place, so the guide is a doorway rather than a page that stays
		* open.
		*/
		/** Entry count past which the guide drops the capsules' descriptions to stay light. */
		const MAX_DESCRIBED_ENTRIES = 4;
		/** One entry capsule: the contributing type's glyph and title, and its description while the guide is short. */
		function EntryBox({ entry, described, onPick, shortcut }) {
			const Icon = entry.icon ?? CubeGlyph;
			const description = described ? entry.description?.() : void 0;
			return (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: GuideBody_module_css_default.entry,
				"data-sidebar-right-guide-entry": entry.kind,
				"aria-keyshortcuts": shortcut?.aria,
				onClick: () => {
					onPick(entry);
				},
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: GuideBody_module_css_default.entryIcon,
						children: (0, react_jsx_runtime.jsx)(Icon, {
							size: description === void 0 ? 22 : 26,
							className: entry.icon === void 0 ? GuideBody_module_css_default.placeholderInk : void 0
						})
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: GuideBody_module_css_default.entryText,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: GuideBody_module_css_default.entryTitle,
							children: entry.title()
						}), description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: GuideBody_module_css_default.entryDescription,
							children: description
						})]
					}),
					shortcut !== void 0 && shortcut.keys.length > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, { keys: shortcut.keys })
				]
			});
		}
		/** The guide's More card; its menu rows come from `sidebar.right.tab.guide.actions` and span at least the card width. */
		function GuideMoreMenu({ label, entries, onOpen, onPinnedChange, renderSlot }) {
			const [open, setOpen] = (0, react.useState)(false);
			const onDismiss = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open,
				onClose: onDismiss,
				portal: true,
				autoFocus: true,
				minWidthFromAnchor: true,
				align: "end",
				className: GuideBody_module_css_default.moreAnchor,
				listClassName: GuideBody_module_css_default.moreMenu,
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: GuideBody_module_css_default.entry,
					"aria-label": label,
					"aria-haspopup": "menu",
					"aria-expanded": open,
					onClick: () => {
						setOpen((value) => !value);
					},
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: GuideBody_module_css_default.entryIcon,
						children: (0, react_jsx_runtime.jsx)(GuideMoreIcon, {})
					}), (0, react_jsx_runtime.jsx)("span", {
						className: GuideBody_module_css_default.entryText,
						children: (0, react_jsx_runtime.jsx)("span", {
							className: GuideBody_module_css_default.entryTitle,
							children: label
						})
					})]
				}),
				children: renderSlot("sidebar.right.tab.guide.actions", {
					entries,
					onOpen,
					onPinnedChange,
					onDismiss
				})
			});
		}
		/** The shipped guide: the tab's own compass over the doors out of the column. */
		function ShippedGuide({ children }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: GuideBody_module_css_default.guide,
				"data-sidebar-right-guide": true,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: GuideBody_module_css_default.hero,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsx)(CompassGlyph, { size: 56 })
				}), children]
			});
		}
		/** The guide tab's body, replaceable through its chain child. */
		function GuideBody({ useTabInfo, useGuideEntries, renderSlot, renderSlotChain, useShortcuts, useEntryPins, useEntryActions, setPinned, t }) {
			const shortcuts = useShortcuts((entries) => entries);
			const { tab } = useTabInfo();
			const entries = useGuideEntries((entries) => entries);
			const unpinned = useEntryPins((ids) => ids);
			const hasEntryActions = useEntryActions((registered) => registered);
			const open = (kind) => {
				tab.actions.openTab(kind, { replaceTab: true });
				tab.actions.close();
			};
			const visibleEntries = entries.filter((entry) => entry.kind === "files" || !unpinned.includes(guideEntryId(entry)));
			return renderSlotChain("sidebar.right.tab.guide", {}, {
				hookContext: useTabInfo,
				fallback: (0, react_jsx_runtime.jsxs)(ShippedGuide, { children: [visibleEntries.map((entry) => {
					const described = visibleEntries.length <= MAX_DESCRIBED_ENTRIES;
					const description = described ? entry.description?.() : void 0;
					return (0, react_jsx_runtime.jsx)("div", {
						className: GuideBody_module_css_default.entryCell,
						children: renderSlot("sidebar.right.tab.guide.entry", {
							entryId: entry.id,
							kind: entry.kind,
							title: entry.title(),
							...description === void 0 ? {} : { description }
						}, {
							entryKey: entry.providerId,
							hookContext: useTabInfo,
							fallback: (0, react_jsx_runtime.jsx)(EntryBox, {
								entry,
								described,
								shortcut: shortcuts.find((shortcut) => shortcut.id === entry.commandId),
								onPick: (selected) => {
									open(selected.kind);
								}
							})
						})
					}, JSON.stringify([entry.providerId, entry.id]));
				}), hasEntryActions && (0, react_jsx_runtime.jsx)(GuideMoreMenu, {
					label: t("tab.guide.more"),
					entries: entries.filter((entry) => entry.kind !== "files").map((entry) => ({
						id: guideEntryId(entry),
						label: entry.title(),
						pinned: !unpinned.includes(guideEntryId(entry))
					})),
					onOpen: (id) => {
						const entry = entries.find((candidate) => guideEntryId(candidate) === id);
						if (entry !== void 0) open(entry.kind);
					},
					onPinnedChange: setPinned,
					renderSlot
				})] })
			});
		}
