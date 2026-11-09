// Extracted from @deepseek-ai/dsh-client-ui-message-feedback (lib/client.js); region lib/types/client/MessageFeedbackActions.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Per-message feedback controls: the Like/Dislike pair inside the assistant
* message's IconActions row, between copy and branch. Either rating opens the
* Session's feedback dialog, whose submission records that judgment with its
* category and text. Clicking the recorded rating retracts it. A recorded rating
* shows the filled glyph so the signal survives a pointer leaving the row.
* @module @deepseek-ai/dsh-client-ui-message-feedback/client/MessageFeedbackActions
*/
/**
* One message's feedback controls, rendered only while the current Peer may
* record message feedback in this Session.
* @param props - the owner's message identity, the injected verbs, the
* shared feedback hook, and the Session access Hook.
* @returns the rating buttons with any failure notice beside them, or nothing without access.
*/
function MessageFeedbackActions(props) {
	return props.useAccess("messageFeedback/put") ? (0, react_jsx_runtime.jsx)(FeedbackRatingButtons, { ...props }) : null;
}
function FeedbackRatingButtons({ messageId, ensure, current, retract, openDialog, useFeedback, t }) {
	const item = useFeedback((view) => view.items.get(messageId));
	const loadFailed = useFeedback((view) => view.status === "error");
	const rating = item?.rating;
	const [pending, setPending] = (0, react.useState)(false);
	const [failure, setFailure] = (0, react.useState)(null);
	const seeded = (0, react.useRef)(false);
	const seed = (0, react.useCallback)(() => {
		if (seeded.current) return;
		seeded.current = true;
		ensure();
	}, [ensure]);
	const alive = (0, react.useRef)(true);
	(0, react.useEffect)(() => () => {
		alive.current = false;
	}, []);
	const errorCopy = (0, react.useCallback)((result) => {
		return result.error.code === "version-conflict" ? t("error.conflict") : t("error.generic");
	}, [t]);
	const choose = (0, react.useCallback)((nextRating) => {
		setPending(true);
		setFailure(null);
		ensure().then((loaded) => {
			if (!alive.current) return;
			if (!loaded.ok || current(messageId)?.rating !== nextRating) {
				setPending(false);
				openDialog(messageId, nextRating);
				return;
			}
			retract(messageId, nextRating).then((result) => {
				if (!alive.current) return;
				setPending(false);
				if (!result.ok) setFailure(errorCopy(result));
			});
		});
	}, [
		current,
		ensure,
		errorCopy,
		messageId,
		openDialog,
		retract
	]);
	const onLike = (0, react.useCallback)(() => {
		choose("positive");
	}, [choose]);
	const onDislike = (0, react.useCallback)(() => {
		choose("negative");
	}, [choose]);
	const likeLabel = rating === "positive" ? t("action.likeActive") : t("action.like");
	const dislikeLabel = rating === "negative" ? t("action.dislikeActive") : t("action.dislike");
	return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
		(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
			label: likeLabel,
			side: "bottom",
			children: (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: MessageFeedbackActions_module_css_default.action,
				"aria-label": likeLabel,
				"aria-pressed": rating === "positive",
				"data-active": rating === "positive" || void 0,
				disabled: pending,
				onFocus: seed,
				onPointerEnter: seed,
				onClick: onLike,
				children: rating === "positive" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLikeFillRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconLikeOutlineRegular, {})
			})
		}),
		(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
			label: dislikeLabel,
			side: "bottom",
			children: (0, react_jsx_runtime.jsx)("button", {
				type: "button",
				className: MessageFeedbackActions_module_css_default.action,
				"aria-label": dislikeLabel,
				"aria-pressed": rating === "negative",
				"data-active": rating === "negative" || void 0,
				disabled: pending,
				onFocus: seed,
				onPointerEnter: seed,
				onClick: onDislike,
				children: rating === "negative" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDislikeFillRegular, {}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDislikeOutlineRegular, {})
			})
		}),
		failure === null && loadFailed && (0, react_jsx_runtime.jsx)("span", {
			className: MessageFeedbackActions_module_css_default.failure,
			role: "status",
			children: t("error.load")
		}),
		failure !== null && (0, react_jsx_runtime.jsx)("span", {
			className: MessageFeedbackActions_module_css_default.failure,
			role: "status",
			children: failure
		})
	] });
}
