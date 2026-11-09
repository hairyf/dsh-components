// Extracted from @deepseek-ai/dsh-client-ui-plugin-market (lib/client.js); region lib/types/client/presentation.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** The query a newly selected index starts with. */
		const INITIAL_QUERY = {
			text: "",
			category: null,
			labels: [],
			sort: { kind: "index" }
		};
		/**
		* Replace the query text. Index order becomes relevance order when blank text gains words, and returns when the text
		* becomes blank; an order chosen while text is present stays.
		* @param query - the current query.
		* @param text - the new text.
		* @returns the query with the text and its order.
		*/
		function withText(query, text) {
			const [was, blank] = [query.text.trim() === "", text.trim() === ""];
			const sort = was && !blank && query.sort.kind === "index" ? { kind: "relevance" } : blank && query.sort.kind === "relevance" ? { kind: "index" } : query.sort;
			return {
				...query,
				text,
				sort
			};
		}
		/**
		* Drop filters and the sort key the index no longer declares, so every active choice stays visible in the toolbar.
		* @param query - the current query.
		* @param metadata - the declarations of the index that answered it.
		* @returns the query itself when every id is declared, otherwise a reduced copy.
		*/
		function declaredQuery(query, metadata) {
			const category = query.category !== null && !Object.hasOwn(metadata.categories, query.category) ? null : query.category;
			const labels = query.labels.filter((label) => Object.hasOwn(metadata.labels, label));
			const sort = query.sort.kind === "key" && !Object.hasOwn(metadata.sortKeys, query.sort.id) ? { kind: "index" } : query.sort;
			return category === query.category && labels.length === query.labels.length && sort === query.sort ? query : {
				...query,
				category,
				labels,
				sort
			};
		}
		/**
		* Order declarations by their localized title, then by id code points.
		* @param declarations - id → declaration with a `title`.
		* @param resolveText - current-language text resolution.
		* @param language - current UI language for collation.
		* @returns declarations in display order.
		*/
		function displayDeclarations(declarations, resolveText, language) {
			const collator = new Intl.Collator(language);
			return Object.entries(declarations).map(([id, declaration]) => ({
				id,
				title: resolveText(declaration.title),
				declaration
			})).sort((a, b) => collator.compare(a.title, b.title) || (a.id < b.id ? -1 : 1));
		}
		/**
		* The version an entry presents and installs by default: its default version, or its highest version when none is compatible.
		* @param entry - the market entry.
		* @returns the presented version.
		*/
		function presentedVersion(entry) {
			return entry.versions.find((version) => version.version === entry.defaultVersion) ?? entry.versions[0];
		}
		/**
		* List where a version installs from, so users can check its origin before installing.
		* @param name - the entry's package name.
		* @param version - the version to install.
		* @returns the npm package and registry, or the repository, full commit, and package directory.
		*/
		function sourceFacts(name, version) {
			const { source } = version;
			if (source.type === "npm") return [{
				kind: "package",
				value: `${name}@${version.version}`
			}, ...source.registry === void 0 ? [] : [{
				kind: "registry",
				value: source.registry
			}]];
			return [
				{
					kind: "repository",
					value: source.url
				},
				{
					kind: "commit",
					value: source.commit
				},
				...source.path === void 0 ? [] : [{
					kind: "directory",
					value: source.path
				}]
			];
		}
		/**
		* Name an index source: its market title once read, otherwise its host.
		* @param index - the configured source.
		* @param resolveText - current-language text resolution.
		* @returns the display name; a URL the browser cannot parse is shown as written.
		*/
		function indexLabel(index, resolveText) {
			if (index.title !== void 0) return resolveText(index.title);
			return URL.canParse(index.url) ? new URL(index.url).host : index.url;
		}
		/**
		* The identity of a detail read.
		* @param request - the plugin.
		* @param language - the display language.
		* @returns the key of the read in {@link DetailsState}.
		*/
		function detailKey(request, language) {
			return JSON.stringify([language, request]);
		}
		/** Largest page the Host returns, the `limit` bound of `pluginMarket.search`. */
		const MAX_PAGE = 100;
		const INITIAL = {
			status: "idle",
			indexes: [],
			selected: null,
			listing: null,
			editing: false,
			draft: "",
			saving: false,
			sourceFailure: null
		};
		function sourceFailure(failure) {
			if (failure.code === "plugin-market/invalid-index-url") return { kind: failure.details.reason === "duplicate" ? "duplicate" : "invalid" };
			if (failure.code === "plugin-market/settings-unavailable") return { kind: "unavailable" };
			return {
				kind: "other",
				reason: failure.message
			};
		}
		function detailFailure(failure) {
			return failure.code === "plugin-market/detail-unavailable" ? failure.details.reason : "other";
		}
		/** The Host route of images beside detail documents, relative to the application base. */
		const DETAIL_FILE_ROUTE = "api/plugin-market/detail-file";
		function listingFailure(failure) {
			return failure.code === "plugin-market/invalid-index" ? "invalid" : "fetch";
		}
		/** Owns Discover reads and source edits for one Client. */
		var DiscoverController = class {
			ctx;
			base;
			/** Shared Discover state published to the tab. */
			store = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(INITIAL);
			/** Detail reads published to detail sections. */
			details = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)({});
			disposed = false;
			/** The latest detail read of each key; an older read's answer is dropped. */
			detailReads = /* @__PURE__ */ new Map();
			/** Numbers detail reads across the controller's lifetime, so a read started before a reset never matches one after it. */
			detailSequence = 0;
			indexRead = 0;
			listingRead = 0;
			/** Select the last source once the list it was added to arrives. */
			selectAdded = false;
			/** Runs the listing read that failed last. */
			failed = () => {};
			/**
			* @param ctx - the plugin context whose `remote.pluginMarket` namespace answers.
			* @param base - the application base URL that Host routes resolve against.
			*/
			constructor(ctx, base) {
				this.ctx = ctx;
				this.base = base;
			}
			/** Stop publishing late settlements. */
			dispose() {
				this.disposed = true;
			}
			/**
			* Build the tab's injected face.
			* @param resolveText - current-language text resolution from the locale service.
			* @returns the tab's injected state sources and actions.
			*/
			face(resolveText) {
				const detail = this.detailFace();
				return {
					...detail,
					hooks: {
						...detail.hooks,
						discover: this.store
					},
					resolveText,
					ensure: () => {
						if (this.state().status === "idle") this.loadIndexes();
					},
					reload: () => {
						this.loadIndexes();
					},
					select: (url) => {
						if (this.state().selected === url) return;
						this.patch({ selected: url });
						this.load(url, INITIAL_QUERY, 50, false);
					},
					search: (query) => {
						const listing = this.state().listing;
						if (listing !== null) this.load(listing.url, query, 50, false);
					},
					more: () => {
						this.loadMore();
					},
					retry: () => {
						this.failed();
					},
					refresh: () => {
						const listing = this.state().listing;
						if (listing !== null) this.load(listing.url, listing.query, 50, true);
					},
					toggleSources: () => {
						this.patch({
							editing: !this.state().editing,
							sourceFailure: null
						});
					},
					editDraft: (text) => {
						this.patch({
							draft: text,
							sourceFailure: null
						});
					},
					addSource: () => {
						const draft = this.state().draft.trim();
						if (draft === "") return;
						this.selectAdded = true;
						this.saveSources([...this.state().indexes.map((index) => index.url), draft], true);
					},
					removeSource: (url) => {
						this.saveSources(this.state().indexes.map((index) => index.url).filter((item) => item !== url), false);
					}
				};
			}
			/** Detail reads and image addressing of the entry detail section. */
			detailFace() {
				return {
					hooks: {
						details: this.details,
						locale: this.ctx.locale
					},
					loadDetail: (request, language) => {
						if (this.details.getSnapshot()[detailKey(request, language)] === void 0) this.readDetail(request, language);
					},
					retryDetail: (request, language) => {
						this.readDetail(request, language, true);
					},
					detailImage: (document, destination) => {
						if (/^(?:[a-z][a-z\d+.-]*:|\/\/|#)/iu.test(destination)) return void 0;
						return new URL(`${DETAIL_FILE_ROUTE}?document=${encodeURIComponent(document)}&path=${encodeURIComponent(destination)}`, this.base()).href;
					}
				};
			}
			/**
			* Forget every detail read after the connection reset: a restarted Host no longer knows the document ids that address
			* their images, and each shown section reads its document again.
			*/
			detailsReset() {
				this.detailReads.clear();
				this.details.set({});
			}
			/** Re-read the sources after the Host announced a change or the connection reset; an unrendered tab stays idle. */
			sourcesChanged() {
				if (this.state().status !== "idle") this.loadIndexes();
			}
			/** Recompute installation status of every loaded plugin after the profile's bundles changed; the Host reuses its cached document. */
			bundlesChanged() {
				const { listing } = this.state();
				if (listing?.status === "ready") this.load(listing.url, listing.query, Math.max(listing.value.entries.length, 50), false);
			}
			async readDetail(request, language, refresh = false) {
				const key = detailKey(request, language);
				const read = ++this.detailSequence;
				this.detailReads.set(key, read);
				this.publishDetail(key, { status: "loading" });
				const { remote } = this.ctx;
				const current = () => !this.disposed && this.detailReads.get(key) === read;
				let npmFileSources = [];
				if (request.npm) {
					const fastest = await remote.pluginRegistryProbe.fastest();
					if (!current()) return;
					if (fastest.ok && fastest.value === "https://registry.npmmirror.com/") npmFileSources = ["npmmirror"];
				}
				const { url, name, version } = request;
				const answer = await remote.pluginMarket.readEntryDetail(url, name, version, language, {
					refresh,
					npmFileSources
				});
				if (current()) this.publishDetail(key, answer.ok ? {
					status: "ready",
					detail: answer.value
				} : {
					status: "error",
					failure: detailFailure(answer.error)
				});
			}
			publishDetail(key, state) {
				this.details.set({
					...this.details.getSnapshot(),
					[key]: state
				});
			}
			state() {
				return this.store.getSnapshot();
			}
			patch(next) {
				this.store.set({
					...this.state(),
					...next
				});
			}
			async loadIndexes() {
				const read = ++this.indexRead;
				if (this.state().status === "idle") this.patch({ status: "loading" });
				const answer = await this.ctx.remote.pluginMarket.listIndexes();
				if (this.disposed || read !== this.indexRead) return;
				if (!answer.ok) {
					this.patch({ status: "error" });
					return;
				}
				const indexes = answer.value;
				const previous = this.state().selected;
				const last = indexes.at(-1);
				const selected = this.selectAdded && last !== void 0 ? last.url : indexes.some((index) => index.url === previous) ? previous : indexes[0]?.url ?? null;
				this.selectAdded = false;
				this.patch({
					status: "ready",
					indexes,
					selected,
					...indexes.length === 0 ? { editing: false } : {}
				});
				if (selected === null) this.patch({ listing: null });
				else if (selected !== this.state().listing?.url) this.load(selected, INITIAL_QUERY, 50, false);
			}
			/**
			* Load the first `count` results of a query in pages the Host accepts, replacing the shown results at once. Later
			* pages pin the first page's document; when the Host answers from a replaced document the read restarts once, and
			* fails if the document is replaced again. The index's undeclared ids leave the query.
			*/
			async load(url, query, count, refresh) {
				const read = ++this.listingRead;
				const current = this.state().listing;
				const [kept, answered] = current?.url === url ? [current.value, current.answered] : [null, null];
				this.patch({ listing: {
					url,
					query,
					status: "loading",
					value: kept,
					answered,
					failure: null
				} });
				const fail = (failure) => {
					this.failed = () => {
						this.load(url, query, count, refresh);
					};
					return {
						url,
						query,
						status: "error",
						value: kept,
						answered,
						failure
					};
				};
				let value = null;
				let restarted = false;
				while (value === null || value.entries.length < count && value.nextOffset !== null) {
					const offset = value?.entries.length ?? 0;
					const limit = Math.min(count - offset, MAX_PAGE);
					const answer = await this.page(url, query, offset, limit, value?.fetchedAt, refresh && value === null && !restarted);
					if (this.disposed || read !== this.listingRead) return;
					if (!answer.ok) {
						this.settle(url, fail(listingFailure(answer.error)), answer);
						return;
					}
					if (value === null || answer.value.fetchedAt === value.fetchedAt) value = value === null ? answer.value : {
						...answer.value,
						entries: [...value.entries, ...answer.value.entries]
					};
					else if (restarted) {
						this.patch({ listing: fail("changed") });
						return;
					} else {
						restarted = true;
						value = null;
					}
				}
				const declared = declaredQuery(query, value.metadata);
				if (declared !== query) {
					this.load(url, declared, count, false);
					return;
				}
				this.settle(url, {
					url,
					query,
					status: "ready",
					value,
					answered: query,
					failure: null
				}, {
					ok: true,
					value
				});
			}
			/** Load the page after the shown results; a replaced document reloads them from the first page. */
			async loadMore() {
				const listing = this.state().listing;
				if (listing === null || listing.status !== "ready" && listing.status !== "error" || listing.answered !== listing.query) return;
				if (listing.value?.nextOffset == null) return;
				const { url, query, value } = listing;
				const read = ++this.listingRead;
				this.patch({ listing: {
					...listing,
					status: "more",
					failure: null
				} });
				const answer = await this.page(url, query, value.entries.length, 50, value.fetchedAt, false);
				if (this.disposed || read !== this.listingRead) return;
				if (!answer.ok) {
					this.failed = () => {
						this.loadMore();
					};
					this.settle(url, {
						...listing,
						status: "error",
						failure: listingFailure(answer.error)
					}, answer);
					return;
				}
				if (answer.value.fetchedAt !== value.fetchedAt) {
					this.load(url, query, value.entries.length + 50, false);
					return;
				}
				const next = {
					...answer.value,
					entries: [...value.entries, ...answer.value.entries]
				};
				this.settle(url, {
					...listing,
					status: "ready",
					value: next,
					failure: null
				}, {
					ok: true,
					value: next
				});
			}
			page(url, query, offset, limit, fetchedAt, refresh) {
				return this.ctx.remote.pluginMarket.search(url, {
					...query.text.trim() === "" ? {} : { text: query.text },
					...query.category === null ? {} : { category: query.category },
					...query.labels.length === 0 ? {} : { labels: query.labels },
					sort: query.sort,
					offset,
					limit,
					...fetchedAt === void 0 ? {} : { fetchedAt },
					...refresh ? { refresh: true } : {}
				});
			}
			/** Publish a settled read and the index title or error it taught about its source. */
			settle(url, listing, answer) {
				const indexes = this.state().indexes.map((index) => {
					if (index.url !== url) return index;
					if (!answer.ok) return {
						...index,
						error: answer.error.message
					};
					const { title, description } = answer.value;
					return {
						url,
						title,
						...description === void 0 ? {} : { description }
					};
				});
				this.patch({
					listing,
					indexes
				});
			}
			async saveSources(urls, adding) {
				this.patch({
					saving: true,
					sourceFailure: null
				});
				const answer = await this.ctx.remote.pluginMarket.setIndexes(urls);
				if (this.disposed) return;
				if (!answer.ok) {
					this.selectAdded = false;
					this.patch({
						saving: false,
						sourceFailure: sourceFailure(answer.error)
					});
					return;
				}
				this.patch({
					saving: false,
					...adding ? { draft: "" } : {}
				});
				await this.loadIndexes();
			}
		};
