# playground 现状：版本、可运行性、消费 src/ 的方式

> 本文件的每条"已验证"结论都来自本次实际执行的命令或 HTTP 请求（2026-11-09）。
> 未执行的项单独列在 §7，不混在结论里。

## 1. 版本矩阵（已验证）

| 包 | playground 声明 | 实际安装 |
| -- | --------------- | -------- |
| next | `^16.0.8` | **16.4.5**（Turbopack 构建，dev 日志首行 `Next.js 16.4.5 (Turbopack)`） |
| react | `^19.2.1` | **19.3.1** |
| react-dom | `^19.2.1` | **19.3.1** |
| @puckeditor/core | `^0.23.0` | **0.23.0** |
| @puckeditor/plugin-ai | `^0` | **0.8.3** |
| @puckeditor/cloud-client | `^0` | **0.8.3** |
| typescript | `^5.5.4` | **5.9.3** |
| classnames | ^2.3.2 | 2.5.1 |
| pnpm（仓库） | packageManager: `pnpm@12.15.0` | 12.15.0（已验证 `pnpm --version`） |
| node（真 node） | — | v24.21.0 |

## 2. 安装状态（已验证；未重新安装）

`playground/node_modules` 已存在且完整（`next / react / react-dom / @puckeditor/* / typescript / classnames` 均为 junction 指向 `E:\projects\dsh-components\node_modules\.pnpm\...`）。
**本次没有执行 `pnpm install`**（无需要；不改 lockfile）。

## 3. 启动方式（踩到一个环境坑，已验证修复）

直接用 `pnpm dev` **会失败**，与项目代码无关：

```text
$ next dev
G:\Deepseek Harness Desktop\runtime\win32-x64\DSH Tauri.exe: --expose-internals is not allowed in NODE_OPTIONS
[ELIFECYCLE] Command failed with exit code 9.
```

原因链（已用 `Get-Command node -All` 与 `node -p process.execPath` 验证）：

1. 本机 PATH 里 `node` 首先解析到 `C:\Users\hairy\AppData\Local\deepseek-harness\bin\node.cmd`（DSH 自带的 node shim）。
2. 该 shim 把 `node` 映射到 `G:\Deepseek Harness Desktop\runtime\win32-x64\DSH Tauri.exe`，所以 `process.execPath` 就是那个 SEA 可执行文件。
3. `next dev` 启动内部 server 子进程时会注入 `NODE_OPTIONS=--expose-internals` 并复用 `process.execPath`；SEA 版 node 拒绝该参数 → 退出码 9。

可用的启动命令（**不改任何文件**，只调整进程环境）：

```powershell
$env:PATH = 'C:\nvm4w\nodejs;' + $env:PATH     # 让 node 解析到真 node v24.21.0
cd E:\projects\dsh-components\playground
pnpm dev
```

成功日志：

```text
▲ Next.js 16.4.5 (Turbopack)
- Local:         http://localhost:3000
- Network:       http://26.242.200.19:3000
✓ Ready in 1583ms
○ Compiling / ...
 GET / 200 in 5.3s (next.js: 5.0s, proxy.ts: 55ms, application-code: 271ms)
 GET /edit 200 in 966ms (next.js: 843ms, proxy.ts: 4ms, application-code: 120ms)
 GET /foo 404 in 1200ms (next.js: 1158ms, proxy.ts: 2ms, application-code: 40ms)
```

（3080 被 DSH Web GUI 占用，与 Next 默认 3000 不冲突，已验证 3000 空闲。）

## 4. 路由验证（已验证，均为真实 HTTP 请求）

| URL | 结果 | 说明 |
| --- | ---- | ---- |
| `/` | **200**，15,792 B，含 `Edit this page`、`HeadingBlock` | 由 `database.json` 的 `"/"` 渲染（App Router 的 `[...puckPath]/page.tsx`，`dynamic = "force-static"`） |
| `/edit` | **200**，38,191 B，`<title>Puck: /</title>` | `proxy.ts` 把 `/ *edit` 重写到 `/puck/...`，Puck 编辑器（客户端）挂载成功 |
| `/puck` | **307** → `/` | `proxy.ts:20-23` 主动屏蔽该路由 |
| `/puck/foo` | **307** → `/` | 同上 |
| `/foo` | **404** | `getPage("/foo")` 返回 null → `notFound()` |

即：**编辑器入口是任意页面 URL 加 `/edit` 后缀，不是 `/edit` 这个绝对路径**（本仓库根路径的页面刚好是 `/`，所以 `/edit` 才有效）。

路由/数据流（读代码得出）：

