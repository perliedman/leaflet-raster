(function (L$1, GeoTIFF) {
  'use strict';

  L$1 = L$1 && L$1.hasOwnProperty('default') ? L$1['default'] : L$1;
  GeoTIFF = GeoTIFF && GeoTIFF.hasOwnProperty('default') ? GeoTIFF['default'] : GeoTIFF;

  var iterator = function (Yallist) {
    Yallist.prototype[Symbol.iterator] = function* () {
      for (let walker = this.head; walker; walker = walker.next) {
        yield walker.value;
      }
    };
  };

  var yallist = Yallist;

  Yallist.Node = Node;
  Yallist.create = Yallist;

  function Yallist (list) {
    var self = this;
    if (!(self instanceof Yallist)) {
      self = new Yallist();
    }

    self.tail = null;
    self.head = null;
    self.length = 0;

    if (list && typeof list.forEach === 'function') {
      list.forEach(function (item) {
        self.push(item);
      });
    } else if (arguments.length > 0) {
      for (var i = 0, l = arguments.length; i < l; i++) {
        self.push(arguments[i]);
      }
    }

    return self
  }

  Yallist.prototype.removeNode = function (node) {
    if (node.list !== this) {
      throw new Error('removing node which does not belong to this list')
    }

    var next = node.next;
    var prev = node.prev;

    if (next) {
      next.prev = prev;
    }

    if (prev) {
      prev.next = next;
    }

    if (node === this.head) {
      this.head = next;
    }
    if (node === this.tail) {
      this.tail = prev;
    }

    node.list.length--;
    node.next = null;
    node.prev = null;
    node.list = null;
  };

  Yallist.prototype.unshiftNode = function (node) {
    if (node === this.head) {
      return
    }

    if (node.list) {
      node.list.removeNode(node);
    }

    var head = this.head;
    node.list = this;
    node.next = head;
    if (head) {
      head.prev = node;
    }

    this.head = node;
    if (!this.tail) {
      this.tail = node;
    }
    this.length++;
  };

  Yallist.prototype.pushNode = function (node) {
    if (node === this.tail) {
      return
    }

    if (node.list) {
      node.list.removeNode(node);
    }

    var tail = this.tail;
    node.list = this;
    node.prev = tail;
    if (tail) {
      tail.next = node;
    }

    this.tail = node;
    if (!this.head) {
      this.head = node;
    }
    this.length++;
  };

  Yallist.prototype.push = function () {
    for (var i = 0, l = arguments.length; i < l; i++) {
      push(this, arguments[i]);
    }
    return this.length
  };

  Yallist.prototype.unshift = function () {
    for (var i = 0, l = arguments.length; i < l; i++) {
      unshift(this, arguments[i]);
    }
    return this.length
  };

  Yallist.prototype.pop = function () {
    if (!this.tail) {
      return undefined
    }

    var res = this.tail.value;
    this.tail = this.tail.prev;
    if (this.tail) {
      this.tail.next = null;
    } else {
      this.head = null;
    }
    this.length--;
    return res
  };

  Yallist.prototype.shift = function () {
    if (!this.head) {
      return undefined
    }

    var res = this.head.value;
    this.head = this.head.next;
    if (this.head) {
      this.head.prev = null;
    } else {
      this.tail = null;
    }
    this.length--;
    return res
  };

  Yallist.prototype.forEach = function (fn, thisp) {
    thisp = thisp || this;
    for (var walker = this.head, i = 0; walker !== null; i++) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.next;
    }
  };

  Yallist.prototype.forEachReverse = function (fn, thisp) {
    thisp = thisp || this;
    for (var walker = this.tail, i = this.length - 1; walker !== null; i--) {
      fn.call(thisp, walker.value, i, this);
      walker = walker.prev;
    }
  };

  Yallist.prototype.get = function (n) {
    for (var i = 0, walker = this.head; walker !== null && i < n; i++) {
      // abort out of the list early if we hit a cycle
      walker = walker.next;
    }
    if (i === n && walker !== null) {
      return walker.value
    }
  };

  Yallist.prototype.getReverse = function (n) {
    for (var i = 0, walker = this.tail; walker !== null && i < n; i++) {
      // abort out of the list early if we hit a cycle
      walker = walker.prev;
    }
    if (i === n && walker !== null) {
      return walker.value
    }
  };

  Yallist.prototype.map = function (fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist();
    for (var walker = this.head; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.next;
    }
    return res
  };

  Yallist.prototype.mapReverse = function (fn, thisp) {
    thisp = thisp || this;
    var res = new Yallist();
    for (var walker = this.tail; walker !== null;) {
      res.push(fn.call(thisp, walker.value, this));
      walker = walker.prev;
    }
    return res
  };

  Yallist.prototype.reduce = function (fn, initial) {
    var acc;
    var walker = this.head;
    if (arguments.length > 1) {
      acc = initial;
    } else if (this.head) {
      walker = this.head.next;
      acc = this.head.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value')
    }

    for (var i = 0; walker !== null; i++) {
      acc = fn(acc, walker.value, i);
      walker = walker.next;
    }

    return acc
  };

  Yallist.prototype.reduceReverse = function (fn, initial) {
    var acc;
    var walker = this.tail;
    if (arguments.length > 1) {
      acc = initial;
    } else if (this.tail) {
      walker = this.tail.prev;
      acc = this.tail.value;
    } else {
      throw new TypeError('Reduce of empty list with no initial value')
    }

    for (var i = this.length - 1; walker !== null; i--) {
      acc = fn(acc, walker.value, i);
      walker = walker.prev;
    }

    return acc
  };

  Yallist.prototype.toArray = function () {
    var arr = new Array(this.length);
    for (var i = 0, walker = this.head; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.next;
    }
    return arr
  };

  Yallist.prototype.toArrayReverse = function () {
    var arr = new Array(this.length);
    for (var i = 0, walker = this.tail; walker !== null; i++) {
      arr[i] = walker.value;
      walker = walker.prev;
    }
    return arr
  };

  Yallist.prototype.slice = function (from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    var ret = new Yallist();
    if (to < from || to < 0) {
      return ret
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    for (var i = 0, walker = this.head; walker !== null && i < from; i++) {
      walker = walker.next;
    }
    for (; walker !== null && i < to; i++, walker = walker.next) {
      ret.push(walker.value);
    }
    return ret
  };

  Yallist.prototype.sliceReverse = function (from, to) {
    to = to || this.length;
    if (to < 0) {
      to += this.length;
    }
    from = from || 0;
    if (from < 0) {
      from += this.length;
    }
    var ret = new Yallist();
    if (to < from || to < 0) {
      return ret
    }
    if (from < 0) {
      from = 0;
    }
    if (to > this.length) {
      to = this.length;
    }
    for (var i = this.length, walker = this.tail; walker !== null && i > to; i--) {
      walker = walker.prev;
    }
    for (; walker !== null && i > from; i--, walker = walker.prev) {
      ret.push(walker.value);
    }
    return ret
  };

  Yallist.prototype.reverse = function () {
    var head = this.head;
    var tail = this.tail;
    for (var walker = head; walker !== null; walker = walker.prev) {
      var p = walker.prev;
      walker.prev = walker.next;
      walker.next = p;
    }
    this.head = tail;
    this.tail = head;
    return this
  };

  function push (self, item) {
    self.tail = new Node(item, self.tail, null, self);
    if (!self.head) {
      self.head = self.tail;
    }
    self.length++;
  }

  function unshift (self, item) {
    self.head = new Node(item, null, self.head, self);
    if (!self.tail) {
      self.tail = self.head;
    }
    self.length++;
  }

  function Node (value, prev, next, list) {
    if (!(this instanceof Node)) {
      return new Node(value, prev, next, list)
    }

    this.list = list;
    this.value = value;

    if (prev) {
      prev.next = this;
      this.prev = prev;
    } else {
      this.prev = null;
    }

    if (next) {
      next.prev = this;
      this.next = next;
    } else {
      this.next = null;
    }
  }

  try {
    // add if support for Symbol.iterator is present
    iterator(Yallist);
  } catch (er) {}

  // A linked list to keep track of recently-used-ness


  const MAX = Symbol('max');
  const LENGTH = Symbol('length');
  const LENGTH_CALCULATOR = Symbol('lengthCalculator');
  const ALLOW_STALE = Symbol('allowStale');
  const MAX_AGE = Symbol('maxAge');
  const DISPOSE = Symbol('dispose');
  const NO_DISPOSE_ON_SET = Symbol('noDisposeOnSet');
  const LRU_LIST = Symbol('lruList');
  const CACHE = Symbol('cache');
  const UPDATE_AGE_ON_GET = Symbol('updateAgeOnGet');

  const naiveLength = () => 1;

  // lruList is a yallist where the head is the youngest
  // item, and the tail is the oldest.  the list contains the Hit
  // objects as the entries.
  // Each Hit object has a reference to its Yallist.Node.  This
  // never changes.
  //
  // cache is a Map (or PseudoMap) that matches the keys to
  // the Yallist.Node object.
  class LRUCache {
    constructor (options) {
      if (typeof options === 'number')
        options = { max: options };

      if (!options)
        options = {};

      if (options.max && (typeof options.max !== 'number' || options.max < 0))
        throw new TypeError('max must be a non-negative number')
      // Kind of weird to have a default max of Infinity, but oh well.
      const max = this[MAX] = options.max || Infinity;

      const lc = options.length || naiveLength;
      this[LENGTH_CALCULATOR] = (typeof lc !== 'function') ? naiveLength : lc;
      this[ALLOW_STALE] = options.stale || false;
      if (options.maxAge && typeof options.maxAge !== 'number')
        throw new TypeError('maxAge must be a number')
      this[MAX_AGE] = options.maxAge || 0;
      this[DISPOSE] = options.dispose;
      this[NO_DISPOSE_ON_SET] = options.noDisposeOnSet || false;
      this[UPDATE_AGE_ON_GET] = options.updateAgeOnGet || false;
      this.reset();
    }

    // resize the cache when the max changes.
    set max (mL) {
      if (typeof mL !== 'number' || mL < 0)
        throw new TypeError('max must be a non-negative number')

      this[MAX] = mL || Infinity;
      trim(this);
    }
    get max () {
      return this[MAX]
    }

    set allowStale (allowStale) {
      this[ALLOW_STALE] = !!allowStale;
    }
    get allowStale () {
      return this[ALLOW_STALE]
    }

    set maxAge (mA) {
      if (typeof mA !== 'number')
        throw new TypeError('maxAge must be a non-negative number')

      this[MAX_AGE] = mA;
      trim(this);
    }
    get maxAge () {
      return this[MAX_AGE]
    }

    // resize the cache when the lengthCalculator changes.
    set lengthCalculator (lC) {
      if (typeof lC !== 'function')
        lC = naiveLength;

      if (lC !== this[LENGTH_CALCULATOR]) {
        this[LENGTH_CALCULATOR] = lC;
        this[LENGTH] = 0;
        this[LRU_LIST].forEach(hit => {
          hit.length = this[LENGTH_CALCULATOR](hit.value, hit.key);
          this[LENGTH] += hit.length;
        });
      }
      trim(this);
    }
    get lengthCalculator () { return this[LENGTH_CALCULATOR] }

    get length () { return this[LENGTH] }
    get itemCount () { return this[LRU_LIST].length }

    rforEach (fn, thisp) {
      thisp = thisp || this;
      for (let walker = this[LRU_LIST].tail; walker !== null;) {
        const prev = walker.prev;
        forEachStep(this, fn, walker, thisp);
        walker = prev;
      }
    }

    forEach (fn, thisp) {
      thisp = thisp || this;
      for (let walker = this[LRU_LIST].head; walker !== null;) {
        const next = walker.next;
        forEachStep(this, fn, walker, thisp);
        walker = next;
      }
    }

    keys () {
      return this[LRU_LIST].toArray().map(k => k.key)
    }

    values () {
      return this[LRU_LIST].toArray().map(k => k.value)
    }

    reset () {
      if (this[DISPOSE] &&
          this[LRU_LIST] &&
          this[LRU_LIST].length) {
        this[LRU_LIST].forEach(hit => this[DISPOSE](hit.key, hit.value));
      }

      this[CACHE] = new Map(); // hash of items by key
      this[LRU_LIST] = new yallist(); // list of items in order of use recency
      this[LENGTH] = 0; // length of items in the list
    }

    dump () {
      return this[LRU_LIST].map(hit =>
        isStale(this, hit) ? false : {
          k: hit.key,
          v: hit.value,
          e: hit.now + (hit.maxAge || 0)
        }).toArray().filter(h => h)
    }

    dumpLru () {
      return this[LRU_LIST]
    }

    set (key, value, maxAge) {
      maxAge = maxAge || this[MAX_AGE];

      if (maxAge && typeof maxAge !== 'number')
        throw new TypeError('maxAge must be a number')

      const now = maxAge ? Date.now() : 0;
      const len = this[LENGTH_CALCULATOR](value, key);

      if (this[CACHE].has(key)) {
        if (len > this[MAX]) {
          del(this, this[CACHE].get(key));
          return false
        }

        const node = this[CACHE].get(key);
        const item = node.value;

        // dispose of the old one before overwriting
        // split out into 2 ifs for better coverage tracking
        if (this[DISPOSE]) {
          if (!this[NO_DISPOSE_ON_SET])
            this[DISPOSE](key, item.value);
        }

        item.now = now;
        item.maxAge = maxAge;
        item.value = value;
        this[LENGTH] += len - item.length;
        item.length = len;
        this.get(key);
        trim(this);
        return true
      }

      const hit = new Entry(key, value, len, now, maxAge);

      // oversized objects fall out of cache automatically.
      if (hit.length > this[MAX]) {
        if (this[DISPOSE])
          this[DISPOSE](key, value);

        return false
      }

      this[LENGTH] += hit.length;
      this[LRU_LIST].unshift(hit);
      this[CACHE].set(key, this[LRU_LIST].head);
      trim(this);
      return true
    }

    has (key) {
      if (!this[CACHE].has(key)) return false
      const hit = this[CACHE].get(key).value;
      return !isStale(this, hit)
    }

    get (key) {
      return get(this, key, true)
    }

    peek (key) {
      return get(this, key, false)
    }

    pop () {
      const node = this[LRU_LIST].tail;
      if (!node)
        return null

      del(this, node);
      return node.value
    }

    del (key) {
      del(this, this[CACHE].get(key));
    }

    load (arr) {
      // reset the cache
      this.reset();

      const now = Date.now();
      // A previous serialized cache has the most recent items first
      for (let l = arr.length - 1; l >= 0; l--) {
        const hit = arr[l];
        const expiresAt = hit.e || 0;
        if (expiresAt === 0)
          // the item was created without expiration in a non aged cache
          this.set(hit.k, hit.v);
        else {
          const maxAge = expiresAt - now;
          // dont add already expired items
          if (maxAge > 0) {
            this.set(hit.k, hit.v, maxAge);
          }
        }
      }
    }

    prune () {
      this[CACHE].forEach((value, key) => get(this, key, false));
    }
  }

  const get = (self, key, doUse) => {
    const node = self[CACHE].get(key);
    if (node) {
      const hit = node.value;
      if (isStale(self, hit)) {
        del(self, node);
        if (!self[ALLOW_STALE])
          return undefined
      } else {
        if (doUse) {
          if (self[UPDATE_AGE_ON_GET])
            node.value.now = Date.now();
          self[LRU_LIST].unshiftNode(node);
        }
      }
      return hit.value
    }
  };

  const isStale = (self, hit) => {
    if (!hit || (!hit.maxAge && !self[MAX_AGE]))
      return false

    const diff = Date.now() - hit.now;
    return hit.maxAge ? diff > hit.maxAge
      : self[MAX_AGE] && (diff > self[MAX_AGE])
  };

  const trim = self => {
    if (self[LENGTH] > self[MAX]) {
      for (let walker = self[LRU_LIST].tail;
        self[LENGTH] > self[MAX] && walker !== null;) {
        // We know that we're about to delete this one, and also
        // what the next least recently used key will be, so just
        // go ahead and set it now.
        const prev = walker.prev;
        del(self, walker);
        walker = prev;
      }
    }
  };

  const del = (self, node) => {
    if (node) {
      const hit = node.value;
      if (self[DISPOSE])
        self[DISPOSE](hit.key, hit.value);

      self[LENGTH] -= hit.length;
      self[CACHE].delete(hit.key);
      self[LRU_LIST].removeNode(node);
    }
  };

  class Entry {
    constructor (key, value, length, now, maxAge) {
      this.key = key;
      this.value = value;
      this.length = length;
      this.now = now;
      this.maxAge = maxAge || 0;
    }
  }

  const forEachStep = (self, fn, node, thisp) => {
    let hit = node.value;
    if (isStale(self, hit)) {
      del(self, node);
      if (!self[ALLOW_STALE])
        hit = undefined;
    }
    if (hit)
      fn.call(thisp, hit.value, hit.key, self);
  };

  var lruCache = LRUCache;

  const cache = new lruCache(50);

  const GeoTIFFLayer = L$1.GridLayer.extend({
    initialize (tiff, renderFn, options) {
      L$1.GridLayer.prototype.initialize(options);

      this.tiff = tiff;
      this.renderFn = renderFn;
    },

    createTile (coords, done) {
      const tile = L$1.DomUtil.create('canvas', 'leaflet-tile');
      const size = this.getTileSize();
      tile.width = size.x;
      tile.height = size.y;

      this._renderTile(coords, tile)
      .then(() => done(null, tile))
      .catch(err => done(err));

      return tile
    },

    render () {
      const tileKeys = Object.keys(this._tiles);
      const promises = [];
      for (let i = 0; i < tileKeys.length; i++) {
        const key = tileKeys[i];
        const tile = this._tiles[key];
        if (tile.current) {
          const coords = this._keyToTileCoords(key);
          promises.push(this._renderTile(coords, tile.el));
        }
      }

      return Promise.all(promises)
    },

    _renderTile (coords, tile) {
      const key = this._tileCoordsToKey(coords);
      const nwSe = this._tileCoordsToNwSe(coords);
      const size = this.getTileSize();

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
        }));
        cache.set(key, data);

        return data
      });

      return this.renderFn(tile, dataFn)
    }
  });

  let nextPipelineId = 1;

  class Pipeline {
    constructor (steps, options) {
      this.id = nextPipelineId++;
      this.steps = steps;
      this.bands = options.bands;
      if (options.bits) {
        this.bits = options.bits;
        this.luminanceScale = 1 / Math.pow(2, bits) - 1;
      } else if (options.dataType) {
        this.dataType = options.dataType;
        this.luminanceScale = 1;
      }
    }
  }

  class BandsToChannels {
    static name () { return 'BandsToChannels' }

    constructor (mapping) {
      this.mapping = mapping;
    }
  }

  class LinearContrast {
    static name () { return 'LinearContrast' }

    constructor (low, high) {
      this.low = low;
      this.high = high;
    }
  }

  const defaultOptions = {
    width: 256,
    height: 256
  };

  class Renderer {
    constructor (options) {
      this.options = { ...defaultOptions, options };
    }
  }

  const colormaps = {
    Accent: 70,
    Blues: 69,
    BrBG: 68,
    BuGn: 67,
    BuPu: 66,
    CMRmap: 65,
    Dark2: 64,
    GnBu: 63,
    Greens: 62,
    Greys: 61,
    OrRd: 60,
    Oranges: 59,
    PRGn: 58,
    Paired: 57,
    Pastel1: 56,
    Pastel2: 55,
    PiYG: 54,
    PuBuGn: 53,
    PuBu: 52,
    PuOr: 51,
    PuRd: 50,
    Purples: 49,
    RdBu: 48,
    RdGy: 47,
    RdPu: 46,
    RdYlBu: 45,
    RdYlGn: 44,
    Reds: 43,
    Set1: 42,
    Set2: 41,
    Set3: 40,
    Spectral: 39,
    YlGnBu: 38,
    YlGn: 37,
    YlOrBr: 36,
    YlOrRd: 35,
    afmhot: 34,
    autumn: 33,
    binary: 32,
    bone: 31,
    brg: 30,
    bwr: 29,
    cool: 28,
    coolwarm: 27,
    copper: 26,
    cubehelix: 25,
    flag: 24,
    gist_earth: 23,
    gist_gray: 22,
    gist_heat: 21,
    gist_ncar: 20,
    gistainbow: 19,
    gist_stern: 18,
    gist_yarg: 17,
    gnuplot2: 16,
    gnuplot: 15,
    gray: 14,
    hot: 13,
    hsv: 12,
    jet: 11,
    ocean: 10,
    pink: 9,
    prism: 8,
    rainbow: 7,
    seismic: 6,
    spectral: 5,
    spring: 4,
    summer: 3,
    terrain: 2,
    winter: 1
  };

  const colorMapsTextureImage = "data:image/png;base64,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";

  class WebGlStep {
    constructor (prefix, step) {
      this.prefix = prefix;
      this.step = step;
    }

    getUniforms () {
      return []
    }

    bindUniforms () {
      return []
    }

    getTextures () {
      return []
    }

    async bindTexture (textureDef, gl) {}

    main (pipeline) {
      return ''
    }

    mapChannel () {
      return ''
    }
  }

  class BandsToChannels$1 extends WebGlStep {
    main (pipeline) {
      return Object.keys(this.step.mapping)
        .map(b => `gl_FragColor.${b} = texture2D(u_textureBand_${this.step.mapping[b]}, v_texCoord)[0] * ${pipeline.luminanceScale.toFixed(1)};`)
        .join('\n')
    }
  }

  class Index extends WebGlStep {
    main () {
      const bandVariable = b => `${this.prefix}${b}`;

      const regex = RegExp('\\$(\\w+)', 'g');
      let bands = [];
      let match;

      while ((match = regex.exec(this.step.formula)) !== null) {
        bands.push(match[1]);
      }

      const vName = `${this.prefix}index`;

      return `
      ${bands.map(m => `float ${bandVariable(m)} = texture2D(u_textureBand_${m}, v_texCoord)[0];`).join('\n')}
      float ${vName} = ${this.step.formula.replace(regex, (str, band) => bandVariable(band))};
      gl_FragColor = vec4(${vName}, ${vName}, ${vName}, ${vName});
    `
    }
  }

  class LinearContrast$1 extends WebGlStep {
    getUniforms() {
      return [
        { name: `u_${this.prefix}low`, type: 'vec4' },
        { name: `u_${this.prefix}high`, type: 'vec4' }
      ]
    }

    bindUniforms(gl, program) {
      const { low, high } = this.step;

      gl.uniform4f(
        gl.getUniformLocation(program, `u_${this.prefix}low`),
        low, low, low, low
      );
      gl.uniform4f(
        gl.getUniformLocation(program, `u_${this.prefix}high`),
        high, high, high, high
      );
    }

    main () {
      return `gl_FragColor = smoothstep(u_${this.prefix}low, u_${this.prefix}high, gl_FragColor);`
    }
  }

  class ColorMap extends WebGlStep {
    getUniforms () {
      return [
        { name: `u_${this.prefix}texCoordY`, type: 'float' }
      ]
    }

    bindUniforms (gl, program) {
      gl.uniform1f(
        gl.getUniformLocation(program, `u_${this.prefix}texCoordY`),
        (colormaps[this.step.type]) / 70
      );
    }

    getTextures () {
      return [
        { name: `u_${this.prefix}colormap_texture`, init: this.bindTexture.bind(this) }
      ]
    }

    bindTexture (gl) {
      return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
          const texture = this.texture = gl.createTexture();
          gl.bindTexture(gl.TEXTURE_2D, texture);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
          gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
          
          gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img);
          resolve(texture);
        };
        img.onerror = reject;

        img.src = colorMapsTextureImage;
      })
    }

    main () {
      return `gl_FragColor = texture2D(u_${this.prefix}colormap_texture, vec2(gl_FragColor.r, u_${this.prefix}texCoordY));`
    }
  }

  var stepImplementations = /*#__PURE__*/Object.freeze({
    BandsToChannels: BandsToChannels$1,
    Index: Index,
    LinearContrast: LinearContrast$1,
    ColorMap: ColorMap
  });

  class WebGlPipeline {
    constructor (gl, pipeline) {
      this.pipeline = pipeline;
      const steps = this.steps = pipeline.steps.map((s, i) => {
        const typeName = s.constructor.name();
        const clss = stepImplementations[typeName];
        return new clss(`${typeName}_${i}_`, s)
      });

      this.textureDefs = Object.keys(pipeline.bands)
      .map(b => ({
        name: `u_textureBand_${b}`,
        rasterBand: pipeline.bands[b]
      }))
      .concat(...steps.map(s => s.getTextures()));
      this.rasterTextures = [];
      Object.keys(pipeline.bands).forEach((b, i) => {
        const texture = gl.createTexture();
        gl.activeTexture(gl.TEXTURE0 + i);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        // Set the parameters so we can render any size image.
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

        this.rasterTextures[pipeline.bands[b]] = texture;
      });

      this.createProgram(gl);
    }

    bindUniforms (gl, program) {
      gl.uniform1f(gl.getUniformLocation(program, 'u_flipY'), -1);
      for (let i = 0; i < this.steps.length; i++) {
        this.steps[i].bindUniforms(gl, program);
      }
    }

    async bindTextures(gl) {
      const { program } = this;
      for (let i = 0; i < this.textureDefs.length; i++) {
        const textureDef = this.textureDefs[i];
        if (textureDef.rasterBand == null) {
          gl.activeTexture(gl.TEXTURE0 + i);
          textureDef.texture = await textureDef.init(gl, program);
        }
      }
    }

    bindRasterTextures (gl, program, rasters) {
      for (let i = 0; i < this.textureDefs.length; i++) {
        const textureDef = this.textureDefs[i];
        gl.uniform1i(gl.getUniformLocation(program, textureDef.name), i);
        gl.activeTexture(gl.TEXTURE0 + i);
        if (textureDef.rasterBand != null) {
          const rasterBand = rasters[textureDef.rasterBand];
          gl.texImage2D(
            gl.TEXTURE_2D,
            0,
            gl.LUMINANCE,
            rasterBand.width,
            rasterBand.height,
            0,
            gl.LUMINANCE,
            glType(gl, rasterBand.data),
            rasterBand.data
          );
        } else {
          gl.bindTexture(gl.TEXTURE_2D, textureDef.texture);
        }
      }
    }

    createProgram (gl) {
      const addLines = source => source
        .split('\n')
        .map((line, i) => `${(i + 1).toString().padStart(3)}\t${line}`)
        .join('\n');

      this.vertexShaderSource = `
      attribute vec2 a_position;
      attribute vec2 a_texCoord;
      uniform mat3 u_matrix;
      uniform vec2 u_resolution;
      uniform float u_flipY;
      varying vec2 v_texCoord;
      void main() {
        // apply transformation matrix
        vec2 position = (u_matrix * vec3(a_position, 1)).xy;
        // convert the rectangle from pixels to 0.0 to 1.0
        vec2 zeroToOne = position / u_resolution;
        // convert from 0->1 to 0->2
        vec2 zeroToTwo = zeroToOne * 2.0;
        // convert from 0->2 to -1->+1 (clipspace)
        vec2 clipSpace = zeroToTwo - 1.0;
        gl_Position = vec4(clipSpace * vec2(1, u_flipY), 0, 1);
        // pass the texCoord to the fragment shader
        // The GPU will interpolate this value between points.
        v_texCoord = a_texCoord;
      }
    `;

      this.fragmentShaderSource = `
    precision mediump float;

    ${this.textureDefs.map(t => `
    uniform sampler2D ${t.name};
    `).join('\n')}

    ${this.steps.map(s => 
      s.getUniforms().map(u => `    uniform ${u.type} ${u.name};`).join('\n')
    ).join('\n')}

    varying vec2 v_texCoord;

    // TODO: Steps' functions should go here

    void main() {
      ${this.steps.map(s => s.main(this.pipeline) +
        ['r', 'g', 'b', 'a']
          .map(c => [c, s.mapChannel(c)])
          .filter(c => c[1])
          .map(c => `gl_FragColor.${c[0]} = ${c[1]};`)
          .join('\n'))
        .join('\n')}
    }
    `;

      const vertexShader = gl.createShader(gl.VERTEX_SHADER);
      gl.shaderSource(vertexShader, this.vertexShaderSource);
      gl.compileShader(vertexShader);
      if (!gl.getShaderParameter(vertexShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(vertexShader) + addLines(this.vertexShaderSource));
      }

      const fragmentShader = gl.createShader(gl.FRAGMENT_SHADER);
      gl.shaderSource(fragmentShader, this.fragmentShaderSource);
      gl.compileShader(fragmentShader);
      if (!gl.getShaderParameter(fragmentShader, gl.COMPILE_STATUS)) {
        throw new Error(gl.getShaderInfoLog(fragmentShader) + addLines(this.fragmentShaderSource));
      }

      const program = gl.createProgram();
      gl.attachShader(program, vertexShader);
      gl.attachShader(program, fragmentShader);
      gl.linkProgram(program);

      this.program = program;
    }
  }

  const glType = (gl, arr) => {
    switch (arr.constructor.name) {
      case 'Uint8Array':
        return gl.UNSIGNED_BYTE
      case 'FloatArray':
        return gl.FLOAT
      default:
        throw new Error('Unhandled data type')
    }
  };

  const pipelineCache = {};

  class WebGlRenderer extends Renderer {
    static isSupported() {
      return create3DContext(document.createElement('canvas')) !== null;
    }

    constructor (options) {
      super(options);

      this.canvas = document.createElement('canvas');
      this.canvas.width = this.options.width;
      this.canvas.height = this.options.height;
      this.gl = create3dContext(this.canvas);
    }

    async getWebGlPipeline (pipeline) {
      const { gl } = this;
      let webGlPipeline = pipelineCache[pipeline.id];
      if (!webGlPipeline) {
        pipelineCache[pipeline.id] = webGlPipeline = new WebGlPipeline(gl, pipeline);
        await webGlPipeline.bindTextures(gl);
      }

      return webGlPipeline
    }

    async render (canvas, pipeline, source) {
      const { gl } = this;
      const webGlPipeline = await this.getWebGlPipeline(pipeline);
      const { width, height, maxValue } = this.options;
      const { program } = webGlPipeline;

      gl.clear(gl.DEPTH_BUFFER_BIT | gl.COLOR_BUFFER_BIT);
      gl.useProgram(program);
      gl.viewport(0, 0, width, height);

      const texCoordLocation = gl.getAttribLocation(program, 'a_texCoord');

      // provide texture coordinates for the rectangle.
      const texCoordBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, texCoordBuffer);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
        0.0, 0.0,
        1.0, 0.0,
        0.0, 1.0,
        0.0, 1.0,
        1.0, 0.0,
        1.0, 1.0]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(texCoordLocation);
      gl.vertexAttribPointer(texCoordLocation, 2, gl.FLOAT, false, 0, 0);

      gl.uniform1f(gl.getUniformLocation(program, 'u_maxValue'), maxValue);

      const positionLocation = gl.getAttribLocation(program, 'a_position');
      const resolutionLocation = gl.getUniformLocation(program, 'u_resolution');
      const matrixLocation = gl.getUniformLocation(program, 'u_matrix');

      gl.uniform2f(resolutionLocation, width, height);
      const matrix = [
        1, 0, 0,
        0, 1, 0,
        0, 0, 1,
      ];
      gl.uniformMatrix3fv(matrixLocation, false, matrix);

      const positionBuffer = gl.createBuffer();
      gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);
      gl.enableVertexAttribArray(positionLocation);
      gl.vertexAttribPointer(positionLocation, 2, gl.FLOAT, false, 0, 0);
      setRectangle(gl, 0, 0, width, height);

      webGlPipeline.bindRasterTextures(gl, program, await source.getRasters());
      webGlPipeline.bindUniforms(gl, program);

      gl.viewport(0, 0, width, height);
      gl.drawArrays(gl.TRIANGLES, 0, 6);

      const ctx = canvas.getContext('2d');
      ctx.drawImage(this.canvas, 0, 0);
    }
  }

  function create3dContext(canvas) {
    const names = ['webgl', 'experimental-webgl'];
    let context = null;
    for (let i = 0; i < names.length; ++i) {
      try {
        context = canvas.getContext(names[i]);
      } catch (e) { }  // eslint-disable-line
      if (context) {
        break;
      }
    }
    if (!context || !context.getExtension('OES_texture_float')) {
      return null;
    }

    return context;
  }

  function setRectangle(gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2]), gl.STATIC_DRAW);
  }

  const contrastStep = new LinearContrast(0.2, 0.8);
  const pipeline = new Pipeline([
    // new PipelineSteps.Index('$r+$g-$b'),
    // new PipelineSteps.LinearContrast(0.0, 1.0),
    // new PipelineSteps.ColorMap('RdYlGn'),
    // new PipelineSteps.BandsToChannels({ a: 'a' })
    new BandsToChannels({ r: 'r', g: 'g', b: 'b', a: 'a' }),
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
  });

  const renderer = new WebGlRenderer({
    width: 256,
    height: 256
  });

  const renderFn = (canvas, getRasters) => renderer.render(canvas, pipeline, { getRasters });

  GeoTIFF.fromUrl('data/ortho.tiff')
  .then(tiff => {
    const geotiffLayer = new GeoTIFFLayer(tiff, renderFn);
    L.map('map', {
      maxZoom: 26,
      layers: [
        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', { maxZoom: 26, maxNativeZoom: 18 }),
        geotiffLayer
      ]
    })
    .fitBounds([[57.3066538, 12.3338591], [57.3089762, 12.3387167]]);

    const update = () => {
      const t = +new Date();
      contrastStep.low = 0.2 + Math.sin(t / 731) * 0.2;
      contrastStep.high = 0.8 + Math.cos(t / 483) * 0.2;
      geotiffLayer.render()
      .then(() => setTimeout(update), 10);
    };

    update();
  });

}(L, GeoTIFF));
