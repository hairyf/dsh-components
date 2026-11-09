// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.terminal.js); region lib/types/client/terminal-cursor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Keep the cursor visible on default, indexed, true-color and inverse cell backgrounds.
		* @param terminal - opened DOM-rendered emulator.
		* @param node - screen root containing the emulator and scoped cursor CSS variables.
		* @param preferredCursor - current DSH or application cursor color.
		* @returns listener disposer; no terminal input or palette changes are emitted.
		*/
		function observeTerminalCursor(terminal, node, preferredCursor) {
			return terminal.onRender(() => {
				const cursor = node.querySelector(".xterm-cursor");
				if (cursor === null) return;
				cursor.classList.remove("xterm-cursor");
				let background;
				let foreground;
				try {
					const style = getComputedStyle(cursor);
					foreground = style.color;
					background = opaqueColor(style.backgroundColor, () => getComputedStyle(node.querySelector(".xterm-scrollable-element")).backgroundColor);
				} finally {
					cursor.classList.add("xterm-cursor");
				}
				const preferred = opaqueColor(preferredCursor(), () => background);
				const backgroundLuminance = luminance(background);
				const preferredLuminance = luminance(preferred);
				const fill = (Math.max(backgroundLuminance, preferredLuminance) + .05) / (Math.min(backgroundLuminance, preferredLuminance) + .05) >= 3 ? preferred : backgroundLuminance > .179 ? "#000000" : "#ffffff";
				node.style.setProperty("--terminal-cursor", fill);
				node.style.setProperty("--terminal-cursor-accent", luminance(fill) > .179 ? "#000000" : "#ffffff");
				node.style.setProperty("--terminal-cursor-cell-background", background);
				node.style.setProperty("--terminal-cursor-cell-foreground", foreground);
			});
		}
		function luminance(color) {
			const [r, g, b] = colorChannels(color).map((channel) => {
				const value = channel / 255;
				return value <= .04045 ? value / 12.92 : ((value + .055) / 1.055) ** 2.4;
			});
			return .2126 * r + .7152 * g + .0722 * b;
		}
		function colorChannels(color) {
			return color.startsWith("#") ? [
				color.slice(1, 3),
				color.slice(3, 5),
				color.slice(5, 7)
			].map((value) => Number.parseInt(value, 16)) : color.match(/[\d.]+/gu).map(Number);
		}
		function opaqueColor(color, background) {
			const channels = colorChannels(color);
			const alpha = channels[3] ?? 1;
			if (alpha === 1) return color;
			const surface = colorChannels(background());
			return `rgb(${channels.slice(0, 3).map((channel, index) => Math.round(channel * alpha + surface[index] * (1 - alpha))).join(", ")})`;
		}
