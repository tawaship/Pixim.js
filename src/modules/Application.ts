import * as PIXI from 'pixi.js';
import { Container } from './Container';
import { Content } from './Content';
import { Emitter } from './Emitter';
import { Task } from './Task';

/**
 * @private
 */
type Roots = { [id: number]: PIXI.Container };

/**
 * @private
 */
type Layers = { [name: string]: PIXI.Container };

/**
 * @property autoAdjust Whether to adjust canvas size automatically.
 */
export type ApplicationOption = {
	autoAdjust?: boolean
}

/**
 * @private
 */
interface IApplicationData {
	isRun: boolean,
	app: PIXI.Application,
	stage: PIXI.Container,
	container: HTMLElement,
	//frame: HTMLDivElement,
	view: HTMLCanvasElement,
	options: ApplicationOption,
	layers: Layers
}

export interface ISize {
	width: number,
	height: number
}

export interface IPosition {
	x: number,
	y: number
}

export interface IRect extends ISize, IPosition {

}

export class Application extends Emitter {
	private static _contentRoots: Roots = {};
	
	private _piximData: IApplicationData;
	
	/**
	 * @param container The parent element of the canvas that displays the content.
	 * @param pixiOptions Optional data when call 'new PIXI.Application'.
	 * @param piximOptions Optional data for Pixim.
	 * @see http://pixijs.download/v5.2.1/docs/PIXI.Application.html
	 */
	constructor(container: HTMLElement = document.body, pixiOptions: Object = {}, piximOptions: ApplicationOption = {}) {
		super();
		
		//pixiOptions = pixiOptions || {};
		//pixiOptions.width = pixiOptions.width || 450;
		//pixiOptions.height = pixiOptions.height || 800;
		
		const app: PIXI.Application = new PIXI.Application(pixiOptions);
		app.stop();
		
		const stage: PIXI.Container = app.stage;
		
		const view: HTMLCanvasElement = app.view;
		view.style.position = 'relative';
		//view.style.width = '100%';
		//view.style.height = '100%';
		
		const frame: HTMLDivElement = document.createElement('div');
		frame.style.position = 'relative';
		//frame.style.overflow = 'hidden';
		//frame.style.left = '0px';
		//frame.style.top = '0px';
		//frame.appendChild(view);
		
		const autoAdjust: boolean = piximOptions.autoAdjust || false;
		//const fullScreen: boolean = piximOptions.fullScreen || false;
		
		this._piximData = {
			isRun: false,
			app,
			stage,
			container,
			//frame,
			view,
			layers: {},
			options: piximOptions
		};
		
		const ticker: PIXI.Ticker = this._piximData.app.ticker;
		/*
		this.on(events.FpsChanged, (fps: number) => {
			ticker.speed = fps / 60;
		});
		*/
		ticker.add((delta: number) => {
			Task.done({ delta });
		});
		
		/*
		if (piximOptions.fullScreen) {
			this.resizeFrame({ width: window.innerWidth, height: window.innerHeight });
			
			if (piximOptions.autoAdjust) {
				window.addEventListener('resize', () => {
					this.resizeFrame({ width: window.innerWidth, height: window.innerHeight });
				});
			}
		} else {
			
		}
		*/
		/*
		if (piximOptions.autoAdjust) {
			const f = () => {
				this.resizeFrame({ width: window.innerWidth, height: window.innerHeight })
					.toCenter(window.innerWidth)
					//.toMiddle(window.innerHeight);
			};
			
			window.addEventListener('resize', f);
			
			f();
		} else {
			this.resizeFrame({ width: view.width, height: view.height });
		}
		*/
		
		if (piximOptions.autoAdjust) {
			const f = () => {
				this.fullScreen({ x: 0, y: 0, width: window.innerWidth, height: window.innerHeight })
			};
			
			window.addEventListener('resize', f);
			
			f();
		} else {
			this.fullScreen({ x: 0, y: 0, width: view.width, height: view.height });
		}
	}
	
	/**
	 * Whether application has layer.
	 */
	private _hasLayer(name: string): boolean {
		return !!this._piximData.layers[name];
	}
	
	/**
	 * Add layer to application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addLayer(name: string): Application {
		if (this._hasLayer(name)) {
			return this;
		}
		
		this._piximData.layers[name] = this._piximData.stage.addChild(new PIXI.Container());
		
		return this;
	}
	
	/**
	 * Remove layer form application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	removeLayer(name: string): Application {
		if (!this._hasLayer(name)) {
			return this;
		}
		
		this._piximData.stage.removeChild(this._piximData.layers[name]);
		delete(this._piximData.layers[name]);
		
		return this;
	}
	
	/**
	 * Attach content to application.
	 */
	attachAsync(content: Content, layerName: string = 'anonymous'): Promise<PIXI.Container> {
		return content.buildAsync()
			.then((root: PIXI.Container) => {
				this.addLayer(layerName);
				
				Application._contentRoots[content.contentID] = root;
				this._piximData.layers[layerName].addChild(root);
				
				return root;
			});
	}
	
