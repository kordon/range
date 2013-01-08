# range

[levelup](https://github.com/rvagg/node-levelup) based range index

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

----

```js
var country = countries.get('Portugal');

user.on('data', function (data) {
  assert(data.value == ['A', 'B', 'C']);
  assert(data.key == 'Portugal');
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

### index.all()

```js
var users = age.all();

users.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
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

### index.from(start)

```js
var users = age.from(54);

users.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
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

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  54 |    `2`    |
|  60 | `4`, `6`  |

----

```js
var from_countries = countries.from('P');

from_countries.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
});

from_countries.on('error', function (e) {
  throw e;
});

from_countries.on('close', function () {
  console.log('Stream closed')
});

from_countries.on('end', function () {
  console.log('Stream closed')
});
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Portugal |      `A`, `B`, `C`      |
|    Togo   | `B`, `C`, `D`, `E`, `F` |

### index.between(start, end)

```js
var users = age.between(13, 23);

users.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
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

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  13 |    `8`    |
|  18 |  `3`, `7` |
|  23 |    `5`    |

----

```js
var between_countries = countries.between('A', 'C');

from_countries.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
});

from_countries.on('error', function (e) {
  throw e;
});

from_countries.on('close', function () {
  console.log('Stream closed')
});

from_countries.on('end', function () {
  console.log('Stream closed')
});
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Algeria  |         `C`, `D`        |
| Australia |           `A`           |

### index.until(end)

```js
var users = age.until(18);

users.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
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

returned indexes:

| AGE |     ID    |
| :-: | :-------: |
|  7  | `1`, `10` |
|  13 |    `8`    |
|  18 |  `3`, `7` |

----

```js
var from_countries = countries.until('P');

from_countries.on('data', function (data) {
  console.log('Age: ', data.key, 'ID\'s: ', data.value)
});

from_countries.on('error', function (e) {
  throw e;
});

from_countries.on('close', function () {
  console.log('Stream closed')
});

from_countries.on('end', function () {
  console.log('Stream closed')
});
```

returned indexes:

|  COUNTRY  |        DOCUMENTS        |
| :-------: | :---------------------: |
|  Algeria  |         `C`, `D`        |
| Australia |           `A`           |
|   Canada  | `A`, `B`, `C`, `D`, `E` |

## test [![Build Status](https://travis-ci.org/kordon/range.png)](https://travis-ci.org/kordon/range)

```bash
npm test
```

## license

MIT