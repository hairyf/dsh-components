// Extracted from @deepseek-ai/dsh-client-ui-plugin-manager (lib/client.js); region lib/types/client/PluginManagerPage.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* Global plugin management: grouped cards for official configuration and
		* optional bundles, the Installed group's cards for the profile's bundles,
		* their row switches, the install dialog with its guide and folded pnpm
		* output, the uninstall confirmation, and the toasts an action's outcome
		* becomes. A bundle's page lists the rows it contributes as the Host runs
		* them; a plugin's configuration renders on its own page through the slots
		* the page declares.
		*/
		/** The primary action installs; the adjacent menu offers every add-plugin path. */
		function AddPluginMenu({ t, disabled, openInstall, renderSlot }) {
			const [open, setOpen] = (0, react.useState)(false);
			const onDismiss = () => {
				setOpen(false);
			};
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.addGroup,
				role: "group",
				"aria-label": t("addPlugin"),
				children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
					label: t("addPlugin"),
					side: "bottom",
					delayMs: 500,
					focusDelayMs: 500,
					portal: true,
					disabled,
					children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						className: PluginManagerPage_module_css_default.addPrimary,
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
						"aria-label": t("addPlugin"),
						disabled,
						onClick: () => {
							onDismiss();
							openInstall();
						},
						children: (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.toolbarLabel,
							children: t("addPlugin")
						})
					})
				}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
					open,
					onClose: onDismiss,
					align: "end",
					portal: true,
					autoFocus: true,
					listClassName: PluginManagerPage_module_css_default.addMenu,
					anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						className: PluginManagerPage_module_css_default.addMore,
						disabled,
						"aria-label": t("chooseAddMethod"),
						"aria-haspopup": "menu",
						"aria-expanded": open,
						onClick: () => {
							setOpen((value) => !value);
						},
						onKeyDown: (event) => {
							if (!open && event.key === "ArrowDown") {
								event.preventDefault();
								setOpen(true);
							}
						},
						children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							size: 12,
							"aria-hidden": "true"
						})
					}),
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.MenuItemButton, {
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconDownloadOutlineRegular, { size: 14 }),
						onSelect: () => {
							onDismiss();
							openInstall();
						},
						children: (0, react_jsx_runtime.jsxs)("span", {
							className: PluginManagerPage_module_css_default.addMenuItem,
							children: [(0, react_jsx_runtime.jsx)("span", { children: t("installExisting") }), (0, react_jsx_runtime.jsx)("span", {
								className: PluginManagerPage_module_css_default.addMenuDescription,
								children: t("installExistingDescription")
							})]
						})
					}), renderSlot("plugins.add.actions", { onDismiss })]
				})]
			});
		}
		/** How long the list marks a package an install just enabled. */
		const HIGHLIGHT_MS = 2400;
		/**
		* Whether any plugin row this bundle's patch declares is running.
		*
		* A default-hidden bundle's rows may run without the profile selecting it, for example through
		* `cordis.patch.yml`; that run state is the effective enablement the lists offer.
		* @param pkg - the bundle as the Host reports it.
		* @returns whether at least one declared row runs.
		*/
		function rowsRunning(pkg) {
			return pkg.rows.some((row) => row.enabled);
		}
		/**
		* Whether the main list shows an official optional bundle: any bundle outside `MORE_BUNDLES`, and any held-back one the profile enabled.
		* @param pkg - the official bundle as the Host reports it.
		* @returns whether the main list shows it.
		*/
		function pinnedToMainList(pkg) {
			return !MORE_BUNDLES.includes(pkg.name) || pkg.enabled;
		}
		/**
		* Where an optional bundle sits on both lists: the `EXTENSION_BUNDLES` in their order, then the bundles neither list
		* ranks, then the held-back ones in theirs, so Codex and Claude Code stay last on the More list.
		* @param name - the bundle's package name.
		* @returns the rank; bundles of equal rank keep the order the Host reported.
		*/
		function optionalBundleRank(name) {
			const ranked = EXTENSION_BUNDLES.indexOf(name);
			if (ranked >= 0) return ranked;
			const heldBack = MORE_BUNDLES.indexOf(name);
			return heldBack < 0 ? EXTENSION_BUNDLES.length : EXTENSION_BUNDLES.length + 1 + heldBack;
		}
		/**
		* Order the official optional bundles as both lists show them, so a bundle the profile picks from the More list
		* keeps its place among the neighbours the main list already holds.
		* @param packages - the official bundles the Host offers.
		* @returns the bundles in display order.
		*/
		function orderOptionalBundles(packages) {
			return [...packages].sort((a, b) => optionalBundleRank(a.name) - optionalBundleRank(b.name));
		}
		/** How long a toast holds: long enough to read a failure that names what broke. */
		function toastHoldMs(text) {
			return Math.min(8e3, Math.max(3e3, text.length * 80));
		}
		const PHASE_KEYS = {
			pending: "rowPhasePending",
			loading: "rowPhaseLoading",
			active: "rowPhaseActive",
			failed: "rowPhaseFailed",
			unloading: "rowPhaseUnloading"
		};
		/** Status dot naming a root-fiber phase; loading and unloading are live transitions. */
		const PHASE_STATES = {
			pending: "idle",
			loading: "ongoing",
			active: "done",
			failed: "error",
			unloading: "ongoing"
		};
		/** The count line over a pack's components: the total, then only the states that occur. */
		function partsSummary(rows, t) {
			const failed = rows.filter((row) => row.phase === "failed").length;
			const off = rows.filter((row) => !row.enabled).length;
			const running = rows.filter((row) => row.enabled && row.phase === "active").length;
			return [
				t("partsCountTotal", { count: String(rows.length) }),
				...running > 0 ? [t("partsCountRunning", { count: String(running) })] : [],
				...off > 0 ? [t("partsCountOff", { count: String(off) })] : [],
				...failed > 0 ? [t("partsCountFailed", { count: String(failed) })] : []
			].join(" · ");
		}
		/** Rows beyond this count get a filter box above the list. */
		const ROW_FILTER_THRESHOLD = 10;
		/** The size the 36-viewBox plugin artwork renders at inside a card's 48px frame. */
		const CARD_ARTWORK_SIZE = 36;
		/** The size the artwork renders at inside a row's 40px frame. */
		const ROW_ARTWORK_SIZE = 30;
		/** The artwork of the official plugins that registered their configuration, by registration id. */
		const ITEM_ARTWORK = new Map([
			["shell", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkTerminal],
			["agent-loop", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkLoop],
			["subagent", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSubagent],
			["web-search", _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSearch]
		]);
		/** An official plugin's card and page artwork; plugins without their own get the default. */
		function itemArtwork(id) {
			return (0, react_jsx_runtime.jsx)(ITEM_ARTWORK.get(id) ?? _deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size: CARD_ARTWORK_SIZE });
		}
		/** Manifest images remain isolated from the page DOM; a failed decode keeps the position's default artwork. */
		function PackageArtwork({ src, row = false, size = row ? ROW_ARTWORK_SIZE : CARD_ARTWORK_SIZE }) {
			const [failedSource, setFailedSource] = (0, react.useState)();
			return src === void 0 || src === failedSource ? (0, react_jsx_runtime.jsx)(row ? _deepseek_ai_dsh_client_ui_primitives.PluginArtworkSubagent : _deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size }) : (0, react_jsx_runtime.jsx)("img", {
				className: PluginManagerPage_module_css_default.packageImage,
				src,
				width: size,
				height: size,
				alt: "",
				onError: () => {
					setFailedSource(src);
				}
			});
		}
		/** A row's switch: locked, saying why, when the Host refuses to address the row through the profile patch. */
		function RowSwitch({ row, title, t, busy, onChange }) {
			const locked = row.readOnlyReason !== void 0 || row.entryId === void 0;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
				checked: row.enabled,
				label: t("partToggle", { name: title }),
				disabled: busy || locked,
				...row.readOnlyReason === void 0 ? {} : { title: managementText({ code: row.readOnlyReason }, t) },
				onChange
			});
		}
		/** What a row's state line says: off, or the phase its fiber is in. */
		function rowStateText(row, t) {
			if (!row.enabled) return t("partOff");
			return row.phase === null ? t("rowStateIdle") : t(PHASE_KEYS[row.phase]);
		}
		/** The dot beside a row: its fiber phase, or idle. */
		function rowDotState(row) {
			if (!row.enabled || row.phase === null) return "idle";
			return PHASE_STATES[row.phase];
		}
		/** A Host metadata diagnostic does not change the package's management permissions. */
		function MetadataError({ error, t }) {
			return error === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
				className: PluginManagerPage_module_css_default.reason,
				role: "status",
				"data-package-meta-error": true,
				children: t("metadataError", { error })
			});
		}
		/** A failed component keeps its current Host diagnostic beside its controls. */
		function RuntimeError({ error, t }) {
			return error === void 0 ? null : (0, react_jsx_runtime.jsxs)("p", {
				className: PluginManagerPage_module_css_default.reason,
				role: "status",
				"data-plugin-runtime-error": true,
				children: [
					t("reasonLabel"),
					": ",
					error
				]
			});
		}
		/**
		* A pack's rows as a list in the order the pack declares them: a state dot,
		* the row id, one line saying its state, a configure control for a row that
		* registered a page, and, when the pack is on, a switch. A pack like base
		* carries close to a hundred rows, so a long list gets a filter.
		*/
		function RowsSection({ rows, t, resolveText, toggle, configure }) {
			const [filter, setFilter] = (0, react.useState)("");
			const query = filter.trim().toLowerCase();
			const localized = rows.map((row) => ({
				row,
				...rowText(row, resolveText)
			}));
			const shown = query === "" ? localized : localized.filter(({ row, title, description }) => [
				title,
				description,
				row.rowId,
				row.moduleName
			].some((value) => value?.toLowerCase().includes(query)));
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-rows": true,
				children: [
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.sectionHead,
						children: [(0, react_jsx_runtime.jsx)("h4", {
							className: PluginManagerPage_module_css_default.sectionTitle,
							children: t("partsLabel")
						}), rows.length === 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.sectionCount,
							children: partsSummary(rows, t)
						})]
					}),
					rows.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.status,
						children: t("partsEmpty")
					}) : null,
					rows.length > ROW_FILTER_THRESHOLD ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
						type: "search",
						className: PluginManagerPage_module_css_default.partsFilter,
						placeholder: t("partsFilter"),
						"aria-label": t("partsFilter"),
						value: filter,
						onChange: (event) => {
							setFilter(event.target.value);
						}
					}) : null,
					rows.length > 0 && shown.length === 0 ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.status,
						children: t("partsFilterEmpty")
					}) : null,
					shown.length === 0 ? null : (0, react_jsx_runtime.jsx)("ul", {
						className: PluginManagerPage_module_css_default.rows,
						children: shown.map(({ row, title, description }) => (0, react_jsx_runtime.jsxs)("li", {
							className: PluginManagerPage_module_css_default.row,
							"data-plugin-row": row.entryId ?? row.rowId,
							...row.phase === "failed" ? { "data-state": "failed" } : row.enabled ? {} : { "data-state": "off" },
							children: [
								(0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.rowLine,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.rowIcon,
											"aria-hidden": "true",
											children: (0, react_jsx_runtime.jsx)(PackageArtwork, {
												src: row.meta?.icon,
												row: true
											}, row.meta?.icon)
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.rowMain,
											children: [
												configure?.has(row) === true ? (0, react_jsx_runtime.jsxs)("button", {
													type: "button",
													className: PluginManagerPage_module_css_default.rowOpen,
													"aria-label": t("configureRow", { name: title }),
													onClick: () => {
														configure.open(row);
													},
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerPage_module_css_default.rowId,
														children: title
													}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
														className: PluginManagerPage_module_css_default.rowOpenIcon,
														"aria-hidden": "true"
													})]
												}) : (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.rowId,
													children: title
												}),
												description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.rowModule,
													children: description
												}),
												title === row.rowId ? null : (0, react_jsx_runtime.jsx)("code", {
													className: PluginManagerPage_module_css_default.rowModule,
													children: row.rowId
												}),
												title === row.moduleName ? null : (0, react_jsx_runtime.jsx)("code", {
													className: PluginManagerPage_module_css_default.rowModule,
													children: row.moduleName
												})
											]
										}),
										(0, react_jsx_runtime.jsxs)("span", {
											className: PluginManagerPage_module_css_default.rowState,
											children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: rowDotState(row) }), rowStateText(row, t)]
										}),
										toggle === void 0 ? null : (0, react_jsx_runtime.jsx)(RowSwitch, {
											row,
											title,
											t,
											busy: toggle.busy(row),
											onChange: (enabled) => {
												toggle.onSetEnabled(row, enabled);
											}
										})
									]
								}),
								(0, react_jsx_runtime.jsx)(MetadataError, {
									error: row.meta?.error,
									t
								}),
								(0, react_jsx_runtime.jsx)(RuntimeError, {
									error: row.diagnostic,
									t
								})
							]
						}, row.rowId))
					})
				]
			});
		}
		/** Declared install source and versions; unavailable files retain their recorded dependency spec. */
		function SourceSection({ pkg, t }) {
			if (pkg.source === void 0 && !pkg.installed && pkg.availability === "installation" && !pkg.optional) return null;
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.detailSection,
				"data-plugin-source": true,
				children: [(0, react_jsx_runtime.jsx)("h4", {
					className: PluginManagerPage_module_css_default.sectionTitle,
					children: t("sourceTitle")
				}), (0, react_jsx_runtime.jsxs)("dl", {
					className: PluginManagerPage_module_css_default.facts,
					children: [
						(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceSpec") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.source !== void 0 ? (0, react_jsx_runtime.jsx)("code", { children: pkg.source }) : pkg.availability === "missing" ? t(pkg.installed ? "statusMissingFiles" : "sourceNotInstalled") : t("sourceBuiltIn") })] }),
						pkg.version === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.version })] }),
						pkg.installTarget === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceTargetSpec") }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("code", { children: pkg.installTarget.spec }) })] }), (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("sourceTargetVersion") }), (0, react_jsx_runtime.jsx)("dd", { children: pkg.installTarget.version })] })] })
					]
				})]
			});
		}
		/**
		* A bundle's enable switch on its card and its page: locked, saying why, for
		* one the Host protects; off and locked for one it cannot read.
		*/
		function EnableSwitch({ pkg, title, t, busy, onSetEnabled }) {
			return (0, react_jsx_runtime.jsxs)("span", {
				className: PluginManagerPage_module_css_default.bundleToggle,
				children: [(0, react_jsx_runtime.jsxs)("span", {
					className: PluginManagerPage_module_css_default.toggleProgress,
					role: "status",
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.progressAnnouncement,
						children: busy ? t("applyingChange", { name: title }) : ""
					}), busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : null]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Switch, {
					checked: pkg.enabled,
					label: t("enableToggle", { name: title }),
					disabled: busy || pkg.readOnlyReason !== void 0 || !pkg.enabled && pkg.error !== void 0 && (pkg.error.code === "unsupported-platform" || !(pkg.availability === "missing" && pkg.installTarget !== void 0)),
					...pkg.readOnlyReason === void 0 ? {} : { title: managementText({ code: pkg.readOnlyReason }, t) },
					onChange: onSetEnabled
				})]
			});
		}
		/** The status one card carries: running, off, or a problem the Host reported. */
		function packageStatus(pkg) {
			if (pkg.error !== void 0 || pkg.enabled && pkg.rows.some((row) => row.phase === "failed")) return "problem";
			return pkg.enabled ? "running" : "disabled";
		}
		/** The head every card shares: the artwork, the name that opens the page beside its tags, its one-liner, and what sits at the end. */
		function CardHead({ title, t, onOpen, icon, tags, description, end }) {
			const descriptionId = (0, react.useId)();
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.cardHead,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.cardIcon,
						"aria-hidden": "true",
						children: icon
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.cardMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.titleRow,
							children: [(0, react_jsx_runtime.jsx)("button", {
								type: "button",
								className: `${PluginManagerPage_module_css_default.cardTitle} ${PluginManagerPage_module_css_default.cardOpen}`,
								"aria-label": t("openDetail", { name: title }),
								"aria-describedby": description === void 0 ? void 0 : descriptionId,
								onClick: onOpen,
								children: title
							}), tags]
						}), description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
							className: PluginManagerPage_module_css_default.cardDesc,
							id: descriptionId,
							children: description
						})]
					}),
					end === void 0 ? null : (0, react_jsx_runtime.jsx)("div", {
						className: PluginManagerPage_module_css_default.cardEnd,
						children: end
					})
				]
			});
		}
		/** First-read placeholders share the core configuration group's card and text-line layout. */
		function ListSkeleton({ label }) {
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.group,
				role: "status",
				"aria-label": label,
				"data-plugin-loading": true,
				children: [(0, react_jsx_runtime.jsx)("div", {
					className: PluginManagerPage_module_css_default.groupHead,
					"aria-hidden": "true",
					children: (0, react_jsx_runtime.jsx)("span", {
						className: `${PluginManagerPage_module_css_default.groupTitle} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonHeading}`,
						children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
					})
				}), (0, react_jsx_runtime.jsx)("ul", {
					className: PluginManagerPage_module_css_default.cards,
					"aria-hidden": "true",
					children: [
						0,
						1,
						2,
						3
					].map((index) => (0, react_jsx_runtime.jsx)("li", {
						className: PluginManagerPage_module_css_default.card,
						children: (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.cardHead,
							children: [
								(0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.cardIcon} ${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonIcon}` }),
								(0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.cardMain,
									children: [(0, react_jsx_runtime.jsx)("div", {
										className: PluginManagerPage_module_css_default.titleRow,
										children: (0, react_jsx_runtime.jsx)("span", {
											className: `${PluginManagerPage_module_css_default.cardTitle} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonTitle}`,
											children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
										})
									}), (0, react_jsx_runtime.jsx)("span", {
										className: `${PluginManagerPage_module_css_default.cardDesc} ${PluginManagerPage_module_css_default.skeletonText} ${PluginManagerPage_module_css_default.skeletonDescription}`,
										children: (0, react_jsx_runtime.jsx)("span", { className: `${PluginManagerPage_module_css_default.skeletonFill} ${PluginManagerPage_module_css_default.skeletonBar}` })
									})]
								}),
								(0, react_jsx_runtime.jsx)("div", { className: `${PluginManagerPage_module_css_default.cardEnd} ${PluginManagerPage_module_css_default.skeletonActions}` })
							]
						})
					}, index))
				})]
			});
		}
		/** The top every page shares: the crumb that leads back, then the icon with the page's actions at its right. */
		function DetailTop({ crumbLabel, crumbText, onBack, icon, actions }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detailTop,
				"data-window-drag": true,
				children: [(0, react_jsx_runtime.jsxs)("button", {
					type: "button",
					className: PluginManagerPage_module_css_default.crumb,
					"aria-label": crumbLabel,
					onClick: onBack,
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
						className: PluginManagerPage_module_css_default.crumbIcon,
						"aria-hidden": "true"
					}), (0, react_jsx_runtime.jsx)("span", { children: crumbText })]
				}), (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.detailHead,
					children: [(0, react_jsx_runtime.jsx)("span", {
						className: PluginManagerPage_module_css_default.cardIcon,
						"aria-hidden": "true",
						children: icon
					}), actions]
				})]
			});
		}
		/** The registry version a finished version check offers for a package, when it offers one. */
		function versionUpdate(check) {
			return check?.phase === "done" ? updateCandidate(check.list)?.version : void 0;
		}
		/** The list toolbar's sentence about the last update check of every updatable package. */
		function updatesNote(packages, versions, t) {
			const checks = packages.filter((pkg) => pkg.updatable).map((pkg) => versions[pkg.name]);
			if (checks.length === 0 || checks.some((check) => check === void 0 || check.phase === "checking")) return void 0;
			const available = checks.filter((check) => versionUpdate(check) !== void 0).length;
			if (available > 0) return {
				text: t("updatesAvailable", { count: String(available) }),
				tone: "info"
			};
			if (checks.some((check) => check?.phase === "done" && check.list.status === "refused")) return {
				text: t("updatesFailed"),
				tone: "error"
			};
			return { text: t("updatesNone") };
		}
		function updateAvailable(pkg) {
			const target = pkg.installTarget;
			if (!pkg.installed || !pkg.removable || pkg.availability === "installation" || target === void 0) return false;
			return pkg.version !== target.version || (target.spec.startsWith("link:") || pkg.source?.startsWith("link:") === true) && pkg.source !== target.spec;
		}
		/** One package as a card that opens its page: its name, its one-liner, its tags, and its bundle switch. */
		function PackageCard({ pkg, t, resolveText, busy, highlighted, newer, onOpen, onSetEnabled }) {
			const { title, description, beta } = packageText(pkg, resolveText);
			const status = packageStatus(pkg);
			return (0, react_jsx_runtime.jsxs)("li", {
				className: `${PluginManagerPage_module_css_default.card} ${PluginManagerPage_module_css_default.cardLink}`,
				"data-plugin-package": pkg.name,
				"data-plugin-status": status,
				...highlighted ? { "data-plugin-highlight": "" } : {},
				children: [
					(0, react_jsx_runtime.jsx)(CardHead, {
						title,
						t,
						onOpen,
						icon: (0, react_jsx_runtime.jsx)(PackageArtwork, { src: pkg.meta?.icon }, pkg.meta?.icon),
						tags: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
							beta ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								className: PluginManagerPage_module_css_default.statusTag,
								tone: "info",
								children: t("statusBeta")
							}) : null,
							status === "problem" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								className: PluginManagerPage_module_css_default.statusTag,
								tone: "danger",
								children: t("statusProblem")
							}) : null,
							pkg.availability === "missing" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								className: PluginManagerPage_module_css_default.statusTag,
								children: t(pkg.installed ? "statusMissingFiles" : "statusNotInstalled")
							}) : null,
							updateAvailable(pkg) || newer !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								className: PluginManagerPage_module_css_default.statusTag,
								tone: "info",
								children: t("statusUpdateAvailable")
							}) : null
						] }),
						description,
						end: (0, react_jsx_runtime.jsx)(EnableSwitch, {
							pkg,
							title,
							t,
							busy,
							onSetEnabled
						})
					}),
					(0, react_jsx_runtime.jsx)(MetadataError, {
						error: pkg.meta?.error,
						t
					}),
					pkg.error?.code === "unsupported-platform" && (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.reason,
						role: "status",
						children: managementText(pkg.error, t)
					})
				]
			});
		}
		/**
		* One official plugin as a card that opens its page: its icon, its title from
		* the registration, and the one-liner the entry renders in its summary view.
		*/
		function ItemCard({ item, t, onOpen, renderSlot }) {
			return (0, react_jsx_runtime.jsx)("li", {
				className: `${PluginManagerPage_module_css_default.card} ${PluginManagerPage_module_css_default.cardLink}`,
				"data-plugin-item": item.id,
				children: (0, react_jsx_runtime.jsx)(CardHead, {
					title: item.label,
					t,
					onOpen,
					icon: itemArtwork(item.id),
					description: renderSlot("plugins.item", { view: "summary" }, { only: item.id })
				})
			});
		}
		/** One row as the detail slots see it. */
		function rowRef(row) {
			return {
				rowId: row.rowId,
				moduleName: row.moduleName,
				enabled: row.enabled
			};
		}
		/** One bundle as the detail slots see it. */
		function packageRef(pkg) {
			return {
				name: pkg.name,
				...pkg.version === void 0 ? {} : { version: pkg.version },
				installed: pkg.installed,
				availability: pkg.availability,
				official: pkg.official,
				enabled: pkg.enabled,
				rows: pkg.rows.map(rowRef)
			};
		}
		/**
		* An official plugin's page: the crumb back to the cards, its icon with the
		* contributed actions, its title with the contributed badges over its
		* one-liner, the form the entry renders, and the contributed sections.
		*/
		function ItemDetail({ item, t, onBack, renderSlot, form }) {
			const subject = {
				kind: "item",
				id: item.id
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-item-detail": item.id,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: t("backToList"),
						crumbText: t("crumbRoot"),
						onBack,
						icon: itemArtwork(item.id),
						actions: (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: renderSlot("plugins.detail.actions", { subject })
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [(0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.titleRow,
							children: [(0, react_jsx_runtime.jsx)("h3", {
								className: PluginManagerPage_module_css_default.detailTitle,
								children: item.label
							}), renderSlot("plugins.detail.badge", { subject })]
						}), (0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.detailDesc,
							children: renderSlot("plugins.item", { view: "summary" }, { only: item.id })
						})]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						children: [(0, react_jsx_runtime.jsx)("section", {
							className: PluginManagerPage_module_css_default.detailSection,
							"data-plugin-config": true,
							children: renderSlot("plugins.item", {
								view: "page",
								form
							}, { only: item.id })
						}), renderSlot("plugins.detail.section", { subject })]
					})
				]
			});
		}
		/**
		* A row's configuration page keeps its technical identity beside local package
		* text and the form supplied by its configuration entry.
		*/
		function RowDetail({ pkg, row, t, resolveText, onBack, renderSlot, form }) {
			const { title } = packageText(pkg, resolveText);
			const { title: rowTitle, description } = rowText(row, resolveText);
			const key = rowConfigKey(pkg.name, row.rowId);
			const subject = {
				kind: "row",
				pkg: packageRef(pkg),
				row: rowRef(row)
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-row-detail": key,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: t("backToPackage", { name: title }),
						crumbText: title,
						onBack,
						icon: (0, react_jsx_runtime.jsx)(PackageArtwork, {
							src: row.meta?.icon,
							row: true,
							size: CARD_ARTWORK_SIZE
						}, row.meta?.icon),
						actions: (0, react_jsx_runtime.jsx)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: renderSlot("plugins.detail.actions", { subject })
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.titleRow,
								children: [(0, react_jsx_runtime.jsx)("h3", {
									className: PluginManagerPage_module_css_default.detailTitle,
									children: rowTitle
								}), renderSlot("plugins.detail.badge", { subject })]
							}),
							rowTitle === row.rowId ? null : (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", { children: row.rowId })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", { children: row.moduleName })
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailDesc,
								children: description ?? renderSlot("plugins.row.config", { view: "summary" }, { entryKey: key })
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(MetadataError, {
						error: row.meta?.error,
						t
					}),
					(0, react_jsx_runtime.jsx)(RuntimeError, {
						error: row.diagnostic,
						t
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						"data-plugin-config": true,
						children: [renderSlot("plugins.row.config", {
							view: "page",
							form
						}, { entryKey: key }), renderSlot("plugins.detail.section", { subject })]
					})
				]
			});
		}
		/**
		* One package's page: the crumb back to the list; its icon with its switch
		* and, for a package the profile installed or a selection the Host can remove, uninstall; its title beside its
		* version tag, its beta tag, and its problem tag; the package name the title
		* stands for; its one-liner; the Host's problem when it reports one; the
		* configuration the bundle registered for itself; its rows with their switches
		* and configure controls; and where it comes from.
		*/
		function PackageDetail({ pkg, t, resolveText, busy, rowBusy, configured, configure, renderSlot, inMore, versions, detail, onBack, onSetEnabled, onUninstall, onUpdate, onSetRowEnabled, onEnsureVersions, onCheckVersions, onUpdateVersion }) {
			const { title, description, beta } = packageText(pkg, resolveText);
			const newer = versionUpdate(versions);
			const status = packageStatus(pkg);
			const subject = {
				kind: "bundle",
				pkg: packageRef(pkg)
			};
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.detail,
				"data-plugin-detail": pkg.name,
				children: [
					(0, react_jsx_runtime.jsx)(DetailTop, {
						crumbLabel: inMore ? t("backToPackage", { name: t("moreTitle") }) : t("backToList"),
						crumbText: t(inMore ? "moreTitle" : "crumbRoot"),
						onBack,
						icon: (0, react_jsx_runtime.jsx)(PackageArtwork, { src: pkg.meta?.icon }, pkg.meta?.icon),
						actions: (0, react_jsx_runtime.jsxs)("div", {
							className: PluginManagerPage_module_css_default.detailActions,
							children: [
								renderSlot("plugins.detail.actions", { subject }),
								updateAvailable(pkg) ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
									disabled: busy,
									"aria-label": t("updateLabel", { name: title }),
									onClick: onUpdate,
									children: t("update")
								}) : null,
								newer === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "primary",
									size: "sm",
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
									disabled: busy,
									"aria-label": t("versionsUpdateLabel", { version: newer }),
									onClick: () => {
										onUpdateVersion(newer);
									},
									children: t("versionsUpdateLabel", { version: newer })
								}),
								pkg.installed || pkg.removable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									className: PluginManagerPage_module_css_default.danger,
									icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 13 }),
									"aria-label": t("uninstallLabel", { name: title }),
									disabled: busy || !pkg.removable || pkg.readOnlyReason !== void 0,
									onClick: onUninstall,
									children: t("uninstall")
								}) : null,
								(0, react_jsx_runtime.jsx)(EnableSwitch, {
									pkg,
									title,
									t,
									busy,
									onSetEnabled
								})
							]
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailMain,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.titleRow,
								children: [
									(0, react_jsx_runtime.jsx)("h3", {
										className: PluginManagerPage_module_css_default.detailTitle,
										children: title
									}),
									pkg.version === void 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.versionTag,
										tone: "neutral",
										children: t("versionTag", { version: pkg.version })
									}),
									beta ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "info",
										children: t("statusBeta")
									}) : null,
									status === "problem" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "danger",
										children: t("statusProblem")
									}) : null,
									pkg.availability === "missing" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										children: t(pkg.installed ? "statusMissingFiles" : "statusNotInstalled")
									}) : null,
									updateAvailable(pkg) || newer !== void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										className: PluginManagerPage_module_css_default.statusTag,
										tone: "info",
										children: t("statusUpdateAvailable")
									}) : null,
									renderSlot("plugins.detail.badge", { subject })
								]
							}),
							(0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailName,
								children: (0, react_jsx_runtime.jsx)("code", {
									"data-plugin-name": true,
									children: pkg.name
								})
							}),
							description === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.detailDesc,
								children: description
							})
						]
					}),
					(0, react_jsx_runtime.jsx)(MetadataError, {
						error: pkg.meta?.error,
						t
					}),
					pkg.error === void 0 ? null : (0, react_jsx_runtime.jsxs)("p", {
						className: PluginManagerPage_module_css_default.reason,
						role: "status",
						children: [
							t("reasonLabel"),
							": ",
							managementText(pkg.error, t)
						]
					}),
					pkg.readOnlyReason === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.reason,
						role: "status",
						children: managementText({ code: pkg.readOnlyReason }, t)
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.detailSections,
						children: [
							detail,
							configured ? (0, react_jsx_runtime.jsx)("section", {
								className: PluginManagerPage_module_css_default.detailSection,
								"data-plugin-config": true,
								children: renderSlot("plugins.bundle.config", { view: "page" }, { entryKey: pkg.name })
							}) : null,
							pkg.availability === "missing" ? null : (0, react_jsx_runtime.jsx)(RowsSection, {
								rows: pkg.rows,
								t,
								resolveText,
								toggle: pkg.enabled ? {
									busy: (row) => busy || rowBusy(row),
									onSetEnabled: onSetRowEnabled
								} : void 0,
								configure
							}),
							(0, react_jsx_runtime.jsx)(VersionSection, {
								pkg,
								check: versions,
								t,
								busy,
								onEnsure: onEnsureVersions,
								onCheck: onCheckVersions,
								onUpdate: onUpdateVersion
							}),
							(0, react_jsx_runtime.jsx)(SourceSection, {
								pkg,
								t
							}),
							renderSlot("plugins.detail.section", { subject })
						]
					})
				]
			});
		}
		/** Output lines an install run's terminal shows before its middle folds: the first and last six of a long pnpm log. */
		const INSTALL_TERMINAL_LINES = 12;
		/** The install terminal's display copy, from the tab's dictionary. */
		function terminalLabels(t) {
			return {
				commandLine: (line) => t("terminalCommandLine", { n: String(line) }),
				/* v8 ignore next -- the Host reports a killed pnpm as a null exit code, never a signal name; the label interface needs one */
				signal: (signal) => t("terminalSignal", { signal }),
				exitCode: (code) => t("terminalExitCode", { code: String(code) }),
				noExitCode: t("terminalNoExitCode"),
				running: t("terminalRunning"),
				failed: t("terminalFailed"),
				done: t("terminalDone"),
				copy: t("terminalCopy"),
				copied: t("terminalCopied"),
				noOutput: t("terminalNoOutput"),
				collapseAria: t("terminalCollapseAria"),
				collapse: t("terminalCollapse"),
				expandAria: (hidden) => t("terminalExpandAria", { n: String(hidden) }),
				expand: (hidden) => t("terminalExpand", { n: String(hidden) })
			};
		}
		/** The sentence under the field for a spec the check refused. */
		const INPUT_PROBLEM_KEYS = {
			"invalid-spec": "installProblemInvalid",
			"already-installed": "installProblemInstalled",
			"shipped": "installProblemShipped",
			"not-found": "installProblemNotFound",
			"not-a-package": "installProblemNotPackage",
			"not-a-bundle": "installProblemNotBundle",
			"network": "installProblemNetwork",
			"unknown": "installProblemUnknown"
		};
		/** The spec form the install guide shows, with an example the person can drop into the field. */
		const GUIDE_EXAMPLES = [{
			key: "id",
			titleKey: "installGuideIdTitle",
			exampleKey: "installGuideIdExample",
			hintKey: "installGuideIdHint"
		}];
		/** The one-line reading of a classified pnpm failure. */
		const FAILURE_KIND_KEYS = {
			"pnpm-missing": "installFailurePnpmMissing",
			"timeout": "installFailureTimeout",
			"not-found": "installFailureNotFound",
			"no-matching-version": "installFailureNoMatchingVersion",
			"network": "installFailureNetwork",
			"disk-full": "installFailureDiskFull",
			"permission": "installFailurePermission",
			"build-blocked": "installFailureBuildBlocked",
			"integrity": "installFailureIntegrity",
			"unknown": "installFailureGeneric"
		};
		/** The navigation value of the page's own tab; contributed tabs use their registration ids. */
		const INSTALLED_TAB = "installed";
		/** The heading of each screen past the spec. */
		const SCREEN_TITLE_KEYS = {
			starting: "installStarting",
			running: "installingTitle",
			cancelling: "installCancelling",
			applying: "installApplying",
			unconfirmed: "installUnconfirmedTitle",
			unknown: "installUnknownTitle",
			done: "installedTitle",
			failed: "installFailedTitle"
		};
		/** What the spec's kind reads as when the package carries no description of its own. */
		const SUBJECT_KIND_KEYS = {
			registry: void 0,
			path: "installSubjectPath",
			git: "installSubjectGit",
			tarball: "installSubjectTarball"
		};
		/** A check no registry answered names every registry asked; any other refusal reads by its problem. */
		function inputProblemSentence(problem, t, resolved) {
			const asked = problem.registries ?? [];
			return problem.problem === "network" && asked.length > 1 ? t("installProblemNetworkAll", { registries: registryList(asked, t, resolved) }) : t(INPUT_PROBLEM_KEYS[problem.problem], { reason: problem.reason });
		}
		/** The registries asked, by name, in the dictionary's list form. */
		function registryList(registries, t, resolved) {
			return registries.map((registry) => registryText(registry, t, resolved).name).join(t("registryListSeparator"));
		}
		/** An option's name with its host in tertiary text, unless the host is the name. */
		function registryOption(registry, t, resolved) {
			const { name, host } = registryText(registry, t, resolved);
			return name === host ? name : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				name,
				" ",
				(0, react_jsx_runtime.jsx)("span", {
					className: PluginManagerPage_module_css_default.registryHint,
					children: host
				})
			] });
		}
		/**
		* The failed screen's one line: a pnpm failure by its kind, a refusal by its
		* code, any other failure in the Host's words; the run's output stays behind the details.
		* A run the Host laid at the spec's own host says so; one it laid at a registry
		* names every registry asked when there were several.
		*/
		function failureText(failure, t, install) {
			if (failure === null) return t("installFailureGeneric");
			if (failure.code === "incompatible-version") {
				const incompatible = failure.incompatible === void 0 ? {} : { incompatible: failure.incompatible };
				return managementText({
					code: failure.code,
					installing: true,
					...incompatible
				}, t);
			}
			if (failure.kind === "build-blocked" && !failure.pendingBuilds?.length) return t("installFailureBuildBlockedManual");
			const host = install?.subject?.host;
			if (failure.failedAt === "spec-host" && host !== void 0) return t("installFailureNetworkHost", { host });
			const asked = install?.attempts?.registries ?? [];
			if (failure.failedAt === "registry" && (failure.kind === "network" || failure.kind === "timeout") && asked.length > 1) return t("installFailureNetworkAll", { registries: registryList(asked, t, install?.registries?.resolved ?? null) });
			if (failure.kind !== void 0) return t(FAILURE_KIND_KEYS[failure.kind]);
			if (failure.code !== void 0) return managementText({
				code: failure.code,
				diagnostic: failure.reason
			}, t);
			if (failure.reason !== "") return failure.reason;
			return failure.stage === "enable" && failure.enabled === true ? t("installFailedEnabling") : t("installFailureGeneric");
		}
		/** The package an install is about: its name, one-liner, version, and, when `showSpec` is set, its spec. */
		function SubjectBlock({ lines, t }) {
			return (0, react_jsx_runtime.jsxs)("div", {
				className: PluginManagerPage_module_css_default.subject,
				"data-install-subject": lines.spec,
				children: [
					(0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectName,
						children: lines.title
					}),
					lines.description === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectDesc,
						children: lines.description
					}),
					lines.version === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectMeta,
						children: t("installVersion", { version: lines.version })
					}),
					lines.showSpec ? (0, react_jsx_runtime.jsx)("p", {
						className: PluginManagerPage_module_css_default.subjectSpec,
						children: lines.spec
					}) : null
				]
			});
		}
		/** The checked package as the Host read it before installing; a confirmed version keeps its tab's name and version. */
		function SubjectCard({ subject, confirmed, t }) {
			const kindKey = SUBJECT_KIND_KEYS[subject.kind];
			return (0, react_jsx_runtime.jsx)(SubjectBlock, {
				t,
				lines: {
					spec: subject.spec,
					title: confirmed?.title ?? subject.name ?? subject.spec,
					description: subject.description ?? (kindKey === void 0 ? void 0 : t(kindKey)),
					version: subject.version ?? confirmed?.version,
					showSpec: confirmed !== void 0
				}
			});
		}
		/** Track one install field's composition, including Safari's 10ms post-composition Enter window. */
		function useInstallComposition(active) {
			const composition = (0, react.useRef)({
				active: false,
				until: 0
			});
			(0, react.useEffect)(() => {
				composition.current = {
					active: false,
					until: 0
				};
			}, [active]);
			return {
				onCompositionStart: () => {
					composition.current.active = true;
				},
				onCompositionEnd: () => {
					composition.current = {
						active: false,
						until: Date.now() + 10
					};
				},
				onBlur: () => {
					composition.current = {
						active: false,
						until: 0
					};
				},
				isComposing: (event) => event.isComposing || Reflect.get(event, "keyCode") === 229 || composition.current.active || Date.now() < composition.current.until
			};
		}
		/**
		* The install dialog: the spec and its check, then the installing, installed,
		* and failed screens over the same subject card. A failed run that left
		* install scripts undecided shows them for approval in place of plain retry.
		*/
		function InstallDialog({ install, t, onClose, onEditSpec, onRun, onCancel, onReconcile, onToggleDetails, onEnableNow, onApproveBuilds, onToggleRegistry, onChooseRegistry, onChangeRegistry, onUseGithubMirror }) {
			const errorId = (0, react.useId)();
			const templateHintId = (0, react.useId)();
			const guideId = (0, react.useId)();
			const approvalId = (0, react.useId)();
			const registryId = (0, react.useId)();
			const registryErrorId = (0, react.useId)();
			const [guideOpen, setGuideOpen] = (0, react.useState)(false);
			const [customRegistryDraft, setCustomRegistryDraft] = (0, react.useState)("");
			const { phase } = install;
			const registryToggleRef = (0, react.useRef)(null);
			const registryPanelRef = (0, react.useRef)(null);
			const registryCustomRef = (0, react.useRef)(null);
			const registryShown = install.registryOpen && phase === "idle";
			const specComposition = useInstallComposition(install.open && phase === "idle");
			const registryComposition = useInstallComposition(install.open && registryShown);
			const registryPosition = (0, _deepseek_ai_dsh_client_ui_primitives.useAnchoredPosition)({
				open: registryShown,
				anchorRef: registryToggleRef,
				panelRef: registryPanelRef,
				align: "end",
				gap: 6,
				margin: 12
			});
			const registryReady = registryShown && registryPosition !== null;
			(0, react.useEffect)(() => {
				if (registryReady && install.registryError) registryCustomRef.current?.focus();
			}, [registryReady, install.registryError]);
			(0, _deepseek_ai_dsh_client_ui_primitives.useDismissOnOutsidePointer)(registryToggleRef, registryShown, onToggleRegistry, registryPanelRef);
			(0, react.useEffect)(() => {
				if (!registryShown) return;
				const onKeyDown = (event) => {
					if (event.key !== "Escape") return;
					event.stopPropagation();
					onToggleRegistry();
				};
				document.addEventListener("keydown", onKeyDown, true);
				return () => {
					document.removeEventListener("keydown", onKeyDown, true);
				};
			}, [registryShown, onToggleRegistry]);
			if (githubRecoveryRegistry(install) !== void 0) {
				const anotherWay = asksMirror(install);
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t(install.failure?.kind === "timeout" ? "installGithubTimeoutTitle" : "installGithubFailedTitle"),
					closeLabel: t("close"),
					description: t("installGithubFailedDescription"),
					footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: onClose,
						children: t("cancel")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						autoFocus: true,
						onClick: () => {
							if (anotherWay) setGuideOpen(true);
							onUseGithubMirror();
						},
						children: t(anotherWay ? "installTryAnotherWay" : "installUseGithubMirror")
					})] })
				});
			}
			if ((phase === "idle" || phase === "checking") && install.confirmed !== void 0) {
				const checking = phase === "checking";
				const problem = install.inputError;
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t(problem === null ? "installConfirmedTitle" : "installConfirmedRefused"),
					closeLabel: t("close"),
					className: PluginManagerPage_module_css_default.installDialog,
					footer: checking ? void 0 : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						onClick: onClose,
						children: t("close")
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						autoFocus: true,
						onClick: onRun,
						children: t(problem === null ? "installRun" : "retry")
					})] }),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installBody,
						"data-install-phase": phase,
						children: [(0, react_jsx_runtime.jsx)(SubjectBlock, {
							t,
							lines: {
								spec: install.spec,
								...install.confirmed,
								showSpec: true
							}
						}), checking ? (0, react_jsx_runtime.jsxs)("p", {
							className: `${PluginManagerPage_module_css_default.status} ${PluginManagerPage_module_css_default.statusWithDot}`,
							role: "status",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }), t("installChecking")]
						}) : problem === null ? null : (0, react_jsx_runtime.jsx)("p", {
							className: PluginManagerPage_module_css_default.inputError,
							role: "alert",
							children: inputProblemSentence(problem, t, install.registries?.resolved ?? null)
						})]
					})
				});
			}
			if (phase === "idle" || phase === "checking") {
				const checking = phase === "checking";
				const empty = install.spec.trim() === "";
				const choice = install.registry;
				const resolved = install.registries?.resolved ?? null;
				const chosenTitle = choice.kind === "custom" ? t("registryCustom") : registryText(choice.registry, t, resolved).name;
				const inputSentence = install.inputError === null ? null : inputProblemSentence(install.inputError, t, resolved);
				const templateHint = install.spec === "https://github.com/author/dsh-plugin" ? t("installGitTemplateHint") : install.spec === "/Users/name/my-plugin" ? t("installPathTemplateHint") : null;
				return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
					open: install.open,
					onClose,
					title: t("installTitle"),
					closeLabel: t("close"),
					...install.mirrorRecovery ? {} : { description: t("installDescription") },
					className: PluginManagerPage_module_css_default.installDialog,
					contentClassName: PluginManagerPage_module_css_default.installContent,
					footer: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installFooter,
						children: [(0, react_jsx_runtime.jsxs)("p", {
							className: PluginManagerPage_module_css_default.installSafety,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsxs)("span", {
								className: PluginManagerPage_module_css_default.installSafetyText,
								children: [(0, react_jsx_runtime.jsx)("span", { children: t("installGuideSafety") }), (0, react_jsx_runtime.jsx)("span", { children: t("installUpgradeNotice") })]
							})]
						}), (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							variant: "primary",
							className: PluginManagerPage_module_css_default.wide,
							disabled: checking || empty,
							"aria-busy": checking,
							onClick: onRun,
							children: [checking ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : null, t(checking ? "installChecking" : "installRun")]
						})]
					}),
					children: (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.installBody,
						children: [
							(0, react_jsx_runtime.jsx)("div", {
								className: PluginManagerPage_module_css_default.installField,
								children: (0, react_jsx_runtime.jsx)("input", {
									type: "text",
									autoFocus: install.mirrorRecovery === true,
									"data-modal-autofocus": true,
									value: install.spec,
									placeholder: t("installSpecPlaceholder"),
									disabled: checking,
									"aria-label": t(install.mirrorRecovery ? "installPackageLabel" : "installSpecLabel"),
									"aria-invalid": install.inputError !== null,
									"aria-describedby": inputSentence !== null ? errorId : templateHint !== null ? templateHintId : void 0,
									onChange: (event) => {
										onEditSpec(event.currentTarget.value);
									},
									onCompositionStart: specComposition.onCompositionStart,
									onCompositionEnd: specComposition.onCompositionEnd,
									onBlur: specComposition.onBlur,
									onKeyDown: (event) => {
										if (specComposition.isComposing(event.nativeEvent)) return;
										if (event.key === "Enter" && !empty && !checking) onRun();
									}
								})
							}),
							inputSentence === null ? null : (0, react_jsx_runtime.jsx)("p", {
								id: errorId,
								className: PluginManagerPage_module_css_default.inputError,
								role: "alert",
								children: inputSentence
							}),
							inputSentence === null && templateHint !== null ? (0, react_jsx_runtime.jsx)("p", {
								id: templateHintId,
								className: PluginManagerPage_module_css_default.templateHint,
								role: "status",
								children: templateHint
							}) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.optionsRow,
								children: [(0, react_jsx_runtime.jsxs)("button", {
									type: "button",
									className: PluginManagerPage_module_css_default.guideToggle,
									"aria-expanded": guideOpen,
									"aria-controls": guideId,
									onClick: () => {
										setGuideOpen((open) => !open);
									},
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
										className: PluginManagerPage_module_css_default.guideChevron,
										"aria-hidden": "true"
									}), (0, react_jsx_runtime.jsx)("span", { children: t(guideOpen ? "installGuideHide" : "installGuideToggle") })]
								}), (0, react_jsx_runtime.jsxs)("button", {
									ref: registryToggleRef,
									type: "button",
									className: PluginManagerPage_module_css_default.registryToggle,
									"aria-expanded": install.registryOpen,
									"aria-controls": registryId,
									"aria-haspopup": "dialog",
									disabled: checking,
									onClick: onToggleRegistry,
									children: [
										(0, react_jsx_runtime.jsx)("span", { children: t("registryToggle") }),
										" ",
										(0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryChosen,
											children: chosenTitle
										}),
										(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.guideChevron,
											"aria-hidden": "true"
										})
									]
								})]
							}),
							guideOpen ? (0, react_jsx_runtime.jsx)("div", {
								id: guideId,
								className: PluginManagerPage_module_css_default.guide,
								"data-install-guide": true,
								children: (0, react_jsx_runtime.jsx)("ol", {
									className: PluginManagerPage_module_css_default.guideList,
									children: GUIDE_EXAMPLES.map(({ key, titleKey, exampleKey, hintKey }) => (0, react_jsx_runtime.jsxs)("li", {
										className: PluginManagerPage_module_css_default.guideItem,
										children: [(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.guideMain,
											children: [
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.guideTitle,
													children: t(titleKey)
												}),
												(0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.guideHint,
													children: t(hintKey)
												}),
												(0, react_jsx_runtime.jsxs)("span", {
													className: PluginManagerPage_module_css_default.guideExample,
													children: [(0, react_jsx_runtime.jsx)("span", {
														className: PluginManagerPage_module_css_default.guideExampleLabel,
														children: t("installGuideExampleLabel")
													}), (0, react_jsx_runtime.jsx)("code", { children: t(exampleKey) })]
												})
											]
										}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											"aria-label": t("installGuideFillAria", { example: t(exampleKey) }),
											disabled: checking,
											onClick: () => {
												onEditSpec(t(exampleKey));
											},
											children: t("installGuideFill")
										})]
									}, key))
								})
							}) : null,
							registryShown ? (0, react_dom.createPortal)((0, react_jsx_runtime.jsxs)("fieldset", {
								ref: registryPanelRef,
								id: registryId,
								className: PluginManagerPage_module_css_default.registry,
								style: registryPosition ?? {
									visibility: "hidden",
									left: 0,
									top: 0
								},
								"data-install-registry": true,
								"aria-label": t("registryLegend"),
								onKeyDown: (event) => {
									if (event.key !== "Tab" || event.ctrlKey || event.altKey || event.metaKey || event.nativeEvent.isComposing) return;
									event.preventDefault();
									event.stopPropagation();
									const radio = event.currentTarget.querySelector("input[type=\"radio\"]:checked");
									const field = registryCustomRef.current;
									if (event.shiftKey && event.target === field) radio?.focus();
									else if (!event.shiftKey && event.target !== field) field?.focus();
									else {
										onToggleRegistry();
										registryToggleRef.current?.focus();
									}
								},
								children: [offeredRegistries(install.registries).map((registry) => {
									const checked = choice.kind === "offered" && choice.registry === registry;
									return (0, react_jsx_runtime.jsxs)("label", {
										className: PluginManagerPage_module_css_default.registryOption,
										"data-checked": checked,
										children: [(0, react_jsx_runtime.jsx)("input", {
											type: "radio",
											name: registryId,
											checked,
											onChange: () => {
												if (choice.kind === "custom") setCustomRegistryDraft(choice.url);
												onChooseRegistry({
													kind: "offered",
													registry
												});
											}
										}), (0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryTitle,
											children: registryOption(registry, t, resolved)
										})]
									}, registry ?? "");
								}), (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.registryOption,
									"data-checked": choice.kind === "custom",
									onClick: (event) => {
										if (!(event.target instanceof HTMLInputElement)) event.preventDefault();
										registryCustomRef.current?.focus();
									},
									children: [
										(0, react_jsx_runtime.jsxs)("label", {
											className: PluginManagerPage_module_css_default.registryCustomPick,
											children: [(0, react_jsx_runtime.jsx)("input", {
												type: "radio",
												name: registryId,
												checked: choice.kind === "custom",
												onChange: () => {
													onChooseRegistry({
														kind: "custom",
														url: customRegistryDraft
													});
													registryCustomRef.current?.focus();
												}
											}), (0, react_jsx_runtime.jsx)("span", {
												className: PluginManagerPage_module_css_default.registryTitle,
												children: (0, react_jsx_runtime.jsx)("span", { children: t("registryCustom") })
											})]
										}),
										(0, react_jsx_runtime.jsx)("input", {
											ref: registryCustomRef,
											type: "text",
											className: PluginManagerPage_module_css_default.registryCustomField,
											"aria-label": t("registryCustom"),
											placeholder: t("registryCustomPlaceholder"),
											value: choice.kind === "custom" ? choice.url : customRegistryDraft,
											"aria-invalid": install.registryError,
											"aria-describedby": install.registryError ? registryErrorId : void 0,
											onFocus: () => {
												if ((0, _deepseek_ai_dsh_client_ui_primitives.pointerModality)() && choice.kind !== "custom") onChooseRegistry({
													kind: "custom",
													url: customRegistryDraft
												});
											},
											onChange: (event) => {
												onChooseRegistry({
													kind: "custom",
													url: event.currentTarget.value
												});
											},
											onCompositionStart: registryComposition.onCompositionStart,
											onCompositionEnd: registryComposition.onCompositionEnd,
											onBlur: registryComposition.onBlur,
											onKeyDown: (event) => {
												if (registryComposition.isComposing(event.nativeEvent)) return;
												if (event.key === "Enter" && !empty) onRun();
											}
										}),
										install.registryError ? (0, react_jsx_runtime.jsx)("p", {
											id: registryErrorId,
											className: PluginManagerPage_module_css_default.inputError,
											role: "alert",
											children: t("registryCustomInvalid")
										}) : null,
										(0, react_jsx_runtime.jsx)("span", {
											className: PluginManagerPage_module_css_default.registryHint,
											children: t("registryCustomHint")
										})
									]
								})]
							}), document.body) : null
						]
					})
				});
			}
			const heading = t(phase === "done" && install.subject?.bundled ? "installBundledTitle" : SCREEN_TITLE_KEYS[phase]);
			const pending = isInstallPending(phase);
			const settledDetails = phase === "failed" || phase === "done" || phase === "unknown";
			const cancellable = phase === "starting" || phase === "running" || phase === "unconfirmed";
			const stoppable = cancellable || phase === "failed" || phase === "unknown";
			const failure = install.failure;
			const uncertainty = failure?.uncertainty;
			const uncertaintyText = failure?.uncertainty === void 0 ? null : t({
				result: "installResultUnconfirmed",
				cancellation: phase === "applying" ? "installApplyingCancellationError" : "installCancelUnconfirmed",
				acceptance: "installAwaitingAcceptance"
			}[failure.uncertainty], { reason: failure.reason });
			const pendingBuilds = phase === "failed" ? install.failure?.pendingBuilds ?? [] : [];
			const approvable = pendingBuilds.length > 0;
			const firstRun = install.runs[0];
			const asked = install.attempts !== null && install.attempts.registries.length > 1 ? install.attempts : null;
			const current = asked === null ? void 0 : asked.registries.at(-1);
			const previous = asked === null ? void 0 : asked.registries.at(-2);
			const resolved = install.registries?.resolved ?? null;
			const attemptLine = pending && asked !== null && current !== void 0 && previous !== void 0 ? t("installAttempt", {
				previous: registryText(previous, t, resolved).name,
				registry: registryText(current, t, resolved).name,
				index: String(asked.registries.length),
				total: String(asked.total)
			}) : null;
			const changeable = phase === "failed" && !approvable && install.failure?.failedAt === "registry" && install.confirmed === void 0;
			const subject = install.subject;
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: install.open,
				onClose,
				title: heading,
				headless: true,
				className: PluginManagerPage_module_css_default.installDialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: PluginManagerPage_module_css_default.wizard,
					"data-install-phase": phase,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.wizardHead,
						children: [phase === "done" || install.confirmed !== void 0 && !pending ? (0, react_jsx_runtime.jsx)("span", {}) : (0, react_jsx_runtime.jsxs)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.wizardBack,
							"aria-label": t(install.confirmed !== void 0 ? "cancel" : pending ? "installCancelAndEdit" : "installEditAria"),
							disabled: !stoppable,
							onClick: onCancel,
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineMedium, { "aria-hidden": "true" }), (0, react_jsx_runtime.jsx)("span", { children: t(install.confirmed !== void 0 ? "cancel" : pending ? "installCancelAndEdit" : "installEdit") })]
						}), (0, react_jsx_runtime.jsx)("button", {
							type: "button",
							className: PluginManagerPage_module_css_default.wizardClose,
							"aria-label": t(cancellable ? "installCloseCancels" : "close"),
							onClick: onClose,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineMedium, { size: 14 })
						})]
					}), (0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.wizardScroll,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.wizardHero,
								children: [
									(0, react_jsx_runtime.jsx)("span", {
										className: PluginManagerPage_module_css_default.wizardIcon,
										"data-state": pending ? "ongoing" : phase === "done" ? "done" : "error",
										"aria-hidden": "true",
										children: pending ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
											state: "ongoing",
											size: 28
										}) : phase === "done" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconCheckCircleFillRegular, { size: 28 }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, { size: 28 })
									}),
									(0, react_jsx_runtime.jsx)("h2", {
										className: PluginManagerPage_module_css_default.wizardTitle,
										role: phase === "failed" ? "alert" : "status",
										children: heading
									}),
									phase === "done" && subject?.bundled ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: t("installBundledDescription")
									}) : null,
									phase === "failed" ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: failureText(install.failure, t, install)
									}) : null,
									phase === "failed" && failure?.stage === "enable" && failure.enabled === true && (failure.code !== void 0 || failure.reason !== "") ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: t("installFailedEnabling")
									}) : null,
									attemptLine === null ? null : (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: attemptLine
									}),
									uncertaintyText === null ? null : (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										role: "alert",
										children: uncertaintyText
									}),
									phase === "unknown" ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.wizardSub,
										children: t("installUnknownDescription")
									}) : null
								]
							}),
							subject === null ? null : (0, react_jsx_runtime.jsx)(SubjectCard, {
								subject: phase === "done" && install.installedVersion !== null ? {
									...subject,
									version: install.installedVersion
								} : subject,
								confirmed: install.confirmed,
								t
							}),
							approvable ? (0, react_jsx_runtime.jsxs)("section", {
								className: PluginManagerPage_module_css_default.approval,
								role: "group",
								"aria-labelledby": approvalId,
								"data-install-approval": true,
								children: [
									(0, react_jsx_runtime.jsx)("h3", {
										id: approvalId,
										className: PluginManagerPage_module_css_default.approvalTitle,
										children: t("installApprovalTitle")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalText,
										children: t("installApprovalDescription")
									}),
									(0, react_jsx_runtime.jsx)("ul", {
										className: PluginManagerPage_module_css_default.approvalList,
										children: pendingBuilds.map((name) => (0, react_jsx_runtime.jsx)("li", { children: (0, react_jsx_runtime.jsx)("code", { children: name }) }, name))
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalText,
										children: t("installApprovalConsequence")
									}),
									(0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.approvalCaution,
										children: t("installApprovalCaution")
									}),
									(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "primary",
										className: PluginManagerPage_module_css_default.wide,
										onClick: onApproveBuilds,
										children: t("installApproveAndRetry")
									})
								]
							}) : null,
							phase === "done" && install.installed === null ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.result,
								role: "status",
								children: t("installDoneNothing")
							}) : null,
							phase === "done" && install.restartRequired ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.resultWarn,
								role: "status",
								children: restartText("installDoneRestart", install.restartReason, t)
							}) : null,
							phase === "done" && subject?.kind === "registry" && subject.name !== void 0 && subject.version !== void 0 && install.installedVersion !== null && install.installedVersion !== subject.version && (install.attempts?.registries.length ?? 1) === 1 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.resultWarn,
								role: "status",
								children: t("installDoneOtherVersion", {
									installed: install.installedVersion,
									version: subject.version,
									exact: `${subject.name}@${subject.version}`
								})
							}) : null,
							phase === "done" && install.approvedBuilds.length > 0 ? (0, react_jsx_runtime.jsx)("p", {
								className: PluginManagerPage_module_css_default.result,
								role: "status",
								children: t("installDoneApproved", { names: install.approvedBuilds.join(", ") })
							}) : null,
							(0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.wizardFoot,
								children: [
									subject?.bundled ? null : (0, react_jsx_runtime.jsxs)("button", {
										type: "button",
										className: PluginManagerPage_module_css_default.detailsToggle,
										"aria-expanded": install.detailsOpen,
										onClick: onToggleDetails,
										children: [(0, react_jsx_runtime.jsx)("span", { children: t(install.detailsOpen ? "installDetailsHide" : "installDetailsShow") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
											className: PluginManagerPage_module_css_default.detailsChevron,
											"aria-hidden": "true"
										})]
									}),
									uncertainty === "result" ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										className: PluginManagerPage_module_css_default.footAction,
										onClick: onReconcile,
										children: t("installReconcile")
									}) : null,
									pending ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										className: PluginManagerPage_module_css_default.footAction,
										disabled: !cancellable,
										onClick: onCancel,
										children: t(phase === "cancelling" ? "installCancelling" : "installCancel")
									}) : null,
									phase === "failed" && !approvable ? (0, react_jsx_runtime.jsxs)("span", {
										className: PluginManagerPage_module_css_default.wizardActions,
										children: [changeable ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "outline",
											size: "sm",
											className: PluginManagerPage_module_css_default.footAction,
											onClick: onChangeRegistry,
											children: t("installChangeRegistry")
										}) : null, (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
											variant: "primary",
											size: "sm",
											className: PluginManagerPage_module_css_default.footAction,
											onClick: onRun,
											children: t("installRetry")
										})]
									}) : null
								]
							}),
							install.detailsOpen ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.detailsBody,
								children: [
									firstRun !== void 0 ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.installLocation,
										children: t("installLocation", { dir: firstRun.cwd })
									}) : settledDetails ? (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.installLocation,
										children: t("installDetailsNoOutput")
									}) : null,
									install.runs.map((run, index) => {
										const registry = asked?.registries[index];
										return (0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.run,
											children: [registry === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
												className: PluginManagerPage_module_css_default.attemptBadge,
												children: t("installAttemptBadge", {
													index: String(index + 1),
													registry: registryText(registry, t, resolved).name
												})
											}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.TerminalBlock, {
												command: run.command,
												output: run.output,
												running: run.exitCode === void 0,
												exitCode: run.exitCode,
												maxLines: INSTALL_TERMINAL_LINES,
												labels: {
													...terminalLabels(t),
													...phase === "cancelling" ? { failed: t("installCancelledShort") } : {}
												},
												className: PluginManagerPage_module_css_default.terminal
											})]
										}, run.jobId);
									}),
									install.logPath === null ? null : (0, react_jsx_runtime.jsx)("p", {
										className: PluginManagerPage_module_css_default.installLocation,
										children: t("installLogPath", { path: install.logPath })
									})
								]
							}) : null,
							phase !== "done" ? null : install.installed !== null && install.subject?.selection === void 0 ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								className: PluginManagerPage_module_css_default.wide,
								disabled: install.enabling,
								"aria-busy": install.enabling,
								onClick: onEnableNow,
								children: t("installEnableNow")
							}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "primary",
								className: PluginManagerPage_module_css_default.wide,
								onClick: onClose,
								children: t("installClose")
							})
						]
					})]
				})
			});
		}
		/** The confirmation an uninstall waits on. */
		function ConfirmDialog({ name, t, onConfirm, onCancel }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: onCancel,
				title: t("confirmUninstallTitle", { name }),
				closeLabel: t("close"),
				description: t("confirmUninstallDescription"),
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onCancel,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					className: PluginManagerPage_module_css_default.dangerButton,
					onClick: onConfirm,
					children: t("confirmUninstall")
				})] })
			});
		}
		/** Render the plugin manager: the official plugins and installed bundles, their pages, the install dialog, and the confirmation. */
		function PluginManagerPage(props) {
			const { t, ensure, renderSlot, resolveText } = props;
			const configurations = props.useConfigurations((snapshot) => snapshot.view?.namespaces);
			const formFor = (id) => {
				if (!configurations?.some((view) => view.ns === id)) return void 0;
				const form = props.configForm(id);
				return {
					state: form.getSnapshot(),
					mutate: (ops, revision) => form.mutate(ops, revision)
				};
			};
			const state = props.usePluginManager((snapshot) => snapshot);
			const ledger = props.useConfigLedger((snapshot) => snapshot);
			const view = props.useStore((state) => state.view), { setView, setTab } = props.actions;
			const tabs = props.usePluginTabs((snapshot) => snapshot);
			const bundleDetails = props.useBundleDetails((snapshot) => snapshot);
			const language = props.useLocale((snapshot) => snapshot.active);
			const selectedTab = props.useStore((state) => state.tab);
			const tab = tabs.some((item) => item.id === selectedTab) ? selectedTab : INSTALLED_TAB;
			(0, react.useEffect)(() => {
				if (tab !== selectedTab) setTab(tab);
			}, [
				tab,
				selectedTab,
				setTab
			]);
			const tabsId = (0, react.useId)();
			const [activation, setActivation] = (0, react.useState)(null);
			const [headerRef] = (0, react.useState)(props.createHeaderRef);
			(0, react.useEffect)(() => {
				ensure();
			}, [ensure]);
			const { highlight, clearHighlight } = {
				highlight: state.highlight,
				clearHighlight: props.clearHighlight
			};
			(0, react.useEffect)(() => {
				if (highlight === null) return;
				const card = document.querySelector(`[data-plugin-package="${highlight}"]`);
				if (card !== null && typeof card.scrollIntoView === "function") card.scrollIntoView({
					block: "center",
					behavior: "smooth"
				});
				const timer = setTimeout(clearHighlight, HIGHLIGHT_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [highlight, clearHighlight]);
			const noticeLine = state.notice === null || state.notice.kind === "refresh-failed" ? null : noticeText(state.notice, t);
			const listed = state.packages.filter((pkg) => !HIDDEN_BUNDLES.has(pkg.name) && (pkg.listedByDefault !== false || pkg.enabled || pkg.installed || rowsRunning(pkg)) && (pkg.installed || pkg.official || pkg.error !== void 0));
			const mine = listed.filter((pkg) => !pkg.official);
			const official = listed.filter((pkg) => pkg.official);
			const ordered = orderOptionalBundles(official);
			const pinned = new Set(official.filter(pinnedToMainList).map((pkg) => pkg.name));
			const extensions = ordered.filter((pkg) => pinned.has(pkg.name));
			const more = ordered;
			const loaded = state.status === "ready" || state.status === "error";
			const refreshing = state.refreshStatus === "refreshing";
			const openPkg = view.kind === "package" || view.kind === "row" ? listed.find((pkg) => pkg.name === view.name) : void 0;
			const openItem = view.kind === "item" ? ledger.items.find((item) => item.id === view.id) : void 0;
			const openRow = view.kind === "row" && openPkg !== void 0 ? openPkg.rows.find((row) => row.rowId === view.rowId) : void 0;
			const onInstalled = tab === INSTALLED_TAB;
			const showsCards = !onInstalled || openPkg === void 0 && openItem === void 0;
			const detailFromMore = (view.kind === "package" || view.kind === "row") && (view.from === "more" || openPkg !== void 0 && MORE_BUNDLES.includes(view.name) && !pinned.has(view.name));
			const showsMoreList = onInstalled && showsCards && (view.kind === "more" || detailFromMore);
			const showsMainList = showsCards && !showsMoreList;
			const installedCards = onInstalled && showsCards;
			const openPkgInMore = openPkg !== void 0 && openPkg.official && detailFromMore;
			const returnTab = view.kind === "package" || view.kind === "row" ? view.returnTab : void 0;
			const backToMore = openPkgInMore && returnTab === void 0;
			const pkgOrigin = returnTab !== void 0 ? { returnTab } : backToMore ? { from: "more" } : {};
			const installedPanel = tabs.length === 0 || showsMoreList ? {} : {
				role: "tabpanel",
				id: `${tabsId}-${INSTALLED_TAB}-panel`,
				"aria-labelledby": `${tabsId}-${INSTALLED_TAB}`
			};
			const activated = listed.find((pkg) => pkg.name === activation && pkg.enabled && !state.busy.includes(pkg.name));
			const setBundleEnabled = (name, enabled) => {
				setActivation(enabled ? name : null);
				props.setEnabled(name, enabled);
			};
			const setRowEnabled = (row, enabled) => {
				/* v8 ignore next -- a row without a live entry has its switch disabled */
				if (row.entryId !== void 0) props.setRowEnabled(row.entryId, enabled);
			};
			const configure = (pkg) => ({
				has: (row) => ledger.rows.has(rowConfigKey(pkg.name, row.rowId)),
				open: (row) => {
					setView({
						kind: "row",
						name: pkg.name,
						rowId: row.rowId,
						...pkgOrigin
					});
				}
			});
			const updates = updatesNote(mine, state.versions, t);
			const updatePkg = state.update === null ? void 0 : state.packages.find((pkg) => pkg.name === state.update?.packageName);
			const packageBusy = (pkg) => bundleBusy(state, pkg.name);
			const packageCard = (pkg) => (0, react_jsx_runtime.jsx)(PackageCard, {
				pkg,
				t,
				resolveText,
				busy: packageBusy(pkg),
				highlighted: state.highlight === pkg.name,
				newer: versionUpdate(state.versions[pkg.name]),
				onOpen: () => {
					setActivation(null);
					setView({
						kind: "package",
						name: pkg.name,
						...showsMoreList ? { from: "more" } : {}
					});
				},
				onSetEnabled: (enabled) => {
					setBundleEnabled(pkg.name, enabled);
				}
			}, pkg.name);
			const basicCards = ledger.items.map((item) => (0, react_jsx_runtime.jsx)(ItemCard, {
				item,
				t,
				renderSlot,
				onOpen: () => {
					setView({
						kind: "item",
						id: item.id
					});
				}
			}, `item:${item.id}`));
			const renderGroup = (id, heading, cards) => {
				const offersMore = id === "extensions" && more.length > 0;
				if (cards.length === 0 && !offersMore) return null;
				return (0, react_jsx_runtime.jsxs)("section", {
					className: PluginManagerPage_module_css_default.group,
					"data-plugin-scope": "global",
					"data-plugin-group": id,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.groupHead,
						children: [(0, react_jsx_runtime.jsx)("h3", {
							className: PluginManagerPage_module_css_default.groupTitle,
							children: heading
						}), offersMore ? (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							className: PluginManagerPage_module_css_default.groupMore,
							onClick: () => {
								setView({ kind: "more" });
							},
							children: [t("moreAction"), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronRightOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							})]
						}) : null]
					}), cards.length > 0 ? (0, react_jsx_runtime.jsx)("ul", {
						className: PluginManagerPage_module_css_default.cards,
						children: cards
					}) : null]
				});
			};
			return (0, react_jsx_runtime.jsxs)("section", {
				className: PluginManagerPage_module_css_default.page,
				"data-plugin-panel": true,
				"aria-busy": state.status === "loading" || refreshing,
				children: [
					showsMoreList ? (0, react_jsx_runtime.jsxs)("header", {
						className: PluginManagerPage_module_css_default.moreHead,
						"data-window-drag": true,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
							size: "sm",
							className: PluginManagerPage_module_css_default.moreBack,
							"aria-label": t("backToList"),
							onClick: () => {
								setView({ kind: "list" });
							},
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronLeftOutlineMedium, {
								size: 20,
								"aria-hidden": "true"
							})
						}), (0, react_jsx_runtime.jsx)("h1", {
							className: PluginManagerPage_module_css_default.pageTitle,
							children: t("moreTitle")
						})]
					}) : null,
					(0, react_jsx_runtime.jsxs)("div", {
						className: PluginManagerPage_module_css_default.pageBody,
						"data-plugin-body": true,
						children: [
							showsMainList ? (0, react_jsx_runtime.jsx)("div", {
								className: `${PluginManagerPage_module_css_default.pageBar}${tabs.length > 0 ? ` ${PluginManagerPage_module_css_default.pageBarWithTabs}` : ""}`,
								"data-plugin-bar": true,
								ref: headerRef,
								children: (0, react_jsx_runtime.jsxs)("header", {
									className: PluginManagerPage_module_css_default.pageHead,
									"data-window-drag": true,
									children: [
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.pageHeading,
											children: [(0, react_jsx_runtime.jsx)("h1", {
												className: PluginManagerPage_module_css_default.pageTitle,
												"data-plugin-header-part": "title",
												children: t("title")
											}), (0, react_jsx_runtime.jsxs)("div", {
												className: PluginManagerPage_module_css_default.pageIntro,
												"data-plugin-header-part": "intro",
												children: [(0, react_jsx_runtime.jsx)("span", { children: t("intro") }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("infoDescription"),
													side: "bottom",
													delayMs: 300,
													maxWidth: 300,
													portal: true,
													openOnClick: true,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "ghost",
														size: "sm",
														className: PluginManagerPage_module_css_default.infoButton,
														"aria-label": t("infoLabel"),
														children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconInfoOutlineRegular, {
															size: 11,
															"aria-hidden": "true"
														})
													})
												})]
											})]
										}),
										(0, react_jsx_runtime.jsxs)("div", {
											className: PluginManagerPage_module_css_default.toolbar,
											"data-plugin-toolbar": true,
											"data-plugin-header-part": "toolbar",
											hidden: !onInstalled,
											children: [
												updates === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
													className: PluginManagerPage_module_css_default.updatesNote,
													"data-tone": updates.tone,
													children: updates.text
												}),
												(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("refresh"),
													delayMs: 500,
													focusDelayMs: 500,
													side: "bottom",
													portal: true,
													disabled: !loaded || refreshing,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "outline",
														size: "sm",
														className: PluginManagerPage_module_css_default.addButton,
														"aria-label": t("refresh"),
														"aria-busy": refreshing,
														disabled: !loaded || refreshing,
														onClick: props.refresh,
														icon: refreshing ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, {
															state: "ongoing",
															size: 13
														}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 13 }),
														children: (0, react_jsx_runtime.jsx)("span", {
															className: PluginManagerPage_module_css_default.toolbarLabel,
															children: t("refresh")
														})
													})
												}),
												state.install.requestId === void 0 ? (0, react_jsx_runtime.jsx)(AddPluginMenu, {
													t,
													disabled: !loaded,
													openInstall: props.openInstall,
													renderSlot
												}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
													label: t("installViewTask"),
													side: "bottom",
													delayMs: 500,
													focusDelayMs: 500,
													portal: true,
													disabled: !loaded,
													children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
														variant: "primary",
														size: "sm",
														className: PluginManagerPage_module_css_default.addButton,
														icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
														"aria-label": t("installViewTask"),
														disabled: !loaded,
														onClick: props.openInstall,
														children: (0, react_jsx_runtime.jsx)("span", {
															className: PluginManagerPage_module_css_default.toolbarLabel,
															children: t("installViewTask")
														})
													})
												})
											]
										}),
										tabs.length > 0 ? (0, react_jsx_runtime.jsx)("div", {
											className: PluginManagerPage_module_css_default.pageTabs,
											"data-plugin-header-part": "tabs",
											children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.SegmentedTabs, {
												size: "sm",
												className: PluginManagerPage_module_css_default.pageTabList,
												label: t("tabsLabel"),
												value: tab,
												onChange: (next) => {
													setTab(next);
												},
												items: [{
													value: INSTALLED_TAB,
													label: t("installedTab"),
													id: `${tabsId}-${INSTALLED_TAB}`,
													panelId: `${tabsId}-${INSTALLED_TAB}-panel`
												}, ...tabs.map((item) => ({
													value: item.id,
													label: item.label,
													id: `${tabsId}-${item.id}`,
													panelId: `${tabsId}-${item.id}-panel`
												}))]
											})
										}) : null
									]
								})
							}) : null,
							!onInstalled ? (0, react_jsx_runtime.jsx)("div", {
								role: "tabpanel",
								id: `${tabsId}-${tab}-panel`,
								"aria-labelledby": `${tabsId}-${tab}`,
								className: PluginManagerPage_module_css_default.tabPanel,
								children: renderSlot("plugins.tab", {
									install: props.installFrom,
									openPackage: (name) => {
										setTab(INSTALLED_TAB);
										setView({
											kind: "package",
											name,
											returnTab: tab
										});
									}
								}, { only: tab })
							}) : null,
							installedCards && !loaded ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: [state.status === "loading" ? (0, react_jsx_runtime.jsx)(ListSkeleton, { label: t("loading") }) : null, state.status === "unavailable" ? (0, react_jsx_runtime.jsxs)("p", {
									className: `${PluginManagerPage_module_css_default.status} ${PluginManagerPage_module_css_default.statusWithDot}`,
									role: "status",
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "idle" }), t("unavailable")]
								}) : null]
							}) : null,
							state.notice === null || noticeLine === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Toast, {
								text: noticeLine,
								icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {}),
								holdMs: toastHoldMs(noticeLine),
								onDone: props.dismissNotice
							}, state.notice.seq),
							!showsCards && state.status === "error" && !refreshing ? (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.failure,
								children: [(0, react_jsx_runtime.jsxs)("p", {
									className: PluginManagerPage_module_css_default.statusWithDot,
									role: "alert",
									children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t(state.refreshStatus === "failed" ? "refreshError" : "error")]
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
									variant: "outline",
									size: "sm",
									onClick: props.refresh,
									children: t("retry")
								})]
							}) : null,
							onInstalled && loaded && openPkg !== void 0 && openRow !== void 0 ? (0, react_jsx_runtime.jsx)(RowDetail, {
								pkg: openPkg,
								row: openRow,
								form: formFor(openRow.rowId),
								t,
								resolveText,
								renderSlot,
								onBack: () => {
									setView({
										kind: "package",
										name: openPkg.name,
										...pkgOrigin
									});
								}
							}) : null,
							onInstalled && loaded && openPkg !== void 0 && openRow === void 0 ? (0, react_jsx_runtime.jsx)(PackageDetail, {
								pkg: openPkg,
								t,
								resolveText,
								busy: packageBusy(openPkg),
								rowBusy: (row) => row.entryId !== void 0 && state.busy.includes(rowKey(row.entryId)),
								configured: ledger.bundles.has(openPkg.name),
								configure: configure(openPkg),
								renderSlot,
								inMore: backToMore,
								detail: (0, react_jsx_runtime.jsx)(BundleDetailSection, {
									name: openPkg.name,
									version: openPkg.version,
									fromNpm: openPkg.availability === "missing",
									language,
									details: bundleDetails,
									t,
									load: props.loadDetail,
									retry: props.retryDetail,
									image: props.detailImage
								}),
								onBack: () => {
									if (returnTab !== void 0) setTab(returnTab);
									setView({ kind: backToMore ? "more" : "list" });
								},
								onSetEnabled: (enabled) => {
									setBundleEnabled(openPkg.name, enabled);
								},
								onUninstall: () => {
									props.uninstall(openPkg.name);
								},
								onUpdate: () => {
									props.update(openPkg.name);
								},
								onSetRowEnabled: setRowEnabled,
								versions: state.versions[openPkg.name],
								onEnsureVersions: props.ensureVersions,
								onCheckVersions: () => {
									props.checkVersions(openPkg.name);
								},
								onUpdateVersion: (version) => {
									props.openUpdate(openPkg.name, version);
								}
							}) : null,
							onInstalled && loaded && openItem !== void 0 ? (0, react_jsx_runtime.jsx)(ItemDetail, {
								form: formFor(openItem.id),
								item: openItem,
								t,
								renderSlot,
								onBack: () => {
									setView({ kind: "list" });
								}
							}) : null,
							loaded && installedCards ? basicCards.length === 0 && official.length === 0 && mine.length === 0 && state.status !== "error" ? (0, react_jsx_runtime.jsx)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: (0, react_jsx_runtime.jsx)("p", {
									className: PluginManagerPage_module_css_default.empty,
									children: t("empty")
								})
							}) : (0, react_jsx_runtime.jsxs)("div", {
								className: PluginManagerPage_module_css_default.installedPanel,
								...installedPanel,
								children: [showsMoreList ? (0, react_jsx_runtime.jsx)("section", {
									className: PluginManagerPage_module_css_default.group,
									"data-plugin-scope": "global",
									"data-plugin-group": "more",
									children: (0, react_jsx_runtime.jsx)("ul", {
										className: PluginManagerPage_module_css_default.cards,
										children: more.map(packageCard)
									})
								}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
									renderGroup("basic", t("basicTitle"), basicCards),
									renderGroup("extensions", t("extensionsTitle"), extensions.map(packageCard)),
									renderGroup("bundles", t("bundlesTitle"), mine.map(packageCard))
								] }), state.status === "error" && !refreshing ? (0, react_jsx_runtime.jsxs)("div", {
									className: PluginManagerPage_module_css_default.failure,
									children: [(0, react_jsx_runtime.jsxs)("p", {
										className: PluginManagerPage_module_css_default.statusWithDot,
										role: "alert",
										children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t(state.refreshStatus === "failed" ? "refreshError" : "error")]
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "outline",
										size: "sm",
										onClick: props.refresh,
										children: t("retry")
									})]
								}) : null]
							}) : null,
							onInstalled && activated !== void 0 && !state.install.open ? renderSlot("plugins.bundle.activation", {
								packageName: activated.name,
								onDismiss: () => {
									setActivation(null);
								},
								onOpenDetails: () => {
									setActivation(null);
									setView({
										kind: "package",
										name: activated.name,
										...showsMoreList ? { from: "more" } : {}
									});
								}
							}, { entryKey: activated.name }) : null
						]
					}),
					state.update === null ? null : (0, react_jsx_runtime.jsx)(UpdateDialog, {
						update: state.update,
						title: updatePkg === void 0 ? state.update.packageName : packageText(updatePkg, resolveText).title,
						t,
						onRun: props.runUpdate,
						onClose: props.closeUpdate,
						onToggleOutput: props.toggleUpdateOutput
					}),
					(0, react_jsx_runtime.jsx)(InstallDialog, {
						install: state.install,
						t,
						onClose: props.closeInstall,
						onEditSpec: props.editInstallSpec,
						onRun: props.runInstall,
						onCancel: props.cancelInstall,
						onReconcile: props.reconcileInstall,
						onToggleDetails: props.toggleInstallDetails,
						onEnableNow: () => {
							setActivation(state.install.installed);
							props.enableInstalled();
						},
						onApproveBuilds: props.approveBuildsAndRetry,
						onToggleRegistry: props.toggleRegistryOptions,
						onChooseRegistry: props.chooseRegistry,
						onChangeRegistry: props.changeRegistry,
						onUseGithubMirror: props.useGithubMirror
					}),
					state.confirm === null ? null : (0, react_jsx_runtime.jsx)(ConfirmDialog, {
						name: packageText(state.packages.find((pkg) => pkg.name === state.confirm?.packageName) ?? { name: state.confirm.packageName }, resolveText).title,
						t,
						onConfirm: props.confirm,
						onCancel: props.cancelConfirm
					})
				]
			});
		}
