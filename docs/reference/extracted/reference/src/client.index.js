// Extracted from @deepseek-ai/dsh-client-ui-reference (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Required services: the trigger registry, the Remote namespaces, and the copy. */
		const inject = [
			"inputTriggers",
			"locale",
			"sessions",
			"remote",
			"remote.fileReferences",
			"remote.sessionReferenceResolver",
			"sidebarRight",
			"slots",
			"uiConversation"
		];
		/**
		* Register the combined `@file` / `@session` source and independent file/folder text providers.
		* @param ctx - client root context.
		*/
		function apply(ctx) {
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-reference: dictionaries");
			const t = ctx.locale.bind(NS);
			const sessions = ctx.get("sessions");
			ctx.uiConversation.userText.register(fileReferenceRule);
			ctx.uiConversation.userText.register(folderReferenceRule);
			ctx.slots.inject("conversation.user.text.node", function* () {
				yield ctx.slots.register({
					name: "conversation.user.text.node",
					key: "file",
					priority: 100,
					locale: NS,
					inject: (sessionId) => ({
						resolveFilePath: (path) => resolveWorkspacePath(sessions.list.getSnapshot().byId[sessionId]?.cwd, path),
						openFile: (path) => {
							const cwd = sessions.list.getSnapshot().byId[sessionId]?.cwd;
							ctx.sidebarRight.openResource(fileAddressFor(sessionId, cwd, path));
						}
					})
				}, FileReference);
				yield ctx.slots.register({
					name: "conversation.user.text.node",
					key: "folder",
					priority: 100
				}, FolderReference);
			});
			const source = {
				trigger: "@",
				name: "reference",
				showGroupTitle: false,
				async candidates(session, { query, quoted, drilled, signal }) {
					if (sessions.binding(session.sessionId) === void 0) throw new Error(`reference candidates require a retained session "${session.sessionId}"`);
					const [fileItems, sessionItems] = await sessions.using(session.sessionId, {
						source: "referenceCandidates",
						signal
					}, async (reference) => {
						signal.throwIfAborted();
						const state = reference.binding.session.getSnapshot();
						if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${session.sessionId}" is not open`);
						const fileLookup = ctx.remote.fileReferences.list(session.sessionId, query, signal).then((result) => result.ok ? result.value : []);
						const sessionLookup = quoted === true ? Promise.resolve([]) : ctx.remote.sessionReferenceResolver.candidates(session.sessionId, query, signal).then((result) => result.ok ? result.value : []);
						return Promise.all([fileLookup, sessionLookup]);
					});
					if (signal.aborted) return [];
					const withLocation = crumbsFor(query, quoted === true, drilled, t) === void 0;
					const now = Date.now();
					const home = ctx.remote.$host.home;
					const listed = sessions.list.getSnapshot().byId;
					const sessionRows = sessionItems.map((candidate) => {
						const summary = listed[candidate.sessionId];
						const child = summary?.origin === "subagent" && summary.parentId === session.sessionId;
						return {
							child,
							row: sessionCandidate(candidate, candidate.displayTitle ?? candidate.label, summary?.updatedAt ?? candidate.createdAt, now, home, t(child ? "section.subagents" : "section.sessions"), t)
						};
					});
					return [
						...fileItems.flatMap((candidate) => fileCandidate(candidate, quoted === true, withLocation, t)),
						...sessionRows.filter((item) => item.child).map((item) => item.row),
						...sessionRows.filter((item) => !item.child).map((item) => item.row)
					];
				},
				header(_session, req) {
					return crumbsFor(req.query, req.quoted === true, req.drilled, t);
				},
				onPick({ candidate, action }) {
					const value = parseCandidate(candidate.value);
					if (value?.kind === "file") {
						if (value.fileKind === "directory" && action === "drill") return {
							text: value.mention,
							continue: true
						};
						return { insert: {
							source: "reference",
							ref: value.mention,
							label: value.fileKind === "directory" ? `${value.label}/` : value.label,
							appearance: value.fileKind === "directory" ? "folder" : "file",
							clipboardText: value.mention
						} };
					}
					if (value?.kind === "session") return { insert: {
						source: "reference",
						ref: value.mention,
						label: value.label,
						appearance: "session",
						clipboardText: value.mention
					} };
				},
				openReference(session, { ref, appearance }) {
					if (appearance !== "file") return false;
					const path = ref.startsWith("@\"") ? ref.slice(2, -1) : ref.slice(1);
					const cwd = sessions.list.getSnapshot().byId[session.sessionId]?.cwd;
					ctx.sidebarRight.openResource(fileAddressFor(session.sessionId, cwd, path));
					return true;
				},
				codec: {
					clipboardText: (ref) => ref,
					serialize: (ref) => Promise.resolve(ref)
				}
			};
			const inputTriggers = ctx.get("inputTriggers");
			ctx.effect(() => inputTriggers.registerSource(source), "ui-reference: @ source");
		}
		/**
		* The breadcrumb of a drilled directory listing, from the workspace root down
		* to the directory being listed.
		*
		* Only a drill produces one: a path the user typed carries its own context in
		* the draft, while a drill replaced the text they were reading with a deeper
		* one and owes them the way back.
		* @param query - the live query, path text following `@` or `@"`.
		* @param quoted - whether the active token is an open quoted path.
		* @param drilled - whether a drill pick, rather than typing, produced the query.
		* @param t - the reference dictionary.
		* @returns the crumbs, or undefined when this listing needs no header.
		*/
		function crumbsFor(query, quoted, drilled, t) {
			if (!drilled) return void 0;
			const slash = query.lastIndexOf("/");
			if (slash < 0) return void 0;
			const segments = query.slice(0, slash).split("/").filter((segment) => segment !== "");
			const crumbs = [{
				label: t("crumb.root"),
				value: directoryValue(t("crumb.root"), quoted ? "@\"" : "@")
			}];
			for (const [index, segment] of segments.entries()) {
				const mention = formatFileMention({
					path: segments.slice(0, index + 1).join("/"),
					kind: "directory"
				}, quoted);
				if (mention === void 0) return void 0;
				crumbs.push({
					label: segment,
					value: directoryValue(segment, mention),
					...index === segments.length - 1 ? { current: true } : {}
				});
			}
			return crumbs;
		}
		/** Project one directory destination as the drill payload `onPick` already understands. */
		function directoryValue(label, mention) {
			return JSON.stringify({
				kind: "file",
				fileKind: "directory",
				label,
				mention
			});
		}
		function fileCandidate(candidate, preserveQuote, withLocation, t) {
			const mention = formatFileMention(candidate, preserveQuote);
			if (mention === void 0) return [];
			const slash = candidate.path.lastIndexOf("/");
			const name = candidate.path.slice(slash + 1);
			const parent = slash < 0 ? "" : candidate.path.slice(0, slash);
			const directory = candidate.kind === "directory";
			const value = {
				kind: "file",
				fileKind: candidate.kind,
				label: name,
				mention
			};
			return [{
				name: `${name}${directory ? "/" : ""}`,
				...withLocation && parent !== "" ? { description: parent } : {},
				icon: directory ? "folder" : "file",
				section: t("section.files"),
				value: JSON.stringify(value),
				...directory ? { drill: true } : {}
			}];
		}
		function sessionCandidate(candidate, label, updatedAt, now, home, section, t) {
			const { unit, n } = (0, _deepseek_ai_dsh_client_ui_primitives.relativeTime)(updatedAt, now);
			const age = unit === "now" ? t("time.now") : t(`time.${unit}`, { n });
			const location = candidate.sameWorkspace ? void 0 : candidate.cwd === void 0 ? t("candidate.noCwd") : abbreviateHomePath(candidate.cwd, home);
			const value = {
				kind: "session",
				label,
				mention: candidate.mention
			};
			return {
				name: label,
				description: location === void 0 ? age : `${location} · ${age}`,
				icon: "session",
				section,
				value: JSON.stringify(value)
			};
		}
		function parseCandidate(value) {
			if (value === void 0) return void 0;
			return JSON.parse(value);
		}
