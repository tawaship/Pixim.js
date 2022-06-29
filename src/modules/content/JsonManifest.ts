import * as ManifestBase from './ManifestBase';
import * as JsonLoader from '../loader/JsonLoader';

export interface IJsonManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<JsonLoader.TJsonLoaderTarget> {

}

export interface IJsonDictionary extends ManifestBase.IRawResourceDictionary<JsonLoader.TJsonLoaderRawResource> {

}

export class JsonManifest extends ManifestBase.ManifestBase<JsonLoader.TJsonLoaderTarget, JsonLoader.TJsonLoaderRawResource, JsonLoader.JsonLoaderResource> {
	protected _createLoader() {
		return new JsonLoader.JsonLoader();
	}
}