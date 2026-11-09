// Extracted from @deepseek-ai/dsh-client-ui-sidebar-terminal (lib/client.terminal.js); region lib/types/client/terminal-theme.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const ansiKeys = [
			"black",
			"red",
			"green",
			"yellow",
			"blue",
			"magenta",
			"cyan",
			"white",
			"brightBlack",
			"brightRed",
			"brightGreen",
			"brightYellow",
			"brightBlue",
			"brightMagenta",
			"brightCyan",
			"brightWhite"
		];
		const specialKeys = [
			"foreground",
			"background",
			"cursor"
		];
		/** Keep program color overrides separate from the DSH defaults used by OSC resets. */
		var TerminalTheme = class {
			terminal;
			defaults = {};
			indexed = /* @__PURE__ */ new Map();
			special = /* @__PURE__ */ new Map();
			subscriptions;
			/**
			* Observe complete OSC commands without consuming xterm's queries or color handling.
			* @param terminal - opened emulator owned by the mounted screen.
			*/
			constructor(terminal) {
				this.terminal = terminal;
				const observe = (code, change) => terminal.parser.registerOscHandler(code, (data) => {
					change(data);
					return false;
				});
				this.subscriptions = [
					observe(4, (data) => {
						const parts = data.split(";");
						for (let i = 0; i + 1 < parts.length; i += 2) {
							const index = colorIndex(parts[i]);
							const color = oscColor(parts[i + 1]);
							if (index !== void 0 && color !== void 0) this.indexed.set(index, color);
						}
					}),
					observe(104, (data) => {
						if (data === "") this.indexed.clear();
						else for (const part of data.split(";")) {
							const index = colorIndex(part);
							if (index !== void 0) this.indexed.delete(index);
						}
						this.apply();
					}),
					...specialKeys.flatMap((key, offset) => [observe(10 + offset, (data) => {
						for (const [i, part] of data.split(";").entries()) {
							const target = specialKeys[offset + i];
							const color = oscColor(part);
							if (target !== void 0 && color !== void 0) this.special.set(target, color);
						}
					}), observe(110 + offset, () => {
						this.special.delete(key);
						this.apply();
					})])
				];
			}
			/**
			* Apply changed DSH colors without replacing application-defined palette entries.
			* @param background - resolved opaque DSH background.
			* @param foreground - resolved DSH text color.
			*/
			update(background, foreground) {
				if (this.defaults.background === background && this.defaults.foreground === foreground) return;
				this.defaults = {
					background,
					foreground,
					cursor: foreground,
					cursorAccent: background,
					selectionBackground: foreground,
					selectionForeground: background,
					selectionInactiveBackground: foreground
				};
				this.apply();
			}
			/** Preferred cursor color after the initial DSH update, including OSC 12 overrides. */
			get cursor() {
				return this.special.get("cursor") ?? this.defaults.cursor;
			}
			/** Remove parser observers before the emulator is disposed. */
			dispose() {
				for (const subscription of this.subscriptions) subscription.dispose();
			}
			apply() {
				const theme = {
					...this.defaults,
					...Object.fromEntries(this.special)
				};
				for (const [index, color] of this.indexed) if (index < ansiKeys.length) theme[ansiKeys[index]] = color;
				else (theme.extendedAnsi ??= [])[index - ansiKeys.length] = color;
				this.terminal.options.theme = theme;
			}
		};
		function colorIndex(value) {
			return /^\d+$/u.test(value) && Number(value) < 256 ? Number(value) : void 0;
		}
		function oscColor(value) {
			const rgb = /^rgb:([\da-f]{1,4})\/([\da-f]{1,4})\/([\da-f]{1,4})$/iu.exec(value);
			let channels;
			if (rgb !== null) {
				channels = rgb.slice(1);
				if (!channels.every((channel) => channel.length === channels[0].length)) return;
			} else {
				if (!/^#(?:[\da-f]{3}){1,4}$/iu.test(value)) return;
				const width = (value.length - 1) / 3;
				channels = [
					value.slice(1, width + 1),
					value.slice(width + 1, 2 * width + 1),
					value.slice(2 * width + 1)
				];
			}
			return `#${channels.map((channel) => {
				return (rgb === null ? Number.parseInt(channel.padEnd(2, "0").slice(0, 2), 16) : Math.round(Number.parseInt(channel, 16) * 255 / (16 ** channel.length - 1))).toString(16).padStart(2, "0");
			}).join("")}`;
		}
