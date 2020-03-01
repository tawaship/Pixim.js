import * as PIXI from 'pixi.js';
import { ContentResource, ResourceManifests, IContentResrouceOption, LodableManifests, ILoadedResource } from './ContentResource';
import { Content } from './Content';

/**
 * @private
 */
interface ILoadedImageResource extends ILoadedResource {
	resource: PIXI.Texture
}

type LoadedResrouces = { [name: string]: ILoadedImageResource };

export class ContentImageResource extends ContentResource {
	/**
	 * Load image resources.
	 * 
	 * @override
	 * @async
	 */
	protected _loadAsync(manifests: LodableManifests): Promise<LoadedResrouces> {
		return new Promise((resolve, reject): void => {
			const loader: PIXI.Loader = new PIXI.Loader();
			
			for (let i in manifests) {
				loader.add(i, manifests[i].url, {
					crossOrigin: true
				});
			}
			
			const res: LoadedResrouces = {};
			loader.load((loader, resources): void => {
				for (let i in resources) {
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						reject(manifests[i]);
						return;
					}
					
					if (resource.error && !manifests[i].unrequired) {
						reject(manifests[i]);
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
		value: function(data: ResourceManifests, options: IContentResrouceOption = {}): typeof Content {
			console.log(this)
			this._piximData.manifests.images = this._piximData.manifests.images || new ContentImageResource();
			this._piximData.manifests.images.add(data, options);
			
			return this;
		}
	}
});

Object.defineProperties(Content.prototype, {
	/**
	 * Add manifests of image.
	 */
	addImages: {
		value: function(data: ResourceManifests, options: IContentResrouceOption = {}): Content {
			this._piximData.additionalManifests.images = this._piximData.additionalManifests.images || new ContentImageResource();
			this._piximData.additionalManifests.images.add(data, options);
			
			return this;
		}
	}
});