import resolve from 'rollup-plugin-node-resolve';
import commonjs from 'rollup-plugin-node-commonjs';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    name: 'L.RB',
    format: 'iife',
    globals: {
      leaflet: 'L'
    }
  },
  external: ['leaflet'],
  plugins: [ 
    resolve(),
    commonjs({
      include: [
        'node_modules/**'
      ]
    })
  ]
}
