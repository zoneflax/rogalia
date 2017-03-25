/* global game, Point, CELL_SIZE, config, loader, PIXI, dom */

"use strict";
function WorldMap() {
    var CHUNK_SIZE = 8*CELL_SIZE;
    var ISO_CHUNK_SIZE = CHUNK_SIZE + CELL_SIZE;

    this.data = [];
    this.layers = null;
    this.chunks = {};
    this.width = 0;
    this.height = 0;
    this.cells_x = 0;
    this.cells_y = 0;
    this.bioms = [];
    this.colorMap = {};

    var gridColor = "#999";

    this.full = {x:0,y:0};

    this.minimapContainer = document.getElementById("minimap-container");
    this.minimapContainer.onclick = () => { game.controller.minimap.panel.toggle(); };
    this.minimap = document.getElementById("minimap");
    this.minimapCanvas = document.getElementById("minimap-canvas");
    this.minimapCanvas.ctx = this.minimapCanvas.getContext("2d");
    this.location = new Point();

    this.tiles = [];

    var worker = new Worker("src/map-parser.js");
    worker.onmessage = (e) => {
        const data = e.data;
        if (data.error) {
            game.error(data.error);
            return;
        }

        this.data = data.data;
        this.layers = data.layers;
        var loc = game.player.Location;
        this.location.set(loc.X, loc.Y);
        this.reset();
        this.ready = true;
    };

    this.sync = function({Width, Height, Data}, map) {
        this.cells_x = Width;
        this.cells_y = Height;

        this.width = Width * CELL_SIZE;
        this.height = Height * CELL_SIZE;

        this.syncMinimap(Data, Width, Height);

        if (config.graphics.fastRender) {
            var loc = game.player.Location;
            this.location.set(loc.X, loc.Y);
            this.data = Data;
            this.ready = true;
            game.pixi.updateMap(true);
        } else {
            worker.postMessage({
                bioms: this.bioms,
                pixels: Data,
                cells_x: this.cells_x,
                cells_y: this.cells_y,
            });
        }

        if (map) {
            this.full.width = map.Width;
            this.full.height = map.Height;
        }
    };

    this.syncMinimap = function(data, width, height) {
        this.minimapCanvas.width = 2*width;
        this.minimapCanvas.height = height;

        var pixels = new Uint8ClampedArray(data.length*4);
        var color;
        for (var i = 0, j = 0, l = data.length; i < l; i++, j += 4) {
            color = data[i];
            pixels[j+0] = (color >> 16) & 0xff;
            pixels[j+1] = (color >> 8) & 0xff;
            pixels[j+2] = (color >> 0) & 0xff;
            pixels[j+3] = 0xff;
        };
        this.minimapCanvas.ctx.putImageData(new ImageData(pixels, width, height), 0, 0);
    };

    this.reset = function() {
        for (const index in this.chunks) {
            this.chunks[index].dirty = true;
        }
    };

    this.quant = {
        current: 0,
        max: 3,
        idle: 0,
    };
    this.getChunk = function(x, y) {
        var c = new Point(x * CHUNK_SIZE, y * CHUNK_SIZE);
        const index = y * this.cells_x + x;
        let chunk = this.chunks[index];
        if (!chunk) {
            this.quant.idle = 0;
            if (this.quant.current == 0) {
                return null;
            }
            this.quant.current--;
            chunk = this.makeChunk(c);
            this.chunks[index] = chunk;
        }
        return chunk;
    };

    this.updateChunks = function() {
        this.quant.current = Math.max(this.quant.current, this.quant.max);
        this.quant.idle = Math.max(this.quant.idle, this.quant.max - 1);
        if (this.quant.idle == 0) {
            return;
        }
        // const candidates = Object.keys(this.chunks).filter(index => this.chunks[index].dirty);
        // // first check farest chunks
        // const sorted = _.sortBy(candidates, index => {
        //     const x = index % this.cells_x * CHUNK_SIZE;
        //     const y = ((index / this.cells_x) << 0) * CHUNK_SIZE;
        //     return -Math.hypot(x - game.player.X, y - game.player.Y);
        // });
        // for (const index of sorted) {
        //     const x = index % this.cells_x;
        //     const y = (index / this.cells_x) << 0;
        //     delete this.chunks[index];
        //     this.quant.idle--;
        //     if (this.quant.idle == 0) {
        //         break;
        //     }
        // };
        for (const index in this.chunks) {
            if (!this.chunks[index].dirty) {
                continue;
            }
            delete this.chunks[index];
            this.quant.idle--;
            if (this.quant.idle == 0) {
                break;
            }
        }
    };

    this.drawGrid = function() {
        game.ctx.strokeStyle = gridColor;
        var sw = game.player.Location.X;
        var sh = game.player.Location.Y;
        for(var w = sw; w <= sw + this.width; w += CELL_SIZE) {
            var sp = new Point(w, sh).toScreen();
            var ep = new Point(w, sh + this.height).toScreen();
            game.ctx.beginPath();
            game.ctx.moveTo(sp.x, sp.y);
            game.ctx.lineTo(ep.x, ep.y);
            game.ctx.stroke();
        }
        for(var h = sh; h <= sh + this.height; h += CELL_SIZE) {
            var sp = new Point(sw, h).toScreen();
            var ep = new Point(sw + this.width, h).toScreen();
            game.ctx.beginPath();
            game.ctx.moveTo(sp.x, sp.y);
            game.ctx.lineTo(ep.x, ep.y);
            game.ctx.stroke();
        }
    };

    this.each = function(draw) {
        var pl = game.player;
        var m = this.location;
        var scr = game.screen;

        var sw = Math.max(0, ((pl.X - m.x) / CELL_SIZE << 0) - scr.cells_x) >> 0;
        var ew = Math.min(this.cells_x, sw + scr.cells_x * 2) >> 0;

        var sh = Math.max(0, ((pl.Y - m.y) / CELL_SIZE << 0) - scr.cells_y) >> 0;
        var eh = Math.min(this.cells_y, sh + scr.cells_y * 2) >> 0;

        for (var h = sh; h < eh; h++) {
            for (var w = sw; w < ew; w++) {
                var x = w * CELL_SIZE + m.x;
                var y = h * CELL_SIZE + m.y;
                var p = new Point(x, y).toScreen();
                p.x -= CELL_SIZE;
                var t = p.clone().sub(p);
                if (t.x < -2*CELL_SIZE || t.y < -CELL_SIZE || t.x > scr.width || t.x > scr.height)
                    continue;

                draw.call(this, w, h, p, x, y);
            }
        }
    };


    this.drawTile = function(ctx, x, y, p) {
        const {id, corners} = this.data[y*this.cells_x + x];
        const tile = this.tiles[id];
        let variant = 0;

        if (tile.width > 2*CELL_SIZE) {
            var lx = game.player.Location.X / CELL_SIZE;
            var ly = game.player.Location.Y / CELL_SIZE;
            variant = Math.floor(tile.width/(4*CELL_SIZE)*(1+Math.sin((lx+x)*(ly+y))));
        }

        if (tile.height == CELL_SIZE) {
            ctx.drawImage(
                tile,

                variant * 2*CELL_SIZE,
                0,
                CELL_SIZE * 2,
                CELL_SIZE,

                p.x,
                p.y,
                CELL_SIZE * 2,
                CELL_SIZE
            );
            return;
        }

        var d = [
            [0, CELL_SIZE/2],
            [-CELL_SIZE, 0],
            [CELL_SIZE, 0],
            [0, -CELL_SIZE/2],
        ];

        for (let i = 0; i < 4; i++) {
            const offset = (corners >> (0x4 * i)) & 0xf;
            if (offset == 0) {
                continue;
            }
            const transition = (corners & (1 << i + 0x4*5));
            if (x != 0 && y != 0 && !transition) {
                // breaks ARE required
                switch(offset) {
                case  3: if (i != 2) return; break;
                case  5: if (i != 1) return; break;
                    // case 10: if (i != 2) return; break;
                    // case 12: if (i != 1) return; break;

                case  7: if (i != 3) return; break;
                    // case 11: if (i != 2) return; break;
                    // case 13: if (i != 1) return; break; //TODO: fixme

                case 14: if (i != 0) return; break;

                case 15: if (i != 0) return; break;
                }
            }


            ctx.drawImage(
                tile,

                variant * 2*CELL_SIZE,
                offset * CELL_SIZE,
                CELL_SIZE * 2,
                CELL_SIZE,

                p.x + d[i][0],
                p.y + d[i][1],
                CELL_SIZE * 2,
                CELL_SIZE
            );
        }
    };

    this.fastDraw = function() {
        var scr = game.screen;
        var cam = game.camera;

        var leftTop = cam
            .clone()
            .toWorld()
            .div(CELL_SIZE)
            .floor();
        var rightTop = cam
            .clone()
            .add(new Point(scr.width, 0))
            .toWorld()
            .div(CELL_SIZE)
            .floor();
        var leftBottom = cam
            .clone()
            .add(new Point(0, scr.height))
            .toWorld()
            .div(CELL_SIZE)
            .ceil();
        var rightBottom = cam
            .clone()
            .add(new Point(scr.width, scr.height))
            .toWorld()
            .div(CELL_SIZE)
            .ceil();

        for (var x = leftTop.x; x < rightBottom.x; x++) {
            for (var y = rightTop.y; y < leftBottom.y; y++) {
                var p = new Point(x * CELL_SIZE, y * CELL_SIZE).toScreen();

                if (p.x + CELL_SIZE < cam.x)
                    continue;
                if (p.y + CELL_SIZE < cam.y)
                    continue;
                if (p.x - CELL_SIZE > cam.x + scr.width)
                    continue;
                if (p.y > cam.y + scr.height)
                    continue;

                p.x -= CELL_SIZE;

                var w = x - this.location.x / CELL_SIZE;
                var h = y - this.location.y / CELL_SIZE;
                if (w < 0 || h < 0 || w >= this.cells_x || h >= this.cells_y) {
                    continue;
                }
                var color = this.data[h*this.cells_x + w];
                var index = this.colorMap[color];
                var tile = this.tiles[index];

                var offset = (tile.height > CELL_SIZE) ? 15 : 0;

                var variant = (tile.width > 2*CELL_SIZE) ?
                    Math.floor(tile.width/(4*CELL_SIZE)*(1+Math.sin(x*y)))
                    : 0;
                game.ctx.drawImage(
                    tile,
                    variant * 2*CELL_SIZE,
                    offset * CELL_SIZE,
                    CELL_SIZE * 2,
                    CELL_SIZE,
                    p.x,
                    p.y,
                    CELL_SIZE * 2,
                    CELL_SIZE

                );

            }
        }
    };

    this.layerDraw = function() {
        // const started = Date.now();
        var layers = this.makeLayers();

        var scr = game.screen;
        var cam = game.camera;

        var leftTop = cam
            .clone()
            .toWorld()
            .div(CHUNK_SIZE)
            .floor();
        var rightTop = cam
            .clone()
            .add(new Point(scr.width, 0))
            .toWorld()
            .div(CHUNK_SIZE)
            .floor();
        var leftBottom = cam
            .clone()
            .add(new Point(0, scr.height))
            .toWorld()
            .div(CHUNK_SIZE)
            .ceil();
        var rightBottom = cam
            .clone()
            .add(new Point(scr.width, scr.height))
            .toWorld()
            .div(CHUNK_SIZE)
            .ceil();

        for (let x = leftTop.x; x < rightBottom.x; x++) {
            for (let y = rightTop.y; y < leftBottom.y; y++) {
                const chunk = this.getChunk(x, y);
                if (!chunk) {
                    continue;
                }
                for (const tile of chunk.layers) {
                    layers[tile.layer].push(tile);
                }
            }
        }

        for (const layer of layers) {
            for (const tile of layer) {
                game.ctx.drawImage(tile.canvas, tile.p.x, tile.p.y);
            }
        }

        this.updateChunks();

        // const diff = Date.now() - started;
        // if (diff > 30) {
        //     console.log("last", diff);
        // }
    };

    this.draw = function() {
        if (config.graphics.fastRender) {
            game.pixi.drawMap();
            // this.fastDraw();
        } else {
            this.layerDraw();
        }

        if (game.controller.drawMapGrid) {
            this.drawGrid();
        }

        this.drawMinimap();
    };

    this.makeLayers = function() {
        return this.bioms.map(function() {
            return [];
        });
    };

    this.makeChunk = function(c) {
        const p = c.clone().toScreen();
        p.x -= CHUNK_SIZE;
        var chunk = {layers: [], dirty: this.dirtyCounter};
        _.forEach(this.layers, (layer, lvl) => {
            var canvas = null;
            var ctx = null;
            _.forEach(layer, index => {
                const tileX = index % this.cells_x;
                const tileY = (index / this.cells_x) << 0;

                const x = tileX*CELL_SIZE - (c.x - this.location.x);
                const y = tileY*CELL_SIZE - (c.y - this.location.y);
                if (x < 0 || x > CHUNK_SIZE || y < 0 || y > CHUNK_SIZE)
                    return;
                if (!canvas) {
                    canvas = dom.canvas(2 * ISO_CHUNK_SIZE, ISO_CHUNK_SIZE);
                    ctx = canvas.ctx;
                    ctx.translate(CHUNK_SIZE, 0);
                }
                const p = new Point(x, y).toScreen();
                p.x -= CELL_SIZE;
                this.drawTile(ctx, tileX, tileY, p);
            });
            if (canvas) {
                chunk.layers.push({canvas, p, layer: lvl});
            }
        });
        return chunk;
    };

    this.drawDarkness = function() {
        // console.time("darkness")
        //game.time.max = 1440 = 24h; 18-06 = darkness
        var opacity = 0;
        var max = 0.95;
        if (game.time < 6 * 60)
            opacity = max - game.time / (6 * 60);
        else if (game.time > 18 * 60)
            opacity = max - (24 * 60 - game.time) / (6 * 60);
        else
            return;

        opacity = Math.max(0, Math.min(max, opacity));


        //TODO: use same argument names everywhere!
        var darkness = (debug.map.simpleDarkness) ? this.simpleDarkness : this.darkness;
        this.each(function(w, h, p, x, y) {
            if (debug.map.simpleDarkness) {
                if(w % 2 == 1 || h % 2 == 1)
                    return;
                p.x -= CELL_SIZE;
            }

            var dist = Math.pow(game.player.X - x, 2) + Math.pow(game.player.Y - y, 2);
            var r = Math.pow(CELL_SIZE * 10, 2);
            var tileOpacity = opacity * Math.min(1, dist / r);
            game.ctx.globalAlpha = tileOpacity;
            game.ctx.drawImage(darkness, p.x, p.y);
        });
        game.ctx.globalAlpha = 1;
        // console.timeEnd("darkness");
    };

    this._sort = function(bioms) {
        bioms.forEach(function(biom, i) {
            biom.id = i;
        });
        function get(name) {
            var i = bioms.findIndex(function(biom) {
                return biom.Name == name;
            });
            var biom = bioms[i];
            bioms.splice(i, 1);
            return biom;
        }
        var list = [
            get("plowed-soil"),
            get("soil"),
            get("shallow-water"),
            get("sand"),
            get("deep-water"),
        ];
        bioms.forEach(function(biom) {
            list.push(biom);
        });
        return list;
    };

    this.initBioms = function(bioms) {
        this.bioms = this._sort(bioms);
        this.tiles = this.bioms.map(function(biom) {
            var path = "map/" + biom.Name + ".png";
            var tile = loader.loadImage(path);
            tile.id = biom.id;
            return tile;
        });

        this.colorMap = this.bioms.reduce(function(map, biom, index) {
            map[biom.Color] = index;
            return map;
        }, {});

        this.darkness = loader.loadImage("map/darkness.png");
        this.simpleDarkness = loader.loadImage("map/simple-darkness.png");
        if (game.pixi) {
            game.loader.ready(() => game.pixi.initTiles(this.tiles));
        }
    };

    this.initSize = function({Width, Height}) {
        this.full.width = Width;
        this.full.height = Height;
    };

    this.getCell = function(x, y) {
        x -= this.location.x;
        y -= this.location.y;
        x = (x / CELL_SIZE) << 0;
        y = (y / CELL_SIZE) << 0;
        if (config.graphics.fastRender) {
            var color = this.data[y*this.cells_x + x];
            if (!color)
                return null;
            var index = this.colorMap[color];
            return {
                x, y,
                id: index,
                biom: this.bioms[index],
            };
        }

        return this.data[y*this.cells_x + x];
    };

    this.biomAt = function(x, y) {
        var cell = this.getCell(x, y);
        return (cell) ? this.bioms[cell.id] : null;
    };

    var minimapObjectsCanvas = document.getElementById("minimap-objects-canvas");
    var mctx = minimapObjectsCanvas.getContext("2d");

    this.drawMinimap = function() {
        minimapObjectsCanvas.width = this.minimapCanvas.width;
        minimapObjectsCanvas.height = this.minimapCanvas.height;
        // mctx.clearRect(0, 0, minimapObjectsCanvas.width, minimapObjectsCanvas.height);
        var loc = game.player.Location;
        game.entities.forEach(function(e) {
            var x = (e.X - loc.X) / CELL_SIZE;
            var y = (e.Y - loc.Y) / CELL_SIZE;
            var w = (e.Width || e.Radius) / CELL_SIZE;
            var h = (e.Height || e.Radius) / CELL_SIZE;

            if (e instanceof Character) {
                if (e == game.player) {
                    mctx.fillStyle = "#0f0";
                    w = h = 5;
                } else if (e.Karma < 0 || e.Aggressive) {
                    mctx.fillStyle = "#f00";
                    w = h = ((e.Lvl >= 50) ? 6 : 4);;
                } else {
                    mctx.fillStyle = "pink";
                    w = h = ((e.Lvl >= 50) ? 5 : 3);
                }
            } else if (!e.inWorld()) {
                return;
            } else if (e.Creator == game.player.Id) {
                setEntityColor("#9f9");
            } else if (e.Creator){
                setEntityColor("#999");
            }

            mctx.fillRect(x, y, w, h);

            function setEntityColor(defaultColor) {
                switch (e.Group) {
                case "respawn":
                    mctx.fillStyle = (e.Creator == game.player.Id) ? "#0ff" : "gold";
                    w = 3;
                    h = 3;
                    break;
                default:
                    mctx.fillStyle = defaultColor;
                }
            };
        });
    };
}
