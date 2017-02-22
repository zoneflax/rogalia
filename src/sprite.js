/* global loader, game */

"use strict";
function Sprite(path, width, height, speed) {
    this.name = "";
    this.image = null;
    this.outline = null;
    this.imageData = null;

    this.width = width || 0;
    this.height = height || 0;
    this.framesNum = 0;

    this.dy = 0; //used for animations

    this.speed = speed || 100;
    this.frame = 0;

    this.position = 0;
    this.lastUpdate = 0;

    this.frames = {};
    this.ready = false;
    this.loading = false;

    this.pending = [];

    this._onload = null;
    this._path = null;

    if (path)
        this.load(path);
}

Sprite.prototype = {
    set onload(callback) {
        this._onload = callback;
        if (this.ready)
            this._onload();
    },
    load: function(path) {
        if (this.loading || this._path == path)
            return;
        this._path = path;
        this.loading = true;
        this.image = loader.loadImage(path);
        loader.ready(function() {
            if (this.width == 0)
                this.width = this.image.width;
            if (this.height == 0)
                this.height = this.image.height;

            this.framesNum = this.image.width / this.width;
            this.makeOutline();
            this.ready = true;
            this.loading = false;

            var canvas = null;
            while ((canvas = this.pending.pop())) {
                this.renderIcon(canvas);
            }
            if (this._onload) {
                this._onload();
            }
        }.bind(this));
    },
    makeOutline: function() {
        if (!this.image.width)
            return;

        var w = this.image.width;
        var h = this.image.height;
        var canvas = dom.canvas(w, h);
        var ctx = canvas.ctx;

        ctx.drawImage(this.image, 0, 0);
        this.imageData = ctx.getImageData(0, 0, w, h);

        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);

        this.outline = canvas;
    },
    drawAlpha: function(p, alpha) {
        game.ctx.globalAlpha = alpha;
        this.draw(p);
        game.ctx.globalAlpha = 1;
    },
    draw: function(p) {
        if (this.image.width == 0 || this.frame * this.width + this.width > this.image.width) {
            return;
        }
        // try {
        game.ctx.drawImage(
            this.image,
            this.frame * this.width,
            this.position * this.height,
            this.width,
            this.height,
            p.x | 0,
            (p.y + this.dy) | 0,
            this.width,
            this.height
        );
        // } catch(e) {
        //     console.log(
        //         this,
        //         this.frame * this.width,
        //         this.position * this.height,
        //         p.x,
        //         p.y
        //     );
        // }
    },
    drawOutline: function(p) {
        if (!this.outline)
            return;
        game.ctx.globalAlpha = 0.25;
        var w = this.width;
        var h = this.height;
        game.ctx.drawImage(
            this.outline,
            this.width * this.frame,
            this.height * this.position,
            w, h,
            p.x, p.y,
            w, h
        );
        game.ctx.globalAlpha = 1;
    },
    animate: function(cycle) {
        if (this.width == this.image.width)
            return;

        var now = Date.now();
        if(now - this.lastUpdate > this.speed) {
            this.frame++;

            var wrap = this.frame > this.framesNum - 1;
            if (cycle) {
                this.cycleAnimate(cycle, wrap);
            } else if(wrap) {
                this.frame = 0;
            }

            this.lastUpdate = now;
        }
    },
    cycleAnimate: function(cycle, wrap) {
        var ellapsed = Date.now() - cycle.lifetime.Created * 1000;
        var ending = cycle.lifetime.Duration - this.speed * (this.framesNum - cycle.end);
        if (ellapsed > ending) {
            if (wrap) {
                this.frame = this.framesNum - 1;
            }
        } else if (ellapsed > this.speed * cycle.start && wrap) {
            this.frame = cycle.start;
        } else if (this.frame > cycle.end) {
            this.frame = cycle.start;
        }
    },
    icon: function() {
        var canvas = dom.canvas(0, 0, "canvas");
        if (this.ready) {
            this.renderIcon(canvas);
        } else {
            this.pending.push(canvas);
        }
        return canvas;
    },
    renderIcon: function(canvas) {
        canvas.width = this.width;
        canvas.height = this.height;
        try {
            canvas.ctx.drawImage(
                this.image,
                0, 0, this.width, this.height,
                0, 0, this.width, this.height
            );
        } catch(e) {
            game.sendError("Cannot load " + this.name + " icon");
        }
    }
};
