// Extracted from @deepseek-ai/dsh-client-ui-skill (lib/client.js); region lib/types/client/index.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Required services: reference source faces plus the tool-row and locale registries. */
		const inject = [
			"inputTriggers",
			"sessions",
			"slots",
			"locale",
			"remote",
			"remote.skills",
			"sidebarRight",
			"uiConversation"
		];
		/**
		* Client plugin body: register the '/' source, dictionaries, and keyed tool row.
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
			}), "ui-skill: dictionaries");
			ctx.uiConversation.userText.register(skillReferenceRule);
			ctx.slots.inject("tool.call.toolview", () => ctx.slots.register({
				name: "tool.call.toolview",
				key: "skill",
				locale: NS
			}, SkillRow));
			const skills = ctx.remote.skills;
			const sessions = ctx.sessions;
			const fetches = /* @__PURE__ */ new Map();
			const lexiconListeners = /* @__PURE__ */ new Map();
			const notifyLexicon = (sessionId) => {
				for (const listener of [...lexiconListeners.get(sessionId) ?? []]) try {
					listener();
				} catch (error) {
					console.error("[ui-skill] lexicon listener failed:", error);
				}
			};
			const fetchCatalog = (sessionId) => {
				const existing = fetches.get(sessionId);
				if (existing !== void 0) return existing;
				const abort = new AbortController();
				const promise = (async () => {
					if (sessions.binding(sessionId) === void 0) throw new Error(`skill catalog requires a retained session "${sessionId}"`);
					return sessions.using(sessionId, {
						source: "skillCatalog",
						signal: abort.signal
					}, async (reference) => {
						abort.signal.throwIfAborted();
						const state = reference.binding.session.getSnapshot();
						if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
						const result = await skills.list({ sessionId }, abort.signal);
						abort.signal.throwIfAborted();
						if (!result.ok) throw new Error(`skills/list failed: ${result.error.code}: ${result.error.message}`);
						return result.value.skills;
					});
				})();
				const entry = {
					promise,
					abort
				};
				fetches.set(sessionId, entry);
				promise.then((skills) => {
					entry.settled = skills;
					notifyLexicon(sessionId);
				}, () => {
					if (fetches.get(sessionId) === entry) fetches.delete(sessionId);
				});
				return entry;
			};
			const invalidate = (key) => {
				const entry = fetches.get(key);
				if (entry === void 0) return;
				fetches.delete(key);
				entry.abort.abort();
				notifyLexicon(key);
			};
			const clearAll = () => {
				for (const key of [...fetches.keys()]) invalidate(key);
			};
			const t = ctx.locale.bind(NS);
			const source = {
				trigger: "/",
				name: "skill",
				order: 2,
				async candidates(session, { query, signal }) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return [];
					const skills = await fetchCatalog(session.sessionId).promise;
					if (signal.aborted) return [];
					return (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(skills, query).map((skill) => ({
						name: skill.name,
						description: skill.modelInvocable ? skill.description : `${t("menu.userOnly")} · ${skill.description}`
					}));
				},
				warm(session) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return;
					fetchCatalog(session.sessionId).promise.catch(() => {});
				},
				lexicon(session) {
					return fetches.get(session.sessionId)?.settled?.map((skill) => skill.name);
				},
				subscribeLexicon(session, listener) {
					const key = session.sessionId;
					const listeners = lexiconListeners.get(key) ?? /* @__PURE__ */ new Set();
					listeners.add(listener);
					lexiconListeners.set(key, listeners);
					return () => {
						listeners.delete(listener);
						if (listeners.size === 0) lexiconListeners.delete(key);
					};
				},
				openReference(session, { ref }) {
					if (sessions.subagentAddress(session.sessionId) !== void 0) return false;
					const cwd = sessions.list.getSnapshot().byId[session.sessionId]?.cwd;
					const open = (catalog) => {
						const path = catalog.find((skill) => `/${skill.name}` === ref)?.path;
						if (path === void 0) return false;
						ctx.sidebarRight.openResource(fileAddressFor(session.sessionId, cwd, path));
						return true;
					};
					const settled = fetches.get(session.sessionId)?.settled;
					if (settled !== void 0) return open(settled);
					const entry = fetchCatalog(session.sessionId);
					entry.promise.then((catalog) => {
						if (!entry.abort.signal.aborted) open(catalog);
					}).catch((error) => {
						if (!entry.abort.signal.aborted) console.error("[ui-skill] reference preview failed:", error);
					});
					return true;
				},
				onPick({ candidate }) {
					return { text: `/${candidate.name} ` };
				}
			};
			ctx.slots.inject("conversation.user.text.node", () => ctx.slots.register({
				name: "conversation.user.text.node",
				key: "skill",
				priority: 100,
				inject: (sessionId) => ({ openSkill: (name) => {
					if (sessions.scope(sessionId) === void 0) return;
					source.openReference({ sessionId }, { ref: `/${name}` });
				} })
			}, SkillReference));
			const inputTriggers = ctx.get("inputTriggers");
			ctx.remote.$on("agent-preset/selected", invalidate);
			ctx.remote.$on("plugin-manager/changed", clearAll);
			ctx.on("connection/reset", clearAll);
			ctx.effect(() => {
				const unregister = inputTriggers.registerSource(source);
				return () => {
					unregister();
					clearAll();
				};
			}, "ui-skill: source");
		}
