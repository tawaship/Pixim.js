import * as PIXI from 'pixi.js';
import { Content } from './Content';
import { Emitter } from './Emitter';
import { TaskManager } from './TaskManager';

namespace Pixim {
	/**
	 * @ignore
	 */
	interface IRootDictionary {
		[id: string]: PIXI.Container;
	}
	
	/**
	 * @private
	 */
	interface ILayerDictionary{
		[name: string]: PIXI.Container;
	}
	
	export interface ITickerData {
		delta: number
	}
	
	export interface IAdjustDelegate {
		(app: Application): void;
	}
	
	export type TAutoAdjust = boolean | IAdjustDelegate;
	
	export interface IApplicationOption {
		/**
		 * Parent node of canvas element.
		 */
		container?: HTMLElement;
		
		/**
		 * Whether to automatically resize the canvas when resizing the window.<br />
		 * Or the resizing process to be executed at that time.
		 */
		autoAdjust?: TAutoAdjust;
	}
	
	export interface IApplicationData {
		isRun: boolean;
		/**
		 * [[[[http://pixijs.download/v5.2.1/docs/PIXI.Application.html | PIXI.Application]]]]
		 */
		app: PIXI.Application;
		stage: PIXI.Container;
		view: HTMLCanvasElement;
		container: HTMLElement;
		options: IApplicationOption;
		layers: ILayerDictionary;
	}
	
	export interface ISize {
		width: number;
		height: number;
	}
	
	export interface IPosition {
		x: number;
		y: number;
	}
	
	export interface IHorizontal {
		x: number;
		width: number;
	}
	
	export interface IVertical {
		y: number;
		height: number;
	}
	
	export interface IRect extends ISize, IPosition {}
	
	/**
	 * @ignore
	 */
	const _roots: IRootDictionary = {};
	
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
		protected _piximData: IApplicationData;
		
		/**
		 * @param pixiOptions Optional data when call 'new [[[[http://pixijs.download/v5.2.1/docs/PIXI.Application.html | PIXI.Application]]]]'.
		 * @param piximOptions Optional data for Pixim.
		 */
		constructor(pixiOptions: Object = {}, piximOptions: IApplicationOption = {}) {
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
			
			const autoAdjust: TAutoAdjust = piximOptions.autoAdjust || false;
			
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
			
			if (autoAdjust) {
				if (autoAdjust === true) {
					const f = () => {
						this.fullScreen()
					};
					
					window.addEventListener('resize', f);
					
					f();
				} else {
					const f = () => {
						autoAdjust(this);
					};
					
					window.addEventListener('resize', f);
					
					f();
				}
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
		
		get container(): HTMLElement {
			return this._piximData.container;
		}
		
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
		 */
		addLayer(name: string) {
			if (this._hasLayer(name)) {
				return this;
			}
			
			this._piximData.layers[name] = this._piximData.stage.addChild(new PIXI.Container());
			
			return this;
		}
		
		/**
		 * Remove layer form application.
		 */
		removeLayer(name: string) {
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
		 */
		detach(content: Content) {
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
		 */
		play() {
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
		 */
		stop() {
			if (!this._piximData.isRun) {
				return this;
			}
			
			if (this._piximData.view.parentNode) {
				this._piximData.view.parentNode.removeChild(this._piximData.view);
			}
			
			this._piximData.app.stop();
			this._piximData.isRun = false;
			
			const stage: PIXI.Container = this._piximData.app.stage;
			
			const layers: ILayerDictionary = this._piximData.layers;
			
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
		
		private _destroyRoot(root: PIXI.Container): void {
			if (root.parent) {
				root.parent.removeChild(root);
			}
			root.destroy();
		}
		
		/**
		 * Pause (or restart) application.
		 */
		pause(paused: boolean) {
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
		 */
		fullScreen(rect?: IRect) {
			const view: HTMLCanvasElement = this._piximData.view;
			const r: IRect = rect || {
				x: 0,
				y: 0,
				width: this._piximData.container.offsetWidth || window.innerWidth,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			if (r.width / r.height > view.width / view.height) {
				return this.adjustHeight(r.height).toCenter(r).toTop(r);
			}
			
			return this.adjustWidth(r.width).toMiddle(r).toLeft(r);
		}
		
		/**
		 * Resize canvas to fit specified width.
		 * 
		 * @param width Width to adjust.
		 */
		adjustWidth(width?: number) {
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
		 */
		adjustHeight(height?: number) {
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
		 */
		toLeft(horizontal?: IHorizontal) {
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
		 */
		toCenter(horizontal?: IHorizontal) {
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
		 */
		toRight(horizontal?: IHorizontal) {
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
		 */
		toTop(vertical?: IVertical) {
			const view = this._piximData.view;
			const ver: IVertical = vertical || {
				y: 0,
				height: this._piximData.container.offsetHeight || window.innerHeight
			};
			
			view.style.top = `${ver.y}px`;
			
			return this;
		}
		
		/**
		 * Middle justified with respect to the reference data.
		 * 
		 * @param vertical Vertical data used to calculate the position.
		 */
		toMiddle(vertical?: IVertical) {
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
		 */
		toBottom(vertical?: IVertical) {
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
export import IApplicationOption = Pixim.IApplicationOption;

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