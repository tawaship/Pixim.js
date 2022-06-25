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

export interface IFetchRequestOption {
	[key: string]: string;
}

export interface ILoaderXhrOption {
	requestOptions?: IFetchRequestOption;
}

export interface ILoaderOption {
	xhr?: ILoaderXhrOption | boolean;
}

export interface ILoaderResourceDictionary<T> {
	[ name: string ]: LoaderResource<T>;
}

export interface ILoaderTargetDictionary<T> {
	[ name: string ]: T;
}

export interface ILoaderDataDictionary<TTarget, TLoaderOption> {
	[name: string]: { src: TTarget, options?: TLoaderOption };
}

export abstract class LoaderBase<TTarget, TResource> {
	/**
	 * Callback when one of the resources has succeeded loading.
	 */
	onLoaded?: (resource: LoaderResource<TResource>) => void;
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	loadAsync(target: TTarget, options?: ILoaderOption) {
		return (() => {
			if (!options) {
				return this._loadAsync(target, options);
			}
			
			if (typeof(target) !== 'string') {
				return this._loadAsync(target, options);
			}
			
			if (!utils.isUrl(target)) {
				return this._loadAsync(target, options);
			}
			
			if (!options.xhr) {
				return this._loadAsync(target, options);
			}
			
			return this._loadXhrAsync(target, options);
		})()
		.then(resource => {
			if (!resource.error) {
				this.onLoaded && this.onLoaded(resource);
			}
			
			return resource;
		});
	}
	
	protected abstract _loadAsync(target: TTarget, options?: ILoaderOption): Promise<LoaderResource<TResource>>;
	
	protected abstract _loadXhrAsync(url: string, options?: ILoaderOption): Promise<LoaderResource<TResource>>;
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	loadAllAsync(data: ILoaderDataDictionary<TTarget, ILoaderOption>) {
		const res: ILoaderResourceDictionary<TResource> = {};
		
		if (Object.keys(data).length === 0) {
			return Promise.resolve(res);
		}
		
		const promises = [];
		
		for (let i in data) {
			promises.push(
				this.loadAsync(data[i].src, data[i].options)
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
	
	protected _resolveXhrOptions(xhr?: ILoaderXhrOption | boolean): ILoaderXhrOption {
		if (!xhr) {
			return {};
		}
		
		const requestOptions: IFetchRequestOption = typeof(xhr) === 'boolean' ? {} : (xhr.requestOptions || {});
		
		return {
			requestOptions
		};
	}
}