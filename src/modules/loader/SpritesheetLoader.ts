import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import { JsonLoader } from './JsonLoader';
import * as TextureLoader from './TextureLoader';
import * as utils from '../utils/index';

export type TSpritesheetLoaderRawResource = PIXI.ITextureDictionary;

export class SpritesheetLoaderResource extends LoaderBase.LoaderResource<TSpritesheetLoaderRawResource> {
	destroy() {
		for (let i in this._data) {
			this._data[i].destroy(true);
		}
		
		this._data = {};
	}
}

export interface ISpritesheetJson {
	frames: {
		[name: string]: any;
	};
	
	meta: {
		[name: string]: any;
		image: string | HTMLImageElement;
	}
}

export type TSpritesheetLoaderTarget = string | ISpritesheetJson;

export interface ISpritesheetLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TSpritesheetLoaderTarget> {

}

export interface ISpritesheetLoaderUrlTargetDictionary extends LoaderBase.ILoaderTargetDictionary<string> {

}

export interface ISpritesheetLoaderJsonTargetDictionary extends LoaderBase.ILoaderTargetDictionary<ISpritesheetJson> {

}

export interface ISpritesheetLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<SpritesheetLoaderResource> {

}

export interface ISpritesheetLoaderOption extends LoaderBase.ILoaderOption {
	textureVersion?: string | number;
}

/**
 * @ignore
 */
const KEY_SINGLE_SPRITESHEET = '--single-spritesheet';

export class SpritesheetLoader extends LoaderBase.LoaderBase<TSpritesheetLoaderTarget, TSpritesheetLoaderRawResource, SpritesheetLoaderResource> {
	protected _loadAsync(target: TSpritesheetLoaderTarget, options: ISpritesheetLoaderOption = {}) {
		return (() => {
			if (typeof target !== 'string') {
				return this._loadTextureAsync(target, options);
			} else {
				return this._loadJsonAsync(target, options);
			}
		})()
		.then(textures => new SpritesheetLoaderResource(textures, null))
		.catch(e => new SpritesheetLoaderResource({}, e));
	}
	
	private _loadJsonAsync(url: string, options: ISpritesheetLoaderOption) {
		const loader = new JsonLoader();
		
		return loader.loadAsync(url, { xhr: options.xhr })
			.then(resource => {
				if (resource.error) {
					throw resource.error;
				}
				
				if (!resource.data) {
					throw 'invalid resource';
				}
				
				const json = resource.data;
				
				if (!json.meta || !json.meta.image || !json.frames) {
					throw 'invalid json';
				}
				
				json.meta.image = utils.resolveUri(url, json.meta.image, options.textureVersion || '');
				
				const data: ISpritesheetJson = {
					frames: json.frames,
					meta: json.meta
				};
				
				return this._loadTextureAsync(data, options);
			});
	}
	
	private _loadTextureAsync(json: ISpritesheetJson, options: ISpritesheetLoaderOption) {
		const loader = new TextureLoader.TextureLoader();
		
		return loader.loadAsync(json.meta.image, { xhr: options.xhr })
			.then(resource => {
				if (resource.error) {
					throw resource.error;
				}
				
				if (!resource.data) {
					throw 'invalid resource';
				}
				
				const ss = new PIXI.Spritesheet(resource.data, json);
				
				return new Promise<PIXI.ITextureDictionary>(resolve => {
					ss.parse(e => {
						for (let i in ss.textures) {
							TextureLoader.TextureLoaderResource.removeCache(ss.textures[i]);
						}
						
						resolve(ss.textures);
					});
				});
			});
	}
}