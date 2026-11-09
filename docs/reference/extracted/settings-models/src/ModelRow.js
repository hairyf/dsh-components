// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/ModelRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		function rowHalf(event) {
			const rect = event.currentTarget.getBoundingClientRect();
			return event.clientY < rect.top + rect.height / 2 ? "before" : "after";
		}
		/**
		* Render model fields with the display name in the expanded area of narrow rows.
		* @param props - drafted fields and their owning editor's actions.
		* @returns one expandable model entry.
		*/
		function ModelRow(props) {
			const { model, position, t, disabled } = props;
			const preview = (0, _deepseek_ai_dsh_client_ui_primitives.useRowDragPreview)(ModelsSection_module_css_default["modelDragPreview"]);
			const modelField = (field) => (0, react_jsx_runtime.jsxs)("label", {
				className: `${ModelsSection_module_css_default["modelField"]} ${field === "name" ? ModelsSection_module_css_default["modelName"] : ""}`,
				children: [field === "name" ? (0, react_jsx_runtime.jsx)("span", {
					className: `${ModelsSection_module_css_default["modelFieldLabel"]} ${ModelsSection_module_css_default["modelNameLabel"]}`,
					children: t("modelName")
				}) : null, (0, react_jsx_runtime.jsx)("input", {
					className: ModelsSection_module_css_default["input"],
					type: "text",
					value: typeof model[field] === "string" ? model[field] : "",
					placeholder: t(field === "id" ? "modelId" : "modelName"),
					"aria-label": `${t(field === "id" ? "modelId" : "modelName")} ${String(position)}`,
					disabled,
					onFocus: field === "name" && !props.expanded ? props.onToggle : void 0,
					onChange: (event) => {
						const value = event.target.value;
						props.onFieldChange(field, field === "name" && value === "" ? void 0 : value);
					},
					onBlur: field === "id" ? (event) => props.onIdBlur?.(event.target.value) : void 0
				})]
			});
			return (0, react_jsx_runtime.jsx)("div", {
				className: ModelsSection_module_css_default["modelEntry"],
				"data-row-key": props.rowKey,
				"data-dragging": props.order.dragging || void 0,
				"data-drop-target": props.order.dragging ? void 0 : props.order.target,
				onDragOver: (event) => {
					if (!props.order.canDrop) return;
					event.preventDefault();
					event.dataTransfer.dropEffect = "move";
					props.order.onOver(rowHalf(event));
				},
				onDragLeave: (event) => {
					if (event.relatedTarget instanceof Node && event.currentTarget.contains(event.relatedTarget)) return;
					props.order.onLeave();
				},
				onDrop: (event) => {
					if (!props.order.canDrop) return;
					event.preventDefault();
					props.order.onDrop(rowHalf(event));
				},
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: ModelsSection_module_css_default["modelRow"],
					"data-expanded": props.expanded || void 0,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("reorderModelHelp"),
							portal: true,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["modelDragHandle"]}`,
								"aria-label": `${t("reorderModel")} ${String(position)}`,
								"aria-keyshortcuts": "ArrowUp ArrowDown",
								"aria-description": t("reorderModelHelp"),
								disabled,
								draggable: !disabled,
								onDragStart: (event) => {
									event.dataTransfer.effectAllowed = "move";
									event.dataTransfer.setData("application/x-dsh-model-order", String(position));
									props.order.onStart();
									preview.start(event, event.currentTarget.closest("[data-row-key]"));
								},
								onDragEnd: () => {
									if (preview.clear()) props.order.onEnd();
								},
								onKeyDown: (event) => {
									if (event.key !== "ArrowUp" && event.key !== "ArrowDown") return;
									event.preventDefault();
									event.stopPropagation();
									props.order.onMove(event.key === "ArrowUp" ? -1 : 1);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDragHandleOutlineRegular, { size: 14 })
							})
						}),
						modelField("id"),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: ModelsSection_module_css_default["iconButton"],
							"aria-label": `${t("modelAdvanced")} ${String(position)}`,
							"aria-expanded": props.expanded,
							title: t("modelAdvanced"),
							onClick: (event) => {
								event.currentTarget.focus();
								props.onToggle();
							},
							children: props.expanded ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
						}),
						(0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: `${ModelsSection_module_css_default["iconButton"]} ${ModelsSection_module_css_default["iconButtonDanger"]}`,
							"aria-label": `${t("removeModel")} ${String(position)}`,
							title: t("removeModel"),
							disabled,
							onClick: props.onRemove,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 14 })
						}),
						modelField("name"),
						props.expanded ? (0, react_jsx_runtime.jsxs)("div", {
							className: ModelsSection_module_css_default["modelAdvanced"],
							children: [
								["contextWindow", "maxTokens"].map((field) => (0, react_jsx_runtime.jsxs)("label", {
									className: ModelsSection_module_css_default["modelField"],
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: ModelsSection_module_css_default["modelFieldLabel"],
										children: t(field)
									}), (0, react_jsx_runtime.jsx)("input", {
										className: ModelsSection_module_css_default["input"],
										type: "text",
										inputMode: "numeric",
										value: props[field].value,
										placeholder: props[field].placeholder,
										"aria-label": `${t(field)} ${String(position)}`,
										disabled,
										onChange: (event) => {
											props[field].onChange(event.target.value);
										},
										onBlur: props[field].onBlur
									})]
								}, field)),
								(0, react_jsx_runtime.jsx)(ModelInputTypes, {
									model,
									field: props.inputField,
									position,
									fallback: props.inputFallback,
									disabled: disabled || props.inputLoading === true,
									t,
									onChange: props.onChange
								}),
								props.reasoningLevels !== void 0 && props.reasoningLevels.length > 0 ? (0, react_jsx_runtime.jsx)(ModelReasoningEfforts, {
									model,
									levels: props.reasoningLevels,
									position,
									disabled,
									t,
									onChange: props.onChange
								}) : null
							]
						}) : null
					]
				})
			});
		}
