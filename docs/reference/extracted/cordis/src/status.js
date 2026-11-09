// Extracted from @deepseek-ai/dsh-client-ui-cordis (lib/client.js); region lib/types/client/status.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Shared status derivation over Host inventory and this page's Client live set. */
		/**
		* Locate one immutable Package inside a Plugin row.
		* @param row - owning Plugin inventory row.
		* @param packageId - immutable Package identity to locate.
		* @returns the matching Package metadata, or `undefined` when absent.
		*/
		function packageOf(row, packageId) {
			return row.packages.find((pkg) => pkg.packageId === packageId);
		}
		/**
		* Derive the visible state of one Package.
		* @param row - owning Plugin inventory row.
		* @param packageId - Package being described.
		* @param loaded - Client activations loaded in this page.
		* @returns idle, Host-running/Client-pending, or fully running.
		*/
		function cordisVisibleStatus(row, packageId, loaded) {
			const run = row.activeRun;
			if (run === void 0 || run.packageId !== packageId) return "idle";
			if (packageOf(row, packageId)?.hasClientHalf !== true) return "running";
			return loaded.some((live) => live.pluginId === row.pluginId && live.packageId === packageId && live.pluginRunId === run.pluginRunId) ? "running" : "client-pending";
		}