```text
/               -> app/[...puckPath]/page.tsx (force-static) -> <Render> via client.tsx
/<x>/edit       -> proxy.ts rewrite -> /puck/<x> -> app/puck/[...puckPath]/page.tsx (force-dynamic)
                   -> <Puck> via client.tsx
/puck/*         -> proxy.ts redirect -> /
数据源          -> lib/get-page.ts 读 playground/database.json（{ "<path>": Data }）
发布            -> client.tsx onPublish -> POST /api/pages -> 写 database.json
```

## 5. puck.config.tsx 现状与问题（已验证，读文件得出）

现在是 Puck 官方 recipe 的最小 demo，只有 25 行、1 个组件：

```tsx
type Props = { HeadingBlock: { title: string } }
export const config: Config<Props> = {
  components: {
    HeadingBlock: {
      fields: { title: { type: "text" } },
      defaultProps: { title: "Heading" },
      render: ({ title }) => (<div style={{ padding: 64 }}><h1>{title}</h1></div>),
    },
  },
}
```

差距清单（相对"复刻 DSH"的目标）：

1. **没有 root 配置**：未定义 `root.render / root.fields`，画布根区域只能靠默认行为；DSH 的"应用外壳"应作为 root 组件。
2. **没有 categories**：组件抽屉里只有 "Other" 分组；DSH 的 sidebar / composer / message / tool-call / settings 等分组缺失。
3. **没有 slot 字段**：整个 config 里 0 个 `type: "slot"` —— 也就是"多区域插槽"能力完全没用上（见 `puck-api.md` §4）。
4. **没有组件**：官方 320 个 `ui-*` 包里一个都没接进来。根 `src/index.ts` 当前是 `export * from` 四条（`./components/official`、`./lib/css`、`./lib/style`、`./theme`，后三条由并行 agent 在本任务期间新增），其中 `components/official.ts` 只 re-export `ui-primitives`。
5. **AI 插件占用了首屏**：`app/puck/[...puckPath]/client.tsx` 用 `createAiPlugin({ designMode: { visible: true }, defaultMode: "design" })` 且放在 plugins 第一位，配合 `withDynamicConfig(config, data)`；接自有组件库时应决定是否保留（保留需要 Puck Cloud API key，`.env.example` 里有占位）。
6. **样式**：`app/layout.tsx` 只 import `./styles.css`；编辑器 CSS 在 `page.tsx` 里通过 `import "@puckeditor/core/puck.css"` 引入。DSH 组件库的 css（46 个 `.module.css`，见 §6）还没有接。

## 6. playground 能否直接 import 仓库根目录的 `src/`

> 注意：本节结论在 2026-11-09 21:3x 复核过一次——期间仓库被并行 agent 改动（根包已从 `pkg-placeholder` 改名为 `dsh-components`），下表是**复核后**的现场。

### 结论

**当前不能，属于"完全没接线"**。要么改 `playground/tsconfig.json` + `next.config.js`，要么在 `playground/package.json` 加 workspace 依赖。二者都没做。

### 6.1 已执行的核查（证据，复核时间 21:35 左右）

| 检查 | 结果 |
| ---- | ---- |
| `playground/package.json` 的 dependencies | 只有 `@puckeditor/cloud-client / core / plugin-ai`、`classnames`、`next`、`react`、`react-dom` —— **无任何指向根包或 `workspace:*` 的依赖** |
| `pnpm-workspace.yaml` 的 packages | `playground / docs / packages/* / examples/*` —— 根包本身不是成员（它是 workspace 根），`packages/` 与 `examples/` 目录当前不存在 |
| `playground/node_modules` 的链接 | 只有 `classnames / next / react / react-dom / typescript`（+ `.bin / @puckeditor / @types`）。**没有根包链接** |
| 从 playground 解析根包 | `node -e "require.resolve('dsh-components')"` → **MODULE_NOT_FOUND** |
| `playground/tsconfig.json` | 只 `extends ./tsconfig/nextjs.json` + `include: ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"]` —— **无 `paths` 别名** |
| `playground/next.config.js` | `module.exports = { reactStrictMode: true }` —— **无 `transpilePackages`、无 `turbopack.root`** |
| 根 `tsconfig.json` | `exclude: ["playground", "docs", "node_modules", "dist"]` —— 根的类型检查刻意不覆盖 playground |
| 根包现状（并发改动后） | 名字 `dsh-components`；`exports["."] = ./dist/index.cjs`（**存在**，382 B）；`types = ./dist/index.d.cts`（**存在**）；`dist/` 下另有 `index.cjs.map`。即：根包现在"可被当产物包消费"，但 playground 没有声明它 |

### 6.2 一个好消息：底层依赖本身能从 playground 解析