	/**
	 * Detach content from application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	detach(content: Content): Application {
		const root: PIXI.Container = Application._contentRoots[content.contentID];
		
		if (!root) {
			return this;
		}
		
		root.parent.removeChild(root);
		root.destroy();
		delete(Application._contentRoots[content.contentID]);
		
		return this;
	}
	
	/**
	 * Play application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	play(): Application {
		if (this._piximData.isRun) {
			return this;
		}
		
		this._piximData.container.appendChild(this._piximData.view);
		this._piximData.app.start();
		this._piximData.isRun = true;
		
		return this;
	}
	
	/**
	 * Stop application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	stop(): Application {
		if (!this._piximData.isRun) {
			return this;
		}
		
		this._piximData.app.stop();
		this._piximData.isRun = false;
		
		const stage: PIXI.Container = this._piximData.app.stage;
		
		const layers: Layers = this._piximData.layers;
		
		for (let i in layers) {
			layers[i].removeChildren();
		}
		
		for (let i in Application._contentRoots) {
			const root: PIXI.Container = Application._contentRoots[i];
			root.parent.removeChild(root);
			root.destroy();
		}
		
		Application._contentRoots = {};
		
		this._piximData.app.ticker.update();
		this._piximData.container.removeChild(this._piximData.view);
		
		return this;
	}
	
	/**
	 * Pause (or restart) application.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	pause(paused: boolean): Application {
		if (!this._piximData.isRun) {
			return this;
		}
		
		if (paused) {
			this._piximData.app.stop();
		} else {
			this._piximData.app.start();
		}
		
		return this;
	}
	
	/*
	resizeFrame(size: ISize): Application {
		const frame: HTMLDivElement = this._piximData.frame;
		
		frame.style.width = `${size.width}px`;
		frame.style.height = `${size.height}px`;
		
		if (this._piximData.options.autoAdjust) {
			return this.adjust(size);
		}
		
		return this;
	}
	*/
	
	/**
	 * Resize canvas to fit specified size.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	 /*
	adjust(size: ISize): Application {
		const view: HTMLCanvasElement = this._piximData.view;
		
		if (size.width / size.height > view.width / view.height) {
			return this.adjustHeight(size.height);
		}
		
		return this.adjustWidth(size.width);
	}
	*/
	
	/**
	 * Resize canvas to fit specified rectangle.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	fullScreen(rect: IRect = { x: 0, y: 0, width: window.innerWidth, height: window.innerHeight}) {
		const view: HTMLCanvasElement = this._piximData.view;
		
		if (rect.width / rect.height > view.width / view.height) {
			return this.adjustHeight(rect.height).toCenter(rect).toTop(rect);
		}
		
		this.adjustWidth(rect.width).toMiddle(rect).toLeft(rect);
	}
	
	/**
	 * Resize canvas to fit specified width.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	adjustWidth(width: number): Application {
		const view: HTMLCanvasElement = this._piximData.view;
		const h: number = width / view.width * view.height;
		
		//const frame = this._piximData.frame;
		view.style.width = `${width}px`;
		view.style.height = `${h}px`;
		
		return this;
	}
	
	/**
	 * Resize canvas to fit specified height.
	 * 
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	adjustHeight(height: number): Application {
		const view = this._piximData.view;
		const w = height / view.height * view.width;
		
		//const frame = this._piximData.frame;
		view.style.height = `${height}px`;
		view.style.width = `${w}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toLeft(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.left = `${rect.x}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toCenter(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.left = `${(rect.width - this._getFrameRect().width) / 2 + rect.x}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toRight(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.left = `${rect.width - this._getFrameRect().width + rect.x}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toTop(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.top = `${rect.y}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toMiddle(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.top = `${(rect.height - this._getFrameRect().height) / 2 + rect.y}px`;
		
		return this;
	}
	
	/**
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	toBottom(rect: IRect): Application {
		const view = this._piximData.view;
		
		view.style.top = `${rect.height - this._getFrameRect().height + rect.y}px`;
		
		return this;
	}
	
	private _getFrameRect(): IRect {
		const view = this._piximData.view;
		
		return {
			x: parseInt(view.style.left.replace('px', '')),
			y: parseInt(view.style.top.replace('px', '')),
			width: parseInt(view.style.width.replace('px', '')),
			height: parseInt(view.style.height.replace('px', ''))
		};
	}
}