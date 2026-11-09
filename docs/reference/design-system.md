# DSH 设计系统 · 视觉与尺寸基线（侦察 C）

> **证据等级图例**
> - ✅ **已取证（活页面）**：从运行中的 DSH Web GUI（`http://127.0.0.1:3080`）用 headless Chrome 157 + CDP 读取 `getComputedStyle` / `getBoundingClientRect` / 全部 `document.styleSheets` 规则得到。
> - 📦 **已取证（离线源码）**：从已安装包的 `.module.css` 或 bundle 内联 CSS 读取，未在运行时实测。
> - ⚠️ **未取证**：明确标注，不做猜测。
>
> 活页面优先；离线与活页面冲突时以活页面为准，并在文中标出差异。

## 0. 取证环境（可复现）

| 项 | 值 |
| --- | --- |
| 被测进程 | `DSH Tauri.exe --profile new3 --port 3080`（PID 随会话变化） |
| 令牌位置 | `%APPDATA%\dsh-tauri\logs\new3\dsh-web.log` 最后一行 `dsh web: http://127.0.0.1:3080/?token=…` |
| 鉴权 | 必须带 `?token=`；不带 token 返回 **401**。token 每次启动轮换 |
| 浏览器 | Google Chrome 157.0.8103.38，无头 `--headless=new`，CDP over WebSocket（`--remote-debugging-port=9333`） |
| 视口 | 1440×900（DPR 1）与 1280×800（DPR 1） |
| 主题 | 深色为默认（`document.documentElement` 无 `data-platform`，`<html style="color-scheme: dark">`） |
| 界面语言 | zh-CN |

截图见 `docs/reference/screenshots/`。

## 1. 主题与令牌装载机制 ✅

### 1.1 暗色切换
- 暗色 = **`body[data-ds-dark-theme]` 属性**存在。**没有 `data-theme` 属性**（实测 `document.documentElement.getAttribute('data-theme')` 返回 `null`）。
- `<html data-ds-theme-source="dark">` 仅记录来源，不参与样式匹配。
- 切换是纯 CSS 变量重绑定，无 JS 重算样式表；切换后 `getComputedStyle` 立即生效。

### 1.2 令牌定义站点（全部实测自 `document.styleSheets`）

| 优先级 | 选择器 | 来源样式表 | 承载内容 |
| --- | --- | --- | --- |
| 基础 | `:root` | `@deepseek-ai/dsh-client-ui-theme/base.css` | 字体族、动效、**圆角标尺**（6 个） |
| 基础 | `:root` | `@deepseek-ai/dsh-client-ui-theme/corner-shape.css` | `--dsw-corner-shape: superellipse(1.5)` |
| 基础 | `:root` | `@deepseek-ai/dsh-client-ui-theme/focus.css` | `--dsw-focus-ring-width: 2px` |
| **主令牌** | `body` | `@deepseek-ai/dsh-client-ui-theme/design-platform.css` | **亮色全部 --dsw-static-* + --dsw-alias-*** |
| **主令牌（暗）** | `body[data-ds-dark-theme]` | 同上 | 暗色覆盖 |
| macOS 覆盖 | `html[data-platform="darwin"] body` / `… body[data-ds-dark-theme]` | 同上 | `--dsw-specific-menu` |
| 滚动条 | `body` | `@deepseek-ai/dsh-client-ui-theme/scrollbar.css` | `--dsh-scrollbar-*` |
| 布局 | `html[data-platform="darwin"]` / `html[data-windows-titlebar]` / `.pI_x6G_frame` | `@deepseek-ai/dsh-client-ui-layout/AppFrame.module.css` | `--dsh-frame-*` |

活页面共装载 **198 个 styleSheet**（其中 196 个 `<style>` 由各插件 bundle 注入，带 `data-plugin-css` 标记），合计声明 **689 个 CSS 自定义属性**，`--dsh-`/`--dsw-`/`--ds-` 前缀 **477 个**，其中在 `html`/`body` 上**可解析出具体值的有 431 个**（其余 47 个是组件局部变量，只在特定子树定义，例如 `--dsh-composer-*`、`--dsh-dockkit-*`）。

> 完整机读数据见 `docs/reference/design-tokens.json`（`base` / `light` / `dark` / `darwinLight` / `darwinDark`）。

## 2. 令牌表（核心子集）

> 亮/暗两列为活页面解析值。颜色保留原始写法（含 8 位 hex，形如 `#ffffff29` = rgba(255,255,255,0.16)）。

### 2.1 圆角标尺（亮暗相同）✅

| 变量 | 值 | 用途 |
| --- | --- | --- |
| `--dsw-radius-xs` | `4px` | 极小控件 |
| `--dsw-radius-sm` | `8px` | 小控件 / 图标按钮 / Tooltip / 菜单项次层 |
| `--dsw-radius-md` | `12px` | **主控件圆角**（Button/Input/侧栏行/菜单项） |
| `--dsw-radius-lg` | `16px` | 菜单卡片 / SegmentedTabs 轨道 |
| `--dsw-radius-xl` | `20px` | 大卡片 / 用户气泡 |
| `--dsw-radius-panel` | `28px` | **面板级**（Modal 对话框 / 输入卡片 / 右侧面板） |
| `--dsw-corner-shape` | `superellipse(1.5)` | 全局 `corner-shape`（Chrome 支持时对所有元素生效） |

### 2.2 字体族与动效（亮暗相同）✅

