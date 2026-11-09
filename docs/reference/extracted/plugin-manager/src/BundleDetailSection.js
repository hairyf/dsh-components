// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/BundleDetailSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** A bundle's long description on its page: the Markdown document the Host reads for it. */
const FAILURE_KEYS = {
	"too-large": "detailTooLarge",
	"network": "detailNetwork",
	"denied": "detailFailed",
	"git-unavailable": "detailFailed",
	"invalid": "detailInvalid",
	"other": "detailFailed"
};
/**
* Read and render a bundle's detail document in the active language; relative images load from the Host beside it.
* @param props - the bundle, the language, the reads, and the page's callbacks.
* @returns the section, or null when the bundle has no document.
*/
function BundleDetailSection(props) {
	const { name, version, fromNpm, language, details, t, load, retry, image } = props;
	const key = bundleDetailKey(name, version, language);
	const state = details[key];
	(0, react.useEffect)(() => {
		load(name, version, language, fromNpm);
	}, [key, details]);
	const labels = (0, _deepseek_ai_dsh_client_ui_primitives.useDetailDocumentLabels)({
		title: t("detailTitle"),
		loading: t("detailLoading"),
		retry: t("retry"),
		copy: t("copy"),
		copied: t("copied"),
		codeBlock: t("codeBlock.title"),
		wrap: t("codeBlock.wrap"),
		unwrap: t("codeBlock.unwrap"),
		footnotes: t("detailFootnotes")
	});
	const detail = state?.status === "ready" ? state.detail : void 0;
	const document = detail?.status === "found" ? detail.path : void 0;
	const images = (0, react.useMemo)(() => document === void 0 ? void 0 : { resolve: (value) => image(name, document, value, fromNpm) }, [
		name,
		document,
		fromNpm,
		image
	]);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DetailDocument, {
		state: (0, _deepseek_ai_dsh_client_ui_primitives.detailDocumentState)(state?.status === "error" ? {
			status: "error",
			message: t(FAILURE_KEYS[state.failure])
		} : state === void 0 || state.status === "loading" ? state : {
			status: "ready",
			markdown: detail?.status === "found" ? detail.markdown : void 0
		}),
		labels,
		images,
		onRetry: () => {
			retry(name, version, language, fromNpm);
		}
	});
}
