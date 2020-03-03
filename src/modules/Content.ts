import * as PIXI from 'pixi.js';
import { ContentDeliver, TContentLibrary } from './ContentDeliver';
import { ContentManifestBase, TResources, TContentResources, TManifests } from './ContentManifestBase';

/**
 * @private
 */
type TContentManifestClasses = { [name: string]: typeof ContentManifestBase };

/**
 * @private
 */
type TContentManifests = { [name: string]: ContentManifestBase };

export interface IContentConfigData {
	fps: number,
	width: number,
	height: number
}

/**
 * @private
 */
interface IContentData {
	contentID: string;
	basepath: string;
	$: ContentDeliver;
	manifests: TContentManifests;
	additionalManifests: TContentManifests;
	preloadPromise: Promise<void> | null;
	postloadPromise: Promise<void> | null;
}

/**
 * @private
 */
type TContents = { [name: string]: typeof Content };

/**
 * @property basepath Asset root path.
 */
export type TContentOption = {
	basepath?: string
}

/**
 * @ignore
 */
const _contents: TContents = {};

/**
 * @ignore
 */
let _contentID: number = 0;

/**
 * @private
 */
interface IContentStaticData {
	config: IContentConfigData;
	manifests: TContentManifests;
	lib: TContentLibrary;
}

/**
 * @ignore
 */
const _registeredManifestClasses: TContentManifestClasses = {};

/**
 * @ignore
 */
function createManifests(): TContentManifests {
	const res: TContentManifests = {};
	
	for (let i in _registeredManifestClasses) {
		res[i] = new _registeredManifestClasses[i]();
	}
	
	return res;
}

export class Content {
	protected static _piximData: IContentStaticData;
	
	private _piximData: IContentData;
	
	constructor(options: TContentOption = {}, piximData: IContentStaticData) {
		const basepath: string = (options.basepath || '').replace(/([^/])$/, '$1/');
		
		this._piximData = {
			contentID: (++_contentID).toString(),
			basepath,
			$: new ContentDeliver({
				fps: piximData.config.fps,
				width: piximData.config.width,
				height: piximData.config.height,
				lib: piximData.lib,
				resources: {},
				vars: {}
			}),
			manifests: piximData.manifests,
			additionalManifests: createManifests(),
			preloadPromise: null,
			postloadPromise: null
		}
	}
	
	/**
	 * Initialize contents.
	 * 
	 * @param key Name when saving content.
	 * @return Created content class.
	 */
	static create(key: string): typeof Content {
		if (key && key in _contents) {
			throw new Error(`Content key '${key}' has already exists.`);
		}
		
		class ContentClone extends Content {
			protected static _piximData: IContentStaticData = {
				config: {
					fps: 60,
					width: 450,
					height: 800
				},
				manifests: createManifests(),
				lib: {}
			}
			
			constructor(options: TContentOption = {}) {
				super(options, ContentClone._piximData);
			}
		}
		
		if (!key) {
			return ContentClone;
		}
		
		return _contents[key] = ContentClone;
	}
	
	/**
	 * Get content.
	 */
	static getContent(key: string): typeof Content {
		return _contents[key];
	}
	
	/**
	 * Remove content.
	 * 
	 * @function Pixim.Content.removeContent
	 * @param key {string}
	 */
	static removeContent(key: string): void {
		delete(_contents[key]);
	}
	
	/**
	 * Register custom manifest class.
	 */
	static useManifestClass(cls: typeof ContentManifestBase) {
		_registeredManifestClasses[cls.manifestKey] = cls;
	}
	
	/**
	 * Set the content settings.
	 * 
	 * @param data Config data.
	 * @return Returns itself for the method chaining.
	 */
	static setConfig(data: IContentConfigData): typeof Content {
		this._piximData.config.fps = data.fps;
		this._piximData.config.width = data.width;
		this._piximData.config.height = data.height;
		
		return this;
	}
	
	/**
	 * Define libraries that is material of the content.<br />
	 * In the constructor named root, Application passes a reference to ContentDeliver as an argument.<br />
	 * By giving this argument to the child further, you will be able to access the data freely from anywhere.
	 * 
	 * @param data Library data.
	 * @return Returns itself for the method chaining.
	 */
	static defineLibraries(data: TContentLibrary): typeof Content {
		for (let i in data) {
			this._piximData.lib[i] = data[i];
		}
		
		return this;
	}
	
	/**
	 * ID of this content.
	 */
	get contentID(): string {
		return this._piximData.contentID;
	}
	
	/**
	 * Define valriables.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	defineVars(data: { [name: string]: any }): Content {
		for (let i in data) {
			 this._piximData.$.vars[i] = data[i];
		}
		
		return this;
	}
	
	/**
	 * Prepare content.
	 * 
	 * @async
	 */
	prepareAsync(): Promise<void> {
		return this.preloadAsync()
			.then(() => {
				return this.postloadAsync();
			});
	}
	
	/**
	 * Build content.
	 * 
	 * @async
	 */
	buildAsync(): Promise<PIXI.Container> {
		if (!this._piximData.$.lib.root) {
			throw new Error('There is no library named "root" in the content.');
		}
		
		return this.prepareAsync()
			.then(() => {
				return new this._piximData.$.lib.root(this._piximData.$);
			});
	}
	
	/**
	 * Preloads assets.
	 * 
	 * @async
	 */
	preloadAsync(): Promise<void> {
		if (this._piximData.preloadPromise) {
			return this._piximData.preloadPromise;
		}
		
		return this._piximData.preloadPromise = this._loadAssetAsync(this._piximData.manifests)
			.catch((e: TManifests) => {
				this._piximData.preloadPromise = null;
				
				throw e;
			});
	}
	
	/**
	 * Postload srequired assets.
	 * 
	 * @async
	 */
	postloadAsync(): Promise<void> {
		if (this._piximData.postloadPromise) {
			return this._piximData.postloadPromise;
		}
		
		return this._piximData.postloadPromise = this._loadAssetAsync(this._piximData.additionalManifests)
			.then(() => {
				this._piximData.postloadPromise = null;
			})
			.catch((e: TManifests) => {
				this._piximData.postloadPromise = null;
				
				throw e;
			});
	}
	
	private _loadAssetAsync(manifests: TContentManifests): Promise<void> {
		const basepath: string = this._piximData.basepath;
		const resources: TContentResources = this._piximData.$.resources;
		
		const loaderCount = Object.keys(manifests).length;
		
		if (loaderCount === 0) {
			return Promise.resolve();
		}
		
		const promises: Promise<TResources>[] = [];
		const keys: string[] = [];
		for (let i in manifests) {
			keys.push(i);
			promises.push(manifests[i].getAsync(basepath));
		}
		
		return Promise.all(promises)
			.then((resolver: TResources) => {
				for (let i: number = 0; i < resolver.length;i++) {
					resources[keys[i]] = resources[keys[i]] || {};
					
					for (let j in resolver[i]) {
						resources[keys[i]][j] = resolver[i][j];
					}
				}
			})
			.catch((e: TManifests) => {
				for (let i in e) {
					console.error(`Asset '${i}: ${e[i]}' cannot load.`);
				}
				
				throw e;
			});
	}
}