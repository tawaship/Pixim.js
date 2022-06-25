import * as ManifestBase from './ManifestBase';
import * as SpritesheetLoader from '../loader/SpritesheetLoader';
import * as LoaderBase from '../loader/LoaderBase';
import * as utils from '../utils/index';

export interface ISpritesheetManifestTargetDictionary extends ManifestBase.IManifestTargetDictionary<SpritesheetLoader.TSpritesheetLoaderTarget> {

}

export interface ISpritesheetDictionary extends ManifestBase.IRawResourceDictionary<SpritesheetLoader.TSpritesheetLoaderRawResource> {

}

export class SpritesheetManifest extends ManifestBase.ManifestBase<SpritesheetLoader.TSpritesheetLoaderTarget, SpritesheetLoader.TSpritesheetLoaderRawResource> {
	protected _createLoader() {
		return new SpritesheetLoader.SpritesheetLoader();
	}
	
	protected _resolveTarget(target: SpritesheetLoader.TSpritesheetLoaderTarget, options: ManifestBase.IManifestLoaderOption = {}) {
		if (typeof(target) === 'string') {
			return this._resolveTargetPath(target, options);
		}
		
		if (typeof(target.meta.image) === 'string') {
			target.meta.image = this._resolveTargetPath(target.meta.image, options);
		}
		
		return target;
	}
	
	protected _getAppendOption(options: ManifestBase.IManifestLoaderOption = {}): SpritesheetLoader.ISpritesheetLoaderOption {
		return {
			version: options.version
		};
	}
}