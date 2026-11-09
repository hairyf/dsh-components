# Puck 0.23 多区域（多 DropZone）API 侦察

> 取证对象：本地已安装的 `@puckeditor/core@0.23.0`（下称 puck）。
> 类型原文摘自：
> - `playground/node_modules/@puckeditor/core/dist/actions-DA1J5F56.d.ts`（861 行，全部核心类型）
> - `playground/node_modules/@puckeditor/core/dist/index.d.ts`（327 行，公开组件与 PuckProps）
> - `playground/node_modules/@puckeditor/core/dist/index-DIZKfHDN.d.ts`（store 形状、dictionary）
> - `playground/node_modules/@puckeditor/core/dist/walk-tree-DbY5zG2K.d.ts`（migrate / transformProps / resolveAllData / walkTree）
> 运行时语义摘自 `dist/chunk-*.mjs`（tsup 打包，源码路径保留在 `// lib/...` 注释里）。
> 未采信任何线上文档。

## 0. 结论速查（按对本项目关键度排序）

| # | 结论 | 证据 |
| - | ---- | ---- |
| 1 | **puck.renderDropZone() 在 0.23 已被官方弃用**，运行时会打 console 警告，官方建议改用 **slot 字段**（slot 字段内部渲染的就是同一个 DropZone 组件） | `chunk-55V3NZVF.mjs:5992-6000`（警告原文见 §3.3） |
| 2 | 每个插槽点 = 一个 zone。zone 的**复合 id 恒为** `<parentComponentId>:<zoneName>`；根 zone 固定为 `root:default-zone` | `chunk-55V3NZVF.mjs:5962-5968`、`chunk-H65MT2JK.mjs:214-216` |
| 3 | **两种区域 = 两种存储位置**：slot 字段的内容内联在 `props.<fieldName>`（Content 数组）；动态 renderDropZone 的内容放在顶层 `data.zones["<compId>:<zone>"]` | `chunk-H65MT2JK.mjs:15-18`、`chunk-YQWFSBOU.mjs:193-205`、`chunk-55V3NZVF.mjs:6191-6193` |
| 4 | DropZone 的参数就是 `DropZoneProps`（8 个字段，只有 zone 必填）；编辑态 `minEmptyHeight` 默认 `'128px'` | `actions-DA1J5F56.d.ts:341-351`；`chunk-55V3NZVF.mjs:5943` |
| 5 | **没有公开的 diff API**。要"只取变化内容"，用 `onAction` 拿逐条 `PuckAction`，或对 `onChange` 的全量 Data 自己做结构化 diff（`walkTree` / `setDeep` 可辅助遍历与写回） | `index.d.ts:130`、`actions-DA1J5F56.d.ts:795-859`、`walk-tree-DbY5zG2K.d.ts:27`、`index.d.ts:250-257` |
| 6 | `Field` 联合共 **12 个成员 / 11 个 type 名**：text / number / textarea / select / radio / richtext / array / object / external（两种形状：`fetchList` 与 `adaptor`）/ custom / **slot** | `actions-DA1J5F56.d.ts:325-327` |

## 1. 包入口

```json
".":               { "react-server" -> ./dist/rsc.{d.ts,mjs,js}, "default" -> ./dist/index.{d.ts,mjs,js} }
"./rsc":           ./dist/rsc.*
"./internal":      ./dist/internal.*
"./puck.css":      ./dist/index.css
"./no-external.css": ./dist/no-external.css
"./package.json":  ./package.json
```

react-server / RSC 环境下入口换成 `rsc`：`dist/rsc.d.ts` 只导出 `Render` 与 `migrate / resolveAllData / transformProps / walkTree`（没有 `<Puck>` 编辑器），且 RSC 版 `Render` 的 `data` 是 **`G["UserData"]`（非 Partial）**。

## 2. Config 完整类型

`actions-DA1J5F56.d.ts:458-492`：

