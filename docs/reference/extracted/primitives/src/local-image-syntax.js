// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/markdown/local-image-syntax.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Recover only unambiguous, unescaped image-only paragraphs containing a local path with spaces.
* @param root - Parsed Markdown tree, modified in place.
* @param source - Original source used to distinguish authored syntax from escaped examples.
* @returns The same root with recovered image nodes.
*/
function recoverLocalImages(root, source) {
	const visit = (node) => {
		if (node.type === "paragraph" && node.children.length === 1) {
			const [child] = node.children;
			if (child.type === "text" && child.position !== void 0 && source.slice(child.position.start.offset, child.position.end.offset) === child.value) {
				const match = /^!\[([^\]\n]*)\]\(((?:\/(?!\/)|\.{1,2}\/|[a-z]:[\\/])[^\n<>()[\]"']+\.[a-z\d]+)\)$/iu.exec(child.value);
				if (match !== null && match[2].includes(" ") && classifyFileType(match[2]) === "image") node.children = [{
					type: "image",
					alt: match[1],
					url: match[2],
					position: child.position
				}];
			}
		} else if ("children" in node) for (const child of node.children) visit(child);
	};
	visit(root);
	return root;
}
