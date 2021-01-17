import { from, map, filter } from "../minrx";
// import { from } from "rxjs";
// import { map, filter } from "rxjs/operators";

const nextSource = from([3, 5, 8, 11, -1]).pipe(
  map((n, i) => {
    if (i === 0) return false;
    if (i === 2) return n + i;
    if (n === -1) return undefined;
    return n * 2 + "-map-" + i;
  }),
  filter((n, i) => {
    return i !== 3 && typeof n === "string";
  })
);

nextSource.subscribe((n) => console.log("get", n));
