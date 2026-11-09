// Extracted from @deepseek-ai/dsh-client-ui-file-actions (lib/client.js); region lib/types/client/files.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Original-byte transfer, platform save selection, and pasteable image encoding. */
/**
* Keep compatible filename suffixes and repair known MIME conflicts without changing bytes.
* @param name - suggested original name.
* @param mediaType - source MIME, optionally including parameters.
* @returns safe filename preserving unknown formats.
*/
function exportName(name, mediaType) {
	return resolveDragFileName({
		name: name ?? "image",
		mediaType
	});
}
/** File action owner; browser download requests never imply a saved path. */
var BrowserFileActions = class {
	desktop;
	downloadUrl;
	lifetime = new AbortController();
	canSaveAs;
	constructor(desktop) {
		this.desktop = desktop;
		this.canSaveAs = desktop !== void 0;
	}
	async read(source) {
		this.lifetime.signal.throwIfAborted();
		if (source.read !== void 0) return source.read(this.lifetime.signal);
		const url = new URL(source.url);
		if (![
			"http:",
			"https:",
			"blob:",
			"data:",
			"dsh-app:"
		].includes(url.protocol)) throw new Error("Unsupported file source");
		if (this.desktop !== void 0 && ["http:", "https:"].includes(url.protocol) && url.origin !== location.origin) {
			const content = await this.desktop.readClipboardImage(url.href);
			this.lifetime.signal.throwIfAborted();
			return new Blob([new Uint8Array(content.bytes)], { type: content.mediaType || source.mediaType || "" });
		}
		const response = await fetch(source.url, {
			signal: this.lifetime.signal,
			referrerPolicy: "no-referrer"
		});
		if (!response.ok) throw new Error("Original file unavailable");
		return response.blob();
	}
	async save(source, mode) {
		this.lifetime.signal.throwIfAborted();
		if (this.desktop !== void 0) {
			const blob = source.read === void 0 ? void 0 : await source.read(this.lifetime.signal);
			this.lifetime.signal.throwIfAborted();
			const url = blob === void 0 ? source.url : URL.createObjectURL(blob);
			try {
				const result = await this.desktop.save({
					url,
					mode,
					...source.name === void 0 ? {} : { name: source.name },
					...blob?.type || source.mediaType ? { mediaType: blob?.type || source.mediaType } : {}
				});
				this.lifetime.signal.throwIfAborted();
				return result;
			} finally {
				if (blob !== void 0) URL.revokeObjectURL(url);
			}
		}
		if (mode === "saveAs") throw new Error("Save as requires Desktop");
		const suggested = source.name ?? (URL.canParse(source.url) ? new URL(source.url).pathname.split("/").pop() : void 0);
		const blob = await this.read(source);
		this.lifetime.signal.throwIfAborted();
		const name = exportName(suggested, blob.type || source.mediaType || "");
		const url = URL.createObjectURL(blob);
		if (this.downloadUrl !== void 0) URL.revokeObjectURL(this.downloadUrl);
		this.downloadUrl = url;
		const anchor = document.createElement("a");
		anchor.href = url;
		anchor.download = name;
		document.body.append(anchor);
		anchor.click();
		anchor.remove();
		return { status: "requested" };
	}
	async copyImage(source) {
		this.lifetime.signal.throwIfAborted();
		const png = this.read(source).then(async (blob) => {
			this.lifetime.signal.throwIfAborted();
			if (blob.type === "image/png") return blob;
			const objectUrl = URL.createObjectURL(blob);
			const image = new Image();
			image.src = objectUrl;
			await image.decode().catch((error) => {
				URL.revokeObjectURL(objectUrl);
				throw error;
			});
			try {
				const canvas = document.createElement("canvas");
				canvas.width = image.naturalWidth;
				canvas.height = image.naturalHeight;
				const context = canvas.getContext("2d");
				if (context === null) throw new Error("Image conversion unavailable");
				context.drawImage(image, 0, 0);
				return await new Promise((resolve, reject) => {
					canvas.toBlob((value) => {
						if (value === null) reject(/* @__PURE__ */ new Error("Image conversion failed"));
						else resolve(value);
					}, "image/png");
				});
			} finally {
				URL.revokeObjectURL(objectUrl);
			}
		});
		await navigator.clipboard.write([new ClipboardItem({ "image/png": png })]);
	}
	/** Cancel reads and release browser download URLs when the plugin unloads. */
	dispose() {
		this.lifetime.abort();
		if (this.downloadUrl !== void 0) URL.revokeObjectURL(this.downloadUrl);
		this.downloadUrl = void 0;
	}
};
