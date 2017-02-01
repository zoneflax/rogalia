/* global PIXI, game, CELL_SIZE, Point, _ */

"use strict";

class Pixi {
    constructor() {
        PIXI.utils.skipHello();
        this.stage =  new PIXI.Container();
        this.renderer = PIXI.autoDetectRenderer(
            game.screen.width,
            game.screen.height,
            {transparent: true}
        ),
        this.tiles = {};

        this.mapLocation = new Point();
    }

    sync() {
    }

    initTiles(tiles) {
        tiles.forEach((tile) => {
            var offset = (tile.height > CELL_SIZE) ? 15 : 0;
            const base = new PIXI.BaseTexture(tile);
            this.tiles[tile.alt] = _.range(tile.width / (2*CELL_SIZE)).map(function(x) {
                const rect = new PIXI.Rectangle(
                    x * 2*CELL_SIZE,
                    offset * CELL_SIZE,
                    2*CELL_SIZE,
                    CELL_SIZE
                );
                return new PIXI.Texture(base, rect);
            });
        });
    }

    updateMap() {
        game.controller.updateCamera();
        const map = game.map;
        const scr = game.screen;
        const cam = game.camera;

        const leftTop = cam
              .clone()
              .toWorld()
              .div(CELL_SIZE)
              .floor();
        const rightTop = cam
              .clone()
              .add(new Point(scr.width, 0))
              .toWorld()
              .div(CELL_SIZE)
              .floor();
        const leftBottom = cam
              .clone()
              .add(new Point(0, scr.height))
              .toWorld()
              .div(CELL_SIZE)
              .ceil();
        const rightBottom = cam
              .clone()
              .add(new Point(scr.width, scr.height))
              .toWorld()
              .div(CELL_SIZE)
              .ceil();

        this.stage = new PIXI.Container();

        for (let x = leftTop.x; x < rightBottom.x; x++) {
            for (let y = rightTop.y; y < leftBottom.y; y++) {
                const p = new Point(x * CELL_SIZE, y * CELL_SIZE).toScreen();

                if (p.x + CELL_SIZE < cam.x)
                    continue;
                if (p.y + CELL_SIZE < cam.y)
                    continue;
                if (p.x - CELL_SIZE > cam.x + scr.width)
                    continue;
                if (p.y > cam.y + scr.height)
                    continue;

                p.x -= CELL_SIZE;

                const w = x - map.location.x / CELL_SIZE;
                const h = y - map.location.y / CELL_SIZE;
                if (w < 0 || h < 0 || w >= map.cells_x || h >= map.cells_y) {
                    continue;
                }
                const color = map.data[h*map.cells_x + w];
                const index = map.colorMap[color];
                const tile = map.tiles[index];
                const textures = this.tiles[tile.alt];
                const variant = (tile.width > 2*CELL_SIZE) ?
                      Math.floor(tile.width/(4*CELL_SIZE)*(1+Math.sin(x*y)))
                    : 0;

                const sprite = new PIXI.Sprite(textures[variant]);
                sprite.x = p.x - game.camera.x;
                sprite.y = p.y - game.camera.y;

                this.stage.addChild(sprite);
            }
        }
    }

    drawMap() {
        if (!this.mapLocation.equals(new Point(game.player))) {
            this.updateMap();
        }
        this.renderer.render(this.stage);
    }
}
