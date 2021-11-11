import * as PIXI from 'pixi.js';
				
import { ContentManifestBase, ILoadedResource, ILoadedResourceDictionary, IResourceDictionary, IPreManifest, IPreManifestDictionary } from './ContentManifestBase';

export interface ILoadedImageResourceDictionary extends ILoadedResourceDictionary<PIXI.Texture> {
}

export interface IImageUrlManifestDictionary extends IPreManifestDictionary<string> {
}

/**
 * @ignore
 */
function loadImagesFromUrisAsync(manifests: IImageUrlManifestDictionary, useCache: boolean) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const loader: PIXI.Loader = new PIXI.Loader();
	const res: ILoadedImageResourceDictionary = {};
	
	for (let i in manifests) {
		loader.add(i, manifests[i].data, {
			crossOrigin: true
		});
	}
	
	if (!useCache) {
		loader.use((resource: PIXI.LoaderResource, next: () => void) => {
			if (resource.texture) {
				PIXI.Texture.removeFromCache(resource.texture);
				
				if (resource.texture.baseTexture) {
					PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture);
				}
			}
			
			next();
		});
	}
	
	return new Promise<ILoadedImageResourceDictionary>((resolve, reject) => {
		loader.load((loader, resources): void => {
			for (let i in resources) {
				const resource: PIXI.LoaderResource | undefined = resources[i];
				
				if (!resource) {
					reject(i);
					return;
				}
				
				if (resource.error) {
					if (!manifests[i].unrequired) {
						reject(i);
						return;
					}
				}
				
				res[i] = {
					resource: resource.texture,
					error: !!resource.error
				};
			}
			
			resolve(res);
		});
	});
}

export interface IImageElementManifestDictionary extends IPreManifestDictionary<HTMLImageElement> {
}

/**
 * @ignore
 */
function loadImagesFromElementsAsync(manifests: IImageElementManifestDictionary, useCache: boolean) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const res: ILoadedImageResourceDictionary = {};
	
	const promises: Promise<void>[] = [];
	for (let i in manifests) {
		promises.push(
			loadImageFromElementAsync(manifests[i], useCache)
				.then(resource => {
					res[i] = resource;
				})
				.catch((uri: string) => {
					throw i;
				})
		)
	}
	
	return Promise.all(promises)
		.then(() => {
			return res;
		});
}

/**
 * @ignore
 */
function loadImageFromElementAsync(manifest: IPreManifest<HTMLImageElement>, useCache: boolean) {
	return new Promise<ILoadedResource<PIXI.Texture>>((resolve, reject) => {
		const element = manifest.data;
		element.crossOrigin = 'anonymous';
		
		const bt = PIXI.BaseTexture.from(element);
		if (bt.valid) {
			resolve({
				resource: new PIXI.Texture(bt),
				error: false
			});
			return;
		}
		
		bt.on('loaded', (baseTexture: PIXI.BaseTexture) => {
			resolve({
				resource: new PIXI.Texture(baseTexture),
				error: false
			});
		});
		
		bt.on('error', (baseTexture: PIXI.BaseTexture, e: Error) => {
			if (manifest.unrequired) {
				resolve({
					resource: new PIXI.Texture(baseTexture),
					error: true
				});
				
				return;
			}
			
			reject(element.src);
		});
	});
}

export class ContentImageManifest extends ContentManifestBase<string | HTMLImageElement, PIXI.Texture> {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedImageResourceDictionary> {
		const manifests = this._manifests;
		
		/*
		if (version) {
			loader.defaultQueryString = `_fv=${version}`;
		}
		*/
		
		const elements: IImageElementManifestDictionary = {};
		const uris: IImageUrlManifestDictionary = {};
		
		for (let i in manifests) {
			const manifest = manifests[i];
			
			if (manifest.data instanceof HTMLImageElement) {
				const preUrl = this._resolvePath(manifest.data.src, basepath);
				
				const uri =
					version
					? this._resolveQuery(preUrl, { _fv: version })
					: preUrl;
				
				manifest.data.src = uri;
				
				elements[i] = {
					data: manifest.data,
					unrequired: manifest.unrequired
				};
			} else {
				const preUrl = this._resolvePath(manifest.data, basepath);
				const uri =
					version
					? this._resolveQuery(preUrl, { _fv: version })
					: preUrl;
				manifest.data = uri;
				uris[i] = {
					data: manifest.data,
					unrequired: manifest.unrequired
				};
			}
		}
		
		return Promise.all([
			loadImagesFromElementsAsync(elements, useCache),
			loadImagesFromUrisAsync(uris, useCache)
		])
		.then((resolvers: ILoadedImageResourceDictionary[]) => {
			return Object.assign({}, ...resolvers);
		})
		.catch((key: string) => {
			throw new Error(`Image: '${key}' cannot load.`);
		});
	}
	
	/**
	 * Destroy resources.
	 * 
	 * @override
	 */
	destroyResources(resources: IResourceDictionary<PIXI.Texture>) {
		
	}
}