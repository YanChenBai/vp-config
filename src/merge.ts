import type { FlatConfigItem, UserConfig } from 'oxlint-flat-config/vite-plus';
import { mergeConfig } from 'vite-plus';

type StagedConfig = NonNullable<UserConfig['staged']>;

export interface PresetConfig {
  fmt?: UserConfig['fmt'];
  lint?: FlatConfigItem[];
  run?: UserConfig['run'];
  staged?: StagedConfig;
}

export type ConfigPart = keyof PresetConfig;

function mergeStaged(preset: StagedConfig, user: UserConfig['staged']): UserConfig['staged'] {
  if (typeof preset !== 'object' || (user && typeof user !== 'object')) {
    return user ?? preset;
  }

  return { ...preset, ...user };
}

export function omitParts(preset: PresetConfig, parts: readonly ConfigPart[]): PresetConfig {
  return Object.fromEntries(
    Object.entries(preset).filter(
      ([part, value]) => value !== undefined && !parts.includes(part as ConfigPart),
    ),
  );
}

/* User lint objects are appended after the preset; other parts are deep merged */
export function mergePreset(preset: PresetConfig, user: UserConfig): UserConfig {
  const config: UserConfig = { ...user };

  if (preset.fmt) {
    config.fmt = mergeConfig(preset.fmt, user.fmt ?? {});
  }

  if (preset.lint) {
    config.lint = [preset.lint, user.lint];
  }

  if (preset.run) {
    config.run = mergeConfig(preset.run, user.run ?? {});
  }

  if (preset.staged) {
    config.staged = mergeStaged(preset.staged, user.staged);
  }

  return config;
}
