import * as PIXI from 'pixi.js';
import { ContentManifestBase, ILoadedResourceDictionary, IResourceDictionary } from './ContentManifestBase';

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
		
		/*
		if (version) {
			loader.defaultQueryString = `_fv=${version}`;
		}
		*/
		
		for (let i in manifests) {
			const manifest = manifests[i];
			const preUrl = this._resolvePath(manifest.data, basepath);
			
			const url =
				version
				? this._resolveQuery(preUrl, { _fv: version })
				: preUrl;
			
			loader.add(i, url, {
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
		
		return new Promise((resolve: (resource: ILoadedImageResourceDictionary) => void, reject: (path: string) => void): void => {
			const res: ILoadedImageResourceDictionary = {};
			loader.load((loader, resources): void => {
				for (let i in resources) {
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						reject(`Image: '${i}' cannot load.`);
						return;
					}
					
					if (resource.error && !manifests[i].unrequired) {
						reject(`Image: '${i}' cannot load.`);
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