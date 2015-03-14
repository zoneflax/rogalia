function Map() {
    this.data = [];
    this.layers = null;
    this.width = 0;
    this.height = 0;
    this.cells_x = 0;
    this.cells_y = 0;
    this.bioms = [];

    this.blit = true;
    this.buffer = 1;
    this.buffers = [].slice.call(document.getElementsByClassName("map-canvas"));

    var gridColor = "#999";

    this.full = {x:0,y:0};

    this.minimapContainer = document.getElementById("minimap-container");
    this.minimap = document.getElementById("minimap");
    this.location = new Point();

    this.tiles = [];

    var objects = {}
    this.updateObject = function(object) {
        if (!config.ui.minimapObjects)
            return;
        var dot = objects[object.Id]
        if (!dot) {
            dot = document.createElement("div");
            objects[object.Id] = dot;

            dot.className = "object";
            var w = object.Width || object.Radius;
            var h = object.Height || object.Radius;
            dot.style.width = w / CELL_SIZE;
            dot.style.width = h / CELL_SIZE;
            this.minimapContainer.appendChild(dot);
            if (object instanceof Character) {
                if (object == game.player)
                    dot.classList.add("me");
                else
                    dot.classList.add((object.Karma >= 0) ? "passive" : "aggressive");
            } else {
                switch (object.Creator) {
                case game.player.Id:
                    dot.classList.add("mine");
                    break;
                case 0:
                    break;
                default:
                    dot.classList.add("not-mine");
                }
            }
            dot.object = object;
        }
    };

    this.removeObject = function(id) {
        if (!config.ui.minimapObjects)
            return;

        var dot = objects[id];
        if (dot) {
            util.dom.remove(dot);
            delete objects[id];
        }
    }

    this.updateObjects = function() {
        if (!config.ui.minimapObjects)
            return;

        for (var i in objects) {
            var dot = objects[i];
            dot.style.left = (dot.object.X - this.location.x) / CELL_SIZE + "px";
            dot.style.top = (dot.object.Y - this.location.y) / CELL_SIZE + "px";
        }
    }

    this.parse = function(img) {
        this.minimap.width = img.width;
        this.minimap.height = img.height;

        var ctx = this.minimap.getContext("2d");
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
        this.ready = false;
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

        this.layers = this.bioms.map(function() {
            return [];
        })

        for(var y = 0; y < this.cells_y; y++) {
            for(var x = 0; x < this.cells_x; x++) {
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
                this.layers[id].push(this.data[y][x]);
            }
        }
        this.prerender();
    };


    this.prerender = function() {
        console.time("Prerender");

        var buffer = 1 - this.buffer;
        var canvas = this.buffers[buffer];
        var ctx = canvas.getContext("2d");

        canvas.width = this.width * 2;
        canvas.height = this.height;

        ctx.translate(this.width, 0);
        var pad = null;
        if (game.player.X > game.screen.height &&
            game.player.Y > game.screen.width &&
            this.full.width - game.player.X > game.screen.height &&
            this.full.height - game.player.Y > game.screen.width
           ) {
            pad = new Point(
                (this.width - game.screen.height),
                (this.height/2 - game.screen.height)
            );
        }
        this.layers.forEach(function(layer) {
            layer.forEach(function(tile) {
                var x = tile.x;
                var y = tile.y;
                var p = new Point(x * CELL_SIZE, y * CELL_SIZE).toScreen();
                if (pad && (Math.abs(p.x) > pad.x || p.y < pad.y || p.y > this.height - pad.y))
                    return;
                p.x -= CELL_SIZE;
                this.drawTile(ctx, x, y, p);
            }.bind(this));
        }.bind(this));

        this.location.set(
            game.player.Location.X,
            game.player.Location.Y
        );

        this.ready = true;
        this.blit = true;
        this.buffer = buffer;

        console.timeEnd("Prerender");
    }


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
    }

    this.each = function(draw) {
        var pl = game.player;
        var m = this.location;
        var scr = game.screen;
        var cam = game.camera;

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
        var d = [
            [0, CELL_SIZE/2],
            [-CELL_SIZE, 0],
            [CELL_SIZE, 0],
            [0, -CELL_SIZE/2],
        ];

        var variant = 0;
        if (tile.width > 2*CELL_SIZE) {
            var lx = game.player.Location.X / CELL_SIZE;
            var ly = game.player.Location.Y / CELL_SIZE;
            variant = Math.floor(tile.width/(4*CELL_SIZE)*(1+Math.sin((lx+x)*(ly+y))))
        }
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

    this.drawRay = function() {
        if (!game.config.map.ray)
            return;
        var canvas = document.createElement("canvas");
        canvas.width = game.screen.width;
        canvas.height = game.screen.height;
        var ctx = canvas.getContext("2d");

        // ctx.fillStyle = "rgba(0, 0, 0, 0.9)";
        ctx.fillStyle = "#000";
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.translate(-game.camera.x, -game.camera.y);


        var segments = [];
        game.sortedEntities.filter(function(e) {
            return e instanceof Entity && e.moveType == Entity.MT_STATIC && e.width > 0;
        }).forEach(function(e) {
            var w = e.width / 2;
            var h = e.height / 2;
            segments.push({
                a: {x: e.x - w, y: e.y - h},
                b: {x: e.x + w, y: e.y - h},
            });
            segments.push({
                a: {x: e.x + w, y: e.y - h},
                b: {x: e.x + w, y: e.y + h},
            });
            segments.push({
                a: {x: e.x + w, y: e.y + h},
                b: {x: e.x - w, y: e.y + h},
            });
            segments.push({
                a: {x: e.x - w, y: e.y + h},
                b: {x: e.x - w, y: e.y - h},
            });
        });

        //Add screen bounds
        var w = game.screen.width;
        var h = game.screen.height;
        var c = new Point(game.camera);
        [
            [0, 0, w, 0],
            [w, 0, w, h],
            [w, h, 0, h],
            [0, h, 0, 0],
        ].forEach(function(offset) {
            var ca = c.clone().add(new Point(offset[0], offset[1])).toWorld();
            var cb = c.clone().add(new Point(offset[2], offset[3])).toWorld();
            segments.push({a: ca, b: cb});
        })

        //draw segments
        // ctx.strokeStyle = "#3838dd";
        // segments.forEach(function(seg) {
        //     var a = new Point(seg.a.x,seg.a.y).toScreen();
        //     var b = new Point(seg.b.x,seg.b.y).toScreen();
	//     ctx.beginPath();
	//     ctx.moveTo(a.x, a.y);
	//     ctx.lineTo(b.x, b.y);
	//     ctx.stroke();
        // })

	// Get all unique points
	var points = (function(segments){
	    var a = [];
	    segments.forEach(function(seg){
		a.push(seg.a,seg.b);
	    });
	    return a;
	})(segments);
	var uniquePoints = (function(points){
	    var set = {};
	    return points.filter(function(p){
		var key = p.x+","+p.y;
		if(key in set){
		    return false;
		}else{
		    set[key]=true;
		    return true;
		}
	    });
	})(points);

	// Get all angles
	var uniqueAngles = [];
	for(var j=0;j<uniquePoints.length;j++){
	    var uniquePoint = uniquePoints[j];
	    var angle = Math.atan2(uniquePoint.y-game.player.y,uniquePoint.x-game.player.x);
	    uniquePoint.angle = angle;
	    uniqueAngles.push(angle-0.00001,angle,angle+0.00001);
	}

	// RAYS IN ALL DIRECTIONS
	var intersects = [];
	for(var j=0;j<uniqueAngles.length;j++){
	    var angle = uniqueAngles[j];

	    // Calculate dx & dy from angle
	    var dx = Math.cos(angle);
	    var dy = Math.sin(angle);

	    var ray = {
		a: game.player,
		b:{x:game.player.x+dx,y:game.player.y+dy}
	    };

	    // Find CLOSEST intersection
	    var closestIntersect = null;
	    for(var i=0;i<segments.length;i++){
		var intersect = util.getIntersection(ray,segments[i]);
		if(!intersect) continue;
		if(!closestIntersect || intersect.param<closestIntersect.param){
		    closestIntersect=intersect;
		}
	    }
	    // Intersect angle
	    if(!closestIntersect)
                continue;
	    closestIntersect.angle = angle;

	    // Add to list of intersects
	    intersects.push(closestIntersect);
	}

        // Sort intersects by angle
	intersects = intersects.sort(function(a,b){
	    return a.angle-b.angle;
	});

        var pp = new Point(game.player.x, game.player.y).toScreen();
        ctx.fillStyle = "#000";
        ctx.globalCompositeOperation = "destination-out";
        ctx.beginPath();

        var first = new Point(intersects.pop()).toScreen();
        ctx.moveTo(first.x, first.y);
        intersects.forEach(function(intersect) {
            var pi = new Point(intersect).toScreen();
            ctx.lineTo(pi.x, pi.y);
        });
        ctx.fill();
        game.ctx.drawImage(canvas, game.camera.x, game.camera.y);
    }

    this.draw = function() {

        var w = game.screen.width;
        var h = game.screen.height;

        var x = game.camera.x;
        var y = game.camera.y;

        var loc = game.player.Location;
        if (Math.abs(this.location.x - loc.X) > w || Math.abs(this.location.y - loc.Y) > h) {
            game.ctx.fillStyle = "#000";
            game.ctx.fillRect(x, y, w, h);
            var txt = "Loading...";
            var dx = (w - game.ctx.measureText(txt).width) / 2;
            game.ctx.fillStyle = "#fff";
            game.drawStrokedText(txt, x + dx, y + 200);
            return;
        }
        var mp = this.location.clone().toScreen();
        var sx = (x - mp.x) + this.width;
        var sy = (y - mp.y);

        // if (sx < 0) {
        //     x -= sx;
        //     // sx = 0;
        // }
        // if (sy < 0) {
        //     y -= sy;
        //     // sy = 0;
        // }


        var canvas = this.buffers[this.buffer];
        canvas.style.left = -sx + "px";
        canvas.style.top = -sy + "px";

        if (this.blit) {
            util.dom.hide(this.buffers[1-this.buffer]);
            util.dom.show(this.buffers[this.buffer]);
            this.blit = false;
        }

        if(game.debug.map.position) {
            var text = "(" + (x + game.camera.x) + " " + (y + game.camera.y) + ")";
            game.ctx.fillStyle = "#fff";

            game.drawStrokedText(text, x, y + FONT_SIZE);
        }

        game.debug.map.grid && this.drawGrid();

        this.updateObjects();
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
    }

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
        })
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
        this.simpleDarkness = loader.loadImage("map/simple-darkness.png")
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
        return this.bioms[this.getCell(x, y).id];
    }
}
