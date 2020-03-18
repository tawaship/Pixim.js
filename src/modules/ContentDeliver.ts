import * as PIXI from 'pixi.js';
import { Container } from './Container';
import { TContentResources } from './ContentManifestBase';

export type TContentLibrary = { [name: string]: typeof PIXI.Container | typeof Container };

export type TVars = { [name: string]: any };

/**
 * @private
 */
interface IContentDeliverData {
	width: number,
	height: number,
	lib: TContentLibrary,
	resources: TContentResources,
	vars: TVars
}

/**
 * @private
 */
export class ContentDeliver {
	private _piximData: IContentDeliverData;
	
	constructor(data: IContentDeliverData) {
		this._piximData = {
			width: data.width,
			height: data.height,
			lib: data.lib,
			resources: data.resources,
			vars: data.vars
		};
	}
	
	/**
	 * Content width.
	 */
	get width(): number {
		return this._piximData.width;
	}
	
	/**
	 * Content height.
	 */
	get height(): number {
		return this._piximData.height;
	}
	
	/**
	 * Defined classes in content.
	 */
	get lib(): TContentLibrary {
		return this._piximData.lib;
	}
	
	/**
	 * Loaded resources.
	 */
	get resources(): TContentResources {
		return this._piximData.resources;
	}
	
	/**
	 * Defined variables by framework.
	 */
	get vars(): TVars {
		return this._piximData.vars;
	}
}