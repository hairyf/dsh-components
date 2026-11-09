// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/ModelListEditor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The model list of one pi-ai provider profile, plus the action that asks the
		* provider what it serves.
		*
		* The list is the profile's `models` array as the card holds it: an empty list
		* means "serve this route's built-in catalog", and any entry replaces that
		* catalog, so a row is only ever added deliberately. Fetching asks the endpoint
		* **the form currently shows** — including a key typed but not yet saved — so
		* adding a provider is one pass instead of save-then-return; the reply is
		* candidates the user picks from, never configuration written behind them. The
		* picker opens with the configured models checked, so confirming it adds the
		* newly checked candidates and removes the unchecked configured ones in the
		* draft; configured rows the reply does not list are kept, and a confirmation
		* that would empty the list is refused.
		*
		* A provider that cannot be interrogated (an unreachable endpoint, a protocol
		* with no readable listing) is not a dead end: the failure is shown next to the
		* rows the user can still fill in by hand.
		*/
		/** A row's text field, or the empty string when unset or not a string. */
		function textOf(model, key) {
			const value = model[key];
			return typeof value === "string" ? value : "";
		}
		/** A row's numeric field, or `undefined` when unset or not a number. */
		function numberOf(model, key) {
			const value = model[key];
			return typeof value === "number" ? value : void 0;
		}
		/**
		* What an empty capacity field is worth, shown as its placeholder so a row left
		* blank does not read as a model with no capacity at all.
		*
		* These hints match llm-pi-ai's built-in `defaultContextWindow` and
		* `defaultMaxTokens` in decimal K/M notation. Provider overrides are not
		* available to this component and are not reflected in the hints.
		*/
		const CAPACITY_HINT = {
			contextWindow: "1M",
			maxTokens: "128K"
		};
		/**
		* Spell a stored count for a field that may be unset. The spelling itself is
		* {@link formatCapacity}, shared with the DeepSeek catalog editor so both
		* surfaces read and write one K/M vocabulary.
		* @param value - stored capacity, or `undefined` for an unset field.
		* @returns the field text, empty when unset.
		*/
		function capacitySpelling(value) {
			return value === void 0 ? "" : formatCapacity(value);
		}
		/** Adopt a candidate, preserving disclosed capacities and input types. */
		function adopt(candidate) {
			return {
				id: candidate.id,
				...candidate.name === void 0 ? {} : { name: candidate.name },
				...candidate.contextWindow === void 0 ? {} : { contextWindow: candidate.contextWindow },
				...candidate.maxTokens === void 0 ? {} : { maxTokens: candidate.maxTokens },
				...candidate.inputModalities === void 0 ? {} : { input: [...candidate.inputModalities] }
			};
		}
		/**
		* Render the model list with its fetch action.
		* @param props - the drafted rows, probe target, wire face, and copy.
		* @returns the model-list editor.
		*/
		function ModelListEditor(props) {
			const { models, onChange, probe, operations, t, disabled, onBusyChange } = props;
			const { catalogProvider } = props;
			const [busy, setBusy] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				onBusyChange(busy);
			}, [busy, onBusyChange]);
			const [failure, setFailure] = (0, react.useState)(void 0);
			const [inheritedCatalog, setInheritedCatalog] = (0, react.useState)(void 0);
			(0, react.useEffect)(() => {
				if (catalogProvider === void 0) return;
				let current = true;
				operations.discoverModels(probe.settingsNs, { provider: catalogProvider }).then((answer) => {
					if (!current) return;
					setInheritedCatalog({
						provider: catalogProvider,
						models: answer.kind === "found" ? answer.models : []
					});
					setFailure(answer.kind === "refused" ? answer.message : void 0);
				});
				return () => {
					current = false;
				};
			}, [
				catalogProvider,
				operations,
				probe.settingsNs
			]);
			const catalog = inheritedCatalog?.provider === catalogProvider ? inheritedCatalog?.models : void 0;
			const inputDefaults = (0, react.useMemo)(() => new Map(catalog?.map((model) => [model.id, model.inputModalities])), [catalog]);
			const [candidates, setCandidates] = (0, react.useState)(void 0);
			const [flipped, setFlipped] = (0, react.useState)(/* @__PURE__ */ new Set());
			const [candidateQuery, setCandidateQuery] = (0, react.useState)("");
			const rowState = useModelRows(models, onChange, disabled);
			const editCapacity = (index, field, text) => {
				rowState.edit(index, field, text);
				patch(index, { [field]: parseCapacity(text) });
			};
			const capacityText = (model, index, field) => rowState.rows[index]?.editing.get(field) ?? capacitySpelling(numberOf(model, field));
			const patch = (index, next) => {
				onChange(models.map((model, at) => {
					if (at !== index) return model;
					const cleared = new Set(Object.entries(next).filter(([, value]) => value === void 0 || value === "").map(([key]) => key));
					return Object.fromEntries(Object.entries({
						...model,
						...next
					}).filter(([key]) => !cleared.has(key)));
				}));
			};
			const fetchModels = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					const answer = await operations.discoverModels(probe.settingsNs, {
						...probe.provider === void 0 ? {} : { provider: probe.provider },
						...probe.baseURL === void 0 || probe.baseURL.length === 0 ? {} : { baseURL: probe.baseURL },
						...probe.api === void 0 ? {} : { api: probe.api },
						...probe.apiKey === void 0 ? {} : { apiKey: probe.apiKey }
					});
					if (answer.kind === "refused") {
						setFailure(answer.message);
						return;
					}
					const found = answer.models;
					if (catalogProvider !== void 0) setInheritedCatalog({
						provider: catalogProvider,
						models: found
					});
					if (found.length === 0) {
						setFailure(t("fetchEmpty"));
						return;
					}
					setCandidateQuery("");
					setFlipped(/* @__PURE__ */ new Set());
					setCandidates([...new Map(found.map((model) => [model.id, model])).values()]);
				} finally {
					setBusy(false);
				}
			};
			const closePicker = () => {
				setCandidates(void 0);
				setFlipped(/* @__PURE__ */ new Set());
				setCandidateQuery("");
			};
			const configuredIds = new Set(models.map((model) => textOf(model, "id")).filter((id) => id.length > 0));
			const pickedByDefault = (id) => configuredIds.size === 0 || configuredIds.has(id);
			const isPicked = (id) => pickedByDefault(id) !== flipped.has(id);
			const activeCandidates = candidates ?? [];
			const listed = new Set(activeCandidates.map((candidate) => candidate.id));
			const removedRows = /* @__PURE__ */ new Set();
			models.forEach((model, at) => {
				const id = textOf(model, "id");
				if (listed.has(id) && !isPicked(id)) removedRows.add(at);
			});
			const keptRows = models.filter((_model, at) => !removedRows.has(at));
			const keptIds = new Set(keptRows.map((model) => textOf(model, "id")));
			const addedRows = activeCandidates.filter((candidate) => isPicked(candidate.id) && !keptIds.has(candidate.id)).map(adopt);
			const emptiesList = models.length > 0 && keptRows.length === 0 && addedRows.length === 0;
			const adoptPicked = () => {
				onChange([...keptRows, ...addedRows]);
				rowState.forget(removedRows);
				closePicker();
			};
			const toggle = (id) => {
				setFlipped((current) => {
					const next = new Set(current);
					if (!next.delete(id)) next.add(id);
					return next;
				});
			};
			const normalizedCandidateQuery = candidateQuery.trim().toLowerCase();
			const visibleCandidates = normalizedCandidateQuery.length === 0 ? activeCandidates : activeCandidates.filter((candidate) => candidate.id.toLowerCase().includes(normalizedCandidateQuery) || candidate.name?.toLowerCase().includes(normalizedCandidateQuery) === true);
			const allVisibleCandidatesPicked = visibleCandidates.length > 0 && visibleCandidates.every((candidate) => isPicked(candidate.id));
			const toggleVisibleCandidates = () => {
				const target = !allVisibleCandidatesPicked;
				setFlipped((current) => {
					const next = new Set(current);
					for (const candidate of visibleCandidates) if (pickedByDefault(candidate.id) === target) next.delete(candidate.id);
					else next.add(candidate.id);
					return next;
				});
			};
			const askable = probe.provider !== void 0 || probe.baseURL !== void 0 && probe.baseURL.length > 0;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ModelsSection_module_css_default["modelCatalog"],
				"aria-label": t("models"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelListHead"],
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: ModelsSection_module_css_default["modelCatalogHeading"],
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["modelCatalogTitle"],
									children: t("models")
								}), props.overridden === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
									className: ModelsSection_module_css_default["modelCatalogMeta"],
									children: props.overridden ? t("modelsCustomized") : t("modelsInherited")
								})]
							}),
							props.overridden === true && props.onReset !== void 0 ? (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ModelsSection_module_css_default["linkButton"],
								disabled,
								onClick: () => {
									rowState.reset();
									props.onReset?.();
								},
								children: t("resetModels")
							}) : null,
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ModelsSection_module_css_default["linkButton"],
								disabled: disabled || busy || !askable || props.probeBlocked !== void 0,
								title: props.probeBlocked !== void 0 ? t(props.probeBlocked) : askable ? void 0 : t("fetchNeedsBaseUrl"),
								onClick: () => {
									fetchModels();
								},
								children: busy ? t("fetching") : t("fetchModels")
							})
						]
					}),
					models.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["modelEmpty"],
						children: t("modelsEmpty")
					}) : null,
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.AnimatedRows, {
						className: ModelsSection_module_css_default["modelList"],
						rowKeys: rowState.rows.map((row) => String(row.key)),
						ready: true,
						resetKey: "",
						children: rowState.rows.map(({ model, key, expanded, order }, index) => (0, react_jsx_runtime.jsx)(ModelRow, {
							rowKey: key,
							order,
							model,
							position: index + 1,
							inputField: "input",
							inputFallback: inputDefaults.get(textOf(model, "id")) ?? props.defaultInput,
							inputLoading: catalogProvider !== void 0 && catalog === void 0,
							reasoningLevels: props.reasoningLevels,
							expanded,
							disabled,
							t,
							contextWindow: {
								value: capacityText(model, index, "contextWindow"),
								placeholder: CAPACITY_HINT.contextWindow,
								onChange: (text) => {
									editCapacity(index, "contextWindow", text);
								}
							},
							maxTokens: {
								value: capacityText(model, index, "maxTokens"),
								placeholder: CAPACITY_HINT.maxTokens,
								onChange: (text) => {
									editCapacity(index, "maxTokens", text);
								}
							},
							onFieldChange: (field, value) => {
								patch(index, { [field]: value });
							},
							onChange: (next) => {
								onChange(models.map((row, at) => at === index ? next : row));
							},
							onToggle: () => {
								rowState.toggle(index);
							},
							onRemove: () => {
								onChange(models.filter((_model, at) => at !== index));
								rowState.forget(new Set([index]));
							}
						}, key))
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addModelButton"],
						disabled,
						onClick: () => {
							onChange([...models, { id: "" }]);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("addModel")]
					}),
					failure !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: failure
					}) : null,
					(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
						open: candidates !== void 0,
						onClose: closePicker,
						title: t("fetchTitle"),
						closeLabel: t("close"),
						description: t("fetchDescription"),
						className: ModelsSection_module_css_default["fetchDialog"],
						footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							onClick: closePicker,
							children: t("cancel")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "outline",
							disabled: emptiesList,
							title: emptiesList ? t("fetchKeepOne") : void 0,
							onClick: adoptPicked,
							children: t("fetchAdopt")
						})] }),
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["candidateToolbar"],
							children: [(0, react_jsx_runtime.jsx)("input", {
								className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["candidateSearch"]}`,
								type: "search",
								value: candidateQuery,
								placeholder: t("fetchSearch"),
								"aria-label": t("fetchSearch"),
								onChange: (event) => {
									setCandidateQuery(event.target.value);
								}
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: visibleCandidates.length === 0,
								onClick: toggleVisibleCandidates,
								children: t(allVisibleCandidatesPicked ? "fetchDeselectAll" : "fetchSelectAll")
							})]
						}), visibleCandidates.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: ModelsSection_module_css_default["candidateEmpty"],
							role: "status",
							children: t("fetchNoMatches")
						}) : (0, react_jsx_runtime.jsx)("ul", {
							className: ModelsSection_module_css_default["candidateList"],
							children: visibleCandidates.map((candidate) => (0, react_jsx_runtime.jsx)("li", {
								className: ModelsSection_module_css_default["candidate"],
								children: (0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["candidateLabel"],
									children: [(0, react_jsx_runtime.jsx)("input", {
										type: "checkbox",
										checked: isPicked(candidate.id),
										onChange: () => {
											toggle(candidate.id);
										}
									}), (0, react_jsx_runtime.jsx)("span", {
										className: ModelsSection_module_css_default["candidateId"],
										title: candidate.name ?? candidate.id,
										children: candidate.id
									})]
								})
							}, candidate.id))
						})]
					})
				]
			});
		}
