import { composer } from '@oxlint-flat-config/composer/vite-plus';
import type { Composer } from '@oxlint-flat-config/composer/vite-plus';
import type { UserConfig as FlatUserConfig } from 'oxlint-flat-config/vite-plus';
import { defineConfig as defineViteConfig } from 'vite-plus';
import type { ConfigEnv, UserConfig } from 'vite-plus';

import { findConfigDirectory } from './config-dir.ts';
import { detectTraits, isWorkspaceMember } from './detect.ts';
import type { ProjectTraits } from './detect.ts';
import { mergePreset, omitParts } from './merge.ts';
import type { ConfigPart, PresetConfig } from './merge.ts';
import { createFmt } from './presets/fmt.ts';
import { createLint, defaultConsoleFiles } from './presets/lint.ts';
import { runPreset, stagedPreset } from './presets/project.ts';

export type { ConfigPart, PresetConfig } from './merge.ts';

export type { ProjectTraits } from './detect.ts';

export { detectTraits, isWorkspaceMember } from './detect.ts';

export { createFmt, fmtBase } from './presets/fmt.ts';

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

export { runPreset, stagedPreset } from './presets/project.ts';

export type {
  CategoryOptions,
  CategorySelection,
  ConfigInput,
  FlatConfigItem,
  IncludeIgnoreFileOptions,
} from 'oxlint-flat-config/vite-plus';

export {
  all,
  category,
  globalIgnores,
  includeIgnoreFile,
  recommended,
} from 'oxlint-flat-config/vite-plus';

/* Vite+ config with `lint` written as flat config */
export type BycUserConfig = FlatUserConfig;

export type UserConfigFn = (env: ConfigEnv) => BycUserConfig | Promise<BycUserConfig>;

export type UserConfigInput = BycUserConfig | Promise<BycUserConfig> | UserConfigFn;

export type AsyncConfigFn = (env: ConfigEnv) => Promise<UserConfig>;

export interface BycOptions {
  /* Directory of vite.config, inferred from the call stack by default */
  cwd?: string;
  /* Overrides detected traits */
  traits?: Partial<ProjectTraits>;
  /* `@stylistic/eslint-plugin` rules, requires the plugin installed. Default: false */
  stylistic?: boolean;
  /* Enables `typeAware` and `typeCheck`. Default: true */
  typeAware?: boolean;
  /* Globs where `console` is allowed. Default: `['scripts/**', 'bin/**', 'apps/*-server/**']` */
  consoleFiles?: string[];
  /* Adds cached tasks (`ccheck`, `cbuild`, ...) to `run.tasks`. Default: false */
  cachedTasks?: boolean;
  /* Preset parts to leave out */
  exclude?: ConfigPart[];
}

type LintComposer = Omit<Composer<UserConfig>, 'then'>;

type LintStep = (lint: Composer<UserConfig>) => Composer<UserConfig>;

type LintMethods<Result> = {
  [Method in keyof LintComposer]: (...args: Parameters<LintComposer[Method]>) => BycConfig<Result>;
};

/* Export it directly (Vite+ calls it with `ConfigEnv`) or `await` it for the resolved config */
export interface BycConfig<Result = UserConfig> extends PromiseLike<Result>, LintMethods<Result> {
  (env: ConfigEnv): Promise<UserConfig>;
}

interface State {
  config: UserConfigInput;
  directory: string;
  options: BycOptions;
  lintSteps: LintStep[];
}

function rootPreset(traits: ProjectTraits, options: BycOptions): PresetConfig {
  return {
    fmt: createFmt(traits),
    lint: createLint({
      react: traits.react,
      /* Always installed when this entry runs */
      vitePlus: true,
      stylistic: options.stylistic ?? false,
      typeAware: options.typeAware ?? true,
      consoleFiles: options.consoleFiles ?? defaultConsoleFiles,
    }),
    staged: stagedPreset,
    run: options.cachedTasks ? runPreset : undefined,
  };
}

/* Vite+ only reads lint and fmt from the workspace root */
function memberPreset(options: BycOptions): PresetConfig {
  return { run: options.cachedTasks ? runPreset : undefined };
}

