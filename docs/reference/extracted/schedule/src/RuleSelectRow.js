// Extracted from @deepseek-ai/dsh-client-ui-schedule (lib/client.js); region lib/types/client/RuleSelectRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The existing task rule menu treatment shared by target and timing fields. */
		/** A labelled menu row using the current task detail's trigger, portal, and keyboard behavior. */
		function RuleSelectRow({ label, value, current, items, disabled, onChange, onDismiss, header, listClassName }) {
			const [open, setOpen] = (0, react.useState)(false);
			const close = () => {
				setOpen(false);
				onDismiss?.();
			};
			return (0, react_jsx_runtime.jsx)(TaskMenu, {
				className: TaskManagerPage_module_css_default.ruleRowMenu,
				open: open && !disabled,
				onClose: close,
				items,
				selectedId: value,
				align: "end",
				portal: true,
				header,
				listClassName,
				onSelect: (id) => {
					close();
					onChange(id);
				},
				anchor: (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: TaskManagerPage_module_css_default.ruleValue,
					disabled,
					"aria-haspopup": "menu",
					"aria-expanded": open && !disabled,
					onClick: () => {
						if (open) close();
						else setOpen(true);
					},
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: TaskManagerPage_module_css_default.ruleLabel,
							children: label
						}),
						" ",
						(0, react_jsx_runtime.jsxs)("span", {
							className: clsx(TaskManagerPage_module_css_default.ruleValueFace, TaskManagerPage_module_css_default.ruleControl),
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: TaskManagerPage_module_css_default.ruleCurrent,
								children: current
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {})]
						})
					]
				})
			});
		}
		/** The current task detail's searchable, localized zone menu with recent choices. */
		function RuleZoneRow({ value, disabled, onChange, t }) {
			const systemZone = Intl.DateTimeFormat().resolvedOptions().timeZone;
			const [query, setQuery] = (0, react.useState)("");
			const [recent, setRecent] = (0, react.useState)(() => loadRecentTimeZones(systemZone));
			const id = (0, react.useId)();
			const catalog = (0, react.useMemo)(() => {
				const byLabel = /* @__PURE__ */ new Map();
				const at = Date.now();
				for (const zone of zoneChoices(value, systemZone, at)) {
					const label = zoneName(zone, systemZone, t, at);
					const existing = byLabel.get(label);
					if (existing === void 0) byLabel.set(label, {
						id: zone,
						label,
						zones: [zone]
					});
					else {
						existing.zones.push(zone);
						if (zone === value) existing.id = zone;
					}
				}
				return [...byLabel.values()];
			}, [
				value,
				systemZone,
				t
			]);
			const normalized = query.trim().toLocaleLowerCase(t("time.locale"));
			const matches = catalog.filter((item) => `${item.zones.join(" ")} ${item.label}`.toLocaleLowerCase(t("time.locale")).includes(normalized)).map((item) => ({
				...item,
				id: item.zones.find((zone) => zone.toLocaleLowerCase(t("time.locale")) === normalized) ?? item.id
			}));
			const recentItems = normalized === "" ? recent.flatMap((zone) => {
				const item = catalog.find((item) => item.zones.includes(zone));
				return item === void 0 ? [] : [{
					...item,
					id: zone
				}];
			}).filter((item, index, items) => items.findIndex((candidate) => candidate.label === item.label) === index) : [];
			const available = matches.filter((item) => !recentItems.some((recent) => recent.label === item.label));
			const items = recentItems.length === 0 ? available : available.length === 0 ? recentItems : [
				...recentItems,
				{
					type: "separator",
					id: `${id}-recent`
				},
				...available
			];
			return (0, react_jsx_runtime.jsx)(RuleSelectRow, {
				label: t("timing.zone"),
				value,
				current: zoneName(value, systemZone, t),
				disabled,
				onDismiss: () => {
					setQuery("");
				},
				items: items.length === 0 ? [{
					id: `${id}-empty`,
					label: t("timing.zoneNoResults"),
					disabled: true
				}] : items,
				listClassName: TaskManagerPage_module_css_default.zoneMenu,
				header: (0, react_jsx_runtime.jsx)("input", {
					className: TaskManagerPage_module_css_default.zoneSearch,
					type: "search",
					value: query,
					"data-menu-field": "",
					placeholder: t("timing.zoneSearch"),
					"aria-label": t("timing.zoneSearch"),
					onChange: (event) => {
						setQuery(event.target.value);
					}
				}),
				onChange: (zone) => {
					setQuery("");
					setRecent((recent) => rememberTimeZone(recent, zone));
					onChange(zone);
				}
			});
		}
