import { DisplayObject, Application as PixiApplication, Container as PixiContainer, Ticker } from "pixi.js";
import { Content } from './content/Content';
import { Container } from './Container';
import { Emitter } from './Emitter';
//import { TaskManager } from './TaskManager';

export interface IContentDictionary {
	[id: string]: Content;
}

export interface IRootDictionary {
	[id: string]: PixiContainer;
}

export interface ILayerDictionary{
	[name: string]: Layer;
}

export interface ITickerData {
	delta: number
}

export interface IAdjustDelegate {
	(app: Application): void;
}

export type TAutoAdjust = boolean | IAdjustDelegate;

export interface IAutoAdjustDelegate {
	(): void;
}

export type TAutoAdjuster = IAutoAdjustDelegate | null;

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
	 * {@link https://pixijs.download/v5.3.2/docs/PIXI.Application.html | PixiApplication}
	 */
	app: PixiApplication;
	container: HTMLElement;
	layers: ILayerDictionary;
	autoAdjuster: TAutoAdjuster;
	roots: IRootDictionary;
	contents: IContentDictionary;
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

export interface IDestroyOptions {
	children?: boolean;
	texture?: boolean;
	baseTexture?: boolean;
}

export class Layer extends PixiContainer {}

/**
 * @ignore
 */
function taskHandler(obj: PixiContainer, e: ITickerData): void {
	if (obj instanceof Container) {
		obj.updateTask(e);
		
		if (!obj.taskEnabledChildren) {
			return;
		}
	}
	
	const children: DisplayObject[] = [];
	
	for (let i = 0; i < obj.children.length; i++) {
		children.push(obj.children[i]);
	}
	
	for (let i = 0; i < children.length; i++) {
		const child = children[i];
		
		if (child instanceof PixiContainer) {
			taskHandler(child, e);
		}
	}
}

export class Application extends Emitter {
	protected _piximData: IApplicationData;
	
	/**
	 * @param pixiOptions Optional data for {@link https://pixijs.download/v5.3.2/docs/PIXI.Application.html | PixiApplication} constructor.
	 * @param piximOptions Optional data for Pixim.
	 */
	constructor(pixiOptions: Object = {}, piximOptions: IApplicationOption = {}) {
		super();
		
		const app: PixiApplication = new PixiApplication(pixiOptions);
		app.stop();
		
		app.view.style.position = 'absolute';
		
		const autoAdjust: TAutoAdjust = piximOptions.autoAdjust || false;
		
		this._piximData = {
			isRun: false,
			app,
			container: piximOptions.container || document.body,
			layers: {},
			autoAdjuster: null,
			roots: {},
			contents: {}
		};
		
		const ticker: Ticker = this._piximData.app.ticker;
		
		ticker.add((delta: number) => {
			//TaskManager.done({ delta });
			taskHandler(this._piximData.app.stage, { delta });
		});
		
		if (autoAdjust) {
			if (autoAdjust === true) {
				this.autoAdjuster = () => {
					this.fullScreen()
				};
			} else {
				this.autoAdjuster = () => {
					autoAdjust(this);
				};
			}
		}
	}
	
	get app(): PixiApplication {
		return this._piximData.app;
	}
	
	get stage(): PixiContainer {
		return this._piximData.app.stage;
	}
	
	get view(): HTMLCanvasElement {
		return this._piximData.app.view;
	}
	
	get container(): HTMLElement {
		return this._piximData.container;
	}
	
	set container(container: HTMLElement) {
		this._piximData.container = container || document.body;
		if (this._piximData.app.view.parentNode) {
			this._piximData.container.appendChild(this._piximData.app.view);
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
		
		this._piximData.layers[name] = this._piximData.app.stage.addChild(new Layer());
		
		return this;
	}
	
	/**
	 * Remove layer form application.
	 */
	removeLayer(name: string) {
		if (!this._hasLayer(name)) {
			return this;
		}
		
		this._piximData.app.stage.removeChild(this._piximData.layers[name]);
		delete(this._piximData.layers[name]);
		
		return this;
	}
	
	/**
	 * Attach content to application.
	 */
	attachAsync(content: Content, layerName: string = 'anonymous'): Promise<PixiContainer> {
		return content.buildAsync()
			.then((root: PixiContainer) => {
				this.detach(content);
				
				this.addLayer(layerName);
				
				this._piximData.roots[content.contentID] = root;
				this._piximData.contents[content.contentID] = content;
				this._piximData.layers[layerName].addChild(root);
				
				return root;
			});
	}
	
	/**
	 * Detach content from application.
	 */
	detach(content: Content, stageOptions: IDestroyOptions = { children: true }) {
		const root: PixiContainer = this._piximData.roots[content.contentID];
		
		if (!root) {
			return this;
		}
		
		this._destroyRoot(root, stageOptions);
		delete(this._piximData.roots[content.contentID]);
		delete(this._piximData.contents[content.contentID]);
		
		return this;
	}
	
	/**
	 * Start application and displa viewy.
	 */
	play() {
		this._piximData.container.appendChild(this._piximData.app.view);
		
		return this.start();
	}
	
	/**
	 * Start application.
	 */
	start() {
		this._piximData.app.start();
		
		return this;
	}
	
	/**
	 * Stop application.
	 */
	stop() {
		this._piximData.app.stop();
		
		return this;
	}
	
	/**
	 * Pause (or restart) application.
	 */
	pause(paused: boolean) {
		if (paused) {
			this.stop();
		} else {
			this.start();
		}
		
		return this;
	}
	
	get autoAdjuster() {
		return this._piximData.autoAdjuster;
	}
	
	set autoAdjuster(autoAdjuster: TAutoAdjuster) {
		if (this._piximData.autoAdjuster) {
			window.removeEventListener('resize', this._piximData.autoAdjuster);
		}
		
		if (!autoAdjuster) {
			this._piximData.autoAdjuster = null;
			return;
		}
		
		this._piximData.autoAdjuster = autoAdjuster;
		window.addEventListener('resize', autoAdjuster);
		autoAdjuster();
	}
	
	/**
	 * Pre process to destroy application.
	 */
	preDestroy() {
		for (let i in this._piximData.contents) {
			this._piximData.contents[i].destroy();
		}
		
		this.autoAdjuster = null;
		this._piximData.layers = {};
		this._piximData.roots = {};
		this._piximData.contents = {};
	}
	
	/**
	 * Destroy application.
	 */
	destroy(removeView?: boolean, stageOptions?: IDestroyOptions) {
		this.preDestroy();
		
		this._piximData.app.destroy(removeView, stageOptions);
		
		return this;
	}
	
	private _destroyRoot(root: PixiContainer, stageOptions?: IDestroyOptions): void {
		root.destroy(stageOptions);
	}
	
	/**
	 * Resize canvas to fit specified rectangle.
	 * 
	 * @param rect Rectangle to adjust.
	 */
	fullScreen(rect?: IRect) {
		const view: HTMLCanvasElement = this._piximData.app.view;
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
		const view: HTMLCanvasElement = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
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
		const view = this._piximData.app.view;
		const ver: IVertical = vertical || {
			y: 0,
			height: this._piximData.container.offsetHeight || window.innerHeight
		};
		
		view.style.top = `${ver.height - this._getViewRect().height + ver.y}px`;
		
		return this;
	}
	
	private _getViewRect(): IRect {
		const view = this._piximData.app.view;
		
		return {
			x: parseInt(view.style.left.replace('px', '')),
			y: parseInt(view.style.top.replace('px', '')),
			width: parseInt(view.style.width.replace('px', '')),
			height: parseInt(view.style.height.replace('px', ''))
		};
	}
}