function assertMemberConfig(state: State, user: BycUserConfig): void {
  const configured = {
    lint: user.lint !== undefined || state.lintSteps.length > 0,
    fmt: user.fmt !== undefined,
  };

  const ignored = (['lint', 'fmt'] as const).filter(part => configured[part]);

  if (ignored.length > 0) {
    const parts = ignored.map(part => `\`${part}\``).join(' / ');

    throw new Error(
      `[@byc/vp-config] ${parts} in ${state.directory} is ignored by Vite+, which only reads it from the workspace root. Scope the rules with \`files\` in the root config instead.`,
    );
  }
}

async function build(state: State, user: BycUserConfig): Promise<UserConfig> {
  const member = isWorkspaceMember(state.directory);

  if (member) {
    assertMemberConfig(state, user);
  }

  const preset = member
    ? memberPreset(state.options)
    : rootPreset({ ...detectTraits(state.directory), ...state.options.traits }, state.options);

  const { lint, ...merged } = mergePreset(omitParts(preset, state.options.exclude ?? []), user);

  if (lint === undefined && state.lintSteps.length === 0) {
    return defineViteConfig(merged);
  }

  return state.lintSteps.reduce((composed, step) => step(composed), composer({ ...merged, lint }));
}

async function resolve(state: State, env: ConfigEnv | undefined): Promise<UserConfig> {
  const { config } = state;

  if (typeof config !== 'function') {
    return build(state, await config);
  }

  if (!env) {
    throw new Error(
      '[@byc/vp-config] A function config needs ConfigEnv, export it directly instead of awaiting it.',
    );
  }

  return build(state, await config(env));
}

function create<Result>(state: State): BycConfig<Result> {
  const chain = (step: LintStep) =>
    create<Result>({ ...state, lintSteps: [...state.lintSteps, step] });

  const methods: LintMethods<Result> & PromiseLike<Result> = {
    append: (...inputs) => chain(lint => lint.append(...inputs)),
    prepend: (...inputs) => chain(lint => lint.prepend(...inputs)),
    insertBefore: (name, ...inputs) => chain(lint => lint.insertBefore(name, ...inputs)),
    insertAfter: (name, ...inputs) => chain(lint => lint.insertAfter(name, ...inputs)),
    override: (name, patch) => chain(lint => lint.override(name, patch)),
    replace: (name, ...inputs) => chain(lint => lint.replace(name, ...inputs)),
    remove: name => chain(lint => lint.remove(name)),
    overrideRules: rules => chain(lint => lint.overrideRules(rules)),
    removeRules: (...ruleNames) => chain(lint => lint.removeRules(...ruleNames)),
    /* oxlint-disable-next-line unicorn/no-thenable -- Allows both `export default` and `await`. */
    then: (onFulfilled, onRejected) => {
      const result =
        typeof state.config === 'function'
          ? Promise.resolve((env: ConfigEnv) => resolve(state, env))
          : resolve(state, undefined);

      return (result as Promise<Result>).then(onFulfilled, onRejected);
    },
  };

  return Object.assign((env: ConfigEnv) => resolve(state, env), methods);
}

/**
 * Vite+ config preset. Parts depend on where the config is:
 *
 * - Single package / workspace root: fmt, lint, staged, run (with `cachedTasks`)
 * - Workspace member: run (with `cachedTasks`)
 *
 * `lint` is flat config appended after the preset. Preset objects can be changed by name.
 *
 * @example
 * export default byc({
 *   plugins: [react()],
 *   lint: [{ files: ['scripts/**'], rules: { 'no-console': 'off' } }],
 * }).remove('byc/readability');
 */
export function byc(config: UserConfigFn, options?: BycOptions): BycConfig<AsyncConfigFn>;

export function byc(
  config?: BycUserConfig | Promise<BycUserConfig>,
  options?: BycOptions,
): BycConfig<UserConfig>;

export function byc(
  config: UserConfigInput = {},
  options: BycOptions = {},
): BycConfig<UserConfig> | BycConfig<AsyncConfigFn> {
  const directory =
    options.cwd ?? findConfigDirectory(new Error('Find vite config').stack) ?? process.cwd();

  return create<UserConfig>({ config, directory, options, lintSteps: [] });
}

/**
 * Same as `byc()`, named after Vite+'s `defineConfig` so migrating only changes the import.
 *
 * @example
 * import { defineConfig } from '@byc/vp-config';
 *
 * export default defineConfig({ plugins: [react()] });
 */
export const defineConfig: typeof byc = byc;
