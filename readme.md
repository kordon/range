# range

[level](https://github.com/level/level) based range index

[![NPM version](https://badge.fury.io/js/range.png)](http://badge.fury.io/js/range-index)
[![Build Status](https://secure.travis-ci.org/kordon/range.png)](http://travis-ci.org/kordon/range)
[![Dependency Status](https://gemnasium.com/kordon/range.png)](https://gemnasium.com/kordon/range)
[![Coverage Status](https://coveralls.io/repos/kordon/range/badge.png?branch=master)](https://coveralls.io/r/kordon/range?branch=master)

## install

```bash
npm install [--save/--save-dev] range-index
```
  
## examples

### data set

|  ID  |        NAME        | AGE | SEX |
| :--: |        :--:        | :-: | :-: |
|  `1` | Divina Ventimiglia |  7  |  F  |
|  `2` |   Nakisha Robuck   |  54 |  F  |
|  `3` |    Amira Markus    |  18 |  F  |
|  `4` |  Mohamed Kincannon |  60 |  M  |
|  `5` |     Juana Ardon    |  23 |  F  |
|  `6` |     Hyon Davie     |  60 |  F  |
|  `7` |    Estell Cromer   |  18 |  F  |
|  `8` |    Jacob Neeley    |  13 |  M  |
|  `9` | Carlene Weatherman |  42 |  F  |
| `10` |   Carie Markland   |  7  |  F  |

### `age`/`id` range index

| AGE |     ID    |
| :-: | :-------: |
|  7  | `1`, `10` |
|  13 |    `8`    |
|  18 |  `3`, `7` |
|  23 |    `5`    |
|  42 |    `9`    |
|  54 |    `2`    |
|  60 | `4`, `6`  |

----

*as seen in [Database Indexes for The Inquisitive Mind](http://writings.nunojob.com/2011/12/Database-Indexes-for-The-Inquisitive-Mind.html#post)*

### data set

|  DOCUMENT  |            COUNTRIES            |
| :--------: | :-----------------------------: |
|     `A`    |   Australia, Canada, Portugal   |
|     `B`    |      Canada, Portugal, Togo     |
|     `C`    | Algeria, Canada, Portugal, Togo |
|     `D`    |      Algeria, Canada, Togo      |
|     `E`    |           Canada, Togo          |
|     `F`    |               Togo              |


### `country`/`document` range index

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Algeria  |         `C`, `D`        |
| Australia |           `A`           |
|   Canada  | `A`, `B`, `C`, `D`, `E` |
|  Portugal |      `A`, `B`, `C`      |
|    Togo   | `B`, `C`, `D`, `E`, `F` |

## api

```js
var range = require('range-index');
```

### `index` range(string: `location`)

```js
var age = range('path/to/location');
```

### `void` index.put(`string`/`number`: value, `*`: key, `function`: callback)

```js
age.put(18, 7, function (e) {
  if(e) throw e;
  console.log('index saved successfully');
});
```
----

```js
countries.put('Portugal', 'A', function (e) {
  if(e) throw e;
  console.log('index saved successfully');
});
```

### `stream` index.get(`string`/`number`: index)

```js
var user = age.get(18);

user.on('data', function (data) {
  assert(data.value == [3, 7]);
  assert(data.key == 18);
});

user.on('error', function (e) {
  throw e;
});

user.on('close', function () {
  console.log('Stream closed')
});

user.on('end', function () {
  console.log('Stream closed')
});
```

with [kordon/cursor](https://github.com/kordon/cursor):

```js
age.get(18).pipe(cursor.all(function (keys, values, data) {
  assert.equal(e,  null);
  assert(values[0] == [3, 7]);
  assert(keys[0] == 18);
}));
```

----

```js
countries.get('Portugal').pipe(cursor.all(function (keys, values, data) {
  assert.equal(e,  null);
  assert(values[0] == ['A', 'B', 'C']);
  assert(key[0] == 'Portugal');
}));
```

### `stream` index.all()

```js
age.all().pipe(cursor.each(function (key, value, data) {
  console.log('Age: ', key, 'ID\'s: ', value);
}, function () {
  // end
}));
```

### `stream` index.from(start)

```js
age.from(54).pipe(cursor.each(function (key, value, data) {
  console.log('Age: ', key, 'ID\'s: ', value);
}, function () {
  // end
}));
```

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  54 |    `2`    |
|  60 | `4`, `6`  |

----

```js
countries.from('P').pipe(cursor.each(function (key, value, data) {
  console.log('Country: ', key, 'Documents: ', value);
}, function () {
  // end
}));
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Portugal |      `A`, `B`, `C`      |
|    Togo   | `B`, `C`, `D`, `E`, `F` |

### `stream` index.between(start, end)

```js
age.between(13, 23).pipe(cursor.each(function (key, value, data) {
  console.log('Age: ', key, 'ID\'s: ', value);
}, function () {
  // end
}));
```

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  13 |    `8`    |
|  18 |  `3`, `7` |
|  23 |    `5`    |

----

```js
countries.between('A', 'C').pipe(cursor.each(function (key, value, data) {
  console.log('Country: ', key, 'Documents: ', value);
}, function () {
  // end
}));
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Algeria  |         `C`, `D`        |
| Australia |           `A`           |

### `stream` index.until(end)

```js
age.until(18).pipe(cursor.each(function (key, value, data) {
  console.log('Age: ', key, 'ID\'s: ', value);
}, function () {
  // end
}));
```

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  7  | `1`, `10` |
|  13 |    `8`    |
|  18 |  `3`, `7` |

----

```js
countries.until('P').pipe(cursor.each(function (key, value, data) {
  console.log('Country: ', key, 'Documents: ', value);
}, function () {
  // end
}));
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Algeria  |         `C`, `D`        |
| Australia |           `A`           |
|   Canada  | `A`, `B`, `C`, `D`, `E` |

### `void` index.del(`string`/`number`: value, `*`: key, `function`: callback)

```js
age.del(18, 7, function (e) {
  if(e) throw e;
  console.log('index deleted successfully');
});
```
----

```js
countries.del('Portugal', 'A', function (e) {
  if(e) throw e;
  console.log('index deleted successfully');
});
```

## license

MIT