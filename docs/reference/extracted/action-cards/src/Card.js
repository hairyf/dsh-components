// Extracted from @deepseek-ai/dsh-client-ui-action-cards (lib/client.js); region lib/types/client/Card.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** The shared card frame below a completed answer: title, folded brief, and the kind's body or a dismiss-only fallback. */
/** Graphemes drawn about twice as wide as a Latin letter: CJK scripts, CJK punctuation and fullwidth forms. */
const WIDE_GRAPHEME = /^[\p{Script=Han}\p{Script=Hiragana}\p{Script=Katakana}\p{Script=Hangul}　-〿＀-｠￠-￦]/u;
/** Preview budget in Latin-letter widths, about two card lines at desktop width. */
const FOLD_WIDTH = 260;
/**
* Fold omitted text without measuring layout; a wide grapheme counts twice so Chinese and English fold near the
* same line. The full text is never altered.
* @param props - text and its localized toggle labels.
* @returns the paragraph and, when text was omitted, its toggle.
*/
function FoldedText({ text, expandLabel, collapseLabel }) {
	const id = (0, react.useId)();
	const [expanded, setExpanded] = (0, react.useState)(false);
	const preview = (0, react.useMemo)(() => {
		const compact = text.replace(/\s+/g, " ").trim();
		const characters = Array.from(new Intl.Segmenter(void 0, { granularity: "grapheme" }).segment(compact), (part) => part.segment);
		let width = 0;
		for (const [index, character] of characters.entries()) {
			width += WIDE_GRAPHEME.test(character) ? 2 : 1;
			if (width > FOLD_WIDTH) return characters.slice(0, index).join("").trimEnd() + "…";
		}
	}, [text]);
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
		id,
		className: Card_module_css_default.text,
		children: expanded || preview === void 0 ? text : preview
	}), preview !== void 0 && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
		variant: "ghost",
		size: "sm",
		className: Card_module_css_default.toggle,
		"aria-expanded": expanded,
		"aria-controls": id,
		onClick: () => {
			setExpanded((value) => !value);
		},
		children: expanded ? collapseLabel : expandLabel
	})] });
}
/** The projection admits at most one card per turn; should several exist, the lowest call id is shown. */
function proposalOf(view, turn) {
	let found;
	for (const proposal of Object.values(view?.proposals ?? {})) if (proposal.turn === turn && (found === void 0 || proposal.callId < found.callId)) found = proposal;
	return found;
}
function decisionOf(view, callId) {
	return view !== void 0 && Object.hasOwn(view.decisions, callId) ? view.decisions[callId] : void 0;
}
/**
* Place the card admitted in a turn after that turn's final answer, once the turn has ended with one.
* @param props - Turn location, projection reader, registered bodies and Session-bound actions.
* @returns the card, or null while the turn is open or when it ended without answer text.
*/
function ActionCardTail({ turn, useProjection, ...props }) {
	const view = useProjection("actionCards");
	const proposal = proposalOf(view, turn.turn);
	return proposal === void 0 || turn.end === void 0 || turn.data.get("turn-tail")?.closing == null ? null : (0, react_jsx_runtime.jsx)(ActionCard, {
		...props,
		proposal,
		decision: decisionOf(view, proposal.callId)
	});
}
/**
* Render the frame around one card.
* @param props - the card, its state, registered bodies and actions.
* @returns the card section.
*/
function ActionCard({ proposal, decision, sessionId, act, bind, useBodies, t }) {
	const body = useBodies((bodies) => bodies.get(proposal.action));
	const send = (0, react.useCallback)((verb, payload) => act(proposal.callId, verb, payload), [act, proposal.callId]);
	const summary = (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("strong", {
		className: Card_module_css_default.title,
		children: proposal.title
	}), (0, react_jsx_runtime.jsx)(FoldedText, {
		text: proposal.brief,
		expandLabel: t("expandBrief"),
		collapseLabel: t("collapseBrief")
	})] });
	const content = body === void 0 ? (0, react_jsx_runtime.jsx)(FallbackBody, {
		summary,
		decision,
		act: send,
		t
	}) : body.render({
		proposal,
		decision,
		sessionId,
		summary,
		Folded: FoldedText,
		act: send
	}, bind(body.locale));
	return (0, react_jsx_runtime.jsx)("section", {
		className: Card_module_css_default.card,
		"aria-label": proposal.title,
		"data-action-card": proposal.callId,
		"data-action": proposal.action,
		children: content
	});
}
/** Phases the fallback can name; other kind phases leave only the summary. */
const NAMED_PHASES = {
	dismissed: "dismissed",
	replaced: "replaced"
};
/** Title, brief and Not now for a card whose kind registered no body in this browser. */
function FallbackBody({ summary, decision, act, t }) {
	const [pending, setPending] = (0, react.useState)(false);
	const [error, setError] = (0, react.useState)();
	const phase = decision === void 0 || !Object.hasOwn(NAMED_PHASES, decision.phase) ? void 0 : NAMED_PHASES[decision.phase];
	const dismiss = async () => {
		setPending(true);
		setError(void 0);
		try {
			const result = await act("dismiss");
			if (result === void 0) setError("transport");
			else if (result.status === "refused" || result.status === "unconfirmed") setError("unavailable");
		} catch {
			setError("transport");
		} finally {
			setPending(false);
		}
	};
	return (0, react_jsx_runtime.jsxs)("div", {
		className: Card_module_css_default.body,
		children: [
			summary,
			phase !== void 0 && (0, react_jsx_runtime.jsx)("p", {
				role: "status",
				className: Card_module_css_default.status,
				children: t(phase)
			}),
			error !== void 0 && (0, react_jsx_runtime.jsx)("p", {
				role: "alert",
				className: Card_module_css_default.status,
				children: t(error)
			}),
			decision === void 0 && (0, react_jsx_runtime.jsx)("footer", {
				className: Card_module_css_default.footer,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					size: "sm",
					disabled: pending,
					onClick: () => {
						dismiss();
					},
					children: t("dismiss")
				})
			})
		]
	});
}
