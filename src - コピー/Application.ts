import * as PIXI from 'pixi.js';
import Container from './Container';
import Emitter from './Emitter';
import Task from './Task';
import TickerData from './TickerData';
import Rect from './Rect';

type Roots = { [name: string]: Container };

type Layers = { [name: string]: PIXI.Container };

type ApplicationOption = {
	autoAdjust?: boolean
}

interface ApplicationData {
	isRun: boolean,
	app: PIXI.Application,
	container: HTMLElement,
	frame: HTMLDivElement,
	view: HTMLCanvasElement,
	autoAdjust: boolean,
	layers: Layers
}

/**
 * @typedef Roots {Object<string, Pixim.Container>}
 * @memberof Pixim.Application~
 */

/**
 * @typedef ApplicationOption {Object}
 * @memberof Pixim.Application~
 * @property [autoAdjust=false] {boolean} Whether to adjust canvas size automatically.
 */

/**
 * @interface ApplicationData
 * @memberof Pixim.Application~
 * @property {boolean} isRun
 * @property {PIXI.Application} app
 * @property {HTMLElement} container
 * @property {HTMLDivElement} frame
 * @property {HTMLCanvasElement} view
 * @property [PIXI.Container[]} layers
 * @property {boolean} fullScreen
 */

/**
 * @class ApplicationA
 * @extends Emitter
 */
export default class Application extends Emitter {
	private static _contentRoots: Roots = {};
	
	private _piximData: ApplicationData;
	
	/**
	 * @constructor
	 * @param {HTMLElement} [container=document.body] The parent element of the canvas that displays the content.
	 * @param {object} [pixiOptions] Optional data when call 'new PIXI.Application'.
	 * @param {Pixim.Application~ApplicationOption} [piximOptions] Optional data for Pixim.
	 * @see http://pixijs.download/v5.2.1/docs/PIXI.Application.html
	 */
	constructor(container: HTMLElement = document.body, pixiOptions: Object = {}, piximOptions: ApplicationOption = {}) {
		super();
		
		//pixiOptions = pixiOptions || {};
		//pixiOptions.width = pixiOptions.width || 450;
		//pixiOptions.height = pixiOptions.height || 800;
		
		const app: PIXI.Application = new PIXI.Application(pixiOptions);
		app.stop();
		
		const view: HTMLCanvasElement = app.view;
		view.style.width = '100%';
		view.style.height = '100%';
		
		const frame: HTMLDivElement = document.createElement('div');
		frame.style.position = 'relative';
		frame.style.overflow = 'hidden';
		frame.style.left = '0px';
		frame.style.top = '0px';
		frame.appendChild(view);
		
		const autoAdjust: boolean = piximOptions.autoAdjust || false;
		
		this._piximData = {
			isRun: false,
			app,
			container,
			frame,
			view,
			layers: {},
			autoAdjust
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
		
		this.resizeFrame(view.width, view.height);
		
		if (piximOptions.autoAdjust) {
			window.addEventListener('resize', () => {
			//	this.adjust();
			});
			
		//	this.adjust();
		}
	}
	
	/**
	 * Play application.
	 * 
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	play(): Application {
		if (this._piximData.isRun) {
			return this;
		}
		
		this._piximData.container.appendChild(this._piximData.frame);
		this._piximData.app.start();
		this._piximData.isRun = true;
		
		return this;
	}
	
	/**
	 * Stop application.
	 * 
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	stop() {
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
		/*
		for (let i in _contentRoots) {
			const root = _contentRoots[i];
			root.parent.removeChild(root);
			root.destroy();
		}
		
		_contentRoots = {};
		*/
		
		this._piximData.app.ticker.update();
		this._piximData.container.removeChild(this._piximData.frame);
		
		return this;
	}
	
	/**
	 * Pause (or restart) application.
	 * 
	 * @param {boolean} paused
	 * @return {Pixim.Application} Returns itself for the method chaining.
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
	
	resizeFrame(width: number, height: number) {
		this._piximData.frame.style.width = `${width}px`;
		this._piximData.frame.style.height = `${height}px`;
		
		if (this._piximData.autoAdjust) {
			this.adjust(width, height);
		}
	}
	
	adjust(width: number, height: number): Application {
		/*
		const rect = new Rect(0, 0, window.innerWidth, window.innerHeight);
		
		const view = this._pixim.view;
		
		if (rect.width / rect.height > view.width / view.height) {
			this.adjustHeight(rect.height).toCenter(rect).toTop(rect);
		} else {
			this.adjustWidth(rect.width).toMiddle(rect).toLeft(rect);
		}
		
		return this;*/
		return this;
	}
	
	/**
	 * Adjust canvas width.
	 * 
	 * @param {number} width
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	adjustWidth(width: number): Application {
		const view: HTMLCanvasElement = this._piximData.view;
		const h: number = width / view.width * view.height;
		
		view.style.width = `${width}px`;
		view.style.height = `${h}px`;
		
		return this;
	}
	
	/**
	 * Adjust canvas height.
	 * 
	 * @param {number} height
	 * @return {Pixim.Application} Returns itself for the method chaining.
	 */
	adjustHeight(height: number): Application {
		const view = this._piximData.view;
		const w = height / view.height * view.width;
		
		view.style.height = `${height}px`;
		view.style.width = `${w}px`;
		
		return this;
	}
}