// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/FileRouteAction.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

async function queryRoute(url, signal) {
	try {
		const response = await fetch(url, { signal });
		if (!response.ok) return null;
		return parseNativeFileApplications(await response.json());
	} catch (_error) {
		return null;
	}
}
/**
* Render file actions without bypassing the owning Session's authorization route.
* @param props - authenticated route, desktop availability, the native gesture
* callback, and the announcement seat its settled outcome is reported to.
* @returns the shared compact control, or null without a desktop.
*/
function FileRouteAction(props) {
	const association = useFileApplications(props.actionUrl, queryRoute, props.available);
	if (!props.available) return null;
	return (0, react_jsx_runtime.jsx)(OpenTargetButton, {
		kind: "file",
		applications: association.apps,
		defaultId: association.apps.find((app) => app.default)?.id,
		failed: association.failed,
		loading: association.loading,
		busy: props.pending,
		refresh: association.refresh,
		t: props.t,
		report: props.report,
		execute: (operation) => props.onAction(operation.kind === "reveal" ? "reveal" : "open", operation.kind === "application" ? operation.id : void 0)
	}, props.actionUrl);
}
