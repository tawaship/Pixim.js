import * as PIXI from 'pixi.js';
import { ContentDeliver, TContentLibrary } from './ContentDeliver';
import { TResources, TContentResources, TManifests, IContentManifestOption } from './ContentManifestBase';
import { ContentImageManifest } from './ContentImageManifest';
import { ContentSpritesheetManifest } from './ContentSpritesheetManifest';
import { ContentSoundManifest } from './ContentSoundManifest';

export type TContentManifestType = 'images' | 'spritesheets' | 'sounds';

/**
 * @private
 */
type TContentManifests = { 
	images: ContentImageManifest,
	spritesheets: ContentSpritesheetManifest,
	sounds: ContentSoundManifest
};

export interface IContentConfigData {
	width: number,
	height: number
}

export type TContentVars = { [name: string]: any };

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
function createManifests(): TContentManifests {
	return {
		images: new ContentImageManifest(),
		spritesheets: new ContentSpritesheetManifest(),
		sounds: new ContentSoundManifest()
	};
}

/**
 * @ignore
 */
function createContentStatic(): IContentStaticData {
	return {
		config: {
			width: 450,
			height: 800
		},
		manifests: createManifests(),
		lib: {}
	};
}

export class Content {
	protected static _piximData: IContentStaticData;
	
	private _piximData: IContentData;
	
	constructor(options: TContentOption = {}, piximData: IContentStaticData = Content._piximData) {
		const basepath: string = (options.basepath || '').replace(/([^/])$/, '$1/');
		
		this._piximData = {
			contentID: (++_contentID).toString(),
			basepath,
			$: new ContentDeliver({
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
	 * Create a cloned content class.
	 * 
	 * @param key Content name.
	 * @return Cloned content class.
	 */
	static create<T extends Content>(key: string = ''): typeof Content {
		if (key && key in _contents) {
			throw new Error(`Content key '${key}' has already exists.`);
		}
		
		class ContentClone extends Content {
			protected static _piximData: IContentStaticData = createContentStatic();
			
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
	 * Get cloned content.
	 */
	static get(key: string) {
		return _contents[key];
	}
	
	/**
	 * Remove cloned content.
	 * 
	 * @function Pixim.Content.removeContent
	 * @param key {string}
	 */
	static remove(key: string): void {
		delete(_contents[key]);
	}
	
	/**
	 * Define assets for class.
	 * 
	 * @since 1.2.0
	 * @return Returns itself for the method chaining.
	 */
	static defineManifests(key: TContentManifestType, data: TManifests, options: IContentManifestOption = {}) {
		if (!this._piximData.manifests[key]) {
			return this;
		}
		
		this._piximData.manifests[key].add(data, options);
		
		return this;
	}
	
	/**
	 * Define image assets for class.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	static defineImages(data: TManifests, options: IContentManifestOption = {}) {
		return this.defineManifests('images', data, options);
	}
	
	/**
	 * Define spritesheet assets for class.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	static defineSpritesheets(data: TManifests, options: IContentManifestOption = {}) {
		return this.defineManifests('spritesheets', data, options);
	}
	
	/**
	 * Define sound assets for class.
	 * 
	 * @since 1.3.0
	 * @return Returns itself for the method chaining.
	 */
	static defineSounds(data: TManifests, options: IContentManifestOption = {}) {
		return this.defineManifests('sounds', data, options);
	}
	
	/**
	 * Set the content settings.
	 * 
	 * @param data Config data.
	 * @return Returns itself for the method chaining.
	 */
	static setConfig(data: IContentConfigData) {
		//this._piximData.config.fps = data.fps;
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
	static defineLibraries(data: TContentLibrary) {
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
	 * Define assets for instance.
	 * 
	 * @since 1.2.0
	 * @return Returns itself for the method chaining.
	 */
	addManifests(key: TContentManifestType, data: TManifests, options: IContentManifestOption = {}): this {
		if (!this._piximData.additionalManifests[key]) {
			return this;
		}
		
		this._piximData.additionalManifests[key].add(data, options);
		
		return this;
	}
	
	/**
	 * Define image assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addImages(data: TManifests, options: IContentManifestOption = {}): this {
		return this.addManifests('images', data, options);
	}
	
	/**
	 * Define spritesheet assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addSpritesheets(data: TManifests, options: IContentManifestOption = {}): this {
		return this.addManifests('spritesheets', data, options);
	}
	
	/**
	 * Define sound assets for instance.
	 * 
	 * @since 1.3.0
	 * @return Returns itself for the method chaining.
	 */
	addSounds(data: TManifests, options: IContentManifestOption = {}): this {
		return this.addManifests('sounds', data, options);
	}
	
	/**
	 * Define valriables for instance.
	 * 
	 * @since 1.3.0
	 * @return Returns itself for the method chaining.
	 */
	addVars(data: TContentVars): this {
		for (let i in data) {
			 this._piximData.$.vars[i] = data[i];
		}
		
		return this;
	}
	
	/**
	 * Define valriables.
	 * 
	 * @deprecated since 1.3.0
	 * @alias <a href="addvars">addVars</a>
	 * @return Returns itself for the method chaining.
	 */
	defineVars(data: TContentVars): this {
		return this.addVars(data);
	}
	
	/**
	 * Prepare content.
	 * 
	 * @async
	 */
	prepareAsync(): Promise<void> {
		return this.preloadClassAssetAsync()
			.then(() => {
				return this.preloadInstanceAssetAsync();
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
	 * Preloads class assets.
	 * 
	 * @async
	 */
	preloadClassAssetAsync(): Promise<void> {
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
	 * Preloads instance assets.
	 * 
	 * @async
	 */
	preloadInstanceAssetAsync(): Promise<void> {
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
		const keys: TContentManifestType[] = [];
		for (let i in manifests) {
			const type: TContentManifestType = <TContentManifestType>i;
			keys.push(type);
			promises.push(manifests[type].getAsync(basepath));
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