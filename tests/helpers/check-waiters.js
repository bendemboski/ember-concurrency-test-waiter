import Ember from 'ember';

const {
  A,
  Test
} = Ember;

export default function checkWaiters() {
  // pre-2.8 the Ember.Test.checkWaiters() API didn't exist, but the
  // Ember.test.waiters intimate API did.
  if (Test.checkWaiters) {
    return Test.checkWaiters();
  } else {
    return !!A(Test.waiters).find(([context, fn]) => !fn.call(context));
  }
}
