"use strict";

onmessage = function (e) {
    var data = e.data;
    var parser = new Parser(
        parseData(data.pixels, data.bioms),
        data.bioms,
        data.cells_x,
        data.cells_y
    );
    postMessage({
        data: parser.data,
        layers: parser.layers,
    });
};

function parseData(pixels, bioms) {
    var data = [];
    var i = 0;
    var color = 0;
    bioms = bioms.map(function(biom) {
        return biom.Color;
    });

    [].forEach.call(pixels, function(colorComponent, px) {
        if (i < 3) {
            color |=  colorComponent << ((2 - i) * 8);
            i++;
        } else {
            var id = bioms.indexOf(color);
            if (id == -1) {
                postMessage({error: "Cannot find biom for px " + px + " " + color});
                return;
            }
            data.push(id);
            color = 0;
            i = 0;
        }
    });
    return data;
}

function Parser(data, bioms, cells_x, cells_y) {
    this.data = [];
    for(var h = 0; h < cells_y; h++) {
        this.data.push([]);
        for(var w = 0; w < cells_x; w++) {
            var id = data[h * cells_x + w];
            var biom = bioms[id];
	        this.data[h].push({
                x: w,
                y: h,
                id: id,
                corners: new Array(4),
                transition: new Array(4),
                biom: biom,
            });
        }
    }

    this.layers = bioms.map(function() {
        return [];
    });

    for(var y = 0; y < cells_y; y++) {
        for(var x = 0; x < cells_x; x++) {
            id = this.data[y][x].id;
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
