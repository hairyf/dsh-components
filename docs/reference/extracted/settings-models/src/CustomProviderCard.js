// Extracted from @deepseek-ai/dsh-client-ui-settings-models (lib/client.js); region lib/types/client/CustomProviderCard.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* The card that declares a provider pi-ai does not ship — an OpenAI-compatible
		* gateway, a self-hosted server, or a provider newer than the installed
		* catalog.
		*
		* This is a create, not an edit, which is why it is its own form rather than
		* the provider editor with extra fields: the route id is being *chosen* here,
		* and the settings address does not exist until it is. It renders as the
		* custom-API panel of the section's add card; the card's mode switch names it
		* when both modes are offered, and with the custom mode alone the card shows
		* this form directly. One `settings.mutate` sets the whole profile at
		* `providers.<route>`; the key travels separately through `credentials/set`
		* under the reference the profile records, exactly as an existing provider's
		* key does.
		*
		* The three fields a hand-declared route cannot default — endpoint, protocol,
		* and at least one model — are required here rather than at load, so the
		* failure names the field while the user is still looking at it.
		*
		* There is deliberately no provider-scoped reasoning-effort control, here or
		* on the editor card: effort is a per-MODEL capability, and the models under
		* one provider disagree about it, so a provider-scoped control can only be set
		* to a value some of them reject. Each model row of a hand-declared route
		* declares its own `reasoningEfforts` instead, and the composer's model picker
		* offers each model those levels.
		*/
		/** The settings namespace a hand-declared provider is written into. */
		const NS$1 = "llm-pi-ai";
		/**
		* A route id usable as a settings key AND as the stem of a credential name.
		* The leading letter is the second half of that: `deriveKeyRef` uppercases the
		* id and replaces every non-alphanumeric run with `_`, and a credential
		* reference is a POSIX shell identifier, which cannot start with a digit. A
		* digit-leading id passes every check this card makes and then fails at the
		* credential seam with a raw regular expression the user cannot act on.
		*/
		const ROUTE_PATTERN = /^[a-z][a-z0-9]*(?:-[a-z0-9]+)*$/;
		function isHttpUrl(value) {
			try {
				const protocol = new URL(value).protocol;
				return protocol === "http:" || protocol === "https:";
			} catch {
				return false;
			}
		}
		/**
		* Render the custom-provider creation card.
		* @param props - existing routes, protocol choices, wire faces, and copy.
		* @returns the creation card.
		*/
		function CustomProviderCard(props) {
			const { taken, protocols, reasoningLevels, operations, t, onBusyChange } = props;
			const [openedAt] = (0, react.useState)(() => props.revision);
			const [route, setRoute] = (0, react.useState)("");
			const [displayName, setDisplayName] = (0, react.useState)("");
			const [baseURL, setBaseURL] = (0, react.useState)("");
			const [protocol, setProtocol] = (0, react.useState)(protocols[0] ?? "");
			const [keyDraft, setKeyDraft] = (0, react.useState)("");
			const [models, setModels] = (0, react.useState)([]);
			const [busy, setBusy] = (0, react.useState)(false);
			const [listBusy, setListBusy] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				onBusyChange?.(busy || listBusy);
			}, [
				busy,
				listBusy,
				onBusyChange
			]);
			const [failure, setFailure] = (0, react.useState)(void 0);
			/**
			* The profile write landed. Only the key write can still be outstanding, so
			* the fields that describe the provider are settled and the retry path is
			* the credential alone.
			*/
			const [committed, setCommitted] = (0, react.useState)(false);
			const disabled = props.readOnly || busy;
			/** Everything but the key stops being editable once the provider exists. */
			const profileDisabled = disabled || committed;
			const routeInvalid = route.length > 0 && !ROUTE_PATTERN.test(route);
			const routeTaken = taken.includes(route);
			const normalizedBaseURL = baseURL.trim();
			const baseUrlInvalid = baseURL.length > 0 && !isHttpUrl(normalizedBaseURL);
			const modelFailure = validateDeepSeekModels(models) ?? validateReasoningEfforts(models);
			const keyFailure = apiKeyFailure(keyDraft);
			const keyValue = keyDraft.trim();
			const ready = route.length > 0 && !routeInvalid && !routeTaken && normalizedBaseURL.length > 0 && !baseUrlInvalid && models.length > 0 && modelFailure === void 0 && keyFailure === void 0;
			const hint = failure !== void 0 || ready || keyFailure !== void 0 || route.length === 0 || routeInvalid || routeTaken || baseUrlInvalid ? void 0 : normalizedBaseURL.length === 0 ? t("customNeedsBaseUrl") : modelFailure !== void 0 ? `${t("model")} ${String(modelFailure.index + 1)}: ${t(modelFailure.key)}` : t("customNeedsModels");
			/** Perform the create, returning a failure message or undefined. */
			const createOnce = async () => {
				const keyRef = deriveKeyRef(route);
				const storesKey = keyValue.length > 0;
				if (!committed) {
					const profile = {
						...displayName.length === 0 ? {} : { displayName },
						...storesKey ? { apiKeyEnv: keyRef } : {},
						api: protocol,
						baseURL: normalizedBaseURL,
						models: models.map((model) => ({ ...model }))
					};
					const written = await operations.writeSettings(NS$1, [{
						op: "set",
						path: ["providers", route],
						value: profile
					}], openedAt);
					if (written.kind !== "written") return written.kind === "conflict" ? t("conflict") : written.message;
					setCommitted(true);
				}
				if (storesKey) {
					const stored = await operations.storeCredential(keyRef, keyValue);
					if (stored !== void 0) return stored;
				}
			};
			const create = async () => {
				setBusy(true);
				setFailure(void 0);
				try {
					const outcome = await createOnce();
					if (outcome !== void 0) {
						setFailure(outcome);
						return;
					}
					props.onClose(true);
				} finally {
					setBusy(false);
				}
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ModelsSection_module_css_default["editor"],
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customRoute")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: route,
							placeholder: "acme-gateway",
							"aria-label": t("customRoute"),
							disabled: profileDisabled,
							onChange: (event) => {
								setRoute(event.target.value);
							}
						})]
					}),
					routeInvalid || routeTaken ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t(routeInvalid ? "customRouteInvalid" : "customRouteTaken")
					}) : (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["advancedHint"],
						children: t("customRouteHint")
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customDisplayName")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: displayName,
							placeholder: route.length === 0 ? t("customDisplayName") : route,
							"aria-label": t("customDisplayName"),
							disabled: profileDisabled,
							onChange: (event) => {
								setDisplayName(event.target.value);
							}
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("baseUrl")
						}), (0, react_jsx_runtime.jsx)("input", {
							className: ModelsSection_module_css_default["input"],
							type: "text",
							value: baseURL,
							placeholder: t(protocol === "anthropic-messages" ? "customAnthropicBaseUrlPlaceholder" : "customBaseUrlPlaceholder"),
							"aria-label": t("baseUrl"),
							"aria-invalid": baseUrlInvalid,
							disabled: profileDisabled,
							onChange: (event) => {
								setBaseURL(event.target.value);
							}
						})]
					}),
					baseUrlInvalid ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: t("customBaseUrlInvalid")
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ModelsSection_module_css_default["fieldLabel"],
							children: t("customApi")
						}), (0, react_jsx_runtime.jsx)("select", {
							className: `${ModelsSection_module_css_default["input"]} ${ModelsSection_module_css_default["selectInput"]}`,
							value: protocol,
							"aria-label": t("customApi"),
							disabled: profileDisabled,
							onChange: (event) => {
								setProtocol(event.target.value);
							},
							children: protocols.map((choice) => (0, react_jsx_runtime.jsx)("option", {
								value: choice,
								children: protocolLabel(t, choice)
							}, choice))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: ModelsSection_module_css_default["field"],
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: ModelsSection_module_css_default["fieldLabel"],
								children: t("keyInput")
							}),
							(0, react_jsx_runtime.jsx)(ApiKeyInput, {
								t,
								value: keyDraft,
								placeholder: t("keyPlaceholder"),
								"aria-label": t("keyInput"),
								disabled,
								onChange: (event) => {
									setKeyDraft(event.target.value);
								}
							}),
							keyFailure === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								className: ModelsSection_module_css_default["error"],
								children: t(keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure)
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(ModelListEditor, {
						models,
						onChange: setModels,
						reasoningLevels,
						probe: {
							settingsNs: NS$1,
							baseURL: normalizedBaseURL,
							api: protocol,
							...keyValue.length === 0 ? {} : { apiKey: keyValue }
						},
						probeBlocked: baseUrlInvalid ? "customBaseUrlInvalid" : keyFailure === "keyBlank" ? "keyBlankNew" : keyFailure,
						operations,
						t,
						disabled: profileDisabled,
						onBusyChange: setListBusy
					}),
					failure !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["error"],
						children: failure
					}) : null,
					hint === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: ModelsSection_module_css_default["advancedHint"],
						children: hint
					}),
					(0, react_jsx_runtime.jsx)(EditorFooter, {
						t,
						busy,
						submitDisabled: disabled || !ready,
						submitLabelKey: "create",
						submitBusyLabelKey: "creating",
						onCancel: () => {
							props.onClose(committed);
						},
						onSubmit: () => {
							create();
						}
					})
				]
			});
		}
