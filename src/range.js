var middleman = require('./middleman'),
    bytewise = require('bytewise'),
    lodash = require('lodash'),
    level = require('level'),
    async = require('async'),
    path = require('path')
    
var without = lodash.without,
    unique = lodash.uniq

var put = function (task, self, callback) {
  self.engine.get(task.key, function (e, value) {
    if(e && e.name !== 'NotFoundError') return callback(e)
    if(!value) value = []
    
    value.push(task.value)
    value = unique(value)
  
    self.engine.put(task.key, value, callback)
  })
}

var range = function (engine) {
  var self = this
  this.engine = engine
  this.queue = async.queue(function (task, callback) {
    put(task, self, callback)
  }, 1)
}

range.prototype.put = function (value, key, callback) {
  this.queue.push({
    key: bytewise.encode(value),
    value: key
  }, callback)
}

range.prototype.get = function (index) {
  return middleman(this.engine, bytewise.encode(index), bytewise.encode(index))
}

range.prototype.all = function () {
  return middleman(this.engine, undefined, undefined)
}

range.prototype.from = function (start) {
  return middleman(this.engine, bytewise.encode(start))
}

range.prototype.between = function (start, end) {
  return middleman(this.engine, bytewise.encode(start), bytewise.encode(end))
}

range.prototype.until = function (end) {
  return middleman(this.engine, undefined, bytewise.encode(end))
}

range.prototype.del = function (value, key, callback) {
  var encoded = bytewise.encode(value)
  var self = this
  
  this.engine.get(encoded, function (e, value) {
    if(e && e.name !== 'NotFoundError') return callback(e)
    if(!value) return callback()

    value = without(value, key)
      
    self.engine.put(encoded, value, callback)
  })
}

range.prototype.close = function (callback) {
  this.engine.close(callback)
}


module.exports = function (location) {
  var db = level(path.normalize(location), {
    createIfMissing: true,
    valueEncoding: 'json',
    keyEncoding: 'binary'
  })
  
  return new range(db)
}