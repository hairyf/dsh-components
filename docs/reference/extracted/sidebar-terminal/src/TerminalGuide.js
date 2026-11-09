// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.js); region lib/types/client/TerminalGuide.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shell launch menu owned by the terminal provider's guide entry. */
		/**
		* Open the remembered shell from the card or choose another shell from its menu.
		* The card displays its effective shortcut; the shell menu sits beside the title.
		* @param props - guide copy, enclosing tab actions and cancellable discovery.
		* @returns separate launch and menu buttons within one guide card.
		*/
		function TerminalGuide({ title, description, kind, useTabInfo, loadShells, selectShell, t, useShortcuts }) {
			const shortcut = useShortcuts((entries) => entries.find((entry) => entry.id === "terminal.new"));
			const { tab } = useTabInfo();
			const [open, setOpen] = (0, react.useState)(false);
			const [attempt, setAttempt] = (0, react.useState)(0);
			const [state, setState] = (0, react.useState)({ phase: "loading" });
			(0, react.useEffect)(() => {
				if (!open) return;
				const lifetime = new AbortController();
				loadShells(lifetime.signal).then((choices) => {
					if (!lifetime.signal.aborted) setState({
						phase: "ready",
						choices
					});
				}, (error) => {
					if (!lifetime.signal.aborted) setState({
						phase: "failed",
						message: error instanceof Error ? error.message : String(error)
					});
				});
				return () => {
					lifetime.abort();
				};
			}, [
				open,
				attempt,
				loadShells
			]);
			const items = state.phase === "ready" ? state.choices.shells.map((shell) => ({
				id: shell.path,
				label: shell.name
			})) : state.phase === "loading" ? [{
				id: "loading",
				label: t("shellLoading"),
				disabled: true
			}] : [{
				id: "error",
				label: t("failed", { message: state.message }),
				disabled: true
			}, {
				id: "retry",
				label: t("retry")
			}];
			return (0, react_jsx_runtime.jsxs)("div", {
				className: TerminalGuide_module_css_default.entry,
				"data-sidebar-right-guide-entry": kind,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "ghost",
						className: TerminalGuide_module_css_default.main,
						"aria-label": description === void 0 ? title : `${title} ${description}`,
						"aria-keyshortcuts": shortcut?.aria,
						onClick: () => {
							tab.actions.openTab("terminal", { replaceTab: true });
						}
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: TerminalGuide_module_css_default.icon,
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PluginArtworkTerminal, { size: description === void 0 ? 22 : 26 })
					}),
					(0, react_jsx_runtime.jsxs)("span", {
						className: TerminalGuide_module_css_default.text,
						children: [(0, react_jsx_runtime.jsxs)("span", {
							className: TerminalGuide_module_css_default.titleRow,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TerminalGuide_module_css_default.title,
								"aria-hidden": "true",
								children: title
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
								open,
								portal: true,
								autoFocus: true,
								align: "end",
								className: TerminalGuide_module_css_default.menu,
								items: items.length === 0 ? [{
									id: "empty",
									label: t("shellEmpty"),
									disabled: true
								}] : items,
								selectedId: state.phase === "ready" ? state.choices.selectedShell : void 0,
								onClose: () => {
									setOpen(false);
								},
								onSelect: (path) => {
									if (state.phase === "failed") {
										setState({ phase: "loading" });
										setAttempt((value) => value + 1);
										return;
									}
									selectShell(path);
									setOpen(false);
									tab.actions.openTab("terminal", {
										replaceTab: true,
										params: { shellPath: path }
									});
								},
								anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									className: TerminalGuide_module_css_default.trigger,
									"aria-label": t("shell"),
									"aria-haspopup": "menu",
									"aria-expanded": open,
									onClick: () => {
										setState({ phase: "loading" });
										setOpen((value) => !value);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})
								})
							})]
						}), description !== void 0 && (0, react_jsx_runtime.jsx)("span", {
							className: TerminalGuide_module_css_default.description,
							"aria-hidden": "true",
							children: description
						})]
					}),
					shortcut !== void 0 && shortcut.keys.length > 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, {
						keys: shortcut.keys,
						className: TerminalGuide_module_css_default.shortcut
					})
				]
			});
		}
