// code adapted from https://github.com/mezzoblue/PaintbrushJS/

function ImageFilter(image) {
    this.image = image;
}
ImageFilter.prototype = {
    tint: function(params) {
        var buffer = document.createElement("canvas");
	var c = buffer.getContext('2d');

        c.width = buffer.width = this.image.width;
	c.height = buffer.height = this.image.height;

        var pixels = initializeBuffer(c, this.image);
	if (!pixels) {
            console.warn("Cannot apply tint");
            return this.image;
        }
        // we need to figure out RGB values for tint, let's do that ahead and not waste time in the loop
	var src  = parseInt(createColor(params.tintColor), 16);
	var dest = {r: ((src & 0xFF0000) >> 16), g: ((src & 0x00FF00) >> 8), b: (src & 0x0000FF)};
        // the main loop through every pixel to apply the simpler effects
	// (data is per-byte, and there are 4 bytes per pixel, so lets only loop through each pixel and save a few cycles)
	for (var i = 0, data = pixels.data, length = data.length; i < length >> 2; i++) {
	    var index = i << 2;

	    // get each colour value of current pixel
	    var thisPixel = {r: data[index], g: data[index + 1], b: data[index + 2]};

	    // the biggie: if we're here, let's get some filter action happening
	    pixels = applyFilters("filter-tint", params, this.image, pixels, index, thisPixel, dest);
	}

        // redraw the pixel data back to the working buffer
        c.putImageData(pixels, 0, 0);

        return buffer;

        function initializeBuffer(c, img) {
	    // clean up the buffer between iterations
	    c.clearRect(0, 0, c.width, c.height);
	    // make sure we're drawing something
	    if (img.width > 0 && img.height > 0) {

	        // console.log(img.width, img.height, c.width, c.height);

	        try {
		    // draw the image to buffer and load its pixels into an array
		    //   (remove the last two arguments on this function if you choose not to
		    //    respect width/height attributes and want the original image dimensions instead)
		    c.drawImage(img, 0, 0, img.width , img.height);
		    return(c.getImageData(0, 0, c.width, c.height));

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

        }
        // the function that actually manipulates the pixels
        function applyFilters(filterType, params, img, pixels, index, thisPixel, dest) {

	    // speed up access
	    var data = pixels.data, val;
	    var imgWidth = img.width;

	    // figure out which filter to apply, and do it
	    switch(filterType) {

	    case "filter-greyscale":
	        val = (thisPixel.r * 0.21) + (thisPixel.g * 0.71) + (thisPixel.b * 0.07);
	        data = setRGB(data, index,
			      findColorDifference(params.greyscaleOpacity, val, thisPixel.r),
			      findColorDifference(params.greyscaleOpacity, val, thisPixel.g),
			      findColorDifference(params.greyscaleOpacity, val, thisPixel.b));
	        break;

	    case "filter-mosaic":
	        // a bit more verbose to reduce amount of math necessary
	        var pos = index >> 2;
	        var stepY = Math.floor(pos / imgWidth);
	        var stepY1 = stepY % params.mosaicSize;
	        var stepX = pos - (stepY * imgWidth);
	        var stepX1 = stepX % params.mosaicSize;

	        if (stepY1) pos -= stepY1 * imgWidth;
	        if (stepX1) pos -= stepX1;
	        pos = pos << 2;

	        data = setRGB(data, index,
			      findColorDifference(params.mosaicOpacity, data[pos], thisPixel.r),
			      findColorDifference(params.mosaicOpacity, data[pos + 1], thisPixel.g),
			      findColorDifference(params.mosaicOpacity, data[pos + 2], thisPixel.b));
	        break;

	    case "filter-noise":
	        val = noise(params.noiseAmount);

	        if ((params.noiseType == "mono") || (params.noiseType == "monochrome")) {
		    data = setRGB(data, index,
			          checkRGBBoundary(thisPixel.r + val),
			          checkRGBBoundary(thisPixel.g + val),
			          checkRGBBoundary(thisPixel.b + val));
	        } else {
		    data = setRGB(data, index,
			          checkRGBBoundary(thisPixel.r + noise(params.noiseAmount)),
			          checkRGBBoundary(thisPixel.g + noise(params.noiseAmount)),
			          checkRGBBoundary(thisPixel.b + noise(params.noiseAmount)));
	        }
	        break;

	    case "filter-posterize":
	        data = setRGB(data, index,
			      findColorDifference(params.posterizeOpacity, parseInt(params.posterizeValues * parseInt(thisPixel.r / params.posterizeAreas)), thisPixel.r),
			      findColorDifference(params.posterizeOpacity, parseInt(params.posterizeValues * parseInt(thisPixel.g / params.posterizeAreas)), thisPixel.g),
			      findColorDifference(params.posterizeOpacity, parseInt(params.posterizeValues * parseInt(thisPixel.b / params.posterizeAreas)), thisPixel.b));
	        break;

	    case "filter-sepia":
	        data = setRGB(data, index,
			      findColorDifference(params.sepiaOpacity, (thisPixel.r * 0.393) + (thisPixel.g * 0.769) + (thisPixel.b * 0.189), thisPixel.r),
			      findColorDifference(params.sepiaOpacity, (thisPixel.r * 0.349) + (thisPixel.g * 0.686) + (thisPixel.b * 0.168), thisPixel.g),
			      findColorDifference(params.sepiaOpacity, (thisPixel.r * 0.272) + (thisPixel.g * 0.534) + (thisPixel.b * 0.131), thisPixel.b));
	        break;

	    case "filter-tint":
	        data = setRGB(data, index,
			      findColorDifference(params.tintOpacity, dest.r, thisPixel.r),
			      findColorDifference(params.tintOpacity, dest.g, thisPixel.g),
			      findColorDifference(params.tintOpacity, dest.b, thisPixel.b));
	        break;


	    }
	    return(pixels);
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
