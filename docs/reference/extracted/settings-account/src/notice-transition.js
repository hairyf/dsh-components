// Extracted from @deepseek-ai/dsh-client-ui-settings-account (lib/client.js); region lib/types/client/notice-transition.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Animate a notification promotion across the old and new card dimensions. */
		/**
		* Close a card and animate surviving siblings from their currently displayed rectangles.
		* @param card - mounted foreground card whose direct parent owns the stack.
		* @param dismiss - synchronous notification-store update for the close gesture.
		*/
		function dismissNotice(card, dismiss) {
			if (typeof card.animate !== "function" || getComputedStyle(card).transitionDuration === "0s") {
				dismiss();
				return;
			}
			const before = [...card.parentElement.querySelectorAll("aside")].map((element) => ({
				element,
				rect: element.getBoundingClientRect()
			}));
			for (const { element } of before) {
				for (const animation of element.getAnimations()) animation.cancel();
				element.style.transition = "none";
			}
			(0, react_dom.flushSync)(dismiss);
			for (const { element, rect } of before) {
				if (!element.isConnected) continue;
				const transform = getComputedStyle(element).transform;
				element.style.transform = "none";
				const next = element.getBoundingClientRect();
				element.style.transform = "";
				element.animate([{ transform: `translate(${rect.x + rect.width / 2 - next.x - next.width / 2}px, ${rect.y - next.y}px) scale(${rect.width / next.width}, ${rect.height / next.height})` }, { transform }], {
					duration: 250,
					easing: "ease-out"
				});
				element.style.transition = "";
			}
		}
