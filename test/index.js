const assert = require('assert');
const PIXI = require('pixi.js');
const Pixim = require('../');
const path = require('path');
console.warn = () => {};

describe('Pixim.js', () => {
	const exec = (done, app) => {
		app.view.parentNode.removeChild(app.view);
		done();
	};
	
	describe('Application', () => {
		it('auto resize', () => {
			const app = new Pixim.Application({}, {
				autoAdjust: true
			});
			
			assert.ok(app.view.style.width.replace('px', '') == window.innerWidth || app.view.style.height.replace('px', '') == window.innerHeight);
			
			app.view.parentNode.removeChild(app.view);
		});
		
		it('fullscreen', () => {
			const app = new Pixim.Application();
			app.fullScreen();
			
			assert.ok(app.view.style.width.replace('px', '') == window.innerWidth || app.view.style.height.replace('px', '') == window.innerHeight);
		});
		
		it('layered', () => {
			const app = new Pixim.Application();
			
			app.addLayer('1');
			app.addLayer('2');
			app.removeLayer('1');
			
			assert.equal(app.app.stage.children.length, 1);
			
			app.view.parentNode.removeChild(app.view);
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
					fonts: path.resolve(__dirname, 'fonts.png')
				});
				
				const test = new Test();
				
				test.addImages({
					fonts_w: path.resolve(__dirname, 'fonts_w.png')
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
					fonts: path.resolve(__dirname, 'fonts.json')
				});
				
				const test = new Test();
				
				test.addSpritesheets({
					fonts_w: path.resolve(__dirname, 'fonts_w.json')
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
					fonts: path.resolve(__dirname, 'fonts.pnga')
				}, {
					unrequired: true
				});
				
				const test = new Test();
				
				test.addImages({
					fonts_w: path.resolve(__dirname, 'fonts_w.pnga')
				}, {
					unrequired: true
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
					fonts: path.resolve(__dirname, 'fonts.jsona')
				}, {
					unrequired: true
				});
				
				const test = new Test();
				
				test.addSpritesheets({
					fonts_w: path.resolve(__dirname, 'fonts_w.jsona')
				}, {
					unrequired: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('define vars', () => {
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
				
				test.defineVars({
					check: true
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('activate and deactivate task', () => {
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
				
				app.play()
					.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
	});
});