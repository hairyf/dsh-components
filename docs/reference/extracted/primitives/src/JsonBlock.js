// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/JsonBlock.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const MAX_CHARS = 2e4;
function JsonBlock({ label, payload, defaultOpen = false, truncatedLabel }) {
	const [open, setOpen] = useState(defaultOpen);
	const body = useMemo(() => {
		if (!open) return "";
		let s;
		try {
			s = JSON.stringify(payload, null, 2) ?? String(payload);
		} catch {
			s = String(payload);
		}
		return s.length > MAX_CHARS ? `${s.slice(0, MAX_CHARS)}\n${truncatedLabel(s.length)}` : s;
	}, [
		open,
		payload,
		truncatedLabel
	]);
	return jsxs("div", {
		className: css$41.root,
		children: [jsxs("button", {
			type: "button",
			className: css$41.toggle,
			onClick: () => {
				setOpen((v) => !v);
			},
			children: [
				open ? "▾" : "▸",
				" ",
				label
			]
		}), open && jsx("pre", {
			className: css$41.body,
			children: body
		})]
	});
}
