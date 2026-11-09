// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/ModelReasoningEfforts.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Reasoning-level declarations for a model on a hand-declared pi-ai route. */
		/** Levels a model offers when the switch is turned on, where the schema lists them: Off plus the common OpenAI-compatible trio. */
		const INITIAL_LEVELS = [
			"off",
			"low",
			"medium",
			"high"
		];
		/** The wire value a level sends unless its row says otherwise; `null` is the Off entry that sends nothing. */
		function defaultValue(level) {
			return level === "off" ? null : level;
		}
		/**
		* Whether pi-ai accepts a stored value: a non-empty string, or nothing for Off.
		* @param level - the declared level.
		* @param wire - the value stored for it.
		* @returns whether the adapter would resolve the entry.
		*/
		function acceptedValue(level, wire) {
			return typeof wire === "string" ? wire.length > 0 : wire === null && level === "off";
		}
		/**
		* Read the declared levels from a row in their stored order, including a key
		* the offered levels do not name, so an edit never drops it.
		* @param model - model row as drafted.
		* @returns the entries; empty for a valueless field, which pi-ai refuses, and
		* `undefined` when the field is absent or `false`.
		*/
		function readEfforts(model) {
			const value = model["reasoningEfforts"];
			if (value === null) return [];
			if (typeof value !== "object" || Array.isArray(value)) return void 0;
			return Object.entries(value);
		}
		/**
		* Replace a row's declared levels, preserving every other field.
		* @param model - model row as drafted.
		* @param entries - the levels to write in row order, or `undefined` to remove the field.
		* @returns the replacement row.
		*/
		function withEfforts(model, entries) {
			const next = { ...model };
			if (entries === void 0) {
				Reflect.deleteProperty(next, "reasoningEfforts");
				return next;
			}
			next["reasoningEfforts"] = Object.fromEntries(entries);
			return next;
		}
		/**
		* Mirror the pi-ai refusals of a hand-declared `reasoningEfforts`, so a card
		* names the row instead of failing at the write.
		* @param value - drafted `models` value, or `undefined` while inherited.
		* @returns the first refused row, or `undefined` when the adapter will accept every row.
		*/
		function validateReasoningEfforts(value) {
			for (const [index, model] of modelDrafts(value).entries()) {
				const entries = readEfforts(model);
				if (entries === void 0) continue;
				if (entries.some(([level, wire]) => !acceptedValue(level, wire))) return {
					index,
					key: "modelReasoningValueRequired"
				};
				if (!entries.some(([level]) => level !== "off")) return {
					index,
					key: "modelReasoningNeedsLevel"
				};
			}
		}
		/**
		* Edit the `reasoningEfforts` a hand-declared pi-ai model offers: a switch,
		* then one row per level pairing the level with the value sent for it. Every
		* row is read from the model, so a reused instance shows its new model.
		* @param props - model declaration and row replacement action.
		* @returns the reasoning-level group.
		*/
		function ModelReasoningEfforts({ model, levels, position, disabled, t, onChange }) {
			const entries = readEfforts(model);
			const [typing, setTyping] = (0, react.useState)(void 0);
			const label = `${t("modelReasoning")} ${String(position)}`;
			const used = entries?.map(([level]) => level) ?? [];
			const write = (next) => {
				onChange(withEfforts(model, next));
			};
			const replaceAt = (current, index, entry) => current.map((existing, at) => at === index ? entry : existing);
			const changeLevel = (current, index, from, wire, to) => {
				write(replaceAt(current, index, [to, typeof wire === "string" && wire.length > 0 && wire !== from && from !== "off" && to !== "off" ? wire : defaultValue(to)]));
			};
			const addLevel = (current) => {
				const highest = Math.max(-1, ...used.map((level) => levels.indexOf(level)));
				const level = levels.find((candidate, index) => index > highest && !used.includes(candidate)) ?? levels.find((candidate) => !used.includes(candidate));
				/* v8 ignore next -- the add button is disabled once every level has a row */
				if (level === void 0) return;
				write([...current, [level, defaultValue(level)]]);
			};
			const editValue = (current, index, level, text) => {
				setTyping({
					level,
					text
				});
				const trimmed = text.trim();
				write(replaceAt(current, index, [level, trimmed.length === 0 ? defaultValue(level) : trimmed]));
			};
			const leaveValue = (current, index, level, wire) => {
				setTyping(void 0);
				if (!acceptedValue(level, wire)) write(replaceAt(current, index, [level, defaultValue(level)]));
			};
			const choicesFor = (level) => [...levels.includes(level) ? [] : [level], ...levels.filter((choice) => choice === level || !used.includes(choice))];
			const initialEntries = INITIAL_LEVELS.filter((level) => levels.includes(level)).map((level) => [level, defaultValue(level)]);
			const refused = entries?.some(([level, wire]) => !acceptedValue(level, wire)) === true;
			const missingLevel = entries !== void 0 && !used.some((level) => level !== "off");
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["modelReasoning"],
				role: "group",
				"aria-label": label,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelReasoningHead"],
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: `${ModelsSection_module_css_default["modelFieldLabel"]} ${ModelsSection_module_css_default["modelReasoningLabel"]}`,
						children: [t("modelReasoning"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("modelReasoningHelpText"),
							side: "right",
							delayMs: 0,
							focusDelayMs: 0,
							portal: true,
							openOnClick: true,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ModelsSection_module_css_default["helpButton"],
								"aria-label": t("modelReasoningHelp"),
								children: "?"
							})
						})]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
						checked: entries !== void 0,
						label,
						disabled,
						onChange: (on) => {
							write(on ? initialEntries : void 0);
						}
					})]
				}), entries === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
					entries.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelReasoningRow"],
						"aria-hidden": "true",
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelFieldLabel"],
							children: t("modelReasoningLevel")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["modelFieldLabel"],
							children: t("modelReasoningValue")
						})]
					}) : null,
					entries.map(([level, wire], index) => (0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelReasoningRow"],
						children: [
							(0, react_jsx_runtime.jsx)("select", {
								className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
								value: level,
								"aria-label": `${t("modelReasoningLevel")} ${String(index + 1)}`,
								disabled,
								onChange: (event) => {
									changeLevel(entries, index, level, wire, event.target.value);
								},
								children: choicesFor(level).map((choice) => (0, react_jsx_runtime.jsx)("option", {
									value: choice,
									children: choice
								}, choice))
							}),
							(0, react_jsx_runtime.jsx)("input", {
								className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["modelReasoningValueInput"]}`,
								type: "text",
								value: typing?.level === level ? typing.text : typeof wire === "string" ? wire : "",
								placeholder: level === "off" ? t("modelReasoningOffValuePlaceholder") : level,
								"aria-label": `${level} ${t("modelReasoningValue")}`,
								"aria-invalid": !acceptedValue(level, wire),
								disabled: disabled || level === "off",
								onChange: (event) => {
									editValue(entries, index, level, event.target.value);
								},
								onBlur: () => {
									leaveValue(entries, index, level, wire);
								}
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
								"aria-label": `${t("modelReasoningRemove")} ${level}`,
								title: t("modelReasoningRemove"),
								disabled,
								onClick: () => {
									write(entries.filter((_entry, at) => at !== index));
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
							})
						]
					}, index)),
					refused ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t("modelReasoningValueRequired")
					}) : missingLevel ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t("modelReasoningNeedsLevel")
					}) : null,
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addModelButton"],
						disabled: disabled || levels.every((level) => used.includes(level)),
						onClick: () => {
							addLevel(entries);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), t("modelReasoningAdd")]
					})
				] })]
			});
		}
