// Extracted from @deepseek-ai/dsh-client-ui-brand-official (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Required service: the UI slot registry. */
const inject = ["slots"];
/**
* Fill the sidebar brand slots as one declaration-aware registration set. The
* conversation hero stays on its declaring package's animated fish fallback,
* so the official build registers nothing there.
* @param ctx - Client root context.
*/
function apply(ctx) {
	ctx.slots.inject("sidebar.brand.mark", () => ctx.slots.inject("sidebar.brand.name", function* () {
		yield ctx.slots.register({ name: "sidebar.brand.mark" }, OfficialBrandMark);
		yield ctx.slots.register({ name: "sidebar.brand.name" }, OfficialBrandName);
	}));
}
