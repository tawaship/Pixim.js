import { ILoaderOption, LoaderBase, LoaderResource } from "./LoaderBase";

export interface IJsonData {
	[name: string]: any;
}

export type TJsonLoaderRawResource = IJsonData;

export class JsonLoaderResource extends LoaderResource<TJsonLoaderRawResource> {
	destroy() {
		this._data = {};
	}
}

export type TJsonLoaderTarget = string;

export interface IJsonLoaderOption extends ILoaderOption {

}

export class JsonLoader extends LoaderBase<TJsonLoaderTarget, TJsonLoaderRawResource, JsonLoaderResource> {
	protected _loadAsync(target: TJsonLoaderTarget, options: IJsonLoaderOption = {}) {
		return (() => {
			const data = this._resolveParams(target, options);
			const src = data.src;
			const xhr = data.xhr;
			
			if (!xhr) {
				return fetch(src);
			}
			
			return fetch(src, xhr.requestOptions);
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