// Extracted from @deepseek-ai/dsh-client-ui-tool (lib/client.js); region lib/types/client/tool/components/ToolRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Keep a summary link click from toggling the row; the browser still follows the link. */
		function stopLinkClick(event) {
			event.stopPropagation();
		}
		/** Visually hidden run-state label for color-only running and settlement cues. */
		function stateStatus$1(state, t) {
			switch (state) {
				case "preparing": return t("row.preparing");
				case "running": return t("row.running");
				case "error": return t("row.failed");
				case "stopped": return t("row.stopped");
				default: return null;
			}
		}
		/**
		* Render one localized tool summary and lazily mounted result card.
		* Preparation retains the icon, title, and optional tool-name summary without disclosure.
		* @param props - tool state, summary, output, and navigation callbacks.
		* @returns the tool disclosure.
		*/
		const ToolRow = (0, react.memo)(function ToolRow({ t, variant, toolName, icon, title, summary, summarySuffix, bodyRaw, output, askQuestion, errorSummary, terminal, diff, read, image, renderSlot, loadImage, search, web, details, state, filePath, filePathLine, onOpenFile, fileContextMenuProps, urlContextMenuProps, href, inspect, useDisclosure }) {
			const { expanded, toggle: toggleExpand } = useDisclosure();
			const terminalLabels = (0, react.useMemo)(() => terminalBlockLabels(t), [t]);
			const diffLabels = (0, react.useMemo)(() => diffBlockLabels(t), [t]);
			const readLabels = (0, react.useMemo)(() => readBlockLabels(t), [t]);
			const searchLabels = (0, react.useMemo)(() => searchBlockLabels(t), [t]);
			const webLabels = (0, react.useMemo)(() => webBlockLabels(t), [t]);
			const terminalBody = (0, react.useMemo)(() => terminal === void 0 || terminal === null ? null : localizeTerminalCardModel(terminal, t), [terminal, t]);
			const diffBody = diff ?? null;
			const readBody = read ?? null;
			const imageBody = image !== void 0 && image !== null && renderSlot !== void 0 && loadImage !== void 0 ? image : null;
			const searchBody = search ?? null;
			const webBody = web ?? null;
			const askQuestionBody = askQuestion ?? null;
			const detailsBody = details ?? null;
			const inputRaw = bodyRaw ?? null;
			const outputText = output ?? null;
			const card = askQuestionBody ?? terminalBody ?? diffBody ?? readBody ?? imageBody ?? searchBody ?? webBody ?? detailsBody;
			const expandable = state !== "preparing" && (inputRaw !== null || outputText !== null || card !== null);
			const open = expanded && expandable;
			const bodyText = (0, react.useMemo)(() => open && card === null && inputRaw !== null ? formatToolBody(variant, inputRaw) : null, [
				card,
				inputRaw,
				open,
				variant
			]);
			const status = stateStatus$1(state, t);
			const running = state === "running" || state === "preparing";
			const normalSummary = terminalBody?.description ?? (open ? detailsBody?.expandedSummary ?? summary : summary);
			const exitLabel = terminalExitLabel(terminal, t);
			const summaryText = (state === "error" && exitLabel === null ? errorSummary ?? normalSummary : null) ?? normalSummary;
			const diffStat = (0, react.useMemo)(() => diffBody === null ? null : (0, _deepseek_ai_dsh_client_ui_primitives.diffTotals)(diffBody.card.diffs), [diffBody]);
			const settledWithCue = state === "error" || state === "stopped";
			const suffix = settledWithCue ? null : summarySuffix ?? null;
			const totals = settledWithCue ? null : diffStat;
			const openFile = (0, react.useMemo)(() => filePath !== void 0 && onOpenFile !== void 0 && !settledWithCue ? (event) => {
				event.stopPropagation();
				if (filePathLine === void 0) onOpenFile(filePath);
				else onOpenFile(filePath, { line: filePathLine });
			} : void 0, [
				filePath,
				filePathLine,
				onOpenFile,
				settledWithCue
			]);
			const linkHref = settledWithCue ? void 0 : href;
			const summaryLinkKeyDown = (0, react.useCallback)((event) => {
				if (event.key === "Enter" || event.key === " ") event.stopPropagation();
			}, []);
			const cardBody = variant === "code" ? null : bodyText;
			const collapsedContent = (0, react.useMemo)(() => summaryText !== "" && (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsx)("span", {
					className: ToolRow_module_css_default.sep,
					"data-shimmer-decoration": true,
					"aria-hidden": true
				}),
				exitLabel === null && openFile !== void 0 ? (0, react_jsx_runtime.jsx)("button", {
					type: "button",
					className: ToolRow_module_css_default.fileLink,
					...fileContextMenuProps,
					onClick: openFile,
					onKeyDown: (event) => {
						summaryLinkKeyDown(event);
						fileContextMenuProps?.onKeyDown?.(event);
					},
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}) : exitLabel === null && linkHref !== void 0 ? (0, react_jsx_runtime.jsx)("a", {
					className: ToolRow_module_css_default.fileLink,
					href: linkHref,
					...urlContextMenuProps,
					target: "_blank",
					rel: "noopener noreferrer",
					onClick: stopLinkClick,
					onKeyDown: (event) => {
						summaryLinkKeyDown(event);
						urlContextMenuProps?.onKeyDown?.(event);
					},
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}) : (0, react_jsx_runtime.jsx)("span", {
					className: clsx(ToolRow_module_css_default.summary, exitLabel === null && state === "error" && ToolRow_module_css_default.errorSummary, exitLabel === null && state === "stopped" && ToolRow_module_css_default.stoppedSummary),
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, { children: summaryText })
				}),
				exitLabel !== null && (0, react_jsx_runtime.jsx)(ExitCodeBadge, { label: exitLabel }),
				suffix !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					className: ToolRow_module_css_default.summarySuffix,
					children: suffix
				}),
				totals !== null && (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
					className: clsx(ToolRow_module_css_default.summarySuffix, ToolRow_module_css_default.diffStat),
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.diffAdded,
							children: `+${totals.added}`
						}),
						" ",
						(0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.diffRemoved,
							children: `-${totals.removed}`
						})
					]
				})
			] }), [
				summaryLinkKeyDown,
				fileContextMenuProps,
				urlContextMenuProps,
				linkHref,
				openFile,
				state,
				suffix,
				totals,
				summaryText,
				exitLabel
			]);
			const expandedContent = (0, react.useMemo)(() => open ? (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(ToolRow_module_css_default.bodyWrap, detailsBody !== null && ToolRow_module_css_default.detailsBodyWrap),
				children: [askQuestionBody !== null ? (0, react_jsx_runtime.jsx)(AskQuestionCard, { card: askQuestionBody }) : terminalBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
					...terminalBody.card,
					maxLines: Infinity,
					labels: terminalLabels,
					className: ToolRow_module_css_default.terminalBody
				}) : diffBody !== null ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DiffBlock, {
					...diffBody.card,
					labels: diffLabels,
					maxLines: 9,
					className: ToolRow_module_css_default.diffBody
				}), state === "error" && outputText !== null && (0, react_jsx_runtime.jsx)("div", {
					className: ToolRow_module_css_default.ioCard,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: ToolRow_module_css_default.ioSection,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.ioLabel,
							children: t("row.output")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.ioText,
							"data-error": true,
							children: outputText
						})]
					})
				})] }) : readBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ReadBlock, {
					...readBody,
					labels: readLabels,
					maxLines: 8,
					className: ToolRow_module_css_default.readBody
				}) : imageBody !== null ? (0, react_jsx_runtime.jsxs)("div", {
					className: ToolRow_module_css_default.imageBody,
					children: [
						renderSlot !== void 0 && loadImage !== void 0 && renderSlot("tool.call.images", {
							images: imageBody.images,
							loadImage,
							align: "start"
						}),
						(0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.imageMeta,
							children: [(0, react_jsx_runtime.jsx)("div", { children: imageBody.path }), imageBody.images.map(({ attachment }, index) => (0, react_jsx_runtime.jsx)("div", { children: attachment.originalDimensions === void 0 ? t("row.imageSize", {
								width: attachment.width,
								height: attachment.height,
								bytes: attachment.bytes
							}) : t("row.imageSizeDownscaled", {
								width: attachment.width,
								height: attachment.height,
								originalWidth: attachment.originalDimensions.width,
								originalHeight: attachment.originalDimensions.height,
								bytes: attachment.bytes
							}) }, index))]
						}),
						imageBody.extraText !== null && (0, react_jsx_runtime.jsx)("div", {
							className: ToolRow_module_css_default.imageExtra,
							children: imageBody.extraText
						})
					]
				}) : searchBody !== null ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SearchBlock, {
					...searchBody.card,
					labels: searchLabels,
					maxLines: 8,
					className: ToolRow_module_css_default.searchBody
				}), searchBody.recovery !== void 0 && (0, react_jsx_runtime.jsx)("div", {
					className: ToolRow_module_css_default.searchRecovery,
					children: searchBody.recovery
				})] }) : webBody !== null ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.WebBlock, {
					...webBody,
					labels: webLabels,
					className: ToolRow_module_css_default.webBody
				}) : detailsBody !== null ? (0, react_jsx_runtime.jsx)(ToolDetails, {
					model: detailsBody,
					hasInspect: inspect !== void 0,
					t,
					onOpenFile
				}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [variant === "code" && bodyText !== null && (0, react_jsx_runtime.jsx)("div", {
					className: ToolRow_module_css_default.bodyScroll,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.CodeBlock, {
						code: bodyText,
						lang: "typescript",
						copyLabel: t("copy"),
						copiedLabel: t("copied"),
						toolbarLabels: codeToolbarLabels(t),
						className: ToolRow_module_css_default.codeBody
					})
				}), (cardBody !== null || outputText !== null) && (0, react_jsx_runtime.jsxs)("div", {
					className: ToolRow_module_css_default.ioCard,
					children: [
						cardBody !== null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.input")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								children: cardBody
							})]
						}),
						cardBody !== null && outputText !== null && (0, react_jsx_runtime.jsx)("span", {
							className: ToolRow_module_css_default.ioDivider,
							"aria-hidden": true
						}),
						outputText !== null && (0, react_jsx_runtime.jsxs)("div", {
							className: ToolRow_module_css_default.ioSection,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioLabel,
								children: t("row.output")
							}), (0, react_jsx_runtime.jsx)("span", {
								className: ToolRow_module_css_default.ioText,
								"data-error": state === "error" || void 0,
								children: outputText
							})]
						})
					]
				})] }), inspect !== void 0 && (0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: ToolRow_module_css_default.inspectButton,
					onClick: inspect,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInspectOutlineRegular, {}), t("row.inspect")]
				})]
			}) : void 0, [
				open,
				detailsBody,
				askQuestionBody,
				terminalBody,
				terminalLabels,
				diffBody,
				diffLabels,
				readBody,
				readLabels,
				imageBody,
				renderSlot,
				loadImage,
				searchBody,
				searchLabels,
				webBody,
				webLabels,
				inspect,
				t,
				onOpenFile,
				variant,
				bodyText,
				cardBody,
				outputText,
				state
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: ToolRow_module_css_default.root,
				"data-variant": variant,
				"data-tool": toolName,
				"data-state": state,
				children: [status !== null && (0, react_jsx_runtime.jsx)("span", {
					className: ToolRow_module_css_default.visuallyHidden,
					children: status
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DisclosureRow, {
					rowClassName: ToolRow_module_css_default.row,
					leadingClassName: ToolRow_module_css_default.leading,
					titleClassName: ToolRow_module_css_default.title,
					icon,
					title,
					running,
					open,
					expandable,
					expandOnRowClick: true,
					keepContentWhenOpen: true,
					onToggle: toggleExpand,
					collapsedContent,
					children: expandedContent
				})]
			});
		});
