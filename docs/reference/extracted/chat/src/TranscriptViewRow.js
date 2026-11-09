// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/settings/TranscriptViewRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const LABELS = {
	compact: "settings.transcript.compact",
	standard: "settings.transcript.standard",
	detailed: "settings.transcript.detailed",
	verbose: "settings.transcript.verbose"
};
const COLLAPSE_LABELS = {
	completion: "settings.collapse.completion",
	"next-input": "settings.collapse.nextInput"
};
const FOLDED_REPLY_LABELS = {
	all: "settings.foldedReplies.all",
	final: "settings.foldedReplies.final"
};
/**
* Render the independent, Host-backed work-details, collapse-timing, and folded-reply selectors.
* Verbose never folds a Turn, so it omits the folded-reply selector.
* @param props - composed Settings slot props.
* @returns the preference row.
*/
function TranscriptViewRow({ useTranscriptView, setTranscriptView, useCollapseTiming, setCollapseTiming, useFoldedReplies, setFoldedReplies, t }) {
	const mode = useTranscriptView((value) => value);
	const timing = useCollapseTiming((value) => value);
	const replies = useFoldedReplies((value) => value);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		(0, react_jsx_runtime.jsx)(PreferenceRow, {
			title: t("settings.transcript.title"),
			description: t("settings.transcript.description"),
			value: mode,
			selectedLabel: t(LABELS[mode]),
			options: TRANSCRIPT_VIEW_MODES.map((id) => ({
				id,
				label: t(LABELS[id])
			})),
			onSelect: (value) => {
				setTranscriptView(value);
			}
		}),
		(0, react_jsx_runtime.jsx)(PreferenceRow, {
			title: t("settings.collapse.title"),
			description: t("settings.collapse.description"),
			value: timing,
			selectedLabel: t(COLLAPSE_LABELS[timing]),
			options: COLLAPSE_TIMINGS.map((id) => ({
				id,
				label: t(COLLAPSE_LABELS[id])
			})),
			onSelect: (value) => {
				setCollapseTiming(value);
			}
		}),
		mode !== "verbose" && (0, react_jsx_runtime.jsx)(PreferenceRow, {
			title: t("settings.foldedReplies.title"),
			description: t("settings.foldedReplies.description"),
			value: replies,
			selectedLabel: t(FOLDED_REPLY_LABELS[replies]),
			options: FOLDED_REPLIES.map((id) => ({
				id,
				label: t(FOLDED_REPLY_LABELS[id])
			})),
			onSelect: (value) => {
				setFoldedReplies(value);
			}
		})
	] });
}