```ts
type Category<ComponentName> = {
  components?: ComponentName[]
  title?: string
  visible?: boolean
  defaultExpanded?: boolean
}

type ConfigInternal<
  Props extends DefaultComponents = DefaultComponents,
  RootProps extends DefaultComponentProps = DefaultComponentProps,
  CategoryName extends string = string,
  UserField extends {} = {},
> = {
  categories?: Record<CategoryName, Category<keyof Props>> & { other?: Category<keyof Props> }
  components: {
    [ComponentName in keyof Props]: Omit<
      ComponentConfigInternal<Props[ComponentName], Props[ComponentName], Omit<ComponentData<Props[ComponentName]>, "type">, UserField>,
      "type"
    >
  }
  root?: RootConfigInternal<RootProps, UserField>
}

type ConfigParams<Components extends DefaultComponents = DefaultComponents, RootProps extends DefaultComponentProps = any, CategoryNames extends string[] = string[], UserFields extends FieldsExtension = FieldsExtension> = {
  components?: Components
  root?: RootProps
  categories?: CategoryNames
  fields?: AssertHasValue<UserFields>
}

type Config<PropsOrParams extends LeftOrExactRight<...> = DefaultComponents | ConfigParams, RootProps extends DefaultComponentProps = any, CategoryName extends string = string>
```

两种等效写法：

```ts
// A. 简单写法：只给 props 映射，root 用泛型补
const configA: Config<{ HeadingBlock: { title: string } }> = { components: { /* ... */ } }

// B. 参数写法：显式声明 root props / categories 字面量 / 自定义字段类型
const configB: Config<{
  components: { HeadingBlock: { title: string } }
  root: { title: string }
  categories: ["layout", "dsl"]
  fields: { color: { type: "color" } }   // 扩展自定义字段类型
}> = { /* ... */ }
```

- `components` 在 `ConfigInternal` 里**必填**（`ConfigParams` 里可选，是因为它同时服务于泛型推导）。
- 解包逻辑见 `ExtractConfigParams`（`actions-DA1J5F56.d.ts:475-482`）与 `UserGenerics`（`:385-395`）。

## 3. ComponentConfig 与 render 收到的 props

### 3.1 全量定义（`actions-DA1J5F56.d.ts:410-455`）

```ts
interface ComponentConfigExtensions {}   // 空接口，供 declaration merging

type ComponentConfigInternal<RenderProps extends DefaultComponentProps, FieldProps extends DefaultComponentProps,
  DataShape = Omit<ComponentData<FieldProps>, "type">, UserField extends BaseField = {}> = {
  render: PuckComponent<RenderProps>
  label?: string
  defaultProps?: FieldProps
  fields?: Fields<FieldProps, UserField>
  permissions?: Partial<Permissions>
  inline?: boolean
  resolveFields?: (data: DataShape, params: {
    changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>
    fields: Fields<FieldProps>; lastFields: Fields<FieldProps>
    lastData: DataShape | null; metadata: ComponentMetadata; appState: AppState
    parent: ComponentData | null
  }) => Promise<Fields<FieldProps>> | Fields<FieldProps>
  resolveData?: (data: DataShape, params: {
    changed: Partial<Record<keyof FieldProps, boolean> & { id: string }>
    lastData: DataShape | null; metadata: ComponentMetadata
    trigger: ResolveDataTrigger            // "insert" | "replace" | "load" | "force" | "move"
    parent: ComponentData | null; root: RootData
  }) => Promise<WithPartialProps<DataShape, FieldProps>> | WithPartialProps<DataShape, FieldProps>
  resolvePermissions?: (data: DataShape, params: { /* ... */ }) => Promise<Partial<Permissions>> | Partial<Permissions>
  metadata?: ComponentMetadata
} & ComponentConfigExtensions

type RootConfig<RootPropsOrParams> = Partial<RootConfigInternal<WithChildren<Props>, /* ... */>>
```

### 3.2 render 的 props 形状（`actions-DA1J5F56.d.ts:374-405`）

```ts
type WithId<Props> = Props & { id: string }
type WithPuckProps<Props> = Props & { puck: PuckContext; editMode?: boolean }
type PuckComponent<Props> = (props: WithId<WithPuckProps<{
  [K in keyof Props]: WithDeepSlots<Props[K], SlotComponent>
}>>) => JSX.Element

type PuckContext = {
  renderDropZone: (props: DropZoneProps) => React.ReactNode
  metadata: Metadata
  isEditing: boolean
  dragRef: ((element: Element | null) => void) | null
}
```

