// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/pdf/LazyPdfBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Load the PDF renderer only after a PDF body is mounted. */
const LoadedPdfBody = (0, react.lazy)(async () => ({ default: (await require.async("./client.pdf.js")).PdfBody }));
/**
* Suspend while the package-local PDF chunk arrives.
* @param props - PDF body props supplied by the document slot.
* @returns the deferred PDF renderer.
*/
function LazyPdfBody(props) {
	const loading = (0, react_jsx_runtime.jsx)(LoadingIndicator, { label: props.t("loading") });
	return (0, react_jsx_runtime.jsx)(react.Suspense, {
		fallback: loading,
		children: (0, react_jsx_runtime.jsx)(LoadedPdfBody, {
			...props,
			loading
		})
	});
}
