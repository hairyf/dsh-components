// Extracted from @deepseek-ai/dsh-client-ui-plugin-recommendations (lib/client.js); region lib/types/client/Card.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Body of an `enable_official_plugin` card: the plugin's catalog text, its details link, the user's choice and its outcome. */
		const detailsSchema = zod.z.object({ name: zod.z.string() });
		/** Recorded decision data the body reads; see `PluginData` for its meaning. */
		const dataSchema = zod.z.object({
			application: zod.z.literal("restart-required").optional(),
			errorCode: zod.z.string().optional()
		});
		/** Phases that still offer Enable and Not now; any other recorded phase is settled. */
		const OPEN_PHASES = ["failed", "unconfirmed"];
		/** Refusal reasons with their own copy; any other reason reads as unavailable. */
		const REASON_KEYS = [
			"unknown",
			"unavailable",
			"access-denied",
			"not-live-root",
			"closing"
		];
		function reasonKey(reason) {
			return REASON_KEYS.find((key) => key === reason) ?? "unavailable";
		}
		/** Status copy of a recorded phase; `restart-required` refines enabled. */
		function statusKey(phase, data) {
			switch (phase) {
				case "dismissed":
				case "replaced":
				case "already-enabled":
				case "failed":
				case "unconfirmed": return phase;
				case "enabled": return data.application === "restart-required" ? "restart-required" : "enabled";
				default: return;
			}
		}
		/**
		* Display one plugin card: its current catalog title and description, the user's choice and its outcome.
		* Until the plugin's first catalog lookup returns, a placeholder line and the disabled actions hold the final layout.
		* A refused or lost lookup leaves Not now and a retry of the lookup, but not Enable.
		* @param props - card, state, actions and plugin-lifetime services.
		* @returns the card body.
		*/
		function PluginCardBody({ proposal, decision, sessionId, summary, act, catalog, describe, openDetails, resolveText, t }) {
			const details = detailsSchema.safeParse(proposal.details);
			const name = details.success ? details.data.name : void 0;
			const cached = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => catalog.subscribe(listener), [catalog]), () => {
				const entries = catalog.getSnapshot();
				return name !== void 0 && Object.hasOwn(entries, name) ? entries[name] : void 0;
			});
			const [lookup, setLookup] = (0, react.useState)();
			const [attempt, setAttempt] = (0, react.useState)(0);
			const [pending, setPending] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			const descriptionId = (0, react.useId)();
			const phase = decision?.phase;
			(0, react.useEffect)(() => {
				if (name === void 0) return void 0;
				let current = true;
				describe(sessionId, proposal.callId).then((value) => {
					if (!current) return;
					if (value?.status === "available") catalog.set({
						...catalog.getSnapshot(),
						[name]: value
					});
					setLookup(value ?? null);
				}, () => {
					if (current) setLookup(null);
				});
				return () => {
					current = false;
				};
			}, [
				catalog,
				describe,
				sessionId,
				proposal.callId,
				name,
				phase,
				attempt
			]);
			if (name === void 0) return (0, react_jsx_runtime.jsx)("div", {
				className: Card_module_css_default.body,
				children: summary
			});
			const current = lookup === null || lookup?.status === "refused" ? lookup : cached ?? lookup;
			const loading = current === void 0;
			const available = current?.status === "available" ? current : void 0;
			const parsed = dataSchema.safeParse(decision?.data ?? {});
			const data = parsed.success ? parsed.data : {};
			const settled = phase !== void 0 && !OPEN_PHASES.includes(phase);
			const status = phase === void 0 ? available?.enabled ? "already-enabled" : void 0 : statusKey(phase, data);
			const offered = !settled && available?.enabled !== true;
			const enable = offered && (available !== void 0 || loading);
			const lookupProblem = settled || current === void 0 || current?.status === "available" ? void 0 : current === null ? "lookup-failed" : current.reason;
			const failure = phase === "failed" && data.errorCode !== void 0 ? data.errorCode === "incompatible-version" ? "version-error" : "management-error" : void 0;
			const title = available === void 0 ? proposal.title : resolveText(available.title);
			const run = async (verb) => {
				setPending(verb);
				setError(void 0);
				try {
					const result = await act(verb);
					if (result === void 0) setError("transport");
					else if (result.status === "refused" || result.status === "unconfirmed") setError(reasonKey(result.reason));
				} catch {
					setError("transport");
				} finally {
					setPending(void 0);
				}
			};
			const busy = pending !== void 0;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("header", {
				className: Card_module_css_default.header,
				children: [(0, react_jsx_runtime.jsx)("span", { children: t("heading") }), (0, react_jsx_runtime.jsx)("span", {
					className: Card_module_css_default.badge,
					children: t("official")
				})]
			}), (0, react_jsx_runtime.jsxs)("div", {
				className: Card_module_css_default.body,
				"aria-busy": loading || void 0,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: Card_module_css_default.details,
						onClick: () => {
							openDetails(name);
						},
						"aria-label": t("detailsFor", { title }),
						"aria-describedby": available === void 0 ? void 0 : descriptionId,
						children: [(0, react_jsx_runtime.jsx)("strong", {
							className: Card_module_css_default.title,
							children: title
						}), (loading || available !== void 0) && (0, react_jsx_runtime.jsx)("span", {
							id: descriptionId,
							className: Card_module_css_default.description,
							children: available === void 0 ? (0, react_jsx_runtime.jsx)("span", { className: Card_module_css_default.placeholder }) : resolveText(available.description)
						})]
					}),
					status !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						role: "status",
						className: Card_module_css_default.status,
						children: t(status)
					}),
					failure !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: Card_module_css_default.status,
						children: t(failure)
					}),
					lookupProblem !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: Card_module_css_default.status,
						children: t(lookupProblem)
					}),
					offered && error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
						role: "alert",
						className: Card_module_css_default.status,
						children: t(error)
					}),
					offered && (0, react_jsx_runtime.jsxs)("footer", {
						className: Card_module_css_default.footer,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: Card_module_css_default.scope,
							children: t("scope")
						}), (0, react_jsx_runtime.jsxs)("div", {
							className: Card_module_css_default.actions,
							children: [
								lookupProblem !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									size: "sm",
									disabled: busy,
									onClick: () => {
										setLookup(void 0);
										setAttempt((value) => value + 1);
									},
									children: t("retryLookup")
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									size: "sm",
									disabled: busy || loading,
									onClick: () => {
										run("dismiss");
									},
									children: t(pending === "dismiss" ? "working" : "dismiss")
								}),
								enable && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									disabled: busy || loading,
									onClick: () => {
										run("enable");
									},
									children: t(pending === "enable" ? "working" : phase === void 0 ? "enable" : "retry")
								})
							]
						})]
					})
				]
			})] });
		}