| 变量 | 值 |
| --- | --- |
| `--dsh-font-family-text-default` | `-apple-system, BlinkMacSystemFont, "Segoe UI", "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "Helvetica Neue", Helvetica, Arial, sans-serif` |
| `--dsh-font-family-code-default` | `"SF Mono", "JetBrains Mono", "Fira Code", Consolas, "Liberation Mono", Menlo, Courier, "PingFang SC", "Microsoft YaHei"` |
| `--dsw-font-family-brand` | `"Montserrat", <text-default>` |
| `--ds-ease-in-out` | `cubic-bezier(.4, 0, .2, 1)` |
| `--ds-transition-duration` | `.2s` |
| `--ds-transition-duration-fast` | `.1s` |
| `--ds-transition-duration-slow` | `.3s` |

> ⚠️ 实测差异：`body` 上 `--dsw-font-family` 被重绑为 `var(--dsh-font-family-text), var(--dsh-font-family-text-default)`（两段拼接），因此 `getComputedStyle(body).fontFamily` 里字体栈**重复出现两遍**。这是官方的真实行为，还原时照抄即可。

### 2.3 颜色 · 背景层 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-bg-base` | `#fff` | `#151517` | 应用底色 / 中栏底 |
| `--dsw-alias-bg-layer-1` | `#fff` | `#232324` | 一级浮起层（Input 底 / 指示器） |
| `--dsw-alias-bg-layer-2` | `#fff` | `#2c2c2e` | 二级浮起层（**输入卡片 / Modal / Pill**） |
| `--dsw-alias-bg-layer-3` | `#fff` | `#353638` | 三级浮起层（SegmentedTabs 指示器） |
| `--dsw-alias-bg-module-platform` | `#f5f6f7` | `#353638` | 模块平台底（SegmentedTabs 轨道 / neutral Tag） |
| `--dsw-alias-bg-overlay` | `#e9ecf2` | `#61666b` | 覆盖底色 |
| `--dsw-alias-bg-skeleton` | `#0000000a` | `#ffffff14` | 骨架屏 |
| `--dsw-alias-bg-mask-1` | `#0000003d` | `#00000080` | Modal 遮罩 |
| `--dsw-alias-bg-mask-2` | `#0000001f` | `#0003` | 轻遮罩 |
| `--dsw-alias-bg-mask-drop` | `#ffffffb3` | `#272730b3` | 拖拽落点 |
| `--dsw-specific-sidebar-fill` | `#f9fafb` | `#1b1b1c` | **左 sidebar 底色** |
| `--dsw-specific-sidebar-nav-item-active` | `#ebeef2` | `#43454a` | 侧栏导航选中 |
| `--dsw-specific-sidebar-nav-item-active-accent` | `#e4edfd` | `#353638` | 侧栏选中强调 |
| `--dsw-specific-menu` | `#fcfdfeb3` | `#303136a3` | 菜单填充（半透明） |
| `--dsw-specific-input-major` | `#fff` | `#2c2c2e` | 主输入框 |
| `--dsw-specific-bubble` | `#edf3fe` | `#2c2c2e` | 气泡 |
| `--dsw-specific-tip` | `#f5f6f7` | `#353638` | 提示块 |

### 2.4 颜色 · 边框 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-border-l1` | `#0000000a` | `#ffffff0f` | 最淡描边（菜单高程描边） |
| `--dsw-alias-border-l2` | `#0000001a` | `#ffffff1f` | 分隔线 |
| `--dsw-alias-border-l3` | `#0000001f` | `#ffffff29` | **常规描边**（sidebar 右边线 / Segmented 指示器） |
| `--dsw-alias-border-l4` | `#00000029` | `#fff3` (=rgba(255,255,255,0.2)) | **强描边**（Input / outline Tag） |
| `--dsw-alias-border-inverted` | `#0000` | `#ffffff0f` | 反色描边 |
| `--dsw-alias-border-inverted2` | `#0000` | `#ffffff14` | 反色描边 2 |

### 2.5 颜色 · 文本 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-label-primary` | `#0f1115` | `#f9fafb` | 主文本 |
| `--dsw-alias-label-secondary` | `#61666b` | `#cfd3d6` | 次文本（Pill / 菜单 / 未选中 tab） |
| `--dsw-alias-label-tertiary` | `#81858c` | `#adb2b8` | 三级文本（图标默认 / 工具行 / caption） |
| `--dsw-alias-label-caption` | `#adb2b8` | `#81858c` | 说明文字 |
| `--dsw-alias-label-dimmed` | `#e1e5ee` | `#43454a` | **占位符** |
| `--dsw-alias-label-primary-foreground` | `#fff` | `#0f1115` | 主色块上的文字 |
| `--dsw-alias-label-primary-inverted` | `#fff` | `#353638` | 反色文字 |
| `--dsw-alias-label-primary-dimmed` | `#151517` | `#ebeef2` | 主文本淡化 |
| `--dsw-alias-label-primary-bluish` | `#0e3074` | `#f9fafb` | 蓝调主文本 |
| `--dsw-alias-link` | `#4176e6` | `#7aaaff` | 链接 |

### 2.6 颜色 · 状态 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-state-business-primary` | `#4176e6` | `#7aaaff` | **业务蓝 / 焦点色 / 输入聚焦描边** |
| `--dsw-alias-state-success-primary` | `#22c55e` | `#22c55e` | 成功（StateDot done） |
| `--dsw-alias-state-warn-primary` | `#f59e0b` | `#f59e0b` | 警告 |
| `--dsw-alias-state-error-primary` | `#ec1313` | `#f25a5a` | 错误 |
| `--dsw-alias-state-idle-primary` | `#d4d4d4` | `#545557` | 空闲点 |
| `--dsw-alias-state-done-primary` | `#7c3aed` | `#a78bfa` | 完成（紫） |
| `--dsw-alias-state-warn-label` | `#dd8629` | `#dd8629` | 警告文字 |

