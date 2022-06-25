import * as ManifestBase from './ManifestBase';
import * as TextureLoader from '../loader/TextureLoader';

export interface ITextureManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<TextureLoader.TTextureLoaderTarget> {

}

export interface ITextureDictionary extends ManifestBase.IRawResourceDictionary<TextureLoader.TTextureLoaderRawResource> {

}

export class TextureManifest extends ManifestBase.ManifestBase<TextureLoader.TTextureLoaderTarget, TextureLoader.TTextureLoaderRawResource> {
	protected _createLoader() {
		return new TextureLoader.TextureLoader();
	}
}