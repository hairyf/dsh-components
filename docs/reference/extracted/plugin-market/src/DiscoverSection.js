// Extracted from @deepseek-ai/dsh-client-ui-plugin-market (lib/client.js); region lib/types/client/DiscoverSection.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Discover: search one plugin market index, read an entry's page, and install a version. */
		/** Typing pause before the query text is sent. */
		const TEXT_DELAY_MS = 250;
		/** Artwork size inside the 48px icon frame, as on the Installed tab. */
		const ICON = 36;
		const FAILURE_KEYS = {
			fetch: "readFailed",
			invalid: "readInvalid",
			changed: "readChanged"
		};
		const FACT_KEYS = {
			package: "factPackage",
			registry: "factRegistry",
			repository: "factRepository",
			commit: "factCommit",
			directory: "factDirectory"
		};
		function MarketIcon({ src, size }) {
			const [failed, setFailed] = (0, react.useState)();
			return src === void 0 || src === failed ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size }) : (0, react_jsx_runtime.jsx)("img", {
				className: DiscoverSection_module_css_default.image,
				src,
				width: size,
				height: size,
				alt: "",
				loading: "lazy",
				referrerPolicy: "no-referrer",
				onError: () => {
					setFailed(src);
				}
			});
		}
		function sourceFailureText(failure, t) {
			switch (failure.kind) {
				case "invalid": return t("sourceInvalid");
				case "duplicate": return t("sourceDuplicate");
				case "unavailable": return t("sourceUnavailable");
				case "other": return t("sourceFailed");
			}
		}
		function entryTitle(entry, face) {
			return entry.title === void 0 ? entry.name : face.resolveText(entry.title);
		}
		/** Whether installation accepts a version: compatible, or covered by an exemption. */
		function installable(compatibility) {
			return compatibility.compatible || compatibility.exempted;
		}
		function formatDate(timestamp, language, style) {
			return new Intl.DateTimeFormat(language, { dateStyle: style }).format(/* @__PURE__ */ new Date(timestamp * 1e3));
		}
		/** The one action an entry offers in its current state; Install chooses its default version. */
		function EntryAction({ entry, title, t, onInstall, onOpenInstalled }) {
			const { status } = entry.installation;
			if (status !== "not-installed") return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "ghost",
				size: "sm",
				"aria-label": t("openInstalled", { name: title }),
				onClick: onOpenInstalled,
				children: t(status === "update-available" ? "statusUpdate" : status === "provided" ? "statusProvided" : "statusInstalled")
			});
			const version = presentedVersion(entry);
			if (!version.compatibility.compatible && !version.compatibility.exempted) return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
				label: t("noCompatibleVersion", { runtime: version.compatibility.runtimeVersion }),
				side: "bottom",
				portal: true,
				delayMs: 300,
				children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					className: DiscoverSection_module_css_default.blocked,
					"aria-disabled": "true",
					"aria-label": t("installTitle", { name: title }),
					children: t("install")
				})
			});
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
				variant: "outline",
				size: "sm",
				"aria-label": t("installTitle", { name: title }),
				onClick: () => {
					onInstall(version);
				},
				children: t("install")
			});
		}
		function EntryCard({ entry, t, face, language, labels, onOpen, onInstall, onOpenInstalled }) {
			const title = entryTitle(entry, face);
			const version = presentedVersion(entry);
			const date = formatDate(version.publishTimestamp, language, "medium");
			return (0, react_jsx_runtime.jsxs)("li", {
				className: DiscoverSection_module_css_default.card,
				"data-market-entry": entry.name,
				children: [
					(0, react_jsx_runtime.jsx)("span", {
						className: DiscoverSection_module_css_default.icon,
						"aria-hidden": "true",
						children: (0, react_jsx_runtime.jsx)(MarketIcon, {
							src: entry.icon,
							size: ICON
						})
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: DiscoverSection_module_css_default.main,
						children: [
							(0, react_jsx_runtime.jsxs)("div", {
								className: DiscoverSection_module_css_default.titleRow,
								children: [(0, react_jsx_runtime.jsx)("button", {
									type: "button",
									className: DiscoverSection_module_css_default.cardOpen,
									"aria-label": t("openEntry", { name: title }),
									onClick: onOpen,
									children: title
								}), labels.filter((label) => entry.metadata.labels.includes(label.id)).map((label) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, { children: label.title }, label.id))]
							}),
							entry.description === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
								className: DiscoverSection_module_css_default.description,
								children: face.resolveText(entry.description)
							}),
							(0, react_jsx_runtime.jsx)("span", {
								className: DiscoverSection_module_css_default.meta,
								children: entry.author === void 0 ? t("entryMeta", {
									version: version.version,
									date
								}) : t("entryMetaAuthor", {
									version: version.version,
									author: entry.author,
									date
								})
							})
						]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DiscoverSection_module_css_default.cardEnd,
						children: (0, react_jsx_runtime.jsx)(EntryAction, {
							entry,
							title,
							t,
							onInstall,
							onOpenInstalled
						})
					})
				]
			});
		}
		/** One row of the version list: its state tags and an Install button when installation accepts it. */
		function VersionRow({ entry, version, title, t, language, onInstall }) {
			const current = entry.installation.installedVersion === version.version;
			const offered = !current && entry.installation.status !== "provided" && installable(version.compatibility);
			const { compatibility } = version;
			return (0, react_jsx_runtime.jsxs)("li", {
				className: DiscoverSection_module_css_default.versionRow,
				"data-market-version": version.version,
				children: [(0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.main,
					children: [(0, react_jsx_runtime.jsxs)("div", {
						className: DiscoverSection_module_css_default.titleRow,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: DiscoverSection_module_css_default.strong,
								children: version.version
							}),
							version.version === entry.defaultVersion ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								tone: "info",
								children: t("versionDefault")
							}) : null,
							version.version.split("+")[0]?.includes("-") === true ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								tone: "neutral",
								children: t("versionPrerelease")
							}) : null,
							current ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								tone: "success",
								children: t("versionInstalled")
							}) : null,
							compatibility.compatible ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
								tone: "warning",
								children: t(compatibility.exempted ? "versionExempted" : "versionIncompatible")
							})
						]
					}), (0, react_jsx_runtime.jsx)("span", {
						className: DiscoverSection_module_css_default.meta,
						children: compatibility.compatible ? formatDate(version.publishTimestamp, language, "medium") : compatibility.exempted ? t("exempted") : t("incompatible", {
							runtime: compatibility.runtimeVersion,
							range: Object.values(compatibility.requirements).join(" ")
						})
					})]
				}), !offered ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "ghost",
					size: "sm",
					"aria-label": t("installVersionTitle", {
						name: title,
						version: version.version
					}),
					onClick: () => {
						onInstall(version);
					},
					children: t("install")
				})]
			});
		}
		function EntryDetail({ entry, listing, t, face, hooks, language, onBack, onInstall, onOpenInstalled }) {
			const title = entryTitle(entry, face);
			const version = presentedVersion(entry);
			const date = formatDate(version.publishTimestamp, language, "long");
			const categoryId = entry.metadata.category;
			const category = categoryId === void 0 ? void 0 : listing.metadata.categories[categoryId];
			const labels = displayDeclarations(listing.metadata.labels, face.resolveText, language).filter((label) => entry.metadata.labels.includes(label.id));
			const { compatibility } = version;
			return (0, react_jsx_runtime.jsxs)("div", {
				className: DiscoverSection_module_css_default.detail,
				"data-market-detail": entry.name,
				children: [
					(0, react_jsx_runtime.jsxs)("button", {
						type: "button",
						className: DiscoverSection_module_css_default.crumb,
						onClick: onBack,
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
							className: DiscoverSection_module_css_default.crumbIcon,
							"aria-hidden": "true"
						}), (0, react_jsx_runtime.jsx)("span", { children: t("backToList") })]
					}),
					(0, react_jsx_runtime.jsxs)("div", {
						className: DiscoverSection_module_css_default.detailHead,
						children: [
							(0, react_jsx_runtime.jsx)("span", {
								className: DiscoverSection_module_css_default.icon,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(MarketIcon, {
									src: entry.icon,
									size: ICON
								})
							}),
							(0, react_jsx_runtime.jsxs)("div", {
								className: DiscoverSection_module_css_default.main,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: DiscoverSection_module_css_default.titleRow,
									children: [(0, react_jsx_runtime.jsx)("h3", {
										className: DiscoverSection_module_css_default.detailTitle,
										children: title
									}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, {
										tone: "neutral",
										children: version.version
									})]
								}), title === entry.name ? null : (0, react_jsx_runtime.jsx)("span", {
									className: DiscoverSection_module_css_default.meta,
									children: entry.name
								})]
							}),
							(0, react_jsx_runtime.jsx)(EntryAction, {
								entry,
								title,
								t,
								onInstall,
								onOpenInstalled
							})
						]
					}),
					entry.description === void 0 ? null : (0, react_jsx_runtime.jsx)("p", {
						className: DiscoverSection_module_css_default.detailDescription,
						children: face.resolveText(entry.description)
					}),
					compatibility.compatible ? null : (0, react_jsx_runtime.jsxs)("p", {
						className: DiscoverSection_module_css_default.notice,
						role: "note",
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
							size: 14,
							"aria-hidden": "true"
						}), (0, react_jsx_runtime.jsx)("span", { children: compatibility.exempted ? t("exempted") : t("incompatible", {
							runtime: compatibility.runtimeVersion,
							range: Object.values(compatibility.requirements).join(" ")
						}) })]
					}),
					(0, react_jsx_runtime.jsx)("div", {
						className: DiscoverSection_module_css_default.detailDocument,
						children: (0, react_jsx_runtime.jsx)(PluginDetailSection, {
							request: {
								url: listing.url,
								name: entry.name,
								version: version.version,
								npm: version.source.type === "npm"
							},
							t,
							loadDetail: face.loadDetail,
							retryDetail: face.retryDetail,
							detailImage: face.detailImage,
							useDetails: hooks.useDetails,
							useLocale: hooks.useLocale
						})
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: DiscoverSection_module_css_default.detailSection,
						children: [(0, react_jsx_runtime.jsx)("h4", {
							className: DiscoverSection_module_css_default.sectionTitle,
							children: t("versionsTitle")
						}), (0, react_jsx_runtime.jsx)("ul", {
							className: DiscoverSection_module_css_default.versions,
							"aria-label": t("versionsLabel", { name: title }),
							children: entry.versions.map((item) => (0, react_jsx_runtime.jsx)(VersionRow, {
								entry,
								version: item,
								title,
								t,
								language,
								onInstall
							}, item.version))
						})]
					}),
					(0, react_jsx_runtime.jsxs)("section", {
						className: DiscoverSection_module_css_default.detailSection,
						children: [(0, react_jsx_runtime.jsx)("h4", {
							className: DiscoverSection_module_css_default.sectionTitle,
							children: t("factSource")
						}), (0, react_jsx_runtime.jsxs)("dl", {
							className: DiscoverSection_module_css_default.facts,
							children: [
								entry.author === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factAuthor") }), (0, react_jsx_runtime.jsx)("dd", { children: entry.author })] }),
								entry.homepage === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factHomepage") }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("a", {
									className: DiscoverSection_module_css_default.link,
									href: entry.homepage,
									target: "_blank",
									rel: "noopener noreferrer",
									children: entry.homepage
								}) })] }),
								entry.repository === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factSourceCode") }), (0, react_jsx_runtime.jsxs)("dd", { children: [(0, react_jsx_runtime.jsx)("a", {
									className: DiscoverSection_module_css_default.link,
									href: entry.repository.url,
									target: "_blank",
									rel: "noopener noreferrer",
									children: entry.repository.url
								}), entry.repository.directory === void 0 ? null : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [" ", (0, react_jsx_runtime.jsx)("code", { children: entry.repository.directory })] })] })] }),
								sourceFacts(entry.name, version).map((fact) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t(FACT_KEYS[fact.kind]) }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("code", { children: fact.value }) })] }, fact.kind)),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factPublished") }), (0, react_jsx_runtime.jsx)("dd", { children: date })] }),
								category === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factCategory") }), (0, react_jsx_runtime.jsx)("dd", { children: face.resolveText(category.title) })] }),
								labels.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factLabels") }), (0, react_jsx_runtime.jsx)("dd", {
									className: DiscoverSection_module_css_default.tags,
									children: labels.map((label) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tag, { children: label.title }, label.id))
								})] }),
								(0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factMarket") }), (0, react_jsx_runtime.jsx)("dd", { children: face.resolveText(listing.title) })] })
							]
						})]
					})
				]
			});
		}
		function SourcesDialog({ state, t, face }) {
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: state.editing,
				onClose: face.toggleSources,
				title: t("sourcesTitle"),
				closeLabel: t("close"),
				description: t("sourcesDescription"),
				className: DiscoverSection_module_css_default.dialog,
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.dialogBody,
					children: [
						state.indexes.length === 0 ? null : (0, react_jsx_runtime.jsx)("ul", {
							className: DiscoverSection_module_css_default.sourceList,
							"aria-label": t("sourcesLabel"),
							children: state.indexes.map((index) => (0, react_jsx_runtime.jsxs)("li", {
								className: DiscoverSection_module_css_default.sourceRow,
								children: [(0, react_jsx_runtime.jsxs)("div", {
									className: DiscoverSection_module_css_default.main,
									children: [
										(0, react_jsx_runtime.jsx)("span", {
											className: DiscoverSection_module_css_default.strong,
											children: indexLabel(index, face.resolveText)
										}),
										(0, react_jsx_runtime.jsx)("span", {
											className: DiscoverSection_module_css_default.meta,
											children: index.url
										}),
										index.error === void 0 ? null : (0, react_jsx_runtime.jsx)("span", {
											className: DiscoverSection_module_css_default.sourceError,
											children: index.error
										})
									]
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
									label: t("removeSource"),
									side: "bottom",
									portal: true,
									delayMs: 300,
									children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
										variant: "ghost",
										size: "sm",
										icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconTrashOutlineRegular, { size: 13 }),
										"aria-label": t("removeSourceNamed", { url: index.url }),
										disabled: state.saving,
										onClick: () => {
											face.removeSource(index.url);
										}
									})
								})]
							}, index.url))
						}),
						(0, react_jsx_runtime.jsxs)("form", {
							className: DiscoverSection_module_css_default.sourceForm,
							onSubmit: (event) => {
								event.preventDefault();
								face.addSource();
							},
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
								className: DiscoverSection_module_css_default.grow,
								value: state.draft,
								placeholder: t("sourcePlaceholder"),
								"aria-label": t("sourceUrl"),
								"aria-invalid": state.sourceFailure !== null,
								"data-modal-autofocus": true,
								onChange: (event) => {
									face.editDraft(event.target.value);
								}
							}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								type: "submit",
								variant: "primary",
								size: "sm",
								icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
								disabled: state.saving || state.draft.trim() === "",
								children: t("addSource")
							})]
						}),
						state.sourceFailure === null ? null : (0, react_jsx_runtime.jsx)("p", {
							className: DiscoverSection_module_css_default.error,
							role: "alert",
							children: sourceFailureText(state.sourceFailure, t)
						}),
						(0, react_jsx_runtime.jsxs)("p", {
							className: DiscoverSection_module_css_default.notice,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsx)("span", { children: t("sourcesTrust") })]
						})
					]
				})
			});
		}
		function ConfirmDialog({ choice, t, face, onCancel, onConfirm }) {
			if (choice === null) return null;
			const { entry, version } = choice;
			const title = entryTitle(entry, face);
			return (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Modal, {
				open: true,
				onClose: onCancel,
				title: t("confirmTitle", { name: title }),
				closeLabel: t("close"),
				className: DiscoverSection_module_css_default.dialog,
				footer: (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					onClick: onCancel,
					children: t("cancel")
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "primary",
					autoFocus: true,
					onClick: () => {
						onConfirm(choice);
					},
					children: t("install")
				})] }),
				children: (0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.dialogBody,
					children: [
						(0, react_jsx_runtime.jsxs)("div", {
							className: DiscoverSection_module_css_default.confirmHead,
							children: [(0, react_jsx_runtime.jsx)("span", {
								className: DiscoverSection_module_css_default.icon,
								"aria-hidden": "true",
								children: (0, react_jsx_runtime.jsx)(MarketIcon, {
									src: entry.icon,
									size: ICON
								})
							}), (0, react_jsx_runtime.jsxs)("div", {
								className: DiscoverSection_module_css_default.main,
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: DiscoverSection_module_css_default.strong,
									children: title
								}), (0, react_jsx_runtime.jsx)("span", {
									className: DiscoverSection_module_css_default.meta,
									children: version.version
								})]
							})]
						}),
						(0, react_jsx_runtime.jsxs)("dl", {
							className: DiscoverSection_module_css_default.facts,
							children: [entry.author === void 0 ? null : (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t("factAuthor") }), (0, react_jsx_runtime.jsx)("dd", { children: entry.author })] }), sourceFacts(entry.name, version).map((fact) => (0, react_jsx_runtime.jsxs)("div", { children: [(0, react_jsx_runtime.jsx)("dt", { children: t(FACT_KEYS[fact.kind]) }), (0, react_jsx_runtime.jsx)("dd", { children: (0, react_jsx_runtime.jsx)("code", { children: fact.value }) })] }, fact.kind))]
						}),
						version.compatibility.compatible ? null : (0, react_jsx_runtime.jsxs)("p", {
							className: DiscoverSection_module_css_default.notice,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsx)("span", { children: t("exempted") })]
						}),
						(0, react_jsx_runtime.jsxs)("p", {
							className: DiscoverSection_module_css_default.notice,
							role: "note",
							children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconWarningOutlineRegular, {
								size: 14,
								"aria-hidden": "true"
							}), (0, react_jsx_runtime.jsx)("span", { children: t("installTrust") })]
						})
					]
				})
			});
		}
		function ListSkeleton({ label }) {
			return (0, react_jsx_runtime.jsx)("ul", {
				className: DiscoverSection_module_css_default.cards,
				role: "status",
				"aria-label": label,
				"aria-busy": "true",
				children: [
					0,
					1,
					2,
					3
				].map((index) => (0, react_jsx_runtime.jsxs)("li", {
					className: DiscoverSection_module_css_default.card,
					"aria-hidden": "true",
					children: [(0, react_jsx_runtime.jsx)("span", { className: `${DiscoverSection_module_css_default.icon} ${DiscoverSection_module_css_default.skeletonFill}` }), (0, react_jsx_runtime.jsxs)("div", {
						className: DiscoverSection_module_css_default.main,
						children: [(0, react_jsx_runtime.jsx)("span", { className: `${DiscoverSection_module_css_default.skeletonBar} ${DiscoverSection_module_css_default.skeletonTitle} ${DiscoverSection_module_css_default.skeletonFill}` }), (0, react_jsx_runtime.jsx)("span", { className: `${DiscoverSection_module_css_default.skeletonBar} ${DiscoverSection_module_css_default.skeletonDescription} ${DiscoverSection_module_css_default.skeletonFill}` })]
					})]
				}, index))
			});
		}
		/** The sort menu id of a sort. */
		function sortMenuId(sort) {
			return sort.kind === "key" ? `key:${sort.id}` : sort.kind;
		}
		/** Whether a query selects every plugin of the index. */
		function unfiltered(query) {
			return query.text.trim() === "" && query.category === null && query.labels.length === 0;
		}
		function Browser({ state, listing, t, face, hooks, language, onInstall, openPackage }) {
			const { query, value } = listing;
			const [text, setText] = (0, react.useState)(query.text);
			const [menu, setMenu] = (0, react.useState)(null);
			const [opened, setOpened] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				if (text === query.text) return void 0;
				const timer = setTimeout(() => {
					face.search(withText(query, text));
				}, TEXT_DELAY_MS);
				return () => {
					clearTimeout(timer);
				};
			}, [
				text,
				query,
				face
			]);
			const declarations = (0, react.useMemo)(() => ({
				categories: value === null ? [] : displayDeclarations(value.metadata.categories, face.resolveText, language),
				labels: value === null ? [] : displayDeclarations(value.metadata.labels, face.resolveText, language),
				sortKeys: value === null ? [] : displayDeclarations(value.metadata.sortKeys, face.resolveText, language)
			}), [
				value,
				face,
				language
			]);
			const openEntry = opened === null ? void 0 : value?.entries.find((entry) => entry.name === opened.name) ?? opened;
			if (openEntry !== void 0 && value !== null) return (0, react_jsx_runtime.jsx)(EntryDetail, {
				entry: openEntry,
				listing: value,
				t,
				face,
				hooks,
				language,
				onBack: () => {
					setOpened(null);
				},
				onInstall: (version) => {
					onInstall({
						entry: openEntry,
						version
					});
				},
				onOpenInstalled: () => {
					openPackage(openEntry.name);
				}
			});
			const market = indexLabel(state.indexes.find((index) => index.url === listing.url) ?? { url: listing.url }, face.resolveText);
			const { sort } = query;
			const sortOptions = [
				...query.text.trim() === "" ? [] : [{
					id: "relevance",
					label: t("sortRelevance")
				}],
				{
					id: "index",
					label: t("sortDefault")
				},
				{
					id: "published",
					label: t("sortPublished")
				},
				...declarations.sortKeys.map((item) => ({
					id: `key:${item.id}`,
					label: item.title
				}))
			];
			const sortName = sortOptions.find((option) => option.id === sortMenuId(sort)).label;
			const directed = sort.kind === "published" || sort.kind === "key";
			const chooseSort = (id) => {
				setMenu(null);
				if (id === "direction" && directed) {
					face.search({
						...query,
						sort: {
							...sort,
							direction: sort.direction === "asc" ? "desc" : "asc"
						}
					});
					return;
				}
				if (id === "index" || id === "relevance") {
					face.search({
						...query,
						sort: { kind: id }
					});
					return;
				}
				if (id === "published") {
					face.search({
						...query,
						sort: {
							kind: "published",
							direction: "desc"
						}
					});
					return;
				}
				const key = declarations.sortKeys.find((item) => `key:${item.id}` === id);
				/* v8 ignore next -- every other menu id names a declared sort key */
				if (key !== void 0) face.search({
					...query,
					sort: {
						kind: "key",
						id: key.id,
						direction: key.declaration.order
					}
				});
			};
			const toggleMenu = (name) => {
				setMenu(menu === name ? null : name);
			};
			const busy = listing.status === "loading" && value !== null;
			return (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [
				(0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.toolbar,
					"data-discover-toolbar": true,
					children: [
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menu === "market",
							onClose: () => {
								setMenu(null);
							},
							portal: true,
							autoFocus: true,
							selectedId: listing.url,
							items: state.indexes.map((index) => ({
								id: index.url,
								label: indexLabel(index, face.resolveText)
							})),
							footer: [{
								id: "manage",
								label: t("manageSources"),
								icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSlidersTwoOutlineRegular, { size: 14 })
							}],
							onSelect: (id) => {
								setMenu(null);
								if (id === "manage") face.toggleSources();
								else face.select(id);
							},
							anchor: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								className: DiscoverSection_module_css_default.marketButton,
								"aria-haspopup": "menu",
								"aria-expanded": menu === "market",
								"aria-label": t("marketMenu", { market }),
								onClick: () => {
									toggleMenu("market");
								},
								children: [(0, react_jsx_runtime.jsx)("span", {
									className: DiscoverSection_module_css_default.marketName,
									children: market
								}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
									size: 12,
									"aria-hidden": "true"
								})]
							})
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Input, {
							className: DiscoverSection_module_css_default.search,
							type: "search",
							icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSearchOutlineRegular, { size: 14 }),
							value: text,
							placeholder: t("search"),
							"aria-label": t("search"),
							onChange: (event) => {
								setText(event.target.value);
							}
						}),
						declarations.labels.length === 0 ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menu === "filter",
							onClose: () => {
								setMenu(null);
							},
							portal: true,
							autoFocus: true,
							align: "end",
							selectedIds: query.labels,
							items: declarations.labels.map((item) => ({
								id: item.id,
								label: item.title
							})),
							onSelect: (id) => {
								const labels = query.labels.includes(id) ? query.labels.filter((label) => label !== id) : [...query.labels, id];
								face.search({
									...query,
									labels
								});
							},
							anchor: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								"aria-haspopup": "menu",
								"aria-expanded": menu === "filter",
								icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconSlidersTwoOutlineRegular, { size: 13 }),
								onClick: () => {
									toggleMenu("filter");
								},
								children: query.labels.length === 0 ? t("filter") : t("filterCount", { count: String(query.labels.length) })
							})
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Menu, {
							open: menu === "sort",
							onClose: () => {
								setMenu(null);
							},
							portal: true,
							autoFocus: true,
							align: "end",
							selectedId: sortMenuId(sort),
							items: sortOptions,
							...directed ? { footer: [{
								id: "direction",
								label: t(sort.direction === "asc" ? "switchToDescending" : "switchToAscending")
							}] } : {},
							onSelect: chooseSort,
							anchor: (0, react_jsx_runtime.jsxs)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								"aria-haspopup": "menu",
								"aria-expanded": menu === "sort",
								onClick: () => {
									toggleMenu("sort");
								},
								children: [t("sortBy", { sort: sortName }), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconChevronDownOutlineRegular, {
									size: 12,
									"aria-hidden": "true"
								})]
							})
						}),
						(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Tooltip, {
							label: t("refresh"),
							side: "bottom",
							portal: true,
							delayMs: 500,
							focusDelayMs: 500,
							children: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
								variant: "ghost",
								size: "sm",
								"aria-label": t("refresh"),
								disabled: listing.status === "loading",
								onClick: face.refresh,
								icon: busy ? (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "ongoing" }) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRefreshOutlineRegular, { size: 14 })
							})
						})
					]
				}),
				declarations.categories.length === 0 ? null : (0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.categories,
					role: "group",
					"aria-label": t("categoriesLabel"),
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
						active: query.category === null,
						"aria-pressed": query.category === null,
						onClick: () => {
							face.search({
								...query,
								category: null
							});
						},
						children: t("allCategories")
					}), declarations.categories.map((item) => (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Pill, {
						active: query.category === item.id,
						"aria-pressed": query.category === item.id,
						onClick: () => {
							face.search({
								...query,
								category: item.id
							});
						},
						children: item.title
					}, item.id))]
				}),
				listing.failure === null ? null : (0, react_jsx_runtime.jsxs)("div", {
					className: DiscoverSection_module_css_default.failure,
					children: [(0, react_jsx_runtime.jsxs)("p", {
						className: DiscoverSection_module_css_default.error,
						role: "alert",
						children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t(FAILURE_KEYS[listing.failure])]
					}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "outline",
						size: "sm",
						onClick: face.retry,
						children: t("retry")
					})]
				}),
				value === null ? listing.status === "loading" ? (0, react_jsx_runtime.jsx)(ListSkeleton, { label: t("loading") }) : null : value.total === 0 ? (0, react_jsx_runtime.jsx)("p", {
					className: DiscoverSection_module_css_default.muted,
					children: t(unfiltered(listing.answered) ? "emptyIndex" : "noMatches")
				}) : (0, react_jsx_runtime.jsxs)(react_jsx_runtime.Fragment, { children: [(0, react_jsx_runtime.jsx)("ul", {
					className: DiscoverSection_module_css_default.cards,
					"aria-busy": busy,
					children: value.entries.map((entry) => (0, react_jsx_runtime.jsx)(EntryCard, {
						entry,
						t,
						face,
						language,
						labels: declarations.labels,
						onOpen: () => {
							setOpened(entry);
						},
						onInstall: (version) => {
							onInstall({
								entry,
								version
							});
						},
						onOpenInstalled: () => {
							openPackage(entry.name);
						}
					}, entry.name))
				}), value.nextOffset === null ? null : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					className: DiscoverSection_module_css_default.more,
					disabled: listing.status !== "ready",
					onClick: face.more,
					children: t("showMore")
				})] })
			] });
		}
		/** Render the Discover tab of the Plugins page. */
		function DiscoverSection(props) {
			const { t, install, openPackage } = props;
			const face = props;
			const state = props.useDiscover((snapshot) => snapshot);
			const language = props.useLocale((snapshot) => snapshot.active);
			const [confirming, setConfirming] = (0, react.useState)(null);
			(0, react.useEffect)(() => {
				props.ensure();
			}, [props.ensure]);
			let body;
			if (state.status === "idle" || state.status === "loading") body = (0, react_jsx_runtime.jsx)(ListSkeleton, { label: t("loading") });
			else if (state.status === "error") body = (0, react_jsx_runtime.jsxs)("div", {
				className: DiscoverSection_module_css_default.failure,
				children: [(0, react_jsx_runtime.jsxs)("p", {
					className: DiscoverSection_module_css_default.error,
					role: "alert",
					children: [(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.StateDot, { state: "error" }), t("sourcesFailed")]
				}), (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
					variant: "outline",
					size: "sm",
					onClick: props.reload,
					children: t("retry")
				})]
			});
			else if (state.listing === null) body = (0, react_jsx_runtime.jsxs)("div", {
				className: DiscoverSection_module_css_default.empty,
				children: [
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.PluginArtworkDefault, { size: 48 }),
					(0, react_jsx_runtime.jsx)("p", {
						className: DiscoverSection_module_css_default.emptyTitle,
						children: t("emptyTitle")
					}),
					(0, react_jsx_runtime.jsx)("p", {
						className: DiscoverSection_module_css_default.muted,
						children: t("emptyDescription")
					}),
					(0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.Button, {
						variant: "primary",
						size: "sm",
						icon: (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconPlusOutlineRegular, { size: 13 }),
						onClick: props.toggleSources,
						children: t("addFirstSource")
					})
				]
			});
			else body = (0, react_jsx_runtime.jsx)(Browser, {
				state,
				listing: state.listing,
				t,
				face,
				hooks: {
					useDetails: props.useDetails,
					useLocale: props.useLocale
				},
				language,
				onInstall: (choice) => {
					setConfirming(choice);
				},
				openPackage
			}, state.listing.url);
			return (0, react_jsx_runtime.jsxs)("div", {
				className: DiscoverSection_module_css_default.section,
				"data-plugin-tab": "discover",
				children: [
					body,
					(0, react_jsx_runtime.jsx)(SourcesDialog, {
						state,
						t,
						face
					}),
					(0, react_jsx_runtime.jsx)(ConfirmDialog, {
						choice: confirming,
						t,
						face,
						onCancel: () => {
							setConfirming(null);
						},
						onConfirm: ({ entry, version }) => {
							setConfirming(null);
							install({
								...version.install,
								title: entryTitle(entry, face),
								version: version.version
							});
						}
					})
				]
			});
		}
