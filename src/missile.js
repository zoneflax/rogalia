"use strict";
class Missile {
    constructor({From, To, Type, Speed}) {
        this.from = new Point(From);
        this.to = new Point(To);
        this.point = this.from.clone();
        this.speed = Speed;
        this.sprite = new Sprite(Type + ".png");

        var velocity = this.to.clone().sub(this.from);
        this.angle = Math.atan2(velocity.y, velocity.x);
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
        var height = 40;
        p.y -= height;
        p.x -= height;
        p.toScreen();
        p.rotate(-this.angle);

        game.ctx.save();
        game.ctx.rotate(this.angle);
        this.sprite.draw(p);
        game.ctx.restore();
    }
}
