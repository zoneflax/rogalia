"use strict";

class CirclePotentialField {
    constructor(x, y, potential, gradation) {
        this.x = x;
        this.y = y;
        this.potential = potential;
        this.gradation = gradation;
    }

    potentialAt(x, y) {
        var distance = Math.hypot(this.x - x, this.y - y);
        return (this.potential > 0)
            ? Math.max(0, Math.round(this.potential - distance * this.gradation))
            : Math.min(0, Math.round(this.potential + distance * this.gradation));
    }
}

class RectPotentialField {
    constructor(x, y, width, height, potential, gradation) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.potential = potential;
        this.gradation = gradation;
    }

    potentialAt(x, y) {
        return Math.min(0, Math.round(this.potential + this.distanceTo(x, y) * this.gradation));
    }

    distanceTo(x, y) {
        var minX = this.x;
        var minY = this.y;

        if (x < minX && y < minY) {
            return Math.abs((x - minX) + (y - minY));
        }
        var maxX = this.x + this.width;
        var maxY = this.y + this.height;

        if (x > maxX && y > maxY) {
            return Math.abs((x - maxX) + (y - maxY));
        }

        if (x < minX && y > maxY) {
            return Math.abs((x - minX) - (y - maxY));
        }

        if (x > maxX && y < minY) {
            return Math.abs((x - maxX) - (y - minY));
        }

        if (x < minX) {
            return Math.abs(x - minX);
        }

        if (x > maxX) {
            return Math.abs(x - maxX);
        }

        if (y < minY) {
            return Math.abs(y - minY);
        }

        if (y > maxY) {
            return Math.abs(y - maxY);
        }

        return (x > minX && y > minY && x < maxX && y < maxY)
            ? 0
            : +Infinity;
    }
}
