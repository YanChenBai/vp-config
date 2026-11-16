import { defineConfig } from './src/index.ts';

export default defineConfig(
  {
    lint: [
      {
        /* The standalone entries must not depend on vite-plus */
        files: ['src/fmt.ts', 'src/lint.ts', 'src/presets/fmt.ts', 'src/presets/lint.ts'],
        rules: { 'vite-plus/prefer-vite-plus-imports': 'off' },
      },
    ],
    pack: {
      entry: ['./src/index.ts', './src/fmt.ts', './src/lint.ts'],
      exports: true,
      dts: { generator: 'tsgo' },
      deps: {
        /* Bundle the YAML parser so users only need vite-plus */
        onlyBundle: ['yaml'],
      },
    },
  },
  { stylistic: true, cachedTasks: true },
);
