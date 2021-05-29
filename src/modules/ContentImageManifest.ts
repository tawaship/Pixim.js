import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';

export interface ILoadedImageResource extends ILoadedResource {
	resource: PIXI.Texture
}

export interface ILoadedImageResourceDictionary {
	[name: string]: ILoadedImageResource;
}

export class ContentImageManifest extends ContentManifestBase {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(manifests: IPostManifestDictionary, version: string, useCache: boolean): Promise<ILoadedImageResourceDictionary> {
		return new Promise((resolve: (resource: ILoadedImageResourceDictionary) => void, reject: (manifest: IManifestDictionary) => void): void => {
			const loader: PIXI.Loader = new PIXI.Loader();
			
			if (version) {
				loader.defaultQueryString = `_fv=${version}`;
			}
			
			for (let i in manifests) {
				loader.add(i, manifests[i].url, {
					crossOrigin: true
				});
			}
			
			if (!useCache) {
				loader.use((resource: PIXI.LoaderResource, next: () => void) => {
					if (resource.texture) {
						PIXI.Texture.removeFromCache(resource.texture);
						
						if (resource.texture.baseTexture) {
							PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture);
						}
					}
					
					next();
				});
			}
			
			const res: ILoadedImageResourceDictionary = {};
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