即 `render({ id, puck, editMode, ...fields })`。`editMode` 已标注 DEPRECATED（`chunk-55V3NZVF.mjs:5857`），等价于 `puck.isEditing`。

### 3.3 renderDropZone 的完整签名

参数类型就是 `DropZoneProps`（`actions-DA1J5F56.d.ts:341-351`，逐字）：

```ts
type DropZoneProps = {
  zone: string
  allow?: string[]
  disallow?: string[]
  style?: CSSProperties
  minEmptyHeight?: CSSProperties["minHeight"] | number
  className?: string
  collisionAxis?: DragAxis          // "dynamic" | "y" | "x"
  as?: ElementType
  ref?: Ref<any>
}
```

运行时语义（编辑态 `chunk-55V3NZVF.mjs:5936-6000`）：

- `zone` 是**区域名**，不是最终 key；最终 key 是 `zoneCompound`：

```js
let zoneCompound = rootDroppableId                 // "root:default-zone"
if (areaId) { if (zone !== rootDroppableId) zoneCompound = areaId + ":" + zone }
```

  `areaId` 来自上下文，等于当前组件实例的 `props.id`；常量 `rootAreaId = "root"`、`rootZone = "default-zone"`、`rootDroppableId = rootAreaId + ":" + rootZone`（`chunk-H65MT2JK.mjs:214-216`）。
- `minEmptyHeight` 默认 `'128px'`（`:5943`）。
- `allow` / `disallow` 传**组件类型名**（config.components 的 key），过滤函数 `isComponentAllowed(type, { allow, disallow })`（`:6005-6008`）。
- `as` 换容器元素；`style` / `className` 落在容器；`collisionAxis` 控制拖拽碰撞轴。
- 编辑态与渲染态是两套实现：`DropZoneEdit`（`:5936`）与 `DropZoneRender`（`:6173`，从 `data.zones[zoneCompound]` 取内容，`:6191-6193`）。RSC 版本在 `dist/rsc.mjs:63-91`。

**重要：0.23 已弃用动态 DropZone。** 当 zone 的 `type === "dropzone"` 且不是根 zone 时，运行时打印（`chunk-55V3NZVF.mjs:5992-6000`，原文）：

```js
console.warn(
  "DropZones have been deprecated in favor of slot fields and will be removed in a future version of Puck. " +
  "Please see the migration guide: https://www.puckeditor.com/docs/guides/migrations/dropzones-to-slots",
)
```

所以"官方每个插槽点变成一个 DropZone"的正确落法是 **slot 字段**（§4.2），而不是手写 `renderDropZone`。

## 4. fields 全类型与 slot 字段

### 4.1 字段接口原文（`actions-DA1J5F56.d.ts:183-339`）

