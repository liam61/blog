import { Subscriber } from "./Subscriber";
import { noop, Observer, Operator, Producer } from "./types";

export class Observable<T> {
  // lift 时使用
  protected origin: Observable<any> | null = null;
  protected operator: Operator<any, any> | null = null;

  constructor(public producer: Producer<T> = noop) {}

  subscribe(
    next: Observer<T>["next"] | null,
    error?: Observer<T>["error"] | null,
    complete?: Observer<T>["complete"] | null
  ) {
    const subscriber = new Subscriber({
      next: next || noop,
      error: error || noop,
      complete: complete || noop
    });

    // lift 过来，传递 nextSubscriber 即可
    if (this.operator) {
      this.operator(subscriber, this.origin!);
    } else {
      try {
        this.producer(subscriber);
      } catch (err) {
        subscriber.error(err);
      }
    }

    return subscriber;
  }

  protected lift<R>(operator: Operator<R, T>): Observable<R> {
    const observable = new Observable<R>();
    observable.origin = this;
    observable.operator = operator;
    return observable;
  }

  pipe<A>(op1: Operator<T, A>): Observable<A>;
  pipe<A, B>(op1: Operator<T, A>, op2: Operator<A, B>): Observable<B>;
  pipe(...operators: Operator<any, any>[]): Observable<any> {
    if (!operators.length) return this;

    return operators.reduce(
      (prev: Observable<any>, operator) => prev.lift(operator),
      this
    );
  }
}
