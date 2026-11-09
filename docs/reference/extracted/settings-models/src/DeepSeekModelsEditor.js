// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/DeepSeekModelsEditor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Accepted capacity spellings: a decimal count with an optional K/M suffix. */
		const CAPACITY_PATTERN = /^(\d+(?:\.\d+)?)([km])?$/i;
		/** Decimal suffix scales — `1M` is 1000K, matching how model capacities are quoted. */
		const CAPACITY_SCALE = {
			k: 1e3,
			m: 1e6
		};
		/**
		* Read a typed capacity, so a user can write `256K` or `1M` instead of counting
		* zeroes. The stored value stays a plain token count.
		* @param text - raw field text.
		* @returns the count; `undefined` when blank (inherit), `NaN` when unreadable
		* (rejected by {@link validateDeepSeekModels} before any write).
		*/
		function parseCapacity(text) {
			const trimmed = text.trim();
			if (trimmed.length === 0) return void 0;
			const match = CAPACITY_PATTERN.exec(trimmed);
			if (match === null) return NaN;
			const suffix = match[2]?.toLowerCase();
			const scale = suffix === "k" || suffix === "m" ? CAPACITY_SCALE[suffix] : 1;
			const scaled = Number(match[1]) * scale;
			const rounded = Math.round(scaled);
			return Math.abs(scaled - rounded) < 1e-6 ? rounded : scaled;
		}
		/**
		* Spell a stored count back in the shortest form that survives a round trip
		* through {@link parseCapacity}; a count that is not a whole number of
		* thousands stays written out.
		* @param value - stored capacity.
		* @returns the field text.
		*/
		function formatCapacity(value) {
			if (!Number.isInteger(value) || value <= 0) return String(value);
			if (value % CAPACITY_SCALE.m === 0) return `${String(value / CAPACITY_SCALE.m)}M`;
			if (value % CAPACITY_SCALE.k === 0) return `${String(value / CAPACITY_SCALE.k)}K`;
			return String(value);
		}
		/** Convert a schema-validated catalog value into records without dropping hidden fields. */
		function modelDrafts(value) {
			if (!Array.isArray(value)) return [];
			return value.map((entry) => typeof entry === "object" && entry !== null && !Array.isArray(entry) ? entry : {});
		}
		/**
		* Validate adapter constraints that the serialized schema cannot express.
		* @param value - user-owned `models` value, or undefined while inherited.
		* @returns the first invalid row, or undefined when the adapter will accept it.
		*/
		function validateDeepSeekModels(value) {
			if (value === void 0) return void 0;
			const models = modelDrafts(value);
			const seen = /* @__PURE__ */ new Set();
			for (const [index, model] of models.entries()) {
				const id = model["id"];
				const trimmed = typeof id === "string" ? id.trim() : void 0;
				if (trimmed === void 0 || trimmed.length === 0) return {
					index,
					key: "modelIdRequired"
				};
				if (seen.has(trimmed)) return {
					index,
					key: "modelIdDuplicate"
				};
				seen.add(trimmed);
				const name = model["name"];
				if (name !== void 0 && (typeof name !== "string" || name.length === 0)) return {
					index,
					key: "modelNameInvalid"
				};
				const contextWindow = model["contextWindow"];
				if (contextWindow !== void 0 && (typeof contextWindow !== "number" || !Number.isInteger(contextWindow) || contextWindow <= 0)) return {
					index,
					key: "modelContextInvalid"
				};
				const maxTokens = model["maxTokens"];
				if (maxTokens !== void 0 && (typeof maxTokens !== "number" || !Number.isInteger(maxTokens) || maxTokens <= 0)) return {
					index,
					key: "modelMaxTokensInvalid"
				};
			}
		}
		/**
		* Render the direct DeepSeek adapter's model catalog: id and display name on
		* each row, capacities and input types behind the row's own disclosure.
		* @param props - effective rows plus the array-level override actions.
		* @returns the catalog editor.
		*/
		function DeepSeekModelsEditor(props) {
			const rowState = useModelRows(props.models, props.onChange, props.disabled);
			const update = (index, key, value) => {
				const next = props.models.map((model, at) => {
					const copy = { ...model };
					if (at !== index) return copy;
					if (value === void 0) Reflect.deleteProperty(copy, key);
					else copy[key] = value;
					return copy;
				});
				props.onChange(next);
			};
			const remove = (index) => {
				rowState.forget(new Set([index]));
				props.onChange(props.models.filter((_model, at) => at !== index).map((model) => ({ ...model })));
			};
			const reset = () => {
				rowState.reset();
				props.onReset();
			};
			/** The field's text: its live keystrokes, else the stored count spelled short. */
			const capacityText = (model, index, field) => {
				const typed = rowState.rows[index]?.editing.get(field);
				if (typed !== void 0) return typed;
				const value = model[field];
				return typeof value === "number" ? formatCapacity(value) : "";
			};
			const settleCapacity = (index, field) => {
				const typed = rowState.rows[index]?.editing.get(field);
				if (typed === void 0) return;
				const parsed = parseCapacity(typed);
				if (parsed !== void 0 && Number.isNaN(parsed)) return;
				rowState.edit(index, field, void 0);
			};
			const capacityInput = (model, index, field, fallback) => ({
				value: capacityText(model, index, field),
				placeholder: fallback === void 0 ? props.t(field === "contextWindow" ? "contextWindowPlaceholder" : "maxTokensPlaceholder") : formatCapacity(fallback),
				onChange: (text) => {
					rowState.edit(index, field, text);
					update(index, field, parseCapacity(text));
				},
				onBlur: () => {
					settleCapacity(index, field);
				}
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ModelsSection_module_css_default["modelCatalog"],
				"aria-label": props.t("models"),
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["modelListHead"],
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["modelCatalogHeading"],
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["modelCatalogTitle"],
								children: props.t("models")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["modelCatalogMeta"],
								children: props.overridden ? props.t("modelsCustomized") : props.t("modelsInherited")
							})]
						}), props.overridden ? (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ModelsSection_module_css_default["linkButton"],
							disabled: props.disabled,
							onClick: reset,
							children: props.t("resetModels")
						}) : null]
					}),
					(0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.AnimatedRows, {
						className: ModelsSection_module_css_default["modelList"],
						rowKeys: rowState.rows.map((row) => String(row.key)),
						ready: true,
						resetKey: "",
						children: [props.models.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
							className: ModelsSection_module_css_default["modelEmpty"],
							children: props.t("modelsEmpty")
						}) : null, rowState.rows.map(({ model, key, expanded, order }, index) => (0, react_jsx_runtime.jsx)(ModelRow, {
							rowKey: key,
							order,
							model,
							position: index + 1,
							inputField: "inputModalities",
							expanded,
							disabled: props.disabled,
							t: props.t,
							contextWindow: capacityInput(model, index, "contextWindow", props.defaultContextWindow),
							maxTokens: capacityInput(model, index, "maxTokens", props.defaultMaxTokens),
							onFieldChange: (field, value) => {
								update(index, field, value);
							},
							onIdBlur: (value) => {
								const trimmed = value.trim();
								if (trimmed !== value) update(index, "id", trimmed);
							},
							onChange: (next) => {
								props.onChange(props.models.map((row, at) => at === index ? next : row));
							},
							onToggle: () => {
								rowState.toggle(index);
							},
							onRemove: () => {
								remove(index);
							}
						}, key))]
					}),
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: ModelsSection_module_css_default["addModelButton"],
						disabled: props.disabled,
						onClick: () => {
							props.onChange([...props.models.map((model) => ({ ...model })), { id: "" }]);
						},
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 14 }), props.t("addModel")]
					})
				]
			});
		}
