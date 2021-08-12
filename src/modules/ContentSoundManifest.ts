import { Howl } from 'howler';
import { ContentManifestBase, IManifestDictionary, ILoadedResourceDictionary, IResourceDictionary } from './ContentManifestBase';

export interface ILoadedSoundResourceDictionary extends ILoadedResourceDictionary<Howl> {
}

export class ContentSoundManifest extends ContentManifestBase<string, Howl> {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedSoundResourceDictionary> {
		const manifests = this._manifests;
		
		return new Promise((resolve: (resource: ILoadedSoundResourceDictionary) => void, reject: (manifest: IManifestDictionary<string>) => void): void => {
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
					reject({ [i]: manifests[i].data});
					return;
				}
				
				++loadCount;
			}
			
			if (useCache) {
			
			}
			
			for (let i in manifests) {
				const _i = i;
				
				const manifest = manifests[_i];
				manifest.data = this._resolvePath(manifest.data, basepath);
				
				const url =
					version
					?`${manifest.data}${manifest.data.match(/\?/) ? '&' : '?'}_fv=${version}`
					: manifest.data;
				
				const howl = new Howl({
					src: url,
					onload: () => {
						loadedHandler(_i, howl, false);
					},
					onloaderror: () => {
						if (!manifest.unrequired) {
							reject({ [_i]: manifest.data});
							return;
						}
						
						loadedHandler(_i, howl, true);
					}
				});
			}
		});
	}
	
	/**
	 * Destroy resources.
	 * 
	 * @override
	 */
	destroyResources(resources: IResourceDictionary<Howl>) {
		for (let i in resources) {
			resources[i].stop();
			resources[i].unload();
		}
	}
}