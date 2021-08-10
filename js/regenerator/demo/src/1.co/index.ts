import co from "./co";
// import co from "co";

import { wait } from "../utils";

let num = 0;
function* gen() {
  num = num + (yield wait(10));
  // num = (yield wait(10)) + num;
  yield foo();
  // yield* foo();
  return num;
}

function* foo() {
  yield wait(123);
}

co(gen).then((num) => console.log("co: res", num));
console.log("co: sync", ++num);
