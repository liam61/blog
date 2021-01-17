import { Observable } from "./Observable";
import { Operator, timers } from "./types";

export const from = <T>(input: T[]) => {
  if (Array.isArray(input)) {
    return new Observable<T>((subscriber) => {
      // eslint-disable-next-line
      input.some((n, i) => {
        if (subscriber.isClosed) return true;
        subscriber.next(n, i);
      });

      subscriber.complete();
    });
  }

  // if (toString.call(input) === "[object Object]") {
  //   Object.entries(input).some()
  // }
  return new Observable<T>(() => {});
};

export const interval = (delay = 1000) => {
  return new Observable<number>((subscriber) => {
    let tick = 0;
    timers.interval = setInterval(() => {
      if (subscriber.isClosed) {
        clearInterval(timers.interval);
        return;
      }
      subscriber.next(tick++);
    }, delay);
  });
};

export const map = <V, R>(
  project: (value: V, index: number) => R,
  thisArg?: any
): Operator<V, R> => (nextSubscriber, origin) => {
  let i = 0;

  // 在这才会生成 origin 的 subscriber
  const _subscription = origin.subscribe((value) => {
    try {
      nextSubscriber.next(project.call(thisArg, value, i), i++);
    } catch (err) {
      nextSubscriber.error(err);
    }
  });
};

export const filter = <T>(
  project: (value: T, index: number) => boolean,
  thisArg?: any
): Operator<T, T> => (nextSubscriber, origin) => {
  let i = 0;

  const _subscription = origin.subscribe((value) => {
    try {
      if (project.call(thisArg, value, i)) {
        nextSubscriber.next(value, i);
      }
      i++;
    } catch (err) {
      nextSubscriber.error(err);
    }
  });
};
