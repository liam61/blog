# 手撸 forEach、map、reduce 等函数（创新版）

关于 forEach 等函数的实现不算稀奇，而且也是前端开发人员的基本功，网上一搜也一大堆

写这篇的目的是为了分享自己的一些创新见解。**但是否可在正式开发中使用请酌情考虑**

## 一、作用（礼貌性废话）

1. 了解常用 api 的原理，帮助我们更好的选用 api 以获得更高的执行效率

2. 学习其源码让我们开发时多一份思路去解决问题

3. 兼容 IE 浏览器：早些版本的 IE 并没有部署 map, reduce 等函数

## 二、开撸

参考资料：

- [MDN Array.prototype](https://developer.mozilla.org/zh-CN/search?q=Array.prototype)

- [jQuery](https://github.com/jquery/jquery)

### forEach

原生的 forEach 函数没有跳出功能，并且没有返回值

**创新**

- 跳出功能

- 对象也可 forEach

```js
function forEach(obj, callback/*, thisArg */) {
  if (obj == null) throw new TypeError('obj is null or not defined'); // 含 null 和 undefined
  if (Object.prototype.toString.call(callback) !== '[object Function]')
    throw new TypeError(`${callback} is not a function`);

  const O = Object(obj);
  const T = arguments.length > 2 ? arguments[2] : null;

  if (Array.isArray(O)) {
    // 可以像 MDN 中用 while (k < len) {...} 执行遍历
    O.every((value, index) => callback.call(T, value, index, O) !== false); // 为 false 就跳出
  }
  if (Object.prototype.toString.call(O) === '[object Object]') {
    for (let key in O) {
      if (callback.call(T, O[key], key, O) === false) break;
    }
  }
}
```

测试代码

```js
let arr = [1, 3, 5, 6, 7];
forEach(arr, (num, index) => {
  if (num > 5) return false;
  console.log('arr已遍历：', num, index);
});
// arr已遍历： 1 0
// arr已遍历： 3 1
// arr已遍历： 5 2

let obj = { a: 1, b: 3, c: 0, d: 2 };
forEach(obj, (val, key) => {
  if (key === 'c') return false;
  console.log('obj已遍历：', val, key);
});
// obj已遍历： 1 a
// obj已遍历： 3 b
```

### map

map 与 forEach 大同小异，map 每次执行都有返回值，用一个数组保存即可

**创新**

- 对象也可 map

```js
function map(obj, callback/*, thisArg */) {
  // 容错...
  const O = Object(obj);
  const T = arguments.length > 2 ? arguments[2] : null;

  if (Array.isArray(O)) {
    const finalArr = [];
    O.every((value, index) => finalArr.push(callback.call(T, value, index, O)));
    return finalArr;
  }
  if (Object.prototype.toString.call(O) === '[object Object]') {
    const finalObj = {};
    for (let key in O) {
      finalObj[key] = callback.call(T, O[key], key, O);
    }
    return finalObj;
  }
}
```

测试

```js
let obj = { a: 1, b: 3, c: 0, d: 2 };
let res = map(obj, (val, key) => {
  console.log('obj已遍历：', val, key);
  return val + 1;
});
console.log('结果：', res); // 返回对象
// obj已遍历： 1 a
// obj已遍历： 3 b
// obj已遍历： 2 d
// obj已遍历： 4 e
// 结果： {a: 2, b: 4, c: 1, d: 3, e: 5}
```

### reduce

reduce 与 map 也大同小异，reduce 每次把得到的值传入 回调函数中

**创新**

- 跳出功能

- 对象也可 reduce

```js
function reduce(obj, callback /*, initValue */) {
  // 容错...
  const O = Object(obj);
  let value;
  let res;
  let k = 0;

  if (Array.isArray(O)) {
    const len = O.length >>> 0;
    if (arguments.length > 2) value = arguments[2]; // 传了 initValue
    else if (len > 0) value = O[k++]; // 没传 initValue，取第一项的值
    else throw new TypeError('Reduce of empty array with no initial value');

    while (k < len) {
      if (k in O) {
        res = callback(value, O[k], k, O); // 注意，没有 .call
        if (res === false) break;
        value = res;
      }
      k += 1;
    }
  }
  if (Object.prototype.toString.call(O) === '[object Object]') {
    if (arguments.length > 2) value = arguments[2]; // 传了 initValue
    else if (Object.values(O)[0]) value = Object.values(O)[k++]; // 没传 initValue，取第一项的值
    else throw new TypeError('Reduce of empty object with no initial value');

    forEach(Object.keys(O), (key, index) => { // 之前部署的带跳出的 forEach
      if (index >= k) {
        res = callback(value, O[key], key, O);
        if (res === false) return false;
        value = res;
      }
    });
  }
  return value;
}
```

测试

```js
let arr = [1, 3, 5, 6, 7];
let res = reduce(arr, (sum, num, i) => {
  if (i === 3) return false;
  console.log('arr已遍历：', num, i);
  return sum + num;
}, 0); // 初值为 0
console.log('结果：', res);
// arr已遍历： 1 0
// arr已遍历： 3 1
// arr已遍历： 5 2
// 结果： 9

let scores = { Math: 95, Chinese: 80, English: 85, Physics: 59 };
res = reduce(scores, (sum, score, key) => {
  if (key === 'Physics') { return false; }
  console.log('obj已遍历：', score, key);
  return sum + score;
});
console.log('结果：', res);
// obj已遍历： 80 Chinese // 没初值，从第二项开始遍历的
// obj已遍历： 85 English
// 结果： 260
```

### filter

项目中经常会遇到对 对象属性 筛选的情况，如下

```js
const obj = { a: 1, b: 2, c: 3 };
const { a, c } = obj;
// 操作 a = ...; c = ...;
return { aChanged, cChanged };
```

**创新**

- 对象也可 filter

```js
function filter(obj, callback/*, thisArg */) {
  // 容错...
  const O = Object(obj);
  const T = arguments.length > 2 ? arguments[2] : null;

  if (Array.isArray(O)) {
    const finalArr = [];
    forEach(O, (val, index) => {
      if (callback.call(T, val, index, O) === true) finalArr.push(val);
    });
    return finalArr;
  }
  if (Object.prototype.toString.call(O) === '[object Object]') {
    const finalObj = {};
    for (let key in O) {
      if (callback.call(T, O[key], key, O) === true) finalObj[key] = O[key];
    }
    return finalObj;
  }
}
```

测试

```js
let personObj = { name: 'lawler', password: '123321', sex: 'male', age: 22 };
let res = filter(personObj, (val, key) => key !== 'password');
console.log('结果：', res);
// 结果： {name: "lawler", sex: "male", age: 22}
```

## 三、拓展

### findIdxByProp

1. 实际开发中我们经常会操作对象数组（[{}, {}, ...]），对 obj 的 prop 每次都要解构

2. findIdxByProp 函数可以预先传参然后在回调中取值

**创新**

- 预先传参然后在回调中取值

```js
function findIdxByProp(...props) {
  return function (obj, callback/*, thisArg */) {
    // 容错...
    const O = Object(obj);
    const T = arguments.length > 2 ? arguments[2] : null;

    if (!Array.isArray(O)) throw new TypeError(`${O} is not an array`);
    if (!O.every((item) => Object.prototype.toString.call(item) === '[object Object]'))
      throw new TypeError(`items in ${O} are not all Object`);

    let res = -1;
    O.every((innerObj, index) => {
      const propArr = props.map(prop => innerObj[prop]); // 记录传入的 key 值
      if (callback.call(T, ...propArr, index, O) === true) {
        res = index;
        return false;
      }
      return true;
    });
    return res;
  };
}
```

测试

```js
let objArr = [
  { id: 11, value: 'a' },
  { id: 31, value: 'b' },
  { id: 52, value: 'c' },
  { id: 11, value: 'd' }
];
let res = findIdxByProp('id', 'value')(objArr, (id, value, index) => {
  console.log(id, value, index);
  return id === 52;
});
console.log('结果：', res);
// 11 "a" 0
// 31 "b" 1
// 52 "c" 2
// 结果： 2
```

### filterByProp

1. 和 findIdxByProp 差不多，换汤不换药

**创新**

- 预先传参然后在回调中取值

```js
function filterByProp(...props) {
  return function (obj, callback/*, thisArg */) {
    // 容错...
    const O = Object(obj);
    const T = arguments.length > 2 ? arguments[2] : null;

    if (!Array.isArray(O)) throw new TypeError(`${O} is not an array`);
    if (!O.every((item) => Object.prototype.toString.call(item) === '[object Object]'))
      throw new TypeError(`items in ${O} are not all Object`);

    const res = [];
    O.forEach((innerObj, index) => {
      const propArr = props.map(prop => innerObj[prop]); // 记录传入的 key 值
      if (callback.call(T, ...propArr, index, O) === true) res.push(innerObj);
    });
    return res;
  };
}
```

测试

```js
let objArr = [
  { id: 11, value: 'a' },
  { id: 31, value: 'b' },
  { id: 52, value: 'c' },
  { id: 11, value: 'b' }
];
let res = filterByProp('id', 'value')(objArr, (id, value, index) => {
  console.log(id, value, index);
  return value === 'b';
});
console.log('结果：', res);
// 11 "a" 0
// 31 "b" 1
// 52 "c" 2
// 11 "b" 3
// 结果： [{id: 31, value: "b"}, {id: 11, value: "b"}]
```

## 四、简单实战

### 题目：有个份调查问卷全是填空题，有些题是必填的，有属性 required 为 true，有些则选填。现进行验证，如果有必填题没写则报错；如果必填题选全写了，则返回所有已写题的结果（数组对象）

1. 数据约定

```js
const questionArr = [
  { id: 1, value: '', required: true},
  { id: 2, value: 'a', required: false },
  { id: 3, value: 'bc', required: true },
  ...
];
```

2. 实战

```js
function verifyQuestions(questionArr) {
  const res = filterByProp('value', 'required')(questionArr, (value, required) => {
    if (required && !value) throw new Error('有必填题未填！');
    return !!value;
  });
}
```

## 五、总结

1. 对于原生 api 的实现其实就通过遍历来调用回调函数，加上 call, apply 等方法来改变 this，再根据不同情况操作回调函数的结果，按需返回数据

2. 对于拓展方面其实还有很多可写的，比如 `findAllIndex()` 可返回所有符合的下标、`findAllIdxByProp` 通过传入的 prop 来操作对象数组来返回所有符合的下标，等等。仅作为发散训练，是否在实际项目中使用请酌情考虑

3. 最后感谢能认真看到这里的小伙伴~ 给你们笔芯 ❤
