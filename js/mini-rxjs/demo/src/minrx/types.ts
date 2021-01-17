import { Observable } from "./Observable";
import { Subscriber } from "./Subscriber";

export const noop = () => {};

export const defaultDestination: Observer<any> = {
  next: noop,
  error(err) {
    console.error(err);
  },
  complete: noop
};

export const timers: Record<string, any> = {};

export interface Observer<T> {
  next: (value: T, index?: number) => void;
  error: (err: any) => void;
  complete: () => void;
}

export type Producer<T> = (subscriber: Subscriber<T>) => void;

export type Operator<V, R> = (
  nextSubscriber: Subscriber<R>,
  origin: Observable<V>
) => void;
