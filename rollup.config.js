import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'src/index.js',
  output: {
    file: 'dist/bundle.js',
    name: 'L.Raster',
    format: 'umd',
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
