/*!
 * @tawaship/pixim.js - v1.12.1
 * 
 * @require pixi.js v^5.3.2
 * @require howler.js v^2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

import { Container as Container$1, Application as Application$1, utils, Loader, Texture, BaseTexture } from 'pixi.js';
import { Emitter as Emitter$1 } from '@tawaship/emitter';
import { Howl } from 'howler';

/**
 * [[https://tawaship.github.io/Emitter/index.html | @tawaship/emitter]]
 */
class Emitter extends Emitter$1 {
}

/*!
 * @tawaship/task - v1.1.0
 * 
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

class Task {
    constructor(callbacks, context) {
        this._taskData = {
            context: context == null ? this : context,
            enabled: true,
            index: -1,
            callbacks: [],
            value: null
        };
        this.add(callbacks);
    }
    /**
     * Whether the task works.
     */
    get enabled() {
        return this._taskData.enabled;
    }
    set enabled(enabled) {
        this._taskData.enabled = enabled;
    }
    /**
     * Add the task to the end of the list.
     */
    add(callbacks) {
        if (!Array.isArray(callbacks)) {
            callbacks = [callbacks];
        }
        const list = this._taskData.callbacks;
        const flag = list.length === 0;
        for (let i = 0; i < callbacks.length; i++) {
            if (!(callbacks[i] instanceof Function)) {
                continue;
            }
            list.push(callbacks[i]);
        }
        return this;
    }
    /**
     * Execute the current task.
     */
    done(...args) {
        if (!this._taskData.enabled) {
            return;
        }
        const task = this._taskData.callbacks[this._taskData.index];
        if (!task) {
            return;
        }
        return this._taskData.value = task.apply(this._taskData.context, args);
    }
    _to(index) {
        this._taskData.index = Number(index);
        return this;
    }
    /**
     * Change the current task to the first task.
     */
    first() {
        return this._to(0);
    }
    /**
     * Change the current task to the previos task.
     */
    prev() {
        return this._to(this._taskData.index - 1);
    }
    /**
     * Change the current task to the next task.
     */
    next() {
        return this._to(this._taskData.index + 1);
    }
    /**
     * Change the current task to the specified task.
     */
    to(index) {
        return this._to(index);
    }
    /**
     * Skips all tasks and changes to the finished state.
     */
    finish() {
        this._taskData.index = -1;
        return this;
    }
    /**
     * Cancel all task and leave them unregistered.
     */
    reset() {
        this._taskData.callbacks = [];
        this._taskData.index = -1;
        this._taskData.value = null;
        return this;
    }
    /**
     * Destroy instance.
     */
    destroy() {
        this.reset();
    }
    /**
     * The value returned by the last task executed.
     */
    get value() {
        return this._taskData.value;
    }
}

/**
 * [[https://tawaship.github.io/Task/index.html | @tawaship/task]]
 */
class Task$1 extends Task {
    constructor(tasks, context) {
        super(tasks, context);
        this.enabled = true;
        this._piximData = {
            emitter: new Emitter()
        };
    }
    /**
     * @deprecated 1.7.0
     */
    on(type, callback) {
        this._piximData.emitter.on(type, callback);
        return this;
    }
    /**
     * @deprecated 1.7.0
     */
    once(type, callback) {
        this._piximData.emitter.once(type, callback);
        return this;
    }
    /**
     * @deprecated 1.7.0
     */
    off(type, callback) {
        this._piximData.emitter.off(type, callback);
        return this;
    }
    /**
     * @deprecated 1.7.0
     */
    emit(type, ...args) {
        if (!this._taskData.enabled) {
            return this;
        }
        this._piximData.emitter.emit(type, ...args);
        return this;
    }
    /**
     * @deprecated 1.7.0
     */
    cemit(type, context, ...args) {
        if (!this._taskData.enabled) {
            return this;
        }
        this._piximData.emitter.cemit(type, context, ...args);
        return this;
    }
    /**
     * @deprecated 1.9.0
     */
    emitAll(...args) {
        if (!this._taskData.enabled) {
            return this;
        }
        this._piximData.emitter.emitAll(...args);
        return this;
    }
    /**
     * @deprecated 1.9.0
     */
    cemitAll(context, ...args) {
        if (!this._taskData.enabled) {
            return this;
        }
        this._piximData.emitter.cemitAll(context, ...args);
        return this;
    }
    /**
     * @deprecated 1.7.0
     */
    clear(type = '') {
        this._piximData.emitter.clear(type);
        return this;
    }
    destroy() {
        super.destroy();
        this.clear();
    }
}

