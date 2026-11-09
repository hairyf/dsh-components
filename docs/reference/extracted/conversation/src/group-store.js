// Extracted from @deepseek-ai/dsh-client-ui-conversation (lib/client.js); region lib/types/client/conversation/group-store.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

		/** Keyed group publication and incremental validation of rendering positions. */
		function sameNodeReference(left, right) {
			return left.key === right.key && left.groupPart === right.groupPart;
		}
		function sameEntry(left, right) {
			return left.kind === right.kind && left.key === right.key && (left.kind === "group" || right.kind === "node" && left.groupPart === right.groupPart);
		}
		function reuseReferences(previous, next, equal) {
			return previous === next || previous.length === next.length && previous.every((value, index) => equal(value, next[index])) ? previous : next;
		}
		/** Validates a complete batch before installing its group and root-list changes. */
		var ConversationGroupStore = class {
			root = [];
			rootGroups = /* @__PURE__ */ new Set();
			groups = /* @__PURE__ */ new Map();
			placements = /* @__PURE__ */ new Map();
			sources = /* @__PURE__ */ new Map();
			dirty = /* @__PURE__ */ new Set();
			/** @returns the identity-stable ordered root references. */
			get entries() {
				return this.root;
			}
			groupSource(key) {
				let source = this.sources.get(key);
				if (source === void 0) {
					const publication = (0, _deepseek_ai_dsh_client_store.createSnapshotStore)(this.groups.get(key));
					source = {
						publication,
						observable: {
							getSnapshot: () => this.groups.get(key),
							subscribe: (listener) => publication.subscribe(listener)
						}
					};
					this.sources.set(key, source);
				}
				return source.observable;
			}
			/**
			* Install one validated update without notifying readers.
			* @param update - root replacement and complete or incremental group records.
			* @param readNode - synchronous reader of the current target Nodes.
			*/
			prepareAndInstall(update, readNode) {
				const nextRoot = update.entries === void 0 ? this.root : reuseReferences(this.root, update.entries, sameEntry);
				const nextRootGroups = nextRoot === this.root ? this.rootGroups : this.collectRootGroups(nextRoot);
				const { upserts, removes } = this.collectChanges(update);
				const replaceReferences = update.groups.kind === "replace";
				if (this.groups.size - removes.size + [...upserts.keys()].filter((key) => !this.groups.has(key)).length !== nextRootGroups.size) throw new Error("conversation group records and root references must correspond one-to-one");
				for (const key of removes) if (nextRootGroups.has(key)) throw new Error(`conversation group "${key}" is still referenced`);
				for (const key of upserts.keys()) if (!nextRootGroups.has(key)) throw new Error(`conversation group "${key}" has no root reference`);
				if (nextRootGroups !== this.rootGroups) {
					for (const key of nextRootGroups) if (!upserts.has(key) && !this.groups.has(key)) throw new Error(`conversation root references missing group "${key}"`);
				}
				const affectedParts = /* @__PURE__ */ new Map();
				const partsOf = (key) => {
					let parts = affectedParts.get(key);
					if (parts === void 0) {
						parts = new Set(this.placements.get(key));
						affectedParts.set(key, parts);
					}
					return parts;
				};
				const removeReference = (reference) => {
					partsOf(reference.key).delete(reference.groupPart);
				};
				const addReference = (reference) => {
					if (readNode(reference.key) === void 0) throw new Error(`conversation group references missing Node "${reference.key}"`);
					const parts = partsOf(reference.key);
					if (parts.has(reference.groupPart) || reference.groupPart === void 0 && parts.size > 0 || parts.has(void 0)) throw new Error(`conversation Node "${reference.key}" has overlapping rendering positions`);
					parts.add(reference.groupPart);
				};
				if (replaceReferences || nextRoot !== this.root) {
					for (const entry of this.root) if (entry.kind === "node") removeReference(entry);
				}
				for (const key of removes) for (const member of this.groups.get(key).members) removeReference(member);
				for (const [key, next] of upserts) {
					const previous = this.groups.get(key);
					if (previous !== void 0 && (replaceReferences || previous.members !== next.members)) for (const member of previous.members) removeReference(member);
				}
				if (replaceReferences || nextRoot !== this.root) {
					for (const entry of nextRoot) if (entry.kind === "node") addReference(entry);
				}
				for (const [key, next] of upserts) if (replaceReferences || this.groups.get(key)?.members !== next.members) for (const member of next.members) addReference(member);
				for (const [key, parts] of affectedParts) if (parts.size === 0) this.placements.delete(key);
				else this.placements.set(key, parts);
				for (const key of removes) {
					this.groups.delete(key);
					this.dirty.add(key);
				}
				for (const [key, next] of upserts) {
					if (this.groups.get(key) === next) continue;
					this.groups.set(key, next);
					this.dirty.add(key);
				}
				this.root = nextRoot;
				this.rootGroups = nextRootGroups;
			}
			/** Publish changed group sources after all related target data has been installed. */
			publish() {
				const keys = [...this.dirty];
				this.dirty.clear();
				for (const key of keys) this.sources.get(key)?.publication.set(this.groups.get(key));
			}
			/** Remove grouping without deleting its source Nodes; publication remains deferred. */
			clear() {
				this.prepareAndInstall(
					{
						entries: [],
						groups: {
							kind: "replace",
							snapshots: []
						}
					},
					/* v8 ignore next -- an empty replacement never reads a Node reference. */
					() => void 0
				);
			}
			collectRootGroups(entries) {
				const keys = /* @__PURE__ */ new Set();
				for (const entry of entries) {
					if (entry.kind !== "group") continue;
					if (keys.has(entry.key)) throw new Error(`conversation group "${entry.key}" has duplicate root references`);
					keys.add(entry.key);
				}
				return keys;
			}
			collectChanges(update) {
				const upserts = /* @__PURE__ */ new Map();
				const removes = /* @__PURE__ */ new Set();
				const add = (snapshot) => {
					if (upserts.has(snapshot.key)) throw new Error(`conversation group "${snapshot.key}" has duplicate upserts`);
					const previous = this.groups.get(snapshot.key);
					if (previous === void 0) {
						upserts.set(snapshot.key, snapshot);
						return;
					}
					const members = reuseReferences(previous.members, snapshot.members, sameNodeReference);
					upserts.set(snapshot.key, previous.data === snapshot.data && previous.members === members ? previous : {
						...snapshot,
						members
					});
				};
				switch (update.groups.kind) {
					case "replace":
						for (const snapshot of update.groups.snapshots) add(snapshot);
						for (const key of this.groups.keys()) if (!upserts.has(key)) removes.add(key);
						break;
					case "apply":
						for (const snapshot of update.groups.upserts) add(snapshot);
						for (const key of update.groups.removes) {
							if (removes.has(key)) throw new Error(`conversation group "${key}" has duplicate removals`);
							if (!this.groups.has(key)) throw new Error(`conversation group "${key}" cannot be removed because it is absent`);
							if (upserts.has(key)) throw new Error(`conversation group "${key}" cannot be upserted and removed together`);
							removes.add(key);
						}
						break;
					/* v8 ignore next 2 -- closed update union; TypeScript rejects other operation tags. */
					default: assertNever$1(update.groups);
				}
				return {
					upserts,
					removes
				};
			}
		};
