/*!
 * @tawaship/pixim.js - v1.9.3
 * 
 * @require pixi.js v5.2.1
 * @require howler.js v2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */

import { Application as Application$1, Container as Container$1, utils, Loader } from 'pixi.js';
import { Emitter as Emitter$1 } from '@tawaship/emitter';
import { Howl } from 'howler';

var Pixim;
(function (Pixim) {
    /**
     * [[https://tawaship.github.io/Emitter/index.html | @tawaship/emitter]]
     */
    class Emitter extends Emitter$1 {
    }
    Pixim.Emitter = Emitter;
})(Pixim || (Pixim = {}));
/**
 * @ignore
 */
var Emitter = Pixim.Emitter;

var Pixim$1;
(function (Pixim) {
    /**
     * @ignore
     */
    const _observers = {};
    /**
     * @ignore
     */
    let _lastTickerData = { delta: 1 };
    /**
     * @private
     */
    class TaskManager {
        constructor() {
            throw new Error('This class can not instantiate.');
        }
        static addObserver(id, observer) {
            _observers[id] = observer;
            observer.updateTask(_lastTickerData);
        }
        static removeObserver(id) {
            delete (_observers[id]);
        }
        static done(e) {
            _lastTickerData = e;
            for (let i in _observers) {
                _observers[i].updateTask(e);
            }
        }
    }
    Pixim.TaskManager = TaskManager;
})(Pixim$1 || (Pixim$1 = {}));
/**
 * @ignore
 */
var TaskManager = Pixim$1.TaskManager;

