// Extracted from @deepseek-ai/dsh-client-ui-settings-subagent (lib/client.js); region lib/types/client/SubagentModelSelectionFields.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** User control for model-selectable subagent delegation in new sessions. */
		/**
		* Render the default-off preference and its exact adapter-route choices.
		* @param props - locale copy, the card snapshot, and its toggle action.
		* @returns the model permission and route choices inside the shared card.
		*/
		function SubagentModelSelectionFields(props) {
			const { t, state } = props;
			const availableGroups = /* @__PURE__ */ new Map();
			const unavailable = [];
			for (const candidate of state.candidates) {
				if (!candidate.available) {
					unavailable.push(candidate);
					continue;
				}
				const group = availableGroups.get(candidate.provider);
				if (group === void 0) availableGroups.set(candidate.provider, {
					providerName: candidate.providerName,
					candidates: [candidate]
				});
				else group.candidates.push(candidate);
			}
			const renderCandidate = (candidate) => (0, react_jsx_runtime.jsxs)("label", {
				className: SubagentModelSelectionFields_module_css_default.model,
				children: [
					(0, react_jsx_runtime.jsx)("input", {
						type: "checkbox",
						checked: candidate.selected,
						disabled: !state.writable || state.saving,
						onChange: () => {
							props.toggleModel(candidate.key);
						}
					}),
					(0, react_jsx_runtime.jsxs)("span", { children: [(0, react_jsx_runtime.jsx)("span", {
						className: SubagentModelSelectionFields_module_css_default.modelName,
						children: candidate.modelName
					}), (0, react_jsx_runtime.jsx)("span", {
						className: SubagentModelSelectionFields_module_css_default.route,
						children: `${candidate.providerName} · ${candidate.provider}/${candidate.model}`
					})] }),
					!candidate.available ? (0, react_jsx_runtime.jsx)("span", {
						className: SubagentModelSelectionFields_module_css_default.unavailable,
						children: t("subagentModelSelectionUnavailable")
					}) : null
				]
			}, candidate.key);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: SubagentModelSelectionFields_module_css_default.permission,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: SubagentModelSelectionFields_module_css_default.toggleRow,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: SubagentModelSelectionFields_module_css_default.toggleLabel,
							children: t("subagentModelSelectionToggle")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
							checked: state.enabled,
							label: t("subagentModelSelectionToggle"),
							disabled: !state.writable || state.saving,
							onChange: props.toggleEnabled
						})]
					}), (0, react_jsx_runtime.jsx)("p", {
						className: SubagentModelSelectionFields_module_css_default.hint,
						children: t(state.enabled ? "subagentModelSelectionChoose" : "subagentModelSelectionOff")
					})]
				}),
				state.enabled ? (0, react_jsx_runtime.jsxs)("div", {
					className: SubagentModelSelectionFields_module_css_default.selection,
					children: [
						state.catalogStatus === "loading" ? (0, react_jsx_runtime.jsx)("p", {
							className: SubagentModelSelectionFields_module_css_default.notice,
							role: "status",
							children: t("subagentModelSelectionLoading")
						}) : null,
						state.catalogStatus === "error" ? (0, react_jsx_runtime.jsxs)("div", {
							className: SubagentModelSelectionFields_module_css_default.catalogError,
							role: "alert",
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("subagentModelSelectionLoadFailed") }), (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								disabled: state.saving,
								onClick: props.retryCatalog,
								children: t("subagentModelSelectionRetry")
							})]
						}) : null,
						state.catalogPartial ? (0, react_jsx_runtime.jsx)("p", {
							className: SubagentModelSelectionFields_module_css_default.notice,
							children: t("subagentModelSelectionPartial")
						}) : null,
						state.candidates.length > 0 ? (0, react_jsx_runtime.jsxs)("fieldset", {
							className: SubagentModelSelectionFields_module_css_default.models,
							children: [
								(0, react_jsx_runtime.jsx)("legend", { children: t("subagentModelSelectionAllowed") }),
								[...availableGroups].map(([provider, group]) => (0, react_jsx_runtime.jsxs)("div", {
									className: SubagentModelSelectionFields_module_css_default.modelGroup,
									children: [(0, react_jsx_runtime.jsx)("div", {
										className: SubagentModelSelectionFields_module_css_default.providerName,
										children: group.providerName
									}), group.candidates.map(renderCandidate)]
								}, provider)),
								unavailable.length > 0 ? (0, react_jsx_runtime.jsxs)("div", {
									className: SubagentModelSelectionFields_module_css_default.modelGroup,
									children: [(0, react_jsx_runtime.jsx)("div", {
										className: SubagentModelSelectionFields_module_css_default.providerName,
										children: t("subagentModelSelectionUnavailableGroup")
									}), unavailable.map(renderCandidate)]
								}) : null
							]
						}) : state.catalogStatus === "ready" ? (0, react_jsx_runtime.jsx)("p", {
							className: SubagentModelSelectionFields_module_css_default.notice,
							children: t("subagentModelSelectionEmpty")
						}) : null,
						state.invalid ? (0, react_jsx_runtime.jsx)("p", {
							className: SubagentModelSelectionFields_module_css_default.invalid,
							children: t("subagentModelSelectionRequired")
						}) : null
					]
				}) : null,
				state.conflicted ? (0, react_jsx_runtime.jsx)("p", {
					className: SubagentModelSelectionFields_module_css_default.conflict,
					role: "status",
					children: t("subagentModelSelectionConflict")
				}) : null
			] });
		}
