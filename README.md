# @tawaship/pixim.js

**pixim.js is a little useful pixi.js wrapper framework.**

[![Build Status](https://travis-ci.org/tawaship/Pixim.js.svg?branch=master)](https://travis-ci.org/tawaship/Pixim.js)
[![MIT License](http://img.shields.io/badge/license-MIT-blue.svg?style=flat)](LICENSE)

---

## How to install

```sh
cd /path/to
git clone https://github.com/tawaship/Pixim.js
cd Pixim.js
npm run build
```

### for NPM

```javascript
import Pixim from '@tawaship/pixim.js';
```

### for Browser

```html
<script src="/path/to/dist/Pixim.min.js"></script>
```

## Usage

### Basic

1.  Create content 

```javascript
Pixim.Content.create('test');
const Test = Pixim.Content.get('test');
```

or 

```javascript
const Test = Pixim.Content.create();
```

2. Define content settings and libraries

```javascript

Test.setConfig({
	width: 300,
	height: 300
});

Test.defineLibraries({
	root: class Root extends PIXI.Container {
		constructor($) {
			super();
			
			this.addChild(new PIXI.Graphics())
				.beginFill(0xFFEEEE, 1)
				.drawRect(0, 0, $.width, $.height);
			
			this.addChild(new $.lib.main($))
		}
	},
	
	main: class Root extends PIXI.Container {
		constructor($) {
			super();
			
			this.addChild(new PIXI.Graphics())
				.beginFill(0, 1)
				.drawRect(0, 0, 100, 100);
		}
	}
});
```

3. Create application

```javascript
const app = new Pixim.Application({width: 300, height: 300});
```

4. Attach content to application and run application

```javascript
app.attachAsync(new Test())
	.then(() => {
		app.play();
	});
```

![1](https://raw.github.com/tawaship/Pixim.js/screenshot/img/1.png)

### Advanced content

#### Class assets to preload

1. Define assets

```javascript
Test.defineImages({
	image_1: 'img/image_1.png'
});

Test.defineSpritesheets({
	ss_1: 'img/ss_1.json'
});
```

2. Use assets

```javascript
// in content library

this.addChild(new PIXI.Sprite($.resources.images.image_1));
this.addChild(new PIXI.Sprite($.resources.spritesheets.ss_1.ss_1_1)).y = 105;
this.addChild(new PIXI.Sprite($.resources.spritesheets.ss_1.ss_1_2)).x = 105;
```

![2](https://raw.github.com/tawaship/Pixim.js/screenshot/img/2.png)

#### Instance assets to preload

1. Define assets

```javascript
const test = new Test();

test.addImages({
	image_2: 'img/image_2.png'
});

test.addSpritesheets({
	ss_2: 'img/ss_2.json'
});
```

2. Use assets

```javascript
// in content library

this.addChild(new PIXI.Sprite($.resources.images.image_2));
this.addChild(new PIXI.Sprite($.resources.spritesheets.ss_2.ss_2_1)).y = 105;
this.addChild(new PIXI.Sprite($.resources.spritesheets.ss_2.ss_2_2)).x = 105;
```

![3](https://raw.github.com/tawaship/Pixim.js/screenshot/img/3.png)

#### Task processing

If the library class inherits Pixi.Container, you can use tasks that are executed for each ticker process of the application.

```javascript
// in content library

this.task.on('anim', e => {
	this.x += e.delta;
});
```