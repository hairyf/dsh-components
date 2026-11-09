// Extracted from @deepseek-ai/dsh-client-ui-renderer (lib/client.js); region lib/types/client/bind.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		var import_with_selector = (/* @__PURE__ */ __commonJSMin(((exports, module) => {
			module.exports = require_with_selector_production();
		})))();
		/**
		* Bind a bare observable source to a typed uSES selector hook.
		* subscribe/getSnapshot are captured once per source into stable closures
		* (also re-binds `this` for method-based sources), so components never
		* resubscribe across renders. Equality defaults to Object.is.
		* @param w - snapshot source (engine store, Session object, store instance).
		* @returns the selector hook.
		*/
		function bindSnapshotSelector(w) {
			const subscribe = (fn) => w.subscribe(fn);
			const getSnapshot = () => w.getSnapshot();
			return function useSelector(sel, eq) {
				return (0, import_with_selector.useSyncExternalStoreWithSelector)(subscribe, getSnapshot, void 0, sel, eq);
			};
		}
