// Extracted from @deepseek-ai/dsh-client-ui-sidebar-documentpreview (lib/client.js); region lib/types/client/store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/**
		* A tab's state before it reads, scrolls, toggles, or answers anything.
		* @returns the empty bucket.
		*/
		function fresh() {
			return {
				autoRefresh: true,
				resourcesDirty: false,
				loadRevision: 0,
				version: void 0,
				observedVersion: void 0,
				pages: {},
				eof: false,
				loading: false,
				failure: void 0,
				scrollTop: 0,
				wrap: true,
				revision: void 0
			};
		}
		/** The bucket for one tab, created on first write. */
		function bucket(state, tabId) {
			return state.byTab[tabId] ??= fresh();
		}
		/**
		* Declare the preview's store.
		*
		* Constructed once in apply and shared by the body and the tools registrations,
		* which the slot runtime allows because both are session-scoped.
		* @returns the store handle to declare on both registrations.
		*/
		function createTextStore() {
			return (0, _deepseek_ai_dsh_client_store.defineStore)({
				init: () => ({ byTab: {} }),
				actions: {
					toggledAutoRefresh: (d, tabId) => {
						const state = bucket(d, tabId);
						state.autoRefresh = !state.autoRefresh;
					},
					resourceChanged: (d, tabId) => {
						bucket(d, tabId).resourcesDirty = true;
					},
					/** @param d - draft. @param tabId - owning tab. @param rendererId - manual choice, or automatic selection. */
					selected: (d, tabId, rendererId) => {
						if (rendererId === void 0) delete bucket(d, tabId).rendererId;
						else bucket(d, tabId).rendererId = rendererId;
					},
					/**
					* Mark a page read as in flight.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param mode - selected renderer's loading mode.
					* @param observedVersion - metadata version at read start; later pages retain the initial observation.
					* @param contentRendererId - implementation owning source loading.
					*/
					loading: (d, tabId, mode, observedVersion, contentRendererId) => {
						const state = bucket(d, tabId);
						if (state.version === void 0 && !state.loading) state.observedVersion = observedVersion;
						if (contentRendererId === void 0) delete state.contentRendererId;
						else state.contentRendererId = contentRendererId;
						state.loading = true;
						state.failure = void 0;
						if (mode !== void 0) state.mode = mode;
					},
					/**
					* @param d - draft. @param tabId - owning tab.
					* @param revision - active content revision. @param version - displayed source version.
					*/
					rendered: (d, tabId, revision, version) => {
						const state = d.byTab[tabId];
						if (state?.mode !== "renderer" || state.loadRevision !== revision) return;
						state.version = version;
						state.loading = false;
					},
					/** @param d - draft. @param tabId - owning tab. @param revision - failed content revision. */
					rendererFailed: (d, tabId, revision) => {
						const state = d.byTab[tabId];
						if (state?.mode !== "renderer" || state.loadRevision !== revision) return;
						state.loading = false;
					},
					/** @param d - draft. @param tabId - owning tab. @param file - complete byte result for this view. */
					complete: (d, tabId, file) => {
						const state = bucket(d, tabId);
						state.complete = file;
						state.version = file.version;
						state.eof = true;
						state.loading = false;
						state.failure = void 0;
					},
					/**
					* Keep one page. A page from a newer file version invalidates the pages
					* of the older one, so the body never shows two versions at once.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param page - the page the Host returned.
					*/
					page: (d, tabId, page) => {
						const state = bucket(d, tabId);
						if (state.version !== void 0 && state.version !== page.version) state.pages = {};
						state.version = page.version;
						state.pages[page.offset] = {
							text: page.text,
							lines: page.lines
						};
						state.eof = page.eof;
						state.loading = false;
						state.failure = void 0;
					},
					/**
					* Record why a page read failed; the pages already held stay.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param failure - the settled Remote failure.
					*/
					failed: (d, tabId, failure) => {
						const state = bucket(d, tabId);
						state.loading = false;
						state.failure = failure;
					},
					/**
					* Drop every page, keeping the view, for a re-read from the first line.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					reset: (d, tabId) => {
						const state = bucket(d, tabId);
						state.resourcesDirty = false;
						state.loadRevision++;
						state.pages = {};
						delete state.complete;
						state.eof = false;
						state.version = void 0;
						state.observedVersion = void 0;
						state.loading = false;
						state.failure = void 0;
					},
					/**
					* Record where one tab's body is scrolled to.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param scrollTop - the body's scroll offset, in px.
					*/
					scrolled: (d, tabId, scrollTop) => {
						bucket(d, tabId).scrollTop = scrollTop;
					},
					/**
					* Switch one tab between wrapped and unwrapped lines.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					*/
					toggledWrap: (d, tabId) => {
						const state = bucket(d, tabId);
						state.wrap = !state.wrap;
					},
					/**
					* Record that the body answered one navigation, so a remount restores the
					* reader's position instead of jumping again.
					* @param d - draft state.
					* @param tabId - the tab being drawn.
					* @param revision - the `navigation.revision` answered.
					*/
					navigated: (d, tabId, revision) => {
						bucket(d, tabId).revision = revision;
					},
					/**
					* Drop one tab's state, for a tab record that is gone.
					* @param d - draft state.
					* @param tabId - the tab that went away.
					*/
					forget: (d, tabId) => {
						const byTab = {};
						for (const [id, state] of Object.entries(d.byTab)) if (id !== tabId) byTab[id] = state;
						d.byTab = byTab;
					}
				}
			});
		}
