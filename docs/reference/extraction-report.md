# DSH 官方 UI 源码级抽取报告

> 生成物：`scripts/extract-dsh-source.mjs` → `docs/reference/extracted/`
> 作用：把 `@deepseek-ai/dsh-client-ui-*` 预打包 ESM bundle 里的 CSS 与组件实现还原成独立源文件，供后续用 css-render refork。
> 本报告数字全部来自执行后的实测（`node scripts/extract-dsh-source.mjs`，退出码 0，failures = 0）。

## 1. 产出清单

| 路径 | 内容 |
| --- | --- |
| `scripts/extract-dsh-source.mjs` | 抽取器，纯 Node ESM，零依赖，可重复执行（幂等） |
| `docs/reference/extracted/<短名>/css/*.css` | 每个 CSS Module 一个文件，已去 hash、已美化 |
| `docs/reference/extracted/<短名>/src/*.js` | 每个 `lib/types/**` region 一个文件，原样导出 |
| `docs/reference/extracted/manifest.json` | 逐文件清单：来源路径、bundle 行号、字节数、class 数、hash 前缀、hash 替换次数、规则/声明计数 |

短名 = 包名去掉 `@deepseek-ai/dsh-client-ui-` 前缀（例如 `sidebar`）。

`docs/reference/extracted/locales.json`、`locales-merged.json` 由**另一个任务**产出，不是本脚本的产物；本脚本只清理自己拥有的包目录与 `manifest.json`，不会删除这两个文件。

## 2. 总量统计

| 指标 | 数值 |
| --- | --- |
| 扫描的 UI 包 | 61 |
| 抽到 CSS 的包 | **50**（49 个从 bundle 抽取 + primitives 走真实文件） |
| CSS 文件总数 | **203**（bundle 内 156 + 真实文件 47 = primitives 46 + theme 1） |
| CSS 总字节 | **635,946** |
| CSS 规则块 / at-rule / 声明 | 4,511 / 476 / 17,054 |
| 去 hash 的 token 数 | 4,889（156 个不同 hash 前缀，0 处残留，0 处需要正则兜底） |
| 去 hash 后不同 class 名 | 1,609；`@keyframes` 名 48 |
| 代码 region 实例 | 957（947 个唯一 region + 10 个跨 bundle 变体） |
| 代码文件数 | 960（= 957 region 文件 + 3 个 region 外的模块级代码块） |
| 代码总字节 | 10,735,703（约 10.2 MiB） |
| 失败条目 | **0** |

at-rule 分布：`@media` 405、`@keyframes` 51、`@container` 11、`@supports` 3、`@font-face` 3、`@starting-style` 2、`@property` 1。

## 3. 覆盖率

**有 CSS 的包：50 / 61。** 其中 22 个包只有 1 个 CSS Module，最大的三个是 `chat`(18)、`sidebar-documentpreview`(12)、`conversation`(10)。

CSS 字节数前 5：`primitives`(97,393) > `trajectory`(52,280) > `chat`(41,592) > `plugin-manager`(39,852) > `schedule`(37,895)。

### CSS 数为 0 的包（11 个，全部核实为纯逻辑包）

`brand-official`、`context-menu`、`directory-picker-native`、`file-actions`、`file-drag`、`reference`、`renderer`、`session`、`settings`、`settings-agent-loop`、`settings-shell`

逐个检查过它们的 `lib/**/*.js`：`module.css` 引用数 0、`_module_css_default` 引用数 0、`className` 出现 0 次（`renderer` 有 2 次 `className`，但那是转发宿主传入的字符串，不引用任何 CSS Module）。这些包只提供注册表、契约、图标或注入逻辑，样式全部落在消费方包里。因此它们**不是抽取失败**。

## 4. primitives 的特殊处理

- 官方 `@deepseek-ai/dsh-client-ui-primitives` 有真实、未压缩、无 hash 的 `lib/**/*.module.css`，**绕过 bundle 解析**，直接按字节复制到 `docs/reference/extracted/primitives/css/`。
- 覆盖：官方 46 个 `.module.css` → 输出 46 个，**46/46 与官方文件逐字节相同**（`Buffer.equals` 校验）。
- 无 hash、无压缩：0 个文件含 hash 形态类名，0 个文件是单行压缩产物。
- 落盘时按 basename 铺平（`lib/markdown/CodeBlock.module.css` → `css/CodeBlock.module.css`），原始相对路径记录在 manifest 的 `sourcePath`。

### 与 `src/components/official.ts` 的对应关系

`src/components/official.ts` 全文只有一行：`export * from '@deepseek-ai/dsh-client-ui-primitives'`。它没有自有组件，导出集合 = primitives 的导出集合。

- primitives `lib/types/index.d.ts`：112 个运行时导出 + 2 个 `type` 导出。
- primitives bundle `lib/index.js` 里恰好有 **46 条** `import cssN from "./X.module.css"`，与 46 个 CSS 文件**一一对应**（无多余 import，无未被 import 的 CSS）。
- 46 个 CSS Module 中，**41 个**与同名导出组件对齐；其余 5 个对应到**不同名**的导出或内部模块：

