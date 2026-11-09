// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/editor/command-chip-node.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** One claimed command as an atomic decorator node. */
var CommandChipNode = class CommandChipNode extends Li {
	/** The claim this chip anchors; its submit closure has no JSON form. */
	__claim;
	/** Lexical node registry type tag. */
	static getType() {
		return "command-chip";
	}
	/**
	* Clone with identity (Lexical writable-copy contract).
	* @param node - node to clone.
	* @returns a copy carrying the same NodeKey and claim.
	*/
	static clone(node) {
		return new CommandChipNode(node.__claim, node.__key);
	}
	/**
	* Rebuild one chip from its JSON form. JSON cannot carry the claim's
	* submit closure, so an imported command is its literal token text.
	* @param json - serialized chip.
	* @returns a plain text node holding the token.
	*/
	static importJSON(json) {
		return Go(json.text);
	}
	/**
	* @param claim - the command claim the chip anchors.
	* @param key - Lexical clone-path key; absent for fresh nodes.
	*/
	constructor(claim, key) {
		super(key);
		this.__claim = claim;
	}
	/** Serialize to the JSON node form (the token text alone). */
	exportJSON() {
		return {
			...super.exportJSON(),
			type: "command-chip",
			version: 1,
			text: this.getTextContent()
		};
	}
	/**
	* Mount the chip's host element; the decorator portal renders into it.
	* @returns an inline, non-editable span carrying the test/e2e anchor.
	*/
	createDOM() {
		const el = document.createElement("span");
		el.setAttribute("data-composer-command", this.__claim.name);
		el.setAttribute("contenteditable", "false");
		return el;
	}
	/** Host element never changes shape. */
	updateDOM() {
		return false;
	}
	/** The chip sits in the text line. */
	isInline() {
		return true;
	}
	/**
	* Arrows step across the chip and the default character deletion removes
	* it whole, for the reason documented on ReferenceChipNode.isKeyboardSelectable;
	* registerCommandChipSelection inserts the selecting step before that deletion.
	*/
	isKeyboardSelectable() {
		return false;
	}
	/** Clipboard / persistence projection: the token without its separator. */
	getTextContent() {
		return this.__claim.token.trimEnd();
	}
	/** The claim this chip anchors. */
	getClaim() {
		return this.getLatest().__claim;
	}
	/** React face rendered into the host element by the decorator portal. */
	decorate() {
		return (0, react_jsx_runtime.jsx)(CommandChip, { token: this.getTextContent() });
	}
};
/**
* Mint one chip node for a claim.
* @param claim - the command claim.
* @returns the fresh node.
*/
function $createCommandChipNode(claim) {
	return new CommandChipNode(claim);
}
/**
* Command chip type guard.
* @param node - any node or nullish.
* @returns whether the node is a CommandChipNode.
*/
function $isCommandChipNode(node) {
	return node instanceof CommandChipNode;
}
/** Replace a displaced chip with its literal token. */
function $releaseChip(chip) {
	chip.replace(Go(chip.getTextContent()));
}
/**
* Keep command chips on the leading seat. A chip anywhere but the first
* child of the first block (text, a line break, or a block inserted before
* it) becomes its literal token, which releases the claim. Inserting a
* sibling before the chip or moving it to another block marks the chip dirty;
* a block inserted before the chip's block marks only that block dirty.
* @param editor - the shell-owned editor.
* @returns the unregister disposer.
*/
function registerCommandChipSeat(editor) {
	return Eu(editor.registerNodeTransform(CommandChipNode, (chip) => {
		if (chip.getPreviousSibling() !== null || chip.getParentOrThrow().getPreviousSibling() !== null) $releaseChip(chip);
	}), editor.registerNodeTransform(Zi, (block) => {
		const first = block.getFirstChild();
		if ($isCommandChipNode(first) && block.getPreviousSibling() !== null) $releaseChip(first);
	}));
}
