import * as ManifestBase from './ManifestBase';
import * as SoundLoader from '../loader/SoundLoader';
import * as utils from '../utils/index';

export interface ISoundManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<SoundLoader.TSoundLoaderTarget> {

}

export interface ISoundDictionary extends ManifestBase.IRawResourceDictionary<SoundLoader.TSoundLoaderRawResource> {

}

export class SoundManifest extends ManifestBase.ManifestBase<SoundLoader.TSoundLoaderTarget, SoundLoader.TSoundLoaderRawResource, SoundLoader.SoundLoaderResource> {
	protected _createLoader() {
		return new SoundLoader.SoundLoader();
	}
}