const assert = require('assert');
const PIXI = require('pixi.js-legacy');
const { Howl } = require('howler');
const Pixim = require('../');
const path = require('path');

describe('Pixim.js', () => {
	const exec = (done, app) => {
		done();
	};
	
	describe('Application', () => {
		it('auto resize', () => {
			const app = new Pixim.Application({width:100,height:100}, {
				autoAdjust: true
			});
			
			exec(() => {
				assert.ok(app.view.style.width.replace('px', '') == (app.container.offsetWidth || window.innerWidth) || app.view.style.height.replace('px', '') == (app.container.offsetHeight || window.innerHeight));
			}, app);
		});
		
		it('fullscreen', () => {
			const app = new Pixim.Application();
			app.fullScreen();
			
			exec(() => {
				assert.ok(app.view.style.width.replace('px', '') == (app.container.offsetWidth || window.innerWidth) || app.view.style.height.replace('px', '') == (app.container.offsetHeight || window.innerHeight));
			}, app);
		});
		
		it('layered', () => {
			const app = new Pixim.Application();
			
			app.addLayer('1');
			app.addLayer('2');
			app.removeLayer('1');
			
			exec(() => {
				assert.equal(app.app.stage.children.length, 1);
			}, app);
		});
		
		it('attach and detach content', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				app.addLayer('1');
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {}
				});
				
				const test = new Test();
				app.attachAsync(test, '1')
					.then(root => {
						if (root.parent !== app.app.stage.children[0]) {
							exec(reject, app);
							return;
						}
					})
					.then(() => {
						app.detach(test);
						
						if (app.app.stage.children[0].children.length === 1) {
							exec(reject, app);
							return;
						}
						
						exec(resolve, app);
					})
					.catch(e => {
						exec(reject, app);
					});
			});
		});
	});
	
	describe('Content', () => {
		it('define and add images', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if (!($.resources.images.relative instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if (!($.resources.images.absolute instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if (!($.resources.images.data instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if (!($.resources.images.relative_w instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if (!($.resources.images.absolute_w instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if (!($.resources.images.data_w instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineImages({
					relative: 'img/image_1.png',
					absolute: path.resolve(__dirname, 'img/image_1.png'),
					data: 'data:image/png;base64,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'
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addImages({
					relative_w: 'img/image_2.png',
					absolute_w: path.resolve(__dirname, 'img/image_2.png'),
					data_w: 'data:image/png;base64,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'
				});
				
				app.attachAsync(test)
					.catch(e => {
						console.log(e)
						exec(reject, app);
					});
			});
		});
		
		it('define and add spritesheets', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if ((!$.resources.spritesheets.relative[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.spritesheets.absolute[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							//if ((!$.resources.spritesheets.data[50] instanceof PIXI.Texture)) {
							//	exec(reject, app);
							//	return;
							//}
							/*
							if ((!$.resources.spritesheets.relative_w[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.spritesheets.absolute_w[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.spritesheets.data_w[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							*/
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSpritesheets({
					relative: 'img/ss_1.json',
					absolute: path.resolve(__dirname, 'img/ss_1.json'),
					data: {"frames":{"ss_1_1":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_1_2":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,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","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}}
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addSpritesheets({
					relative_w: 'img/ss_2.json',
					absolute_w: path.resolve(__dirname, 'img/ss_2.json'),
					data_w: {"frames":{"ss_2_1":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_2_2":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,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","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}}
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('define and add sounds', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if ((!$.resources.sounds.relative_a instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.absolute_a instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.data_a instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.relative_b instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.absolute_b instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.data_b instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSounds({
					relative_a: 'sound/a.mp3',
					absolute_a: path.resolve(__dirname, 'sound/a.mp3'),
					data_a: 'data:audio/mp3;base64,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'
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addSounds({
					relative_b: 'sound/b.mp3',
					absolute_b: path.resolve(__dirname, 'sound/b.mp3'),
					data_b: 'data:audio/mp3;base64,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'
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire define and add images', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if ((!$.resources.images.fonts instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.images.fonts_w instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineImages({
					fonts: path.resolve(__dirname, 'img/image_3.png')
				}, {
					unrequired: true
				});
				
				const test = new Test();
				
				test.addImages({
					fonts_w: path.resolve(__dirname, 'img/image_4.pnga')
				}, {
					unrequired: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire define and add spritesheets', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if ((!$.resources.spritesheets.fonts[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.spritesheets.fonts_w[50] instanceof PIXI.Texture)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSpritesheets({
					fonts: path.resolve(__dirname, 'img/ss_3.json')
				}, {
					unrequired: true
				});
				
				const test = new Test();
				
				test.addSpritesheets({
					fonts_w: path.resolve(__dirname, 'img/ss_4.json')
				}, {
					unrequired: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire define and add sounds', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if ((!$.resources.sounds.c instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.d instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSounds({
					c: path.resolve(__dirname, 'sound/c.mp3')
				}, {
					unrequired: true
				});
				
				const test = new Test();
				
				test.addSounds({
					d: path.resolve(__dirname, 'sound/d.mp3')
				}, {
					unrequired: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('add vars', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if (!$.vars.check) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				const test = new Test();
				
				test.addVars({
					check: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('(deprecated) activate and deactivate task', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends Pixim.Container {
						constructor($) {
							super();
							
							this.task.on('dummy', e => {
								this.task.clear();
								exec(reject, app);
							})
							.on('task', e => {
								this.x += e.delta;
								
								if (this.x > 10) {
									this.task.clear();
									exec(resolve, app);
								}
							})
							.clear('dummy');
						}
					}
				});
				
				const test = new Test();
				
				app.play().attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('(new)activate and deactivate task', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends Pixim.Container {
						constructor($) {
							super();
							
							this.task.add(e => {
								this.task.reset();
								exec(resolve, app);
								app.container.removeChild(app.view);
							});
						}
					}
				});
				
				const test = new Test();
				
				app.play().attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('(new)task chaining', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends Pixim.Container {
						constructor($) {
							super();
							
							this.task.add(e => {
								this.task.next();
							});
							
							this.task.add(e => {
								this.task.add(taskB);
								this.task.next();
							});
							
							const taskB = [
								e => {
									this.task.next();
								},
								e => {
									this.task.reset();
									exec(resolve, app);
									app.container.removeChild(app.view);
								}
							];
						}
					}
				});
				
				const test = new Test();
				
				app.play().attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
	});
});