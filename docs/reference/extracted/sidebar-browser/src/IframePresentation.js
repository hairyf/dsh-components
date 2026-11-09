// Extracted from @deepseek-ai/dsh-client-ui-sidebar-browser (lib/client.js); region lib/types/client/view/IframePresentation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Fixed iframe policy; top navigation and downloads are not granted directly. */
const WEB_BROWSER_SANDBOX = "allow-scripts allow-forms allow-same-origin allow-popups allow-popups-to-escape-sandbox";
/** Owns the iframe element; navigation and history remain in IframeImpl. */
var IframePresentation = class {
	events;
	host;
	element;
	document;
	rendered = false;
	/** @param events - provider-owned load and remount callbacks. */
	constructor(events) {
		this.events = events;
	}
	/** @param viewportId - mounted placeholder. @returns removes only the iframe presentation. */
	mount(viewportId) {
		const host = document.getElementById(viewportId);
		if (host === null) throw new Error("iframe presentation: viewport is not mounted");
		this.element?.remove();
		this.element = void 0;
		this.host = host;
		if (this.rendered) this.events.remounted();
		else this.render();
		return () => {
			if (this.host !== host) return;
			this.element?.remove();
			this.element = void 0;
			this.host = void 0;
		};
	}
	/**
	* Retain the prepared document and render it when a container is mounted.
	* @param value - prepared document and event generation.
	*/
	show(value) {
		this.document = value;
		this.render();
	}
	/** Remove the owned DOM and retained presentation data. */
	dispose() {
		this.element?.remove();
		this.element = void 0;
		this.host = void 0;
		this.document = void 0;
	}
	render() {
		const current = this.document;
		const host = this.host;
		if (current === void 0 || host === void 0) return;
		this.element?.remove();
		const element = document.createElement("iframe");
		element.className = Browser_module_css_default.frame;
		element.src = current.target.url;
		element.title = current.target.title;
		element.referrerPolicy = "no-referrer";
		element.dataset.sidebarBrowserFrame = "iframe";
		if (current.sandboxed) element.setAttribute("sandbox", WEB_BROWSER_SANDBOX);
		element.addEventListener("load", () => {
			if (this.element === element) this.events.loaded(current.revision);
		});
		element.addEventListener("error", () => {
			if (this.element === element) this.events.failed(current.revision);
		});
		this.element = element;
		this.rendered = true;
		host.append(element);
	}
};
