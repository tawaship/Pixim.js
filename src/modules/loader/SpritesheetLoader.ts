
import { JsonLoader } from './JsonLoader';
import { ITextureDictionary, Spritesheet } from 'pixi.js';
import { ILoaderOption, LoaderBase, LoaderResource } from './LoaderBase';
import { TextureLoader, TextureLoaderResource } from './TextureLoader';
import { resolveUri } from '../utils';

export type TSpritesheetLoaderRawResource = ITextureDictionary;

export class SpritesheetLoaderResource extends LoaderResource<TSpritesheetLoaderRawResource> {
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

export interface ISpritesheetLoaderOption extends ILoaderOption {
	textureVersion?: string | number;
}

/**
 * @ignore
 */
const KEY_SINGLE_SPRITESHEET = '--single-spritesheet';

export class SpritesheetLoader extends LoaderBase<TSpritesheetLoaderTarget, TSpritesheetLoaderRawResource, SpritesheetLoaderResource> {
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
		
		return loader.loadAsync(url, options)
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
				
				json.meta.image = resolveUri(url, json.meta.image);
				
				const data: ISpritesheetJson = {
					frames: json.frames,
					meta: json.meta
				};
				
				return this._loadTextureAsync(data, options);
			});
	}
	
	private _loadTextureAsync(json: ISpritesheetJson, options: ISpritesheetLoaderOption) {
		const loader = new TextureLoader();
		
		return loader.loadAsync(json.meta.image, Object.assign({}, options, { version: options.textureVersion || options.version }))
			.then(resource => {
				if (resource.error) {
					throw resource.error;
				}
				
				if (!resource.data) {
					throw 'invalid resource';
				}
				
				const ss = new Spritesheet(resource.data, json);
				
				return new Promise<ITextureDictionary>(resolve => {
					ss.parse(e => {
						for (let i in ss.textures) {
							TextureLoaderResource.removeCache(ss.textures[i]);
						}
						
						resolve(ss.textures);
					});
				});
			});
	}
}