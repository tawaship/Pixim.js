import * as PIXI from 'pixi.js';
import { ContentManifestBase, TManifests, IContentManifestOption, TPostManifests, ILoadedResource } from './ContentManifestBase';
import { Content as _Content } from './Content';

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

/**
 * @ignore
 */
const manifestKey: string = 'spritesheets';

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

/**
 * @ignore
 */
declare module './Content' {
	interface Content {
		addSpritesheets(data: TManifests, options?: IContentManifestOption): Content;
	}
	
	namespace Content {
		function defineSpritesheets(data: TManifests, options?: IContentManifestOption): typeof Content;
	}
}

_Content.prototype.addSpritesheets = function(data: TManifests, options: IContentManifestOption = {}) {
	return this.addManifests(manifestKey, data, options);
}

_Content.defineSpritesheets = function(data: TManifests, options: IContentManifestOption = {}) {
	return this.defineManifests(manifestKey, data, options);
}

_Content.useManifestClass(manifestKey, ContentSpritesheetManifest);

// for docs
class Content {
	static defineSpritesheets(data: TManifests, options: IContentManifestOption = {}) {
		return _Content;
	}
	
	addSpritesheets(data: TManifests, options: IContentManifestOption = {}): this {
		return this;
	}
}