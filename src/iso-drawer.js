"use strict";

class IsoDrawer {
    constructor(ctx) {
        this.ctx = ctx;
    }

    _draw(x, y, callback) {
        var p = new Point(x, y).toScreen();
        this.ctx.save();
        if (this.ctx.lineWidth < 2)
            this.ctx.lineWidth = 2;
        this.ctx.translate(p.x, p.y);
        this.ctx.scale(1, 0.5);
        this.ctx.rotate(Math.PI / 4);
        callback.call(this);
        this.ctx.restore();
    }

    strokeRect(x, y, w, h) {
        this._draw(x, y, function() {
            this.ctx.strokeRect(0, 0, w * Math.SQRT2, h * Math.SQRT2);
        });
    }

    fillRect(x, y, w, h) {
        this._draw(x, y, function() {
            this.ctx.fillRect(0, 0, w * Math.SQRT2, h * Math.SQRT2);
        });
    }

    fillCircle(x, y, r) {
        this._draw(x, y, function() {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r * Math.SQRT2, 0, Math.PI * 2);
            this.ctx.fill();
        });
    }

    strokeCircle(x, y, r) {
        this._draw(x, y, function() {
            this.ctx.beginPath();
            this.ctx.arc(0, 0, r * Math.SQRT2, 0, Math.PI * 2);
            this.ctx.stroke();
        });
    }

    fillStrokedCircle(x, y, r) {
        this.fillCircle(x, y, r);
        this.strokeCircle(x, y, r);
    }

    fillStrokedRect(x, y, w, h) {
        this.fillRect(x, y, w, h);
        this.strokeRect(x, y, w, h);
    }
}
