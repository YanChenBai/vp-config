# @byc/vp-config

## 0.2.0

### Minor Changes

- Add `@byc/vp-config/fmt` and `@byc/vp-config/lint` subpath exports for standalone `oxfmt.config.ts` / `oxlint.config.ts`. Every entry now exports `defineConfig` with the same signature as the package it replaces, so migrating only changes the import (`byc` is kept as an alias). The subpaths do not depend on vite-plus; `vite-plus`, `oxlint` and `oxfmt` are now optional peer dependencies.

  **Breaking:** cached tasks (`cbuild`, `ccheck`, ...) are now off by default. Pass `cachedTasks: true` to keep them.

  **Breaking:** `vite-plus/prefer-vite-plus-imports` and its plugin moved from `byc/style` to a new `byc/vite-plus` object.

## 0.1.0

### Minor Changes

- ad1dd6d: Initial release: `byc()` preset for Vite+ with fmt, flat config lint, staged and cached run tasks, React / Tailwind CSS detection and workspace-aware config positions.
