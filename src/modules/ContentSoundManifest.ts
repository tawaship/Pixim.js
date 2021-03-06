import { Howl } from 'howler';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';

export interface ILoadedSoundResource extends ILoadedResource {
	resource: Howl
}

export interface ILoadedSoundResourceDictionary{
	[name: string]: ILoadedSoundResource;
}

export class ContentSoundManifest extends ContentManifestBase {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(manifests: IPostManifestDictionary, version: string, useCache: boolean): Promise<ILoadedSoundResourceDictionary> {
		return new Promise((resolve: (resource: ILoadedSoundResourceDictionary) => void, reject: (manifest: IManifestDictionary) => void): void => {
			const res: ILoadedSoundResourceDictionary = {};
			
			function loadedHandler(key: string, howl: Howl, error: boolean): void {
				res[key] = {
					resource: howl,
					error
				};
				
				if (++loadedCount < loadCount) {
					return;
				}
				
				resolve(res);
			}
			
			let loadCount: number = 0;
			let loadedCount:number  = 0;
			
			for (let i in manifests) {
				if (!Howl) {
					console.warn('You need "howler.js" to load sound asset.');
					reject({ [i]: manifests[i].url});
					return;
				}
				
				++loadCount;
			}
			
			if (useCache) {
			
			}
			
			for (let i in manifests) {
				const _i = i;
				const url =
					version
					?`${manifests[_i].url}${manifests[_i].url.match(/\?/) ? '&' : '?'}_fv=${version}`
					: manifests[_i].url;
				
				const howl = new Howl({
					src: url,
					onload: () => {
						loadedHandler(_i, howl, false);
					},
					onloaderror: () => {
						if (!manifests[_i].unrequired) {
							reject({ [_i]: manifests[_i].url});
							return;
						}
						
						loadedHandler(_i, howl, true);
					}
				});
			}
		});
	}
}