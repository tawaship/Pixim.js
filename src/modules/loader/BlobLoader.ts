import { ILoaderOption, LoaderBase, LoaderResource } from "./LoaderBase";

export type TBlobLoaderRawResource = string;

export class BlobLoaderResource extends LoaderResource<TBlobLoaderRawResource> {
	destroy() {
		(window.URL || window.webkitURL).revokeObjectURL(this._data);
		this._data = '';
	}
}

export type TBlobLoaderTarget = string;

export interface IBlobLoaderOption extends ILoaderOption {

}

export class BlobLoader extends LoaderBase<TBlobLoaderTarget, TBlobLoaderRawResource, BlobLoaderResource> {
	protected _loadAsync(target: TBlobLoaderTarget, options: IBlobLoaderOption = {}) {
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
			
			return res.blob();
		})
		.then(blob => {
			return (window.URL || window.webkitURL).createObjectURL(blob);
		})
		.then(uri => new BlobLoaderResource(uri, null))
		.catch((e: any) => new BlobLoaderResource('', e));
	}
}