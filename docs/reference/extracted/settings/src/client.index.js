// Extracted from @deepseek-ai/dsh-client-ui-settings (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Required services: the Remote namespace the mirror reads through and the
* forwarded settings invalidation it refreshes on.
*/
const inject = ["remote", "remote.settings"];
/** Provide shared forms and refresh them on document changes and reconnects.
* @param ctx Client provider context.
*/
function apply(ctx) {
	const schema = new SettingsSchemaService(ctx);
	const mirror = new SettingsDescribeMirror(ctx);
	ctx.effect(() => {
		const disposers = [ctx.remote.$on("settings/document-updated", () => {
			mirror.load();
		}), ctx.on("connection/reset", () => {
			mirror.load();
		})];
		mirror.ensure();
		return () => {
			for (const dispose of disposers) dispose();
		};
	}, "ui-settings: describe mirror invalidations");
	new ConfigForms(ctx, {
		mirror,
		schema
	});
}
