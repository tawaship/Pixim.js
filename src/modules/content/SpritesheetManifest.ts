import { SpritesheetLoader, SpritesheetLoaderResource, TSpritesheetLoaderRawResource, TSpritesheetLoaderTarget } from "../loader";
import { ManifestBase } from "./ManifestBase";

export class SpritesheetManifest extends ManifestBase<TSpritesheetLoaderTarget, TSpritesheetLoaderRawResource, SpritesheetLoaderResource> {
	protected _createLoader() {
		return new SpritesheetLoader();
	}
}