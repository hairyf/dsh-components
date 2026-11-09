// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/ContextBody.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Model-facing text stays bounded at the disclosure, not at the producer. */
		const MAX_CHARS = 2e4;
		/** Rows a list body materializes before summarizing the remainder. */
		const MAX_ENTRIES = 200;
		/** One durable source narrowed to the readable-record shape; null for anything else. */
		function asRecord$1(value) {
			return typeof value === "object" && value !== null && !Array.isArray(value) ? value : null;
		}
		/**
		* The content blocks as runs, IN THE ORDER the model received them.
		*
		* Adjacent text blocks join with no separator, matching how provider adapters
		* flatten them — inserting a line break would show the reader a line the model
		* never saw. An unknown block breaks the run and keeps its own fallback rather
		* than being hoisted past the text around it or vanishing; the block union is
		* merge-extensible, so a foreign log may interleave shapes this build does not
		* know.
		*/
		function contentRuns(content) {
			const runs = [];
			for (const block of content) {
				if (block.type !== "text") {
					runs.push({ block });
					continue;
				}
				const last = runs[runs.length - 1];
				if (last !== void 0 && "text" in last) last.text += block.text;
				else runs.push({ text: block.text });
			}
			return runs;
		}
		/** Only the blocks this UI version does not know, for bodies that replace the text. */
		function unknownBlocks(content) {
			return contentRuns(content).flatMap((run) => "block" in run ? [run.block] : []);
		}
		/** The model-facing text, truncated to the display bound. */
		function boundedText(text, t) {
			return text.length > MAX_CHARS ? `${text.slice(0, MAX_CHARS)}\n${t("json.truncated", { total: text.length })}` : text;
		}
		/**
		* One source field rendered as a value row; nested shapes stay compact JSON.
		* Bounded on its own, because source fields are as unbounded as the text: an unknown
		* producer may record an arbitrarily large string or array.
		*/
		function fieldValue(value, t) {
			return boundedText(typeof value === "string" ? value : typeof value === "number" || typeof value === "boolean" ? String(value) : JSON.stringify(value), t);
		}
		/**
		* Source fields as a key/value list. `kind` is always omitted because the
		* row header already names the producer. `form` is omitted only when a
		* dedicated body rendered for it — then the presentation the reader is looking
		* at IS that value. On the opaque fallback the declaration is kept, because
		* that is the one place a form this version cannot present would otherwise
		* disappear from the UI entirely.
		*/
		function SourceFields({ source, formRendered, t }) {
			const record = asRecord$1(source);
			if (record === null) return null;
			const hidden = formRendered ? ["kind", "form"] : ["kind"];
			const rows = Object.entries(record).filter(([key]) => !hidden.includes(key));
			if (rows.length === 0) return null;
			return (0, react_jsx_runtime.jsx)("dl", {
				className: ContextBody_module_css_default.fields,
				"data-context-fields": true,
				children: rows.map(([key, value]) => (0, react_jsx_runtime.jsxs)("div", {
					className: ContextBody_module_css_default.field,
					children: [(0, react_jsx_runtime.jsx)("dt", {
						className: ContextBody_module_css_default.fieldKey,
						children: key
					}), (0, react_jsx_runtime.jsx)("dd", {
						className: ContextBody_module_css_default.fieldValue,
						children: fieldValue(value, t)
					})]
				}, key))
			});
		}
		/**
		* Content blocks this UI version does not know, kept visible rather than
		* dropped: the block union is merge-extensible, so a newer or foreign log may
		* carry a shape this build has no presentation for.
		* @param props - The unrecognized blocks and the locale seat.
		* @returns One generic JSON block per unknown entry.
		*/
		function UnknownBlocks({ blocks, t }) {
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: blocks.map((block, index) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
				label: t("message.unknownBlock"),
				payload: block,
				truncatedLabel: (total) => t("json.truncated", { total })
			}, index)) });
		}
		/**
		* The model-facing content of one context, shared by every form that shows it:
		* the text with its real line breaks, then any block this UI version does not
		* know, which keeps its own fallback rather than vanishing.
		* @param props - Durable content and the locale seat.
		* @returns The content blocks as the model received them.
		*/
		function ModelFacingContent({ content, t }) {
			return (0, react_jsx_runtime.jsx)(react_jsx_runtime.Fragment, { children: contentRuns(content).map((run, index) => "text" in run ? run.text !== "" && (0, react_jsx_runtime.jsx)("pre", {
				className: ContextBody_module_css_default.text,
				"data-context-text": true,
				children: boundedText(run.text, t)
			}, index) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
				label: t("message.unknownBlock"),
				payload: run.block,
				truncatedLabel: (total) => t("json.truncated", { total })
			}, index)) });
		}
		/**
		* Default presentation: the model-facing text as text, with its real line
		* breaks, and the remaining source fields beneath it. This is what every form
		* this UI version does not recognize renders as.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The opaque context body.
		*/
		function OpaqueBody({ content, source, t }) {
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(ModelFacingContent, {
				content,
				t
			}), (0, react_jsx_runtime.jsx)(SourceFields, {
				source,
				formRendered: false,
				t
			})] });
		}
		/**
		* Instruction changes read off the source, or null when the record is not a
		* usable instruction list.
		*
		* The read is all-or-nothing: silently dropping one unreadable entry would show
		* a confident, incomplete file list for a log this version cannot fully read.
		* Paths are deduplicated in first-seen order, matching how the header label is
		* derived from the same array.
		*/
		function instructionChanges(source) {
			const record = asRecord$1(source);
			const list = record === null ? void 0 : record["changes"];
			if (!Array.isArray(list)) return null;
			const changes = [];
			const seen = /* @__PURE__ */ new Set();
			for (const entry of list) {
				const change = asRecord$1(entry);
				if (change === null) return null;
				const path = change["path"];
				if (typeof path !== "string" || path === "") return null;
				const action = change["action"];
				if (action !== "set" && action !== "replace" && action !== "remove") return null;
				const digest = change["digest"];
				if (seen.has(path)) continue;
				seen.add(path);
				changes.push({
					action,
					path,
					...typeof digest === "string" ? { digest } : {}
				});
			}
			return changes.length === 0 ? null : changes;
		}
		/**
		* Locale key for one reconciled file. The baseline loads a file; a later delta
		* distinguishes a newly reconciled path from a rewritten one, which `set` and
		* `replace` already separate at the producer.
		* @param action - the durable change action.
		* @param baseline - whether this context is the startup/resume baseline.
		* @returns the key naming what happened to that file.
		*/
		function instructionAction(action, baseline) {
			if (action === "remove") return "message.context.instructions.removed";
			if (baseline) return "message.context.instructions.loaded";
			return action === "set" ? "message.context.instructions.added" : "message.context.instructions.updated";
		}
		/**
		* `instructions` form: the files this context reconciled, then their text.
		*
		* The text keeps its `<system-reminder>` framing verbatim — the framing is part
		* of what the model read, so hiding it would misreport the request.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The instructions context body, or the opaque body when the change
		* list is unreadable.
		*/
		function InstructionsBody({ content, source, t }) {
			const changes = instructionChanges(source);
			if (changes === null) return (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content,
				source,
				t
			});
			const baseline = asRecord$1(source)?.["baseline"] === true;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("ul", {
				className: ContextBody_module_css_default.files,
				"data-context-files": true,
				children: changes.map((change) => (0, react_jsx_runtime.jsxs)("li", {
					className: ContextBody_module_css_default.file,
					title: change.digest,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: ContextBody_module_css_default.filePath,
						children: change.path
					}), (0, react_jsx_runtime.jsx)("span", {
						className: ContextBody_module_css_default.fileAction,
						children: t(instructionAction(change.action, baseline))
					})]
				}, change.path))
			}), (0, react_jsx_runtime.jsx)(ModelFacingContent, {
				content,
				t
			})] });
		}
		/**
		* Catalog entries read off the source, or null when the record is not a usable
		* catalog. All-or-nothing for the same reason as the instruction list: this body
		* replaces the model-facing text, so a partial list would hide the only complete
		* account of what the model read.
		*/
		function catalogEntries(source) {
			const record = asRecord$1(source);
			const list = record === null ? void 0 : record["entries"];
			if (!Array.isArray(list)) return null;
			const entries = [];
			for (const item of list) {
				const entry = asRecord$1(item);
				if (entry === null) return null;
				const name = entry["name"];
				const description = entry["description"];
				if (typeof name !== "string" || name === "" || typeof description !== "string") return null;
				entries.push({
					name,
					description
				});
			}
			return entries;
		}
		/**
		* `catalog` form: the published entries as a list, read from the source rather
		* than re-parsed out of the model-facing prose.
		*
		* A catalog whose source carries no usable entries falls through to the opaque
		* body, so an older or hand-edited log still shows its text.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The catalog context body, or the opaque body when the entry list is
		* unreadable.
		*/
		function CatalogBody({ content, source, t }) {
			const entries = catalogEntries(source);
			if (entries === null) return (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content,
				source,
				t
			});
			const update = asRecord$1(source)?.["update"] === true;
			const shown = entries.slice(0, MAX_ENTRIES);
			const rest = unknownBlocks(content);
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				update && (0, react_jsx_runtime.jsx)("p", {
					className: ContextBody_module_css_default.catalogNotice,
					"data-context-catalog-update": true,
					children: t("message.context.catalog.replaced")
				}),
				(0, react_jsx_runtime.jsx)("ul", {
					className: ContextBody_module_css_default.entries,
					"data-context-entries": true,
					children: shown.map((entry, index) => (0, react_jsx_runtime.jsxs)("li", {
						className: ContextBody_module_css_default.entry,
						children: [(0, react_jsx_runtime.jsx)("code", {
							className: ContextBody_module_css_default.entryName,
							children: entry.name
						}), (0, react_jsx_runtime.jsx)("span", {
							className: ContextBody_module_css_default.entryDescription,
							children: entry.description
						})]
					}, index))
				}),
				shown.length < entries.length && (0, react_jsx_runtime.jsx)("p", {
					className: ContextBody_module_css_default.catalogNotice,
					"data-context-entries-truncated": true,
					children: t("message.context.catalog.more", { count: entries.length - shown.length })
				}),
				(0, react_jsx_runtime.jsx)(UnknownBlocks, {
					blocks: rest,
					t
				})
			] });
		}
		/** Snapshot sections read off the source, or null when the record is unusable. */
		function snapshotSections(source) {
			const record = asRecord$1(source);
			const list = record === null ? void 0 : record["sections"];
			if (!Array.isArray(list)) return null;
			const sections = [];
			for (const item of list) {
				const section = asRecord$1(item);
				if (section === null) return null;
				const name = section["name"];
				const text = section["text"];
				if (typeof name !== "string" || name === "" || typeof text !== "string") return null;
				sections.push({
					name,
					text
				});
			}
			return sections.length === 0 ? null : sections;
		}
		/**
		* `snapshot` form: the named contributions this snapshot assembled, in order.
		*
		* The sections are the same bytes the model read, split at the boundaries the
		* producer assembled them on, so a reader sees which subsystem contributed
		* which state instead of one undifferentiated wall.
		*
		* One sentence of the model-facing text is NOT in any section: the producer's
		* framing line declaring that this snapshot supersedes earlier ones. Unlike the
		* `<system-reminder>` wrapper an instruction context carries — which wraps
		* content and cannot be separated from it — that line states the form's own
		* semantics, so the body states them as a caption instead of reprinting the
		* joined prose beside the sections it was split from.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The snapshot context body, or the opaque body when unreadable.
		*/
		function SnapshotBody({ content, source, t }) {
			const sections = snapshotSections(source);
			/* v8 ignore next -- contextBody reads the sections before choosing this body. */
			if (sections === null) return (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content,
				source,
				t
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
				className: ContextBody_module_css_default.catalogNotice,
				"data-context-snapshot-supersedes": true,
				children: t("message.context.snapshot.supersedes")
			}), (0, react_jsx_runtime.jsx)("dl", {
				className: ContextBody_module_css_default.sections,
				"data-context-sections": true,
				children: sections.map((section, index) => (0, react_jsx_runtime.jsxs)("div", {
					className: ContextBody_module_css_default.section,
					children: [(0, react_jsx_runtime.jsx)("dt", {
						className: ContextBody_module_css_default.sectionName,
						children: section.name
					}), (0, react_jsx_runtime.jsx)("dd", {
						className: ContextBody_module_css_default.sectionText,
						children: boundedText(section.text, t)
					})]
				}, index))
			})] });
		}
		/**
		* `notice` form: what just happened, with the model-facing text beneath it.
		*
		* The one-line account also rides the collapsed row ({@link contextBody}), so a
		* notice is usually readable without expanding at all.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The notice context body.
		*/
		function NoticeBody({ content, t }) {
			return (0, react_jsx_runtime.jsx)(ModelFacingContent, {
				content,
				t
			});
		}
		/**
		* `relay` form: which agent sent this, then what it said.
		*
		* The sender is an opaque session id; it is shown as a field rather than a
		* label, because this client cannot resolve it to a title.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The relay context body.
		*/
		function RelayBody({ content, source, t }) {
			const sender = relaySender(source);
			/* v8 ignore next -- contextBody resolves the sender before choosing this body. */
			if (sender === null) return (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content,
				source,
				t
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("p", {
				className: ContextBody_module_css_default.relaySender,
				"data-context-relay-sender": true,
				children: t("message.context.relay.from", { session: sender })
			}), (0, react_jsx_runtime.jsx)(ModelFacingContent, {
				content,
				t
			})] });
		}
		/** The sending agent's session id, or null when the record does not name one. */
		function relaySender(source) {
			const sender = asRecord$1(source)?.["senderSessionId"];
			return typeof sender === "string" && sender !== "" ? sender : null;
		}
		/** Recalled sessions read off the source, or null when the record is unusable. */
		function recalledSessions(source) {
			const record = asRecord$1(source);
			const list = record === null ? void 0 : record["references"];
			if (!Array.isArray(list)) return null;
			const sessions = [];
			for (const item of list) {
				const reference = asRecord$1(item);
				if (reference === null) return null;
				const label = reference["label"];
				const retained = reference["retainedMessages"];
				const omitted = reference["omittedMessages"];
				const truncated = reference["truncated"];
				if (typeof label !== "string" || label === "" || typeof retained !== "number" || typeof omitted !== "number" || typeof truncated !== "boolean") return null;
				sessions.push({
					label,
					retained,
					omitted,
					truncated
				});
			}
			return sessions.length === 0 ? null : sessions;
		}
		/**
		* `recall` form: which sessions this material came from and how much of each
		* survived the read, then the material itself.
		*
		* Completeness is the fact a reader needs first: recalled context is bounded on
		* the way in, so a card that hid the omitted count would overstate what the
		* model received.
		* @param props - Durable content, its source, and the locale seat.
		* @returns The recall context body, or the opaque body when unreadable.
		*/
		function RecallBody({ content, source, t }) {
			const sessions = recalledSessions(source);
			if (sessions === null) return (0, react_jsx_runtime.jsx)(OpaqueBody, {
				content,
				source,
				t
			});
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("ul", {
				className: ContextBody_module_css_default.recalls,
				"data-context-recalls": true,
				children: sessions.map((session, index) => (0, react_jsx_runtime.jsxs)("li", {
					className: ContextBody_module_css_default.recall,
					children: [
						(0, react_jsx_runtime.jsx)("span", {
							className: ContextBody_module_css_default.recallLabel,
							children: session.label
						}),
						(0, react_jsx_runtime.jsx)("span", {
							className: ContextBody_module_css_default.recallCounts,
							children: t("message.context.recall.counts", {
								retained: session.retained,
								omitted: session.omitted
							})
						}),
						session.truncated && (0, react_jsx_runtime.jsx)("span", {
							className: ContextBody_module_css_default.recallCounts,
							children: t("message.context.recall.truncated")
						})
					]
				}, index))
			}), (0, react_jsx_runtime.jsx)(ModelFacingContent, {
				content,
				t
			})] });
		}
		/** The one-line account a `notice` puts on its collapsed row, when it records one. */
		function noticeSummary(source) {
			const summary = asRecord$1(source)?.["summary"];
			return typeof summary === "string" && summary !== "" ? summary : null;
		}
		/**
		* Choose the body for one context node.
		*
		* Returns the form the body actually rendered as, which is not always the
		* declared one: a declared form whose fields are unreadable falls back to
		* opaque, and the caller labels the row with what it really shows.
		* `summary` is the collapsed row's one-line account, which only a `notice`
		* records: its whole point is being readable without expanding.
		* @param form - the producer-declared form projected onto the node.
		* @param props - durable content, its source, and the locale seat.
		* @returns the rendered form (null for opaque), its collapsed summary, and its body.
		*/
		function contextBody(form, props) {
			const opaque = {
				rendered: null,
				summary: null,
				body: (0, react_jsx_runtime.jsx)(OpaqueBody, { ...props })
			};
			switch (form) {
				case "instructions": return instructionChanges(props.source) === null ? opaque : {
					rendered: "instructions",
					summary: null,
					body: (0, react_jsx_runtime.jsx)(InstructionsBody, { ...props })
				};
				case "catalog": return catalogEntries(props.source) === null ? opaque : {
					rendered: "catalog",
					summary: null,
					body: (0, react_jsx_runtime.jsx)(CatalogBody, { ...props })
				};
				case "snapshot": return snapshotSections(props.source) === null ? opaque : {
					rendered: "snapshot",
					summary: null,
					body: (0, react_jsx_runtime.jsx)(SnapshotBody, { ...props })
				};
				case "notice": {
					const summary = noticeSummary(props.source);
					return summary === null ? opaque : {
						rendered: "notice",
						summary,
						body: (0, react_jsx_runtime.jsx)(NoticeBody, { ...props })
					};
				}
				case "relay": return relaySender(props.source) === null ? opaque : {
					rendered: "relay",
					summary: null,
					body: (0, react_jsx_runtime.jsx)(RelayBody, { ...props })
				};
				case "recall": return recalledSessions(props.source) === null ? opaque : {
					rendered: "recall",
					summary: null,
					body: (0, react_jsx_runtime.jsx)(RecallBody, { ...props })
				};
				case null: return opaque;
				/* v8 ignore next 4 -- closed-union backstop; the compiler rejects a new
				KnownContextForm here rather than letting it degrade to opaque silently. */
				default: throw new Error(`unreachable context form: ${String(form)}`);
			}
		}
