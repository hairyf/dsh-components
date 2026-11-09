// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/TerminalBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Output lines shown before the height cap collapses the middle. */
const DEFAULT_TERMINAL_MAX_LINES = 16;
/**
* Prompt label for a working directory: `~` for the home directory itself,
* otherwise the path's last segment (both separators accepted, trailing
* separators ignored), falling back to the path itself when it has no
* segment.
* @param cwd - the working directory path.
* @param home - absolute home directory, when the caller knows it.
* @returns the prompt label.
*/
function promptLabel(cwd, home) {
	const trimmed = cwd.replace(/[/\\]+$/, "");
	if (home !== void 0 && trimmed === home.replace(/[/\\]+$/, "")) return "~";
	const segment = trimmed.split(/[/\\]/).pop();
	return segment === void 0 || segment === "" ? cwd : segment;
}
/**
* Status pill text for a settled command, or undefined when the command
* settled cleanly (exit 0, no signal) and needs no pill — the same
* distinction the bash tool's own exit-status markers draw.
* @param exitCode - settled exit code, when known; null when the command settled without one.
* @param signal - settled terminating signal name, when known.
* @param labels - display copy for the pill text.
* @returns the pill text, or undefined for a clean exit.
*/
function statusText(exitCode, signal, labels) {
	if (signal !== void 0) return labels.signal(signal);
	if (exitCode === null) return labels.noExitCode;
	if (exitCode !== void 0 && exitCode !== 0) return labels.exitCode(exitCode);
}
/**
* Run-state indicator for the command, shown at the head of the prompt line so
* the card states whether the command is still running without the reader
* having to infer it from the presence of output. Three of {@link StateDotState}'s
* five states are reachable: the running chase (the same
* indicator a running tool row's leading icon uses, so the row and its card
* never disagree), green for a clean settle, red for a signal or a non-zero
* exit — the same status distinction {@link statusText} draws for the pill. A
* settled command whose exit status never reached the view counts as a clean
* settle: the view says it finished and says nothing went wrong.
* @param running - the command has not settled.
* @param exitCode - settled exit code, when known; null when the command settled without one.
* @param signal - settled terminating signal name, when known.
* @param labels - display copy for the text label.
* @returns the dot's state and its text label, since the dot is aria-hidden.
*/
function runState(running, exitCode, signal, labels) {
	if (running) return {
		state: "ongoing",
		label: labels.running
	};
	if (statusText(exitCode, signal, labels) !== void 0) return {
		state: "error",
		label: labels.failed
	};
	return {
		state: "done",
		label: labels.done
	};
}
/**
* Render one parsed output line. Runs without SGR state render as bare text,
* so uncolored output carries no span wrappers.
* @param line - the line's styled runs.
* @returns the line's children.
*/
function renderLine$1(line) {
	return line.map((span, index) => span.style === void 0 ? span.text : jsx("span", {
		style: span.style,
		children: span.text
	}, index));
}
/**
* Render a shell command as a terminal surface.
* @param props - see {@link TerminalBlockProps}.
* @returns the terminal block element.
*/
function TerminalBlock({ command, cwd, home, output, exitCode, signal, running = false, background = false, maxLines = 16, copyText, runStateDot = true, className, labels }) {
	const copy = labels;
	const text = output ?? "";
	const lines = useMemo(() => {
		const parsed = parseAnsiLines(text);
		const last = parsed[parsed.length - 1];
		return parsed.length > 1 && last !== void 0 && last.every((span) => span.text === "") ? parsed.slice(0, -1) : parsed;
	}, [text]);
	const [expanded, setExpanded] = useState(false);
	const { copied, onCopy } = useClipboardCopy(copyText ?? text);
	const onToggle = useCallback(() => {
		setExpanded((value) => !value);
	}, []);
	const status = background ? void 0 : statusText(exitCode, signal, copy);
	const state = runState(running, exitCode, signal, copy);
	const showState = runStateDot && (!background || running);
	const commandLines = useMemo(() => {
		return (command.endsWith("\n") ? command.slice(0, -1) : command).split("\n");
	}, [command]);
	const empty = lines.every((line) => line.every((span) => span.text.trim() === ""));
	const { hidden, capped, headLines, tailLines } = headTailCap(lines.length, maxLines, expanded);
	const body = !background && (!running || !empty);
	return jsxs("div", {
		className: clsx(css$32.block, className),
		"data-terminal": "",
		"data-running": running ? "" : void 0,
		"data-body": body ? "" : void 0,
		children: [jsxs("div", {
			className: css$32.header,
			children: [
				jsxs("div", {
					className: css$32.prompt,
					children: [showState && jsx("span", {
						className: css$32.runStateLabel,
						children: state.label
					}), commandLines.map((line, index) => jsxs("div", {
						className: css$32.promptLine,
						children: [
							index === 0 && showState && jsx(StateDot, {
								state: state.state,
								className: css$32.runState
							}),
							jsx("span", {
								className: css$32.cwd,
								children: index > 0 || cwd === void 0 ? "$" : promptLabel(cwd, home)
							}),
							jsx(CommandText, {
								className: css$32.command,
								text: line,
								label: copy.commandLine(index + 1)
							})
						]
					}, index))]
				}),
				status !== void 0 && jsx(Pill, {
					className: css$32.status,
					children: status
				}),
				(copyText !== void 0 || !background && !running && !empty) && jsx("button", {
					type: "button",
					className: css$32.copyButton,
					onClick: onCopy,
					children: copied ? copy.copied : copy.copy
				})
			]
		}), body && (empty ? jsx("div", {
			className: css$32.empty,
			children: copy.noOutput
		}) : jsxs("div", {
			className: css$32.output,
			children: [
				(capped ? lines.slice(0, headLines) : lines).map((line, index) => jsx("div", {
					className: css$32.line,
					children: renderLine$1(line)
				}, index)),
				hidden > 0 && jsx("button", {
					type: "button",
					className: css$32.expand,
					"aria-expanded": expanded,
					"aria-label": expanded ? copy.collapseAria : copy.expandAria(hidden),
					onClick: onToggle,
					children: expanded ? copy.collapse : copy.expand(hidden)
				}),
				capped && lines.slice(lines.length - tailLines).map((line, index) => jsx("div", {
					className: css$32.line,
					children: renderLine$1(line)
				}, index))
			]
		}))]
	});
}
