// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/index.js); region lib/types/config.js
// Cross-bundle variant: the bundler tree-shook this source file differently per entry. The lib/client.js variant is the primary file.
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Cache limits shared by the Host configuration and browser document previews. */
/** Deployment limits applied before Office preview registration. */
const Config = z.object({
	office: z.object({
		maxCachedEntries: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(8),
		maxCachedBytes: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(64 * 1024 * 1024),
		maxPending: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(8),
		maxReaders: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(32)
	}),
	excel: z.object({
		maxBytes: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(16 * 1024 * 1024),
		maxCells: z.natural().min(1).max(Number.MAX_SAFE_INTEGER).default(25e4),
		timeoutMs: z.natural().min(1).max(2147483647).default(15e3)
	})
});
