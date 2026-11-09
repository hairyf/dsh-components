// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/presentation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Display labels and toast sentences for global plugin management. */
		/** The registries with a name of their own, by host. */
		const REGISTRY_COPY = new Map([["registry.npmmirror.com", "registryNpmmirror"]]);
		/** npm's own registry, which reads by name rather than by host. */
		const OFFICIAL_NPM_HOST = "registry.npmjs.org";
		/**
		* What a registry reads as: npm's own by its name, a known mirror by its name, any other registry by its host;
		* and the host each names, for where the name alone would leave it unsaid. The registry pnpm's own configuration
		* names reads by the registry it names, so the label never claims npm's own for another one.
		* @param registry - the registry, null for the one pnpm's own configuration names.
		* @param t - the manager's translate seat.
		* @param resolved - the URL pnpm's own configuration names, null while the Host could not read it.
		* @returns the name and the host.
		*/
		function registryText(registry, t, resolved) {
			const url = registry ?? resolved;
			if (url === null) return {
				name: t("registryDefault"),
				host: OFFICIAL_NPM_HOST
			};
			const host = registryHost(url);
			const key = host === OFFICIAL_NPM_HOST ? "registryOfficial" : REGISTRY_COPY.get(host);
			return {
				name: key === void 0 ? host : t(key),
				host
			};
		}
		/** The host of a registry URL; the URL as written when it does not parse. */
		function registryHost(registry) {
			try {
				return new URL(registry).host;
			} catch {
				return registry;
			}
		}
		/** The sentence each of the Host's refusal codes reads as. */
		const CODE_KEYS = {
			"management-required": "reasonManagementRequired",
			"unaddressable": "reasonUnaddressable",
			"unknown-plugin": "reasonUnknownPlugin",
			"invalid-spec": "reasonInvalidSpec",
			"already-installed": "reasonAlreadyInstalled",
			"ambiguous-install": "reasonAmbiguousInstall",
			"not-bundle": "reasonNotBundle",
			"not-removable": "reasonNotRemovable",
			"stop-profile": "reasonStopProfile",
			"bundle-in-use": "reasonBundleInUse",
			"stale-approval": "reasonStaleApproval",
			"incompatible-version": "reasonIncompatibleVersionUnnamed",
			"unsupported-platform": "reasonUnsupportedPlatform",
			"operation-error": "reasonOperationError"
		};
		/** The sentence a failed action opens with, by what was being done. */
		const FAILED_KEYS = {
			enable: "failedEnable",
			disable: "failedDisable",
			uninstall: "failedUninstall",
			rowEnable: "failedRowEnable",
			rowDisable: "failedRowDisable"
		};
		/**
		* What a management error reads as: the code's sentence; for an incompatibility, one sentence per
		* package it names, then the remedy for an install or for an installed plugin; or, for an operation error, the Host's diagnostic as it is.
		* @param error - the Host's code, its diagnostic, and the packages an incompatibility names.
		* @param t - the manager's translate seat.
		* @returns the sentence.
		*/
		function managementText(error, t) {
			if (error.code === "incompatible-version") {
				const named = error.incompatible ?? [];
				return [...named.length === 0 ? [t("reasonIncompatibleVersionUnnamed")] : named.map((plugin) => t("reasonIncompatibleVersion", {
					plugin: `${plugin.name}@${plugin.version}`,
					runtime: plugin.runtimeVersion,
					requirements: Object.entries(plugin.requirements).map(([name, range]) => `${name} ${range}`).join(", ")
				})), t(error.installing ? "reasonIncompatibleInstall" : "reasonIncompatibleInstalled")].join(t("sentenceSeparator"));
			}
			if (error.code !== "operation-error") return t(CODE_KEYS[error.code]);
			return error.diagnostic === void 0 || error.diagnostic === "" ? t("reasonOperationError") : error.diagnostic;
		}
		/**
		* Compact a package name to what a person calls it.
		* @param name - the package name.
		* @returns the unscoped name without the harness prefixes.
		*/
		function shortName(name) {
			return (name.startsWith("@") ? name.slice(name.indexOf("/") + 1) : name).replace(/^dsh-(?:host-|client-)?/, "");
		}
		/**
		* Resolve installed package metadata without changing its technical identity.
		* @param pkg - package identity and local metadata.
		* @param resolveText - current-locale package text resolver.
		* @returns localized copy with a technical-name fallback and the independent beta status.
		*/
		function packageText(pkg, resolveText) {
			return {
				title: pkg.meta?.title === void 0 ? pkg.name : resolveText(pkg.meta.title),
				description: pkg.meta?.description === void 0 ? void 0 : resolveText(pkg.meta.description) || void 0,
				beta: EXPERIMENTAL_BUNDLES.has(pkg.name)
			};
		}
		/**
		* Resolve a bundle row's plugin metadata, using its full module specifier as the final title fallback.
		* @param row - row identity and local metadata.
		* @param resolveText - current-locale package text resolver.
		* @returns the row's display title and optional description.
		*/
		function rowText(row, resolveText) {
			return {
				title: row.meta?.title === void 0 ? row.moduleName : resolveText(row.meta.title),
				description: row.meta?.description === void 0 ? void 0 : resolveText(row.meta.description) || void 0
			};
		}
		/** The sentence naming why a change waits for a restart. */
		const RESTART_REASON_KEYS = {
			"no-hmr": "restartReasonNoHmr",
			"package-moved": "restartReasonPackageMoved",
			"host-module": "restartReasonHostModule",
			"unmanaged-plugin": "restartReasonUnmanagedPlugin",
			"module-comparison": "restartReasonModuleComparison"
		};
		/**
		* A restart prompt with its reason.
		* @param key - the prompt's sentence, which takes the reason as `{reason}`.
		* @param reason - why the change waits for a restart.
		* @param t - the manager's translate seat.
		* @returns the prompt.
		*/
		function restartText(key, reason, t) {
			return t(key, { reason: reason === void 0 ? "" : t(RESTART_REASON_KEYS[reason]) }).trimEnd();
		}
		/**
		* The sentence one notice shows.
		* @param notice - the last action's outcome.
		* @param t - the manager's translate seat.
		* @returns the sentence.
		*/
		function noticeText(notice, t) {
			switch (notice.kind) {
				case "restart": return restartText("restartNotice", notice.reason, t);
				case "overridden": return t("overriddenNotice", { name: notice.packageName });
				case "cancelled": return t("installCancelled");
				case "refresh-failed": return t("refreshError");
				case "install": return t({
					done: "installBackgroundDone",
					failed: "installBackgroundFailed",
					unconfirmed: "installBackgroundUnconfirmed",
					applying: "installBackgroundApplying",
					unknown: "installBackgroundUnknown"
				}[notice.outcome]);
				case "failed": {
					const reason = notice.code === void 0 ? notice.reason : managementText({
						code: notice.code,
						diagnostic: notice.reason,
						...notice.incompatible === void 0 ? {} : { incompatible: notice.incompatible }
					}, t);
					return t(FAILED_KEYS[notice.action], { reason: reason === "" ? t("reasonOperationError") : reason });
				}
			}
		}
