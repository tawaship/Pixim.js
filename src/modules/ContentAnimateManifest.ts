import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, IContentManifestOption, IPostManifestDictionary, ILoadedResource } from './ContentManifestBase';
import loadJS from './loadJS';

/**
 * @ignore
 */
declare const AdobeAn: any;

class A extends AdobeAn {

}

export interface ILoadedAnimateResource extends ILoadedResource {
	resource: PIXI.ITextureDictionary
}

export interface ILoadedAnimateResourceDictionary {
	[name: string]: ILoadedAnimateResource;
}

export class ContentAnimateManifest extends ContentManifestBase {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(manifests: IPostManifestDictionary, version: string, useCache: boolean): Promise<ILoadedAnimateResourceDictionary> {
		for (let i in manifests) {
			const manifest = manifests[i];
			/*
			if (!manifest.data || !manifest.data.js || !manifest.data.id) {
				return Promise.reject(manifest);
			}*/
		}
		
		return Promise.resolve({});
		/*
		return new Promise((resolve: (resource: ILoadedAnimateResourceDictionary) => void, reject: (manifest: IManifestDictionary) => void): void => {
			const assetData = {};
			
			
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
			
			const res: ILoadedAnimateResourceDictionary = {};
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
		});*/
	}
}