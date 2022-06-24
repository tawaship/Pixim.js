import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import * as JsonLoader from './JsonLoader';
import * as TextureLoader from './TextureLoader';
import * as utils from '../utils/index';

export type TSpritesheetLoaderRawResource = PIXI.ITextureDictionary;

export class SpritesheetLoaderResource extends LoaderBase.LoaderResource<TSpritesheetLoaderRawResource> {
	destroy() {
		for (let i in this._data) {
			this._data[i].destroy(true);
		}
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

export interface ISpritesheetLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TSpritesheetLoaderRawResource> {

}

/**
 * - 0: for JsonLoader
 * - 1: for TextureLoader
 */
export type TSpritesheetLoaderFetchResolver = [ JsonLoader.TJsonLoaderFetchResolver, TextureLoader.TTextureLoaderFetchResolver ];

export interface ISpritesheetLoaderOption extends LoaderBase.ILoaderOption<TSpritesheetLoaderFetchResolver> {
	version: string | number;
}

/**
 * @ignore
 */
const KEY_SINGLE_SPRITESHEET = '--single-spritesheet';

export class SpritesheetLoader extends LoaderBase.LoaderBase<TSpritesheetLoaderTarget, TSpritesheetLoaderRawResource, TSpritesheetLoaderFetchResolver> {
	protected _loadAsync(target: TSpritesheetLoaderTarget, options: ISpritesheetLoaderOption = {}) {
		if (typeof target !== 'string') {
			return this._loadTextureFromJson(target);
		} else {
			return this._loadFromUrlAsync(target, options.version || '');
		}
	}
	
	protected _loadXhrAsync(url: string, options: ISpritesheetLoaderOption) {
		const xhr = this._resolveXhrOptions(options.xhr);
		
		const jsonXhr = {
			requestOptions: xhr.requestOptions,
			dataResolver: xhr.dataResolver ? xhr.dataResolver[0] : xhr.dataResolver
		}
		
		const textureXhr = {
			requestOptions: xhr.requestOptions,
			dataResolver: xhr.dataResolver ? xhr.dataResolver[1] : xhr.dataResolver
		}
		
		return this._loadFromUrlAsync(url, options.version || '', { xhr: jsonXhr }, { xhr: textureXhr });
	}
	
	private _loadFromUrlAsync(url: string, jsonVersion: string | number, jsonOptions?: JsonLoader.IJsonLoaderOption, textureOptions?: TextureLoader.ITextureLoaderOption) {
		const loader = new JsonLoader.JsonLoader();
		
		return loader.loadAsync(url, jsonOptions)
			.then(resource => {
				const json = resource.data;
				
				if (!json.meta || !json.meta.image || !json.frames) {
					return new SpritesheetLoaderResource({}, 'invalid json');
				}
				
				const basepath = url;
				const version = jsonVersion;
				const preUri = utils.resolvePath(basepath, json.meta.image);
				
				json.meta.image = version ? utils.resolveQuery(preUri, { _fv: version }) : preUri;
				
				const data: ISpritesheetJson = {
					frames: json.frames,
					meta: json.meta
				};
				
				return this._loadTextureFromJson(data, textureOptions);
			});
	}
	
	private _loadTextureFromJson(json: ISpritesheetJson, textureOptions?: TextureLoader.ITextureLoaderOption) {
		const loader = new TextureLoader.TextureLoader();
		
		return loader.loadAsync(json.meta.image, textureOptions)
			.then(resource => {
				if (resource.error) {
					return new SpritesheetLoaderResource({}, resource.error);
				}
				
				const ss = new PIXI.Spritesheet(resource.data, json);
				
				return new Promise<SpritesheetLoaderResource>(resolve => {
					ss.parse(e => {
						const resource = new SpritesheetLoaderResource(ss.textures, null);
						
						for (let i in ss.textures) {
							TextureLoader.TextureLoaderResource.removeCache(ss.textures[i]);
						}
						
						resolve(resource);
					});
				});
			})
			.catch(e => {
				return new SpritesheetLoaderResource({}, e);
			});
	}
}