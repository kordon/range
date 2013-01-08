var hex = require('../src/hex'),
    async = require('async'),
    chai = require('chai'),
    range = require('../'),
    path = require('path'),
    sgen = require('sgen')

var expect = chai.expect
var assert = chai.assert

var root = path.join(path.dirname(__filename), 'dbs')

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
  
  age.put(12, sgen.random(), function () {
    age.engine.get(hex.to(12), function (e, value, key) {
      assert.equal(e,  null)
      assert.ok(value)
      assert(value.documents instanceof Array)
      assert(value.documents.length == 1)
      assert(key == '10000000C')
      assert(hex.from({value: value, key: key}).key == 12)
      age.close(callback)
    })
  })
})

suite('get')

test('retrieved', function (callback) {
  var age = instance()

  age.put(12, sgen.random(), function () {
    age.get(12).on('data', function (data) {
      assert(data.key == 12)
      assert(data.value instanceof Array)
      assert(data.value.length == 1)
    }).on('end', function () {
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
    age.all()
    .on('data', function (data) {
      assert(data.key >= before)
      before = data.key
    })
    .on('error', function (e) {
      assert.equal(e,  null)
    })
    .on('end', function () {
      age.close(callback)
    })
  })
})

suite('strings')

test('order', function (callback) {
  var countries = instance()
  var dataset = require('./documents.json')
  var keys = []
  
  async.forEachSeries(dataset, function (document, callback) {
    async.forEachSeries(document.countries, function (country, callback) {
      countries.put(country, document.document, callback)
    }, callback)
  }, function (e) {
    assert.equal(e,  null)
    countries.all()
    .on('data', function (data) {
      keys.push(data.key)
    })
    .on('error', function (e) {
      assert.equal(e,  null)
    })
    .on('end', function () {
      keys.forEach(function (value, i) {
        if(i == 0) return
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
  var ages = {}
  
  async.forEachSeries(users, function (user, callback) {
    age.put(user.age, user.id, callback)
  }, function () {
    age.all()
    .on('data', function (data) {
      ages[data.key] = data.value
    })
    .on('error', function (e) {
      assert.equal(e,  null)
    })
    .on('end', function () {
      expect(Object.keys(ages)).to.have.length(7)
      expect(ages).to.have.keys('7', '13', '18', '23', '42', '54', '60')
      expect(ages[7]).to.eql([1, 10])
      expect(ages[60]).to.eql([4, 6])
      expect(ages[18]).to.eql([3, 7])
      expect(ages[13]).to.eql([8])
      expect(ages[23]).to.eql([5])
      expect(ages[42]).to.eql([9])
      expect(ages[54]).to.eql([2])
      callback()
    })
  })
})

test('from', function (callback) {
  var ages = {}
  
  age.from(54)
  .on('data', function (data) {
    ages[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(ages)).to.have.length(2)
    expect(ages).to.have.keys('54', '60')
    expect(ages[60]).to.eql([4, 6])
    expect(ages[54]).to.eql([2])
    callback()
  })
})

test('between', function (callback) {
  var ages = {}
  
  age.between(13, 23)
  .on('data', function (data) {
    ages[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(ages)).to.have.length(3)
    expect(ages).to.have.keys('13', '18', '23')
    expect(ages[18]).to.eql([3, 7])
    expect(ages[13]).to.eql([8])
    expect(ages[23]).to.eql([5])
    callback()
  })
})

test('until', function (callback) {
  var ages = {}
  
  age.until(18)
  .on('data', function (data) {
    ages[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(ages)).to.have.length(3)
    expect(ages).to.have.keys('7', '13', '18')
    expect(ages[7]).to.eql([1, 10])
    expect(ages[18]).to.eql([3, 7])
    expect(ages[13]).to.eql([8])
    age.close(callback)
  })
})

suite('countries')

var documents = require('./documents.json')
var country = instance()

test('all', function (callback) {
  var countries = {}
  
  async.forEachSeries(documents, function (document, callback) {
    async.forEachSeries(document.countries, function (c, callback) {
      country.put(c, document.document, callback)
    }, callback)
  }, function (e) {
    assert.equal(e,  null)
    
    country.all()
    .on('data', function (data) {
      countries[data.key] = data.value
    })
    .on('error', function (e) {
      assert.equal(e,  null)
    })
    .on('end', function () {
      expect(Object.keys(countries)).to.have.length(5)
      expect(countries).to.have.keys('Algeria', 'Australia', 'Canada', 'Portugal', 'Togo')
      expect(countries['Canada']).to.eql(['a', 'b', 'c', 'd', 'e'])
      expect(countries['Togo']).to.eql(['b', 'c', 'd', 'e', 'f'])
      expect(countries['Portugal']).to.eql(['a', 'b', 'c'])
      expect(countries['Algeria']).to.eql(['c', 'd'])
      expect(countries['Australia']).to.eql(['a'])
      callback()
    })
  })
})

test('from', function (callback) {
  var countries = {}
  
  country.from('P')
  .on('data', function (data) {
    countries[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(countries)).to.have.length(2)
    expect(countries).to.have.keys('Portugal', 'Togo')
    expect(countries['Togo']).to.eql(['b', 'c', 'd', 'e', 'f'])
    expect(countries['Portugal']).to.eql(['a', 'b', 'c'])
    callback()
  })
})

test('between', function (callback) {
  var countries = {}
  
  country.between('A', 'C')
  .on('data', function (data) {
    countries[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(countries)).to.have.length(2)
    expect(countries).to.have.keys('Algeria', 'Australia')
    expect(countries['Algeria']).to.eql(['c', 'd'])
    expect(countries['Australia']).to.eql(['a'])
    callback()
  })
})

test('until', function (callback) {
  var countries = {}
  
  country.until('P')
  .on('data', function (data) {
    countries[data.key] = data.value
  })
  .on('error', function (e) {
    assert.equal(e,  null)
  })
  .on('end', function () {
    expect(Object.keys(countries)).to.have.length(3)
    expect(countries).to.have.keys('Algeria', 'Australia', 'Canada')
    expect(countries['Canada']).to.eql(['a', 'b', 'c', 'd', 'e'])
    expect(countries['Algeria']).to.eql(['c', 'd'])
    expect(countries['Australia']).to.eql(['a'])
    country.close(callback)
  })
})