var Pixim$2;
(function (Pixim) {
    /**
     * @ignore
     */
    const _roots = {};
    /*
    function taskHandler(obj: PIXI.Container, e: ITaskTickerData): void {
        if (obj instanceof Container) {
            obj.task.update(e);
            
            if (!obj.taskEnabledChildren) {
                return;
            }
        }
        
        for (let i = 0; i < obj.children.length; i++) {
            const child = obj.children[i];
            
            if (child instanceof PIXI.Container) {
                taskHandler(child, e);
            }
        }
    }
    */
    class Application extends Emitter {
        /**
         * @param pixiOptions Optional data when call 'new [[[[http://pixijs.download/v5.2.1/docs/PIXI.Application.html | PIXI.Application]]]]'.
         * @param piximOptions Optional data for Pixim.
         */
        constructor(pixiOptions = {}, piximOptions = {}) {
            super();
            const app = new Application$1(pixiOptions);
            app.stop();
            const stage = app.stage;
            const view = app.view;
            view.style.position = 'absolute';
            /*
            if (piximOptions.container) {
                piximOptions.container.appendChild(view);
            } else {
                if (!view.parentNode) {
                    document.body.appendChild(view);
                }
            }
            */
            const autoAdjust = piximOptions.autoAdjust || false;
            this._piximData = {
                isRun: false,
                app,
                stage,
                view,
                container: piximOptions.container || document.body,
                layers: {},
                options: piximOptions
            };
            const ticker = this._piximData.app.ticker;
            ticker.add((delta) => {
                TaskManager.done({ delta });
                //taskHandler(stage, { delta });
            });
            if (autoAdjust) {
                if (autoAdjust === true) {
                    const f = () => {
                        this.fullScreen();
                    };
                    window.addEventListener('resize', f);
                    f();
                }
                else {
                    const f = () => {
                        autoAdjust(this);
                    };
                    window.addEventListener('resize', f);
                    f();
                }
            }
        }
        get app() {
            return this._piximData.app;
        }
        get stage() {
            return this._piximData.stage;
        }
        get view() {
            return this._piximData.view;
        }
        get container() {
            return this._piximData.container;
        }
        set container(container) {
            this._piximData.container = container || document.body;
            if (this._piximData.view.parentNode) {
                this._piximData.container.appendChild(this._piximData.view);
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
            this._piximData.layers[name] = this._piximData.stage.addChild(new Container$1());
            return this;
        }
        /**
         * Remove layer form application.
         */
        removeLayer(name) {
            if (!this._hasLayer(name)) {
                return this;
            }
            this._piximData.stage.removeChild(this._piximData.layers[name]);
            delete (this._piximData.layers[name]);
            return this;
        }
        /**
         * Attach content to application.
         */
        attachAsync(content, layerName = 'anonymous') {
            return content.buildAsync()
                .then((root) => {
                this.addLayer(layerName);
                _roots[content.contentID] = root;
                this._piximData.layers[layerName].addChild(root);
                return root;
            });
        }
        /**
         * Detach content from application.
         */
        detach(content) {
            const root = _roots[content.contentID];
            if (!root) {
                return this;
            }
            this._destroyRoot(root);
            delete (_roots[content.contentID]);
            return this;
        }
        /**
         * Play application.
         */
        play() {
            if (this._piximData.isRun) {
                return this;
            }
            this._piximData.container.appendChild(this._piximData.view);
            this._piximData.app.start();
            this._piximData.isRun = true;
            return this;
        }
        /**
         * Stop application.
         */
        stop() {
            if (!this._piximData.isRun) {
                return this;
            }
            if (this._piximData.view.parentNode) {
                this._piximData.view.parentNode.removeChild(this._piximData.view);
            }
            this._piximData.app.stop();
            this._piximData.isRun = false;
            const stage = this._piximData.app.stage;
            const layers = this._piximData.layers;
            for (let i in layers) {
                layers[i].removeChildren();
            }
            const keys = [];
            for (let i in _roots) {
                this._destroyRoot(_roots[i]);
                keys.push(i);
            }
            for (let i = 0; i < keys.length; i++) {
                delete (_roots[keys[i]]);
            }
            this._piximData.app.ticker.update();
            return this;
        }
        _destroyRoot(root) {
            if (root.parent) {
                root.parent.removeChild(root);
            }
            root.destroy();
        }
        /**
         * Pause (or restart) application.
         */
        pause(paused) {
            if (!this._piximData.isRun) {
                return this;
            }
            if (paused) {
                this._piximData.app.stop();
            }
            else {
                this._piximData.app.start();
            }
            return this;
        }
        /**
         * Resize canvas to fit specified rectangle.
         *
         * @param rect Rectangle to adjust.
         */
        fullScreen(rect) {
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
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
            const view = this._piximData.view;
            const ver = vertical || {
                y: 0,
                height: this._piximData.container.offsetHeight || window.innerHeight
            };
            view.style.top = `${ver.height - this._getViewRect().height + ver.y}px`;
            return this;
        }
        _getViewRect() {
            const view = this._piximData.view;
            return {
                x: parseInt(view.style.left.replace('px', '')),
                y: parseInt(view.style.top.replace('px', '')),
                width: parseInt(view.style.width.replace('px', '')),
                height: parseInt(view.style.height.replace('px', ''))
            };
        }
    }
    Pixim.Application = Application;
})(Pixim$2 || (Pixim$2 = {}));
/**
 * @ignore
 */
var Application = Pixim$2.Application;

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

var Pixim$3;
(function (Pixim) {
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
    Pixim.Task = Task$1;
})(Pixim$3 || (Pixim$3 = {}));
/**
 * @ignore
 */
var Task$1 = Pixim$3.Task;

var Pixim$4;
(function (Pixim) {
    /**
     * @ignore
     */
    let _lastObserverID = 0;
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
            const _observerID = _lastObserverID++;
            this.on('added', () => {
                TaskManager.addObserver(_observerID, this);
            });
            this.on('removed', () => {
                TaskManager.removeObserver(_observerID);
            });
        }
        updateTask(e) {
            const task = this._piximData.task;
            if (!this.taskEnabled) {
                return;
            }
            let p = this;
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
    Pixim.Container = Container;
})(Pixim$4 || (Pixim$4 = {}));
/**
 * @ignore
 */
var Container = Pixim$4.Container;

var Pixim$5;
(function (Pixim) {
    /**
     * @ignore
     */
    const _cache = {};
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
                    url: manifests[i],
                    unrequired
                };
            }
        }
        /**
         * Get resources.
         *
         * @param basepath Basement directory path of assets.
         */
        getAsync(basepath, version) {
            const manifests = this._manifests;
            const resources = {};
            const loadable = {};
            const cache = _cache;
            for (let i in manifests) {
                const manifest = manifests[i];
                const url = this._resolvePath(manifest.url, basepath);
                // query parameter is invalid for resource cache
                const name = url.replace(/\?.*/, '');
                if (cache[name]) {
                    resources[i] = cache[name];
                    continue;
                }
                loadable[i] = {
                    url,
                    name,
                    unrequired: manifest.unrequired
                };
            }
            if (Object.keys(loadable).length === 0) {
                return Promise.resolve(resources);
            }
            return this._loadAsync(loadable, version)
                .then((res) => {
                for (let i in res) {
                    resources[i] = res[i].resource;
                    if (!res[i].error) {
                        cache[loadable[i].name] = res[i].resource;
                    }
                }
                return resources;
            });
        }
        /**
         * Load resources.
         */
        _loadAsync(manifests, version) {
            return Promise.resolve({});
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
    }
    Pixim.ContentManifestBase = ContentManifestBase;
})(Pixim$5 || (Pixim$5 = {}));
/**
 * @ignore
 */
var ContentManifestBase = Pixim$5.ContentManifestBase;

