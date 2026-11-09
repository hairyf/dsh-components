// Extracted from @deepseek-ai/dsh-client-ui-chat (lib/client.js); region lib/types/client/chat/MessageItem.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		const EMPTY_TEXT_FACTS = {};
		function contentParts(content) {
			const texts = [];
			const attachments = [];
			const rest = [];
			for (const block of content) {
				const b = block;
				if (b.type === "text" && typeof b.text === "string") texts.push(b.text);
				else if (b.type === "image" && b.attachment !== void 0) attachments.push({
					type: "image",
					image: { attachment: b.attachment }
				});
				else if (b.type === "file" && b.attachment !== void 0) attachments.push({
					type: "file",
					file: b.attachment
				});
				else rest.push(block);
			}
			return {
				text: texts.join(""),
				attachments,
				rest
			};
		}
		function retrySeconds(milliseconds) {
			return Math.max(1, Math.ceil(milliseconds / 1e3));
		}
		function failureMessage(message, code, t) {
			if (code === "ACCOUNT_SIGNED_OUT") return t("message.failure.accountSignedOut");
			if (code === "INTERRUPTED") return t("message.failure.interrupted");
			if (code === "ACCOUNT_SIGN_IN_REQUIRED") return t("message.failure.accountSignInRequired");
			if (code === "QUOTA" || code === "ACCOUNT_QUOTA") return t("message.failure.quota");
			return code === "AUTH" ? t("message.failure.auth") : message;
		}
		function ModelRetryItem({ node, active, t }) {
			const deadline = (0, react.useMemo)(() => Date.now() + node.delayMs, [node.delayMs, node.seq]);
			const scheduledSeconds = retrySeconds(node.delayMs);
			const maximum = node.mode === "normal" ? node.maxRetries : "∞";
			const [countdown, setCountdown] = (0, react.useState)(() => ({
				deadline,
				seconds: retrySeconds(deadline - Date.now())
			}));
			const remainingSeconds = countdown.deadline === deadline ? countdown.seconds : retrySeconds(deadline - Date.now());
			(0, react.useEffect)(() => {
				if (!active) return;
				const updateCountdown = () => {
					const next = retrySeconds(deadline - Date.now());
					setCountdown((current) => current.deadline === deadline && current.seconds === next ? current : {
						deadline,
						seconds: next
					});
					return next;
				};
				if (updateCountdown() === 1) return;
				const timer = window.setInterval(() => {
					if (updateCountdown() === 1) window.clearInterval(timer);
				}, 250);
				return () => {
					window.clearInterval(timer);
				};
			}, [active, deadline]);
			const label = active ? t("message.retry.active") : node.retryState === "cancelled" ? t("message.retry.cancelled") : node.retryState === "started" ? t("message.retry.started") : t("message.retry.scheduled");
			const seconds = active ? remainingSeconds : scheduledSeconds;
			return (0, react_jsx_runtime.jsxs)("details", {
				className: MessageItem_module_css_default.retryRow,
				"data-active": active || void 0,
				children: [(0, react_jsx_runtime.jsx)("summary", {
					className: MessageItem_module_css_default.retrySummary,
					children: (0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.retryText,
						role: "status",
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TextShimmer, {
							active,
							children: t("message.retry.status", {
								label,
								retry: node.retry,
								maximum,
								seconds
							})
						})
					})
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: MessageItem_module_css_default.retryDetails,
					children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.retryDetailLabel,
						children: t("message.retry.delay")
					}), t("duration.milliseconds", { milliseconds: Math.round(node.delayMs) })] }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.retryDetailLabel,
						children: t("message.retry.failure")
					}), failureMessage(node.failure.message, node.failure.code, t)] })]
				})]
			});
		}
		/** Persistent, turn-positioned feedback for a terminal failure. */
		function TurnErrorItem({ node, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MessageItem_module_css_default.turnErrorRow,
				role: "status",
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
						state: "error",
						className: MessageItem_module_css_default.turnErrorDot
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: MessageItem_module_css_default.turnErrorCopy,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: MessageItem_module_css_default.turnErrorTitle,
							children: node.code === "ACCOUNT_SIGNED_OUT" || node.code === "INTERRUPTED" ? t("message.taskStopped") : t("message.turnError")
						}), (0, react_jsx_runtime.jsx)("span", {
							className: MessageItem_module_css_default.turnErrorMessage,
							children: failureMessage(node.message, node.code, t)
						})]
					}),
					node.code !== void 0 && node.code !== "INTERRUPTED" && (0, react_jsx_runtime.jsx)("code", {
						className: MessageItem_module_css_default.turnErrorCode,
						children: node.code
					})
				]
			});
		}
		/** Persistent, turn-positioned notice for a turn ended at the output-token cap. */
		function TurnMaxTokensItem({ t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MessageItem_module_css_default.turnErrorRow,
				role: "status",
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: "warning",
					className: MessageItem_module_css_default.turnErrorDot
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: MessageItem_module_css_default.turnErrorCopy,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.maxTokensTitle,
						children: t("message.maxTokens")
					}), (0, react_jsx_runtime.jsx)("span", {
						className: MessageItem_module_css_default.turnErrorMessage,
						children: t("message.maxTokens.hint")
					})]
				})]
			});
		}
		/** Pending and local-echo rows carry no durable source for the seat to elect. */
		const UNDECORATED_ROW = {
			kind: "user",
			data: { source: null }
		};
		/** Occupant used by rows that do not own the message-source seat. */
		const NO_MESSAGE_SOURCE = () => null;
		/** Right-aligned bubble shared by user and steering rows. */
		function UserStyleBubble({ node, renderSlotChain, content, loadImage, renderFactorySlot, actions, pending = false, echo = false, batchStart = false, referenceLabels, skillNames, previewAttachments, facts: inputFacts = EMPTY_TEXT_FACTS, interactive = false }) {
			const parts = (0, react.useMemo)(() => contentParts(content), [content]);
			const prepared = (0, react.useMemo)(() => ({
				text: parts.text,
				attachments: previewAttachments ?? parts.attachments,
				extraBlocks: parts.rest,
				...referenceLabels === void 0 ? {} : { referenceLabels }
			}), [
				parts,
				previewAttachments,
				referenceLabels
			]);
			const facts = (0, react.useMemo)(() => ({
				...inputFacts,
				...referenceLabels === void 0 ? {} : { sessionLabels: referenceLabels },
				...skillNames === void 0 ? {} : { skillNames }
			}), [
				inputFacts,
				referenceLabels,
				skillNames
			]);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: MessageItem_module_css_default.userRow,
				"data-pending-steering": pending || void 0,
				"data-submission-echo": echo || void 0,
				"data-chat-steering-batch": batchStart ? "start" : void 0,
				children: [
					renderSlotChain("conversation.chat.user.before", {
						source: node.data.source,
						kind: node.kind
					}, { fallback: null }),
					renderFactorySlot("conversation.chat.user.content", {
						content: prepared,
						loadImage,
						facts,
						interactive
					}),
					actions?.(prepared.text)
				]
			});
		}
		/**
		* Render one Host-authoritative pending steering item with the same visual
		* language as its eventual durable transcript node.
		* @param props - pending content, authorized image loader, and Factory/locale seats.
		* @returns the pending steering bubble.
		*/
		function PendingSteeringBubble({ content, loadImage, renderFactorySlot, t }) {
			return (0, react_jsx_runtime.jsx)(UserStyleBubble, {
				node: UNDECORATED_ROW,
				renderSlotChain: NO_MESSAGE_SOURCE,
				content,
				renderFactorySlot,
				loadImage,
				pending: true,
				actions: (text) => (0, react_jsx_runtime.jsx)(MessageIconActions, {
					text,
					clock: "start",
					className: MessageItem_module_css_default.actions,
					t
				})
			});
		}
		/**
		* Render one local transcript or steering submission echo with the same
		* visual language and surface marker as the Host occurrence that replaces
		* it: draft text plus object-URL previews, visible from the submit click
		* until the durable `user/message` or steering occurrence renders.
		* @param props - the pending submission, authorized image loader, and render seats.
		* @returns the echoed user bubble.
		*/
		function PendingSubmissionBubble({ submission, loadImage, renderFactorySlot, t }) {
			return (0, react_jsx_runtime.jsx)(UserStyleBubble, {
				node: UNDECORATED_ROW,
				renderSlotChain: NO_MESSAGE_SOURCE,
				content: (0, react.useMemo)(() => submission.text === "" ? [] : [{
					type: "text",
					text: submission.text
				}], [submission.text]),
				previewAttachments: (0, react.useMemo)(() => submission.attachments.map((attachment) => attachment.type === "image" ? {
					type: "image",
					image: { preview: {
						url: attachment.value.previewUrl,
						...attachment.value.name === void 0 ? {} : { name: attachment.value.name },
						...attachment.value.width === void 0 ? {} : { width: attachment.value.width },
						...attachment.value.height === void 0 ? {} : { height: attachment.value.height }
					} }
				} : {
					type: "file",
					file: attachment.value
				}), [submission.attachments]),
				renderFactorySlot,
				loadImage,
				pending: submission.placement === "steering",
				echo: true,
				actions: (text) => (0, react_jsx_runtime.jsx)(MessageIconActions, {
					text,
					time: submission.time,
					clock: "start",
					className: MessageItem_module_css_default.actions,
					t
				})
			});
		}
		/**
		* Official user and admitted-steering keyed Chat renderer.
		*
		* Renders the durable-message chain seat directly above the bubble. The seat is
		* declared by the `user` registration alone, so a steering row renders the same
		* bubble without asking for it.
		*/
		const UserMessageNodeView = (0, react.memo)(function UserMessageNodeView({ node, renderFactorySlot, loadImage, renderSlotChain, t }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)(UserStyleBubble, {
				node,
				renderSlotChain,
				content: data.content,
				interactive: true,
				renderFactorySlot,
				loadImage,
				batchStart: node.kind === "steering" && node.data.batchStart === true,
				...data.referenceLabels === void 0 ? {} : { referenceLabels: data.referenceLabels },
				...data.skillNames === void 0 ? {} : { skillNames: data.skillNames },
				actions: (text) => (0, react_jsx_runtime.jsx)(MessageIconActions, {
					text,
					time: data.time,
					clock: "start",
					className: MessageItem_module_css_default.actions,
					t
				})
			});
		});
		/** Injected-context keyed Chat renderer. */
		const ContextMessageNodeView = (0, react.memo)(function ContextMessageNodeView({ node, t }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)(ContextInjectionRow, {
				content: data.content,
				source: data.source,
				producer: data.producer,
				form: data.form,
				t
			});
		});
		/** Automatic compaction keyed Chat renderer. */
		const CompactionNodeView = (0, react.memo)(function CompactionNodeView({ node, t }) {
			return (0, react_jsx_runtime.jsx)(CompactionItem, {
				node: node.data,
				t
			});
		});
		/** Correlated retry-chain keyed Chat renderer. */
		const RetryNodeView = (0, react.memo)(function RetryNodeView({ node, t }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)(ModelRetryItem, {
				node: data.current,
				active: data.current.retryState === "scheduled",
				t
			});
		});
		/** Terminal turn-error keyed Chat renderer. */
		const TurnErrorNodeView = (0, react.memo)(function TurnErrorNodeView({ node, t }) {
			return (0, react_jsx_runtime.jsx)(TurnErrorItem, {
				node: node.data,
				t
			});
		});
		/** Max-tokens turn-end notice keyed Chat renderer. */
		const TurnMaxTokensNodeView = (0, react.memo)(function TurnMaxTokensNodeView({ t }) {
			return (0, react_jsx_runtime.jsx)(TurnMaxTokensItem, { t });
		});
		/** Explicit unknown-surface keyed Chat renderer. */
		const UnknownNodeView = (0, react.memo)(function UnknownNodeView({ node, t }) {
			const data = node.data;
			return (0, react_jsx_runtime.jsx)("div", {
				className: MessageItem_module_css_default.contextRow,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.JsonBlock, {
					label: t("message.unknownSurface", { type: data.type }),
					payload: data.data,
					truncatedLabel: (total) => t("json.truncated", { total })
				})
			});
		});
