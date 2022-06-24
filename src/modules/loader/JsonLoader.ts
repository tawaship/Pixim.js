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
	protected _loadAsync(target: TJsonLoaderTarget) {
		return fetch(target)
			.then(res => res.json())
			.then(json => new JsonLoaderResource(json, null))
			.catch((e: any) => new JsonLoaderResource({}, e));
	}
	
	protected _loadXhrAsync(url: string) {
		const xhrOptions = this._options.xhrOptions || {};
		
		return fetch(url, xhrOptions.requestOptions || {})
			.then(res => {
				return xhrOptions.dataResolver ? xhrOptions.dataResolver(res) : res.json();
			})
			.then(json => new JsonLoaderResource(json, null))
			.catch((e: any) => new JsonLoaderResource({}, e));
	}
}