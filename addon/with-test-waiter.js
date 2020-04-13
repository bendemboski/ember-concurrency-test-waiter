import { assert } from '@ember/debug';
import { buildWaiter } from 'ember-test-waiters';

let waiter = buildWaiter('ember-concurrency-test-waiter:task-waiter');

// A function that, given a task property, will register it with the test
// waiter so async test helpers will block anytime a task instance spawned
// from that property is running.
export default function withTestWaiter(taskProperty) {
  assert("withTestWaiter() will only work with ember-concurrency >=0.7.19 -- please upgrade", taskProperty.hasOwnProperty('taskFn'));

  let originalTaskFn = taskProperty.taskFn;

  taskProperty.taskFn = function *(...args) {
    let token = waiter.beginAsync();

    try {
      return yield * originalTaskFn.apply(this, args);
    } finally {
      waiter.endAsync(token);
    }
  };
  return taskProperty;
}
