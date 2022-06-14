import * as ManifestBase from './ManifestBase';
import * as SoundLoader from '../loader/SoundLoader';

export interface ISoundManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<SoundLoader.TSoundLoaderTarget> {

}

export interface ISoundDictionary extends ManifestBase.IRawResourceDictionary<SoundLoader.TSoundLoaderRawResource> {

}

export class SoundManifest extends ManifestBase.ManifestBase<SoundLoader.TSoundLoaderTarget, SoundLoader.TSoundLoaderRawResource> {
	protected _loadAsync(targets: ISoundManifestTargetDictionary, options: SoundLoader.ISoundLoaderOption = {}) {
		const loader = new SoundLoader.SoundLoader(options);
		
		return this._doneLoaderAsync(loader, targets);
	}
}