/**
 * [[http://pixijs.download/release/docs/PIXI.Container.html]]
 */
class Container extends Container$1 {
    constructor(...args) {
        super();
        this._piximData = {
            task: new Task$1([], this),
            taskEnabledChildren: true
        };
        this._piximData.task.first();
        /*
        this.on('added', () => {
            TaskManager.addObserver(_observerID, this);
        });
        
        this.on('removed', () => {
            TaskManager.removeObserver(_observerID);
        });
        */
    }
    updateTask(e) {
        const task = this._piximData.task;
        if (!this._piximData.task.enabled) {
            return;
        }
        /*
        let p: PIXI.DisplayObject = this;
        let f = true;
        
        while (p) {
            if (p instanceof Container && !p.taskEnabledChildren) {
                f = false;
                break;
            }
            
            p = p.parent;
        }
        
        if (!f) {
            return;
        }
        */
        task.done(e);
        // will be deprecated
        task.cemitAll(this, e);
    }
    /**
     * Whether the task works.
     */
    get taskEnabled() {
        return this._piximData.task.enabled;
    }
    set taskEnabled(enabled) {
        this._piximData.task.enabled = enabled;
    }
    /**
     * Whether the children and subsequent tasks work.
     */
    get taskEnabledChildren() {
        return this._piximData.taskEnabledChildren;
    }
    set taskEnabledChildren(enabled) {
        this._piximData.taskEnabledChildren = enabled;
    }
    /**
     * Task object that works only while it is being displayed.
     */
    get task() {
        return this._piximData.task;
    }
    /**
     * Destroy instance.
     *
     * @override
     */
    destroy(...args) {
        super.destroy(...args);
        this._piximData.task.destroy();
    }
}

class Layer extends Container$1 {
}
/**
 * @ignore
 */
