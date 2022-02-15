import * as ResourceManagerBase from './ResourceManagerBase';
import * as TextureLoader from '../loaders/TextureLoader';

export interface ITextureDictionary extends ResourceManagerBase.IRawResourceDictionary<PIXI.Texture> {

}

export class ImageResourceManager extends ResourceManagerBase.ResourceManagerBase<TextureLoader.TTextureLoaderTarget, PIXI.Texture> {
	protected _loadAsync(manifest: TextureLoader.ITextureLoaderManifest ,options: TextureLoader.ITextureLoaderOption = {}) {
		const loader = new TextureLoader.TextureLoader(options);
		
		return loader.loadWithManifestAsync(manifest);
	}
}