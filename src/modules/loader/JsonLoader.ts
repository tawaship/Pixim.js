import * as PIXI from 'pixi.js';
import * as LoaderBase from './LoaderBase';
import * as TextureLoader from './TextureLoader';
import * as utils from '../utils/index';

export interface IJsonData {
	[name: string]: any;
}

export type TJsonLoaderRawResource = IJsonData;

export class JsonLoaderResource extends LoaderBase.LoaderResource<TJsonLoaderRawResource> {
	destroy() {
		
	}
}

export type TJsonLoaderTarget = string;

export interface IJsonLoaderTargetDictionary extends LoaderBase.ILoaderTargetDictionary<TJsonLoaderTarget> {

}

export interface IJsonLoaderResourceDictionary extends LoaderBase.ILoaderResourceDictionary<TJsonLoaderRawResource> {

}

export interface IJsonLoaderOption extends LoaderBase.ILoaderOption {

}

export class JsonLoader extends LoaderBase.LoaderBase<TJsonLoaderTarget, TJsonLoaderRawResource> {
	loadAsync(target: TJsonLoaderTarget, options: IJsonLoaderOption = {}) {
		const url = this._resolveUrl(target, options);
		
		return fetch(url)
			.then(res => res.json())
			.then(json => new JsonLoaderResource(json, null))
			.catch((e: any) => new JsonLoaderResource({}, e));
	}
	
	loadAllAsync(targets: IJsonLoaderTargetDictionary, options: IJsonLoaderOption = {}) {
		if (Object.keys(targets).length === 0) {
			return Promise.resolve({});
		}
		
		const promises = [];
		const res: IJsonLoaderResourceDictionary = {};
		
		for (let i in targets) {
			promises.push(
				this.loadAsync(targets[i], options)
					.then(resource => {
						res[i] = resource;
					})
			);
		}
		
		return Promise.all(promises)
			.then(() => {
				return res;
			});
	}
	
	/*
	private _loadFromUrlsAsync(targets: IJsonLoaderTargetDictionary, options: IJsonLoaderOption = {}) {
		const res: IJsonLoaderResourceDictionary = {};
		
		if (Object.keys(targets).length === 0) {
			return Promise.resolve(res);
		}
		
		const loader = new PIXI.Loader();
		
		const version = this._resolveVersion(options.version);
		if (version) {
			loader.defaultQueryString = `_fv=${version}`;
		}
		
		const basepath = this._resolveBasepath(options.basepath);
		for (let i in targets) {
			const target = targets[i];
			const uri = utils.resolvePath(target, basepath);
			loader.add(i, uri, {
				crossOrigin: true
			});
		}
		
		return new Promise<IJsonLoaderResourceDictionary>(resolve => {
			loader.load((loader, resources) => {
				for (let i in resources) {
					if (!targets[i]) {
						continue;
					}
					
					const resource: PIXI.LoaderResource | undefined = resources[i];
					
					if (!resource) {
						res[i] = new JsonLoaderResource({}, 'invalid json');
						continue;
					}
					
					if (resource.error) {
						res[i] = new JsonLoaderResource({}, resource.error);
						continue;
					}
					
					res[i] = new JsonLoaderResource(resource.data, null);
				}
				
				resolve(res);
			});
		});
	}
	*/
}