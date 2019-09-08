import GeoTIFFLayer from '../src/index'
import GeoTIFF from 'geotiff'
import Pipeline from 'raster-blaster/src/pipeline'
import * as PipelineSteps from 'raster-blaster/src/pipeline-steps'
import WebGlRenderer from 'raster-blaster/src/webgl/webgl-renderer'

const contrastStep = new PipelineSteps.LinearContrast(0.2, 0.8)
const pipeline = new Pipeline([
  // new PipelineSteps.Index('$r+$g-$b'),
  // new PipelineSteps.LinearContrast(0.0, 1.0),
  // new PipelineSteps.ColorMap('RdYlGn'),
  // new PipelineSteps.BandsToChannels({ a: 'a' })
  new PipelineSteps.BandsToChannels({ r: 'r', g: 'g', b: 'b', a: 'a' }),
  contrastStep,
],
{
  // Map (arbitrary) band names to their indices
  bands: {
    'r': 0,
    'g': 1,
    'b': 2,
    'a': 3
  },
  dataType: 'Uint8'
})

const renderer = new WebGlRenderer({
  width: 256,
  height: 256
})

const renderFn = (canvas, getRasters) => renderer.render(canvas, pipeline, { getRasters })

GeoTIFF.fromUrl('data/ortho.tiff')
.then(tiff => {
  const geotiffLayer = new GeoTIFFLayer(tiff, renderFn)
  L.map('map', {
    maxZoom: 26,
    layers: [
      L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 26, maxNativeZoom: 18 }),
      geotiffLayer
    ]
  })
  .fitBounds([[57.3066538, 12.3338591], [57.3089762, 12.3387167]])

  const update = () => {
    const t = +new Date()
    contrastStep.low = 0.2 + Math.sin(t / 731) * 0.2
    contrastStep.high = 0.8 + Math.cos(t / 483) * 0.2
    geotiffLayer.render()
    .then(() => setTimeout(update), 10)
  }

  update()
})

