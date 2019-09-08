import commonjs from 'rollup-plugin-commonjs';
import resolve from 'rollup-plugin-node-resolve';

export default {
  input: 'index.js',
  output: {
    file: 'bundle.js',
    format: 'iife',
    globals: {
      geotiff: 'GeoTIFF',
      leaflet: 'L'
    }
  },
  external: ['geotiff', 'leaflet'],
  plugins: [ 
    resolve(),
    commonjs({
      include: [
        'node_modules/**',
        '../node_modules/**',
        '../../raster-blaster/node_modules/**'],
    })
  ]
}
