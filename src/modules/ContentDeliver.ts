import { Emitter } from './Emitter.js';
import { ContentLibrary } from './Content';
import { LoadedResources } from './ContentResource';

export type Vars = { [name: string]: any };

/**
 * @private
 */
interface IContentDeliverData {
	fps: number,
	width: number,
	height: number,
	lib: ContentLibrary,
	resources: LoadedResources,
	vars: Vars
}

export class ContentDeliver extends Emitter {
	private _fps: number;
	private _width: number;
	private _height: number;
	private _lib: ContentLibrary;
	private _resources: LoadedResources;
	private _vars: Vars;
	
	constructor(data: IContentDeliverData) {
		super();
		
		this._fps = data.fps;
		this._width = data.width;
		this._height = data.height;
		this._lib = data.lib;
		this._resources = data.resources;
		this._vars = data.vars;
	}
	
	/**
	 * Content FPS.
	 */
	get fps(): number {
		return this._fps;
	}
	
	/**
	 * Content width.
	 */
	get width(): number {
		return this._width;
	}
	
	/**
	 * Content height.
	 */
	get height(): number {
		return this._height;
	}
	
	/**
	 * Defined classes in content.
	 */
	get lib(): ContentLibrary {
		return this._lib;
	}
	
	/**
	 * Loaded resources.
	 */
	get resources(): LoadedResources {
		return this._resources;
	}
	
	/**
	 * Defined variables by framework.
	 */
	get vars(): Vars {
		return this._vars;
	}
}