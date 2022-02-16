import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import * as TextureLoader from './TextureLoader';
import * as utils from '../utils/index';

export type TSpritesheetLoaderRawResource = PIXI.ITextureDictionary;

export class SpritesheetLoaderResource extends LoaderBase.LoaderResource<TSpritesheetLoaderRawResource> {
	destroy() {
		for (let i in this._data) {
			TextureLoader.TextureLoaderResource.removeCache(this._data[i]);
		}
		
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

export interface ISpritesheetLoaderOption extends LoaderBase.ILoaderOption {

}

/**
 * @ignore
 */
const KEY_SINGLE_SPRITESHEET = '--single-spritesheet';

export class SpritesheetLoader extends LoaderBase.LoaderBase<TSpritesheetLoaderTarget, TSpritesheetLoaderRawResource> {
	loadAsync(target: TSpritesheetLoaderTarget, options: ISpritesheetLoaderOption = {}) {
		if (typeof target === 'string') {
			return this._loadFromUrlsAsync({ [KEY_SINGLE_SPRITESHEET]: target }, options)
				.then(resources => {
					return resources[KEY_SINGLE_SPRITESHEET];
				});
		} else {
			return this._loadFromJsonsAsync({ [KEY_SINGLE_SPRITESHEET]: target }, options)
				.then(resources => {
					return resources[KEY_SINGLE_SPRITESHEET];
				});
		}
	}
	
	loadAllAsync(targets: ISpritesheetLoaderTargetDictionary, options: ISpritesheetLoaderOption = {}) {
		if (Object.keys(targets).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const urls: ISpritesheetLoaderUrlTargetDictionary = {};
		const jsons: ISpritesheetLoaderJsonTargetDictionary = {};
		
		for (let i in targets) {
			const target = targets[i];
			
			if (typeof target === 'string') {
				urls[i] = target;
			} else {
				jsons[i] = target;
			}
		}
		
		return Promise.all([
			this._loadFromUrlsAsync(urls, options),
			this._loadFromJsonsAsync(jsons, options)
		])
		.then(resolvers => {
			return Object.assign({}, ...resolvers);
		});
	}
	
	private _loadFromUrlsAsync(targets: ISpritesheetLoaderUrlTargetDictionary, options: ISpritesheetLoaderOption = {}) {
		const res: ISpritesheetLoaderResourceDictionary = {};
		
		if (Object.keys(targets).length === 0) {
			return Promise.resolve(res);
		}
		
		const loader = new PIXI.Loader();
		
		const version = this._resolveVersion(options.version);
		if (version) {
			loader.defaultQueryString = `_fv=${version}`;
		}
		
		const basepath = this._resolveBasepath(options.basepath);
		for (let i in targets) {
			const target = targets[i];
			const uri = utils.resolvePath(target, basepath);
			loader.add(i, uri, {
				crossOrigin: true
			});
		}
		
		const useCache = this._resolveUseCache(options.useCache);
		if (!useCache) {
			loader.use((resource: PIXI.LoaderResource, next: () => void) => {
				if (resource.textures) {
					for (let i in resource.textures) {
						const texture = resource.textures[i];
						
						if (!texture) {
							continue;
						}
						
						TextureLoader.TextureLoaderResource.removeCache(texture);
					}
				}
				
				if (resource.texture) {
					TextureLoader.TextureLoaderResource.removeCache(resource.texture);
				}
				
				next();
			});
		}
		
		return new Promise<ISpritesheetLoaderResourceDictionary>(resolve => {
			loader.load((loader, resources) => {
				for (let i in resources) {
					if (!targets[i]) {
						continue;
					}
					
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						res[i] = new SpritesheetLoaderResource({}, 'invalid json');
						continue;
					}
					
					if (resource.error) {
						res[i] = new SpritesheetLoaderResource({}, resource.error);
						continue;
					}
					
					if (!resource.textures) {
						res[i] = new SpritesheetLoaderResource({}, 'invalid texture');
						continue;
					}
					
					res[i] = new SpritesheetLoaderResource(resource.textures, null);
				}
				
				resolve(res);
			});
		});
	}
	
	private _loadFromJsonsAsync(targets: ISpritesheetLoaderJsonTargetDictionary, options: ISpritesheetLoaderOption = {}) {
		const res: ISpritesheetLoaderResourceDictionary = {};
		
		if (Object.keys(targets).length === 0) {
			return Promise.resolve(res);
		}
		
		const useCache = this._resolveUseCache(options.useCache);
		
		const promises = [];
		const loader = new TextureLoader.TextureLoader(options);
		
		for (let i in targets) {
			const target = targets[i];
			promises.push(
				loader.loadAsync(target.meta.image, options)
					.then(resource => {
						if (resource.error) {
							res[i] = new SpritesheetLoaderResource({}, resource.error);
							
							return Promise.resolve();
						}
						
						const ss = new PIXI.Spritesheet(resource.data, target);
						
						return new Promise<void>(resolve => {
							ss.parse(e => {
								res[i] = new SpritesheetLoaderResource(ss.textures, null);
								
								if (!useCache) {
									for (let i in ss.textures) {
										TextureLoader.TextureLoaderResource.removeCache(ss.textures[i]);
									}
								}
								
								resolve();
							});
						});
					})
					.catch(e => {
						res[i] = new SpritesheetLoaderResource({}, e);
						
						return Promise.resolve();
					})
			);
		}
		
		return Promise.all(promises)
			.then(() => {
				return res;
			});
	}
}