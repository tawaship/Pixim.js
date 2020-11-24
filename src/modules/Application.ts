import * as PIXI from 'pixi.js';
import { Content } from './Content';
import { Emitter } from './Emitter';
import { TaskManager } from './TaskManager';

namespace Pixim {
	/**
	 * @private
	 */
	type TRoots = { [id: string]: PIXI.Container };
	
	/**
	 * @private
	 */
	type TLayers = { [name: string]: PIXI.Container };
	
	/**
	 * @since 1.7.3
	 */
	export interface ITickerData {
		delta: number
	}
	
	export type TApplicationOption = {
		/**
		 * Parent node of canvas element.
		 */
		container?: HTMLElement,
		
		/**
		 * Whether to automatically adjust the canvas size when resizing the window.
		 */
		autoAdjust?: boolean
	}
	
	/**
	 * @since 1.7.0
	 */
	export interface IApplicationData {
		isRun: boolean;
		app: PIXI.Application;
		stage: PIXI.Container;
		view: HTMLCanvasElement;
		container: HTMLElement;
		options: TApplicationOption;
		layers: TLayers;
	}
	
	export interface ISize {
		width: number;
		height: number;
	}
	
	export interface IPosition {
		x: number;
		y: number;
	}
	
	/**
	 * @since 1.8.1
	 */
	export interface IHorizontal {
		x: number;
		width: number;
	}
	
	/**
	 * @since 1.8.1
	 */
	export interface IVertical {
		y: number;
		height: number;
	}
	
	export interface IRect extends ISize, IPosition {}
	
	/**
	 * @ignore
	 */
	const _roots: TRoots = {};
	
	/*
	function taskHandler(obj: PIXI.Container, e: ITaskTickerData): void {
		if (obj instanceof Container) {
			obj.task.update(e);
			
			if (!obj.taskEnabledChildren) {
				return;
			}
		}
		
		for (let i = 0; i < obj.children.length; i++) {
			const child = obj.children[i];
			
			if (child instanceof PIXI.Container) {
				taskHandler(child, e);
			}
		}
	}
	*/
	
	export class Application extends Emitter {
		/**
		 * @since 1.6.2
		 */
		protected _piximData: IApplicationData;
		
		/**
		 * @param pixiOptions Optional data when call 'new PIXI.Application'.
		 * @param piximOptions Optional data for Pixim.
		 * @see http://pixijs.download/v5.2.1/docs/PIXI.Application.html
		 */
		constructor(pixiOptions: Object = {}, piximOptions: TApplicationOption = {}) {
			super();
			
			const app: PIXI.Application = new PIXI.Application(pixiOptions);
			app.stop();
			
			const stage: PIXI.Container = app.stage;
			
			const view: HTMLCanvasElement = app.view;
			view.style.position = 'absolute';
			
			/*
			if (piximOptions.container) {
				piximOptions.container.appendChild(view);
			} else {
				if (!view.parentNode) {
					document.body.appendChild(view);
				}
			}
			*/
			
			const autoAdjust: boolean = piximOptions.autoAdjust || false;
			
			this._piximData = {
				isRun: false,
				app,
				stage,
				view,
				container: piximOptions.container || document.body,
				layers: {},
				options: piximOptions
			};
			
			const ticker: PIXI.Ticker = this._piximData.app.ticker;
			
			ticker.add((delta: number) => {
				TaskManager.done({ delta });
				//taskHandler(stage, { delta });
			});
			
			if (piximOptions.autoAdjust) {
				const f = () => {
					this.fullScreen()
				};
				
				window.addEventListener('resize', f);
				
				f();
			}
		}
		
		get app(): PIXI.Application {
			return this._piximData.app;
		}
		
		get stage(): PIXI.Container {
			return this._piximData.stage;
		}
		
		get view(): HTMLCanvasElement {
			return this._piximData.view;
		}
		
		/**
		 * @since 1.8.0
		 */
		get container(): HTMLElement {
			return this._piximData.container;
		}
		
