// Extracted from @deepseek-ai/dsh-client-ui-settings-plugin-inventory (lib/client.js); region lib/types/client/PluginInventorySettingsTab.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const PHASE_KEYS = {
			pending: "pending",
			loading: "loadingPhase",
			active: "active",
			failed: "failed",
			unloading: "unloading"
		};
		/** Placeholder cards the loading skeleton lays out in the cards grid. */
		const SKELETON_CARDS = [
			0,
			1,
			2,
			3
		];
		/** Localized accessible label for one root Fiber phase. */
		function phaseLabel(phase, t) {
			return phase === null ? t("unobserved") : t(PHASE_KEYS[phase]);
		}
		/** Compact technical names for Settings without changing their module identity. */
		function moduleShortName(moduleName) {
			return (moduleName.startsWith("@") ? moduleName.slice(moduleName.indexOf("/") + 1) : moduleName).replace(/^cordis:/, "").replace(/^cordis-plugin-/, "").replace(/^dsh-(?:host-|client-)?/, "");
		}
		/** Display an entry identity without the composition-only `include:` marker. */
		function entrySubtitle(entryId) {
			return entryId.replace(/^include:/, "");
		}
		/** Whether a card shows its entry id: the id exists and, without its `include:` marker, differs from the title. */
		function idAddsToTitle(entryId, title) {
			return entryId !== null && entrySubtitle(entryId) !== title;
		}
		/** Accessible card name: the title, the complete entry id when the card shows one, then the enablement state. */
		function cardLabel(title, entryId, state) {
			return idAddsToTitle(entryId, title) ? `${title}, ${entryId}, ${state}` : `${title}, ${state}`;
		}
		/** Preserve translated titles and shorten literal package or module name fallbacks in Settings. */
		function pluginText(row, resolveText) {
			const title = row.meta?.title;
			return {
				title: typeof title === "object" ? resolveText(title) : moduleShortName(title ?? row.moduleName),
				description: row.meta?.description === void 0 ? void 0 : resolveText(row.meta.description) || void 0
			};
		}
		/** Match translated text alongside the row's technical module and entry identities. */
		function matches(row, normalizedQuery, resolveText) {
			if (normalizedQuery.length === 0) return true;
			const { title, description } = pluginText(row, resolveText);
			return [
				row.moduleName,
				row.entryId,
				title,
				description
			].some((value) => value?.toLocaleLowerCase().includes(normalizedQuery));
		}
		/** The roster row shown when the preset switcher has no explicit choice. */
		function fallbackPreset(presets) {
			return presets.find((preset) => preset.isDefault) ?? presets[0];
		}
		/** The switcher's display label for one preset. */
		function presetLabel(preset, t, presetName) {
			const name = presetName(preset);
			if (preset.broken !== void 0) return t("presetOptionBroken", { name });
			if (preset.isDefault) return t("presetOptionDefault", { name });
			return name;
		}
		/** One expandable plugin card; the caller owns the trailing status content. */
		function PluginCard({ rowKey, moduleName, title, description, metadataError, entryId, trailing, ariaLabel, failed, expanded, onToggle, children }) {
			const open = expanded === rowKey;
			const detailId = `plugin-details-${encodeURIComponent(rowKey)}`;
			const descriptionId = (0, react.useId)();
			return (0, react_jsx_runtime.jsxs)("li", {
				className: PluginInventorySettingsTab_module_css_default.card,
				"data-plugin-entry": entryId ?? void 0,
				"data-plugin-module": moduleName,
				"data-failed": failed ? "true" : void 0,
				"data-open": open ? "true" : void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						className: PluginInventorySettingsTab_module_css_default.cardContent,
						type: "button",
						"aria-expanded": open,
						"aria-controls": detailId,
						"aria-label": ariaLabel,
						"aria-describedby": description === void 0 ? void 0 : descriptionId,
						onClick: () => {
							onToggle(rowKey);
						},
						children: [
							(0, react_jsx_runtime.jsxs)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardMainRow,
								children: [(0, react_jsx_runtime.jsx)("strong", {
									className: PluginInventorySettingsTab_module_css_default.cardTitle,
									title: moduleName,
									children: title
								}), (0, react_jsx_runtime.jsxs)("span", {
									className: PluginInventorySettingsTab_module_css_default.cardTrailing,
									children: [trailing, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginInventorySettingsTab_module_css_default.chevron,
										size: 12,
										"aria-hidden": "true"
									})]
								})]
							}),
							description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardDescription,
								id: descriptionId,
								children: description
							}),
							idAddsToTitle(entryId, title) ? (0, react_jsx_runtime.jsx)("span", {
								className: PluginInventorySettingsTab_module_css_default.cardMeta,
								children: (0, react_jsx_runtime.jsx)("code", {
									className: PluginInventorySettingsTab_module_css_default.cardIdentity,
									title: entryId,
									children: entrySubtitle(entryId)
								})
							}) : null
						]
					}),
					metadataError === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginInventorySettingsTab_module_css_default.brokenNote,
						role: "status",
						"data-package-meta-error": true,
						children: metadataError
					}),
					open ? (0, react_jsx_runtime.jsx)("div", {
						className: PluginInventorySettingsTab_module_css_default.cardDetails,
						id: detailId,
						children
					}) : null
				]
			});
		}
		/** Detail rows shared by every card: the Loader identity, then labeled facts. */
		function CardFacts({ moduleName, moduleLabel, entryId, facts }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [entryId === null ? null : (0, react_jsx_runtime.jsx)("code", {
				className: PluginInventorySettingsTab_module_css_default.entryValue,
				"data-loader-entry": true,
				children: entryId
			}), (0, react_jsx_runtime.jsxs)("dl", {
				className: PluginInventorySettingsTab_module_css_default.details,
				children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: moduleLabel }), (0, react_jsx_runtime.jsx)("dd", { children: moduleName })] }), facts.map(([label, value]) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: label }), (0, react_jsx_runtime.jsx)("dd", { children: value })] }, label))]
			})] });
		}
		const PHASE_DOT_STATES = {
			pending: "idle",
			loading: "ongoing",
			unloading: "ongoing"
		};
		/** Whether a live root-fiber phase carries a dot of its own. */
		function showsPhaseDot(phase) {
			return phase === "pending" || phase === "loading" || phase === "unloading";
		}
		/** Status dot naming a live root-fiber phase; rows without a dotted phase show none. */
		function PhaseDot({ phase, t }) {
			const status = phaseLabel(phase, t);
			return (0, react_jsx_runtime.jsx)("span", {
				className: PluginInventorySettingsTab_module_css_default.phaseDot,
				role: "img",
				"aria-label": status,
				title: status,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: PHASE_DOT_STATES[phase] })
			});
		}
		const TAG_TONES = {
			disabled: "neutral",
			conditional: "warning",
			preset: "info",
			failed: "danger"
		};
		/** Enablement tag for the states that depart from the default; a plainly enabled row carries none. */
		function StateTag({ kind, label }) {
			return kind === "enabled" ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
				tone: TAG_TONES[kind],
				children: label
			});
		}
		/** Render the read-only plugin inventory: agent presets first, then the global plane. */
		function PluginInventorySettingsTab({ list, presetName, resolveText, t, useClientSync, retryClient }) {
			const clientSync = useClientSync((snapshot) => snapshot);
			const sectionId = (0, react.useId)();
			const [request, setRequest] = (0, react.useState)(0);
			const [query, setQuery] = (0, react.useState)("");
			const [expanded, setExpanded] = (0, react.useState)(null);
			const [chosenPreset, setChosenPreset] = (0, react.useState)(null);
			const [switcherOpen, setSwitcherOpen] = (0, react.useState)(false);
			const [presetOpen, setPresetOpen] = (0, react.useState)(null);
			const [globalOpen, setGlobalOpen] = (0, react.useState)(null);
			const [state, setState] = (0, react.useState)({ status: "loading" });
			(0, react.useEffect)(() => {
				let current = true;
				Promise.resolve().then(() => list()).then((snapshot) => {
					if (current) setState({
						status: "ready",
						snapshot
					});
				}, () => {
					if (current) setState({ status: "error" });
				});
				return () => {
					current = false;
				};
			}, [list, request]);
			const normalizedQuery = query.trim().toLocaleLowerCase();
			const searching = normalizedQuery.length > 0;
			const snapshot = state.status === "ready" ? state.snapshot : void 0;
			const presets = snapshot?.agentPresets ?? [];
			const selected = presets.find((preset) => preset.id === chosenPreset) ?? fallbackPreset(presets);
			/** Presets that actually enable a module, keyed by module name. */
			const enabledIn = (0, react.useMemo)(() => {
				const found = /* @__PURE__ */ new Map();
				for (const preset of presets) for (const row of preset.rows) {
					if (row.enabled !== true) continue;
					const groups = found.get(row.moduleName);
					if (groups === void 0) found.set(row.moduleName, [preset]);
					else if (!groups.includes(preset)) groups.push(preset);
				}
				return found;
			}, [presets]);
			const entries = snapshot?.entries ?? [];
			const failedEntries = [];
			const regularEntries = [];
			for (const entry of entries) if (entry.fiberPhase === "failed") failedEntries.push(entry);
			else regularEntries.push(entry);
			const entryMatch = (entry) => matches(entry, normalizedQuery, resolveText);
			const rowMatch = (row) => matches(row, normalizedQuery, resolveText);
			const filteredFailed = failedEntries.filter(entryMatch);
			const filteredRegular = regularEntries.filter(entryMatch);
			const globalCount = filteredFailed.length + filteredRegular.length;
			const selectedRows = selected === void 0 ? [] : selected.rows.filter(rowMatch);
			const otherPresetMatches = searching ? presets.filter((preset) => preset !== selected && preset.rows.some(rowMatch)) : [];
			const otherMatchCount = otherPresetMatches.reduce((total, preset) => total + preset.rows.filter(rowMatch).length, 0);
			const presetEffectiveOpen = searching || (presetOpen ?? true);
			const globalEffectiveOpen = searching || (globalOpen ?? false);
			const nothingMatches = searching && globalCount === 0 && selectedRows.length === 0 && otherPresetMatches.length === 0;
			const retry = () => {
				setState({ status: "loading" });
				setRequest((value) => value + 1);
			};
			const toggleRow = (key) => {
				setExpanded((current) => current === key ? null : key);
			};
			/** Trailing status and detail facts for one row of the selected preset. */
			const presetRowCard = (preset, row, index) => {
				const key = `preset:${preset.id}:${String(index)}`;
				const { title, description } = pluginText(row, resolveText);
				const failed = row.fiberPhase === "failed";
				const stateText = failed ? t("failedTag") : row.enabled === true ? t("enabledTag") : row.enabled === false ? t("disabledTag") : t("conditionalTag");
				const kind = failed ? "failed" : row.enabled === true ? "enabled" : row.enabled === false ? "disabled" : "conditional";
				return (0, react_jsx_runtime.jsx)(PluginCard, {
					rowKey: key,
					moduleName: row.moduleName,
					title,
					description,
					metadataError: row.meta?.error === void 0 ? void 0 : t("metadataError", { error: row.meta.error }),
					entryId: row.entryId,
					failed,
					expanded,
					onToggle: toggleRow,
					ariaLabel: cardLabel(title, row.entryId, stateText),
					trailing: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [row.enabled === true && showsPhaseDot(row.fiberPhase) ? (0, react_jsx_runtime.jsx)(PhaseDot, {
						phase: row.fiberPhase,
						t
					}) : null, (0, react_jsx_runtime.jsx)(StateTag, {
						kind,
						label: stateText
					})] }),
					children: (0, react_jsx_runtime.jsx)(CardFacts, {
						moduleName: row.moduleName,
						moduleLabel: t("moduleLabel"),
						entryId: row.entryId,
						facts: [
							[t("fromPreset"), presetName(preset)],
							[t("configuration"), stateText],
							...row.fiberPhase === null ? [] : [[t("runtime"), phaseLabel(row.fiberPhase, t)]],
							...row.condition === void 0 ? [] : [[t("condition"), (0, react_jsx_runtime.jsx)("code", { children: row.condition }, "condition")]]
						]
					})
				}, key);
			};
			/** One global-plane row; a preset-provided row carries the presets that enable it. */
			const globalRowCard = (entry, providers) => {
				const key = `global:${entry.entryId}`;
				const { title, description } = pluginText(entry, resolveText);
				const failed = entry.fiberPhase === "failed";
				const stateText = failed ? t("failedTag") : providers !== void 0 ? t("presetEnabledTag") : t(entry.enabled ? "enabledTag" : "disabledTag");
				const kind = failed ? "failed" : providers !== void 0 ? "preset" : entry.enabled ? "enabled" : "disabled";
				return (0, react_jsx_runtime.jsx)(PluginCard, {
					rowKey: key,
					moduleName: entry.moduleName,
					title,
					description,
					metadataError: entry.meta?.error === void 0 ? void 0 : t("metadataError", { error: entry.meta.error }),
					entryId: entry.entryId,
					failed,
					expanded,
					onToggle: toggleRow,
					ariaLabel: cardLabel(title, entry.entryId, stateText),
					trailing: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [entry.enabled && showsPhaseDot(entry.fiberPhase) ? (0, react_jsx_runtime.jsx)(PhaseDot, {
						phase: entry.fiberPhase,
						t
					}) : null, (0, react_jsx_runtime.jsx)(StateTag, {
						kind,
						label: stateText
					})] }),
					children: (0, react_jsx_runtime.jsx)(CardFacts, {
						moduleName: entry.moduleName,
						moduleLabel: t("moduleLabel"),
						entryId: entry.entryId,
						facts: providers !== void 0 ? [[t("configuration"), t("presetProvidedDetail")], [t("enabledIn"), providers.map((preset) => presetName(preset)).join(" · ")]] : [[t("configuration"), t(entry.enabled ? "enabledTag" : "disabledTag")], ...entry.enabled ? [[t("runtime"), phaseLabel(entry.fiberPhase, t)]] : []]
					})
				}, key);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginInventorySettingsTab_module_css_default.section,
				"aria-busy": state.status === "loading",
				children: [
					clientSync.syncing ? (0, react_jsx_runtime.jsxs)("p", {
						className: `${PluginInventorySettingsTab_module_css_default.status} ${PluginInventorySettingsTab_module_css_default.statusWithDot}`,
						role: "status",
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), t("clientSyncing")]
					}) : null,
					clientSync.failures.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.failure,
						"data-client-sync-failure": true,
						children: [
							(0, react_jsx_runtime.jsxs)("p", {
								className: PluginInventorySettingsTab_module_css_default.statusWithDot,
								role: "alert",
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("clientSyncFailed")]
							}),
							(0, react_jsx_runtime.jsx)("ul", { children: clientSync.failures.map((failure) => (0, react_jsx_runtime.jsxs)("li", { children: [
								failure.id,
								": ",
								failure.message
							] }, failure.id)) }),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: clientSync.syncing,
								onClick: retryClient,
								children: t("clientSyncRetry")
							})
						]
					}),
					state.status === "loading" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.cards,
						role: "status",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PluginInventorySettingsTab_module_css_default.visuallyHidden,
							children: t("loading")
						}), SKELETON_CARDS.map((slot) => (0, react_jsx_runtime.jsxs)("div", {
							className: PluginInventorySettingsTab_module_css_default.skeletonCard,
							"aria-hidden": "true",
							children: [(0, react_jsx_runtime.jsx)("span", { className: PluginInventorySettingsTab_module_css_default.skeletonBar }), (0, react_jsx_runtime.jsx)("span", { className: PluginInventorySettingsTab_module_css_default.skeletonBar })]
						}, slot))]
					}) : null,
					state.status === "error" ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.failure,
						children: [(0, react_jsx_runtime.jsxs)("p", {
							className: PluginInventorySettingsTab_module_css_default.statusWithDot,
							role: "alert",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("error")]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							onClick: retry,
							children: t("retry")
						})]
					}) : null,
					snapshot !== void 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: PluginInventorySettingsTab_module_css_default.catalog,
						children: [
							(0, react_jsx_runtime.jsxs)("label", {
								className: PluginInventorySettingsTab_module_css_default.search,
								children: [
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { "aria-hidden": "true" }),
									(0, react_jsx_runtime.jsx)("span", {
										className: PluginInventorySettingsTab_module_css_default.visuallyHidden,
										children: t("search")
									}),
									(0, react_jsx_runtime.jsx)("input", {
										type: "search",
										value: query,
										placeholder: t("search"),
										"aria-label": t("search"),
										onChange: (event) => {
											setQuery(event.currentTarget.value);
										}
									})
								]
							}),
							entries.length === 0 && presets.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginInventorySettingsTab_module_css_default.status,
								children: t("empty")
							}) : null,
							nothingMatches ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginInventorySettingsTab_module_css_default.status,
								children: t("emptySearch")
							}) : null,
							selected !== void 0 ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginInventorySettingsTab_module_css_default.group,
								"data-plugin-scope": "preset",
								"data-preset-id": selected.id,
								children: [
									(0, react_jsx_runtime.jsxs)("div", {
										className: PluginInventorySettingsTab_module_css_default.groupTitleRow,
										children: [(0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: PluginInventorySettingsTab_module_css_default.groupToggle,
											"aria-expanded": presetEffectiveOpen,
											"aria-controls": `${sectionId}-preset`,
											onClick: () => {
												setPresetOpen(!presetEffectiveOpen);
											},
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
												className: PluginInventorySettingsTab_module_css_default.chevron,
												size: 12,
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginInventorySettingsTab_module_css_default.groupTitle,
												children: t("presetTitle")
											})]
										}), (0, react_jsx_runtime.jsx)("div", {
											className: PluginInventorySettingsTab_module_css_default.headerEnd,
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
												open: switcherOpen,
												onClose: () => {
													setSwitcherOpen(false);
												},
												items: presets.map((preset) => ({
													id: preset.id,
													label: presetLabel(preset, t, presetName)
												})),
												selectedId: selected.id,
												onSelect: (id) => {
													setSwitcherOpen(false);
													setChosenPreset(id);
												},
												align: "end",
												portal: true,
												anchor: (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: PluginInventorySettingsTab_module_css_default.switcher,
													"aria-haspopup": "menu",
													"aria-expanded": switcherOpen,
													"aria-label": t("switcherLabel"),
													onClick: () => {
														setSwitcherOpen((value) => !value);
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: PluginInventorySettingsTab_module_css_default.switcherLabel,
														children: presetLabel(selected, t, presetName)
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
														className: PluginInventorySettingsTab_module_css_default.chevron,
														"aria-hidden": "true"
													})]
												})
											})
										})]
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginInventorySettingsTab_module_css_default.groupSub,
										children: t("presetSubtitle")
									}),
									presetEffectiveOpen ? (0, react_jsx_runtime.jsxs)("div", {
										id: `${sectionId}-preset`,
										className: PluginInventorySettingsTab_module_css_default.groupBody,
										children: [
											selected.broken !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
												className: PluginInventorySettingsTab_module_css_default.brokenNote,
												role: "alert",
												children: selected.broken
											}) : null,
											selectedRows.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
												className: PluginInventorySettingsTab_module_css_default.cards,
												children: selectedRows.map((row, index) => presetRowCard(selected, row, index))
											}) : null,
											otherMatchCount > 0 ? (0, react_jsx_runtime.jsxs)("p", {
												className: PluginInventorySettingsTab_module_css_default.hint,
												children: [t("matchesInOtherPresets", { count: String(otherMatchCount) }), otherPresetMatches.map((preset) => (0, react_jsx_runtime.jsx)("button", {
													type: "button",
													className: PluginInventorySettingsTab_module_css_default.jumpLink,
													onClick: () => {
														setChosenPreset(preset.id);
													},
													children: presetName(preset)
												}, preset.id))]
											}) : null
										]
									}) : null
								]
							}) : null,
							entries.length > 0 ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginInventorySettingsTab_module_css_default.group,
								"data-plugin-scope": "global",
								children: [
									(0, react_jsx_runtime.jsx)("div", {
										className: PluginInventorySettingsTab_module_css_default.groupTitleRow,
										children: (0, react_jsx_runtime.jsxs)("button", {
											type: "button",
											className: PluginInventorySettingsTab_module_css_default.groupToggle,
											"aria-expanded": globalEffectiveOpen,
											"aria-controls": `${sectionId}-global`,
											onClick: () => {
												setGlobalOpen(!globalEffectiveOpen);
											},
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
												className: PluginInventorySettingsTab_module_css_default.chevron,
												size: 12,
												"aria-hidden": "true"
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginInventorySettingsTab_module_css_default.groupTitle,
												children: t("globalTitle")
											})]
										})
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginInventorySettingsTab_module_css_default.groupSub,
										children: t("globalSubtitle")
									}),
									globalEffectiveOpen && globalCount > 0 ? (0, react_jsx_runtime.jsxs)("ul", {
										className: PluginInventorySettingsTab_module_css_default.cards,
										id: `${sectionId}-global`,
										children: [filteredFailed.map((entry) => globalRowCard(entry)), filteredRegular.map((entry) => globalRowCard(entry, entry.enabled ? void 0 : enabledIn.get(entry.moduleName)))]
									}) : null
								]
							}) : null
						]
					}) : null
				]
			});
		}