```ts
type FieldOption = { label: string; value: string | number | boolean | undefined | null | object }
type FieldOptions = Array<FieldOption> | ReadonlyArray<FieldOption>

interface BaseField { label?: string; labelIcon?: ReactElement; metadata?: FieldMetadata; visible?: boolean }

interface TextField extends BaseField { type: "text"; placeholder?: string; contentEditable?: boolean }
interface NumberField extends BaseField { type: "number"; placeholder?: string; min?: number; max?: number; step?: number }
interface TextareaField extends BaseField { type: "textarea"; placeholder?: string; contentEditable?: boolean }
interface SelectField extends BaseField { type: "select"; options: FieldOptions }
interface RadioField extends BaseField { type: "radio"; options: FieldOptions }
interface RichtextField<UserSelector extends RichTextSelector = RichTextSelector> extends BaseField {
  type: "richtext"; contentEditable?: boolean; initialHeight?: CSSProperties["height"]
  options?: Partial<PuckRichTextOptions>
  renderMenu?: (props: { children: ReactNode; editor: Editor | null; editorState: EditorState<UserSelector> | null; readOnly: boolean }) => ReactNode
  renderInlineMenu?: (props: { /* ... */ }) => ReactNode
  tiptap?: { selector?: UserSelector; extensions?: Extensions }
}
interface ArrayField<Props extends { [key: string]: any }[] = { [key: string]: any }[], UserField extends {} = {}> extends BaseField {
  type: "array"
  arrayFields: { [SubPropName in keyof Props[0]]: Field<Props[0][SubPropName], UserField> | /* UserField */ }
  defaultItemProps?: Props[0] | ((index: number) => Props[0])
  getItemSummary?: (item: Props[0], index?: number) => ReactNode
  max?: number; min?: number
}
interface ObjectField<Props extends any = { [key: string]: any }, UserField extends {} = {}> extends BaseField {
  type: "object"
  objectFields: { [SubPropName in keyof Props]: Field<Props[SubPropName]> | /* UserField */ }
}
interface ExternalField<Props extends any = { [key: string]: any }> extends BaseField {
  type: "external"; cache?: CacheOpts; placeholder?: string
  fetchList: (params: { query: string; filters: Record<string, any> }) => Promise<any[] | null>
  mapProp?: (value: any) => Props
  mapRow?: (value: any) => Record<string, string | number | ReactElement>
  getItemSummary?: (item: NotUndefined<Props>, index?: number) => ReactNode
  showSearch?: boolean; initialQuery?: string
  filterFields?: Record<string, Field>; initialFilters?: Record<string, any>
  renderFooter?: (props: { items: any[] }) => ReactElement
}
type ExternalFieldWithAdaptor<Props = { [key: string]: any }> = BaseField & {
  type: "external"; placeholder?: string
  adaptor: Adaptor<any, any, Props>; adaptorParams?: object
  getItemSummary: (item: NotUndefined<Props>, index?: number) => ReactNode
}
type Adaptor<AdaptorParams = {}, TableShape = Record<string, any>, PropShape = TableShape> = {
  name: string
  fetchList: (adaptorParams?: AdaptorParams) => Promise<TableShape[] | null>
  mapProp?: (value: TableShape) => PropShape
}
interface CustomField<Value extends any> extends BaseField {
  type: "custom"
  render: CustomFieldRender<Value>   // (props: { field, name, id, value, onChange, readOnly }) => ReactElement
  contentEditable?: boolean
  key?: string
}
interface SlotField extends BaseField { type: "slot"; allow?: string[]; disallow?: string[] }

type Field<ValueType = any, UserField extends {} = {}> =
  | TextField | RichtextField | NumberField | TextareaField | SelectField | RadioField
  | ArrayField</* ... */> | ObjectField<ValueType, UserField>
  | ExternalField<ValueType> | ExternalFieldWithAdaptor<ValueType>
  | CustomField<ValueType> | SlotField

type Fields<ComponentProps extends DefaultComponentProps = DefaultComponentProps, UserField extends {} = {}> = {
  [PropName in keyof Omit<ComponentProps, "editMode">]: Field<ComponentProps[PropName]> | UserField
}
```

补充要点：

- **自定义字段类型**：在 `Config<{ ..., fields: { color: { type: "color" } } }>` 里声明后，所有 `fields / arrayFields / objectFields` 都能写 `{ type: "color" }`；渲染由 `overrides.fieldTypes.color` 提供。类型层面还有 `FieldTransforms`（`:648-655`）可把字段值映射成任意 prop。
- `fieldTransforms`（`Puck` props，`index.d.ts:134`）是 Puck 内部"字段值 -> render props"的转换器；`slot` 就是内置 transform 之一（见 §4.2）。
- 通用键：`label / labelIcon / metadata / visible`；`placeholder` 适用于 text / number / textarea / select / external；`contentEditable` 适用于 text / textarea / richtext / custom。

### 4.2 slot 字段的运行时语义（多区域的正解）

`SlotField` 的值在 render props 里**不是数组**，而是一个组件。相关类型（`actions-DA1J5F56.d.ts:402, 612-614, 785-791`）：

