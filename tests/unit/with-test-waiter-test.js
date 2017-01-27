import Ember from 'ember';
import withTestWaiter from 'ember-concurrency-test-waiter/with-test-waiter';
import { task } from 'ember-concurrency';
import { module, test } from 'qunit';
import checkWaiters from '../helpers/check-waiters';

const {
  Object: EmberObject,
  RSVP: { Promise },
  run
} = Ember;

module('Unit | with test waiter');

test("no test waiter is registered without withTestWaiter() decorator", function(assert) {
  let Obj = EmberObject.extend({
    doStuff: task(function * () {
      return yield new Promise(() => null);
    }),
  });

  let obj;

  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });

  assert.notOk(checkWaiters());
});

test("withTestWaiter() decorator works", function(assert) {
  let Obj = EmberObject.extend({
    doStuff: withTestWaiter(task(function * () {
      return yield new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    })),
  });

  let obj;

  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while task is running");

  run(() => {
    obj.resolvePromise();
  });

  assert.notOk(checkWaiters(), "waiters are settled after task completes");
});

test("withTestWaiter() decorator works with concurrent tasks", function(assert) {
  let Obj = EmberObject.extend({
    doStuff: withTestWaiter(task(function * () {
      return yield new Promise((resolve) => {
        this.resolvePromises = this.resolvePromises || [];
        this.resolvePromises.push(resolve);
      });
    })),
  });

  let obj;

  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while task is running");

  run(() => {
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while two concurrent tasks are running");

  run(() => {
    obj.resolvePromises[0]();
  });

  assert.ok(checkWaiters(), "waiters are not settled after only one task completes");

  run(() => {
    obj.resolvePromises[1]();
  });

  assert.notOk(checkWaiters(), "waiters are settled after both tasks complete");
});

test("withTestWaiter() decorator works with restartable()", function(assert) {
  let Obj = EmberObject.extend({
    doStuff: withTestWaiter(task(function * () {
      return yield new Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    }).restartable()),
  });

  let obj;

  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while task is running");

  run(() => {
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled after restarting task");

  run(() => {
    obj.resolvePromise();
  });

  assert.notOk(checkWaiters(), "waiters are settled after task completes");
});

test("withTestWaiter() decorator works with enqueue()", function(assert) {
  let Obj = EmberObject.extend({
    doStuff: withTestWaiter(task(function * () {
      return yield new Promise((resolve) => {
        this.resolvePromises = this.resolvePromises || [];
        this.resolvePromises.push(resolve);
      });
    }).enqueue()),
  });

  let obj;

  run(() => {
    obj = Obj.create();
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while task is running");

  run(() => {
    obj.get('doStuff').perform();
  });

  assert.ok(checkWaiters(), "waiters are not settled while task is queued");

  run(() => {
    obj.resolvePromises[0]();
  });

  assert.ok(checkWaiters(), "waiters are not settled after only one task completes");

  run(() => {
    obj.resolvePromises[1]();
  });

  assert.notOk(checkWaiters(), "waiters are settled after both tasks complete");
});
