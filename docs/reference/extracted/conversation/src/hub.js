// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/input/hub.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Session-addressed input facade registry (SessionInputResolver face + composer-layer extras). */
		var InputHub = class {
			rootCtx;
			t;
			shells = /* @__PURE__ */ new WeakMap();
			/**
			* @param ctx - client root context (services resolved lazily per call — boot order stays free).
			* @param t - conversation-namespace translate thunk (reads the active locale at call time).
			*/
			constructor(rootCtx, t) {
				this.rootCtx = rootCtx;
				this.t = t;
			}
			/**
			* Resolve the facade for one session-scope ctx (SessionInputResolver face).
			* @param actx - session-scope context.
			* @returns the resident per-session facade.
			*/
			for(actx) {
				const sessions = this.sessions();
				const session = sessions.sessionOf(actx);
				const binding = session === void 0 ? void 0 : sessions.binding(session.sessionId);
				if (binding === void 0 || binding.session !== session) throw new Error("conversation.input.for requires a retained Session scope");
				return this.shellFor(binding);
			}
			requestDraftInitialization(binding, options) {
				if (this.sessions().binding(binding.sessionId) !== binding) throw new Error("conversation.input.requestDraftInitialization requires a retained Session binding");
				return this.shellFor(binding).requestDraftInitialization(options);
			}
			/**
			* Resolve the resident shell for an already-retained, addressable Session binding.
			* Draft import completes before return. The Session scope owns input listeners,
			* the inject-managed catalog subscription, and shell teardown.
			* @param binding - session assembly handle.
			* @returns the shell.
			*/
			shellFor(binding) {
				const existing = this.shells.get(binding);
				if (existing !== void 0) return existing;
				const { session, ctx: actx } = binding;
				const shell = new SessionInputShell({
					actx,
					submissionState: () => {
						const state = session.getSnapshot();
						const model = session.projections.faceOf("modelSelection").getSnapshot();
						const plan = session.projections.faceOf("plan").getSnapshot();
						const goal = session.projections.faceOf("goal").getSnapshot();
						const agentPreset = session.projections.faceOf("agentPreset").getSnapshot();
						const selection = model?.next ?? model?.lastUsed;
						return Object.freeze({
							...state.blank ? {} : { sessionId: state.sessionId },
							...selection == null ? {} : { model: Object.freeze({
								provider: selection.provider,
								name: selection.model,
								...selection.reasoningEffort === void 0 ? {} : { effort: selection.reasoningEffort }
							}) },
							runMode: plan?.active ? "plan" : goal?.goal.phase === "active" ? "goal" : "default",
							running: state.running,
							newSession: state.blank,
							...typeof agentPreset === "string" ? { agentPreset } : {}
						});
					},
					messageSubmitted: (submission) => {
						reportMessageSubmission(this.rootCtx, submission);
					},
					inputTriggers: () => this.controller(actx),
					popup: () => this.popup(actx),
					inbox: session.projections.faceOf("inbox"),
					defaultSink: (text, attachmentIds, mode, signal, accept) => this.sink(session, text, attachmentIds, mode, signal, accept),
					quoteRemoveLabel: () => this.t("quote.remove"),
					quoteInsertionAllowed: () => {
						const state = session.getSnapshot();
						return !state.removed && (state.subagent === null || state.subagent.address.mode === "continuable" && state.subagent.parentAvailable === true) && this.conversation().blocks.storeFor(session.sessionId).getSnapshot() === void 0;
					},
					steerQueue: () => {
						this.steerQueue(session, shell);
					},
					commandAttachments: {
						serialize: async (ids) => {
							return (await this.conversation().serializeDraftAttachments(ids)).attachments;
						},
						release: (ids) => {
							const conversation = this.rootCtx.get("conversation");
							for (const attachmentId of ids) conversation?.releaseDraftAttachment(attachmentId);
						},
						unsupportedNotice: (token) => this.t("command.attachmentsUnsupported", { command: token.trim().replace(/^\//u, "") })
					}
				});
				this.shells.set(binding, shell);
				actx.effect(() => {
					const offs = [
						actx.on("slash/input-begin-command", (req) => shell.beginCommand(req.claim, req.span) ? true : void 0),
						actx.on("slash/input-insert-reference", (req) => shell.insertReference(req.reference, req.span) ? true : void 0),
						actx.on("slash/input-consume-token", (req) => shell.consumeToken(req.guard) ? true : void 0),
						actx.on("slash/input-insert-text", (req) => shell.insertText(req.text, req.span, req.continue === true) ? true : void 0)
					];
					return () => {
						for (const off of offs) off();
						const drafts = shell.dispose();
						this.shells.delete(binding);
						const conversation = this.rootCtx.get("conversation");
						for (const attachmentId of drafts) conversation?.releaseDraftAttachment(attachmentId);
					};
				}, "conversation.input: session shell");
				actx.inject(["inputTriggers"], (scope) => {
					scope.effect(() => {
						shell.refreshLexiconSubscription();
						return () => {
							shell.refreshLexiconSubscription();
						};
					}, "conversation.input: reference catalogs");
				});
				shell.setDraft(readConversationDraft(binding.sessionId));
				return shell;
			}
			/**
			* Resident shell by session id (service-face path; the provide channel has
			* normally created it already — this covers direct id-addressed access).
			* @param id - session id.
			* @returns the shell.
			*/
			shell(id) {
				const binding = this.sessions().binding(id);
				if (binding === void 0) throw new Error(`conversation.input: session "${id}" resolved no binding`);
				return this.shellFor(binding);
			}
			/**
			* The InputBar-exclusive keyboard command face: the shell
			* satisfies it structurally; package-internal — handed through the
			* composer-bar entry's inject, never across a plugin boundary.
			* @param id - session id.
			* @returns the shell as the keyboard face.
			*/
			keyboard(id) {
				return this.shell(id);
			}
			/**
			* Query file intake without creating a Session input.
			* @param id - target Session.
			* @returns whether its mounted composer currently accepts files.
			*/
			canPickFiles(id) {
				const binding = this.sessions().binding(id);
				return binding !== void 0 && this.shells.get(binding)?.canPickFiles() === true;
			}
			/**
			* Open the target composer's file dialog under its live intake policy.
			* @param id - target Session.
			*/
			pickFiles(id) {
				const binding = this.sessions().binding(id);
				if (binding !== void 0) this.shells.get(binding)?.pickFiles();
			}
			/**
			* Resolve the optional slash controller for composer chrome that launches
			* the shared candidate menu without typing a trigger.
			* @param id - session id.
			* @returns the resident controller, or undefined when no trigger provider is installed.
			*/
			inputTriggers(id) {
				const binding = this.sessions().binding(id);
				return binding === void 0 ? void 0 : this.controller(binding.ctx);
			}
			/**
			* Default sink: prompt while the composer holds the sent draft. The session
			* is always a real host entity (materialized when its workspace was picked),
			* so there is exactly one path; a refused or failed prompt is an ordinary
			* prompt failure (banner via promptError, draft kept in the composer).
			*/
			sink(session, text, attachmentIds, mode, signal, accept) {
				if (text === "" && attachmentIds.length === 0) return Promise.resolve({ kind: "success" });
				return this.conversation().sendSession(session, text, attachmentIds, mode, signal, accept);
			}
			/**
			* Submit every still-pending queued message through QueueDock Steer, in FIFO
			* request order — the same operation as the queue dock's per-row button.
			* An Agent stopping before a command (`session/steer-unavailable`) or a row already
			* claimed by the agent (`session/queue-item-not-found`) converges silently, while a
			* genuine failure surfaces as one composer notice. Repeated triggers
			* (e.g. two rapid empty-draft chords) rely on that `session/queue-item-not-found`
			* convergence: the snapshot may still list a row the host already steered,
			* and the duplicate Steer is a silent no-op.
			* @param session - the addressed host session.
			* @param shell - the resident shell (notice outlet).
			*/
			async steerQueue(session, shell) {
				const queued = session.projections.faceOf("inbox").getSnapshot()?.["next-turn"] ?? [];
				if (queued.length === 0) return;
				for (const item of queued) {
					const result = await session.updateQueue(item.id, { kind: "steer" });
					if (result.ok) continue;
					if (result.error.code === "session/steer-unavailable" || result.error.code === "session/queue-item-not-found") return;
					shell.notify("error", this.t("queue.steerFailed"));
					return;
				}
			}
			controller(actx) {
				if (this.sessions().sessionOf(actx) === void 0) return void 0;
				return this.rootCtx.get("inputTriggers")?.sessionOf(actx);
			}
			popup(actx) {
				if (this.sessions().sessionOf(actx) === void 0) return void 0;
				return this.rootCtx.get("commandUi")?.popupFor(actx);
			}
			sessions() {
				const sessions = this.rootCtx.get("sessions");
				if (sessions === void 0) throw new Error("conversation.input: sessions service unavailable");
				return sessions;
			}
			conversation() {
				const conversation = this.rootCtx.get("conversation");
				if (conversation === void 0) throw new Error("conversation.input: conversation service unavailable");
				return conversation;
			}
		};
