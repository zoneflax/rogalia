"use strict";
class Missile {
    constructor({From, To, Speed}) {
        this.from = new Point(From);
        this.to = new Point(To);
        this.point = this.from.clone();
        this.speed = Speed;
    }

    update(k) {
        if (util.distanceLessThan(this.point.x - this.to.x, this.point.y - this.to.y, CELL_SIZE)) {
            return false;
        }
        this.point.move(this.to, this.speed * k);
        return true;
    }

    draw() {
        var p = this.point.clone();
        var height = 0;
        p.y -= height;
        p.x -= height;
        game.ctx.fillStyle = "#fff";
        game.iso.fillCircle(p.x, p.y, 1);
        game.ctx.strokeStyle = "#000";
        game.iso.strokeCircle(p.x, p.y, 2);
    }
}
