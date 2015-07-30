"use strict";
// code adapted from https://github.com/mezzoblue/PaintbrushJS/

var ImageFilter = {
    tint: function(image, color, opacity) {
        var buffer = document.createElement("canvas");
	var c = buffer.getContext('2d');
        c.width = buffer.width = image.width;
	c.height = buffer.height = image.height;

        var pixels = initializeBuffer(c, image);
	if (!pixels) {
            console.warn("Cannot apply tint");
            return image;
        }
        // we need to figure out RGB values for tint, let's do that ahead and not waste time in the loop
	var src  = parseInt(createColor(color), 16);
	var dest = {r: ((src & 0xFF0000) >> 16), g: ((src & 0x00FF00) >> 8), b: (src & 0x0000FF)};
        // the main loop through every pixel to apply the simpler effects
	// (data is per-byte, and there are 4 bytes per pixel, so lets only loop through each pixel and save a few cycles)
	for (var i = 0, data = pixels.data, length = data.length; i < length >> 2; i++) {
	    var index = i << 2;

	    // get each colour value of current pixel
	    var thisPixel = {r: data[index], g: data[index + 1], b: data[index + 2]};
	    pixels = applyTint(opacity, pixels, index, thisPixel, dest);
	}

        // redraw the pixel data back to the working buffer
        c.putImageData(pixels, 0, 0);

        return buffer;

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
        // the function that actually manipulates the pixels
        function applyTint(opacity, pixels, index, thisPixel, dest) {
	    pixels.data = setRGB(data, index,
			  findColorDifference(opacity, dest.r, thisPixel.r),
			  findColorDifference(opacity, dest.g, thisPixel.g),
			  findColorDifference(opacity, dest.b, thisPixel.b));
	    return pixels;
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
        // throw three new RGB values into the pixels object at a specific spot
        function setRGB(data, index, r, g, b) {
	    data[index] = r;
	    data[index + 1] = g;
	    data[index + 2] = b;
	    return data;
        }
        // find a specified distance between two colours
        function findColorDifference(dif, dest, src) {
	    return(dif * dest + (1 - dif) * src);
        }
    }
};
