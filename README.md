# pixim.js

pixim.js is a little useful pixi.js wrapper.

[![Build Status](https://travis-ci.org/tawaship/Pixim.js.svg?branch=master)](https://travis-ci.org/tawaship/Pixim.js)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

---


## How to install

### for NPM

```sh
cd /path/to
git clone https://github.com/tawaship/Pixim.js
cd Pixim.js
npm run build
```

### for NPM

```javascript
import Emitter from '@tawaship/emitter';
```

### for Browser

```html
<script src="/path/to/dist/Pixim.min.js"></script>
```

## Usage

### Basic
```javascript
const app = new Pixim.Application();

const Test = Pixim.Content.create();

Test.defineLibraries({
	root: class Root extends PIXI.Container {
		constructor() {
			super();
			
			this.addChild(new PIXI.Graphics())
				.beginFill(0xFFFFFF, 1)
				.drawRect(0, 0, 50, 50);
		}
	}
});

const test = new Test();

app.attachAsync(test)
	.then(() => {
		app.play();
	});

```

### Basic once
```javascript
new Emitter()
	.once('ev', a => {
		console.log('ev', a);
	})
	.emit('ev', 1) // ev 1
	.emit('ev', 1) // (nothing)
```

### Repeatable arguments
```javascript
new Emitter()
	.on('ev', (...args) => {
		console.log('ev', ...args);
	})
	.emit('ev', 1, 2, 3, 4, 5, 6, 7) // ev 1 2 3 4 5 6 7
```

### Specify the context
```javascript
new Emitter()
	.on('ev', function(a) {
		console.log(this, a);
	})
	.cemit('ev', {hoge: 1}, 2) // {hoge: 1} 2
```

However, using the arrow function invalidates the context specification.

```javascript
// on window
new Emitter()
	.on('ev', a => {
		console.log(this, a);
	})
	.cemit('ev', {hoge: 1}, 2) // Window 2
```

### Events delete in groups
```javascript
new Emitter()
	.on('ev', a => {
		console.log('ev', a);
	})
	.on('ev', a => {
		console.log('ev', a);
	})
	.on('ev2', a => {
		console.log('ev', a);
	})
	.on('ev2', a => {
		console.log('ev', a);
	})
	.clear('ev')
	.emit('ev', 1) // (nothing)
	.emit('ev2', 1) // ev 1, ev 1
```

### All events delete at once
```javascript
new Emitter()
	.on('ev', a => {
		console.log('ev', a);
	})
	.on('ev2', a => {
		console.log('ev', a);
	})
	.on('ev3', a => {
		console.log('ev', a);
	})
	.on('ev4', a => {
		console.log('ev', a);
	})
	.clear()
	.emit('ev', 1) // (nothing)
	.emit('ev2', 1) // (nothing)
	.emit('ev3', 1) // (nothing)
	.emit('ev4', 1) // (nothing)
```