function taskHandler(obj, e) {
    if (obj instanceof Container) {
        obj.updateTask(e);
        if (!obj.taskEnabledChildren) {
            return;
        }
    }
    const children = [];
    for (let i = 0; i < obj.children.length; i++) {
        children.push(obj.children[i]);
    }
    for (let i = 0; i < children.length; i++) {
        const child = children[i];
        if (child instanceof Container$1) {
            taskHandler(child, e);
        }
    }
}
class Application extends Emitter {
    /**
     * @param pixiOptions Optional data when call 'new [[[[http://pixijs.download/v5.2.1/docs/PIXI.Application.html | PIXI.Application]]]]'.
     * @param piximOptions Optional data for Pixim.
     */
    constructor(pixiOptions = {}, piximOptions = {}) {
        super();
        const app = new Application$1(pixiOptions);
        app.stop();
        app.view.style.position = 'absolute';
        const autoAdjust = piximOptions.autoAdjust || false;
        this._piximData = {
            isRun: false,
            app,
            container: piximOptions.container || document.body,
            layers: {},
            autoAdjuster: null,
            roots: {},
            contents: {}
        };
        const ticker = this._piximData.app.ticker;
        ticker.add((delta) => {
            //TaskManager.done({ delta });
            taskHandler(this._piximData.app.stage, { delta });
        });
        if (autoAdjust) {
            if (autoAdjust === true) {
                this.autoAdjuster = () => {
                    this.fullScreen();
                };
            }
            else {
                this.autoAdjuster = () => {
                    autoAdjust(this);
                };
            }
        }
    }
    get app() {
        return this._piximData.app;
    }
    get stage() {
        return this._piximData.app.stage;
    }
    get view() {
        return this._piximData.app.view;
    }
    get container() {
        return this._piximData.container;
    }
    set container(container) {
        this._piximData.container = container || document.body;
        if (this._piximData.app.view.parentNode) {
            this._piximData.container.appendChild(this._piximData.app.view);
        }
    }
    /**
     * Whether application has layer.
     */
    _hasLayer(name) {
        return !!this._piximData.layers[name];
    }
    /**
     * Add layer to application.
     */
    addLayer(name) {
        if (this._hasLayer(name)) {
            return this;
        }
        this._piximData.layers[name] = this._piximData.app.stage.addChild(new Layer());
        return this;
    }
    /**
     * Remove layer form application.
     */
    removeLayer(name) {
        if (!this._hasLayer(name)) {
            return this;
        }
        this._piximData.app.stage.removeChild(this._piximData.layers[name]);
        delete (this._piximData.layers[name]);
        return this;
    }
    /**
     * Attach content to application.
     */
    attachAsync(content, layerName = 'anonymous') {
        return content.buildAsync()
            .then((root) => {
            this.detach(content);
            this.addLayer(layerName);
            this._piximData.roots[content.contentID] = root;
            this._piximData.contents[content.contentID] = content;
            this._piximData.layers[layerName].addChild(root);
            return root;
        });
    }
    /**
     * Detach content from application.
     */
    detach(content, stageOptions = { children: true }) {
        const root = this._piximData.roots[content.contentID];
        if (!root) {
            return this;
        }
        this._destroyRoot(root, stageOptions);
        delete (this._piximData.roots[content.contentID]);
        delete (this._piximData.contents[content.contentID]);
        return this;
    }
    /**
     * Start application and displa viewy.
     */
    play() {
        this._piximData.container.appendChild(this._piximData.app.view);
        return this.start();
    }
    /**
     * Start application.
     */
    start() {
        this._piximData.app.start();
        return this;
    }
    /**
     * Stop application.
     */
    stop() {
        this._piximData.app.stop();
        return this;
    }
    /**
     * Pause (or restart) application.
     */
    pause(paused) {
        if (paused) {
            this.stop();
        }
        else {
            this.start();
        }
        return this;
    }
    get autoAdjuster() {
        return this._piximData.autoAdjuster;
    }
    set autoAdjuster(autoAdjuster) {
        if (this._piximData.autoAdjuster) {
            window.removeEventListener('resize', this._piximData.autoAdjuster);
        }
        if (!autoAdjuster) {
            this._piximData.autoAdjuster = null;
            return;
        }
        this._piximData.autoAdjuster = autoAdjuster;
        window.addEventListener('resize', autoAdjuster);
        autoAdjuster();
    }
    /**
     * Pre process to destroy application.
     */
    preDestroy() {
        for (let i in this._piximData.contents) {
            this._piximData.contents[i].destroy();
        }
        this.autoAdjuster = null;
        this._piximData.layers = {};
        this._piximData.roots = {};
        this._piximData.contents = {};
    }
    /**
     * Destroy application.
     */
    destroy(removeView, stageOptions) {
        this.preDestroy();
        this._piximData.app.destroy(removeView, stageOptions);
        return this;
    }
    _destroyRoot(root, stageOptions) {
        root.destroy(stageOptions);
    }
    /**
     * Resize canvas to fit specified rectangle.
     *
     * @param rect Rectangle to adjust.
     */
    fullScreen(rect) {
        const view = this._piximData.app.view;
        const r = rect || {
            x: 0,
            y: 0,
            width: this._piximData.container.offsetWidth || window.innerWidth,
            height: this._piximData.container.offsetHeight || window.innerHeight
        };
        if (r.width / r.height > view.width / view.height) {
            return this.adjustHeight(r.height).toCenter(r).toTop(r);
        }
        return this.adjustWidth(r.width).toMiddle(r).toLeft(r);
    }
    /**
     * Resize canvas to fit specified width.
     *
     * @param width Width to adjust.
     */
    adjustWidth(width) {
        const view = this._piximData.app.view;
        const w = width || this._piximData.container.offsetWidth || window.innerWidth;
        const h = w / view.width * view.height;
        //const frame = this._piximData.frame;
        view.style.width = `${w}px`;
        view.style.height = `${h}px`;
        return this;
    }
    /**
     * Resize canvas to fit specified height.
     *
     * @param height Height to adjust.
     */
    adjustHeight(height) {
        const view = this._piximData.app.view;
        const h = height || this._piximData.container.offsetHeight || window.innerHeight;
        const w = h / view.height * view.width;
        //const frame = this._piximData.frame;
        view.style.height = `${h}px`;
        view.style.width = `${w}px`;
        return this;
    }
    /**
     * Left justified with respect to the reference data.
     *
     * @param horizontal Horizontal data used to calculate the position.
     */
    toLeft(horizontal) {
        const view = this._piximData.app.view;
        const hol = horizontal || {
            x: 0,
            width: this._piximData.container.offsetWidth || window.innerWidth
        };
        view.style.left = `${hol.x}px`;
        return this;
    }
    /**
     * Center justified with respect to the reference data.
     *
     * @param horizontal Horizontal data used to calculate the position.
     */
    toCenter(horizontal) {
        const view = this._piximData.app.view;
        const hol = horizontal || {
            x: 0,
            width: this._piximData.container.offsetWidth || window.innerWidth
        };
        view.style.left = `${(hol.width - this._getViewRect().width) / 2 + hol.x}px`;
        return this;
    }
    /**
     * Right justified with respect to the reference data.
     *
     * @param horizontal Horizontal data used to calculate the position.
     */
    toRight(horizontal) {
        const view = this._piximData.app.view;
        const hol = horizontal || {
            x: 0,
            width: this._piximData.container.offsetWidth || window.innerWidth
        };
        view.style.left = `${hol.width - this._getViewRect().width + hol.x}px`;
        return this;
    }
    /**
     * Top justified with respect to the reference data.
     *
     * @param vertical Vertical data used to calculate the position.
     */
    toTop(vertical) {
        const view = this._piximData.app.view;
        const ver = vertical || {
            y: 0,
            height: this._piximData.container.offsetHeight || window.innerHeight
        };
        view.style.top = `${ver.y}px`;
        return this;
    }
    /**
     * Middle justified with respect to the reference data.
     *
     * @param vertical Vertical data used to calculate the position.
     */
    toMiddle(vertical) {
        const view = this._piximData.app.view;
        const ver = vertical || {
            y: 0,
            height: this._piximData.container.offsetHeight || window.innerHeight
        };
        view.style.top = `${(ver.height - this._getViewRect().height) / 2 + ver.y}px`;
        return this;
    }
    /**
     * Bottom justified with respect to the reference data.
     *
     * @param vertical Vertical data used to calculate the position.
     */
    toBottom(vertical) {
        const view = this._piximData.app.view;
        const ver = vertical || {
            y: 0,
            height: this._piximData.container.offsetHeight || window.innerHeight
        };
        view.style.top = `${ver.height - this._getViewRect().height + ver.y}px`;
        return this;
    }
    _getViewRect() {
        const view = this._piximData.app.view;
        return {
            x: parseInt(view.style.left.replace('px', '')),
            y: parseInt(view.style.top.replace('px', '')),
            width: parseInt(view.style.width.replace('px', '')),
            height: parseInt(view.style.height.replace('px', ''))
        };
    }
}

