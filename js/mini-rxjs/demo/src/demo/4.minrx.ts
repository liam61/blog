import { interval, map } from "../minrx";
// import { interval } from "rxjs";
// import { map } from "rxjs/operators";

const subscription = interval(1000)
  .pipe(
    map((n, i) => {
      // console.log("map", i);
      return n * 2 + "-map-" + i;
    })
  )
  .subscribe((n) => console.log("get", n));

setTimeout(() => {
  subscription.unsubscribe();
}, 3100);
