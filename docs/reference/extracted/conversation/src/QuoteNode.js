// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/QuoteNode.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

const EMPTY_LABELS = { remove: "" };
/** Remove one quote occurrence by its Lexical identity. */
const REMOVE_QUOTE_COMMAND = Pe$2("REMOVE_QUOTE_COMMAND");
/** Pure React face of one quote node. */
function QuoteNodeView({ editor, nodeKey, text, labels }) {
	return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.QuotePreview, {
		text,
		removal: {
			label: labels.remove,
			onRemove: () => {
				editor.dispatchCommand(REMOVE_QUOTE_COMMAND, nodeKey);
			}
		}
	});
}
/** One selected transcript range represented as an atomic inline decorator. */
var QuoteNode = class QuoteNode extends Li {
	__text;
	__labels;
	/** Lexical node registry type tag. */
	static getType() {
		return "quote";
	}
	/** @param node - node to clone. @returns a copy carrying the same NodeKey. */
	static clone(node) {
		return new QuoteNode(node.__text, node.__labels, node.__key);
	}
	/** @param json - serialized editor node. @returns a fresh node with default runtime labels. */
	static importJSON(json) {
		return new QuoteNode(json.text);
	}
	/**
	* @param text - selected text.
	* @param labels - runtime-only localized labels.
	* @param key - Lexical clone-path key; absent for fresh nodes.
	*/
	constructor(text, labels = EMPTY_LABELS, key) {
		super(key);
		this.__text = text;
		this.__labels = labels;
	}
	/** Serialize the quote data without its runtime presentation state. */
	exportJSON() {
		return {
			...super.exportJSON(),
			type: "quote",
			version: 1,
			text: this.__text
		};
	}
	/** Mount one non-editable inline host. */
	createDOM(_config) {
		const element = document.createElement("span");
		element.setAttribute("data-composer-quote", "");
		element.setAttribute("contenteditable", "false");
		return element;
	}
	/** Updates reuse the existing host element. */
	updateDOM() {
		return false;
	}
	/** Quotes flow with draft text and wrap at their own text boundary. */
	isInline() {
		return true;
	}
	/** Arrow movement crosses the quote without entering a NodeSelection. */
	isKeyboardSelectable() {
		return false;
	}
	/** Clipboard text is the exact model-visible Markdown blockquote. */
	getTextContent() {
		return (0, _deepseek_ai_dsh_client_ui_primitives.formatQuoteText)(this.__text);
	}
	/** Selected visible quote text. */
	getQuoteText() {
		return this.getLatest().__text;
	}
	/** Update the localized remove label without changing persisted quote data. */
	setLabels(labels) {
		if (this.getLatest().__labels.remove !== labels.remove) this.getWritable().__labels = labels;
	}
	/** Render the quote body and its independent close control. */
	decorate(editor) {
		return (0, react_jsx_runtime.jsx)(QuoteNodeView, {
			editor,
			nodeKey: this.__key,
			text: this.__text,
			labels: this.__labels
		});
	}
};
/** @param text - selected quote text. @param labels - runtime labels. @returns a fresh node. */
function $createQuoteNode(text, labels) {
	return new QuoteNode(text, labels);
}
/** @param node - possible Lexical node. @returns whether it is a QuoteNode. */
function $isQuoteNode(node) {
	return node instanceof QuoteNode;
}
