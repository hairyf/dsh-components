// Extracted from @deepseek-ai/dsh-client-ui-layout (lib/client.js); module-level code outside any region.
// Compiled bundle code copied verbatim from the bundle; imports are hoisted in the original bundle, so this file is not standalone.

/** Viewport width below which the sidebar auto-collapses to the rail (deepsuite
		* LG breakpoint); a manual toggle below it re-expands over the squeezed center
		* (stores.ts narrowExpanded). */
		const SIDEBAR_AUTO_COLLAPSE = 1024;
		/** Maximum normal right panel width as a fraction of the frame. */
		const RIGHTBAR_MAX_RATIO = .7;
		/** First-open right panel preference as a fraction of the frame. */
		const RIGHTBAR_DEFAULT_RATIO = .45;
		/**
		* Clamp a panel width into its contract range.
		* @param px - requested width.
		* @param min - range lower bound.
		* @param max - range upper bound.
		* @returns the clamped width.
		*/
		function clampWidth(px, min, max) {
			return Math.min(max, Math.max(min, Math.round(px)));
		}
		/**
		* Solve the three column widths for one viewport frame.
		* @param viewport - available frame width in px.
		* @param sidebar - sidebar width preference in px (0 = closed).
		* @param rightbar - requested right panel width in px (0 = no track).
		* @param collapsedWidth - track width of the closed sidebar; the default keeps
		*   the icon rail, 0 hides the column entirely (macOS desktop).
		* @param centeredSidebar - place an expanded sidebar's edge at the frame midpoint.
		* @returns actual widths after shrinking or removing the right track; only
		*   without that track may the center fall below its minimum, down to zero.
		*/
		function computeColumns(viewport, sidebar, rightbar, collapsedWidth = 56, centeredSidebar = false) {
			const s = sidebar === 0 ? collapsedWidth : centeredSidebar ? viewport / 2 : clampWidth(sidebar, 264, 420);
			const available = viewport - s - 400;
			const r = rightbar === 0 || available < 300 ? 0 : Math.min(available, clampWidth(rightbar, 300, viewport * RIGHTBAR_MAX_RATIO));
			return {
				sidebar: s,
				center: Math.max(0, viewport - s - r),
				rightbar: r
			};
		}
