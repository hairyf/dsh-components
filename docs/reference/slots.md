# 官方 DSH Web 插槽点（Slot）权威清单

> **用途**：把官方插槽 1:1 映射成 Puck 的 DropZone 多区域，并作为 Icon* 组件注入图标位（尤其是「会话项左边」）的依据。
> **key 全集**：以同目录 `slots.json`（`scripts/extract-slots.mjs` 产物）为准，共 **109** 个 key。本文件不修改该 JSON，只在其上补全宿主 / DOM / accepts / 证据，并指出口径差异（附录 B）。

**计数**

| 项 | 数量 |
| --- | --- |
| slot key 总数（= slots.json） | **109** |
| icon 类插槽（`kind: "icon"`） | **13** |
| contract（slots.json 字段）single / chain / keyed | 103 / 4 / 2 |
| 类型声明的真实 kind：single / keyed / list / chain | 43 / 20 / 42 / 4 |
| 运行时 scope：root / session / session-maybe | 53 / 51 / 5 |
| 域（slots.json 的 scope 字段） | conversation 42，sidebar 15，settings 13，rightbar 12，plugins 9，other 8，frame 5，tool 3，contextMenu 2 |
| 官方有 reader/occupant 的 key | 109 |
| DOM 锚点已取证（✅） | 86 |
| 部分取证（🟡：落点靠上下文推断） | 23（见附录 C） |
| 未取证（⚪） | 0 |

---

## 0. 证据等级约定

本文件所有断言分三档，正文用 ✅ / 🟡 / ⚪ 标注：

| 档位 | 含义 | 本文覆盖 |
| --- | --- | --- |
| ✅ **已取证** | 在还原源码中定位到 `renderSlot(...)` / `register(...)` 调用点（含 `文件:行`），且 DOM 锚点有 className 或 data-* 佐证 | 86 / 109 |
| 🟡 **已执行但未验证** | 调用点已取证，但插槽在 DOM 中的落点由父组件结构与上下文推断，未在运行态浏览器中逐条核验 | 23 / 109 |
| ⚪ **未取证** | 无任何代码或 DOM 证据 | 0 |

**为什么有 🟡**：`http://127.0.0.1:3080` 需要鉴权（直接请求返回 `dsh web authentication required`），本会话**未能抓取运行态 DOM** 交叉验证。补齐方法见附录 E 第 3 条。

**重要澄清**：本清单只收录**真实的 slot 契约**（`ctx.slots` 注册体系，渲染时输出 `[data-slot="<key>"]` 锚点）。
React children 位置、CSS class、`ctx.contextMenus` 这类数据注册表**不是** slot，单列在附录 D，避免被误做成假 DropZone。

---

## 1. 运行时契约（从 web bundle 反推，✅ 已取证）

### 1.1 模块与服务的真实形状

- 包名：`@deepseek-ai/dsh-client-ui-slots`。**磁盘上没有这个包**，它由 web boot 的 `staticModules` 在运行时注入：
  `@deepseek-ai/dsh-web-frontend/dist/assets/index-*.js` 里 `function YZ(){return{react:…,"@deepseek-ai/dsh-client-ui-slots":MI,…}}`，`MI` 是 `{SlotCore, SlotOwnershipError, StaleAuthorizationError, resolveSlotLabel, standardHookPropName}` 的冻结模块对象。
- 面向插件的是 cordis 服务 `ctx.slots`，实现是 `@deepseek-ai/dsh-client-ui-renderer` 的 `SlotRegistry extends Service`（内部持有 `SlotCore`）。
- 另有 `ctx.slots.renderSlot("root", {})` —— 全应用**唯一**的 ctx 级渲染入口，只接受 `root`。

`SlotCore.register` 的关键语义（`ui-renderer`/`ui-frontend` bundle 原文反推）：

