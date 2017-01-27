# ember-concurrency-test-waiter

Easily instrument your [ember-concurrency](http://ember-concurrency.com) tasks to cause
[acceptance test helpers](https://guides.emberjs.com/v2.11.0/testing/acceptance/)
or [ember-test-helpers](https://github.com/emberjs/ember-test-helpers)' `wait()` method to wait for any
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
import Ember from 'ember';
import { task } from 'ember-concurrency';
import withTestWaiter from 'ember-concurrency-test-waiter/with-test-waiter';
import doSomethingAsync from '../utils/do-something-async';

const { Component } = Ember;

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
import Ember from 'ember';
import { task } from 'ember-concurrency';
import doSomethingAsync from '../utils/do-something-async';

const { Component } = Ember;

export default Component.extend({
  myTask: task(function*() {
    return yield doSomethingAsync();
  }).withTestWaiter()
});
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

import Ember from 'ember';
import { task } from 'ember-concurrency';

const {
  $,
  Component,
  RSVP: { Promise },
  run
} = Ember;

export default Component.extend({
  src: null,
  dimensions: null,
  
  init() {
    this._super(...arguments);
    this.get('computeDimensions').perform(this.get('src'));
  },
  
  computeDimensions: task(function*(src) {
    let img = yield new Promise((resolve, reject) => {
      let $img = $('<img>');
      $img.load(function() {
        run(() => resolve(this));
      });
      $img.error(run(reject));
      $img.attr('src', src);
    });
    this.set('dimensions', { width: img.width, height: img.height });
  }).restartable().withTestWaiter()
});
```

```handlebars
{{! app/templates/components/image-size.hbs }}
{{#if dimensions}}
  dimensions: {{dimensions.width}}x{{dimensions.height}}
{{else}}
  loading...
{{/if}}
```

```javascript
// tests/integration/components/image-size.js

import Ember from 'ember';
import { moduleForComponent, test } from 'ember-qunit';
import hbs from 'htmlbars-inline-precompile';
import wait from 'ember-test-helpers/wait';

const {
  A,
  run
} = Ember;

moduleForComponent('image-size', 'Integration | Component | image-size', {
  integration: true
});

test('it works', function(assert) {
  assert.expect(2);
  
  this.render(hbs`{{image-size src="assets/test-image.jpg"}}`);
  
  assert.equal(this.$().text().trim(), "loading...");
  return wait().then(() => { // yay!
    assert.equal(this.$().text().trim(), "200x350");
  });
});
```
