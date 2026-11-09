// Extracted from @deepseek-ai/dsh-client-ui-creation-recommendations (lib/client.js); region lib/types/client/Card.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Body of a `create_personalized_page` card: location choice, creation progress, retention, undo and restore. */
		const slotSchema = zod.z.enum([
			"sidebar-right",
			"page",
			"sidebar-left"
		]);
		const detailsSchema = zod.z.object({
			slot: slotSchema,
			initialContent: zod.z.string().optional()
		});
		const dataSchema = zod.z.object({
			slot: slotSchema,
			customLocation: zod.z.string().optional(),
			bundleName: zod.z.string().optional(),
			application: zod.z.enum([
				"applied",
				"restart-required",
				"overridden",
				"failed",
				"cancelled"
			]).optional()
		});
		/** Phases with their own status copy. */
		const PHASE_KEYS = [
			"dismissed",
			"replaced",
			"creating",
			"installing",
			"cancelled",
			"installed",
			"kept",
			"removed",
			"failed",
			"interrupted",
			"unconfirmed"
		];
		/** Refusal reasons with their own copy; any other reason reads as unavailable. */
		const REASON_KEYS = [
			"unknown",
			"access-denied",
			"not-live-root",
			"closing",
			"unavailable",
			"invalid-location",
			"read-only",
			"source-missing"
		];
		/** Application outcomes have their own copy; the phase copy of failed and cancelled describes creation instead. */
		const APPLICATION_KEYS = {
			"restart-required": "restart-required",
			overridden: "overridden",
			failed: "applicationFailed",
			cancelled: "applicationCancelled"
		};
		function keyOf(keys, value) {
			return keys.find((key) => key === value);
		}
		function LocationPicker({ value, disabled, onChange, t }) {
			const [open, setOpen] = (0, react.useState)(false);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				open: open && !disabled,
				portal: true,
				autoFocus: true,
				compact: true,
				listClassName: Card_module_css_default.locationMenu,
				selectedId: value,
				onClose: () => {
					setOpen(false);
				},
				onSelect: (id) => {
					onChange(id);
					setOpen(false);
				},
				items: [
					"sidebar-right",
					"page",
					"sidebar-left",
					"custom"
				].map((id) => ({
					id,
					label: (0, react_jsx_runtime.jsxs)("span", {
						className: Card_module_css_default.locationOption,
						children: [(0, react_jsx_runtime.jsx)("span", { children: t(id) }), (0, react_jsx_runtime.jsx)("span", { children: t(`${id}Hint`) })]
					})
				})),
				anchor: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					disabled,
					className: Card_module_css_default.locationButton,
					"aria-label": `${t("location")}: ${t(value)}`,
					"aria-haspopup": "menu",
					"aria-expanded": open && !disabled,
					onClick: () => {
						setOpen((current) => !current);
					},
					children: [t(value), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: 14 })]
				})
			});
		}
		/**
		* Display creation, persistent installation, reversible removal and restoration below the frame's summary.
		* @param props - card, state, actions, folded-text component and notice preference.
		* @returns the card body.
		*/
		function PageCardBody({ proposal, decision, summary, Folded, act, infoDismissed, t }) {
			const details = detailsSchema.safeParse(proposal.details);
			const parsed = decision === void 0 ? void 0 : dataSchema.safeParse(decision.data);
			const data = parsed?.success === true ? parsed.data : void 0;
			const phase = decision === void 0 ? void 0 : keyOf(PHASE_KEYS, decision.phase);
			const [selected, setSelected] = (0, react.useState)();
			const [custom, setCustom] = (0, react.useState)();
			const [info, setInfo] = (0, react.useState)();
			const noticeDismissed = (0, react.useSyncExternalStore)((0, react.useCallback)((listener) => infoDismissed.subscribe(listener), [infoDismissed]), () => infoDismissed.getSnapshot());
			const infoId = (0, react.useId)();
			const customId = (0, react.useId)();
			const [pending, setPending] = (0, react.useState)();
			const [error, setError] = (0, react.useState)();
			if (!details.success) return (0, react_jsx_runtime.jsx)("div", {
				className: Card_module_css_default.body,
				children: summary
			});
			const busy = pending !== void 0;
			const slot = selected !== void 0 && selected !== "custom" ? selected : data?.slot ?? details.data.slot;
			const location = selected ?? (data?.customLocation === void 0 ? slot : "custom");
			const customLocation = custom ?? data?.customLocation ?? "";
			const offer = decision === void 0 || phase === "cancelled" || phase === "failed" || phase === "interrupted" || phase === "unconfirmed";
			const infoOpen = info ?? (offer && !noticeDismissed);
			const installed = phase === "installed" || phase === "kept";
			const run = async (verb) => {
				setPending(verb);
				setError(void 0);
				if (verb === "create" || verb === "dismiss") {
					infoDismissed.set(true);
					setInfo(false);
				}
				const placement = {
					slot,
					...location === "custom" ? { customLocation: customLocation.trim() } : {}
				};
				try {
					const result = await act(verb, verb === "create" || verb === "dismiss" ? placement : void 0);
					if (result === void 0) setError("transport");
					else if (result.status === "refused" || result.status === "unconfirmed") setError(keyOf(REASON_KEYS, result.reason) ?? "unavailable");
				} catch {
					setError("transport");
				} finally {
					setPending(void 0);
				}
			};
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("header", {
					className: Card_module_css_default.header,
					children: [(0, react_jsx_runtime.jsxs)("span", {
						className: Card_module_css_default.heading,
						children: [t("heading"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("creationInfo"),
							side: "top",
							portal: true,
							disabled: infoOpen,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								className: Card_module_css_default.infoButton,
								"aria-label": t("creationInfo"),
								"aria-expanded": infoOpen,
								"aria-controls": infoId,
								onClick: () => {
									setInfo(!infoOpen);
									if (infoOpen) infoDismissed.set(true);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningTriangleOutlineRegular, { size: 14 })
							})
						})]
					}), phase !== void 0 && (0, react_jsx_runtime.jsx)("span", {
						role: "status",
						className: Card_module_css_default.phase,
						"data-phase": phase,
						children: t(phase)
					})]
				}),
				infoOpen && (0, react_jsx_runtime.jsxs)("div", {
					id: infoId,
					role: "note",
					className: Card_module_css_default.info,
					children: [
						(0, react_jsx_runtime.jsx)("p", { children: t("creationMethod") }),
						(0, react_jsx_runtime.jsx)("p", { children: (0, react_jsx_runtime.jsx)("strong", { children: t("creationCost") }) }),
						(0, react_jsx_runtime.jsx)("p", { children: t("creationBackground") }),
						data?.bundleName !== void 0 && (0, react_jsx_runtime.jsx)("p", { children: t("sourceRetained") })
					]
				}),
				(0, react_jsx_runtime.jsxs)("div", {
					className: Card_module_css_default.body,
					children: [
						summary,
						details.data.initialContent !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
							className: Card_module_css_default.content,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: Card_module_css_default.contentLabel,
								children: t("initialContent")
							}), (0, react_jsx_runtime.jsx)(Folded, {
								text: details.data.initialContent,
								expandLabel: t("expandContent"),
								collapseLabel: t("collapseContent")
							})]
						}),
						data?.application !== void 0 && data.application !== "applied" && phase !== "failed" && (0, react_jsx_runtime.jsx)("p", {
							role: "status",
							className: Card_module_css_default.status,
							children: t(APPLICATION_KEYS[data.application])
						}),
						error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
							role: "alert",
							className: Card_module_css_default.status,
							children: t(error)
						}),
						offer ? (0, react_jsx_runtime.jsxs)("div", {
							className: Card_module_css_default.controls,
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: Card_module_css_default.locationRow,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: Card_module_css_default.locationLabel,
										children: t("location")
									}), (0, react_jsx_runtime.jsx)(LocationPicker, {
										value: location,
										disabled: busy,
										onChange: setSelected,
										t
									})]
								}),
								location === "custom" && (0, react_jsx_runtime.jsxs)("div", {
									className: Card_module_css_default.customLocation,
									children: [(0, react_jsx_runtime.jsx)("label", {
										htmlFor: customId,
										className: Card_module_css_default.locationLabel,
										children: t("customLabel")
									}), (0, react_jsx_runtime.jsx)("textarea", {
										id: customId,
										value: customLocation,
										rows: 2,
										maxLength: 1e3,
										disabled: busy,
										placeholder: t("customPlaceholder"),
										onChange: (event) => {
											setCustom(event.target.value);
										}
									})]
								}),
								(0, react_jsx_runtime.jsx)("footer", {
									className: Card_module_css_default.footer,
									children: (0, react_jsx_runtime.jsxs)("div", {
										className: Card_module_css_default.actions,
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "ghost",
											size: "sm",
											disabled: busy,
											onClick: () => {
												run("dismiss");
											},
											children: t("dismiss")
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											disabled: busy || location === "custom" && customLocation.trim() === "",
											onClick: () => {
												run("create");
											},
											children: t(pending === "create" ? "starting" : decision === void 0 ? "create" : "retry")
										})]
									})
								})
							]
						}) : (0, react_jsx_runtime.jsxs)("p", {
							className: Card_module_css_default.description,
							children: [
								t("location"),
								" · ",
								data?.customLocation ?? t(data?.slot ?? details.data.slot)
							]
						}),
						phase === "creating" && (0, react_jsx_runtime.jsx)("footer", {
							className: Card_module_css_default.footer,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								disabled: busy,
								onClick: () => {
									run("cancel");
								},
								children: t(pending === "cancel" ? "cancelling" : "cancel")
							})
						}),
						installed && (0, react_jsx_runtime.jsxs)("footer", {
							className: Card_module_css_default.footer,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: Card_module_css_default.scope,
								children: t("scope")
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: Card_module_css_default.actions,
								children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "ghost",
									size: "sm",
									disabled: busy,
									onClick: () => {
										run("undo");
									},
									children: t("undo")
								}), phase !== "kept" && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									disabled: busy,
									onClick: () => {
										run("keep");
									},
									children: t("keep")
								})]
							})]
						}),
						phase === "removed" && (0, react_jsx_runtime.jsx)("footer", {
							className: Card_module_css_default.footer,
							children: (0, react_jsx_runtime.jsx)("div", {
								className: Card_module_css_default.actions,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									disabled: busy,
									onClick: () => {
										run("restore");
									},
									children: t(pending === "restore" ? "restoring" : "restore")
								})
							})
						})
					]
				})
			] });
		}