### 2.7 颜色 · 交互态与按钮 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsw-alias-interactive-bg-hover` | `#2631480f` | `#ffffff14` | **通用 hover 底**（圆角控件） |
| `--dsw-alias-interactive-bg-active` | `#2631481a` | `#ffffff24` | 通用 active 底 |
| `--dsw-alias-interactive-bg-hover-solid` | `#f1f3f5` | `#353638` | 不透明 hover 底 |
| `--dsw-alias-interactive-bg-hover-danger` | `#ec13130d` | `#f25a5a26` | 危险 hover |
| `--dsw-alias-button-primary-fill` | `#0f1115` | `#f9fafb` | 主按钮底 |
| `--dsw-alias-button-primary-hover` | `#43454a` | `#ebeef2` | 主按钮 hover |
| `--dsw-alias-button-ghost-active-fill` | `#ebeef2` | `#43454a` | Ghost 激活底（Pill active） |
| `--dsw-alias-button-ghost-active-border` | `#979da6` | `#81858c` | Ghost 激活描边 |
| `--dsw-alias-button-elevated-fill` | `#fff` | `#43454a` | 浮起按钮 |
| `--dsw-alias-button-floating-fill` | `#fff` | `#2c2c2e` | 漂浮按钮 |
| `--dsw-alias-button-tool-bar-fill` | `#54555780` | `#54555780` | 工具条按钮 |
| `--dsw-alias-button-info-fill` | `#4176e6` | `#7aaaff` | 信息按钮 |

### 2.8 高程 / 阴影（亮暗仅有描边差）✅

| 变量 | 亮色 | 暗色 |
| --- | --- | --- |
| `--dsw-elevation-soft` | `0 0 0 .5px #00000029, 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008` | `0 0 0 .5px #fff3, 0 4px 16px 0 #00000008, 0 0 24px 0 #00000008` |
| `--dsw-elevation-panel` | `0 0 0 .5px #00000029, 0 3px 8px 0 #00000008, 0 0 16px 0 #00000005` | `0 0 0 .5px #fff3, …` |
| `--dsw-elevation-prominent` | `0 0 0 .5px #00000029, 0 3px 8px 0 #0000000a, 0 0 20px 0 #0000000d` | `0 0 0 .5px #fff3, …` |
| `--dsw-elevation-stroke` | `0 0 0 .5px #00000029` | `0 0 0 .5px #fff3` |
| `--dsw-shadow-lv1` | `0 2px 4px 0 #0000000d` | 同左 |
| `--dsw-shadow-lv3` | `0 0 1px 0 #0003, 0 0 4px 0 #00000005, 0 12px 32px 0 #00000014` | 同左 |

> 还原要点：DSH 的"描边"几乎都是 `0 0 0 .5px` 形式的 **box-shadow 描边**，不是 `border`。这是一个关键视觉特征。

### 2.9 滚动条与浮层 ✅

| 变量 | 亮色 | 暗色 | 用途 |
| --- | --- | --- | --- |
| `--dsh-scrollbar-width` | `5px` | `5px` | 滚动条粗细 |
| `--dsh-scrollbar-thumb` | `#e5e5e5` | `#3c3c3d` | 滑块 |
| `--dsh-scrollbar-thumb-hover` | `#d4d4d4` | `#545557` | 滑块 hover |
| `--dsh-scrollbar-thumb-border` | `0px` | `0px` | 滑块内缩 |
| `--dsh-scrollbar-track-margin` | `0px` | `0px` | 轨道内缩 |
| `--dsw-alias-scrollbar-bg-l2` | `#e5e5e5` | `#545557` | 二级面滚动条 |
| `--dsw-menu-surface-fill` | `#fcfdfeb3` | `#303136a3` | 菜单毛玻璃底 |
| `--dsw-menu-backdrop-filter` | `blur(40px) saturate(150%)` | 同左 | 菜单背景模糊 |
| `--dsw-mask-blur` | `none` | `none` | 遮罩模糊（默认关闭） |
| `--dsw-alias-tooltip-bg` | `#2c2c2e` | `#43454a` | Tooltip 底 |
| `--dsw-alias-toast-bg` | `#353638` | `#43454a` | Toast 底 |
| `--dsw-focus-ring-width` | `2px` | `2px` | 焦点环 |

### 2.10 字号标尺（`--dsw-font-*`，共 182 个，取代表）✅

| 变量 | 值 |
| --- | --- |
| `--dsw-font-base-16` | `16px/24px <text>`（fw 400） |
| `--dsw-font-base-strong-16` | `500 16px/24px` |
| `--dsw-font-m-18` | `500 16px/28px`（注意：名字 18，实际 16px） |
| `--dsw-font-l-20` | `500 20px/28px` |
| `--dsw-font-markdown-base` | `14px / calc(24px + calc(14px - 14px))` → 14/24 |
| `--dsw-font-markdown-base-strong` | `600 14px/24px` |
| `--dsw-font-markdown-h1` | `700 21px/30px` |
| `--dsw-font-markdown-h2` | `700 19px/28px` |
| `--dsw-font-markdown-h3` | `700 18px/26px` |
| `--dsw-font-markdown-h4` | `600 14px/24px` |
| `--dsw-font-markdown-code` | `12px / 19px <code>` |
| `--dsw-font-markdown-code-block` | `11px / 19px <code>` |

> 用户字号缩放通过 `--dsh-content-font-delta` / `--dsh-code-font-delta` 注入（当前两者均为 `calc(14px - 14px)` = 0，即默认 100%）。

## 3. 布局尺寸表（重点）

