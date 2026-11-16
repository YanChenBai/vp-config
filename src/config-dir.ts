import { existsSync, readFileSync } from 'node:fs';
import { basename, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

/* `vite.config` for the root entry, `oxlint.config` / `oxfmt.config` for the subpath entries */
const configFilePattern = /^(?:vite|oxlint|oxfmt)\.config\.[cm]?[jt]s$/u;

/* Vite bundles configs into `node_modules/.vite-temp/vite.config.ts.timestamp-<hash>.mjs` */
const bundledConfigPattern = /^(vite\.config\.[cm]?[jt]s)\.timestamp-[\w-]+\.mjs$/u;

/* The inline source map of a bundled config keeps the absolute source paths */
const sourceMapPattern =
  /\/\/# sourceMappingURL=data:application\/json;(?:charset=utf-8;)?base64,([\w+/=]+)\s*$/u;

const framePattern = /(file:\/\/\/[^\s)]+|(?:[A-Za-z]:)?[\\/][^\s():]+):\d+:\d+/u;

function parseFramePath(line: string): string | undefined {
  const [, location] = framePattern.exec(line) ?? [];

  if (!location) {
    return undefined;
  }

  return location.startsWith('file://') ? fileURLToPath(location) : location;
}

function readSourceMapSources(sourceMap: string): string[] {
  const { sources } = JSON.parse(Buffer.from(sourceMap, 'base64').toString('utf8')) as {
    sources?: string[];
  };

  return sources ?? [];
}

function readBundledConfigFile(path: string, configName: string): string | undefined {
  if (!existsSync(path)) {
    return undefined;
  }

  const [, sourceMap] = sourceMapPattern.exec(readFileSync(path, 'utf8')) ?? [];

  if (!sourceMap) {
    return undefined;
  }

  return readSourceMapSources(sourceMap).findLast(source => basename(source) === configName);
}

function resolveConfigFile(path: string): string | undefined {
  const name = basename(path);

  if (configFilePattern.test(name)) {
    return path;
  }

  const [, configName] = bundledConfigPattern.exec(name) ?? [];

  return configName ? readBundledConfigFile(path, configName) : undefined;
}

/**
 * Finds the directory of the config file calling `defineConfig()` from a stack trace.
 *
 * cwd is unreliable: `vp lint` in a member loads the root config with the member as cwd.
 */
export function findConfigDirectory(stack: string | undefined): string | undefined {
  for (const line of (stack ?? '').split('\n')) {
    const path = parseFramePath(line);
    const configFile = path ? resolveConfigFile(path) : undefined;

    if (configFile) {
      return dirname(configFile);
    }
  }

  return undefined;
}
