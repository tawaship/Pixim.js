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

export interface ILoaderXhrOptionFacotryDelegate<TLoaderXhrOption> {
	(type: string, url: string): Promise<TLoaderXhrOption>;
}

export interface IManifestLoaderOption<TLoaderXhrOption> {
	basepath?: string;
	version?: TManifestResourceVersion;
	useCache?: boolean;
	xhr?: ILoaderXhrOptionFacotryDelegate<TLoaderXhrOption> | boolean;
}

export const EVENT_LOADER_ASSET_LOADED = 'loaderAssetLoaded';

export abstract class ManifestBase<TTarget, TResource, TResolver> extends Emitter {
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
	a(){}
	get count() {
		return Object.keys(this._data).length;
	}
	
	/**
	 * Get resources.
	 */
	getAsync(options: IManifestLoaderOption<LoaderBase.ILoaderXhrOption<()=>void>>) {
		if (Object.keys(this._data).length === 0) {
			return Promise.resolve({});
		}
		
		const res: IRawResourceDictionary<TResource> = {};
		const data: LoaderBase.ILoaderDataDictionary<TTarget, LoaderBase.ILoaderOption<():void>> = {};
		
		const loader = this._createLoader();
		loader.onLoaded = resource => {
			this.emit(EVENT_LOADER_ASSET_LOADED, resource);
		};
		
		return (() => {
			const promises: Promise<void>[] = [];
			
			for (let i in this._data) {
				const target = this._resolveTarget(this._data[i].target, options);
				const loaderOptions = this._buildOption(options);
				
				data[i] = { target, options: loaderOptions };
				
				if (typeof(target) !== 'string') {
					loaderOptions.xhr = false;
					continue;
				}
				
				if (typeof(options.xhr) === 'boolean') {
					loaderOptions.xhr = options.xhr;
					continue;
				}
				
				if (typeof(options.xhr) !== 'function') {
					loaderOptions.xhr = false;
					continue;
				}
				
				promises.push(
					options.xhr(this._type, target)
						.then(xhr => {
							loaderOptions.xhr = xhr;
						})
				);
			}
			
			return Promise.all(promises).then(() => data);
		})()
		.then(data => {
			return loader.loadAllAsync(data);
		})
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
	
	protected abstract _createLoader(): LoaderBase.LoaderBase<TTarget, TResource, LoaderBase.ILoaderOption<():void>>;
	
	protected _resolveTarget(target: TTarget, options: IManifestLoaderOption<LoaderBase.ILoaderXhrOption<():void>>): TTarget {
		return this._resolveTargetPath(target, options);
	}
	
	protected _buildOption(options: IManifestLoaderOption<LoaderBase.ILoaderXhrOption<():void>>): IManifestLoaderOption<LoaderBase.ILoaderXhrOption<():void>> {
		return { xhr: options.xhr };
	}
	
	protected _resolveTargetPath(target: TTarget, options: IManifestLoaderOption<LoaderBase.ILoaderXhrOption<():void>> = {}) {
		if (typeof(target) !== 'string') {
			return target;
		}
		
		if (!utils.isUrl(target)) {
			return target;
		}
		
		const basepath = options.basepath || '';
		const version = options.version || '';
		const preUri = utils.resolvePath(basepath, target);
		
		return version ? utils.resolveQuery(preUri, { _fv: version }) : preUri;
	}
	
	destroyResources() {
		for (let i in this._resources) {
			this._resources[i].destroy();
		}
	}
}