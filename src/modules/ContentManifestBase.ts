import * as PIXI from 'pixi.js';

export interface IManifestDictionary<T> {
	[name: string]: T;
}

export interface IPreManifest<T> {
	data: T;
	unrequired: boolean;
}

export interface IPreManifestDictionary<T> {
	[name: string]: IPreManifest<T>;
}

export interface IPostManifest<T> extends IPreManifest<T> {
	//name: string;
}

export interface IPostManifestDictionary<T> {
	[name: string]: IPostManifest<T>;
}

export interface IContentManifestOption {
	unrequired?: boolean
}

export interface ILoadedResource<T> {
	resource: T;
	error: boolean;
}

export interface ILoadedResourceDictionary<T> {
	[name: string]: ILoadedResource<T>;
}

export interface IResourceDictionary<T> {
	[name: string]: T;
}

export interface IManifestClass {
	new(): ContentManifestBase<any, any>;
}

/**
 * @ignore
 */
// const _cache: IResourceDictionary = {};

export abstract class ContentManifestBase<TData, TResource> {
	protected _manifests: IPreManifestDictionary<TData> = {};
	
	/**
	 * Register manifests.
	 * 
	 * @param manifests Defined manifests.
	 * @param option Manifest option data.
	 */
	add(manifests: IManifestDictionary<TData>, options: IContentManifestOption = {}): void {
		const unrequired: boolean = options.unrequired || false;
		
		for (let i in manifests) {
			this._manifests[i] = {
				data: manifests[i],
				unrequired
			};
		}
	}
	
	/**
	 * Get resources.
	 * 
	 * @param basepath Basement directory path of assets.
	 */
	getAsync(basepath: string, version: string, useCache: boolean): Promise<IResourceDictionary<TResource>> {
		const resources: IResourceDictionary<TResource> = {};
		
		if (Object.keys(this._manifests).length === 0) {
			return Promise.resolve(resources);
		}
		
		return this._loadAsync(basepath, version, useCache)
			.then((res: ILoadedResourceDictionary<TResource>) => {
				for (let i in res) {
					resources[i] = res[i].resource;
				}
				
				return resources;
			});
	}
	
	/**
	 * Load resources.
	 */
	protected abstract _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedResourceDictionary<TResource>>;
	
	/**
	 * Destroy resources.
	 */
	abstract destroyResources(resources: IResourceDictionary<TResource>): void;
	
	/**
	 * Normalize asset path.
	 */
	protected _resolvePath(path: string, basepath: string): string {
		if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
			return path;
		} else {
			return PIXI.utils.url.resolve(basepath, path);
		}
	}
	
	/**
	 * Normalize uri query.
	 */
	protected _resolveQuery(uri: string, queries: { [ name: string ]: string }): string {
		if (uri.indexOf('data:') === 0) {
			return uri;
		} else {
			const q = [];
			for (let i in queries) {
				q.push(`${i}=${queries[i]}`);
			}
			
			return `${uri}${uri.match(/\?/) ? '&' : '?'}${q.join('&')}`;
		}
	}
}