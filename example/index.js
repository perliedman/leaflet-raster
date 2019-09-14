import RasterLayer from '../src/index'
import GeoTIFF from 'geotiff'
import Pipeline from 'raster-blaster/src/pipeline'
import * as PipelineSteps from 'raster-blaster/src/pipeline-steps'
import WebGlRenderer from 'raster-blaster/src/webgl/webgl-renderer'

const contrastStep = new PipelineSteps.SmoothstepContrast(0.2, 0.8)
const pipeline = new Pipeline([
  new PipelineSteps.BandsToChannels('rgba'),
  contrastStep,
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
  const geotiffLayer = new RasterLayer(tiff, rasterFn, renderFn)

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
    .then(() => requestAnimationFrame(update), 10)
  }

  requestAnimationFrame(update)
})

