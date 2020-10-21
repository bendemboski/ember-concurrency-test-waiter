# ember-concurrency-test-waiter

Easily instrument your [ember-concurrency](http://ember-concurrency.com) tasks to cause
[@ember/test-helpers](https://github.com/emberjs/ember-test-helpers)' `settled()` method to wait for any
running instances of those tasks to complete before proceeding.

## Motivation

Ember's async-aware test infrastructure will wait for several specific types of asynchronous operations
(currently route transitions, AJAX requests and run loop actions/timers), but has no easy centralized
way of tracking other asynchronous operations, such as waiting for callbacks from the FileReader API,
waiting for an image to load in an `<img>` tag, etc.

[ember-concurrency](http://ember-concurrency.com) provides a very nice mechanism for wrapping these
(and any other) asynchronous operations into tasks, and this addon adds support for easily telling the
Ember testing framework to treat running instances of certain tasks as test-blocking asynchronous
operations.

## Installation

`ember install ember-concurrency-test-waiter`

## Usage

Import ember-concurrency-test-waiter's `withTestWaiter` method into your application code and then
use it to wrap any tasks that you want to block asynchronous test helpers:

```javascript
// components/my-component.js
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import withTestWaiter from 'ember-concurrency-test-waiter/with-test-waiter';
import doSomethingAsync from '../utils/do-something-async';

export default Component.extend({
  myTask: withTestWaiter(task(function*() {
    return yield doSomethingAsync();
  }))
});
```

Alternatively, you can call ember-concurrency-test-waiter's `defineModifier` method somewhere early
in the boot process, such as app.js or an initializer, and then use it as a task modifier:

```javascript
// app.js
import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

defineModifier();

// remainder of app.js...
```

```javascript
// components/my-component.js
import Component from '@ember/component';
import { task } from 'ember-concurrency';
import doSomethingAsync from '../utils/do-something-async';

export default Component.extend({
  myTask: task(function*() {
    return yield doSomethingAsync();
  }).withTestWaiter()
});
```

If you're using @task decorator provided by [ember-concurrency-decorators](https://github.com/machty/ember-concurrency-decorators), then use the task modifier like this:

```javascript
// app.js
import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

defineModifier();

// remainder of app.js...
```

```javascript
// components/my-component.js
import Component from '@ember/component';
import { task } from 'ember-concurrency-decorators';
import doSomethingAsync from '../utils/do-something-async';

export default class MyComponent extends Component {
  @task({
    withTestWaiter: true
  })
  myTask = function*() {
    return yield doSomethingAsync();
  }
}
```

### TypeScript

To use `withTestWaiter: true` in the task decorator with TypeScript, you will need to import the types for `ember-concurrency-test-waiter`. This can be done in `types/<app-name>/index.d.ts`:

```javascript
// types/<app-name>/index.d.ts

import 'ember-concurrency-test-waiter';
```

## Why?

Here is a full example if how this addon could be useful to you. Suppose you want to test a component
that is handed the URL of an image and displays its dimensions. Your component needs to load the image
into an `<img>` tag and wait for a callback indicating that it's loaded so the dimensions can be read.
But in your unit test, there's no good way to wait for that load to complete other than polling on a
timer or something. Use ember-concurrency-test-waiter!

```javascript
// app/app.js
import defineModifier from 'ember-concurrency-test-waiter/define-modifier';

defineModifier();

// remainder of app.js...
```

```javascript
// app/components/image-size.js

import Component from '@ember/component';
import { Promise } from 'rsvp';
import { run } from '@ember/runloop';
import { task } from 'ember-concurrency';

export default Component.extend({
  src: null,
  dimensions: null,

  init() {
    this._super(...arguments);
    this.computeDimensions.perform(this.src);
  },

  computeDimensions: task(function*(src) {
    let { width, height } = yield new Promise((resolve, reject) => {
      let image = new Image();
      image.addEventListener('load', () => resolve(img));
      image.addEventListener('error', reject);
      image.src = src;
    });
    this.set('dimensions', { width, height });
  }).restartable().withTestWaiter()
});
```

```handlebars
{{! app/templates/components/image-size.hbs }}
{{#if this.dimensions}}
  dimensions: {{this.dimensions.width}}x{{this.dimensions.height}}
{{else}}
  loading...
{{/if}}
```

```javascript
// tests/integration/components/image-size.js

import { A } from '@ember/array';
import { run } from '@ember/runloop';
import { module, test } from 'qunit';
import { setupRenderingTest } from 'ember-qunit'
import hbs from 'htmlbars-inline-precompile';
import { render, settled } from '@ember/test-helpers';

module('image-size', 'Integration | Component | image-size', function(hooks) {
  setupRenderingTest(hooks);

  test('it works', async function(assert) {
    assert.expect(2);

    await render(hbs`<ImageSize @src="assets/test-image.jpg"/>`);
    // render() awaits settled(), which will now wait for computeDimensions
    // to complete before resolving
    assert.dom(this.element).hasText("200x350");
  });
});
```

### Using the older test API

The mechanism that `ember-concurrency-test-waiter` uses to hook into the `settled`
method also works for the old test framework -- `moduleForAcceptance` tests will
automatically wait for `withTestWaiter()` tasks, and in unit tests
(`moduleForComponent`, etc.), the `wait()` method (imported from `ember-test-helpers`)
will wait for `withTestWaiter()` tasks.