/**
 * @ignore
 */
// const _cache: IResourceDictionary = {};
class ContentManifestBase {
    constructor() {
        this._manifests = {};
    }
    /**
     * Register manifests.
     *
     * @param manifests Defined manifests.
     * @param option Manifest option data.
     */
    add(manifests, options = {}) {
        const unrequired = options.unrequired || false;
        for (let i in manifests) {
            this._manifests[i] = {
                data: manifests[i],
                unrequired
            };
        }
    }
    /**
     * Get resources.
     *
     * @param basepath Basement directory path of assets.
     */
    getAsync(basepath, version, useCache) {
        const resources = {};
        if (Object.keys(this._manifests).length === 0) {
            return Promise.resolve(resources);
        }
        return this._loadAsync(basepath, version, useCache)
            .then((res) => {
            for (let i in res) {
                resources[i] = res[i].resource;
            }
            return resources;
        });
    }
    /**
     * Normalize asset path.
     */
    _resolvePath(path, basepath) {
        if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
            return path;
        }
        else {
            return utils.url.resolve(basepath, path);
        }
    }
    /**
     * Normalize uri query.
     */
    _resolveQuery(uri, queries) {
        if (uri.indexOf('data:') === 0) {
            return uri;
        }
        else {
            const q = [];
            for (let i in queries) {
                q.push(`${i}=${queries[i]}`);
            }
            return `${uri}${uri.match(/\?/) ? '&' : '?'}${q.join('&')}`;
        }
    }
}

