// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/skeleton/InputBar.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The default composer body: the 'conversation.composer.bar' slot entry.
		* Machine state arrives through the standard provide channel
		* (useInput + inputActions); the keyboard/DOM command face and stop arrive
		* through this entry's own inject, whose hooks compartment binds
		* useNotices/useLexicon; layout-phase inputs (variant and placeholder) ride
		* the owner props. Session facts
		* (running/removed/promptError) are self-selected via useSession.
		*
		* The text surface is the shell-owned Lexical editor bound here through
		* ComposerContentEditable; chips render as decorator portals, and the
		* keymap registers submit/menu/paste gestures on the editor command layer.
		* The no-session state renders the SAME div inert as the Workspace-picker
		* trigger instead of a parallel tree.
		*/
		const InputBar = (0, react.memo)(function InputBar({ useSession, useInput, inputActions, keyboard, addFiles, removeAttachment, resolveDraftAttachments, retryFileUpload, toggleCommandMenu, stop, t, renderSlot, useBusyEnter, useFileUploads, useNotices, useLexicon, useMenuLauncher, useStopShortcut, useAccess, useProjection, sessionId, variant, disabled: inert = false, blocked, workspacePickerOpen = false, onRequestWorkspace, placeholder, accessory }) {
			const input = useInput((s) => s);
			const notice = useNotices((s) => s);
			const busyEnter = useBusyEnter((s) => s);
			const stopKeys = useStopShortcut((keys) => keys);
			const promptDenied = useAccess("session/prompt") === false;
			const cancelDenied = useAccess("session/cancel") === false;
			const uploadDenied = useAccess("fileUploads/upload") === false;
			const stopAction = cancelDenied ? void 0 : stop;
			const commandMenuOpen = useMenuLauncher((source) => source === "command");
			const [activity, setActivity] = (0, react.useState)(false);
			(0, react.useEffect)(() => {
				setActivity(false);
			}, [sessionId]);
			const promptError = useSession((s) => s.promptError) ?? null;
			const running = useSession((s) => s.running) ?? false;
			const subagent = useSession((s) => s.subagent) ?? null;
			const removed = useSession((s) => s.removed) ?? false;
			const planActive = useProjection("plan", (plan) => plan !== void 0 && (plan.pending ? !plan.active : plan.active));
			const hasGoal = useProjection("goal", (goal) => goal != null);
			const live = input !== void 0 && keyboard !== void 0 && inputActions !== void 0;
			const draft = input?.draft ?? "";
			const editor = keyboard?.editor ?? null;
			const attachments = (0, react.useMemo)(() => input === void 0 || resolveDraftAttachments === void 0 ? [] : resolveDraftAttachments(input.attachmentIds), [resolveDraftAttachments, input?.attachmentIds]);
			const empty = draft.trim() === "" && attachments.length === 0;
			const uploads = useFileUploads((snapshot) => snapshot);
			const uploadsPending = attachments.some((attachment) => attachment.kind === "file" ? uploads[attachment.id]?.status !== "ready" : uploads[attachment.id] !== void 0 && uploads[attachment.id]?.status !== "ready");
			const [toast, setToast] = (0, react.useState)(null);
			const toastSeq = (0, react.useRef)(0);
			const showToast = (0, react.useCallback)((text) => {
				toastSeq.current += 1;
				setToast({
					seq: toastSeq.current,
					text
				});
			}, []);
			const dismissToast = (0, react.useCallback)(() => {
				setToast(null);
			}, []);
			const imageLimits = useProjection("imageLimits");
			const failedUpload = attachments.map((attachment) => uploads[attachment.id]).find((upload) => upload?.status === "error");
			const uploadsHeldText = failedUpload?.status !== "error" ? t("file.stillUploading") : failedUpload.reason === void 0 ? t("file.uploadFailed") : attachmentErrorText(t, failedUpload.reason, imageLimits);
			(0, react.useEffect)(() => {
				if (promptError === null) return;
				const { error } = promptError;
				if (error.code === "session/writer-held") {
					showToast(t("error.sessionInUse"));
					return;
				}
				showToast(error.code === "session/attachment-invalid" || error.code === "subagent/attachment-invalid" ? attachmentErrorText(t, error.details.reason, imageLimits) : `${error.message} (${error.code})`);
			}, [
				promptError,
				showToast,
				t,
				imageLimits
			]);
			(0, react.useEffect)(() => {
				if (notice?.level === "error") showToast(notice.text);
			}, [notice, showToast]);
			const rowRef = (0, react.useRef)(null);
			(0, react.useLayoutEffect)(() => {
				const row = rowRef.current;
				if (row === null) return;
				return observeControlRow(row);
			}, []);
			const cardRef = (0, react.useRef)(null);
			const scrollRef = (0, react.useRef)(null);
			const continuable = subagent?.address.mode === "continuable";
			const parentOffline = continuable && subagent.parentAvailable !== true;
			const disabled = removed || inert || !live || blocked !== void 0 || parentOffline;
			const locked = disabled;
			const modelSeatLocked = removed || inert || !live;
			const machineBusy = input?.phase === "adjudicating" || input?.phase === "submitting" || input?.phase === "sending";
			const sending = input?.phase === "sending";
			const workspaceTrigger = inert && !removed && onRequestWorkspace !== void 0;
			const editorDisabled = removed || locked && !workspaceTrigger;
			const editable = live && !locked && !machineBusy;
			const steeringAvailable = subagent === null || subagent.address.mode === "continuable";
			const canSteerQueue = !locked && !machineBusy && !commandMenuOpen && empty && running && steeringAvailable && input.queue.length > 0;
			(0, react.useEffect)(() => {
				if (input === void 0 || inputActions === void 0) return;
				if (attachments.length !== input.attachmentIds.length) inputActions.pruneAttachments(attachments.map((attachment) => attachment.id));
			}, [
				attachments,
				input?.attachmentIds,
				inputActions
			]);
			const revealSelection = () => {
				revealDraftSelection(scrollRef);
			};
			(0, react.useEffect)(() => {
				if (locked || editor === null) return;
				if ((0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) return;
				focusDraftEditor(editor, revealSelection);
			}, [
				locked,
				sessionId,
				editor
			]);
			const busyPhaseSeen = (0, react.useRef)(false);
			(0, react.useEffect)(() => {
				if (machineBusy) {
					busyPhaseSeen.current = true;
					return;
				}
				if (!busyPhaseSeen.current) return;
				busyPhaseSeen.current = false;
				if (locked || editor === null) return;
				if (document.activeElement !== null && document.activeElement !== document.body) return;
				if ((0, _deepseek_ai_dsh_client_ui_primitives.isMobileDevice)()) {
					if (cardRef.current !== null) (0, _deepseek_ai_dsh_client_ui_primitives.focusWithoutRing)(cardRef.current, { preventScroll: true });
				} else focusDraftEditor(editor, revealSelection);
			}, [machineBusy]);
			(0, react.useEffect)(() => {
				if (locked || draft === "") return;
				revealSelection();
			}, [draft !== ""]);
			(0, react.useEffect)(() => {
				return installDraftWheel(scrollRef);
			}, []);
			const intakeFiles = (0, react.useCallback)((files, directories) => {
				if (uploadDenied || locked || machineBusy || subagent !== null && !continuable || addFiles === void 0 || files.length === 0) return;
				const rejected = (() => {
					if (continuable && files.some((file) => directories?.has(file) || !isImageMediaType(file.type))) return t("image.unsupportedType");
					if (imageLimits !== void 0) {
						const mediaTypes = imageLimits.mediaTypes;
						const images = files.filter((file) => mediaTypes.includes(file.type));
						const imageAttachments = attachments.filter((attachment) => attachment.kind === "image");
						if (imageAttachments.length + images.length > imageLimits.maxImagesPerMessage) return t("image.tooMany", { count: imageLimits.maxImagesPerMessage });
						if (images.some((file) => file.size > imageLimits.maxImageBytes)) return t("image.fileTooLarge", { size: imageSizeText(imageLimits.maxImageBytes) });
						if (imageAttachments.reduce((sum, attachment) => sum + attachment.file.size, 0) + images.reduce((sum, file) => sum + file.size, 0) > imageLimits.maxMessageImageBytes) return t("image.totalTooLarge", { size: imageSizeText(imageLimits.maxMessageImageBytes) });
					}
					return addFiles(files, directories);
				})();
				if (rejected !== null) showToast(rejected);
			}, [
				uploadDenied,
				locked,
				machineBusy,
				subagent,
				continuable,
				addFiles,
				attachments,
				imageLimits,
				showToast,
				t
			]);
			const canAcceptDrop = !uploadDenied && (subagent === null || continuable) && !locked && !machineBusy && addFiles !== void 0;
			const fileInputRef = (0, react.useRef)(null);
			const onPickFiles = (e) => {
				const picked = e.target.files === null ? [] : [...e.target.files];
				e.target.value = "";
				if (picked.length > 0) intakeFiles(picked);
			};
			const gate = (0, react.useRef)({
				locked,
				machineBusy,
				canSteerQueue,
				running,
				steeringAvailable,
				busyEnter,
				intakeFiles,
				uploadsPending,
				uploadsHeldText,
				showToast,
				canAcceptDrop
			});
			gate.current = {
				locked,
				machineBusy,
				canSteerQueue,
				running,
				steeringAvailable,
				busyEnter,
				intakeFiles,
				uploadsPending,
				uploadsHeldText,
				showToast,
				canAcceptDrop
			};
			(0, react.useEffect)(() => {
				if (keyboard === void 0) return;
				return installDraftFilePicker(keyboard, gate, fileInputRef);
			}, [keyboard]);
			(0, react.useEffect)(() => {
				if (editor === null || keyboard === void 0) return;
				return installDraftKeymap(editor, keyboard, gate);
			}, [editor, keyboard]);
			(0, react.useEffect)(() => {
				if (editor === null) return;
				return installDraftKeyboardDismissal(editor, cardRef);
			}, [editor]);
			const keepFocus = (e) => {
				keepDraftFocus(e, editor);
			};
			const onCardMouseDown = (e) => {
				if (!editable || editor === null || e.button !== 0 || e.defaultPrevented) return;
				const target = e.target;
				if (!(target instanceof Element) || !e.currentTarget.contains(target)) return;
				if (target.closest("[data-composer-overlay]") !== null) return;
				if (scrollRef.current?.contains(target)) return;
				const control = target.closest("button, a, input, select, textarea, [role=\"button\"], [contenteditable], [tabindex]");
				if (control !== null && control !== e.currentTarget && e.currentTarget.contains(control)) return;
				e.preventDefault();
				if (document.activeElement !== editor.getRootElement()) focusDraftEditor(editor, revealSelection);
			};
			const onToggleCommandMenu = () => {
				if (keyboard === void 0) return;
				if (editor !== null) focusDraftEditor(editor, revealSelection);
				toggleCommandMenu?.(keyboard.caretSpan());
			};
			const onWorkspaceKeyDown = (e) => {
				if (!workspaceTrigger) return;
				if (e.key === "Enter" || e.key === " ") {
					e.preventDefault();
					onRequestWorkspace();
				}
			};
			const primaryStops = running && subagent === null && !sending && (empty || blocked !== void 0);
			const primaryDisabled = primaryStops ? stopAction === void 0 : empty || disabled || machineBusy || uploadsPending;
			const interruptible = running && (continuable || sending && subagent === null);
			const primarySubmitMode = resolveSubmitMode(busyEnter, running, "enter", steeringAvailable);
			const plainMessageDraft = !empty && input?.phase === "plain" && !draft.trimStart().startsWith("/");
			const primaryLabel = primaryStops ? t("input.stop") : sending ? t("input.sending") : running && steeringAvailable && !disabled && !uploadsPending && plainMessageDraft ? t(primarySubmitMode === "steer" ? "input.send.steer" : "input.send.queue") : t("input.send");
			const onPrimary = () => {
				if (primaryStops) {
					stopAction?.();
					return;
				}
				if (keyboard === void 0) return;
				/* v8 ignore next -- defensive: the primary button is disabled for empty, disabled, and pending-upload states. */
				if (!empty && !disabled && !machineBusy && !uploadsPending) keyboard.submit(primarySubmitMode, "click");
			};
			const claimActive = (input?.phase === "claimed" || input?.phase === "submitting") && input.claim !== void 0 && draft.startsWith(input.claim.token);
			const rawHint = claimActive && input.claim.hint !== void 0 && draft.slice(input.claim.token.length).trim() === "" ? input.claim.hint : null;
			const hint = (() => {
				if (rawHint === null) return null;
				const commandName = input?.claim?.name ?? "";
				const hintKey = `hint.${commandName === "goal" && hasGoal ? "goal.active" : commandName}`;
				const translated = t(hintKey);
				return translated !== hintKey ? translated : rawHint;
			})();
			const placeholderText = placeholder ?? (parentOffline ? t("placeholder.parentOffline") : disabled ? t("placeholder.unavailable") : canSteerQueue ? t("placeholder.steerQueue") : planActive ? t("placeholder.plan") : t("placeholder.default"));
			return (0, react_jsx_runtime.jsxs)("div", {
				className: clsx(InputBar_module_css_default.root, variant === "hero" && InputBar_module_css_default.hero),
				children: [
					toast !== null && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
						text: toast.text,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
						anchor: cardRef.current,
						onDone: dismissToast
					}, toast.seq),
					notice?.level === "info" && (0, react_jsx_runtime.jsx)("div", {
						className: InputBar_module_css_default.notice,
						role: "status",
						children: notice.text
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						ref: cardRef,
						tabIndex: -1,
						className: clsx(InputBar_module_css_default.card, workspaceTrigger && InputBar_module_css_default.cardWorkspaceTrigger),
						"data-composer-card": true,
						onClick: workspaceTrigger ? onRequestWorkspace : void 0,
						onPointerDown: workspaceTrigger ? (e) => {
							e.stopPropagation();
						} : void 0,
						onMouseDown: onCardMouseDown,
						children: [
							sessionId !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: InputBar_module_css_default.overlayAnchor,
								"data-composer-overlay": true,
								children: renderSlot("conversation.input.overlay", {})
							}),
							accessory !== void 0 && (0, react_jsx_runtime.jsx)("div", {
								className: InputBar_module_css_default.accessory,
								children: accessory
							}),
							renderSlot("conversation.input.attachments", {
								attachments,
								canAcceptDrop,
								onAddFiles: intakeFiles,
								onRemoveAttachment: (id) => {
									removeAttachment?.(id);
								},
								uploads,
								onRetryFile: (id) => {
									retryFileUpload?.(id);
								},
								uploadFailureText: (reason) => attachmentErrorText(t, reason, imageLimits),
								dropLimits: imageLimits === void 0 ? void 0 : {
									count: imageLimits.maxImagesPerMessage,
									size: imageSizeText(imageLimits.maxImageBytes)
								}
							}),
							(0, react_jsx_runtime.jsx)(DraftEditor, {
								classNames: InputBar_module_css_default,
								editor,
								scrollRef,
								editable,
								editorDisabled,
								phase: input?.phase ?? "inert",
								placeholderText,
								ariaLabel: workspaceTrigger ? t("hero.chooseWorkspace") : placeholderText,
								workspaceTrigger,
								workspacePickerOpen,
								onWorkspaceKeyDown,
								hint,
								showPlaceholder: draft === "" && attachments.length === 0 && !claimActive
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								ref: rowRef,
								className: InputBar_module_css_default.row,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: InputBar_module_css_default.tools,
									hidden: activity,
									children: [
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("input.commands"),
											side: "top",
											delayMs: 500,
											portal: true,
											children: (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: InputBar_module_css_default.add,
												"aria-label": t("input.commands"),
												"aria-haspopup": "listbox",
												"aria-expanded": commandMenuOpen,
												disabled: locked || toggleCommandMenu === void 0,
												onMouseDown: keepFocus,
												onClick: onToggleCommandMenu,
												children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineMedium, { size: 14 })
											})
										}),
										(0, react_jsx_runtime.jsx)("input", {
											ref: fileInputRef,
											type: "file",
											multiple: true,
											disabled: !canAcceptDrop || subagent !== null,
											hidden: true,
											onChange: onPickFiles
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: InputBar_module_css_default.modes,
											children: [sessionId === void 0 ? null : renderSlot("conversation.input.permission", { locked }), sessionId === void 0 ? null : renderSlot("conversation.input.plan", { locked })]
										}),
										input === void 0 || sessionId === void 0 ? null : renderSlot("conversation.input.left", {})
									]
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: clsx(InputBar_module_css_default.trailing, activity && InputBar_module_css_default.trailingActive),
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: InputBar_module_css_default.standardControls,
											hidden: activity,
											children: [input === void 0 || sessionId === void 0 ? null : renderSlot("conversation.input.right", {}), sessionId === void 0 ? null : renderSlot("conversation.input.model", { locked: modelSeatLocked })]
										}),
										input === void 0 || sessionId === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
											className: activity ? InputBar_module_css_default.activityExpanded : InputBar_module_css_default.activity,
											children: renderSlot("conversation.input.activity", {
												locked,
												onActiveChange: setActivity
											})
										}),
										interruptible && !cancelDenied && (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: t("input.stop"),
											shortcutKeys: stopKeys,
											side: "top",
											delayMs: 500,
											disabled: stopAction === void 0,
											portal: true,
											children: (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: InputBar_module_css_default.primary,
												"aria-label": t("input.stop"),
												disabled: stopAction === void 0,
												onMouseDown: keepFocus,
												onClick: stopAction,
												children: (0, react_jsx_runtime.jsx)("svg", {
													viewBox: "0 0 16 16",
													width: "16",
													height: "16",
													"aria-hidden": true,
													children: (0, react_jsx_runtime.jsx)("rect", {
														x: "3",
														y: "3",
														width: "10",
														height: "10",
														rx: "3",
														fill: "currentColor"
													})
												})
											})
										}),
										(primaryStops ? cancelDenied : promptDenied) ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
											label: primaryStops ? t("input.stop") : primaryLabel,
											shortcutKeys: primaryStops ? stopKeys : void 0,
											side: "top",
											delayMs: 500,
											disabled: primaryDisabled,
											portal: true,
											children: (0, react_jsx_runtime.jsx)("button", {
												type: "button",
												className: InputBar_module_css_default.primary,
												"aria-label": primaryLabel,
												"aria-busy": sending,
												"data-sending": sending ? "" : void 0,
												disabled: primaryDisabled,
												onMouseDown: keepFocus,
												onClick: onPrimary,
												children: primaryStops ? (0, react_jsx_runtime.jsx)("svg", {
													viewBox: "0 0 16 16",
													width: "16",
													height: "16",
													"aria-hidden": true,
													children: (0, react_jsx_runtime.jsx)("rect", {
														x: "3",
														y: "3",
														width: "10",
														height: "10",
														rx: "3",
														fill: "currentColor"
													})
												}) : sending ? (0, react_jsx_runtime.jsxs)("svg", {
													className: InputBar_module_css_default.sendingSpinner,
													viewBox: "0 0 16 16",
													width: "16",
													height: "16",
													"aria-hidden": true,
													children: [(0, react_jsx_runtime.jsx)("circle", {
														cx: "8",
														cy: "8",
														r: "6",
														fill: "none",
														stroke: "currentColor",
														strokeOpacity: "0.35",
														strokeWidth: "2"
													}), (0, react_jsx_runtime.jsx)("path", {
														d: "M8 2a6 6 0 0 1 6 6",
														fill: "none",
														stroke: "currentColor",
														strokeWidth: "2",
														strokeLinecap: "round"
													})]
												}) : (0, react_jsx_runtime.jsx)("svg", {
													viewBox: "0 0 16 16",
													width: "16",
													height: "16",
													"aria-hidden": true,
													children: (0, react_jsx_runtime.jsx)("path", {
														d: "M8.3125 0.980183C8.66767 1.0531 8.97902 1.20418 9.2627 1.43233C9.48724 1.61297 9.73029 1.85793 9.97949 2.10714L14.707 6.83468L13.293 8.24874L9 3.95577V15.0417H7V3.95577L2.70703 8.24874L1.29297 6.83468L6.02051 2.10714C6.26971 1.85793 6.51277 1.61297 6.7373 1.43233C6.97662 1.23986 7.28445 1.04402 7.6875 0.980183C7.8973 0.947006 8.1031 0.95516 8.3125 0.980183Z",
														fill: "currentColor"
													})
												})
											})
										})
									]
								})]
							})
						]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: InputBar_module_css_default.dock,
						"data-composer-dock": true,
						children: [variant === "composer" && input !== void 0 && sessionId !== void 0 ? renderSlot("conversation.composer.dock", {}) : null, activity ? null : (0, react_jsx_runtime.jsx)(ContextMeter, {
							useProjection,
							t
						})]
					})
				]
			});
		});
