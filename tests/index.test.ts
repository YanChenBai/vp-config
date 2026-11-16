import { join, resolve } from 'node:path';
import { pathToFileURL } from 'node:url';

import type { UserConfig } from 'vite-plus';
import { describe, expect, test } from 'vite-plus/test';

import { findConfigDirectory } from '../src/config-dir.ts';
import { createDefineConfig as createFmtConfig, defineConfig as defineFmt } from '../src/fmt.ts';
import { byc, createLint, defineConfig, detectTraits, lintNames } from '../src/index.ts';
import type { defineConfig as defineLint } from '../src/lint.ts';
import { createDefineConfig as createLintConfig } from '../src/lint.ts';

const workspace = join(import.meta.dirname, 'fixtures/workspace');
const single = join(import.meta.dirname, 'fixtures/single');

/* Flat config objects become overrides; the last one setting a rule wins */
function ruleValue(config: UserConfig, rule: string): unknown {
  return (config.lint?.overrides ?? []).findLast(override => override.rules?.[rule] !== undefined)
    ?.rules?.[rule];
}

function jsPluginNames(config: UserConfig): string[] {
  return (config.lint?.overrides ?? [])
    .flatMap(override => override.jsPlugins ?? [])
    .map(plugin => (typeof plugin === 'string' ? plugin : plugin.name));
}

describe('detectTraits', () => {
  test('aggregates react and tailwindcss across workspace members', () => {
    expect(detectTraits(workspace)).toEqual({
      react: true,
      tailwindcss: true,
      vitePlus: false,
      tsgolint: false,
    });
  });

  test('members see the whole workspace', () => {
    expect(detectTraits(join(workspace, 'packages/lib'))).toEqual({
      react: true,
      tailwindcss: true,
      vitePlus: false,
      tsgolint: false,
    });
  });

  test('single package without workspace', () => {
    expect(detectTraits(single)).toEqual({
      react: false,
      tailwindcss: false,
      vitePlus: false,
      tsgolint: false,
    });
  });
});

describe('createLint', () => {
  test('names every preset object', () => {
    const names = createLint({
      react: true,
      vitePlus: true,
      stylistic: true,
      typeAware: true,
      consoleFiles: ['scripts/**'],
    }).map(item => item.name);

    expect(names).toEqual(Object.values(lintNames));
  });

  test('skips disabled objects', () => {
    const names = createLint({
      react: false,
      vitePlus: false,
      stylistic: false,
      typeAware: false,
      consoleFiles: [],
    }).map(item => item.name);

    expect(names).not.toContain(lintNames.react);
    expect(names).not.toContain(lintNames.stylistic);
    expect(names).not.toContain(lintNames.typeAware);
    expect(names).not.toContain(lintNames.console);
    expect(names).not.toContain(lintNames.vitePlus);
  });
});

