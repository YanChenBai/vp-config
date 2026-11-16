import type { DummyRuleMap } from 'oxlint';
/* Not the `/vite-plus` entries, so standalone Oxlint works without vite-plus installed */
import { category } from 'oxlint-flat-config';
import type { CategorySelection, FlatConfigItem } from 'oxlint-flat-config';

import type { ProjectTraits } from '../detect.ts';

type Rules = DummyRuleMap;

export interface LintPresetOptions {
  react: boolean;
  stylistic: boolean;
  consoleFiles: string[];
  typeAware: boolean;
}

export const correctnessRules: Rules = {
  'constructor-super': 'warn',
  'for-direction': 'warn',
  'no-async-promise-executor': 'warn',
  'no-caller': 'warn',
  'no-class-assign': 'warn',
  'no-compare-neg-zero': 'warn',
  'no-cond-assign': 'warn',
  'no-const-assign': 'warn',
  'no-constant-binary-expression': 'warn',
  'no-constant-condition': 'warn',
  'no-control-regex': 'warn',
  'no-debugger': 'warn',
  'no-delete-var': 'warn',
  'no-dupe-class-members': 'warn',
  'no-dupe-else-if': 'warn',
  'no-dupe-keys': 'warn',
  'no-duplicate-case': 'warn',
  'no-empty-character-class': 'warn',
  'no-empty-pattern': 'warn',
  'no-empty-static-block': 'warn',
  'no-eval': 'warn',
  'no-ex-assign': 'warn',
  'no-extra-boolean-cast': 'warn',
  'no-func-assign': 'warn',
  'no-global-assign': 'warn',
  'no-import-assign': 'warn',
  'no-invalid-regexp': 'warn',
  'no-irregular-whitespace': 'warn',
  'no-loss-of-precision': 'warn',
  'no-new-native-nonconstructor': 'warn',
  'no-nonoctal-decimal-escape': 'warn',
  'no-obj-calls': 'warn',
  'no-self-assign': 'warn',
  'no-setter-return': 'warn',
  'no-shadow-restricted-names': 'warn',
  'no-sparse-arrays': 'warn',
  'no-this-before-super': 'warn',
  'no-unassigned-vars': 'warn',
  'no-unsafe-finally': 'warn',
  'no-unsafe-negation': 'warn',
  'no-unsafe-optional-chaining': 'warn',
  'no-unused-expressions': 'warn',
  'no-unused-labels': 'warn',
  'no-unused-private-class-members': 'warn',
  'no-unused-vars': 'warn',
  'no-useless-backreference': 'warn',
  'no-useless-catch': 'warn',
  'no-useless-escape': 'warn',
  'no-useless-rename': 'warn',
  'no-with': 'warn',
  'require-yield': 'warn',
  'use-isnan': 'warn',
  'valid-typeof': 'warn',
  'oxc/bad-array-method-on-arguments': 'warn',
  'oxc/bad-char-at-comparison': 'warn',
  'oxc/bad-comparison-sequence': 'warn',
  'oxc/bad-min-max-func': 'warn',
  'oxc/bad-object-literal-comparison': 'warn',
  'oxc/bad-replace-all-arg': 'warn',
  'oxc/const-comparisons': 'warn',
  'oxc/double-comparisons': 'warn',
  'oxc/erasing-op': 'warn',
  'oxc/missing-throw': 'warn',
  'oxc/number-arg-out-of-range': 'warn',
  'oxc/only-used-in-recursion': 'warn',
  'oxc/uninvoked-array-callback': 'warn',
  'typescript/no-duplicate-enum-values': 'warn',
  'typescript/no-extra-non-null-assertion': 'warn',
  'typescript/no-misused-new': 'warn',
  'typescript/no-non-null-asserted-optional-chain': 'warn',
  'typescript/no-this-alias': 'warn',
  'typescript/no-unnecessary-parameter-property-assignment': 'warn',
  'typescript/no-unsafe-declaration-merging': 'warn',
  'typescript/no-useless-empty-export': 'warn',
  'typescript/no-wrapper-object-types': 'warn',
  'typescript/prefer-as-const': 'warn',
  'typescript/triple-slash-reference': 'warn',
  'unicorn/no-await-in-promise-methods': 'warn',
  'unicorn/no-empty-file': 'warn',
  'unicorn/no-invalid-fetch-options': 'warn',
  'unicorn/no-invalid-remove-event-listener': 'warn',
  'unicorn/no-new-array': 'warn',
  'unicorn/no-single-promise-in-promise-methods': 'warn',
  'unicorn/no-thenable': 'warn',
  'unicorn/no-unnecessary-await': 'warn',
  'unicorn/no-useless-fallback-in-spread': 'warn',
  'unicorn/no-useless-length-check': 'warn',
  'unicorn/no-useless-spread': 'warn',
  'unicorn/prefer-set-size': 'warn',
  'unicorn/prefer-string-starts-ends-with': 'warn',
  eqeqeq: 'warn',
  'array-callback-return': 'warn',
  'no-case-declarations': 'warn',
  'no-fallthrough': 'warn',
  'no-promise-executor-return': 'warn',
  'no-self-compare': 'warn',
  'no-throw-literal': 'warn',
  'no-useless-concat': 'warn',
  'import/no-self-import': 'warn',
  'promise/no-new-statics': 'warn',
  'unicorn/new-for-builtins': 'warn',
  'unicorn/error-message': 'warn',
};

