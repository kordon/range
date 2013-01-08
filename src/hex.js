var type = require('type-component')

var hex = module.exports

hex.to = function (number) {
  if(type(number) !== 'number') return number
  return (0xFFFFFFFF + number + 1).toString(16).toUpperCase()
}

hex.from = function (data) {
  if(data.value.keytype !== 'number') return data
  data.key = parseInt(data.key, 16) - (0xFFFFFFFF+1)
  return data
}