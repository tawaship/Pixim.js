import { SoundLoader, SoundLoaderResource, TSoundLoaderRawResource, TSoundLoaderTarget } from "../loader";
import { ManifestBase } from "./ManifestBase";

export class SoundManifest extends ManifestBase<TSoundLoaderTarget, TSoundLoaderRawResource, SoundLoaderResource> {
	protected _createLoader() {
		return new SoundLoader();
	}
}