/*!
 * @tawaship/pixim.js - v1.13.3
 * 
 * @require pixi.js v^5.3.2
 * @require howler.js v^2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var PIXI = require('pixi.js');
var emitter = require('@tawaship/emitter');
var howler = require('howler');

/**
 * [[https://tawaship.github.io/Emitter/index.html | @tawaship/emitter]]
 */
class Emitter extends emitter.Emitter {
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
class Container extends PIXI.Container {
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

class Layer extends PIXI.Container {
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
        if (child instanceof PIXI.Container) {
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
        const app = new PIXI.Application(pixiOptions);
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

function resolvePath(path, basepath) {
    if (path.indexOf('http://') === 0 || path.indexOf('https://') === 0) {
        return path;
    }
    else {
        return PIXI.utils.url.resolve(basepath.replace(/([^\/])$/, '$1/'), path);
    }
}
function resolveQuery(uri, queries) {
    if (uri.indexOf('data:') === 0) {
        return uri;
    }
    else {
        const q = [];
        const t = uri.split('?');
        if (t[1]) {
            const search = t[1].split('&');
            for (let i = 0; i < search.length; i++) {
                const p = search[i].split('=');
                if (!(p[0] in queries)) {
                    q.push(search[i]);
                }
            }
        }
        for (let i in queries) {
            q.push(`${i}=${queries[i]}`);
        }
        return `${t[0]}?${q.join('&')}`;
    }
}

var index = /*#__PURE__*/Object.freeze({
    __proto__: null,
    resolvePath: resolvePath,
    resolveQuery: resolveQuery
});

const EVENT_LOADER_ASSET_LOADED = 'loaderAssetLoaded';
class LoaderResource {
    constructor(data, error) {
        this._data = data;
        this._error = error;
    }
    get data() {
        return this._data;
    }
    get error() {
        return this._error;
    }
}
class LoaderBase extends emitter.Emitter {
    constructor(options = {}) {
        super();
        this._options = options;
    }
    _resolveBasepath(basepath) {
        return typeof basepath === 'string' ? basepath : (this._options.basepath || '');
    }
    _resolveVersion(version) {
        return (typeof version === 'string' || typeof version === 'number') ? version : (this._options.version || '');
    }
    _resolveUseCache(useCache) {
        return typeof useCache === 'boolean' ? useCache : (this._options.useCache || false);
    }
    _resolveUrl(url, options = {}) {
        const preUri = resolvePath(url, this._resolveBasepath(options.basepath));
        const version = this._resolveVersion(options.version);
        const uri = version
            ? resolveQuery(preUri, { _fv: version })
            : preUri;
        return uri;
    }
    /**
     * Fired when one of the resources has succeeded loading.
     *
     * @event
     */
    loaderAssetLoaded(data) { }
}
delete (LoaderBase.prototype[EVENT_LOADER_ASSET_LOADED]);

class ManifestBase extends emitter.Emitter {
    constructor() {
        super(...arguments);
        this._data = {};
        this._resources = {};
    }
    /**
     * Register targetss.
     */
    add(targets, options = {}) {
        const unrequired = options.unrequired || false;
        for (let i in targets) {
            this._data[i] = {
                target: targets[i],
                unrequired
            };
        }
    }
    get count() {
        return Object.keys(this._data).length;
    }
    /**
     * Get resources.
     */
    getAsync(options) {
        if (Object.keys(this._data).length === 0) {
            return Promise.resolve({});
        }
        const res = {};
        const targets = {};
        for (let i in this._data) {
            targets[i] = this._data[i].target;
        }
        return this._loadAsync(targets, options)
            .then(resources => {
            for (let i in resources) {
                const resource = resources[i];
                if (resource.error && !this._data[i].unrequired) {
                    throw resource.error;
                }
            }
            for (let i in resources) {
                const resource = resources[i];
                this._resources[i] = resource;
                res[i] = resource.data;
            }
            return res;
        });
    }
    /**
     * @fires [[LoaderBase.EVENT_LOADER_ASSET_LOADED]]
     */
    _doneLoaderAsync(loader, targets) {
        loader.on(EVENT_LOADER_ASSET_LOADED, (resource) => {
            this.emit(EVENT_LOADER_ASSET_LOADED, resource);
        });
        return loader.loadAllAsync(targets, {});
    }
    destroyResources() {
        for (let i in this._resources) {
            this._resources[i].destroy();
        }
    }
}

class TextureLoaderResource extends LoaderResource {
    destroy() {
        TextureLoaderResource.removeCache(this._data);
        this._data.destroy(true);
    }
    static removeCache(texture) {
        PIXI.Texture.removeFromCache(texture);
        if (texture.baseTexture) {
            PIXI.BaseTexture.removeFromCache(texture.baseTexture);
        }
    }
}
class TextureLoader extends LoaderBase {
    loadAsync(target, options = {}) {
        return (() => {
            if (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) {
                return this._loadFromElementAsync(target, options);
            }
            else if (target.indexOf('data:') === 0) {
                return this._loadFromDataUriAsync(target, options);
            }
            else {
                return this._loadFromUrlAsync(target, options);
            }
        })()
            .then((resource) => {
            if (!resource.error) {
                this.emit(EVENT_LOADER_ASSET_LOADED, { target, resource });
            }
            return resource;
        });
    }
    loadAllAsync(targets, options = {}) {
        if (Object.keys(targets).length === 0) {
            return Promise.resolve({});
        }
        const promises = [];
        const res = {};
        for (let i in targets) {
            promises.push(this.loadAsync(targets[i], options)
                .then(resource => {
                res[i] = resource;
            }));
        }
        return Promise.all(promises)
            .then(() => {
            return res;
        });
    }
    _loadFromUrlAsync(url, options = {}) {
        return this._loadAsync(this._resolveUrl(url, options), options);
    }
    _loadFromElementAsync(element, options = {}) {
        element.crossOrigin = 'anonymous';
        element.src = this._resolveUrl(element.src, options);
        return this._loadAsync(element);
    }
    _loadFromDataUriAsync(dataUri, options = {}) {
        return this._loadAsync(dataUri, options);
    }
    _loadAsync(target, options = {}) {
        const useCache = this._resolveUseCache(options.useCache);
        return new Promise(resolve => {
            const bt = PIXI.BaseTexture.from(target);
            if (bt.valid) {
                if (!useCache) {
                    PIXI.BaseTexture.removeFromCache(bt);
                }
                resolve(new TextureLoaderResource(new PIXI.Texture(bt), null));
                return;
            }
            bt.on('loaded', (baseTexture) => {
                if (!useCache) {
                    PIXI.BaseTexture.removeFromCache(baseTexture);
                }
                resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), null));
            });
            bt.on('error', (baseTexture, e) => {
                PIXI.BaseTexture.removeFromCache(baseTexture);
                resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), e));
            });
        });
    }
}

