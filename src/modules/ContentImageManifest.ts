import * as PIXI from 'pixi.js';
import { ContentManifestBase, ILoadedResource, ILoadedResourceDictionary, IResourceDictionary, IPreManifest, IPreManifestDictionary, resolvePath, resolveQuery } from './ContentManifestBase';

export interface ILoadedImageResourceDictionary extends ILoadedResourceDictionary<PIXI.Texture> {
}

export interface IImageUriManifestDictionary extends IPreManifestDictionary<string> {
}

export interface IImageElementManifestDictionary extends IPreManifestDictionary<HTMLImageElement> {
}

export interface IImageElementManifest extends IPreManifest<HTMLImageElement> {
}

/**
 * @ignore
 */
function loadImagesFromUrisAsync(manifests: IImageUriManifestDictionary, basepath: string, version: string, useCache: boolean) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const loader: PIXI.Loader = new PIXI.Loader();
	if (version) {
		loader.defaultQueryString = `_fv=${version}`;
	}
	
	const res: ILoadedImageResourceDictionary = {};
	
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

/**
 * @ignore
 */
function loadImagesFromElementsAsync(manifests: IImageElementManifestDictionary, version: string) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const res: ILoadedImageResourceDictionary = {};
	
	const promises: Promise<void>[] = [];
	for (let i in manifests) {
		promises.push(
			loadImageFromElementAsync(manifests[i], version)
				.then(resource => {
					res[i] = resource;
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

export function loadImageFromElementAsync(manifest: IPreManifest<HTMLImageElement>, version: string) {
	const element = manifest.data;
	manifest.data.crossOrigin = 'anonymous';
	//const preUrl = resolvePath(manifest.data.src, basepath);
	const preUri = manifest.data.src;
	
	const uri =
		version
		? resolveQuery(preUri, { _fv: version })
		: preUri;
	
	manifest.data.src = uri;
	
	return loadImageAsync(manifest);
}

/**
 * @ognore
 */
function loadImagesFromDataUrisAsync(manifests: IImageUriManifestDictionary) {
	if (Object.keys(manifests).length === 0) {
		return Promise.resolve({});
	}
	
	const res: ILoadedImageResourceDictionary = {};
	
	const promises: Promise<void>[] = [];
	for (let i in manifests) {
		promises.push(
			loadImageAsync(manifests[i])
				.then(resource => {
					res[i] = resource;
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

export function loadImageAsync(manifest: IPreManifest<string | HTMLImageElement>) {
	return new Promise<ILoadedResource<PIXI.Texture>>((resolve, reject) => {
		const bt = PIXI.BaseTexture.from(manifest.data);
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
			
			reject();
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
		const dataUris: IImageUriManifestDictionary = {};
		const uris: IImageUriManifestDictionary = {};
		
		for (let i in manifests) {
			const manifest = manifests[i];
			
			if (manifest.data instanceof HTMLImageElement) {
				elements[i] = {
					data: manifest.data,
					unrequired: manifest.unrequired
				};
			} else if (typeof manifest.data === 'string') {
				if (manifest.data.indexOf('data:') === 0) {
					dataUris[i] = {
						data: manifest.data,
						unrequired: manifest.unrequired
					};
				} else {
					uris[i] = {
						data: manifest.data,
						unrequired: manifest.unrequired
					};
				}
			}
		}
		
		return Promise.all([
			loadImagesFromElementsAsync(elements, version),
			loadImagesFromDataUrisAsync(dataUris),
			loadImagesFromUrisAsync(uris, basepath, version, useCache)
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