class ContentImageManifest extends ContentManifestBase {
    /**
     * Load image resources.
     *
     * @override
     */
    _loadAsync(basepath, version, useCache) {
        const manifests = this._manifests;
        const loader = new Loader();
        /*
        if (version) {
            loader.defaultQueryString = `_fv=${version}`;
        }
        */
        for (let i in manifests) {
            const manifest = manifests[i];
            const preUrl = this._resolvePath(manifest.data, basepath);
            const url = version
                ? this._resolveQuery(preUrl, { _fv: version })
                : preUrl;
            loader.add(i, url, {
                crossOrigin: true
            });
        }
        if (!useCache) {
            loader.use((resource, next) => {
                if (resource.texture) {
                    Texture.removeFromCache(resource.texture);
                    if (resource.texture.baseTexture) {
                        BaseTexture.removeFromCache(resource.texture.baseTexture);
                    }
                }
                next();
            });
        }
        return new Promise((resolve, reject) => {
            const res = {};
            loader.load((loader, resources) => {
                for (let i in resources) {
                    const resource = resources[i];
                    if (!resource) {
                        reject(`Image: '${i}' cannot load.`);
                        return;
                    }
                    if (resource.error && !manifests[i].unrequired) {
                        reject(`Image: '${i}' cannot load.`);
                        return;
                    }
                    res[i] = {
                        resource: resource.texture,
                        error: !!resource.error
                    };
                }
                resolve(res);
            });
        });
    }
    /**
     * Destroy resources.
     *
     * @override
     */
    destroyResources(resources) {
    }
}

class ContentSpritesheetManifest extends ContentManifestBase {
    /**
     * Load image resources.
     *
     * @override
     */
    _loadAsync(basepath, version, useCache) {
        const manifests = this._manifests;
        const loader = new Loader();
        /*
        if (version) {
            loader.defaultQueryString = `_fv=${version}`;
        }
        */
        for (let i in manifests) {
            const manifest = manifests[i];
            const preUrl = this._resolvePath(manifest.data, basepath);
            const url = version
                ? this._resolveQuery(preUrl, { _fv: version })
                : preUrl;
            loader.add(i, url, {
                crossOrigin: true
            });
        }
        if (!useCache) {
            loader.use((resource, next) => {
                if (resource.textures) {
                    for (let i in resource.textures) {
                        const texture = resource.textures[i];
                        if (!texture) {
                            continue;
                        }
                        Texture.removeFromCache(texture);
                        if (texture.baseTexture) {
                            BaseTexture.removeFromCache(texture.baseTexture);
                        }
                    }
                }
                if (resource.texture) {
                    Texture.removeFromCache(resource.texture);
                    if (resource.texture.baseTexture) {
                        BaseTexture.removeFromCache(resource.texture.baseTexture);
                    }
                }
                next();
            });
        }
        return new Promise((resolve, reject) => {
            const res = {};
            loader.load((loader, resources) => {
                for (let i in resources) {
                    if (!manifests[i]) {
                        continue;
                    }
                    const resource = resources[i];
                    if (!resource) {
                        reject(`Spritesheet: '${i}' cannot load.`);
                        return;
                    }
                    const textures = resource.textures || {};
                    const error = !!resource.error;
                    if (resource.error && !manifests[i].unrequired) {
                        reject(`Spritesheet: '${i}' cannot load.`);
                        return;
                    }
                    res[i] = {
                        resource: textures,
                        error: !!resource.error
                    };
                }
                resolve(res);
            });
        });
    }
    /**
     * Destroy resources.
     *
     * @override
     */
    destroyResources(resources) {
    }
}

