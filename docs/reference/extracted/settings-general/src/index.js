// Extracted from @deepseek-ai/dsh-client-ui-settings-general (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Live welcome preference. */
const Config = z.object({ welcomeNoticeVersion: z.string().volatile() });
/** The browser consumes the configuration form projection.
* @param ctx Plugin context used for optional settings presentation.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
