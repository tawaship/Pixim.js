/*!
 * @tawaship/pixim.js - v1.13.2
 * 
 * @require pixi.js v^5.3.2
 * @require howler.js v^2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */
!function(exports, PIXI, howler) {
    "use strict";
    window.console.log("%c pixim.js%cv1.13.2 %c", "color: #FFF; background: #03F; padding: 5px; border-radius:12px 0 0 12px; margin-top: 5px; margin-bottom: 5px;", "color: #FFF; background: #F33; padding: 5px;  border-radius:0 12px 12px 0;", "padding: 5px;");
    /*!
     * @tawaship/emitter - v3.1.1
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */
    var Emitter = function() {
        this._events = {};
    };
    Emitter.prototype._on = function(type, callback, once) {
        if (!type || !callback) {
            return this;
        }
        for (var events = this._events[type] = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].callback === callback) {
                return this;
            }
        }
        return events.push({
            callback: callback,
            once: once
        }), this;
    }, Emitter.prototype.on = function(type, callback) {
        return this._on(type, callback, !1);
    }, Emitter.prototype.once = function(type, callback) {
        return this._on(type, callback, !0);
    }, Emitter.prototype.off = function(type, callback) {
        if (!type || !callback) {
            return this;
        }
        for (var events = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].callback === callback) {
                return events.splice(i, 1), this;
            }
        }
        return this;
    }, Emitter.prototype._emit = function(type, context) {
        for (var args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        if (!type) {
            return this;
        }
        for (var events = this._events[type] || [], targets = [], i = events.length - 1; i >= 0; i--) {
            var event = events[i];
            event.once && events.splice(i, 1), targets.push(event);
        }
        for (var i$1 = targets.length - 1; i$1 >= 0; i$1--) {
            targets[i$1].callback.apply(context, args);
        }
        return this;
    }, Emitter.prototype.emit = function(type) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emit.apply(ref, [ type, this ].concat(args));
    }, Emitter.prototype.cemit = function(type, context) {
        for (var ref, args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        return (ref = this)._emit.apply(ref, [ type, context ].concat(args));
    }, Emitter.prototype._emitAll = function(context) {
        for (var args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        if (null == context) {
            return this;
        }
        var targets = [];
        for (var type in this._events) {
            for (var events = this._events[type] || [], i = events.length - 1; i >= 0; i--) {
                var event = events[i];
                event.once && events.splice(i, 1), targets.push(event);
            }
        }
        for (var i$1 = targets.length - 1; i$1 >= 0; i$1--) {
            targets[i$1].callback.apply(context, args);
        }
        return this;
    }, Emitter.prototype.emitAll = function() {
        for (var ref, args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        return (ref = this)._emitAll.apply(ref, [ this ].concat(args));
    }, Emitter.prototype.cemitAll = function(context) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emitAll.apply(ref, [ context ].concat(args));
    }, Emitter.prototype.clear = function(type) {
        return void 0 === type && (type = ""), type ? delete this._events[type] : this._events = {}, 
        this;
    };
    var Emitter$1 = function(_Emitter) {
        function Emitter() {
            _Emitter.apply(this, arguments);
        }
        return _Emitter && (Emitter.__proto__ = _Emitter), Emitter.prototype = Object.create(_Emitter && _Emitter.prototype), 
        Emitter.prototype.constructor = Emitter, Emitter;
    }(Emitter), Task = function(callbacks, context) {
        this._taskData = {
            context: null == context ? this : context,
            enabled: !0,
            index: -1,
            callbacks: [],
            value: null
        }, this.add(callbacks);
    }, prototypeAccessors = {
        enabled: {
            configurable: !0
        },
        value: {
            configurable: !0
        }
    };
    /*!
     * @tawaship/task - v1.1.0
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */    prototypeAccessors.enabled.get = function() {
        return this._taskData.enabled;
    }, prototypeAccessors.enabled.set = function(enabled) {
        this._taskData.enabled = enabled;
    }, Task.prototype.add = function(callbacks) {
        Array.isArray(callbacks) || (callbacks = [ callbacks ]);
        for (var list = this._taskData.callbacks, i = (list.length, 0); i < callbacks.length; i++) {
            callbacks[i] instanceof Function && list.push(callbacks[i]);
        }
        return this;
    }, Task.prototype.done = function() {
        for (var args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        if (this._taskData.enabled) {
            var task = this._taskData.callbacks[this._taskData.index];
            if (task) {
                return this._taskData.value = task.apply(this._taskData.context, args);
            }
        }
    }, Task.prototype._to = function(index) {
        return this._taskData.index = Number(index), this;
    }, Task.prototype.first = function() {
        return this._to(0);
    }, Task.prototype.prev = function() {
        return this._to(this._taskData.index - 1);
    }, Task.prototype.next = function() {
        return this._to(this._taskData.index + 1);
    }, Task.prototype.to = function(index) {
        return this._to(index);
    }, Task.prototype.finish = function() {
        return this._taskData.index = -1, this;
    }, Task.prototype.reset = function() {
        return this._taskData.callbacks = [], this._taskData.index = -1, this._taskData.value = null, 
        this;
    }, Task.prototype.destroy = function() {
        this.reset();
    }, prototypeAccessors.value.get = function() {
        return this._taskData.value;
    }, Object.defineProperties(Task.prototype, prototypeAccessors);
    var Task$1 = function(_Task) {
        function Task(tasks, context) {
            _Task.call(this, tasks, context), this.enabled = !0, this._piximData = {
                emitter: new Emitter$1
            };
        }
        return _Task && (Task.__proto__ = _Task), Task.prototype = Object.create(_Task && _Task.prototype), 
        Task.prototype.constructor = Task, Task.prototype.on = function(type, callback) {
            return this._piximData.emitter.on(type, callback), this;
        }, Task.prototype.once = function(type, callback) {
            return this._piximData.emitter.once(type, callback), this;
        }, Task.prototype.off = function(type, callback) {
            return this._piximData.emitter.off(type, callback), this;
        }, Task.prototype.emit = function(type) {
            for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
                args[len] = arguments[len + 1];
            }
            return this._taskData.enabled ? ((ref = this._piximData.emitter).emit.apply(ref, [ type ].concat(args)), 
            this) : this;
        }, Task.prototype.cemit = function(type, context) {
            for (var ref, args = [], len = arguments.length - 2; len-- > 0; ) {
                args[len] = arguments[len + 2];
            }
            return this._taskData.enabled ? ((ref = this._piximData.emitter).cemit.apply(ref, [ type, context ].concat(args)), 
            this) : this;
        }, Task.prototype.emitAll = function() {
            for (var ref, args = [], len = arguments.length; len--; ) {
                args[len] = arguments[len];
            }
            return this._taskData.enabled ? ((ref = this._piximData.emitter).emitAll.apply(ref, args), 
            this) : this;
        }, Task.prototype.cemitAll = function(context) {
            for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
                args[len] = arguments[len + 1];
            }
            return this._taskData.enabled ? ((ref = this._piximData.emitter).cemitAll.apply(ref, [ context ].concat(args)), 
            this) : this;
        }, Task.prototype.clear = function(type) {
            return void 0 === type && (type = ""), this._piximData.emitter.clear(type), this;
        }, Task.prototype.destroy = function() {
            _Task.prototype.destroy.call(this), this.clear();
        }, Task;
    }(Task), Container = function(superclass) {
        function Container() {
            for (var args = [], len = arguments.length; len--; ) {
                args[len] = arguments[len];
            }
            superclass.call(this), this._piximData = {
                task: new Task$1([], this),
                taskEnabledChildren: !0
            }, this._piximData.task.first();
        }
        superclass && (Container.__proto__ = superclass), Container.prototype = Object.create(superclass && superclass.prototype), 
        Container.prototype.constructor = Container;
        var prototypeAccessors = {
            taskEnabled: {
                configurable: !0
            },
            taskEnabledChildren: {
                configurable: !0
            },
            task: {
                configurable: !0
            }
        };
        return Container.prototype.updateTask = function(e) {
            var task = this._piximData.task;
            this._piximData.task.enabled && (task.done(e), task.cemitAll(this, e));
        }, prototypeAccessors.taskEnabled.get = function() {
            return this._piximData.task.enabled;
        }, prototypeAccessors.taskEnabled.set = function(enabled) {
            this._piximData.task.enabled = enabled;
        }, prototypeAccessors.taskEnabledChildren.get = function() {
            return this._piximData.taskEnabledChildren;
        }, prototypeAccessors.taskEnabledChildren.set = function(enabled) {
            this._piximData.taskEnabledChildren = enabled;
        }, prototypeAccessors.task.get = function() {
            return this._piximData.task;
        }, Container.prototype.destroy = function() {
            for (var args = [], len = arguments.length; len--; ) {
                args[len] = arguments[len];
            }
            superclass.prototype.destroy.apply(this, args), this._piximData.task.destroy();
        }, Object.defineProperties(Container.prototype, prototypeAccessors), Container;
    }(PIXI.Container), Layer = function(superclass) {
        function Layer() {
            superclass.apply(this, arguments);
        }
        return superclass && (Layer.__proto__ = superclass), Layer.prototype = Object.create(superclass && superclass.prototype), 
        Layer.prototype.constructor = Layer, Layer;
    }(PIXI.Container);
    function taskHandler(obj, e) {
        if (!(obj instanceof Container) || (obj.updateTask(e), obj.taskEnabledChildren)) {
            for (var children = [], i = 0; i < obj.children.length; i++) {
                children.push(obj.children[i]);
            }
            for (var i$1 = 0; i$1 < children.length; i$1++) {
                var child = children[i$1];
                child instanceof PIXI.Container && taskHandler(child, e);
            }
        }
    }
    var Application = function(Emitter) {
        function Application(pixiOptions, piximOptions) {
            var this$1 = this;
            void 0 === pixiOptions && (pixiOptions = {}), void 0 === piximOptions && (piximOptions = {}), 
            Emitter.call(this);
            var app = new PIXI.Application(pixiOptions);
            app.stop(), app.view.style.position = "absolute";
            var autoAdjust = piximOptions.autoAdjust || !1;
            this._piximData = {
                isRun: !1,
                app: app,
                container: piximOptions.container || document.body,
                layers: {},
                autoAdjuster: null,
                roots: {},
                contents: {}
            }, this._piximData.app.ticker.add((function(delta) {
                taskHandler(this$1._piximData.app.stage, {
                    delta: delta
                });
            })), autoAdjust && (this.autoAdjuster = !0 === autoAdjust ? function() {
                this$1.fullScreen();
            } : function() {
                autoAdjust(this$1);
            });
        }
        Emitter && (Application.__proto__ = Emitter), Application.prototype = Object.create(Emitter && Emitter.prototype), 
        Application.prototype.constructor = Application;
        var prototypeAccessors = {
            app: {
                configurable: !0
            },
            stage: {
                configurable: !0
            },
            view: {
                configurable: !0
            },
            container: {
                configurable: !0
            },
            autoAdjuster: {
                configurable: !0
            }
        };
        return prototypeAccessors.app.get = function() {
            return this._piximData.app;
        }, prototypeAccessors.stage.get = function() {
            return this._piximData.app.stage;
        }, prototypeAccessors.view.get = function() {
            return this._piximData.app.view;
        }, prototypeAccessors.container.get = function() {
            return this._piximData.container;
        }, prototypeAccessors.container.set = function(container) {
            this._piximData.container = container || document.body, this._piximData.app.view.parentNode && this._piximData.container.appendChild(this._piximData.app.view);
        }, Application.prototype._hasLayer = function(name) {
            return !!this._piximData.layers[name];
        }, Application.prototype.addLayer = function(name) {
            return this._hasLayer(name) || (this._piximData.layers[name] = this._piximData.app.stage.addChild(new Layer)), 
            this;
        }, Application.prototype.removeLayer = function(name) {
            return this._hasLayer(name) ? (this._piximData.app.stage.removeChild(this._piximData.layers[name]), 
            delete this._piximData.layers[name], this) : this;
        }, Application.prototype.attachAsync = function(content, layerName) {
            var this$1 = this;
            return void 0 === layerName && (layerName = "anonymous"), content.buildAsync().then((function(root) {
                return this$1.detach(content), this$1.addLayer(layerName), this$1._piximData.roots[content.contentID] = root, 
                this$1._piximData.contents[content.contentID] = content, this$1._piximData.layers[layerName].addChild(root), 
                root;
            }));
        }, Application.prototype.detach = function(content, stageOptions) {
            void 0 === stageOptions && (stageOptions = {
                children: !0
            });
            var root = this._piximData.roots[content.contentID];
            return root ? (this._destroyRoot(root, stageOptions), delete this._piximData.roots[content.contentID], 
            delete this._piximData.contents[content.contentID], this) : this;
        }, Application.prototype.play = function() {
            return this._piximData.container.appendChild(this._piximData.app.view), this.start();
        }, Application.prototype.start = function() {
            return this._piximData.app.start(), this;
        }, Application.prototype.stop = function() {
            return this._piximData.app.stop(), this;
        }, Application.prototype.pause = function(paused) {
            return paused ? this.stop() : this.start(), this;
        }, prototypeAccessors.autoAdjuster.get = function() {
            return this._piximData.autoAdjuster;
        }, prototypeAccessors.autoAdjuster.set = function(autoAdjuster) {
            this._piximData.autoAdjuster && window.removeEventListener("resize", this._piximData.autoAdjuster), 
            autoAdjuster ? (this._piximData.autoAdjuster = autoAdjuster, window.addEventListener("resize", autoAdjuster), 
            autoAdjuster()) : this._piximData.autoAdjuster = null;
        }, Application.prototype.preDestroy = function() {
            for (var i in this._piximData.contents) {
                this._piximData.contents[i].destroy();
            }
            this.autoAdjuster = null, this._piximData.layers = {}, this._piximData.roots = {}, 
            this._piximData.contents = {};
        }, Application.prototype.destroy = function(removeView, stageOptions) {
            return this.preDestroy(), this._piximData.app.destroy(removeView, stageOptions), 
            this;
        }, Application.prototype._destroyRoot = function(root, stageOptions) {
            root.destroy(stageOptions);
        }, Application.prototype.fullScreen = function(rect) {
            var view = this._piximData.app.view, r = rect || {
                x: 0,
                y: 0,
                width: this._piximData.container.offsetWidth || window.innerWidth,
                height: this._piximData.container.offsetHeight || window.innerHeight
            };
            return r.width / r.height > view.width / view.height ? this.adjustHeight(r.height).toCenter(r).toTop(r) : this.adjustWidth(r.width).toMiddle(r).toLeft(r);
        }, Application.prototype.adjustWidth = function(width) {
            var view = this._piximData.app.view, w = width || this._piximData.container.offsetWidth || window.innerWidth, h = w / view.width * view.height;
            return view.style.width = w + "px", view.style.height = h + "px", this;
        }, Application.prototype.adjustHeight = function(height) {
            var view = this._piximData.app.view, h = height || this._piximData.container.offsetHeight || window.innerHeight, w = h / view.height * view.width;
            return view.style.height = h + "px", view.style.width = w + "px", this;
        }, Application.prototype.toLeft = function(horizontal) {
            var view = this._piximData.app.view, hol = horizontal || {
                x: 0,
                width: this._piximData.container.offsetWidth || window.innerWidth
            };
            return view.style.left = hol.x + "px", this;
        }, Application.prototype.toCenter = function(horizontal) {
            var view = this._piximData.app.view, hol = horizontal || {
                x: 0,
                width: this._piximData.container.offsetWidth || window.innerWidth
            };
            return view.style.left = (hol.width - this._getViewRect().width) / 2 + hol.x + "px", 
            this;
        }, Application.prototype.toRight = function(horizontal) {
            var view = this._piximData.app.view, hol = horizontal || {
                x: 0,
                width: this._piximData.container.offsetWidth || window.innerWidth
            };
            return view.style.left = hol.width - this._getViewRect().width + hol.x + "px", this;
        }, Application.prototype.toTop = function(vertical) {
            var view = this._piximData.app.view, ver = vertical || {
                y: 0,
                height: this._piximData.container.offsetHeight || window.innerHeight
            };
            return view.style.top = ver.y + "px", this;
        }, Application.prototype.toMiddle = function(vertical) {
            var view = this._piximData.app.view, ver = vertical || {
                y: 0,
                height: this._piximData.container.offsetHeight || window.innerHeight
            };
            return view.style.top = (ver.height - this._getViewRect().height) / 2 + ver.y + "px", 
            this;
        }, Application.prototype.toBottom = function(vertical) {
            var view = this._piximData.app.view, ver = vertical || {
                y: 0,
                height: this._piximData.container.offsetHeight || window.innerHeight
            };
            return view.style.top = ver.height - this._getViewRect().height + ver.y + "px", 
            this;
        }, Application.prototype._getViewRect = function() {
            var view = this._piximData.app.view;
            return {
                x: parseInt(view.style.left.replace("px", "")),
                y: parseInt(view.style.top.replace("px", "")),
                width: parseInt(view.style.width.replace("px", "")),
                height: parseInt(view.style.height.replace("px", ""))
            };
        }, Object.defineProperties(Application.prototype, prototypeAccessors), Application;
    }(Emitter$1);
    function resolvePath(path, basepath) {
        return 0 === path.indexOf("http://") || 0 === path.indexOf("https://") ? path : PIXI.utils.url.resolve(basepath.replace(/([^\/])$/, "$1/"), path);
    }
    function resolveQuery(uri, queries) {
        if (0 === uri.indexOf("data:")) {
            return uri;
        }
        var q = [], t = uri.split("?");
        if (t[1]) {
            for (var search = t[1].split("&"), i = 0; i < search.length; i++) {
                search[i].split("=")[0] in queries || q.push(search[i]);
            }
        }
        for (var i$1 in queries) {
            q.push(i$1 + "=" + queries[i$1]);
        }
        return t[0] + "?" + q.join("&");
    }
    var index = Object.freeze({
        __proto__: null,
        resolvePath: resolvePath,
        resolveQuery: resolveQuery
    }), LoaderResource = function(data, error) {
        this._data = data, this._error = error;
    }, prototypeAccessors$1 = {
        data: {
            configurable: !0
        },
        error: {
            configurable: !0
        }
    };
    prototypeAccessors$1.data.get = function() {
        return this._data;
    }, prototypeAccessors$1.error.get = function() {
        return this._error;
    }, Object.defineProperties(LoaderResource.prototype, prototypeAccessors$1);
    var LoaderBase = function(Emitter) {
        function LoaderBase(options) {
            void 0 === options && (options = {}), Emitter.call(this), this._options = options;
        }
        return Emitter && (LoaderBase.__proto__ = Emitter), LoaderBase.prototype = Object.create(Emitter && Emitter.prototype), 
        LoaderBase.prototype.constructor = LoaderBase, LoaderBase.prototype._resolveBasepath = function(basepath) {
            return "string" == typeof basepath ? basepath : this._options.basepath || "";
        }, LoaderBase.prototype._resolveVersion = function(version) {
            return "string" == typeof version || "number" == typeof version ? version : this._options.version || "";
        }, LoaderBase.prototype._resolveUseCache = function(useCache) {
            return "boolean" == typeof useCache ? useCache : this._options.useCache || !1;
        }, LoaderBase.prototype._resolveUrl = function(url, options) {
            void 0 === options && (options = {});
            var preUri = resolvePath(url, this._resolveBasepath(options.basepath)), version = this._resolveVersion(options.version);
            return version ? resolveQuery(preUri, {
                _fv: version
            }) : preUri;
        }, LoaderBase.prototype.loaderAssetLoaded = function(data) {}, LoaderBase;
    }(Emitter);
    delete LoaderBase.prototype.loaderAssetLoaded;
    var ManifestBase = function(Emitter) {
        function ManifestBase() {
            Emitter.apply(this, arguments), this._data = {}, this._resources = {};
        }
        Emitter && (ManifestBase.__proto__ = Emitter), ManifestBase.prototype = Object.create(Emitter && Emitter.prototype), 
        ManifestBase.prototype.constructor = ManifestBase;
        var prototypeAccessors = {
            count: {
                configurable: !0
            }
        };
        return ManifestBase.prototype.add = function(targets, options) {
            void 0 === options && (options = {});
            var unrequired = options.unrequired || !1;
            for (var i in targets) {
                this._data[i] = {
                    target: targets[i],
                    unrequired: unrequired
                };
            }
        }, prototypeAccessors.count.get = function() {
            return Object.keys(this._data).length;
        }, ManifestBase.prototype.getAsync = function(options) {
            var this$1 = this;
            if (0 === Object.keys(this._data).length) {
                return Promise.resolve({});
            }
            var res = {}, targets = {};
            for (var i in this._data) {
                targets[i] = this._data[i].target;
            }
            return this._loadAsync(targets, options).then((function(resources) {
                for (var i in resources) {
                    var resource = resources[i];
                    if (resource.error && !this$1._data[i].unrequired) {
                        throw resource.error;
                    }
                }
                for (var i$1 in resources) {
                    var resource$1 = resources[i$1];
                    this$1._resources[i$1] = resource$1, res[i$1] = resource$1.data;
                }
                return res;
            }));
        }, ManifestBase.prototype._doneLoaderAsync = function(loader, targets) {
            var this$1 = this;
            return loader.on("loaderAssetLoaded", (function(resource) {
                this$1.emit("loaderAssetLoaded", resource);
            })), loader.loadAllAsync(targets, {});
        }, ManifestBase.prototype.destroyResources = function() {
            for (var i in this._resources) {
                this._resources[i].destroy();
            }
        }, Object.defineProperties(ManifestBase.prototype, prototypeAccessors), ManifestBase;
    }(Emitter), TextureLoaderResource = function(superclass) {
        function TextureLoaderResource() {
            superclass.apply(this, arguments);
        }
        return superclass && (TextureLoaderResource.__proto__ = superclass), TextureLoaderResource.prototype = Object.create(superclass && superclass.prototype), 
        TextureLoaderResource.prototype.constructor = TextureLoaderResource, TextureLoaderResource.prototype.destroy = function() {
            TextureLoaderResource.removeCache(this._data), this._data.destroy(!0);
        }, TextureLoaderResource.removeCache = function(texture) {
            PIXI.Texture.removeFromCache(texture), texture.baseTexture && PIXI.BaseTexture.removeFromCache(texture.baseTexture);
        }, TextureLoaderResource;
    }(LoaderResource), TextureLoader = function(superclass) {
        function TextureLoader() {
            superclass.apply(this, arguments);
        }
        return superclass && (TextureLoader.__proto__ = superclass), TextureLoader.prototype = Object.create(superclass && superclass.prototype), 
        TextureLoader.prototype.constructor = TextureLoader, TextureLoader.prototype.loadAsync = function(target, options) {
            var this$1 = this;
            return void 0 === options && (options = {}), (target instanceof HTMLImageElement || target instanceof HTMLVideoElement ? this$1._loadFromElementAsync(target, options) : 0 === target.indexOf("data:") ? this$1._loadFromDataUriAsync(target, options) : this$1._loadFromUrlAsync(target, options)).then((function(resource) {
                return resource.error || this$1.emit("loaderAssetLoaded", {
                    target: target,
                    resource: resource
                }), resource;
            }));
        }, TextureLoader.prototype.loadAllAsync = function(targets, options) {
            var this$1 = this;
            if (void 0 === options && (options = {}), 0 === Object.keys(targets).length) {
                return Promise.resolve({});
            }
            var promises = [], res = {}, loop = function(i) {
                promises.push(this$1.loadAsync(targets[i], options).then((function(resource) {
                    res[i] = resource;
                })));
            };
            for (var i in targets) {
                loop(i);
            }
            return Promise.all(promises).then((function() {
                return res;
            }));
        }, TextureLoader.prototype._loadFromUrlAsync = function(url, options) {
            return void 0 === options && (options = {}), this._loadAsync(this._resolveUrl(url, options), options);
        }, TextureLoader.prototype._loadFromElementAsync = function(element, options) {
            return void 0 === options && (options = {}), element.crossOrigin = "anonymous", 
            element.src = this._resolveUrl(element.src, options), this._loadAsync(element);
        }, TextureLoader.prototype._loadFromDataUriAsync = function(dataUri, options) {
            return void 0 === options && (options = {}), this._loadAsync(dataUri, options);
        }, TextureLoader.prototype._loadAsync = function(target, options) {
            void 0 === options && (options = {});
            var useCache = this._resolveUseCache(options.useCache);
            return new Promise((function(resolve) {
                var bt = PIXI.BaseTexture.from(target);
                if (bt.valid) {
                    return useCache || PIXI.BaseTexture.removeFromCache(bt), void resolve(new TextureLoaderResource(new PIXI.Texture(bt), null));
                }
                bt.on("loaded", (function(baseTexture) {
                    useCache || PIXI.BaseTexture.removeFromCache(baseTexture), resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), null));
                })), bt.on("error", (function(baseTexture, e) {
                    PIXI.BaseTexture.removeFromCache(baseTexture), resolve(new TextureLoaderResource(new PIXI.Texture(baseTexture), e));
                }));
            }));
        }, TextureLoader;
    }(LoaderBase), TextureManifest = function(superclass) {
        function TextureManifest() {
            superclass.apply(this, arguments);
        }
        return superclass && (TextureManifest.__proto__ = superclass), TextureManifest.prototype = Object.create(superclass && superclass.prototype), 
        TextureManifest.prototype.constructor = TextureManifest, TextureManifest.prototype._loadAsync = function(targets, options) {
            void 0 === options && (options = {});
            var loader = new TextureLoader(options);
            return this._doneLoaderAsync(loader, targets);
        }, TextureManifest;
    }(ManifestBase), SpritesheetLoaderResource = function(superclass) {
        function SpritesheetLoaderResource() {
            superclass.apply(this, arguments);
        }
        return superclass && (SpritesheetLoaderResource.__proto__ = superclass), SpritesheetLoaderResource.prototype = Object.create(superclass && superclass.prototype), 
        SpritesheetLoaderResource.prototype.constructor = SpritesheetLoaderResource, SpritesheetLoaderResource.prototype.destroy = function() {
            for (var i in this._data) {
                TextureLoaderResource.removeCache(this._data[i]);
            }
            for (var i$1 in this._data) {
                this._data[i$1].destroy(!0);
            }
        }, SpritesheetLoaderResource;
    }(LoaderResource), SpritesheetLoader = function(superclass) {
        function SpritesheetLoader() {
            superclass.apply(this, arguments);
        }
        return superclass && (SpritesheetLoader.__proto__ = superclass), SpritesheetLoader.prototype = Object.create(superclass && superclass.prototype), 
        SpritesheetLoader.prototype.constructor = SpritesheetLoader, SpritesheetLoader.prototype.loadAsync = function(target, options) {
            var obj, obj$1;
            return void 0 === options && (options = {}), "string" == typeof target ? this._loadFromUrlsAsync((obj = {}, 
            obj["--single-spritesheet"] = target, obj), options).then((function(resources) {
                return resources["--single-spritesheet"];
            })) : this._loadFromJsonsAsync((obj$1 = {}, obj$1["--single-spritesheet"] = target, 
            obj$1), options).then((function(resources) {
                return resources["--single-spritesheet"];
            }));
        }, SpritesheetLoader.prototype.loadAllAsync = function(targets, options) {
            if (void 0 === options && (options = {}), 0 === Object.keys(targets).length) {
                return Promise.resolve({});
            }
            var urls = {}, jsons = {};
            for (var i in targets) {
                var target = targets[i];
                "string" == typeof target ? urls[i] = target : jsons[i] = target;
            }
            return Promise.all([ this._loadFromUrlsAsync(urls, options), this._loadFromJsonsAsync(jsons, options) ]).then((function(resolvers) {
                return Object.assign.apply(Object, [ {} ].concat(resolvers));
            }));
        }, SpritesheetLoader.prototype._loadFromUrlsAsync = function(targets, options) {
            var this$1 = this;
            void 0 === options && (options = {});
            var res = {};
            if (0 === Object.keys(targets).length) {
                return Promise.resolve(res);
            }
            var loader = new PIXI.Loader, version = this._resolveVersion(options.version);
            version && (loader.defaultQueryString = "_fv=" + version);
            var basepath = this._resolveBasepath(options.basepath);
            for (var i in targets) {
                var uri = resolvePath(targets[i], basepath);
                loader.add(i, uri, {
                    crossOrigin: !0
                });
            }
            return this._resolveUseCache(options.useCache) || loader.use((function(resource, next) {
                if (resource.textures) {
                    for (var i in resource.textures) {
                        var texture = resource.textures[i];
                        texture && TextureLoaderResource.removeCache(texture);
                    }
                }
                resource.texture && TextureLoaderResource.removeCache(resource.texture), next();
            })), new Promise((function(resolve) {
                loader.use((function(resource, next) {
                    resource && "json" === resource.extension && !resource.error && resource.textures && this$1.emit("loaderAssetLoaded", {
                        target: resource.name,
                        resource: new SpritesheetLoaderResource(resource.textures, null)
                    }), next();
                })), loader.load((function(loader, resources) {
                    for (var i in resources) {
                        if (targets[i]) {
                            var resource = resources[i];
                            resource ? resource.error ? res[i] = new SpritesheetLoaderResource({}, resource.error) : resource.textures ? res[i] = new SpritesheetLoaderResource(resource.textures, null) : res[i] = new SpritesheetLoaderResource({}, "invalid texture") : res[i] = new SpritesheetLoaderResource({}, "invalid json");
                        }
                    }
                    resolve(res);
                }));
            }));
        }, SpritesheetLoader.prototype._loadFromJsonsAsync = function(targets, options) {
            var this$1 = this;
            void 0 === options && (options = {});
            var res = {};
            if (0 === Object.keys(targets).length) {
                return Promise.resolve(res);
            }
            var useCache = this._resolveUseCache(options.useCache), promises = [], loader = new TextureLoader(options), loop = function(i) {
                var target = targets[i];
                promises.push(loader.loadAsync(target.meta.image, options).then((function(resource) {
                    if (resource.error) {
                        return new SpritesheetLoaderResource({}, resource.error);
                    }
                    var ss = new PIXI.Spritesheet(resource.data, target);
                    return new Promise((function(resolve) {
                        ss.parse((function(e) {
                            var resource = new SpritesheetLoaderResource(ss.textures, null);
                            if (!useCache) {
                                for (var i in ss.textures) {
                                    TextureLoaderResource.removeCache(ss.textures[i]);
                                }
                            }
                            resolve(resource);
                        }));
                    }));
                })).catch((function(e) {
                    return new SpritesheetLoaderResource({}, e);
                })).then((function(resource) {
                    resource.error || this$1.emit("loaderAssetLoaded", {
                        target: target,
                        resource: resource
                    }), res[i] = resource;
                })));
            };
            for (var i in targets) {
                loop(i);
            }
            return Promise.all(promises).then((function() {
                return res;
            }));
        }, SpritesheetLoader;
    }(LoaderBase), SpritesheetManifest = function(superclass) {
        function SpritesheetManifest() {
            superclass.apply(this, arguments);
        }
        return superclass && (SpritesheetManifest.__proto__ = superclass), SpritesheetManifest.prototype = Object.create(superclass && superclass.prototype), 
        SpritesheetManifest.prototype.constructor = SpritesheetManifest, SpritesheetManifest.prototype._loadAsync = function(targets, options) {
            void 0 === options && (options = {});
            var loader = new SpritesheetLoader(options);
            return this._doneLoaderAsync(loader, targets);
        }, SpritesheetManifest;
    }(ManifestBase), SoundLoaderResource = function(superclass) {
        function SoundLoaderResource() {
            superclass.apply(this, arguments);
        }
        return superclass && (SoundLoaderResource.__proto__ = superclass), SoundLoaderResource.prototype = Object.create(superclass && superclass.prototype), 
        SoundLoaderResource.prototype.constructor = SoundLoaderResource, SoundLoaderResource.prototype.destroy = function() {
            this._data.stop(), this._data.unload();
        }, SoundLoaderResource;
    }(LoaderResource), SoundLoader = function(superclass) {
        function SoundLoader() {
            superclass.apply(this, arguments);
        }
        return superclass && (SoundLoader.__proto__ = superclass), SoundLoader.prototype = Object.create(superclass && superclass.prototype), 
        SoundLoader.prototype.constructor = SoundLoader, SoundLoader.prototype.loadAsync = function(target, options) {
            var this$1 = this;
            void 0 === options && (options = {});
            var url = this._resolveUrl(target, options);
            return new Promise((function(resolve) {
                var howl = new howler.Howl({
                    src: url,
                    onload: function() {
                        resolve(new SoundLoaderResource(howl, null));
                    },
                    onloaderror: function() {
                        var e = new Error("invalid resource: " + url);
                        resolve(new SoundLoaderResource(howl, e));
                    }
                });
            })).then((function(resource) {
                return resource.error || this$1.emit("loaderAssetLoaded", {
                    target: target,
                    resource: resource
                }), resource;
            }));
        }, SoundLoader.prototype.loadAllAsync = function(targets, options) {
            var this$1 = this;
            if (void 0 === options && (options = {}), 0 === Object.keys(targets).length) {
                return Promise.resolve({});
            }
            var promises = [], res = {}, loop = function(i) {
                promises.push(this$1.loadAsync(targets[i], options).then((function(resource) {
                    res[i] = resource;
                })));
            };
            for (var i in targets) {
                loop(i);
            }
            return Promise.all(promises).then((function() {
                return res;
            }));
        }, SoundLoader;
    }(LoaderBase), SoundManifest = function(superclass) {
        function SoundManifest() {
            superclass.apply(this, arguments);
        }
        return superclass && (SoundManifest.__proto__ = superclass), SoundManifest.prototype = Object.create(superclass && superclass.prototype), 
        SoundManifest.prototype.constructor = SoundManifest, SoundManifest.prototype._loadAsync = function(targets, options) {
            void 0 === options && (options = {});
            var loader = new SoundLoader(options);
            return this._doneLoaderAsync(loader, targets);
        }, SoundManifest;
    }(ManifestBase), JsonLoaderResource = function(superclass) {
        function JsonLoaderResource() {
            superclass.apply(this, arguments);
        }
        return superclass && (JsonLoaderResource.__proto__ = superclass), JsonLoaderResource.prototype = Object.create(superclass && superclass.prototype), 
        JsonLoaderResource.prototype.constructor = JsonLoaderResource, JsonLoaderResource.prototype.destroy = function() {}, 
        JsonLoaderResource;
    }(LoaderResource), JsonLoader = function(superclass) {
        function JsonLoader() {
            superclass.apply(this, arguments);
        }
        return superclass && (JsonLoader.__proto__ = superclass), JsonLoader.prototype = Object.create(superclass && superclass.prototype), 
        JsonLoader.prototype.constructor = JsonLoader, JsonLoader.prototype.loadAsync = function(target, options) {
            var this$1 = this;
            void 0 === options && (options = {});
            var url = this._resolveUrl(target, options);
            return fetch(url).then((function(res) {
                return res.json();
            })).then((function(json) {
                return new JsonLoaderResource(json, null);
            })).catch((function(e) {
                return new JsonLoaderResource({}, e);
            })).then((function(resource) {
                return resource.error || this$1.emit("loaderAssetLoaded", {
                    target: target,
                    resource: resource
                }), resource;
            }));
        }, JsonLoader.prototype.loadAllAsync = function(targets, options) {
            var this$1 = this;
            if (void 0 === options && (options = {}), 0 === Object.keys(targets).length) {
                return Promise.resolve({});
            }
            var promises = [], res = {}, loop = function(i) {
                promises.push(this$1.loadAsync(targets[i], options).then((function(resource) {
                    res[i] = resource;
                })));
            };
            for (var i in targets) {
                loop(i);
            }
            return Promise.all(promises).then((function() {
                return res;
            }));
        }, JsonLoader;
    }(LoaderBase), JsonManifest = function(superclass) {
        function JsonManifest() {
            superclass.apply(this, arguments);
        }
        return superclass && (JsonManifest.__proto__ = superclass), JsonManifest.prototype = Object.create(superclass && superclass.prototype), 
        JsonManifest.prototype.constructor = JsonManifest, JsonManifest.prototype._loadAsync = function(targets, options) {
            void 0 === options && (options = {});
            var loader = new JsonLoader(options);
            return this._doneLoaderAsync(loader, targets);
        }, JsonManifest;
    }(ManifestBase), ContentDeliver = function(data) {
        this._piximData = {
            width: data.width,
            height: data.height,
            lib: data.lib,
            resources: data.resources,
            vars: data.vars
        };
    }, prototypeAccessors$2 = {
        width: {
            configurable: !0
        },
        height: {
            configurable: !0
        },
        lib: {
            configurable: !0
        },
        resources: {
            configurable: !0
        },
        vars: {
            configurable: !0
        }
    };
    prototypeAccessors$2.width.get = function() {
        return this._piximData.width;
    }, prototypeAccessors$2.height.get = function() {
        return this._piximData.height;
    }, prototypeAccessors$2.lib.get = function() {
        return this._piximData.lib;
    }, prototypeAccessors$2.resources.get = function() {
        return this._piximData.resources;
    }, prototypeAccessors$2.vars.get = function() {
        return this._piximData.vars;
    }, Object.defineProperties(ContentDeliver.prototype, prototypeAccessors$2);
    var _contents = {}, _contentID = 0;
    function createManifests() {
        var res = {};
        for (var i in _manifests) {
            res[i] = new _manifests[i];
        }
        return res;
    }
    var _manifests = {}, Content = function(Emitter) {
        function Content(options, piximData) {
            void 0 === options && (options = {}), void 0 === piximData && (piximData = Content._piximData), 
            Emitter.call(this);
            var basepath = options.basepath || "";
            if ("object" != typeof options.version) {
                var version = {}, v = options.version || "";
                for (var i in _manifests) {
                    version[i] = v;
                }
                options.version = version;
            }
            if ("object" != typeof options.useCache) {
                var useCache = {}, v$1 = options.useCache || !1;
                for (var i$1 in _manifests) {
                    useCache[i$1] = v$1;
                }
                options.useCache = useCache;
            }
            var contentDeliverData = {
                width: piximData.config.width,
                height: piximData.config.height,
                lib: piximData.lib,
                resources: {},
                vars: {}
            };
            this._piximData = {
                contentID: (++_contentID).toString(),
                basepath: basepath,
                version: options.version,
                useCache: options.useCache || !1,
                $: new ContentDeliver(contentDeliverData),
                manifests: piximData.manifests,
                additionalManifests: createManifests(),
                preloadPromise: null,
                postloadPromise: null,
                contentDeliverData: contentDeliverData
            };
        }
        Emitter && (Content.__proto__ = Emitter), Content.prototype = Object.create(Emitter && Emitter.prototype), 
        Content.prototype.constructor = Content;
        var prototypeAccessors = {
            contentID: {
                configurable: !0
            },
            manifestAssetCount: {
                configurable: !0
            }
        };
        return Content.registerManifest = function(key, Manifest) {
            _manifests[key] = Manifest;
        }, Content.create = function(key) {
            if (void 0 === key && (key = ""), key && key in _contents) {
                throw new Error("Content key '" + key + "' has already exists.");
            }
            var ContentClone = function(Content) {
                function ContentClone(options) {
                    void 0 === options && (options = {}), Content.call(this, options, ContentClone._piximData);
                }
                return Content && (ContentClone.__proto__ = Content), ContentClone.prototype = Object.create(Content && Content.prototype), 
                ContentClone.prototype.constructor = ContentClone, ContentClone;
            }(Content);
            return ContentClone._piximData = {
                config: {
                    width: 450,
                    height: 800
                },
                manifests: createManifests(),
                lib: {}
            }, key ? _contents[key] = ContentClone : ContentClone;
        }, Content.get = function(key) {
            return _contents[key];
        }, Content.remove = function(key) {
            delete _contents[key];
        }, Content.defineTargets = function(key, targets, options) {
            return void 0 === options && (options = {}), this._piximData.manifests[key] ? (this._piximData.manifests[key].add(targets, options), 
            this) : (console.warn("Manifest '" + key + "' is not registered."), this);
        }, Content.defineImages = function(targets, options) {
            return void 0 === options && (options = {}), this.defineTargets("images", targets, options);
        }, Content.defineSpritesheets = function(targets, options) {
            return void 0 === options && (options = {}), this.defineTargets("spritesheets", targets, options);
        }, Content.defineSounds = function(targets, options) {
            return void 0 === options && (options = {}), this.defineTargets("sounds", targets, options);
        }, Content.defineJsons = function(targets, options) {
            return void 0 === options && (options = {}), this.defineTargets("jsons", targets, options);
        }, Content.setConfig = function(data) {
            return this._piximData.config.width = data.width, this._piximData.config.height = data.height, 
            this;
        }, Content.defineLibraries = function(data) {
            for (var i in data) {
                this._piximData.lib[i] = data[i];
            }
            return this;
        }, prototypeAccessors.contentID.get = function() {
            return this._piximData.contentID;
        }, Content.prototype.addTargets = function(key, targets, options) {
            return void 0 === options && (options = {}), this._piximData.additionalManifests[key] ? (this._piximData.additionalManifests[key].add(targets, options), 
            this) : (console.warn("Manifest '" + key + "' is not registered."), this);
        }, Content.prototype.addImages = function(data, options) {
            return void 0 === options && (options = {}), this.addTargets("images", data, options);
        }, Content.prototype.addSpritesheets = function(targets, options) {
            return void 0 === options && (options = {}), this.addTargets("spritesheets", targets, options);
        }, Content.prototype.addSounds = function(targets, options) {
            return void 0 === options && (options = {}), this.addTargets("sounds", targets, options);
        }, Content.prototype.addJsons = function(targets, options) {
            return void 0 === options && (options = {}), this.addTargets("jsons", targets, options);
        }, Content.prototype.addVars = function(data) {
            for (var i in data) {
                this._piximData.$.vars[i] = data[i];
            }
            return this;
        }, Content.prototype.prepareAsync = function() {
            var this$1 = this;
            return this.preloadClassAssetAsync().then((function() {
                return this$1.preloadInstanceAssetAsync();
            }));
        }, Content.prototype.buildAsync = function() {
            var this$1 = this;
            if (!this._piximData.$.lib.root) {
                throw new Error('There is no library named "root" in the content.');
            }
            return this.prepareAsync().then((function() {
                return new this$1._piximData.$.lib.root(this$1._piximData.$);
            }));
        }, Content.prototype.preloadClassAssetAsync = function() {
            var this$1 = this;
            return this._piximData.preloadPromise ? this._piximData.preloadPromise : this._piximData.preloadPromise = this._loadAssetAsync(this._piximData.manifests).catch((function(e) {
                throw this$1._piximData.preloadPromise = null, e;
            }));
        }, Content.prototype.preloadInstanceAssetAsync = function() {
            var this$1 = this;
            return this._piximData.postloadPromise ? this._piximData.postloadPromise : this._piximData.postloadPromise = this._loadAssetAsync(this._piximData.additionalManifests).then((function() {
                this$1._piximData.postloadPromise = null;
            })).catch((function(e) {
                throw this$1._piximData.postloadPromise = null, e;
            }));
        }, Content.prototype.destroy = function() {
            var contentDeliverData = this._piximData.contentDeliverData;
            contentDeliverData.lib = {}, contentDeliverData.vars = {};
            var manifests = this._piximData.manifests, additionalManifests = this._piximData.additionalManifests;
            for (var i in manifests) {
                manifests[i].destroyResources();
            }
            for (var i$1 in additionalManifests) {
                additionalManifests[i$1].destroyResources();
            }
            var resources = contentDeliverData.resources;
            for (var i$2 in resources) {
                resources[i$2] = {};
            }
        }, prototypeAccessors.manifestAssetCount.get = function() {
            var total = 0, manifests = this._piximData.manifests;
            for (var i in manifests) {
                total += manifests[i].count;
            }
            var additionalManifests = this._piximData.additionalManifests;
            for (var i$1 in additionalManifests) {
                total += additionalManifests[i$1].count;
            }
            return total;
        }, Content.prototype._loadAssetAsync = function(manifests) {
            var this$1 = this, basepath = this._piximData.basepath, versions = this._piximData.version, useCaches = this._piximData.useCache, resources = this._piximData.$.resources;
            if (0 === Object.keys(manifests).length) {
                return Promise.resolve();
            }
            var promises = [], keys = [];
            for (var i in manifests) {
                var type = i;
                keys.push(type);
                var version = versions[type] || "", useCache = useCaches[type] || !1, manifest = manifests[type];
                manifest.on("loaderAssetLoaded", (function(resource) {
                    this$1.emit("loaderAssetLoaded", resource);
                })), promises.push(manifest.getAsync({
                    basepath: basepath,
                    version: version,
                    useCache: useCache
                }));
            }
            return Promise.all(promises).then((function(resolver) {
                for (var i = 0; i < resolver.length; i++) {
                    for (var j in resources[keys[i]] = resources[keys[i]] || {}, resolver[i]) {
                        resources[keys[i]][j] = resolver[i][j];
                    }
                }
            }));
        }, Object.defineProperties(Content.prototype, prototypeAccessors), Content;
    }(Emitter);
    Content.registerManifest("images", TextureManifest), Content.registerManifest("spritesheets", SpritesheetManifest), 
    Content.registerManifest("sounds", SoundManifest), Content.registerManifest("jsons", JsonManifest), 
    exports.Application = Application, exports.Container = Container, exports.Content = Content, 
    exports.ContentDeliver = ContentDeliver, exports.EVENT_LOADER_ASSET_LOADED = "loaderAssetLoaded", 
    exports.Emitter = Emitter$1, exports.JsonLoader = JsonLoader, exports.JsonLoaderResource = JsonLoaderResource, 
    exports.JsonManifest = JsonManifest, exports.Layer = Layer, exports.LoaderBase = LoaderBase, 
    exports.LoaderResource = LoaderResource, exports.ManifestBase = ManifestBase, exports.SoundLoader = SoundLoader, 
    exports.SoundLoaderResource = SoundLoaderResource, exports.SoundManifest = SoundManifest, 
    exports.SpritesheetLoader = SpritesheetLoader, exports.SpritesheetLoaderResource = SpritesheetLoaderResource, 
    exports.SpritesheetManifest = SpritesheetManifest, exports.Task = Task$1, exports.TextureLoader = TextureLoader, 
    exports.TextureLoaderResource = TextureLoaderResource, exports.TextureManifest = TextureManifest, 
    exports.utils = index;
}(this.Pixim = this.Pixim || {}, PIXI, {
    Howl: "undefined" == typeof Howl ? null : Howl
});
//# sourceMappingURL=Pixim.js.map