```ts
type SlotComponent = (props?: Omit<DropZoneProps, "zone">) => ReactNode
type Slot<Props = { [key: string]: DefaultComponentProps }> = {
  [K in keyof Props]: ComponentDataOptionalId<Props[K], K extends string ? K : never>
}[keyof Props][]
type WithDeepSlots<T, SlotType = T> =
  T extends Slot ? SlotType
  : T extends (infer U)[] ? Array<WithDeepSlots<U, SlotType>>
  : T extends BuiltinTypes ? T
  : T extends object ? { [K in keyof T]: WithDeepSlots<T[K], SlotType> }
  : T
```

内置 slot transform 源码（`chunk-YQWFSBOU.mjs:270-284`，逐字）：

```js
// lib/field-transforms/default-transforms/slot-transform.tsx
var getSlotTransform = (renderSlotEdit, renderSlotRender = renderSlotEdit) => ({
  slot: ({ value: content, propName, field, isReadOnly }) => {
    const render = isReadOnly ? renderSlotRender : renderSlotEdit
    const Slot = (dzProps) => render({
      allow: field?.type === "slot" ? field.allow : [],
      disallow: field?.type === "slot" ? field.disallow : [],
      ...dzProps,
      zone: propName,        // <- zone 名 = 字段的 propPath
      content,
    })
    return Slot
  },
})
```

用法：

```tsx
import type { Config, Slot } from "@puckeditor/core"

const config: Config<{
  DshSidebar: { header: Slot; body: Slot }
}> = {
  components: {
    DshSidebar: {
      fields: {
        header: { type: "slot", allow: ["DshIconButton", "DshText"] },
        body:   { type: "slot", disallow: ["DshRootOnly"] },
      },
      defaultProps: { header: [], body: [] },
      render: ({ id, puck, header: Header, body: Body }) => (
        <div>
          <div className="header">{Header({ minEmptyHeight: 40 })}</div>
          <div className="body">{Body()}</div>
          <p>zone key: {id + ":header"}</p>
        </div>
      ),
    },
  },
}
```

四条硬约束：

1. 字段名 -> zone 名；最终 key 仍是 `<componentId>:<propName>`。
2. `props.header` 是**函数**（`SlotComponent`），不是 Content。调用时可传除 `zone` 外的全部 `DropZoneProps`（`allow / disallow / style / className / minEmptyHeight / collisionAxis / as / ref`），会覆盖 field 上的同名设置。
3. 内容存储：`props.<fieldName>` 里直接就是 `Content`（`ComponentData[]`）。缺省时 `defaultSlots` 把它初始化为 `[]`（`chunk-H65MT2JK.mjs:15-18`）。
4. 嵌套 slot（`object` / `array` 字段内部的 `type: "slot"`）也成立：`walkField` 用 `propPath` 递归（`chunk-H65MT2JK.mjs:24-102`），zone 名就是 `propPath`（如 `sections[0].header`）。但数组项插入/删除会让索引位移，**不建议**在 array 项里放 slot；可重复区域应做成"容器组件 + 每项自己的 slot 字段"。

### 4.3 对 DSH 复刻的直接结论

- 每个官方插槽点 -> **一个容器组件 + 若干 slot 字段**（`header / body / footer / sidebar / toolbar` ...）。这是 0.23 官方路线：内容内联序列化、无弃用警告、`<Render>` 与 RSC 两条渲染路径都支持。
- 只有当区域名**运行时才确定**、或需要跨组件共享同一个区域时，才用 `puck.renderDropZone({ zone })`，并接受：内容落到 `data.zones`、控制台 deprecated 警告、未来大版本会移除。

## 5. 数据模型：Data / Content / ComponentData

### 5.1 原文（`actions-DA1J5F56.d.ts:494-529`）

