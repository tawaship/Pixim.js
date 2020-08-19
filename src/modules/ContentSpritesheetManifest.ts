import * as PIXI from 'pixi.js';
import { ContentManifestBase, TManifests, IContentManifestOption, TPostManifests, ILoadedResource } from './ContentManifestBase';

namespace Pixim {
	/**
	 * @private
	 */
	interface ILoadedSpritesheetResource extends ILoadedResource {
		resource: PIXI.ITextureDictionary
	}
	
	export type TLoadedSpritesheetResources = { [name: string]: ILoadedSpritesheetResource };
	
	export class ContentSpritesheetManifest extends ContentManifestBase {
		/**
		 * Load image resources.
		 * 
		 * @override
		 * @async
		 */
		protected _loadAsync(manifests: TPostManifests): Promise<TLoadedSpritesheetResources> {
			return new Promise((resolve: (resource: TLoadedSpritesheetResources) => void, reject: (manifest: TManifests) => void): void => {
				const loader: PIXI.Loader = new PIXI.Loader();
				
				for (let i in manifests) {
					loader.add(i, manifests[i].url, {
						crossOrigin: true
					});
				}
				
				const res: TLoadedSpritesheetResources = {};
				loader.load((loader, resources): void => {
					for (let i in resources) {
						if (!manifests[i]) {
							continue;
						}
						
						const resource: PIXI.LoaderResource | undefined = resources[i];
						
						if (!resource) {
							reject({ [i]: manifests[i].url});
							return;
						}
						
						const textures: PIXI.ITextureDictionary = resource.textures || {};
						
						const error: boolean = !!resource.error;
						if (resource.error && !manifests[i].unrequired) {
							reject({ [i]: manifests[i].url});
							return;
						}
						
						res[i] = {
							resource: textures,
							error: !!resource.error
						};
					}
					
					resolve(res);
				});
			});
		}
	}
}

/**
 * @ignore
 */
export import TLoadedSpritesheetResources = Pixim.TLoadedSpritesheetResources;

/**
 * @ignore
 */
export import ContentSpritesheetManifest = Pixim.ContentSpritesheetManifest;