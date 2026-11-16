<h1 align="center">@byc/vp-config</h1>

<p align="center">
  开箱即用的 <a href="https://viteplus.dev/">Vite+</a> 配置预设：一次调用配好格式化、Lint、提交前检查与缓存任务，<br />
  按项目依赖自动启用 React 与 Tailwind CSS 相关配置。
</p>

<p align="center">
  参考了 <a href="https://github.com/liangmiQwQ/vp-config">@liangmi/vp-config</a>。
</p>

<p align="center">
  <a href="./README.md">English</a>
  ·
  <b>简体中文</b>
</p>

<p align="center">
  <a href="https://www.npmjs.com/package/@byc/vp-config"><img alt="npm" src="https://img.shields.io/npm/v/@byc/vp-config?style=flat&logo=npm&logoColor=white&color=CB3837" /></a>
  <img alt="Vite+" src="https://img.shields.io/badge/Vite+-1.6-646CFF?style=flat&logo=vite&logoColor=white" />
  <img alt="Oxlint" src="https://img.shields.io/badge/Oxlint-flat_config-32F3E9?style=flat" />
  <img alt="TypeScript" src="https://img.shields.io/badge/TypeScript-7-3178C6?style=flat&logo=typescript&logoColor=white" />
  <a href="./LICENSE"><img alt="MIT" src="https://img.shields.io/badge/license-MIT-green?style=flat" /></a>
</p>

> [!NOTE]
>
> Vite+ 只从工作区根读取 `lint` 与 `fmt`。`defineConfig()` 会根据 `vite.config.ts` 所在位置只输出会被读取的部分，在子包中配置 `lint` / `fmt` 会直接报错，而不是被静默忽略。

## 它能做什么？

