// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/text-ref.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Editable reference tokens share chip hover styling while retaining ordinary text semantics. */
/** One matched plain-text reference as a styled, fully editable text node. */
var TextRefNode = class TextRefNode extends Wo {
	/** Lexical node registry type tag. */
	static getType() {
		return "composer-text-ref";
	}
	/**
	* Clone with identity (Lexical writable-copy contract).
	* @param node - node to clone.
	* @returns a copy carrying the same NodeKey.
	*/
	static clone(node) {
		return new TextRefNode(node.__text, node.__key);
	}
	/**
	* Rebuild one text-ref from its JSON form.
	* @param json - serialized node.
	* @returns a fresh node.
	*/
	static importJSON(json) {
		const node = new TextRefNode(json.text);
		node.setFormat(json.format);
		node.setDetail(json.detail);
		node.setMode(json.mode);
		node.setStyle(json.style);
		return node;
	}
	/** Serialize to the JSON node form. */
	exportJSON() {
		return {
			...super.exportJSON(),
			type: "composer-text-ref"
		};
	}
	/** Style the span the base TextNode mounts. */
	createDOM(config) {
		const el = super.createDOM(config);
		el.className = clsx(el.className, composer_editor_module_css_default.reference, composer_editor_module_css_default.textRef, this.getTextContent().startsWith("/") && composer_editor_module_css_default.openable);
		el.setAttribute("spellcheck", "false");
		el.setAttribute("data-composer-text-ref", "");
		return el;
	}
	/** Entity nodes never merge with plain siblings (the transform owns their bounds). */
	isTextEntity() {
		return true;
	}
	/** Editing continues inside; the transform re-evaluates match shape per edit. */
	canInsertTextBefore() {
		return true;
	}
};
/**
* Register the plain-text reference entity transform.
* @param editor - the shell-owned editor.
* @param lexiconOf - live per-trigger name-roll accessor (the controller's aggregated store).
* @returns the unregister disposer.
*/
function registerTextRefDecoration(editor, lexiconOf) {
	const getMatch = (text) => {
		const range = scanTextRefs(text, lexiconOf())[0];
		return range === void 0 ? null : {
			start: range.start,
			end: range.end
		};
	};
	return Eu(...x(editor, getMatch, TextRefNode, (node) => new TextRefNode(node.getTextContent())));
}
/**
* Force a re-scan of the whole document (transforms only visit dirty nodes;
* a lexicon roll change dirties nothing on its own). Queued, not discrete —
* the caller may sit inside an update listener.
* @param editor - the shell-owned editor.
*/
function rescanTextRefs(editor) {
	editor.update(() => {
		for (const node of nl().getAllTextNodes()) node.markDirty();
	}, { tag: xo });
}
