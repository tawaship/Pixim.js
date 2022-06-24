import * as LoaderBase from './LoaderBase';

export interface IJsonData {
	[name: string]: any;
}

export type TJsonLoaderRawResource = IJsonData;

export class JsonLoaderResource extends LoaderBase.LoaderResource<TJsonLoaderRawResource> {
	destroy() {
		
	}
}

export type TJsonLoaderTarget = string;

export interface IJsonLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsonLoaderTarget> {

}

export interface IJsonLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TJsonLoaderRawResource> {

}

export type TJsonLoaderFetchResolver = (res: Response) => IJsonData;

export interface IJsonLoaderOption extends LoaderBase.ILoaderOption<TJsonLoaderFetchResolver> {

}

export class JsonLoader extends LoaderBase.LoaderBase<TJsonLoaderTarget, TJsonLoaderRawResource, TJsonLoaderFetchResolver> {
	protected _loadAsync(target: TJsonLoaderTarget, options: IJsonLoaderOption = {}) {
		return fetch(target)
			.then(res => res.json())
			.then(json => new JsonLoaderResource(json, null))
			.catch((e: any) => new JsonLoaderResource({}, e));
	}
	
	protected _loadXhrAsync(url: string, options: IJsonLoaderOption) {
		const xhr = this._resolveXhrOptions(options.xhr);
		
		return fetch(url, xhr.requestOptions)
			.then(res => {
				return xhr.dataResolver ? xhrOptions.dataResolver(res) : res.json();
			})
			.then(json => new JsonLoaderResource(json, null))
			.catch((e: any) => new JsonLoaderResource({}, e));
	}
}