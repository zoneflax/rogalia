"use strict";
// code adapted from https://github.com/mezzoblue/PaintbrushJS/

var ImageFilter = new function() {
    function initializeBuffer(c, img) {
        // make sure we're drawing something
        if (img.width == 0 || img.height == 0)
            return null;
        try {
            c.drawImage(img, 0, 0);
            return c.getImageData(0, 0, c.width, c.height);

        } catch(err) {
            // it's kinda strange, I'm explicitly checking for width/height above, but some attempts
            // throw an INDEX_SIZE_ERR as if I'm trying to draw a 0x0 or negative image, as per
            // http://www.whatwg.org/specs/web-apps/current-work/multipage/the-canvas-element.html#images
            //
            // AND YET, if I simply catch the exception, the filters render anyway and all is well.
            // there must be a reason for this, I just don't know what it is yet.
            //
            // console.log("exception: " + err);
        }
    }
    function createColor(src) {
        // strip the leading #, if it exists
        src = src.replace(/^#/, '');
        // if it's shorthand, expand the values
        if (src.length == 3) {
            src = src.replace(/(.)/g, '$1$1');
        }
        return(src);
    }
    // find a specified distance between two colours
    function findColorDifference(dif, dest, src) {
        return(dif * dest + (1 - dif) * src);
    }

    this.applyTint = function(pixels, color, opacity) {
        var src  = parseInt(createColor(color), 16);
        var r = ((src & 0xFF0000) >> 16);
        var g = ((src & 0x00FF00) >> 8);
        var b = (src & 0x0000FF);
        var data = pixels.data;
        var length = data.length >> 2;
        for (var i = 0; i < length; i++) {
            var index = i << 2;
            data[index] = findColorDifference(opacity, r, data[index]);
            data[index + 1] = findColorDifference(opacity, g, data[index + 1]);
            data[index + 2] = findColorDifference(opacity, b, data[index + 2]);
        }
        return pixels;
    };

    this.tint = function(image, color, opacity) {
        var buffer = document.createElement("canvas");
        var c = buffer.getContext('2d');
        c.width = buffer.width = image.width;
        c.height = buffer.height = image.height;

        var pixels = initializeBuffer(c, image);
        if (!pixels) {
            console.warn("Cannot apply tint");
            return image;
        }

        // redraw the pixel data back to the working buffer
        c.putImageData(this.applyTint(pixels, color, opacity), 0, 0);

        return buffer;
    };
};
