import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';

export class TextureLoaderResource extends LoaderBase.LoaderResource<PIXI.Texture> {
	destroy() {
		TextureLoaderResource.removeCache(this._data);
		this._data.destroy(true);
	}
	
	static removeCache(texture: PIXI.Texture) {
		PIXI.Texture.removeFromCache(texture);
		
		if (texture.baseTexture) {
			PIXI.BaseTexture.removeFromCache(texture.baseTexture);
		}
	}
}

export type TTextureLoaderElementTarget = HTMLImageElement | HTMLVideoElement;

export type TTextureLoaderTarget = string | TTextureLoaderElementTarget;

export interface ITextureLoaderManifest extends LoaderBase.ILoaderManifest<TTextureLoaderTarget> {

}

export interface ITextureLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<PIXI.Texture> {

}

export interface ITextureLoaderOption extends LoaderBase.ILoaderOption {

}

export class TextureLoader extends LoaderBase.LoaderBase<TTextureLoaderTarget, PIXI.Texture> {
	loadAsync(target: TTextureLoaderTarget, options: LoaderBase.ILoaderOption = {}) {
		if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
			return this._loadFromElementAsync(target, options);
		} else if (target.indexOf('data:') === 0) {
			return this._loadFromDataUriAsync(target, options);
		} else {
			return this._loadFromUrlAsync(target, options);
		}
	}
	
	loadWithManifestAsync(manifest: ITextureLoaderManifest, options: LoaderBase.ILoaderOption = {}) {
		if (Object.keys(manifest).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const res: ITextureLoaderResourceDictionary = {};
		
		for (let i in manifest) {
			promises.push(
				this.loadAsync(manifest[i], options)
					.then(resource => {
						res[i] = resource;
					})
			);
		}
		
		return Promise.all(promises)
			.then(() => {
				return res;
			});
	}
	
	private _loadFromUrlAsync(url: string, options: LoaderBase.ILoaderOption = {}) {
		return this._loadTextureAsync(this._resolveUrl(url, options), options);
	}
	
	private _loadFromElementAsync(element: TTextureLoaderElementTarget, options: LoaderBase.ILoaderOption = {}) {
		element.crossOrigin = 'anonymous';
		element.src = this._resolveUrl(element.src, options);
		
		return this._loadTextureAsync(element);
	}
	
	private _loadFromDataUriAsync(dataUri: string, options: LoaderBase.ILoaderOption = {}) {
		return this._loadTextureAsync(dataUri, options);
	}
	
	private _loadTextureAsync(target: TTextureLoaderTarget, options: LoaderBase.ILoaderOption = {}) {
		const useCache = this._resolveUseCache(options.useCache);
		
		return new Promise<TextureLoaderResource>(resolve => {
			const bt = PIXI.BaseTexture.from(target);
			
			if (bt.valid) {
				resolve(new TextureLoaderResource(new PIXI.Texture(bt), null));
				return;
			}
			
			bt.on('loaded', (baseTexture: PIXI.BaseTexture) => {
				if (!useCache) {
					PIXI.BaseTexture.removeFromCache(baseTexture);
				}
				
				resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), null));
			});
			
			bt.on('error', (baseTexture: PIXI.BaseTexture, e: Error) => {
				PIXI.BaseTexture.removeFromCache(baseTexture);
				resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), e));
			});
		});
	}
}