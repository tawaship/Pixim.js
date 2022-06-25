import * as PIXI from 'pixi.js';
import { ManifestBase, IManifestClass, IRawResourceDictionary, IManifestTargetDictionary, IManifestOption, ILoaderXhrOptionFacotryDelegate, TManifestResourceVersion, EVENT_LOADER_ASSET_LOADED } from './ManifestBase';
import { TextureManifest, ITextureManifestTargetDictionary } from './TextureManifest';
import { SpritesheetManifest, ISpritesheetManifestTargetDictionary } from './SpritesheetManifest';
import { SoundManifest, ISoundManifestTargetDictionary } from './SoundManifest';
import { JsonManifest, IJsonManifestTargetDictionary } from './JsonManifest';
import { ContentDeliver, IContentDeliverData, IVariableDictionary, IContentLibrary, IContentResourceDictionary } from './ContentDeliver';
import { Emitter } from '@tawaship/emitter';

export interface IContentAssetBasepath {
	[key: string]: string;
}

export interface IContentAssetVersion {
	[key: string]: TManifestResourceVersion;
}

export interface IContentManifests {
	[key: string]: ManifestBase<any, any>;
}

export interface IContentConfigData {
	width: number;
	height: number;
}

export interface IContentData {
	contentID: string;
	basepath: IContentAssetBasepath;
	version: IContentAssetVersion;
	xhr?: ILoaderXhrOptionFacotryDelegate;
	$: ContentDeliver;
	manifests: IContentManifests;
	additionalManifests: IContentManifests;
	preloadPromise: Promise<void> | null;
	postloadPromise: Promise<void> | null;
	contentDeliverData: IContentDeliverData;
}

export interface TContents {
	[name: string]: typeof Content;
};

export interface IContentOption {
	/**
	 * Asset root path.
	 */
	basepath?: string | IContentAssetBasepath;
	
	/**
	 * Asset version.
	 */
	version?: TManifestResourceVersion | IContentAssetVersion;
	
	/**
	 * A header given when loading an asset, or a function that returns a header.
	 * If non-null is specified, fetch API will be used instead of the default Loader when loading each asset.
	 */
	xhr?: ILoaderXhrOptionFacotryDelegate;
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
	const res: IContentManifests = {};
	
	for (let i in _manifests) {
		res[i] = new _manifests[i](i);
	}
	
	return res;
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

/**
 * @ignore
 */
const _manifests: { [key: string]: IManifestClass } = {};

export class Content extends Emitter {
	protected static _piximData: IContentStaticData;
	protected _piximData: IContentData;
	private _loadedResourceHandler: (data: { target: any, resource: any }) => void;
	
	constructor(options: IContentOption = {}, piximData: IContentStaticData = Content._piximData) {
		super();
		
		this._loadedResourceHandler = (data: { target: any, resource: any }) => {
			this.emit(EVENT_LOADER_ASSET_LOADED, data);
		};
		
		if (typeof(options.basepath) !== 'object') {
			const basepath: IContentAssetBasepath = {};
			const v = options.basepath || '';
			for (let i in _manifests) {
				basepath[i] = v;
			}
			options.basepath = basepath;
		}
		
		if (typeof(options.version) !== 'object') {
			const version: IContentAssetVersion = {};
			const v = options.version || '';
			for (let i in _manifests) {
				version[i] = v;
			}
			options.version = version;
		}
		
		const contentDeliverData = {
			width: piximData.config.width,
			height: piximData.config.height,
			lib: piximData.lib,
			resources: {},
			vars: {}
		};
		
		this._piximData = {
			contentID: (++_contentID).toString(),
			basepath: options.basepath,
			version: options.version,
			xhr: options.xhr,
			$: new ContentDeliver(contentDeliverData),
			manifests: piximData.manifests,
			additionalManifests: createManifests(),
			preloadPromise: null,
			postloadPromise: null,
			contentDeliverData
		};
		
		for (let i in this._piximData.manifests) {
			this._piximData.manifests[i].on(EVENT_LOADER_ASSET_LOADED, this._loadedResourceHandler);
		}
		
		for (let i in this._piximData.additionalManifests) {
			this._piximData.additionalManifests[i].on(EVENT_LOADER_ASSET_LOADED, this._loadedResourceHandler);
		}
	}
	
