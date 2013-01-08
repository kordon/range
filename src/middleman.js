var through = require('through'),
    hex = require('./hex')

module.exports = function (engine, start, end) {
  return engine.readStream({
    start: start,
    end: end
  }).pipe(through(function (data) {
    data = hex.from(data)
    data.value = data.value.documents
    this.emit('data', data)
  }))
}