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
		it('images', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.images;
							
							for (let i in v) {
								if (!(v[i] instanceof PIXI.Texture)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineImages({
					relative: 'img/image_1.png',
					absolute: path.resolve(__dirname, 'img/image_1.png?asdads'),
					data: 'data:image/png;base64,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',
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addImages({
					relative_w: 'img/image_2.png',
					absolute_w: path.resolve(__dirname, 'img/image_2.png'),
					data_w: 'data:image/png;base64,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',
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('images-xhr', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.images;
							
							for (let i in v) {
								if (!(v[i] instanceof PIXI.Texture)) {
									exec(reject, app);
									return;
								}
								
								if (v[i].baseTexture.resource.url.indexOf("blob:") !== 0) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineImages({
					relative: 'img/image_1.png',
					absolute: path.resolve(__dirname, 'img/image_1.png?asdads'),
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1',
					xhr: true
				});
				
				test.addImages({
					relative_w: 'img/image_2.png',
					absolute_w: path.resolve(__dirname, 'img/image_2.png'),
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('spritesheets', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.spritesheets;
							
							for (let i in v) {
								if (!(v[i].ss_1_1 instanceof PIXI.Texture) && !(v[i].ss_2_1 instanceof PIXI.Texture)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSpritesheets({
					relative: 'img/ss_1.json',
					absolute: path.resolve(__dirname, 'img/ss_1.json'),
					json: {"frames":{"ss_1_1":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_1_2":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAADwFJREFUeF7tm91xJFUaBT+tAwgLAAtgtAYAFgAWwIt4BSwAPIBX0ANYAFgAGLAzsxYADjDggLRxJrqIitpudbWq6/ZNdXbEBDNS/Zw62Tfr1g8X5ccGbOBsG7g42yP3wG3ABkoB+CWwgTNuQAGcMXwP3QYUgN8BGzjjBrYK4Prq+sXFxcXlGffS1aHf3t0+u3l6c9VVKMM8iga2CuDjf398981/vnF20Ani66vr22+ffvuvTuIY4xE1oAAAMBUAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNOK5COCTqvpqxOiLqvpyIbP3quqjqnqrql6fbCs//7Gq/l64j5erK4BjtOg2tjVwDgJ4pap+r6rLIwrgw6r6bs9X6peqevcYXzsFcIwW3cY5CuDtzZk/Z+nxZ+kM4LctZ/1t/b5fVT8t/eopgKUNuv6uBh7rDCADP4P8nR0HvkQAb1bV89F2M7sYZgOfHnmm4SWAY3fVBloJINfgmYLnT87Gf20GzbazYwZYzpz5ZNmsk+l0BtkfM9uYDtLpaksEELnkGj9yybV/Bv3Xmx38PJHOkv38k9kZwEzqLnZwA2sLIAMxA3c6BR+C5uyZwfTr5gefb87cuw4kN/IyqObcXHsxORsf8xJg2FaOL8eQPLnXkJnB+IZgju37g6lMVlAASxt0/VNdAvwwOpvvyjAMkn1n7ayfwfbGTJyRSWYPkUYkNL4cOMqZeZQjTwSyn+nTgPx77qxl52EpgJnEXezgBtaeAUzPwpnaZ/qfwZiBn88woKeP6vIYbXh0N1zPP/SMusrUfHPWj1yGS5Y1Zhk+Bjz4a+0KcxtYWwDTu+U5g+d6fvhvcg7T/22P1rJs/kQaWeehd9TnCOBuT2nTrnZd3iRrhDXcF5jLwhnA4qbcwKENrC2Afc/Lc838ZBM619AZ7LvuF2Sxhz5WO7YAtr1bkHyZDeSm4Jx7FLNZeQkwuyoXPLCBtQWQOJFApvLjF3HGMfO7z0YSyNR/1+O7nF0jiEOvq48tgOn2pjczD8Rw/+IK4Kh1urFRA2sLINPkDOicuSOA4dp/fLNs/MZcbhpmMEUKWXZ8r2CInZ8Nlw1zYc4RQG4a3vcZXh1+bZNxvGzuTST39JOfHSqr/9uIApiL2eUObWBtAYwHXkSQKX/O4OObZoMA8nw9f88nAyfL54w/fblmLQHM7W56s/K+9Y7ytEEBzEXjcoc2sKYA8mgsg3jfZ3iR5tme6/9sJ0J4dd8Gt/x+zgxg7mbnPNoctqUA5rbqcidpYE0B5ID2nS0jiA82R56pdf696yZgBn9mDodO/7P5Ywpgui1nACf56rrTYzSwtgCGjJneT2/s7Xq1NyIYXrMd1s8lwZI36nIvYnwTcsm1+XRb93FYsp9/tuslwDG+6m5jWwOtBGD7CxpQAAvKc9V7G1AAgC+IAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARtwrg+sn1n3VRl9BjenSx7+ru+c3Tm6tHd2Ae0Mkb2CqAk6cygA3YQJMGFECTmt2JDfTZgALok4upbKBJAwqgSc3uxAb6bEAB9MnFVDbQpIHtTwGurl9cXFz4FKAJgv07ub27feZTgP09ucThDfgewOGdNV/D9wCaV342O1QAANQKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRrxXATwSVV9NWL0RVV9eSRmb1bV89G2fqmqd4+07ZebUQDHbNNtjRs4BwG8UlW/V9XlSgL4uareUQAOLGIDj10Ab2/O/G9N4BxjBvDaZtvvT7btDIA4Es4082MVQAZ+Bvn4zDxGvEQAGfhZ/6Md3xkFcKaDiXjYrQSQa/BMwfMnZ+O/quq7qvppS2m5ph7Oqlk262RQZfk/ZpY8vS6frrZEANnWi8klxXj7CmAmJBc7fQNrCyADMQN3OgUfjjzX5jmT/rr5weebs+uuZnIjL4P37xnV3TdIlwrgh5GkplEUwAw4LtJHA2sL4L6BMjQQAXxfVfvO2lk+wnhjZnWRSWYPkUYkNL4cWCqA9zYCyLYzW8n2ho8CmAnIxU7fwNoCmJ6FM1gy/c9gHK6hhwE9fVT34+jR3XA9P8ji0Oamd+qXCmC8/+msRQEcSsflT9bA2gL4rapeHx1dzuAZIMN/86th+v/h5kw9vZ7O8pFG1tl2z2BOeXMEcLdnQ1u7qioFMIeAy3TZwNoC2Daox0XkBZonmx/keX0G+677BVksM4iHSEABdPn1M9SpG1hbADm+SCDXyuMXccbHnd99NpJApv67Ht9lJhBBzH0aMOxHAZz6m+b+u2xgbQHkxl4GdM7cEcBw7T++LBhfM+emYab6kUKWHd8rGArMz4bLhrmlzhFApvL3fXa9OuwlwFwKLtddA2sLYDzwIoJM+XMGH789NwggL+/k7/lEAlk+Z/xPJ7OHtQTwUDgK4KHNud7JG1hTAHlUlkG875MB/nVVPdtz/Z/tRAiv7tvglt/PmQE8YLMvV1EAD23O9U7ewJoCyMFNH+1NDziC+GDzw7xim3/vugmYwZ+Zw6HT/2xeAZz8q2aAHhtYWwDDMWd6P72xt+vV3oggy04fH+ZloYd+ci9ifBMylxiH3kjcte/kHWeNqP770KDb1vN/Bz5mm25r3EArAdj6ggYUwILyXPXeBhQA4AuiAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGjErQK4fnL9Z13UJfSYHl3su7p7fvP05urRHZgHdPIGtgrg5KkMYAM20KQBBdCkZndiA302oAD65GIqG2jSgAJoUrM7sYE+G1AAfXIxlQ00aUABNKnZndhAnw0ogD65mMoGmjSgAJrU7E5soM8GFECfXExlA00aUABNanYnNtBnAwqgTy6msoEmDSiAJjW7ExvoswEF0CcXU9lAkwYUQJOa3YkN9NmAAuiTi6lsoEkDCqBJze7EBvpsQAH0ycVUNtCkAQXQpGZ3YgN9NqAA+uRiKhto0oACaFKzO7GBPhtQAH1yMZUNNGlAATSp2Z3YQJ8NKIA+uZjKBpo0oACa1OxObKDPBhRAn1xMZQNNGlAATWp2JzbQZwMKoE8uprKBJg0ogCY1uxMb6LMBBdAnF1PZQJMGFECTmt2JDfTZgALok4upbKBJAwqgSc3uxAb6bEAB9MnFVDbQpAEF0KRmd2IDfTagAPrkYiobaNKAAmhSszuxgT4bUAB9cjGVDTRpQAE0qdmd2ECfDSiAPrmYygaaNKAAmtTsTmygzwYUQJ9cTGUDTRpQAE1qdic20GcDCqBPLqaygSYNKIAmNbsTG+izgf8BTZd0ajN7e98AAAAASUVORK5CYII=","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}}
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addSpritesheets({
					relative_w: 'img/ss_2.json',
					absolute_w: path.resolve(__dirname, 'img/ss_2.json'),
					json_w: {"frames":{"ss_2_1":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_2_2":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAAAXNSR0IArs4c6QAAD69JREFUeF7tm9GR41QaRv/eBBgiWIgAZjYAIAIgAnhpXoEIgAzgFaYKiACIAAhgZ2YjABJgIIHprW/Ll1UJuS3b7et73EdVUxSDdPX5O75HV7K4KjcbsIF728DVvf3kfnAbsIFSAH4JbOAeN6AA7jF8P7oNKAC/AzZwjxtYFMD1o+vnV1dXD+5xL0N99Bc3L54+fvL40VChDHMRDSwK4IN/fXDz5b+/dHUwCOLrR9cvvnry1T8GiWOMC2pAAQBgKgAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoxEsXwIdV9U5VvbL50zD9UVXvV9UPd8Dttap6Nhnnp6p66w7G/WsIBXCXbTrWtIFLFsDXm0l+G/HPq+rjI78SP1bVmwrgyBY9/CwNXKoA/llVv65s9EFV/bly3+luOUcEkhXGdHMFcECZHnKeBi5VAFn6Z3K2LUv076sqk/2jWdW5ev+8R/2Z+J/esrpQAHuU6a7nbaCXADIhM/ny5/Wqyj34N1vuwXNP3a6q2TfHZFJl/99W1vXeZow2Tp4BtGNvjhRADn++ybUURwGshORu52/g1ALIZM7EzURe2rJMz8O4dgX+ZHN13dZMruq5+u6zZH9jMv78gV3Oc8gtwHcLS/+WWQGc/3ttgpUNnFoAt02UFjEC+Laqlibn/GNEGK+u/Gzz3bIKiTwy4dt26HhvbwTQngFkXAVwIBgPO18DpxbAfKmcJXmW/7nvzsTP1ib0/L499+ztPj4TrB0TWeyz3bYK2ff+f+m881WLK4B96LjvWRs4tQB+mf3+nituJkj7Zz58W/7nvj23C9Mt++ZPpJFj9v3dPlfqjDm96mf8+a1H/m7+bGAOZrGrqlIAZ/0Ke/JjGji1AJYm9TRvns4/3PzFS5vJvu15QXbLCmKtBHLvH3lMt4gkq4rPFkpTAMd8kzwW2cCpBZBSIoFMuvlVuBU2fRknEsjSf/pizXwCRxC7fg3IOLnKT88ZGeS2Y9uxCgD5FTb0MQ2cWgC5/86EzpU7k7Hdx+dnubZN75nz0DATN1LIvtNnBW3/Nfft85VHrvzzF3baeFmF5FeFLOVv25ZWDdnfW4BjvoEee9YGTi2A6WuyEUEmW67g08nYBDBdskcC2T8TNy/uTK/kawSw5jXgfYRyGyQFcNavsCc/poFTCiAP4DKJd22Z4F9U1dNb3hdoY0QIL+8acMeLOvPD1whFAawo3V14DZxSAGlj/tPevKEI4t3NX+YV2/z7toeAbRm/5rXdXffz0xwKgPe9NfEdNXBqAbSYWd7PH+xte7U3Isi+0+cEuSXY5/f/nG/t1p4BrN1/vl/yTrNGVP85dLCl4/zfge+yTceaNtBLALZ+RAMK4IjyPPTWBhQA4AuiAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGjERQFcP7z+va7qAfQzXVzsm7p59vjJ40cX98H8QGdvYFEAZ09lABuwgS4NKIAuNXsSGxizAQUwJhdT2UCXBhRAl5o9iQ2M2YACGJOLqWygSwPLvwI8un5+dXXlrwBdEOw+yYubF0/9FWB3T+6xfwO+B7B/Z92P8D2A7pXfmxMqAABqBQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNqAAA4BQAABI0ogIAgFMAAEjQiAoAAE4BACBBIyoAADgFAIAEjagAAOAUAAASNKICAIBTAABI0IgKAABOAQAgQSMqAAA4BQCABI2oAADgFAAAEjSiAgCAUwAASNCICgAATgEAIEEjKgAAOAUAgASNeOkC+LCq3qmqVzZ/GqY/qur9qvrhCG5vb8Z4fTZ2hszY31fVn0eM/9ehCuAuWnSMpQYuWQBfbybibeQ/r6qPD/hqvFdV3+w47qeqeuuAsf92iAK4ixYd4z4J4J9V9etK5A8OuFL/snDVXzpdVh/HrDL+N6YCWEnS3fZu4FJXAFn65+retmebJXkm+0ezlt6sqp/3aO61qsp4bYto2mogY+ccbfu0qj7bY+zFXRXAsQ16/LYGegkgEzITI39yz5x78EyapatjJliunNmyb47Jcjr7/7YSZZboGaONk2cA7dibIwXwxubWIuLIuJn0X2zG/LGq8vcKYCUodztvA6cWQCZzJm4m8tKWq2cemLUr8CdVlavmti1X9fz3fR6uZcK28edX75znkFuAli/j5TMkz0ublUGk0LZ8tm+PRewK4NgGPf5cK4DvJlfhbRnaJFmanPNjMtlePRBnViGRx3SJfsx40xj5RSBymk7+/PfpyuPA2D4DOLg4D9zZwKlXAM9nEy5L8iz/s0zOxM/WJvT8vj0/o7X7+Ezcdsy+V9TbViH73v/PC81VPyucdqsx/e93cv+fAV0B7Pweu8OBDZxaAPOn5bni5n6+/TOx2/J86ae17Js/kUaO2feJeq7MmaDTq37OOb/1yN/Nnw3MK513tU0syZrJ354LHIjm/4cpgKMrdIAtDZxaALt+L8/T9IebbLmaZrJve16Q3fb5WS33/hlvumVyZlWx9GR+HwEkayQyF0tkk4eC+zyj2PnlVAA7K3KHAxs4tQASKxLIpJtPlhZ5+jJOJlaW/tMn6fMJHEHs+jVgaYJGBrnt2HbsPgKYP+1fWlEciOTvhymAO6vSgWYNnFoAWSZnQufKHQG0+/jpw7LpG3N5aJjJFClk3+mzghZ9zX37fOWRK//SfXrGzCokV+z8AnHb1lYNSy8ZRSxLLx7l73bJaueXUgHsrMgdDmzg1AKYXikjgky2XMGnk7EJYLpkz8TJ/pm485dr1ghgzWvA+whlWu/8YeVt1d/Jg0AFcOC328N2NnBKAeQBXCbxrq29SPN0x/1/xokQXt41YFXNf3247ZA1Qpkev+anzba/AlgBy13O18ApBZBPtetqGUG8u/n4WVrn37c9BGzL+DWv7e66n582vq8A5vf/rgDO9/31zEc2cGoBtHhZ3s8f7G17tTciaK/ZtuNzS7DP7/8539qtPQNYu3+ea2x7oDkfw2cAa1t1v7M00EsAZ/lwl3JSnwFcCsnxPocCGI/J3xIpAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpRAQDAKQAAJGhEBQAApwAAkKARFQAAnAIAQIJGVAAAcAoAAAkaUQEAwCkAACRoRAUAAKcAAJCgERUAAJwCAECCRlQAAHAKAAAJGlEBAMApAAAkaEQFAACnAACQoBEVAACcAgBAgkZUAABwCgAACRpxUQDXD69/r6t6AP1MFxf7pm6ePX7y+NHFfTA/0NkbWBTA2VMZwAZsoEsDCqBLzZ7EBsZsQAGMycVUNtClAQXQpWZPYgNjNqAAxuRiKhvo0oAC6FKzJ7GBMRtQAGNyMZUNdGlAAXSp2ZPYwJgNKIAxuZjKBro0oAC61OxJbGDMBhTAmFxMZQNdGlAAXWr2JDYwZgMKYEwuprKBLg0ogC41exIbGLMBBTAmF1PZQJcGFECXmj2JDYzZgAIYk4upbKBLAwqgS82exAbGbEABjMnFVDbQpQEF0KVmT2IDYzagAMbkYiob6NKAAuhSsyexgTEbUABjcjGVDXRpQAF0qdmT2MCYDSiAMbmYyga6NKAAutTsSWxgzAYUwJhcTGUDXRpQAF1q9iQ2MGYDCmBMLqaygS4NKIAuNXsSGxizAQUwJhdT2UCXBhRAl5o9iQ2M2YACGJOLqWygSwMKoEvNnsQGxmxAAYzJxVQ20KUBBdClZk9iA2M2oADG5GIqG+jSgALoUrMnsYExG1AAY3IxlQ10aUABdKnZk9jAmA0ogDG5mMoGujSgALrU7ElsYMwGFMCYXExlA10aUABdavYkNjBmA/8FsVqIahrNnloAAAAASUVORK5CYII=","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}}
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('spritesheets-xhr', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.spritesheets;
							
							for (let i in v) {
								if (!(v[i].ss_1_1 instanceof PIXI.Texture) && !(v[i].ss_2_1 instanceof PIXI.Texture)) {
									exec(reject, app);
									return;
								}
								
								if (i.match("_w")) {
									if (v[i].ss_2_1.baseTexture.resource.url.indexOf("blob:") !== 0) {
										exec(reject, app);
										return;
									}
								} else {
									if (v[i].ss_1_1.baseTexture.resource.url.indexOf("blob:") !== 0) {
										exec(reject, app);
										return;
									}
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSpritesheets({
					relative: 'img/ss_1.json',
					absolute: path.resolve(__dirname, 'img/ss_1.json'),
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1',
					xhr: true
				});
				
				test.addSpritesheets({
					relative_w: 'img/ss_2.json',
					absolute_w: path.resolve(__dirname, 'img/ss_2.json'),
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('sounds', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.sounds;
							
							for (let i in v) {
								if (!(v[i] instanceof Howl)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
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
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('sounds-xhr', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.sounds;
							
							for (let i in v) {
								if (!(v[i] instanceof Howl)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineSounds({
					relative_a: 'sound/a.mp3',
					absolute_a: path.resolve(__dirname, 'sound/a.mp3'),
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1',
					xhr: true
				});
				
				test.addSounds({
					relative_b: 'sound/b.mp3',
					absolute_b: path.resolve(__dirname, 'sound/b.mp3'),
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('jsons', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.jsons;
							
							for (let i in v) {
								if (!(v[i].frames)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineJsons({
					normal: 'data/1.json'
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addJsons({
					normal_b: 'data/2.json'
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('jsons-xhr', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							const v = $.resources.jsons;
							
							for (let i in v) {
								if (!(v[i].frames)) {
									exec(reject, app);
									return;
								}
							}
							
							if (_c === 0 || _c !== c) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineJsons({
					normal: 'data/1.json'
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1',
					xhr: true
				});
				
				test.addJsons({
					normal_b: 'data/2.json'
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire-images', () => {
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
							
							if (_c !== 0) exec(reject, app);
							
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
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire-spritesheets', () => {
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
							
							if (_c !== 0) exec(reject, app);
							
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
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire-sounds', () => {
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
							
							if (_c !== 0) exec(reject, app);
							
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
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('unrequire-jsons', () => {
			return new Promise((resolve, reject) => {
				const app = new Pixim.Application();
				
				const Test = Pixim.Content.create();
				Test.defineLibraries({
					root: class Root extends PIXI.Container {
						constructor($) {
							super();
							
							if (_c !== 0) exec(reject, app);
							
							exec(resolve, app);
						}
					}
				});
				
				Test.defineJsons({
					normal: 'data/3.json'
				}, {
					unrequired: true
				});
				
				const test = new Test({
					basepath: __dirname,
					version: '1'
				});
				
				test.addJsons({
					normal_b: 'data/4.json'
				}, {
					unrequired: true
				});
				
				const c = test.assetCount;
				let _c = 0;
				test.on(Pixim.EVENT_LOADER_ASSET_LOADED, () => {
					++_c;
				});
				
				app.attachAsync(test)
					.catch(e => {
						exec(reject, app);
					});
			});
		});
		
		it('vars', () => {
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
								app.container.removeChild(app.view);
								exec(resolve, app);
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
									app.container.removeChild(app.view);
									exec(resolve, app);
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
	
	describe('Loader', () => {
		it('texture', () => {
			const res = [];
			
			const l = new Pixim.TextureLoader()
			return l.loadAsync(path.resolve(__dirname, 'img/image_1.png'))
				.then(resource => {
					res.push(resource)
					return l.loadAsync('data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABmCAYAAAA53+RiAAAAAXNSR0IArs4c6QAAB0BJREFUeF7tnHmsbtMZh5+PmlozN4qaqbHUlRpSQxU1JSKIKRH+cASRoCpoTRFBS4TQpHEbEUFoJEIiRMyRaLQxJqYYEkJM1cHUat1PnmutWHbOcde5111Wz31XcpN79l57v+/6Pesd1v7jGxGjSwVGejWx7cQljPjJiNGSXXq5mDk1dzz3jS/AzJ64bzwe3z5i9NRipkGXyx2PxhfPA3Pc7OMeHI/H5815Ys5DXXq6mDk1sd3EAwGmQ+gBpkMo80pLREyfZAJMn1wiYjrlEmACTK8KdOpX1JgA06kCnboVERNgOlWgU7ciYgJMpwp06lZETIDpVIFO3YqICTCdKtCpWxExAaZTBTp1KyImwHSqQKduRcQEmE4V6NStiJgA06kCnboVERNgOlWgU7ciYgJMpwp06lZETIDpVIFO3YqICTCdKtCpWxExAaZTBTp1KyImwHSqQKduRcQEmE4V6NStiJgZAmYj4Exg42I9pwDxaxpfBbxs0mknYOl0a1o6TTditgGuA35c+PEzIH5N46tg9gMuAbYElki3pqVTgPlmU5mR8nPgdGBHwL/zWKRgVgd+AcwqDN4KvPHNru//8m0HAocA2wIbDqC4oKZg3gfuBt4FrD+muOWTrI8BawPfB/JPbZnyXgN2Btad5PrcAskqad6qA0yfAC+kf/8e3Bv68AzwKmCudzPp7yPA3wd2thv46W2ffRYY2phq15wDnJDeM+/3eQZjkYLZHLgM2CIZ1fFfAc8BBwMWuB+key5MMAqcHb0feAXYO83L14Vl+P8VEI677xhAe7l45nV+BjwPnAs8meZ774j0jLv1O2nyP4HXgfWAFZLQ2V+nCPIkYHdgxcJP770F/B64A/hXRQwfDZwPrD/F3EUKZlj8FUYB7cqGjrmzFbX8YTqFcgcKqxRcsX8DzEm7+iJ/qQtYbYpF+u5rgEtTGhWk3aJpZAjy0wTKIlz6uxbwO2BfYOWiSA83wMnAw8B/5wPnh8BZgL4Zpfpfdq/dgHEdLyWhTGelYJNdt1Yp7sspoq4ANgNMif7bIKW2lZJAj6bF+64bgf2BZYo06nXTZZleSzBG2IWpHviYdVI7puLtAe24YS4GrgLemQ+YpYB1ADfCmmnjLHD3urBd2ddFjKnsgpSOjgfcoTl3e92FGPruNIeiHJty+/fS7jParF8KbPoz9ficI9t2h94EWCcc/u17BGdavRrYevCMEV5Gpc9cmXa6zxyWbGnfunhiSoMVGW3elIU+VixKMLcAvwZ2GeTefN2cX56JSsimOlPbboCQTDV2hBlKCcb/l++xMTgSeDzNvxfYdRIwfwIOSFFmZFj7TFe2uGsA3001p/RrRoBRLCPC3FoWxXxdsacCcypglOVCbjdlMTZycteXBRuCsZGwbf1LUvGB5EMJ04gRmGeOYQdlCvwwpTbtWi/+mJqIxRqMqev6FC12Vwpl6jPFmFJy15cjQxB2TrbEDnO8kWrBFqR1xFo1BHMDcBCwXLLhST1D+R+wT0pfTwNvVhT/ElrXqWxBI8a0Ihg7rCzmzQmUKcnUlmuJQGwSDgeOAvKZR1j/SOlIkPkEXqalCeDsBM8IuQ+wnResRduzltFiW26ElWes+UXOjARj+rBDszNyKJoiW3dy3s/CCMB68jfgt8BeKQKmEq4EY81y8/iMHaMNgLYFYJp1A/wnNQU2BqbS2jEjwXho/QNwaFFPsiC2tEaF6cfhKd5a5AF3k9Qyb1q05gptvTGlDVOZf+8JnAH8dAqgtwGXp3olpNrRHMzwW5n14B7gvdQW++HOE7RDgf+casJk1z1zlN/dyndtlXK8Yufzj/nfFljhf5SEtJU1neVUZRp0fv6ia92xPvmeycD4nOejHVK7nRsLo8foErx2TW/TGQv9TXG67bILNp3k07xCfJzC31bWhWZRXIynfAv4ZNfthqZ6l+/I6SS/L6c0U4zw9cEvCX4use31C4TprqwFfh+zs8sRdifwS+DFgcq5Jc+fclyX6fMjYDwdImnuUCcv67/vrRrTBVP10m9h0mzg2nSwm8q8UXBa+kpQ8+3rW1jGlyZnChgj8nZgj8G3ubxSa5MNhZ9WPEguSBQ0BTVTwCiadclOzi8K5ciHRFvftwHPKN2PmQRGsa0VuU5k8XOt6z5Kyt0y08B0Hwm1DgaYWqUazwswjQWvNRdgapVqPC/ANBa81lyAqVWq8bwA01jwWnMBplapxvMCTGPBa80FmFqlGs8LMI0FrzUXYGqVajwvwDQWvNZcgKlVqvG8ANNY8FpzAaZWqcbzAkxjwWvNBZhapRrPCzCNBa81F2BqlWo8L8A0FrzWXICpVarxvADTWPBacwGmVqnG8wJMY8FrzQWYWqUazwswjQWvNRdgapVqPC/ANBa81lyAqVWq8bwA01jwWnMBplapxvMCTGPBa80FmFqlGs8LMI0FrzUXYGqVajyvBHPXmPEsRnzQ2IcwN5kCc5n1OU/JS9cjJT3DAAAAAElFTkSuQmCC');
				})
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.TextureLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('texture-xhr', () => {
			const res = [];
			
			const l = new Pixim.TextureLoader()
			return l.loadAsync(path.resolve(__dirname, 'img/image_1.png'), { xhr: true })
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.TextureLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
						
						if (resource.data.baseTexture.resource.url.indexOf('blob:') !== 0) {
							throw "not blob";
						}
					}
				})
		});
		
		it('textures', () => {
			return new Pixim.TextureLoader()
				.loadAllAsync({
					absolute: { src: path.resolve(__dirname, 'img/image_1.png') },
					data: {
						src: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAGYAAABmCAYAAAA53+RiAAAAAXNSR0IArs4c6QAAB0BJREFUeF7tnHmsbtMZh5+PmlozN4qaqbHUlRpSQxU1JSKIKRH+cASRoCpoTRFBS4TQpHEbEUFoJEIiRMyRaLQxJqYYEkJM1cHUat1PnmutWHbOcde5111Wz31XcpN79l57v+/6Pesd1v7jGxGjSwVGejWx7cQljPjJiNGSXXq5mDk1dzz3jS/AzJ64bzwe3z5i9NRipkGXyx2PxhfPA3Pc7OMeHI/H5815Ys5DXXq6mDk1sd3EAwGmQ+gBpkMo80pLREyfZAJMn1wiYjrlEmACTK8KdOpX1JgA06kCnboVERNgOlWgU7ciYgJMpwp06lZETIDpVIFO3YqICTCdKtCpWxExAaZTBTp1KyImwHSqQKduRcQEmE4V6NStiJgA06kCnboVERNgOlWgU7ciYgJMpwp06lZETIDpVIFO3YqICTCdKtCpWxExAaZTBTp1KyImwHSqQKduRcQEmE4V6NStiJgZAmYj4Exg42I9pwDxaxpfBbxs0mknYOl0a1o6TTditgGuA35c+PEzIH5N46tg9gMuAbYElki3pqVTgPlmU5mR8nPgdGBHwL/zWKRgVgd+AcwqDN4KvPHNru//8m0HAocA2wIbDqC4oKZg3gfuBt4FrD+muOWTrI8BawPfB/JPbZnyXgN2Btad5PrcAskqad6qA0yfAC+kf/8e3Bv68AzwKmCudzPp7yPA3wd2thv46W2ffRYY2phq15wDnJDeM+/3eQZjkYLZHLgM2CIZ1fFfAc8BBwMWuB+key5MMAqcHb0feAXYO83L14Vl+P8VEI677xhAe7l45nV+BjwPnAs8meZ774j0jLv1O2nyP4HXgfWAFZLQ2V+nCPIkYHdgxcJP770F/B64A/hXRQwfDZwPrD/F3EUKZlj8FUYB7cqGjrmzFbX8YTqFcgcKqxRcsX8DzEm7+iJ/qQtYbYpF+u5rgEtTGhWk3aJpZAjy0wTKIlz6uxbwO2BfYOWiSA83wMnAw8B/5wPnh8BZgL4Zpfpfdq/dgHEdLyWhTGelYJNdt1Yp7sspoq4ANgNMif7bIKW2lZJAj6bF+64bgf2BZYo06nXTZZleSzBG2IWpHviYdVI7puLtAe24YS4GrgLemQ+YpYB1ADfCmmnjLHD3urBd2ddFjKnsgpSOjgfcoTl3e92FGPruNIeiHJty+/fS7jParF8KbPoz9ficI9t2h94EWCcc/u17BGdavRrYevCMEV5Gpc9cmXa6zxyWbGnfunhiSoMVGW3elIU+VixKMLcAvwZ2GeTefN2cX56JSsimOlPbboCQTDV2hBlKCcb/l++xMTgSeDzNvxfYdRIwfwIOSFFmZFj7TFe2uGsA3001p/RrRoBRLCPC3FoWxXxdsacCcypglOVCbjdlMTZycteXBRuCsZGwbf1LUvGB5EMJ04gRmGeOYQdlCvwwpTbtWi/+mJqIxRqMqev6FC12Vwpl6jPFmFJy15cjQxB2TrbEDnO8kWrBFqR1xFo1BHMDcBCwXLLhST1D+R+wT0pfTwNvVhT/ElrXqWxBI8a0Ihg7rCzmzQmUKcnUlmuJQGwSDgeOAvKZR1j/SOlIkPkEXqalCeDsBM8IuQ+wnResRduzltFiW26ElWes+UXOjARj+rBDszNyKJoiW3dy3s/CCMB68jfgt8BeKQKmEq4EY81y8/iMHaMNgLYFYJp1A/wnNQU2BqbS2jEjwXho/QNwaFFPsiC2tEaF6cfhKd5a5AF3k9Qyb1q05gptvTGlDVOZf+8JnAH8dAqgtwGXp3olpNrRHMzwW5n14B7gvdQW++HOE7RDgf+casJk1z1zlN/dyndtlXK8Yufzj/nfFljhf5SEtJU1neVUZRp0fv6ia92xPvmeycD4nOejHVK7nRsLo8foErx2TW/TGQv9TXG67bILNp3k07xCfJzC31bWhWZRXIynfAv4ZNfthqZ6l+/I6SS/L6c0U4zw9cEvCX4use31C4TprqwFfh+zs8sRdifwS+DFgcq5Jc+fclyX6fMjYDwdImnuUCcv67/vrRrTBVP10m9h0mzg2nSwm8q8UXBa+kpQ8+3rW1jGlyZnChgj8nZgj8G3ubxSa5MNhZ9WPEguSBQ0BTVTwCiadclOzi8K5ciHRFvftwHPKN2PmQRGsa0VuU5k8XOt6z5Kyt0y08B0Hwm1DgaYWqUazwswjQWvNRdgapVqPC/ANBa81lyAqVWq8bwA01jwWnMBplapxvMCTGPBa80FmFqlGs8LMI0FrzUXYGqVajwvwDQWvNZcgKlVqvG8ANNY8FpzAaZWqcbzAkxjwWvNBZhapRrPCzCNBa81F2BqlWo8L8A0FrzWXICpVarxvADTWPBacwGmVqnG8wJMY8FrzQWYWqUazwswjQWvNRdgapVqPC/ANBa81lyAqVWq8bwA01jwWnMBplapxvMCTGPBa80FmFqlGs8LMI0FrzUXYGqVajyvBHPXmPEsRnzQ2IcwN5kCc5n1OU/JS9cjJT3DAAAAAElFTkSuQmCC'
					}
				})
				.then(resources => {
					for (let i in resources) {
						const resource = resources[i];
						
						if (!(resource instanceof Pixim.TextureLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('spritesheet', () => {
			const res = [];
			
			const l = new Pixim.SpritesheetLoader()
			return l.loadAsync(path.resolve(__dirname, 'img/ss_1.json'))
				.then(resource => {
					res.push(resource)
					return l.loadAsync({"frames":{"ss_1_1":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_1_2":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,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","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}});
				})
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.SpritesheetLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('spritesheet-xhr', () => {
			const res = [];
			
			const l = new Pixim.SpritesheetLoader()
			return l.loadAsync(path.resolve(__dirname, 'img/ss_1.json'), { xhr: true })
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.SpritesheetLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
						
						if (resource.data.ss_1_1.baseTexture.resource.url.indexOf('blob:') !== 0) {
							throw "not blob";
						}
					}
				})
		});
		
		it('spritesheets', () => {
			return new Pixim.SpritesheetLoader()
				.loadAllAsync({
					absolute: {
						src: path.resolve(__dirname, 'img/ss_1.json'),
					},
					json: {
					src:{"frames":{"ss_1_1":{"frame":{"x":4,"y":110,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}},"ss_1_2":{"frame":{"x":4,"y":4,"w":102,"h":102},"rotated":false,"trimmed":false,"spriteSourceSize":{"x":0,"y":0,"w":102,"h":102},"sourceSize":{"w":102,"h":102}}},"meta":{"app":"Adobe Animate","version":"19.2.1.408","image":"data:image/png;base64,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","format":"RGBA8888","size":{"w":256,"h":256},"scale":"1"}}
					}
				})
				.then(resources => {
					for (let i in resources) {
						const resource = resources[i];
						
						if (!(resource instanceof Pixim.SpritesheetLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('sound', () => {
			const res = [];
			
			const l = new Pixim.SoundLoader()
			return l.loadAsync(path.resolve(__dirname, 'sound/a.mp3'))
				.then(resource => {
					res.push(resource)
					return l.loadAsync('data:audio/mp3;base64,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');
				})
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.SoundLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('sound-xhr', () => {
			const res = [];
			
			const l = new Pixim.SoundLoader()
			return l.loadAsync(path.resolve(__dirname, 'sound/a.mp3'), { xhr: true })
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.SoundLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('sounds', () => {
			return new Pixim.SoundLoader()
				.loadAllAsync({
					absolute_a: {
					src: path.resolve(__dirname, 'sound/a.mp3'),
					},
					data_a: {
						src: 'data:audio/mp3;base64,SUQzAwAAAAAAb1RTU0UAAAA0AAAATEFNRSAzMmJpdHMgdmVyc2lvbiAzLjk4LjQgKGh0dHA6Ly93d3cubXAzZGV2Lm9yZy8pVFlFUgAAAAUAAAAyMDE4VElUMgAAAAoAAABzZV9kYW1hZ2VUTEVOAAAABAAAADcyOP/7kGQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAEluZm8AAAAPAAAAHQAAMPkACAgIERERGhoaGiMjIywsLCw0NDQ9PT09RkZGT09PT1hYWGFhYWlpaWlycnJ7e3t7hISEjY2NjZaWlp6enp6np6ewsLC5ubm5wsLCy8vLy9PT09zc3Nzl5eXu7u7u9/f3////AAAAOUxBTUUzLjk4cgGqAAAAAC4ZAAAUgCQC0E4AAIAAADD5XZL2rgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAP/7kGQAAAKDC1O9PSAEM+JZEqwMABJ5CY25e0ARM5CntzrQAgAgEtJuhqBNCEOI+wL4AnAOw5zIQw0DoUCsiZYwQDBIwCAIOKOWD4IAgCAIcQBgHz//iA5E4f+UOf/ggCAIO+D7//l3iAEHdYOAgCAwEAfD4bQAZygI6P7xAwRoccJG5QOIpeztd7E2vw/T905xEQt0RERERBYPg+D/lwcUCBz/WD4IBjAYDgYDgcXgUCAMBAAADMfASMDBs2b3wMq1HiAMESBRfAxjgSTAw9IVN8DaIM0DESJjwMQAMwNA4rgNEhCfwMCIhwMD4EwMv4vQMhgn/TVgYehSASKkBj/EyBgUCABgmCZ/4BIBgAgABb+DeAG8YX6//DlxZIs8P2FgEcjr//ydLhFUk3c6Xf//zVzphNgQDDf/1emAUCgQCAUCAQAAAAAAAyxKow1iSBAuDTkmAoUm9BwmB4aEQMUisN0xrDAFFdTS2glw8wA4l3gC6AXhPuewuTibDV/mKNS//LpwvF46YgIAFJySmkCwWOIZGOocbBzYnm6PHrDye//7kmQMCHRPaNY/ZWAELoGZhe0kANGJZ0ztpHTInwemYY0Yy7Uq284BZaB0Pw0B/BDXYdRPPNUlWNN5e99Vcw9VSk38R0cfUsbbnvmupq5hj+qp1nbo++l33MMddsPPtqrqdLmTDKUi57NJh8r3ui2VT/e6338sio/Yy2TdRP7//Sro6/1Hxe9ZchGPv1Gvimr/Np3/qAQABM2lcEtyYo6aoicFAawsnCux3NYxqVSp/pePDgJk813woQ5YtDXHb8Zv//9oAAAJcCA91pTHmwoeGKixiZUc6xHcvJnpOwqKy7GNUdFhRN2YkzpBMq5HFWpAOwd22di5haxSREQWDQfHQ0JROFydJA5VNlCi1WD2WnI7njAgYQUJjI1MnrkicyshHnDKgoikf4vZD6hlkdOkiEfzKnqS/8VCqXsNS+GXnh9EXT4LHzl7LdDgnr+fv+XADRaOgbKwgueCDnD5GANYeDAj/ijfNPNaaRInEyFECCN6n5JaZaNVAErMbzXp+cfdrhgcWmNBeCDGY+xRnQUmJwav6DtWa166+rWLMv1Prlb/+5JkFI40nV1RC5gb9DCiOSVnbELQnXNKTaR2wMIIpNGxsZG2WdMBUDDKQQ9KNo+PxSUX2t8uZzdHBLkuS5LXZhqTBWes3axOZ97+P3aW7h9DjRS3GjnaOcjdHowSwNmw8bsyFEleTnFE8MON3SiKgh8jyL5XsUnr8Qz+3yyz5f2Y/53/M+phijSl6dQ4wgAAJfap6SvEGViAI18jY5NM2zlxtckCb35s08lV5O8cnpyIIHEECBoO/8Fu7xJFwAHxpu//+Ur6JQIw1LOoVDy0oyEgDBqM/e//p6SNX6alfeVMvWwhAiWWhZayl+fvJfpdNASIxWBZEHA6BJEBSEUoUu9AmjQIECEuWjKMcLSlI/vd7Am8qykx1VhvacvynSbvjIq1uTl6QYze6efhv8jizy2Y0Q/4PogmHlSOAjekSzxadwIAQAIAFx5Y6qypeMtMSNDi48zw0Fj5MGkzBe7AMN5TMQAoGsel4knsL//0YcRKogXaAQACgnKND1FnSPukoYMBGEKByzSYuQAISXrLqtuvljfjjuXYISIVXZwissK1//uSZBaINBxO07tpHUIwofklY2wykjGjSG28b0BlA2gQnCQS2pR+C7aTaQIDIaEoiNCkVIl1fXm3bbE2JKocqqevqUE2Wo1rONSW0t8jMj9vVoZk84xlIV6e82/pMd/mv3PPYj4RlHgvjp1f7+6w/gyqtyqg7r8LY//AIAAoVnSStwBkYkY6VO1EgMNmABbLmUi3MyraQCAEBSBoCLjrUfS4OBgLEg6gSX70gAAlupdfByK5gCIcVTGT4p0yyYoABQACAKDo2+LpIqIqOSCOApAEoBSDl6bTRoJvmgmT4a1acROjdVvalY1907fPXr58+knfzhFBOQZiDMYYjWE9BepLhgZKMCyGhdIYuKZqUZDBpbJ/YRwUxj46FKZCE/lnDL+kXkcecH55Dfn4AwY8EosZ4X2z4s7QEOX/BZqgBAAAJYp8zGeMGjJTIDheZK+lg+FxEp/TAIBTcR8VKYyjm/6p5OcauZGZiSfrHyACQSKajQGJBBgIEsZaymQABOADC5OBgCwFlYkiCSlaYz6SclKZNyhlN5MZhH1asXLoV6xyX//7kmQmDDRHYdGbbBvSLMEp3WGGIZCJY0JNpHSAs4ZiVczMym5ZaqkSYxHVU6s7Nmb8y6qw+Kp+x2MfbdwxfKpLmuX669P/9R8xOTHw4evyAvd2JFQhYeD//Eg/Qwdg7lMAAAAAAAAAEULX+vAAQNUVNQMwQLJkxD4tf1////////////+MQtvNJrYSfGgAtQYYDgWZ4+mafxgdKGNQWLkA6DYCIlpmBjCVoyFg4HL9l+kxEUW/kjKV3313t1k9+LSZu/Nnhi5Aohei6SSBEhcgckkkm6n1EAasI3ZnHubygxZlbMlO9N0V2KnD417nl/6EMoOnyQvHDJ/p//7+f8RPdz//gr4ZByZJbOK1hM8pzSwCI2pwZNqx1fGmTKsZMDJYJphgMGFEVhGywbDIMyDM7fwiL////////9H/b6kgJybdcNNDKHxnuHr8Y1Jznt819579yXdiTOnrdN4HUyOGETSiKC0UyBosmQhUpy01pUafduznmPRk6uL95Rm7fjS7/eaae2S7+/d5Z3M+766vTqe5gA6ICJYj69INfojEI9H/+5JkMYCzomjVGyYUcCphCZwDOAOPAZVbTKRpWMoJI9W3jWOPSj8nzpg9QXI3k/UiuztFYkAAAAUAAAcqTJMpU5pzqoIpQ0Tqf8ZjMG+j////////////U9dyRtfFG0CAEACUnJK9uX3KsGF3gCcc4JZN45X9TVu1kQJPBEROEAIMZ87BwYCCAwADwOJmfG2qhlYnIWOLFmZax90uTRCpxSjFqco4PDIQgIJQ9FkNFK01PLYjKlkh5Ku80QtaTIjs5Qkp0tlPzKk9LBVKHNRPHX3P90BuPEQgSrJIJUSEISZ4xnHap3lsDosBE6QaGzobXwOplUwxBvEvKQetKp+0xQwqhTaIWQABGKoQBoAAU3JXt/meFO4D+x0+4lrZ9XtyvWvakIlvjQJz62v/867vCUwql/13d3yex1Rjn+7mlZhgKwCFZTOtkadTWNahvy2ZNWUnUKd4TmVpPDv03Qv/y3hkf0qiH4UxbkfyDKqYZEn5H8CQXCNhMFkgCAADZuZw5D67AKDhYkNudj7Gcm4tzm+z8+WLqG3HIdA3ECcAapHb//uSZEuAc3VoVlMsGsQ14uj4beJKDgmhXSwYaTDJiqPBt6EiXk03QQcKCYlgOt7kwVUAkEBVbg7/pbaRhqwDNgLMHo0gZPogTJgMQLCUSI3/4GOAAA4CJzUp6UyNYuZj0ifOwOQoWDRh4oMzJNZOqU27DUnaLlnYeewa08lyM7MiBLsdznD8wQkv/5U0IOXxDL/HdOF5QUgmmZEnz/ZC8/B1zcpmGmgmNp5x+6c/uHDrhQWBKky+ljKl++J2ZZQD9FySZLXEHhgyXLF3GKaVakq1VXXVwAAEWarWq8VVc4NSB5DoAptwWYQAgVLLompx2fxG9ySIM0cmrVWZsSqPNeUFxaUBy3ObcKev1bLBRKil6uXrigEZnyPnHVazg/2OFzDKX/1alzam9P+H9JXRARfohlzpeDZrmetukPhVjw8mEAAH4fVlRiBMZ89HkFJ9tBYlphfxkbKX+nF5s2VCtJlLuwnrRAuhTm9qMLFfsbsAADSpLZp6zXGxHwhxNIgREx8jIA6hEqU3JzXi0jQJojRrDZAqrFBoqBvcEOxrUiqVsP/7kmRmgGNfZddLCRl8LyHZBW8mKk3xkVlMJGWovIYiRczEiKe2OTGvSLdSkhkQLM1+VC6m6tZ2lD/yahmMZ4tcYl+hB+E7uQs9jbP///utn/b//9aIFY4eK2xeY4PgCuoAg4MmIyeZzb5905nSoGVio+YivgzDCwYEeEcB/Azgz/4eb////////////t2bnVoPuXTLNVQTkDckDURgUItybil6t8KIkcQsaJ6cdwZQEQZ2URkMbyQ3vmDDi4D5IJdrvpozyGX5ohkmTjWAwVlShVAGDeZmlM83SD8ORjX/21HJ/yntYez5znmv/2/5o2pf70/+Udlhf9QyNezotCYAAAEZfQxpROHHm+GigbycrzJ1KWR+QwM010kU0ckQCddVn2////////9Hf6vQ9P+MIMllta+YQ2ayKGpDm0TWmVYmBMCkLlLtaEwhrDgPJaBQnRIEbYjtuCkZmKdn4ccq7+HTIaSUhLUXRY+8H7dFTI4W4JyoSqeOEBDC6yg/eTKIAKK/BY6fiRxdmSWBHFQjCwOuJYUfYIixHlHTgsaw9gD/+5JkiIwjd2dSE2kaKjEhWQNvCxYNyLtMbSRuwGuCqiiUpAYAClgSWHgwgQqqxS4///////////////TVwAARaqrlVfkNRNaARPkP3rHHyqdEikQ64QnvLOQPOENkfbjZtZnTtAyswAAdalBou5jwUgYnBY3bPh98KcTLhI7EQ7w4LNTjvJ5YU3FqUTbVy/sJLvT/Tz98F+2D/Sp/xP4OG8Kf9NCxf1gfHiAAQACIh+N1sKME4hgQ1+CSVFVo4oABwCAEt2/lfalfkBDhUqSQsMiB4y+EFp0UhGFQiC8kG765+tRVVXQTZf/9tscOAC0y2aJAQIw+LEOJZkLd7SBCyMbXPvDN6XSRrrJIuZpDVD4fETLhc2Mimfw+popltr/dJ/y//zNv4aikI+haBL297SScQAUcOwVhx2LYQJYQp/Luf93XqSOXxWNq+eUUx/cmNx3ECRRLEoFYmbd9KgAMACbk2/hXcJtjRkOGhGtVUsvAmCrSNIUBgiEoJPck/o7vCMSGOChYVzEKw4wYKA7CsW1MjU3hupU5sTOptF2mVp0///uSZLKAM2Zl18sGGv4UoQn0GeYFzfmTVa0saci9CuOBzQzoumzrs40NU9IWU/pSLSnPmsI3Lh5n7AjE/9yWKSoW///+n/8HCkC7wE3U+pAAAMErWALA83vE99oyhMZCLsL1RNBi8liWIYMATGAJCMWtnepRxfjfBwNSA6m1NCAQRSo0BsCEgAxU3MIvjXSIxsWU5QcQQNIQkIqIhoCEHqZoTyyh14XDkDy10pq7Tw7Su9II1BtBGSNKCT3JE9gi9TnQnipG5g16y35r5+v8v3jFclZj5pdKttr53VDPreiNdXaZJX2kufNsxfkap5ctZJnZU0M9GoEiX7q6BpGMyXJT/YFBAz9P6W3EAcY/TmhApoengxNR+Gn7Ura0tGUMudokDuUDknQoipEKT7EX////T/6P////VoAb3llzjUpfNJRVAIgKjGDxCZdTpwtbnMmCZ6KphMCCoPMIAIVC6/x0AhgFEICXW9z1MzZy8rElVrQTC4imJ0vOVFjMilo2Mi6sbrbkOshgLokS7SOtY4h1TQNU6V1yGK1vyQopsym37P/7kmThCGN6XdVTKRpAL+I5BQdMCBClo0JtmLcA+4ejzbwYoE7MeWtQp5hC9IfEPlNznbSRvyhrmd+nRh1y4i5S/S4rkv47GfOkgbIHf75sInAAASFZUYkwPCHjkGnIJWsaWOtKPMid6aBAaJgGxWK/qf/////dr1f///6u8uxNAuZAoJhB6G1xwjia9R1tBhTCjFQLoy9OVOmilLLZbTAyyPCiYSU9RVDhzfbGu0S+Y7/W0Duq1qFaKeHme/bJc6ah3+NF55ecbabGTZ/wPd+//52b+sqabfONHZ88u2NQrPu7n3t8ffrs/h2z6/2NidxyqdDt0287TKbH6t7R/l2+RK1cogEEpRMoaP3WDvNFMBwEljsbS9hYlIhMq6SpniI+HRw1yfXvaoU9V5LWx9/Lejsk/+l/jeWs+jR65P30Kjt+SOVOE9zzzo5vMSDwwUCDEAgHRGYnBLaiEEmGQeqs1GHndAoBV+jEg8AEDwkEzBwH5QT7mZscUjKjZ+vQVik7VrHV7GHmestfZg9/oIL0bfnoWaUj2yhzNUWQUGLYUUH/+5Jk7giEXGhOs4wcMi/g+RNnRggQga0wDmTDQOsE4tmsJBgiI/14IVyrJW3CSBFCtgrTZgS5BDFSlFIukgcqh1NicnBEEFUoSonUINahByZhbyCkCBajWpwl6TmRkiGpjEJYNbMTOLI9zMOGMArEtOZXoCgMheCYiYgLAi4whAKpUVkfscPUy3b+m/6f///uR/X/+v/2TnZyNowkW23CKQCQyKYBzHd6nNVg6W/zcHBQpbsqmthpjVYDrCs+HkhPiGcD4YB+U0zUcEL+rbv4cReigXUWLPgifZhDnEIUUEZUKOJphkIQwxnkLJw4qFuRv5PTwWbIIVJLAgOhK4pMqTzZ0IIzlGy9CJrkRA3UaTU0MjTM42QYUyWCCBXQzBa0G7XNFHDXxBMkgCAUAA8RfwEiCsz14BcTMuuDEhOJUSFG9NPFGWKOJvX///////////1DyGZ+Rk3NAAFgcgZprINCAXGZnQ0mJpcasDBeNmsYcl9YQvpFIu8YBADACIHhgMQzWvdouTUtljWoU6LVKJojNH2KcVFkZk4HTaodKEYr//uSZO+IJQhqy4OMG/I3IgiAbw0WEeWbQu0wb0i/BWVphIkQsy5mEitJoGVDdOoUFQxN7WMW6XKA/lt//jZq5158/mfHfJm46O6sbucjoqZSWwnc1iJwm1I0K7GKRoWQ4NoNSJx9DpOHY1IwVHg6hU2JMzoAEwswPrKMLRE2GOVzRZt1nfEqdeKYqnkxZIXvXvDv+HxC8SFMcY2Og4yEfjZ0MMsmMMNAOCzyioCSurN6luWjT2DggLA0AgABA4HAKFPTI4Dct5GttKcGIMmi0IjkfSAIy2DDY6iVRDwmRQuCGIxadPakmynB4TIZlUEOZsFjzLg+dwc89qjMTNjn5WIbUqsd7wYhQzgoTlOrpMwBB6C5uKlsiBHXu3A4VmUihjV8iAITrB982cAyQAACBbYhw5ec17LBkzgMtCkl1JAgQLps3VveW///9NUBHUBC4z5Dj23kOZv82QQzKIKMVhsmBg8RDDwWMNBM8zjO7NJsItNpNcws4huXIRXDhVyCwy3kATPl1rquxNdTV4g4zjuJfi7+vNJZI+NM+dO8N6/Ffv/7kmTjDhSgaE6TiR2gJeJIoGuHKhJ5BzguJHaIhgUlsFwkFE1MGR44BYMjBgoLDccQLhMkiVIDAxC2odtmHMtILU5pxRrJ05Cy0O4TrKHvWTf2l1C5VOP0t7k+EUsyXkt3K5g7KW24XhGUVPXi4pmiKPS4ZLHSNkXdpgetWwqfmWg3FRQXHjKYChJAAAAEAtI7iZZrWBoIVNqyxy3+Rg2SEyaF612///////V/////p//1EQVVIQCIy8GTp5gFSgLDIICB5KLEFCG6YOAmsl09CQ0DN+8sSZ0+ztw7NTUfsUtDJPHJcAkSzh3RR2JLyiRE4nk70SKuRUUmi9GyczIKKw8wx0i4JmHs6U7zoLLIqPNglpxCnt95JKTzjz2ws86y83XQchS0NaUiOYUSPPTmnI4bm4izQimh3Iyd6joGNuuStJ3bGx0ZAiExaLm0fh8I01HpHpOwYgDID85MpMPJcxwLszSdE64sVMypU0Jlho6jrZ/5FH/7v//////i3oV0+hUAgIGWsEGpZsHPWnQQhcQXaWeWtZk3oDBYFQAjAqT/+5Jk6gwl0mzLA5lC8CvBGV1jCRUUbaMyTmDFyK+Eo8WXpFTEpcKhYB07DZ+IgMGBETPXGmSdRll7kJQu/SrS9W2mVRoyvmymrbDJChPEAURwhMrLSdrD0sMDQyWN3or8DdmNgQInomyjEcILbfNRlj9B1jRCXIL2C2WVZ2BAVksk6aREM22vFhr4yoKUWLGxwlzqptzcuDMxogT5mUiBxIb2tswcT1qDCJo/rAWe2vMmVjiypQi2PQtBkZxAmvQ1ZyXZhLtB9OLAS1FLqpX/ddV3f//q/dr/9h4eAHeVpj4YciIYQiCk6RaMifDluRecc2ICBGFyojRozAED4rHHLsiJGLlSmirlLLAcYFzB5FBiKNayGjFUhJEaBg6ssRozWnUKCaGUUSiJJR8juZ2UzrZpEzWaQOTQOmgQDlnycPkS0ka3IBnWLanazkDJ2DsWptHUImlUQWW99pR1pqKIXnbRpm1CNJAWm2hPEspRwqzcmDBzdhiLwnMUTlZdAKDCZwlRRGCZRUmxthAnnADoDIF4As+JigEz8JC2CCVGzU7A//uSZM4IdaNsyau6SDAgoMiAZwYEFlmrJq3pIQieAqMQ9jAAw6j1KTbqfq+3lej/vX////Of+xUBDGT9Nw/wK/08XTTaYzMjHAxCGzEgWBVhJAfgS/DDDQiBJrJ0BCGi/FkIqJ0Mxmp6cfZLt34w/squNlWvKZWWQliA9QILAU8ncePoX86TULNZBtUpMqcjErhGhfa0jpmlCRgeXlNjGjTc9Ro01JCg8KjR4wY4pFQ+fn5wkWPCkPFzwwVkVNlByRw8KQwGhccPmjBkPHoUYhxVC5ZV2biZrmRUcw4aLzGccUiqT6iQdcVTggIiUks+jKOxD2dkyfp5JKUXLPO8+kipQBAAAiACJhnucGhvNCSCN76OWBZkG0BIysSRtcHybj6f/p3dv94/Rq2KzKweLAUaMrHCAUPF5DzFYygwMICFdKKrMBAGEBIVBAsGq+AgEXwDhNazvwczJurSJ1a82/663bAoBwwKQsPhg8GTQJisHxQGioFjYwWotwxHRwcLlwwKIzA4whWXttCnSshM6M3IkKNGTiJGr5PQWo4ueknBNf/7kmS1DDZUbEmLmUnyKOE452MpBBfNqTBNpNVIVYRk1JwkFKbKa0TqR6/CN+DyzEMQp4g00hJpHCpeKO6KBHSSuRIdAnXnp4oihCbNJhHQ5Amojj7a00iNkVmQRIAZN0EjSfgpJgobTMWKZFAPDL+LWMTQVdIuX8siE0zOmODitSoGVJNJAnRQIDBOabRnd9QOYwcAs5YhFVzPGj2WndYeFAcLMKYFff9sKyWhDEJEEWqhuqO7sXMG0x/p0qPkyY0S/JlfCSJkCH0wcNAjQCRNJS/I/dNR1EigQJoEiEpxTTyLkVpPvXcIOnJx4KYuz4fbyS8U8/9J/BlTVarbAwsgEKJkQoogX1FqK5AGDLXyRRRbUW2l2Zp3RLsqOxI8mlumOKh/SUlscmdmQzKgEoAAAXaheoKKOVRQTml6+rCxYsfYW8k+SvqpC2t4Aha5jXek5AvM6GwGxk4KomcXILfgA8TZC8K6GgvK4Tx0r+vPE3FEAgF0CEqDSMCV7hYMGzVz6IiZ8m3CEk/c6v2YNbbKBH7OoucTSt5pFLFci95Hs6f/+5JkkAw1W2jMk2w0QhqBSSgjDANVZa8wTeElgJ6IIoGkiVikx2vUV4S+whJFzxZbU8WvJbqlMR85HVLhO62PnnlFvH9Tns7NJdBZ9XmSGnInZ2cNcyKGzkE6OFTB04jFZYnULigF9OFbVqzJvnzlCpB/+k9byqgAGG8zHLIGRBF+7i734aXAQdAyKQ88jegemm5L4Fjf/nUZf/9VAUyBAGpLxvxCezHGxnAJAxIwURLZJZuWvJtpJI3Kl9JADk0WMamtzs8Fj04WwI3pWyQvQnDrkJEiQI2EDk11Iem2YMObmvSDdyqla2atL0iTWZaYvMiixZVXWu7kpE9zyYG0nppEqFJEgQJ6/gpReIxUb1bzGRyLT3E9N7SxV5/Si033ZvbRr2y8Ul3jzm3y098N9io6DJw+83QdLIFaq2+YW8ObM2B2EIXkQEQsWLVoOqazHvJIbgU1stYM+a///z/1f9////Sn//3mnnHpxE75kDr1li6ptxaYGSVsLk7SB7CxTQVNtZORfmiz0JCCzbdrmAIiohFRYlEK7vbKsJoBdVcn//uSZIKI9QNqy7NpNPIrASiQZYgkFNGvJg1lIMikgeIBgZhAeLllnKvvCzKs8cgJSecVRIogHLiwkgMqbmbG2z5hNCeWC1sr2iFbKk7KgFXlTbUYKrks8tFmMxMq0e2yde4TUD6yHUUGdk0mWgjQuvzSSUm1EhCqsMmoo9SE+3bonyJB6ls9kVUdqvWWt2MYDChwwqtzbAVCTACeYXzCrkJrY0vp2s6dH0O/NPu1a/6Zqi3b/0qb/92RQAAAVCsTC5kdKMvQyfGZ9MmxQoeLWgvTieMqKIkBPDRQhVkiUVm7FyTsnJl2miwIH1H6HlUTus5Qoi1g/RSaEufOEYo65nJGmHNHtVf6hSpc+3DeYJnKMIWkdqoliJFWZBpemCDMKEMVtmSk3yUDd6TWqZsPa4YlJuU8RtqFkKRo0ooxvQvUR7CE1U9SeRQaXraQmyJAZWSI97BNNVZLoMPPMmyZGNYdgU9apDphwpVHaWFK7H9zL+l5+ZUe7Vv7HMa79lP2O/W2vpsXGhGhknFTjKgFxCZBcA4JAmjXJ1E6ghKELkm0ZP/7kmR0B/UDasmqBkgWLIAYgCRCABRlsyitYSAApYHiAPYMAA8+TqECaPkM01SE2epkVqNq7EjgpGmCqxReoI6xyqNCosTPORRSuYkO5E+thqQpcgFcFzKC00Vw+5lB5gztolU2oW2Wa7aPWE91pbUK01M8zq6zSkpzJjbfZI25Jk88pGns2ulSu9Eks4qdblPE5QPwIyjGqoY3bTTt3t99iM+3SlH020NSYSw0hNB9A+zBATDBi6y58uRrV236D1lfzPT5r+5Uz/2uxtOl5jeo1/+rwkoA0AAAB6AhPHZeAdg8paBDGDF/O23RmgXEgfB7MjUmdQwJiaydiAoxwJZfLBhOtzEsTk4trizpMOWagyWLMHulZMveGm7gvDrInsjR5FMggYi7aiUUQLPwvGUr2eWUaYyaXUovX6et01oHGUny7ZNdYhLZTShjP2QPzCyVZT6bWyj0Gdccs9I0xTkI2lyjqnKJy/1E7CCkW5RXTwAgAI7FvjFkiksAOORyaUZM4X/iOeCapKi+WEqd/f/VSv/Z//jf143+7aj0/RqCQAD/+5JkZgi02mxLM0wysC4BWJVhgxiUdbEuzT0lALIEopWUmIBAMrE3kCrQyugyRcbyRWXNKqZBGuZY1FUyY2oiRJoVgvVERN3EveiDMjpsU8oaqdyi07W0DKOcptLKxU8EmdbpD0kLaaWMwaS25strstJ63BFSl2lKfa9S2kVz7TKqGTDMZVDNi7caYVZRRuF30Tb6RVLGe3iTlvcJxj5NuqDihUsYOHYB6IXNCgzpuFQMbEwZs0LD8DFzCxkpR854W0zr4hU9HpWIiwJGW2DK1kKMkCBD0HfeVwFl9jLsb69Vv/9f/3f6Cf9BNX9y/YlFNQAAIVCBBqFa4hLH5zgDWgAMoPgZFwCiwfPKzQ2yfYDQ+XFOJaWX1hyZIphQYWwiQMNGCocV5Aqsib+20uad8ZodhA/gfGhJABESRIFJ8GJgoISDkCW13+4G/Aetr6J3J9Lb2chvMjela++bJ1kyMWIZq9w3sBhhWv8vtPnJgmbL9IiUiiTUfd1ZMi+INsEzZakzT8OLss1mwERETQHkl0ofQFxWHSWRSrcoiddZoVqS//uSZFgI9MVoy0spMWIqoQiQLwYCE7GvKQyk0cCrgmIA9IgQrq9+/r6a4vq9n+v//9/X/7iW6goIALbHEAbZhfprr/QU05r2Xxm9drQfepJbSU/zxVl5WC1mhSPYVqyJ6ASmZl2pwKsJNXM6gqrQMT30aQoZIWeB8hFUFbg9A3Mu2iKoCw73bSTFoK+S9gcJFLQJVEcK3JZOm6KBwABsewL6VJIiQUga5GHmboruww1U0WYXZFHUdW5EboHmbBfokdellquN+BMGQKLh/iB3QJc1aY600RvAiyiiuyAmDzUWvO8uurm63L9ivs36vQ5/pzNGrouvFGvxT/TFWV9/QgMAAAA7QXKd7pQCKHlAp5LVaWhS6U8ghbrsI1yxJcImF9SaMLKKJ3NbZMvmvjeoyakCBxRJzF4gpRkwhQYcCmEyH72dtdFPGGkopoFYtShNg9qJUeXdqC5Uy0LQvzUQJk+pkdposRtnpNqocOTZUXhDECJthaPlOohp7HktqjvNkkhTBMi1NW3zQQXrpO0pHCdg5HY2SWmvsb6+oIyAFDI2Av/7kmRRBfTrbEpDJkjyLSB4gCRCABLNqykMpSCIp4BhwJEIAKVFBjmM6W3KzfkL+5q9GnJUbCSGr0/QuNU7Zosp6HrSj6k6LbV657lAgIANrJJpVHxht64fI24sqM1FlQRws2PNo1sTIECRpA0En6zWXJhOhtfZrUkulBttLoWNTbSiW6T5FtZXWrtKdWDCsvWjCKeC6Wi67Tt4zGWtVds+M4wvFmlo5q8ZMUJVlV8ThOc157T+gFnW2igNKbba012WvDWqYEtbsESmu1V9wYGGFp0ni7FTZisw5UXq89THnAQePBUFjjeBH3Qwkx73sW1detK7+n3u7vbFnO556PLj+9dFz+uf/1ejsbQiKTuaYbiKPNBLgou2jBGVKwGxyeRQ96j0MUCJiJ9FqUgPZJppStHe2vAYc0nJCNpSm1juPq4ekmHupGTNJVUZDwjBEHQzbMIUJVWItMKRm2vByO7ZirUX7tcQtFUJmqQauNJMReHCbBYYqkLb0arIna2mG4r8ijrOsxSR0kMNFlRdbGEUaoeHv2B7EWqnsGy7YvQkLIH/+5JkSoN08GrJgwZIQisgqHAEAwAULbMnBJk8QKeBYiAhCAAMBtyBRlRH04wZyHmDNBqBBMk7CrX3zu4un1u6e96DS7NXUnZ9N1xBdPX3al2tTx272Jo3kAKAPkJ8GFMSo8NCQuW8NPCl+rJXmo0BRHUWIGT7LNNtib/YEzUFnJp2RuCkcPI1JSZhfkRv8lwDilByEEAfLgRQIONAiZBNdqJlxOqQwVkTSbLmFZ4QNN3G3xLpVBIw7BUYYil3PchNMJIINryWLEC5wsjgkiOloUo3UlSd8xUhNIyZSAgZcS3UZlJHqVjnX1J+nTLSSTKBOE5FyrRZHrcwkBUG44VJgMK3vAOh1vU/u9hxvQhS/5L2vSu7+xVsvXh2j+qT/Fcg5nG1CCIQgAAA4ytPRL6JdCyLVqiQ+HiqBRlDNgurfcTUgMXNBYfFQb9FRkAkXrUgWTSK3nlI008LMLujyzBdoomOmSIo8pNMLleFk70YQoiRmUacnJMGc1KIIdDTEDeggYm5wW7NhNzzZLIrLO6OuQ6B58Ls6TXOU2IkkybppEIZ//uSZD8BdOJrysmJMnApoihwDCJSFUmvJKeZJUiggGIUYQgAZYWQRRWWXqajzziikGwglZp5TZ0EYRStRZiJZTEb32HAHi8azaC16aU1xDFOQ9Z53//8boX641X6bP7djNwu2ftfR5nsUdqSAgAuqNety3o6SyJ4CCDLgAAJRULIaFYl7lwdaYMuRmWyVPCI7FCgD40TSnAfhzDJhNxIQlDy7BKjcVEsiEuXM3fVOxZiSY5BHk6ijfBJqJcyqyqmSmlF9SXeN09KZNBGIzTUTZIGUHzUoUzAQoA88kmfbFJVmV8YL0Ou5uItyZE1hGpVKjqFCmYcjktA7ZIRgX/NVvDChAwmgqjQrtdEKjD1baREMFlELIAINegVHHnNBVval1S3fs3OnfspnDun1P/ST8ae9b2bEPq3/4ynUPq6VQAEgAAYJ2ctEmUtELtlEzUDxIAAWHiyJxSwlAsixM9SaZJBRSzhSU5LvpqRphAhKzy1mJzGvrHzBG8C0TKS1jc0xOjiZB0UNLJCkUasihpFyaJBJ9NJ2mY+Jnkl252cmRkimf/7kGQxg3TEa8rBZjBALiCIhQwiEBJ9qyanpNWIs4BiACAAAKc5PEUrQe02cwgkxJRAgsgfaJSKSNEDyCRskLSVjlnJkq6ePcIexiNmHOQSykTWOJEJZaRG9QAAAHKmw4XDBEUU+86UaznEtdkaE3Hvcf3xfYMOcjqV7uMZ6KXdn+720ztJP0kQLJ7GlbrZeMW3BxvRvjwrv2L43p++RF/JRvGnpKtOQkj/y51HnnsKdvip563OabE0DCPFJ7C04ozUKQTQZN6t0dc+6lcU8xofaY8AfTKZA6qkpNdlpp6eDp9yCykHJpESntByBVWnqMplxCUau00HpY9iAmD0dOY+OmR2lFnmZZKSY8xUxIVeoHEzjOHLLnDlIxWAEMAWJS7yQxjg0OCLUrfKlXlv/UZZRRoLSE/1HqP3p/YX9G+k76vyOQ2bFWUqIjQggAAB9YZGPLFRMWRHx0fPwXot5ZRegI6IcK27UK4ybgd4Lljgqmc2WdnSCkaiTmCBz+pNdJiB2KCeswdBZtFNrV1tRoqUpCyxK5vxEq9ZdfYqQY1WW//7kmQsAXTnbErJiTXiL+CYmARjAhQVryQGJN0IqIBiACCIAG22vOZdN6aTrQrKwbYkwHnJttpPZcjXOhCzmwn6UuSBNHZaTkpnLLknR5Cr6ZTkyEsifzPj1B6DCCoQOrNKTHkdQdZ9TjqgAACGQZx0FiwcEr6XV2kUMSEm+0dXS/O/RT+t3W8hfzWjR/Qt6dDfIVd/e/c0UBg+wfrYdfI5GVqXnhzcuYtnMUD0wLHYfUusJUp47eA7yDWqwOsa/FCvbtd8euPNqCMSqNk+WQNllrfiwTaXaUw8wgQ0oKLMybapUoy0sw2iOxLsMXkKKHrQzVRwKk6atOIk3TLF7J+tSUYq0ElmkCKtojWoyomKzqZoFkpW1CVagMIA5NNRt4YKhJMwSNQVcpEkJIwSIEJOs6GIN517JuEgA0MigAAAFSpXcSZpbq6f0rVpUjkF/lvkX7fuofYyol25tjtV++5a+9SaBAIEAAWevcuHDvustPyyulH1v449+VUTl5P+iXo4Z8ttqqs5G+sBEBBYoEXQNgGkUelz4SF24SEE/Z5pFRv/+5JkHwH06GrKQYZOci8AGIUIIgATTasmpiTPyJ6C4YAwDEBg2clyqUEigRkPUkSREDL6fOLGFSSRSwMGm2SEoYOBxqaRa/FyomRMOCCZ7CTQd3JW9KwBiUtDFSQombJuECYB08fhlkE0AgwiY846JREHwYsyaNPpEwBn8Ny7k0MbCSAAAFBQBloBUh5pFxC0UV0JW+8ppRV5Jn96a0yGc5KjQ3ZdvZ168JfbszTGUJvqEBAHTBhDaholOsXGVIVt0IrLIFjRdjI0oQpyKK6KXJLqdabUYLImB91wRNPQFTSC0Oy76QI34zurIXmTo7cS1GpcwkfpZSSKZj6bJIGskxpI7kRRJMkRQHMeRMmtLGSdAOhNoyWYaUFEcZzi3BnOL3KInWG3WOBZG6a1YnpMgazg26OFMOCUqQKCNoO0fD3ExHHYpKwk1KAXIQJByWKoNwraoGpgiVhr6SVCtGv0U/xXQ9Wqj+v/iBnv+5WY+igCnetCBCBkoTX/1ZxQpImlSVQUsCppMlgsigKmxSwinnkWjVbMsaoGTReEpNMCgUMS//uSZBcM9LBrxQkmTfIfoAgFCCIAjEliXgAAY8gAADSAAAAEScjQkaDDgVGubBIvDYJO8Ei0YJLI2iyRqiVycapIiUOBVY6IMmElEnO2crdNyUTrRp5k1R2zksSglaPapZqdEpJ5l0Yry1GtKulK4yVVc11kxSoCSgqaTQ5KU1poUmlXIrtJpCwitmQAQYB06wkFHz3Eoz/yv+pYKjSMOxN1iIrK5789//5IhlLLLmayywyJrLKhsrWWOSsssqGytZY5Kyyx0Nlayo5Kyyx0NlYGCBo5CWUEDBOjilDAwQNHQSwUEDBOjilDAwQNHQSwUEDBOjilYGCBo6CWUEDBBgcDVRAwGJVBgcDVRBwNTEFNRTMuOTguNFVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVVRBR3NlX2RhbWFnZQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAADIwMTgAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAD/'
					}
				})
				.then(resources => {
					for (let i in resources) {
						const resource = resources[i];
						
						if (!(resource instanceof Pixim.SoundLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('json', () => {
			const res = [];
			
			const l = new Pixim.JsonLoader()
			return l.loadAsync(path.resolve(__dirname, 'data/1.json'))
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.JsonLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('json-xhr', () => {
			const res = [];
			
			const l = new Pixim.JsonLoader()
			return l.loadAsync(path.resolve(__dirname, 'data/1.json'), { xhr: true })
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.JsonLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('jsons', () => {
			return new Pixim.JsonLoader({ basepath: __dirname })
				.loadAllAsync({
					absolute_a: {src:path.resolve(__dirname, 'data/1.json')},
				})
				.then(resources => {
					for (let i in resources) {
						const resource = resources[i];
						
						if (!(resource instanceof Pixim.JsonLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
					}
				})
		});
		
		it('js', () => {
			const res = [];
			
			const l = new Pixim.JsLoader()
			return l.loadAsync(path.resolve(__dirname, 'pre.js'))
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.JsLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
						
						resource.ref();
						
						const obj = {};
						A(obj);
						
						if (obj.a !== 1) {
							throw new Error();
						}
					}
				})
		});
		
		it('js-xhr', () => {
			const res = [];
			
			const l = new Pixim.JsLoader()
			return l.loadAsync(path.resolve(__dirname, 'pre.js'), { xhr: true })
				.then(resource => {
					res.push(resource)
					for (let i = 0; i < res.length; i++) {
						const resource = res[i];
						
						if (!(resource instanceof Pixim.JsLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
						
						resource.ref();
						
						const obj = {};
						A(obj);
						
						if (obj.a !== 1) {
							throw new Error();
						}
					}
				})
		});
		
		it('jss', () => {
			return new Pixim.JsLoader({ basepath: __dirname })
				.loadAllAsync({
					absolute_a: {src:path.resolve(__dirname, 'pre.js')},
				})
				.then(resources => {
					for (let i in resources) {
						const resource = resources[i];
						
						if (!(resource instanceof Pixim.JsLoaderResource)) {
							throw "invalid type"
						}
						
						if (resource.error) {
							throw resource.error;
						}
						
						resource.ref();
						
						const obj = {};
						A(obj);
						
						if (obj.a !== 1) {
							throw new Error();
						}
					}
				})
		});
	});
});