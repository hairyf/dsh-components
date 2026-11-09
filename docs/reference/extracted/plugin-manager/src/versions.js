// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/versions.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* A registry bundle's Versions section and its update dialog. The section summarizes the Host's version check in one
		* row and unfolds into the newer versions; the dialog confirms one update, follows the Host's steps, and reports how
		* the update ended, including the reinstallation of the removed version after a failed installation.
		*/
		/** Two digits of a date or time field. */
		function pad(value) {
			return String(value).padStart(2, "0");
		}
		/** A version's local publication day as `YYYY-MM-DD`, which reads the same in every UI language. */
		function publishedDate(version) {
			if (version.publishedAt === void 0) return void 0;
			const day = new Date(version.publishedAt);
			return `${String(day.getFullYear())}-${pad(day.getMonth() + 1)}-${pad(day.getDate())}`;
		}
		/** The local time of day a check arrived, as 24-hour `HH:MM`. */
		function checkedTime(checkedAt) {
			const time = new Date(checkedAt);
			return `${pad(time.getHours())}:${pad(time.getMinutes())}`;
		}
		/** The registry by name: npm's own and the mainland mirror by theirs, pnpm's own configuration as the default, any other by host. */
		function registryName(registry, t) {
			return registryText(registry, t, null).name;
		}
		/** The DSH requirements an incompatible version states, as one phrase: `engines.dsh` or DSH peer ranges. */
		function peersText(incompatible) {
			return Object.entries(incompatible.requirements).map(([name, range]) => `${name} ${range}`).join(", ");
		}
		const PROBLEM_KEYS = {
			"network": "versionsProblemNetwork",
			"not-found": "versionsProblemNotFound",
			"unknown": "versionsProblemUnknown"
		};
		function Glyph({ tone, children }) {
			return (0, react_jsx_runtime.jsx)("span", {
				className: PluginManagerPage_module_css_default.versionGlyph,
				"data-tone": tone,
				"aria-hidden": "true",
				children
			});
		}
		function summaryOf(check, t) {
			if (check === void 0 || check.phase === "checking") return {
				tone: "neutral",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
					state: "ongoing",
					size: 14
				}),
				title: t("versionsChecking"),
				newer: 0
			};
			const { list } = check;
			if (list.status === "refused") {
				const failed = list.attempts.at(-1);
				return {
					tone: "error",
					glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 }),
					title: t(list.problem === "network" ? "versionsFailedNetwork" : "versionsFailedOther"),
					sub: failed?.problem === void 0 ? list.reason : `${registryName(failed.registry, t)} ${t(PROBLEM_KEYS[failed.problem])}`,
					newer: 0
				};
			}
			const candidate = updateCandidate(list);
			if (candidate !== void 0) {
				const date = publishedDate(candidate);
				return {
					tone: "info",
					glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }),
					title: t("versionsAvailable", { version: candidate.version }),
					...date === void 0 ? {} : { sub: t("versionsPublished", { date }) },
					newer: list.versions.length
				};
			}
			if (list.versions.length === 0) return {
				tone: "success",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }),
				title: t("versionsLatest"),
				sub: t("versionsCheckedAt", { time: checkedTime(check.checkedAt) }),
				newer: 0
			};
			const blocked = list.versions.find((version) => !version.prerelease && version.incompatible !== void 0)?.incompatible;
			return blocked === void 0 ? {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("versionsNoneInstallable"),
				sub: t("versionsNoneInstallableDetail"),
				newer: list.versions.length
			} : {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("versionsBlocked"),
				newer: list.versions.length,
				sub: t("versionsBlockedDetail", {
					version: blocked.version,
					peers: peersText(blocked),
					runtime: blocked.runtimeVersion
				})
			};
		}
		/** One version row: its number and tags, why it cannot or should not be installed, its date, and its update action. */
		function VersionRow({ version, installed, t, busy, onUpdate }) {
			if ("installedRow" in version) return (0, react_jsx_runtime.jsx)("li", {
				className: PluginManagerPage_module_css_default.versionRow,
				"data-plugin-version": version.version,
				children: (0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.versionMain,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionTitle,
						children: [(0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.versionNumber,
							children: version.version
						}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
							className: PluginManagerPage_module_css_default.statusTag,
							tone: "neutral",
							children: t("versionsInstalledTag")
						})]
					})
				})
			});
			const usable = installable(version);
			const note = version.incompatible !== void 0 ? t("versionsNeedsDsh", { peers: peersText(version.incompatible) }) : !version.bundle ? t("versionsNotBundle") : version.deprecated;
			const date = publishedDate(version);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: PluginManagerPage_module_css_default.versionRow,
				"data-plugin-version": version.version,
				...usable ? {} : { "data-blocked": "" },
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionTitle,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: version.version
								}),
								version.tags.map((tag) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: tag
								}, tag)),
								version.prerelease ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: t("versionsPrereleaseTag")
								}) : null,
								version.deprecated === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "warning",
									children: t("versionsDeprecatedTag")
								})
							]
						}), note === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.versionNote,
							"data-tone": usable && version.deprecated !== void 0 ? "warn" : void 0,
							children: note
						})]
					}),
					date === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.versionDate,
						children: date
					}),
					(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.versionAction,
						children: usable && version.version !== installed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: version.deprecated === void 0 && !version.prerelease ? "outline" : "ghost",
							size: "sm",
							disabled: busy,
							"aria-label": t("versionsUpdateLabel", { version: version.version }),
							onClick: () => {
								onUpdate(version.version);
							},
							children: t("update")
						}) : null
					})
				]
			});
		}
		/** The registries a refused check asked, each with what it answered. */
		function AttemptRows({ attempts, t }) {
			return (0, react_jsx_runtime.jsx)("ul", {
				className: PluginManagerPage_module_css_default.versionRows,
				children: attempts.map((attempt, index) => (0, react_jsx_runtime.jsx)("li", {
					className: PluginManagerPage_module_css_default.versionRow,
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionTitle,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: registryName(attempt.registry, t)
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "outline",
									children: t(index === 0 ? "versionsPrimaryTag" : "versionsFallbackTag")
								}),
								attempt.problem === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
									className: PluginManagerPage_module_css_default.statusTag,
									tone: "danger",
									children: t(PROBLEM_KEYS[attempt.problem])
								})
							]
						}), attempt.reason === void 0 ? null : (0, react_jsx_runtime.jsx)("code", {
							className: PluginManagerPage_module_css_default.versionLog,
							children: attempt.reason
						})]
					})
				}, `${String(attempt.registry)}:${String(index)}`))
			});
		}
		/** The unfolded list: newer versions, the installed one, and where and when the list was read. */
		function VersionList({ list, checkedAt, t, busy, onUpdate }) {
			const [prereleases, setPrereleases] = (0, react.useState)(false);
			const shown = list.versions.filter((version) => prereleases || !version.prerelease);
			const fallback = list.attempts.length > 1 ? list.attempts[0] : void 0;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.versionBody,
				children: [
					(0, react_jsx_runtime.jsxs)("ul", {
						className: PluginManagerPage_module_css_default.versionRows,
						children: [shown.map((version) => (0, react_jsx_runtime.jsx)(VersionRow, {
							version,
							installed: list.installed,
							t,
							busy,
							onUpdate
						}, version.version)), (0, react_jsx_runtime.jsx)(VersionRow, {
							version: {
								version: list.installed,
								installedRow: true
							},
							installed: list.installed,
							t,
							busy,
							onUpdate
						})]
					}),
					list.omitted > 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.versionNote,
						children: t("versionsOmitted", { count: String(list.omitted) })
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.versionMeta,
						children: [
							(0, react_jsx_runtime.jsxs)("dl", {
								className: PluginManagerPage_module_css_default.versionFact,
								children: [(0, react_jsx_runtime.jsx)("dt", { children: t("versionsRegistry") }), (0, react_jsx_runtime.jsxs)("dd", { children: [registryName(list.registry, t), fallback === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("versionsFallbackHint", { registry: registryName(fallback.registry, t) }),
									side: "top",
									portal: true,
									children: (0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.versionHint,
										tabIndex: 0,
										children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
											className: PluginManagerPage_module_css_default.statusTag,
											tone: "outline",
											children: t("versionsFallbackTag")
										})
									})
								})] })]
							}),
							(0, react_jsx_runtime.jsxs)("dl", {
								className: PluginManagerPage_module_css_default.versionFact,
								children: [(0, react_jsx_runtime.jsx)("dt", { children: t("versionsCheckedAtLabel") }), (0, react_jsx_runtime.jsx)("dd", { children: checkedTime(checkedAt) })]
							}),
							(0, react_jsx_runtime.jsx)("span", { className: PluginManagerPage_module_css_default.versionSpacer }),
							list.versions.some((version) => version.prerelease) ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Checkbox, {
								checked: prereleases,
								onChange: setPrereleases,
								label: t("versionsShowPrerelease")
							}) : null
						]
					})
				]
			});
		}
		/**
		* The Versions section of an updatable bundle's page. It checks once when the page opens and folds the newer versions
		* behind a summary row.
		*/
		function VersionSection({ pkg, check, t, busy, onEnsure, onCheck, onUpdate }) {
			const [open, setOpen] = (0, react.useState)(false);
			const { name, updatable } = pkg;
			(0, react.useEffect)(() => {
				if (updatable) onEnsure(name);
			}, [
				name,
				updatable,
				onEnsure
			]);
			if (!updatable) return null;
			const done = check?.phase === "done" ? check : void 0;
			const summary = summaryOf(check, t);
			const refused = done?.list.status === "refused" ? done.list : void 0;
			const listed = done?.list.status === "listed" ? done.list : void 0;
			const unfolds = summary.newer > 0 || refused !== void 0 && refused.attempts.length > 0;
			const expanded = open && unfolds;
			const text = (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.versionSummaryText,
				children: [(0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.versionSummaryTitle,
					children: summary.title
				}), summary.sub === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.versionSummarySub,
					children: summary.sub
				})]
			});
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-versions": true,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.sectionHead,
					children: [
						(0, react_jsx_runtime.jsx)("h4", {
							className: PluginManagerPage_module_css_default.sectionTitle,
							children: t("versionsTitle")
						}),
						(0, react_jsx_runtime.jsx)("span", { className: PluginManagerPage_module_css_default.versionSpacer }),
						refused === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "ghost",
							size: "sm",
							icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
							disabled: check?.phase !== "done",
							onClick: onCheck,
							children: t("versionsRecheck")
						}) : null
					]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.versionPanel,
					children: [
						listed !== void 0 && summary.newer > 0 ? (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.versionSummary,
							"aria-expanded": expanded,
							onClick: () => {
								setOpen(!open);
							},
							children: [
								(0, react_jsx_runtime.jsx)(Glyph, {
									tone: summary.tone,
									children: summary.glyph
								}),
								text,
								(0, react_jsx_runtime.jsxs)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryEnd,
									children: [expanded ? t("versionsCollapse") : t("versionsNewerCount", { count: String(summary.newer) }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginManagerPage_module_css_default.detailsChevron,
										"aria-hidden": "true"
									})]
								})
							]
						}) : (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.versionSummary,
							role: "status",
							children: [
								(0, react_jsx_runtime.jsx)(Glyph, {
									tone: summary.tone,
									children: summary.glyph
								}),
								text,
								refused === void 0 ? null : (0, react_jsx_runtime.jsxs)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryEnd,
									children: [unfolds ? (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PluginManagerPage_module_css_default.detailsToggle,
										"aria-expanded": expanded,
										onClick: () => {
											setOpen(!open);
										},
										children: [t("versionsDetails"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.detailsChevron,
											"aria-hidden": "true"
										})]
									}) : null, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										onClick: onCheck,
										children: t("retry")
									})]
								})
							]
						}),
						expanded && listed !== void 0 && done !== void 0 ? (0, react_jsx_runtime.jsx)(VersionList, {
							list: listed,
							checkedAt: done.checkedAt,
							t,
							busy,
							onUpdate
						}) : null,
						expanded && refused !== void 0 ? (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.versionBody,
							children: (0, react_jsx_runtime.jsx)(AttemptRows, {
								attempts: refused.attempts,
								t
							})
						}) : null
					]
				})]
			});
		}
		/** The step labels of an update; the Host announces each step as it starts. */
		function stepLabel(step, update, t) {
			switch (step) {
				case "checking": return t("updateStepChecking", { version: update.to });
				case "removing": return t("updateStepRemoving", { version: update.from });
				case "installing": return t("updateStepInstalling", {
					version: update.to,
					registry: registryName(update.registry, t)
				});
				case "restoring": return t("updateStepRestoring", { version: update.from });
			}
		}
		/** Whether a change result left its operation undone. */
		function failed(application) {
			return application === "failed" || application === "cancelled";
		}
		/** The steps in the order the Host runs them. */
		const STEP_ORDER = [
			"checking",
			"removing",
			"installing",
			"restoring"
		];
		/** The steps an answer implies, joined with the announced ones, so a lost announcement does not drop a step that ran. */
		function settledSteps(announced, result) {
			const implied = new Set(["checking", ...announced]);
			if (result.step === "remove") implied.add("removing");
			if (result.step === "install") implied.add("installing");
			if (result.restore !== void 0) implied.add("restoring");
			return STEP_ORDER.filter((step) => implied.has(step));
		}
		/** How one step ended, or that it still runs. */
		function stepState(step, update, last) {
			const result = update.result;
			if (update.phase === "running") return last ? "running" : "done";
			if (result === null) return last ? "unknown" : "done";
			switch (step) {
				case "checking": return result.step === "check" ? "failed" : "done";
				case "removing": return result.step === "remove" ? "failed" : "done";
				case "installing": return failed(result.result.application) ? "failed" : "done";
				case "restoring": return result.restore !== void 0 && failed(result.restore.application) ? "failed" : "done";
			}
		}
		const STEP_GLYPHS = {
			running: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
				state: "ongoing",
				size: 12
			}),
			done: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 12 }),
			failed: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 12 }),
			unknown: null
		};
		/** What the update's outcome reads as: its glyph, title, and the sentence under it. */
		function outcomeOf(update, title, t) {
			const error = {
				tone: "error",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular, { size: 14 })
			};
			const result = update.result;
			if (result === null) return {
				...error,
				title: t("updateLost"),
				detail: t("updateLostDetail", { reason: String(update.lost) })
			};
			const reason = (change) => managementText({
				code: "operation-error",
				...change.error,
				installing: true
			}, t);
			if (result.step === "check") return {
				...error,
				title: t("updateRefused", { version: update.to }),
				detail: reason(result.result)
			};
			if (result.step === "remove") return {
				...error,
				title: t("updateRemoveFailed", { version: update.from }),
				detail: reason(result.result)
			};
			if (!failed(result.result.application)) return result.result.application === "restart-required" ? {
				tone: "warn",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 14 }),
				title: t("updateRestart", { version: update.to }),
				detail: restartText("restartNotice", result.result.restartReason, t)
			} : {
				tone: "success",
				glyph: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckOutlineRegular, { size: 14 }),
				title: t("updateDone", { version: update.to }),
				detail: t("updateDoneDetail")
			};
			if (result.restore === void 0) return {
				...error,
				title: t("updateKept", { version: update.to }),
				detail: t("updateKeptDetail", {
					from: update.from,
					reason: reason(result.result)
				})
			};
			return failed(result.restore.application) ? {
				...error,
				title: t("updateBroken"),
				detail: t("updateBrokenDetail", {
					from: update.from,
					to: update.to,
					name: title
				})
			} : {
				...error,
				title: t("updateRestored", { version: update.from }),
				detail: t("updateRestoredDetail", {
					from: update.from,
					to: update.to
				})
			};
		}
		/** The update dialog: confirmation, then the Host's steps, then the outcome. */
		function UpdateDialog({ update, title, t, onRun, onClose, onToggleOutput }) {
			const running = update.phase === "running";
			const steps = update.result === null ? update.steps : settledSteps(update.steps, update.result);
			const outcome = update.phase === "done" ? outcomeOf(update, title, t) : void 0;
			const output = [update.result?.result, update.result?.restore].map((change) => change !== void 0 && failed(change.application) ? change.packageResult?.output : void 0).find((text) => text !== void 0 && text !== "");
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: () => {
					if (!running) onClose();
				},
				title: t("updateTitle", { name: title }),
				closeLabel: t("close"),
				className: PluginManagerPage_module_css_default.updateDialog,
				footer: update.phase === "confirm" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onClose,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: onRun,
					children: t("update")
				})] }) : running ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					disabled: true,
					children: t("updateRunning")
				}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					onClick: onClose,
					children: t("updateFinish")
				}),
				children: (0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.updateBody,
					"data-plugin-update": update.phase,
					children: update.phase === "confirm" ? (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.updateVersions,
							children: [
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									"data-old": "",
									children: update.from
								}),
								(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
									size: 14,
									"aria-hidden": "true"
								}),
								(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionNumber,
									children: update.to
								})
							]
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: PluginManagerPage_module_css_default.versionFact,
							children: [(0, react_jsx_runtime.jsx)("dt", { children: t("updateSource") }), (0, react_jsx_runtime.jsx)("dd", { children: registryName(update.registry, t) })]
						}),
						(0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.updateText,
							children: t("updateDescription", {
								from: update.from,
								to: update.to
							})
						})
					] }) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
						outcome === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.updateOutcome,
							role: "status",
							children: [(0, react_jsx_runtime.jsx)(Glyph, {
								tone: outcome.tone,
								children: outcome.glyph
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: PluginManagerPage_module_css_default.versionSummaryText,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionSummaryTitle,
									children: outcome.title
								}), (0, react_jsx_runtime.jsx)("span", {
									className: PluginManagerPage_module_css_default.versionSummarySub,
									children: outcome.detail
								})]
							})]
						}),
						output === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.detailsToggle,
							"aria-expanded": update.outputOpen,
							onClick: onToggleOutput,
							children: [t("updateOutput"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
								className: PluginManagerPage_module_css_default.detailsChevron,
								"aria-hidden": "true"
							})]
						}), update.outputOpen ? (0, react_jsx_runtime.jsx)("pre", {
							className: PluginManagerPage_module_css_default.updateOutput,
							children: output
						}) : null] }),
						(0, react_jsx_runtime.jsx)("ol", {
							className: PluginManagerPage_module_css_default.updateSteps,
							children: steps.map((step, index) => {
								const state = stepState(step, update, index === steps.length - 1);
								return (0, react_jsx_runtime.jsxs)("li", {
									className: PluginManagerPage_module_css_default.updateStep,
									"data-state": state,
									children: [(0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.updateStepDot,
										"aria-hidden": "true",
										children: STEP_GLYPHS[state]
									}), (0, react_jsx_runtime.jsx)("span", { children: stepLabel(step, update, t) })]
								}, step);
							})
						})
					] })
				})
			});
		}
