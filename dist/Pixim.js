/*!
 * @tawaship/pixim.js - v1.15.0
 * 
 * @require pixi.js v^5.3.2
 * @require howler.js v^2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */
!function(exports, PIXI, howler) {
    "use strict";
    function _interopNamespaceDefault(e) {
        var n = Object.create(null);
        return e && Object.keys(e).forEach((function(k) {
            if ("default" !== k) {
                var d = Object.getOwnPropertyDescriptor(e, k);
                Object.defineProperty(n, k, d.get ? d : {
                    enumerable: !0,
                    get: function() {
                        return e[k];
                    }
                });
            }
        })), n.default = e, Object.freeze(n);
    }
    window.console.log("%c pixim.js%cv1.15.0 %c", "color: #FFF; background: #03F; padding: 5px; border-radius:12px 0 0 12px; margin-top: 5px; margin-bottom: 5px;", "color: #FFF; background: #F33; padding: 5px;  border-radius:0 12px 12px 0;", "padding: 5px;");
    var PIXI__namespace = _interopNamespaceDefault(PIXI), Emitter$1 = function() {
        this._events = {};
    };
    /*!
     * @tawaship/emitter - v3.1.1
     * 
     * @author tawaship (makazu.mori@gmail.com)
     * @license MIT
     */    Emitter$1.prototype._on = function(type, callback, once) {
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
    }, Emitter$1.prototype.on = function(type, callback) {
        return this._on(type, callback, !1);
    }, Emitter$1.prototype.once = function(type, callback) {
        return this._on(type, callback, !0);
    }, Emitter$1.prototype.off = function(type, callback) {
        if (!type || !callback) {
            return this;
        }
        for (var events = this._events[type] || [], i = 0; i < events.length; i++) {
            if (events[i].callback === callback) {
                return events.splice(i, 1), this;
            }
        }
        return this;
    }, Emitter$1.prototype._emit = function(type, context) {
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
    }, Emitter$1.prototype.emit = function(type) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emit.apply(ref, [ type, this ].concat(args));
    }, Emitter$1.prototype.cemit = function(type, context) {
        for (var ref, args = [], len = arguments.length - 2; len-- > 0; ) {
            args[len] = arguments[len + 2];
        }
        return (ref = this)._emit.apply(ref, [ type, context ].concat(args));
    }, Emitter$1.prototype._emitAll = function(context) {
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
    }, Emitter$1.prototype.emitAll = function() {
        for (var ref, args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        return (ref = this)._emitAll.apply(ref, [ this ].concat(args));
    }, Emitter$1.prototype.cemitAll = function(context) {
        for (var ref, args = [], len = arguments.length - 1; len-- > 0; ) {
            args[len] = arguments[len + 1];
        }
        return (ref = this)._emitAll.apply(ref, [ context ].concat(args));
    }, Emitter$1.prototype.clear = function(type) {
        return void 0 === type && (type = ""), type ? delete this._events[type] : this._events = {}, 
        this;
    };
    var Emitter = function(_Emitter) {
        function Emitter() {
            _Emitter.apply(this, arguments);
        }
        return _Emitter && (Emitter.__proto__ = _Emitter), Emitter.prototype = Object.create(_Emitter && _Emitter.prototype), 
        Emitter.prototype.constructor = Emitter, Emitter;
    }(Emitter$1), Task$1 = function(callbacks, context) {
        this._taskData = {
            context: null == context ? this : context,
            enabled: !0,
            index: -1,
            callbacks: [],
            value: null
        }, this.add(callbacks);
    }, prototypeAccessors$2 = {
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
     */    prototypeAccessors$2.enabled.get = function() {
        return this._taskData.enabled;
    }, prototypeAccessors$2.enabled.set = function(enabled) {
        this._taskData.enabled = enabled;
    }, Task$1.prototype.add = function(callbacks) {
        Array.isArray(callbacks) || (callbacks = [ callbacks ]);
        var list = this._taskData.callbacks;
        list.length;
        for (var i = 0; i < callbacks.length; i++) {
            callbacks[i] instanceof Function && list.push(callbacks[i]);
        }
        return this;
    }, Task$1.prototype.done = function() {
        for (var args = [], len = arguments.length; len--; ) {
            args[len] = arguments[len];
        }
        if (this._taskData.enabled) {
            var task = this._taskData.callbacks[this._taskData.index];
            if (task) {
                return this._taskData.value = task.apply(this._taskData.context, args);
            }
        }
    }, Task$1.prototype._to = function(index) {
        return this._taskData.index = Number(index), this;
    }, Task$1.prototype.first = function() {
        return this._to(0);
    }, Task$1.prototype.prev = function() {
        return this._to(this._taskData.index - 1);
    }, Task$1.prototype.next = function() {
        return this._to(this._taskData.index + 1);
    }, Task$1.prototype.to = function(index) {
        return this._to(index);
    }, Task$1.prototype.finish = function() {
        return this._taskData.index = -1, this;
    }, Task$1.prototype.reset = function() {
        return this._taskData.callbacks = [], this._taskData.index = -1, this._taskData.value = null, 
        this;
    }, Task$1.prototype.destroy = function() {
        this.reset();
    }, prototypeAccessors$2.value.get = function() {
        return this._taskData.value;
    }, Object.defineProperties(Task$1.prototype, prototypeAccessors$2);
    var Task = function(_Task) {
        function Task(tasks, context) {
            _Task.call(this, tasks, context), this.enabled = !0, this._piximData = {
                emitter: new Emitter
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
    }(Task$1), Container = function(PixiContainer) {
        function Container() {
            PixiContainer.call(this), this._piximData = {
                task: new Task([], this),
                taskEnabledChildren: !0
            }, this._piximData.task.first();
        }
        PixiContainer && (Container.__proto__ = PixiContainer), Container.prototype = Object.create(PixiContainer && PixiContainer.prototype), 
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
            PixiContainer.prototype.destroy.apply(this, args), this._piximData.task.destroy();
        }, Object.defineProperties(Container.prototype, prototypeAccessors), Container;
    }(PIXI.Container), Layer = function(PixiContainer) {
        function Layer() {
            PixiContainer.apply(this, arguments);
        }
        return PixiContainer && (Layer.__proto__ = PixiContainer), Layer.prototype = Object.create(PixiContainer && PixiContainer.prototype), 
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
            var this$1$1 = this;
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
                taskHandler(this$1$1._piximData.app.stage, {
                    delta: delta
                });
            })), autoAdjust && (this.autoAdjuster = !0 === autoAdjust ? function() {
                this$1$1.fullScreen();
            } : function() {
                autoAdjust(this$1$1);
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
            var this$1$1 = this;
            return void 0 === layerName && (layerName = "anonymous"), content.buildAsync().then((function(root) {
                return this$1$1.detach(content), this$1$1.addLayer(layerName), this$1$1._piximData.roots[content.contentID] = root, 
                this$1$1._piximData.contents[content.contentID] = content, this$1$1._piximData.layers[layerName].addChild(root), 
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
    }(Emitter), ManifestBase = function(Emitter) {
        function ManifestBase(type) {
            Emitter.call(this), this._data = {}, this._resources = {}, this._type = type;
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
            var this$1$1 = this, res = {};
            if (0 === Object.keys(this._data).length) {
                return Promise.resolve(res);
            }
            var loader = this._createLoader();
            loader.onLoaded = function(resource) {
                this$1$1.emit("loaderAssetLoaded", resource);
            };
            var type, xhr, loaderOptions = Object.assign({}, options.typeOptions, {
                basepath: options.basepath,
                version: options.version,
                xhr: (type = this._type, xhr = options.xhr, "function" == typeof xhr ? function(url) {
                    return xhr(type, url);
                } : xhr)
            }), data = {};
            for (var i in this._data) {
                data[i] = this._data[i].target;
            }
            return loader.loadAllAsync(data, loaderOptions).then((function(resources) {
                for (var i in resources) {
                    var resource = resources[i];
                    if (resource.error && !this$1$1._data[i].unrequired) {
                        throw resource.error;
                    }
                }
                for (var i$1 in resources) {
                    var resource$1 = resources[i$1];
                    this$1$1._resources[i$1] = resource$1, res[i$1] = resource$1.data;
                }
                return res;
            }));
        }, ManifestBase.prototype.destroyResources = function() {
            for (var i in this._resources) {
                this._resources[i].destroy();
            }
        }, Object.defineProperties(ManifestBase.prototype, prototypeAccessors), ManifestBase;
    }(Emitter$1);
    function resolveUri(basepath, uri, version) {
        if ("string" != typeof uri) {
            return uri;
        }
        if (!isUrl(uri)) {
            return uri;
        }
        version = version || "";
        var preUri = resolvePath(basepath = basepath || "", uri);
        return version ? resolveQuery(preUri, {
            _fv: version
        }) : preUri;
    }
    function resolvePath(basepath, path) {
        return isUrl(path) ? PIXI__namespace.utils.url.resolve(basepath, path) : path;
    }
    function isUrl(uri) {
        return 0 !== uri.indexOf("data:") && 0 !== uri.indexOf("blob:");
    }
    function resolveQuery(uri, queries) {
        if (isUrl(uri)) {
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
        return uri;
    }
    var index = Object.freeze({
        __proto__: null,
        isUrl: isUrl,
        resolvePath: resolvePath,
        resolveQuery: resolveQuery,
        resolveUri: resolveUri
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
    var LoaderBase = function() {};
    LoaderBase.prototype.loadAsync = function(target, options) {
        var this$1$1 = this;
        return this$1$1._loadAsync(target, options).then((function(resource) {
            return resource.error || this$1$1.onLoaded && this$1$1.onLoaded(resource), resource;
        }));
    }, LoaderBase.prototype.loadAllAsync = function(targets, options) {
        var this$1$1 = this, res = {};
        if (0 === Object.keys(targets).length) {
            return Promise.resolve(res);
        }
        var promises = [], loop = function(i) {
            promises.push(this$1$1.loadAsync(targets[i], options).then((function(resource) {
                res[i] = resource;
            })));
        };
        for (var i in targets) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return res;
        }));
    }, LoaderBase.prototype._resolveParams = function(target, options) {
        void 0 === options && (options = {});
        var src = resolveUri(options.basepath || "", target, options.version || "");
        return "string" != typeof src ? {
            src: src
        } : isUrl(src) && options.xhr ? !0 === options.xhr ? {
            src: src,
            xhr: {}
        } : "function" == typeof options.xhr ? {
            src: src,
            xhr: options.xhr(src)
        } : {
            src: src,
            xhr: options.xhr || {}
        } : {
            src: src
        };
    };
    var BlobLoaderResource = function(LoaderResource) {
        function BlobLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (BlobLoaderResource.__proto__ = LoaderResource), BlobLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        BlobLoaderResource.prototype.constructor = BlobLoaderResource, BlobLoaderResource.prototype.destroy = function() {
            (window.URL || window.webkitURL).revokeObjectURL(this._data), this._data = "";
        }, BlobLoaderResource;
    }(LoaderResource), BlobLoader = function(LoaderBase) {
        function BlobLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (BlobLoader.__proto__ = LoaderBase), BlobLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        BlobLoader.prototype.constructor = BlobLoader, BlobLoader.prototype._loadAsync = function(target, options) {
            var data, src, xhr;
            return void 0 === options && (options = {}), (data = this._resolveParams(target, options), 
            src = data.src, xhr = data.xhr, xhr ? fetch(src, xhr.requestOptions || {}) : fetch(src)).then((function(res) {
                if (!res.ok) {
                    throw res.statusText;
                }
                return res.blob();
            })).then((function(blob) {
                return (window.URL || window.webkitURL).createObjectURL(blob);
            })).then((function(uri) {
                return new BlobLoaderResource(uri, null);
            })).catch((function(e) {
                return new BlobLoaderResource("", e);
            }));
        }, BlobLoader;
    }(LoaderBase), TextureLoaderResource = function(LoaderResource) {
        function TextureLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (TextureLoaderResource.__proto__ = LoaderResource), TextureLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        TextureLoaderResource.prototype.constructor = TextureLoaderResource, TextureLoaderResource.prototype.destroy = function() {
            this._data && (TextureLoaderResource.removeCache(this._data), this._data.destroy(!0), 
            this._data = null);
        }, TextureLoaderResource.removeCache = function(texture) {
            PIXI.Texture.removeFromCache(texture), texture.baseTexture && PIXI.BaseTexture.removeFromCache(texture.baseTexture);
        }, TextureLoaderResource;
    }(LoaderResource), TextureLoader = function(LoaderBase) {
        function TextureLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (TextureLoader.__proto__ = LoaderBase), TextureLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        TextureLoader.prototype.constructor = TextureLoader, TextureLoader.prototype._loadAsync = function(target, options) {
            var data, src, xhr, this$1$1 = this;
            return void 0 === options && (options = {}), (data = this$1$1._resolveParams(target, options), 
            src = data.src, xhr = data.xhr, xhr ? (new BlobLoader).loadAsync(src, {
                xhr: xhr
            }).then((function(resource) {
                if (resource.error) {
                    throw resource.error;
                }
                if (!resource.data) {
                    throw "invalid resource";
                }
                return this$1$1._loadBaseTextureAsync(resource.data);
            })) : this$1$1._loadBaseTextureAsync(src)).then((function(baseTexture) {
                return new TextureLoaderResource(new PIXI.Texture(baseTexture), null);
            })).catch((function(e) {
                return new TextureLoaderResource(null, e);
            }));
        }, TextureLoader.prototype._loadBaseTextureAsync = function(target) {
            return (target instanceof HTMLImageElement || target instanceof HTMLVideoElement) && (target.crossOrigin = "anonymous"), 
            new Promise((function(resolve, reject) {
                var bt = PIXI.BaseTexture.from(target);
                if (bt.valid) {
                    return PIXI.BaseTexture.removeFromCache(bt), void resolve(bt);
                }
                bt.on("loaded", (function(baseTexture) {
                    PIXI.BaseTexture.removeFromCache(baseTexture), resolve(baseTexture);
                })), bt.on("error", (function(baseTexture, e) {
                    PIXI.BaseTexture.removeFromCache(baseTexture), reject(e);
                }));
            }));
        }, TextureLoader;
    }(LoaderBase), JsLoaderResource = function(LoaderResource) {
        function JsLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (JsLoaderResource.__proto__ = LoaderResource), JsLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        JsLoaderResource.prototype.constructor = JsLoaderResource, JsLoaderResource.prototype.destroy = function() {
            this._data = "";
        }, JsLoaderResource.prototype.ref = function() {
            document.body.appendChild(document.createElement("script")).text = this._data;
        }, JsLoaderResource;
    }(LoaderResource), JsLoader = function(LoaderBase) {
        function JsLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (JsLoader.__proto__ = LoaderBase), JsLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        JsLoader.prototype.constructor = JsLoader, JsLoader.prototype._loadAsync = function(target, options) {
            var data, src, xhr;
            return void 0 === options && (options = {}), (data = this._resolveParams(target, options), 
            src = data.src, xhr = data.xhr, xhr ? fetch(src, xhr.requestOptions || {}) : fetch(src)).then((function(res) {
                if (!res.ok) {
                    throw res.statusText;
                }
                return res.text();
            })).then((function(text) {
                return new JsLoaderResource(text, null);
            })).catch((function(e) {
                return new JsLoaderResource("", e);
            }));
        }, JsLoader;
    }(LoaderBase), JsonLoaderResource = function(LoaderResource) {
        function JsonLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (JsonLoaderResource.__proto__ = LoaderResource), JsonLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        JsonLoaderResource.prototype.constructor = JsonLoaderResource, JsonLoaderResource.prototype.destroy = function() {
            this._data = {};
        }, JsonLoaderResource;
    }(LoaderResource), JsonLoader = function(LoaderBase) {
        function JsonLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (JsonLoader.__proto__ = LoaderBase), JsonLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        JsonLoader.prototype.constructor = JsonLoader, JsonLoader.prototype._loadAsync = function(target, options) {
            var data, src, xhr;
            return void 0 === options && (options = {}), (data = this._resolveParams(target, options), 
            src = data.src, xhr = data.xhr, xhr ? fetch(src, xhr.requestOptions) : fetch(src)).then((function(res) {
                if (!res.ok) {
                    throw res.statusText;
                }
                return res.json();
            })).then((function(json) {
                return new JsonLoaderResource(json, null);
            })).catch((function(e) {
                return new JsonLoaderResource({}, e);
            }));
        }, JsonLoader;
    }(LoaderBase), SpritesheetLoaderResource = function(LoaderResource) {
        function SpritesheetLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (SpritesheetLoaderResource.__proto__ = LoaderResource), 
        SpritesheetLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        SpritesheetLoaderResource.prototype.constructor = SpritesheetLoaderResource, SpritesheetLoaderResource.prototype.destroy = function() {
            for (var i in this._data) {
                this._data[i].destroy(!0);
            }
            this._data = {};
        }, SpritesheetLoaderResource;
    }(LoaderResource), SpritesheetLoader = function(LoaderBase) {
        function SpritesheetLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (SpritesheetLoader.__proto__ = LoaderBase), SpritesheetLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        SpritesheetLoader.prototype.constructor = SpritesheetLoader, SpritesheetLoader.prototype._loadAsync = function(target, options) {
            var this$1$1 = this;
            return void 0 === options && (options = {}), ("string" != typeof target ? this$1$1._loadTextureAsync(target, options) : this$1$1._loadJsonAsync(target, options)).then((function(textures) {
                return new SpritesheetLoaderResource(textures, null);
            })).catch((function(e) {
                return new SpritesheetLoaderResource({}, e);
            }));
        }, SpritesheetLoader.prototype._loadJsonAsync = function(url, options) {
            var this$1$1 = this;
            return (new JsonLoader).loadAsync(url, options).then((function(resource) {
                if (resource.error) {
                    throw resource.error;
                }
                if (!resource.data) {
                    throw "invalid resource";
                }
                var json = resource.data;
                if (!json.meta || !json.meta.image || !json.frames) {
                    throw "invalid json";
                }
                json.meta.image = resolveUri(url, json.meta.image);
                var data = {
                    frames: json.frames,
                    meta: json.meta
                };
                return this$1$1._loadTextureAsync(data, options);
            }));
        }, SpritesheetLoader.prototype._loadTextureAsync = function(json, options) {
            return (new TextureLoader).loadAsync(json.meta.image, Object.assign({}, options, {
                version: options.textureVersion || options.version
            })).then((function(resource) {
                if (resource.error) {
                    throw resource.error;
                }
                if (!resource.data) {
                    throw "invalid resource";
                }
                var ss = new PIXI.Spritesheet(resource.data, json);
                return new Promise((function(resolve) {
                    ss.parse((function(e) {
                        for (var i in ss.textures) {
                            TextureLoaderResource.removeCache(ss.textures[i]);
                        }
                        resolve(ss.textures);
                    }));
                }));
            }));
        }, SpritesheetLoader;
    }(LoaderBase), SoundLoaderResource = function(LoaderResource) {
        function SoundLoaderResource() {
            LoaderResource.apply(this, arguments);
        }
        return LoaderResource && (SoundLoaderResource.__proto__ = LoaderResource), SoundLoaderResource.prototype = Object.create(LoaderResource && LoaderResource.prototype), 
        SoundLoaderResource.prototype.constructor = SoundLoaderResource, SoundLoaderResource.prototype.destroy = function() {
            this._data && (this._data.stop(), this._data.unload(), this._data = null);
        }, SoundLoaderResource;
    }(LoaderResource), SoundLoader = function(LoaderBase) {
        function SoundLoader() {
            LoaderBase.apply(this, arguments);
        }
        return LoaderBase && (SoundLoader.__proto__ = LoaderBase), SoundLoader.prototype = Object.create(LoaderBase && LoaderBase.prototype), 
        SoundLoader.prototype.constructor = SoundLoader, SoundLoader.prototype._loadAsync = function(target, options) {
            var data, src, xhr;
            return void 0 === options && (options = {}), (data = this._resolveParams(target, options), 
            src = data.src, xhr = data.xhr, new Promise(xhr ? function(resolve, reject) {
                var howl = new howler.Howl({
                    src: src,
                    onload: function() {
                        resolve(howl);
                    },
                    onloaderror: function() {
                        var e = new Error("invalid resource: " + src);
                        reject(e);
                    },
                    xhr: xhr.requestOptions || {}
                });
            } : function(resolve, reject) {
                var howl = new howler.Howl({
                    src: src,
                    onload: function() {
                        resolve(howl);
                    },
                    onloaderror: function() {
                        var e = new Error("invalid resource: " + src);
                        reject(e);
                    }
                });
            })).then((function(howl) {
                return new SoundLoaderResource(howl, null);
            })).catch((function(e) {
                return new SoundLoaderResource(null, e);
            }));
        }, SoundLoader;
    }(LoaderBase), TextureManifest = function(ManifestBase) {
        function TextureManifest() {
            ManifestBase.apply(this, arguments);
        }
        return ManifestBase && (TextureManifest.__proto__ = ManifestBase), TextureManifest.prototype = Object.create(ManifestBase && ManifestBase.prototype), 
        TextureManifest.prototype.constructor = TextureManifest, TextureManifest.prototype._createLoader = function() {
            return new TextureLoader;
        }, TextureManifest;
    }(ManifestBase), SpritesheetManifest = function(ManifestBase) {
        function SpritesheetManifest() {
            ManifestBase.apply(this, arguments);
        }
        return ManifestBase && (SpritesheetManifest.__proto__ = ManifestBase), SpritesheetManifest.prototype = Object.create(ManifestBase && ManifestBase.prototype), 
        SpritesheetManifest.prototype.constructor = SpritesheetManifest, SpritesheetManifest.prototype._createLoader = function() {
            return new SpritesheetLoader;
        }, SpritesheetManifest;
    }(ManifestBase), SoundManifest = function(ManifestBase) {
        function SoundManifest() {
            ManifestBase.apply(this, arguments);
        }
        return ManifestBase && (SoundManifest.__proto__ = ManifestBase), SoundManifest.prototype = Object.create(ManifestBase && ManifestBase.prototype), 
        SoundManifest.prototype.constructor = SoundManifest, SoundManifest.prototype._createLoader = function() {
            return new SoundLoader;
        }, SoundManifest;
    }(ManifestBase), JsonManifest = function(ManifestBase) {
        function JsonManifest() {
            ManifestBase.apply(this, arguments);
        }
        return ManifestBase && (JsonManifest.__proto__ = ManifestBase), JsonManifest.prototype = Object.create(ManifestBase && ManifestBase.prototype), 
        JsonManifest.prototype.constructor = JsonManifest, JsonManifest.prototype._createLoader = function() {
            return new JsonLoader;
        }, JsonManifest;
    }(ManifestBase), ContentDeliver = function(data) {
        this._piximData = {
            width: data.width,
            height: data.height,
            lib: data.lib,
            resources: data.resources,
            vars: data.vars
        };
    }, prototypeAccessors = {
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
    prototypeAccessors.width.get = function() {
        return this._piximData.width;
    }, prototypeAccessors.height.get = function() {
        return this._piximData.height;
    }, prototypeAccessors.lib.get = function() {
        return this._piximData.lib;
    }, prototypeAccessors.resources.get = function() {
        return this._piximData.resources;
    }, prototypeAccessors.vars.get = function() {
        return this._piximData.vars;
    }, Object.defineProperties(ContentDeliver.prototype, prototypeAccessors);
    var _contents = {}, _contentID = 0;
    function createManifests() {
        var res = {
            images: new TextureManifest("images"),
            spritesheets: new SpritesheetManifest("spritesheets"),
            sounds: new SoundManifest("sounds"),
            jsons: new JsonManifest("jsons")
        };
        for (var i in _externalManifestClasses) {
            res[i] = new _externalManifestClasses[i](i);
        }
        return res;
    }
    var _externalManifestClasses = {
        images: TextureManifest,
        spritesheets: SpritesheetManifest,
        sounds: SoundManifest,
        jsons: JsonManifest
    }, Content = function(Emitter) {
        function Content(options, piximData) {
            var this$1$1 = this;
            void 0 === options && (options = {}), void 0 === piximData && (piximData = Content._piximData), 
            Emitter.call(this), this._loadedResourceHandler = function(data) {
                this$1$1.emit("loaderAssetLoaded", data);
            };
            var contentDeliverData = {
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
            for (var i in this._piximData = {
                contentID: (++_contentID).toString(),
                options: options,
                $: new ContentDeliver(contentDeliverData),
                manifests: piximData.manifests,
                additionalManifests: createManifests(),
                preloadPromise: null,
                postloadPromise: null,
                contentDeliverData: contentDeliverData
            }, this._piximData.manifests) {
                this._piximData.manifests[i].on("loaderAssetLoaded", this._loadedResourceHandler);
            }
            for (var i$1 in this._piximData.additionalManifests) {
                this._piximData.additionalManifests[i$1].on("loaderAssetLoaded", this._loadedResourceHandler);
            }
        }
        Emitter && (Content.__proto__ = Emitter), Content.prototype = Object.create(Emitter && Emitter.prototype), 
        Content.prototype.constructor = Content;
        var prototypeAccessors = {
            contentID: {
                configurable: !0
            },
            classAssetCount: {
                configurable: !0
            },
            instanceAssetCount: {
                configurable: !0
            },
            assetCount: {
                configurable: !0
            }
        };
        return Content.registerManifest = function(key, Manifest) {
            _externalManifestClasses[key] = Manifest;
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
            var this$1$1 = this;
            return this.preloadClassAssetAsync().then((function() {
                return this$1$1.preloadInstanceAssetAsync();
            }));
        }, Content.prototype.buildAsync = function() {
            var this$1$1 = this;
            if (!this._piximData.$.lib.root) {
                throw new Error('There is no library named "root" in the content.');
            }
            return this.prepareAsync().then((function() {
                return new this$1$1._piximData.$.lib.root(this$1$1._piximData.$);
            }));
        }, Content.prototype.preloadClassAssetAsync = function() {
            var this$1$1 = this;
            return this._piximData.preloadPromise ? this._piximData.preloadPromise : this._piximData.preloadPromise = this._loadAssetAsync(this._piximData.manifests).catch((function(e) {
                throw this$1$1._piximData.preloadPromise = null, e;
            }));
        }, Content.prototype.preloadInstanceAssetAsync = function() {
            var this$1$1 = this;
            return this._piximData.postloadPromise ? this._piximData.postloadPromise : this._piximData.postloadPromise = this._loadAssetAsync(this._piximData.additionalManifests).catch((function(e) {
                throw this$1$1._piximData.postloadPromise = null, e;
            }));
        }, Content.prototype.destroy = function() {
            var contentDeliverData = this._piximData.contentDeliverData;
            contentDeliverData.lib = {}, contentDeliverData.vars = {};
            var manifests = this._piximData.manifests, additionalManifests = this._piximData.additionalManifests;
            for (var i in manifests) {
                manifests[i].off("loaderAssetLoaded", this._loadedResourceHandler);
            }
            for (var i$1 in additionalManifests) {
                additionalManifests[i$1].off("loaderAssetLoaded", this._loadedResourceHandler);
            }
            var resources = contentDeliverData.resources;
            for (var i$2 in resources) {
                resources[i$2] = {};
            }
        }, prototypeAccessors.classAssetCount.get = function() {
            var total = 0, manifests = this._piximData.manifests;
            for (var i in manifests) {
                total += manifests[i].count;
            }
            return total;
        }, prototypeAccessors.instanceAssetCount.get = function() {
            var total = 0, additionalManifests = this._piximData.additionalManifests;
            for (var i in additionalManifests) {
                total += additionalManifests[i].count;
            }
            return total;
        }, prototypeAccessors.assetCount.get = function() {
            return this.classAssetCount + this.instanceAssetCount;
        }, Content.prototype._loadAssetAsync = function(manifests) {
            if (0 === Object.keys(manifests).length) {
                return Promise.resolve();
            }
            var options = this._piximData.options, basepath = function() {
                if (void 0 === options.basepath) {
                    var basepath$1 = {};
                    for (var i in manifests) {
                        basepath$1[i] = "";
                    }
                    return basepath$1;
                }
                if ("string" == typeof options.basepath) {
                    var basepath$2 = {};
                    for (var i$1 in manifests) {
                        basepath$2[i$1] = options.basepath.replace(/(.+[^\/])$/, "$1/");
                    }
                    return basepath$2;
                }
                var basepath = {};
                for (var i$2 in manifests) {
                    basepath[i$2] = (options.basepath[i$2] || "").replace(/(.+[^\/])$/, "$1/");
                }
                return basepath;
            }(), version = function() {
                if (void 0 === options.version) {
                    var version$1 = {};
                    for (var i in manifests) {
                        version$1[i] = "";
                    }
                    return version$1;
                }
                if ("string" == typeof options.version || "number" == typeof options.version) {
                    var version$2 = {};
                    for (var i$1 in manifests) {
                        version$2[i$1] = options.version;
                    }
                    return version$2;
                }
                var version = {};
                for (var i$2 in manifests) {
                    version[i$2] = options.version[i$2] || "";
                }
                return version;
            }(), xhr = function() {
                var xhr = {};
                for (var i in manifests) {
                    xhr[i] = options.xhr || !1;
                }
                return xhr;
            }(), typeOptions = function() {
                if (void 0 === options.typeOptions) {
                    var typeOptions$1 = {};
                    for (var i in manifests) {
                        typeOptions$1[i] = {};
                    }
                    return typeOptions$1;
                }
                var typeOptions = {};
                for (var i$1 in manifests) {
                    typeOptions[i$1] = options.typeOptions[i$1] || {};
                }
                return typeOptions;
            }(), loaderOptions = {};
            for (var i in manifests) {
                loaderOptions[i] = {
                    basepath: basepath[i],
                    version: version[i],
                    xhr: xhr[i],
                    typeOptions: typeOptions[i]
                };
            }
            var resources = this._piximData.$.resources, promises = [], keys = [];
            for (var i$1 in manifests) {
                keys.push(i$1);
                var manifest = manifests[i$1];
                promises.push(manifest.getAsync(loaderOptions[i$1]));
            }
            return Promise.all(promises).then((function(resolver) {
                for (var i = 0; i < resolver.length; i++) {
                    for (var j in resources[keys[i]] = resources[keys[i]] || {}, resolver[i]) {
                        resources[keys[i]][j] = resolver[i][j];
                    }
                }
            }));
        }, Object.defineProperties(Content.prototype, prototypeAccessors), Content;
    }(Emitter$1);
    Content.registerManifest("images", TextureManifest), Content.registerManifest("spritesheets", SpritesheetManifest), 
    Content.registerManifest("sounds", SoundManifest), Content.registerManifest("jsons", JsonManifest), 
    exports.Application = Application, exports.BlobLoader = BlobLoader, exports.BlobLoaderResource = BlobLoaderResource, 
    exports.Container = Container, exports.Content = Content, exports.ContentDeliver = ContentDeliver, 
    exports.EVENT_LOADER_ASSET_LOADED = "loaderAssetLoaded", exports.Emitter = Emitter, 
    exports.JsLoader = JsLoader, exports.JsLoaderResource = JsLoaderResource, exports.JsonLoader = JsonLoader, 
    exports.JsonLoaderResource = JsonLoaderResource, exports.JsonManifest = JsonManifest, 
    exports.Layer = Layer, exports.LoaderBase = LoaderBase, exports.LoaderResource = LoaderResource, 
    exports.ManifestBase = ManifestBase, exports.SoundLoader = SoundLoader, exports.SoundLoaderResource = SoundLoaderResource, 
    exports.SoundManifest = SoundManifest, exports.SpritesheetLoader = SpritesheetLoader, 
    exports.SpritesheetLoaderResource = SpritesheetLoaderResource, exports.SpritesheetManifest = SpritesheetManifest, 
    exports.Task = Task, exports.TextureLoader = TextureLoader, exports.TextureLoaderResource = TextureLoaderResource, 
    exports.TextureManifest = TextureManifest, exports.utils = index;
}(this.Pixim = this.Pixim || {}, PIXI, {
    Howl: "undefined" == typeof Howl ? null : Howl
});
//# sourceMappingURL=Pixim.js.map
