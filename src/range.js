var middleman = require('./middleman'),
    lodash = require('lodash'),
    levelup = require('levelup'),
    async = require('async'),
    path = require('path'),
    hex = require('./hex')
    
var without = lodash.without,
    unique = lodash.uniq

var put = function (task, callback) {
  this.engine.get(task.key, function (e, value) {
    if(e && e.name != 'NotFoundError') return callback(e)
  
    if(!value) value = {}
    if(!value.documents) value.documents = []
    value.documents.push(task.value)
    value.documents = unique(value.documents, true)
    value.keytype = task.keytype
  
    this.engine.put(task.key, value, callback)
  }.bind(this))
}

var range = function (engine) {
  this.queue = async.queue(put.bind(this), 1)
  this.engine = engine
}

range.prototype.put = function (value, key, callback) {
  this.queue.push({
    keytype: typeof value,
    key: hex.to(value),
    value: key
  }, callback)
}

range.prototype.get = function (index) {
  return middleman(this.engine, hex.to(index), hex.to(index))
}

range.prototype.all = function () {
  return middleman(this.engine, undefined, undefined)
}

range.prototype.from = function (start) {
  return middleman(this.engine, hex.to(start))
}

range.prototype.between = function (start, end) {
  return middleman(this.engine, hex.to(start), hex.to(end))
}

range.prototype.until = function (end) {
  return middleman(this.engine, undefined, hex.to(end))
}

range.prototype.del = function (value, key, callback) {
  var hexed = hex.to(value)
  
  this.engine.get(hexed, function (e, value) {
    if(e && e.name != 'NotFoundError') return callback(e)
    if(!value) return callback()
    if(!value.documents) return callback()
    
    value.documents = without(value.documents, key)
      
    this.engine.put(hexed, value, callback)
  }.bind(this))
}

range.prototype.close = function (callback) {
  this.engine.close(callback)
}



module.exports = function (location) {
  var db = levelup(path.normalize(location), {
    createIfMissing: true,
    valueEncoding: 'json',
    keyEncoding: 'utf8'
  })
  
  return new range(db)
}