export const typeAwareRules: Rules = {
  'typescript/await-thenable': 'warn',
  'typescript/no-array-delete': 'warn',
  'typescript/no-base-to-string': 'warn',
  'typescript/no-duplicate-type-constituents': 'warn',
  'typescript/no-floating-promises': 'off',
  'typescript/no-for-in-array': 'warn',
  'typescript/no-implied-eval': 'warn',
  'typescript/no-meaningless-void-operator': 'warn',
  'typescript/no-misused-spread': 'warn',
  'typescript/no-redundant-type-constituents': 'warn',
  'typescript/no-unsafe-unary-minus': 'warn',
  'typescript/require-array-sort-compare': 'warn',
  'typescript/restrict-template-expressions': 'warn',
  'typescript/unbound-method': 'warn',
  'typescript/switch-exhaustiveness-check': 'error',
  'typescript/consistent-type-exports': 'warn',
  'typescript/no-deprecated': 'warn',
  'typescript/no-unnecessary-type-assertion': 'warn',
  'typescript/only-throw-error': 'warn',
  'typescript/prefer-find': 'warn',
  'typescript/prefer-nullish-coalescing': 'warn',
  'typescript/return-await': ['warn', 'in-try-catch'],
};

export const readabilityRules: Rules = {
  'no-var': 'warn',
  'object-shorthand': 'warn',
  'prefer-arrow-callback': 'warn',
  'prefer-exponentiation-operator': 'warn',
  'prefer-object-has-own': 'warn',
  'prefer-object-spread': 'warn',
  'prefer-rest-params': 'warn',
  'prefer-spread': 'warn',
  'no-useless-computed-key': 'warn',
  'no-useless-return': 'warn',
  'no-array-constructor': 'warn',
  'no-lone-blocks': 'warn',
  'no-multi-assign': 'warn',
  'operator-assignment': 'warn',
  'logical-assignment-operators': 'warn',
  yoda: 'warn',
  'import/consistent-type-specifier-style': 'warn',
  'import/first': 'warn',
  'import/newline-after-import': 'warn',
  'import/no-duplicates': 'warn',
  'import/no-mutable-exports': 'warn',
  'promise/no-return-wrap': 'warn',
  'promise/param-names': 'warn',
  'typescript/adjacent-overload-signatures': 'warn',
  'typescript/array-type': 'warn',
  'typescript/consistent-type-definitions': ['warn', 'interface'],
  'typescript/no-empty-interface': ['warn', { allowSingleExtends: true }],
  'typescript/no-import-type-side-effects': 'warn',
  'typescript/no-inferrable-types': 'warn',
  'typescript/prefer-for-of': 'warn',
  'typescript/prefer-function-type': 'warn',
  'unicorn/catch-error-name': 'warn',
  'unicorn/no-instanceof-array': 'warn',
  'unicorn/no-typeof-undefined': 'warn',
  'unicorn/no-useless-promise-resolve-reject': 'warn',
  'unicorn/no-zero-fractions': 'warn',
  'unicorn/prefer-array-flat': 'warn',
  'unicorn/prefer-array-flat-map': 'warn',
  'unicorn/prefer-array-some': 'warn',
  'unicorn/prefer-date-now': 'warn',
  'unicorn/prefer-includes': 'warn',
  'unicorn/prefer-modern-math-apis': 'warn',
  'unicorn/prefer-node-protocol': 'warn',
  'unicorn/prefer-number-properties': 'warn',
  'unicorn/prefer-optional-catch-binding': 'warn',
  'unicorn/prefer-regexp-test': 'warn',
  'unicorn/prefer-string-replace-all': 'warn',
  'unicorn/prefer-string-slice': 'warn',
  'unicorn/prefer-string-trim-start-end': 'warn',
  'unicorn/prefer-structured-clone': 'warn',
  'unicorn/throw-new-error': 'warn',
};

/* Requires `vite-plus` installed in the project */
export const vitePlusRules: Rules = {
  'vite-plus/prefer-vite-plus-imports': 'error',
};

export const styleRules: Rules = {
  'typescript/consistent-type-imports': 'error',
  'unicorn/switch-case-braces': 'error',
  'default-case-last': 'allow',
  'no-return-assign': 'error',
  'no-implicit-coercion': 'error',
  'prefer-template': 'error',
  'prefer-const': 'error',
  'no-sequences': 'error',
  'no-console': ['error', { allow: ['warn', 'error'] }],
  curly: 'error',
  /* Keep comments on their own line */
  'no-inline-comments': 'error',
  'no-else-return': 'error',
  'no-lonely-if': 'error',
  'no-nested-ternary': 'error',
  'no-unneeded-ternary': 'error',
  'max-depth': ['warn', { max: 4 }],
  complexity: ['warn', { max: 12 }],
  'unicorn/max-nested-calls': ['warn', { max: 3 }],
};

