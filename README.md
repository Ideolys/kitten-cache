# Kitten-cache

Highly performant LRU cache.

## Install

1. Install
```bash
  npm i kitten-cache
```
2. Require the dependence
```js
  const Cache = require('kitten-cache');
```
3. Declare new instance
```js
  let cache = new Cache();
```

## API

### Instance

```js
  new Cache(options)

  /*
    options : {
      size     : default 50,
      onRemove : function to call when a key/value is removed from the cache
    }
  */
```

### Cache.set(key, value)

```js
  let cache = new Cache();

  cache.set('a', 1);
```

### Cache.get(key)

```js
  let cache = new Cache();

  cache.set('a', 1);
  cache.get('a'); // -> 1
```

### Cache.has(key)

```js
  let cache = new Cache();

  cache.set('a', 1);
  cache.has('a'); // -> true
  cache.has('b'); // -> false
```

### Cache.delete(key)

```js
  let cache = new Cache();

  cache.set('a', 1);

  cache.delete('a'); // -> true
  cache.delete('b'); // -> false
```
