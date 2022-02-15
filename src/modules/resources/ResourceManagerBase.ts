import * as LoaderBase from '../loaders/LoaderBase';

export interface IResourceManagerData<T> {
	target: T;
	unrequired: boolean;
}

export interface IResourceManagerManifest<T> {
	[ name: string ]: IResourceManagerData<T>;
}

export interface IResourceManagerOption {
	unrequired?: boolean;
}

export interface IResourceManifest<T> {
	[ name: string ]: T;
}

export interface IRawResourceDictionary<T> {
	[ name: string ]: T;
}

export abstract class ResourceManagerBase<TTarget, TResource> {
	protected _data: IResourceManagerManifest<TTarget> = {};
	//private _resources:
	
	/**
	 * Register manifests.
	 */
	add(manifest: LoaderBase.ILoaderManifest<TTarget>, options: IResourceManagerOption = {}): void {
		const unrequired = options.unrequired || false;
		
		for (let i in manifest) {
			this._data[i] = {
				target: manifest[i],
				unrequired
			};
		}
	}
	
	/**
	 * Get resources.
	 */
	getAsync(options: LoaderBase.ILoaderOption): Promise<IRawResourceDictionary<TResource>> {
		if (Object.keys(this._data).length === 0) {
			return Promise.resolve({});
		}
		
		const manifest: LoaderBase.ILoaderManifest<TTarget> = {};
		
		for (let i in this._data) {
			manifest[i] = this._data[i].target;
		}
		
		return this._loadAsync(manifest, options)
			.then(resources => {
				const res: IRawResourceDictionary<TResource> = {};
				
				for (let i in resources) {
					const resource = resources[i];
					
					if (resource.error && !this._data[i].unrequired) {
						throw resource.error;
					}
					
					res[i] = resource.data;
				}
				
				return res;
			});
	}
	
	/**
	 * Load resources.
	 */
	protected abstract _loadAsync(manifest: LoaderBase.ILoaderManifest<TTarget>, options: LoaderBase.ILoaderOption): Promise<LoaderBase.ILoaderResourceDictionary<TResource>>;
	
	destoryResources() {
	
	}
}