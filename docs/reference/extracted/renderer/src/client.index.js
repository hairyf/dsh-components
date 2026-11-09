// Extracted from @deepseek-ai/dsh-client-ui-renderer (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/**
* Browser UI renderer. It installs the slot renderer after its Cordis
* dependencies activate and exposes the mount operation used by the web boot
* kernel after the complete client roster settles.
*/
/** Services required before application assembly. */
const inject = [];
/** Hydrate the kernel-owned loading DOM before replacing it with the application. */
function BootHandoff(props) {
	const [ready, setReady] = (0, react.useState)(false);
	(0, react.useLayoutEffect)(() => {
		setReady(true);
	}, []);
	if (ready) return props.app();
	return (0, react.createElement)("div", {
		className: props.boot.className,
		"data-dsh-boot": "",
		dangerouslySetInnerHTML: { __html: props.boot.html }
	});
}
/** Mount React while preserving the framework-free boot DOM through hydration. */
function mountApp(container, app) {
	const boot = container.querySelector(":scope > [data-dsh-boot]");
	if (boot !== null) return (0, react_dom_client.hydrateRoot)(container, (0, react.createElement)(BootHandoff, {
		app,
		boot: {
			className: boot.className,
			html: boot.innerHTML
		}
	}));
	const root = (0, react_dom_client.createRoot)(container);
	(0, react_dom.flushSync)(() => {
		root.render(app());
	});
	return root;
}
/**
* Install the slot renderer and provide the application mount face.
* @param ctx - Plugin context.
*/
function apply(ctx) {
	new SlotRegistry(ctx).install(createSlotRenderer());
	ctx.reflect.provide("uiRenderer", { mount: (container) => {
		const root = mountApp(container, buildRenderApp({ ctx }));
		return () => {
			root.unmount();
		};
	} });
}
