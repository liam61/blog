/**
  实际执行的代码

  let num = 0;
  async function gen() {
    num = num + (await wait(10));
    // num = (await wait(10)) + num;
    await foo();
    return num;
  }

  async function foo() {
    await "literal";
  }

  (async () => {
    // debugger;
    await gen();
    console.log("regenerator: res", num);
  })();

  console.log("regenerator: sync", ++num);
 */

// 把 regeneratorRuntime 重命名，避免加载到 webpack 的 regenerator 代码
import genRuntime from "./runtime-my";
// import genRuntime from "regenerator-runtime";

import { wait } from "../utils";

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) {
  try {
    var info = gen[key](arg);
    var value = info.value;
  } catch (error) {
    reject(error);
    return;
  }
  if (info.done) {
    resolve(value);
  } else {
    Promise.resolve(value).then(_next, _throw);
  }
}

function _asyncToGenerator(fn) {
  return function () {
    var self = this,
      args = arguments;
    return new Promise(function (resolve, reject) {
      // 执行 mark 返回的 Generator，即升级后的 _callee
      var gen = fn.apply(self, args);
      function _next(value) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value);
      }
      function _throw(err) {
        asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err);
      }
      _next(undefined);
    });
  };
}

var num = 0;

function gen() {
  return _gen.apply(this, arguments);
}

function _gen() {
  _gen = _asyncToGenerator(
    /*#__PURE__*/ genRuntime.mark(function _callee2() {
      return genRuntime.wrap(function _callee2$(_context2) {
        while (1) {
          switch ((_context2.prev = _context2.next)) {
            case 0:
              _context2.t0 = num;
              _context2.next = 3;
              return wait(10);

            case 3:
              _context2.t1 = _context2.sent;
              num = _context2.t0 + _context2.t1;
              _context2.next = 7;
              return foo();

            case 7:
              return _context2.abrupt("return", num);

            case 8:
            case "end":
              return _context2.stop();
          }
        }
      }, _callee2);
    })
  );
  return _gen.apply(this, arguments);
}

function foo() {
  return _foo.apply(this, arguments);
}

function _foo() {
  _foo = _asyncToGenerator(
    /*#__PURE__*/ genRuntime.mark(function _callee3() {
      return genRuntime.wrap(function _callee3$(_context3) {
        while (1) {
          switch ((_context3.prev = _context3.next)) {
            case 0:
              _context3.next = 2;
              return "literal";

            case 2:
            case "end":
              return _context3.stop();
          }
        }
      }, _callee3);
    })
  );
  return _foo.apply(this, arguments);
}

_asyncToGenerator(
  /*#__PURE__*/ genRuntime.mark(function _callee() {
    return genRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch ((_context.prev = _context.next)) {
          case 0:
            // debugger;
            _context.next = 3;
            return gen();

          case 3:
            console.log("regenerator: res", num);

          case 4:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  })
)();

console.log("regenerator: sync", ++num);

const genFn = genRuntime.mark(function () {
  return {
    // next() {}
  };
});

console.log(
  "regenerator: isGeneratorFunction",
  genRuntime.isGeneratorFunction(genFn)
);

window.Generator &&
  console.log(
    "regenerator: genFn.prototype instanceof Generator",
    // eslint-disable-next-line
    genFn.prototype instanceof Generator
  );
