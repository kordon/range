if(process.env['RANGE_COV']) var range = require('../lib-cov/range')
else var range = require('../')

var cursor = require('levelup-cursor'),
    bytewise = require('bytewise'),
    async = require('async'),
    chai = require('chai'),
    path = require('path'),
    sgen = require('sgen')

var root = path.join(path.dirname(__filename), 'dbs'),
    expect = chai.expect,
    assert = chai.assert

var forEach = function (len, callback) {
  for(var i = 0; i < len; i += 1) {
    callback(i)
  }
}

var instance = function () {
  return range(path.join(root, sgen.timestamp()))
}

var random = function () {
  return Math.ceil(Math.random() * 10000000)
};

suite('api')

test('constructor', function () {
  assert.ok(range)
  assert.ok(typeof range == 'function')
})

test('instance', function (callback) {
  var age = instance()
  assert.ok(age)
  age.close(callback)
})

test('put', function (callback) {
  var age = instance()
  assert.ok(age.put)
  assert.ok(typeof age.put == 'function')
  age.close(callback)
})

test('get', function (callback) {
  var age = instance()
  assert.ok(age.get)
  assert.ok(typeof age.get == 'function')
  age.close(callback)
})

test('all', function (callback) {
  var age = instance()
  assert.ok(age.all)
  assert.ok(typeof age.all == 'function')
  age.close(callback)
})

test('from', function (callback) {
  var age = instance()
  assert.ok(age.from)
  assert.ok(typeof age.from == 'function')
  age.close(callback)
})

test('between', function (callback) {
  var age = instance()
  assert.ok(age.between)
  assert.ok(typeof age.between == 'function')
  age.close(callback)
})

test('until', function (callback) {
  var age = instance()
  assert.ok(age.until)
  assert.ok(typeof age.until == 'function')
  age.close(callback)
})

test('engine', function (callback) {
  var age = instance()
  assert.ok(age.engine)
  assert.ok(typeof age.engine == 'object')
  age.close(callback)
})

suite('put')

test('saved', function (callback) {
  var age = instance()
  var doc = sgen.random()

  age.put(12, doc, function () {
    age.engine.get(bytewise.encode(12), function (e, value) {
      assert.equal(e,  null)
      assert.ok(value)
      assert(value instanceof Array)
      assert(value.length === 1)
      assert(value.pop() === doc)
      age.close(callback)
    })
  })
})

suite('get')

test('retrieved', function (callback) {
  var age = instance()

  age.put(12, sgen.random(), function () {
    
    cursor(age.get(12)).all(function (e, keys, values, data) {
      assert.equal(e,  null)
      assert(Object.keys(data).length == 1)
      assert(data[keys[0]] === values[0])
      assert(keys instanceof Array)
      assert(values.length === 1)
      assert(keys.length === 1)
      assert(keys[0] === 12)
      age.close(callback)
    })
  })
})

suite('numbers')

test('order', function (callback) {
  var age = instance()
  var sequence = []
  
  forEach(100, function (i) {
    sequence[i] = {i: i, value: random()}
  })
  
  async.forEachSeries(sequence, function (i, callback) {
    age.put(i.value, i.i, callback)
  }, function (e) {
    assert.equal(e,  null)
    var positions = [random(), random(), random()].sort()
    var before = 0
    
    cursor(age.all()).each(function (key, value, data) {
      assert(key >= before)
      before = key
    }, function (e) {
      assert.equal(e,  null)
      age.close(callback)
    })
  })
})

suite('strings')

test('order', function (callback) {
  var dataset = require('./documents.json')
  var countries = instance()
  var keys = []
  
  async.forEachSeries(dataset, function (document, callback) {
    async.forEachSeries(document.countries, function (country, callback) {
      countries.put(country, document.document, callback)
    }, callback)
  }, function (e) {
    assert.equal(e,  null)
    cursor(countries.all()).each(function (key, value, data) {
      keys.push(key)
    }, function (e) {
      assert.equal(e,  null)
      keys.forEach(function (value, i) {
        if(i === 0) return
        assert(value >= keys[i-1])
      })
      
      countries.close(callback)
    })
  })
})

suite('age')

var users = require('./users.json')
var age = instance()

