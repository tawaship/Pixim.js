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
					fonts: path.resolve(__dirname, 'img/image_1.png')
				});
				
				const test = new Test();
				
				test.addImages({
					fonts_w: path.resolve(__dirname, 'img/image_2.png')
				});
				
				app.attachAsync(test)
					.catch(e => {
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
					fonts: path.resolve(__dirname, 'img/ss_1.json')
				});
				
				const test = new Test();
				
				test.addSpritesheets({
					fonts_w: path.resolve(__dirname, 'img/ss_2.json')
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
							
							if ((!$.resources.sounds.a instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							if ((!$.resources.sounds.b instanceof Howl)) {
								exec(reject, app);
								return;
							}
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSounds({
					a: path.resolve(__dirname, 'sound/a.mp3')
				});
				
				const test = new Test();
				
				test.addSounds({
					b: path.resolve(__dirname, 'sound/b.mp3')
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