class TextureManifest extends ManifestBase {
    _loadAsync(targets, options = {}) {
        const loader = new TextureLoader(options);
        return this._doneLoaderAsync(loader, targets);
    }
}

class SpritesheetLoaderResource extends LoaderResource {
    destroy() {
        for (let i in this._data) {
            TextureLoaderResource.removeCache(this._data[i]);
        }
        for (let i in this._data) {
            this._data[i].destroy(true);
        }
    }
}
/**
 * @ignore
 */
const KEY_SINGLE_SPRITESHEET = '--single-spritesheet';
class SpritesheetLoader extends LoaderBase {
    loadAsync(target, options = {}) {
        if (typeof target === 'string') {
            return this._loadFromUrlsAsync({ [KEY_SINGLE_SPRITESHEET]: target }, options)
                .then(resources => {
                return resources[KEY_SINGLE_SPRITESHEET];
            });
        }
        else {
            return this._loadFromJsonsAsync({ [KEY_SINGLE_SPRITESHEET]: target }, options)
                .then(resources => {
                return resources[KEY_SINGLE_SPRITESHEET];
            });
        }
    }
    loadAllAsync(targets, options = {}) {
        if (Object.keys(targets).length === 0) {
            return Promise.resolve({});
        }
        const urls = {};
        const jsons = {};
        for (let i in targets) {
            const target = targets[i];
            if (typeof target === 'string') {
                urls[i] = target;
            }
            else {
                jsons[i] = target;
            }
        }
        return Promise.all([
            this._loadFromUrlsAsync(urls, options),
            this._loadFromJsonsAsync(jsons, options)
        ])
            .then(resolvers => {
            return Object.assign({}, ...resolvers);
        });
    }
    _loadFromUrlsAsync(targets, options = {}) {
        const res = {};
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
            const uri = resolvePath(target, basepath);
            loader.add(i, uri, {
                crossOrigin: true
            });
        }
        const useCache = this._resolveUseCache(options.useCache);
        if (!useCache) {
            loader.use((resource, next) => {
                if (resource.textures) {
                    for (let i in resource.textures) {
                        const texture = resource.textures[i];
                        if (!texture) {
                            continue;
                        }
                        TextureLoaderResource.removeCache(texture);
                    }
                }
                if (resource.texture) {
                    TextureLoaderResource.removeCache(resource.texture);
                }
                next();
            });
        }
        return new Promise(resolve => {
            loader.use((resource, next) => {
                if (resource && resource.extension === 'json' && !resource.error && resource.textures) {
                    this.emit(EVENT_LOADER_ASSET_LOADED, { target: resource.name, resource: new SpritesheetLoaderResource(resource.textures, null) });
                }
                next();
            });
            loader.load((loader, resources) => {
                for (let i in resources) {
                    if (!targets[i]) {
                        continue;
                    }
                    const resource = resources[i];
                    if (!resource) {
                        res[i] = new SpritesheetLoaderResource({}, 'invalid json');
                        continue;
                    }
                    if (resource.error) {
                        res[i] = new SpritesheetLoaderResource({}, resource.error);
                        continue;
                    }
                    if (!resource.textures) {
                        res[i] = new SpritesheetLoaderResource({}, 'invalid texture');
                        continue;
                    }
                    res[i] = new SpritesheetLoaderResource(resource.textures, null);
                }
                resolve(res);
            });
        });
    }
    _loadFromJsonsAsync(targets, options = {}) {
        const res = {};
        if (Object.keys(targets).length === 0) {
            return Promise.resolve(res);
        }
        const useCache = this._resolveUseCache(options.useCache);
        const promises = [];
        const loader = new TextureLoader(options);
        for (let i in targets) {
            const target = targets[i];
            promises.push(loader.loadAsync(target.meta.image, options)
                .then((resource) => {
                if (resource.error) {
                    return new SpritesheetLoaderResource({}, resource.error);
                }
                const ss = new PIXI.Spritesheet(resource.data, target);
                return new Promise(resolve => {
                    ss.parse(e => {
                        const resource = new SpritesheetLoaderResource(ss.textures, null);
                        if (!useCache) {
                            for (let i in ss.textures) {
                                TextureLoaderResource.removeCache(ss.textures[i]);
                            }
                        }
                        resolve(resource);
                    });
                });
            })
                .catch(e => {
                return new SpritesheetLoaderResource({}, e);
            })
                .then((resource) => {
                if (!resource.error) {
                    this.emit(EVENT_LOADER_ASSET_LOADED, { target, resource });
                }
                res[i] = resource;
            }));
        }
        return Promise.all(promises)
            .then(() => {
            return res;
        });
    }
}

