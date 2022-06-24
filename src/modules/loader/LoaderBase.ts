import * as PIXI from 'pixi.js';
import * as utils from '../utils/index';

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

export type TLoaderPathDelegate = string | ((url: string) => string);

export interface IFetchRequestOption {
	[key: string]: string;
}

export interface ILoaderXhrOption<TResolver> {
	requestOptions?: IFetchRequestOption;
	dataResolver?: TResolver;
}

export type TLoaderResourceVersion = string | number;

export interface ILoaderOption<TResolver> {
	basepath?: string;
	version?: TLoaderResourceVersion;
	useCache?: boolean;
	xhrOptions?: ILoaderXhrOption<TResolver>;
}

export interface ILoaderResourceDictionary<T> {
	[ name: string ]: LoaderResource<T>;
}

export interface ILoaderTargetDictionary<T> {
	[ name: string ]: T;
}

export abstract class LoaderBase<TTarget, TResource, TFetchResolver> {
	protected _options: ILoaderOption<TFetchResolver>;
	
	/**
	 * Callback when one of the resources has succeeded loading.
	 */
	onLoaded?: (resource: LoaderResource<TResource>) => void;
	
	constructor(options: ILoaderOption<TFetchResolver> = {}) {
		this._options = options || {};
	}
	
	protected _resolveUri(uri: string) {
		if (!utils.isUrl(uri)) {
			return uri;
		}
		
		const basepath = this._options.basepath || '';
		const version = this._options.version || '';
		const preUri = utils.resolvePath(basepath, uri);
		
		return version ? utils.resolveQuery(preUri, { _fv: version }) : preUri;
	}
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	loadAsync(target: TTarget, xhrOptions?: ILoaderXhrOption<TFetchResolver>) {
		if (typeof(target) !== 'string') {
			return this._loadAsync(target);
		}
		
		const uri = this._resolveUri(target);
		
		return (() => {
			if (this._options.xhrOptions) {
				return this._loadXhrAsync(uri);
			}
			
			return this._loadAsync(uri);
		})()
		.then(resource => {
			if (!resource.error) {
				this.onLoaded && this.onLoaded(resource);
			}
			
			return resource;
		});
	}
	
	protected abstract _loadAsync(target: TTarget): Promise<LoaderResource<TResource>>;
	
	protected abstract _loadXhrAsync(url: string): Promise<LoaderResource<TResource>>;
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	loadAllAsync(targets: ILoaderTargetDictionary<TTarget>): Promise<ILoaderResourceDictionary<TResource>> {
		if (Object.keys(targets).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const res: ILoaderResourceDictionary<TResource> = {};
		
		for (let i in targets) {
			promises.push(
				this.loadAsync(targets[i])
					.then(resource => {
						res[i] = resource;
					})
			);
		}
		
		return Promise.all(promises)
			.then(() => {
				return res;
			});
	}
	/*
	protected _resolveUseCache(useCache?: boolean) {
		return typeof useCache === 'boolean' ? useCache : (this._options.useCache || false);
	}
	*/
	/*
	protected _resolveBasepath(url: string, basepath?: TLoaderResourceBasepath) {
		if (typeof basepath === 'string') {
			return basepath;
		}
		
		if (typeof basepath === 'function') {
			return basepath(url);
		}
		
		if (typeof this._options.basepath === 'string') {
			return this._options.basepath;
		}
		
		if (typeof this._options.basepath === 'function') {
			return this._options.basepath(url);
		}
		
		return '';
	}
	
	protected _resolveVersion(version?: TLoaderResourceVersion) {
		return (typeof version === 'string' || typeof version === 'number') ? version : (this._options.version || '');
	}
	
	protected _resolveUseCache(useCache?: boolean) {
		return typeof useCache === 'boolean' ? useCache : (this._options.useCache || false);
	}
	
	protected _resolveUrl(url: string, options: ILoaderOption = {}) {
		const preUri = utils.resolvePath(url, this._resolveBasepath(url, options.basepath));
		const version = this._resolveVersion(options.version);
		
		const uri =
			version
			? utils.resolveQuery(preUri, { _fv: version })
			: preUri;
		
		return uri;
	}
	*/
}