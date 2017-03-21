/* global onmessage, postMessage */

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
    this.layers = bioms.map(() => []);

    const colorMap = bioms.reduce(function(map, biom, index) {
        map[biom.Color] = [biom, index];
        return map;
    }, {});

    this.data = new Array(cells_y * cells_x);
    for (let y = 0; y < cells_y; y++) {
        for (let x = 0; x < cells_x; x++) {
            const color = data[y * cells_x + x];
            const [biom, id] = colorMap[color];
            if (!biom) {
                throw new Error("Unknown biom color: " + color);
            }
	        this.data[y*cells_x + x] = {id, corners: 0};
        }
    }

    for (let y = 0; y < cells_y; y++) {
        for (let x = 0; x < cells_x; x++) {
            const index = y*cells_x + x;
            const cell = this.data[index];
            const {id} = cell;
            for (let c = 0; c < 4; c++) {
                let offset = 0;
                const cx = 1 - (c & 0x1);
                const cy = 1 - ((c >> 1) & 0x1);
                for (let i = 0; i < 4; i++) {
                    const dx = x + cx - (i & 0x1);
                    const dy = y + cy - ((i >> 1) & 0x1);
                    if (dx < 0 || dy < 0 || dx >= cells_x || dy >= cells_y) {
                        continue;
                    }
                    const neighbor = this.data[dy * cells_x + dx];
                    const other = neighbor.id;
                    if (other >= id) {
                        offset |= 1 << i;
                    }
                    if (other != id) {
                        cell.corners |= 1 << (4-c + 0x4*5); // transition flags
                    }
                }
                cell.corners |= offset << (4*c);
            }
            this.layers[id].push(index);
        }
    }
}