### 3.1 三栏契约常量 📦（源码：`@deepseek-ai/dsh-client-ui-layout` `lib/types/client/columns.d.ts`）

| 常量 | 值 | 说明 |
| --- | --- | --- |
| `SIDEBAR_DEFAULT` | **280** | 侧栏首次宽度 |
| `SIDEBAR_MIN` | **264** | 拖拽下限 |
| `SIDEBAR_MAX` | **420** | 拖拽上限 |
| `SIDEBAR_COLLAPSED` | **56** | 收起后的图标栏（24px 图标列 + 16px×2 padding） |
| `SIDEBAR_DRAWER_BREAKPOINT` | **768** | 低于此宽度侧栏变抽屉，不占列宽 |
| `SIDEBAR_AUTO_COLLAPSE` | **1024** | 低于此宽度自动收起到 56px rail |
| `RIGHTBAR_MIN` | **300** | 右面板下限 |
| `RIGHTBAR_MAX_RATIO` | **0.7** | 右面板上限 = 视口 70% |
| `RIGHTBAR_DEFAULT_RATIO` | **0.45** | 右面板首开 = 视口 45% |
| `CENTER_MIN` | **400** | 右面板打开时中心区保底 |

**列求解算法（源码原文，可直接照抄）**：

```js
function computeColumns(viewport, sidebar, rightbar, collapsedWidth = 56, centeredSidebar = false) {
  const s = sidebar === 0 ? collapsedWidth
          : centeredSidebar ? viewport / 2
          : clampWidth(sidebar, 264, 420);
  const available = viewport - s - 400;            // 为 center 预留 CENTER_MIN
  const r = rightbar === 0 || available < 300 ? 0  // 放不下就丢掉右列轨道
          : Math.min(available, clampWidth(rightbar, 300, viewport * 0.7));
  return { sidebar: s, center: Math.max(0, viewport - s - r), rightbar: r };
}
// clampWidth(px, min, max) = Math.min(max, Math.max(min, Math.round(px)))
```

**收起列宽 `collapsedWidth`**：`drawer || darwin || windowsTitlebar ? 0 : 56`
（即：抽屉态 / macOS 桌面 / Windows 原生标题栏 三者为 **0**；Web 浏览器为 **56**。）

### 3.2 三栏实际 grid columns ✅（活页面实测，侧栏展开、右栏关闭）

| 视口宽 | `grid-template-columns` | sidebar | center | rightbar | 状态 |
| --- | --- | --- | --- | --- | --- |
| 1600 | `280px 1320px 0px` | 280 | 1320 | 0 | 展开 |
| **1440** | `280px 1160px 0px` | 280 | 1160 | 0 | 展开 |
| **1280** | `280px 1000px 0px` | 280 | 1000 | 0 | 展开 |
| 1180 | `280px 900px 0px` | 280 | 900 | 0 | 展开 |
| 1100 | `280px 820px 0px` | 280 | 820 | 0 | 展开 |
| 1024 | `280px 744px 0px` | 280 | 744 | 0 | 展开（阈值边界，**不**收起） |
| 1000 | `56px 944px 0px` | 56 | 944 | 0 | **自动收起为 rail** |
| 900 | `56px 844px 0px` | 56 | 844 | 0 | rail |
| 800 | `56px 744px 0px` | 56 | 744 | 0 | rail |
| 767 | `0px 767px 0px` | (280，抽屉覆盖) | 767 | 0 | **抽屉态** `data-sidebar-drawer` |
| 700 | `0px 700px 0px` | (280，抽屉覆盖) | 767→700 | 0 | 抽屉态 |

> 结论：**1280×800 与 1440×900 下侧栏都保持在 280px，中栏吃掉剩余宽度。** 这是"固定桌面尺寸、不占满屏幕"最稳的复刻目标。

### 3.3 帧结构 CSS ✅（`@deepseek-ai/dsh-client-ui-layout/AppFrame.module.css`）

```css
.pI_x6G_frame {
  box-sizing: border-box;
  background: var(--dsw-alias-bg-base);
  display: grid;
  grid-template-rows: minmax(0, 1fr) auto;   /* 主区 + 底部行 */
  /* grid-template-columns 由 JS 内联注入, 形如 280px 1160px 0px */
  height: 100%;
  position: relative;
  overflow: hidden;
}
.pI_x6G_sidebarCol { background: var(--dsw-specific-sidebar-fill);
                     border-right: .5px solid var(--dsw-alias-border-l3);
                     grid-area: 1 / 1; min-width: 0; overflow: hidden; }
.pI_x6G_centerCol  { grid-area: 1 / 2; min-width: 0; display: flex; flex-direction: column; overflow: hidden; }
.pI_x6G_rightbarCol{ grid-area: 1 / 3; min-width: 0; position: relative; overflow: visible; }
.pI_x6G_handle     { width: 8px; margin-left: -4px; position: absolute; top: 0; bottom: 0;
                     cursor: col-resize; z-index: 11; touch-action: none; grid-area: 1 / 1 / 2 / -1; }
.pI_x6G_frame[data-animating] { transition: grid-template-columns var(--ds-transition-duration-slow) var(--ds-ease-in-out); }
.pI_x6G_frame[data-dragging]  { transition: none; }
```

实测居中微调（1440×900）：`.pI_x6G_handle` 位于 `x=276, w=8`（即侧栏右缘 280 处 ±4px）；`.pI_x6G_centerCol` `x=280, w=1160, h=900`；`.pI_x6G_rightbarCol` `x=1440, w=0`。

### 3.4 顶部安全区变量

