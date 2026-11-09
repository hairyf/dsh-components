// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ansi.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* The 8/16 basic ANSI colors, keyed by the whitespace-free `r,g,b` triple
* anser emits for them, mapped onto the theme tokens that carry the same
* semantic. Black and white both resolve to the primary label color so text
* stays legible under either theme instead of matching the surface it sits
* on; bright black takes the tertiary label color (the muted-gray role).
* Cyan and bright cyan take two static blues: the design system has no cyan,
* and anser's literal bright cyan is unreadable on the light theme's code
* surface. Magenta has no token equivalent and falls through to anser's
* literal rgb, as do all 256-palette and truecolor values.
*/
const TOKEN_BY_BASIC_RGB = {
	"0,0,0": "var(--dsw-alias-label-primary)",
	"255,255,255": "var(--dsw-alias-label-primary)",
	"85,85,85": "var(--dsw-alias-label-tertiary)",
	"187,0,0": "var(--dsw-alias-state-error-primary)",
	"255,85,85": "var(--dsw-alias-state-error-secondary)",
	"0,187,0": "var(--dsw-alias-state-success-primary)",
	"0,255,0": "var(--dsw-alias-state-success-secondary)",
	"187,187,0": "var(--dsw-alias-state-warn-primary)",
	"255,255,85": "var(--dsw-alias-state-warn-secondary)",
	"0,0,187": "var(--dsw-alias-state-business-primary)",
	"85,85,255": "var(--dsw-static-blue-400)",
	"0,187,187": "var(--dsw-static-blue-600)",
	"85,255,255": "var(--dsw-static-blue-500)"
};
/**
* CSS for each SGR attribute anser reports. `blink` is deliberately absent —
* animated text is not reproduced. `reverse` never arrives here: anser
* consumes it by swapping the run's foreground and background. Underline and
* strikethrough share `textDecoration`, so in a run declaring both, the
* later declaration wins.
*/
const STYLE_BY_DECORATION = {
	bold: { fontWeight: 700 },
	dim: { opacity: .7 },
	italic: { fontStyle: "italic" },
	underline: { textDecoration: "underline" },
	strikethrough: { textDecoration: "line-through" },
	hidden: { visibility: "hidden" }
};
/** OSC strings (window title, hyperlinks), with or without their terminator. */
const OSC_SEQUENCE = /\u001b\][^\u0007\u001b]*(?:\u0007|\u001b\\)?/g;
/** Escape sequences other than CSI: charset selection, single-shift, reset. */
const NON_CSI_ESCAPE = /\u001b(?!\[)[\u0020-\u002f]*[\u0030-\u007e]?/g;
/**
* C0 controls with no display meaning here. Tab, newline, backspace and ESC
* survive: the first two for layout, backspace for the cursor replay, ESC
* for anser's CSI split.
*/
const INERT_CONTROL = /[\u0000-\u0007\u000b-\u001a\u001c-\u001f\u007f]/g;
/**
* Lines whose cursor movements have to be replayed: a carriage return, a
* backspace, or an erase-in-line. The erase pattern matches the SAME CSI shape
* `replayLine` parses (parameters may carry `;` and intermediate bytes), so a
* form like `\x1b[1;2K` cannot slip past this guard and skip its own erase.
*/
const NEEDS_REPLAY = /\r|\u0008|\u001b\[[\u0030-\u003f]*[\u0020-\u002f]*K/;
/** SGR sequences alone, for folding state through a line that needs no replay. */
const SGR_SEQUENCE = /\u001b\[([\u0030-\u003f]*)[\u0020-\u002f]*m/g;
/** Terminal tab stop width; a tab advances to the next multiple of this. */
const TAB_WIDTH = 8;
/**
* Combining marks and other zero-width code points: a terminal advances no
* column for them, so `e` + U+0301 occupies one cell and a two-column redraw
* covers both code points.
*/
const ZERO_WIDTH = /^[\p{Mn}\p{Me}\p{Cf}\u200b-\u200f\u2060]$/u;
/**
* Characters a terminal advances two columns for: CJK scripts, fullwidth forms,
* CJK punctuation, and characters with emoji presentation. Text-presentation
* symbols (`\u2713`, `\u26a0` and the rest of U+2600-U+27BF) are ONE column and
* must stay out of this set.
*/
const WIDE_CHAR = /* @__PURE__ */ new RegExp("\\p{Script=Han}|\\p{Script=Hiragana}|\\p{Script=Katakana}|\\p{Script=Hangul}|\\p{Emoji_Presentation}|[\\uff01-\\uff60\\u3000-\\u303e]", "u");
/**
* Whether a character occupies two terminal columns (CJK, fullwidth forms,
* emoji). Covers the ranges a command's output realistically carries; a
* narrower guess would misalign the columns this card exists to preserve.
* @param char - one character from the output.
* @returns true when the terminal advances two columns for it.
*/
function isWide(char) {
	const code = char.codePointAt(0);
	if (code === void 0 || code < 4352) return false;
	return WIDE_CHAR.test(char);
}
/** The default state: no color, no attributes. */
const SGR_NONE = {
	fg: "",
	bg: "",
	attrs: []
};
/** Attribute closers, mapped to the opener parameters each one turns off. */
const ATTR_CLOSERS = {
	22: ["1", "2"],
	23: ["3"],
	24: ["4"],
	25: ["5", "6"],
	27: ["7"],
	28: ["8"],
	29: ["9"]
};
/**
* Fold one SGR sequence's parameters into the state it produces.
* @param state - state in force before the sequence.
* @param params - the sequence's raw parameter string (`31`, `1;4`, `38;5;208`).
* @returns the state the sequence leaves in force.
*/
function foldSgr(state, params) {
	const codes = params === "" ? ["0"] : params.split(";");
	let next = state;
	for (let index = 0; index < codes.length; index++) {
		const code = String(codes[index]);
		if (code === "" || code === "0") {
			next = SGR_NONE;
			continue;
		}
		if (code === "38" || code === "48") {
			const kind = codes[index + 1] ?? "";
			const span = kind === "2" ? 4 : kind === "5" ? 2 : 0;
			const value = codes.slice(index, index + span + 1).join(";");
			next = code === "38" ? {
				...next,
				fg: value
			} : {
				...next,
				bg: value
			};
			index += span;
			continue;
		}
		const closes = ATTR_CLOSERS[code];
		if (closes !== void 0) {
			next = {
				...next,
				attrs: next.attrs.filter((attr) => !closes.includes(attr))
			};
			continue;
		}
		const numeric = Number(code);
		if (code === "39") {
			next = {
				...next,
				fg: ""
			};
			continue;
		}
		if (code === "49") {
			next = {
				...next,
				bg: ""
			};
			continue;
		}
		if (numeric >= 30 && numeric <= 37 || numeric >= 90 && numeric <= 97) {
			next = {
				...next,
				fg: code
			};
			continue;
		}
		if (numeric >= 40 && numeric <= 47 || numeric >= 100 && numeric <= 107) {
			next = {
				...next,
				bg: code
			};
			continue;
		}
		if (!next.attrs.includes(code)) next = {
			...next,
			attrs: [...next.attrs, code]
		};
	}
	return next;
}
/**
* Render a state as the one canonical sequence that establishes it from the
* default, so a boundary emits a bounded string no matter how the state was
* reached.
* @param state - the state to open.
* @returns the SGR sequence, or the empty string for the default state.
*/
function openSgr(state) {
	const codes = [...state.attrs];
	if (state.fg !== "") codes.push(state.fg);
	if (state.bg !== "") codes.push(state.bg);
	return codes.length === 0 ? "" : `\u001b[${codes.join(";")}m`;
}
/** Whether two states are the same, so a boundary is only emitted on a change. */
function sameSgr(a, b) {
	return a.fg === b.fg && a.bg === b.bg && a.attrs.length === b.attrs.length && a.attrs.every((attr, index) => attr === b.attrs[index]);
}
/**
* Replay one line's cursor movements the way a terminal paints it, into a
* column buffer. Carriage return and backspace only MOVE the cursor — neither
* erases anything — so what a reader sees is whatever each column last had
* written to it. That distinction is the whole point of doing this as a buffer
* rather than as string surgery: `100%\rOK` shows `OK0%` because the redraw is
* shorter than the frame beneath it, and a trailing `abc\b` still shows `abc`
* because nothing ever overwrote the `c`.
*
* A CSI sequence occupies no column; it changes the state that the NEXT writes
* are stamped with, which is how a terminal stores color per cell. `red bad`
* then three backspaces then `ok` therefore shows `okd` with the `d` still red:
* `ok` overwrote two cells and the third kept the state it was written with.
* The columns are re-emitted as runs, so anser sees that same styling.
* @param line - one output line, still carrying its CSI sequences.
* @param entrySgr - SGR state in force when the line begins, since a newline
*   does not reset it.
* @returns the line as the terminal would have it after every movement, plus the
*   SGR state at its end for the next line to enter with.
*/
function replayLine(line, entrySgr) {
	const csi = /\u001b\[([\u0030-\u003f]*)[\u0020-\u002f]*([\u0040-\u007e])/g;
	/** Per column: the state in force when it was written, and its character. */
	const columns = [];
	let cursor = 0;
	let sgr = entrySgr;
	let at = 0;
	/** Clear a cell and, for a wide pair, its partner: a terminal erases both. */
	const clear = (index, fill) => {
		const cell = columns[index];
		if (cell?.spacer === true && index > 0) columns[index - 1] = {
			sgr,
			char: fill
		};
		else if (cell !== void 0 && isWide(cell.char) && columns[index + 1]?.spacer === true) columns[index + 1] = {
			sgr,
			char: fill
		};
		columns[index] = {
			sgr,
			char: fill
		};
	};
	const consume = (chunk) => {
		for (const char of chunk) {
			if (char === "\r") {
				cursor = 0;
				continue;
			}
			if (char === "\b") {
				cursor = Math.max(0, cursor - 1);
				continue;
			}
			if (char === "	") {
				const stop = cursor + TAB_WIDTH - cursor % TAB_WIDTH;
				for (; cursor < stop; cursor++) columns[cursor] ??= {
					sgr,
					char: " "
				};
				continue;
			}
			if (ZERO_WIDTH.test(char)) {
				const base = cursor > 0 ? columns[cursor - 1] : void 0;
				if (base !== void 0) columns[cursor - 1] = {
					sgr: base.sgr,
					char: base.char + char
				};
				continue;
			}
			clear(cursor, " ");
			columns[cursor] = {
				sgr,
				char
			};
			cursor++;
			if (isWide(char)) {
				columns[cursor] = {
					sgr,
					char: "",
					spacer: true
				};
				cursor++;
			}
		}
	};
	for (const match of line.matchAll(csi)) {
		consume(line.slice(at, match.index));
		at = match.index + match[0].length;
		const params = String(match[1]);
		const final = String(match[2]);
		if (final === "K") {
			const mode = String(params.split(";")[0]);
			if (mode === "1") for (let index = 0; index <= cursor; index++) clear(index, " ");
			else columns.length = mode === "2" ? 0 : cursor;
			continue;
		}
		if (final !== "m") continue;
		sgr = foldSgr(sgr, params);
	}
	consume(line.slice(at));
	let out = "";
	let active = entrySgr;
	for (let index = 0; index < columns.length; index++) {
		const column = columns[index] ?? {
			sgr: SGR_NONE,
			char: " "
		};
		if (!sameSgr(column.sgr, active)) {
			if (!sameSgr(active, SGR_NONE)) out += "\x1B[0m";
			out += openSgr(column.sgr);
			active = column.sgr;
		}
		const leadIntact = index > 0 && isWide(columns[index - 1]?.char ?? "");
		out += column.spacer === true && !leadIntact ? " " : column.char;
	}
	if (!sameSgr(active, sgr)) {
		if (!sameSgr(active, SGR_NONE)) out += "\x1B[0m";
		out += openSgr(sgr);
	}
	return {
		text: out,
		sgr
	};
}
/**
* Replay every line's cursor movements. A `\r` that only terminates a CRLF line
* is dropped first, so those lines keep their text instead of being redrawn onto
* themselves. SGR state threads across lines: a newline does not reset it, so a
* run opened before a redraw still colors the lines after it.
* @param text - output text, already free of OSC and non-CSI escapes.
* @returns the text with each line painted as the terminal would.
*/
function applyCursorMovements(text) {
	const replayed = [];
	let sgr = SGR_NONE;
	for (const raw of text.split("\n")) {
		const line = raw.replace(/\r+$/, "");
		if (NEEDS_REPLAY.test(line)) {
			const result = replayLine(line, sgr);
			replayed.push(result.text);
			sgr = result.sgr;
			continue;
		}
		replayed.push(line);
		for (const match of line.matchAll(SGR_SEQUENCE)) sgr = foldSgr(sgr, String(match[1]));
	}
	return replayed.join("\n");
}
/**
* Remove every escape sequence and control character that carries no color,
* leaving CSI sequences for anser and `\n`/`\t` for layout. Cursor movements
* (carriage return, backspace) replay first, since their effect on the visible
* text must land before the characters that expressed them are dropped.
* @param text - raw command output.
* @returns text whose only remaining escapes are CSI sequences.
*/
function sanitize(text) {
	return applyCursorMovements(text.replace(OSC_SEQUENCE, "").replace(NON_CSI_ESCAPE, "")).replace(INERT_CONTROL, "");
}
/**
* Resolve one run's colors and decorations.
* @param chunk - the anser chunk to style.
* @returns the run's inline style, or undefined when it carries no SGR state.
*/
function resolveStyle(chunk) {
	const style = {};
	const background = chunk.bg === null ? void 0 : `rgb(${chunk.bg})`;
	if (background !== void 0) style.backgroundColor = background;
	if (chunk.fg !== null) {
		const literal = `rgb(${chunk.fg})`;
		style.color = background === void 0 ? TOKEN_BY_BASIC_RGB[chunk.fg.replace(/\s+/g, "")] ?? literal : literal;
	}
	for (const decoration of chunk.decorations) Object.assign(style, STYLE_BY_DECORATION[decoration]);
	return Object.keys(style).length === 0 ? void 0 : style;
}
/**
* Parse command output into styled spans grouped by line.
* @param text - raw output text, which may contain ANSI escape sequences.
* @returns one entry per output line (always at least one, possibly empty).
*/
function parseAnsiLines(text) {
	let current = [];
	const lines = [current];
	for (const chunk of Anser.ansiToJson(sanitize(text), {
		json: true,
		remove_empty: true
	})) {
		const style = resolveStyle(chunk);
		for (const [index, part] of chunk.content.split("\n").entries()) {
			if (index > 0) {
				current = [];
				lines.push(current);
			}
			if (part !== "") current.push({
				text: part,
				style
			});
		}
	}
	return lines;
}
