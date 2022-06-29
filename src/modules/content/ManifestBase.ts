import * as LoaderBase from '../loader/LoaderBase';
import { Emitter } from '@tawaship/emitter';
import * as utils from '../utils/index';

export interface IManifestClass {
	new(type: string): ManifestBase<any, any, any>;
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

export type TManifestResourceVersion = string | number;

export interface IManifestLoaderXhrOptionFacotryDelegate {
	(type: string, url: string): LoaderBase.TLoaderResolvedXhrOption;
}

export type TLoaderXhrOption = IManifestLoaderXhrOptionFacotryDelegate | boolean | LoaderBase.ILoaderXhrOption;

export interface IManifestLoaderOption {
	basepath: string;
	version: TManifestResourceVersion;
	xhr: TLoaderXhrOption;
	others: { [key: string]: any };
}

export const EVENT_LOADER_ASSET_LOADED = 'loaderAssetLoaded';

export abstract class ManifestBase<TTarget, TRawResource, TResource extends LoaderBase.LoaderResource<TRawResource>> extends Emitter {
	protected _data: IResourceManagerManifest<TTarget> = {};
	protected _resources: LoaderBase.ILoaderResourceDictionary<TResource> = {};
	private _type: string;
	
	constructor(type: string) {
		super();
		this._type = type;
	}
	
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
	
	get count() {
		return Object.keys(this._data).length;
	}
	
	/**
	 * Get resources.
	 */
	getAsync(options: IManifestLoaderOption) {
		if (Object.keys(this._data).length === 0) {
			return Promise.resolve({});
		}
		
		const res: IRawResourceDictionary<TRawResource> = {};
		
		const loader = this._createLoader();
		loader.onLoaded = (resource: TResource) => {
			this.emit(EVENT_LOADER_ASSET_LOADED, resource);
		};
		
		const loaderOptions: LoaderBase.ILoaderOption = this._getAppendOption(options);
		
		const data: LoaderBase.ILoaderDataDictionary<TTarget, LoaderBase.ILoaderOption> = {};
		
		for (let i in this._data) {
			const src = this._resolveTarget(this._data[i].target, options);
			data[i] = { src, options: Object.assign({}, loaderOptions, { xhr: options.xhr }) };
		}
		
		return loader.loadAllAsync(data)
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
	
	protected abstract _createLoader(): LoaderBase.LoaderBase<TTarget, TRawResource, TResource>;
	
	protected _resolveTarget(target: TTarget, options: IManifestLoaderOption): TTarget {
		return utils.resolveUri(options.basepath || '', target, options.version);
	}
	
	protected _getAppendOption(options: IManifestLoaderOption): LoaderBase.ILoaderOption {
		return {};
	}
	
	destroyResources() {
		for (let i in this._resources) {
			this._resources[i].destroy();
		}
	}
}