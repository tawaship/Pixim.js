import * as LoaderBase from '../loader/LoaderBase';

export interface IManifestClass {
	new(): ManifestBase<any, any>;
}

export interface IResourceManagerData<T> {
	target: T;
	unrequired: boolean;
}

export interface IResourceManagerManifest<T> {
	[ name: string ]: IResourceManagerData<T>;
}

export interface IManifestOption {
	unrequired?: boolean;
}

export interface IResourceManifest<T> {
	[ name: string ]: T;
}

export interface IRawResourceDictionary<T> {
	[ name: string ]: T;
}

export interface IManifestTargetDictionary<T> extends LoaderBase.ILoaderTargetDictionary<T> {

}

export abstract class ManifestBase<TTarget, TResource> {
	protected _data: IResourceManagerManifest<TTarget> = {};
	protected _resources: LoaderBase.ILoaderResourceDictionary<TResource> = {};
	
	/**
	 * Register targetss.
	 */
	add(targets: IManifestTargetDictionary<TTarget>, options: IManifestOption = {}): void {
		const unrequired = options.unrequired || false;
		
		for (let i in targets) {
			this._data[i] = {
				target: targets[i],
				unrequired
			};
		}
	}
	
	/**
	 * Get resources.
	 */
	getAsync(options: LoaderBase.ILoaderOption) {
		if (Object.keys(this._data).length === 0) {
			return Promise.resolve({});
		}
		
		const res: IRawResourceDictionary<TResource> = {};
		const targets: IManifestTargetDictionary<TTarget> = {};
		
		for (let i in this._data) {
			targets[i] = this._data[i].target;
		}
		
		return this._loadAsync(targets, options)
			.then(resources => {
				for (let i in resources) {
					const resource = resources[i];
					
					if (resource.error && !this._data[i].unrequired) {
						throw resource.error;
					}
				}
				
				for (let i in resources) {
					const resource = resources[i];
					
					this._resources[i] = resource;
					res[i] = resource.data;
				}
				
				return res;
			});
	}
	
	/**
	 * Load resources.
	 */
	protected abstract _loadAsync(targets: IManifestTargetDictionary<TTarget>, options: LoaderBase.ILoaderOption): Promise<LoaderBase.ILoaderResourceDictionary<TResource>>;
	
	destroyResources() {
		for (let i in this._resources) {
			this._resources[i].destroy();
		}
	}
}