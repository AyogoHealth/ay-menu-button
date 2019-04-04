ayMenuButton
============

A keyboard-accessible, screen-reader-friendly, dropdown menu button library.

<small>Copyright © 2016 Ayogo Health Inc.</small>


Features
--------

* Polyfill for the HTML5 `<button type="menu">` feature
* Keyboard accessible and screen-reader friendly
* Smooth animation on desktop and mobile
* Supports IE 10+, Safari, Edge, Chrome, Firefox, iOS 8+, and Android 4.4+


Usage
-----

To get started, install the package from npm: `npm install ay-menu-button`.

We'll use this HTML as our example:

```html
<menu id="myMenu" type="context">
  <menuitem label="First Item"></menuitem>
  <menuitem>Second Item</menuitem>
  <menuitem disabled label="Disabled Item"></menuitem>
</menu>

<button id="my-button" data-type="menu" menu="myMenu">Open Menu</button>
```

### Basic usage

Add a script tag to your page to reference the index.js file, and upgrade your
button element.

```html
<script src="node_modules/ay-menu-button/dist/index.js"></script>
<script>
  var buttonElement = document.getElementById('my-button');
  MenuButton(buttonElement);
</script>
```


### CommonJS/AMD

You can import ayMenuButton as a CommonJS or AMD module for use with tools like
Browserify, RequireJS, and WebPack.

```javascript
var MenuButton = require('ay-menu-button');

MenuButton(buttonElement);
```


### ES6

You can import ayMenuButton as an ES6 module with tools that support `jsnext:main` in package.json.

```javascript
import MenuButton from 'ay-menu-button';

MenuButton(buttonElement);
```


Framework Support
-----------------

For convenience and ease of integration with apps already using client-side
frameworks, framework integration files are also available.

Currently we only support Angular 1 and Vue, but we are hoping to support native WebComponents.

### Angular 1

Use the `ay-menu-button/dist/angular1.js` file:

```html
<script src="angular.js"></script>
<script src="node_modules/ay-menu-button/dist/angular1.js"></script>
<script>
  angular.module('MyApp', [ayMenuButton]);
</script>
```


### Vue

Use the `ay-menu-button/dist/vue.js` file:

```javascript
  import Vue from 'vue';
  import AyMenuButton from 'ay-menu-button/dist/vue';

  Vue.component('ay-menu-button', AyMenuButton);
  //...
```

```html
  <menu id="myMenu" type="context">
    <menuitem label="First Item"></menuitem>
    <menuitem>Second Item</menuitem>
    <menuitem disabled label="Disabled Item"></menuitem>
  </menu>

  <ay-menu-button data-type="menu" menu="myMenu">Open Menu</ay-menu-button>
```



Notes
-----

Released under the terms of the [MIT License](LICENSE).
