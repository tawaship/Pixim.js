import * as PIXI from 'pixi.js';

export type ResourceManifests = { [name: string]: string};

/**
 * @private
 */
interface IManifest {
	url: string;
	unrequired: boolean;
}

/**
 * @private
 */
type Manifests = { [name: string]: IManifest };

/**
 * @private
 */
interface ILodableManifest extends IManifest {
	name: string;
}

export type LodableManifests = { [name: string]: ILodableManifest };

export interface IContentResrouceOption {
	unrequired?: boolean
}

export interface ILoadedResource {
	resource: any;
	error: boolean;
}

export type LoadedResources = { [name: string]: ILoadedResource };

export type Resources = { [name: string]: any};

export class ContentResource {
	private static _cache: Resources = {};
	
	private _manifests: Manifests = {};
	
	/**
	 * Registered manifests.
	 * 
	 * @param manifests Defined manifests.
	 * @param option Manifest option data.
	 */
	add(manifests: ResourceManifests, options: IContentResrouceOption = {}) {
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
	 * @async
	 * @param basepath Basement directory path of assets.
	 */
	getAsync(basepath: string): Promise<Resources> {
		const manifests: Manifests = this._manifests;
		
		const resources: Resources = {};
		const loadable: LodableManifests = {};
		const cache = ContentResource._cache;
		
		for (let i in manifests) {
			const manifest: IManifest = manifests[i];
			const url: string = this._resolvePath(basepath, manifest.url);
			const name: string = url.replace(/\?.*/, '');
			
			if (cache[name]) {
				resources[i] = cache[name];
				continue;
			}
			
			loadable[i] = {
				url,
				name,
				unrequired: manifest.unrequired
			};
		}
		
		if (Object.keys(loadable).length === 0) {
			return Promise.resolve(resources);
		}
		
		return this._loadAsync(loadable)
			.then((res: LoadedResources) => {
				for (let i in res) {
					resources[i] = res[i].resource;
					
					if (!res[i].error) {
						cache[loadable[i].name] = res[i].resource;
					}
				}
				
				return resources;
			});
	}
	
	/**
	 * Load resources.
	 * 
	 * @abstruct
	 * @async
	 */
	protected _loadAsync(manifests: LodableManifests): Promise<LoadedResources> {
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