| 变量 | 值 | 证据 |
| --- | --- | --- |
| `--dsh-frame-top-clearance` | `html[data-platform="darwin"]` → **48px**；`html[data-windows-titlebar]` → `var(--dsh-windows-titlebar-height)` | 📦 CSS 规则 |
| `--dsh-frame-overlay-top` | `html[data-platform="darwin"], html[data-windows-titlebar]` → `calc(var(--dsh-frame-top-clearance) + 20px)`；带 `[data-fullscreen]` → **20px** | 📦 CSS 规则 |
| `--dsh-frame-chrome-top` | `html[data-windows-titlebar]` → `var(--dsh-windows-titlebar-height)`；`[data-fullscreen]` → **0px** | 📦 CSS 规则 |
| `--dsh-frame-leading-clearance` | 抽屉 `84px`；darwin 抽屉 `160px`；darwin 侧栏收起 `160px`；darwin 全屏 `84px` | 📦 CSS 规则 |
| `--dsh-windows-content-radius` | `16px`（`[data-windows-titlebar] .pI_x6G_frame`） | 📦 CSS 规则 |
| `--dsh-windows-titlebar-height` | ⚠️ **未取证**：由 Windows 桌面宿主（Tauri）运行时注入，Web 构建中无定义。本机实测该变量在 `html`/`body` 上**为空**（因为 `<html>` 无 `data-platform` 也无 `data-windows-titlebar`） | 实测 |

> **实测重要差异**：Web 环境 `<html>` 上既没有 `data-platform` 也没有 `data-windows-titlebar`，因此 `--dsh-frame-top-clearance` / `--dsh-frame-overlay-top` / `--dsh-frame-chrome-top` **全部未定义（空值）**。所有消费点都写成 `var(--x, 24px)` 之类带兜底的形式。还原时若不做桌面壳，应保持这些变量"未定义"，并给消费点兜底值。

### 3.5 会话区 / 输入区尺寸 ✅（1440×900，会话已打开）

| 元素 | 尺寸 | 关键计算样式 |
| --- | --- | --- |
| `.wSkVaW_root` | 1160×900 @ (280,0) | `display:flex; position:relative; background: var(--dsw-alias-bg-base)` |
| `.wSkVaW_header` | 1160×**76** @ (280,0) | `display:grid; grid-template-columns: auto minmax(0,1fr); min-height:76px; padding:10px 28px 0 20px; border-bottom:.5px solid var(--dsw-alias-border-l3)` |
| `.wSkVaW_body` | 1160×**824** @ (280,76) | 高度 = 900 − 76 |
| `.wSkVaW_scrollBody` | 1158×824 | 滚动容器 |
| `.EvIC1a_column`（消息列） | **742.39** 宽 @ x=485.3 | = `clamp(680px, 会话列宽 × .64, 920px)`；1160×0.64 ≈ 742.4 ✅ |
| `.uV2eYG_card`（输入卡片） | **774.39×98** @ (469.3,772) | `max-width: calc(var(--dsh-chat-content-width) + 32px)` = 742.39+32 = 774.39 ✅；`border-radius: 28px`（`--dsw-radius-panel`） |
| `.uV2eYG_scroll`（编辑器视口） | 770.39×36 | `max-height: 336px` |
| `.uV2eYG_row`（底部操作行） | 774.39×42（内容 758.39×34） | `padding:2px 8px 6px; gap:12px; justify-content:space-between` |
| `.wSkVaW_composerSeat`（空态 hero） | 1153×**238** @ y=351 | hero 态输入区整体座 |
| `.wSkVaW_composerSeat`（会话态） | 1153×**158** @ y=742 | 会话态输入区整体座 |
| `.wSkVaW_widthHandle` | 10×824 | 会话列宽拖拽把手（左右各一） |

> 输入卡片宽度推导链（务必照抄，否则宽度对不上）：
> `--dsh-conversation-column-width`（JS 注入） → `--dsh-chat-content-width: var(--dsh-chat-user-width, clamp(680px, calc(var(--dsh-conversation-column-width) * .64), 920px))` → `--dsh-composer-card-max-width: calc(var(--dsh-chat-content-width) + 32px)`。

### 3.6 侧栏内部尺寸 ✅（280px 展开态，1440×900）

| 元素 | 尺寸 | 关键样式 |
| --- | --- | --- |
| `.hHd-Xa_root` | 280×900 | `padding:6px 8px`；`--dsh-sidebar-inline-padding:8px`、`--dsh-sidebar-row-padding:12px`、`--dsh-sidebar-label-gap:6px`、`--dsh-sidebar-paint-inset:3px`；`background: var(--dsw-specific-sidebar-fill)` |
| `.hHd-Xa_logoRow` | 264×**60** @ (8,6) | `display:flex; padding:8px 0 8px 8px; gap:8px; overflow:hidden`（`data-window-drag="true"`） |
| `.hHd-Xa_brand` | 220×**24** @ (16,24) | 品牌按钮（宽 `wide` 态） |
| `.hHd-Xa_toggle` | **28×28** @ (244,22) | `border-radius:8px`（`--dsw-radius-sm`） |
| `.hHd-Xa_newSession` | 256×**38** @ (12,66) | `padding:8px 12px; margin:0 4px 10px; border-radius:12px; border:1px solid rgba(255,255,255,.16); background: rgb(67,69,74); font-size:14px; font-weight:500; line-height:22px` |
| `.hHd-Xa_panelList` | 264×112 @ (8,114) | 导航列 |
| `.hHd-Xa_panelRow` | 264×**36** @ 114/152/190 | `padding:7px 9px; gap:6px; min-height:36px; border-radius:12px; border-right:3px solid transparent; font-size:14px; line-height:22px` |
| `.hHd-Xa_panelGlyph` | 16×16 | 行图标 |
| `.hHd-Xa_panelTitle` | 高 22 | 行标题 |
| `.hHd-Xa_regionArea` | 276×616 @ (4,234) | `flex:1; overflow:hidden; margin:0 -8px 0 -4px; padding-left:4px` |
| `.hHd-Xa_footArea` / `.hHd-Xa_settingsArea` | 264×**44** @ (8,850) | 底部账户区 |
| `.yHnPSG_trigger`（账户按钮） | 260×**44** @ (10,850) | `padding:6px; gap:8px; border-radius:12px` |
| `.YDXeBa_projectRow` | 264×**34** | `padding:0 8px 0 9px; gap:6px; border-radius:12px` |
| `.YDXeBa_sessionRow` | 264×**32** | `padding:0 8px 0 9px; border-radius:12px`；选中态 `background: rgba(255,255,255,.08)` |
| `.hHd-Xa_moreAnchor` | 264×36 | "更多"行的锚点容器 |

