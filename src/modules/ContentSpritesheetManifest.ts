import * as PIXI from 'pixi.js';
import { ContentManifestBase, TManifests, IContentManifestOption, TPostManifests, ILoadedResource } from './ContentManifestBase';
import { Content } from './Content';

/**
 * @private
 */
interface ILoadedSpritesheetResource extends ILoadedResource {
	resource: PIXI.ITextureDictionary
}

/**
 * @private
 */
type TLoadedSpritesheetResources = { [name: string]: ILoadedSpritesheetResource };

export class ContentSpritesheetManifest extends ContentManifestBase {
	static manifestKey = 'spritesheets';
	
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

Object.defineProperties(Content, {
	/**
	 * Define manifests of spritesheet.
	 */
	defineSpritesheets: {
		value: function(data: TManifests, options: IContentManifestOption = {}): typeof Content {
			this._piximData.manifests[ContentSpritesheetManifest.manifestKey].add(data, options);
			
			return this;
		}
	}
});

Object.defineProperties(Content.prototype, {
	/**
	 * Add manifests of spritesheet.
	 */
	addSpritesheets: {
		value: function(data: TManifests, options: IContentManifestOption = {}): Content {
			this._piximData.additionalManifests[ContentSpritesheetManifest.manifestKey].add(data, options);
			
			return this;
		}
	}
});