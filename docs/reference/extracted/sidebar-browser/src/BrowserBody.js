// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/view/BrowserBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Common browser chrome; a presentation adapter attaches the page inside its content container. */
		const EMPTY_FRAME = emptyBrowserFrame();
		function SandboxPolicyIcon({ sandboxed }) {
			return (0, react_jsx_runtime.jsxs)("svg", {
				width: "15",
				height: "15",
				viewBox: "0 0 16 16",
				fill: "none",
				"aria-hidden": true,
				children: [(0, react_jsx_runtime.jsx)("path", {
					d: _deepseek_ai_dsh_client_ui_primitives.SHIELD_OUTLINE_PATH,
					stroke: "currentColor",
					strokeWidth: _deepseek_ai_dsh_client_ui_primitives.ICON_REGULAR_STROKE,
					strokeLinejoin: "round"
				}), sandboxed ? (0, react_jsx_runtime.jsx)("path", {
					d: "M12.1654 5.7552L8.9447 9.41475C8.73044 9.65816 8.53628 9.8804 8.35774 10.0423C8.1713 10.2114 7.94235 10.3717 7.64016 10.4254C7.48207 10.4535 7.32 10.4552 7.16151 10.4294C6.85843 10.3801 6.62728 10.2223 6.43836 10.0559C6.25752 9.89653 6.06037 9.67732 5.84264 9.43705L4.72925 8.20897L5.63557 7.38707L6.74897 8.61594C6.98603 8.87755 7.12974 9.03533 7.24673 9.13839C7.31033 9.19443 7.34485 9.21476 7.35823 9.22122C7.38068 9.22484 7.40352 9.22515 7.42593 9.22122C7.40522 9.22502 7.42893 9.23294 7.53583 9.136C7.65132 9.03126 7.79316 8.87139 8.02643 8.60638L11.2479 4.94763L12.1654 5.7552Z",
					fill: "currentColor"
				}) : (0, react_jsx_runtime.jsx)("path", {
					d: "M10.6074 4.40278L8.00975 6.99973L10.6074 9.59739L9.59736 10.6074L6.9997 8.00978L4.40274 10.6074L3.3927 9.59739L5.98966 6.99973L3.3927 4.40278L4.40274 3.39273L6.9997 5.98969L9.59736 3.39273L10.6074 4.40278Z",
					fill: "currentColor",
					transform: "translate(1.2 0.8)"
				})]
			});
		}
		function useBrowserDraft(url, revision) {
			const [edit, setEdit] = (0, react.useState)();
			return [edit?.revision === revision ? edit.value : url ?? "", (value) => {
				setEdit({
					revision,
					value
				});
			}];
		}
		/** Render provider-neutral navigation state and optional controls. */
		function BrowserBody(props) {
			const { mount, loadUrl, restore, goBack, goForward, reload, setSandbox, useBrowserState, useStore, useTabInfo, t } = props;
			const { tab } = useTabInfo();
			(0, react.useEffect)(() => tab.actions.bindCommands({ refresh: () => {
				reload(tab.id);
			} }), [
				tab.actions,
				tab.id,
				reload
			]);
			const initial = (0, react.useRef)(useStore((state) => state.byTab[tab.id]));
			const initialUrl = (0, react.useRef)(tab.navigation.params?.url);
			const viewportId = (0, react.useId)();
			const [mountEpoch, setMountEpoch] = (0, react.useState)(0);
			const state = useBrowserState(tab.id);
			const frame = state?.frame ?? EMPTY_FRAME;
			const restoreTarget = state === void 0 ? currentBrowserTarget(initial.current) : state.restoreTarget;
			const target = frame.target ?? restoreTarget;
			const [draft, setDraft] = useBrowserDraft(target?.url ?? initialUrl.current, state?.addressRevision ?? 0);
			(0, react.useLayoutEffect)(() => {
				const hide = mount({
					tabId: tab.id,
					signal: tab.signal,
					viewportId,
					applicationOrigin: window.location.origin,
					initial: initial.current,
					initialUrl: initialUrl.current,
					openTab: (url) => {
						tab.actions.openTab("browser", {
							params: { url },
							revealIfOpened: false
						});
					}
				});
				setMountEpoch((value) => value + 1);
				return hide;
			}, [
				mount,
				tab.id,
				tab.signal,
				tab.actions,
				viewportId,
				props.actions
			]);
			const unknown = frame.address === "unknown";
			const externalUrl = unknown ? void 0 : target?.url;
			const sandboxed = frame.sandboxEnabled;
			const failure = state?.addressFailure;
			const error = frame.error;
			const submit = (event) => {
				event.preventDefault();
				loadUrl(tab.id, draft);
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: Browser_module_css_default.root,
				children: [
					(0, react_jsx_runtime.jsxs)("form", {
						className: Browser_module_css_default.toolbar,
						onSubmit: submit,
						children: [
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: Browser_module_css_default.tool,
								"aria-label": t("back"),
								title: t("back"),
								disabled: !frame.canGoBack,
								onClick: () => {
									goBack(tab.id);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineRegular, {})
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: Browser_module_css_default.tool,
								"aria-label": t("forward"),
								title: t("forward"),
								disabled: !frame.canGoForward,
								onClick: () => {
									goForward(tab.id);
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {})
							}),
							(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
								label: t("reload"),
								shortcutKeys: tab.refreshShortcut?.keys,
								side: "bottom",
								delayMs: 500,
								children: (0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: Browser_module_css_default.tool,
									"aria-label": t("reload"),
									"aria-keyshortcuts": tab.refreshShortcut?.aria,
									disabled: target === void 0 || mountEpoch === 0,
									onClick: () => {
										reload(tab.id);
									},
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, {})
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: Browser_module_css_default.addressBox,
								children: [
									(0, react_jsx_runtime.jsx)("input", {
										className: [Browser_module_css_default.address, unknown ? Browser_module_css_default.addressUnknown : ""].join(" "),
										value: draft,
										"aria-label": t("address.placeholder"),
										placeholder: t("address.placeholder"),
										spellCheck: false,
										onChange: (event) => {
											setDraft(event.currentTarget.value);
										}
									}),
									unknown && (0, react_jsx_runtime.jsx)("span", {
										className: Browser_module_css_default.addressChanged,
										children: t("address.changed")
									}),
									(0, react_jsx_runtime.jsx)("button", {
										type: "submit",
										className: [Browser_module_css_default.tool, Browser_module_css_default.addressGo].join(" "),
										"aria-label": t("go"),
										title: t("go"),
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLinkOutlineRegular, {})
									})
								]
							}),
							(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: Browser_module_css_default.tool,
								"aria-label": t("external"),
								title: t("external"),
								disabled: externalUrl === void 0,
								onClick: externalUrl === void 0 ? void 0 : () => {
									window.open(externalUrl, "_blank", "noopener,noreferrer");
								},
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutlineRegular, { size: 14 })
							}),
							sandboxed !== void 0 && (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: [Browser_module_css_default.tool, sandboxed ? "" : Browser_module_css_default.sandboxOff].join(" "),
								"aria-label": t(sandboxed ? "sandbox.disable" : "sandbox.enable"),
								title: t(sandboxed ? "sandbox.disable" : "sandbox.enable"),
								"aria-pressed": !sandboxed,
								onClick: () => {
									setSandbox(tab.id, !sandboxed);
								},
								children: (0, react_jsx_runtime.jsx)(SandboxPolicyIcon, { sandboxed })
							})
						]
					}),
					sandboxed === false && (0, react_jsx_runtime.jsx)("div", {
						className: Browser_module_css_default.sandboxWarning,
						role: "status",
						children: t("sandbox.warning")
					}),
					error !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Browser_module_css_default.failure,
						role: "status",
						children: error.code !== void 0 && error.description !== void 0 ? t("load.failed.detail", {
							code: String(error.code),
							description: error.description
						}) : t("load.failed")
					}),
					failure !== void 0 && (0, react_jsx_runtime.jsx)("div", {
						className: Browser_module_css_default.failure,
						role: "alert",
						children: t(`error.${failure}`)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: Browser_module_css_default.content,
						"aria-busy": frame.loading,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								id: viewportId,
								className: Browser_module_css_default.viewport,
								"aria-label": t("type.label")
							}),
							restoreTarget !== void 0 && (0, react_jsx_runtime.jsxs)("section", {
								className: Browser_module_css_default.restore,
								"aria-label": t("restore.previous"),
								children: [
									(0, react_jsx_runtime.jsx)("p", {
										className: Browser_module_css_default.restoreLabel,
										children: t("restore.previous")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: Browser_module_css_default.restoreTitle,
										children: restoreTarget.title
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: Browser_module_css_default.restoreUrl,
										children: restoreTarget.url
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										size: "sm",
										disabled: mountEpoch === 0,
										onClick: () => {
											restore(tab.id);
										},
										children: t("restore.action")
									})
								]
							}),
							restoreTarget === void 0 && (target === void 0 || frame.loading) && error === void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: Browser_module_css_default.placeholder,
								children: (0, react_jsx_runtime.jsx)("div", {
									className: Browser_module_css_default.start,
									children: t(target === void 0 ? "start" : "loading")
								})
							})
						]
					}),
					unknown && (0, react_jsx_runtime.jsx)("p", {
						className: Browser_module_css_default.limit,
						children: t("address.unknown")
					})
				]
			});
		}