/* Requires `@stylistic/eslint-plugin` installed in the project */
export const stylisticRules: Rules = {
  'stylistic/multiline-comment-style': ['error', 'starred-block'],
  'stylistic/brace-style': ['error', '1tbs', { allowSingleLine: false }],
  'stylistic/lines-between-class-members': [
    'error',
    {
      enforce: [
        { blankLine: 'always', prev: '*', next: 'method' },
        { blankLine: 'always', prev: 'method', next: '*' },
      ],
    },
  ],
  'stylistic/padding-line-between-statements': [
    'error',
    { blankLine: 'always', prev: '*', next: ['if', 'return'] },
    { blankLine: 'always', prev: 'if', next: '*' },
    { blankLine: 'always', prev: '*', next: 'export' },
    { blankLine: 'always', prev: '*', next: 'block-like' },
    { blankLine: 'always', prev: 'block-like', next: '*' },
    {
      blankLine: 'always',
      prev: '*',
      next: ['multiline-const', 'multiline-let', 'multiline-var'],
    },
    {
      blankLine: 'always',
      prev: ['multiline-const', 'multiline-let', 'multiline-var'],
      next: '*',
    },
  ],
};

export const reactRules: Rules = {
  'react/rules-of-hooks': 'error',
  'react/exhaustive-deps': 'warn',
  'react/jsx-key': 'error',
  'react/jsx-no-duplicate-props': 'error',
  'react/jsx-no-undef': 'error',
  'react/no-children-prop': 'error',
  'react/no-direct-mutation-state': 'error',
  'react/no-danger-with-children': 'error',
  'react/jsx-no-useless-fragment': 'warn',
  'react/jsx-curly-brace-presence': ['warn', { props: 'never', children: 'never' }],
  /* Explicit ARIA roles are fine for status text and drawn graphics */
  'jsx-a11y/prefer-tag-over-role': 'off',
  'jsx-a11y/alt-text': 'error',
  'jsx-a11y/aria-props': 'error',
  'jsx-a11y/aria-proptypes': 'error',
  'jsx-a11y/aria-unsupported-elements': 'error',
  'jsx-a11y/role-has-required-aria-props': 'error',
  'jsx-a11y/role-supports-aria-props': 'error',
  'jsx-a11y/heading-has-content': 'error',
};

export const testRules: Rules = {
  'vitest/no-focused-tests': 'error',
  'vitest/no-identical-title': 'error',
  'vitest/valid-expect': 'error',
  'vitest/no-disabled-tests': 'warn',
};

export const defaultConsoleFiles = ['scripts/**', 'bin/**', 'apps/*-server/**'];

/* Oxlint's default plugins */
const defaultPlugins: CategorySelection['plugins'] = ['eslint', 'typescript', 'unicorn', 'oxc'];

/* Names of the preset objects, for `.override()`, `.remove()` and other composer methods */
export const lintNames = {
  options: 'byc/options',
  correctness: 'byc/correctness',
  typeAware: 'byc/type-aware',
  readability: 'byc/readability',
  style: 'byc/style',
  vitePlus: 'byc/vite-plus',
  stylistic: 'byc/stylistic',
  console: 'byc/console',
  test: 'byc/test',
  react: 'byc/react',
} as const;

/**
 * Flat config turns off Oxlint's default categories,
 * so `correctness` is expanded explicitly to keep the default behavior.
 */
export function createLint(
  options: LintPresetOptions & Pick<ProjectTraits, 'react' | 'vitePlus'>,
): FlatConfigItem[] {
  const correctness = category({ correctness: 'warn', plugins: defaultPlugins });

  const items: (FlatConfigItem | false)[] = [
    {
      name: lintNames.options,
      options: {
        typeAware: options.typeAware,
        typeCheck: options.typeAware,
        reportUnusedDisableDirectives: 'warn',
      },
    },
    {
      name: lintNames.correctness,
      rules: { ...correctness.rules, ...correctnessRules },
    },
    options.typeAware && { name: lintNames.typeAware, rules: typeAwareRules },
    { name: lintNames.readability, rules: readabilityRules },
    { name: lintNames.style, rules: styleRules },
    options.vitePlus && {
      name: lintNames.vitePlus,
      jsPlugins: [{ name: 'vite-plus', specifier: 'vite-plus/oxlint-plugin' }],
      rules: vitePlusRules,
    },
    options.stylistic && {
      name: lintNames.stylistic,
      jsPlugins: [{ name: 'stylistic', specifier: '@stylistic/eslint-plugin' }],
      rules: stylisticRules,
    },
    options.consoleFiles.length > 0 && {
      name: lintNames.console,
      files: options.consoleFiles,
      env: { node: true },
      rules: { 'no-console': 'off' },
    },
    {
      name: lintNames.test,
      files: ['**/*.{test,spec}.{ts,tsx,js,jsx}'],
      env: { node: true, vitest: true },
      rules: testRules,
    },
    options.react && { name: lintNames.react, files: ['**/*.{jsx,tsx}'], rules: reactRules },
  ];

  return items.filter(item => item !== false);
}
