import { Howl } from 'howler';
import * as LoaderBase from './LoaderBase';

export type TSoundLoaderRawResource = Howl;

export class SoundLoaderResource extends LoaderBase.LoaderResource<TSoundLoaderRawResource> {
	destroy() {
		this._data.stop();
		this._data.unload();
	}
}

export type TSoundLoaderTarget = string;

export interface ISoundLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TSoundLoaderTarget> {

}

export interface ISoundLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TSoundLoaderRawResource> {

}

export type TSoundLoaderFetchResolver = (res: Howl) => Promise<Howl>;

export interface ISoundLoaderOption extends LoaderBase.ILoaderOption<TSoundLoaderFetchResolver> {

}

export class SoundLoader extends LoaderBase.LoaderBase<TSoundLoaderTarget, TSoundLoaderRawResource, TSoundLoaderFetchResolver> {
	protected _loadAsync(target: TSoundLoaderTarget, options: ISoundLoaderOption = {}) {
		return new Promise<SoundLoaderResource>(resolve => {
			const howl = new Howl({
				src: target,
				onload: () => {
					resolve(new SoundLoaderResource(howl, null));
				},
				onloaderror: () => {
					const e = new Error('invalid resource: ' + target);
					resolve(new SoundLoaderResource(howl, e));
				}
			});
		});
	}
	
	protected _loadXhrAsync(url: string, options: ISoundLoaderOption) {
		const xhr = this._resolveXhrOptions(options.xhr);
		
		return new Promise<SoundLoaderResource>(resolve => {
			const howl = new Howl({
				src: url,
				onload: () => {
					resolve(new SoundLoaderResource(howl, null));
				},
				onloaderror: () => {
					const e = new Error('invalid resource: ' + url);
					resolve(new SoundLoaderResource(howl, e));
				},
				xhr: xhr.requestOptions || {}
			});
		});
	}
}