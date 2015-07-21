var Cache = require('../cache.js');

var cache = new Cache(20);

for(var i = 0; i < 3; ++i) {
  try {
    console.log('From cache:', cache.get('key'));
  } catch(e) {
    console.log(e);
    cache.set('key', 'kkkkkk');
  }
}

