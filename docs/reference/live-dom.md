# DSH 活页面 DOM 结构（侦察 C）

> 全部来自 `http://127.0.0.1:3080` 的真实渲染结果（headless Chrome + CDP）。1440×900，深色主题，zh-CN。
> class 名是 **CSS Module 哈希前缀 + 语义名**（如 `hHd-Xa_panelRow` → 语义名 `panelRow`；前缀 `hHd-Xa` 对应 `@deepseek-ai/dsh-client-ui-sidebar/SidebarRoot.module.css`）。
> 布局矩形格式：`w×h @ (x,y)`。
> **未取证**的节点在文中显式标注。

## 1. 文档骨架

```html
<html lang="zh-CN" data-ds-theme-source="dark"
      style="--dsh-hairline-width: 1px; color-scheme: dark; --dsh-sidebar-height: 0px;"
      data-dsh-composer-cwd="1">
  <head>… 196 个 <style data-plugin-css="…"> + 1 个 <style id>…</head>
  <body data-ds-dark-theme style="…">          <!-- 暗色开关就是这个属性 -->
    <svg>…</svg>                                 <!-- 图标 sprite（196 个 symbol） -->
    <script>…</script> <script>…</script>
    <div id="root">
      <div>                                      <!-- 空壳 wrapper -->
        <div data-slot="root">
          <div class="pI_x6G_frame" data-rightbar-collapsed="true"> … </div>
        </div>
      </div>
    </div>
    <div></div>                                  <!-- 通知/挂载点 -->
    <span class="nArs4W_dockFallback"></span>    <!-- DockKit 兜底 -->
  </body>
</html>
```

- `#root` 实测 **1440×900 @ (0,0)**。
- `body` 背景：暗色 `rgb(21,21,23)`（`--dsw-alias-bg-base`），亮色 `rgb(255,255,255)`；文字 暗 `rgb(249,250,251)` / 亮 `rgb(15,17,21)`。
- `<html>` 上 **没有** `data-platform`、`data-theme`；`color-scheme` 由内联 style 设为 `dark`。

## 2. 三段式外壳（AppFrame）— `@deepseek-ai/dsh-client-ui-layout/AppFrame.module.css`

```
div.pI_x6G_frame [data-rightbar-collapsed=true]                      1440×900 @ (0,0)
├─ div.pI_x6G_sidebarCol                                            280×900  @ (0,0)
│   └─ div [data-slot=sidebar] (display:contents)
│       └─ div.hHd-Xa_root.hHd-Xa_quietBars                         280×900  @ (0,0)
├─ div.pI_x6G_centerCol                                             1160×900 @ (280,0)
│   └─ div.pI_x6G_mainPanel [data-dsh-center-col]                   1160×900 @ (280,0)
│       └─ div [data-slot=main] → div [data-slot=main.conversation]
│           └─ div.wSkVaW_root [data-phase=hero|active]             1160×900 @ (280,0)
├─ div.pI_x6G_rightbarCol [data-rightbar-col=true]                  0×900    @ (1440,0)
│   └─ div [data-slot=rightbar]
│       └─ div.P3OORG_session [data-sidebar-right-session="session-…"]
│           └─ div [data-slot=rightbar.session]
│               └─ div.P3OORG_panel [data-sidebar-right-panel=push]  (关闭时离屏)
├─ div.pI_x6G_bottomRow [data-shell-bottom=true]                    1440×0   @ (0,900)
│   └─ div [data-slot=shell.bottom]
│       └─ section#:rv:.USbtZq_panel [data-inspector-panel=true]
│           └─ header.USbtZq_header > span + button._button_1ulci_2._ghost_1ulci_46._sm_1ulci_28.USbtZq_close
├─ div.pI_x6G_overlayLayer [data-shell-overlay=true]                1440×900 @ (0,0)
│   └─ div [data-slot=shell.overlay]
│       └─ span._root_1p5el_1                                        (菜单/浮层锚点, 0 宽)
└─ div.pI_x6G_handle [data-side=sidebar]                            8×900    @ (276,0)
```

