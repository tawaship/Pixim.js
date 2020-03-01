import * as PIXI from 'pixi.js';
import { Emitter } from './Emitter';
import { ContentDeliver, Vars } from './ContentDeliver';
import { ContentResource, Resources } from './ContentResource';
import { Container } from './Container';

export interface IContentConfigData {
	fps: number,
	width: number,
	height: number
}

export type ContentLibrary = { [name: string]: typeof PIXI.Container | typeof Container };

/**
 * @private
 */
interface IContentStaticData {
	config: IContentConfigData,
	manifests: ContentResources;
	lib: ContentLibrary;
}

export interface IContentData {
	contentID: number;
	basepath: string;
	$: ContentDeliver;
	manifests: ContentResources;
	additionalManifests: ContentResources;
	preloadPromise: Promise<void> | null;
	postloadPromise: Promise<void> | null;
}

/**
 * @private
 */
type Contents = { [name: string]: typeof Content };

/**
 * @property basepath Asset root path.
 */
export type ContentOption = {
	basepath?: string
}

/**
 * @private
 */
type ContentResources = { [name: string]: ContentResource};

export class Content extends Emitter {
	private static _contents: Contents = {};
	
	private static _contentID: number = 0;
	
	private static _piximData: IContentStaticData = {
		config: {
			fps: 60,
			width: 450,
			height: 800
		},
		manifests: {},
		lib: {}
	};
	
	private _piximData: IContentData;
	
	constructor(options: ContentOption = {}, piximData: IContentStaticData) {
		super();
		
		const basepath: string = (options.basepath || '').replace(/([^/])$/, '$1/');
		
		this._piximData = {
			contentID: ++Content._contentID,
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
			additionalManifests: {},
			preloadPromise: null,
			postloadPromise: null
		}
	}
	
	/**
	 * @typedef Pixim.Content~OptionData {object}
	 * @property basepath {string} Asset root path.
	 */
	
	/**
	 * Get content.
	 */
	static getContent(key: string): typeof Content {
		return this._contents[key];
	}
	
	/**
	 * Remove content.
	 * 
	 * @function Pixim.Content.removeContent
	 * @param key {string}
	 */
	static removeContent(key: string): void {
		delete(this._contents[key]);
	}
	
	/**
	 * Initialize contents.
	 * 
	 * @param key Name when saving content.
	 * @return Created content class.
	 */
	static create(key: string): typeof Content {
		if (key && key in Content._contents) {
			throw new Error(`Content key '${key}' has already exists.`);
		}
		
		class ContentClone extends Content {
			constructor(options: ContentOption = {}) {
				super(options, ContentClone._piximData);
			}
		}
		
		if (!key) {
			return ContentClone;
		}
		
		return this._contents[key] = ContentClone;
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
	static defineLibraries(data: ContentLibrary): typeof Content {
		for (let i in data) {
			this._piximData.lib[i] = data[i];
		}
		
		return this;
	}
	
	/**
	 * ID of this content.
	 */
	get contentID(): number {
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
			.catch(e => {
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
			.catch(e => {
				this._piximData.postloadPromise = null;
				
				throw e;
			});
	}
	
	private _loadAssetAsync(manifests: ContentResources) {
		const basepath: string = this._piximData.basepath;
		const resources: { [name: string]: Resources } = this._piximData.$.resources;
		
		const loaderCount = Object.keys(manifests).length;
		
		if (loaderCount === 0) {
			return Promise.resolve();
		}
		
		const promises: Promise<Resources>[] = [];
		const keys: string[] = [];
		for (let i in manifests) {
			keys.push(i);
			promises.push(manifests[i].getAsync(basepath));
		}
		
		return Promise.all(promises)
			.then((resolver: Resources) => {
				for (let i: number = 0; i < resolver.length;i++) {
					resources[keys[i]] = resources[keys[i]] || {};
					
					for (let j in resolver[i]) {
						resources[keys[i]][j] = resolver[i][j];
					}
				}
			})
			.catch(manifest => {
				console.error(`Asset '${manifest.url}' cannot load.`);
				
				throw manifest;
			});
	}
}