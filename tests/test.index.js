const should = require('should');
const Cache  = require('../index');

describe('Cache LRU', () => {

  it('should return a cache object', () => {
    var lru = new Cache();
    should(lru).be.an.Object();
  });

  it('should define public fns', () => {
    var lru = new Cache();
    should(lru.set).be.a.Function();
    should(lru.get).be.a.Function();
    should(lru.clear).be.a.Function();
    // should(lru.delete).be.a.Function();
  });

  describe('set', () => {

    it('should add an element in the cache', () => {
      var lru = new Cache();
      lru.set('abc', 123);
      should(lru.entries()).eql([{
        key   : 'abc',
        value : 123
      }]);
    });

    it('should add an sort element in the cache', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should set and delete element if the size has been reached', () => {
      var lru = new Cache({
        size : 2
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);

      should(lru.get('a')).eql(undefined);
      should(lru.get('b')).eql(2);
      should(lru.get('c')).eql(3);

      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);

      lru.set('d', 4);

      should(lru.get('b')).eql(undefined);
      should(lru.get('d')).eql(4);

      lru.delete('c');

      should(lru.get('c')).eql(undefined);
      should(lru.get('c')).eql(undefined);
      should(lru.get('d')).eql(4);

      should(lru.entries()).eql([
        {
          key   : 'd',
          value : 4
        }
      ]);
    });

    it('should set and delete element if the size has been reached and call the function', done => {
      var lru = new Cache({
        size     : 2,
        onRemove : (key, value) => {
          should(key).eql('a');
          should(value).eql(1);
          done();
        }
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);

      should(lru.get('a')).eql(undefined);
    });

    it('should move to the top the updated key : first key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.set('a', 11);

      should(lru.entries()).eql([
        {
          key   : 'a',
          value : 11
        },
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);
    });

    it('should move to the top the updated key : in the list', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.set('b', 4);

      should(lru.entries()).eql([
        {
          key   : 'b',
          value : 4
        },
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should move to the top the updated key : last key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('a', 11);
      lru.set('c', 3);

      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 11
        },
        {
          key   : 'b',
          value : 2
        }
      ]);
    });

    it('should move to the top the updated key and remove', () => {
      var lru = new Cache({
        size : 2
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('a', 11);
      lru.set('c', 3);

      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 11
        }
      ]);
    });

    it('should move to the top the updated key and remove', () => {
      var lru = new Cache({
        size : 3
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('a', 11);
      lru.set('c', 3);
      lru.set('d', 4);

      should(lru.entries()).eql([
        {
          key   : 'd',
          value : 4
        },
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 11
        }
      ]);
    });

  });

  describe('get', () => {

    it('should get an item', () => {
      var lru = new Cache();
      lru.set('abc', 123);
      should(lru.get('abc')).eql(123);
    });

    it('should get an item an move it to the top : first key', () => {
      var lru = new Cache({
        size : 3
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.get('c')).eql(3);
      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should get an item an move it to the top : middle key', () => {
      var lru = new Cache({
        size : 3
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.get('b')).eql(2);
      should(lru.entries()).eql([
        {
          key   : 'b',
          value : 2
        },
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should get an item an move it to the top : last key', () => {
      var lru = new Cache({
        size : 3
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      should(lru.get('a')).eql(1);
      should(lru.entries()).eql([
        {
          key   : 'a',
          value : 1
        },
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);
    });


    it('should not get an item if the key is not in the cache', () => {
      var lru = new Cache();
      lru.set('abc', 123);
      should(lru.get('a')).eql(undefined);
    });
  });

  describe('has', () => {

    it('should not find a key not in the cache', () => {
      var lru = new Cache();
      should(lru.has('a')).eql(false);
    });

    it('should find a key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      should(lru.has('a')).eql(true);
    });

    it('should not find a deleted key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.delete('a');
      should(lru.has('a')).eql(false);
    });

    it('should not move to the top the key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      should(lru.has('a')).eql(true);
      should(lru.entries()).eql([
        { key : 'b', value : 2 },
        { key : 'a', value : 1 }
      ]);
    });

  });

  describe('delete', () => {

    it('should not delete an element not in the cache', () => {
      var lru = new Cache();
      lru.set('b', 2);
      lru.delete('a');
      should(lru.entries()).eql([{
        key   : 'b',
        value : 2
      }]);
    });

    it('should delete an element in the cache', () => {
      var lru = new Cache();
      lru.set('b', 2);
      lru.delete('b');
      should(lru.entries()).eql([]);
    });

    it('should delete an element in the cache : first key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);

      lru.delete('c');

      should(lru.entries()).eql([
        {
          key   : 'b',
          value : 2
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should delete an element in the cache : middle key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.delete('b');

      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'a',
          value : 1
        }
      ]);
    });

    it('should delete an element in the cache : last key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);

      lru.delete('a');

      should(lru.entries()).eql([
        {
          key   : 'c',
          value : 3
        },
        {
          key   : 'b',
          value : 2
        }
      ]);
    });

    it('should delete an element in the cache and call the function', done => {
      var lru = new Cache({
        onRemove : (key, value) => {
          should(key).eql('b');
          should(value).eql(2);
          done();
        }
      });
      lru.set('b', 2);
      lru.delete('b');
      should(lru.entries()).eql([]);
    });

    it('should delete an element in the cache and add new ones if limit has not been reached : last key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.delete('b');
      lru.set('c', 3);
      should(lru.entries()).eql([
        { key : 'c', value : 3 },
        { key : 'a', value : 1 }
      ]);
    });

    it('should delete an element in the cache and add new ones if limit has not been reached : middle key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.delete('b');
      lru.set('d', 4);
      should(lru.entries()).eql([
        { key : 'd', value : 4 },
        { key : 'c', value : 3 },
        { key : 'a', value : 1 }
      ]);
    });

    it('should delete an element in the cache and add new ones : middle key + new key', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.delete('b');
      lru.set('d', 4)
      lru.set('e', 5)
      should(lru.entries()).eql([
        { key : 'e', value : 5 },
        { key : 'd', value : 4 },
        { key : 'c', value : 3 },
        { key : 'a', value : 1 }
      ]);
    });

  });

  describe('clear', () => {

    it('should clear the cache', () => {
      var lru = new Cache();
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.clear();
      should(lru.entries()).eql([]);
    });

    it('should clear the cache and call the function', done => {
      var _nbCalls = 0;
      var lru      = new Cache({
        onRemove : (key, value) => {
          _nbCalls++;

          if (_nbCalls === 1) {
            should(key).eql('c');
            should(value).eql(3);
            return;
          }
          if (_nbCalls === 2) {
            should(key).eql('b');
            should(value).eql(2);
            return;
          }

          should(key).eql('a');
          should(value).eql(1);
          done();
        }
      });
      lru.set('a', 1);
      lru.set('b', 2);
      lru.set('c', 3);
      lru.clear();
      should(lru.entries()).eql([]);
    });

  });
});
