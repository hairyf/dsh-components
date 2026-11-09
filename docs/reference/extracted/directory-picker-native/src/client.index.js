// Extracted from @deepseek-ai/dsh-client-ui-directory-picker-native (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Required services (cordis fiber inject): the slot registry, workspace UI service, and access. */
		const inject = [
			"slots",
			"uiWorkspace",
			"remoteAccess"
		];
		/**
		* Client plugin body: while the current Peer may open the Host's directory
		* chooser, register the renderless native flow into both directory-flow holes
		* through `slots.inject()` because the ui-workspace entries may activate later
		* or replace their declarations.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			const desktop = globalThis.__DSH_DIRECTORY_PICKER__;
			const pick = desktop === void 0 ? () => ctx.uiWorkspace.pickDirectory() : () => desktop.pick();
			const injected = () => ({ pick });
			ctx.remoteAccess.whenAccess("directoryPicker/pick", () => ctx.slots.inject("conversation.hero.workspace.directoryFlow", () => ctx.slots.inject("sidebar.workspaces.directoryFlow", function* () {
				yield ctx.slots.register({
					name: "conversation.hero.workspace.directoryFlow",
					inject: injected
				}, NativeDirectoryFlow);
				yield ctx.slots.register({
					name: "sidebar.workspaces.directoryFlow",
					inject: injected
				}, NativeDirectoryFlow);
			})));
		}
