import type { OxfmtConfig } from 'oxfmt';

import type { ProjectTraits } from '../detect.ts';

export const fmtBase: OxfmtConfig = {
  singleQuote: true,
  sortImports: {
    partitionByComment: true,
  },
  sortPackageJson: {
    sortScripts: true,
  },
  arrowParens: 'avoid',
  embeddedLanguageFormatting: 'auto',
  printWidth: 100,
};

export function createFmt(traits: Pick<ProjectTraits, 'tailwindcss'>): OxfmtConfig {
  return {
    ...fmtBase,
    ...(traits.tailwindcss ? { sortTailwindcss: true } : {}),
  };
}
