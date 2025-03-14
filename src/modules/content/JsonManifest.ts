import { JsonLoader, JsonLoaderResource, TJsonLoaderRawResource, TJsonLoaderTarget } from "../loader";
import { ManifestBase } from "./ManifestBase";

export class JsonManifest extends ManifestBase<TJsonLoaderTarget, TJsonLoaderRawResource, JsonLoaderResource> {
	protected _createLoader() {
		return new JsonLoader();
	}
}