class ContentSoundManifest extends ContentManifestBase {
    /**
     * Load image resources.
     *
     * @override
     */
    _loadAsync(basepath, version, useCache) {
        const manifests = this._manifests;
        if (!Howl) {
            return Promise.reject('You need "howler.js" to load sound asset.');
        }
        return new Promise((resolve, reject) => {
            const res = {};
            function loadedHandler(key, howl, error) {
                res[key] = {
                    resource: howl,
                    error
                };
                if (++loadedCount < loadCount) {
                    return;
                }
                resolve(res);
            }
            let loadCount = 0;
            let loadedCount = 0;
            for (let i in manifests) {
                ++loadCount;
            }
            for (let i in manifests) {
                const _i = i;
                const manifest = manifests[_i];
                const preUrl = this._resolvePath(manifest.data, basepath);
                const url = version
                    ? this._resolveQuery(preUrl, { _fv: version })
                    : preUrl;
                const howl = new Howl({
                    src: url,
                    onload: () => {
                        loadedHandler(_i, howl, false);
                    },
                    onloaderror: () => {
                        if (!manifest.unrequired) {
                            reject(`Sound: '${_i}' cannot load.`);
                            return;
                        }
                        loadedHandler(_i, howl, true);
                    }
                });
            }
        });
    }
    /**
     * Destroy resources.
     *
     * @override
     */
    destroyResources(resources) {
        for (let i in resources) {
            resources[i].stop();
            resources[i].unload();
        }
    }
}

class ContentDeliver {
    constructor(data) {
        this._piximData = {
            width: data.width,
            height: data.height,
            lib: data.lib,
            resources: data.resources,
            vars: data.vars
        };
    }
    /**
     * Content width.
     */
    get width() {
        return this._piximData.width;
    }
    /**
     * Content height.
     */
    get height() {
        return this._piximData.height;
    }
    /**
     * Defined classes in content.
     */
    get lib() {
        return this._piximData.lib;
    }
    /**
     * Loaded resources.
     */
    get resources() {
        return this._piximData.resources;
    }
    /**
     * Defined variables by framework.
     */
    get vars() {
        return this._piximData.vars;
    }
}

/**
 * @ignore
 */
const _contents = {};
/**
 * @ignore
 */
let _contentID = 0;
/**
 * @ignore
 */
function createManifests() {
    const res = {};
    for (let i in _manifests) {
        res[i] = new _manifests[i]();
    }
    return res;
}
/**
 * @ignore
 */
