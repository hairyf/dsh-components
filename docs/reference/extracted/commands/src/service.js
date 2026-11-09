// Extracted from @deepseek-ai/dsh-client-ui-commands (lib/client.js); region lib/types/client/service.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* CommandUiRuntime (`ctx.commandUi`): the '/' command source over the
		* session-keyed directory, the client-contribution registry, and the
		* per-session popupSelect controllers. Candidate synthesis merges the host
		* catalog with contributions by availability, gives built-in Host rows their
		* localized face (presentation.ts), then position-filters; an empty query
		* lists the Add and Commands sections in usage order, a typed query ranks
		* every row by the `/` menu's shared name-and-label ranking (ui-primitives
		* `rankByName`). A host/contribution name collision fails loud. Every
		* execute addresses the session's agent by sessionId — sessions are always
		* agent-backed.
		* Catalog RPCs retain an existing Client Session through completion and
		* wait for its initial history open to succeed before contacting the Host.
		*/
		/** Recover the command name from a line the Host confirmed as executed. */
		function submittedCommandName(line) {
			const trimmed = line.trim();
			const separator = trimmed.search(/\s/u);
			return (separator === -1 ? trimmed : trimmed.slice(0, separator)).slice(1);
		}
		/** Command surface: session-keyed directory + '/' source + contribution registry + per-session popups. */
		var CommandUiRuntime = class extends _deepseek_ai_cordis.Service {
			static inject = [
				"inputTriggers",
				"sessions",
				"remote",
				"remote.commands"
			];
			directory;
			live = {
				contributions: /* @__PURE__ */ new Map(),
				decorations: /* @__PURE__ */ new Map(),
				popups: new WeakMapWithValues()
			};
			/** `command`-namespace translator (composer refusal notices). */
			t;
			/**
			* @param ctx - owning root context (plugin fiber; the service registers
			* itself as `command` and follows that fiber's lifetime).
			*/
			constructor(ctx) {
				super(ctx, "commandUi");
				const locale = ctx.get("locale");
				if (locale === void 0) throw new Error("ui-commands: locale service unavailable");
				this.t = locale.bind("command");
				this.directory = new CommandDirectory(async (sessionId) => {
					const sessions = this.sessions();
					if (sessions.subagentAddress(sessionId) !== void 0) return [];
					if (sessions.binding(sessionId) === void 0) throw new Error(`command catalog requires a retained session "${sessionId}"`);
					return sessions.using(sessionId, { source: "commandCatalog" }, async (reference) => {
						const state = reference.binding.session.getSnapshot();
						if (state.openState !== "open") throw state.openError ?? /* @__PURE__ */ new Error(`session "${sessionId}" is not open`);
						const result = await ctx.remote.commands.list(sessionId);
						if (!result.ok) throw new Error(`command.list failed: ${result.error.code}: ${result.error.message}`);
						return result.value;
					});
				});
				const inputTriggers = ctx.get("inputTriggers");
				if (inputTriggers === void 0) throw new Error("ui-commands: slash service unavailable");
				ctx.effect(() => inputTriggers.registerSource({
					trigger: "/",
					name: "command",
					candidates: (session, req) => this.candidates(session, req),
					onPick: (pick) => this.dispatch(pick),
					matchSpace: (session, token) => this.matchSpace(session, token),
					matchClaim: (session, token, signal) => this.matchClaim(session, token, signal),
					matchEnter: (session, line, signal, envelope) => this.matchEnter(session, line, signal, envelope),
					warm: (session) => {
						this.directory.warm(session.sessionId);
					}
				}), "command: slash source");
				ctx.remote.$on("commands/change", () => {
					this.directory.invalidateAll();
				});
				ctx.remote.$on("agent-preset/selected", (sessionId) => {
					this.directory.resetSession(sessionId);
				});
				ctx.on("connection/reset", () => {
					this.directory.resetConnected();
				});
			}
			/**
			* Register one client command contribution; effect disposer (rides the
			* caller's fiber). Duplicate names throw.
			* @param contribution - the contribution (descriptor + availability + popup spec).
			* @returns the disposer removing the registration.
			*/
			register(contribution) {
				const dispose = this.ctx.effect(() => {
					const { contributions } = this.live;
					if (contributions.has(contribution.name)) throw new Error(`ui-commands: duplicate contribution for /${contribution.name}`);
					contributions.set(contribution.name, contribution);
					return () => {
						contributions.delete(contribution.name);
					};
				}, "command.register()");
				return () => {
					dispose();
				};
			}
			/**
			* Hang a bare-invocation decoration on one host command; effect disposer
			* (rides the caller's fiber). Duplicate names throw.
			* @param decoration - host command name + availability + popup spec.
			* @returns the disposer removing the registration.
			*/
			decorate(decoration) {
				const dispose = this.ctx.effect(() => {
					const { decorations } = this.live;
					if (decorations.has(decoration.name)) throw new Error(`ui-commands: duplicate decoration for /${decoration.name}`);
					decorations.set(decoration.name, decoration);
					return () => {
						decorations.delete(decoration.name);
					};
				}, "command.decorate()");
				return () => {
					dispose();
				};
			}
			/**
			* Close every open popup for a command whose options have become stale.
			* Pending loads and confirmations lose their binding; drafts stay intact.
			* @param name - command name without the leading slash.
			*/
			dismiss(name) {
				for (const popup of this.live.popups.values) if (popup.state.getSnapshot().command === name) popup.dismiss({ focusComposer: true });
			}
			/**
			* Resolve the per-session popup controller (lazy; dies with the session
			* scope). The controller's consume callback dispatches the scoped
			* consume-token event back to this session; focusComposer reaches the
			* session's composer through the conversation input face.
			* @param actx - session-scope ctx.
			* @returns the resident controller.
			* @throws when the Context no longer belongs to a retained Session generation.
			*/
			popupFor(actx) {
				const sessions = this.sessions();
				const session = sessions.sessionOf(actx);
				const binding = session === void 0 ? void 0 : sessions.binding(session.sessionId);
				if (binding === void 0 || binding.session !== session) throw new Error("command.popupFor requires a retained Session scope");
				const { popups } = this.live;
				const existing = popups.get(binding);
				if (existing !== void 0) return existing;
				const controller = new PopupSelectController({
					consume: (segment) => binding.ctx.bail(binding.ctx, "slash/input-consume-token", { guard: segment.via === "menu" ? {
						kind: "span",
						span: segment.span
					} : {
						kind: "bare-token",
						token: segment.token
					} }) === true,
					focusComposer: () => {
						binding.ctx.get("conversation")?.input.for(binding.ctx).focus();
					}
				});
				popups.set(binding, controller);
				binding.ctx.effect(() => () => {
					controller.dispose();
					popups.delete(binding);
				}, "command: session popup");
				return controller;
			}
			/**
			* Menu candidates: host catalog + contribution availability, built-in rows
			* localized, then position filtering; sections for an empty query, the
			* shared name-and-label ranking for a typed one.
			*/
			async candidates(session, req) {
				const list = await this.directory.ensureReady(session.sessionId, req.signal);
				const rows = [];
				const seen = /* @__PURE__ */ new Set();
				for (const c of list) {
					seen.add(c.name);
					rows.push({
						name: c.name,
						...builtinRowFace(c, this.t) ?? { description: c.description },
						...c.input !== void 0 ? { hint: c.input.hint } : {}
					});
				}
				for (const contribution of this.live.contributions.values()) {
					if (!contribution.available(session)) continue;
					if (seen.has(contribution.name)) throw new Error(`ui-commands: contribution /${contribution.name} collides with a host command`);
					rows.push({
						name: contribution.name,
						...contribution.label === void 0 ? {} : { label: contribution.label() },
						...contribution.description === void 0 ? {} : { description: contribution.description() },
						...contribution.icon === void 0 ? {} : { icon: contribution.icon }
					});
				}
				const visible = rows.filter((c) => req.position === "leading" || c.hint === void 0);
				return req.query === "" ? sectionRows(visible, this.t) : (0, _deepseek_ai_dsh_client_ui_primitives.rankByName)(visible, req.query);
			}
			/** Decision table, menu column: contribution/decorated-host → popup or action; host input → claim; host bare → detached execute. */
			dispatch(pick) {
				const name = pick.candidate.name;
				const contribution = this.live.contributions.get(name);
				if (contribution !== void 0 && contribution.available(pick.session)) {
					this.invoke(name, contribution.ui, pick.session, {
						via: "menu",
						span: pick.span
					});
					return "handled";
				}
				const desc = this.directory.resolve(pick.session.sessionId, name);
				if (desc === void 0) return void 0;
				const decoration = this.live.decorations.get(name);
				if (decoration !== void 0 && decoration.available(pick.session)) {
					this.invoke(name, decoration.ui, pick.session, {
						via: "menu",
						span: pick.span
					});
					return "handled";
				}
				if (desc.input !== void 0) return { claim: this.leadingClaim(desc, pick.session, claimToken(desc, this.t)) };
				this.consumeVia(pick.session.sessionId, {
					via: "menu",
					span: pick.span
				});
				this.runDetached(desc, pick.session, `/${name}`);
				return "handled";
			}
			/** Decision table, space column: hot-key sync check; only host leadingInput claims. */
			matchSpace(session, token) {
				const claim = this.claimOf(session, token);
				return claim === void 0 ? void 0 : { claim };
			}
			/**
			* Restore column: the space column's answer once the session's catalog is
			* ready (a warmup failure rejects). It only resolves; nothing is invoked or
			* executed.
			*/
			async matchClaim(session, token, signal) {
				await this.directory.ensureReady(session.sessionId, signal);
				return this.claimOf(session, token);
			}
			/** The host leadingInput claim a token names in the hot catalog; popup and action kinds never claim. */
			claimOf(session, token) {
				if (!token.startsWith("/")) return void 0;
				if (this.live.contributions.has(token.slice(1))) return void 0;
				const desc = this.directory.resolve(session.sessionId, token.slice(1));
				if (desc === void 0 || desc.input === void 0) return void 0;
				return this.leadingClaim(desc, session, token.slice(1));
			}
			/**
			* Decision table, enter column. Strong-waits the session's catalog (a
			* warmup failure rejects — never a silent downgrade). Contributions and
			* bare host commands act on the bare token only; leadingInput claims
			* args-tolerant.
			*
			* Envelope policy: an enter submission carrying attachments resolves only
			* through a command declaring attachment acceptance. Every other submitting
			* route — popup, non-accepting claim, bare detached execute — throws the
			* refusal so the machine surfaces one composer notice and the draft and
			* attachments stay in place; nothing executes and nothing is dropped. An
			* action submits nothing and runs regardless.
			*
			* A typed token is resolved through the localized claim tokens, so a line
			* written as `/计划` reaches the `plan` descriptor and executes as `/plan`.
			*/
			async matchEnter(session, line, signal, envelope) {
				const trimmed = line.trim();
				if (!trimmed.startsWith("/")) return void 0;
				const ws = trimmed.search(/\s/);
				const token = ws === -1 ? trimmed : trimmed.slice(0, ws);
				const bare = ws === -1;
				const typedName = token.slice(1);
				if (typedName === "") return void 0;
				const refuseAttachments = () => {
					throw new Error(this.t("notice.attachmentsUnsupported", { command: typedName }));
				};
				const contribution = this.live.contributions.get(typedName);
				if (contribution !== void 0 && contribution.available(session)) {
					if (!bare) return void 0;
					if (envelope.attachments > 0 && contribution.ui.kind !== "action") refuseAttachments();
					this.invoke(typedName, contribution.ui, session, {
						via: "enter",
						token
					});
					return "handled";
				}
				await this.directory.ensureReady(session.sessionId, signal);
				const desc = this.directory.resolve(session.sessionId, typedName);
				if (desc === void 0) return void 0;
				const name = desc.name;
				const canonical = `/${name}${trimmed.slice(token.length)}`;
				if (bare) {
					const decoration = this.live.decorations.get(name);
					if (decoration !== void 0 && decoration.available(session)) {
						if (envelope.attachments > 0 && decoration.ui.kind !== "action") refuseAttachments();
						this.invoke(name, decoration.ui, session, {
							via: "enter",
							token
						});
						return "handled";
					}
				}
				if (desc.input !== void 0) {
					if (envelope.attachments > 0 && desc.input.attachments !== true) refuseAttachments();
					return { claim: this.leadingClaim(desc, session, token.slice(1)) };
				}
				if (!bare) return void 0;
				if (envelope.attachments > 0) refuseAttachments();
				this.consumeVia(session.sessionId, {
					via: "enter",
					token
				});
				this.runDetached(desc, session, canonical);
				return "handled";
			}
			/**
			* Invoke one contribution or decoration (menu pick / bare enter): open the
			* session's popup, or consume the token and run the action.
			*/
			invoke(name, ui, session, segment) {
				if (ui.kind === "action") {
					this.consumeVia(session.sessionId, segment);
					ui.run(session);
					return;
				}
				const actx = this.scopeFor(session.sessionId);
				if (actx === void 0) return;
				this.popupFor(actx).open(name, ui, session, segment);
			}
			/**
			* Build the leadingInput claim. The composer keeps the claimed token in
			* the draft and reads the arguments after it, so the token is the spelling
			* the draft will carry: the locale's token for a menu pick, the typed
			* spelling for Space and Enter. The command.execute submit transaction
			* always sends the catalog name.
			*/
			leadingClaim(desc, session, shown) {
				const token = `/${shown} `;
				const line = `/${desc.name} `;
				return {
					name: desc.name,
					token,
					...desc.input !== void 0 ? { hint: desc.input.hint } : {},
					...desc.input?.attachments === true ? { attachments: true } : {},
					submit: (args, _actx, attachments) => this.execute(session, line + args, attachments)
				};
			}
			/**
			* The command.execute transaction, addressed to the session's agent — pure
			* admission semantics. An unmatched line reports an error outcome (the
			* composer's immediate admission feedback); an admitted command reports
			* plain success regardless of its handler outcome, because the host
			* executor durably logged the lifecycle (`command/run`/`command/done`) and
			* the outcome renders as a persistent flow node — the composer never
			* echoes it. A handler error result reports an error outcome so the
			* composer keeps the draft and attachments for correction.
			* A refused call throws.
			*/
			async execute(session, line, attachments = []) {
				const result = await this.ctx.remote.commands.execute(session.sessionId, line, attachments);
				if (!result.ok) throw new Error(`command.execute failed: ${result.error.code}: ${result.error.message}`);
				if (result.value === void 0) return {
					kind: "error",
					text: `unknown or malformed command: ${line}`
				};
				this.notifyExecuted(session.sessionId, submittedCommandName(line), result.value.result);
				if (attachments.length > 0 && result.value.result.kind === "error") return {
					kind: "error",
					text: result.value.result.text
				};
				return { kind: "success" };
			}
			/** Publish the local acknowledgment without letting an observer change command admission. */
			notifyExecuted(sessionId, name, result) {
				const args = [
					"command/executed",
					sessionId,
					name,
					result
				];
				for (const listener of this.ctx.events.dispatch("emit", args)) try {
					const returned = listener(sessionId, name, result);
					if (returned != null && typeof returned.then === "function") Promise.resolve(returned).then(void 0, (error) => {
						this.warnExecutedListenerFailure(name, error);
					});
				} catch (error) {
					this.warnExecutedListenerFailure(name, error);
				}
			}
			/** Log one contained `command/executed` observer failure. */
			warnExecutedListenerFailure(name, error) {
				this.ctx.logger.warn("client command: a command/executed listener for \"%s\" failed", name);
				this.ctx.logger.warn(error);
			}
			/**
			* Fire-and-forget execute for the internal ('handled') paths. Outcomes are
			* NOT surfaced here: the host executor durably logs the command lifecycle
			* (`command/run`/`command/done`), and the mux-broadcast events render as a
			* persistent flow node on every tab. Only an admission failure — which never
			* entered a handler and therefore never logged — falls back to the composer
			* notice as immediate feedback.
			*/
			runDetached(desc, session, line) {
				this.execute(session, line).then((outcome) => {
					if (outcome.kind === "error") this.noticeFor(session.sessionId, "error", outcome.text ?? `/${desc.name} failed`);
				}, (error) => {
					this.noticeFor(session.sessionId, "error", error instanceof Error ? error.message : String(error));
				});
			}
			/** Dispatch a consume-token event to one session (menu-pick / bare-enter execute paths). */
			consumeVia(id, segment) {
				const actx = this.scopeFor(id);
				if (actx === void 0) return;
				actx.bail(actx, "slash/input-consume-token", { guard: segment.via === "menu" ? {
					kind: "span",
					span: segment.span
				} : {
					kind: "bare-token",
					token: segment.token
				} });
			}
			/** Route an admission failure to the session's composer notice channel (scope gone = attempt died with it). */
			noticeFor(id, level, text) {
				const actx = this.scopeFor(id);
				if (actx === void 0) return;
				const conversation = actx.get("conversation");
				if (conversation === void 0) return;
				conversation.input.for(actx).notify(level, text);
			}
			/** id → actx interchange (registered exchange point: this service coordinates for projection-only sources). */
			scopeFor(id) {
				return this.sessions().scope(id);
			}
			sessions() {
				const sessions = this.ctx.get("sessions");
				if (sessions === void 0) throw new Error("ui-commands: sessions service unavailable");
				return sessions;
			}
		};