describe('byc', () => {
  test('emits preset parts derived from traits', async () => {
    const config = await byc({}, { cwd: workspace });

    expect(config.fmt?.sortTailwindcss).toBe(true);
    expect(ruleValue(config, 'react/rules-of-hooks')).toBe('error');
    expect(config.staged).toEqual({ '*': 'vp check --fix' });
    expect(config.run).toBeUndefined();
    expect(config.pack).toBeUndefined();
  });

  test('cachedTasks adds cached tasks to run', async () => {
    const config = await byc({}, { cwd: workspace, cachedTasks: true });

    expect(config.run?.tasks).toHaveProperty('cformat');
    expect(config.run?.tasks).toHaveProperty('cbuild');
  });

  test('defineConfig is byc', () => {
    expect(defineConfig).toBe(byc);
  });

  test('builds lint as an oxlint config', async () => {
    const config = await byc({}, { cwd: single });

    expect(config.lint?.options).toMatchObject({ typeAware: true, typeCheck: true });
    expect(ruleValue(config, 'eslint/no-debugger')).toBe('warn');
    expect(ruleValue(config, 'curly')).toBe('error');
    expect(jsPluginNames(config)).toEqual(['vite-plus']);
  });

  test('omits react and tailwind when not detected', async () => {
    const config = await byc({}, { cwd: single });

    expect(config.fmt?.sortTailwindcss).toBeUndefined();
    expect(ruleValue(config, 'react/rules-of-hooks')).toBeUndefined();
  });

  test('traits option overrides detection', async () => {
    const config = await byc({}, { cwd: single, traits: { react: true } });

    expect(ruleValue(config, 'react/rules-of-hooks')).toBe('error');
  });

  test('user flat config objects apply after the preset', async () => {
    const config = await byc(
      {
        lint: [
          { rules: { 'no-console': ['warn', { allow: ['info'] }] } },
          { files: ['src/legacy/**'], rules: { curly: 'off' } },
        ],
      },
      { cwd: single },
    );

    const last = config.lint?.overrides?.at(-1);

    expect(ruleValue(config, 'no-console')).toEqual(['warn', { allow: ['info'] }]);
    expect(last?.files).toEqual(['src/legacy/**']);
  });

  test('composer methods change preset objects by name', async () => {
    const config = await byc({}, { cwd: single, stylistic: true })
      .remove(lintNames.stylistic)
      .override(lintNames.options, { options: { typeCheck: false } })
      .overrideRules({ curly: 'warn' });

    expect(jsPluginNames(config)).toEqual(['vite-plus']);
    expect(ruleValue(config, 'stylistic/brace-style')).toBeUndefined();
    expect(config.lint?.options).toMatchObject({ typeAware: true, typeCheck: false });
    expect(ruleValue(config, 'curly')).toBe('warn');
  });

  test('stylistic and typeAware options', async () => {
    const config = await byc({}, { cwd: single, stylistic: true, typeAware: false });

    expect(jsPluginNames(config)).toEqual(['vite-plus', 'stylistic']);
    expect(ruleValue(config, 'stylistic/brace-style')).toEqual([
      'error',
      '1tbs',
      { allowSingleLine: false },
    ]);
    expect(config.lint?.options).toMatchObject({ typeAware: false, typeCheck: false });
  });

  test('exclude drops preset parts', async () => {
    const config = await byc(
      {},
      { cwd: single, cachedTasks: true, exclude: ['staged', 'run', 'lint'] },
    );

    expect(config.staged).toBeUndefined();
    expect(config.run).toBeUndefined();
    expect(config.lint).toBeUndefined();
    expect(config.fmt).toBeDefined();
  });

  test('deep merges fmt and passes pack through', async () => {
    const config = await byc(
      { fmt: { printWidth: 120 }, pack: { entry: ['src/cli.ts'] } },
      { cwd: single },
    );

    expect(config.fmt).toMatchObject({ printWidth: 120, singleQuote: true });
    expect(config.pack).toEqual({ entry: ['src/cli.ts'] });
  });

  test('is callable by Vite+ with ConfigEnv', async () => {
    const config = await byc(
      { define: { A: '1' } },
      { cwd: single },
    )({
      command: 'build',
      mode: 'production',
    });

    expect(config.define).toEqual({ A: '1' });
    expect(config.lint).toBeDefined();
  });

  test('supports function configs', async () => {
    const config = byc(({ mode }) => ({ define: { MODE: JSON.stringify(mode) } }), {
      cwd: single,
    });

    const resolved = await config({ command: 'build', mode: 'production' });
    const awaited = await config;

    expect(resolved.define).toEqual({ MODE: '"production"' });
    expect(resolved.lint).toBeDefined();
    expect(typeof awaited).toBe('function');
  });
});

describe('workspace member', () => {
  const member = join(workspace, 'packages/lib');

  test('only emits run', async () => {
    const config = await byc({}, { cwd: member, cachedTasks: true });

    expect(config.lint).toBeUndefined();
    expect(config.fmt).toBeUndefined();
    expect(config.staged).toBeUndefined();
    expect(config.run).toBeDefined();
    expect(config.pack).toBeUndefined();
  });

  test('emits nothing without cachedTasks', async () => {
    const config = await byc({}, { cwd: member });

    expect(config.run).toBeUndefined();
  });

  test('throws when lint or fmt is configured', async () => {
    await expect(byc({ fmt: {} }, { cwd: member })).rejects.toThrow(/`fmt`/);
    await expect(byc({}, { cwd: member }).remove(lintNames.style)).rejects.toThrow(/`lint`/);
  });

  test('workspace root keeps lint and fmt', async () => {
    await expect(byc({ fmt: {} }, { cwd: workspace })).resolves.toHaveProperty('lint');
  });
});

