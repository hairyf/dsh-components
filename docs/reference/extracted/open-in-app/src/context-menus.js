// Extracted from @deepseek-ai/dsh-client-ui-open-in-app (lib/client.js); region lib/types/client/context-menus.js
// Compiled bundle code copied verbatim from the region; imports are hoisted in the original bundle, so this file is not standalone.

/** Native path and URL menu contributions, independent of their trigger components. */
/**
* Register native opening, original-path reveal, and URL actions.
* @param ctx - declared plugin dependencies.
* @param paths - existing native file actions.
* @param t - localized action labels.
* @param directories - installed directory applications.
* @param report - native operation feedback shared with the application controls.
*/
function registerContextMenus(ctx, paths, t, directories, report) {
	const fileManager = () => t(directories.apps.getSnapshot()?.includes("finder") ? "menu.finder" : "menu.reveal");
	const open = async (path, action, application) => {
		report(await paths.openPath(path, action, application));
	};
	const resolvePath = async (sessionId, path, signal) => {
		try {
			const result = await ctx.remote.workspaceFiles.stat(sessionId, path, signal);
			return result.ok ? result.value.absolutePath : void 0;
		} catch (_error) {
			signal.throwIfAborted();
			return;
		}
	};
	ctx.effect(() => ctx.contextMenus.register({
		id: "open-in-app.workspace",
		target: "workspace",
		order: 200,
		resolve: async ({ path }, signal) => {
			await directories.load();
			signal.throwIfAborted();
			const manager = directories.apps.getSnapshot()?.find((id) => [
				"finder",
				"explorer",
				"filemanager"
			].includes(id));
			return [{
				id: "reveal",
				icon: { key: "open-in-app.reveal" },
				label: fileManager(),
				disabled: manager === void 0,
				failureLabel: t("path.revealError"),
				...manager === void 0 ? {} : { run: async () => {
					const outcome = await directories.launch(manager, path);
					report(outcome.kind === "failed" ? {
						kind: "failed",
						failure: "revealError"
					} : outcome);
				} }
			}];
		}
	}), "open-in-app: Workspace context menu");
	ctx.effect(() => ctx.contextMenus.register({
		id: "open-in-app.directory",
		target: "directory",
		order: 100,
		resolve: async ({ sessionId, path }, signal) => {
			await paths.load();
			const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
			const absolutePath = resolveWorkspacePath(cwd, path);
			signal.throwIfAborted();
			return [{
				id: "reveal",
				icon: { key: "open-in-app.reveal" },
				label: fileManager(),
				disabled: paths.desktop.getSnapshot() !== true,
				run: () => open(absolutePath, "reveal")
			}, {
				id: "copyPath",
				icon: { key: "open-in-app.copy" },
				label: t("menu.copyDirectoryPath"),
				failureLabel: t("menu.copyFailed"),
				run: async () => {
					await navigator.clipboard.writeText(absolutePath);
					ctx.contextMenus.notify(t("menu.copied"), true);
				}
			}];
		}
	}), "open-in-app: directory context menu");
	ctx.effect(() => ctx.contextMenus.register({
		id: "open-in-app.file",
		target: "file",
		order: 100,
		resolve: async (target, signal) => {
			const { sessionId, path, line } = target;
			await paths.load();
			const absolutePath = await resolvePath(sessionId, path, signal);
			const available = absolutePath !== void 0;
			const desktop = paths.desktop.getSnapshot() === true && available;
			const apps = desktop ? await paths.applications(absolutePath, signal) : [];
			signal.throwIfAborted();
			const application = apps?.find((app) => app.default);
			const openIn = (destination) => () => {
				const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
				ctx.sidebarRight.openResourceIn(sessionId, fileAddressFor(sessionId, cwd, path), {
					destination,
					...line === void 0 ? {} : { params: { line } }
				});
			};
			return [
				{
					id: "sidebar",
					icon: { key: "open-in-app.sidebar" },
					label: t("menu.openInSidebar"),
					disabled: !available,
					run: openIn("sidebar")
				},
				{
					id: "float",
					icon: { key: "open-in-app.float" },
					label: t("menu.openInFloat"),
					disabled: !available,
					run: openIn("float")
				},
				{
					id: "reveal",
					icon: { key: "open-in-app.reveal" },
					label: fileManager(),
					disabled: !desktop,
					...absolutePath === void 0 ? {} : { run: () => open(absolutePath, "reveal") }
				},
				{
					id: "open",
					label: application ? t("open.title", { app: application.name }) : t("menu.defaultApp"),
					icon: {
						key: "open-in-app.application",
						...application?.icon ? { src: application.icon } : {}
					},
					disabled: application === void 0,
					...absolutePath === void 0 || application === void 0 ? {} : { run: () => open(absolutePath, "open", application.id) }
				},
				{
					id: "copyPath",
					icon: { key: "open-in-app.copy" },
					failureLabel: t("menu.copyFailed"),
					label: t("menu.copyPath"),
					run: async () => {
						const cwd = ctx.sessions.list.getSnapshot().byId[sessionId]?.cwd;
						await navigator.clipboard.writeText(absolutePath ?? resolveWorkspacePath(cwd, path));
						ctx.contextMenus.notify(t("menu.copied"), true);
					}
				}
			];
		}
	}), "open-in-app: file context menu");
	ctx.effect(() => ctx.contextMenus.register({
		id: "open-in-app.url",
		target: "url",
		order: 100,
		resolve: ({ sessionId, url }) => [
			{
				id: "sidebar",
				icon: { key: "open-in-app.sidebar" },
				label: t("menu.openInSidebar"),
				disabled: ctx.sidebarRightTabs.get("browser") === void 0,
				run: () => {
					ctx.sidebarRight.openTabIn(sessionId, "browser", { params: { url } });
				}
			},
			{
				id: "external",
				label: t("menu.external"),
				run: () => {
					window.open(url, "_blank", "noopener,noreferrer");
				}
			},
			{
				id: "copy",
				icon: { key: "open-in-app.copy" },
				failureLabel: t("menu.copyFailed"),
				label: t("menu.copyLink"),
				run: async () => {
					await navigator.clipboard.writeText(url);
					ctx.contextMenus.notify(t("menu.copied"), true);
				}
			}
		]
	}), "open-in-app: URL context menu");
	ctx.effect(() => ctx.contextMenus.register({
		id: "open-in-app.image",
		target: "image",
		order: 200,
		resolve: async (target, signal) => {
			const { sessionId, path } = target;
			await paths.load();
			const local = path !== void 0 && sessionId !== void 0 && paths.desktop.getSnapshot() === true ? await resolvePath(sessionId, path, signal) : void 0;
			signal.throwIfAborted();
			return [{
				id: "reveal",
				icon: { key: "open-in-app.reveal" },
				label: fileManager(),
				disabled: local === void 0,
				...local !== void 0 ? { run: () => open(local, "reveal") } : {}
			}];
		}
	}), "open-in-app: image context menu");
}
/** @param props - icon metadata captured with the resolved action. @returns Application image or the native-open glyph. */
function ContextMenuApplicationIcon({ icon }) {
	return icon.src ? (0, react_jsx_runtime.jsx)("img", {
		src: icon.src,
		width: 14,
		height: 14,
		alt: ""
	}) : (0, react_jsx_runtime.jsx)(_deepseek_ai_dsh_client_ui_primitives.IconRightUpOutlineRegular, {});
}
/** Browser-relative form of {@link OPEN_IN_APP_APPS_PATH}. */
const OPEN_IN_APP_APPS_ROUTE = "/open-in-app/apps".slice(1);
/** Browser-relative form of {@link OPEN_IN_APP_ICON_PREFIX_PATH}. */
const OPEN_IN_APP_ICON_PREFIX_ROUTE = "/open-in-app/icon".slice(1);
/** Browser-relative form of {@link OPEN_IN_APP_OPEN_PATH}. */
const OPEN_IN_APP_OPEN_ROUTE = "/open-in-app/open".slice(1);
