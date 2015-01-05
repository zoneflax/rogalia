function Sprite(path, width, height, speed) {
    this.name = "";
    this.image = null;
    this.outline = null;
    this.imageData = null;

    this.width = width || 0;
    this.height = height || 0;

    this.speed = speed || 100;
    this.frame = 0;

    this.position = 0;
    this.lastUpdate = 0;

    this.frames = {};
    this.ready = false;
    this.loading = false;
    if (path)
        this.load(path);
}

Sprite.prototype = {
    load: function(path) {
        if (this.loading)
            return;
        this.loading = true;
        this.image = loader.loadImage(path);
        loader.ready(function() {
            if (this.width == 0)
                this.width = this.image.width;
            if (this.height == 0)
                this.height = this.image.height

            this.makeOutline()
            this.ready = true;
            this.loading = false;

        }.bind(this));
    },
    makeOutline: function() {
        if (!this.image.width)
            return;
        var canvas = document.createElement("canvas");
        var ctx = canvas.getContext("2d");
        var w = this.image.width;
        var h = this.image.height;
        canvas.width = w;
        canvas.height = h;
        canvas.ctx = ctx;

        ctx.drawImage(this.image, 0, 0);
        this.imageData = ctx.getImageData(0, 0, w, h);

        ctx.globalCompositeOperation = "source-atop";
        ctx.fillStyle = "#fff";
        ctx.fillRect(0, 0, w, h);

        this.outline = canvas;
    },
    draw: function(p) {
        if (!this.image.width)
            return;
        game.ctx.drawImage(
            this.image,
            this.frame * this.width,
            this.position * this.height,
            this.width,
            this.height,
            p.x,
            p.y,
            this.width,
            this.height
        );
            // console.log(
            //     this.image,
            //     this.image.width,
            //     this.image.height,
            //     this.frame * this.width,
            //     this.position * this.height,
            //     this.width,
            //     this.height,
            //     p.x,
            //     p.y,
            //     this.width,
            //     this.height
            // );
    },
    drawOutline: function(p) {
        if (!this.outline)
            return;
        game.ctx.globalAlpha = 0.4;
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
    animate: function() {
        if (this.width == this.image.width)
            return;

        var now = Date.now();
        if(now - this.lastUpdate > this.speed) {
            this.frame++;

            if(this.frame * this.width >= this.image.width) {
                this.frame = 0;
            }

            this.lastUpdate = now;
        }
    },
    icon: function() {
        var canvas = document.createElement("canvas");
        canvas.width = this.width;
        canvas.height = this.height;
        var ctx = canvas.getContext("2d");
        try {
            ctx.drawImage(
                this.image,
                0, 0, this.width, this.height,
                0, 0, this.width, this.height
            );
        } catch(e) {
            game.sendError("Cannot load " + this.name + " icon")
        }

        return canvas;
    },
}
