import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import * as utils from '../utils/index';

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

export type TTextureLoaderFetchResolver = (res: Response) => Promise<string>;

export interface ITextureLoaderOption extends LoaderBase.ILoaderOption<TTextureLoaderFetchResolver> {

}

export class TextureLoader extends LoaderBase.LoaderBase<TTextureLoaderTarget, TTextureLoaderRawResource, TTextureLoaderFetchResolver> {
	protected _loadAsync(target: TTextureLoaderTarget, options: ITextureLoaderOption = {}) {
		if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
			target.crossOrigin = 'anonymous';
		}
		
		return new Promise<TextureLoaderResource>(resolve => {
			const bt = PIXI.BaseTexture.from(target);
			
			if (bt.valid) {
				PIXI.BaseTexture.removeFromCache(bt);
				
				resolve(new TextureLoaderResource(new PIXI.Texture(bt), null));
				return;
			}
			
			bt.on('loaded', (baseTexture: PIXI.BaseTexture) => {
				PIXI.BaseTexture.removeFromCache(baseTexture);
				
				resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), null));
			});
			
			bt.on('error', (baseTexture: PIXI.BaseTexture, e: Error) => {
				PIXI.BaseTexture.removeFromCache(baseTexture);
				resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), e));
			});
		});
	}
	
	protected _loadXhrAsync(url: string, options: ITextureLoaderOption) {
		const xhr = this._resolveXhrOptions(options.xhr);
		
		return fetch(url, xhr.requestOptions)
			.then(res => {
				return xhr.dataResolver ? xhr.dataResolver(res) : res.text();
			})
			.then((uri: string) => {
				return this._loadAsync(uri);
			});
	}
}