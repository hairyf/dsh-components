// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/html/HtmlBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Static or interactive HTML in an opaque iframe, without parent application access. */
		/** One mounted file owns its root Blob; replacing content also replaces the browsing context. */
		function HtmlFrame({ data, resourceAddress, readRelated, addResource, setResources, signal, frameName, t }) {
			const [frame, setFrame] = (0, react.useState)();
			(0, react.useEffect)(() => {
				const controller = new AbortController();
				const resources = /* @__PURE__ */ new Set();
				const readRelative = createReadHtmlRelative(readRelated, resourceAddress, signal, (address) => {
					resources.add(address);
					addResource(address);
				});
				let url;
				(async () => {
					try {
						const bundle = await packHtml(data, readRelative, controller.signal);
						controller.signal.throwIfAborted();
						const html = createHtmlDocument(bundle);
						url = URL.createObjectURL(new Blob([html], { type: "text/html" }));
						setFrame({
							data,
							readRelated,
							url
						});
					} catch {
						if (!controller.signal.aborted) setFrame({
							data,
							readRelated,
							url: void 0
						});
					} finally {
						if (!controller.signal.aborted && !signal.aborted) setResources([...resources]);
					}
				})();
				return () => {
					controller.abort();
					if (url !== void 0) URL.revokeObjectURL(url);
				};
			}, [
				data,
				readRelated,
				resourceAddress,
				addResource,
				setResources,
				signal
			]);
			if (frame?.data !== data || frame.readRelated !== readRelated) return (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") });
			if (frame.url === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: HtmlBody_module_css_default.status,
				role: "alert",
				children: t("failed")
			});
			return (0, react_jsx_runtime.jsx)("iframe", {
				name: frameName,
				className: HtmlBody_module_css_default.frame,
				src: frame.url,
				sandbox: "allow-scripts",
				title: t("frame"),
				"data-html-preview": true
			}, frame.url);
		}
		/**
		* Render complete HTML with the standard file and tab hooks.
		* @param props - document bytes, hooks, related-file reader and locale.
		* @returns an isolated HTML document, or nothing for text delivery.
		*/
		function HtmlBody({ content, resourceAddress, readRelated, useTabInfo, useInteractivePreview, addResource, setResources, t }) {
			const interactivePreview = useInteractivePreview((value) => value);
			const { tab } = useTabInfo();
			(0, react.useEffect)(() => {
				if (!interactivePreview) setResources([]);
			}, [interactivePreview, setResources]);
			if (content.kind !== "bytes") return null;
			const frameName = `dsh-sidebar-html-${tab.id}`;
			if (!interactivePreview) return (0, react_jsx_runtime.jsx)(BasicHtmlFrame, {
				data: content.data,
				frameName,
				t
			});
			return (0, react_jsx_runtime.jsx)(HtmlFrame, {
				data: content.data,
				resourceAddress,
				readRelated,
				signal: tab.signal,
				frameName,
				addResource,
				setResources,
				t
			}, resourceAddress);
		}
		/** Static preview mounts a separate browsing context so a mode change retires running scripts. */
		function BasicHtmlFrame({ data, frameName, t }) {
			const html = (0, react.useMemo)(() => {
				try {
					return createBasicHtmlDocument(data);
				} catch {
					return;
				}
			}, [data]);
			if (html === void 0) return (0, react_jsx_runtime.jsx)("p", {
				className: HtmlBody_module_css_default.status,
				role: "alert",
				children: t("failed")
			});
			return (0, react_jsx_runtime.jsx)("iframe", {
				name: frameName,
				className: HtmlBody_module_css_default.frame,
				srcDoc: html,
				sandbox: "",
				title: t("frame"),
				"data-html-preview": true
			});
		}