```ts
type BaseData<Props = { [key: string]: any }> = { readOnly?: Partial<Record<keyof Props, boolean>> }
type RootDataWithProps<Props = DefaultRootFieldProps> = BaseData<Props> & { props: Props }
type RootDataWithoutProps<Props = DefaultRootFieldProps> = Props
type RootData<Props = DefaultRootFieldProps> = Partial<RootDataWithProps<AsFieldProps<Props>>> & Partial<RootDataWithoutProps<Props>>

type ComponentData<Props = DefaultComponentProps, Name = string, Components = Record<string, DefaultComponentProps>> = {
  type: Name
  props: WithDeepSlots<WithId<Props>, Content<Components>>
} & BaseData<Props>

type ComponentDataMap<Components extends DefaultComponents = DefaultComponents> = {
  [K in keyof Components]: ComponentData<Components[K], K extends string ? K : never, Components>
}[keyof Components]
type Content<PropsMap = { [key: string]: DefaultComponentProps }> = ComponentDataMap<PropsMap>[]

type Data<Components = DefaultComponents, RootProps = DefaultRootFieldProps> = {
  root: WithDeepSlots<RootData<RootProps>, Content<Components>>
  content: Content<Components>
  zones?: Record<string, Content<Components>>
}
```

`<Render>` 与 `<Puck>` 接收的都是 `Partial<Data>`（`index.d.ts:126, 178`）。

### 5.2 序列化格式（导出 JSON 的真实形状）

```jsonc
{
  "root": { "props": { "title": "DSH home" } },   // 也接受扁平 { "title": "..." }
  "content": [
    {
      "type": "DshSidebar",
      "props": {
        "id": "DshSidebar-1a2b3c",
        "header": [                                // slot 字段 -> 内联 Content 数组
          { "type": "DshIconButton", "props": { "id": "DshIconButton-x1", "icon": "menu" } }
        ],
        "body": []
      },
      "readOnly": { "body": false }                // 可选：逐字段只读
    }
  ],
  "zones": {                                       // 可选：只放 renderDropZone 的动态区域
    "DshSidebar-1a2b3c:extra": [
      { "type": "DshText", "props": { "id": "DshText-y2" } }
    ]
  }
}
```

证据：`defaultSlots`（slot 内联，`chunk-H65MT2JK.mjs:15-18`）、`groupZonesByComponent`（`data.zones` 的 key 用 `getZoneId` 拆成 `[componentId, zoneName]`，`chunk-YQWFSBOU.mjs:193-205`；`getZoneId` 见 `chunk-H65MT2JK.mjs:292-300`）、`DropZoneRender` 从 `data.zones[zoneCompound]` 取内容（`chunk-55V3NZVF.mjs:6191-6193`）。

**不要**把 slot 内容写进 `data.zones`：slot 的 transform 只读 `props.<propName>`（`chunk-H65MT2JK.mjs:37-54`）。两套机制不能混用。

### 5.3 只取"变化内容"做 diff

Puck 0.23 **不导出** diff 工具（`deep-diff / fast-equals / object-hash / flat` 只是内部 dependencies，`exports` 未暴露）。三条可行路线：

| 方案 | API | 拿到什么 | 适用 |
| ---- | --- | -------- | ---- |
| A. 动作流（最精确） | `<Puck onAction={(action, newState, prevState) => {}} />`（`index.d.ts:130`；`actions-DA1J5F56.d.ts:760`） | 单条 PuckAction：`insert / move / remove / duplicate / replace / replaceRoot / reorder / setData / set / setUi / registerZone / unregisterZone`（`:795-859`） | "这个插槽多了哪个组件"级别的增量 |
| B. 全量快照 + 自己 diff | `onChange={(data) => {}}`（`index.d.ts:128`） | 完整 Data | 落库、协同、撤销栈 |
| C. 主动读 store | `usePuck()` / `useGetPuck()`（`index.d.ts:295-302`）-> `appState.data、dispatch、getItemById、getParentById、getSelectorForId、history.back/forward、getPermissions` | 读写 store | 自定义工具栏、HUD、外部状态同步 |

遍历 / 写回辅助（公开导出）：

- `walkTree(data, config, cb)`（`walk-tree-DbY5zG2K.d.ts:27`）：回调拿到每个 Content 与 `{ parentId, propName }`，可返回新 Content —— 用来按 zone 抽取 diff。
- `setDeep(node, path, newVal)`（`index.d.ts:250-257`）：点号路径不可变写回（路径逐层拷贝，不污染历史快照）。
- `resolveAllData(data, config, metadata?, onResolveStart?, onResolveEnd?)`（Promise，`walk-tree-*.d.ts:21`）：服务端渲染前把 `resolveData` 解析完。
- `migrate(data, config, migrationOptions?)`（`walk-tree-*.d.ts:3-8`）：含 `migrateDynamicZonesForComponent` —— 官方"动态 zones 转 slot"迁移钩子。

