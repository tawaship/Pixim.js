import * as LoaderBase from './LoaderBase';

export type TJsLoaderRawResource = string;

export class JsLoaderResource extends LoaderBase.LoaderResource<TJsLoaderRawResource> {
	destroy() {
		this._data = '';
	}
	
	ref() {
		const script = document.body.appendChild(document.createElement('script'));
		script.text = this._data;
	}
}

export type TJsLoaderTarget = string;

export interface IJsLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsLoaderTarget> {

}

export interface IJsLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<JsLoaderResource> {

}

export interface IJsLoaderOption extends LoaderBase.ILoaderOption {

}

export class JsLoader extends LoaderBase.LoaderBase<TJsLoaderTarget, TJsLoaderRawResource, JsLoaderResource> {
	protected _loadAsync(target: TJsLoaderTarget, options: IJsLoaderOption = {}) {
		return (() => {
			const data = this._resolveParams(target, options);
			const src = data.src;
			const xhr = data.xhr;
			
			if (!xhr) {
				return fetch(src);
			}
			
			return fetch(src, xhr.requestOptions || {});
		})()
		.then(res => {
			if (!res.ok) {
				throw res.statusText;
			}
			
			return res.text();
		})
		.then(text => new JsLoaderResource(text, null))
		.catch((e: any) => new JsLoaderResource('', e));
	}
}