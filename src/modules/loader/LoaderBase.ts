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

export interface ILoaderResolvedParam {
	src: string;
	xhr?: ILoaderXhrOption;
}

export interface ILoaderXhrOptionFacotryDelegate {
	(url: string): ILoaderXhrOption;
}

export type TLoaderResourceVersion = string | number;

export interface ILoaderOption {
	basepath?: string;
	version?: TLoaderResourceVersion;
	xhr?: ILoaderXhrOption | boolean | ILoaderXhrOptionFacotryDelegate;
}

export interface ILoaderResourceDictionary<T> {
	[ name: string ]: T;
}

export interface ILoaderTargetDictionary<T> {
	[ name: string ]: T;
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
	loadAllAsync(targets: ILoaderTargetDictionary<TTarget>, options?: ILoaderOption) {
		const res: ILoaderResourceDictionary<TResource> = {};
		
		if (Object.keys(targets).length === 0) {
			return Promise.resolve(res);
		}
		
		const promises = [];
		
		for (let i in targets) {
			promises.push(
				this.loadAsync(targets[i], options)
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
	
	protected _resolveParams(target: TTarget, options: ILoaderOption = {}): ILoaderResolvedParam {
		const src = utils.resolveUri(options.basepath || '', target, options.version || '');
		
		if (typeof(src) !== 'string') {
			return {
				src
			};
		}
		
		if (!utils.isUrl(src)) {
			return {
				src
			};
		}
		
		if (!options.xhr) {
			return {
				src
			};
		}
		
		if (options.xhr === true) {
			return {
				src,
				xhr: {}
			};
		}
		
		if (typeof(options.xhr) === 'function') {
			return {
				src,
				xhr: options.xhr(src)
			};
		}
		
		return {
			src,
			xhr: options.xhr || {}
		};
	}
}