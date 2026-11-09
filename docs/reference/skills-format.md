# Skills 结构参考：heroui-inc/heroui 与本项目建议

> 来源：GitHub `heroui-inc/heroui`，分支 `v3`，目录 `skills/` 下有三个 skill：
> `heroui-migration` / `heroui-native` / `heroui-react`。
> 本文件内容全部来自 GitHub API 与 raw.githubusercontent 实际抓取（2026-11-09），未凭记忆转述。

## 1. heroui-react 目录树（真实）

```text
skills/heroui-react/
├── LICENSE.txt                      11,236 B
├── SKILL.md                          6,667 B
└── scripts/
    ├── get_component_docs.mjs        3,953 B
    ├── get_docs.mjs                  3,989 B
    ├── get_source.mjs                4,115 B
    ├── get_styles.mjs                4,064 B
    ├── get_theme.mjs                 5,063 B
    └── list_components.mjs           3,601 B
```

（对比：`skills/heroui-migration/` 同样只有 `SKILL.md` + `scripts/`，6 个 `.mjs`）

**关键结构事实：这个 skill 没有 `references/` 目录，也没有任何预生成的索引文件。**
所有"参考内容"都是运行时通过 `scripts/*.mjs` 从远端抓取的；`SKILL.md` 只负责"什么时候抓、抓哪个 URL、怎么用脚本"。

## 2. SKILL.md 的 frontmatter（原文）

```yaml
---
name: heroui-react
description: "HeroUI v3 React component library (Tailwind CSS v4 + React Aria). Use when building UIs with HeroUI — creating Buttons, Modals, Forms, Cards; installing @heroui/react; configuring dark/light themes with oklch variables; or fetching component docs. Keywords: HeroUI, Hero UI, heroui, @heroui/react, @heroui/styles."
metadata:
  author: heroui
  version: "3.0.1"
---
```

要点：

- 只有 3 个顶层键：`name`（= 目录名）、`description`（**触发条件写在这里**，含关键词列表）、`metadata`（`author` / `version`）。
- `description` 是一句 + 关键词清单的写法：前半句说"是什么"，后半句说"什么时候用"，末尾显式列 `Keywords:`。这直接决定 skill 能否被自动匹配到。
- 没有 `allowed-tools` / `license` / `model` 等字段；LICENSE.txt 单独放。

## 3. SKILL.md 正文组织（真实骨架）

```text
# HeroUI v3 React Development Guide
  一句话定位（Tailwind v4 + React Aria）

## Installation
  一条 curl 安装命令

## CRITICAL: v3 Only - Ignore v2 Knowledge
  1 张 v2 vs v3 对照表 + "DO NOT / CORRECT" 反例与正例代码

## Core Principles
  4 条短语（semantic variants / composition / CSS vars / BEM）

## Accessing Documentation & Component Information
  "Using Scripts" 代码块（6 条命令示例）
  "Direct MDX URLs" + 明确的防呆规则（slug 必须具体、不许带占位符）
  "Important: Always fetch component docs before implementing"

## Installation Essentials
  Quick Install / Next.js App Router 步骤 1-4 / Critical Setup Requirements（4 条）

## Component Patterns
  一段：一律 compound component，不要摊平成 props

## Semantic Variants
  1 张 variant 表（primary/secondary/tertiary/danger/ghost/outline）

## Theming
  oklch CSS 变量示例 + 命名规则（-foreground 后缀）+ 主题切换
  "For detailed theming, fetch: <url>.mdx"
```

正文组织特征（值得照抄的 5 点）：

1. **先纠错再教程**：`## CRITICAL: v3 Only` 放在最前面，用表格 + 反例代码杀掉旧知识。
2. **知识获取方式本身写进 SKILL.md**：不是"这里有一堆文档"，而是"用这 6 条命令/URL 去拿文档"。
3. **防呆规则显式化**：`never fetch a URL that still contains a placeholder`、slug 未知时先 `list_components.mjs`。
4. **正文保持短**（6.6 KB），细节全部下推到远端 MDX 或脚本。
5. **每个主题结尾给一条"深入阅读"URL**，而不是把长文塞进 SKILL.md。

## 4. scripts/ 的职责划分（真实文件）

