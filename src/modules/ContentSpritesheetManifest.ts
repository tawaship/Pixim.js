import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';

export interface ILoadedSpritesheetResource extends ILoadedResource {
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
	protected _loadAsync(manifests: IPostManifestDictionary, version: string, useCache: boolean): Promise<ILoadedSpritesheetResourceDictionary> {
		return new Promise((resolve: (resource: ILoadedSpritesheetResourceDictionary) => void, reject: (manifest: IManifestDictionary) => void): void => {
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
					if (resource.textures) {
						for (let i in resource.textures) {
							const texture = resource.textures[i];
							if (!texture) {
								continue;
							}
							
							PIXI.Texture.removeFromCache(texture);
							
							if (texture.baseTexture) {
								PIXI.BaseTexture.removeFromCache(texture.baseTexture);
							}
						}
					}
					
					if (resource.texture) {
						PIXI.Texture.removeFromCache(resource.texture);
						
						if (resource.texture.baseTexture) {
							PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture);
						}
					}
					
					next();
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