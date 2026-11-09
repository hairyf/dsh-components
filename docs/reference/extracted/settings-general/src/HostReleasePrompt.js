// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/client.js); region lib/types/client/HostReleasePrompt.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Confirmation shown when this page reconnects to a Host running another release. */
/**
* Name both ends of one release transition: their versions when those differ, otherwise their commits.
* @param from - release the transition starts at.
* @param to - release the transition ends at.
* @param unknown - text for a release or field the Host did not publish.
* @returns the start and end text.
*/
function transitionText(from, to, unknown) {
	const field = from?.version !== to?.version ? "version" : "commit";
	return [from?.[field] ?? unknown, to?.[field] ?? unknown];
}
/**
* One labelled transition line. A completed transition fades its start; a pending one fades its end.
* @param props - row label, both ends, and completion.
* @returns the row's cells for the shared transition grid.
*/
function Transition({ label, from, to, done }) {
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		(0, react_jsx_runtime.jsx)("span", {
			className: HostReleasePrompt_module_css_default.label,
			children: label
		}),
		(0, react_jsx_runtime.jsx)("span", {
			className: clsx(HostReleasePrompt_module_css_default.release, done ? HostReleasePrompt_module_css_default.faded : HostReleasePrompt_module_css_default.solid),
			children: from
		}),
		(0, react_jsx_runtime.jsx)("span", {
			"aria-hidden": "true",
			className: clsx(HostReleasePrompt_module_css_default.line, done ? HostReleasePrompt_module_css_default.done : HostReleasePrompt_module_css_default.pending)
		}),
		(0, react_jsx_runtime.jsx)("span", {
			className: clsx(HostReleasePrompt_module_css_default.release, done ? HostReleasePrompt_module_css_default.solid : HostReleasePrompt_module_css_default.faded),
			children: to
		})
	] });
}
/**
* Ask whether to reload after the Host changed releases; closing the dialog keeps the page.
* The service line shows the Host's completed switch from its previous release; the page line shows the
* switch from the page's boot release that only a reload completes.
* @param props - the release change, both decisions, and localized copy.
* @returns the dialog while a change is announced; otherwise nothing.
*/
function HostReleasePrompt({ useReleaseChange, dismissRelease, reloadPage, t }) {
	const change = useReleaseChange((value) => value);
	if (change === void 0) return null;
	const unknown = t("hostRelease.unknown");
	const [serviceFrom, serviceTo] = transitionText(change.previous, change.host, unknown);
	const [pageFrom, pageTo] = transitionText(change.page, change.host, unknown);
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
		open: true,
		title: t("hostRelease.title"),
		description: t("hostRelease.description"),
		closeLabel: t("hostRelease.later"),
		onClose: dismissRelease,
		className: clsx(HostReleasePrompt_module_css_default.dialog),
		footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "outline",
			"data-modal-autofocus": true,
			onClick: dismissRelease,
			children: t("hostRelease.later")
		}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
			variant: "primary",
			onClick: reloadPage,
			children: t("hostRelease.reload")
		})] }),
		children: (0, react_jsx_runtime.jsxs)("div", {
			className: HostReleasePrompt_module_css_default.transitions,
			children: [(0, react_jsx_runtime.jsx)(Transition, {
				label: t("hostRelease.service"),
				from: serviceFrom,
				to: serviceTo,
				done: true
			}), (0, react_jsx_runtime.jsx)(Transition, {
				label: t("hostRelease.page"),
				from: pageFrom,
				to: pageTo,
				done: false
			})]
		})
	});
}
