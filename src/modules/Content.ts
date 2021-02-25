import * as PIXI from 'pixi.js';
import { IResourceDictionary, IContentResourceDictionary, IManifestDictionary, IContentManifestOption } from './ContentManifestBase';
import { ContentImageManifest } from './ContentImageManifest';
import { ContentSpritesheetManifest } from './ContentSpritesheetManifest';
import { ContentSoundManifest } from './ContentSoundManifest';
import { ContentDeliver, IVariableDictionary, IContentLibrary } from './ContentDeliver';

namespace Pixim {
	/**
	 * @private
	 */
	type TContentManifestType = 'images' | 'spritesheets' | 'sounds';
	
	export interface IContentAssetVersion {
		images?: string;
		spritesheets?: string;
		sounds?: string;
	}
	
	/**
	 * @private
	 */
	interface IContentManifests { 
		images: ContentImageManifest;
		spritesheets: ContentSpritesheetManifest;
		sounds: ContentSoundManifest;
	}
	
	export interface IContentConfigData {
		width: number;
		height: number;
	}
	
	export interface IContentData {
		contentID: string;
		basepath: string;
		version: IContentAssetVersion;
		$: ContentDeliver;
		manifests: IContentManifests;
		additionalManifests: IContentManifests;
		preloadPromise: Promise<void> | null;
		postloadPromise: Promise<void> | null;
	}
	
	/**
	 * @ignore
	 */
	interface TContents {
		[name: string]: typeof Content;
	};
	
	export interface IContentOption {
		/**
		 * Asset root path.
		 */
		basepath?: string;
		
		/**
		 * Asset version.
		 */
		version?: string | IContentAssetVersion;
	}
	
	/**
	 * @ignore
	 */
	const _contents: TContents = {};
	
	/**
	 * @ignore
	 */
	let _contentID: number = 0;
	
	export interface IContentStaticData {
		config: IContentConfigData;
		manifests: IContentManifests;
		lib: IContentLibrary;
	}
	
