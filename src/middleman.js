var through = require('through'),
    bytewise = require('bytewise')

module.exports = function (engine, start, end) {
  return engine.readStream({
    start: start,
    end: end
  }).pipe(through(function (data) {
    data.key = bytewise.decode(data.key)
    this.emit('data', data)
  }))
}