要点：
1. **slot 机制**：几乎每个语义节点都是 `<div data-slot="…" style="display: contents">`，真实内容在下一层。**还原时必须保留这层 wrapper（或直接省略它的盒子）**，否则 flex/grid 层级会错。
2. `pI_x6G_frame` 用 `grid-template-rows: minmax(0,1fr) auto`，列由 JS 内联注入，实测 `280px 1160px 0px`。
3. 侧栏右缘拖拽把手 `pI_x6G_handle` 绝对定位在 `x=276`（宽 8，`margin-left:-4px`），视觉上覆盖 276–284。
4. `.pI_x6G_sidebarCol` 有 `border-right: .5px solid var(--dsw-alias-border-l3)`；**暗色下实测 computed border 为 `0px none`**（被 `[data-windows-titlebar]` 之外的另一条规则覆盖，实测值以 computed 为准：无可见右边框，靠底色差分层）。

## 3. 左侧栏（`@deepseek-ai/dsh-client-ui-sidebar`）

```
div.hHd-Xa_root.hHd-Xa_quietBars                                     280×900 @ (0,0)
├─ div.hHd-Xa_logoRow [data-window-drag=true]                        264×60  @ (8,6)
│   ├─ button.hHd-Xa_brand.hHd-Xa_wide                                220×24  @ (16,24)
│   └─ button.hHd-Xa_iconButton.hHd-Xa_toggle [data-sidebar-toggle]   28×28   @ (244,22)
├─ button.hHd-Xa_newSession                                          256×38  @ (12,66)
│   ├─ span.hHd-Xa_newSessionLabelMask                               159.28×22 @ (25,74)
│   └─ span.hHd-Xa_newSessionShortcut (opacity:0 常态)                70.72×16 @ (184.28,77)
├─ nav.hHd-Xa_panelList                                              264×112 @ (8,114)
│   ├─ button.hHd-Xa_panelRow          264×36 @ (8,114)   插件
│   │   ├─ span.hHd-Xa_panelGlyph       16×16  @ (20,124)
│   │   └─ span.hHd-Xa_panelTitle.hHd-Xa_wide  28×22 @ (42,121)
│   ├─ button.hHd-Xa_panelRow          264×36 @ (8,152)   自动化任务
│   └─ span._root_1p5el_1.hHd-Xa_moreAnchor   264×36 @ (8,190)   ← 更多（内含 button）
├─ div.hHd-Xa_regionArea                                             276×616 @ (4,234)
│   └─ div [data-slot=sidebar.workspaces]   ← 工作区/会话列表插槽
└─ div.hHd-Xa_footArea                                               264×44  @ (8,850)
    ├─ div.hHd-Xa_footerActions                                       264×0
    └─ div.hHd-Xa_settingsArea                                        264×44
        └─ button.yHnPSG_trigger [data-collapsed=false][data-signed-out=false]  260×44 @ (10,850)
```

### 3.1 工作区行 / 会话行（`YDXeBa_*`，属工作区插件）

```
div.YDXeBa_projectRow [data-row-key="workspace:<uuid>"]   264×34 @ (8,276)
   └─ (图标 16×16) + 文本「dsh-components」

div.YDXeBa_sessionRow[.YDXeBa_selected] [data-row-key="session:session-<uuid>"]  264×32 @ (8,464)
   ├─ 状态点（StateDot，10px 槽）+ 标题 + 相对时间
   └─ 选中态：background rgba(255,255,255,.08)
```

实测行高 **项目行 34px / 会话行 32px**，行间距 4–6px，左内边距 9px、右 8px，圆角 12px。

### 3.2 收起态（rail 56px）
`div.hHd-Xa_root.hHd-Xa_collapsed`（`.hHd-Xa_railIn` 为展开动画过程态）。
- `padding: 18px 10px 6px`
- `.hHd-Xa_logoRow` 高 36、`margin-bottom: 12px`
- `.hHd-Xa_iconButton` 36×36，圆角 `--dsw-radius-md`
- ⚠️ **未取证**：56px rail 的实际截图（做过宽度扫描，DOM 结构为 CSS 规则推导）。

## 4. 会话区（`@deepseek-ai/dsh-client-ui-conversation`）

### 4.1 Hero（新会话空态，`data-phase="hero"`）

