---
'@byc/vp-config': minor
---

Add `@byc/vp-config/fmt` and `@byc/vp-config/lint` subpath exports for standalone `oxfmt.config.ts` / `oxlint.config.ts`. Every entry now exports `defineConfig` with the same signature as the package it replaces, so migrating only changes the import (`byc` is kept as an alias). The subpaths do not depend on vite-plus; `vite-plus`, `oxlint` and `oxfmt` are now optional peer dependencies.

**Breaking:** cached tasks (`cbuild`, `ccheck`, ...) are now off by default. Pass `cachedTasks: true` to keep them.

**Breaking:** `vite-plus/prefer-vite-plus-imports` and its plugin moved from `byc/style` to a new `byc/vite-plus` object.
