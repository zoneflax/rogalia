"use strict";

onmessage = function (e) {
    var data = e.data;
    var parser = new Parser(
        data.pixels,
        data.bioms,
        data.cells_x,
        data.cells_y
    );
    postMessage({
        data: parser.data,
        layers: parser.layers,
    });
};

function Parser(data, bioms, cells_x, cells_y) {
    this.layers = bioms.map(function() {
        return [];
    });

    var colorMap = bioms.reduce(function(map, biom, index) {
        map[biom.Color] = [biom, index];
        return map;
    }, {});

    this.data = new Array(cells_y);
    for(var y = 0; y < cells_y; y++) {
        this.data[y] = new Array(cells_x);
        for(var x = 0; x < cells_x; x++) {
            var color = data[y * cells_x + x];
            var [biom, index] = colorMap[color];
            if (!biom) {
                throw new Error("Unknown biom color: " + color);
            }
	        this.data[y][x] = {
                x: x,
                y: y,
                id: index,
                corners: new Array(4),
                transition: new Array(4),
                biom: biom,
            };
        }
    }

    for(var y = 0; y < cells_y; y++) {
        for(var x = 0; x < cells_x; x++) {
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
                        this.data[y][x].transition[4-c] = true;
                }
                this.data[y][x].corners[c] = offset;
            }
            this.layers[id].push(this.data[y][x]);
        }
    }
}
