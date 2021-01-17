import { Observable } from "../minrx";

const observable = new Observable((subscriber) => {
  subscriber.next(1);
  subscriber.complete();
});

observable.subscribe(
  (n) => {
    console.log("next: get num", n);
  },
  (err) => {
    console.log("error:", err);
  },
  () => {
    console.log("complete");
  }
);