- **一次调用**：`defineConfig()` 包装 Vite+ 的 `defineConfig`，提供 fmt、lint、staged、run 四部分预设，你的配置深合并在预设之上。
- **自动探测**：扫描整个工作区的依赖，有 `react` 时为 jsx / tsx 启用 React 与 a11y 规则，有 `tailwindcss` 时开启类名排序。
- **识别配置位置**：从调用栈找到 `vite.config.ts`，单包仓库、工作区根目录与子包使用同一个入口，不依赖 cwd。
- **Flat config Lint**：`lint` 写成 [oxlint-flat-config](https://github.com/liangmiQwQ/oxlint-flat-config) 数组；预设中的每个对象都有名称，可链式调用 composer 方法按名称覆盖、替换或移除。
- **类型感知**：默认开启 `typeAware` 与 `typeCheck`，`vp check` 一并完成类型检查，无需单独运行 `tsc`。
- **缓存任务**：内置 `ccheck`、`clint`、`ctest` 等任务，是 Vite+ 命令的缓存版本，未改动时直接命中缓存。

## 快速开始

```bash
vp add -D @byc/vp-config
```

```ts
// vite.config.ts
import { defineConfig } from '@byc/vp-config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

`defineConfig` 的入参与 Vite+ 的 `defineConfig` 一致，迁移时只需改包名（同时以 `byc` 导出）。单包仓库、工作区根目录和子包都使用同一个 `defineConfig()`，支持对象、Promise 与 `(env) => config` 函数三种写法。返回值可以直接 `export default`，也可以 `await` 得到最终配置。

| 位置       | 输出                                       |
| ---------- | ------------------------------------------ |
| 单包仓库   | fmt、lint、staged、run\*                   |
| 工作区根   | fmt、lint、staged、run\*（覆盖整个工作区） |
| 工作区子包 | run\*                                      |

\* 仅在 `cachedTasks: true` 时生成。

## 预设内容

| 部分     | 内容                                                                                                       |
| -------- | ---------------------------------------------------------------------------------------------------------- |
| `fmt`    | 单引号、`arrowParens: 'avoid'`、`printWidth: 100`；import（按注释分组）与 `package.json`（含 scripts）排序 |
| `lint`   | 正确性、类型感知、可读性、风格与测试文件规则；可选的 `@stylistic` 排版规则；报告无用的 disable 注释        |
| `staged` | `'*': 'vp check --fix'`，运行 `vp config` 安装提交钩子                                                     |
| `run`    | 缓存任务，默认关闭，见[缓存任务](#缓存任务)                                                                |

`console` 只允许 `warn` / `error`，`scripts/**`、`bin/**`、`apps/*-server/**` 下不限制。工作区成员从 `pnpm-workspace.yaml` 的 `packages` 或 `package.json` 的 `workspaces` 读取。

### 排版规则（可选）

`@stylistic/eslint-plugin` 的排版规则默认关闭。启用时安装插件（可选的 peer 依赖）并传入 `stylistic: true`：

```bash
vp add -D @stylistic/eslint-plugin
```

```ts
export default defineConfig({}, { stylistic: true });
```

包含注释独占一行的块注释风格、`1tbs` 大括号风格，以及类成员、`if` / `return` / 多行声明前后的空行约束。

## 自定义 Lint

你传入的 `lint` 对象追加在预设之后，按顺序生效，后面的覆盖前面的；`files` 相对 `vite.config.ts` 所在目录：

```ts
export default defineConfig({
  lint: [
    { rules: { 'no-console': 'warn' } },
    { files: ['packages/cli/**'], rules: { 'no-console': 'off' } },
  ],
});
```

要修改预设本身，在 `defineConfig()` 上链式调用 composer 方法：`append`、`prepend`、`insertBefore`、`insertAfter`、`override`、`replace`、`remove`、`overrideRules`、`removeRules`。它们在你的对象追加之后执行。

```ts
export default defineConfig()
  .remove('byc/readability')
  .override('byc/options', { options: { typeCheck: false } })
  .overrideRules({ complexity: ['warn', { max: 20 }] });
```

| 名称              | 内容                                                                                 |
| ----------------- | ------------------------------------------------------------------------------------ |
| `byc/options`     | `typeAware`、`typeCheck`、`reportUnusedDisableDirectives`                            |
| `byc/correctness` | Oxlint 默认插件的整个 correctness 分类，以及其他能发现 bug 的规则                    |
| `byc/type-aware`  | 依赖类型信息的规则（`typeAware: false` 时不生成）                                    |
| `byc/readability` | 可读性规则，多数可自动修复                                                           |
| `byc/style`       | 风格规则                                                                             |
| `byc/vite-plus`   | `vite-plus/prefer-vite-plus-imports`（独立使用 `/lint` 时仅在安装 vite-plus 后生成） |
| `byc/stylistic`   | `@stylistic` 排版规则（仅 `stylistic: true` 时生成）                                 |
| `byc/console`     | `consoleFiles` 中允许 `console`                                                      |
| `byc/test`        | 测试文件的 Vitest 规则                                                               |
| `byc/react`       | jsx / tsx 的 React 与 a11y 规则（未探测到 react 时不生成）                           |

> [!TIP]
>
> 规则名按书写形式匹配：`byc/correctness` 中由 `category()` 展开的规则带插件前缀（如 `eslint/no-debugger`），手写的规则多数不带（如 `no-console`），调用 `overrideRules` / `removeRules` 时请使用相同写法。名称也以 `lintNames` 导出。

## 选项

```ts
export default defineConfig(config, {
  cwd: import.meta.dirname, // vite.config 所在目录，默认从调用栈推断
  traits: { react: false }, // 覆盖探测结果
  stylistic: true, // 启用 @stylistic 规则
  typeAware: false, // 关闭 typeAware / typeCheck
  consoleFiles: ['scripts/**'], // 允许 console 的文件
  cachedTasks: true, // 向 run.tasks 添加缓存任务，默认关闭
  exclude: ['staged'], // 不加载的预设部分
});
```

合并方式：`lint` 按 flat config 追加，`fmt` / `run` 使用 Vite 的 `mergeConfig` 深合并，`staged` 按 glob 浅合并，其余字段（包括 `pack`）原样透传。各部分预设也单独导出（`createLint`、`createFmt`、`readabilityRules`、`stylisticRules` 等），可以自行组合。

## 独立的 fmt / lint 配置

fmt 与 lint 预设也以子路径导出，用于 `oxfmt.config.ts` 与 `oxlint.config.ts`。每个出口都导出与被替换包签名一致的 `defineConfig`，迁移时只需改包名：

| 导入                  | 替换                                         | 返回                                 |
| --------------------- | -------------------------------------------- | ------------------------------------ |
| `@byc/vp-config`      | `vite-plus` / `oxlint-flat-config/vite-plus` | 包含全部预设的 Vite+ 配置            |
| `@byc/vp-config/fmt`  | `oxfmt`                                      | `OxfmtConfig`，预设合并在你的配置下  |
| `@byc/vp-config/lint` | `oxlint-flat-config`                         | `OxlintConfig`，预设对象排在你的之前 |

```ts
// oxfmt.config.ts
import { defineConfig } from '@byc/vp-config/fmt';

export default defineConfig({ printWidth: 120 });
```

```ts
// oxlint.config.ts
import { defineConfig, globalIgnores } from '@byc/vp-config/lint';

export default defineConfig(globalIgnores(['dist/**']), {
  files: ['scripts/**'],
  rules: { 'no-console': 'off' },
});
```

两个子路径都不依赖 vite-plus，改装 `oxfmt` / `oxlint` 即可（三者均为可选 peer 依赖）。Oxlint 与 Oxfmt 只识别 `.ts` / `.mts` 配置文件，两个入口都按它们的要求返回普通对象。特征从配置文件所在目录探测：

- 仅当依赖中有 `vite-plus` 时才添加 `byc/vite-plus`。
- `typeAware` 仅在依赖中有 `vite-plus` 或 `oxlint-tsgolint` 时默认开启，因为类型感知 Lint 需要 tsgolint。

需要传选项时，用 `createDefineConfig` 创建 `defineConfig`：

```ts
import { createDefineConfig } from '@byc/vp-config/lint';

const defineConfig = createDefineConfig({ stylistic: true, typeAware: false });

export default defineConfig();
```

`/lint` 还从 `oxlint-flat-config` 转出了 `category`、`globalIgnores`、`includeIgnoreFile`、`recommended`、`all`，根入口则从 `oxlint-flat-config/vite-plus` 转出。

## 缓存任务

默认关闭，通过 `cachedTasks: true` 开启：

```ts
export default defineConfig({}, { cachedTasks: true });
```

| 任务      | 命令        |
| --------- | ----------- |
| `cbuild`  | `vp build`  |
| `cpack`   | `vp pack`   |
| `clint`   | `vp lint`   |
| `cfmt`    | `vp fmt`    |
| `cformat` | `vp format` |
| `ccheck`  | `vp check`  |
| `ctest`   | `vp test`   |

用 `vp run ccheck` 或简写 `vpr ccheck` 代替 `vp check`；写在 `package.json` 中（如 `"check": "vp run ccheck"`）同样命中缓存。`clint`、`ccheck`、`cfmt`、`cformat` 额外追踪 `pnpm-workspace.yaml`，因为依赖探测会读取它。缓存选项放在 `run.tasks.<名称>.cache`。

## 开发

需要 [Vite+](https://viteplus.dev/)。

```bash
vp install
vp check                 # 格式、Lint 与类型检查
vp test                  # 单元测试
vp pack                  # 构建到 dist
```

### 发布

版本由 [Changesets](https://github.com/changesets/changesets) 管理：改动后运行 `vp run changeset` 并说明变更。合入 `main` 后 Release 工作流会打开版本 PR，合并后发布到 npm 并创建 GitHub Release。

### 项目结构

- [`src/index.ts`](src/index.ts)：`defineConfig()` 入口、选项与链式 composer 方法
- [`src/fmt.ts`](src/fmt.ts) / [`src/lint.ts`](src/lint.ts)：`/fmt` 与 `/lint` 子路径入口
- [`src/config-dir.ts`](src/config-dir.ts)：从调用栈定位 `vite.config.ts`
- [`src/detect.ts`](src/detect.ts)：工作区成员与依赖探测
- [`src/merge.ts`](src/merge.ts)：预设与用户配置的合并
- [`src/presets`](src/presets)：fmt、lint、run、staged 预设
- [`tests`](tests)：单元测试与工作区样例

## 致谢

项目结构、特征探测、配置位置识别、缓存任务、flat config 集成以及部分 Lint / fmt 规则参考了 [@liangmi/vp-config](https://github.com/liangmiQwQ/vp-config)。

[MIT](./LICENSE) © 2026-PRESENT [YanChenBai](https://github.com/YanChenBai)
