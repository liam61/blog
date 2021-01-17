import { Observer, defaultDestination, timers } from "./types";

export class Subscriber<T> implements Observer<T> {
  public isClosed = false;
  protected destination: Observer<T>;

  constructor(destination: Partial<Observer<T>>) {
    this.destination = {
      ...defaultDestination,
      ...destination
    };
  }

  next(value: T, index?: number) {
    if (this.isClosed) return;
    this.destination.next(value, index);
  }

  error(err: any) {
    if (this.isClosed) return;
    this.isClosed = true;
    this.destination.error(err);
    this.unsubscribe();
  }

  complete() {
    if (this.isClosed) return;
    this.isClosed = true;
    this.destination.complete();
    this.unsubscribe();
  }

  unsubscribe() {
    this.isClosed = true;
    this.destination = defaultDestination;
    // 简单实现
    // 应该还要判断该 timer 和 当前 Subscriber 的关系
    // 如果在这条 source -> pipe -> nextSource 链上才 clear
    Object.values(timers).forEach((timer) => clearInterval(timer));
  }
}
