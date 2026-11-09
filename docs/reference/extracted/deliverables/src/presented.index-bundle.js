// Extracted from @deepseek-ai/dsh-client-ui-deliverables (lib/index.js); region lib/types/presented.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Authenticated POST route for opening a workspace file on the Host desktop. */
const PRESENT_OPEN_PATH = "/api/present.open";
/** Authenticated desktop availability and destination metadata. */
const PRESENT_HOST_PATH = "/api/present.host";
PRESENT_OPEN_PATH.slice(1);
PRESENT_HOST_PATH.slice(1);
/**
* Validate a file declaration read from a Session log.
* @param value - decoded durable data.
* @returns whether the declaration contains a path and optional description.
*/
function isPresentedFile(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const { path, description } = value;
	return typeof path === "string" && path.trim().length > 0 && (description === void 0 || typeof description === "string");
}
/**
* Validate a delivery event before reading its turn or file declarations.
* @param value - decoded durable event data.
* @returns whether the event identifies a turn, call, and file list.
*/
function isPresentedData(value) {
	if (typeof value !== "object" || value === null || Array.isArray(value)) return false;
	const { turn, callId, files } = value;
	return typeof turn === "number" && Number.isSafeInteger(turn) && turn >= 1 && typeof callId === "string" && callId.length > 0 && Array.isArray(files);
}
