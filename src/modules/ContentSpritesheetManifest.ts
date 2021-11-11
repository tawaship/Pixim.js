import * as PIXI from 'pixi.js';
import { ContentManifestBase, ILoadedResourceDictionary, IResourceDictionary, IPreManifest, IPreManifestDictionary, resolvePath, resolveQuery  } from './ContentManifestBase';
import { loadImageFromElementAsync, loadImageAsync } from './ContentImageManifest';

export interface ILoadedSpritesheetResourceDictionary extends ILoadedResourceDictionary<PIXI.ITextureDictionary> {
}

export interface ISpritesheetUriManifestDictionary extends IPreManifestDictionary<string> {
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

export interface ISpritesheetJsonManifestDictionary extends IPreManifestDictionary<ISpritesheetJson> {
}


/**
 * @ignore
 */
function loadSpritesheetsFromUrisAsync(manifests: ISpritesheetUriManifestDictionary, basepath: string, version: string, useCache: boolean) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const loader: PIXI.Loader = new PIXI.Loader();
	if (version) {
		loader.defaultQueryString = `_fv=${version}`;
	}
	
	const res: ILoadedSpritesheetResourceDictionary = {};
	
	for (let i in manifests) {
		const manifest = manifests[i];
		
		const preUrl = resolvePath(manifest.data, basepath);
		
		const uri =
			version
			? resolveQuery(preUrl, { _fv: version })
			: preUrl;
		
		loader.add(i, uri, {
			crossOrigin: true
		});
	}
	
	if (!useCache) {
		loader.use((resource: PIXI.LoaderResource, next: () => void) => {
			if (resource.textures) {
				for (let i in resource.textures) {
					const texture = resource.textures[i];
					if (!texture) {
						continue;
					}
					
					PIXI.Texture.removeFromCache(texture);
					
					if (texture.baseTexture) {
						PIXI.BaseTexture.removeFromCache(texture.baseTexture);
					}
				}
			}
			
			if (resource.texture) {
				PIXI.Texture.removeFromCache(resource.texture);
				
				if (resource.texture.baseTexture) {
					PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture);
				}
			}
			
			next();
		});
	}
	
	return new Promise<ILoadedSpritesheetResourceDictionary>((resolve, reject) => {
		loader.load((loader, resources): void => {
			for (let i in resources) {
				if (!manifests[i]) {
					continue;
				}
				
				const resource: PIXI.LoaderResource | undefined = resources[i];
				
				if (!resource) {
					reject(i);
					return;
				}
				
				const textures: PIXI.ITextureDictionary = resource.textures || {};
				
				if (resource.error && !manifests[i].unrequired) {
					reject(i);
					return;
				}
				
				res[i] = {
					resource: textures,
					error: !!resource.error
				};
			}
			
			resolve(res);
		});
	});
}

/**
 * @ignore
 */
function loadSpritesheetsFromJsonsAsync(manifests: ISpritesheetJsonManifestDictionary, basepath: string, version: string) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const res: ILoadedSpritesheetResourceDictionary = {};
	
	const promises: Promise<void>[] = [];
	for (let i in manifests) {
		const manifest = manifests[i];
		const data = manifest.data.meta.image;
		const unrequired = manifest.unrequired;
		
		promises.push(
			(() => {
				if (data instanceof HTMLImageElement) {
					return loadImageFromElementAsync({
						data,
						unrequired
					}, version);
				}
				
				if (typeof data === 'string') {
					if (data.indexOf('data:') === 0) {
						return loadImageAsync({
							data,
							unrequired
						});
					}
					
					const preUri = resolvePath(data, basepath);
					const uri =
						version
						? resolveQuery(preUri, { _fv: version })
						: preUri;
					
					return loadImageAsync({
						data: uri,
						unrequired
					});
				}
				
				return Promise.reject();
			})()
				.then(resource => {
					const ss = new PIXI.Spritesheet(resource.resource, manifest.data);
					
					return new Promise<void>(resolve => {
						ss.parse(() => {
							res[i] = {
								resource: ss.textures,
								error: false
							};
							
							resolve();
						});
					});
				})
				.catch(() => {
					throw i;
				})
		);
	}
	
	return Promise.all(promises)
		.then(() => {
			return res;
		});
}

export class ContentSpritesheetManifest extends ContentManifestBase<string, PIXI.ITextureDictionary> {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedSpritesheetResourceDictionary> {
		const manifests = this._manifests;
		
		const jsons: ISpritesheetJsonManifestDictionary = {};
		const uris: ISpritesheetUriManifestDictionary = {};
		
		for (let i in manifests) {
			const manifest = manifests[i];
			
			if (typeof manifest.data === 'object') {
				jsons[i] = {
					data: manifest.data,
					unrequired: manifest.unrequired
				};
			} else if (typeof manifest.data === 'string') {
				uris[i] = {
					data: manifest.data,
					unrequired: manifest.unrequired
				};
			}
		}
		
		return Promise.all([
			loadSpritesheetsFromJsonsAsync(jsons, basepath, version),
			loadSpritesheetsFromUrisAsync(uris, basepath, version, useCache)
		])
		.then((resolvers: ILoadedSpritesheetResourceDictionary[]) => {
			return Object.assign({}, ...resolvers);
		})
		.catch((key: string) => {
			throw new Error(`Spritesheet: '${key}' cannot load.`);
		});
	}
	
	/**
	 * Destroy resources.
	 * 
	 * @override
	 */
	destroyResources(resources: IResourceDictionary<PIXI.ITextureDictionary>) {
		
	}
}