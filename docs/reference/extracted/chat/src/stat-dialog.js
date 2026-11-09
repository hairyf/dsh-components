// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/stat-dialog.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Viewport margin the placement clamp keeps (the Menu portal margin). */
		const PANEL_MARGIN = 12;
		/** Distance between the trigger's top edge and the panel's bottom. */
		const PANEL_GAP = 8;
		/**
		* Unplaced portal panel: hidden but laid out so the clamp measures real
		* dimensions (the `useAnchoredPosition` measure pass).
		*/
		const MEASURE_STYLE = {
			visibility: "hidden",
			left: 0,
			top: 0
		};
		/**
		* One trigger-anchored dialog seat: open state, viewport-clamped placement, outside-close.
		* @returns the seat; spread `pos ?? MEASURE_STYLE` onto the portaled panel.
		*/
		function useStatDialog() {
			const [open, setOpen] = (0, react.useState)(false);
			const rootRef = (0, react.useRef)(null);
			const panelRef = (0, react.useRef)(null);
			const pos = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open,
				anchorRef: rootRef,
				panelRef,
				side: "top",
				gap: PANEL_GAP,
				margin: PANEL_MARGIN
			});
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(rootRef, open, setOpen, panelRef);
			(0, react.useEffect)(() => {
				if (!open) return;
				const onKeyDown = (e) => {
					if (e.key === "Escape") setOpen(false);
				};
				const onClick = (e) => {
					if (e.target instanceof Node && rootRef.current?.contains(e.target) !== true && panelRef.current?.contains(e.target) !== true) setOpen(false);
				};
				document.addEventListener("keydown", onKeyDown);
				document.addEventListener("click", onClick, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown);
					document.removeEventListener("click", onClick, true);
				};
			}, [open, setOpen]);
			return {
				open,
				setOpen,
				rootRef,
				panelRef,
				pos
			};
		}
