// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Live preferences projected to the browser. */
const Config = z.object({ [BUSY_ENTER_FIELD]: ConversationSettingsFields[BUSY_ENTER_FIELD].volatile() });
/** Host preferences are consumed through the configuration form projection.
* @param ctx Plugin context used for optional settings presentation.
*/
function apply(ctx) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
}
