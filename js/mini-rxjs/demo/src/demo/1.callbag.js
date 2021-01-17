const START = 0;
const DATA = 1;
const END = 2;

const pipe = (source, ...callbacks) => {
  return callbacks.reduce((prev, cb) => cb(prev), source);
};

const from = (iter) => (type, sink) => {
  if (type !== START) return;
  // 更通用的方式是利用 iterator
  if (Array.isArray(iter)) {
    const len = iter.length;
    let inLoop = true;
    let i = 0;

    // sink 通信
    sink(START, (t) => {
      if (i === len) return;
      if (t === DATA) {
        sink(DATA, { v: iter[i], i: i++, o: iter });
        // 上面的 sink 会一直在 each:callback and each:talkback 嵌套调用
        // 回溯时每层都是 i === len
        if (i === len && inLoop) {
          inLoop = false;
          sink(END);
        }
      }
      // 主动断开连接
      if (t === END) sink(END);
    });
  }

  // if (toString.call(source) === "[object Object]") {
  //   const arr = Object.entries(iter);
  // }
};

const map = (callback, thisArg) => (source) => (type, sink) => {
  if (type !== START) return;
  let i = 0;

  source(START, (t, d) => {
    // 等待 1 来 pull source
    sink(t, t === DATA ? callback.call(thisArg, d.v, i++, d.o) : d);
  });
};

const each = (callback, thisArg) => (source) => {
  let pullable;
  let i = 0;

  // 建立通信
  source(START, (t, d) => {
    // console.log(d);
    if (t === START) pullable = d;
    // 收到 pullable 响应数据后执行 用户逻辑
    if (t === DATA) callback.call(thisArg, d, i++);
    if (t === END) pullable = null;
    // 开始消费 source
    if (t !== END) pullable(DATA);
  });
};

const source = pipe(
  from([3, 5, 8]),
  map((n, i) => n * 2 + "-map-" + i)
);

each((n, i) => console.log(n, i))(source);
