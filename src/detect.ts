import { existsSync, globSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';

import { parse } from 'yaml';

export interface ProjectTraits {
  /* Any workspace package depends on react */
  react: boolean;
  /* Any workspace package depends on tailwindcss */
  tailwindcss: boolean;
  /* Any workspace package depends on vite-plus */
  vitePlus: boolean;
  /* Any workspace package depends on oxlint-tsgolint, the type-aware linter */
  tsgolint: boolean;
}

interface PackageJson {
  workspaces?: string[] | { packages?: string[] };
  dependencies?: Record<string, string>;
  devDependencies?: Record<string, string>;
  peerDependencies?: Record<string, string>;
  optionalDependencies?: Record<string, string>;
}

export function readPackageJson(directory: string): PackageJson | undefined {
  const path = join(directory, 'package.json');

  if (!existsSync(path)) {
    return undefined;
  }

  return JSON.parse(readFileSync(path, 'utf8')) as PackageJson;
}

/* A pnpm-workspace.yaml with only a catalog and no packages is not a workspace */
export function readWorkspacePatterns(directory: string): string[] | undefined {
  const pnpmWorkspace = join(directory, 'pnpm-workspace.yaml');
  let patterns: string[] | undefined;

  if (existsSync(pnpmWorkspace)) {
    const config = parse(readFileSync(pnpmWorkspace, 'utf8')) as { packages?: string[] } | null;

    patterns = config?.packages;
  } else {
    const { workspaces } = readPackageJson(directory) ?? {};

    patterns = Array.isArray(workspaces) ? workspaces : workspaces?.packages;
  }

  return patterns && patterns.length > 0 ? patterns : undefined;
}

/* Walks up until a workspace root is found, stopping at the git root */
export function findWorkspaceRoot(directory: string): string | undefined {
  const current = resolve(directory);

  if (readWorkspacePatterns(current)) {
    return current;
  }

  const parent = dirname(current);

  if (parent === current || existsSync(join(current, '.git'))) {
    return undefined;
  }

  return findWorkspaceRoot(parent);
}

export function isWorkspaceMember(directory: string): boolean {
  const root = findWorkspaceRoot(directory);

  return root !== undefined && root !== resolve(directory);
}

export function listWorkspaceMembers(root: string): string[] {
  const patterns = readWorkspacePatterns(root) ?? [];
  const toManifest = (pattern: string) => `${pattern.replace(/\/+$/u, '')}/package.json`;
  const included = patterns.filter(pattern => !pattern.startsWith('!')).map(toManifest);
  const excluded = patterns.filter(pattern => pattern.startsWith('!')).map(p => p.slice(1));

  if (included.length === 0) {
    return [];
  }

  const manifests = globSync(included, {
    cwd: root,
    exclude: ['**/node_modules/**', ...excluded.map(toManifest)],
  });

  return manifests
    .map(manifest => resolve(root, dirname(manifest)))
    .filter(member => member !== resolve(root))
    .toSorted();
}

function listDependencies(packageJson: PackageJson | undefined): string[] {
  return [
    ...Object.keys(packageJson?.dependencies ?? {}),
    ...Object.keys(packageJson?.devDependencies ?? {}),
    ...Object.keys(packageJson?.peerDependencies ?? {}),
    ...Object.keys(packageJson?.optionalDependencies ?? {}),
  ];
}

/* Covers the whole workspace, since lint and fmt only apply from the root */
export function detectTraits(directory: string): ProjectTraits {
  const root = findWorkspaceRoot(directory);
  const directories = root ? [root, ...listWorkspaceMembers(root)] : [directory];
  const dependencies = new Set(directories.flatMap(dir => listDependencies(readPackageJson(dir))));

  return {
    react: dependencies.has('react'),
    tailwindcss: dependencies.has('tailwindcss'),
    vitePlus: dependencies.has('vite-plus'),
    tsgolint: dependencies.has('oxlint-tsgolint'),
  };
}
