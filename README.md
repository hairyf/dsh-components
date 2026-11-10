# dsh-components

[![npm version][npm-version-src]][npm-version-href]
[![npm downloads][npm-downloads-src]][npm-downloads-href]
[![bundle][bundle-src]][bundle-href]
[![License][license-src]][license-href]

🧩 **dsh-components** 仅适用于插件作者，为 DeepSeek Harness 插件提供一套**通用 UI 组件**：每个组件的样式表都逐字取自官方 DSH，因此拼出来的界面与产品本身一致。

组件名不绑定任何业务：没有 `FontSettingsPanel`，只有 `SettingsRow` + `Stepper` + `Select`。因此没被预先设计过的界面，也能用既有零件拼出来。

## 📦 安装

```sh
pnpm add dsh-components
```

仅有一个运行时依赖 `css-render`。React、DSH 基础组件与宿主模块都是 peer，由宿提供。

> Are you an AI?
>
> 本仓库自带技能 `skills/dsh-components`：`npx skills add hairyf/dsh-components --skill dsh-components -y`。
> 它会告诉你如何查询组件、样式与令牌。请先问你的 owner 需要支持哪些 Agent，避免装一堆用不上的目录。

## 接入插件

在插件的 `cordis.patch.yml` 里与自身一起插入，用户启用插件时本库随之启用：

```yaml
- insert:
    - id: my-plugin
      name: dsh-my-plugin
    - id: dsh-components
      name: dsh-components
```

并在自身 `package.json` 之外，让构建把本库视为外部依赖，避免打进第二份：

tsdown 配置里把本库与 DSH 包、React 一起排除出打包：

```ts
// tsdown.config.ts
const config = {
  deps: {
    neverBundle: [/^dsh-components$/, /^@deepseek-ai\//, /^react($|\/)/],
  },
}
```

> ⚠️ DSH 用 `window.__ModuleLoader__` 装载客户端代码，模块按 id 记忆化。宿主提供一份，多个插件共享同一份样式与 React 状态。

## 特性

- **官方样式**：72 个组件内嵌 71 张官方样式表，逐字复制、保留官方类名；`pnpm audit:fidelity` 断言 4819 条声明 100% 命中官方，无一条编造
- **通用可组合**：`primitives` / `layout` / `settings` / `feedback` / `media` / `content` / `viewer` 七类，全部受控、插槽接受任意节点
- **一个 prop 展开**：`Bar`、`SettingsGroup`、`ListRow`、`Select` 加 `expandable` / `collapsible` 即出现箭头并展开内容
- **三个入口**：`dsh-components`、`/provider`、`/styles` 分开导出，导入一个按钮不会把令牌表拖进模块图
- **图标是同源资产**：官方 `Icon*` 随库导出，无需自绘 SVG
- **升级可控**：`docs/reference/component-map.json` 逐组件记录对应的官方样式表，DSH 升级时按表重拷即可

> ⚠️ 组件内不安装设计令牌：DSH 宿主已经装好 `--dsw-*` 与暗色属性。在宿主外渲染（例如展厅）才需要 `DshProvider`。

## 🚀 快速开始

### 1. 直接使用

组件是受控的，传入值与回调即可：

```tsx
import { Button, Switch } from 'dsh-components'

export function Actions() {
  return (
    <>
      <Button variant="primary" onClick={save}>保存</Button>
      <Switch checked={enabled} onChange={setEnabled} />
    </>
  )
}
```

### 2. 组合成界面

不存在的界面，用零件拼出来：

```tsx
import {
  OptionGroup,
  Select,
  SettingsGroup,
  SettingsRow,
  Stepper,
  Surface,
} from 'dsh-components'

<Surface>
  <SettingsGroup title="外观">
    <SettingsRow title="字号" description="影响正文与代码">
      <Stepper value={size} min={12} max={20} unit="px" onChange={setSize} />
    </SettingsRow>
    <SettingsRow title="主题" description="跟随系统或固定">
      <OptionGroup value={theme} onChange={setTheme} options={THEMES} />
    </SettingsRow>
    <SettingsRow title="访问范围" description="本轮运行的权限">
      <Select value={scope} onChange={setScope} options={SCOPES} />
    </SettingsRow>
  </SettingsGroup>
</Surface>
```

### 3. 使用官方图标

```tsx
import { IconChecklistOutlineRegular, IconChevronDownOutlineRegular } from 'dsh-components'

<IconChecklistOutlineRegular size={14} />
```

---

## 🧱 组件

