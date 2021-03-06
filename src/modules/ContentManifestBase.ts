import * as PIXI from 'pixi.js';

export interface IManifestDictionary {
	[name: string]: string;
}

export interface IPreManifest {
	url: string;
	unrequired: boolean;
}

export interface IPreManifestDictionary {
	[name: string]: IPreManifest;
}

export interface IPostManifest extends IPreManifest {
	//name: string;
}

export interface IPostManifestDictionary {
	[name: string]: IPostManifest;
}

export interface IContentManifestOption {
	unrequired?: boolean
}

export interface ILoadedResource {
	resource: any;
	error: boolean;
}

export interface ILoadedResourceDictionary {
	[name: string]: ILoadedResource;
}

export interface IResourceDictionary {
	[name: string]: any;
}

export interface IContentResourceDictionary {
	[name: string]: IResourceDictionary;
}

/**
 * @ignore
 */
// const _cache: IResourceDictionary = {};

export abstract class ContentManifestBase {
	private _manifests: IPreManifestDictionary = {};
	
	/**
	 * Register manifests.
	 * 
	 * @param manifests Defined manifests.
	 * @param option Manifest option data.
	 */
	add(manifests: IManifestDictionary, options: IContentManifestOption = {}): void {
		const unrequired: boolean = options.unrequired || false;
		
		for (let i in manifests) {
			this._manifests[i] = {
				url: manifests[i],
				unrequired
			};
		}
	}
	
	/**
	 * Get resources.
	 * 
	 * @param basepath Basement directory path of assets.
	 */
	getAsync(basepath: string, version: string, useCache: boolean): Promise<IResourceDictionary> {
		const manifests: IPreManifestDictionary = this._manifests;
		
		const resources: IResourceDictionary = {};
		const loadable: IPostManifestDictionary = {};
		//const cache = _cache;
		
		for (let i in manifests) {
			const manifest: IPreManifest = manifests[i];
			const url: string = this._resolvePath(manifest.url, basepath);
			
			
			// query parameter is invalid for resource cache
			//const name: string = url.replace(/\?.*/, '');
			
			/*
			if (cache[name]) {
				resources[i] = cache[name];
				continue;
			}
			*/
			
			loadable[i] = {
				url,
			//	name,
				unrequired: manifest.unrequired
			};
		}
		
		if (Object.keys(loadable).length === 0) {
			return Promise.resolve(resources);
		}
		
		return this._loadAsync(loadable, version, useCache)
			.then((res: ILoadedResourceDictionary) => {
				for (let i in res) {
					resources[i] = res[i].resource;
					/*
					if (!res[i].error) {
						cache[loadable[i].name] = res[i].resource;
					}
					*/
				}
				
				return resources;
			});
	}
	
	/**
	 * Load resources.
	 */
	protected _loadAsync(manifests: IPostManifestDictionary, version: string, useTextureCache: boolean): Promise<ILoadedResourceDictionary> {
		return Promise.resolve({});
	}
	
	/**
	 * Normalize asset path.
	 */
	private _resolvePath(path: string, basepath: string): string {
		if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
			return path;
		} else {
			return PIXI.utils.url.resolve(basepath, path);
		}
	}
}