import * as PIXI from 'pixi.js';

export type TManifests = { [name: string]: string};

/**
 * @private
 */
interface IPreManifest {
	url: string;
	unrequired: boolean;
}

/**
 * @private
 */
type TPreManifests = { [name: string]: IPreManifest };

/**
 * @private
 */
interface IPostManifest extends IPreManifest {
	name: string;
}

/**
 * @protected
 */
export type TPostManifests = { [name: string]: IPostManifest };

export interface IContentManifestOption {
	unrequired?: boolean
}

/**
 * @protected
 */
export interface ILoadedResource {
	resource: any;
	error: boolean;
}

/**
 * @private
 */
type TLoadedResources = { [name: string]: ILoadedResource };

export type TResources = { [name: string]: any};

export type TContentResources = { [name: string]: TResources };

/**
 * @ignore
 */
const _cache: TResources = {};

export class ContentManifestBase {
	static manifestKey: string = 'base';
	
	private _manifests: TPreManifests = {};
	
	/**
	 * Registered manifests.
	 * 
	 * @param manifests Defined manifests.
	 * @param option Manifest option data.
	 */
	add(manifests: TManifests, options: IContentManifestOption = {}): void {
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
	getAsync(basepath: string): Promise<TResources> {
		const manifests: TPreManifests = this._manifests;
		
		const resources: TResources = {};
		const loadable: TPostManifests = {};
		const cache = _cache;
		
		for (let i in manifests) {
			const manifest: IPreManifest = manifests[i];
			const url: string = this._resolvePath(manifest.url, basepath);
			
			// query parameter is invalid for resource cache
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
			.then((res: TLoadedResources) => {
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
	 * @async
	 */
	protected _loadAsync(manifests: TPostManifests): Promise<TLoadedResources> {
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