```
div.wSkVaW_root [data-phase=hero]                       1160×900 @ (280,0)
├─ header.wSkVaW_header.wSkVaW_headerBlank               1160×40 @ (280,0)   ← 空态头部只有 40 高
└─ div.wSkVaW_composerSeat                               1153×238 @ (280,351) ← 纵向居中
```

Hero 态可见内容（实测文本）：`探索未至之境` + `预览版` 徽标 → 工作区行 `wSkVaW_heroWorkspaceRow`（806×28 @ (453,407)）→ 输入卡片。

### 4.2 会话态（`data-phase="active"`）总体

```
div.wSkVaW_root [data-phase=active]                      1160×900 @ (280,0)
├─ header.wSkVaW_header                                  1160×76  @ (280,0)
│   ├─ grid-template-columns: 0px 1112px; padding: 10px 28px 0 20px
│   ├─ 行1（30px）：标题 button.ZKlsPq_trigger(109.77×28) + 页签/图标按钮组（右侧，28×28 each）
│   └─ 行2：button.wSkVaW_tab.wSkVaW_tabActive 46×35 @ (298,40)  「对话」…
└─ div.wSkVaW_body                                       1160×824 @ (280,76)
    [data-conversation-content][data-conversation-region=chat][data-content-phase=active]
    ├─ div.wSkVaW_scrollBody [data-conversation-scroll]   1158×824 @ (280,76)
    │   ├─ div [data-slot=conversation.session] (contents)
    │   └─ div.wSkVaW_viewArea                          1153×666 @ (280,76)
    │       ├─ div [data-slot=conversation.view] (contents)
    │       │   └─ div.EvIC1a_frame → div.EvIC1a_root [data-chat-following-tail]
    │       │       └─ div.EvIC1a_scroll              1153×404 @ (280,76)
    │       │           └─ div.EvIC1a_column [data-chat-flow]  742.39×372 @ (485.3,92)
    │       │               ├─ div [data-slot=conversation.chat.flow] (contents)
    │       │               │   ├─ div.EvIC1a_flowItem [data-chat-flow-kind=user]        742.39×252 @ (485.3,92)
    │       │               │   ├─ div.EvIC1a_flowItem [data-chat-flow-kind=assistant-step] 742.39×24 @ (485.3,360)
    │       │               │   ├─ div.O_Ebla_root [data-step-process] (工具组)          742.39×24 @ (485.3,396)
    │       │               │   └─ div.EvIC1a_running [data-chat-running]                742.39×32 @ (485.3,432)
    │       │               └─ …
    │       └─ div.wSkVaW_composerSeat                  1153×158 @ (280,742)
    │           └─ div [data-slot=conversation.composer] (contents)
    ├─ div.wSkVaW_widthHandle                            10×824 @ (454.81,76)
    └─ div.wSkVaW_widthHandle                            10×824 @ (1255.19,76)
```

**关键 data 属性（用于还原语义层级）**：
- `EvIC1a_flowItem` 上：`data-chat-flow-kind`（`user` / `assistant-step`）、`data-chat-turn`、`data-chat-node-key`、`data-chat-flow-key`、`data-chat-anchor-key`、`data-chat-paging-anchor`、`data-chat-group-part`。
- 每个 flowItem 内固定有一层 `div[data-slot="conversation.chat.node"]`。

### 4.3 用户消息气泡

```
div.EvIC1a_flowItem [data-chat-flow-kind=user]        742.39×252 @ (485.3,92)
└─ div [data-slot=conversation.chat.node] (contents)
    └─ div.Sixlwa_userRow                            742.39×252 @ (485.3,92)
        └─ div.Sixlwa_userStack                      521.16×218 @ (706.53,92)   ← 右对齐
            └─ div._bubble_1sgyj_1 [data-message-bubble][data-text-interaction-source]
                                                        521.16×218 @ (706.53,92)
                ├─ span.BNl2La_root                    0×0   ← 引用/斜杠 chip 容器
                ├─ span [data-slot=conversation.user.text.n] (contents)
                └─ button._refChip_fbulu_11._slashChip_fbulu_30._fileMention_rve47_92
                      [data-ref-chip=skill]             48.95×22 @ (722.53,102)
```

气泡样式：`padding:10px 16px; border-radius:20px; background:#2c2c2e(暗)/#edf3fe(亮—见 --dsw-specific-bubble); font-size:14px; line-height:22px`。

