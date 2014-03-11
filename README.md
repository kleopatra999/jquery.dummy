jQuery.someData
===============

[jQuery.Dummy][jquery.dummy] is a [jQuery][jquery] plugin that allows you to
manipulate HTML with jQuery methods using only HTML5 data attributes.

For example, take the following HTML snippet:

```html
<div data-dummy-attr="id:username">
  <p>Hello, my name is <span data-dummy-text="username"></span>!</p>
  <p data-dummy-add-class="sweets:is_dessert">I love <span data-dummy-text="food"></span>.</p>
</div>
```

With Dummy, we can update this HTML with some JSON:

```js
{"username": "anna", "food": "tacos", "is_dessert": false}
```

Which would result in:

```html
<div id="anna" data-dummy-attr="id:username">
  <p>Hello, my name is <span data-dummy-text="username">anna</span>!</p>
  <p data-dummy-add-class="sweets:is_dessert">I love <span data-dummy-text="food">tacos</span>.</p>
</div>
```

Additional examples and explinations of all available data attribute options
are contained in the source code.

For an interactive example, run `examples/index.html` on a webserver.

Installing
==========

Requires [jQuery][jquery], include Dummy after it:

```html
<script src="/path/to/jquery.js"></script>
<script src="/path/to/jquery.dummy.js"></script>
```  

Licenses
========

Created by [deviantART][da]. Please check the [LICENSES.txt][licenses] file for full details on the licensing.

[da]: http://www.deviantart.com/
[jquery.dummy]: http://deviantart.github.com/jquery.dummy/
[licenses]: https://github.com/deviantART/jquery.somedata/blob/master/LICENSES.txt
[jquery]: http://jquery.com/
