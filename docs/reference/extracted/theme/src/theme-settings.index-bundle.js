// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/index.js); region lib/types/theme-settings.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Theme preferences stored in the Host user-settings document. */
/** Built-in preferences accepted at the registry and settings boundaries. */
const THEME_PREFERENCES = [
	"light",
	"dark",
	"system"
];
/** Settings namespace owned by the theme plugin. */
const THEME_SETTINGS_NAMESPACE = "ui-theme";
/** Field carrying the selected built-in theme preference. */
const THEME_PREFERENCE_FIELD = "preference";
/** Field carrying the conversation content font size. */
const FONT_SIZE_FIELD = "fontSize";
/** Default preference when the user-settings document has no override. */
const DEFAULT_PREFERENCE = "system";
/** Smallest accepted content font size (px). */
const FONT_SIZE_MIN = 10;
/** Largest accepted content font size (px). */
const FONT_SIZE_MAX = 22;
/** Content font size when the user-settings document has no override (px). */
const DEFAULT_FONT_SIZE = 14;
/** Independently configurable font roles. */
const FONT_ROLES = [
	"text",
	"code",
	"terminal"
];
/**
* Font sizes by role. `text` is the conversation content size; `code` is the
* code-block size (inline code stays 1px larger); `terminal` is the sidebar
* terminal cell font size.
*/
const FONT_SIZE_SPECS = {
	text: {
		field: FONT_SIZE_FIELD,
		variable: "--dsh-content-font-size",
		min: 10,
		max: 22,
		default: 14
	},
	code: {
		field: "codeFontSize",
		variable: "--dsh-code-font-size",
		min: 10,
		max: 16,
		default: 11
	},
	terminal: {
		field: "terminalFontSize",
		variable: "--dsh-terminal-font-size",
		min: 10,
		max: 20,
		default: 13
	}
};
/** Default font sizes by role. */
const DEFAULT_FONT_SIZES = Object.freeze({
	text: FONT_SIZE_SPECS.text.default,
	code: FONT_SIZE_SPECS.code.default,
	terminal: FONT_SIZE_SPECS.terminal.default
});
/** Settings field carrying each role's font-family list. */
const FONT_FAMILY_FIELDS = {
	text: "textFontFamily",
	code: "codeFontFamily",
	terminal: "terminalFontFamily"
};
/**
* Body variable carrying one role's normalized font list; the token sheet
* places it ahead of that role's built-in stack.
* @param kind - font role.
* @returns the CSS custom property name.
*/
function fontFamilyVariable(kind) {
	return `--dsh-font-family-${kind}`;
}
/**
* Integer px schema for one role's font size.
* @param spec - the role's range and default.
* @returns the validated number schema.
*/
function fontSizeSchema(spec) {
	return z.number().step(1).min(spec.min).max(spec.max).default(spec.default);
}
z.object({
	[THEME_PREFERENCE_FIELD]: z.union([...THEME_PREFERENCES]).default(DEFAULT_PREFERENCE),
	[FONT_SIZE_FIELD]: fontSizeSchema(FONT_SIZE_SPECS.text),
	[FONT_SIZE_SPECS.code.field]: fontSizeSchema(FONT_SIZE_SPECS.code),
	[FONT_SIZE_SPECS.terminal.field]: fontSizeSchema(FONT_SIZE_SPECS.terminal),
	[FONT_FAMILY_FIELDS.text]: z.string().default(""),
	[FONT_FAMILY_FIELDS.code]: z.string().default(""),
	[FONT_FAMILY_FIELDS.terminal]: z.string().default("")
});
/** CSS Fonts generic and system family keywords, which must stay unquoted. */
const GENERIC_FAMILIES = new Set([
	"serif",
	"sans-serif",
	"monospace",
	"cursive",
	"fantasy",
	"system-ui",
	"ui-serif",
	"ui-sans-serif",
	"ui-monospace",
	"ui-rounded",
	"emoji",
	"math",
	"fangsong",
	"-apple-system",
	"blinkmacsystemfont"
]);
/**
* Normalize user input into a CSS font-family list. Names are comma separated;
* quotes, backslashes, angle brackets, and control characters are dropped, and
* every non-generic name is double-quoted, so the result is always a valid list
* safe to embed in inline CSS and boot scripts. Normalizing a result returns it unchanged.
* @param value - user-entered or stored font list.
* @returns the normalized list, or `''` when no family name remains.
*/
function normalizeFontFamily(value) {
	return value.split(",").map((name) => name.replace(/["'\\<>\u0000-\u001f\u007f]/gu, "").replace(/\s+/gu, " ").trim()).filter((name) => name !== "").map((name) => GENERIC_FAMILIES.has(name.toLowerCase()) ? name : `"${name}"`).join(", ");
}
