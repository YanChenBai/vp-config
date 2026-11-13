import type { UserConfig } from 'vite-plus';

type RunConfig = NonNullable<UserConfig['run']>;
type StagedConfig = NonNullable<UserConfig['staged']>;

/* Trait detection reads pnpm-workspace.yaml, whose existence is not tracked automatically */
const detectionInput = [
  { auto: true },
  { pattern: 'pnpm-workspace.yaml', base: 'workspace' as const },
];

/* Cached versions of Vite+ commands, e.g. `vpr ccheck` instead of `vp check` */
export const runPreset: RunConfig = {
  tasks: {
    cbuild: 'vp build',
    ccheck: { command: 'vp check', cache: { input: detectionInput } },
    cfmt: { command: 'vp fmt', cache: { input: detectionInput } },
    cformat: { command: 'vp format', cache: { input: detectionInput } },
    clint: { command: 'vp lint', cache: { input: detectionInput } },
    cpack: 'vp pack',
    ctest: 'vp test',
  },
};

export const stagedPreset: StagedConfig = {
  '*': 'vp check --fix',
};
