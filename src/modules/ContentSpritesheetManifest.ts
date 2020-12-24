import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';

namespace Pixim {
	/**
	 * @private
	 */
	interface ILoadedSpritesheetResource extends ILoadedResource {
		resource: PIXI.ITextureDictionary
	}
	
	export interface ILoadedSpritesheetResourceDictionary {
		[name: string]: ILoadedSpritesheetResource;
	}
	
	export class ContentSpritesheetManifest extends ContentManifestBase {
		/**
		 * Load image resources.
		 * 
		 * @override
		 */
		protected _loadAsync(manifests: IPostManifestDictionary): Promise<ILoadedSpritesheetResourceDictionary> {
			return new Promise((resolve: (resource: ILoadedSpritesheetResourceDictionary) => void, reject: (manifest: IManifestDictionary) => void): void => {
				const loader: PIXI.Loader = new PIXI.Loader();
				
				for (let i in manifests) {
					loader.add(i, manifests[i].url, {
						crossOrigin: true
					});
				}
				
				const res: ILoadedSpritesheetResourceDictionary = {};
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
export import ILoadedSpritesheetResourceDictionary = Pixim.ILoadedSpritesheetResourceDictionary;

/**
 * @ignore
 */
export import ContentSpritesheetManifest = Pixim.ContentSpritesheetManifest;