### 4.4 助手正文

```
div.EvIC1a_flowItem [data-chat-group-part=response]   742.39×24 @ (485.3,360)
└─ div [data-slot=conversation.chat.node] (contents)
    └─ div.hWmORq_root                               742.39×24
        └─ div.hWmORq_body
            └─ div._markdown_rve47_5 [data-text-interaction-source]
                └─ p
```

### 4.5 工具调用 / 步骤过程

```
div.O_Ebla_root [data-step-process=true]
      [data-chat-group-key='["process","9:tool-call…"]']
      [data-chat-flow-key='["process",…]']
      [data-chat-anchor-key='group:["process","9:tool…"]']
      [data-chat-turn=1][data-chat-paging-anchor]        742.39×24 @ (485.3,396)
└─ div (contents)
    └─ button.O_Ebla_title [data-process-activity=tools] 205.34×24 @ (485.3,396)
        └─ span._root_1rdzk_1 [data-shimmer=true]         183.34×24
            └─ span._content_1rdzk_11
                └─ span._text_1rdzk_17.O_Ebla_label    「正在调用工具 · wait_subagent」
```

要点：工具行是 **button + shimmer 文本**，颜色 `--dsw-alias-label-tertiary`，行高 24，gap 6。

### 4.6 运行中状态行

```
div.EvIC1a_running [data-chat-running=true]             742.39×32 @ (485.3,432)
├─ span.TTCZqG_visuallyHidden (1×1, 无障碍文本)
└─ 可见文本：「深度求索中，用时 5分39秒 ···」
```

### 4.7 输入区（composer）完整结构

```
div.wSkVaW_composerSeat                                 1153×158 @ (280,742)
└─ div [data-slot=conversation.composer] (contents)
    └─ div[data-chain-overlay-fallback=conversation.composer] (contents)
        └─ div.wSkVaW_composerStack         1153×158  gap:6px  (flex 纵向)
            ├─ div [data-slot=conversation.input.dock]        774.39×24 @ (469.3,742)
            │   ├─ section.lXshSW_root [data-testid=todo-panel][aria-label=任务]
            │   │     742.39 宽, margin:0 16px, border-radius:16px,
            │   │     background: rgba(48,49,54,.64), backdrop-filter: blur(40px) saturate(1.5),
            │   │     box-shadow: rgba(255,255,255,.06) 0 0 0 .5px, …
            │   │   └─ div.lXshSW_body            718.39×24, padding:6px 12px, gap:8px
            │   │       └─ button.lXshSW_header   718.39×24, gap:10px
            │   ├─ div.dbg-dock                    742.39 宽 (队列/目标条, 插件)
            │   └─ div.dbg-dock                    742.39×0
            ├─ div [data-slot=conversation.composer.bar] (contents)
            │   └─ div.uV2eYG_root                 1153×128, padding:0 16px 4px
            │       └─ div.uV2eYG_card             774.39×98 @ (469.3,772)
            │              padding:8px 0 0; gap:12px; border-radius:28px;
            │              background:#2c2c2e; box-shadow: rgba(255,255,255,.12) 0 0 0 .5px,
            │              rgba(0,0,0,.03) 0 4px 16px, rgba(0,0,0,.03) 0 0 24px
            │           ├─ div.uV2eYG_overlayAnchor        774.39×0 (absolute)
            │           ├─ div [data-slot=conversation.input.attachments] (contents)
            │           ├─ div.uV2eYG_scroll               770.39×36, max-height:336px
            │           │   └─ [contenteditable=true].uV2eYG_input  770.39×52
            │           ├─ div.uV2eYG_row                  758.39×34, padding:2px 8px 6px, gap:12px
            │           │   ├─ button.uV2eYG_add           28×28, radius 999, bg #353638
            │           │   ├─ button.iWlSmW_trigger       100×28 「完全权限」
            │           │   ├─ (spacer)
            │           │   ├─ button._2pt-bW_trigger      229.11×28 「DeepSeek Flash @ NearToken Max」
            │           │   └─ button.uV2eYG_primary       34×34, radius 999, bg rgb(122,170,255)
            │           ├─ div [data-slot=conversation.composer.dock] (contents)
            │           └─ span.JObwrW_root                53.66×22
            └─ (hero 态独有) div.uV2eYG_dock               395.98×22 @ y=870
```

