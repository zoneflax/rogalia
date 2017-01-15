"use strict";

class BBox {
    constructor(x, y, width, height) {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
    }

    contains(bbox) {
        return this.x <= bbox.x &&
		    this.y <= bbox.y &&
		    this.x+this.width >= bbox.x+bbox.width &&
		    this.y+this.height >= bbox.y+bbox.height;
    }

    intersects(bbox)  {
	    return this.x < bbox.x+bbox.width &&
            this.y < bbox.y+bbox.height &&
		    this.x+this.width > bbox.x &&
            this.y+this.height > bbox.y;
    }

    static centeredAtPoint(p, width, height) {
        return new BBox(p.x - width/2, p.y - height/2, width, height);
    }
}
