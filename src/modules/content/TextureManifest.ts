import { TextureLoader, TextureLoaderResource, TTextureLoaderRawResource, TTextureLoaderTarget } from "../loader";
import { ManifestBase } from "./ManifestBase";

export class TextureManifest extends ManifestBase<TTextureLoaderTarget, TTextureLoaderRawResource, TextureLoaderResource> {
	protected _createLoader() {
		return new TextureLoader();
	}
}