**输入区插槽（slot）清单**（还原时可据此预留扩展点）：
`conversation.composer` / `conversation.input.dock` / `conversation.composer.bar` /
`conversation.input.overlay` / `conversation.input.attachments` / `conversation.input.permission` /
`conversation.input.plan` / `conversation.input.left` / `conversation.input.right` /
`conversation.input.model` / `conversation.input.activity` / `conversation.composer.dock`。

### 4.8 Hero 态工作区行（实测）

```
div.wSkVaW_heroWorkspaceRow                 806×28 @ (453,407)
├─ button (inline-flex …) [data-hero-workspace=1]  209×28 @ (473,407)  「deepseek-harness-desktop」
└─ button.cubgiG_seat                        137×28 @ (686,407)  「工程(PTC)模式」
```

## 5. 菜单 / 浮层（`@deepseek-ai/dsh-client-ui-context-menu` + primitives）

点击侧栏「更多」后实测：

```
div._surface_1w4el_1._list_1p5el_7.hHd-Xa_moreMenu._scrollable_1p5el_19
    [role=menu]                                288×76 @ (12,230)
    padding:4px; border-radius:16px;
    box-shadow: rgba(255,255,255,.16) 0 0 0 .5px, rgba(0,0,0,.04) 0 3px 8px, rgba(0,0,0,.05) 0 0 20px
    background: rgba(0,0,0,0)   ← 背景由子层 .material 绘制
├─ div.material (absolute inset:0, background: var(--dsw-menu-surface-fill),
│                backdrop-filter: blur(40px) saturate(150%), z-index:-1)   ← 结构性推断
├─ div._item_1p5el_105 [role=menuitem]        280×34 @ (16,234)
│     padding:6px 8px; border-radius:12px; font-size:13px; line-height:20px  「浏览更多插件」
└─ div._item_1p5el_105 [role=menuitem]        280×34 @ (16,268)              「创建你的插件」
```

> `.material` 子层来自 primitives 的 `MenuSurface.module.css`（📦），活页面未单独抓取该节点，结构为源码推导 —— 标注为**部分未取证**。

触发行的选中态：`button.hHd-Xa_panelRow` 在菜单打开时 `background: rgba(255,255,255,.08)`。

## 6. 未取证

| 区域 | 状态 | 说明 |
| --- | --- | --- |
| Modal 对话框 DOM | ⚠️ 未取证 | 规格来自 `Modal.module.css` |
| Tooltip DOM | ⚠️ 未取证 | 规格来自 `Tooltip.module.css` |
| Toast / HoverCard | ⚠️ 未取证 | 有 `.module.css`，无活页面实例 |
| 设置页（Settings） | ⚠️ 未取证 | 未导航进入；类名如 `.settings_cfg` 出现在样式表中 |
| 右侧面板打开态 | ⚠️ 未取证 | 抓取时会话右栏关闭；仅见 `P3OORG_panel` 离屏实例 `648×900 @ x=792` |
| 折叠 rail（56px）可见态 | ⚠️ 未取证 | 仅宽度扫描 + CSS 规则 |
| 各插件自定义页面（插件管理/市场/统计等） | ⚠️ 未取证 | 未逐一进入 |

## 7. 还原时最容易踩的坑

1. **`display: contents` 的 slot wrapper** 遍布全树；直接按 DOM 复制成 `<div>` 会多出盒子，破坏 flex 间距。
2. `.wSkVaW_body` 高度 = 视口 − 头部 76；头部高度在 hero 态是 **40**，active 态是 **76** —— 同一个 class，两种高度。
3. 会话列宽 742.39 不是整数：它来自 `clamp(680px, 中栏×0.64, 920px)`，中栏 1160.5 → 742.4（受滚动条 2px 影响，`scrollBody` 1158 = 1160 − 2）。**直接用常量会导致 0.4px 级偏差**。
4. 输入卡片圆角是 **28px**（`--dsw-radius-panel`），不是 12/16。
5. 侧栏底色与中栏底色不同：暗色 `#1b1b1c` vs `#151517`。
