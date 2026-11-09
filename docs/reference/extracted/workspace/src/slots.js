// Extracted from @deepseek-ai/dsh-client-ui-workspace (lib/client.js); region lib/types/client/contract/slots.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Bind the row's render occurrence into the entries' `useMenuOpenState` hook:
		* the owner supplies its open-state pair as the occurrence's `hookContext`,
		* and the hook hands that pair back.
		* @param _standard - framework standard props (unused).
		* @param state - the menu's open-state pair from the render occurrence.
		* @returns the hook the entry calls.
		*/
		const menuOpenStateFactory = (_standard, state) => () => state;