**侧栏收起（rail 56px）** 📦：`.hHd-Xa_root.hHd-Xa_collapsed { padding: 18px 10px 6px }`；`.collapsed .hHd-Xa_logoRow { height:36px; margin-bottom:12px; padding:0 }`；`.collapsed .hHd-Xa_iconButton { width:36px; height:36px; border-radius: var(--dsw-radius-md) }`。

### 3.7 右面板

| 项 | 值 | 证据 |
| --- | --- | --- |
| 首开宽度 | 视口 **45%** | 📦 `RIGHTBAR_DEFAULT_RATIO = 0.45` |
| 上限 | 视口 **70%** | 📦 `RIGHTBAR_MAX_RATIO = 0.7` |
| 最小 | **300px** | 📦 `RIGHTBAR_MIN = 300` |
| 中心保底 | **400px** | 📦 `CENTER_MIN = 400` |
| 实际轨道 | 本次抓取会话右栏为关闭态，`grid-template-columns` 第三列为 `0px` | ✅ 实测 |
| 面板 DOM | `.P3OORG_panel[data-sidebar-right-panel="push|fullscreen"]`，抓取到一次离屏实例 `648×900 @ x=792`（= 1440×0.45 ✅） | ✅ 实测 |

> ⚠️ **未取证**：右面板"打开态"的完整截图与实时交互（本次只捕获到关闭态 + 一个离屏定位实例）。数值契约以常量表为准。

## 4. 组件视觉规格

### 4.1 原子组件（`@deepseek-ai/dsh-client-ui-primitives`，📦 原始 `.module.css`）

#### Button
| 项 | md | sm |
| --- | --- | --- |
| 高度 | **36px** | **28px** |
| 内边距 | `0 14px` | `0 10px` |
| 圆角 | `--dsw-radius-md` = **12px** | `--dsw-radius-sm` = **8px** |
| 字号/行高 | `14px / 22px` | `12px / 18px` |
| 字重 | 继承（400） | 继承 |
| gap | 4px | 4px |
| 图标 | 16×16 | 16×16 |

变体：`primary`（底 `--dsw-alias-button-primary-fill`，字 `--dsw-alias-label-primary-foreground`，hover → `--dsw-alias-button-primary-hover`）；`ghost`（透明，hover → `--dsw-alias-interactive-bg-hover`，active → `--dsw-alias-interactive-bg-active`）；`outline`（`border:.5px solid transparent` + `box-shadow: inset 0 0 0 var(--dsh-hairline-width, .5px) var(--dsw-alias-border-l3)`）；`toolbar`（`--dsw-alias-button-tool-bar-fill`）。
**禁用：`opacity: .4; cursor: not-allowed`**。

#### Input
`height: 32px; padding: 0 8px; gap: 6px; border: .5px solid var(--dsw-alias-border-l4); border-radius: var(--dsw-radius-md)=12px; background: var(--dsw-alias-bg-layer-1)`；`focus-within → border-color: var(--dsw-alias-state-business-primary)`；内部 `input` 无边框/无背景，`font-size:14px; line-height:22px; color: var(--dsw-alias-label-primary)`；placeholder `--dsw-alias-label-dimmed`；前置图标 16×16，色 `--dsw-alias-label-tertiary`。

#### Tag（胶囊标签）
`display:inline-flex; border-radius: 999px; corner-shape: round; padding: 1px 8px; font-size: 11px; line-height: 17px; font-weight: 500; white-space: nowrap`
- `data-tone="outline"`：`border:.5px solid var(--dsw-alias-border-l4); color: var(--dsw-alias-label-tertiary)`
- `data-tone="solid"`：`background: var(--dsw-alias-label-primary); color: var(--dsw-alias-bg-layer-3)`
- `data-tone="neutral"`：`background: var(--dsw-alias-bg-module-platform); color: var(--dsw-alias-label-secondary)`
- `data-tone="quiet"`：`color: var(--dsw-alias-label-tertiary)`
- 状态色（fill = color-mix 10% except warning 12%）：success / info / warning / danger

#### Pill
`height: 24px; padding: 0 8px; gap: 4px; border-radius: 999px; font-size: 12px; line-height: 18px; color: var(--dsw-alias-label-secondary); background: var(--dsw-alias-bg-layer-2)`
- hover（`.interactive`）：`background: var(--dsw-alias-interactive-bg-hover)`
- `.active`：`color: var(--dsw-alias-label-primary); background: var(--dsw-alias-button-ghost-active-fill); box-shadow: inset 0 0 0 1px var(--dsw-alias-button-ghost-active-border)`