| CSS Module | 归属 |
| --- | --- |
| `CodeCard.module.css` | `CodeCard` 为内部实现，被 `CodeToolbar` / `ReadBlock` / `DiffBlock` 共用（无同名导出） |
| `ImagePreview.module.css` | `ImagePreview` 为内部实现（未从 index 导出），服务于 `DraggableImage` |
| `RowDragPreview.module.css` | 对应 hook `useRowDragPreview` |
| `settings-form/fields.module.css` | `SettingsValueField` / `SettingsSecretField` |
| `user-text.module.css` | `UserTextRun` / `ReferenceChip` |

- 反向看：112 个运行时导出里有 **67 个没有同名 CSS**，其中 37 个是 hook / 纯函数 / 常量（`useAnchoredPosition`、`fileSizeText`、`DEFAULT_READ_MAX_LINES` 等），30 个是组件或图标（`FishLogo`、`BrandWordmark`、`PermissionIcon*`、`LinkIcon*`、`PluginArtwork*` 等）；后 30 个里又有 4 个复用别名的 CSS Module（见上表 \(user-text\) / \(fields\) 两行），其余 26 个本来就没有自有样式（内联图标、纯组合）。
- 结论：「导出组件 ↔ CSS 文件」不是 1:1，而是 46:46（CSS ↔ bundle import）与 41:46（CSS ↔ 同名导出）两条关系。

## 5. 验证结论

### 已验证（有实测证据）

1. **脚本可跑通、可重复**：最终版本连续执行 2 次，`manifest.stats` 与全部 `packages` 记录逐字段相同（只有 `generatedAt` 时间戳变化），退出码 0，failures = 0；且每次重跑后都重新跑了一遍下面第 3–9 项的校验，结果一致。
2. **代码风格合规**：`node node_modules/eslint/bin/eslint.js scripts/extract-dsh-source.mjs` 退出码 0。5 个单字符扫描器（`parseRegions` / `parseStylesheet` / `splitTopLevel` / `formatDeclaration` / `checkBalanced`）对 `sonarjs/cognitive-complexity` 做了带理由的逐函数豁免——它们的分支数等于所解析的文法，不是绕在一起的逻辑。
3. **大括号配对**：对 203 个 CSS 文件做独立的括号/字符串感知扫描，0 个不平衡。
4. **hash 无残留**：203 个文件（剔除注释后）0 处 `.XXXXXX_name` 形态。
5. **去 hash 正确性**：156 个 bundle CSS 全部满足「同一文件的 class map 只有一个 hash 前缀、每个条目都以 `_<key>` 结尾」；按前缀反推替换 156/156 命中，0 处多前缀/0 处后缀不符。
6. **美化无损**：把抽取结果重新压回单行与「原始 CSS 去 hash 后的文本」比较，**154/156 完全一致**；2 个例外均可解释（见第 6 节 `ChatView` 资源替换、`ScheduleCatalogAction` 的转义前缀）。
7. **`@media` 内层不丢**：405 个 `@media` 块、51 个 `@keyframes` 块全部保留，抽查 `sidebar/SidebarRoot.module.css`（10 个 @media、3 个 keyframes）、`conversation`（16 个 @media）、`tool`（12 个 @media）内部选择器完整、嵌套层级正确。
8. **代码 region 原样**：957 个代码文件逐行与 bundle region 对比，**957/957 通过**——每行要么与原文完全相同，要么等于「原文该行原本存在的缩进前缀 + 输出行」（`473` 个文件做了缩进剥离，`484` 个含模板字符串/续行的文件保持 verbatim 不动，避免改到字符串内容）。
9. **primitives 逐字节校验**：46/46 相同。
10. **抽查 3 个包与 `ui-packages.json` 的组件名对得上**（用各包 `package.json` 的 description 对照）：

| 包 | description | 抽出的 CSS | 结论 |
| --- | --- | --- | --- |
| `sidebar` | Sidebar plugin: session multi-level tree, search, grouping, state dots | `HeaderLeadingControls.module.css`、`SidebarRoot.module.css` | 与描述一致：仅「窗口按钮组」+「侧栏外壳」两块样式 |
| `conversation` | Target-neutral Conversation assembly, shell, composer, queue, and view navigation | `ConversationRoot`、`HeroShell`、`InputBar`、`composer-editor`、`QueueDock`、`ContextMeter`、`TodoPanel`、`UserText`、`ReferenceChip`、`EnterBehaviorRow` | 与描述一致：shell / composer / queue / 导航各就各位 |
| `tool` | Client Tool call-tree renderer and keyed per-tool presentation slot | `ToolCallTree`、`ToolRow`、`ToolDetails`、`QuestionToolRow`、`AskQuestionCard`、`ExitCodeBadge`、`bash-sample` | 与描述一致：调用树 + 单工具展示 + 提问卡片 |