		/**
		 * @since 1.8.0
		 */
		set container(container: HTMLElement) {
			this._piximData.container = container || document.body;
			if (this._piximData.view.parentNode) {
				this._piximData.container.appendChild(this._piximData.view);
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
		addLayer(name: string): this {
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
		removeLayer(name: string): this {
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
					
					_roots[content.contentID] = root;
					this._piximData.layers[layerName].addChild(root);
					
					return root;
				});
		}
		
		/**
		 * Detach content from application.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		detach(content: Content): this {
			const root: PIXI.Container = _roots[content.contentID];
			
			if (!root) {
				return this;
			}
			
			this._destroyRoot(root);
			delete(_roots[content.contentID]);
			
			return this;
		}
		
		/**
		 * Play application.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		play(): this {
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
		stop(): this {
			if (!this._piximData.isRun) {
				return this;
			}
			
			if (this._piximData.view.parentNode) {
				this._piximData.view.parentNode.removeChild(this._piximData.view);
			}
			
			this._piximData.app.stop();
			this._piximData.isRun = false;
			
			const stage: PIXI.Container = this._piximData.app.stage;
			
			const layers: TLayers = this._piximData.layers;
			
			for (let i in layers) {
				layers[i].removeChildren();
			}
			
			const keys: string[] = [];
			for (let i in _roots) {
				this._destroyRoot(_roots[i]);
				keys.push(i);
			}
			
			for (let i = 0; i < keys.length; i++) {
				delete(_roots[keys[i]]);
			}
			
			this._piximData.app.ticker.update();
			
			return this;
		}
		
		_destroyRoot(root: PIXI.Container): void {
			if (root.parent) {
				root.parent.removeChild(root);
			}
			root.destroy();
		}
		
		/**
		 * Pause (or restart) application.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		pause(paused: boolean): this {
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
		
		/**
		 * Resize canvas to fit specified rectangle.
		 * 
		 * @param rect Rectangle to adjust.
		 * @return Returns itself for the method chaining.
		 */
		fullScreen(rect?: IRect): this {
			const view: HTMLCanvasElement = this._piximData.view;
			const r: IRect = rect || {
				x: 0,
				y: 0,
				width: this._piximData.container.offsetWidth || window.innerWidth,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			if (r.width / r.height > view.width / view.height) {
				return this.adjustHeight().toCenter().toTop();
			}
			
			return this.adjustWidth().toMiddle().toLeft();
		}
		
		/**
		 * Resize canvas to fit specified width.
		 * 
		 * @param width Width to adjust.
		 * @return Returns itself for the method chaining.
		 */
		adjustWidth(width?: number): this {
			const view: HTMLCanvasElement = this._piximData.view;
			const w: number = width || this._piximData.container.offsetWidth || window.innerWidth;
			
			const h: number = w / view.width * view.height;
			
			//const frame = this._piximData.frame;
			view.style.width = `${w}px`;
			view.style.height = `${h}px`;
			
			return this;
		}
		
		/**
		 * Resize canvas to fit specified height.
		 * 
		 * @param height Height to adjust.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		adjustHeight(height?: number): this {
			const view = this._piximData.view;
			const h: number = height || this._piximData.container.offsetHeight || window.innerHeight;
			
			const w = h / view.height * view.width;
			
			//const frame = this._piximData.frame;
			view.style.height = `${h}px`;
			view.style.width = `${w}px`;
			
			return this;
		}
		
		/**
		 * Left justified with respect to the reference data.
		 * 
		 * @param horizontal Horizontal data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toLeft(horizontal?: IHorizontal): this {
			const view = this._piximData.view;
			const hol: IHorizontal = horizontal || {
				x: 0,
				width: this._piximData.container.offsetWidth || window.innerWidth
			};
			
			view.style.left = `${hol.x}px`;
			
			return this;
		}
		
		/**
		 * Center justified with respect to the reference data.
		 * 
		 * @param horizontal Horizontal data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toCenter(horizontal?: IHorizontal): this {
			const view = this._piximData.view;
			const hol: IHorizontal = horizontal || {
				x: 0,
				width: this._piximData.container.offsetWidth || window.innerWidth
			};
			
			view.style.left = `${(hol.width - this._getViewRect().width) / 2 + hol.x}px`;
			
			return this;
		}
		
		/**
		 * Right justified with respect to the reference data.
		 * 
		 * @param horizontal Horizontal data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toRight(horizontal?: IHorizontal): this {
			const view = this._piximData.view;
			const hol: IHorizontal = horizontal || {
				x: 0,
				width: this._piximData.container.offsetWidth || window.innerWidth
			};
			
			view.style.left = `${hol.width - this._getViewRect().width + hol.x}px`;
			
			return this;
		}
		
		/**
		 * Top justified with respect to the reference data.
		 * 
		 * @param vertical Vertical data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toTop(vertical?: IVertical): this {
			const view = this._piximData.view;
			const ver: IVertical = vertical || {
				y: 0,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			view.style.top = `${ver.y}0px`;
			
			return this;
		}
		
		/**
		 * Middle justified with respect to the reference data.
		 * 
		 * @param vertical Vertical data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toMiddle(vertical?: IVertical): this {
			const view = this._piximData.view;
			const ver: IVertical = vertical || {
				y: 0,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			view.style.top = `${(ver.height - this._getViewRect().height) / 2 + ver.y}px`;
			
			return this;
		}
		
		/**
		 * Bottom justified with respect to the reference data.
		 * 
		 * @param vertical Vertical data used to calculate the position.
		 * @return {Pixim.Application} Returns itself for the method chaining.
		 */
		toBottom(vertical?: IVertical): this {
			const view = this._piximData.view;
			const ver: IVertical = vertical || {
				y: 0,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			view.style.top = `${ver.height - this._getViewRect().height + ver.y}px`;
			
			return this;
		}
		
		private _getViewRect(): IRect {
			const view = this._piximData.view;
			
			return {
				x: parseInt(view.style.left.replace('px', '')),
				y: parseInt(view.style.top.replace('px', '')),
				width: parseInt(view.style.width.replace('px', '')),
				height: parseInt(view.style.height.replace('px', ''))
			};
		}
	}
}

/**
 * @ignore
 */
export import IApplicationData = Pixim.IApplicationData;

/**
 * @ignore
 */
export import TApplicationOption = Pixim.TApplicationOption;

/**
 * @ignore
 */
export import ITickerData = Pixim.ITickerData;

/**
 * @ignore
 */
export import ISize = Pixim.ISize;

/**
 * @ignore
 */
export import IPosition = Pixim.IPosition;

/**
 * @ignore
 */
export import IRect= Pixim.IRect;

/**
 * @ignore
 */
export import Application = Pixim.Application;