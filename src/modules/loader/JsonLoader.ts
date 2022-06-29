import * as LoaderBase from './LoaderBase';

export interface IJsonData {
	[name: string]: any;
}

export type TJsonLoaderRawResource = IJsonData;

export class JsonLoaderResource extends LoaderBase.LoaderResource<TJsonLoaderRawResource> {
	destroy() {
		this._data = {};
	}
}

export type TJsonLoaderTarget = string;

export interface IJsonLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsonLoaderTarget> {

}

export interface IJsonLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<JsonLoaderResource> {

}

export interface IJsonLoaderOption extends LoaderBase.ILoaderOption {

}

export class JsonLoader extends LoaderBase.LoaderBase<TJsonLoaderTarget, TJsonLoaderRawResource, JsonLoaderResource> {
	protected _loadAsync(target: TJsonLoaderTarget, options: IJsonLoaderOption = {}) {
		return (() => {
			const xhr = this._resolveXhr(target, options.xhr)
			if (!xhr) {
				return fetch(target);
			}
			
			return fetch(xhr.src, xhr.requestOptions);
		})()
		.then(res => {
			if (!res.ok) {
				throw res.statusText;
			}
			
			return res.json();
		})
		.then(json => new JsonLoaderResource(json, null))
		.catch((e: any) => new JsonLoaderResource({}, e));
	}
}