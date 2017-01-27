import withTestWaiter from './with-test-waiter';
import { TaskProperty } from 'ember-concurrency/-task-property';

// Define a .withTestWaiter() modifier on TaskProperty
export default function defineModifier() {
  TaskProperty.prototype.withTestWaiter = function () {
    return withTestWaiter(this);
  };
}
