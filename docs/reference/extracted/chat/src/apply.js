// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/apply.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Bind group and header visibility to the viewport of one flow render. */
		const CHAT_FLOW_INJECT = { hooks: {
			groupAction: (_standard, { motion }) => function useGroupAction(hidden, reveal) {
				return useFlowHidden(hidden, reveal, motion);
			},
			groupHeaderAction: (_standard, { motion }) => function useGroupHeaderAction(ref, hidden) {
				useMotionHidden(ref, hidden, motion);
			}
		} };
		/** Bind node-local sources and forward the flow's existing visibility hook. */
		const CHAT_NODE_INJECT = { hooks: {
			turnData: (_standard, { turnData }) => function useTurnData(key) {
				return useTurnDataValue(turnData, key);
			},
			disclosure: (_standard, { disclosureReset }) => bindDisclosure(disclosureReset),
			groupAction: (_standard, { useGroupAction }) => useGroupAction
		} };
		/** Services required by the Chat target and its presentation registrations. */
		const inject = [
			"slots",
			"sessions",
			"uiWorkspace",
			"uiSession",
			"uiConversation",
			"locale",
			"configForms",
			"connection",
			"remote",
			"remote.session",
			"sidebarRight",
			"fileDrag"
		];
		/**
		* Mount all Chat-owned contributions.
		* @param ctx - Client root context.
		*/
		function apply(ctx) {
			const quotaNotice = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(null);
			let quotaNoticeSeq = 0;
			const quotaNoticeHolds = /* @__PURE__ */ new Set();
			const chatSources = /* @__PURE__ */ new WeakMap();
			const quotaSubscriptions = /* @__PURE__ */ new Set();
			ctx.effect(() => async () => {
				await Promise.all([...quotaSubscriptions].map((dispose) => dispose()));
			}, "ui-chat: live quota notices");
			const chatSource = (binding) => {
				let source = chatSources.get(binding);
				if (source === void 0) {
					const dispose = binding.ctx.effect(() => {
						const stop = binding.eventSource.subscribe(() => {
							const { change } = binding.eventSource.getSnapshot();
							if (change.kind !== "append") return;
							for (const { event } of change.entries) {
								if (event.type !== "turn/end" || event.data.reason.kind !== "error") continue;
								const { code } = event.data.reason.error;
								if (quotaNoticeHolds.size > 0 || code !== "QUOTA" && code !== "ACCOUNT_QUOTA") continue;
								quotaNotice.set({
									code,
									seq: ++quotaNoticeSeq
								});
							}
						});
						return () => {
							stop();
							chatSources.delete(binding);
							quotaSubscriptions.delete(dispose);
						};
					}, "ui-chat: Provider binding quota notices");
					quotaSubscriptions.add(dispose);
					const target = ctx.uiConversation.binding(binding).target("chat");
					source = {
						getSnapshot: () => target.getSnapshot() ?? EMPTY_CHAT_SNAPSHOT,
						subscribe: (listener) => target.subscribe(listener)
					};
					chatSources.set(binding, source);
				}
				return source;
			};
			registerConversationNodes(ctx);
			ctx.uiSession.provide({
				hooks: ["chat"],
				resolve: (binding) => ({ hooks: { chat: chatSource(binding) } })
			});
			ctx.effect(() => ctx.locale.register(NS, {
				zh,
				en,
				ja,
				es,
				fr,
				de,
				ru,
				pt
			}), "ui-chat: dictionaries");
			const t = ctx.locale.bind(NS);
			const chatStore = createChatStore();
			const chatScrollPositions = /* @__PURE__ */ new Map();
			const chatSettings = ctx.configForms.get(CHAT_SETTINGS_NAMESPACE);
			const linkOpening = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(chatSettings.getSnapshot().value?.linkOpening ?? "sidebar");
			ctx.effect(() => chatSettings.subscribe(() => {
				const accepted = chatSettings.getSnapshot().value?.linkOpening;
				if (accepted !== void 0) linkOpening.set(accepted);
			}));
			ctx.inject(["sidebarRightTabs"], (scope) => {
				const tabs = scope.sidebarRightTabs;
				const browserAvailable = {
					getSnapshot: () => tabs.get("browser") !== void 0,
					subscribe: (listener) => tabs.subscribe(listener)
				};
				scope.slots.inject("settings.general.item", () => scope.slots.register({
					name: "settings.general.item",
					id: "link-opening",
					order: 17,
					locale: NS,
					inject: () => ({
						hooks: {
							linkOpening,
							browserAvailable
						},
						setLinkOpening: (destination) => {
							linkOpening.set(destination);
							chatSettings.set("linkOpening", destination).catch((_error) => {});
						}
					})
				}, LinkOpeningRow));
			});
			const transcriptView = new TranscriptViewPolicy(chatSettings, "dshDesktop" in globalThis ? "standard" : DEFAULT_TRANSCRIPT_VIEW_MODE);
			const presentation = derivePresentationPolicy(transcriptView.mode, transcriptView.collapseTiming, transcriptView.foldedReplies);
			const performancePolicy = new PerformanceUsagePolicy(chatSettings);
			ctx.effect(() => () => {
				transcriptView.dispose();
				performancePolicy.dispose();
			});
			const performanceUsage = performancePolicy.mode;
			registerChatNodeRenderers(ctx, performanceUsage, presentation);
			ctx.slots.registerFactory({
				name: "conversation.chat.user.content",
				scope: "session",
				locale: NS,
				children: { "conversation.chat.user.images": {
					kind: "single",
					scope: "session"
				} }
			}, UserContent);
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "performance-usage",
				order: 30,
				locale: NS,
				inject: () => ({
					hooks: { performanceUsage },
					setPerformanceUsage: (mode) => {
						performancePolicy.setMode(mode);
					}
				})
			}, PerformanceUsageRow));
			ctx.slots.inject("settings.general.item", () => ctx.slots.register({
				name: "settings.general.item",
				id: "transcript-view",
				order: 12,
				locale: NS,
				inject: () => ({
					hooks: {
						transcriptView: transcriptView.mode,
						collapseTiming: transcriptView.collapseTiming,
						foldedReplies: transcriptView.foldedReplies
					},
					setTranscriptView: (mode) => {
						transcriptView.setMode(mode);
					},
					setCollapseTiming: (timing) => {
						transcriptView.setCollapseTiming(timing);
					},
					setFoldedReplies: (replies) => {
						transcriptView.setFoldedReplies(replies);
					}
				})
			}, TranscriptViewRow));
			const connectionState = ctx.get("connection").state;
			const nodeSources = (binding) => {
				const chat = chatSource(binding);
				const conversation = ctx.uiConversation.binding(binding);
				return { keyedHooks: {
					chatNode: (key) => chat.getSnapshot().nodes.source(key),
					chatNodeBottom: (key) => chat.getSnapshot().nodes.bottomSource(key),
					chatNodeProcess: (key) => chat.getSnapshot().nodes.processSource(key),
					chatGroup: (key) => conversation.snapshot.getSnapshot().views.grouped("chat")?.groupSource(key)
				} };
			};
			ctx.slots.inject("conversation.chat.flow", () => ctx.slots.register({
				name: "conversation.chat.flow",
				locale: NS,
				store: chatStore,
				children: { "conversation.chat.node": {
					kind: "keyed",
					scope: "session",
					inject: CHAT_NODE_INJECT
				} },
				inject: (sessionId) => {
					const binding = ctx.sessions.binding(sessionId);
					if (binding === void 0) throw new Error(`ui-chat: unknown session "${sessionId}"`);
					return {
						...nodeSources(binding),
						hooks: {
							presentation,
							connectionState
						}
					};
				}
			}, ChatFlow));
			ctx.slots.inject("conversation.view", () => {
				return ctx.slots.register({
					name: "conversation.view",
					id: "chat",
					order: 0,
					label: () => t("view.chat"),
					locale: NS,
					children: {
						"conversation.chat.flow": {
							kind: "single",
							scope: "session",
							inject: CHAT_FLOW_INJECT
						},
						"conversation.chat.text-interaction": {
							kind: "keyed",
							scope: "session"
						}
					},
					store: chatStore,
					inject: (sessionId) => {
						const binding = ctx.sessions.binding(sessionId);
						if (binding === void 0) throw new Error(`ui-chat: unknown session "${sessionId}"`);
						const session = binding.session;
						const chat = chatSource(binding);
						return {
							...nodeSources(binding),
							fileDrag: ctx.fileDrag.actions,
							hooks: {
								presentation,
								interactionIds: ctx.uiConversation.interactions
							},
							dispatchInteraction: (gesture) => ctx.uiConversation.interactions.dispatch(sessionId, gesture),
							openFile: async (path, options) => {
								const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
								const url = fileAddressFor(sessionId, cwd, resolveWorkspacePath(session.projections.faceOf("workingDirectory").getSnapshot() ?? void 0, path));
								if (options?.line === void 0) ctx.sidebarRight.openResource(url);
								else ctx.sidebarRight.openResource(url, { params: { line: options.line } });
								await Promise.resolve();
							},
							resolveFilePath: sessionFilePath(ctx, sessionId),
							openExternalLink: (url) => {
								if (linkOpening.getSnapshot() === "sidebar" && ctx.get("sidebarRightTabs")?.get("browser") !== void 0) ctx.sidebarRight.openTab("browser", { params: { url } });
								else window.open(url, "_blank", "noopener,noreferrer");
							},
							loadOlder: () => {
								session.loadOlder();
							},
							loadThrough: (seq) => session.loadThrough(seq),
							loadImage: Object.assign((attachment) => ctx.uiConversation.imageUrl(sessionId, attachment), { peek: (attachment) => ctx.uiConversation.peekImageUrl(sessionId, attachment) }),
							chatScroll: {
								save: (position) => {
									if (position === null) chatScrollPositions.delete(sessionId);
									else chatScrollPositions.set(sessionId, position);
								},
								read: () => chatScrollPositions.get(sessionId) ?? null
							},
							forkAt: (seq) => {
								const messageId = [...chat.getSnapshot().timeline.turns.values()].find((turn) => turn.end?.seq === seq)?.data.get("turn-tail")?.closing?.finalNode.messageId;
								ctx.sessions.fork({
									sessionId,
									atSeq: seq,
									increaseTitle: true,
									onCreated: (childId) => {
										ctx.get("productAnalytics")?.track("branch_session_click", {
											session_id: childId,
											parent_session_id: sessionId,
											...messageId === void 0 ? {} : { parent_message_id: messageId },
											click_position: "footer"
										});
									}
								}).then((childId) => {
									ctx.uiWorkspace.openSession(childId);
								}).catch(() => {});
							}
						};
					}
				}, ChatView);
			});
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "chat.quota-notice",
				locale: NS,
				children: { "shell.quota-notice": {
					kind: "chain",
					scope: "root"
				} },
				inject: () => ({
					hooks: { notice: quotaNotice },
					dismissNotice: () => {
						quotaNoticeHolds.clear();
						quotaNotice.set(null);
					},
					keepNoticeOpen: () => {
						if (quotaNotice.getSnapshot() === null) return () => {};
						const token = Symbol("ui-chat quota notice hold");
						quotaNoticeHolds.add(token);
						return () => {
							quotaNoticeHolds.delete(token);
						};
					}
				})
			}, QuotaNoticeHost));
			const statPillInject = () => ({ hooks: { performanceUsage } });
			ctx.slots.inject("conversation.composer.dock", function* () {
				yield ctx.slots.register({
					name: "conversation.composer.dock",
					id: "activity",
					order: 0,
					locale: NS,
					inject: statPillInject
				}, ActivityPill);
				yield ctx.slots.register({
					name: "conversation.composer.dock",
					id: "usage",
					order: 1,
					locale: NS,
					inject: statPillInject
				}, UsagePill);
			});
			ctx.slots.inject("conversation.approval.detail", () => ctx.slots.register({ name: "conversation.approval.detail" }, ApprovalCommand));
		}