## 6. Puck 的 props（`index.d.ts:123-156`，逐字）

```ts
type PuckProps<UserConfig extends Config = Config, G extends UserGenerics<UserConfig> = UserGenerics<UserConfig>> = {
  children?: ReactNode
  config: UserConfig
  data: Partial<G["UserData"] | Data>
  ui?: Partial<UiState>
  onChange?: (data: G["UserData"]) => void
  onPublish?: (data: G["UserData"]) => void
  onAction?: OnAction<G["UserData"]>
  permissions?: Partial<Permissions>
  plugins?: Plugin<UserConfig>[]
  overrides?: Partial<Overrides<UserConfig>>
  fieldTransforms?: FieldTransforms<UserConfig>
  renderHeader?: (props: { children: ReactNode; dispatch: (action: PuckAction) => void; state: G["UserAppState"] }) => ReactElement
  renderHeaderActions?: (props: { state: G["UserAppState"]; dispatch: (action: PuckAction) => void }) => ReactElement
  headerTitle?: string
  headerPath?: string
  viewports?: Viewports
  iframe?: IframeConfig
  dnd?: DndConfig
  initialHistory?: InitialHistory
  metadata?: Metadata
  dictionary?: Dictionary
  height?: CSSProperties["height"]
  _experimentalFullScreenCanvas?: boolean
  _experimentalVirtualization?: boolean
}
```

### 6.1 overrides（`actions-DA1J5F56.d.ts:657-721`）

```ts
declare const overrideKeys: readonly ["header", "headerActions", "fields", "fieldLabel", "drawer", "drawerItem", "componentOverlay", "outline", "puck", "preview"]

type Overrides<UserConfig extends Config = Config> = OverridesGeneric<{
  fieldTypes: Partial<FieldRenderFunctions<UserConfig>>       // 每个字段类型一个渲染组件
  header: RenderFunc<{ actions: ReactNode; children: ReactNode }>
  actionBar: RenderFunc<{ label?: string; children: ReactNode; parentAction: ReactNode }>
  headerActions: RenderFunc<{ children: ReactNode }>
  preview: RenderFunc
  fields: RenderFunc<{ children: ReactNode; isLoading: boolean; itemSelector?: ItemSelector | null }>
  fieldLabel: RenderFunc<{ children?: ReactNode; icon?: ReactNode; label: string; el?: "label" | "div"; readOnly?: boolean; className?: string }>
  components: RenderFunc
  componentItem: RenderFunc<{ children: ReactNode; name: string }>
  drawer: RenderFunc
  drawerItem: RenderFunc<{ children: ReactNode; name: string }>
  iframe: RenderFunc<{ children: ReactNode; document?: Document }>
  outline: RenderFunc
  componentOverlay: RenderFunc<{ children: ReactNode; hover: boolean; isSelected: boolean; componentId: string; componentType: string }>
  puck: RenderFunc
}>
```

注意：`overrideKeys` 常量只列 10 个 key，但 `Overrides` 类型有 15 个（多出 `fieldTypes / actionBar / components / componentItem / iframe`）。以类型为准。

自定义字段类型的渲染签名（`:714-721`）：

```ts
type FieldRenderFunctions<UserConfig, G, UserField = Field | G["UserField"]> = Omit<{
  [Type in UserField["type"]]: React.FunctionComponent<
    FieldProps<ExtractField<UserField, Type>, any> & { children: ReactNode; name: string }
  >
}, "custom">
```

### 6.2 plugins（`:761-769`）

```ts
type Plugin<UserConfig extends Config = Config> = {
  name?: string; label?: string; icon?: ReactNode
  render?: () => ReactElement
  overrides?: Partial<Overrides<UserConfig>>
  fieldTransforms?: FieldTransforms<UserConfig>
  mobilePanelHeight?: "toggle" | "min-content"
}
type PluginInternal = Plugin & { mobileOnly?: boolean; desktopOnly?: boolean }
```

