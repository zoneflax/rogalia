function Map() {
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

    var gridColor = "#999";

    this.full = {x:0,y:0};

    this.minimapContainer = document.getElementById("minimap-container");
    this.minimap = document.getElementById("minimap");
    this.minimapCanvas = document.getElementById("minimap-canvas");
    this.location = new Point();

    this.tiles = [];

    this.rotateMinimap = function() {
        this.minimap.style.transform = (config.ui.rotateMinimap)
            ? "scaleY(0.5) rotate(45deg) scale(1.5) translate(44px, 11px)"
            : "";
    };
    this.rotateMinimap();

    this.parse = function(img) {
        this.minimapCanvas.width = 2*img.width;
        this.minimapCanvas.height = img.height;

        var ctx = this.minimapCanvas.getContext("2d");
        ctx.drawImage(img, 0, 0);

        var pixels = ctx.getImageData(0, 0, img.width, img.height).data;

        var data = [];
        var i = 0;
        var color = 0;
        var bioms = this.bioms.map(function(biom) {
            return biom.Color;
        });
        [].forEach.call(pixels, function(colorComponent, px) {
            if (i < 3) {
                color |=  colorComponent << ((2 - i) * 8);
                i++;
            } else {
                var id = bioms.indexOf(color);
                if (id == -1)
                    game.error("Cannot find biom for px #%d=%s", px, color);
                data.push(id);
                color = 0;
                i = 0;
            }
        });

        return data;
    };

    this.sync = function(data) {
        var img = new Image;
        img.onload = sync.bind(this, img);
        img.src = "data:image/png;base64," + data;
    };

    function sync(img) {
        this.cells_x = img.width;
        this.cells_y = img.height;

        this.width = img.width * CELL_SIZE;
        this.height = img.height * CELL_SIZE;

        var data = this.parse(img);
        this.data = [];
        for(var h = 0; h < this.cells_y; h++) {
            this.data.push([]);
            for(var w = 0; w < this.cells_x; w++) {
                var id = data[h * this.cells_x + w];
                var biom = this.bioms[id];
	        this.data[h].push({
                    x: w,
                    y: h,
                    id: id,
                    corners: new Array(4),
                    transition: false,
                    biom: biom,
                });
            }
        }

        var loc = game.player.Location;
        this.location.set(loc.X, loc.Y);
        this.layers = this.makeLayers();

        //TODO: reuse valid chunks
        this.chunks = {};

        for(var y = 0; y < this.cells_y; y++) {
            for(var x = 0; x < this.cells_x; x++) {
                if (config.graphics.low) {
                    var id = 0;
                } else {
                var id = this.data[y][x].id;
                    for (var c = 0; c < 4; c++) {
                        var offset = 0;
                        var cx = 1 - (c & 0x1);
                        var cy = 1 - ((c >> 1) & 0x1);
                        for (var i = 0; i < 4; i++) {
                            var dx = x + cx - (i & 0x1);
                            var dy = y + cy - ((i >> 1) & 0x1);
                            var other =
                                    this.data[dy] &&
                                    this.data[dy][dx] &&
                                    this.data[dy][dx].id;
                            if (other >= id) {
                                offset |= 1 << i;
                            }
                            if (other !== id)
                                this.data[y][x].transition = true;
                        }
                        this.data[y][x].corners[c] = offset;
                    }
                }
                this.layers[id].push(this.data[y][x]);
            }
        }
        this.ready = true;
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

        var sw = Math.max(0, ((pl.X - m.x) / CELL_SIZE << 0) - scr.cells_x);
        var ew = Math.min(this.cells_x, sw + scr.cells_x * 2);

        var sh = Math.max(0, ((pl.Y - m.y) / CELL_SIZE << 0) - scr.cells_y);
        var eh = Math.min(this.cells_y, sh + scr.cells_y * 2);

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
        var cell = this.data[y][x];
        var tile = this.tiles[cell.id];
        var variant = 0;
        if (tile.width > 2*CELL_SIZE) {
            var lx = game.player.Location.X / CELL_SIZE;
            var ly = game.player.Location.Y / CELL_SIZE;
            variant = Math.floor(tile.width/(4*CELL_SIZE)*(1+Math.sin((lx+x)*(ly+y))));
        }
        if (config.graphics.low) {
            var offset = 15;
            ctx.drawImage(
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
            return;
        }

        var d = [
            [0, CELL_SIZE/2],
            [-CELL_SIZE, 0],
            [CELL_SIZE, 0],
            [0, -CELL_SIZE/2],
        ];

        cell.corners.forEach(function(offset, i) {
            //don't draw the same tile again
            if (x != 0 && y != 0 && !cell.transition) {
                switch(offset) {
                case  3: if (i != 2) return; break;
                case  5: if (i != 1) return; break;
                case 10: if (i != 2) return; break;
                case 12: if (i != 1) return; break;

                case  7: if (i != 3) return; break;
                case 11: if (i != 2) return; break;
                case 13: if (i != 1) return; break;
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
        }.bind(this));
    };

    // var k = 0.2;
    // game.ctx.scale(k, k);
    // game.ctx.translate(k*10000, k*10000);

    this.draw = function() {
        var scr = game.screen;
        var cam = game.camera;
        var sx = Math.floor(cam.x / CHUNK_SIZE) * CHUNK_SIZE + CHUNK_SIZE;
        var sy = Math.floor(cam.y / (CHUNK_SIZE/2)) * (CHUNK_SIZE/2) - CHUNK_SIZE/2;
        var ex = Math.ceil((cam.x+scr.width) / CHUNK_SIZE) * CHUNK_SIZE + CHUNK_SIZE;
        var ey = Math.ceil((cam.y+scr.height) / (CHUNK_SIZE/2)) * (CHUNK_SIZE/2) - CHUNK_SIZE/2;
        var i = 0;
        var layers = this.makeLayers();
        for (var cy = sy; cy <= ey; cy += CHUNK_SIZE/2) {
            for (var cx = sx; cx <= ex; cx += 2*CHUNK_SIZE) {
                var p = new Point((i % 2) ? cx-CHUNK_SIZE : cx , cy).toWorld();
                var key = p.x+"."+p.y;
                var chunk = this.chunks[key];
                if (!chunk) {
                    chunk = this.makeChunk(p);
                    this.chunks[key] = chunk;
                }
                chunk.layers.forEach(function(tile) {
                    layers[tile.layer].push(tile);
                });
            }
            i++;
        }

        layers.forEach(function(layer) {
            layer.forEach(function(tile) {
                game.ctx.drawImage(tile.canvas, tile.p.x, tile.p.y);
            });
        });

        if(game.debug.map.position && false) {
            var text = "(" + (x + game.camera.x) + " " + (y + game.camera.y) + ")";
            game.ctx.fillStyle = "#fff";

            game.drawStrokedText(text, x, y + FONT_SIZE);
        }

        game.debug.map.grid && this.drawGrid();

        this.drawMinimap();
    };

    this.makeLayers = function() {
        if (config.graphics.low)
            return [[]];
        return this.bioms.map(function() {
            return [];
        });
    };

    this.makeChunk = function(c) {
        var chunk = {layers:[]};
        var p = c.clone().toScreen();
        p.x -= CHUNK_SIZE;
        this.layers.forEach(function(layer, lvl) {
            var canvas = null;
            var ctx = null;
            layer.forEach(function(tile) {
                var x = tile.x*CELL_SIZE - (c.x - this.location.x);
                var y = tile.y*CELL_SIZE - (c.y - this.location.y);
                if (x < 0 || x > CHUNK_SIZE || y < 0 || y > CHUNK_SIZE)
                    return;
                if (!canvas) {
                    canvas = document.createElement("canvas");
                    canvas.width = 2*ISO_CHUNK_SIZE;
                    canvas.height = ISO_CHUNK_SIZE;
                    ctx = canvas.getContext("2d");
                    ctx.translate(CHUNK_SIZE, 0);
                }
                var p = new Point(x, y).toScreen();
                p.x -= CELL_SIZE;
                this.drawTile(ctx, tile.x, tile.y, p);
            }.bind(this));
            if (canvas) {
                chunk.layers.push({canvas: canvas, p: p, layer: lvl});
            }
        }.bind(this));
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
        var darkness = (game.config.map.simpleDarkness) ? this.simpleDarkness : this.darkness;
        this.each(function(w, h, p, x, y) {
            if (game.config.map.simpleDarkness) {
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
            get("deep-water"),
            get("sand"),
            get("shallow-water"),
        ];
        bioms.forEach(function(biom) {
            list.push(biom);
        });
        return list;
    };

    this.init = function(bioms, map) {
        this.full.width = map.Width;
        this.full.height = map.Height;
        this.bioms = this._sort(bioms);
        this.tiles = this.bioms.map(function(biom) {
            var path = "map/" + biom.Name + ".png";
            var tile = loader.loadImage(path);
            tile.id = biom.id;
            return tile;
        });

        this.darkness = loader.loadImage("map/darkness.png");
        this.simpleDarkness = loader.loadImage("map/simple-darkness.png");
    };

    this.getCell = function(x, y) {
        x -= this.location.x;
        y -= this.location.y;
        x = (x / CELL_SIZE) << 0;
        y = (y / CELL_SIZE) << 0;
        if (!this.data[y]) {
            // game.sendErrorf("Map cell %d %d not found (y)", x, y);
            return null;
        }
        if (!this.data[y][x]) {
            // game.sendErrorf("Map cell %d %d not found (x)", x, y);
            return null;
        }
        return this.data[y][x];
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
            var k = 1;
            if (e instanceof Character) {
                if (e == game.player) {
                    mctx.fillStyle = "#0f0";
                    k = 10;
                } else if (e.Karma < 0 || e.Aggressive) {
                    mctx.fillStyle = "#f00";
                    k = 10;
                } else {
                    mctx.fillStyle = "pink";
                    k = 6;
                }
            } else if (!e.inWorld()) {
                return;
            } else if (e.Creator == game.player.Id) {
                mctx.fillStyle = "#393";
            } else if (e.Creator){
                mctx.fillStyle = "#f0f";
            }
            var x = (e.X - loc.X) / CELL_SIZE;
            var y = (e.Y - loc.Y) / CELL_SIZE;
            var w = (e.Width || e.Radius) / CELL_SIZE;
            var h = (e.Height || e.Radius) / CELL_SIZE;

            mctx.fillRect(x, y, w * k, h * k);
        });
    };

}
