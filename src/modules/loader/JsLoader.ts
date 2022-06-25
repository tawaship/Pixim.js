import * as LoaderBase from './LoaderBase';

export type TJsLoaderRawResource = string;

export class JsLoaderResource extends LoaderBase.LoaderResource<TJsLoaderRawResource> {
	destroy() {
		
	}
	
	ref() {
		const script = document.body.appendChild(document.createElement('script'));
		script.text = this._data;
	}
}

export type TJsLoaderTarget = string;

export interface IJsLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsLoaderTarget> {

}

export interface IJsLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TJsLoaderRawResource> {

}

export interface IJsLoaderOption extends LoaderBase.ILoaderOption {

}

export class JsLoader extends LoaderBase.LoaderBase<TJsLoaderTarget, TJsLoaderRawResource> {
	protected _loadAsync(target: TJsLoaderTarget, options: IJsLoaderOption = {}) {
		return fetch(target)
			.then(res => res.text())
			.then(text => new JsLoaderResource(text, null))
			.catch((e: any) => new JsLoaderResource('', e));
	}
	
	protected _loadXhrAsync(url: string, options: IJsLoaderOption) {
		const xhr = this._resolveXhrOptions(options.xhr);
		
		return fetch(url, xhr.requestOptions)
			.then(res => res.json())
			.then(text => new JsLoaderResource(text, null))
			.catch((e: any) => new JsLoaderResource('', e));
	}
}