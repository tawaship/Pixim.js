import { Howl } from 'howler';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';

namespace Pixim {
	/**
	 * @private
	 */
	interface ILoadedSoundResource extends ILoadedResource {
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
		protected _loadAsync(manifests: IPostManifestDictionary): Promise<ILoadedSoundResourceDictionary> {
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
				
				for (let i in manifests) {
					const _i = i;
					
					const howl = new Howl({
						src: manifests[_i].url,
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
}

/**
 * @ignore
 */
export import ILoadedSoundResourceDictionary = Pixim.ILoadedSoundResourceDictionary;

/**
 * @ignore
 */
export import ContentSoundManifest = Pixim.ContentSoundManifest;