import { BaseTexture, Texture } from 'pixi.js';
import { BlobLoader } from './BlobLoader';
import { ILoaderOption, LoaderBase, LoaderResource } from './LoaderBase';

export type TTextureLoaderRawResource = Texture | null;

export class TextureLoaderResource extends LoaderResource<TTextureLoaderRawResource> {
	destroy() {
		if (this._data) {
			TextureLoaderResource.removeCache(this._data);
			this._data.destroy(true);
			this._data = null;
		}
	}
	
	static removeCache(texture: Texture) {
		Texture.removeFromCache(texture);
        
		if (texture.baseTexture) {
			BaseTexture.removeFromCache(texture.baseTexture);
		}
	}
}

export type TTextureLoaderElementTarget = HTMLImageElement | HTMLVideoElement;

export type TTextureLoaderTarget = string | TTextureLoaderElementTarget;

export interface ITextureLoaderOption extends ILoaderOption {

}

export class TextureLoader extends LoaderBase<TTextureLoaderTarget, TTextureLoaderRawResource, TextureLoaderResource> {
	protected _loadAsync(target: TTextureLoaderTarget, options: ITextureLoaderOption = {}) {
		return (() => {
			const data = this._resolveParams(target, options);
			const src = data.src;
			const xhr = data.xhr;
			
			if (!xhr) {
				return this._loadBaseTextureAsync(src);
			}
			
			const loader = new BlobLoader();
			
			return loader.loadAsync(src, { xhr })
				.then(resource => {
					if (resource.error) {
						throw resource.error;
					}
					
					if (!resource.data) {
						throw 'invalid resource';
					}
					
					return this._loadBaseTextureAsync(resource.data);
				});
		})()
		.then(baseTexture => new TextureLoaderResource(new Texture(baseTexture), null))
		.catch(e => new TextureLoaderResource(null, e));
	}
	
	private _loadBaseTextureAsync(target: TTextureLoaderTarget) {
		if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
			target.crossOrigin = 'anonymous';
		}
		
		return new Promise<BaseTexture>((resolve, reject) => {
			const bt = BaseTexture.from(target);
			
			if (bt.valid) {
				BaseTexture.removeFromCache(bt);
				resolve(bt);
				return;
			}
			
			bt.on('loaded', (baseTexture: BaseTexture) => {
				BaseTexture.removeFromCache(baseTexture);
				resolve(baseTexture);
			});
			
			bt.on('error', (baseTexture: BaseTexture, e: Error) => {
				BaseTexture.removeFromCache(baseTexture);
				reject(e);
			});
		});
	}
}