#### StateDot
- 实心态：外层 10px 布局槽（`.dot` 继承字号），`::after { inset: 20%; border-radius: 50%; background: currentColor }` → 视觉实心 **6px** 圆点。
- 颜色：`done → --dsw-alias-state-success-primary`、`warning → --dsw-alias-state-warn-primary`、`error → --dsw-alias-state-error-primary`、`idle → --dsw-alias-state-idle-primary`。
- 进行中（`.spinner`）：SVG 环，`stroke-width: 2; stroke-linecap: round`；轨道 `opacity: .25`；弧 `stroke-dasharray: 12 150`；旋转 `1.5s linear infinite`，虚线呼吸 `1.5s ease-in-out infinite`；色 `--dsw-alias-label-tertiary`。
- 步骤态（`.step`）：`border: 1.5px solid var(--dsw-alias-label-tertiary); border-radius: 50%`；done/error 填色。

#### Menu
- 卡片：`padding: 4px; border: 0; border-radius: var(--dsw-radius-lg)=16px`（`compact` 用 `--dsw-radius-md`）；`box-shadow: var(--dsw-elevation-prominent)`；**背景不是 background**，而是一个绝对定位子层 `.material { inset:0; background: var(--dsw-menu-surface-fill); backdrop-filter: var(--dsw-menu-backdrop-filter) }`。
- 尺寸：`min-width: min(144px, 100vw)`，`max-width: min(360px, 100vw)`；`top: calc(100% + 4px)`；z-index `100`（portal 态 `1100`）。
- 进入动画：`dsh-context-menu-in`（opacity 0→1），时长 `--dsh-menu-enter`，`ease-out`。
- **实测（活页面"更多"菜单）**：卡片 `288×76 @ (12,230)`，`padding:4px`，`border-radius:16px`，`box-shadow: rgba(255,255,255,.16) 0 0 0 .5px, rgba(0,0,0,.04) 0 3px 8px, rgba(0,0,0,.05) 0 0 20px`；菜单项 `280×34`，`padding:6px 8px`，`border-radius:12px`，`font-size:13px; line-height:20px; color: rgb(249,250,251)`。

#### Tooltip
`padding: 3px 7px; border-radius: var(--dsw-radius-sm)=8px; background: var(--dsw-alias-tooltip-bg); color: var(--dsw-static-neutral-bluish-00); font-size: 13px; line-height: 20px; white-space: pre-line; position: fixed; z-index: 100 (portal 1100); max-width: min(50vw, 100vw - 24px); pointer-events: none`；动画 `tooltip-in 150ms var(--ds-ease-in-out)`；带快捷键时 `padding-inline-end: 5px`（16px keycap + 20px 标签留 5px）。

#### Modal
- 层：`position: fixed; inset: 0; z-index: 1000; display: flex; align-items: center; justify-content: center; padding: max(24px, var(--dsh-frame-overlay-top, 24px)) 24px`
- 遮罩：`.mask { inset: var(--dsh-frame-chrome-top, 0px) 0 0; backdrop-filter: var(--dsw-mask-blur) }`，`::after { background: var(--dsw-alias-bg-mask-1) }`
- 对话框：`width: min(380px, 100%); padding: 0 0 24px; gap: 20px; border-radius: var(--dsw-radius-panel)=28px; background: var(--dsw-alias-bg-layer-2); box-shadow: var(--dsw-elevation-prominent)`；动画 `modalEnter var(--ds-transition-duration) var(--ds-ease-in-out)`
- 头部：`padding: 22px 14px 12px 24px`；标题 `16px / 24px / 500`；关闭按钮 `28×28`，`border-radius: var(--dsw-radius-sm)=8px`，hover `--dsw-alias-interactive-bg-hover`
- 描述：`padding: 0 24px; font-size:14px; line-height:22px; font-weight:400`

#### SegmentedTabs
- 轨道：`--segmented-tabs-inset: 4px; padding: 4px; border-radius: var(--dsw-radius-lg)=16px; background: var(--dsw-alias-bg-module-platform)`
- 指示器：`inset: 4px auto 4px 4px; border: .5px solid var(--dsw-alias-border-l3); border-radius: var(--dsw-radius-md)=12px; background: var(--dsw-alias-bg-layer-3); transition: transform 180ms ease`
- 选项卡：`height: 34px; padding: 0 12px; border-radius: 12px; font-size:14px; line-height:20px; color: var(--dsw-alias-label-secondary)`；选中 `color: label-primary; font-weight: 600`
- `data-size="sm"`：inset 2px，轨道圆角 `calc(12px + 2px)`，tab 高 **30px**，选中字重 500

#### SegmentedControl（另一种分段控件）
`display:inline-grid; grid-auto-flow:column; grid-auto-columns:1fr; gap:2px; padding:4px; border-radius: var(--dsw-radius-md)=12px; background: var(--dsw-alias-interactive-bg-hover)`；指示器 `border-radius: var(--dsw-radius-sm)=8px; background: var(--dsw-alias-bg-layer-1); box-shadow: var(--dsw-elevation-soft); transition: transform 160ms ease`；tab `height:28px; padding:0 16px; font-size:13px; line-height:20px; font-weight:500`。

### 4.2 应用级组件（✅ 活页面实测，1440×900 深色）

