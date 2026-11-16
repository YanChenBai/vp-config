import type { OxfmtConfig } from 'oxfmt';

import { findConfigDirectory } from './config-dir.ts';
import { detectTraits } from './detect.ts';
import type { ProjectTraits } from './detect.ts';
import { createFmt } from './presets/fmt.ts';

export type { OxfmtConfig } from 'oxfmt';

export { createFmt, fmtBase } from './presets/fmt.ts';

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/* Nested objects are merged, everything else (including arrays) is replaced */
function mergeDeep<T extends object>(base: T, override: T): T {
  const result: Record<string, unknown> = { ...(base as Record<string, unknown>) };

  for (const [key, value] of Object.entries(override)) {
    const current = result[key];

    result[key] =
      isPlainObject(current) && isPlainObject(value) ? mergeDeep(current, value) : value;
  }

  return result as T;
}

export interface FmtOptions {
  /* Directory of the config file, inferred from the call stack by default */
  cwd?: string;
  /* Overrides detected traits */
  traits?: Partial<Pick<ProjectTraits, 'tailwindcss'>>;
}

/* `defineConfig` with options, for when the defaults need changing */
export function createDefineConfig(options: FmtOptions = {}) {
  return function defineConfig(config: OxfmtConfig = {}): OxfmtConfig {
    const directory =
      options.cwd ?? findConfigDirectory(new Error('Find fmt config').stack) ?? process.cwd();

    const preset = createFmt({ ...detectTraits(directory), ...options.traits });

    return mergeDeep(preset, config);
  };
}

/**
 * Oxfmt's `defineConfig` with the preset merged under your config, for `oxfmt.config.ts`.
 *
 * @example
 * import { defineConfig } from '@byc/vp-config/fmt';
 *
 * export default defineConfig({ printWidth: 120 });
 */
export const defineConfig = createDefineConfig();
