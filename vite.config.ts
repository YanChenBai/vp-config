import { byc } from './src/index.ts';

export default byc(
  {
    pack: {
      entry: ['./src/index.ts'],
      exports: true,
      dts: { generator: 'tsgo' },
      deps: {
        /* Bundle the YAML parser so users only need vite-plus */
        onlyBundle: ['yaml'],
      },
    },
  },
  { stylistic: true },
);