内置插件工厂（`index.d.ts:304-325`）：`blocksPlugin({ label, icon })`、`fieldsPlugin({ desktopSideBar, label, icon })`（返回 PluginInternal）、`outlinePlugin({ label, icon })`、`legacySideBarPlugin({ outlineLabel, componentsLabel })`。插件顺序 = 左侧导航顺序。

### 6.3 viewports / iframe / dnd（`:723-759`）

```ts
type Viewport = { width: number | "100%"; height?: number | "auto"; label?: string; icon?: iconTypes | ReactNode }
type iconTypes = "Smartphone" | "Monitor" | "Tablet"
type Viewports = Viewport[]

type IframeConfig = { enabled?: boolean; waitForStyles?: boolean; syncHostStyles?: boolean }

type DndBehavior = "auto" | "fluid" | "static"
type DndConfig = {
  disableAutoScroll?: boolean
  disableOutlineDrag?: boolean
  behavior?: DndBehavior   // auto: 槽内 fluid、跨槽 static；fluid: 总是动画兄弟；static: 总是线占位
}
```

运行时 `UiState.viewports`（`:567-574`）：`{ current: { width, height }, controlsVisible, options: Viewport[] }`。

### 6.4 其它常用类型

- `Permissions`（`:735-741`）：`{ drag, duplicate, delete, edit, insert } & Record<string, boolean>`；可按组件（`ComponentConfig.permissions`）、全局（`Puck.permissions`）、动态（`resolvePermissions`）三级配置。
- `Dictionary`（`index-DIZKfHDN.d.ts:70-148`）：覆盖编辑器全部硬编码文案，key 形如 `header-publish / canvas-noconfig / field-readonly`，支持 `{title} / {index} / {count}` 占位。
- `ItemSelector`（`:18-21`）：`{ index: number; zone?: string }`。
- `UiState`（`:549-582`）：侧栏可见性与宽度、`itemSelector`、`previewMode: "interactive" | "edit"`、`componentList`（抽屉分类展开态）、`viewports`、`field.focus`、`plugin.current`。

## 7. 证据索引

| 断言 | 文件:行 |
| ---- | ------- |
| DropZoneProps | `actions-DA1J5F56.d.ts:341-351` |
| PuckContext.renderDropZone | `actions-DA1J5F56.d.ts:353-358` |
| Slot / SlotField / SlotComponent / ComponentDataOptionalId | `actions-DA1J5F56.d.ts:785-791, 320-324, 402, 510-515` |
| ComponentConfig / RootConfig | `actions-DA1J5F56.d.ts:410-457` |
| Config / ConfigParams / Category | `actions-DA1J5F56.d.ts:458-492` |
| Data / Content / ComponentData / RootData | `actions-DA1J5F56.d.ts:494-529` |
| Overrides / overrideKeys / FieldRenderFunctions | `actions-DA1J5F56.d.ts:657-721` |
| Viewport(s) / IframeConfig / DndConfig / Permissions | `actions-DA1J5F56.d.ts:723-759` |
| Plugin / OnAction | `actions-DA1J5F56.d.ts:760-769` |
| PuckAction 全部分支 | `actions-DA1J5F56.d.ts:795-859` |
| PuckProps / Render / usePuck / setDeep | `index.d.ts:123-180, 250-302` |
| zone 复合 id 规则 | `chunk-55V3NZVF.mjs:5962-5968`；`chunk-H65MT2JK.mjs:214-216, 292-300` |
| DropZone 弃用警告 | `chunk-55V3NZVF.mjs:5992-6000` |
| slot -> DropZone 的 transform | `chunk-YQWFSBOU.mjs:270-284` |
| slot 内容内联 + 默认 [] | `chunk-H65MT2JK.mjs:15-18, 37-54` |
| 动态 zones 存 data.zones | `chunk-YQWFSBOU.mjs:193-205`；`chunk-55V3NZVF.mjs:6191-6193` |
