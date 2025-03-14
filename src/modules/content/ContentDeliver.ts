import { Container as PixiContainer } from 'pixi.js';
import { Container } from '../Container';
import { TJsonLoaderRawResource, TSoundLoaderRawResource, TSpritesheetLoaderRawResource, TTextureLoaderRawResource } from '../loader';

export interface IContentResourceDictionary {
    images: Record<string, Exclude<TTextureLoaderRawResource, null>>;
    spritesheets: Record<string, Exclude<TSpritesheetLoaderRawResource, null>>;
    sounds: Record<string, Exclude<TSoundLoaderRawResource, null>>;
    jsons: Record<string, Exclude<TJsonLoaderRawResource, null>>;
	[name: string]: Record<string, any>;
}

export type TContentLibary = typeof PixiContainer | typeof Container;
export type TContentLibraryDictionary = Record<string, TContentLibary>;

export type TContentVariableDictionary = Record<string, any>;

export interface IContentDeliverData {
	width: number,
	height: number,
	lib: TContentLibraryDictionary,
	resources: IContentResourceDictionary,
	vars: TContentVariableDictionary;
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
	get width() {
		return this._piximData.width;
	}
	
	/**
	 * Content height.
	 */
	get height() {
		return this._piximData.height;
	}
	
	/**
	 * Defined classes in content.
	 */
	get lib() {
		return this._piximData.lib;
	}
	
	/**
	 * Loaded resources.
	 */
	get resources() {
		return this._piximData.resources;
	}
	
	/**
	 * Defined variables by framework.
	 */
	get vars() {
		return this._piximData.vars;
	}
}