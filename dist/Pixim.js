/*!
 * @tawaship/pixim.js - v1.12.2
 * 
 * @require pixi.js v^5.3.2
 * @require howler.js v^2.2.0 (If use sound)
 * @author tawaship (makazu.mori@gmail.com)
 * @license MIT
 */
!function(exports, PIXI, howler) {
    "use strict";
    window.console.log("%c pixim.js%cv1.12.2 %c", "color: #FFF; background: #03F; padding: 5px; border-radius:12px 0 0 12px; margin-top: 5px; margin-bottom: 5px;", "color: #FFF; background: #F33; padding: 5px;  border-radius:0 12px 12px 0;", "padding: 5px;");
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
        return 0 === path.indexOf("http://") || 0 === path.indexOf("https://") ? path : PIXI.utils.url.resolve(basepath, path);
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
    var ContentManifestBase = function() {
        this._manifests = {};
    };
    function loadImagesFromUrisAsync(manifests, basepath, version, useCache) {
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve({});
        }
        var loader = new PIXI.Loader;
        version && (loader.defaultQueryString = "_fv=" + version);
        var res = {};
        for (var i in manifests) {
            var uri = resolvePath(manifests[i].data, basepath);
            loader.add(i, uri, {
                crossOrigin: !0
            });
        }
        return useCache || loader.use((function(resource, next) {
            resource.texture && (PIXI.Texture.removeFromCache(resource.texture), resource.texture.baseTexture && PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture)), 
            next();
        })), new Promise((function(resolve, reject) {
            loader.load((function(loader, resources) {
                for (var i in resources) {
                    var resource = resources[i];
                    if (!resource) {
                        return void reject(i);
                    }
                    if (resource.error && !manifests[i].unrequired) {
                        return void reject(i);
                    }
                    res[i] = {
                        resource: resource.texture,
                        error: !!resource.error
                    };
                }
                resolve(res);
            }));
        }));
    }
    function loadImagesFromElementsAsync(manifests, version) {
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve({});
        }
        var res = {}, promises = [], loop = function(i) {
            promises.push(loadImageFromElementAsync(manifests[i], version).then((function(resource) {
                res[i] = resource;
            })).catch((function() {
                throw i;
            })));
        };
        for (var i in manifests) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return res;
        }));
    }
    function loadImageFromElementAsync(manifest, version) {
        manifest.data;
        manifest.data.crossOrigin = "anonymous";
        var preUri = manifest.data.src, uri = version ? resolveQuery(preUri, {
            _fv: version
        }) : preUri;
        return manifest.data.src = uri, loadImageAsync(manifest);
    }
    function loadImagesFromDataUrisAsync(manifests) {
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve({});
        }
        var res = {}, promises = [], loop = function(i) {
            promises.push(loadImageAsync(manifests[i]).then((function(resource) {
                res[i] = resource;
            })).catch((function() {
                throw i;
            })));
        };
        for (var i in manifests) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return res;
        }));
    }
    function loadImageAsync(manifest) {
        return new Promise((function(resolve, reject) {
            var bt = PIXI.BaseTexture.from(manifest.data);
            bt.valid ? resolve({
                resource: new PIXI.Texture(bt),
                error: !1
            }) : (bt.on("loaded", (function(baseTexture) {
                resolve({
                    resource: new PIXI.Texture(baseTexture),
                    error: !1
                });
            })), bt.on("error", (function(baseTexture, e) {
                manifest.unrequired ? resolve({
                    resource: new PIXI.Texture(baseTexture),
                    error: !0
                }) : reject();
            })));
        }));
    }
    ContentManifestBase.prototype.add = function(manifests, options) {
        void 0 === options && (options = {});
        var unrequired = options.unrequired || !1;
        for (var i in manifests) {
            this._manifests[i] = {
                data: manifests[i],
                unrequired: unrequired
            };
        }
    }, ContentManifestBase.prototype.getAsync = function(basepath, version, useCache) {
        var resources = {};
        return 0 === Object.keys(this._manifests).length ? Promise.resolve(resources) : this._loadAsync(basepath, version, useCache).then((function(res) {
            for (var i in res) {
                resources[i] = res[i].resource;
            }
            return resources;
        }));
    }, ContentManifestBase.prototype._resolvePath = function(path, basepath) {
        return resolvePath(path, basepath);
    }, ContentManifestBase.prototype._resolveQuery = function(uri, queries) {
        return resolveQuery(uri, queries);
    };
    var ContentImageManifest = function(ContentManifestBase) {
        function ContentImageManifest() {
            ContentManifestBase.apply(this, arguments);
        }
        return ContentManifestBase && (ContentImageManifest.__proto__ = ContentManifestBase), 
        ContentImageManifest.prototype = Object.create(ContentManifestBase && ContentManifestBase.prototype), 
        ContentImageManifest.prototype.constructor = ContentImageManifest, ContentImageManifest.prototype._loadAsync = function(basepath, version, useCache) {
            var manifests = this._manifests, elements = {}, dataUris = {}, uris = {};
            for (var i in manifests) {
                var manifest = manifests[i];
                manifest.data instanceof HTMLImageElement ? elements[i] = {
                    data: manifest.data,
                    unrequired: manifest.unrequired
                } : "string" == typeof manifest.data && (0 === manifest.data.indexOf("data:") ? dataUris[i] = {
                    data: manifest.data,
                    unrequired: manifest.unrequired
                } : uris[i] = {
                    data: manifest.data,
                    unrequired: manifest.unrequired
                });
            }
            return Promise.all([ loadImagesFromElementsAsync(elements, version), loadImagesFromDataUrisAsync(dataUris), loadImagesFromUrisAsync(uris, basepath, version, useCache) ]).then((function(resolvers) {
                return Object.assign.apply(Object, [ {} ].concat(resolvers));
            })).catch((function(key) {
                throw new Error("Image: '" + key + "' cannot load.");
            }));
        }, ContentImageManifest.prototype.destroyResources = function(resources) {}, ContentImageManifest;
    }(ContentManifestBase);
    function loadSpritesheetsFromUrisAsync(manifests, basepath, version, useCache) {
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve({});
        }
        var loader = new PIXI.Loader;
        version && (loader.defaultQueryString = "_fv=" + version);
        var res = {};
        for (var i in manifests) {
            var uri = resolvePath(manifests[i].data, basepath);
            loader.add(i, uri, {
                crossOrigin: !0
            });
        }
        return useCache || loader.use((function(resource, next) {
            if (resource.textures) {
                for (var i in resource.textures) {
                    var texture = resource.textures[i];
                    texture && (PIXI.Texture.removeFromCache(texture), texture.baseTexture && PIXI.BaseTexture.removeFromCache(texture.baseTexture));
                }
            }
            resource.texture && (PIXI.Texture.removeFromCache(resource.texture), resource.texture.baseTexture && PIXI.BaseTexture.removeFromCache(resource.texture.baseTexture)), 
            next();
        })), new Promise((function(resolve, reject) {
            loader.load((function(loader, resources) {
                for (var i in resources) {
                    if (manifests[i]) {
                        var resource = resources[i];
                        if (!resource) {
                            return void reject(i);
                        }
                        var textures = resource.textures || {};
                        if (resource.error && !manifests[i].unrequired) {
                            return void reject(i);
                        }
                        res[i] = {
                            resource: textures,
                            error: !!resource.error
                        };
                    }
                }
                resolve(res);
            }));
        }));
    }
    function loadSpritesheetsFromJsonsAsync(manifests, basepath, version) {
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve({});
        }
        var res = {}, promises = [], loop = function(i) {
            var manifest = manifests[i], data = manifest.data.meta.image, unrequired = manifest.unrequired;
            promises.push(function() {
                if (data instanceof HTMLImageElement) {
                    return loadImageFromElementAsync({
                        data: data,
                        unrequired: unrequired
                    }, version);
                }
                if ("string" == typeof data) {
                    if (0 === data.indexOf("data:")) {
                        return loadImageAsync({
                            data: data,
                            unrequired: unrequired
                        });
                    }
                    var preUri = resolvePath(data, basepath);
                    return loadImageAsync({
                        data: version ? resolveQuery(preUri, {
                            _fv: version
                        }) : preUri,
                        unrequired: unrequired
                    });
                }
                return Promise.reject();
            }().then((function(resource) {
                var ss = new PIXI.Spritesheet(resource.resource, manifest.data);
                return new Promise((function(resolve) {
                    ss.parse((function() {
                        res[i] = {
                            resource: ss.textures,
                            error: !1
                        }, resolve();
                    }));
                }));
            })).catch((function() {
                throw i;
            })));
        };
        for (var i in manifests) {
            loop(i);
        }
        return Promise.all(promises).then((function() {
            return res;
        }));
    }
    var ContentSpritesheetManifest = function(ContentManifestBase) {
        function ContentSpritesheetManifest() {
            ContentManifestBase.apply(this, arguments);
        }
        return ContentManifestBase && (ContentSpritesheetManifest.__proto__ = ContentManifestBase), 
        ContentSpritesheetManifest.prototype = Object.create(ContentManifestBase && ContentManifestBase.prototype), 
        ContentSpritesheetManifest.prototype.constructor = ContentSpritesheetManifest, ContentSpritesheetManifest.prototype._loadAsync = function(basepath, version, useCache) {
            var manifests = this._manifests, jsons = {}, uris = {};
            for (var i in manifests) {
                var manifest = manifests[i];
                "object" == typeof manifest.data ? jsons[i] = {
                    data: manifest.data,
                    unrequired: manifest.unrequired
                } : "string" == typeof manifest.data && (uris[i] = {
                    data: manifest.data,
                    unrequired: manifest.unrequired
                });
            }
            return Promise.all([ loadSpritesheetsFromJsonsAsync(jsons, basepath, version), loadSpritesheetsFromUrisAsync(uris, basepath, version, useCache) ]).then((function(resolvers) {
                return Object.assign.apply(Object, [ {} ].concat(resolvers));
            })).catch((function(key) {
                throw new Error("Spritesheet: '" + key + "' cannot load.");
            }));
        }, ContentSpritesheetManifest.prototype.destroyResources = function(resources) {}, 
        ContentSpritesheetManifest;
    }(ContentManifestBase), ContentSoundManifest = function(ContentManifestBase) {
        function ContentSoundManifest() {
            ContentManifestBase.apply(this, arguments);
        }
        return ContentManifestBase && (ContentSoundManifest.__proto__ = ContentManifestBase), 
        ContentSoundManifest.prototype = Object.create(ContentManifestBase && ContentManifestBase.prototype), 
        ContentSoundManifest.prototype.constructor = ContentSoundManifest, ContentSoundManifest.prototype._loadAsync = function(basepath, version, useCache) {
            var this$1 = this, manifests = this._manifests;
            return howler.Howl ? new Promise((function(resolve, reject) {
                var res = {};
                function loadedHandler(key, howl, error) {
                    res[key] = {
                        resource: howl,
                        error: error
                    }, ++loadedCount < loadCount || resolve(res);
                }
                var loadCount = 0, loadedCount = 0;
                for (var i in manifests) {
                    ++loadCount;
                }
                var loop = function(i) {
                    var _i = i$1, manifest = manifests[_i], preUrl = this$1._resolvePath(manifest.data, basepath), url = version ? this$1._resolveQuery(preUrl, {
                        _fv: version
                    }) : preUrl, howl = new howler.Howl({
                        src: url,
                        onload: function() {
                            loadedHandler(_i, howl, !1);
                        },
                        onloaderror: function() {
                            manifest.unrequired ? loadedHandler(_i, howl, !0) : reject("Sound: '" + _i + "' cannot load.");
                        }
                    });
                };
                for (var i$1 in manifests) {
                    loop();
                }
            })) : Promise.reject('You need "howler.js" to load sound asset.');
        }, ContentSoundManifest.prototype.destroyResources = function(resources) {
            for (var i in resources) {
                resources[i].stop(), resources[i].unload();
            }
        }, ContentSoundManifest;
    }(ContentManifestBase), ContentDeliver = function(data) {
        this._piximData = {
            width: data.width,
            height: data.height,
            lib: data.lib,
            resources: data.resources,
            vars: data.vars
        };
    }, prototypeAccessors$1 = {
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
    prototypeAccessors$1.width.get = function() {
        return this._piximData.width;
    }, prototypeAccessors$1.height.get = function() {
        return this._piximData.height;
    }, prototypeAccessors$1.lib.get = function() {
        return this._piximData.lib;
    }, prototypeAccessors$1.resources.get = function() {
        return this._piximData.resources;
    }, prototypeAccessors$1.vars.get = function() {
        return this._piximData.vars;
    }, Object.defineProperties(ContentDeliver.prototype, prototypeAccessors$1);
    var _contents = {}, _contentID = 0;
    function createManifests() {
        var res = {};
        for (var i in _manifests) {
            res[i] = new _manifests[i];
        }
        return res;
    }
    var _manifests = {}, Content = function Content(options, piximData) {
        void 0 === options && (options = {}), void 0 === piximData && (piximData = Content._piximData);
        var basepath = (options.basepath || "").replace(/([^/])$/, "$1/");
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
    }, prototypeAccessors$2 = {
        contentID: {
            configurable: !0
        }
    };
    Content.registerManifest = function(key, Manifest) {
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
    }, Content.defineManifests = function(key, data, options) {
        return void 0 === options && (options = {}), this._piximData.manifests[key] ? (this._piximData.manifests[key].add(data, options), 
        this) : (console.warn("Manifest '" + key + "' is not registered."), this);
    }, Content.defineImages = function(data, options) {
        return void 0 === options && (options = {}), this.defineManifests("images", data, options);
    }, Content.defineSpritesheets = function(data, options) {
        return void 0 === options && (options = {}), this.defineManifests("spritesheets", data, options);
    }, Content.defineSounds = function(data, options) {
        return void 0 === options && (options = {}), this.defineManifests("sounds", data, options);
    }, Content.setConfig = function(data) {
        return this._piximData.config.width = data.width, this._piximData.config.height = data.height, 
        this;
    }, Content.defineLibraries = function(data) {
        for (var i in data) {
            this._piximData.lib[i] = data[i];
        }
        return this;
    }, prototypeAccessors$2.contentID.get = function() {
        return this._piximData.contentID;
    }, Content.prototype.addManifests = function(key, data, options) {
        return void 0 === options && (options = {}), this._piximData.additionalManifests[key] ? (this._piximData.additionalManifests[key].add(data, options), 
        this) : (console.warn("Manifest '" + key + "' is not registered."), this);
    }, Content.prototype.addImages = function(data, options) {
        return void 0 === options && (options = {}), this.addManifests("images", data, options);
    }, Content.prototype.addSpritesheets = function(data, options) {
        return void 0 === options && (options = {}), this.addManifests("spritesheets", data, options);
    }, Content.prototype.addSounds = function(data, options) {
        return void 0 === options && (options = {}), this.addManifests("sounds", data, options);
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
        var resources = contentDeliverData.resources, manifests = this._piximData.manifests;
        for (var i in resources) {
            i in manifests && manifests[i].destroyResources(resources[i]), resources[i] = {};
        }
    }, Content.prototype._loadAssetAsync = function(manifests) {
        var basepath = this._piximData.basepath, version = this._piximData.version, useCache = this._piximData.useCache, resources = this._piximData.$.resources;
        if (0 === Object.keys(manifests).length) {
            return Promise.resolve();
        }
        var promises = [], keys = [];
        for (var i in manifests) {
            var type = i;
            keys.push(type), promises.push(manifests[type].getAsync(basepath, version[type] || "", useCache[type] || !1));
        }
        return Promise.all(promises).then((function(resolver) {
            for (var i = 0; i < resolver.length; i++) {
                for (var j in resources[keys[i]] = resources[keys[i]] || {}, resolver[i]) {
                    resources[keys[i]][j] = resolver[i][j];
                }
            }
        }));
    }, Object.defineProperties(Content.prototype, prototypeAccessors$2), Content.registerManifest("images", ContentImageManifest), 
    Content.registerManifest("spritesheets", ContentSpritesheetManifest), Content.registerManifest("sounds", ContentSoundManifest), 
    exports.Application = Application, exports.Container = Container, exports.Content = Content, 
    exports.ContentDeliver = ContentDeliver, exports.ContentImageManifest = ContentImageManifest, 
    exports.ContentManifestBase = ContentManifestBase, exports.ContentSoundManifest = ContentSoundManifest, 
    exports.ContentSpritesheetManifest = ContentSpritesheetManifest, exports.Emitter = Emitter$1, 
    exports.Layer = Layer, exports.Task = Task$1, exports.loadImageAsync = loadImageAsync, 
    exports.loadImageFromElementAsync = loadImageFromElementAsync, exports.resolvePath = resolvePath, 
    exports.resolveQuery = resolveQuery;
}(this.Pixim = this.Pixim || {}, PIXI, {
    Howl: "undefined" == typeof Howl ? null : Howl
});
//# sourceMappingURL=Pixim.js.map