describe('@byc/vp-config/fmt', () => {
  test('merges the preset under the config', () => {
    const config = createFmtConfig({ cwd: workspace })({ printWidth: 120 });

    expect(config).toMatchObject({ printWidth: 120, singleQuote: true, sortTailwindcss: true });
  });

  test('defaults to an empty config', () => {
    expect(defineFmt()).toMatchObject({ singleQuote: true });
  });
});

describe('@byc/vp-config/lint', () => {
  function rule(config: ReturnType<typeof defineLint>, name: string): unknown {
    return [config, ...(config.overrides ?? [])].findLast(item => item.rules?.[name] !== undefined)
      ?.rules?.[name];
  }

  test('returns a plain oxlint config with the preset first', () => {
    const config = createLintConfig({ cwd: workspace })({ rules: { curly: 'off' } });

    expect(config).not.toHaveProperty('then');
    expect(config.options).toMatchObject({ typeAware: false, typeCheck: false });
    expect(rule(config, 'react/rules-of-hooks')).toBe('error');
    expect(rule(config, 'curly')).toBe('off');
  });

  test('leaves out the vite-plus plugin when vite-plus is not a dependency', () => {
    const config = createLintConfig({ cwd: single })();

    expect(config.jsPlugins ?? []).toEqual([]);
    expect(JSON.stringify(config)).not.toContain('vite-plus');
    expect(
      rule(
        createLintConfig({ cwd: single, traits: { vitePlus: true } })(),
        'vite-plus/prefer-vite-plus-imports',
      ),
    ).toBe('error');
  });

  test('typeAware follows tsgolint or vite-plus', () => {
    const withTsgolint = createLintConfig({ cwd: single, traits: { tsgolint: true } })();
    const withVitePlus = createLintConfig({ cwd: single, traits: { vitePlus: true } })();

    expect(withTsgolint.options).toMatchObject({ typeAware: true, typeCheck: true });
    expect(withVitePlus.options).toMatchObject({ typeAware: true, typeCheck: true });
  });

  test('options change the preset', () => {
    const config = createLintConfig({ cwd: single, typeAware: false, stylistic: true })();

    expect(config.options).toMatchObject({ typeAware: false, typeCheck: false });
    expect(rule(config, 'stylistic/brace-style')).toBeDefined();
    expect(rule(config, 'react/rules-of-hooks')).toBeUndefined();
  });
});

describe('findConfigDirectory', () => {
  test('finds oxlint.config and oxfmt.config', () => {
    expect(findConfigDirectory('Error\n    at /repo/oxlint.config.ts:1:1')).toBe('/repo');
    expect(findConfigDirectory('Error\n    at /repo/oxfmt.config.mjs:1:1')).toBe('/repo');
  });

  test('finds vite.config from a file url frame', () => {
    /* Build URLs from platform paths, since `file:///C:/...` only resolves to `C:\` on Windows */
    const root = resolve('/repo');
    const library = pathToFileURL(join(root, 'node_modules/@byc/vp-config/dist/index.mjs')).href;
    const config = pathToFileURL(join(root, 'packages/a/vite.config.ts')).href;

    const stack = [
      'Error: Find vite config',
      `    at byc (${library}:10:5)`,
      `    at ${config}:3:16`,
    ].join('\n');

    expect(findConfigDirectory(stack)).toBe(join(root, 'packages/a'));
  });

  test('finds vite.config from a path frame', () => {
    const stack = 'Error\n    at Object.<anonymous> (/repo/vite.config.mts:1:1)';

    expect(findConfigDirectory(stack)).toBe('/repo');
  });

  test('returns undefined without a config frame', () => {
    expect(findConfigDirectory('Error\n    at foo (/repo/src/a.ts:1:1)')).toBeUndefined();
    expect(findConfigDirectory(undefined)).toBeUndefined();
  });
});
