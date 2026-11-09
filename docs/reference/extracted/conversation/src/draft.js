// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/draft.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Semantic draft snapshots shared by storage, programmatic input, and editor restoration. */
const referenceSchema = zod.z.object({
	source: zod.z.string(),
	ref: zod.z.string(),
	offset: zod.z.number().int().nonnegative(),
	length: zod.z.number().int().positive(),
	label: zod.z.string(),
	appearance: zod.z.enum([
		"session",
		"file",
		"folder"
	]).optional(),
	clipboardText: zod.z.string(),
	invalid: zod.z.boolean().optional()
});
const commandSchema = zod.z.object({ token: zod.z.string() });
const quoteSchema = zod.z.object({
	offset: zod.z.number().int().nonnegative(),
	length: zod.z.number().int().positive(),
	text: zod.z.string().refine((text) => text.trim() !== "")
});
const snapshotSchema = zod.z.object({
	text: zod.z.string(),
	references: zod.z.array(referenceSchema),
	command: commandSchema.optional(),
	quotes: zod.z.array(quoteSchema).optional()
}).refine((draft) => {
	const spelling = draft.command?.token.trimEnd();
	if (spelling !== void 0 && (!/^\/\S/u.test(spelling) || !draft.text.startsWith(spelling))) return false;
	let end = spelling?.length ?? 0;
	for (const reference of draft.references) {
		if (reference.offset < end || reference.length !== reference.clipboardText.length) return false;
		end = reference.offset + reference.length;
		if (end > draft.text.length || draft.text.slice(reference.offset, end) !== reference.clipboardText) return false;
	}
	for (const quote of draft.quotes ?? []) if (quote.length !== (0, _deepseek_ai_dsh_client_ui_primitives.formatQuoteText)(quote.text).length || draft.text.slice(quote.offset, quote.offset + quote.length) !== (0, _deepseek_ai_dsh_client_ui_primitives.formatQuoteText)(quote.text)) return false;
	end = spelling?.length ?? 0;
	for (const span of [...draft.references, ...draft.quotes ?? []].sort((a, b) => a.offset - b.offset)) {
		if (span.offset < end) return false;
		end = span.offset + span.length;
		if (end > draft.text.length) return false;
	}
	return true;
}, "Draft references must identify ordered, non-overlapping text spans after the leading command token");
/**
* Copy input into the semantic draft representation without editor runtime identities.
* @param input - plain text or caller-owned structured content.
* @returns an owned snapshot ready for editor import.
*/
function resolveDraftInput(input) {
	if (typeof input === "string") return {
		text: input,
		references: []
	};
	return {
		text: input.text,
		references: input.references.map(copyReference),
		...input.command === void 0 ? {} : { command: { token: input.command.token } },
		...input.quotes === void 0 ? {} : { quotes: input.quotes.map((quote) => ({ ...quote })) }
	};
}
/**
* Decode persisted drafts, accepting the earlier plain-string representation.
* @param value - JSON value read from browser storage.
* @returns the decoded draft, or undefined for invalid data.
*/
function parseStoredDraft(value) {
	if (typeof value === "string") return resolveDraftInput(value);
	const parsed = snapshotSchema.safeParse(value);
	if (!parsed.success) return void 0;
	return {
		text: parsed.data.text,
		...parsed.data.quotes === void 0 ? {} : { quotes: parsed.data.quotes },
		references: parsed.data.references.map(({ appearance, invalid, ...reference }) => ({
			...reference,
			...appearance === void 0 ? {} : { appearance },
			...invalid === void 0 ? {} : { invalid }
		})),
		...parsed.data.command === void 0 ? {} : { command: { token: parsed.data.command.token } }
	};
}
/**
* Export reference identities without their editor-local occurrence ids.
* @param text - current clipboard projection.
* @param occurrences - matching reference projections from the same document revision.
* @param commandToken - claim token of the command chip opening the document, if any.
* @param quotes - atomic quotes from the same document revision.
* @returns an editor-independent snapshot.
*/
function snapshotDraft(text, occurrences, commandToken, quotes = []) {
	return {
		text,
		references: occurrences.map(copyReference),
		...commandToken === void 0 ? {} : { command: { token: commandToken } },
		...quotes.length === 0 ? {} : { quotes: quotes.map((quote) => ({ ...quote })) }
	};
}
function copyReference(reference) {
	return {
		source: reference.source,
		ref: reference.ref,
		offset: reference.offset,
		length: reference.length,
		label: reference.label,
		clipboardText: reference.clipboardText,
		...reference.appearance === void 0 ? {} : { appearance: reference.appearance },
		...reference.invalid === void 0 ? {} : { invalid: reference.invalid }
	};
}
