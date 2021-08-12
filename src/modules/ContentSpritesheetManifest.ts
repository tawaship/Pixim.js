import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, ILoadedResourceDictionary, IResourceDictionary } from './ContentManifestBase';

export interface ILoadedSpritesheetResourceDictionary extends ILoadedResourceDictionary<PIXI.ITextureDictionary> {
}

export class ContentSpritesheetManifest extends ContentManifestBase<string, PIXI.ITextureDictionary> {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedSpritesheetResourceDictionary> {
		const manifests = this._manifests;
		const loader: PIXI.Loader = new PIXI.Loader();
		
		if (version) {
			loader.defaultQueryString = `_fv=${version}`;
		}
		
		for (let i in manifests) {
			const manifest = manifests[i];
			manifest.data = this._resolvePath(manifest.data, basepath);
			
			loader.add(i, manifest.data, {
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
		
		return new Promise((resolve: (resource: ILoadedSpritesheetResourceDictionary) => void, reject: (manifest: IManifestDictionary<string>) => void): void => {
			const res: ILoadedSpritesheetResourceDictionary = {};
			
			loader.load((loader, resources): void => {
				for (let i in resources) {
					if (!manifests[i]) {
						continue;
					}
					
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						reject({ [i]: manifests[i].data});
						return;
					}
					
					const textures: PIXI.ITextureDictionary = resource.textures || {};
					
					const error: boolean = !!resource.error;
					if (resource.error && !manifests[i].unrequired) {
						reject({ [i]: manifests[i].data});
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
	
	/**
	 * Destroy resources.
	 * 
	 * @override
	 */
	destroyResources(resources: IResourceDictionary<PIXI.ITextureDictionary>) {
		
	}
}