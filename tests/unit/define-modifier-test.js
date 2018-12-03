import { Promise as EmberPromise } from 'rsvp';
import EmberObject from '@ember/object';
import { run } from '@ember/runloop';
import defineModifier from 'ember-concurrency-test-waiter/define-modifier';
import { task } from 'ember-concurrency';
import { TaskProperty } from 'ember-concurrency/-task-property';
import { module, test } from 'qunit';
import checkWaiters from '../helpers/check-waiters';

module('Unit | define modifier', function(hooks) {
  hooks.afterEach(function() {
    delete TaskProperty.prototype.withTestWaiter;
  });

  test('it works', function(assert) {
    defineModifier();

    let Obj = EmberObject.extend({
      doStuff: task(function * () {
        return yield new EmberPromise((resolve) => {
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
});
