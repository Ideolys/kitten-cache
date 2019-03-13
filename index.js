const MAX_8BIT_INTEGER  = Math.pow(2, 8) - 1;
const MAX_16BIT_INTEGER = Math.pow(2, 16) - 1;
const MAX_32BIT_INTEGER = Math.pow(2, 32) - 1;

function getArray (size) {
  var maxIndex = size - 1;

  if (maxIndex <= MAX_8BIT_INTEGER) {
    return Int8Array;
  }
  if (maxIndex <= MAX_16BIT_INTEGER) {
    return Int16Array;
  }
  if (maxIndex <= MAX_32BIT_INTEGER) {
    return Int32Array;
  }
  return Float64Array;
}


/**
 * Cache instance
 * @param {Object} options {
 *   onRemove : Function,
 *   size     : Int // size of the cache
 * }
 */
function Cache (options = {}) {
  this.size     = options.size     || 50;
  this.callback = options.onRemove || null;

  var _array = getArray(this.size);

  this.items  = {};
  this.keys   = new Array(this.size);
  this.values = new Array(this.size);
  this.nexts  = new _array(this.size);
  this.prevs  = new _array(this.size);

  this.availablePointers = new Array();

  this.head   = 0;
  this.tail   = 0;
  this.length = 0;
}


Cache.prototype._moveToTheTop = function (pointer) {
  var _next = this.nexts[pointer];
  var _prev = this.prevs[pointer];

  if (this.head === pointer) {
    return;
  }

  if (pointer === this.tail) {
    this.tail = _prev;
  }

  this.nexts[pointer] = this.head;
  this.prevs[pointer] = pointer;

  this.nexts[_prev] = _next;
  this.prevs[_next] = _prev;

  this.head = pointer;
}

/**
 * Delete a key
 * @param {Int} pointer
 * @param {Boolean} isPointer
 */
Cache.prototype.delete = function (pointer, isPointer = false) {
  if (!isPointer) {
    pointer = this.items[pointer];
  }

  if (typeof pointer === 'undefined') {
    return false;
  }

  var _next     = this.nexts[pointer];
  var _prev     = this.prevs[pointer];
  this.nexts[_prev] = _next;

  if (pointer === this.tail) {
    this.tail = _prev;
  }
  else {
    this.prevs[_next] = _prev;

    if (pointer === this.head) {
      this.head = _next;
    }
  }

  delete this.items[this.keys[pointer]];
  this.length--;
  this.availablePointers.push(pointer);

  if (!this.callback) {
    return true;
  }

  this.callback(this.keys[pointer], this.values[pointer]);
}

/**
 * Set a value in the cache
 * @param {String} key
 * @param {*} value
 */
Cache.prototype.set = function (key, value) {
  var _pointer = this.items[key];

  if (typeof _pointer !== 'undefined') {
    this._moveToTheTop(_pointer);
    this.values[_pointer] = value;
    return;
  }

  if (this.length < this.size) {
    _pointer = this.length++;

    if(this.availablePointers.length) {
      _pointer = this.availablePointers.shift();
    }
  }
  else {
    _pointer = this.tail;
    this.delete(_pointer, true);
  }

  this.items[key]       = _pointer;
  this.values[_pointer] = value;
  this.keys[_pointer]   = key;

  this.nexts[_pointer]  = this.head;
  this.prevs[this.head] = _pointer;
  this.head             = _pointer;
}

Cache.prototype.entries = function () {
  var _entries = [];
  var _pointer = this.head;
  var _lastPointer;

  if (!this.length) {
    return _entries;
  }

  while (_pointer >= 0) {
    _entries.push({
      key   : this.keys[_pointer],
      value : this.values[_pointer]
    });

    _lastPointer = _pointer;
    _pointer     = this.nexts[_pointer];

    if (_lastPointer === this.tail) {
      break;
    }
  }

  return _entries;
};

/**
 * Get a value in the cache
 * @param {String} key
 * @returns {*}
 */
Cache.prototype.get = function (key) {
  var _pointer = this.items[key];
  if (_pointer === undefined) {
    return;
  }

  this._moveToTheTop(_pointer);

  return this.values[_pointer];
};

Cache.prototype.has = function (key) {
  return this.items[key] !== undefined;
};

/**
 * Clear cache
 */
Cache.prototype.clear = function () {
  if (this.callback) {
    var _pointer = this.head;
    var _lastPointer;

    while (_pointer >= 0) {
      this.callback(this.keys[_pointer], this.values[_pointer]);

      _lastPointer = _pointer;
      _pointer     = this.nexts[_pointer];

      if (_lastPointer === this.tail) {
        break;
      }
    }
  }

  var _array = getArray(this.size);

  this.items  = {};
  this.keys   = new Array(this.size);
  this.values = new Array(this.size);
  this.nexts  = new _array(this.size);
  this.prevs  = new _array(this.size);
  this.head   = 0;
  this.tail   = 0;
  this.length = 0;
}

module.exports = Cache;
