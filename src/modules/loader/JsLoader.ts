import * as LoaderBase from './LoaderBase';

export interface IJsData {
	[name: string]: any;
}

export type TJsLoaderRawResource = IJsData;

export class JsLoaderResource extends LoaderBase.LoaderResource<TJsLoaderRawResource> {
	destroy() {
		
	}
}

export type TJsLoaderTarget = string;

export interface IJsLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsLoaderTarget> {

}

export interface IJsLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TJsLoaderRawResource> {

}

export type TJsLoaderFetchResolver = (res: Response) => IJsData;

export interface IJsLoaderOption extends LoaderBase.ILoaderOption<TJsLoaderFetchResolver> {
	
}

export class JsLoader extends LoaderBase.LoaderBase<TJsLoaderTarget, TJsLoaderRawResource, IJsLoaderOption> {
	protected _loadAsync(target: TJsLoaderTarget, options: IJsLoaderOption = {}) {
		const uri = this._resolveUri(target, options);
		
		return fetch(uri)
			.then(res => res.text())
			.then(text => {
				
			})
			.catch((e: any) => new JsLoaderResource({}, e))
	}
	
	protected _loadXhrAsync(url: string) {
		const uri = this._resolveUri(target, options);
		
		return fetch(uri)
			.then(res => res.text())
			.then(text => {
				
			})
			.catch((e: any) => new JsLoaderResource({}, e))
	}
}