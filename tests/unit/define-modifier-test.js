import Ember from 'ember';
import defineModifier from 'ember-concurrency-test-waiter/define-modifier';
import { task } from 'ember-concurrency';
import { TaskProperty } from 'ember-concurrency/-task-property';
import { module } from 'qunit';
import test from 'ember-sinon-qunit/test-support/test';
import checkWaiters from '../helpers/check-waiters';

const {
  Object: EmberObject,
  run
} = Ember;

module('Unit | define modifier', {
  afterEach() {
    delete TaskProperty.prototype.withTestWaiter;
  }
});

test('it works', function(assert) {
  defineModifier();

  let Obj = EmberObject.extend({
    doStuff: task(function * () {
      return yield new Ember.RSVP.Promise((resolve) => {
        this.resolvePromise = resolve;
      });
    }).withTestWaiter(),
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
