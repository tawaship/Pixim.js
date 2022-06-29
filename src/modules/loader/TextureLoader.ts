import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import { BlobLoader } from './BlobLoader';
import * as utils from '../utils/index';

export type TTextureLoaderRawResource = PIXI.Texture | null;

export class TextureLoaderResource extends LoaderBase.LoaderResource<TTextureLoaderRawResource> {
	destroy() {
		if (this._data) {
			TextureLoaderResource.removeCache(this._data);
			this._data.destroy(true);
			this._data = null;
		}
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

export interface ITextureLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TextureLoaderResource> {

}

export interface ITextureLoaderOption extends LoaderBase.ILoaderOption {

}

export class TextureLoader extends LoaderBase.LoaderBase<TTextureLoaderTarget, TTextureLoaderRawResource, TextureLoaderResource> {
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
		.then(baseTexture => new TextureLoaderResource(new PIXI.Texture(baseTexture), null))
		.catch(e => new TextureLoaderResource(null, e));
	}
	
	private _loadBaseTextureAsync(target: TTextureLoaderTarget) {
		if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
			target.crossOrigin = 'anonymous';
		}
		
		return new Promise<PIXI.BaseTexture>((resolve, reject) => {
			const bt = PIXI.BaseTexture.from(target);
			
			if (bt.valid) {
				PIXI.BaseTexture.removeFromCache(bt);
				resolve(bt);
				return;
			}
			
			bt.on('loaded', (baseTexture: PIXI.BaseTexture) => {
				PIXI.BaseTexture.removeFromCache(baseTexture);
				resolve(baseTexture);
			});
			
			bt.on('error', (baseTexture: PIXI.BaseTexture, e: Error) => {
				PIXI.BaseTexture.removeFromCache(baseTexture);
				reject(e);
			});
		});
	}
}