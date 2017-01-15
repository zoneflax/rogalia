/* global BBox */

"use strict";

class Quadtree extends BBox {
    constructor(x, y, width, height, lvl = 0) {
        super(x, y, width, height);
        this.lvl = lvl;
        this.nodes = [];
        this.objects = [];
    }

    insert(object) {
        let index = this._findIndex(object);
        if (index != -1) {
            this.nodes[index].insert(object);
            return;
        }

        this.objects.push(object);
        if (this._splitRequired()) {
            this._split();
        }
    }

    remove(object) {
        let index = this._findIndex(object);
        if (index != -1) {
            this.nodes[index].remove(object);
            return;
        }

        this.objects = this.objects.filter(x => x != object);
    }

    find(bbox, filter) {
        if (!this.intersects(bbox)) {
            return false;
        }
        for (let i = 0; i < this.objects.length; i++) {
            let object = this.objects[i];
            if (object.bbox().intersects(bbox) && filter(object)) {
                return true;
            }
        }
        for (let i = 0; i < this.nodes.length; i++) {
            let node = this.nodes[i];
            if (node.find(bbox, filter)) {
                return true;
            }
        }
        return false;
    }

    get length() {
        let length = 0;
        this.traverse(x => length++);
        return length;
    }

    traverse(callback) {
        for (let i = 0; i < this.nodes.length; i++) {
            this.nodes[i].traverse(callback);
        }
        for (let i = 0; i < this.objects.length; i++) {
            callback(this.objects[i]);
        }
    }

    _splitRequired() {
        return this.objects.length > Quadtree.MAX_OBJECTS &&
            this.lvl < Quadtree.MAX_LEVELS &&
            !this._hasNodes();
    }

    _split() {
        let lvl = this.lvl + 1;
        let width = this.width / 2;
        let height = this.height / 2;
        this.nodes[0] = makeNode(this.x, this.y);
        this.nodes[1] = makeNode(this.x + width, this.y);
        this.nodes[2] = makeNode(this.x, this.y + height);
        this.nodes[3] = makeNode(this.x + width, this.y + height);

        let objects = this.objects;
        this.objects = [];
        for (let i = 0; i < objects.length; i++) {
            let object = objects[i];
            let index = this._findIndex(object);
            if (index != -1) {
                this.nodes[index].insert(object);
            } else {
                this.objects.push(object);
            }
        }

        function makeNode(x, y) {
            return new Quadtree(x, y, width, height, lvl);
        }
    }

    _findIndex(object) {
        let bbox = object.bbox();
        for (let i = 0; i < this.nodes.length; i++) {
            if (this.nodes[i].contains(bbox)) {
                return i;
            }
        }
        return -1;
    }

    _hasNodes() {
        return this.nodes.length > 0;
    }

};

Quadtree.MAX_OBJECTS = 8;
Quadtree.MAX_LEVELS = 8;
