// Extracted from @deepseek-ai/dsh-client-ui-plugin-market (lib/client.js); region lib/types/client/PluginDetailSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** A market entry's long description: the Markdown document the Host reads for one listed version. */
const FAILURE_KEYS$1 = {
	"too-large": "detailTooLarge",
	"network": "detailNetwork",
	"denied": "detailDenied",
	"git-unavailable": "detailGitUnavailable",
	"invalid": "detailInvalid",
	"other": "detailFailed"
};
/**
* Read and render an entry version's detail document in the active language. Relative images load from the Host beside
* the document.
* @param props - the entry version, the dictionary, and the injected detail reads.
* @returns the section, or null when the version has no document.
*/
function PluginDetailSection(props) {
	const { request, t, loadDetail, retryDetail, detailImage } = props;
	const language = props.useLocale((snapshot) => snapshot.active);
	const key = detailKey(request, language);
	const state = props.useDetails((details) => details[key]);
	const missing = state === void 0;
	(0, react.useEffect)(() => {
		if (missing) loadDetail(request, language);
	}, [key, missing]);
	const labels = (0, _deepseek_ai_dsh_client_ui_primitives.useDetailDocumentLabels)({
		title: t("detailTitle"),
		loading: t("detailLoading"),
		retry: t("retry"),
		copy: t("copy"),
		copied: t("copied"),
		codeBlock: t("codeBlock.title"),
		wrap: t("codeBlock.wrap"),
		unwrap: t("codeBlock.unwrap"),
		footnotes: t("footnotes")
	});
	const detail = state?.status === "ready" ? state.detail : void 0;
	const document = detail?.status === "found" ? detail.document : void 0;
	const images = (0, react.useMemo)(() => document === void 0 ? void 0 : { resolve: (value) => detailImage(document, value) }, [document, detailImage]);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.DetailDocument, {
		state: (0, _deepseek_ai_dsh_client_ui_primitives.detailDocumentState)(state?.status === "error" ? {
			status: "error",
			message: t(FAILURE_KEYS$1[state.failure])
		} : state === void 0 || state.status === "loading" ? state : {
			status: "ready",
			markdown: detail?.status === "found" ? detail.markdown : void 0
		}),
		labels,
		images,
		onRetry: () => {
			retryDetail(request, language);
		}
	});
}