| 脚本 | 作用 | 数据来源 |
| ---- | ---- | -------- |
| `list_components.mjs` | 列出全部组件名（索引） | `GET https://mcp-api.heroui.com/v1/components?app=react-skills`，失败回退解析 `https://heroui.com/react/llms.txt` 的 `### Components` 段落 |
| `get_component_docs.mjs` | 取单个/多个组件的 MDX 文档 | `POST /v1/components/docs {components}`，失败回退 `https://heroui.com/docs/react/components/<kebab>.mdx` |
| `get_source.mjs` | 取组件 TSX 源码 | API，失败回退 raw.githubusercontent（试 `packages/react/src/components/<name>/<name>.tsx` 与 `index.tsx` 两种路径） |
| `get_styles.mjs` | 取组件 CSS / BEM 类名 | API（+ 远端回退） |
| `get_theme.mjs` | 取当前主题变量 | API（+ 远端回退） |
| `get_docs.mjs` | 取非组件文档（guides/releases） | 直接给路径，如 `/docs/react/getting-started/theming` |

所有脚本共享同一套模式（这就是"索引如何生成"的答案）：

```js
const API_BASE = process.env.HEROUI_API_BASE || "https://mcp-api.heroui.com";
const FALLBACK_BASE = "https://heroui.com";
const APP_PARAM = "app=react-skills";           // 打点/归属

async function fetchApi(endpoint, method = "GET", body = null) {
  const url = API_BASE + endpoint + (endpoint.includes("?") ? "&" : "?") + APP_PARAM;
  try {
    const response = await fetch(url, {
      headers: { "Content-Type": "application/json", "User-Agent": "HeroUI-Skill/1.0" },
      method,
      signal: AbortSignal.timeout(30000),
      ...(body ? { body: JSON.stringify(body) } : {}),
    });
    if (!response.ok) return null;             // 失败 -> 交给 fallback
    return await response.json();
  } catch { return null; }
}
```

`list_components.mjs` 的回退解析（从 llms.txt 里抠组件列表，原文摘录）：

```js
const LLMS_TXT_URL = "https://heroui.com/react/llms.txt";
// ...
for (const line of content.split("\n")) {
  if (line.trim() === "### Components") { inComponentsSection = true; continue; }
  if (inComponentsSection && line.trim().startsWith("### ")) break;
  if (inComponentsSection) {
    const match = line.match(/^\s*-\s*\[([^\]]+)\]\(https:\/\/www\.heroui\.com\/docs\/react\/components\/[a-z]/);
    if (match) components.push(match[1]);
  }
}
return { components: components.sort(), count: components.length, latestVersion: "unknown" };
```

结论：**"索引"不是仓库里的静态文件，而是一次实时 API 调用 + llms.txt 兜底**。组件文档按 **组件名（PascalCase -> kebab-case slug）** 逐个取，不预切分、不缓存到仓库。

## 5. 与本仓库现有 skills/ 的对比

本仓库 `skills/` 下已有 29 个第三方 skill（由 `skills` CLI / ```antfu/skills` 安装，`skills-lock.json` 记录 source / skillPath / computedHash）。它们的结构与 heroui 不同——**references/ 是预切分的静态文件**：

```text
skills/antfu/                     skills/antfu-create-pr/
├── SKILL.md                      ├── README.md
└── references/                   ├── SKILL.md
    ├── antfu-eslint-config.md     ├── references/
    ├── app-development.md         │   ├── pr-body.md
    ├── library-development.md     │   └── visual-evidence.md
    ├── monorepo.md                └── scripts/
    └── setting-up.md                  └── upload-github-attachment.sh
```

本仓库 frontmatter 风格（与 heroui 同构，多一个 `>` 引用块做"首选模板"）：

```yaml
---
name: antfu-create-pr
description: Create a reviewable GitHub pull request from the current branch with a Conventional Commits title, a concise evidence-based body, and before/after screenshots for UI changes. Use when asked to open, create, publish, or prepare a PR.
metadata:
  author: Anthony Fu
  version: "2026.11.05"
---
```

即：**`name` + `description`（含 use-when 语义）+ `metadata.author/version`** 三件套是这两个生态的共识格式。

两种范式对比：

| 维度 | heroui-react（远端拉取型） | antfu / antfu-create-pr（静态 references 型） |
| ---- | -------------------------- | --------------------------------------------- |
| 知识存放 | 远端 MDX / API | 仓库内 `references/*.md` |
| 索引 | 运行时 `list_components.mjs` + llms.txt | 无索引文件，SKILL.md 内的 `[pr-body](references/pr-body.md)` 相对链接即索引 |
| 新鲜度 | 永远最新（跟站点走） | 随 skill 版本（`metadata.version`） |
| 离线可用 | 否（脚本失败则无内容） | 是 |
| 体积 | skill 本身 6.6 KB | 随 references 增长 |

