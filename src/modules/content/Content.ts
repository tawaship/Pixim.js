import { ManifestBase, IManifestClass, IManifestOption, IManifestLoaderOption, TManifestResourceVersion, TManifestLoaderXhrOption, EVENT_LOADER_ASSET_LOADED } from './ManifestBase';
import { TextureManifest } from './TextureManifest';
import { SpritesheetManifest } from './SpritesheetManifest';
import { SoundManifest } from './SoundManifest';
import { JsonManifest } from './JsonManifest';
import { ContentDeliver, IContentDeliverData, IContentResourceDictionary, TContentLibraryDictionary } from './ContentDeliver';
import { Emitter } from '@tawaship/emitter';
import { Container } from 'pixi.js';
import { ILoaderOption, LoaderResource, TJsonLoaderTarget, TSoundLoaderTarget, TSpritesheetLoaderTarget, TTextureLoaderTarget } from '../loader';

export interface IContentAssetBasepath {
	[ manifestKey: string ]: string;
}

export interface IContentAssetVersion {
	[ manifestKey: string ]: TManifestResourceVersion;
}

export interface IContentAssetXhrOption {
	[ manifestKey: string ]: TManifestLoaderXhrOption;
}

export interface IContentAssetLoaderOption {
	[ manifestKey: string ]: ILoaderOption;
}

export interface IContentManifests {
    images: TextureManifest;
    spritesheets: SpritesheetManifest;
    sounds: SoundManifest;
    jsons: JsonManifest;
    [manifestKey: string]: ManifestBase<any, any, any>;
}

export interface IContentConfigData {
	width: number;
	height: number;
}

export interface IContentData {
	contentID: string;
	options: IContentOption;
	$: ContentDeliver;
	manifests: IContentManifests;
	additionalManifests: IContentManifests;
	preloadPromise: Promise<void> | null;
	postloadPromise: Promise<void> | null;
	contentDeliverData: IContentDeliverData;
}

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
	 * If a value that can be considered true is specified, fetch API will be used instead of the default Loader when loading each asset.
	 */
	xhr?: TManifestLoaderXhrOption;
	
	typeOptions?: IContentAssetLoaderOption;
}

/**
 * @ignore
 */
const _contents: Record<string, typeof Content> = {};

/**
 * @ignore
 */
let _contentID: number = 0;

export interface IContentStaticData {
	config: IContentConfigData;
	manifests: IContentManifests;
	lib: TContentLibraryDictionary;
}

/**
 * @ignore
 */
