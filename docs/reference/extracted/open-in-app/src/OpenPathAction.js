// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/OpenPathAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** File association adapter for the shared file/directory opening control. */
/**
* Resolve file associations and adapt operations without embedding platform behavior in the control.
* @param props - verified file path, desktop query, native operations, and display variant.
* @returns the shared opening control, or null without a desktop.
*/
function FileOpenTarget(props) {
	const desktop = props.useOpenInAppDesktop((value) => value);
	const association = useFileApplications(props.absolutePath, props.applications, desktop === true);
	(0, react.useEffect)(() => {
		if (desktop === null) props.loadDesktop();
	}, [desktop, props.loadDesktop]);
	if (desktop !== true) return null;
	const { apps } = association;
	return (0, react_jsx_runtime.jsx)(OpenTargetButton, {
		kind: "file",
		applications: apps,
		defaultId: apps.find((app) => app.default)?.id,
		loading: association.loading,
		failed: association.failed,
		prominent: props.empty === true,
		t: props.t,
		refresh: association.refresh,
		report: props.report,
		execute: (operation) => props.openPath(props.absolutePath, operation.kind === "reveal" ? "reveal" : "open", operation.kind === "application" ? operation.id : void 0)
	}, props.absolutePath);
}
/**
* Render the file adapter in the document header.
* @param props - document owner inputs and injected opening capabilities.
* @returns the shared split button.
*/
function OpenPathAction(props) {
	return (0, react_jsx_runtime.jsx)(FileOpenTarget, { ...props });
}
