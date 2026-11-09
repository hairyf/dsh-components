// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/use-clipboard-copy.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Clipboard writes with component-owned success feedback and cleanup. */
/**
* Keep clipboard feedback local to the mounted control and release its reset timer on unmount.
* @param text - Exact text to copy when the action is invoked.
* @returns Success feedback and a callback stable while text and feedback are unchanged.
*/
function useClipboardCopy(text) {
	const [copied, setCopied] = useState(false);
	const copyPending = useRef(false);
	const copyTimer = useRef(null);
	const copyEpoch = useRef(0);
	useEffect(() => () => {
		copyEpoch.current += 1;
		copyPending.current = false;
		if (copyTimer.current !== null) clearTimeout(copyTimer.current);
	}, []);
	return {
		copied,
		onCopy: useCallback(() => {
			if (copied || copyPending.current) return;
			const epoch = copyEpoch.current;
			copyPending.current = true;
			writeClipboard(text).then((ok) => {
				if (epoch !== copyEpoch.current) return;
				copyPending.current = false;
				if (!ok) return;
				setCopied(true);
				copyTimer.current = window.setTimeout(() => {
					copyTimer.current = null;
					setCopied(false);
				}, 1e3);
			});
		}, [copied, text])
	};
}