function createContentStatic() {
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
const _manifests = {};
class Content {
    constructor(options = {}, piximData = Content._piximData) {
        const basepath = (options.basepath || '').replace(/([^/])$/, '$1/');
        if (typeof (options.version) !== 'object') {
            const version = {};
            const v = options.version || '';
            for (let i in _manifests) {
                version[i] = v;
            }
            options.version = version;
        }
        if (typeof (options.useCache) !== 'object') {
            const useCache = {};
            const v = options.useCache || false;
            for (let i in _manifests) {
                useCache[i] = v;
            }
            options.useCache = useCache;
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
            basepath,
            version: options.version,
            useCache: options.useCache || false,
            $: new ContentDeliver(contentDeliverData),
            manifests: piximData.manifests,
            additionalManifests: createManifests(),
            preloadPromise: null,
            postloadPromise: null,
            contentDeliverData
        };
    }
    /**
     * Register manifest class.
     */
    static registerManifest(key, Manifest) {
        _manifests[key] = Manifest;
    }
    /**
     * Create a cloned content class.
     *
     * @param key Content name.
     * @return Cloned content class.
     */
    static create(key = '') {
        if (key && key in _contents) {
            throw new Error(`Content key '${key}' has already exists.`);
        }
        class ContentClone extends Content {
            constructor(options = {}) {
                super(options, ContentClone._piximData);
            }
        }
        ContentClone._piximData = createContentStatic();
        if (!key) {
            return ContentClone;
        }
        return _contents[key] = ContentClone;
    }
    /**
     * Get cloned content.
     */
    static get(key) {
        return _contents[key];
    }
    /**
     * Remove cloned content.
     *
     * @function Pixim.Content.removeContent
     * @param key {string}
     */
    static remove(key) {
        delete (_contents[key]);
    }
    /**
     * Define assets for class.
     */
    static defineManifests(key, data, options = {}) {
        if (!this._piximData.manifests[key]) {
            console.warn(`Manifest '${key}' is not registered.`);
            return this;
        }
        this._piximData.manifests[key].add(data, options);
        return this;
    }
    /**
     * Define image assets for class.
     */
    static defineImages(data, options = {}) {
        return this.defineManifests('images', data, options);
    }
    /**
     * Define spritesheet assets for class.
     */
    static defineSpritesheets(data, options = {}) {
        return this.defineManifests('spritesheets', data, options);
    }
    /**
     * Define sound assets for class.
     */
    static defineSounds(data, options = {}) {
        return this.defineManifests('sounds', data, options);
    }
    /**
     * Set the content settings.
     *
     * @param data Config data.
     */
    static setConfig(data) {
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
    static defineLibraries(data) {
        for (let i in data) {
            this._piximData.lib[i] = data[i];
        }
        return this;
    }
    /**
     * ID of this content.
     */
    get contentID() {
        return this._piximData.contentID;
    }
    /**
     * Define assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addManifests(key, data, options = {}) {
        if (!this._piximData.additionalManifests[key]) {
            console.warn(`Manifest '${key}' is not registered.`);
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
    addImages(data, options = {}) {
        return this.addManifests('images', data, options);
    }
    /**
     * Define spritesheet assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addSpritesheets(data, options = {}) {
        return this.addManifests('spritesheets', data, options);
    }
    /**
     * Define sound assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addSounds(data, options = {}) {
        return this.addManifests('sounds', data, options);
    }
    /**
     * Define valriables for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addVars(data) {
        for (let i in data) {
            this._piximData.$.vars[i] = data[i];
        }
        return this;
    }
    /**
     * Prepare content.
     */
    prepareAsync() {
        return this.preloadClassAssetAsync()
            .then(() => {
            return this.preloadInstanceAssetAsync();
        });
    }
    /**
     * Build content.
     */
    buildAsync() {
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
    preloadClassAssetAsync() {
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
    preloadInstanceAssetAsync() {
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
    destroy() {
        const contentDeliverData = this._piximData.contentDeliverData;
        contentDeliverData.lib = {};
        contentDeliverData.vars = {};
        const resources = contentDeliverData.resources;
        const manifests = this._piximData.manifests;
        for (let i in resources) {
            if (i in manifests) {
                manifests[i].destroyResources(resources[i]);
            }
            resources[i] = {};
        }
    }
    _loadAssetAsync(manifests) {
        const basepath = this._piximData.basepath;
        const version = this._piximData.version;
        const useCache = this._piximData.useCache;
        const resources = this._piximData.$.resources;
        const loaderCount = Object.keys(manifests).length;
        if (loaderCount === 0) {
            return Promise.resolve();
        }
        const promises = [];
        const keys = [];
        for (let i in manifests) {
            const type = i;
            keys.push(type);
            promises.push(manifests[type].getAsync(basepath, version[type] || '', useCache[type] || false));
        }
        return Promise.all(promises)
            .then(resolver => {
            for (let i = 0; i < resolver.length; i++) {
                resources[keys[i]] = resources[keys[i]] || {};
                for (let j in resolver[i]) {
                    resources[keys[i]][j] = resolver[i][j];
                }
            }
        });
    }
}
Content.registerManifest('images', ContentImageManifest);
Content.registerManifest('spritesheets', ContentSpritesheetManifest);
Content.registerManifest('sounds', ContentSoundManifest);

export { Application, Container, Content, ContentDeliver, ContentImageManifest, ContentManifestBase, ContentSoundManifest, ContentSpritesheetManifest, Emitter, Layer, Task$1 as Task };
//# sourceMappingURL=Pixim.esm.js.map
