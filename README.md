**This project never really took of, I'm not maintaining it and it's not likely to be very useful to you.**

Leaflet Raster
==============

A simple plugin for powerful raster functions.

**UNMAINTAINED** This repo never reached more than proof-of-concept status, feel free to check it out for ideas, but don't expect it to work. Sorry.

This plugin makes it easy to add powerful raster processing to your Leaflet map,
running directly in the browser. Examples can be hill shading, vegetation index analysis (NDVI for example) and much more.

The plugin by itself is very small and does very little. Its purpose is to function
as the glue between Leaflet and powerful libraries like [GeoTIFF.js](https://geotiffjs.github.io/) and [raster-blaster](https://github.com/perliedman/raster-blaster).

A small example using both GeoTIFF.js and raster-blaster:

```js
import RasterLayer from 'leaflet-raster'
import GeoTIFF from 'geotiff'
import Pipeline from 'raster-blaster/src/pipeline'
import * as PipelineSteps from 'raster-blaster/src/pipeline-steps'
import WebGlRenderer from 'raster-blaster/src/webgl/webgl-renderer'

const pipeline = new Pipeline([
  // VARI vegetation index
  new PipelineSteps.GrayScale('($g - $r) / ($g + $r - $b)'),
  // Stretch histogram to between index 0.2 to 0.8
  new PipelineSteps.SmoothstepContrast(0.2, 0.8)
  // Map grayscale to color scale Red-Yellow-Green 
  new PipelineSteps.ColorMap('RdYlGn'),
  // Copy alpha band directly to alpha channel
  new PipelineSteps.BandsToChannels('a')
],
{
  bands: 'rgba',
  dataType: 'Uint8'
})

const renderer = new WebGlRenderer()

const renderFn = (canvas, getRasters) => renderer.render(canvas, pipeline, getRasters)

GeoTIFF.fromUrl('data/ortho.tiff')
.then(tiff => {
  const rasterFn = (nwSe, size) => tiff.readRasters({
    bbox: [nwSe[0].lng, nwSe[1].lat, nwSe[1].lng, nwSe[0].lat],
    width: size.x,
    height: size.y
  })
  // RasterLayer ties the raster function (GeoTIFF.js) and
  // render function (raster-blaster) together
  const geotiffLayer = new RasterLayer(tiff, rasterFn, renderFn)

  L.map('map', {
    maxZoom: 26,
    layers: [geotiffLayer]
  })
  .fitBounds([[57.3066538, 12.3338591], [57.3089762, 12.3387167]])
```
