// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.pdf.js); region lib/types/client/pdf/pdf.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** PDF page presentation; binary content and tab information come from the document owner. */
		const DEFAULT_PDF_VIEW = { page: 1 };
		const FIT_WIDTH = { kind: "fit-width" };
		/**
		* Present a PDF with tab-local viewing preferences and component-owned rendering resources.
		* @param props - complete bytes, framework-owned tab/store/locale seats, and main-bundle loading content.
		* @returns the PDF reader.
		*/
		function PdfBody(props) {
			const { tab } = props.useTabInfo();
			const view = props.useStore((state) => state.byTab[tab.id] ?? DEFAULT_PDF_VIEW);
			const data = props.content.kind === "bytes" ? props.content.data : void 0;
			const [load, setLoad] = (0, react.useState)();
			const [attempt, setAttempt] = (0, react.useState)(0);
			const [pageWidth, setPageWidth] = (0, react.useState)();
			const [renderZoom, setRenderZoom] = (0, react.useState)(1);
			const { retainTab, actions, t, ZoomViewport, zoomSurfaceClass } = props;
			const preference = view.zoom ?? FIT_WIDTH;
			const labels = {
				controls: t("zoomControls"),
				menu: t("zoomMenu"),
				out: t("zoomOut"),
				into: t("zoomIn"),
				fitWidth: t("zoomFitWidth"),
				value: (percent) => t("zoomValue", { percent })
			};
			const pageVisible = (0, react.useCallback)((page) => {
				actions.page(tab.id, page);
			}, [actions, tab.id]);
			const setPreference = (0, react.useCallback)((value) => {
				actions.zoom(tab.id, value);
			}, [actions, tab.id]);
			(0, react.useEffect)(() => {
				retainTab(tab.id, tab.signal);
			}, [
				retainTab,
				tab.id,
				tab.signal
			]);
			(0, react.useEffect)(() => {
				if (data === void 0 || tab.signal.aborted) return;
				const lifetime = new AbortController();
				const signal = AbortSignal.any([lifetime.signal, tab.signal]);
				setLoad(void 0);
				const session = openPdf(data, signal, (error) => {
					if (!signal.aborted) setLoad({
						kind: "failed",
						data,
						error
					});
				});
				session.document.then((document) => {
					if (!signal.aborted) setLoad({
						kind: "loaded",
						data,
						document
					});
				}, (error) => {
					if (!signal.aborted) setLoad({
						kind: "failed",
						data,
						error
					});
				});
				return () => {
					lifetime.abort();
					session.dispose();
				};
			}, [
				data,
				tab.signal,
				attempt
			]);
			if (data === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: PdfBody_module_css_default.status,
				role: "alert",
				children: t("unsupported")
			});
			if (load?.data !== data) return props.loading;
			if (load.kind === "failed") return (0, react_jsx_runtime.jsxs)("div", {
				className: PdfBody_module_css_default.status,
				role: "alert",
				children: [(0, react_jsx_runtime.jsx)("span", { children: failureText(load.error, t) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: () => {
						setAttempt((value) => value + 1);
					},
					children: t("retry")
				})]
			});
			const pages = (0, react_jsx_runtime.jsx)("section", {
				className: PdfBody_module_css_default.body,
				"data-pdf-preview": true,
				children: Array.from({ length: load.document.numPages }, (_, index) => (0, react_jsx_runtime.jsx)(PdfPage, {
					document: load.document,
					page: index + 1,
					requested: index === 0 || view.page === index + 1,
					onVisible: pageVisible,
					signal: tab.signal,
					onWidth: index === 0 ? setPageWidth : void 0,
					zoom: renderZoom,
					zoomSurfaceClass,
					t
				}, index))
			});
			return (0, react_jsx_runtime.jsx)(ZoomViewport, {
				preference,
				intrinsicWidth: pageWidth,
				horizontalInset: 24,
				labels,
				signal: tab.signal,
				scrollportRef: props.scrollportRef,
				onPreference: setPreference,
				onRenderZoom: setRenderZoom,
				children: pages
			});
		}
		function PdfPage({ document, page, requested: initiallyRequested, onVisible, signal, onWidth, zoom, zoomSurfaceClass, t }) {
			const host = (0, react.useRef)(null);
			const canvas = (0, react.useRef)(null);
			const text = (0, react.useRef)(null);
			const [width, setWidth] = (0, react.useState)();
			const [requested, setRequested] = (0, react.useState)(initiallyRequested);
			const [visible, setVisible] = (0, react.useState)(initiallyRequested);
			const renderedZoom = (0, react.useRef)();
			const pendingRender = (0, react.useRef)(Promise.resolve());
			const textTask = (0, react.useRef)();
			const [state, setState] = (0, react.useState)("loading");
			const [failure, setFailure] = (0, react.useState)();
			const [attempt, setAttempt] = (0, react.useState)(0);
			(0, react.useEffect)(() => {
				const node = state === "ready" ? canvas.current : host.current;
				if (typeof IntersectionObserver === "undefined") {
					setRequested(true);
					setVisible(true);
					return;
				}
				let disposed = false;
				const observer = new IntersectionObserver((entries) => {
					if (disposed) return;
					const intersects = entries.some((entry) => entry.isIntersecting);
					setVisible(intersects);
					if (!intersects) return;
					setRequested(true);
					onVisible(page);
				}, { rootMargin: "100% 0px" });
				observer.observe(node);
				return () => {
					disposed = true;
					observer.disconnect();
				};
			}, [
				page,
				onVisible,
				state
			]);
			(0, react.useEffect)(() => () => {
				textTask.current?.cancel();
			}, []);
			(0, react.useEffect)(() => {
				if (!requested) return;
				setFailure(void 0);
				if (renderedZoom.current !== void 0 && (!visible || renderedZoom.current === zoom)) return;
				const node = canvas.current;
				const lifetime = new AbortController();
				const renderSignal = AbortSignal.any([lifetime.signal, signal]);
				let newText;
				pendingRender.current = pendingRender.current.then(async () => {
					renderSignal.throwIfAborted();
					const buffer = node.ownerDocument.createElement("canvas");
					try {
						const size = await renderPdfPage(document, page, buffer, renderSignal, window.devicePixelRatio * zoom, textTask.current === void 0 ? (pdfPage, viewport) => {
							newText = pdfTextRenderer(text.current)(pdfPage, viewport);
							return newText;
						} : void 0);
						renderSignal.throwIfAborted();
						const context = node.getContext("2d");
						if (context === null) throw new Error("PDF canvas has no 2D context");
						node.width = buffer.width;
						node.height = buffer.height;
						node.style.setProperty("--pdf-page-width", `${size.width}px`);
						node.style.setProperty("--pdf-page-height", `${size.height}px`);
						context.drawImage(buffer, 0, 0);
						textTask.current ??= newText;
						newText = void 0;
						renderedZoom.current = zoom;
						setWidth(size.width);
						onWidth?.(size.width);
						setState("ready");
					} finally {
						buffer.width = buffer.height = 0;
						newText?.cancel();
					}
				}).catch((error) => {
					if (!renderSignal.aborted) setFailure({ error });
				});
				return () => {
					lifetime.abort();
					newText?.cancel();
				};
			}, [
				document,
				page,
				requested,
				visible,
				zoom,
				signal,
				attempt,
				onWidth
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				ref: host,
				className: PdfBody_module_css_default.page,
				"data-pdf-page": page,
				children: [
					failure === void 0 && state !== "ready" && (requested ? (0, react_jsx_runtime.jsx)("div", {
						className: PdfBody_module_css_default.placeholder,
						role: "status",
						"aria-label": t("rendering")
					}) : (0, react_jsx_runtime.jsx)("div", { className: PdfBody_module_css_default.placeholder })),
					failure !== void 0 && (0, react_jsx_runtime.jsxs)("div", {
						className: PdfBody_module_css_default.status,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)("span", { children: failureText(failure.error, t) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							onClick: () => {
								setAttempt((value) => value + 1);
							},
							children: t("retry")
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: `${PdfBody_module_css_default.surface} ${zoomSurfaceClass}`,
						"data-document-zoom-surface": true,
						style: { "--document-zoom-width": `${width ?? 0}px` },
						hidden: state !== "ready",
						children: [(0, react_jsx_runtime.jsx)("canvas", {
							ref: canvas,
							className: PdfBody_module_css_default.canvas,
							role: "img",
							"aria-label": t("pageImage", { page })
						}), (0, react_jsx_runtime.jsx)("div", {
							ref: text,
							className: PdfBody_module_css_default.text,
							"data-pdf-text": true
						})]
					})
				]
			});
		}
		function failureText(error, t) {
			if (error instanceof PdfWorkerFailure) return t("workerFailed");
			if (error instanceof Error && error.name === "PasswordException") return t("password");
			return t("failed", { message: error instanceof Error ? error.message : String(error) });
		}
