// Extracted from @deepseek-ai/dsh-client-ui-theme (lib/client.js); region lib/types/client/styles.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const PLUGIN_ID = "@deepseek-ai/dsh-client-ui-theme";
		const HAIRLINE_WIDTH = "--dsh-hairline-width";
		const STYLES = [
			["base.css", base_css_default],
			["corner-shape.css", corner_shape_css_default],
			["design-platform.css", design_platform_css_default],
			["focus.css", focus_css_default],
			["onboarding.css", onboarding_css_default],
			["scrollbar.css", scrollbar_css_default],
			["gradient-shadow-text.css", gradient_shadow_text_css_default],
			["shiki.css", shiki_css_default]
		];
		/**
		* Mount global theme sheets; window-backed documents also publish the DPR-aware stroke width.
		* @param ctx - Owning plugin context.
		*/
		function installThemeStyles(ctx) {
			if (typeof document === "undefined") return;
			const view = document.defaultView;
			if (view !== null) ctx.effect(() => {
				const root = document.documentElement;
				const previousWidth = root.style.getPropertyValue(HAIRLINE_WIDTH);
				const previousPriority = root.style.getPropertyPriority(HAIRLINE_WIDTH);
				const matchMedia = typeof view.matchMedia === "function" ? view.matchMedia.bind(view) : void 0;
				let resolution;
				const updateStroke = () => {
					const dpr = view.devicePixelRatio;
					const width = Math.max(1, Math.floor(.5 * dpr)) / dpr;
					root.style.setProperty(HAIRLINE_WIDTH, `${width}px`);
					resolution?.removeEventListener("change", updateStroke);
					resolution = matchMedia?.(`(resolution: ${dpr}dppx)`);
					resolution?.addEventListener("change", updateStroke);
				};
				updateStroke();
				return () => {
					resolution?.removeEventListener("change", updateStroke);
					if (previousWidth === "") root.style.removeProperty(HAIRLINE_WIDTH);
					else root.style.setProperty(HAIRLINE_WIDTH, previousWidth, previousPriority);
				};
			}, "ui-theme: DPR-aware hairline width");
			for (const [name, css] of STYLES) ctx.effect(() => {
				const tag = document.createElement("style");
				tag.dataset.plugin = PLUGIN_ID;
				tag.dataset.pluginCss = `${PLUGIN_ID}/${name}`;
				tag.textContent = css;
				document.head.appendChild(tag);
				return () => {
					tag.remove();
				};
			}, `ui-theme: ${name} stylesheet`);
		}
