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

export interface ILoaderResolvedXhrOption extends ILoaderXhrOption {
	src: string;
}

export type TLoaderResolvedXhrOption = ILoaderResolvedXhrOption | null;

export interface ILoaderXhrOptionFacotryDelegate {
	(url: string): TLoaderResolvedXhrOption;
}

export interface ILoaderOption {
	xhr?: ILoaderXhrOption | boolean | ILoaderXhrOptionFacotryDelegate;
}

export interface ILoaderResourceDictionary<T> {
	[ name: string ]: T;
}

export interface ILoaderTargetDictionary<T> {
	[ name: string ]: T;
}

export interface ILoaderDataDictionary<TTarget, TLoaderOption> {
	[name: string]: { src: TTarget, options?: TLoaderOption };
}

export abstract class LoaderBase<TTarget, TRawResource, TResource extends LoaderResource<TRawResource>> {
	/**
	 * Callback when one of the resources has succeeded loading.
	 */
	onLoaded?: (resource: TResource) => void;
	
	/**
	 * @fires [[LoaderBase.loaded]]
	 */
	loadAsync(target: TTarget, options?: ILoaderOption) {
		return (() => {
			return this._loadAsync(target, options);
		})()
		.then(resource => {
			if (!resource.error) {
				this.onLoaded && this.onLoaded(resource);
			}
			
			return resource;
		});
	}
	
	protected abstract _loadAsync(target: TTarget, options?: ILoaderOption): Promise<TResource>;
	
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
	
	protected _resolveXhr(target: TTarget | string, options?: ILoaderXhrOption | boolean | ILoaderXhrOptionFacotryDelegate): TLoaderResolvedXhrOption {
		if (typeof(target) !== 'string') {
			return null;
		}
		
		if (!utils.isUrl(target)) {
			return null;
		}
		
		if (!options) {
			return null;
		}
		
		if (options === true) {
			return {
				src: target,
				requestOptions: {}
			};
		}
		
		if (typeof(options) === 'function') {
			return options(target);
		}
		
		return {
			src: target,
			requestOptions: options.requestOptions || {}
		};
	}
}