// Extracted from @deepseek-ai/dsh-client-ui-shortcuts (lib/client.js); region lib/types/client/Editor.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Inline physical-key recording and revision-aware command editing. */
/**
* Save a released physical combination against the configuration the user reviewed.
* @param props - command, accepted snapshots, and storage/feedback callbacks.
* @returns inline command controls; failures retain the draft and allow another recording.
*/
function ShortcutEditor({ target, onClose, onSaved, onError, useCatalog, useConfig, useFixedCatalog, edit, recording, describeBinding, runtime, platform, t }) {
	const config = useConfig((value) => value);
	const catalog = useCatalog((value) => value);
	const fixed = useFixedCatalog((value) => value);
	const [revision, setRevision] = (0, react.useState)(config.revision);
	const [candidate, setCandidate] = (0, react.useState)(null);
	const [captured, setCaptured] = (0, react.useState)(false);
	const [busy, setBusy] = (0, react.useState)(false);
	const [nativeReady, setNativeReady] = (0, react.useState)(runtime === "web");
	const [message, setMessage] = (0, react.useState)("");
	const [retry, setRetry] = (0, react.useState)(null);
	const descriptionId = (0, react.useId)();
	const recorder = (0, react.useRef)(null);
	const mounted = (0, react.useRef)(true);
	const writing = (0, react.useRef)(false);
	/* v8 ignore next -- The effect installs reset before the recorder is enabled. */
	const restart = (0, react.useRef)(() => {});
	const desktopChords = runtime === "desktop" && (platform === "macos" || platform === "windows");
	const targetId = target.id;
	const stale = revision !== config.revision;
	const report = (text) => {
		setMessage(text);
		onError(text);
	};
	const save = async (operation, reviewedRevision = revision) => {
		if (writing.current) return;
		writing.current = true;
		setBusy(true);
		const result = await edit(operation, reviewedRevision);
		if (!mounted.current) return;
		writing.current = false;
		setBusy(false);
		if (result.status === "saved") onSaved();
		else {
			setRetry(operation.type === "set" ? operation.binding : null);
			report(shortcutFailure(result, [...catalog, ...fixed], t, runtime));
		}
	};
	const capture = (binding, id) => {
		setCandidate(binding);
		setCaptured(true);
		setRetry(null);
		const described = describeBinding(binding);
		const conflicts = described.conflicts.filter((value) => value !== id).map((value) => [...catalog, ...fixed].find((row) => row.id === value)?.label ?? value);
		if (described.issue !== null) {
			report(t(described.issue));
			return;
		}
		if (conflicts.length > 0) {
			report(t("conflict", { commands: conflicts.join(", ") }));
			return;
		}
		if (stale) {
			setRetry(binding);
			report(t("stale"));
			return;
		}
		if (config.status !== "ready") {
			report(config.status === "loading" ? t("not-ready") : shortcutReadFailure(config, runtime, t));
			return;
		}
		save({
			type: "set",
			id,
			binding
		});
	};
	const handlers = (0, react.useRef)({
		capture,
		report,
		onClose
	});
	(0, react.useLayoutEffect)(() => {
		handlers.current = {
			capture,
			report,
			onClose
		};
	});
	(0, react.useEffect)(() => {
		mounted.current = true;
		return () => {
			mounted.current = false;
		};
	}, []);
	(0, react.useEffect)(() => {
		let disposed = false;
		recording(true).then(() => {
			if (!disposed) setNativeReady(true);
		}, () => {
			if (!disposed) handlers.current.report(t("native-failed"));
		});
		const composition = (0, _deepseek_ai_dsh_client_ui_primitives.observeComposition)(document);
		let pending = null;
		let dead = false;
		let blocked = false;
		const held = /* @__PURE__ */ new Set();
		const reset = () => {
			pending = null;
			held.clear();
			blocked = false;
			dead = false;
		};
		restart.current = reset;
		const down = (event) => {
			if (composition.guards(event) || event.getModifierState("AltGraph")) {
				if (desktopChords) reset();
				return;
			}
			if ((!desktopChords || document.activeElement !== recorder.current) && event.key === "Escape" && !event.ctrlKey && !event.altKey && !event.metaKey && !event.shiftKey) {
				event.preventDefault();
				event.stopPropagation();
				if (!event.repeat && !writing.current) handlers.current.onClose();
				return;
			}
			const commandDeadKey = runtime === "web" && platform === "macos" && document.activeElement === recorder.current && event.code === "KeyN" && event.metaKey && event.altKey && !event.ctrlKey && !event.shiftKey;
			if (event.key === "Dead" && !commandDeadKey) {
				if (desktopChords) reset();
				dead = true;
				return;
			}
			if (dead) {
				dead = false;
				return;
			}
			const modifiers = [
				"control",
				"alt",
				"shift",
				"meta"
			].filter((value) => ({
				control: event.ctrlKey,
				alt: event.altKey,
				shift: event.shiftKey,
				meta: event.metaKey
			})[value]);
			const recordTab = desktopChords || (platform === "macos" || platform === "windows") && modifiers.length >= 3;
			if (document.activeElement !== recorder.current || event.key === "Tab" && !recordTab) return;
			event.preventDefault();
			event.stopPropagation();
			if (writing.current || event.repeat) return;
			if (/^(Control|Alt|Shift|Meta)(Left|Right)$/u.test(event.code)) {
				if (desktopChords && pending !== null) {
					reset();
					setCandidate(null);
					setCaptured(false);
				}
				return;
			}
			if (desktopChords) {
				held.add(event.code);
				if (blocked) return;
				if (held.size > 2) {
					blocked = true;
					pending = null;
					handlers.current.report(t("too-many-keys"));
					return;
				}
			}
			try {
				const codes = [event.code, ...desktopChords ? [...held].filter((value) => value !== event.code) : []];
				pending = describeBinding({
					code: codes[0],
					...codes[1] === void 0 ? {} : { secondCode: codes[1] },
					modifiers
				}).binding;
				setCandidate(pending);
				setCaptured(desktopChords);
				setMessage("");
				setRetry(null);
			} catch (_error) {
				blocked = desktopChords;
				pending = null;
				handlers.current.report(t("unsupported-key"));
			}
		};
		const up = (event) => {
			held.delete(event.code);
			if (desktopChords && document.activeElement === recorder.current) {
				event.preventDefault();
				event.stopPropagation();
			}
			const binding = pending !== null && (pending.code === event.code || pending.secondCode === event.code || pending.modifiers.some((modifier) => modifier === event.code.replace(/(Left|Right)$/u, "").toLowerCase())) ? pending : null;
			if (binding !== null) {
				pending = null;
				blocked = desktopChords;
			}
			if (desktopChords && (held.size === 0 || platform === "macos" && /^Meta(Left|Right)$/u.test(event.code))) {
				held.clear();
				blocked = false;
			}
			if (binding === null) return;
			handlers.current.capture(binding, targetId);
		};
		const blur = () => {
			reset();
			if (desktopChords) {
				setCandidate(null);
				setCaptured(false);
			}
		};
		const focus = () => {
			if (document.activeElement !== recorder.current) blur();
		};
		document.addEventListener("keydown", down, true);
		document.addEventListener("keyup", up, true);
		window.addEventListener("blur", blur);
		if (desktopChords) {
			document.addEventListener("focusin", focus, true);
			document.addEventListener("compositionstart", blur, true);
		}
		return () => {
			disposed = true;
			composition.dispose();
			document.removeEventListener("keydown", down, true);
			document.removeEventListener("keyup", up, true);
			window.removeEventListener("blur", blur);
			document.removeEventListener("focusin", focus, true);
			document.removeEventListener("compositionstart", blur, true);
			recording(false).catch(() => {});
		};
	}, [
		describeBinding,
		recording,
		t,
		targetId,
		runtime,
		platform,
		desktopChords
	]);
	(0, react.useEffect)(() => {
		const element = recorder.current;
		if (nativeReady && element !== null) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(element);
	}, [nativeReady]);
	const readonly = busy || stale || config.status !== "ready";
	const review = stale && (0, react_jsx_runtime.jsxs)("div", {
		className: Reference_module_css_default.review,
		children: [(0, react_jsx_runtime.jsx)("span", { children: t("stale") }), (0, react_jsx_runtime.jsx)("button", {
			type: "button",
			className: Reference_module_css_default.inlineAction,
			disabled: busy,
			onClick: () => {
				setRevision(config.revision);
				setMessage("");
			},
			children: t("review")
		})]
	});
	return (0, react_jsx_runtime.jsxs)("div", {
		className: Reference_module_css_default.inlineEditor,
		role: "group",
		"aria-label": target.label,
		"data-shortcut-modal": "shortcut-edit",
		"aria-busy": busy,
		children: [
			(0, react_jsx_runtime.jsxs)("div", {
				className: Reference_module_css_default.inlineControls,
				children: [
					(0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: Reference_module_css_default.inlineAction,
						disabled: readonly,
						onClick: () => {
							save({
								type: "reset",
								id: target.id
							});
						},
						children: t("reset")
					}),
					target.binding !== null && (0, react_jsx_runtime.jsx)("button", {
						type: "button",
						className: Reference_module_css_default.inlineAction,
						disabled: readonly,
						onClick: () => {
							save({
								type: "set",
								id: target.id,
								binding: null
							});
						},
						children: t("clear")
					}),
					(0, react_jsx_runtime.jsx)("button", {
						ref: recorder,
						type: "button",
						className: clsx(Reference_module_css_default.recorder, message && Reference_module_css_default.invalid),
						disabled: !nativeReady,
						"aria-disabled": busy || !nativeReady,
						onBlur: () => {
							restart.current();
						},
						"aria-label": t("record"),
						"aria-invalid": message !== "",
						"aria-describedby": descriptionId,
						onClick: () => {
							if (!writing.current) {
								restart.current();
								setCaptured(false);
								setMessage("");
								setRetry(null);
							}
						},
						children: captured && message === "" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.ShortcutKeys, {
							keys: describeBinding(candidate).keys,
							className: Reference_module_css_default.recorded
						}) : t("record")
					})
				]
			}),
			(0, react_jsx_runtime.jsx)("span", {
				id: descriptionId,
				className: Reference_module_css_default.srOnly,
				children: message || (desktopChords ? "" : t(runtime === "web" ? platform === "windows" ? "windows-web-help" : platform === "macos" ? "macos-web-help" : "web-help" : "record-help"))
			}),
			review,
			retry !== null && !stale && (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: Reference_module_css_default.inlineAction,
				disabled: readonly,
				onClick: () => {
					capture(retry, target.id);
				},
				children: t("retry-save")
			})
		]
	});
}