class SpritesheetManifest extends ManifestBase {
    _loadAsync(targets, options = {}) {
        const loader = new SpritesheetLoader(options);
        return this._doneLoaderAsync(loader, targets);
    }
}

class SoundLoaderResource extends LoaderResource {
    destroy() {
        this._data.stop();
        this._data.unload();
    }
}
class SoundLoader extends LoaderBase {
    loadAsync(target, options = {}) {
        const url = this._resolveUrl(target, options);
        return new Promise(resolve => {
            const howl = new howler.Howl({
                src: url,
                onload: () => {
                    resolve(new SoundLoaderResource(howl, null));
                },
                onloaderror: () => {
                    const e = new Error('invalid resource: ' + url);
                    resolve(new SoundLoaderResource(howl, e));
                }
            });
        })
            .then((resource) => {
            if (!resource.error) {
                this.emit(EVENT_LOADER_ASSET_LOADED, { target, resource });
            }
            return resource;
        });
    }
    loadAllAsync(targets, options = {}) {
        if (Object.keys(targets).length === 0) {
            return Promise.resolve({});
        }
        const promises = [];
        const res = {};
        for (let i in targets) {
            promises.push(this.loadAsync(targets[i], options)
                .then(resource => {
                res[i] = resource;
            }));
        }
        return Promise.all(promises)
            .then(() => {
            return res;
        });
    }
}

class SoundManifest extends ManifestBase {
    _loadAsync(targets, options = {}) {
        const loader = new SoundLoader(options);
        return this._doneLoaderAsync(loader, targets);
    }
}

