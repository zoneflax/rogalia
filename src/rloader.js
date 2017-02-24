/* global game, Image */

"use strict";
function Loader(assetsDir) {
    this.assetsDir = assetsDir;
};

Loader.prototype = {
    get status() {
        return {loaded: this._loaded, loading: this._loading};
    },
    _loaded: 0,
    _loading: 0,
    assetsDir: "/",
    images: {},
    readyCallbacks: [],
    ready: function(callback) {
        this.readyCallbacks.push(callback);
        this.runCallbacks();
    },
    loadImage: function(name, clone) {
        if (!name || name.length == 0) {
            game.sendError("Trying to load undefined or empty image");
            return new Image();
        }

        var image = this.images[name];
        if (!image) {
            this._loading++;
            image = new Image();
            this.images[name] = image;

            image.alt = name;
            image.addEventListener("load",  this.loaded.bind(this));

            image.onerror = (e) => {
                game.sendError("Cannot load " + name);
                this.loaded();
            };

            image.src = this.assetsDir + name;
        }

        return (clone) ? image.cloneNode() : image;
    },
    loadImages: function(images, clone) {
        for (var name in images) {
            images[name] = this.loadImage(images[name], clone);
            images[name].name = name;
        }
        return images;
    },
    loaded: function() {
        this._loaded++;
        this.runCallbacks();
    },
    runCallbacks: function() {
        while (this.readyCallbacks.length) {
            if (this._loaded != this._loading)
                return;
            var callback = this.readyCallbacks.shift();
            callback();
        }
    },
    load: function(url, callback) {
        this._loading++;
        util.ajax(url, function(data) {
            callback(JSON.parse(data));
            this.loaded();
        }.bind(this));
    }
};
