// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/assembly.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Per-Session target-neutral Conversation assembly. */
		var BoundConversation = class {
			assembler;
			snapshot;
			openTurn;
			viewStore;
			targetSources = /* @__PURE__ */ new Map();
			revision = -1;
			frame;
			disposeFeed = () => {};
			constructor(feed, assembler) {
				this.assembler = assembler;
				this.viewStore = assembler;
				this.snapshot = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.currentSnapshot());
				this.openTurn = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(assembler.openTurn());
				this.replace(feed.getSnapshot());
				this.disposeFeed = feed.subscribe(() => {
					this.accept(feed.getSnapshot());
				});
			}
			target(target) {
				let source = this.targetSources.get(target);
				if (source === void 0) {
					const views = this.viewStore;
					source = {
						getSnapshot: () => views.get(target),
						subscribe: (listener) => {
							const unsubscribe = this.snapshot.subscribe(listener);
							this.activate(target);
							return unsubscribe;
						}
					};
					this.targetSources.set(target, source);
				}
				return source;
			}
			activate(target) {
				if (this.assembler.activateTarget(target)) this.snapshot.set(this.currentSnapshot());
				this.openTurn.set(this.assembler.openTurn());
			}
			rebuild() {
				this.publish(this.assembler.rebuildRegistry());
			}
			dispose() {
				this.cancelFrame();
				this.disposeFeed();
			}
			replace(window) {
				this.revision = window.revision;
				this.publish(this.assembler.replaceWindow(window.entries, window.hasMore));
			}
			accept(window) {
				if (window.revision === this.revision) return;
				if (window.revision !== this.revision + 1 || window.change.kind === "replace") {
					this.replace(window);
					return;
				}
				this.revision = window.revision;
				switch (window.change.kind) {
					case "prepend":
						this.publish(this.assembler.prepend(window.change.entries, window.hasMore));
						return;
					case "append": {
						let publication = "none";
						for (const event of window.change.entries) {
							const next = this.assembler.append(event);
							if (next === "immediate" || publication === "none") publication = next;
						}
						this.publish(publication);
						return;
					}
					case "settle-assistant":
						this.publish(this.assembler.settleAssistant(window.change.attemptId, window.change.entry));
						return;
				}
			}
			publish(publication) {
				if (publication === "none") return;
				if (publication === "animation-frame" && typeof requestAnimationFrame === "function") {
					if (this.frame !== void 0) return;
					this.frame = requestAnimationFrame(() => {
						this.frame = requestAnimationFrame(() => {
							this.frame = requestAnimationFrame(() => {
								this.frame = void 0;
								this.flush();
							});
						});
					});
					return;
				}
				this.cancelFrame();
				this.flush();
			}
			cancelFrame() {
				if (this.frame !== void 0 && typeof cancelAnimationFrame === "function") cancelAnimationFrame(this.frame);
				this.frame = void 0;
			}
			flush() {
				if (this.assembler.flush()) this.snapshot.set(this.currentSnapshot());
				this.openTurn.set(this.assembler.openTurn());
			}
			currentSnapshot() {
				return {
					views: this.viewStore,
					activeTargets: this.assembler.activityTargets()
				};
			}
		};
		/** Root service owning Conversation registries and per-Session bindings. */
		var UiConversation = class extends _deepseek_ai_cordis.Service {
			sessions;
			/** Registry of event matchers and target snapshot builders. */
			events;
			/** Registry of target View definitions. */
			views;
			/** Business grouping rules over already materialized target Nodes. */
			groups;
			/** Pure text rules and parser snapshots, independent of durable Session assembly. */
			userText;
			/** Plugin-owned handlers for selection and context-menu gestures. */
			interactions;
			bindings = new WeakMapWithValues();
			images;
			/**
			* @param ctx - owning Client context.
			* @param sessions - Session Controller object layer.
			*/
			constructor(ctx, sessions) {
				super(ctx, "uiConversation");
				this.sessions = sessions;
				this.events = new ConversationEventRegistry(ctx);
				this.views = new ConversationViewRegistry(ctx);
				this.groups = new ConversationGroupRegistry(ctx, this.views);
				this.userText = new UserTextRegistry(ctx);
				this.interactions = new ConversationInteractionRegistry(ctx);
				this.images = new HistoricalImageCache(ctx, sessions);
				const rebuild = () => {
					for (const record of this.bindings.values) record.binding.rebuild();
				};
				let rebuildQueued = false;
				const scheduleRebuild = () => {
					if (rebuildQueued) return;
					rebuildQueued = true;
					queueMicrotask(() => {
						rebuildQueued = false;
						rebuild();
					});
				};
				ctx.effect(() => {
					const disposeEvents = this.events.subscribe(scheduleRebuild);
					const disposeViews = this.views.subscribe(scheduleRebuild);
					const disposeGroups = this.groups.subscribe(scheduleRebuild);
					return () => {
						disposeGroups();
						disposeViews();
						disposeEvents();
						for (const record of [...this.bindings.values]) this.drop(record, true);
					};
				}, "ui-conversation assembly");
			}
			/**
			* Resolve the Conversation binding for one Controller binding or Session id.
			* @param source - Session binding or identity.
			* @returns stable Conversation binding.
			* @throws if the Session is unknown or its binding is no longer current.
			*/
			binding(source) {
				const sessionId = typeof source === "string" ? source : source.sessionId;
				const owner = typeof source === "string" ? this.sessions.binding(source) : source;
				if (owner === void 0) throw new Error(`uiConversation.binding: unknown session "${sessionId}"`);
				if (this.sessions.binding(sessionId) !== owner) throw new Error(`uiConversation.binding: inactive session "${sessionId}"`);
				const current = this.bindings.get(owner);
				if (current !== void 0) return current.binding;
				const binding = new BoundConversation(owner.eventSource, new ConversationNodeAssembler(this.events, this.views, this.groups));
				const record = {
					source: owner,
					binding,
					disposeScope: () => {}
				};
				this.bindings.set(owner, record);
				const disposeScope = owner.ctx.effect(() => () => {
					this.drop(record, false);
				}, "ui-conversation binding");
				record.disposeScope = () => {
					disposeScope();
				};
				return binding;
			}
			/**
			* Resolve one Gateway-authorized durable image URL, cached per Session so
			* every Conversation target shares one read and one browser URL.
			* @param sessionId - Session binding that owns the cached URL lifetime.
			* @param attachment - Durable image reference from a session event.
			* @returns browser URL valid until the Session binding is released.
			*/
			imageUrl(sessionId, attachment) {
				return this.images.resolve(sessionId, attachment);
			}
			/**
			* Read a cached durable image URL synchronously when one is available.
			* @param sessionId - Session binding that owns the cached URL lifetime.
			* @param attachment - Durable image reference from a session event.
			* @returns current preview or canonical URL, if cached.
			*/
			peekImageUrl(sessionId, attachment) {
				return this.images.peek(sessionId, attachment);
			}
			/**
			* Adopt an already-displayable URL for one durable reference (see
			* HistoricalImageCache.seed): the transcript node then renders it without a
			* byte round-trip.
			* @param sessionId - Session binding that owns the cached URL lifetime.
			* @param attachment - Durable image reference the URL displays.
			* @param url - browser URL to adopt.
			* @returns whether the cache took URL ownership.
			*/
			seedImageUrl(sessionId, attachment, url) {
				return this.images.seed(sessionId, attachment, url);
			}
			/**
			* Interpret a system message or surface replacement for target-owned prompt Definitions.
			* @param previous - System facts at the preceding relevant loaded event.
			* @param event - Durable system message or positional replacement.
			* @returns Immutable prompt interpretation at this event.
			*/
			inspectSystemPrompt(previous, event) {
				return inspectSystemPrompt(previous, event);
			}
			/**
			* Canonicalize one `request/header` event against the previous prompt state
			* and the `system/message` node in force.
			*
			* A pure interpretation shared by the Chat and Trajectory Definitions, exposed
			* as a service method because cross-plugin value imports are forbidden in
			* client bundles.
			* @param previous - prompt recorded by the preceding loaded header, if any.
			* @param event - the `request/header` session event to interpret.
			* @param system - effective prompt after loaded surface replacements, if any.
			* @returns the canonical prompt snapshot and any model-visible change.
			*/
			inspectRequestPrompt(previous, event, system) {
				return inspectRequestPrompt(previous, event, system);
			}
			drop(record, releaseScope) {
				if (this.bindings.get(record.source) !== record) return;
				this.bindings.delete(record.source);
				record.binding.dispose();
				if (releaseScope) record.disposeScope();
			}
		};