| 组件 | 尺寸 | 关键样式 |
| --- | --- | --- |
| 用户消息气泡 `._bubble_1sgyj_1[data-message-bubble]` | 521.16×218（内容 489.16×198） | `padding:10px 16px; border-radius:20px; background: rgb(44,44,46); font-size:14px; line-height:22px`；右对齐（`display:block`，最大宽 ^{`100%`}） |
| 工具调用行 `.O_Ebla_title[data-process-activity]` | 205.34×24 | `display:flex; gap:6px; align-items:center; font-size:14px; line-height:24px; color: rgb(173,178,184)`（= `--dsw-alias-label-tertiary` 暗色值 `#adb2b8`） |
| 运行中状态行 `.EvIC1a_running[data-chat-running]` | 742.39×32 | `margin-top:12px; font-size:12px; line-height:22px; color: color(srgb .49 .60 .87)` |
| 会话页签 `.wSkVaW_tab.wSkVaW_tabActive` | 46×35 | `padding:10px 10px 9px; margin:-10px -10px 0; font-size:13px; font-weight:500; line-height:16px; color: rgb(122,170,255)`（激活） |
| 子智能体触发器 `.ZKlsPq_trigger` | 109.77×28 | `padding:3px 2px; gap:4px; border-radius:8px; font-size:12px; line-height:18px; color: rgb(173,178,184)` |
| 头部图标按钮 `._button_1ulci_2._ghost_1ulci_46._sm_1ulci_28` | 28×28 | `border-radius:8px; color: rgb(207,211,214)` |
| 输入区"+"按钮 `.uV2eYG_add` | 28×28 | `border-radius:999px; background: rgb(53,54,56); display:grid; grid-template-columns:16px` |
| 权限触发器 `.iWlSmW_trigger` | 100×28 | `padding:0 4px 0 8px; gap:4px; border-radius:8px; font-size:13px; font-weight:500; line-height:20px; color: rgb(207,211,214)` |
| 模型触发器 `._2pt-bW_trigger` | 229.11×28（max 341.28） | `padding:0 4px 0 8px; gap:4px; border-radius:8px; font-size:13px; line-height:20px` |
| 发送按钮 `.uV2eYG_primary` | **34×34** | `border-radius:999px; background: rgb(122,170,255)`（= `--dsw-alias-state-business-primary` 暗色）；`display:grid; grid-template-columns:22px` |
| Todo 面板 `.lXshSW_root` | 742.39 宽（`margin: 0 16px`），高随内容（截取时 12） | `border-radius:16px; background: rgba(48,49,54,.64); backdrop-filter: blur(40px) saturate(1.5); box-shadow: rgba(255,255,255,.06) 0 0 0 .5px, rgba(0,0,0,.03) 0 3px 8px, rgba(0,0,0,.02) 0 0 16px; overflow:clip` |
| Todo 面板内体 `.lXshSW_body` | 718.39×24 | `padding:6px 12px; gap:8px` |

### 4.3 焦点与滚动条 ✅

```css
:root { --dsw-focus-ring-width: 2px; }
:focus-visible { outline-color: var(--dsw-focus-ring-color, var(--dsw-alias-state-business-primary));
                 outline-width: var(--dsw-focus-ring-width); }
html[data-input-modality="pointer"] body :focus-visible:not(:read-write) {
  --dsw-focus-ring-color: transparent; outline-color: rgba(0,0,0,0);   /* 鼠标操作不显示焦点环 */
}

::-webkit-scrollbar { width: var(--dsh-scrollbar-width); height: var(--dsh-scrollbar-width); }  /* 5px */
::-webkit-scrollbar-thumb { border-radius: 999px; background-clip: content-box; corner-shape: round;
                            background-color: var(--dsh-scrollbar-thumb); }
```

## 5. 还原要点速查（给实现用）

1. **不要用 `border` 画描边**，DSH 用 `box-shadow: 0 0 0 .5px …`（`--dsw-elevation-*`）。
2. **圆角三档**：控件 12、卡片/菜单 16、面板 28。少数特例：图标按钮 8、气泡 20、胶囊 999。
3. **侧栏 280 固定**，中栏弹性；1024 以下自动收起 56，768 以下变抽屉（`collapsedWidth=0`）。
4. **输入卡片宽度 = 消息列宽 + 32**；消息列宽 = `clamp(680, 中栏×0.64, 920)`。
5. **会话页头部高 76**，其中 padding-top 10、内容 30、页签行 35。
6. **会话态输入区整体高 158**；hero 空态 238。
7. 全局 `corner-shape: superellipse(1.5)`（Chrome 生效），是 DSH 圆角"更圆润"的来源。
8. 字号基准 `html 16px`；正文 markdown 14/24；代码 12/19。

## 6. 未取证清单（明确不做猜测）

| 项 | 状态 | 说明 |
| --- | --- | --- |
| `--dsh-windows-titlebar-height` 实际像素 | ⚠️ 未取证 | 由 Windows 桌面宿主注入，Web 构建无定义 |
| macOS（`data-platform="darwin"`）运行时外观 | ⚠️ 未取证 | 只有 CSS 规则，无 darwin 环境实测；`darwinLight/Dark` 仅合并了 `--dsw-specific-menu` 一条覆盖 |
| 右侧面板打开态截图 | ⚠️ 未取证 | 抓取时右栏为关闭态；仅有一个离屏 `648×900 @ x=792` 实例与常量表 |
| 设置页（Settings）整页 | ⚠️ 未取证 | 未导航进入；仅有其 CSS 类名（`.settings_cfg` 等） |
| Modal / Tooltip / Toast / HoverCard 活页面实例 | ⚠️ 未取证 | 规格来自 primitives 的 `.module.css`（📦） |
| 亮色主题整页截图 | ✅ 已取证 | `screenshots/full-light-{1440x900,1280x800}.png`（注：亮/暗截图取自同一页面强制切换，非重新加载） |
| 折叠 rail 的整页截图 | ⚠️ 未取证 | 只做了 1024→1000 的宽度扫描与 CSS 规则，无 56px rail 截图 |