	/**
	 * Register manifest class.
	 */
	static registerManifest(key: string, Manifest: IManifestClass) {
		_manifests[key] = Manifest;
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
	static defineTargets<T>(key: string, targets: IManifestTargetDictionary<T>, options: IManifestOption = {}) {
		if (!this._piximData.manifests[key]) {
			console.warn(`Manifest '${key}' is not registered.`);
			return this;
		}
		
		this._piximData.manifests[key].add(targets, options);
		
		return this;
	}
	
	/**
	 * Define image assets for class.
	 */
	static defineImages(targets: ITextureManifestTargetDictionary, options: IManifestOption = {}) {
		return this.defineTargets('images', targets, options);
	}
	
	/**
	 * Define spritesheet assets for class.
	 */
	static defineSpritesheets(targets: ISpritesheetManifestTargetDictionary, options: IManifestOption = {}) {
		return this.defineTargets('spritesheets', targets, options);
	}
	
	/**
	 * Define sound assets for class.
	 */
	static defineSounds(targets: ISoundManifestTargetDictionary, options: IManifestOption = {}) {
		return this.defineTargets('sounds', targets, options);
	}
	
	/**
	 * Define json assets for class.
	 */
	static defineJsons(targets: IJsonManifestTargetDictionary, options: IManifestOption = {}) {
		return this.defineTargets('jsons', targets, options);
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
	addTargets<T>(key: string, targets: IManifestTargetDictionary<T>, options: IManifestOption = {}): this {
		if (!this._piximData.additionalManifests[key]) {
			console.warn(`Manifest '${key}' is not registered.`);
			return this;
		}
		
		this._piximData.additionalManifests[key].add(targets, options);
		
		return this;
	}
	
	/**
	 * Define image assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addImages(data: ITextureManifestTargetDictionary, options: IManifestOption = {}): this {
		return this.addTargets('images', data, options);
	}
	
	/**
	 * Define spritesheet assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addSpritesheets(targets: ISpritesheetManifestTargetDictionary, options: IManifestOption = {}): this {
		return this.addTargets('spritesheets', targets, options);
	}
	
	/**
	 * Define sound assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addSounds(targets: ISoundManifestTargetDictionary, options: IManifestOption = {}): this {
		return this.addTargets('sounds', targets, options);
	}
	
	/**
	 * Define json assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addJsons(targets: IJsonManifestTargetDictionary, options: IManifestOption = {}): this {
		return this.addTargets('jsons', targets, options);
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
			.catch(e => {
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
			.catch(e => {
				this._piximData.postloadPromise = null;
				
				throw e;
			});
	}
	
	destroy() {
		const contentDeliverData = this._piximData.contentDeliverData;
		
		contentDeliverData.lib = {};
		contentDeliverData.vars = {};
		
		const manifests = this._piximData.manifests;
		const additionalManifests = this._piximData.additionalManifests;
		
		for (let i in manifests) {
			manifests[i].off(EVENT_LOADER_ASSET_LOADED, this._loadedResourceHandler);
		}
		
		for (let i in additionalManifests) {
			additionalManifests[i].off(EVENT_LOADER_ASSET_LOADED, this._loadedResourceHandler);
		}
		
		const resources = contentDeliverData.resources;
		for (let i in resources) {
			resources[i] = {};
		}
	}
	
	get classAssetCount() {
		let total = 0;
		
		const manifests = this._piximData.manifests;
		for (let i in manifests) {
			total += manifests[i].count;
		}
		
		return total;
	}
	
	get instanceAssetCount() {
		let total = 0;
		
		const additionalManifests = this._piximData.additionalManifests;
		for (let i in additionalManifests) {
			total += additionalManifests[i].count;
		}
		
		return total;
	}
	
	get assetCount() {
		return this.classAssetCount + this.instanceAssetCount;
	}
	
	/**
	 * @fires [[LoaderBase.EVENT_LOADER_ASSET_LOADED]]
	 */
	private _loadAssetAsync(manifests: IContentManifests): Promise<void> {
		const basepaths: IContentAssetBasepath = this._piximData.basepath;
		const versions: IContentAssetVersion = this._piximData.version;
		const resources: IContentResourceDictionary = this._piximData.$.resources;
		
		const loaderCount = Object.keys(manifests).length;
		
		if (loaderCount === 0) {
			return Promise.resolve();
		}
		
		const promises: Promise<IRawResourceDictionary<any>>[] = [];
		const keys: string[] = [];
		for (let i in manifests) {
			const type = i;
			keys.push(type);
			
			const basepath = (basepaths[type] || '').replace(/(.+[^\/])$/, '$1/');
			const version = versions[type] || '';
			const manifest = manifests[type];
			
			promises.push(manifest.getAsync({ basepath, version, xhr: this._piximData.xhr }));
		}
		
		return Promise.all(promises)
			.then(resolver => {
				for (let i: number = 0; i < resolver.length;i++) {
					resources[keys[i]] = resources[keys[i]] || {};
					
					for (let j in resolver[i]) {
						resources[keys[i]][j] = resolver[i][j];
					}
				}
			});
	}
}

Content.registerManifest('images', TextureManifest);
Content.registerManifest('spritesheets', SpritesheetManifest);
Content.registerManifest('sounds', SoundManifest);
Content.registerManifest('jsons', JsonManifest);