function Camera() {
    this._x = 0;
    this._y = 0;
}
Camera.prototype = {
    field: CELL_SIZE * 3,
    get x() {
        return this._x
    },
    get y() {
        return this._y
    },
    set x(x) {
        this._x = Math.round(x);
    },
    set y(y) {
        this._y = Math.round(y);
    },

    get cell_x() { return Math.floor(this.x / CELL_SIZE);  },
    get cell_y() { return Math.floor(this.y / CELL_SIZE);  },
};
