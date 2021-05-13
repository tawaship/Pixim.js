import * as PIXI from 'pixi.js';
import { Container } from './Container';
import { IContentResourceDictionary } from './ContentManifestBase';

export interface IContentLibrary {
	[name: string]: typeof PIXI.Container | typeof Container
}

export interface IVariableDictionary {
	[name: string]: any;
}

export interface IContentDeliverData {
	width: number,
	height: number,
	lib: IContentLibrary,
	resources: IContentResourceDictionary,
	vars: IVariableDictionary
}

export class ContentDeliver {
	protected _piximData: IContentDeliverData;
	
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
	get lib(): IContentLibrary {
		return this._piximData.lib;
	}
	
	/**
	 * Loaded resources.
	 */
	get resources(): IContentResourceDictionary {
		return this._piximData.resources;
	}
	
	/**
	 * Defined variables by framework.
	 */
	get vars() {
		return this._piximData.vars;
	}
}