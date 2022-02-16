import * as ManifestBase from './ManifestBase';
import * as SpritesheetLoader from '../loader/SpritesheetLoader';

export interface ISpritesheetManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<SpritesheetLoader.TSpritesheetLoaderTarget> {

}

export interface ISpritesheetDictionary extends ManifestBase.IRawResourceDictionary<SpritesheetLoader.TSpritesheetLoaderRawResource> {

}

export class SpritesheetManifest extends ManifestBase.ManifestBase<SpritesheetLoader.TSpritesheetLoaderTarget, SpritesheetLoader.TSpritesheetLoaderRawResource> {
	protected _loadAsync(targets: ISpritesheetManifestTargetDictionary, options: SpritesheetLoader.ISpritesheetLoaderOption = {}) {
		const loader = new SpritesheetLoader.SpritesheetLoader(options);
		
		return loader.loadAllAsync(targets);
	}
}