function createManifests(): IContentManifests {
	const res: IContentManifests = {
        images: new TextureManifest("images"),
        spritesheets: new SpritesheetManifest("spritesheets"),
        sounds: new SoundManifest("sounds"),
        jsons: new JsonManifest("jsons")
    };
	
	for (let i in _externalManifestClasses) {
		res[i] = new _externalManifestClasses[i](i);
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
const _externalManifestClasses: {

    [ key: string ]: IManifestClass<any, any, any>
} = {
    images: TextureManifest,
    spritesheets: SpritesheetManifest,
    sounds: SoundManifest,
    jsons: JsonManifest
};

export class Content extends Emitter {
	protected static _piximData: IContentStaticData;
	protected _piximData: IContentData;
	private _loadedResourceHandler: (data: { target: any, resource: any }) => void;
	
    /**
     * {@link EVENT_LOADER_ASSET_LOADED} fired when any of the assets are loaded. 
     * @param options 
     * @param piximData 
     */
	constructor(options: IContentOption = {}, piximData: IContentStaticData = Content._piximData) {
		super();
		
		this._loadedResourceHandler = (data: { target: any, resource: any }) => {
			this.emit(EVENT_LOADER_ASSET_LOADED, data);
		};
		
		const contentDeliverData = {
			width: piximData.config.width,
			height: piximData.config.height,
			lib: piximData.lib,
			resources: {
                images: {},
                spritesheets: {},
                sounds: {},
                jsons: {}
            },
			vars: {}
		};
		
		this._piximData = {
			contentID: (++_contentID).toString(),
			options,
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
	static registerManifest<T, U, V extends LoaderResource<U>>(key: string, Manifest: IManifestClass<T, U, V>) {
		_externalManifestClasses[key] = Manifest;
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
	 * @param key {string}
	 */
	static remove(key: string): void {
		delete(_contents[key]);
	}
	
	/**
	 * Define assets for class.
	 */
	static defineTargets<T>(key: string, targets: Record<string, T>, options: IManifestOption = {}) {
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
	static defineImages(targets: Record<string, TTextureLoaderTarget>, options: IManifestOption = {}) {
		return this.defineTargets('images', targets, options);
	}
	
	/**
	 * Define spritesheet assets for class.
	 */
	static defineSpritesheets(targets: Record<string, TSpritesheetLoaderTarget>, options: IManifestOption = {}) {
		return this.defineTargets('spritesheets', targets, options);
	}
	
	/**
	 * Define sound assets for class.
	 */
	static defineSounds(targets: Record<string, TSoundLoaderTarget>, options: IManifestOption = {}) {
		return this.defineTargets('sounds', targets, options);
	}
	
	/**
	 * Define json assets for class.
	 */
	static defineJsons(targets: Record<string, TJsonLoaderTarget>, options: IManifestOption = {}) {
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
	static defineLibraries(data: TContentLibraryDictionary) {
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
	addTargets<T>(key: string, targets: Record<string, T>, options: IManifestOption = {}): this {
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
	addImages(data: Record<string, TTextureLoaderTarget>, options: IManifestOption = {}): this {
		return this.addTargets('images', data, options);
	}
	
	/**
	 * Define spritesheet assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addSpritesheets(targets: Record<string, TSpritesheetLoaderTarget>, options: IManifestOption = {}): this {
		return this.addTargets('spritesheets', targets, options);
	}
	
	/**
	 * Define sound assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addSounds(targets: Record<string, TSoundLoaderTarget>, options: IManifestOption = {}) {
		return this.addTargets('sounds', targets, options);
	}
	
	/**
	 * Define json assets for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addJsons(targets: Record<string, TJsonLoaderTarget>, options: IManifestOption = {}) {
		return this.addTargets('jsons', targets, options);
	}
	
	/**
	 * Define valriables for instance.
	 * 
	 * @return Returns itself for the method chaining.
	 */
	addVars(data: Record<string, any>) {
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
	buildAsync(): Promise<Container> {
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
	
	private _loadAssetAsync(manifests: IContentManifests): Promise<void> {
		const loaderCount = Object.keys(manifests).length;
		
		if (loaderCount === 0) {
			return Promise.resolve();
		}
		
		const options = this._piximData.options;
		
		const basepath = (() => {
			if (typeof(options.basepath) === 'undefined') {
				const basepath: IContentAssetBasepath = {};
				for (let i in manifests) {
					basepath[i] = '';
				}
				
				return basepath;
			}
			
			if (typeof(options.basepath) === 'string') {
				const basepath: IContentAssetBasepath = {};
				for (let i in manifests) {
					basepath[i] = options.basepath.replace(/(.+[^\/])$/, '$1/');
				}
				
				return basepath;
			}
			
			const basepath: IContentAssetBasepath = {};
			for (let i in manifests) {
				basepath[i] = (options.basepath[i] || '').replace(/(.+[^\/])$/, '$1/');
			}
			
			return basepath;
		})();
		
		const version = (() => {
			if (typeof(options.version) === 'undefined') {
				const version: IContentAssetVersion = {};
				for (let i in manifests) {
					version[i] = '';
				}
				
				return version;
			}
			
			if (typeof(options.version) === 'string' || typeof(options.version) === 'number') {
				const version: IContentAssetVersion = {};
				for (let i in manifests) {
					version[i] = options.version;
				}
				
				return version;
			}
			
			const version: IContentAssetVersion = {};
			for (let i in manifests) {
				version[i] = options.version[i] || '';
			}
			
			return version;
		})();
		
		const xhr = (() => {
			const xhr: IContentAssetXhrOption = {};
			for (let i in manifests) {
				xhr[i] = options.xhr || false;
			}
			
			return xhr;
		})();
		
		const typeOptions = (() => {
			if (typeof(options.typeOptions) === 'undefined') {
				const typeOptions: IContentAssetLoaderOption = {};
				for (let i in manifests) {
					typeOptions[i] = {}
				}
				
				return typeOptions;
			}
			
			const typeOptions: IContentAssetLoaderOption = {};
			for (let i in manifests) {
				typeOptions[i] = options.typeOptions[i] || {};
			}
			
			return typeOptions;
		})();
		
		const loaderOptions: { [ manifestKey: string ]: IManifestLoaderOption } = {};
		for (let i in manifests) {
			loaderOptions[i] = {
				basepath: basepath[i],
				version: version[i],
				xhr: xhr[i],
				typeOptions: typeOptions[i]
			};
		}
		
		const resources: IContentResourceDictionary = this._piximData.$.resources;
		
		const promises: Promise<Record<string, any>>[] = [];
		const keys: string[] = [];
		for (let i in manifests) {
			keys.push(i);
			
			const manifest = manifests[i];
			
			promises.push(manifest.getAsync(loaderOptions[i]));
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