var Pixim$6;
(function (Pixim) {
    class ContentImageManifest extends ContentManifestBase {
        /**
         * Load image resources.
         *
         * @override
         */
        _loadAsync(manifests, version) {
            return new Promise((resolve, reject) => {
                const loader = new Loader();
                if (version) {
                    loader.defaultQueryString = `_fv=${version}`;
                }
                for (let i in manifests) {
                    loader.add(i, manifests[i].url, {
                        crossOrigin: true
                    });
                }
                const res = {};
                loader.load((loader, resources) => {
                    for (let i in resources) {
                        const resource = resources[i];
                        if (!resource) {
                            reject({ [i]: manifests[i].url });
                            return;
                        }
                        if (resource.error && !manifests[i].unrequired) {
                            reject({ [i]: manifests[i].url });
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
    }
    Pixim.ContentImageManifest = ContentImageManifest;
})(Pixim$6 || (Pixim$6 = {}));
/**
 * @ignore
 */
var ContentImageManifest = Pixim$6.ContentImageManifest;

var Pixim$7;
(function (Pixim) {
    class ContentSpritesheetManifest extends ContentManifestBase {
        /**
         * Load image resources.
         *
         * @override
         */
        _loadAsync(manifests, version) {
            return new Promise((resolve, reject) => {
                const loader = new Loader();
                if (version) {
                    loader.defaultQueryString = `_fv=${version}`;
                }
                for (let i in manifests) {
                    loader.add(i, manifests[i].url, {
                        crossOrigin: true
                    });
                }
                const res = {};
                loader.load((loader, resources) => {
                    for (let i in resources) {
                        if (!manifests[i]) {
                            continue;
                        }
                        const resource = resources[i];
                        if (!resource) {
                            reject({ [i]: manifests[i].url });
                            return;
                        }
                        const textures = resource.textures || {};
                        const error = !!resource.error;
                        if (resource.error && !manifests[i].unrequired) {
                            reject({ [i]: manifests[i].url });
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
    }
    Pixim.ContentSpritesheetManifest = ContentSpritesheetManifest;
})(Pixim$7 || (Pixim$7 = {}));
/**
 * @ignore
 */
var ContentSpritesheetManifest = Pixim$7.ContentSpritesheetManifest;

var Pixim$8;
(function (Pixim) {
    class ContentSoundManifest extends ContentManifestBase {
        /**
         * Load image resources.
         *
         * @override
         */
        _loadAsync(manifests, version) {
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
                    if (!Howl) {
                        console.warn('You need "howler.js" to load sound asset.');
                        reject({ [i]: manifests[i].url });
                        return;
                    }
                    ++loadCount;
                }
                for (let i in manifests) {
                    const _i = i;
                    const url = version
                        ? `${manifests[_i].url}${manifests[_i].url.match(/\?/) ? '&' : '?'}_fv=${version}`
                        : manifests[_i].url;
                    const howl = new Howl({
                        src: url,
                        onload: () => {
                            loadedHandler(_i, howl, false);
                        },
                        onloaderror: () => {
                            if (!manifests[_i].unrequired) {
                                reject({ [_i]: manifests[_i].url });
                                return;
                            }
                            loadedHandler(_i, howl, true);
                        }
                    });
                }
            });
        }
    }
    Pixim.ContentSoundManifest = ContentSoundManifest;
})(Pixim$8 || (Pixim$8 = {}));
/**
 * @ignore
 */
var ContentSoundManifest = Pixim$8.ContentSoundManifest;

var Pixim$9;
(function (Pixim) {
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
    Pixim.ContentDeliver = ContentDeliver;
})(Pixim$9 || (Pixim$9 = {}));
/**
 * @ignore
 */
var ContentDeliver = Pixim$9.ContentDeliver;

var Pixim$a;
(function (Pixim) {
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
        return {
            images: new ContentImageManifest(),
            spritesheets: new ContentSpritesheetManifest(),
            sounds: new ContentSoundManifest()
        };
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
    class Content {
        constructor(options = {}, piximData = Content._piximData) {
            const basepath = (options.basepath || '').replace(/([^/])$/, '$1/');
            if (typeof (options.version) !== 'object') {
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
            };
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
                .catch((e) => {
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
                .catch((e) => {
                this._piximData.postloadPromise = null;
                throw e;
            });
        }
        _loadAssetAsync(manifests) {
            const basepath = this._piximData.basepath;
            const version = this._piximData.version;
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
                promises.push(manifests[type].getAsync(basepath, version[type] || ''));
            }
            return Promise.all(promises)
                .then((resolver) => {
                for (let i = 0; i < resolver.length; i++) {
                    resources[keys[i]] = resources[keys[i]] || {};
                    for (let j in resolver[i]) {
                        resources[keys[i]][j] = resolver[i][j];
                    }
                }
            })
                .catch((e) => {
                for (let i in e) {
                    console.error(`Asset '${i}: ${e[i]}' cannot load.`);
                }
                throw e;
            });
        }
    }
    Pixim.Content = Content;
})(Pixim$a || (Pixim$a = {}));
/**
 * @ignore
 */
var Content = Pixim$a.Content;

export { Application, Container, Content, ContentImageManifest, ContentManifestBase, ContentSoundManifest, ContentSpritesheetManifest, Emitter, Task$1 as Task };
//# sourceMappingURL=Pixim.esm.js.map
