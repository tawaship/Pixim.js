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

export class ContentImageManifest extends ContentManifestBase {
	static manifestKey = 'images';
	
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

Object.defineProperties(Content, {
	/**
	 * Define manifests of image.
	 */
	defineImages: {
		value: function(data: TManifests, options: IContentManifestOption = {}): typeof Content {
			this._piximData.manifests[ContentImageManifest.manifestKey].add(data, options);
			
			return this;
		}
	}
});

Object.defineProperties(Content.prototype, {
	/**
	 * Add manifests of image.
	 */
	addImages: {
		value: function(data: TManifests, options: IContentManifestOption = {}): Content {
			this._piximData.additionalManifests[ContentImageManifest.manifestKey].add(data, options);
			
			return this;
		}
	}
});