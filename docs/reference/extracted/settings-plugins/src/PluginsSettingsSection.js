// Extracted from @deepseek-ai/dsh-client-ui-settings-plugins (lib/client.js); region lib/types/client/PluginsSettingsSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Plugins settings section: localized tabs around feature-owned pages. */
		/** Render one Plugins page whose contents arrive from feature-owned tabs; one contribution shows as the page itself. */
		function PluginsSettingsSection({ t, renderSlot, useTabs }) {
			const tabsId = (0, react.useId)();
			const tabRefs = (0, react.useRef)([]);
			const rows = useTabs((value) => value);
			const [activeId, setActiveId] = (0, react.useState)();
			const [visitedIds, setVisitedIds] = (0, react.useState)(() => /* @__PURE__ */ new Set());
			const active = rows.find((row) => row.id === activeId)?.id ?? rows[0]?.id;
			const single = rows.length === 1 ? rows[0] : void 0;
			(0, react.useEffect)(() => {
				if (active === void 0) return;
				setVisitedIds((previous) => {
					if (previous.has(active)) return previous;
					return new Set([...previous, active]);
				});
			}, [active]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginsSettingsSection_module_css_default.section,
				children: [
					(0, react_jsx_runtime.jsx)("h2", {
						className: PluginsSettingsSection_module_css_default.heading,
						children: t("title")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: PluginsSettingsSection_module_css_default.intro,
						children: t("intro")
					}),
					rows.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginsSettingsSection_module_css_default.empty,
						children: t("empty")
					}) : single !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
						className: PluginsSettingsSection_module_css_default.panel,
						children: renderSlot("settings.plugins.tab", {}, { only: single.id })
					}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("div", {
						className: PluginsSettingsSection_module_css_default.tabs,
						role: "tablist",
						"aria-label": t("tabs"),
						children: rows.map((row, index) => {
							const selected = row.id === active;
							return (0, react_jsx_runtime.jsx)("button", {
								ref: (element) => {
									tabRefs.current[index] = element;
								},
								id: `${tabsId}-tab-${row.id}`,
								type: "button",
								role: "tab",
								className: PluginsSettingsSection_module_css_default.tab,
								"aria-selected": selected,
								"aria-controls": `${tabsId}-panel-${row.id}`,
								"data-active": selected ? "true" : void 0,
								tabIndex: selected ? 0 : -1,
								onClick: () => {
									setActiveId(row.id);
								},
								onKeyDown: (event) => {
									let nextIndex;
									switch (event.key) {
										case "ArrowRight":
											nextIndex = (index + 1) % rows.length;
											break;
										case "ArrowLeft":
											nextIndex = (index - 1 + rows.length) % rows.length;
											break;
										case "Home":
											nextIndex = 0;
											break;
										case "End":
											nextIndex = rows.length - 1;
											break;
										default: return;
									}
									event.preventDefault();
									const nextRow = rows[nextIndex];
									const nextTab = tabRefs.current[nextIndex];
									setActiveId(nextRow.id);
									nextTab.focus();
								},
								children: row.label
							}, row.id);
						})
					}), rows.filter((row) => row.id === active || visitedIds.has(row.id)).map((row) => {
						const selected = row.id === active;
						return (0, react_jsx_runtime.jsx)("div", {
							id: `${tabsId}-panel-${row.id}`,
							className: PluginsSettingsSection_module_css_default.panel,
							role: "tabpanel",
							"aria-labelledby": `${tabsId}-tab-${row.id}`,
							hidden: !selected,
							children: renderSlot("settings.plugins.tab", {}, { only: row.id })
						}, row.id);
					})] })
				]
			});
		}