| 分组 | 组件 |
| --- | --- |
| `primitives` | Avatar, Chip, DatePicker, Field, Form, IconButton, MaskedText, MenuItemButton, Spinner, Text, Textarea, TimePicker, Toast |
| `layout` | Surface, Bar, Stack, ListRow, Tree, DescriptionList, Checklist, Meter, Table, Toolbar, Carousel, FileChangeCard |
| `settings` | SettingsRow, SettingsGroup, Stepper, OptionGroup, Select, SplitButton |
| `feedback` | ConfirmPanel, FormDialog, SearchDialog, ActionCard, DropOverlay |
| `media` | Image, ImageTile, Lightbox, FileCard |
| `content` | CodeToolbar, SplitDiff, Terminal, Document |
| `viewer` | ZoomControls, ZoomViewport, PreviewFrame |

这 48 个是产品里有、但官方包没有导出的部件。官方**已经导出**的（Button、Input、Switch、Tag、MarkdownText、JsonTree 等以及全部 194 个图标）直接透传，不重复实现；共 301 个值、87 个类型：

```sh
node skills/dsh-components/scripts/list_official.mjs chevron
```

## 📚 API 参考

### 入口

```ts
import { Button } from 'dsh-components' // 组件与 props 类型
import { DshProvider } from 'dsh-components/provider' // 宿主外渲染时安装令牌与图标
import { installDshTheme, setDshDarkMode } from 'dsh-components/styles'
```

### `DshProvider`

仅用于在 DSH 之外渲染本库（例如展厅）。插件内不要使用。

```tsx
<DshProvider colorScheme="dark">{children}</DshProvider>
```

它安装与宿主相同的令牌表与图标 sprite，并在卸载时移除。

### `installDshTheme(cssr?)`

把令牌与文档基线挂到 `document.head`，返回 `{ cssr, dispose }`。传入 `cssr` 可与自有样式共用同一实例。

### `setDshDarkMode(dark)`

DSH 用 body 属性切主题，而非 class 或 data-theme：

```ts
setDshDarkMode(true) // body[data-ds-dark-theme]
```

### 组件约定

- **受控**：`value`/`onChange`、`open`/`onOpenChange`、`selected`/`onSelect`。组件不持有业务状态、不发请求、不读 store
- **插槽是节点**：`children`、`leading`、`trailing`、`actions`、`icon` 接受 `ReactNode`
- **类名作用域**：每个组件用 `useStyle(scope, css)` 把自己的官方类名加前缀，互不冲突

---

## 💡 示例项目

`playground/` 是 Vite 展厅，72 个组件每个都有多状态示例，支持亮/暗主题与筛选：

```sh
pnpm install
pnpm playground

# 打开 http://localhost:5173/#<组件名>
# 加 ?light 切浅色：http://localhost:5173/#select?light
```

组件也可在 DSH 中通过 `cordis.patch.yml` 挂载后直接查看。

## 🛠️ 开发

```sh
pnpm typecheck        # 库与测试
pnpm lint             # 代码风格
pnpm test             # 先构建再跑测试
pnpm audit:fidelity   # 每条声明都可追溯到官方样式表
pnpm gen              # 重新生成 barrel、关系表与技能索引
```

### 升级 DSH

`docs/reference/component-map.json` 记录每个组件对应哪张官方样式表。升级流程见 [`AGENTS.md`](./AGENTS.md)：

```sh
pnpm gen:reference                              # 重新抽取官方样式表
node scripts/generate-component-map.mjs         # 列出与新表不一致的组件
```

第二行输出的清单就是全部工作量，逐个按新表重拷即可。

## 📜️ 许可证

- MIT © [hairyf](https://github.com/hairyf)
- 样式与图标取自 DeepSeek Harness 官方产物，遵循其上游授权

<!-- Badges -->

[npm-version-src]: https://img.shields.io/npm/v/dsh-components?style=flat&colorA=080f12&colorB=1fa669
[npm-version-href]: https://npmjs.com/package/dsh-components
[npm-downloads-src]: https://img.shields.io/npm/dm/dsh-components?style=flat&colorA=080f12&colorB=1fa669
[npm-downloads-href]: https://npmjs.com/package/dsh-components
[bundle-src]: https://img.shields.io/bundlephobia/minzip/dsh-components?style=flat&colorA=080f12&colorB=1fa669&label=minzip
[bundle-href]: https://bundlephobia.com/result?p=dsh-components
[license-src]: https://img.shields.io/github/license/hairyf/dsh-components.svg?style=flat&colorA=080f12&colorB=1fa669
[license-href]: https://github.com/hairyf/dsh-components/blob/main/LICENSE.md
