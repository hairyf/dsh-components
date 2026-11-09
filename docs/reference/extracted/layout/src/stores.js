// Extracted from @deepseek-ai/dsh-client-ui-layout (lib/client.js); region lib/types/client/stores.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Root-owned frame measurement, panel preferences, and presentation reports.
* The registration supplies a fresh store and binds its actions to ctx.layout.
*/
/**
* Create the layout panel store handle. For the sidebar the preference IS the
* width, so closing it forgets its drag width — reopening restores the contract
* default. The right panel initializes at 45% of the frame on first opening
* and keeps that px preference across resizes and close. Drag writes clamp to
* the current frame's range. Narrow sidebar toggles change only the expansion
* override; opening the right panel clears that override.
* @returns the store handle (spec + type + identity + factory in one).
*/
function createLayoutStore() {
	return (0, _deepseek_ai_dsh_client_store.defineStore)({
		init: () => ({
			panelInfo: { activePanelId: null },
			layoutInfo: {
				sidebar: 280,
				viewportWidth: window.innerWidth,
				narrowExpanded: false,
				rightbar: null,
				rightbarShown: false,
				rightbarTrack: false,
				rightbarFullscreen: false,
				rightbarInstant: false
			}
		}),
		actions: {
			selectPanel: (d, panelId) => {
				d.panelInfo.activePanelId = panelId;
				if (d.layoutInfo.viewportWidth < 768) d.layoutInfo.narrowExpanded = false;
			},
			retainMainPanels: (d, panelIds) => {
				if (d.panelInfo.activePanelId !== null && !panelIds.includes(d.panelInfo.activePanelId)) d.panelInfo.activePanelId = null;
			},
			setSidebar: (d, px) => {
				d.layoutInfo.rightbarInstant = false;
				d.layoutInfo.sidebar = clampWidth(px, 264, 420);
			},
			toggleSidebar: (d) => {
				d.layoutInfo.rightbarInstant = false;
				if (d.layoutInfo.viewportWidth < 1024) d.layoutInfo.narrowExpanded = !d.layoutInfo.narrowExpanded;
				else d.layoutInfo.sidebar = d.layoutInfo.sidebar === 0 ? 280 : 0;
			},
			setViewportWidth: (d, width) => {
				if (d.layoutInfo.viewportWidth === width) return;
				d.layoutInfo.rightbarInstant = false;
				if (d.layoutInfo.viewportWidth < 1024 !== width < 1024 || d.layoutInfo.viewportWidth < 768 !== width < 768) d.layoutInfo.narrowExpanded = false;
				d.layoutInfo.viewportWidth = width;
			},
			setRightbar: (d, px) => {
				d.layoutInfo.rightbarInstant = false;
				d.layoutInfo.rightbar = clampWidth(px, 300, Math.max(300, d.layoutInfo.viewportWidth * RIGHTBAR_MAX_RATIO));
			},
			openRightbar: (d, track, fullscreen) => {
				if (!d.layoutInfo.rightbarShown || d.layoutInfo.rightbarTrack !== track || d.layoutInfo.rightbarFullscreen !== fullscreen) d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen && !fullscreen;
				if (!d.layoutInfo.rightbarShown && d.layoutInfo.viewportWidth < 1024) d.layoutInfo.narrowExpanded = false;
				d.layoutInfo.rightbar ??= Math.max(300, Math.round(d.layoutInfo.viewportWidth * RIGHTBAR_DEFAULT_RATIO));
				d.layoutInfo.rightbarShown = true;
				d.layoutInfo.rightbarTrack = track;
				d.layoutInfo.rightbarFullscreen = fullscreen;
			},
			closeRightbar: (d) => {
				if (d.layoutInfo.rightbarShown) d.layoutInfo.rightbarInstant = d.layoutInfo.rightbarFullscreen;
				d.layoutInfo.rightbarShown = false;
				d.layoutInfo.rightbarTrack = false;
				d.layoutInfo.rightbarFullscreen = false;
			}
		}
	});
}
