// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/config.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Cache limits shared by the Host configuration and browser document previews. */
/** Deployment limits applied before Office preview registration. */
const Config = Schema.object({
	office: Schema.object({
		maxCachedEntries: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(8),
		maxCachedBytes: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(64 * 1024 * 1024),
		maxPending: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(8),
		maxReaders: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(32)
	}),
	excel: Schema.object({
		maxBytes: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(16 * 1024 * 1024),
		maxCells: Schema.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(25e4),
		timeoutMs: Schema.natural().min(1).max(2147483647).default(15e3)
	})
});
