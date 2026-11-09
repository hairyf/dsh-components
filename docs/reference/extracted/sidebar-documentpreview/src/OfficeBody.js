// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/office/OfficeBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Office presents retained conversion results and font notices around the shared PDF view. */
/**
* Load one Office revision and preserve its result while its tab remains open.
* @param props - renderer loading request, tab state, conversion callbacks, and PDF slot.
* @returns conversion status or the PDF scrollport.
*/
function OfficeBody(props) {
	const { tab } = props.useTabInfo();
	const { load, retainTab, resourceAddress, t } = props;
	const request = props.content.kind === "renderer" ? props.content : void 0;
	const revision = request?.revision;
	const held = props.useStore((state) => state.byTab[tab.id]);
	const view = held?.revision === revision ? held : void 0;
	const settled = view?.file !== void 0 || view?.failure !== void 0;
	(0, react.useEffect)(() => {
		retainTab(tab.id, tab.signal);
	}, [
		retainTab,
		tab.id,
		tab.signal
	]);
	(0, react.useEffect)(() => {
		if (request === void 0 || settled || tab.signal.aborted) return;
		const controller = new AbortController();
		const signal = AbortSignal.any([controller.signal, tab.signal]);
		load(tab.id, request.revision, hostFileOf(resourceAddress), signal, request.loaded, request.failed);
		return () => {
			controller.abort();
		};
	}, [
		revision,
		resourceAddress,
		tab.id,
		tab.signal,
		load,
		settled
	]);
	const file = view?.file;
	if (request === void 0) return null;
	if (view?.failure !== void 0) {
		const { name } = pathPartsOf(resourceAddress);
		return (0, react_jsx_runtime.jsxs)("div", {
			className: TextPreview_module_css_default.empty,
			"data-textpreview-failed": view.failure.code,
			children: [
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.FileTypeIcon, {
					kind: (0, _deepseek_ai_dsh_client_ui_primitives.classifyFileType)(name),
					size: 36
				}),
				(0, react_jsx_runtime.jsx)("p", {
					className: TextPreview_module_css_default.emptyLine,
					children: view.failure.message
				}),
				(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					size: "sm",
					onClick: request.reload,
					children: t("retry")
				})
			]
		});
	}
	if (file === void 0) return (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: t("loading") });
	return (0, react_jsx_runtime.jsx)("div", {
		className: OfficeBody_module_css_default.body,
		children: props.renderSlot("sidebar.right.tab.document.office.pdf", {
			resourceAddress,
			content: {
				kind: "bytes",
				data: file.data
			},
			wrap: props.wrap,
			scrollportRef: props.scrollportRef,
			addResource: props.addResource,
			setResources: props.setResources
		}, {
			entryKey: "@deepseek-ai/dsh-client-ui-sidebar-documentpreview/office",
			hookContext: props.useTabInfo
		})
	});
}
