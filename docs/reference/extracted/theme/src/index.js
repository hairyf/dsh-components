// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/index.js); region lib/types/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Live theme and typography preferences. */
const Config = z.object({
	preference: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE).volatile(),
	fontSize: fontSizeSchema(FONT_SIZE_SPECS.text).volatile(),
	codeFontSize: fontSizeSchema(FONT_SIZE_SPECS.code).volatile(),
	terminalFontSize: fontSizeSchema(FONT_SIZE_SPECS.terminal).volatile(),
	textFontFamily: z.string().default("").volatile(),
	codeFontFamily: z.string().default("").volatile(),
	terminalFontFamily: z.string().default("").volatile()
});
/** Supply the current palette before browser plugins start.
* @param ctx Host plugin context.
* @param config Validated live theme preferences.
*/
function apply(ctx, config) {
	ctx.inject(["settings"], (child) => {
		child.effect(() => child.settings.configure({ auto: false }, ctx.fiber));
	});
	ctx.on("webserver/index-inject", (table) => {
		table.push(...bootThemeInjections(config.preference.get(), {
			text: config.fontSize.get(),
			code: config.codeFontSize.get(),
			terminal: config.terminalFontSize.get()
		}, {
			text: config.textFontFamily.get(),
			code: config.codeFontFamily.get(),
			terminal: config.terminalFontFamily.get()
		}));
	}, { prepend: true });
}
