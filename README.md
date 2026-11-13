<h1 align="center">@byc/vp-config</h1>

<p align="center">
  A ready-to-use <a href="https://viteplus.dev/">Vite+</a> config preset: formatting, linting, pre-commit checks and cached tasks in one call,<br />
  with React and Tailwind CSS settings enabled from your project's dependencies.
</p>

<p align="center">
  Inspired by <a href="https://github.com/liangmiQwQ/vp-config">@liangmi/vp-config</a>.
</p>

<p align="center">
  <b>English</b>
  ·
  <a href="./README.zh-CN.md">简体中文</a>
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
> Vite+ only reads `lint` and `fmt` from the workspace root. `byc()` only emits the parts that are read where `vite.config.ts` lives, and configuring `lint` / `fmt` in a workspace member throws instead of being silently ignored.

## What does it do?

- **One call**: `byc()` wraps Vite+'s `defineConfig` with fmt, lint, staged and run presets, and deep merges your config over them.
- **Detection**: scans the dependencies of the whole workspace, enabling React and a11y rules for jsx / tsx when `react` is found, and class sorting when `tailwindcss` is found.
- **Config position**: finds `vite.config.ts` from the call stack, so single-package repos, the workspace root and members share one entry without relying on cwd.
- **Flat config lint**: `lint` is an [oxlint-flat-config](https://github.com/liangmiQwQ/oxlint-flat-config) array. Every preset object is named, so you can override, replace or remove it by chaining composer methods.
- **Type-aware**: `typeAware` and `typeCheck` are on by default, so `vp check` also type checks and you don't need a separate `tsc` run.
- **Cached tasks**: built-in `ccheck`, `clint`, `ctest` and more are cached versions of Vite+ commands that hit the cache when nothing changed.

## Quick start

```bash
vp add -D @byc/vp-config
```

```ts
// vite.config.ts
import { byc } from '@byc/vp-config';
import react from '@vitejs/plugin-react';

export default byc({
  plugins: [react()],
});
```

Use the same `byc()` in single-package repos, the workspace root and workspace members. It accepts an object, a promise or an `(env) => config` function. Export the result directly, or `await` it for the resolved config.

| Position         | Parts                                    |
| ---------------- | ---------------------------------------- |
| Single package   | fmt, lint, staged, run                   |
| Workspace root   | fmt, lint, staged, run (whole workspace) |
| Workspace member | run                                      |

## What's included

| Part     | Content                                                                                                                                   |
| -------- | ----------------------------------------------------------------------------------------------------------------------------------------- |
| `fmt`    | Single quotes, `arrowParens: 'avoid'`, `printWidth: 100`; sorted imports (partitioned by comments) and `package.json` (including scripts) |
| `lint`   | Correctness, type-aware, readability, style and test file rules; optional `@stylistic` rules; unused disable directives reported          |
| `staged` | `'*': 'vp check --fix'`, run `vp config` to install the commit hook                                                                       |
| `run`    | Cached tasks, see [Cached tasks](#cached-tasks)                                                                                           |

`console` only allows `warn` / `error`, except in `scripts/**`, `bin/**` and `apps/*-server/**`. Workspace members are read from `packages` in `pnpm-workspace.yaml` or `workspaces` in `package.json`.

### Stylistic rules (optional)

The `@stylistic/eslint-plugin` rules are off by default. To enable them, install the plugin (an optional peer dependency) and pass `stylistic: true`:

```bash
vp add -D @stylistic/eslint-plugin
```

```ts
export default byc({}, { stylistic: true });
```

They cover starred-block comments on their own lines, the `1tbs` brace style, and blank lines around class members, `if` / `return` and multiline declarations.

## Customizing lint

Your `lint` objects are appended after the preset and apply in order, so later ones override earlier ones. Paths in `files` are relative to `vite.config.ts`:

```ts
export default byc({
  lint: [
    { rules: { 'no-console': 'warn' } },
    { files: ['packages/cli/**'], rules: { 'no-console': 'off' } },
  ],
});
```

To change the preset itself, chain composer methods on `byc()`: `append`, `prepend`, `insertBefore`, `insertAfter`, `override`, `replace`, `remove`, `overrideRules` and `removeRules`. They run after your objects are appended.

```ts
export default byc()
  .remove('byc/readability')
  .override('byc/options', { options: { typeCheck: false } })
  .overrideRules({ complexity: ['warn', { max: 20 }] });
```

| Name              | Content                                                                                   |
| ----------------- | ----------------------------------------------------------------------------------------- |
| `byc/options`     | `typeAware`, `typeCheck`, `reportUnusedDisableDirectives`                                 |
| `byc/correctness` | The whole correctness category of Oxlint's default plugins, plus other bug-catching rules |
| `byc/type-aware`  | Rules that need type information (omitted with `typeAware: false`)                        |
| `byc/readability` | Readability rules, mostly autofixable                                                     |
| `byc/style`       | Style rules, including `vite-plus/prefer-vite-plus-imports`                               |
| `byc/stylistic`   | `@stylistic` rules (only with `stylistic: true`)                                          |
| `byc/console`     | Allows `console` in `consoleFiles`                                                        |
| `byc/test`        | Vitest rules for test files                                                               |
| `byc/react`       | React and a11y rules for jsx / tsx (omitted when react is not detected)                   |

> [!TIP]
>
> Rule names are matched as written: rules expanded by `category()` in `byc/correctness` are plugin-prefixed (like `eslint/no-debugger`), while hand-written rules are mostly not (like `no-console`). Use the same spelling with `overrideRules` / `removeRules`. The names are also exported as `lintNames`.

## Options

```ts
export default byc(config, {
  cwd: import.meta.dirname, // Directory of vite.config, inferred from the call stack by default
  traits: { react: false }, // Override detected traits
  stylistic: true, // Enable @stylistic rules
  typeAware: false, // Turn off typeAware / typeCheck
  consoleFiles: ['scripts/**'], // Files where console is allowed
  exclude: ['staged'], // Preset parts to leave out
});
```

Merging: `lint` is appended as flat config, `fmt` / `run` are deep merged with Vite's `mergeConfig`, `staged` is shallow merged by glob, and everything else (including `pack`) is passed through. Each preset part is also exported (`createLint`, `createFmt`, `readabilityRules`, `stylisticRules`, ...) so you can compose your own.

## Cached tasks

| Task      | Command     |
| --------- | ----------- |
| `cbuild`  | `vp build`  |
| `cpack`   | `vp pack`   |
| `clint`   | `vp lint`   |
| `cfmt`    | `vp fmt`    |
| `cformat` | `vp format` |
| `ccheck`  | `vp check`  |
| `ctest`   | `vp test`   |

Run `vp run ccheck`, or the shorthand `vpr ccheck`, instead of `vp check`. They keep their cache in `package.json` scripts too, like `"check": "vp run ccheck"`. `clint`, `ccheck`, `cfmt` and `cformat` also track `pnpm-workspace.yaml`, since dependency detection reads it. Cache options go under `run.tasks.<name>.cache`.

## Development

Requires [Vite+](https://viteplus.dev/).

```bash
vp install
vp check                 # Format, lint and type check
vp test                  # Unit tests
vp pack                  # Build to dist
```

### Release

Versions are managed by [Changesets](https://github.com/changesets/changesets). After a change, run `vp run changeset` and describe it. Once merged into `master`, the release workflow opens a version PR; merging it publishes to npm and creates a GitHub Release.

### Project structure

- [`src/index.ts`](src/index.ts): the `byc()` entry, options and chainable composer methods
- [`src/config-dir.ts`](src/config-dir.ts): locates `vite.config.ts` from the call stack
- [`src/detect.ts`](src/detect.ts): workspace member and dependency detection
- [`src/merge.ts`](src/merge.ts): merges the preset with your config
- [`src/presets`](src/presets): fmt, lint, run and staged presets
- [`tests`](tests): unit tests and workspace fixtures

## Credits

The project structure, trait detection, config position detection, cached tasks, flat config integration and some lint / fmt rules are inspired by [@liangmi/vp-config](https://github.com/liangmiQwQ/vp-config).

[MIT](./LICENSE) © 2026-PRESENT [YanChenBai](https://github.com/YanChenBai)