	/**
	 * @ignore
	 */
	function createManifests(): IContentManifests {
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
		protected _piximData: IContentData;
		
		constructor(options: IContentOption = {}, piximData: IContentStaticData = Content._piximData) {
			const basepath: string = (options.basepath || '').replace(/([^/])$/, '$1/');
			
			if (typeof(options.version) !== 'object') {
				options.version = {
					images: options.version || '',
					spritesheets: options.version || '',
					sounds: options.version || ''
				};
			}
			
			this._piximData = {
				contentID: (++_contentID).toString(),
				basepath,
				version: options.version,
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
		static create(key: string = ''): typeof Content {
			if (key && key in _contents) {
				throw new Error(`Content key '${key}' has already exists.`);
			}
			
			class ContentClone extends Content {
				protected static _piximData: IContentStaticData = createContentStatic();
				
				constructor(options: IContentOption = {}) {
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
		 */
		static defineManifests(key: TContentManifestType, data: IManifestDictionary, options: IContentManifestOption = {}) {
			if (!this._piximData.manifests[key]) {
				return this;
			}
			
			this._piximData.manifests[key].add(data, options);
			
			return this;
		}
		
		/**
		 * Define image assets for class.
		 */
		static defineImages(data: IManifestDictionary, options: IContentManifestOption = {}) {
			return this.defineManifests('images', data, options);
		}
		
		/**
		 * Define spritesheet assets for class.
		 */
		static defineSpritesheets(data: IManifestDictionary, options: IContentManifestOption = {}) {
			return this.defineManifests('spritesheets', data, options);
		}
		
		/**
		 * Define sound assets for class.
		 */
		static defineSounds(data: IManifestDictionary, options: IContentManifestOption = {}) {
			return this.defineManifests('sounds', data, options);
		}
		
		/**
		 * Set the content settings.
		 * 
		 * @param data Config data.
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
		 */
		static defineLibraries(data: IContentLibrary) {
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
		 * @return Returns itself for the method chaining.
		 */
		addManifests(key: TContentManifestType, data: IManifestDictionary, options: IContentManifestOption = {}): this {
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
		addImages(data: IManifestDictionary, options: IContentManifestOption = {}): this {
			return this.addManifests('images', data, options);
		}
		
		/**
		 * Define spritesheet assets for instance.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		addSpritesheets(data: IManifestDictionary, options: IContentManifestOption = {}): this {
			return this.addManifests('spritesheets', data, options);
		}
		
		/**
		 * Define sound assets for instance.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		addSounds(data: IManifestDictionary, options: IContentManifestOption = {}): this {
			return this.addManifests('sounds', data, options);
		}
		
		/**
		 * Define valriables for instance.
		 * 
		 * @return Returns itself for the method chaining.
		 */
		addVars(data: IVariableDictionary): this {
			for (let i in data) {
				 this._piximData.$.vars[i] = data[i];
			}
			
			return this;
		}
		
		/**
		 * Prepare content.
		 */
		prepareAsync(): Promise<void> {
			return this.preloadClassAssetAsync()
				.then(() => {
					return this.preloadInstanceAssetAsync();
				});
		}
		
		/**
		 * Build content.
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
		 */
		preloadClassAssetAsync(): Promise<void> {
			if (this._piximData.preloadPromise) {
				return this._piximData.preloadPromise;
			}
			
			return this._piximData.preloadPromise = this._loadAssetAsync(this._piximData.manifests)
				.catch((e: IManifestDictionary) => {
					this._piximData.preloadPromise = null;
					
					throw e;
				});
		}
		
		/**
		 * Preloads instance assets.
		 */
		preloadInstanceAssetAsync(): Promise<void> {
			if (this._piximData.postloadPromise) {
				return this._piximData.postloadPromise;
			}
			
			return this._piximData.postloadPromise = this._loadAssetAsync(this._piximData.additionalManifests)
				.then(() => {
					this._piximData.postloadPromise = null;
				})
				.catch((e: IManifestDictionary) => {
					this._piximData.postloadPromise = null;
					
					throw e;
				});
		}
		
		private _loadAssetAsync(manifests: IContentManifests): Promise<void> {
			const basepath: string = this._piximData.basepath;
			const version: IContentAssetVersion = this._piximData.version;
			const resources: IContentResourceDictionary = this._piximData.$.resources;
			
			const loaderCount = Object.keys(manifests).length;
			
			if (loaderCount === 0) {
				return Promise.resolve();
			}
			
			const promises: Promise<IResourceDictionary>[] = [];
			const keys: TContentManifestType[] = [];
			for (let i in manifests) {
				const type: TContentManifestType = <TContentManifestType>i;
				keys.push(type);
				
				promises.push(manifests[type].getAsync(basepath, version[type] || ''));
			}
			
			return Promise.all(promises)
				.then((resolver: IResourceDictionary) => {
					for (let i: number = 0; i < resolver.length;i++) {
						resources[keys[i]] = resources[keys[i]] || {};
						
						for (let j in resolver[i]) {
							resources[keys[i]][j] = resolver[i][j];
						}
					}
				})
				.catch((e: IManifestDictionary) => {
					for (let i in e) {
						console.error(`Asset '${i}: ${e[i]}' cannot load.`);
					}
					
					throw e;
				});
		}
	}
}

/**
 * @ignore
 */
export import IContentData = Pixim.IContentData;

/**
 * @ignore
 */
export import IContentStaticData = Pixim.IContentStaticData;

/**
 * @ignore
 */
export import IContentConfigData = Pixim.IContentConfigData;

/**
 * @ignore
 */
export import IContentOption = Pixim.IContentOption;

/**
 * @ignore
 */
export import Content = Pixim.Content;

export { IVariableDictionary , IContentLibrary };