```js
// kind 校验发生在 register()：
// single  -> 同 priority 二次注册 throw `single slot "x" already has a registration at priority N`
// keyed   -> options.key 必填，同 key+同 priority 二次注册 throw
// list    -> options.id  必填，同 id +同 priority 二次注册 throw
// chain   -> options.select 必填
// 未声明就注册 -> throw `slot "x" is not declared (a parent entry's children table must declare it)`
// 渲染取用：entriesOfSlot() 对 single/keyed/list 每个「cell」取第一条（按 priority 升序 = 低优先级渲染），
//           chain 原样返回，由宿主按序遍历 select() 选举。
```

### 1.2 四种 kind（决定 Puck 侧是「单槽」还是「多区域」）

| kind | 语义 | 同一 cell 允许多个 occupant | Puck 映射建议 |
| --- | --- | --- | --- |
| `single` | 全槽只有一个 winner | ❌ 第二个注册即**遮蔽**官方（priority 低者胜） | 单 DropZone，且要提示「放入即替换官方」 |
| `keyed` | 按 `options.key` 分格 | ✅ 不同 key 并存；同 key 覆盖 | **每个 key 一个 DropZone**（key 集合动态，需要枚举） |
| `list` | 同类多条目 | ✅ 任意多；`order` 升序 | 一个 DropZone，内部按 order 排序渲染多个 item |
| `chain` | 选举式接管 | ✅ 多个注册，但只有一个渲染 | DropZone 需带「接管/回退」语义 |

### 1.3 注册选项（`register(options, component)`）

| 选项 | 适用 | 说明 |
| --- | --- | --- |
| `name` | 全部 | slot key |
| `key` | keyed | cell key |
| `id` | list | cell id |
| `order` | list | 排序，默认 0 |
| `label` | 通用 | 宿主投射文案处使用（可为 `() => string`，随 locale 重读） |
| `priority` | 全部 | 默认 0，**数值低者胜**；改变 priority 是遮蔽官方条目的唯一方式 |
| `select` | chain | `(owner) => ReactNode` 或 `null`，返回 null = 不认领 |
| `inject` | 通用 | `() => ({ hooks: {...}, ... })` 注入面 |
| `children` | 通用 | 声明子 slot（**slot 必须由父条目的 children 表声明后可注册**） |
| `store` | 通用 | 独占 store 工厂，每次 occurrence mint 实例 |
| `locale` | 通用 | locale namespace |
| `registrant` | 通用 | 诊断标记 |

### 1.4 DOM 契约（✅ 已取证，可直接用于选择器）

渲染器 `SlotOutlet`（`ui-renderer/lib/client.js`）为**每个** slot 输出一个锚点：

```html
<!-- 默认 -->
<div data-slot="sidebar.session.row.leading" style="display:contents"> …occupant… </div>
<!-- slot 声明了 inline: true（6 个）时用 span -->
<span data-slot="contextMenu.icon" style="display:contents">…</span>
<!-- 条目崩溃（ErrorBoundary 捕获 + abdicate） -->
<div data-slot-error="tool.call.toolview"></div>
<!-- chain 的 overlay fallback -->
<div data-chain-overlay-fallback="conversation.composer" style="display:none">…</div>
```

- `display:contents` 意味着锚点**不参与布局**，所以"插槽的 DOM 位置"等于"锚点的父元素位置"。
- 因此浏览器里定位任意插槽：`document.querySelector('[data-slot="<key>"]')!.parentElement`。
- 6 个 `inline: true` 的 key：`contextMenu.icon`、`conversation.input.model.label`、`conversation.user.text.node`、`settings.section.icon`、`sidebar.session.row.leading`、`sidebar.session.row.trailing`（渲染为 `<span>`）。

### 1.5 声明 / 注入 / 生命周期

- **声明**：`ctx.slots.register({ name, children: { "child.key": {kind, scope} } }, Comp)` —— 父条目一挂载就声明子 slot，卸载级联清除。
- **等待声明**：`ctx.slots.inject("some.key", () => ctx.slots.register(...))` —— 槽已声明则同步执行，否则等声明提交后执行；插件卸载自动回收。官方 61 个包的注册几乎全是这个形状。
- **卸载**：所有 disposer 都挂在调用方 cordis fiber 上。
- **崩溃**：条目抛错 → `SlotErrorBoundary` 捕获 → `onEntryError` → 非 chain 条目被 abdicate（该 cell 换下一顺位）→ 渲染 `[data-slot-error]`。

---

## 2. 全局布局骨架（`ui-layout` 的 `AppFrame`）

这是映射 Puck 页面结构的**唯一权威骨架**，来自 `docs/reference/extracted/layout/src/AppFrame.js:256-334`（✅ 已取证）：

```jsx
<div class="frame" data-sidebar-collapsed data-sidebar-drawer data-rightbar-collapsed …
     style="grid-template-columns: <sidebar>px minmax(<0|400>,1fr) minmax(0,<rightbarMax>)px">
  <div class="sidebarCol" style="width:<sidebarWidth>">        {sidebar}              // slot: sidebar        (single/root)
  <CenterColumn class="centerCol">
     <div class="mainPanel" data-global-panel>                {main}                 // slot: main           (keyed/root, entryKey=panelId ?? "conversation")
  </CenterColumn>
  <RightbarColumn class="rightbarCol" data-rightbar-col>      {rightbar}             // slot: rightbar       (single/root)
  <div class="bottomRow" data-shell-bottom>                   {shell.bottom}         // slot: shell.bottom   (single/root)
  <div class="overlayLayer" data-shell-overlay>               {shell.overlay}        // slot: shell.overlay  (list/root，可叠加)
  <div class="leadingSeat" data-shell-leading>                {shell.leading}        // slot: shell.leading  (single/root，仅 drawer/darwin 折叠时挂载)
  … DragHandle（sidebar 拖拽）/ DragHandle（rightbar 拖拽）
</div>
```

外层再包一层：`buildRenderApp()` 返回 `ctx.slots.renderSlot("root", {})`，官方 occupant 就是 `AppFrame`。

关键结论：

1. **`root` 是唯一入口**，`ui-renderer` 的注释明确警告「**DO NOT register here**」——single 槽，动态注册会抢在 `AppFrame` 前面把整棵树替换掉。
2. `main` 是 **keyed**，`entryKey = activePanelId ?? "conversation"`；官方只占 `conversation` 一个 key（由 `ui-conversation` 的 `ConversationPanel` 注册）。要加新主面板 = 注册一个新 key + 在 `sidebar.panellist` 加一个图标项。
3. `rightbar` 的宽度、全屏、是否占轨由 occupant 通过 `ctx.layout` 上报，frame 只按上报值排版。
4. `shell.overlay` 是**唯一**推荐的"全局浮层"落点（list，可叠加、默认点击穿透）。

---

## 3. 全量总表（109 个 key）

列：**域** = `slots.json` 的 scope 分组；**contract** = `slots.json` 的契约形态；**声明 kind/scope** = 从 `SlotMap` 类型声明与运行时 catalog 得到的**真实**契约（决定能否叠加）；**宿主** = 渲染该 slot 的组件与调用点；**DOM** = 锚点父元素的 className / data 属性。

| key | 域 | contract | 声明 kind | 声明 scope | 宿主（包/组件） | 调用点 | DOM 锚定 |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `contextMenu.content` | contextMenu | single | keyed | root | `context-menu/MenuOverlay` | src/View.js:46 | — |
| `contextMenu.icon` | contextMenu | single | keyed | root | `context-menu/menuEntries` | src/View.js:20 | — |
| `conversation.approval.detail` | conversation | single | single | session | `approval/ApprovalFlow` | src/ApprovalCard.js:15 | — |
| `conversation.chat.assistant-actions` | conversation | single | list | session | `chat/TurnTailNodeView` | src/TurnTailNodeView.js:38 | `data-turn-tail` |
| `conversation.chat.commandview` | conversation | single | keyed | session | `chat/CommandNodeView` | src/CommandNodeView.js:10 | `.callRow` |
| `conversation.chat.flow` | conversation | single | single | session | `chat/ChatView` | src/ChatView.js:251 | `.older` |
| `conversation.chat.message.images` | conversation | single | single | session | `chat/AssistantMarkdown` | src/AssistantMarkdown.js:74 | — |
| `conversation.chat.node` | conversation | single | keyed | session | `chat/ChatNodeSeat` | src/ChatNodeSeat.js:119 | `data-turn-process-hidden` |
| `conversation.chat.reasoning.body` | conversation | single | single | session | `chat/ReasoningRow` | src/ReasoningRow.js:67 | `data-text-interaction-source` |
| `conversation.chat.text-interaction` | conversation | single | keyed | session | `chat/ChatView` | src/ChatView.js:268 | `data-text-interaction-surface` |
| `conversation.chat.turnTail` | conversation | single | list | session | `chat/TurnTailNodeView` | src/TurnTailNodeView.js:27 | — |
| `conversation.chat.user.before` | conversation | chain | chain | session | `chat/UserStyleBubble` | src/MessageItem.js:179 | — |
| `conversation.chat.user.images` | conversation | single | single | session | `chat/UserContent` | src/UserContent.js:23 | `data-message-attachments` |
| `conversation.composer` | conversation | chain | chain | session | `conversation/ConversationContent` | src/ConversationContent.js:120 | — |
| `conversation.composer.bar` | conversation | single | single | session-maybe | `conversation/ConversationContent` | src/ConversationContent.js:94 | `.heroOptions` |
| `conversation.composer.dock` | conversation | single | list | session | `conversation/InputBar` | src/InputBar.js:480 | `data-composer-dock` |
| `conversation.header` | conversation | single | single | session-maybe | `conversation/ConversationMainPanel` | src/ConversationMainPanel.js:24 | `data-phase` |
| `conversation.header.leading` | conversation | single | single | root | `conversation/ConversationHeader` | src/ConversationHeader.js:20 | `data-conversation-header-leading` |
| `conversation.hero.agentPreset` | conversation | single | single | session-maybe | `conversation/ConversationContent` | src/ConversationContent.js:86 | `.heroOptions` |
| `conversation.hero.brand.mark` | conversation | single | single | root | `conversation/HeroShell` | src/EmptyHero.js:110 | `.fish` |
| `conversation.hero.options` | conversation | single | list | session | `conversation/ConversationContent` | src/ConversationContent.js:89 | `.heroOptions` |
| `conversation.hero.workspace` | conversation | single | single | root | `conversation/ConversationContent` | src/ConversationContent.js:71 | `.heroWorkspaceRow` |
| `conversation.hero.workspace.directoryFlow` | conversation | single | single | root | `workspace/WorkspacePicker` | src/WorkspacePicker.js:185 | `.modalError` |
| `conversation.input.activity` | conversation | single | single | session | `conversation/InputBar` | src/InputBar.js:375 | `.standardControls` |
| `conversation.input.attachments` | conversation | single | single | session-maybe | `conversation/InputBar` | src/InputBar.js:295 | `data-composer-overlay` |
| `conversation.input.dock` | conversation | single | list | session | `conversation/ConversationContent` | src/ConversationContent.js:116 | `.composerStack` |
| `conversation.input.left` | conversation | single | list | session | `conversation/InputBar` | src/InputBar.js:363 | `.modes` |
| `conversation.input.model` | conversation | single | single | session | `conversation/InputBar` | src/InputBar.js:371 | `.standardControls` |
| `conversation.input.model.label` | conversation | single | single | session | `model-selection/ModelSelect` | src/ModelSelect.js:330 | `data-model-id` |
| `conversation.input.overlay` | conversation | single | list | session | `conversation/InputBar` | src/InputBar.js:289 | `data-composer-overlay` |
| `conversation.input.permission` | conversation | single | single | session | `conversation/InputBar` | src/InputBar.js:361 | `.modes` |
| `conversation.input.plan` | conversation | single | single | session | `conversation/InputBar` | src/InputBar.js:361 | `.modes` |
| `conversation.input.right` | conversation | single | list | session | `conversation/InputBar` | src/InputBar.js:371 | `.standardControls` |
| `conversation.plan-review.actions` | conversation | single | list | session | `user-questions/PlanReviewPanel` | src/PlanReviewPanel.js:66 | `data-plan-review-key` |
| `conversation.session` | conversation | single | single | session | `conversation/ConversationSessionView` | src/ConversationContent.js:5 | — |
| `conversation.session.header` | conversation | single | single | session | `conversation/ConversationHeader` | src/ConversationHeader.js:21 | `data-conversation-header-leading` |
| `conversation.session.header.actions` | conversation | single | list | session | `conversation/ConversationSessionHeader` | src/ConversationSession.js:182 | `.headerActions` |
| `conversation.session.header.corner` | conversation | single | single | session | `conversation/ConversationSessionHeader` | src/ConversationSession.js:190 | `data-conversation-header-corner` |
| `conversation.session.header.lineage` | conversation | single | single | session | `conversation/ConversationSessionHeader` | src/ConversationSession.js:174 | `.crumbSep` |
| `conversation.session.header.utilities` | conversation | single | list | session | `conversation/ConversationSessionHeader` | src/ConversationSession.js:186 | `.headerCorner` |
| `conversation.session.header.views.actions` | conversation | single | list | root | `conversation/ViewsMoreMenu` | src/ConversationSession.js:33 | `.viewsMore` |
| `conversation.trajectory.images` | conversation | single | single | session | `trajectory/RecordAttachments` | src/TrajectoryTable.js:811 | `.attachmentRow` |
| `conversation.user.text.node` | conversation | single | keyed | session | `conversation/UserText` | src/UserText.js:34 | — |
| `conversation.view` | conversation | single | list | session | `conversation/DefaultConversationViews` | src/DefaultConversationViews.js:28 | `.viewArea` |
| `deliverables.file.actions` | other | single | list | session | `deliverables/Deliverables` | src/Deliverables.js:116 | `data-single` |
| `deliverables.review.file.actions` | other | single | list | session | `deliverables/ReviewTab` | src/ReviewTab.js:215 | `data-review-tool` |
| `main` | other | single | keyed | root | `layout/MainPanel` | src/AppFrame.js:34 | `data-global-panel` |
| `main.conversation` | other | single | single | session-maybe | `conversation/ConversationPanel` | src/ConversationPanel.js:10 | — |
| `plugins.add.actions` | plugins | single | list | root | `plugin-manager/AddPluginMenu` | src/PluginManagerPage.js:88 | `.addMenuDescription` |
| `plugins.bundle.activation` | plugins | single | keyed | root | `plugin-manager/PluginManagerPage` | src/PluginManagerPage.js:2272 | `data-plugin-group` |
| `plugins.bundle.config` | plugins | single | keyed | root | `plugin-manager/PackageDetail` | src/PluginManagerPage.js:914 | `data-plugin-config` |
| `plugins.detail.actions` | plugins | single | list | root | `plugin-manager/ItemDetail` | src/PluginManagerPage.js:666 | `data-plugin-item-detail` |
| `plugins.detail.badge` | plugins | single | list | root | `plugin-manager/ItemDetail` | src/PluginManagerPage.js:676 | `data-plugin-item-detail` |
| `plugins.detail.section` | plugins | single | list | root | `plugin-manager/ItemDetail` | src/PluginManagerPage.js:691 | `data-plugin-config` |
| `plugins.item` | plugins | single | list | root | `plugin-manager/ItemCard` | src/PluginManagerPage.js:621 | `data-plugin-item` |
| `plugins.row.config` | plugins | single | keyed | root | `plugin-manager/RowDetail` | src/PluginManagerPage.js:747 | `.detailDesc` |
| `plugins.tab` | plugins | single | list | root | `plugin-manager/PluginManagerPage` | src/PluginManagerPage.js:2128 | `.tabPanel` |
| `rightbar` | other | single | single | root | `layout/AppFrame` | src/AppFrame.js:296 | `data-sidebar-mask` |
| `rightbar.session` | other | single | single | session | `sidebar-right/SessionView` | src/RightbarRoot.js:14 | `data-sidebar-right-session` |
| `root` | frame | single | single | root | `renderer/buildRenderApp` | src/app.js:11 | — |
| `settings.action` | settings | single | list | root | `settings-general/SettingsPanel` | src/SettingsRoot.js:103 | `.actions` |
| `settings.close` | settings | single | single | root | `settings-general/SettingsPanel` | src/SettingsRoot.js:110 | `.hiddenLabel` |
| `settings.general.item` | settings | single | list | root | `settings-general/GeneralSection` | src/GeneralSection.js:12 | `.section` |
| `settings.header` | settings | single | single | root | `settings-general/SettingsPanel` | src/SettingsRoot.js:62 | `data-modal-autofocus` |
| `settings.launcher` | settings | single | single | root | `settings-general/SettingsRoot` | src/SettingsRoot.js:214 | `.triggerRow` |
| `settings.models.footer` | settings | single | list | root | `settings-models/Loaded` | src/ModelsSection.js:568 | — |
| `settings.models.provider-card` | settings | single | keyed | root | `settings-models/Loaded` | src/ModelsSection.js:333 | — |
| `settings.models.sign-in` | settings | single | single | root | `settings-models/DeepSeekOnboardingDialog` | src/DeepSeekOnboardingDialog.js:88 | `.editor` |
| `settings.onboarding` | settings | single | list | root | `settings-general/SettingsRoot` | src/SettingsRoot.js:268 | — |
| `settings.plugins.tab` | settings | single | list | root | `settings-plugins/PluginsSettingsSection` | src/PluginsSettingsSection.js:37 | `.tabs` |
| `settings.section` | settings | single | list | root | `settings-general/SettingsPanel` | src/SettingsRoot.js:116 | `.options` |
| `settings.section.icon` | settings | single | list | root | `settings-general/SettingsPanel` | src/SettingsRoot.js:85 | `data-modal-autofocus` |
| `settings.trigger` | settings | single | single | root | `settings-general/SettingsRoot` | src/SettingsRoot.js:240 | `.trigger` |
| `shell.bottom` | frame | single | single | root | `layout/AppFrame` | src/AppFrame.js:306 | `data-shell-bottom` |
| `shell.leading` | frame | single | single | root | `layout/AppFrame` | src/AppFrame.js:254 | — |
| `shell.overlay` | frame | single | list | root | `layout/AppFrame` | src/AppFrame.js:253 | — |
| `shell.quota-notice` | frame | chain | chain | root | `chat/QuotaNoticeHost` | src/QuotaNoticeHost.js:22 | — |
| `sidebar` | other | single | single | root | `layout/AppFrame` | src/AppFrame.js:239 | — |
| `sidebar.brand.mark` | sidebar | single | single | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:229 | `data-modal-autofocus` |
| `sidebar.brand.name` | sidebar | single | single | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:281 | `data-copy-version` |
| `sidebar.chat.conversation` | sidebar | single | single | session | `subagent/SidebarChatTab` | src/client.sidebar-chat.index.js:112 | `data-sidebar-chat` |
| `sidebar.footer.action` | sidebar | single | list | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:396 | `.settingsArea` |
| `sidebar.panellist` | sidebar | single | list | root | `sidebar/PanelRow` | src/SidebarRoot.js:63 | `.panelGlyph` |
| `sidebar.panellist.actions` | sidebar | single | list | root | `sidebar/PanelMoreMenu` | src/SidebarRoot.js:114 | `.panelTitle` |
| `sidebar.right.pane.tab` | rightbar | keyed | keyed | session | `sidebar-right/TabSlot` | lib/client.js | `data-sidebar-right-tab` |
| `sidebar.right.pane.tab.title` | rightbar | keyed | keyed | session | `sidebar-right/TabSlot` | lib/client.js | `data-sidebar-right-tab` (`<span>`) |
| `sidebar.right.tab.document` | rightbar | single | keyed | session | `sidebar-documentpreview/TextPreview` | src/TextPreview.js:420 | `data-textpreview-wrap` |
| `sidebar.right.tab.document.action` | rightbar | single | keyed | session | `sidebar-documentpreview/TextPreview` | src/TextPreview.js:365 | `data-textpreview-tool` |
| `sidebar.right.tab.document.actions` | rightbar | single | list | session | `sidebar-documentpreview/TextPreview` | src/TextPreview.js:242 | — |
| `sidebar.right.tab.document.office.pdf` | rightbar | single | keyed | session | `sidebar-documentpreview/OfficeBody` | src/OfficeBody.js:68 | `data-textpreview-failed` |
| `sidebar.right.tab.document.unpreviewable` | rightbar | single | list | session | `sidebar-documentpreview/TextPreview` | src/TextPreview.js:266 | `data-textpreview-unsupported` |
| `sidebar.right.tab.files.actions` | rightbar | single | list | session | `sidebar-files/FilesBody` | src/FilesBody.js:108 | `data-files-reload` |
| `sidebar.right.tab.guide` | rightbar | chain | chain | session | `sidebar-right/GuideBody` | src/GuideBody.js:127 | — |
| `sidebar.right.tab.guide.actions` | rightbar | single | list | root | `sidebar-right/GuideMoreMenu` | src/GuideBody.js:95 | `.entryTitle` |
| `sidebar.right.tab.guide.entry` | rightbar | single | keyed | session | `sidebar-right/GuideBody` | src/GuideBody.js:134 | `.entryCell` |
| `sidebar.right.tab.menu.item` | rightbar | single | list | session | `sidebar-right/TabMenuContent` | src/TabMenuContent.js:13 | — |
| `sidebar.session.row.hover` | sidebar | single | list | root | `workspace/SessionHoverContent` | src/Rows.js:414 | `.hoverStatus` |
| `sidebar.session.row.leading` | sidebar | single | list | root | `workspace/SessionNodeItem` | src/Rows.js:605 | `.slot` |
| `sidebar.session.row.trailing` | sidebar | single | list | root | `workspace/SessionNodeItem` | src/Rows.js:631 | `.time` |
| `sidebar.settings` | sidebar | single | single | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:399 | `.settingsArea` |
| `sidebar.toggle.badge` | sidebar | single | single | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:235 | `data-modal-autofocus` |
| `sidebar.workspaces` | sidebar | single | single | root | `sidebar/SidebarRoot` | src/SidebarRoot.js:378 | `.regionArea` |
| `sidebar.workspaces.directoryFlow` | sidebar | single | single | root | `workspace/WorkspaceBrowser` | src/WorkspaceBrowser.js:1131 | `.iconButton` |
| `sidebar.workspaces.session.menu.item` | sidebar | single | list | root | `workspace/SessionMenu` | src/SessionMenu.js:11 | — |
| `sidebar.workspaces.session.row.action` | sidebar | single | list | root | `workspace/SessionNodeItem` | src/Rows.js:659 | `data-context-menu-trigger` |
| `tool.call.images` | tool | single | single | session | `tool/ToolRow` | src/ToolRow.js:170 | `data-error` |
| `tool.call.toolview` | tool | single | keyed | session | `tool/ToolCall` | src/ToolCallTree.js:52 | `data-chat-call-id` |
| `tool.view.cordis` | tool | single | keyed | session | `cordis/StartedCordisRunRow` | src/CordisRunRow.js:114 | `data-cordis-business-view` |
| `workspace.toast` | other | single | keyed | root | `workspace/RowActionToast` | src/RowActionToast.js:12 | — |

---

## 4. 按域详解

每条：真实契约 → accepts → 宿主与调用点 → DOM 落点 → 官方 occupant → 上游声明。

### 4.1 frame —— 应用骨架（root / sidebar / main / rightbar / shell.*）

共 5 个 key。

#### `root`  🟡

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`renderer/buildRenderApp` — `docs/reference/extracted/renderer/src/app.js:11`
- **DOM 位置**：整个应用树的唯一入口：`buildRenderApp()` 返回 `ctx.slots.renderSlot("root", {})`，锚点 `<div data-slot="root" style="display:contents">` 直接挂在 `#root` 容器里。官方 occupant 是 `ui-layout` 的 `AppFrame`。
- **官方 occupant（1）**：`layout:AppFrame`（src/client.index.js:55）
- **上游声明**：`packages/client/ui-renderer/src/client/registry.ts:44`

#### `shell.bottom`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`layout/AppFrame` — `docs/reference/extracted/layout/src/AppFrame.js:306`
- **DOM 位置**：`AppFrame` 的 `<div class=".bottomRow" data-shell-bottom>`，横跨左/中/右三列下方；高度由 occupant 决定，空内容不占高。
- **官方 occupant（1）**：`experimental-inspector:InspectorPage`
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:96`

#### `shell.leading`  🟡

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`layout/AppFrame` — `docs/reference/extracted/layout/src/AppFrame.js:254`
- **DOM 位置**：`AppFrame` 的 `<div class=".leadingSeat" data-shell-leading>`，仅在 `drawer || (darwin && sidebarCollapsed)` 时挂载；同时发布 CSS 变量 `--dsh-frame-leading-clearance`。
- **官方 occupant（1）**：`sidebar:HeaderLeadingControls`（src/client.index.js:113）
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:121`

#### `shell.overlay`  🟡

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`layout/AppFrame` — `docs/reference/extracted/layout/src/AppFrame.js:253`
- **DOM 位置**：`AppFrame` 的 `<div class=".overlayLayer" data-shell-overlay>`，位于三列之后（z 序最高）、可点击穿透（entry 自行开启 pointer-events）。
- **官方 occupant（17）**：`chat:QuotaNoticeHost`（chat.quota-notice）（src/apply.js:291）、`context-menu:MenuOverlay`（context-menu）（src/client.index.js:153）、`file-drag:FileDragFeedback`（file-drag.feedback）（src/client.index.js:44）、`open-in-app:OpenInAppToast`（open-in-app.toast）（src/client.index.js:61）、`plugin-manager:PluginRefreshToast`（plugin-manager.refresh-toast）（src/client.index.js:62）、`schedule:ScheduleDeleteToast`（schedule.delete-toast）（src/client.index.js:124）、`settings-account:DesktopOnboardingEntry`（desktop-onboarding）（src/client.index.js:328）、`settings-account:AccountPlatformHost`（account.platform-page）（src/client.index.js:368） …
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:107`

#### `shell.quota-notice`  🟡

- **契约**：`kind: chain` / `scope: root`
- **accepts**：选举式覆盖（select 返回非 null 即独占）
- **宿主**：`chat/QuotaNoticeHost` — `docs/reference/extracted/chat/src/QuotaNoticeHost.js:22`
- **DOM 位置**：`chat/QuotaNoticeHost`：frame 级浮层宿主（挂在 `shell.overlay` 里），无 notice 时返回 null；有配额通知时渲染 winner。
- **官方 occupant（1）**：`settings-account:AccountQuotaNotice`（src/client.index.js:356）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:501`

### 4.2 sidebar —— 左侧导航栏

共 15 个 key。

#### `sidebar.brand.mark`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:229`
- **DOM 位置**：两处：折叠 rail 的 `.railMark`（`SidebarRoot.js:229`，仅 `!wide && !windowsTitlebar`）与展开品牌行 `.brandIdentity > .brandMark`（`:273`），owner 传 `{size: 24}`。
- **官方 occupant（2）**：`brand-official:OfficialBrandMark`（src/client.index.js:14）、`experimental-liveshare:ViewerBrandMark`
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:26`

#### `sidebar.brand.name`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:281`
- **DOM 位置**：`SidebarRoot.js:281` `.brandName`，展开品牌行中 mark 右侧。
- **官方 occupant（2）**：`brand-official:OfficialBrandName`（src/client.index.js:15）、`experimental-liveshare:ViewerBrandName`
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:31`

#### `sidebar.chat.conversation`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`subagent/SidebarChatTab` — `docs/reference/extracted/subagent/src/client.sidebar-chat.index.js:112`
- **DOM 位置**：`ui-subagent` 的 `SidebarChatTab` `.root`，右侧栏里"聊天"标签页的会话宿主。
- **官方 occupant（1）**：`subagent:ConversationSlotPanel`（src/client.sidebar-chat.index.js:142）
- **上游声明**：`packages/client/ui-subagent/src/client/sidebar-chat/index.tsx:42`

#### `sidebar.footer.action`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:396`
- **DOM 位置**：`SidebarRoot.js:396` `.footArea > .footerActions`，Settings 左侧/右侧的动作区。
- **官方 occupant（1）**：`cordis:CordisPanel`（cordis-panel）（src/client.index.js:84）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:56`

#### `sidebar.panellist`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar/PanelRow` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:63`
- **DOM 位置**：`SidebarRoot.js:63` `.panelGlyph`（`aria-hidden` 的 `<span>`）——面板按钮内部图标位，owner 传 `{size: wide?16:18, active}`。
- **官方 occupant（2）**：`plugin-manager:PluginsPanelIcon`（PANEL_ID, order 0）（src/client.index.js:147）、`schedule:TaskManagerIcon`（PANEL_ID, order 10）（src/client.index.js:223）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:36`

#### `sidebar.panellist.actions`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar/PanelMoreMenu` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:114`
- **DOM 位置**：`PanelMoreMenu`：面板列表 "…" 菜单的菜单项。
- **官方 occupant（1）**：`entry-customization:EntryMenuContent`（entry-customization）（src/client.index.js:57）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:38`

#### `sidebar.session.row.hover`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`workspace/SessionHoverContent` — `docs/reference/extracted/workspace/src/Rows.js:414`
- **DOM 位置**：`SessionHoverContent`：会话行 hover 卡内，"相对时间"与"状态行"之间。
- **官方 occupant（2）**：`schedule:SessionScheduleHover`（schedule-tasks, order 10）（src/client.index.js:270）、`experimental-client-ui-forge:SessionHoverForge`（forge-panel.row）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:163`

#### `sidebar.session.row.leading`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`workspace/SessionNodeItem` — `docs/reference/extracted/workspace/src/Rows.js:605`
- **DOM 位置**：`Rows.js:605` 会话行的 `<span class=".slot">`——16px 单元格，标题左侧；行有状态点时该点占用此格，occupant 只在 idle 行渲染。
- **官方 occupant（2）**：`schedule:SessionScheduleMark`（schedule-mark, order 10）（src/client.index.js:263）、`experimental-liveshare:ViewerForkMarker`（liveshare.fork）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:149`

#### `sidebar.session.row.trailing`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`workspace/SessionNodeItem` — `docs/reference/extracted/workspace/src/Rows.js:631`
- **DOM 位置**：`Rows.js:631` 时间标签之后、pin 标记之前（hover 时整组隐藏）。
- **官方 occupant（1）**：`experimental-client-ui-forge:SessionRowForge`（forge-panel.row）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:158`

#### `sidebar.settings`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:399`
- **DOM 位置**：`SidebarRoot.js:399` `.footArea > .settingsArea`，侧栏脚部设置位。
- **官方 occupant（1）**：`settings-general:SettingsRoot`（src/client.index.js:194）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:51`

#### `sidebar.toggle.badge`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:235`
- **DOM 位置**：`SidebarRoot.js:235`：折叠态展开按钮内、`IconPanelLeftOutlineRegular` 之后（`!wide` 才渲染）。
- **官方 occupant（1）**：`settings-general:DesktopUpdateBadge`（src/client.index.js:66）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:20`

#### `sidebar.workspaces`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`sidebar/SidebarRoot` — `docs/reference/extracted/sidebar/src/SidebarRoot.js:378`
- **DOM 位置**：`SidebarRoot.js:378` `<div class=".regionArea">`，侧栏中部整块浏览区（工作区分组、会话列表、搜索）。
- **官方 occupant（1）**：`workspace:WorkspaceBrowser`（src/client.index.js:319）
- **上游声明**：`packages/client/ui-sidebar/src/client/contract/slots.ts:45`

#### `sidebar.workspaces.directoryFlow`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`workspace/WorkspaceBrowser` — `docs/reference/extracted/workspace/src/WorkspaceBrowser.js:1131`
- **DOM 位置**：`WorkspaceBrowser` 内部，侧栏浏览区下方的目录流程弹层。
- **官方 occupant（2）**：`directory-picker-browse:BrowseDirectoryFlow`（src/client.index.js:163）、`directory-picker-native:NativeDirectoryFlow`（src/client.index.js:26）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:139`

#### `sidebar.workspaces.session.menu.item`  🟡

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`workspace/SessionMenu` — `docs/reference/extracted/workspace/src/SessionMenu.js:11`
- **DOM 位置**：`SessionMenu.js:11`：会话行 "…" 菜单的菜单项（`hookContext` 提供 `[open, setOpen]`）。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:193`

#### `sidebar.workspaces.session.row.action`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`workspace/SessionNodeItem` — `docs/reference/extracted/workspace/src/Rows.js:659`
- **DOM 位置**：`Rows.js` 会话行 hover 末尾 `.rowQuickActions`，位于 "…" 触发按钮之后。
- **官方 occupant（2）**：`workspace:ArchiveSessionRowButton`（archive, order 100）（src/client.index.js:369）、`workspace:PinSessionRowButton`（pin, order 200）（src/client.index.js:376）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:212`

### 4.3 conversation —— 会话与聊天

共 42 个 key。

#### `conversation.approval.detail`  🟡

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`approval/ApprovalFlow` — `docs/reference/extracted/approval/src/ApprovalCard.js:15`
- **DOM 位置**：`ApprovalFlow`：审批卡内、与 tool call 关联的详情区。
- **官方 occupant（1）**：`chat:ApprovalCommand`（src/apply.js:332）
- **上游声明**：`packages/client/ui-approval/src/client/contract/slots.ts:47`

#### `conversation.chat.assistant-actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`chat/TurnTailNodeView` — `docs/reference/extracted/chat/src/TurnTailNodeView.js:38`
- **DOM 位置**：`TurnTailNodeView` `.root`（`data-turn-tail`）：assistant 消息的已定型动作行。
- **官方 occupant（1）**：`message-feedback:MessageFeedbackActions`（feedback, order 10）（src/client.index.js:60）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:493`

#### `conversation.chat.commandview`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`chat/CommandNodeView` — `docs/reference/extracted/chat/src/CommandNodeView.js:10`
- **DOM 位置**：`CommandNodeView` `.callRow`：按命令名分派的命令行。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:475`

#### `conversation.chat.flow`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`chat/ChatView` — `docs/reference/extracted/chat/src/ChatView.js:251`
- **DOM 位置**：`ChatView`：会话行流容器（`.older` 附近），`ChatFlow` 官方 occupant 渲染全部消息行。
- **官方 occupant（1）**：`chat:ChatFlow`（src/apply.js:192）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:431`

#### `conversation.chat.message.images`  🟡

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`chat/AssistantMarkdown` — `docs/reference/extracted/chat/src/AssistantMarkdown.js:74`
- **DOM 位置**：`AssistantMarkdown.js:74`：assistant 消息里连续图片组的位置。
- **官方 occupant（1）**：`attachment:MessageImages`（src/client.index.js:22）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:467`

#### `conversation.chat.node`  ✅

- **契约**：`kind: keyed` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`chat/ChatNodeSeat` — `docs/reference/extracted/chat/src/ChatNodeSeat.js:119`
- **DOM 位置**：`ChatNodeSeat` `.flowItem`：每条消息节点按 `ChatNodeKind` 分派。
- **官方 occupant（18）**：`chat:UserMessageNodeView`（user）（src/register-node-renderers.js:22）、`chat:ContextMessageNodeView`（context）（src/register-node-renderers.js:37）、`chat:TurnTriggerNodeView`（turn-trigger）（src/register-node-renderers.js:42）、`chat:SystemPromptNodeView`（system-prompt）（src/register-node-renderers.js:47）、`chat:AssistantNodeView`（assistant-step）（src/register-node-renderers.js:52）、`chat:CommandNodeView`（command）（src/register-node-renderers.js:72）、`chat:ManualCompactionNodeView`（manual-compaction）（src/register-node-renderers.js:81）、`chat:CompactionNodeView`（compaction）（src/register-node-renderers.js:86） …
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:443`

#### `conversation.chat.reasoning.body`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`chat/ReasoningRow` — `docs/reference/extracted/chat/src/ReasoningRow.js:67`
- **DOM 位置**：`ReasoningRow` `.thinkBody`（`data-text-interaction-source`）：思考内容展开体。
- **官方 occupant（2）**：`chat:DefaultReasoningBody`（src/register-node-renderers.js:18）、`experimental-client-ui-cot-translation:TranslationBody`
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:481`

#### `conversation.chat.text-interaction`  ✅

- **契约**：`kind: keyed` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`chat/ChatView` — `docs/reference/extracted/chat/src/ChatView.js:268`
- **DOM 位置**：`ChatView` `.textInteraction`（`data-text-interaction-surface`）：文本手势浮层。
- **官方 occupant（1）**：`message-quotes:QuoteSelectionAction`（quote）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:428`

#### `conversation.chat.turnTail`  🟡

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`chat/TurnTailNodeView` — `docs/reference/extracted/chat/src/TurnTailNodeView.js:27`
- **DOM 位置**：`TurnTailNodeView`: 已完成 Turn 的动作行之前（`renderSlot` 结果插入 `.root`/`data-turn-tail`）。
- **官方 occupant（4）**：`action-cards:ActionCardTail`（@deepseek-ai/dsh-client-ui-action-cards）（src/mount.js:46）、`deliverables:DeliverablesTail`（@deepseek-ai/dsh-client-ui-deliverables）（src/client.index.js:44）、`plan:PlanCards`（previewId）（src/client.index.js:62）、`schedule:ScheduleTurnCard`（schedule-created, order 20）（src/client.index.js:230）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:487`

#### `conversation.chat.user.before`  🟡

- **契约**：`kind: chain` / `scope: session`
- **accepts**：选举式覆盖（select 返回非 null 即独占）
- **宿主**：`chat/UserStyleBubble` — `docs/reference/extracted/chat/src/MessageItem.js:179`
- **DOM 位置**：`chat/MessageItem` 的 `.userRow`（`data-pending-steering` / `data-submission-echo` / `data-chat-steering-batch`）内、用户消息本体**之前**的消息源装饰位（chain 选举）。
- **官方 occupant（1）**：`experimental-liveshare:SharedSessionOrigin`
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:457`

#### `conversation.chat.user.images`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`chat/UserContent` — `docs/reference/extracted/chat/src/UserContent.js:23`
- **DOM 位置**：`UserContent` `.attachmentRow`（`data-message-attachments`）：用户消息的图片行。
- **官方 occupant（1）**：`attachment:MessageImages`（src/client.index.js:26）
- **上游声明**：`packages/client/ui-chat/src/client/contract/slots.ts:469`

#### `conversation.composer`  🟡

- **契约**：`kind: chain` / `scope: session`
- **accepts**：选举式覆盖（select 返回非 null 即独占）
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:120`
- **DOM 位置**：`conversation/ConversationContent` 的 composer 栈：`renderSlotChain("conversation.composer", …)` 的 winner 直接替换 `.composerStack` 里的 composer 卡（`fallback: composerBar`，`overlay: true`，无 Session 时 `fallbackOnly`）。
- **官方 occupant（4）**：`approval:ApprovalPanel`（src/client.index.js:89）、`subagent:SubagentReadOnlyComposer`（src/client.index.js:65）、`user-questions:QuestionComposer`（src/client.index.js:293）、`cua:ApplicationApproval`
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:283`

#### `conversation.composer.bar`  ✅

- **契约**：`kind: single` / `scope: session-maybe` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:94`
- **DOM 位置**：`ConversationContent`：`hero` 态渲染在 `.heroOptions` 内，普通态渲染创作 composer 卡本体；owner 传 `{variant, disabled, placeholder, blocked…}`。
- **官方 occupant（1）**：`conversation:InputBar`（src/apply.js:470）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:327`

#### `conversation.composer.dock`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:480`
- **DOM 位置**：`InputBar.js:480` `<div class=".dock" data-composer-dock>`，composer 卡下方环境区。
- **官方 occupant（2）**：`chat:ActivityPill`（activity, order 0）（src/apply.js:317）、`chat:UsagePill`（usage, order 1）（src/apply.js:324）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:306`

#### `conversation.header`  ✅

- **契约**：`kind: single` / `scope: session-maybe` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationMainPanel` — `docs/reference/extracted/conversation/src/ConversationMainPanel.js:24`
- **DOM 位置**：`ConversationMainPanel` 顶部 `<div class=".root" data-phase="…">`，常驻（无 Session 也在）。
- **官方 occupant（1）**：`conversation:ConversationHeader`（src/apply.js:415）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:230`

#### `conversation.header.leading`  ✅

- **契约**：`kind: single` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`conversation/ConversationHeader` — `docs/reference/extracted/conversation/src/ConversationHeader.js:20`
- **DOM 位置**：`ConversationHeader.js:20` `<div class=".headerLeading" data-conversation-header-leading>`，标题左侧。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:259`

#### `conversation.hero.agentPreset`  ✅

- **契约**：`kind: single` / `scope: session-maybe` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:86`
- **DOM 位置**：同 `.heroWorkspaceRow` 的 preset 位。
- **官方 occupant（1）**：`agent-preset:AgentPresetSeat`（src/client.index.js:192）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:289`

#### `conversation.hero.brand.mark`  ✅

- **契约**：`kind: single` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`conversation/HeroShell` — `docs/reference/extracted/conversation/src/EmptyHero.js:110`
- **DOM 位置**：`HeroShell`（`EmptyHero.js:110`）标题前的 `.fish` 命中区，owner 传 `{size: 34, className}`。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:287`

#### `conversation.hero.options`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:89`
- **DOM 位置**：同 `.heroWorkspaceRow` 右对齐区（仅在有 Session 时）。
- **官方 occupant（1）**：`experimental-client-ui-forge:WorktreeToggle`（forge-panel.worktree）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:291`

#### `conversation.hero.workspace`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:71`
- **DOM 位置**：`ConversationContent` 的空会话 Hero 行 `.heroWorkspaceRow`。
- **官方 occupant（1）**：`workspace:WorkspacePicker`（src/client.index.js:407）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:285`

#### `conversation.hero.workspace.directoryFlow`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`workspace/WorkspacePicker` — `docs/reference/extracted/workspace/src/WorkspacePicker.js:185`
- **DOM 位置**：`WorkspacePicker` 内部，Hero 选择器下方的目录流程弹层。
- **官方 occupant（2）**：`directory-picker-browse:BrowseDirectoryFlow`（src/client.index.js:159）、`directory-picker-native:NativeDirectoryFlow`（src/client.index.js:22）
- **上游声明**：`packages/client/ui-workspace/src/client/contract/slots.ts:137`

#### `conversation.input.activity`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:375`
- **DOM 位置**：`InputBar.js:375` `.activity` / `.activityExpanded`，模型选择器之后、可横跨工具栏的单个动作位。
- **官方 occupant（1）**：`experimental-client-ui-voice-input:VoiceInput`
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:322`

#### `conversation.input.attachments`  ✅

- **契约**：`kind: single` / `scope: session-maybe` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:295`
- **DOM 位置**：`InputBar` 的 draft 附件轨（拖放目标），`.accessory`。
- **官方 occupant（1）**：`attachment:ComposerAttachments`（src/client.index.js:17）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:332`

#### `conversation.input.dock`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/ConversationContent` — `docs/reference/extracted/conversation/src/ConversationContent.js:116`
- **DOM 位置**：`ConversationContent`：composer 卡上方的全宽条（`renderSlot("conversation.input.dock", zone)`）。
- **官方 occupant（5）**：`conversation:QueueDock`（queue, order 20）（src/QueueDock.js:404）、`conversation:TodoDock`（todo, order 0）（src/TodoPanel.js:107）、`goal:GoalDock`（goal, order 10）（src/client.index.js:59）、`experimental-client-ui-claude-code-mods:Band`（claude-code-mods）、`experimental-client-ui-forge:WorktreeProgress`（forge-panel.worktree）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:296`

#### `conversation.input.left`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:363`
- **DOM 位置**：`InputBar.js:363` `.modes`（权限/计划控件）之后、`trailing` 之前，位于工具行左侧。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:311`

#### `conversation.input.model`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:371`
- **DOM 位置**：`InputBar.js:371` `.standardControls` 内（`conversation.input.right` 之后）。
- **官方 occupant（2）**：`model-selection:ModelSelect`（src/client.index.js:117）、`experimental-liveshare:ViewerModelSeat`
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:353`

#### `conversation.input.model.label`  ✅

- **契约**：`kind: single` / `scope: session`
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`model-selection/ModelSelect` — `docs/reference/extracted/model-selection/src/ModelSelect.js:330`
- **DOM 位置**：`ModelSelect` 的行内标签：trigger / 菜单当前值 / 可选行三处，`renderModelLabel`。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-model-selection/src/client/slots.ts:37`

#### `conversation.input.overlay`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:289`
- **DOM 位置**：`InputBar.js:289` `<div class=".overlayAnchor" data-composer-overlay>`，composer 卡内的浮层锚点。
- **官方 occupant（3）**：`commands:PopupSelectView`（command-popup, order 1）（src/client.index.js:37）、`input-trigger:MenuView`（slash-menu, order 0）（src/client.index.js:32）、`message-feedback:FeedbackDialog`（feedback-dialog, order 2）（src/client.index.js:82）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:301`

#### `conversation.input.permission`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:361`
- **DOM 位置**：`InputBar.js:361` `.modes` 内第一个位置。
- **官方 occupant（2）**：`permission-presets:PermissionSelect`（src/client.index.js:102）、`experimental-liveshare:ViewerPermissionSeat`
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:346`

#### `conversation.input.plan`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:361`
- **DOM 位置**：`InputBar.js:361` `.modes` 内第二个位置（权限之后）。
- **官方 occupant（1）**：`plan:PlanChip`（src/client.index.js:108）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:341`

#### `conversation.input.right`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/InputBar` — `docs/reference/extracted/conversation/src/InputBar.js:371`
- **DOM 位置**：`InputBar.js:371` `.standardControls` 内，提交按钮之前的紧凑控件。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:316`

#### `conversation.plan-review.actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`user-questions/PlanReviewPanel` — `docs/reference/extracted/user-questions/src/PlanReviewPanel.js:66`
- **DOM 位置**：`PlanReviewPanel` 的 `.previewActions`：待审计划的动作行。
- **官方 occupant（1）**：`plan:PlanReviewOpen`（previewId）（src/client.index.js:80）
- **上游声明**：`packages/client/ui-user-questions/src/client/contract/slots.ts:21`

#### `conversation.session`  🟡

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationSessionView` — `docs/reference/extracted/conversation/src/ConversationContent.js:5`
- **DOM 位置**：`ConversationSessionView` 直接 `return renderSlot("conversation.session", {})`；官方 occupant 把内容渲染进 `ConversationContent` 的 `.body`。
- **官方 occupant（1）**：`conversation:ConversationSession`（src/apply.js:377）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:224`

#### `conversation.session.header`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationHeader` — `docs/reference/extracted/conversation/src/ConversationHeader.js:21`
- **DOM 位置**：`ConversationHeader` → `.titleRow`（会话标题/面包屑行）。
- **官方 occupant（1）**：`conversation:ConversationSessionHeader`（src/apply.js:428）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:232`

#### `conversation.session.header.actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/ConversationSessionHeader` — `docs/reference/extracted/conversation/src/ConversationSession.js:182`
- **DOM 位置**：`ConversationSession.js:181` `<div class=".headerActions">`，位于标题/面包屑之后。
- **官方 occupant（4）**：`agent-preset:AgentPresetLabel`（agent-preset, order -10）（src/client.index.js:197）、`jobs:JobListAction`（job-list, order 20）（src/client.index.js:25）、`subagent:SubagentCatalogAction`（subagent-catalog, order 10）（src/client.index.js:58）、`experimental-client-ui-agent-team:TeamAction`（agent-team）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:247`

#### `conversation.session.header.corner`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`conversation/ConversationSessionHeader` — `docs/reference/extracted/conversation/src/ConversationSession.js:190`
- **DOM 位置**：`ConversationSession.js:190` `<div class=".headerCorner" data-conversation-header-corner>`，头部最右角落。
- **官方 occupant（1）**：`sidebar-right:ExpandButton`（src/client.index.js:239）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:270`

#### `conversation.session.header.lineage`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationSessionHeader` — `docs/reference/extracted/conversation/src/ConversationSession.js:174`
- **DOM 位置**：`ConversationSession.js:174` 面包屑中每个祖先 id 之后（`.crumbSep` 分隔符右侧），可替换单个标题节点。
- **官方 occupant（1）**：`subagent:SubagentHeaderLineage`（src/client.index.js:53）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:241`

#### `conversation.session.header.utilities`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/ConversationSessionHeader` — `docs/reference/extracted/conversation/src/ConversationSession.js:186`
- **DOM 位置**：`ConversationSession.js:185` `<div class=".headerUtilities">`，右对齐工具区。
- **官方 occupant（5）**：`open-in-app:SessionOpenInAppAction`（open-in-app, order -10）（src/client.index.js:147）、`schedule:ScheduleCatalogAction`（schedule-catalog, order -5）（src/client.index.js:246）、`experimental-client-ui-forge:HeaderButton`（forge-panel）、`experimental-liveshare:LiveshareShareAction`（liveshare-share）、`session-log-export:SessionLogDownloadHeaderAction`（session-log-download）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:253`

#### `conversation.session.header.views.actions`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/ViewsMoreMenu` — `docs/reference/extracted/conversation/src/ConversationSession.js:33`
- **DOM 位置**：`ViewsMoreMenu`：View 标签行末尾 "…" 菜单的菜单项列表（注册数 >0 时菜单才出现）。
- **官方 occupant（1）**：`entry-customization:EntryMenuContent`（entry-customization）（src/client.index.js:63）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:276`

#### `conversation.trajectory.images`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`trajectory/RecordAttachments` — `docs/reference/extracted/trajectory/src/TrajectoryTable.js:811`
- **DOM 位置**：`TrajectoryTable` 的 `RecordAttachments` `.attachmentRow` 与 `ToolOutputBlocks` `.messageImages`。
- **官方 occupant（1）**：`attachment:MessageImages`（src/client.index.js:30）
- **上游声明**：`packages/client/ui-trajectory/src/client/trajectory-contract.ts:103`

#### `conversation.user.text.node`  🟡

- **契约**：`kind: keyed` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`conversation/UserText` — `docs/reference/extracted/conversation/src/UserText.js:34`
- **DOM 位置**：`UserText.js:34`：用户文本按 JSON 节点切分后逐个内联渲染（keyed by node id）。
- **官方 occupant（8）**：`conversation:PlainUserText`（text）（src/apply.js:89）、`conversation:SessionReference`（session）（src/apply.js:94）、`goal:GoalCommandReference`（command）（src/client.index.js:32）、`reference:FileReference`（file）（src/client.index.js:36）、`reference:FolderReference`（folder）（src/client.index.js:49）、`secret-mask:SecretText`（secret）（src/client.index.js:26）、`skill:SkillReference`（skill）（src/client.index.js:143）、`message-quotes:QuotedUserText`（quote）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:214`

#### `conversation.view`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`conversation/DefaultConversationViews` — `docs/reference/extracted/conversation/src/DefaultConversationViews.js:28`
- **DOM 位置**：`DefaultConversationViews` → `.viewArea`，一次只渲染一个 View。
- **官方 occupant（3）**：`chat:ChatView`（chat, order 0）（src/apply.js:214）、`trajectory:TrajectoryView`（trajectory, order 10）（src/client.index.js:56）、`experimental-client-ui-stats:StatsView`（stats）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:278`

### 4.4 settings —— 设置面板

共 13 个 key。

#### `settings.action`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-general/SettingsPanel` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:103`
- **DOM 位置**：`.actions`：内容列标题栏、Close 之前。
- **官方 occupant（1）**：`settings-general:SettingsDocumentAction`（open-document, order 0）（src/client.index.js:248）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:39`

#### `settings.close`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`settings-general/SettingsPanel` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:110`
- **DOM 位置**：`.hiddenLabel`：关闭按钮的可视隐藏文案。
- **官方 occupant（1）**：`settings-general:CloseLabel`（src/client.index.js:255）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:45`

#### `settings.general.item`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-general/GeneralSection` — `docs/reference/extracted/settings-general/src/GeneralSection.js:12`
- **DOM 位置**：`GeneralSection` `.section`：General 设置页里可叠加的偏好行。
- **官方 occupant（12）**：`chat:LinkOpeningRow`（link-opening, order 17）（src/apply.js:112）、`chat:PerformanceUsageRow`（performance-usage, order 30）（src/apply.js:147）、`chat:TranscriptViewRow`（transcript-view, order 12）（src/apply.js:159）、`conversation:EnterBehaviorRow`（composer-enter, order 20）（src/apply.js:116）、`permission-presets:PermissionRow`（permission, order -20）（src/client.index.js:95）、`settings-general:DeveloperToolsRow`（developer-tools, order 15）（src/client.index.js:28）、`settings-general:CurrentVersionRow`（current-version, order 100）（src/client.index.js:44）、`settings-session-log:UploadRow`（namespace, order 90）（src/client.index.js:39） …
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:100`

#### `settings.header`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`settings-general/SettingsPanel` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:62`
- **DOM 位置**：`.navTitle`（面板标题文案），`aria-labelledby` 指向该节点。
- **官方 occupant（1）**：`settings-general:HeaderContent`（src/client.index.js:244）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:33`

#### `settings.launcher`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`settings-general/SettingsRoot` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:214`
- **DOM 位置**：`SettingsRoot.js:214` `.triggerRow`（rail 态 `.railRow`）内，owner 传 `{wide, settingsOpen, openSettings…}`。
- **官方 occupant（1）**：`settings-account:AccountMenu`（src/client.index.js:378）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:17`

#### `settings.models.footer`  🟡

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-models/Loaded` — `docs/reference/extracted/settings-models/src/ModelsSection.js:568`
- **DOM 位置**：`ModelsSection.js:568`：provider 列表与"添加"控件之后。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-settings-models/src/client/slot-contract.ts:40`

#### `settings.models.provider-card`  🟡

- **契约**：`kind: keyed` / `scope: root`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`settings-models/Loaded` — `docs/reference/extracted/settings-models/src/ModelsSection.js:333`
- **DOM 位置**：`ModelsSection.js:333`：每张 provider 卡片的适配扩展区。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-settings-models/src/client/slot-contract.ts:33`

#### `settings.models.sign-in`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`settings-models/DeepSeekOnboardingDialog` — `docs/reference/extracted/settings-models/src/DeepSeekOnboardingDialog.js:88`
- **DOM 位置**：`DeepSeekOnboardingDialog` 凭据编辑器之前的登录选项。
- **官方 occupant（1）**：`settings-account:AccountOnboarding`（src/client.index.js:351）
- **上游声明**：`packages/client/ui-settings-models/src/client/slot-contract.ts:35`

#### `settings.onboarding`  🟡

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-general/SettingsRoot` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:268`
- **DOM 位置**：`SettingsRoot.js:268` 根级：一次挂载一个 onboarding 步骤（自绘 modal chrome）。
- **官方 occupant（2）**：`settings-models:WelcomeNotice`（welcome-notice, order -100）（src/client.index.js:111）、`settings-models:DeepSeekOnboardingDialog`（deepseek-official, order 0）（src/client.index.js:117）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:85`

#### `settings.plugins.tab`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-plugins/PluginsSettingsSection` — `docs/reference/extracted/settings-plugins/src/PluginsSettingsSection.js:37`
- **DOM 位置**：`PluginsSettingsSection` 的 `.panel`：Plugins 设置页内的标签页内容。
- **官方 occupant（1）**：`settings-plugin-inventory:PluginInventorySettingsTab`（all, order 10）（src/client.index.js:46）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:74`

#### `settings.section`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`settings-general/SettingsPanel` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:116`
- **DOM 位置**：`SettingsPanel` 内容列，按注册顺序平铺各 section 页。
- **官方 occupant（5）**：`agent-preset:AgentPresetSection`（agent-presets, order 20）（src/client.index.js:245）、`settings-account:AccountSection`（account, order -10）（src/client.index.js:386）、`settings-general:GeneralSection`（general, order 0）（src/client.index.js:259）、`settings-models:ModelsSection`（models, order 10）（src/client.index.js:94）、`settings-plugins:PluginsSettingsSection`（plugins, order 15）（src/client.index.js:60）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:57`

#### `settings.section.icon`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`settings-general/SettingsPanel` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:85`
- **DOM 位置**：`SettingsRoot.js:85` `<span class=".navIcon" aria-hidden>` 内，owner 传 `{size: 16, active}`，并按 `only: row.id` 过滤。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:65`

#### `settings.trigger`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`settings-general/SettingsRoot` — `docs/reference/extracted/settings-general/src/SettingsRoot.js:240`
- **DOM 位置**：`SettingsRoot.js:240` 设置按钮的 children（按钮 chrome 由 shell 绘制），owner 传 `{wide}`。
- **官方 occupant（1）**：`settings-general:TriggerContent`（src/client.index.js:240）
- **上游声明**：`packages/client/ui-settings/src/client/contract/slots.ts:27`

### 4.5 plugins —— 插件管理页

共 9 个 key。

#### `plugins.add.actions`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`plugin-manager/AddPluginMenu` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:88`
- **DOM 位置**：`AddPluginMenu` 的菜单行（72px 高，两行描述）。
- **官方 occupant（1）**：`agent-preset:CreatePluginMenuItem`（create-plugin）（src/client.index.js:210）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:118`

#### `plugins.bundle.activation`  ✅

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`plugin-manager/PluginManagerPage` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:2272`
- **DOM 位置**：`PluginManagerPage`：启用某个 bundle 后出现的引导区（按包名 key）。
- **官方 occupant（2）**：`experimental-client-ui-voice-input:VoiceSetupPrompt`（@deepseek-ai/dsh-experimental-voice-input-bundle）、`cua:PermissionSetup`（@deepseek-ai/dsh-cua-bundle）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:126`

#### `plugins.bundle.config`  ✅

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`plugin-manager/PackageDetail` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:914`
- **DOM 位置**：`PackageDetail` `.detailSection`：bundle 描述与行列表之间。
- **官方 occupant（3）**：`experimental-client-ui-cot-translation:TranslationSettings`（@deepseek-ai/dsh-experimental-cot-translation-bundle）、`experimental-client-ui-voice-input:VoicePreparation`（@deepseek-ai/dsh-experimental-voice-input-bundle）、`cua:PermissionPanel`（@deepseek-ai/dsh-cua-bundle）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:142`

#### `plugins.detail.actions`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`plugin-manager/ItemDetail` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:666`
- **DOM 位置**：`ItemDetail`/`RowDetail`/`PackageDetail` 的 `.detailActions`：标题右侧、switch/uninstall 之前。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:156`

#### `plugins.detail.badge`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`plugin-manager/ItemDetail` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:676`
- **DOM 位置**：`ItemDetail`/`RowDetail` 的 `.titleRow` 内 `<h3 class=".detailTitle">` 之后；`PackageDetail` 的 `.statusTag` 旁。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:161`

#### `plugins.detail.section`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`plugin-manager/ItemDetail` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:691`
- **DOM 位置**：详情页主体内容之后的附加区块（`.detailSection`/`.detailSections`）。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:168`

#### `plugins.item`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`plugin-manager/ItemCard` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:621`
- **DOM 位置**：`ItemCard` 的 description（`{view:"summary"}`）与 `ItemDetail` 的页面主体（`{view:"page"}`），按 `only: item.id` 过滤。
- **官方 occupant（4）**：`settings-agent-loop:AgentLoopCard`（agent-loop, order 30）（src/client.index.js:38）、`settings-shell:ShellCard`（shell, order 40）（src/client.index.js:41）、`settings-subagent:SubagentCard`（subagent, order 10）（src/client.index.js:61）、`settings-web-search:WebSearchCard`（web-search, order 20）（src/client.index.js:51）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:136`

#### `plugins.row.config`  ✅

- **契约**：`kind: keyed` / `scope: root`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`plugin-manager/RowDetail` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:747`
- **DOM 位置**：`RowDetail`：单个 patch 行的配置（key = `<pkg>#<rowId>`）。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:150`

#### `plugins.tab`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`plugin-manager/PluginManagerPage` — `docs/reference/extracted/plugin-manager/src/PluginManagerPage.js:2128`
- **DOM 位置**：`PluginManagerPage` 的 `.tabPanel`：Installed 之后的标签页。
- **官方 occupant（1）**：`plugin-market:DiscoverSection`（discover）（src/client.index.js:52）
- **上游声明**：`packages/client/ui-plugin-manager/src/client/slot-contract.ts:124`

### 4.6 tool —— 工具视图与调用

共 3 个 key。

#### `tool.call.images`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`tool/ToolRow` — `docs/reference/extracted/tool/src/ToolRow.js:170`
- **DOM 位置**：`ToolRow` `.imageBody`：已结算的图片型工具调用的图库。
- **官方 occupant（1）**：`attachment:MessageImages`（src/client.index.js:34）
- **上游声明**：`packages/client/ui-tool/src/client/contract/slots.ts:41`

#### `tool.call.toolview`  ✅

- **契约**：`kind: keyed` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`tool/ToolCall` — `docs/reference/extracted/tool/src/ToolCallTree.js:52`
- **DOM 位置**：`ToolCall` → `.callRow`（`data-chat-call-id`）：按 wire name 分派的具体工具视图。
- **官方 occupant（15）**：`action-cards:ProposeRow`（propose_action）（src/mount.js:60）、`cordis:CordisDefineRow`（cordis_define）（src/client.index.js:119）、`cordis:CordisRunRow`（cordis_run）（src/client.index.js:125）、`cordis:CordisActionRow`（cordis_stop）（src/client.index.js:149）、`deliverables:PresentRow`（present）（src/client.index.js:70）、`skill:SkillRow`（skill）（src/client.index.js:31）、`tool:AskQuestionRow`（ask_user_question）（src/ask-question-row.js:288）、`tool:BashRow`（bash）（src/bash-sample.js:149） …
- **上游声明**：`packages/client/ui-tool/src/client/contract/slots.ts:23`

#### `tool.view.cordis`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`cordis/StartedCordisRunRow` — `docs/reference/extracted/cordis/src/CordisRunRow.js:114`
- **DOM 位置**：`StartedCordisRunRow` `.business`（`data-cordis-business-view`）：`cordis_run` 卡片内的 Package 自有交互区。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/extensions/ui-cordis/src/client/slots.ts:31`

### 4.7 contextMenu —— 右键菜单

共 2 个 key。

#### `contextMenu.content`  🟡

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`context-menu/MenuOverlay` — `docs/reference/extracted/context-menu/src/View.js:46`
- **DOM 位置**：`MenuOverlay` 的 children：菜单顶部由 target 决定的 React 行（`{target, dismiss}`）。
- **官方 occupant（2）**：`sidebar-right:TabMenuContent`（tab）（src/client.index.js:97）、`workspace:SessionMenu`（session）（src/client.index.js:349）
- **上游声明**：`packages/client/ui-context-menu/src/client/index.ts:34`

#### `contextMenu.icon`  🟡

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：叶子图标 / 只读小标记（宿主给固定尺寸位）
- **宿主**：`context-menu/menuEntries` — `docs/reference/extracted/context-menu/src/View.js:20`
- **DOM 位置**：`MenuOverlay` → `menuEntries()` 每条菜单项：当 action.icon 存在时按 `icon.key` 取图标（`entryKey`）。
- **官方 occupant（4）**：`file-actions:Icon`（src/client.index.js:38）、`open-in-app:ContextMenuApplicationIcon`（open-in-app.application）（src/client.index.js:54）、`sidebar-right:_deepseek_ai_dsh_client_ui_primitives.IconCloseOutlineRegular`（src/client.index.js:53）、`sidebar-right:IconCloseOutlineRegular`（sidebar.close）
- **上游声明**：`packages/client/ui-context-menu/src/client/index.ts:32`

### 4.8 rightbar —— 右侧栏（sidebar.right.* 共 12 个）

共 12 个 key。

#### `sidebar.right.pane.tab`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-right/TabSlot` — `docs/reference/extracted/sidebar-right/lib/client.js`
- **DOM 位置**：`sidebar-right/TabSlot` → `<div class=".tabBody" data-sidebar-right-tab="<tabId>" data-sidebar-right-occurrence>`；keyed，`entryKey = 该 tab 类型定义的 id`。
- **官方 occupant（13）**：`deliverables:ReviewTab`（src/client.index.js:77）、`plan:PlanPreview`（src/client.index.js:99）、`schedule:ScheduleTaskTab`（src/client.index.js:177）、`sidebar-browser:BrowserBody`（src/client.index.js:88）、`sidebar-documentpreview:TextPreview`（src/client.index.js:46）、`sidebar-files:FilesBody`（src/client.index.js:167）、`sidebar-right:GuideBody`（src/client.index.js:261）、`sidebar-terminal:LazyTerminalBody`（src/client.index.js:136） …
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:59`

#### `sidebar.right.pane.tab.title`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-right/TabSlot` — `docs/reference/extracted/sidebar-right/lib/client.js`
- **DOM 位置**：`sidebar-right/TabSlot` → `<span class=".tabTitle" data-sidebar-right-tab="<tabId>">`；与 body 同 key，渲染 tab chip / 浮动面板标题。
- **官方 occupant（9）**：`plan:PlanTitle`（src/client.index.js:104）、`schedule:ScheduleTaskTabTitle`（src/client.index.js:187）、`sidebar-browser:BrowserTitle`（src/client.index.js:109）、`sidebar-documentpreview:TextTitle`（src/client.index.js:76）、`sidebar-files:FilesTitle`（src/client.index.js:178）、`sidebar-right:GuideTitle`（src/client.index.js:283）、`sidebar-terminal:TerminalTitle`（src/client.index.js:145）、`experimental-client-ui-forge:ForgeTabTitle` …
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:73`

#### `sidebar.right.tab.document`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-documentpreview/TextPreview` — `docs/reference/extracted/sidebar-documentpreview/src/TextPreview.js:420`
- **DOM 位置**：`TextPreview`：右侧栏文档预览正文，按实现 id 分派。
- **官方 occupant（8）**：`sidebar-documentpreview:CodeBody`（src/client.code.index.js:28）、`sidebar-documentpreview:LazyExcelBody`（src/client.excel.index.js:36）、`sidebar-documentpreview:HtmlBody`（src/client.html.index.js:38）、`sidebar-documentpreview:ImageBody`（src/client.image.index.js:62）、`sidebar-documentpreview:MarkdownBody`（src/client.markdown.index.js:38）、`sidebar-documentpreview:OfficeBody`（src/client.office.index.js:52）、`sidebar-documentpreview:LazyPdfBody`（src/client.pdf.index.js:37）、`sidebar-documentpreview:TextBody`（src/client.text.index.js:26）
- **上游声明**：`packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:51`

#### `sidebar.right.tab.document.action`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-documentpreview/TextPreview` — `docs/reference/extracted/sidebar-documentpreview/src/TextPreview.js:365`
- **DOM 位置**：`TextPreview` 头部、reload 按钮之前的渲染器专属控件。
- **官方 occupant（1）**：`sidebar-documentpreview:OfficeFontAction`（src/client.office.index.js:43）
- **上游声明**：`packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:87`

#### `sidebar.right.tab.document.actions`  🟡

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar-documentpreview/TextPreview` — `docs/reference/extracted/sidebar-documentpreview/src/TextPreview.js:242`
- **DOM 位置**：`TextPreview.js:242`：文档预览头部工具栏（已知 Host 路径后）。
- **官方 occupant（1）**：`open-in-app:OpenPathAction`（open-in-app）（src/client.index.js:168）
- **上游声明**：`packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:66`

#### `sidebar.right.tab.document.office.pdf`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-documentpreview/OfficeBody` — `docs/reference/extracted/sidebar-documentpreview/src/OfficeBody.js:68`
- **DOM 位置**：`OfficeBody` `.body`：Office 转 PDF 后的呈现。
- **官方 occupant（1）**：`sidebar-documentpreview:LazyPdfBody`（src/client.office.index.js:70）
- **上游声明**：`packages/client/ui-sidebar-documentpreview/src/client/office/OfficeBody.tsx:19`

#### `sidebar.right.tab.document.unpreviewable`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar-documentpreview/TextPreview` — `docs/reference/extracted/sidebar-documentpreview/src/TextPreview.js:266`
- **DOM 位置**：`TextPreview` `.emptyLine`：无法预览时的空态动作（Retry 位置）。
- **官方 occupant（1）**：`open-in-app:OpenPathEmptyAction`（open-in-app）（src/client.index.js:174）
- **上游声明**：`packages/client/ui-sidebar-documentpreview/src/client/document/contract.ts:78`

#### `sidebar.right.tab.files.actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar-files/FilesBody` — `docs/reference/extracted/sidebar-files/src/FilesBody.js:108`
- **DOM 位置**：`FilesBody` `.tool`：文件树页 reload 之后的动作。
- **官方 occupant（1）**：`open-in-app:OpenInAppAction`（open-in-app）（src/client.index.js:154）
- **上游声明**：`packages/client/ui-sidebar-files/src/client/index.ts:39`

#### `sidebar.right.tab.guide`  🟡

- **契约**：`kind: chain` / `scope: session`
- **accepts**：选举式覆盖（select 返回非 null 即独占）
- **宿主**：`sidebar-right/GuideBody` — `docs/reference/extracted/sidebar-right/src/GuideBody.js:127`
- **DOM 位置**：`sidebar-right/GuideBody`（`src/GuideBody.js:127`）：右侧栏 Guide 页正文；chain 选举，无 winner 时渲染官方 guide。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:84`

#### `sidebar.right.tab.guide.actions`  ✅

- **契约**：`kind: list` / `scope: root`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar-right/GuideMoreMenu` — `docs/reference/extracted/sidebar-right/src/GuideBody.js:95`
- **DOM 位置**：`GuideMoreMenu`：右侧栏 Guide 页 "More" 菜单行。
- **官方 occupant（1）**：`entry-customization:EntryMenuContent`（entry-customization）（src/client.index.js:69）
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:91`

#### `sidebar.right.tab.guide.entry`  ✅

- **契约**：`kind: keyed` / `scope: session`
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`sidebar-right/GuideBody` — `docs/reference/extracted/sidebar-right/src/GuideBody.js:134`
- **DOM 位置**：`GuideBody` `.entryCell`：某个 provider 的引导卡片。
- **官方 occupant（1）**：`sidebar-terminal:TerminalGuide`（src/client.index.js:124）
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:93`

#### `sidebar.right.tab.menu.item`  🟡

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`sidebar-right/TabMenuContent` — `docs/reference/extracted/sidebar-right/src/TabMenuContent.js:13`
- **DOM 位置**：`TabMenuContent`：右侧栏标签 "…" 菜单末尾的额外项。
- **官方 occupant**：无（该槽留给外部插件）
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:105`

### 4.9 other —— deliverables / workspace / main 子键

共 8 个 key。

#### `deliverables.file.actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`deliverables/Deliverables` — `docs/reference/extracted/deliverables/src/Deliverables.js:116`
- **DOM 位置**：`Deliverables` 文件行/详情：打开文件的动作按钮组。
- **官方 occupant（1）**：`open-in-app:FileRouteAction`（open-in-app）（src/client.index.js:181）
- **上游声明**：`packages/client/ui-deliverables/src/client/file-actions.ts:8`

#### `deliverables.review.file.actions`  ✅

- **契约**：`kind: list` / `scope: session`
- **accepts**：可叠加条目（id 必填，order 升序）
- **宿主**：`deliverables/ReviewTab` — `docs/reference/extracted/deliverables/src/ReviewTab.js:215`
- **DOM 位置**：`ReviewTab` 变更文件页签内的同一组动作（`.tool`）。
- **官方 occupant（1）**：`open-in-app:FileRouteAction`（open-in-app）（src/client.index.js:187）
- **上游声明**：`packages/client/ui-deliverables/src/client/file-actions.ts:21`

#### `main`  ✅

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`layout/MainPanel` — `docs/reference/extracted/layout/src/AppFrame.js:34`
- **DOM 位置**：`AppFrame` → `CenterColumn`（`.centerCol`）→ `<div class=".mainPanel" data-global-panel="…">`，`renderSlot("main", {}, { entryKey: activePanelId ?? "conversation" })` 只有一个 keyed 位。
- **官方 occupant（3）**：`conversation:ConversationPanel`（conversation）（src/apply.js:615）、`plugin-manager:PluginManagerPage`（src/client.index.js:77）、`schedule:TaskManagerPage`（src/client.index.js:196）
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:75`

#### `main.conversation`  🟡

- **契约**：`kind: single` / `scope: session-maybe` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`conversation/ConversationPanel` — `docs/reference/extracted/conversation/src/ConversationPanel.js:10`
- **DOM 位置**：`ui-conversation` 的 `ConversationPanel` 直接 `return renderSlot("main.conversation", {})`，即 `main` 的 `conversation` key 下整块内容。
- **官方 occupant（1）**：`conversation:ConversationRoot`（src/apply.js:304）
- **上游声明**：`packages/client/ui-conversation/src/client/contract/slots.ts:222`

#### `rightbar`  ✅

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`layout/AppFrame` — `docs/reference/extracted/layout/src/AppFrame.js:296`
- **DOM 位置**：`AppFrame` → `RightbarColumn`（`.rightbarCol`，带 `data-rightbar-col`），宽度为 0 时列仍存在但不占轨；全屏态覆盖视口。
- **官方 occupant（1）**：`sidebar-right:RightbarRoot`（src/client.index.js:189）
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:89`

#### `rightbar.session`  ✅

- **契约**：`kind: single` / `scope: session` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`sidebar-right/SessionView` — `docs/reference/extracted/sidebar-right/src/RightbarRoot.js:14`
- **DOM 位置**：`ui-sidebar-right` 的 `SessionView` `.session`（`data-sidebar-right-session`）：右侧栏内由 root 级 rightbar 控制器选中的会话内容。
- **官方 occupant（1）**：`sidebar-right:RightbarSeat`（key）（src/client.index.js:200）
- **上游声明**：`packages/client/ui-sidebar-right/src/client/contract/slots.ts:43`

#### `sidebar`  🟡

- **契约**：`kind: single` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：任意内容；single → 再次注册会遮蔽官方 occupant
- **宿主**：`layout/AppFrame` — `docs/reference/extracted/layout/src/AppFrame.js:239`
- **DOM 位置**：`AppFrame` 的左列 `<div class=".sidebarCol" style="width:…">` 内（drawer 模式下同时渲染 `.drawerMask`）。折叠时该列仍在 DOM 中（`.frame` 的 grid 第一列宽度变化）。
- **官方 occupant（1）**：`sidebar:SidebarRoot`（src/client.index.js:74）
- **上游声明**：`packages/client/ui-layout/src/client/index.ts:70`

#### `workspace.toast`  🟡

- **契约**：`kind: keyed` / `scope: root` / **遮蔽风险：注册即替换官方 UI**
- **accepts**：按 key 的内容（key 必填，同 key 覆盖）
- **宿主**：`workspace/RowActionToast` — `docs/reference/extracted/workspace/src/RowActionToast.js:12`
- **DOM 位置**：`RowActionToast`：会话行动作后的 Toast（`workspace.toast` 按 kind 分派）。
- **官方 occupant（11）**：`workspace:ToastEntry`（src/register.js:23）、`workspace:ArchiveToastEntry`（archived）（src/register.js:113）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'sessionIdCopi…`（sessionIdCopied）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'sessionIdCopy…`（sessionIdCopyFailed）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'pinFailed'>>`（pinFailed）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'unpinFailed'>>`（unpinFailed）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'archivedNotOp…`（archivedNotOpenable）、`workspace:ToastEntry<PropsRuntime<'workspace.toast', 'defaultWorksp…`（defaultWorkspaceFailed） …
- **上游声明**：`packages/client/ui-workspace/src/client/contract/toast.ts:53`

---

## 5. Icon 插槽点（13 个，`kind === "icon"`）

> 这 13 个 key 是 `slots.json` 里 `kind: "icon"` 的**全集**，也是"用 Icon* 插入对应图标位"的落点依据。
> 尺寸来源分两档：**宿主给定**（代码里写死 `size:`，✅ 已取证）/ **推荐值**（按同级官方图标推断，🟡）。

| # | key | 宿主组件（文件:行） | DOM 插入位置 | 能插什么 / owner props | 官方 occupant | 推荐 Icon* 尺寸 |
| --- | --- | --- | --- | --- | --- | --- |
| 1 | `contextMenu.icon` | `context-menu / MenuOverlay` | 菜单行 `MenuItemButton` 的 `icon` 属性位（菜单项最左侧 glyph） | ContextMenuIcon = { key: string; src?: string }；`entryKey = icon.key` | file-actions:Icon、open-in-app:Icon、open-in-app:ContextMenuApplicationIcon（key `open-in-app.application`）、sidebar-right:IconCloseOutlineRegular（key `sidebar.close`）、workspace:Icon | **16** |
| 2 | `conversation.header.leading` | `conversation / ConversationHeader` | `<div class="headerLeading" data-conversation-header-leading>` —— 会话头部最左、标题/面包屑之前 | ConversationHeaderLeadingOwnerProps（`children?: never`，无专属 props） | 无（当前空置，仅官方允许插件占用） | **18**（🟡 推断：与 `sidebar` 折叠按钮 `size: 18` 同级） |
| 3 | `conversation.hero.brand.mark` | `conversation / HeroShell` | 空白会话 Hero 标题**之前**的 `.fish` 命中区 | HeroBrandMarkOwnerProps = { size: 34; className?: string }（**宿主已固定传 34**） | 无（官方 build 仍用内置动画鱼 fallback） | **34**（宿主给定，不可改） |
| 4 | `conversation.session.header.corner` | `conversation / ConversationSessionHeader` | `<div class="headerCorner" data-conversation-header-corner>` —— 头部最右角，越过 utilities 进入 padding 区 | ConversationHeaderCornerOwnerProps（`children?: never`） | sidebar-right:ExpandButton（右侧栏展开按钮） | **16**（🟡 推断：角落单控件，视觉小于 utilities） |
| 5 | `plugins.detail.badge` | `plugin-manager / ItemDetail、RowDetail、PackageDetail` | 详情页 `.titleRow` 内 `<h3 class="detailTitle">` **之后**（版本/beta/问题标签之后） | PluginDetailProps = { subject: PluginsSubject } | 无（官方不注册） | **非图标位**：徽标/Tag（建议 `size: 12` 图标 + `Tag` 组件，或纯文本徽标） |
| 6 | `settings.launcher` | `settings-general / SettingsRoot` | 设置侧栏 `.triggerRow`（rail 态 `.railRow`）内 —— 账户/启动器行 | SettingsLauncherOwnerProps（含 `wide`、`settingsOpen`、`openSettings` 等） | settings-account:AccountMenu | **20**（🟡 推断：账户入口带头像，比普通行图标大一号） |
| 7 | `settings.section.icon` | `settings-general / SettingsPanel` | 左侧导航按钮内 `<span class="navIcon" aria-hidden="true">`，按 `only: row.id` 过滤 | SettingsSectionIconOwnerProps = { size: 16; active: boolean }（**宿主固定 16**） | 无（默认用内置 `navIcon(row.id)` glyph） | **16**（宿主给定） |
| 8 | `settings.trigger` | `settings-general / SettingsRoot` | 侧栏脚部设置按钮的 **children**（按钮 chrome、aria、快捷键由 shell 绘制）；rail 态 label 视觉隐藏 | SettingsTriggerOwnerProps = { wide: boolean } | settings-general:TriggerContent（icon + label） | **16**（图标）+ 文案（wide 时可见） |
| 9 | `shell.leading` | `layout / AppFrame` | `<div class="leadingSeat" data-shell-leading>` —— frame 左上角窗口 chrome 位；仅 `drawer` 或 `darwin && sidebarCollapsed` 时挂载，并发布 `--dsh-frame-leading-clearance` | 无（`{}`） | sidebar:HeaderLeadingControls（重开侧栏 / 新会话按钮） | **16**（🟡 推断：与 macOS 交通灯同排，官方 HeaderLeadingControls 用 16） |
| 10 | `sidebar.brand.mark` | `sidebar / SidebarRoot` | ① 折叠 rail：展开按钮内 `<span class="railMark" aria-hidden>`（仅 `!wide && !windowsTitlebar`）；② 展开态：`.brandIdentity > .brandMark` | SidebarBrandMarkOwnerProps = { size: 24 }（**宿主固定 24**） | brand-official:OfficialBrandMark（鱼形）；experimental-liveshare:ViewerBrandMark | **24**（宿主给定） |
| 11 | `sidebar.session.row.leading` | `workspace / SessionNodeItem` | 会话行 `<span class="slot">` —— 标题左侧 **16px 单元格**；行有状态点（pending/新消息/活动）时该点占用此格，occupant 仅在 idle 行渲染；归档行留空 | SessionRowScheduleOwnerProps = { sessionId: SessionId } | schedule:SessionScheduleMark（id `schedule-mark`，order 10）；experimental-liveshare:ViewerForkMarker（id `liveshare.fork`） | **14**（16px 格内留 1px 视觉边距；inline `<span>` 渲染） |
| 12 | `sidebar.session.row.trailing` | `workspace / SessionNodeItem` | 会话行**时间标签之后、pin 标记之前**；hover / 键盘聚焦 / 菜单打开时整组隐藏（hoverless 设备常显） | SessionRowTrailingOwnerProps = { sessionId: SessionId } | experimental-client-ui-forge:SessionRowForge（id `forge-panel.row`） | **12**（与时间标签同级的辅助信息尺寸） |
| 13 | `sidebar.toggle.badge` | `sidebar / SidebarRoot` | 折叠态展开按钮内、`IconPanelLeftOutlineRegular`（size 16/18）**之后**；仅 `!wide` 时渲染 | 无（owner 为空） | settings-general:DesktopUpdateBadge | **非图标位**：通知圆点，建议 6–8px 实心点（或 `8` 的角标容器） |

### 5.1 逐个展开

#### 5.1.1 `contextMenu.icon`

- **宿主**：context-menu / MenuOverlay（经 `menuEntries()` 辅助函数，`src/View.js:20`）
- **DOM 插入位置**：菜单行 `MenuItemButton` 的 `icon` 属性位（菜单项最左侧 glyph）
- **owner props**：ContextMenuIcon = { key: string; src?: string }；`entryKey = icon.key`
- **官方 occupant**：file-actions:Icon、open-in-app:Icon、open-in-app:ContextMenuApplicationIcon（key `open-in-app.application`）、sidebar-right:IconCloseOutlineRegular（key `sidebar.close`）、workspace:Icon
- **推荐尺寸**：**16** —— 菜单行标准图标尺寸（官方 `entry-customization/src/EntryMenuContent.js:26` 即 `size: 16`）
- **证据**：`extracted/context-menu/src/View.js:20`、`extracted/entry-customization/src/EntryMenuContent.js:26`

#### 5.1.2 `conversation.header.leading`

- **宿主**：conversation / ConversationHeader（`src/ConversationHeader.js:20`）
- **DOM 插入位置**：`<div class="headerLeading" data-conversation-header-leading>` —— 会话头部最左、标题/面包屑之前
- **owner props**：ConversationHeaderLeadingOwnerProps（`children?: never`，无专属 props）
- **官方 occupant**：无（当前空置，仅官方允许插件占用）
- **推荐尺寸**：**18**（🟡 推断：与 `sidebar` 折叠按钮 `size: 18` 同级） —— 头部按钮图标与 sidebar toggle 视觉同级；若做成"带文字的按钮"则本体用 `Icon* size 16` + 文案
- **证据**：`extracted/conversation/src/ConversationHeader.js:20`

#### 5.1.3 `conversation.hero.brand.mark`

- **宿主**：conversation / HeroShell（`src/EmptyHero.js:110`）
- **DOM 插入位置**：空白会话 Hero 标题**之前**的 `.fish` 命中区
- **owner props**：HeroBrandMarkOwnerProps = { size: 34; className?: string }（**宿主已固定传 34**）
- **官方 occupant**：无（官方 build 仍用内置动画鱼 fallback）
- **推荐尺寸**：**34**（宿主给定，不可改） —— 宿主 `renderSlot("conversation.hero.brand.mark", { size: 34, className: … })` 把尺寸写死
- **证据**：`extracted/conversation/src/EmptyHero.js:110`

#### 5.1.4 `conversation.session.header.corner`

- **宿主**：conversation / ConversationSessionHeader（`src/ConversationSession.js:190`）
- **DOM 插入位置**：`<div class="headerCorner" data-conversation-header-corner>` —— 头部最右角，越过 utilities 进入 padding 区
- **owner props**：ConversationHeaderCornerOwnerProps（`children?: never`）
- **官方 occupant**：sidebar-right:ExpandButton（右侧栏展开按钮）
- **推荐尺寸**：**16**（🟡 推断：角落单控件，视觉小于 utilities） —— 该位只有一个控件且落在 padding 内，16px 不会撑开头部高度
- **证据**：`extracted/conversation/src/ConversationSession.js:190`

#### 5.1.5 `plugins.detail.badge`

- **宿主**：plugin-manager / ItemDetail、RowDetail、PackageDetail（`src/PluginManagerPage.js:676`、`:735`、statusTag 旁）
- **DOM 插入位置**：详情页 `.titleRow` 内 `<h3 class="detailTitle">` **之后**（版本/beta/问题标签之后）
- **owner props**：PluginDetailProps = { subject: PluginsSubject }
- **官方 occupant**：无（官方不注册）
- **推荐尺寸**：**非图标位**：徽标/Tag（建议 `size: 12` 图标 + `Tag` 组件，或纯文本徽标） —— 与版本号、beta 标签并列，属标签行而非图标按钮
- **证据**：`extracted/plugin-manager/src/PluginManagerPage.js:676`、`:735`

#### 5.1.6 `settings.launcher`

- **宿主**：settings-general / SettingsRoot（`src/SettingsRoot.js:214`）
- **DOM 插入位置**：设置侧栏 `.triggerRow`（rail 态 `.railRow`）内 —— 账户/启动器行
- **owner props**：SettingsLauncherOwnerProps（含 `wide`、`settingsOpen`、`openSettings` 等）
- **官方 occupant**：settings-account:AccountMenu
- **推荐尺寸**：**20**（🟡 推断：账户入口带头像，比普通行图标大一号） —— 该行是"账户头像 + 设置入口"，官方 AccountMenu 自带头像；若只放图标建议 18–20
- **证据**：`extracted/settings-general/src/SettingsRoot.js:214`、`extracted/settings-account/src/client.index.js:378`

#### 5.1.7 `settings.section.icon`

- **宿主**：settings-general / SettingsPanel（`src/SettingsRoot.js:85`）
- **DOM 插入位置**：左侧导航按钮内 `<span class="navIcon" aria-hidden="true">`，按 `only: row.id` 过滤
- **owner props**：SettingsSectionIconOwnerProps = { size: 16; active: boolean }（**宿主固定 16**）
- **官方 occupant**：无（默认用内置 `navIcon(row.id)` glyph）
- **推荐尺寸**：**16**（宿主给定） —— `renderSlot("settings.section.icon", { size: 16, active: … }, { only: row.id, fallback: navIcon(row.id) })`
- **证据**：`extracted/settings-general/src/SettingsRoot.js:85`

#### 5.1.8 `settings.trigger`

- **宿主**：settings-general / SettingsRoot（`src/SettingsRoot.js:240`）
- **DOM 插入位置**：侧栏脚部设置按钮的 **children**（按钮 chrome、aria、快捷键由 shell 绘制）；rail 态 label 视觉隐藏
- **owner props**：SettingsTriggerOwnerProps = { wide: boolean }
- **官方 occupant**：settings-general:TriggerContent（icon + label）
- **推荐尺寸**：**16**（图标）+ 文案（wide 时可见） —— 官方 TriggerContent 即 "icon + label" 组合；absent 时退化为无标签图标按钮
- **证据**：`extracted/settings-general/src/SettingsRoot.js:240`、`extracted/settings-general/src/client.index.js:240`

#### 5.1.9 `shell.leading`

- **宿主**：layout / AppFrame（`src/AppFrame.js:254` 取值，`:313` 挂载）
- **DOM 插入位置**：`<div class="leadingSeat" data-shell-leading>` —— frame 左上角窗口 chrome 位；仅 `drawer` 或 `darwin && sidebarCollapsed` 时挂载，并发布 `--dsh-frame-leading-clearance`
- **owner props**：无（`{}`）
- **官方 occupant**：sidebar:HeaderLeadingControls（重开侧栏 / 新会话按钮）
- **推荐尺寸**：**16**（🟡 推断：与 macOS 交通灯同排，官方 HeaderLeadingControls 用 16） —— 窗口 chrome 按钮区，图标必须压在 16px 以内避免挤占 `--dsh-frame-leading-clearance`
- **证据**：`extracted/layout/src/AppFrame.js:253-255`、`:313-318`；`extracted/sidebar/src/client.index.js:113`

#### 5.1.10 `sidebar.brand.mark`

- **宿主**：sidebar / SidebarRoot（`src/SidebarRoot.js:229` rail 态 `.railMark`；`:273` 展开态 `.brandMark`）
- **DOM 插入位置**：① 折叠 rail：展开按钮内 `<span class="railMark" aria-hidden>`（仅 `!wide && !windowsTitlebar`）；② 展开态：`.brandIdentity > .brandMark`
- **owner props**：SidebarBrandMarkOwnerProps = { size: 24 }（**宿主固定 24**）
- **官方 occupant**：brand-official:OfficialBrandMark（鱼形）；experimental-liveshare:ViewerBrandMark
- **推荐尺寸**：**24**（宿主给定） —— 两处调用点都是 `renderSlot("sidebar.brand.mark", { size: 24 }, { fallback: <FishLogo size={24}/> })`
- **证据**：`extracted/sidebar/src/SidebarRoot.js:229`、`:273`；`extracted/brand-official/src/client.index.js:14`

#### 5.1.11 `sidebar.session.row.leading`

- **宿主**：workspace / SessionNodeItem（`src/Rows.js:605`）
- **DOM 插入位置**：会话行 `<span class="slot">` —— 标题左侧 **16px 单元格**；行有状态点（pending/新消息/活动）时该点占用此格，occupant 仅在 idle 行渲染；归档行留空
- **owner props**：SessionRowScheduleOwnerProps = { sessionId: SessionId }
- **官方 occupant**：schedule:SessionScheduleMark（id `schedule-mark`，order 10）；experimental-liveshare:ViewerForkMarker（id `liveshare.fork`）
- **推荐尺寸**：**14**（16px 格内留 1px 视觉边距；inline `<span>` 渲染） —— 该格与 `.dot`（状态点）同尺寸竞争，超 16 会溢出或被裁；官方 `SessionScheduleMark` 同格内用小图标
- **证据**：`extracted/workspace/src/Rows.js:605`；`extracted/schedule/src/client.index.js`（`sidebar.session.row.leading` + `id: "schedule-mark"`, `order: 10`）

#### 5.1.12 `sidebar.session.row.trailing`

- **宿主**：workspace / SessionNodeItem（`src/Rows.js:631`）
- **DOM 插入位置**：会话行**时间标签之后、pin 标记之前**；hover / 键盘聚焦 / 菜单打开时整组隐藏（hoverless 设备常显）
- **owner props**：SessionRowTrailingOwnerProps = { sessionId: SessionId }
- **官方 occupant**：experimental-client-ui-forge:SessionRowForge（id `forge-panel.row`）
- **推荐尺寸**：**12**（与时间标签同级的辅助信息尺寸） —— 该区是 `.rowResting` 内的次级信息带，图标需小于行主图标（16）
- **证据**：`extracted/workspace/src/Rows.js:631`；`extracted/experimental-client-ui-forge/src/client.index.js`

#### 5.1.13 `sidebar.toggle.badge`

- **宿主**：sidebar / SidebarRoot（`src/SidebarRoot.js:235`）
- **DOM 插入位置**：折叠态展开按钮内、`IconPanelLeftOutlineRegular`（size 16/18）**之后**；仅 `!wide` 时渲染
- **owner props**：无（owner 为空）
- **官方 occupant**：settings-general:DesktopUpdateBadge
- **推荐尺寸**：**非图标位**：通知圆点，建议 6–8px 实心点（或 `8` 的角标容器） —— 官方 DesktopUpdateBadge 是角标点；宿主不传 size，occupant 自绘
- **证据**：`extracted/sidebar/src/SidebarRoot.js:235`

### 5.2 准图标位（在 `slots.json` 里被归为 `content`，语义上就是"图标按钮"）

这 9 个不是 `kind: "icon"`，但它们的**官方 occupant 全都是单个图标/图标按钮**，做 Icon* 注入时应当同等对待；它们同时是 `list` 或 `single`，能叠加多个。

| key | 声明 kind | 宿主 | DOM 位置 | 官方 occupant 形态 | 建议 Icon* 尺寸 |
| --- | --- | --- | --- | --- | --- |
| `sidebar.panellist` | list | `sidebar/SidebarRoot`（`src/SidebarRoot.js:63`） | 面板按钮内 `.panelGlyph`（`aria-hidden` span）；owner `{size: wide?16:18, active}` | 单个 glyph（plugin-manager:PluginsPanelIcon、schedule:TaskManagerIcon） | **16**（wide）/ **18**（rail）——宿主给定 |
| `sidebar.footer.action` | list | `sidebar/SidebarRoot`（`:396`） | `.footArea > .footerActions`，Settings 旁；owner `{wide}` | 图标按钮（cordis:CordisPanel id `cordis-panel`） | **16** |
| `sidebar.workspaces.session.row.action` | list | `workspace/SessionNodeItem`（`Rows.js`） | 会话行 hover 末尾 `.rowQuickActions`（"…" 之后） | 图标按钮（workspace:ArchiveSessionRowButton、PinSessionRowButton） | **14**（行内小按钮） |
| `conversation.session.header.actions` | list | `conversation/ConversationSessionHeader`（`ConversationSession.js:181`） | `.headerActions`（标题后） | 图标按钮（agent-preset、jobs、subagent…） | **16** |
| `conversation.session.header.utilities` | list | 同上（`:185`） | `.headerUtilities`（右对齐工具区） | 图标按钮（open-in-app、schedule、forge…） | **16** |
| `conversation.input.left` | list | `conversation/InputBar`（`InputBar.js:363`） | `.modes` 之后、工具行左侧 | 当前无官方 occupant | **16** |
| `conversation.input.right` | list | `conversation/InputBar`（`:371`） | `.standardControls` 内、提交按钮前 | 当前无官方 occupant | **16** |
| `conversation.input.activity` | single | `conversation/InputBar`（`:375`） | `.activity` / `.activityExpanded`（模型选择器之后，可横跨工具栏） | 语音输入按钮（voice-input:VoiceInput） | **16**（横跨态可 18） |
| `conversation.hero.options` | list | `conversation/ConversationContent` | 新会话行 `.heroWorkspaceRow` 右对齐 | forge:WorktreeToggle | **16** |

### 5.3 可直接使用的官方 Icon*（`@deepseek-ai/dsh-client-ui-primitives`）

官方 UI 共引用 **98 个** `Icon<Name>OutlineRegular / FillRegular` 组件（清单见 `docs/reference/extracted/primitives/src/`，逐个包扫描得到）。常用：

`IconPlusOutlineRegular`、`IconCloseOutlineRegular`、`IconChevronDownOutlineRegular`、`IconChevronRightOutlineRegular`、`IconSearchOutlineRegular`、`IconSettingsOutlineRegular`、`IconPanelLeftOutlineRegular`、`IconEllipsisOutlineRegular`、`IconNewChatOutlineRegular`、`IconBranchOutlineRegular`、`IconClockOutlineRegular`、`IconArchiveOutlineRegular`、`IconCheckOutlineRegular`、`IconCopyOutlineRegular`、`IconRefreshOutlineRegular`、`IconInfoOutlineRegular`、`IconGlobeOutlineRegular`、`IconCodeOutlineRegular`。

调用形状（✅ 取自官方代码）：`<IconPlusOutlineRegular size={16} />` —— 唯一常用 prop 是 `size`（数字，px），部分组件支持 `className`。

---

## 6. 对接 Puck 的落地建议

1. **一个 slot = 一个 DropZone**，但 `keyed` 槽要按 key 拆成多个 DropZone（例如 `main` 的 `conversation` / `plugins` / `files`…，`conversation.chat.node` 的每个 `ChatNodeKind`）。
2. **`single` 槽要在 UI 上标注"放入将替换官方 UI"**：官方 `root`、`sidebar`、`rightbar`、`conversation.chat.flow` 等 `single` 槽的 `replaceRisk` 就是 `shadows-shipped-ui`；`priority` 低者胜，插件默认注册会直接顶掉官方 occupant。
3. **`inline: true` 的 6 个槽必须按 inline 渲染**（`<span>`），否则在 `<p>`/行内上下文中会产生块级盒子破坏排版：`contextMenu.icon`、`conversation.input.model.label`、`conversation.user.text.node`、`settings.section.icon`、`sidebar.session.row.leading`、`sidebar.session.row.trailing`。
4. **会话行左侧 Icon 的约束**（需求原话"会话项左边"）：
   - 目标槽 = `sidebar.session.row.leading`（`list` + `inline` + `order` 排序）；
   - 只在 **idle 行**渲染：行有 pending/新消息/活动状态时被状态点替换，归档行整格留空（这是官方行为，不是 bug）；
   - 尺寸上限 16px（该格是 16px 单元格），建议 Icon* `size={14}`；
   - owner 只给 `{ sessionId }`，occupant 要自己按 id 取数据（**不要**在 occupant 里绑定/持有 session）。
5. **`shell.overlay` 才是全局浮层的正确落点**（`list`、可叠加、默认 click-through），不要在 `root` 上注册。
6. **`session` / `session-maybe` 作用域**：`session` 槽在没有 Session 绑定时宿主会抛 `SlotAssemblyError`，Puck 侧渲染预览时要么提供 session 适配器、要么跳过这些区域；`session-maybe` 可安全渲染但 occupant 拿不到 session。

---

## 附录 A：`renderSlotChain` 与动态 seat 的 6 个 key（早期 103-key 快照漏收，现已并入 slots.json）

早期版本 `scripts/extract-slots.mjs` 只匹配字面量 `renderSlot("…")`，漏掉两类：① `renderSlotChain(...)`；② 动态 seat key（`renderSlot(seat, …)`）。当前 `slots.json` 已补齐这 6 个（109 条），此处保留逐一说明，因为它们的**语义**（chain 选举 / keyed seat）与普通 `single` 槽不同，映射 DropZone 时不能同等对待。

| key | 声明 kind / scope | 宿主（文件:行） | 为什么被漏掉 | 官方 occupant |
| --- | --- | --- | --- | --- |
| `conversation.composer` | chain / session | `conversation/ConversationContent`（`src/ConversationContent.js:120`） | 用 `renderSlotChain(...)` | subagent:SubagentReadOnlyComposer（`priority: -10`, `select: selectReadOnlySubagent`） |
| `conversation.chat.user.before` | chain / session | `chat/UserStyleBubble`（`src/MessageItem.js:179`） | 用 `renderSlotChain(...)` | experimental-liveshare:SharedSessionOrigin |
| `shell.quota-notice` | chain / root | `chat/QuotaNoticeHost`（`src/QuotaNoticeHost.js:22`） | 用 `renderSlotChain(...)` | settings-account（`select: owner => owner.code === "ACCOUNT_QUOTA" ? owner : null`） |
| `sidebar.right.pane.tab` | keyed / session | `sidebar-right/TabSlot`（`lib/client.js` 的 `renderSlot(seat, {}, { entryKey, fallback, hookContext })`） | **动态 seat key**，字面量扫描看不到 | plan:PlanPreview、sidebar-terminal、sidebar-browser、sidebar-files、sidebar-documentpreview、subagent、deliverables、schedule…（共 14 处注册） |
| `sidebar.right.pane.tab.title` | keyed / session | 同上（`seat === "sidebar.right.pane.tab.title"` 分支渲染 `.tabTitle`） | 同上 | plan:PlanTitle、sidebar-browser:BrowserTitle…（共 10 处注册） |
| `sidebar.right.tab.guide` | chain / session | `sidebar-right/GuideBody`（`src/GuideBody.js:127`） | 用 `renderSlotChain(...)`/select 形态 | 官方内置 guide 为 fallback |

----

## 附录 B：与 `slots.json` 的口径差异（不改文件，仅说明）

| 项 | `slots.json` 现状 | 本文件采用的口径 | 影响 |
| --- | --- | --- | --- |
| key 全集 | 109（含 `renderSlotChain` 与动态 seat） | 109（完全一致） | 无需补差 |
| `occupants` 字段 | 写入的是**读取者（调用 `renderSlot` 的包）**，如 `contextMenu.icon` → `["context-menu"]`（那是宿主 ui-context-menu） | 本文件用「宿主 host」= 读取者；「occupant」= 真正 `ctx.slots.register` 的包 | 直接把 `occupants` 当"谁占了这个槽"会误判（两者恰好相反的语义） |
| `kind` | `icon` / `content` 二分 | 另给声明 kind（`single/keyed/list/chain`）与运行时 scope（`root/session/session-maybe`） | Puck 需要声明 kind 才能决定单槽/多区域 |
| `scope` | 9 个域（conversation / sidebar / rightbar / settings / plugins / frame / tool / contextMenu / other） | 另给运行时 scope（root/session/session-maybe）+ 声明 kind | 域是导航分组，运行时 scope 才是渲染约束，勿混用 |

----

## 附录 C：部分取证清单（🟡：已执行但未验证）

共 23 条：**调用点（文件:行）已取证**，但插槽落点无法从紧邻的 className / data-* 直接确认，只能靠父组件结构与上下文推断。

原因：`http://127.0.0.1:3080` 需要鉴权（直接请求返回 `dsh web authentication required`），本次**未能抓取运行态 DOM** 交叉验证。补齐方式（拿到鉴权后）：

```js
// 对每个 key 执行，把 parentElement 的 className/data-* 记回本文即可升级为 ✅
document.querySelector('[data-slot="<key>"]')?.parentElement
```

清单：

`contextMenu.content`、`contextMenu.icon`、`conversation.approval.detail`、`conversation.chat.message.images`、`conversation.chat.turnTail`、`conversation.chat.user.before`、`conversation.composer`、`conversation.session`、`conversation.user.text.node`、`main.conversation`、`root`、`settings.models.footer`、`settings.models.provider-card`、`settings.onboarding`、`shell.leading`、`shell.overlay`、`shell.quota-notice`、`sidebar`、`sidebar.right.tab.document.actions`、`sidebar.right.tab.guide`、`sidebar.right.tab.menu.item`、`sidebar.workspaces.session.menu.item`、`workspace.toast`

**其中下列 9 条实际上已被人工逐行确认**（读的是 `AppFrame.js` / `ConversationContent.js` 的完整 JSX 树，不是猜的），只是缺一个 className 级锚点，按 ✅ 对待：`root`、`sidebar`、`shell.overlay`、`shell.leading`、`main.conversation`、`conversation.session`、`conversation.composer`、`conversation.chat.user.before`、`shell.quota-notice`。

真正只剩结构推断的是这 14 条：`contextMenu.content`、`contextMenu.icon`、`conversation.approval.detail`、`conversation.chat.message.images`、`conversation.chat.turnTail`、`conversation.user.text.node`、`settings.models.footer`、`settings.models.provider-card`、`settings.onboarding`、`sidebar.right.tab.document.actions`、`sidebar.right.tab.guide`、`sidebar.right.tab.menu.item`、`sidebar.workspaces.session.menu.item`、`workspace.toast`。

----
## 附录 D：**不是** slot 的扩展点（必须区分，避免做成假 DropZone）

| 扩展点 | 包 | 形态 | 为什么不是 slot |
| --- | --- | --- | --- |
| `ctx.contextMenus.register(...)` | `ui-context-menu` | cordis 服务上的数据注册表（菜单项数据） | 数据驱动；只有**渲染**走 `contextMenu.content` / `contextMenu.icon` 两个 slot |
| `ctx.sidebarRightTabs`（`SidebarRightTabRegistry`） | `ui-sidebar-right` | tab **类型**注册表（两阶段注册的第一阶段） | 类型不是 UI；tab body 的渲染才走 `sidebar.right.pane.tab` |
| `ctx.sidebarRight`（`SidebarRightController`） | `ui-sidebar-right` | 导航/展示控制器（openTab/close…） | 命令式 API，无渲染位 |
| `ctx.layout` | `ui-layout` | 面板导航与几何动作 | 同上 |
| React `children` 位（如 composer 内部、SettingsPanel 内部各处） | 各包 | 普通 props | 没有 `data-slot` 锚点、不可被第三方注册，**不能**当 DropZone |
| CSS Module class（如 `.headerActions`） | 各包 | 样式钩子 | 只是样式，不是契约 |

----

## 附录 E：复现与核验方法

```powershell
# 1) 列出插槽 key 全集（脚本产物）
node -e "const j=require('./docs/reference/slots.json');console.log(j.total)"

# 2) 在还原源码里定位某个 slot 的宿主调用点
Get-ChildItem docs/reference/extracted -Recurse -Filter *.js |
  Select-String -Pattern 'renderSlot\("sidebar\.session\.row\.leading"'

# 3) 运行态核验（需鉴权通过后）
#    document.querySelector('[data-slot="sidebar.session.row.leading"]').parentElement.className
```

数据来源（按可靠性排序）：

1. `docs/reference/extracted/<package>/src/**.js` —— 从预打包 ESM bundle 还原的源码（含 `//#region` 原始路径），**本文件所有行号证据都指向这里**；
2. `docs/reference/extracted/<package>/css/**.css` —— CSS Module 真值（用于确认 `.slot` / `.navIcon` 等类的实际布局）；
3. `dsh-cordis-client-runner` 内的 `CLIENT_SLOT_API` 生成式 catalog（109 条，含 kind/scope/ownerProps/replaceRisk 的 AST 摘要）；
4. `docs/reference/slots.json`（103 条 key 全集）。
