// Extracted from @deepseek-ai/dsh-client-ui-primitives (lib/index.js); region lib/types/ReferenceIcon.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Render the icon that identifies one inline reference domain.
* @param props - Reference kind, optional size, and optional CSS class.
* @returns The corresponding decorative current-color SVG glyph.
*/
function ReferenceIconArtwork({ kind, size = 16, className, strokeWidth }) {
	switch (kind) {
		case "session": return jsx(ChatLinesOutlineArtwork, {
			size,
			className,
			strokeWidth
		});
		case "file": return jsx(BrowseOutlineArtwork, {
			size,
			className,
			strokeWidth
		});
		case "folder": return jsx(FolderCloseArtwork, {
			size,
			className,
			strokeWidth
		});
	}
}
/**
* Render a regular one-pixel reference icon.
* @param props - Reference kind, size, and optional class.
* @returns The regular decorative reference glyph.
*/
function ReferenceIconRegular(props) {
	return jsx(ReferenceIconArtwork, {
		...props,
		strokeWidth: 1
	});
}
/**
* Render a medium 1.3px reference icon.
* @param props - Reference kind, size, and optional class.
* @returns The medium decorative reference glyph.
*/
function ReferenceIconMedium(props) {
	return jsx(ReferenceIconArtwork, {
		...props,
		strokeWidth: ICON_MEDIUM_STROKE
	});
}
