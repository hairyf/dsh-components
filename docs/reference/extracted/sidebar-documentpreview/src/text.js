// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.pdf.js); region lib/types/client/pdf/text.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Create a selectable overlay in a component-owned host.
* @param host - absolute overlay matching the displayed canvas dimensions.
* @returns renderer whose cancellation also releases its resize observer and DOM.
*/
function pdfTextRenderer(host) {
	return (page, viewport) => {
		const layer = new TextLayerBuilder({ pdfPage: page });
		const container = layer.div;
		container.style.setProperty("--total-scale-factor", String(viewport.scale * viewport.userUnit));
		container.style.setProperty("--scale-round-x", "1px");
		container.style.setProperty("--scale-round-y", "1px");
		host.append(container);
		const resize = () => {
			container.style.scale = String(host.getBoundingClientRect().width / viewport.width);
		};
		const observer = new ResizeObserver(resize);
		observer.observe(host);
		resize();
		return {
			promise: layer.render({ viewport }),
			cancel() {
				observer.disconnect();
				layer.cancel();
				container.remove();
			}
		};
	};
}
