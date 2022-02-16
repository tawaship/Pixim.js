import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';

export type TTextureLoaderRawResource = PIXI.Texture;

export class TextureLoaderResource extends LoaderBase.LoaderResource<TTextureLoaderRawResource> {
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

export interface ITextureLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TTextureLoaderTarget> {

}

export interface ITextureLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TTextureLoaderRawResource> {

}

export interface ITextureLoaderOption extends LoaderBase.ILoaderOption {

}

export class TextureLoader extends LoaderBase.LoaderBase<TTextureLoaderTarget, TTextureLoaderRawResource> {
	loadAsync(target: TTextureLoaderTarget, options: ITextureLoaderOption = {}) {
		if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
			return this._loadFromElementAsync(target, options);
		} else if (target.indexOf('data:') === 0) {
			return this._loadFromDataUriAsync(target, options);
		} else {
			return this._loadFromUrlAsync(target, options);
		}
	}
	
	loadAllAsync(targets: ITextureLoaderTargetDictionary, options: ITextureLoaderOption = {}) {
		if (Object.keys(targets).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const res: ITextureLoaderResourceDictionary = {};
		
		for (let i in targets) {
			promises.push(
				this.loadAsync(targets[i], options)
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
	
	private _loadFromUrlAsync(url: string, options: ITextureLoaderOption = {}) {
		return this._loadAsync(this._resolveUrl(url, options), options);
	}
	
	private _loadFromElementAsync(element: TTextureLoaderElementTarget, options: LoaderBase.ILoaderOption = {}) {
		element.crossOrigin = 'anonymous';
		element.src = this._resolveUrl(element.src, options);
		
		return this._loadAsync(element);
	}
	
	private _loadFromDataUriAsync(dataUri: string, options: LoaderBase.ILoaderOption = {}) {
		return this._loadAsync(dataUri, options);
	}
	
	private _loadAsync(target: TTextureLoaderTarget, options: LoaderBase.ILoaderOption = {}) {
		const useCache = this._resolveUseCache(options.useCache);
		
		return new Promise<TextureLoaderResource>(resolve => {
			const bt = PIXI.BaseTexture.from(target);
			
			if (bt.valid) {
				if (!useCache) {
					PIXI.BaseTexture.removeFromCache(bt);
				}
				
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