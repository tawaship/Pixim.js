import * as ManifestBase from './ManifestBase';
import * as SpritesheetLoader from '../loader/SpritesheetLoader';
import * as LoaderBase from '../loader/LoaderBase';
import * as utils from '../utils/index';

export interface ISpritesheetManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<SpritesheetLoader.TSpritesheetLoaderTarget> {

}

export interface ISpritesheetDictionary extends ManifestBase.IRawResourceDictionary<SpritesheetLoader.TSpritesheetLoaderRawResource> {

}

export class SpritesheetManifest extends ManifestBase.ManifestBase<SpritesheetLoader.TSpritesheetLoaderTarget, SpritesheetLoader.TSpritesheetLoaderRawResource, SpritesheetLoader.SpritesheetLoaderResource> {
	protected _createLoader() {
		return new SpritesheetLoader.SpritesheetLoader();
	}
}