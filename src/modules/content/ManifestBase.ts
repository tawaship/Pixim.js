import { Emitter } from '@tawaship/emitter';
import { ILoaderOption, ILoaderXhrOption, LoaderBase, LoaderResource, TLoaderResourceVersion } from '../loader';

export interface IManifestClass<TTarget, TRawResource, TResource extends LoaderResource<TRawResource>> {
	new(type: string): ManifestBase<TTarget, TRawResource, TResource>;
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

export type TManifestResourceVersion = TLoaderResourceVersion;

export interface IManifestLoaderXhrOptionFacotryDelegate {
	(type: string, url: string): ILoaderXhrOption;
}

export type TManifestLoaderXhrOption = IManifestLoaderXhrOptionFacotryDelegate | boolean | ILoaderXhrOption;

export interface IManifestLoaderOption {
	basepath: string;
	version: TManifestResourceVersion;
	xhr: TManifestLoaderXhrOption;
	typeOptions: ILoaderOption;
}

export const EVENT_LOADER_ASSET_LOADED = 'loaderAssetLoaded';

export abstract class ManifestBase<TTarget, TRawResource, TResource extends LoaderResource<TRawResource>> extends Emitter {
	protected _data: IResourceManagerManifest<TTarget> = {};
	protected _resources: Record<string, TResource> = {};
	private _type: string;
	
	constructor(type: string) {
		super();
		this._type = type;
	}
	
	/**
	 * Register targetss.
	 */
	add(targets: Record<string, TTarget>, options: IManifestOption = {}): void {
		const unrequired = options.unrequired || false;
		
		for (let i in targets) {
			this._data[i] = {
				target: targets[i],
				unrequired
			};
		}
	}
	
	get count() {
		return Object.keys(this._data).length;
	}
	
	/**
	 * Get resources.
	 */
	getAsync(options: IManifestLoaderOption) {
        const res: Record<string, TRawResource> = {};

		if (Object.keys(this._data).length === 0) {
			return Promise.resolve(res);
		}
		
		const loader = this._createLoader();
		loader.onLoaded = (resource: TResource) => {
			this.emit(EVENT_LOADER_ASSET_LOADED, resource);
		};
		
		const loaderOptions: ILoaderOption = Object.assign({}, options.typeOptions, {
			basepath: options.basepath,
			version: options.version,
			xhr: ((type: string, xhr: TManifestLoaderXhrOption) => {
				if (typeof(xhr) === 'function') {
					return (url: string) => {
						return xhr(type, url);
					};
				}
				
				return xhr;
			})(this._type, options.xhr)
		});
		
		const data: Record<string, TTarget> = {};
		
		for (let i in this._data) {
			data[i] = this._data[i].target;
		}
		
		return loader.loadAllAsync(data, loaderOptions)
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
	
	protected abstract _createLoader(): LoaderBase<TTarget, TRawResource, TResource>;
	
	destroyResources() {
		for (let i in this._resources) {
			this._resources[i].destroy();
		}
	}
}