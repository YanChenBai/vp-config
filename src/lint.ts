import type { OxlintConfig } from 'oxlint';
import { defineConfig as defineFlatConfig } from 'oxlint-flat-config';
import type { ConfigInput } from 'oxlint-flat-config';

import { findConfigDirectory } from './config-dir.ts';
import { detectTraits } from './detect.ts';
import type { ProjectTraits } from './detect.ts';
import { createLint, defaultConsoleFiles } from './presets/lint.ts';

export type { OxlintConfig } from 'oxlint';

export type {
  CategoryOptions,
  CategorySelection,
  ConfigInput,
  ExtendsInput,
  ExtendsItem,
  FlatConfigItem,
  GlobalConfigItem,
  GlobalIgnoresItem,
  IncludeIgnoreFileOptions,
  ScopedCategoryOptions,
  ScopedConfigItem,
} from 'oxlint-flat-config';

export { all, category, globalIgnores, includeIgnoreFile, recommended } from 'oxlint-flat-config';

export {
  correctnessRules,
  createLint,
  lintNames,
  reactRules,
  readabilityRules,
  styleRules,
  stylisticRules,
  testRules,
  typeAwareRules,
  vitePlusRules,
} from './presets/lint.ts';

export interface LintOptions {
  /* Directory of the config file, inferred from the call stack by default */
  cwd?: string;
  /* Overrides detected traits */
  traits?: Partial<Pick<ProjectTraits, 'react' | 'vitePlus' | 'tsgolint'>>;
  /* `@stylistic/eslint-plugin` rules, requires the plugin installed. Default: false */
  stylistic?: boolean;
  /* Enables `typeAware` and `typeCheck`. Default: true when vite-plus or oxlint-tsgolint is installed */
  typeAware?: boolean;
  /* Globs where `console` is allowed. Default: `['scripts/**', 'bin/**', 'apps/*-server/**']` */
  consoleFiles?: string[];
}

/* `defineConfig` with options, for when the defaults need changing */
export function createDefineConfig(options: LintOptions = {}) {
  return function defineConfig(...configs: ConfigInput[]): OxlintConfig {
    const directory =
      options.cwd ?? findConfigDirectory(new Error('Find lint config').stack) ?? process.cwd();

    const { react, vitePlus, tsgolint } = { ...detectTraits(directory), ...options.traits };

    const preset = createLint({
      react,
      vitePlus,
      stylistic: options.stylistic ?? false,
      /* Type-aware linting needs tsgolint, which Vite+ bundles */
      typeAware: options.typeAware ?? (vitePlus || tsgolint),
      consoleFiles: options.consoleFiles ?? defaultConsoleFiles,
    });

    return defineFlatConfig(preset, ...configs);
  };
}

/**
 * oxlint-flat-config's `defineConfig` with the preset placed before your objects, for `oxlint.config.ts`.
 *
 * Returns a plain object, since Oxlint rejects a promise as the default export.
 *
 * @example
 * import { defineConfig } from '@byc/vp-config/lint';
 *
 * export default defineConfig({ files: ['scripts/**'], rules: { 'no-console': 'off' } });
 */
export const defineConfig = createDefineConfig();
