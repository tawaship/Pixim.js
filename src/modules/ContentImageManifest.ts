import * as PIXI from 'pixi.js';
import { ContentManifestBase, TManifests, IContentManifestOption, TPostManifests, ILoadedResource } from './ContentManifestBase';
import { Content } from './Content';

/**
 * @private
 */
interface ILoadedImageResource extends ILoadedResource {
	resource: PIXI.Texture
}

/**
 * @private
 */
type TLoadedImageResources = { [name: string]: ILoadedImageResource };

/**
 * @ignore
 */
const manifestKey: string = 'images';

export class ContentImageManifest extends ContentManifestBase {
	/**
	 * Load image resources.
	 * 
	 * @override
	 * @async
	 */
	protected _loadAsync(manifests: TPostManifests): Promise<TLoadedImageResources> {
		return new Promise((resolve: (resource: TLoadedImageResources) => void, reject: (manifest: TManifests) => void): void => {
			const loader: PIXI.Loader = new PIXI.Loader();
			
			for (let i in manifests) {
				loader.add(i, manifests[i].url, {
					crossOrigin: true
				});
			}
			
			const res: TLoadedImageResources = {};
			loader.load((loader, resources): void => {
				for (let i in resources) {
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						reject({ [i]: manifests[i].url});
						return;
					}
					
					if (resource.error && !manifests[i].unrequired) {
						reject({ [i]: manifests[i].url});
						return;
					}
					
					res[i] = {
						resource: resource.texture,
						error: !!resource.error
					};
				}
				
				resolve(res);
			});
		});
	}
}

/**
 * @ignore
 */
declare module './Content' {
	interface Content {
		addImages(data: TManifests, options?: IContentManifestOption): Content;
	}
	
	namespace Content {
		function defineImages(data: TManifests, options?: IContentManifestOption): typeof Content;
	}
}

Content.prototype.addImages = function(data: TManifests, options: IContentManifestOption = {}) {
	return this.addManifests(manifestKey, data, options);
}

Content.defineImages = function(data: TManifests, options: IContentManifestOption = {}) {
	return this.defineManifests(manifestKey, data, options);
}

Content.useManifestClass(manifestKey, ContentImageManifest);