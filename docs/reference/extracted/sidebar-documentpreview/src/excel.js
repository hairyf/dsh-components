// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.excel.js); region lib/types/client/excel/excel.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Read-only spreadsheet surface backed by browser-parsed workbook data. */
		const scopedStyles = `@scope ([data-excel-preview]) { ${index_css_default} }`;
		/**
		* Display stored spreadsheet values and formats without editing or recalculation.
		* Keep the mounted workbook sized to its preview pane.
		* @param props - Complete workbook bytes, limits, and locale.
		* @returns An isolated spreadsheet surface with cancellable loading.
		*/
		function ExcelBody({ content, format, limits, t, loading }) {
			const data = content.kind === "bytes" ? content.data : void 0;
			const [state, setState] = (0, react.useState)();
			const [attempt, setAttempt] = (0, react.useState)(0);
			const workbookRef = (0, react.useRef)(null);
			(0, react.useEffect)(() => {
				if (data === void 0) return;
				const controller = new AbortController();
				setState(void 0);
				parseExcel(data, format, limits, controller.signal).then((value) => {
					if (!controller.signal.aborted) setState({
						data,
						format,
						value
					});
				}, (error) => {
					if (!controller.signal.aborted) setState({
						data,
						format,
						error: error instanceof Error ? error.message : "invalid"
					});
				});
				return () => {
					controller.abort();
				};
			}, [
				data,
				format,
				limits,
				attempt
			]);
			(0, react.useEffect)(() => {
				const element = workbookRef.current;
				if (element === null || typeof ResizeObserver === "undefined") return;
				const observer = new ResizeObserver(() => {
					window.dispatchEvent(new Event("resize"));
				});
				observer.observe(element);
				return () => {
					observer.disconnect();
				};
			}, [state]);
			if (data === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: ExcelBody_module_css_default.status,
				role: "alert",
				children: t("invalid")
			});
			if (state?.data !== data || state.format !== format) return loading;
			if ("error" in state) return (0, react_jsx_runtime.jsxs)("div", {
				className: ExcelBody_module_css_default.status,
				role: "alert",
				children: [(0, react_jsx_runtime.jsx)("span", { children: t(state.error === "tooLarge" || state.error === "timeout" || state.error === "encoding" ? state.error : "invalid") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: () => {
						setAttempt((value) => value + 1);
					},
					children: t("retry")
				})]
			});
			const hasFormulas = state.value.sheets.some((sheet) => sheet.celldata?.some((cell) => cell.v?.f !== void 0));
			return (0, react_jsx_runtime.jsxs)("section", {
				className: ExcelBody_module_css_default.body,
				"data-excel-preview": true,
				"aria-label": t("title"),
				children: [
					(0, react_jsx_runtime.jsx)("style", { children: scopedStyles }),
					state.value.unsupportedFeatures.length > 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: ExcelBody_module_css_default.notice,
						role: "note",
						"data-excel-unsupported-notice": true,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningTriangleOutlineRegular, { size: 16 }), (0, react_jsx_runtime.jsx)("span", { children: t("unsupportedNotice", { features: state.value.unsupportedFeatures.map((feature) => t(feature)).join(t("featureSeparator")) }) })]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						ref: workbookRef,
						className: `${ExcelBody_module_css_default.workbook} ${hasFormulas ? ExcelBody_module_css_default.withFormulaWarning : ""}`,
						children: [hasFormulas && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							portal: true,
							openOnClick: true,
							label: t("formulaWarning"),
							side: "bottom",
							delayMs: 500,
							children: (0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: ExcelBody_module_css_default.formulaWarning,
								"aria-label": t("formulaWarning"),
								"data-excel-formula-warning": true,
								children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningTriangleOutlineRegular, { size: 14 })
							})
						}), (0, react_jsx_runtime.jsx)(Workbook, {
							data: state.value.sheets,
							lang: t("language"),
							allowEdit: false,
							showToolbar: false,
							showFormulaBar: true,
							showSheetTabs: true,
							forceCalculation: false,
							cellContextMenu: ["copy"],
							headerContextMenu: [],
							sheetTabContextMenu: [],
							filterContextMenu: []
						}, `${attempt}:${t("language")}`)]
					})
				]
			});
		}