### 已执行但未验证

- 未在真实浏览器里把抽取的 CSS 重新挂载渲染，因此「视觉与官方 1:1」未证实；只证明了文本层面无损。
- `@container`(11)、`@supports`(3)、`@starting-style`(2)、`@property`(1) 只做了语法层面的保留检查，未在目标浏览器逐条验证行为。
- 代码文件是编译产物（TS 类型已擦除、JSX 已降级为 `jsx/jsxs` 调用、跨文件符号被改名），只做了「与 bundle 逐行一致」的校验，**没有**尝试把它们重新编译或运行。

### 未执行

- 没有把 CSS 里的 4 处 `data:` 内联 SVG 拆成独立文件（它们原样保留在 CSS 内），也没有导出 `running-whale` PNG。
- 没有生成 css-render 的 `.ts` 组件骨架（属于后续 refork 任务）。
- 没有修改 `src/`、`playground/`、`package.json` 等现有文件。

## 6. 已知损耗与使用注意

1. **class 名去 hash 后会在同包内重名**：151 个 class 名在同一包的多个 CSS Module 中出现（最典型 `chat` 的 `root` 出现在 10 个文件、`primitives` 的 `root` 出现在 7 个文件）。这在原版没问题（CSS Module 作用域隔离），但 refork 时必须重新加作用域（css-render 的 `cB('prefix')` 之类），否则样式会互相污染。
2. **`@keyframes` 名同样被去 hash**，且有 1 处同包撞名：`settings-account` 的 `spin`（`PlatformOverlay.module.css` 与 `SignInDialog.module.css`）。refork 时这两个动画名必须重新区分。
3. **hash 前缀不总是 6 位字母数字**：实测 156 个前缀长度为 5–7，其中有以 `_` 开头（如 `_29hOxG`）和以 `-` 开头（`-4LnlG`）的。以 `-` 开头且第二位是数字时，源码里是 CSS 转义形态（`.-\34 LnlG_root`），抽取器按 class map 推导前缀并同时尝试转义/未转义两种形态，因此 `schedule/ScheduleCatalogAction.module.css` 也正确变成 `.root`。
4. **1 处资源 URL 被就地求值**：`chat/ChatView.module.css` 里 `require.asset("plugins/@deepseek-ai/dsh-client-ui-chat/assets/running-whale%402x-06738fa29b2f.png")` 被替换成该字面路径（manifest 的 `assets` 字段记录了它）。图片本身没有抽出，refork 时需自备资源。
5. **CSS 重排带来的形态变化**：minified 里 `}` 前省略的 `;` 现在统一补上；逗号分隔的选择器列表按行拆开；`a:b` 统一成 `a: b`。语义等价，但**不再是压缩可发布的形态**（要发布需再压一次）。
6. **代码文件不可直接编译**：region 只包含本文件的实现，`import`/`require` 被 rolldown 提升到 bundle 顶部，所以这些 `.js` 里的外部符号（如 `_deepseek_ai_dsh_client_ui_primitives.Tooltip`、`react_jsx_runtime.jsx`）是悬空的。manifest 的 `bundles[].imports` 保存了每个 bundle 的完整 import 清单，可作为补 import 的依据。
7. **10 个 source 在 client/index 两个 bundle 里被 tree-shake 成不同形态**（`chat/chat-settings`、`theme/theme-settings` 等）。`lib/client.js` 版本作为主文件，另一版另存为 `*.index-bundle.js`，两者都不删。
8. **3 处模块级代码不在任何 region 内**（`layout`、`secret-mask`、`sidebar` 各一段，如 `createPanelPins`/`SIDEBAR_AUTO_COLLAPSE`/凭证前缀表），已兜底导出为 `src/_module-top.js`。
9. **文件名铺平**：每个包内 CSS/源码各用一层扁平目录，72 组 basename 冲突用点号路径消歧（`client/index.js` → `client.index.js`，共 95 个文件落到点号名），`*.N.js` 数字兜底本次未触发。真实来源路径始终在 manifest 的 `sourcePath`/`regionPath` 里。
10. **class map 里的非 class 条目**：CSS Module 的导出表把 `@keyframes` 名也当作键导出（27 个文件共 42 条），所以 manifest 的 `unusedExports` 不是漏抽，而是那些名字只出现在 `animation` 声明和 `@keyframes` 里、不出现在 `.` 选择器中。

## 7. 复现

```bash
node scripts/extract-dsh-source.mjs
```

- 输入：`docs/reference/ui-packages.json`（320 个包的名称 → 绝对目录）。
- 幂等：每个包开跑前删除它自己的输出目录，最后重写 `manifest.json`；不碰 `extracted/` 下的其它文件（实测 `locales.json` / `locales-merged.json` 在多次重跑后仍存在）。
- 失败语义：任何解析/去 hash/美化/回写失败都会打印 `[kind] package: detail`、写入 manifest 的 `failures`，并以退出码 1 结束。当前 0 条。
