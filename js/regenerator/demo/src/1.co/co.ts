// import co from "co";
import { isGenerator, isGeneratorFunction, isPromise } from "../utils";

export default function co(gen: any) {
  return new Promise((resolve, _reject) => {
    typeof gen === "function" && (gen = gen());

    function next(data?: any) {
      const ret: any = gen.next(data);
      if (ret.done) return resolve(ret.value);
      toPromise(ret.value).then(next);
    }

    function toPromise(obj: any) {
      if (isPromise(obj)) return obj;
      if (isGeneratorFunction(obj) || isGenerator(obj)) return co(obj);
      // if (other types) {}
      return; // error
    }

    next();
  });
}
