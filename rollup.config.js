import resolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';
import terser from '@rollup/plugin-terser';

export default {
  input: 'assets/js/main.js',
  output: [
    {
      file: 'dist/assets/js/main.js',
      format: 'iife',
      name: 'BulalGetir',
      sourcemap: process.env.NODE_ENV === 'development'
    },
    {
      file: 'dist/assets/js/main.min.js',
      format: 'iife',
      name: 'BulalGetir',
      plugins: [terser()],
      sourcemap: false
    }
  ],
  plugins: [
    resolve(),
    commonjs()
  ]
};