import L from 'leaflet'
import LRU from 'lru-cache'

const cache = new LRU(50)

const GeoTIFFLayer = L.GridLayer.extend({
  initialize (tiff, renderFn, options) {
    L.GridLayer.prototype.initialize(options)

    this.tiff = tiff
    this.renderFn = renderFn
  },

  createTile (coords, done) {
    const tile = L.DomUtil.create('canvas', 'leaflet-tile')
    const size = this.getTileSize()
    tile.width = size.x
    tile.height = size.y

    this._renderTile(coords, tile)
    .then(() => done(null, tile))
    .catch(err => done(err))

    return tile
  },

  render () {
    const tileKeys = Object.keys(this._tiles)
    const promises = []
    for (let i = 0; i < tileKeys.length; i++) {
      const key = tileKeys[i]
      const tile = this._tiles[key]
      if (tile.current) {
        const coords = this._keyToTileCoords(key)
        promises.push(this._renderTile(coords, tile.el))
      }
    }

    return Promise.all(promises)
  },

  _renderTile (coords, tile) {
    const key = this._tileCoordsToKey(coords)
    const nwSe = this._tileCoordsToNwSe(coords)
    const size = this.getTileSize()

    const dataFn = () => cache.get(key) || this.tiff.readRasters({
      bbox: [nwSe[0].lng, nwSe[1].lat, nwSe[1].lng, nwSe[0].lat],
      width: size.x,
      height: size.y
    })
    .then(rasters => {
      const data = rasters.map(r => ({
        data: r,
        width: size.x,
        height: size.y
      }))
      cache.set(key, data)

      return data
    })

    return this.renderFn(tile, dataFn)
  }
})

export default GeoTIFFLayer