test('all', function (callback) {
  async.forEachSeries(users, function (user, callback) {
    age.put(user.age, user.id, callback)
  }, function () {
    cursor(age.all()).all(function (e, keys, values, data) {
      assert.equal(e,  null)
      expect(Object.keys(data)).to.have.length(7)
      expect(data).to.have.keys('7', '13', '18', '23', '42', '54', '60')
      expect(keys).to.eql([7, 13, 18, 23, 42, 54, 60])
      expect(values).to.have.length(7)
      expect(keys).to.have.length(7)
      expect(data[7]).to.eql([1, 10])
      expect(data[60]).to.eql([4, 6])
      expect(data[18]).to.eql([3, 7])
      expect(data[13]).to.eql([8])
      expect(data[23]).to.eql([5])
      expect(data[42]).to.eql([9])
      expect(data[54]).to.eql([2])
      callback()
    })
  })
})

test('from', function (callback) {
  cursor(age.from(54)).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(2)
    expect(data).to.have.keys('54', '60')
    expect(data[60]).to.eql([4, 6])
    expect(data[54]).to.eql([2])
    callback()
  })
})

test('between', function (callback) {
  cursor(age.between(13, 23)).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(3)
    expect(data).to.have.keys('13', '18', '23')
    expect(data[18]).to.eql([3, 7])
    expect(data[13]).to.eql([8])
    expect(data[23]).to.eql([5])
    callback()
  })
})

test('until', function (callback) {
  cursor(age.until(18)).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(3)
    expect(data).to.have.keys('7', '13', '18')
    expect(data[7]).to.eql([1, 10])
    expect(data[18]).to.eql([3, 7])
    expect(data[13]).to.eql([8])
    callback()
  })
})

test('del', function (callback) {
  age.del(18, 3, function (e) {
    assert.equal(e,  null)
    age.get(18).pipe(cursor.all(function (keys, values, data) {
      expect(data[18]).to.not.include(3)
      expect(values).to.not.include(3)
      age.close(callback)
    }))
  })
})

suite('countries')

var documents = require('./documents.json')
var country = instance()

test('all', function (callback) {
  async.forEachSeries(documents, function (document, callback) {
    async.forEachSeries(document.countries, function (c, callback) {
      country.put(c, document.document, callback)
    }, callback)
  }, function (e) {
    assert.equal(e,  null)
    
    cursor(country.all()).all(function (e, keys, values, data) {
      assert.equal(e,  null)
      expect(Object.keys(data)).to.have.length(5)
      expect(data).to.have.keys('Algeria', 'Australia', 'Canada', 'Portugal', 'Togo')
      expect(data['Canada']).to.eql(['a', 'b', 'c', 'd', 'e'])
      expect(data['Togo']).to.eql(['b', 'c', 'd', 'e', 'f'])
      expect(data['Portugal']).to.eql(['a', 'b', 'c'])
      expect(data['Algeria']).to.eql(['c', 'd'])
      expect(data['Australia']).to.eql(['a'])
      callback()
    })
  })
})

test('from', function (callback) {
  cursor(country.from('P')).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(2)
    expect(data).to.have.keys('Portugal', 'Togo')
    expect(data['Togo']).to.eql(['b', 'c', 'd', 'e', 'f'])
    expect(data['Portugal']).to.eql(['a', 'b', 'c'])
    callback()
  })
})

test('between', function (callback) {
  cursor(country.between('A', 'C')).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(2)
    expect(data).to.have.keys('Algeria', 'Australia')
    expect(data['Algeria']).to.eql(['c', 'd'])
    expect(data['Australia']).to.eql(['a'])
    callback()
  })
})

test('until', function (callback) {
  cursor(country.until('P')).all(function (e, keys, values, data) {
    assert.equal(e,  null)
    expect(Object.keys(data)).to.have.length(3)
    expect(data).to.have.keys('Algeria', 'Australia', 'Canada')
    expect(data['Canada']).to.eql(['a', 'b', 'c', 'd', 'e'])
    expect(data['Algeria']).to.eql(['c', 'd'])
    expect(data['Australia']).to.eql(['a'])
    callback()
  })
})

test('del', function (callback) {
  async.forEach(['Algeria', 'Canada', 'Portugal', 'Togo'], function (c, callback) {
    country.del(c, 'c', callback)
  }, function (e) {
    assert.equal(e,  null)
    country.get('Portugal').pipe(cursor.all(function (keys, values, data) {
      expect(data['Portugal']).to.not.include('c')
      expect(values).to.not.include('c')
      country.close(callback)
    }))
  })
})