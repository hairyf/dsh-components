// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/AppearanceRow.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Appearance preference row registered into the General section item slot
* (figma 501:30012 'Frame 2117131228'): title + three preference cubes.
* Registered by this package — the theme feature owns its own settings
* surface. Selection follows the persisted preference, never the resolved
* active theme.
*/
/** Cube order and icons (figma 501:30015-30017: Light, Dark, System). */
const CUBES = [
	{
		id: "light",
		labelKey: "appearance.light",
		Icon: _deepseek_ai_dsh_client_ui_primitives.IconLightOutlineMedium
	},
	{
		id: "dark",
		labelKey: "appearance.dark",
		Icon: _deepseek_ai_dsh_client_ui_primitives.IconDarkOutlineMedium
	},
	{
		id: "system",
		labelKey: "appearance.system",
		Icon: _deepseek_ai_dsh_client_ui_primitives.IconFollowsystemOutlineMedium
	}
];
/**
* Render the Appearance row.
* @param props - composed slot props.
* @returns the row element tree.
*/
function AppearanceRow({ t, setTheme, useStore }) {
	const preference = useStore((s) => s.preference);
	return (0, react_jsx_runtime.jsxs)("div", {
		className: AppearanceRow_module_css_default.group,
		children: [(0, react_jsx_runtime.jsx)("div", {
			className: AppearanceRow_module_css_default.title,
			children: t("appearance.title")
		}), (0, react_jsx_runtime.jsx)("div", {
			className: AppearanceRow_module_css_default.cubeRow,
			children: CUBES.map(({ id, labelKey, Icon }) => (0, react_jsx_runtime.jsxs)("button", {
				type: "button",
				className: clsx(AppearanceRow_module_css_default.themeCube, preference === id && AppearanceRow_module_css_default.selected),
				"aria-pressed": preference === id,
				onClick: () => {
					setTheme(id);
				},
				children: [(0, react_jsx_runtime.jsx)(Icon, {}), t(labelKey)]
			}, id))
		})]
	});
}
