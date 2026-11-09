// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/office/FontNotice.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Toolbar warning and non-modal details for the current preview’s missing fonts. */
		/**
		* Show a warning while fonts are unavailable for the current preview.
		* @param props - missing font families and localized copy.
		* @returns a warning button and its anchored details, or nothing when fonts are available.
		*/
		function FontNotice({ fonts, t }) {
			const [expanded, setExpanded] = (0, react.useState)(false);
			const open = fonts.length > 0 && expanded;
			const anchor = (0, react.useRef)(null);
			const panel = (0, react.useRef)(null);
			const id = (0, react.useId)();
			const position = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: anchor,
				panelRef: panel,
				gap: 8,
				margin: 12
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(anchor, open, () => {
				setExpanded(false);
			}, panel);
			const closeDetails = () => {
				setExpanded(false);
				anchor.current?.querySelector("button")?.focus();
			};
			const positioned = position !== null;
			(0, react.useLayoutEffect)(() => {
				if (!open || !positioned) return;
				panel.current?.focus();
			}, [open, positioned]);
			if (fonts.length === 0) return null;
			const label = t("viewMissingFonts", { count: fonts.length });
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label,
				side: "bottom",
				delayMs: 500,
				disabled: open,
				children: (0, react_jsx_runtime.jsx)("span", {
					ref: anchor,
					className: FontNotice_module_css_default.anchor,
					"data-office-font-warning": true,
					children: (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: clsx(TextPreview_module_css_default.tool, FontNotice_module_css_default.warning),
						"aria-label": label,
						"aria-expanded": open,
						"aria-controls": open ? id : void 0,
						"aria-haspopup": "dialog",
						onClick: () => {
							setExpanded((value) => !value);
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningTriangleOutlineRegular, {})
					})
				})
			}), open && (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("div", {
				ref: panel,
				id,
				role: "dialog",
				"aria-labelledby": `${id}-title`,
				"aria-describedby": `${id}-description`,
				tabIndex: -1,
				className: FontNotice_module_css_default.panel,
				style: {
					...position,
					visibility: position === null ? "hidden" : void 0
				},
				onKeyDown: (event) => {
					if (event.key === "Escape") {
						event.preventDefault();
						event.stopPropagation();
						closeDetails();
					}
				},
				onBlur: (event) => {
					if (event.relatedTarget instanceof Node && !event.currentTarget.contains(event.relatedTarget) && !anchor.current?.contains(event.relatedTarget)) setExpanded(false);
				},
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: FontNotice_module_css_default.panelHeader,
						children: [(0, react_jsx_runtime.jsx)("h3", {
							id: `${id}-title`,
							children: t("missingFontsTitle")
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							"aria-label": t("closeDetails"),
							onClick: closeDetails,
							icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, {})
						})]
					}),
					(0, react_jsx_runtime.jsx)("p", {
						id: `${id}-description`,
						className: FontNotice_module_css_default.description,
						children: t("missingFontsDescription")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: FontNotice_module_css_default.count,
						children: t("missingFontsCount", { count: fonts.length })
					}),
					(0, react_jsx_runtime.jsx)("ul", {
						className: FontNotice_module_css_default.fonts,
						children: fonts.map((font) => (0, react_jsx_runtime.jsx)("li", { children: font }, font))
					})
				]
			}), document.body)] });
		}
