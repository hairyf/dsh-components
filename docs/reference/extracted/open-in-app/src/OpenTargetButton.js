// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/OpenTargetButton.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared file and directory opener: one default action, application menu, and one reported outcome per gesture. */
		/**
		* Serialize gestures and report the outcome each one settles on to the app-wide
		* announcer, which outlives this control and the panel holding it.
		* @param execute - target adapter that settles on the gesture's outcome.
		* @param report - announcement seat the settled outcome is sent to.
		* @returns the pending state and the guarded action callback.
		*/
		function useOpenTargetGesture(execute, report) {
			const [pending, setPending] = (0, react.useState)(false);
			const inFlight = (0, react.useRef)(false);
			return {
				pending,
				act: (operation) => {
					if (inFlight.current) return;
					inFlight.current = true;
					setPending(true);
					execute(operation).then(report).finally(() => {
						inFlight.current = false;
						setPending(false);
					});
				}
			};
		}
		/** One application image with a per-image fallback, shared by main and menu buttons. */
		function ApplicationIcon({ source, size = 14 }) {
			const [failed, setFailed] = (0, react.useState)(false);
			return source === null || failed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutlineRegular, { size }) : (0, react_jsx_runtime.jsx)("img", {
				src: source,
				width: size,
				height: size,
				className: OpenTargetButton_module_css_default.appIcon,
				alt: "",
				draggable: false,
				onError: () => {
					setFailed(true);
				}
			});
		}
		/**
		* Render identical split buttons for files and directories. File reveal always
		* stays last; it is the default only when no application is registered.
		* @param props - target applications, default selection, and operations.
		* @returns the control alone: its settled outcomes are announced by the seat it reports to.
		*/
		function OpenTargetButton(props) {
			const { applications, defaultId, kind, t } = props;
			const [menuOpen, setMenuOpen] = (0, react.useState)(false);
			const { pending, act } = useOpenTargetGesture(props.execute, props.report);
			const preferred = kind === "file" ? applications.find((app) => app.id === defaultId) ?? applications[0] : applications.find((app) => app.id === defaultId);
			const disabled = pending || props.busy === true || props.loading === true;
			const hasMenu = props.loading === true || props.failed || applications.length + (kind === "file" ? 1 : 0) > 1;
			const revealDefault = kind === "file" && preferred === void 0 && props.loading !== true;
			const primaryLabel = preferred === void 0 ? t("path.reveal") : t("open.title", { app: preferred.name });
			const run = (operation) => {
				setMenuOpen(false);
				act(operation);
			};
			const primary = () => {
				if (revealDefault) {
					run({ kind: "reveal" });
					return;
				}
				if (preferred !== void 0 && preferred.id !== defaultId) {
					run({
						kind: "application",
						id: preferred.id
					});
					return;
				}
				run({ kind: "default" });
			};
			const icon = props.loading === true && preferred === void 0 ? (0, react_jsx_runtime.jsx)("span", {
				className: OpenTargetButton_module_css_default.skeleton,
				"data-open-target-skeleton": true,
				"aria-hidden": "true",
				style: {
					width: props.prominent ? 18 : 13,
					height: props.prominent ? 18 : 13
				}
			}) : revealDefault ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, { size: props.prominent ? 18 : 13 }) : (0, react_jsx_runtime.jsx)(ApplicationIcon, {
				source: preferred?.icon ?? null,
				size: props.prominent ? 18 : 13
			}, preferred?.icon);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
				className: OpenTargetButton_module_css_default.menuAnchor,
				open: menuOpen && !disabled && hasMenu,
				autoFocus: true,
				portal: true,
				dense: true,
				align: "end",
				onClose: () => {
					setMenuOpen(false);
				},
				items: [...applications.map((app) => ({
					id: `app:${app.id}`,
					icon: (0, react_jsx_runtime.jsx)(ApplicationIcon, { source: app.icon }, app.icon),
					label: app.id === preferred?.id ? t("path.appDefault", { app: app.name }) : app.name
				})), ...props.failed ? [{
					id: "unavailable",
					label: t("path.appsError"),
					disabled: true
				}] : []],
				footer: kind === "file" ? [{
					id: "reveal",
					icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconFolderOpenOutlineRegular, {}),
					label: revealDefault ? t("path.appDefault", { app: t("path.reveal") }) : t("path.reveal")
				}] : [],
				onSelect: (id) => {
					run(id === "reveal" ? { kind: "reveal" } : {
						kind: "application",
						id: id.slice(4)
					});
				},
				anchor: (0, react_jsx_runtime.jsxs)("div", {
					className: OpenTargetButton_module_css_default.split,
					"data-open-target": kind,
					"data-size": props.prominent ? "large" : "compact",
					"data-open-path": kind === "file" && !props.prominent ? "" : void 0,
					"data-state": disabled ? "busy" : "idle",
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
						portal: true,
						label: primaryLabel,
						shortcutKeys: props.shortcut?.keys,
						side: "bottom",
						delayMs: 500,
						children: (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: OpenTargetButton_module_css_default.main,
							disabled,
							"aria-label": props.prominent ? void 0 : primaryLabel,
							"aria-keyshortcuts": props.shortcut?.aria,
							"data-open-path-open": kind === "file" && !props.prominent ? "" : void 0,
							"data-open-path-unpreviewable": props.prominent ? "" : void 0,
							onClick: primary,
							children: [icon, props.prominent && (revealDefault ? t("path.reveal") : t("path.open"))]
						})
					}), hasMenu && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: OpenTargetButton_module_css_default.chevron,
						disabled,
						"aria-haspopup": "menu",
						"aria-expanded": menuOpen && !disabled,
						"aria-label": t("path.more"),
						"data-open-path-more": kind === "file" && !props.prominent ? "" : void 0,
						onClick: () => {
							if (!menuOpen) props.refresh?.();
							setMenuOpen((value) => !value);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, { size: props.prominent ? 14 : 10 })
					})]
				})
			});
		}
