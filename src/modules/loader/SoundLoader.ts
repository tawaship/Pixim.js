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

export interface ISoundLoaderOption extends LoaderBase.ILoaderOption {

}

export class SoundLoader extends LoaderBase.LoaderBase<TSoundLoaderTarget, TSoundLoaderRawResource> {
	loadAsync(target: TSoundLoaderTarget, options: ISoundLoaderOption = {}) {
		const url = this._resolveUrl(target, options);
		
		return new Promise<SoundLoaderResource>(resolve => {
			const howl = new Howl({
				src: url,
				onload: () => {
					resolve(new SoundLoaderResource(howl, null));
				},
				onloaderror: () => {
					const e = new Error('invalid resource: ' + url);
					resolve(new SoundLoaderResource(howl, e));
				}
			});
		})
		.then((resource: SoundLoaderResource) => {
			if (!resource.error) {
				this.emit(LoaderBase.EVENT_LOADER_ASSET_LOADED, { target, resource });
			}
			
			return resource;
		});
	}
	
	loadAllAsync(targets: ISoundLoaderTargetDictionary, options: ISoundLoaderOption = {}) {
		if (Object.keys(targets).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const res: ISoundLoaderResourceDictionary = {};
		
		for (let i in targets) {
			promises.push(
				this.loadAsync(targets[i], options)
					.then(resource => {
						res[i] = resource;
					})
			);
		}
		
		return Promise.all(promises)
			.then(() => {
				return res;
			});
	}
}