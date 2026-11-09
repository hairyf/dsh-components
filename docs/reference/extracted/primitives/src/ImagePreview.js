// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ImagePreview.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Passive, contained image preview for Markdown image links. */
/**
* Render an image without introducing a second activation target.
* @param props - Source, accessible description, localized status.
* @returns A contained preview with loading or failure status.
*/
function ImagePreview({ src, alt, loadingLabel, failedLabel }) {
	return jsx(Preview, {
		src,
		alt,
		loadingLabel,
		failedLabel
	}, src);
}
function Preview({ src, alt, loadingLabel, failedLabel }) {
	const [state, setState] = useState("loading");
	return jsxs("span", {
		className: css$39.frame,
		children: [state !== "failed" && jsx("img", {
			src,
			alt,
			loading: "lazy",
			decoding: "async",
			referrerPolicy: "no-referrer",
			className: css$39.image,
			"data-ready": state === "ready" || void 0,
			onLoad: () => {
				setState("ready");
			},
			onError: () => {
				setState("failed");
			}
		}), state !== "ready" && jsxs("span", {
			className: css$39.status,
			role: "status",
			children: [state === "loading" && jsx(IconLoadingOutlineRegular, { size: 16 }), jsx("span", { children: state === "loading" ? loadingLabel : failedLabel })]
		})]
	});
}