class JsonLoaderResource extends LoaderResource {
    destroy() {
    }
}
class JsonLoader extends LoaderBase {
    loadAsync(target, options = {}) {
        const url = this._resolveUrl(target, options);
        return fetch(url)
            .then(res => res.json())
            .then(json => new JsonLoaderResource(json, null))
            .catch((e) => new JsonLoaderResource({}, e))
            .then((resource) => {
            if (!resource.error) {
                this.emit(EVENT_LOADER_ASSET_LOADED, { target, resource });
            }
            return resource;
        });
    }
    loadAllAsync(targets, options = {}) {
        if (Object.keys(targets).length === 0) {
            return Promise.resolve({});
        }
        const promises = [];
        const res = {};
        for (let i in targets) {
            promises.push(this.loadAsync(targets[i], options)
                .then(resource => {
                res[i] = resource;
            }));
        }
        return Promise.all(promises)
            .then(() => {
            return res;
        });
    }
}

class JsonManifest extends ManifestBase {
    _loadAsync(targets, options = {}) {
        const loader = new JsonLoader(options);
        return this._doneLoaderAsync(loader, targets);
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
class Content extends emitter.Emitter {
    constructor(options = {}, piximData = Content._piximData) {
        super();
        this._loadedResourceHandler = (data) => {
            this.emit(EVENT_LOADER_ASSET_LOADED, data);
        };
        const basepath = options.basepath || '';
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
    static defineTargets(key, targets, options = {}) {
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
    static defineImages(targets, options = {}) {
        return this.defineTargets('images', targets, options);
    }
    /**
     * Define spritesheet assets for class.
     */
    static defineSpritesheets(targets, options = {}) {
        return this.defineTargets('spritesheets', targets, options);
    }
    /**
     * Define sound assets for class.
     */
    static defineSounds(targets, options = {}) {
        return this.defineTargets('sounds', targets, options);
    }
    /**
     * Define json assets for class.
     */
    static defineJsons(targets, options = {}) {
        return this.defineTargets('jsons', targets, options);
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
    addTargets(key, targets, options = {}) {
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
    addImages(data, options = {}) {
        return this.addTargets('images', data, options);
    }
    /**
     * Define spritesheet assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addSpritesheets(targets, options = {}) {
        return this.addTargets('spritesheets', targets, options);
    }
    /**
     * Define sound assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addSounds(targets, options = {}) {
        return this.addTargets('sounds', targets, options);
    }
    /**
     * Define json assets for instance.
     *
     * @return Returns itself for the method chaining.
     */
    addJsons(targets, options = {}) {
        return this.addTargets('jsons', targets, options);
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
            manifests[i].destroyResources();
            manifests[i].off(EVENT_LOADER_ASSET_LOADED, this._loadedResourceHandler);
        }
        for (let i in additionalManifests) {
            additionalManifests[i].destroyResources();
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
    _loadAssetAsync(manifests) {
        const basepath = this._piximData.basepath;
        const versions = this._piximData.version;
        const useCaches = this._piximData.useCache;
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
            const version = versions[type] || '';
            const useCache = useCaches[type] || false;
            const manifest = manifests[type];
            promises.push(manifest.getAsync({ basepath, version, useCache }));
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
Content.registerManifest('images', TextureManifest);
Content.registerManifest('spritesheets', SpritesheetManifest);
Content.registerManifest('sounds', SoundManifest);
Content.registerManifest('jsons', JsonManifest);

exports.Application = Application;
exports.Container = Container;
exports.Content = Content;
exports.ContentDeliver = ContentDeliver;
exports.EVENT_LOADER_ASSET_LOADED = EVENT_LOADER_ASSET_LOADED;
exports.Emitter = Emitter;
exports.JsonLoader = JsonLoader;
exports.JsonLoaderResource = JsonLoaderResource;
exports.JsonManifest = JsonManifest;
exports.Layer = Layer;
exports.LoaderBase = LoaderBase;
exports.LoaderResource = LoaderResource;
exports.ManifestBase = ManifestBase;
exports.SoundLoader = SoundLoader;
exports.SoundLoaderResource = SoundLoaderResource;
exports.SoundManifest = SoundManifest;
exports.SpritesheetLoader = SpritesheetLoader;
exports.SpritesheetLoaderResource = SpritesheetLoaderResource;
exports.SpritesheetManifest = SpritesheetManifest;
exports.Task = Task$1;
exports.TextureLoader = TextureLoader;
exports.TextureLoaderResource = TextureLoaderResource;
exports.TextureManifest = TextureManifest;
exports.utils = index;
//# sourceMappingURL=Pixim.cjs.js.map
