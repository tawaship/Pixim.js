import * as PIXI from 'pixi.js';
import { ContentManifestBase, IManifestDictionary, ILoadedResourceDictionary, IResourceDictionary } from './ContentManifestBase';

export interface ILoadedImageResourceDictionary extends ILoadedResourceDictionary<PIXI.Texture> {
}

export class ContentImageManifest extends ContentManifestBase<string, PIXI.Texture> {
	/**
	 * Load image resources.
	 * 
	 * @override
	 */
	protected _loadAsync(basepath: string, version: string, useCache: boolean): Promise<ILoadedImageResourceDictionary> {
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
				if (resource.texture) {
					PIXI.Texture.removeFromCache(resource.texture);
					
					if (resource.texture.baseTexture) {
						PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture);
					}
				}
				
				next();
			});
		}
		
		return new Promise((resolve: (resource: ILoadedImageResourceDictionary) => void, reject: (manifest: IManifestDictionary<string>) => void): void => {
			const res: ILoadedImageResourceDictionary = {};
			loader.load((loader, resources): void => {
				for (let i in resources) {
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						reject({ [i]: manifests[i].data});
						return;
					}
					
					if (resource.error && !manifests[i].unrequired) {
						reject({ [i]: manifests[i].data});
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
	
	/**
	 * Destroy resources.
	 * 
	 * @override
	 */
	destroyResources(resources: IResourceDictionary<PIXI.Texture>) {
		
	}
}