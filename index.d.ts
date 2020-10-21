import { AbstractTaskProperty, Task } from 'ember-concurrency';

declare module 'ember-concurrency' {
  interface AbstractTaskProperty<T extends Task<any, any[]>> {
    withTestWaiter(): this;
  }
}
