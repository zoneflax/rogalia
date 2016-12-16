/* global game */

"use strict";

class Screen {
    constructor() {
        this.width = 0;
        this.height = 0;
        this.cells_x = 0;
        this.cells_y = 0;
    }

    update() {
        if (game.fullscreen) {
            this.width = window.innerWidth;
            this.height = window.innerHeight;
        } else {
            this.width = (window.innerWidth > DEFAULT_CLIENT_WIDTH) ?
                DEFAULT_CLIENT_WIDTH : window.innerWidth;
            this.height = (window.innerHeight > DEFAULT_CLIENT_HEIGHT) ?
                DEFAULT_CLIENT_HEIGHT : window.innerHeight;
        }

        this.cells_x = this.width / CELL_SIZE;
        this.cells_y = this.height / CELL_SIZE;
        game.canvas.width = this.width;
        game.canvas.height = this.height;
        game.world.style.width = this.width + "px";
        game.world.style.height = this.height + "px";
        game.setFontSize();
    }
}
