import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import json from '@rollup/plugin-json';
import typescript from 'rollup-plugin-typescript2';
import packageJson from './package.json';

export default {
  input: 'src/index.ts',
  output: [
    {
      format: 'cjs',
      file: packageJson.main,
    },
    {
      format: 'esm',
      file: packageJson.module,
    },
    {
      format: 'umd',
      esModule: false,
      file: packageJson.browser,
      name: 'UnitSystem',
    },
  ],
  plugins: [
    json(),
    resolve(),
    typescript({
      // Emit declarations in the specified directory
      // instead of next to each individual built target.
      useTsconfigDeclarationDir: true,
    }),
    commonjs(),
  ],
};