`node -e "require.resolve('@deepseek-ai/dsh-client-ui-primitives')"`（cwd=playground）**成功**，解析到
`node_modules/.pnpm/@deepseek-ai+dsh-client-ui-_0f5ed34c341484caa8bf69c7c215f215/node_modules/@deepseek-ai/dsh-client-ui-primitives/lib/index.js`
（Node 从 playground 逐级上溯到仓库根 `node_modules`）。

但该包的特征会影响接线方式：

- `type: "module"`，`main: lib/index.js`，`types: lib/types/index.d.ts`，`files: lib/index.js + lib/**/*.css + lib/types/**/*.d.ts`。
- `lib/index.js` 是 **572 KB 预打包 ESM**，第 3-5 行就是 `import css from "./UserMessageBubble.module.css"` 这类写法，包内共 **46 个 `.module.css`**。
- 因此 playground 一旦引入它，打包器必须支持"从 node_modules import CSS Modules"。Next 支持，但通常要把这些包列进 `transpilePackages` 才稳妥（**未实测**，见 §7）。

### 6.3 三种接线方式（推荐 A）

| 方案 | 做法 | 优点 | 代价 |
| ---- | ---- | ---- | ---- |
| **A. tsconfig paths + transpilePackages（推荐）** | `playground/tsconfig.json` 加 `compilerOptions.paths: { "@dsh/*": ["../src/*"] }`；`next.config.js` 加 `@transpilePackages: ["@deepseek-ai/dsh-client-ui-primitives", ...]`；代码里 `import { X } from "@dsh/index"` | 源码直连、热更新、不依赖根包产物；不改根 package.json | 需要维护 paths 与 transpilePackages 列表；CSS Modules 从 node_modules 引入的正确性要实测 |
| B. 加 workspace 依赖 | 根包已改名 `dsh-components` 且 `exports` 指向存在的 `dist/index.cjs`；playground 加 `\"dsh-components\": \"workspace:*\"` 后 `pnpm install`，再按需 `transpilePackages` | 标准 pnpm 工作流、类型自动可见 | 只能消费 **dist 产物**（改源码要重新 build）、需要改 playground/package.json 与 lockfile |
| C. 相对路径 import | 直接 `import x from "../../src/index"` | 零配置 | 跨 project root 的打包行为依赖 Turbopack root 推断与 `transpilePackages`（**未验证**）；tsconfig `include` 不覆盖，IDE 报错概率高 |

配套注意：

- 根 `src/index.ts` 目前是 4 条 re-export：`./components/official`、`./lib/css`、`./lib/style`、`./theme`（后三条是并行 agent 在本任务期间新增的）；`components/official.ts` 只 re-export `@deepseek-ai/dsh-client-ui-primitives`。接线前先确认这条入口面是否已经是你要暴露的 API。
- 无论哪种方案，**CSS Modules 类名哈希的来源必须一致**：`ui-primitives` 的 `lib/index.js` 里引用的类名是它自己构建时生成的，Next 再编译 `.module.css` 会重新生成类名，理论上有不匹配风险。**必须实测**（§7 第 1 条）。若果然不匹配，正确做法是直接消费 DSH 的 `ui-*` 预打包（`__ModuleLoader__` 那套，CSS 以字符串内联、不经打包器处理），而不是 import 它的 `.module.css`。


## 7. 未执行 / 未验证

| # | 事项 | 原因 |
| - | ---- | ---- |
| 1 | 在 playground 里加探针路由实际 `import "../../src/index"` 并观察 Turbopack 编译结果 + CSS Modules 类名是否匹配 | 需要在 `playground/app` 下新建文件，超出本次"只写 `docs/reference/`、不得修改 playground"的授权 |
| 2 | `pnpm install` | node_modules 已完整；不制造 lockfile 变更 |
| 3 | `pnpm build` / `pnpm typecheck`（playground 或根） | 与本任务无关，且 dev 已验证可编译 |
| 4 | 打开浏览器截图 / 抓 DOM（确认编辑器交互无运行时错误） | 仅做了 HTTP 层验证（200 + 正确 title + 正确 body 体积）；未驱动浏览器 |

## 8. 后台进程说明

- **仍在运行**：Next dev server，端口 **3000**，PID **44000**（`Get-NetTCPConnection -State Listen -LocalPort 3000` 验证），启动命令见 §3，cwd = `E:\projects\dsh-components\playground`。
- 停止：`Stop-Process -Id 44000`（先确认 `Get-Process -Id 44000` 是 node）。
- 该进程由我这边的后台任务托管；我的会话结束后可能被回收。若端口 3000 无响应，按 §3 的命令重启即可。
- 未占用其它端口；DSH Web GUI 的 3080 未受影响。
