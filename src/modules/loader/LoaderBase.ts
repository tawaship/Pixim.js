import * as PIXI from 'pixi.js';
import * as utils from '../utils/index';
import { Emitter } from '@tawaship/emitter';

export const EVENT_LOADER_ASSET_LOADED = 'loaderAssetLoaded';

export abstract class LoaderResource<T> {
	protected _data: T;
	protected _error: any;
	
	constructor(data: T, error: any) {
		this._data = data;
		this._error = error;
	}
	
	abstract destroy(): void;
	
	get data() {
		return this._data;
	}
	
	get error() {
		return this._error;
	}
}

export type TLoaderResourceVersion = string | number;

export interface ILoaderOption {
	basepath?: string;
	version?: TLoaderResourceVersion;
	useCache?: boolean;
}

export interface ILoaderResourceDictionary<T> {
	[ name: string ]: LoaderResource<T>;
}

export interface ILoaderTargetDictionary<T> {
	[ name: string ]: T;
}

export abstract class LoaderBase<TTarget, TResource> extends Emitter {
	protected _options: ILoaderOption;
	
	constructor(options: ILoaderOption = {}) {
		super();
		this._options = options;
	}
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	abstract loadAsync(target: TTarget, options: ILoaderOption): Promise<LoaderResource<TResource>>;
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	abstract loadAllAsync(targets: ILoaderTargetDictionary<TTarget>, options: ILoaderOption): Promise<ILoaderResourceDictionary<TResource>>;
	
	protected _resolveBasepath(basepath?: string) {
		return typeof basepath === 'string' ? basepath : (this._options.basepath || '');
	}
	
	protected _resolveVersion(version?: TLoaderResourceVersion) {
		return (typeof version === 'string' || typeof version === 'number') ? version : (this._options.version || '');
	}
	
	protected _resolveUseCache(useCache?: boolean) {
		return typeof useCache === 'boolean' ? useCache : (this._options.useCache || false);
	}
	
	protected _resolveUrl(url: string, options: ILoaderOption = {}) {
		const preUri = utils.resolvePath(url, this._resolveBasepath(options.basepath));
		const version = this._resolveVersion(options.version);
		
		const uri =
			version
			? utils.resolveQuery(preUri, { _fv: version })
			: preUri;
		
		return uri;
	}
	
	/**
	 * Fired when one of the resources has succeeded loading.
	 * 
	 * @event
	 */
	loaderAssetLoaded?(data: { target: TTarget, resource: LoaderResource<TResource> }): void {}
}

delete(LoaderBase.prototype[EVENT_LOADER_ASSET_LOADED]);