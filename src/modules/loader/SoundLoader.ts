import { Howl } from 'howler';
import * as LoaderBase from './LoaderBase';

export type TSoundLoaderRawResource = Howl | null;

export class SoundLoaderResource extends LoaderBase.LoaderResource<TSoundLoaderRawResource> {
	destroy() {
		if (this._data) {
			this._data.stop();
			this._data.unload();
			this._data = null;
		}
	}
}

export type TSoundLoaderTarget = string;

export interface ISoundLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TSoundLoaderTarget> {

}

export interface ISoundLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<SoundLoaderResource> {

}

export interface ISoundLoaderOption extends LoaderBase.ILoaderOption {

}

export class SoundLoader extends LoaderBase.LoaderBase<TSoundLoaderTarget, TSoundLoaderRawResource, SoundLoaderResource> {
	protected _loadAsync(target: TSoundLoaderTarget, options: ISoundLoaderOption = {}) {
		return (() => {
			const data = this._resolveParams(target, options);
			const src = data.src;
			const xhr = data.xhr;
			
			if (!xhr) {
				return new Promise<Howl>((resolve, reject) => {
					const howl = new Howl({
						src,
						onload: () => {
							resolve(howl);
						},
						onloaderror: () => {
							const e = new Error('invalid resource: ' + src);
							reject(e);
						}
					});
				});
			}
			
			return new Promise<Howl>((resolve, reject) => {
				const howl = new Howl({
					src,
					onload: () => {
						resolve(howl);
					},
					onloaderror: () => {
						const e = new Error('invalid resource: ' + src);
						reject(e);
					},
					xhr: xhr.requestOptions || {}
				});
			});
		})()
		.then(howl => new SoundLoaderResource(howl, null))
		.catch(e => new SoundLoaderResource(null, e));
	}
}