## 6. 建议：`skills/dsh-components/` 应该长什么样

本项目是"把 DSH 官方 UI 复刻成 Puck 组件"，知识源**全在本地**（node_modules 里的 prebundle + .module.css + docs/reference/ui-packages.json），所以应走 **静态 references 型**（antfu 风格）+ **一个索引生成脚本**（吸收 heroui 的"索引即生成物"思想）。

```text
skills/dsh-components/
├── SKILL.md                         # 触发词 + 工作流 + 索引表（或链接到 INDEX.md）
├── references/
│   ├── puck-api.md                  # 由 docs/reference/puck-api.md 派生/链接
│   ├── slot-recipes.md              # 每个 DSH 插槽点 -> slot 字段 的对照表
│   ├── extraction.md                # 从 lib/**/*.js 抽 CSS / class 名 / 组件的操作手册
│   ├── css-modules.md               # hash 前缀 -> 语义名的还原规则、变量、主题
│   ├── packages.md                  # 320 个包的分组与定位（ui-packages.json 的人读版）
│   └── playground.md                # 如何起 playground、如何接 src/
├── scripts/
│   ├── list-packages.mjs            # 读 docs/reference/ui-packages.json，输出分组清单
│   ├── extract-css.mjs              # 从某个包 lib/**/*.js 里抽 \0dsh-css: region 的 CSS 文本
│   ├── extract-component.mjs        # 抽 //#region 组件实现 + 原始源路径
│   └── build-index.mjs              # 扫描 references/*.md 的标题，生成 INDEX.md
└── INDEX.md                         # 生成物：reference 文件 -> 标题/摘要/关键词
```

SKILL.md 建议（照抄 heroui 的 frontmatter 形状）：

```yaml
---
name: dsh-components
description: "Rebuild the official DeepSeek Harness Web UI as Puck components. Use when adding or editing a DSH UI component, mapping an official slot to a Puck slot field, extracting CSS/class names from an @deepseek-ai/dsh-client-ui-* prebundle, or working in the playground Puck config. Keywords: DSH, Puck, DropZone, slot, ui-primitives, ui-packages.json, playground."
metadata:
  author: <owner>
  version: "0.1.0"
---
```

正文骨架（对应 heroui 的 5 个特征）：

1. `## CRITICAL: 数据来源` —— 一句话 + 表格：官方实现的唯一真源是 `node_modules/@deepseek-ai/*/lib/**/*.js`（`\0dsh-css:` region 里有压缩 CSS，`lib/types/**/*.d.ts` 有类型），**不要**从线上文档或猜测还原。
2. `## 工作流` —— "定位包（`scripts/list-packages.mjs`）-> 抽 CSS/结构（`scripts/extract-css.mjs`）-> 写成 Puck 组件（slot 字段）-> 在 playground 验证"。
3. `## 插槽映射规则` —— 每个官方插槽点 = 一个 `type: "slot"` 字段；附 `slot-recipes.md` 链接，并写明"不要用 `puck.renderDropZone`（0.23 已弃用）"。
4. `## 验证` —— 起 playground 的确切命令 + 该看哪两个路由（`/`、`/edit`）。
5. `## 深入阅读` —— 逐条 `[packages](references/packages.md)` 形式的相对链接（这些链接自己就是索引）。

索引生成（`scripts/build-index.mjs`）设计要点：

- 输入：`references/*.md` 的 `## ` / `### ` 标题 + 文件首段；输出 `INDEX.md`（表格：文件 / 一级标题 / 关键词）。
- 由 `pnpm run skills:index` 触发，并在 CI 里做 `--check`（内容不一致则失败），避免"索引是手写的、一定过期"。
- 不要学 heroui 的"运行时抓远端"：本项目知识在本地，静态索引 + CI 校验更可靠、离线可用。

## 7. 待确认 / 未验证

- 本仓库 `.agents/skills/<name>/` 与 `skills/<name>/` 内容一致（目录名相同、各含 SKILL.md），推测是 `skills` CLI 的镜像目录；**未验证**新增 `skills/dsh-components/`"是否需要同步写 `.agents/skills/`，也未验证 `skills-lock.json` 是否必须登记（它看起来只登记"外部来源"的 skill）。
- 未验证 `skills` CLI 是否会清理 "非 lock 记录" 的目录——若要长期维护自有 skill，**建议**把它作为仓库自有目录提交，并跑一次 `pnpm exec skills ...` 观察是否被覆盖（本次未执行）。
